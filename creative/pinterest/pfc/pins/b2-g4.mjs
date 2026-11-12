/**
 * Batch 2, group G4: five guide pins at a café table (a newspaper, cups and
 * saucers, pastries, a menu card, a small vase). Every word is the idea
 * bank's own (headline, sub, items, proof) or a label that is real on the
 * thing shown. The module reads the text from the bank and throws if a
 * record is not the one a scene was drawn for.
 *
 *   #47  quote-card   one big lined call-script card on a sage painted table, a phone behind it
 *   #49  measure      a paper ruler strip with three flags across a newspaper spread
 *   #52  question     a card statement with a circled box and a sticky note on a pink table
 *   #39  comparison   a two-column menu card on a forest table, a cup and a vase
 *   #42  scenario     a thick statement and a thin letter on a zinc table, a coin stack, a result strip
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { pencil } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const SHADOW = "0 2px 3px rgba(20,30,20,.28),0 16px 28px rgba(20,30,20,.34)";
const POP = "#c9502f"; // the one warm pop
const check = (cond, msg) => { if (!cond) throw new Error(msg); };
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const nid = (s) => `${s}${++uid}`;
/** Example tag, at 24 px as the brief asks. */
const EXAMPLE = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 11px;background:#fffdf6;${extra}">Example</span>`;

/* ------------------------------------------------------------ surfaces */

/** A painted slatted café table top: boards with thin gaps and a soft light. */
function slats(top, h, base, gap, light = "rgba(255,255,255,.28)") {
  const boards = Array.from({ length: 9 }, (_, k) => `<div style="${at(k * 112 - 4, 0, 4, h, `background:${gap}`)}"></div><div style="${at(k * 112, 0, 108, h, `background:linear-gradient(90deg,rgba(255,255,255,${k % 2 ? 0.05 : 0}),rgba(0,0,0,${k % 2 ? 0 : 0.04}))`)}"></div>`).join("");
  return `<div style="${at(0, top, 1000, h, `background:${base};overflow:hidden`)}">${boards}<div style="${at(0, 0, 1000, h, `background:radial-gradient(circle at 25% 8%,${light},rgba(20,30,20,.2) 100%)`)}"></div></div>`;
}

/** A dark wooden table in forest green, with long grain. */
function forestTable(top, h) {
  const r = rng(11);
  const grain = Array.from({ length: 34 }, () => {
    const y = r() * h;
    return `<path d="M0 ${y.toFixed(0)} C 300 ${(y + (r() - 0.5) * 30).toFixed(0)}, 650 ${(y + (r() - 0.5) * 30).toFixed(0)}, 1000 ${(y + (r() - 0.5) * 20).toFixed(0)}" stroke="#04180f" stroke-opacity="${(0.12 + r() * 0.2).toFixed(2)}" stroke-width="${(1 + r() * 2.4).toFixed(1)}" fill="none"/>`;
  }).join("");
  return `<div style="${at(0, top, 1000, h, "background:#0f3d2f;overflow:hidden")}"><svg style="${at(0, 0, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${grain}</svg><div style="${at(0, 0, 1000, h, "background:radial-gradient(circle at 28% 6%,rgba(120,190,160,.3),rgba(0,0,0,.35) 100%)")}"></div></div>`;
}

/** A zinc-topped bistro table: brushed streaks and a lighter rim glint. */
function zincTable(top, h) {
  const r = rng(5);
  const streaks = Array.from({ length: 70 }, () => {
    const y = r() * h, x = r() * 600, len = 200 + r() * 500;
    return `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${len.toFixed(0)}" height="${(1 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#10202a"}" opacity="${(0.05 + r() * 0.09).toFixed(2)}"/>`;
  }).join("");
  return `<div style="${at(0, top, 1000, h, "background:#4f6b7b;overflow:hidden")}"><svg style="${at(0, 0, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${streaks}</svg><div style="${at(0, 0, 1000, h, "background:radial-gradient(circle at 70% 10%,rgba(255,255,255,.3),rgba(10,25,35,.35) 100%)")}"></div></div>`;
}

