/**
 * Group D: garden shed and greenhouse. Home Base product pins #27, #31, #35, #37, #39.
 * Five different surfaces: greenhouse glass (27), a dark weathered potting bench (31),
 * a whitewashed shed wall over an oak bench (35), a sage-painted shed door with a key
 * on a nail (37) and a terracotta-tinted bench with seed trays (39).
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { bookPage, screen } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, sheet } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const ASPECT = 2200 / 1700;

/* ---------- props (flat vector, soft shadows) ---------- */

/** A terracotta pot, optionally with a seedling. */
function clayPot({ x, y, w = 200, plant = true, rot = 0 }) {
  const h = w * 1.05;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(40,20,5,.35))`)}" viewBox="0 0 200 210" aria-hidden="true">
  ${plant ? `<g><path d="M100 70 C100 40 98 24 96 12" stroke="#3f6b4a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M98 38 C70 38 52 22 46 4 C74 4 92 16 98 38Z" fill="#5d9168"/><path d="M99 30 C124 30 146 18 154 -2 C126 -4 104 6 99 30Z" fill="#4f7a5c"/><path d="M100 70 C128 66 140 52 142 40 C120 40 104 52 100 70Z" fill="#6aa377"/></g>` : ""}
  <path d="M26 74 H174 V100 H26Z" fill="#c4683f"/><path d="M26 74 H174 V84 H26Z" fill="#dc8458"/>
  <path d="M38 100 H162 L148 198 Q147 206 138 206 H62 Q53 206 52 198Z" fill="#b95a33"/><path d="M38 100 H162 L159 124 H41Z" fill="#000" opacity=".08"/>
  <path d="M60 106 L68 198" stroke="#e59a70" stroke-width="7" opacity=".5" stroke-linecap="round"/>
  <ellipse cx="100" cy="76" rx="70" ry="7" fill="#4a2e1c"/></svg>`;
}

/** A pair of canvas gardening gloves with sage cuffs. */
function gloves({ x, y, size = 260, rot = -12 }) {
  const glove = (dx, dy, r, flip) => `<g transform="translate(${dx} ${dy}) rotate(${r}) ${flip ? "scale(-1 1) translate(-100 0)" : ""}">
    <rect x="22" y="96" width="56" height="34" rx="6" fill="${C.sage}"/><rect x="22" y="96" width="56" height="9" rx="4" fill="#fff" opacity=".2"/>
    <path d="M18 100 V52 Q18 44 26 44 H30 V18 Q30 8 38 8 Q46 8 46 18 V40 H48 V10 Q48 0 56 0 Q64 0 64 10 V40 H66 V14 Q66 5 73 5 Q81 5 81 14 V44 H84 V30 Q84 22 91 22 Q98 22 98 30 V84 Q98 100 80 100 H34 Q18 100 18 100Z" fill="#d6b784"/>
    <path d="M18 66 H98" stroke="#a98a58" stroke-width="2" opacity=".5"/><path d="M28 44 Q50 54 98 50" stroke="#fff" stroke-width="3" opacity=".25" fill="none"/></g>`;
  return `<svg style="${abs(x, y, size, size * 0.7, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(40,20,5,.38))`)}" viewBox="0 0 200 140" aria-hidden="true">${glove(0, 6, -6, false)}${glove(98, 10, 8, true)}</svg>`;
}

