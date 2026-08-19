/**
 * How Home Base talks about time and care. The single place any
 * user-facing sentence about "when" is built.
 *
 * This file exists because the product used to say things like
 * "Change AC filter is 131 days overdue." That is a countdown kept
 * against the person using it, and it is the opposite of what this
 * product is for. The rule now: state what happened and what is usual,
 * and let the reader draw their own conclusion.
 *
 *   never   "131 days overdue"
 *   always  "Last done 4 months ago, usually every 3 months"
 *
 *   never   "never logged"
 *   always  "Not logged yet"
 *
 * Nothing here is allowed to use the word "overdue", and durations are
 * rounded into units a person actually speaks in. Anything past about
 * two months is months, not a day count, because "131 days" is a number
 * you have to do arithmetic on and "4 months" is not.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between two dates, ignoring time of day so "today" is stable regardless of clock time. */
export function daysBetween(fromIso: string, now: Date): number {
  const from = new Date(`${fromIso.slice(0, 10)}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((today - from.getTime()) / DAY_MS);
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/**
 * How long ago something happened, in the units a person would use.
 * Deliberately coarse: the exact day count stops being meaningful to a
 * reader long before it stops being available in the data.
 */
export function describeElapsed(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${plural(days, "day")} ago`;
  if (days < 14) return "last week";
  if (days < 60) return `${plural(Math.round(days / 7), "week")} ago`;
  if (days < 365) return `${plural(Math.round(days / 30), "month")} ago`;
  if (days < 730) return "over a year ago";
  return `${plural(Math.floor(days / 365), "year")} ago`;
}

/** How far away something is, same coarseness as describeElapsed. */
export function describeUpcoming(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 14) return `in ${plural(days, "day")}`;
  if (days < 60) return `in ${plural(Math.round(days / 7), "week")}`;
  if (days < 365) return `in ${plural(Math.round(days / 30), "month")}`;
  return "in over a year";
}

/** A repeat interval as a person would say it, e.g. 90 becomes "every 3 months". */
export function describeInterval(days: number): string {
  if (days === 1) return "every day";
  if (days === 7) return "every week";
  if (days === 14) return "every 2 weeks";
  if (days < 28) return `every ${plural(days, "day")}`;
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? "every month" : `every ${months} months`;
  }
  if (days < 730) return "every year";
  return `every ${plural(Math.round(days / 365), "year")}`;
}

/**
 * The line under a piece of care on the Home and Attention surfaces.
 * Two clauses, both factual: what actually happened, and what is
 * typical. No judgement, no counter, no colour.
 */
export function describeCareStatus(lastDoneAt: string | null, intervalDays: number, now: Date): string {
  const usual = `usually ${describeInterval(intervalDays)}`;
  if (!lastDoneAt) return `Not logged yet, ${usual}`;
  return `Last done ${describeElapsed(daysBetween(lastDoneAt, now))}, ${usual}`;
}

/** Warranty wording. Expiry is information, not an emergency, so it stays flat either way. */
export function describeWarranty(warrantyExpiresAt: string, now: Date): string {
  const days = -daysBetween(warrantyExpiresAt, now);
  if (days < 0) return `Warranty ended ${describeElapsed(-days)}`;
  if (days === 0) return "Warranty ends today";
  return `Warranty ends ${describeUpcoming(days)}`;
}

/** How long a snooze lasts when someone taps Snooze without choosing a length. */
export const DEFAULT_SNOOZE_DAYS = 7;
