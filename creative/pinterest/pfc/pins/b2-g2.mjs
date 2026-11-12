/**
 * Batch 2, group G2: five guide pins on a bakery counter (flour, a kitchen scale, cooling racks,
 * bread paper bags, a recipe card stand). Five different surfaces and moods:
 *
 *   #20  warm kraft bread-bag paper: four chat-bubble pairs on a cream panel, a mug and a sticky note
 *   #22  dusty-rose counter: the question on a forest recipe card in a wooden card stand, a receipt on a cooling rack
 *   #24  dark slate baker's slab dusted with flour: the five-rung ladder on a ruled sheet, a kitchen scale, a calculator
 *   #28  natural linen with flour: a nine-line checklist (some ticked), a bread bag, envelopes, a rolling pin
 *   #32  sage beadboard wall over an oak shelf: three flour jars filled to $60 / $91 / $122, a folded bill
 *
 * Words: every word is the idea's own (headline, sub, items). Set here and not verbatim: the quotation marks
 * around the "what to say" lines (#20), "Example" is the kit tag. Drawn objects carry no printed words.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p } from "../kit/bank.mjs";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { pencil, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_H = 1354 - SCENE_TOP;
const lcg = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const FOREST = "#17473a";
const EX = `<span class="example" style="font-size:24px;padding:4px 10px">Example</span>`;

/* ----------------------------------------------------------------- shared props */

/** Flour dust: fine specks and a few soft drifts, over a region of the scene. */
function flour({ x = 0, y = SCENE_TOP, w = 1000, h = SCENE_H, seed = 1, n = 220, op = 0.55, drifts = 5, color = "#fffdf6" }) {
  const r = lcg(seed);
  const g = `fd${++uid}`;
  const out = [];
  for (let k = 0; k < drifts; k++) {
    const cx = r() * w, cy = r() * h, rx = 70 + r() * 150, ry = 26 + r() * 60;
    out.push(`<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${rx.toFixed(0)}" ry="${ry.toFixed(0)}" fill="url(#${g})" transform="rotate(${(r() * 60 - 30).toFixed(0)} ${cx.toFixed(0)} ${cy.toFixed(0)})"/>`);
  }
  for (let k = 0; k < n; k++) out.push(`<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(0.6 + Math.pow(r(), 3) * 3.4).toFixed(1)}" fill="${color}" opacity="${(0.25 + r() * 0.6).toFixed(2)}"/>`);
  return `<svg style="${abs(x, y, w, h, "pointer-events:none")}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset=".6" stop-color="${color}" stop-opacity="${op * 0.35}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>${out.join("")}</svg>`;
}

/** A wooden rolling pin lying flat. */
function rollingPin({ x, y, len = 560, rot = 0, z = 3 }) {
  const h = 70;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 14px 10px rgba(50,35,15,.4))`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
  <defs><linearGradient id="rp${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c796"/><stop offset=".45" stop-color="#d4a86d"/><stop offset="1" stop-color="#a97a42"/></linearGradient></defs>
  <rect x="0" y="22" width="86" height="26" rx="13" fill="url(#rp${uid})"/><rect x="${len - 86}" y="22" width="86" height="26" rx="13" fill="url(#rp${uid++})"/>
  <rect x="70" y="2" width="${len - 140}" height="66" rx="22" fill="#dcb47d"/><rect x="70" y="2" width="${len - 140}" height="66" rx="22" fill="url(#rp${uid - 1})"/>
  <rect x="84" y="9" width="${len - 168}" height="9" rx="4.5" fill="#fff" opacity=".35"/>
  ${[0.3, 0.55, 0.78].map((f) => `<path d="M${90 + f * (len - 180)} 6 q 6 28 -2 58" stroke="#8a6234" stroke-opacity=".22" stroke-width="2" fill="none"/>`).join("")}</svg>`;
}

/** A ballpoint pen lying flat. */
function pen({ x, y, len = 320, rot = 0, body = FOREST, z = 4 }) {
  return `<svg style="${abs(x, y, len, 24, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 6px 5px rgba(20,10,5,.4))`)}" viewBox="0 0 ${len} 24" aria-hidden="true"><rect x="40" y="3" width="${len - 56}" height="18" rx="8" fill="${body}"/><rect x="40" y="4" width="${len - 56}" height="5" rx="3" fill="#fff" opacity=".28"/><rect x="${len - 120}" y="6" width="100" height="5" rx="2.5" fill="#d3d6dc"/><path d="M40 3 L8 11 L8 13 L40 21 Z" fill="#cfd2d8"/><path d="M12 11 L2 12 L12 13 Z" fill="#222"/></svg>`;
}

