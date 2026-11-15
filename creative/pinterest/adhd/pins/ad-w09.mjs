/**
 * ADHD Life Companion guide pins, world w09: Sunday reset table.
 * A tray, small baskets, a mug of tea, a small plant, a kitchen timer, a cloth napkin,
 * morning window light. Oatmeal, sage, soft mulberry.
 *
 * #64 how-to-steps   blush-grey linen: a spiral pad of four ticked rows, a kitchen timer, a butter note
 * #68 comparison     sage cloth: a crowded printed sheet with four lines struck, one ringed index card on a wooden tray
 * #70 question       warm oak planks in window light: a calendar with a blank week, a question card, a butter note
 * #92 quote-card     blush linen: one index card, "Dropped on ____, because ____", a closed folder, a ribbon, three baskets
 * #97 infographic    deep sage cloth: three stacked paper slabs, floor in mulberry, a calendar corner with a Sunday circled
 * #98 quote-card     pale oatmeal linen: one huge line, a closed folder under a glass of water
 *
 * Every picture is drawn (flat vector); no app screen and no book page is used.
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const INK = "#231a1f";
const MUL = C.mulberry;
const MULD = C.mulberryDeep;

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** Header block (eyebrow, headline, optional sub) and footer band, as the finished pins have. */
function frame(i, { paper, size = 76, sub = null, textTop = 62, split = ": ", extraCss = "" }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(split);
  if (at > 0) { eyebrow = i.headline.slice(0, at + (split === "? " ? 1 : 0)); head = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(40,25,30,.3);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(40,25,30,.3);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;color:${INK}}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4d4348;max-width:840px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d3439}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ surfaces and light */

/** Linen or cloth filling the scene: a soft radial wash and a fine weave. */
const cloth = ({ a, b, c = b, weave = "rgba(110,90,80,.05)", check = null }) => `
<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, `background:radial-gradient(120% 80% at 30% 20%,${a},${b} 62%,${c})`)}"></div>
${check ? `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, `background-image:repeating-linear-gradient(0deg,${check} 0 70px,transparent 70px 140px),repeating-linear-gradient(90deg,${check} 0 70px,transparent 70px 140px)`)}"></div>` : ""}
<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, `background-image:repeating-linear-gradient(0deg,${weave} 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,${weave} 0 1px,transparent 1px 6px)`)}"></div>`;

/** Oak planks running down the scene, each its own tone, with grain. */
function planks(tones, seam = "rgba(90,60,30,.35)", seed = 4) {
  const r = rng(seed);
  const w = 1000 / tones.length;
  return tones.map((t, k) => {
    let grain = "";
    for (let g = 0; g < 9; g++) {
      const gx = 8 + r() * (w - 16);
      grain += `<path d="M${gx.toFixed(0)} 0 C ${(gx + (r() - 0.5) * 22).toFixed(0)} 300, ${(gx + (r() - 0.5) * 22).toFixed(0)} 700, ${(gx + (r() - 0.5) * 10).toFixed(0)} 1200" fill="none" stroke="#8a6234" stroke-opacity="${(0.1 + r() * 0.12).toFixed(2)}" stroke-width="${(1 + r() * 1.6).toFixed(1)}"/>`;
    }
    return `<div style="${abs(k * w, SCENE_TOP, w, 1500 - SCENE_TOP, `background:linear-gradient(${t[0]},${t[1]});border-left:3px solid ${seam};overflow:hidden`)}"><svg width="${w}" height="1200" style="position:absolute;left:0;top:0" aria-hidden="true">${grain}</svg></div>`;
  }).join("");
}

/** Morning window light: slats of brightness falling across the table, under the props. */
const light = ({ x = -200, y = 300, w = 1500, h = 1300, rot = -24, op = 0.3, slat = 110, gap = 90, tint = "255,247,226", z = 2, blur = 6 }) =>
  `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:repeating-linear-gradient(0deg,rgba(${tint},${op}) 0 ${slat}px,transparent ${slat}px ${slat + gap}px);filter:blur(${blur}px);mix-blend-mode:screen;z-index:${z};pointer-events:none`)}"></div>`;

/* ------------------------------------------------------------ drawn marks */

/** A hand-drawn loop (an ellipse that overshoots its start), as an svg that sits over a box of w x h. */
function ring(w, h, { color = MUL, sw = 7, seed = 3, halo = null, sq = 2 } = {}) {
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
  return `<svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${halo ? `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${sw + 8}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A mulberry tick, drawn like a pen stroke, sitting over a box of size s. */
const tick = (s = 64) => `<svg style="position:absolute;left:${-s * 0.04}px;top:${-s * 0.3}px;overflow:visible" width="${s * 1.1}" height="${s * 1.1}" viewBox="0 0 70 70" aria-hidden="true"><path d="M9 38 L25 56 L62 8" fill="none" stroke="${MUL}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Wavy scribbles that read as writing without being words. */
function scribbles(w, h, r, { rows = 4, color = "#6b5a63", op = 0.4, x0 = 0.12, y0 = 0.2, span = 0.62 } = {}) {
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (y0 + (k / rows) * span) + r() * 5;
    const len = w * (0.3 + r() * 0.5);
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

const exTag = (x, y, rot = 0) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:20;transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

const BUTTER = ["#f6e08f", "#efcc66"];

/** A butter sticky note. `inner` is html placed in it. */
function note({ x, y, w, h = w, rot = 0, tone = BUTTER, inner = "", z = 6, extra = "", check = "" }) {
  return `<div ${check ? `data-check="${check}"` : ""} style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${tone[0]},${tone[1]});box-shadow:0 1px 2px rgba(0,0,0,.3),0 12px 16px rgba(50,30,30,.32);z-index:${z};${extra}`)}"><div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div>${inner}</div>`;
}