/** A ball of jute twine with a loose end. */
function twine({ x, y, size = 150 }) {
  const lines = Array.from({ length: 9 }, (_, k) => `<path d="M${20 + k * 3} ${40 + k * 9} Q 80 ${20 + k * 10} ${130 - k * 3} ${52 + k * 8}" stroke="#8e6a38" stroke-width="3" fill="none" opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 12px 8px rgba(40,20,5,.35))")}" viewBox="0 0 160 160" aria-hidden="true">
  <circle cx="76" cy="76" r="62" fill="#c9a468"/><circle cx="76" cy="76" r="62" fill="none" stroke="#8e6a38" stroke-width="2" opacity=".4"/>${lines}
  <ellipse cx="54" cy="52" rx="26" ry="16" fill="#fff" opacity=".16"/><path d="M118 112 C 140 128 120 146 150 150" stroke="#b08a4e" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
}

/** A black seed tray of 4 x 3 cells; some cells sprout. */
function seedTray({ x, y, w = 380, rot = 0, sprouts = [1, 4, 5, 8, 10] }) {
  const h = w * 0.74;
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const cx = 18 + c * 86, cy = 18 + r * 70, k = r * 4 + c;
    cells.push(`<rect x="${cx}" y="${cy}" width="76" height="60" rx="6" fill="#26231f"/><rect x="${cx + 5}" y="${cy + 5}" width="66" height="50" rx="4" fill="#4a3526"/>`);
    if (sprouts.includes(k)) cells.push(`<path d="M${cx + 38} ${cy + 46} V${cy + 26}" stroke="#4f8a5a" stroke-width="4" stroke-linecap="round"/><path d="M${cx + 38} ${cy + 30} C ${cx + 24} ${cy + 30} ${cx + 18} ${cy + 20} ${cx + 18} ${cy + 14} C ${cx + 30} ${cy + 14} ${cx + 38} ${cy + 20} ${cx + 38} ${cy + 30}Z" fill="#6aa377"/><path d="M${cx + 38} ${cy + 28} C ${cx + 52} ${cy + 28} ${cx + 60} ${cy + 18} ${cx + 58} ${cy + 10} C ${cx + 46} ${cy + 12} ${cx + 38} ${cy + 18} ${cx + 38} ${cy + 28}Z" fill="#4f7a5c"/>`);
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 12px rgba(40,20,5,.4))`)}" viewBox="0 0 364 270" aria-hidden="true"><rect width="364" height="228" rx="14" fill="#34302b"/><rect x="4" y="4" width="356" height="220" rx="11" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>${cells.join("")}</svg>`;
}

