import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { personalFinanceCompanionDefinition as definition } from "@/products/personal-finance-companion/definition";
import { balanceAllocation } from "@/products/personal-finance-companion/companion/capability";
import { comparePayoff, formatMonth, payoffInputs } from "@/products/personal-finance-companion/components/debt/payoffPlan";
import { formatCurrency } from "@/lib/currency";
import { BillsScreenMockup, OverviewScreenMockup, PayoffScreenMockup, SAMPLE } from "./personalFinanceCompanionVisuals";

/**
 * The Shop drawings of Personal Finance Companion are recreations, and a
 * recreation that is not checked against what it recreates keeps drawing a
 * product that has moved on. Every phrase drawn is asserted here against
 * the component that really says it, and every figure is asserted against
 * the engine that produces it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "personalFinanceCompanionVisuals.tsx"), "utf8");
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const PFC = "src/products/personal-finance-companion";
const TODAY = `${PFC}/components/TodayView.tsx`;
const BILLS = `${PFC}/components/BillsModule.tsx`;
const PAYOFF = `${PFC}/components/debt/PayoffPanel.tsx`;

const PHRASES: { text: string; from: string[] }[] = [
  { text: "Available to spend", from: [TODAY] },
  { text: "Preliminary", from: [TODAY] },
  { text: "Bills and subscriptions", from: [TODAY] },
  { text: "Debt minimums", from: [TODAY] },
  { text: "Protected", from: [TODAY] },
  { text: "across your accounts", from: [TODAY] },
  { text: "Needs a look", from: [TODAY] },
  { text: "Coming up", from: [TODAY] },
  { text: "Next 14 days", from: [TODAY] },
  { text: "Monthly total", from: [BILLS] },
  { text: "Left to pay this month", from: [BILLS] },
  { text: "What's owed on a schedule", from: [BILLS] },
  { text: "No due date", from: [BILLS] },
  { text: "Due on day", from: [`${PFC}/components/bills/billLogic.ts`] },
  { text: "Records", from: [`${PFC}/components/shared/SectionShell.tsx`] },
  { text: "What you owe, and when it could be gone.", from: [`${PFC}/components/DebtModule.tsx`] },
  { text: "Payoff plan", from: [PAYOFF] },
  { text: "Extra each month", from: [PAYOFF] },
  { text: "Which debt gets the extra", from: [PAYOFF] },
  { text: "Smallest balance first", from: [PAYOFF] },
  { text: "Highest rate first", from: [PAYOFF] },
  { text: "Debt-free in", from: [PAYOFF] },
  { text: "Interest along the way:", from: [PAYOFF] },
  { text: "Paid off", from: [PAYOFF] },
];

describe("Personal Finance Companion's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw the bottom bar the product has, in the order it has it", () => {
    const drawn = [...visuals.matchAll(/\{ label: "(\w+)", Icon: /g)].map((match) => match[1]);
    expect(drawn).toEqual([definition.workspaceLabel, definition.destinationLabels?.start, "Attention", "Records"]);
    expect(definition.primaryNavigation).toEqual(["workspace", "start", "attention", "records"]);
  });

  it("take their colours from the definition, so a re-theme cannot leave them behind", () => {
    expect(visuals).toContain("definition.theme");
    expect(visuals).toContain("theme?.ground?.light");
    expect(visuals).toContain("theme?.hero?.light");
    expect(visuals.match(/#[0-9a-fA-F]{6}\b/g) ?? []).toEqual([]);
  });

  it("work every figure out with the product's own engine", () => {
    for (const fn of ["balanceAllocation", "deriveComingUp", "leftToPay", "comparePayoff", "summarizeBills"]) {
      expect(visuals, `${fn} is no longer what the drawing uses`).toContain(fn);
    }
  });

  it("draw a hero whose four parts add up to the balance it says it came from", () => {
    const a = balanceAllocation(SAMPLE)!;
    expect(a.availableMinorUnits + a.billsAndSubscriptionsMinorUnits + a.debtMinimumsMinorUnits + a.protectedMinorUnits).toBe(a.totalMinorUnits);
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(text).toContain(`From ${formatCurrency(a.totalMinorUnits, "USD")} across your accounts`);
    for (const part of [a.billsAndSubscriptionsMinorUnits, a.debtMinimumsMinorUnits, a.protectedMinorUnits]) {
      expect(text).toContain(formatCurrency(part, "USD"));
    }
    const [whole] = formatCurrency(a.availableMinorUnits, "USD").split(".");
    expect(text).toContain(whole);
  });

  it("draw the first dated things coming, in date order, with the pay day marked", () => {
    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(text.indexOf("Visa minimum")).toBeGreaterThan(-1);
    expect(text.indexOf("Visa minimum")).toBeLessThan(text.indexOf("Internet"));
    expect(text.indexOf("Internet")).toBeLessThan(text.indexOf("Salary"));
    expect(text).toContain("+$4,200.00");
  });

  it("draw the bill that was ticked as paid, and what is left to pay without it", () => {
    const text = visible(renderToStaticMarkup(<BillsScreenMockup />));
    expect(text).toContain("Paid 1 Sep");
    // Rent is ticked, so the monthly bills left are Electric and Internet.
    expect(text).toContain(`Left to pay this month ${formatCurrency(9600 + 4500, "USD")}`);
  });

  it("draw a payoff plan that is the one the simulation gives", () => {
    const { planned } = payoffInputs(SAMPLE.debts);
    const plan = comparePayoff(planned, 10000, new Date(2026, 8, 21, 9)).avalanche;
    const text = visible(renderToStaticMarkup(<PayoffScreenMockup />));
    expect(text).toContain(`Debt-free in ${formatMonth(plan.debtFreeMonth!)}`);
    expect(text).toContain(`Interest along the way: ${formatCurrency(plan.totalInterestMinorUnits, "USD")}`);
    expect(text.indexOf(plan.steps[0].name)).toBeLessThan(text.indexOf(plan.steps[plan.steps.length - 1].name));
  });

  it("never use a word this product refuses, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["bank", " sync"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word);
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
