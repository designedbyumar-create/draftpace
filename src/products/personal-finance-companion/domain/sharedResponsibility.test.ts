import { describe, expect, it } from "vitest";
import {
  computeSharedSplit,
  computeSharedResponsibilitySummary,
  type SharedResponsibilityItem,
} from "./sharedResponsibility";

function item(overrides: Partial<SharedResponsibilityItem> = {}): SharedResponsibilityItem {
  return {
    name: "Rent",
    amountMinorUnits: 100_00,
    currency: "USD",
    shared: true,
    sharedSplitPercent: 60,
    settled: false,
    settledAt: null,
    ...overrides,
  };
}

describe("computeSharedSplit", () => {
  it("splits an even amount exactly", () => {
    expect(computeSharedSplit(100_00, 50)).toEqual({ yourShareMinorUnits: 50_00, otherShareMinorUnits: 50_00 });
  });

  it("rounds your share and gives the other party the exact remainder, so the two always sum to the original amount", () => {
    const result = computeSharedSplit(100_01, 60);
    expect(result.yourShareMinorUnits + result.otherShareMinorUnits).toBe(100_01);
  });
});

describe("computeSharedResponsibilitySummary", () => {
  it("excludes an item that isn't shared", () => {
    const summary = computeSharedResponsibilitySummary([item({ shared: false })]);
    expect(summary.sharedItemCount).toBe(0);
    expect(summary.totalsOwedByCurrency).toEqual({});
  });

  it("excludes a shared item still missing an amount or split, rather than treating it as zero", () => {
    const summary = computeSharedResponsibilitySummary([
      item({ amountMinorUnits: null }),
      item({ sharedSplitPercent: null }),
    ]);
    expect(summary.sharedItemCount).toBe(0);
  });

  it("puts a shared, unsettled item in unsettled and counts it toward totalsOwedByCurrency", () => {
    const summary = computeSharedResponsibilitySummary([item({ amountMinorUnits: 100_00, sharedSplitPercent: 60 })]);
    expect(summary.unsettled).toEqual([{ name: "Rent", otherShareMinorUnits: 40_00, currency: "USD" }]);
    expect(summary.settled).toEqual([]);
    expect(summary.totalsOwedByCurrency).toEqual({ USD: 40_00 });
  });

  it("puts a settled item in settled and never counts it toward totalsOwedByCurrency", () => {
    const summary = computeSharedResponsibilitySummary([
      item({ settled: true, settledAt: "2026-09-01T00:00:00.000Z" }),
    ]);
    expect(summary.settled).toEqual([
      { name: "Rent", otherShareMinorUnits: 40_00, currency: "USD", settledAt: "2026-09-01T00:00:00.000Z" },
    ]);
    expect(summary.totalsOwedByCurrency).toEqual({});
  });

  it("sums totalsOwedByCurrency across multiple unsettled items in the same currency", () => {
    const summary = computeSharedResponsibilitySummary([
      item({ name: "Rent", amountMinorUnits: 100_00, sharedSplitPercent: 60 }),
      item({ name: "Internet", amountMinorUnits: 50_00, sharedSplitPercent: 50, settled: true }),
      item({ name: "Groceries", amountMinorUnits: 30_00, sharedSplitPercent: 70 }),
    ]);
    // Rent: other share 40.00, Internet: settled, excluded, Groceries: other share 9.00
    expect(summary.totalsOwedByCurrency).toEqual({ USD: 40_00 + 9_00 });
    expect(summary.sharedItemCount).toBe(3);
  });

  it("never adds two different currencies into the same total", () => {
    const summary = computeSharedResponsibilitySummary([
      item({ name: "Rent", amountMinorUnits: 100_00, currency: "USD", sharedSplitPercent: 60 }),
      item({ name: "Ski trip", amountMinorUnits: 200_00, currency: "EUR", sharedSplitPercent: 50 }),
    ]);
    expect(summary.totalsOwedByCurrency).toEqual({ USD: 40_00, EUR: 100_00 });
  });
});
