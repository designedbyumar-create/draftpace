import type { ReminderCandidate } from "./deriveReminders";
import type { ReminderLifecycleState, ReminderSource } from "../reminders";

/**
 * The evaluator's automatic-resolution mechanism (Stage F §18) as a pure,
 * testable diff: which freshly-derived candidates are genuinely new
 * (insert), and which existing system reminders no longer have a
 * matching candidate at all — meaning their underlying condition resolved
 * or their date passed — and should be cancelled. Never touches a
 * user-created reminder (source === "user"): those are cancelled only by
 * the owner's own action, never silently by re-derivation. Never
 * resurrects a delivered/acknowledged/cancelled row — only "scheduled" or
 * "snoozed" ones are live candidates for cancellation, and only rows
 * genuinely absent from `existing` are inserted (a scheduled/snoozed row
 * that still matches a live candidate is left untouched, so an in-flight
 * snooze survives re-derivation).
 */

export interface ExistingReminderSummary {
  id: string;
  dedupeKey: string;
  status: ReminderLifecycleState;
  source: ReminderSource;
}

export interface ReminderDiff {
  toInsert: ReminderCandidate[];
  toCancelIds: string[];
}

export function diffReminders(candidates: ReminderCandidate[], existing: ExistingReminderSummary[]): ReminderDiff {
  const existingKeys = new Set(existing.map((e) => e.dedupeKey));
  const candidateKeys = new Set(candidates.map((c) => c.dedupeKey));

  const toInsert = candidates.filter((c) => !existingKeys.has(c.dedupeKey));

  const toCancelIds = existing
    .filter((e) => e.source === "system" && (e.status === "scheduled" || e.status === "snoozed") && !candidateKeys.has(e.dedupeKey))
    .map((e) => e.id);

  return { toInsert, toCancelIds };
}
