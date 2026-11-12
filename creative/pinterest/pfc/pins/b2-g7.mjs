/**
 * Batch 2, group G7: the sewing and craft table.
 *
 *   #75  50/30/20 questions on a ruled card with index tabs, on indigo denim, spools and scissors below
 *   #77  the balance slip and the receipt tape that subtracts it, on oatmeal linen, pincushion and tape measure
 *   #79  three price tags stitched to their results, on a patchwork quilt
 *   #82  the gas pump receipt and the two balance columns, on a teal cutting mat
 *   #83  two paper-strip balances hung on thread, on rose craft felt
 *
 * Words: every word is the idea's own (headline, sub, items, proof). The few labels that are
 * not verbatim are listed in the report: "per week" (#79, named by the idea's visual),
 * the tab labels (#75, cut from the headline) and the stamp "Hold" (#82, the idea's word).
 */
import { esc } from "../../v3/kit.mjs";
import { idea } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const lcg = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const SCENE_TOP = 372, SCENE_BOTTOM = 1354, SCENE_H = SCENE_BOTTOM - SCENE_TOP;
const SH = "0 2px 3px rgba(30,20,10,.28),0 16px 28px rgba(30,20,10,.34)";

/* ------------------------------------------------------------------ shared craft props */

/** A polygon clip with a zigzag (pinked) edge on the sides asked for. */
function zig(w, h, step = 14, d = 7, sides = "tblr") {
  const pts = [];
  const side = (x0, y0, x1, y1, nx, ny, zz) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / step));
    for (let k = 0; k < n; k++) {
      pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
      if (zz) pts.push([x0 + ((x1 - x0) * (k + 0.5)) / n + nx * d, y0 + ((y1 - y0) * (k + 0.5)) / n + ny * d]);
    }
  };
  side(0, 0, w, 0, 0, 1, sides.includes("t"));
  side(w, 0, w, h, -1, 0, sides.includes("r"));
  side(w, h, 0, h, 0, -1, sides.includes("b"));
  side(0, h, 0, 0, 1, 0, sides.includes("l"));
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}

/** Grain: a fractal-noise layer that fills its (positioned) parent. */
const grain = (freq = ".8", op = 0.2, seed = 2, mode = "multiply", matrix = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -.25") => {
  const id = `nz${++uid}`;
  return `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:${mode}" aria-hidden="true"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="${matrix}"/></filter><rect width="100%" height="100%" filter="url(#${id})" opacity="${op}"/></svg>`;
};

