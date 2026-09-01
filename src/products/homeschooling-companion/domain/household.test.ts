import { describe, expect, it } from "vitest";
import { defaultHousehold, householdRequirement } from "./household";

/**
 * Only the pure logic. loadHousehold/saveHousehold are thin Supabase I/O
 * wrappers, same shape as Home Base's homeProfile.ts, which this repo
 * doesn't unit test directly for the same reason: there is nothing to
 * assert beyond "it calls the client with these arguments," which a
 * mock would only restate.
 */

describe("defaultHousehold", () => {
  it("starts with no state, never a fabricated default", () => {
    expect(defaultHousehold()).toEqual({ state: null });
  });
});

describe("householdRequirement", () => {
  it("returns null when no state has been picked", () => {
    expect(householdRequirement({ state: null })).toBeNull();
  });

  it("resolves a real state to its requirement", () => {
    expect(householdRequirement({ state: "Ohio" })?.level).toBe("High");
  });

  it("returns null rather than throwing if a saved name somehow no longer matches", () => {
    expect(householdRequirement({ state: "Not A Real State" })).toBeNull();
  });
});
