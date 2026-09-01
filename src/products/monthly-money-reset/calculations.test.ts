import { describe, expect, it } from "vitest";
import { appendActivity, computeSafeToSpend, markBillPaid, markBillSkipped, weeklyGuideAmount } from "./calculations";
import type { ActivityEntry, BillEntry, IncomeEntry, ReserveItem, SavingsTransfer } from "./state";

function income(overrides: Partial<IncomeEntry> = {}): IncomeEntry {
  return { id: "inc-1", name: "Paycheck", amountMinorUnits: 100_00, status: "expected", recurring: false, ...overrides };
}

function bill(overrides: Partial<BillEntry> = {}): BillEntry {
  return { id: "bill-1", name: "Rent", amountMinorUnits: 100_00, category: "Housing", protected: true, status: "upcoming", ...overrides };
}

function activity(overrides: Partial<ActivityEntry> = {}): ActivityEntry {
  return { id: "act-1", type: "spending", amountMinorUnits: 10_00, date: "2026-08-05", ...overrides };
}

function reserve(overrides: Partial<ReserveItem> = {}): ReserveItem {
  return { id: "res-1", label: "Safety buffer", amountMinorUnits: 50_00, ...overrides };
}

function transfer(overrides: Partial<SavingsTransfer> = {}): SavingsTransfer {
  return { id: "tr-1", amountMinorUnits: 25_00, date: "2026-08-05", ...overrides };
}

function baseInput(overrides: Partial<Parameters<typeof computeSafeToSpend>[0]> = {}) {
  return {
    startingAvailableBalanceMinorUnits: 1000_00,
    income: [],
    activity: [],
    bills: [],
    savingsTransfers: [],
    protectedReserve: [],
    ...overrides,
  };
}

describe("computeSafeToSpend", () => {
  it("no income: equals the starting balance minus spending", () => {
    const result = computeSafeToSpend(baseInput({ activity: [activity({ amountMinorUnits: 100_00 })] }));
    expect(result.safeToSpend).toBe(1000_00 - 100_00);
  });

  it("expected income only: does not affect Safe-to-Spend", () => {
    const result = computeSafeToSpend(baseInput({ income: [income({ status: "expected", amountMinorUnits: 500_00 })] }));
    expect(result.incomeReceived).toBe(0);
    expect(result.safeToSpend).toBe(1000_00);
  });

  it("received income: increases Safe-to-Spend by the full amount", () => {
    const result = computeSafeToSpend(baseInput({ income: [income({ status: "received", amountMinorUnits: 500_00 })] }));
    expect(result.incomeReceived).toBe(500_00);
    expect(result.safeToSpend).toBe(1500_00);
  });

  it("bill changed after setup: the new amount is what's protected", () => {
    const changed = bill({ status: "changed", amountMinorUnits: 150_00 });
    const result = computeSafeToSpend(baseInput({ bills: [changed] }));
    expect(result.protectedUnpaidBills).toBe(150_00);
    expect(result.safeToSpend).toBe(1000_00 - 150_00);
  });

  it("bill marked paid: Safe-to-Spend is unchanged (one subtraction replaces the other)", () => {
    const unpaid = bill({ status: "upcoming", protected: true, amountMinorUnits: 200_00 });
    const before = computeSafeToSpend(baseInput({ bills: [unpaid] }));

    const paidBills = markBillPaid([unpaid], unpaid.id, "2026-08-10");
    const after = computeSafeToSpend(baseInput({ bills: paidBills }));

    expect(before.safeToSpend).toBe(after.safeToSpend);
    expect(after.protectedUnpaidBills).toBe(0);
    expect(after.billPayments).toBe(200_00);
  });

  it("paying an unprotected bill is a new outflow, since it was never in protected-unpaid", () => {
    const unprotected = bill({ protected: false, status: "upcoming", amountMinorUnits: 80_00 });
    const before = computeSafeToSpend(baseInput({ bills: [unprotected] }));
    expect(before.protectedUnpaidBills).toBe(0);
    expect(before.safeToSpend).toBe(1000_00);

    const paid = markBillPaid([unprotected], unprotected.id, "2026-08-10");
    const after = computeSafeToSpend(baseInput({ bills: paid }));
    expect(after.safeToSpend).toBe(1000_00 - 80_00);
  });

  it("skipping a protected bill releases it with no offsetting outflow", () => {
    const unpaid = bill({ status: "upcoming", protected: true, amountMinorUnits: 60_00 });
    const before = computeSafeToSpend(baseInput({ bills: [unpaid] }));
    expect(before.safeToSpend).toBe(1000_00 - 60_00);

    const skipped = markBillSkipped([unpaid], unpaid.id);
    const after = computeSafeToSpend(baseInput({ bills: skipped }));
    expect(after.protectedUnpaidBills).toBe(0);
    expect(after.billPayments).toBe(0);
    expect(after.safeToSpend).toBe(1000_00);
  });

  it("negative Safe-to-Spend: never clamped", () => {
    const result = computeSafeToSpend(baseInput({ activity: [activity({ amountMinorUnits: 5000_00 })] }));
    expect(result.safeToSpend).toBe(1000_00 - 5000_00);
    expect(result.safeToSpend).toBeLessThan(0);
  });

  it("weeklyGuideAmount clamps a negative Safe-to-Spend to zero for display only", () => {
    expect(weeklyGuideAmount(-400_00, 4)).toBe(0);
  });

  it("reserve edited: increases the held-back amount and reduces Safe-to-Spend by exactly that much", () => {
    const before = computeSafeToSpend(baseInput());
    const after = computeSafeToSpend(baseInput({ protectedReserve: [reserve({ amountMinorUnits: 300_00 })] }));
    expect(before.safeToSpend - after.safeToSpend).toBe(300_00);
  });

  it("savings transfer added: subtracted once, never also subtracted as reserve", () => {
    const result = computeSafeToSpend(
      baseInput({ savingsTransfers: [transfer({ amountMinorUnits: 200_00 })], protectedReserve: [] })
    );
    expect(result.savingsTransfersOut).toBe(200_00);
    expect(result.protectedReserveHeld).toBe(0);
    expect(result.safeToSpend).toBe(1000_00 - 200_00);
  });

  it("spending correction: a negative correction adds money back", () => {
    const result = computeSafeToSpend(
      baseInput({
        activity: [activity({ id: "act-1", type: "spending", amountMinorUnits: 100_00 }), activity({ id: "act-2", type: "correction", amountMinorUnits: -40_00 })],
      })
    );
    expect(result.ordinarySpending).toBe(60_00);
    expect(result.safeToSpend).toBe(1000_00 - 60_00);
  });

  it("zero-value entries: contribute nothing without erroring", () => {
    const result = computeSafeToSpend(
      baseInput({
        income: [income({ status: "received", amountMinorUnits: 0 })],
        activity: [activity({ amountMinorUnits: 0 })],
        bills: [bill({ amountMinorUnits: 0, status: "upcoming" })],
      })
    );
    expect(result.safeToSpend).toBe(1000_00);
  });

  it("decimal currencies: integer minor units carry exact cents with no float drift", () => {
    const result = computeSafeToSpend(
      baseInput({
        startingAvailableBalanceMinorUnits: 100_33,
        activity: [activity({ amountMinorUnits: 10_11 }), activity({ amountMinorUnits: 5_07 })],
      })
    );
    expect(result.safeToSpend).toBe(100_33 - 10_11 - 5_07);
    expect(Number.isInteger(result.safeToSpend)).toBe(true);
  });

  it("large values: stays exact well within JS's safe integer range", () => {
    const large = 999_999_999_00;
    const result = computeSafeToSpend(baseInput({ startingAvailableBalanceMinorUnits: large }));
    expect(result.safeToSpend).toBe(large);
    expect(Number.isSafeInteger(result.safeToSpend)).toBe(true);
  });

  it("duplicate action submission: appendActivity is a no-op for a repeated dedupeKey", () => {
    const entry = activity({ id: "act-1", amountMinorUnits: 42_00, dedupeKey: "submit-1" });
    const once = appendActivity([], entry);
    const twice = appendActivity(once, { ...entry, id: "act-1-retry" });

    expect(once).toHaveLength(1);
    expect(twice).toHaveLength(1);
    expect(computeSafeToSpend(baseInput({ activity: twice })).ordinarySpending).toBe(42_00);
  });

  it("duplicate submission without a dedupeKey is applied as a distinct entry (opt-in guard only)", () => {
    const entry = activity({ amountMinorUnits: 10_00 });
    const applied = appendActivity(appendActivity([], entry), { ...entry, id: "act-2" });
    expect(applied).toHaveLength(2);
  });
});

