/**
 * Group J: autumn porch. Home Base guide pins #49, #53, #55, #57, #61.
 * Five different surfaces and moods: a whitewashed early-spring porch wall with a stone step (49),
 * dark rust porch boards under raked leaves (53), a navy front door with a brass wreath hook over a
 * porch bench (55), two stacked panels of one overcast eave and gutter (57) and an oatmeal-and-sage
 * wool plaid (61). Every word is the idea bank's. No printed workbook page is used (guide pins).
 */
import { esc } from "../../v3/kit.mjs";
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { desk } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const LEAF = ["#b8452a", "#d9822b", "#c9a02e", "#8c3a22", "#a33b2b", "#cf6a26"];

/* ---------- props (flat vector, soft shadows) ---------- */

/** A maple leaf. */
function leaf({ x, y, s = 1, rot = 0, c = LEAF[0], shadow = true }) {
  return `<svg style="${abs(x, y, 44 * s, 44 * s, `transform:rotate(${rot}deg);${shadow ? "filter:drop-shadow(0 3px 3px rgba(30,15,5,.3))" : ""}`)}" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 3 L26 13 L35 9 L32 20 L41 22 L32 27 L34 35 L25 32 L22 42 L19 32 L10 35 L12 27 L3 22 L12 20 L9 9 L18 13Z" fill="${c}"/><path d="M22 10 V40 M22 24 L12 18 M22 24 L32 18" stroke="#000" stroke-opacity=".18" stroke-width="1.5" fill="none"/></svg>`;
}

/** A loose mound of raked leaves inside an ellipse. */
function leafPile({ x, y, w, h, n = 60, seed = 1, size = 1 }) {
  const r = rng(seed);
  const items = [];
  for (let k = 0; k < n; k++) {
    const a = r() * Math.PI, d = Math.sqrt(r());
    items.push({ px: x + w / 2 + Math.cos(a) * d * (w / 2) * (r() > 0.5 ? 1 : -1), py: y + h - Math.sin(a) * d * h * 0.95 - r() * 14, rot: r() * 360, c: LEAF[Math.floor(r() * LEAF.length)], s: (0.7 + r() * 0.5) * size });
  }
  items.sort((a, b) => a.py - b.py);
  return `<div style="${abs(x + w * 0.05, y + h - 20, w * 0.9, 26, "border-radius:50%;background:rgba(25,10,0,.3);filter:blur(10px)")}"></div>` + items.map((o) => leaf({ x: o.px - 22 * o.s, y: o.py - 22 * o.s, s: o.s, rot: o.rot, c: o.c })).join("");
}

/** A few leaves scattered at the given points [x, y, scale, rot]. */
const scatter = (pts, seed = 5) => { const r = rng(seed); return pts.map(([x, y, s, rot]) => leaf({ x, y, s, rot: rot ?? r() * 360, c: LEAF[Math.floor(r() * LEAF.length)] })).join(""); };

function pumpkin({ x, y, w = 220, c = "#d9742b", rot = 0, ribs = "#b95a1c" }) {
  const h = w * 0.82;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 10px rgba(25,10,0,.4))`)}" viewBox="0 0 200 164" aria-hidden="true">
  <ellipse cx="100" cy="152" rx="86" ry="10" fill="#000" opacity=".12"/>
  <ellipse cx="40" cy="92" rx="40" ry="60" fill="${ribs}"/><ellipse cx="160" cy="92" rx="40" ry="60" fill="${ribs}"/>
  <ellipse cx="68" cy="92" rx="46" ry="64" fill="${c}"/><ellipse cx="132" cy="92" rx="46" ry="64" fill="${c}"/>
  <ellipse cx="100" cy="92" rx="38" ry="68" fill="${c}"/><path d="M68 40 Q56 92 70 148 M132 40 Q144 92 130 148 M100 26 Q96 92 100 156" stroke="${ribs}" stroke-width="3" fill="none" opacity=".7"/>
  <ellipse cx="76" cy="66" rx="20" ry="28" fill="#fff" opacity=".13"/>
  <path d="M96 30 C 94 12 102 4 110 2 L118 8 C 110 12 108 20 108 30Z" fill="#5d6b34"/><path d="M108 18 C 126 6 140 12 146 24 C 130 22 118 24 110 30Z" fill="#6f8a4a"/></svg>`;
}

function rake({ x, y, len = 420, rot = 8 }) {
  const w = 130;
  return `<svg style="${abs(x, y, w, len, `transform:rotate(${rot}deg);transform-origin:50% 0;filter:drop-shadow(0 10px 8px rgba(25,10,0,.4))`)}" viewBox="0 0 130 420" preserveAspectRatio="none" aria-hidden="true">
  <rect x="60" y="0" width="10" height="330" rx="4" fill="#a97b4a"/><rect x="60" y="0" width="4" height="330" fill="#fff" opacity=".22"/>
  <path d="M65 320 L8 370 L8 414 M65 320 L122 370 L122 414" stroke="#8a8f94" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M6 366 H124" stroke="#8a8f94" stroke-width="8" stroke-linecap="round"/>
  ${[8, 28, 48, 68, 88, 108, 122].map((tx) => `<path d="M${tx} 366 V412" stroke="#a7acb0" stroke-width="5" stroke-linecap="round"/>`).join("")}</svg>`;
}

