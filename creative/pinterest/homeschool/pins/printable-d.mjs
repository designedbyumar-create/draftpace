/**
 * Four printed-page mockups, each its own scene:
 *   26  the reading log in an open three-ring binder on a gingham kitchen table
 *   32  "Things worth remembering" on a walnut desk, journal feel
 *   56  "A week at a time" pinned to a cork board, spare day row circled in plum pen
 *   61  the cover fanned over the plum divider on a pale desk
 * Every page is the real book page, as printed; only props are drawn.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, desk, pencil, binderClip, books, drawing } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";
import { C } from "../kit/bank.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_H = 1500 - SCENE_TOP;
const ASPECT = 2200 / 1700;

/** A box at (x,y,w,h) turned about its centre; children are placed inside it. */
const holder = ({ x, y, w, h, tilt = 0, inner }) => `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg)`)}">${inner}</div>`;

/** A page inside a holder: placed at the holder's own (0,0), tilt is the holder's. */
const pageIn = (src, x, y, w, id) => sheet({ src, x, y, w, id });

/** A push pin seen from above. */
function pushPin({ x, y, color = C.plum, size = 46 }) {
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(5px 8px 5px rgba(40,20,5,.45))")}" viewBox="0 0 50 50" aria-hidden="true">
    <circle cx="25" cy="25" r="22" fill="${color}"/><circle cx="25" cy="25" r="22" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>
    <circle cx="25" cy="25" r="14" fill="#fff" opacity=".13"/><ellipse cx="17" cy="16" rx="8" ry="5" fill="#fff" opacity=".55" transform="rotate(-35 17 16)"/></svg>`;
}

/** A sprig of greenery (olive-like): curved stem, paired leaves. */
function sprig({ x, y, len = 300, rot = 0 }) {
  const leaves = [];
  const n = 8;
  for (let k = 0; k < n; k++) {
    const t = (k + 1) / (n + 1);
    const px = 14 + t * (len - 40);
    const py = 40 - Math.sin(t * 2.2) * 16;
    const s = 1 - t * 0.35;
    const col = k % 2 ? "#7c9a72" : "#8fae83";
    leaves.push(`<ellipse cx="${px}" cy="${py - 17 * s}" rx="${24 * s}" ry="${9 * s}" fill="${col}" transform="rotate(-38 ${px} ${py - 17 * s})"/>`);
    leaves.push(`<ellipse cx="${px + 4}" cy="${py + 17 * s}" rx="${24 * s}" ry="${9 * s}" fill="${k % 2 ? "#8fae83" : "#6f8f68"}" transform="rotate(38 ${px + 4} ${py + 17 * s})"/>`);
  }
  leaves.push(`<ellipse cx="${len - 14}" cy="${40 - Math.sin(2.2) * 16 - 2}" rx="22" ry="8" fill="#86a67b"/>`);
  return `<svg style="${abs(x, y, len, 90, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,0,.45))`)}" viewBox="0 0 ${len} 90" aria-hidden="true">
    <path d="M6 42 C ${len * 0.3} ${58} ${len * 0.65} ${22} ${len - 22} ${22}" fill="none" stroke="#5c7a56" stroke-width="4" stroke-linecap="round"/>${leaves.join("")}</svg>`;
}

/** A glazed cup of sharpened pencils seen from the front and a little above. */
function pencilCup({ x, y, w = 230 }) {
  const cols = ["#e7b23f", "#c4573e", "#5f8a8f", "#e7b23f", "#7a4b8a", "#d86a4f", "#8aa182"];
  const angles = [-24, -14, -5, 3, 11, 20, 28];
  const sticks = cols.map((c, k) => {
    const a = angles[k];
    const cx = 140 + (k - 3) * 11;
    const len = 190 - Math.abs(k - 3) * 8 + (k % 2) * 16;
    return `<g transform="rotate(${a} ${cx} 240)"><rect x="${cx - 9}" y="${240 - len}" width="18" height="${len}" fill="${c}"/><rect x="${cx - 9}" y="${240 - len}" width="6" height="${len}" fill="#fff" opacity=".22"/><path d="M${cx - 9} ${240 - len} L${cx} ${240 - len - 30} L${cx + 9} ${240 - len} Z" fill="#e9c9a0"/><path d="M${cx - 3.4} ${240 - len - 11.5} L${cx} ${240 - len - 30} L${cx + 3.4} ${240 - len - 11.5} Z" fill="#33363b"/></g>`;
  }).join("");
  return `<svg style="${abs(x, y, w, w * 1.45, "filter:drop-shadow(0 14px 10px rgba(10,5,0,.5))")}" viewBox="0 0 280 406" aria-hidden="true">
    ${sticks}
    <path d="M60 232 H220 L208 388 Q140 408 72 388 Z" fill="#d9a07c"/><path d="M60 232 H100 L100 396 Q80 392 72 388 Z" fill="#fff" opacity=".16"/><path d="M196 232 H220 L208 388 Q200 391 190 393 Z" fill="#000" opacity=".1"/>
    <ellipse cx="140" cy="232" rx="80" ry="20" fill="#e8b895"/><ellipse cx="140" cy="236" rx="70" ry="14" fill="#4a2f22"/>
    <path d="M64 300 Q140 316 216 300" fill="none" stroke="#f3ede4" stroke-width="6" opacity=".65"/></svg>`;
}

/* ---------- 26: reading log in an open three-ring binder on a gingham kitchen table ---------- */

function gingham({ top, height }) {
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <pattern id="gg" width="80" height="80" patternUnits="userSpaceOnUse" patternTransform="rotate(-7)"><rect width="80" height="80" fill="#f7f2e7"/><rect width="40" height="80" fill="#6f9ea3" opacity=".42"/><rect width="80" height="40" fill="#6f9ea3" opacity=".42"/></pattern>
    <radialGradient id="gl" cx="22%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#1c3436" stop-opacity=".34"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="url(#gg)"/>
    <path d="M0 ${height * 0.62} C 250 ${height * 0.58} 600 ${height * 0.68} 1000 ${height * 0.6}" fill="none" stroke="#1c3436" stroke-opacity=".08" stroke-width="26"/>
    <path d="M0 ${height * 0.2} C 300 ${height * 0.26} 700 ${height * 0.16} 1000 ${height * 0.22}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="30"/>
    <rect width="1000" height="${height}" fill="url(#gl)"/></svg>`;
}