/** A newspaper spread filling a rectangle: columns of grey lines, headline bars, picture blocks. No words. */
function newspaper({ x, y, w, h, rot = 0, seed = 2 }) {
  const r = rng(seed);
  const parts = [];
  const mid = w / 2;
  for (const [px0, px1] of [[28, mid - 14], [mid + 14, w - 28]]) {
    const pw = px1 - px0;
    // masthead bar
    parts.push(`<rect x="${px0}" y="26" width="${pw}" height="14" fill="#2b2b2b" opacity=".55"/><rect x="${px0}" y="48" width="${pw}" height="3" fill="#2b2b2b" opacity=".4"/>`);
    let cy = 74;
    while (cy < h - 40) {
      const kind = r();
      if (kind < 0.22) {
        const ph = 120 + r() * 80;
        parts.push(`<rect x="${px0}" y="${cy}" width="${pw}" height="${ph}" fill="#9d9a90" opacity=".55"/><rect x="${px0}" y="${cy}" width="${pw}" height="${ph}" fill="url(#np)" opacity=".5"/>`);
        cy += ph + 16;
      } else {
        const hw = 8 + Math.floor(r() * 2) * 8;
        parts.push(`<rect x="${px0}" y="${cy}" width="${pw * (0.55 + r() * 0.4)}" height="${hw}" fill="#2b2b2b" opacity=".7"/>`);
        cy += hw + 12;
        const cols = 2 + Math.floor(r() * 2);
        const rows = 5 + Math.floor(r() * 6);
        const cw = (pw - (cols - 1) * 12) / cols;
        for (let c = 0; c < cols; c++) {
          for (let k = 0; k < rows; k++) {
            parts.push(`<rect x="${px0 + c * (cw + 12)}" y="${cy + k * 11}" width="${cw * (k === rows - 1 ? 0.5 : 0.86 + r() * 0.14)}" height="4" fill="#3a3a3a" opacity=".42"/>`);
          }
        }
        cy += rows * 11 + 18;
      }
    }
  }
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(90deg,#e6e2d6,#efece2 48%,#d9d5c8 50%,#efece2 52%,#e6e2d6);box-shadow:0 4px 8px rgba(0,0,0,.25),0 24px 40px rgba(0,0,0,.3);overflow:hidden`)}"><svg viewBox="0 0 ${w} ${h}" style="${at(0, 0, w, h)}" aria-hidden="true"><defs><linearGradient id="np" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>${parts.join("")}</svg></div>`;
}

/* ------------------------------------------------------------ props */

/** A cup and saucer from above (coffee, a spoon on the saucer). */
function cup({ x, y, d = 210, rot = 0, coffee = "#5b3a22", ware = "#fbf6ee" }) {
  const id = nid("cup");
  return `<svg style="${at(x, y, d, d, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(20,25,20,.38))`)}" viewBox="0 0 260 260" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ddd3c3"/></radialGradient></defs>
    <circle cx="130" cy="130" r="122" fill="url(#${id})"/><circle cx="130" cy="130" r="122" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <circle cx="130" cy="130" r="96" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <g transform="rotate(-24 130 130)"><rect x="150" y="204" width="86" height="9" rx="4" fill="#c9ccd0"/><ellipse cx="236" cy="208" rx="16" ry="11" fill="#d9dce0"/><rect x="150" y="204" width="86" height="3" rx="2" fill="#fff" opacity=".6"/></g>
    <path d="M196 98 C 252 90 256 164 196 160" fill="none" stroke="${ware}" stroke-width="20" stroke-linecap="round"/>
    <path d="M196 98 C 246 92 248 158 196 156" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="20" stroke-linecap="round"/>
    <circle cx="122" cy="128" r="76" fill="${ware}"/><circle cx="122" cy="128" r="76" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/>
    <circle cx="122" cy="128" r="62" fill="#d9d1c4"/><circle cx="122" cy="130" r="56" fill="${coffee}"/>
    <ellipse cx="104" cy="108" rx="24" ry="16" fill="#fff" opacity=".14"/>
    <path d="M96 138 C 106 120 138 122 140 140 C 126 136 112 148 96 138 Z" fill="#e9cfa6" opacity=".55"/></svg>`;
}

/** A plate with a croissant seen from above. */
function croissant({ x, y, w = 330, rot = 0 }) {
  const id = nid("cr");
  const segs = [];
  const N = 9;
  for (let k = 0; k < N; k++) {
    const t = k / (N - 1);
    const ang = (-62 + 124 * t) * (Math.PI / 180);
    const cx = 150 + Math.sin(ang) * 96;
    const cy = 150 - Math.cos(ang) * 70 + 62;
    const size = 17 + 30 * Math.sin(Math.PI * t) ** 0.8;
    segs.push(`<ellipse cx="${cx.toFixed(1)}" cy="${(cy + 7).toFixed(1)}" rx="${(size * 0.78).toFixed(1)}" ry="${(size * 1.15).toFixed(1)}" transform="rotate(${((ang * 180) / Math.PI).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="#a8641f"/>`);
    segs.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(size * 0.78).toFixed(1)}" ry="${(size * 1.15).toFixed(1)}" transform="rotate(${((ang * 180) / Math.PI).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="url(#${id})"/>`);
    segs.push(`<ellipse cx="${(cx - size * 0.15).toFixed(1)}" cy="${(cy - size * 0.35).toFixed(1)}" rx="${(size * 0.32).toFixed(1)}" ry="${(size * 0.55).toFixed(1)}" transform="rotate(${((ang * 180) / Math.PI).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="#fff" opacity=".22"/>`);
  }
  return `<svg style="${at(x, y, w, w, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(20,25,20,.38))`)}" viewBox="0 0 300 300" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#f0b45e"/><stop offset=".6" stop-color="#d98a30"/><stop offset="1" stop-color="#b9691e"/></radialGradient></defs>
    <circle cx="150" cy="150" r="144" fill="#fbf8f1"/><circle cx="150" cy="150" r="144" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <circle cx="150" cy="150" r="108" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="3"/>
    ${segs.join("")}</svg>`;
}

/** A small round vase from above with three blooms. */
function vase({ x, y, d = 190, rot = 0, bloom = "#e9a9b4", centre = "#f0d58a" }) {
  const heads = [[96, 84, 1], [130, 112, 0.9], [78, 124, 0.85]];
  const petals = (cx, cy, s, k) => Array.from({ length: 7 }, (_, a) => {
    const an = (a * 360) / 7 + k * 20;
    return `<ellipse cx="${cx}" cy="${cy - 20 * s}" rx="${11 * s}" ry="${21 * s}" transform="rotate(${an} ${cx} ${cy})" fill="${bloom}" stroke="#000" stroke-opacity=".08"/>`;
  }).join("") + `<circle cx="${cx}" cy="${cy}" r="${9 * s}" fill="${centre}"/>`;
  return `<svg style="${at(x, y, d, d, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(20,25,20,.38))`)}" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="86" fill="#dcefea" fill-opacity=".7"/><circle cx="100" cy="100" r="86" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="5"/>
    <circle cx="100" cy="100" r="68" fill="#a9d1c3" fill-opacity=".55"/>
    ${[[60, 70, -30], [140, 80, 25], [100, 150, 80], [150, 140, 60], [50, 140, 110]].map(([lx, ly, ra]) => `<ellipse cx="${lx}" cy="${ly}" rx="14" ry="30" transform="rotate(${ra} ${lx} ${ly})" fill="#3f8a63" stroke="#000" stroke-opacity=".12"/>`).join("")}
    ${heads.map(([cx, cy, s], k) => petals(cx, cy, s, k)).join("")}</svg>`;
}

/** A ballpoint pen lying at an angle. */
function pen({ x, y, len = 360, rot = 0, body = C.forest }) {
  return `<svg style="${at(x, y, len, 26, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,25,20,.38))`)}" viewBox="0 0 ${len} 26" aria-hidden="true">
    <rect x="30" y="4" width="${len - 52}" height="18" rx="9" fill="${body}"/><rect x="30" y="4" width="${len - 52}" height="6" rx="3" fill="#fff" opacity=".28"/>
    <rect x="${len - 108}" y="9" width="84" height="5" rx="2.5" fill="#d9d9de"/><rect x="${len - 28}" y="6" width="14" height="14" rx="4" fill="#d9d9de"/>
    <path d="M30 4 L2 13 L30 22 Z" fill="#cfd2d6"/><path d="M8 11 L2 13 L8 15 Z" fill="#1a1a1a"/></svg>`;
}

/** A phone lying face up with a dark screen and a call glyph. */
function phone({ x, y, w = 250, rot = 0, z = 1 }) {
  const h = w * 2.05;
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);border-radius:${w * 0.18}px;background:linear-gradient(150deg,#3b3d44,#1f2025);box-shadow:inset 0 0 0 3px #4a4c55,0 3px 5px rgba(0,0,0,.4),0 26px 36px rgba(15,25,20,.5);z-index:${z}`)}">
    <div style="${at(10, 10, w - 20, h - 20, `border-radius:${w * 0.14}px;background:linear-gradient(170deg,#16493b,#0a1f19);overflow:hidden`)}">
      <div style="${at(0, 0, w - 20, h - 20, "background:radial-gradient(circle at 30% 12%,rgba(255,255,255,.14),transparent 60%)")}"></div>
      <div style="${at(0, 80, w - 20, 100, "display:grid;place-items:center")}"><div style="width:96px;height:96px;border-radius:50%;background:#2f8f64;display:grid;place-items:center;box-shadow:0 0 0 10px rgba(47,143,100,.28)">${icon("phone-call", { size: 54, color: "#fff", weight: "fill" })}</div></div></div>
    <div style="${at(w / 2 - 34, 18, 68, 14, "border-radius:7px;background:#05100c")}"></div></div>`;
}

