import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/server-auth";
import { isWebPushConfigured, sendWebPush } from "@/lib/notifications/webPush";
import { insertProductUpdate } from "@/lib/notifications/updatesFeed";
import { formatCurrency } from "@/lib/currency";
import { deriveReminderCandidates, nextReviewDue, type ReminderCandidate } from "@/products/personal-finance-companion/reminders/deriveReminders";
import { diffReminders, type ExistingReminderSummary } from "@/products/personal-finance-companion/reminders/diffReminders";
import { partitionByEntitlement } from "@/products/personal-finance-companion/reminders/entitlementFilter";
import { resolveEligibility } from "@/products/personal-finance-companion/reminders/eligibility";
import { buildPushPayloads, type EnrichedReminder } from "@/products/personal-finance-companion/reminders/aggregate";
import { reminderDeepLink } from "@/products/personal-finance-companion/reminders/copy";
import { validateNotificationPreferences } from "@/products/personal-finance-companion/notificationPreferences";
import type { PersonalFinanceCompanionReminderKind } from "@/products/personal-finance-companion/reminders";
import type { Account, Bill, Debt, FinancialArea, IncomeSource, Subscription } from "@/products/personal-finance-companion/state";
import type { FinancialPictureInputs } from "@/products/personal-finance-companion/companion/capability";

/**
 * The server-side reminder evaluator (Stage F §10). Vercel Cron calls
 * this on the schedule in vercel.json — that schedule is only a SERVER
 * EVALUATION TRIGGER, never "all users are notified at this UTC time"; the
 * per-user quiet-hours check (eligibility.ts, using each instance's own
 * IANA timezone) is what actually gates delivery time. Uses the
 * service-role client deliberately (a cron job has no user session to
 * scope RLS against) — every read/write below is scoped by explicit
 * product_instance_id/user_id filters in code, since RLS itself is
 * bypassed for this client by design.
 *
 * Idempotent by construction: pfc_notification_deliveries has a unique
 * (user_id, dedupe_key) constraint, and this route claims that key via an
 * ignoreDuplicates upsert before attempting to send — a concurrent or
 * retried cron execution gets zero rows back from that upsert and skips,
 * never sending twice.
 */

interface AccountRow {
  id: string; name: string; type: string; current_balance_minor: number; currency: string; available_for_spending: boolean;
  balance_as_of_date: string; notes: string | null; status: string; needs_review_reason: string | null; source: string;
  import_session_id: string | null; created_at: string; updated_at: string;
}
interface IncomeSourceRow {
  id: string; name: string; amount_minor: number | null; amount_range_min_minor: number | null; amount_range_max_minor: number | null;
  frequency: string; next_expected_date: string | null; confidence: string; gross_or_net: string; currency: string; status: string;
  needs_review_reason: string | null; source: string; import_session_id: string | null; created_at: string; updated_at: string;
}
interface BillRow {
  id: string; name: string; category: string; amount_minor: number | null; amount_range_min_minor: number | null; amount_range_max_minor: number | null;
  is_variable: boolean; due_rule: Record<string, unknown> | null; frequency: string; essential: boolean; funded: boolean; currency: string;
  status: string; needs_review_reason: string | null; source: string; import_session_id: string | null; created_at: string; updated_at: string;
}
interface SubscriptionRow {
  id: string; name: string; amount_minor: number | null; frequency: string; renewal_date: string | null; decision: string; currency: string;
  status: string; needs_review_reason: string | null; source: string; import_session_id: string | null; created_at: string; updated_at: string;
}
interface DebtRow {
  id: string; name: string; type: string; balance_minor: number; currency: string; interest_rate: number | null; minimum_payment_minor: number;
  due_date: string | null; promotional_rate: number | null; promotional_expiry: string | null; balance_as_of_date: string; linked_account_id: string | null; status: string;
  needs_review_reason: string | null; source: string; import_session_id: string | null; created_at: string; updated_at: string;
}

