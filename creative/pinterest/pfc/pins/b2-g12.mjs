/**
 * Batch 2, group G12: four pins in the suitcase and travel-desk world.
 *
 *   #97  six steps after a life change: a folded road map, a dotted route, six stop cards (step 6 in amber)
 *   #98  what each one touches: three boarding passes on a navy leather desk, an "Easy to miss" strip on each
 *   #25  Money Checklist: the inside of an open brick-red suitcase, a packing-list card, a corner of real page 15
 *   #27  five confidence labels: five luggage tags on a ribbed teal hard-shell case
 *
 * Words: every word is the bank's (headline, sub, items, proof) or a cut of it. Set here and not
 * verbatim: the "Easy to miss" strip label (the idea's own phrase) and the step numbers 1-6 on #97.
 * On #25 the card is headed "Account completeness check", the real title of workbook page 15.
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { bookPage } from "../kit/assets.mjs";
import { sheet } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
let uid = 0;
const wrap = (scene) => `<div style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:1;isolation:isolate">${scene}</div>`;

const grain = (opacity = 0.35, freq = 0.7, seed = 4, tint = ".45 0 0 0 0 .4 0 0 0 0 .35") =>
  `<svg style="${abs(0, 372, 1000, 982, `opacity:${opacity};mix-blend-mode:multiply;pointer-events:none`)}" aria-hidden="true"><filter id="gr${++uid}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .55 0"/></filter><rect width="1000" height="982" filter="url(#gr${uid})"/></svg>`;
const light = (a = 0.22, b = 0.3, tint = "20,12,4") =>
  `<div style="${abs(0, 372, 1000, 982, `background:radial-gradient(ellipse at 22% 8%,rgba(255,255,255,${a}),rgba(${tint},${b}) 100%)`)}"></div>`;

/** A ballpoint pen lying at an angle. */
function pen({ x, y, len = 400, rot = 0, body = "#1f1f23", band = C.forest, z = 12 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 9px 6px rgba(10,10,10,.45))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="5" width="${len - 80}" height="24" rx="12" fill="${body}"/><rect x="50" y="7" width="${len - 80}" height="7" rx="3" fill="#fff" opacity=".2"/>
    <rect x="${len - 150}" y="5" width="46" height="24" fill="${band}"/><rect x="${len - 100}" y="12" width="90" height="6" rx="3" fill="#c9ccd2"/><rect x="${len - 100}" y="12" width="90" height="2" fill="#fff" opacity=".6"/>
    <path d="M50 5 L14 14 Q6 17 14 20 L50 29 Z" fill="#c9ccd2"/><path d="M14 14 L2 17 L14 20Z" fill="#33363b"/></svg>`;
}

/** A blank sticky note. */
const sticky = ({ x, y, w = 150, h = 150, rot = 0, color = "#f7de8e", color2 = "#f0d072", z = 9 }) =>
  `<div style="${abs(x, y, w, h, `background:linear-gradient(${color},${color2});transform:rotate(${rot}deg);box-shadow:0 2px 3px rgba(40,20,5,.3),0 14px 18px rgba(40,20,5,.35);z-index:${z}`)}"><div style="${abs(0, 0, w, 14, "background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,0))")}"></div></div>`;

/** A hand tick. */
const tick = (size = 44, color = C.forest) => `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true"><path d="M8 24 L18 35 L38 7" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** A luggage-tag eyelet: a punched hole in a brass ring. */
const eyelet = (x, y, r = 17) =>
  `<div style="${abs(x - r, y - r, r * 2, r * 2, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4dca0,#b98a2c);box-shadow:0 2px 3px rgba(0,0,0,.4)")}"><div style="${abs(r - r * 0.5, r - r * 0.5, r, r, "border-radius:50%;background:#2a2118;box-shadow:inset 0 2px 3px rgba(0,0,0,.7)")}"></div></div>`;

/* ------------------------------------------------------------------ #97 */