/** A wool scarf hanging straight down with stripes and fringe. */
function scarf({ x, y, w = 110, h = 360, colors = ["#b8452a", "#efe4cd", "#c9a02e", "#efe4cd", "#b8452a"], rot = 0 }) {
  const stripes = Array.from({ length: 9 }, (_, k) => `<rect x="0" y="${34 + k * 34}" width="${w}" height="${k % 2 ? 7 : 16}" fill="${colors[k % colors.length]}" opacity="${k % 2 ? 1 : 0.95}"/>`).join("");
  const fr = Array.from({ length: Math.floor(w / 9) }, (_, k) => `<rect x="${k * 9 + 2}" y="${h - 30}" width="4" height="26" rx="2" fill="#b8452a"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);transform-origin:50% 0;filter:drop-shadow(0 14px 10px rgba(5,10,20,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <path d="M10 0 H${w - 10} L${w} ${h - 30} H0Z" fill="#b8452a"/>${stripes}<path d="M10 0 H${w - 10} L${w} ${h - 30} H0Z" fill="none"/>
  <rect x="0" y="0" width="${w}" height="${h - 30}" fill="url(#wool)" opacity=".25"/>
  <defs><pattern id="wool" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 L6 6 M6 0 L0 6" stroke="#000" stroke-width="1"/></pattern></defs>${fr}</svg>`;
}

/** A coir doormat (no words). */
function doormat({ x, y, w = 360, rot = 0 }) {
  const h = w * 0.58;
  const hairs = Array.from({ length: 70 }, (_, k) => `<path d="M${(k * 37) % (w - 30) + 14} ${(k * 53) % (h - 30) + 14} l${(k % 5) - 2} ${6 + (k % 4)}" stroke="#5a4328" stroke-width="2" opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 8px rgba(25,10,0,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" rx="10" fill="#9a7a4e"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="6" fill="#7d6038"/><rect x="26" y="26" width="${w - 52}" height="${h - 52}" rx="4" fill="#a98a5c"/>${hairs}</svg>`;
}

function trowel({ x, y, len = 300, rot = -20 }) {
  return `<svg style="${abs(x, y, len, 90, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(25,10,0,.35))`)}" viewBox="0 0 300 90" aria-hidden="true"><rect x="150" y="34" width="144" height="26" rx="13" fill="${C.sage}"/><rect x="150" y="34" width="144" height="8" rx="4" fill="#fff" opacity=".22"/><rect x="132" y="38" width="22" height="18" fill="#9aa0a6"/><path d="M134 47 C 96 6 40 8 4 46 C 40 84 96 88 134 47Z" fill="#b4bac0"/><path d="M130 47 C 96 22 54 22 22 46" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
}

/** A tulip bulb (papery, pointed). */
function bulb({ x, y, s = 1, rot = 0 }) {
  return `<svg style="${abs(x, y, 80 * s, 100 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(25,10,0,.38))`)}" viewBox="0 0 80 100" aria-hidden="true"><path d="M40 4 C 46 22 70 36 70 66 C 70 88 54 96 40 96 C 26 96 10 88 10 66 C 10 36 34 22 40 4Z" fill="#d8b87c"/><path d="M40 4 C 44 24 62 38 62 66 C 62 84 52 92 40 92" fill="none" stroke="#a7843f" stroke-width="3" opacity=".6"/><path d="M26 40 C 18 56 18 74 28 88" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/><path d="M30 96 L26 104 M40 96 V106 M50 96 L55 104" stroke="#7a5a2e" stroke-width="3" stroke-linecap="round"/></svg>`;
}

function clayPot({ x, y, w = 200, rot = 0, bulbs = false }) {
  const h = w * 1.05;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(40,20,5,.35))`)}" viewBox="0 0 200 210" aria-hidden="true">
  <path d="M26 74 H174 V100 H26Z" fill="#c4683f"/><path d="M26 74 H174 V84 H26Z" fill="#dc8458"/>
  <path d="M38 100 H162 L148 198 Q147 206 138 206 H62 Q53 206 52 198Z" fill="#b95a33"/><path d="M38 100 H162 L159 124 H41Z" fill="#000" opacity=".08"/><path d="M60 106 L68 198" stroke="#e59a70" stroke-width="7" opacity=".5" stroke-linecap="round"/>
  <ellipse cx="100" cy="76" rx="70" ry="7" fill="#4a2e1c"/>${bulbs ? `<path d="M70 72 C 70 54 76 46 84 44 C 90 50 92 62 90 72Z" fill="#d8b87c"/><path d="M104 72 C 104 52 112 44 120 44 C 126 52 128 62 126 72Z" fill="#c9a76a"/>` : ""}</svg>`;
}

/** Furnace filter in its cardboard frame, standing up. */
function filterProp({ x, y, w = 200, h = 260, rot = 0, kraft = "#c8a679" }) {
  const pleats = Array.from({ length: 14 }, (_, k) => `<path d="M${22 + k * ((w - 44) / 13)} 22 V${h - 22}" stroke="#a6b0b4" stroke-width="2" opacity=".8"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(5,10,20,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" rx="5" fill="${kraft}"/><rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="#eef1f2"/><path d="M16 16 H${w - 16}" stroke="#000" stroke-opacity=".1" stroke-width="4"/>${pleats}<path d="M16 ${h / 2} L${w - 16} ${h / 2 + 8}" stroke="#7d8a90" stroke-width="2" opacity=".5"/><rect width="${w}" height="12" rx="5" fill="#fff" opacity=".18"/></svg>`;
}

function caulk({ x, y, s = 1, rot = 0 }) {
  return `<svg style="${abs(x, y, 90 * s, 280 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(5,10,20,.45))`)}" viewBox="0 0 90 280" aria-hidden="true"><path d="M43 2 H47 L52 40 H38Z" fill="#e9e4d4"/><rect x="14" y="40" width="62" height="12" rx="4" fill="#bfc3c6"/><rect x="14" y="52" width="62" height="214" rx="8" fill="#e9b13b"/><rect x="14" y="52" width="14" height="214" rx="7" fill="#fff" opacity=".28"/><rect x="14" y="130" width="62" height="78" fill="#2b2e33"/><rect x="26" y="146" width="38" height="8" rx="2" fill="#e9e4d4" opacity=".8"/><rect x="26" y="164" width="38" height="8" rx="2" fill="#e9e4d4" opacity=".8"/><rect x="14" y="258" width="62" height="14" rx="6" fill="#bfc3c6"/></svg>`;
}

