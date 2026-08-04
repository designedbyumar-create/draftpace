import { describe, expect, it } from "vitest";
import { currentCycleKey, cycleKeyToLabel, isValidCycleKey } from "./cycle";

describe("currentCycleKey", () => {
  it("formats as YYYY-MM in UTC", () => {
    expect(currentCycleKey(new Date("2026-08-15T12:00:00Z"))).toBe("2026-08");
    expect(currentCycleKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01");
    expect(currentCycleKey(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
  });

  /**
   * Regression coverage for the MMR reliability pass, 2026-08-04's "stable
   * instance selection" audit: this must select the same cycle — and
   * therefore the same product instance — for the same real-world instant,
   * regardless of the machine's local timezone. currentCycleKey() only reads
   * getUTCFullYear()/getUTCMonth(), which are invariant to process.env.TZ by
   * definition; these instants are chosen specifically because a
   * local-time-based implementation (e.g. getFullYear()/getMonth()) would
   * disagree with UTC on the date in several real timezones.
   */
  it("stays on the UTC month even at instants where common local timezones disagree", () => {
    // 2026-08-01T02:00:00Z is Aug 1 in UTC, but still Jul 31 in US Pacific
    // (UTC-7 in August) and Jul 31 in US Eastern (UTC-4).
    expect(currentCycleKey(new Date("2026-08-01T02:00:00Z"))).toBe("2026-08");
    // 2026-08-31T23:30:00Z is still Aug 31 in UTC, but already Sep 1 in
    // timezones ahead of UTC (e.g. UTC+8).
    expect(currentCycleKey(new Date("2026-08-31T23:30:00Z"))).toBe("2026-08");
  });

  it("is a pure function of the instant — the same instant always selects the same cycle", () => {
    const instant = new Date("2026-08-15T12:00:00Z");
    const first = currentCycleKey(instant);
    const second = currentCycleKey(new Date(instant.getTime()));
    expect(first).toBe(second);
  });
});

describe("isValidCycleKey", () => {
  it("accepts well-formed keys", () => {
    expect(isValidCycleKey("2026-08")).toBe(true);
  });

  it("rejects malformed keys", () => {
    expect(isValidCycleKey("2026-8")).toBe(false);
    expect(isValidCycleKey("August 2026")).toBe(false);
    expect(isValidCycleKey("")).toBe(false);
  });
});

describe("cycleKeyToLabel", () => {
  it("produces a human month/year label", () => {
    expect(cycleKeyToLabel("2026-08")).toBe("August 2026");
    expect(cycleKeyToLabel("2026-01")).toBe("January 2026");
  });

  it("returns the raw value for an invalid key rather than throwing", () => {
    expect(cycleKeyToLabel("not-a-key")).toBe("not-a-key");
  });
});
