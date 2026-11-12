/**
 * Batch 2, group G5: five guide pins in the stationery-shop world (pencil cases, rulers,
 * erasers, washi tape, stacked notebooks, index tabs, sticky notes).
 *
 *   #44  debt checklist: a coil-bound notebook page on a butter dot-grid mat, five ticked rows, a zip pencil case
 *   #46  five-step ladder: two rulers as the rails, index cards as the rungs, on a ruled sheet
 *   #53  how long $1,000 takes: four bars on a yellow legal pad on a sky-blue desk, stacked notebooks
 *   #55  a refund and one sale: a kraft-paper counter, a refund card, a hang tag, a gauge to $1,000
 *   #57  is $1,000 enough: a big ruled index card on blush felt, a stack of pastel cards, tab flags
 *
 * Words: every word is the idea bank's (headline, sub, items, proof) or a cut of it. Set here and
 * not verbatim: nothing beyond the kit's "Example" tag; column heads "Covers" / "Won't cover" are the
 * two items' own verbs, "$50 / Every week / 20 weeks" is row 2 of the guide's own table.
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { mug, pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const exampleCss = `.example{font-size:24px;letter-spacing:.1em;color:#1d1d20;background:#fffdf6;border:2px solid #1d1d20;padding:5px 12px;border-radius:6px}`;
let uid = 0;
/** Keeps every prop under the kit's header and foot bars, whatever z-index it has. */
const wrap = (scene) => `<div style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:1;isolation:isolate">${scene}</div>`;

/* ------------------------------------------------------------------ shared stationery props */

/** Fine paper-grain noise over a surface. */
const grain = (opacity = 0.35, freq = 0.7, seed = 4, y = 372, h = 982) =>
  `<svg style="${abs(0, y, 1000, h, `opacity:${opacity};mix-blend-mode:multiply;pointer-events:none`)}" aria-hidden="true"><filter id="gr${++uid}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .55 0"/></filter><rect width="1000" height="${h}" filter="url(#gr${uid})"/></svg>`;

/** A soft light falling from the top left. */
const light = (a = 0.22, b = 0.3, tint = "20,12,4", y = 372, h = 982) =>
  `<div style="${abs(0, y, 1000, h, `background:radial-gradient(ellipse at 22% 8%,rgba(255,255,255,${a}),rgba(${tint},${b}) 100%)`)}"></div>`;

