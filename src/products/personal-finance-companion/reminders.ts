import type { FinancialArea } from "./state";

/**
 * The persistent reminder contract — Stage F gives this a real table
 * (pfc_reminders) and CRUD (domain/reminders.ts). References canonical
 * records by id rather than copying them, same single-source-of-truth
 * rule every financial table already follows.
 *
 * `kind` covers two genuinely different reminder shapes under one type:
 *   - condition/attention kinds (billMissingDetail, estimatedIncomeDatePassed,
 *     balanceStale, weeklyReviewDue, importNeedsReview) — reused verbatim
 *     from notifications.ts's existing NOTIFICATION_KIND_* maps, so a
 *     reminder and its eventual notification agree on copy/category/tier
 *     without a second definition.
 *   - date-based kinds (billDue, subscriptionRenewal, plannedCancellation,
 *     debtDue, promotionalRateExpiry) — derived from a record's own date
 *     field, re-derived (never duplicated) on every evaluator run via the
 *     dedupeKey below.
 *   - userCreated — an explicit "remind me..." the owner set themselves.
 */
export type PersonalFinanceCompanionReminderKind =
  | "billMissingDetail"
  | "estimatedIncomeDatePassed"
  | "balanceStale"
  | "weeklyReviewDue"
  | "importNeedsReview"
  | "billDue"
  | "subscriptionRenewal"
  | "plannedCancellation"
  | "debtDue"
  | "promotionalRateExpiry"
  | "userCreated";

export type ReminderSource = "system" | "user";

export type ReminderSchedule =
  | { kind: "onDate"; date: string }
  | { kind: "daysBefore"; targetDate: string; days: number }
  | { kind: "recurring"; cadence: "weekly" | "biweekly" | "monthly" };

export type ReminderLifecycleState = "scheduled" | "snoozed" | "delivered" | "acknowledged" | "cancelled";

export interface ReminderMetadata {
  id: string;
  userId: string;
  productInstanceId: string;
  entityType: FinancialArea | null;
  entityId: string | null;
  kind: PersonalFinanceCompanionReminderKind;
  source: ReminderSource;
  schedule: ReminderSchedule;
  note: string | null;
  /** Stable identity for this reminder within its product instance — `${kind}:${entityType ?? "none"}:${entityId ?? "none"}` for system-derived reminders, a caller-supplied unique string for user-created ones. The unique DB constraint on (product_instance_id, dedupeKey) is what makes re-deriving system reminders on every evaluator run idempotent rather than duplicating rows. */
  dedupeKey: string;
  state: ReminderLifecycleState;
  nextEligibleAt: string;
  snoozedUntil: string | null;
  acknowledgedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function buildSystemDedupeKey(kind: PersonalFinanceCompanionReminderKind, entityType: FinancialArea, entityId: string): string {
  return `${kind}:${entityType}:${entityId}`;
}
