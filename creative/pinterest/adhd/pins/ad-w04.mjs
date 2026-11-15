/**
 * ADHD Life Companion guide pins, world w04: folders and filing.
 * Manila folders with tabs, a filing box, paper clips, a stamp pad, dividers, a cabinet drawer edge.
 * Palette: manila, olive, steel (with the product's mulberry as the one-thing colour).
 *
 * #43 template-preview  a filled-in worksheet card on an open manila folder, kraft envelope half under it, steel-blue desk
 * #47 myth-vs-truth     an olive metal cabinet: a crumpled struck-through note beside one clean circled card, a ringing phone between
 * #49 infographic       three olive dividers with columns of sticky notes (two ringed in mulberry, one pale and tucked aside)
 * #51 checklist         a top-bound spiral pad on a manila folder, six steps, only the fifth ticked, a glass of water
 * #55 comparison        a tangle of crossed-out numbered notes beside the same notes fanned under one question
 * #95 checklist         a left-bound spiral pad with three tick boxes, a window envelope, a pen, a cardboard filing box
 *
 * No app screens: the guide pins draw their own scenes. Every word is the record's own.
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

const MANILA = { front: "#ecd39a", back: "#d8b673", edge: "#b8934a" };
const OLIVE = { front: "#8a9565", back: "#76824f", dark: "#5c673a" };

/** Cream header block with the headline (and optional sub) and a matching footer band. */
function frame(i, { paper, size, sub = null, split = false, textTop = 56, extraCss = "" }) {
  const [eyebrow, rest] = split && i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(30,25,15,.3);z-index:20}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(30,25,15,.3);z-index:20}
  .foot{z-index:22}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:21}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:${eyebrow ? 16 : 0}px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4b4339;max-width:840px}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(rest)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/** Paper fibre: a faint warm noise laid over a surface. */
const grain = (x, y, w, h, a = 0.14, seed = 3) =>
  `<svg style="${abs(x, y, w, h, "pointer-events:none")}" width="${w}" height="${h}" aria-hidden="true"><filter id="gr${seed}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 .25 0 0 0 0 .17 0 0 0 0 .08 ${a * 2} 0 0 0 0"/></filter><rect width="100%" height="100%" filter="url(#gr${seed})"/></svg>`;

/** A manila (or any colour) folder seen from the front, with a tab; `inner` is placed in its own coordinates. */
function folder({ x, y, w, h, rot = 0, tab = [0.06, 0.3], tabH = 54, front = MANILA.front, back = MANILA.back, edge = MANILA.edge, withFront = true, inner = "", z = 1 }) {
  const tx = tab[0] * w, tw = tab[1] * w, B = tabH;
  const d = `M0 ${B + 12} Q0 ${B} 12 ${B} H${tx - 8} Q${tx + 4} ${B} ${tx + 10} ${B - 8} L${tx + 22} 14 Q${tx + 26} 4 ${tx + 40} 4 H${tx + tw - 40} Q${tx + tw - 26} 4 ${tx + tw - 22} 14 L${tx + tw - 10} ${B - 8} Q${tx + tw - 4} ${B} ${tx + tw + 8} ${B} H${w - 12} Q${w} ${B} ${w} ${B + 12} V${h - 10} Q${w} ${h} ${w - 12} ${h} H12 Q0 ${h} 0 ${h - 10} Z`;
  const fy = B + 44;
  return `<div style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 4px 3px rgba(20,25,30,.35)) drop-shadow(0 26px 28px rgba(20,25,30,.42))`)}">
    <svg style="position:absolute;inset:0;overflow:visible" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <path d="${d}" fill="${back}" stroke="${edge}" stroke-opacity=".5" stroke-width="2"/>
      <path d="M${tx + 24} 18 H${tx + tw - 24}" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/>
      ${withFront ? `<path d="M0 ${fy + 12} Q0 ${fy} 12 ${fy} H${w - 12} Q${w} ${fy} ${w} ${fy + 12} V${h - 10} Q${w} ${h} ${w - 12} ${h} H12 Q0 ${h} 0 ${h - 10} Z" fill="${front}" stroke="${edge}" stroke-opacity=".45" stroke-width="2"/><path d="M10 ${fy + 3} H${w - 10}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>` : ""}
    </svg>${inner}</div>`;
}

/** A steel paper clip. */
const clip = ({ x, y, rot = 0, s = 1, color = "#c3ccd3", z = 8 }) =>
  `<svg style="${abs(x, y, 44 * s, 120 * s, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(3px 6px 3px rgba(20,25,30,.42))`)}" viewBox="0 0 44 120" aria-hidden="true">
    <path d="M14 86 L14 24 A11 11 0 0 1 36 24 L36 92 A14 14 0 0 1 8 92 L8 40 A8 8 0 0 1 24 40 L24 80" fill="none" stroke="#69747d" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 86 L14 24 A11 11 0 0 1 36 24 L36 92 A14 14 0 0 1 8 92 L8 40 A8 8 0 0 1 24 40 L24 80" fill="none" stroke="${color}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Wavy pen scribbles for a note: lines of loops, never words. */
function scribbles(w, h, r, rows0 = 3) {
  const rows = rows0 + Math.floor(r() * 3);
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (0.28 + (k / rows) * 0.62) + r() * 6;
    const len = w * (0.3 + r() * 0.5);
    let x = w * 0.12;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} `;
    while (x < w * 0.12 + len) {
      const dx = 7 + r() * 8;
      const up = r() > 0.5 ? -1 : 1;
      d += `q${(dx / 2).toFixed(1)} ${(up * (4 + r() * 6)).toFixed(1)} ${dx.toFixed(1)} ${((r() - 0.5) * 3).toFixed(1)} `;
      x += dx;
    }
  }
  return `<path d="${d}" fill="none" stroke="#4d3a45" stroke-opacity=".5" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A butter sticky note with scribbles and a soft lift; `numeral` puts a crossed-out number in the corner. */
