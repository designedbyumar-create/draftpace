import { describe, expect, it } from "vitest";
import { monthlyEquivalentMinorUnits, describeDueRule, summarizeBills, resolveDominantAction, describeBillIncompleteness } from "./billLogic";
import type { Bill } from "../../state";

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "bill-1",
    name: "Electric",
    category: "Utilities",
    amountMinorUnits: 12000,
    amountRangeMinorUnits: null,
    isVariable: false,
    dueRule: { dayOfMonth: 15 },
    frequency: "monthly",
    essential: true,
    funded: true,
    currency: "USD",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    shared: false,
    sharedSplitPercent: null,
    settled: false,
    settledAt: null,
    ...overrides,
  };
}

describe("monthlyEquivalentMinorUnits", () => {
  it("normalizes an annual amount to a monthly equivalent", () => {
    expect(monthlyEquivalentMinorUnits(bill({ amountMinorUnits: 120000, frequency: "annual" }))).toBe(10000);
  });

  it("never guesses a monthly figure for custom frequencies", () => {
    expect(monthlyEquivalentMinorUnits(bill({ frequency: "custom" }))).toBeNull();
  });
});

describe("describeDueRule", () => {
  it("describes a day-of-month rule", () => {
    expect(describeDueRule(bill({ dueRule: { dayOfMonth: 3 } }))).toBe("Due on day 3");
  });

  it("describes a specific-date rule", () => {
    expect(describeDueRule(bill({ dueRule: { specificDate: "2026-09-01" } }))).toBe("Due 2026-09-01");
  });

  it("returns null when there is no due rule", () => {
    expect(describeDueRule(bill({ dueRule: null }))).toBeNull();
  });
});

describe("summarizeBills", () => {
  it("totals monthly-equivalent amounts, excludes archived, counts missing due dates and unfunded essentials", () => {
    const summary = summarizeBills([
      bill({ id: "a", amountMinorUnits: 12000, frequency: "monthly" }),
      bill({ id: "b", amountMinorUnits: 6000, frequency: "quarterly", dueRule: null, essential: true, funded: false }),
      bill({ id: "c", amountMinorUnits: 999999, status: "archived" }),
    ]);
    expect(summary.activeCount).toBe(2);
    expect(summary.totalMonthlyEquivalentMinorUnits).toBe(12000 + 2000);
    expect(summary.missingDueDateCount).toBe(1);
    expect(summary.unfundedEssentialCount).toBe(1);
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first bill when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("suggests adding a due date for the earliest-added bill missing one", () => {
    const older = bill({ id: "older", dueRule: null, createdAt: "2026-08-01T00:00:00Z" });
    const newer = bill({ id: "newer", dueRule: null, createdAt: "2026-08-05T00:00:00Z" });
    expect(resolveDominantAction([newer, older])).toMatchObject({ kind: "add-due-date", bill: { id: "older" } });
  });

  it("returns null when every bill has a due date", () => {
    expect(resolveDominantAction([bill()])).toBeNull();
  });
});

describe("describeBillIncompleteness", () => {
  it("flags a bill missing a due date without hiding it", () => {
    expect(describeBillIncompleteness(bill({ dueRule: null }))).toMatch(/due date/);
  });

  it("returns null for a bill with a due date", () => {
    expect(describeBillIncompleteness(bill())).toBeNull();
  });
});
