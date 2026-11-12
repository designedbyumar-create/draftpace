/**
 * Batch 2, group G3: five guide pins on the garage workbench.
 *   36 a sage pegboard wall: twelve statements hung on a rail, six paper tags on screws, a mug and a calculator on the bench
 *   38 olive waxed canvas: three script cards fanned, a brass-red handset on the first, a jar of screws, car keys, nuts
 *   41 a slate cinder-block wall: a clipboard checklist leaning on a walnut shelf, a spirit level and a pen
 *   43 pine plywood split by a strip of blue painter's tape: the assumption (debit card, balance slip) against four truth notes
 *   45 diamond-plate steel: a spiral notebook with a six-stop ladder, sticky notes, a pen, a folded statement, a red shop rag
 * Every word is the idea bank's own (headline, sub, items, proof). Words set here that are not a cut of the bank text:
 * the slip on #43 reads "The balance is fine" (the sub's own words), "Example" is the kit tag. Numerals 1-6 on #36, #41 are step numbers.
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const exampleCss = `.example{font-size:24px;letter-spacing:.1em;color:#1d1d20;background:#fffdf6;border:2px solid #1d1d20;padding:5px 12px;border-radius:6px;white-space:nowrap}`;
/** "lead: rest" items of the bank */
const splitColon = (s) => { const k = s.indexOf(": "); return k < 0 ? [null, s] : [s.slice(0, k), s.slice(k + 2)]; };

/* ----------------------------------------------------------------- props */

/** A ballpoint pen lying flat. */
function pen({ x, y, len = 320, rot = 0, body = "#1f3a57", clip = "#c9ccd2", z = 6 }) {
  return `<svg style="${abs(x, y, len, 24, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 5px rgba(20,10,5,.4));z-index:${z}`)}" viewBox="0 0 ${len} 24" aria-hidden="true"><rect x="40" y="3" width="${len - 56}" height="18" rx="8" fill="${body}"/><rect x="40" y="4" width="${len - 56}" height="5" rx="3" fill="#fff" opacity=".28"/><rect x="${len - 120}" y="6" width="100" height="5" rx="2.5" fill="${clip}"/><path d="M40 3 L8 11 L8 13 L40 21 Z" fill="#cfd2d8"/><path d="M12 11 L2 12 L12 13 Z" fill="#222"/></svg>`;
}

