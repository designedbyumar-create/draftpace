/**
 * Group I: spring patio and garden. Home Base guide pins #54, #56, #41, #43, #45, #47.
 * Six different surfaces: grey flagstones with mossy joints (54), a pale painted slatted garden
 * table (56), mown lawn stripes (41), a butter-yellow clapboard wall with an outdoor tap (43),
 * herringbone brick paving (45) and pale grey decking (47). All illustration is drawn here;
 * no workbook page or app screen is used on these pins.
 */
import { esc } from "../../v3/kit.mjs";
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SOFT = "0 3px 4px rgba(30,40,25,.28),0 16px 26px rgba(30,40,25,.28)";

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

/* ---------------------------------------------------------------- surfaces */

/** Irregular grey flagstones laid on a mossy joint colour. */
function flagstone({ top = 372, h = 982 }) {
  const r = rng(7);
  const cols = 5, rows = 6, cw = 1000 / cols, ch = h / rows;
  const pts = [];
  for (let j = 0; j <= rows; j++) {
    pts.push([]);
    for (let i = 0; i <= cols; i++) {
      const jx = i === 0 || i === cols ? 0 : (r() - 0.5) * 70;
      const jy = j === 0 || j === rows ? 0 : (r() - 0.5) * 60;
      pts[j].push([i * cw + jx, j * ch + jy]);
    }
  }
  const greys = ["#c9cdc6", "#bec5bc", "#d3d6cf", "#b8bfb3", "#cdd0c4", "#c2c6bc"];
  const cells = [];
  const moss = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const q = [pts[j][i], pts[j][i + 1], pts[j + 1][i + 1], pts[j + 1][i]];
    const cx = q.reduce((a, b) => a + b[0], 0) / 4, cy = q.reduce((a, b) => a + b[1], 0) / 4;
    const sh = q.map(([x, y]) => `${(cx + (x - cx) * 0.93).toFixed(1)},${(cy + (y - cy) * 0.93).toFixed(1)}`).join(" ");
    cells.push(`<polygon points="${sh}" fill="${greys[Math.floor(r() * greys.length)]}" stroke="#a9b1a1" stroke-width="3" stroke-linejoin="round"/>`);
    cells.push(`<polygon points="${sh}" fill="url(#fsl)" />`);
    if (r() > 0.45) moss.push(`<circle cx="${(cx + (r() - 0.5) * cw * 0.9).toFixed(0)}" cy="${(cy + (r() - 0.5) * ch * 0.9).toFixed(0)}" r="${(3 + r() * 5).toFixed(1)}" fill="#6f8f5a" opacity=".45"/>`);
  }
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><defs><linearGradient id="fsl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#2c3a28" stop-opacity=".12"/></linearGradient></defs><rect width="1000" height="${h}" fill="#7d8d70"/>${cells.join("")}${moss.join("")}</svg>`;
}

/** A pale painted slatted garden table top. */
function slatTable({ top = 372, h = 982 }) {
  const n = 8, bh = h / n, gap = 7, r = rng(5);
  const boards = [];
  for (let k = 0; k < n; k++) {
    const y = k * bh;
    boards.push(`<rect x="0" y="${y + gap / 2}" width="1000" height="${bh - gap}" fill="${k % 2 ? "#e4ebdf" : "#d8e2d4"}"/>`);
    boards.push(`<rect x="0" y="${y + gap / 2}" width="1000" height="6" fill="#fff" opacity=".35"/>`);
    for (let g = 0; g < 6; g++) {
      const gy = y + 14 + r() * (bh - 30);
      boards.push(`<path d="M${r() * 300} ${gy} C 400 ${gy + (r() - 0.5) * 8}, 700 ${gy + (r() - 0.5) * 8}, 1000 ${gy + (r() - 0.5) * 6}" fill="none" stroke="#9fb09b" stroke-opacity=".35" stroke-width="1.6"/>`);
    }
    boards.push(`<circle cx="22" cy="${y + bh / 2}" r="6" fill="#8d9a8a"/><circle cx="978" cy="${y + bh / 2}" r="6" fill="#8d9a8a"/>`);
  }
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><rect width="1000" height="${h}" fill="#4c5a4a"/>${boards.join("")}<rect width="1000" height="${h}" fill="url(#tbl)"/><defs><radialGradient id="tbl" cx="25%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#1f2a1e" stop-opacity=".22"/></radialGradient></defs></svg>`;
}

/** Mown lawn stripes. */
function lawn({ top = 372, h = 982 }) {
  const stripes = Array.from({ length: 8 }, (_, k) => `<rect x="${k * 125}" y="0" width="125" height="${h}" fill="${k % 2 ? "#6aa05d" : "#5d9153"}"/>`).join("");
  const r = rng(11);
  const blades = Array.from({ length: 120 }, () => {
    const x = r() * 1000, y = r() * h;
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l ${(r() * 6 - 3).toFixed(1)} -9" stroke="#3f6f3b" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>`;
  }).join("");
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><defs><radialGradient id="lw" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#14301a" stop-opacity=".3"/></radialGradient></defs>${stripes}${blades}<rect width="1000" height="${h}" fill="url(#lw)"/></svg>`;
}

/** Butter-yellow painted clapboard. */
function clapboard({ top = 372, h = 982 }) {
  const bh = 66, n = Math.ceil(h / bh);
  const boards = Array.from({ length: n }, (_, k) => `<rect x="0" y="${k * bh}" width="1000" height="${bh}" fill="#efdf9d"/><rect x="0" y="${k * bh}" width="1000" height="4" fill="#fbf1c4"/><rect x="0" y="${k * bh + bh - 12}" width="1000" height="12" fill="#c9b36a" opacity=".55"/><rect x="0" y="${k * bh + bh - 3}" width="1000" height="3" fill="#6e5d28" opacity=".5"/>`).join("");
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${boards}<rect width="1000" height="${h}" fill="url(#cb)"/><defs><radialGradient id="cb" cx="30%" cy="15%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#3a2f0c" stop-opacity=".22"/></radialGradient></defs></svg>`;
}

/** Brick paving, laid on the diagonal. */
function brick({ top = 372, h = 982 }) {
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><defs>
  <pattern id="brk" width="96" height="48" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="96" height="48" fill="#c8b09c"/>
    <rect x="2" y="2" width="44" height="20" rx="2" fill="#b8705a"/><rect x="50" y="2" width="44" height="20" rx="2" fill="#c3806a"/>
    <rect x="-22" y="26" width="44" height="20" rx="2" fill="#ad6650"/><rect x="26" y="26" width="44" height="20" rx="2" fill="#bd7660"/><rect x="74" y="26" width="44" height="20" rx="2" fill="#b56c56"/>
  </pattern>
  <radialGradient id="brl" cx="25%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#3b1a10" stop-opacity=".3"/></radialGradient></defs>
  <rect width="1000" height="${h}" fill="url(#brk)"/><rect width="1000" height="${h}" fill="url(#brl)"/></svg>`;
}

