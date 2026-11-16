/**
 * ADHD Life Companion guide pins, world w14: study desk.
 * A banker's lamp with a green shade, notebooks, a pencil cup, a blotter,
 * a bookshelf edge, a globe. Green, brown leather, cream.
 * #4  checklist         a clipboard hung on a bookshelf, five boxes, the first ticked (front view)
 * #12 checklist         an open leather ledger from above, four boxes, the last ringed, a phone and a ref note
 * #14 how-to-steps      five index cards stepping down out of a card-index drawer, a globe at the corner
 * #48 scenario          two Tuesdays under one banker's lamp: the same form, a phone with a game, then face down
 * #62 question          a reading stand holding one ruled page, one row and an empty box with a question mark
 * #80 template-preview  a notebook fan, a big index card with four ruled lines, a half-filled form under it
 */
import { idea, footFor, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

const G = {
  shade: "#1f5a45", shadeDeep: "#123d2e", shadeLight: "#3a8a69",
  leather: "#7b4a2a", leatherDeep: "#4f2d19", leatherLight: "#a06a3c",
  cream: "#f4ecd8", creamDeep: "#e6d9b9", brass: "#b8893a", brassLight: "#e6c274",
  wood: "#5a3720", ink: "#241b14", pen: "#2a2f3a",
};

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

function frame(i, { paper, size = 76, sub = null, textTop = 62, extraCss = "" }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(": ");
  if (at > 0) { eyebrow = i.headline.slice(0, at); head = i.headline.slice(at + 2); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(30,20,10,.35);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(30,20,10,.35);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4a4034;max-width:850px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d4034}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

/** A hand-drawn loop in mulberry. */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, grow = 0, sq = 2.6 } = {}) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2, N = 56, start = r() * 6.28;
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, a = start + t * Math.PI * 2 * 1.08;
    const wob = 1 + 0.02 * Math.sin(t * 11 + seed) + t * 0.04;
    const c = Math.cos(a), sn = Math.sin(a), e = 2 / sq;
    pts.push(`${(cx + Math.sign(c) * Math.abs(c) ** e * (w / 2 - sw) * wob).toFixed(1)},${(cy + Math.sign(sn) * Math.abs(sn) ** e * (h / 2 - sw) * wob).toFixed(1)}`);
  }
  const d = `M${pts.join(" L")}`;
  return `<svg style="position:absolute;left:${-grow}px;top:${-grow}px;overflow:visible;pointer-events:none;z-index:6" width="${w + grow * 2}" height="${h + grow * 2}" viewBox="${-grow} ${-grow} ${w + grow * 2} ${h + grow * 2}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Wavy scribbles that read as writing without being words. */
function scribbles(w, h, r, { rows = 4, color = "#4a4034", op = 0.45, x0 = 0.1, y0 = 0.2, span = 0.62, maxLen = 0.8 } = {}) {
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (y0 + (k / rows) * span) + r() * 4;
    const len = w * (0.3 + r() * (maxLen - 0.3));
    let x = w * x0;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} `;
    while (x < w * x0 + len) {
      const dx = 7 + r() * 8;
      const up = r() > 0.5 ? -1 : 1;
      d += `q${(dx / 2).toFixed(1)} ${(up * (4 + r() * 5)).toFixed(1)} ${dx.toFixed(1)} ${((r() - 0.5) * 3).toFixed(1)} `;
      x += dx;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}
const scribSvg = (w, h, seed, opts, extra = "") => `<svg style="position:absolute;left:0;top:0;${extra}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${scribbles(w, h, rng(seed), opts)}</svg>`;

/** A box to tick. */
function box(size = 64, ticked = false, color = G.ink) {
  return `<svg width="${size + 24}" height="${size + 24}" viewBox="-6 -18 ${size + 24} ${size + 24}" style="flex:none;overflow:visible" aria-hidden="true"><rect x="3" y="3" width="${size - 6}" height="${size - 6}" rx="8" fill="rgba(255,255,255,.55)" stroke="${color}" stroke-width="5"/>${ticked ? `<path d="M${size * 0.2} ${size * 0.5} L${size * 0.42} ${size * 0.74} L${size * 0.98} ${-size * 0.12}" fill="none" stroke="${C.mulberry}" stroke-width="${Math.round(size / 6.5)}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}</svg>`;
}

const exTag = (x, y, rot = 0, z = 20) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

/** A banker's lamp: green shade, brass neck and base. Lit from the shade down. */
function lamp({ x, y, w = 300, flip = false, z = 8 }) {
  const h = w * 1.2;
  return `<svg style="${abs(x, y, w, h, `transform:scaleX(${flip ? -1 : 1});filter:drop-shadow(10px 18px 14px rgba(10,8,4,.45));z-index:${z}`)}" viewBox="0 0 300 360" aria-hidden="true">
  <defs>
    <linearGradient id="lsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.shadeLight}"/><stop offset=".45" stop-color="${G.shade}"/><stop offset="1" stop-color="${G.shadeDeep}"/></linearGradient>
    <linearGradient id="lbr" x1="0" x2="1"><stop offset="0" stop-color="#8d6526"/><stop offset=".4" stop-color="${G.brassLight}"/><stop offset="1" stop-color="#8d6526"/></linearGradient>
  </defs>
  <ellipse cx="150" cy="342" rx="82" ry="14" fill="url(#lbr)"/><path d="M78 338 Q150 300 222 338 L222 342 Q150 356 78 342Z" fill="url(#lbr)"/>
  <rect x="142" y="170" width="16" height="140" rx="6" fill="url(#lbr)"/>
  <path d="M150 176 C150 140 190 128 214 120" fill="none" stroke="url(#lbr)" stroke-width="14" stroke-linecap="round"/>
  <path d="M26 124 Q26 50 96 44 L216 44 Q282 50 282 124 Z" fill="url(#lsh)"/>
  <path d="M60 62 Q150 36 244 62" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="7" stroke-linecap="round"/>
  <rect x="22" y="120" width="264" height="10" rx="5" fill="url(#lbr)"/>
  <circle cx="214" cy="120" r="10" fill="${G.brass}"/>
  <path d="M96 130 L96 168" stroke="${G.brass}" stroke-width="3"/><circle cx="96" cy="172" r="6" fill="${G.brassLight}"/>
  </svg>`;
}

