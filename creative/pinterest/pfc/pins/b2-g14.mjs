/**
 * Batch 2, group G14: four product pins in the art-studio world (paint palette, brushes in jars,
 * canvases, tubes of paint, drop cloth, painted floorboards).
 *
 *   #33  how to set up a tracker: four paint-chip step cards on a paint-spattered drop cloth, the real Records screen on a phone
 *   #35  quote card: the real closing page 80 on sage painted boards, with a mug, a brush and a palette
 *   #37  where does your money information live: real page 8 on mustard floorboards, nine source cards, a sketchbook and a folder
 *   #40  what should not count as available money: a forest panel, the real page 14, a brush jar and a lidded paint jar
 *
 * Words: every word is the idea bank's (headline, sub, items, proof) or a cut of it, or a word that is
 * real on the page or screen shown. Set here and not verbatim: the seven area names on #33 are the proof
 * line's own list (capitalised); the jar tapes on #40 read "Available" and "Protected", two words of the
 * idea's own headline and sub. Nothing else.
 */
import { printable } from "../kit/printable.mjs";
import { idea, footFor, C, p } from "../kit/bank.mjs";
import { bookPage, screen } from "../kit/assets.mjs";
import { sheet, mug, pencil } from "../kit/paper.mjs";
import { phone } from "../kit/phone.mjs";
import { icon } from "../kit/icons.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
let uid = 0;
/** Keeps every prop under the kit's header and foot bars, whatever z-index it has. */
const wrap = (scene) => `<div style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:1;isolation:isolate">${scene}</div>`;
const rndOf = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/* ------------------------------------------------------------------ shared studio props */

/** Fine grain over a surface. */
const grain = (opacity = 0.3, freq = 0.7, seed = 4, y = 372, h = 982) =>
  `<svg style="${abs(0, y, 1000, h, `opacity:${opacity};mix-blend-mode:multiply;pointer-events:none`)}" aria-hidden="true"><filter id="gr${++uid}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .35  0 0 0 .55 0"/></filter><rect width="1000" height="${h}" filter="url(#gr${uid})"/></svg>`;

/** Light falling from the top left. */
const light = (a = 0.22, b = 0.3, tint = "20,12,4", y = 372, h = 982) =>
  `<div style="${abs(0, y, 1000, h, `background:radial-gradient(ellipse at 22% 8%,rgba(255,255,255,${a}),rgba(${tint},${b}) 100%)`)}"></div>`;

/** Paint splatter: round drops, a few elongated flicks. */
function splatter({ y = 372, h = 982, colors, n = 40, seed = 1, maxR = 9, opacity = 0.9 }) {
  const r = rndOf(seed);
  const out = [];
  for (let k = 0; k < n; k++) {
    const cx = r() * 1000, cy = r() * h, rad = 2 + r() * r() * maxR, col = colors[Math.floor(r() * colors.length)];
    if (r() < 0.25) {
      const rot = r() * 180;
      out.push(`<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(rad * 2.6).toFixed(1)}" ry="${(rad * 0.8).toFixed(1)}" transform="rotate(${rot.toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${col}"/>`);
    } else out.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rad.toFixed(1)}" fill="${col}"/>`);
    if (rad > 5) for (let m = 0; m < 3; m++) out.push(`<circle cx="${(cx + (r() - 0.5) * rad * 6).toFixed(1)}" cy="${(cy + (r() - 0.5) * rad * 6).toFixed(1)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="${col}"/>`);
  }
  return `<svg style="${abs(0, y, 1000, h, `opacity:${opacity};pointer-events:none`)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${out.join("")}</svg>`;
}

