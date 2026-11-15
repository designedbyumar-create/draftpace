/**
 * ADHD Life Companion guide pins, world w13: winter holidays.
 * Kraft wrapping, string, evergreen sprigs, gift tags, a returns box, a taped package, a candle.
 * Deep green, kraft and a little red-berry, with mulberry accents. No Santa, no logos.
 * #93  template-preview  a ruled page of four filled rows on kraft wrapping, a boxed gift and a returns label
 * #94  script-card       two stacked index cards on dark evergreen felt, a candle, a phone, a bill slip and pen
 * #96  question          kraft offer envelopes on pale sprig paper beside one index card of four answers
 * #100 checklist         a lined call note on berry wrapping, a phone face down, a taped returns box at the edge
 * #101 scenario          a phone on speaker, a butter note, an invitation card and two gift tags on green gingham
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

const W = {
  ink: "#231a1f",
  pine: "#1e4d33", pineDeep: "#12301f", pineMid: "#2d6a45", pineLight: "#3f8457",
  berry: "#a8283b", berryDeep: "#7a1f2e",
  kraftA: "#cfa877", kraftB: "#b98d5b", kraftDark: "#8f6a3f",
  cream: "#fffaf0", creamDeep: "#f3e9d3",
  twine: "#e0cb9c", twineDark: "#a98d58",
};

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** Header block (eyebrow, headline, optional sub) and footer band, as the finished pins have. */
function frame(i, { paper, size = 74, sub = null, textTop = 58, split = ": ", noEyebrow = false }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(split);
  if (!noEyebrow && at > 0) { eyebrow = i.headline.slice(0, at + (split === "? " ? 1 : 0)); head = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(20,30,20,.34);z-index:60}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(20,30,20,.34);z-index:60}
  .foot{z-index:62}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:61}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;color:${W.ink}}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4a4540;max-width:840px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d4549}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ surfaces */

/** Fibrous noise as a colour-washed overlay (paper, felt, cardboard). */
const grain = (id, x, y, w, h, { fx = 0.9, fy = 0.03, op = 0.25, seed = 2, rgb = "0.35 0.22 0.1", gain = 1.5, bias = -0.5, z = 1 } = {}) => {
  const [r, g, b] = rgb.split(" ");
  return `<svg style="${abs(x, y, w, h, `pointer-events:none;opacity:${op};z-index:${z}`)}" width="${w}" height="${h}" aria-hidden="true"><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 ${gain} ${bias}"/></filter><rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
};

const kraftSurface = () => `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 35% 25%,#d6b283,#c39a66 60%,#ab814f)")}"></div>
  ${grain("kg1", 0, SCENE_TOP, 1000, 1128, { fx: 0.7, fy: 0.7, op: 0.3, seed: 4, gain: 1.6, bias: -0.55 })}
  ${grain("kg2", 0, SCENE_TOP, 1000, 1128, { fx: 0.012, fy: 0.012, op: 0.22, seed: 9, gain: 2.2, bias: -0.8 })}`;

const feltSurface = () => `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(90% 70% at 75% 25%,#2a6445,#1a4430 55%,#0f2c1f)")}"></div>
  ${grain("fg1", 0, SCENE_TOP, 1000, 1128, { fx: 1.4, fy: 1.4, op: 0.5, seed: 7, rgb: "0.02 0.08 0.04", gain: 1.8, bias: -0.7 })}`;

const sprigPaper = () => {
  const r = rng(12);
  let s = "";
  for (let k = 0; k < 46; k++) {
    const x = ((k % 7) * 160 + (Math.floor(k / 7) % 2) * 80 + r() * 20 - 40);
    const y = SCENE_TOP + Math.floor(k / 7) * 160 + r() * 20 - 10;
    s += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(r() * 360).toFixed(0)})"><path d="M0 0 V34" stroke="#7fa08a" stroke-width="3" stroke-linecap="round"/>${[6, 14, 22, 30].map((yy, q) => `<path d="M0 ${yy} L-${13 - q * 2} ${yy - 9} M0 ${yy} L${13 - q * 2} ${yy - 9}" stroke="#86a893" stroke-width="3" stroke-linecap="round"/>`).join("")}</g>`;
  }
  return `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(100% 75% at 30% 20%,#fbfaf4,#eef0e6 65%,#e0e6d9);overflow:hidden")}"><svg style="position:absolute;left:0;top:0;opacity:.8" width="1000" height="1128" viewBox="0 ${SCENE_TOP} 1000 1128" aria-hidden="true">${s}</svg></div>`;
};

const berrySurface = () => {
  const r = rng(31);
  let dots = "";
  for (let k = 0; k < 160; k++) dots += `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(SCENE_TOP + r() * 1128).toFixed(0)}" r="${(2.5 + r() * 4).toFixed(1)}" fill="#f6e9d8" opacity="${(0.35 + r() * 0.4).toFixed(2)}"/>`;
  return `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(100% 75% at 70% 20%,#9a3140,#7a2230 60%,#5f1824)")}"></div>
  <svg style="position:absolute;left:0;top:0" width="1000" height="1500" viewBox="0 0 1000 1500" aria-hidden="true">${dots}</svg>
  ${grain("bg1", 0, SCENE_TOP, 1000, 1128, { fx: 0.9, fy: 0.9, op: 0.25, seed: 5, rgb: "0.2 0.02 0.05", gain: 1.4, bias: -0.5 })}`;
};

const gingham = () => `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-color:#e8efe2;background-image:linear-gradient(90deg,rgba(44,104,70,.5) 50%,transparent 50%),linear-gradient(0deg,rgba(44,104,70,.5) 50%,transparent 50%);background-size:90px 90px;transform-origin:50% 50%")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(100% 75% at 30% 15%,rgba(255,255,255,.28),rgba(20,50,30,.28))")}"></div>`;

/* ------------------------------------------------------------ props */

