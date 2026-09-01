import { describe, expect, it } from "vitest";
import { interpretFindInstanceResponse, interpretLoadResponse, interpretSaveResponse } from "./data";
import { createEmptyState, monthlyMoneyResetStateSchema } from "./state";

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

  it("treats a freshly granted empty state ({}) as ok, not a validation error", () => {
    const result = interpretLoadResponse({ state: {}, revision: 1 }, null);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.revision).toBe(1);
      expect(Object.keys(result.state)).toHaveLength(0);
    }
  });
});

/**
 * Regression coverage for the P0 stability incident, 2026-08-04: a failed
 * instance read was being collapsed into the same "not found" result as a
 * genuine absence, which the UI then rendered as "this product isn't set up
 * in your library yet" — indistinguishable from real non-ownership. These
 * three states must stay distinguishable at the data layer so no caller can
 * accidentally reintroduce the collapse.
 */
describe("interpretFindInstanceResponse", () => {
  it("returns found with the id when a row exists", () => {
    const result = interpretFindInstanceResponse({ id: "instance-123" }, null);
    expect(result).toEqual({ status: "found", id: "instance-123" });
  });

  it("returns not-found when no row exists and there is no error", () => {
    const result = interpretFindInstanceResponse(null, null);
    expect(result).toEqual({ status: "not-found" });
  });

  it("returns a distinct error status when Supabase reports an error, never not-found", () => {
    const result = interpretFindInstanceResponse(null, { message: "connection reset" });
    expect(result).toEqual({ status: "error", message: "connection reset" });
    expect(result.status).not.toBe("not-found");
  });

  it("prefers the error status even if a null row also came back alongside it", () => {
    // Defensive: some client libraries can report both a transient error and
    // a null row on the same response. The error must win, since treating a
    // failed request as "confirmed absent" is exactly the false-negative
    // this contract exists to prevent.
    const result = interpretFindInstanceResponse(null, { message: "timeout" });
    expect(result.status).toBe("error");
  });
});

/**
 * Regression coverage for the same incident's root trigger: the Setup UI
 * creates a bill/income/spending-group entry with an empty name the instant
 * "Add" is clicked (see SetupModule.tsx's addIncome/addBill/addGroup), and
 * the 700ms autosave debounce can persist that in-progress state before the
 * user finishes typing a name. The read-time schema must accept exactly what
 * the write path can legitimately produce, or a routine interaction
 * permanently corrupts (renders unparseable) the user's entire saved state.
 */
describe("monthlyMoneyResetStateSchema tolerates in-progress entry names", () => {
  const base = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });

  it("accepts a spending group with an empty name", () => {
    const withGroup = {
      ...base,
      spendingGroups: [{ id: "grp-1", name: "", kind: "flexible" as const }],
    };
    expect(() => monthlyMoneyResetStateSchema.parse(withGroup)).not.toThrow();
  });

  it("accepts a bill with an empty name", () => {
    const withBill = {
      ...base,
      bills: [{ id: "bill-1", name: "", amountMinorUnits: 0, category: "Other", protected: true, status: "upcoming" as const }],
    };
    expect(() => monthlyMoneyResetStateSchema.parse(withBill)).not.toThrow();
  });

  it("accepts an income entry with an empty name", () => {
    const withIncome = {
      ...base,
      income: [{ id: "inc-1", name: "", amountMinorUnits: 0, status: "expected" as const, recurring: false }],
    };
    expect(() => monthlyMoneyResetStateSchema.parse(withIncome)).not.toThrow();
  });

  it("still requires an id on every entry — the relaxation is scoped to name only", () => {
    const withBadId = {
      ...base,
      spendingGroups: [{ id: "", name: "Groceries", kind: "flexible" as const }],
    };
    expect(() => monthlyMoneyResetStateSchema.parse(withBadId)).toThrow();
  });

  it("parses a real previously-saved state shape with an empty spending group name without error", () => {
    // The exact shape recovered live during this incident's investigation
    // (product_instance 54de2bb7…, revision 61) — a real user's state that
    // was rendering as "not set up" before this fix.
    const real = {
      ...base,
      spendingGroups: [
        { id: "grp-a", kind: "flexible" as const, name: "Everyday" },
        { id: "grp-b", kind: "flexible" as const, name: "" },
      ],
    };
    const result = monthlyMoneyResetStateSchema.parse(real);
    expect(result.spendingGroups).toHaveLength(2);
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
