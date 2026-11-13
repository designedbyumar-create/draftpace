/**
 * Group H: attic and eaves. Maintenance guide pins #40, #42, #44, #46, #48, #50, #52.
 * No printed workbook page appears: every scene is drawn here (rafters, a
 * lantern, a trunk, boxes, insulation, a wooden ladder, a furnace door). Every
 * word is the idea bank's (headline, sub, items), a field name the guide's own
 * example table uses (Date, What was done, Who did it, Cost, Note), or the
 * kit's "Example" tag.
 */
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SH = "filter:drop-shadow(0 12px 9px rgba(20,12,4,.4))";
const split = (s) => {
  const k = s.indexOf(": ");
  return k < 0 ? [s, ""] : [s.slice(0, k), s.slice(k + 2)];
};
const fill = (css) => `<div style="${abs(0, 0, 1000, 1500, css)}"></div>`;
const sageLight = "#a9cdb2";
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/* ---------- shared attic props (flat vector, soft shadows) ---------- */

/** One square-sawn timber between two points, with a lit edge and a shaded edge. */
function beam(x1, y1, x2, y2, w, c = "#4b3b2a", hi = "#6a543b") {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), nx = (-dy / L) * (w / 2), ny = (dx / L) * (w / 2);
  const P = (k, ax, ay) => `${(x1 + ax * k).toFixed(1)},${(y1 + ay * k).toFixed(1)} ${(x2 + ax * k).toFixed(1)},${(y2 + ay * k).toFixed(1)}`;
  const pts = `${P(1, nx, ny)} ${x2 - nx},${y2 - ny} ${x1 - nx},${y1 - ny}`;
  const hp = `${P(1, nx, ny)} ${x2 + nx * 0.5},${y2 + ny * 0.5} ${x1 + nx * 0.5},${y1 + ny * 0.5}`;
  const sp = `${x1 - nx},${y1 - ny} ${x2 - nx},${y2 - ny} ${x2 - nx * 0.7},${y2 - ny * 0.7} ${x1 - nx * 0.7},${y1 - ny * 0.7}`;
  return `<polygon points="${pts}" fill="${c}"/><polygon points="${hp}" fill="${hi}" opacity=".75"/><polygon points="${sp}" fill="#000" opacity=".28"/>`;
}
const timber = (inner) => `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${inner}</svg>`;

/** Floorboards seen from the front: horizontal oak boards with joints and a knot or two. */
function planks({ y, h, base = "#8a6a42", dark = "#6f5231", seed = 5, bh = 44 }) {
  const r = rng(seed), rows = Math.ceil(h / bh), out = [];
  for (let k = 0; k < rows; k++) {
    const yy = k * bh;
    out.push(`<rect x="0" y="${yy}" width="1000" height="${bh}" fill="${k % 2 ? base : dark}"/><rect x="0" y="${yy}" width="1000" height="3" fill="#2a1a08" opacity=".5"/><rect x="0" y="${yy + 3}" width="1000" height="3" fill="#fff" opacity=".07"/>`);
    let jx = r() * 300 + 80;
    while (jx < 1000) { out.push(`<rect x="${jx}" y="${yy}" width="3" height="${bh}" fill="#2a1a08" opacity=".45"/>`); jx += 260 + r() * 260; }
    out.push(`<ellipse cx="${r() * 900 + 50}" cy="${yy + bh / 2}" rx="${10 + r() * 12}" ry="${5 + r() * 4}" fill="#2a1a08" opacity=".28"/>`);
  }
  return `<svg style="${abs(0, y, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true">${out.join("")}<rect width="1000" height="${h}" fill="#000" opacity=".1"/></svg>`;
}

/** A hurricane lantern with a lit flame; `glow` lays a warm pool of light around it. */
function lantern({ x, y, s = 1, glow = true }) {
  return `${glow ? `<div style="${abs(x - 150 * s, y - 70 * s, 420 * s, 420 * s, "background:radial-gradient(circle,rgba(255,196,96,.6),rgba(255,196,96,0) 62%)")}"></div>` : ""}
  <svg style="${abs(x, y, 120 * s, 200 * s, SH)}" viewBox="0 0 120 200" aria-hidden="true">
    <path d="M40 38 C40 -6 80 -6 80 38" fill="none" stroke="#2b2a26" stroke-width="7"/>
    <path d="M30 42 L60 20 L90 42 Z" fill="#3a3a34"/>
    <path d="M34 50 H86 L98 168 H22 Z" fill="#ffe7a0" opacity=".94"/>
    <path d="M60 156 C40 132 54 116 60 94 C66 116 82 132 60 156 Z" fill="#f2a43a"/><path d="M60 156 C52 142 58 132 60 122 C62 132 68 142 60 156 Z" fill="#fff0b8"/>
    <path d="M34 50 L22 168 M86 50 L98 168 M60 50 V168" stroke="#2b2a26" stroke-width="5" fill="none"/>
    <rect x="30" y="38" width="60" height="14" rx="4" fill="#2b2a26"/><rect x="16" y="166" width="88" height="22" rx="5" fill="#2b2a26"/><rect x="16" y="166" width="88" height="6" rx="3" fill="#fff" opacity=".12"/></svg>`;
}

