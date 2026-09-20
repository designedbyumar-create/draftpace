import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Debt } from "../../state";
import { PayoffPlanView } from "./PayoffPanel";
import { comparePayoff, formatMonth } from "./payoffPlan";
import { formatCurrency } from "@/lib/currency";

const NOW = new Date("2026-09-21T09:00:00Z");

function debt(overrides: Partial<Debt> = {}): Debt {
  return {
    id: "d1",
    name: "Visa",
    type: "creditCard",
    balanceMinorUnits: 100000,
    currency: "USD",
    interestRate: 12,
    minimumPaymentMinorUnits: 51000,
    dueDate: null,
    promotionalRate: null,
    promotionalExpiry: null,
    balanceAsOfDate: "2026-09-01",
    linkedAccountId: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}

function render(debts: Debt[], extraText = "0", strategy: "snowball" | "avalanche" = "avalanche") {
  return renderToStaticMarkup(
    <PayoffPlanView debts={debts} strategy={strategy} extraText={extraText} onStrategy={() => {}} onExtraText={() => {}} now={NOW} />
  );
}
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'");

describe("PayoffPlanView", () => {
  it("shows nothing when there are no debts to plan", () => {
    expect(render([])).toBe("");
  });

  it("names the month you are debt-free and each debt's month", () => {
    const text = visible(render([debt()]));
    expect(text).toContain("Debt-free in November 2026");
    expect(text).toContain("Paid off November 2026");
    expect(text).toContain("Interest along the way: $15.00");
  });

  it("leaves a debt with no rate out, by name, instead of guessing", () => {
    const text = visible(render([debt(), debt({ id: "d2", name: "Store card", interestRate: null })]));
    expect(text).toContain("Left out, no interest rate: Store card. Add a rate to include it.");
  });

  it("says so when the payments never clear it", () => {
    const text = visible(render([debt({ interestRate: 24, minimumPaymentMinorUnits: 2000 })]));
    expect(text).toContain("Not paid off within 50 years at these payments");
  });

  it("says which method is cheaper with two debts, and stays quiet with one", () => {
    const small = debt({ id: "s", name: "Small", balanceMinorUnits: 50000, interestRate: 5, minimumPaymentMinorUnits: 2500 });
    const big = debt({ id: "b", name: "Big", balanceMinorUnits: 200000, interestRate: 25, minimumPaymentMinorUnits: 5000 });
    const saved = comparePayoff([small, big], 10000, NOW).savedMinorUnits;
    expect(visible(render([small, big], "100"))).toContain(`Highest rate first costs ${formatCurrency(saved, "USD")} less in interest than smallest balance first.`);
    expect(visible(render([small], "100"))).not.toContain("less in interest");
  });

  it("an extra amount changes the answer", () => {
    const slow = debt({ minimumPaymentMinorUnits: 10000 });
    expect(visible(render([slow], "0"))).not.toBe(visible(render([slow], "50")));
  });

  it("formats a month in words", () => {
    expect(formatMonth("2027-03")).toBe("March 2027");
  });
});
