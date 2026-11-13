/**
 * Group B: garage and utility room. Pins #3, #7, #11, #19 (real Home Survey
 * pages as printed) and #15 (the Item Card, from its real capture).
 * Every page is the real page image; props are flat vector.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, desk, pencil, mug, binderClip } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";
import { C } from "../kit/bank.mjs";
import { asset } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const SHADOW = "filter:drop-shadow(0 12px 9px rgba(20,15,5,.38))";

/* ---------- shared garage props ---------- */

/** A painted pegboard wall: sage board, rows of holes, a soft light from the top left. */
function pegboard({ top = SCENE_TOP, height = H, base = "#b4c4ad" } = {}) {
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <pattern id="peg" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="5.2" fill="#46563f" opacity=".85"/><circle cx="20" cy="21.2" r="5.2" fill="#fff" opacity=".18"/><circle cx="20" cy="20" r="5.2" fill="#2e3a2a" opacity=".7"/></pattern>
    <radialGradient id="pl" cx="22%" cy="8%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#1c2a1a" stop-opacity=".34"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="${base}"/><rect width="1000" height="${height}" fill="url(#peg)"/><rect width="1000" height="${height}" fill="url(#pl)"/></svg>`;
}

/** A steel wire hook with a small plate, plus the cord loop a clipboard hangs from. */
function hookAndCord({ x, y, toX, toY }) {
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;pointer-events:none;filter:drop-shadow(0 5px 4px rgba(20,15,5,.35))" viewBox="0 0 1000 1500" aria-hidden="true">
    <path d="M${toX - 44} ${toY} L${x} ${y} L${toX + 44} ${toY}" fill="none" stroke="#2f3a2c" stroke-width="5" stroke-linejoin="round"/>
    <rect x="${x - 30}" y="${y - 20}" width="60" height="16" rx="8" fill="#d4d8d2"/><rect x="${x - 7}" y="${y - 12}" width="14" height="40" rx="6" fill="#aeb3ad"/><path d="M${x - 14} ${y + 18} q14 24 28 0" fill="none" stroke="#aeb3ad" stroke-width="8" stroke-linecap="round"/></svg>`;
}

/** A small wooden key rail with hooks and three key rings with keys. */
function keyRail({ x, y }) {
  const keys = [[34, "#d9b25a"], [96, "#c9ccd0"], [158, "#d9b25a"]]
    .map(([kx, col], k) => `<g transform="translate(${kx} 40)"><circle cx="0" cy="22" r="9" fill="none" stroke="#8a8f94" stroke-width="3"/><path d="M0 31 V${86 + k * 8}" stroke="${col}" stroke-width="12" stroke-linecap="round"/><circle cx="0" cy="${96 + k * 8}" r="15" fill="${col}"/><circle cx="0" cy="${96 + k * 8}" r="6" fill="#9aa09a"/><rect x="-1" y="${64 + k * 8}" width="12" height="6" fill="#7a6a3a" opacity=".6"/></g>`)
    .join("");
  return `<svg style="${abs(x, y, 190, 190, SHADOW)}" viewBox="0 0 190 190" aria-hidden="true"><rect x="0" y="0" width="190" height="34" rx="6" fill="#9a6a37"/><rect x="0" y="0" width="190" height="9" rx="4" fill="#d6ad78" opacity=".55"/>${keys}</svg>`;
}

/** A claw hammer lying flat on the board face, handle down. */
function hammer({ x, y, rot = 0, s = 1 }) {
  return `<svg style="${abs(x, y, 120 * s, 330 * s, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 120 330" aria-hidden="true">
    <rect x="46" y="70" width="28" height="250" rx="12" fill="#b2763a"/><rect x="46" y="70" width="9" height="250" rx="4" fill="#dca36a" opacity=".6"/><rect x="42" y="210" width="36" height="100" rx="10" fill="#26332a"/>
    <path d="M8 22 C 30 6 92 6 112 18 L112 56 C 92 70 30 70 8 56 Z" fill="#9aa2a6"/><path d="M8 22 C 30 6 92 6 112 18 L112 28 C 92 16 30 16 8 30Z" fill="#fff" opacity=".35"/><path d="M8 22 L-4 6 L-4 70 L8 56Z" fill="#7d8588"/></svg>`;
}