function sticky({ x, y, s = 160, rot = 0, tint = 0, r, numeral = null, z = 1, soft = false, rows = 3 }) {
  const tints = [["#f6e08f", "#efcc66"], ["#f8e8a6", "#f0d37a"], ["#f2d37c", "#e7bd55"], ["#f4dca0", "#ebc872"]];
  const [a, b] = tints[tint % tints.length];
  const num = numeral == null ? "" : `<div style="position:absolute;left:12px;top:4px;font:700 38px/1 'Plex',sans-serif;color:${C.mulberryDeep};text-decoration:line-through;text-decoration-thickness:5px">${numeral}</div>`;
  return `<div style="${abs(x, y, s, s, `z-index:${z};transform:rotate(${rot}deg);background:linear-gradient(172deg,${a},${b});box-shadow:0 1px 2px rgba(0,0,0,.35),${soft ? "0 5px 8px rgba(0,0,0,.2)" : "0 10px 14px rgba(0,0,0,.34)"}`)}"><div style="position:absolute;left:0;right:0;top:0;height:14%;background:rgba(255,255,255,.2)"></div><svg style="position:absolute;inset:0" viewBox="0 0 ${s} ${s}" aria-hidden="true">${scribbles(s, s, r, rows)}</svg>${num}</div>`;
}

/** A hand-drawn loop around something, with a little overshoot where the pen came round. */
function ring({ x, y, w, h, color = C.mulberry, sw = 8, seed = 1, R = 36, z = 9 }) {
  const r = rng(seed);
  const j = (m = 5) => ((r() - 0.5) * m).toFixed(1);
  const p0 = 14, x0 = p0, y0 = p0, x1 = w - p0, y1 = h - p0;
  const d = `M${x0 + R + 30} ${y0 + Number(j())} C ${(x0 + x1) / 2} ${y0 - 7}, ${(x0 + x1) / 2 + 80} ${y0 + 5}, ${x1 - R} ${y0 + Number(j())} Q${x1 + Number(j())} ${y0 + Number(j())} ${x1 + Number(j())} ${y0 + R} L${x1 + Number(j())} ${y1 - R} Q${x1 + Number(j())} ${y1 + Number(j())} ${x1 - R} ${y1 + Number(j())} L${x0 + R} ${y1 + Number(j())} Q${x0 + Number(j())} ${y1 + Number(j())} ${x0 + Number(j())} ${y1 - R} L${x0 + Number(j())} ${y0 + R + 24} Q${x0 + Number(j())} ${y0 - 2} ${x0 + R + 56} ${y0 - 4}`;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};overflow:visible;filter:drop-shadow(0 2px 2px rgba(40,20,30,.2))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function tickMark(color = C.mulberry, size = 54) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 58 58" aria-hidden="true" style="display:block"><path d="M9 30 L22 43 C 28 28, 38 14, 54 3" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function glass({ x, y, s = 200, z = 8 }) {
  return `<svg style="${abs(x, y, s * 0.86, s, `z-index:${z};filter:drop-shadow(16px 20px 12px rgba(20,40,60,.4))`)}" viewBox="0 0 172 200" aria-hidden="true">
    <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#e3f1f8" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>
    <linearGradient id="wt" x1="0" x2="1"><stop offset="0" stop-color="#cfe6f2"/><stop offset=".5" stop-color="#e6f3f9"/><stop offset="1" stop-color="#a9cde1"/></linearGradient></defs>
    <path d="M10 28 L162 28 L148 178 Q147 192 132 192 L40 192 Q25 192 24 178 Z" fill="url(#gl)" stroke="#fff" stroke-width="3"/>
    <path d="M16 70 L156 70 L146 176 Q145 186 132 186 L40 186 Q27 186 26 176 Z" fill="url(#wt)" fill-opacity=".9"/>
    <ellipse cx="86" cy="70" rx="70" ry="10" fill="#f4fafd" stroke="#8fb7cc" stroke-width="2"/>
    <ellipse cx="86" cy="28" rx="76" ry="13" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/><ellipse cx="86" cy="28" rx="70" ry="9" fill="#dcecf4" fill-opacity=".7"/>
    <path d="M30 48 L40 168" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/><path d="M134 90 L130 160" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="86" cy="186" rx="44" ry="5" fill="#7ea9c1" fill-opacity=".45"/>
    <circle cx="70" cy="120" r="3.5" fill="#fff" fill-opacity=".8"/><circle cx="102" cy="140" r="3" fill="#fff" fill-opacity=".7"/><circle cx="92" cy="100" r="2.5" fill="#fff" fill-opacity=".8"/>
  </svg>`;
}

function pen({ x, y, len = 380, rot = 0, body = "#3f4a3a", z = 8 }) {
  return `<svg style="${abs(x, y, len, 34, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,30,45,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="#c9ccd2"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="#c9ccd2"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#22252b"/></svg>`;
}

