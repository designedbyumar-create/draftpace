/**
 * Batch 2, group G10: five guide pins on moving day (boxes, packing tape, a marker, labels, bubble wrap).
 *   87 flattened kraft cardboard, top-down: a floor plan on white paper taped down (rooms drawn to 200/150/150), two shipping labels, a marker
 *   88 bare grey-washed floorboards of an empty flat: the opening line on a big paper card, three tabbed index cards, two mugs, a tape roll
 *   89 a slate-blue quilted moving blanket: two paper panels split by a strip of packing tape ("vs"), paycheck strips, a bubble-wrap sheet and a tape roll
 *   90 the front of a teal plastic storage tote: a packing list taped to it with seven checkbox lines, a marker, a tape roll
 *   91 crumpled packing paper: the four CSV lines on a paper strip, a laptop screen with a plain text editor behind, bubble wrap, a tape roll, a marker
 * Every word is the idea bank's own (headline, sub, items, proof). Words set here that are not a cut of the bank text:
 *   #87 "200 square feet", "150 square feet", "40 percent", "30 percent" (cuts of "Rooms of 200, 150 and 150 square feet" and "40, 30 and 30 percent"),
 *       sticky notes "bathroom?" and "parking?" (the idea's visual), "Example" (the kit tag)
 *   #88 the tab names "If incomes differ a lot", "If they'd rather not share", "If it stops feeling fair" (the idea's visual)
 *   #89 "50/50", "By Income", "vs" (the headline), "$4,200" and "$2,100" (the sub), "$996" and "about 32 percent" (the items), "Example" (the kit tag)
 *   #91 the flag "same row?", the note "not spending", and a hand-drawn "?" (the idea's visual); the editor behind carries only line numbers and blank bars
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { mug, desk } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const EXAMPLE = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 12px;background:#fffdf6;color:#1d1d20;border-color:#1d1d20;${extra}">Example</span>`;

/* ----------------------------------------------------------------- props */

/** A strip of brown packing tape (translucent, ragged ends). */
function tapeStrip({ x, y, w = 150, h = 44, rot = 0, z = 6, color = "rgba(205,160,92,.86)" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(${color},rgba(180,135,70,.82));box-shadow:0 2px 3px rgba(40,20,5,.28);clip-path:polygon(0 0,3% 12%,0 25%,3% 38%,0 50%,3% 62%,0 75%,3% 88%,0 100%,100% 100%,97% 88%,100% 75%,97% 62%,100% 50%,97% 38%,100% 25%,97% 12%,100% 0);z-index:${z}`)}">
    <div style="${abs(0, 0, w, h, "background:linear-gradient(100deg,rgba(255,255,255,.28),rgba(255,255,255,0) 40%)")}"></div></div>`;
}

/** A roll of packing tape seen from above. */
function tapeRoll({ x, y, d = 130, rot = 0, z = 6 }) {
  return `<svg style="${abs(x, y, d, d, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(20,10,5,.45));z-index:${z}`)}" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#cf9f55"/><circle cx="50" cy="50" r="48" fill="none" stroke="#7d5a2a" stroke-opacity=".5" stroke-width="2"/>
    <circle cx="50" cy="50" r="38" fill="none" stroke="#e8c486" stroke-opacity=".6" stroke-width="2"/>
    <circle cx="50" cy="50" r="31" fill="#b4803a"/><circle cx="50" cy="50" r="25" fill="#6a5237"/><circle cx="50" cy="50" r="25" fill="none" stroke="#e8d3ad" stroke-width="3"/>
    <path d="M22 28 A34 34 0 0 1 56 15" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** A black chisel marker lying flat with a coloured cap. */
