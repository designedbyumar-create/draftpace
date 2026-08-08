import type { Transaction } from "../../state";

export type TransactionsSummary = {
  totalSpendingMinorUnits: number;
  totalIncomeMinorUnits: number;
  activeCount: number;
  excludedCount: number;
  mostRecentDate: string | null;
};

/**
 * All-time honest totals over whatever transactions are currently
 * recorded — never a "this month" figure, since Personal Finance
 * Companion has no monthly cycle to scope one to (see cycleModel:
 * "continuous" in the product definition). Excluded (transfer) entries
 * never count toward spending or income, which is the entire point of
 * the exclusion flag.
 */
export function summarizeTransactions(transactions: Transaction[]): TransactionsSummary {
  const active = transactions.filter((t) => t.status !== "archived");
  let totalSpendingMinorUnits = 0;
  let totalIncomeMinorUnits = 0;
  let excludedCount = 0;
  let mostRecentDate: string | null = null;

  for (const transaction of active) {
    if (transaction.excludedFromSpending) {
      excludedCount += 1;
    } else if (transaction.direction === "debit") {
      totalSpendingMinorUnits += transaction.amountMinorUnits;
    } else {
      totalIncomeMinorUnits += transaction.amountMinorUnits;
    }
    if (!mostRecentDate || transaction.occurredOn > mostRecentDate) mostRecentDate = transaction.occurredOn;
  }

  return { totalSpendingMinorUnits, totalIncomeMinorUnits, activeCount: active.length, excludedCount, mostRecentDate };
}

export type TransactionsDominantAction = { kind: "add-first" } | null;

/** Manual entries are always complete at creation — there is no per-record incompleteness state to surface here, only the empty-ledger case. */
export function resolveDominantAction(transactions: Transaction[]): TransactionsDominantAction {
  const active = transactions.filter((t) => t.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };
  return null;
}
