import { renderAtPrivacyLevel, type NotificationPrivacyLevel } from "../notificationPreferences";
import { resolveSafeDeepLink } from "../deepLinks";
import { reminderKindCopy } from "./copy";
import type { PersonalFinanceCompanionReminderKind } from "../reminders";

/**
 * Turns eligible reminders into privacy-safe push payloads (Stage F §12,
 * §13, §20). One payload per single reminder (specific, useful); an
 * aggregated payload once there are enough at once to avoid a
 * notification storm — "4 things need your attention" instead of 4
 * separate pushes, without hiding urgent context (the aggregate still
 * deep-links straight to the Attention Inbox, not a bare "/app").
 * Payload minimization (§13): never more than a title/body/url — no
 * financial amount in the URL, no raw entity ids beyond what the deep
 * link itself already carries.
 */

export interface EnrichedReminder {
  reminderId: string;
  kind: PersonalFinanceCompanionReminderKind;
  /** The record's own name (bill/subscription/debt/income name), null for kinds that don't have one (weeklyReviewDue, importNeedsReview). */
  name: string | null;
  /** A formatted date string relevant to this kind's copy, if any. */
  detail: string | null;
  /** A formatted amount string ("$320.00"), only used at privacy level "detailed", only for kinds with a natural single amount. */
  amount: string | null;
  /** For userCreated only — the user's own note, shown verbatim regardless of privacy level since they wrote it themselves. */
  note: string | null;
  deepLink: string;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  reminderIds: string[];
  /** Stable per (user, day, involved reminders) — the caller combines this with the user id to form the delivery ledger's true idempotency key. */
  dedupeKey: string;
}

const AGGREGATE_THRESHOLD = 3;
const TITLE = "Draftpace";

function renderSingle(reminder: EnrichedReminder, privacyLevel: NotificationPrivacyLevel): string {
  if (reminder.kind === "userCreated" && reminder.note) return reminder.note;
  const copy = reminderKindCopy(reminder.kind);
  return renderAtPrivacyLevel(privacyLevel, {
    generic: copy.generic,
    withName: reminder.name ? copy.withName(reminder.name, reminder.detail ?? undefined) : undefined,
    withAmount: reminder.name && reminder.amount && copy.withAmount ? copy.withAmount(reminder.name, reminder.amount, reminder.detail ?? undefined) : undefined,
  });
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
      url: resolveSafeDeepLink({ kind: "attention" }),
      reminderIds: ids,
      dedupeKey: `aggregate:${now.toISOString().slice(0, 10)}:${ids.join(",")}`,
    },
  ];
}