/** Pale grey decking, boards running top to bottom. */
function decking({ top = 372, h = 982 }) {
  const n = 7, bw = 1000 / n, r = rng(9);
  const boards = [];
  for (let k = 0; k < n; k++) {
    const x = k * bw;
    boards.push(`<rect x="${x + 3}" y="0" width="${bw - 6}" height="${h}" fill="${k % 2 ? "#d9d5c8" : "#cfcabc"}"/>`);
    boards.push(`<rect x="${x + 3}" y="0" width="7" height="${h}" fill="#fff" opacity=".28"/>`);
    for (let g = 0; g < 7; g++) {
      const gx = x + 14 + r() * (bw - 28);
      boards.push(`<path d="M${gx.toFixed(0)} 0 C ${(gx + (r() - 0.5) * 8).toFixed(0)} 300, ${(gx + (r() - 0.5) * 8).toFixed(0)} 700, ${gx.toFixed(0)} ${h}" stroke="#8f8a78" stroke-opacity=".28" stroke-width="1.6" fill="none"/>`);
    }
    for (const y of [120, 520, 920]) boards.push(`<circle cx="${x + 24}" cy="${y}" r="4.5" fill="#8f8a78"/><circle cx="${x + bw - 24}" cy="${y}" r="4.5" fill="#8f8a78"/>`);
  }
  return `<svg style="${abs(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><rect width="1000" height="${h}" fill="#5f5d52"/>${boards.join("")}<rect width="1000" height="${h}" fill="url(#dk)"/><defs><radialGradient id="dk" cx="30%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#2a2820" stop-opacity=".2"/></radialGradient></defs></svg>`;
}

/* ---------------------------------------------------------------- patio props */

/** A garden trowel with a sage-painted handle. */
function trowel({ x, y, len = 420, rot = 0 }) {
  const h = len * 0.2;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(30,25,10,.4))`)}" viewBox="0 0 420 84" aria-hidden="true">
  <path d="M2 42 C 40 8, 112 6, 172 24 L 192 32 L 192 52 L 172 60 C 112 78, 40 76, 2 42Z" fill="#c9d0d3"/>
  <path d="M10 42 C 50 22, 110 20, 180 38" stroke="#fff" stroke-opacity=".7" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M10 44 C 50 66, 110 64, 180 48" stroke="#7d868a" stroke-opacity=".55" stroke-width="3" fill="none"/>
  <rect x="188" y="36" width="74" height="12" fill="#9aa2a6"/><rect x="250" y="28" width="30" height="28" rx="5" fill="#7d868a"/>
  <rect x="276" y="26" width="138" height="32" rx="16" fill="${C.sage}"/><rect x="280" y="30" width="128" height="8" rx="4" fill="#fff" opacity=".25"/>
  <circle cx="394" cy="42" r="6" fill="#2b3a30"/></svg>`;
}

/** Three papery tulip bulbs. */
function bulbs({ x, y, size = 240, rot = 0 }) {
  const bulb = (cx, cy, s, r) => `<g transform="translate(${cx} ${cy}) rotate(${r}) scale(${s})">
    <path d="M0 -54 C 6 -34 38 -24 38 8 C 38 36 20 50 0 50 C -20 50 -38 36 -38 8 C -38 -24 -6 -34 0 -54Z" fill="#d9b878"/>
    <path d="M0 -54 C 6 -34 38 -24 38 8 C 38 36 20 50 0 50 Z" fill="#000" opacity=".06"/>
    <path d="M-14 -18 C -26 6 -22 30 -8 44 M12 -22 C 24 0 24 28 10 44" stroke="#9a7a3f" stroke-width="2.5" fill="none" opacity=".55" stroke-linecap="round"/>
    <path d="M-22 -4 C -26 8 -22 22 -14 30" stroke="#fff" stroke-opacity=".4" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M-12 52 l -6 14 M-4 52 l -2 16 M4 52 l 2 16 M12 52 l 6 14" stroke="#c9a468" stroke-width="3" stroke-linecap="round"/></g>`;
  return `<svg style="${abs(x, y, size, size * 0.62, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(30,25,10,.38))`)}" viewBox="0 0 300 186" aria-hidden="true">${bulb(70, 100, 1, -12)}${bulb(158, 92, 1.12, 6)}${bulb(238, 108, 0.92, 22)}</svg>`;
}