/** A coil of flexible dryer-vent hose, seen from above. */
function hoseCoil({ x, y, w = 240, rot = 0 }) {
  const rings = [0, 1, 2, 3].map((k) => `<ellipse cx="120" cy="${64 - k * 5}" rx="${100 - k * 20}" ry="${46 - k * 9}" fill="none" stroke="#aeb5b9" stroke-width="16"/><ellipse cx="120" cy="${64 - k * 5}" rx="${100 - k * 20}" ry="${46 - k * 9}" fill="none" stroke="#6b7479" stroke-width="16" stroke-dasharray="3 6" opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, w, w * 0.6, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(5,10,20,.45))`)}" viewBox="0 0 240 144" aria-hidden="true">${rings}<ellipse cx="120" cy="40" rx="30" ry="12" fill="#2b2e33"/></svg>`;
}

/** An outdoor tap on a wall with a hose; `drip` adds one slate drop. */
function tapSvg({ x, y, w = 240, hose = true, drip = false, wall = "#e8e2d2", rot = 0 }) {
  return `<svg style="${abs(x, y, w, w * 0.75, `transform:rotate(${rot}deg)`)}" viewBox="0 0 240 180" aria-hidden="true"><rect x="0" y="0" width="90" height="180" fill="${wall}"/><path d="M0 40 H90 M0 80 H90 M0 120 H90 M0 160 H90" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
  <rect x="86" y="62" width="56" height="22" rx="6" fill="#c9962f"/><rect x="132" y="56" width="20" height="34" rx="5" fill="#a97a22"/><path d="M142 62 H168 V84 H142Z" fill="#c9962f"/><path d="M112 62 V34 M96 34 H128" stroke="#c9962f" stroke-width="10" stroke-linecap="round"/><path d="M154 74 H176 V102 H154Z" fill="#a97a22"/>
  ${hose ? `<path d="M166 100 C 172 140 130 150 140 170 C 150 190 215 160 232 170" fill="none" stroke="#3f6f4a" stroke-width="16" stroke-linecap="round"/><path d="M166 100 C 172 140 130 150 140 170" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="4" stroke-linecap="round"/>` : ""}
  ${drip ? `<path d="M164 112 C 156 126 154 134 164 140 C 174 134 172 126 164 112Z" fill="${C.slate}"/>` : ""}</svg>`;
}

/** A gutter with a downspout, `full` fills it with leaves. */
function gutterCard({ x, y, w = 180, full = false }) {
  return `<svg style="${abs(x, y, w, w * 0.66, "")}" viewBox="0 0 180 120" aria-hidden="true"><rect x="0" y="0" width="180" height="26" fill="#6b5b53"/><rect x="0" y="26" width="180" height="14" fill="#eceae4"/><path d="M0 40 H180 V62 Q90 76 0 62Z" fill="#c4c9cc"/>${full ? [20, 52, 84, 118, 150].map((lx, k) => `<path d="M${lx} 44 q10 -22 24 -6 q8 14 -4 22 q-12 4 -20 -16Z" fill="${LEAF[k % LEAF.length]}"/>`).join("") : ""}<rect x="150" y="60" width="16" height="58" fill="#c4c9cc"/></svg>`;
}

function furnaceSvg({ x, y, w = 110 }) {
  return `<svg style="${abs(x, y, w, w, "")}" viewBox="0 0 120 120" aria-hidden="true"><rect x="22" y="2" width="30" height="20" fill="#b7bcc0"/><rect x="6" y="20" width="108" height="96" rx="8" fill="#cfd6d2" stroke="#8c9a8e" stroke-width="3"/><rect x="16" y="30" width="88" height="44" rx="5" fill="#e6ebe7" stroke="#9aa89c" stroke-width="2"/>${[0, 1, 2, 3].map((k) => `<rect x="26" y="${38 + k * 8}" width="68" height="3" rx="1.5" fill="#aab5ad"/>`).join("")}<rect x="16" y="82" width="88" height="26" rx="5" fill="#dfe5e1" stroke="#9aa89c" stroke-width="2"/><circle cx="32" cy="95" r="6" fill="${C.sage}"/></svg>`;
}

