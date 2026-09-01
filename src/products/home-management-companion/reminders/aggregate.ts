import type { NotificationPrivacyLevel } from "../notificationPreferences";
import type { HomeManagementCompanionReminderKind } from "../reminders";
import { describeHomeHeadline } from "../homeVoice";

/**
 * Turns eligible reminders into privacy-safe push payloads, mirroring
 * PFC's identical aggregate.ts. Simpler here: Home Base has no dollar
 * amounts to gate behind a "detailed" tier, so "normal" and "detailed"
 * render identically (the item's own message, which already names the
 * item and the job) and only "private" strips it down to a generic line.
 *
 * A push is the product speaking when nobody asked it to, so it is held
 * to the same voice as Home itself: it says what the home needs, never
 * how many rows changed state. The aggregate line is built from
 * describeHomeHeadline for exactly that reason, so a notification and
 * the screen it opens cannot say different things about the same home.
 */

export interface EnrichedReminder {
  reminderId: string;
  kind: HomeManagementCompanionReminderKind;
  /** The already-rendered, specific message attention.ts produced for this item. */
  message: string;
  deepLink: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  reminderIds: string[];
  dedupeKey: string;
}

const AGGREGATE_THRESHOLD = 3;
const TITLE = "Home Base";

/**
 * Home is the one surface that answers "does anything need me", so every
 * aggregate push opens it. It used to open /attention, a destination this
 * product stopped having when the nine screens collapsed into two, which
 * meant every aggregate notification landed on "No Attention destination
 * for this product".
 */
export const HOME_HREF = "/app/products/home-management-companion/workspace";

/**
 * What a push says when the person has asked for private notifications:
 * enough to know it is worth opening, never enough to tell a stranger
 * glancing at a lock screen what is in the house or what is broken.
 */
const GENERIC_MESSAGE_BY_KIND: Record<HomeManagementCompanionReminderKind, string> = {
  maintenanceDue: "Something in your home is worth taking care of.",
  warrantyExpiring: "A warranty is about to run out.",
  problem: "Something in your home needs a look.",
};

const PROBLEM_KINDS: HomeManagementCompanionReminderKind[] = ["problem"];

function renderSingle(reminder: EnrichedReminder, privacyLevel: NotificationPrivacyLevel): string {
  if (privacyLevel === "private") return GENERIC_MESSAGE_BY_KIND[reminder.kind];
  return reminder.message;
}

export function buildPushPayloads(reminders: EnrichedReminder[], privacyLevel: NotificationPrivacyLevel, now: Date): PushPayload[] {
  if (reminders.length === 0) return [];

  if (reminders.length < AGGREGATE_THRESHOLD) {
    return reminders.map((r) => ({
      title: TITLE,
      body: renderSingle(r, privacyLevel),
      url: r.deepLink,
      reminderIds: [r.reminderId],
      dedupeKey: `single:${r.reminderId}:${now.toISOString().slice(0, 10)}`,
    }));
  }

  const ids = reminders.map((r) => r.reminderId).sort();
  const wrong = reminders.filter((r) => PROBLEM_KINDS.includes(r.kind)).length;
  return [
    {
      title: TITLE,
      // The same sentence Home will show when they open it. Never a count
      // of records, and never the word "overdue".
      body: `${describeHomeHeadline({ wrong, worthDoing: reminders.length - wrong })}.`,
      url: HOME_HREF,
      reminderIds: ids,
      dedupeKey: `aggregate:${now.toISOString().slice(0, 10)}:${ids.join(",")}`,
    },
  ];
}
