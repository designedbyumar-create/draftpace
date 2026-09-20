import type { Debt } from "../../state";

export type PayoffStrategy = "snowball" | "avalanche";

/** Past this many months a plan is reported as "not paid off" rather than simulated further. */
export const MAX_PLAN_MONTHS = 600;

export interface PayoffStep {
  debtId: string;
  name: string;
  /** Months from now until this debt reaches zero, 1 for "paid off by the end of next month". Null if it is not paid off within the limit. */
  monthsToPayoff: number | null;
  /** The calendar month it is paid off in, as "YYYY-MM". Null alongside monthsToPayoff. */
  payoffMonth: string | null;
  interestMinorUnits: number;
}

export interface PayoffPlan {
  strategy: PayoffStrategy;
  extraMinorUnits: number;
  /** In the order they are paid off. Debts that never reach zero come last. */
  steps: PayoffStep[];
  /** Months until every planned debt is gone. Null if any is not paid off within the limit. */
  monthsToDebtFree: number | null;
  debtFreeMonth: string | null;
  totalInterestMinorUnits: number;
}

export interface PayoffInputs {
  planned: Debt[];
  /** Debts left out because they have no interest rate, so nothing about them can be calculated. */
  excluded: Debt[];
}

/** Active debts with a rate are planned; active debts without one are named as left out, never guessed at. */
export function payoffInputs(debts: Debt[]): PayoffInputs {
  const active = debts.filter((d) => d.status !== "archived" && d.balanceMinorUnits > 0);
  return {
    planned: active.filter((d) => d.interestRate !== null),
    excluded: active.filter((d) => d.interestRate === null),
  };
}

function addMonths(now: Date, months: number): string {
  const total = now.getUTCFullYear() * 12 + now.getUTCMonth() + months;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

/**
 * One plain simulation. Each month interest is added at rate/12, every
 * debt is paid its minimum, and whatever is left of the pot (the extra
 * plus the minimums of debts already cleared) goes to the target debt.
 * A constant rate is assumed, so a promotional rate that ends is not
 * modelled; the screen says so.
 */
export function planPayoff(planned: Debt[], strategy: PayoffStrategy, extraMinorUnits: number, now: Date = new Date()): PayoffPlan {
  const extra = Math.max(0, Math.round(extraMinorUnits));
  const order = [...planned].sort((a, b) => {
    if (strategy === "snowball") return a.balanceMinorUnits - b.balanceMinorUnits || (b.interestRate ?? 0) - (a.interestRate ?? 0);
    return (b.interestRate ?? 0) - (a.interestRate ?? 0) || a.balanceMinorUnits - b.balanceMinorUnits;
  });

  const state = order.map((debt) => ({ debt, balance: debt.balanceMinorUnits, interest: 0, paidInMonth: null as number | null }));
  const monthlyPot = state.reduce((sum, s) => sum + s.debt.minimumPaymentMinorUnits, 0) + extra;

  let month = 0;
  while (month < MAX_PLAN_MONTHS && state.some((s) => s.balance > 0)) {
    month += 1;
    for (const s of state) {
      if (s.balance <= 0) continue;
      const interest = Math.round((s.balance * (s.debt.interestRate ?? 0)) / 100 / 12);
      s.interest += interest;
      s.balance += interest;
    }
    let pot = monthlyPot;
    for (const s of state) {
      if (s.balance <= 0) continue;
      const pay = Math.min(s.balance, s.debt.minimumPaymentMinorUnits, pot);
      s.balance -= pay;
      pot -= pay;
    }
    for (const s of state) {
      if (pot <= 0) break;
      if (s.balance <= 0) continue;
      const pay = Math.min(s.balance, pot);
      s.balance -= pay;
      pot -= pay;
    }
    for (const s of state) {
      if (s.balance <= 0 && s.paidInMonth === null) s.paidInMonth = month;
    }
  }

  const steps: PayoffStep[] = state
    .map((s) => ({
      debtId: s.debt.id,
      name: s.debt.name,
      monthsToPayoff: s.paidInMonth,
      payoffMonth: s.paidInMonth === null ? null : addMonths(now, s.paidInMonth),
      interestMinorUnits: s.interest,
    }))
    .sort((a, b) => (a.monthsToPayoff ?? Infinity) - (b.monthsToPayoff ?? Infinity));

  const allPaid = state.every((s) => s.paidInMonth !== null);
  const last = allPaid ? Math.max(0, ...state.map((s) => s.paidInMonth ?? 0)) : null;
  return {
    strategy,
    extraMinorUnits: extra,
    steps,
    monthsToDebtFree: last,
    debtFreeMonth: last === null ? null : addMonths(now, last),
    totalInterestMinorUnits: state.reduce((sum, s) => sum + s.interest, 0),
  };
}

export interface PayoffComparison {
  snowball: PayoffPlan;
  avalanche: PayoffPlan;
  /** What the cheaper method saves in interest over the other. Zero when they come out the same. */
  savedMinorUnits: number;
  cheaper: PayoffStrategy | null;
}

export function comparePayoff(planned: Debt[], extraMinorUnits: number, now: Date = new Date()): PayoffComparison {
  const snowball = planPayoff(planned, "snowball", extraMinorUnits, now);
  const avalanche = planPayoff(planned, "avalanche", extraMinorUnits, now);
  const diff = snowball.totalInterestMinorUnits - avalanche.totalInterestMinorUnits;
  return {
    snowball,
    avalanche,
    savedMinorUnits: Math.abs(diff),
    cheaper: diff === 0 ? null : diff > 0 ? "avalanche" : "snowball",
  };
}

/** "March 2027" from a "YYYY-MM" month, spelled out here so it reads the same in every browser and in tests. */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
