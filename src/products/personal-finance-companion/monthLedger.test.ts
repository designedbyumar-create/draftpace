import { describe, expect, it } from "vitest";
import type { FinancialPictureInputs } from "./companion/capability";
import { deriveMonthLedger } from "./monthLedger";

const NOW = new Date("2026-09-21T09:00:00Z");
const base = { currency: "USD", needsReviewReason: null, source: "manual", importSessionId: null, createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z" };
const shared = { shared: false, sharedSplitPercent: null, settled: false, settledAt: null };

const EMPTY: FinancialPictureInputs = { accounts: [], incomeSources: [], bills: [], subscriptions: [], transactions: [], debts: [], savingsGoals: [] };

const income = (o: object) => ({ ...base, id: "i", name: "Salary", amountMinorUnits: 420000, amountRangeMinorUnits: null, frequency: "monthly", nextExpectedDate: null, confidence: "confirmed", grossOrNet: "net", status: "ready", ...o });
const bill = (o: object) => ({ ...base, ...shared, id: "b", name: "Rent", category: "Housing", amountMinorUnits: 145000, amountRangeMinorUnits: null, isVariable: false, dueRule: null, frequency: "monthly", essential: true, funded: true, status: "ready", ...o });
const sub = (o: object) => ({ ...base, ...shared, id: "s", name: "Streaming", amountMinorUnits: 1500, frequency: "monthly", renewalDate: null, decision: "keep", status: "ready", ...o });
const debt = (o: object) => ({ ...base, id: "d", name: "Visa", type: "creditCard", balanceMinorUnits: 264000, interestRate: 21.9, minimumPaymentMinorUnits: 8500, dueDate: null, promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-01", linkedAccountId: null, status: "ready", ...o });
const goal = (o: object) => ({ ...base, id: "g", name: "Emergency fund", type: "emergencyFund", targetAmountMinorUnits: 1000000, savedAmountMinorUnits: 200000, targetDate: "2027-09-21", recurring: false, linkedAccountId: null, status: "ready", ...o });

const inputs = (o: Partial<Record<keyof FinancialPictureInputs, object[]>>) => ({ ...EMPTY, ...o }) as unknown as FinancialPictureInputs;

describe("deriveMonthLedger", () => {
  it("is null when there is nothing to write down", () => {
    expect(deriveMonthLedger(EMPTY, NOW)).toBeNull();
  });

  it("adds it up: income, then bills, subscriptions and debt minimums, then goals, leaving what is left", () => {
    const ledger = deriveMonthLedger(
      inputs({
        incomeSources: [income({})],
        bills: [bill({}), bill({ id: "b2", name: "Electric", category: "Utilities", amountMinorUnits: 9600 })],
        subscriptions: [sub({})],
        debts: [debt({})],
        savingsGoals: [goal({})],
      }),
      NOW
    )!;
    expect(ledger.incomingTotal).toBe(420000);
    expect(ledger.outgoing.map((l) => [l.label, l.amountMinorUnits])).toEqual([
      ["Housing", 145000],
      ["Utilities", 9600],
      ["Subscriptions", 1500],
      ["Debt minimum payments", 8500],
    ]);
    expect(ledger.outgoingTotal).toBe(145000 + 9600 + 8500 + 1500);
    expect(ledger.setAside).toHaveLength(1);
    expect(ledger.leftOver).toBe(ledger.incomingTotal - ledger.outgoingTotal - ledger.setAsideTotal);
  });

  it("turns weekly pay and a quarterly bill into monthly equivalents", () => {
    const ledger = deriveMonthLedger(
      inputs({ incomeSources: [income({ amountMinorUnits: 30000, frequency: "weekly" })], bills: [bill({ category: "Insurance", amountMinorUnits: 61200, frequency: "quarterly" })] }),
      NOW
    )!;
    expect(ledger.incomingTotal).toBe(Math.round((30000 * 52) / 12));
    expect(ledger.outgoing[0]).toEqual({ label: "Insurance", amountMinorUnits: 20400 });
  });

  it("groups bills by category and calls an uncategorised one 'Other bills'", () => {
    const ledger = deriveMonthLedger(inputs({ bills: [bill({ category: "utilities", amountMinorUnits: 1000 }), bill({ id: "b2", category: "Utilities", amountMinorUnits: 2000 }), bill({ id: "b3", category: "other", amountMinorUnits: 500 })] }), NOW)!;
    expect(ledger.outgoing).toEqual([
      { label: "Utilities", amountMinorUnits: 3000 },
      { label: "Other bills", amountMinorUnits: 500 },
    ]);
  });

  it("names what it could not count instead of dropping it", () => {
    const ledger = deriveMonthLedger(
      inputs({
        incomeSources: [income({}), income({ id: "x", name: "Odd jobs", frequency: "irregular" })],
        bills: [bill({ amountMinorUnits: null })],
        savingsGoals: [goal({ targetDate: null })],
      }),
      NOW
    )!;
    expect(ledger.notes).toEqual([
      "1 irregular income source is not counted.",
      "1 bill has no amount yet and is not counted.",
      "1 savings goal has no usable target date, so nothing is set aside for it.",
    ]);
  });

  it("ignores closed records and cancelled subscriptions", () => {
    const ledger = deriveMonthLedger(inputs({ incomeSources: [income({})], bills: [bill({ status: "archived" })], subscriptions: [sub({ decision: "cancelled" })], debts: [debt({ status: "archived" })] }), NOW)!;
    expect(ledger.outgoing).toEqual([]);
    expect(ledger.leftOver).toBe(420000);
  });

  it("can be negative, and says so with the number rather than hiding it", () => {
    const ledger = deriveMonthLedger(inputs({ incomeSources: [income({ amountMinorUnits: 100000 })], bills: [bill({ amountMinorUnits: 150000 })] }), NOW)!;
    expect(ledger.leftOver).toBe(-50000);
  });
});