/** A spiral pad: back board, paper block, wire rings along the top or the left edge. */
function spiralPad({ x, y, w, h, rot = 0, side = "top", inner = "", z = 4, back = "#7b8f9f", shade = "20,40,60" }) {
  let rings = "";
  if (side === "top") {
    const N = Math.floor((w - 30) / 47);
    rings = `<svg style="position:absolute;left:0;top:-6px;width:${w}px;height:64px;overflow:visible" viewBox="0 0 ${w} 64" aria-hidden="true"><rect x="8" y="14" width="${w - 16}" height="36" rx="8" fill="#8d9fae" opacity=".35"/>${Array.from({ length: N }, (_, k) => {
      const rx = 30 + k * 47;
      return `<g><ellipse cx="${rx}" cy="26" rx="9" ry="7" fill="#7f95a6"/><path d="M${rx - 5} 30 C ${rx - 6} -10, ${rx + 18} -14, ${rx + 18} 30" fill="none" stroke="#dfe5ea" stroke-width="6" stroke-linecap="round"/><path d="M${rx - 5} 30 C ${rx - 6} -10, ${rx + 18} -14, ${rx + 18} 30" fill="none" stroke="#8d9aa6" stroke-width="2" stroke-linecap="round" transform="translate(1 2)"/></g>`;
    }).join("")}</svg>`;
  } else {
    const N = Math.floor((h - 40) / 50);
    rings = `<svg style="position:absolute;left:-16px;top:0;width:70px;height:${h}px;overflow:visible" viewBox="0 0 70 ${h}" aria-hidden="true"><rect x="14" y="8" width="36" height="${h - 16}" rx="8" fill="#8d9fae" opacity=".3"/>${Array.from({ length: N }, (_, k) => {
      const cy = 44 + k * 50;
      return `<g><circle cx="38" cy="${cy}" r="7" fill="#4a5258"/><path d="M12 ${cy + 8} C -8 ${cy + 2}, -4 ${cy - 16}, 18 ${cy - 14} L46 ${cy - 4}" fill="none" stroke="#dfe5ea" stroke-width="6" stroke-linecap="round"/><path d="M12 ${cy + 8} C -8 ${cy + 2}, -4 ${cy - 16}, 18 ${cy - 14} L46 ${cy - 4}" fill="none" stroke="#8d9aa6" stroke-width="2" stroke-linecap="round" transform="translate(1 2)"/></g>`;
    }).join("")}</svg>`;
  }
  return `<div style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg)`)}">
    <div style="position:absolute;left:10px;top:14px;right:-10px;bottom:-14px;background:${back};border-radius:14px;box-shadow:0 30px 44px rgba(${shade},.45)"></div>
    <div style="position:absolute;inset:0;background:#fffdf8;border-radius:12px;box-shadow:0 2px 3px rgba(${shade},.3)"></div>
    ${rings}${inner}</div>`;
}

/* ---------------------------------------------------------------- #43 */
function p43() {
  const n = 43;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e8edf0", size: 62, sub: i.sub, textTop: 50 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(120% 90% at 30% 15%,#9fb0bd,#7d8e9c 55%,#65747f)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 1px,transparent 1px 5px)")}"></div>`;

  const mf = folder({ x: 24, y: 402, w: 952, h: 940, rot: -1.2, tab: [0.62, 0.28], z: 2 });

  const envelope = `<div style="${abs(500, 1130, 450, 270, "z-index:3;transform:rotate(5deg);filter:drop-shadow(0 20px 20px rgba(20,25,30,.42))")}">
    <svg style="position:absolute;inset:0" width="450" height="270" viewBox="0 0 450 270" aria-hidden="true"><rect width="450" height="270" rx="6" fill="#c9a26a"/><path d="M0 270 L225 120 L450 270" fill="none" stroke="#a78049" stroke-width="3"/><path d="M0 0 L190 150 L0 270" fill="#bf9760" fill-opacity=".6"/><path d="M450 0 L260 150 L450 270" fill="#bf9760" fill-opacity=".6"/></svg></div>`;
  const stampPad = `<div style="${abs(34, 1262, 250, 104, "z-index:3;transform:rotate(-3deg);background:linear-gradient(#4b5538,#3d462d);border-radius:14px;box-shadow:0 4px 3px rgba(0,0,0,.35),0 18px 20px rgba(0,0,0,.4)")}"><div style="position:absolute;left:14px;top:14px;right:14px;bottom:20px;border-radius:8px;background:linear-gradient(#7a3f58,#5f2d44);box-shadow:inset 0 3px 6px rgba(0,0,0,.4)"></div></div>`;

  const steps = i.items.map((t) => {
    const k = t.indexOf(": ");
    return [t.slice(0, k), t.slice(k + 2)];
  });
  const row = ([a, b]) => `<div style="display:grid;grid-template-columns:62px 238px 1fr;column-gap:12px;align-items:start;padding:14px 0 14px;border-bottom:2px solid #e3d7c4">
      <div style="padding-top:4px">${tickMark(C.mulberry, 50)}</div>
      <div style="font:700 41px/1.02 'Hand',cursive;color:${C.mulberryDeep};padding-top:6px">${esc(a)}</div>
      <div style="font:600 39px/42px 'Hand',cursive;color:#231a1f">${esc(b)}</div></div>`;
  const card = `<div style="${abs(76, 446, 852, 818, "z-index:6;transform:rotate(.8deg);background:#fffaf2;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 24px 32px rgba(15,20,25,.5)")}" data-check="card">
    <div style="position:absolute;left:32px;right:32px;top:18px;display:flex;align-items:center;justify-content:space-between">
      <div style="transform:rotate(-3deg);border:5px solid ${C.mulberry};border-radius:12px;padding:3px 16px;font:700 27px/1.2 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.mulberry};opacity:.9">An illustration</div>
      <div class="example" style="font-size:24px;padding:5px 12px">Example</div>
    </div>
    <div style="position:absolute;left:32px;right:32px;top:84px">
      <div style="display:grid;grid-template-columns:62px 238px 1fr;column-gap:12px;padding-bottom:8px;border-bottom:3px solid ${C.mulberry};font:600 24px 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#5f3d4b"><div></div><div>Step</div><div>What's on the page</div></div>
      ${steps.map(row).join("")}
    </div></div>`;

  const body = `${ground}${grain(0, SCENE_TOP, 1000, 982, 0.1, 5)}${mf}${envelope}${stampPad}${card}${clip({ x: 468, y: 414, rot: -4, s: 1.1, z: 9 })}${fh}`;
  return { n, id: `${n}-letter-put-off-filled-in-example`, html: page(p, { body, css: fc, paper: "#e8edf0" }) };
}