/** A spool of thread seen from the side. */
function spool({ x, y, w = 90, color = "#b3402f", rot = 0, tail = true, z = 3 }) {
  const h = w * 1.25;
  const rings = Array.from({ length: 10 }, (_, k) => `<rect x="16" y="${22 + k * 8.6}" width="68" height="1.7" fill="#000" opacity=".2"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(30,20,10,.38));z-index:${z}`)}" viewBox="0 0 100 125" aria-hidden="true">
  <rect x="16" y="16" width="68" height="94" fill="${color}"/>${rings}<rect x="22" y="16" width="9" height="94" fill="#fff" opacity=".24"/><rect x="70" y="16" width="14" height="94" fill="#000" opacity=".16"/>
  <rect x="6" y="2" width="88" height="18" rx="7" fill="#d8b27b"/><rect x="6" y="2" width="88" height="6" rx="3" fill="#fff" opacity=".3"/><rect x="6" y="105" width="88" height="18" rx="7" fill="#c79d62"/><rect x="6" y="105" width="88" height="5" rx="3" fill="#fff" opacity=".2"/>
  ${tail ? `<path d="M84 70 C 104 72 106 96 96 112" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>` : ""}</svg>`;
}

/** A sew-through button. */
function button({ x, y, r = 34, color = "#e8c15a", holes = 4, thread = "#b3402f", rot = 0, z = 3 }) {
  const s = r * 2, c = r;
  const hole = holes === 2 ? [[-0.24, 0], [0.24, 0]] : [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]];
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(30,20,10,.38));z-index:${z}`)}" viewBox="0 0 ${s} ${s}" aria-hidden="true">
  <circle cx="${c}" cy="${c}" r="${r - 1}" fill="${color}"/><circle cx="${c}" cy="${c}" r="${r - 1}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.68}" fill="#000" fill-opacity=".1"/><circle cx="${c}" cy="${c}" r="${r * 0.68}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <path d="M${r * 0.35} ${r * 0.4} A ${r * 0.9} ${r * 0.9} 0 0 1 ${r * 0.9} ${r * 0.22}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
  ${hole.map(([hx, hy]) => `<circle cx="${c + hx * s}" cy="${c + hy * s}" r="${r * 0.1}" fill="#3a2a14"/>`).join("")}
  ${thread ? (holes === 2 ? `<path d="M${c - 0.24 * s} ${c} L${c + 0.24 * s} ${c}" stroke="${thread}" stroke-width="3"/>` : `<path d="M${c - 0.2 * s} ${c - 0.2 * s} L${c + 0.2 * s} ${c + 0.2 * s} M${c + 0.2 * s} ${c - 0.2 * s} L${c - 0.2 * s} ${c + 0.2 * s}" stroke="${thread}" stroke-width="3" stroke-linecap="round"/>`) : ""}</svg>`;
}

/** Embroidery scissors lying flat, handles on the left. */
function scissors({ x, y, w = 330, rot = 0, z = 3, handle = "#c08a2c" }) {
  const h = w * 0.42;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(20,10,5,.4));z-index:${z}`)}" viewBox="0 0 330 138" aria-hidden="true">
  <defs><linearGradient id="bl${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="1" stop-color="#9ea4ab"/></linearGradient></defs>
  <path d="M112 60 L320 66 L322 70 L112 76 Z" fill="url(#bl${uid})"/><path d="M112 64 L322 66" stroke="#fff" stroke-opacity=".8" stroke-width="1.5"/>
  <path d="M112 72 L320 70 L322 66 L112 58 Z" fill="#c9ced4" opacity=".0"/>
  <path d="M98 62 L322 67 L322 71 L98 74 Z" fill="url(#bl${uid})" opacity=".0"/>
  <path d="M58 40 L128 64" stroke="${handle}" stroke-width="13" stroke-linecap="round"/><path d="M58 98 L128 74" stroke="${handle}" stroke-width="13" stroke-linecap="round"/>
  <path d="M118 66 L322 62 L322 67 L118 76 Z" fill="#dfe3e7"/><path d="M118 70 L322 68 L322 72 L118 78 Z" fill="#8f959c"/>
  <ellipse cx="38" cy="32" rx="34" ry="26" fill="none" stroke="${handle}" stroke-width="13"/><ellipse cx="38" cy="106" rx="34" ry="26" fill="none" stroke="${handle}" stroke-width="13"/>
  <ellipse cx="30" cy="22" rx="16" ry="5" fill="#fff" opacity=".4" transform="rotate(-18 30 22)"/><ellipse cx="30" cy="96" rx="16" ry="5" fill="#fff" opacity=".4" transform="rotate(-18 30 96)"/>
  <circle cx="122" cy="69" r="8" fill="#b9bec5" stroke="#6c7178" stroke-width="2"/><circle cx="122" cy="69" r="2.6" fill="#555a60"/></svg>`;
}

/** A round pincushion with pins, seen from above. */
function cushion({ x, y, r = 88, color = ["#e0553f", "#9d2a1b"], z = 3 }) {
  const g = `pc${++uid}`;
  const pins = [[-60, .66, 70, "#f2c14e"], [-18, .78, 80, "#fff"], [24, .72, 66, "#4b8f7c"], [64, .8, 76, "#f2c14e"], [110, .6, 64, "#fff"], [160, .74, 72, "#7d4fa8"], [205, .7, 78, "#4b8f7c"], [250, .62, 64, "#f2c14e"], [295, .74, 70, "#fff"]];
  const seams = Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI; return `<path d="M${r + Math.cos(a) * r * 0.2} ${r + Math.sin(a) * r * 0.2} L${r + Math.cos(a) * r * 0.96} ${r + Math.sin(a) * r * 0.96}" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M${r - Math.cos(a) * r * 0.2} ${r - Math.sin(a) * r * 0.2} L${r - Math.cos(a) * r * 0.96} ${r - Math.sin(a) * r * 0.96}" stroke="#000" stroke-opacity=".12" stroke-width="2"/>`; }).join("");
  const pinSvg = pins.map(([a, d, len, c]) => { const rad = (a * Math.PI) / 180; const sx = r + Math.cos(rad) * r * d * 0.55, sy = r + Math.sin(rad) * r * d * 0.55; const ex = sx + Math.cos(rad) * len * 0.5, ey = sy + Math.sin(rad) * len * 0.5; return `<path d="M${sx + 3} ${sy + 5} L${ex + 3} ${ey + 5}" stroke="#000" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/><path d="M${sx} ${sy} L${ex} ${ey}" stroke="#cfd3d8" stroke-width="3" stroke-linecap="round"/><circle cx="${ex}" cy="${ey}" r="8" fill="${c}"/><circle cx="${ex - 2}" cy="${ey - 2.5}" r="2.6" fill="#fff" opacity=".7"/>`; }).join("");
  return `<svg style="${abs(x, y, r * 2 + 30, r * 2 + 30, `filter:drop-shadow(0 14px 10px rgba(30,20,10,.4));z-index:${z}`)}" viewBox="-6 -6 ${r * 2 + 30} ${r * 2 + 30}" aria-hidden="true">
  <defs><radialGradient id="${g}" cx=".36" cy=".3" r=".85"><stop offset="0" stop-color="${color[0]}"/><stop offset="1" stop-color="${color[1]}"/></radialGradient></defs>
  <circle cx="${r}" cy="${r}" r="${r - 2}" fill="url(#${g})"/>${seams}
  <ellipse cx="${r * 0.62}" cy="${r * 0.5}" rx="${r * 0.3}" ry="${r * 0.14}" fill="#fff" opacity=".28" transform="rotate(-30 ${r * 0.62} ${r * 0.5})"/>
  <path d="M${r} ${r - 18} L${r + 7} ${r - 4} L${r + 22} ${r - 8} L${r + 10} ${r + 4} L${r + 18} ${r + 18} L${r} ${r + 9} L${r - 18} ${r + 18} L${r - 10} ${r + 4} L${r - 22} ${r - 8} L${r - 7} ${r - 4} Z" fill="#4f8a47"/>${pinSvg}</svg>`;
}

/** A flat yellow tape measure, ticks only (no numerals). */
function tapeMeasure({ x, y, w = 420, h = 48, rot = 0, z = 3, color = ["#f4d35e", "#e3b72c"] }) {
  const ticks = "#3a3320";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:3px;z-index:${z};filter:drop-shadow(0 8px 6px rgba(30,20,10,.35))`)}"><div style="position:absolute;inset:0;border-radius:3px;background:repeating-linear-gradient(90deg,${ticks} 0 2px,transparent 2px 11px) top/100% 12px no-repeat,repeating-linear-gradient(90deg,${ticks} 0 2px,transparent 2px 55px) top/100% 22px no-repeat,repeating-linear-gradient(90deg,${ticks} 0 2px,transparent 2px 11px) bottom/100% 8px no-repeat,linear-gradient(${color[0]},${color[1]})"></div><div style="position:absolute;right:0;top:0;width:34px;height:${h}px;background:linear-gradient(#b8b9bd,#7e8085);border-radius:0 4px 4px 0"></div></div>`;
}

