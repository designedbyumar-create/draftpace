import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, desk, pencil, drawing } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const PAGE = 2200 / 1700;

/** A flat desk-mat surface (sage, felt-like): speckle, soft light from the top left. */
function sageDesk({ top = SCENE_TOP, height = H }) {
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const dots = Array.from({ length: 420 }, () => `<circle cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * height).toFixed(0)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="${rnd() > 0.5 ? "#fff" : "#4b6148"}" opacity="${(0.07 + rnd() * 0.1).toFixed(2)}"/>`).join("");
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><radialGradient id="sg" cx="28%" cy="14%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#25361f" stop-opacity=".34"/></radialGradient></defs><rect width="1000" height="${height}" fill="#97ae92"/>${dots}<rect width="1000" height="${height}" fill="url(#sg)"/></svg>`;
}

/** A sheet of cream card the pages sit on. */
function creamCard({ x, y, w, h, tilt = 0 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:linear-gradient(135deg,#f6ecd6,#eadcbd);border-radius:6px;box-shadow:0 2px 3px rgba(30,40,20,.3),0 22px 40px rgba(30,40,20,.35)`)}"></div>`;
}

/** A strip of washi tape (translucent, striped). */
function washi({ x, y, w = 190, h = 54, rot = 0, a = "#e7b0a4", b = "#f3d3c9" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:repeating-linear-gradient(115deg,${a} 0 14px,${b} 14px 28px);opacity:.88;box-shadow:0 3px 6px rgba(60,40,10,.28);clip-path:polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,100% 100%,12% 100%,8% 90%,4% 100%,0 92%)`)}"></div>`;
}

/** A potted plant with a few broad leaves, terracotta pot. */
function plant({ x, y, s = 1 }) {
  const leaf = (rot, len, col, dx = 0) => `<g transform="translate(${100 + dx} 190) rotate(${rot})"><path d="M0 0 C -26 -${len * 0.35}, -22 -${len * 0.8}, 0 -${len} C 22 -${len * 0.8}, 26 -${len * 0.35}, 0 0 Z" fill="${col}"/><path d="M0 -4 L0 -${len * 0.9}" stroke="#fff" stroke-opacity=".28" stroke-width="3"/></g>`;
  return `<svg style="${abs(x, y, 200 * s, 300 * s, "filter:drop-shadow(0 14px 10px rgba(60,40,10,.3))")}" viewBox="0 0 200 300" aria-hidden="true">
    ${leaf(-52, 130, "#5f8a5a", -10)}${leaf(48, 125, "#6f9a62", 10)}${leaf(-24, 170, "#4d7c4f")}${leaf(26, 160, "#78a368")}${leaf(0, 185, "#5f8f58")}${leaf(-78, 90, "#7aa86a", -16)}${leaf(76, 92, "#4f7f50", 16)}
    <path d="M44 186 H156 L142 292 Q100 302 58 292 Z" fill="#c4724b"/><rect x="38" y="176" width="124" height="26" rx="6" fill="#d4825a"/><rect x="38" y="176" width="124" height="8" rx="4" fill="#fff" opacity=".2"/><ellipse cx="100" cy="180" rx="56" ry="6" fill="#4a3322"/></svg>`;
}

/** A page held at a fan angle: rotates about (px, py), page bottom-centre sits at the pivot. */
function fanned({ src, w, rot, px, py, id }) {
  const h = Math.round(w * PAGE);
  return `<div style="position:absolute;left:0;top:0;width:1000px;height:1500px;transform-origin:${px}px ${py}px;transform:rotate(${rot}deg)">${sheet({ src, x: px - w / 2, y: py - h, w, id })}</div>`;
}

/* ---- 84: questions in front, the answer page at the back, on a sage desk ---- */
const scene84 = `${sageDesk({})}
  ${creamCard({ x: 52, y: 430, w: 896, h: 890, tilt: -1.2 })}
  ${sheet({ src: bookPage(28), x: 280, y: 398, w: 560, tilt: 2.5, id: "answers" })}
  ${sheet({ src: bookPage(22), x: 120, y: 530, w: 610, tilt: -2.5, id: "questions" })}
  ${drawing({ x: 712, y: 1120, w: 235, rot: 6 })}
  ${pencil({ x: 190, y: 1282, len: 360, rot: -3 })}`;

