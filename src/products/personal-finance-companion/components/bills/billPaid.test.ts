import { describe, expect, it } from "vitest";
import type { Bill, BillPayment } from "../../state";
import { isoDateOf, leftToPay, paymentFor, periodOf } from "./billPaid";

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "b1",
    name: "Rent",
    category: "Housing",
    amountMinorUnits: 100000,
    amountRangeMinorUnits: null,
    isVariable: false,
    dueRule: { dayOfMonth: 1 },
    frequency: "monthly",
    essential: true,
    funded: true,
    currency: "USD",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    shared: false,
    sharedSplitPercent: null,
    settled: false,
    settledAt: null,
    ...overrides,
  };
}
const pay = (billId: string, period: string): BillPayment => ({ id: `p-${billId}-${period}`, billId, period, paidOn: `${period}-05` });

describe("periods", () => {
  it("names the month by the device's own calendar, with a zero-padded month", () => {
    expect(periodOf(new Date(2026, 8, 21))).toBe("2026-09");
    expect(periodOf(new Date(2026, 0, 31))).toBe("2026-01");
    expect(isoDateOf(new Date(2026, 8, 5))).toBe("2026-09-05");
  });

  it("a payment counts for its own month only", () => {
    const payments = [pay("b1", "2026-08")];
    expect(paymentFor(payments, "b1", "2026-08")).toBeDefined();
    expect(paymentFor(payments, "b1", "2026-09")).toBeUndefined();
    expect(paymentFor(payments, "b2", "2026-08")).toBeUndefined();
  });
});

describe("leftToPay", () => {
  const rent = bill();
  const power = bill({ id: "b2", name: "Electric", amountMinorUnits: 9600 });

  it("splits monthly bills into paid and left for the month", () => {
    const result = leftToPay([rent, power], [pay("b1", "2026-09")], "2026-09");
    expect(result).toEqual({ leftMinorUnits: 9600, paidMinorUnits: 100000, unknownCount: 0 });
  });

  it("last month's payment does not make this month's bill paid", () => {
    expect(leftToPay([rent], [pay("b1", "2026-08")], "2026-09").leftMinorUnits).toBe(100000);
  });

  it("does not count quarterly or annual bills, or closed ones", () => {
    const quarterly = bill({ id: "q", frequency: "quarterly", amountMinorUnits: 61200 });
    const closed = bill({ id: "c", status: "archived" });
    expect(leftToPay([quarterly, closed], [], "2026-09")).toEqual({ leftMinorUnits: 0, paidMinorUnits: 0, unknownCount: 0 });
  });

  it("reports a monthly bill with no amount instead of guessing", () => {
    expect(leftToPay([bill({ id: "n", amountMinorUnits: null })], [], "2026-09").unknownCount).toBe(1);
  });
});
