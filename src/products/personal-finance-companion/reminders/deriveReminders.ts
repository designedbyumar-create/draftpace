import type { FinancialPictureInputs } from "../companion/capability";
import { deriveAttentionItems, type AttentionItem } from "../attention";
import { buildSystemDedupeKey, type PersonalFinanceCompanionReminderKind, type ReminderSchedule } from "../reminders";
import type { FinancialArea } from "../state";

/**
 * Derives the CURRENT set of system reminder candidates from canonical
 * state — never persisted here, never storing a second copy of "what's
 * true." The evaluator (cron route) diffs this fresh list against
 * existing pfc_reminders rows: new dedupeKeys get inserted, dedupeKeys no
 * longer present here get cancelled (§18 "automatic resolution" — a
 * reminder disappears the instant its underlying condition resolves,
 * exactly like Attention already does).
 *
 * Two genuinely different sources, kept separate on purpose:
 *  - condition candidates reuse attention.ts's own derivation directly
 *    (never a second, parallel judgment of the same fact — §1's
 *    "Attention and Notifications should converge on shared underlying
 *    facts").
 *  - date-based candidates are new: "this is coming up on schedule" is not
 *    something Attention tracks (Attention only flags problems), so bill/
 *    subscription/debt dates are computed here from the records directly.
 */

export interface ReminderCandidate {
  kind: PersonalFinanceCompanionReminderKind;
  entityType: FinancialArea | null;
  entityId: string | null;
  dedupeKey: string;
  schedule: ReminderSchedule;
  /** When this candidate becomes eligible to fire — always clamped to not-before `now`. */
  nextEligibleAt: Date;
}

const LEAD_DAYS_DEFAULT = 1;
const LEAD_DAYS_CANCELLATION = 7;

const ATTENTION_KIND_TO_REMINDER_KIND: Partial<Record<AttentionItem["kind"], PersonalFinanceCompanionReminderKind>> = {
  accountStale: "balanceStale",
  billMissingDueDate: "billMissingDetail",
  incomeExpectationOverdue: "estimatedIncomeDatePassed",
};

function clampNotBefore(date: Date, now: Date): Date {
  return date.getTime() < now.getTime() ? now : date;
}

function nextDayOfMonthOccurrence(dayOfMonth: number, now: Date): Date {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  let candidate = new Date(Date.UTC(year, month, Math.min(dayOfMonth, 28)));
  if (candidate.getTime() < now.getTime()) {
    candidate = new Date(Date.UTC(year, month + 1, Math.min(dayOfMonth, 28)));
  }
  return candidate;
}

function minusDays(date: Date, days: number): Date {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000);
}