function alarmSvg({ x, y, w = 100 }) {
  return `<svg style="${abs(x, y, w, w, "")}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="#f3f1ea" stroke="#9aa89c" stroke-width="3"/><circle cx="60" cy="60" r="38" fill="none" stroke="#c7cfc6" stroke-width="3"/>${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${60 + 22 * Math.cos((k * Math.PI) / 3)}" cy="${60 + 22 * Math.sin((k * Math.PI) / 3)}" r="4" fill="#9aa89c"/>`).join("")}<circle cx="60" cy="60" r="7" fill="${C.sage}"/></svg>`;
}

function dryerVentSvg({ x, y, w = 110 }) {
  return `<svg style="${abs(x, y, w, w, "")}" viewBox="0 0 120 120" aria-hidden="true"><rect x="0" y="0" width="52" height="120" fill="#e8e2d2"/><path d="M0 30 H52 M0 60 H52 M0 90 H52" stroke="#000" stroke-opacity=".08" stroke-width="3"/><rect x="44" y="40" width="30" height="40" rx="5" fill="#b7bcc0"/><path d="M72 60 C 100 60 112 70 100 90 C 90 108 70 112 40 112" fill="none" stroke="#aeb5b9" stroke-width="14" stroke-linecap="round"/><path d="M72 60 C 100 60 112 70 100 90 C 90 108 70 112 40 112" fill="none" stroke="#6b7479" stroke-width="14" stroke-dasharray="2 6" opacity=".5"/></svg>`;
}

function pipeGapSvg({ x, y, w = 110 }) {
  return `<svg style="${abs(x, y, w, w, "")}" viewBox="0 0 120 120" aria-hidden="true"><rect x="0" y="0" width="120" height="120" fill="#e8e2d2"/><path d="M0 30 H120 M0 60 H120 M0 90 H120" stroke="#000" stroke-opacity=".08" stroke-width="3"/><rect x="48" y="0" width="24" height="120" fill="#b9733f"/><rect x="48" y="0" width="8" height="120" fill="#fff" opacity=".3"/><ellipse cx="60" cy="62" rx="26" ry="9" fill="#2b2118" opacity=".85"/><rect x="48" y="52" width="24" height="20" fill="#b9733f"/></svg>`;
}

/* ---------- small layout helpers ---------- */

const tick = (size = 30, filled = false, color = C.sage) =>
  `<span style="display:inline-grid;place-items:center;flex:none;width:${size}px;height:${size}px;border:3px solid ${color};border-radius:7px;background:${filled ? color : "transparent"}">${filled ? icon("check", { size: size - 6, color: "#fff", weight: "bold" }) : ""}</span>`;

const woodTexture = (x, y, w, h, base, seam, n) =>
  Array.from({ length: n }, (_, k) => `<div style="${abs(x + (k * w) / n, y, w / n, h, `background:${k % 2 ? base : seam}`)}"><div style="${abs(0, 0, 3, h, "background:#000;opacity:.12")}"></div></div>`).join("");