/** A hose reel: coiled green hose on a sage frame. */
function hoseReel({ x, y, size = 250 }) {
  const rings = [88, 76, 64, 52, 42].map((r) => `<circle cx="130" cy="124" r="${r}" fill="none" stroke="#5e9a59" stroke-width="11"/><circle cx="130" cy="124" r="${r}" fill="none" stroke="#2f5a2f" stroke-opacity=".35" stroke-width="2" transform="translate(0 4)"/>`).join("");
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 14px 9px rgba(20,35,15,.4))")}" viewBox="0 0 260 260" aria-hidden="true">
  <path d="M60 250 L 100 150 H 160 L 200 250 Z" fill="#3e6249"/><rect x="40" y="244" width="180" height="12" rx="5" fill="#2f4c38"/>
  <circle cx="130" cy="124" r="106" fill="#3e6249"/>${rings}
  <circle cx="130" cy="124" r="22" fill="#9aa2a6"/><circle cx="130" cy="124" r="8" fill="#5f686c"/>
  <path d="M130 124 L 214 52" stroke="#9aa2a6" stroke-width="9" stroke-linecap="round"/><circle cx="216" cy="50" r="12" fill="#c9962f"/>
  <path d="M218 140 C 240 170 236 210 214 236" stroke="#5e9a59" stroke-width="11" fill="none" stroke-linecap="round"/><rect x="204" y="230" width="22" height="20" rx="4" fill="#c9962f"/></svg>`;
}

/** A wheelbarrow of soil with bulbs on top. */
function wheelbarrow({ x, y, w = 400, rot = 0 }) {
  return `<svg style="${abs(x, y, w, w * 0.68, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 10px rgba(20,35,15,.4))`)}" viewBox="0 0 380 258" aria-hidden="true">
  <path d="M14 112 L 130 52 L 150 64 L 38 124Z" fill="#b98a52"/><path d="M130 52 H 296" stroke="#b98a52" stroke-width="12" stroke-linecap="round"/>
  <path d="M232 150 L 200 236" stroke="#6a5030" stroke-width="10" stroke-linecap="round"/><path d="M132 150 L 100 236" stroke="#6a5030" stroke-width="10" stroke-linecap="round"/>
  <path d="M70 70 H 306 L 270 168 Q 266 178 254 178 H 130 Q 118 178 114 168Z" fill="#3e6249"/>
  <path d="M70 70 H 306 L 300 90 H 76Z" fill="#6f9a7a"/>
  <path d="M84 70 C 100 28, 150 14, 190 22 C 240 12, 286 36, 292 70Z" fill="#4a3526"/>
  <path d="M120 40 C 140 30, 170 32, 190 36" stroke="#6a4c36" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
  <g transform="translate(150 38) rotate(-14)"><path d="M0 -20 C 3 -12 15 -9 15 3 C 15 14 8 20 0 20 C -8 20 -15 14 -15 3 C -15 -9 -3 -12 0 -20Z" fill="#d9b878"/></g>
  <g transform="translate(218 30) rotate(10)"><path d="M0 -20 C 3 -12 15 -9 15 3 C 15 14 8 20 0 20 C -8 20 -15 14 -15 3 C -15 -9 -3 -12 0 -20Z" fill="#e0c286"/></g>
  <circle cx="320" cy="196" r="52" fill="#26282b"/><circle cx="320" cy="196" r="34" fill="#9aa2a6"/><circle cx="320" cy="196" r="9" fill="#5f686c"/>
  <path d="M290 150 L 312 190" stroke="#6a5030" stroke-width="9" stroke-linecap="round"/></svg>`;
}

/** A stone bird bath with a shallow bowl of water. */
function birdBath({ x, y, size = 330 }) {
  return `<svg style="${abs(x, y, size * 0.66, size, "filter:drop-shadow(0 16px 10px rgba(30,30,20,.4))")}" viewBox="0 0 220 333" aria-hidden="true"><defs><linearGradient id="bbs" x1="0" x2="1"><stop offset="0" stop-color="#c7c9c0"/><stop offset=".55" stop-color="#e3e4dc"/><stop offset="1" stop-color="#a9ac9f"/></linearGradient></defs>
  <path d="M6 66 C 6 112 50 130 110 130 C 170 130 214 112 214 66Z" fill="url(#bbs)"/><ellipse cx="110" cy="64" rx="104" ry="26" fill="#d8dad1"/>
  <ellipse cx="110" cy="64" rx="86" ry="19" fill="#9db4bd"/><ellipse cx="96" cy="60" rx="46" ry="8" fill="#fff" opacity=".4"/>
  <path d="M84 130 C 90 150 92 164 88 180 H 132 C 128 164 130 150 136 130Z" fill="url(#bbs)"/><rect x="72" y="178" width="76" height="16" rx="6" fill="url(#bbs)"/>
  <path d="M90 194 H 130 C 128 240 136 270 150 300 H 70 C 84 270 92 240 90 194Z" fill="url(#bbs)"/>
  <ellipse cx="110" cy="312" rx="92" ry="16" fill="url(#bbs)"/><path d="M18 312 V 324 C 40 336 180 336 202 324 V 312Z" fill="#a9ac9f"/></svg>`;
}

/** A long wooden planter of cream and butter tulips. */
function plantBox({ x, y, w = 420, rot = 0 }) {
  const heads = [[40, 62, "#f0d58a"], [92, 40, "#fbfaf6"], [150, 66, "#f0d58a"], [204, 36, "#fbfaf6"], [262, 60, "#f0d58a"], [318, 42, "#fbfaf6"]];
  const stems = heads.map(([cx, cy, col]) => `<path d="M${cx} 148 C ${cx - 4} 110 ${cx + 4} 90 ${cx} ${cy + 18}" stroke="#4f7a5c" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M${cx - 15} ${cy + 18} C ${cx - 16} ${cy - 6} ${cx - 6} ${cy - 16} ${cx} ${cy - 20} C ${cx + 6} ${cy - 16} ${cx + 16} ${cy - 6} ${cx + 15} ${cy + 18} C ${cx + 8} ${cy + 26} ${cx - 8} ${cy + 26} ${cx - 15} ${cy + 18}Z" fill="${col}"/><path d="M${cx - 6} ${cy - 18} L ${cx} ${cy + 8} L ${cx + 6} ${cy - 18}" stroke="#000" stroke-opacity=".1" stroke-width="2" fill="none"/>`).join("");
  const leaves = [40, 110, 180, 250, 320].map((cx) => `<path d="M${cx} 150 C ${cx - 40} 120 ${cx - 46} 92 ${cx - 36} 76 C ${cx - 10} 96 ${cx + 2} 120 ${cx} 150Z" fill="#5d9168"/><path d="M${cx} 150 C ${cx + 38} 124 ${cx + 48} 96 ${cx + 38} 82 C ${cx + 12} 100 ${cx} 124 ${cx} 150Z" fill="#4f7a5c"/>`).join("");
  return `<svg style="${abs(x, y, w, w * 0.52, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,25,10,.4))`)}" viewBox="0 0 360 187" aria-hidden="true">${leaves}${stems}
  <path d="M0 146 H 360 L 346 186 H 14Z" fill="#b98a52"/><path d="M0 146 H 360 V 156 H 0Z" fill="#d1a56a"/><path d="M4 166 H 356" stroke="#8a6234" stroke-opacity=".5" stroke-width="2"/><rect x="0" y="144" width="360" height="5" fill="#4a3526"/></svg>`;
}

/* ---------------------------------------------------------------- small drawings (inside cards) */

const svgBox = (w, h, inner, extra = "") => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;${extra}" aria-hidden="true">${inner}</svg>`;

function washerArt(s = 1) {
  return svgBox(180 * s, 200 * s, `<g transform="scale(${s})"><rect x="14" y="8" width="152" height="184" rx="14" fill="#f5f4ee" stroke="#9aa89c" stroke-width="3"/><rect x="14" y="8" width="152" height="40" rx="14" fill="#e6e9e1"/><rect x="26" y="22" width="52" height="12" rx="6" fill="#c3cabf"/><circle cx="124" cy="28" r="10" fill="${C.sage}"/><circle cx="148" cy="28" r="5" fill="#9aa89c"/><circle cx="90" cy="116" r="54" fill="#fff" stroke="#9aa89c" stroke-width="5"/><circle cx="90" cy="116" r="42" fill="#a9c0bb"/><circle cx="90" cy="116" r="42" fill="none" stroke="#6f8f89" stroke-width="3"/><path d="M62 98 C 74 84 94 82 108 90" stroke="#fff" stroke-opacity=".7" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M70 124 q 20 12 40 -2" stroke="#fff" stroke-opacity=".5" stroke-width="4" fill="none"/><rect x="26" y="182" width="16" height="10" fill="#9aa89c"/><rect x="138" y="182" width="16" height="10" fill="#9aa89c"/></g>`);
}

