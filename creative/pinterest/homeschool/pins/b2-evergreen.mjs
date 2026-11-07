/**
 * Batch 2, evergreen guide pins: #3 (five stepping stones, how-to-steps),
 * #1 (the question card, calendar and clock), #2 (the three-column template)
 * and #39 (the portfolio binder with five tabs). Every word is the bank's.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, pencil, mug, drawing } from "../kit/paper.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SHADOW = "0 2px 3px rgba(40,20,5,.25),0 16px 28px rgba(40,20,5,.32)";

/** A strip of washi tape. */
const tape = ({ x, y, w = 110, rot = -4, color = "#e7c6cf" }) =>
  `<div style="${abs(x, y, w, 36, `transform:rotate(${rot}deg);background:${color};opacity:.9;box-shadow:0 2px 4px rgba(40,20,5,.2);clip-path:polygon(0 0,4% 14%,0 28%,4% 42%,0 56%,4% 70%,0 84%,2% 100%,100% 100%,96% 86%,100% 72%,96% 58%,100% 44%,96% 30%,100% 16%,98% 0)`)}"></div>`;

/** A map pin / thumb tack seen from above. */
const tack = ({ x, y, color = "#c4573e" }) =>
  `<div style="${abs(x, y, 34, 34, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff7,${color} 38%,${color});box-shadow:0 6px 8px rgba(40,20,5,.4)`)}"></div>`;

/* ---------------------------------------------------------------- #3 */

const bag = ({ x, y, w = 210 }) => `<svg style="${abs(x, y, w, w * 1.15, "filter:drop-shadow(0 16px 12px rgba(40,20,5,.4))")}" viewBox="0 0 210 240" aria-hidden="true">
  <path d="M60 52 C 60 6, 150 6, 150 52" fill="none" stroke="#2f4258" stroke-width="12" stroke-linecap="round"/>
  <rect x="14" y="40" width="182" height="190" rx="48" fill="#4f6c8c"/>
  <rect x="14" y="40" width="182" height="190" rx="48" fill="none" stroke="#2f4258" stroke-width="4"/>
  <path d="M14 112 H196" stroke="#2f4258" stroke-width="4"/>
  <rect x="40" y="136" width="130" height="78" rx="22" fill="#5f7fa1" stroke="#2f4258" stroke-width="4"/>
  <path d="M46 150 H164" stroke="#2f4258" stroke-width="3" stroke-dasharray="6 6"/>
  <rect x="88" y="98" width="34" height="28" rx="6" fill="#e0a95a" stroke="#8a5f1f" stroke-width="3"/>
  <circle cx="105" cy="106" r="5" fill="#8a5f1f"/>
  <path d="M40 60 C 30 120 30 170 44 214" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="8" stroke-linecap="round"/>
  <path d="M168 122 q18 22 12 56" fill="none" stroke="#c4573e" stroke-width="8" stroke-linecap="round"/>
</svg>`;

const laptop = ({ x, y, w = 400 }) => `<svg style="${abs(x, y, w, w * 0.56, "filter:drop-shadow(0 18px 12px rgba(40,20,5,.42))")}" viewBox="0 0 400 224" aria-hidden="true">
  <path d="M70 8 H330 Q340 8 342 18 L352 128 H48 L58 18 Q60 8 70 8 Z" fill="#9aa0a8"/>
  <path d="M80 18 H320 L330 118 H70 Z" fill="#26323f"/>
  <path d="M80 18 H320 L330 118 H70 Z" fill="url(#lg)"/>
  <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7fb3d6" stop-opacity=".55"/><stop offset=".5" stop-color="#7fb3d6" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs>
  <path d="M30 130 H370 L392 206 Q394 216 384 216 H16 Q6 216 8 206 Z" fill="#c9ced4"/>
  <path d="M30 130 H370 L374 142 H26 Z" fill="#aab0b8"/>
  <g fill="#8e949c">${Array.from({ length: 4 }, (_, r) => Array.from({ length: 12 }, (_, c) => `<rect x="${44 + c * 26 - r * 2}" y="${148 + r * 13}" width="20" height="9" rx="2"/>`).join("")).join("")}</g>
  <rect x="165" y="198" width="70" height="12" rx="4" fill="#aeb4bb"/>
</svg>`;

