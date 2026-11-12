/**
 * Batch 1, builder D: four guide pins in the phone and mail world.
 *   18 a hall wall with a printed five-rung ladder pinned to it, a console with a key bowl, a bank card and a pen
 *   10 a dusty-blue felt desk mat: six numbered steps down a sheet, a stack of printed statements, envelopes, a mug
 *   50 a slate leather desk pad: a ruled sheet with three payoff bars, a wallet with bank cards, a sticky note
 *   48 a blush gingham table: a statement sheet with one $90 payment bar, a phone face down, an opened envelope
 * Every word is the idea bank's own (headline, sub, items, proof). The only words set here that are not a cut
 * of the bank text: the bar labels "interest" / "months" are the items' own words, "Example" is the kit tag.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const exampleCss = `.example{font-size:24px;letter-spacing:.1em;color:#1d1d20;background:#fffdf6;border:2px solid #1d1d20;padding:5px 12px;border-radius:6px}`;
/** "when | what" items of the bank */
const split = (s) => { const k = s.indexOf(" | "); return [s.slice(0, k), s.slice(k + 3)]; };

/** A strip of washi tape centred on (x, y). */
function tape(x, y, w = 150, rot = -4, color = "rgba(233,169,180,.85)") {
  return `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.35) 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:4;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A brass key, head at (0,0) in its own box. */
function key(x, y, rot, color = "#cfa24a") {
  return `<svg style="${abs(x, y, 120, 34, `transform:rotate(${rot}deg);z-index:6;filter:drop-shadow(0 4px 3px rgba(20,10,5,.4))`)}" viewBox="0 0 120 34" aria-hidden="true"><circle cx="17" cy="17" r="15" fill="${color}"/><circle cx="17" cy="17" r="6" fill="#00000040"/><circle cx="12" cy="11" r="5" fill="#fff" opacity=".25"/><rect x="30" y="13" width="84" height="8" rx="3" fill="${color}"/><rect x="84" y="20" width="9" height="11" fill="${color}"/><rect x="99" y="20" width="9" height="8" fill="${color}"/><rect x="30" y="13" width="84" height="3" fill="#fff" opacity=".28"/></svg>`;
}

/** A blank bank card: colour, chip, a stripe, no printing at all. */
function bankCard({ x, y, w = 190, rot = 0, a = C.forest, b = C.forestDeep, stripe = false, z = 3 }) {
  const h = Math.round(w * 0.63);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:${w * 0.07}px;background:linear-gradient(135deg,${a},${b});box-shadow:0 2px 3px rgba(0,0,0,.3),0 14px 20px rgba(10,5,2,.4);z-index:${z};overflow:hidden`)}">
    <div style="${abs(w * 0.09, h * 0.3, w * 0.17, h * 0.2, "border-radius:5px;background:linear-gradient(135deg,#f0d58a,#c79a3b)")}"></div>
    ${stripe ? `<div style="${abs(0, h * 0.14, w, h * 0.2, "background:#15130f")}"></div>` : `<div style="${abs(w * 0.09, h * 0.74, w * 0.5, 5, "border-radius:3px;background:rgba(255,255,255,.35)")}"></div><div style="${abs(w * 0.09, h * 0.84, w * 0.28, 5, "border-radius:3px;background:rgba(255,255,255,.25)")}"></div>`}
    <div style="${abs(-w * 0.2, -h * 0.5, w * 0.9, h * 0.7, "background:linear-gradient(120deg,rgba(255,255,255,.2),rgba(255,255,255,0));transform:rotate(-12deg)")}"></div></div>`;
}

/** A ballpoint pen lying flat. */
function pen({ x, y, len = 320, rot = 0, body = "#1f3a57" }) {
  return `<svg style="${abs(x, y, len, 24, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 5px rgba(20,10,5,.4))`)}" viewBox="0 0 ${len} 24" aria-hidden="true"><rect x="40" y="3" width="${len - 56}" height="18" rx="8" fill="${body}"/><rect x="40" y="4" width="${len - 56}" height="5" rx="3" fill="#fff" opacity=".28"/><rect x="${len - 120}" y="6" width="100" height="5" rx="2.5" fill="#c9ccd2"/><path d="M40 3 L8 11 L8 13 L40 21 Z" fill="#cfd2d8"/><path d="M12 11 L2 12 L12 13 Z" fill="#222"/></svg>`;
}

/** A closed envelope seen from the front (address lines, a blank stamp) or from the back (the flap). */
function envelope({ x, y, w = 270, rot = 0, color = "#f6f1e3", back = false, z = 2, tint = "#e3dcc8" }) {
  const h = Math.round(w * 0.64);
  const inner = back
    ? `<svg style="${abs(0, 0, w, h)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M0 0 L${w / 2} ${h * 0.62} L${w} 0" fill="${tint}" stroke="#00000022" stroke-width="2"/><path d="M0 ${h} L${w * 0.42} ${h * 0.46} M${w} ${h} L${w * 0.58} ${h * 0.46}" stroke="#00000018" stroke-width="2" fill="none"/></svg>`
    : `<div style="${abs(w * 0.1, h * 0.46, w * 0.5, 6, "background:#9a968a;border-radius:3px")}"></div><div style="${abs(w * 0.1, h * 0.6, w * 0.4, 6, "background:#b6b2a6;border-radius:3px")}"></div><div style="${abs(w * 0.1, h * 0.74, w * 0.46, 6, "background:#b6b2a6;border-radius:3px")}"></div>
      <div style="${abs(w * 0.76, h * 0.1, w * 0.15, h * 0.24, `background:${C.forestSoft};border:3px dotted #fff;outline:2px solid ${C.forest}55;outline-offset:-5px`)}"></div>
      <div style="${abs(w * 0.58, h * 0.14, w * 0.16, w * 0.16, "border:3px solid #8a867a55;border-radius:50%")}"></div>`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${color};border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.25),0 12px 18px rgba(20,10,5,.35);z-index:${z}`)}">${inner}</div>`;
}