function roofFurnaceArt(s = 1) {
  return svgBox(220 * s, 200 * s, `<g transform="scale(${s})"><rect x="150" y="12" width="26" height="46" fill="#a58a76"/><rect x="146" y="8" width="34" height="10" fill="#8a6f5c"/><path d="M8 84 L110 12 L212 84Z" fill="${C.sageDeep}"/><path d="M8 84 L110 12 L212 84 L198 84 L110 22 L22 84Z" fill="#fff" opacity=".18"/><path d="M22 84 H198 V190 H22Z" fill="#f2efe4" stroke="#9aa89c" stroke-width="3"/><rect x="56" y="100" width="108" height="82" rx="8" fill="#cfd6d2" stroke="#8c9a8e" stroke-width="3"/>${[0, 1, 2, 3].map((k) => `<rect x="70" y="${112 + k * 12}" width="80" height="6" rx="3" fill="#aab5ad"/>`).join("")}<circle cx="72" cy="164" r="6" fill="${C.sage}"/><rect x="116" y="156" width="36" height="16" rx="3" fill="#fff" stroke="#9aa89c" stroke-width="2"/></g>`);
}

function alarmArt(s = 1, ring = C.sage) {
  return svgBox(130 * s, 130 * s, `<g transform="scale(${s})"><circle cx="65" cy="65" r="58" fill="#f6f4ee" stroke="${ring}" stroke-width="6"/><circle cx="65" cy="65" r="44" fill="none" stroke="#c3cabf" stroke-width="3"/><circle cx="65" cy="65" r="30" fill="none" stroke="#c3cabf" stroke-width="3"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="${65 + 14 * Math.cos((a * Math.PI) / 180)}" y1="${65 + 14 * Math.sin((a * Math.PI) / 180)}" x2="${65 + 40 * Math.cos((a * Math.PI) / 180)}" y2="${65 + 40 * Math.sin((a * Math.PI) / 180)}" stroke="#c3cabf" stroke-width="3"/>`).join("")}<circle cx="65" cy="65" r="9" fill="#e3e0d4" stroke="#9aa89c" stroke-width="2"/><circle cx="104" cy="28" r="6" fill="${ring}"/></g>`);
}

function filterArt(s = 1) {
  const pleats = Array.from({ length: 9 }, (_, k) => `${16 + k * 11},${k % 2 ? 100 : 22}`).join(" ");
  return svgBox(130 * s, 130 * s, `<g transform="scale(${s})"><rect x="6" y="10" width="118" height="110" rx="4" fill="#c8a679"/><rect x="14" y="18" width="102" height="94" fill="#fbfaf6"/><polyline points="${Array.from({ length: 10 }, (_, k) => `${14 + k * 11.3},${k % 2 ? 108 : 24}`).join(" ")}" fill="none" stroke="#9aa89c" stroke-width="3" stroke-linejoin="round"/><path d="M14 18 H116" stroke="#cdd6c8" stroke-width="2"/><path d="M44 66 H 88 M76 54 L 90 66 L 76 78" stroke="${C.sage}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".0"/></g>`);
}

function lintArt(s = 1) {
  return svgBox(130 * s, 130 * s, `<g transform="scale(${s})"><rect x="48" y="58" width="34" height="80" rx="17" fill="#e8c4a0"/><rect x="48" y="58" width="12" height="80" rx="6" fill="#fff" opacity=".25"/><rect x="22" y="14" width="86" height="56" rx="8" fill="#e7ebe6" stroke="#8c9a8e" stroke-width="3"/>${Array.from({ length: 8 }, (_, k) => `<line x1="${30 + k * 10}" y1="20" x2="${30 + k * 10}" y2="64" stroke="#b5bfb6" stroke-width="1.6"/>`).join("")}${Array.from({ length: 5 }, (_, k) => `<line x1="26" y1="${24 + k * 9}" x2="104" y2="${24 + k * 9}" stroke="#b5bfb6" stroke-width="1.6"/>`).join("")}<path d="M34 36 C 44 24 60 28 70 32 C 84 24 98 34 92 46 C 100 56 84 60 72 56 C 60 62 40 60 36 52 C 28 48 28 42 34 36Z" fill="#bcbcb4"/><path d="M42 42 C 52 36 64 40 74 38" stroke="#9c9c94" stroke-width="3" fill="none" stroke-linecap="round"/></g>`);
}

function heaterArt(s = 1) {
  return svgBox(130 * s, 150 * s, `<g transform="scale(${s})"><rect x="30" y="2" width="14" height="20" fill="#b7bcc0"/><rect x="84" y="2" width="14" height="20" fill="#b7bcc0"/><path d="M22 28 Q22 18 36 18 H92 Q106 18 106 28 V132 Q106 140 98 140 H30 Q22 140 22 132Z" fill="#f6f3ea" stroke="#9aa89c" stroke-width="3"/><rect x="22" y="28" width="14" height="112" fill="#fff" opacity=".4"/><circle cx="64" cy="60" r="14" fill="#fff" stroke="#8c9a8e" stroke-width="3"/><path d="M64 60 L 72 52" stroke="${C.sageDeep}" stroke-width="3" stroke-linecap="round"/><rect x="48" y="90" width="32" height="22" rx="4" fill="#e3e9e0" stroke="#9aa89c" stroke-width="2"/><rect x="34" y="140" width="10" height="8" fill="#9aa89c"/><rect x="84" y="140" width="10" height="8" fill="#9aa89c"/></g>`);
}

function calendarArt(s = 1, struck = true) {
  return svgBox(130 * s, 130 * s, `<g transform="scale(${s})"><rect x="8" y="14" width="114" height="108" rx="8" fill="#fbfaf6" stroke="#9aa89c" stroke-width="3"/><path d="M8 22 Q8 14 16 14 H114 Q122 14 122 22 V44 H8Z" fill="${C.sage}"/><rect x="34" y="4" width="8" height="20" rx="4" fill="#5f686c"/><rect x="88" y="4" width="8" height="20" rx="4" fill="#5f686c"/>${[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => `<rect x="${18 + c * 20}" y="${54 + r * 16}" width="14" height="10" rx="2" fill="#dfe6dc"/>`)).join("")}${struck ? `<path d="M10 118 L 120 18" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>` : ""}</g>`);
}

