/**
 * The idea bank is the source of every word on a pin: a pin module asks
 * for its idea by number and uses its headline, sub and items as written.
 */
import fs from "node:fs";
import path from "node:path";
import { product, foot } from "../../v3/kit.mjs";

const BANK = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../ideas-101.json"), "utf8"));
export const p = product("personal-finance-companion");

/** Idea number n of the bank (1-101). */
export function idea(n) {
  const i = BANK.find((x) => x.n === n);
  if (!i) throw new Error(`no idea #${n} in ideas-101.json`);
  return i;
}

/** The product line for this pin: the real price on a product pin, "Free guide" on a guide pin. */
export function footFor(i, opts = {}) {
  return foot(p, { cta: i.link.kind === "guide" ? "guide" : "price", ...opts });
}

/** The product's forest scale (from its definition) and the strategy's props. */
export const C = {
  forest: p.accent,
  forestDeep: p.strong,
  forestSoft: p.soft,
  ink: "#1d1d20",
  paper: "#fafbf9",
  wash: "#eef4f1",
  rule: "#c8d6cd",
  cream: "#f6f3ea",
  oak: "#c99b66",
  kraft: "#c8a679",
  butter: "#f0d58a",
  pink: "#e9a9b4",
  amber: "#d9962b",
};