function stepCard({ x, y, w = 450, h = 142, rot, n, text }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(160deg,#dfc08f,#cfab76);border-radius:8px;box-shadow:${SHADOW};display:flex;align-items:center;gap:20px;padding:0 24px`)}">
    <div class="serif" style="flex:none;width:84px;height:84px;border-radius:50%;background:${C.plumDeep};color:#fff;font-size:56px;font-weight:600;display:grid;place-items:center;box-shadow:0 3px 5px rgba(40,20,5,.35);line-height:1">${n}</div>
    <div class="serif" style="font-size:38px;line-height:1.1;font-weight:500;color:#2a1d10;letter-spacing:-.01em">${esc(text)}</div>
    <div style="position:absolute;left:22px;right:22px;bottom:10px;height:2px;background:#fff;opacity:.0"></div>
  </div>`;
}

function pin3() {
  const i = idea(3);
  const pos = [
    { x: 262, y: 424, rot: -2 },
    { x: 520, y: 608, rot: 2 },
    { x: 56, y: 790, rot: -2 },
    { x: 440, y: 968, rot: 2 },
    { x: 56, y: 1150, rot: -1.5 },
  ];
  // the trail runs through the middle of every card, school bag to laptop
  const pts = [[130, 520], ...pos.map((q) => [q.x + 225, q.y + 71]), [760, 1215]];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let k = 1; k < pts.length; k++) {
    const [ax, ay] = pts[k - 1], [bx, by] = pts[k];
    d += ` C ${ax} ${(ay + by) / 2}, ${bx} ${(ay + by) / 2}, ${bx} ${by}`;
  }
  const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, base: "#dccdb0", dark: "#c8b58f", planks: 5, seed: 11 })}
  <svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><path d="${d}" fill="none" stroke="#fffaf0" stroke-width="9" stroke-linecap="round" stroke-dasharray="2 24" opacity=".9"/></svg>
  ${bag({ x: 32, y: 408, w: 190 })}
  ${pos.map((q, k) => stepCard({ ...q, n: k + 1, text: i.items[k] })).join("")}
  ${tape({ x: 400, y: 410, rot: -3 })}${tape({ x: 700, y: 596, rot: 4, color: "#c9d9bd" })}${tape({ x: 200, y: 778, rot: -2, color: "#f1d99a" })}${tape({ x: 650, y: 956, rot: 3 })}${tape({ x: 200, y: 1138, rot: -2, color: "#c9d9bd" })}
  ${mug({ x: 700, y: 778, size: 150 })}
  ${pencil({ x: 690, y: 430, len: 280, rot: 18 })}
  ${laptop({ x: 556, y: 1138, w: 410 })}`;
  return printable({ n: 3, scene, paper: "#f0e8d8" });
}

/* ---------------------------------------------------------------- #1 */

function wallCalendar({ x, y, w = 410, h = 440, rot = -2 }) {
  const cols = 7, rows = 5, gx = 22, top = 118, cw = (w - gx * 2) / cols, ch = (h - top - 26) / rows;
  const crossed = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [2, 0], [2, 1], [2, 2]]; // marked off, like days counted
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = gx + c * cw, cy = top + r * ch;
    cells.push(`<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="${c > 4 ? "#f1ebe0" : "#fffdf8"}" stroke="#bdb2a0" stroke-width="1.5"/>`);
    if (crossed.some(([rr, cc]) => rr === r && cc === c)) cells.push(`<path d="M${cx + 10} ${cy + 10} L${cx + cw - 10} ${cy + ch - 10} M${cx + cw - 10} ${cy + 10} L${cx + 10} ${cy + ch - 10}" stroke="${C.plum}" stroke-width="4" stroke-linecap="round" opacity=".85"/>`);
  }
  const wd = ["M", "T", "W", "T", "F", "S", "S"].map((l, c) => `<text x="${gx + c * cw + cw / 2}" y="${top - 10}" text-anchor="middle" font-family="Plex" font-weight="600" font-size="22" fill="#5a5148">${l}</text>`).join("");
  const rings = Array.from({ length: 6 }, (_, k) => `<rect x="${44 + k * ((w - 88) / 5) - 6}" y="-8" width="12" height="44" rx="6" fill="#c9ced4" stroke="#8d939b" stroke-width="2"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(40,20,5,.35))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="6" fill="#fffdf8"/>
    <rect width="${w}" height="76" rx="6" fill="#b8573e"/><rect y="60" width="${w}" height="16" fill="#b8573e"/>
    <rect x="26" y="26" width="${w - 52}" height="14" rx="7" fill="#fff" opacity=".28"/>
    <rect x="26" y="50" width="${w * 0.45}" height="10" rx="5" fill="#fff" opacity=".18"/>
    ${wd}${cells.join("")}${rings}</svg>`;
}