/** A small desk calculator, display and keys left blank. */
function calc({ x, y, w = 200, rot = 0, z = 4 }) {
  const h = Math.round(w * 1.3);
  const keys = [];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
    const col = i === 3 ? (j === 4 ? "#17473a" : "#d9962b") : "#ece8dd";
    keys.push(`<rect x="${16 + i * 44}" y="${82 + j * 34}" width="36" height="26" rx="6" fill="${col}"/><rect x="${16 + i * 44}" y="${82 + j * 34}" width="36" height="8" rx="4" fill="#fff" opacity=".25"/>`);
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 16px 12px rgba(10,10,10,.5))`)}" viewBox="0 0 200 260" aria-hidden="true">
  <rect x="2" y="2" width="196" height="256" rx="18" fill="#2c3834"/><rect x="2" y="2" width="196" height="256" rx="18" fill="none" stroke="#ffffff22" stroke-width="2"/>
  <rect x="14" y="14" width="172" height="52" rx="8" fill="#b9d6ad"/><rect x="14" y="14" width="172" height="18" rx="8" fill="#fff" opacity=".18"/>
  ${keys.join("")}</svg>`;
}

/** A flat digital kitchen scale seen from above with a little mound of flour on its plate, display left blank. */
function kScale({ x, y, w = 340, rot = 0, z = 4 }) {
  const h = Math.round(w * 0.48);
  const id = `ks${++uid}`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 18px 12px rgba(0,0,0,.55))`)}" viewBox="0 0 420 200" aria-hidden="true">
  <defs><linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f5f6"/><stop offset="1" stop-color="#b5bcc0"/></linearGradient>
  <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe3e5"/><stop offset="1" stop-color="#a3abaf"/></linearGradient>
  <radialGradient id="${id}f" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#fffefb"/><stop offset="1" stop-color="#e3dac6"/></radialGradient></defs>
  <rect x="4" y="4" width="412" height="192" rx="26" fill="url(#${id}a)"/><rect x="4" y="4" width="412" height="192" rx="26" fill="none" stroke="#00000024" stroke-width="2"/>
  <rect x="28" y="22" width="364" height="112" rx="16" fill="url(#${id}b)"/><rect x="28" y="22" width="364" height="112" rx="16" fill="none" stroke="#ffffffaa" stroke-width="3"/>
  <ellipse cx="206" cy="92" rx="92" ry="34" fill="#00000026"/>
  <path d="M120 100 C 130 52 170 40 206 40 C 246 40 284 54 294 100 C 260 118 160 118 120 100 Z" fill="url(#${id}f)"/>
  <ellipse cx="190" cy="62" rx="34" ry="9" fill="#fff" opacity=".8"/>
  <rect x="122" y="150" width="176" height="34" rx="8" fill="#b9d6ad" stroke="#4a5a52" stroke-opacity=".55" stroke-width="2.5"/><rect x="122" y="150" width="176" height="11" rx="6" fill="#fff" opacity=".3"/>
  <circle cx="70" cy="168" r="14" fill="#7a838a"/><circle cx="70" cy="165" r="14" fill="#fff" opacity=".18"/><circle cx="350" cy="168" r="14" fill="#7a838a"/><circle cx="350" cy="165" r="14" fill="#fff" opacity=".18"/></svg>`;
}

/** A kraft-paper bread bag standing up, its top folded over twice. */
function bag({ x, y, w = 200, rot = 0, z = 3, tone = "#cfa774" }) {
  const h = Math.round(w * 1.62);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 18px 14px rgba(50,30,10,.42))`)}" viewBox="0 0 200 324" aria-hidden="true">
  <defs><linearGradient id="bg${uid}" x1="0" x2="1"><stop offset="0" stop-color="#e2c192"/><stop offset=".5" stop-color="${tone}"/><stop offset="1" stop-color="#b78c58"/></linearGradient></defs>
  <path d="M10 70 H190 L196 318 Q 100 326 4 318 Z" fill="url(#bg${uid})"/>
  <path d="M190 70 L196 318 L168 322 L172 70 Z" fill="#000" opacity=".08"/>
  <path d="M6 28 H194 L190 74 H10 Z" fill="#bd9460"/><path d="M6 28 H194 L193 40 H7 Z" fill="#e6c999"/>
  <path d="M10 74 H190" stroke="#8a6234" stroke-opacity=".5" stroke-width="3"/>
  <path d="M14 40 H186 M12 56 H188" stroke="#8a6234" stroke-opacity=".25" stroke-width="2"/>
  <path d="M24 100 C 34 180 24 250 30 306" stroke="#fff" stroke-opacity=".28" stroke-width="10" fill="none" stroke-linecap="round"/>
  <path d="M100 74 V318" stroke="#8a6234" stroke-opacity=".14" stroke-width="2"/></svg>`;
}

