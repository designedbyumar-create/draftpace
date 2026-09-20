import { describe, expect, it } from "vitest";
import type { Debt } from "../../state";
import { comparePayoff, MAX_PLAN_MONTHS, payoffInputs, planPayoff } from "./payoffPlan";

const NOW = new Date("2026-09-21T09:00:00Z");

function debt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "d1",
    name: "Visa",
    type: "creditCard",
    balanceMinorUnits: 100000,
    currency: "USD",
    interestRate: 12,
    minimumPaymentMinorUnits: 51000,
    dueDate: null,
    promotionalRate: null,
    promotionalExpiry: null,
    balanceAsOfDate: "2026-09-01",
    linkedAccountId: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

describe("planPayoff", () => {
  it("works a single debt out to the cent: 12% is 1% a month", () => {
    // Month 1: 100000 + 1000 - 51000 = 50000. Month 2: 50000 + 500 = 50500, paid in full.
    const plan = planPayoff([debt()], "avalanche", 0, NOW);
    expect(plan.monthsToDebtFree).toBe(2);
    expect(plan.debtFreeMonth).toBe("2026-11");
    expect(plan.totalInterestMinorUnits).toBe(1500);
    expect(plan.steps[0].payoffMonth).toBe("2026-11");
  });

  it("rolls a cleared debt's minimum onto the next one (0% so only the roll-over moves the date)", () => {
    const a = debt({ id: "a", name: "Store card", balanceMinorUnits: 10000, interestRate: 0, minimumPaymentMinorUnits: 2000 });
    const b = debt({ id: "b", name: "Loan", balanceMinorUnits: 30000, interestRate: 0, minimumPaymentMinorUnits: 3000 });
    const plan = planPayoff([b, a], "snowball", 0, NOW);
    expect(plan.steps.map((s) => [s.name, s.monthsToPayoff])).toEqual([
      ["Store card", 5],
      ["Loan", 8],
    ]);
    expect(plan.totalInterestMinorUnits).toBe(0);
  });

  it("an extra amount brings the date forward", () => {
    const without = planPayoff([debt({ minimumPaymentMinorUnits: 10000 })], "snowball", 0, NOW);
    const withExtra = planPayoff([debt({ minimumPaymentMinorUnits: 10000 })], "snowball", 5000, NOW);
    expect(withExtra.monthsToDebtFree!).toBeLessThan(without.monthsToDebtFree!);
    expect(withExtra.totalInterestMinorUnits).toBeLessThan(without.totalInterestMinorUnits);
  });

  it("says a debt is not paid off when the minimum does not cover the interest", () => {
    // 24% on 100000 is 2000 a month; a 2000 minimum never touches the balance.
    const plan = planPayoff([debt({ interestRate: 24, minimumPaymentMinorUnits: 2000 })], "avalanche", 0, NOW);
    expect(plan.monthsToDebtFree).toBeNull();
    expect(plan.debtFreeMonth).toBeNull();
    expect(plan.steps[0].monthsToPayoff).toBeNull();
    expect(MAX_PLAN_MONTHS).toBeGreaterThan(100);
  });

  it("never pays more than is owed on the last month", () => {
    const plan = planPayoff([debt({ balanceMinorUnits: 1000, interestRate: 0, minimumPaymentMinorUnits: 700 })], "snowball", 0, NOW);
    expect(plan.monthsToDebtFree).toBe(2);
  });
});

describe("snowball and avalanche", () => {
  const small = debt({ id: "s", name: "Small, low rate", balanceMinorUnits: 50000, interestRate: 5, minimumPaymentMinorUnits: 2500 });
  const big = debt({ id: "b", name: "Big, high rate", balanceMinorUnits: 200000, interestRate: 25, minimumPaymentMinorUnits: 5000 });

  it("snowball clears the smallest balance first, avalanche the highest rate", () => {
    const { snowball, avalanche } = comparePayoff([small, big], 10000, NOW);
    expect(snowball.steps[0].name).toBe("Small, low rate");
    expect(avalanche.steps[0].name).toBe("Big, high rate");
  });

  it("names the cheaper method and by how much", () => {
    const result = comparePayoff([small, big], 10000, NOW);
    expect(result.cheaper).toBe("avalanche");
    expect(result.savedMinorUnits).toBe(result.snowball.totalInterestMinorUnits - result.avalanche.totalInterestMinorUnits);
    expect(result.savedMinorUnits).toBeGreaterThan(0);
  });

  it("reports no difference when there is only one debt", () => {
    const result = comparePayoff([small], 0, NOW);
    expect(result.cheaper).toBeNull();
    expect(result.savedMinorUnits).toBe(0);
  });
});

describe("payoffInputs", () => {
  it("leaves out, and names, a debt with no rate, and ignores closed and cleared debts", () => {
    const withRate = debt({ id: "a" });
    const noRate = debt({ id: "b", interestRate: null });
    const closed = debt({ id: "c", status: "archived" });
    const cleared = debt({ id: "d", balanceMinorUnits: 0 });
    const { planned, excluded } = payoffInputs([withRate, noRate, closed, cleared]);
    expect(planned.map((d) => d.id)).toEqual(["a"]);
    expect(excluded.map((d) => d.id)).toEqual(["b"]);
  });
});
