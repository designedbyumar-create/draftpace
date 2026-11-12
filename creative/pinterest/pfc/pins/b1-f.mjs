/**
 * Batch 1, module F: five guide pins in the jars, money and numbers world.
 * Every word is the idea bank's own (headline, sub, items, proof) or a label
 * that is real on the thing shown (the guide's table headings "Watch for" and
 * "Suits", a calculator's keys). The module reads the text from the bank and
 * throws if a record is not the one a scene was drawn for.
 *
 *   #81  comparison   three paper columns on green baize, a pencil and loose coins
 *   #69  checklist    a till roll on a butter terrazzo counter, a coffee mug and a jar of coins
 *   #51  how-to       five index-tab cards fanned on a forest panel over a wash desk, a passbook and a coin jar
 *   #80  how-to       a ruled sheet on graph paper, a pocket calculator and a stack of statements
 *   #34  scenario     a bank-statement slip stepping down to payday on an open ledger, a phone face down
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { pencil, mug } from "../kit/paper.mjs";
import { page, esc } from "../../v3/kit.mjs";

const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const SHADOW = "0 2px 3px rgba(20,30,20,.28),0 16px 28px rgba(20,30,20,.34)";
const POP = "#c9502f"; // a warm pop that reads as "short"
const check = (cond, msg) => { if (!cond) throw new Error(msg); };

let uid = 0;
const nid = (s) => `${s}${++uid}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
/** Example tag, at 24 px as the brief asks. */
const EXAMPLE = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 11px;background:#fffdf6;${extra}">Example</span>`;

/* ------------------------------------------------------------ props */

/** A glass jar of coins seen side-on, with a slotted forest lid. */
function jar({ x, y, w = 220, rot = 0, fill = 5, seed = 4 }) {
  const h = w * 1.36;
  const r = rng(seed);
  const coins = [];
  for (let row = 0; row < fill; row++) {
    const cy = 262 - row * 24;
    const n = row % 2 ? 3 : 4;
    for (let k = 0; k < n; k++) {
      const cx = 40 + (row % 2 ? 24 : 0) + k * 44 + (r() - 0.5) * 12;
      const tone = r() > 0.55 ? ["#e8c15a", "#c99a2c", "#f6dc8a"] : r() > 0.4 ? ["#cfd2d4", "#9ba0a4", "#eceff0"] : ["#d79a62", "#a9693a", "#efbf94"];
      coins.push(`<ellipse cx="${cx}" cy="${cy + 7}" rx="30" ry="10" fill="${tone[1]}"/><ellipse cx="${cx}" cy="${cy}" rx="30" ry="10" fill="${tone[0]}"/><ellipse cx="${cx}" cy="${cy - 1}" rx="21" ry="6" fill="none" stroke="${tone[2]}" stroke-width="2" opacity=".8"/>`);
    }
  }
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 12px rgba(20,30,20,.35))`)}" viewBox="0 0 220 300" aria-hidden="true">
    <ellipse cx="110" cy="288" rx="92" ry="9" fill="#000" opacity=".16"/>
    <rect x="18" y="52" width="184" height="234" rx="38" fill="#dcefea" fill-opacity=".42"/>
    ${coins.join("")}
    <rect x="18" y="52" width="184" height="234" rx="38" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="3"/>
    <rect x="34" y="78" width="14" height="150" rx="7" fill="#fff" opacity=".5"/>
    <rect x="176" y="96" width="6" height="90" rx="3" fill="#fff" opacity=".28"/>
    <rect x="30" y="20" width="160" height="38" rx="9" fill="${C.forest}"/>
    <rect x="30" y="20" width="160" height="10" rx="5" fill="#fff" opacity=".16"/>
    ${Array.from({ length: 12 }, (_, k) => `<rect x="${40 + k * 12.5}" y="36" width="3" height="18" fill="#000" opacity=".18"/>`).join("")}
    <rect x="76" y="10" width="68" height="14" rx="7" fill="#08281f"/></svg>`;
}