/** A cream index card with faint rules and a soft mulberry top line. */
function card({ x, y, w, h, rot = 0, inner = "", z = 6, rule = 58, top = 62, extra = "", check = "" }) {
  return `<div ${check ? `data-check="${check}"` : ""} style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.25),0 22px 30px rgba(50,30,35,.35);background-image:repeating-linear-gradient(transparent 0 ${rule - 1}px,#d9d0cf ${rule - 1}px ${rule}px);background-position:0 ${top}px;z-index:${z};${extra}`)}"><div style="position:absolute;left:0;right:0;top:0;height:${top}px;border-bottom:3px solid #e6a9b8;background:#fffaf0;border-radius:6px 6px 0 0"></div>${inner}</div>`;
}

/** Washi tape. */
const tape = (x, y, w = 150, rot = 0, c = "rgba(190,205,180,.88)", z = 12) => `<div style="${abs(x, y, w, 40, `transform:rotate(${rot}deg);background:${c};box-shadow:0 2px 4px rgba(0,0,0,.22);z-index:${z}`)}"></div>`;

/* ------------------------------------------------------------ table props, all seen from above */

/** The kitchen timer: a sage case, a cream dial, ten minutes picked out in soft mulberry. */
function timer({ x, y, s = 300, rot = 0, z = 9 }) {
  let ticks = "";
  for (let k = 0; k < 60; k++) {
    const long = k % 5 === 0;
    ticks += `<line x1="100" y1="${long ? 22 : 25}" x2="100" y2="${long ? 36 : 32}" stroke="#4a3f44" stroke-width="${long ? 2.8 : 1.4}" transform="rotate(${k * 6} 100 100)"/>`;
  }
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(12px 18px 12px rgba(40,25,30,.42));z-index:${z}`)}" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="tmb" cx=".35" cy=".3"><stop offset="0" stop-color="#b3c7b0"/><stop offset="1" stop-color="#6d8872"/></radialGradient></defs>
    <circle cx="100" cy="100" r="97" fill="url(#tmb)"/><circle cx="100" cy="100" r="97" fill="none" stroke="#56705a" stroke-width="2"/>
    <circle cx="100" cy="100" r="80" fill="#f9f3e8"/><circle cx="100" cy="100" r="80" fill="none" stroke="#d8cdb9" stroke-width="2"/>
    <path d="M100 100 L100 40 A60 60 0 0 1 152 70 Z" fill="${MUL}" opacity=".88"/>
    ${ticks}
    <circle cx="100" cy="100" r="19" fill="#ece3d1" stroke="#cbbfa8" stroke-width="2"/><circle cx="100" cy="100" r="7" fill="#b9ad98"/>
    <polygon points="100,4 93,18 107,18" fill="#f9f3e8"/></svg>`;
}

/** A mug of tea on a saucer, from above. */
function mug({ x, y, s = 250, rot = 0, z = 9 }) {
  return `<svg style="${abs(x, y, s * 1.2, s, `transform:rotate(${rot}deg);filter:drop-shadow(10px 16px 12px rgba(40,25,30,.4));z-index:${z}`)}" viewBox="0 0 270 225" aria-hidden="true">
    <defs><radialGradient id="tea" cx=".4" cy=".35"><stop offset="0" stop-color="#bf8445"/><stop offset="1" stop-color="#8d5a2a"/></radialGradient></defs>
    <circle cx="112" cy="112" r="106" fill="#f4eee4" stroke="#d9cfbe" stroke-width="2"/><circle cx="112" cy="112" r="80" fill="none" stroke="#e3d9c6" stroke-width="3"/>
    <path d="M192 84 h34 a25 25 0 0 1 0 54 h-34" fill="none" stroke="#d8cdb9" stroke-width="24" stroke-linecap="round"/>
    <path d="M192 84 h34 a25 25 0 0 1 0 54 h-34" fill="none" stroke="#fbf7ee" stroke-width="18" stroke-linecap="round"/>
    <circle cx="112" cy="112" r="84" fill="#fbf8f1" stroke="#d8cdb9" stroke-width="2.5"/>
    <circle cx="112" cy="112" r="68" fill="url(#tea)"/><circle cx="112" cy="112" r="68" fill="none" stroke="#6f4620" stroke-opacity=".5" stroke-width="3"/>
    <path d="M62 96 A56 56 0 0 1 108 58" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="7" stroke-linecap="round"/></svg>`;
}

