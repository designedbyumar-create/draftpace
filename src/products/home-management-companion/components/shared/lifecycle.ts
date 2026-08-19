import type { RecordLifecycleStatus } from "../../state";
import type { BadgeTone } from "@/design-system/Badge";

/** The generic status -> badge tone/label mapping shared by all three Home Base record types. */
export const STATUS_LABEL: Record<RecordLifecycleStatus, string> = {
  active: "Active",
  needsReview: "Needs review",
  archived: "Archived",
};

export const STATUS_TONE: Record<RecordLifecycleStatus, BadgeTone> = {
  active: "success",
  needsReview: "warning",
  archived: "neutral",
};
