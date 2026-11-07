/**
 * Four printed-page mockups from the real pages of The Homeschool Year:
 *   65  the weekly page, a close crop, clipped on a plum-and-cream desk
 *   69  the daily log, washi-taped to a torn sheet of kraft paper
 *   73  the one-subject page, standing in an open kraft folder
 *   77  the multiplication check sheet on a cool blue-grey school desk
 * Every word on a pin is the bank's headline, sub and the page's own text.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, pencil, binderClip } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/** A flat desk surface: a base colour, a soft light from the top left and an optional fine texture. */
function surface({ base, light = "rgba(255,255,255,.22)", shade = "rgba(30,20,40,.28)", texture = "", extra = "" }) {
  return `<div style="${abs(0, SCENE_TOP, 1000, H, `background:${texture ? texture + "," : ""}radial-gradient(120% 95% at 25% 10%,${light},${shade}),${base};${extra}`)}"></div>`;
}

/** A jagged polyline for a torn paper edge from (x0,y0) to (x1,y1). */
function tear(x0, y0, x1, y1, amp, seed, step = 14) {
  const r = rng(seed);
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
  const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny);
  const pts = [];
  for (let k = 1; k < n; k++) {
    const t = k / n, j = (r() - 0.5) * 2 * amp;
    pts.push(`${(x0 + (x1 - x0) * t + (nx / nl) * j).toFixed(1)} ${(y0 + (y1 - y0) * t + (ny / nl) * j).toFixed(1)}`);
  }
  return pts.map((q) => `L${q}`).join(" ") + ` L${x1} ${y1}`;
}

/** A sheet of kraft paper with torn right and bottom edges and a pale fibre rim where it tore. */
function kraft({ x, y, w, h, seed = 5 }) {
  const edge = (off) =>
    `M0 0 L${w + off} 0 ${tear(w + off, 0, w - 24 + off, h * 0.5, 9, seed)} ${tear(w - 24 + off, h * 0.5, w + 6 + off, h + off, 9, seed + 1)} ${tear(w + 6 + off, h + off, w * 0.55, h - 14 + off, 9, seed + 2)} ${tear(w * 0.55, h - 14 + off, 0, h - 2 + off, 9, seed + 3)} L0 0 Z`;
  return `<svg style="${abs(x, y, w + 20, h + 20, "filter:drop-shadow(0 3px 3px rgba(20,12,4,.35)) drop-shadow(0 22px 26px rgba(20,12,4,.45))")}" viewBox="0 0 ${w + 20} ${h + 20}" aria-hidden="true">
    <defs><filter id="kf" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .06" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .08  0 0 0 .55 -.18"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
    <path d="${edge(7)}" fill="#ecdcbc"/>
    <path d="${edge(0)}" fill="#c9a574"/><path d="${edge(0)}" fill="#fff" filter="url(#kf)" opacity="1"/>
    <path d="${edge(0)}" fill="url(#kg)"/><linearGradient id="kg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#3a2410" stop-opacity=".14"/></linearGradient></svg>`;
}

/** A strip of washi tape across a corner, translucent with a pattern and cut ends. */
function washi({ x, y, rot = 0, w = 190, h = 58, a = "#9a7ab0", b = "#e9dff0", kind = "stripe" }) {
  const pat = kind === "dots"
    ? `radial-gradient(circle at 10px 10px,${b} 0 3.4px,transparent 4px) 0 0/20px 20px,${a}`
    : `repeating-linear-gradient(90deg,${a} 0 14px,${b} 14px 28px)`;
  const zz = (side) => Array.from({ length: 6 }, (_, k) => `${side === "l" ? (k % 2 ? 0 : 5) : 100 - (k % 2 ? 0 : 3)}% ${(k * 100) / 5}%`);
  const poly = `polygon(${zz("l").join(",")},${zz("r").reverse().join(",")})`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 2px 2px rgba(20,12,4,.35))`)}"><div style="position:absolute;inset:0;background:${pat};opacity:.86;clip-path:${poly}"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.28),rgba(255,255,255,0) 40%,rgba(0,0,0,.08));clip-path:${poly}"></div></div>`;
}

