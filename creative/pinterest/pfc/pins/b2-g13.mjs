/**
 * Batch 2, group G13: the drafting table (steel and wooden rulers, set squares, tracing
 * paper, compasses, a pencil tray, a T-square, a cutting mat, masking tape).
 *
 *   #30  Variable bills worksheet (page 22) on a green cutting mat, steel ruler, set square, bill envelope
 *   #65  Sinking funds worksheet (page 42): a tight crop of the real column headers on a blueprint
 *        board, a tracing-paper slip beside it carrying the guide's example, a compass
 *   #72  Missing information list (page 11) on a pale birch board with a T-square, a pencil tray,
 *        a sticky note and a mug
 *   #56  Debt payoff method comparison (page 38): the two columns and the payoff ladder on a graphite
 *        board with a compass, a set square, a pen and a sticky note
 *   #99  January review (pages 54 and 55) as two staggered crops taped to an ivory drafting sheet,
 *        a wooden scale rule, a set square, a mug and a pencil
 *
 * Words: the idea's own (headline, sub). The only words set by the pin are in the pencilled
 * notes beside a page, never on it: "Car registration, March, $120" with the Example tag (the
 * guide's own example), and "rate?" / "renewal date" (the idea's own examples). The printed
 * pages are shown blank, exactly as printed.
 */
import { esc } from "../../v3/kit.mjs";
import { printable } from "../kit/printable.mjs";
import { sheet, pencil, mug } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
let uid = 0;
const id = (s) => `${s}${++uid}`;
/** A box of w x h centred on (cx, cy), turned by deg. */
const box = (cx, cy, w, h, deg, inner, extra = "") => `<div style="${abs(cx - w / 2, cy - h / 2, w, h, `transform:rotate(${deg}deg);${extra}`)}">${inner}</div>`;
const PENCIL_FONT = `font-family:'Newsreader',Georgia,serif;font-style:italic;color:#2c3038`;

/* ------------------------------------------------------------------ props */

/** A steel ruler lying horizontally (w x 64): brushed steel, ticks along the top edge, no numerals. */
function steelRuler(w, { h = 64 } = {}) {
  const g = id("sr");
  const ticks = [];
  for (let x = 10, k = 0; x < w - 6; x += 8, k++) {
    const th = k % 10 === 0 ? 26 : k % 5 === 0 ? 19 : 11;
    ticks.push(`<line x1="${x}" y1="0" x2="${x}" y2="${th}" stroke="#2b2f36" stroke-width="${k % 10 === 0 ? 2 : 1.3}"/>`);
  }
  return `<svg style="width:${w}px;height:${h}px;filter:drop-shadow(0 12px 9px rgba(0,0,0,.45))" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f5f7"/><stop offset=".45" stop-color="#c8cdd3"/><stop offset=".55" stop-color="#d9dde1"/><stop offset="1" stop-color="#9aa0a8"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="3" fill="url(#${g})"/>${ticks.join("")}
  <rect x="${w - 70}" y="30" width="46" height="14" rx="7" fill="#6e747c" opacity=".55"/><rect x="${w - 70}" y="30" width="46" height="14" rx="7" fill="none" stroke="#fff" stroke-opacity=".5"/>
  <rect y="${h - 5}" width="${w}" height="5" fill="#000" opacity=".16"/></svg>`;
}

/** A wooden triangular architect's scale: pale wood, a coloured stripe, ticks on both long edges. */
function scaleRule(w, { h = 78, wood = "#e7c98c", stripe = "#2f6b57" } = {}) {
  const g = id("sc");
  const ticks = [];
  for (let x = 12, k = 0; x < w - 8; x += 7, k++) {
    const th = k % 10 === 0 ? 24 : k % 5 === 0 ? 17 : 10;
    ticks.push(`<line x1="${x}" y1="0" x2="${x}" y2="${th}" stroke="#4a3515" stroke-width="${k % 10 === 0 ? 2 : 1.2}"/><line x1="${x}" y1="${h}" x2="${x}" y2="${h - th}" stroke="#4a3515" stroke-width="${k % 10 === 0 ? 2 : 1.2}"/>`);
  }
  return `<svg style="width:${w}px;height:${h}px;filter:drop-shadow(0 12px 9px rgba(40,25,5,.45))" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4dfaa"/><stop offset=".5" stop-color="${wood}"/><stop offset="1" stop-color="#c9a561"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="4" fill="url(#${g})"/><rect y="${h / 2 - 7}" width="${w}" height="14" fill="${stripe}"/><rect y="${h / 2 - 7}" width="${w}" height="4" fill="#fff" opacity=".25"/>${ticks.join("")}</svg>`;
}

