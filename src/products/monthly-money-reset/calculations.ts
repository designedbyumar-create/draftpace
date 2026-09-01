import type { ActivityEntry, BillEntry, MonthlyMoneyResetState } from "./state";

/**
 * The authoritative Safe-to-Spend formula (docs/products/
 * MONTHLY-MONEY-RESET-CALCULATIONS.md):
 *
 *   startingAvailableBalance
 * + income received after the reset began
 * - ordinary spending recorded after the reset began (includes corrections)
 * - bill payments made after the reset began (every paid bill, protected or not)
 * - savings transfers made after the reset began
 * - protected unpaid bills
 * - protected reserve still held in the account
 * = Safe to Spend
 *
 * Every term is read from its own authoritative list (income, bills,
 * savingsTransfers, protectedReserve) rather than from the activity ledger,
 * so a bill payment or savings transfer can never be counted twice by
 * construction — there is no code path that sums them from two places.
 * activity[] is read only for "spending" and "correction", the two types
 * that have no list of their own. Never clamped to zero — a negative result
 * is a real, meaningful answer, not an error state.
 */
export type SafeToSpendBreakdown = {
  startingAvailableBalance: number;
  incomeReceived: number;
  ordinarySpending: number;
  billPayments: number;
  savingsTransfersOut: number;
  protectedUnpaidBills: number;
  protectedReserveHeld: number;
  safeToSpend: number;
};

function sumMinorUnits<T>(items: T[], amountOf: (item: T) => number): number {
  return items.reduce((total, item) => total + amountOf(item), 0);
}

type CalculationInput = Pick<
  MonthlyMoneyResetState,
  "startingAvailableBalanceMinorUnits" | "income" | "activity" | "bills" | "savingsTransfers" | "protectedReserve"
>;

export function computeSafeToSpend(state: CalculationInput): SafeToSpendBreakdown {
  const startingAvailableBalance = state.startingAvailableBalanceMinorUnits;

  const incomeReceived = sumMinorUnits(
    state.income.filter((entry) => entry.status === "received"),
    (entry) => entry.amountMinorUnits
  );

  const ordinarySpending = sumMinorUnits(
    state.activity.filter((entry) => entry.type === "spending" || entry.type === "correction"),
    (entry) => entry.amountMinorUnits
  );

  const billPayments = sumMinorUnits(
    state.bills.filter((bill) => bill.status === "paid"),
    (bill) => bill.amountMinorUnits
  );

  const savingsTransfersOut = sumMinorUnits(state.savingsTransfers, (transfer) => transfer.amountMinorUnits);

  const protectedUnpaidBills = sumMinorUnits(
    state.bills.filter((bill) => bill.protected && (bill.status === "upcoming" || bill.status === "changed")),
    (bill) => bill.amountMinorUnits
  );

  const protectedReserveHeld = sumMinorUnits(state.protectedReserve, (item) => item.amountMinorUnits);

  const safeToSpend =
    startingAvailableBalance +
    incomeReceived -
    ordinarySpending -
    billPayments -
    savingsTransfersOut -
    protectedUnpaidBills -
    protectedReserveHeld;

  return {
    startingAvailableBalance,
    incomeReceived,
    ordinarySpending,
    billPayments,
    savingsTransfersOut,
    protectedUnpaidBills,
    protectedReserveHeld,
    safeToSpend,
  };
}

/** Presentation-only weekly figure — clamped at zero for display, never used as the real monthly answer. */
export function weeklyGuideAmount(safeToSpend: number, weeksRemainingInCycle: number): number {
  if (weeksRemainingInCycle <= 0) return Math.max(safeToSpend, 0);
  return Math.max(Math.round(safeToSpend / weeksRemainingInCycle), 0);
}

/**
 * Marks a bill paid. The Safe-to-Spend net-zero property (removing it from
 * "protected unpaid" while it starts counting as a "bill payment" instead)
 * falls out of computeSafeToSpend() automatically from this one status
 * change — there is no separate adjustment to make.
 */
export function markBillPaid(bills: BillEntry[], billId: string, paidDate: string): BillEntry[] {
  return bills.map((bill) => (bill.id === billId ? { ...bill, status: "paid" as const, paidDate } : bill));
}

export function markBillSkipped(bills: BillEntry[], billId: string): BillEntry[] {
  return bills.map((bill) => (bill.id === billId ? { ...bill, status: "skipped" as const } : bill));
}

/**
 * Appends an activity entry unless one with the same dedupeKey already
 * exists — the guard against a duplicated Quick Add submission (a network
 * retry, a double-tap) applying twice.
 */
export function appendActivity(activity: ActivityEntry[], entry: ActivityEntry): ActivityEntry[] {
  if (entry.dedupeKey && activity.some((existing) => existing.dedupeKey === entry.dedupeKey)) {
    return activity;
  }
  return [...activity, entry];
}
