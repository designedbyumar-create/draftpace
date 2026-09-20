import { describe, expect, it } from "vitest";
import { badgeDay, badgeMonth, formatTodayLabel } from "./dates";

describe("dates", () => {
  it("writes today in words, on the device's own calendar day", () => {
    expect(formatTodayLabel(new Date(2026, 8, 21, 9))).toBe("Monday 21 September");
    expect(formatTodayLabel(new Date(2027, 0, 1, 23, 59))).toBe("Friday 1 January");
  });

  it("splits an ISO date for the calendar badge", () => {
    expect(badgeMonth("2026-09-24")).toBe("SEP");
    expect(badgeMonth("2026-12-01")).toBe("DEC");
    expect(badgeDay("2026-10-01")).toBe("1");
    expect(badgeDay("2026-09-24")).toBe("24");
  });
});