function pin97() {
  const i = idea(97);
  const W = 540, H = 130, STEP = 152, Y0 = 394;
  const pos = i.items.map((_, k) => ({ x: k % 2 ? 410 : 50, y: Y0 + k * STEP }));
  // the dotted route runs through the number circles, which sit on each card's outer edge
  const pts = pos.map((p, k) => ({ x: k % 2 ? p.x + W - 10 : p.x + 10, y: p.y + H / 2 }));
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let k = 1; k < pts.length; k++) {
    const a = pts[k - 1], b = pts[k];
    d += ` C ${a.x} ${a.y + 80}, ${b.x} ${b.y - 80}, ${b.x} ${b.y}`;
  }
  const route = `<svg style="${abs(0, 372, 1000, 982, "z-index:2")}" viewBox="0 372 1000 982" aria-hidden="true"><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="12" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.forestDeep}" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 18"/></svg>`;
  const cards = i.items
    .map((t, k) => {
      const { x, y } = pos[k];
      const last = k === 5;
      const col = last ? C.amber : C.forest;
      const wob = [-0.6, 0.5, -0.4, 0.6, -0.5, 0.4][k];
      const cx = k % 2 ? W - 76 : 76;
      return `<div style="${abs(x, y, W, H, `transform:rotate(${wob}deg);z-index:5`)}">
        <div style="${abs(0, 0, W, H, `background:#fffdf6;border-radius:10px;box-shadow:0 2px 3px rgba(20,40,30,.25),0 14px 22px rgba(20,40,30,.3);${last ? `border:5px solid ${C.amber}` : ""}`)}"></div>
        <div style="${abs(k % 2 ? 0 : W - 6, 0, 6, H, `background:${col};border-radius:3px`)}"></div>
        <div style="${abs(k % 2 ? 128 : 22, 0, 200, 0)}"></div>
        <div data-check="step${k + 1}" style="${abs(k % 2 ? 26 : 120, 10, W - 150, H - 20, "display:flex;align-items:center;font:500 28px/1.22 'Plex',sans-serif;color:#1d1d20")}">${esc(t)}</div>
        <div style="${abs(k % 2 ? W - 100 : 18, H / 2 - 40, 80, 80, `border-radius:50%;background:${col};color:${last ? "#2b1d05" : "#fff"};display:grid;place-items:center;font:600 50px 'Newsreader',serif;box-shadow:0 0 0 6px #fffdf6,0 5px 8px rgba(0,0,0,.35)`)}">${k + 1}</div></div>`;
    })
    .join("");
  // map: land, water, a lake, roads, grid and the folds
  const map = `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 372 1000 982" aria-hidden="true">
    <rect y="372" width="1000" height="982" fill="#e8ecd6"/>
    <path d="M0 372 H430 C 380 470 470 540 400 640 C 330 740 420 800 360 900 C 300 1000 380 1100 330 1354 H0Z" fill="#f2efdc"/>
    <path d="M700 372 H1000 V900 C 900 860 860 780 800 740 C 740 700 790 600 740 520 C 700 460 760 420 700 372Z" fill="#b9d8dc"/>
    <path d="M560 1354 C 600 1250 700 1230 760 1160 C 840 1070 900 1100 1000 1010 V1354Z" fill="#b9d8dc"/>
    <ellipse cx="190" cy="1170" rx="120" ry="70" fill="#b9d8dc"/>
    <path d="M60 700 C 300 640 420 900 700 840 S 900 980 1000 940" stroke="#fff" stroke-width="10" fill="none" opacity=".85"/>
    <path d="M0 1010 C 200 1050 380 960 560 1090 S 800 1250 1000 1250" stroke="#f0d58a" stroke-width="8" fill="none" opacity=".9"/>
    <path d="M250 372 C 300 600 180 800 260 1354" stroke="#fff" stroke-width="6" fill="none" opacity=".8"/>
    <g stroke="#9fb7a4" stroke-width="1.5" opacity=".5">${Array.from({ length: 12 }, (_, k) => `<path d="M${k * 90} 372 V1354"/>`).join("")}${Array.from({ length: 12 }, (_, k) => `<path d="M0 ${372 + k * 90} H1000"/>`).join("")}</g></svg>
    <div style="${abs(332, 372, 36, 982, "background:linear-gradient(90deg,rgba(0,0,0,.0),rgba(0,0,0,.12) 48%,rgba(255,255,255,.35) 52%,rgba(255,255,255,0))")}"></div>
    <div style="${abs(664, 372, 36, 982, "background:linear-gradient(90deg,rgba(0,0,0,.0),rgba(0,0,0,.12) 48%,rgba(255,255,255,.35) 52%,rgba(255,255,255,0))")}"></div>
    <div style="${abs(0, 860, 1000, 30, "background:linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.1) 48%,rgba(255,255,255,.35) 52%,rgba(255,255,255,0))")}"></div>`;
  const scene = `${map}${grain(0.22, 0.8, 5)}${light(0.25, 0.14, "30,50,40")}
    ${route}${cards}
    ${sticky({ x: 70, y: 1176, w: 160, h: 160, rot: -6, z: 8 })}
    ${pen({ x: 150, y: 1286, len: 420, rot: -8, z: 10 })}`;
  return printable({ n: 97, scene: wrap(scene), paper: "#e8eedd" });
}