/** A card statement: a forest header bar and greyed rows (no words, no figures). */
function statement({ x, y, w, h, rot = 0, seed = 3, z = 1, rows = 11 }) {
  const r = rng(seed);
  const lines = Array.from({ length: rows }, (_, k) => `<div style="${at(40, 168 + k * 44, (w - 80) * (0.5 + r() * 0.5), 9, "background:#c4cbc6;border-radius:5px")}"></div><div style="${at(w - 40 - 78, 166 + k * 44, 78, 12, "background:#aeb8b2;border-radius:5px")}"></div>`).join("");
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:#fffefa;border-radius:4px;box-shadow:${SHADOW};z-index:${z};overflow:hidden`)}">
    <div style="${at(0, 0, w, 14, `background:${C.forest}`)}"></div>
    <div style="${at(40, 44, 150, 30, `background:${C.forest};border-radius:7px;opacity:.9`)}"></div>
    <div style="${at(w - 40 - 160, 48, 160, 12, "background:#aeb8b2;border-radius:5px")}"></div><div style="${at(w - 40 - 110, 70, 110, 10, "background:#c4cbc6;border-radius:5px")}"></div>
    <div style="${at(40, 108, w - 80, 3, "background:#dfe5e0")}"></div>
    ${lines}</div>`;
}

/** A sticky note with a strip of tape. */
function sticky({ x, y, w, h, rot = 0, color = "#f6df8f", content = "", z = 3 }) {
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},${color} 80%,#e8cd72);box-shadow:0 2px 3px rgba(40,30,0,.25),0 18px 24px rgba(40,30,0,.3);z-index:${z}`)}">${content}</div>`;
}