/** A small plant in an oatmeal pot, from above. */
function plant({ x, y, s = 260, rot = 0, z = 9 }) {
  const tones = ["#7f9a76", "#93ad88", "#6c8866"];
  let leaves = "";
  for (let k = 0; k < 11; k++) {
    const a = k * 32.7 + (k % 2 ? 9 : 0);
    const len = 104 - (k % 3) * 14;
    leaves += `<g transform="rotate(${a.toFixed(1)} 130 130)"><ellipse cx="130" cy="${130 - len * 0.5}" rx="${24 - (k % 3) * 2}" ry="${len * 0.5}" fill="${tones[k % 3]}"/><line x1="130" y1="130" x2="130" y2="${130 - len * 0.98}" stroke="#fff" stroke-opacity=".3" stroke-width="2.4"/></g>`;
  }
  let inner = "";
  for (let k = 0; k < 7; k++) {
    const a = k * 51.4 + 20;
    inner += `<g transform="rotate(${a.toFixed(1)} 130 130)"><ellipse cx="130" cy="${130 - 30}" rx="17" ry="32" fill="${tones[(k + 1) % 3]}"/><line x1="130" y1="130" x2="130" y2="${130 - 60}" stroke="#fff" stroke-opacity=".3" stroke-width="2"/></g>`;
  }
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(10px 16px 12px rgba(40,25,30,.4));z-index:${z}`)}" viewBox="0 0 260 260" aria-hidden="true">
    <circle cx="130" cy="130" r="108" fill="#e9ddc7" stroke="#cdbf9f" stroke-width="3"/><circle cx="130" cy="130" r="92" fill="#6b5b4a"/>${leaves}${inner}<circle cx="130" cy="130" r="7" fill="#5f7a5a"/></svg>`;
}

/** A small woven basket, from above. */
function basket({ x, y, s = 200, rot = 0, z = 9, tone = "#d9bf8a" }) {
  let weave = "", rad = "";
  for (let r = 66; r <= 96; r += 6) weave += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="rgba(110,80,35,.28)" stroke-width="2"/>`;
  for (let k = 0; k < 30; k++) rad += `<line x1="100" y1="${100 - 62}" x2="100" y2="${100 - 97}" stroke="rgba(110,80,35,.2)" stroke-width="2" transform="rotate(${k * 12} 100 100)"/>`;
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(8px 12px 9px rgba(40,25,30,.38));z-index:${z}`)}" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="bk${Math.round(x)}${Math.round(y)}" cx=".5" cy=".5"><stop offset=".6" stop-color="#7d6338"/><stop offset="1" stop-color="#a98d57"/></radialGradient></defs>
    <circle cx="100" cy="100" r="97" fill="${tone}"/>${weave}${rad}
    <circle cx="100" cy="100" r="60" fill="url(#bk${Math.round(x)}${Math.round(y)})"/><circle cx="100" cy="100" r="60" fill="none" stroke="#efdca8" stroke-width="6"/>
    <circle cx="100" cy="100" r="97" fill="none" stroke="rgba(110,80,35,.35)" stroke-width="2"/></svg>`;
}

/** A cloth napkin: a tinted rectangle with a hem line and a folded edge. */
function napkin({ x, y, w = 420, h = 300, rot = 0, color = "#cdd7c3", hem = "#a9b99f", stripe = "rgba(255,255,255,.55)", z = 3 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(160deg,${color},${hem});border-radius:6px;box-shadow:0 2px 3px rgba(30,40,30,.25),0 16px 24px rgba(30,40,30,.32);z-index:${z};overflow:hidden`)}">
    <div style="position:absolute;inset:14px;border:4px solid ${stripe};border-radius:3px"></div>
    <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0 1px,transparent 1px 6px)"></div>
    <div style="position:absolute;left:0;right:0;top:${h * 0.58}px;height:5px;background:rgba(0,0,0,.08);box-shadow:0 2px 6px rgba(0,0,0,.1)"></div>
    <div style="position:absolute;left:0;right:0;top:${h * 0.58 + 5}px;bottom:0;background:rgba(255,255,255,.1)"></div></div>`;
}

/** A wooden tray from above: a lip, a lighter floor, two handle cut-outs. */
function tray({ x, y, w, h, rot = 0, z = 3, floor = "#e7d3ad", floor2 = "#d9c295", wood = ["#c79d63", "#a9803f"] }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(10px 20px 18px rgba(40,25,30,.42))`)}">
    <div style="position:absolute;inset:0;border-radius:30px;background:linear-gradient(150deg,${wood[0]},${wood[1]})"></div>
    <div style="position:absolute;inset:0;border-radius:30px;background-image:repeating-linear-gradient(0deg,rgba(90,60,25,.1) 0 2px,transparent 2px 9px)"></div>
    <div style="position:absolute;inset:26px;border-radius:16px;background:linear-gradient(160deg,${floor},${floor2});box-shadow:inset 0 4px 10px rgba(80,50,20,.3),inset 0 0 0 2px rgba(255,255,255,.2)"></div>
