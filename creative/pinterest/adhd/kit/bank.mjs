/**
 * The idea bank is the source of every word on a pin: a pin module asks
 * for its idea by number and uses its headline, sub and items as written.
 */
import fs from "node:fs";
import path from "node:path";
import { product, foot } from "../../v3/kit.mjs";

const BANK = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../ideas-101.json"), "utf8"));
export const p = product("alongside");

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
  mulberry: p.accent,
  mulberryDeep: p.strong,
  mulberrySoft: p.soft,
  forest: p.accent,
  forestDeep: p.strong,
  forestSoft: p.soft,
  sage: p.accent,
  ink: "#231a1f",
  paper: "#fbf7f8",
  paperLight: "#fffdfd",
  wash: "#f7f1f3",
  rule: "#e3d3da",
  cream: "#f8f1ea",
  oak: "#c99b66",
  kraft: "#c8a679",
  butter: "#f2d98a",
  sky: "#8fb0c8",
  amber: "#d9962b",
};
