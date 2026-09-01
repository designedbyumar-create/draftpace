import { deriveAttentionItems, type AttentionInputs } from "../attention";
import type { HomeManagementCompanionReminderKind, ReminderEntityType } from "../reminders";

/**
 * Reminder candidates for Home Base, deliberately thin: unlike PFC (which
 * schedules reminders in advance, days before a date, then waits for
 * next_eligible_at to arrive), attention.ts already computes "is this due
 * right now" directly from stored dates. So every AttentionItem present
 * on a given evaluator run already IS an eligible-now reminder candidate
 * - there is no separate lead-time math to duplicate here. This file
 * exists as its own module anyway (not inlined into the cron route) to
 * keep "attention" (a UI concept) and "reminder" (a notification-pipeline
 * concept) as separate seams, even though they're 1:1 today.
 */

export interface ReminderCandidate {
  kind: HomeManagementCompanionReminderKind;
  entityType: ReminderEntityType | null;
  entityId: string;
  dedupeKey: string;
  nextEligibleAt: Date;
}

const ENTITY_TYPE_BY_KIND: Record<HomeManagementCompanionReminderKind, ReminderEntityType> = {
  maintenanceDue: "maintenanceTask",
  warrantyExpiring: "thing",
  problem: "problem",
};

export function deriveReminderCandidates(inputs: AttentionInputs, now: Date = new Date()): ReminderCandidate[] {
  return deriveAttentionItems(inputs, now).map((item) => ({
    kind: item.kind,
    entityType: ENTITY_TYPE_BY_KIND[item.kind],
    entityId: item.entityId,
    dedupeKey: item.id,
    nextEligibleAt: now,
  }));
}