/** A taped cardboard carton, front on, with a lighter lid strip. */
function carton({ x, y, w, h, rot = 0, tone = "#c8a679" }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SH}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="0" y="${h * 0.2}" width="${w}" height="${h * 0.8}" fill="${tone}"/><rect x="0" y="${h * 0.2}" width="${w * 0.14}" height="${h * 0.8}" fill="#fff" opacity=".14"/><rect x="${w * 0.86}" y="${h * 0.2}" width="${w * 0.14}" height="${h * 0.8}" fill="#000" opacity=".12"/>
    <rect x="0" y="0" width="${w}" height="${h * 0.22}" fill="#dbbd90"/><rect x="0" y="${h * 0.2}" width="${w}" height="4" fill="#000" opacity=".25"/>
    <rect x="${w * 0.42}" y="0" width="${w * 0.16}" height="${h * 0.62}" fill="#ecdcb4" opacity=".85"/></svg>`;
}

/** A roll of glass-fibre insulation lying on its side: spiral end at the left, fibre streaks on the body. */
function insulationRoll({ x, y, w = 380, h = 170, rot = 0, c1 = "#efcf6e", c2 = "#d9b44c" }) {
  const r = rng(11), streaks = [];
  for (let k = 0; k < 46; k++) { const sx = 70 + r() * (w - 80), sy = 6 + r() * (h - 12); streaks.push(`<path d="M${sx} ${sy} l${10 + r() * 26} ${(r() - 0.5) * 6}" stroke="${r() > 0.5 ? "#fff6c8" : "#b8923a"}" stroke-width="2" stroke-linecap="round" opacity=".55"/>`); }
  const R = h / 2;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SH}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="${R}" y="0" width="${w - R - 4}" height="${h}" rx="14" fill="${c1}"/>${streaks.join("")}<rect x="${R}" y="0" width="${w - R - 4}" height="16" fill="#fff" opacity=".22"/><rect x="${R}" y="${h - 22}" width="${w - R - 4}" height="22" fill="#000" opacity=".12"/>
    <ellipse cx="${R}" cy="${R}" rx="${R * 0.62}" ry="${R}" fill="${c2}"/><ellipse cx="${R}" cy="${R}" rx="${R * 0.46}" ry="${R * 0.76}" fill="${c1}"/><ellipse cx="${R}" cy="${R}" rx="${R * 0.3}" ry="${R * 0.5}" fill="${c2}"/><ellipse cx="${R}" cy="${R}" rx="${R * 0.14}" ry="${R * 0.24}" fill="#5b4a28"/></svg>`;
}

/** A wooden step ladder or loft ladder: two oak rails and square rungs. */
function ladder({ x, y, w = 190, h = 400, rot = 0, rungs = 5 }) {
  const gap = h / rungs, out = [];
  for (let k = 0; k < rungs; k++) out.push(`<rect x="10" y="${k * gap + gap * 0.5}" width="${w - 20}" height="22" rx="4" fill="#b88a50"/><rect x="10" y="${k * gap + gap * 0.5}" width="${w - 20}" height="6" fill="#e0b97c" opacity=".7"/>`);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SH}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="0" y="0" width="28" height="${h}" rx="6" fill="#a97b43"/><rect x="0" y="0" width="9" height="${h}" fill="#dcb579" opacity=".6"/><rect x="${w - 28}" y="0" width="28" height="${h}" rx="6" fill="#946a37"/><rect x="${w - 28}" y="0" width="9" height="${h}" fill="#dcb579" opacity=".4"/>${out.join("")}</svg>`;
}

/**
 * A furnace filter as a box in oblique view: front face (w x h), depth shown by
 * the offset (dx, dy). (x, y) is the top-left of the FRONT face. Optional
 * `text` is printed on a band at the foot of the frame.
 */
function filterBox({ x, y, w, h, dx, dy, b = 34, bb = null, text = null, id, pleat = 16, fs = 48, media = "#f4f1e8", pleatC = "#dcd8cb", extra = "" }) {
  const W = w + dx, H = h + dy, bot = bb ?? b;
  const mw = w - 2 * b, mh = h - b - bot;
  return `<svg style="${abs(x, y - dy, W, H, `${SH};${extra}`)}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><defs>
    <pattern id="${id}p" width="${pleat}" height="20" patternUnits="userSpaceOnUse"><rect width="${pleat}" height="20" fill="${media}"/><rect width="${pleat / 2}" height="20" fill="${pleatC}"/></pattern></defs>
    <polygon points="${w},${dy} ${W},0 ${W},${h} ${w},${h + dy}" fill="#a58559"/><polygon points="0,${dy} ${dx},0 ${W},0 ${w},${dy}" fill="#dcc19b"/>
    <rect x="0" y="${dy}" width="${w}" height="${h}" fill="#c8a679"/><rect x="0" y="${dy}" width="${w}" height="${h}" fill="none" stroke="#7d5f35" stroke-opacity=".5" stroke-width="2"/>
    <rect x="${b}" y="${dy + b}" width="${mw}" height="${mh}" fill="url(#${id}p)"/><rect x="${b}" y="${dy + b}" width="${mw}" height="${mh}" fill="none" stroke="#7d5f35" stroke-opacity=".45" stroke-width="3"/>
    <path d="M${b} ${dy + b} h${mw} v${mh}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="6"/>
    ${text ? `<text x="${w / 2}" y="${dy + h - bot / 2 + fs * 0.35}" text-anchor="middle" font-family="Plex Mono,monospace" font-weight="600" font-size="${fs}" fill="#2a2118" letter-spacing="1">${esc(text)}</text>` : ""}</svg>`;
}

/** Wood-grain strokes for a flat panel (CSS background). */
const grainCss = (a = ".07") => `repeating-linear-gradient(90deg,rgba(0,0,0,${a}) 0 2px,transparent 2px 9px)`;