/** A blank bank card (chip, no printing). */
function bankCard({ x, y, w = 190, rot = 0, a = C.forest, b = C.forestDeep, stripe = false, z = 3 }) {
  const h = Math.round(w * 0.63);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:${w * 0.07}px;background:linear-gradient(135deg,${a},${b});box-shadow:0 2px 3px rgba(0,0,0,.3),0 14px 20px rgba(10,5,2,.4);z-index:${z};overflow:hidden`)}">
    <div style="${abs(w * 0.09, h * 0.3, w * 0.17, h * 0.2, "border-radius:5px;background:linear-gradient(135deg,#f0d58a,#c79a3b)")}"></div>
    ${stripe ? `<div style="${abs(0, h * 0.14, w, h * 0.2, "background:#15130f")}"></div>` : `<div style="${abs(w * 0.09, h * 0.74, w * 0.5, 5, "border-radius:3px;background:rgba(255,255,255,.35)")}"></div><div style="${abs(w * 0.09, h * 0.84, w * 0.28, 5, "border-radius:3px;background:rgba(255,255,255,.25)")}"></div>`}
    <div style="${abs(-w * 0.2, -h * 0.5, w * 0.9, h * 0.7, "background:linear-gradient(120deg,rgba(255,255,255,.2),rgba(255,255,255,0));transform:rotate(-12deg)")}"></div></div>`;
}

/** A pocket calculator seen from above: blank keys, blank display. */
function calculator({ x, y, w = 150, rot = 0, z = 6 }) {
  const h = Math.round(w * 1.42);
  const keys = Array.from({ length: 20 }, (_, k) => {
    const col = k % 4, row = Math.floor(k / 4);
    const op = col === 3 || row === 0;
    const kw = (w - 36 - 3 * 8) / 4;
    return `<div style="${abs(18 + col * (kw + 8), h * 0.34 + row * (kw * 0.78 + 8), kw, kw * 0.78, `border-radius:7px;background:${op ? "linear-gradient(#f0a64a,#d9822a)" : "linear-gradient(#7c8189,#5b5f66)"};box-shadow:0 3px 0 rgba(0,0,0,.35)`)}"></div>`;
  }).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:16px;background:linear-gradient(150deg,#3b3f45,#23262b);box-shadow:inset 0 0 0 2px #50545b,0 3px 4px rgba(0,0,0,.35),0 18px 22px rgba(20,12,5,.45);z-index:${z}`)}">
    <div style="${abs(16, 16, w - 32, h * 0.2, "border-radius:7px;background:linear-gradient(#c8d6c0,#a9bca2);box-shadow:inset 0 3px 5px rgba(0,0,0,.3)")}"></div>${keys}</div>`;
}

/** A glass jar of screws, side view. */
function screwJar({ x, y, w = 150, z = 6, seed = 5 }) {
  const h = Math.round(w * 1.3);
  const r = seeded(seed);
  const screws = Array.from({ length: 34 }, () => {
    const cx = 22 + r() * 96, cy = 74 + r() * 112, a = r() * 180, L = 22 + r() * 16;
    return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${a.toFixed(0)})"><rect x="${-L / 2}" y="-3" width="${L}" height="6" rx="1" fill="#6f757d"/><rect x="${-L / 2}" y="-7" width="8" height="14" rx="2" fill="#b4bac2" stroke="#4a4f56" stroke-width="1"/><path d="M${-L / 2 + 8} -2 l3 4 M${-L / 2 + 13} -2 l3 4 M${-L / 2 + 18} -2 l3 4" stroke="#6f757d" stroke-width="1" fill="none"/></g>`;
  }).join("");
  return `<svg style="${abs(x, y, w, h, `filter:drop-shadow(0 14px 10px rgba(20,10,5,.5));z-index:${z}`)}" viewBox="0 0 140 182" aria-hidden="true">
    <rect x="12" y="20" width="116" height="156" rx="20" fill="#cfe0dc" opacity=".8"/>${screws}
    <rect x="12" y="20" width="116" height="156" rx="20" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>
    <rect x="22" y="34" width="10" height="120" rx="5" fill="#fff" opacity=".45"/>
    <rect x="20" y="4" width="100" height="26" rx="6" fill="#b9bcc2"/><rect x="20" y="4" width="100" height="8" rx="4" fill="#e6e8eb"/>
    ${Array.from({ length: 12 }, (_, k) => `<rect x="${26 + k * 8}" y="8" width="3" height="18" fill="#7b7f86" opacity=".5"/>`).join("")}</svg>`;
}

/** A car key on a ring: black fob with two buttons, steel blade. Lies along x, then turned by rot. */
function carKey({ x, y, rot = 0, z = 6 }) {
  return `<svg style="${abs(x, y, 230, 86, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,10,5,.5));z-index:${z}`)}" viewBox="0 0 230 86" aria-hidden="true">
    <circle cx="26" cy="43" r="21" fill="none" stroke="#b9bcc2" stroke-width="6"/>
    <rect x="44" y="12" width="92" height="62" rx="22" fill="#26282d"/><rect x="44" y="12" width="92" height="20" rx="10" fill="#40434a" opacity=".8"/>
    <rect x="62" y="30" width="26" height="26" rx="8" fill="#9aa0a8"/><rect x="96" y="30" width="26" height="26" rx="8" fill="#cfa24a"/>
    <path d="M136 36 H218 L226 43 L218 50 H136 Z" fill="#c3c8cf"/><path d="M136 36 H218 L222 40 H136 Z" fill="#fff" opacity=".45"/>
    <path d="M160 50 v7 h8 v-7 M184 50 v5 h8 v-5" fill="#c3c8cf"/></svg>`;
}

/** A hex nut seen from above. */
function nut({ x, y, s = 44, rot = 0, z = 5 }) {
  const pts = Array.from({ length: 6 }, (_, k) => `${(50 + 46 * Math.cos((k * Math.PI) / 3)).toFixed(1)},${(50 + 46 * Math.sin((k * Math.PI) / 3)).toFixed(1)}`).join(" ");
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 4px 3px rgba(20,10,5,.45));z-index:${z}`)}" viewBox="0 0 100 100" aria-hidden="true"><polygon points="${pts}" fill="#aab0b8"/><polygon points="${pts}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4"/><circle cx="50" cy="50" r="19" fill="#2a2c30"/><circle cx="50" cy="50" r="19" fill="none" stroke="#7b8088" stroke-width="3"/></svg>`;
}