/** A fir sprig lying on the surface: needles on both sides of a stem, optional red berries. */
function fir({ x, y, len = 360, rot = 0, flip = false, berries = 0, seed = 1, z = 8, shadow = true }) {
  const r = rng(seed);
  const cols = [W.pineMid, W.pine, W.pineLight, "#245a3a"];
  const stem = (t) => ({ x: 14 + t * 372, y: (1 - t) ** 2 * 90 + 2 * (1 - t) * t * 70 + t * t * 80 });
  let needles = "";
  const N = 30;
  for (let k = 0; k <= N; k++) {
    const t = k / N, s0 = stem(t);
    const L = 60 * (1 - 0.6 * t) + 8 + r() * 6;
    for (const side of [-1, 1]) {
      const a = (side * (52 - 12 * t) + (r() - 0.5) * 8) * (Math.PI / 180);
      const ex = s0.x + Math.cos(a) * L, ey = s0.y + Math.sin(a) * L;
      const cx = s0.x + Math.cos(a) * L * 0.5 - side * -2, cy = s0.y + Math.sin(a) * L * 0.5;
      needles += `<path d="M${s0.x.toFixed(1)} ${s0.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${cols[(k + (side > 0 ? 1 : 0)) % 4]}" stroke-width="${(7 - 3 * t).toFixed(1)}" stroke-linecap="round" fill="none"/>`;
    }
  }
  const tip = stem(1);
  needles += [-14, 0, 14].map((d) => `<path d="M${tip.x} ${tip.y} L${(tip.x + 30).toFixed(0)} ${(tip.y + d * 0.6).toFixed(0)}" stroke="${W.pineLight}" stroke-width="5" stroke-linecap="round"/>`).join("");
  let bs = "";
  for (let k = 0; k < berries; k++) {
    const t = 0.3 + k * 0.1, s0 = stem(t);
    const bx = s0.x + (k % 2 ? 10 : -6), by = s0.y + (k % 2 ? 10 : -12);
    bs += `<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="11" fill="${W.berry}"/><circle cx="${(bx - 3.5).toFixed(1)}" cy="${(by - 4).toFixed(1)}" r="3.4" fill="#fff" opacity=".55"/>`;
  }
  const h = len * 0.4;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg) scaleX(${flip ? -1 : 1});z-index:${z};${shadow ? "filter:drop-shadow(5px 10px 6px rgba(10,25,15,.4))" : ""}`)}" viewBox="0 0 400 160" aria-hidden="true"><path d="M8 90 Q200 70 392 80" stroke="#5b4630" stroke-width="5" fill="none" stroke-linecap="round"/>${needles}<path d="M8 90 Q200 70 392 80" stroke="#5b4630" stroke-width="3" fill="none" stroke-linecap="round"/>${bs}</svg>`;
}

/** String laid on the surface: a path in pin coordinates, twisted by a dashed second stroke. */
function twine(d, { z = 5, w = 7, color = W.twine, dark = W.twineDark } = {}) {
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:${z};overflow:visible;pointer-events:none;filter:drop-shadow(4px 8px 4px rgba(30,15,0,.4))" viewBox="0 0 1000 1500" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${dark}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="3 6" opacity=".75"/></svg>`;
}

