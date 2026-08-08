import { NOTIFICATION_KIND_CATEGORY, type PersonalFinanceCompanionNotificationKind } from "../notifications";
import { isCategoryEnabled, type NotificationCategory, type PersonalFinanceCompanionNotificationPreferences } from "../notificationPreferences";
import type { PersonalFinanceCompanionReminderKind } from "../reminders";

/**
 * Server-side delivery eligibility (Stage F §6/§21) — the evaluator's own
 * gate, independent of and in addition to "is this reminder's scheduled
 * time due." A reminder can be due and still not eligible to send right
 * now (quiet hours, category turned off since it was created). Every
 * check here is pure and deterministic — no client polling, no AI
 * judgment.
 */

export type EligibilityResult = { eligible: true } | { eligible: false; reason: "categoryDisabled" | "quietHours" | "kindUnmapped" };

/** Matches the existing platform-level /app/notifications page's own stated quiet-hours window, so the two don't silently disagree. */
export const QUIET_HOURS_START_LOCAL = 21;
export const QUIET_HOURS_END_LOCAL = 8;

/** True if `date`, read in `timezone`'s local wall-clock hour, falls inside the quiet window (21:00-08:00). */
export function isWithinQuietHours(date: Date, timezone: string): boolean {
  const hourString = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(date);
  const hour = Number(hourString) % 24;
  return hour >= QUIET_HOURS_START_LOCAL || hour < QUIET_HOURS_END_LOCAL;
}

const REMINDER_KIND_TO_NOTIFICATION_KIND: Partial<Record<PersonalFinanceCompanionReminderKind, PersonalFinanceCompanionNotificationKind>> = {
  billMissingDetail: "billMissingDetail",
  estimatedIncomeDatePassed: "estimatedIncomeDatePassed",
  balanceStale: "balanceStale",
  weeklyReviewDue: "weeklyReviewDue",
  importNeedsReview: "importNeedsReview",
};

/** Date-based kinds don't have a notifications.ts entry (they aren't in that file's condition-kind union) but map onto the same category list. */
const DATE_KIND_TO_CATEGORY: Partial<Record<PersonalFinanceCompanionReminderKind, NotificationCategory>> = {
  billDue: "billsAndObligations",
  subscriptionRenewal: "subscriptionRenewals",
  plannedCancellation: "plannedCancellations",
  debtDue: "debtDates",
  promotionalRateExpiry: "promotionalRateExpiry",
};

export function resolveEligibility(
  kind: PersonalFinanceCompanionReminderKind,
  preferences: PersonalFinanceCompanionNotificationPreferences,
  now: Date
): EligibilityResult {
  // A user-created reminder is its own opt-in — the owner explicitly asked
  // for it, so no topic-category toggle gates it; quiet hours still apply.
  if (kind !== "userCreated") {
    const notificationKind = REMINDER_KIND_TO_NOTIFICATION_KIND[kind];
    const category = notificationKind ? NOTIFICATION_KIND_CATEGORY[notificationKind] : DATE_KIND_TO_CATEGORY[kind];
    if (!category) return { eligible: false, reason: "kindUnmapped" };
    if (!isCategoryEnabled(preferences, category)) return { eligible: false, reason: "categoryDisabled" };
  }
  if (isWithinQuietHours(now, preferences.timezone)) return { eligible: false, reason: "quietHours" };
  return { eligible: true };
}
