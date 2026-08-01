import { describe, expect, it } from "vitest";
import { currentCycleKey, cycleKeyToLabel, isValidCycleKey } from "./cycle";

describe("currentCycleKey", () => {
  it("formats as YYYY-MM in UTC", () => {
    expect(currentCycleKey(new Date("2026-08-15T12:00:00Z"))).toBe("2026-08");
    expect(currentCycleKey(new Date("2026-01-01T00:00:00Z"))).toBe("2026-01");
    expect(currentCycleKey(new Date("2026-12-31T23:59:59Z"))).toBe("2026-12");
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