/* ---------- #49 checklist: whitewashed spring porch, three month cards, bulbs and trowel ---------- */
function pin49() {
  const months = [
    { m: "March", rows: ["Check that downspouts drain away from the house"], art: downspout },
    { m: "April", rows: ["Look at the roof from the ground for lifted or missing shingles", "Clear the gutters. Book air conditioning service"], art: roofline },
    { m: "May", rows: ["Reconnect hoses and turn outdoor water back on, then look for drips at the faucet"], art: tapArt },
  ];
  function downspout(x, y) {
    return `<svg style="${abs(x, y, 244, 150, "")}" viewBox="0 0 260 160" aria-hidden="true">
    <rect x="0" y="0" width="84" height="132" fill="#ebe5d6"/><path d="M0 30 H84 M0 60 H84 M0 90 H84 M0 120 H84" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <rect x="0" y="0" width="84" height="12" fill="#cfd4d6"/><rect x="56" y="12" width="16" height="104" fill="#c4c9cc"/><rect x="56" y="12" width="5" height="104" fill="#fff" opacity=".4"/>
    <path d="M56 114 H112 L104 130 H56Z" fill="#c4c9cc"/><rect x="100" y="128" width="64" height="12" rx="3" fill="#b8bdb4"/>
    <path d="M0 126 L84 130 L260 154 V160 H0Z" fill="#7a5a3c"/><path d="M0 126 L84 130 L260 154" fill="none" stroke="#5a4028" stroke-width="3"/>
    <path d="M118 112 C 112 122 112 128 118 130 C 124 128 124 122 118 112Z" fill="${C.slate}"/><path d="M178 132 l22 6 M206 138 l22 6" stroke="${C.slate}" stroke-width="4" stroke-linecap="round" opacity=".7"/></svg>`;
  }
  function roofline(x, y) {
    const rows = Array.from({ length: 6 }, (_, k) => `<path d="M${30 + k * 5} ${34 + k * 14} L${130 - 0} ${34 + k * 14} L${230 - k * 5} ${34 + k * 14}" stroke="#2f2824" stroke-opacity=".5" stroke-width="2"/>`).join("");
    return `<svg style="${abs(x, y, 244, 150, "")}" viewBox="0 0 260 160" aria-hidden="true">
    <rect x="40" y="108" width="180" height="52" fill="#ebe5d6"/><path d="M130 6 L252 106 H8Z" fill="#6b5b53"/>${rows}
    <path d="M130 6 L252 106 H8Z" fill="none" stroke="#3d322c" stroke-width="3"/><rect x="0" y="104" width="260" height="10" rx="3" fill="#eceae4"/>
    <path d="M150 58 L176 56 L174 70 L148 74Z" fill="#8a7a70"/><path d="M148 74 L176 70 L182 62 L158 54Z" fill="#9b8b80"/>
    <rect x="104" y="126" width="30" height="34" fill="#9a7a4e"/></svg>`;
  }
  function tapArt(x, y) { return tapSvg({ x: x + 6, y, w: 232, hose: true, drip: true, wall: "#ebe5d6" }); }

  const cardW = 292, gap = 18, cy = 408, ch = 636;
  const cards = months.map((mo, k) => {
    const cx = 40 + k * (cardW + gap);
    const rows = mo.rows.map((t) => `<div style="display:flex;gap:12px;align-items:flex-start;margin-top:14px">${tick(30)}<span style="font:500 27px/1.2 'Plex',sans-serif;color:${C.ink}">${esc(t)}</span></div>`).join("");
    return `<div data-check="card" style="${abs(cx, cy, cardW, ch, "background:#fbfaf6;border-radius:12px;box-shadow:0 3px 4px rgba(40,70,50,.22),0 18px 32px rgba(40,70,50,.28);overflow:hidden")}">
      <div style="${abs(0, 0, cardW, 12, `background:${C.sage}`)}"></div>
      <div class="serif" style="${abs(20, 26, cardW - 40, 70, `font-size:58px;line-height:70px;font-weight:500;color:${C.sageDeep}`)}">${mo.m}</div>
      ${mo.art(24, 104)}
      <div style="${abs(24, 268, cardW - 48, ch - 280, "")}">${rows}</div></div>`;
  }).join("");
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:#e9efe7")}"></div>
  ${woodTexture(0, 372, 1000, 720, "#f1f4ee", "#e5ebe2", 11)}
  <div style="${abs(0, 1092, 1000, 16, "background:#c7cfc4;box-shadow:0 4px 8px rgba(40,70,50,.3)")}"></div>
  <div style="${abs(0, 1108, 1000, 260, "background:linear-gradient(#cdd1c9,#b3b8ae)")}"></div>
  <div style="${abs(0, 1228, 1000, 4, "background:#9ea49a;opacity:.7")}"></div>
  ${cards}
  ${doormat({ x: 40, y: 1130, w: 340, rot: -2 })}
  ${clayPot({ x: 420, y: 1120, w: 190, bulbs: true })}
  ${bulb({ x: 640, y: 1160, s: 1.1, rot: -14 })}${bulb({ x: 740, y: 1200, s: 0.95, rot: 18 })}${bulb({ x: 840, y: 1150, s: 0.85, rot: 6 })}
  ${trowel({ x: 660, y: 1240, len: 300, rot: -6 })}`;
  return printable({ n: 49, scene, paper: "#eaf0e6", bottomMax: 368 });
}

/* ---------- #53 infographic: rust porch boards, timeline to the first frost ---------- */
function pin53() {
  const stops = [
    { d: "Early September", t: "Book the heating tune-up", art: (x, y) => furnaceSvg({ x, y, w: 118 }) },
    { d: "Late September", t: "Seal gaps, swap the filter, test alarms", art: (x, y) => `${caulk({ x: x + 2, y: y - 8, s: 0.45, rot: 24 })}${filterProp({ x: x + 48, y: y + 4, w: 78, h: 100 })}` },
    { d: "First half of October", t: "Drain outdoor water, service equipment", art: (x, y) => tapSvg({ x: x - 14, y: y - 8, w: 160, hose: false, wall: "#ebe5d6" }) },
    { d: "After the leaves drop", t: "Clear the gutters", art: (x, y) => gutterCard({ x, y: y + 4, w: 128, full: true }) },
  ];
  const cw = 224, gap = 8, cy = 400, ch = 400;
  const cards = stops.map((s, k) => {
    const cx = 40 + k * (cw + gap);
    return `<div data-check="card" style="${abs(cx, cy, cw, ch, "background:#f6f0e2;border-radius:12px;box-shadow:0 3px 4px rgba(25,10,0,.35),0 18px 30px rgba(25,10,0,.4);overflow:hidden")}">
      <div style="${abs(0, 0, cw, 10, `background:${C.sage}`)}"></div>
      <div style="${abs(0, 30, cw, 130, "display:grid;place-items:center")}"><div style="${abs(38, 0, 148, 130, "")}">${s.art(10, 4)}</div></div>
      <div class="serif" style="${abs(16, 170, cw - 32, 76, `font-size:28px;line-height:1.08;font-weight:600;color:${C.sageDeep}`)}">${s.d}</div>
      <div style="${abs(16, 252, cw - 32, ch - 262, `font:500 25px/1.22 'Plex',sans-serif;color:${C.ink}`)}">${esc(s.t)}</div></div>
    <div style="${abs(cx + cw / 2 - 2, cy + ch, 4, 70, "background:#f1e6cc")}"></div>
    <div style="${abs(cx + cw / 2 - 17, cy + ch + 52, 34, 34, `background:#f6f0e2;border:7px solid ${C.sage};border-radius:50%;box-shadow:0 4px 6px rgba(25,10,0,.4)`)}"></div>`;
  }).join("");
  const frostX = 40 + 3 * (cw + gap) - gap / 2 - 5;
  const frost = `
  <div style="${abs(frostX - 2, 872, 4, 62, "background:#f1e6cc")}"></div>
  <div style="${abs(frostX - 220, 930, 440, 150, "background:#f6f0e2;border-radius:14px;box-shadow:0 3px 4px rgba(25,10,0,.35),0 18px 30px rgba(25,10,0,.4);padding:18px 24px;box-sizing:border-box")}" data-check="frost">
    <div style="display:flex;align-items:center;gap:14px"><span style="display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:${C.slate}">${icon("snowflake", { size: 34, color: "#fff", weight: "bold" })}</span><span class="serif" style="font-size:42px;font-weight:600;color:${C.ink};white-space:nowrap">First frost</span><span class="example" style="font-size:19px;padding:5px 10px">Example</span></div>
    <div style="font:500 26px/1.25 'Plex',sans-serif;color:#3d3a32;margin-top:12px">third week of October</div></div>`;
  const scene = `
  ${desk({ top: 372, height: 1000, base: "#9d5a35", dark: "#80472a", planks: 7, seed: 21 })}
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(180deg,rgba(40,15,0,.2),rgba(40,15,0,0) 30%,rgba(40,15,0,.25))")}"></div>
  <div style="${abs(20, 898, 960, 14, "background:#f1e6cc;border-radius:7px;box-shadow:0 5px 8px rgba(25,10,0,.4)")}"></div>
  ${cards}${frost}
  ${leafPile({ x: 20, y: 1130, w: 520, h: 200, n: 90, seed: 3 })}
  ${pumpkin({ x: 600, y: 1140, w: 230, rot: -3 })}${pumpkin({ x: 800, y: 1204, w: 150, c: "#e0912f", ribs: "#bd6a1c", rot: 6 })}
  ${rake({ x: 470, y: 1100, len: 290, rot: 24 })}
  ${scatter([[560, 1120, 0.9], [940, 1100, 0.8], [30, 1060, 0.8], [330, 1090, 0.7]], 9)}`;
  return printable({ n: 53, scene, paper: "#f1e5d3", bottomMax: 368 });
}

/* ---------- #55 checklist: navy front door, brass wreath hook, a list on the porch bench ---------- */
function pin55() {
  const rows = ["Book the professional furnace tune-up now", "Seal the gaps mice use, around pipes and the garage door", "Put in a new furnace filter", "Book the chimney inspection if you burn anything", "Clean the dryer vent"];
  const rowH = 122, listX = 52, listY = 408, listW = 640, listH = 704;
  const lines = rows.map((t, k) => {
    const chimney = k === 3;
    return `<div style="${abs(0, 56 + k * rowH, listW, rowH, `border-top:2px solid #b9c7d2;display:flex;align-items:center;gap:20px;padding:0 30px 0 34px;box-sizing:border-box;${chimney ? "background:linear-gradient(90deg,rgba(138,90,17,.12),rgba(138,90,17,0))" : ""}`)}">
      ${chimney ? `<span style="${abs(0, 14, 8, rowH - 28, `background:${C.ochre};border-radius:0 4px 4px 0`)}"></span>` : ""}
      ${tick(36, false, chimney ? C.ochre : C.sage)}<span class="serif" style="font-size:35px;line-height:1.1;font-weight:500;color:${C.ink}">${esc(t)}</span></div>`;
  }).join("");
  const panels = [[70, 440, 380, 300], [560, 440, 380, 300], [70, 800, 380, 280], [560, 800, 380, 280]].map(([x, y, w, h]) => `<div style="${abs(x, y, w, h, "border:5px solid rgba(0,0,0,.28);border-radius:6px;box-shadow:inset 0 3px 6px rgba(0,0,0,.25),0 2px 0 rgba(255,255,255,.12)")}"></div>`).join("");
  const scene = `
  <div style="${abs(0, 372, 1000, 740, "background:linear-gradient(90deg,#27404d,#2f4a58 40%,#2a4452)")}"></div>
  <div style="${abs(0, 372, 1000, 740, "background:radial-gradient(circle at 70% 10%,rgba(255,255,255,.12),transparent 55%)")}"></div>
  ${panels}
  <div style="${abs(0, 372, 1000, 10, "background:#1d2f3a")}"></div>
  <svg style="${abs(780, 398, 80, 90, "filter:drop-shadow(0 8px 5px rgba(0,0,0,.45))")}" viewBox="0 0 80 90" aria-hidden="true"><path d="M40 6 C 12 6 10 40 40 40 C 70 40 68 6 40 6Z" fill="none" stroke="#c9962f" stroke-width="9"/><circle cx="40" cy="46" r="12" fill="#e0b247"/><circle cx="40" cy="46" r="5" fill="#8a6a1c"/></svg>
  ${scarf({ x: 808, y: 436, w: 112, h: 380, rot: 2 })}
  <div style="${abs(0, 1112, 1000, 56, "background:linear-gradient(#d3a66a,#b98a52);box-shadow:0 -4px 10px rgba(0,0,0,.3)")}"></div>
  <div style="${abs(0, 1168, 1000, 36, "background:#8a6234;box-shadow:0 8px 14px rgba(0,0,0,.4)")}"></div>
  <div style="${abs(0, 1204, 1000, 170, "background:linear-gradient(#5a4a3c,#3e3228)")}"></div>
  ${Array.from({ length: 9 }, (_, k) => `<div style="${abs(k * 125, 1204, 3, 170, "background:#000;opacity:.25")}"></div>`).join("")}
  ${leafPile({ x: 560, y: 1226, w: 400, h: 120, n: 40, seed: 11, size: 0.9 })}
  <div data-check="list" style="${abs(listX, listY, listW, listH, "transform:rotate(-1deg);background:#fbfaf6;border-radius:6px;box-shadow:0 3px 5px rgba(0,0,0,.3),0 24px 40px rgba(0,0,0,.45);overflow:hidden")}">
    <div style="${abs(0, 0, listW, 40, `background:${C.sage}`)}"></div>
    <div style="${abs(0, 0, listW, listH)}">${lines}</div></div>
  ${filterProp({ x: 760, y: 856, w: 190, h: 262, rot: 3 })}
  ${caulk({ x: 705, y: 920, s: 0.7, rot: -4 })}
  ${hoseCoil({ x: 440, y: 1066, w: 230, rot: -4 })}
  ${pumpkin({ x: 70, y: 1204, w: 210, rot: -4 })}${pumpkin({ x: 290, y: 1252, w: 120, c: "#e0912f", ribs: "#bd6a1c", rot: 8 })}
`;
  return printable({ n: 55, scene, paper: "#e5e9e8", bottomMax: 368 });
}

/* ---------- #57 scenario: one gutter, October above and November below ---------- */
function panelHouse({ kind }) {
  const oct = kind === "oct";
  const clap = Array.from({ length: 12 }, (_, k) => `<div style="${abs(0, 96 + k * 22, 470, 2, "background:#000;opacity:.1")}"></div>`).join("");
  const gutterLeaves = oct ? "" : [60, 118, 176, 240, 302, 358, 416].map((lx, k) => leaf({ x: lx - 6, y: 62 + (k % 2) * 4, s: 1.15, rot: k * 53, c: LEAF[k % LEAF.length] })).join("");
  const crown = oct
    ? (() => { const r = rng(4); return Array.from({ length: 70 }, () => { const a = r() * Math.PI * 2, d = Math.sqrt(r()); return leaf({ x: 700 + Math.cos(a) * d * 230 - 24, y: 100 + Math.sin(a) * d * 120 - 24, s: 0.95 + r() * 0.5, rot: r() * 360, c: LEAF[Math.floor(r() * LEAF.length)] }); }).join(""); })()
    : "";
  const branches = `<svg style="${abs(0, 0, 1000, 420)}" viewBox="0 0 1000 420" aria-hidden="true"><path d="M648 400 C 650 300 646 220 640 170 M646 250 C 700 220 760 190 840 160 M644 200 C 600 170 560 150 520 130 M648 290 C 720 270 800 250 880 240 M646 330 C 600 300 560 290 520 288" fill="none" stroke="#4a3a30" stroke-width="${oct ? 12 : 11}" stroke-linecap="round"/>${oct ? "" : `<path d="M840 160 l40 -26 M840 160 l30 22 M520 130 l-30 -22 M880 240 l36 -14" stroke="#4a3a30" stroke-width="6" stroke-linecap="round"/>`}</svg>`;
  const ground = oct
    ? `<div style="${abs(0, 340, 1000, 80, "background:#8a9a6a")}"></div><div style="${abs(0, 340, 1000, 6, "background:#6f7f52")}"></div>`
    : `<div style="${abs(0, 340, 1000, 80, "background:#7d7f5c")}"></div><div style="${abs(0, 340, 1000, 6, "background:#62643f")}"></div>${leafPile({ x: 470, y: 300, w: 460, h: 100, n: 60, seed: 8, size: 0.9 })}`;
  const ladder = oct
    ? `<svg style="${abs(360, 70, 120, 292, "filter:drop-shadow(0 6px 5px rgba(0,0,0,.35))")}" viewBox="0 0 120 292" aria-hidden="true"><path d="M92 0 L28 292 M112 0 L48 292" stroke="#c4c9cc" stroke-width="9" fill="none" stroke-linecap="round"/>${[0.1, 0.24, 0.38, 0.52, 0.66, 0.8, 0.94].map((f) => `<path d="M${92 - 64 * f} ${292 * f} L${112 - 64 * f} ${292 * f}" stroke="#9aa0a5" stroke-width="7" stroke-linecap="round"/>`).join("")}</svg>`
    : "";
  const rain = oct ? "" : [[40, 154], [30, 190], [52, 232], [34, 280]].map(([dx, dy]) => `<path d="M${dx} ${dy} c -7 11 -7 17 0 20 c 7 -3 7 -9 0 -20Z" fill="${C.slate}" opacity=".85"/>`).join("");
  const label = oct ? ["Early October", "gutters cleared"] : ["November", "full again"];
  return `
  <div style="${abs(0, 0, 1000, 420, `background:${oct ? "linear-gradient(#cfdde0,#e6ecea)" : "linear-gradient(#a7b0b7,#c3c8ca)"}`)}"></div>
  <div style="${abs(0, 0, 470, 346, "background:#ece6d6")}"></div>${clap}
  <div style="${abs(0, 0, 500, 62, "background:#6b5b53;box-shadow:0 6px 10px rgba(0,0,0,.25)")}"></div>
  <div style="${abs(0, 62, 500, 12, "background:#eceae4")}"></div>
  <div style="${abs(0, 74, 500, 24, "background:#c4c9cc;border-radius:0 0 12px 12px;box-shadow:0 5px 8px rgba(0,0,0,.25)")}"></div>
  <div style="${abs(14, 98, 20, 250, "background:linear-gradient(90deg,#d6dadc,#aeb4b7)")}"></div>
  ${ground}${gutterLeaves}${rain}${ladder}${branches}${crown}
  <div style="${abs(24, 120, 320, 100, "background:#fbfaf6;border-radius:12px;box-shadow:0 3px 4px rgba(0,0,0,.25),0 14px 22px rgba(0,0,0,.3);padding:12px 20px;box-sizing:border-box")}"><div class="serif" style="font-size:40px;line-height:1.05;font-weight:600;color:${C.sageDeep}">${label[0]}</div><div style="font:500 28px/1.3 'Plex',sans-serif;color:${C.ink};margin-top:2px">${label[1]}</div></div>`;
}

function pin57() {
  const w = 920, h = 386;
  const frame = (y, inner) => `<div style="${abs(40, y, w, h, "border-radius:14px;overflow:hidden;box-shadow:0 3px 4px rgba(0,0,0,.3),0 20px 34px rgba(30,30,40,.4)")}"><div style="${abs(0, 0, 1000, 420, "overflow:hidden;transform-origin:0 0;transform:scale(.92)")}">${inner}</div></div>`;
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:#c9ccc6")}"></div>
  ${frame(396, panelHouse({ kind: "oct" }))}
  ${frame(806, panelHouse({ kind: "nov" }))}
  <div data-check="banner" style="${abs(40, 1226, 920, 90, `background:${C.sage};border-radius:12px;box-shadow:0 3px 4px rgba(0,0,0,.3),0 14px 22px rgba(0,0,0,.3);display:flex;align-items:center;gap:16px;padding:0 26px;box-sizing:border-box`)}">${icon("arrow-down", { size: 34, color: "#fff", weight: "bold" })}<span class="serif" style="font-size:38px;font-weight:500;color:#fff;white-space:nowrap">Clear them once the leaves are down, not before</span></div>`;
  return printable({ n: 57, scene, paper: "#e7e8e2", bottomMax: 368 });
}

/* ---------- #61 question: oatmeal-and-sage wool plaid, a split card ---------- */
function plaid(y, h) {
  return `<div style="${abs(0, y, 1000, h, "background:#667565")}"></div>
  <div style="${abs(0, y, 1000, h, "background:repeating-linear-gradient(90deg,transparent 0 80px,rgba(239,228,205,.28) 80px 120px,transparent 120px 200px,rgba(30,40,32,.35) 200px 212px,transparent 212px 260px)")}"></div>
  <div style="${abs(0, y, 1000, h, "background:repeating-linear-gradient(0deg,transparent 0 80px,rgba(239,228,205,.28) 80px 120px,transparent 120px 200px,rgba(30,40,32,.35) 200px 212px,transparent 212px 260px)")}"></div>
  <div style="${abs(0, y, 1000, h, "background:repeating-linear-gradient(90deg,transparent 0 160px,rgba(184,69,42,.5) 160px 164px,transparent 164px 520px);opacity:.9")}"></div>
  <div style="${abs(0, y, 1000, h, "background:repeating-linear-gradient(45deg,rgba(0,0,0,.05) 0 2px,transparent 2px 5px)")}"></div>
  <div style="${abs(0, y, 1000, h, "background:radial-gradient(circle at 30% 10%,rgba(255,255,255,.12),rgba(10,20,10,.3))")}"></div>`;
}

function pin61() {
  const left = [["Heating checks", furnaceSvg], ["Alarm tests", alarmSvg], ["The dryer vent", dryerVentSvg], ["Gutters", (o) => gutterCard({ x: o.x - 2, y: o.y + 14, w: 100, full: false })], ["Pest gaps", pipeGapSvg]];
  const rowH = 126, lx = 40, lw = 560, ly = 402;
  const rows = left.map(([t, art], k) => `<div style="${abs(0, 112 + k * rowH, lw, rowH, `border-top:2px solid ${C.rule};display:flex;align-items:center;gap:22px;padding:0 24px;box-sizing:border-box`)}">
    <span style="position:relative;flex:none;display:block;width:100px;height:100px;border-radius:12px;overflow:hidden;background:#f1efe6">${art({ x: 8, y: 8, w: 84 })}</span>
    <span class="serif" style="font-size:40px;line-height:1.05;font-weight:500;color:${C.ink};flex:1">${t}</span>${tick(40, true)}</div>`).join("");
  const leftCard = `<div data-check="card" style="${abs(lx, ly, lw, 764, "background:#fbfaf6;border-radius:14px;box-shadow:0 3px 4px rgba(10,20,10,.3),0 22px 38px rgba(10,20,10,.4);overflow:hidden")}">
    <div style="${abs(0, 0, lw, 100, `background:${C.sage}`)}"></div><div class="serif" style="${abs(28, 0, lw - 40, 100, "font-size:62px;line-height:100px;font-weight:500;color:#fff")}">Some of it.</div>${rows}</div>`;
  const rx = 630, rw = 330;
  const rightCard = `<div data-check="card" style="${abs(rx, ly, rw, 580, "background:#f1efe6;border-radius:14px;box-shadow:0 3px 4px rgba(10,20,10,.3),0 22px 38px rgba(10,20,10,.4);overflow:hidden")}">
    <div style="${abs(0, 0, rw, 100, "background:#8a7f6d")}"></div><div class="serif" style="${abs(26, 0, rw - 40, 100, "font-size:48px;line-height:100px;font-weight:500;color:#fff")}">The freeze jobs</div>
    <div style="${abs(22, 124, 190, 150, "")}">${tapSvg({ x: 0, y: 0, w: 190, hose: false, wall: "#e2dccb" })}</div>
    <div class="serif" style="${abs(216, 112, 100, 170, `font-size:190px;line-height:170px;font-weight:500;color:${C.sageDeep};text-align:center`)}">?</div>
    <div style="${abs(26, 310, rw - 52, 270, `font:500 34px/1.28 'Plex',sans-serif;color:${C.ink}`)}">depend on whether your area gets hard freezes.</div></div>`;
  const scene = `
  ${plaid(372, 1000)}
  ${leftCard}${rightCard}
  ${pumpkin({ x: 640, y: 1090, w: 190, rot: 3 })}${pumpkin({ x: 810, y: 1160, w: 140, c: "#e0912f", ribs: "#bd6a1c", rot: -6 })}
  ${scatter([[930, 1060, 0.9, 20], [640, 1220, 0.8, 200], [725, 1260, 0.7, 120]], 14)}`;
  return printable({ n: 61, scene, paper: "#e8ece4", bottomMax: 368 });
}

export const pins = [pin49(), pin53(), pin55(), pin57(), pin61()];
