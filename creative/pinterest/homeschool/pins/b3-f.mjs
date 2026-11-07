/**
 * Batch 3, module f: the portfolio and school-day guide pins #43, #49, #51, #48.
 * Four different worlds: a charcoal filing drawer of staggered pastel folders,
 * an open kraft folder on a teal table, a quote card pinned to a mustard wall
 * above a shelf with a pencil jar, and a two-halved chalkboard.
 * Every word is the idea bank's own (headline, sub, items).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, drawing, pencil } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(30,15,5,.25)) drop-shadow(0 10px 12px rgba(30,15,5,.3))";
const INK = "#2a2220";

const exampleCss = `.example{font:600 22px "Plex";letter-spacing:.1em;text-transform:uppercase;color:#4b4339;background:#fffdf6;padding:7px 14px;border:none;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,.25)}`;
const exampleTag = (x, y, rot = -3) => `<span class="example" style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:6">Example</span>`;

/** Pencil scribble standing in for handwriting: wavy lines of varied length (no words). */
function scribSvg(seed, w, rows, gap, { y0 = 20, x0 = 14, color = "#4d4954", sw = 2.6, min = 0.5, max = 0.95, op = 0.8 } = {}) {
  const r = seeded(seed);
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = y0 + k * gap;
    const len = (min + r() * (max - min)) * (w - x0 * 2);
    let x = x0;
    d += `M${x} ${y}`;
    while (x < x0 + len) {
      x += 6 + r() * 7;
      d += ` L${x.toFixed(1)} ${(y + (r() - 0.5) * 8).toFixed(1)}`;
      if (r() < 0.08) { x += 11; d += ` M${x.toFixed(1)} ${y}`; }
    }
  }
  return `<svg style="${abs(0, 0, w, y0 + rows * gap)}" viewBox="0 0 ${w} ${y0 + rows * gap}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/></svg>`;
}