/** A yellow spirit level lying flat. */
function spiritLevel({ x, y, len = 560, rot = 0, z = 6 }) {
  const h = 64;
  const vial = (cx, bubble = true) => `<rect x="${cx - 52}" y="14" width="104" height="36" rx="18" fill="#e9f3d0"/><rect x="${cx - 52}" y="14" width="104" height="36" rx="18" fill="none" stroke="#2a2c30" stroke-width="3"/>${bubble ? `<ellipse cx="${cx}" cy="32" rx="16" ry="11" fill="#fff" opacity=".85"/><path d="M${cx - 22} 18 V46 M${cx + 22} 18 V46" stroke="#2a2c30" stroke-width="2"/>` : ""}`;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(10,5,2,.5));z-index:${z}`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
    <rect x="0" y="0" width="${len}" height="${h}" rx="8" fill="#f2c230"/><rect x="0" y="0" width="${len}" height="14" rx="8" fill="#fbe07a" opacity=".7"/><rect x="0" y="${h - 10}" width="${len}" height="10" rx="5" fill="#b8860b" opacity=".45"/>
    <rect x="0" y="0" width="30" height="${h}" rx="8" fill="#26282d"/><rect x="${len - 30}" y="0" width="30" height="${h}" rx="8" fill="#26282d"/>
    ${vial(len / 2)}${vial(len * 0.24, false)}${vial(len * 0.76, false)}
    ${[0.12, 0.38, 0.62, 0.88].map((f) => `<circle cx="${len * f}" cy="32" r="9" fill="#26282d" opacity=".85"/>`).join("")}</svg>`;
}