/** A sage-green metal watering can. */
function wateringCan({ x, y, size = 260, rot = 0 }) {
  return `<svg style="${abs(x, y, size, size * 0.85, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 10px rgba(40,20,5,.38))`)}" viewBox="0 0 260 220" aria-hidden="true">
  <path d="M40 90 L12 30 L30 24 L60 82Z" fill="#6f9a7a"/><ellipse cx="14" cy="26" rx="14" ry="9" fill="#4f7a5c" transform="rotate(-24 14 26)"/>
  <path d="M60 60 C 110 4 190 4 214 60" fill="none" stroke="#3e6249" stroke-width="12" stroke-linecap="round"/>
  <path d="M196 80 C 250 70 252 170 196 170" fill="none" stroke="#3e6249" stroke-width="12" stroke-linecap="round"/>
  <path d="M50 70 H200 L190 200 Q188 210 178 210 H72 Q62 210 60 200Z" fill="#7fa98a"/><path d="M50 70 H200 L197 98 H53Z" fill="#9cc2a5"/>
  <path d="M82 104 L90 200" stroke="#fff" stroke-opacity=".28" stroke-width="9" stroke-linecap="round"/><ellipse cx="125" cy="70" rx="75" ry="9" fill="#3e6249"/></svg>`;
}

/** A brass ring with a shed key and a house key. */
function keys({ x, y, size = 260, rot = 0 }) {
  return `<svg style="${abs(x, y, size, size * 1.3, `transform:rotate(${rot}deg);transform-origin:50% 8%;filter:drop-shadow(0 16px 10px rgba(30,20,5,.45))`)}" viewBox="0 0 200 260" aria-hidden="true">
  <circle cx="100" cy="16" r="9" fill="#2b2118"/><circle cx="100" cy="46" r="30" fill="none" stroke="#d6d9dc" stroke-width="7"/><circle cx="100" cy="46" r="30" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
  <g transform="rotate(-18 100 70)"><circle cx="100" cy="86" r="21" fill="#c9962f"/><circle cx="100" cy="86" r="9" fill="#7d8a7f"/><rect x="94" y="106" width="12" height="108" rx="3" fill="#c9962f"/><path d="M106 180 H128 V192 H106ZM106 198 H122 V210 H106Z" fill="#c9962f"/><rect x="94" y="106" width="5" height="108" fill="#fff" opacity=".28"/></g>
  <g transform="rotate(20 100 70)"><rect x="76" y="76" width="48" height="42" rx="12" fill="#a9afb4"/><circle cx="100" cy="97" r="9" fill="#7d8a7f"/><rect x="94" y="118" width="12" height="92" rx="3" fill="#a9afb4"/><path d="M106 160 H124 V172 H106ZM106 182 H120 V194 H106Z" fill="#a9afb4"/><rect x="94" y="118" width="5" height="92" fill="#fff" opacity=".35"/></g></svg>`;
}

/** A kraft tag with text. */
const tag = (text, { x, y, w, size = 30, rot = 0, bg = "#ddc196", color = C.ink, extra = "" }) =>
  `<div style="${abs(x, y, w, "auto", `min-height:64px;transform:rotate(${rot}deg);background:${bg};color:${color};border-radius:10px;padding:14px 22px;font:600 ${size}px/1.15 'Plex',sans-serif;box-shadow:0 3px 4px rgba(40,20,5,.3),0 16px 24px rgba(40,20,5,.3);${extra}`)}">${text}</div>`;

/**
 * A crop of a real page with optional overlay (outline rings drawn around printed text, never on it).
 * crop is fractions of the page; overlay(fx, fy) maps page fractions to container px.
 */
function pageCrop({ n, x, y, w, tilt = 0, crop, rings = [], ringColor = C.sage, ringW = 5 }) {
  const cw = crop.x1 - crop.x0, ch = crop.y1 - crop.y0;
  const h = Math.round(w * ASPECT * (ch / cw));
  const iw = w / cw;
  const px = (fx) => ((fx - crop.x0) / cw) * w;
  const py = (fy) => ((fy - crop.y0) / ch) * h;
  const svg = rings.map((r) => {
    const x0 = px(r[0]), x1 = px(r[2]), y0 = py(r[1]), y1 = py(r[3]);
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
    // a slightly open, hand-drawn looking loop
    return `<path d="M${cx - rx * 0.96} ${cy - ry * 0.3} C ${cx - rx} ${cy - ry * 1.25} ${cx + rx * 0.7} ${cy - ry * 1.3} ${cx + rx * 0.98} ${cy - ry * 0.2} C ${cx + rx * 1.1} ${cy + ry * 1.2} ${cx - rx * 0.8} ${cy + ry * 1.3} ${cx - rx * 0.98} ${cy + ry * 0.1} C ${cx - rx * 1.0} ${cy - ry * 0.5} ${cx - rx * 0.9} ${cy - ry * 0.9} ${cx - rx * 0.6} ${cy - ry * 1.05}" fill="none" stroke="${ringColor}" stroke-width="${ringW}" stroke-linecap="round"/>`;
  }).join("");
  return `<div data-check="page" style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:#fbfaf7;border-radius:3px;overflow:hidden;box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(40,20,5,.38),0 40px 60px -20px rgba(40,20,5,.4)`)}"><img src="${bookPage(n)}" style="position:absolute;left:${-crop.x0 * iw}px;top:${-crop.y0 * iw * ASPECT}px;width:${iw}px;height:auto;display:block" alt=""><svg style="position:absolute;inset:0;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}">${svg}</svg></div>`;
}

/** A sage disc with an arrow, drawn beside a page (never on it). */
const arrowDisc = (name, x, y, size = 56) => `<div style="${abs(x, y, size, size, `border-radius:50%;background:${C.sage};display:grid;place-items:center;border:3px solid #fff;box-shadow:0 4px 8px rgba(20,40,25,.4)`)}">${icon(name, { size: size * 0.62, color: "#fff", weight: "bold" })}</div>`;

const tickBadge = ({ x, y, size = 84 }) => `<div style="${abs(x, y, size, size, `border-radius:50%;background:${C.sage};display:grid;place-items:center;box-shadow:0 4px 6px rgba(20,40,25,.35),0 14px 20px rgba(20,40,25,.3);border:4px solid #fff`)}">${icon("check", { size: size * 0.6, color: "#fff", weight: "bold" })}</div>`;