/* ---------------------------------------------------------------- #47 */
function crumple({ x, y, w, h, rot, seed }) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2;
  const pts = [];
  const N = 22;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const rr = 0.9 + (r() - 0.5) * 0.2;
    pts.push([cx + Math.cos(a) * (w / 2) * rr, cy + Math.sin(a) * (h / 2) * rr]);
  }
  const poly = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const hubs = Array.from({ length: 11 }, () => [cx + (r() - 0.5) * w * 0.7, cy + (r() - 0.5) * h * 0.7]);
  let facets = "";
  for (let k = 0; k < N; k++) {
    const a = pts[k], b = pts[(k + 1) % N];
    const hub = hubs[k % hubs.length];
    const lit = r() > 0.5;
    facets += `<polygon points="${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} ${hub[0].toFixed(1)},${hub[1].toFixed(1)}" fill="${lit ? "#fff7d0" : "#a97a1c"}" fill-opacity="${(lit ? 0.07 + r() * 0.1 : 0.04 + r() * 0.08).toFixed(2)}"/>`;
  }
  let creases = "";
  for (let k = 0; k < 16; k++) {
    const a = pts[Math.floor(r() * N)], hub = hubs[Math.floor(r() * hubs.length)];
    const m = [(a[0] + hub[0]) / 2 + (r() - 0.5) * 30, (a[1] + hub[1]) / 2 + (r() - 0.5) * 30];
    creases += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${hub[0].toFixed(1)} ${hub[1].toFixed(1)}" fill="none" stroke="#7a5510" stroke-opacity="${(0.1 + r() * 0.14).toFixed(2)}" stroke-width="${(0.9 + r() * 1.2).toFixed(1)}"/>`;
  }
  return `<svg style="${abs(x, y, w, h, `z-index:6;transform:rotate(${rot}deg);filter:drop-shadow(0 4px 4px rgba(20,25,10,.35)) drop-shadow(0 24px 22px rgba(20,25,10,.42))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><radialGradient id="cr${seed}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#f8e6a4"/><stop offset="1" stop-color="#ecce72"/></radialGradient></defs>
    <polygon points="${poly}" fill="url(#cr${seed})" stroke="#b58a25" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/>${facets}${creases}</svg>`;
}

function ringingPhone({ x, y, s = 190, rot = 0, z = 10 }) {
  return `<svg style="${abs(x, y, s, s, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(10,15,5,.45))`)}" viewBox="0 0 200 200" aria-hidden="true">
    <g fill="none" stroke="#fffaf2" stroke-width="7" stroke-linecap="round"><path d="M34 70 Q20 100 34 130"/><path d="M16 56 Q-6 100 16 144"/><path d="M166 70 Q180 100 166 130"/><path d="M184 56 Q206 100 184 144"/></g>
    <rect x="58" y="18" width="84" height="164" rx="20" fill="${C.mulberryDeep}"/><rect x="65" y="30" width="70" height="140" rx="13" fill="${C.mulberry}"/>
    <rect x="86" y="22" width="28" height="6" rx="3" fill="#2e1d25"/><circle cx="100" cy="100" r="24" fill="#f1e7eb"/><circle cx="100" cy="93" r="8" fill="${C.mulberryDeep}"/><path d="M85 114 Q100 98 115 114 Q100 120 85 114Z" fill="${C.mulberryDeep}"/></svg>`;
}

function p47() {
  const n = 47;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, {
    paper: "#eef0e6", size: 70, textTop: 60,
    extraCss: `.chip{position:absolute;display:flex;align-items:center;gap:12px;padding:10px 26px 10px 18px;border-radius:999px;font:600 30px "Plex",sans-serif;z-index:7;color:#231a1f;box-shadow:0 6px 10px rgba(10,15,5,.3)}`,
  });

  // Drawer open: the interior with folder tops, then the olive steel face.
  const tops = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
    const r = rng(40 + k);
    const col = k === 3 ? ["#a3ab82", "#8d9669"] : k % 2 ? ["#ecd39a", "#d8b673"] : ["#e2c37f", "#cfab62"];
    const tabX = 14 + r() * 70;
    return `<svg style="${abs(-10 + k * 134, 392 + (k % 3) * 14, 150, 190, `transform:rotate(${((r() - 0.5) * 1.6).toFixed(2)}deg);filter:drop-shadow(0 3px 4px rgba(0,0,0,.5))`)}" viewBox="0 0 150 190" aria-hidden="true"><path d="M0 28 H${tabX} L${tabX + 8} 4 H${tabX + 56} L${tabX + 64} 28 H150 V190 H0 Z" fill="${col[1]}" stroke="#7a6130" stroke-opacity=".4" stroke-width="2"/><rect x="0" y="48" width="150" height="142" fill="${col[0]}"/><path d="M0 49 H150" stroke="#fff" stroke-opacity=".4" stroke-width="2.5"/></svg>`;
  }).join("");
  const interior = `<div style="${abs(0, SCENE_TOP, 1000, 190, "background:linear-gradient(#1d2124,#2b3135)")}"></div>${tops}`;
  const face = `<div style="${abs(0, 540, 1000, 600, "z-index:3;background:linear-gradient(172deg,#7f8a62,#6c7750 50%,#606b46)")}"></div>
  <div style="${abs(0, 540, 1000, 600, "z-index:3;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0 1px,transparent 1px 4px)")}"></div>
  <div style="${abs(0, 520, 1000, 30, "z-index:3;background:linear-gradient(#a1ad7f,#7d8960);box-shadow:0 8px 14px rgba(0,0,0,.45)")}"></div>
  <div style="${abs(0, 1128, 1000, 226, "z-index:3;background:linear-gradient(172deg,#7f8a62,#6c7750 50%,#606b46)")}"></div>
  <div style="${abs(0, 1128, 1000, 16, "z-index:3;background:linear-gradient(#2c321f,#566040)")}"></div>
  <div style="${abs(0, 1140, 1000, 10, "z-index:3;background:rgba(0,0,0,.22);filter:blur(3px)")}"></div>`;
  const rivets = [[30, 568], [970, 568], [30, 1100], [970, 1100]].map(([rx, ry]) => `<div style="${abs(rx - 8, ry - 8, 16, 16, "z-index:4;border-radius:50%;background:radial-gradient(circle at 35% 30%,#d9dfe3,#7c8790);box-shadow:0 2px 2px rgba(0,0,0,.4)")}"></div>`).join("");
  const handle = `<div style="${abs(340, 1066, 320, 40, "z-index:4;border-radius:20px;background:linear-gradient(#e4e9ec,#8e99a2 55%,#c6cdd2);box-shadow:0 4px 3px rgba(0,0,0,.35),0 14px 14px rgba(0,0,0,.35)")}"></div>`;

  const labelHolder = `<div style="${abs(60, 1170, 880, 160, "z-index:4;border-radius:10px;background:linear-gradient(#cfd6db,#8f9aa3);box-shadow:0 3px 3px rgba(0,0,0,.35),0 12px 16px rgba(0,0,0,.4);padding:12px")}">
    <div style="width:100%;height:100%;background:#fbf7ee;border-radius:4px;box-shadow:inset 0 2px 5px rgba(0,0,0,.25);display:grid;align-items:center;padding:0 30px" data-check="label">
      <div style="font:600 27px/1.32 'Plex',sans-serif;color:#231a1f">${esc(i.items[2])}</div></div></div>`;

  const chipL = `<div class="chip" style="left:44px;top:578px;background:#e8dfc4">${icon("x-circle", { size: 36, color: "#231a1f", weight: "fill" })}The instinct</div>`;
  const chipR = `<div class="chip" style="left:536px;top:578px;background:#fbf7ee">${icon("check-circle", { size: 36, color: C.mulberry, weight: "fill" })}Skip the explanation</div>`;

  const noteX = 30, noteY = 664;
  const mythNote = crumple({ x: noteX, y: noteY, w: 470, h: 410, rot: -4, seed: 9 });
  const mythText = `<div style="${abs(noteX + 78, noteY + 70, 320, 280, "z-index:7;transform:rotate(-4deg);display:grid;align-items:center")}" data-check="myth">
    <div class="hand" style="font:600 51px/1.08 'Hand',cursive;color:#231a1f;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:${C.mulberryDeep}">${esc(i.items[0])}</div></div>`;

  const card = `<div style="${abs(548, 650, 412, 420, "z-index:6;background:#fffaf2;border-radius:6px;transform:rotate(1.6deg);box-shadow:0 2px 3px rgba(0,0,0,.3),0 26px 34px rgba(10,15,5,.5);background-image:repeating-linear-gradient(transparent 0 52px,#e6d9cf 52px 53px);background-position:0 30px")}" data-check="truth">
    <div style="position:absolute;left:44px;right:36px;top:58px;font:600 58px/64px 'Hand',cursive;color:#231a1f">${esc(i.items[1])}</div></div>
    ${ring({ x: 556, y: 664, w: 396, h: 392, seed: 5, R: 40, sw: 7, z: 8 })}
    <div style="${abs(690, 628, 130, 38, "z-index:8;transform:rotate(-2deg);background:rgba(214,206,170,.85);box-shadow:0 2px 4px rgba(0,0,0,.3)")}"></div>`;
  const tape = `<div style="${abs(200, 640, 130, 38, "z-index:8;transform:rotate(3deg);background:rgba(214,206,170,.85);box-shadow:0 2px 4px rgba(0,0,0,.3)")}"></div>`;

  const body = `${interior}${face}${rivets}${handle}${labelHolder}${chipL}${chipR}${mythNote}${tape}${mythText}${card}${ringingPhone({ x: 392, y: 872, s: 172, rot: 8 })}${fh}`;
  return { n, id: `${n}-late-replying-skip-the-explanation`, html: page(p, { body, css: fc, paper: "#eef0e6" }) };
}

