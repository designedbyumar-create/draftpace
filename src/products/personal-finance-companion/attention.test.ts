import { describe, expect, it } from "vitest";
import { deriveAttentionItems, summarizeAttentionByArea, type AttentionInputs } from "./attention";
import type { Account, Bill, Debt, IncomeSource, SavingsGoal, Subscription, Transaction } from "./state";

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
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    shared: false,
    sharedSplitPercent: null,
    settled: false,
    settledAt: null,
    ...overrides,
  };
}

function subscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    name: "Streaming",
    amountMinorUnits: 1500,
    frequency: "monthly",
    renewalDate: null,
    decision: "keep",
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
    linkedAccountId: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

function savingsGoal(overrides: Partial<SavingsGoal> = {}): SavingsGoal {
  return {
    id: "goal-1",
    name: "Emergency fund",
    type: "emergencyFund",
    targetAmountMinorUnits: 1000000,
    savedAmountMinorUnits: 250000,
    targetDate: "2027-01-01",
    recurring: false,
    currency: "USD",
    linkedAccountId: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

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

function incomeSource(overrides: Partial<IncomeSource> = {}): IncomeSource {
  return {
    id: "income-1",
    name: "Salary",
    amountMinorUnits: 320000,
    amountRangeMinorUnits: null,
    frequency: "monthly",
    nextExpectedDate: "2026-08-25",
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

const EMPTY: AttentionInputs = { accounts: [], incomeSources: [], bills: [], subscriptions: [], debts: [], savingsGoals: [], transactions: [] };

describe("deriveAttentionItems", () => {
  it("returns nothing when every record is complete and fresh", () => {
    expect(deriveAttentionItems({ ...EMPTY, accounts: [account()], bills: [bill()], debts: [debt()], savingsGoals: [savingsGoal()] }, NOW)).toEqual([]);
  });

  it("flags a stale account balance", () => {
    const items = deriveAttentionItems({ ...EMPTY, accounts: [account({ balanceAsOfDate: "2026-06-01" })] }, NOW);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("accountStale");
    expect(items[0].deepLink).toContain("/accounts?focus=acc-1");
  });

  it("flags a bill missing a due date", () => {
    const items = deriveAttentionItems({ ...EMPTY, bills: [bill({ dueRule: null })] }, NOW);
    expect(items[0].kind).toBe("billMissingDueDate");
  });

  it("flags a subscription still under review", () => {
    const items = deriveAttentionItems({ ...EMPTY, subscriptions: [subscription({ decision: "reviewing" })] }, NOW);
    expect(items[0].kind).toBe("subscriptionReview");
  });

  it("flags an approaching planned cancellation but not a distant one", () => {
    const soon = deriveAttentionItems({ ...EMPTY, subscriptions: [subscription({ decision: "plannedCancellation", renewalDate: "2026-08-15" })] }, NOW);
    expect(soon[0].kind).toBe("subscriptionCancellationApproaching");

    const distant = deriveAttentionItems({ ...EMPTY, subscriptions: [subscription({ decision: "plannedCancellation", renewalDate: "2026-12-01" })] }, NOW);
    expect(distant).toEqual([]);
  });

  /**
   * Phase 5 of the pricing plan. The guide research behind this fix
   * found the specific blind spot: an annual charge is exactly the one
   * a three-month view never shows. Before this, a subscription that
   * was kept (not under review, not planned to cancel) got no heads up
   * at all before it renewed, annual or not.
   */
  describe("subscriptionAnnualRenewalApproaching", () => {
    it("flags a kept annual subscription approaching its renewal", () => {
      const items = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "keep", frequency: "annual", renewalDate: "2026-08-15" })] },
        NOW
      );
      expect(items[0].kind).toBe("subscriptionAnnualRenewalApproaching");
      expect(items[0].message).toContain("2026-08-15");
    });

    it("never fires for a kept annual subscription still months away", () => {
      const items = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "keep", frequency: "annual", renewalDate: "2026-12-01" })] },
        NOW
      );
      expect(items).toEqual([]);
    });

    it("never fires for a monthly subscription, however soon it renews", () => {
      // Monthly is frequent enough to stay in mind on its own; this fix
      // is specifically about the once-a-year charge, not every renewal.
      const items = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "keep", frequency: "monthly", renewalDate: "2026-08-09" })] },
        NOW
      );
      expect(items).toEqual([]);
    });

    it("never fires for an annual subscription already under review or planned to cancel", () => {
      // Those two states already have their own, separate attention
      // kinds. Firing this one too would flag the same underlying fact
      // twice under two different kinds for the same subscription.
      const reviewing = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "reviewing", frequency: "annual", renewalDate: "2026-08-15" })] },
        NOW
      );
      expect(reviewing.map((i) => i.kind)).toEqual(["subscriptionReview"]);

      const cancelling = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "plannedCancellation", frequency: "annual", renewalDate: "2026-08-15" })] },
        NOW
      );
      expect(cancelling.map((i) => i.kind)).toEqual(["subscriptionCancellationApproaching"]);
    });

    it("never fires without a renewal date to check", () => {
      const items = deriveAttentionItems(
        { ...EMPTY, subscriptions: [subscription({ decision: "keep", frequency: "annual", renewalDate: null })] },
        NOW
      );
      expect(items).toEqual([]);
    });
  });

  it("flags a debt missing an interest rate", () => {
    const items = deriveAttentionItems({ ...EMPTY, debts: [debt({ interestRate: null })] }, NOW);
    expect(items[0].kind).toBe("debtMissingRate");
  });

  it("flags a savings goal missing a target date", () => {
    const items = deriveAttentionItems({ ...EMPTY, savingsGoals: [savingsGoal({ targetDate: null })] }, NOW);
    expect(items[0].kind).toBe("savingsMissingTarget");
  });

  it("flags a transaction missing a category, but never an excluded transfer", () => {
    const items = deriveAttentionItems(
      { ...EMPTY, transactions: [transaction({ category: null }), transaction({ id: "t2", category: null, excludedFromSpending: true })] },
      NOW
    );
    expect(items).toHaveLength(1);
    expect(items[0].entityId).toBe("txn-1");
  });

  it("flags an overdue income expectation but not a future one", () => {
    const overdue = deriveAttentionItems({ ...EMPTY, incomeSources: [incomeSource({ nextExpectedDate: "2026-08-01" })] }, NOW);
    expect(overdue[0].kind).toBe("incomeExpectationOverdue");
    expect(overdue[0].message).toContain("2026-08-01");

    const upcoming = deriveAttentionItems({ ...EMPTY, incomeSources: [incomeSource({ nextExpectedDate: "2026-08-25" })] }, NOW);
    expect(upcoming).toEqual([]);

    const dueToday = deriveAttentionItems({ ...EMPTY, incomeSources: [incomeSource({ nextExpectedDate: "2026-08-08" })] }, NOW);
    expect(dueToday).toEqual([]);
  });

  it("never surfaces an archived record", () => {
    expect(deriveAttentionItems({ ...EMPTY, bills: [bill({ dueRule: null, status: "archived" })] }, NOW)).toEqual([]);
  });
});

describe("summarizeAttentionByArea", () => {
  it("groups items by area for aggregated presentation", () => {
    const items = deriveAttentionItems(
      { ...EMPTY, accounts: [account({ balanceAsOfDate: "2026-06-01" }), account({ id: "acc-2", balanceAsOfDate: "2026-06-01" })], debts: [debt({ interestRate: null })] },
      NOW
    );
    const summary = summarizeAttentionByArea(items);
    expect(summary).toEqual(expect.arrayContaining([{ area: "accounts", count: 2 }, { area: "debt", count: 1 }]));
  });
});
