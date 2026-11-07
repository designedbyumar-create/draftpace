/**
 * Batch 3, module A: four guide pins about the notice of intent
 * (guide: homeschool-notice-of-intent-explained). Every word is the idea
 * bank's own; the module reads the items from the bank and throws if the
 * record is not the one it was drawn for.
 *
 *   #5   checklist       a lined steno pad on a sage linen cloth, five empty boxes, a teacup
 *   #7   myth vs truth   a terracotta brick wall: a crumpled kraft slip struck through, a cream card, a letter slot
 *   #13  before / after  a grey linen top half with a bare envelope, an ochre table below with the receipt and the copy
 *   #15  comparison      a district counter: a kraft folder (Florida) and a plum folder (New Mexico) side by side
 *
 * #15 names two states, so it carries the guide's state caution line
 * "Laws change. Confirm with your state before relying on this." (the line
 * every state pin carries; it is not in this idea's items).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { binderClip, desk } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const CAUTION = "Laws change. Confirm with your state before relying on this.";
const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const lead = (s) => [s.split(": ")[0], s.split(": ").slice(1).join(": ")];
const SHADOW = "0 2px 3px rgba(40,20,5,.25),0 16px 28px rgba(40,20,5,.35)";

let uid = 0;
const nid = (p) => `${p}${++uid}`;

/** A strip of washi tape. */
function tape(x, y, w, rot, color = "rgba(214,186,128,.82)", stripe = "rgba(255,255,255,.35)") {
  return `<div style="${at(x, y, w, 46, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,${stripe} 14px 22px);box-shadow:0 3px 5px rgba(40,20,5,.25);opacity:.95`)}"></div>`;
}