</div>`;
}

/** A glass of water from above, with its soft light on the table. */
function glass({ x, y, s = 220, z = 9 }) {
  return `<div style="${abs(x + s * 0.18, y + s * 0.2, s * 1.0, s * 0.9, `background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,0));transform:rotate(30deg);z-index:${z - 1}`)}"></div>
  <svg style="${abs(x, y, s, s, `filter:drop-shadow(8px 12px 10px rgba(40,25,30,.32));z-index:${z}`)}" viewBox="0 0 200 200" aria-hidden="true">
    <defs><radialGradient id="wtr" cx=".4" cy=".35"><stop offset="0" stop-color="#e4f1f4"/><stop offset="1" stop-color="#a9cdd9"/></radialGradient></defs>
    <circle cx="100" cy="100" r="94" fill="rgba(255,255,255,.5)" stroke="rgba(120,150,162,.8)" stroke-width="4"/>
    <circle cx="100" cy="100" r="78" fill="url(#wtr)" stroke="rgba(120,150,162,.55)" stroke-width="3"/>
    <path d="M44 84 A58 58 0 0 1 96 42" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="9" stroke-linecap="round"/>
    <circle cx="124" cy="120" r="5" fill="#fff" fill-opacity=".7"/><circle cx="136" cy="104" r="3.5" fill="#fff" fill-opacity=".7"/><circle cx="112" cy="134" r="3" fill="#fff" fill-opacity=".7"/></svg>`;
}

/** A closed manila folder lying flat, with its tab. */
function folder({ x, y, w, h, rot = 0, z = 4, tone = ["#ebd49d", "#dcc283"], tabX = 28, tabW = 220 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(10px 18px 14px rgba(40,25,30,.38))`)}">
    <div style="${abs(tabX, -44, tabW, 60, `background:linear-gradient(${tone[0]},${tone[0]});border-radius:14px 14px 0 0`)}"></div>
    <div style="position:absolute;inset:0;border-radius:6px 16px 8px 8px;background:linear-gradient(160deg,${tone[0]},${tone[1]})"></div>
    <div style="position:absolute;inset:0;border-radius:6px 16px 8px 8px;box-shadow:inset 0 3px 0 rgba(255,255,255,.4),inset 14px 0 14px -12px rgba(90,60,20,.3),inset 0 -3px 0 rgba(110,80,30,.25)"></div>
    <div style="position:absolute;inset:0;border-radius:6px 16px 8px 8px;background-image:repeating-linear-gradient(0deg,rgba(120,90,30,.05) 0 1px,transparent 1px 6px)"></div></div>`;
}

/** A steel paperclip, standing at the folder's edge. */
const clip = ({ x, y, s = 1, rot = 0, z = 10 }) => `<svg style="${abs(x, y, 56 * s, 150 * s, `transform:rotate(${rot}deg);filter:drop-shadow(3px 5px 3px rgba(0,0,0,.3));z-index:${z}`)}" viewBox="0 0 56 150" aria-hidden="true"><path d="M16 110 V34 a12 12 0 0 1 24 0 V116 a20 20 0 0 1 -40 0 V44" transform="translate(8 6)" fill="none" stroke="#8f979c" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 110 V34 a12 12 0 0 1 24 0" transform="translate(8 6)" fill="none" stroke="#dfe4e6" stroke-width="2" stroke-linecap="round"/></svg>`;

/** A pencil lying flat. */
const pencil = ({ x, y, len = 380, rot = 0, body = "#d9a64a", z = 8 }) => `<svg style="${abs(x, y, len, 30, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(40,25,30,.35));z-index:${z}`)}" viewBox="0 0 ${len} 30" aria-hidden="true">
  <rect x="46" y="3" width="${len - 100}" height="24" rx="2" fill="${body}"/><rect x="46" y="3" width="${len - 100}" height="7" fill="#f1cc7a" opacity=".7"/><rect x="46" y="20" width="${len - 100}" height="7" fill="#9c7424" opacity=".5"/>
  <rect x="${len - 54}" y="3" width="16" height="24" fill="#bdb7bd"/><rect x="${len - 38}" y="3" width="26" height="24" rx="8" fill="${MUL}"/>
  <path d="M46 3 L2 15 L46 27 Z" fill="#e9cfa5"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;