/* ---------- #27 infographic: greenhouse glass, the year in job counts ---------- */
function pin27() {
  const i = idea(27);
  const months = [["Jan", 0], ["Feb", 1], ["Mar", 4], ["Apr", 9], ["May", 8], ["Jun", 1], ["Jul", 0], ["Aug", 0], ["Sep", 10], ["Oct", 11], ["Nov", 2], ["Dec", 0]];
  const hot = new Set(["Sep", "Oct", "Nov"]);
  const base = 262, unit = 17, pitch = 73;
  const bars = months.map(([m, c], k) => {
    const on = hot.has(m);
    const bh = Math.max(c * unit, 3);
    const bx = 22 + k * pitch;
    return `<div style="${abs(bx, base - bh, 54, bh, `background:${on ? C.sage : "#c3cbc2"};border-radius:6px 6px 0 0;${on ? "box-shadow:0 6px 12px rgba(40,70,50,.3)" : ""}`)}"></div>
    ${on ? `<div class="serif" style="${abs(bx - 10, base - bh - 52, 74, 46, "text-align:center;font-size:44px;line-height:46px;font-weight:500;color:" + C.sageDeep)}">${c}</div>` : ""}
    <div style="${abs(bx - 10, base + 8, 74, 30, `text-align:center;font:${on ? 600 : 500} 22px/30px 'Plex',sans-serif;color:${on ? C.sageDeep : "#7b857c"}`)}">${m}</div>`;
  }).join("");
  const jobs = [
    ["September", "10 JOBS", ["Book a professional tune-up (furnace)", "Annual service (boiler)", "Seal entry points before the cold (rodent check)"]],
    ["October", "11 JOBS", ["Book a professional tune-up (furnace)", "Bleed the radiators (boiler)", "Shut off and drain before the freeze (outdoor faucet)"]],
    ["November", "2 JOBS", ["Shut off and drain before the freeze (outdoor faucet)", "Clear the gutters (gutters)"]],
  ];
  const cards = jobs.map(([m, c, list], k) => `<div style="${abs(40 + k * 307, 736, 287, 280, "background:#e3cfa7;border-radius:12px;padding:16px 18px;box-shadow:0 3px 4px rgba(40,70,50,.25),0 14px 22px rgba(40,70,50,.25)")}">
    <div style="display:flex;align-items:baseline;justify-content:space-between"><span class="serif" style="font-size:31px;font-weight:500">${m}</span><span style="font:600 22px 'Plex',sans-serif;letter-spacing:.04em;color:${C.sageDeep};white-space:nowrap">${c}</span></div>
    <div style="margin-top:8px">${list.map((t) => `<div style="font-size:22px;line-height:1.22;margin-top:9px;padding-left:20px;position:relative;color:#2a2a22"><i style="position:absolute;left:0;top:9px;width:9px;height:9px;background:${C.sage}"></i>${esc(t)}</div>`).join("")}</div></div>`).join("");
  const mullions = [0, 1, 2, 3].map((k) => `<div style="${abs(k * 333 - 6, 372, 12, 1000, "background:#f7fbf8;box-shadow:0 0 0 1px rgba(60,100,80,.18)")}"></div>`).join("") +
    [560, 1020].map((y) => `<div style="${abs(0, y - 6, 1000, 12, "background:#f7fbf8;box-shadow:0 0 0 1px rgba(60,100,80,.18)")}"></div>`).join("");
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(160deg,#cfe6dc 0%,#e4f1ea 45%,#c5dccf 100%)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.35) 38%,transparent 46%,transparent 62%,rgba(255,255,255,.22) 68%,transparent 74%)")}"></div>
  ${mullions}
  <div style="${abs(40, 400, 920, 308, "background:rgba(251,250,246,.93);border-radius:14px;box-shadow:0 3px 5px rgba(40,70,50,.25),0 18px 30px rgba(40,70,50,.28)")}"><div style="${abs(22, 0, 880, 308)}">${bars}<div style="${abs(22, base, 880, 2, "background:#9aa59b")}"></div></div></div>
  ${cards}
  ${pageCrop({ n: 29, x: 40, y: 1050, w: 600, tilt: -1.4, crop: { x0: 0, y0: 0.262, x1: 1, y1: 0.7 } })}
  ${clayPot({ x: 730, y: 1110, w: 210, rot: 4 })}`;
  return printable({ n: 27, scene, paper: "#e8f1ea", bottomMax: 368 });
}

/* ---------- #31 comparison: dark weathered potting bench ---------- */
function pin31() {
  const rows = [["calculator", "It does the arithmetic"], ["hand-pointing", "It picks"], ["clock-counter-clockwise", "It remembers"]];
  const chips = rows.map(([ic, t], k) => `<div style="${abs(40, 770 + k * 106, 440, 84, "background:#ddc196;border-radius:12px;display:flex;align-items:center;gap:18px;padding:0 20px;box-shadow:0 3px 4px rgba(0,0,0,.35),0 14px 22px rgba(0,0,0,.35)")}"><span style="display:grid;place-items:center;width:46px;height:46px;flex:none;border-radius:50%;background:${C.sage}">${icon(ic, { size: 28, color: "#fff", weight: "bold" })}</span><span class="serif" style="font-size:36px;font-weight:500;color:${C.ink};white-space:nowrap">${esc(t)}</span></div>
  <div style="${abs(484, 770 + k * 106 + 18, 48, 48, "border-radius:50%;background:#f1ead8;display:grid;place-items:center;box-shadow:0 4px 8px rgba(0,0,0,.35)")}">${icon("arrow-right", { size: 28, color: C.sageDeep, weight: "bold" })}</div>`).join("");
  const scene = `
  ${desk({ top: 372, height: 1000, base: "#6b5f55", dark: "#554a41", planks: 6, seed: 11 })}
  ${sheet({ src: bookPage(36), x: 50, y: 404, w: 880, tilt: -1.2, crop: { x0: 0.07, y0: 0.525, x1: 0.93, y1: 0.725 } })}
  ${phone({ src: screen("workspace"), y0: 60, y1: 500, width: 430, tilt: 2, x: 530, y: 700, closed: true })}
  <div style="${abs(60, 700, 3, 70, "background:#e9e2d2;opacity:.85")}"></div><div style="${abs(54, 692, 15, 15, "background:#e9e2d2;border-radius:50%")}"></div>
  ${chips}
  ${gloves({ x: 40, y: 1135, size: 250, rot: -6 })}
  ${twine({ x: 330, y: 1185, size: 130 })}`;
  return printable({ n: 31, scene, paper: "#e7e3d6", bottomMax: 368 });
}

/* ---------- #35 question: shed wall, three tagged appliances, the real page 10 ---------- */
function appliances() {
  const tagAt = (x, y, label) => `<div style="${abs(x - 70, y, 140, 120, "")}">
    <div style="${abs(69, -22, 2, 40, "background:#7a6a4e")}"></div>
    <div style="${abs(0, 14, 140, 106, "background:#ddc196;border-radius:12px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 12px 18px rgba(40,20,5,.3)")}"><div class="serif" style="text-align:center;font-size:62px;line-height:66px;font-weight:600;color:${C.sageDeep};margin-top:2px">?</div><div style="text-align:center;font:600 24px/1.1 'Plex',sans-serif;color:${C.ink}">${label}</div></div></div>`;
  return `
  <svg style="${abs(0, 380, 1000, 420)}" viewBox="0 0 1000 420" aria-hidden="true">
    <defs><linearGradient id="st" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4f6f1"/><stop offset="1" stop-color="#d9e2d6"/></linearGradient></defs>
    <!-- boiler -->
    <g transform="translate(70 70)"><rect x="0" y="0" width="190" height="300" rx="26" fill="#f6f3ea" stroke="#9aa89c" stroke-width="3"/><rect x="0" y="0" width="190" height="300" rx="26" fill="#000" opacity=".04"/><circle cx="95" cy="70" r="30" fill="#fff" stroke="#8c9a8e" stroke-width="4"/><path d="M95 70 L112 54" stroke="${C.sageDeep}" stroke-width="4" stroke-linecap="round"/><rect x="40" y="130" width="110" height="64" rx="8" fill="#e3e9e0" stroke="#9aa89c" stroke-width="2"/><rect x="62" y="212" width="12" height="70" fill="#b7bcc0"/><rect x="116" y="212" width="12" height="70" fill="#b7bcc0"/><rect x="82" y="-30" width="26" height="34" fill="#b7bcc0"/></g>
    <!-- furnace -->
    <g transform="translate(320 90)"><rect x="0" y="0" width="300" height="280" rx="12" fill="#cfd6d2" stroke="#8c9a8e" stroke-width="3"/><rect x="18" y="18" width="264" height="150" rx="8" fill="#e6ebe7" stroke="#9aa89c" stroke-width="2"/>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="38" y="${36 + k * 20}" width="224" height="8" rx="4" fill="#aab5ad"/>`).join("")}<rect x="18" y="186" width="264" height="76" rx="8" fill="#dfe5e1" stroke="#9aa89c" stroke-width="2"/><circle cx="52" cy="224" r="12" fill="${C.sage}"/><rect x="190" y="204" width="68" height="40" rx="6" fill="#fff" stroke="#9aa89c" stroke-width="2"/><rect x="120" y="-50" width="60" height="56" fill="#b7bcc0"/></g>
    <!-- heat pump outdoor unit on a pad -->
    <g transform="translate(680 160)"><rect x="-10" y="196" width="270" height="18" rx="4" fill="#b8bdb4"/><rect x="0" y="0" width="250" height="198" rx="12" fill="#eceee9" stroke="#8c9a8e" stroke-width="3"/><circle cx="125" cy="99" r="78" fill="#d4dad5" stroke="#8c9a8e" stroke-width="3"/>${[0, 1, 2, 3, 4].map((k) => `<circle cx="125" cy="99" r="${70 - k * 13}" fill="none" stroke="#9aa89c" stroke-width="3"/>`).join("")}${[0, 60, 120].map((a) => `<path d="M125 99 L${125 + 56 * Math.cos(((a - 20) * Math.PI) / 180)} ${99 + 56 * Math.sin(((a - 20) * Math.PI) / 180)} L${125 + 56 * Math.cos(((a + 20) * Math.PI) / 180)} ${99 + 56 * Math.sin(((a + 20) * Math.PI) / 180)}Z" fill="#8c9a8e"/>`).join("")}<circle cx="125" cy="99" r="9" fill="#5c6a5f"/></g>
  </svg>
  ${tagAt(165, 372, "Boiler")}${tagAt(470, 372, "Furnace")}${tagAt(805, 440, "Heat pump")}`;
}

function pin35() {
  const planks = Array.from({ length: 11 }, (_, k) => `<div style="${abs(k * 92 - 4, 372, 4, 470, "background:#b9c6b8;opacity:.7")}"></div>`).join("");
  const scene = `
  <div style="${abs(0, 372, 1000, 470, "background:linear-gradient(#e8eee5,#d3ddd0)")}"></div>${planks}
  <div style="${abs(0, 790, 1000, 12, "background:#8a6a42;box-shadow:0 6px 10px rgba(40,20,5,.35)")}"></div>
  ${desk({ top: 802, height: 560, base: "#c99b66", dark: "#b0834d", planks: 4, seed: 7 })}
  ${appliances()}
  ${pageCrop({ n: 10, x: 170, y: 840, w: 640, tilt: -2.2, crop: { x0: 0.04, y0: 0.03, x1: 0.96, y1: 0.57 } })}
  ${clayPot({ x: 30, y: 1130, w: 150, rot: -6 })}
  ${twine({ x: 840, y: 1180, size: 120 })}`;
  return printable({ n: 35, scene, paper: "#e9efe6", bottomMax: 368 });
}

