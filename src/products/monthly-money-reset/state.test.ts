import { describe, expect, it } from "vitest";
import { createEmptyState, monthlyMoneyResetStateSchema, validateMonthlyMoneyResetState } from "./state";

function validBase() {
  const now = "2026-08-01T00:00:00.000Z";
  return {
    schemaVersion: 1 as const,
    currency: "USD",
    cycle: { cycleKey: "2026-08", label: "August 2026", startedAt: now },
    createdAt: now,
    updatedAt: now,
    lastMeaningfulActivityAt: now,
  };
}

describe("monthlyMoneyResetStateSchema", () => {
  it("accepts a minimal valid state and fills in defaults", () => {
    const result = validateMonthlyMoneyResetState(validBase());
    expect(result.income).toEqual([]);
    expect(result.bills).toEqual([]);
    expect(result.protectedReserve).toEqual([]);
    expect(result.preferences.tone).toBe("calm");
    expect(result.setup.currentStep).toBe(1);
  });

  it("createEmptyState produces a valid, genuinely empty state — no sample data", () => {
    const state = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
    expect(state.income).toHaveLength(0);
    expect(state.bills).toHaveLength(0);
    expect(state.activity).toHaveLength(0);
    expect(state.startingAvailableBalanceMinorUnits).toBe(0);
    expect(state.cycle.cycleKey).toBe("2026-08");
  });

  describe("invalid input is rejected", () => {
    it("rejects a non-integer amount (a float sent where minor units are required)", () => {
      const invalid = {
        ...validBase(),
        income: [{ id: "inc-1", name: "Paycheck", amountMinorUnits: 19.99, status: "received" }],
      };
      expect(monthlyMoneyResetStateSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects a negative income or bill amount", () => {
      const invalid = {
        ...validBase(),
        income: [{ id: "inc-1", name: "Paycheck", amountMinorUnits: -100, status: "received" }],
      };
      expect(monthlyMoneyResetStateSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects a malformed cycle key", () => {
      const invalid = { ...validBase(), cycle: { ...validBase().cycle, cycleKey: "August" } };
      expect(monthlyMoneyResetStateSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects a currency code that isn't three uppercase letters", () => {
      const invalid = { ...validBase(), currency: "us dollars" };
      expect(monthlyMoneyResetStateSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects an unknown bill status", () => {
      const invalid = {
        ...validBase(),
        bills: [{ id: "bill-1", name: "Rent", amountMinorUnits: 100, status: "overdue" }],
      };
      expect(monthlyMoneyResetStateSchema.safeParse(invalid).success).toBe(false);
    });

    it("rejects a missing schemaVersion", () => {
      const withoutVersion: Record<string, unknown> = { ...validBase() };
      delete withoutVersion.schemaVersion;
      expect(monthlyMoneyResetStateSchema.safeParse(withoutVersion).success).toBe(false);
    });
  });
});