/* ================================================================ #64 */
function p64() {
  const n = 64;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1ebee", textTop: 84, size: 88 });
  const [setTimer, ...restSub] = i.sub.split(". ");
  const afterSub = restSub.join(". ");

  const ground = cloth({ a: "#efe7ea", b: "#ded3d9", c: "#cfc3ca", weave: "rgba(110,80,95,.055)" }) + light({ rot: -26, op: 0.34 });

  // The pad: a graph-free ruled page under a coil binding, four rows with a box each.
  const PX = 46, PY = 436, PW = 664, PH = 850;
  const parts = i.items.map((s) => s.split(": "));
  const rowH = 150, rowTop = 200;
  const rows = parts.map(([when, what], k) => `<div style="position:absolute;left:40px;right:30px;top:${rowTop + k * rowH}px;height:${rowH}px;border-bottom:2px solid #e2d6dc">
      <div style="position:absolute;left:0;top:50px;width:62px;height:62px;border:5px solid ${INK};border-radius:9px;background:#fffdfa">${tick(62)}</div>
      <div class="hand" style="position:absolute;left:100px;top:6px;font:600 38px/1 'Hand',cursive;color:#7b6671">${esc(when)}:</div>
      <div class="hand" style="position:absolute;left:100px;top:34px;font:700 74px/1.1 'Hand',cursive;color:${INK};white-space:nowrap">${esc(what)}</div></div>`).join("");
  let coils = "";
  for (let k = 0; k < 13; k++) coils += `<div style="${abs(24 + k * 48, -26, 14, 58, "border:5px solid #a29aa0;border-radius:9px;background:linear-gradient(#e9e4e7,#b7aeb3);box-shadow:0 3px 4px rgba(0,0,0,.25)")}"></div><div style="${abs(32 + k * 48, 22, 16, 16, "border-radius:50%;background:#7c7077;box-shadow:inset 0 2px 3px rgba(0,0,0,.5)")}"></div>`;
  const pad = `
  <div style="${abs(PX + 22, PY + 18, PW, PH, "transform:rotate(1.4deg);background:#f4eef0;border-radius:10px;box-shadow:0 14px 22px rgba(40,25,30,.3);z-index:3")}"></div>
  <div style="${abs(PX, PY, PW, PH, "transform:rotate(-2deg);background:#fffdfa;border-radius:10px;box-shadow:0 2px 3px rgba(40,25,30,.3),0 28px 40px rgba(40,25,30,.42);z-index:4;background-image:repeating-linear-gradient(transparent 0 49px,rgba(150,135,155,.14) 49px 50px);background-position:0 40px")}">
    <div style="position:absolute;left:0;right:0;top:0;height:64px;border-radius:10px 10px 0 0;background:linear-gradient(#d7cad1,#c6b7bf)"></div>
    ${coils}
    <div style="position:absolute;left:100px;top:0;bottom:0;width:2px;background:#ecc6d1"></div>
    <div class="hand" style="position:absolute;left:44px;width:400px;top:74px;font:600 52px/1.02 'Hand',cursive;color:${MULD}">${esc(setTimer + ".")}</div>
    ${rows}
  </div>`;

  // The butter note stuck over the pad's top right corner.
  const sticky = note({ x: 584, y: 408, w: 350, h: 326, rot: 4.5, z: 8, check: "sticky",
    inner: `<div class="hand" style="position:absolute;left:32px;right:26px;top:44px;font:600 47px/1.04 'Hand',cursive;color:${INK}">${esc(afterSub)}</div>` });

  const tm = timer({ x: 676, y: 800, s: 310, rot: 9 });
  const pl = plant({ x: 712, y: 1100, s: 320, rot: 20 });
  const pn = pencil({ x: 120, y: 1306, len: 400, rot: -2 });

  const body = `${ground}${pad}${sticky}${tm}${pl}${pn}${fh}`;
  return { n, id: `${n}-weekly-reset-for-a-bad-week`, html: page(p, { body, css: fc, paper: "#f1ebee" }) };
}

