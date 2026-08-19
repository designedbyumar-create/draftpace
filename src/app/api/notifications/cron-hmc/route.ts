import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/server-auth";
import { isWebPushConfigured, sendWebPush } from "@/lib/notifications/webPush";
import { deriveReminderCandidates, type ReminderCandidate } from "@/products/home-management-companion/reminders/deriveReminders";
import { diffReminders, type ExistingReminderSummary } from "@/products/home-management-companion/reminders/diffReminders";
import { partitionByEntitlement } from "@/products/home-management-companion/reminders/entitlementFilter";
import { resolveEligibility } from "@/products/home-management-companion/reminders/eligibility";
import { buildPushPayloads, type EnrichedReminder } from "@/products/home-management-companion/reminders/aggregate";
import { deriveAttentionItems } from "@/products/home-management-companion/attention";
import { validateNotificationPreferences } from "@/products/home-management-companion/notificationPreferences";
import type { HomeManagementCompanionReminderKind } from "@/products/home-management-companion/reminders";
import type { Thing, MaintenanceTask, Problem } from "@/products/home-management-companion/state";

/**
 * Home Base's server-side reminder evaluator - a deliberately separate
 * route from PFC's own /api/notifications/cron, with its own cron secret
 * and its own pg_cron job, so a bug in this evaluator can never touch
 * PFC's working notification pipeline. Mirrors PFC's route structure
 * (service-role client, explicit entitlement re-check, claim-then-send
 * delivery dedup) but with a much smaller derivation, see
 * reminders/deriveReminders.ts's own comment on why there's no separate
 * lead-time scheduling here.
 */

interface ThingRow {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  location: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_expires_at: string | null;
  document_link: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}
interface MaintenanceTaskRow {
  id: string;
  appliance_id: string | null;
  name: string;
  cadence_days: number;
  last_done_at: string | null;
  document_link: string | null;
  notes: string | null;
  snoozed_until: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}