/** A yellow-and-amber tape measure. */
function tape({ x, y, size = 150, rot = 0 }) {
  return `<svg style="${abs(x, y, size, size, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 150 150" aria-hidden="true"><rect x="10" y="12" width="124" height="118" rx="30" fill="${C.amber}"/><rect x="10" y="12" width="124" height="30" rx="16" fill="#fff" opacity=".2"/><circle cx="72" cy="72" r="34" fill="#f3d9a0"/><circle cx="72" cy="72" r="16" fill="#8b6a26"/><rect x="120" y="92" width="26" height="42" rx="5" fill="#2e3a2a"/><rect x="132" y="130" width="14" height="10" fill="#cfd3cb"/></svg>`;
}

/** A wheel valve handle in slate: the one blue on the pin, for water. */
function wheelValve({ x, y, size = 150, rot = 0 }) {
  const spokes = [0, 60, 120].map((a) => `<rect x="-5" y="-62" width="10" height="124" rx="5" transform="rotate(${a})" fill="${C.slate}"/>`).join("");
  return `<svg style="${abs(x, y, size, size, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="-80 -80 160 160" aria-hidden="true"><circle r="66" fill="none" stroke="${C.slate}" stroke-width="12"/><circle r="66" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" transform="translate(-3 -3)"/>${spokes}<circle r="17" fill="#3f5266"/><circle r="7" fill="#c9d3da"/></svg>`;
}

/** A garage toolbox seen from the front, with a lid, a latch and a handle. */
function toolbox({ x, y, w = 420, h = 250, body = "#3d5646", rot = 0 }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(20,12,4,.5))`)}" viewBox="0 0 420 250" aria-hidden="true">
    <path d="M110 40 C 110 -4 310 -4 310 40" fill="none" stroke="#c4c8cc" stroke-width="14" stroke-linecap="round"/>
    <rect x="0" y="36" width="420" height="214" rx="16" fill="${body}"/><rect x="0" y="36" width="420" height="70" rx="16" fill="#fff" opacity=".12"/><rect x="0" y="104" width="420" height="8" fill="#000" opacity=".28"/>
    <rect x="170" y="86" width="80" height="44" rx="8" fill="#d4d8d2"/><rect x="180" y="96" width="60" height="24" rx="5" fill="#9aa09a"/>
    <rect x="14" y="52" width="20" height="40" rx="5" fill="#c4c8cc"/><rect x="386" y="52" width="20" height="40" rx="5" fill="#c4c8cc"/>
    <rect x="0" y="236" width="420" height="14" fill="#000" opacity=".18"/></svg>`;
}

/** A paint tin with a lid and a drip, in a flat colour. */
function tin({ x, y, w = 130, h = 150, label = "#e6ede2", drip = "#a8bfa4", lid = "#c4c8cc" }) {
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 10px 8px rgba(0,0,0,.4))")}" viewBox="0 0 130 150" aria-hidden="true"><rect x="8" y="12" width="114" height="130" rx="8" fill="#b9bdc2"/><rect x="8" y="12" width="26" height="130" rx="8" fill="#fff" opacity=".28"/>
    <rect x="8" y="46" width="114" height="62" fill="${label}"/><rect x="8" y="46" width="114" height="62" fill="#000" opacity=".05"/>
    <ellipse cx="65" cy="14" rx="60" ry="12" fill="${lid}"/><ellipse cx="65" cy="12" rx="48" ry="7" fill="${drip}"/><path d="M96 12 q4 16 10 8 v-8 Z" fill="${drip}"/></svg>`;
}

/** A stacking storage bin (lidded, blank label card). */
function bin({ x, y, w = 260, h = 160, color = "#6b8a73", lid = "#4f7a5c" }) {
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 10px 8px rgba(0,0,0,.4))")}" viewBox="0 0 260 160" aria-hidden="true"><path d="M14 36 H246 L234 156 H26 Z" fill="${color}"/><path d="M14 36 H246 L242 60 H18 Z" fill="#fff" opacity=".14"/>
    <rect x="2" y="12" width="256" height="28" rx="8" fill="${lid}"/><rect x="2" y="12" width="256" height="9" rx="5" fill="#fff" opacity=".2"/>
    <rect x="86" y="74" width="88" height="46" rx="5" fill="#f6f3ea"/><rect x="86" y="74" width="88" height="46" rx="5" fill="none" stroke="#1a2420" stroke-opacity=".12"/></svg>`;
}