/* ---------------------------------------------------------------- #49 */
function p49() {
  const n = 49;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ecefe0", size: 72, sub: i.sub, textTop: 60 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(120% 80% at 30% 10%,#eef1e0,#dfe5cc 60%,#d3dbb9)")}"></div>`;

  const labels = ["A person", "A date", "No one"];
  const cols = [
    { x: 40, y: 424, w: 280, h: 640, tab: [0.04, 0.62], pale: false, tint: 0, seed: 21 },
    { x: 360, y: 424, w: 280, h: 640, tab: [0.19, 0.62], pale: false, tint: 1, seed: 22 },
    { x: 706, y: 500, w: 250, h: 590, tab: [0.34, 0.62], pale: true, tint: 2, seed: 23 },
  ];
  let out = "";
  cols.forEach((c, k) => {
    const r = rng(c.seed);
    const tabH = 56;
    const inner = `<div style="${abs(c.tab[0] * c.w + 14, 10, c.tab[1] * c.w - 28, tabH - 12, "background:#f6f1e0;border-radius:6px;display:grid;place-items:center;font:600 28px 'Plex',sans-serif;color:#231a1f")}">${esc(labels[k])}</div>`;
    const f = folder({ x: c.x, y: c.y, w: c.w, h: c.h, tab: c.tab, tabH, front: OLIVE.front, back: OLIVE.back, edge: OLIVE.dark, withFront: false, inner, z: 2, rot: c.pale ? 2.5 : 0 });
    // The column of notes inside the divider.
    const count = c.pale ? 3 : 4;
    const size = c.pale ? 168 : 196;
    let notes = "";
    for (let m = 0; m < count; m++) {
      notes += sticky({ x: c.x + (c.w - size) / 2 + (r() - 0.5) * 22, y: c.y + 84 + m * (c.pale ? 140 : 116), s: size, rot: (r() - 0.5) * 9, tint: c.tint + m, r, z: 3 + m, soft: c.pale });
    }
    const group = `${f}${notes}`;
    out += c.pale ? `<div style="position:absolute;inset:0;opacity:.52;filter:saturate(.55)">${group}</div>` : group;
    if (!c.pale) out += ring({ x: c.x - 18, y: c.y - 14, w: c.w + 36, h: c.h + 28, seed: 30 + k, R: 40, sw: 9, z: 12 });
  });

  const caption = (k, x, w, color) => {
    const t = i.items[k];
    const cut = t.indexOf(" means ");
    return `<div style="${abs(x, 1118, w, 210, `font:500 27px/1.3 'Plex',sans-serif;color:${color}`)}" data-check="cap${k}"><b style="font-weight:700;display:block;font-size:30px;margin-bottom:4px">${esc(t.slice(0, cut))}</b>means ${esc(t.slice(cut + 7))}</div>`;
  };
  const caps = caption(0, 40, 290, "#231a1f") + caption(1, 360, 290, "#231a1f") + caption(2, 712, 252, "#58604a");

  const body = `${ground}${out}${clip({ x: 262, y: 428, rot: 8, s: 1, z: 14 })}${clip({ x: 366, y: 470, rot: -8, s: 1, z: 14 })}${caps}${fh}`;
  return { n, id: `${n}-everything-overdue-three-piles`, html: page(p, { body, css: fc, paper: "#ecefe0" }) };
}

