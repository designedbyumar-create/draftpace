/**
 * Batch 2, group G9: five guide pins in an entryway (coat hooks, a coat, an umbrella stand, a shoe rack, a key
 * tray on a bench). Five different surfaces and moods:
 *
 *   #76  dusk-navy wall: three paper cards hang from brass hooks on an oak rail (Day 1 / Week 3 / Week 6), a bench below
 *   #78  warm putty plaster wall: one ruled quote card taped up, a green coat at the edge, an umbrella stand, a sticky note
 *   #85  dark walnut bench slats seen from above: two paper strips (pay, costs), four numbered tags, a calculator
 *   #84  whitewashed ash boards seen from above: the split-by-income register page, a key tray and a folded scarf
 *   #86  terracotta wall: the five-step notebook page taped up over a shelf with a mug and a calculator, a shoe rack
 *
 * Words: every word is the idea's own (headline, sub, items, proof) or a label that is real on the thing shown.
 * Set here and not verbatim from the bank:
 *   #76  card titles "Day 1", "Week 3", "Week 6" (from the visual and the headline's "Week Six"); the note under the
 *        cards is the proof line "This is an illustration, not a report of anyone's month"
 *   #78  the quotation marks around the quoted sentence
 *   #85  strip labels "Pay" and "Costs" (the sub's "pay" and the visual's "costs") with the sub's $3,240 / $3,410 / $170
 *   #84  table column heads "Bill", "Total", "You", "Them" (the visual's real column headers), "67%" and "33%"
 *        (the sub's "67 and 33 percent"), "Example only" (the sub's own first words, shown as the kit's tag)
 *   #86  step numbers 1 to 5
 * Drawn objects (props, bars, placeholder slips and tabs) carry no printed words.
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
const AMBER = "#d9962b";
const EX = (t = "Example") => `<span class="example" style="font-size:24px;padding:4px 10px">${esc(t)}</span>`;
const shadow = (s = 1) => `box-shadow:0 2px 3px rgba(20,15,10,${0.28}),0 ${16 * s}px ${30 * s}px rgba(20,15,10,.36),0 ${36 * s}px ${56 * s}px -20px rgba(20,15,10,.4)`;

/* ----------------------------------------------------------------- shared props */

/** An oak peg rail with brass hooks at the given x centres; hooks point up-front like real coat hooks. */
function hookRail({ y = 392, hooks = [], z = 2 }) {
  const id = `hr${++uid}`;
  return `<svg style="${abs(0, y, 1000, 110, `z-index:${z};filter:drop-shadow(0 14px 10px rgba(0,0,0,.45))`)}" viewBox="0 0 1000 110" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcb27c"/><stop offset=".5" stop-color="#c0915a"/><stop offset="1" stop-color="#94683a"/></linearGradient>
  <radialGradient id="${id}b" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#f6e2a0"/><stop offset="1" stop-color="#a5782a"/></radialGradient></defs>
  <rect x="-10" y="0" width="1020" height="54" rx="8" fill="url(#${id})"/><rect x="-10" y="0" width="1020" height="9" rx="4" fill="#fff" opacity=".28"/>
  <path d="M0 24 C 300 18 640 30 1000 22 M0 40 C 320 36 660 46 1000 38" stroke="#6b4421" stroke-opacity=".28" stroke-width="2.4" fill="none"/>
  ${hooks.map((x) => `<g><circle cx="${x}" cy="30" r="17" fill="url(#${id}b)" stroke="#7d5a1c" stroke-opacity=".6" stroke-width="2"/>
    <path d="M${x} 36 C ${x} 62 ${x + 2} 70 ${x + 16} 76 C ${x + 28} 80 ${x + 30} 66 ${x + 22} 62" fill="none" stroke="#b98a30" stroke-width="10" stroke-linecap="round"/>
    <path d="M${x - 2} 40 C ${x - 2} 62 ${x} 68 ${x + 12} 72" fill="none" stroke="#f6e2a0" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/></g>`).join("")}</svg>`;
}

/** A coat hanging on a hook: viewBox 300 x 560; place it with its hook point at (x + w/2, y). */
function coat({ x, y, w = 300, color = "#35604f", dark = "#254a3c", z = 2, rot = 0 }) {
  const h = Math.round(w * 560 / 300);
  const id = `ct${++uid}`;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);transform-origin:50% 0;filter:drop-shadow(0 22px 16px rgba(30,20,10,.42))`)}" viewBox="0 0 300 560" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${color}"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
  <path d="M150 6 C 150 24 160 28 150 40 L 150 52" fill="none" stroke="#b98a30" stroke-width="7" stroke-linecap="round"/>
  <path d="M60 78 L 150 48 L 240 78" fill="none" stroke="#a97a42" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M96 60 L 204 60 C 246 70 264 96 264 136 L 272 500 Q 150 520 28 500 L 36 136 C 36 96 54 70 96 60 Z" fill="url(#${id})"/>
  <path d="M36 136 C 6 214 -2 360 6 470 L 56 478 C 60 360 68 230 84 142 Z" fill="${color}"/><path d="M264 136 C 294 214 302 360 294 470 L 244 478 C 240 360 232 230 216 142 Z" fill="${dark}"/>
  <path d="M6 470 L 56 478 L 58 450 L 8 442 Z" fill="#000" opacity=".16"/><path d="M294 470 L 244 478 L 242 450 L 292 442 Z" fill="#000" opacity=".22"/>
  <path d="M96 60 L 150 130 L 204 60 L 186 54 L 150 92 L 114 54 Z" fill="#fff" opacity=".18"/><path d="M96 60 L 150 130 L 204 60" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>
  <path d="M150 130 V 508" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
  ${[190, 260, 330, 400].map((yy) => `<circle cx="140" cy="${yy}" r="9" fill="#c8a35e"/><circle cx="137" cy="${yy - 3}" r="3.5" fill="#fff" opacity=".6"/>`).join("")}
  <path d="M62 340 H 120 L 118 392 H 66 Z M180 340 H 238 L 234 392 H 182 Z" fill="#000" opacity=".12"/>
  <path d="M96 60 L 100 120 M204 60 L 200 120" stroke="#fff" stroke-opacity=".12" stroke-width="3"/></svg>`;
}