/** A pile of printed statements: sheets with a forest header bar, grey lines and a table of short bars. */
function statements({ x, y, w = 250, n = 5, rot = 4, z = 1 }) {
  const h = Math.round(w * 1.3);
  const r = seeded(7);
  const sheets = Array.from({ length: n }, (_, k) => {
    const dx = (r() - 0.5) * 22, dy = -k * 6 + (r() - 0.5) * 6, rr = (r() - 0.5) * 7;
    const top = k === n - 1;
    const lines = top
      ? Array.from({ length: 9 }, (_, j) => `<div style="${abs(w * 0.1, h * 0.3 + j * 22, j % 3 === 2 ? w * 0.5 : w * 0.8, 5, "background:#c9c6bc;border-radius:3px")}"></div><div style="${abs(w * 0.78, h * 0.3 + j * 22, w * 0.12, 5, "background:#9c998d;border-radius:3px")}"></div>`).join("")
      : "";
    return `<div style="${abs(dx, dy, w, h, `transform:rotate(${rr}deg);background:#fdfcf8;box-shadow:0 1px 2px rgba(0,0,0,.25),0 8px 12px rgba(20,10,5,.2)`)}">${top ? `<div style="${abs(0, 0, w, h * 0.12, `background:${C.forest}`)}"></div><div style="${abs(w * 0.1, h * 0.17, w * 0.4, 8, "background:#6b685f;border-radius:4px")}"></div>${lines}` : ""}</div>`;
  }).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">${sheets}</div>`;
}

/* ------------------------------------------------------------------ #18 */