/** A small bow of string. */
function stringBow({ x, y, s = 1, rot = 0, z = 9, color = W.twine, dark = W.twineDark }) {
  const str = (d) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${dark}" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 6" opacity=".7"/>`;
  return `<svg style="${abs(x, y, 200 * s, 130 * s, `transform:rotate(${rot}deg);z-index:${z};overflow:visible;filter:drop-shadow(3px 6px 4px rgba(30,15,0,.4))`)}" viewBox="0 0 200 130" aria-hidden="true">
    ${str("M100 62 C 70 10, 8 14, 22 52 C 32 78, 78 70, 100 62")}${str("M100 62 C 130 10, 192 14, 178 52 C 168 78, 122 70, 100 62")}
    ${str("M100 64 C 92 90, 70 110, 40 126")}${str("M100 64 C 110 90, 134 108, 168 124")}
    <circle cx="100" cy="63" r="12" fill="${color}"/><circle cx="100" cy="63" r="12" fill="none" stroke="${dark}" stroke-width="4" stroke-dasharray="3 5" opacity=".7"/></svg>`;
}

/** A top-down gift box with a ribbon cross and bow. */
function giftBox({ x, y, s = 240, rot = 0, body = W.pine, ribbon = C.mulberry, z = 7 }) {
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(10px 16px 10px rgba(10,20,10,.45))`)}" viewBox="0 0 240 240" aria-hidden="true">
    <defs><linearGradient id="gb${z}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></linearGradient></defs>
    <rect x="14" y="14" width="212" height="212" rx="12" fill="${body}"/><rect x="14" y="14" width="212" height="212" rx="12" fill="url(#gb${z})"/>
    <rect x="14" y="14" width="212" height="14" rx="8" fill="#fff" opacity=".12"/>
    <rect x="98" y="14" width="44" height="212" fill="${ribbon}"/><rect x="14" y="98" width="212" height="44" fill="${ribbon}"/>
    <rect x="98" y="14" width="10" height="212" fill="#fff" opacity=".2"/><rect x="14" y="98" width="212" height="10" fill="#fff" opacity=".2"/>
    <g transform="translate(120 120)">
      <path d="M0 0 C -60 -70, -96 -26, -70 6 C -52 26, -20 14, 0 0Z" fill="${ribbon}"/><path d="M0 0 C -52 -50, -78 -22, -62 0 C -48 16, -22 10, 0 0Z" fill="#fff" opacity=".16"/>
      <path d="M0 0 C 60 -70, 96 -26, 70 6 C 52 26, 20 14, 0 0Z" fill="${ribbon}"/><path d="M0 0 C 52 -50, 78 -22, 62 0 C 48 16, 22 10, 0 0Z" fill="#000" opacity=".12"/>
      <path d="M-6 6 C -30 40, -50 64, -78 84 L -58 94 C -34 80, -14 52, 4 14Z" fill="${ribbon}"/><path d="M6 6 C 30 40, 50 64, 78 84 L 58 94 C 34 80, 14 52, -4 14Z" fill="${ribbon}"/>
      <circle r="17" fill="${ribbon}"/><circle r="17" fill="#fff" opacity=".18"/></g></svg>`;
}

/** A returns label: white, a barcode, an arrow, lines of no words. */
function returnsLabel({ x, y, w = 330, h = 200, rot = 0, z = 7 }) {
  const r = rng(6);
  let bars = "", ax = 22;
  while (ax < w - 120) { const bw = 3 + Math.floor(r() * 3) * 3; bars += `<rect x="${ax}" y="${h - 62}" width="${bw}" height="44" fill="#1b1b1d"/>`; ax += bw + 3 + Math.floor(r() * 3) * 2; }
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};background:#fdfcf8;box-shadow:0 2px 3px rgba(40,20,0,.35),0 14px 18px rgba(40,20,0,.38);border-radius:4px`)}">
    <div style="position:absolute;left:0;top:0;right:0;height:14px;background:${W.berry};border-radius:4px 4px 0 0"></div>
    <div style="position:absolute;right:18px;top:34px;width:84px;height:84px;border-radius:12px;background:${C.mulberry};display:grid;place-items:center">${icon("arrow-u-up-left", { size: 60, color: "#fffaf2", weight: "bold" })}</div>
    <svg style="position:absolute;left:0;top:0" width="${w}" height="${h}" aria-hidden="true">${bars}<rect x="22" y="36" width="${w - 170}" height="9" rx="4" fill="#9a958d"/><rect x="22" y="58" width="${w - 210}" height="9" rx="4" fill="#bdb8af"/></svg>
  </div>`;
}

/** A taped cardboard shipping box seen from above (the lid), with seam tape and a label. Cropped by the pin edge if placed there. */
function box({ x, y, w, h, rot = 0, z = 7, tapeAcross = true, label = true, labelTop = 34 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(12px 18px 12px rgba(30,10,0,.5))`)}">
    <div style="position:absolute;inset:0;border-radius:8px;background:linear-gradient(135deg,#c79a60,#a97b45)"></div>
    <div style="position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(90deg,rgba(90,55,20,.08) 0 3px,transparent 3px 8px)"></div>
    <div style="position:absolute;left:0;top:${h / 2 - 2}px;right:0;height:4px;background:rgba(70,40,10,.55)"></div>
    <div style="position:absolute;left:0;top:0;right:0;bottom:0;border-radius:8px;box-shadow:inset 0 0 0 6px rgba(255,235,200,.14),inset 0 -22px 30px rgba(60,30,5,.2)"></div>
    ${tapeAcross ? `<div style="position:absolute;left:-4px;right:-4px;top:${h / 2 - 34}px;height:68px;background:linear-gradient(180deg,rgba(236,222,190,.92),rgba(214,196,152,.92));box-shadow:0 2px 3px rgba(40,20,0,.3)"></div><div style="position:absolute;left:-4px;right:-4px;top:${h / 2 - 28}px;height:10px;background:rgba(255,255,255,.35)"></div>` : ""}
    ${label ? `<div style="position:absolute;left:34px;top:${labelTop}px;width:${Math.min(230, w - 80)}px;height:128px;background:#fdfcf8;box-shadow:0 2px 3px rgba(40,20,0,.35);border-radius:3px"><div style="position:absolute;left:16px;top:16px;width:62px;height:62px;border-radius:10px;background:${C.mulberry};display:grid;place-items:center">${icon("arrow-u-up-left", { size: 44, color: "#fffaf2", weight: "bold" })}</div><svg style="position:absolute;left:0;top:0" width="230" height="128" aria-hidden="true"><rect x="92" y="20" width="110" height="9" rx="4" fill="#9a958d"/><rect x="92" y="42" width="84" height="9" rx="4" fill="#bdb8af"/>${Array.from({ length: 22 }, (_, k) => `<rect x="${16 + k * 8}" y="92" width="${k % 3 ? 3 : 5}" height="22" fill="#1b1b1d"/>`).join("")}</svg></div>` : ""}
  </div>`;
}

/** An index card: cream, a berry top line, faint blue rules at `lh` pitch starting `ruleFrom` down. */
function idxCard({ x, y, w, h, rot = 0, z = 6, lh = 60, ruleFrom = 120, inner = "", check = "" }) {
  return `<div ${check ? `data-check="${check}"` : ""} style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};background:#fdf8ec;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 22px 30px rgba(0,0,0,.45);overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:10px;background:#e7a4ae"></div>
    <div style="position:absolute;left:0;right:0;top:${ruleFrom}px;bottom:0;background:repeating-linear-gradient(180deg,transparent 0 ${lh - 2}px,#c9d6dd ${lh - 2}px ${lh}px);opacity:.9"></div>
    ${inner}</div>`;
}

/** Flat phone seen from above. face "up" shows `screen` html; "down" shows the back with a camera island. */
function phoneFlat({ x, y, w = 260, rot = 0, face = "up", screen = "", back = "#5f3d4b", z = 6 }) {
  const h = Math.round(w * 2.08), rad = w * 0.15;
  const body = face === "up"
    ? `<div style="position:absolute;inset:0;border-radius:${rad}px;background:linear-gradient(145deg,#3c4146,#14171a)"></div>
       <div style="position:absolute;left:${w * 0.035}px;top:${w * 0.035}px;right:${w * 0.035}px;bottom:${w * 0.035}px;border-radius:${rad * 0.78}px;background:#0b0d0f;overflow:hidden;box-shadow:inset 0 0 0 2px #000">${screen}<div style="position:absolute;left:-30%;top:-30%;width:80%;height:200%;transform:rotate(16deg);background:linear-gradient(90deg,rgba(255,255,255,.1),rgba(255,255,255,0) 60%)"></div></div>
       <div style="position:absolute;left:${w * 0.36}px;top:${w * 0.06}px;width:${w * 0.28}px;height:${w * 0.07}px;border-radius:99px;background:#000"></div>`
    : `<div style="position:absolute;inset:0;border-radius:${rad}px;background:linear-gradient(145deg,${back},#3a2530)"></div>
       <div style="position:absolute;inset:0;border-radius:${rad}px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.1),inset 0 -30px 40px rgba(0,0,0,.18)"></div>
       <div style="position:absolute;left:${w * 0.07}px;top:${w * 0.07}px;width:${w * 0.46}px;height:${w * 0.46}px;border-radius:${w * 0.1}px;background:rgba(10,8,10,.55);box-shadow:inset 0 0 0 3px rgba(255,255,255,.12)">
         ${[[0.07, 0.07], [0.07, 0.25], [0.25, 0.16]].map(([a, b]) => `<div style="position:absolute;left:${w * a}px;top:${w * b}px;width:${w * 0.14}px;height:${w * 0.14}px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4a5058,#08090b 70%);box-shadow:0 0 0 3px #6b6f76"></div>`).join("")}</div>
       <div style="position:absolute;left:${w * 0.42}px;top:${h * 0.62}px;width:${w * 0.16}px;height:${w * 0.16}px;border-radius:50%;background:rgba(255,255,255,.14)"></div>`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(14px 20px 14px rgba(0,0,0,.5))`)}">${body}</div>`;
}