/** A translucent right-angle set square with a cut-out, a bevelled edge and a few ticks. */
function setSquare(s, { fill = "rgba(244,170,60,.55)", edge = "#b9741a" } = {}) {
  const t = s * 0.28;
  const ticks = [];
  for (let k = 1; k < 14; k++) ticks.push(`<line x1="${(s * k) / 14}" y1="${s}" x2="${(s * k) / 14}" y2="${s - (k % 5 === 0 ? 24 : 13)}" stroke="${edge}" stroke-width="2" opacity=".75"/>`);
  return `<svg style="width:${s}px;height:${s}px;filter:drop-shadow(0 12px 9px rgba(0,0,0,.4))" viewBox="0 0 ${s} ${s}" aria-hidden="true">
  <path fill-rule="evenodd" d="M2 2 L${s - 2} ${s - 2} L2 ${s - 2} Z M${t * 0.75} ${s - t - 6} L${t * 0.75} ${t * 2.3} L${s - t * 2.4} ${s - t - 6} Z" fill="${fill}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M6 6 L${s - 8} ${s - 6}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>${ticks.join("")}</svg>`;
}

/** A drafting compass opened a little: steel legs, a knurled hinge, a needle and a pencil lead. */
function compass(w = 300) {
  const h = w * 1.12;
  const g = id("cp");
  return `<svg style="width:${w}px;height:${h}px;filter:drop-shadow(0 14px 10px rgba(0,0,0,.45))" viewBox="0 0 300 336" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d939b"/><stop offset=".45" stop-color="#f2f4f6"/><stop offset="1" stop-color="#868c94"/></linearGradient></defs>
  <g stroke-linecap="round" fill="none">
    <path d="M150 60 L58 300" stroke="#3b3f46" stroke-width="20"/><path d="M150 60 L58 300" stroke="url(#${g})" stroke-width="15"/>
    <path d="M150 60 L246 262" stroke="#3b3f46" stroke-width="20"/><path d="M150 60 L246 262" stroke="url(#${g})" stroke-width="15"/>
  </g>
  <path d="M58 300 L52 326 L64 300Z" fill="#3a3d42"/>
  <path d="M236 236 L258 246 L252 292 L232 284 Z" fill="#c8a36a" stroke="#3b3f46" stroke-width="3"/><path d="M233 285 L252 292 L243 322 Z" fill="#e9c9a0"/><path d="M240 311 L243 322 L246 312 Z" fill="#2c2f34"/>
  <rect x="204" y="190" width="22" height="30" rx="4" fill="#d8dce1" stroke="#3b3f46" stroke-width="3" transform="rotate(25 215 205)"/>
  <rect x="128" y="22" width="44" height="40" rx="10" fill="#c9cdd3" stroke="#3b3f46" stroke-width="3"/>
  ${[0, 1, 2, 3, 4].map((k) => `<line x1="${134 + k * 8}" y1="26" x2="${134 + k * 8}" y2="58" stroke="#5a6068" stroke-width="2"/>`).join("")}
  <circle cx="150" cy="78" r="15" fill="#e7e9ec" stroke="#3b3f46" stroke-width="3"/><circle cx="150" cy="78" r="5" fill="#6b7078"/>
  <rect x="140" y="4" width="20" height="22" rx="6" fill="#aab0b8" stroke="#3b3f46" stroke-width="3"/></svg>`;
}

