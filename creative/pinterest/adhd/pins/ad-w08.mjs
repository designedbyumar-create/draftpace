/**
 * ADHD Life Companion guide pins, world w08: planner and stationery.
 * Blush, gold and deep plum: open planners, washi tape, pens, a stack of
 * planners, a pencil case, paperclips, a ribbon bookmark, keys.
 * #72 scenario        a planner spread seen from above on a plum desk mat: Mon-Wed filled, Thu blank, post sliding over a corner
 * #74 checklist       a spiral pad with five ticked rows, a closed planner and a phone, on blush dot-grid, a kraft envelope corner
 * #76 how-to-steps    six numbered steps on a cream card, one torn page and an index card clipped over a set of keys, honey wood
 * #78 myth-vs-truth   a faded set-aside note above, a plum ground below with the rule on a card and a planner row with one blank day
 * #90 question        a stack of cellophane-wrapped planners, the old planner open with one line ringed, a butter question note
 * #91 myth-vs-truth   two wall calendars on blush: the blank struck out in hard ink, and the same blank left alone with one tick
 *
 * No screens, no real brands. Handwriting in drawn planner pages is unreadable pen marks, never words.
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const SCENE_BOTTOM = 1354;

const K = {
  plum: "#4a2540", plumDeep: "#2f1529", plumMid: "#6e3d5c", plumSoft: "#8a5a78",
  blush: "#f3d6d9", blushDeep: "#e3a9b4", blushPale: "#faeeee", rose: "#c97b8f",
  gold: "#c9a24e", goldLight: "#e8d08c", goldDeep: "#9a7326",
  cream: "#fffaf2", creamDeep: "#f3e9d8", ink: "#231a1f", kraft: "#c8a679",
};

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** Header block (eyebrow, headline, optional sub) and footer band. */
function frame(i, { paper, size = 72, sub = null, textTop = 62, split = ": ", head = null, extraCss = "" }) {
  let eyebrow = null, h = i.headline;
  const at = i.headline.indexOf(split);
  if (split && at > 0) { eyebrow = i.headline.slice(0, at + (split === "? " ? 1 : 0)); h = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(40,15,30,.3);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(40,15,30,.3);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4b3f46;max-width:850px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#4b3f46}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head ?? h)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

const exTag = (x, y, rot = 0, z = 25) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

/** A hand-drawn loop that overshoots its start. */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, halo = null, sq = 2 } = {}) {
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

/** Neat rows of pen loops that read as writing without being words. */
function pen_rows(w, rowsN, { seed = 1, gap = 40, y0 = 28, color = K.plumMid, sw = 2.6, op = 0.72, minLen = 0.45, maxLen = 1 } = {}) {
  const r = rng(seed);
  let d = "";
  for (let k = 0; k < rowsN; k++) {
    const y = y0 + k * gap;
    const len = w * (minLen + r() * (maxLen - minLen));
    let x = 4;
    d += `M${x} ${y} `;
    while (x < 4 + len) {
      const dx = 4.5 + r() * 5;
      const up = r() > 0.45 ? -1 : 1;
      d += `q${(dx / 2).toFixed(1)} ${(up * (3 + r() * 5)).toFixed(1)} ${dx.toFixed(1)} ${((r() - 0.5) * 2).toFixed(1)} `;
      x += dx;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** Washi tape with notched ends. */
function washi({ x, y, w = 150, h = 42, rot = 0, color = K.blushDeep, kind = "stripe", z = 12 }) {
  const zig = "polygon(0 0,100% 0,97% 14%,100% 28%,97% 42%,100% 56%,97% 70%,100% 84%,97% 100%,0 100%,3% 84%,0 70%,3% 56%,0 42%,3% 28%,0 14%)";
  const bg = kind === "stripe" ? `repeating-linear-gradient(135deg,${color} 0 11px,rgba(255,255,255,.42) 11px 19px)`
    : kind === "dots" ? `radial-gradient(rgba(255,255,255,.7) 3px,transparent 3.5px) 0 0/16px 16px,${color}`
    : color;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${bg};opacity:.9;clip-path:${zig};z-index:${z}`)}"></div>`;
}

/** A gold binder clip, seen from above. */
function goldClip({ x, y, rot = 0, size = 90, z = 14 }) {
  return `<svg style="${abs(x, y, size, size * 0.8, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 5px rgba(30,10,20,.4));z-index:${z}`)}" viewBox="0 0 100 80" aria-hidden="true"><defs><linearGradient id="gc" x1="0" x2="1"><stop offset="0" stop-color="#e9d08c"/><stop offset=".5" stop-color="#b98f35"/><stop offset="1" stop-color="#8d6a22"/></linearGradient></defs><path d="M26 34 C 20 6, 80 6, 74 34" fill="none" stroke="#d8dadf" stroke-width="5" stroke-linecap="round"/><path d="M8 80 L14 30 Q 50 22 86 30 L92 80 Z" fill="url(#gc)"/><path d="M14 30 Q 50 22 86 30 L88 40 Q 50 32 12 40 Z" fill="#f4e3ad" opacity=".55"/></svg>`;
}

/** A paperclip lying at an angle. */
function paperclip({ x, y, rot = 0, s = 1, color = "#c3c6cc", z = 14 }) {
  return `<svg style="${abs(x, y, 34 * s, 90 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 4px 3px rgba(30,10,20,.35));z-index:${z}`)}" viewBox="0 0 34 90" aria-hidden="true"><path d="M9 62 V20 a8 8 0 0 1 16 0 V68 a12 12 0 0 1 -24 0 V28" fill="none" stroke="${color}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A pen lying flat: barrel, band, clip, nib. */
function pen({ x, y, len = 380, rot = 0, body = K.plum, trim = K.gold, z = 15 }) {
  return `<svg style="${abs(x, y, len, 36, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(30,10,20,.4));z-index:${z}`)}" viewBox="0 0 ${len} 36" aria-hidden="true"><defs><linearGradient id="pn${z}${len}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>
    <rect x="60" y="6" width="${len - 80}" height="24" rx="12" fill="${body}"/><rect x="60" y="6" width="${len - 80}" height="24" rx="12" fill="url(#pn${z}${len})"/>
    <rect x="${len - 170}" y="3" width="14" height="30" rx="2" fill="${trim}"/><rect x="${len - 150}" y="11" width="120" height="5" rx="2.5" fill="${trim}"/>
    <path d="M60 8 L16 17 L16 19 L60 28 Z" fill="${trim}"/><path d="M20 16 L2 18 L20 20 Z" fill="#241a20"/></svg>`;
}

/** A pencil case lying flat with a zip and two pencils in it. */
function pencilCase({ x, y, w = 420, h = 190, rot = 0, color = K.blushDeep, z = 8, filter = "" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 14px 12px rgba(30,10,20,.4)) ${filter}`)}">
    <div style="position:absolute;inset:0;border-radius:${h / 2}px;background:linear-gradient(170deg,${color},${K.rose})"></div>
    <div style="position:absolute;left:10%;right:10%;top:44%;height:7px;border-radius:4px;background:repeating-linear-gradient(90deg,${K.goldDeep} 0 6px,${K.goldLight} 6px 11px)"></div>
    <div style="position:absolute;left:8%;top:38%;width:50px;height:34px;border-radius:12px;background:linear-gradient(${K.goldLight},${K.goldDeep})"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:30%;border-radius:${h / 2}px ${h / 2}px 0 0;background:rgba(255,255,255,.22)"></div></div>`;
}