function binder() {
  // Holder coordinates: left cover 0..548, spine 548..572, right cover 572..1192.
  const W = 1200, H = 800;
  const navy = "#34475f", navyHi = "#46607e";
  const rings = [110, 400, 690].map((cy) => `
    <rect x="522" y="${cy - 16}" width="58" height="32" rx="8" fill="url(#mp)"/>
    <ellipse cx="582" cy="${cy}" rx="26" ry="21" fill="none" stroke="#7c8088" stroke-width="9" opacity=".6" transform="translate(3 5)"/>
    <ellipse cx="582" cy="${cy}" rx="26" ry="21" fill="none" stroke="url(#rg)" stroke-width="8"/>`).join("");
  const holes = [110, 400, 690].map((cy) => `<ellipse cx="624" cy="${cy + 28}" rx="11" ry="9" fill="#1f2b3a" opacity=".0"/>`).join("");
  const svg = `<svg style="${abs(0, 0, W, H)}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>
    <linearGradient id="cv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${navyHi}"/><stop offset="1" stop-color="${navy}"/></linearGradient>
    <linearGradient id="sp" x1="0" x2="1"><stop offset="0" stop-color="#1d2a3b"/><stop offset=".5" stop-color="#3a5070"/><stop offset="1" stop-color="#1d2a3b"/></linearGradient>
    <linearGradient id="mp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f3"/><stop offset="1" stop-color="#a3a8b0"/></linearGradient>
    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f7f9"/><stop offset=".5" stop-color="#b6bac2"/><stop offset="1" stop-color="#e3e5e9"/></linearGradient></defs>
    <g style="filter:drop-shadow(0 6px 6px rgba(20,35,38,.35)) drop-shadow(0 34px 38px rgba(20,35,38,.5))">
      <rect x="0" y="0" width="552" height="${H}" rx="22" fill="url(#cv)"/><rect x="568" y="0" width="${W - 568 - 8}" height="${H}" rx="22" fill="url(#cv)"/>
      <rect x="544" y="0" width="32" height="${H}" fill="url(#sp)"/></g>
    <rect x="0" y="0" width="552" height="${H}" rx="22" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>
    <rect x="568" y="0" width="${W - 576}" height="${H}" rx="22" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="3"/>
    <!-- left side: the stack of leaves already in the binder, seen from above -->
    <rect x="300" y="26" width="248" height="${H - 52}" fill="#ddd7cc"/><rect x="304" y="22" width="244" height="${H - 48}" fill="#e8e3d9"/><rect x="308" y="18" width="240" height="${H - 44}" fill="#f1ede5"/>
    <rect x="312" y="14" width="236" height="${H - 36}" fill="#fbfaf7"/>
    <rect x="312" y="14" width="236" height="${H - 36}" fill="none" stroke="#000" stroke-opacity=".06"/>
    ${holes}</svg>`;
  const pg = sheet({ src: bookPage(17), x: 578, y: 36, w: 574, id: "pg" });
  const ringsSvg = `<svg style="${abs(0, 0, W, H, "pointer-events:none;filter:drop-shadow(3px 6px 4px rgba(15,25,40,.4))")}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>
    <linearGradient id="mp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f3"/><stop offset="1" stop-color="#a3a8b0"/></linearGradient>
    <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f7f9"/><stop offset=".5" stop-color="#b6bac2"/><stop offset="1" stop-color="#e3e5e9"/></linearGradient></defs>${rings}</svg>`;
  return { W, H, inner: svg + pg + ringsSvg };
}

