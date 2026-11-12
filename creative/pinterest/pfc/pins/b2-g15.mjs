/**
 * Batch 2, group G15: seven app promos for Personal Finance Companion.
 * Every screen is a real capture from out/pfc/assets (or the real Debt screen), cropped and placed, never redrawn.
 * Words are the bank's own (display lines are cuts of each headline; feature rows are cuts of the idea's items or sub;
 * the only other words are labels real on the screen shown: "Payday", "Bill", "Keep", "Still deciding",
 * "Planned to cancel", "Cancelled").
 *
 *   #54  debt payoff     deep pine teal, wave 1, phone leaning left, the toggle + result crop of the Debt screen, a mug and coins
 *   #13  Available Money berry, wave 2, two phones cascading (banner, then the working), sticky notes and a pencil
 *   #17  coming up       plum / midnight green, wave 0, phone leaning right, a 14-box strip, a face-down calendar page and a pen
 *   #21  subscriptions   moss, wave 1 mirrored (phone on the left), the four decision cards, a receipt pair
 *   #19  statement       slate-blue linen, a printed half-page of the statement on a table with two mugs and a sticky note
 *   #31  myth vs truth   split card, faded paper left / forest right with the working phone, a receipt and a pen
 *   #67  emergency fund  emerald, wave 2, whole Savings screen, kraft envelope and a pen
 */
import { promo } from "../kit/promo.mjs";
import { printable } from "../kit/printable.mjs";
import { screen, asset } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";
import { mug, pencil, binderClip } from "../kit/paper.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SOFT = "drop-shadow(0 14px 10px rgba(2,12,8,.5))";
const APP_BG = "#f3f4f3"; // the app's own background colour in the captures

/* ------------------------------------------------------------------ props */

/** A pen lying at an angle. */
function pen({ x, y, len = 320, rot = -20, body = "#1f5a49", shadow = "rgba(2,12,8,.45)" }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px ${shadow})`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="52" y="6" width="${len - 70}" height="22" rx="10" fill="${body}"/>
    <rect x="52" y="6" width="${len - 70}" height="7" rx="3.5" fill="#fff" opacity=".28"/>
    <rect x="${len - 150}" y="3" width="110" height="5" rx="2.5" fill="#d9dde2"/>
    <rect x="${len - 28}" y="9" width="14" height="16" rx="4" fill="#d9dde2"/>
    <path d="M52 6 L8 15 L8 19 L52 28 Z" fill="#c9ced6"/><path d="M12 16 L2 17 L12 18 Z" fill="#33363b"/>
  </svg>`;
}

/** A short stack of coins and one leaning on it (from the side). No marks. */
function coins({ x, y, w = 200, rot = 0 }) {
  const coin = (cx, cy, rx = 60) => `<g><rect x="${cx - rx}" y="${cy}" width="${rx * 2}" height="14" rx="7" fill="#b9831f"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.34}" fill="#e4b341"/><ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.78}" ry="${rx * 0.26}" fill="none" stroke="#b9831f" stroke-width="3"/><rect x="${cx - rx}" y="${cy}" width="${rx * 2}" height="14" rx="7" fill="none"/></g>`;
  const stack = (cx, base, n) => Array.from({ length: n }, (_, k) => coin(cx, base - k * 15)).join("");
  return `<svg style="${abs(x, y, w, w * 0.8, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 250 200" aria-hidden="true">
    ${stack(78, 160, 6)}${stack(172, 172, 3)}
    <g transform="rotate(-24 196 98)">${coin(196, 112, 52)}</g></svg>`;
}

/** A pad of butter sticky notes, blank, one peeling. */
function stickyPad({ x, y, w = 200, rot = -6, color = "#f4d56b" }) {
  return `<svg style="${abs(x, y, w, w, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 200 200" aria-hidden="true">
    <rect x="22" y="30" width="150" height="150" fill="${color}" opacity=".78" transform="rotate(5 97 105)"/>
    <rect x="22" y="30" width="150" height="150" fill="${color}" transform="rotate(-2 97 105)"/>
    <rect x="22" y="30" width="150" height="30" fill="#fff" opacity=".26" transform="rotate(-2 97 105)"/>
    <path d="M22 168 L172 172 L172 180 L22 176 Z" fill="#000" opacity=".1"/></svg>`;
}