function wallClock({ cx, cy, r = 190 }) {
  const ticks = Array.from({ length: 12 }, (_, k) => {
    const a = (k * 30 * Math.PI) / 180, big = k % 3 === 0;
    const r1 = r - 30, r2 = r - (big ? 62 : 48);
    return `<line x1="${cx + Math.sin(a) * r1}" y1="${cy - Math.cos(a) * r1}" x2="${cx + Math.sin(a) * r2}" y2="${cy - Math.cos(a) * r2}" stroke="#2b2118" stroke-width="${big ? 11 : 6}" stroke-linecap="round"/>`;
  }).join("");
  const hand = (deg, len, wd, col) => `<line x1="${cx}" y1="${cy}" x2="${cx + Math.sin((deg * Math.PI) / 180) * len}" y2="${cy - Math.cos((deg * Math.PI) / 180) * len}" stroke="${col}" stroke-width="${wd}" stroke-linecap="round"/>`;
  return `<svg style="${abs(cx - r - 10, cy - r - 10, 2 * r + 20, 2 * r + 20, "filter:drop-shadow(0 18px 14px rgba(40,20,5,.38))")}" viewBox="${cx - r - 10} ${cy - r - 10} ${2 * r + 20} ${2 * r + 20}" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#a9743c"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#7b4f22" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 20}" fill="#fffdf8"/><circle cx="${cx}" cy="${cy}" r="${r - 20}" fill="none" stroke="#d8cdb9" stroke-width="3"/>
    ${ticks}${hand(300, r - 88, 13, "#2b2118")}${hand(60, r - 52, 9, "#2b2118")}${hand(190, r - 62, 4, "#b8573e")}
    <circle cx="${cx}" cy="${cy}" r="13" fill="#2b2118"/><circle cx="${cx}" cy="${cy}" r="5" fill="#b8573e"/></svg>`;
}