/** A closed umbrella, tip up (viewBox 80 x 330), or crook up when `crook`. */
function umbrella({ x, y, w = 80, color = "#22364f", crook = false, rot = 0, z = 2 }) {
  const h = Math.round(w * 330 / 80);
  const id = `um${++uid}`;
  const body = crook
    ? `<path d="M40 70 C 60 120 66 200 56 300 H 24 C 14 200 20 120 40 70 Z" fill="url(#${id})"/><path d="M24 170 H 56 L 57 190 H 23 Z" fill="#000" opacity=".25"/>
       <path d="M40 74 V 24 C 40 -4 8 -4 8 22" fill="none" stroke="#6b4421" stroke-width="12" stroke-linecap="round"/><path d="M40 70 V 26" stroke="#c0915a" stroke-width="3" opacity=".7"/>`
    : `<path d="M40 8 C 62 70 72 160 60 290 H 20 C 8 160 18 70 40 8 Z" fill="url(#${id})"/><path d="M20 150 H 60 L 61 172 H 19 Z" fill="#000" opacity=".25"/>
       <path d="M40 8 L 40 0" stroke="#999" stroke-width="5" stroke-linecap="round"/><path d="M30 60 C 24 120 24 200 28 280" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5" stroke-linecap="round"/>`;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);transform-origin:50% 100%;filter:drop-shadow(0 10px 8px rgba(0,0,0,.4))`)}" viewBox="0 0 80 330" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>${body}</svg>`;
}

/** A tall metal umbrella stand holding two umbrellas; box (x, y) top-left, width w. */
function umbrellaStand({ x, y, w = 220, z = 3 }) {
  const id = `us${++uid}`;
  const sc = w / 220;
  return `${umbrella({ x: x + 22 * sc, y: y + 50 * sc - 82 * sc * 4.125, w: 82 * sc, color: "#5a82b4", rot: -4, z })}
  ${umbrella({ x: x + 104 * sc, y: y + 50 * sc - 76 * sc * 4.125, w: 76 * sc, color: "#c58a22", crook: true, rot: 5, z })}
  <svg style="${abs(x, y, w, 290 * sc, `z-index:${z + 1};filter:drop-shadow(0 18px 12px rgba(0,0,0,.45))`)}" viewBox="0 0 220 290" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" stop-color="#6c7378"/><stop offset=".3" stop-color="#b9c0c5"/><stop offset=".7" stop-color="#7b838a"/><stop offset="1" stop-color="#4b5258"/></linearGradient></defs>
  <path d="M14 24 H 206 L 196 270 Q 110 290 24 270 Z" fill="url(#${id})"/>
  <ellipse cx="110" cy="24" rx="96" ry="16" fill="#3d4448"/><ellipse cx="110" cy="22" rx="96" ry="16" fill="none" stroke="#d8dde0" stroke-width="5"/>
  ${[70, 110, 150, 190, 230].map((yy) => `<path d="M${20 + (yy - 24) * 0.04} ${yy} Q 110 ${yy + 14} ${200 - (yy - 24) * 0.04} ${yy}" stroke="#000" stroke-opacity=".16" stroke-width="3" fill="none"/>`).join("")}
  <path d="M34 50 L 40 250" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/></svg>`;
}

/** A side-view sneaker (viewBox 200 x 90), toe to the right. */
function shoe({ x, y, w = 200, color = "#e6dfcf", sole = "#fbfaf6", flip = false, z = 2, rot = 0 }) {
  const h = Math.round(w * 0.45);
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg) scaleX(${flip ? -1 : 1});filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))`)}" viewBox="0 0 200 90" aria-hidden="true">
  <path d="M8 66 C 8 42 28 34 50 32 L 78 16 C 98 10 108 30 130 40 C 164 46 194 52 194 68 L 194 74 H 8 Z" fill="${color}"/>
  <path d="M8 66 C 8 42 28 34 50 32 L 78 16 C 98 10 108 30 130 40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
  <path d="M84 24 L 96 38 M96 20 L 108 34" stroke="#000" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>
  <rect x="4" y="68" width="194" height="16" rx="8" fill="${sole}"/><rect x="4" y="68" width="194" height="16" rx="8" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>
  <path d="M140 50 C 170 52 186 58 190 66" stroke="#000" stroke-opacity=".14" stroke-width="3" fill="none"/></svg>`;
}

/** A top-down leather key tray with a ring of keys and two coins (viewBox 340 x 220). */
function keyTray({ x, y, w = 330, rot = 0, z = 4, leather = "#8a4f2c" }) {
  const h = Math.round(w * 220 / 340);
  const id = `kt${++uid}`;
  const key = (cx, cy, r) => `<g transform="rotate(${r} ${cx} ${cy})"><circle cx="${cx}" cy="${cy}" r="17" fill="#d4ad4a" stroke="#8a6a1c" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="6" fill="${leather}"/>
    <rect x="${cx + 14}" y="${cy - 6}" width="82" height="12" rx="3" fill="#d4ad4a" stroke="#8a6a1c" stroke-width="2"/><path d="M${cx + 66} ${cy + 6} v14 h8 v-14 M${cx + 82} ${cy + 6} v10 h8 v-10" fill="#d4ad4a" stroke="#8a6a1c" stroke-width="2"/></g>`;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 16px 12px rgba(30,15,5,.5))`)}" viewBox="0 0 340 220" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${leather}"/><stop offset="1" stop-color="#5e3419"/></linearGradient></defs>
  <rect x="4" y="4" width="332" height="212" rx="40" fill="url(#${id})"/><rect x="26" y="26" width="288" height="168" rx="26" fill="#000" opacity=".22"/>
  <rect x="26" y="26" width="288" height="168" rx="26" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
  <rect x="14" y="14" width="312" height="192" rx="32" fill="none" stroke="#f1d9b8" stroke-opacity=".5" stroke-width="2" stroke-dasharray="7 6"/>
  <circle cx="200" cy="92" r="21" fill="none" stroke="#c9ccd1" stroke-width="5"/>${key(170, 96, 18)}${key(170, 96, -28)}
  <circle cx="86" cy="150" r="22" fill="#d9a441" stroke="#8a6a1c" stroke-width="2"/><circle cx="86" cy="150" r="15" fill="none" stroke="#8a6a1c" stroke-opacity=".5" stroke-width="2"/>
  <circle cx="120" cy="162" r="19" fill="#cfd3d8" stroke="#7b838a" stroke-width="2"/></svg>`;
}

