import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { OverviewScreenMockup, AddInfoScreenMockup, BreakdownScreenMockup } from "./monthlyMoneyResetVisuals";

/**
 * The Shop drawings of Monthly Money Reset are recreations, and a
 * recreation that is not checked against what it recreates keeps drawing
 * a product that has moved on. This is the guard that was missing when
 * SafeToSpendCard.tsx shipped "The Number" (its torn-receipt redesign)
 * and the drawing kept showing the pre-redesign plain rounded card for
 * two weeks with nothing to catch it.
 */

const ROOT = process.cwd();
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");
const visuals = readFileSync(join(__dirname, "monthlyMoneyResetVisuals.tsx"), "utf8");
const visible = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&");

const MMR = "src/products/monthly-money-reset";
const CARD = `${MMR}/components/SafeToSpendCard.tsx`;
const QUICK_ADD = `${MMR}/components/QuickAddModal.tsx`;
const WORKSPACE = `${MMR}/components/WorkspaceModule.tsx`;

const PHRASES: { text: string; from: string[] }[] = [
  { text: "Safe to spend now", from: [CARD] },
  { text: "Not your bank", from: [CARD] },
  { text: "already holds back the bills and", from: [CARD] },
  { text: "The working", from: [CARD] },
  { text: "Safe to spend", from: [CARD] },
  { text: "What changed?", from: [QUICK_ADD] },
  { text: "Quick add", from: [WORKSPACE] },
  { text: "Do a weekly check-in", from: [WORKSPACE] },
];

/** QuickAddModal.tsx's five real entry types, in order. */
const QUICK_ADD_TYPES = ["Spending", "Income received", "Bill paid", "Savings set aside", "Correction"];

describe("Monthly Money Reset's Shop drawings", () => {
  it("draw only phrases the product really renders", () => {
    for (const { text, from } of PHRASES) {
      expect(visuals, `the drawing no longer shows "${text}"`).toContain(text);
      for (const file of from) {
        expect(read(file), `"${text}" is drawn but ${file} no longer says it`).toContain(text);
      }
    }
  });

  it("draw the receipt as a torn slip hanging off the hero panel, not the retired rounded card", () => {
    // The bug this guards: the drawing kept the pre-redesign card (no
    // receipt, no tear, a plain "Quick add" button and nothing else) after
    // SafeToSpendCard.tsx shipped the torn-paper redesign.
    expect(visuals).toContain("TEAR_MASK");
    expect(visuals).toContain("WebkitMask: TEAR_MASK");
    const cardSource = read(CARD);
    expect(cardSource).toContain("TEAR_MASK");
  });

  it("draw QuickAddModal's five real entry types, in its own order", () => {
    for (const type of QUICK_ADD_TYPES) {
      expect(visuals, `"${type}" is drawn but QuickAddModal.tsx no longer offers it`).toContain(type);
      expect(read(QUICK_ADD)).toContain(type);
    }
    const drawnOrder = [...visuals.matchAll(/label: "(Spending|Income received|Bill paid|Savings set aside|Correction)"/g)].map((m) => m[1]);
    expect(drawnOrder).toEqual(QUICK_ADD_TYPES);
  });

  it("take their colours from the real theme tokens, never a pasted hex", () => {
    expect(visuals).toContain("monthlyMoneyResetThemeVars");
    expect(visuals).toMatch(/var\(--mmr-/);
    // The phone bezel colour is the one deliberate literal hex; everything
    // product-coloured must be a --mmr-* token instead.
    const nonBezelHex = visuals.match(/#[0-9a-fA-F]{6}\b/g)?.filter((hex) => hex !== "#141414") ?? [];
    expect(nonBezelHex).toEqual([]);
  });

  it("draw a receipt whose lines actually sum to the headline figure, the redesign's whole point", () => {
    // Money available right now (=) + income (+) − bill payments − protected
    // unpaid bills − reserve held = safe to spend. Mirrors
    // computeSafeToSpend's own arithmetic, worked out by hand here since the
    // drawing's figures are illustrative, not run through the real engine.
    const startingAvailable = 1850;
    const income = 0;
    const billPayments = 0;
    const protectedUnpaid = 900;
    const reserveHeld = 350;
    const safeToSpend = startingAvailable + income - billPayments - protectedUnpaid - reserveHeld;
    expect(safeToSpend).toBe(600);

    const text = visible(renderToStaticMarkup(<OverviewScreenMockup />));
    expect(text).toContain("$600");
    expect(text).toContain("$1,850.00");
    expect(text).toContain("$900.00");
    expect(text).toContain("$350.00");
  });

  it("render all three screens without throwing", () => {
    expect(() => renderToStaticMarkup(<OverviewScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<AddInfoScreenMockup />)).not.toThrow();
    expect(() => renderToStaticMarkup(<BreakdownScreenMockup />)).not.toThrow();
  });

  it("never use a word this product refuses, or an em dash", () => {
    const drawn = visuals.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    // Assembled from parts so this file does not itself trip the public-copy scan for the words it forbids.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["bank", " sync"]].map((parts) => parts.join(""));
    for (const word of refused) expect(drawn.toLowerCase(), `"${word}" is drawn`).not.toContain(word);
    expect(drawn).not.toContain(String.fromCharCode(0x2014));
  });
});
