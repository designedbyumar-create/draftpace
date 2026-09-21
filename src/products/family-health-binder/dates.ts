/** Dates the way a US form writes them, and the small day arithmetic the screens need. Pure, so it reads the same in every browser and in tests. */

const DAY_MS = 86_400_000;

/** "2026-09-07" from a local Date, not from UTC, so evening in a US time zone is still today. */
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parts(iso: string): [number, number, number] | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** "09/07/2026", as a form asks for it. Returns the input unchanged if it is not an ISO date. */
export function usDate(iso: string): string {
  const p = parts(iso);
  return p ? `${String(p[1]).padStart(2, "0")}/${String(p[2]).padStart(2, "0")}/${p[0]}` : iso;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Sep 7, 2026". */
export function shortDate(iso: string): string {
  const p = parts(iso);
  return p ? `${MONTHS[p[1] - 1]} ${p[2]}, ${p[0]}` : iso;
}

/** Whole days from `from` to `to`, negative when `to` is earlier. Null if either is not a date. */
export function daysBetween(from: string, to: string): number | null {
  const a = parts(from);
  const b = parts(to);
  if (!a || !b) return null;
  return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / DAY_MS);
}

export function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** "Today", "Tomorrow", "Yesterday", "In 5 days", "12 days ago". */
export function describeDay(iso: string, today: string): string {
  const d = daysBetween(today, iso);
  if (d === null) return iso;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  return d > 0 ? `In ${plural(d, "day")}` : `${plural(-d, "day")} ago`;
}

/** "3 months", "4 years": months up to two years old, as a pediatric form does, years after. Null with no usable date of birth. */
export function describeAge(dateOfBirth: string | null, today: string): string | null {
  if (!dateOfBirth) return null;
  const b = parts(dateOfBirth);
  const t = parts(today);
  if (!b || !t) return null;
  let months = (t[0] - b[0]) * 12 + (t[1] - b[1]);
  if (t[2] < b[2]) months -= 1;
  if (months < 0) return null;
  if (months < 24) return months < 1 ? "under a month" : plural(months, "month");
  return plural(Math.floor(months / 12), "year");
}

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "September 7, 2026", spelled out here so it reads the same in every browser and in tests. */
export function longDate(iso: string): string {
  const p = parts(iso);
  return p ? `${MONTHS_LONG[p[1] - 1]} ${p[2]}, ${p[0]}` : iso;
}