/* ================================================================ #68 */
function p68() {
  const n = 68;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#eaede2", size: 76, textTop: 74 });
  const good = i.items.filter((s) => s.startsWith("Needs")).map((s) => s.split(": ")[1]);
  const bad = i.items.filter((s) => s.startsWith("Survives")).map((s) => s.split(": ")[1]);

  const ground = cloth({ a: "#cad6c1", b: "#adbfa6", c: "#9bb096", weave: "rgba(50,85,55,.08)", check: "rgba(255,255,255,.07)" }) + light({ rot: -30, op: 0.26, slat: 130, gap: 120 });

  // The long printed template: crowded with printed bars, the four lines struck through.
  const bars = (k0, count, seed) => {
    const r = rng(seed);
    return Array.from({ length: count }, (_, k) => {
      const w1 = 120 + r() * 170, w2 = 40 + r() * 80;
      return `<div style="position:absolute;left:30px;right:26px;top:${k0 + k * 36}px;height:18px"><div style="position:absolute;left:0;top:2px;width:14px;height:14px;border:2px solid #9aa0a0;border-radius:2px"></div><div style="position:absolute;left:28px;top:5px;width:${w1}px;height:8px;border-radius:4px;background:#c4c8c8"></div><div style="position:absolute;left:${40 + w1}px;top:5px;width:${w2}px;height:8px;border-radius:4px;background:#d4d7d7"></div></div>`;
    }).join("");
  };
  const struck = `<div style="position:absolute;left:30px;right:26px;top:262px;display:flex;flex-direction:column;gap:30px">` + good.map((t, k) => `<div style="display:flex;gap:14px;align-items:flex-start"><div style="flex:none;width:22px;height:22px;margin-top:5px;border:3px solid #7b8282;border-radius:3px"></div><div style="font:500 28px/1.18 'Plex',sans-serif;color:#4e5656;text-decoration:line-through;text-decoration-thickness:3px;text-decoration-color:${INK}">${esc(t)}</div></div>`).join("") + `</div>`;
  const sheet = `
  <div style="${abs(34, 508, 460, 790, "transform:rotate(-1.8deg);background:#fdfcf8;border-radius:5px;box-shadow:0 2px 3px rgba(20,40,20,.28),0 24px 34px rgba(20,40,20,.38);z-index:5;overflow:hidden")}">
    <div style="position:absolute;left:0;right:0;top:0;height:76px;background:#6b7a66;color:#fff"><div style="position:absolute;left:30px;top:20px;font:600 28px/1.2 'Plex',sans-serif" data-check="head1">Needs a good week</div></div>
    ${bars(104, 4, 11)}
    <div style="position:absolute;left:30px;right:26px;top:238px;height:2px;background:#d0d5d0"></div>
    ${struck}
    <div style="position:absolute;left:30px;right:26px;top:584px;height:2px;background:#d0d5d0"></div>
    ${bars(610, 5, 29)}
  </div>
  <div style="${abs(420, 484, 74, 74, `border-radius:50%;background:${INK};display:grid;place-items:center;z-index:9;transform:rotate(-2deg);box-shadow:0 4px 8px rgba(0,0,0,.35)`)}"><svg width="38" height="38" viewBox="0 0 38 38" aria-hidden="true"><path d="M8 8 L30 30 M30 8 L8 30" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/></svg></div>`;

  // One cream card on a wooden tray, the four lines ringed once in mulberry.
  const CW = 420, CH = 664;
  const lines = bad.map((t) => `<div class="hand" style="font:600 45px/44px 'Hand',cursive;color:${INK};margin-bottom:18px">${esc(t)}</div>`).join("");
  const onTray = card({ x: 552, y: 514, w: CW, h: CH, rot: 1, z: 6, rule: 62, top: 112,
    inner: `<div class="hand" style="position:absolute;left:34px;right:20px;top:34px;font:700 46px/1 'Hand',cursive;color:${MULD}">Survives a bad one</div>
    <div data-check="bad" style="position:absolute;left:58px;right:52px;top:190px;height:420px;z-index:2">${lines}</div>
    <div style="position:absolute;left:14px;top:128px;width:${CW - 28}px;height:520px;z-index:3">${ring(CW - 28, 520, { sw: 8, seed: 7, sq: 3.6, halo: "#fffaf0" })}</div>` });
  const tr = tray({ x: 510, y: 462, w: 560, h: 800, rot: 1.2, z: 4 });
  const okDisc = `<svg style="${abs(900, 480, 84, 84, "z-index:9;filter:drop-shadow(0 4px 5px rgba(0,0,0,.3))")}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${MUL}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const nap = napkin({ x: -70, y: 346, w: 440, h: 250, rot: -9, z: 3, color: "#f1e7d0", hem: "#e2d4b3", stripe: "rgba(134,88,106,.55)" });
  const mg = mug({ x: 800, y: 1150, s: 220, rot: -12, z: 7 });

  const body = `${ground}${nap}${tr}${sheet}${onTray}${okDisc}${mg}${fh}`;
  return { n, id: `${n}-weekly-reset-templates-good-week-vs-bad`, html: page(p, { body, css: fc, paper: "#eaede2" }) };
}

/* ================================================================ #70 */
function p70() {
  const n = 70;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f2eadb", split: "? ", size: 76, textTop: 84 });

  const ground = planks([["#dcc7a3", "#d2bb94"], ["#e3cfad", "#d9c29c"], ["#d6bf9a", "#cdb48b"], ["#dfcaa6", "#d5be96"], ["#d9c3a0", "#cfb88f"]]) + light({ rot: -22, op: 0.4, slat: 120, gap: 80, z: 2 });

  // The question card, taped above the calendar: the guide's own line.
  const q = card({ x: 56, y: 408, w: 640, h: 200, rot: -1.6, z: 8, rule: 60, top: 54, check: "question",
    inner: `<div class="hand" style="position:absolute;left:34px;right:26px;top:70px;font:700 56px/1.04 'Hand',cursive;color:${INK}">${esc(i.sub)}</div>` });
  const tp = tape(308, 394, 150, -2, "rgba(214,184,196,.9)", 12);

  // The calendar page lying flat: three weeks, the middle one left completely blank. No numerals.
  const CX = 30, CY = 606, CW = 870, CHh = 660, band = 58, cols = 7, rowsN = 3;
  const cw = CW / cols, rh = (CHh - band) / rowsN;
  const r = rng(41);
  let cells = "";
  for (let rr = 0; rr < rowsN; rr++) for (let cc = 0; cc < cols; cc++) {
    const blank = rr === 1;
    if (!blank && r() > 0.45) cells += `<svg style="${abs(cc * cw + 12, band + rr * rh + 20, cw - 24, rh - 80)}" viewBox="0 0 ${cw - 24} ${rh - 80}" aria-hidden="true">${scribbles(cw - 24, rh - 80, rng(100 + rr * 9 + cc), { rows: 2, x0: 0.04, y0: 0.2, span: 0.5, color: "#7a6a71", op: 0.38 })}</svg>`;
  }
  let lines = "";
  for (let c = 1; c < cols; c++) lines += `<div style="${abs(c * cw, band, 2, CHh - band, "background:#ded3d7")}"></div>`;
  for (let rr = 0; rr < rowsN; rr++) lines += `<div style="${abs(0, band + rr * rh, CW, 2, "background:#ded3d7")}"></div>`;
  const CUT = 120;
  const calendar = `
  <div style="${abs(CX, CY, CW, CHh, "transform:rotate(-1.1deg);filter:drop-shadow(8px 20px 18px rgba(60,35,25,.42));z-index:5")}">
    <div style="position:absolute;inset:0;background:#fffdf9;clip-path:polygon(0 0,100% 0,100% ${CHh - CUT}px,${CW - CUT}px 100%,0 100%)">
      <div style="position:absolute;left:0;right:0;top:0;height:${band}px;background:linear-gradient(#e7d4db,#dcc4ce)"></div>
      ${Array.from({ length: 9 }, (_, k) => `<div style="${abs(40 + k * 96, 16, 16, 26, "border-radius:50%;background:#5e4a52;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)")}"></div>`).join("")}
      ${lines}${cells}
    </div>
    <div style="${abs(CW - CUT, CHh - CUT, CUT, CUT, "background:linear-gradient(135deg,#efe6df,#d6c9bf 55%,#e6dcd2);clip-path:polygon(0 0,100% 0,0 100%);box-shadow:-6px -6px 14px rgba(0,0,0,.2)")}"></div>
  </div>`;

  // The following week: the answer on a butter note stuck to it.
  const sticky = note({ x: 96, y: 1062, w: 460, h: 262, rot: 2.4, z: 8, check: "answer",
    inner: `<div class="hand" style="position:absolute;left:34px;right:28px;top:34px;font:700 58px/1.02 'Hand',cursive;color:${INK}">${esc(i.items[1])}</div>` });

  const mg = mug({ x: 748, y: 394, s: 215, rot: 8, z: 7 });
  const pl = plant({ x: 872, y: 1096, s: 270, rot: -6, z: 7 });

  const body = `${ground}${calendar}${q}${tp}${sticky}${mg}${pl}${fh}`;
  return { n, id: `${n}-missed-a-week-of-your-reset`, html: page(p, { body, css: fc, paper: "#f2eadb" }) };
}

/* ================================================================ #92 */
function p92() {
  const n = 92;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f7ecef", size: 80, textTop: 50 });

  const ground = cloth({ a: "#f5e3e8", b: "#ecd0d9", c: "#e0bfca", weave: "rgba(130,70,95,.06)" }) + light({ rot: -20, op: 0.3, slat: 100, gap: 120, tint: "255,244,238" });

  const fl = folder({ x: 150, y: 560, w: 700, h: 560, rot: -6, z: 3 });
  const cl = clip({ x: 640, y: 508, s: 1.1, rot: -4, z: 4 });

  const CW = 700, CH = 520;
  const blank = (w, mr = 8) => `<span style="display:inline-block;width:${w}px;border-bottom:5px solid ${INK};height:56px;vertical-align:baseline;margin:0 ${mr}px 0 8px"></span>`;
  const idx = card({ x: 130, y: 604, w: CW, h: CH, rot: 1.6, z: 6, rule: 88, top: 56,
    inner: `<div class="hand" style="position:absolute;left:40px;right:120px;top:74px;font:600 38px/1.08 'Hand',cursive;color:#6a5660">${esc(i.items[0])}</div>
    <div class="hand" style="position:absolute;left:40px;right:30px;top:204px;font:700 84px/1.14 'Hand',cursive;color:${INK};white-space:nowrap">Dropped on${blank(250, 0)},<br>because${blank(380)}</div>` });
  const rb = `<div style="${abs(742, 576, 54, 190, "transform:rotate(8deg);z-index:9;filter:drop-shadow(4px 8px 6px rgba(40,25,30,.35))")}"><div style="position:absolute;inset:0;background:linear-gradient(90deg,${MULD},${MUL} 45%,#98697b);clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%)"></div></div>`;

  const sub = `<div class="serif" data-check="sub" style="${abs(80, 1194, 560, 110, "font:italic 400 38px/1.2 'Newsreader',serif;color:#5f3d4b;z-index:6")}">${esc(i.sub)}</div>`;
  const bk = basket({ x: 686, y: 1178, s: 138, rot: 0, z: 7 }) + basket({ x: 806, y: 1220, s: 124, rot: 30, z: 7, tone: "#d3b87f" }) + basket({ x: 774, y: 1090, s: 120, rot: 12, z: 7, tone: "#dec595" });

  const body = `${ground}${fl}${cl}${idx}${rb}${sub}${bk}${fh}`;
  return { n, id: `${n}-new-year-clear-out-close-a-project`, html: page(p, { body, css: fc, paper: "#f7ecef" }) };
}

/* ================================================================ #97 */
function p97() {
  const n = 97;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1efe4", size: 70, textTop: 54 });

  const ground = cloth({ a: "#7b957f", b: "#617c69", c: "#51695a", weave: "rgba(255,255,255,.045)" }) + light({ rot: -28, op: 0.17, slat: 140, gap: 120, tint: "255,248,228" });

  const [floorT, middleT, ceilT, stopT] = i.items.map((s) => s);
  const split = (s) => { const at = s.indexOf(": "); return at > 0 ? [s.slice(0, at), s.slice(at + 2)] : [null, s]; };
  const [fLab, fTxt] = split(floorT);
  const [cLab, cTxt] = split(ceilT);

  const stack = (c1, c2) => `0 5px 0 ${c2},0 10px 0 ${c1},0 15px 0 ${c2},0 20px 0 ${c1}`;
  const slab = ({ x, y, w, h, rot, fill, edge1, edge2, label, text, color, size, z, check }) => `<div data-check="${check}" style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${fill};border-radius:8px;z-index:${z};box-shadow:${stack(edge1, edge2)},0 34px 34px rgba(10,25,15,.4)`)}">
    <div style="position:absolute;left:36px;right:32px;top:22px"><div style="font:600 24px/1 'Plex',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${color};opacity:.82">${esc(label)}</div>
    <div class="hand" style="font:700 ${size}px/1.04 'Hand',cursive;color:${color};margin-top:8px">${esc(text)}</div></div></div>`;

  // Ceiling (top), middle, floor (bottom, mulberry): the stack seen edge-on.
  const ceiling = slab({ x: 150, y: 534, w: 740, h: 224, rot: -0.8, fill: "#fbf6e9", edge1: "#e5dcc6", edge2: "#fbf6e9", label: "The ceiling", text: cTxt.replace(/^./, (c) => c.toUpperCase()), color: INK, size: 46, z: 6, check: "ceiling" });
  const middle = slab({ x: 92, y: 800, w: 820, h: 190, rot: 0.9, fill: "#e6ecd9", edge1: "#c9d3b8", edge2: "#e6ecd9", label: "The middle", text: middleT, color: INK, size: 50, z: 7, check: "middle" });
  const floor = slab({ x: 52, y: 1032, w: 896, h: 150, rot: -0.5, fill: `linear-gradient(${MUL},#7a4e5f)`, edge1: MULD, edge2: MUL, label: fLab, text: fTxt.replace(/^./, (c) => c.toUpperCase()), color: "#fff6f0", size: 56, z: 8, check: "floor" });

  const nap = tray({ x: -26, y: 494, w: 1052, h: 728, rot: -0.6, z: 3, floor: "#c8d6c4", floor2: "#b3c4b0" });
  const stop = `<div class="hand" data-check="stop" style="${abs(86, 410, 460, 80, "font:700 66px/1 'Hand',cursive;color:#fbf3e4;z-index:7")}">${esc(stopT)}</div>
  <svg style="${abs(532, 446, 120, 120, "z-index:7;overflow:visible")}" viewBox="0 0 120 120" aria-hidden="true"><path d="M20 20 C 60 20, 84 46, 70 84" fill="none" stroke="#fbf3e4" stroke-width="7" stroke-linecap="round"/><path d="M50 74 L70 90 L88 66" fill="none" stroke="#fbf3e4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // A calendar corner with one Sunday square circled.
  const COLS = 7, CCW = 300, cellW = CCW / COLS;
  let grid = "";
  ["S", "M", "T", "W", "T", "F", "S"].forEach((d, k) => { grid += `<div style="${abs(k * cellW, 48, cellW, 34, "font:600 22px/34px 'Plex',sans-serif;text-align:center;color:#6a5a62")}">${d}</div>`; });
  for (let c = 1; c < COLS; c++) grid += `<div style="${abs(c * cellW, 84, 2, 180, "background:#ddd2d6")}"></div>`;
  for (let rr = 0; rr < 3; rr++) grid += `<div style="${abs(0, 84 + rr * 60, CCW, 2, "background:#ddd2d6")}"></div>`;
  const cal = `<div style="${abs(690, 346, CCW + 20, 260, "transform:rotate(5deg);z-index:6;filter:drop-shadow(8px 14px 12px rgba(10,25,15,.4))")}"><div style="position:absolute;left:0;top:0;width:${CCW}px;height:260px;background:#fffdf9;border-radius:6px">
    <div style="position:absolute;left:0;right:0;top:0;height:46px;background:linear-gradient(#e7d4db,#dcc4ce);border-radius:6px 6px 0 0"></div>${grid}
    <div style="${abs(2, 88, cellW - 2, 54)}">${ring(cellW + 14, 66, { sw: 5, seed: 5, sq: 2 }).replace("left:0px;top:0px", "left:-6px;top:-8px")}</div></div></div>`;

  const sub = `<div class="serif" data-check="sub" style="${abs(64, 1250, 872, 80, "font:italic 400 32px/1.22 'Newsreader',serif;color:#f6efe0;z-index:7")}">${esc(i.sub)}</div>`;

  const body = `${ground}${nap}${stop}${cal}${ceiling}${middle}${floor}${sub}${fh}`;
  return { n, id: `${n}-sunday-reset-floor-and-ceiling`, html: page(p, { body, css: fc, paper: "#f1efe4" }) };
}

