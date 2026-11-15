/**
 * ADHD Life Companion guide pins, world w07: clock and calendar.
 * A wall clock, a wall calendar with circled cells, a wristwatch, an alarm clock;
 * navy, brass and paper white, with mulberry as the one-thing colour.
 * #32 infographic   six cream cards down a mulberry line, a clock at ten, a wristwatch (blush-grey desk)
 * #82 infographic   three paper tags on a string, a torn-off calendar page (navy felt board)
 * #84 comparison    torn grey notes to crisp cards with small clock faces, a wall clock at 3:30 (pale wall)
 * #86 infographic   a stepping chain on a clean card, a wall clock, keys, shoe and folder (walnut desk)
 * #88 before-after  two flat phone alarm screens, a brass alarm clock (brass ground)
 * #99 how-to-steps  a wall clock, three index cards with blank start/end lines, a rule-of-thumb note (blotter)
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const N = { navy: "#1b2a47", navyDeep: "#111b31", navyMid: "#2d4268", navyLight: "#4a628c", brass: "#b98a3a", brassLight: "#e6c97e", brassDeep: "#7d5818", white: "#fbf9f3", muted: "#4a5670" };

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};
let UID = 0;
const uid = (s) => `${s}${++UID}`;

/** Header block (eyebrow, headline, optional sub) and footer band. */
function frame(i, { paper, size = 76, sub = null, textTop = 58, split = ": ", extraCss = "" }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(split);
  if (at > 0) { eyebrow = i.headline.slice(0, at + (split === "? " ? 1 : 0)); head = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(10,20,40,.3);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(10,20,40,.3);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:14px}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:${N.muted};max-width:840px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:${N.muted}}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

/** A hand-drawn loop over a box of w x h (an ellipse that overshoots its start). */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, halo = null, grow = 0, sq = 2 } = {}) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2, NN = 56, start = r() * 6.28;
  const pts = [];
  for (let k = 0; k <= NN; k++) {
    const t = k / NN, a = start + t * Math.PI * 2 * 1.08;
    const wob = 1 + 0.02 * Math.sin(t * 11 + seed) + t * 0.04;
    const c = Math.cos(a), sn = Math.sin(a), e = 2 / sq;
    pts.push(`${(cx + Math.sign(c) * Math.abs(c) ** e * (w / 2 - sw) * wob).toFixed(1)},${(cy + Math.sign(sn) * Math.abs(sn) ** e * (h / 2 - sw) * wob).toFixed(1)}`);
  }
  const d = `M${pts.join(" L")}`;
  return `<svg style="position:absolute;left:${-grow}px;top:${-grow}px;overflow:visible;pointer-events:none" width="${w + grow * 2}" height="${h + grow * 2}" viewBox="${-grow} ${-grow} ${w + grow * 2} ${h + grow * 2}" aria-hidden="true">${halo ? `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${sw + 8}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A loop that fits whatever text is inside the span (stretches with it). */
const timeRing = (t, { sw = 4 } = {}) => `<span style="position:relative;display:inline-block;white-space:nowrap;padding:0 12px;margin:0 -4px">${esc(t)}<svg style="position:absolute;left:-2px;top:-6px;width:calc(100% + 4px);height:calc(100% + 12px);overflow:visible" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden="true"><path d="M10 30 C 2 12, 30 2, 55 3 C 85 4, 99 14, 96 28 C 93 43, 62 49, 38 47 C 14 45, 3 33, 9 16" fill="none" stroke="${C.mulberry}" stroke-width="${sw}" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span>`;

function scribbles(w, h, r, { rows = 4, color = "#5a4a2a", op = 0.4, x0 = 0.12, y0 = 0.22, span = 0.6 } = {}) {
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (y0 + (k / rows) * span) + r() * 4;
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

/** A butter sticky note; `inner` is html, `scrib` draws unreadable scribbles. */
function sticky({ x, y, w, h = w, rot = 0, inner = "", scrib = null, z = 6, tone = ["#f6e08f", "#efcc66"], extra = "" }) {
  const sv = scrib ? `<svg style="position:absolute;inset:0" viewBox="0 0 ${w} ${h}" aria-hidden="true">${scribbles(w, h, rng(scrib.seed), scrib)}</svg>` : "";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${tone[0]},${tone[1]});box-shadow:0 1px 2px rgba(0,0,0,.35),0 10px 14px rgba(10,20,40,.34);z-index:${z};${extra}`)}"><div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div>${sv}${inner}</div>`;
}