/** A small stack of closed envelopes. */
function envelopes({ x, y, w = 220, rot = 0, z = 3 }) {
  const one = (dx, dy, r, c) => `<div style="${abs(dx, dy, w, Math.round(w * 0.64), `transform:rotate(${r}deg);background:${c};border-radius:4px;box-shadow:0 1px 2px rgba(0,0,0,.25),0 10px 16px rgba(40,25,10,.3);overflow:hidden`)}"><svg style="${abs(0, 0, w, w * 0.64)}" viewBox="0 0 ${w} ${w * 0.64}" aria-hidden="true"><path d="M0 0 L${w / 2} ${w * 0.4} L${w} 0" fill="#00000010" stroke="#00000022" stroke-width="2"/></svg></div>`;
  return `<div style="${abs(x, y, w, w * 0.9, `transform:rotate(${rot}deg);z-index:${z}`)}">${one(0, 54, -3, "#f2ead6")}${one(8, 28, 2, "#e6efe8")}${one(2, 0, -1, "#f8f4ea")}</div>`;
}

/** A wire cooling rack lying on the counter. */
function rack({ x, y, w, h, rot = 0, gap = 26, wire = "#8f979b", z = 1 }) {
  const lines = [];
  for (let i = gap; i < w; i += gap) lines.push(`<line x1="${i}" y1="4" x2="${i}" y2="${h - 4}"/>`);
  for (let j = gap; j < h; j += gap * 2) lines.push(`<line x1="4" y1="${j}" x2="${w - 4}" y2="${j}"/>`);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 8px 5px rgba(60,30,25,.38))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><g stroke="${wire}" stroke-width="4" fill="none" stroke-linecap="round"><rect x="3" y="3" width="${w - 6}" height="${h - 6}" rx="8"/>${lines.join("")}</g><g stroke="#fff" stroke-opacity=".5" stroke-width="1.5" fill="none">${lines.join("")}</g></svg>`;
}

/** A washi tape strip. */
const tape = (x, y, rot, color = "#d9b94c", w = 120, z = 6) => `<div style="${abs(x, y, w, 38, `z-index:${z};transform:rotate(${rot}deg);background:repeating-linear-gradient(115deg,${color} 0 14px,${color}cc 14px 28px);opacity:.88;box-shadow:0 2px 4px rgba(40,20,5,.25)`)}"></div>`;

/* ----------------------------------------------------------------- #20 kraft */

function kraftSurface(seed = 5) {
  const r = lcg(seed);
  const out = [];
  for (let k = 0; k < 54; k++) {
    let px = r() * 1000, py = r() * SCENE_H;
    const pts = [`${px.toFixed(0)},${py.toFixed(0)}`];
    const n = 3 + Math.floor(r() * 3);
    for (let m = 0; m < n; m++) { px += (r() - 0.35) * 220; py += (r() - 0.5) * 140; pts.push(`${px.toFixed(0)},${py.toFixed(0)}`); }
    const light = k % 2 === 0;
    out.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${light ? "#ecd5ae" : "#8d6a3d"}" stroke-opacity="${light ? (0.25 + r() * 0.25).toFixed(2) : (0.12 + r() * 0.16).toFixed(2)}" stroke-width="${(1.5 + r() * 3).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
  <defs><radialGradient id="kr" cx=".28" cy=".08" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#3b2509" stop-opacity=".34"/></radialGradient>
  <filter id="kn"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .38  0 0 0 0 .26  0 0 0 0 .1  0 0 0 .55 -.12"/></filter></defs>
  <rect width="1000" height="${SCENE_H}" fill="#c9a577"/>${out.join("")}
  <rect width="1000" height="${SCENE_H}" filter="url(#kn)"/>
  <rect y="${SCENE_H * 0.5}" width="1000" height="14" fill="#8d6a3d" opacity=".14"/><rect y="${SCENE_H * 0.5 + 14}" width="1000" height="10" fill="#fff" opacity=".1"/>
  <rect width="1000" height="${SCENE_H}" fill="url(#kr)"/></svg>`;
}

function pin20() {
  const i = idea(20);
  const pairs = i.items.map((t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; });
  const html = pairs.map(([them, me]) => `<div class="pair"><div class="b them">${esc(them)}</div><div class="b me">“${esc(me)}”</div></div>`).join("");
  const css = `
  .top h1{font-size:66px!important;white-space:nowrap}
  .panel{position:absolute;left:36px;top:432px;width:800px;padding:62px 38px 34px;background:#fbf8f0;border-radius:6px;transform:rotate(-0.9deg);
    box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(40,20,5,.38),0 40px 60px -20px rgba(40,20,5,.4);display:flex;flex-direction:column;gap:20px;z-index:2}
  .panel:before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:${FOREST};border-radius:6px 6px 0 0}
  .pair{display:flex;flex-direction:column;gap:7px}
  .b{position:relative;font:500 27px/1.28 "Plex",sans-serif;padding:13px 22px;border-radius:24px;max-width:640px}
  .them{align-self:flex-start;background:#dcdfdc;color:#39403c;font-style:italic;border-bottom-left-radius:6px}
  .me{align-self:flex-end;background:${FOREST};color:#fff;border-bottom-right-radius:6px;max-width:660px;text-align:left}
  .sticky{position:absolute;left:640px;top:386px;width:282px;height:168px;background:#f7d98a;transform:rotate(4deg);z-index:6;padding:24px 22px;
    box-shadow:0 2px 3px rgba(40,20,5,.25),0 14px 22px rgba(40,20,5,.32);font:700 46px/1.02 "Hand",cursive;color:#2a2a2a}
  .sticky:after{content:"";position:absolute;left:0;right:0;top:0;height:20px;background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,0))}`;
  const scene = `
  ${kraftSurface()}
  ${flour({ seed: 21, n: 120, op: 0.35, drifts: 3 })}
  <div class="panel" data-check="chat panel">${html}</div>
  <div class="sticky">${esc("You don't owe a reason.")}</div>
  ${tape(742, 372, -3, "#2f6b57", 110, 7)}
  ${mug({ x: 828, y: 1212, size: 112, color: "#f3ede4", drink: "#6b4226" })}
  ${pencil({ x: 80, y: 1296, len: 400, rot: -3 })}`;
  return printable({ n: 20, scene, paper: "#efe2cc", extraCss: css });
}