/** Painted floorboards or a painted table top: boards, seams, worn grain. */
function planks({ y = 372, h = 982, base, alt, seam = "#00000033", vertical = false, n = 6, seed = 5 }) {
  const r = rndOf(seed);
  const len = vertical ? h : 1000, across = vertical ? 1000 : h, size = across / n;
  const parts = [];
  for (let k = 0; k < n; k++) {
    const o = k * size;
    const rect = vertical ? `<rect x="${o}" y="0" width="${size}" height="${h}"` : `<rect x="0" y="${o}" width="1000" height="${size}"`;
    parts.push(`${rect} fill="${k % 2 ? alt : base}"/>`);
    parts.push(vertical ? `<rect x="${o}" y="0" width="3" height="${h}" fill="${seam}"/>` : `<rect x="0" y="${o}" width="1000" height="3" fill="${seam}"/>`);
    for (let g = 0; g < 8; g++) {
      const q = o + 6 + r() * (size - 12), a = r() * len * 0.3, b = len * (0.55 + r() * 0.45), w = (0.8 + r() * 1.4).toFixed(1), d = (r() - 0.5) * 8;
      parts.push(vertical
        ? `<path d="M${q} ${a} C ${q + d} ${b * 0.4}, ${q - d} ${b * 0.7}, ${q + d / 2} ${b}" fill="none" stroke="#000" stroke-opacity="${(0.05 + r() * 0.08).toFixed(2)}" stroke-width="${w}"/>`
        : `<path d="M${a} ${q} C ${b * 0.4} ${q + d}, ${b * 0.7} ${q - d}, ${b} ${q + d / 2}" fill="none" stroke="#000" stroke-opacity="${(0.05 + r() * 0.08).toFixed(2)}" stroke-width="${w}"/>`);
    }
  }
  return `<svg style="${abs(0, y, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${parts.join("")}</svg>`;
}

/** A paintbrush lying flat, bristles to the left: handle, ferrule, loaded bristles. */
function brush({ x, y, len = 460, rot = 0, handle = "#2f6b57", tip = "#c4573e", z = 7, w = 34 }) {
  const hl = len - 150;
  return `<svg style="${abs(x, y, len, w, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 9px 6px rgba(30,15,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <path d="M${len - 6} 17 Q ${len - 6} 12 ${len - 20} 11 L 150 6 L 150 28 L ${len - 20} 23 Q ${len - 6} 22 ${len - 6} 17 Z" fill="${handle}"/>
    <path d="M${len - 20} 11 L 150 6 L 150 13 L ${len - 20} 15 Z" fill="#fff" opacity=".22"/>
    <rect x="${len - 90}" y="${(10).toFixed(0)}" width="6" height="14" fill="#fff" opacity=".5" transform="rotate(0)"/>
    <rect x="100" y="4" width="56" height="26" rx="3" fill="#c9ccd2"/><rect x="100" y="4" width="56" height="8" rx="3" fill="#fff" opacity=".6"/><rect x="118" y="4" width="3" height="26" fill="#8b9098"/><rect x="134" y="4" width="3" height="26" fill="#8b9098"/>
    <path d="M100 5 C 70 6, 36 10, 6 17 C 36 24, 70 28, 100 29 Z" fill="#e9dcc2"/><path d="M60 9 C 40 11, 20 14, 6 17 C 22 20, 42 23, 60 26 Z" fill="${tip}"/>
    <path d="M100 5 C 70 6, 36 10, 6 17 C 36 15, 70 11, 100 9 Z" fill="#fff" opacity=".28"/></svg>`;
}