/** A pocket calculator, from above. */
function calc({ x, y, w = 240, rot = 0, body = "#ece4d3", key = "#3b3f46", accent = "#e07a2f", display = "1,411.00", z = 3, shown = true }) {
  const keys = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const col = c === 3 ? accent : key;
    keys.push(`<rect x="${20 + c * 52}" y="${118 + r * 50}" width="44" height="38" rx="8" fill="${col}"/><rect x="${20 + c * 52}" y="${118 + r * 50}" width="44" height="9" rx="4" fill="#fff" opacity=".16"/><rect x="${20 + c * 52}" y="${150 + r * 50}" width="44" height="6" rx="3" fill="#000" opacity=".25"/>`);
  }
  return `<svg style="${abs(x, y, w, w * 1.58, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(30,20,10,.42));z-index:${z}`)}" viewBox="0 0 240 380" aria-hidden="true">
  <rect x="2" y="2" width="236" height="376" rx="22" fill="${body}"/><rect x="2" y="2" width="236" height="376" rx="22" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="3"/>
  <rect x="150" y="16" width="70" height="20" rx="4" fill="#43372a"/><rect x="154" y="19" width="62" height="14" rx="2" fill="#6a5640"/>
  <rect x="18" y="46" width="204" height="54" rx="8" fill="#c8d6b8"/><rect x="18" y="46" width="204" height="54" rx="8" fill="none" stroke="#7d8c6e" stroke-width="3"/>
  ${shown ? `<text x="210" y="87" text-anchor="end" font-family="Plex Mono" font-weight="500" font-size="34" fill="#2b3526">${esc(display)}</text>` : ""}
  ${keys.join("")}</svg>`;
}

/** A glass-head pin standing in the surface, from above. */
const pushpin = (x, y, color = "#c0392b", s = 34) => `<div style="${abs(x, y, s, s, `border-radius:50%;background:radial-gradient(circle at 34% 30%,#fff9,${color} 38%,${color});box-shadow:3px 5px 5px rgba(0,0,0,.4);z-index:6`)}"></div>`;

const exTag = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 10px;${extra}">Example</span>`;

/* ------------------------------------------------------------------ #75 */