/** An envelope seen from above: body, flap lines, optional window, optional stamp. */
function envelope({ x, y, w = 320, h = 210, rot = 0, color = "#fffaf2", edge = "#d9cdbb", win = false, stamp = false, z = 10 }) {
  const lines = win ? `<rect x="${w * 0.1}" y="${h * 0.34}" width="${w * 0.46}" height="${h * 0.3}" rx="4" fill="#eef1f3" stroke="${edge}" stroke-width="2"/><path d="M${w * 0.14} ${h * 0.44} H${w * 0.5} M${w * 0.14} ${h * 0.54} H${w * 0.4}" stroke="#9a9aa4" stroke-width="3" stroke-linecap="round"/>`
    : `<path d="M${w * 0.14} ${h * 0.56} H${w * 0.55} M${w * 0.14} ${h * 0.68} H${w * 0.45}" stroke="#7d6a58" stroke-opacity=".6" stroke-width="3.4" stroke-linecap="round"/>`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 3px 3px rgba(30,10,20,.35)) drop-shadow(0 14px 14px rgba(30,10,20,.3));z-index:${z}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="5" fill="${color}" stroke="${edge}" stroke-width="2"/>
    <path d="M2 2 L${w / 2} ${h * 0.58} L${w - 2} 2" fill="none" stroke="${edge}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M2 ${h - 2} L${w * 0.42} ${h * 0.5} M${w - 2} ${h - 2} L${w * 0.58} ${h * 0.5}" stroke="${edge}" stroke-width="2" opacity=".7"/>
    ${lines}${stamp ? `<rect x="${w * 0.78}" y="${h * 0.12}" width="${w * 0.14}" height="${h * 0.2}" rx="3" fill="${K.rose}" opacity=".7" stroke="#fff" stroke-width="3"/>` : ""}</svg>`;
}

/** Ribbon bookmark hanging down, cut in a V. */
function ribbon({ x, y, w = 34, len = 120, rot = 0, color = K.gold, z = 9 }) {
  return `<div style="${abs(x, y, w, len, `transform:rotate(${rot}deg);transform-origin:50% 0;background:linear-gradient(90deg,rgba(0,0,0,.18),rgba(255,255,255,.2) 45%,rgba(0,0,0,.14)),${color};clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);filter:drop-shadow(0 6px 4px rgba(30,10,20,.35));z-index:${z}`)}"></div>`;
}

const tick = (s = 40, color = C.mulberry, sw = 7) => `<svg width="${s}" height="${s}" viewBox="0 0 60 60" aria-hidden="true" style="position:absolute;left:0;top:0;overflow:visible"><path d="M8 32 L24 48 L54 6" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** A cream slip of paper with hand-lettered words, taped at the top. */
function slip({ x, y, w, h, rot = 0, text, size = 32, tape = K.blushDeep, kind = "stripe", z = 18, check = "slip", color = K.cream, align = "left" }) {
  return `<div data-check="${check}" style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${color};box-shadow:0 2px 3px rgba(30,10,20,.3),0 14px 22px rgba(30,10,20,.35);padding:30px 22px 12px;z-index:${z};text-align:${align}`)}">
    <div class="hand" style="font:600 ${size}px/1.08 'Hand',cursive;color:${K.ink}">${esc(text)}</div></div>
  ${washi({ x: x + w / 2 - 55, y: y - 18, w: 110, h: 36, rot: rot * 0.6 + (rot > 0 ? -3 : 3), color: tape, kind, z: z + 1 })}`;
}

/** Soft felt/leather grain overlay. */
const grain = (id, w, h, op = 0.2, freq = 0.8) => `<svg style="position:absolute;left:0;top:0;width:${w}px;height:${h}px;pointer-events:none" viewBox="0 0 ${w} ${h}" aria-hidden="true"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.3 -.45"/></filter><rect width="${w}" height="${h}" filter="url(#${id})" opacity="${op}"/></svg>`;

/** A closed plain planner: plum cover, gold band, ribbon end, blank label plate. */
function closedPlanner({ x, y, w = 300, h = 410, rot = 0, cover = K.plum, z = 6 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 4px 4px rgba(30,10,20,.3)) drop-shadow(16px 26px 22px rgba(30,10,20,.4))`)}">
    <div style="position:absolute;left:8px;top:10px;right:-9px;bottom:-9px;border-radius:10px;background:repeating-linear-gradient(0deg,#f3e9d8 0 3px,#d9cbb3 3px 4px)"></div>
    <div style="position:absolute;inset:0;border-radius:12px;background:linear-gradient(150deg,${K.plumMid},${cover} 55%,${K.plumDeep})"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:30px;border-radius:12px 0 0 12px;background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.12) 55%,rgba(0,0,0,0))"></div>
    <div style="position:absolute;left:78%;top:0;bottom:0;width:20px;background:linear-gradient(90deg,#d9bd6b,${K.goldDeep})"></div>
    <div style="position:absolute;left:22%;top:14%;width:56%;height:26%;border-radius:6px;border:3px solid ${K.gold};opacity:.85"></div>
    <div style="position:absolute;inset:0;border-radius:12px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.07)"></div></div>`;
}

/* =================================================================== #72 */
/** One planner spread: seven day columns, Monday to Wednesday written in, Thursday left empty. */
function spread72() {
  const W = 880, H = 600;
  const lp = { x: 18, w: 418 }, rp = { x: 444, w: 418 };
  const cols = [
    { d: "MON", x: 32, w: 94, fill: 8, seed: 3, dot: K.gold },
    { d: "TUE", x: 129, w: 94, fill: 7, seed: 9, dot: K.rose },
    { d: "WED", x: 226, w: 94, fill: 9, seed: 14, dot: K.plumMid },
    { d: "THU", x: 323, w: 94, fill: 0, seed: 1, dot: K.gold },
    { d: "FRI", x: 458, w: 126, fill: 0, seed: 1, dot: K.gold },
    { d: "SAT", x: 588, w: 126, fill: 0, seed: 1, dot: K.gold },
    { d: "SUN", x: 718, w: 126, fill: 0, seed: 1, dot: K.gold },
  ];
  const ruled = "repeating-linear-gradient(transparent 0 39px,rgba(110,70,100,.2) 39px 40px)";
  let inner = "";
  for (const c of cols) {
    const hl = c.fill ? [0, 3, 6].filter((k) => k < c.fill).map((k, m) => `<div style="position:absolute;left:0;right:0;top:${6 + k * 40}px;height:30px;background:${[K.goldLight, K.blush, "#d9bdd0"][m]};opacity:.7;border-radius:4px"></div>`).join("") : "";
    const rows = c.fill ? `<svg style="position:absolute;left:0;top:0" width="${c.w}" height="440" viewBox="0 0 ${c.w} 440" aria-hidden="true">${pen_rows(c.w - 18, c.fill, { seed: c.seed, gap: 40, y0: 30, color: [K.plum, K.plumMid, "#7a4a6c"][c.seed % 3], minLen: 0.55 })}${Array.from({ length: c.fill }, (_, k) => `<circle cx="${c.w - 8}" cy="${26 + k * 40}" r="4.5" fill="${[c.dot, K.gold, K.rose][k % 3]}"/>`).join("")}</svg>` : "";
    inner += `<div style="position:absolute;left:${c.x}px;top:36px;width:${c.w}px;text-align:center;font:600 22px/1 'Plex',sans-serif;letter-spacing:.1em;color:${K.plumMid}">${c.d}</div>
      <div style="position:absolute;left:${c.x}px;top:76px;width:${c.w}px;height:480px;background:${ruled};border-top:2px solid ${K.goldLight}">${hl}${rows}</div>`;
  }
  return `<div style="position:absolute;inset:0;border-radius:24px;background:linear-gradient(150deg,${K.plumMid},${K.plum});box-shadow:0 4px 5px rgba(0,0,0,.35),0 30px 46px rgba(10,0,10,.55)"></div>
    <div style="position:absolute;left:${rp.x + 3}px;top:20px;width:${rp.w + 8}px;height:572px;border-radius:2px 8px 8px 2px;background:repeating-linear-gradient(0deg,#efe4d2 0 3px,#d6c9b2 3px 4px)"></div>
    <div style="position:absolute;left:${lp.x}px;top:16px;width:${lp.w}px;height:568px;border-radius:8px 2px 2px 8px;background:linear-gradient(90deg,#fbf3e6,${K.cream} 70%,#eadfcd)"></div>
    <div style="position:absolute;left:${rp.x}px;top:16px;width:${rp.w}px;height:568px;border-radius:2px 8px 8px 2px;background:linear-gradient(90deg,#eadfcd,${K.cream} 30%,#fbf3e6)"></div>
    <div style="position:absolute;left:${W / 2 - 20}px;top:16px;width:40px;height:568px;background:linear-gradient(90deg,rgba(60,30,40,0),rgba(60,30,40,.3) 50%,rgba(60,30,40,0))"></div>
    ${inner}`;
}

function p72() {
  const n = 72;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#efe4ea", size: 70, sub: i.sub });

  const mat = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_BOTTOM - SCENE_TOP + 150, "background:radial-gradient(120% 90% at 30% 20%,#6a3a5c,#3d1b35 62%,#2a1124)")}"></div>
  ${`<div style="${abs(0, SCENE_TOP, 1000, 1128)}">${grain("g72", 1000, 1128, 0.16, 0.75)}</div>`}
  <div style="${abs(24, 394, 952, 940, "border:3px dashed rgba(224,190,110,.55);border-radius:30px")}"></div>`;

  const planner = `<div style="${abs(60, 420, 880, 600, "transform:rotate(-2deg);z-index:6")}">${spread72()}</div>
  ${washi({ x: 830, y: 410, w: 140, h: 40, rot: 36, color: K.blushDeep, kind: "dots", z: 9 })}
  ${exTag(70, 396, -3)}
  ${ribbon({ x: 470, y: 1008, w: 30, len: 120, rot: -4, color: K.gold, z: 7 })}
  ${pen({ x: 90, y: 1070, len: 400, rot: -4, body: K.plumSoft, trim: K.gold, z: 15 })}`;

  // Post sliding over the right-hand corner of the book.
  const post = `${envelope({ x: 640, y: 840, w: 320, h: 214, rot: 9, color: K.kraft, edge: "#a98655", stamp: true, z: 10 })}
  ${envelope({ x: 600, y: 800, w: 330, h: 218, rot: -6, color: "#fffaf2", edge: "#d6c9b4", win: true, z: 11 })}
  ${envelope({ x: 664, y: 846, w: 300, h: 200, rot: 16, color: K.blush, edge: "#d79ba8", z: 12 })}
  ${paperclip({ x: 842, y: 872, rot: 24, s: 1.05, z: 14 })}`;

  const slips = `${slip({ x: 44, y: 1160, w: 262, h: 176, rot: -2, text: i.items[1], size: 30, tape: K.goldLight, kind: "plain" })}
  ${slip({ x: 326, y: 1166, w: 342, h: 172, rot: 1.5, text: i.items[2], size: 30, tape: K.blushDeep, kind: "stripe" })}
  ${slip({ x: 688, y: 1156, w: 284, h: 180, rot: -1.5, text: i.items[3], size: 30, tape: K.goldLight, kind: "dots" })}`;

  const body = `${mat}${planner}${post}${slips}${fh}`;
  return { n, id: `${n}-why-you-stop-using-planners`, html: page(p, { body, css: fc, paper: "#efe4ea" }) };
}

/* =================================================================== #74 */
function p74() {
  const n = 74;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f8e9e8", size: 72, sub: i.sub });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1128, `background:radial-gradient(rgba(150,90,110,.28) 2.4px,transparent 2.8px) 0 0/30px 30px,radial-gradient(110% 80% at 70% 20%,#fbe9e9,#f1cfd4 70%,#e8bcc4)`)}"></div>`;

  // The kraft envelope corner, top right.
  const env = envelope({ x: 790, y: 360, w: 330, h: 224, rot: 14, color: K.kraft, edge: "#a98655", stamp: true, z: 4 });

  // Closed plain planner and a phone, both beyond the pad's right edge.
  const planner = closedPlanner({ x: 690, y: 500, w: 270, h: 380, rot: 7, z: 5 });
  const ph = `<div style="${abs(742, 936, 190, 360, "transform:rotate(-7deg);z-index:6;filter:drop-shadow(14px 22px 16px rgba(30,10,20,.45))")}">
    <div style="position:absolute;inset:0;border-radius:36px;background:linear-gradient(150deg,#5a4a56,#1c1218)"></div>
    <div style="position:absolute;left:9px;top:9px;right:9px;bottom:9px;border-radius:29px;background:linear-gradient(155deg,#3a2a38,#150d14)"></div>
    <div style="position:absolute;left:9px;top:9px;right:9px;bottom:9px;border-radius:29px;background:linear-gradient(120deg,rgba(255,255,255,.2),rgba(255,255,255,0) 38%)"></div>
    <div style="position:absolute;left:50%;top:22px;width:52px;height:13px;margin-left:-26px;border-radius:8px;background:#07040a"></div></div>`;

  // The pad: spiral rings, rule lines, five items each with a ticked box.
  const PW = 664, PH = 872;
  const lh = 54;
  const items = i.items.map((t, k) => `<div style="position:relative;padding-left:78px;margin-bottom:${k < 4 ? lh : 0}px"><div style="position:absolute;left:12px;top:5px;width:46px;height:46px;border:4px solid ${K.plum};border-radius:9px;background:#fffdf9">${tick(60, C.mulberry, 8).replace('left:0;top:0', 'left:-2px;top:-20px')}</div><div class="hand" style="font:600 41px/${lh}px 'Hand',cursive;color:${K.ink}">${esc(t)}</div></div>`).join("");
  const rings = Array.from({ length: 13 }, (_, k) => `<div style="position:absolute;left:${48 + k * 46}px;top:-6px;width:20px;height:62px"><div style="position:absolute;left:0;top:18px;width:20px;height:38px;border-radius:10px;border:5px solid #b5a8b0;border-bottom-color:#8c7e88;background:linear-gradient(#5a4a52,#2a1c24)"></div><div style="position:absolute;left:2px;top:18px;width:6px;height:36px;border-radius:3px;background:rgba(255,255,255,.55)"></div></div>`).join("");
  const pad = `<div style="${abs(34, 420, PW, PH, "transform:rotate(-1.6deg);z-index:7;filter:drop-shadow(0 3px 3px rgba(30,10,20,.3)) drop-shadow(10px 26px 28px rgba(30,10,20,.4))")}">
    <div style="position:absolute;left:8px;top:14px;right:-8px;bottom:-9px;border-radius:8px;background:#eadadd"></div>
    <div style="position:absolute;inset:0;border-radius:10px;background:#fffdf9"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:86px;border-radius:10px 10px 0 0;background:linear-gradient(#e9d3da,#dcc0ca)"></div>
    <div style="position:absolute;left:0;right:0;top:86px;bottom:0;background:repeating-linear-gradient(transparent 0 ${lh - 1}px,#cdd8e4 ${lh - 1}px ${lh}px);background-position:0 10px;border-radius:0 0 10px 10px"></div>
    <div style="position:absolute;left:84px;top:86px;bottom:0;width:3px;background:#e7a4b4"></div><div style="position:absolute;left:92px;top:86px;bottom:0;width:2px;background:#e7a4b4"></div>
    ${rings}
    <div data-check="items" style="position:absolute;left:30px;right:36px;top:${86 + 10}px;height:${PH - 86 - 20}px">${items}</div></div>
  ${washi({ x: 4, y: 1250, w: 140, h: 40, rot: 38, color: K.goldLight, kind: "stripe", z: 12 })}
  ${washi({ x: 552, y: 420, w: 150, h: 40, rot: 34, color: K.blushDeep, kind: "dots", z: 12 })}`;

  const extras = `${pen({ x: 360, y: 1296, len: 440, rot: -3, body: K.plum, trim: K.gold, z: 15 })}${paperclip({ x: 660, y: 1030, rot: 18, s: 1.1, color: K.gold, z: 14 })}`;

  const body = `${ground}${env}${planner}${ph}${pad}${extras}${fh}`;
  return { n, id: `${n}-choosing-a-planner-for-adhd`, html: page(p, { body, css: fc, paper: "#f8e9e8" }) };
}

