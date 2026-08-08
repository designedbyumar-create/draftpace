import { describe, expect, it } from "vitest";
import { summarizeRecentChanges } from "./recentChanges";
import type { FinancialPictureInputs } from "./companion/capability";
import type { Account, Bill } from "./state";

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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const EMPTY: FinancialPictureInputs = { accounts: [], incomeSources: [], bills: [], subscriptions: [], transactions: [], debts: [], savingsGoals: [] };

describe("summarizeRecentChanges", () => {
  it("returns nothing when nothing changed recently", () => {
    expect(summarizeRecentChanges({ ...EMPTY, accounts: [account({ createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" })] }, NOW)).toEqual([]);
  });

  it("counts a freshly created record as added, grouped by area", () => {
    const result = summarizeRecentChanges(
      { ...EMPTY, accounts: [account({ createdAt: "2026-08-06T00:00:00Z", updatedAt: "2026-08-06T00:00:00Z" }), account({ id: "acc-2", createdAt: "2026-08-07T00:00:00Z", updatedAt: "2026-08-07T00:00:00Z" })] },
      NOW
    );
    expect(result).toEqual([{ area: "accounts", message: "2 accounts added" }]);
  });

  it("counts an old record with a recent edit as updated, not added", () => {
    const result = summarizeRecentChanges({ ...EMPTY, bills: [bill({ createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-08-07T00:00:00Z" })] }, NOW);
    expect(result).toEqual([{ area: "bills", message: "1 bill updated" }]);
  });

  it("never surfaces an archived record", () => {
    expect(summarizeRecentChanges({ ...EMPTY, accounts: [account({ createdAt: "2026-08-07T00:00:00Z", status: "archived" })] }, NOW)).toEqual([]);
  });
});