function marker({ x, y, len = 380, rot = 0, cap = "#c4372c", z = 6 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,10,5,.45));z-index:${z}`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <path d="M2 17 L24 8 L24 26 Z" fill="#17181a"/><rect x="24" y="5" width="${len - 150}" height="24" rx="6" fill="#23252a"/><rect x="24" y="7" width="${len - 150}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 126}" y="2" width="124" height="30" rx="9" fill="${cap}"/><rect x="${len - 126}" y="4" width="124" height="8" rx="4" fill="#fff" opacity=".28"/><rect x="${len - 142}" y="8" width="16" height="18" fill="#d8dadd"/>
    <rect x="70" y="10" width="${len - 230}" height="14" rx="3" fill="#f5f2e8" opacity=".92"/></svg>`;
}

/** A sheet of bubble wrap: a clear blue-tinged rectangle of domed bubbles. */
function bubbleWrap({ x, y, w, h, rot = 0, z = 3 }) {
  const dome = "radial-gradient(circle at 36% 30%,rgba(255,255,255,.95) 0 3px,rgba(255,255,255,.3) 4px 9px,rgba(190,220,236,.2) 10px 17px,rgba(100,140,165,.45) 18px 20px,transparent 21px)";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};background:${dome},rgba(205,230,242,.5);background-size:44px 44px,auto;border-radius:10px;box-shadow:0 2px 3px rgba(10,20,30,.3),0 16px 24px rgba(10,20,30,.35),inset 0 0 0 2px rgba(255,255,255,.45)`)}"></div>`;
}

