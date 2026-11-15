/**
 * Group D (ADHD Life Companion, mockup-printable pins #15, #19, #23):
 * a home-office monitor edge with butter sticky notes (15), a window-lit
 * marble cafe table with a laptop and a cup (19), a hall console with a
 * key bowl and a post tray (23). Every page is the real page of the
 * printed Alongside Book, exactly as printed.
 */
import { esc } from "../../v3/kit.mjs";
import { idea, C } from "../kit/bank.mjs";
import { bookPage } from "../kit/assets.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, sheet, binderClip } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/* ---------- shared props (flat vector, soft shadows) ---------- */

/** A butter sticky note with handwritten-style words (the bank's own words). */
function sticky(text, { x, y, w = 210, h = 210, rot = 0, color = "#f3d985", size = 32 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,#f9e7a3 0%,${color} 70%,#e9c868 100%);box-shadow:0 2px 3px rgba(30,15,25,.3),0 14px 22px rgba(30,15,25,.35);overflow:hidden`)}">
    <div style="${abs(0, 0, w, 30, "background:rgba(255,255,255,.22)")}"></div>
    <div style="position:absolute;left:18px;right:8px;top:44px;font:italic 500 ${size}px/1.14 'Newsreader',Georgia,serif;color:#3a2a33">${esc(text)}</div></div>`;
}

/** A kraft envelope seen from above, flap down. */
function envelope({ x, y, w = 300, rot = 0, color = "#c8a679", flap = "#b99468" }) {
  const h = Math.round(w * 0.68);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(30,15,25,.38))`)}" viewBox="0 0 300 204" aria-hidden="true">
    <rect width="300" height="204" rx="7" fill="${color}"/><rect width="300" height="204" rx="7" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <path d="M0 204 L128 100 M300 204 L172 100" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/>
    <path d="M3 3 L150 124 L297 3 Z" fill="${flap}"/><path d="M3 3 L150 124 L297 3" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>
    <path d="M12 8 L150 118 L288 8" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/></svg>`;
}

/** A ballpoint pen lying at an angle. */
function pen({ x, y, len = 400, rot = 0, body = C.mulberryDeep }) {
  const h = 34;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 7px rgba(30,15,25,.4))`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
    <path d="M0 17 L58 7 V27 Z" fill="#d9cdbd"/><path d="M0 17 L16 14.4 V19.6 Z" fill="#2b2b30"/>
    <rect x="56" y="5" width="${len - 106}" height="24" rx="6" fill="${body}"/><rect x="56" y="7" width="${len - 106}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 54}" y="7" width="48" height="20" rx="8" fill="#26222a"/>
    <rect x="130" y="1" width="${len - 200}" height="8" rx="4" fill="#c9962f"/><rect x="130" y="1" width="${len - 200}" height="3" rx="1.5" fill="#fff" opacity=".35"/><circle cx="130" cy="5" r="5" fill="#c9962f"/></svg>`;
}

/* ---------- #15 home office: a monitor edge with sticky notes ---------- */
function pin15() {
  const notes = [
    ["A claim number", 38, 488, -3.5, "#f3d985"],
    ["An appointment reference", 268, 470, 2.5, "#f5df94"],
    ["A phone number", 504, 492, -2, "#f2d37c"],
    ["Not a notes page.", 742, 474, 3.5, "#f6e19b"],
  ].map(([t, x, y, r, c]) => sticky(t, { x, y, w: 216, h: 196, rot: r, color: c, size: 31 })).join("");
  const monitor = `
  <svg style="${abs(0, 372, 1000, 290)}" viewBox="0 0 1000 290" aria-hidden="true">
    <defs>
      <linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3043"/><stop offset=".55" stop-color="#241f2c"/><stop offset="1" stop-color="#1a1621"/></linearGradient>
      <linearGradient id="bez" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2c34"/><stop offset="1" stop-color="#1b191f"/></linearGradient>
    </defs>
    <rect width="1000" height="290" fill="url(#bez)"/>
    <rect x="0" y="0" width="1000" height="214" fill="url(#scr)"/>
    <path d="M120 0 L330 0 L190 214 L0 214 L0 150 Z" fill="#fff" opacity=".045"/>
    <path d="M520 0 L610 0 L470 214 L380 214 Z" fill="#fff" opacity=".03"/>
    <rect x="0" y="212" width="1000" height="3" fill="#000" opacity=".5"/>
    <rect x="0" y="215" width="1000" height="2" fill="#fff" opacity=".1"/>
    <circle cx="940" cy="255" r="5" fill="#9a8aa4" opacity=".7"/>
  </svg>`;
  const scene = `
  ${desk({ top: 372, height: 1000, base: "#7b7280", dark: "#6c6471", planks: 1, seed: 5 })}
  <div style="${abs(0, 662, 1000, 60, "background:linear-gradient(rgba(10,5,15,.5),rgba(10,5,15,0))")}"></div>
  ${monitor}
  ${sheet({ src: bookPage(6), x: 36, y: 712, w: 600, tilt: -2, crop: null })}
  ${envelope({ x: 684, y: 790, w: 290, rot: 5, color: "#c4a272", flap: "#b38d5e" })}
  ${envelope({ x: 706, y: 868, w: 270, rot: -4, color: "#cfae7e", flap: "#be9969" })}
  ${envelope({ x: 690, y: 948, w: 285, rot: 3, color: "#c8a679", flap: "#b99468" })}
  ${pen({ x: 676, y: 1210, len: 330, rot: -24 })}
  ${notes}`;
  return printable({ n: 15, scene, paper: "#ebe5e8", bottomMax: 368 });
}

/* ---------- #19 cafe: window-lit marble table, laptop and cup ---------- */
function marble() {
  const r = rng(21);
  const veins = [];
  for (let k = 0; k < 14; k++) {
    const sx = r() * 1000, sy = 372 + r() * 980;
    veins.push(`<path d="M${sx} ${sy} C ${sx + 120 + r() * 120} ${sy + 60 - r() * 160}, ${sx + 260 + r() * 160} ${sy + 80 - r() * 180}, ${sx + 420 + r() * 200} ${sy + 20 + r() * 120}" fill="none" stroke="#9d968d" stroke-opacity="${(0.1 + r() * 0.18).toFixed(2)}" stroke-width="${(1 + r() * 2.4).toFixed(1)}" stroke-linecap="round"/>`);
  }
  return `<div style="${abs(0, 372, 1000, 1000, "background:radial-gradient(120% 90% at 20% 10%,#f6f1e8 0%,#e9e2d6 55%,#d9d1c4 100%)")}"></div>
  <svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${veins.join("")}</svg>`;
}

function windowLight() {
  const pane = (cx, cy, w = 200, h = 300, skew = 190) => `<polygon points="${cx},${cy} ${cx + w},${cy} ${cx + w + skew},${cy + h} ${cx + skew},${cy + h}" />`;
  const panes = [];
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) panes.push(pane(-120 + col * 250 + row * 20, 330 + row * 340));
  return `<svg style="${abs(0, 0, 1000, 1500, "filter:blur(2.5px)")}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><linearGradient id="lt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff4cf" stop-opacity=".95"/><stop offset="1" stop-color="#ffe6a8" stop-opacity=".45"/></linearGradient></defs><g fill="url(#lt)" opacity=".75">${panes.join("")}</g></svg>`;
}

