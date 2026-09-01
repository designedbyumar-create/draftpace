import type { Debt } from "../../state";

export type DebtSummary = {
  totalBalanceMinorUnits: number;
  totalMinimumPaymentMinorUnits: number;
  activeCount: number;
  missingInterestRateCount: number;
};

export function summarizeDebts(debts: Debt[]): DebtSummary {
  const active = debts.filter((d) => d.status !== "archived");
  let totalBalanceMinorUnits = 0;
  let totalMinimumPaymentMinorUnits = 0;
  let missingInterestRateCount = 0;

  for (const debt of active) {
    totalBalanceMinorUnits += debt.balanceMinorUnits;
    totalMinimumPaymentMinorUnits += debt.minimumPaymentMinorUnits;
    if (debt.interestRate === null) missingInterestRateCount += 1;
  }

  return { totalBalanceMinorUnits, totalMinimumPaymentMinorUnits, activeCount: active.length, missingInterestRateCount };
}

export type DebtDominantAction =
  | { kind: "add-first" }
  | { kind: "add-interest-rate"; debt: Debt }
  | null;

/** The one dominant next action: the earliest-added active debt still missing an interest rate. A missing rate never hides the debt — see describeDebtIncompleteness, it stays fully visible with balance and minimum payment intact. */
export function resolveDominantAction(debts: Debt[]): DebtDominantAction {
  const active = debts.filter((d) => d.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };

  const missingRate = active.filter((d) => d.interestRate === null).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  if (missingRate.length > 0) return { kind: "add-interest-rate", debt: missingRate[0] };
  return null;
}

/**
 * The exact copy for a debt saved without an interest rate. Deliberately
 * literal and stable — this product does not build a payoff calculator,
 * so the message explains what's missing and why, not a feature the debt
 * is waiting to unlock.
 */
export function describeDebtIncompleteness(debt: Debt): string | null {
  if (debt.interestRate === null) {
    return "Your debt is saved. Add the interest rate to calculate a reliable payoff timeline.";
  }
  return null;
}