/** A white shipping label with a coloured top band. `inner` goes below the band. */
function shipLabel({ x, y, w, h, rot = 0, band = C.forest, z = 4, inner = "", pad = 22 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fffefb;border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 14px 22px rgba(40,20,5,.35);z-index:${z};overflow:hidden`)}">
    <div style="${abs(0, 0, w, 14, `background:${band}`)}"></div>
    <div style="${abs(pad, 26, w - pad * 2, h - 26 - 14)}">${inner}</div></div>`;
}

/** A luggage-style price tag: a white card with a punched hole and a printed figure. */
function figureTag(text, { w = 190, h = 84, size = 46, hot = false } = {}) {
  return `<div style="position:relative;width:${w}px;height:${h}px;flex:none;background:#fffefb;border:3px solid ${C.forestDeep};border-radius:10px;box-shadow:0 3px 0 rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;padding-left:18px;font:600 ${size}px 'Newsreader',serif;color:${hot ? "#8a4a00" : C.forestDeep}">
    <div style="${abs(10, h / 2 - 8, 14, 14, `border-radius:50%;background:#d9d4c4;border:2px solid ${C.forestDeep};box-sizing:border-box`)}"></div>${esc(text)}</div>`;
}

/** A hand-drawn pencil tick. */
const tick = (color = "#59595e", size = 52) => `<svg width="${size}" height="${size}" viewBox="0 0 44 44" style="position:absolute;left:0;top:0" aria-hidden="true"><path d="M7 24 Q12 27 16 36 Q24 17 39 6" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ------------------------------------------------------------------ #87 */

function pin87() {
  const i = idea(87);
  // flattened kraft cardboard, top-down: corrugation stripes, a crease, soft light
  const rnd = seeded(7);
  const scuffs = Array.from({ length: 16 }, () => `<div style="${abs(rnd() * 900, 372 + rnd() * 1000, 40 + rnd() * 120, 3 + rnd() * 4, `background:rgba(110,70,30,${(0.1 + rnd() * 0.12).toFixed(2)});border-radius:3px;transform:rotate(${(rnd() * 8 - 4).toFixed(1)}deg)`)}"></div>`).join("");
  const board = `<div style="${abs(0, 372, 1000, 1128, "background-color:#c89c63;background-image:repeating-linear-gradient(90deg,rgba(110,70,30,.16) 0 3px,rgba(255,232,190,.12) 3px 8px)")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 22% 14%,rgba(255,240,205,.35),rgba(70,40,10,.38) 100%)")}"></div>
    <div style="${abs(0, 1088, 1000, 6, "background:rgba(90,55,20,.38);box-shadow:0 2px 0 rgba(255,235,195,.3)")}"></div>${scuffs}`;

  // the plan, drawn to scale: 800 x 560 where 200 : 150 : 150 = 320 x 560 : 480 x 280 : 480 x 280
  const wall = (x, y, w, h) => `<div style="${abs(x, y, w, h, `background:${C.forestDeep}`)}"></div>`;
  const win = (x, y, w, h) => `<div style="${abs(x, y, w, h, `background:#bfe0ef;border:2px solid ${C.forestDeep};box-sizing:border-box`)}"></div>`;
  const roomText = (pct, sq, tag, hot, col) => `<div style="display:flex;flex-direction:${col ? "column" : "row"};align-items:center;justify-content:center;gap:${col ? 14 : 24}px;white-space:nowrap">
      <div style="flex:none;text-align:${col ? "center" : "left"};color:${C.forestDeep}"><div style="font:600 ${col ? 52 : 50}px/1 'Newsreader',serif">${pct} percent</div><div data-check="room size" style="font:500 27px/1.2 'Plex',sans-serif;margin-top:8px">${sq} square feet</div></div>${figureTag(tag, { w: col ? 200 : 176, size: col ? 48 : 44, hot })}</div>`;
  const plan = `<div style="${abs(54, 92, 800, 560)}">
    <div style="${abs(0, 0, 320, 560, "background:#f3cf7c")}"></div>
    <div style="${abs(320, 0, 480, 280, "background:#e3ede8")}"></div><div style="${abs(320, 280, 480, 280, "background:#e3ede8")}"></div>
    ${wall(0, 0, 800, 10)}${wall(0, 550, 800, 10)}${wall(0, 0, 10, 560)}${wall(790, 0, 10, 560)}${wall(315, 0, 10, 560)}${wall(320, 275, 470, 10)}
    ${win(100, 0, 130, 10)}${win(560, 0, 150, 10)}${win(790, 90, 10, 110)}${win(560, 550, 150, 10)}${win(0, 330, 10, 110)}
    <div style="${abs(10, 40, 305, 300, "display:flex;align-items:flex-start;justify-content:center")}">${roomText(40, 200, "$1,080", true, true)}</div>
    <div style="${abs(325, 10, 465, 265, "display:flex;align-items:center;justify-content:center")}">${roomText(30, 150, "$810", false, false)}</div>
    <div style="${abs(325, 285, 465, 265, "display:flex;align-items:center;justify-content:center")}">${roomText(30, 150, "$810", false, false)}</div>
    <div class="hand" data-check="sticky" style="${abs(24, 372, 214, 112, "transform:rotate(-4deg);background:#fbe58f;box-shadow:0 2px 3px rgba(60,40,0,.3),0 10px 14px rgba(60,40,0,.3);display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:700;color:#3a3220;z-index:3")}">bathroom?</div>
    <div class="hand" data-check="sticky" style="${abs(76, 454, 214, 84, "transform:rotate(3deg);background:#f3b6c1;box-shadow:0 2px 3px rgba(60,40,0,.3),0 10px 14px rgba(60,40,0,.3);display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:700;color:#3a3220;z-index:3")}">parking?</div>
  </div>`;
  const sheetEl = `<div data-check="page" style="${abs(46, 404, 908, 700, "transform:rotate(-0.8deg);background:#fffefb;box-shadow:0 2px 4px rgba(50,25,5,.3),0 24px 40px rgba(50,25,5,.42);z-index:3")}">
    <div style="${abs(0, 0, 908, 10, `background:${C.forest}`)}"></div>
    <div style="${abs(54, 24, 200, 46)}">${EXAMPLE()}</div>${plan}</div>`;
  const tapes = tapeStrip({ x: 14, y: 392, rot: -38, w: 150, z: 6 }) + tapeStrip({ x: 836, y: 392, rot: 38, w: 150, z: 6 }) +
    tapeStrip({ x: 14, y: 1070, rot: 38, w: 150, z: 6 }) + tapeStrip({ x: 836, y: 1070, rot: -38, w: 150, z: 6 });
  const label1 = shipLabel({ x: 46, y: 1130, w: 380, h: 170, rot: -1, band: C.forest, z: 4,
    inner: `<div data-check="item" style="${abs(0, 0, 336, 120, "display:flex;align-items:center;font:600 28px/1.25 'Plex',sans-serif;text-wrap:balance;color:" + C.forestDeep)}">${esc(i.items[0])}</div>` });
  const label2 = shipLabel({ x: 452, y: 1124, w: 502, h: 176, rot: 0.8, band: C.amber, z: 4,
    inner: `<div data-check="item" style="${abs(0, 0, 458, 126, "display:flex;align-items:center;font:600 28px/1.25 'Plex',sans-serif;color:" + C.forestDeep)}">${esc(i.items[3])}</div>` });
  const mk = marker({ x: 560, y: 1310, len: 380, rot: -1.5, cap: "#c4372c", z: 6 });
  return printable({ n: 87, scene: board + sheetEl + tapes + label1 + label2 + mk, paper: "#f3e7d3" });
}

/* ------------------------------------------------------------------ #88 */

function pin88() {
  const i = idea(88);
  const floor = desk({ top: 372, height: 1128, planks: 9, base: "#d3cbbd", dark: "#bdb4a4", seed: 12 }) +
    `<div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.3),rgba(60,70,85,.3) 100%)")}"></div>`;
  const hero = `<div style="${abs(40, 400, 720, 372, "transform:rotate(-1.1deg);background:#fffdf7;box-shadow:0 2px 4px rgba(40,30,15,.3),0 26px 40px rgba(40,30,15,.4);z-index:3")}">
    <div style="${abs(0, 0, 720, 14, `background:${C.forest}`)}"></div>
    <div style="${abs(40, 18, 120, 100, `font:600 150px/1 'Newsreader',serif;color:${C.forest};opacity:.35`)}">&ldquo;</div>
    <div data-check="quote" style="${abs(44, 62, 632, 290, `display:flex;align-items:center;font:500 47px/1.2 'Newsreader',serif;color:${C.forestDeep};letter-spacing:-.01em;overflow:hidden`)}"><div>${esc(i.items[0])}</div></div></div>`;
  const tabs = ["If incomes differ a lot", "If they'd rather not share", "If it stops feeling fair"];
  const tabX = [60, 330, 560];
  const tops = [822, 990, 1158];
  const tint = ["#fffdf7", "#fbf6e6", "#f4f9f6"];
  const cards = [1, 2, 3].map((k, j) => {
    const rr = [0.7, -0.6, 0.5][j];
    return `<div style="${abs(40, tops[j], 780, 140, `transform:rotate(${rr}deg);z-index:${3 + j}`)}">
      <div style="${abs(0, 0, 780, 140, `background:linear-gradient(${tint[j]} 0 0);border-radius:6px;box-shadow:0 2px 3px rgba(40,30,15,.3),0 12px 18px rgba(40,30,15,.32);border-top:5px solid ${[C.forest, C.amber, C.pink][j]}`)}"></div>
      <div data-check="tab" style="${abs(tabX[j], -30, 300, 34, `background:${[C.forest, C.amber, "#d98a99"][j]};border-radius:8px 8px 0 0;color:#fff;font:600 22px/34px 'Plex',sans-serif;text-align:center;white-space:nowrap;overflow:hidden;box-shadow:0 -2px 3px rgba(40,30,15,.2)`)}">${esc(tabs[j])}</div>
      <div data-check="line" style="${abs(30, 14, 720, 118, `display:flex;align-items:center;font:500 27px/1.27 'Plex',sans-serif;color:#1d1d20;overflow:hidden`)}"><div>${esc(i.items[k])}</div></div></div>`;
  }).join("");
  const m1 = mug({ x: 784, y: 392, size: 128, color: "#f3ede4", drink: "#6b4226" });
  const m2 = mug({ x: 800, y: 548, size: 120, color: "#cfe0d6", drink: "#4d2f1a" });
  const roll = tapeRoll({ x: 836, y: 690, d: 112, rot: 20 });
  return printable({ n: 88, scene: floor + hero + cards + m1 + m2 + roll, paper: "#e9e4da" });
}

/* ------------------------------------------------------------------ #89 */

function pin89() {
  const i = idea(89);
  const blanket = `<div style="${abs(0, 372, 1000, 1128, "background-color:#4f6489;background-image:repeating-linear-gradient(45deg,transparent 0 56px,rgba(205,220,245,.38) 56px 58px,transparent 58px 60px),repeating-linear-gradient(-45deg,transparent 0 56px,rgba(205,220,245,.38) 56px 58px,transparent 58px 60px)")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background-image:radial-gradient(circle at 50% 50%,rgba(255,255,255,.12),rgba(20,30,55,.18) 60%,transparent 62%);background-size:85px 85px;opacity:.9")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 25% 12%,rgba(255,255,255,.18),rgba(15,22,45,.5) 100%)")}"></div>`;
  const S = 380 / 4200; // px per dollar
  const strip = ({ total, chunk, chunkLabel, hot }) => {
    const L = total * S, c = chunk * S;
    return `<div style="${abs(0, 0, 390, 96)}">
      <div style="${abs(0, 0, L - c - 8, 64, `background:#f6f3ea;border:3px solid ${C.forestDeep};border-radius:6px 0 0 6px;box-sizing:border-box;overflow:hidden`)}">
        <div style="${abs(0, 0, L, 14, `background:${C.forest}`)}"></div>
        <div style="${abs(14, 26, 70, 5, "background:#c9c6bc;border-radius:3px")}"></div><div style="${abs(14, 40, 40, 5, "background:#c9c6bc;border-radius:3px")}"></div></div>
      <div style="${abs(L - c, 10, c, 64, `transform:rotate(3deg);transform-origin:0 0;background:${hot ? "#f3cf7c" : "#cfe3d8"};border:3px dashed ${hot ? "#8a4a00" : C.forestDeep};border-radius:0 6px 6px 0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font:600 24px 'Plex',sans-serif;color:${C.forestDeep};box-shadow:0 5px 6px rgba(10,15,30,.3)`)}">${chunkLabel ?? ""}</div></div>`;
  };
  const caption = (L, text, hot) => `<div data-check="caption" style="${abs(0, 0, 390, 40, `font:${hot ? 700 : 600} 27px/40px 'Plex',sans-serif;color:${hot ? "#8a4a00" : C.forestDeep};white-space:nowrap;overflow:hidden`)}">${esc(text)}</div>`;
  const panel = ({ x, title, rows, body }) => `<div style="${abs(x, 404, 450, 780, "background:#fffdf8;border-radius:8px;box-shadow:0 2px 4px rgba(10,15,30,.35),0 24px 40px rgba(10,15,30,.5);z-index:3")}">
    <div style="${abs(0, 0, 450, 14, `background:${C.forest};border-radius:8px 8px 0 0`)}"></div>
    <div data-check="panel title" style="${abs(30, 34, 240, 64, `font:600 46px/64px 'Newsreader',serif;color:${C.forestDeep};white-space:nowrap`)}">${esc(title)}</div>
    <div style="${abs(246, 44, 180, 44, "text-align:right")}">${EXAMPLE("font-size:22px;letter-spacing:.08em")}</div>
    ${rows.map((r, k) => `<div style="${abs(30, 124 + k * 200, 390, 190)}">
      <div data-check="pay" style="${abs(0, 0, 390, 34, `font:500 27px/34px 'Plex Mono',monospace;color:#3a3a40`)}">${esc(r.pay)}</div>
      <div style="${abs(0, 42, 390, 96)}">${strip(r)}</div>
      <div style="${abs(0, 142, 390, 40)}">${caption(r.total * S, r.cap, r.hot)}</div></div>`).join("")}
    <div data-check="item" style="${abs(30, 532, 390, 224, `font:500 27px/1.26 'Plex',sans-serif;color:#1d1d20;overflow:hidden`)}">${body}</div></div>`;
  const left = panel({
    x: 36, title: "50/50",
    rows: [
      { pay: "$4,200", total: 4200, chunk: 996, chunkLabel: "$996", cap: "24 percent", hot: false },
      { pay: "$2,100", total: 2100, chunk: 996, chunkLabel: "$996", cap: "47 percent", hot: true },
    ],
    body: `<p style="font-weight:600;color:${C.forestDeep}">${esc(i.items[0])}</p><p style="margin-top:12px">${esc(i.items[1])}</p>`,
  });
  const right = panel({
    x: 514, title: "By Income",
    rows: [
      { pay: "$4,200", total: 4200, chunk: 1344, cap: "about 32 percent", hot: false },
      { pay: "$2,100", total: 2100, chunk: 672, cap: "about 32 percent", hot: false },
    ],
    body: `<p style="font-weight:600;color:${C.forestDeep}">${esc(i.items[2])}</p>`,
  });
  const divider = tapeStrip({ x: 475, y: 388, w: 50, h: 808, rot: 0, z: 5 }).replace("clip-path:polygon", "clip-path:polygon") +
    `<div class="serif" style="${abs(458, 750, 84, 84, `z-index:6;border-radius:50%;background:#fffdf8;border:4px solid ${C.forestDeep};display:flex;align-items:center;justify-content:center;font:600 40px 'Newsreader',serif;font-style:italic;color:${C.forestDeep};box-shadow:0 6px 10px rgba(10,15,30,.4)`)}">vs</div>`;
  const wrap = bubbleWrap({ x: -20, y: 1226, w: 1040, h: 150, rot: -0.6, z: 2 });
  const roll = tapeRoll({ x: 820, y: 1214, d: 124, rot: 10, z: 6 });
  const mk = marker({ x: 90, y: 1268, len: 360, rot: 2, cap: "#2f6fb3", z: 6 });
  return printable({ n: 89, scene: blanket + left + right + divider + wrap + roll + mk, paper: "#e6ebf2" });
}