/** A pile of coins standing in stacks of different heights, side on. */
function coinStacks({ x, y, heights = [3, 5, 2], rot = 0, scale = 1 }) {
  const w = (heights.length * 64 + 8) * scale;
  const hmax = Math.max(...heights) * 14 + 30;
  const parts = [];
  heights.forEach((n, s) => {
    const tone = [["#e8c15a", "#c99a2c"], ["#cfd2d4", "#9ba0a4"], ["#d79a62", "#a9693a"]][s % 3];
    for (let k = 0; k < n; k++) {
      const cy = hmax - 14 - k * 14;
      parts.push(`<ellipse cx="${36 + s * 64}" cy="${cy + 6}" rx="28" ry="10" fill="${tone[1]}"/><ellipse cx="${36 + s * 64}" cy="${cy}" rx="28" ry="10" fill="${tone[0]}"/>`);
    }
    parts.push(`<ellipse cx="${36 + s * 64}" cy="${hmax - 14 - (n - 1) * 14 - 1}" rx="19" ry="6" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`);
  });
  return `<svg style="${at(x, y, w, hmax * scale, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,30,20,.35))`)}" viewBox="0 0 ${heights.length * 64 + 8} ${hmax}" aria-hidden="true">${parts.join("")}</svg>`;
}

/** One loose coin lying flat. */
function coin({ x, y, d = 64, tone = "#e8c15a" }) {
  return `<div style="${at(x, y, d, d, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b8,${tone} 55%,#b88a22);box-shadow:0 5px 6px rgba(20,30,20,.4),inset 0 0 0 3px rgba(255,255,255,.25)`)}"><div style="${at(d * 0.16, d * 0.16, d * 0.68, d * 0.68, "border-radius:50%;border:2px solid rgba(120,80,10,.4)")}"></div></div>`;
}

/** A spiral-less steno of speckles: terrazzo chips on a flat colour. */
function terrazzo(top, h, base, seed = 9) {
  const r = rng(seed);
  const cols = ["#d9962b", "#0d3b2e", "#e9a9b4", "#fffdf6", "#8fb5a4", "#c9502f"];
  const chips = Array.from({ length: 150 }, () => {
    const cx = r() * 1000, cy = r() * h, rx = 3 + r() * 9, ry = 2 + r() * 6;
    return `<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${cols[Math.floor(r() * cols.length)]}" opacity="${(0.35 + r() * 0.4).toFixed(2)}" transform="rotate(${Math.floor(r() * 180)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`;
  }).join("");
  return `<svg style="${at(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><rect width="1000" height="${h}" fill="${base}"/>${chips}<rect width="1000" height="${h}" fill="url(#none)"/></svg>
  <div style="${at(0, top, 1000, h, "background:radial-gradient(circle at 20% 5%,rgba(255,255,255,.28),rgba(30,20,0,.16) 100%)")}"></div>`;
}