/** A desk-calendar page turned face-down: the blank back of a leaf with its punched spiral holes along the top. */
function calendarBack({ x, y, w = 260, rot = 7 }) {
  const holes = Array.from({ length: 9 }, (_, k) => `<circle cx="${32 + k * 24}" cy="22" r="6" fill="#0b2a20" opacity=".55"/><circle cx="${32 + k * 24}" cy="21" r="6" fill="none" stroke="#fff" stroke-opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, w, w * 0.78, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 260 203" aria-hidden="true">
    <rect x="12" y="6" width="236" height="190" rx="6" fill="#ece5d3"/><rect x="12" y="6" width="236" height="190" rx="6" fill="none" stroke="#000" stroke-opacity=".12"/>
    <rect x="12" y="6" width="236" height="44" rx="6" fill="#d9d0b8"/>${holes}
    <rect x="12" y="170" width="236" height="26" fill="#000" opacity=".05"/></svg>`;
}

/** Two paper receipts (zig-zag foot, blank grey bars), lying crossed. */
function receiptPair({ x, y, w = 260, rot = 6 }) {
  const slip = (tx, r, fill) => `<g transform="translate(${tx} 0) rotate(${r} 70 150)"><path d="M0 0 H140 V270 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 Z" fill="${fill}"/><path d="M0 0 H140 V270 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 l-10 12 l-10 -12 Z" fill="none" stroke="#000" stroke-opacity=".1"/>
    <g fill="#c8c2b2"><rect x="18" y="26" width="70" height="8" rx="4"/><rect x="18" y="50" width="104" height="8" rx="4"/><rect x="18" y="74" width="92" height="8" rx="4"/><rect x="18" y="98" width="104" height="8" rx="4"/><rect x="18" y="150" width="60" height="8" rx="4"/><rect x="82" y="190" width="40" height="10" rx="5"/></g></g>`;
  return `<svg style="${abs(x, y, w, w * 1.2, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 260 312" aria-hidden="true">${slip(12, -9, "#f1ede2")}${slip(100, 7, "#fbf9f2")}</svg>`;
}

/** A kraft envelope, flap down, blank, with a butter band. */
function envelope({ x, y, w = 330, rot = -8 }) {
  return `<svg style="${abs(x, y, w, w * 0.68, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 330 225" aria-hidden="true">
    <rect x="6" y="6" width="318" height="213" rx="7" fill="#c9a574"/>
    <path d="M6 6 L165 128 L324 6" fill="none" stroke="#9a7a4c" stroke-width="3"/>
    <path d="M6 219 L130 108 M324 219 L200 108" stroke="#9a7a4c" stroke-width="2.5" opacity=".7"/>
    <path d="M6 6 H324 L165 130 Z" fill="#d6b788"/><path d="M6 6 H324 L165 130 Z" fill="none" stroke="#000" stroke-opacity=".1"/>
    <circle cx="165" cy="124" r="11" fill="#9b2f2f"/><circle cx="165" cy="124" r="6" fill="#b84444"/></svg>`;
}

/** Tint a promo's panel (in its greens) and re-colour the headline highlight and the wave. */
const tint = ({ a, b, c, hi, wave, angle = 158 }) => `
  .pin{background:linear-gradient(${angle}deg,${a} 0%,${b} 46%,${c} 100%)!important}
  .display .hi{color:${hi}!important}
  .wave stop{stop-color:${wave}!important}`;

/** A promo phone placed under the headline the way promo() does, but with the Next.js badge / "Add" bar cropped out by a cut. */
const MIRROR = (x) => `.wave{transform:scaleX(-1)}.feats{left:${x}px!important}`;

/* ----------------------------------------------------------------- #54 */
// The Debt screen again, but the other end of it: the Smallest balance / Highest rate toggle and the "Debt-free in ..." result
// (capture y 836 down, below the "Add debt" bar and the dev badge), leaning LEFT in a pine-teal panel with a mug and coins.
const P54 = promo({
  n: 54,
  tone: "deep",
  wave: 1,
  display: ["Debt Payoff Plan", "Smallest Balance First", "or Highest Rate First"],
  highlight: ["Smallest Balance First"],
  appTagline: "debt payoff plan app",
  features: [
    { icon: "keyboard", label: "Type each debt's", text: "Balance, rate and minimum" },
    { icon: "coins", label: "An extra amount", text: "You choose" },
    { icon: "calendar-check", label: "The month you are debt-free", text: "The order the debts clear" },
    { icon: "plugs", label: "It doesn't connect to your lenders", text: "And it doesn't change what you pay" },
  ],
  screen: { src: screen("debt"), y0: 836, y1: 1238, width: 450, tilt: -8, appBg: APP_BG },
  prop: `${coins({ x: 70, y: 1140, w: 230, rot: -4 })}${mug({ x: 640, y: 1130, size: 190, color: "#e9f0ec", drink: "#3b2a1c" })}${pen({ x: 420, y: 1280, len: 300, rot: -10, body: "#c9a23a" })}`,
  extraCss: tint({ a: "#06201b", b: "#0a3a34", c: "#17594f", hi: "#bfeee0", wave: "#e3efea", angle: 172 }),
});

/* ----------------------------------------------------------------- #13 */
// Two phones: the banner (figure, bar, where the balance goes), then the one-tap working opened beneath, cascading down the right.
const K13 = 440 / 390;
const P13_A = phone({ src: asset("available-money.png"), y0: 0, y1: 262, width: 440, tilt: -5, x: 498, y: 548, appBg: APP_BG, closed: true, id: "phA" });
const P13_B = phone({ src: asset("available-money-working.png"), y0: 0, y1: 372, width: 440, tilt: 6, x: 556, y: 905, appBg: APP_BG, id: "phB" });
const P13 = promo({
  n: 13,
  tone: "berry",
  wave: 2,
  display: ["One Figure,", "With the Working", "One Tap Away"],
  highlight: ["With the Working"],
  appTagline: "available money app",
  features: [
    { icon: "wallet", label: "One Available Money figure", text: "In a banner" },
    { icon: "chart-pie-slice", label: "Where the rest", text: "Of your balance goes" },
    { icon: "hand-tap", label: "Working one tap away", text: "For every figure" },
    { icon: "calendar-dots", label: "A month-level estimate", text: "Not an until-payday number" },
  ],
  phone: P13_A + P13_B,
  prop: `${stickyPad({ x: 70, y: 1135, w: 215, rot: -8, color: "#f4d56b" })}${stickyPad({ x: 215, y: 1190, w: 150, rot: 9, color: "#bfe3c9" })}${pencil({ x: 120, y: 1305, len: 330, rot: -4 })}`,
  extraCss: tint({ a: "#0d2b24", b: "#164a3d", c: "#2c7360", hi: "#ffd9a0", wave: "#f0f6f3", angle: 146 }),
});

/* ----------------------------------------------------------------- #17 */
// The Coming up list whole, leaning right, with a two-week strip of blank day boxes (no numbers) marking the pay day and the
// bill days of the list (positions counted from the capture's clock, Mon 26 Oct), a face-down calendar leaf and a pen.
function strip() {
  // 14 days from the capture day. Marks: 2 = Payday, 3,6,9,10,13 = Bill / debt, 5, 8, 9 = renewals: all dates are the rows on the screen.
  const pay = new Set([2]);
  const bill = new Set([3, 6, 10, 13]); // Mobile phone, Rent, Home insurance, Credit card minimum
  const sub = new Set([5, 8, 9]); // streaming, music, cloud storage renewals
  const box = (d) => {
    const kind = pay.has(d) ? "pay" : bill.has(d) ? "bill" : sub.has(d) ? "sub" : "";
    const fill = kind === "pay" ? "#f2d98a" : kind ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.07)";
    const dot = kind === "pay" ? icon("coins", { size: 28, color: "#0a2a20", weight: "fill" }) : kind === "bill" ? `<i style="display:block;width:16px;height:16px;border-radius:50%;background:#fff"></i>` : kind === "sub" ? `<i style="display:block;width:16px;height:16px;border-radius:4px;background:#b8efd2"></i>` : "";
    return `<div style="width:48px;height:46px;border-radius:10px;background:${fill};border:1.5px solid rgba(255,255,255,${kind ? ".5" : ".22"});display:grid;place-items:center">${dot}</div>`;
  };
  const row = (a) => `<div style="display:flex;gap:7px">${Array.from({ length: 7 }, (_, k) => box(a + k)).join("")}</div>`;
  return `<div style="position:absolute;left:64px;top:960px;width:392px"><div style="display:flex;flex-direction:column;gap:8px">${row(0)}${row(7)}</div>
    <div style="display:flex;gap:22px;margin-top:14px;font:500 22px/1 'Plex',sans-serif;color:#cfe3da;align-items:center">
      <span style="display:flex;align-items:center;gap:8px"><i style="width:18px;height:18px;border-radius:5px;background:#f2d98a"></i>Payday</span>
      <span style="display:flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:50%;background:#fff"></i>Bill</span>
      <span style="display:flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:4px;background:#b8efd2"></i>Subscription</span></div></div>`;
}
const P17 = promo({
  n: 17,
  tone: "plum",
  wave: 0,
  display: ["Bill Due Date", "Tracker App", "Pay Days Included"],
  highlight: ["Pay Days Included"],
  appTagline: "bill due date tracker app",
  features: [
    { icon: "calendar-check", label: "What's due in the next 14 days", text: "Including pay days" },
    { icon: "flag", label: "It flags income", text: "That hasn't arrived by its expected date" },
    { icon: "warning-circle", label: "It flags any bill", text: "With no due date" },
  ],
  screen: { src: asset("coming-up.png"), y0: 0, y1: 636, width: 470, tilt: 11, x: 372, appBg: APP_BG },
  prop: `${strip()}${calendarBack({ x: 80, y: 1130, w: 200, rot: -6 })}${pen({ x: 150, y: 1300, len: 300, rot: 3, body: "#b8791f" })}`,
  extraCss: tint({ a: "#0a1f2a", b: "#0e3a3a", c: "#1d5f55", hi: "#f2d98a", wave: "#e8f1ee", angle: 200 }),
});

