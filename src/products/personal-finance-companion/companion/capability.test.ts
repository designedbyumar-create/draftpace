import { describe, expect, it } from "vitest";
import { computeCapabilities, allReady, type FinancialPictureInputs } from "./capability";
import type { Account, Bill, Debt, IncomeSource, SavingsGoal, Subscription, Transaction } from "../state";

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

function income(overrides: Partial<IncomeSource> = {}): IncomeSource {
  return {
    id: "inc-1",
    name: "Paycheck",
    amountMinorUnits: 200000,
    amountRangeMinorUnits: null,
    frequency: "monthly",
    nextExpectedDate: null,
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
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

const EMPTY: FinancialPictureInputs = {
  accounts: [],
  incomeSources: [],
  bills: [],
  subscriptions: [],
  transactions: [],
  debts: [],
  savingsGoals: [],
};

describe("computeCapabilities — empty state", () => {
  it("every row is waiting, no value invented, when there is no data at all", () => {
    const rows = computeCapabilities(EMPTY);
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(row.status).toBe("waiting");
      expect(row.valueMinorUnits).toBeNull();
      expect(row.explain).toBeNull();
    }
  });
});

describe("availableMoney", () => {
  it("subtracts protected money and upcoming obligations from total balances", () => {
    const rows = computeCapabilities({
      ...EMPTY,
      accounts: [account({ currentBalanceMinorUnits: 400000, availableForSpending: true }), account({ id: "acc-2", currentBalanceMinorUnits: 65000, availableForSpending: false })],
      bills: [bill({ amountMinorUnits: 131000, frequency: "monthly" })],
    });
    const row = rows.find((r) => r.key === "availableMoney")!;
    // 465000 total - 65000 protected - 131000 obligations = 269000
    expect(row.valueMinorUnits).toBe(269000);
    expect(row.status).toBe("ready");
  });

  it("flags a preliminary caveat when a bill is missing a due date", () => {
    const rows = computeCapabilities({ ...EMPTY, accounts: [account()], bills: [bill({ dueRule: null })] });
    const row = rows.find((r) => r.key === "availableMoney")!;
    expect(row.explain?.caveat).toMatch(/missing a due date/);
  });
});

describe("expectedIncome", () => {
  it("uses the midpoint for estimated ranges and flags the estimate caveat", () => {
    const rows = computeCapabilities({
      ...EMPTY,
      incomeSources: [income({ amountMinorUnits: null, amountRangeMinorUnits: { min: 100000, max: 200000 }, confidence: "estimated" })],
    });
    const row = rows.find((r) => r.key === "expectedIncome")!;
    expect(row.valueMinorUnits).toBe(150000);
    expect(row.explain?.caveat).toMatch(/estimated/);
  });
});

describe("upcomingObligations", () => {
  it("combines bills and subscriptions and reports needsInfo when a due date is missing", () => {
    const rows = computeCapabilities({ ...EMPTY, bills: [bill({ dueRule: null })], subscriptions: [subscription()] });
    const row = rows.find((r) => r.key === "upcomingObligations")!;
    expect(row.status).toBe("needsInfo");
    expect(row.valueMinorUnits).toBe(12000 + 1500);
  });

  it("excludes a cancelled subscription from the total", () => {
    const rows = computeCapabilities({ ...EMPTY, subscriptions: [subscription({ decision: "cancelled" })] });
    const row = rows.find((r) => r.key === "upcomingObligations")!;
    expect(row.status).toBe("waiting");
  });
});

describe("spending", () => {
  it("only counts non-excluded debit transactions", () => {
    const rows = computeCapabilities({
      ...EMPTY,
      transactions: [transaction({ amountMinorUnits: 5000, direction: "debit" }), transaction({ id: "t2", amountMinorUnits: 999999, excludedFromSpending: true })],
    });
    const row = rows.find((r) => r.key === "spending")!;
    expect(row.valueMinorUnits).toBe(5000);
  });
});

describe("debt", () => {
  it("reports needsInfo when interest rate is missing", () => {
    const rows = computeCapabilities({ ...EMPTY, debts: [debt({ interestRate: null })] });
    const row = rows.find((r) => r.key === "debt")!;
    expect(row.status).toBe("needsInfo");
    expect(row.detail).toMatch(/interest rate/);
  });
});

describe("savings", () => {
  it("reports needsInfo when target date is missing", () => {
    const rows = computeCapabilities({ ...EMPTY, savingsGoals: [savingsGoal({ targetDate: null })] });
    const row = rows.find((r) => r.key === "savings")!;
    expect(row.status).toBe("needsInfo");
  });
});

describe("allReady", () => {
  it("is true when nothing needs info, even if some rows are still waiting", () => {
    const rows = computeCapabilities({ ...EMPTY, accounts: [account()] });
    expect(allReady(rows)).toBe(true);
  });

  it("is false when any row needsInfo", () => {
    const rows = computeCapabilities({ ...EMPTY, debts: [debt({ interestRate: null })] });
    expect(allReady(rows)).toBe(false);
  });
});
