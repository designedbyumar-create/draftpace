/**
 * Pinterest v3: what every product's pins share, and nothing else.
 *
 * Each product draws its own world (products/<slug>.mjs) to its own
 * strategy (pinterest/strategy/<slug>.json); this file only gives them a
 * 1000 x 1500 page, the fonts, the product's colours and price from its
 * real definition and listing, and the product line at the foot, so a pin
 * from any product is still recognisably Draftpace.
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "../../..");
const font = (rel) => pathToFileURL(path.join(ROOT, rel)).href;
const FONTSOURCE = "creative/node_modules/@fontsource";

export const W = 1000;
export const H = 1500;

/** Escape text for HTML. Every word on a pin passes through here. */
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The product's name, price and colours, read from its real definition and Shop listing. */
export function product(slug) {
  const listing = fs.readFileSync(path.join(ROOT, "src/shop/products", `${slug}.ts`), "utf8");
  const name = listing.match(/\b(?:title|name):\s*"([^"]+)"/)?.[1];
  const price = Number(listing.match(/\bprice:\s*\{\s*amount:\s*(\d+(?:\.\d+)?)/)?.[1]);
  const definition = fs.readFileSync(path.join(ROOT, "src/products", slug, "definition.ts"), "utf8");
  const pick = (key) => definition.match(new RegExp(`${key}:\\s*"(#[0-9a-fA-F]{6})"`))?.[1];
  if (!name || !price) throw new Error(`${slug}: no name or price in its Shop listing`);
  return { slug, name, price, accent: pick("base") ?? "#17473a", strong: pick("strong") ?? "#0f2f27", soft: pick("soft") ?? "#e4ece8" };
}

const FONTS = `
@font-face{font-family:"Newsreader";src:url("${font("public/fonts/Newsreader.ttf")}")}
@font-face{font-family:"Plex";src:url("${font("public/fonts/IBMPlexSans.ttf")}")}
@font-face{font-family:"Plex Mono";font-weight:400;src:url("${font(`${FONTSOURCE}/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2`)}")}
@font-face{font-family:"Plex Mono";font-weight:500;src:url("${font(`${FONTSOURCE}/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2`)}")}
@font-face{font-family:"Plex Mono";font-weight:600;src:url("${font(`${FONTSOURCE}/ibm-plex-mono/files/ibm-plex-mono-latin-600-normal.woff2`)}")}
@font-face{font-family:"Hand";font-weight:400;src:url("${font(`${FONTSOURCE}/caveat/files/caveat-latin-400-normal.woff2`)}")}
@font-face{font-family:"Hand";font-weight:600;src:url("${font(`${FONTSOURCE}/caveat/files/caveat-latin-600-normal.woff2`)}")}
@font-face{font-family:"Hand";font-weight:700;src:url("${font(`${FONTSOURCE}/caveat/files/caveat-latin-700-normal.woff2`)}")}
`;

const BASE = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.pin{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:var(--paper);color:var(--ink);font-family:"Plex",system-ui,sans-serif}
.serif{font-family:"Newsreader",Georgia,serif}
.mono{font-family:"Plex Mono",ui-monospace,monospace}
.hand{font-family:"Hand",cursive}
.eyebrow{font-family:"Plex";font-weight:600;font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.foot{position:absolute;left:56px;right:56px;bottom:44px;height:76px;display:flex;align-items:center;gap:18px}
.foot .mark{width:56px;height:56px;border-radius:15px;background:var(--accent);display:grid;place-items:center;color:#fff;font:600 30px "Newsreader",serif}
.foot .who{display:flex;flex-direction:column;line-height:1.15}
.foot .who b{font-weight:600;font-size:27px;color:var(--ink)}
.foot .who span{font-size:21px;color:var(--muted)}
.foot .cta{margin-left:auto;padding:14px 26px;border-radius:999px;background:var(--accent);color:#fff;font-weight:600;font-size:25px;white-space:nowrap}
.foot.on-dark .who b{color:#fff}.foot.on-dark .who span{color:rgba(255,255,255,.72)}
.example{display:inline-block;font:600 15px "Plex";letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border:1.5px solid currentColor;border-radius:6px;padding:4px 8px}
`;

/**
 * The product line at the foot: the product's mark, name and draftpace.com,
 * and a guide pin's "Free guide" or a product pin's real price.
 */
export function foot(p, { cta, dark = false } = {}) {
  const label = cta === "guide" ? "Free guide" : `$${p.price} once`;
  return `<div class="foot${dark ? " on-dark" : ""}"><div class="mark">d</div><div class="who"><b>${esc(p.name)}</b><span>draftpace.com</span></div><div class="cta">${esc(label)}</div></div>`;
}

/** A whole pin page. `paper` and `ink` are the pin's ground and text; the product's accent comes from its definition. */
export function page(p, { body, css = "", paper = "#f6f3ee", ink = "#1d1d20", muted = "#66666b" }) {
  const vars = `:root{--accent:${p.accent};--strong:${p.strong};--soft:${p.soft};--paper:${paper};--ink:${ink};--muted:${muted}}`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}${vars}${BASE}${css}</style></head><body><div class="pin">${body}</div></body></html>`;
}