/* ================================================================ #98 */
function p98() {
  const n = 98;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f5f1e8", split: "? ", size: 76, sub: i.sub, textTop: 54 });

  const ground = cloth({ a: "#fbf8f0", b: "#f0e9db", c: "#e5dccb", weave: "rgba(120,100,70,.045)" }) + light({ rot: -24, op: 0.55, slat: 160, gap: 140, tint: "255,255,250", blur: 10 });

  const mv = (w) => `<span style="color:${MUL};font-style:italic">${w}</span>`;
  const big = `<div class="serif" data-check="line" style="${abs(64, 410, 872, 560, `font:400 98px/1.07 'Newsreader',serif;letter-spacing:-.02em;text-wrap:balance;color:${INK};z-index:5`)}">The next smaller version is a single minute: ${mv("open")} the pile, ${mv("look")} at it, ${mv("close")} it.</div>`;

  const second = `<div class="hand" data-check="second" style="${abs(64, 1090, 430, 230, `font:600 43px/1.08 'Hand',cursive;text-wrap:balance;color:${MULD};z-index:5`)}">${esc(i.items[1])}</div>`;

  const fl = folder({ x: 500, y: 1052, w: 470, h: 300, rot: 4, z: 4, tabX: 30, tabW: 190 });
  const gl = glass({ x: 730, y: 1000, s: 210, z: 9 });

  const body = `${ground}${big}${second}${fl}${gl}${fh}`;
  return { n, id: `${n}-quiet-week-one-minute-reset`, html: page(p, { body, css: fc, paper: "#f5f1e8" }) };
}

export const pins = [p64(), p68(), p70(), p92(), p97(), p98()];