/* ----------------------------------------------------------------- #21 */
// The four decision cards (Keep, Still deciding, Planned to cancel, Cancelled), phone on the LEFT, feature rows on the right.
const P21 = promo({
  n: 21,
  tone: "plum",
  wave: 1,
  display: ["Subscription", "Tracker App"],
  highlight: ["Tracker App"],
  appTagline: "subscription tracker app",
  features: [
    { icon: "list-bullets", label: "Amount, how often it bills", text: "Renewal date" },
    { icon: "seal-check", label: "A decision on every one", text: "Keep, Still deciding, Planned to cancel, Cancelled" },
    { icon: "divide", label: "Annual charges", text: "Divided by 12" },
    { icon: "keyboard", label: "You type them in", text: "It doesn't cancel anything or read your bank" },
  ],
  screen: { src: asset("subscriptions.png"), y0: 447, y1: 1219, width: 450, tilt: -4, x: 22, appBg: APP_BG },
  prop: receiptPair({ x: 660, y: 1075, w: 240, rot: 8 }),
  extraCss: `${tint({ a: "#142410", b: "#1d3a1c", c: "#3d6c38", hi: "#e9e08a", wave: "#eef3ea", angle: 150 })}${MIRROR(556)}
  .brand,.display{left:64px}`,
});