function sticky({ x, y, w, h, rot, color, text, tapeColor }) {
  return `<div data-check="note" style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},${color}ee);box-shadow:0 3px 4px rgba(40,20,5,.22),0 22px 26px -6px rgba(40,20,5,.35);padding:34px 30px 24px;display:flex;align-items:center`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:24px;background:#000;opacity:.04"></div>
    <div class="hand" style="font-size:50px;line-height:1.08;font-weight:700;color:#2b2118">${esc(text)}</div></div>`;
}

function pin1() {
  const i = idea(1);
  const [eyebrow, big] = i.headline.split(": ");
  const css = `
  .wall{position:absolute;inset:0;background:
    repeating-linear-gradient(90deg,rgba(150,120,70,.07) 0 3px,transparent 3px 62px),
    linear-gradient(#efe4cc,#e6d8bb)}
  .qcard{position:absolute;left:46px;top:56px;width:908px;height:440px;transform:rotate(-1deg);background:#fffdf8;border-radius:10px;box-shadow:${SHADOW};padding:46px 56px 0}
  .qcard h1{font:500 90px/1.02 "Newsreader",Georgia,serif;letter-spacing:-.025em;margin-top:18px;color:#1d1d20}
  .qcard p{font-size:30px;line-height:1.3;color:#4b4339;margin-top:26px;max-width:780px}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#f0e8d8;box-shadow:0 -8px 22px rgba(40,20,5,.28);z-index:5}
  .foot{z-index:7}`;
  const body = `<div class="wall"></div>
  <div class="qcard"><div class="eyebrow" style="font-size:26px">${esc(eyebrow)}</div><h1 data-check="headline">${esc(big).replace("Does Your State ", "Does Your State<br>")}</h1><p>${esc(i.sub)}</p>
    <div style="position:absolute;right:46px;top:-26px;width:150px"><div style="${abs(0, 0, 150, 40, "background:#e7c6cf;opacity:.9;transform:rotate(5deg);box-shadow:0 2px 4px rgba(40,20,5,.2)")}"></div></div></div>
  ${tack({ x: 160, y: 40 })}
  ${wallCalendar({ x: 54, y: 596, w: 410, h: 420, rot: -2.5 })}
  ${wallClock({ cx: 750, cy: 806, r: 190 })}
  ${sticky({ x: 56, y: 1052, w: 440, h: 270, rot: -3, color: "#f6dc72", text: i.items[0] })}
  ${sticky({ x: 520, y: 1086, w: 420, h: 236, rot: 2.5, color: "#cfe0b3", text: i.items[1] })}
  ${tack({ x: 250, y: 1050, color: "#4f6c8c" })}
  <div class="footbar"></div>${footFor(i)}`;
  return { n: 1, id: `1-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: "#efe4cc" }) };
}

/* ---------------------------------------------------------------- #2 */

/** A right hand, seen from above, holding a pencil: tip at the left, arm to the right. Local box 640 x 330. */
function hand({ x, y, rot = 28, scale = 1 }) {
  const skin = "#e7b896", skinDark = "#cf9a76", nail = "#f6dcc8";
  return `<svg style="${abs(x, y, 640 * scale, 330 * scale, `transform:rotate(${rot}deg);transform-origin:5% 52%;filter:drop-shadow(0 18px 12px rgba(15,25,40,.45))`)}" viewBox="0 0 640 330" aria-hidden="true">
    <!-- sleeve -->
    <path d="M470 40 L640 20 L640 300 L470 296 C 440 240 440 100 470 40 Z" fill="#8aa182"/>
    <path d="M470 40 C 440 100 440 240 470 296 L494 298 C 466 240 466 100 494 38 Z" fill="#6f8868"/>
    <path d="M500 60 L640 46 M500 270 L640 280" stroke="#fff" stroke-opacity=".12" stroke-width="5"/>
    <!-- pencil -->
    <path d="M28 166 L128 150 L128 190 Z" fill="#e9c9a0"/><path d="M28 166 L52 162 L52 170 Z" fill="#33363b"/>
    <rect x="128" y="150" width="260" height="40" rx="3" fill="#e7b23f"/><rect x="128" y="150" width="260" height="10" fill="#f3cf6a" opacity=".75"/><rect x="128" y="180" width="260" height="10" fill="#b98a22" opacity=".55"/>
    <rect x="380" y="150" width="22" height="40" fill="#b9b9c0"/><rect x="400" y="150" width="30" height="40" rx="10" fill="#e58b8b"/>
    <!-- curled fingers under the pencil -->
    <path d="M300 232 C 270 252 296 290 346 284 C 392 278 404 250 392 224 Z" fill="${skinDark}"/>
    <path d="M330 214 C 300 238 322 270 368 262 C 408 254 410 232 404 206 Z" fill="${skin}"/>
    <!-- back of the hand -->
    <path d="M250 120 C 310 70 420 60 480 96 C 500 150 496 220 464 262 C 410 290 330 270 286 232 C 250 200 232 150 250 120 Z" fill="${skin}"/>
    <path d="M300 96 C 360 74 430 76 470 100" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="10" stroke-linecap="round"/>
    <path d="M360 140 L430 126 M362 172 L440 168 M360 204 L428 214" stroke="${skinDark}" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>
    <!-- index finger over the pencil -->
    <path d="M300 112 L196 142" stroke="${skinDark}" stroke-width="40" stroke-linecap="round"/>
    <path d="M300 106 L192 137" stroke="${skin}" stroke-width="38" stroke-linecap="round"/>
    <ellipse cx="190" cy="141" rx="17" ry="12" transform="rotate(-16 190 141)" fill="${nail}"/>
    <!-- thumb -->
    <path d="M318 214 C 270 226 226 206 188 186" stroke="${skinDark}" stroke-width="42" stroke-linecap="round" fill="none"/>
    <path d="M316 208 C 270 218 228 200 190 182" stroke="${skin}" stroke-width="40" stroke-linecap="round" fill="none"/>
    <ellipse cx="190" cy="183" rx="15" ry="10" transform="rotate(30 190 183)" fill="${nail}"/>
  </svg>`;
}

function pin2() {
  const i = idea(2);
  const [cDate, cSubj, cWent, exSubj, exWent] = i.items;
  const exDate = "Oct 14"; // the guide's own example for the Date column (guides.ts)
  const rowH = 92;
  const css = `
  .felt{position:absolute;left:0;right:0;top:${SCENE_TOP}px;bottom:0;background:#4d6277}
  .tpl{position:absolute;left:56px;top:416px;width:888px;height:930px;transform:rotate(-1.6deg);background:#fffdf6;border-radius:6px;box-shadow:${SHADOW},0 40px 60px -20px rgba(10,20,30,.5);overflow:hidden}
  .tpl:before{content:"";position:absolute;left:40px;top:0;bottom:0;width:3px;background:#d9847b;opacity:.55}
  .tpl .grid{position:absolute;left:70px;right:24px;top:30px}
  .tpl .row{display:grid;grid-template-columns:150px 1fr 200px;height:${rowH}px;align-items:end;border-bottom:2.5px solid #bcd0e0}
  .tpl .row>div{padding:0 14px 10px;border-left:2.5px solid #e7b7b2;height:100%;display:flex;align-items:flex-end}
  .tpl .row>div:first-child{border-left:0;padding-left:6px}
  .tpl .head{border-bottom:5px solid ${C.plumDeep};height:${rowH - 8}px}
  .tpl .head>div{font:700 26px/1.1 "Plex",sans-serif;color:${C.plumDeep};border-left-color:${C.plumDeep}}
  .tpl .fill{height:128px}.tpl .fill>div{font:700 44px/1 "Hand",cursive;color:#2c3e6b}
  .tag{position:absolute;right:12px;top:8px}
  .tag .example{font-size:22px;background:#fffdf6;padding:3px 10px}
  `;
  const grid = `<div class="grid">
    <div class="row head"><div>${esc(cDate)}</div><div>${esc(cSubj)}</div><div>${esc(cWent)}</div></div>
    <div class="row fill" style="position:relative"><div>${esc(exDate)}</div><div>${esc(exSubj)}</div><div>${esc(exWent)}</div><span class="tag"><span class="example">Example</span></span></div>
    ${Array.from({ length: 6 }, () => `<div class="row"><div></div><div></div><div></div></div>`).join("")}</div>`;
  const scene = `<div class="felt"></div>
  <div class="tpl">${grid}</div>
  ${hand({ x: 360, y: 640, rot: 22, scale: 0.95 })}`;
  const out = printable({ n: 2, scene, extraCss: css, paper: "#f0e8d8" });
  return out;
}

/* ---------------------------------------------------------------- #39 */

function pin39() {
  const i = idea(39);
  const tabs = [
    { bg: "#5b3f6b", fg: "#fff" },
    { bg: "#8aa182", fg: "#17221a" },
    { bg: "#e0a95a", fg: "#2a1a05" },
    { bg: "#46688a", fg: "#fff" },
    { bg: "#b8492f", fg: "#fff" },
  ];
  const strip = (t, k) => `<div data-check="tab" style="${abs(512, 438 + k * 176, 456, 160, `background:${t.bg};color:${t.fg};border-radius:14px 22px 22px 14px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 14px 18px -4px rgba(40,20,5,.4);display:flex;align-items:center;padding:0 26px 0 30px`)}">
      <div style="position:absolute;left:0;top:0;bottom:0;width:10px;border-radius:14px 0 0 14px;background:#000;opacity:.14"></div>
      <div style="position:absolute;right:0;top:0;bottom:0;width:18px;border-radius:0 22px 22px 0;background:#fff;opacity:.16"></div>
      <div style="font:600 26px/1.22 'Plex',sans-serif;padding-right:12px">${esc(i.items[k])}</div></div>`;
  const rings = [530, 860, 1190].map((y) => `<div style="${abs(470, y, 60, 30, "")}"><div style="${abs(0, 0, 60, 30, "border-radius:50%;background:linear-gradient(#e9ecef,#9aa0a8);box-shadow:0 5px 8px rgba(0,0,0,.4)")}"></div><div style="${abs(12, 8, 36, 14, "border-radius:50%;background:#3a3f46")}"></div></div>`).join("");
  const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, planks: 6, seed: 5 })}
  <div style="${abs(0, 0, 1000, 1500, "transform:rotate(-1.2deg);transform-origin:50% 55%")}">
    <div style="${abs(26, 394, 948, 944, "background:linear-gradient(135deg,#5d7a5a,#486548);border-radius:22px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 34px 56px rgba(40,20,5,.5)")}"></div>
    <div style="${abs(484, 394, 32, 944, "background:linear-gradient(90deg,#34492f,#566f52,#34492f)")}"></div>
    <!-- left: the inside cover with a clear pocket -->
    <div style="${abs(58, 430, 410, 872, "background:#6b8a67;border-radius:8px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.12)")}"></div>
    <div style="${abs(78, 470, 372, 780, "background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.4);border-radius:10px")}"></div>
    ${drawing({ x: 98, y: 520, w: 330, rot: -4 })}
    <div style="${abs(100, 850, 330, 300, "background:#fffdf6;transform:rotate(3deg);box-shadow:0 8px 14px rgba(40,20,5,.3)")}">${Array.from({ length: 9 }, (_, k) => `<div style="position:absolute;left:24px;right:24px;top:${40 + k * 30}px;height:2px;background:#bcd0e0"></div>`).join("")}</div>
    ${tape({ x: 190, y: 842, w: 120, rot: 3, color: "#f1d99a" })}
    <!-- right: dividers stacked, tabs out front -->
    <div style="${abs(520, 430, 436, 872, "background:#fffdf6;border-radius:6px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.06)")}"></div>
    ${tabs.map(strip).join("")}
    ${rings}
  </div>
  ${pencil({ x: 540, y: 1316, len: 340, rot: -2 })}`;
  return printable({ n: 39, scene, paper: "#f0e8d8" });
}

export const pins = [pin3(), pin1(), pin2(), pin39()];