/** The inside of a 200x200 clock face (no numerals): rim, face, twelve ticks, two hands. */
function clockInner({ h, m, rim = "brass", face = N.white, ink = N.navy }) {
  const g = uid("rg"), f = uid("fc");
  const stops = { brass: ["#f3dc9b", "#b98a3a", "#6f4f14"], navy: ["#5b75a3", "#2d4268", "#0e172b"], white: ["#ffffff", "#d9dde5", "#98a2b4"] }[rim];
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const pt = (a, L) => `${(100 + L * Math.sin((a * Math.PI) / 180)).toFixed(1)} ${(100 - L * Math.cos((a * Math.PI) / 180)).toFixed(1)}`;
  let t = "";
  for (let k = 0; k < 12; k++) {
    const big = k % 3 === 0;
    t += `<path d="M${pt(k * 30, 79)} L${pt(k * 30, big ? 61 : 69)}" stroke="${ink}" stroke-width="${big ? 7 : 4}" stroke-linecap="round"/>`;
  }
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset=".5" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[2]}"/></linearGradient>
  <radialGradient id="${f}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${face}"/></radialGradient></defs>
  <circle cx="100" cy="100" r="98" fill="url(#${g})"/><circle cx="100" cy="100" r="88" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="3"/>
  <circle cx="100" cy="100" r="85" fill="url(#${f})"/><circle cx="100" cy="100" r="85" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
  ${t}
  <path d="M${pt(ha + 180, 9)} L${pt(ha, 46)}" stroke="${ink}" stroke-width="9" stroke-linecap="round"/>
  <path d="M${pt(ma + 180, 12)} L${pt(ma, 68)}" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="100" cy="100" r="8" fill="${stops[1]}" stroke="${ink}" stroke-width="2"/>`;
}

/** A round clock (wall clock or the small faces on cards). */
function clock({ x, y, d, h = 10, m = 10, rim = "brass", face, ink, z = 5, tilt = 0, shadow = 1, check = "" }) {
  const sh = shadow ? `filter:drop-shadow(${d * 0.05}px ${d * 0.09}px ${d * 0.07}px rgba(10,20,40,.45));` : "";
  return `<svg ${check ? `data-check="${check}"` : ""} style="${abs(x, y, d, d, `z-index:${z};transform:rotate(${tilt}deg);${sh}`)}" viewBox="0 0 200 200" aria-hidden="true">${clockInner({ h, m, rim, face, ink })}</svg>`;
}

/** A wristwatch lying upright: strap above and below, a brass case, a face. */
function watch({ x, y, w = 190, rot = 0, h = 10, m = 10, z = 5 }) {
  const hh = w * 1.9;
  return `<svg style="${abs(x, y, w, hh, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(10px 16px 12px rgba(40,20,30,.4))`)}" viewBox="0 0 200 380" aria-hidden="true">
    <path d="M58 6 H142 L136 130 H64 Z" fill="${N.navyMid}"/><path d="M58 6 H142 L140 40 H60Z" fill="#fff" opacity=".07"/>
    <path d="M64 250 H136 L142 374 H58 Z" fill="${N.navyMid}"/>
    <g stroke="#9db0d3" stroke-opacity=".6" stroke-width="3" stroke-dasharray="7 6" fill="none"><path d="M70 12 L74 128 M130 12 L126 128 M72 254 L66 368 M128 254 L134 368"/></g>
    <g fill="${N.navyDeep}"><circle cx="100" cy="292" r="5"/><circle cx="100" cy="318" r="5"/><circle cx="100" cy="344" r="5"/></g>
    <rect x="84" y="268" width="32" height="8" fill="#000" opacity=".0"/>
    <g transform="translate(100 190) scale(.74) translate(-100 -100)">${clockInner({ h, m, rim: "brass", face: "#f4f1e8" })}</g>
    <rect x="166" y="180" width="14" height="20" rx="4" fill="${N.brass}" transform="translate(-4 0)"/></svg>`;
}

/** A twin-bell brass alarm clock. */
function alarmClock({ x, y, w = 300, rot = 0, h = 10, m = 10, z = 6 }) {
  const hh = w * 1.08;
  return `<svg style="${abs(x, y, w, hh, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(14px 22px 14px rgba(40,25,5,.45))`)}" viewBox="0 0 300 324" aria-hidden="true">
    <defs><linearGradient id="bell${UID}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc9b"/><stop offset=".55" stop-color="#b98a3a"/><stop offset="1" stop-color="#6f4f14"/></linearGradient></defs>
    <path d="M70 62 A44 44 0 0 1 132 30 Z" fill="url(#bell${UID})" transform="rotate(-10 100 60)"/>
    <path d="M230 62 A44 44 0 0 0 168 30 Z" fill="url(#bell${UID})" transform="rotate(10 200 60)"/>
    <rect x="144" y="12" width="12" height="46" rx="4" fill="${N.navyDeep}"/><circle cx="150" cy="12" r="12" fill="url(#bell${UID})"/>
    <path d="M70 280 L52 318 M230 280 L248 318" stroke="${N.brassDeep}" stroke-width="14" stroke-linecap="round"/>
    <g transform="translate(150 180) scale(1.34) translate(-100 -100)">${clockInner({ h, m, rim: "brass", face: N.white })}</g>
    <rect x="132" y="22" width="36" height="10" rx="5" fill="#fff" opacity=".0"/></svg>`;
}

/** A pen lying flat. */
function pen({ x, y, len = 360, rot = 0, color = N.navyMid, z = 9 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(10,20,40,.4));z-index:${z}`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${color}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${N.brassLight}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${N.brassLight}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#22252b"/></svg>`;
}

const exTag = (x, y, rot = 0, z = 20) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

const brassPin = (x, y, s = 30, z = 14) => `<div style="${abs(x, y, s, s, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#f6e3a8,#b98a3a 60%,#6f4f14);box-shadow:0 4px 5px rgba(0,0,0,.4);z-index:${z}`)}"></div>`;