function scene26() {
  const b = binder();
  return `${gingham({ top: SCENE_TOP, height: SCENE_H })}
  ${holder({ x: -262, y: 462, w: b.W, h: b.H, tilt: 1.6, inner: b.inner })}
  ${books({ x: -6, y: 1062, size: 1.0 })}
  ${pencil({ x: 470, y: 1306, len: 400, rot: -4 })}`;
}

/* ---------- 32: "Things worth remembering" on a walnut desk, journal feel ---------- */

function scene32() {
  const W = 612, H = Math.round(W * ASPECT);
  const journal = `<div style="${abs(-26, -22, W + 70, H + 44, "background:linear-gradient(135deg,#3f5a4c,#2e4439);border-radius:10px 20px 20px 10px;box-shadow:0 3px 5px rgba(0,0,0,.4),0 30px 50px rgba(0,0,0,.55)")}"></div>
    <div style="${abs(-26, -22, 22, H + 44, "background:linear-gradient(90deg,#24352c,#3a5144);border-radius:10px 0 0 10px")}"></div>
    <div style="${abs(W + 4, -22, 14, H + 44, "background:#c4573e;opacity:.92;box-shadow:2px 0 4px rgba(0,0,0,.35)")}"></div>`;
  const tab = `<svg style="${abs(W - 28, 54, 92, 44, "filter:drop-shadow(3px 5px 4px rgba(0,0,0,.4))")}" viewBox="0 0 92 44" aria-hidden="true">
    <path d="M0 2 H80 L92 22 L80 42 H0 Z" fill="#e8b23f"/><path d="M0 2 H80 L92 22 L80 42 H0 Z" fill="#fff" opacity=".18"/><rect x="0" y="2" width="30" height="40" fill="#fff" opacity=".22"/></svg>`;
  const page = holder({ x: 100, y: 452, w: W, h: H, tilt: -3.2, inner: journal + pageIn(bookPage(18), 0, 0, W, "pg") + tab });
  return `${desk({ top: SCENE_TOP, height: SCENE_H, base: "#5d3a24", dark: "#4a2d1b", planks: 5, seed: 11 })}
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(ellipse at 78% 30%,rgba(255,196,120,.28),rgba(0,0,0,0) 55%)")}"></div>
  ${page}
  ${pencilCup({ x: 748, y: 420, w: 214 })}
  ${drawing({ x: 718, y: 870, w: 250, rot: 5 })}
  ${sprig({ x: 640, y: 1215, len: 320, rot: -8 })}`;
}

/* ---------- 56: "A week at a time" pinned to a cork board, spare day circled ---------- */