/* ---------- pin 40: the one task to start with ---------- */
function pin40() {
  const i = idea(40);
  const [n1, t1] = split(i.items[0]);
  const [n2, t2] = split(i.items[1]);
  const rafters = timber([
    beam(500, 340, -120, 1000, 74), beam(500, 340, 1120, 1000, 74), beam(500, 340, -60, 1300, 52, "#43362a", "#5b4833"), beam(500, 340, 1060, 1300, 52, "#43362a", "#5b4833"),
    beam(-40, 700, 1040, 700, 30, "#3b2f23", "#53422f"),
  ].join(""));
  const bg = fill("background:linear-gradient(180deg,#2b251c 0,#3a2f22 55%,#1e1912 100%)") + rafters + `<div style="${abs(0, 380, 1000, 900, "background:radial-gradient(ellipse at 50% 78%,rgba(255,190,90,.38),rgba(255,190,90,0) 60%)")}"></div>`;
  const card = (x, name, tag) => `<div data-check="card" style="${abs(x, 392, 430, 206, `background:${C.paperLight};border-radius:18px;padding:18px 22px;border-left:12px solid ${C.sage};box-shadow:0 14px 26px rgba(0,0,0,.5);display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start`)}"><div style="font:600 31px/1.18 'Plex',sans-serif;color:${C.ink}">${esc(name)}</div><div style="display:inline-block;background:${C.sage};color:#fff;font:600 25px/1.2 'Plex',sans-serif;padding:8px 16px;border-radius:14px">${esc(tag)}</div></div>`;
  const furnace = `<svg style="${abs(40, 628, 380, 588, SH)}" viewBox="-40 0 440 680" aria-hidden="true"><defs>
    <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dfe5e0"/><stop offset=".6" stop-color="#c3ccc5"/><stop offset="1" stop-color="#a3afa7"/></linearGradient></defs>
    <rect x="50" y="0" width="240" height="30" rx="6" fill="#98a39c"/><rect x="20" y="20" width="300" height="640" rx="12" fill="url(#fg)"/>
    <rect x="40" y="48" width="260" height="250" rx="6" fill="#cdd5cf" stroke="#9aa59e" stroke-width="3"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="62" y="${72 + k * 20}" width="216" height="9" rx="4" fill="#8e9a93" opacity=".8"/>`).join("")}
    <circle cx="270" cy="270" r="9" fill="${C.sage}"/><rect x="70" y="256" width="60" height="24" rx="5" fill="#eef1ee" stroke="#9aa59e" stroke-width="2"/>
    <rect x="40" y="318" width="260" height="316" rx="6" fill="#1b2125"/>
    <ellipse cx="170" cy="366" rx="130" ry="46" fill="#f2a43a" opacity=".3"/>
    <circle cx="170" cy="522" r="80" fill="#2d363b" stroke="#4a585f" stroke-width="7"/><circle cx="170" cy="522" r="30" fill="#4a585f"/>
    ${Array.from({ length: 10 }, (_, k) => `<path d="M170 522 L${170 + Math.cos((k * 36 * Math.PI) / 180) * 70} ${522 + Math.sin((k * 36 * Math.PI) / 180) * 70}" stroke="#58676e" stroke-width="7" stroke-linecap="round"/>`).join("")}
    <rect x="66" y="384" width="208" height="20" rx="5" fill="#3a444a"/>
    ${[0, 1, 2, 3, 4].map((k) => `<path d="M${92 + k * 40} 384 C ${80 + k * 40} 362 ${96 + k * 40} 350 ${92 + k * 40} 330 C ${108 + k * 40} 350 ${112 + k * 40} 366 ${92 + k * 40} 384 Z" fill="#f2a43a"/><path d="M${92 + k * 40} 384 C ${86 + k * 40} 372 ${94 + k * 40} 362 ${92 + k * 40} 352 C ${100 + k * 40} 362 ${102 + k * 40} 374 ${92 + k * 40} 384 Z" fill="#fff0b8"/>`).join("")}
    <polygon points="40,318 -32,340 -32,612 40,634" fill="#d6ddd7" stroke="#9aa59e" stroke-width="3"/><polygon points="40,318 -32,340 -32,360 40,338" fill="#fff" opacity=".4"/><rect x="-22" y="466" width="9" height="56" rx="4" fill="#8a948d"/>
    <rect x="50" y="650" width="46" height="24" rx="4" fill="#6c766f"/><rect x="244" y="650" width="46" height="24" rx="4" fill="#6c766f"/></svg>`;
  const heater = `<svg style="${abs(590, 616, 300, 608, SH)}" viewBox="0 0 330 680" aria-hidden="true"><defs>
    <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f6f2"/><stop offset=".55" stop-color="#cfd8d1"/><stop offset="1" stop-color="#a9b5ad"/></linearGradient></defs>
    <rect x="68" y="628" width="20" height="40" fill="#5c665f"/><rect x="242" y="628" width="20" height="40" fill="#5c665f"/>
    <rect x="100" y="0" width="22" height="130" fill="${C.slate}"/><rect x="100" y="0" width="7" height="130" fill="#fff" opacity=".28"/>
    <path d="M226 130 V34 H312" stroke="#c07a45" stroke-width="22" fill="none" stroke-linejoin="round"/><path d="M226 130 V34 H312" stroke="#f0b284" stroke-width="6" fill="none" stroke-linejoin="round" opacity=".6" transform="translate(-5 -4)"/>
    <rect x="40" y="110" width="250" height="530" rx="46" fill="url(#wg)"/><ellipse cx="165" cy="116" rx="125" ry="22" fill="#e1e7e2"/><rect x="72" y="150" width="22" height="440" rx="11" fill="#fff" opacity=".5"/>
    <rect x="40" y="330" width="250" height="100" fill="${C.sage}"/><rect x="40" y="330" width="250" height="14" fill="#fff" opacity=".18"/><rect x="104" y="356" width="130" height="48" rx="6" fill="#f6f3ea"/><path d="M118 372 H220 M118 388 H190" stroke="#aeb7b0" stroke-width="6" stroke-linecap="round"/>
    <rect x="280" y="236" width="40" height="24" rx="5" fill="#c9a24a"/><rect x="298" y="260" width="10" height="150" rx="4" fill="#c07a45"/>
    <rect x="118" y="506" width="96" height="66" rx="9" fill="#2c3a35"/><circle cx="166" cy="540" r="19" fill="${C.butter}"/><circle cx="166" cy="540" r="7" fill="#2c3a35"/>
    <rect x="250" y="594" width="44" height="18" rx="5" fill="#c9a24a"/></svg>`;
  const label = `<div data-check="label" style="${abs(110, 1250, 780, 88, `background:${C.kraft};border-radius:8px;transform:rotate(-1deg);display:flex;align-items:center;justify-content:center;font:500 44px/1 'Newsreader',Georgia,serif;color:${C.ink};box-shadow:0 12px 20px rgba(0,0,0,.5),inset 0 0 0 2px rgba(60,40,10,.22)`)}"><span>under an hour to check or book</span></div>`;
  return printable({ n: 40, paper: "#efe6d4", bottomMax: 372, scene: `${bg}${planks({ y: 1212, h: 142 })}${card(40, n1, t1)}${card(530, n2, t2)}${furnace}${heater}${lantern({ x: 452, y: 1030, s: 1 })}${label}` });
}

/* ---------- pin 42: reading a furnace filter's size ---------- */
function pin42() {
  const i = idea(42);
  const r = rng(21), strands = [];
  for (let k = 0; k < 340; k++) { const l = r() > 0.5; strands.push(`<rect x="${r() * 1000}" y="${372 + r() * 982}" width="${40 + r() * 80}" height="${7 + r() * 8}" rx="2" fill="${l ? "#e8d3a2" : "#b99f6a"}" opacity="${(0.25 + r() * 0.35).toFixed(2)}" transform="rotate(${(r() - 0.5) * 24} 0 0)"/>`); }
  const osb = fill("background:#d6bd88") + `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${strands.join("")}</svg>` + fill("background:radial-gradient(ellipse at 18% 25%,rgba(255,250,225,.55),rgba(60,40,10,.3) 90%)");
  const trusses = timber([beam(-60, 372, 330, 1350, 40, "#efe3c6", "#fff7e0"), beam(1060, 372, 700, 1350, 40, "#e6d8b6", "#f7ecd0")].join(""));
  const fx = 140, fy = 480, fw = 420, fh = 656, dx = 60, dy = 34;
  const frame = filterBox({ x: fx, y: fy, w: fw, h: fh, dx, dy, b: 36, bb: 96, text: "16x25x1", id: "f42", pleat: 18, fs: 56 });
  const pill = (x, y, w, t, vertical = false) => vertical
    ? `<div data-check="callout" style="${abs(x, y, 58, w, `background:${C.sageDeep};color:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 14px rgba(40,25,5,.4)`)}"><span style="writing-mode:vertical-rl;transform:rotate(180deg);font:600 32px 'Plex',sans-serif;letter-spacing:.04em">${esc(t)}</span></div>`
    : `<div data-check="callout" style="${abs(x, y, w, 58, `background:${C.sageDeep};color:#fff;border-radius:16px;display:flex;align-items:center;justify-content:center;font:600 32px 'Plex',sans-serif;letter-spacing:.04em;box-shadow:0 8px 14px rgba(40,25,5,.4)`)}"><span>${esc(t)}</span></div>`;
  const arrowSvg = (d) => `<svg style="${abs(0, 0, 1000, 1500, "pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke="${C.sageDeep}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">${d}</g></svg>`;
  const arrows = arrowSvg(`
    <path d="M${fx} 440 H${fx + fw}"/><path d="M${fx + 20} 424 L${fx} 440 L${fx + 20} 456"/><path d="M${fx + fw - 20} 424 L${fx + fw} 440 L${fx + fw - 20} 456"/>
    <path d="M96 ${fy + dy} V${fy + dy + fh}"/><path d="M80 ${fy + dy + 20} L96 ${fy + dy} L112 ${fy + dy + 20}"/><path d="M80 ${fy + dy + fh - 20} L96 ${fy + dy + fh} L112 ${fy + dy + fh - 20}"/>
    <path d="M706 640 H${fx + fw + dx / 2 + 14}"/><path d="M${fx + fw + dx / 2 + 36} 624 L${fx + fw + dx / 2 + 14} 640 L${fx + fw + dx / 2 + 36} 656"/>`);
  const card = (y, h, text) => `<div data-check="note" style="${abs(700, y, 262, h, `background:${C.paperLight};border-radius:16px;border-left:10px solid ${C.sage};padding:16px 20px;font:500 26px/1.3 'Plex',sans-serif;color:${C.ink};box-shadow:0 14px 24px rgba(40,25,5,.4)`)}">${esc(text)}</div>`;
  const ex = `<div class="example" style="${abs(fx + 232, fy + dy + 44, 150, 42, "display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#4b4339;background:rgba(255,255,255,.7);padding:0")}">Example</div>`;
  return printable({ n: 42, paper: "#eadfc4", scene: `${osb}${trusses}${arrows}${frame}${ex}${pill(fx + fw / 2 - 80, 411, 160, "width")}${pill(67, fy + dy + fh / 2 - 80, 160, "length", true)}${pill(706, 598, 150, "depth")}${card(392, 186, i.items[0])}${card(676, 224, i.items[1])}${card(920, 238, i.items[2])}${insulationRoll({ x: 100, y: 1192, w: 380, h: 146, rot: -1.5 })}${carton({ x: 530, y: 1200, w: 170, h: 136, rot: 1.5 })}` });
}