function pin75() {
  const i = idea(75);
  const qa = [[i.items[0], i.items[1], "Minimums"], [i.items[2], i.items[3], "High Rent"], [i.items[4], i.items[5], "What It Really Is"]];
  const tabColors = ["#e7c9a1", "#b9d3c4", "#e9b6a8"];
  const underlined = "Often not as written.";
  const ans = (t) => {
    const body = esc(t);
    const html = t.startsWith(underlined) ? body.replace(esc(underlined), `<u>${esc(underlined)}</u>`) : body;
    return `“${html}”`;
  };
  const strips = qa.map(([q, a, tab], k) => `<div class="st" style="transform:rotate(${[-0.5, 0.4, -0.3][k]}deg)">
    <div class="q" data-check="question"><span>${esc(q)}</span></div>
    <div class="a">${ans(a)}</div>
    <div class="tab" style="background:linear-gradient(90deg,${tabColors[k]},${tabColors[k]}ee);top:${k === 2 ? 36 : 56}px"><span>${esc(tab)}</span></div></div>`).join("");
  const css = `
  .card{position:absolute;left:30px;top:414px;width:810px;height:782px;transform:rotate(-1deg);border-radius:4px;box-shadow:0 2px 3px rgba(10,20,40,.35),0 24px 40px rgba(10,20,40,.5);
    background:linear-gradient(90deg,transparent 80px,#e49a9a 80px 82px,transparent 82px),repeating-linear-gradient(#fbf9f0 0 40px,#b9cde0 40px 42px);padding:44px 34px 0 108px;display:flex;flex-direction:column;gap:30px;z-index:3}
  .hole{position:absolute;left:24px;width:30px;height:30px;border-radius:50%;background:#26405f;box-shadow:inset 2px 3px 4px rgba(0,0,0,.55)}
  .st{position:relative}
  .q{height:64px;display:flex;align-items:center;padding:0 22px;background:linear-gradient(#f1deA4,#ecd48f);clip-path:${zig(668, 64, 12, 5, "lr")};font:600 26px "Plex",sans-serif;color:#1d1d20;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,.2)}
  .q span{display:block}
  .a{margin-top:14px;font:500 35px/1.2 "Newsreader",Georgia,serif;color:#17473a;letter-spacing:-.005em}
  .a u{text-decoration:underline;text-decoration-color:#d9962b;text-decoration-thickness:4px;text-underline-offset:7px}
  .tab{position:absolute;left:calc(100% + 34px - 14px);width:152px;height:82px;border-radius:0 16px 16px 0;display:flex;align-items:center;padding:0 16px 0 24px;box-shadow:3px 5px 10px rgba(0,0,0,.35);z-index:4}
  .tab span{font:600 23px/1.12 "Plex",sans-serif;color:#2a2418}`;
  const denim = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(118deg,rgba(255,255,255,.075) 0 2px,transparent 2px 6px),repeating-linear-gradient(28deg,rgba(0,0,0,.12) 0 1px,transparent 1px 5px),radial-gradient(ellipse at 22% 8%,rgba(255,255,255,.2),transparent 62%),#2d4a75;overflow:hidden")}">${grain(".9", .35, 4)}${grain(".03 .6", .22, 8, "overlay", "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.2 -.1")}</div>
  <div style="${abs(0, SCENE_TOP + 810, 1000, 172, "background:linear-gradient(#24406a,#1d3558);box-shadow:0 -6px 14px rgba(0,0,0,.35)")}"></div>
  <div style="${abs(0, SCENE_TOP + 824, 1000, 0, "border-top:4px dashed #e3b865")}"></div><div style="${abs(0, SCENE_TOP + 840, 1000, 0, "border-top:4px dashed #e3b865")}"></div>`;
  const holes = [150, 410, 670].map((t) => `<div class="hole" style="top:${t}px"></div>`).join("");
  const props = `
  ${spool({ x: 40, y: 1196, w: 96, color: "#b3402f", rot: -8, z: 5 })}
  ${spool({ x: 150, y: 1214, w: 84, color: "#e0b43a", rot: 5, z: 5 })}
  ${spool({ x: 252, y: 1190, w: 100, color: "#4b8f7c", rot: -3, z: 5 })}
  ${button({ x: 392, y: 1250, r: 30, color: "#e9d9b8", holes: 4, thread: "#b3402f", rot: 20, z: 5 })}
  ${button({ x: 452, y: 1226, r: 26, color: "#d98a6a", holes: 2, thread: "#f4ecdc", rot: -10, z: 5 })}
  ${scissors({ x: 560, y: 1176, w: 380, rot: -6, z: 5 })}`;
  const scene = `${denim}<div class="card">${holes}${strips}</div>${props}`;
  return printable({ n: 75, scene, paper: "#e7ecf2", extraCss: css });
}

/* ------------------------------------------------------------------ #77 */

function pin77() {
  const i = idea(77);
  const [availLabel, availVal, l1, v1, l2, v2, l3, v3, resLabel, resVal] = i.items;
  const css = `
  .slip{position:absolute;left:34px;top:452px;width:270px;height:238px;transform:rotate(-5deg);z-index:3;filter:drop-shadow(0 14px 10px rgba(40,25,10,.38))}
  .slip>div{position:absolute;inset:0;background:#fffefa;clip-path:${zig(270, 238, 12, 6, "b")};padding:20px 18px}
  .slip .lb{font:500 23px "Plex",sans-serif;color:#33363c;margin-top:16px;white-space:nowrap}
  .slip .vl{font:500 38px "Plex Mono",monospace;color:#1d1d20;margin-top:6px;white-space:nowrap}
  .tape{position:absolute;left:346px;top:352px;width:400px;height:812px;transform:rotate(1.4deg);z-index:3;filter:drop-shadow(0 18px 14px rgba(40,25,10,.38))}
  .tape>div{position:absolute;inset:0;background:linear-gradient(90deg,#fbf9f2,#fffefb 40%,#f6f3ea);clip-path:${zig(400, 812, 12, 6, "b")};padding:84px 26px 0}
  .ln{display:flex;flex-direction:column;gap:0;padding:14px 0 12px;border-bottom:2px dotted #bdb8aa}
  .ln .lb{font:500 24px "Plex Mono",monospace;color:#2a2c31;white-space:nowrap}
  .ln .pr{align-self:flex-end;font:500 40px "Plex Mono",monospace;color:#1d1d20}
  .ln .pc{align-self:flex-end;font:700 50px/1 "Hand",cursive;color:#565b64;text-shadow:.6px .5px 0 #3b3f46;transform:rotate(-1.5deg);margin-top:2px}
  .rule2{height:12px;border-top:3px solid #3a3a3a;border-bottom:3px solid #3a3a3a;margin:18px 0 12px}
  .res .lb{font:600 27px "Plex Mono",monospace;color:#1d1d20;white-space:nowrap}
  .res .big{align-self:flex-end;display:inline-block;margin-top:6px;padding:0 12px;font:600 68px/1.1 "Newsreader",Georgia,serif;color:#1d1d20;background:linear-gradient(transparent 14%,#f6b834 14% 88%,transparent 88%);white-space:nowrap}
  .res .less{font:700 44px/1 "Hand",cursive;color:#565b64;text-shadow:.6px .5px 0 #3b3f46;transform:rotate(-2deg);margin-top:8px;text-align:right}`;
  const linen = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(0deg,rgba(120,98,66,.12) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(120,98,66,.12) 0 1px,transparent 1px 4px),radial-gradient(ellipse at 20% 8%,rgba(255,255,255,.3),transparent 60%),#e3d7bf;overflow:hidden")}">${grain(".02 .8", .3, 5)}${grain(".8 .02", .26, 9)}<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,transparent 55%,rgba(70,45,15,.28))"></div></div>`;
  const slip = `<div class="slip"><div>${exTag()}<div class="lb">${esc(availLabel)}</div><div class="vl">${esc(availVal)}</div></div></div>`;
  const line = (l, v) => `<div class="ln"><span class="lb">${esc(l)}</span><span class="pc">${esc(v)}</span></div>`;
  const tape = `<div class="tape"><div>
    <div style="margin-top:-34px;margin-bottom:6px">${exTag()}</div>
    <div class="ln"><span class="lb">${esc(availLabel)}</span><span class="pr">${esc(availVal)}</span></div>
    ${line(l1, v1)}${line(l2, v2)}${line(l3, v3)}
    <div class="rule2"></div>
    <div class="res"><div class="lb">${esc(resLabel)}</div><div style="text-align:right"><span class="big">${esc(resVal)}</span></div><div class="less">$929 less</div></div></div></div>`;
  // The thread from the slip to the tape, with a needle at the end.
  const thread = `<svg style="${abs(0, 560, 1000, 760, "z-index:4")}" viewBox="0 560 1000 760" aria-hidden="true">
    <path d="M150 690 C 138 800, 230 880, 348 862" fill="none" stroke="#b3402f" stroke-width="6" stroke-linecap="round" stroke-dasharray="20 12"/>
    <g transform="translate(348 862) rotate(-8)"><path d="M0 0 L40 -4" stroke="#aeb3ba" stroke-width="5" stroke-linecap="round"/><ellipse cx="42" cy="-4" rx="9" ry="3.4" fill="none" stroke="#aeb3ba" stroke-width="2.4"/><path d="M0 0 L40 -4" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/></g></svg>`;
  const props = `
  ${cushion({ x: 758, y: 396, r: 92, z: 3 })}
  ${calc({ x: 742, y: 760, w: 236, rot: 7, z: 3 })}
  ${tapeMeasure({ x: 20, y: 920, w: 300, rot: -62, z: 3 })}
  ${spool({ x: 66, y: 1196, w: 92, color: "#d9962b", rot: -10, z: 3 })}
  ${spool({ x: 170, y: 1210, w: 84, color: "#b3402f", rot: 6, z: 3 })}
  ${button({ x: 268, y: 1232, r: 28, color: "#6b8fb3", holes: 4, thread: "#f4ecdc", rot: 14 })}
  ${pencil({ x: 356, y: 1250, len: 400, rot: -3 })}`;
  const scene = `${linen}${slip}${tape}${thread}${props}`;
  return printable({ n: 77, scene, paper: "#efe6d3", extraCss: css });
}

/* ------------------------------------------------------------------ #79 */

/** A patchwork quilt filling the scene. */
function quilt(seed = 12) {
  const r = lcg(seed);
  const pal = ["#2f6b57", "#e9dcc0", "#d6a23a", "#d98f86", "#3c5a8a", "#bf6a45", "#a9c3a0", "#f2e9d4", "#6f8f5e", "#c9b3d4"];
  const S = 160;
  const out = [];
  const cols = 7, rows = Math.ceil(SCENE_H / S) + 1;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * S - 20, y = j * S - 30;
    const c1 = pal[Math.floor(r() * pal.length)];
    let c2 = pal[Math.floor(r() * pal.length)];
    if (c2 === c1) c2 = pal[(pal.indexOf(c1) + 3) % pal.length];
    const kind = Math.floor(r() * 4);
    out.push(`<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="${c1}"/>`);
    if (kind === 0) out.push(`<polygon points="${x},${y + S} ${x + S},${y} ${x + S},${y + S}" fill="${c2}"/>`);
    if (kind === 1) out.push(`<polygon points="${x},${y} ${x + S},${y} ${x},${y + S}" fill="${c2}"/>`);
    if (kind === 2) for (let d = 0; d < 9; d++) out.push(`<circle cx="${x + 20 + (d % 3) * 60}" cy="${y + 20 + Math.floor(d / 3) * 60}" r="8" fill="${c2}" opacity=".8"/>`);
    if (kind === 3) for (let d = 0; d < 6; d++) out.push(`<rect x="${x}" y="${y + 12 + d * 27}" width="${S}" height="9" fill="${c2}" opacity=".7"/>`);
    out.push(`<rect x="${x + 5}" y="${y + 5}" width="${S - 10}" height="${S - 10}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="9 7"/>`);
    out.push(`<path d="M${x} ${y + S} L${x + S} ${y}" stroke="#000" stroke-opacity=".1" stroke-width="2" stroke-dasharray="3 9"/>`);
  }
  return `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "overflow:hidden")}"><svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">${out.join("")}<g stroke="#000" stroke-opacity=".28" stroke-width="3">${Array.from({ length: cols + 1 }, (_, k) => `<line x1="${k * S - 20}" y1="0" x2="${k * S - 20}" y2="${SCENE_H}"/>`).join("")}${Array.from({ length: rows + 1 }, (_, k) => `<line x1="0" y1="${k * S - 30}" x2="1000" y2="${k * S - 30}"/>`).join("")}</g></svg>${grain(".85", .3, 6)}<div style="position:absolute;inset:0;background:rgba(255,248,232,.34)"></div><div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 45%,transparent 50%,rgba(40,25,10,.34))"></div></div>`;
}