/* ------------------------------------------------------------------ #98 */

function pin98() {
  const i = idea(98);
  const rows = [
    { head: "New job", first: "Give HR your direct deposit details.", miss: "A first check later than you expected" },
    { head: "Move", first: "Send the address to your bank, card issuers, insurers, employer and the IRS.", miss: "Annual statements and renewals that still go to the old address" },
    { head: "Separation", first: "List every joint account, card and loan.", miss: "A joint card that stays open, because both holders remain responsible for the whole balance" },
  ];
  const X = 66, W = 868, H = 262, GAP = 22, Y0 = 398;
  const heads = ["#2f6b57", "#3d7f9a", "#b4553f"];
  const passes = rows
    .map((r, k) => {
      const y = Y0 + k * (H + GAP);
      const rot = [-1.1, 0.8, -0.6][k];
      const plane = ["briefcase", "house-line", "users"][k];
      return `<div style="${abs(X, y, W, H, `transform:rotate(${rot}deg);z-index:5`)}">
        <div style="${abs(0, 0, W, H, "background:#fbf6e9;border-radius:18px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 18px 30px rgba(0,0,0,.45)")}"></div>
        <div style="${abs(0, 0, 262, H, `background:${heads[k]};border-radius:18px 0 0 18px`)}"></div>
        <div style="${abs(0, 0, 262, H, "background:linear-gradient(120deg,rgba(255,255,255,.2),rgba(255,255,255,0) 55%);border-radius:18px 0 0 18px")}"></div>
        <div style="${abs(24, 34, 60, 60, "")}">${icon(plane, { size: 56, color: "#fff", weight: "duotone" })}</div>
        <div data-check="head${k + 1}" style="${abs(24, 108, 226, 100, "display:flex;align-items:flex-start;font:600 46px/1.02 'Newsreader',serif;color:#fff;letter-spacing:-.01em")}">${esc(r.head)}</div>
        <div style="${abs(262, 14, 0, H - 28, "border-left:4px dashed #cbbf9c")}"></div>
        <div style="${abs(-12, -12, 24, 24, "")}"></div>
        <div data-check="first${k + 1}" style="${abs(292, 14, W - 292 - 28, 112, "display:flex;align-items:center;font:500 30px/1.2 'Plex',sans-serif;color:#1d1d20")}">${esc(r.first)}</div>
        <div style="${abs(262, H - 126, W - 262, 126, `background:${C.amber};border-radius:0 0 18px 0`)}"></div>
        <div style="${abs(292, H - 118, 220, 28, "font:700 22px/28px 'Plex',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#2b1a05")}">Easy to miss</div>
        <div data-check="miss${k + 1}" style="${abs(292, H - 90, W - 292 - 28, 82, "font:500 24px/1.22 'Plex',sans-serif;color:#1d1405;overflow:hidden")}">${esc(r.miss)}</div></div>`;
    })
    .join("");
  // a house key, a pen and a stack of airmail envelopes along the bottom edge
  const key = `<svg style="${abs(40, 1244, 250, 100, "transform:rotate(-14deg);z-index:9;filter:drop-shadow(0 10px 7px rgba(0,0,0,.5))")}" viewBox="0 0 250 100" aria-hidden="true"><circle cx="46" cy="50" r="38" fill="#d3a64a"/><circle cx="46" cy="50" r="38" fill="none" stroke="#8d6a1c" stroke-width="4"/><circle cx="46" cy="50" r="15" fill="#13243a"/><rect x="80" y="40" width="160" height="22" rx="5" fill="#d3a64a"/><rect x="80" y="40" width="160" height="7" fill="#f2d98b" opacity=".7"/><path d="M180 62 h18 v22 h-18z M212 62 h16 v16 h-16z" fill="#d3a64a"/></svg>`;
  const env = (x, y, rot, c) =>
    `<div style="${abs(x, y, 280, 170, `transform:rotate(${rot}deg);background:#fbf6e9;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 14px 20px rgba(0,0,0,.45);z-index:9;overflow:hidden`)}"><div style="${abs(0, 0, 280, 170, `border:12px solid transparent;border-image:repeating-linear-gradient(135deg,#c9453b 0 16px,#fbf6e9 16px 28px,#2f5f9a 28px 44px,#fbf6e9 44px 56px) 12`)}"></div><svg style="${abs(0, 0, 280, 170)}" viewBox="0 0 280 170"><path d="M12 12 L140 98 L268 12" fill="none" stroke="#d8cfb4" stroke-width="3"/></svg><div style="${abs(190, 28, 56, 64, `border:3px dashed ${c};border-radius:3px`)}"></div></div>`;
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#1d3350")}"></div>
    <div style="${abs(20, 380, 960, 962, "border:3px dashed rgba(240,214,150,.45);border-radius:22px")}"></div>
    ${grain(0.5, 0.9, 9)}${light(0.22, 0.38, "4,10,24")}
    ${passes}
    ${env(660, 1244, -8, "#c9453b")}${env(716, 1262, 5, "#2f5f9a")}
    ${key}
    ${pen({ x: 290, y: 1290, len: 340, rot: 4, band: C.amber, body: "#f2eadb" })}`;
  return printable({ n: 98, scene: wrap(scene), paper: "#e6ebf2" });
}

/* ------------------------------------------------------------------ #25 */

function pin25() {
  const i = idea(25);
  const CX = 150, CY = 408, CW = 700, CH = 640;
  const done = [0, 3, 4]; // three ticked, three open
  const rows = i.items
    .map(
      (t, k) => `<div style="display:flex;gap:22px;align-items:center;height:78px">
        <div style="flex:none;width:46px;height:46px;border:4px solid ${C.forest};border-radius:9px;background:#fffdf6;display:grid;place-items:center">${done.includes(k) ? tick(36) : ""}</div>
        <div data-check="item${k + 1}" style="font:500 28px/34px 'Plex',sans-serif;color:#1d1d20;width:545px;flex:none">${esc(t)}</div></div>`,
    )
    .join("");
  const card = `<div style="${abs(CX, CY, CW, CH, "transform:rotate(-1.6deg);z-index:7")}">
    <div style="${abs(0, 0, CW, CH, "background:#fffdf6;border-radius:12px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 24px 40px rgba(40,10,5,.5)")}"></div>
    <div style="${abs(0, 0, CW, 14, `background:${C.forest};border-radius:12px 12px 0 0`)}"></div>
    <div style="${abs(48, 40, 600, 56, `font:600 44px/56px 'Newsreader',serif;color:${C.forestDeep};white-space:nowrap`)}">Account completeness check</div>
    <div style="${abs(48, 104, 70, 4, `background:${C.forest}`)}"></div>
    <div style="${abs(48, 138, 610, 480)}">${rows}</div></div>`;
  // index-tab flags on the card's right edge
  const flags = ["#e9a9b4", "#f0d58a", "#a9d1bd"]
    .map((c, k) => `<div style="${abs(CX + CW - 8, CY + 120 + k * 90, 78, 56, `background:linear-gradient(${c},${c}e6);border-radius:3px 10px 10px 3px;transform:rotate(${[2, -2, 3][k]}deg);z-index:6;box-shadow:0 2px 3px rgba(0,0,0,.3),0 8px 12px rgba(0,0,0,.3)`)}"></div>`)
    .join("");
  // the suitcase: outer shell, rim, cream lining, elastic strap, latches
  const strap = (x) => `<div style="${abs(x, 372, 40, 982, "background:linear-gradient(90deg,#2a2a2e,#46464c 50%,#2a2a2e);z-index:3;box-shadow:0 0 6px rgba(0,0,0,.4)")}"></div>`;
  const latch = (y) => `<div style="${abs(4, y, 40, 100, "background:linear-gradient(90deg,#f0f0f2,#9a9ea6);border-radius:8px;z-index:9;box-shadow:0 4px 8px rgba(0,0,0,.5)")}"><div style="${abs(12, 36, 16, 28, "background:#5c6068;border-radius:4px")}"></div></div>`;
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#8d3b2a")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 6px,rgba(255,255,255,.04) 6px 22px)")}"></div>
    <div style="${abs(34, 372, 932, 982, "background:#f0e2c2;border-radius:0;box-shadow:inset 0 14px 20px rgba(60,30,5,.35),inset 0 -10px 18px rgba(60,30,5,.25),inset 10px 0 16px rgba(60,30,5,.2)")}"></div>
    <div style="${abs(34, 372, 932, 982, "background:repeating-linear-gradient(45deg,rgba(184,150,90,.18) 0 3px,rgba(255,255,255,0) 3px 10px)")}"></div>
    ${grain(0.25, 0.8, 14)}${light(0.2, 0.2, "50,20,5")}
    ${strap(80)}
    <div style="${abs(34, 1096, 932, 8, "background:rgba(120,80,30,.25)")}"></div>
    ${latch(380)}${latch(1210)}
    ${card}${flags}
    ${sheet({ src: bookPage(15), x: 330, y: 1000, w: 600, tilt: 3, crop: { x0: 0, y0: 0, x1: 1, y1: 0.3 }, id: "peek" })}
    ${pen({ x: 100, y: 1170, len: 250, rot: 10, z: 12 })}
    <div style="${abs(740, 1252, 200, 100, "background:linear-gradient(#2f6b57,#1f4a3c);border-radius:14px;transform:rotate(-4deg);z-index:6;box-shadow:0 10px 18px rgba(0,0,0,.45)")}"><div style="${abs(20, 46, 160, 8, "background:#d8dadf;border-radius:4px")}"></div></div>`;
  return printable({ n: 25, scene: wrap(scene), paper: "#f1e6d3" });
}

/* ------------------------------------------------------------------ #27 */

function pin27() {
  const i = idea(27);
  const defs = [
    { c1: "#2f6b57", c2: "#1f4a3c", ink: "#ffffff", sub: "#dcebe3" },
    { c1: "#9ccbb0", c2: "#7fb598", ink: "#10281e", sub: "#10281e" },
    { c1: "#f3dd95", c2: "#e8c866", ink: "#2b2005", sub: "#2b2005" },
    { c1: "#f0b9c1", c2: "#e39ba6", ink: "#3a1119", sub: "#3a1119" },
    { c1: "#d3cdbd", c2: "#bdb6a2", ink: "#26231b", sub: "#26231b" },
  ];
  const X = 120, W = 800, H = 150, GAP = 24, Y0 = 396;
  const tags = i.items
    .map((t, k) => {
      const [label, ...rest] = t.split(": ");
      const meaning = rest.join(": ");
      const y = Y0 + k * (H + GAP);
      const dx = [0, 40, -10, 30, 0][k];
      const rot = [-1.4, 1.2, -0.8, 1.5, -1][k];
      const d = defs[k];
      const x = X + dx;
      return `<svg style="${abs(0, 372, 1000, 982, "z-index:4;pointer-events:none")}" viewBox="0 372 1000 982" aria-hidden="true"><path d="M${x - 8} ${y + H / 2} C ${x - 50} ${y + H / 2 + 24}, 70 ${y + H / 2 - 120}, 58 ${y + H / 2 - 160 + k * 8}" fill="none" stroke="#e9dcc0" stroke-width="5" stroke-linecap="round"/><path d="M${x - 8} ${y + H / 2} C ${x - 50} ${y + H / 2 + 24}, 70 ${y + H / 2 - 120}, 58 ${y + H / 2 - 160 + k * 8}" fill="none" stroke="#a89468" stroke-width="2" stroke-dasharray="6 5" stroke-linecap="round"/></svg>
      <div style="${abs(x, y, W, H, `transform:rotate(${rot}deg);z-index:${5 + k}`)}">
        <div style="${abs(0, 0, W, H, `background:linear-gradient(${d.c1},${d.c2});clip-path:polygon(70px 0,100% 0,100% 100%,70px 100%,0 50%);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))`)}"></div>
        <div style="${abs(0, 0, W, H, `background:linear-gradient(110deg,rgba(255,255,255,.28),rgba(255,255,255,0) 45%);clip-path:polygon(70px 0,100% 0,100% 100%,70px 100%,0 50%)`)}"></div>
        <div style="${abs(0, 0, W, H, "background:repeating-linear-gradient(0deg,rgba(0,0,0,.025) 0 2px,rgba(255,255,255,.03) 2px 5px);clip-path:polygon(70px 0,100% 0,100% 100%,70px 100%,0 50%)")}"></div>
        ${eyelet(52, H / 2)}
        <div style="${abs(W - 20, 0, 0, H, "")}"></div>
        <div style="${abs(104, 14, W - 104 - 30, H - 28, `border:3px dashed ${d.ink}55;border-radius:10px`)}"></div>
        <div data-check="label${k + 1}" style="${abs(128, 22, W - 160, 62, `font:600 50px/62px 'Newsreader',serif;color:${d.ink};letter-spacing:-.01em;white-space:nowrap;overflow:hidden`)}">${esc(label)}</div>
        <div data-check="meaning${k + 1}" style="${abs(128, 86, W - 160, 44, `font:500 28px/44px 'Plex',sans-serif;color:${d.sub};white-space:nowrap;overflow:hidden`)}">${esc(meaning)}</div></div>`;
    })
    .join("");
  const ribs = Array.from({ length: 16 }, (_, k) => `<div style="${abs(k * 64 + 8, 372, 22, 982, "background:linear-gradient(90deg,rgba(0,0,0,.28),rgba(255,255,255,.14) 45%,rgba(0,0,0,.18));")}"></div>`).join("");
  const scene = `
    <div style="${abs(0, 372, 1000, 982, "background:#3f7b78")}"></div>
    ${ribs}
    ${grain(0.25, 0.9, 21)}${light(0.3, 0.3, "5,30,30")}
    <div style="${abs(0, 1296, 1000, 58, "background:linear-gradient(#2c2c30,#17171a);z-index:3;box-shadow:0 -6px 12px rgba(0,0,0,.4)")}"></div>
    <div style="${abs(20, 372, 76, 982, "background:linear-gradient(90deg,#6a3f22,#8c5a32 50%,#5a341a);z-index:3;box-shadow:0 0 14px rgba(0,0,0,.5)")}"></div>
    <div style="${abs(20, 372, 76, 982, "background:repeating-linear-gradient(180deg,transparent 0 24px,rgba(0,0,0,.35) 24px 27px);z-index:3;opacity:.0")}"></div>
    <div style="${abs(40, 1020, 36, 36, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4dca0,#a77a22);z-index:4;box-shadow:0 3px 5px rgba(0,0,0,.5)")}"></div>
    ${tags}`;
  return printable({ n: 27, scene: wrap(scene), paper: "#dcebe7" });
}

export const pins = [pin97(), pin98(), pin25(), pin27()];