/** A strip of washi tape centred on (x, y). */
function tape(x, y, w = 140, rot = -4, color = "rgba(224,169,90,.8)") {
  return `<div style="${abs(x - w / 2, y - 20, w, 40, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.3) 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:7;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A round fridge magnet centred on (x, y). */
function magnet(x, y, color = "#c4573e", r = 21, z = 8) {
  return `<div style="${abs(x - r, y - r, r * 2, r * 2, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff8 0,transparent 38%),${color};box-shadow:0 5px 6px rgba(20,30,40,.4),inset 0 -3px 5px rgba(0,0,0,.25);z-index:${z}`)}"></div>`;
}

/* ------------------------------------------------------------------ #43 */

function pin43() {
  const i = idea(43);
  const rows = i.items.map((t) => {
    const m = t.match(/^(.*?): (.*) \((.*)\)$/);
    if (!m) throw new Error(`#43 item does not parse: ${t}`);
    return { subject: m[1], line: m[2], tag: m[3] };
  });
  const cols = ["#ecd9ae", "#e8a587", "#b9cfb0", "#a8c0d9", "#d2b3dc", "#f0c76e"];
  const tabX = [40, 300, 560];
  const pitch = 160, top0 = 396, tabH = 52, W = 920;
  const drawer = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(180deg,#26221f 0,#3a3532 60%,#2c2825 100%)")}"></div>
    <div style="${abs(0, SCENE_TOP, 22, 1500, "background:linear-gradient(90deg,#6c6a68,#9c9a97 60%,#5a5856)")}"></div>
    <div style="${abs(978, SCENE_TOP, 22, 1500, "background:linear-gradient(90deg,#5a5856,#9c9a97 40%,#6c6a68)")}"></div>`;
  const folders = `<div style="${abs(0, 0, 1000, 1500, "z-index:1")}">${rows.map((r, k) => {
    const y = top0 + k * pitch;
    const col = cols[k];
    return `<div style="${abs(40, y, W, 760, `z-index:${k + 1};filter:drop-shadow(0 -5px 9px rgba(0,0,0,.5))`)}">
      <div style="${abs(tabX[k % 3] - 40, 0, 380, tabH + 6, `background:${col};border-radius:16px 16px 0 0;display:flex;align-items:center;padding:0 24px;font:600 27px/1 Plex;color:${INK}`)}">${esc(r.subject)}</div>
      <div style="${abs(0, tabH, W, 720, `background:linear-gradient(180deg,${col} 0,${col} 70%,rgba(0,0,0,.08) 100%);border-radius:${k % 3 === 0 ? "0 14px 6px 6px" : "14px 14px 6px 6px"}`)}">
        <div style="${abs(0, 7, W, 2, "background:rgba(0,0,0,.14)")}"></div>
        <div data-check="folder-${k}" style="${abs(26, 14, 560, 96, `display:flex;align-items:center;font:500 27px/1.2 Plex;color:${INK}`)}">${esc(r.line)}</div>
        <div data-check="tag-${k}" style="position:absolute;right:24px;top:30px;height:52px;display:flex;align-items:center;padding:0 22px;border-radius:999px;background:${C.plumDeep};color:#fff;font:600 24px/1 Plex;white-space:nowrap">${esc(r.tag)}</div>
      </div></div>`;
  }).join("")}</div>`;
  return printable({ n: 43, paper: "#f1e9dc", scene: `${drawer}${folders}` });
}

/* ------------------------------------------------------------------ #49 */

function volcanoPrint(x, y, rot) {
  const w = 252, h = 292;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fffdf6;filter:${SHADOW};z-index:3`)}">
    <svg style="${abs(12, 12, 228, 200)}" viewBox="0 0 228 200" aria-hidden="true">
      <rect width="228" height="200" fill="#cfe3ec"/><circle cx="188" cy="38" r="20" fill="#f6dc8a"/>
      <rect y="136" width="228" height="64" fill="#c99b66"/><rect y="136" width="228" height="5" fill="#a87d4f"/>
      <path d="M44 146 L96 52 L136 52 L190 146 Z" fill="#8a5a3a"/><path d="M96 52 L84 146 M120 52 L118 146 M136 52 L156 146" stroke="#6e4528" stroke-width="3" fill="none" opacity=".6"/>
      <path d="M92 52 Q116 38 140 52 Q116 60 92 52 Z" fill="#e0562d"/><path d="M100 54 Q98 82 104 96 Q110 84 108 56 M126 56 Q130 90 124 108 Q136 92 134 56" fill="#e0562d" stroke="#e0562d" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="62" cy="152" rx="26" ry="6" fill="#5b3a22" opacity=".25"/>
    </svg>
    <div style="${abs(12, 220, w - 24, 62, "background:#f4efe3;border-top:2px solid #e3dccd")}">${scribSvg(77, w - 24, 2, 26, { y0: 20, x0: 10, sw: 2.8, color: "#3d3a44", min: .6, max: .95 })}</div>
    ${tape(w / 2, 4, 110, 3, "rgba(95,138,143,.8)")}</div>`;
}

function pin49() {
  const i = idea(49);
  const table = desk({ top: 0, height: 1500, base: "#4f8a86", dark: "#427874", planks: 6, seed: 12 });
  const folderCss = "background:linear-gradient(135deg,#d3b184,#bf9a6a);box-shadow:0 3px 4px rgba(20,40,40,.3),0 26px 44px rgba(10,30,30,.45)";
  const folder = `<div style="${abs(34, 396, 466, 930, `${folderCss};border-radius:10px 0 0 10px;z-index:1`)}"></div>
    <div style="${abs(500, 396, 466, 930, `${folderCss};border-radius:0 10px 10px 0;z-index:1`)}"></div>
    <div style="${abs(486, 396, 28, 930, "background:linear-gradient(90deg,rgba(80,50,20,0),rgba(80,50,20,.35) 50%,rgba(80,50,20,0));z-index:2")}"></div>
    <div style="${abs(50, 410, 434, 902, "border:2px dashed rgba(110,75,35,.25);border-radius:6px;z-index:2")}"></div>
    <div style="${abs(516, 410, 434, 902, "border:2px dashed rgba(110,75,35,.25);border-radius:6px;z-index:2")}"></div>`;

  const sheetBase = (x, y, w, h, rot, inner, z = 3, bg = "#fffdf6") => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${bg};filter:${SHADOW};z-index:${z};overflow:hidden`)}">${inner}</div>`;
  const grid = "background-image:linear-gradient(#cfe0ea 1px,transparent 1px),linear-gradient(90deg,#cfe0ea 1px,transparent 1px);background-size:24px 24px";
  const ruled = "background-image:repeating-linear-gradient(180deg,transparent 0 31px,#b9cde0 31px 33px)";

  // Two math pages, a problem worked two ways.
  const mathA = sheetBase(70, 458, 230, 292, -5, `<div style="${abs(0, 0, 230, 292, grid)}"></div>${scribSvg(5, 230, 5, 34, { y0: 40, x0: 18, max: .8 })}<div style="${abs(16, 214, 120, 56, "border:3px solid #4d4954;border-radius:4px;opacity:.65")}"></div>`, 3);
  const mathB = sheetBase(196, 478, 240, 292, 4, `<div style="${abs(0, 0, 240, 292, grid)}"></div>${scribSvg(9, 240, 4, 38, { y0: 44, x0: 18, max: .7 })}${scribSvg(15, 240, 2, 38, { y0: 214, x0: 40, min: .5, max: .9 })}<svg style="${abs(0, 0, 240, 292)}" viewBox="0 0 240 292" aria-hidden="true"><path d="M30 180 C 70 150 120 200 190 170" fill="none" stroke="${C.plum}" stroke-width="3" opacity=".6"/></svg>`, 4);
  const lab1 = (x, y, text) => `<div data-check="label" style="${abs(x, y, 410, 112, `background:#fffdf6;border-radius:4px;filter:${SHADOW};z-index:6;display:flex;align-items:center;padding:0 20px;font:500 24px/1.25 Plex;color:${INK};border-left:7px solid ${C.plum}`)}">${esc(text)}</div>`;

  // Two-paragraph book report.
  const report = sheetBase(570, 454, 300, 318, 2.2, `<div style="${abs(0, 0, 300, 318, ruled + ";background-position:0 20px")}"></div><div style="${abs(34, 0, 2, 318, "background:#e3a3a3;opacity:.7")}"></div>${scribSvg(21, 300, 1, 30, { y0: 42, x0: 50, sw: 4, min: .45, max: .5, color: "#3d3a44" })}${scribSvg(23, 300, 4, 33, { y0: 84, x0: 50, max: .98 })}${scribSvg(29, 300, 4, 33, { y0: 232, x0: 50, max: .98 })}`.replace("0 20px", "0 20px"), 3);

  // Photo of the volcano model.
  const photo = volcanoPrint(96, 940, -3) + pencil({ x: 250, y: 1060, len: 300, rot: 74 }).replace("position:absolute", "z-index:3;position:absolute");

  // Running list of books: eleven rows.
  const listRows = Array.from({ length: 11 }, (_, k) => `<div style="${abs(0, 34 + k * 25, 260, 1, "background:#c8d6e3")}"></div><div style="${abs(14, 34 + k * 25 - 17, 14, 14, "border:2px solid #7d7a85;border-radius:3px")}"></div>`).join("");
  const list = sheetBase(560, 922, 250, 312, 2.5, `<div style="${abs(0, 0, 250, 40, `background:${C.plumSoft}`)}"></div>${listRows}${scribSvg(41, 250, 11, 25, { y0: 30, x0: 38, max: .88, min: .4, sw: 2.4 })}`, 3);

  const crayon = drawing({ x: 800, y: 1012, w: 166, rot: -6 }).replace("position:absolute", "z-index:4;position:absolute");

  const [l1, l2, l3, l4] = i.items;
  const labels = lab1(66, 784, l1) + lab1(536, 784, l2) + lab1(66, 1226, l3) + lab1(536, 1226, l4);
  return printable({ n: 49, paper: "#f1e9dc", extraCss: exampleCss, scene: `${table}${folder}${mathA}${mathB}${report}${photo}${list}${crayon}${labels}${exampleTag(70, 408, -3)}` });
}

/* ------------------------------------------------------------------ #51 */

function pin51() {
  const i = idea(51);
  const r = seeded(4);
  const boards = Array.from({ length: 17 }, (_, k) => `<div style="${abs(k * 62, SCENE_TOP, 2, 900, "background:rgba(110,70,10,.18)")}"></div><div style="${abs(k * 62 + 2, SCENE_TOP, 2, 900, "background:rgba(255,235,170,.22)")}"></div>`).join("");
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 25% 20%,#e8b955,#d09a36 70%,#b9822a)")}"></div>${boards}`;
  const shelf = `<div style="${abs(0, 1232, 1000, 34, "background:linear-gradient(#fffdf8,#e9e2d4);box-shadow:0 10px 18px rgba(60,35,5,.45);z-index:2")}"></div><div style="${abs(0, 1266, 1000, 90, "background:linear-gradient(rgba(60,35,5,.35),rgba(60,35,5,.05));z-index:1")}"></div>`;

  // A smudged, ordinary worksheet corner behind the card.
  const pencilScrawl = scribSvg(61, 520, 6, 40, { y0: 150, x0: 50, sw: 3.4, color: "#55525c", max: .95, min: .35, op: .85 });
  const worksheet = `<div style="${abs(404, 880, 520, 370, `transform:rotate(4deg);background:#fbf7ec;filter:${SHADOW};z-index:2;overflow:hidden`)}">
      <div style="${abs(0, 0, 520, 370, "background-image:repeating-linear-gradient(180deg,transparent 0 39px,#b9cde0 39px 41px);background-position:0 8px")}"></div>
      <div style="${abs(46, 0, 2, 370, "background:#e3a3a3;opacity:.7")}"></div>
      ${pencilScrawl}
      <div style="${abs(220, 190, 200, 110, "background:radial-gradient(ellipse,rgba(90,86,96,.35),transparent 70%);filter:blur(6px)")}"></div>
      <div style="${abs(110, 214, 210, 60, "background:radial-gradient(ellipse,rgba(251,247,236,.95),rgba(251,247,236,.7) 55%,transparent 75%);filter:blur(3px)")}"></div>
      <svg style="${abs(0, 0, 520, 370)}" viewBox="0 0 520 370" aria-hidden="true"><path d="M60 290 L300 280" stroke="#55525c" stroke-width="3" opacity=".75"/><path d="M300 300 q10 -14 22 -2 t24 -2 t26 0" fill="none" stroke="#55525c" stroke-width="2.6" opacity=".6"/></svg>
    </div>`;

  const quote = `<div style="${abs(86, 420, 828, 528, "transform:rotate(-1.2deg);z-index:4")}">
      <div data-check="quote" style="${abs(0, 0, 828, 528, `background:#fdf9ee;border-radius:3px;filter:${SHADOW};padding:34px 58px 30px;overflow:hidden`)}">
        <div class="serif" style="font-size:132px;line-height:.8;height:62px;color:${C.plum};font-weight:600">&ldquo;</div>
        <div class="serif" style="font-size:45px;line-height:1.2;color:${INK};letter-spacing:-.005em;margin-top:8px">${esc(i.sub)}</div>
        <div style="width:110px;height:5px;background:${C.plum};margin:26px 0 20px;border-radius:3px"></div>
        <div style="font:500 30px/1.3 Plex;color:#4b4339">${esc(i.items[0])}</div>
      </div>
      ${tape(180, 4, 150, -6, "rgba(138,161,130,.85)")}${tape(650, 2, 150, 5, "rgba(122,75,138,.6)")}
    </div>`;

  // Pencil jar and a small plant on the shelf.
  const pens = ["#e7b23f", "#c4573e", "#5f8a8f", "#7a4b8a", "#e7b23f", "#8aa182"].map((c, k) => {
    const a = -16 + k * 6.5, h = 150 + (k % 3) * 22;
    return `<div style="${abs(36 + k * 12, 96 - h, 14, h, `background:linear-gradient(90deg,${c},${c} 50%,rgba(0,0,0,.2));transform:rotate(${a}deg);transform-origin:50% 100%;border-radius:3px 3px 0 0;clip-path:polygon(0 12%,50% 0,100% 12%,100% 100%,0 100%)`)}"></div>`;
  }).join("");
  const jar = `<div style="${abs(70, 1010, 140, 222, "z-index:3")}">${pens}<div style="${abs(0, 62, 140, 160, "background:linear-gradient(90deg,#c9694b,#e08565 40%,#a9533a);border-radius:10px 10px 14px 14px;box-shadow:0 12px 14px rgba(60,35,5,.45)")}"></div><div style="${abs(0, 62, 140, 14, "background:rgba(0,0,0,.18);border-radius:10px 10px 0 0")}"></div><div style="${abs(0, 120, 140, 26, "background:#fdf9ee;opacity:.9")}"></div></div>`;
  const plant = `<div style="${abs(780, 1060, 170, 172, "z-index:3")}"><svg style="${abs(0, 0, 170, 172)}" viewBox="0 0 170 172" aria-hidden="true"><g fill="#5c7f4f"><path d="M85 100 C 60 60 30 60 20 20 C 56 24 82 50 85 100 Z"/><path d="M85 100 C 110 56 140 56 150 14 C 112 20 88 48 85 100 Z" fill="#6f9660"/><path d="M85 104 C 80 60 90 30 84 2 C 108 30 100 70 85 104 Z" fill="#4c6e42"/></g><path d="M44 104 H126 L116 172 H54 Z" fill="#e8e0d0"/><path d="M44 104 H126 L124 118 H46 Z" fill="#cfc6b3"/></svg></div>`;

  return printable({ n: 51, paper: "#f6ecd4", sub: false, scene: `${wall}${worksheet}${quote}${shelf}${jar}${plant}` });
}

/* ------------------------------------------------------------------ #48 */

function pin48() {
  const i = idea(48);
  const parse = (t) => {
    const m = t.match(/^(.*?): (.*?)(?: \((.*)\))?$/);
    return { label: m[1], text: m[2], note: m[3] ?? null };
  };
  const [a, b, c, d, e] = i.items.map(parse);
  const r = seeded(21);

  // A school chalkboard in an oak frame, a chalk line down the middle, a chalk ledge below.
  const dust = Array.from({ length: 70 }, () => `<ellipse cx="${(60 + r() * 880).toFixed(0)}" cy="${(30 + r() * 820).toFixed(0)}" rx="${(40 + r() * 110).toFixed(0)}" ry="${(6 + r() * 16).toFixed(0)}" fill="#e9efe6" opacity="${(0.02 + r() * 0.05).toFixed(3)}" transform="rotate(${(r() * 40 - 20).toFixed(0)} ${(60 + r() * 880).toFixed(0)} ${(30 + r() * 820).toFixed(0)})"/>`).join("");
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(180deg,#e7dcc8,#d8caae)")}"></div>`;
  const board = `<div style="${abs(8, 386, 984, 892, "background:linear-gradient(135deg,#d6a86c,#a97a42);border-radius:14px;box-shadow:0 4px 6px rgba(40,25,10,.3),0 26px 44px rgba(40,25,10,.45);z-index:1")}"></div>
    <div style="${abs(30, 408, 940, 848, "background:radial-gradient(ellipse at 30% 20%,#3b5a4c,#2b4439 75%);border-radius:6px;box-shadow:inset 0 6px 14px rgba(0,0,0,.55),inset 0 0 0 3px rgba(0,0,0,.2);z-index:1;overflow:hidden")}"><svg style="${abs(0, 0, 940, 848)}" viewBox="0 0 940 848" aria-hidden="true">${dust}</svg></div>
    <svg style="${abs(0, 0, 1000, 1500, "z-index:2;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">
      <path d="M500 440 L500 1236" stroke="#eef2ea" stroke-width="5" stroke-dasharray="26 14" stroke-linecap="round" opacity=".55"/>
      <rect x="50" y="424" width="436" height="818" rx="16" fill="none" stroke="#cfa6e0" stroke-width="6" stroke-linejoin="round" opacity=".9"/>
      <rect x="514" y="424" width="436" height="818" rx="16" fill="none" stroke="#e9efe6" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round" opacity=".6"/></svg>
    <div style="${abs(0, 1262, 1000, 46, "background:linear-gradient(#c9985a,#8f6733);box-shadow:0 10px 16px rgba(40,25,10,.45);z-index:2")}"></div>
    <div style="${abs(640, 1236, 120, 26, "background:linear-gradient(#f4f1e8,#cfc9b8);border-radius:5px;transform:rotate(-4deg);box-shadow:0 4px 5px rgba(0,0,0,.4);z-index:3")}"></div>
    <div style="${abs(790, 1244, 150, 40, "background:linear-gradient(#6b7f8c 0 45%,#c85a46 45%);border-radius:5px 5px 4px 4px;transform:rotate(2deg);box-shadow:0 4px 6px rgba(0,0,0,.4);z-index:3")}"></div>`;

  const card = (x, y, w, h, rot, inner, { plum = false, z = 4, tapeCol = "rgba(224,169,90,.85)" } = {}) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">
      <div data-check="card" style="${abs(0, 0, w, h, `background:${plum ? "#fffdf6" : "#eef0f2"};border-radius:6px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.35)) drop-shadow(0 9px 10px rgba(0,0,0,.35));${plum ? `border-left:10px solid ${C.plum};border-top:3px solid ${C.plum};border-right:3px solid ${C.plum};border-bottom:3px solid ${C.plum}` : "border:2px solid #aeb8c1"};padding:34px 22px 18px ${plum ? 22 : 24}px;overflow:hidden`)}">${inner}</div>
      ${tape(w / 2, 6, 120, rot * 2 - 2, tapeCol)}</div>`;
  const body = (t) => `<div style="font:600 32px/1.2 Plex;color:${INK}">${esc(t)}</div>`;
  const note = (t, plum) => `<div style="margin-top:12px;display:inline-block;padding:7px 15px;border-radius:999px;font:600 24px/1.2 Plex;${plum ? `background:${C.plumSoft};color:${C.plumDeep}` : "background:#dde3e8;color:#3b4752"}">${esc(t)}</div>`;
  const head = (x, y, text, col) => `<div data-check="head" style="${abs(x, y, 400, 96, `z-index:4;display:flex;align-items:center;justify-content:center;font:700 62px/1 Hand;white-space:nowrap;color:#f4f1e8;text-shadow:0 0 2px rgba(255,255,255,.35);border-bottom:6px solid ${col};letter-spacing:.01em`)}">${esc(text)}</div>`;

  const left = `${head(68, 436, a.label, "#cfa6e0")}
    ${card(68, 552, 400, 172, -1.2, body(a.text), { plum: true, tapeCol: "rgba(122,75,138,.7)" })}
    ${card(68, 742, 400, 232, 1, body(b.text) + note(b.note, true), { plum: true, tapeCol: "rgba(95,138,143,.8)" })}
    ${card(68, 992, 400, 226, -.8, body(c.text) + note(c.note, true), { plum: true })}`;

  const crayon = drawing({ x: 700, y: 1086, w: 180, rot: 5 }).replace("position:absolute", "z-index:4;position:absolute");
  const right = `${head(532, 436, d.label, "#aab6bf")}
    ${card(532, 560, 400, 270, .9, body(d.text) + note(d.note, false), { tapeCol: "rgba(138,161,130,.85)" })}
    ${card(532, 860, 400, 200, -1, `<div style="display:inline-block;margin-bottom:10px;padding:4px 20px;border:3px solid #46525e;border-radius:8px;font:700 38px/1.1 Newsreader;color:#2f3943">${esc(e.label)}</div>${body(e.text)}`, { tapeCol: "rgba(196,87,62,.7)" })}
    ${crayon}${tape(795, 1088, 100, -3, "rgba(224,169,90,.85)")}`;

  return printable({ n: 48, paper: "#f1e6d2", scene: `${wall}${board}${left}${right}` });
}

export const pins = [pin43(), pin49(), pin51(), pin48()];