/** A tin can of pencils, seen from slightly above. */
function pencilCup({ x, y, w = 150, body = "#6f8f86", rim = "#8fb0a6" }) {
  const h = w * 1.4;
  const pens = [[-22, "#d9534f", -16], [-6, "#e7b23f", -5], [12, "#3b7fb2", 8], [28, "#7a4b8a", 19]];
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 14px 10px rgba(20,12,4,.4))")}" viewBox="0 0 150 210" aria-hidden="true">
    ${pens.map(([dx, c, r]) => `<g transform="translate(${75 + dx} 70) rotate(${r})"><rect x="-6" y="-92" width="12" height="96" fill="${c}"/><rect x="-6" y="-92" width="4" height="96" fill="#fff" opacity=".28"/><path d="M-6 -92 L0 -112 L6 -92 Z" fill="#e9c9a0"/><path d="M-2.4 -104 L0 -112 L2.4 -104 Z" fill="#33363b"/></g>`).join("")}
    <path d="M10 56 V186 A65 20 0 0 0 140 186 V56 Z" fill="${body}"/>
    <path d="M10 56 V186 A65 20 0 0 0 40 205 V76 Z" fill="#fff" opacity=".12"/><path d="M110 76 V205 A65 20 0 0 0 140 186 V56 Z" fill="#000" opacity=".16"/>
    <path d="M10 56 A65 20 0 0 0 140 56" fill="none" stroke="${rim}" stroke-width="5"/>
    <ellipse cx="75" cy="56" rx="65" ry="20" fill="none" stroke="${rim}" stroke-width="5" opacity=".0"/>
    <path d="M10 56 A65 20 0 0 0 140 56 L140 70 A65 20 0 0 1 10 70 Z" fill="${rim}" opacity=".5"/></svg>`;
}

/** A pale translucent ruler with ticks only (no numerals), lying along its length. */
function ruler({ x, y, len = 900, rot = 90, color = "#9cc3dc" }) {
  const w = len, h = 92;
  const ticks = Array.from({ length: Math.floor((len - 40) / 10) + 1 }, (_, k) => {
    const long = k % 10 === 0, mid = k % 5 === 0;
    return `<line x1="${20 + k * 10}" y1="0" x2="${20 + k * 10}" y2="${long ? 34 : mid ? 24 : 15}" stroke="#2f4a5e" stroke-width="${long ? 2.4 : 1.6}"/>`;
  }).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(20,35,50,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="6" fill="${color}" opacity=".88"/><rect width="${w}" height="${h}" rx="6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
    <rect x="0" y="0" width="${w}" height="16" fill="#fff" opacity=".28"/>${ticks}</svg>`;
}

/** A blue pencil lying at an angle (the kit's pencil is yellow only). */
function bluePencil({ x, y, len = 420, rot = 0 }) {
  const w = len;
  return `<svg style="${abs(x, y, w, 30, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,35,50,.4))`)}" viewBox="0 0 ${w} 30" aria-hidden="true">
    <rect x="46" y="3" width="${w - 100}" height="24" rx="2" fill="#3f78b5"/><rect x="46" y="3" width="${w - 100}" height="7" fill="#8db5df" opacity=".75"/><rect x="46" y="20" width="${w - 100}" height="7" fill="#1f4a7a" opacity=".55"/>
    <rect x="${w - 54}" y="3" width="16" height="24" fill="#c9ccd2"/><rect x="${w - 38}" y="3" width="26" height="24" rx="8" fill="#e58b8b"/>
    <path d="M46 3 L2 15 L46 27 Z" fill="#e9c9a0"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;
}

/** A white-and-blue rubber eraser block with a paper sleeve. */
function eraser({ x, y, rot = 0, w = 130 }) {
  const h = w * 0.46;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 7px rgba(20,35,50,.4))`)}" viewBox="0 0 130 60" aria-hidden="true">
    <rect width="130" height="60" rx="9" fill="#f6f1ec"/><rect x="38" y="0" width="68" height="60" fill="#3d6fa0"/><rect x="38" y="0" width="68" height="14" fill="#fff" opacity=".2"/>
    <rect x="0" y="0" width="130" height="14" rx="9" fill="#fff" opacity=".5"/><rect x="0" y="46" width="130" height="14" rx="9" fill="#000" opacity=".08"/>
    <rect x="46" y="22" width="52" height="6" rx="3" fill="#fff" opacity=".7"/><rect x="46" y="34" width="34" height="6" rx="3" fill="#fff" opacity=".5"/></svg>`;
}

/* ---------------- 65: the weekly page, clipped, on a plum-and-cream desk ---------------- */
function scene65() {
  const linen = "repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(90,50,100,.05) 0 2px,transparent 2px 6px)";
  const crop = { x0: 0.04, y0: 0.1, x1: 0.96, y1: 1 };
  return `${surface({ base: "#d4bdd2", light: "rgba(255,255,255,.3)", shade: "rgba(70,35,80,.3)", texture: linen })}
  <div style="${abs(110, 410, 790, 940, "background:#f3eadf;border-radius:6px;transform:rotate(3.2deg);box-shadow:0 2px 3px rgba(40,20,50,.25),0 22px 40px rgba(60,30,70,.35)")}"></div>
  <div style="${abs(96, 398, 780, 940, "background:#e6d3e2;border-radius:6px;transform:rotate(-3.5deg);box-shadow:0 2px 3px rgba(40,20,50,.2),0 18px 34px rgba(60,30,70,.3)")}"></div>
  ${sheet({ src: bookPage(13), x: 130, y: 400, w: 700, tilt: -1.4, crop, id: "week" })}
  ${binderClip({ x: 235, y: 1232, rot: 180, size: 112 })}${binderClip({ x: 585, y: 1224, rot: 178, size: 112 })}
  ${pencil({ x: 700, y: 760, len: 470, rot: 84, body: "#c58bb8", band: "#d9d4dc" })}`;
}