/** A coiled orange-amber extension reel, seen from the front. */
function reel({ x, y, size = 220 }) {
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 14px 10px rgba(0,0,0,.45))")}" viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="116" r="100" fill="#2f3a2c"/><circle cx="110" cy="116" r="84" fill="${C.amber}"/>
    ${[70, 56, 42].map((r, k) => `<circle cx="110" cy="116" r="${r}" fill="none" stroke="${k % 2 ? "#a86f17" : "#f0b658"}" stroke-width="9"/>`).join("")}<circle cx="110" cy="116" r="22" fill="#2f3a2c"/><circle cx="110" cy="116" r="9" fill="#cfd3cb"/>
    <path d="M60 30 C 70 6 150 6 160 30" fill="none" stroke="#2f3a2c" stroke-width="14" stroke-linecap="round"/><path d="M40 200 q-30 18 -34 8" fill="none" stroke="${C.amber}" stroke-width="9" stroke-linecap="round"/></svg>`;
}

/** A corded handset lying along its length (the landline kind), in deep green-black. */
function handset({ x, y, rot = 0, len = 340 }) {
  return `<svg style="${abs(x, y, len, 120, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(0,0,0,.45))`)}" viewBox="0 0 340 120" aria-hidden="true">
    <path d="M10 14 H80 Q96 14 96 34 V74 Q96 92 84 96 H30 Q8 96 8 70 Z" fill="#26332a"/><path d="M330 14 H260 Q244 14 244 34 V74 Q244 92 256 96 H310 Q332 96 332 70 Z" fill="#26332a"/>
    <path d="M90 28 H250 V62 Q170 82 90 62 Z" fill="#2f4035"/><path d="M90 28 H250 V38 H90Z" fill="#fff" opacity=".12"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<circle cx="${28 + (k % 3) * 20}" cy="${40 + Math.floor(k / 3) * 26}" r="4" fill="#0f1612"/><circle cx="${312 - (k % 3) * 20}" cy="${40 + Math.floor(k / 3) * 26}" r="4" fill="#0f1612"/>`).join("")}<path d="M50 96 q-6 12 4 16 q10 4 6 14 q-4 10 6 14" fill="none" stroke="#26332a" stroke-width="6" stroke-linecap="round"/></svg>`;
}

/** A concrete garage floor: grey with speckle, a saw-cut joint and a faint stain. */
function concrete({ top = SCENE_TOP, height = H }) {
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <filter id="cn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .1  0 0 0 .55 0"/></filter>
    <filter id="cb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .22  0 0 0 0 .2  0 0 0 .5 0"/></filter>
    <radialGradient id="cl" cx="24%" cy="6%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#16201a" stop-opacity=".34"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="#b4b6ae"/><rect width="1000" height="${height}" filter="url(#cb)"/><rect width="1000" height="${height}" filter="url(#cn)" opacity=".5"/>
    <path d="M0 ${height * 0.58} H1000" stroke="#6f726b" stroke-width="5"/><path d="M0 ${height * 0.58 + 5} H1000" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M640 0 V${height}" stroke="#7a7d75" stroke-width="3" opacity=".7"/>
    <rect width="1000" height="${height}" fill="url(#cl)"/></svg>`;
}

/** A hanging wall-of-shelving: a steel unit with boards, filling the scene. */
function shelfWall({ top = SCENE_TOP, height = H }) {
  const boards = [0.19, 0.5, 0.86].map((f) => Math.round(height * f));
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a5a52"/><stop offset="1" stop-color="#263029"/></linearGradient>
    <linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7dbd8"/><stop offset="1" stop-color="#8d948f"/></linearGradient></defs>
    <rect width="1000" height="${height}" fill="url(#sw)"/>
    <rect x="26" y="0" width="22" height="${height}" fill="#9aa39d"/><rect x="26" y="0" width="7" height="${height}" fill="#fff" opacity=".35"/><rect x="952" y="0" width="22" height="${height}" fill="#808a84"/>
    ${boards.map((y) => `<rect x="26" y="${y}" width="948" height="22" fill="url(#sb)"/><rect x="26" y="${y + 22}" width="948" height="16" fill="#000" opacity=".28"/>`).join("")}</svg>`;
}

/** Wraps a real page image so an overlay can sit on it and turn with it. */
function tilted({ x, y, w, tilt = 0, page, overlay = "" }) {
  const h = Math.round(w * (2200 / 1700));
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg)`)}">${page}${overlay}</div>`;
}
const pageAt = (src, w, extra = {}) => sheet({ src, x: 0, y: 0, w, ...extra });