/** A pen lying flat with a clip. */
function pen({ x, y, len = 360, rot = 0, color = "#2f3a4a", z = 9 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(10,20,25,.45));z-index:${z}`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${color}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 170}" y="2" width="120" height="7" rx="3.5" fill="#c9ccd2"/><rect x="${len - 62}" y="9" width="12" height="16" rx="3" fill="#c9ccd2"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#22252b"/></svg>`;
}

/** A candle in a tin, from above: tin rim, cream wax, a wick and a small flame with a warm halo. */
function candle({ x, y, d = 150, z = 8, halo = 520 }) {
  const c = d / 2;
  return `<div style="${abs(x - (halo - d) / 2, y - (halo - d) / 2, halo, halo, `z-index:3;background:radial-gradient(circle,rgba(255,196,110,.5) 0,rgba(255,176,80,.24) 28%,rgba(255,170,70,0) 62%);pointer-events:none`)}"></div>
  <svg style="${abs(x, y, d, d, `z-index:${z};filter:drop-shadow(8px 14px 9px rgba(0,0,0,.5))`)}" viewBox="0 0 150 150" aria-hidden="true">
    <defs><radialGradient id="cw${z}" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#fff3d6"/><stop offset="1" stop-color="#e8cf9b"/></radialGradient>
    <radialGradient id="cf${z}" cx="50%" cy="60%" r="55%"><stop offset="0" stop-color="#fff7c8"/><stop offset=".5" stop-color="#ffc24a"/><stop offset="1" stop-color="#ff8a1c" stop-opacity="0"/></radialGradient></defs>
    <circle cx="75" cy="75" r="72" fill="#b8bcc0"/><circle cx="75" cy="75" r="72" fill="none" stroke="#e7eaec" stroke-width="3"/>
    <circle cx="75" cy="75" r="62" fill="#8a8f95"/><circle cx="75" cy="75" r="58" fill="url(#cw${z})"/>
    <ellipse cx="75" cy="75" rx="30" ry="30" fill="#f6e2b0" opacity=".7"/>
    <path d="M75 76 q3 -8 0 -14" stroke="#3a2d22" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="75" cy="66" rx="13" ry="19" fill="url(#cf${z})"/><ellipse cx="75" cy="70" rx="4.5" ry="9" fill="#fffbe4"/></svg>`;
}

/** A kraft gift tag with a reinforced hole and a string loop. `inner` is html in the tag body. */
function giftTag({ x, y, w = 280, h = 200, rot = 0, tone = ["#d8b685", "#c69e68"], inner = "", z = 8, check = "", loop = true, ring = "#f3e9d3" }) {
  const holeX = h * 0.28, holeY = h / 2;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(5px 10px 7px rgba(10,20,10,.42))`)}">
    ${loop ? `<svg style="position:absolute;left:${-80}px;top:${holeY - 60}px;overflow:visible" width="130" height="120" aria-hidden="true"><path d="M${80 + holeX} 60 C ${40 + holeX} 10, -20 20, -40 66 C -50 96, 10 110, 40 92" fill="none" stroke="${W.twine}" stroke-width="7" stroke-linecap="round"/><path d="M${80 + holeX} 60 C ${40 + holeX} 10, -20 20, -40 66 C -50 96, 10 110, 40 92" fill="none" stroke="${W.twineDark}" stroke-width="7" stroke-linecap="round" stroke-dasharray="3 6" opacity=".7"/></svg>` : ""}
    <div ${check ? `data-check="${check}"` : ""} style="position:absolute;inset:0;clip-path:polygon(0 50%,${h * 0.28}px 0,100% 0,100% 100%,${h * 0.28}px 100%);background:linear-gradient(165deg,${tone[0]},${tone[1]});overflow:hidden">
      <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(90,55,20,.05) 0 3px,transparent 3px 7px)"></div>
      <div style="position:absolute;left:${h * 0.28 + 8}px;top:0;right:0;height:12px;background:rgba(255,255,255,.18)"></div>
      <div style="position:absolute;left:${holeX - 21}px;top:${holeY - 21}px;width:42px;height:42px;border-radius:50%;background:${ring};box-shadow:0 0 0 2px rgba(120,80,30,.35) inset"></div>
      <div style="position:absolute;left:${holeX - 11}px;top:${holeY - 11}px;width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#5d4528,#2a1d10);box-shadow:inset 0 2px 3px rgba(0,0,0,.6)"></div>
    </div>${inner}</div>`;
}

const tape = (x, y, w = 150, rot = 0, c = "rgba(236,232,214,.82)", z = 12) => `<div style="${abs(x, y, w, 40, `transform:rotate(${rot}deg);background:${c};box-shadow:0 2px 4px rgba(0,0,0,.28);z-index:${z}`)}"></div>`;

const exTag = (x, y, rot = 0, z = 40) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