function phoneCallArt() {
  return svgBox(220, 210, `<g transform="rotate(-8 80 110)"><rect x="34" y="14" width="96" height="180" rx="18" fill="#26302b"/><rect x="42" y="30" width="80" height="148" rx="8" fill="#e9efe6"/><rect x="68" y="20" width="28" height="5" rx="2.5" fill="#4a554e"/><circle cx="82" cy="150" r="20" fill="${C.sage}"/></g>
  <path d="M138 24 H 206 Q 214 24 214 32 V 74 Q 214 82 206 82 H 168 L 146 100 V 82 H 142 Q 134 82 134 74 V 32 Q 134 24 142 24Z" fill="#fbfaf6" stroke="${C.sageDeep}" stroke-width="4"/>
  <circle cx="156" cy="53" r="6" fill="${C.sageDeep}"/><circle cx="174" cy="53" r="6" fill="${C.sageDeep}"/><circle cx="192" cy="53" r="6" fill="${C.sageDeep}"/>`);
}

function ticketArt() {
  const holes = Array.from({ length: 8 }, (_, k) => `<circle cx="${38 + k * 20}" cy="14" r="5" fill="#fbfaf6"/>`).join("");
  return svgBox(220, 210, `<g transform="rotate(4 110 105)"><path d="M20 18 H200 V176 L190 168 L180 176 L170 168 L160 176 L150 168 L140 176 L130 168 L120 176 L110 168 L100 176 L90 168 L80 176 L70 168 L60 176 L50 168 L40 176 L30 168 L20 176Z" fill="#ddc196" stroke="#a88a58" stroke-width="3"/>${holes}
  <rect x="38" y="40" width="70" height="12" rx="4" fill="#7a6240" opacity=".75"/><rect x="38" y="64" width="144" height="7" rx="3" fill="#a88a58"/><rect x="38" y="82" width="144" height="7" rx="3" fill="#a88a58"/><rect x="38" y="100" width="110" height="7" rx="3" fill="#a88a58"/><rect x="38" y="118" width="144" height="7" rx="3" fill="#a88a58"/>${Array.from({ length: 16 }, (_, k) => `<rect x="${40 + k * 8.6}" y="140" width="${k % 3 ? 3 : 5}" height="18" fill="#6b5535" opacity=".8"/>`).join("")}</g>`);
}

function logPageArt() {
  const lines = [0, 1, 2, 3, 4].map((k) => `<path d="M30 ${72 + k * 22} H 160" stroke="#cdd6c8" stroke-width="2.5"/>`).join("");
  const ink = [0, 1, 2].map((k) => `<path d="M34 ${68 + k * 22} q 8 -9 16 0 t 16 0 t 16 0 t 16 0 t ${28 - k * 6} 0" stroke="${C.ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`).join("");
  return svgBox(220, 210, `<g transform="rotate(-3 100 105)"><rect x="14" y="10" width="160" height="186" rx="4" fill="#fbfaf6" stroke="#b9c3b4" stroke-width="3"/><rect x="14" y="10" width="160" height="38" rx="4" fill="${C.sage}"/><rect x="30" y="24" width="70" height="10" rx="4" fill="#fff" opacity=".8"/>${lines}${ink}</g>
  <g transform="rotate(-38 160 140)"><rect x="120" y="128" width="90" height="16" rx="5" fill="#26302b"/><rect x="124" y="131" width="80" height="4" rx="2" fill="#fff" opacity=".25"/><path d="M120 128 L 98 136 L 120 144Z" fill="#e9c9a0"/><path d="M106 134 L 98 136 L 106 138Z" fill="#26302b"/></g>`);
}

/* ---------------------------------------------------------------- shared bits */

const numDot = (n, x, y, color = C.sage, size = 96) => `<div style="${abs(x, y, size, size, `border-radius:50%;background:${color};border:5px solid #fff;display:grid;place-items:center;box-shadow:0 4px 6px rgba(20,40,25,.35),0 12px 18px rgba(20,40,25,.3);z-index:3`)}"><span class="serif" style="font-size:${size * 0.58}px;line-height:1;font-weight:500;color:#fff">${n}</span></div>`;