/** Washi tape: a translucent strip with torn ends, centred on (x, y). */
function tape(x, y, w = 150, rot = -4, kind = "stripe", c1 = "#e9a9b4", c2 = "#ffffff") {
  const fills = {
    stripe: `repeating-linear-gradient(90deg,${c1} 0 14px,${c2}88 14px 24px)`,
    dots: `radial-gradient(circle,${c2} 3.5px,transparent 4.5px) 0 0/18px 18px,${c1}`,
    plain: c1,
  };
  return `<div style="${abs(x - w / 2, y - 23, w, 46, `transform:rotate(${rot}deg);background:${fills[kind]};opacity:.9;box-shadow:0 2px 4px rgba(40,20,5,.25);z-index:8;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A paper clip (steel or a warm amber). */
function clip({ x, y, rot = 0, color = "#b7bcc4", hi = "#eef0f3", s = 1 }) {
  return `<svg style="${abs(x, y, 70 * s, 140 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(30,15,5,.4));z-index:9`)}" viewBox="0 0 70 140" aria-hidden="true"><path d="M30 100 V30 a15 15 0 0 1 30 0 V108 a25 25 0 0 1 -50 0 V40" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 100 V30 a15 15 0 0 1 30 0 V108 a25 25 0 0 1 -50 0 V40" fill="none" stroke="${hi}" stroke-opacity=".7" stroke-width="2.2" stroke-linecap="round" transform="translate(-1.5 -1)"/></svg>`;
}

/** A rubber eraser: white block, coloured paper sleeve. */
function eraser({ x, y, w = 190, rot = 0, sleeve = C.forest, z = 6 }) {
  const h = w * 0.4;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 8px 6px rgba(30,15,5,.4))`)}">
    <div style="${abs(0, 0, w, h, "background:linear-gradient(#fbfaf6,#e3dfd5);border-radius:10px")}"></div>
    <div style="${abs(w * 0.2, 0, w * 0.6, h, `background:linear-gradient(${sleeve},${sleeve}dd 70%,#000);border-radius:3px`)}"></div>
    <div style="${abs(w * 0.2, 0, w * 0.6, h * 0.22, "background:linear-gradient(rgba(255,255,255,.28),rgba(255,255,255,0))")}"></div>
    <div style="${abs(w * 0.2 + 12, h * 0.38, w * 0.6 - 24, 4, "background:rgba(255,255,255,.55);border-radius:2px")}"></div>
    <div style="${abs(w * 0.2 + 12, h * 0.56, w * 0.36, 4, "background:rgba(255,255,255,.4);border-radius:2px")}"></div></div>`;
}

/** A zip-up canvas pencil case seen from above. */
function pencilCase({ x, y, w = 420, h = 190, rot = 0, color = C.forest, dark = C.forestDeep, z = 6 }) {
  const teeth = `repeating-linear-gradient(90deg,#d8dadf 0 5px,#8f949c 5px 8px)`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 18px 14px rgba(30,15,5,.45))`)}">
    <div style="${abs(0, 0, w, h, `background:linear-gradient(160deg,${color},${dark});border-radius:${h / 2.1}px`)}"></div>
    <div style="${abs(0, 0, w, h, `border-radius:${h / 2.1}px;background:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 3px,rgba(0,0,0,.05) 3px 6px)`)}"></div>
    <div style="${abs(0, 0, w, h, `border-radius:${h / 2.1}px;box-shadow:inset 0 0 0 5px rgba(255,255,255,.08),inset 0 10px 18px rgba(255,255,255,.14),inset 0 -14px 18px rgba(0,0,0,.25)`)}"></div>
    <div style="${abs(h * 0.28, h * 0.5 - 15, w - h * 0.56, 30, `background:${teeth};border-radius:15px;box-shadow:0 0 0 7px #1d2b25,0 0 0 9px rgba(255,255,255,.12)`)}"></div>
    <div style="${abs(h * 0.28 - 16, h * 0.5 - 22, 70, 44, "background:linear-gradient(#e7e9ee,#9aa0a8);border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.4)")}"><div style="${abs(40, 12, 14, 20, "border-radius:50%;background:#2a2d33")}"></div></div>
    <div style="${abs(w - 120, h - 62, 74, 40, "background:#f0d58a;border-radius:6px;transform:rotate(-3deg);box-shadow:0 2px 3px rgba(0,0,0,.3)")}"></div></div>`;
}

/** A sticky note (blank unless text is given). */
function sticky({ x, y, w = 150, h = 150, rot = 0, color = "#f7de8e", color2 = "#f0d072", text = "", font = "600 38px/1.15 'Hand',cursive", z = 7, check = "note" }) {
  return `<div ${text ? `data-check="${check}"` : ""} style="${abs(x, y, w, h, `background:linear-gradient(${color},${color2});transform:rotate(${rot}deg);box-shadow:0 2px 3px rgba(40,20,5,.3),0 14px 18px rgba(40,20,5,.35);z-index:${z};padding:${text ? "18px 24px" : 0};display:flex;align-items:center;font:${font};color:#2c2512;overflow:hidden`)}">${esc(text)}<div style="${abs(0, 0, w, 14, "background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,0))")}"></div></div>`;
}

/** A top-down stack of three notebooks, each a little off true, with a rubber band. */
function notebooks({ x, y, w = 360, rot = 0, covers = [C.forest, "#e9a9b4", "#8fb6d0"], z = 6 }) {
  const h = w * 0.62;
  const books = covers
    .map((c, k) => {
      const dx = [0, 14, -8][k] ?? 0, dy = [0, -14, -30][k] ?? 0, r = [0, 3, -2][k] ?? 0;
      return `<g transform="translate(${dx} ${dy}) rotate(${r} 180 110)"><rect x="8" y="14" width="344" height="196" rx="8" fill="#000" opacity=".25" transform="translate(6 10)"/><rect x="0" y="6" width="344" height="196" rx="8" fill="${c}"/><rect x="0" y="6" width="344" height="196" rx="8" fill="url(#nb${uid + 1})"/><rect x="336" y="12" width="14" height="184" fill="#f4efe0"/><path d="M338 20 H350 M338 28 H350 M338 36 H350 M338 44 H350" stroke="#cfc7b2" stroke-width="1.5"/><rect x="0" y="6" width="26" height="196" rx="8" fill="#000" opacity=".18"/>${k === covers.length - 1 ? `<rect x="250" y="6" width="14" height="196" fill="#1d1d20" opacity=".8"/><rect x="60" y="64" width="170" height="70" rx="5" fill="#fffdf6" opacity=".92"/>` : ""}</g>`;
    })
    .join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}" viewBox="0 0 380 230" aria-hidden="true"><defs><linearGradient id="nb${++uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient></defs>${books}</svg>`;
}

/** A hand-tick. */
const tick = (size = 44, color = C.forest) => `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true"><path d="M8 24 L18 35 L38 7" fill="none" stroke="${color}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** A ballpoint pen lying at an angle. */
function pen({ x, y, len = 400, rot = 0, body = "#1f1f23", band = C.forest, z = 7 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 9px 6px rgba(30,15,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="5" width="${len - 80}" height="24" rx="12" fill="${body}"/><rect x="50" y="7" width="${len - 80}" height="7" rx="3" fill="#fff" opacity=".2"/>
    <rect x="${len - 150}" y="5" width="46" height="24" fill="${band}"/><rect x="${len - 100}" y="12" width="90" height="6" rx="3" fill="#c9ccd2"/><rect x="${len - 100}" y="12" width="90" height="2" fill="#fff" opacity=".6"/>
    <path d="M50 5 L14 14 Q6 17 14 20 L50 29 Z" fill="#c9ccd2"/><path d="M14 14 L2 17 L14 20Z" fill="#33363b"/></svg>`;
}

/** A pocket-size ruler lying flat; ticks only (the printed numerals are left off). */
function rulerStrip({ x, y, w, h, vertical = false, kind = "oak", z = 4 }) {
  const wood = "linear-gradient(90deg,#d9b27a,#c99b66 60%,#b88a52)";
  const clear = "linear-gradient(90deg,rgba(255,255,255,.72),rgba(236,246,250,.55) 60%,rgba(255,255,255,.7))";
  const tickC = kind === "oak" ? "#5d3f1d" : C.forestDeep;
  const dir = vertical ? "to bottom" : "to right";
  const edge = vertical ? "left" : "top";
  const ticks = `repeating-linear-gradient(${dir},${tickC} 0 2px,transparent 2px 12px)`;
  const big = `repeating-linear-gradient(${dir},${tickC} 0 3px,transparent 3px 60px)`;
  const bgVert = (b) => (vertical ? b : b.replace("90deg", "180deg"));
  return `<div style="${abs(x, y, w, h, `z-index:${z};background:${bgVert(kind === "oak" ? wood : clear)};box-shadow:0 2px 3px rgba(40,20,5,.35),0 16px 26px rgba(40,20,5,.35);border-radius:4px;${kind === "oak" ? "" : "border:2px solid rgba(255,255,255,.7);"}`)}">
    <div style="${abs(vertical ? w - 24 : 0, vertical ? 0 : h - 24, vertical ? 24 : w, vertical ? h : 24, `background:${ticks};opacity:.75;${vertical ? "transform:scaleX(-1)" : ""}`)}"></div>
    <div style="${abs(vertical ? w - 40 : 0, vertical ? 0 : h - 40, vertical ? 40 : w, vertical ? h : 40, `background:${big};opacity:.85;${vertical ? "transform:scaleX(-1)" : ""}`)}"></div></div>`;
}

/** A coloured index-tab flag sticking out of the right edge of something. */
function flag({ x, y, w = 70, h = 54, color, rot = 0, z = 8 }) {
  return `<div style="${abs(x, y, w, h, `background:linear-gradient(${color},${color}e6);border-radius:3px 10px 10px 3px;transform:rotate(${rot}deg);z-index:${z};box-shadow:0 2px 3px rgba(40,20,5,.3),0 8px 12px rgba(40,20,5,.28)`)}"><div style="${abs(0, 0, w, h, "background:linear-gradient(120deg,rgba(255,255,255,.4),rgba(255,255,255,0) 50%);border-radius:3px 10px 10px 3px")}"></div></div>`;
}

/* ------------------------------------------------------------------ #44 */

function pin44() {
  const i = idea(44);
  const NX = 78, NY = 398, NW = 800, LH = 56;
  const itemFont = `500 29px/${LH}px 'Plex',sans-serif`;
  // the notebook page: every line of text sits on a ruled line (line-height = rule spacing)
  const rows = i.items
    .map(
      (t, k) => `<div style="display:flex;gap:26px;margin-bottom:${LH}px;align-items:flex-start">
        <div style="flex:none;width:44px;height:44px;margin-top:6px;border:4px solid ${C.forest};border-radius:8px;background:#fffdf6;display:grid;place-items:center">${tick(34)}</div>
        <div data-check="item${k + 1}" style="font:${itemFont};color:#1d1d20;width:590px">${esc(t)}</div></div>`,
    )
    .join("");
  const coils = Array.from({ length: 15 }, (_, k) => {
    const cy = 40 + k * 56;
    return `<div style="${abs(-26, cy, 76, 24, "z-index:3")}">
      <div style="${abs(34, 2, 24, 20, "border-radius:50%;background:#1d1d20;box-shadow:inset 0 3px 4px rgba(0,0,0,.6)")}"></div>
      <div style="${abs(-6, 4, 66, 14, "border-radius:8px;background:linear-gradient(#f2f3f6,#8e949c 55%,#d7dade);box-shadow:0 3px 4px rgba(0,0,0,.4)")}"></div></div>`;
  }).join("");
  const page = `<div data-check="page" style="${abs(NX, NY, NW, 870, `background:repeating-linear-gradient(#fffdf6 0 ${LH - 2}px,#bcd3e0 ${LH - 2}px ${LH}px);background-position:0 24px;transform:rotate(-1.1deg);border-radius:6px 10px 10px 6px;box-shadow:0 2px 3px rgba(60,40,10,.3),0 26px 42px rgba(60,40,10,.4);z-index:3`)}">
    <div style="${abs(104, 0, 3, 870, "background:#e8a3a8;opacity:.75")}"></div>
    ${coils}
    <div style="${abs(124, 24, 640, LH, `font:700 38px/${LH}px 'Hand',cursive;color:${C.forestDeep};white-space:nowrap`)}">${esc(i.proof[0])}</div>
    <div style="${abs(124, 24 + LH * 2, 650, 760)}">${rows}</div></div>`;
  // a debt statement under the pen: bars only, no figures
  const statement = `<div style="${abs(560, 1156, 330, 270, "background:#fffdf8;transform:rotate(6deg);box-shadow:0 2px 3px rgba(60,40,10,.3),0 18px 26px rgba(60,40,10,.35);z-index:4")}">
    <div style="${abs(0, 0, 330, 54, `background:${C.forestSoft}`)}"></div>
    <div style="${abs(22, 16, 120, 14, `background:${C.forest}`)}"></div><div style="${abs(22, 36, 70, 8, "background:#aab8b0")}"></div>
    ${[80, 110, 140, 170, 200].map((yy, k) => `<div style="${abs(22, yy, 286 - (k % 2) * 90, 9, "background:#d9d4c4")}"></div>`).join("")}
    <div style="${abs(190, 22, 120, 28, "border:3px solid #c9bf9c;border-radius:5px")}"></div></div>`;
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#f3e2a6")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(circle,#d6bb63 2.4px,transparent 3.4px) 0 0/38px 38px")}"></div>
    ${grain(0.3, 0.6, 7)}${light(0.3, 0.26, "90,60,10")}
    ${page}
    ${tape(190, 410, 170, -8, "stripe", "#e9a9b4")}
    ${clip({ x: 806, y: 372, rot: 8, color: C.amber, hi: "#ffe3a1", s: 1.1 })}
    ${statement}
    ${pen({ x: 520, y: 1262, len: 420, rot: -12 })}
    ${pencilCase({ x: 26, y: 1212, w: 470, h: 200, rot: -3 })}
    ${eraser({ x: 600, y: 1124, w: 150, rot: 14, sleeve: "#d9962b", z: 6 })}`;
  return printable({ n: 44, scene: wrap(scene), paper: "#f6eecf", sub: false, extraCss: exampleCss });
}

/* ------------------------------------------------------------------ #46 */

function pin46() {
  const i = idea(46);
  const X = 92, W = 818, TOP = 396, GAP = 18, H = 158;
  const flagCols = ["#e9a9b4", "#f0d58a", "#a9d1bd", "#9fc3dc", "#c8b6e2"];
  const cards = i.items
    .map((t, k) => {
      const y = TOP + k * (H + GAP);
      const wob = [-0.5, 0.4, -0.3, 0.5, -0.4][k];
      return `<div style="${abs(X, y, W, H, `transform:rotate(${wob}deg);z-index:5`)}">
        <div style="${abs(0, 0, W, H, "background:#fffdf6;border-radius:8px;box-shadow:0 2px 3px rgba(20,50,40,.25),0 14px 20px rgba(20,50,40,.25)")}"></div>
        <div style="${abs(0, 16, W, 2, "background:#e8a3a8;opacity:.8")}"></div>
        <div style="${abs(26, H / 2 - 36, 72, 72, `border-radius:50%;background:${C.forest};color:#fff;display:grid;place-items:center;font:600 46px 'Newsreader',serif;box-shadow:0 4px 6px rgba(0,0,0,.25)`)}">${k + 1}</div>
        <div data-check="step${k + 1}" style="${abs(122, 12, 560, H - 24, "display:flex;align-items:center;font:500 28px/1.24 'Plex',sans-serif;color:#1d1d20")}">${esc(t)}</div></div>
        ${flag({ x: X + W - 6, y: y + 28 + (k % 2) * 16, w: 74, h: 58, color: flagCols[k], rot: [2, -2, 3, -3, 1][k], z: 4 })}`;
    })
    .join("");
  // the payment moving down the ladder, between the numbered circles
  const arrows = [0, 1, 2, 3]
    .map((k) => {
      const y = TOP + (k + 1) * (H + GAP) - GAP / 2 - 21;
      return `<div style="${abs(X + 26 + 18, y, 36, 42, `z-index:7;display:grid;place-items:center;border-radius:12px;background:${C.butter};box-shadow:0 3px 5px rgba(20,50,40,.35)`)}">${icon("arrow-down", { size: 26, color: C.forestDeep, weight: "bold" })}</div>`;
    })
    .join("");
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#e4eee8")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(transparent 0 54px,#b3cbbf 54px 56px);background-position:0 20px")}"></div>
    ${grain(0.22, 0.8, 11)}${light(0.3, 0.16, "20,50,40")}
    ${rulerStrip({ x: 40, y: 360, w: 70, h: 1000, vertical: true, kind: "oak", z: 3 })}
    ${rulerStrip({ x: 890, y: 360, w: 70, h: 1000, vertical: true, kind: "clear", z: 3 })}
    ${cards}${arrows}
    ${tape(906, 590, 100, 84, "dots", "#d9962b", "#fff")}
    ${tape(80, 930, 100, 86, "stripe", "#2f6b57", "#fff")}
    ${sticky({ x: 770, y: 1118, w: 150, h: 150, rot: 6, z: 9 })}
    ${eraser({ x: 190, y: 1274, w: 190, rot: -6, sleeve: "#8fb6d0", z: 6 })}
    ${pencil({ x: 440, y: 1286, len: 330, rot: 4 })}`;
  return printable({ n: 46, scene: wrap(scene), paper: "#dfeae3" });
}

/* ------------------------------------------------------------------ #53 */

function pin53() {
  const i = idea(53);
  const PX = 80, PY = 404, PW = 840, PH = 800;
  // rows come from the guide's own table: amount, how often, time (bar length is time)
  const rows = [
    { amt: "$25", often: "Every week", time: "40 weeks", weeks: 40, note: "" },
    { amt: "$50", often: "Every week", time: "20 weeks", weeks: 20, note: "", hot: true },
    { amt: "$100", often: "Every two weeks", time: "20 weeks", weeks: 20, note: "(10 paychecks)" },
    { amt: "$200", often: "Every month", time: "5 months", weeks: 21.7, note: "" },
  ];
  // sanity: every figure shown is one of the idea's items or its table row
  for (const r of rows) for (const s of [r.amt, r.time]) if (!i.items.some((t) => t.startsWith(s))) throw new Error(`#53 word not in the idea: ${s}`);
  const PITCH = 164, Y0 = 124, BX = 338, K = 11.5;
  const bars = rows
    .map((r, k) => {
      const y = Y0 + k * PITCH;
      const bw = Math.round(r.weeks * K);
      const col = r.hot ? `linear-gradient(${C.amber},#b97a16)` : `linear-gradient(#6f9d89,${C.forest})`;
      return `
      <div data-check="amount" style="${abs(106, y - 4, 190, 72, "font:600 70px/72px 'Newsreader',serif;color:#1d1d20;white-space:nowrap")}">${esc(r.amt)}</div>
      <div data-check="pace" style="${abs(108, y + 66, 226, 40, "font:600 26px/40px 'Plex',sans-serif;color:#33403a;white-space:nowrap")}">${esc(r.often)}</div>
      <div style="${abs(BX, y + 6, bw, 84, `background:${col};border-radius:10px;box-shadow:inset 0 -7px 0 rgba(0,0,0,.18),0 4px 8px rgba(40,30,0,.3)`)}"></div>
      <div data-check="time" style="${abs(BX + 22, y + 6, bw - 22, 84, `display:flex;align-items:center;font:600 33px 'Plex',sans-serif;color:${r.hot ? "#2c1d02" : "#fff"};white-space:nowrap`)}">${esc(r.time)}</div>
      ${r.note ? `<div data-check="note" style="${abs(BX + bw + 16, y + 6, 240, 84, "display:flex;align-items:center;font:600 28px 'Plex',sans-serif;color:#2c2512;white-space:nowrap")}">${esc(r.note)}</div>` : ""}`;
    })
    .join("");
  const pad = `<div data-check="page" style="${abs(PX, PY, PW, PH, `background:repeating-linear-gradient(#fbe880 0 44px,#8fb5d9 44px 46px);background-position:0 18px;transform:rotate(-1.4deg);border-radius:4px;box-shadow:0 2px 3px rgba(20,40,60,.35),0 28px 46px rgba(20,40,60,.45);z-index:3`)}">
    <div style="${abs(0, 0, PW, 44, `background:linear-gradient(#2b3a35,${C.forestDeep});border-radius:4px 4px 0 0`)}"></div>
    <div style="${abs(0, 44, PW, 8, "background:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,0))")}"></div>
    <div style="${abs(86, 44, 3, PH - 44, "background:#d65a5a;opacity:.85")}"></div><div style="${abs(94, 44, 3, PH - 44, "background:#d65a5a;opacity:.85")}"></div>
    <div style="${abs(PW - 330, 62, 290, 40, "font:700 34px/40px 'Hand',cursive;color:#33403a;text-align:right")}">${esc(i.proof[1])}</div>
    ${bars}</div>`;
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#a8c6d8")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(100deg,rgba(255,255,255,.12) 0 90px,rgba(255,255,255,0) 90px 180px)")}"></div>
    ${grain(0.28, 0.5, 21)}${light(0.32, 0.3, "10,40,70")}
    ${pad}
    ${tape(150, 420, 150, -10, "plain", "#e9a9b4")}
    <div style="position:absolute;inset:0;z-index:9">${pencil({ x: 70, y: 1196, len: 500, rot: -7 })}</div>
    ${notebooks({ x: 610, y: 1160, w: 400, rot: -4 })}
    ${eraser({ x: 330, y: 1286, w: 170, rot: 8, sleeve: C.forest })}`;
  return printable({ n: 53, scene: wrap(scene), paper: "#e5edf1" });
}

/* ------------------------------------------------------------------ #55 */

function pin55() {
  const i = idea(55);
  const [refund, bike, day1, weekly] = i.items; // "$410 tax refund", "sell a bike for $180", "$590 on day one", "At $35 a week, the last $410 takes 12 weeks"
  const BX = 70, BW = 860, BY = 790, BH = 112, F = Math.round(BW * 0.59);
  const kraft = `
    <div style="${abs(0, 372, 1000, 982, "background:#c8a171")}"></div>
    <svg style="${abs(0, 372, 1000, 982, "opacity:.4;mix-blend-mode:multiply")}" aria-hidden="true"><filter id="kr"><feTurbulence type="fractalNoise" baseFrequency=".02 .3" numOctaves="4" seed="8"/><feColorMatrix values="0 0 0 0 .42  0 0 0 0 .3  0 0 0 0 .17  0 0 0 .9 0"/></filter><rect width="1000" height="982" filter="url(#kr)"/></svg>
    <svg style="${abs(0, 372, 1000, 982, "opacity:.5")}" viewBox="0 0 1000 982" aria-hidden="true"><path d="M-20 160 L420 230 L1020 140" stroke="#fff" stroke-opacity=".2" stroke-width="5" fill="none"/><path d="M-20 560 L300 520 L700 600 L1020 540" stroke="#4a3118" stroke-opacity=".16" stroke-width="4" fill="none"/><path d="M200 -10 L260 400 L190 990" stroke="#fff" stroke-opacity=".12" stroke-width="6" fill="none"/></svg>
    ${light(0.25, 0.3, "50,30,10")}`;
  const refundCard = `<div style="${abs(58, 408, 440, 236, "transform:rotate(-3deg);z-index:5")}">
    <div style="${abs(0, 0, 440, 236, "background:#fffdf6;border-radius:8px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 18px 26px rgba(40,20,5,.4)")}"></div>
    <div style="${abs(0, 0, 440, 22, `background:${C.forest};border-radius:8px 8px 0 0`)}"></div>
    ${[0, 1, 2].map((r) => `<div style="${abs(34, 188 + r * 0, 0, 0)}"></div>`).join("")}
    <div data-check="refund" style="${abs(34, 40, 380, 176, "display:flex;flex-direction:column;justify-content:center")}"><div style="font:600 88px/1 'Newsreader',serif;color:${C.forestDeep}">${esc(refund.split(" ")[0])}</div><div style="font:600 40px/1.2 'Plex',sans-serif;color:#1d1d20;margin-top:6px">${esc(refund.split(" ").slice(1).join(" "))}</div></div></div>`;
  // hang tag for the bike
  const tag = `<div style="${abs(560, 402, 390, 240, "transform:rotate(4deg);z-index:5")}">
    <svg style="${abs(-80, -50, 150, 160, "overflow:visible")}" viewBox="0 0 150 160" aria-hidden="true"><path d="M140 112 C 80 110 70 20 22 30 C -6 36 4 76 40 74 C 90 70 110 66 150 62" fill="none" stroke="#8a6a3a" stroke-width="5" stroke-linecap="round"/></svg>
    <div style="${abs(0, 0, 390, 240, "background:#f4e6bb;clip-path:polygon(0 50%,58px 0,100% 0,100% 100%,58px 100%);filter:drop-shadow(0 10px 8px rgba(40,20,5,.4))")}"></div>
    <div style="${abs(0, 0, 390, 240, "background:#f4e6bb;clip-path:polygon(0 50%,58px 0,100% 0,100% 100%,58px 100%);box-shadow:inset 0 0 0 3px #d9c58c")}"></div>
    <div style="${abs(40, 99, 42, 42, `border-radius:50%;background:#c8a171;box-shadow:inset 0 3px 5px rgba(0,0,0,.5),0 0 0 6px #fffdf6,0 0 0 9px ${C.forest}`)}"></div>
    <div data-check="tag" style="${abs(108, 24, 262, 192, "display:flex;flex-direction:column;justify-content:center;font:600 40px/1.15 'Plex',sans-serif;color:#1d1d20")}"><span>sell a bike</span><span style="white-space:nowrap">for <b style="font:600 72px/1.1 'Newsreader',serif;color:${C.forestDeep}">$180</b></span></div></div>`;
  const arrows = `<svg style="${abs(0, 640, 1000, 160, "z-index:6;overflow:visible")}" viewBox="0 0 1000 160" aria-hidden="true"><defs><marker id="ah" viewBox="0 0 12 12" refX="8" refY="6" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 L11 6 L1 11Z" fill="${C.forestDeep}"/></marker></defs>
    <path d="M250 22 C 250 90 330 90 380 138" fill="none" stroke="${C.forestDeep}" stroke-width="9" stroke-linecap="round" marker-end="url(#ah)"/>
    <path d="M740 20 C 740 90 660 90 612 138" fill="none" stroke="${C.forestDeep}" stroke-width="9" stroke-linecap="round" marker-end="url(#ah)"/></svg>`;
  // the gauge: a wooden-ruler strip filled to $590 of $1,000, the last $410 as 12 empty weekly ticks
  const cells = 12, rest = BW - F, cw = Math.floor((rest - 36) / cells);
  const ticks = Array.from({ length: cells }, (_, k) => `<div style="${abs(F + 18 + k * cw, BH / 2 - 30, cw - 6, 60, `border:3px solid ${C.forest};border-radius:5px;background:#fffdf6`)}"></div>`).join("");
  const gauge = `<div style="${abs(BX, BY, BW, BH, "z-index:5")}">
    <div style="${abs(-8, -8, BW + 16, BH + 16, "background:linear-gradient(#e6bf8a,#cf9f62);border-radius:18px;box-shadow:0 2px 3px rgba(40,20,5,.35),0 20px 30px rgba(40,20,5,.4)")}"></div>
    <div style="${abs(0, 0, BW, BH, "background:#f1e6cc;border-radius:12px;box-shadow:inset 0 4px 8px rgba(40,20,5,.3)")}"></div>
    <div style="${abs(0, 0, F, BH, `background:linear-gradient(${C.forest},${C.forestDeep});border-radius:12px 0 0 12px;box-shadow:inset 0 -8px 0 rgba(0,0,0,.2)`)}"></div>
    <div data-check="day1" style="${abs(26, 0, F - 40, BH, "display:flex;align-items:center;gap:16px;color:#fff;white-space:nowrap")}"><span style="font:600 66px 'Newsreader',serif">${esc(day1.split(" ")[0])}</span><span style="font:600 33px 'Plex',sans-serif">${esc(day1.split(" ").slice(1).join(" "))}</span></div>
    ${ticks}</div>
    <div style="${abs(BX + BW - 150, BY - 64, 150, 50, "display:flex;justify-content:flex-end;z-index:6")}"><span class="example">Example</span></div>
    <div style="${abs(BX + F + 2, BY + BH + 12, 6, 6)}"></div>
    <div style="${abs(BX + F + 8, BY + BH + 20, BW - F - 8, 22, `border:5px solid ${C.forestDeep};border-top:none;border-radius:0 0 12px 12px;z-index:6`)}"></div>
    <div data-check="last" style="${abs(BX + F + 8, BY + BH + 52, BW - F - 8, 44, `font:600 30px/44px 'Plex',sans-serif;color:#2b1a05;text-align:center;white-space:nowrap;z-index:6`)}">the last $410</div>`;
  const scene = `
    ${kraft}
    ${refundCard}${tag}${arrows}${gauge}
    ${clip({ x: 440, y: 392, rot: 10, color: C.amber, hi: "#ffe3a1", s: 1.1 })}
    ${tape(70, 424, 130, -38, "stripe", "#fffdf6", "#2f6b57")}
    ${tape(930, 408, 130, 32, "dots", "#e9a9b4", "#fff")}
    ${sticky({ x: 60, y: 1010, w: 560, h: 190, rot: -2, text: weekly, font: "600 44px/1.15 'Hand',cursive", z: 7 })}
    ${tape(150, 1010, 110, 6, "plain", "#f4efe4")}
    ${mug({ x: 700, y: 1034, size: 190 })}
    ${pencil({ x: 120, y: 1264, len: 420, rot: -5 })}
    ${eraser({ x: 600, y: 1272, w: 150, rot: 7, sleeve: "#8fb6d0" })}`;
  return printable({ n: 55, scene: wrap(scene), paper: "#f1e6d0", extraCss: exampleCss });
}

/* ------------------------------------------------------------------ #57 */

function pin57() {
  const i = idea(57);
  const CX = 66, CY = 404, CW = 868, CH = 790;
  const draw = (name, label, { muted = false, crack = false } = {}) => `
    <div style="display:flex;align-items:center;gap:16px">
      <div style="flex:none;position:relative;width:116px;height:116px;border-radius:50%;background:${muted ? "#ece8de" : C.forestSoft};border:4px solid ${muted ? "#8c8a80" : C.forest};display:grid;place-items:center">
        ${icon(name, { size: 64, color: muted ? "#55534b" : C.forestDeep, weight: "regular" })}
        ${crack ? `<svg style="${abs(0, 0, 116, 116, "overflow:visible")}" viewBox="0 0 128 128" aria-hidden="true"><path d="M70 30 L58 52 L72 62 L56 86 L64 98" fill="none" stroke="#d9962b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}
      </div>
      <div data-check="label" style="font:600 31px/38px 'Plex',sans-serif;color:#1d1d20;width:214px">${esc(label)}</div></div>`;
  const left = [draw("car", "Car repair"), draw("paw-print", "Vet visit"), draw("device-mobile", "Broken phone", { crack: true })];
  const right = [draw("briefcase", "Job loss", { muted: true }), draw("first-aid-kit", "Large medical bill", { muted: true })];
  const card = `<div data-check="page" style="${abs(CX, CY, CW, CH, "background:repeating-linear-gradient(#fffdf6 0 54px,#bcd3e0 54px 56px);background-position:0 30px;transform:rotate(-1deg);border-radius:10px;box-shadow:0 2px 3px rgba(80,30,40,.3),0 28px 44px rgba(80,30,40,.4);z-index:4")}">
    <div style="${abs(0, 120, CW, 3, "background:#e8858c;opacity:.9")}"></div>
    <div style="${abs(CW / 2 - 1, 140, 3, CH - 180, `background:${C.forest};opacity:.55`)}"></div>
    <div data-check="head" style="${abs(40, 44, 380, 64, `font:600 56px/64px 'Newsreader',serif;color:${C.forestDeep}`)}">Covers</div>
    <div data-check="head" style="${abs(CW / 2 + 40, 44, 380, 64, "font:600 56px/64px 'Newsreader',serif;color:#4a4840")}">Won't cover</div>
    <div style="${abs(40, 150, 380, 600, "display:flex;flex-direction:column;justify-content:space-around")}">${left.join("")}</div>
    <div style="${abs(CW / 2 + 22, 142, CW / 2 - 52, CH - 180, "border:5px dashed #4a4840;border-radius:22px;background:rgba(236,232,222,.45)")}"></div>
    <div style="${abs(CW / 2 + 36, 170, 360, 540, "display:flex;flex-direction:column;justify-content:space-around")}">${right.join("")}</div></div>`;
  const stack = [
    { c: "#9fc3dc", r: 1.4, y: 1182 },
    { c: "#f0d58a", r: -1.2, y: 1226 },
    { c: "#a9d1bd", r: 0.8, y: 1272 },
  ]
    .map((s) => `<div style="${abs(86, s.y, 830, 200, `background:repeating-linear-gradient(${s.c} 0 38px,${s.c}bb 38px 40px);border-radius:10px;transform:rotate(${s.r}deg);box-shadow:0 2px 3px rgba(80,30,40,.3),0 14px 20px rgba(80,30,40,.3);z-index:3`)}"></div>`)
    .join("");
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#e8bdc2")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(45deg,rgba(255,255,255,.07) 0 4px,rgba(120,40,60,.05) 4px 8px)")}"></div>
    ${grain(0.35, 0.9, 31)}${light(0.34, 0.26, "110,30,50")}
    ${stack}${card}
    ${flag({ x: CX + CW - 22, y: 470, w: 76, h: 56, color: "#9fc3dc", rot: 2 })}
    ${flag({ x: CX + CW - 18, y: 560, w: 76, h: 56, color: "#f0d58a", rot: -2 })}
    ${flag({ x: CX + CW - 24, y: 650, w: 76, h: 56, color: "#a9d1bd", rot: 3 })}
    ${tape(70, 420, 140, -36, "dots", "#2f6b57", "#fff")}
    ${clip({ x: 868, y: 368, rot: 10, color: "#aeb3bb", hi: "#f4f5f7", s: 1.1 })}
    ${pencil({ x: 540, y: 1258, len: 400, rot: -7 })}
    ${eraser({ x: 70, y: 1262, w: 190, rot: 5, sleeve: "#e9a9b4" })}
    ${pen({ x: 290, y: 1292, len: 360, rot: -3, body: "#2f6b57", band: "#f0d58a" })}`;
  return printable({ n: 57, scene: wrap(scene), paper: "#f6e4e4" });
}

export const pins = [pin44(), pin46(), pin53(), pin55(), pin57()];