/** Green baize: a fine woven felt with a soft light. */
const baize = (top, h) => `<div style="${at(0, top, 1000, h, `background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,transparent 2px 5px),radial-gradient(circle at 30% 10%,#2c6b50,#14473a 55%,#0a2c22)`)}"></div>`;

/* ============================================================ #81 comparison */

function splitThree() {
  const n = 81;
  const i = idea(n);
  check(i.items.length === 3 && i.items[0].startsWith("Equal:") && i.items[1].startsWith("By income:") && i.items[2].startsWith("By item:") && i.proof.length === 7, "#81: the bank's items are not the three methods");
  const [eq, inc, item] = [0, 1, 2].map((k) => i.items[k].split(":")[0]);
  const P = i.proof;
  const cols = [
    { name: eq, how: P[0], suits: P[1], watch: P[2], bar: "half" },
    { name: inc, how: P[3], watch: P[4], bar: "third", pop: true },
    { name: item, how: P[5], watch: P[6], bar: "tags" },
  ];
  const W = 292, GAP = 24, X0 = 36, TOP = 412, H = 790;
  const stackBar = (a, b) => {
    const coinStack = (cx, count, top, side, ring) => Array.from({ length: count }, (_, k) => {
      const cy = 160 - k * 13;
      return `<ellipse cx="${cx}" cy="${cy + 7}" rx="52" ry="14" fill="${side}"/><ellipse cx="${cx}" cy="${cy}" rx="52" ry="14" fill="${top}"/><ellipse cx="${cx}" cy="${cy}" rx="52" ry="14" fill="none" stroke="${ring}" stroke-opacity=".5" stroke-width="2"/>`;
    }).join("");
    return `<svg viewBox="0 0 248 176" style="width:100%;height:176px;display:block" aria-hidden="true"><ellipse cx="124" cy="170" rx="120" ry="7" fill="#000" opacity=".1"/>${coinStack(64, a, "#14573f", "#08281f", "#7fc2a5")}${coinStack(184, b, "#f0d58a", "#c39a38", "#fff")}</svg>`;
  };
  const bar = (kind) => {
    if (kind === "half") return stackBar(6, 6);
    if (kind === "third") return stackBar(8, 4);
    const tag = (t, c, tc, rot) => `<div style="position:relative;height:82px;display:grid;place-items:center;padding-left:34px;background:${c};color:${tc};border-radius:12px;font:600 28px 'Plex',sans-serif;transform:rotate(${rot}deg);box-shadow:0 3px 4px rgba(20,30,20,.25)"><span style="position:absolute;left:16px;top:33px;width:16px;height:16px;border-radius:50%;background:#fbfaf4;box-shadow:inset 0 1px 3px rgba(0,0,0,.4)"></span><span>${t}</span></div>`;
    return `<div style="display:flex;flex-direction:column;gap:12px;padding-top:2px">${tag("Rent", C.forest, "#fff", -1.5)}${tag("Utilities", C.butter, C.forestDeep, 1.5)}</div>`;
  };
  const card = (c, k) => {
    const left = X0 + k * (W + GAP);
    const rot = [-0.8, 0.6, -0.5][k];
    const lift = c.pop ? -14 : 0;
    return `<div style="${at(left, TOP + lift, W, H, `transform:rotate(${rot}deg);background:#fbfaf4;border-radius:10px;box-shadow:${SHADOW},0 36px 46px -14px rgba(0,0,0,.45);display:flex;flex-direction:column;overflow:hidden`)}">
      <div style="height:${c.pop ? 20 : 12}px;background:${c.pop ? "#d9962b" : C.forest}"></div>
      <div style="padding:24px 22px 0;display:flex;flex-direction:column;flex:1">
        <div class="serif" style="font-size:${c.name.length > 6 ? 54 : 62}px;line-height:1;font-weight:500;color:${C.forestDeep};letter-spacing:-.02em${c.pop ? `;background:linear-gradient(transparent 62%,#f4d98c 62% 92%,transparent 92%)` : ""}">${esc(c.name)}</div>
        <div style="margin-top:22px">${bar(c.bar)}</div>
        <div style="margin-top:26px;font:500 33px/1.26 'Plex',sans-serif;color:${C.ink}">${esc(c.how)}</div>
        ${c.suits ? `<div style="margin-top:20px;font:400 29px/1.26 'Plex',sans-serif;color:#44504a"><b style="font-weight:600;color:${C.forest}">Suits:</b> ${esc(c.suits)}</div>` : ""}
        <div style="margin-top:auto;padding:18px 0 26px;border-top:3px dotted ${C.rule}">
          <div style="font:600 22px 'Plex',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${c.pop ? "#a8661a" : "#5c6a63"}">Watch for</div>
          <div data-check="watch-for line ${k + 1}" style="margin-top:8px;font:400 28px/1.26 'Plex',sans-serif;color:${C.ink}">${esc(c.watch)}</div>
        </div></div></div>`;
  };
  const scene = `${baize(SCENE_TOP, 982)}
    ${cols.map(card).join("")}
    ${coinStacks({ x: 56, y: 1218, heights: [2, 3, 1], rot: 0, scale: 0.8 })}${coin({ x: 290, y: 1262, d: 60 })}${coin({ x: 340, y: 1280, d: 52, tone: "#cfd2d4" })}
    ${pencil({ x: 540, y: 1262, len: 440, rot: -5 })}`;
  return printable({ n, scene, paper: "#e4eee8" });
}

/* ============================================================ #69 checklist */

function tillRoll() {
  const n = 69;
  const i = idea(n);
  check(i.items.length === 7 && i.items[1].startsWith("Ask for a lower phone rate") && i.items[6].startsWith("Sell one thing"), "#69: the bank's items are not the seven moves");
  const W = 650, X = 36, Y = 340, H = 968, Z = 14;
  const pts = ["0 0", `${W} 0`];
  const teeth = 22;
  for (let k = 0; k <= teeth; k++) pts.push(`${(W - (k * W) / teeth).toFixed(1)} ${k % 2 ? H - Z : H}`);
  const row = (t) => `<div style="display:flex;gap:20px;align-items:flex-start;padding:15px 0;border-bottom:3px dashed #c9cfc6"><span style="flex:none;margin-top:2px;width:38px;height:38px;border:4px solid ${C.forest};border-radius:7px;background:#fffefa"></span><span data-check="checklist line" style="font:500 26px/1.26 'Plex Mono',monospace;color:#23262a">${esc(t)}</span></div>`;
  const roll = `<div style="${at(X, Y, W, H, `transform:rotate(-1deg);filter:drop-shadow(0 22px 22px rgba(60,40,0,.4))`)}">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,#f1efe6,#fffefa 12%,#fffefa 88%,#ece9de);clip-path:polygon(${pts.join(",")})"></div>
    <div style="position:absolute;left:0;right:0;top:0;bottom:${Z}px;padding:58px 34px 0 40px">
      ${i.items.map(row).join("")}
      <div style="display:flex;align-items:center;gap:20px;padding-top:22px">
        <div class="serif" style="background:${C.forest};color:#fff;font-size:62px;line-height:1;font-weight:500;padding:8px 26px 12px;border-radius:12px;letter-spacing:-.01em;box-shadow:0 5px 8px rgba(0,0,0,.3)">$200</div>
        ${EXAMPLE()}</div></div></div>`;
  const scene = `${terrazzo(SCENE_TOP, 982, "#f0e3b6")}
    ${roll}
    ${mug({ x: 726, y: 404, size: 180 })}
    ${pencil({ x: 700, y: 760, len: 300, rot: 33 })}
    ${jar({ x: 740, y: 1000, w: 220, rot: 3, fill: 5, seed: 6 })}`;
  return printable({ n, scene, paper: "#f6efd6" });
}

/* ============================================================ #51 how-to */

function emergencyFund() {
  const n = 51;
  const i = idea(n);
  check(i.items.length === 5 && i.items[0].startsWith("Open a separate savings account") && i.items[4].startsWith("Check your tightest day"), "#51: the bank's items are not the five steps");
  const tabs = ["#cfe0d6", "#c3d9cd", "#d8e6dd", "#c9ddd1", "#d2e3d9"];
  const cards = i.items.map((t, k) => {
    const top = 462 + k * 176;
    const left = 76 + (k % 2 ? 16 : 0);
    const rot = [-1.4, 1.1, -0.8, 1.3, -1][k];
    const tabLeft = 30 + ((k * 137) % 380);
    return `<div style="${at(left, top, 690, 150, `transform:rotate(${rot}deg)`)}">
      <div style="${at(tabLeft, -38, 120, 44, `background:${tabs[k]};border-radius:12px 12px 0 0;box-shadow:0 -2px 4px rgba(0,0,0,.18)`)}"></div>
      <div style="${at(0, 0, 690, 150, `background:#fffdf6;border-radius:12px;box-shadow:0 3px 4px rgba(0,0,0,.28),0 14px 22px rgba(0,0,0,.35);display:flex;align-items:center;gap:26px;padding:0 ${k === 0 ? 200 : 40}px 0 28px`)}">
        <div class="serif" style="flex:none;width:78px;height:78px;border-radius:50%;display:grid;place-items:center;font-size:48px;font-weight:600;line-height:1;background:${k === 0 ? C.butter : C.forestSoft};color:${C.forestDeep};box-shadow:${k === 0 ? "0 0 0 5px rgba(240,213,138,.45)" : "none"}">${k + 1}</div>
        <div data-check="step ${k + 1}" style="font:500 31px/1.25 'Plex',sans-serif;color:${C.ink}">${esc(t)}</div></div></div>`;
  }).join("");
  const passbook = `<div style="${at(742, 424, 214, 276, `transform:rotate(7deg)`)}">
    <div style="${at(0, 0, 214, 276, `border-radius:6px 16px 16px 6px;background:linear-gradient(135deg,#1c5a46,#0b3226);box-shadow:0 4px 5px rgba(0,0,0,.3),0 22px 30px rgba(0,0,0,.4)`)}"></div>
    <div style="${at(0, 0, 18, 276, "border-radius:6px 0 0 6px;background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.1))")}"></div>
    <div style="${at(40, 40, 140, 6, "background:#d9b25a;border-radius:3px")}"></div>
    <div style="${at(40, 56, 140, 3, "background:#d9b25a;border-radius:3px")}"></div>
    <div style="${at(36, 120, 148, 78, "background:#f6f3ea;border-radius:6px;display:grid;place-items:center;box-shadow:inset 0 0 0 3px #d9b25a")}"><span class="serif" style="font-size:30px;font-weight:500;color:${C.forestDeep}">Savings</span></div></div>`;
  const panel = `<div style="${at(36, 400, 764, 980, "border-radius:30px;background:radial-gradient(circle at 25% 8%,#1f6049,#0d3b2e 55%,#082a20);box-shadow:0 8px 12px rgba(0,0,0,.25),0 30px 40px rgba(0,0,0,.3)")}"></div>`;
  const scene = `<div style="${at(0, SCENE_TOP, 1000, 982, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.35) 0 2px,transparent 2px 7px),#d5e3db")}"></div>
    ${panel}${cards}${passbook}
    ${pencil({ x: 640, y: 770, len: 360, rot: 62 })}
    ${jar({ x: 800, y: 1040, w: 190, rot: -4, fill: 4, seed: 12 })}`;
  return printable({ n, scene, paper: C.wash });
}

