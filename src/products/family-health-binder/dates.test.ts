import { describe, expect, it } from "vitest";
import { daysBetween, describeAge, describeDay, longDate, plural, shortDate, todayIso, usDate } from "./dates";

describe("dates", () => {
  it("writes a date the way a US form asks for it", () => {
    expect(usDate("2026-09-07")).toBe("09/07/2026");
    expect(usDate("not a date")).toBe("not a date");
    expect(shortDate("2026-09-07")).toBe("Sep 7, 2026");
    expect(longDate("2026-09-07")).toBe("September 7, 2026");
  });

  it("takes today from the local calendar, not UTC", () => {
    expect(todayIso(new Date(2026, 8, 7, 23, 30))).toBe("2026-09-07");
    expect(todayIso(new Date(2026, 0, 2, 0, 5))).toBe("2026-01-02");
  });

  it("counts whole days in either direction", () => {
    expect(daysBetween("2026-09-07", "2026-09-10")).toBe(3);
    expect(daysBetween("2026-09-10", "2026-09-07")).toBe(-3);
    expect(daysBetween("2026-02-27", "2026-03-01")).toBe(2);
    expect(daysBetween("x", "2026-03-01")).toBeNull();
  });

  it("says a day in words, with no '1 days'", () => {
    const today = "2026-09-07";
    expect(describeDay("2026-09-07", today)).toBe("Today");
    expect(describeDay("2026-09-08", today)).toBe("Tomorrow");
    expect(describeDay("2026-09-06", today)).toBe("Yesterday");
    expect(describeDay("2026-09-12", today)).toBe("In 5 days");
    expect(describeDay("2026-08-26", today)).toBe("12 days ago");
    expect(plural(1, "day")).toBe("1 day");
  });

  it("gives an age in months until two years, then in years, and only with a real birth date", () => {
    expect(describeAge("2026-09-07", "2026-09-07")).toBe("under a month");
    expect(describeAge("2026-06-08", "2026-09-07")).toBe("2 months");
    expect(describeAge("2026-08-07", "2026-09-07")).toBe("1 month");
    expect(describeAge("2024-09-08", "2026-09-07")).toBe("23 months");
    expect(describeAge("2024-09-07", "2026-09-07")).toBe("2 years");
    expect(describeAge("2018-04-02", "2026-09-07")).toBe("8 years");
    expect(describeAge("1980-09-08", "2026-09-07")).toBe("45 years");
    expect(describeAge(null, "2026-09-07")).toBeNull();
    expect(describeAge("2027-01-01", "2026-09-07")).toBeNull();
  });
});