/** A perforated postage stamp: its own little picture (a leaf on blue), no denomination, no words. */
function stamp({ x, y, rot = 8, w = 110, h = 134 }) {
  const holes = [];
  const nx = Math.round(w / 14), ny = Math.round(h / 14);
  for (let k = 0; k < nx; k++) holes.push(`<circle cx="${(k + 0.5) * (w / nx)}" cy="1" r="4.4"/><circle cx="${(k + 0.5) * (w / nx)}" cy="${h - 1}" r="4.4"/>`);
  for (let k = 0; k < ny; k++) holes.push(`<circle cx="1" cy="${(k + 0.5) * (h / ny)}" r="4.4"/><circle cx="${w - 1}" cy="${(k + 0.5) * (h / ny)}" r="4.4"/>`);
  const m = nid("stm");
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 5px 4px rgba(40,20,5,.35))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><mask id="${m}"><rect width="${w}" height="${h}" fill="#fff"/><g fill="#000">${holes.join("")}</g></mask></defs>
    <g mask="url(#${m})"><rect width="${w}" height="${h}" fill="#fffaf0"/><rect x="11" y="11" width="${w - 22}" height="${h - 22}" fill="#3f6e9a"/>
    <path d="M${w / 2} ${h - 24} C ${w * 0.2} ${h * 0.55}, ${w * 0.3} ${h * 0.2}, ${w / 2} 26 C ${w * 0.7} ${h * 0.2}, ${w * 0.8} ${h * 0.55}, ${w / 2} ${h - 24} Z" fill="#e9d9a6"/><path d="M${w / 2} ${h - 22} V 34" stroke="#3f6e9a" stroke-width="3" fill="none"/></g></svg>`;
}

/** The front of a posted envelope: stamp, postmark, return and address bars. Optionally a "Certified mail" label. */
function envelopeFront({ x, y, w = 360, h = 220, rot = 0, certified = false, tone = "#f6efdf" }) {
  const bars = (bx, by, n, bw, c = "#9a8e78") => Array.from({ length: n }, (_, k) => `<div style="${at(bx, by + k * 26, bw - (k === n - 1 ? 60 : 0), 9, `background:${c};border-radius:5px;opacity:.75`)}"></div>`).join("");
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg)`)}">
    <div style="${at(0, 0, w, h, `background:linear-gradient(160deg,${tone},#e8dcc2);border-radius:7px;box-shadow:${SHADOW},0 30px 40px -12px rgba(40,20,5,.35)`)}"></div>
    <div style="${at(0, 0, w, 10, "border-radius:7px 7px 0 0;background:repeating-linear-gradient(135deg,#c75a4a 0 18px,#fffaf0 18px 30px,#3f6e9a 30px 48px,#fffaf0 48px 60px);opacity:.9")}"></div>
    <div style="${at(0, h - 10, w, 10, "border-radius:0 0 7px 7px;background:repeating-linear-gradient(135deg,#c75a4a 0 18px,#fffaf0 18px 30px,#3f6e9a 30px 48px,#fffaf0 48px 60px);opacity:.9")}"></div>
    ${bars(28, 34, 2, 120)}
    ${bars(Math.round(w * (certified ? 0.6 : 0.34)), Math.round(h * 0.5), 3, Math.round(w * (certified ? 0.3 : 0.5)))}
    ${stamp({ x: w - 98, y: 24, rot: 3, w: 68, h: 82 })}
    <svg style="${at(w - 176, 22, 110, 90)}" viewBox="0 0 110 90" aria-hidden="true"><circle cx="40" cy="45" r="30" fill="none" stroke="#6a5f52" stroke-width="2.4" opacity=".55"/><path d="M68 28 q 14 -8 28 0 M68 42 q 14 -8 28 0 M68 56 q 14 -8 28 0" fill="none" stroke="#6a5f52" stroke-width="2.4" opacity=".55"/></svg>
    ${certified ? `<div style="${at(20, Math.round(h * 0.5) - 2, null, null, "padding:6px 12px;border:3px solid #b3322a;border-radius:5px;color:#b3322a;font:700 24px/1 'Plex',sans-serif;letter-spacing:.02em;background:rgba(255,250,240,.7);transform:rotate(-3deg)")}" data-check="certified label">Certified mail</div>` : ""}
  </div>`;
}

/** A woven linen ground. */
const linen = (top, h, base, dark) => `<div style="${at(0, top, 1000, h, `background:repeating-linear-gradient(0deg,rgba(255,255,255,.09) 0 2px,transparent 2px 6px),repeating-linear-gradient(90deg,${dark} 0 2px,transparent 2px 6px),${base}`)}"></div><div style="${at(0, top, 1000, h, "background:radial-gradient(ellipse at 24% 14%,rgba(255,255,255,.2),rgba(20,25,20,.28))")}"></div>`;

/** A steady ink pen lying at an angle. */
function pen({ x, y, len = 440, rot = -10, body = "#1f3b47" }) {
  return `<svg style="${at(x, y, len, 40, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,25,20,.4))`)}" viewBox="0 0 ${len} 40" aria-hidden="true">
    <rect x="70" y="8" width="${len - 90}" height="24" rx="12" fill="${body}"/><rect x="70" y="10" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".25"/>
    <rect x="${len - 150}" y="6" width="10" height="28" fill="#d8b866"/><rect x="${len - 108}" y="14" width="64" height="4" rx="2" fill="#d8b866"/>
    <path d="M70 8 L24 17 Q 16 20 24 23 L70 32 Z" fill="#d8b866"/><path d="M24 17 Q 16 20 24 23 L38 22 L38 18 Z" fill="#26323a"/></svg>`;
}

/* ============================================================ #5 checklist */

function checklist() {
  const n = 5;
  const i = idea(n);
  if (i.items.length !== 5 || !i.items[0].startsWith("The child's full legal name")) throw new Error("#5: the bank's items are not the five checklist lines");
  const rings = Array.from({ length: 13 }, (_, k) => `<div style="${at(30 + k * 54, -16, 22, 54, "border-radius:11px;background:linear-gradient(90deg,#8d9399,#e8eaed 50%,#8d9399);box-shadow:0 3px 4px rgba(0,0,0,.35)")}"></div><div style="${at(36 + k * 54, 24, 10, 10, "border-radius:50%;background:#3a2f42;opacity:.8")}"></div>`).join("");
  const rows = i.items.map((t) => `<div style="display:flex;gap:24px;align-items:flex-start"><span style="flex:none;margin-top:3px;width:46px;height:46px;border:3.5px solid #4a3a55;border-radius:7px;background:#fffdf8"></span><span data-check="checklist line" style="font:500 33px/1.34 'Plex',sans-serif;color:#26232b">${esc(t)}</span></div>`).join("");
  const pad = `<div style="${at(92, 408, 770, 880, "transform:rotate(-1.4deg)")}">
    <div style="${at(10, 14, 770, 880, "background:#cfc6b4;border-radius:10px;box-shadow:0 30px 50px rgba(20,25,20,.45)")}"></div>
    <div style="${at(0, 0, 770, 880, `background:repeating-linear-gradient(180deg,transparent 0 44px,rgba(80,115,170,.26) 44px 46px),#fffdf3;border-radius:10px;box-shadow:0 3px 5px rgba(20,25,20,.3)`)}">
      <div style="${at(0, 0, 770, 62, "background:linear-gradient(#6a4a78,#523660);border-radius:10px 10px 0 0")}"></div>
      ${rings}
      <div style="${at(74, 62, 3, 818, "background:rgba(200,80,80,.5)")}"></div>
      <div style="${at(106, 112, 640, 740, "display:flex;flex-direction:column;gap:40px")}">${rows}</div>
    </div></div>`;
  const cup = `<div style="${at(790, 392, 200, 200, "filter:drop-shadow(0 16px 10px rgba(20,25,20,.4))")}">
    <svg viewBox="0 0 200 200" style="${at(0, 0, 200, 200)}" aria-hidden="true">
      <ellipse cx="96" cy="106" rx="92" ry="86" fill="#f3efe6"/><ellipse cx="96" cy="106" rx="92" ry="86" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/><ellipse cx="96" cy="106" rx="68" ry="62" fill="none" stroke="#d8d0c0" stroke-width="3"/>
      <path d="M150 62 C 196 56 198 132 146 138" fill="none" stroke="#f3efe6" stroke-width="20" stroke-linecap="round"/>
      <ellipse cx="96" cy="106" rx="52" ry="48" fill="#dcd4c4"/><ellipse cx="96" cy="108" rx="45" ry="41" fill="#a8672f"/><ellipse cx="80" cy="92" rx="18" ry="11" fill="#fff" opacity=".18"/></svg></div>`;
  const back = `<div style="${at(560, 1130, 360, 230, "transform:rotate(12deg)")}">
    <div style="${at(0, 0, 360, 230, "background:linear-gradient(160deg,#f3ead2,#e3d4b2);border-radius:6px;box-shadow:0 24px 40px rgba(20,25,20,.4)")}"></div>
    <svg viewBox="0 0 360 230" style="${at(0, 0, 360, 230)}" aria-hidden="true"><path d="M0 0 L180 126 L360 0 Z" fill="#eadcbd" stroke="#b79d6c" stroke-width="2.4"/><path d="M0 230 L150 110 M360 230 L210 110" stroke="#b79d6c" stroke-width="2" fill="none" opacity=".6"/></svg></div>`;
  const scene = `${linen(SCENE_TOP, 1500 - SCENE_TOP, "#a3b89a", "rgba(40,70,40,.1)")}${back}${pad}${cup}${pen({ x: 520, y: 1290, len: 430, rot: -6 })}`;
  return printable({ n, paper: "#eef0e2", scene });
}

/* ============================================================ #7 myth vs truth */

function brickWall() {
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const tones = ["#b4573a", "#a94d33", "#bf6341", "#b05a3f", "#a24a35"];
  const H = 1500 - SCENE_TOP, bh = 58, bw = 128, g = 6;
  const rects = [];
  for (let r = 0; r * bh < H + bh; r++) {
    for (let c = -1; c * bw < 1000 + bw; c++) {
      const x = c * bw + (r % 2 ? bw / 2 : 0);
      rects.push(`<rect x="${x + g / 2}" y="${r * bh + g / 2}" width="${bw - g}" height="${bh - g}" rx="3" fill="${tones[Math.floor(rnd() * tones.length)]}" opacity="${(0.88 + rnd() * 0.12).toFixed(2)}"/>`);
    }
  }
  return `<svg style="${at(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><rect width="1000" height="${H}" fill="#e4d2bc"/>${rects.join("")}</svg>
  <div style="${at(0, SCENE_TOP, 1000, H, "background:radial-gradient(ellipse at 28% 18%,rgba(255,236,200,.25),rgba(50,15,5,.45))")}"></div>`;
}

function mythTruth() {
  const n = 7;
  const i = idea(n);
  const [mLead, mText] = lead(i.items[0]);
  const [tLead, tText] = lead(i.items[1]);
  if (mLead !== "Myth" || tLead !== "Truth") throw new Error("#7: items are not Myth/Truth");
  const crease = `<svg style="${at(0, 0, 840, 330)}" viewBox="0 0 840 330" aria-hidden="true" preserveAspectRatio="none">
    <path d="M60 0 L 140 90 L 110 200 L 190 330" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"/><path d="M63 3 L 143 93 L 113 203 L 193 333" fill="none" stroke="#5a3a18" stroke-opacity=".22" stroke-width="2"/>
    <path d="M360 0 L 300 110 L 400 210 L 350 330" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/><path d="M363 3 L 303 113 L 403 213 L 353 333" fill="none" stroke="#5a3a18" stroke-opacity=".22" stroke-width="2"/>
    <path d="M560 0 L 640 120 L 590 220 L 700 330" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/><path d="M563 3 L 643 123 L 593 223 L 703 333" fill="none" stroke="#5a3a18" stroke-opacity=".2" stroke-width="2"/>
    <path d="M0 140 L 200 170 L 420 130 L 840 190" fill="none" stroke="#5a3a18" stroke-opacity=".16" stroke-width="2"/></svg>`;
  const slip = `<div style="${at(70, 414, 840, 330, "transform:rotate(-2.4deg);filter:drop-shadow(0 18px 14px rgba(40,10,0,.5))")}">
    <div style="${at(0, 0, 840, 330, "background:linear-gradient(150deg,#d3b183,#bf9a68 55%,#cbaa7a);clip-path:polygon(0 4%,5% 0,12% 3%,22% 0,34% 2%,48% 0,60% 3%,74% 0,88% 2%,100% 0,99% 20%,100% 38%,98% 58%,100% 78%,99% 100%,86% 98%,70% 100%,52% 97%,36% 100%,20% 98%,8% 100%,0 96%,1% 76%,0 52%,2% 30%)")}">${crease}
      <div style="${at(52, 38, 740, 270)}"><div style="font:700 26px/1 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6d2a1e">${esc(mLead)}:</div>
      <div data-check="myth" style="margin-top:14px;font:500 78px/1.08 'Newsreader',Georgia,serif;color:#2c2014;text-decoration:line-through;text-decoration-color:#b3261e;text-decoration-thickness:7px;text-decoration-skip-ink:none">${esc(mText)}</div></div></div></div>`;
  const card = `<div style="${at(84, 802, 820, 392, "transform:rotate(1.4deg);filter:drop-shadow(0 20px 16px rgba(40,10,0,.5))")}">
    <div style="${at(0, 0, 820, 392, "background:#fffdf6;border-radius:6px")}"></div>
    <div style="${at(0, 0, 22, 392, "background:#5d3a6b;border-radius:6px 0 0 6px")}"></div>
    <div style="${at(62, 40, 700, 320)}"><div style="font:700 26px/1 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5d3a6b">${esc(tLead)}:</div>
    <div data-check="truth" style="margin-top:16px;font:500 74px/1.08 'Newsreader',Georgia,serif;color:#1d1a22">${esc(tText)}</div></div></div>`;
  const slot = `<div style="${at(290, 1262, 420, 74, "border-radius:14px;background:linear-gradient(#e8cd88,#b8913f 55%,#d9b765);box-shadow:0 10px 16px rgba(40,10,0,.5),inset 0 2px 2px rgba(255,255,255,.6)")}"><div style="${at(34, 25, 352, 24, "border-radius:12px;background:#2b1c10;box-shadow:inset 0 5px 6px rgba(0,0,0,.7)")}"></div></div>`;
  const scene = `${brickWall()}${slip}${tape(34, 430, 150, -38)}${tape(790, 440, 150, 36)}${card}${tape(420, 788, 180, -3, "rgba(150,170,205,.85)", "rgba(255,255,255,.4)")}${slot}`;
  return printable({ n, paper: "#f4e6d8", scene });
}

/* ============================================================ #13 before / after */

function beforeAfter() {
  const n = 13;
  const i = idea(n);
  const [bLead, bText] = lead(i.items[0]);
  const [aLead, aText] = lead(i.items[1]);
  if (bLead !== "Before" || aLead !== "After") throw new Error("#13: items are not Before/After");
  const SPLIT = 846;
  const slipCss = (bg, chip) => `background:${bg};border-radius:8px;box-shadow:${SHADOW};padding:20px 28px 22px;display:flex;gap:22px;align-items:flex-start`;
  const chip = (t, bg) => `<span style="flex:none;margin-top:5px;padding:7px 16px;border-radius:7px;background:${bg};color:#fff;font:700 24px/1 'Plex',sans-serif;letter-spacing:.06em;text-transform:uppercase">${esc(t)}</span>`;
  const top = `${linen(SCENE_TOP, SPLIT - SCENE_TOP + 20, "#aeb9c5", "rgba(40,55,75,.1)")}
    <div style="${at(60, 408, 880, null, slipCss("#fbfbf8"))}">${chip(bLead, "#52606f")}<span data-check="before" style="font:500 34px/1.3 'Plex',sans-serif;color:#262a30">${esc(bText)}</span></div>
    ${envelopeFront({ x: 150, y: 596, w: 390, h: 226, rot: -4 })}
    <div style="${at(640, 618, 270, 188, "border:4px dashed rgba(60,75,95,.5);border-radius:10px;transform:rotate(3deg)")}"></div>`;
  const bottom = `${desk({ top: SPLIT, height: 1500 - SPLIT, base: "#dcaa58", dark: "#c9923f", planks: 3, seed: 9 })}
    <div style="${at(56, 884, 888, null, slipCss("#fffbe8"))}">${chip(aLead, "#2f6f4f")}<span data-check="after" style="font:500 34px/1.3 'Plex',sans-serif;color:#262a30">${esc(aText)}</span></div>`;
  const copy = `<div style="${at(64, 1108, 204, 222, "transform:rotate(-5deg)")}">
    <div style="${at(0, 0, 204, 224, `background:#fbfbfa;border-radius:3px;box-shadow:${SHADOW}`)}"></div>
    ${[24, 56, 76, 96, 116, 146, 166, 186].map((y, k) => `<div style="${at(22, y, k === 0 ? 90 : k === 5 ? 120 : 160, k === 0 ? 12 : 7, "background:#555;border-radius:4px;opacity:.55")}"></div>`).join("")}</div>
    ${binderClip({ x: 120, y: 1086, rot: 4, size: 96 })}`;
  const receipt = `<div style="${at(634, 1146, 306, 176, "transform:rotate(4deg)")}">
    <div style="${at(0, 0, 306, 176, `background:#dcebd2;border:3px solid #2f6f4f;border-radius:6px;box-shadow:${SHADOW}`)}"></div>
    <div style="${at(46, 0, 0, 176, "border-left:3px dashed #2f6f4f;opacity:.7")}"></div>
    <div data-check="receipt label" style="${at(66, 20, 224, null, "font:700 26px/1.15 'Plex',sans-serif;color:#1d4a34")}">Return receipt</div>
    ${[72, 98, 124].map((y, k) => `<div style="${at(66, y, k === 2 ? 110 : 214, 8, "background:#2f6f4f;border-radius:4px;opacity:.45")}"></div>`).join("")}
    <svg viewBox="0 0 120 40" style="${at(160, 118, 120, 40)}" aria-hidden="true"><path d="M4 28 C 14 4, 24 4, 24 22 C 24 34, 34 8, 46 18 C 56 26, 64 12, 76 20 C 88 28, 96 10, 114 16" fill="none" stroke="#1d3a5c" stroke-width="3" stroke-linecap="round"/></svg></div>`;
  const env = envelopeFront({ x: 290, y: 1108, w: 360, h: 216, rot: 3, certified: true });
  // the tear between the halves
  const pts = [];
  for (let x = 0; x <= 1000; x += 25) pts.push(`${x},${(x / 25) % 2 ? 4 : 17}`);
  const tear = `<svg style="${at(0, SPLIT - 12, 1000, 30, "filter:drop-shadow(0 4px 5px rgba(30,20,10,.4))")}" viewBox="0 0 1000 30" aria-hidden="true"><polygon points="0,0 ${pts.join(" ")} 1000,0" fill="#fbf7ee" transform="translate(0,6)"/></svg>`;
  return printable({ n, paper: "#efeae2", scene: `${top}${bottom}${tear}${copy}${env}${receipt}` });
}

/* ============================================================ #15 comparison */

function comparison() {
  const n = 15;
  const i = idea(n);
  const [s1, shape1] = lead(i.items[0]);
  const [s2, shape2] = lead(i.items[4]);
  if (s1 !== "Florida" || s2 !== "New Mexico") throw new Error("#15: items are not Florida / New Mexico");
  const cap = (t) => t[0].toUpperCase() + t.slice(1);
  const folder = ({ x, tab, state, shape, rows, iconName, back, front, text, cardBg, tabX, rot, ink }) => `
    <div style="${at(x, 404, 440, 806, `transform:rotate(${rot}deg);filter:drop-shadow(0 26px 22px rgba(0,0,0,.5))`)}">
      <div style="${at(tabX, 0, 190, 70, `background:${back};border-radius:14px 14px 0 0`)}"><div data-check="folder tab" style="${at(0, 10, 190, null, `text-align:center;font:700 29px/1.2 'Plex',sans-serif;color:${ink}`)}">${esc(state)}</div></div>
      <div style="${at(0, 48, 440, 758, `background:linear-gradient(165deg,${front[0]},${front[1]});border-radius:6px 18px 18px 18px;box-shadow:inset 0 3px 0 rgba(255,255,255,.28)`)}">
        <div style="${at(32, 30, 92, 92, `border-radius:50%;background:${cardBg};display:grid;place-items:center;box-shadow:0 4px 6px rgba(0,0,0,.25)`)}">${icon(iconName, { size: 58, color: text, weight: "duotone" })}</div>
        <div data-check="shape" style="${at(32, 148, 380, null, `font:500 68px/1.04 'Newsreader',Georgia,serif;color:${ink};letter-spacing:-.01em`)}">${esc(cap(shape))}</div>
        <div style="${at(26, 336, 388, 396, `background:${cardBg};border-radius:8px;box-shadow:0 5px 8px rgba(0,0,0,.28);padding:14px 22px;display:flex;flex-direction:column`)}">
          ${rows.map((r, k) => `<div data-check="detail" style="flex:1;display:flex;align-items:center;font:500 29px/1.28 'Plex',sans-serif;color:#25222b;${k < 2 ? "border-bottom:2.5px dashed rgba(60,45,70,.3)" : ""}">${esc(r)}</div>`).join("")}
        </div>
      </div></div>`;
  const left = folder({ x: 34, state: s1, shape: shape1, rows: i.items.slice(1, 4), iconName: "envelope-simple", back: "#a98558", front: ["#d6b583", "#c3a068"], text: "#6b4b22", cardBg: "#fbf4e4", tabX: 30, rot: -1.3, ink: "#2c1f10" });
  const right = folder({ x: 526, state: s2, shape: shape2, rows: i.items.slice(5, 8), iconName: "arrows-clockwise", back: "#4a2f55", front: ["#6b4579", "#553663"], text: "#5d3a6b", cardBg: "#f6f0f8", tabX: 220, rot: 1.2, ink: "#fffaf0" });
  const bg = `<div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(180deg,#3c4b5e,#2b3846)")}"></div>
    <svg style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP)}" viewBox="0 0 1000 1128" aria-hidden="true">${Array.from({ length: 150 }, (_, k) => `<circle cx="${(k * 337) % 1000}" cy="${(k * 211) % 1128}" r="${1 + (k % 3)}" fill="#fff" opacity="${0.05 + (k % 4) * 0.025}"/>`).join("")}</svg>
    <div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 25% 8%,rgba(255,255,255,.14),rgba(0,0,0,.35))")}"></div>`;
  const caution = `<div data-check="caution" style="${at(60, 1244, 880, 76, "background:#fffaf0;border-radius:12px;box-shadow:0 8px 14px rgba(0,0,0,.4);display:flex;align-items:center;gap:16px;padding:0 26px;font:600 27px/1.2 'Plex',sans-serif;color:#2b2330")}">${icon("warning", { size: 36, color: "#8a5a12", weight: "fill" })}${esc(CAUTION)}</div>`;
  return printable({ n, paper: "#ebe7ef", extraCss: ".top h1{font-size:60px}", scene: `${bg}${left}${right}${caution}` });
}

export const pins = [checklist(), mythTruth(), beforeAfter(), comparison()];