/* ---------------- 69: the daily log, washi-taped to torn kraft ---------------- */
function scene69() {
  return `${surface({ base: "#3b4852", light: "rgba(255,255,255,.12)", shade: "rgba(0,0,0,.35)" })}
  ${kraft({ x: -30, y: 392, w: 985, h: 930, seed: 11 })}
  ${sheet({ src: bookPage(14), x: 108, y: 448, w: 640, tilt: 2.2, id: "log" })}
  ${washi({ x: 52, y: 432, rot: -38, a: "#8c5a9c", b: "#efe3f1", kind: "dots" })}
  ${washi({ x: 670, y: 436, rot: 36, a: "#e0a95a", b: "#fbf0d8", kind: "stripe" })}
  ${pencilCup({ x: 790, y: 1030, w: 160 })}
  ${pencil({ x: 130, y: 1272, len: 400, rot: -2 })}`;
}

/* ---------------- 73: the subject page standing in an open kraft folder ---------------- */
function scene73() {
  const px = 150, pw = 700, ph = Math.round(pw * (2200 / 1700));
  return `${surface({ base: "#a9bba3", light: "rgba(255,255,255,.28)", shade: "rgba(30,50,30,.3)", texture: "repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 3px,transparent 3px 7px)" })}
  <svg style="${abs(80, 392, 840, 40, "")}" viewBox="0 0 840 40" aria-hidden="true"></svg>
  <svg style="${abs(80, 392, 840, 960, "filter:drop-shadow(0 4px 4px rgba(20,35,20,.4)) drop-shadow(0 28px 34px rgba(20,35,20,.45))")}" viewBox="0 0 840 960" aria-hidden="true">
    <defs><linearGradient id="fb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d1ae80"/><stop offset="1" stop-color="#b98f5c"/></linearGradient></defs>
    <path d="M0 52 H560 L580 8 Q 584 0 594 0 H790 Q 800 0 804 8 L 816 52 H840 V960 H0 Z" fill="url(#fb)" transform="translate(0 20)"/>
    <path d="M0 72 H840" stroke="#8a6638" stroke-opacity=".3" stroke-width="2"/>
    <rect x="610" y="34" width="170" height="40" rx="5" fill="#f4efe4" transform="rotate(0 695 54)"/><rect x="610" y="34" width="170" height="40" rx="5" fill="none" stroke="#000" stroke-opacity=".12"/>
  </svg>
  ${sheet({ src: bookPage(15), x: px, y: 456, w: pw, tilt: 0, id: "subject" })}
  <svg style="${abs(80, 1236, 840, 140, "filter:drop-shadow(0 -4px 8px rgba(20,35,20,.4))")}" viewBox="0 0 840 140" aria-hidden="true">
    <defs><linearGradient id="ff" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dcb987"/><stop offset="1" stop-color="#c39a64"/></linearGradient></defs>
    <path d="M0 20 Q 0 10 10 10 H830 Q 840 10 840 20 V140 H0 Z" fill="url(#ff)"/>
    <rect x="0" y="10" width="840" height="9" rx="4" fill="#fff" opacity=".28"/><path d="M0 34 H840" stroke="#8a6638" stroke-opacity=".25" stroke-width="2"/></svg>
  ${pencil({ x: 440, y: 1300, len: 420, rot: -5 })}`;
}

/* ---------------- 77: the check sheet on a cool blue-grey school desk ---------------- */
function scene77() {
  const speck = Array.from({ length: 70 }, (_, k) => {
    const r = rng(k * 7 + 3);
    return `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#4c5d6e"}" opacity=".18"/>`;
  }).join("");
  const sheets = [[-9.5, "#f1ebdf"], [-4.5, "#f6f1e6"]].map(([t, c]) => `<div style="${abs(170, 430, 640, 828, `background:${c};border-radius:3px;transform:rotate(${t}deg);box-shadow:0 2px 3px rgba(20,35,50,.25),0 16px 28px rgba(20,35,50,.3)`)}"></div>`).join("");
  return `${surface({ base: "#9fb0bf", light: "rgba(255,255,255,.34)", shade: "rgba(25,40,60,.34)" })}
  <svg style="${abs(0, SCENE_TOP, 1000, H, "")}" viewBox="0 0 1000 ${H}" aria-hidden="true">${speck}<rect x="0" y="40" width="1000" height="22" fill="#6c8196" opacity=".42"/><rect x="0" y="40" width="1000" height="4" fill="#fff" opacity=".35"/></svg>
  ${sheets}
  ${sheet({ src: bookPage(21), x: 170, y: 430, w: 640, tilt: 6.5, id: "check" })}
  ${ruler({ x: 475, y: 790, len: 880, rot: 90, color: "#a6cbe0" })}
  ${eraser({ x: 70, y: 1210, rot: -14 })}
  ${bluePencil({ x: 270, y: 1292, len: 440, rot: -4 })}`;
}

export const pins = [
  printable({ n: 65, scene: scene65() }),
  printable({ n: 69, scene: scene69(), extraCss: ".top{top:52px}.top h1{font-size:66px}.top p{font-size:24px;margin-top:10px}" }),
  printable({ n: 73, scene: scene73() }),
  printable({ n: 77, scene: scene77() }),
];