/* ---------------------------------------------------------------- #51 */
function p51() {
  const n = 51;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3ecef", size: 66, sub: i.sub, textTop: 52 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(110% 80% at 20% 10%,#f6eff2,#eadde3 65%,#e0ced6)")}"></div>`;

  const bf = folder({ x: 360, y: 412, w: 640, h: 930, rot: 3.5, tab: [0.12, 0.32], z: 2 });

  const LH = 46;
  const PW = 740, PH = 812;
  const steps = i.items;
  const row = (t, k) => {
    const done = k === 4;
    return `<div style="position:relative;padding:7px 0 9px 104px;border-bottom:2px solid #c9d6e3;font:${done ? 700 : 600} ${done ? 46 : 40}px/${LH}px 'Hand',cursive;color:#231a1f;${done ? `background:linear-gradient(90deg,transparent 0,#ead6df 0);` : ""}">
      <div style="position:absolute;left:30px;top:${(LH - 40) / 2 + 8}px;width:40px;height:40px;border:4px solid #3a2f36;border-radius:7px;transform:rotate(-2deg)">${done ? `<div style="position:absolute;left:-6px;top:-20px">${tickMark(C.mulberry, 56)}</div>` : ""}</div>${esc(t)}</div>`;
  };
  const inner = `
    <div style="position:absolute;left:0;top:96px;width:${PW}px;bottom:30px;background-image:linear-gradient(90deg,transparent 80px,#ecc2cd 80px 82px,transparent 82px);overflow:hidden"></div>
    <div style="position:absolute;left:0;top:96px;width:${PW - 30}px" data-check="pad">${steps.map(row).join("")}</div>`;
  const pad = spiralPad({ x: 50, y: 452, w: PW, h: PH, rot: -1.6, side: "top", inner, z: 5 });

  // The fifth line is the one that matters: a soft mulberry wash sits behind it.
  const body = `${ground}${bf}${pad}${glass({ x: 790, y: 1090, s: 235, z: 8 })}${clip({ x: 760, y: 440, rot: 12, s: 1.1, z: 9 })}${clip({ x: 870, y: 700, rot: -8, s: 0.9, z: 9 })}${fh}`;
  return { n, id: `${n}-pick-the-first-thing-six-steps`, html: page(p, { body, css: fc, paper: "#f3ecef" }) };
}

/* ---------------------------------------------------------------- #55 */
function p55() {
  const n = 55;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, {
    paper: "#f2eadb", size: 76, split: true, textTop: 60,
    extraCss: `.chip{position:absolute;display:flex;align-items:center;gap:12px;padding:10px 26px 10px 18px;border-radius:999px;font:600 32px "Plex",sans-serif;z-index:12;color:#231a1f;box-shadow:0 6px 10px rgba(10,10,5,.3)}`,
  });

  const left = `<div style="${abs(0, SCENE_TOP, 490, 982, "background:linear-gradient(172deg,#d6b67f,#c5a066 70%,#b78f58)")}"></div>${grain(0, SCENE_TOP, 490, 982, 0.16, 7)}`;
  const right = `<div style="${abs(484, SCENE_TOP, 516, 982, "z-index:2;background:radial-gradient(100% 70% at 60% 40%,#566370,#43505c 70%,#38434d);box-shadow:-10px 0 24px rgba(20,15,5,.4)")}"></div>
  <div style="${abs(484, SCENE_TOP, 516, 982, "z-index:2;background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 5px)")}"></div>`;

  const chipL = `<div class="chip" style="left:40px;top:410px;background:#f6efdc">${icon("x-circle", { size: 36, color: "#231a1f", weight: "fill" })}Ranking</div>`;
  const chipR = `<div class="chip" style="left:524px;top:410px;background:#fbf7ee">${icon("check-circle", { size: 36, color: C.mulberry, weight: "fill" })}Sorting</div>`;

  // The tangle: eleven numbered notes thrown about, each number crossed out.
  const r = rng(77);
  const order = [7, 2, 11, 4, 9, 1, 6, 10, 3, 8, 5];
  const spots = [[24, 480], [170, 470], [310, 500], [60, 600], [210, 610], [330, 640], [20, 740], [160, 760], [300, 790], [90, 880], [240, 910]];
  let tangle = "";
  order.forEach((num, k) => {
    tangle += sticky({ x: spots[k][0] + (r() - 0.5) * 14, y: spots[k][1] + (r() - 0.5) * 14, s: 150, rot: (r() - 0.5) * 70, tint: k, r, numeral: num, z: 3 + (k % 5), rows: 2 });
  });

  const capL = `<div style="${abs(34, 1100, 430, 200, "z-index:6;transform:rotate(-1.2deg);background:#fffaf2;border-radius:5px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 18px 24px rgba(40,25,5,.4);display:grid;align-items:center;padding:0 30px")}" data-check="capL">
    <div class="hand" style="font:600 42px/1.1 'Hand',cursive;color:#231a1f">${esc(i.items[0])}</div></div>`;

  // The right side: item 2 cut at its colon, the question big and mulberry, then the notes fanned beneath.
  const [lead, q] = i.items[1].split(": ");
  const qCard = `<div style="${abs(520, 470, 450, 400, "z-index:6;transform:rotate(1deg);background:#fffaf2;border-radius:5px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 20px 30px rgba(5,10,15,.5);padding:26px 30px")}" data-check="qcard">
    <div style="font:500 26px/1.3 'Plex',sans-serif;color:#4b4339">${esc(lead)}:</div>
    <div class="hand" style="font:700 74px/1.0 'Hand',cursive;color:${C.mulberry};margin-top:14px">${esc(q[0].toUpperCase() + q.slice(1))}</div></div>`;
  const arrow = `<svg style="${abs(700, 868, 90, 110, "z-index:6;filter:drop-shadow(0 4px 4px rgba(0,0,0,.3))")}" viewBox="0 0 90 110" aria-hidden="true"><g fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M44 6 C 36 40, 52 60, 44 96"/><path d="M22 74 L44 98 L68 72"/></g></svg>`;
  const Px = 742, Py = 1450, R = 420, S = 140;
  let fan = "";
  for (let k = 0; k < 11; k++) {
    const a = -22 + k * 4.4;
    const rr = rng(100 + k);
    fan += `<div style="${abs(Px - S / 2, Py - R - S / 2, S, S, `z-index:${5 + k};transform-origin:${S / 2}px ${R + S / 2}px;transform:rotate(${a}deg);background:linear-gradient(172deg,#f8e8a6,#f0d37a);box-shadow:0 1px 2px rgba(0,0,0,.35),0 6px 10px rgba(0,0,0,.35)`)}"><div style="position:absolute;left:0;right:0;top:0;height:14%;background:rgba(255,255,255,.2)"></div><svg style="position:absolute;inset:0" viewBox="0 0 ${S} ${S}" aria-hidden="true">${scribbles(S, S, rr, 2)}</svg></div>`;
  }
  const fanClip = `<div style="position:absolute;left:484px;top:960px;width:516px;height:394px;overflow:hidden;z-index:5">${fan.replaceAll(`left:${Px - S / 2}px`, `left:${Px - S / 2 - 484}px`).replaceAll(`top:${Py - R - S / 2}px`, `top:${Py - R - S / 2 - 960}px`)}</div>`;

  const tray = `<div style="${abs(500, 1160, 485, 194, "z-index:18;border-radius:16px 16px 0 0;background:linear-gradient(#aeb8c0,#7f8b95 18%,#69757f);box-shadow:0 -4px 14px rgba(0,0,0,.4),inset 0 3px 0 rgba(255,255,255,.45)")}"><div style="${abs(150, 54, 185, 78, "border-radius:6px;background:linear-gradient(#d3d9de,#9aa5ad);padding:8px;box-shadow:0 2px 3px rgba(0,0,0,.3)")}"><div style="width:100%;height:100%;background:#fbf7ee;border-radius:3px;box-shadow:inset 0 2px 4px rgba(0,0,0,.25)"></div></div></div>`;
  const body = `${left}${right}${chipL}${chipR}${tangle}${capL}${qCard}${arrow}${fanClip}${clip({ x: 420, y: 1070, rot: 8, s: 1, z: 14 })}${tray}${clip({ x: 520, y: 1100, rot: -8, s: 1, z: 19 })}${fh}`;
  return { n, id: `${n}-prioritize-one-question-each-item`, html: page(p, { body, css: fc, paper: "#f2eadb" }) };
}

/* ---------------------------------------------------------------- #95 */
function archiveBox({ x, y, w, h, rot = 0, z = 2 }) {
  return `<div style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(40,25,5,.35)) drop-shadow(0 28px 26px rgba(40,25,5,.4))`)}">
    <svg style="position:absolute;inset:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#b88e52"/><rect x="0" y="0" width="${w}" height="74" rx="8" fill="#a67d44"/><rect x="0" y="66" width="${w}" height="8" fill="#8e6a37" opacity=".6"/>
      <rect x="${w / 2 - 80}" y="20" width="160" height="30" rx="15" fill="#4e3a20"/><rect x="${w / 2 - 80}" y="20" width="160" height="8" rx="4" fill="#000" opacity=".25"/>
      <rect x="${w / 2 - 80}" y="112" width="160" height="94" rx="6" fill="#aab3ba" stroke="#6e7881" stroke-width="3"/><rect x="${w / 2 - 68}" y="124" width="136" height="70" rx="3" fill="#f7f1e2"/>
      <path d="M0 74 V${h}" stroke="#fff" stroke-opacity=".08" stroke-width="2"/></svg></div>`;
}

function windowEnvelope({ x, y, w = 580, h = 340, rot = 0, z = 3 }) {
  const bars = (bx, by, widths) => widths.map((ww, k) => `<rect x="${bx}" y="${by + k * 24}" width="${ww}" height="9" rx="4.5" fill="#a8a79d"/>`).join("");
  return `<div style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 4px 3px rgba(40,25,5,.35)) drop-shadow(0 24px 22px rgba(40,25,5,.4))`)}">
    <svg style="position:absolute;left:0;top:-140px;overflow:visible" width="${w}" height="${h + 140}" viewBox="0 -140 ${w} ${h + 140}" aria-hidden="true">
      <path d="M0 0 L${w / 2} -128 L${w} 0 Z" fill="#e4d9bf" stroke="#bfb08c" stroke-width="2" stroke-linejoin="round"/>
      <path d="M26 0 L${w / 2} -100 L${w - 26} 0 Z" fill="#cfc09a" opacity=".55"/>
      <g transform="rotate(-3 ${w - 140} -30)"><rect x="${w - 300}" y="-92" width="200" height="104" fill="#fffdf6" stroke="#ddd5c3" stroke-width="2"/>${bars(w - 280, -66, [150, 120, 160])}</g>
      <rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="#f4eee0" stroke="#d6cbb2" stroke-width="2"/>
      <path d="M0 0 L${w / 2} ${h * 0.5} L${w} 0" fill="none" stroke="#d9cfb8" stroke-width="2"/>
      <rect x="${w - 276}" y="96" width="240" height="124" rx="6" fill="#e8f0f2" stroke="#c4ced2" stroke-width="3"/>${bars(w - 254, 124, [160, 130, 100])}
      <rect x="32" y="30" width="72" height="84" rx="4" fill="#d9c6a0" stroke="#b79f70" stroke-width="2" stroke-dasharray="5 4"/>
    </svg></div>`;
}

