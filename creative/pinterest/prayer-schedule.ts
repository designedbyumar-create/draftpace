/**
 * The Draftpace pin posting schedule, set around the five daily prayers:
 * 2 pins after Fajr, 4 around Zuhr, 4 around Asr, 3 after Maghrib and 4
 * after Isha, 17 a day, worked out day by day for one US city so the times
 * follow the season and the clock change.
 *
 * Prayer times use the standard astronomical method (as PrayTimes.org
 * does): the sun's declination and the equation of time for the day,
 * Fajr and Isha when the sun is a set angle below the horizon, Asr when
 * an object's shadow reaches its length (times the Asr factor) plus its
 * noon shadow, Maghrib at sunset. Defaults are ISNA (15 degrees, the usual
 * North American method) with the standard Asr, for New York.
 *
 * Every time is computed in UTC, which is what the Publish date column of
 * the Pinterest CSV holds; `local` gives the same moment on the city's
 * clock for checking.
 */

export type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export const PRAYERS: Prayer[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export const LOCATION = { name: "New York", lat: 40.7128, lon: -74.006, timeZone: "America/New_York" };
export const METHOD = { name: "ISNA", fajrAngle: 15, ishaAngle: 15, asrFactor: 1 };

/** Minutes from each prayer time at which a pin goes out: 2, 4, 4, 3, 4. Spread out so pins never stack. */
export const PLAN: Record<Prayer, number[]> = {
  fajr: [15, 45],
  dhuhr: [-30, 15, 45, 75],
  asr: [-30, 15, 45, 75],
  maghrib: [10, 30, 50],
  isha: [15, 45, 75, 105],
};
export const PER_DAY = PRAYERS.reduce((n, p) => n + PLAN[p].length, 0);

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const fix = (a: number, b: number) => ((a % b) + b) % b;

/** The sun's declination (degrees) and the equation of time (hours) at a Julian date. */
function sun(jd: number): { decl: number; eqt: number } {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = fix(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15, 24);
  return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - RA };
}

const julian = (y: number, m: number, d: number) => {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
};

/** The five prayer times on a calendar date (YYYY-MM-DD, the city's date), as UTC instants. */
export function prayerTimes(date: string, loc = LOCATION, method = METHOD): Record<Prayer, Date> {
  const [y, m, d] = date.split("-").map(Number);
  const jd0 = julian(y, m, d) - loc.lon / (15 * 24);
  // Hours past midnight UTC, refined once with the sun's position at the time itself.
  const noon = (t: number) => 12 - sun(jd0 + t / 24).eqt - loc.lon / 15;
  const angleTime = (angle: number, t: number, before: boolean) => {
    const { decl } = sun(jd0 + t / 24);
    const cos = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(loc.lat))) / (Math.cos(rad(decl)) * Math.cos(rad(loc.lat)));
    const T = deg(Math.acos(Math.max(-1, Math.min(1, cos)))) / 15;
    return noon(t) + (before ? -T : T);
  };
  const asrTime = (t: number) => {
    const { decl } = sun(jd0 + t / 24);
    const angle = -deg(Math.atan(1 / (method.asrFactor + Math.tan(rad(Math.abs(loc.lat - decl))))));
    return angleTime(angle, t, false);
  };
  const guess = { fajr: 5, dhuhr: 12, asr: 15, maghrib: 18, isha: 20 };
  const hours: Record<Prayer, number> = {
    fajr: angleTime(method.fajrAngle, guess.fajr - loc.lon / 15, true),
    dhuhr: noon(guess.dhuhr - loc.lon / 15),
    asr: asrTime(guess.asr - loc.lon / 15),
    maghrib: angleTime(0.833, guess.maghrib - loc.lon / 15, false),
    isha: angleTime(method.ishaAngle, guess.isha - loc.lon / 15, false),
  };
  const base = Date.UTC(y, m - 1, d);
  return Object.fromEntries(PRAYERS.map((p) => [p, new Date(base + Math.round(hours[p] * 60) * 60000)])) as Record<Prayer, Date>;
}

/** A moment on the city's clock, "YYYY-MM-DD HH:MM". */
export function local(at: Date, timeZone = LOCATION.timeZone): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(at).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

/** The Publish date column's form: UTC, no zone letter, as Draftpace's earlier CSVs wrote it. */
export const csvTime = (at: Date) => at.toISOString().slice(0, 19);

export type Slot = { at: Date; date: string; prayer: Prayer; offset: number };

/** The first `count` posting slots from `start` (the city's date), in order: 17 a day around the prayers. */
export function prayerSlots(start: string, count: number): Slot[] {
  const out: Slot[] = [];
  const day = new Date(`${start}T12:00:00Z`);
  while (out.length < count) {
    const date = day.toISOString().slice(0, 10);
    const times = prayerTimes(date);
    for (const p of PRAYERS) for (const offset of PLAN[p]) if (out.length < count) out.push({ at: new Date(times[p].getTime() + offset * 60000), date, prayer: p, offset });
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return out;
}