/** A tray of wooden pencils standing in a wooden channel, seen from above (vertical, w x h). */
function pencilTray(w = 190, h = 540) {
  const cols = ["#2f6b57", "#d8892b", "#c8452d", "#3b6ea8", "#e7b23f"];
  const lens = [440, 400, 465, 420, 380];
  const pens = cols.map((c, k) => {
    const x = 18 + k * 30;
    return `<g><rect x="${x}" y="${h - 36 - lens[k]}" width="24" height="${lens[k]}" fill="${c}"/><rect x="${x}" y="${h - 36 - lens[k]}" width="7" height="${lens[k]}" fill="#fff" opacity=".28"/><rect x="${x + 17}" y="${h - 36 - lens[k]}" width="7" height="${lens[k]}" fill="#000" opacity=".2"/>
    <path d="M${x} ${h - 36 - lens[k]} L${x + 12} ${h - 80 - lens[k]} L${x + 24} ${h - 36 - lens[k]}Z" fill="#e9c9a0"/><path d="M${x + 8} ${h - 64 - lens[k]} L${x + 12} ${h - 80 - lens[k]} L${x + 16} ${h - 64 - lens[k]}Z" fill="#2c2f34"/></g>`;
  });
  return `<svg style="width:${w}px;height:${h}px;filter:drop-shadow(0 16px 12px rgba(60,40,10,.45))" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <rect x="0" y="60" width="${w}" height="${h - 60}" rx="12" fill="#b88a50"/><rect x="8" y="68" width="${w - 16}" height="${h - 76}" rx="8" fill="#8a6234"/>
  <g transform="translate(0 0)">${pens.join("")}</g>
  <rect x="0" y="${h - 52}" width="${w}" height="52" rx="12" fill="#c99b66"/><rect x="0" y="${h - 52}" width="${w}" height="12" rx="6" fill="#fff" opacity=".22"/><rect x="0" y="${h - 14}" width="${w}" height="14" rx="6" fill="#000" opacity=".18"/></svg>`;
}

/** A T-square: a long blade and its head (the head sits at the left edge of the board). */
function tSquare(w, { blade = 62 } = {}) {
  const g = id("ts");
  return `<svg style="width:${w}px;height:${blade + 60}px;filter:drop-shadow(0 14px 10px rgba(60,40,10,.5))" viewBox="0 0 ${w} ${blade + 60}" aria-hidden="true">
  <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4f2a"/><stop offset=".5" stop-color="#5b3a1d"/><stop offset="1" stop-color="#43290f"/></linearGradient></defs>
  <rect x="60" y="30" width="${w - 60}" height="${blade}" fill="url(#${g})"/><rect x="60" y="30" width="${w - 60}" height="5" fill="#f4dfaa" opacity=".9"/><rect x="60" y="${30 + blade - 12}" width="${w - 60}" height="12" fill="#000" opacity=".15"/>
  <circle cx="${w - 36}" cy="${30 + blade / 2}" r="12" fill="#2a1a08"/>
  <rect x="0" y="0" width="64" height="${blade + 60}" rx="6" fill="#4a2f15"/><rect x="0" y="0" width="14" height="${blade + 60}" fill="#fff" opacity=".12"/>
  <circle cx="30" cy="22" r="6" fill="#d0b070"/><circle cx="30" cy="${blade + 38}" r="6" fill="#d0b070"/></svg>`;
}

/** A strip of masking tape, slightly translucent. */
function tape(x, y, rot = 0, w = 150) {
  return `<div style="${abs(x, y, w, 46, `transform:rotate(${rot}deg);background:linear-gradient(rgba(238,222,176,.86),rgba(222,204,150,.86));box-shadow:0 3px 6px rgba(60,40,10,.3);clip-path:polygon(0 8%,4% 0,8% 10%,12% 0,100% 0,96% 12%,100% 24%,96% 38%,100% 52%,96% 66%,100% 80%,96% 100%,10% 100%,6% 88%,0 96%)`)}"></div>`;
}