/** A translucent sage marker over a rectangle of a page (fractions of the page). */
const marker = (w, f, color = C.sage, op = 0.3, r = 6) => {
  const h = w * (2200 / 1700);
  return `<div style="${abs(f.x0 * w, f.y0 * h, (f.x1 - f.x0) * w, (f.y1 - f.y0) * h, `background:${color};opacity:${op};mix-blend-mode:multiply;border-radius:${r}px`)}"></div>`;
};


/** A callout tag beside a page (never on it), with an arrow whose head stops at the page edge. */
function callout({ x, y, w, text, arrow }) {
  const [ax, ay, bx, by] = arrow;
  return `<div style="${abs(x, y, w, 0, "")}"><div data-check="callout" style="position:absolute;left:0;top:0;width:${w}px;box-sizing:border-box;padding:12px 16px;background:#fbfaf6;border:3px solid ${C.sageDeep};border-radius:12px;font:600 26px/1.15 'Plex',sans-serif;color:${C.ink};box-shadow:0 10px 18px rgba(20,12,4,.35);transform:rotate(-2deg)">${text}</div></div>
  <svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;pointer-events:none;filter:drop-shadow(0 4px 4px rgba(20,12,4,.35))" viewBox="0 0 1000 1500" aria-hidden="true"><defs><marker id="ah" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="26" refX="18" refY="13" orient="auto"><path d="M0 0 L26 13 L0 26 Z" fill="${C.sageDeep}"/></marker></defs><path d="M${ax} ${ay} Q ${(ax + bx) / 2 + 10} ${(ay + by) / 2 - 26} ${bx} ${by}" fill="none" stroke="${C.sageDeep}" stroke-width="6" stroke-linecap="round" marker-end="url(#ah)"/></svg>`;
}

/** A highlighter lying on the surface: dark barrel, sage cap, chisel tip. */
function highlighter({ x, y, len = 300, rot = 0 }) {
  return `<svg style="${abs(x, y, len, 52, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(20,12,4,.4))`)}" viewBox="0 0 ${len} 52" aria-hidden="true"><rect x="40" y="6" width="${len - 110}" height="40" rx="10" fill="#26332a"/><rect x="40" y="6" width="${len - 110}" height="10" rx="5" fill="#fff" opacity=".16"/><rect x="${len - 78}" y="2" width="70" height="48" rx="12" fill="#6fa27c"/><rect x="${len - 78}" y="2" width="70" height="12" rx="6" fill="#fff" opacity=".25"/><rect x="${len - 14}" y="14" width="10" height="24" rx="4" fill="#4f7a5c"/><path d="M42 6 L6 16 V36 L42 46 Z" fill="#c9d65a"/><path d="M6 16 L2 20 V32 L6 36Z" fill="#9fae33"/></svg>`;
}

