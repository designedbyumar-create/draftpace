import type { FinancialArea } from "./state";
import type { SafeDeepLinkTarget } from "./deepLinks";

/**
 * Architecture only — no table, no CRUD, no UI yet (launch spec Stage C
 * §21: "architect support for later"). Defines the shape a future
 * user-created reminder ("remind me Friday", "remind me on payday") would
 * need, so that work starts from an agreed contract instead of nothing.
 * Deliberately references canonical records by id rather than copying
 * them — the same single-source-of-truth rule every financial table
 * follows already applies here.
 */

export type ReminderPurpose =
  | "checkBackLater"
  | "beforeDue"
  | "beforeRenewal"
  | "onPayday"
  | "custom";

export type ReminderSchedule =
  | { kind: "onDate"; date: string }
  | { kind: "daysBefore"; targetDate: string; days: number }
  | { kind: "recurring"; cadence: "weekly" | "biweekly" | "monthly" };

export type ReminderLifecycleState = "scheduled" | "snoozed" | "acknowledged" | "cancelled";

export interface ReminderMetadata {
  id: string;
  userId: string;
  productInstanceId: string;
  entityType: FinancialArea;
  entityId: string;
  purpose: ReminderPurpose;
  note: string | null;
  schedule: ReminderSchedule;
  state: ReminderLifecycleState;
  snoozedUntil: string | null;
  acknowledgedAt: string | null;
  deepLink: SafeDeepLinkTarget;
  createdAt: string;
  updatedAt: string;
}
