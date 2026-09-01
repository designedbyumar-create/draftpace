import { isCategoryEnabled, type HomeManagementCompanionNotificationPreferences } from "../notificationPreferences";
import type { HomeManagementCompanionReminderKind } from "../reminders";

/**
 * Server-side delivery eligibility, mirroring PFC's identical
 * eligibility.ts. A reminder can be due and still not eligible to send
 * right now (quiet hours, category turned off since it was created).
 */

export type EligibilityResult = { eligible: true } | { eligible: false; reason: "categoryDisabled" | "quietHours" };

/** Matches the platform-level /app/notifications page's own stated quiet-hours window, and PFC's identical constants, so all three don't silently disagree. */
export const QUIET_HOURS_START_LOCAL = 21;
export const QUIET_HOURS_END_LOCAL = 8;

/** True if `date`, read in `timezone`'s local wall-clock hour, falls inside the quiet window (21:00-08:00). */
export function isWithinQuietHours(date: Date, timezone: string): boolean {
  const hourString = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(date);
  const hour = Number(hourString) % 24;
  return hour >= QUIET_HOURS_START_LOCAL || hour < QUIET_HOURS_END_LOCAL;
}

export function resolveEligibility(
  kind: HomeManagementCompanionReminderKind,
  preferences: HomeManagementCompanionNotificationPreferences,
  now: Date
): EligibilityResult {
  if (!isCategoryEnabled(preferences, kind)) return { eligible: false, reason: "categoryDisabled" };
  if (isWithinQuietHours(now, preferences.timezone)) return { eligible: false, reason: "quietHours" };
  return { eligible: true };
}