/**
 * Regression coverage for the MMR reliability pass, 2026-08-04: SetupModule's
 * addIncome()/addBill()/addGroup() create an entry with an empty name and a
 * zero amount the instant "Add" is clicked, before the user fills anything
 * in. This locks in that such a draft entry is inert to every calculation
 * until it actually has a real amount — a user must be able to add a row,
 * leave it blank, and navigate away without the Safe-to-Spend figure (or
 * anything derived from it) changing at all.
 */
describe("computeSafeToSpend: draft rows are inert until given a real amount", () => {
  it("a draft (blank name, zero amount) bill matches the result with no bill at all", () => {
    const withoutDraft = computeSafeToSpend(baseInput());
    const draftBill = bill({ name: "", amountMinorUnits: 0, protected: true, status: "upcoming" });
    const withDraft = computeSafeToSpend(baseInput({ bills: [draftBill] }));
    expect(withDraft).toEqual(withoutDraft);
  });

  it("a draft (blank name, zero amount) income entry matches the result with no income at all", () => {
    const withoutDraft = computeSafeToSpend(baseInput());
    const draftIncome = income({ name: "", amountMinorUnits: 0, status: "received" });
    const withDraft = computeSafeToSpend(baseInput({ income: [draftIncome] }));
    expect(withDraft).toEqual(withoutDraft);
  });

  it("a paid draft bill (zero amount) does not change billPayments", () => {
    const withoutDraft = computeSafeToSpend(baseInput());
    const draftBill = bill({ name: "", amountMinorUnits: 0, status: "paid" });
    const withDraft = computeSafeToSpend(baseInput({ bills: [draftBill] }));
    expect(withDraft.billPayments).toBe(withoutDraft.billPayments);
    expect(withDraft.safeToSpend).toBe(withoutDraft.safeToSpend);
  });

  it("only becomes meaningful once a real amount is entered", () => {
    const draftBill = bill({ name: "", amountMinorUnits: 0, status: "upcoming", protected: true });
    const filledInBill = { ...draftBill, name: "Rent", amountMinorUnits: 150_00 };
    const withDraft = computeSafeToSpend(baseInput({ bills: [draftBill] }));
    const withFilledIn = computeSafeToSpend(baseInput({ bills: [filledInBill] }));
    expect(withDraft.protectedUnpaidBills).toBe(0);
    expect(withFilledIn.protectedUnpaidBills).toBe(150_00);
  });
});