/** Coins standing in stacks of different heights (the kit's own look). */
function coinStacks({ x, y, heights = [3, 5, 2], scale = 1 }) {
  const w = (heights.length * 64 + 8) * scale;
  const hmax = Math.max(...heights) * 14 + 30;
  const parts = [];
  heights.forEach((n, s) => {
    const tone = [["#e8c15a", "#c99a2c"], ["#cfd2d4", "#9ba0a4"], ["#d79a62", "#a9693a"]][s % 3];
    for (let k = 0; k < n; k++) {
      const cy = hmax - 14 - k * 14;
      parts.push(`<ellipse cx="${36 + s * 64}" cy="${cy + 6}" rx="28" ry="10" fill="${tone[1]}"/><ellipse cx="${36 + s * 64}" cy="${cy}" rx="28" ry="10" fill="${tone[0]}"/>`);
    }
    parts.push(`<ellipse cx="${36 + s * 64}" cy="${hmax - 14 - (n - 1) * 14 - 1}" rx="19" ry="6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`);
  });
  return `<svg style="${at(x, y, w, hmax * scale, "filter:drop-shadow(0 8px 6px rgba(20,30,20,.35))")}" viewBox="0 0 ${heights.length * 64 + 8} ${hmax}" aria-hidden="true">${parts.join("")}</svg>`;
}

/** A pocket calculator (blank display). */
function calc({ x, y, w = 180, rot = 0 }) {
  const h = w * 1.35;
  const keys = Array.from({ length: 16 }, (_, k) => {
    const c = k % 4, r = Math.floor(k / 4);
    return `<div style="${at(14 + c * ((w - 28) / 4), 86 + r * ((h - 104) / 4), (w - 28) / 4 - 8, (h - 104) / 4 - 8, `border-radius:8px;background:${c === 3 ? "#d9962b" : "#4a4f57"};box-shadow:0 3px 0 #1f2227`)}"></div>`;
  }).join("");
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);border-radius:20px;background:linear-gradient(150deg,#363a42,#1d2025);box-shadow:inset 0 0 0 3px #4d515a,0 3px 5px rgba(0,0,0,.4),0 22px 32px rgba(10,20,25,.5)`)}"><div style="${at(14, 14, w - 28, 56, "border-radius:8px;background:linear-gradient(#b9d9b0,#8fb98a);box-shadow:inset 0 2px 5px rgba(0,0,0,.3)")}"></div>${keys}</div>`;
}

/* ============================================================ #47 quote-card */