function laptop({ x, y, w = 480, rot = 0 }) {
  const keys = [];
  for (let row = 0; row < 5; row++) for (let col = 0; col < 13; col++) {
    const kx = 62 + col * 33.2, ky = 26 + row * 31;
    if (row === 4 && col > 2 && col < 10) continue;
    keys.push(`<rect x="${kx}" y="${ky}" width="29" height="26" rx="5" fill="#3b3941"/><rect x="${kx}" y="${ky}" width="29" height="5" rx="2.5" fill="#fff" opacity=".07"/>`);
  }
  keys.push(`<rect x="${62 + 3 * 33.2}" y="${26 + 4 * 31}" width="${7 * 33.2 - 4}" height="26" rx="5" fill="#3b3941"/>`);
  return `<svg style="${abs(x, y, w, w * 0.74, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(40,25,10,.4))`)}" viewBox="0 0 560 414" aria-hidden="true">
    <defs><linearGradient id="alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3e3e7"/><stop offset="1" stop-color="#b9bac0"/></linearGradient></defs>
    <rect x="4" y="0" width="552" height="410" rx="26" fill="url(#alu)"/><rect x="4" y="0" width="552" height="410" rx="26" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <rect x="46" y="14" width="468" height="176" rx="12" fill="#2a2830"/>${keys.join("")}
    <rect x="186" y="232" width="188" height="120" rx="12" fill="#cfd0d5" stroke="#000" stroke-opacity=".12" stroke-width="2"/></svg>`;
}

function cup({ x, y, size = 300 }) {
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 16px 12px rgba(40,25,10,.38))")}" viewBox="0 0 300 300" aria-hidden="true">
    <circle cx="140" cy="150" r="128" fill="#f7f3ec"/><circle cx="140" cy="150" r="128" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/><circle cx="140" cy="150" r="100" fill="#e9e3d8"/>
    <path d="M196 96 C 286 86 286 214 196 204" fill="none" stroke="#f7f3ec" stroke-width="30" stroke-linecap="round"/><path d="M196 96 C 280 90 280 208 196 200" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="30" stroke-linecap="round"/>
    <circle cx="140" cy="150" r="84" fill="#fbf8f2" stroke="#000" stroke-opacity=".08" stroke-width="3"/><circle cx="140" cy="150" r="70" fill="#8a5a38"/><circle cx="140" cy="150" r="70" fill="none" stroke="#6b4228" stroke-width="5"/>
    <path d="M140 188 C 98 160 104 126 126 126 C 134 126 140 132 140 138 C 140 132 146 126 154 126 C 176 126 182 160 140 188Z" fill="#f2e3cc"/>
    <ellipse cx="116" cy="124" rx="22" ry="12" fill="#fff" opacity=".14"/>
    <g transform="rotate(-24 70 262)"><ellipse cx="46" cy="262" rx="20" ry="13" fill="#c9cbd0"/><rect x="58" y="259" width="108" height="6" rx="3" fill="#c9cbd0"/></g></svg>`;
}