const cut = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------- #54 stepping stones */
function pin54() {
  const i = idea(54);
  const [s1, s2, , s4] = i.items;
  const steps = [
    { x: 40, y: 408, n: 1, art: phoneCallArt(), text: cut(s1) },
    { x: 310, y: 692, n: 2, art: ticketArt(), text: cut(s2) },
    { x: 40, y: 976, n: 3, art: logPageArt(), text: "Most keep their own service notes" },
  ];
  const cards = steps.map((s) => `<div style="${abs(s.x, s.y, 650, 248, `background:#fbfaf6;border-radius:18px;box-shadow:${SOFT};z-index:2`)}">
    <div style="${abs(24, 20, 220, 210)}">${s.art}</div>
    <div data-check="text" style="${abs(262, 26, 360, 196, "display:flex;flex-direction:column;justify-content:center")}"><div style="font:600 ${s.n === 1 ? 31 : 36}px/1.2 'Plex',sans-serif;color:${C.ink}">${esc(s.text)}</div></div>
  </div>`).join("");
  const chip = `<div data-check="text" style="${abs(618, 528, 0, 0)}"></div>`;
  const sameDay = `<div style="position:absolute;left:312px;top:640px;transform:rotate(-3deg);background:${C.ochre};color:#fff;font:600 26px/1 'Plex',sans-serif;letter-spacing:.02em;padding:12px 22px;border-radius:999px;box-shadow:0 3px 4px rgba(40,20,5,.35),0 10px 16px rgba(40,20,5,.3);z-index:4;white-space:nowrap">same day</div>`;
  const dots = `<path d="M690 660 C 760 700 800 690 790 700" stroke="none" fill="none"/>`;
  const scene = `
  ${flagstone({})}
  ${cards}
  ${numDot(1, 14, 380)}${numDot(2, 284, 664)}${numDot(3, 14, 948)}
  ${sameDay}
  ${bulbs({ x: 44, y: 760, size: 230, rot: -4 })}
  ${hoseReel({ x: 730, y: 1040, size: 270 })}
  ${trowel({ x: 70, y: 1268, len: 520, rot: -2 })}
  <svg style="${abs(0, 372, 1000, 982, "z-index:1")}" viewBox="0 372 1000 982" aria-hidden="true"><path d="M365 656 C 365 676 360 684 352 692" fill="none"/></svg>`;
  return printable({ n: 54, scene, paper: "#e9ece6", bottomMax: 366 });
}

/* ---------------------------------------------------------------- #56 binder with two tabs */
function pin56() {
  const i = idea(56);
  const [appliance, house] = i.items;
  const ring = (y) => `<div style="${abs(58, y, 82, 40, "z-index:4")}"><svg width="82" height="40" viewBox="0 0 82 40" aria-hidden="true"><path d="M6 34 C 6 4 76 4 76 34" fill="none" stroke="#9aa2a6" stroke-width="9" stroke-linecap="round"/><path d="M8 32 C 8 8 74 8 74 32" fill="none" stroke="#e8ecee" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg></div>`;
  const tab = (y, art, label) => `<div style="${abs(776, y, 168, 190, `background:${C.sage};border-radius:0 16px 16px 0;box-shadow:${SOFT};z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px`)}"><div style="width:84px;height:84px;background:#fbfaf6;border-radius:12px;display:grid;place-items:center;overflow:hidden">${art}</div><div style="font:600 25px/1 'Plex',sans-serif;color:#fff;letter-spacing:.02em">${esc(label)}</div></div>`;
  const sheetCss = `background:#fbfaf6;border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.25),0 12px 20px rgba(40,20,5,.3);`;
  const ruled = (h) => `repeating-linear-gradient(transparent 0 ${h - 2}px,#dfe5da ${h - 2}px ${h}px)`;
  const scene = `
  ${slatTable({})}
  <div style="${abs(40, 404, 790, 870, "background:#c8a679;border-radius:14px;box-shadow:0 4px 6px rgba(40,20,5,.35),0 26px 44px rgba(40,20,5,.45);transform:rotate(-0.6deg)")}">
    <div style="${abs(0, 0, 70, 870, "background:#b08c5e;border-radius:14px 0 0 14px;box-shadow:inset -6px 0 8px rgba(40,20,5,.22)")}"></div>
    <div style="${abs(0, 0, 790, 870, "border-radius:14px;background:radial-gradient(circle at 30% 10%,rgba(255,255,255,.18),transparent 60%)")}"></div>
  </div>
  <div style="${abs(104, 436, 700, 360, `${sheetCss}transform:rotate(-0.6deg)`)}">
    <div style="${abs(0, 0, 700, 360, `background:${ruled(44)};opacity:.5;border-radius:6px`)}"></div>
    <div style="${abs(26, 72, 180, 200)}">${washerArt(1)}</div>
    <div data-check="text" style="${abs(232, 40, 440, 280, "display:flex;align-items:center")}"><div class="serif" style="font-size:41px;line-height:1.16;font-weight:500;color:${C.ink}">${esc(appliance)}</div></div>
  </div>
  <div style="${abs(104, 816, 700, 400, `${sheetCss}transform:rotate(-0.6deg)`)}">
    <div style="${abs(0, 0, 700, 400, `background:${ruled(44)};opacity:.5;border-radius:6px`)}"></div>
    <div style="${abs(20, 84, 220, 200)}">${roofFurnaceArt(1)}</div>
    <div data-check="text" style="${abs(262, 30, 416, 340, "display:flex;align-items:center")}"><div class="serif" style="font-size:33px;line-height:1.2;font-weight:500;color:${C.ink}">${esc(house)}</div></div>
  </div>
  ${tab(450, washerArt(0.4), "Appliance")}
  ${tab(840, roofFurnaceArt(0.4), "House")}
  ${ring(500)}${ring(820)}${ring(1120)}
  ${bulbs({ x: 40, y: 1262, size: 260, rot: -3 })}
  ${plantBox({ x: 560, y: 1240, w: 400, rot: 0 })}`;
  return printable({ n: 56, scene, paper: "#efe6d6", bottomMax: 366 });
}

/* ---------------------------------------------------------------- #41 year wheel on the lawn */
function pin41() {
  const i = idea(41);
  const CX = 500, CY = 800, R1 = 255, R0 = 112, RD = 270;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const busy = new Set([3, 8, 9, 10]);
  const hasJob = new Set([1]);
  const plainTick = new Set([0, 6, 7]);
  const P = (r, deg) => [CX + r * Math.cos((deg * Math.PI) / 180), CY + r * Math.sin((deg * Math.PI) / 180)];
  const sector = (a0, a1) => {
    const [x1, y1] = P(R1, a0), [x2, y2] = P(R1, a1), [x3, y3] = P(R0, a1), [x4, y4] = P(R0, a0);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R1} ${R1} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L${x3.toFixed(1)} ${y3.toFixed(1)} A${R0} ${R0} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)}Z`;
  };
  const wedges = months.map((m, k) => {
    const a0 = -90 + k * 30, a1 = a0 + 30, mid = a0 + 15;
    const on = busy.has(k), job = hasJob.has(k);
    const fill = on ? C.sage : job ? "#cfe0d0" : "#fbfaf6";
    const [tx, ty] = P(200, mid);
    const [kx, ky] = P(232, mid);
    return `<path d="${sector(a0, a1)}" fill="${fill}" stroke="#e9efe3" stroke-width="4" stroke-linejoin="round"/>
    <text x="${tx.toFixed(1)}" y="${(ty + 8).toFixed(1)}" text-anchor="middle" font-family="Plex" font-weight="600" font-size="24" fill="${on ? "#fff" : C.ink}">${m}</text>
    ${plainTick.has(k) ? `<g transform="translate(${kx.toFixed(1)} ${ky.toFixed(1)})"><circle r="15" fill="none" stroke="${C.sage}" stroke-width="3.5"/><path d="M-7 0 L-2 6 L8 -6" fill="none" stroke="${C.sage}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>` : ""}`;
  }).join("");
  // job labels: [months' mid angle, side, box y, height, text]
  const L = [
    { a: -45, side: "r", y: 452, h: 142, t: "tree limbs over the roof or near power lines" },
    { a: 15, side: "r", y: 808, h: 142, t: "Clear the gutters. Book air conditioning service" },
    { a: 120, side: "l", y: 1058, h: 98, t: "Nothing seasonal. A good month." },
    { a: 165, side: "l", y: 842, h: 100, t: "Book the furnace tune-up now" },
    { a: 195, side: "l", y: 690, h: 62, t: "The busy one" },
    { a: 225, side: "l", y: 520, h: 112, t: "Clear the gutters once the leaves are down" },
  ];
  const LW = 205;
  const lines = L.map((l) => {
    const [ax, ay] = P(R1 - 8, l.a);
    const ex = l.side === "r" ? 1000 - 14 - LW : 14 + LW, ey = l.y + l.h / 2;
    return `<path d="M${ax.toFixed(1)} ${ay.toFixed(1)} L${ex} ${ey}" stroke="${C.sageDeep}" stroke-width="3.5" fill="none"/><circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="6" fill="${C.sageDeep}"/>`;
  }).join("");
  const labels = L.map((l) => `<div data-check="text" style="${abs(l.side === "r" ? 1000 - 14 - LW : 14, l.y, LW, l.h, `background:#fbfaf6;border-radius:10px;box-shadow:${SOFT};padding:12px 14px;display:flex;align-items:center;font:600 24px/1.2 'Plex',sans-serif;color:${C.ink};z-index:3`)}"><span>${esc(l.t)}</span></div>`).join("");
  const wheel = `<svg style="${abs(0, 0, 1000, 1500, "z-index:2")}" viewBox="0 0 1000 1500" aria-hidden="true">
    <circle cx="${CX}" cy="${CY + 14}" r="${RD}" fill="#0c2a12" opacity=".28"/>
    <circle cx="${CX}" cy="${CY}" r="${RD}" fill="#fbfaf6"/>${wedges}
    <circle cx="${CX}" cy="${CY}" r="${R0 - 6}" fill="#fbfaf6" stroke="#cdd6c8" stroke-width="3"/>${lines}</svg>`;
  const hub = `<div style="${abs(CX - 70, CY - 70, 140, 140, "display:grid;place-items:center;z-index:3")}">${icon("house-line", { size: 100, color: C.sage, weight: "duotone" })}</div>`;
  const seed = `<div style="${abs(280, 392, 440, 112, "transform:rotate(-2deg);z-index:3")}">
    <div style="${abs(0, 0, 440, 112, `background:#fbfaf6;border-radius:8px 8px 14px 14px;box-shadow:${SOFT};border:2px solid #d9ddd0`)}"></div>
    <div style="${abs(0, 0, 440, 34, `background:${C.sage};border-radius:8px 8px 0 0`)}"></div>
    <div data-check="text" style="${abs(18, 40, 404, 66, "display:flex;align-items:center;gap:14px")}"><span style="flex:none">${icon("plant", { size: 44, color: C.sage, weight: "duotone" })}</span><span class="serif" style="font-size:36px;font-weight:500;line-height:1.05;color:${C.ink}">US home, northern hemisphere</span></div></div>`;
  const scene = `
  ${lawn({})}
  ${wheel}${hub}${labels}${seed}
  ${wheelbarrow({ x: 10, y: 1150, w: 420, rot: -1 })}
  ${bulbs({ x: 640, y: 1220, size: 250, rot: 4 })}`;
  return printable({ n: 41, scene, paper: "#e4efe0", bottomMax: 366 });
}

/* ---------------------------------------------------------------- #43 clipboard on a clapboard wall */
function pin43() {
  const i = idea(43);
  const rows = i.items.map((t) => `<div data-check="text" style="display:flex;align-items:center;gap:18px;height:96px;border-bottom:3px solid #cdd6c8"><span style="flex:none;width:40px;height:40px;border:4px solid ${C.sage};border-radius:7px;background:#fff"></span><span class="hand" style="font-size:44px;line-height:.98;font-weight:700;color:${C.ink}">${esc(t)}</span></div>`).join("");
  const calCells = Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => `<div style="${abs(14 + c * 38, 84 + r * 34, 30, 24, "background:#e3eadf;border-radius:3px")}"></div>`).join("")).join("");
  const calendar = `<div style="${abs(634, 400, 300, 270, `background:#fbfaf6;border-radius:6px;box-shadow:${SOFT};transform:rotate(4deg);z-index:1`)}"><div style="${abs(0, 0, 300, 62, `background:${C.sageDeep};border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;font:600 38px/1 'Newsreader',serif;color:#fff;letter-spacing:.03em`)}">October</div>${calCells}</div>`;
  const tap = `<svg style="${abs(700, 740, 270, 190, "z-index:2;filter:drop-shadow(0 10px 8px rgba(40,30,10,.4))")}" viewBox="0 0 270 190" aria-hidden="true">
    <rect x="200" y="30" width="62" height="130" rx="10" fill="#c9962f"/><rect x="204" y="34" width="14" height="122" rx="6" fill="#fff" opacity=".3"/><circle cx="231" cy="48" r="5" fill="#7d5a1a"/><circle cx="231" cy="142" r="5" fill="#7d5a1a"/>
    <rect x="96" y="76" width="110" height="38" rx="8" fill="#b9801f"/><rect x="100" y="80" width="100" height="9" rx="4" fill="#fff" opacity=".28"/>
    <path d="M96 84 H 62 Q 36 84 36 110 V 150 H 80 V 110 Q 80 108 82 108 H 96Z" fill="#b9801f"/><rect x="28" y="148" width="60" height="16" rx="5" fill="#9a6a18"/>
    <rect x="118" y="38" width="12" height="40" fill="#8a8f93"/><circle cx="124" cy="30" r="30" fill="${C.sage}"/><circle cx="124" cy="30" r="30" fill="none" stroke="#2f5a3c" stroke-width="4"/><path d="M104 30 H144 M124 10 V50" stroke="#2f5a3c" stroke-width="5"/>
  </svg>`;
  const coil = [118, 104, 90, 76, 62, 48].map((r) => `<circle cx="140" cy="140" r="${r}" fill="none" stroke="#5e9a59" stroke-width="13"/><circle cx="140" cy="140" r="${r}" fill="none" stroke="#2f5a2f" stroke-opacity=".3" stroke-width="2" transform="translate(0 5)"/>`).join("");
  const hose = `<svg style="${abs(704, 930, 270, 300, "z-index:2;filter:drop-shadow(0 12px 9px rgba(40,30,10,.38))")}" viewBox="0 0 280 300" aria-hidden="true">
    <path d="M232 0 V 40 C 232 70 196 60 196 100" stroke="#5e9a59" stroke-width="13" fill="none" stroke-linecap="round"/>${coil}<circle cx="140" cy="140" r="26" fill="#efdf9d" opacity=".0"/>
    <path d="M232 240 C 250 262 262 276 258 292" stroke="#5e9a59" stroke-width="13" fill="none" stroke-linecap="round"/><rect x="246" y="282" width="26" height="14" rx="4" fill="#c9962f"/></svg>`;
  const hook = `<div style="${abs(366, 396, 14, 14, "background:#3a2f18;border-radius:50%;box-shadow:0 3px 3px rgba(0,0,0,.4);z-index:5")}"></div>`;
  const board = `<div style="${abs(50, 418, 620, 850, "z-index:3;transform:rotate(-1.4deg)")}">
    <div style="${abs(0, 0, 620, 850, "background:linear-gradient(135deg,#a9743c,#8d5d2c);border-radius:20px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 28px 50px rgba(40,20,5,.45)")}"></div>
    <div style="${abs(250, -26, 120, 70, "border-radius:14px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 6px 10px rgba(0,0,0,.35)")}"></div>
    <div style="${abs(22, 52, 576, 776, "background:#fbfaf6;border-radius:4px;box-shadow:0 2px 3px rgba(40,20,5,.3)")}">
      <div class="serif" style="${abs(26, 34, 524, 56, `font-size:48px;line-height:56px;font-weight:500;color:${C.sageDeep};letter-spacing:-.01em`)}">October</div>
      <div style="${abs(26, 112, 524, 4, `background:${C.sage}`)}"></div>
      <div style="${abs(26, 120, 524, 640)}">${rows}</div>
    </div></div>`;
  const scene = `
  ${clapboard({})}
  ${calendar}${tap}${hose}${hook}${board}
  ${trowel({ x: 560, y: 1286, len: 400, rot: 0 })}`;
  return printable({ n: 43, scene, paper: "#f4ecc9", bottomMax: 366 });
}

