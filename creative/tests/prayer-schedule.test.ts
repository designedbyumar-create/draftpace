/**
 * Guards for the Draftpace posting schedule around the prayers: the right
 * number of pins at each prayer, every pin in order and inside its prayer's
 * window, and prayer times that match known New York sun times.
 */
import { describe, expect, it } from "vitest";
import { prayerTimes, prayerSlots, local, PLAN, PRAYERS, PER_DAY } from "../pinterest/prayer-schedule";

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));
const at = (date: string, p: (typeof PRAYERS)[number]) => minutes(local(prayerTimes(date)[p]).slice(11));

describe("Prayer-time posting schedule", () => {
  it("posts 2 at Fajr, 4 at Zuhr, 4 at Asr, 3 at Maghrib and 4 at Isha: 17 a day", () => {
    expect(PRAYERS.map((p) => PLAN[p].length)).toEqual([2, 4, 4, 3, 4]);
    expect(PER_DAY).toBe(17);
    const slots = prayerSlots("2026-11-24", 350);
    const days = new Map<string, number>();
    slots.forEach((s) => days.set(s.date, (days.get(s.date) ?? 0) + 1));
    expect([...days.values()].slice(0, -1).every((n) => n === 17), "a full day is not 17 pins").toBe(true);
  });

  it("keeps every pin in order and inside its own prayer's window, never spilling into the next prayer's pins", () => {
    for (const start of ["2026-06-10", "2026-11-24", "2026-12-20"]) {
      const slots = prayerSlots(start, 340);
      slots.forEach((s, i) => { if (i) expect(s.at > slots[i - 1].at, `${local(s.at)} is not after ${local(slots[i - 1].at)}`).toBe(true); });
      for (const s of slots) {
        const t = prayerTimes(s.date);
        const next = PRAYERS[PRAYERS.indexOf(s.prayer) + 1];
        if (next) expect(s.at < new Date(t[next].getTime() + PLAN[next][0] * 60000), `${s.prayer} pin at ${local(s.at)} runs into ${next}`).toBe(true);
      }
    }
  });

  it("match known New York sun times, and follow the clock change", () => {
    // Sunset (Maghrib) and solar noon (Zuhr) in New York, from published almanac times, within two minutes.
    expect(Math.abs(at("2026-06-21", "maghrib") - minutes("20:31"))).toBeLessThanOrEqual(2);
    expect(Math.abs(at("2026-12-21", "maghrib") - minutes("16:32"))).toBeLessThanOrEqual(2);
    expect(Math.abs(at("2026-12-21", "dhuhr") - minutes("11:54"))).toBeLessThanOrEqual(2);
    // Daylight saving ends on 1 November 2026: the clock reading of Zuhr falls by about an hour overnight.
    expect(at("2026-10-31", "dhuhr") - at("2026-11-01", "dhuhr")).toBeGreaterThanOrEqual(58);
  });
});