/** A globe on a wooden stand: cream sea, green land, a brass meridian. */
function globe({ x, y, d = 240, z = 8, rot = 0 }) {
  const s = d / 240;
  return `<svg style="${abs(x, y, d, d * 1.3, `filter:drop-shadow(10px 16px 12px rgba(10,8,4,.45));z-index:${z};transform:rotate(${rot}deg)`)}" viewBox="0 0 240 312" aria-hidden="true">
  <defs>
    <radialGradient id="gb" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#f6efd8"/><stop offset=".6" stop-color="#e2d3a8"/><stop offset="1" stop-color="#a98f5a"/></radialGradient>
    <clipPath id="gc"><circle cx="120" cy="116" r="100"/></clipPath>
    <linearGradient id="gbr" x1="0" x2="1"><stop offset="0" stop-color="#8d6526"/><stop offset=".4" stop-color="${G.brassLight}"/><stop offset="1" stop-color="#8d6526"/></linearGradient>
  </defs>
  <path d="M120 262 L120 286" stroke="${G.wood}" stroke-width="12"/>
  <ellipse cx="120" cy="292" rx="70" ry="14" fill="${G.leatherDeep}"/><ellipse cx="120" cy="288" rx="70" ry="13" fill="${G.leather}"/>
  <circle cx="120" cy="116" r="100" fill="url(#gb)"/>
  <g clip-path="url(#gc)" fill="${G.shade}" opacity=".85">
    <path d="M40 70 C60 40 100 40 112 62 C120 82 98 92 92 110 C84 134 60 126 52 104 C44 92 34 86 40 70Z"/>
    <path d="M126 130 C150 112 190 118 206 140 C214 170 186 186 170 176 C156 196 138 180 138 160 C128 152 122 142 126 130Z"/>
    <path d="M132 52 C150 40 178 46 184 62 C176 76 150 76 132 52Z" fill="${G.leatherLight}"/>
  </g>
  <g clip-path="url(#gc)" stroke="${G.leather}" stroke-opacity=".28" fill="none" stroke-width="2"><ellipse cx="120" cy="116" rx="100" ry="34"/><ellipse cx="120" cy="116" rx="34" ry="100"/><path d="M20 116 H220"/></g>
  <circle cx="120" cy="116" r="100" fill="none" stroke="url(#gbr)" stroke-width="9" transform="rotate(-22 120 116)" stroke-dasharray="0" opacity="0"/>
  <path d="M30 150 A100 100 0 0 1 120 16" fill="none" stroke="url(#gbr)" stroke-width="7"/>
  <path d="M60 208 A104 104 0 0 0 222 120" fill="none" stroke="url(#gbr)" stroke-width="7"/>
  <circle cx="120" cy="116" r="100" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
  <path d="M120 14 L120 4" stroke="url(#gbr)" stroke-width="8"/>
  <path d="M82 262 Q120 276 158 262" fill="none" stroke="url(#gbr)" stroke-width="9" stroke-linecap="round"/>
  </svg>`;
}

/** A leather pencil cup seen from the side with pencils and a pen. */
function pencilCup({ x, y, s = 1, z = 9 }) {
  const w = 190 * s, h = 300 * s;
  return `<svg style="${abs(x, y, w, h, `filter:drop-shadow(8px 14px 10px rgba(10,8,4,.45));z-index:${z}`)}" viewBox="0 0 190 300" aria-hidden="true">
  <defs><linearGradient id="pcl" x1="0" x2="1"><stop offset="0" stop-color="${G.leatherLight}"/><stop offset=".5" stop-color="${G.leather}"/><stop offset="1" stop-color="${G.leatherDeep}"/></linearGradient></defs>
  <g transform="rotate(-14 70 160)"><rect x="62" y="12" width="14" height="170" rx="2" fill="#e0b13e"/><path d="M62 12 L69 -14 L76 12Z" fill="#e8d3a2"/><path d="M66 0 L69 -14 L72 0Z" fill="#2a2a2a"/><rect x="62" y="150" width="14" height="30" fill="#e0b13e"/></g>
  <g transform="rotate(5 100 150)"><rect x="92" y="2" width="14" height="190" rx="7" fill="${G.shade}"/><rect x="95" y="2" width="4" height="190" fill="#fff" opacity=".25"/></g>
  <g transform="rotate(20 130 160)"><rect x="124" y="34" width="13" height="160" rx="2" fill="#c9412f"/><path d="M124 34 L130 12 L137 34Z" fill="#e8d3a2"/><path d="M127 22 L130 12 L134 22Z" fill="#2a2a2a"/></g>
  <path d="M28 130 L162 130 L154 284 Q95 298 36 284 Z" fill="url(#pcl)"/>
  <rect x="28" y="124" width="134" height="14" rx="6" fill="${G.leatherDeep}"/>
  <path d="M34 160 H156" stroke="${G.brassLight}" stroke-width="3" stroke-dasharray="7 6" opacity=".8"/>
  <path d="M38 262 H152" stroke="${G.brassLight}" stroke-width="3" stroke-dasharray="7 6" opacity=".8"/>
  <path d="M40 140 Q42 210 46 270" stroke="#fff" stroke-opacity=".18" stroke-width="8" fill="none"/>
  </svg>`;
}