/* ================================================================ #32 */
function p32() {
  const n = 32;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e7eb", size: 84, textTop: 78 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(120% 80% at 30% 20%,#ebe0e5,#dccfd6 60%,#cdbec7)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(95,61,75,.045) 0 2px,transparent 2px 9px),repeating-linear-gradient(0deg,rgba(95,61,75,.04) 0 2px,transparent 2px 9px)")}"></div>`;

  const CX = 150, CW = 520, CH = 138, Y0 = 398, STEP = 152;
  const line = `<div style="${abs(104, Y0 + 20, 8, STEP * 5 + CH - 40, `background:${C.mulberry};border-radius:4px;z-index:3`)}"></div>`;
  let cards = "";
  i.items.forEach((t, k) => {
    const at = t.indexOf(": ");
    const range = t.slice(0, at), step = t.slice(at + 2);
    const m = range.match(/(\d+) to (\d+)/);
    const a = Number(m[1]), b = Number(m[2]);
    const y = Y0 + k * STEP;
    const rot = [-0.5, 0.4, -0.3, 0.5, -0.4, 0.3][k];
    let strip = "";
    for (let c = 0; c < 10; c++) strip += `<div style="flex:1;height:10px;border-radius:3px;background:${c >= a && c < b ? N.brass : "#e5dccb"}"></div>`;
    cards += `
    <div style="${abs(104 - 13, y + CH / 2 - 13, 26, 26, `border-radius:50%;background:${C.mulberry};box-shadow:0 0 0 6px #e0d3da;z-index:4`)}"></div>
    <div style="${abs(CX, y, CW, CH, `transform:rotate(${rot}deg);background:linear-gradient(#fdf8ee,#f8f0e0);border-radius:10px;box-shadow:0 1px 2px rgba(60,30,45,.3),0 14px 22px rgba(60,30,45,.28);z-index:5`)}">
      <div style="position:absolute;left:0;right:0;top:0;height:3px;background:#e6a9b8;margin-top:40px;opacity:.0"></div>
      <div style="position:absolute;left:28px;top:14px;font:600 24px/1 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${N.navyMid}">${esc(range)}</div>
      <div class="hand" data-check="step${k}" style="position:absolute;left:28px;right:20px;top:40px;height:72px;font:600 58px/66px 'Hand',cursive;color:${N.navy};white-space:nowrap">${esc(step)}</div>
      <div style="position:absolute;left:28px;right:28px;bottom:14px;display:flex;gap:5px">${strip}</div>
    </div>`;
  });
  const lastY = Y0 + 5 * STEP;
  const note = sticky({ x: CX + CW - 74, y: lastY - 40, w: 150, h: 128, rot: 7, scrib: { seed: 4, rows: 3 }, z: 8 });

  // The ceiling: a clock at ten, the sub on a navy card, a wristwatch.
  const cl = clock({ x: 740, y: 396, d: 220, h: 10, m: 0, rim: "brass", z: 5, check: "clock" });
  const subCard = `<div style="${abs(716, 650, 262, 318, `transform:rotate(1.8deg);background:linear-gradient(160deg,${N.navyMid},${N.navyDeep});border-radius:14px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 22px 30px rgba(10,20,40,.4);z-index:6`)}">
    <div data-check="sub" style="position:absolute;left:24px;right:22px;top:38px;font:500 29px/1.3 'Plex',sans-serif;color:#fbf9f3">${esc(i.sub)}</div></div>${brassPin(838, 636, 32, 12)}`;
  const wr = watch({ x: 770, y: 985, w: 170, rot: 8, h: 10, m: 10, z: 5 });

  const body = `${ground}${line}${cards}${note}${cl}${subCard}${wr}${fh}`;
  return { n, id: `${n}-task-paralysis-next-ten-minutes`, html: page(p, { body, css: fc, paper: "#f1e7eb", ink: N.navy, muted: N.muted }) };
}

/* ================================================================ #82 */
const smooth = (pts) => {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let k = 1; k < pts.length; k++) {
    const [x0, y0] = pts[k - 1], [x1, y1] = pts[k];
    d += ` Q${x0 + (x1 - x0) / 2} ${Math.max(y0, y1) + 14} ${x1} ${y1}`;
  }
  return d;
};

function wallCalendar({ x, y, w, h, rot = 0, circled = [], z = 5, rows = 5, still = null }) {
  const bandH = 64, padX = 20, gx = padX, gy = bandH + 52, cw = (w - padX * 2) / 7, ch = (h - gy - 18) / rows;
  let cells = "", rings = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < 7; c++) {
    cells += `<rect x="${gx + c * cw + 3}" y="${gy + r * ch + 3}" width="${cw - 6}" height="${ch - 6}" rx="5" fill="#fff" stroke="#c9d0dd" stroke-width="2"/>`;
  }
  let head = "";
  for (let c = 0; c < 7; c++) head += `<rect x="${gx + c * cw + 12}" y="${bandH + 24}" width="${cw - 24}" height="8" rx="4" fill="#c9d0dd"/>`;
  circled.forEach(([r, c], k) => {
    rings += `<div style="${abs(gx + c * cw - 4, gy + r * ch - 4, cw + 8, ch + 8)}">${ring(cw + 8, ch + 8, { sw: 6, seed: 7 + k, color: N.navy })}</div>`;
  });
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(12px 20px 14px rgba(0,0,0,.45))`)}">
    <svg style="position:absolute;inset:0" viewBox="0 0 ${w} ${h}" aria-hidden="true">
      <rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="${N.white}"/>
      <path d="M0 10 Q0 0 10 0 H${w - 10} Q${w} 0 ${w} 10 V${bandH} H0Z" fill="${N.navyMid}"/>
      <rect x="0" y="${bandH - 8}" width="${w}" height="8" fill="#000" opacity=".16"/>
      ${head}${cells}
      <g fill="${N.brassDeep}"><rect x="${w * 0.2 - 8}" y="-14" width="16" height="46" rx="8"/><rect x="${w * 0.8 - 8}" y="-14" width="16" height="46" rx="8"/></g>
      <g fill="url(#cb)"><rect x="${w * 0.2 - 6}" y="-14" width="12" height="46" rx="6" fill="${N.brassLight}"/><rect x="${w * 0.8 - 6}" y="-14" width="12" height="46" rx="6" fill="${N.brassLight}"/></g>
    </svg>${rings}</div>`;
}

/** A page torn off a calendar: ragged top edge, faint grid, a curled corner. */
function tornPage({ x, y, w, h, rot = 0, z = 5 }) {
  const r = rng(21);
  let top = "";
  for (let k = 0; k <= 22; k++) top += `${((k / 22) * 100).toFixed(1)}% ${(r() * 14).toFixed(1)}px,`;
  const cols = 7, rows = 4, cw = (w - 40) / cols, ch = (h - 120) / rows;
  let cells = "";
  for (let a = 0; a < rows; a++) for (let b = 0; b < cols; b++) cells += `<rect x="${20 + b * cw + 3}" y="${96 + a * ch + 3}" width="${cw - 6}" height="${ch - 6}" rx="5" fill="#fff" stroke="#c9d0dd" stroke-width="2"/>`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(10px 16px 12px rgba(0,0,0,.45))`)}">
    <div style="position:absolute;inset:0;background:linear-gradient(170deg,#ffffff,#eef0f3);clip-path:polygon(${top}100% 100%,0 100%)"></div>
    <svg style="position:absolute;inset:0" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect x="20" y="52" width="${w - 40}" height="14" rx="7" fill="#c9d0dd"/>${cells}
      <path d="M${w - 70} ${h} L${w} ${h - 70} L${w} ${h}Z" fill="#cfd5df"/><path d="M${w - 70} ${h} L${w} ${h - 70} L${w - 56} ${h - 56}Z" fill="#fff" opacity=".7"/></svg></div>`;
}

function p82() {
  const n = 82;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e6ebf3", size: 88, textTop: 80 });

  const felt = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 75% at 50% 22%,#2c426a,#1b2d4e 55%,#111d36)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px),repeating-linear-gradient(0deg,rgba(0,0,0,.08) 0 1px,transparent 1px 5px)")}"></div>`;

  // The string: a sag between two brass nails, tags hung from loops along it.
  const SY = 424, SAG = 120;
  const sy = (x) => { const t = (x + 20) / 1040; return SY + SAG * t * (1 - t) * 2 * 0.5 * 2 / 1; };
  const curveY = (x) => { const t = (x + 20) / 1040; return SY + (SAG * 2 * t * (1 - t)); };
  const twine = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:8;filter:drop-shadow(0 6px 4px rgba(0,0,0,.4))" viewBox="0 0 1000 1500" aria-hidden="true"><path d="M-20 ${SY} Q500 ${SY + SAG * 2} 1020 ${SY}" fill="none" stroke="#d6bd86" stroke-width="7" stroke-linecap="round"/><path d="M-20 ${SY} Q500 ${SY + SAG * 2} 1020 ${SY}" fill="none" stroke="#8d7338" stroke-width="2" stroke-dasharray="3 9"/></svg>`;
  const nails = `${brassPin(8, SY - 14, 30, 9)}${brassPin(962, SY - 14, 30, 9)}`;

  const TW = 292, gap = 22, X0 = 28;
  const widths = [0.2, 0.55, 1];
  const rots = [-1.6, 0.8, 1.8];
  let tags = "";
  i.items.forEach((t, k) => {
    const at = t.indexOf(": ");
    const head = t.slice(0, at);
    let body = esc(t.slice(at + 2));
    if (k === 2) body = body.replace("still-needed check", `<b style="color:${C.mulberry};font-weight:700"><span style="white-space:nowrap">still-needed</span> check</b>`);
    const tx = X0 + k * (TW + gap);
    const cxm = tx + TW / 2;
    const top = curveY(cxm) + 50;
    const TH = 432;
    const tagPoly = "polygon(16% 0,84% 0,100% 7%,100% 100%,0 100%,0 7%)";
    tags += `
    <div style="${abs(tx, top, TW, TH, `transform:rotate(${rots[k]}deg);transform-origin:50% 0;z-index:9;filter:drop-shadow(0 3px 2px rgba(0,0,0,.35)) drop-shadow(10px 20px 14px rgba(0,0,0,.4))`)}">
      <div style="position:absolute;inset:0;background:linear-gradient(170deg,#fffaf0,#f3ead6);clip-path:${tagPoly}"></div>
      <div style="position:absolute;left:${TW / 2 - 17}px;top:20px;width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#f0d58d,${N.brass} 60%,${N.brassDeep});box-shadow:inset 0 0 0 9px ${N.brass}"><div style="position:absolute;inset:9px;border-radius:50%;background:#1b2d4e"></div></div>
      <div style="position:absolute;left:26px;right:26px;top:76px;height:16px;border-radius:8px;background:#e1d8c3"><div style="width:${widths[k] * 100}%;height:100%;border-radius:8px;background:${N.navyMid}"></div></div>
      <div style="position:absolute;left:26px;right:12px;top:104px;bottom:16px">
        <div class="hand" data-check="tag${k}" style="text-wrap:balance;font:700 47px/58px 'Hand',cursive;color:${N.navy};margin-bottom:8px">${esc(head)}</div>
        <div data-check="line${k}" style="font:500 28px/1.27 'Plex',sans-serif;color:#2b3652">${body}</div></div>
    </div>
    <div style="position:absolute;left:${cxm - 2}px;top:${curveY(cxm) - 6}px;width:4px;height:${top - curveY(cxm) + 40}px;z-index:10;background:#d6bd86;box-shadow:0 3px 3px rgba(0,0,0,.4)"></div>`;
  });

  // The third tag is where the wall calendar's page comes off.
  const tickDisc = `<svg style="${abs(792, 432 + 72, 74, 74, "z-index:11;filter:drop-shadow(0 4px 5px rgba(0,0,0,.35))")}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const torn = tornPage({ x: 56, y: 1040, w: 330, h: 296, rot: -7, z: 6 });
  const cal = wallCalendar({ x: 520, y: 1056, w: 410, h: 282, rot: 2, circled: [[2, 4]], z: 7 });
  const pinBig = brassPin(716, 1070, 30, 12);

  const body = `${felt}${twine}${nails}${torn}${cal}${tags}${fh}`;
  return { n, id: `${n}-restart-after-a-week-month-longer`, html: page(p, { body, css: fc, paper: "#e6ebf3", ink: N.navy, muted: N.muted }) };
}

/* ================================================================ #84 */
function jaggedPoly(w, h, seed) {
  const r = rng(seed);
  const pts = ["0 0", `${w} 0`];
  for (let k = 0; k <= 8; k++) pts.push(`${(w - r() * 11).toFixed(1)} ${(k / 8 * h * 0.92).toFixed(1)}`);
  for (let k = 0; k <= 22; k++) pts.push(`${(w - (k / 22) * w).toFixed(1)} ${(h - r() * 20).toFixed(1)}`);
  return `polygon(${pts.join(",")})`;
}

function p84() {
  const n = 84;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#edf0f4", size: 72, textTop: 70 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(#e3e9f0,#d4dce7)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(45,66,104,.07) 0 3px,transparent 3px 46px)")}"></div>`;

  const clk = clock({ x: 395, y: 392, d: 210, h: 3, m: 30, rim: "brass", z: 6, check: "clock" });
  const hook = `<div style="${abs(486, 380, 28, 22, `background:${N.brassDeep};border-radius:0 0 14px 14px;z-index:5`)}"></div>`;
  const lab = (t, x, color, align) => `<div class="hand" style="${abs(x, 452, 330, 70, `font:700 66px/1 'Hand',cursive;color:${color};text-align:${align};z-index:6`)}">${t}</div>`;
  const labels = lab("Vague", 40, "#6a7384", "left") + lab("Exact", 630, N.navy, "right");

  const pairs = i.items.map((t) => t.split(" / "));
  const rings = ["3:30", "2:00", "10:00", null, "3:30"];
  const times = [[3, 30], [2, 0], [10, 0], null, [3, 30]];
  const RH = 132, GAP = 11, Y0 = 626;
  const LX = 26, LW = 388, RX = 514, RW = 462;
  let rows = "";
  pairs.forEach(([vague, exact], k) => {
    const y = Y0 + k * (RH + GAP);
    const r = rng(40 + k);
    const rot = (r() - 0.5) * 3.4;
    // vague: a torn grey sticky note
    rows += `
    <div style="${abs(LX + (k % 2) * 10, y, LW, RH, `transform:rotate(${rot.toFixed(1)}deg);z-index:4;filter:drop-shadow(0 8px 8px rgba(30,40,60,.3))`)}">
      <div style="position:absolute;inset:0;background:linear-gradient(172deg,#dcdfe3,#c3c8cd);clip-path:${jaggedPoly(LW, RH, 90 + k)}"></div>
      <div style="position:absolute;left:0;right:0;top:0;height:14%;background:rgba(255,255,255,.22)"></div>
      <div class="hand" data-check="vague${k}" style="position:absolute;left:26px;right:22px;top:0;bottom:8px;display:flex;align-items:center;font:600 46px/1 'Hand',cursive;color:#667080">${esc(vague)}</div>
    </div>`;
    // arrow
    rows += `<svg style="position:absolute;left:${LX + LW + 6}px;top:${y + RH / 2 - 20}px;z-index:5" width="84" height="40" viewBox="0 0 84 40" aria-hidden="true"><path d="M2 20 H70" stroke="${N.navyMid}" stroke-width="3.5" stroke-linecap="round"/><path d="M58 8 L76 20 L58 32" fill="none" stroke="${N.navyMid}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    // exact: a crisp cream card with a small clock face
    let txt = esc(exact);
    if (rings[k]) txt = txt.replace(rings[k], timeRing(rings[k]));
    const face = times[k]
      ? clock({ x: 20, y: (RH - 84) / 2, d: 84, h: times[k][0], m: times[k][1], rim: "navy", z: 2, shadow: 0 }).replace("position:absolute", "position:absolute")
      : `<div style="${abs(20, (RH - 84) / 2, 84, 84, `border-radius:50%;background:${N.navyMid};display:grid;place-items:center;box-shadow:inset 0 0 0 5px ${N.brass}`)}">${icon("flag", { size: 40, color: "#fbf9f3", weight: "fill" })}</div>`;
    rows += `
    <div style="${abs(RX, y, RW, RH, `background:#fffdf8;border-radius:10px;box-shadow:0 1px 2px rgba(10,20,40,.3),0 12px 18px rgba(10,20,40,.22);z-index:4;border-left:8px solid ${N.brass}`)}">
      ${face}
      <div data-check="exact${k}" style="position:absolute;left:126px;right:16px;top:0;bottom:0;display:flex;align-items:center;font:600 30px/1.24 'Plex',sans-serif;color:${N.navy}">
        <div>${txt}</div></div>
    </div>`;
  });

  const body = `${wall}${hook}${clk}${labels}${rows}${fh}`;
  return { n, id: `${n}-time-blindness-vague-vs-exact`, html: page(p, { body, css: fc, paper: "#edf0f4", ink: N.navy, muted: N.muted }) };
}

/* ================================================================ #86 */
function keys({ x, y, w = 130, rot = 0, z = 9 }) {
  return `<svg style="${abs(x, y, w, w * 1.1, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(6px 10px 7px rgba(0,0,0,.4))`)}" viewBox="0 0 120 132" aria-hidden="true">
    <g transform="rotate(22 60 44)"><circle cx="60" cy="52" r="14" fill="#aeb7c6"/><circle cx="60" cy="52" r="5" fill="#fff" opacity=".7"/><rect x="55" y="64" width="10" height="60" rx="2" fill="#aeb7c6"/><path d="M65 96h13v8H65zM65 110h9v8H65z" fill="#aeb7c6"/></g>
    <g transform="rotate(-16 60 44)"><circle cx="60" cy="52" r="15" fill="#e3bd66"/><circle cx="60" cy="52" r="5.5" fill="#fff" opacity=".7"/><rect x="55" y="65" width="10" height="62" rx="2" fill="#e3bd66"/><path d="M55 98h-13v8h13zM55 112h-9v8h9z" fill="#e3bd66"/></g>
    <circle cx="60" cy="22" r="15" fill="none" stroke="#7d8798" stroke-width="6"/></svg>`;
}
function shoe({ x, y, w = 210, rot = 0, z = 8 }) {
  return `<svg style="${abs(x, y, w, w * 0.5, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(8px 12px 8px rgba(0,0,0,.4))`)}" viewBox="0 0 220 110" aria-hidden="true">
    <path d="M10 78 C8 52 22 44 44 40 L74 36 C84 24 106 20 124 30 C150 44 186 54 208 66 C216 72 214 84 204 86 L18 86 C10 86 10 82 10 78Z" fill="${N.navyMid}"/>
    <path d="M44 40 L74 36 C84 24 106 20 124 30 L112 48 C92 44 66 46 44 40Z" fill="#fff" opacity=".1"/>
    <g stroke="#e8ecf4" stroke-width="5" stroke-linecap="round"><path d="M90 34 l22 14 M106 28 l20 14 M122 30 l18 12"/></g>
    <rect x="6" y="78" width="206" height="18" rx="9" fill="${N.white}"/><rect x="6" y="88" width="206" height="4" fill="#000" opacity=".12"/></svg>`;
}
function folder({ x, y, w = 200, rot = 0, z = 7 }) {
  const h = w * 0.72;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(8px 12px 8px rgba(0,0,0,.4))`)}" viewBox="0 0 200 144" aria-hidden="true">
    <path d="M6 20 Q6 8 18 8 H70 L84 22 H182 Q194 22 194 34 V128 Q194 138 184 138 H16 Q6 138 6 128Z" fill="#c9a96a"/>
    <rect x="18" y="32" width="164" height="90" rx="3" fill="#fbf9f3" transform="rotate(-2 100 80)"/><g stroke="#c9d0dd" stroke-width="4" stroke-linecap="round" transform="rotate(-2 100 80)"><path d="M32 52H140M32 68H156M32 84H120"/></g>
    <path d="M6 54 Q6 44 18 44 H182 Q194 44 194 54 V128 Q194 138 184 138 H16 Q6 138 6 128Z" fill="#dcc183"/></svg>`;
}

function p86() {
  const n = 86;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f6f0e4", size: 72, textTop: 72 });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(100deg,#7b5436,#6a452b 50%,#5a3b24)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(97deg,rgba(255,220,170,.07) 0 3px,transparent 3px 19px),repeating-linear-gradient(93deg,rgba(0,0,0,.1) 0 2px,transparent 2px 41px)")}"></div>`;

  const card = `<div style="${abs(34, 404, 932, 926, "transform:rotate(-0.6deg);background:linear-gradient(#fffdf8,#f7f3ea);border-radius:18px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 28px 40px rgba(20,10,5,.5);z-index:3")}"></div>`;
  const ex = exTag(72, 436, -1);
  const sub = `<div data-check="sub" style="${abs(72, 486, 610, 80, `font:500 27px/1.3 'Plex',sans-serif;color:${N.muted};z-index:4;transform:rotate(-0.6deg)`)}">${esc(i.sub)}</div>`;
  const clk = clock({ x: 726, y: 424, d: 214, h: 10, m: 0, rim: "brass", z: 5, check: "clock" });

  const RH = 116, GAP = 30, Y0 = 590, DX = 52, RW = 540, X0 = 66;
  let rows = "";
  i.items.forEach((t, k) => {
    const at = t.lastIndexOf(": ");
    const label = t.slice(0, at), time = t.slice(at + 2);
    const alarm = time.includes("alarm");
    const tm = alarm ? time.replace(" alarm", "") : time;
    const y = Y0 + k * (RH + GAP);
    const x = X0 + k * DX;
    const chip = `<div style="position:absolute;left:0;top:0;bottom:0;width:164px;background:${alarm ? N.navy : N.navyMid};border-radius:12px 0 0 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fbf9f3">
      <div class="serif" style="font:500 50px/1 'Newsreader',serif;letter-spacing:-.01em">${esc(tm)}</div>${alarm ? `<div style="display:flex;align-items:center;gap:6px;font:600 24px/1 'Plex',sans-serif;margin-top:6px;color:${N.brassLight}">${icon("bell-ringing", { size: 26, color: N.brassLight, weight: "fill" })}alarm</div>` : ""}</div>`;
    rows += `
    <div style="${abs(x, y, RW, RH, `background:linear-gradient(#fff7e4,#f6ecd2);border-radius:12px;box-shadow:0 1px 2px rgba(40,25,10,.35),0 10px 14px rgba(40,25,10,.25);z-index:6;transform:rotate(${[-0.5, 0.4, -0.3, 0.5, -0.4][k]}deg)`)}">
      ${chip}
      <div data-check="step${k}" style="position:absolute;left:182px;right:18px;top:0;bottom:0;display:flex;align-items:center;font:600 29px/1.2 'Plex',sans-serif;color:${N.navy}">${esc(label)}</div>
      ${alarm ? `<div style="position:absolute;left:-14px;top:-12px;width:192px;height:${RH + 24}px;z-index:2">${ring(192, RH + 24, { sw: 7, seed: 9, sq: 3 })}</div>` : ""}
    </div>`;
    if (k < 4) rows += `<svg style="position:absolute;left:${x + DX + 40}px;top:${y + RH + 2}px;z-index:6" width="40" height="24" viewBox="0 0 40 24" aria-hidden="true"><path d="M6 4 L20 18 L34 4" fill="none" stroke="${N.brass}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  });

  // keys, shoe and a papers folder, at the Shoes, keys, papers step.
  const still = `${folder({ x: 752, y: 790, w: 206, rot: 5, z: 7 })}${shoe({ x: 748, y: 1000, w: 206, rot: -3, z: 8 })}${keys({ x: 822, y: 880, w: 120, rot: 14, z: 9 })}`;

  const body = `${desk}${card}${ex}${sub}${clk}${rows}${still}${fh}`;
  return { n, id: `${n}-how-to-stop-being-late-leave-time`, html: page(p, { body, css: fc, paper: "#f6f0e4", ink: N.navy, muted: N.muted }) };
}

/* ================================================================ #88 */
function phoneShell({ x, y, w, h, rot = 0, screen = "", z = 5 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(16px 26px 18px rgba(40,25,5,.5))`)}">
    <div style="position:absolute;inset:0;border-radius:54px;background:linear-gradient(150deg,#3a4a6c,#0f182b)"></div>
    <div style="position:absolute;left:14px;top:14px;right:14px;bottom:14px;border-radius:42px;background:#eef0f5;overflow:hidden">${screen}</div></div>`;
}

function p88() {
  const n = 88;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f4ecd9", size: 88, textTop: 80 });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 30% 15%,#e9cf8c,#d6b366 55%,#bd9544)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(0deg,rgba(120,80,10,.07) 0 1px,transparent 1px 4px)")}"></div>`;

  const PW = 404, PH = 760, PY = 420;
  const bar = `<div style="position:absolute;left:30px;right:30px;bottom:70px;height:84px;border-radius:42px;background:#dde1ea;box-shadow:inset 0 2px 4px rgba(0,0,0,.12)"><div style="position:absolute;left:8px;top:8px;width:68px;height:68px;border-radius:50%;background:#fff;box-shadow:0 3px 6px rgba(0,0,0,.25);display:grid;place-items:center">${icon("caret-right", { size: 36, color: N.navyMid, weight: "bold" })}</div></div>`;
  const head = (tone) => `<div style="position:absolute;left:0;right:0;top:0;height:110px;display:flex;justify-content:center"><div style="margin-top:14px;width:118px;height:32px;border-radius:16px;background:#0f182b"></div></div>
    <div style="position:absolute;left:0;right:0;top:128px;display:flex;justify-content:center"><div style="width:84px;height:84px;border-radius:50%;background:${tone};display:grid;place-items:center">${icon("bell-ringing", { size: 46, color: N.navy, weight: "fill" })}</div></div>`;

  // left: Call the dentist, flicked away.
  const leftScreen = `${head("#dfe4ee")}
    <div style="position:absolute;left:34px;top:244px;width:300px;height:210px;border-radius:26px;background:#fff;box-shadow:0 0 0 2px #e3e6ee;opacity:.35;transform:translateX(26px) rotate(5deg)"></div>
    <div style="position:absolute;left:30px;top:246px;width:312px;height:208px;border-radius:26px;background:#fff;box-shadow:0 8px 22px rgba(20,30,60,.18);transform:translateX(8px) rotate(2deg)">
      <div data-check="before" style="position:absolute;left:28px;right:24px;top:0;bottom:0;display:flex;align-items:center;font:600 44px/1.15 'Plex',sans-serif;color:${N.navy}">${esc(i.items[0])}</div></div>
    <svg style="position:absolute;left:34px;top:490px" width="330" height="100" viewBox="0 0 330 100" aria-hidden="true"><g fill="none" stroke="#6a7792" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 46 C 110 20, 200 24, 292 52"/><path d="M262 22 L296 54 L258 74"/></g><g stroke="#9aa6bd" stroke-width="7" stroke-linecap="round"><path d="M20 70 H78 M54 90 H120"/></g></svg>${bar}`;
  const rightScreen = `${head("#e9dcc0")}
    <div style="position:absolute;left:30px;top:236px;width:332px;height:246px;border-radius:26px;background:#fff;box-shadow:0 8px 22px rgba(20,30,60,.18)">
      <div data-check="after" style="position:absolute;left:32px;right:28px;top:0;bottom:0;display:flex;align-items:center;font:600 42px/1.16 'Plex',sans-serif;color:${N.navy}">${esc(i.items[1])}</div>
      <div style="position:absolute;left:-22px;top:-24px;width:376px;height:294px">${ring(376, 294, { sw: 9, seed: 5, sq: 3.2 })}</div></div>${bar.replace("#dde1ea", "#dde1ea")}`;

  const phL = phoneShell({ x: 44, y: PY, w: PW, h: PH, rot: -2.2, screen: leftScreen, z: 5 });
  const phR = phoneShell({ x: 548, y: PY - 6, w: PW, h: PH, rot: 1.8, screen: rightScreen, z: 6 });
  const note = sticky({ x: 868, y: 452, w: 104, h: 104, rot: 8, scrib: { seed: 6, rows: 3 }, z: 12 });

  const subCard = `<div style="${abs(40, 1196, 636, 138, `background:linear-gradient(160deg,${N.navyMid},${N.navyDeep});border-radius:14px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 18px 26px rgba(40,25,5,.4);z-index:8;transform:rotate(-0.5deg)`)}">
    <div data-check="sub" style="position:absolute;left:28px;right:26px;top:0;bottom:0;display:flex;align-items:center;font:500 27px/1.3 'Plex',sans-serif;color:#fbf9f3">${esc(i.sub)}</div></div>`;
  const alarm = alarmClock({ x: 706, y: 1082, w: 244, rot: 6, h: 10, m: 10, z: 10 });

  const body = `${ground}${phL}${phR}${note}${subCard}${alarm}${fh}`;
  return { n, id: `${n}-adhd-alarm-label-first-step`, html: page(p, { body, css: fc, paper: "#f4ecd9", ink: N.navy, muted: N.muted }) };
}

/* ================================================================ #99 */
function p99() {
  const n = 99;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e8edf4", size: 68, sub: i.sub, split: "? ", textTop: 40 });

  const wallH = 400;
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, wallH, `background:linear-gradient(#25375a,#1a2a47)`)}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, wallH, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 2px,transparent 2px 58px)")}"></div>
  <div style="${abs(0, SCENE_TOP + wallH - 12, 1000, 26, `background:linear-gradient(#d7b56e,#a8812f);box-shadow:0 6px 10px rgba(0,0,0,.4);z-index:4`)}"></div>`;
  const desk = `<div style="${abs(0, SCENE_TOP + wallH + 14, 1000, 1500 - SCENE_TOP - wallH - 14, "background:linear-gradient(#fbf9f3,#efece3)")}"></div>
  <div style="${abs(0, SCENE_TOP + wallH + 14, 1000, 1500 - SCENE_TOP - wallH - 14, "background-image:linear-gradient(rgba(45,66,104,.09) 2px,transparent 2px),linear-gradient(90deg,rgba(45,66,104,.09) 2px,transparent 2px);background-size:50px 50px")}"></div>`;

  const clk = clock({ x: 50, y: 396, d: 300, h: 10, m: 10, rim: "navy", z: 6, check: "clock" });
  const nail = `<div style="${abs(188, 384, 24, 20, `background:${N.brass};border-radius:0 0 12px 12px;z-index:5`)}"></div>`;

  const steps = i.items;
  const numDisc = (k, x, y, tone = C.mulberry) => `<div style="${abs(x, y, 54, 54, `border-radius:50%;background:${tone};color:#fff;display:grid;place-items:center;font:600 32px/1 'Newsreader',serif;z-index:9;box-shadow:0 3px 5px rgba(0,0,0,.3)`)}">${k}</div>`;
  const s1 = `<div style="${abs(384, 410, 580, 236, "background:linear-gradient(#fffdf8,#f4efe3);border-radius:10px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 18px 28px rgba(0,0,0,.4);z-index:7;transform:rotate(0.6deg)")}">
    <div data-check="step1" style="position:absolute;left:84px;right:26px;top:0;bottom:0;display:flex;align-items:center;font:500 30px/1.26 'Plex',sans-serif;color:${N.navy}">${esc(steps[0])}</div></div>${numDisc(1, 400, 430)}`;

  // three index cards: a task and blank start / end lines
  const tasks = ["a phone call", "a form", "a load of laundry"];
  const cap = (s) => s[0].toUpperCase() + s.slice(1);
  const CW = 292, CH = 296, CY = 800;
  let cards = "";
  tasks.forEach((t, k) => {
    const x = 34 + k * (CW + 24);
    const rot = [-2.4, 1.2, -1.2][k];
    const yy = CY + [0, 14, -4][k];
    const lines = (lab, top) => `<div style="position:absolute;left:30px;right:26px;top:${top}px;height:56px"><div style="position:absolute;left:0;top:6px;font:600 25px/1 'Plex',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${N.muted}">${lab}</div><div style="position:absolute;left:0;right:0;bottom:6px;height:3px;background:#8a95ac;border-radius:2px"></div></div>`;
    cards += `<div style="${abs(x, yy, CW, CH, `transform:rotate(${rot}deg);background:#fffdf8;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 20px 26px rgba(10,20,40,.34);z-index:6;background-image:repeating-linear-gradient(transparent 0 47px,#d4def0 47px 49px);background-position:0 70px`)}">
      <div style="position:absolute;left:0;right:0;top:0;height:68px;border-bottom:3px solid #e6a9b8;background:#fffdf8"></div>
      <div class="hand" data-check="task${k}" style="position:absolute;left:22px;right:18px;top:6px;height:60px;display:flex;align-items:center;font:700 42px/1 'Hand',cursive;color:${N.navy};white-space:nowrap">${esc(cap(t))}</div>
      ${lines("start", 88)}${lines("end", 168)}
    </div>`;
  });
  const pn = pen({ x: 410, y: 1046, len: 400, rot: -3, z: 10 });

  const s2 = `<div style="${abs(40, 1150, 330, 176, `background:linear-gradient(160deg,${N.navyMid},${N.navyDeep});border-radius:12px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 18px 26px rgba(10,20,40,.4);z-index:8;transform:rotate(-0.8deg)`)}">
    <div data-check="step2" style="position:absolute;left:90px;right:20px;top:0;bottom:0;display:flex;align-items:center;font:600 32px/1.2 'Plex',sans-serif;color:#fbf9f3">${esc(steps[1])}</div></div>${numDisc(2, 60, 1210)}`;
  const note = `<div style="${abs(400, 1140, 566, 192, "transform:rotate(1.2deg);background:linear-gradient(172deg,#f6e08f,#efcc66);box-shadow:0 1px 2px rgba(0,0,0,.35),0 12px 16px rgba(10,20,40,.34);z-index:8")}">
    <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div>
    <div class="hand" data-check="rule" style="position:absolute;left:26px;right:22px;top:20px;height:120px;font:600 34px/1.08 'Hand',cursive;color:#3a2c14">${esc(steps[2])}</div>
    <div data-check="rulenote" style="position:absolute;left:26px;right:22px;bottom:14px;font:600 24px/1.2 'Plex',sans-serif;color:#5a4a2a">It's a rule of thumb, not a proven fix.</div></div>`;

  const body = `${wall}${desk}${nail}${clk}${s1}${cards}${s2}${note}${pn}${fh}`;
  return { n, id: `${n}-holiday-plans-time-three-tasks`, html: page(p, { body, css: fc, paper: "#e8edf4", ink: N.navy, muted: N.muted }) };
}

export const pins = [p32(), p82(), p84(), p86(), p88(), p99()];