function pin19() {
  const scene = `
  ${marble()}
  ${windowLight()}
  ${laptop({ x: -150, y: 372, w: 520, rot: -9 })}
  ${cup({ x: 14, y: 1030, size: 300 })}
  ${sheet({ src: bookPage(7), x: 352, y: 468, w: 600, tilt: 3.5, crop: null })}
  ${pen({ x: 446, y: 1180, len: 410, rot: -9, body: C.mulberry })}`;
  return printable({ n: 19, scene, paper: "#f2eadb", bottomMax: 368 });
}

/* ---------- #23 hall console: a fan of pages 1 to 7, key bowl, post tray ---------- */
function keyBowl({ x, y, w = 150 }) {
  const key = (rot, c) => `<g transform="rotate(${rot} 110 112)"><circle cx="110" cy="62" r="19" fill="${c}"/><circle cx="110" cy="62" r="7" fill="#3c2b20" opacity=".7"/><rect x="104" y="78" width="12" height="76" rx="3" fill="${c}"/><path d="M116 124 H134 V135 H116ZM116 142 H130 V153 H116Z" fill="${c}"/><rect x="104" y="78" width="4" height="76" fill="#fff" opacity=".3"/></g>`;
  return `<svg style="${abs(x, y, w, w, "filter:drop-shadow(0 14px 10px rgba(20,8,10,.5))")}" viewBox="0 0 220 220" aria-hidden="true">
    <defs><radialGradient id="bw" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#9a6a7e"/><stop offset="1" stop-color="${C.mulberryDeep}"/></radialGradient></defs>
    <circle cx="110" cy="110" r="106" fill="url(#bw)"/><circle cx="110" cy="110" r="106" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>
    <circle cx="110" cy="110" r="86" fill="#3d2530"/><circle cx="110" cy="112" r="80" fill="#4a2e3a"/>
    ${key(-38, "#c9962f")}${key(26, "#b6b9bd")}${key(78, "#d9aa45")}
    <rect x="86" y="92" width="36" height="46" rx="8" fill="#f1e7eb" transform="rotate(-12 104 115)"/><circle cx="102" cy="104" r="4" fill="${C.mulberry}"/>
    <ellipse cx="72" cy="52" rx="34" ry="14" fill="#fff" opacity=".13" transform="rotate(-28 72 52)"/></svg>`;
}