/** A leather-covered notebook seen from above (cover, spine stitching, elastic band). */
function notebook({ x, y, w = 300, h = 410, rot = 0, color = G.leather, deep = G.leatherDeep, band = G.cream, z = 3, origin = "50% 50%", strap = true, pages = true }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);transform-origin:${origin};z-index:${z};filter:drop-shadow(6px 12px 10px rgba(10,8,4,.42))`)}">
  ${pages ? `<div style="position:absolute;left:6px;top:6px;right:-7px;bottom:-7px;border-radius:6px 10px 10px 6px;background:repeating-linear-gradient(90deg,#f4ecd8 0 2px,#d8c9a4 2px 3px)"></div>` : ""}
  <div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;background:linear-gradient(135deg,${color},${deep})"></div>
  <div style="position:absolute;left:0;top:0;bottom:0;width:${w * 0.1}px;border-radius:6px 0 0 6px;background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.08) 70%,rgba(0,0,0,.18))"></div>
  <div style="position:absolute;left:${w * 0.13}px;top:12px;bottom:12px;border-left:3px dashed rgba(244,236,216,.55)"></div>
  <div style="position:absolute;inset:0;border-radius:6px 12px 12px 6px;background:radial-gradient(120% 80% at 25% 15%,rgba(255,255,255,.18),transparent 60%)"></div>
  ${strap ? `<div style="position:absolute;right:${w * 0.16}px;top:0;bottom:0;width:${w * 0.07}px;background:${band};opacity:.88;box-shadow:0 0 3px rgba(0,0,0,.4)"></div>` : ""}
  </div>`;
}

/** Ruled paper css. */
const ruled = (step, line = "rgba(58,110,88,.3)", off = 0) => `background-image:repeating-linear-gradient(180deg,transparent 0 ${step - 2}px,${line} ${step - 2}px ${step}px);background-position:0 ${off}px`;

/** Book spines for a shelf compartment. */
function spines(x0, x1, base, hmin, hmax, seed) {
  const r = rng(seed);
  const cols = [["#2d6a52", "#1b4636"], ["#7b4a2a", "#4f2d19"], ["#e8dcba", "#bda877"], ["#a06a3c", "#6e4222"], ["#1d4a3c", "#10302a"], ["#6b3b25", "#43241a"], ["#c9b681", "#9c8650"], ["#3b5d46", "#27402f"]];
  let x = x0, out = "";
  while (x < x1 - 30) {
    const w = 30 + Math.floor(r() * 30), h = hmin + Math.floor(r() * (hmax - hmin));
    const c = cols[Math.floor(r() * cols.length)];
    const lean = r() > 0.93 ? 6 : 0;
    out += `<div style="${abs(x, base - h, w, h, `background:linear-gradient(90deg,${c[0]},${c[1]});border-radius:3px 3px 0 0;box-shadow:inset -3px 0 5px rgba(0,0,0,.28),inset 2px 0 2px rgba(255,255,255,.12);transform:rotate(${lean}deg);transform-origin:50% 100%`)}">
      <div style="position:absolute;left:0;right:0;top:${16 + Math.floor(r() * 12)}px;height:5px;background:${G.brassLight};opacity:.8"></div>
      <div style="position:absolute;left:0;right:0;top:${28 + Math.floor(r() * 12)}px;height:3px;background:${G.brassLight};opacity:.6"></div>
      <div style="position:absolute;left:25%;right:25%;top:${h * 0.45}px;height:${h * 0.22}px;background:rgba(244,236,216,.55);border-radius:2px"></div></div>`;
    x += w + 2 + (r() > 0.85 ? 22 : 0);
  }
  return out;
}

