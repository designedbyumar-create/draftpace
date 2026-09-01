import type { RecordLifecycleStatus } from "../../state";
import type { BadgeTone } from "@/design-system/Badge";

/**
 * The lifecycle explanation contract every direct section uses — never a
 * bare "Incomplete" badge. Each entity supplies its own specific
 * what's-missing/why-it-matters/what-it-unlocks copy (see each section's
 * own lifecycleCopy.ts), following the launch spec's exact tone shape:
 * state the fact, explain the consequence, offer the next action. This
 * file only owns the generic status -> badge tone/label mapping shared by
 * all seven entities.
 */
export const STATUS_LABEL: Record<RecordLifecycleStatus, string> = {
  draft: "Draft",
  confirmedIncomplete: "Saved, missing detail",
  ready: "Ready",
  needsReview: "Needs review",
  archived: "Archived",
};

export const STATUS_TONE: Record<RecordLifecycleStatus, BadgeTone> = {
  draft: "neutral",
  confirmedIncomplete: "warning",
  ready: "success",
  needsReview: "warning",
  archived: "neutral",
};

/** A record explanation: the specific missing-field message shown under a confirmedIncomplete or needsReview record, per the spec's "state the fact, explain the consequence, offer the next action" shape. Null for ready/archived/draft, which don't need one. */
export type LifecycleExplanation = { message: string } | null;