interface ProblemRow {
  id: string;
  thing_id: string | null;
  provider_id: string | null;
  title: string;
  description: string | null;
  resolution_status: string;
  severity: string;
  effort: string;
  estimated_cost_minor: number | null;
  actual_cost_minor: number | null;
  scheduled_at: string | null;
  resolved_at: string | null;
  snoozed_until: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function mapThing(r: ThingRow): Thing {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    brand: r.brand,
    model: r.model,
    location: r.location,
    purchaseDate: r.purchase_date,
    installDate: r.install_date,
    warrantyExpiresAt: r.warranty_expires_at,
    documentLink: r.document_link,
    notes: r.notes,
    status: r.status as Thing["status"],
    needsReviewReason: r.needs_review_reason,
    source: r.source as Thing["source"],
    importSessionId: r.import_session_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function mapMaintenanceTask(r: MaintenanceTaskRow): MaintenanceTask {
  return {
    id: r.id,
    applianceId: r.appliance_id,
    name: r.name,
    cadenceDays: r.cadence_days,
    lastDoneAt: r.last_done_at,
    documentLink: r.document_link,
    notes: r.notes,
    snoozedUntil: r.snoozed_until,
    status: r.status as MaintenanceTask["status"],
    needsReviewReason: r.needs_review_reason,
    source: r.source as MaintenanceTask["source"],
    importSessionId: r.import_session_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function mapProblem(r: ProblemRow): Problem {
  return {
    id: r.id,
    thingId: r.thing_id,
    providerId: r.provider_id,
    title: r.title,
    description: r.description,
    resolutionStatus: r.resolution_status as Problem["resolutionStatus"],
    severity: r.severity as Problem["severity"],
    effort: r.effort as Problem["effort"],
    estimatedCostMinorUnits: r.estimated_cost_minor,
    actualCostMinorUnits: r.actual_cost_minor,
    scheduledAt: r.scheduled_at,
    resolvedAt: r.resolved_at,
    snoozedUntil: r.snoozed_until,
    notes: r.notes,
    status: r.status as Problem["status"],
    needsReviewReason: r.needs_review_reason,
    source: r.source as Problem["source"],
    importSessionId: r.import_session_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.HMC_CRON_SECRET ? `Bearer ${process.env.HMC_CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      note: "SUPABASE_SERVICE_ROLE_KEY is not set in this environment. The evaluator cannot query reminders across users without it.",
    });
  }
  if (!isWebPushConfigured()) {
    return NextResponse.json({
      ok: false,
      configured: false,
      note: "Web Push isn't configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT missing). The evaluator cannot send anything without them.",
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
    .from("hmc_notification_preferences")
    .select("product_instance_id, user_id, categories, privacy_level, timezone");
  if (prefError) return NextResponse.json({ ok: false, error: prefError.message }, { status: 500 });

  // Entitlement must be checked explicitly here, same reasoning as PFC's
  // identical route: the service-role client bypasses RLS entirely, and
  // neither product_instances nor the preference row is deleted on
  // revocation.
  const { data: entitlementRows, error: entitlementError } = await supabase
    .from("entitlements")
    .select("user_id")
    .eq("product_slug", "home-management-companion")
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
      timezone: prefRow.timezone,
    });

    const [thingsRes, tasksRes, problemsRes] = await Promise.all([
      supabase.from("hmc_things").select("*").eq("product_instance_id", instanceId),
      supabase.from("hmc_maintenance_tasks").select("*").eq("product_instance_id", instanceId),
      supabase.from("hmc_problems").select("*").eq("product_instance_id", instanceId),
    ]);

    const things = ((thingsRes.data as ThingRow[]) ?? []).map(mapThing);
    const maintenanceTasks = ((tasksRes.data as MaintenanceTaskRow[]) ?? []).map(mapMaintenanceTask);
    const problems = ((problemsRes.data as ProblemRow[]) ?? []).map(mapProblem);
    const attentionItems = deriveAttentionItems({ things, maintenanceTasks, problems }, now);
    const messageById = new Map(attentionItems.map((item) => [item.id, item.message]));
    const hrefById = new Map(attentionItems.map((item) => [item.id, item.href]));

    const candidates: ReminderCandidate[] = deriveReminderCandidates({ things, maintenanceTasks, problems }, now);

    const { data: existingRows } = await supabase.from("hmc_reminders").select("id, dedupe_key, status").eq("product_instance_id", instanceId);
    const existing: ExistingReminderSummary[] = (existingRows ?? []).map((r) => ({
      id: r.id as string,
      dedupeKey: r.dedupe_key as string,
      status: r.status as ExistingReminderSummary["status"],
    }));

    const { toInsert, toCancelIds } = diffReminders(candidates, existing);

    if (toInsert.length > 0) {
      await supabase.from("hmc_reminders").insert(
        toInsert.map((c) => ({
          user_id: userId,
          product_instance_id: instanceId,
          entity_type: c.entityType,
          entity_id: c.entityId,
          kind: c.kind,
          dedupe_key: c.dedupeKey,
          status: "scheduled",
          next_eligible_at: c.nextEligibleAt.toISOString(),
        }))
      );
      summary.remindersInserted += toInsert.length;
    }
    if (toCancelIds.length > 0) {
      await supabase.from("hmc_reminders").update({ status: "cancelled", cancelled_at: now.toISOString() }).in("id", toCancelIds);
      summary.remindersCancelled += toCancelIds.length;
    }

    const { data: dueRows } = await supabase
      .from("hmc_reminders")
      .select("id, kind, dedupe_key, status, next_eligible_at")
      .eq("product_instance_id", instanceId)
      .eq("status", "scheduled")
      .lte("next_eligible_at", now.toISOString());

    const eligible: EnrichedReminder[] = [];
    for (const row of dueRows ?? []) {
      const kind = row.kind as HomeManagementCompanionReminderKind;
      const eligibility = resolveEligibility(kind, preferences, now);
      if (!eligibility.eligible) {
        summary.deliveriesSkipped += 1;
        continue;
      }
      const dedupeKey = row.dedupe_key as string;
      eligible.push({
        reminderId: row.id as string,
        kind,
        message: messageById.get(dedupeKey) ?? "Something in your home needs attention.",
        deepLink: hrefById.get(dedupeKey) ?? "/app/products/home-management-companion/attention",
      });
    }

    if (eligible.length === 0) continue;

    const { data: subs } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth_key").eq("user_id", userId).is("revoked_at", null);
    if (!subs || subs.length === 0) {
      // No device to deliver to yet - leave these reminders scheduled so they're retried once a subscription exists.
      summary.deliveriesSkipped += eligible.length;
      continue;
    }

    const payloads = buildPushPayloads(eligible, preferences.privacyLevel, now);

    for (const payload of payloads) {
      const { data: claimed } = await supabase
        .from("hmc_notification_deliveries")
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
        await supabase.from("hmc_notification_deliveries").update({ outcome: "sent" }).eq("id", deliveryId);
        await supabase.from("hmc_reminders").update({ status: "delivered" }).in("id", payload.reminderIds);
      } else {
        summary.deliveriesFailed += 1;
        // Total failure: release the claim so the next run retries, rather than waiting a full day.
        await supabase.from("hmc_notification_deliveries").delete().eq("id", deliveryId);
      }
    }
  }

  return NextResponse.json({ ok: true, configured: true, ...summary });
}