function pin79() {
  const i = idea(79);
  const [, t1, r1, w1, v1, t2, r2, v2, t3, , r3, v3] = i.items; // $600 is shown on the note; $558 and $120 are not used
  const rows = [
    { y: 706, tag: t1, res: w1, verdict: v1, vc: ["#2f6b57", "#fff"], rot: -1.4, tagRot: -3 },
    { y: 892, tag: t2, res: r2, verdict: v2, vc: ["#d9962b", "#2a1d06"], rot: 1, tagRot: 2 },
    { y: 1080, tag: t3, res: r3, verdict: v3, vc: ["#b3402f", "#fff"], rot: 1.6, tagRot: 4, apart: true },
  ];
  void r1; void v1;
  const money = (t) => (t.match(/\$\d+/) ?? [""])[0];
  const css = `
  .tg{position:absolute;width:262px;height:122px;z-index:4;filter:drop-shadow(0 10px 8px rgba(30,20,10,.4))}
  .tg>div{position:absolute;inset:0;background:linear-gradient(135deg,#e2c796,#cfae78);clip-path:polygon(0 50%,17% 0,100% 0,100% 100%,17% 100%);display:flex;align-items:center;padding-left:58px;gap:8px}
  .tg .hole{position:absolute;left:26px;top:49px;width:24px;height:24px;border-radius:50%;background:#7a5a30;box-shadow:inset 2px 2px 3px rgba(0,0,0,.5);z-index:2}
  .tg .sm{font:600 25px "Plex",sans-serif;color:#3a2c14}
  .tg .pp{font:600 70px/1 "Newsreader",Georgia,serif;color:#2a1d0a;letter-spacing:-.02em}
  .sw{position:absolute;width:552px;height:152px;z-index:4;filter:drop-shadow(0 12px 9px rgba(30,20,10,.4))}
  .sw>div{position:absolute;inset:0;background:linear-gradient(#fdf8ea,#f6efdc);clip-path:${zig(552, 152, 16, 8)};display:flex;align-items:center;justify-content:space-between;padding:0 34px 0 38px}
  .sw .fig{font:600 72px/1 "Newsreader",Georgia,serif;color:#17473a;letter-spacing:-.02em}
  .sw .pw{font:500 24px "Plex",sans-serif;color:#4b4339;margin-top:4px}
  .sw .vd{padding:12px 20px;border-radius:12px;font:600 28px/1.1 "Plex",sans-serif;white-space:nowrap;text-align:center;box-shadow:0 3px 5px rgba(0,0,0,.25)}
  .note{position:absolute;left:44px;top:412px;width:330px;height:236px;background:linear-gradient(#f7de8e,#f0cf6c);transform:rotate(-3deg);box-shadow:0 2px 3px rgba(30,20,10,.3),0 16px 22px rgba(30,20,10,.4);padding:16px 22px;z-index:5}
  .note .h{font:700 36px/1 "Hand",cursive;color:#5b3a07}
  .note .big{font:700 104px/1 "Hand",cursive;color:#2a1d06;margin-top:2px}
  .note .p{font:600 32px/1.05 "Hand",cursive;color:#3a2c14;margin-top:4px}`;
  const note = `<div class="note"><div class="h">safe-to-spend</div><div class="big">${esc(i.items[0])}</div><div class="p">Payday is four weeks away.</div></div>${pushpin(190, 400, "#c0392b")}`;
  const rowHtml = rows.map((r, k) => {
    const cx = r.apart ? 40 : 0;
    const price = money(r.tag);
    const [a, , c] = r.tag.split(/(\$\d+)/);
    const sw = `<div class="sw" style="left:${392 + cx}px;top:${r.y - 15}px;transform:rotate(${r.rot}deg)"><div style="${r.apart ? "outline:0" : ""}">
      <div><div class="fig">${esc(r.res)}</div><div class="pw">per week</div></div>
      <div class="vd" style="background:${r.vc[0]};color:${r.vc[1]}">${esc(r.verdict)}</div></div></div>`;
    const dash = r.apart ? `<div style="${abs(380 + cx, r.y - 28, 580, 178, "border:4px dashed #3a2c14;border-radius:14px;z-index:3;background:rgba(251,244,225,.0)")}"></div>` : "";
    const tag = `<div class="tg" style="left:${44 + cx}px;top:${r.y}px;transform:rotate(${r.tagRot}deg)"><div class="hole"></div><div><span class="sm">${esc(a.trim())}</span><span class="pp">${esc(price)}</span><span class="sm">${esc(c.trim())}</span></div></div>`;
    const stitch = `<svg style="${abs(0, r.y - 20, 1000, 180, "z-index:4")}" viewBox="0 ${r.y - 20} 1000 180" aria-hidden="true"><path d="M${312 + cx} ${r.y + 61} C ${340 + cx} ${r.y + 61 + (k - 1) * 14}, ${360 + cx} ${r.y + 61}, ${396 + cx} ${r.y + 61}" fill="none" stroke="#b3402f" stroke-width="6" stroke-linecap="round" stroke-dasharray="14 10"/></svg>`;
    return `${dash}${tag}${stitch}${sw}`;
  }).join("");
  const props = `
  <div style="${abs(420, 410, 280, 260, `z-index:4;transform:rotate(8deg);background:repeating-linear-gradient(#fffefa 0 30px,#e4e1d6 30px 32px);clip-path:${zig(280, 260, 12, 6, "tb")};filter:drop-shadow(0 12px 8px rgba(30,20,10,.4))`)}"></div>
  ${calc({ x: 770, y: 398, w: 176, rot: 9, body: "#f0c2c8", key: "#7b4b55", accent: "#f2a33a", display: "600.00", z: 4 })}
  ${button({ x: 56, y: 1256, r: 30, color: "#e8c15a", holes: 4, rot: 12, z: 5 })}
  ${button({ x: 120, y: 1274, r: 24, color: "#f4ecdc", holes: 2, thread: "#2f6b57", rot: -20, z: 5 })}
  ${spool({ x: 200, y: 1250, w: 90, color: "#2f6b57", rot: 4, z: 5 })}
  ${button({ x: 330, y: 1268, r: 26, color: "#d98f86", holes: 4, rot: 30, z: 5 })}
  ${scissors({ x: 560, y: 1262, w: 330, rot: 5, z: 5 })}`;
  const scene = `${quilt()}${note}${props}${rowHtml}`;
  return printable({ n: 79, scene, paper: "#f1e6d2", extraCss: css });
}

/* ------------------------------------------------------------------ #82 */

function pin82() {
  const i = idea(82);
  const holdLine = i.items[0]; // "Gas pump places a hold: $100.00"
  const [holdText, holdAmt] = holdLine.split(": ");
  const [, , final, step, curLabel, availLabel] = i.items;
  const hold = i.items[1]; // "$1,053.60"
  const css = `
  .rcpt{position:absolute;left:44px;top:356px;width:430px;height:800px;transform:rotate(-2.2deg);z-index:3;filter:drop-shadow(0 18px 14px rgba(0,30,25,.5))}
  .rcpt>div{position:absolute;inset:0;background:linear-gradient(90deg,#f4f2ea,#fdfcf7 40%,#f1efe6);clip-path:${zig(430, 800, 12, 6, "b")};padding:88px 30px 0}
  .rcpt .t{font:500 26px/1.25 "Plex Mono",monospace;color:#2a2c31}
  .rcpt .amt{position:relative;margin-top:10px;font:500 66px/1.1 "Plex Mono",monospace;color:#2a2c31;white-space:nowrap}
  .rcpt .amt s{text-decoration:none;position:relative}
  .rcpt .amt s::after{content:"";position:absolute;left:-6px;right:-6px;top:52%;height:6px;background:#b33a2b;transform:rotate(-3deg);border-radius:3px}
  .stamp{position:absolute;right:16px;top:150px;transform:rotate(-12deg);border:7px solid #b33a2b;border-radius:10px;padding:2px 20px;font:700 64px/1.1 "Plex",sans-serif;letter-spacing:.12em;color:#b33a2b;opacity:.88;text-transform:uppercase;mix-blend-mode:multiply}
  .tear{margin:34px -10px 28px;border-top:4px dashed #9c988b}
  .rcpt .fin{font:600 104px/1 "Plex Mono",monospace;color:#1d1d20;margin-top:8px;letter-spacing:-.04em}
  .rcpt .cap{font:500 25px/1.2 "Plex",sans-serif;color:#4b4a44;margin-top:2px}
  .bars{display:flex;gap:5px;margin-top:38px;height:84px;align-items:stretch}
  .bars i{display:block;background:#2a2c31}
  .led{position:absolute;left:502px;top:430px;width:462px;height:720px;transform:rotate(1.6deg);z-index:3;background:linear-gradient(90deg,transparent 0 229px,#d57a6e 229px 231px,transparent 231px),repeating-linear-gradient(#fcfbf5 0 62px,#c4d3ca 62px 64px);box-shadow:0 2px 3px rgba(0,30,25,.4),0 22px 34px rgba(0,30,25,.5);border-radius:4px}
  .led .hd{position:absolute;left:0;right:0;top:0;height:110px;background:#17473a;display:grid;grid-template-columns:1fr 1fr;border-radius:4px 4px 0 0}
  .led .hd div{display:flex;align-items:center;padding:0 18px;font:600 25px/1.1 "Plex",sans-serif;color:#fff}
  .led .c{position:absolute;font:500 36px "Plex Mono",monospace;color:#1d1d20;white-space:nowrap}
  .led .stp{position:absolute;font:700 62px/1 "Hand",cursive;color:#c2610f;text-shadow:.5px .5px 0 #8a4308;white-space:nowrap}`;
  const mat = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(#e7ddc8,#d3c7ac);overflow:hidden")}">${grain(".6", .25, 3)}</div>
  <div style="${abs(26, SCENE_TOP - 20, 948, SCENE_H + 40, "background:#1f6a5c;border-radius:34px;box-shadow:0 0 0 5px #17564a,0 20px 40px rgba(20,30,20,.45);overflow:hidden")}">
    <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 948 ${SCENE_H + 40}" aria-hidden="true">
      <g stroke="#fff" stroke-opacity=".2" stroke-width="1.6">${Array.from({ length: 24 }, (_, k) => `<line x1="${k * 40}" y1="0" x2="${k * 40}" y2="${SCENE_H + 40}"/>`).join("")}${Array.from({ length: 26 }, (_, k) => `<line x1="0" y1="${k * 40}" x2="948" y2="${k * 40}"/>`).join("")}</g>
      <g stroke="#fff" stroke-opacity=".5" stroke-width="2.6">${Array.from({ length: 5 }, (_, k) => `<line x1="${k * 200}" y1="0" x2="${k * 200}" y2="${SCENE_H + 40}"/>`).join("")}${Array.from({ length: 6 }, (_, k) => `<line x1="0" y1="${k * 200}" x2="948" y2="${k * 200}"/>`).join("")}</g>
      <g fill="none" stroke="#f4e9a4" stroke-opacity=".55" stroke-width="2.4"><line x1="0" y1="0" x2="948" y2="948"/><line x1="948" y1="0" x2="0" y2="948"/><path d="M0 700 A 700 700 0 0 1 700 0"/><path d="M0 400 A 400 400 0 0 1 400 0"/></g>
      <g stroke="#fff" stroke-opacity=".7" stroke-width="2.4">${Array.from({ length: 79 }, (_, k) => `<line x1="${k * 12 + 6}" y1="0" x2="${k * 12 + 6}" y2="${k % 5 === 0 ? 18 : 9}"/>`).join("")}</g>
    </svg>${grain(".9", .3, 7)}<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 25% 10%,rgba(255,255,255,.18),transparent 60%),radial-gradient(ellipse at 70% 90%,rgba(0,0,0,.25),transparent 60%)"></div></div>`;
  const bars = Array.from({ length: 28 }, (_, k) => `<i style="width:${[3, 5, 3, 7, 4, 3, 6, 3, 4, 7][k % 10]}px"></i>`).join("");
  const rcpt = `<div class="rcpt"><div>
    <div style="margin-top:-52px;margin-bottom:24px">${exTag()}</div>
    <div class="t">${esc(holdText)}:</div><div class="amt"><s>${esc(holdAmt)}</s></div>
    <div class="stamp">Hold</div>
    <div class="tear"></div>
    <div class="cap">the smaller real charge</div><div class="fin">${esc(final)}</div>
    <div class="bars">${bars}</div></div></div>`;
  const ledger = `<div class="led">
    <div class="hd"><div>${esc(curLabel)}</div><div>${esc(availLabel)}</div></div>
    <div class="c" style="left:254px;top:134px">${esc(hold)}</div>
    <svg style="${abs(238, 190, 200, 200)}" viewBox="0 0 200 200" aria-hidden="true"><path d="M102 188 L102 36" fill="none" stroke="#c2610f" stroke-width="9" stroke-linecap="round"/><path d="M70 66 L102 24 L134 66" fill="none" stroke="#c2610f" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="stp" style="left:254px;top:402px">+ ${esc(step)}</div>
    <div style="${abs(20, 252, 190, 0, "border-top:5px solid #6a6d73;transform:rotate(-1deg);opacity:.8")}"></div>
    <div style="${abs(20, 160, 190, 0, "border-top:5px solid #6a6d73;transform:rotate(-1deg);opacity:.8")}"></div>
  </div>`;
  const props = `
  <div style="${abs(560, 1218, 380, 54, "transform:rotate(-4deg);z-index:5;filter:drop-shadow(0 12px 8px rgba(0,20,15,.45))")}">
    <div style="${abs(0, 10, 260, 36, "background:linear-gradient(#2a2d32,#17191c);border-radius:8px 4px 4px 8px")}"></div>
    <div style="${abs(250, 4, 120, 46, "background:radial-gradient(circle at 40% 40%,#f1f2f4,#9a9ea5);border-radius:50%")}"></div><div style="${abs(262, 14, 96, 26, "border-radius:50%;border:3px solid #6c7178;opacity:.7")}"></div>
    <div style="${abs(40, 16, 150, 24, "background:#e2792b;border-radius:6px")}"></div></div>
  ${cushion({ x: 40, y: 1176, r: 52, color: ["#f2c14e", "#c28a1e"], z: 5 })}
  ${button({ x: 214, y: 1262, r: 26, color: "#e9d9b8", holes: 4, rot: 12, z: 5 })}
  ${spool({ x: 290, y: 1236, w: 78, color: "#d98f86", rot: -8, z: 5 })}
  ${button({ x: 392, y: 1274, r: 22, color: "#d9962b", holes: 2, thread: "#2a1d06", rot: -30, z: 5 })}`;
  const scene = `${mat}${rcpt}${ledger}${props}`;
  return printable({ n: 82, scene, paper: "#e5efe9", extraCss: css });
}

/* ------------------------------------------------------------------ #83 */

function pin83() {
  const i = idea(83);
  const [zeroNote, cushionNote] = i.items;
  const T = 178, P = 250, L = 190, TRAY = 188;
  /** A paper-strip balance on a spool post, hung on thread. `tilt` turns the beam clockwise (the right end sinks). */
  function balance({ cx, shelf, tilt, left, right }) {
    const th = (tilt * Math.PI) / 180;
    const py = shelf - P;
    const ends = [[cx - L * Math.cos(th), py - L * Math.sin(th)], [cx + L * Math.cos(th), py + L * Math.sin(th)]];
    const parts = [];
    const post = `${spool({ x: cx - 52, y: shelf - 130, w: 104, color: "#4b8f7c", tail: false, z: 3 })}${spool({ x: cx - 42, y: shelf - 236, w: 84, color: "#d9962b", tail: false, z: 3 })}`;
    const threads = `<svg style="${abs(0, 0, 1000, 1500, "z-index:3")}" viewBox="0 0 1000 1500" aria-hidden="true">${ends.map(([ex, ey]) => `<path d="M${ex} ${ey} L${ex - TRAY / 2 + 8} ${ey + T}" stroke="#f6eddb" stroke-width="3.4"/><path d="M${ex} ${ey} L${ex + TRAY / 2 - 8} ${ey + T}" stroke="#f6eddb" stroke-width="3.4"/><path d="M${ex} ${ey} L${ex} ${ey + T}" stroke="#f6eddb" stroke-width="2.4" opacity=".7"/>`).join("")}</svg>`;
    const beam = `<div style="${abs(cx - L - 8, py - 15, 2 * L + 16, 30, `transform:rotate(${tilt}deg);z-index:4;background:linear-gradient(#fbf6e6,#e9dfc4);border-radius:5px;box-shadow:0 8px 8px rgba(60,20,10,.35);background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0 2px,transparent 2px 22px),linear-gradient(#fbf6e6,#e9dfc4)`)}"><div style="${abs(0, 14, 2 * L + 16, 2, "background:rgba(0,0,0,.14)")}"></div></div>
      ${button({ x: cx - 20, y: py - 20, r: 20, color: "#17473a", holes: 0, thread: null, z: 5 })}`;
    const pans = [[ends[0], left], [ends[1], right]].map(([[ex, ey], content]) => {
      const trayTop = ey + T;
      return `${content(ex, trayTop)}<div style="${abs(ex - TRAY / 2, trayTop, TRAY, 46, "z-index:6;filter:drop-shadow(0 8px 6px rgba(60,20,10,.4))")}"><div style="position:absolute;inset:0;clip-path:polygon(0 0,100% 0,88% 100%,12% 100%);background:linear-gradient(#f6eed9,#e2d6b6)"></div><div style="${abs(0, 0, TRAY, 9, "background:#fff;opacity:.55;clip-path:polygon(0 0,100% 0,99% 100%,1% 100%)")}"></div></div>`;
    }).join("");
    return `${post}${threads}${beam}${pans}`;
  }
  const zeroSheet = (ex, tt) => `<div style="${abs(ex - 78, tt - 112, 156, 134, "z-index:5;background:repeating-linear-gradient(#fffefa 0 26px,#cfd9d3 26px 28px);box-shadow:0 3px 6px rgba(60,20,10,.35);display:flex;align-items:center;justify-content:center;text-align:center;transform:rotate(-2deg)")}"><div style="font:600 27px/1.15 'Plex',sans-serif;color:#17473a">Exactly<br>Zero</div></div>`;
  const cushionSheet = (ex, tt) => `<div style="${abs(ex - 80, tt - 128, 160, 150, "z-index:5;background:repeating-linear-gradient(#fffefa 0 26px,#cfd9d3 26px 28px);box-shadow:0 3px 6px rgba(60,20,10,.35);overflow:hidden;transform:rotate(1.5deg)")}"><div style="font:600 52px/1 'Newsreader',serif;color:#17473a;text-align:center;margin-top:20px">$97</div><div style="${abs(0, 82, 160, 42, "background:#17473a;color:#fff;display:flex;align-items:center;justify-content:center;font:600 25px 'Plex',sans-serif;box-shadow:0 -3px 6px rgba(0,0,0,.18)")}">Left over</div></div>`;
  const receipt = (ex, tt) => `<div style="${abs(ex - 72, tt - 128, 144, 150, "z-index:5;filter:drop-shadow(0 4px 5px rgba(60,20,10,.35));transform:rotate(3deg)")}"><div style="position:absolute;inset:0;background:#fffefa;clip-path:${zig(144, 150, 12, 6, "t")};padding:28px 10px 0;text-align:center"><div style="font:600 36px/1 'Plex Mono',monospace;color:#1d1d20">$30</div><div style="font:500 26px/1.2 'Plex Mono',monospace;color:#b33a2b;margin-top:6px">high</div><div style="height:3px;background:#2a2c31;opacity:.2;margin:14px 6px 0"></div><div style="height:3px;background:#2a2c31;opacity:.2;margin:8px 20px 0"></div></div></div>`;
  const felt = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(ellipse at 22% 6%,rgba(255,255,255,.28),transparent 60%),#d98f86;overflow:hidden")}">${grain(".75", .55, 11)}${grain(".9", .22, 3, "overlay", "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.2 -.1")}<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,transparent 50%,rgba(80,20,15,.3))"></div></div>`;
  const shelf = (y) => `<div style="${abs(-20, y, 1040, 16, "background:linear-gradient(#e7c590,#cfa66c);z-index:2")}"></div><div style="${abs(-20, y + 16, 1040, 40, "background:linear-gradient(#b98a52,#946a38);box-shadow:0 14px 18px rgba(80,25,15,.4);z-index:2")}"></div><div style="${abs(-20, y + 16, 1040, 40, "background:repeating-linear-gradient(90deg,rgba(60,35,10,.12) 0 2px,transparent 2px 60px);z-index:2")}"></div>`;
  const slipCss = `
  .cap{position:absolute;z-index:4;background:linear-gradient(#fffdf4,#f8f1dc);padding:18px 22px 20px;box-shadow:0 2px 3px rgba(60,20,10,.3),0 16px 22px rgba(60,20,10,.4);font:500 28px/1.24 "Newsreader",Georgia,serif;color:#17473a}`;
  const caps = `
  <div class="cap" data-check="note" style="left:626px;top:454px;width:340px;transform:rotate(2deg)">${exTag("margin-bottom:12px")}<div>${esc(zeroNote)}</div></div>${pushpin(782, 442, "#17473a")}
  <div class="cap" data-check="note" style="left:34px;top:918px;width:340px;transform:rotate(-2deg)">${exTag("margin-bottom:12px")}<div>${esc(cushionNote)}</div></div>${pushpin(190, 906, "#f2c14e")}`;
  const A = balance({ cx: 320, shelf: 850, tilt: 9, left: zeroSheet, right: receipt });
  const B = balance({ cx: 680, shelf: 1292, tilt: 0, left: cushionSheet, right: receipt });
  const props = `
  ${pencil({ x: 380, y: 1244, len: 340, rot: -2, body: "#d9962b" })}
  <div style="${abs(50, 1236, 90, 52, "z-index:4;background:linear-gradient(#fffefa,#ece8da);border-radius:26px;box-shadow:0 8px 8px rgba(60,20,10,.35)")}"><div style="${abs(4, 10, 8, 32, "background:#2a2c31;opacity:.14;border-radius:4px")}"></div></div>`;
  const scene = `${felt}${shelf(850)}${shelf(1292)}${caps}${A}${B}${props}`;
  return printable({ n: 83, scene, paper: "#f1e0da", extraCss: slipCss });
}

export const pins = [pin75(), pin77(), pin79(), pin82(), pin83()];
