import { describe, expect, it } from "vitest";
import { deriveReminderCandidates, nextReviewDue } from "./deriveReminders";
import type { Account, Bill, Debt, Subscription } from "../state";
import type { FinancialPictureInputs } from "../companion/capability";

const NOW = new Date("2026-08-08T12:00:00Z");

const EMPTY: FinancialPictureInputs = { accounts: [], incomeSources: [], bills: [], subscriptions: [], transactions: [], debts: [], savingsGoals: [] };

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "bill-1",
    name: "Rent",
    category: "Housing",
    amountMinorUnits: 150000,
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

function subscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    name: "Netflix",
    amountMinorUnits: 1599,
    frequency: "monthly",
    renewalDate: "2026-08-20",
    decision: "keep",
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

function debt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "debt-1",
    name: "Visa",
    type: "creditCard",
    balanceMinorUnits: 480000,
    currency: "USD",
    interestRate: 21.99,
    minimumPaymentMinorUnits: 16000,
    dueDate: "2026-08-10",
    promotionalRate: null,
    promotionalExpiry: null,
    balanceAsOfDate: "2026-08-01",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("deriveReminderCandidates", () => {
  it("derives a billDue candidate a day before the next occurrence", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, bills: [bill()] }, NOW);
    const billDue = candidates.find((c) => c.kind === "billDue");
    expect(billDue).toBeDefined();
    expect(billDue!.entityId).toBe("bill-1");
    expect(billDue!.nextEligibleAt.toISOString().slice(0, 10)).toBe("2026-08-14");
  });

  it("derives a subscriptionRenewal candidate for a kept subscription", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, subscriptions: [subscription()] }, NOW);
    expect(candidates.find((c) => c.kind === "subscriptionRenewal")).toBeDefined();
    expect(candidates.find((c) => c.kind === "plannedCancellation")).toBeUndefined();
  });

  it("derives a plannedCancellation candidate, not a renewal one, when cancellation is planned", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, subscriptions: [subscription({ decision: "plannedCancellation" })] }, NOW);
    expect(candidates.find((c) => c.kind === "plannedCancellation")).toBeDefined();
    expect(candidates.find((c) => c.kind === "subscriptionRenewal")).toBeUndefined();
  });

  it("never derives a reminder for a cancelled subscription", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, subscriptions: [subscription({ decision: "cancelled" })] }, NOW);
    expect(candidates.filter((c) => c.entityType === "subscriptions")).toHaveLength(0);
  });

  it("derives debtDue and promotionalRateExpiry candidates", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, debts: [debt({ promotionalExpiry: "2026-09-01" })] }, NOW);
    expect(candidates.find((c) => c.kind === "debtDue")).toBeDefined();
    expect(candidates.find((c) => c.kind === "promotionalRateExpiry")).toBeDefined();
  });

  it("reuses Attention's own derivation for condition-based candidates, never inventing a second judgment", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, accounts: [account({ balanceAsOfDate: "2026-06-01" })] }, NOW);
    const stale = candidates.find((c) => c.kind === "balanceStale");
    expect(stale).toBeDefined();
    expect(stale!.entityId).toBe("acc-1");
  });

  it("produces a stable dedupeKey that changes when the target date changes (so a moved due date isn't silently deduplicated away)", () => {
    const a = deriveReminderCandidates({ ...EMPTY, bills: [bill({ dueRule: { dayOfMonth: 15 } })] }, NOW);
    const b = deriveReminderCandidates({ ...EMPTY, bills: [bill({ dueRule: { dayOfMonth: 20 } })] }, NOW);
    expect(a.find((c) => c.kind === "billDue")!.dedupeKey).not.toBe(b.find((c) => c.kind === "billDue")!.dedupeKey);
  });

  it("never surfaces a reminder for an archived record", () => {
    const candidates = deriveReminderCandidates({ ...EMPTY, bills: [bill({ status: "archived" })] }, NOW);
    expect(candidates).toEqual([]);
  });
});

describe("nextReviewDue", () => {
  it("walks forward from the anchor date in cadence-sized steps until reaching now or later", () => {
    const since = new Date("2026-01-01T00:00:00Z");
    const next = nextReviewDue("weekly", since, NOW);
    expect(next.getTime()).toBeGreaterThanOrEqual(NOW.getTime());
    // Should land within one week of now, not months away.
    expect(next.getTime() - NOW.getTime()).toBeLessThan(8 * 24 * 60 * 60 * 1000);
  });
});