/** A fine-liner pen lying at an angle, with its cap. */
function pen({ x, y, len = 400, rot = 0 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 7px rgba(0,0,0,.5))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
  <rect x="40" y="5" width="${len - 150}" height="24" rx="11" fill="#1e2a26"/><rect x="40" y="5" width="${len - 150}" height="7" rx="3" fill="#fff" opacity=".22"/>
  <rect x="${len - 112}" y="3" width="108" height="28" rx="12" fill="#2f6b57"/><rect x="${len - 112}" y="3" width="108" height="8" rx="4" fill="#fff" opacity=".25"/><rect x="${len - 60}" y="3" width="6" height="28" fill="#d9c27a"/>
  <path d="M40 5 L6 15 L6 19 L40 29Z" fill="#c8ccd2"/><path d="M12 14 L6 17 L12 20Z" fill="#111"/></svg>`;
}

/** A square sticky note with a curled shadow. `inner` is set on it in pencil. */
function sticky({ x, y, s = 200, rot = 0, color = "#f6dd7c", inner = "" }) {
  return `<div style="${abs(x, y, s, s, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},${color});box-shadow:0 2px 3px rgba(40,25,5,.25),0 16px 22px rgba(40,25,5,.35)`)}"><div style="position:absolute;left:0;right:0;top:0;height:30px;background:rgba(255,255,255,.22)"></div><div style="position:absolute;inset:44px 18px 14px;${PENCIL_FONT};display:flex;flex-direction:column;gap:6px">${inner}</div></div>`;
}

/** A closed bill envelope with a window and no words. */
function envelope({ x, y, w = 300, rot = 0 }) {
  const h = w * 0.62;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(0,0,0,.5))`)}" viewBox="0 0 300 186" aria-hidden="true">
  <rect width="300" height="186" rx="6" fill="#f4efe2"/><rect width="300" height="186" rx="6" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>
  <path d="M2 4 L150 112 L298 4" fill="none" stroke="#b7ad92" stroke-width="3"/><path d="M2 182 L112 90 M298 182 L188 90" fill="none" stroke="#cfc6ae" stroke-width="2"/>
  <rect x="22" y="104" width="118" height="54" rx="4" fill="#e6f0f7" stroke="#9db0be" stroke-width="2"/><rect x="34" y="118" width="70" height="7" rx="3" fill="#8a9aa6"/><rect x="34" y="134" width="48" height="7" rx="3" fill="#a8b5bf"/>
  <rect x="236" y="16" width="48" height="56" rx="3" fill="#2f6b57"/><circle cx="260" cy="44" r="14" fill="none" stroke="#e8f2ec" stroke-width="3"/></svg>`;
}

/** A sheet of tracing paper: milky, with a soft edge. */
function vellum({ x, y, w, h, rot = 0, inner = "" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(135deg,rgba(255,255,255,.7),rgba(236,242,250,.58));border:1.5px solid rgba(255,255,255,.7);border-radius:3px;box-shadow:0 2px 3px rgba(0,10,40,.3),0 18px 30px rgba(0,10,40,.4);backdrop-filter:blur(2.5px)`)}">${inner}</div>`;
}

/** An eraser block. */
function eraser({ x, y, rot = 0 }) {
  return `<svg style="${abs(x, y, 120, 56, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))`)}" viewBox="0 0 120 56" aria-hidden="true"><rect width="120" height="56" rx="8" fill="#f1ece4"/><rect x="74" width="46" height="56" rx="8" fill="#3f6fa8"/><rect x="74" width="10" height="56" fill="#3f6fa8"/><rect width="120" height="12" rx="6" fill="#fff" opacity=".5"/></svg>`;
}

/* ------------------------------------------------------------------ surfaces */

/** A green self-healing cutting mat: a fine grid, bolder every fifth line, angle arcs at one corner. */
function cuttingMat() {
  const g = id("cm");
  return `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><pattern id="${g}" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#bfe3cf" stroke-opacity=".28" stroke-width="1.4"/></pattern>
  <pattern id="${g}b" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0 H0 V200" fill="none" stroke="#e6f6ec" stroke-opacity=".5" stroke-width="2.6"/></pattern>
  <radialGradient id="${g}v" cx=".3" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#021a0e" stop-opacity=".4"/></radialGradient></defs>
  <rect width="1000" height="1500" fill="#2d6a4d"/><rect width="1000" height="1500" fill="url(#${g})"/><rect width="1000" height="1500" fill="url(#${g}b)"/>
  <g fill="none" stroke="#e6f6ec" stroke-opacity=".38" stroke-width="2.4"><path d="M0 1130 A330 330 0 0 1 330 1500"/><path d="M0 1010 A450 450 0 0 1 450 1500"/><path d="M0 1500 L400 1100 M0 1500 L330 1000"/></g>
  <rect width="1000" height="1500" fill="url(#${g}v)"/></svg>`;
}

