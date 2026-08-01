import { describe, expect, it } from "vitest";
import { interpretLoadResponse, interpretSaveResponse } from "./data";
import { createEmptyState } from "./state";

/**
 * Tests the pure response-shaping logic only — the network-calling wrapper
 * functions (loadMonthlyMoneyResetState, saveMonthlyMoneyResetState,
 * listMyProductInstances) call the live Supabase client and can't be
 * exercised without a real database, which this environment doesn't have
 * (see migration.test.ts). Those need verification against a live project
 * per docs/products/MONTHLY-MONEY-RESET-QA.md.
 */

const validState = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });

describe("interpretLoadResponse", () => {
  it("returns ok with the validated state on success", () => {
    const result = interpretLoadResponse({ state: validState, revision: 3 }, null);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.revision).toBe(3);
      expect(result.state.cycle.cycleKey).toBe("2026-08");
    }
  });

  it("returns not-found when no row exists", () => {
    expect(interpretLoadResponse(null, null)).toEqual({ status: "not-found" });
  });

  it("returns error when Supabase reports an error", () => {
    const result = interpretLoadResponse(null, { message: "permission denied" });
    expect(result).toEqual({ status: "error", message: "permission denied" });
  });

  it("returns error rather than throwing when the stored state fails validation", () => {
    const result = interpretLoadResponse({ state: { not: "valid" }, revision: 1 }, null);
    expect(result.status).toBe("error");
  });
});

describe("interpretSaveResponse", () => {
  it("returns ok with the new revision on a successful write", () => {
    const result = interpretSaveResponse({ revision: 4, state: validState, conflict: false }, null);
    expect(result).toEqual({ status: "ok", revision: 4 });
  });

  it("returns conflict with the server's authoritative state, never silently overwriting it", () => {
    const result = interpretSaveResponse({ revision: 5, state: validState, conflict: true }, null);
    expect(result.status).toBe("conflict");
    if (result.status === "conflict") {
      expect(result.revision).toBe(5);
      expect(result.state.cycle.cycleKey).toBe("2026-08");
    }
  });

  it("returns error when Supabase reports an error", () => {
    const result = interpretSaveResponse(null, { message: "not authenticated" });
    expect(result).toEqual({ status: "error", message: "not authenticated" });
  });

  it("returns error when no row comes back at all", () => {
    const result = interpretSaveResponse(null, null);
    expect(result.status).toBe("error");
  });

  it("returns error rather than throwing when a conflicting state fails validation", () => {
    const result = interpretSaveResponse({ revision: 2, state: { not: "valid" }, conflict: true }, null);
    expect(result.status).toBe("error");
  });
});
