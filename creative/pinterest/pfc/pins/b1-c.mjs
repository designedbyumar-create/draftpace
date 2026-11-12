/**
 * Batch 1, Builder C: workbook and template pages in a home / kitchen world.
 *
 *   #29  sinking funds worksheet, left blank, on glazed ceramic tile with two coin jars
 *   #68  information confidence key on a gingham breakfast table, five page flags
 *   #2   the subscription tracker's six columns on a butcher-block counter with a fruit bowl
 *   #26  the $223 before / after, taped on a kitchen window above the sill
 *
 * Words: every word is the idea's own (headline, sub, items) or a label that is
 * real on the page shown. The printed pages are placed as printed.
 */
import { esc } from "../../v3/kit.mjs";
import { idea } from "../kit/bank.mjs";
import { bookPage } from "../kit/assets.mjs";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, pencil, mug } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_H = 1354 - SCENE_TOP;
const lcg = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;

/* ------------------------------------------------------------------ props */

/** A glass jar with a lid, part full of coins (seen a little from above). */
function jar({ x, y, w = 190, h = 250, seed = 1, rows = 5, lid = "#c9a24b", tilt = 0 }) {
  const r = lcg(seed);
  const metals = ["#d9b04a", "#c9ccd1", "#b8723f", "#e0bd5c", "#d3d6db"];
  const coins = [];
  for (let k = 0; k < rows; k++) {
    const yy = 228 - k * 15;
    const n = 6 - (k > 2 ? 1 : 0);
    for (let c = 0; c < n; c++) {
      const cx = 36 + c * (118 / (n - 1)) + (r() - 0.5) * 12;
      const col = metals[Math.floor(r() * metals.length)];
      coins.push(`<ellipse cx="${cx.toFixed(1)}" cy="${(yy + (r() - 0.5) * 4).toFixed(1)}" rx="21" ry="9" fill="${col}"/><ellipse cx="${cx.toFixed(1)}" cy="${(yy - 2).toFixed(1)}" rx="21" ry="8" fill="${col}" stroke="#000" stroke-opacity=".22" stroke-width="1.4"/><ellipse cx="${cx.toFixed(1)}" cy="${(yy - 2).toFixed(1)}" rx="12" ry="4.6" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>`);
    }
  }
  coins.reverse(); // back rows first: the front row ends up on top
  const g = `jg${++uid}`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);filter:drop-shadow(0 16px 12px rgba(30,20,10,.38))`)}" viewBox="0 0 190 250" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".2" stop-color="#dff0ea" stop-opacity=".25"/><stop offset=".8" stop-color="#cfe3dc" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient></defs>
  <path d="M34 36 H156 V58 C 182 66 178 92 178 112 V212 C 178 232 164 240 146 240 H44 C 26 240 12 232 12 212 V112 C 12 92 8 66 34 58 Z" fill="#e8f2ee" fill-opacity=".55"/>
  ${coins.join("")}
  <path d="M34 36 H156 V58 C 182 66 178 92 178 112 V212 C 178 232 164 240 146 240 H44 C 26 240 12 232 12 212 V112 C 12 92 8 66 34 58 Z" fill="url(#${g})" stroke="#7fa397" stroke-opacity=".7" stroke-width="3"/>
  <path d="M30 70 C 22 84 22 100 22 118 V196" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="7" stroke-linecap="round"/>
  <rect x="28" y="6" width="134" height="36" rx="8" fill="${lid}"/><rect x="28" y="6" width="134" height="10" rx="6" fill="#fff" opacity=".28"/>
  ${[44, 58, 72, 86, 100, 114, 128, 142].map((lx) => `<line x1="${lx}" y1="12" x2="${lx}" y2="38" stroke="#000" stroke-opacity=".14" stroke-width="2"/>`).join("")}
  </svg>`;
}

