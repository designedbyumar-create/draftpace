import type { NotificationPrivacyLevel } from "../notificationPreferences";
import type { HomeManagementCompanionReminderKind } from "../reminders";

/**
 * Turns eligible reminders into privacy-safe push payloads, mirroring
 * PFC's identical aggregate.ts. Simpler here: Home Base has no dollar
 * amounts to gate behind a "detailed" tier, so "normal" and "detailed"
 * render identically (the item's own message, which already names the
 * appliance/task) and only "private" strips it down to a generic line.
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

const GENERIC_MESSAGE_BY_KIND: Record<HomeManagementCompanionReminderKind, string> = {
  maintenanceDue: "A maintenance task needs attention.",
  warrantyExpiring: "A warranty needs attention.",
  problem: "A problem needs attention.",
};

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
  return [
    {
      title: TITLE,
      body: `${reminders.length} things need your attention.`,
      url: "/app/products/home-management-companion/attention",
      reminderIds: ids,
      dedupeKey: `aggregate:${now.toISOString().slice(0, 10)}:${ids.join(",")}`,
    },
  ];
}
