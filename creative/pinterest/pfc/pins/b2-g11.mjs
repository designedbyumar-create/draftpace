/**
 * Batch 2, group G11: night study (a dark desk, a green lamp, headphones, a laptop's edge, a notepad).
 *
 *   #92  split card, a spreadsheet cell vs a plain text editor, on a navy desk; notepad, headphones, laptop lip
 *   #93  two table cards and paper arrows to two sticky notes, on a cool slate desk; lamp, headphones, pencil
 *   #94  six numbered steps on a ruled notebook page with a laptop sketch, on a teal-black desk; mug, sticky note
 *   #95  a long paper strip with a "today" line, past rows solid and future outlines dashed, on a plum desk
 *   #96  a balance strip that shrinks with each autopay down to a $336 stub, on a claret desk
 *
 * Words: every word is the idea's own (headline, sub, items, proof). Labels that are not verbatim bank
 * text are listed in the report.
 */
import { esc } from "../../v3/kit.mjs";
import { idea } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { pencil, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
let uid = 0;
const SCENE_TOP = 372, SCENE_BOTTOM = 1354, SCENE_H = SCENE_BOTTOM - SCENE_TOP;
const POP = "#f2b640";

/** A polygon clip with a zigzag edge on the sides asked for. */
function zig(w, h, step = 14, d = 7, sides = "tblr") {
  const pts = [];
  const side = (x0, y0, x1, y1, nx, ny, zz) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
      if (zz) pts.push([x0 + ((x1 - x0) * (k + 0.5)) / n + nx * d, y0 + ((y1 - y0) * (k + 0.5)) / n + ny * d]);
    }
  };
  side(0, 0, w, 0, 0, 1, sides.includes("t"));
  side(w, 0, w, h, -1, 0, sides.includes("r"));
  side(w, h, 0, h, 0, -1, sides.includes("b"));
  side(0, h, 0, 0, 1, 0, sides.includes("l"));
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}

const grain = (freq = ".8", op = 0.2, seed = 2, mode = "multiply", matrix = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -.25") => {
  const id = `nz${++uid}`;
  return `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:${mode}" aria-hidden="true"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="${matrix}"/></filter><rect width="100%" height="100%" filter="url(#${id})" opacity="${op}"/></svg>`;
};

const exTag = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 10px;${extra}">Example</span>`;

/* ------------------------------------------------------------------ shared night-study props */

/** A dark desk filling the scene, with a warm lamp pool and a vignette. `look` picks the surface. */
function nightDesk({ base, hi, look = "fine", pool = [880, 470, 760], poolColor = "255,208,130", poolOp = 0.32, seed = 3 }) {
  const tex = {
    fine: `repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 7px),repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 2px,transparent 2px 41px)`,
    slate: `repeating-linear-gradient(115deg,rgba(255,255,255,.03) 0 2px,transparent 2px 9px),repeating-linear-gradient(25deg,rgba(0,0,0,.14) 0 1px,transparent 1px 6px)`,
    leather: `radial-gradient(rgba(255,255,255,.05) 1px,transparent 1.6px) 0 0/9px 9px,radial-gradient(rgba(0,0,0,.2) 1px,transparent 1.6px) 4px 4px/9px 9px`,
    plank: `repeating-linear-gradient(0deg,rgba(0,0,0,.34) 0 3px,transparent 3px 196px),repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 5px)`,
    weave: `repeating-linear-gradient(0deg,rgba(255,255,255,.04) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 1px,transparent 1px 4px)`,
  }[look];
  return `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, `background:${tex},radial-gradient(ellipse at ${(pool[0] / 10).toFixed(0)}% ${(((pool[1] - SCENE_TOP) / SCENE_H) * 100).toFixed(0)}%,${hi},transparent 72%),${base};overflow:hidden`)}">
    ${grain(".9", 0.32, seed)}${grain(".02 .5", 0.18, seed + 4, "overlay", "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -.1")}
    <div style="position:absolute;inset:0;background:radial-gradient(circle at ${pool[0]}px ${pool[1] - SCENE_TOP}px,rgba(${poolColor},${poolOp}),rgba(${poolColor},0) ${pool[2]}px);mix-blend-mode:screen"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 42%,transparent 38%,rgba(0,0,0,.55))"></div></div>`;
}

