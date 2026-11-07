/**
 * Batch 4, set D: four guide pins in four worlds.
 *   24 a green leather desk blotter on ash wood: the reading-log page in the book's own style,
 *      two rows in a child's hand, the stopped one ringed in plum, a library book and a pencil
 *   28 a flight of stairs seen from the front: five painted risers, one step on each, a school bag at the foot
 *   34 a navy plaster wall: five kraft shipping tags tied on one twine, a pencil sketch of a clock and calendar
 *   40 a window with a sheet of lined paper taped to the glass, a plant and pencil on the sill
 * Every word is the idea bank's own (headline, sub, items). The reading log's column heads and
 * title are the labels of the real page (book page 17).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { pencil, desk } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const BOTTOM = 1354;
const SH = BOTTOM - SCENE_TOP;
const CAUTION = "Laws change. Confirm with your state before relying on this.";
const exampleCss = `.example{font-size:24px;letter-spacing:.1em;color:#2a2530;background:#fffdf6;padding:7px 14px;box-shadow:0 2px 4px rgba(0,0,0,.25)}`;

/** A strip of washi tape centred on (x, y). */
function tape(x, y, w = 140, rot = -4, color = "rgba(224,169,90,.8)") {
  return `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.3) 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:4;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A wobbly hand-drawn ring (an SVG path) around a box of w x h, drawn once round and overshooting a little. */
function ring(w, h, seed = 1, over = 10) {
  const r = seeded(seed);
  const cx = w / 2, cy = h / 2, rx = w / 2 + over, ry = h / 2 + over * 0.6;
  const pts = [];
  const N = 14;
  for (let k = 0; k <= N + 2; k++) {
    const a = (k / N) * Math.PI * 2 - 1.9;
    const j = 1 + (r() - 0.5) * 0.05 + (k > N ? 0.05 : 0);
    pts.push([cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let k = 1; k < pts.length - 1; k++) {
    const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2;
    d += ` Q${pts[k][0].toFixed(1)} ${pts[k][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return d;
}

/* ------------------------------------------------------------------ #24 */

function pin24() {
  const i = idea(24);
  const [bookH, startedH, finH, t1, s1, f1, t2, s2, f2] = i.items;
  const ink = "#2c3552";
  const PW = 800, X = 70, Y = 428;
  const colW = [244, 150, 306];
  const inner = 52;
  const ROW0 = 258, ROWH = 100, ROWS = 8;
  const rowTop = (k) => ROW0 + k * ROWH;
  const heads = [bookH, startedH, finH]
    .map((h, c) => `<div style="${abs(inner + colW.slice(0, c).reduce((a, b) => a + b, 0) + (c ? 14 : 0), 196, colW[c], 40, "display:flex;align-items:center;font:500 24px 'Plex',sans-serif;letter-spacing:.07em;text-transform:uppercase;color:#1d1d20;white-space:nowrap")}">${esc(h)}</div>`)
    .join("");
  const lines = Array.from({ length: ROWS }, (_, k) => `<div style="${abs(inner, rowTop(k) + ROWH - 1, PW - inner * 2, 2, "background:#c9c5bc")}"></div>`).join("");
  const dividers = [colW[0], colW[0] + colW[1]].map((x) => `<div style="${abs(inner + x, ROW0, 2, ROWH * ROWS, "background:#e2ded5")}"></div>`).join("");
  const cell = (c, k, text, extra = "") => `<div data-check="entry" style="${abs(inner + colW.slice(0, c).reduce((a, b) => a + b, 0) + 16, rowTop(k), colW[c] - 18, ROWH - 4, `display:flex;align-items:flex-end;padding-bottom:12px;font:600 42px/1 'Hand',cursive;color:${ink};white-space:nowrap;${extra}`)}">${esc(text)}</div>`;
  const entries =
    cell(0, 0, t1, "transform:rotate(-.6deg)") + cell(1, 0, s1) + cell(2, 0, f1, "transform:rotate(.5deg)") +
    cell(0, 1, t2, "transform:rotate(.4deg)") + cell(1, 1, s2) + cell(2, 1, f2, "transform:rotate(-.4deg)");
  const rx0 = inner + colW[0] + colW[1] + 4;
  const ringBox = { w: 270, h: 70 };
  const stoppedRing = `<svg style="${abs(rx0 + 2, rowTop(1) + 14, ringBox.w + 40, ringBox.h + 30, "overflow:visible")}" viewBox="0 0 ${ringBox.w + 40} ${ringBox.h + 30}" aria-hidden="true"><path d="${ring(ringBox.w + 24, ringBox.h + 14, 4, 6)}" transform="translate(8 8)" fill="none" stroke="${C.plum}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/></svg>`;
  const page = `<div data-check="page" style="${abs(X, Y, PW, 1000, "background:#fbfaf7;transform:rotate(-2.2deg);transform-origin:50% 0;box-shadow:0 2px 3px rgba(20,35,25,.3),0 22px 38px rgba(10,25,15,.45),0 46px 70px -20px rgba(10,25,15,.5);z-index:2")}">
    <div style="${abs(0, 0, PW, 10, `background:${C.plum}`)}"></div>
    <div style="${abs(inner, 52, 520, 90, "font:400 70px/1.15 'Newsreader',serif;color:#1d1d20;white-space:nowrap")}">The reading log</div>
    <div style="${abs(PW - inner - 150, 64, 150, 46, "z-index:3;transform:rotate(3deg)")}"><span class="example" style="display:inline-block;border:none">Example</span></div>
    <div style="${abs(inner, 166, PW - inner * 2, 3, "background:#1d1d20")}"></div>
    ${heads}
    <div style="${abs(inner, ROW0 - 4, PW - inner * 2, 3, "background:#1d1d20")}"></div>
    ${dividers}${lines}${entries}${stoppedRing}
  </div>`;
  // blotter: green leather on ash wood, tan corner pieces
  const wood = desk({ top: SCENE_TOP, height: SH, base: "#dccdb2", dark: "#cdbb9a", planks: 5, seed: 8 });
  const blotter = `<div style="${abs(-20, SCENE_TOP + 32, 1040, SH + 40, "background:linear-gradient(160deg,#41695a,#2d4d41);border-radius:14px;box-shadow:0 3px 4px rgba(10,25,15,.4),0 24px 40px rgba(10,25,15,.4)")}"></div>
    <div style="${abs(-20, SCENE_TOP + 32, 1040, SH + 40, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.14),rgba(0,0,0,.28));border-radius:14px")}"></div>
    <svg style="${abs(0, SCENE_TOP + 32, 1000, 90)}" viewBox="0 0 1000 90" aria-hidden="true"><path d="M-10 0 H130 L-10 130 Z" fill="#c29a62"/><path d="M-10 0 H130 L-10 130 Z" fill="none" stroke="#8a6a3a" stroke-width="2" stroke-dasharray="7 5" transform="translate(-10 -4) scale(.92)"/><path d="M1010 0 H870 L1010 130 Z" fill="#c29a62"/></svg>`;
  // a library book lying half on the page, half on the blotter (seen from above, spine at the left)
  const book = `<svg style="${abs(716, 1010, 420, 300, "transform:rotate(11deg);filter:drop-shadow(0 4px 4px rgba(10,25,15,.4)) drop-shadow(0 20px 22px rgba(10,25,15,.45));z-index:4")}" viewBox="0 0 420 300" aria-hidden="true">
    <rect x="14" y="14" width="396" height="282" rx="6" fill="#efe6d0"/><rect x="6" y="6" width="396" height="280" rx="8" fill="#7b2f3a"/>
    <rect x="6" y="6" width="42" height="280" rx="8" fill="#5f2029"/><rect x="48" y="6" width="3" height="280" fill="#000" opacity=".2"/>
    <rect x="76" y="34" width="298" height="224" rx="4" fill="none" stroke="#d9b36a" stroke-width="3"/>
    <rect x="96" y="54" width="258" height="184" rx="3" fill="none" stroke="#d9b36a" stroke-width="1.5" opacity=".8"/>
    <circle cx="225" cy="146" r="46" fill="none" stroke="#d9b36a" stroke-width="3"/><circle cx="225" cy="146" r="30" fill="#d9b36a" opacity=".85"/>
    <rect x="6" y="6" width="396" height="280" rx="8" fill="url(#bk)" opacity=".5"/><defs><linearGradient id="bk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs></svg>`;
  const pen = pencil({ x: 110, y: 1262, len: 460, rot: -5 }).replace("<svg style=\"", "<svg style=\"z-index:3;");
  return printable({ n: 24, paper: "#e7ece3", extraCss: exampleCss, scene: `${wood}${blotter}${page}${book}${pen}` });
}

/* ------------------------------------------------------------------ #28 */

function pin28() {
  const i = idea(28);
  const risers = ["#cfdcc3", "#f0dfa6", "#efc9bd", "#c5d9e4", "#dccfe8"];
  const edge = ["#8aa182", "#d1a443", "#d27f6a", "#6f98ae", "#8a70a5"];
  const FLOOR = 56;
  const top = SCENE_TOP;
  const unit = (SH - FLOOR - 26) / 5; // riser + tread
  const TREAD = 26;
  const riserH = unit - TREAD;
  const bg = `<div style="${abs(0, top, 1000, SH, "background:#efe7d8")}"></div>`;
  const parts = i.items.map((t, k) => {
    const y0 = top + 26 + k * unit;
    return `<div style="${abs(0, y0, 1000, TREAD, "background:linear-gradient(180deg,#e9c391,#c99b66);box-shadow:0 1px 0 #f3d9b4 inset")}"></div>
      <div style="${abs(0, y0 + TREAD - 5, 1000, 6, "background:rgba(60,30,10,.22);filter:blur(2px);z-index:2")}"></div>
      <div style="${abs(0, y0 + TREAD, 1000, riserH, `background:linear-gradient(180deg,${risers[k]},${risers[k]}e8);z-index:1`)}"></div>
      <div style="${abs(0, y0 + TREAD, 1000, 12, "background:linear-gradient(180deg,rgba(40,20,5,.26),rgba(40,20,5,0));z-index:2")}"></div>
      <div style="${abs(40, y0 + TREAD + riserH / 2 - 44, 88, 88, `z-index:3;border-radius:50%;background:${edge[k]};box-shadow:0 3px 6px rgba(40,20,5,.3);display:grid;place-items:center;font:600 56px/1 'Newsreader',serif;color:#fff`)}">${k + 1}</div>
      <div data-check="step" style="${abs(156, y0 + TREAD + 8, k === 4 ? 540 : 810, riserH - 16, "z-index:3;display:flex;align-items:center;font:500 36px/1.26 'Plex',sans-serif;color:#2a2018;text-wrap:pretty")}">${esc(t)}</div>`;
  }).join("");
  const floorY = top + 26 + 5 * unit;
  const floor = `<div style="${abs(0, floorY, 1000, BOTTOM - floorY, "background:linear-gradient(180deg,#b88a56,#a67a46)")}"></div>
    <div style="${abs(0, floorY, 1000, 14, "background:linear-gradient(180deg,rgba(40,20,5,.4),rgba(40,20,5,0));z-index:2")}"></div>
    <div style="${abs(0, top, 1000, 26, "background:#f7f1e6")}"></div>`;
  // a school bag at the foot of the stairs, in front of the short last riser
  const bag = `<svg style="${abs(760, floorY - 178, 200, 200, "z-index:5;filter:drop-shadow(0 14px 12px rgba(40,20,5,.4))")}" viewBox="0 0 250 250" aria-hidden="true">
    <path d="M90 44 C 90 4, 160 4, 160 44" fill="none" stroke="#8a3f2c" stroke-width="12" stroke-linecap="round"/>
    <rect x="22" y="36" width="206" height="200" rx="52" fill="#d2674e"/><rect x="22" y="36" width="206" height="62" rx="40" fill="#e08068"/>
    <rect x="52" y="130" width="146" height="84" rx="20" fill="#b9513a"/><rect x="62" y="124" width="126" height="14" rx="7" fill="#8f3a29"/><rect x="108" y="150" width="34" height="14" rx="5" fill="#e9c27a"/>
    <path d="M22 110 C 4 120 4 190 24 204" fill="none" stroke="#8a3f2c" stroke-width="14" stroke-linecap="round"/><path d="M228 110 C 246 120 246 190 226 204" fill="none" stroke="#8a3f2c" stroke-width="14" stroke-linecap="round"/></svg>`;
  const stringers = `<div style="${abs(0, top, 16, SH, "background:linear-gradient(90deg,#8d6234,#b0834d);z-index:6;box-shadow:2px 0 6px rgba(40,20,5,.3)")}"></div><div style="${abs(984, top, 16, SH, "background:linear-gradient(270deg,#8d6234,#b0834d);z-index:6;box-shadow:-2px 0 6px rgba(40,20,5,.3)")}"></div>`;
  return printable({ n: 28, paper: "#f4ead3", extraCss: ".top h1{font-size:100px}", scene: `${bg}${parts}${floor}${stringers}${bag}` });
}

/* ------------------------------------------------------------------ #34 */

function pin34() {
  const i = idea(34);
  const r = seeded(11);
  const speck = Array.from({ length: 320 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * SH).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#000"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, SH, "background:linear-gradient(180deg,#2c4260,#22344c)")}"></div>
    <svg style="${abs(0, SCENE_TOP, 1000, SH)}" viewBox="0 0 1000 ${SH}" aria-hidden="true">${speck}</svg>
    <div style="${abs(0, SCENE_TOP, 1000, SH, "background:radial-gradient(ellipse at 20% 0%,rgba(255,255,255,.14),rgba(0,0,10,.34) 95%)")}"></div>`;
  const TX = 84, TW = 876;
  const heights = [158, 112, 196, 158, 158];
  const GAP = 14;
  let y = SCENE_TOP + 20;
  const tags = [];
  const holes = [];
  i.items.forEach((t, k) => {
    const h = heights[k];
    const rot = [-0.5, 0.4, -0.3, 0.5, -0.4][k];
    const hy = h / 2;
    tags.push(`<div style="${abs(TX, y, TW, h, `transform:rotate(${rot}deg);z-index:3;filter:drop-shadow(0 2px 2px rgba(0,0,10,.35)) drop-shadow(0 12px 12px rgba(0,0,10,.4))`)}">
      <div style="${abs(0, 0, TW, h, "background:linear-gradient(135deg,#d2b185,#c19c6a);clip-path:polygon(0 50%,44px 0,100% 0,100% 100%,44px 100%)")}"></div>
      <div style="${abs(0, 0, TW, h, "background:repeating-linear-gradient(100deg,rgba(120,80,30,.06) 0 3px,rgba(255,255,255,.05) 3px 7px);clip-path:polygon(0 50%,44px 0,100% 0,100% 100%,44px 100%)")}"></div>
      <div style="${abs(30, hy - 22, 44, 44, "border-radius:50%;background:#f4ecd9;box-shadow:0 1px 0 rgba(255,255,255,.4),inset 0 0 0 1px rgba(80,50,10,.3)")}"><div style="${abs(11, 11, 22, 22, "border-radius:50%;background:#22344c;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)")}"></div></div>
      <div style="${abs(98, hy - 31, 62, 62, `border-radius:50%;border:3px solid ${C.plumDeep};display:grid;place-items:center;font:700 44px/1 'Newsreader',serif;color:${C.plumDeep}`)}">${k + 1}</div>
      <div data-check="step" style="${abs(184, 8, TW - 184 - 24, h - 16, "display:flex;align-items:center;font:500 28px/1.26 'Plex',sans-serif;color:#26180a")}">${esc(t)}</div>
    </div>`);
    holes.push(y + hy);
    y += h + GAP;
  });
  // the twine: one line down through every hole, tied in a bow-less loop at each tag
  const tx = TX + 52;
  const twineD = `M${tx} ${SCENE_TOP - 10} L${tx} ${y - GAP + 6}`;
  const twine = `<svg style="${abs(0, 0, 1000, 1500, "z-index:2")}" viewBox="0 0 1000 1500" aria-hidden="true"><path d="${twineD}" stroke="#16202f" stroke-width="9" opacity=".35" fill="none" transform="translate(5 4)"/><path d="${twineD}" stroke="#e5d3a8" stroke-width="6" fill="none" stroke-linecap="round" stroke-dasharray="14 3"/></svg>`;
  const loops = holes.map((hy) => `<svg style="${abs(tx - 20, hy - 22, 40, 44, "z-index:4")}" viewBox="0 0 40 44" aria-hidden="true"><path d="M20 -2 C 2 12, 2 32, 20 46" stroke="#e5d3a8" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M20 2 C 38 14, 38 30, 20 42" stroke="#cdb888" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`).join("");
  // a scrap of paper at the foot: the caution line, and a pencil sketch of a clock and a calendar
  const sy = y + 2;
  const sketch = `<svg style="${abs(660, 4, 190, 84, "")}" viewBox="0 0 190 92" aria-hidden="true" fill="none" stroke="#5a5f6a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="44" cy="46" r="32"/><circle cx="44" cy="46" r="29" stroke-width="1.5" opacity=".6"/><path d="M44 26 V46 L58 54"/><path d="M44 17 V20 M44 72 V75 M15 46 H18 M70 46 H73" stroke-width="2.5"/>
    <rect x="104" y="18" width="74" height="62" rx="4"/><path d="M104 36 H178 M122 12 V24 M160 12 V24"/><path d="M114 48 h8 M130 48 h8 M146 48 h8 M162 48 h8 M114 58 h8 M130 58 h8 M146 58 h8 M114 68 h8 M130 68 h8" stroke-width="2.5"/><path d="M146 56 l5 6 l9 -12" stroke="${C.plumDeep}" stroke-width="3.5"/></svg>`;
  const scrap = `<div style="${abs(TX + 40, sy, TW - 80, BOTTOM - sy - 8, "background:#f8f2e4;z-index:3;transform:rotate(.3deg);box-shadow:0 2px 3px rgba(0,0,10,.35),0 10px 16px rgba(0,0,10,.4)")}">
    <div data-check="caution" style="${abs(24, 6, 596, BOTTOM - sy - 20, "display:flex;align-items:center;gap:14px;font:600 24px/1.2 'Plex',sans-serif;color:#2b2330")}"><span style="flex:none;display:flex">${icon("warning", { size: 34, color: "#8a5a12", weight: "fill" })}</span><span>${esc(CAUTION)}</span></div>
    ${sketch}</div>${tape(TX + 70, sy + 4, 100, -12, "rgba(224,169,90,.88)")}`;
  return printable({ n: 34, paper: "#ece4d4", extraCss: ".top h1{font-size:58px}", scene: `${wall}${twine}${tags.join("")}${loops}${scrap}`, bottomMax: 368 });
}

/* ------------------------------------------------------------------ #40 */

function pin40() {
  const i = idea(40);
  const r = seeded(21);
  // outside: soft sky and tree masses seen through the glass
  const sky = `<div style="${abs(0, SCENE_TOP, 1000, SH, "background:linear-gradient(180deg,#bcd9e8 0%,#d9ebef 55%,#eef2e0 100%)")}"></div>
    <svg style="${abs(0, SCENE_TOP, 1000, SH, "filter:blur(14px)")}" viewBox="0 0 1000 ${SH}" aria-hidden="true">
      <ellipse cx="170" cy="150" rx="150" ry="36" fill="#fff" opacity=".8"/><ellipse cx="260" cy="170" rx="110" ry="30" fill="#fff" opacity=".8"/><ellipse cx="820" cy="260" rx="130" ry="30" fill="#fff" opacity=".7"/>
      <ellipse cx="90" cy="800" rx="190" ry="170" fill="#7ea36d"/><ellipse cx="300" cy="880" rx="200" ry="140" fill="#93b57c"/><ellipse cx="620" cy="900" rx="240" ry="130" fill="#6f9764"/><ellipse cx="900" cy="760" rx="190" ry="200" fill="#86ab74"/></svg>
    <svg style="${abs(0, SCENE_TOP, 1000, SH)}" viewBox="0 0 1000 ${SH}" aria-hidden="true"><polygon points="-20,0 260,0 -20,420" fill="#fff" opacity=".13"/></svg>`;
  // the window casing: white painted frame, a bottom rail and the sill
  const SILL = 1262;
  const frame = `<div style="${abs(0, SCENE_TOP, 30, SILL - SCENE_TOP, "background:linear-gradient(90deg,#f7f4ee,#e6e1d6);box-shadow:3px 0 8px rgba(30,40,50,.28);z-index:6")}"></div>
    <div style="${abs(970, SCENE_TOP, 30, SILL - SCENE_TOP, "background:linear-gradient(270deg,#f7f4ee,#e6e1d6);box-shadow:-3px 0 8px rgba(30,40,50,.28);z-index:6")}"></div>
    <div style="${abs(0, SILL - 40, 1000, 40, "background:linear-gradient(180deg,#eeeae0,#dfd9cc);box-shadow:0 -3px 8px rgba(30,40,50,.25);z-index:6")}"></div>
    <div style="${abs(-10, SILL, 1020, BOTTOM - SILL + 20, "background:linear-gradient(180deg,#fbf9f3 0,#f1ede3 32px,#d8d2c4 34px,#e6e1d4 100%);box-shadow:0 -2px 10px rgba(30,40,50,.3);z-index:7")}"></div>`;
  // the lined sheet taped to the glass
  const PX = 78, PY = 418, PW = 800, PH = 792, LH = 44;
  const lineTop = 58;
  const nLines = Math.floor((PH - lineTop - 10) / LH);
  const ruled = Array.from({ length: nLines }, (_, k) => `<div style="${abs(0, lineTop + k * LH, PW, 2, "background:#a9c4dc")}"></div>`).join("");
  const holesL = Array.from({ length: 7 }, (_, k) => `<div style="${abs(-9, 62 + k * 108, 30, 30, "border-radius:50%;background:#cfe0e8;box-shadow:inset 0 3px 5px rgba(0,0,0,.35)")}"></div>`).join("");
  // steps in handwriting, each on the ruled lines, with a hand-drawn ringed number
  const lineCounts = [3, 2, 1, 4, 2];
  let ln = 0;
  const steps = i.items.map((t, k) => {
    const top = lineTop + ln * LH - 3;
    const lines = lineCounts[k];
    ln += lines + 1;
    const ringSvg = `<svg style="${abs(96, top + 4, 58, 58, "overflow:visible")}" viewBox="0 0 58 58" aria-hidden="true"><path d="${ring(46, 46, 30 + k, 4)}" transform="translate(4 4)" fill="none" stroke="${C.plum}" stroke-width="3.5" stroke-linecap="round"/></svg>
      <div style="${abs(96, top + 4, 58, 58, `display:grid;place-items:center;font:700 40px/1 'Hand',cursive;color:${C.plum}`)}">${k + 1}</div>`;
    return `${ringSvg}<div data-check="step" style="${abs(176, top, PW - 176 - 36, lines * LH + 6, `font:600 37px/${LH}px 'Hand',cursive;color:#27324d;padding-top:0`)}">${esc(t)}</div>`;
  }).join("");
  const margin = `<div style="${abs(84, 0, 3, PH, "background:#e29a9a;opacity:.75")}"></div>`;
  const sheet = `<div data-check="page" style="${abs(PX, PY, PW, PH, "background:#fdfcf6;transform:rotate(-1.4deg);box-shadow:0 2px 3px rgba(30,40,50,.3),0 20px 34px rgba(30,40,50,.35);z-index:3;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)")}">${ruled}${margin}${holesL}${steps}</div>`;
  const tapes = tape(PX + 110, PY + 6, 150, -14, "rgba(138,161,130,.9)") + tape(PX + PW - 100, PY + 4, 150, 10, "rgba(224,169,90,.9)") + tape(PX + 40, PY + PH - 30, 130, 30, "rgba(138,161,130,.9)");
  // a plant in a terracotta pot and a pencil on the sill
  const r2 = seeded(5);
  const leaves = Array.from({ length: 11 }, (_, k) => {
    const a = -150 + k * 30 + (r2() - 0.5) * 12;
    const len = 150 + r2() * 70;
    const rad = (a * Math.PI) / 180;
    const x2 = 150 + Math.cos(rad) * len * 0.62, y2 = 210 + Math.sin(rad) * len;
    const mx = 150 + Math.cos(rad) * len * 0.42, my = 210 + Math.sin(rad) * len * 0.5;
    const nx = -Math.sin(rad) * 28, ny = Math.cos(rad) * 28;
    return `<path d="M150 214 Q ${mx + nx} ${my + ny} ${x2} ${y2} Q ${mx - nx} ${my - ny} 150 214 Z" fill="${["#5f8f55", "#6fa061", "#4f7f49"][k % 3]}"/><path d="M150 214 L ${x2} ${y2}" stroke="#3d6a3a" stroke-width="2" opacity=".5"/>`;
  }).join("");
  const plant = `<svg style="${abs(826, SILL - 196, 172, 232, "z-index:8;filter:drop-shadow(0 12px 10px rgba(30,40,50,.35))")}" viewBox="0 0 300 400" aria-hidden="true">${leaves}
    <path d="M70 226 H230 L214 380 Q 150 394 86 380 Z" fill="#c7673f"/><rect x="62" y="210" width="176" height="34" rx="8" fill="#d97a50"/><path d="M70 226 H230" stroke="#fff" opacity=".2" stroke-width="3"/><ellipse cx="150" cy="212" rx="84" ry="9" fill="#5a3b24"/></svg>`;
  const pen = pencil({ x: 110, y: SILL + 52, len: 420, rot: -3 }).replace("<svg style=\"", "<svg style=\"z-index:9;");
  return printable({ n: 40, paper: "#e8eef0", extraCss: ".top h1{font-size:60px}", scene: `${sky}${sheet}${tapes}${frame}${plant}${pen}` });
}

export const pins = [pin24(), pin28(), pin34(), pin40()];