/* ----------------------------------------------------------------- #67 */
// The whole Savings screen with the Emergency fund card, big and nearly upright, an envelope and a pen at its foot.
const P67 = promo({
  n: 67,
  tone: "deep",
  wave: 2,
  display: ["Set a Target,", "Type What You", "Have Saved"],
  highlight: ["Set a Target,", "Have Saved"],
  appTagline: "emergency fund tracker app",
  features: [
    { icon: "target", label: "A savings goal type", text: "Called Emergency fund" },
    { icon: "keyboard", label: "You type in the target,", text: "What you've saved so far and a target date" },
    { icon: "chart-line-up", label: "It then works out", text: "The monthly amount needed and shows progress" },
  ],
  screen: { src: asset("emergency-fund.png"), y0: 0, y1: 505, width: 480, tilt: 3, appBg: APP_BG },
  prop: `${envelope({ x: 70, y: 1135, w: 330, rot: -8 })}${pen({ x: 190, y: 1300, len: 310, rot: 5, body: "#2a4a7a" })}`,
  extraCss: tint({ a: "#052a1f", b: "#0a4a38", c: "#1f7a5c", hi: "#c9f5a8", wave: "#e9f3ee", angle: 165 }),
});



/* ----------------------------------------------------------------- #19 */
// The real statement, below its title (shared-statement-body.png), as a printed half-page on slate-blue linen with two mugs,
// a sticky note and a pencil. Two blank sheets lie under it. The title that overprints the "As of" line is never shown.
const STAT_W = 840;
const STAT_H = Math.round((STAT_W * 880) / 1654);
function statementScene() {
  const linen = `<div style="position:absolute;left:0;top:372px;width:1000px;height:982px;background:
      repeating-linear-gradient(0deg,rgba(255,255,255,.045) 0 2px,transparent 2px 6px),
      repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 2px,transparent 2px 6px),
      radial-gradient(120% 90% at 30% 20%,#7f9bb0 0%,#587890 55%,#3f5c73 100%)"></div>`;
  const blank = (x, y, w, h, rot, fill) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${fill};border-radius:3px;box-shadow:0 2px 3px rgba(10,25,40,.3),0 16px 30px rgba(10,25,40,.38)`)}"></div>`;
  const px = 80, py = 712;
  const page = `<div data-check="page" style="${abs(px, py, STAT_W, STAT_H, "transform:rotate(-3deg);background:#fffefb;border-radius:3px;overflow:hidden;box-shadow:0 2px 3px rgba(10,25,40,.3),0 22px 40px rgba(10,25,40,.45)")}"><img src="${asset("shared-statement-body.png")}" style="width:${STAT_W}px;height:${STAT_H}px;display:block" alt=""></div>`;
  return `${linen}
    ${blank(112, 668, 800, STAT_H + 90, 2.2, "#f3f1ea")}
    ${blank(96, 690, 820, STAT_H + 70, -0.6, "#f9f8f3")}
    ${page}
    ${stickyPad({ x: 735, y: 430, w: 190, rot: 8, color: "#f4d56b" })}
    ${mug({ x: 76, y: 424, size: 190, color: "#f3ede4", drink: "#4a2f1d" })}
    ${mug({ x: 640, y: 1130, size: 170, color: "#cfe1dc", drink: "#2d1c12" })}
    ${pencil({ x: 120, y: 1250, len: 400, rot: -5, body: "#3f7f8c" })}
    ${binderClip({ x: 452, y: 672, rot: 0, size: 100 })}`;
}
const P19 = printable({
  n: 19,
  paper: "#e6edf1",
  scene: statementScene(),
  extraCss: `.top p{color:#3d4a55}`,
});

