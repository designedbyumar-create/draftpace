/**
 * The persistent reminder contract for Home Base, mirroring PFC's
 * reminders.ts shape (see docs on that file) but deliberately smaller:
 * two kinds only, matching attention.ts's AttentionKind exactly, no
 * user-created reminders and no snooze/acknowledge states, since no UI
 * drives those transitions yet. Every reminder is system-derived,
 * re-derived fresh on every evaluator run via the dedupeKey below, never
 * hand-authored.
 */

export type HomeManagementCompanionReminderKind = "maintenanceDue" | "warrantyExpiring";

export type ReminderLifecycleState = "scheduled" | "delivered" | "cancelled";

export type ReminderEntityType = "appliance" | "maintenanceTask";

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
