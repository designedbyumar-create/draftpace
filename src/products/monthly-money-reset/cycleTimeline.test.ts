import { describe, expect, it } from "vitest";
import { computeTightestDay } from "./cycleTimeline";
import type { BillEntry, IncomeEntry } from "./state";

function bill(overrides: Partial<BillEntry> = {}): BillEntry {
  return { id: "bill-1", name: "Rent", amountMinorUnits: 100_00, category: "Housing", protected: true, status: "upcoming", ...overrides };
}

function income(overrides: Partial<IncomeEntry> = {}): IncomeEntry {
  return { id: "inc-1", name: "Paycheck", amountMinorUnits: 100_00, status: "expected", recurring: false, ...overrides };
}

const BREAKDOWN = { safeToSpend: 200_00, protectedUnpaidBills: 0, protectedReserveHeld: 0 };

describe("computeTightestDay", () => {
  it("returns null when nothing dated falls in the remaining cycle", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-10",
      cycleEndDate: "2026-08-31",
      bills: [],
      income: [],
    });
    expect(result).toBeNull();
  });

  it("finds the day an unpaid bill drives the balance below today's figure", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-10",
      cycleEndDate: "2026-08-31",
      bills: [bill({ dueDate: "2026-08-15", amountMinorUnits: 150_00 })],
      income: [],
    });
    expect(result).toEqual({ date: "2026-08-15", amountMinorUnits: 200_00 - 150_00 });
  });

  it("a later paycheck can recover the dip, but the tightest day is still the lowest point reached", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-01",
      cycleEndDate: "2026-08-31",
      bills: [bill({ dueDate: "2026-08-10", amountMinorUnits: 180_00 })],
      income: [income({ expectedDate: "2026-08-20", amountMinorUnits: 300_00 })],
    });
    expect(result).toEqual({ date: "2026-08-10", amountMinorUnits: 200_00 - 180_00 });
  });

  it("ignores a bill already paid", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-01",
      cycleEndDate: "2026-08-31",
      bills: [bill({ status: "paid", dueDate: "2026-08-10", amountMinorUnits: 180_00 })],
      income: [],
    });
    expect(result).toBeNull();
  });

  it("ignores a bill due before today", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-15",
      cycleEndDate: "2026-08-31",
      bills: [bill({ dueDate: "2026-08-10", amountMinorUnits: 180_00 })],
      income: [],
    });
    expect(result).toBeNull();
  });

  it("ignores income already received", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-08-01",
      cycleEndDate: "2026-08-31",
      bills: [],
      income: [income({ status: "received", expectedDate: "2026-08-20", amountMinorUnits: 300_00 })],
    });
    expect(result).toBeNull();
  });

  it("returns null when today is already past the cycle end", () => {
    const result = computeTightestDay({
      breakdown: BREAKDOWN,
      today: "2026-09-05",
      cycleEndDate: "2026-08-31",
      bills: [bill({ dueDate: "2026-08-10" })],
      income: [],
    });
    expect(result).toBeNull();
  });

  it("counts the earmarked protected amount as still-real cash today, not double-subtracted", () => {
    // Safe-to-Spend is 0 with $300 protected/unpaid still sitting in the
    // account: the real starting balance for the projection is $300, not $0.
    const result = computeTightestDay({
      breakdown: { safeToSpend: 0, protectedUnpaidBills: 300_00, protectedReserveHeld: 0 },
      today: "2026-08-01",
      cycleEndDate: "2026-08-31",
      bills: [bill({ dueDate: "2026-08-10", amountMinorUnits: 250_00 })],
      income: [],
    });
    expect(result).toEqual({ date: "2026-08-10", amountMinorUnits: 300_00 - 250_00 });
  });
});