/* ---------- #37 quote card: sage shed door, a key on a nail ---------- */
function pin37() {
  const i = idea(37);
  const crop = { x0: 0.07, y0: 0.205, x1: 0.5, y1: 0.385 };
  const boards = Array.from({ length: 11 }, (_, k) => `<div style="${abs(k * 92, 610, 92, 800, `background:${k % 2 ? "#7c9d85" : "#729479"}`)}"><div style="${abs(0, 0, 3, 600, "background:#4c6a54;opacity:.55")}"></div><div style="${abs(8, 0, 5, 600, "background:#fff;opacity:.07")}"></div></div>`).join("");
  const body = `
  <div style="${abs(0, 0, 1000, 1500, "background:#f6f3ea")}"></div>
  <div class="serif" style="${abs(740, 20, 220, 260, `font-size:340px;line-height:340px;color:${C.sage};opacity:.2`)}">&rdquo;</div>
  <div data-check="headline" data-bottom-max="596" style="position:absolute;left:64px;right:64px;top:70px;height:520px">
    <div class="eyebrow">Renting</div>
    <h1 class="serif" style="font-weight:500;font-size:96px;line-height:1.01;letter-spacing:-.02em;margin-top:18px;text-wrap:balance">The Notice Date Matters More Than the Renewal Date</h1>
    <p class="serif" style="font-style:italic;font-size:36px;line-height:1.3;margin-top:24px;color:#4b4339;max-width:800px">${esc(i.sub)}</p>
  </div>
  ${boards}
  <div style="${abs(0, 598, 1000, 20, "background:#4c6a54;box-shadow:0 8px 14px rgba(20,40,25,.4)")}"></div>
  <div style="${abs(0, 598, 1000, 8, "background:#9bb8a2")}"></div>
  <div style="${abs(700, 652, 14, 14, "background:#2b2118;border-radius:50%;box-shadow:0 3px 3px rgba(0,0,0,.4)")}"></div>
  ${pageCrop({ n: 35, x: 44, y: 690, w: 640, tilt: -2, crop })}
  ${tag("Notice by", { x: 740, y: 968, w: 220, size: 34, rot: 0 })}
  ${arrowDisc("arrow-left", 698, 971)}
  ${keys({ x: 700, y: 626, size: 280, rot: 4 })}
  <div style="${abs(0, 1262, 1000, 26, "background:linear-gradient(#b98a52,#8f6537);box-shadow:0 10px 16px rgba(20,40,25,.45)")}"></div>
  ${clayPot({ x: 40, y: 1105, w: 160 })}${clayPot({ x: 215, y: 1140, w: 125, plant: false })}${clayPot({ x: 355, y: 1118, w: 145, rot: 2 })}
  ${wateringCan({ x: 690, y: 1062, size: 250, rot: 0 })}
  <div style="${abs(0, 1354, 1000, 146, "background:#f6f3ea;box-shadow:0 -8px 22px rgba(20,40,25,.3)")}"></div>
  ${footFor(i)}`;
  return { n: 37, id: `37-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, paper: "#f6f3ea" }) };
}

/* ---------- #39 before-after: terracotta bench, seed trays ---------- */
function pin39() {
  const bench = `<div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(170deg,#e0b894,#cc9a74)")}"></div>` +
    Array.from({ length: 6 }, (_, k) => `<div style="${abs(0, 372 + k * 168, 1000, 4, "background:#8f5f3b;opacity:.35")}"></div>`).join("") +
    `<div style="${abs(0, 372, 1000, 1000, "background:radial-gradient(circle at 20% 10%,rgba(255,255,255,.22),transparent 60%)")}"></div>`;
  const scene = `
  ${bench}
  ${pageCrop({ n: 11, x: 24, y: 408, w: 560, tilt: -3, crop: { x0: 0.04, y0: 0.4, x1: 0.96, y1: 0.9 } })}
  ${arrowDisc("arrow-left", 596, 470)}
  ${tag("Forty blank rows", { x: 660, y: 456, w: 310, size: 34, rot: 2 })}
  ${wateringCan({ x: 690, y: 560, size: 230, rot: 3 })}
  ${pageCrop({ n: 11, x: 390, y: 820, w: 590, tilt: 2.5, crop: { x0: 0.04, y0: 0.14, x1: 0.96, y1: 0.56 } })}
  ${tag("Water heater", { x: 40, y: 826, w: 260, size: 34, rot: -2 })}
  ${arrowDisc("arrow-right", 322, 830)}
  ${tag("Installed", { x: 620, y: 1174, w: 170, size: 30, rot: 0 })}
  ${arrowDisc("arrow-up", 806, 1172)}
  ${seedTray({ x: 20, y: 975, w: 360, rot: -5 })}
  ${tag("One water heater with a date on it", { x: 470, y: 1244, w: 480, size: 30, rot: 0, extra: "padding-left:84px;" })}
  ${tickBadge({ x: 424, y: 1240, size: 92 })}`;
  return printable({ n: 39, scene, paper: "#f1e3d3", bottomMax: 368 });
}

export const pins = [pin27(), pin31(), pin35(), pin37(), pin39()];
