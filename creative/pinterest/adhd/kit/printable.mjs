/**
 * The frame for a printed-page mockup pin: the headline from the idea bank
 * (split at its colon into a small title and the large line), the scene
 * the pin supplies, and the product line. The words are the bank's.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p } from "./bank.mjs";

/** Where a scene starts: below the cream header block. A scene fills 372..1366 and a cream footer sits under it. */
export const SCENE_TOP = 372;

export function printable({ n, scene, extraCss = "", paper = "#efe7da", sub = true, headline: customHeadline, bottomMax = 366 }) {
  const i = idea(n);
  const [eyebrow, rest] = i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const big = customHeadline ?? rest;
  const size = big.length > 46 ? 62 : big.length > 30 ? 74 : 86;
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(40,20,5,.28);z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(40,20,5,.28);z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:64px;z-index:6}
  .top h1{font:500 ${size}px/1.03 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:16px;color:#4b4339;max-width:820px}
  ${extraCss}`;
  const body = `
  ${scene}
  <div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${bottomMax}">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(big)}</h1>${sub && i.sub ? `<p>${esc(i.sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper }) };
}