/** A ceramic bowl seen from above with round fruit; `fruits` is a list of [colour, dark] pairs. */
function fruitBowl({ cx, cy, r, fruits, seed = 4, shade = "#f1ebde", leaf = true }) {
  const rnd = lcg(seed);
  const parts = [];
  const n = fruits.length;
  for (let k = 0; k < n; k++) {
    const [c1, c2] = fruits[k];
    const ring = k === 0 ? 0 : k <= 5 ? 0.46 : 0.0;
    const a = (k / Math.max(1, Math.min(5, n - 1))) * Math.PI * 2 + rnd();
    const fr = r * (n > 6 ? 0.3 : 0.34);
    const fx = r + Math.cos(a) * r * ring, fy = r + Math.sin(a) * r * ring;
    const id = `fg${++uid}`;
    parts.push(`<defs><radialGradient id="${id}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></radialGradient></defs>
    <circle cx="${fx + 5}" cy="${fy + 8}" r="${fr}" fill="#000" opacity=".22"/>
    <circle cx="${fx}" cy="${fy}" r="${fr}" fill="url(#${id})"/>
    <ellipse cx="${fx - fr * 0.3}" cy="${fy - fr * 0.36}" rx="${fr * 0.28}" ry="${fr * 0.16}" fill="#fff" opacity=".35" transform="rotate(-30 ${fx - fr * 0.3} ${fy - fr * 0.36})"/>
    <circle cx="${fx + fr * 0.05}" cy="${fy + fr * 0.05}" r="${fr * 0.07}" fill="#000" opacity=".3"/>
    ${leaf && k % 2 === 0 ? `<path d="M${fx} ${fy - fr * 0.1} q ${fr * 0.5} ${-fr * 0.7} ${fr * 0.85} ${-fr * 0.2} q ${-fr * 0.4} ${fr * 0.4} ${-fr * 0.85} ${fr * 0.2}Z" fill="#5f8f4e" opacity=".95"/>` : ""}`);
  }
  return `<svg style="${abs(cx - r, cy - r, r * 2, r * 2, "filter:drop-shadow(0 16px 12px rgba(30,20,10,.4))")}" viewBox="0 0 ${r * 2} ${r * 2}" aria-hidden="true">
  <circle cx="${r}" cy="${r}" r="${r - 2}" fill="${shade}"/><circle cx="${r}" cy="${r}" r="${r - 2}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
  <circle cx="${r}" cy="${r}" r="${r * 0.84}" fill="#d8d0c0"/><circle cx="${r}" cy="${r}" r="${r * 0.8}" fill="#cfc6b4"/>
  <path d="M${r * 0.3} ${r * 0.35} A ${r * 0.9} ${r * 0.9} 0 0 1 ${r * 0.9} ${r * 0.13}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>
  ${parts.join("")}</svg>`;
}

/** A small side-view potted herb for the window sill. */
function sillPlant({ x, y, w = 150 }) {
  const h = w * 1.25;
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 8px 6px rgba(30,20,10,.3))")}" viewBox="0 0 150 188" aria-hidden="true">
  <g fill="#4f8a55"><ellipse cx="75" cy="52" rx="14" ry="48"/><ellipse cx="42" cy="68" rx="13" ry="40" transform="rotate(-38 42 68)"/><ellipse cx="108" cy="68" rx="13" ry="40" transform="rotate(38 108 68)"/><ellipse cx="22" cy="106" rx="11" ry="32" transform="rotate(-68 22 106)" fill="#5f9e63"/><ellipse cx="128" cy="106" rx="11" ry="32" transform="rotate(68 128 106)" fill="#5f9e63"/></g>
  <g fill="#fff" opacity=".18"><ellipse cx="72" cy="40" rx="4" ry="30"/><ellipse cx="36" cy="62" rx="3.5" ry="22" transform="rotate(-38 36 62)"/></g>
  <path d="M34 120 H116 L106 184 H44 Z" fill="#c9714b"/><rect x="28" y="112" width="94" height="20" rx="4" fill="#d98560"/><path d="M34 140 H116 L113 156 H37Z" fill="#000" opacity=".08"/></svg>`;
}

/** A side-view mug for the sill. */
function sillMug({ x, y, s = 1 }) {
  return `<svg style="${abs(x, y, 120 * s, 100 * s, "filter:drop-shadow(0 8px 6px rgba(30,20,10,.3))")}" viewBox="0 0 120 100" aria-hidden="true">
  <path d="M82 28 C 118 24 118 74 80 74" fill="none" stroke="#f3ede4" stroke-width="12" stroke-linecap="round"/>
  <path d="M10 14 H86 V74 C 86 90 76 98 62 98 H34 C 20 98 10 90 10 74 Z" fill="#f3ede4"/><rect x="10" y="14" width="76" height="10" fill="#17473a" opacity=".85"/><rect x="10" y="26" width="76" height="4" fill="#17473a" opacity=".5"/>
  <ellipse cx="48" cy="14" rx="38" ry="6" fill="#6b4226"/><path d="M18 40 V80" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** Washi tape at an angle. */
