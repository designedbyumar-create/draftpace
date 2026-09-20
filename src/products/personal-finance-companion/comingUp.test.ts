import { describe, expect, it } from "vitest";
import type { FinancialPictureInputs } from "./companion/capability";
import type { BillPayment } from "./state";
import { deriveComingUp } from "./comingUp";

const base = { currency: "USD", needsReviewReason: null, source: "manual", importSessionId: null, createdAt: "2026-09-01T00:00:00Z", updatedAt: "2026-09-01T00:00:00Z" };
const shared = { shared: false, sharedSplitPercent: null, settled: false, settledAt: null };
const EMPTY: FinancialPictureInputs = { accounts: [], incomeSources: [], bills: [], subscriptions: [], transactions: [], debts: [], savingsGoals: [] };

const bill = (o: object) => ({ ...base, ...shared, id: "b", name: "Rent", category: "Housing", amountMinorUnits: 145000, amountRangeMinorUnits: null, isVariable: false, dueRule: { dayOfMonth: 1 }, frequency: "monthly", essential: true, funded: true, status: "ready", ...o });
const sub = (o: object) => ({ ...base, ...shared, id: "s", name: "Streaming", amountMinorUnits: 1500, frequency: "monthly", renewalDate: null, decision: "keep", status: "ready", ...o });
const income = (o: object) => ({ ...base, id: "i", name: "Salary", amountMinorUnits: 420000, amountRangeMinorUnits: null, frequency: "monthly", nextExpectedDate: null, confidence: "confirmed", grossOrNet: "net", status: "ready", ...o });
const debt = (o: object) => ({ ...base, id: "d", name: "Visa", type: "creditCard", balanceMinorUnits: 264000, interestRate: 21.9, minimumPaymentMinorUnits: 8500, dueDate: null, promotionalRate: null, promotionalExpiry: null, balanceAsOfDate: "2026-09-01", linkedAccountId: null, status: "ready", ...o });
const inputs = (o: Partial<Record<keyof FinancialPictureInputs, object[]>>) => ({ ...EMPTY, ...o }) as unknown as FinancialPictureInputs;
const paid = (billId: string, period: string): BillPayment => ({ id: `p-${billId}-${period}`, billId, period, paidOn: `${period}-02` });

const NOW = new Date(2026, 8, 21, 9, 0);

describe("deriveComingUp", () => {
  it("places a monthly bill on its due day, this month or next, inside the window only", () => {
    const list = deriveComingUp(inputs({ bills: [bill({ id: "a", name: "Rent", dueRule: { dayOfMonth: 1 } }), bill({ id: "b", name: "Internet", dueRule: { dayOfMonth: 26 } }), bill({ id: "c", name: "Electric", dueRule: { dayOfMonth: 15 } })] }), [], NOW);
    expect(list.map((i) => [i.title, i.date])).toEqual([
      ["Internet", "2026-09-26"],
      ["Rent", "2026-10-01"],
    ]);
  });

  it("counts today, and the fourteenth day, but not yesterday or the fifteenth day", () => {
    const list = deriveComingUp(
      inputs({ bills: [bill({ id: "y", name: "Yesterday", dueRule: { dayOfMonth: 20 } }), bill({ id: "t", name: "Today", dueRule: { dayOfMonth: 21 } }), bill({ id: "e", name: "Edge", dueRule: { dayOfMonth: 5 } }), bill({ id: "l", name: "Late", dueRule: { dayOfMonth: 6 } })] }),
      [],
      NOW
    );
    expect(list.map((i) => i.title)).toEqual(["Today", "Edge"]);
  });

  it("a bill ticked paid for its own month leaves the list, and a tick for another month does not", () => {
    const rent = bill({ id: "a", dueRule: { dayOfMonth: 26 } });
    expect(deriveComingUp(inputs({ bills: [rent] }), [paid("a", "2026-09")], NOW)).toEqual([]);
    expect(deriveComingUp(inputs({ bills: [rent] }), [paid("a", "2026-08")], NOW)).toHaveLength(1);
    const nextMonth = bill({ id: "n", dueRule: { dayOfMonth: 1 } });
    expect(deriveComingUp(inputs({ bills: [nextMonth] }), [paid("n", "2026-09")], NOW)).toHaveLength(1);
    expect(deriveComingUp(inputs({ bills: [nextMonth] }), [paid("n", "2026-10")], NOW)).toEqual([]);
  });

  it("clamps a day that the month does not have", () => {
    const list = deriveComingUp(inputs({ bills: [bill({ dueRule: { dayOfMonth: 31 } })] }), [], new Date(2027, 1, 20, 9));
    expect(list.map((i) => i.date)).toEqual(["2027-02-28"]);
  });

  it("uses a bill's specific date, and ignores bills that cannot be placed", () => {
    const list = deriveComingUp(
      inputs({
        bills: [
          bill({ id: "s", name: "Permit", dueRule: { specificDate: "2026-09-30" } }),
          bill({ id: "q", name: "Insurance", frequency: "quarterly", dueRule: { dayOfMonth: 25 } }),
          bill({ id: "n", name: "No date", dueRule: null }),
          bill({ id: "r", name: "Vague", dueRule: { recurrenceDescription: "every other Friday" } }),
        ],
      }),
      [],
      NOW
    );
    expect(list.map((i) => i.title)).toEqual(["Permit"]);
  });

  it("includes subscriptions, pay days and debts that carry a date in the window, oldest first", () => {
    const list = deriveComingUp(
      inputs({
        subscriptions: [sub({ renewalDate: "2026-10-02" })],
        incomeSources: [income({ nextExpectedDate: "2026-09-28" })],
        debts: [debt({ dueDate: "2026-09-24" })],
      }),
      [],
      NOW
    );
    expect(list.map((i) => [i.kind, i.title, i.date, i.amountMinorUnits])).toEqual([
      ["debt", "Visa minimum", "2026-09-24", 8500],
      ["income", "Salary", "2026-09-28", 420000],
      ["subscription", "Streaming renews", "2026-10-02", 1500],
    ]);
  });

  it("leaves out closed records, cancelled subscriptions and dates outside the window", () => {
    const list = deriveComingUp(
      inputs({
        bills: [bill({ status: "archived", dueRule: { dayOfMonth: 25 } })],
        subscriptions: [sub({ renewalDate: "2026-09-25", decision: "cancelled" }), sub({ id: "s2", renewalDate: "2026-12-01" })],
        incomeSources: [income({ nextExpectedDate: "2026-09-10" })],
        debts: [debt({ dueDate: "2026-09-25", status: "archived" })],
      }),
      [],
      NOW
    );
    expect(list).toEqual([]);
  });
});
