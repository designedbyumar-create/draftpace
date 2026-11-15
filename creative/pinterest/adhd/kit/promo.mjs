/**
 * The app-store promo layout of the reference image
 * (pinterest/homeschool/reference-mockup.png), in Personal Finance
 * Companion's forest green: app icon and name at the top, a big two-tone
 * headline, a column of feature rows, a large tilted phone bleeding off
 * the right with a prop at its foot, and the product line at the bottom.
 *
 * The words come from the idea bank: `display` (the headline cut into
 * lines), `highlight` (the lines in the light colour), `appName`,
 * `appTagline` and `features` default to the idea's own. A display line
 * may only use words of the idea's headline, so a promo cannot say
 * anything its source did not.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "./bank.mjs";
import { icon } from "./icons.mjs";
import { phone as phoneFrame } from "./phone.mjs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const ICON = pathToFileURL(path.resolve(import.meta.dirname, "../../../../public/logo/products/alongside/icon-512.png")).href;
const words = (t) => String(t).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean);

/** Three panel moods, all from the product's plum. */
const TONES = {
  plum: { a: "#2c1a24", b: "#4a2d3b", c: "#86586a", hi: "#f6d7a3", tile: "linear-gradient(160deg,#a56f87,#5f3d4b)", soft: "#ecdce3", wave: "#f7f1f3" },
  deep: { a: "#1f1219", b: "#37212d", c: "#5f3d4b", hi: "#f3c6d8", tile: "linear-gradient(160deg,#8a566d,#472b38)", soft: "#e5d3dc", wave: "#f3eaee" },
  berry: { a: "#2b1a30", b: "#4d2f55", c: "#7b5486", hi: "#ffd89a", tile: "linear-gradient(160deg,#a07ab0,#5a3a63)", soft: "#eadcef", wave: "#f6eff8" },
};

const WAVES = [
  "M1000 520 C 760 560, 560 700, 560 960 S 600 1320, 540 1500 L1000 1500 Z",
  "M1000 600 C 800 600, 620 760, 520 1000 S 560 1340, 600 1500 L1000 1500 Z",
  "M1000 470 C 720 540, 600 660, 600 900 S 520 1300, 560 1500 L1000 1500 Z",
];

export function promo({ n, phone, screen, prop = "", tone = "plum", wave = 0, display, highlight, appName, appTagline, features, headSize, extraCss = "" }) {
  const i = idea(n);
  display ??= i.display;
  highlight ??= i.highlight ?? [];
  appName ??= i.appName ?? "ADHD Life Companion";
  appTagline ??= i.appTagline;
  features ??= i.features;
  if (!display?.length) throw new Error(`#${n}: no display lines`);
  if (!features?.length) throw new Error(`#${n}: no features`);
  const head = new Set(words(i.headline));
  for (const line of display) for (const w of words(line)) if (!head.has(w)) throw new Error(`#${n}: display word "${w}" is not in the headline "${i.headline}"`);
  const T = TONES[tone] ?? TONES.plum;
  if (!phone && !screen) throw new Error(`#${n}: give a screen ({src,y0,y1,width,tilt}) or a ready phone`);
  const longest = Math.max(...display.map((l) => l.length));
  const size = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  const headH = Math.round(display.length * size * 1.04);
  // A managed phone sits under the headline, its right edge a little past the page, and runs down behind the band.
  if (screen) {
    const width = screen.width ?? 450;
    const k = width / 390;
    const top = 216 + headH + 40;
    const need = Math.ceil((1420 - top - 61) / k);
    const y1 = Math.max(screen.y1 ?? 0, screen.y0 + need);
    const tilt = screen.tilt ?? 0;
    const lean = Math.round(Math.sin((Math.abs(tilt) * Math.PI) / 180) * (1400 - top));
    const x = screen.x ?? Math.round(1000 - (width + 30) + (tilt < 0 ? lean * 0.8 : -lean * 0.45));
    phone = phoneFrame({ src: screen.src, y0: screen.y0, y1, width, tilt, x, y: top, appBg: screen.appBg });
  }
  const css = `
  .pin{background:linear-gradient(158deg,${T.a} 0%,${T.b} 46%,${T.c} 100%);color:#fff}
  .wave{position:absolute;inset:0;width:1000px;height:1500px}
  .brand{position:absolute;left:64px;top:62px;display:flex;align-items:center;gap:22px}
  .brand img{width:98px;height:98px;border-radius:24px;box-shadow:0 10px 24px rgba(0,0,0,.35)}
  .brand b{display:block;font:700 42px/1.1 "Plex",sans-serif;color:#fff}
  .brand span{display:block;font:400 28px/1.25 "Plex",sans-serif;color:${T.soft};margin-top:4px}
  .display{position:absolute;left:64px;top:216px;width:872px;height:${headH + 14}px;font:700 ${size}px/1.04 "Plex",sans-serif;letter-spacing:-.025em}
  .display div{white-space:nowrap}.display .hi{color:${T.hi}}
  .feats{position:absolute;left:64px;top:${216 + headH + 64}px;width:392px;display:flex;flex-direction:column;gap:24px}
  .feat{display:flex;gap:20px;align-items:flex-start}
  .feat .tile{flex:none;width:78px;height:78px;border-radius:22px;background:${T.tile};display:grid;place-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 8px 18px rgba(0,0,0,.28)}
  .feat b{display:block;font:700 29px/1.15 "Plex",sans-serif;color:#fff}
  .feat span{display:block;font:400 22.5px/1.32 "Plex",sans-serif;color:${T.soft};margin-top:5px}
  .band{position:absolute;left:0;right:0;bottom:0;height:210px;background:linear-gradient(to bottom,rgba(30,18,26,0),rgba(30,18,26,.94) 52%,#1e121a)}
  .foot{z-index:5}
  ${extraCss}`;
  const w = WAVES[wave % WAVES.length];
  const body = `
  <svg class="wave" viewBox="0 0 1000 1500" aria-hidden="true"><defs><linearGradient id="wv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.wave}" stop-opacity=".9"/><stop offset="1" stop-color="${T.wave}" stop-opacity=".62"/></linearGradient></defs>
    <path d="${w}" fill="url(#wv)"/>
    ${[0, 1, 2, 3].map((k) => `<path d="${w}" transform="translate(${26 + k * 24} ${k * 6})" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1.4"/>`).join("")}</svg>
  <div class="brand"><img src="${ICON}" alt=""><div><b>${esc(appName)}</b>${appTagline ? `<span>${esc(appTagline)}</span>` : ""}</div></div>
  <div class="display" data-check="headline">${display.map((l) => `<div class="${highlight.includes(l) ? "hi" : ""}">${esc(l)}</div>`).join("")}</div>
  <div class="feats" data-check="features">${features.map((f) => `<div class="feat"><div class="tile">${icon(f.icon, { size: 44, color: "#fff", weight: "duotone" })}</div><div><b>${esc(f.label)}</b><span>${esc(f.text)}</span></div></div>`).join("")}</div>
  ${phone}
  <div class="band"></div>
  ${prop}
  ${footFor(i, { dark: true })}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: T.a }) };
}