/** A small desk calculator, display and keys left blank. */
function calc({ x, y, w = 190, rot = 0, z = 4, body = "#2c3834" }) {
  const h = Math.round(w * 1.3);
  const keys = [];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 4; i++) {
    const col = i === 3 ? (j === 4 ? FOREST : AMBER) : "#ece8dd";
    keys.push(`<rect x="${16 + i * 44}" y="${82 + j * 34}" width="36" height="26" rx="6" fill="${col}"/><rect x="${16 + i * 44}" y="${82 + j * 34}" width="36" height="8" rx="4" fill="#fff" opacity=".25"/>`);
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 16px 12px rgba(10,10,10,.5))`)}" viewBox="0 0 200 260" aria-hidden="true">
  <rect x="2" y="2" width="196" height="256" rx="18" fill="${body}"/><rect x="2" y="2" width="196" height="256" rx="18" fill="none" stroke="#ffffff22" stroke-width="2"/>
  <rect x="14" y="14" width="172" height="52" rx="8" fill="#b9d6ad"/><rect x="14" y="14" width="172" height="18" rx="8" fill="#fff" opacity=".18"/>${keys.join("")}</svg>`;
}

/** A washi tape strip. */
const tape = (x, y, rot, color = "#d9b94c", w = 120, z = 8) => `<div style="${abs(x, y, w, 38, `z-index:${z};transform:rotate(${rot}deg);background:repeating-linear-gradient(115deg,${color} 0 14px,${color}cc 14px 28px);opacity:.9;box-shadow:0 2px 4px rgba(40,20,5,.25)`)}"></div>`;

/** A blank sticky note with a torn top edge. */
const sticky = (x, y, w, h, rot, color = "#f7d98a", z = 6) => `<div style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);background:${color};box-shadow:0 2px 3px rgba(20,15,10,.25),0 14px 22px rgba(20,15,10,.32);clip-path:polygon(0 4%,8% 0,20% 3%,34% 0,48% 3%,62% 0,76% 3%,90% 0,100% 3%,100% 100%,0 100%)`)}"></div>`;

/** A front-view bench: ticking cushion on an oak frame (top of cushion at yTop). */
function bench({ yTop, z = 2 }) {
  const id = `bn${++uid}`;
  return `<svg style="${abs(0, yTop - 6, 1000, 1360 - yTop, `z-index:${z};filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))`)}" viewBox="0 0 1000 ${1360 - yTop}" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcb27c"/><stop offset="1" stop-color="#a47440"/></linearGradient>
  <pattern id="${id}t" width="44" height="10" patternUnits="userSpaceOnUse"><rect width="44" height="10" fill="#f4ecd6"/><rect width="14" height="10" fill="#c58a22"/></pattern></defs>
  <rect x="16" y="64" width="968" height="40" rx="10" fill="url(#${id})"/><rect x="16" y="64" width="968" height="8" rx="4" fill="#fff" opacity=".3"/>
  <rect x="44" y="102" width="44" height="${1360 - yTop - 102}" fill="#9a6a38"/><rect x="912" y="102" width="44" height="${1360 - yTop - 102}" fill="#9a6a38"/>
  <rect x="88" y="150" width="824" height="22" fill="#a47440"/>
  <rect x="6" y="6" width="988" height="66" rx="30" fill="url(#${id}t)"/><rect x="6" y="6" width="988" height="66" rx="30" fill="#000" opacity=".1"/>
  <path d="M30 18 C 300 8 700 8 970 18" stroke="#fff" stroke-opacity=".5" stroke-width="6" fill="none" stroke-linecap="round"/>
  <rect x="6" y="6" width="988" height="66" rx="30" fill="none" stroke="#7a5a1c" stroke-opacity=".35" stroke-width="2"/></svg>`;
}

/* ----------------------------------------------------------------- #76 hanging scenario cards */