const tickDisc = (x, y, s = 60, z = 20) => `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 3px 4px rgba(0,0,0,.3))`)}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ================================================================ #93 */
function p93() {
  const n = 93;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3e8d5", size: 68, sub: i.sub, textTop: 46 });

  // Four filled rows: thing | what is waiting on it | pile.
  const rows = i.items.map((it) => {
    const m = it.match(/^(.*?): (.*) \((.*)\)$/);
    return { thing: m[1], waiting: m[2], pile: m[3] };
  });
  const COL = [{ x: 30, w: 236 }, { x: 292, w: 330 }, { x: 640, w: 160 }];
  const HEAD = ["The thing", "What is waiting on it", "Pile"];
  const ROW0 = 150, RH = 152;
  const heads = HEAD.map((t, k) => `<div style="position:absolute;left:${COL[k].x}px;top:92px;width:${COL[k].w}px;font:600 22px/1.15 'Plex',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${k === 2 ? C.mulberryDeep : "#6d655a"}">${esc(t)}</div>`).join("");
  const rowsHtml = rows.map((rw, k) => {
    const y = ROW0 + k * RH;
    return `<div style="position:absolute;left:22px;right:22px;top:${y + RH - 4}px;height:2px;background:#d6cdbd"></div>
    <div class="hand" style="position:absolute;left:${COL[0].x}px;top:${y + 8}px;width:${COL[0].w}px;font:600 43px/1.02 'Hand',cursive;color:${W.ink}">${esc(rw.thing)}</div>
    <div class="hand" style="position:absolute;left:${COL[1].x}px;top:${y + 8}px;width:${COL[1].w}px;font:500 40px/1.02 'Hand',cursive;color:#3b352f">${esc(rw.waiting)}</div>
    <div class="hand" style="position:absolute;left:${COL[2].x}px;top:${y + 4}px;width:${COL[2].w}px;font:700 50px/1.02 'Hand',cursive;color:${C.mulberry}">${esc(rw.pile)}</div>`;
  }).join("");
  const dividers = [COL[1].x - 14, COL[2].x - 14].map((x) => `<div style="position:absolute;left:${x}px;top:80px;width:2px;height:${ROW0 + 4 * RH - 84}px;background:#d6cdbd"></div>`).join("");
  const pileWash = `<div style="position:absolute;left:${COL[2].x - 12}px;top:80px;width:${COL[2].w + 32}px;height:${ROW0 + 4 * RH - 84}px;background:rgba(134,88,106,.08)"></div>`;

  const pg = `<div style="${abs(66, 424, 820, 800, "transform:rotate(-1.4deg);z-index:10")}">
    <div style="position:absolute;inset:0;background:${W.cream};border-radius:6px;box-shadow:0 2px 3px rgba(50,30,5,.35),0 30px 40px rgba(50,30,5,.4)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:10px;background:${W.pine};border-radius:6px 6px 0 0"></div>
    <div data-check="table" style="position:absolute;left:0;top:0;width:820px;height:800px;overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:${ROW0 - 8}px;height:2px;background:#bfb59f"></div>
      ${pileWash}${dividers}${heads}${rowsHtml}
      <div style="position:absolute;left:30px;top:24px">${exTag(0, 0, 0).replace("position:absolute;left:0px;top:0px;", "position:relative;")}</div>
    </div>
  </div>`;

  // Wrapping: string runs under the page and ties to a bow at the gift box.
  const str1 = twine("M-30 1200 C 160 1290, 420 1210, 760 1262 C 800 1268, 820 1250, 850 1226", { z: 5, w: 9 });
  const str2 = twine("M1030 392 C 900 420, 920 480, 1030 520", { z: 5, w: 9 });
  const gift = giftBox({ x: 706, y: 1080, s: 262, rot: 8, body: W.pine, ribbon: C.mulberry, z: 14 });
  const label = returnsLabel({ x: 50, y: 1212, w: 330, h: 124, rot: -3, z: 9 });
  const sprigA = fir({ x: 590, y: 380, len: 400, rot: 14, seed: 5, berries: 3, z: 15 });
  const sprigB = fir({ x: 340, y: 1262, len: 330, rot: -6, seed: 9, flip: true, z: 12 });

  const body = `${kraftSurface()}${str1}${str2}${label}${pg}${tape(40, 424, 110, -42, "rgba(236,232,214,.85)", 16)}${gift}${sprigB}${sprigA}${fh}`;
  return { n, id: `${n}-after-the-holidays-a-late-list-sorted-in-two-minutes`, html: page(p, { body, css: fc, paper: "#f3e8d5" }) };
}