/* =================================================================== #76 */
function key({ x, y, rot = 0, len = 340, color = "#d8b455", dark = "#9a7326" }) {
  return `<svg style="${abs(x, y, len, 90, `transform:rotate(${rot}deg);transform-origin:0 50%;filter:drop-shadow(0 8px 6px rgba(50,25,5,.45));z-index:5`)}" viewBox="0 0 ${len} 90" aria-hidden="true"><defs><linearGradient id="k${len}${rot}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5e4a8"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
    <circle cx="45" cy="45" r="38" fill="url(#k${len}${rot})"/><circle cx="45" cy="45" r="14" fill="#a97e2a" opacity=".85"/><circle cx="45" cy="45" r="11" fill="#6b4a14"/>
    <rect x="80" y="36" width="${len - 90}" height="18" rx="4" fill="url(#k${len}${rot})"/><path d="M${len - 80} 54 h16 v18 h14 v-18 h14 v26 h-44 z" fill="url(#k${len}${rot})"/></svg>`;
}

function p76() {
  const n = 76;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f6eedd", size: 62, sub: i.sub, split: null });

  // Honey wood: warm gold boards with long grain.
  const wood = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:linear-gradient(180deg,#e0b86c 0 24%,#d3a758 24% 25%,#e4bd72 25% 49%,#cf9f4f 49% 50%,#dfb66a 50% 74%,#cd9c4c 74% 75%,#e2ba6e 75%)")}"></div>
  <svg style="${abs(0, SCENE_TOP, 1000, 1128)}" viewBox="0 0 1000 1128" aria-hidden="true"><filter id="w76"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.16" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .26  0 0 0 0 .06  0 0 0 1.6 -.55"/></filter><rect width="1000" height="1128" filter="url(#w76)" opacity=".5"/><rect width="1000" height="1128" fill="url(#v76)"/><defs><radialGradient id="v76" cx="30%" cy="15%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#3a1a05" stop-opacity=".3"/></radialGradient></defs></svg>`;

  // The card with the six steps.
  const names = i.items;
  const rowH = 138;
  const rows = names.map((t, k) => `<div style="position:absolute;left:0;right:0;top:${k * rowH}px;height:${rowH}px;display:flex;align-items:center;gap:22px;padding:0 30px 0 30px;border-top:${k ? `2px solid ${K.blush}` : "0"}">
    <div style="flex:none;width:68px;height:68px;border-radius:50%;background:${k === 5 ? C.mulberry : K.plum};color:#fff;display:grid;place-items:center;font:500 38px/1 'Newsreader',serif;box-shadow:0 3px 6px rgba(40,10,30,.3)">${k + 1}</div>
    <div class="serif" style="font:500 41px/1.1 'Newsreader',Georgia,serif;color:${K.ink};letter-spacing:-.01em;text-wrap:balance">${k === 1 ? `<span style="background:linear-gradient(transparent 58%,${K.goldLight} 58%)">${esc(t)}</span>` : esc(t)}</div></div>`).join("");
  const card = `<div data-check="steps" style="${abs(40, 408, 520, rowH * 6 + 8, "transform:rotate(-1.2deg);background:linear-gradient(#fffaf2,#fbf1e4);border-radius:22px;box-shadow:0 3px 4px rgba(50,25,5,.3),0 26px 40px rgba(50,25,5,.4);z-index:8;overflow:visible")}"><div style="position:absolute;left:0;right:0;top:4px;height:${rowH * 6}px">${rows}</div></div>
  ${washi({ x: 200, y: 392, w: 150, h: 40, rot: 2, color: K.blushDeep, kind: "stripe", z: 12 })}`;

  // The rest of the planner stays closed, behind.
  const closed = closedPlanner({ x: 650, y: 372, w: 320, h: 430, rot: 6, z: 4 });

  // Keys on a ring under the page, teeth and bows showing below it.
  const R = { x: 790, y: 1176 };
  const keyAt = (ang, len, color, dark, id) => {
    const cx = R.x + 62 * Math.cos((ang * Math.PI) / 180), cy = R.y + 62 * Math.sin((ang * Math.PI) / 180);
    return `<svg style="${abs(cx - 40, cy - 40, len, 80, `transform-origin:40px 40px;transform:rotate(${ang}deg);filter:drop-shadow(0 8px 6px rgba(50,25,5,.45));z-index:5`)}" viewBox="0 0 ${len} 80" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e8b0"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs>
      <rect x="62" y="31" width="${len - 70}" height="18" rx="4" fill="url(#${id})"/><path d="M${len - 64} 49 h14 v20 h14 v-20 h12 v28 h-40 z" fill="url(#${id})"/>
      <circle cx="40" cy="40" r="36" fill="url(#${id})"/><circle cx="40" cy="40" r="15" fill="#a47a28"/><circle cx="40" cy="40" r="11" fill="#5a3e10" opacity=".75"/></svg>`;
  };
  const keys = `${keyAt(14, 250, "#d8b455", "#9a7326", "kA")}${keyAt(66, 215, "#d3d4da", "#80838d", "kB")}${keyAt(118, 215, "#d8b455", "#9a7326", "kC")}
  <svg style="${abs(R.x - 76, R.y - 76, 152, 152, "z-index:6;filter:drop-shadow(0 6px 5px rgba(50,25,5,.4))")}" viewBox="0 0 152 152" aria-hidden="true"><circle cx="76" cy="76" r="62" fill="none" stroke="#b9bcc4" stroke-width="10"/><circle cx="76" cy="76" r="62" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-dasharray="60 330" stroke-dashoffset="-20"/></svg>
  <div style="${abs(R.x - 190, R.y + 10, 120, 74, `transform:rotate(14deg);border-radius:12px;background:linear-gradient(${K.blush},${K.blushDeep});box-shadow:0 8px 10px rgba(50,25,5,.4);z-index:7`)}"><div style="position:absolute;right:12px;top:12px;width:16px;height:16px;border-radius:50%;background:${K.goldDeep}"></div></div>
  <div style="${abs(R.x - 104, R.y + 4, 60, 8, "z-index:6;background:#b9bcc4;border-radius:4px;transform:rotate(8deg)")}"></div>`;

  // The one torn-free page with the index card clipped on it.
  const PX = 580, PY = 468, PWd = 390, PHt = 650;
  const tornEdge = (() => {
    const r = rng(7);
    let pts = "0% 0%";
    for (let k = 1; k <= 20; k++) pts += `, ${(r() * 2.6).toFixed(1)}% ${(k * 5).toFixed(1)}%`;
    return `polygon(${pts}, 100% 100%, 100% 0%)`;
  })();
  const pageSheet = `<div style="${abs(PX, PY, PWd, PHt, "transform:rotate(3deg);z-index:9;filter:drop-shadow(0 3px 3px rgba(50,25,5,.3)) drop-shadow(10px 26px 24px rgba(50,25,5,.42))")}">
    <div style="position:absolute;inset:0;background:${K.cream};clip-path:${tornEdge}"></div>
    <div style="position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 43px,rgba(110,70,100,.2) 43px 44px);background-position:0 20px;clip-path:${tornEdge}"></div>
    <div style="position:absolute;left:30px;top:0;bottom:0;width:2px;background:${K.blushDeep};opacity:.7"></div>
    <svg style="position:absolute;left:36px;top:300px" width="330" height="360" viewBox="0 0 330 360" aria-hidden="true">${pen_rows(300, 7, { seed: 21, gap: 44, y0: 42, color: K.plumMid, minLen: 0.4 })}</svg>
    ${Array.from({ length: 8 }, (_, k) => `<div style="position:absolute;left:3px;top:${40 + k * 84}px;width:11px;height:11px;border-radius:50%;background:rgba(120,80,40,.25)"></div>`).join("")}</div>
  <div data-check="card" style="${abs(PX + 40, PY + 62, 350, 230, "transform:rotate(-1.5deg);background:#fffdf7;box-shadow:0 2px 3px rgba(30,10,20,.3),0 14px 20px rgba(30,10,20,.32);z-index:12;padding:42px 26px 12px")}">
    <div style="position:absolute;left:0;right:0;top:0;height:10px;background:${K.blush}"></div>
    <div class="hand" style="font:600 43px/1.06 'Hand',cursive;color:${K.ink}">${esc(i.proof[7])}</div></div>
  ${goldClip({ x: PX + 190, y: PY + 20, rot: 3, size: 100, z: 14 })}
  ${exTag(PX + 232, PY + 292, 2, 15)}`;

  const body = `${wood}${card}${closed}${keys}${pageSheet}${fh}`;
  return { n, id: `${n}-get-back-into-a-planner`, html: page(p, { body, css: fc, paper: "#f6eedd" }) };
}

/* =================================================================== #78 */
function p78() {
  const n = 78;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#efe6ec", size: 78, split: "? " });

  // Upper half: a faded, set-aside note on a pale lilac-grey ground.
  const top = `<div style="${abs(0, SCENE_TOP, 1000, 470, "background:linear-gradient(170deg,#e4dde3,#d6ccd4)")}"></div>
  <div class="eyebrow" style="${abs(64, 404, 880, 40, "color:#7b6e78;font:500 30px/1.2 'Plex',sans-serif;letter-spacing:0;text-transform:none")}" data-check="easy">${esc(i.items[0])}</div>
  <div style="${abs(78, 476, 470, 330, "transform:rotate(-5deg);background:linear-gradient(172deg,#e6dec6,#d9cfb4);opacity:.88;box-shadow:0 2px 3px rgba(60,40,60,.2),0 14px 20px rgba(60,40,60,.22);filter:grayscale(.35);z-index:4")}">
    <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.25)"></div>
    <div class="hand" data-check="myth" style="position:absolute;left:36px;right:30px;top:96px;height:190px;font:600 84px/1.02 'Hand',cursive;color:#8d838b;text-decoration:line-through;text-decoration-thickness:4px;text-decoration-color:#6e6370">${esc("You lost motivation")}</div></div>
  ${washi({ x: 210, y: 468, w: 150, h: 40, rot: -6, color: "#c9bfcb", kind: "plain", z: 6 })}
  ${pencilCase({ x: 600, y: 520, w: 470, h: 200, rot: 7, color: "#d8c3cf", z: 5, filter: "grayscale(.45) opacity(.8)" })}
  ${pen({ x: 600, y: 760, len: 330, rot: -4, body: "#a79aa5", trim: "#c8bfc7", z: 6 })}`;

  // Lower half: richer plum, torn paper edge between.
  const r = rng(5);
  let edge = "0 3%";
  for (let k = 1; k <= 25; k++) edge += `, ${k * 4}% ${(r() * 3.2).toFixed(1)}%`;
  const bottom = `<div style="${abs(0, 800, 1000, 560, "filter:drop-shadow(0 -6px 8px rgba(40,10,30,.35));z-index:3")}">
    <div style="position:absolute;inset:0;clip-path:polygon(${edge},100% 100%,0 100%);background:radial-gradient(120% 90% at 60% 10%,${K.plumMid},${K.plum} 55%,${K.plumDeep})"></div></div>
  <div style="${abs(0, 800, 1000, 560, "z-index:3;pointer-events:none")}">${grain("g78", 1000, 560, 0.12, 0.8)}</div>`;

  const label = `<div style="${abs(64, 830, 600, 36, `font:600 24px/1.2 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${K.goldLight};z-index:8`)}">A more useful one</div>`;

  // The index card with the rule, "rule" circled in mulberry.
  const card = `<div data-check="rule" style="${abs(60, 880, 840, 196, "transform:rotate(-1deg);background:#fffaf0;box-shadow:0 2px 3px rgba(20,5,20,.4),0 18px 26px rgba(20,5,20,.45);z-index:10;padding:22px 40px 0;background-image:repeating-linear-gradient(transparent 0 61px,#d7c9d1 61px 62px);background-position:0 18px")}">
    <div style="position:absolute;left:0;right:0;top:0;height:10px;background:${K.blushDeep}"></div>
    <div class="hand" style="font:600 62px/62px 'Hand',cursive;color:${K.ink};margin-top:10px">the book had a <span style="position:relative;display:inline-block;margin:0 14px">rule<span style="position:absolute;left:-14px;top:-12px;width:114px;height:84px;pointer-events:none">${ring(114, 84, { sw: 7, seed: 9, sq: 2.6 })}</span></span> in it: every day gets an entry</div></div>
  ${washi({ x: 620, y: 862, w: 160, h: 40, rot: 3, color: K.goldLight, kind: "stripe", z: 12 })}`;

  // One planner row: seven days, six written, one left blank.
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const cells = days.map((d, k) => `<div style="position:relative;width:112px;height:150px;border-left:${k ? `2px solid ${K.blush}` : "0"};">
    <div style="font:600 24px/1 'Plex',sans-serif;color:${K.plumMid};text-align:center;padding-top:10px">${d}</div>
    ${k === 3 ? "" : `<svg style="position:absolute;left:10px;top:44px" width="96" height="100" viewBox="0 0 96 100" aria-hidden="true">${pen_rows(80, 3, { seed: 30 + k, gap: 26, y0: 12, color: [K.plum, K.plumMid, K.rose][k % 3], minLen: 0.6 })}</svg>`}</div>`).join("");
  const row = `<div data-check="page" style="${abs(96, 1086, 790, 166, "transform:rotate(1deg);background:linear-gradient(#fffaf2,#f4ebdc);border-radius:10px;box-shadow:0 3px 4px rgba(10,0,10,.4),0 18px 24px rgba(10,0,10,.45);z-index:9;display:flex;padding:0 3px")}">${cells}</div>`;

  const cap = `<div data-check="chain" style="${abs(64, 1268, 872, 76, "font:500 28px/1.3 'Plex',sans-serif;color:#f1e3ea;z-index:12")}">${esc(i.items[2])}</div>`;

  const body = `${top}${bottom}${label}${card}${row}${cap}${fh}`;
  return { n, id: `${n}-stopped-using-your-planner`, html: page(p, { body, css: fc, paper: "#efe6ec" }) };
}

/* =================================================================== #90 */
/** One new planner lying in the stack, with a page-edge strip for thickness. */
function newPlanner({ x, y, w, h, rot, cover, band = K.gold, z }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 3px 3px rgba(60,30,20,.3)) drop-shadow(6px 14px 12px rgba(60,30,20,.3))`)}">
    <div style="position:absolute;left:5px;top:12px;right:-7px;bottom:-12px;border-radius:8px;background:repeating-linear-gradient(0deg,#f3e9d8 0 3px,#d9cbb3 3px 4px)"></div>
    <div style="position:absolute;inset:0;border-radius:10px;background:linear-gradient(150deg,${cover[0]},${cover[1]})"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:24px;border-radius:10px 0 0 10px;background:linear-gradient(90deg,rgba(0,0,0,.3),rgba(255,255,255,.14) 55%,rgba(0,0,0,0))"></div>
    <div style="position:absolute;left:80%;top:0;bottom:0;width:16px;background:linear-gradient(90deg,#e1c878,${K.goldDeep})"></div>
    <div style="position:absolute;left:20%;top:12%;width:52%;height:22%;border-radius:5px;border:3px solid ${band};opacity:.85"></div></div>`;
}

function p90() {
  const n = 90;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#faf3e8", size: 70, split: null });

  // Ivory ground with a soft champagne sheen and a few gold flecks.
  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(110% 80% at 25% 25%,#fffaf0,#f4e8d2 55%,#e8d6b4)")}"></div>
  ${`<div style="${abs(0, SCENE_TOP, 1000, 1128, "opacity:.5")}">${grain("g90", 1000, 1128, 0.1, 0.55)}</div>`}
  <div style="${abs(0, SCENE_TOP, 1000, 1128, "background:repeating-linear-gradient(115deg,rgba(201,162,78,.07) 0 3px,transparent 3px 46px)")}"></div>`;

  // Left: four new planners in a stack, the top one in cellophane with a ribbon.
  const cov = [[K.plumMid, K.plumDeep], [K.blushDeep, K.rose], ["#d6b25e", "#a8832b"], ["#c0647e", "#8e3a58"]];
  const stack = cov.map((c, k) => newPlanner({ x: 42 + (k % 2 ? 8 : -2) + k * 3, y: 520 - k * 14, w: 330, h: 430, rot: [-3, 2.5, -1.5, 3][k], cover: c, z: 4 + k })).join("");
  const wrap = `<div style="${abs(26, 478, 372, 470, "transform:rotate(3deg);z-index:12;border-radius:14px;background:linear-gradient(130deg,rgba(255,255,255,.58),rgba(255,255,255,.1) 34%,rgba(255,255,255,.34) 52%,rgba(255,255,255,.08) 72%,rgba(255,255,255,.4));border:2px solid rgba(255,255,255,.75);box-shadow:inset 0 0 26px rgba(255,255,255,.4)")}">
    <svg style="position:absolute;inset:0" width="372" height="470" viewBox="0 0 372 470" aria-hidden="true"><path d="M20 70 L130 24 M232 26 L350 82 M10 380 L120 446 M260 450 L362 396 M60 220 L190 190 L310 232" stroke="#fff" stroke-opacity=".75" stroke-width="3" fill="none" stroke-linecap="round"/></svg></div>
  <div style="${abs(26, 650, 372, 48, `transform:rotate(3deg);z-index:13;background:linear-gradient(${K.blushDeep},${K.rose});box-shadow:0 4px 6px rgba(60,20,30,.3)`)}"></div>
  <svg style="${abs(150, 612, 140, 124, "z-index:14;transform:rotate(3deg);filter:drop-shadow(0 6px 6px rgba(60,20,30,.4))")}" viewBox="0 0 140 124" aria-hidden="true"><path d="M70 62 C40 20 6 24 10 56 C14 90 50 84 70 62 Z" fill="${K.rose}"/><path d="M70 62 C100 20 134 24 130 56 C126 90 90 84 70 62 Z" fill="${K.rose}"/><path d="M70 62 C50 96 40 116 34 122 L58 112 Z M70 62 C90 96 100 116 106 122 L82 112 Z" fill="#b25d73"/><ellipse cx="70" cy="62" rx="16" ry="14" fill="#a8506a"/></svg>`;

  // Right: the old planner open to one page, one line ringed in mulberry.
  const OX = 440, OY = 452, OW = 530, OH = 660;
  const lines = `<svg style="position:absolute;left:44px;top:90px" width="440" height="520" viewBox="0 0 440 520" aria-hidden="true">${pen_rows(420, 11, { seed: 17, gap: 46, y0: 30, color: K.plumMid, minLen: 0.5 })}</svg>`;
  const old = `<div style="${abs(OX, OY, OW, OH, "transform:rotate(2.5deg);z-index:6;filter:drop-shadow(0 4px 4px rgba(60,30,20,.3)) drop-shadow(14px 26px 24px rgba(60,30,20,.38))")}">
    <div style="position:absolute;inset:0;border-radius:18px;background:linear-gradient(150deg,${K.plumMid},${K.plum})"></div>
    <div style="position:absolute;left:12px;top:16px;width:60px;height:${OH - 32}px;border-radius:6px 0 0 6px;background:linear-gradient(90deg,#e8dcc8,#d6c8b0)"></div>
    <div style="position:absolute;left:44px;top:16px;width:${OW - 66}px;height:${OH - 32}px;border-radius:3px 8px 8px 3px;background:repeating-linear-gradient(transparent 0 45px,rgba(110,70,100,.2) 45px 46px) 0 50px/100% 100% no-repeat,linear-gradient(90deg,#e5d9c4,${K.cream} 14%,#fbf3e6)"></div>
    <div style="position:absolute;left:44px;top:16px;width:${OW - 66}px;height:${OH - 32}px;background:linear-gradient(90deg,rgba(60,30,40,.3),rgba(60,30,40,0) 9%)"></div>
    ${lines}
    <div style="position:absolute;left:52px;top:${90 + 30 + 46 * 7 - 31}px;width:350px;height:62px">${ring(350, 62, { sw: 6, seed: 4, halo: "#fffaf2", sq: 3.2 })}</div>
    <div style="position:absolute;right:0;bottom:0;width:70px;height:70px;background:linear-gradient(135deg,rgba(0,0,0,0) 50%,#d9cbb0 50%);border-radius:0 0 18px 0"></div></div>
  ${ribbon({ x: 740, y: 1090, w: 30, len: 90, rot: -3, color: K.gold, z: 5 })}`;

  // The question on a butter sticky note between them.
  const sticky = `<div data-check="sticky" style="${abs(300, 560, 316, 290, "transform:rotate(-4deg);background:linear-gradient(172deg,#f8e8a6,#efcf72);box-shadow:0 2px 3px rgba(60,40,10,.35),0 16px 22px rgba(60,40,10,.4);z-index:20;padding:44px 26px 0")}">
    <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.22)"></div>
    <div class="hand" style="font:600 56px/1.02 'Hand',cursive;color:${K.ink}">${esc("Another new planner this January?")}</div></div>`;

  const cap1 = slip({ x: 40, y: 1000, w: 380, h: 214, rot: -1.5, text: i.items[0], size: 33, tape: K.goldLight, kind: "plain", z: 18, check: "cap1" });
  const cap2 = slip({ x: 470, y: 1130, w: 480, h: 112, rot: 1, text: i.items[1], size: 33, tape: K.blushDeep, kind: "dots", z: 18, check: "cap2" });
  const sub = `<div data-check="sub" style="${abs(64, 1262, 872, 76, `font:600 27px/1.3 'Plex',sans-serif;color:${K.plumMid};z-index:12`)}">${esc(i.sub)}</div>`;

  const body = `${ground}${stack}${wrap}${old}${sticky}${cap1}${cap2}${sub}${paperclip({ x: 905, y: 396, rot: 28, s: 1, color: K.gold, z: 14 })}${fh}`;
  return { n, id: `${n}-another-new-planner-this-january`, html: page(p, { body, css: fc, paper: "#faf3e8" }) };
}

/* =================================================================== #91 */
/** A wall calendar: spiral header, weekday letters, a 5 x 7 grid with something in each square but one. */
function wallCal({ x, y, w = 430, rot = 0, tone = "plain", struck = false, tickAt = null, blank = [1, 3], seed = 5, z = 6 }) {
  const cw = (w - 28) / 7, ch = 68, head = 92, wk = 42, rowsN = 5;
  const h = head + wk + ch * rowsN + 22;
  const r = rng(seed);
  const faded = tone === "faded";
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  let cells = "";
  for (let row = 0; row < rowsN; row++) {
    for (let col = 0; col < 7; col++) {
      const cx = 14 + col * cw, cy = head + wk + row * ch;
      const isBlank = row === blank[0] && col === blank[1];
      const entry = isBlank ? "" : `<svg style="position:absolute;left:${cx + 6}px;top:${cy + 8}px" width="${cw - 10}" height="${ch - 12}" viewBox="0 0 ${cw - 10} ${ch - 12}" aria-hidden="true">${pen_rows(cw - 22, 1 + Math.floor(r() * 2), { seed: 40 + row * 7 + col, gap: 17, y0: 16, color: faded ? "#8e8490" : [K.plum, K.plumMid, K.rose][(row + col) % 3], sw: 2.6, minLen: 0.45, op: faded ? 0.7 : 0.8 })}</svg>`;
      cells += entry;
    }
  }
  const lineC = faded ? "#c9bfc9" : "#e0c3cb";
  const grid = `<div style="${abs(14, head + wk, w - 28, ch * rowsN, `background:linear-gradient(90deg,${lineC} 2px,transparent 2px) 0 0/${cw}px 100%,linear-gradient(${lineC} 2px,transparent 2px) 0 0/100% ${ch}px;border-right:2px solid ${lineC};border-bottom:2px solid ${lineC}`)}"></div>`;
  const wkRow = days.map((d, k) => `<div style="${abs(14 + k * cw, head + 6, cw, wk - 6, `font:600 24px/${wk - 6}px 'Plex',sans-serif;text-align:center;color:${faded ? "#7b6e78" : K.plumMid}`)}">${d}</div>`).join("");
  const bx = 14 + blank[1] * cw, by = head + wk + blank[0] * ch;
  const strike = struck ? `<svg style="${abs(bx - 20, by - 18, cw + 40, ch + 36, "overflow:visible;z-index:5")}" viewBox="0 0 ${cw + 40} ${ch + 36}" aria-hidden="true"><path d="M6 ${ch + 28} L${cw + 34} 6" stroke="#1a1216" stroke-width="10" stroke-linecap="round"/></svg>` : "";
  const nx = 14 + (blank[1] + 1) * cw, ny = head + wk + blank[0] * ch;
  const tk = tickAt ? `<div style="${abs(nx + cw / 2 - 20, ny + 14, 42, 42)}">${tick(42, C.mulberry, 8)}</div>` : "";
  const holes = Array.from({ length: 9 }, (_, k) => `<div style="position:absolute;left:${34 + k * ((w - 68) / 8) - 8}px;top:10px;width:16px;height:30px;border-radius:8px;background:linear-gradient(#59486a,#2c2030);border:3px solid ${faded ? "#a79da8" : "#c4b5a8"}"></div>`).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);transform-origin:50% 0;z-index:${z};filter:drop-shadow(0 3px 3px rgba(60,20,40,.3)) drop-shadow(8px 20px 22px rgba(60,20,40,.35))`)}" data-calh="${h}">
    <div style="position:absolute;inset:0;border-radius:10px;background:${faded ? "linear-gradient(#ece5ea,#e0d8de)" : "linear-gradient(#fffaf2,#fbf1e6)"}"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:${head - 36}px;border-radius:10px 10px 0 0;background:${faded ? "linear-gradient(135deg,#bdb0bb,#a99aa8)" : `linear-gradient(135deg,${K.plumMid},${K.plum})`}"></div>
    <div style="position:absolute;left:0;right:0;top:${head - 46}px;height:10px;background:${faded ? "#b3a5b2" : K.gold}"></div>
    ${holes}${grid}${wkRow}${cells}${strike}${tk}</div>`;
}

function p91() {
  const n = 91;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f5e1e3", size: 72, split: "? " });

  const ground = `<div style="${abs(0, SCENE_TOP, 500, 1128, "background:linear-gradient(170deg,#e7d6da,#dcc8ce)")}"></div>
  <div style="${abs(500, SCENE_TOP, 500, 1128, "background:radial-gradient(120% 80% at 60% 20%,#fbe4e5,#f3ccd2 70%,#ecbac3)")}"></div>
  <div style="${abs(498, SCENE_TOP, 4, SCENE_BOTTOM - SCENE_TOP, `background:linear-gradient(${K.gold},${K.goldLight});z-index:2`)}"></div>`;

  const calL = wallCal({ x: 38, y: 494, w: 424, rot: -1.2, tone: "faded", struck: true, seed: 5, z: 6 });
  const calR = wallCal({ x: 538, y: 494, w: 424, rot: 1.2, tone: "plain", struck: false, tickAt: true, seed: 5, z: 6 });

  const pill = (x, text, ok) => `<div data-check="pill" style="${abs(x, 394, 424, 78, `display:flex;align-items:center;gap:12px;padding:0 20px;border-radius:33px;background:${ok ? "#fffaf2" : "#ddd2d8"};box-shadow:0 4px 10px rgba(60,20,40,.22);font:600 25px/1.15 'Plex',sans-serif;color:${ok ? K.plum : "#5e5260"};z-index:8`)}"><span style="flex:none;display:grid;place-items:center">${icon(ok ? "check-circle" : "x-circle", { size: 36, color: ok ? C.mulberry : "#3a2f3d", weight: "fill" })}</span><span>${esc(text)}</span></div>`;
  const pills = `${pill(38, "Does missing a day really wreck it", false)}${pill(538, "Less than it feels like.", true)}`;

  const gap = slip({ x: 110, y: 1058, w: 780, h: 104, rot: -1, text: i.proof[5], size: 48, tape: K.goldLight, kind: "stripe", z: 18, check: "gap", align: "center", color: "#fffdf7" });
  const note = `<div data-check="study" style="${abs(40, 1182, 920, 156, `background:${K.cream};border-radius:14px;box-shadow:0 3px 4px rgba(60,20,40,.25),0 14px 22px rgba(60,20,40,.28);z-index:12;padding:16px 28px;border-left:10px solid ${C.mulberry}`)}">
    <div style="font:600 26px/1.3 'Plex',sans-serif;color:${K.plum}">${esc(i.sub)}</div>
    <div style="font:400 25px/1.3 'Plex',sans-serif;color:#4b3f46;margin-top:6px">${esc(i.items[2])}</div></div>`;

  const body = `${ground}${calL}${calR}${pills}${gap}${note}${fh}`;
  return { n, id: `${n}-missed-a-day-one-gap`, html: page(p, { body, css: fc, paper: "#f5e1e3" }) };
}

export const pins = [p72(), p74(), p76(), p78(), p90(), p91()];