function postTray({ x, y, w = 170 }) {
  const h = Math.round(w * 0.7);
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 14px 10px rgba(20,8,10,.5))")}" viewBox="0 0 300 210" aria-hidden="true">
    <rect width="300" height="210" rx="16" fill="#c9b28a"/><rect width="300" height="210" rx="16" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
    <rect x="14" y="14" width="272" height="182" rx="9" fill="#e3d2b0"/><rect x="14" y="14" width="272" height="182" rx="9" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <g transform="rotate(-5 150 105)"><rect x="34" y="36" width="190" height="130" rx="5" fill="#c8a679"/><path d="M34 36 L129 100 L224 36" fill="#b99468" stroke="#000" stroke-opacity=".15" stroke-width="2"/></g>
    <g transform="rotate(4 150 105)"><rect x="70" y="52" width="196" height="132" rx="5" fill="#f7efe3"/><path d="M70 52 L168 118 L266 52" fill="#eadfce" stroke="#000" stroke-opacity=".12" stroke-width="2"/><rect x="226" y="62" width="30" height="36" fill="none" stroke="${C.mulberry}" stroke-opacity=".7" stroke-width="3" stroke-dasharray="5 4"/></g>
    <g transform="rotate(-2 150 105)"><rect x="52" y="82" width="180" height="100" rx="5" fill="#f1e7eb"/><path d="M52 82 L142 138 L232 82" fill="#e5d6dc" stroke="#000" stroke-opacity=".12" stroke-width="2"/></g></svg>`;
}

function pin23() {
  const fan = [2, 3, 4, 5, 6, 7];
  const w = 554, dy = 104, x0 = 376, y0 = 418;
  const tilts = [1.2, -1, 1.6, -1.4, 1, -0.6];
  const pages = fan.map((n, k) => sheet({ src: bookPage(n), x: x0 + k * 12, y: y0 + k * dy, w, tilt: tilts[k], crop: null, id: "fanpage" })).join("");
  const scene = `
  ${desk({ top: 372, height: 1000, base: "#7a5238", dark: "#693f2b", planks: 5, seed: 17 })}
  <div style="${abs(0, 372, 1000, 56, "background:linear-gradient(#ecd5db,#e3c6cf)")}"></div>
  <div style="${abs(0, 424, 1000, 8, "background:#4a2c20;box-shadow:0 8px 12px rgba(10,5,5,.5)")}"></div>
  ${sheet({ src: bookPage(1), x: -14, y: 452, w, tilt: -4, crop: null, id: "coverpage" })}
  ${pages}
  ${binderClip({ x: 660, y: y0 - 38, rot: 0, size: 110 })}
  ${sticky("leave a page blank when there's nothing there", { x: 40, y: 556, w: 232, h: 232, rot: -3, size: 31 })}
  ${postTray({ x: 20, y: 1200, w: 150 })}
  ${keyBowl({ x: 178, y: 1176, w: 146 })}`;
  return printable({ n: 23, scene, paper: "#f0e2e4", bottomMax: 368 });
}

export const pins = [pin15(), pin19(), pin23()];