/* ================================================================ #94 */
function p94() {
  const n = 94;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e4ece3", size: 76, sub: i.sub, textTop: 46, split: "? " });

  const quote = (s, color = C.mulberry) => `<svg style="position:absolute;left:34px;top:26px" width="${s}" height="${s * 0.8}" viewBox="0 0 80 64" aria-hidden="true"><path d="M2 40 C2 20 14 6 32 2 L34 12 C24 16 20 22 20 30 L34 30 L34 62 L2 62Z M44 40 C44 20 56 6 74 2 L76 12 C66 16 62 22 62 30 L76 30 L76 62 L44 62Z" transform="scale(.82) translate(0 -2)" fill="${color}"/></svg>`;

  const first = idxCard({
    x: 34, y: 408, w: 676, h: 520, rot: -2, z: 12, lh: 62, ruleFrom: 150, check: "card",
    inner: `${quote(86)}
      <div class="serif" data-check="first" style="position:absolute;left:44px;right:36px;top:116px;font:500 49px/62px 'Newsreader',Georgia,serif;color:${W.ink};letter-spacing:-.005em">${esc(i.items[0])}<span style="color:${C.mulberry};font-weight:700">”</span></div>
      <div style="position:absolute;right:20px;top:26px">${exTag(0, 0).replace("position:absolute;left:0px;top:0px;", "position:relative;")}</div>`,
  });
  const second = idxCard({
    x: 70, y: 892, w: 640, h: 262, rot: 1.8, z: 10, lh: 50, ruleFrom: 62, check: "card2",
    inner: `<div class="serif" data-check="second" style="position:absolute;left:36px;right:32px;top:56px;font:500 35px/50px 'Newsreader',Georgia,serif;color:#33292d"><span style="color:${C.mulberry};font-weight:700">“</span>${esc(i.items[1])}<span style="color:${C.mulberry};font-weight:700">”</span></div>`,
  });

  const phone = phoneFlat({
    x: 752, y: 430, w: 214, rot: 7, z: 11, face: "up",
    screen: `<div style="position:absolute;inset:0;background:linear-gradient(160deg,#4d3340,#1d1318)"></div>
      <div style="position:absolute;left:50%;top:34%;transform:translateX(-50%);width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center">${icon("phone", { size: 56, color: "#f1e7eb", weight: "fill" })}</div>
      <div style="position:absolute;left:30px;right:30px;top:58%;height:10px;border-radius:5px;background:rgba(255,255,255,.18)"></div>
      <div style="position:absolute;left:52px;right:52px;top:62%;height:10px;border-radius:5px;background:rgba(255,255,255,.1)"></div>`,
  });

  // A bill slip with a pen lying across its top, clipped to it.
  const slip = `<div style="${abs(756, 946, 206, 292, "transform:rotate(-4deg);z-index:10;background:#fdfbf4;box-shadow:0 2px 3px rgba(0,0,0,.4),0 18px 24px rgba(0,0,0,.45)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:30px;background:${W.berry}"></div>
    <svg style="position:absolute;left:0;top:30px" width="206" height="262" aria-hidden="true">${[40, 64, 88].map((y, k) => `<rect x="18" y="${y}" width="${[150, 120, 134][k]}" height="9" rx="4" fill="#b9b4aa"/>`).join("")}<rect x="18" y="130" width="170" height="2" fill="#d7d2c8"/>${[150, 174, 198].map((y, k) => `<rect x="18" y="${y}" width="${[100, 140, 80][k]}" height="9" rx="4" fill="#cfcac0"/>`).join("")}<rect x="118" y="226" width="70" height="14" rx="4" fill="${W.berryDeep}" opacity=".55"/></svg></div>`;
  const penOnSlip = pen({ x: 716, y: 1004, len: 290, rot: -10, color: W.pineMid, z: 13 });

  const cd = candle({ x: 76, y: 1214, d: 118, z: 14, halo: 560 });
  const sprig = fir({ x: 250, y: 1232, len: 400, rot: -4, seed: 14, berries: 3, z: 9 });
  const sprig2 = "";
  const glowTop = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(60% 40% at 8% 94%,rgba(255,190,100,.2),transparent 70%);z-index:2;pointer-events:none")}"></div>`;

  const body = `${feltSurface()}${glowTop}${sprig2}${second}${first}${phone}${slip}${penOnSlip}${sprig}${cd}${fh}`;
  return { n, id: `${n}-bill-slipped-over-the-holidays-what-to-say`, html: page(p, { body, css: fc, paper: "#e4ece3" }) };
}

/* ================================================================ #96 */
function p96() {
  const n = 96;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#edf0e8", size: 80, sub: i.sub, textTop: 48, split: "? " });

  // Kraft envelopes: one open flap, one with a window and an offer stamp, one plain.
  const env = ({ x, y, w, rot, kind, z }) => {
    const h = Math.round(w * 0.66);
    const flap = kind === "open"
      ? `<svg style="position:absolute;left:0;top:${-h * 0.5}px" width="${w}" height="${h * 0.55}" viewBox="0 0 ${w} ${h * 0.55}" aria-hidden="true"><path d="M0 ${h * 0.55} L${w / 2} 4 L${w} ${h * 0.55}Z" fill="#d2ad7c"/><path d="M${w * 0.12} ${h * 0.55} L${w / 2} ${h * 0.12} L${w * 0.88} ${h * 0.55}Z" fill="#a9824f" opacity=".55"/></svg>`
      : `<svg style="position:absolute;left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M0 0 L${w / 2} ${h * 0.55} L${w} 0" fill="none" stroke="rgba(100,65,25,.35)" stroke-width="3"/><path d="M0 ${h} L${w * 0.42} ${h * 0.5} M${w} ${h} L${w * 0.58} ${h * 0.5}" stroke="rgba(100,65,25,.22)" stroke-width="3" fill="none"/></svg>`;
    const win = kind === "window"
      ? `<div style="position:absolute;left:${w * 0.07}px;top:${h * 0.2}px;width:${w * 0.46}px;height:${h * 0.34}px;border-radius:6px;background:#f6f1e3;box-shadow:inset 0 0 0 4px #b69063,inset 0 3px 6px rgba(80,50,10,.35)"><svg style="position:absolute;left:0;top:0" width="${w * 0.46}" height="${h * 0.34}" aria-hidden="true"><rect x="16" y="20" width="${w * 0.3}" height="9" rx="4" fill="#b7b1a4"/><rect x="16" y="42" width="${w * 0.22}" height="9" rx="4" fill="#cdc8bb"/><rect x="16" y="64" width="${w * 0.26}" height="9" rx="4" fill="#cdc8bb"/></svg></div>
         <div data-check="stamp" style="position:absolute;left:${w * 0.07}px;top:${h * 0.64}px;transform:rotate(-4deg);padding:5px 12px;border:4px solid ${W.berry};border-radius:8px;color:${W.berry};font:700 25px/1.1 'Plex',sans-serif;letter-spacing:.06em;text-transform:uppercase;opacity:.92">Pre-approved</div>`
      : kind === "open" ? `<svg style="position:absolute;left:0;top:0" width="${w}" height="${h}" aria-hidden="true"><rect x="${w * 0.12}" y="${h * 0.58}" width="${w * 0.4}" height="9" rx="4" fill="rgba(100,65,25,.3)"/><rect x="${w * 0.12}" y="${h * 0.7}" width="${w * 0.3}" height="9" rx="4" fill="rgba(100,65,25,.22)"/></svg>` : "";
    const inside = kind === "open" ? `<div style="position:absolute;left:8%;right:8%;top:-24px;height:50px;background:#fdf9ee;border-radius:3px 3px 0 0;box-shadow:inset 0 -6px 8px rgba(80,50,10,.18)"></div>` : "";
    return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(8px 14px 9px rgba(40,25,5,.4))`)}">
      ${kind === "open" ? flap : ""}${inside}
      <div style="position:absolute;inset:0;border-radius:5px;background:linear-gradient(150deg,#d9b685,#c19a66);overflow:hidden"><div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(90,55,20,.06) 0 2px,transparent 2px 6px)"></div>${kind === "open" ? "" : flap}${win}</div>
    </div>`;
  };

  const e1 = env({ x: 8, y: 478, w: 420, rot: -8, kind: "window", z: 4 });
  const e2 = env({ x: -40, y: 880, w: 400, rot: 6, kind: "open", z: 5 });
  const e3 = env({ x: -80, y: 1170, w: 430, rot: -4, kind: "plain", z: 4 });

  // The card: United States only, then the four answers, one mulberry tick.
  const answers = i.items.map((t, k) => `<div style="position:relative;padding-left:${k === 0 ? 0 : 0}px;display:flex;gap:16px;align-items:flex-start;margin-top:${k ? 28 : 0}px">
      <div style="flex:0 0 auto;width:52px;height:52px;margin-top:-2px;display:grid;place-items:center">${k === 0 ? `<svg width="52" height="52" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>` : `<span style="width:18px;height:18px;border-radius:50%;background:${W.pine};opacity:.75"></span>`}</div>
      <div style="font:500 33px/45px 'Plex',sans-serif;color:#2e2a2c">${esc(t)}</div></div>`).join("");
  const card = `<div style="${abs(338, 424, 630, 840, "transform:rotate(1.2deg);z-index:12")}">
    <div style="position:absolute;inset:0;background:#fdf8ec;border-radius:8px;box-shadow:0 2px 3px rgba(30,40,25,.35),0 28px 38px rgba(30,40,25,.38)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:12px;background:#e7a4ae;border-radius:8px 8px 0 0"></div>
    <div data-check="answers" style="position:absolute;left:0;top:0;width:630px;height:840px;overflow:hidden">
      <div style="position:absolute;left:38px;top:44px;right:38px;padding-bottom:18px;border-bottom:3px solid #d5dde1"><div class="serif" style="font:500 52px/1.05 'Newsreader',Georgia,serif;color:${W.ink}">United States only</div></div>
      <div style="position:absolute;left:38px;right:36px;top:150px">${answers}</div>
    </div>
  </div>`;

  const sprig = fir({ x: 560, y: 1262, len: 420, rot: -6, seed: 21, berries: 3, z: 14 });
  const sprig2 = fir({ x: 180, y: 392, len: 330, rot: 18, seed: 30, z: 3, flip: true });
  const body = `${sprigPaper()}${e1}${e2}${e3}${sprig2}${card}${sprig}${fh}`;
  return { n, id: `${n}-pre-approved-credit-offers-you-can-cut-most`, html: page(p, { body, css: fc, paper: "#edf0e8" }) };
}

/* ================================================================ #100 */
function p100() {
  const n = 100;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f4e6e6", size: 72, textTop: 50 });

  const LH = 60;
  const lines = i.items.map((t, k) => {
    const withUnderline = k === 1
      ? t.replace("the reference number.", `<span style="text-decoration:underline;text-decoration-color:${C.mulberry};text-decoration-thickness:6px;text-underline-offset:9px;text-decoration-skip-ink:none">the reference number</span>.`)
      : esc(t);
    return `<div style="position:relative;display:flex;gap:18px;align-items:flex-start;margin-bottom:${k < 4 ? 20 : 0}px">
      <div style="flex:0 0 auto;width:42px;height:42px;margin-top:8px;border:4px solid ${W.ink};border-radius:7px;background:#fffdf6"></div>
      <div class="hand" style="font:600 46px/${LH}px 'Hand',cursive;color:${W.ink};text-wrap:balance">${withUnderline}</div></div>`;
  }).join("");

  const pad = `<div style="${abs(50, 410, 730, 900, "transform:rotate(1deg);z-index:10")}">
    <div style="position:absolute;inset:0;background:#fffdf4;border-radius:6px;box-shadow:0 2px 3px rgba(50,10,15,.4),0 30px 42px rgba(40,5,10,.5)"></div>
    <div style="position:absolute;inset:0;border-radius:6px;background:repeating-linear-gradient(180deg,transparent 0 ${LH - 2}px,#c4d3dc ${LH - 2}px ${LH}px);background-position:0 44px;opacity:.85"></div>
    <div style="position:absolute;left:84px;top:0;bottom:0;width:3px;background:#e59aa5"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:34px;background:${C.mulberry};border-radius:6px 6px 0 0;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)"></div>
    <div data-check="lines" style="position:absolute;left:30px;right:34px;top:70px;bottom:150px;overflow:hidden">${lines}</div>
    <div class="hand" data-check="sub" style="position:absolute;left:104px;right:150px;bottom:34px;font:600 40px/48px 'Hand',cursive;color:${C.mulberryDeep}">${esc(i.sub)}</div>
  </div>`;

  const bx = box({ x: 770, y: 392, w: 340, h: 380, rot: 6, z: 8, label: true, labelTop: 236 });
  const phone = phoneFlat({ x: 770, y: 980, w: 204, rot: 12, face: "down", back: "#5f3d4b", z: 14 });
  // A green ribbon band across the berry paper, behind everything.
  const ribbon = `<div style="${abs(-100, 1150, 1300, 70, `transform:rotate(-16deg);background:linear-gradient(180deg,${W.pineMid},${W.pine});box-shadow:0 6px 10px rgba(0,0,0,.35);z-index:2;transform-origin:0 0`)}"></div>`;

  const body = `${berrySurface()}${ribbon}${bx}${pad}${phone}${fh}`;
  return { n, id: `${n}-holiday-refund-or-return-call-the-two-minute-note`, html: page(p, { body, css: fc, paper: "#f4e6e6" }) };
}

/* ================================================================ #101 */
function p101() {
  const n = 101;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9efe5", size: 74, sub: i.sub, textTop: 46 });

  const phone = phoneFlat({
    x: 82, y: 424, w: 300, rot: -7, z: 8, face: "up",
    screen: `<div style="position:absolute;inset:0;background:linear-gradient(170deg,#2a2630,#15131a)"></div>
      <div style="position:absolute;left:50%;top:15%;transform:translateX(-50%);width:128px;height:128px;border-radius:50%;background:rgba(255,255,255,.12);display:grid;place-items:center">${icon("user", { size: 76, color: "#d9d2de", weight: "fill" })}</div>
      <div style="position:absolute;left:0;right:0;top:34%;display:grid;place-items:center">${icon("speaker-high", { size: 74, color: "#f1e7eb", weight: "fill" })}</div>
      <div style="position:absolute;left:34px;right:34px;top:60%;display:flex;justify-content:space-around">${["microphone-slash", "dots-nine"].map((nm) => `<div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.14);display:grid;place-items:center">${icon(nm, { size: 40, color: "#e6dfe8", weight: "bold" })}</div>`).join("")}</div>
      <div style="position:absolute;left:50%;bottom:7%;transform:translateX(-50%);width:84px;height:84px;border-radius:50%;background:${W.berry};display:grid;place-items:center">${icon("phone-disconnect", { size: 46, color: "#fff", weight: "fill" })}</div>`,
  });

  const noteHtml = `<div data-check="pause" style="${abs(86, 818, 330, 318, "transform:rotate(5deg);background:linear-gradient(172deg,#f8e8a6,#efcf72);z-index:20;box-shadow:0 1px 2px rgba(0,0,0,.35),0 14px 18px rgba(20,30,15,.42)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.22)"></div>
    <div class="hand" style="position:absolute;left:26px;right:10px;top:40px;font:700 62px/62px 'Hand',cursive;color:#3a2f1c">${esc(i.items[1])}</div></div>`;

  // The invitation: a green-bordered card with a sprig, its text only suggested.
  const invite = `<div style="${abs(548, 416, 392, 310, "transform:rotate(4deg);z-index:9;background:#fffaf0;box-shadow:0 2px 3px rgba(20,30,15,.4),0 22px 30px rgba(20,30,15,.42);border-radius:6px")}">
    <div style="position:absolute;inset:14px;border:4px solid ${W.pine};border-radius:3px"></div><div style="position:absolute;inset:24px;border:2px solid ${W.pineMid};border-radius:2px;opacity:.6"></div>
    <svg style="position:absolute;left:0;top:0" width="392" height="330" viewBox="0 0 392 330" aria-hidden="true">
      <g transform="translate(196 90)"><path d="M0 40 V-30" stroke="#5b4630" stroke-width="4" stroke-linecap="round"/>${[-24, -8, 8, 24].map((yy, q) => `<path d="M0 ${yy} L-${30 - q * 2} ${yy - 22} M0 ${yy} L${30 - q * 2} ${yy - 22}" stroke="${W.pineMid}" stroke-width="8" stroke-linecap="round"/>`).join("")}<circle cx="-10" cy="22" r="8" fill="${W.berry}"/><circle cx="8" cy="26" r="8" fill="${W.berry}"/></g>
      <rect x="86" y="170" width="220" height="12" rx="6" fill="#9a958b" opacity=".6"/><rect x="116" y="198" width="160" height="10" rx="5" fill="#b5b0a5" opacity=".6"/><rect x="104" y="224" width="184" height="10" rx="5" fill="#b5b0a5" opacity=".6"/><rect x="140" y="260" width="112" height="10" rx="5" fill="#c4bfb4" opacity=".6"/></svg></div>`;

  // Water glass from above.
  const coaster = `<div style="${abs(600, 760, 250, 250, `z-index:7;border-radius:50%;background:radial-gradient(circle at 40% 35%,${W.pineMid},${W.pine});box-shadow:0 12px 16px rgba(10,30,20,.4),inset 0 0 0 8px rgba(255,255,255,.12)`)}"></div>`;
  const glass = `<svg style="${abs(626, 786, 200, 200, "z-index:8;filter:drop-shadow(12px 16px 10px rgba(10,30,20,.45))")}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="94" fill="rgba(240,248,250,.7)"/><circle cx="100" cy="100" r="94" fill="none" stroke="#fff" stroke-width="5" opacity=".9"/><circle cx="100" cy="100" r="78" fill="#bfdbe6"/><circle cx="100" cy="100" r="78" fill="url(#gw)"/><path d="M42 74 A64 64 0 0 1 84 38" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".85"/><path d="M150 140 A56 56 0 0 1 120 160" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none" opacity=".6"/><defs><radialGradient id="gw" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#f1fafc" stop-opacity=".8"/><stop offset="1" stop-color="#7fb0c6" stop-opacity=".5"/></radialGradient></defs></svg>`;

  // The two gift tags carrying the other lines.
  const tagA = giftTag({
    x: 540, y: 1030, w: 360, h: 136, rot: -3, z: 12, tone: ["#e4dbd0", "#d3c7b8"], ring: "#fffaf0",
    inner: `<div class="hand" data-check="tagA" style="position:absolute;left:96px;right:62px;top:0;bottom:0;display:flex;align-items:center;font:600 35px/37px 'Hand',cursive;color:#5a4f55">${esc(i.items[0])}</div><div style="position:absolute;right:14px;bottom:10px">${icon("x-circle", { size: 40, color: C.mulberryDeep, weight: "fill" })}</div>`,
  });
  const tagB = giftTag({
    x: 580, y: 1176, w: 380, h: 156, rot: 2, z: 13,
    inner: `<div class="hand" data-check="tagB" style="position:absolute;left:100px;right:22px;top:0;bottom:0;display:flex;align-items:center;font:700 38px/39px 'Hand',cursive;color:#2c2018">${esc(i.items[2])}</div>`,
  });

  // A blank page with a pen resting on it.
  const blank = `<div style="${abs(40, 1170, 470, 360, "transform:rotate(-4deg);z-index:7;background:#fffdf6;box-shadow:0 2px 3px rgba(20,30,15,.35),0 22px 28px rgba(20,30,15,.4);border-radius:4px")}"><div style="position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 46px,#d4dde0 46px 48px);background-position:0 30px"></div></div>`;
  const penOn = pen({ x: 120, y: 1226, len: 380, rot: -13, color: W.pine, z: 15 });
  const sprig = fir({ x: 392, y: 990, len: 300, rot: 78, seed: 8, berries: 3, z: 7, flip: true });

  const body = `${gingham()}${invite}${phone}${coaster}${glass}${blank}${sprig}${noteHtml}${tagA}${tagB}${penOn}${fh}`;
    return { n, id: `${n}-how-to-say-no-to-a-holiday-ask`, html: page(p, { body, css: fc, paper: "#e9efe5" }) };
}

export const pins = [p93(), p94(), p96(), p100(), p101()];