const tape = (x, y, rot, color = "#d9b94c", w = 130) => `<div style="${abs(x, y, w, 40, `transform:rotate(${rot}deg);background:repeating-linear-gradient(115deg,${color} 0 14px,${color}cc 14px 28px);opacity:.88;box-shadow:0 2px 4px rgba(40,20,5,.25)`)}"></div>`;

/* ------------------------------------------------------------------ #29 */

function tilesBg(seed = 7) {
  const r = lcg(seed);
  const size = 126, g = 8;
  const pal = ["#a7c2b2", "#9dbbab", "#b4cbbc", "#93b3a2", "#a2bfae", "#bdd1c3", "#8fb09f", "#c6d6c7"];
  const out = [];
  const cols = Math.ceil(1000 / (size + g)) + 1, rows = Math.ceil(SCENE_H / (size + g)) + 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = -30 + i * (size + g), y = -40 + j * (size + g);
    const c = pal[Math.floor(r() * pal.length)];
    out.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="9" fill="${c}"/>`);
    out.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="9" fill="url(#glaze)"/>`);
    out.push(`<rect x="${x + 2}" y="${y + 2}" width="${size - 4}" height="${size - 4}" rx="8" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`);
    for (let s = 0; s < 3; s++) out.push(`<circle cx="${x + 10 + r() * (size - 20)}" cy="${y + 10 + r() * (size - 20)}" r="${0.8 + r() * 1.2}" fill="#2f5b4a" opacity=".16"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
  <defs><linearGradient id="glaze" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#1b3b2f" stop-opacity=".16"/></linearGradient>
  <radialGradient id="tl" cx=".22" cy=".1" r="1.05"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#10261d" stop-opacity=".36"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="#e4dfce"/>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#tl)"/></svg>`;
}

function pin29() {
  const scene = `
  ${tilesBg()}
  ${sheet({ src: bookPage(42), x: 92, y: 414, w: 816, tilt: -1.6, crop: { x0: 0.04, y0: 0.075, x1: 0.96, y1: 1 } })}
  ${jar({ x: 22, y: 1060, w: 200, h: 263, seed: 5, rows: 7, lid: "#c9a24b", tilt: -3 })}
  ${jar({ x: 770, y: 1096, w: 176, h: 232, seed: 11, rows: 4, lid: "#2f6b57", tilt: 4 })}
  ${pencil({ x: 300, y: 1262, len: 430, rot: -6 })}`;
  return printable({ n: 29, scene, paper: "#eaf0e8" });
}

/* ------------------------------------------------------------------ #68 */

