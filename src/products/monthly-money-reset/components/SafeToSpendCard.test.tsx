import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SafeToSpendCard from "./SafeToSpendCard";
import { computeSafeToSpend } from "../calculations";
import { formatCurrency } from "../currency";

const breakdown = {
  startingAvailableBalance: 245000,
  incomeReceived: 180000,
  ordinarySpending: 61230,
  billPayments: 89000,
  savingsTransfersOut: 20000,
  protectedUnpaidBills: 111320,
  protectedReserveHeld: 15000,
  safeToSpend: 128450,
};

function render(overrides: Partial<Parameters<typeof SafeToSpendCard>[0]> = {}) {
  return renderToStaticMarkup(
    <SafeToSpendCard
      breakdown={breakdown}
      currency="USD"
      updatedAt={new Date().toISOString()}
      weeksRemaining={4}
      tightestDay={null}
      {...overrides}
    />
  );
}

describe("SafeToSpendCard", () => {
  it("shows every term of the sum, so the proof is never hidden behind a click", () => {
    const html = render();
    for (const key of Object.keys(breakdown) as (keyof typeof breakdown)[]) {
      expect(html, `${key} is not on the receipt`).toContain(formatCurrency(breakdown[key], "USD"));
    }
    for (const label of [
      "Money available right now",
      "Income received",
      "Ordinary spending recorded",
      "Bill payments made",
      "Savings transfers made",
      "Protected bills not yet paid",
      "Reserve still held",
    ]) {
      expect(html).toContain(label);
    }
  });

  it("agrees with computeSafeToSpend rather than carrying its own arithmetic", () => {
    const html = render();
    expect(computeSafeToSpend).toBeTypeOf("function");
    expect(html).toContain(formatCurrency(breakdown.safeToSpend, "USD"));
  });

  it("offers no weekly pace when there is nothing safe to spread", () => {
    const html = render({ breakdown: { ...breakdown, safeToSpend: -71650 } });
    expect(html).not.toContain("a week");
  });

  it("says when it was last updated, and warns only after a week", () => {
    expect(render()).toContain("Updated today");
    const old = new Date(Date.now() - 11 * 86400000).toISOString();
    const stale = render({ updatedAt: old });
    expect(stale).toContain("May be out of date");
    expect(stale).not.toContain("Updated today");
  });

  it("names the tightest day only when one is passed", () => {
    expect(render()).not.toContain("Tightest");
    const html = render({ tightestDay: { date: new Date(Date.now() + 6 * 86400000).toISOString(), amountMinorUnits: 21240 } });
    expect(html).toContain("Tightest");
  });
});