/** A blueprint board: deep blue, a pale line grid, major lines every 125 px. */
function blueprint() {
  const g = id("bp");
  return `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><pattern id="${g}" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0 H0 V25" fill="none" stroke="#a9c8ee" stroke-opacity=".2" stroke-width="1"/></pattern>
  <pattern id="${g}b" width="125" height="125" patternUnits="userSpaceOnUse"><path d="M125 0 H0 V125" fill="none" stroke="#c9ddf6" stroke-opacity=".42" stroke-width="1.8"/></pattern>
  <radialGradient id="${g}v" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#4f86c6" stop-opacity=".5"/><stop offset="1" stop-color="#0a2447" stop-opacity=".6"/></radialGradient></defs>
  <rect width="1000" height="1500" fill="#1f4f8a"/><rect width="1000" height="1500" fill="url(#${g}v)"/><rect width="1000" height="1500" fill="url(#${g})"/><rect width="1000" height="1500" fill="url(#${g}b)"/>
  <g fill="none" stroke="#d6e6fa" stroke-opacity=".5" stroke-width="2.2"><circle cx="830" cy="1210" r="150"/><circle cx="830" cy="1210" r="90" stroke-dasharray="14 10"/><path d="M830 1030 V1390 M650 1210 H1010" stroke-dasharray="26 8 4 8"/></g></svg>`;
}

/** A pale birch drafting board: warm blond wood, long fine grain, a darker edge strip at the left. */
function birch() {
  const lines = [];
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < 70; k++) {
    const y = rnd() * 1500;
    lines.push(`<path d="M0 ${y} C 280 ${y + (rnd() - 0.5) * 18}, 620 ${y + (rnd() - 0.5) * 18}, 1000 ${y + (rnd() - 0.5) * 12}" fill="none" stroke="#a97f45" stroke-opacity="${(0.1 + rnd() * 0.16).toFixed(2)}" stroke-width="${(0.8 + rnd() * 1.8).toFixed(1)}"/>`);
  }
  const g = id("bi");
  return `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><radialGradient id="${g}" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#6b4a1d" stop-opacity=".22"/></radialGradient></defs>
  <rect width="1000" height="1500" fill="#e9d3a8"/>${lines.join("")}<rect width="1000" height="1500" fill="url(#${g})"/>
  <rect x="0" y="0" width="14" height="1500" fill="#8b5f2c" opacity=".7"/></svg>`;
}

/** A graphite drawing board: dark slate with a faint speckle and a cool pool of light behind the page. */
function graphite() {
  const dots = [];
  let s = 29;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < 420; k++) dots.push(`<circle cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * 1500).toFixed(0)}" r="${(0.6 + rnd() * 1.4).toFixed(1)}" fill="#fff" opacity="${(0.05 + rnd() * 0.12).toFixed(2)}"/>`);
  const g = id("gr");
  return `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><radialGradient id="${g}" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#6b777c" stop-opacity=".6"/><stop offset="1" stop-color="#14181a" stop-opacity=".75"/></radialGradient></defs>
  <rect width="1000" height="1500" fill="#30393c"/>${dots.join("")}<rect width="1000" height="1500" fill="url(#${g})"/>
  <g stroke="#9fb0b5" stroke-opacity=".16" stroke-width="2"><path d="M0 1160 H1000"/><path d="M0 1168 H1000" stroke-opacity=".08"/></g></svg>`;
}

/** An ivory drafting sheet with a pale blue grid (fine every 20 px, a firmer line every 100 px). */
function ivoryGrid() {
  const g = id("iv");
  return `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">
  <defs><pattern id="${g}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" fill="none" stroke="#6f9bc7" stroke-opacity=".2" stroke-width="1"/></pattern>
  <pattern id="${g}b" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0 H0 V100" fill="none" stroke="#4f86b8" stroke-opacity=".32" stroke-width="1.8"/></pattern>
  <radialGradient id="${g}v" cx=".3" cy=".25" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#6b5b3a" stop-opacity=".22"/></radialGradient></defs>
  <rect width="1000" height="1500" fill="#efe7d3"/><rect width="1000" height="1500" fill="url(#${g})"/><rect width="1000" height="1500" fill="url(#${g}b)"/><rect width="1000" height="1500" fill="url(#${g}v)"/></svg>`;
}

/* ------------------------------------------------------------------ pins */

const exTag = `<span class="example" style="font-size:24px;padding:5px 10px;color:#2f4a6d;background:rgba(255,255,255,.55)">Example</span>`;

const pin30 = printable({
  n: 30,
  paper: "#eef4f1",
  scene: `${cuttingMat()}
  ${box(122, 880, 900, 64, 86, steelRuler(900))}
  ${sheet({ src: bookPage(22), x: 200, y: 412, w: 620, tilt: -4, id: "p30" })}
  ${box(910, 520, 300, 300, 0, setSquare(300, { fill: "rgba(250,196,80,.6)", edge: "#a86a12" }), "transform:rotate(180deg) scaleX(-1)")}
  ${envelope({ x: 40, y: 1130, w: 290, rot: -9 })}
  ${pencil({ x: 440, y: 1272, len: 440, rot: -5, body: "#d8892b" })}`,
});