/** A tube of paint lying flat, cap to the left, crimped end to the right (a colour band, no print). */
function tube({ x, y, len = 260, rot = 0, color = C.forest, z = 7 }) {
  const h = 70;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 10px 8px rgba(30,15,5,.4))`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
    <rect x="2" y="24" width="30" height="22" rx="3" fill="#e9e4d6"/><rect x="32" y="20" width="26" height="30" rx="4" fill="#e9e4d6"/><rect x="32" y="20" width="26" height="8" rx="3" fill="#fff" opacity=".55"/>
    <path d="M58 22 L ${len - 40} 6 L ${len - 40} 64 L 58 48 Z" fill="#d9d6cd"/>
    <path d="M58 22 L ${len - 40} 6 L ${len - 40} 28 L 58 31 Z" fill="#fff" opacity=".55"/>
    <path d="M58 34 L ${len - 40} 30 L ${len - 40} 50 L 58 42 Z" fill="${color}"/>
    <path d="M${len - 40} 6 L ${len - 8} 8 L ${len - 8} 62 L ${len - 40} 64 Z" fill="#b8b6ae"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${len - 38 + k * 5} 8 V 62" stroke="#8e8c84" stroke-width="1.5"/>`).join("")}</svg>`;
}

/** A wooden kidney palette with blobs of paint (no figures, no words). */
function palette({ x, y, w = 340, rot = 0, z = 6, blobs }) {
  const h = w * 0.74;
  const cols = blobs ?? [C.forest, "#e0a53a", "#c4573e", "#3f6e9a", "#f6f1e4", "#2c2a27"];
  const spots = [[84, 52], [138, 36], [196, 44], [236, 82], [120, 160], [178, 148]];
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 16px 12px rgba(30,15,5,.42))`)}" viewBox="0 0 300 222" aria-hidden="true"><defs><linearGradient id="pw${++uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2c08b"/><stop offset="1" stop-color="#c79a62"/></linearGradient></defs>
    <path fill-rule="evenodd" d="M40 70 C 40 20, 150 0, 230 20 C 290 36, 300 100, 250 130 C 215 152, 205 190, 150 205 C 80 222, 10 160, 40 70 Z M62 128 a22 15 -25 1 0 44 0 a22 15 -25 1 0 -44 0 Z" fill="url(#pw${uid})"/>
    <path d="M40 70 C 40 20, 150 0, 230 20 C 290 36, 300 100, 250 130 C 215 152, 205 190, 150 205 C 80 222, 10 160, 40 70 Z" fill="none" stroke="#8a6234" stroke-opacity=".5" stroke-width="3"/>
    ${spots.map(([cx, cy], k) => `<g><ellipse cx="${cx + 2}" cy="${cy + 5}" rx="23" ry="15" fill="#000" opacity=".22"/><ellipse cx="${cx}" cy="${cy}" rx="23" ry="15" fill="${cols[k % cols.length]}"/><ellipse cx="${cx - 7}" cy="${cy - 6}" rx="9" ry="4" fill="#fff" opacity=".4"/></g>`).join("")}</svg>`;
}

/**
 * A glass jar seen from the front. kind "brushes": water-tinted glass with brushes standing in it;
 * kind "lidded": a jar of paint with a screw lid. The tape label is set text (22 px or more).
 */
function jar({ x, y, w = 210, kind = "brushes", label, rot = 0, paint = C.forest, z = 7, check = "label" }) {
  const h = w * 1.42;
  const k = w / 200;
  const bru = [[-15, "#2f6b57", "#c4573e"], [-4, "#7a5230", "#3f6e9a"], [7, "#1f1f23", "#e0a53a"], [17, "#a9743c", C.forest]]
    .map(([a, hc, tc], q) => {
      const bx = 60 + q * 26;
      return `<g transform="rotate(${a} ${bx} 262)"><rect x="${bx - 7}" y="-30" width="14" height="222" rx="6" fill="${hc}"/><rect x="${bx - 6}" y="-30" width="4" height="222" fill="#fff" opacity=".2"/><rect x="${bx - 9}" y="190" width="18" height="36" fill="#c9ccd2"/><rect x="${bx - 9}" y="190" width="18" height="9" fill="#fff" opacity=".6"/><path d="M${bx - 9} 226 L ${bx - 11} 258 Q ${bx} 270 ${bx + 11} 258 L ${bx + 9} 226 Z" fill="${tc}"/></g>`;
    }).join("");
  const body = kind === "brushes"
    ? `${bru}
       <path d="M24 104 Q 24 98 36 98 L 164 98 Q 176 98 176 104 L 180 270 Q 180 292 158 292 L 42 292 Q 20 292 20 270 Z" fill="#cfe6ec" fill-opacity=".34"/>
       <path d="M22 150 L 178 150 L 180 270 Q 180 292 158 292 L 42 292 Q 20 292 20 270 Z" fill="#a8d2dc" fill-opacity=".32"/>`
    : `<path d="M24 104 Q 24 98 36 98 L 164 98 Q 176 98 176 104 L 180 270 Q 180 292 158 292 L 42 292 Q 20 292 20 270 Z" fill="#cfe6ec" fill-opacity=".4"/>
       <path d="M24 118 L 176 118 L 180 270 Q 180 292 158 292 L 42 292 Q 20 292 20 270 Z" fill="${paint}"/>
       <path d="M24 118 L 176 118 L 176 132 L 24 132 Z" fill="#fff" opacity=".16"/>
       <rect x="14" y="62" width="172" height="42" rx="7" fill="#c9ccd2"/><rect x="14" y="62" width="172" height="13" rx="6" fill="#fff" opacity=".55"/>${Array.from({ length: 14 }, (_, q) => `<rect x="${22 + q * 11.4}" y="70" width="3" height="30" fill="#8b9098" opacity=".6"/>`).join("")}`;
  const glass = `<path d="M34 108 L 40 282" stroke="#fff" stroke-opacity=".6" stroke-width="7" stroke-linecap="round"/><path d="M168 112 L 171 270" stroke="#fff" stroke-opacity=".3" stroke-width="4" stroke-linecap="round"/><path d="M24 104 Q 24 98 36 98 L 164 98 Q 176 98 176 104 L 180 270 Q 180 292 158 292 L 42 292 Q 20 292 20 270 Z" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>${kind === "brushes" ? `<ellipse cx="100" cy="98" rx="76" ry="9" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>` : ""}`;
  const tapeLabel = `<div ${label ? `data-check="${check}"` : ""} style="${abs(24 * k, 168 * k, 152 * k, 58 * k, "background:#efe7cf;box-shadow:0 2px 3px rgba(40,20,5,.35);display:grid;place-items:center;transform:rotate(-2deg);clip-path:polygon(0 6%,3% 0,100% 0,98% 50%,100% 100%,3% 100%,0 92%,2% 50%)")}"><span style="font:600 29px/1 'Hand',cursive;color:#2c2512;white-space:nowrap">${esc(label ?? "")}</span></div>`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 16px 12px rgba(30,15,5,.42))`)}"><svg style="${abs(0, 0, w, h)}" viewBox="0 -30 200 ${h / k + 30}" overflow="visible" aria-hidden="true">${body}${glass}</svg>${tapeLabel}</div>`;
}