/* ---------- #3: the Emergency Info Sheet, on a clipboard on a pegboard ---------- */
const clipboardHung = ({ x, y, w, h, tilt, content }) => `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg)`)}">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#a9743c,#86562a);border-radius:20px;box-shadow:0 4px 6px rgba(20,15,5,.3),0 30px 44px rgba(20,15,5,.5)"></div>
  <div style="position:absolute;left:${w / 2 - 92}px;top:-24px;width:184px;height:76px;border-radius:14px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 6px 10px rgba(0,0,0,.35)"></div>
  <div style="position:absolute;left:${w / 2 - 60}px;top:-40px;width:120px;height:34px;border-radius:12px 12px 0 0;background:linear-gradient(#f4f5f7,#bcc0c6);box-shadow:0 3px 6px rgba(0,0,0,.25)"></div>${content}</div>`;

const scene3 = `${pegboard()}
  ${hookAndCord({ x: 400, y: 396, toX: 400, toY: 482 })}
  ${clipboardHung({ x: 50, y: 500, w: 700, h: 870, tilt: -2, content: sheet({ src: bookPage(6), x: 40, y: 50, w: 620, id: "emergency" }) })}
  ${keyRail({ x: 790, y: 436 })}
  ${hammer({ x: 840, y: 700, rot: 8, s: 0.95 })}
  ${tape({ x: 800, y: 1020, size: 150, rot: -6 })}
  ${wheelValve({ x: 790, y: 1184, size: 150, rot: 14 })}`;

/* ---------- #7: the Kitchen page on a workbench, ticks marked in sage ---------- */
const W7 = 720;
const scene7 = `${desk({ top: SCENE_TOP, height: H, base: "#b78a56", dark: "#9b7140", planks: 4, seed: 11 })}
  ${tilted({ x: 70, y: 410, w: W7, tilt: 3, page: pageAt(bookPage(8), W7, { id: "kitchen" }) })}
  ${toolbox({ x: 575, y: 1180, w: 400, h: 238, rot: -2 })}
  ${callout({ x: 826, y: 560, w: 160, text: "What is here", arrow: [900, 690, 808, 650] })}
  ${highlighter({ x: 780, y: 880, len: 330, rot: 80 })}`;

/* ---------- #11: the jobs page on a binder with a kraft tab, shelving behind ---------- */
const W11 = 640;
const scene11 = `${shelfWall({})}
  ${tin({ x: 78, y: 392, w: 130, h: 150 })}${tin({ x: 214, y: 408, w: 120, h: 138, label: "#f0d58a", drip: "#d9b25a" })}${tin({ x: 340, y: 392, w: 130, h: 150, label: "#c4d6bd", drip: "#7fa389" })}
  ${bin({ x: 600, y: 394, w: 330, h: 168 })}
  <div style="${abs(94, 560, 800, 800, "transform:rotate(-2deg)")}">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#456a52,#2f4a39);border-radius:14px 22px 22px 14px;box-shadow:0 4px 6px rgba(0,0,0,.35),0 30px 48px rgba(0,0,0,.55)"></div>
    <div style="position:absolute;left:0;top:0;width:44px;height:800px;background:linear-gradient(90deg,#27402f,#3a5b45);border-radius:14px 0 0 14px"></div>
    ${[80, 280, 480, 680].map((t) => `<div style="position:absolute;left:12px;top:${t}px;width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f2f4f5,#8e949a);box-shadow:0 3px 4px rgba(0,0,0,.4)"></div>`).join("")}
  </div>
  <div style="${abs(890, 700, 76, 220, `background:linear-gradient(90deg,#d2b083,${C.kraft});border-radius:0 12px 12px 0;box-shadow:3px 8px 12px rgba(0,0,0,.4);transform:rotate(-2deg)`)}"></div>
  <div style="${abs(890, 940, 76, 220, `background:linear-gradient(90deg,#c9a674,#b8935f);border-radius:0 12px 12px 0;box-shadow:3px 8px 12px rgba(0,0,0,.4);transform:rotate(-2deg)`)}"></div>
  ${tilted({ x: 178, y: 580, w: W11, tilt: -2, page: pageAt(bookPage(21), W11, { id: "jobs" }) })}
  ${binderClip({ x: 470, y: 540, rot: 4, size: 96 })}
  ${tin({ x: 830, y: 1190, w: 150, h: 170, label: "#e6ede2", drip: "#a8bfa4" })}`;

/* ---------- #19: the Who to call page on a concrete floor beside a handset ---------- */
const W19 = 640;
const scene19 = `${concrete({})}
  ${tilted({ x: 100, y: 440, w: W19, tilt: 4, page: pageAt(bookPage(32), W19, { id: "who" }) })}
  ${handset({ x: 640, y: 540, rot: 84, len: 340 })}
  ${callout({ x: 770, y: 830, w: 210, text: "The four you will need first", arrow: [800, 825, 748, 745] })}
  ${highlighter({ x: 740, y: 1020, len: 250, rot: -8 })}
  ${mug({ x: 765, y: 1100, size: 160, color: "#f3ede4", drink: "#4a3322" })}
  ${reel({ x: 30, y: 1150, size: 190 })}`;


/* ---------- #15: the Item Card (real capture) at a hardware-store counter ---------- */
/** A furnace filter standing on its edge: cardboard frame, pleated media. */
function filterProp({ x, y, w = 330, h = 270, rot = 0 }) {
  const pleats = Array.from({ length: 22 }, (_, k) => `<path d="M${22 + k * ((w - 44) / 21)} 22 V${h - 22}" stroke="${k % 2 ? "#bfc4bd" : "#fafaf6"}" stroke-width="${(w - 44) / 21}"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 12px rgba(20,12,4,.5))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" rx="4" fill="#cdb089"/><rect width="${w}" height="12" fill="#fff" opacity=".22"/>${pleats}<rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="none" stroke="#8a7350" stroke-opacity=".5" stroke-width="2"/><path d="M22 ${h / 2} H${w - 22}" stroke="#9aa09a" stroke-width="3" opacity=".7"/></svg>`;
}
/** A household bulb standing on its base. */
function bulbProp({ x, y, size = 190 }) {
  return `<svg style="${abs(x, y, size * 0.6, size, "filter:drop-shadow(0 14px 10px rgba(20,12,4,.5))")}" viewBox="0 0 114 190" aria-hidden="true"><path d="M57 4 C 14 4 -2 44 22 78 C 34 96 38 104 38 120 H76 C 76 104 80 96 92 78 C 116 44 100 4 57 4 Z" fill="#f8f3df"/><path d="M57 4 C 14 4 -2 44 22 78" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="6" stroke-linecap="round" transform="translate(6 6)"/><path d="M44 120 V70 l13 14 l13 -14 V120" fill="none" stroke="#c9a24a" stroke-width="4"/><rect x="36" y="120" width="42" height="56" rx="6" fill="#b8bcc0"/>${[130, 142, 154, 166].map((yy) => `<rect x="36" y="${yy}" width="42" height="4" fill="#7b8084"/>`).join("")}<rect x="46" y="176" width="22" height="12" rx="5" fill="#3a3d40"/></svg>`;
}
const CARD_W = 800, CARD_CROP = { x0: 0, y0: 0, x1: 1, y1: 0.41 };
const cardH = Math.round(CARD_W * (2339 / 1654) * (CARD_CROP.y1 - CARD_CROP.y0));
const scene15 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><linearGradient id="sp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fb09a"/><stop offset="1" stop-color="#5f8670"/></linearGradient></defs>
    <rect width="1000" height="${H}" fill="url(#sp)"/>${Array.from({ length: 9 }, (_, k) => `<rect x="${k * 125}" y="0" width="3" height="${H - 230}" fill="#1c2a1a" opacity=".16"/><rect x="${k * 125 + 3}" y="0" width="2" height="${H - 230}" fill="#fff" opacity=".18"/>`).join("")}
    <rect y="${H - 230}" width="1000" height="230" fill="#000" opacity=".0"/></svg>
  <svg style="${abs(0, 1086, 1000, 270)}" viewBox="0 0 1000 270" aria-hidden="true"><defs><linearGradient id="ct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b07a"/><stop offset="1" stop-color="#b98a55"/></linearGradient></defs>
    <rect width="1000" height="190" fill="url(#ct)"/><rect width="1000" height="6" fill="#fff" opacity=".35"/>${[0.3, 0.55, 0.8].map((f) => `<path d="M0 ${190 * f} C 300 ${190 * f + 8}, 600 ${190 * f - 8}, 1000 ${190 * f}" stroke="#8a6234" stroke-opacity=".25" stroke-width="2" fill="none"/>`).join("")}
    <rect y="190" width="1000" height="80" fill="#8c6636"/><rect y="190" width="1000" height="8" fill="#000" opacity=".3"/></svg>
  <div style="${abs(70, 440, 860, cardH + 120, `background:linear-gradient(135deg,#d3b184,${C.kraft});border-radius:14px;transform:rotate(-2deg);box-shadow:0 4px 6px rgba(20,12,4,.3),0 26px 46px rgba(20,12,4,.5)`)}">
    <div style="${abs(30, 28, CARD_W, cardH, `overflow:hidden;background:#fbfaf6;border-radius:3px;box-shadow:0 2px 6px rgba(20,12,4,.35)`)}" data-check="page"><img src="${asset("item-card.png")}" style="position:absolute;left:0;top:0;width:${CARD_W}px;height:auto" alt=""></div>
    <span class="example" style="position:absolute;right:30px;bottom:26px;font-size:26px;padding:5px 12px;color:#4a3a22;border-color:#4a3a22">Example</span>
  </div>
  ${filterProp({ x: 70, y: 1010, w: 340, h: 250, rot: -3 })}
  ${bulbProp({ x: 700, y: 1000, size: 230 })}`;

export const pins = [
  printable({ n: 3, scene: scene3 }),
  printable({ n: 7, scene: scene7 }),
  printable({ n: 11, scene: scene11 }),
  printable({ n: 15, scene: scene15 }),
  printable({ n: 19, scene: scene19 }),
];
