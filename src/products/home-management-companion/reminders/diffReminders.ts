import type { ReminderCandidate } from "./deriveReminders";
import type { ReminderLifecycleState } from "../reminders";

/**
 * The evaluator's automatic-resolution diff, mirroring PFC's identical
 * diffReminders.ts. Every Home Base reminder is system-derived (no
 * user-created source to protect), so this is a straightforward set
 * comparison: dedupeKeys with no existing row are new; existing
 * "scheduled" rows with no matching fresh candidate get cancelled
 * (the underlying maintenance/warranty condition resolved). A row already
 * "delivered" or "cancelled" is never resurrected or touched again.
 */

export interface ExistingReminderSummary {
  id: string;
  dedupeKey: string;
  status: ReminderLifecycleState;
}

export interface ReminderDiff {
  toInsert: ReminderCandidate[];
  toCancelIds: string[];
}

export function diffReminders(candidates: ReminderCandidate[], existing: ExistingReminderSummary[]): ReminderDiff {
  const existingKeys = new Set(existing.map((e) => e.dedupeKey));
  const candidateKeys = new Set(candidates.map((c) => c.dedupeKey));

  const toInsert = candidates.filter((c) => !existingKeys.has(c.dedupeKey));

  const toCancelIds = existing.filter((e) => e.status === "scheduled" && !candidateKeys.has(e.dedupeKey)).map((e) => e.id);

  return { toInsert, toCancelIds };
}