/** Washi tape, centred on (x, y). */
function tape(x, y, w = 150, rot = -4, c1 = "#e9a9b4", c2 = "#ffffff", kind = "stripe") {
  const fill = kind === "stripe" ? `repeating-linear-gradient(90deg,${c1} 0 14px,${c2}88 14px 24px)` : c1;
  return `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:${fill};opacity:.9;box-shadow:0 2px 4px rgba(40,20,5,.25);z-index:9;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

const tick = (size = 34, color = C.forest) => `<svg viewBox="0 0 44 44" width="${size}" height="${size}" aria-hidden="true"><path d="M8 24 L18 35 L38 7" fill="none" stroke="${color}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ------------------------------------------------------------------ #33 */

function pin33() {
  const i = idea(33);
  const areas = ["Accounts", "Income", "Bills", "Subscriptions", "Transactions", "Debt", "Savings"];
  const chipCols = [C.forest, "#d9962b", "#c4573e", "#4b7a9b"];
  const heights = [286, 142, 142, 184];
  const GAP = 22, W = 500;
  let y = 396;
  const cards = i.items
    .map((t, k) => {
      const h = heights[k], cy = y;
      y += h + GAP;
      const x = 34 + [0, 12, -2, 8][k];
      const tint = ["#e6f0ea", "#f8ecd0", "#f4ddd5", "#dde9f0"][k];
      const chips = k === 0
        ? `<div style="display:flex;flex-wrap:wrap;gap:9px;margin-top:16px">${areas.map((a, q) => `<span style="font:600 22px/1 'Plex',sans-serif;color:#1d1d20;background:${["#d6e8de", "#f3e1b3", "#efc9bd", "#cfe0eb"][q % 4]};padding:8px 13px;border-radius:4px 14px 14px 4px;box-shadow:0 1px 2px rgba(40,20,5,.25)">${esc(a)}</span>`).join("")}</div>`
        : "";
      return `<div style="${abs(x, cy, W, h, `transform:rotate(${[-0.5, 0.4, -0.3, 0.5][k]}deg);z-index:${5 + k}`)}">
        <div style="${abs(0, 0, W, h, "background:#fffdf6;border-radius:8px 12px 12px 8px;box-shadow:0 2px 3px rgba(60,40,10,.3),0 16px 24px rgba(60,40,10,.3)")}"></div>
        <div style="${abs(0, 0, 88, h, `background:linear-gradient(160deg,${chipCols[k]},${chipCols[k]}cc);border-radius:8px 0 0 8px;display:grid;place-items:center;font:500 64px 'Newsreader',serif;color:#fff;box-shadow:inset -6px 0 8px rgba(0,0,0,.14)`)}">${k + 1}</div>
        <div data-check="step${k + 1}" style="${abs(108, 0, W - 108 - 18, h, `display:flex;flex-direction:column;justify-content:center;font:500 29px/1.26 'Plex',sans-serif;color:#1d1d20`)}"><div>${esc(t)}</div>${chips}</div></div>`;
    })
    .join("");
  const cloth = `
    <div style="${abs(0, 372, 1000, 982, "background:#ece4d1")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(0deg,rgba(120,100,60,.07) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(120,100,60,.07) 0 2px,transparent 2px 5px)")}"></div>
    <div style="${abs(0, 372, 1000, 982, "background:linear-gradient(104deg,rgba(255,255,255,.28) 0 12%,rgba(90,70,30,.1) 24%,rgba(255,255,255,.2) 38%,rgba(90,70,30,.12) 56%,rgba(255,255,255,.18) 72%,rgba(90,70,30,.1) 88%,rgba(255,255,255,.2))")}"></div>
    ${splatter({ colors: [C.forest, "#d9962b", "#c4573e", "#4b7a9b", "#2c2a27"], n: 46, seed: 7, maxR: 10, opacity: 0.85 })}
    ${grain(0.25, 0.65, 9)}${light(0.25, 0.2, "70,50,20")}`;
  const ph = phone({ src: screen("records"), y0: 60, y1: 745, width: 430, tilt: -2, x: 546, y: 424, closed: true });
  const scene = `${cloth}${cards}${ph}
    ${brush({ x: 44, y: 1262, len: 520, rot: -2.2, handle: "#2f6b57", tip: "#c4573e" })}
    ${tube({ x: 600, y: 1272, len: 280, rot: 4, color: C.forest })}`;
  return printable({ n: 33, scene: wrap(scene), paper: "#f1ead9", sub: true, extraCss: ".top h1{font-size:72px}" });
}

/* ------------------------------------------------------------------ #35 */

function pin35() {
  const scene = `
    ${planks({ base: "#a9bfb5", alt: "#9ab3a8", seam: "#2f4a3f44", n: 6, seed: 12 })}
    ${splatter({ colors: ["#f6f1e4", C.forest, "#d9962b", "#c4573e", "#2f4a3f"], n: 34, seed: 21, maxR: 9, opacity: 0.8 })}
    ${grain(0.22, 0.8, 5)}${light(0.3, 0.26, "20,45,38")}
    ${sheet({ src: bookPage(80), x: 70, y: 418, w: 860, tilt: -1.8, crop: { x0: 0.04, y0: 0.2, x1: 0.86, y1: 0.62 }, id: "q35" })}
    ${tape(150, 424, 130, -24, "#e9a9b4")}${tape(860, 440, 130, 22, "#d9962b", "#fff")}
    ${palette({ x: 590, y: 1090, w: 370, rot: 10 })}
    ${mug({ x: 74, y: 1110, size: 200 })}
    ${brush({ x: 330, y: 1240, len: 500, rot: -4, handle: "#a9743c", tip: C.forest })}`;
  return printable({ n: 35, scene: wrap(scene), paper: "#e8efe9", sub: true });
}

/* ------------------------------------------------------------------ #37 */

/** A sketchbook seen from above with a wire spiral down its left edge. */
function sketchbook({ x, y, w = 300, h = 400, rot = 0, cover = "#2f6b57", z = 2 }) {
  const coils = Array.from({ length: 12 }, (_, k) => `<div style="${abs(-12, 24 + k * ((h - 60) / 11), 46, 14, "z-index:3")}"><div style="${abs(0, 0, 44, 12, "border-radius:7px;background:linear-gradient(#f2f3f6,#8e949c 55%,#d7dade);box-shadow:0 2px 3px rgba(0,0,0,.4)")}"></div></div>`).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">
    <div style="${abs(0, 0, w, h, `background:linear-gradient(160deg,${cover},#1f4a3c);border-radius:6px 14px 14px 6px;box-shadow:0 3px 4px rgba(40,20,5,.35),0 22px 36px rgba(40,20,5,.45)`)}"></div>
    <div style="${abs(0, 0, w, h, "border-radius:6px 14px 14px 6px;background:linear-gradient(120deg,rgba(255,255,255,.2),rgba(255,255,255,0) 40%)")}"></div>
    <div style="${abs(w - 14, 8, 8, h - 16, "background:repeating-linear-gradient(#f4efe0 0 3px,#d8cfb4 3px 4px);border-radius:2px")}"></div>
    ${coils}</div>`;
}

/** A manila folder with its tab, seen from above. */
function folder({ x, y, w = 330, h = 430, rot = 0, z = 2 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">
    <div style="${abs(0, 34, w, h - 34, "background:linear-gradient(160deg,#e6c98c,#d4b274);border-radius:6px 12px 12px 12px;box-shadow:0 3px 4px rgba(40,20,5,.35),0 22px 34px rgba(40,20,5,.42)")}"></div>
    <div style="${abs(w - 150, 0, 126, 46, "background:linear-gradient(#ead09a,#dcbb7e);border-radius:10px 10px 0 0;box-shadow:0 -2px 3px rgba(40,20,5,.15)")}"></div>
    <div style="${abs(0, 34, w, 14, "background:linear-gradient(rgba(255,255,255,.4),rgba(255,255,255,0))")}"></div></div>`;
}

function pin37() {
  const i = idea(37);
  const ticked = new Set([0, 2, 3, 5, 6]);
  const sw = ["#2f6b57", "#d9962b", "#c4573e", "#4b7a9b"];
  const GX = 62, GW = 270, GG = 16, GH = 128, GY = 912;
  const cards = i.items
    .map((t, k) => {
      const cx = GX + (k % 3) * (GW + GG), cy = GY + Math.floor(k / 3) * (GH + 14);
      const tilt = [-0.7, 0.5, -0.4, 0.4, -0.5, 0.6, -0.3, 0.5, -0.6][k];
      return `<div style="${abs(cx, cy, GW, GH, `transform:rotate(${tilt}deg);z-index:8`)}">
        <div style="${abs(0, 0, GW, GH, "background:#fffdf6;border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 12px 18px rgba(40,20,5,.33)")}"></div>
        <div style="${abs(0, 0, 12, GH, `background:${sw[k % 4]};border-radius:6px 0 0 6px`)}"></div>
        <div style="${abs(28, 18, 42, 42, `border:4px solid ${C.forest};border-radius:8px;background:#fff;display:grid;place-items:center`)}">${ticked.has(k) ? tick(30) : ""}</div>
        <div data-check="source${k + 1}" style="${abs(82, 8, GW - 94, GH - 16, "display:flex;align-items:center;font:600 24px/1.18 'Plex',sans-serif;color:#1d1d20")}">${esc(t)}</div></div>`;
    })
    .join("");
  const statement = `<div style="${abs(660, 360, 250, 300, "background:#fffdf8;transform:rotate(9deg);box-shadow:0 2px 3px rgba(60,40,10,.3),0 18px 26px rgba(60,40,10,.35);z-index:0")}">
    <div style="${abs(0, 0, 250, 46, `background:${C.forestSoft}`)}"></div><div style="${abs(20, 14, 96, 12, `background:${C.forest}`)}"></div>
    ${[70, 98, 126, 154, 182, 210, 238].map((yy, k) => `<div style="${abs(20, yy, 210 - (k % 3) * 50, 8, "background:#d9d4c4")}"></div>`).join("")}</div>`;
  const scene = `
    ${planks({ base: "#d9a843", alt: "#cd9a34", seam: "#5b3d0f55", vertical: true, n: 7, seed: 31 })}
    ${splatter({ colors: ["#f6f1e4", C.forest, "#c4573e", "#2f4a6a", "#2c2a27"], n: 40, seed: 17, maxR: 11, opacity: 0.85 })}
    ${grain(0.25, 0.7, 8)}${light(0.3, 0.3, "70,40,0")}
    ${sketchbook({ x: -150, y: 470, w: 260, h: 380, rot: -9, z: 0 })}
    ${folder({ x: 890, y: 450, w: 320, h: 420, rot: 7, z: 0 })}
    ${statement}
    ${sheet({ src: bookPage(8), x: 120, y: 412, w: 760, tilt: -2.4, crop: { x0: 0, y0: 0.03, x1: 1, y1: 0.58 }, id: "p37" })}
    ${tape(168, 420, 120, -30, "#e9a9b4")}${tape(836, 450, 120, 32, "#f6f1e4", "#fff", "plain")}
    ${cards}
    ${tube({ x: 560, y: 830, len: 300, rot: -5, color: "#c4573e", z: 9 })}`;
  return printable({ n: 37, scene: wrap(scene), paper: "#f4ead2", sub: false });
}

/* ------------------------------------------------------------------ #40 */

function pin40() {
  const i = idea(40);
  const [q, rest] = i.headline.split("? ");
  const css = `
  .panel{position:absolute;left:0;right:0;top:0;height:560px;background:radial-gradient(ellipse at 20% 0%,#2a6a56,${C.forestDeep} 70%);box-shadow:0 10px 26px rgba(10,30,22,.45)}
  .panel:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,transparent 2px 5px)}
  .q{position:absolute;left:64px;right:64px;top:62px;z-index:6;color:#fff}
  .q .eyebrow{color:#b8efd2}
  .q h1{font:500 84px/1.02 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:16px}
  .q h2{font:500 40px/1.15 "Newsreader",Georgia,serif;margin-top:20px;color:#f2d98a}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#efe9dc;box-shadow:0 -8px 22px rgba(40,20,5,.28);z-index:5}
  .foot{z-index:7}`;
  const floor = `${planks({ y: 520, h: 900, base: "#e6dfcf", alt: "#ded6c3", seam: "#6b5a3a33", n: 6, seed: 41 })}
    ${splatter({ y: 520, h: 900, colors: [C.forest, "#d9962b", "#c4573e", "#4b7a9b", "#2c2a27"], n: 34, seed: 29, maxR: 9, opacity: 0.8 })}
    ${grain(0.2, 0.8, 6, 520, 900)}${light(0.25, 0.2, "70,50,20", 520, 900)}`;
  const scene = `${floor}
    <div class="panel"></div>
    ${sheet({ src: bookPage(14), x: 50, y: 560, w: 900, tilt: -2.2, crop: { x0: 0, y0: 0.1, x1: 1, y1: 0.52 }, id: "p40" })}
    ${tape(120, 572, 130, -32, "#d9962b", "#fff")}${tape(880, 584, 130, 30, "#e9a9b4")}
    ${jar({ x: 70, y: 1030, w: 210, kind: "brushes", label: "Available", rot: -3, check: "tape1" })}
    ${jar({ x: 330, y: 1062, w: 190, kind: "lidded", label: "Protected", rot: 2, paint: C.forest, check: "tape2" })}
    ${palette({ x: 590, y: 1070, w: 370, rot: -8 })}`;
  const body = `${wrap(scene)}
    <div class="q" data-check="headline" data-bottom-max="545"><h1>${esc(q)}?</h1><h2>${esc(rest)}</h2></div>
    <div class="footbar"></div>${footFor(i)}`;
  return { n: 40, id: "40-what-should-not-count-as-available-money", html: page(p, { body, css, paper: "#efe9dc" }) };
}

export const pins = [pin33(), pin35(), pin37(), pin40()];
