import { describe, expect, it } from "vitest";
import { createEmptyState } from "./state";
import { firstIncompleteStep, isSetupTrulyComplete, stepCompleteness } from "./setupCompleteness";

function baseState() {
  return createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
}

describe("stepCompleteness", () => {
  it("step 1 is incomplete when the starting balance is untouched zero", () => {
    const state = baseState();
    expect(stepCompleteness(state, 1)).toEqual({ complete: false, missing: expect.any(String) });
  });

  it("step 1 is complete once a nonzero starting balance is entered", () => {
    const state = { ...baseState(), startingAvailableBalanceMinorUnits: 500_00 };
    expect(stepCompleteness(state, 1)).toEqual({ complete: true });
  });

  it("step 1 is complete at zero only once explicitly confirmed", () => {
    const state = baseState();
    const confirmed = {
      ...state,
      setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, startingBalanceZeroConfirmed: true } },
    };
    expect(stepCompleteness(confirmed, 1)).toEqual({ complete: true });
  });

  it("step 2 is incomplete with no income and no confirmation", () => {
    expect(stepCompleteness(baseState(), 2).complete).toBe(false);
  });

  it("step 2 is complete once an income entry exists, regardless of amount", () => {
    const state = baseState();
    const withIncome = {
      ...state,
      income: [{ id: "inc-1", name: "Freelance", amountMinorUnits: 0, status: "expected" as const, recurring: false }],
    };
    expect(stepCompleteness(withIncome, 2)).toEqual({ complete: true });
  });

  it("step 2 is complete with no income once explicitly confirmed", () => {
    const state = baseState();
    const confirmed = {
      ...state,
      setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, noOtherIncomeConfirmed: true } },
    };
    expect(stepCompleteness(confirmed, 2)).toEqual({ complete: true });
  });

  it("step 3 is incomplete with no bills, no reserve, and no confirmation", () => {
    expect(stepCompleteness(baseState(), 3).complete).toBe(false);
  });

  it("step 3 is complete once a bill exists", () => {
    const state = baseState();
    const withBill = {
      ...state,
      bills: [
        { id: "bill-1", name: "Rent", amountMinorUnits: 100_00, category: "Housing", protected: true, status: "upcoming" as const },
      ],
    };
    expect(stepCompleteness(withBill, 3)).toEqual({ complete: true });
  });

  it("step 3 is complete once a reserve item exists", () => {
    const state = baseState();
    const withReserve = {
      ...state,
      protectedReserve: [{ id: "res-1", label: "Buffer", amountMinorUnits: 200_00 }],
    };
    expect(stepCompleteness(withReserve, 3)).toEqual({ complete: true });
  });

  it("step 3 is complete with nothing to protect once explicitly confirmed", () => {
    const state = baseState();
    const confirmed = {
      ...state,
      setup: { ...state.setup, acknowledgements: { ...state.setup.acknowledgements, noBillsOrReserveConfirmed: true } },
    };
    expect(stepCompleteness(confirmed, 3)).toEqual({ complete: true });
  });

  it("step 4 is incomplete with no spending groups", () => {
    expect(stepCompleteness(baseState(), 4).complete).toBe(false);
  });

  it("step 4 is incomplete when a spending group exists but is unnamed", () => {
    const state = baseState();
    const unnamed = { ...state, spendingGroups: [{ id: "grp-1", name: "  ", kind: "flexible" as const }] };
    expect(stepCompleteness(unnamed, 4).complete).toBe(false);
  });

  it("step 4 is complete once at least one spending group is named", () => {
    const state = baseState();
    const named = { ...state, spendingGroups: [{ id: "grp-1", name: "Everyday spending", kind: "flexible" as const }] };
    expect(stepCompleteness(named, 4)).toEqual({ complete: true });
  });

  it("step 4 has no zero-confirmation bypass, unlike steps 1-3", () => {
    const state = baseState();
    const confirmedElsewhere = {
      ...state,
      setup: {
        ...state.setup,
        acknowledgements: {
          startingBalanceZeroConfirmed: true,
          noOtherIncomeConfirmed: true,
          noBillsOrReserveConfirmed: true,
        },
      },
    };
    expect(stepCompleteness(confirmedElsewhere, 4).complete).toBe(false);
  });
});

describe("isSetupTrulyComplete / firstIncompleteStep", () => {
  it("a brand-new state is not truly complete, and step 1 is first", () => {
    const state = baseState();
    expect(isSetupTrulyComplete(state)).toBe(false);
    expect(firstIncompleteStep(state)).toBe(1);
  });

  it("is truly complete once every step is resolved, real data or deliberate confirmation", () => {
    const state = baseState();
    const resolved = {
      ...state,
      startingAvailableBalanceMinorUnits: 1000_00,
      income: [{ id: "inc-1", name: "Paycheck", amountMinorUnits: 200_00, status: "expected" as const, recurring: false }],
      bills: [
        { id: "bill-1", name: "Rent", amountMinorUnits: 100_00, category: "Housing", protected: true, status: "upcoming" as const },
      ],
      spendingGroups: [{ id: "grp-1", name: "Everyday spending", kind: "flexible" as const }],
    };
    expect(isSetupTrulyComplete(resolved)).toBe(true);
    expect(firstIncompleteStep(resolved)).toBeNull();
  });

  it("firstIncompleteStep reports the earliest unresolved step, not just any", () => {
    const state = baseState();
    const partiallyResolved = {
      ...state,
      startingAvailableBalanceMinorUnits: 1000_00,
      // Step 2 and 3 left unresolved; step 4 also unresolved.
    };
    expect(firstIncompleteStep(partiallyResolved)).toBe(2);
  });
});