/* ----------------------------------------------------------------- #22 recipe card stand */

function pin22() {
  const i = idea(22);
  const q = i.headline.split("? ")[0] + "?";
  const ans = i.headline.split("? ")[1]; // "No, and the Charges Continue"
  const [no, rest] = [ans.slice(0, 3), ans.slice(3)];
  const css = `
  .wall{position:absolute;left:0;top:0;width:1000px;height:1086px;background:linear-gradient(#f0dcd5,#e5c7bf)}
  .ctr{position:absolute;left:0;top:1086px;width:1000px;height:414px;background:linear-gradient(#f6ebe6,#e2cdc5)}
  .ctr:before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:linear-gradient(#cfa58f,#e8cfc3);box-shadow:0 -6px 14px rgba(60,30,25,.2)}
  .card{position:absolute;left:60px;top:44px;width:880px;height:1040px;background:linear-gradient(160deg,#1d5545,${FOREST} 55%,#103a2f);border-radius:30px;
    box-shadow:0 3px 5px rgba(40,20,15,.3),0 30px 50px rgba(60,30,25,.4)}
  .card:before{content:"";position:absolute;inset:14px;border:2px solid rgba(255,255,255,.2);border-radius:20px;pointer-events:none}
  .q{position:absolute;left:58px;top:50px;width:780px;font:500 86px/1.02 "Newsreader",Georgia,serif;letter-spacing:-.02em;color:#fff}
  .it{position:absolute;left:350px;width:470px;padding:20px 24px;border-radius:16px;background:rgba(255,255,255,.1);border-left:6px solid #f0d58a;font:500 29px/1.28 "Plex",sans-serif;color:#eef5f1}
  .ans{position:absolute;left:58px;top:802px;width:790px;font:500 78px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;color:#f4f8f5}
  .ans b{font-weight:500;color:#f0d58a}
  .ledge{position:absolute;left:34px;top:1030px;width:932px;height:70px;z-index:3}
  .lab{position:absolute;left:60px;top:1160px;width:560px;padding:22px 28px;background:#fffaf1;border-radius:6px;transform:rotate(-1.2deg);font:600 31px/1.32 "Plex",sans-serif;color:#1d1d20;
    box-shadow:0 2px 3px rgba(60,30,25,.25),0 14px 24px rgba(60,30,25,.3);z-index:4}
  .lab:before{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:${FOREST};border-radius:6px 0 0 6px}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#f6ece8;box-shadow:0 -8px 22px rgba(60,30,25,.22);z-index:5}
  .foot{z-index:7}`;
  const phone = `<svg style="${abs(56, 336, 250, 440)}" viewBox="0 0 250 440" aria-hidden="true">
    <rect x="6" y="6" width="238" height="428" rx="40" fill="rgba(255,255,255,.06)" stroke="#e4ece8" stroke-width="8"/>
    <rect x="86" y="22" width="78" height="12" rx="6" fill="#e4ece8" opacity=".7"/>
    <rect x="62" y="150" width="126" height="126" rx="30" fill="#f0d58a"/><rect x="62" y="150" width="126" height="126" rx="30" fill="url(#ic)"/>
    <g fill="#17473a"><circle cx="101" cy="189" r="11"/><circle cx="149" cy="189" r="11"/><circle cx="101" cy="237" r="11"/><circle cx="149" cy="237" r="11"/></g>
    <circle cx="190" cy="152" r="32" fill="#d4472e" stroke="#17473a" stroke-width="6"/><path d="M178 140 L202 164 M202 140 L178 164" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
    <rect x="70" y="312" width="110" height="10" rx="5" fill="#e4ece8" opacity=".55"/><rect x="90" y="334" width="70" height="10" rx="5" fill="#e4ece8" opacity=".35"/>
    <defs><linearGradient id="ic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#b87a14" stop-opacity=".3"/></linearGradient></defs></svg>`;
  const ledge = `<svg class="ledge" viewBox="0 0 932 70" aria-hidden="true" style="filter:drop-shadow(0 14px 10px rgba(60,30,25,.4))">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2b983"/><stop offset=".5" stop-color="#cf9f66"/><stop offset="1" stop-color="#a97a42"/></linearGradient></defs>
    <rect x="0" y="12" width="932" height="58" rx="10" fill="url(#lg)"/><rect x="0" y="12" width="932" height="10" rx="5" fill="#fff" opacity=".3"/>
    <path d="M40 40 C 300 34 600 46 892 38 M30 56 C 320 52 640 62 900 54" stroke="#8a6234" stroke-opacity=".28" stroke-width="2" fill="none"/>
    <rect x="0" y="0" width="38" height="70" rx="10" fill="#c28f56"/><rect x="894" y="0" width="38" height="70" rx="10" fill="#c28f56"/></svg>`;
  const receipt = `<div style="${abs(738, 1128, 168, 214, "transform:rotate(5deg);background:#fffdf7;z-index:3;box-shadow:0 2px 3px rgba(60,30,25,.25),0 14px 20px rgba(60,30,25,.32);clip-path:polygon(0 0,100% 0,100% 94%,92% 98%,84% 94%,76% 98%,68% 94%,60% 98%,52% 94%,44% 98%,36% 94%,28% 98%,20% 94%,12% 98%,4% 94%,0 98%)")}">
    <div style="${abs(20, 22, 128, 14, "background:#17473a;border-radius:3px")}"></div>
    ${[0, 1, 2, 3].map((k) => `<div style="${abs(20, 60 + k * 28, 128 - (k % 3) * 28, 8, "background:#c4c2ba;border-radius:3px")}"></div>`).join("")}
    <div style="${abs(20, 176, 128, 3, "background:#9a968a")}"></div></div>`;
  const body = `
  <div class="wall"></div>${flour({ x: 0, y: 0, w: 1000, h: 1086, seed: 9, n: 90, op: 0.28, drifts: 3 })}
  <div class="ctr"></div>
  ${rack({ x: 690, y: 1138, w: 262, h: 196, rot: 4, gap: 28, z: 2 })}
  ${receipt}
  <div class="card">
    <div class="q" data-check="headline" style="height:270px">${esc(q)}</div>
    ${phone}
    <div class="it" style="top:346px">${esc(i.items[0])}</div>
    <div class="it" style="top:566px">${esc(i.items[1])}</div>
    <div class="ans" data-check="answer"><b>${esc(no)}</b>${esc(rest)}</div>
  </div>
  ${ledge}
  <div class="lab" data-check="label">${esc(i.items[2])}</div>
  ${flour({ x: 0, y: 1086, w: 1000, h: 268, seed: 31, n: 120, op: 0.45, drifts: 4 })}
  <div class="footbar"></div>${footFor(i)}`;
  return { n: 22, id: `22-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: "#f6ece8" }) };
}

/* ----------------------------------------------------------------- #24 slate ladder */

function slateSurface() {
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
  <defs><radialGradient id="sl" cx=".3" cy=".1" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
  <filter id="sn"><feTurbulence type="fractalNoise" baseFrequency=".022 .05" numOctaves="4" seed="8"/><feColorMatrix values="0 0 0 0 .75  0 0 0 0 .8  0 0 0 0 .8  0 0 0 .9 -.28"/></filter>
  <filter id="sg"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .35 -.08"/></filter></defs>
  <rect width="1000" height="${SCENE_H}" fill="#2c3336"/><rect width="1000" height="${SCENE_H}" filter="url(#sn)" opacity=".5"/>
  <rect width="1000" height="${SCENE_H}" filter="url(#sg)" opacity=".5"/>
  <path d="M-20 150 C 200 120 380 220 560 190 S 900 120 1020 160" stroke="#fff" stroke-opacity=".08" stroke-width="40" fill="none"/>
  <rect width="1000" height="${SCENE_H}" fill="url(#sl)"/></svg>`;
}

function pin24() {
  const i = idea(24);
  const rows = [
    ["Weekly", "Multiply by 52, divide by 12", null],
    ["Every two weeks", "Multiply by 26, divide by 12", null],
    ["Quarterly", "Divide by 3", ["$612 every three months is ", "$204", "pop"]],
    ["Every six months", "Divide by 6", ["$300 twice a year is ", "$50", ""]],
    ["Annual", "Divide by 12", ["$96 a year is ", "$8", ""]],
  ];
  const rung = `<div class="rung"></div>`;
  const rowHtml = rows.map(([lab, doit, ex]) => `<div class="row"><div class="l"><b>${esc(lab)}</b><span>${esc(doit)}</span></div><div class="r">${ex ? `<div class="exw">${EX}<div class="et">${esc(ex[0])}<em class="${ex[2]}">${esc(ex[1])}</em></div></div>` : ""}</div></div>`).join(rung);
  const css = `
  .lad{position:absolute;left:60px;top:400px;width:850px;height:842px;background:#fbf9f2;border-radius:5px;transform:rotate(-1.1deg);z-index:2;
    box-shadow:0 2px 3px rgba(0,0,0,.35),0 20px 36px rgba(0,0,0,.5),0 44px 64px -20px rgba(0,0,0,.5);
    background-image:repeating-linear-gradient(transparent 0 33px,#cfdcd5 33px 34px)}
  .lad:before{content:"";position:absolute;left:0;top:0;bottom:0;width:6px;background:#e9a9b4;opacity:.0}
  .rail{position:absolute;top:18px;bottom:18px;width:11px;background:${FOREST};border-radius:6px}
  .grid{position:absolute;left:56px;right:56px;top:34px}
  .rung{height:9px;background:${FOREST};border-radius:5px;margin:0 -34px}
  .row{height:144px;display:grid;grid-template-columns:392px 1fr;align-items:center;background:rgba(251,249,242,.88)}
  .l{display:flex;flex-direction:column;gap:6px;padding-left:30px}
  .l b{font:600 42px/1 "Newsreader",Georgia,serif;color:#0f2f27}
  .l span{font:500 28px/1.15 "Plex",sans-serif;color:#2c3a34}
  .r{padding-left:24px;border-left:3px solid #c8d6cd;height:100%;display:flex;align-items:center}
  .exw{display:flex;flex-direction:column;align-items:flex-start;gap:8px}
  .et{font:500 28px/1.15 "Plex",sans-serif;color:#2c3a34}
  .et em{font:600 46px/1 "Newsreader",Georgia,serif;font-style:normal;color:${FOREST}}
  .et em.pop{font-size:54px;color:#c2610f;background:linear-gradient(transparent 58%,#f6d77a 58% 92%,transparent 92%);padding:0 6px;margin-left:2px}`;
  const scene = `
  ${slateSurface()}
  ${flour({ seed: 14, n: 260, op: 0.5, drifts: 7 })}
  <div class="lad" data-check="page"><div class="rail" style="left:40px"></div><div class="rail" style="right:40px"></div>
    <div class="grid">${rung}${rowHtml}${rung}</div></div>
  ${flour({ x: 0, y: 1130, w: 1000, h: 224, seed: 77, n: 90, op: 0.45, drifts: 3 })}
  ${kScale({ x: 36, y: 1194, w: 330, rot: -2 })}
  ${pencil({ x: 410, y: 1296, len: 360, rot: -4 })}
  ${calc({ x: 770, y: 1180, w: 170, rot: 7 })}`;
  const tag = `<span class="example" style="position:absolute;z-index:9;left:604px;top:251px;font-size:24px;padding:4px 10px;background:#eef1ec">Example</span>`;
  const out = printable({ n: 24, scene, paper: "#ebe6da", extraCss: css });
  out.html = out.html.replace(/(<div class="foot)/, `${tag}$1`);
  return out;
}

/* ----------------------------------------------------------------- #28 linen checklist */

function pin28() {
  const i = idea(28);
  const ticked = new Set([0, 1, 4, 7]);
  const tick = `<svg viewBox="0 0 44 44" style="position:absolute;left:3px;top:-12px;width:46px;height:46px" aria-hidden="true"><path d="M7 24 C 13 28 16 33 19 38 C 25 22 33 12 44 3" fill="none" stroke="${FOREST}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows = i.items.map((t, k) => `<div class="ck"><div class="bx">${ticked.has(k) ? tick : ""}</div><div class="tx">${esc(t)}</div></div>`).join("");
  const css = `
  .lin{position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${SCENE_H}px;
    background:repeating-linear-gradient(0deg,rgba(130,105,60,.09) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(130,105,60,.08) 0 1px,transparent 1px 5px),
    radial-gradient(ellipse at 25% 8%,rgba(255,255,255,.35),rgba(60,40,10,.18) 120%),#e6d9bd}
  .chk{position:absolute;left:38px;top:410px;width:752px;padding:46px 30px 22px 34px;background:#fdfbf4;border-radius:5px;transform:rotate(-1.3deg);z-index:2;
    box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(40,20,5,.35),0 40px 60px -20px rgba(40,20,5,.4)}
  .chk:before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:${FOREST};border-radius:5px 5px 0 0}
  .ck{display:flex;align-items:center;gap:22px;height:88px;border-bottom:2px dashed #c9d3cc}
  .ck:last-child{border-bottom:0}
  .bx{position:relative;flex:none;width:42px;height:42px;border:3.5px solid ${FOREST};border-radius:7px;background:#fff}
  .tx{font:500 28px/1.2 "Plex",sans-serif;color:#1d1d20}`;
  const scene = `
  <div class="lin"></div>
  ${flour({ seed: 3, n: 200, op: 0.55, drifts: 6, color: "#fffef8" })}
  ${rollingPin({ x: 26, y: 1282, len: 560, rot: 0.8, z: 4 })}
  <div class="chk" data-check="page">${rows}</div>
  ${bag({ x: 800, y: 392, w: 186, rot: 3, z: 3 })}
  ${envelopes({ x: 776, y: 830, w: 216, rot: 5, z: 3 })}
  ${pen({ x: 620, y: 1286, len: 340, rot: -7 })}`;
  return printable({ n: 28, scene, paper: "#f1e9d6", extraCss: css });
}

/* ----------------------------------------------------------------- #32 flour jars */

function beadboard() {
  const out = [];
  const pw = 92;
  for (let k = 0; k < 12; k++) {
    const x = k * pw;
    out.push(`<rect x="${x}" y="0" width="${pw}" height="${SCENE_H}" fill="${k % 2 ? "#a3c7b9" : "#9bc0b2"}"/>`);
    out.push(`<rect x="${x}" y="0" width="4" height="${SCENE_H}" fill="#4f7a6c" opacity=".55"/><rect x="${x + 4}" y="0" width="3" height="${SCENE_H}" fill="#fff" opacity=".4"/>`);
    out.push(`<rect x="${x + 34}" y="0" width="2" height="${SCENE_H}" fill="#4f7a6c" opacity=".22"/><rect x="${x + 36}" y="0" width="2" height="${SCENE_H}" fill="#fff" opacity=".28"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="bb" cx=".25" cy=".05" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#16342b" stop-opacity=".34"/></radialGradient></defs>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#bb)"/></svg>`;
}

/** A canning jar of flour, filled to `level` (0-1 of the body). */
function flourJar({ x, y, w = 270, level, seed = 1, z = 3 }) {
  const r = lcg(seed);
  const id = `fj${++uid}`;
  const body = "M46 76 C 46 100 12 100 12 132 V 372 Q 12 402 42 402 H 228 Q 258 402 258 372 V 132 C 258 100 224 100 224 76 Z";
  const top = 400 - level * 268;
  const specks = Array.from({ length: 50 }, () => `<circle cx="${(24 + r() * 222).toFixed(0)}" cy="${(top + 10 + r() * (390 - top)).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#cfc6b0" opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, w, 410, `z-index:${z};filter:drop-shadow(0 20px 14px rgba(20,40,32,.45))`)}" viewBox="0 0 270 410" aria-hidden="true">
  <defs><clipPath id="${id}c"><path d="${body}"/></clipPath>
  <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".18" stop-color="#e3f1ec" stop-opacity=".18"/><stop offset=".82" stop-color="#d4e6df" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".5"/></linearGradient>
  <linearGradient id="${id}f" x1="0" x2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset=".5" stop-color="#f6f0e2"/><stop offset="1" stop-color="#e2d9c5"/></linearGradient>
  <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7e9ec"/><stop offset=".5" stop-color="#b9bfc6"/><stop offset="1" stop-color="#8f969e"/></linearGradient></defs>
  <path d="${body}" fill="#e4f1ec" fill-opacity=".5"/>
  <g clip-path="url(#${id}c)"><rect x="0" y="${top}" width="270" height="${410 - top}" fill="url(#${id}f)"/>${specks}
    <ellipse cx="135" cy="${top}" rx="140" ry="13" fill="#fffef9"/><ellipse cx="135" cy="${top + 3}" rx="140" ry="13" fill="none" stroke="#d8cfba" stroke-width="2"/><ellipse cx="115" cy="${top - 2}" rx="60" ry="4" fill="#fff"/></g>
  <path d="${body}" fill="url(#${id}g)" stroke="#6f9a8c" stroke-opacity=".75" stroke-width="3.5"/>
  <path d="M34 128 C 28 170 28 230 30 300" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="9" stroke-linecap="round"/>
  <path d="M236 150 C 240 200 240 260 238 320" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/>
  <rect x="42" y="38" width="186" height="44" rx="8" fill="url(#${id}l)"/><rect x="42" y="2" width="186" height="40" rx="10" fill="url(#${id}l)"/>
  ${Array.from({ length: 12 }, (_, k) => `<line x1="${54 + k * 15}" y1="8" x2="${54 + k * 15}" y2="76" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`).join("")}
  <rect x="42" y="2" width="186" height="9" rx="4" fill="#fff" opacity=".5"/></svg>`;
}

function pin32() {
  const i = idea(32);
  const data = i.items.map((t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; });
  const levels = [60 / 122 * 0.9, 91 / 122 * 0.9, 0.9];
  const JX = [60, 365, 670], JY = 500;
  const tagColors = ["#f4ecd6", "#f4ecd6", "#f2b247"];
  const tags = data.map(([lab], k) => `<div class="tg" style="left:${JX[k] + 12}px;top:${JY + 98}px;background:${tagColors[k]};transform:rotate(${[-3, 2, -2][k]}deg)"><i></i>${esc(lab)}</div>`).join("");
  const strings = `<svg style="${abs(0, 0, 1000, 1500, "z-index:6;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">${JX.map((jx, k) => `<path d="M${jx + 46} ${JY + 80} C ${jx + 40} ${JY + 98} ${jx + 36} ${JY + 114} ${jx + 36} ${JY + 128}" stroke="#7a5a33" stroke-width="3" fill="none"/><path d="M${jx + 46} ${JY + 76} Q ${jx + 135} ${JY + 94} ${jx + 224} ${JY + 76}" stroke="#7a5a33" stroke-width="3" fill="none"/>`).join("")}</svg>`;
  const cards = data.map(([, res], k) => `<div class="rc" style="left:${JX[k]}px;transform:rotate(${[-1.2, 0.8, -0.6][k]}deg)" data-check="result">${EX}<p>${esc(res)}</p></div>`).join("");
  const css = `
  .tg{position:absolute;z-index:7;width:266px;height:64px;padding:0 10px 0 46px;display:flex;align-items:center;border-radius:6px 14px 14px 6px;font:700 26px/1.05 "Plex",sans-serif;color:#1d1d20;
    box-shadow:0 2px 3px rgba(40,25,10,.3),0 10px 14px rgba(20,40,32,.3);white-space:nowrap}
  .tg i{position:absolute;left:12px;top:50%;width:18px;height:18px;margin-top:-9px;border-radius:50%;background:#9bc0b2;box-shadow:inset 0 2px 3px rgba(0,0,0,.35)}
  .rc{position:absolute;top:1030px;width:270px;height:300px;padding:22px 20px 14px;background:#f5ead2;border-radius:4px;z-index:4;
    box-shadow:0 2px 3px rgba(20,40,32,.3),0 14px 20px rgba(20,40,32,.32)}
  .rc p{font:500 26px/1.24 "Plex",sans-serif;color:#17473a;margin-top:12px}
  .bill{position:absolute;left:150px;top:392px;width:470px;height:520px;background:#fbf8ef;transform:rotate(-4deg);z-index:1;border-radius:3px;
    box-shadow:0 2px 3px rgba(20,40,32,.3),0 16px 26px rgba(20,40,32,.34)}`;
  const bill = `<div class="bill"><div style="${abs(0, 0, 470, 90, "background:#e3a93a;border-radius:3px 3px 0 0")}"></div><div style="${abs(26, 14, 62, 62, "")}">${icon("lightning", { size: 62, color: "#1d1d20", weight: "fill" })}</div>
    <div style="${abs(110, 30, 220, 14, "background:#1d1d20;opacity:.75;border-radius:4px")}"></div><div style="${abs(110, 54, 140, 10, "background:#1d1d20;opacity:.4;border-radius:4px")}"></div>
    ${Array.from({ length: 9 }, (_, k) => `<div style="${abs(30, 130 + k * 34, 410 - (k % 4) * 60, 9, "background:#c4c8c0;border-radius:4px")}"></div>`).join("")}
    <div style="${abs(0, 258, 470, 2, "background:#00000014")}"></div></div>`;
  const shelf = `<svg style="${abs(0, 868, 1000, 130, "z-index:2;filter:drop-shadow(0 18px 14px rgba(20,40,32,.5))")}" viewBox="0 0 1000 130" aria-hidden="true">
    <defs><linearGradient id="sh1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c493"/><stop offset="1" stop-color="#d1a06a"/></linearGradient><linearGradient id="sh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58f55"/><stop offset="1" stop-color="#946332"/></linearGradient></defs>
    <path d="M-10 18 H1010 L1030 62 H-30 Z" fill="url(#sh1)"/><rect x="-30" y="62" width="1060" height="62" fill="url(#sh2)"/><rect x="-30" y="62" width="1060" height="7" fill="#fff" opacity=".28"/>
    <path d="M0 84 C 300 78 640 92 1000 82 M0 104 C 340 100 660 110 1000 102" stroke="#6b4421" stroke-opacity=".3" stroke-width="2.5" fill="none"/>
    <path d="M60 36 C 300 30 700 42 940 34" stroke="#8a6234" stroke-opacity=".2" stroke-width="2" fill="none"/></svg>`;
  const scene = `
  ${beadboard()}
  ${bill}
  ${flourJar({ x: JX[0], y: JY, level: levels[0], seed: 2 })}${flourJar({ x: JX[1], y: JY, level: levels[1], seed: 5 })}${flourJar({ x: JX[2], y: JY, level: levels[2], seed: 9 })}
  ${shelf}${strings}${tags}
  ${flour({ x: 0, y: 880, w: 1000, h: 60, seed: 12, n: 80, op: 0.5, drifts: 3 })}
  ${cards}
  ${tape(JX[0] + 172, 1030, -3, "#2f6b57", 100, 8)}${tape(JX[1] + 172, 1030, 2, "#d9b94c", 100, 8)}${tape(JX[2] + 172, 1030, -2, "#e9a9b4", 100, 8)}`;
  return printable({ n: 32, scene, paper: "#e6efe9", extraCss: css });
}

export const pins = [pin20(), pin22(), pin24(), pin28(), pin32()];
