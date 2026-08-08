import { describe, expect, it } from "vitest";
import { summarizeDebts, resolveDominantAction, describeDebtIncompleteness } from "./debtLogic";
import type { Debt } from "../../state";

function debt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "debt-1",
    name: "Visa card",
    type: "creditCard",
    balanceMinorUnits: 250000,
    currency: "USD",
    interestRate: 21.99,
    minimumPaymentMinorUnits: 5000,
    dueDate: "2026-09-01",
    promotionalRate: null,
    promotionalExpiry: null,
    balanceAsOfDate: "2026-08-01",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("summarizeDebts", () => {
  it("totals balances and minimum payments, excludes archived, counts missing interest rates", () => {
    const summary = summarizeDebts([
      debt({ id: "a", balanceMinorUnits: 250000, minimumPaymentMinorUnits: 5000 }),
      debt({ id: "b", balanceMinorUnits: 100000, minimumPaymentMinorUnits: 2000, interestRate: null }),
      debt({ id: "c", balanceMinorUnits: 999999, status: "archived" }),
    ]);
    expect(summary.activeCount).toBe(2);
    expect(summary.totalBalanceMinorUnits).toBe(350000);
    expect(summary.totalMinimumPaymentMinorUnits).toBe(7000);
    expect(summary.missingInterestRateCount).toBe(1);
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first debt when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("suggests adding an interest rate for the earliest-added debt missing one", () => {
    const older = debt({ id: "older", interestRate: null, createdAt: "2026-08-01T00:00:00Z" });
    const newer = debt({ id: "newer", interestRate: null, createdAt: "2026-08-05T00:00:00Z" });
    expect(resolveDominantAction([newer, older])).toMatchObject({ kind: "add-interest-rate", debt: { id: "older" } });
  });

  it("returns null once every debt has an interest rate", () => {
    expect(resolveDominantAction([debt()])).toBeNull();
  });
});

describe("describeDebtIncompleteness", () => {
  it("uses the exact required copy for a missing interest rate", () => {
    expect(describeDebtIncompleteness(debt({ interestRate: null }))).toBe(
      "Your debt is saved. Add the interest rate to calculate a reliable payoff timeline."
    );
  });

  it("a debt missing its interest rate is still a complete, valid record — describeDebtIncompleteness only supplies the note, callers keep it visible", () => {
    const d = debt({ interestRate: null });
    expect(d.balanceMinorUnits).toBe(250000);
    expect(d.minimumPaymentMinorUnits).toBe(5000);
  });

  it("returns null for a debt with an interest rate", () => {
    expect(describeDebtIncompleteness(debt())).toBeNull();
  });
});