/** A banker's lamp seen from above: a green glass shade on a brass arm. `armTo` is where the arm reaches its base. */
function lamp({ x, y, r = 80, armTo, z = 3 }) {
  const g = `lg${++uid}`, b = `lb${uid}`;
  const [ax, ay] = armTo;
  const ang = Math.atan2(ay - y, ax - x);
  const px = Math.cos(ang + Math.PI / 2), py = Math.sin(ang + Math.PI / 2);
  return `<svg style="${abs(0, 0, 1000, 1500, `z-index:${z};pointer-events:none;overflow:visible`)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><radialGradient id="${g}" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#46a97d"/><stop offset=".45" stop-color="#17704f"/><stop offset="1" stop-color="#082e21"/></radialGradient>
  <radialGradient id="${b}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e8cf86"/><stop offset="1" stop-color="#8a6a2a"/></radialGradient></defs>
  <g style="filter:drop-shadow(14px 22px 16px rgba(0,0,0,.6))">
    <circle cx="${ax}" cy="${ay}" r="${r * 0.52}" fill="url(#${b})"/><circle cx="${ax}" cy="${ay}" r="${r * 0.36}" fill="#000" fill-opacity=".14"/>
    <path d="M${x} ${y} L${ax} ${ay}" stroke="#9a7a34" stroke-width="13" stroke-linecap="round"/>
    <path d="M${x + px * 3} ${y + py * 3} L${ax + px * 3} ${ay + py * 3}" stroke="#f1dc9a" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${g})"/>
    <circle cx="${x}" cy="${y}" r="${r - 3}" fill="none" stroke="#0a3a2a" stroke-width="5"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.46}" fill="#0b3626"/><circle cx="${x - 2}" cy="${y - 2}" r="${r * 0.44}" fill="none" stroke="#52b88a" stroke-opacity=".5" stroke-width="3"/>
    <circle cx="${x}" cy="${y}" r="${r * 0.15}" fill="url(#${b})"/>
    <path d="M${x - r * 0.72} ${y - r * 0.18} A ${r * 0.76} ${r * 0.76} 0 0 1 ${x - r * 0.1} ${y - r * 0.74}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="7" stroke-linecap="round"/>
  </g></svg>`;
}

/** Over-ear headphones lying flat, seen from above. */
function headphones({ x, y, w = 300, rot = 0, cup = "#e7e2d6", band = "#c3bdae", pad = "#6f695d", z = 4 }) {
  const h = w * 0.94;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 12px rgba(0,0,0,.6));z-index:${z}`)}" viewBox="0 0 320 300" aria-hidden="true">
  <path d="M60 196 C 52 28, 268 28, 260 196" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="34" stroke-linecap="round" transform="translate(4 8)"/>
  <path d="M60 196 C 52 28, 268 28, 260 196" fill="none" stroke="${band}" stroke-width="30" stroke-linecap="round"/>
  <path d="M72 176 C 70 54, 250 54, 248 176" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="7" stroke-linecap="round"/>
  <path d="M104 120 C 130 86, 190 86, 216 120" fill="none" stroke="${pad}" stroke-width="16" stroke-linecap="round" opacity=".9"/>
  <rect x="14" y="146" width="84" height="138" rx="38" fill="${cup}"/><rect x="14" y="146" width="84" height="138" rx="38" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/>
  <rect x="84" y="164" width="22" height="102" rx="11" fill="${pad}"/><ellipse cx="50" cy="196" rx="22" ry="34" fill="#fff" opacity=".35"/><circle cx="52" cy="226" r="9" fill="#17473a"/>
  <rect x="222" y="146" width="84" height="138" rx="38" fill="${cup}"/><rect x="222" y="146" width="84" height="138" rx="38" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="3"/>
  <rect x="214" y="164" width="22" height="102" rx="11" fill="${pad}"/><ellipse cx="270" cy="196" rx="22" ry="34" fill="#fff" opacity=".35"/><circle cx="268" cy="226" r="9" fill="#17473a"/>
  <path d="M40 284 C 34 296, 10 300, 6 290 C 0 276, 30 270, 40 278" fill="none" stroke="#222" stroke-width="5" stroke-linecap="round" opacity=".0"/></svg>`;
}