export function deriveReminderCandidates(inputs: FinancialPictureInputs, now: Date = new Date()): ReminderCandidate[] {
  const candidates: ReminderCandidate[] = [];

  // --- Condition-based: reuse Attention's own derivation, never a second judgment. ---
  const attentionItems = deriveAttentionItems(inputs, now);
  for (const item of attentionItems) {
    const kind = ATTENTION_KIND_TO_REMINDER_KIND[item.kind];
    if (!kind) continue;
    candidates.push({
      kind,
      entityType: item.area,
      entityId: item.entityId,
      dedupeKey: buildSystemDedupeKey(kind, item.area, item.entityId),
      schedule: { kind: "onDate", date: now.toISOString().slice(0, 10) },
      nextEligibleAt: now,
    });
  }

  // --- Date-based: bills with a due day-of-month, reminder LEAD_DAYS_DEFAULT before. ---
  for (const bill of inputs.bills) {
    if (bill.status === "archived" || !bill.dueRule || !("dayOfMonth" in bill.dueRule)) continue;
    const due = nextDayOfMonthOccurrence(bill.dueRule.dayOfMonth, now);
    const eligible = clampNotBefore(minusDays(due, LEAD_DAYS_DEFAULT), now);
    candidates.push({
      kind: "billDue",
      entityType: "bills",
      entityId: bill.id,
      dedupeKey: buildSystemDedupeKey("billDue", "bills", bill.id) + `:${due.toISOString().slice(0, 10)}`,
      schedule: { kind: "daysBefore", targetDate: due.toISOString().slice(0, 10), days: LEAD_DAYS_DEFAULT },
      nextEligibleAt: eligible,
    });
  }

  // --- Date-based: subscription renewals and planned cancellations. ---
  for (const subscription of inputs.subscriptions) {
    if (subscription.status === "archived" || !subscription.renewalDate || subscription.decision === "cancelled") continue;
    const renewal = new Date(`${subscription.renewalDate}T00:00:00Z`);

    if (subscription.decision === "plannedCancellation") {
      const eligible = clampNotBefore(minusDays(renewal, LEAD_DAYS_CANCELLATION), now);
      if (renewal.getTime() >= now.getTime()) {
        candidates.push({
          kind: "plannedCancellation",
          entityType: "subscriptions",
          entityId: subscription.id,
          dedupeKey: buildSystemDedupeKey("plannedCancellation", "subscriptions", subscription.id) + `:${subscription.renewalDate}`,
          schedule: { kind: "daysBefore", targetDate: subscription.renewalDate, days: LEAD_DAYS_CANCELLATION },
          nextEligibleAt: eligible,
        });
      }
    } else if (renewal.getTime() >= now.getTime()) {
      const eligible = clampNotBefore(minusDays(renewal, LEAD_DAYS_DEFAULT), now);
      candidates.push({
        kind: "subscriptionRenewal",
        entityType: "subscriptions",
        entityId: subscription.id,
        dedupeKey: buildSystemDedupeKey("subscriptionRenewal", "subscriptions", subscription.id) + `:${subscription.renewalDate}`,
        schedule: { kind: "daysBefore", targetDate: subscription.renewalDate, days: LEAD_DAYS_DEFAULT },
        nextEligibleAt: eligible,
      });
    }
  }

  // --- Date-based: debt due dates and promotional-rate expiry. ---
  for (const debt of inputs.debts) {
    if (debt.status === "archived") continue;
    if (debt.dueDate) {
      const due = new Date(`${debt.dueDate}T00:00:00Z`);
      if (due.getTime() >= now.getTime()) {
        const eligible = clampNotBefore(minusDays(due, LEAD_DAYS_DEFAULT), now);
        candidates.push({
          kind: "debtDue",
          entityType: "debt",
          entityId: debt.id,
          dedupeKey: buildSystemDedupeKey("debtDue", "debt", debt.id) + `:${debt.dueDate}`,
          schedule: { kind: "daysBefore", targetDate: debt.dueDate, days: LEAD_DAYS_DEFAULT },
          nextEligibleAt: eligible,
        });
      }
    }
    if (debt.promotionalExpiry) {
      const expiry = new Date(`${debt.promotionalExpiry}T00:00:00Z`);
      if (expiry.getTime() >= now.getTime()) {
        const eligible = clampNotBefore(minusDays(expiry, LEAD_DAYS_CANCELLATION), now);
        candidates.push({
          kind: "promotionalRateExpiry",
          entityType: "debt",
          entityId: debt.id,
          dedupeKey: buildSystemDedupeKey("promotionalRateExpiry", "debt", debt.id) + `:${debt.promotionalExpiry}`,
          schedule: { kind: "daysBefore", targetDate: debt.promotionalExpiry, days: LEAD_DAYS_CANCELLATION },
          nextEligibleAt: eligible,
        });
      }
    }
  }

  return candidates;
}

/** weeklyReviewDue's cadence in days, keyed by the existing ReviewRhythm values (off is never eligible, handled by the caller). */
export const REVIEW_RHYTHM_DAYS: Record<"weekly" | "biweekly" | "monthly", number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

/**
 * The next eligible review date, anchored on `sinceDate` (the product
 * instance's created_at, in the absence of any "last review acknowledged"
 * timestamp in canonical state today — a documented approximation, not a
 * precise "time since you last reviewed"). Walks forward in cadence-sized
 * steps until the result is >= now.
 */
export function nextReviewDue(cadence: "weekly" | "biweekly" | "monthly", sinceDate: Date, now: Date = new Date()): Date {
  const stepMs = REVIEW_RHYTHM_DAYS[cadence] * 24 * 60 * 60 * 1000;
  let next = sinceDate.getTime() + stepMs;
  while (next < now.getTime()) next += stepMs;
  return new Date(next);
}