function callScript() {
  const n = 47;
  const i = idea(n);
  check(i.items.length === 3 && i.items[0].startsWith("Opening: ") && i.items[1].startsWith("Asking for the fee waiver: ") && i.items[2].startsWith("Closing: "), "#47: the bank's items are not the three call lines");
  const entries = i.items.map((t) => ({ label: t.split(": ")[0], text: t.split(": ").slice(1).join(": ") }));
  const CW = 706, CX = 84, CY = 416, CH = 880;
  const entry = (e, k) => `<div style="margin-top:${k ? 30 : 0}px">
      <div style="height:44px;display:flex;align-items:center;gap:12px;font:600 23px 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.forest}"><span style="flex:none;width:12px;height:12px;border-radius:50%;background:${k === 1 ? POP : C.forest}"></span>${esc(e.label)}</div>
      <div data-check="script line ${k + 1}" class="serif" style="font:500 35px/44px 'Newsreader',Georgia,serif;color:${C.forestDeep};min-height:132px">${esc(e.text)}</div></div>`;
  const card = `<div style="${at(CX, CY, CW, CH, `transform:rotate(-2deg);background:repeating-linear-gradient(180deg,transparent 0 43px,#cfdcd5 43px 45px),#fffdf6;background-position:0 94px;border-radius:10px;box-shadow:0 3px 4px rgba(20,35,25,.3),0 30px 44px rgba(20,35,25,.42);z-index:3;overflow:hidden`)}">
      <div style="${at(0, 0, CW, 14, `background:${C.forest}`)}"></div>
      <div style="${at(66, 0, 3, CH, "background:#e9b3b8;opacity:.8")}"></div>
      <div style="${at(0, 52, CW, 3, "background:#e9b3b8;opacity:.9")}"></div>
      <div style="${at(CW - 164, 66, null, null, "")}">${EXAMPLE()}</div>
      <div style="${at(96, 130, CW - 140, null, "")}">${entries.map(entry).join("")}</div></div>`;
  const scene = `${slats(SCENE_TOP, 982, "#bcd5c5", "rgba(40,70,55,.28)")}
    ${statement({ x: 30, y: 1150, w: 340, h: 330, rot: -5, seed: 7, z: 1 })}
    ${phone({ x: 744, y: 426, w: 230, rot: 9, z: 1 })}
    ${cup({ x: 760, y: 1120, d: 226, rot: 12, coffee: "#6a4429" })}
    ${pen({ x: 800, y: 1000, len: 250, rot: 74 })}
    ${card}`;
  return printable({ n, scene, paper: "#e7efe9" });
}

/* ============================================================ #49 measure */

function daysLate() {
  const n = 49;
  const i = idea(n);
  check(i.items.length === 4 && i.items[0].startsWith("Day 1 to 29:") && i.items[1].startsWith("Day 30:") && i.items[2].startsWith("Day 60 or more:") && i.items[3].startsWith("Paying before day 30"), "#49: the bank's items are not the day lines");
  const dayX = (d) => 110 + (d - 1) * 12.4;
  const SY = 776, SH = 124;
  // ruler strip with a tick per day
  const ticks = Array.from({ length: 72 }, (_, k) => {
    const d = k + 1;
    const x = dayX(d) - 40;
    const big = d % 10 === 0 || d === 1;
    return `<rect x="${x.toFixed(1)}" y="0" width="${big ? 3 : 2}" height="${big ? 34 : d % 5 === 0 ? 24 : 14}" fill="#3b3a35" opacity="${big ? 0.85 : 0.55}"/>`;
  }).join("");
  const strip = `<div style="${at(40, SY, 920, SH, "transform:rotate(-0.6deg);background:linear-gradient(#fbf3d9,#f3e7bd);border-radius:6px;box-shadow:0 3px 4px rgba(0,0,0,.25),0 18px 28px rgba(0,0,0,.35);z-index:2;overflow:hidden")}">
    <svg viewBox="0 0 920 ${SH}" style="${at(0, 0, 920, SH)}" aria-hidden="true">${ticks}</svg>
    ${[[1, "Day 1"], [30, "Day 30"], [60, "Day 60"]].map(([d, t]) => `<div style="${at(dayX(d) - 40 - 70, 50, 140, 40, `text-align:center;font:600 30px 'Plex Mono',monospace;color:${d === 30 ? POP : "#2b2a26"}`)}">${t}</div>`).join("")}
    ${[1, 30, 60].map((d) => `<div style="${at(dayX(d) - 40 - 11, 92, 22, 22, `border-radius:50%;background:${d === 30 ? POP : C.forest};box-shadow:0 2px 3px rgba(0,0,0,.35)`)}"></div>`).join("")}
  </div>`;
  const flagBody = (t, big, light) => {
    const [lead, ...rest] = t.split(": ");
    return `<div data-check="flag ${lead}" style="font:400 ${big}px/1.28 'Plex',sans-serif;color:${light ? "#fff" : C.ink}"><b style="font-weight:700;display:block;margin-bottom:6px;font-size:${big + 4}px;color:${light ? "#fff" : C.forestDeep}">${esc(lead)}</b>${esc(rest.join(": "))}</div>`;
  };
  const pole = (x, y1, y2, c = "#6a4a2a") => `<div style="${at(x - 4, y1, 8, y2 - y1, `background:linear-gradient(90deg,#8a6234,#5d4122);border-radius:4px;box-shadow:0 5px 6px rgba(0,0,0,.35);z-index:3`)}"></div>`;
  const flag1 = `${pole(dayX(1), SY + 100, 1196)}<div style="${at(dayX(1) + 4, 930, 312, 240, `background:#fffdf6;border-radius:4px 12px 12px 4px;box-shadow:${SHADOW};padding:22px 24px;z-index:4;border-left:12px solid ${C.forest}`)}">${flagBody(i.items[0], 27)}</div>`;
  const flag3 = `${pole(dayX(60), SY + 100, 1196)}<div style="${at(dayX(60) - 4 - 332, 930, 332, 262, `background:#fffdf6;border-radius:12px 4px 4px 12px;box-shadow:${SHADOW};padding:22px 24px;z-index:4;border-right:12px solid ${C.forest}`)}">${flagBody(i.items[2], 27)}</div>`;
  const flag2 = `${pole(dayX(30), 438, SY + 20)}<div style="${at(dayX(30) + 4, 438, 372, 268, `background:${POP};color:#fff;border-radius:4px 14px 14px 4px;box-shadow:${SHADOW};padding:24px 28px;z-index:4`)}">${flagBody(i.items[1], 34, true)}<div style="${at(372 - 28 - 140, 216, null, null, "")}">${EXAMPLE("background:transparent;color:#fff;font-size:24px")}</div></div>
    <div style="${at(dayX(30) - 15, 428, 30, 30, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f3d99a,#a9701f);box-shadow:0 4px 5px rgba(0,0,0,.4);z-index:5")}"></div>`;
  const note = `<div style="${at(64, 1218, 640, 112, `background:#fffdf6;border-radius:8px;box-shadow:${SHADOW};z-index:4;padding:16px 26px 16px 34px;display:flex;align-items:center;border-left:12px solid ${C.amber}`)}"><div data-check="closing line" class="serif" style="font:500 32px/1.2 'Newsreader',serif;color:${C.forestDeep}">${esc(i.items[3])}</div></div>`;
  const bank = `<div style="${at(742, 1196, 220, 140, `transform:rotate(8deg);border-radius:16px;background:linear-gradient(135deg,#1c5a46,#0b3226);box-shadow:0 3px 5px rgba(0,0,0,.35),0 22px 28px rgba(0,0,0,.4);z-index:4`)}"><div style="${at(20, 26, 44, 34, "border-radius:7px;background:linear-gradient(135deg,#f0d58a,#c99a2c)")}"></div><div style="${at(20, 100, 150, 8, "border-radius:4px;background:rgba(255,255,255,.35)")}"></div><div style="${at(20, 116, 90, 8, "border-radius:4px;background:rgba(255,255,255,.22)")}"></div></div>`;
  const scene = `${newspaper({ x: -20, y: SCENE_TOP - 6, w: 1040, h: 1000, rot: 0, seed: 4 })}
    ${croissant({ x: 6, y: 388, w: 300, rot: -14 })}${cup({ x: 238, y: 470, d: 210, rot: -20, coffee: "#6a4429" })}
    ${vase({ x: 850, y: 422, d: 160, rot: 20, bloom: "#e9a9b4" })}
    ${flag2}${strip}${flag1}${flag3}${note}${bank}
    ${pencil({ x: 790, y: 1045, len: 250, rot: 90 })}
`;
  return printable({ n, scene, paper: "#ece9df" });
}

/* ============================================================ #52 question */

function thirtySixBox() {
  const n = 52;
  const i = idea(n);
  check(i.items.length === 3 && i.items[0].startsWith("You aren't required") && i.items[1].startsWith("It covers only the balance") && i.items[2].startsWith("New purchases mean"), "#52: the bank's items are not the three answers");
  const W = 620, H = 760, X = 36, Y = 424;
  const r = rng(9);
  const rows = Array.from({ length: 5 }, (_, k) => `<div style="${at(40, 168 + k * 40, (W - 80) * (0.5 + r() * 0.45), 9, "background:#c4cbc6;border-radius:5px")}"></div><div style="${at(W - 40 - 78, 166 + k * 40, 78, 12, "background:#aeb8b2;border-radius:5px")}"></div>`).join("");
  const rows2 = Array.from({ length: 6 }, (_, k) => `<div style="${at(40, 584 + k * 40, (W - 80) * (0.45 + r() * 0.5), 9, "background:#c4cbc6;border-radius:5px")}"></div><div style="${at(W - 40 - 78, 582 + k * 40, 78, 12, "background:#aeb8b2;border-radius:5px")}"></div>`).join("");
  const circle = `<svg style="${at(0, 0, W, H, "pointer-events:none")}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="M44 346 C 40 300 120 286 320 288 C 520 290 610 306 606 372 C 602 436 500 450 318 448 C 150 446 52 430 46 372 C 44 350 66 318 120 304" fill="none" stroke="${C.forest}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/></svg>`;
  const statementSheet = `<div style="${at(X, Y, W, H, `transform:rotate(-3deg);background:#fffefa;border-radius:4px;box-shadow:${SHADOW};z-index:2;overflow:hidden`)}">
    <div style="${at(0, 0, W, 14, `background:${C.forest}`)}"></div>
    <div style="${at(40, 44, 150, 30, `background:${C.forest};border-radius:7px;opacity:.9`)}"></div>
    <div style="${at(W - 40 - 160, 48, 160, 12, "background:#aeb8b2;border-radius:5px")}"></div><div style="${at(W - 40 - 110, 70, 110, 10, "background:#c4cbc6;border-radius:5px")}"></div>
    <div style="${at(40, 108, W - 80, 3, "background:#dfe5e0")}"></div>
    ${rows}
    <div style="${at(40, 330, W - 80, 134, `border:4px solid ${C.forestDeep};border-radius:6px;background:#f3f7f4;padding:20px 26px`)}">
      <div class="serif" style="font:500 54px/1 'Newsreader',serif;color:${C.forestDeep};letter-spacing:-.01em">36 month</div>
      <div style="${at(26, 84, 230, 9, "background:#b6c2bb;border-radius:5px")}"></div><div style="${at(26, 104, 330, 9, "background:#cbd5cf;border-radius:5px")}"></div></div>
    ${rows2}${circle}</div>`;
  const note = sticky({
    x: 654, y: 640, w: 298, h: 540, rot: 3, color: "#f6df8f",
    content: `<div style="${at(110, -20, 120, 40, "background:rgba(255,255,255,.55);transform:rotate(-3deg);box-shadow:0 2px 3px rgba(0,0,0,.15)")}"></div>
      <div class="hand" style="padding:50px 24px 20px 26px;font:600 38px/1.04 'Hand',cursive;color:#2f2a18">${i.items.map((t, k) => `<div style="margin-bottom:${k < 2 ? 26 : 0}px"><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${k === 0 ? POP : C.forest};margin-right:10px;vertical-align:middle"></span>${esc(t)}</div>`).join("")}</div>`,
  });
  const scene = `<div style="${at(0, SCENE_TOP, 1000, 982, "background:radial-gradient(circle at 30% 6%,#f6d9dc,#e8bcc2 60%,#d9a3ab)")}"></div>
    <svg style="${at(0, SCENE_TOP, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><g fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3"><circle cx="500" cy="600" r="560"/><circle cx="500" cy="600" r="640"/></g></svg>
    ${statementSheet}${note}
    ${vase({ x: 760, y: 396, d: 190, rot: 10, bloom: "#fffdf6", centre: "#f0b84a" })}
    ${croissant({ x: -20, y: 1090, w: 340, rot: 18 })}
    ${cup({ x: 330, y: 1146, d: 220, rot: -10, coffee: "#6a4429" })}
    ${pen({ x: 620, y: 1286, len: 340, rot: -4 })}`;
  return printable({ n, scene, paper: "#f6e3e4" });
}

/* ============================================================ #39 comparison */

function menuCompare() {
  const n = 39;
  const i = idea(n);
  check(i.items.length === 8 && i.items[0].startsWith("Snowball:") && i.items[4].startsWith("Avalanche:"), "#39: the bank's items are not the two methods");
  const side = (k0, name, how, rows, stack, head, tone) => `<div style="flex:1;min-width:0;padding:0 8px">
      <div class="serif" style="font:500 70px/1 'Newsreader',serif;letter-spacing:-.02em;color:${C.forestDeep};${tone ? `background:linear-gradient(transparent 62%,#f4d98c 62% 92%,transparent 92%);display:inline-block` : ""}">${esc(name)}</div>
      <div style="margin-top:12px;font:600 31px/1.2 'Plex',sans-serif;color:${head}">${esc(how)}</div>
      <div style="height:150px;margin-top:14px;display:flex;align-items:flex-end">${stack}</div>
      <div style="margin-top:14px;border-top:3px solid ${C.rule}">${rows.map((t, k) => `<div data-check="${name} row ${k + 1}" style="padding:22px 0;border-bottom:3px dotted ${C.rule};display:flex;gap:14px;align-items:flex-start;font:500 33px/1.24 'Plex',sans-serif;color:${C.ink}"><span style="flex:none;margin-top:12px;width:14px;height:14px;border-radius:50%;background:${k === 2 ? POP : C.forest}"></span>${esc(t)}</div>`).join("")}</div></div>`;
  const [sn, sh] = i.items[0].split(": ");
  const [av, ah] = i.items[4].split(": ");
  const card = `<div style="${at(48, 410, 904, 800, `transform:rotate(.6deg);background:#fbf7ea;border-radius:14px;box-shadow:${SHADOW},0 40px 50px -14px rgba(0,0,0,.5);z-index:3;overflow:hidden`)}">
      <div style="${at(0, 0, 904, 16, `background:${C.forest}`)}"></div>
      <div style="${at(452 - 2, 40, 4, 740, `background:repeating-linear-gradient(180deg,${C.forest} 0 10px,transparent 10px 18px)`)};opacity:.35"></div>
      <div style="${at(0, 44, 904, 740, "display:flex;gap:38px;padding:0 40px")}">
        ${side(1, sn, sh, i.items.slice(1, 4), coinStacks({ x: 0, y: 0, heights: [2, 1], scale: 1 }).replace("position:absolute;left:0px;top:0px;", "position:relative;"), C.forest, false)}
        ${side(5, av, ah, i.items.slice(5, 8), coinStacks({ x: 0, y: 0, heights: [8, 6], scale: 1 }).replace("position:absolute;left:0px;top:0px;", "position:relative;"), "#a8661a", true)}
      </div></div>`;
  const scene = `${forestTable(SCENE_TOP, 982)}
    ${card}
    <div style="position:absolute;inset:0;z-index:4">
    ${vase({ x: 36, y: 1150, d: 160, rot: -8, bloom: "#f0d58a", centre: "#c9502f" })}
    ${croissant({ x: 330, y: 1170, w: 290, rot: -24 })}
    ${cup({ x: 760, y: 1150, d: 230, rot: 8, coffee: "#6a4429" })}</div>`;
  return printable({ n, scene, paper: "#e8f0ec" });
}

/* ============================================================ #42 scenario */

function highRateFirst() {
  const n = 42;
  const i = idea(n);
  check(i.items.length === 6 && i.items[0].startsWith("$12,000 card at 26%") && i.items[1].startsWith("$1,500 loan at 6%") && i.items[2] === "$300 extra a month" && i.items[3].startsWith("Snowball:") && i.items[4].startsWith("Avalanche:") && i.items[5].startsWith("Interest along the way"), "#42: the bank's items are not the scenario");
  check(i.proof.includes("$3,978.60") && i.proof.includes("$3,539.84"), "#42: proof lacks the two interest totals");
  const [, snowRest] = i.items[3].split(": ");
  const [, avaRest] = i.items[4].split(": ");
  const interest = i.items[5].split(": ")[0];
  const [snowFig, avaFig] = i.items[5].split(": ")[1].split(" vs ");
  // thick statement: stacked sheets + the card figure
  const thick = `<div style="${at(36, 420, 450, 360, "z-index:2")}">
      ${[16, 11, 6].map((d, k) => `<div style="${at(d, d, 450, 360, `background:#f1efe6;border-radius:5px;box-shadow:0 2px 3px rgba(0,0,0,.2);transform:rotate(${[1.4, -0.9, 0.7][k]}deg)`)}"></div>`).join("")}
      <div style="${at(0, 0, 450, 360, `background:#fffefa;border-radius:5px;box-shadow:${SHADOW};overflow:hidden;transform:rotate(-1.2deg)`)}">
        <div style="${at(0, 0, 450, 14, `background:${C.forest}`)}"></div>
        <div style="${at(30, 40, 170, 26, `background:${C.forest};border-radius:6px;opacity:.9`)}"></div>
        <div style="${at(30, 96, null, null, "")}"><div class="serif" data-check="card figure" style="font:500 92px/1 'Newsreader',serif;color:${C.forestDeep};letter-spacing:-.02em">${esc(i.items[0].match(/\$[\d,]+/)[0])}</div></div>
        <div style="${at(30, 206, 390, null, "")}"><div data-check="card line" style="font:600 29px/1.25 'Plex',sans-serif;color:${C.ink}">${esc(i.items[0].replace(/^\$[\d,]+ /, ""))}</div></div>
        ${[0, 1, 2].map((k) => `<div style="${at(30, 300 + k * 18, 330 - k * 70, 7, "background:#d4dad6;border-radius:4px")}"></div>`).join("")}</div></div>`;
  const thin = `<div style="${at(540, 440, 424, 290, `background:#fffefa;border-radius:5px;box-shadow:${SHADOW};overflow:hidden;transform:rotate(1.6deg);z-index:2`)}">
      <div style="${at(0, 0, 424, 8, `background:${C.butter}`)}"></div>
      <div style="${at(26, 30, 130, 20, "background:#bcc7c1;border-radius:5px")}"></div>
      <div class="serif" data-check="loan figure" style="${at(26, 70, null, null, `font:500 82px/1 'Newsreader',serif;color:${C.forestDeep};letter-spacing:-.02em`)}">${esc(i.items[1].match(/\$[\d,]+/)[0])}</div>
      <div data-check="loan line" style="${at(26, 168, 380, null, "font:600 29px/1.25 'Plex',sans-serif;color:#23262a")}">${esc(i.items[1].replace(/^\$[\d,]+ /, ""))}</div>
      <div style="${at(26, 252, 280, 7, "background:#d4dad6;border-radius:4px")}"></div></div>`;
  // two result tags under the documents
  const tag = (x, w, who, rest, c, tc, rot, ys = 790) => `<div style="${at(x, ys, w, 112, `background:${c};color:${tc};border-radius:12px;box-shadow:0 3px 5px rgba(0,0,0,.3),0 14px 22px rgba(0,0,0,.35);padding:12px 20px;z-index:4;transform:rotate(${rot}deg)`)}"><div data-check="${who} tag" style="font:500 27px/1.2 'Plex',sans-serif"><b style="font-weight:700">${esc(who)}:</b> ${esc(rest)}</div></div>`;
  const tags = tag(36, 440, "Avalanche", avaRest, C.forest, "#fff", -1, 780) + tag(540, 424, "Snowball", snowRest, C.butter, C.forestDeep, 1.2, 756);
  // arrows from the coin stack up to each tag
  const head = (x, y, a) => `<path d="M-18 14 L0 -12 L18 14" transform="translate(${x} ${y}) rotate(${a})" fill="none" stroke="#fffdf6" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
  const arrows = `<svg style="${at(0, 0, 1000, 1500, "z-index:3")}" viewBox="0 0 1000 1500" aria-hidden="true">
      <path d="M418 968 C 380 960 330 946 304 918" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round"/>${head(302, 914, -48)}
      <path d="M582 968 C 630 960 668 936 690 898" fill="none" stroke="#fffdf6" stroke-width="7" stroke-linecap="round"/>${head(692, 894, 30)}</svg>`;
  const extra = `${coinStacks({ x: 410, y: 926, heights: [3, 5, 2], scale: 0.9 })}
    <div class="serif" data-check="extra" style="${at(310, 1034, 380, 62, `z-index:4;background:#fffdf6;border-radius:31px;box-shadow:${SHADOW};display:grid;place-items:center;font:500 40px/1 'Newsreader',serif;color:${C.forestDeep};white-space:nowrap`)}">${esc(i.items[2])}</div>`;
  const strip = `<div style="${at(36, 1118, 928, 160, `background:#fffefa;border-radius:10px;box-shadow:${SHADOW};z-index:4;overflow:hidden`)}">
      <div style="${at(0, 0, 928, 44, `background:${C.forest};color:#fff;display:flex;align-items:center;padding:0 26px;justify-content:space-between`)}"><span style="font:600 24px 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase">${esc(interest)}</span>${EXAMPLE("background:#fffdf6;font-size:24px;padding:2px 10px;color:#4b4339")}</div>
      <div style="${at(0, 44, 464, 116, "padding:14px 26px;border-right:3px dotted #c8d6cd")}"><div style="font:600 25px 'Plex',sans-serif;color:${C.forest}">Snowball</div><div class="serif" data-check="snowball interest" style="font:500 58px/1.05 'Newsreader',serif;color:${C.forestDeep};letter-spacing:-.01em;margin-top:2px">${esc(snowFig)}</div></div>
      <div style="${at(464, 44, 464, 116, "padding:14px 26px")}"><div style="font:600 25px 'Plex',sans-serif;color:#a8661a">Avalanche</div><div class="serif" data-check="avalanche interest" style="font:500 58px/1.05 'Newsreader',serif;color:${POP};letter-spacing:-.01em;margin-top:2px">${esc(avaFig)}</div></div></div>`;
  const scene = `${zincTable(SCENE_TOP, 982)}
    ${thick}${thin}${tags}${arrows}${extra}
    ${calc({ x: 786, y: 900, w: 150, rot: 8 })}
    ${cup({ x: 18, y: 880, d: 180, rot: -10, coffee: "#6a4429" })}
    ${strip}
    ${pen({ x: 560, y: 1296, len: 380, rot: -3 })}`;
  return printable({ n, scene, paper: "#e5ecf0" });
}

export const pins = [callScript(), daysLate(), thirtySixBox(), menuCompare(), highRateFirst()];