function pin18() {
  const i = idea(18);
  const rungs = i.items.map(split);
  const PX = 50, PY = 396, PW = 900, PH = 836;
  const RAIL = 20, BAR = 58, BLOCK = 150, GAP = 8, TOP = 26, PX0 = 58; // PX0: where the rungs start, inside the rails
  const bars = rungs
    .map(([when, what], k) => {
      const y = TOP + k * (BLOCK + GAP);
      const shade = `color-mix(in srgb, ${C.forest} ${58 + k * 10.5}%, #5f8f7b)`;
      return `
      <div style="${abs(PX0, y, PW - 2 * PX0, BAR, `background:${shade};border-radius:8px;box-shadow:0 3px 0 rgba(0,0,0,.18);display:flex;align-items:center;gap:16px;padding:0 20px 0 14px`)}">
        <div style="width:40px;height:40px;border-radius:50%;background:${C.cream};color:${C.forest};font:600 26px/40px 'Newsreader',serif;text-align:center;flex:none">${k + 1}</div>
        <div style="font:600 28px/1.1 'Plex',sans-serif;color:#fff;white-space:nowrap">${esc(when)}</div></div>
      <div data-check="step" style="${abs(PX0 + 14, y + BAR + 6, PW - 2 * PX0 - 28, BLOCK - BAR - 8, "display:flex;align-items:center;font:500 28px/1.28 'Plex',sans-serif;color:#1d1d20;overflow:hidden")}">${esc(what)}</div>
      ${[PX0 - 6, PW - PX0 - 6].map((cx) => `<div style="${abs(cx, y + BAR / 2 - 6, 12, 12, "border-radius:50%;background:#c99b66;box-shadow:inset 0 -2px 2px rgba(0,0,0,.3)")}"></div>`).join("")}`;
    })
    .join("");
  const poster = `<div data-check="page" style="${abs(PX, PY, PW, PH, "background:#fbf8ef;transform:rotate(-.5deg);box-shadow:0 2px 3px rgba(10,30,20,.3),0 24px 40px rgba(10,30,20,.4);z-index:2;border-radius:3px")}">
    <div style="${abs(34, 14, RAIL, PH - 28, `background:linear-gradient(90deg,${C.forestDeep},${C.forest});border-radius:10px`)}"></div>
    <div style="${abs(PW - 34 - RAIL, 14, RAIL, PH - 28, `background:linear-gradient(90deg,${C.forest},${C.forestDeep});border-radius:10px`)}"></div>
    ${bars}</div>`;
  const wall = `
  <div style="${abs(0, 0, 1000, 1500, "background:linear-gradient(100deg,#bdd0c3,#a9c0b0 60%,#9bb4a3)")}"></div>
  <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 22% 18%,rgba(255,255,255,.35),rgba(255,255,255,0) 60%)")}"></div>
  <div style="${abs(0, 1206, 1000, 40, `background:linear-gradient(#f4f0e6,#ddd6c6);box-shadow:0 4px 8px rgba(0,0,0,.2)`)}"></div>`;
  const consoleTop = desk({ top: 1246, height: 254, planks: 3, base: "#c99b66", dark: "#b88a54", seed: 11 }) +
    `<div style="${abs(0, 1246, 1000, 6, "background:rgba(255,255,255,.3)")}"></div>`;
  // the key bowl (seen from above) with keys, a bank card and a pen on the console
  const bowl = `<svg style="${abs(690, 1250, 270, 112, "filter:drop-shadow(0 14px 10px rgba(30,15,5,.45));z-index:5")}" viewBox="0 0 270 112" aria-hidden="true">
    <ellipse cx="135" cy="58" rx="128" ry="46" fill="#efe9db"/><ellipse cx="135" cy="58" rx="128" ry="46" fill="none" stroke="#00000018" stroke-width="3"/>
    <ellipse cx="135" cy="54" rx="104" ry="34" fill="#d3ccba"/><ellipse cx="135" cy="58" rx="98" ry="30" fill="#bdb5a1"/>
    <path d="M30 40 C 70 24, 200 24, 240 42" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="4"/></svg>
    ${key(742, 1272, -14, "#cfa24a")}${key(790, 1296, 12, "#b9bcc2")}${key(820, 1270, -4, "#d8b25e")}
    <div style="${abs(842, 1282, 54, 54, `border:6px solid #b9bcc2;border-radius:50%;z-index:6;filter:drop-shadow(0 3px 2px rgba(0,0,0,.4))`)}"></div>`;
  const props = `${bankCard({ x: 70, y: 1268, w: 190, rot: -8, z: 5 })}${bankCard({ x: 150, y: 1286, w: 190, rot: 5, a: "#f2efe6", b: "#d6d1c2", stripe: true, z: 4 })}${pen({ x: 400, y: 1300, len: 300, rot: -3 })}`;
  const scene = wall + poster + tape(72, 404, 130, -38, "rgba(240,213,138,.85)") + tape(928, 406, 130, 36, "rgba(233,169,180,.85)") + consoleTop + props + bowl;
  return printable({ n: 18, scene, paper: "#e9efe9", extraCss: exampleCss + ".top h1{font-size:56px}" });
}

/* ------------------------------------------------------------------ #10 */

function pin10() {
  const i = idea(10);
  const steps = i.items;
  const SX = 56, SY = 400, SW = 740, SH = 792;
  const ROWH = [136, 100, 70, 136, 100, 70];
  const total = ROWH.reduce((a, b) => a + b, 0);
  const pad = (SH - 40 - total) / (steps.length - 1);
  let yy = 24;
  const rows = steps
    .map((s, k) => {
      const y = yy;
      yy += ROWH[k] + pad;
      return `
      <div style="${abs(34, y, 60, 60, `border-radius:50%;background:${C.forest};color:#fff;font:600 36px/60px 'Newsreader',serif;text-align:center;box-shadow:0 3px 0 rgba(0,0,0,.2)`)}">${k + 1}</div>
      <div data-check="step" style="${abs(116, y - 4, SW - 116 - 34, ROWH[k] + 8, "display:flex;align-items:center;font:500 28px/1.3 'Plex',sans-serif;color:#1d1d20;overflow:hidden")}">${esc(s)}</div>
      ${k < steps.length - 1 ? `<div style="${abs(34, y + ROWH[k] + pad / 2 + 2, SW - 68, 2, "background:#dcd8cc")}"></div>` : ""}`;
    })
    .join("");
  const sheet = `<div data-check="page" style="${abs(SX, SY, SW, SH, "background:#fdfcf8;transform:rotate(-1.4deg);transform-origin:50% 50%;box-shadow:0 2px 3px rgba(10,25,40,.3),0 24px 40px rgba(10,25,40,.45);z-index:3;border-radius:3px")}">${rows}</div>`;
  const felt = `<div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 30% 25%,#8aa6ba,#6a8aa0 55%,#52708a)")}"></div>
    <svg style="${abs(0, 0, 1000, 1500, "opacity:.5;mix-blend-mode:multiply")}" aria-hidden="true"><filter id="fl"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .4  0 0 0 0 .5  0 0 0 .55 0"/></filter><rect width="1000" height="1500" filter="url(#fl)"/></svg>`;
  const props = `
    ${statements({ x: 770, y: 392, w: 230, n: 6, rot: 6, z: 1 })}
    ${envelope({ x: 790, y: 700, w: 240, rot: 12, color: "#efe3c4", back: true, tint: "#e2d3aa", z: 1 })}
    ${envelope({ x: 60, y: 1218, w: 270, rot: -5, z: 4 })}
    ${envelope({ x: 300, y: 1236, w: 250, rot: 4, back: true, color: "#f9f6ee", z: 3 })}
    ${envelope({ x: 480, y: 1214, w: 260, rot: -9, color: "#d9bf93", tint: "#c7a974", z: 3, back: true })}
    ${mug({ x: 760, y: 1110, size: 190 })}`;
  const scene = felt + sheet + props;
  return printable({ n: 10, scene, paper: "#e8eef2", extraCss: exampleCss });
}

/* ------------------------------------------------------------------ #50 */

function pin50() {
  const i = idea(50);
  const SX = 80, SY = 404, SW = 840, SH = 836;
  const exampleLine = i.proof[i.proof.length - 1];
  const rowsData = [
    { label: "$90 (the minimum, held level)", months: "56 months", cost: "$1,993", m: 56, fill: "#a7a7a2", ink: "#4d4d49" },
    { label: "$140 ($50 extra)", months: "29 months", cost: "$957", m: 29, fill: "#5f927d", ink: "#2f5c4a" },
    { label: "$290 ($200 extra)", months: "12 months", cost: "$395", m: 12, fill: C.forest, ink: C.forest },
  ];
  const MAXW = 450, X0 = 50, PITCH = 245;
  const rows = rowsData
    .map((r, k) => {
      const y = 100 + k * PITCH;
      const bw = Math.round((MAXW * r.m) / 56);
      return `
      <div data-check="label" style="${abs(X0, y, 740, 40, "font:600 30px/40px 'Plex',sans-serif;color:#1d1d20;white-space:nowrap")}">${esc(r.label)}</div>
      <div style="${abs(X0, y + 54, bw, 110, `background:linear-gradient(${r.fill},${r.fill});border-radius:10px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.14),0 3px 6px rgba(0,0,0,.18)`)}"></div>
      <div data-check="figure" style="${abs(X0 + bw + 22, y + 52, SW - X0 - bw - 22 - 24, 116, "display:flex;flex-direction:column;justify-content:center;gap:2px;white-space:nowrap;overflow:hidden")}">
        <div style="font:600 30px/1.15 'Plex',sans-serif;color:#1d1d20">${esc(r.months)}</div>
        <div style="color:${r.ink}"><span style="font:600 44px/1.1 'Newsreader',serif">${esc(r.cost)}</span><span style="font:500 28px 'Plex',sans-serif"> interest</span></div></div>
      ${k < 2 ? `<div style="${abs(X0, y + PITCH - 40, SW - 2 * X0, 2, "background:#d9d6cc")}"></div>` : ""}`;
    })
    .join("");
  const ruledBg = "repeating-linear-gradient(#fdfcf8 0 51px,#d8e1e6 51px 53px)";
  const sheet = `<div data-check="page" style="${abs(SX, SY, SW, SH, `background:${ruledBg};transform:rotate(1deg);box-shadow:0 2px 3px rgba(0,0,0,.4),0 26px 44px rgba(0,0,0,.55);z-index:3;border-radius:3px`)}">
    <div style="${abs(0, 0, SW, 12, `background:${C.forest}`)}"></div>
    <div style="${abs(40, 34, SW - 80, 50, "display:flex;justify-content:flex-end;align-items:center")}"><span class="example">Example</span></div>
    ${rows}</div>`;
  const desktop = `<div style="${abs(0, 0, 1000, 1500, "background:linear-gradient(120deg,#41484e,#2c3237 60%,#23282c)")}"></div>
    <svg style="${abs(0, 0, 1000, 1500, "opacity:.55;mix-blend-mode:overlay")}" aria-hidden="true"><filter id="lt"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .7 0"/></filter><rect width="1000" height="1500" filter="url(#lt)"/></svg>
    <div style="${abs(20, 380, 960, 960, "border:3px dashed rgba(255,255,255,.12);border-radius:26px")}"></div>`;
  const sticky = `<div data-check="note" style="${abs(40, 1224, 600, 112, "background:linear-gradient(#f7de8e,#f0d072);transform:rotate(-2deg);box-shadow:0 2px 3px rgba(0,0,0,.3),0 14px 18px rgba(0,0,0,.45);z-index:6;padding:16px 26px 14px;display:flex;align-items:center;font:600 33px/1.12 'Hand',cursive;color:#2c2512;overflow:hidden")}">${esc(exampleLine)}</div>`;
  const wallet = `
    <div style="${abs(696, 1212, 150, 94, "z-index:4")}"></div>
    ${bankCard({ x: 726, y: 1170, w: 210, rot: -7, a: "#3d6f5d", b: C.forest, z: 4 })}
    ${bankCard({ x: 770, y: 1196, w: 210, rot: 6, a: "#f2efe6", b: "#d6d1c2", stripe: true, z: 4 })}
    <div style="${abs(660, 1250, 340, 230, "background:linear-gradient(160deg,#b36a37,#80461f);border-radius:26px 0 0 26px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 26px 34px rgba(0,0,0,.6);z-index:5")}">
      <div style="${abs(14, 14, 326, 202, "border:3px dashed rgba(255,225,180,.5);border-radius:16px 0 0 16px")}"></div>
      <div style="${abs(0, 44, 340, 8, "background:rgba(0,0,0,.25)")}"></div>
      <div style="${abs(270, 96, 90, 52, "background:linear-gradient(#c88650,#9a5a2c);border-radius:26px 0 0 26px;box-shadow:0 4px 6px rgba(0,0,0,.4)")}"></div>
      <div style="${abs(292, 112, 20, 20, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f3e1a8,#b98a2e)")}"></div></div>`;
  const scene = desktop + sheet + sticky + wallet;
  return printable({ n: 50, scene, paper: "#eeebe4", extraCss: exampleCss });
}

/* ------------------------------------------------------------------ #48 */

function pin48() {
  const i = idea(48);
  const [balance, twelfth, split60] = i.items;
  const SX = 90, SY = 400, SW = 820, SH = 770;
  const exampleLine = i.proof[i.proof.length - 1];
  void exampleLine; void split60;
  const BARX = 46, BARW = SW - 2 * BARX, F = Math.round((BARW * 60) / 90);
  const cardW = 250, cardH = 158;
  const card = `<div style="${abs(BARX, 80, cardW, cardH, `border-radius:18px;background:linear-gradient(135deg,#1b5a47,${C.forestDeep});box-shadow:0 2px 3px rgba(0,0,0,.3),0 14px 22px rgba(10,30,20,.4);overflow:hidden`)}">
      <div style="${abs(22, 24, 44, 34, "border-radius:6px;background:linear-gradient(135deg,#f0d58a,#c79a3b)")}"></div>
      <div data-check="figure" style="${abs(22, 84, cardW - 40, 56, "font:600 50px/56px 'Newsreader',serif;color:#fff;white-space:nowrap")}">${esc(balance.split(" ")[0])}</div>
      <div style="${abs(-40, -90, 260, 140, "background:linear-gradient(120deg,rgba(255,255,255,.18),rgba(255,255,255,0));transform:rotate(-14deg)")}"></div></div>
    <div data-check="figure" style="${abs(BARX + cardW + 34, 80, BARW - cardW - 34, cardH, "display:flex;align-items:center;font:600 34px/1.2 'Plex',sans-serif;color:#1d1d20")}">${esc(balance.split(" ").slice(1).join(" "))}</div>`;
  const callout = `<div data-check="note" style="${abs(BARX, 288, BARW, 132, `background:#f6eed0;border-left:8px solid ${C.forest};border-radius:6px;padding:0 28px;display:flex;align-items:center;font:500 30px/1.3 'Plex',sans-serif;color:#1d1d20;box-shadow:0 2px 4px rgba(0,0,0,.15);overflow:hidden`)}">${esc(twelfth)}</div>
    <div style="${abs(BARX + 150, 418, 44, 30, `background:#f6eed0;clip-path:polygon(0 0,100% 0,50% 100%)`)}"></div>`;
  const label = `<div style="${abs(BARX, 462, BARW, 44, "display:flex;align-items:center;gap:14px")}"><div style="font:600 32px 'Plex',sans-serif;color:#1d1d20;white-space:nowrap">Your First $90</div><div style="flex:1;height:14px;border:3px solid #1d1d20;border-bottom:none;border-radius:6px 6px 0 0;margin-top:14px"></div></div>`;
  const bar = `<div style="${abs(BARX, 516, F, 176, `background:linear-gradient(${C.forest},${C.forestDeep});border-radius:12px 0 0 12px;box-shadow:0 4px 8px rgba(0,0,0,.25)`)}"></div>
    <div data-check="figure" style="${abs(BARX, 516, F, 176, "display:flex;flex-direction:column;justify-content:center;padding-left:34px;color:#fff;overflow:hidden")}"><div style="font:600 80px/1 'Newsreader',serif">$60</div><div style="font:600 30px/1.2 'Plex',sans-serif;margin-top:6px">covers that interest</div></div>
    <div style="${abs(BARX + F, 516, BARW - F, 176, `background:${C.forestSoft};border:4px solid ${C.forest};border-left:none;border-radius:0 12px 12px 0`)}"></div>
    <div data-check="figure" style="${abs(BARX + F, 516, BARW - F, 176, `display:flex;flex-direction:column;justify-content:center;padding-left:22px;color:${C.forestDeep};overflow:hidden`)}"><div style="font:600 80px/1 'Newsreader',serif">$30</div><div style="font:600 26px/1.2 'Plex',sans-serif;margin-top:6px">reduces what<br>you owe</div></div>`;
  const ruledBg = "repeating-linear-gradient(#fffdf8 0 47px,#e3e8ea 47px 49px)";
  const sheet = `<div data-check="page" style="${abs(SX, SY, SW, SH, `background:${ruledBg};transform:rotate(-1.2deg);box-shadow:0 2px 3px rgba(60,20,20,.3),0 24px 40px rgba(60,20,20,.4);z-index:3;border-radius:3px`)}">
    <div style="${abs(0, 0, SW, 12, `background:${C.forest}`)}"></div>
    <div style="${abs(SW - 36 - 150, 30, 150, 44, "display:flex;justify-content:flex-end")}"><span class="example">Example</span></div>
    ${card}${callout}${label}${bar}</div>`;
  const table = `<div style="${abs(0, 0, 1000, 1500, "background:#e9c9c8")}"></div>
    <div style="${abs(0, 0, 1000, 1500, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.34) 0 56px,rgba(255,255,255,0) 56px 112px),repeating-linear-gradient(90deg,rgba(255,255,255,.34) 0 56px,rgba(255,255,255,0) 56px 112px)")}"></div>
    <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 25% 20%,rgba(255,255,255,.25),rgba(120,50,60,.18) 100%)")}"></div>`;
  // an opened envelope with a slip pulled half out, a brass letter-opener, a phone face down
  const open = `<div style="${abs(40, 1196, 340, 230, "transform:rotate(-4deg);z-index:4")}">
    <svg style="${abs(0, 0, 340, 230, "filter:drop-shadow(0 14px 14px rgba(70,20,30,.4))")}" viewBox="0 0 340 230" aria-hidden="true">
      <path d="M0 70 L170 -20 L340 70 Z" fill="#e8e0cb"/><rect x="0" y="70" width="340" height="170" rx="4" fill="#f7f2e4"/>
      <rect x="34" y="34" width="272" height="150" fill="#fffdf8"/><rect x="58" y="62" width="150" height="8" rx="4" fill="#cfcbc0"/><rect x="58" y="86" width="210" height="8" rx="4" fill="#d9d6cc"/><rect x="58" y="110" width="180" height="8" rx="4" fill="#d9d6cc"/>
      <path d="M0 70 L170 164 L340 70 L340 240 L0 240 Z" fill="#efe8d6"/><path d="M0 240 L130 136 M340 240 L210 136" stroke="#00000014" stroke-width="2" fill="none"/>
    </svg></div>`;
  const opener = `<svg style="${abs(420, 1262, 330, 40, "transform:rotate(-6deg);filter:drop-shadow(0 8px 6px rgba(70,20,30,.45));z-index:5")}" viewBox="0 0 330 40" aria-hidden="true"><path d="M0 20 L220 6 Q238 6 238 20 Q238 34 220 34 Z" fill="#d6a948"/><path d="M0 20 L220 6 Q238 6 238 12 L0 20 Z" fill="#fff" opacity=".35"/><rect x="236" y="10" width="92" height="20" rx="10" fill="#8a3b34"/><rect x="236" y="12" width="92" height="6" rx="3" fill="#fff" opacity=".25"/></svg>`;
  const ph = `<div style="${abs(770, 1190, 220, 420, "transform:rotate(7deg);border-radius:44px;background:linear-gradient(150deg,#3b3d44,#1f2025);box-shadow:inset 0 0 0 3px #4a4c55,0 2px 4px rgba(0,0,0,.4),0 26px 34px rgba(70,20,30,.55);z-index:5")}">
    <div style="${abs(18, 18, 100, 100, "border-radius:26px;background:linear-gradient(150deg,#52555e,#2b2c32);box-shadow:inset 0 0 0 2px #5d606a")}">
      ${[[14, 14], [14, 56], [56, 34]].map(([lx, ly]) => `<div style="${abs(lx, ly, 32, 32, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#4a5a78,#0b0b10 70%);box-shadow:0 0 0 4px #1a1b20,0 0 0 6px #5d606a")}"></div>`).join("")}</div></div>`;
  const scene = table + sheet + open + opener + ph;
  return printable({ n: 48, scene, paper: "#f4e8e5", extraCss: exampleCss });
}

export const pins = [pin18(), pin10(), pin50(), pin48()];