/* ---- 91: the year page taped to a cream wall, window light, a plant on the ledge ---- */
function wall() {
  return `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <linearGradient id="wl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e6cf"/><stop offset="1" stop-color="#dccdaf"/></linearGradient>
    <linearGradient id="ld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98d57"/><stop offset="1" stop-color="#9d7343"/></linearGradient></defs>
    <rect width="1000" height="${H}" fill="url(#wl)"/>
    ${Array.from({ length: 11 }, (_, k) => `<rect x="${k * 100 + 46}" y="0" width="8" height="${H}" fill="#c9b78f" opacity=".16"/>`).join("")}
    <rect x="0" y="${H - 200}" width="1000" height="200" fill="#e0d2b4"/><rect x="0" y="${H - 204}" width="1000" height="8" fill="#c9b78f"/>
    <rect x="0" y="${H - 282}" width="1000" height="26" fill="url(#ld)"/><rect x="0" y="${H - 256}" width="1000" height="22" fill="#2b1a08" opacity=".16"/></svg>`;
}
const beam = `<svg style="${abs(0, SCENE_TOP, 1000, H, "mix-blend-mode:soft-light;pointer-events:none")}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe9a8" stop-opacity=".15"/></linearGradient></defs>
  <polygon points="40,0 260,0 760,${H - 20} 470,${H - 20}" fill="url(#bm)"/><polygon points="330,0 440,0 960,${H - 20} 860,${H - 20}" fill="url(#bm)" opacity=".75"/></svg>
  <svg style="${abs(0, SCENE_TOP, 1000, H, "pointer-events:none")}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><linearGradient id="bm2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4" stop-opacity=".24"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></linearGradient></defs>
  <polygon points="40,0 260,0 760,${H - 20} 470,${H - 20}" fill="url(#bm2)"/><polygon points="330,0 440,0 960,${H - 20} 860,${H - 20}" fill="url(#bm2)"/></svg>`;
const yearCrop = { x0: 0, y0: 0, x1: 1, y1: 0.66 };
const scene91 = `${wall()}
  ${sheet({ src: bookPage(12), x: 90, y: 440, w: 820, tilt: -1.6, crop: yearCrop, id: "year", radius: 2 })}
  ${washi({ x: 40, y: 430, w: 200, rot: -38 })}${washi({ x: 760, y: 432, w: 200, rot: 36, a: "#8fb3a3", b: "#cfe2d8" })}
  ${washi({ x: 400, y: 1130, w: 190, rot: -3, a: "#e0b866", b: "#f2dca6" })}
  ${plant({ x: 740, y: 1050, s: 1.0 })}
  ${pencil({ x: 120, y: 1272, len: 380, rot: 2 })}
  ${beam}`;

/* ---- 94: a fan of the working pages on a pale ash desk ---- */
const scene94 = `${desk({ top: SCENE_TOP, height: H, base: "#ddd0b8", dark: "#cbbba0", planks: 5, seed: 8 })}
  ${fanned({ src: bookPage(11), w: 610, rot: -21, px: 505, py: 1325, id: "divider" })}
  ${fanned({ src: bookPage(12), w: 610, rot: -10, px: 515, py: 1325, id: "year" })}
  ${fanned({ src: bookPage(13), w: 610, rot: 3, px: 525, py: 1325, id: "week" })}
  ${fanned({ src: bookPage(17), w: 610, rot: 16, px: 530, py: 1325, id: "reading" })}
  ${pencil({ x: 300, y: 1215, len: 520, rot: -14 })}`;

export const pins = [
  printable({ n: 84, scene: scene84 }),
  printable({ n: 91, scene: scene91 }),
  printable({ n: 94, scene: scene94 }),
];