/** The near edge of a laptop seen from above: a brushed lip with a thumb notch, running along the bottom. */
function laptopLip({ y = 1296, h = 120 } = {}) {
  return `<div style="${abs(-20, y, 1040, h, "z-index:2;background:linear-gradient(#aab2bd,#7c8592 40%,#505864);border-radius:26px 26px 0 0;box-shadow:0 -6px 18px rgba(0,0,0,.55),inset 0 2px 0 rgba(255,255,255,.55)")}">
    <div style="${abs(400, 0, 240, 26, "background:linear-gradient(#2f353e,#444b56);border-radius:0 0 120px 120px;box-shadow:inset 0 4px 8px rgba(0,0,0,.6)")}"></div>
    <div style="${abs(0, 0, 1040, h, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4px);border-radius:26px 26px 0 0")}"></div></div>`;
}

/** A yellow legal-style notepad with `inner` set in its handwriting. */
function notepad({ x, y, w, h, rot = 0, inner = "", paper = "#f6ecb8", ink = "#1f3b7a", z = 4, pad = 96 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 4px 4px rgba(0,0,0,.4)) drop-shadow(0 22px 22px rgba(0,0,0,.55))`)}">
    <div style="${abs(8, 8, w, h, "background:#7a6a44;border-radius:6px")}"></div>
    <div style="${abs(0, 0, w, h, `background:linear-gradient(#e6c64e 0 34px,transparent 34px),linear-gradient(90deg,transparent ${pad - 12}px,#e08a8a ${pad - 12}px ${pad - 10}px,transparent ${pad - 10}px),linear-gradient(transparent 43px,#a9c1d6 43px) 0 34px/100% 44px repeat-y,${paper};border-radius:5px;overflow:hidden`)}">
      <div style="${abs(0, 28, w, 7, "background:rgba(120,80,0,.3)")}"></div>
      <div style="position:absolute;left:${pad}px;right:26px;top:44px;font:600 40px/44px 'Hand',cursive;color:${ink}">${inner}</div></div></div>`;
}

/** A square sticky note. */
function sticky({ x, y, w, h, rot = 0, color = "#f7e27a", inner = "", z = 4, pin = null }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 3px 3px rgba(0,0,0,.4)) drop-shadow(0 18px 18px rgba(0,0,0,.5))`)}">
    <div style="${abs(0, 0, w, h, `background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 30%),${color};padding:22px 24px;overflow:hidden`)}">${inner}</div>${pin ? `<div style="${abs(w / 2 - 17, -10, 34, 34, `border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff9,${pin} 38%,${pin});box-shadow:3px 5px 5px rgba(0,0,0,.4)`)}"></div>` : ""}</div>`;
}

/* ------------------------------------------------------------------ #92 */

function pin92() {
  const i = idea(92);
  const [, , flip, proves, importIt] = i.items;
  const css = `
  .c92{position:absolute;width:440px;height:480px;border-radius:16px;overflow:hidden;z-index:3;box-shadow:0 3px 4px rgba(0,0,0,.4),0 28px 44px rgba(0,0,0,.6)}
  .c92 .bar{height:56px;display:flex;align-items:center;gap:8px;padding:0 18px}
  .c92 .bar i{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.45)}
  .c92 .bar b{margin-left:10px;font:600 24px "Plex",sans-serif;color:#fff}
  .xl{background:#fff}.xl .bar{background:#17473a}
  .grid{display:grid;grid-template-columns:34px 170px 100px 100px;grid-template-rows:36px 62px 62px;margin:16px 18px 0;border-top:1.5px solid #c8d6cd;border-left:1.5px solid #c8d6cd}
  .grid>div{border-right:1.5px solid #c8d6cd;border-bottom:1.5px solid #c8d6cd;display:flex;align-items:center;justify-content:center}
  .grid .gh,.grid .rn{background:#e6eee9;font:500 22px "Plex",sans-serif;color:#4b5b52}
  .grid .sel{outline:4px solid #17473a;outline-offset:-3px;font:600 40px "Plex Mono",monospace;color:#1d1d20;background:#f1f8f4}
  .top h1,.top p{text-wrap:balance}
  .cap92{position:absolute;left:22px;right:22px;font:500 24px/1.3 "Plex",sans-serif;color:#2c3a33}
  .ed{background:#1a2230}.ed .bar{background:#2b3648}
  .ed .ln{display:flex;align-items:center;height:62px;padding:0 18px}
  .ed .gn{width:44px;font:500 22px "Plex Mono",monospace;color:#7d8aa3}
  .ed .dt{font:600 42px "Plex Mono",monospace;color:#f4f1e6;letter-spacing:.01em}
  .ed .tk{margin-left:16px;width:60px;height:60px;border-radius:50%;background:${POP};display:grid;place-items:center;box-shadow:0 0 0 6px rgba(242,182,64,.25)}
  .ed .cap92{color:#dbe3ef}`;
  const L = `<div class="c92 xl" style="left:36px;top:548px;transform:rotate(-1.4deg)">
    <div class="bar"><i></i><i></i><i></i><b>Excel</b></div>
    <div class="grid"><div class="gh"></div><div class="gh">A</div><div class="gh">B</div><div class="gh">C</div>
      <div class="rn">1</div><div>${exTag("color:#4b5b52")}</div><div></div><div></div>
      <div class="rn">2</div><div class="sel">03/05</div><div></div><div></div></div>
    <svg style="${abs(0, 236, 440, 110)}" viewBox="0 0 440 110" aria-hidden="true"><defs><marker id="ah92" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="#17473a"/></marker></defs>
      <path d="M137 8 C 137 50, 104 56, 106 94" fill="none" stroke="#17473a" stroke-width="5" stroke-linecap="round" marker-end="url(#ah92)"/>
      <path d="M150 8 C 170 56, 300 40, 306 94" fill="none" stroke="#17473a" stroke-width="5" stroke-linecap="round" marker-end="url(#ah92)"/></svg>
    <div style="${abs(26, 348, 160, 52, "border:3px solid #17473a;border-radius:12px;background:#e4ece8;display:flex;align-items:center;justify-content:center;font:600 30px 'Plex',sans-serif;color:#0f2f27")}">March 5</div>
    <div style="${abs(226, 348, 160, 52, "border:3px solid #17473a;border-radius:12px;background:#e4ece8;display:flex;align-items:center;justify-content:center;font:600 30px 'Plex',sans-serif;color:#0f2f27")}">May 3</div>
    <div class="cap92" data-check="caption" style="top:412px;height:64px">${esc(flip)}</div></div>`;
  const R = `<div class="c92 ed" style="left:524px;top:566px;transform:rotate(1.2deg)">
    <div class="bar"><i></i><i></i><i></i><b>Text editor</b></div>
    <div class="ln" style="margin-top:12px"><span class="gn">1</span>${exTag("color:#b8c4d6")}</div>
    <div class="ln"><span class="gn">2</span><span class="dt">09/13/2026</span><span class="tk">${icon("check", { size: 38, color: "#2b1d02", weight: "bold" })}</span></div>
    <div class="ln"><span class="gn">3</span></div><div class="ln"><span class="gn">4</span></div><div class="ln"><span class="gn">5</span></div>
    <div class="cap92" data-check="caption" style="top:412px;height:64px">${esc(proves)}</div></div>`;
  const pad = notepad({ x: 40, y: 1062, w: 590, h: 222, rot: -1.2, z: 4, inner: `${esc(importIt)}` });
  const scene = `${nightDesk({ base: "#0f1b30", hi: "rgba(60,90,140,.35)", look: "fine", pool: [880, 460, 780] })}
  ${L}${R}${laptopLip()}${pad}${headphones({ x: 668, y: 1074, w: 300, rot: 7 })}${lamp({ x: 884, y: 452, r: 78, armTo: [1040, 372] })}`;
  return printable({ n: 92, scene, paper: "#e6ecf3", extraCss: css + ".top h1{font-size:58px}" });
}

/* ------------------------------------------------------------------ #93 */

function pin93() {
  const i = idea(93);
  const [oneItem, drItem] = i.items;
  const tell = (s) => s.split("Tell the importer: ")[1];
  const css = `
  .t93{position:absolute;width:440px;background:#fcfbf6;z-index:3;padding:20px 18px 22px;border-radius:6px;box-shadow:0 3px 4px rgba(0,0,0,.45),0 28px 40px rgba(0,0,0,.6)}
  .t93 h3{font:600 38px/1.1 "Newsreader",Georgia,serif;color:#0f2f27;margin:8px 0 14px}
  .tb{display:grid;border-top:2px solid #17473a;border-left:2px solid #c8d6cd}
  .tb>div{height:58px;display:flex;align-items:center;padding:0 12px;border-right:2px solid #c8d6cd;border-bottom:2px solid #c8d6cd;font:500 25px "Plex",sans-serif;color:#1d1d20;white-space:nowrap}
  .tb .th{height:46px;background:#17473a;color:#fff;font:600 22px "Plex",sans-serif;border-right-color:#2c6a58}
  .tb .n{justify-content:flex-end;font:500 25px "Plex Mono",monospace}
  .tb .pop{background:#fff1c9}
  .note93 .lb{font:600 26px "Plex",sans-serif;color:#4a3d12}
  .note93 .big{font:600 48px/1.08 "Newsreader",Georgia,serif;color:#1a1a18;margin-top:6px}`;
  const left = `<div class="t93" style="left:40px;top:446px;transform:rotate(-1.3deg)">${exTag()}<h3>One amount column</h3>
    <div class="tb" style="grid-template-columns:96px 170px 138px">
      <div class="th">Date</div><div class="th">Description</div><div class="th n" style="justify-content:flex-end">Amount</div>
      <div></div><div>Groceries</div><div class="n pop">-84.20</div>
      <div></div><div>paycheck</div><div class="n pop">1612.40</div>
      <div></div><div></div><div></div></div></div>`;
  const right = `<div class="t93" style="left:520px;top:462px;transform:rotate(1.1deg)">${exTag()}<h3>Debit and credit</h3>
    <div class="tb" style="grid-template-columns:86px 150px 84px 84px">
      <div class="th">Date</div><div class="th">Description</div><div class="th">Debit</div><div class="th">Credit</div>
      <div></div><div></div><div class="n pop" style="padding:0 8px;font-size:24px">84.20</div><div></div>
      <div></div><div></div><div></div><div class="n pop" style="padding:0 8px;font-size:24px">84.20</div>
      <div></div><div></div><div></div><div></div></div></div>`;
  const arrow = (x, y, rot) => `<svg style="${abs(x, y, 76, 104, `transform:rotate(${rot}deg);z-index:3;filter:drop-shadow(0 8px 6px rgba(0,0,0,.55))`)}" viewBox="0 0 76 104" aria-hidden="true"><path d="M26 0 H50 V56 H72 L38 102 L4 56 H26 Z" fill="#f3ead2"/><path d="M26 0 H50 V56 H72 L38 102 L4 56 H26 Z" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M30 6 V60" stroke="#fff" stroke-opacity=".6" stroke-width="4"/></svg>`;
  const ni = (s) => `<div class="note93"><div class="lb">Tell the importer:</div><div class="big">${esc(tell(s))}</div></div>`;
  const notes = `${sticky({ x: 52, y: 934, w: 420, h: 196, rot: -1.6, color: "#f6df78", inner: ni(oneItem), pin: "#17473a" })}
  ${sticky({ x: 536, y: 948, w: 410, h: 196, rot: 1.4, color: "#cdeadb", inner: ni(drItem), pin: "#e0a43a" })}`;
  const scene = `${nightDesk({ base: "#20252c", hi: "rgba(120,140,170,.25)", look: "slate", pool: [140, 1250, 760], poolOp: 0.3, seed: 7 })}
  ${left}${right}${arrow(228, 824, -2)}${arrow(704, 840, 2)}${notes}
  ${pencil({ x: 372, y: 1262, len: 210, rot: 4, body: "#5aa079" })}${headphones({ x: 650, y: 1090, w: 270, rot: -7, cup: "#d9d4c8", band: "#aaa493" })}
  ${lamp({ x: 118, y: 1272, r: 92, armTo: [330, 1196] })}`;
  return printable({ n: 93, scene, paper: "#e9eaea", extraCss: css });
}

/* ------------------------------------------------------------------ #94 */

function pin94() {
  const i = idea(94);
  const css = `
  .pg94{position:absolute;left:44px;top:400px;width:790px;height:940px;transform:rotate(-.8deg);z-index:3;border-radius:6px;background:linear-gradient(90deg,transparent 80px,#e49a9a 80px 82px,transparent 82px),linear-gradient(transparent 44px,#b6cdd9 44px) 0 20px/100% 46px repeat-y,#fbf8ee;box-shadow:0 3px 4px rgba(0,0,0,.45),0 30px 50px rgba(0,0,0,.6)}
  .pg94 .holes{position:absolute;left:22px;top:0;bottom:0;width:30px}
  .hole94{position:absolute;left:0;width:30px;height:30px;border-radius:50%;background:#0e2a2c;box-shadow:inset 2px 3px 4px rgba(0,0,0,.6)}
  .steps{position:absolute;left:104px;top:250px;width:644px;height:672px;overflow:hidden}
  .stp{display:flex;gap:16px;margin-bottom:46px}.stp:last-child{margin-bottom:0}
  .stp .no{flex:none;width:38px;height:38px;margin-top:4px;border-radius:50%;background:#17473a;color:#fff;display:grid;place-items:center;font:600 24px "Plex",sans-serif}
  .stp .tx{font:500 30px/46px "Newsreader",Georgia,serif;color:#16231e}
  .stp.pop .no{background:${POP};color:#2b1d02}
  .stp.pop .tx span{background:linear-gradient(transparent 12%,#fbd56a 12% 92%,transparent 92%);padding:0 6px;margin:0 -6px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
  .stk .t{font:700 40px/1.05 "Hand",cursive;color:#3a3210}`;
  const steps = i.items.map((t, k) => `<div class="stp${k === 4 ? " pop" : ""}"><div class="no">${k + 1}</div><div class="tx"><span>${esc(t)}</span></div></div>`).join("");
  const sk = `<svg style="${abs(34, 20, 640, 206)}" viewBox="0 0 640 206" aria-hidden="true">
    <g fill="#fff" stroke="#17473a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect x="82" y="8" width="250" height="150" rx="10"/><path d="M50 158 H364 L350 184 Q348 190 340 190 H74 Q66 190 64 184 Z" fill="#e4ece8"/><path d="M180 172 H236" fill="none"/></g>
    <rect x="102" y="28" width="210" height="110" rx="4" fill="#eef4f1"/>
    <rect x="132" y="62" width="150" height="46" rx="23" fill="#17473a"/><text x="207" y="94" text-anchor="middle" font-family="Plex" font-weight="600" font-size="24" fill="#fff">Download</text>
    <path d="M382 98 C 410 98, 430 98, 468 98" fill="none" stroke="#17473a" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/><path d="M458 84 L476 98 L458 112" fill="none" stroke="#17473a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(500 22)"><path d="M0 0 H70 L108 38 V144 H0 Z" fill="#fff" stroke="#17473a" stroke-width="4" stroke-linejoin="round"/><path d="M70 0 V38 H108" fill="#e4ece8" stroke="#17473a" stroke-width="4" stroke-linejoin="round"/>
      <text x="54" y="108" text-anchor="middle" font-family="Plex" font-weight="700" font-size="34" fill="#17473a">CSV</text></g></svg>`;
  const holes = [190, 470, 750].map((t) => `<div class="hole94" style="top:${t}px"></div>`).join("");
  const page = `<div class="pg94"><div class="holes">${holes}</div>${sk}<div class="steps" data-check="steps">${steps}</div></div>`;
  const note = sticky({ x: 806, y: 640, w: 178, h: 176, rot: 4, color: "#f7e27a", z: 5, inner: `<div class="stk"><div class="t">Whole calendar months</div></div>` });
  const scene = `${nightDesk({ base: "#0c2a2d", hi: "rgba(50,130,125,.3)", look: "leather", pool: [900, 1230, 700], poolOp: 0.26, seed: 5 })}
  ${page}${note}${mug({ x: 728, y: 1128, size: 200, color: "#eae4d6", drink: "#7a4a24" })}`;
  const css2 = css + `.stk{height:100%}`;
  return printable({ n: 94, scene, paper: "#e2eeeb", extraCss: css2 + ".top h1{font-size:58px;text-wrap:balance}" });
}

/* ------------------------------------------------------------------ #95 */

function pin95() {
  const i = idea(95);
  const [, , , lastHalf] = [0, 0, 0, 0];
  const future = ["The bill due Friday", "The subscription renewing next week", "The balance you need to keep"];
  const css = `
  .strip{position:absolute;left:70px;top:340px;width:580px;height:1000px;transform:rotate(.6deg);z-index:3;filter:drop-shadow(0 3px 3px rgba(0,0,0,.4)) drop-shadow(0 28px 34px rgba(0,0,0,.55))}
  .strip>.sh{position:absolute;inset:0;background:linear-gradient(90deg,#fbf7ea,#fffdf4 50%,#f6f1e0);clip-path:${zig(580, 1000, 14, 7, "b")}}
  .strip .lab{position:absolute;left:36px;font:600 46px/1 "Newsreader",Georgia,serif;color:#1d1d20}
  .rowb{position:absolute;left:36px;right:36px;height:46px;border-bottom:2px solid #d8d2bf;display:flex;align-items:center;gap:22px}
  .rowb i{display:block;height:14px;border-radius:7px;background:#3b4640}
  .fut{position:absolute;left:44px;width:492px;height:122px;border:4px dashed #8a9a92;border-radius:14px;background:rgba(23,71,58,.04);display:flex;align-items:center;padding:0 26px;font:500 33px/1.12 "Newsreader",Georgia,serif;color:#3a4a43}
  .today{position:absolute;left:-34px;width:648px;top:470px;height:10px;background:#17473a;border-radius:5px;box-shadow:0 0 0 3px rgba(23,71,58,.15)}
  .tpill{position:absolute;left:376px;top:446px;padding:7px 24px 9px;border-radius:999px;background:#17473a;color:#fff;font:600 32px "Plex",sans-serif;box-shadow:0 6px 10px rgba(0,0,0,.3)}`;
  const rnd = (s) => { let v = s; return () => ((v = (v * 9301 + 49297) % 233280) / 233280); };
  const r = rnd(11);
  const rows = Array.from({ length: 7 }, (_, k) => `<div class="rowb" style="top:${118 + k * 48}px"><i style="width:${70 + Math.round(r() * 14)}px"></i><i style="width:${150 + Math.round(r() * 120)}px"></i><i style="width:${64 + Math.round(r() * 40)}px;margin-left:auto"></i></div>`).join("");
  const fut = future.map((t, k) => `<div class="fut" data-check="outline" style="top:${528 + k * 150}px">${esc(t)}</div>`).join("");
  const strip = `<div class="strip"><div class="sh">
    <div class="lab" data-check="label" style="top:46px">What happened</div>${rows}
    <div class="today"></div><div class="tpill">today</div>${fut}</div></div>`;
  const pad = notepad({ x: 696, y: 700, w: 280, h: 240, rot: 3, pad: 40, inner: esc(i.items[1].split(": ")[0].replace("It doesn't tell you what's coming", "It doesn't tell you what's coming.")) });
  const scene = `${nightDesk({ base: "#241a33", hi: "rgba(130,90,170,.3)", look: "weave", pool: [850, 470, 760], poolOp: 0.28, seed: 9 })}
  ${strip}${pad}${headphones({ x: 690, y: 1020, w: 272, rot: -10, cup: "#e9e2ef", band: "#bdb2c9", pad: "#6b6178" })}
  ${lamp({ x: 850, y: 486, r: 92, armTo: [960, 620] })}${pencil({ x: 700, y: 1292, len: 250, rot: -3, body: "#d9962b" })}`;
  return printable({ n: 95, scene, paper: "#ece7f0", extraCss: css });
}

/* ------------------------------------------------------------------ #96 */

function pin96() {
  const i = idea(96);
  const tags = ["Car insurance - $118", "Phone - $55", "Electric - $96", "Rent - $1,450", "Internet - $60", "Card minimum - $35"];
  const amts = [118, 55, 96, 1450, 60, 35];
  const S = 540 / 2150, X0 = 60;
  const css = `
  .bar96{position:absolute;left:${X0}px;height:80px;border-radius:6px;overflow:hidden;display:flex;z-index:3;box-shadow:0 3px 3px rgba(0,0,0,.4),0 14px 20px rgba(0,0,0,.45)}
  .keep{background:linear-gradient(90deg,#fbf4de,#f3e9cc);height:100%;flex:none;display:flex;align-items:center}
  .gone{height:100%;flex:none;background:repeating-linear-gradient(135deg,#d98782 0 7px,#bd5e5a 7px 14px);opacity:.92}
  .tag96{position:absolute;left:640px;height:58px;width:326px;z-index:3;display:flex;align-items:center;padding:0 14px 0 50px;font:600 24px "Plex",sans-serif;color:#2b1d1a;white-space:nowrap;background:linear-gradient(#fbf4de,#efe3c0);clip-path:polygon(26px 0,100% 0,100% 100%,26px 100%,0 50%);filter:drop-shadow(0 4px 4px rgba(0,0,0,.5))}
  .tag96:before{content:"";position:absolute;left:24px;top:22px;width:14px;height:14px;border-radius:50%;background:#2d1618;box-shadow:inset 1px 2px 2px rgba(0,0,0,.6)}
  .lead{position:absolute;height:0;border-top:3px dotted rgba(251,244,222,.55);z-index:2}
  .big96{font:600 60px/1 "Newsreader",Georgia,serif;color:#1d1d20;padding-left:22px;display:flex;align-items:center;white-space:nowrap}
  .lbl96{position:absolute;color:#fbf4de;font:500 24px/1.28 "Plex",sans-serif;z-index:3}`;
  const bal = [2150];
  amts.forEach((a) => bal.push(bal[bal.length - 1] - a));
  const start = `<div class="bar96" style="top:408px"><div class="keep" style="width:${Math.round(bal[0] * S)}px"><div class="big96">$2,150</div></div></div>
    <div class="lbl96" data-check="start-label" style="left:640px;top:402px;width:330px">${exTag("color:#e9e0c8;margin-bottom:8px")}<div>Balance after your last paycheck, the 10th</div></div>`;
  const rows = amts.map((a, k) => {
    const top = 530 + k * 94;
    const w0 = bal[k] * S, w1 = bal[k + 1] * S;
    const bar = `<div class="bar96" style="top:${top}px"><div class="keep" style="width:${w1.toFixed(1)}px"></div><div class="gone" style="width:${(w0 - w1).toFixed(1)}px"></div></div>`;
    const lead = `<div class="lead" style="left:${(X0 + w0 + 6).toFixed(0)}px;width:${(634 - X0 - w0 - 6).toFixed(0)}px;top:${top + 40}px"></div>`;
    return `${bar}${lead}<div class="tag96" data-check="tag" style="top:${top + 11}px">${esc(tags[k])}</div>`;
  }).join("");
  const stubW = Math.round(bal[6] * S);
  const stub = `<div style="${abs(X0, 1112, stubW, 136, `background:linear-gradient(90deg,#ffd270,${POP});border-radius:5px;z-index:3;box-shadow:0 0 0 5px rgba(242,182,64,.22),0 0 40px rgba(242,182,64,.5),0 16px 22px rgba(0,0,0,.5)`)}"></div>
    <div class="lbl96" data-check="stub-label" style="left:${X0 + stubW + 30}px;top:1096px;width:760px">
      <div style="margin-bottom:8px">Left before the first new paycheck</div>
      <div style="display:flex;align-items:center;gap:20px;margin:2px 0 4px"><span style="font:600 88px/1 'Newsreader',Georgia,serif;color:#fff">$336</span>${exTag("color:#e9e0c8")}</div>
      <div>before groceries, fuel or health coverage</div></div>`;
  const scene = `${nightDesk({ base: "#2d1618", hi: "rgba(170,70,70,.28)", look: "plank", pool: [880, 1250, 800], poolOp: 0.24, seed: 13 })}
  ${start}${rows}${stub}
  ${headphones({ x: 722, y: 1096, w: 250, rot: 9, cup: "#e8d9cd", band: "#c2ac9b", pad: "#6e5a4b" })}${pencil({ x: 330, y: 1298, len: 250, rot: -2, body: "#e7b23f" })}
  ${lamp({ x: 66, y: 1322, r: 60, armTo: [-40, 1262] })}`;
  return printable({ n: 96, scene, paper: "#f1e6df", extraCss: css + ".top h1,.top p{text-wrap:balance}" });
}

export const pins = [pin92(), pin93(), pin94(), pin95(), pin96()];
