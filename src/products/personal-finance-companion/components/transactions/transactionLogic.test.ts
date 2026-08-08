import { describe, expect, it } from "vitest";
import { summarizeTransactions, resolveDominantAction } from "./transactionLogic";
import type { Transaction } from "../../state";

function transaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "txn-1",
    accountId: "acc-1",
    occurredOn: "2026-08-01",
    description: "Groceries",
    amountMinorUnits: 5000,
    direction: "debit",
    currency: "USD",
    category: "Groceries",
    pendingOrCleared: "cleared",
    externalId: null,
    transferPairId: null,
    excludedFromSpending: false,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("summarizeTransactions", () => {
  it("sums debits as spending and credits as income, excluding archived", () => {
    const summary = summarizeTransactions([
      transaction({ id: "a", direction: "debit", amountMinorUnits: 5000 }),
      transaction({ id: "b", direction: "credit", amountMinorUnits: 200000 }),
      transaction({ id: "c", amountMinorUnits: 999999, status: "archived" }),
    ]);
    expect(summary.totalSpendingMinorUnits).toBe(5000);
    expect(summary.totalIncomeMinorUnits).toBe(200000);
    expect(summary.activeCount).toBe(2);
  });

  it("never counts an excluded transfer toward spending or income", () => {
    const summary = summarizeTransactions([
      transaction({ direction: "debit", amountMinorUnits: 30000, excludedFromSpending: true }),
    ]);
    expect(summary.totalSpendingMinorUnits).toBe(0);
    expect(summary.excludedCount).toBe(1);
  });

  it("tracks the most recent transaction date", () => {
    const summary = summarizeTransactions([
      transaction({ id: "a", occurredOn: "2026-08-01" }),
      transaction({ id: "b", occurredOn: "2026-08-15" }),
    ]);
    expect(summary.mostRecentDate).toBe("2026-08-15");
  });

  it("returns an honest empty summary for zero transactions, not a fabricated positive signal", () => {
    const summary = summarizeTransactions([]);
    expect(summary).toEqual({ totalSpendingMinorUnits: 0, totalIncomeMinorUnits: 0, activeCount: 0, excludedCount: 0, mostRecentDate: null });
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first transaction when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("returns null once at least one transaction exists — manual entries are always complete", () => {
    expect(resolveDominantAction([transaction()])).toBeNull();
  });
});