function mapAccount(r: AccountRow): Account {
  return {
    id: r.id, name: r.name, type: r.type as Account["type"], currentBalanceMinorUnits: r.current_balance_minor, currency: r.currency,
    availableForSpending: r.available_for_spending, balanceAsOfDate: r.balance_as_of_date, notes: r.notes, status: r.status as Account["status"],
    needsReviewReason: r.needs_review_reason, source: r.source as Account["source"], importSessionId: r.import_session_id, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapIncome(r: IncomeSourceRow): IncomeSource {
  return {
    id: r.id, name: r.name, amountMinorUnits: r.amount_minor,
    amountRangeMinorUnits: r.amount_range_min_minor !== null && r.amount_range_max_minor !== null ? { min: r.amount_range_min_minor, max: r.amount_range_max_minor } : null,
    frequency: r.frequency as IncomeSource["frequency"], nextExpectedDate: r.next_expected_date, confidence: r.confidence as IncomeSource["confidence"],
    grossOrNet: r.gross_or_net as IncomeSource["grossOrNet"], currency: r.currency, status: r.status as IncomeSource["status"], needsReviewReason: r.needs_review_reason,
    source: r.source as IncomeSource["source"], importSessionId: r.import_session_id, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapBill(r: BillRow): Bill {
  const dueRule = r.due_rule && Object.keys(r.due_rule).length > 0 ? (r.due_rule as Bill["dueRule"]) : null;
  return {
    id: r.id, name: r.name, category: r.category, amountMinorUnits: r.amount_minor,
    amountRangeMinorUnits: r.amount_range_min_minor !== null && r.amount_range_max_minor !== null ? { min: r.amount_range_min_minor, max: r.amount_range_max_minor } : null,
    isVariable: r.is_variable, dueRule, frequency: r.frequency as Bill["frequency"], essential: r.essential, funded: r.funded, currency: r.currency,
    status: r.status as Bill["status"], needsReviewReason: r.needs_review_reason, source: r.source as Bill["source"], importSessionId: r.import_session_id,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapSubscription(r: SubscriptionRow): Subscription {
  return {
    id: r.id, name: r.name, amountMinorUnits: r.amount_minor, frequency: r.frequency as Subscription["frequency"], renewalDate: r.renewal_date,
    decision: r.decision as Subscription["decision"], currency: r.currency, status: r.status as Subscription["status"], needsReviewReason: r.needs_review_reason,
    source: r.source as Subscription["source"], importSessionId: r.import_session_id, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
function mapDebt(r: DebtRow): Debt {
  return {
    id: r.id, name: r.name, type: r.type as Debt["type"], balanceMinorUnits: r.balance_minor, currency: r.currency, interestRate: r.interest_rate,
    minimumPaymentMinorUnits: r.minimum_payment_minor, dueDate: r.due_date, promotionalRate: r.promotional_rate, promotionalExpiry: r.promotional_expiry,
    balanceAsOfDate: r.balance_as_of_date, linkedAccountId: r.linked_account_id ?? null, status: r.status as Debt["status"], needsReviewReason: r.needs_review_reason, source: r.source as Debt["source"],
    importSessionId: r.import_session_id, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function entityContext(entityType: string | null, entityId: string | null) {
  if (!entityType || !entityId) return {};
  switch (entityType as FinancialArea) {
    case "bills":
      return { billId: entityId };
    case "income":
      return { incomeSourceId: entityId };
    case "accounts":
      return { accountId: entityId };
    case "subscriptions":
      return { subscriptionId: entityId };
    case "debt":
      return { debtId: entityId };
    default:
      return {};
  }
}

function resolveEntityDisplay(
  kind: PersonalFinanceCompanionReminderKind,
  entityType: string | null,
  entityId: string | null,
  picture: FinancialPictureInputs
): { name: string | null; detail: string | null; amount: string | null } {
  if (!entityType || !entityId) return { name: null, detail: null, amount: null };
  if (entityType === "bills") {
    const bill = picture.bills.find((b) => b.id === entityId);
    if (!bill) return { name: null, detail: null, amount: null };
    return { name: bill.name, detail: null, amount: bill.amountMinorUnits !== null ? formatCurrency(bill.amountMinorUnits, bill.currency) : null };
  }
  if (entityType === "subscriptions") {
    const sub = picture.subscriptions.find((s) => s.id === entityId);
    if (!sub) return { name: null, detail: null, amount: null };
    return { name: sub.name, detail: sub.renewalDate, amount: sub.amountMinorUnits !== null ? formatCurrency(sub.amountMinorUnits, sub.currency) : null };
  }
  if (entityType === "debt") {
    const debt = picture.debts.find((d) => d.id === entityId);
    if (!debt) return { name: null, detail: null, amount: null };
    const amount = kind === "promotionalRateExpiry" ? null : formatCurrency(debt.minimumPaymentMinorUnits, debt.currency);
    return { name: debt.name, detail: kind === "promotionalRateExpiry" ? debt.promotionalExpiry : debt.dueDate, amount };
  }
  if (entityType === "accounts") {
    const account = picture.accounts.find((a) => a.id === entityId);
    return { name: account?.name ?? null, detail: null, amount: null };
  }
  if (entityType === "income") {
    const income = picture.incomeSources.find((i) => i.id === entityId);
    return { name: income?.name ?? null, detail: income?.nextExpectedDate ?? null, amount: null };
  }
  return { name: null, detail: null, amount: null };
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      note: "SUPABASE_SERVICE_ROLE_KEY is not set in this environment. The evaluator cannot query reminders across users without it — see .env.example.",
    });
  }
  if (!isWebPushConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      note: "Web Push isn't configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT missing). The evaluator cannot send anything without them — see .env.example.",
    });
  }

  const now = new Date();
  const summary = {
    instancesEvaluated: 0,
    instancesSkippedNotEntitled: 0,
    remindersInserted: 0,
    remindersCancelled: 0,
    deliveriesSent: 0,
    deliveriesSkipped: 0,
    deliveriesFailed: 0,
  };

  const { data: prefRows, error: prefError } = await supabase
    .from("pfc_notification_preferences")
    .select("product_instance_id, user_id, categories, privacy_level, review_rhythm, timezone");
  if (prefError) return NextResponse.json({ ok: false, error: prefError.message }, { status: 500 });

  // Entitlement must be checked explicitly here — this client uses the
  // service-role key, which bypasses RLS entirely, so nothing else in this
  // route naturally stops evaluating (and sending to) a user whose PFC
  // entitlement has since been revoked. A preference row and a product
  // instance can both still exist after revocation (neither is deleted by
  // revoke_entitlement); only this check keeps delivery honest.
  const { data: entitlementRows, error: entitlementError } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("product_slug", "personal-finance-companion")
    .eq("is_active", true)
    .is("revoked_at", null);
  if (entitlementError) return NextResponse.json({ ok: false, error: entitlementError.message }, { status: 500 });
  const entitledUserIds = new Set((entitlementRows ?? []).map((r) => r.user_id as string));
  const { entitled: entitledPrefRows, skippedCount } = partitionByEntitlement(
    (prefRows ?? []).map((row) => ({ ...row, userId: row.user_id as string })),
    entitledUserIds
  );
  summary.instancesSkippedNotEntitled = skippedCount;

  for (const prefRow of entitledPrefRows) {
    const instanceId = prefRow.product_instance_id as string;
    const userId = prefRow.user_id as string;
    summary.instancesEvaluated += 1;
    const preferences = validateNotificationPreferences({
      categories: prefRow.categories,
      privacyLevel: prefRow.privacy_level,
      reviewRhythm: prefRow.review_rhythm,
      timezone: prefRow.timezone,
    });

    const [accountsRes, incomeRes, billsRes, subsRes, debtsRes, instanceRes, unreviewedRes] = await Promise.all([
      supabase.from("pfc_accounts").select("*").eq("product_instance_id", instanceId),
      supabase.from("pfc_income_sources").select("*").eq("product_instance_id", instanceId),
      supabase.from("pfc_bills").select("*").eq("product_instance_id", instanceId),
      supabase.from("pfc_subscriptions").select("*").eq("product_instance_id", instanceId),
      supabase.from("pfc_debts").select("*").eq("product_instance_id", instanceId),
      supabase.from("product_instances").select("created_at").eq("id", instanceId).maybeSingle(),
      supabase.from("pfc_extraction_candidates").select("id", { count: "exact", head: true }).eq("product_instance_id", instanceId).eq("review_status", "unreviewed"),
    ]);

    // Transactions/savingsGoals are intentionally empty here — no reminder
    // kind currently derives from them (see deriveReminders.ts's module comment).
    const picture: FinancialPictureInputs = {
      accounts: ((accountsRes.data as AccountRow[]) ?? []).map(mapAccount),
      incomeSources: ((incomeRes.data as IncomeSourceRow[]) ?? []).map(mapIncome),
      bills: ((billsRes.data as BillRow[]) ?? []).map(mapBill),
      subscriptions: ((subsRes.data as SubscriptionRow[]) ?? []).map(mapSubscription),
      transactions: [],
      debts: ((debtsRes.data as DebtRow[]) ?? []).map(mapDebt),
      savingsGoals: [],
    };

    const candidates: ReminderCandidate[] = deriveReminderCandidates(picture, now);

    if (preferences.reviewRhythm !== "off" && instanceRes.data?.created_at) {
      const nextDue = nextReviewDue(preferences.reviewRhythm, new Date(instanceRes.data.created_at as string), now);
      candidates.push({
        kind: "weeklyReviewDue",
        entityType: null,
        entityId: null,
        dedupeKey: `weeklyReviewDue:none:none:${nextDue.toISOString().slice(0, 10)}`,
        schedule: { kind: "onDate", date: nextDue.toISOString().slice(0, 10) },
        nextEligibleAt: nextDue,
      });
    }

    if ((unreviewedRes.count ?? 0) > 0) {
      candidates.push({
        kind: "importNeedsReview",
        entityType: null,
        entityId: null,
        dedupeKey: "importNeedsReview:none:none",
        schedule: { kind: "onDate", date: now.toISOString().slice(0, 10) },
        nextEligibleAt: now,
      });
    }

    const { data: existingRows } = await supabase.from("pfc_reminders").select("id, dedupe_key, status, source").eq("product_instance_id", instanceId);
    const existing: ExistingReminderSummary[] = (existingRows ?? []).map((r) => ({
      id: r.id as string,
      dedupeKey: r.dedupe_key as string,
      status: r.status as ExistingReminderSummary["status"],
      source: r.source as ExistingReminderSummary["source"],
    }));

    const { toInsert, toCancelIds } = diffReminders(candidates, existing);

    if (toInsert.length > 0) {
      await supabase.from("pfc_reminders").insert(
        toInsert.map((c) => ({
          user_id: userId,
          product_instance_id: instanceId,
          entity_type: c.entityType,
          entity_id: c.entityId,
          kind: c.kind,
          source: "system",
          schedule: c.schedule,
          dedupe_key: c.dedupeKey,
          status: "scheduled",
          next_eligible_at: c.nextEligibleAt.toISOString(),
        }))
      );
      summary.remindersInserted += toInsert.length;
    }
    if (toCancelIds.length > 0) {
      await supabase.from("pfc_reminders").update({ status: "cancelled", cancelled_at: now.toISOString() }).in("id", toCancelIds);
      summary.remindersCancelled += toCancelIds.length;
    }

    const { data: dueRows } = await supabase
      .from("pfc_reminders")
      .select("id, kind, entity_type, entity_id, note, status, snoozed_until, next_eligible_at")
      .eq("product_instance_id", instanceId)
      .or(`and(status.eq.scheduled,next_eligible_at.lte.${now.toISOString()}),and(status.eq.snoozed,snoozed_until.lte.${now.toISOString()})`);

    const eligible: EnrichedReminder[] = [];
    for (const row of dueRows ?? []) {
      const kind = row.kind as PersonalFinanceCompanionReminderKind;
      const eligibility = resolveEligibility(kind, preferences, now);
      if (!eligibility.eligible) {
        summary.deliveriesSkipped += 1;
        continue;
      }
      const { name, detail, amount } = resolveEntityDisplay(kind, row.entity_type, row.entity_id, picture);
      eligible.push({
        reminderId: row.id as string,
        kind,
        name,
        detail,
        amount,
        note: row.note as string | null,
        deepLink: reminderDeepLink(kind, entityContext(row.entity_type as string | null, row.entity_id as string | null)),
      });
    }

    if (eligible.length === 0) continue;

    const payloads = buildPushPayloads(eligible, preferences.privacyLevel, now);

    // Recorded in the in-app Updates feed regardless of push subscription:
    // web push opt-in is genuinely rare (most users never grant browser
    // permission), and the feed's whole point is that "stay updated" stays
    // true even for them. Idempotent by the same dedupe_key push already
    // uses, scoped per-product — see product_updates' own migration.
    for (const payload of payloads) {
      await insertProductUpdate(supabase, {
        userId,
        productSlug: "personal-finance-companion",
        productInstanceId: instanceId,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        dedupeKey: payload.dedupeKey,
      });
    }

    const { data: subs } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth_key").eq("user_id", userId).is("revoked_at", null);
    if (!subs || subs.length === 0) {
      // No device to deliver to yet — leave these reminders scheduled so they're retried once a subscription exists.
      summary.deliveriesSkipped += eligible.length;
      continue;
    }

    for (const payload of payloads) {
      const { data: claimed } = await supabase
        .from("pfc_notification_deliveries")
        .upsert(
          { user_id: userId, reminder_ids: payload.reminderIds, dedupe_key: payload.dedupeKey, outcome: "skipped", delivered_at: now.toISOString() },
          { onConflict: "user_id,dedupe_key", ignoreDuplicates: true }
        )
        .select("id");

      if (!claimed || claimed.length === 0) {
        // Already delivered by this or a concurrent run today.
        summary.deliveriesSkipped += 1;
        continue;
      }
      const deliveryId = claimed[0].id as string;

      let anySent = false;
      for (const sub of subs) {
        const outcome = await sendWebPush(
          { endpoint: sub.endpoint as string, keys: { p256dh: sub.p256dh as string, auth: sub.auth_key as string } },
          { title: payload.title, body: payload.body, url: payload.url }
        );
        if (outcome.outcome === "sent") {
          anySent = true;
          await supabase.from("push_subscriptions").update({ last_success_at: now.toISOString() }).eq("id", sub.id);
        } else if (outcome.outcome === "gone") {
          await supabase.from("push_subscriptions").update({ revoked_at: now.toISOString() }).eq("id", sub.id);
        } else {
          await supabase
            .from("push_subscriptions")
            .update({ last_failure_at: now.toISOString(), failure_count: ((sub as { failure_count?: number }).failure_count ?? 0) + 1 })
            .eq("id", sub.id);
        }
      }

      if (anySent) {
        summary.deliveriesSent += 1;
        await supabase.from("pfc_notification_deliveries").update({ outcome: "sent" }).eq("id", deliveryId);
        await supabase.from("pfc_reminders").update({ status: "delivered" }).in("id", payload.reminderIds);
      } else {
        summary.deliveriesFailed += 1;
        // Total failure: release the claim so the next run retries, rather than waiting a full day.
        await supabase.from("pfc_notification_deliveries").delete().eq("id", deliveryId);
      }
    }
  }

  return NextResponse.json({ ok: true, configured: true, ...summary });
}