/** A crossed-out card: a pale card with a thick warm cross over it. */
function expiredCard({ x, y, w = 280, rot = 0, z = 4 }) {
  const h = Math.round(w * 0.63);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">${bankCard({ x: 0, y: 0, w, a: "#f2efe6", b: "#cfc9b8", stripe: true, z: 1 })}
    <svg style="${abs(-14, -14, w + 28, h + 28, "z-index:3;filter:drop-shadow(0 4px 3px rgba(60,20,0,.4))")}" viewBox="0 0 ${w + 28} ${h + 28}" aria-hidden="true"><path d="M30 28 L${w - 2} ${h - 2} M${w - 2} 28 L30 ${h - 2}" stroke="#d9722a" stroke-width="22" stroke-linecap="round"/></svg></div>`;
}

/** A telephone handset, silhouette in one colour: a long handle with an earpiece and a mouthpiece, both with holes. */
function handset({ x, y, w = 130, rot = 0, color = "#d9962b", z = 4 }) {
  const holes = (cx) => [[-8, 0], [0, 0], [8, 0], [-4, 8], [4, 8]].map(([dx, dy]) => `<circle cx="${cx + dx}" cy="${52 + dy}" r="2.6" fill="#fff" opacity=".7"/>`).join("");
  return `<svg style="${abs(x, y, w, w * 0.5, `transform:rotate(${rot}deg);filter:drop-shadow(0 5px 4px rgba(40,20,0,.35));z-index:${z}`)}" viewBox="0 0 160 80" aria-hidden="true">
    <path d="M34 24 C 60 10, 100 10, 126 24" fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round"/>
    <path d="M6 22 Q6 10 20 10 L46 14 Q58 16 56 30 L52 62 Q50 74 36 72 L18 68 Q8 66 8 54 Z" fill="${color}"/>
    <path d="M154 22 Q154 10 140 10 L114 14 Q102 16 104 30 L108 62 Q110 74 124 72 L142 68 Q152 66 152 54 Z" fill="${color}"/>
    ${holes(32)}${holes(128)}
    <path d="M38 17 C 64 6, 96 6, 122 17" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/></svg>`;
}

/* ------------------------------------------------------------------ #36 */

function pin36() {
  const i = idea(36);
  const wall = `<div style="${abs(0, 372, 1000, 1128, "background-color:#c9d3c0;background-image:radial-gradient(circle,rgba(46,58,44,.75) 0 6px,rgba(255,255,255,.6) 6.5px 8.5px,transparent 9px);background-size:48px 48px;background-position:24px 20px")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 20% 14%,rgba(255,255,255,.4),rgba(36,52,38,.3) 100%)")}"></div>`;
  // twelve statements hung on a rail
  const r = seeded(21);
  const rail = `<div style="${abs(34, 386, 932, 18, "background:linear-gradient(#c79a5e,#9a6f3c);border-radius:4px;box-shadow:0 6px 8px rgba(20,35,20,.4);z-index:2")}"></div>`;
  const slips = Array.from({ length: 12 }, (_, k) => {
    const x = 58 + k * 74;
    const rr = (r() - 0.5) * 4;
    return `<div style="${abs(x, 396, 62, 86, `transform:rotate(${rr}deg);transform-origin:50% 0;background:#fdfcf8;box-shadow:0 2px 3px rgba(20,35,20,.35),0 8px 10px rgba(20,35,20,.3);z-index:3`)}">
      <div style="${abs(0, 0, 62, 15, `background:${C.forest}`)}"></div>
      ${[28, 40, 52, 64].map((yy, j) => `<div style="${abs(8, yy, j === 3 ? 26 : 46, 4, "background:#c9c6bc;border-radius:2px")}"></div>`).join("")}
      <div style="${abs(19, -8, 24, 22, "background:linear-gradient(#40434a,#1f2125);border-radius:4px 4px 2px 2px;box-shadow:0 2px 3px rgba(0,0,0,.4)")}"></div></div>`;
  }).join("");
  // six tags, two columns
  const tabs = [C.forest, "#4f8f78", C.butter, C.pink, C.kraft, C.amber];
  const TW = 450, TH = 206, GAPY = 18, TY0 = 528, XS = [40, 510];
  const tags = i.items
    .map((s, k) => {
      const x = XS[k % 2], y = TY0 + Math.floor(k / 2) * (TH + GAPY);
      const [lead, rest] = splitColon(s);
      const rr = [-0.7, 0.6, 0.5, -0.6, -0.5, 0.7][k];
      const tc = tabs[k];
      const screw = (cx) => `<div style="${abs(cx, 10, 16, 16, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#e6e8eb,#8a9098);box-shadow:0 2px 2px rgba(0,0,0,.4)")}"><div style="${abs(2, 7, 12, 2, "background:#4b4f56;transform:rotate(35deg)")}"></div></div>`;
      return `<div style="${abs(x, y, TW, TH, `transform:rotate(${rr}deg);background:#fbf7ea;border-radius:6px;box-shadow:0 2px 3px rgba(20,35,20,.35),0 14px 22px rgba(20,35,20,.38);z-index:3`)}">
        <div style="${abs(0, 0, TW, 36, `background:${tc};border-radius:6px 6px 0 0`)}"></div>${screw(16)}${screw(TW - 32)}
        <div style="${abs(20, 52, 60, 60, `border-radius:50%;background:${C.forest};color:#fff;font:600 36px/60px 'Newsreader',serif;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.2)`)}">${k + 1}</div>
        <div data-check="step" style="${abs(96, 48, TW - 96 - 20, TH - 48 - 14, "display:flex;align-items:center;font:500 27px/1.24 'Plex',sans-serif;color:#1d1d20;overflow:hidden")}"><div>${lead ? `<b style="font-weight:600;color:${C.forestDeep}">${esc(lead)}:</b> ${esc(rest)}` : `<b style="font-weight:600;color:${C.forestDeep}">${esc(rest)}</b>`}</div></div></div>`;
    })
    .join("");
  const bench =
    `<div style="${abs(0, 1196, 1000, 14, "background:linear-gradient(#ead0a2,#c9a068);z-index:2;box-shadow:0 -6px 12px rgba(20,35,20,.3)")}"></div>` +
    `<div style="${abs(0, 1208, 1000, 160, "background:#a47a48")}"></div>` +
    desk({ top: 1208, height: 160, planks: 2, base: "#b98d58", dark: "#a47a48", seed: 17 }) +
    `<div style="${abs(0, 1208, 1000, 160, "background:linear-gradient(rgba(0,0,0,.28),rgba(0,0,0,0) 40%)")}"></div>`;
  const props = calculator({ x: 150, y: 1150, w: 128, rot: -8, z: 6 }) + mug({ x: 690, y: 1176, size: 150 });
  const scene = wall + rail + slips + tags + bench + props;
  return printable({ n: 36, scene, paper: "#eef0e4" });
}

/* ------------------------------------------------------------------ #38 */

function pin38() {
  const i = idea(38);
  const canvas = `<div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 28% 20%,#8b9368,#6f7650 55%,#4f563a)")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background:repeating-linear-gradient(0deg,rgba(0,0,0,.07) 0 2px,rgba(255,255,255,.03) 2px 5px),repeating-linear-gradient(90deg,rgba(0,0,0,.07) 0 2px,rgba(255,255,255,.03) 2px 5px)")}"></div>
    <svg style="${abs(0, 372, 1000, 1128, "opacity:.5;mix-blend-mode:multiply")}" aria-hidden="true"><filter id="wx"><feTurbulence type="fractalNoise" baseFrequency=".02 .35" numOctaves="3" seed="12"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .28  0 0 0 0 .15  0 0 0 .8 0"/></filter><rect width="1000" height="1128" filter="url(#wx)"/></svg>
    <div style="${abs(20, 392, 960, 950, "border:4px dashed rgba(240,226,180,.65);border-radius:10px")}"></div>`;
  const CW = 760, CH = 272, XS = [58, 182, 58], YS = [404, 696, 988], RR = [-2.2, 1.6, -1.3];
  const cards = i.items
    .map((s, k) => {
      const [label] = splitColon(s);
      const quote = i.proof[k + 1];
      return `<div style="${abs(XS[k], YS[k], CW, CH, `transform:rotate(${RR[k]}deg);background:#fbf6e6;border-radius:8px;box-shadow:0 2px 3px rgba(20,25,10,.4),0 18px 26px rgba(20,25,10,.5);z-index:${3 + k}`)}">
        <div style="${abs(0, 0, CW, 12, `background:${C.forest};border-radius:8px 8px 0 0`)}"></div>
        <div style="${abs(36, 28, CW - 72, 66, "display:flex;align-items:center;justify-content:space-between;gap:16px")}">
          <div data-check="label" style="font:600 26px/1.3 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};white-space:nowrap;flex:none">${esc(label)}</div>
          <span class="example" style="margin-left:auto">Example</span>${k === 0 ? `<div style="width:112px;height:66px"></div>` : ""}</div>
        <div data-check="note" style="${abs(36, 110, CW - 72, CH - 110 - 16, `display:flex;align-items:center;font:500 35px/1.2 'Newsreader',serif;color:${C.forestDeep};overflow:hidden`)}">&ldquo;${esc(quote)}&rdquo;</div></div>`;
    })
    .join("");
  const phone = handset({ x: XS[0] + CW - 36 - 120, y: YS[0] + 30, w: 120, rot: -14, z: 4 });
  const props =
    nut({ x: 850, y: 440, s: 54, rot: 10 }) + nut({ x: 905, y: 520, s: 44, rot: 40 }) + nut({ x: 842, y: 560, s: 40, rot: 22 }) +
    carKey({ x: -38, y: 800, rot: 76, z: 7 }) +
    screwJar({ x: 828, y: 1126, w: 150, z: 8 });
  return printable({ n: 38, scene: canvas + cards + phone + props, paper: "#ecead8", extraCss: exampleCss + ".top h1{font-size:70px}" });
}

/* ------------------------------------------------------------------ #41 */

function pin41() {
  const i = idea(41);
  const r = seeded(33);
  const BH = 128, BW = 334;
  let blocks = "";
  for (let row = 0; row < 9; row++) {
    for (let col = -1; col < 4; col++) {
      const x = col * BW + (row % 2 ? BW / 2 : 0) + 4, y = 372 + row * BH + 4;
      const l = 48 + r() * 6;
      blocks += `<div style="${abs(x, y, BW - 8, BH - 8, `background:hsl(208 14% ${l}%);border-radius:3px;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset 0 -3px 5px rgba(0,0,0,.18)`)}"></div>`;
    }
  }
  const wall = `<div style="${abs(0, 372, 1000, 1128, "background:#3f4750;overflow:hidden")}">${blocks.replace(/top:(\d+)px/g, (_, t) => `top:${Number(t) - 372}px`)}</div>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 50% 8%,rgba(255,226,170,.28),rgba(20,26,32,.55) 100%)")}"></div>`;
  const shelf = `<div style="${abs(0, 1268, 1000, 100, "background:linear-gradient(#7a5236,#4d3322 55%,#3b2618);z-index:2;box-shadow:0 -8px 14px rgba(0,0,0,.45)")}"></div>
    <div style="${abs(0, 1268, 1000, 8, "background:rgba(255,220,170,.35);z-index:3")}"></div>`;
  // the checklist sheet, with hand-drawn (unticked) boxes
  const CBX = 110, CBY = 440, CBW = 780, CBH = 830;
  const box = `<svg width="40" height="40" viewBox="0 0 40 40" style="flex:none;margin-top:2px" aria-hidden="true"><path d="M5 6 Q20 3 35 5 Q37 20 35 35 Q20 37 5 35 Q3 20 5 6 Z" fill="#fff" stroke="${C.forestDeep}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  const rows = i.items
    .map((s, k) => `<div style="display:flex;gap:14px;align-items:flex-start">
      <div style="width:36px;flex:none;font:600 36px/40px 'Newsreader',serif;color:${C.forest}">${k + 1}</div>${box}
      <div data-check="step" style="flex:1;font:500 30px/1.28 'Plex',sans-serif;color:${C.forestDeep};text-wrap:balance">${esc(s)}</div></div>`)
    .join(`<div style="height:1px;background:#d6dde2;margin:0 0"></div>`);
  const sheetW = CBW - 84, sheetH = 700;
  const paper = `<div data-check="page" style="${abs(42, 92, sheetW, sheetH, "background:repeating-linear-gradient(#fffefa 0 43px,#dbe5ea 43px 45px);box-shadow:0 2px 4px rgba(0,0,0,.3);overflow:hidden")}">
      <div style="${abs(0, 0, sheetW, 10, `background:${C.forest}`)}"></div>
      <div style="${abs(34, 36, sheetW - 68, 604, "display:flex;flex-direction:column;justify-content:space-between")}">${rows}</div></div>`;
  const clip = `<div style="${abs(CBX, CBY, CBW, CBH, "transform:rotate(-1.2deg);z-index:4")}">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#d3a76a,#b88445);border-radius:20px;box-shadow:0 4px 6px rgba(0,0,0,.4),0 30px 50px rgba(0,0,0,.55)"></div>
    <div style="position:absolute;left:${CBW / 2 - 100}px;top:-26px;width:200px;height:84px;border-radius:14px;background:linear-gradient(#e6e8eb,#9fa4ab);box-shadow:0 6px 10px rgba(0,0,0,.4)"></div>
    <div style="position:absolute;left:${CBW / 2 - 64}px;top:-42px;width:128px;height:36px;border-radius:12px 12px 0 0;background:linear-gradient(#f4f5f7,#b3b7be);box-shadow:0 3px 6px rgba(0,0,0,.3)"></div>
    ${paper}
    ${pen({ x: 340, y: 760, len: 360, rot: -4, body: "#9a3b2e", clip: "#e0b24a", z: 6 })}</div>`;
  const props = spiritLevel({ x: 150, y: 1284, len: 620, rot: -1, z: 6 }) +
    nut({ x: 810, y: 1290, s: 46, rot: 15, z: 6 }) + nut({ x: 868, y: 1304, s: 38, rot: 40, z: 6 });
  return printable({ n: 41, scene: wall + shelf + clip + props, paper: "#e8e9ea" });
}

/* ------------------------------------------------------------------ #43 */

function pin43() {
  const i = idea(43);
  const wood = desk({ top: 372, height: 1128, planks: 1, base: "#e2bd80", dark: "#d4a76c", seed: 8 });
  const sheen = `<div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 70% 30%,rgba(255,255,255,.18),rgba(90,50,10,.22) 100%)")}"></div>`;
  // painter's tape down the middle
  const tape = `<div style="${abs(384, 372, 44, 1000, "background:repeating-linear-gradient(180deg,#5b86b8 0 6px,#6a95c6 6px 12px);box-shadow:0 0 6px rgba(0,0,0,.25);z-index:2;opacity:.93")}"></div>`;
  // left: the assumption
  const debit = bankCard({ x: 52, y: 432, w: 300, rot: -6, z: 4 });
  const slip = `<div style="${abs(58, 650, 300, 330, "transform:rotate(2.4deg);background:#fdfcf8;box-shadow:0 2px 3px rgba(60,30,5,.3),0 14px 20px rgba(60,30,5,.35);z-index:3;clip-path:polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)")}">
    <div style="${abs(0, 0, 300, 14, `background:${C.forest}`)}"></div>
    <div style="${abs(110, 40, 80, 80, "border-radius:50%;background:#dff0e4;display:flex;align-items:center;justify-content:center")}">${icon("check-circle", { size: 70, color: "#2b9a5b", weight: "fill" })}</div>
    <div data-check="note" style="${abs(24, 136, 252, 100, `display:flex;align-items:center;justify-content:center;text-align:center;font:600 32px/1.15 'Newsreader',serif;color:${C.forestDeep};overflow:hidden`)}">The balance is fine</div>
    ${[250, 266, 282].map((yy, j) => `<div style="${abs(24, yy, j === 2 ? 110 : 252, 5, "background:#d0cdc2;border-radius:3px")}"></div>`).join("")}</div>`;
  const expired = expiredCard({ x: 62, y: 1066, w: 280, rot: 5, z: 4 });
  // right: four truth notes on index cards
  const notes = i.items
    .map((s, k) => {
      const m = s.match(/^(.+?\.)\s+(.+)$/);
      const rr = [-0.9, 0.8, -0.6, 0.9][k];
      const txt = m ? `<b style="font-weight:600;color:${C.forestDeep}">${esc(m[1])}</b> ${esc(m[2])}` : `<b style="font-weight:600;color:${C.forestDeep}">${esc(s)}</b>`;
      return `<div data-check="note" style="transform:rotate(${rr}deg);position:relative;background:linear-gradient(#fffdf6 0 44px,transparent 44px),repeating-linear-gradient(#fffdf6 0 33px,#d5e2ea 33px 35px);border-top:5px solid #d9544a;border-radius:4px;box-shadow:0 2px 3px rgba(60,30,5,.3),0 12px 18px rgba(60,30,5,.32);padding:18px 24px 20px;font:500 31px/1.22 'Plex',sans-serif;color:#1d1d20;z-index:3">${txt}</div>`;
    })
    .join("");
  const col = `<div style="${abs(452, 410, 508, 860, "display:flex;flex-direction:column;justify-content:space-between;z-index:3")}">${notes}</div>`;
  return printable({ n: 43, scene: wood + sheen + tape + debit + slip + expired + col, paper: "#f2e8d4" });
}

/* ------------------------------------------------------------------ #45 */

function pin45() {
  const i = idea(45);
  const lz = (x, y, a) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="4.6" transform="rotate(${a} ${x} ${y})" fill="#dfe4e8"/><ellipse cx="${x + 1}" cy="${y + 3}" rx="11" ry="4.6" transform="rotate(${a} ${x} ${y})" fill="#6c757e" opacity=".55"/>`;
  const plate = `<svg style="${abs(0, 372, 1000, 1128)}" viewBox="0 0 1000 1128" aria-hidden="true"><defs>
      <linearGradient id="dp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3ccd2"/><stop offset=".5" stop-color="#9aa6af"/><stop offset="1" stop-color="#7e8a93"/></linearGradient>
      <pattern id="dpp" width="64" height="64" patternUnits="userSpaceOnUse">${lz(16, 16, 45)}${lz(48, 48, -45)}${lz(16, 48, 135 + 90)}${lz(48, 16, 45 + 90)}</pattern></defs>
      <rect width="1000" height="1128" fill="url(#dp)"/><rect width="1000" height="1128" fill="url(#dpp)" opacity=".9"/>
      <rect width="1000" height="1128" fill="url(#dp)" opacity=".25"/></svg>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 25% 18%,rgba(255,255,255,.35),rgba(20,30,40,.3) 100%)")}"></div>`;
  // the notebook
  const NX = 50, NY = 410, NW = 800, NH = 880;
  const stopY = (k) => 62 + k * 136;
  const labels = i.items.map((s) => splitColon(s));
  const sticks = ["#f7de8e", "#f6c9d2", "#cfe6d8", "#f0a03c", "#cfe0ee", "#f7de8e"];
  const stops = labels
    .map(([lab, txt], k) => {
      const y = stopY(k);
      const hot = k === 3;
      const rr = [-0.8, 0.7, -0.5, 0.6, -0.7, 0.5][k];
      return `<div style="${abs(52, y - 2, 36, 36, `border-radius:50%;background:${hot ? C.amber : C.forest};border:5px solid #fff;box-shadow:0 0 0 3px ${hot ? C.amber : C.forest},0 3px 4px rgba(0,0,0,.3);z-index:2`)}"></div>
        <div data-check="label" style="${abs(112, y - 4, NW - 112 - 30, 40, `font:600 30px/40px 'Plex',sans-serif;color:${hot ? "#8a4a00" : C.forestDeep};white-space:nowrap;overflow:hidden`)}">${esc(lab)}</div>
        <div data-check="note" style="${abs(112, y + 38, NW - 112 - 40, 80, `transform:rotate(${rr}deg);background:linear-gradient(${sticks[k]},${sticks[k]});box-shadow:0 2px 3px rgba(0,0,0,.25),0 8px 12px rgba(30,40,50,.28);padding:0 24px;display:flex;align-items:center;font:${hot ? 600 : 500} 27px/1.2 'Plex',sans-serif;color:#2a2418;overflow:hidden;z-index:2`)}">${esc(txt)}</div>`;
    })
    .join("");
  const ladder = `<div style="${abs(67, stopY(0) + 20, 6, stopY(5) - stopY(0), `background:linear-gradient(${C.forest},${C.forestDeep});border-radius:3px`)}"></div>`;
  const rings = Array.from({ length: 19 }, (_, k) => `<div style="${abs(26 + k * 40, -14, 14, 38, "border-radius:7px;background:linear-gradient(90deg,#8a9199,#e3e6e9,#7b8189);box-shadow:0 3px 3px rgba(0,0,0,.35);z-index:3")}"></div><div style="${abs(30 + k * 40, 8, 8, 8, "border-radius:50%;background:#3a3f45;z-index:3")}"></div>`).join("");
  const notebook = `<div data-check="page" style="${abs(NX, NY, NW, NH, "transform:rotate(-1.1deg);background:repeating-linear-gradient(#fffefa 0 45px,#d3e0e8 45px 47px);box-shadow:0 2px 3px rgba(0,0,0,.35),0 28px 46px rgba(10,20,30,.55);z-index:3;border-radius:6px")}">
    <div style="${abs(0, 0, NW, 12, `background:${C.forest};border-radius:6px 6px 0 0`)}"></div>${rings}${ladder}${stops}</div>`;
  // props in the right strip and the corner
  const statement = `<div style="${abs(826, 790, 190, 300, "transform:rotate(4deg);background:#fdfcf8;box-shadow:0 2px 3px rgba(0,0,0,.3),0 14px 20px rgba(10,20,30,.4);z-index:2")}">
      <div style="${abs(0, 0, 190, 66, `background:${C.forest}`)}"></div><div style="${abs(0, 66, 190, 2, "background:rgba(0,0,0,.18)")}"></div>
      <div style="${abs(0, 132, 190, 2, "background:rgba(0,0,0,.14)")}"></div><div style="${abs(0, 200, 190, 2, "background:rgba(0,0,0,.14)")}"></div>
      ${[84, 100, 116, 150, 166, 182, 216, 232, 248].map((yy, j) => `<div style="${abs(18, yy, j % 3 === 2 ? 70 : 120, 5, "background:#c9c6bc;border-radius:3px")}"></div>`).join("")}</div>`;
  const rag = `<svg style="${abs(836, 1232, 200, 106, "filter:drop-shadow(0 12px 10px rgba(10,15,20,.5));z-index:4")}" viewBox="0 0 360 190" aria-hidden="true">
      <path d="M40 40 C 120 6, 230 20, 320 8 L352 120 C 270 150, 160 140, 56 190 Z" fill="#b8352b"/>
      <path d="M40 40 C 120 6, 230 20, 320 8 L330 44 C 230 60, 130 52, 46 84 Z" fill="#d0493d"/>
      <path d="M120 24 C 150 70, 120 120, 170 150 M240 18 C 270 62, 244 100, 290 128" stroke="#7d1f19" stroke-opacity=".5" stroke-width="5" fill="none"/>
      <g fill="#f3d6cf" opacity=".5">${Array.from({ length: 22 }, (_, k) => `<circle cx="${70 + (k % 7) * 40}" cy="${50 + Math.floor(k / 7) * 34 + (k % 2) * 8}" r="3.4"/>`).join("")}</g></svg>`;
  const props = pen({ x: 760, y: 396, len: 340, rot: 90, body: "#26282d", clip: "#d9962b", z: 6 }) +
    nut({ x: 880, y: 1130, s: 46, rot: 20, z: 5 }) + nut({ x: 930, y: 1182, s: 36, rot: 50, z: 5 });
  return printable({ n: 45, scene: plate + statement + notebook + rag + props, paper: "#e6ecef" });
}

export const pins = [pin36(), pin38(), pin41(), pin43(), pin45()];
