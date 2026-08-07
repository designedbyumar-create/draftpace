import { describe, expect, it } from "vitest";
import {
  accountSchema,
  billSchema,
  incomeSourceSchema,
  subscriptionSchema,
  transactionSchema,
  debtSchema,
  savingsGoalSchema,
  createEmptySetupState,
  validateSetupState,
  setupStateSchema,
} from "./state";

const provenance = {
  status: "ready" as const,
  needsReviewReason: null,
  source: "manual" as const,
  importSessionId: null,
  createdAt: "2026-08-08T00:00:00Z",
  updatedAt: "2026-08-08T00:00:00Z",
};

describe("Personal Finance Companion record schemas", () => {
  it("accepts a real account", () => {
    const result = accountSchema.safeParse({
      id: "1",
      name: "Checking",
      type: "checking",
      currentBalanceMinorUnits: 150000,
      currency: "USD",
      availableForSpending: true,
      balanceAsOfDate: "2026-08-08",
      notes: null,
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a bill with a range instead of a single amount", () => {
    const result = billSchema.safeParse({
      id: "1",
      name: "Electricity",
      category: "utilities",
      amountMinorUnits: null,
      amountRangeMinorUnits: { min: 10000, max: 14000 },
      isVariable: true,
      dueRule: { dayOfMonth: 5 },
      frequency: "monthly",
      essential: true,
      funded: false,
      currency: "USD",
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an income source with an amount range and no single amount", () => {
    const result = incomeSourceSchema.safeParse({
      id: "1",
      name: "Freelance",
      amountMinorUnits: null,
      amountRangeMinorUnits: { min: 100000, max: 200000 },
      frequency: "irregular",
      nextExpectedDate: null,
      confidence: "estimated",
      grossOrNet: "unknown",
      currency: "USD",
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a subscription", () => {
    const result = subscriptionSchema.safeParse({
      id: "1",
      name: "Netflix",
      amountMinorUnits: 1599,
      frequency: "monthly",
      renewalDate: "2026-09-01",
      decision: "keep",
      currency: "USD",
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a transaction", () => {
    const result = transactionSchema.safeParse({
      id: "1",
      accountId: "acc-1",
      occurredOn: "2026-08-01",
      description: "Grocery store",
      amountMinorUnits: 5432,
      direction: "debit",
      currency: "USD",
      category: "groceries",
      pendingOrCleared: "cleared",
      externalId: null,
      transferPairId: null,
      excludedFromSpending: false,
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a debt missing its interest rate (confirmed but incomplete)", () => {
    const result = debtSchema.safeParse({
      id: "1",
      name: "Visa",
      type: "creditCard",
      balanceMinorUnits: 210000,
      currency: "USD",
      interestRate: null,
      minimumPaymentMinorUnits: 8500,
      dueDate: null,
      promotionalRate: null,
      promotionalExpiry: null,
      balanceAsOfDate: "2026-08-08",
      ...provenance,
      status: "confirmedIncomplete",
      needsReviewReason: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a savings goal", () => {
    const result = savingsGoalSchema.safeParse({
      id: "1",
      name: "Car insurance",
      type: "sinkingFund",
      targetAmountMinorUnits: 150000,
      savedAmountMinorUnits: 0,
      targetDate: "2026-12-01",
      recurring: false,
      currency: "USD",
      ...provenance,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an account with a non-integer balance", () => {
    const result = accountSchema.safeParse({
      id: "1",
      name: "Checking",
      type: "checking",
      currentBalanceMinorUnits: 150000.5,
      currency: "USD",
      availableForSpending: true,
      balanceAsOfDate: "2026-08-08",
      notes: null,
      ...provenance,
    });
    expect(result.success).toBe(false);
  });
});

describe("Companion setup state", () => {
  it("creates a real empty default, not an error", () => {
    const state = createEmptySetupState();
    expect(state.currentScreen).toBe(0);
    expect(state.selectedInputPath).toBeNull();
    expect(state.orientation.seenAt).toBeNull();
    expect(state.orientation.skipped).toBe(false);
    expect(state.areaProgress).toEqual({});
  });

  it("round-trips through validateSetupState", () => {
    const state = createEmptySetupState();
    const revalidated = validateSetupState(state);
    expect(revalidated).toEqual(state);
  });

  it("accepts a progressively-filled areaProgress map (not every area required)", () => {
    const result = setupStateSchema.safeParse({ areaProgress: { accounts: "complete" } });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.areaProgress).toEqual({ accounts: "complete" });
    }
  });

  it("rejects an invalid currentScreen", () => {
    const result = setupStateSchema.safeParse({ currentScreen: 99 });
    expect(result.success).toBe(false);
  });
});