/* ---------------------------------------------------------------- #45 myth vs truth on brick */
function pin45() {
  const i = idea(45);
  const rows = [
    { art: alarmArt(0.78, C.ochre), job: "Test smoke and CO alarms", when: "Every month", warn: true },
    { art: filterArt(0.78), job: "Furnace and AC filter", when: "Check monthly, change at least every 3 months" },
    { art: lintArt(0.78), job: "Dryer lint filter", when: "Before and after each load" },
    { art: heaterArt(0.72), job: "Water heater flush", when: "Once a year" },
    { art: alarmArt(0.78, C.ochre), job: "Replace smoke alarm units", when: "10 years from the manufacture date", warn: true },
  ];
  const Y0 = 536, PITCH = 150;
  const left = rows.map((r, k) => `<div style="${abs(24, Y0 + k * PITCH, 424, 136, `background:#fbfaf6;border-radius:12px;box-shadow:${SOFT};display:flex;align-items:center;gap:14px;padding:0 16px;${r.warn ? `border-left:8px solid ${C.ochre}` : ""}`)}"><div style="flex:none;width:104px;height:104px;display:grid;place-items:center">${r.art}</div><div data-check="text" style="font:600 27px/1.15 'Plex',sans-serif;color:${C.ink}">${esc(r.job)}</div></div>`).join("");
  const right = rows.map((r, k) => `<div data-check="text" style="${abs(492, Y0 + k * PITCH, 468, 136, `border-radius:12px;display:flex;align-items:center;padding:0 24px;background:${r.warn ? "#f6ecd2" : "rgba(255,255,255,.14)"};font:600 31px/1.18 'Plex',sans-serif;color:${r.warn ? C.ochre : "#fff"}`)}">${esc(r.when)}</div>`).join("");
  const arrows = rows.map((_, k) => `<div style="${abs(446, Y0 + k * PITCH + 44, 48, 48, `border-radius:50%;background:#fbfaf6;display:grid;place-items:center;box-shadow:0 3px 6px rgba(40,10,5,.35);z-index:3`)}">${icon("arrow-right", { size: 28, color: C.sageDeep, weight: "bold" })}</div>`).join("");
  const scene = `
  ${brick({})}
  <div style="${abs(476, 396, 500, 902, `background:${C.sage};border-radius:16px;box-shadow:${SOFT}`)}"></div>
  <div style="${abs(24, 396, 424, 128, `background:#fbfaf6;border-radius:12px;box-shadow:${SOFT};display:flex;align-items:center;gap:16px;padding:0 18px`)}"><div style="flex:none">${calendarArt(0.92)}</div><div style="min-width:0"><div class="serif" style="font-size:31px;line-height:1.05;font-weight:500;color:${C.ink};text-decoration:line-through;text-decoration-thickness:3px">Seasonal</div><div data-check="text" style="font:600 30px/1.1 'Plex',sans-serif;color:${C.ink};margin-top:6px">Looks seasonal</div></div></div>
  <div data-check="text" style="${abs(500, 410, 452, 100, "display:flex;align-items:center;font:600 31px/1.18 'Plex',sans-serif;color:#fff")}">${esc(i.sub.split(". ")[0] + ".")}</div>
  ${left}${right}${arrows}
  ${bulbs({ x: 30, y: 1290, size: 210, rot: 0 })}
  ${trowel({ x: 520, y: 1306, len: 440, rot: -1 })}`;
  return printable({ n: 45, scene, paper: "#f1e0d8", bottomMax: 366 });
}

/* ---------------------------------------------------------------- #47 three rows and a stamp on decking */
function pin47() {
  const i = idea(47);
  const rows = [
    { art: alarmArt(1.2, C.sage), t: i.items[0] },
    { art: filterArt(1.2), t: i.items[1] },
    { art: lintArt(1.2), t: i.items[2] },
  ];
  const cards = rows.map((r, k) => `<div style="${abs(48, 404 + k * 258, 904, 232, `background:#fbfaf6;border-radius:18px;box-shadow:${SOFT};z-index:2`)}">
    <div class="serif" style="${abs(26, 22, 90, 190, `font-size:150px;line-height:190px;font-weight:500;color:${C.sage};opacity:.9`)}">${k + 1}</div>
    <div style="${abs(130, 36, 170, 160, `border-radius:50%;background:${C.wash};display:grid;place-items:center`)}">${r.art}</div>
    <div data-check="text" style="${abs(330, 20, 550, 192, "display:flex;align-items:center")}"><div class="serif" style="font-size:${k === 1 ? 42 : 48}px;line-height:1.1;font-weight:500;color:${C.ink}">${esc(r.t)}</div></div>
  </div>`).join("");
  const stamp = `<div style="${abs(290, 1186, 660, 112, "transform:rotate(-3deg);z-index:3")}">
    <div style="${abs(0, 0, 660, 112, `border:6px solid ${C.sage};border-radius:18px;background:rgba(251,250,246,.94);box-shadow:${SOFT}`)}"></div>
    <div style="${abs(10, 10, 640, 92, `border:2.5px solid ${C.sage};border-radius:11px`)}"></div>
    <div data-check="text" style="${abs(26, 14, 608, 84, `display:flex;align-items:center;justify-content:center;gap:16px;color:${C.sageDeep}`)}"><span style="flex:none">${icon("check-circle", { size: 54, color: C.sage, weight: "fill" })}</span><span class="serif" style="font-size:38px;line-height:1.05;font-weight:600;letter-spacing:-.005em">${esc("That's the whole monthly list")}</span></div></div>`;
  const scene = `
  ${decking({})}
  ${cards}${stamp}
  ${birdBath({ x: 70, y: 1128, size: 330 })}`;
  return printable({ n: 47, scene, paper: "#edeeea", bottomMax: 366 });
}

export const pins = [pin54(), pin56(), pin41(), pin43(), pin45(), pin47()];