function cork({ top, height }) {
  const dots = [];
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < 520; k++) {
    const dark = rnd() > 0.45;
    dots.push(`<circle cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * height).toFixed(0)}" r="${(1 + rnd() * 3.4).toFixed(1)}" fill="${dark ? "#8a5a30" : "#e9c48c"}" opacity="${(0.25 + rnd() * 0.4).toFixed(2)}"/>`);
  }
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <filter id="ck" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .05" numOctaves="4" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .08  0 0 0 1.3 -.3"/></filter>
    <filter id="ck2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .95  0 0 0 0 .78  0 0 0 0 .5  0 0 0 .9 -.3"/></filter>
    <radialGradient id="cl" cx="25%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#2b1a08" stop-opacity=".3"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="#c18f58"/><rect width="1000" height="${height}" filter="url(#ck)" opacity=".7"/><rect width="1000" height="${height}" filter="url(#ck2)" opacity=".6"/>${dots.join("")}
    <rect width="1000" height="${height}" fill="url(#cl)"/>
    <rect x="0" y="0" width="22" height="${height}" fill="#6b4a2c"/><rect x="22" y="0" width="5" height="${height}" fill="#000" opacity=".25"/><rect x="978" y="0" width="22" height="${height}" fill="#6b4a2c"/><rect x="973" y="0" width="5" height="${height}" fill="#000" opacity=".25"/></svg>`;
}

function scene56() {
  const W = 640, H = Math.round(W * ASPECT);
  // SPARE DAY row of page 13: label at 0.797 of the height, two ruled lines to 0.875, footnote at 0.903.
  // The loop is a squared-off hand-drawn oval that wraps the row without touching the label or the footnote.
  const cy = Math.round(H * 0.8335), ry = 42, cx = W / 2 + 2, rx = W / 2 - 16;
  const pts = [];
  const N = 120;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const ang = ((152 + t * 372) * Math.PI) / 180;
    const grow = 1 + 0.045 * t, n = 3.4;
    const c = Math.cos(ang), sn = Math.sin(ang);
    const wob = Math.sin(t * 17) * 1.6;
    pts.push([cx + rx * grow * Math.sign(c) * Math.abs(c) ** (2 / n) + wob, cy + ry * grow * Math.sign(sn) * Math.abs(sn) ** (2 / n) - t * 6 + wob]);
  }
  const d = pts.map((q, k) => `${k ? "L" : "M"}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
  const pen = `<svg style="${abs(-20, 0, W + 40, H, "overflow:visible;filter:drop-shadow(1px 2px 1px rgba(60,30,80,.3))")}" viewBox="${-20} 0 ${W + 40} ${H}" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${C.plum}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${C.plumDeep}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" opacity=".5"/></svg>`;
  const clip = binderClip({ x: W - 190, y: H - 36, rot: 180, size: 100 });
  const page = holder({ x: 170, y: 426, w: W, h: H, tilt: -2.2, inner: pageIn(bookPage(13), 0, 0, W, "pg") + pen + clip + pushPin({ x: -2, y: -30, color: C.plum }) + pushPin({ x: W - 50, y: -28, color: "#e0a95a" }) });
  return `${cork({ top: SCENE_TOP, height: SCENE_H })}
  ${page}
  ${pencil({ x: 60, y: 1290, len: 360, rot: 2 })}`;
}

/* ---------- 61: cover fanned over the plum divider on a pale desk ---------- */

function ribbon({ x, y, rot = 0 }) {
  return `<svg style="${abs(x, y, 70, 150, `transform:rotate(${rot}deg);filter:drop-shadow(4px 8px 5px rgba(40,20,5,.4))`)}" viewBox="0 0 70 150" preserveAspectRatio="none" aria-hidden="true">
    <path d="M6 0 L64 0 L64 150 L35 122 L6 150 Z" fill="${C.plum}"/><path d="M6 0 L22 0 L22 138 L6 150 Z" fill="#fff" opacity=".14"/><path d="M52 0 L64 0 L64 150 L52 140 Z" fill="#000" opacity=".12"/></svg>`;
}

function scene61() {
  const W = 560, H = Math.round(W * ASPECT);
  const cover = holder({ x: 436, y: 500, w: W, h: H, tilt: 3.5, inner: pageIn(bookPage(1), 0, 0, W, "cover") + binderClip({ x: W - 190, y: -46, rot: 0, size: 104 }) });
  const divider = holder({ x: 56, y: 404, w: W + 20, h: Math.round((W + 20) * ASPECT), tilt: -4.5, inner: pageIn(bookPage(11), 0, 0, W + 20, "div") });
  return `${desk({ top: SCENE_TOP, height: SCENE_H, base: "#efe8dc", dark: "#e4dac9", planks: 4, seed: 5 })}
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(100deg,rgba(255,255,255,.35),rgba(255,255,255,0) 50%,rgba(80,60,40,.1))")}"></div>
  ${divider}
  ${ribbon({ x: 700, y: 1192, rot: -3 })}
  ${cover}`;
}

export const pins = [
  printable({ n: 26, scene: scene26() }),
  printable({ n: 32, scene: scene32() }),
  printable({ n: 56, scene: scene56() }),
  printable({ n: 61, scene: scene61() }),
];