const pin65 = printable({
  n: 65,
  paper: "#e8eef6",
  scene: `${blueprint()}
  ${sheet({ src: bookPage(42), x: 52, y: 446, w: 880, tilt: 3, crop: { x0: 0.06, x1: 0.94, y0: 0.215, y1: 0.62 }, id: "p65" })}
  ${vellum({
    x: 70, y: 1050, w: 650, h: 150, rot: -2,
    inner: `<div style="position:absolute;left:30px;top:20px;right:24px;${PENCIL_FONT};font-size:40px;line-height:1.1">Car registration, March, $120</div><div style="position:absolute;left:30px;top:88px">${exTag}</div>`,
  })}
  <div style="${abs(720, 1000, 300, 336, "transform:rotate(-8deg)")}">${compass(300)}</div>
  ${pencil({ x: 60, y: 1270, len: 460, rot: 2, body: "#f3f0e6", band: "#c9cdd3" })}`,
});

const pin72 = printable({
  n: 72,
  paper: "#f1e8d6",
  scene: `${birch()}
  ${sheet({ src: bookPage(11), x: 236, y: 412, w: 640, tilt: 2, crop: { x0: 0, x1: 1, y0: 0, y1: 0.88 }, id: "p72" })}
  <div style="${abs(34, 420, 190, 540)}">${pencilTray(190, 540)}</div>
  ${sticky({
    x: 36, y: 990, s: 200, rot: -6,
    inner: `<div style="font-size:42px;line-height:1.05">rate?</div><div style="font-size:34px;line-height:1.05;margin-top:10px"><span style="background:linear-gradient(transparent 55%,rgba(230,90,120,.7) 55%)">renewal date</span></div>`,
  })}
  ${mug({ x: 790, y: 1085, size: 150, color: "#f3ede4", drink: "#6b4226" })}
  ${pencil({ x: 270, y: 1200, len: 430, rot: -2, body: "#2f6b57" })}
  <div style="${abs(0, 1226, 1000, 122)}">${tSquare(1000, { blade: 56 })}</div>`,
});

const pin56 = printable({
  n: 56,
  paper: "#e9efec",
  scene: `${graphite()}
  ${sheet({ src: bookPage(38), x: 60, y: 408, w: 880, tilt: -3, crop: { x0: 0.06, x1: 0.94, y0: 0.235, y1: 0.8 }, id: "p56" })}
  <div style="${abs(40, 1090, 300, 336, "transform:rotate(14deg)")}">${compass(250)}</div>
  ${sticky({ x: 400, y: 1138, s: 160, rot: 5, color: "#f1b9c4" })}
  ${pen({ x: 380, y: 1306, len: 320, rot: 0 })}
  <div style="${abs(740, 1070, 260, 260, "transform:rotate(-12deg)")}">${setSquare(230, { fill: "rgba(170,215,235,.5)", edge: "#7fb0c6" })}</div>`,
});

const pin99 = printable({
  n: 99,
  paper: "#f0e9d8",
  scene: `${ivoryGrid()}
  ${sheet({ src: bookPage(54), x: 34, y: 408, w: 600, tilt: -3, crop: { x0: 0.05, x1: 0.95, y0: 0.09, y1: 0.72 }, id: "p99a" })}
  ${tape(504, 396, 24, 130)}
  ${sheet({ src: bookPage(55), x: 372, y: 884, w: 600, tilt: 2.5, crop: { x0: 0.05, x1: 0.95, y0: 0.205, y1: 0.7 }, id: "p99b" })}
  ${tape(860, 1296, -28, 130)}
  ${box(865, 470, 640, 78, 90, scaleRule(640, { h: 78 }))}
  <div style="${abs(680, 560, 250, 250, "transform:rotate(18deg)")}">${setSquare(210, { fill: "rgba(120,190,150,.55)", edge: "#2f6b57" })}</div>
  ${mug({ x: 56, y: 1100, size: 160, color: "#2f6b57", drink: "#4a2c16" })}
  ${pencil({ x: 30, y: 1290, len: 330, rot: -4, body: "#c8452d" })}
  ${eraser({ x: 232, y: 1150, rot: 14 })}`,
});

export const pins = [pin30, pin65, pin72, pin56, pin99];