/** A cream terrazzo counter: irregular chips of forest, terracotta, butter, grey and blush set in the mix. */
function terrazzo(seed = 33) {
  const r = lcg(seed);
  const cols = ["#2f6b57", "#c9714b", "#e0b44c", "#8a8f98", "#d9a5a0", "#1f2a2e", "#5f8f7a", "#f4efe4"];
  const out = [];
  for (let k = 0; k < 520; k++) {
    const cx = r() * 1000, cy = r() * SCENE_H, R = 5 + Math.pow(r(), 2.2) * 30;
    const n = 5 + Math.floor(r() * 3);
    const pts = Array.from({ length: n }, (_, m) => { const a = (m / n) * Math.PI * 2 + r() * 0.6, rr = R * (0.55 + r() * 0.6); return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; });
    out.push(`<polygon points="${pts.join(" ")}" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${(0.82 + r() * 0.18).toFixed(2)}"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="tz" cx=".25" cy=".08" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#2b2418" stop-opacity=".3"/></radialGradient></defs><rect width="1000" height="${SCENE_H}" fill="#e9e2d3"/>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#tz)"/></svg>`;
}

function pin68() {
  const flags = [
    ["Confirmed", "Checked and believed accurate", "#bfe3c9"],
    ["Estimated", "Reasonable, but may change", "#f6e08a"],
    ["Unresolved", "Exists, needs a decision", "#f6bd9c"],
    ["Missing", "Not known yet", "#f3b6c4"],
    ["Stale", "Once confirmed, may be old", "#cdd7e2"],
  ];
  const rowF = [0.3155, 0.3915, 0.467, 0.543, 0.6185]; // measured on the real page: where each label's row sits
  const PW = 640, PH = Math.round(PW * 2200 / 1700);
  const flagHtml = flags.map(([name, meaning, col], k) => {
    const cy = rowF[k] * PH;
    return `<div class="flag" style="top:${cy - 29}px;background:${col}"><i></i><b>${esc(name)}</b><span>${esc(meaning)}</span></div>`;
  }).join("");
  const scene = `
  ${terrazzo()}
  ${fruitBowl({ cx: 856, cy: 508, r: 104, fruits: [["#f7e25e", "#d8b72a"], ["#f9e670", "#d9bb30"], ["#f5dc4f", "#cfaa22"], ["#f8e46a", "#d6b52a"], ["#f4d84a", "#cba420"]], seed: 9, shade: "#e9f1ef" })}
  <div style="${abs(26, 408, PW, PH, "transform:rotate(-2deg)")}">
    ${sheet({ src: bookPage(10), x: 0, y: 0, w: PW, tilt: 0, id: "key" })}
    ${flagHtml}
  </div>
  <div style="${abs(690, 1048, 270, 170, "border-radius:50%;background:#dbe8ec;box-shadow:0 14px 12px rgba(30,20,10,.35);border:3px solid rgba(0,0,0,.07)")}"></div>
  ${mug({ x: 706, y: 1022, size: 192, color: "#7fa9b8", drink: "#5a3a22" })}
  ${pencil({ x: 60, y: 1292, len: 400, rot: 1.5 })}`;
  const css = `.flag{position:absolute;left:592px;height:58px;width:max-content;padding:2px 18px 0 28px;display:flex;flex-direction:column;justify-content:center;border-radius:2px 7px 7px 2px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 8px 14px rgba(40,20,5,.25);color:#1d1d20}
  .flag i{position:absolute;left:0;top:0;bottom:0;width:14px;background:rgba(0,0,0,.14);border-radius:2px 0 0 2px}
  .flag b{font:700 25px/1.02 "Plex",sans-serif}.flag span{font:500 22px/1.05 "Plex",sans-serif}`;
  return printable({ n: 68, scene, paper: "#f1ede2", extraCss: css });
}

/* ------------------------------------------------------------------ #2 */

function butcherBlock() {
  const r = lcg(21);
  const tones = ["#dcb985", "#d3ae78", "#e1c28f", "#cfa56f", "#d8b27c", "#e5c99a"];
  const out = [];
  let x = 0;
  while (x < 1000) {
    const w = 38 + Math.floor(r() * 22);
    const c = tones[Math.floor(r() * tones.length)];
    out.push(`<rect x="${x}" y="0" width="${w}" height="${SCENE_H}" fill="${c}"/><rect x="${x}" y="0" width="2" height="${SCENE_H}" fill="#6f4a22" opacity=".35"/>`);
    for (let g = 0; g < 7; g++) {
      const gx = x + 4 + r() * (w - 8);
      out.push(`<path d="M${gx} 0 C ${gx + (r() - 0.5) * 8} ${SCENE_H * 0.3}, ${gx + (r() - 0.5) * 8} ${SCENE_H * 0.65}, ${gx + (r() - 0.5) * 6} ${SCENE_H}" fill="none" stroke="#8a6234" stroke-opacity="${(0.1 + r() * 0.14).toFixed(2)}" stroke-width="${(0.8 + r() * 1.3).toFixed(1)}"/>`);
    }
    x += w;
  }
  // the cut ends of the staves
  for (let k = 0; k < 4; k++) out.push(`<rect x="0" y="${180 + k * 240 + r() * 30}" width="1000" height="3" fill="#7d5a30" opacity=".16"/>`);
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="bl" cx=".3" cy=".05" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#2b1a08" stop-opacity=".3"/></radialGradient></defs>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#bl)"/></svg>`;
}

function pin2() {
  const i = idea(2);
  const head = i.items[0].split(" | ");
  const data = i.items.slice(1).map((t) => t.split(" | "));
  const rows = data.map((cells, k) => `<div class="rw${k === 1 ? " hot" : ""}">${cells.map((c, j) => `<div class="cell c${j}" style="transform:rotate(${((k * 3 + j * 5) % 7 - 3) * 0.22}deg)">${esc(c)}</div>`).join("")}</div>`).join("");
  const blanks = Array.from({ length: 4 }, () => `<div class="rw">${head.map((_, j) => `<div class="cell c${j}"></div>`).join("")}</div>`).join("");
  const reg = `<div class="reg"><div class="tagrow"><span class="example" style="font-size:24px;padding:5px 10px">Example</span></div>
    <div class="hd">${head.map((h) => `<div>${esc(h)}</div>`).join("")}</div>${rows}${blanks}</div>`;
  const css = `
  .reg{position:absolute;left:50px;top:424px;width:900px;transform:rotate(-2.4deg);background:#fbfaf7;border-radius:4px;box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(40,20,5,.35),0 40px 60px -20px rgba(40,20,5,.4);padding:0 0 26px}
  .tagrow{height:70px;padding:20px 22px 0;border-bottom:2px solid #17473a}
  .grid,.hd,.rw{display:grid;grid-template-columns:220px 100px 110px 100px 245px 125px}
  .hd{background:#17473a;color:#fff;height:62px;align-items:center}
  .hd div{padding-left:16px;font:600 23px "Plex",sans-serif;white-space:nowrap}
  .rw{height:84px;border-bottom:2px solid #c9d6cd;position:relative}
  .cell{padding:0 0 0 14px;display:flex;align-items:center;border-left:2px solid #e3eae5;font:500 31px/1 "Hand",cursive;color:#3c414b;white-space:nowrap}
  .cell.c0{border-left:0}
  .rw.hot{background:linear-gradient(transparent 10%,rgba(246,184,52,.55) 10% 90%,transparent 90%)}
  .rw.hot .cell{color:#2a2d36}`;
  const scene = `
  ${butcherBlock()}
  <div style="${abs(690, 392, 380, 230, "transform:rotate(14deg);background:repeating-linear-gradient(90deg,#17473a 0 26px,#f6f1e4 26px 34px,#17473a 34px 40px,#f6f1e4 40px 56px);box-shadow:0 10px 18px rgba(30,20,10,.35);border-radius:3px")}"></div>
  ${reg}
  ${fruitBowl({ cx: 150, cy: 1262, r: 168, fruits: [["#f4a640", "#c9741a"], ["#9fcf6a", "#5e9a3a"], ["#f7b04c", "#cf7a1c"], ["#e2503c", "#a8261b"], ["#a8d672", "#639f3d"], ["#f4a640", "#c9741a"]], seed: 3 })}
  ${pencil({ x: 540, y: 1240, len: 400, rot: -4 })}`;
  return printable({ n: 2, scene, paper: "#f2e9d6", extraCss: css });
}

/* ------------------------------------------------------------------ #26 */

function pin26() {
  const monthly = [["Rent", "$1,450"], ["Electric", "$120"], ["Internet", "$45"], ["Phone", "$38"], ["Streaming", "$15"]];
  const added = [["Car insurance", "$612 every three months", "$204"], ["Car registration", "$132 a year", "$11"], ["Gym membership", "$96 a year", "$8"]];
  const row = ([a, b]) => `<div class="r"><span>${esc(a)}</span><em>${esc(b)}</em></div>`;
  const addedRow = ([a, b, c]) => `<div class="r add"><span><b>${esc(a)}</b><small>${esc(b)}</small></span><em>${esc(c)}</em></div>`;
  const before = `<div class="sh" style="left:30px;top:438px;transform:rotate(-1.2deg)">
    <div class="stk" style="transform:rotate(-4deg)">Before</div><span class="example" style="position:absolute;right:16px;top:12px;font-size:24px;padding:4px 9px">Example</span>
    <p class="cap">the five bills that land every month</p>${monthly.map(row).join("")}
    <div class="tot"><i></i><strong style="color:#8b908d;border-bottom:5px double #8b908d">$1,668</strong></div></div>`;
  const after = `<div class="sh" style="left:520px;top:424px;transform:rotate(1deg)">
    <div class="stk" style="transform:rotate(3deg);background:#bfe3c9">After</div><span class="example" style="position:absolute;right:16px;top:12px;font-size:24px;padding:4px 9px">Example</span>
    <p class="cap">the real figure</p>${monthly.map(row).join("")}${added.map(addedRow).join("")}
    <div class="tot"><svg class="ring" viewBox="0 0 150 80" aria-hidden="true"><ellipse cx="75" cy="40" rx="68" ry="31" fill="none" stroke="#d9791f" stroke-width="5" transform="rotate(-4 75 40)" stroke-linecap="round" stroke-dasharray="380 12"/></svg><b class="gap">$223</b><strong style="color:#17473a">$1,891</strong></div></div>`;
  const note = `<div style="${abs(40, 984, 430, 220, "transform:rotate(-2deg);background:#f7d98a;box-shadow:0 2px 3px rgba(40,20,5,.25),0 14px 22px rgba(40,20,5,.3);padding:22px 26px")}"><div style="font:700 62px/1 'Hand',cursive;color:#9a4a0c">The $223 gap</div><div style="font:600 34px/1.12 'Hand',cursive;color:#2a2a2a;margin-top:10px">car insurance, registration and the gym membership</div></div>`;
  const css = `
  .sh{position:absolute;width:450px;background:#fffdf7;padding:62px 24px 22px;box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(30,40,50,.35)}
  .stk{position:absolute;left:-12px;top:-30px;min-width:150px;height:76px;padding:0 20px;background:#f7d98a;font:700 54px/76px "Hand",cursive;color:#2a2a2a;box-shadow:0 6px 10px rgba(40,20,5,.3)}
  .cap{font:500 22px/1.15 "Plex",sans-serif;color:#555;margin:2px 0 10px;white-space:nowrap}
  .r{height:46px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #cbd9e3}
  .r span{font:600 25px "Plex",sans-serif}.r em{font:500 26px "Plex Mono",monospace;font-style:normal}
  .r.add{height:78px;background:#e9f2ec;border-bottom-color:#a9c4b4;margin:0 -10px;padding:0 10px}
  .r.add span{display:flex;flex-direction:column;gap:2px;color:#17473a}.r.add span b{font-weight:700}.r.add small{font:500 22px "Plex",sans-serif;color:#385a4b}
  .r.add em{font-weight:600;color:#17473a}
  .tot{position:relative;height:92px;display:flex;align-items:center;justify-content:flex-end}
  .tot strong{font:600 56px/1 "Newsreader",Georgia,serif;margin-right:6px}
  .gap{position:absolute;left:30px;top:24px;font:700 48px/1 "Hand",cursive;color:#c2610f}
  .ring{position:absolute;left:12px;top:6px;width:150px;height:80px}`;
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(#cbe3ec,#e5eee9 55%,#f3efe0)")}"></div>
  <svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
    <circle cx="150" cy="40" r="130" fill="#fff" opacity=".35"/>
    <g fill="#8fb39c"><circle cx="90" cy="860" r="130"/><circle cx="250" cy="880" r="110"/><circle cx="780" cy="850" r="140"/><circle cx="930" cy="880" r="110"/></g>
    <g fill="#6f9d84"><circle cx="30" cy="900" r="120"/><circle cx="420" cy="910" r="100"/><circle cx="600" cy="900" r="120"/><circle cx="860" cy="920" r="100"/></g>
    <rect y="900" width="1000" height="90" fill="#7fa88c"/>
  </svg>
  ${before}${after}${note}
  ${tape(190, 422, -4, "#2f6b57", 100)}${tape(690, 404, -3, "#d9b94c", 100)}
  <div style="${abs(0, 372, 1000, SCENE_H, "pointer-events:none")}">
    <div style="${abs(0, 0, 24, SCENE_H, "background:linear-gradient(90deg,#f7f4ec,#e5e1d6);box-shadow:3px 0 8px rgba(0,0,0,.18)")}"></div>
    <div style="${abs(976, 0, 24, SCENE_H, "background:linear-gradient(270deg,#f7f4ec,#e5e1d6);box-shadow:-3px 0 8px rgba(0,0,0,.18)")}"></div>
    <div style="${abs(484, 0, 32, 860, "background:linear-gradient(90deg,#e7e3d8,#faf8f1 45%,#e2ded2);box-shadow:0 0 10px rgba(0,0,0,.2)")}"></div>
  </div>
  <div style="${abs(0, 1240, 1000, 56, "background:linear-gradient(#e8cfa3,#d6b27a);box-shadow:0 -4px 10px rgba(0,0,0,.2)")}"></div>
  <div style="${abs(0, 1294, 1000, 70, "background:linear-gradient(#c79a62,#a87a45)")}"></div>
  ${sillPlant({ x: 790, y: 1112, w: 140 })}${sillMug({ x: 70, y: 1166, s: 1.05 })}`;
  return printable({ n: 26, scene, paper: "#e6eef0", extraCss: css });
}

export const pins = [pin29(), pin68(), pin2(), pin26()];
