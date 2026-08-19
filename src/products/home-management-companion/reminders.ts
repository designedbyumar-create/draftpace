/**
 * The persistent reminder contract for Home Base, mirroring PFC's
 * reminders.ts shape (see docs on that file) but deliberately smaller:
 * kinds match attention.ts's AttentionKind exactly, no user-created
 * reminders. No separate scheduled/snoozed/acknowledged reminder-row
 * state machine either, unlike PFC's: v2's snooze/skip is a single
 * guard clause inside attention.ts itself (an entity's own
 * snoozedUntil field), which suppresses both the UI list and this
 * reminder derivation from one source of truth, see attention.ts's
 * own comment. Every reminder is system-derived, re-derived fresh on
 * every evaluator run via the dedupeKey below, never hand-authored.
 */

export type HomeManagementCompanionReminderKind = "maintenanceDue" | "warrantyExpiring" | "problem";

export type ReminderLifecycleState = "scheduled" | "delivered" | "cancelled";

export type ReminderEntityType = "thing" | "maintenanceTask" | "problem";

export interface ReminderMetadata {
  id: string;
  userId: string;
  productInstanceId: string;
  entityType: ReminderEntityType | null;
  entityId: string | null;
  kind: HomeManagementCompanionReminderKind;
  /** Stable identity within a product instance, `${kind}:${entityId}`. Matches attention.ts's AttentionItem.id exactly, so a reminder and the Attention item it came from always agree. */
  dedupeKey: string;
  state: ReminderLifecycleState;
  nextEligibleAt: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
