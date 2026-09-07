import { describe, expect, it } from "vitest";
import { lookupTimezone, TIMEZONE_PLACES } from "./timezoneLookup";

describe("lookupTimezone", () => {
  it("finds a listed city, case-insensitively", () => {
    expect(lookupTimezone("Tokyo")).toBe("Asia/Tokyo");
    expect(lookupTimezone("tokyo")).toBe("Asia/Tokyo");
    expect(lookupTimezone("TOKYO")).toBe("Asia/Tokyo");
  });

  it("finds a listed airport code", () => {
    expect(lookupTimezone("JFK")).toBe("America/New_York");
  });

  it("tolerates surrounding whitespace", () => {
    expect(lookupTimezone("  Paris  ")).toBe("Europe/Paris");
  });

  /**
   * The whole point of a small, exact-match table: an unlisted place is
   * never silently given a wrong answer dressed up as a real one. Null
   * is the honest result, every time, deterministically.
   */
  it("returns null, deterministically, for anywhere not in the table", () => {
    expect(lookupTimezone("Nowheresville")).toBeNull();
    expect(lookupTimezone("Nowheresville")).toBeNull();
    expect(lookupTimezone("Nowheresville")).toBeNull();
  });

  it("returns null for a partial or fuzzy match, never guessing", () => {
    // "Tok" should not resolve to Tokyo. Exact match only.
    expect(lookupTimezone("Tok")).toBeNull();
    expect(lookupTimezone("New")).toBeNull();
  });

  it("returns null for an empty or blank string", () => {
    expect(lookupTimezone("")).toBeNull();
    expect(lookupTimezone("   ")).toBeNull();
  });

  it("every entry names a real, resolvable IANA zone", () => {
    for (const entry of TIMEZONE_PLACES) {
      expect(() => new Intl.DateTimeFormat("en-CA", { timeZone: entry.iana }), entry.name).not.toThrow();
    }
  });

  it("has no duplicate name entries", () => {
    const names = TIMEZONE_PLACES.map((entry) => entry.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});
