/**
 * The small, product-independent pieces every opt-in reminder needs: what
 * hour it is for the person, whether that hour is one they asked not to be
 * disturbed in, and which ledger entries are old enough to forget. Pure, so
 * each product's own planner can be tested without a clock or a database.
 */

export interface ReminderPreferences {
  remindersEnabled: boolean;
  showDetail: boolean;
  quietStartHour: number;
  quietEndHour: number;
  timezone: string;
}

export const DEFAULT_REMINDER_PREFERENCES: ReminderPreferences = {
  remindersEnabled: false,
  showDetail: false,
  quietStartHour: 21,
  quietEndHour: 8,
  timezone: "UTC",
};

/** The local hour, 0-23, in an IANA zone. Falls back to UTC for a zone the runtime does not know. */
export function localHour(now: Date, timeZone: string): number {
  const read = (zone: string) =>
    Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: zone }).format(now));
  try {
    return read(timeZone);
  } catch {
    return read("UTC");
  }
}

/** The calendar date, "YYYY-MM-DD", in an IANA zone. Falls back to UTC for a zone the runtime does not know. */
export function localDate(now: Date, timeZone: string): string {
  const read = (zone: string) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: zone }).format(now);
  try {
    return read(timeZone);
  } catch {
    return read("UTC");
  }
}

/** True from quiet_start up to, not including, quiet_end. The window may cross midnight. Equal hours means never quiet. */
export function inQuietHours(hour: number, startHour: number, endHour: number): boolean {
  if (startHour === endHour) return false;
  return startHour < endHour ? hour >= startHour && hour < endHour : hour >= startHour || hour < endHour;
}

/** Drops ledger entries old enough that no window could make them due again. */
export function pruneNotified(notified: Record<string, string>, now: Date, keepDays = 7): Record<string, string> {
  const cutoff = now.getTime() - keepDays * 24 * 3_600_000;
  return Object.fromEntries(Object.entries(notified).filter(([, sentAt]) => new Date(sentAt).getTime() >= cutoff));
}