/* ============================================================ #80 how-to */

function firstBudget() {
  const n = 80;
  const i = idea(n);
  check(i.items.length === 6 && i.items[4] === "Subtract." && i.items[0].startsWith("Find your take-home pay"), "#80: the bank's items are not the six steps");
  const LINE = 52;
  const steps = i.items.map((t, k) => {
    const sub = k === 4;
    return `<div style="display:flex;gap:18px;align-items:flex-start;margin-bottom:${LINE}px">
      <div class="hand" style="flex:none;width:${LINE - 6}px;height:${LINE - 6}px;margin-top:3px;border-radius:50%;border:3.5px solid ${sub ? POP : C.forest};display:grid;place-items:center;font-size:36px;font-weight:700;line-height:1;color:${sub ? POP : C.forest}">${k + 1}</div>
      <div data-check="step ${k + 1}" class="hand" style="font-size:42px;line-height:${LINE}px;font-weight:600;color:${sub ? POP : "#26334a"}${sub ? `;background:linear-gradient(transparent 52%,rgba(244,217,140,.9) 52% 90%,transparent 90%);padding:0 10px;margin-left:-6px` : ""}">${esc(t)}</div></div>`;
  }).join("");
  const sheetW = 628, sheetH = 930;
  const sheet = `<div style="${at(40, 388, sheetW, sheetH, `transform:rotate(-0.8deg);background:linear-gradient(#fffefa,#fbf8ee);border-radius:6px;box-shadow:${SHADOW},0 36px 46px -14px rgba(20,40,60,.45);overflow:hidden`)}">
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 ${LINE - 2}px,#b9cde0 ${LINE - 2}px ${LINE}px);background-position:0 18px"></div>
    <div style="${at(92, 0, 3, sheetH, "background:#e29a9a;opacity:.8")}"></div>
    <div style="position:absolute;left:112px;right:26px;top:44px">${steps}</div>
    ${Array.from({ length: 3 }, (_, k) => `<div style="${at(22, 120 + k * 330, 26, 26, "border-radius:50%;background:#c4ccd2;box-shadow:inset 0 3px 4px rgba(0,0,0,.35)")}"></div>`).join("")}</div>`;
  const keys = ["C", "÷", "×", "−", "7", "8", "9", "+", "4", "5", "6", "=", "1", "2", "3", "0"];
  const calc = `<div style="${at(706, 404, 266, 400, `transform:rotate(6deg);border-radius:26px;background:linear-gradient(160deg,#2f3f44,#1c272b);box-shadow:0 4px 6px rgba(0,0,0,.3),0 26px 36px rgba(0,0,0,.4);padding:22px`)}">
    <div class="mono" style="height:78px;border-radius:12px;background:#b7d9b0;box-shadow:inset 0 3px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:flex-end;padding:0 16px;font:500 46px 'Plex Mono',monospace;color:#1d3a22">0</div>
    <div style="margin-top:20px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${keys.map((k) => `<div class="mono" style="height:56px;border-radius:11px;display:grid;place-items:center;background:${k === "=" ? "#d9962b" : /\d/.test(k) ? "#f0efe8" : "#8fa6a0"};color:#1d1d20;font:600 28px 'Plex',sans-serif;box-shadow:0 4px 0 rgba(0,0,0,.35)">${k}</div>`).join("")}</div></div>`;
  const statementSheet = (x, y, rot, shade, top) => `<div style="${at(x, y, 232, 300, `transform:rotate(${rot}deg);background:${shade};border-radius:3px;box-shadow:0 2px 3px rgba(0,0,0,.25),0 14px 20px rgba(0,0,0,.32);padding:20px 18px`)}">${top ? `<div style="height:22px;width:110px;border-radius:4px;background:${C.forest};margin-bottom:18px"></div>${Array.from({ length: 9 }, (_, k) => `<div style="height:8px;margin-bottom:17px;width:${k % 3 === 2 ? 130 : 196}px;border-radius:4px;background:#c4cbc8"></div>`).join("")}` : ""}</div>`;
  const stack = `${statementSheet(716, 940, 5, "#f2f1ea", false)}${statementSheet(728, 934, -3, "#f7f6ef", false)}${statementSheet(722, 922, 2, "#fffefa", true)}`;
  // graph paper under everything
  const scene = `<div style="${at(0, SCENE_TOP, 1000, 982, "background:linear-gradient(rgba(255,255,255,.55) 2px,transparent 2px) 0 0/44px 44px,linear-gradient(90deg,rgba(255,255,255,.55) 2px,transparent 2px) 0 0/44px 44px,#9db7c9")}"></div>
    ${sheet}${calc}${stack}`;
  const [, rest] = [0, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:#eceff4;box-shadow:0 8px 22px rgba(20,30,50,.3);z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#eceff4;box-shadow:0 -8px 22px rgba(20,30,50,.3);z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:56px;z-index:6}
  .top h1{font:500 62px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em}
  .top p{font-size:30px;line-height:1.35;margin-top:18px;color:#3f4a5c;max-width:820px}`;
  const body = `${scene}<div class="headbar"></div><div class="footbar"></div>
    <div class="top" data-check="headline" data-bottom-max="366"><h1>${esc(rest)}</h1><p>${esc(i.sub)}</p></div>${footFor(i)}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: "#eceff4" }) };
}

/* ============================================================ #34 scenario */

function beforeBills() {
  const n = 34;
  const i = idea(n);
  check(i.items.length === 6 && i.items[0].startsWith("Rent, the 1st") && i.items[5].startsWith("Left on payday"), "#34: the bank's items are not the bills and the shortfall");
  const bills = i.items.slice(0, 5);
  const last = i.items[5];
  // the ledger: two pages, spine and red column rules
  const ledger = `<div style="${at(0, SCENE_TOP, 1000, 982, "background:linear-gradient(90deg,#dbe8d6,#eaf2e4 46%,#c9d8c3 50%,#eaf2e4 54%,#dbe8d6)")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 982, "background:repeating-linear-gradient(transparent 0 45px,#9fc5ad 45px 47px);background-position:0 10px")}"></div>
    ${[70, 90, 910, 930].map((x) => `<div style="${at(x, SCENE_TOP, 2, 982, "background:#d28080;opacity:.55")}"></div>`).join("")}
    <div style="${at(470, SCENE_TOP, 60, 982, "background:linear-gradient(90deg,transparent,rgba(30,50,30,.28) 50%,transparent)")}"></div>`;
  const stripW = 716, stripX = 252, stripY = 398;
  const chip = (t, k) => `<div style="${`margin-left:${k * 40}px;display:flex;align-items:center;gap:16px;padding:0 24px 0 18px;height:80px;border-radius:12px;background:#f1f3ee;box-shadow:inset 0 0 0 3px #dce3dc,0 3px 4px rgba(20,30,20,.15)`}">
      ${icon("minus-circle", { size: 40, color: "#a44832", weight: "duotone" })}<span data-check="bill chip" style="font:500 27px/1.15 'Plex Mono',monospace;color:#23262a;white-space:nowrap">${esc(t)}</span></div>`;
  const pts = Array.from({ length: 36 }, (_, k) => `<circle cx="${14 + k * 20}" cy="0" r="7"/>`).join("");
  const strip = `<div style="${at(stripX, stripY, stripW, 900, `background:linear-gradient(#fffefa,#fbfaf3);border-radius:4px;box-shadow:${SHADOW},0 36px 44px -14px rgba(0,0,0,.4);padding:44px 34px 0`)}">
    <svg style="${at(0, -1, stripW, 14)}" viewBox="0 0 ${stripW} 14" aria-hidden="true"><g fill="#dbe8d6">${pts}</g></svg>
    <div style="display:flex;align-items:flex-end;gap:22px;margin-bottom:26px">
      <div><div style="font:600 24px 'Plex Mono',monospace;letter-spacing:.12em;color:${C.forest}">THE 29TH</div>
      <div class="mono" style="margin-top:6px;font:500 64px/1 'Plex Mono',monospace;color:${C.forestDeep}">$1,940</div>
      <div style="margin-top:6px;font:400 27px 'Plex',sans-serif;color:#44504a">available</div></div>
      <div style="margin-bottom:46px">${EXAMPLE()}</div></div>
    <div style="display:flex;flex-direction:column;gap:14px;border-top:3px dashed #c9cfc6;padding-top:26px">${bills.map(chip).join("")}
      <div data-check="payday line" style="margin-left:200px;margin-top:12px;display:flex;align-items:center;gap:14px;padding:0 24px 0 20px;min-height:104px;border-radius:12px;background:${POP};color:#fff;box-shadow:0 6px 10px rgba(120,30,10,.4)">${icon("arrow-elbow-down-right", { size: 44, color: "#fff", weight: "bold" })}<span style="font:600 30px/1.2 'Plex',sans-serif">${esc(last)}</span></div></div></div>`;
  const cam = (x, y) => `<circle cx="${x}" cy="${y}" r="17" fill="#0f1215"/><circle cx="${x}" cy="${y}" r="10" fill="#1d2a3a"/><circle cx="${x - 3}" cy="${y - 3}" r="3" fill="#6f87a6"/>`;
  const phoneBack = `<svg style="${at(10, 790, 246, 500, "transform:rotate(-7deg);filter:drop-shadow(0 22px 20px rgba(0,0,0,.45))")}" viewBox="0 0 246 500" aria-hidden="true">
    <rect x="6" y="4" width="234" height="492" rx="40" fill="#2a2f35"/><rect x="6" y="4" width="234" height="492" rx="40" fill="none" stroke="#4b535c" stroke-width="3"/>
    <rect x="16" y="14" width="214" height="472" rx="32" fill="#1c2025"/>
    <rect x="30" y="28" width="104" height="104" rx="26" fill="#2c3239"/>${cam(62, 60)}${cam(104, 60)}${cam(83, 102)}
    <circle cx="123" cy="290" r="28" fill="#242a30"/><rect x="238" y="120" width="5" height="60" rx="2" fill="#4b535c"/><rect x="2" y="150" width="5" height="40" rx="2" fill="#4b535c"/></svg>`;
  const scene = `${ledger}${coinStacks({ x: 36, y: 420, heights: [3, 5, 2], rot: -3 })}${phoneBack}${strip}`;
  return printable({ n, scene, paper: "#efeee4" });
}

export const pins = [splitThree(), tillRoll(), emergencyFund(), firstBudget(), beforeBills()];