/* ------------------------------------------------------------------ #90 */

function pin90() {
  const i = idea(90);
  // the front of a teal plastic tote: ridges, a darker lid band, two latches
  const ridges = Array.from({ length: 9 }, (_, k) => `<div style="${abs(0, 500 + k * 120, 1000, 22, "background:linear-gradient(rgba(0,0,0,.2),rgba(255,255,255,.08));")}"></div>`).join("");
  const tote = `<div style="${abs(0, 372, 1000, 1128, "background:linear-gradient(90deg,#1a504d,#22655f 40%,#1d5a55)")}"></div>${ridges}
    <div style="${abs(0, 372, 1000, 118, "background:linear-gradient(#2c746d,#164641);box-shadow:0 8px 14px rgba(0,0,0,.4);z-index:2")}"></div>
    <div style="${abs(0, 484, 1000, 8, "background:rgba(0,0,0,.35);z-index:2")}"></div>
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 28% 18%,rgba(255,255,255,.2),rgba(0,12,12,.5) 100%);z-index:2")}"></div>
    ${[90, 760].map((x) => `<div style="${abs(x, 440, 150, 96, "z-index:3;border-radius:12px;background:linear-gradient(#e8ecee,#a6aeb3);box-shadow:0 5px 8px rgba(0,0,0,.45)")}"><div style="${abs(34, 22, 82, 30, "border-radius:8px;background:#15393a;box-shadow:inset 0 3px 5px rgba(0,0,0,.6)")}"></div></div>`).join("")}`;
  const rowH = 80;
  const done = [0, 2, 4]; // three ticked in pencil
  const hot = 4; // the one pop-colour tick
  const rows = i.items.map((s, k) => `<div style="display:flex;gap:22px;align-items:flex-start">
      <div style="position:relative;flex:none;width:52px;height:52px;margin-top:2px;border:4px solid ${C.forestDeep};border-radius:9px;background:#fffefa">${done.includes(k) ? tick(k === hot ? "#d9962b" : "#59595e", 58).replace("left:0;top:0", "left:-2px;top:-12px") : ""}</div>
      <div data-check="line" style="flex:1;font:500 30px/1.26 'Plex',sans-serif;text-wrap:balance;color:${C.forestDeep}">${esc(s)}</div></div>`)
    .join(`<div style="height:2px;background:#cbd9e2;flex:none"></div>`);
  const SX = 70, SY = 528, SW = 780, SH = 742;
  const sheetEl = `<div data-check="page" style="${abs(SX, SY, SW, SH, "transform:rotate(-1.3deg);background:repeating-linear-gradient(#fffefa 0 53px,#d3e0e8 53px 55px);box-shadow:0 2px 4px rgba(0,0,0,.4),0 28px 44px rgba(0,0,0,.55);z-index:4")}">
    <div style="${abs(0, 0, SW, 14, `background:${C.forest}`)}"></div>
    <div style="${abs(70, 14, 3, SH - 14, "background:rgba(217,84,74,.45)")}"></div>
    <div style="${abs(38, 40, SW - 76, SH - 70, "display:flex;flex-direction:column;justify-content:space-between")}">${rows}</div></div>`;
  const tapes = tapeStrip({ x: SX - 52, y: SY - 34, rot: -34, w: 150, z: 6 }) + tapeStrip({ x: SX + SW - 126, y: SY - 12, rot: 34, w: 150, z: 6 }) +
    tapeStrip({ x: SX - 52, y: SY + SH - 6, rot: 34, w: 150, z: 6 }) + tapeStrip({ x: SX + SW - 122, y: SY + SH - 26, rot: -34, w: 150, z: 6 });
  const mk = marker({ x: 470, y: 1306, len: 380, rot: -2.5, cap: "#e0b24a", z: 6 });
  const roll = tapeRoll({ x: 866, y: 1228, d: 112, rot: 30 });
  return printable({ n: 90, scene: tote + sheetEl + tapes + mk + roll, paper: "#e2ebe8" });
}

/* ------------------------------------------------------------------ #91 */

function pin91() {
  const i = idea(91);
  const r = seeded(31);
  // crumpled packing paper: pale grey-cream with soft creases
  const creases = Array.from({ length: 34 }, () => {
    const x = r() * 1000, y = 372 + r() * 1128, w = 160 + r() * 420, a = (r() - 0.5) * 70;
    return `<div style="${abs(x - w / 2, y, w, 3, `background:linear-gradient(90deg,transparent,rgba(90,90,80,${(0.1 + r() * 0.14).toFixed(2)}),transparent);transform:rotate(${a.toFixed(0)}deg)`)}"></div><div style="${abs(x - w / 2, y + 3, w, 2, `background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:rotate(${a.toFixed(0)}deg)`)}"></div>`;
  }).join("");
  const paper = `<div style="${abs(0, 372, 1000, 1128, "background:linear-gradient(135deg,#ece8de,#dcd7ca 50%,#e6e2d6)")}"></div>${creases}
    <div style="${abs(0, 372, 1000, 1128, "background:radial-gradient(ellipse at 25% 15%,rgba(255,255,255,.45),rgba(70,65,50,.22) 100%)")}"></div>`;
  // a laptop screen behind, running a plain text editor (line numbers and blank bars only)
  const bars = [[100, 470], [100, 420], [100, 330], [100, 450]]
    .map(([x, w], k) => `<div style="${abs(0, 76 + k * 46, 90, 30, "color:#8d93a0;font:500 24px/30px 'Plex Mono',monospace;text-align:right")}">${k + 1}</div><div style="${abs(x + 20, 84 + k * 46, w - 100, 14, `background:${k < 2 ? "#e4a94a" : "#6b7385"};border-radius:7px;opacity:.9`)}"></div>`).join("");
  const laptop = `<div style="${abs(310, 340, 700, 440, "transform:rotate(3deg);z-index:2")}">
      <div style="${abs(0, 0, 700, 440, "background:linear-gradient(#34373d,#202226);border-radius:22px;box-shadow:0 3px 4px rgba(0,0,0,.35),0 26px 40px rgba(40,35,25,.5)")}"></div>
      <div style="${abs(22, 22, 656, 396, "background:#1b1e26;border-radius:8px;overflow:hidden")}">
        <div style="${abs(0, 0, 656, 46, "background:#2b303c")}"></div>${[0, 1, 2].map((k) => `<div style="${abs(18 + k * 26, 16, 14, 14, `border-radius:50%;background:${["#e0645a", "#e3b349", "#5fbf6b"][k]}`)}"></div>`).join("")}
        <div style="${abs(0, 46, 82, 350, "background:#232733")}"></div>
        <div style="${abs(0, 52, 656, 300)}">${bars}</div></div></div>`;
  // the paper strip
  const lines = i.items.map((s, k) => `<div data-check="csv row" style="${abs(30, 60 + k * 70, 720, 56, `font:500 28px/56px 'Plex Mono',monospace;color:#20242a;white-space:nowrap;overflow:hidden;${k < 2 ? "background:linear-gradient(transparent 8%,rgba(231,170,60,.28) 8% 92%,transparent 92%)" : ""}`)}">${esc(s)}</div>`).join("");
  const rules = [0, 1, 2, 3].map((k) => `<div style="${abs(26, 116 + k * 70 + 6, 750, 2, "background:#e3e0d4")}"></div>`).join("");
  const brace = `<svg style="${abs(752, 60, 40, 126)}" viewBox="0 0 40 126" aria-hidden="true"><path d="M4 4 Q22 4 22 24 V50 Q22 63 36 63 Q22 63 22 76 V102 Q22 122 4 122" fill="none" stroke="#c97f12" stroke-width="7" stroke-linecap="round"/></svg>`;
  const flag = `<div class="hand" data-check="flag" style="${abs(806, 64, 124, 112, "background:#e8a63a;border-radius:8px;display:flex;align-items:center;padding-left:16px;font-size:44px;line-height:.95;font-weight:700;color:#2b1c00;box-shadow:0 4px 6px rgba(0,0,0,.25)")}">same row?</div>`;
  const strip = `<div data-check="page" style="${abs(30, 640, 940, 420, "transform:rotate(-1deg);background:#fffefb;box-shadow:0 2px 4px rgba(40,35,20,.3),0 24px 40px rgba(40,35,20,.4);z-index:4")}">
    <div style="${abs(0, 0, 940, 12, `background:${C.forest}`)}"></div>${rules}${lines}${brace}${flag}
    <div class="hand" data-check="note" style="${abs(34, 340, 360, 56, "font-size:40px;line-height:56px;color:#8a8e94;opacity:.9;white-space:nowrap")}">&uarr; not spending</div></div>`;
  const qm = `<div class="hand" style="${abs(836, 560, 130, 130, "z-index:6;font-size:150px;line-height:130px;font-weight:700;color:#c97f12;transform:rotate(12deg);text-shadow:0 3px 0 rgba(255,255,255,.5)")}">?</div>`;
  const tag = `<div style="${abs(40, 586, 150, 46, "z-index:6")}">${EXAMPLE()}</div>`;
  const wrap = bubbleWrap({ x: 40, y: 1120, w: 430, h: 220, rot: -2, z: 3 });
  const lab = shipLabel({ x: 512, y: 1126, w: 270, h: 140, rot: 2.5, band: C.forest, z: 4,
    inner: [0, 1, 2].map((k) => `<div style="${abs(0, 6 + k * 28, k === 2 ? 110 : 226, 8, "background:#cfcabb;border-radius:4px")}"></div>`).join("") });
  const mk = marker({ x: 520, y: 1296, len: 370, rot: -2, cap: "#c4372c", z: 6 });
  const roll = tapeRoll({ x: 830, y: 1150, d: 128, rot: -15 });
  return printable({ n: 91, scene: paper + laptop + strip + qm + tag + wrap + lab + mk + roll, paper: "#ece7dc" });
}

export const pins = [pin87(), pin88(), pin89(), pin90(), pin91()];
