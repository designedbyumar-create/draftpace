import { describe, expect, it } from "vitest";
import { summarizeFreshness } from "./freshness";
import type { Account, Debt } from "./state";

const NOW = new Date("2026-08-08T00:00:00Z");

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: "acc-1",
    name: "Checking",
    type: "checking",
    currentBalanceMinorUnits: 100000,
    currency: "USD",
    availableForSpending: true,
    balanceAsOfDate: "2026-08-01",
    notes: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

function debt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "debt-1",
    name: "Visa",
    type: "creditCard",
    balanceMinorUnits: 250000,
    currency: "USD",
    interestRate: 21.99,
    minimumPaymentMinorUnits: 5000,
    dueDate: null,
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

describe("summarizeFreshness", () => {
  it("returns nothing when everything is fresh", () => {
    expect(summarizeFreshness({ accounts: [account()], debts: [debt()] }, NOW)).toEqual([]);
  });

  it("groups stale account balances into one calm count, not one line per account", () => {
    const result = summarizeFreshness(
      { accounts: [account({ balanceAsOfDate: "2026-06-01" }), account({ id: "acc-2", balanceAsOfDate: "2026-06-01" })], debts: [] },
      NOW
    );
    expect(result).toEqual([{ domain: "accounts", count: 2, message: "2 balances may need refreshing" }]);
  });

  it("uses a longer staleness window for debt than accounts", () => {
    const recentlyStaleForAccounts = summarizeFreshness({ accounts: [], debts: [debt({ balanceAsOfDate: "2026-07-01" })] }, NOW);
    expect(recentlyStaleForAccounts).toEqual([]);

    const staleForDebt = summarizeFreshness({ accounts: [], debts: [debt({ balanceAsOfDate: "2026-05-01" })] }, NOW);
    expect(staleForDebt).toEqual([{ domain: "debt", count: 1, message: "1 debt balance may need refreshing" }]);
  });

  it("never surfaces an archived record", () => {
    expect(summarizeFreshness({ accounts: [account({ balanceAsOfDate: "2026-01-01", status: "archived" })], debts: [] }, NOW)).toEqual([]);
  });
});