/* ================================================================ #4 */
function p04() {
  const n = 4;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e8d4", sub: i.sub, textTop: 58, size: 92 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(180deg,#3d2a1b,#2a1b11)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(70% 55% at 62% 40%,rgba(255,214,140,.22),transparent 70%)")}"></div>`;
  const plank = (y, h = 38) => `<div style="${abs(0, y, 1000, h, "background:linear-gradient(180deg,#8a5b34,#6a4325 55%,#4a2c17);box-shadow:0 10px 16px rgba(0,0,0,.45);z-index:2")}"></div>`;
  const shelf = `${spines(0, 230, 720, 230, 330, 4)}${spines(780, 1000, 720, 250, 340, 9)}${plank(720)}
  ${spines(0, 230, 1150, 300, 380, 12)}${plank(1150)}${spines(0, 230, 1354, 200, 250, 3)}`;
  const side = `<div style="${abs(0, SCENE_TOP, 22, 982, "background:linear-gradient(90deg,#1c120a,#3b2615);z-index:3")}"></div><div style="${abs(978, SCENE_TOP, 22, 982, "background:linear-gradient(90deg,#3b2615,#1c120a);z-index:3")}"></div>`;

  const items = i.items;
  const rows = items.map((t, k) => `<div style="display:flex;align-items:center;gap:6px;height:${k === 4 ? 150 : 124}px;border-bottom:3px solid rgba(58,110,88,.28)">${box(64, k === 0)}<div class="hand" style="font:600 52px/1.0 'Hand',cursive;color:${G.ink}">${esc(t)}</div></div>`).join("");

  const clip = `
  <div style="${abs(214, 420, 580, 900, `transform:rotate(-2.5deg);transform-origin:50% 0;z-index:10;filter:drop-shadow(12px 22px 18px rgba(0,0,0,.55))`)}">
    <div style="position:absolute;inset:0;border-radius:18px;background:linear-gradient(140deg,${G.leatherLight},${G.leather} 50%,${G.leatherDeep});box-shadow:inset 0 0 0 4px rgba(0,0,0,.18),inset 0 3px 0 rgba(255,255,255,.18)"></div>
    <div style="position:absolute;inset:12px;border-radius:12px;border:3px dashed rgba(244,236,216,.35)"></div>
    <div style="${abs(34, 96, 512, 780, `background:${G.cream};box-shadow:0 2px 4px rgba(0,0,0,.35);padding:8px 26px 0 22px`)}" data-check="items">
      <div style="position:absolute;left:0;right:0;top:0;height:14px;background:linear-gradient(180deg,rgba(0,0,0,.12),transparent)"></div>
      <div style="position:absolute;left:92px;top:0;bottom:0;border-left:3px solid rgba(190,90,90,.35)"></div>
      <div style="position:relative;padding-top:52px">${rows}</div>
    </div>
    <div style="${abs(170, 44, 240, 92, "border-radius:10px 10px 6px 6px;background:linear-gradient(90deg,#8d6526,#e6c274 40%,#a8792f);box-shadow:0 5px 7px rgba(0,0,0,.45)")}"></div>
    <div style="${abs(204, 28, 172, 36, "border-radius:18px 18px 0 0;background:linear-gradient(90deg,#9a7230,#f0d38c 45%,#9a7230);box-shadow:0 -1px 3px rgba(0,0,0,.4)")}"></div>
    <div style="${abs(228, 74, 124, 26, "border-radius:6px;background:rgba(60,35,10,.35)")}"></div>
  </div>
  <div style="${abs(484, 392, 34, 34, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f2d68e,#8d6526);box-shadow:0 5px 6px rgba(0,0,0,.5);z-index:12")}"></div>`;

  const g = globe({ x: 790, y: 1160 - 300, d: 200, z: 4 });

  const body = `${wall}${shelf}${side}${g}${clip}${fh}`;
  return { n, id: "how-to-prepare-for-a-phone-call-five-things", html: page(pObj(), { body, css: fc, paper: "#f1e8d4" }) };
}

