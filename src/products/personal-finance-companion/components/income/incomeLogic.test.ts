import { describe, expect, it } from "vitest";
import { monthlyEquivalentMinorUnits, summarizeIncome, resolveDominantAction, describeIncomeIncompleteness } from "./incomeLogic";
import type { IncomeSource } from "../../state";

function income(overrides: Partial<IncomeSource> = {}): IncomeSource {
  return {
    id: "inc-1",
    name: "Paycheck",
    amountMinorUnits: 200000,
    amountRangeMinorUnits: null,
    frequency: "monthly",
    nextExpectedDate: null,
    confidence: "confirmed",
    grossOrNet: "net",
    currency: "USD",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("monthlyEquivalentMinorUnits", () => {
  it("normalizes a biweekly amount to a monthly equivalent", () => {
    const result = monthlyEquivalentMinorUnits(income({ amountMinorUnits: 100000, frequency: "biweekly" }));
    expect(result).toBe(Math.round(100000 * (26 / 12)));
  });

  it("uses the midpoint of a range when no single amount is set", () => {
    const result = monthlyEquivalentMinorUnits(
      income({ amountMinorUnits: null, amountRangeMinorUnits: { min: 100000, max: 200000 }, frequency: "monthly" })
    );
    expect(result).toBe(150000);
  });

  it("never guesses a monthly figure for irregular income", () => {
    expect(monthlyEquivalentMinorUnits(income({ frequency: "irregular" }))).toBeNull();
  });

  it("returns null when there is no amount at all", () => {
    expect(monthlyEquivalentMinorUnits(income({ amountMinorUnits: null, amountRangeMinorUnits: null }))).toBeNull();
  });
});

describe("summarizeIncome", () => {
  it("totals confirmed and estimated sources, excludes archived, tracks the soonest next date", () => {
    const summary = summarizeIncome([
      income({ id: "a", amountMinorUnits: 200000, frequency: "monthly", nextExpectedDate: "2026-09-05" }),
      income({ id: "b", amountMinorUnits: 100000, frequency: "monthly", confidence: "estimated", nextExpectedDate: "2026-08-20" }),
      income({ id: "c", amountMinorUnits: 999999, status: "archived" }),
    ]);
    expect(summary.totalMonthlyEquivalentMinorUnits).toBe(300000);
    expect(summary.activeCount).toBe(2);
    expect(summary.estimatedCount).toBe(1);
    expect(summary.nextExpectedDate).toBe("2026-08-20");
  });

  it("counts irregular sources separately rather than folding a guess into the total", () => {
    const summary = summarizeIncome([income({ frequency: "irregular", amountMinorUnits: 50000 })]);
    expect(summary.totalMonthlyEquivalentMinorUnits).toBe(0);
    expect(summary.irregularCount).toBe(1);
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first source when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("suggests adding an amount for the earliest-added source missing one", () => {
    const older = income({ id: "older", amountMinorUnits: null, createdAt: "2026-08-01T00:00:00Z" });
    const newer = income({ id: "newer", amountMinorUnits: null, createdAt: "2026-08-05T00:00:00Z" });
    expect(resolveDominantAction([newer, older])).toMatchObject({ kind: "add-amount", source: { id: "older" } });
  });

  it("returns null when every source has an amount", () => {
    expect(resolveDominantAction([income()])).toBeNull();
  });
});

describe("describeIncomeIncompleteness", () => {
  it("flags a source with no amount and no range", () => {
    expect(describeIncomeIncompleteness(income({ amountMinorUnits: null, amountRangeMinorUnits: null }))).toMatch(/doesn't have an amount/);
  });

  it("does not flag an estimated source as incomplete on its own", () => {
    expect(describeIncomeIncompleteness(income({ confidence: "estimated" }))).toBeNull();
  });
});