/* ---------- pin 44: a one inch filter beside a four inch filter, to scale ---------- */
function pin44() {
  const i = idea(44);
  const [l1, t1] = split(i.items[0]);
  const [l2, t2] = split(i.items[1]);
  const r = rng(33), fib = [];
  for (let k = 0; k < 420; k++) { const sx = r() * 1000, sy = 372 + r() * 982; fib.push(`<path d="M${sx} ${sy} l${12 + r() * 30} ${(r() - 0.5) * 8}" stroke="${r() > 0.5 ? "#fff3bf" : "#b78f2e"}" stroke-width="2.2" stroke-linecap="round" opacity=".5"/>`); }
  const batts = fill("background:linear-gradient(180deg,#ecd070,#dfbf55)") + `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${fib.join("")}</svg>`;
  const joists = timber([beam(14, 372, 14, 1350, 44, "#5b452c", "#7b6140"), beam(986, 372, 986, 1350, 44, "#5b452c", "#7b6140"), beam(476, 372, 476, 1350, 40, "#5b452c", "#7b6140")].join(""));
  const u = 22, fw = 16 * u, fh = 25 * u, top = 640;
  const f1 = filterBox({ x: 70, y: top, w: fw, h: fh, dx: u * 0.9, dy: u * 0.5, b: 30, id: "f44a", pleat: 14 });
  const f4 = filterBox({ x: 530, y: top, w: fw, h: fh, dx: u * 4 * 0.9, dy: u * 4 * 0.5, b: 30, id: "f44b", pleat: 14 });
  const card = (x, label, big) => `<div data-check="interval" style="${abs(x, 392, 430, 176, `background:${C.paperLight};border-radius:18px;border-left:12px solid ${C.sage};padding:18px 24px;box-shadow:0 14px 24px rgba(60,40,0,.4)`)}"><div style="font:600 29px/1.2 'Plex',sans-serif;color:${C.sageDeep}">${esc(label)}</div><div style="font:500 48px/1.1 'Newsreader',Georgia,serif;color:${C.ink};margin-top:12px;letter-spacing:-.01em">${esc(big)}</div></div>`;
  const shadow = (x, w) => `<div style="${abs(x, top + fh - 6, w, 34, "background:radial-gradient(ellipse,rgba(20,10,0,.55),rgba(20,10,0,0) 70%)")}"></div>`;
  const note = `<div data-check="manual note" style="${abs(100, 1222, 800, 106, `background:${C.kraft};border-radius:8px;transform:rotate(-1deg);display:flex;align-items:center;gap:20px;padding:0 30px;font:500 36px/1.12 'Newsreader',Georgia,serif;color:${C.ink};box-shadow:0 12px 20px rgba(0,0,0,.5),inset 0 0 0 2px rgba(60,40,10,.22)`)}"><span style="flex:none">${icon("book-open-text", { size: 56, color: C.sageDeep, weight: "duotone" })}</span><span>${esc(i.items[2])}</span></div>`;
  return printable({ n: 44, paper: "#f1e6bf", scene: `${batts}${joists}${planks({ y: 1196, h: 158, base: "#7d5f3a", dark: "#664b2b", seed: 8 })}${card(40, l1, t1)}${card(530, l2, t2)}${shadow(40, 420)}${shadow(500, 500)}${f1}${f4}${note}` });
}