/* ================================================================ #12 */
function p12() {
  const n = 12;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ebe2cc", sub: i.sub, textTop: 58 });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(180deg,#5c3220,#42241a)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 3px,transparent 3px 11px),repeating-linear-gradient(90deg,rgba(255,200,140,.05) 0 1px,transparent 1px 37px)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(80% 60% at 30% 25%,rgba(255,214,150,.22),rgba(0,0,0,.38))")}"></div>`;

  const rows = i.items.map((t, k) => `<div style="display:flex;align-items:center;gap:8px;min-height:${k === 3 ? 168 : 150}px;border-bottom:3px solid rgba(58,110,88,.3);position:relative">${box(60)}<div class="hand" style="font:600 46px/1.02 'Hand',cursive;color:${G.ink}">${esc(t)}${k === 3 ? ring(520, 140, { seed: 7, sw: 7, grow: 0 }).replace("position:absolute;left:0px;top:0px", "position:absolute;left:-84px;top:14px") : ""}</div></div>`).join("");

  // Ledger: left page cropped by the pin edge, spine at x 330, right page carries the list.
  const ledger = `
  <div style="${abs(-150, 402, 1090, 930, "transform:rotate(-4deg);transform-origin:50% 50%;z-index:3;filter:drop-shadow(14px 26px 22px rgba(0,0,0,.6))")}">
    <div style="position:absolute;inset:0;border-radius:16px;background:linear-gradient(135deg,${G.leatherLight},${G.leather} 40%,${G.leatherDeep})"></div>
    <div style="position:absolute;inset:10px;border-radius:10px;border:3px dashed rgba(244,236,216,.4)"></div>
    <div style="${abs(26, 26, 500, 880, `background:${G.cream};border-radius:4px 0 0 4px;box-shadow:inset -22px 0 24px -12px rgba(60,40,10,.35);${ruled(52, "rgba(58,110,88,.32)", 20)}`)}">
      <div style="position:absolute;left:46px;top:0;bottom:0;border-left:3px double rgba(190,90,90,.45)"></div>
      <div style="position:absolute;left:300px;top:0;bottom:0;border-left:2px solid rgba(58,110,88,.3)"></div>
      <div style="position:absolute;left:400px;top:0;bottom:0;border-left:2px solid rgba(58,110,88,.3)"></div>
    </div>
    <div style="${abs(526, 26, 540, 880, `background:${G.cream};border-radius:0 4px 4px 0;box-shadow:inset 22px 0 24px -12px rgba(60,40,10,.4),0 0 0 1px rgba(0,0,0,.1);${ruled(52, "rgba(58,110,88,.32)", 20)}`)}">
      <div style="position:absolute;left:44px;right:30px;top:62px" data-check="items">${rows}</div>
    </div>
    <div style="position:absolute;left:500px;top:20px;width:52px;height:892px;background:linear-gradient(90deg,rgba(0,0,0,0),rgba(40,25,5,.4) 50%,rgba(0,0,0,0))"></div>
    <div style="position:absolute;left:600px;top:870px;width:34px;height:150px;background:${G.shade};clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);box-shadow:0 4px 6px rgba(0,0,0,.4)"></div>
  </div>`;

  // Butter sticky with a blank ref line, on the left page.
  const sticky = `<div style="${abs(42, 466, 270, 250, `transform:rotate(-7deg);z-index:7;background:linear-gradient(172deg,#f6e08f,#efcc66);box-shadow:0 1px 2px rgba(0,0,0,.35),0 12px 14px rgba(0,0,0,.4)`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div>
    <div class="hand" style="position:absolute;left:26px;top:34px;font:600 64px/1 'Hand',cursive;color:${G.ink}">ref</div>
    <div style="position:absolute;left:26px;right:26px;top:150px;border-bottom:4px solid rgba(60,45,20,.55)"></div></div>`;

  // A phone that has just ended a call: dark, face up.
  const phone = `<div style="${abs(34, 840, 238, 420, "transform:rotate(9deg);z-index:7;filter:drop-shadow(10px 18px 14px rgba(0,0,0,.6))")}">
    <div style="position:absolute;inset:0;border-radius:40px;background:linear-gradient(140deg,#3a3d44,#14161a)"></div>
    <div style="position:absolute;left:10px;top:10px;right:10px;bottom:10px;border-radius:32px;background:linear-gradient(160deg,#1d2a2b,#0c1112)"></div>
    <div style="position:absolute;left:12px;top:12px;right:12px;bottom:12px;border-radius:30px;background:linear-gradient(120deg,rgba(255,255,255,.1),transparent 40%)"></div>
    <div style="position:absolute;left:84px;top:22px;width:70px;height:16px;border-radius:9px;background:#05080a"></div></div>`;

  const cup = pencilCup({ x: 806, y: 1040, s: 1.0, z: 8 });

  const body = `${desk}${ledger}${sticky}${phone}${cup}${fh}`;
  return { n, id: "customer-service-call-four-things", html: page(pObj(), { body, css: fc, paper: "#ebe2cc" }) };
}

/* ================================================================ #14 */
function p14() {
  const n = 14;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e2e8da", sub: i.sub, textTop: 58 });

  const felt = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(90% 70% at 40% 25%,#2f6b4f,#173f2f 70%,#102c21)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.025) 0 2px,transparent 2px 6px)")}"></div>`;

  // The drawer front, top right, a corner of it: walnut with a brass label holder and pull.
  const drawer = `<div style="${abs(690, 392, 420, 250, "transform:rotate(7deg);transform-origin:0 0;z-index:2;filter:drop-shadow(8px 16px 14px rgba(0,0,0,.55))")}">
    <div style="position:absolute;inset:0;border-radius:12px;background:linear-gradient(150deg,#8a5b34,#5a3720 60%,#43271a)"></div>
    <div style="position:absolute;inset:14px;border-radius:8px;border:3px solid rgba(255,214,150,.18);background:linear-gradient(150deg,rgba(255,255,255,.05),rgba(0,0,0,.12))"></div>
    <div style="${abs(110, 48, 160, 64, "background:linear-gradient(90deg,#8d6526,#e6c274 40%,#a8792f);border-radius:6px;box-shadow:0 3px 5px rgba(0,0,0,.45)")}"><div style="position:absolute;left:10px;right:10px;top:9px;bottom:9px;background:#f4ecd8;border-radius:3px"></div></div>
    <div style="${abs(130, 140, 120, 30, "background:linear-gradient(90deg,#8d6526,#e6c274 40%,#a8792f);border-radius:15px;box-shadow:0 4px 6px rgba(0,0,0,.5)")}"></div></div>`;

  const parts = i.items.map((t) => { const m = t.match(/^([^:]+):\s*(.*)$/); return { stage: m[1], text: m[2] }; });
  const stairs = parts.map((s, k) => {
    const x = 28 + k * 42, y = 400 + k * 180, w = 760, h = k === 4 ? 200 : 214;
    const last = k === 4;
    return `<div style="${abs(x, y, w, h, `z-index:${4 + k};transform:rotate(${(-0.6 + k * 0.3).toFixed(1)}deg);background:linear-gradient(180deg,#fbf5e4,${G.cream});border-radius:8px;box-shadow:0 -3px 6px rgba(0,0,0,.18),0 10px 16px rgba(0,0,0,.4)`)}">
      <div style="position:absolute;left:0;right:0;top:46px;height:2px;background:rgba(190,90,90,.45)"></div>
      <div style="${abs(24, -20, 220, 34, `background:${G.cream};border-radius:8px 8px 0 0;box-shadow:0 -3px 5px rgba(0,0,0,.2)`)}"></div>
      <div style="position:absolute;left:28px;top:14px;display:flex;align-items:center;gap:12px">
        <div style="width:44px;height:44px;border-radius:50%;background:${C.mulberry};color:#fff;display:grid;place-items:center;font:600 26px 'Plex',sans-serif">${k + 1}</div>
        <div style="font:600 25px 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${G.shadeDeep}">${esc(s.stage)}</div></div>
      <div class="hand" style="position:absolute;left:30px;right:28px;top:60px;padding-bottom:6px;font:600 40px/1.08 'Hand',cursive;color:${G.ink}" data-check="step">${esc(s.text)}</div>
      ${k === 0 ? exTag(590, 14, 2) : ""}
    </div>`;
  }).join("");

  const body = `${felt}${drawer}${globe({ x: -70, y: 1070, d: 250, z: 14 })}${stairs}${fh}`;
  return { n, id: "how-a-customer-service-call-goes", html: page(pObj(), { body, css: fc, paper: "#e2e8da" }) };
}

/* ================================================================ #48 */
function p48() {
  const n = 48;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#dfe6d9", sub: i.sub, textTop: 58, size: 88 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 330, "background:linear-gradient(180deg,#1a2a22,#243d31)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 330, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 3px,transparent 3px 180px)")}"></div>`;
  const cone = `<div style="${abs(250, 540, 500, 760, "clip-path:polygon(40% 0,60% 0,100% 100%,0 100%);background:linear-gradient(180deg,rgba(255,226,150,.5),rgba(255,226,150,.08));z-index:1")}"></div>`;
  const deskTop = `<div style="${abs(0, 650, 1000, 704, "background:linear-gradient(180deg,#5a3720,#3a2214)")}"></div>
  <div style="${abs(0, 650, 1000, 704, "background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.1) 0 3px,transparent 3px 13px)")}"></div>
  <div style="${abs(0, 650, 1000, 14, "background:linear-gradient(180deg,#2a170c,transparent)")}"></div>`;

  const pad = (x, tone) => `<div style="${abs(x, 690, 470, 650, `background:linear-gradient(160deg,${tone[0]},${tone[1]});border-radius:6px;box-shadow:0 14px 22px rgba(0,0,0,.5);z-index:2`)}"><div style="position:absolute;inset:10px;border:2px solid rgba(244,236,216,.25)"></div></div>`;

  // The same blank one-page form, first field ringed in mulberry.
  const form = (x, tilt, seed) => `<div style="${abs(x, 716, 300, 390, `transform:rotate(${tilt}deg);z-index:5;background:#fbf6e8;box-shadow:0 2px 3px rgba(0,0,0,.3),0 16px 24px rgba(0,0,0,.5)`)}">
    <div style="position:absolute;left:22px;top:20px;width:150px;height:14px;border-radius:7px;background:rgba(36,27,20,.5)"></div>
    <div style="position:absolute;left:22px;top:46px;width:90px;height:9px;border-radius:5px;background:rgba(36,27,20,.25)"></div>
    <div style="${abs(22, 84, 256, 52, "border:3px solid rgba(36,27,20,.5);border-radius:6px;background:rgba(255,255,255,.4)")}">${ring(256, 52, { seed, sw: 6, grow: 8, sq: 3.2 }).replace("z-index:6", "z-index:7")}</div>
    ${[0, 1, 2, 3].map((k) => `<div style="${abs(22, 164 + k * 58, 256, 44, "border:3px solid rgba(36,27,20,.32);border-radius:6px")}"></div>`).join("")}
    <div style="${abs(22, 340, 110, 28, "border:3px solid rgba(36,27,20,.32);border-radius:6px")}"></div>
    ${exTag(176, 14, 3).replace("z-index:20", "z-index:8").replace("font-size:24px", "font-size:24px")}</div>`;

  // Phone with a game: coloured blocks, no words. Phone face down: back with camera.
  const gamePhone = `<div style="${abs(350, 800, 128, 252, "transform:rotate(8deg);z-index:6;filter:drop-shadow(8px 14px 10px rgba(0,0,0,.6))")}">
    <div style="position:absolute;inset:0;border-radius:26px;background:#14161a"></div>
    <div style="position:absolute;left:6px;top:6px;right:6px;bottom:6px;border-radius:21px;background:linear-gradient(160deg,#27407a,#15234a);overflow:hidden">
      ${[["#e8b43a", 0, 0], ["#e0553f", 1, 0], ["#3fae7a", 2, 0], ["#e0553f", 0, 1], ["#7a5bd0", 1, 1], ["#e8b43a", 2, 1], ["#3fae7a", 0, 2], ["#3fae7a", 1, 2], ["#e0553f", 2, 2], ["#e8b43a", 1, 3]].map(([c, a, b]) => `<div style="${abs(8 + a * 36, 70 + b * 36, 32, 32, `background:${c};border-radius:8px;box-shadow:inset 0 -4px 0 rgba(0,0,0,.25)`)}"></div>`).join("")}
      <div style="${abs(8, 12, 100, 14, "border-radius:7px;background:rgba(255,255,255,.55)")}"></div></div>
    <div style="${abs(40, 12, 48, 10, "border-radius:5px;background:#05080a")}"></div></div>`;
  const downPhone = `<div style="${abs(838, 900, 128, 252, "transform:rotate(-7deg);z-index:6;filter:drop-shadow(8px 14px 10px rgba(0,0,0,.6))")}">
    <div style="position:absolute;inset:0;border-radius:26px;background:linear-gradient(140deg,#4a4f58,#23262c)"></div>
    <div style="position:absolute;inset:0;border-radius:26px;background:linear-gradient(120deg,rgba(255,255,255,.14),transparent 45%)"></div>
    <div style="${abs(14, 14, 56, 56, "border-radius:16px;background:#14161a;box-shadow:inset 0 0 0 2px rgba(255,255,255,.1)")}"><div style="${abs(8, 8, 18, 18, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#3a4a68,#06090e)")}"></div><div style="${abs(30, 28, 18, 18, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#3a4a68,#06090e)")}"></div></div>
    <div style="${abs(44, 120, 40, 40, "border-radius:50%;background:rgba(255,255,255,.1)")}"></div></div>`;

  const cap = (x, label, text) => `<div style="${abs(x, 1118, 438, 230, "z-index:6")}"><div class="hand" style="font:700 54px/1 'Hand',cursive;color:${G.brassLight}">${label}</div><div class="hand" style="font:600 30px/1.1 'Hand',cursive;color:${G.cream};margin-top:6px;padding-bottom:6px" data-check="items">${esc(text)}</div></div>`;

  const body = `${wall}${cone}${deskTop}${pad(18, ["#2c5f48", "#1b4130"])}${pad(512, ["#7b4a2a", "#4f2d19"])}
  ${lamp({ x: 355, y: 396, w: 290, z: 3 })}
  <div style="${abs(240, 640, 520, 60, "background:radial-gradient(50% 100% at 50% 0,rgba(255,226,150,.42),transparent);z-index:1")}"></div>
  ${form(52, -2.5, 4)}${gamePhone}${form(546, 2, 9)}${downPhone}
  ${cap(40, "Tuesday 1", i.items[0])}${cap(534, "Tuesday 2", i.items[1])}${fh}`;
  return { n, id: "two-tuesdays-one-untouched-form", html: page(pObj(), { body, css: fc, paper: "#dfe6d9" }) };
}

/* ================================================================ #62 */
function p62() {
  const n = 62;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9eee2", size: 84, textTop: 54 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 800, "background:linear-gradient(180deg,#dbe3cf,#c8d3bb)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 800, "background:radial-gradient(60% 50% at 70% 10%,rgba(255,240,190,.55),transparent 70%)")}"></div>`;
  const deskTop = `<div style="${abs(0, 1140, 1000, 214, "background:linear-gradient(180deg,#8a5b34,#5a3720)")}"></div>
  <div style="${abs(0, 1140, 1000, 214, "background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.08) 0 3px,transparent 3px 13px)")}"></div>
  <div style="${abs(0, 1140, 1000, 10, "background:linear-gradient(180deg,rgba(0,0,0,.4),transparent)")}"></div>`;

  // Fading rows below the one row, scribbles not words.
  const fade = [0.5, 0.36, 0.24, 0.13].map((op, k) => `<div style="${abs(96, 320 + k * 66, 520, 56, `opacity:${op}`)}">${scribSvg(520, 56, 20 + k, { rows: 1, y0: 0.55, span: 0, x0: 0.02, maxLen: 0.95, color: G.ink, op: 1 })}<div style="${abs(470, 6, 44, 44, `border:3px solid ${G.ink};border-radius:8px;opacity:.7`)}"></div></div>`).join("");

  const pageEl = `<div style="${abs(70, 440, 660, 700, "transform-origin:50% 100%;transform:perspective(1600px) rotateX(5deg);z-index:6;background:#fbf6e8;box-shadow:0 2px 4px rgba(0,0,0,.3),0 16px 26px rgba(0,0,0,.4)")}">
    <div style="position:absolute;inset:0;${ruled(62, "rgba(58,110,88,.3)", 40)}"></div>
    <div style="position:absolute;left:78px;top:0;bottom:0;border-left:3px solid rgba(190,90,90,.4)"></div>
    <div class="hand" style="position:absolute;left:104px;top:38px;font:700 92px/1 'Hand',cursive;color:${G.ink}">Airline refund</div>
    <div style="${abs(540, 40, 100, 100, "border:5px solid rgba(36,27,20,.75);border-radius:12px;background:rgba(255,255,255,.5)")}"><div class="hand" style="position:absolute;inset:0;display:grid;place-items:center;font:700 110px/1 'Hand',cursive;color:${C.mulberry};padding-bottom:12px">?</div></div>
    <div class="hand" style="position:absolute;left:104px;top:172px;width:520px;font:600 40px/1.1 'Hand',cursive;color:#3b4a40;padding-bottom:6px" data-check="items">${esc(i.items[0])}</div>
    ${fade}
    ${exTag(420, -30, 2, 8)}
  </div>`;

  // The reading stand: a wooden back, side struts, a ledge in front.
  const stand = `<div style="${abs(36, 418, 728, 760, "z-index:2;filter:drop-shadow(16px 24px 18px rgba(30,15,5,.5))")}">
    <div style="position:absolute;inset:0;border-radius:26px 26px 6px 6px;background:linear-gradient(150deg,#8a5b34,#5a3720 70%,#43271a)"></div>
    <div style="position:absolute;left:16px;right:16px;top:16px;bottom:50px;border-radius:16px 16px 0 0;border:3px solid rgba(255,214,150,.18)"></div>
    <div style="${abs(380, 6, 48, 12, "border-radius:6px;background:rgba(0,0,0,.2)")}"></div></div>
  <div style="${abs(16, 1096, 768, 62, "z-index:8;border-radius:8px;background:linear-gradient(180deg,#b07a46,#7a4c28 55%,#4f2d19);box-shadow:0 12px 18px rgba(0,0,0,.5)")}"></div>
  <div style="${abs(70, 1130, 660, 34, "z-index:9;background:linear-gradient(180deg,#6f4424,#43271a);border-radius:0 0 8px 8px")}"></div>`;

  // The other half of the idea on a cream card leaning on the desk.
  const card = `<div style="${abs(40, 1178, 600, 158, "transform:rotate(-1.5deg);z-index:11;background:linear-gradient(180deg,#fbf5e4,#f4ecd8);border-radius:6px;box-shadow:0 10px 16px rgba(0,0,0,.45)")}">
    <div class="hand" style="position:absolute;left:26px;right:24px;top:16px;padding-bottom:6px;font:600 35px/1.08 'Hand',cursive;color:${G.ink}" data-check="items">${esc(i.items[1])}</div></div>`;

  const body = `${wall}${lamp({ x: 770, y: 840, w: 240, flip: true, z: 3 })}${deskTop}${stand}${pageEl}${card}${pencilCup({ x: 664, y: 1156, s: 0.6, z: 12 })}${fh}`;
  return { n, id: "why-to-do-lists-do-not-work", html: page(pObj(), { body, css: fc, paper: "#e9eee2" }) };
}

/* ================================================================ #80 */
function p80() {
  const n = 80;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3ead9", sub: i.sub, size: 72, textTop: 50, extraCss: ".top p{font-size:25px;margin-top:10px}" });

  const oak = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(180deg,#d6b27c,#bf9560)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background-image:repeating-linear-gradient(0deg,rgba(120,80,30,.12) 0 2px,transparent 2px 14px),repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0 1px,transparent 1px 47px)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(80% 60% at 25% 20%,rgba(255,240,200,.35),rgba(90,50,10,.28))")}"></div>`;

  // The fan of notebooks, pinned at bottom right.
  const fan = [
    notebook({ x: 540, y: 940, w: 290, h: 400, rot: 62, color: G.shade, deep: G.shadeDeep, band: G.cream, z: 2, origin: "20px 380px" }),
    notebook({ x: 540, y: 940, w: 290, h: 400, rot: 40, color: G.cream, deep: G.creamDeep, band: G.leather, z: 3, origin: "20px 380px" }),
    notebook({ x: 540, y: 940, w: 290, h: 400, rot: 20, color: G.leatherLight, deep: G.leatherDeep, band: G.cream, z: 4, origin: "20px 380px" }),
    notebook({ x: 540, y: 940, w: 290, h: 400, rot: 0, color: G.leather, deep: G.leatherDeep, band: G.brassLight, z: 5, origin: "20px 380px" }),
  ].join("");

  // Half-filled form under the card, a receipt tucked under it, a paperclip.
  const form = `<div style="${abs(30, 840, 420, 500, "transform:rotate(6deg);z-index:6;background:#fbf8ee;box-shadow:0 2px 3px rgba(60,30,5,.3),0 16px 24px rgba(60,30,5,.4)")}">
    <div style="position:absolute;left:30px;top:30px;width:200px;height:16px;border-radius:8px;background:rgba(36,27,20,.5)"></div>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<div style="${abs(30, 86 + k * 58, 360, 38, "border:3px solid rgba(36,27,20,.3);border-radius:6px")}">${k < 3 ? scribSvg(360, 38, 40 + k, { rows: 1, y0: 0.5, span: 0, x0: 0.04, maxLen: 0.8, color: G.pen, op: 0.65 }) : ""}</div>`).join("")}
  </div>
  <div style="${abs(400, 950, 140, 250, "transform:rotate(-6deg);z-index:9;background:#f6f1e4;clip-path:polygon(0 0,100% 0,100% 94%,90% 100%,80% 94%,70% 100%,60% 94%,50% 100%,40% 94%,30% 100%,20% 94%,10% 100%,0 94%);box-shadow:0 8px 14px rgba(0,0,0,.3)")}">${scribSvg(150, 250, 77, { rows: 8, x0: 0.12, y0: 0.08, span: 0.82, maxLen: 0.8, color: "#4a4034", op: 0.5 })}</div>`;
  const clip = `<svg style="${abs(70, 800, 70, 160, "z-index:12;transform:rotate(6deg);filter:drop-shadow(3px 5px 3px rgba(0,0,0,.4))")}" viewBox="0 0 70 160" aria-hidden="true"><path d="M20 130 V40 a18 18 0 0 1 36 0 V120 a12 12 0 0 1 -24 0 V50" fill="none" stroke="#a5a8b0" stroke-width="5" stroke-linecap="round"/></svg>`;

  const parts = i.items.map((t) => { const m = t.match(/^(.*?[?:])\s+(.*)$/); return { q: m[1].replace(/:$/, ""), a: m[2] }; });
  const lines = parts.map((s, k) => {
    const hot = k === 2;
    return `<div style="position:relative;padding:10px 0 12px;border-bottom:3px solid rgba(58,110,88,.3);min-height:116px"><div style="font:600 22px 'Plex',sans-serif;letter-spacing:.06em;color:#6b5a44">${esc(s.q)}</div><div class="hand" style="font:600 38px/1.02 'Hand',cursive;color:${G.ink};margin-top:3px;position:relative;display:inline-block">${esc(s.a)}${hot ? ring(700, 164, { seed: 11, sw: 7, sq: 3.2 }).replace("left:0px;top:0px", "left:-26px;top:-56px") : ""}</div></div>`;
  }).join("");
  const card = `<div style="${abs(110, 398, 790, 560, "transform:rotate(-2deg);z-index:10;background:linear-gradient(180deg,#fdf8ea,#f4ecd8);border-radius:8px;box-shadow:0 2px 3px rgba(60,30,5,.3),0 24px 36px rgba(60,30,5,.45)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:22px;background:rgba(190,90,90,.18);border-radius:8px 8px 0 0"></div>
    <div style="position:absolute;left:36px;right:36px;top:30px" data-check="items">${lines}</div>
    ${exTag(640, 4, 2, 12)}
  </div>`;

  const pen = `<div style="${abs(560, 1280, 400, 24, "transform:rotate(-14deg);z-index:11;border-radius:12px;background:linear-gradient(180deg,#3d3a44,#1c1b20);filter:drop-shadow(0 8px 6px rgba(40,20,5,.4))")}"><div style="${abs(300, 0, 14, 24, "background:#d8c07a")}"></div></div>`;

  const body = `${oak}${fan}${form}${clip}${card}${fh}`;
  return { n, id: "how-to-restart-a-half-finished-project", html: page(pObj(), { body, css: fc, paper: "#f3ead9" }) };
}

import { p as PROD } from "../kit/bank.mjs";
function pObj() { return PROD; }

export const pins = [p04(), p12(), p14(), p48(), p62(), p80()];