function pin76() {
  const i = idea(76);
  const CX = [44, 356, 668];
  const wall = `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
  <defs><linearGradient id="w76" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36516a"/><stop offset="1" stop-color="#23384c"/></linearGradient>
  <radialGradient id="w76l" cx=".28" cy=".08" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>
  <filter id="w76n"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .22 -.04"/></filter></defs>
  <rect width="1000" height="${SCENE_H}" fill="url(#w76)"/><rect width="1000" height="${SCENE_H}" filter="url(#w76n)" opacity=".7"/>
  <rect x="0" y="${SCENE_H - 214}" width="1000" height="214" fill="#1d2f40"/><rect x="0" y="${SCENE_H - 218}" width="1000" height="8" fill="#e8dcc4" opacity=".75"/>
  <rect width="1000" height="${SCENE_H}" fill="url(#w76l)"/></svg>`;
  const strings = CX.map((cx) => {
    const hx = cx + 144;
    return `<path d="M${hx + 18} 462 L ${cx + 34} 506 M${hx + 18} 462 L ${cx + 254} 506" stroke="#e8dcc4" stroke-width="3.5" fill="none" stroke-linecap="round" style="filter:drop-shadow(0 3px 2px rgba(0,0,0,.4))"/>`;
  }).join("");
  const holes = CX.map((cx) => `<circle cx="${cx + 34}" cy="506" r="7" fill="#233a4e"/><circle cx="${cx + 254}" cy="506" r="7" fill="#233a4e"/>`).join("");
  // illustrations (no words)
  const tabs = (() => {
    const cols = ["#17473a", "#2f6b57", "#6f9a8c", "#9bc0b2"];
    const out = [];
    for (let k = 0; k < 14; k++) {
      const cx = (k % 2) * 124, cy = Math.floor(k / 2) * 40;
      out.push(`<g transform="translate(${cx} ${cy})"><rect width="116" height="32" rx="6" fill="#eef4f1" stroke="#c8d6cd" stroke-width="2"/><rect width="26" height="32" rx="6" fill="${cols[k % 4]}"/><rect x="38" y="13" width="64" height="6" rx="3" fill="#b9c4be"/></g>`);
    }
    return `<svg viewBox="0 0 240 280" style="width:100%;height:274px" aria-hidden="true">${out.join("")}</svg>`;
  })();
  const slips = (() => {
    const r = lcg(41);
    const out = [];
    for (let k = 0; k < 15; k++) {
      const cx = 30 + r() * 110, cy = 14 + r() * 100, rot = (r() - 0.5) * 70;
      out.push(`<g transform="translate(${cx.toFixed(0)} ${cy.toFixed(0)}) rotate(${rot.toFixed(0)} 50 60)"><rect width="100" height="120" rx="3" fill="${k % 3 ? "#fffdf7" : "#f2ead6"}" stroke="#00000022" stroke-width="2"/><rect x="12" y="18" width="52" height="7" rx="3" fill="#b3b8b0"/><rect x="12" y="34" width="72" height="7" rx="3" fill="#cfd2cb"/><rect x="12" y="50" width="40" height="7" rx="3" fill="#cfd2cb"/></g>`);
    }
    return `<svg viewBox="0 0 240 240" style="width:100%;height:210px" aria-hidden="true">${out.join("")}
      <g transform="translate(70 66) rotate(-6 60 60)"><rect width="128" height="116" rx="4" fill="#fffdf7" stroke="#00000030" stroke-width="2"/><rect x="0" y="0" width="128" height="14" rx="4" fill="${AMBER}"/></g></svg>`;
  })();
  const phoneMug = `<svg viewBox="0 0 240 190" style="width:100%;height:178px" aria-hidden="true">
    <g transform="rotate(-8 60 100)"><rect x="14" y="20" width="96" height="160" rx="16" fill="#2b3036"/><rect x="14" y="20" width="96" height="160" rx="16" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="2"/>
    <rect x="26" y="32" width="38" height="38" rx="10" fill="#14181c"/><circle cx="38" cy="44" r="7" fill="#3c434b"/><circle cx="54" cy="44" r="7" fill="#3c434b"/><circle cx="46" cy="60" r="7" fill="#3c434b"/></g>
    <path d="M214 74 C 240 70 242 126 214 128" fill="none" stroke="#e8e2d8" stroke-width="14" stroke-linecap="round"/>
    <ellipse cx="164" cy="104" rx="58" ry="56" fill="#e8e2d8"/><ellipse cx="164" cy="104" rx="46" ry="44" fill="#cfc7b8"/><ellipse cx="164" cy="106" rx="42" ry="40" fill="#7d6a58"/><ellipse cx="164" cy="106" rx="42" ry="40" fill="none" stroke="#a89886" stroke-width="3"/>
    <ellipse cx="150" cy="94" rx="14" ry="8" fill="#fff" opacity=".1"/></svg>`;
  const cards = `
  <div class="cd" data-check="card" style="left:${CX[0]}px;transform:rotate(-1.2deg)"><h3>Day 1</h3>${tabs}<p>${esc(i.items[0])}</p></div>
  <div class="cd" data-check="card" style="left:${CX[1]}px;transform:rotate(1deg)"><h3>Week 3</h3><p>${esc(i.items[1])}</p>${slips}<p>${esc(i.items[2])}</p></div>
  <div class="cd" data-check="card" style="left:${CX[2]}px;transform:rotate(-0.7deg)"><h3>Week 6</h3>${phoneMug}<p>${esc(i.items[3].replace(/^./, (c) => c))} ${EX()}</p><p>${esc(i.items[4])}</p></div>`;
  const css = `
  .cd{position:absolute;top:490px;width:288px;height:534px;transform-origin:50% -34px;background:#fbf8f0;border-radius:6px;padding:20px 20px 16px;display:flex;flex-direction:column;gap:10px;z-index:3;${shadow(0.9)}}
  .cd:before{content:"";position:absolute;left:0;right:0;top:0;height:12px;background:${FOREST};border-radius:6px 6px 0 0}
  .cd h3{font:500 50px/1 "Newsreader",Georgia,serif;letter-spacing:-.01em;color:${FOREST};margin-top:6px}
  .cd p{font:500 28px/1.22 "Plex",sans-serif;color:#1d1d20}
  .cd p .example{vertical-align:middle;margin-left:4px}
  .plac{position:absolute;left:44px;top:1046px;width:560px;padding:14px 22px 14px 26px;background:#fbf8f0;border-radius:5px;z-index:4;transform:rotate(-1deg);font:500 26px/1.28 "Plex",sans-serif;color:#1d1d20;${shadow(0.7)}}
  .plac:before{content:"";position:absolute;left:0;top:0;bottom:0;width:9px;background:${AMBER};border-radius:5px 0 0 5px}`;
  const bowl = `<svg style="${abs(716, 1086, 240, 90, "z-index:4;filter:drop-shadow(0 12px 8px rgba(0,0,0,.45))")}" viewBox="0 0 240 90" aria-hidden="true"><defs><linearGradient id="bw76" x1="0" x2="1"><stop offset="0" stop-color="#f1d58a"/><stop offset=".5" stop-color="#c79a3a"/><stop offset="1" stop-color="#8a6420"/></linearGradient></defs>
    <g transform="rotate(-24 70 40)"><circle cx="64" cy="20" r="13" fill="none" stroke="#c9ccd1" stroke-width="5"/><rect x="56" y="30" width="10" height="56" rx="3" fill="#cfa84a"/></g>
    <g transform="rotate(14 100 36)"><circle cx="104" cy="22" r="13" fill="none" stroke="#c9ccd1" stroke-width="5"/><rect x="98" y="30" width="10" height="56" rx="3" fill="#d4ad4a"/></g>
    <path d="M10 38 H 230 C 226 74 196 88 120 88 C 44 88 14 74 10 38 Z" fill="url(#bw76)"/><ellipse cx="120" cy="38" rx="110" ry="9" fill="#7a5818"/><ellipse cx="120" cy="36" rx="110" ry="9" fill="none" stroke="#f6e2a0" stroke-width="3"/>
    <path d="M40 52 C 60 72 90 78 110 80" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  const scene = `
  ${wall}
  ${hookRail({ y: 392, hooks: CX.map((c) => c + 144) })}
  <svg style="${abs(0, 0, 1000, 1500, "z-index:4;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">${strings}</svg>${cards}
  <svg style="${abs(0, 0, 1000, 1500, "z-index:5;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">${holes}</svg>
  ${bench({ yTop: 1160 })}
  <div class="plac" data-check="note">${esc("This is an illustration, not a report of anyone's month")}</div>
  ${bowl}
  ${shoe({ x: 150, y: 1250, w: 220, color: "#e3d9c4", rot: 0, z: 3 })}${shoe({ x: 410, y: 1256, w: 200, color: "#c26a3d", sole: "#efe6d3", flip: true, z: 3 })}`;
  return printable({ n: 76, scene, paper: "#e8e4da", extraCss: css });
}

/* ----------------------------------------------------------------- #78 quote card */

function pin78() {
  const i = idea(78);
  const q = i.items[0];
  const marked = esc(q).replace(/\bwrong\b/, `<u class="u">wrong</u>`).replace(/\bright\b/, `<u class="u">right</u>`);
  const plaster = (() => {
    const r = lcg(18);
    const out = [];
    for (let k = 0; k < 40; k++) out.push(`<ellipse cx="${(r() * 1000).toFixed(0)}" cy="${(r() * SCENE_H).toFixed(0)}" rx="${(60 + r() * 180).toFixed(0)}" ry="${(24 + r() * 70).toFixed(0)}" fill="${k % 2 ? "#fff" : "#a08a62"}" opacity="${(0.05 + r() * 0.07).toFixed(2)}" transform="rotate(${(r() * 90 - 45).toFixed(0)} 500 ${SCENE_H / 2})"/>`);
    return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="pl78" cx=".25" cy=".05" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#4a3416" stop-opacity=".3"/></radialGradient>
    <filter id="pn78"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .15  0 0 0 .5 -.1"/></filter></defs>
    <rect width="1000" height="${SCENE_H}" fill="#e3d8c2"/>${out.join("")}<rect width="1000" height="${SCENE_H}" filter="url(#pn78)" opacity=".6"/>
    <rect y="${SCENE_H - 98}" width="1000" height="98" fill="#f3efe4"/><rect y="${SCENE_H - 104}" width="1000" height="8" fill="#fff"/><rect y="${SCENE_H - 98}" width="1000" height="6" fill="#000" opacity=".12"/>
    <rect y="${SCENE_H - 30}" width="1000" height="30" fill="#b98f57"/><rect y="${SCENE_H - 30}" width="1000" height="5" fill="#fff" opacity=".3"/>
    <rect width="1000" height="${SCENE_H}" fill="url(#pl78)"/></svg>`;
  })();
  const css = `
  .qc{position:absolute;left:44px;top:440px;width:730px;height:620px;background:#fdfbf4;border-radius:5px;transform:rotate(-1.6deg);z-index:3;${shadow(1)}}
  .qc:before{content:"";position:absolute;left:62px;top:0;bottom:0;width:3px;background:#e9a9b4;opacity:.8}
  .qm{position:absolute;left:84px;top:18px;font:500 150px/1 "Newsreader",Georgia,serif;color:${FOREST};opacity:.9}
  .qt{position:absolute;left:84px;top:112px;width:630px;font:500 58px/82px "Newsreader",Georgia,serif;letter-spacing:-.01em;color:#16201b;
    background:repeating-linear-gradient(transparent 0 80px,#c8d6cd 80px 82px);padding-top:2px}
  .qt .u{text-decoration:none;background:linear-gradient(transparent 70%,${AMBER} 70% 90%,transparent 90%);font-style:italic;font-weight:600}`;
  const sticky78 = `${sticky(70, 986, 240, 160, -5, "#f7d98a", 6)}`;
  const scene = `
  ${plaster}
  ${hookRail({ y: 392, hooks: [880], z: 1 })}
  ${coat({ x: 770, y: 450, w: 290, color: "#35604f", dark: "#254a3c", z: 2 })}
  <div class="qc" data-check="card"><div class="qm">“</div><div class="qt" data-check="quote">${marked}”</div></div>
  ${tape(80, 424, -4, "#2f6b57", 120, 7)}${tape(660, 436, 5, "#d9b94c", 120, 7)}
  ${sticky78}
  ${pencil({ x: 330, y: 1290, len: 380, rot: -3 })}
  ${umbrellaStand({ x: 780, y: 1082, w: 200 })}
  ${shoe({ x: 70, y: 1246, w: 210, color: "#7a4a2a", sole: "#e6dcc8", z: 3 })}`;
  return printable({ n: 78, scene, paper: "#efe8d8", extraCss: css });
}

/* ----------------------------------------------------------------- #85 measure strips on walnut */

function walnut() {
  const out = [];
  const r = lcg(12);
  const bw = 126;
  for (let k = 0; k < 8; k++) {
    const x = k * (bw + 8) - 6;
    out.push(`<rect x="${x}" y="0" width="${bw}" height="${SCENE_H}" fill="${k % 2 ? "#5b3a24" : "#6a4429"}"/>`);
    for (let g = 0; g < 14; g++) {
      const gx = x + 6 + r() * (bw - 12);
      out.push(`<path d="M${gx} 0 C ${gx + (r() - 0.5) * 16} ${SCENE_H * 0.3}, ${gx + (r() - 0.5) * 16} ${SCENE_H * 0.7}, ${gx + (r() - 0.5) * 10} ${SCENE_H}" fill="none" stroke="${r() > 0.5 ? "#2f1b0e" : "#8a5c38"}" stroke-opacity="${(0.2 + r() * 0.25).toFixed(2)}" stroke-width="${(1 + r() * 2).toFixed(1)}"/>`);
    }
    out.push(`<rect x="${x}" y="0" width="5" height="${SCENE_H}" fill="#fff" opacity=".1"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="wn85" cx=".3" cy=".1" r="1.1"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="#150c06"/>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#wn85)"/></svg>`;
}

function pin85() {
  const i = idea(85);
  const COST_W = 870, PAY_W = Math.round(COST_W * 3240 / 3410);
  const X0 = 60;
  const css = `
  .st{position:absolute;left:${X0}px;height:96px;background:#fbf8ef;border-radius:3px;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 34px;z-index:3;${shadow(0.6)}}
  .st:before{content:"";position:absolute;left:0;top:0;bottom:0;width:12px;background:${FOREST};border-radius:3px 0 0 3px}
  .st b{font:500 42px/1 "Newsreader",Georgia,serif;color:#16201b}
  .st span{font:600 44px/1 "Newsreader",Georgia,serif;color:${FOREST}}
  .gap{position:absolute;left:${X0 + PAY_W}px;top:566px;width:${COST_W - PAY_W}px;height:96px;background:repeating-linear-gradient(135deg,${AMBER} 0 10px,#f2b855 10px 20px);border:3px dashed #7a4c06;border-left:0;border-radius:0 3px 3px 0;z-index:3}
  .short{position:absolute;left:${X0}px;top:690px;z-index:4;display:flex;align-items:center;gap:16px}
  .short b{font:600 58px/1 "Newsreader",Georgia,serif;color:#16201b;background:#fbf8ef;padding:12px 26px;border-radius:6px;border-left:12px solid ${AMBER};${shadow(0.5)}}
  .tg{position:absolute;left:50px;width:690px;height:112px;background:#f4ecd6;border-radius:8px 18px 18px 8px;z-index:3;display:flex;align-items:center;gap:22px;padding:0 24px 0 70px;font:500 28px/1.2 "Plex",sans-serif;color:#1d1d20;${shadow(0.5)}}
  .tg i{position:absolute;left:18px;top:50%;margin-top:-17px;width:34px;height:34px;border-radius:50%;background:#2a1a0e;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)}
  .tg em{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:${FOREST};color:#fff;font:600 30px/1 "Plex",sans-serif;font-style:normal}
  .exw{position:absolute;left:${X0}px;top:412px;z-index:4}`;
  const tags = i.items.map((t, k) => `<div class="tg" data-check="tag" style="top:${806 + k * 122}px;transform:rotate(${[-0.8, 0.6, -0.5, 0.7][k]}deg);left:${[50, 62, 52, 64][k]}px"><i></i><em>${k + 1}</em><span>${esc(t)}</span></div>`).join("");
  const scene = `
  ${walnut()}
  <div class="exw"><span style="display:inline-block;background:#fbf8ef;border-radius:8px;padding:4px">${EX()}</span></div>
  <div class="st" data-check="strip" style="top:452px;width:${COST_W}px"><b>Costs</b><span>$3,410</span></div>
  <div class="st" data-check="strip" style="top:566px;width:${PAY_W}px"><b>Pay</b><span>$3,240</span></div>
  <div class="gap"></div>
  <div class="short" data-check="gap"><b>You're $170 short.</b></div>
  ${tags}
  ${calc({ x: 790, y: 1010, w: 180, rot: 8, z: 4 })}
  ${pencil({ x: 120, y: 1314, len: 420, rot: -1 })}`;
  return printable({ n: 85, scene, paper: "#efe3d0", extraCss: css });
}

/* ----------------------------------------------------------------- #84 register page on ash boards */

function ash() {
  const out = [];
  const r = lcg(31);
  const ph = 118;
  for (let k = 0; k < Math.ceil(SCENE_H / ph); k++) {
    const y = k * ph;
    out.push(`<rect x="0" y="${y}" width="1000" height="${ph}" fill="${k % 2 ? "#ddd6c6" : "#e6e0d1"}"/><rect x="0" y="${y}" width="1000" height="4" fill="#8f8670" opacity=".4"/><rect x="0" y="${y + 4}" width="1000" height="3" fill="#fff" opacity=".4"/>`);
    for (let g = 0; g < 10; g++) {
      const gy = y + 10 + r() * (ph - 20);
      out.push(`<path d="M${r() * 200} ${gy} C 340 ${gy + (r() - 0.5) * 12}, 680 ${gy + (r() - 0.5) * 12}, 1000 ${gy + (r() - 0.5) * 8}" fill="none" stroke="#8f8670" stroke-opacity="${(0.1 + r() * 0.14).toFixed(2)}" stroke-width="${(1 + r() * 1.4).toFixed(1)}"/>`);
    }
    const sx = 140 + r() * 700;
    out.push(`<rect x="${sx}" y="${y}" width="3" height="${ph}" fill="#8f8670" opacity=".3"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="as84" cx=".25" cy=".1" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#3a3524" stop-opacity=".28"/></radialGradient></defs>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#as84)"/></svg>`;
}

function pin84() {
  const i = idea(84);
  const rows = i.items.map((t) => {
    const m = t.match(/^(.*?) (\$[\d,]+): you (\$[\d,.]+), them (\$[\d,.]+)$/);
    return { bill: m[1], total: m[2], you: m[3], them: m[4] };
  });
  const body = rows.slice(0, 4), tot = rows[4];
  const rowHtml = body.map((r, k) => `<div class="rw${k === 0 ? " hl" : ""}"><span class="b">${esc(r.bill)}</span><span class="n">${esc(r.total)}</span><span class="n y">${esc(r.you)}</span><span class="n t">${esc(r.them)}</span></div>`).join("");
  const css = `
  .reg{position:absolute;left:62px;top:448px;width:840px;height:748px;background:#fefdf9;border-radius:4px;transform:rotate(-2deg);z-index:3;${shadow(1)};padding:30px 34px 0}
  .reg:before{content:"";position:absolute;left:0;right:0;top:0;height:14px;background:${FOREST};border-radius:4px 4px 0 0}
  .bar{display:flex;height:66px;border-radius:10px;overflow:hidden;margin-top:12px;border:2px solid ${FOREST}}
  .bar div{display:flex;align-items:center;padding:0 20px;font:600 32px/1 "Plex",sans-serif}
  .bar .y{width:67%;background:${FOREST};color:#fff}
  .bar .t{width:33%;background:#f4d9a2;color:#3a2504}
  .hd,.rw{display:grid;grid-template-columns:276px 150px 190px 1fr;align-items:center}
  .hd{margin-top:26px;height:70px;border-bottom:4px solid ${FOREST};font:600 28px/1 "Plex",sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#4b4339}
  .hd span{padding-left:10px}
  .rw{height:104px;border-bottom:2px solid #c8d6cd;font:500 31px/1.15 "Plex",sans-serif;color:#1d1d20}
  .rw span{padding-left:10px}
  .rw .b{font:500 32px/1.1 "Newsreader",Georgia,serif;font-size:35px}
  .rw .n{font-family:"Plex Mono",monospace;font-weight:500;font-size:29px;letter-spacing:-.02em}
  .rw.hl .y,.rw.hl .t{color:#a4560a;font-weight:600;background:linear-gradient(transparent 62%,#f6d77a 62% 92%,transparent 92%)}
  .rw.hl .y{margin-right:6px}
  .rule{height:8px;border-top:3px solid ${FOREST};border-bottom:3px solid ${FOREST};margin-top:6px}
  .rw.tt{border-bottom:0;height:112px;font-weight:700}
  .rw.tt .b{font-weight:600}
  .rw.tt .n{font-weight:600;font-size:30px}
  .stamp{position:absolute;right:-6px;top:-34px;transform:rotate(7deg);z-index:6}
  .stamp .example{font-size:26px;padding:8px 16px;color:#a23a2a;border-width:3px;background:#fefdf9}`;
  const bag = `<svg style="${abs(24, 1222, 330, 130, "z-index:4;transform:rotate(-5deg);filter:drop-shadow(0 14px 10px rgba(50,40,20,.45))")}" viewBox="0 0 380 150" aria-hidden="true"><defs><pattern id="sc84" width="40" height="150" patternUnits="userSpaceOnUse"><rect width="40" height="150" fill="#2f5b4a"/><rect width="12" height="150" fill="#e7dec7"/></pattern></defs>
    <rect x="6" y="14" width="360" height="124" rx="26" fill="url(#sc84)"/><rect x="6" y="14" width="360" height="40" rx="20" fill="#fff" opacity=".12"/>
    <path d="M360 24 C 392 36 392 120 360 132" fill="none" stroke="#e7dec7" stroke-width="3" stroke-dasharray="5 4"/>
    ${Array.from({ length: 9 }, (_, k) => `<path d="M${6 + k * 8} 138 v12 M${6 + k * 8} 14 v-10" stroke="#e7dec7" stroke-width="3" stroke-linecap="round"/>`).join("")}</svg>`;
  const html = `<div class="reg" data-check="page">
    <div class="stamp">${EX("Example only")}</div>
    <div class="bar"><div class="y">You 67%</div><div class="t">Them 33%</div></div>
    <div class="hd"><span>Bill</span><span>Total</span><span>You</span><span>Them</span></div>
    ${rowHtml}<div class="rule"></div>
    <div class="rw tt"><span class="b">Total</span><span class="n">${esc(tot.total)}</span><span class="n">${esc(tot.you)}</span><span class="n">${esc(tot.them)}</span></div></div>`;
  const scene = `
  ${ash()}
  ${bag}
  ${keyTray({ x: 650, y: 1148, w: 300, rot: -4, z: 5 })}
  ${html}
  ${pencil({ x: 380, y: 1296, len: 250, rot: -3 })}`;
  const out = printable({ n: 84, scene, paper: "#eeeae0", extraCss: css });
  return out;
}

/* ----------------------------------------------------------------- #86 five steps on terracotta */

function pin86() {
  const i = idea(86);
  const icons = ["scales", "plus", "divide", "x", "percent"];
  const steps = i.items.map((t, k) => {
    let txt = esc(t);
    if (k === 2) txt = txt.replace("0.33", `<mark>0.33</mark>`);
    return `<div class="sp"><em>${k + 1}</em><div class="tx">${txt}${k === 2 ? ` ${EX()}` : ""}</div><div class="ic">${icon(icons[k], { size: 44, color: k === 2 ? "#a4560a" : FOREST, weight: "bold" })}</div></div>`;
  }).join("");
  const wall = `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs>
    <radialGradient id="w86" cx=".25" cy=".05" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#2d0f04" stop-opacity=".4"/></radialGradient>
    <filter id="n86"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 .8  0 0 0 0 .7  0 0 0 .25 -.05"/></filter></defs>
    <rect width="1000" height="${SCENE_H}" fill="#b4573a"/><rect width="1000" height="${SCENE_H}" filter="url(#n86)" opacity=".6"/><rect width="1000" height="${SCENE_H}" fill="url(#w86)"/></svg>`;
  const css = `
  .nb{position:absolute;left:44px;top:410px;width:760px;height:700px;background:#fefcf6;border-radius:6px;transform:rotate(1.3deg);z-index:3;${shadow(1)};
    background-image:repeating-linear-gradient(transparent 0 38px,#cfdcd5 38px 40px);}
  .nb:before{content:"";position:absolute;left:0;right:0;top:0;height:30px;background:repeating-linear-gradient(90deg,transparent 0 30px,#b4573a 30px 52px,transparent 52px 82px);opacity:.0}
  .rings{position:absolute;left:0;right:0;top:-14px;height:34px;display:flex;justify-content:space-around;padding:0 40px;z-index:5}
  .rings i{width:16px;height:40px;border-radius:8px;background:linear-gradient(90deg,#6b7076,#d5d9dd,#6b7076);box-shadow:0 4px 4px rgba(0,0,0,.35)}
  .stp{position:absolute;left:0;right:0;top:42px;bottom:10px;display:flex;flex-direction:column}
  .sp{flex:1;display:grid;grid-template-columns:90px 1fr 70px;align-items:center;padding:0 24px 0 20px;border-bottom:3px solid #d3dfd8;background:rgba(254,252,246,.9)}
  .sp:last-child{border-bottom:0}
  .sp em{display:grid;place-items:center;width:54px;height:54px;border-radius:50%;background:${FOREST};color:#fff;font:600 32px/1 "Plex",sans-serif;font-style:normal}
  .sp .tx{font:500 27px/1.24 "Plex",sans-serif;color:#1d1d20;padding-right:14px}
  .sp .tx mark{background:linear-gradient(transparent 55%,#f6d77a 55% 95%,transparent 95%);color:#a4560a;font-weight:700;font-size:31px;padding:0 4px}
  .sp .tx .example{vertical-align:middle;margin-left:6px}
  .sp .ic{justify-self:end}
  .ledge{position:absolute;left:0;top:1140px;width:1000px;height:60px;z-index:2}`;
  const ledge = `<svg class="ledge" viewBox="0 0 1000 60" aria-hidden="true" style="filter:drop-shadow(0 16px 12px rgba(40,10,0,.5))"><defs><linearGradient id="lg86" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8c493"/><stop offset=".5" stop-color="#cf9f66"/><stop offset="1" stop-color="#9a6a36"/></linearGradient></defs>
    <rect x="-10" y="8" width="1020" height="52" rx="8" fill="url(#lg86)"/><rect x="-10" y="8" width="1020" height="9" rx="4" fill="#fff" opacity=".3"/><path d="M0 34 C 300 28 640 40 1000 32" stroke="#6b4421" stroke-opacity=".3" stroke-width="2.4" fill="none"/></svg>`;
  const rack = `<svg style="${abs(0, 1200, 1000, 154, "z-index:2")}" viewBox="0 0 1000 154" aria-hidden="true"><defs><linearGradient id="rk86" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5230"/><stop offset="1" stop-color="#4a2f18"/></linearGradient></defs>
    <rect width="1000" height="154" fill="url(#rk86)"/>${Array.from({ length: 6 }, (_, k) => `<rect x="0" y="${k * 28 + 2}" width="1000" height="10" fill="#d1a06a" opacity=".85"/><rect x="0" y="${k * 28 + 12}" width="1000" height="6" fill="#000" opacity=".3"/>`).join("")}</svg>`;
  const coffee = mug({ x: 806, y: 1040, size: 124, color: "#f3ede4", drink: "#6b4226" });
  const hook = hookRail({ y: 392, hooks: [880], z: 1 });
  const tote = `<svg style="${abs(826, 440, 200, 330, "z-index:2;filter:drop-shadow(0 18px 12px rgba(40,10,0,.45))")}" viewBox="0 0 200 330" aria-hidden="true"><defs><linearGradient id="tt86" x1="0" x2="1"><stop offset="0" stop-color="#efe3c6"/><stop offset="1" stop-color="#cdbf9d"/></linearGradient></defs>
    <path d="M54 60 C 54 -6 146 -6 146 60" fill="none" stroke="#a9885a" stroke-width="12" stroke-linecap="round"/><rect x="14" y="76" width="172" height="240" rx="6" fill="url(#tt86)"/>
    <rect x="14" y="76" width="172" height="26" fill="#000" opacity=".08"/><rect x="40" y="170" width="120" height="86" rx="10" fill="${FOREST}" opacity=".85"/></svg>`;
  const scene = `
  ${wall}
  ${hook}${tote}
  <div class="nb" data-check="page"><div class="rings">${"<i></i>".repeat(11)}</div><div class="stp">${steps}</div></div>
  ${tape(58, 438, -5, "#d9b94c", 100, 7)}
  ${ledge}${coffee}${calc({ x: 650, y: 1018, w: 150, rot: -6, z: 3, body: "#2c3834" })}
  ${rack}
  ${shoe({ x: 70, y: 1214, w: 230, color: "#c9a449", sole: "#f1e7d0", z: 4 })}${shoe({ x: 360, y: 1218, w: 210, color: "#2f4b63", sole: "#f1e7d0", flip: true, z: 4 })}
  ${pencil({ x: 580, y: 1300, len: 360, rot: -2 })}`;
  return printable({ n: 86, scene, paper: "#f1e1d3", extraCss: css });
}

export const pins = [pin76(), pin78(), pin85(), pin84(), pin86()];