/* ---------- pin 46: three steps to tell a filter is overdue ---------- */
function pin46() {
  const i = idea(46);
  const wall = fill("background:linear-gradient(120deg,#e9eee8 0,#dbe3dc 60%,#c9d4cc 100%)") + fill("background:repeating-linear-gradient(90deg,rgba(60,80,66,.10) 0 3px,transparent 3px 112px)")
    + `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><defs><linearGradient id="bm46" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffbe0" stop-opacity=".85"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></linearGradient></defs><path d="M1040 -20 L1040 300 L-80 982 L-80 700 Z" fill="url(#bm46)"/></svg>`;
  const lad = ladder({ x: -26, y: 372, w: 140, h: 982, rungs: 9 });
  const pleatDef = (id, a, b) => `<pattern id="${id}" width="14" height="20" patternUnits="userSpaceOnUse"><rect width="14" height="20" fill="${a}"/><rect width="7" height="20" fill="${b}"/></pattern>`;
  const filt = (x, y, w, h, media, id, extra = "") => `<g ${extra}><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#c8a679" stroke="#7d5f35" stroke-opacity=".5" stroke-width="2"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="url(#${id})"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="none" stroke="#7d5f35" stroke-opacity=".4" stroke-width="2"/>${media ?? ""}</g>`;
  const ill1 = `<svg viewBox="0 0 260 240" width="260" height="240" aria-hidden="true"><defs>${pleatDef("p1", "#fffdf0", "#fbefb8")}<radialGradient id="g1" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="#fff9d6"/><stop offset="1" stop-color="#f1dc8c"/></radialGradient></defs>
    <rect width="260" height="240" rx="18" fill="url(#g1)"/>${[0, 1, 2, 3, 4].map((k) => `<path d="M${30 + k * 50} 0 L${10 + k * 50} 40" stroke="#fff" stroke-width="5" opacity=".55" stroke-linecap="round"/>`).join("")}
    ${filt(68, 22, 124, 168, null, "p1", 'transform="rotate(-4 130 106)"')}
    <rect x="86" y="40" width="88" height="132" fill="#fffbd8" opacity=".5" transform="rotate(-4 130 106)"/>
    <path d="M74 206 C 70 178 200 176 206 204 L214 240 H66 Z" fill="#e7bb94"/><rect x="62" y="150" width="36" height="84" rx="18" fill="#e0ad84" transform="rotate(-14 80 192)"/><rect x="62" y="150" width="12" height="84" rx="6" fill="#f3d3b6" opacity=".6" transform="rotate(-14 80 192)"/></svg>`;
  const rg = rng(8), smudge = Array.from({ length: 34 }, () => `<path d="M${32 + rg() * 60} ${56 + rg() * 126} l${6 + rg() * 18} ${(rg() - 0.5) * 8}" stroke="#4c4b46" stroke-width="3" stroke-linecap="round" opacity=".55"/>`).join("");
  const ill2 = `<svg viewBox="0 0 260 240" width="260" height="240" aria-hidden="true"><defs>${pleatDef("p2g", "#9a9992", "#7f7e77")}${pleatDef("p2w", "#f6f3ea", "#dcd8cb")}</defs>
    <rect width="260" height="240" rx="18" fill="#efe6d3"/>
    ${filt(18, 36, 108, 162, null, "p2g")}<rect x="30" y="48" width="84" height="138" fill="#5d5c57" opacity=".28"/><g>${smudge}</g>
    ${filt(138, 36, 108, 162, null, "p2w")}</svg>`;
  const cal = `<svg viewBox="0 0 260 240" width="260" height="240" aria-hidden="true"><rect width="260" height="240" rx="18" fill="${C.wash}"/>
    <rect x="40" y="12" width="180" height="156" rx="10" fill="${C.paperLight}" stroke="#b7c3b3" stroke-width="2"/><path d="M40 22 a10 10 0 0 1 10 -10 H210 a10 10 0 0 1 10 10 V44 H40 Z" fill="${C.sage}"/><circle cx="84" cy="12" r="7" fill="#26332a"/><circle cx="176" cy="12" r="7" fill="#26332a"/>
    ${Array.from({ length: 28 }, (_, k) => `<rect x="${50 + (k % 7) * 24.5}" y="${52 + Math.floor(k / 7) * 28}" width="18" height="22" rx="4" fill="#dde4da"/>`).join("")}
    <circle cx="${50 + 3 * 24.5 + 9}" cy="${52 + 28 + 11}" r="17" fill="none" stroke="${C.sage}" stroke-width="5"/></svg>`;
  const calCaption = `<div style="${abs(0, 176, 260, 56, "display:flex;align-items:center;justify-content:center;text-align:center;text-wrap:balance;font:600 22px/1.15 'Plex',sans-serif;color:" + C.ink)}"><span style="background:${C.paperLight};padding:6px 14px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.18)">checking again next month</span></div>`;
  const ills = [ill1, ill2, cal + calCaption];
  const rowH = 300, gap = 20, y0 = 396;
  const rows = i.items.map((t, k) => {
    const y = y0 + k * (rowH + gap);
    return `<div style="${abs(110, y, 850, rowH, `background:${C.paperLight};border-radius:22px;box-shadow:0 14px 26px rgba(40,60,46,.3),inset 0 0 0 2px rgba(60,80,66,.1)`)}"></div>
    <div style="${abs(76, y + 18, 80, 80, `border-radius:50%;background:${C.sage};border:5px solid #fff;display:grid;place-items:center;font:600 44px 'Newsreader',serif;color:#fff;box-shadow:0 8px 14px rgba(40,60,46,.4);z-index:2`)}">${k + 1}</div>
    <div style="${abs(150, y + 30, 260, 240, "border-radius:18px;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(60,40,10,.15)")}">${ills[k]}</div>
    <div data-check="step ${k + 1}" style="${abs(438, y + 20, 500, rowH - 40, `display:flex;align-items:center;font:500 29px/1.3 'Plex',sans-serif;color:${C.ink}`)}"><span>${esc(t)}</span></div>`;
  }).join("");
  return printable({ n: 46, paper: "#e6ece7", scene: `${wall}${lad}${rows}` });
}

/* ---------- pin 48: a made-up maintenance log, three entries ---------- */
function pin48() {
  const i = idea(48);
  const rows = [
    ["Aug 14", "Flushed the water heater tank", "Ace Plumbing", "$180.00", "Anode rod is due next time"],
    ["Oct 2", "Cleaned the dryer vent", "You", "$0", "More lint than expected, check every 6 months"],
    ["Nov 20", "Furnace tune-up", "Reliable Heat & Air", "$145.00", "Said the blower belt is wearing"],
  ];
  // Every cell must be the bank's own text.
  const bank = i.items.join(" | ");
  rows.flat().forEach((c) => { if (!bank.includes(c)) throw new Error(`pin 48 cell not in bank: ${c}`); });
  const heads = ["Date", "What was done", "Who did it", "Cost", "Note"];
  const cw = [124, 188, 130, 120, 218];
  const floor = planks({ y: 372, h: 982, base: "#4d3a27", dark: "#3f2f1f", seed: 14, bh: 70 });
  const r = rng(6), slats = [];
  for (let k = 0; k < 14; k++) slats.push(`<rect x="${20 + k * 68.6}" y="0" width="3" height="982" fill="#2a160a" opacity=".5"/>`);
  const grain = Array.from({ length: 60 }, () => `<path d="M${r() * 960} ${r() * 982} l${4 + r() * 6} ${60 + r() * 140}" stroke="#2a160a" stroke-width="2" opacity=".18"/>`).join("");
  const trunk = `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><defs><linearGradient id="tr48" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5a37"/><stop offset="1" stop-color="#5e3a22"/></linearGradient><radialGradient id="tl48" cx="30%" cy="12%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#150a02" stop-opacity=".4"/></radialGradient></defs>
    <rect x="16" y="0" width="968" height="982" rx="10" fill="url(#tr48)"/>${slats.join("")}${grain}
    <rect x="16" y="0" width="968" height="982" rx="10" fill="url(#tl48)"/>
    <rect x="70" y="0" width="64" height="982" fill="#3a3028"/><rect x="866" y="0" width="64" height="982" fill="#3a3028"/><rect x="70" y="0" width="14" height="982" fill="#fff" opacity=".12"/><rect x="866" y="0" width="14" height="982" fill="#fff" opacity=".12"/>
    ${[40, 200, 360, 520, 680, 840, 940].flatMap((yy) => [102, 898].map((xx) => `<circle cx="${xx}" cy="${yy}" r="9" fill="#c9a24a"/><circle cx="${xx - 2}" cy="${yy - 2}" r="3.5" fill="#f6e3a0"/>`)).join("")}
    <rect x="16" y="0" width="968" height="12" fill="#c9a24a" opacity=".85"/></svg>`;
  const lock = `<svg style="${abs(424, 1196, 152, 150, SH)}" viewBox="0 0 152 150" aria-hidden="true"><rect x="8" y="10" width="136" height="120" rx="14" fill="#c9a24a"/><rect x="8" y="10" width="136" height="26" rx="12" fill="#f0d98a" opacity=".6"/><circle cx="76" cy="70" r="20" fill="#3a2a10"/><path d="M68 70 H84 L86 104 H66 Z" fill="#3a2a10"/><circle cx="76" cy="66" r="7" fill="#c9a24a"/></svg>`;
  const ringsX = 48;
  const table = `<div style="display:flex;background:${C.sage};height:58px">${heads.map((h, k) => `<div style="flex:none;width:${cw[k]}px;padding:0 8px;display:flex;align-items:center;font:600 22px 'Plex',sans-serif;color:#fff;white-space:nowrap;border-left:${k ? "2px solid rgba(255,255,255,.35)" : "0"}">${esc(h)}</div>`).join("")}</div>`
    + rows.map((row, ri) => `<div data-check="log row ${ri + 1}" style="display:flex;height:178px;border-bottom:3px solid ${C.rule}">${row.map((c, k) => `<div style="flex:none;width:${cw[k]}px;padding:12px 10px;border-left:${k ? `2px solid ${C.rule}` : "0"};font:600 ${k === 4 || k === 1 || k === 0 ? 33 : 35}px/1.08 'Hand',cursive;color:#23395a;overflow:hidden">${esc(c).replace(/(\S*-\S*)/g, '<span style="white-space:nowrap">$1</span>')}</div>`).join("")}</div>`).join("")
    + [0, 1].map(() => `<div style="height:56px;border-bottom:3px solid ${C.rule};opacity:.7"></div>`).join("");
  const binder = `<div style="${abs(24, 404, 952, 770, "transform:rotate(-1deg)")}">
    <div style="${abs(0, 0, 952, 770, "background:linear-gradient(135deg,#d3b283,#b99365);border-radius:18px;box-shadow:0 3px 5px rgba(20,8,0,.5),0 30px 50px rgba(20,8,0,.6)")}"></div>
    <div style="${abs(0, 0, 952, 770, "border-radius:18px;background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 6px)")}"></div>
    ${[110, 360, 610].map((yy) => `<div style="${abs(ringsX, yy, 74, 40, "border-radius:20px;background:linear-gradient(#e8eaec,#9ea3a9);box-shadow:0 5px 8px rgba(0,0,0,.4)")}"></div>`).join("")}
    <div style="${abs(150, 38, 780, 700, `background:${C.paperLight};border-radius:4px;box-shadow:0 3px 5px rgba(20,8,0,.35);overflow:hidden`)}">${table}
      <div class="example" style="${abs(610, 636, 150, 42, "display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#4b4339;padding:0;background:#fff")}">Example</div></div>
    ${[130, 380, 630].map((yy) => `<div style="${abs(ringsX + 40, yy - 18, 60, 14, "background:#c7ccd1;border-radius:7px;box-shadow:0 2px 3px rgba(0,0,0,.3)")}"></div>`).join("")}
  </div>`;
  return printable({ n: 48, paper: "#e9dcc6", extraCss: ".top h1{font-size:66px}", scene: `${floor}${trunk}${binder}${lock}${pencil({ x: 40, y: 1250, len: 380, rot: -4 })}<div style="${abs(640, 1222, 1, 1)}"></div>` });
}

/* ---------- pin 50: the notes to write after a service visit ---------- */
function pin50() {
  const i = idea(50);
  const wall = fill("background:linear-gradient(180deg,#352b20,#2a2119)") + fill(`background:${grainCss(".12")}`)
    + timber([beam(-60, 372, 300, 700, 60, "#4b3b2a", "#6a543b"), beam(1060, 372, 760, 700, 60, "#4b3b2a", "#6a543b")].join(""));
  const cabinet = `<svg style="${abs(50, 560, 900, 800, "filter:drop-shadow(0 20px 22px rgba(0,0,0,.55))")}" viewBox="0 0 900 800" aria-hidden="true"><defs><linearGradient id="cb50" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7dfd9"/><stop offset=".5" stop-color="#c3ccc5"/><stop offset="1" stop-color="#9eaaa2"/></linearGradient></defs>
    <rect x="0" y="0" width="900" height="800" rx="18" fill="url(#cb50)"/><rect x="0" y="0" width="900" height="30" rx="14" fill="#fff" opacity=".28"/>
    ${[0, 1, 2, 3, 4].map((k) => `<rect x="60" y="${44 + k * 18}" width="780" height="8" rx="4" fill="#8a968f" opacity=".75"/>`).join("")}
    <rect x="34" y="150" width="832" height="700" rx="10" fill="none" stroke="#8c988f" stroke-width="4"/><rect x="38" y="154" width="824" height="6" fill="#fff" opacity=".35"/>
    <rect x="690" y="176" width="150" height="60" rx="8" fill="#eef1ee" stroke="#8c988f" stroke-width="3"/><circle cx="716" cy="206" r="9" fill="${C.sage}"/><path d="M742 198 H820 M742 214 H800" stroke="#aab3ad" stroke-width="6" stroke-linecap="round"/>
    ${[[16, 16], [884, 16], [16, 120], [884, 120]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="7" fill="#7f8b84"/>`).join("")}</svg>`;
  const tape = (x, y, rot) => `<div style="${abs(x, y, 110, 40, `background:rgba(169,205,178,.78);transform:rotate(${rot}deg);box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:3`)}"></div>`;
  const note = (x, y, w, h, rot, text, fs) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg)`)}">
    <div data-check="note" style="${abs(0, 0, w, h, `background:linear-gradient(160deg,#d6b583,${C.kraft});box-shadow:0 3px 4px rgba(0,0,0,.35),0 22px 32px rgba(0,0,0,.45);padding:44px 34px 24px;display:flex;align-items:center;font:600 ${fs}px/1.02 'Hand',cursive;color:#2a2118`)}"><span>${esc(text)}</span></div>${tape(w / 2 - 55, -18, -3)}</div>`;
  const ex = `<div class="example" style="${abs(776, 1112, 150, 42, "display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#3e4842;background:rgba(255,255,255,.7);padding:0")}">Example</div>`;
  return printable({
    n: 50, paper: "#e7dcc6", bottomMax: 372,
    scene: `${wall}${lantern({ x: 790, y: 396, s: 1 })}${cabinet}${ex}${note(150, 690, 400, 250, -4, i.items[0], 78)}${note(520, 800, 420, 270, 3.2, i.items[1], 74)}${note(110, 1010, 480, 290, -2, i.items[2], 62)}${pencil({ x: 590, y: 1230, len: 340, rot: -8 })}`,
  });
}

/* ---------- pin 52: four questions, through a dormer window onto the driveway ---------- */
function pin52() {
  const i = idea(52);
  const wall = fill("background:linear-gradient(120deg,#f1ead8 0,#e6dcc3 100%)") + fill("background:repeating-linear-gradient(90deg,rgba(120,90,50,.13) 0 3px,transparent 3px 96px)")
    + timber([beam(-60, 372, 260, 1100, 48, "#8a6a42", "#b08a5a"), beam(1060, 372, 760, 1100, 48, "#8a6a42", "#b08a5a")].join(""));
  const L = "#2d3a32";
  const view = `<svg style="${abs(40, 400, 380, 660)}" viewBox="0 0 380 660" aria-hidden="true"><defs><clipPath id="arch52"><path d="M20 640 V190 C20 60 90 16 190 16 S360 60 360 190 V640 Z"/></clipPath></defs>
    <path d="M6 650 V190 C6 50 80 4 190 4 S374 50 374 190 V650 Z" fill="#8a6a42"/><path d="M6 650 V190 C6 50 80 4 190 4 S374 50 374 190" fill="none" stroke="#b08a5a" stroke-width="5"/>
    <g clip-path="url(#arch52)"><rect x="0" y="0" width="380" height="660" fill="#dfeadc"/>
      <rect x="0" y="330" width="380" height="330" fill="#b4cfae"/>
      <path d="M-20 560 L150 420 H380 V470 L120 660 H-20 Z" fill="#c4c6bf" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><path d="M0 470 H380" stroke="${L}" stroke-width="4"/><rect x="0" y="470" width="380" height="14" fill="#9aa59a"/>
      <rect x="196" y="120" width="190" height="230" fill="#f6f1e2" stroke="${L}" stroke-width="4"/><path d="M186 124 L291 56 L396 124 Z" fill="#a9b8a3" stroke="${L}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="250" y="190" width="70" height="160" fill="${C.sageDeep}" stroke="${L}" stroke-width="4"/><circle cx="306" cy="274" r="5" fill="#e8c35c"/><rect x="238" y="346" width="94" height="14" fill="#cfd3c8" stroke="${L}" stroke-width="3"/>
      <rect x="208" y="150" width="30" height="46" fill="#cfe0dc" stroke="${L}" stroke-width="3"/><rect x="334" y="150" width="30" height="46" fill="#cfe0dc" stroke="${L}" stroke-width="3"/>
      <path d="M96 350 V420 M110 350 V420" stroke="${L}" stroke-width="3"/><circle cx="40" cy="300" r="40" fill="#8fb38a" stroke="${L}" stroke-width="4"/>
      <g transform="translate(-6 466)"><rect x="40" y="0" width="236" height="98" rx="14" fill="#fbfaf6" stroke="${L}" stroke-width="4"/><path d="M200 0 H252 Q276 0 280 40 L284 60 V98 H200 Z" fill="#eef0ea" stroke="${L}" stroke-width="4" stroke-linejoin="round"/><path d="M212 12 H248 Q262 14 266 40 H212 Z" fill="#cfe0dc" stroke="${L}" stroke-width="3"/><rect x="40" y="62" width="150" height="14" fill="${C.sage}"/><rect x="62" y="14" width="110" height="32" fill="#cfe0dc" stroke="${L}" stroke-width="3"/>
        <circle cx="96" cy="100" r="24" fill="#2d3a32"/><circle cx="96" cy="100" r="10" fill="#cfd3c8"/><circle cx="226" cy="100" r="24" fill="#2d3a32"/><circle cx="226" cy="100" r="10" fill="#cfd3c8"/></g></g>
    <path d="M190 4 V650 M6 330 H374" stroke="#8a6a42" stroke-width="12"/><path d="M190 4 V650 M6 330 H374" stroke="#b08a5a" stroke-width="3"/>
    <rect x="-4" y="640" width="388" height="22" rx="4" fill="#9a7746"/></svg>`;
  const bubbleH = 150, bGap = 22, by0 = 402;
  const bubbles = i.items.map((q, k) => {
    const y = by0 + k * (bubbleH + bGap);
    return `<svg style="${abs(428, y + 54, 32, 44)}" viewBox="0 0 32 44" aria-hidden="true"><path d="M32 4 L2 22 L32 40 Z" fill="${C.paperLight}"/></svg>
    <div data-check="question ${k + 1}" style="${abs(456, y, 506, bubbleH, `background:${C.paperLight};border-radius:30px;box-shadow:0 14px 24px rgba(60,40,10,.3),inset 0 0 0 2px rgba(60,80,66,.12);display:flex;align-items:center;gap:20px;padding:0 28px 0 22px`)}"><div style="flex:none;width:62px;height:62px;border-radius:50%;background:${C.sage};display:grid;place-items:center;font:600 36px 'Newsreader',serif;color:#fff">${k + 1}</div><div style="text-wrap:balance;font:500 29px/1.28 'Plex',sans-serif;color:${C.ink}">${esc(q)}</div></div>`;
  }).join("");
  const board = `<div style="${abs(70, 1092, 300, 250, "transform:rotate(-3deg)")}">
    <div style="${abs(0, 20, 300, 230, "background:linear-gradient(135deg,#a9743c,#8d5d2c);border-radius:16px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 26px 40px rgba(40,20,5,.5)")}"></div>
    <div style="${abs(24, 52, 252, 176, `background:${C.paperLight};border-radius:4px`)}">${[1, 2, 3, 4, 5].map((k) => `<div style="${abs(16, k * 30, 220, 3, `background:${C.rule}`)}"></div>`).join("")}</div>
    <div style="${abs(86, 0, 128, 56, "border-radius:12px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 5px 8px rgba(0,0,0,.35)")}"></div></div>`;
  return printable({ n: 52, paper: "#efe8d6", scene: `${wall}${planks({ y: 1090, h: 264, seed: 17, base: "#9a7a4c", dark: "#826339" })}${view}${bubbles}${board}${lantern({ x: 470, y: 1130, s: 1 })}${ladder({ x: 760, y: 1110, w: 190, h: 300, rot: 4, rungs: 3 })}` });
}

export const pins = [pin40(), pin42(), pin44(), pin46(), pin48(), pin50(), pin52()];