function p95() {
  const n = 95;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1ebdd", size: 64, sub: i.sub, textTop: 46 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(120% 90% at 25% 15%,#dcbc86,#cba76c 60%,#b99259)")}"></div>${grain(0, SCENE_TOP, 1000, 982, 0.18, 9)}`;

  const box = archiveBox({ x: 640, y: 400, w: 420, h: 300, rot: 6, z: 2 });

  const LH = 85;
  const rows = i.items.map((t, k) => `<div style="position:relative;height:${LH}px;margin-bottom:${LH}px;padding-left:120px;font:600 76px/${LH}px 'Hand',cursive;color:#231a1f;white-space:nowrap">
      <div style="position:absolute;left:34px;top:11px;width:62px;height:62px;border:5px solid #3a2f36;border-radius:10px;transform:rotate(-2deg)">${k === 0 ? `<div style="position:absolute;left:-8px;top:-28px">${tickMark(C.mulberry, 84)}</div>` : ""}</div>${esc(t)}</div>`).join("");
  const PW = 600, PH = 700;
  const inner = `<div style="position:absolute;left:0;top:110px;width:${PW}px;bottom:24px;background-image:linear-gradient(90deg,transparent 100px,#ecc2cd 100px 102px,transparent 102px),repeating-linear-gradient(transparent 0 ${LH - 2}px,#c9d6e3 ${LH - 2}px ${LH}px);overflow:hidden"></div>
    <div style="position:absolute;left:0;top:110px;width:${PW}px" data-check="pad">${rows}</div>`;
  const pad = spiralPad({ x: 96, y: 436, w: PW, h: PH, rot: -3.5, side: "left", inner, z: 6, back: "#6f7c82", shade: "40,25,5" });

  const env = windowEnvelope({ x: 500, y: 1000, w: 470, h: 300, rot: 4, z: 3 });

  const body = `${ground}${box}${env}${pad}${pen({ x: 500, y: 1262, len: 380, rot: -9, body: "#3f4a3a", z: 9 })}${clip({ x: 128, y: 410, rot: 0, s: 1.15, z: 10 })}${clip({ x: 915, y: 1040, rot: 14, s: 1, z: 10 })}${fh}`;
  return { n, id: `${n}-scary-letter-three-things`, html: page(p, { body, css: fc, paper: "#f1ebdd" }) };
}

export const pins = [p43(), p47(), p49(), p51(), p55(), p95()];