/* ----------------------------------------------------------------- #31 */
const I31 = idea(31);
const P31 = (() => {
  const css = `
  .pin{background:#ebe8dd}
  .eye{position:absolute;left:64px;top:60px;font:600 26px/1 "Plex",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#4b6358}
  .big{position:absolute;left:64px;top:104px;width:880px;font:500 76px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;color:#17201b}
  .left{position:absolute;left:0;top:350px;width:560px;height:1016px;background:#e1ddd0}
  .right{position:absolute;left:0;top:350px;width:1000px;height:1016px;background:linear-gradient(160deg,#08281f 0%,#0d3b2e 50%,#1d5a47 100%);clip-path:polygon(500px 0,1000px 0,1000px 1016px,440px 1016px)}
  .tag{position:absolute;display:flex;align-items:center;gap:12px;padding:10px 22px 10px 16px;border-radius:999px;font:700 30px/1 "Plex",sans-serif}
  .myth-tag{left:64px;top:392px;background:#c9c4b3;color:#4a4639}
  .truth-tag{left:560px;top:392px;background:#f2d98a;color:#0a2a20}
  .myth{position:absolute;left:64px;top:480px;width:370px;font:500 42px/1.22 "Newsreader",Georgia,serif;color:#7d7a6c;text-decoration:line-through;text-decoration-color:rgba(150,50,45,.55);text-decoration-thickness:4px}
  .truth{position:absolute;left:560px;top:480px;width:392px;font:600 31px/1.3 "Plex",sans-serif;color:#fff}
  .truth q{quotes:none;color:#f2d98a}
  .sub{position:absolute;left:560px;top:1252px;width:392px;font:500 28px/1.3 "Plex",sans-serif;color:#cfe3da}
  .foot{z-index:9}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:134px;background:#ebe8dd;box-shadow:0 -8px 22px rgba(20,30,20,.18);z-index:8}
  `;
  const body = `
  <div class="eye">Money App Myth vs Truth</div>
  <div class="big" data-check="headline" data-bottom-max="345">A Number You Cannot Check Is Just a Guess</div>
  <div class="left"></div><div class="right"></div>
  <div class="tag myth-tag">${icon("x-circle", { size: 36, color: "#4a4639", weight: "fill" })}Myth</div>
  <div class="myth" data-check="myth">You have to take a budget number on trust</div>
  <div class="tag truth-tag">${icon("check-circle", { size: 36, color: "#0a2a20", weight: "fill" })}Truth</div>
  <div class="truth" data-check="truth">Every figure has a <q>How Draftpace got this</q> breakdown, line by line, from your own records.</div>
  ${phone({ src: asset("available-money-working-alt.png"), y0: 0, y1: 372, width: 440, tilt: 4, x: 520, y: 685, appBg: APP_BG, closed: true })}
  <div class="sub" data-check="sub">Nothing here is a guess dressed up as a number.</div>
  ${receiptPair({ x: 40, y: 760, w: 300, rot: -7 })}
  ${pen({ x: 150, y: 1180, len: 330, rot: -14, body: "#a8452f", shadow: "rgba(20,10,5,.4)" })}
  <div class="footbar"></div>
  ${footFor(I31)}`;
  return { n: 31, id: "31-money-app-myth-vs-truth", html: page(p, { body, css, paper: "#ebe8dd" }) };
})();

export const pins = [P54, P13, P17, P21, P67, P19, P31];
