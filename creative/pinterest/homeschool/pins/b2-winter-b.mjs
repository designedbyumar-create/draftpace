/**
 * Batch 2, winter B: three guide pins for the homeschool January/mid-year weeks.
 *   95  the January review: a clipboard of four questions, cold window light
 *   96  switching mid-year: a two-week wall calendar with sticky notes
 *   97  withdrawal letter vs records request: two letters on a gingham cloth
 * Every word is the idea bank's. Papers are drawn here (not real pages), so
 * the ruled lines and scribbles on them are marks, never words.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, pencil, mug, clipboard } from "../kit/paper.mjs";
import { idea } from "../kit/bank.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/* ===================================================================== */
/* 95: the clipboard of four questions, a snow-lit window, a cold desk     */
/* ===================================================================== */

/** A winter window seen across the top of the scene: snowy trees, falling flakes, white frame, sill. */
function snowWindow() {
  const r = rng(21);
  const flakes = Array.from({ length: 70 }, () => `<circle cx="${(r() * 780).toFixed(0)}" cy="${(r() * 250).toFixed(0)}" r="${(1.4 + r() * 3.2).toFixed(1)}" fill="#fff" opacity="${(0.55 + r() * 0.4).toFixed(2)}"/>`).join("");
  const tree = (x, h, c) => `<g transform="translate(${x} 250)"><rect x="-3" y="-${h * 0.2}" width="6" height="${h * 0.2}" fill="#6a7580"/>${[0, 1, 2, 3].map((k) => `<path d="M0 -${h * (0.2 + k * 0.2)} l-${44 - k * 8} ${h * 0.24} h${88 - k * 16} Z" fill="${c}"/><path d="M0 -${h * (0.2 + k * 0.2)} l-${30 - k * 6} ${h * 0.16} h${60 - k * 12} Z" fill="#fff" opacity=".85" transform="translate(0 -3)"/>`).join("")}</g>`;
  return `<svg style="${abs(0, SCENE_TOP, 1000, 280)}" viewBox="0 0 1000 280" aria-hidden="true"><defs>
      <linearGradient id="wall95" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3e9ee"/><stop offset="1" stop-color="#cfd8df"/></linearGradient>
      <linearGradient id="sky95" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9cfe0"/><stop offset="1" stop-color="#eef4f9"/></linearGradient>
      <linearGradient id="sill95" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset="1" stop-color="#cdd4da"/></linearGradient></defs>
    <rect width="1000" height="280" fill="url(#wall95)"/>
    <g transform="translate(110 0)"><rect width="780" height="250" fill="url(#sky95)"/>
      <path d="M0 232 C 120 200 240 238 380 214 C 520 190 640 232 780 206 V250 H0Z" fill="#fff"/>
      ${tree(120, 150, "#7f9aa0")}${tree(250, 110, "#8ba4a9")}${tree(560, 170, "#7a959c")}${tree(690, 120, "#8ba4a9")}
      <path d="M0 246 C 160 226 320 250 470 236 C 600 224 700 244 780 234 V250 H0Z" fill="#f6f9fb"/>
      ${flakes}
      <rect x="-8" y="-8" width="12" height="266" fill="#f4f7f9"/><rect x="776" y="-8" width="12" height="266" fill="#f4f7f9"/>
      <rect x="254" y="-8" width="14" height="262" fill="#f4f7f9"/><rect x="512" y="-8" width="14" height="262" fill="#f4f7f9"/>
      <rect x="-8" y="118" width="796" height="12" fill="#f4f7f9"/>
      <rect x="-8" y="-8" width="796" height="8" fill="#000" opacity=".06"/></g>
    <rect x="86" y="248" width="828" height="32" rx="3" fill="url(#sill95)"/><rect x="86" y="276" width="828" height="4" fill="#000" opacity=".18"/></svg>`;
}

/** Cold light from the window falling across the desk in panes. */
function windowLight() {
  return `<svg style="${abs(0, SCENE_TOP + 270, 1000, H - 270, "mix-blend-mode:soft-light;pointer-events:none")}" viewBox="0 0 1000 ${H - 270}" aria-hidden="true"><defs><linearGradient id="wl95" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#dfeeff" stop-opacity=".1"/></linearGradient></defs>
    <polygon points="130,0 380,0 470,${H - 270} 120,${H - 270}" fill="url(#wl95)"/><polygon points="400,0 650,0 880,${H - 270} 540,${H - 270}" fill="url(#wl95)" opacity=".8"/><polygon points="680,0 880,0 990,${H - 270} 920,${H - 270}" fill="url(#wl95)" opacity=".6"/></svg>`;
}

/** A child's pencil drawing of two fractions that look different but are equal: a halved circle and a circle in sixths with three shaded. No numerals. */
function equalFractionsDrawing({ x, y, w = 250, rot = 6 }) {
  const h = Math.round(w * 0.9);
  const pie = (cx, cy, n, fill, col) => {
    let out = `<circle cx="${cx}" cy="${cy}" r="42" fill="#fff" stroke="#3a4350" stroke-width="3.5"/>`;
    for (let k = 0; k < fill; k++) {
      const a0 = (-Math.PI / 2) + (2 * Math.PI * k) / n, a1 = (-Math.PI / 2) + (2 * Math.PI * (k + 1)) / n;
      out += `<path d="M${cx} ${cy} L${cx + 42 * Math.cos(a0)} ${cy + 42 * Math.sin(a0)} A42 42 0 0 1 ${cx + 42 * Math.cos(a1)} ${cy + 42 * Math.sin(a1)} Z" fill="${col}" opacity=".85"/>`;
    }
    for (let k = 0; k < n; k++) {
      const a = (-Math.PI / 2) + (2 * Math.PI * k) / n;
      out += `<line x1="${cx}" y1="${cy}" x2="${cx + 42 * Math.cos(a)}" y2="${cy + 42 * Math.sin(a)}" stroke="#3a4350" stroke-width="3" stroke-linecap="round"/>`;
    }
    return out + `<circle cx="${cx}" cy="${cy}" r="42" fill="none" stroke="#3a4350" stroke-width="3.5"/>`;
  };
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(30,40,60,.38))`)}" viewBox="0 0 250 225" aria-hidden="true"><rect width="250" height="225" fill="#fffdf6"/>
    ${pie(72, 96, 2, 1, "#e0a95a")}${pie(180, 96, 6, 3, "#e0a95a")}
    <text x="125" y="104" text-anchor="middle" font-family="Hand" font-weight="700" font-size="46" fill="#3a4350">=</text>
    <path d="M30 176 q 40 -10 90 0 t 100 -2" fill="none" stroke="#7a4b8a" stroke-width="4" stroke-linecap="round"/>
    <path d="M44 198 q 50 -8 100 0 t 60 -2" fill="none" stroke="#3b7fb2" stroke-width="4" stroke-linecap="round" opacity=".8"/></svg>`;
}

function clipboard95() {
  const i = idea(95);
  const BW = 740, BH = 745, PX = 32, PY = 66, PW = BW - 64, PH = BH - 98;
  const items = i.items.map((q) => `<div class="q"><div class="box"></div><div class="qt"><div class="qw">${esc(q)}</div><div class="ans"></div></div></div>`).join("");
  const paper = `<div style="${abs(PX, PY, PW, PH, "background:#fdfcf9;box-shadow:0 2px 3px rgba(30,40,60,.25),0 10px 18px rgba(30,40,60,.25)")}">
    <div class="p95head"><span class="lab">One example, in fractions</span><span class="example">Example</span></div>
    <div class="p95list" data-check="questions" style="${abs(34, 82, PW - 68, PH - 100)}">${items}</div></div>`;
  return clipboard({ x: 36, y: 616, w: BW, h: BH, tilt: -1.4, content: paper });
}

const css95 = `
  .p95head{position:absolute;left:34px;right:34px;top:22px;height:44px;display:flex;align-items:center;gap:16px;border-bottom:2.5px solid #7a4b8a}
  .p95head .lab{font:600 22px "Plex",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#4a2f58}
  .p95head .example{margin-left:auto;color:#5b5348;font-size:17px}
  .p95list{display:flex;flex-direction:column;justify-content:space-between}
  .q{display:flex;gap:18px;align-items:flex-start}
  .box{flex:none;width:36px;height:36px;margin-top:3px;border:3.5px solid #2f3a47;border-radius:6px;background:#fff}
  .qt{flex:1}
  .qw{font:500 27px/1.2 "Newsreader",Georgia,serif;color:#1f1d1a}
  .ans{height:2px;margin-top:20px;background:repeating-linear-gradient(90deg,#8fa7c4 0 10px,transparent 10px 15px)}
`;

const scene95 = `${desk({ top: SCENE_TOP + 270, height: H - 270, base: "#cfd3d5", dark: "#b8c0c6", planks: 4, seed: 9 })}
  <div style="${abs(0, SCENE_TOP + 270, 1000, H - 270, "background:linear-gradient(180deg,rgba(120,160,205,.18),rgba(70,100,140,.16))")}"></div>
  ${snowWindow()}
  ${clipboard95()}
  ${equalFractionsDrawing({ x: 776, y: 720, w: 206, rot: 6 })}
  ${mug({ x: 790, y: 1110, size: 140, color: "#e9eef2", drink: "#5b3a22" })}
  ${pencil({ x: 300, y: 1290, len: 380, rot: -4 })}
  ${windowLight()}`;

/* ===================================================================== */
/* 96: a two-week wall calendar with sticky notes                          */
/* ===================================================================== */

function sageWall() {
  const r = rng(5);
  const boards = Array.from({ length: 18 }, (_, k) => `<rect x="${k * 56}" y="0" width="3" height="${H}" fill="#4f6a4b" opacity=".16"/><rect x="${k * 56 + 3}" y="0" width="2" height="${H}" fill="#fff" opacity=".1"/>`).join("");
  const specks = Array.from({ length: 160 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(0.7 + r() * 1.3).toFixed(1)}" fill="#fff" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  return `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><radialGradient id="sw96" cx="30%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#1f3320" stop-opacity=".3"/></radialGradient></defs>
    <rect width="1000" height="${H}" fill="#9db497"/>${boards}${specks}<rect width="1000" height="${H}" fill="url(#sw96)"/></svg>`;
}

const NOTE_COLORS = [
  ["#f7e27a", "#efd14f"],
  ["#f6b9a8", "#ee9c88"],
  ["#bfe0b6", "#9fcf93"],
  ["#bcd7ee", "#9bc0e2"],
];

function calendar96() {
  const i = idea(96);
  const X0 = 35, W = 930, Y0 = 408, BAND = 72, DAYS = 56, ROW = 322, CW = W / 5;
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const rowsTop = Y0 + BAND + DAYS;
  const total = BAND + DAYS + ROW * 2;
  const cells = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) cells.push(`<div style="${abs(c * CW, BAND + DAYS + r * ROW, CW, ROW, "border-right:2px solid #cdbf9f;border-top:2px solid #cdbf9f;" + (c === 4 ? "border-right:none;" : ""))}"></div>`);
  const heads = dayNames.map((d, c) => `<div style="${abs(c * CW, BAND, CW, DAYS, "display:flex;align-items:center;justify-content:center;font:600 22px 'Plex',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6a3b2a")}">${d}</div>`).join("");
  const rings = Array.from({ length: 24 }, (_, k) => `<div style="${abs(24 + k * 38, -18, 13, 40, "border-radius:7px;border:4.5px solid #3a3a3e;border-bottom-width:5px;background:#1c1c1f;box-shadow:0 3px 4px rgba(0,0,0,.35)")}"></div>`).join("");
  // First clause cut at the colon: the day is the column header, the note carries the rest in the guide's words.
  const notes = i.items.slice(0, 4).map((t, k) => {
    const body = t.slice(t.indexOf(": ") + 2);
    const [c1, c2] = NOTE_COLORS[k];
    const tilt = [-2.2, 1.8, -1.4, 2.4][k];
    return `<div class="stk" data-check="note" style="${abs((k + 1) * CW + 9, BAND + DAYS + 16, CW - 18, ROW - 54, `transform:rotate(${tilt}deg);background:linear-gradient(170deg,${c1},${c2})`)}">${esc(body)}</div>`;
  }).join("");
  const mon = i.items[4];
  const monNote = `<div class="stk big" data-check="note" style="${abs(9, BAND + DAYS + ROW + 16, CW * 2 - 18, ROW - 110, "transform:rotate(-1.2deg);background:linear-gradient(170deg,#f6b9a8,#ee9c88)")}">${esc(mon)}</div>`;
  const tapeA = `<div style="${abs(-26, 40, 120, 40, "transform:rotate(-40deg);background:repeating-linear-gradient(115deg,#e0b866 0 12px,#f2dca6 12px 24px);opacity:.9;box-shadow:0 3px 5px rgba(40,50,20,.3)")}"></div>`;
  return `<div style="${abs(X0, Y0, W, total, "background:#fbf6ea;border-radius:6px;box-shadow:0 2px 3px rgba(30,45,25,.3),0 22px 40px rgba(30,45,25,.38)")}">
    <div style="${abs(0, 0, W, BAND, "background:linear-gradient(#c4623f,#a94f33);border-radius:6px 6px 0 0")}"><span class="example" style="position:absolute;right:22px;top:20px;color:#fbf6ea;font-size:17px">Example</span></div>
    ${rings}${heads}${cells.join("")}${notes}${monNote}${tapeA}</div>`;
}

function plant({ x, y, s = 1 }) {
  const leaf = (rot, len, col, dx = 0) => `<g transform="translate(${100 + dx} 190) rotate(${rot})"><path d="M0 0 C -26 -${len * 0.35}, -22 -${len * 0.8}, 0 -${len} C 22 -${len * 0.8}, 26 -${len * 0.35}, 0 0 Z" fill="${col}"/><path d="M0 -4 L0 -${len * 0.9}" stroke="#fff" stroke-opacity=".28" stroke-width="3"/></g>`;
  return `<svg style="${abs(x, y, 200 * s, 300 * s, "filter:drop-shadow(0 12px 8px rgba(30,45,25,.35))")}" viewBox="0 0 200 300" aria-hidden="true">
    ${leaf(-52, 130, "#4f7b4d", -10)}${leaf(48, 125, "#5f8d58", 10)}${leaf(-24, 170, "#3f6c43")}${leaf(26, 160, "#6a9660")}${leaf(0, 185, "#507f4c")}
    <path d="M44 186 H156 L142 292 Q100 302 58 292 Z" fill="#c4724b"/><rect x="38" y="176" width="124" height="26" rx="6" fill="#d4825a"/><rect x="38" y="176" width="124" height="8" rx="4" fill="#fff" opacity=".2"/><ellipse cx="100" cy="180" rx="56" ry="6" fill="#4a3322"/></svg>`;
}

const css96 = `
  .stk{display:flex;align-items:center;padding:14px 14px 18px;font:600 30px/1.08 "Hand",cursive;color:#2a2418;box-shadow:0 2px 2px rgba(40,40,10,.18),0 12px 16px rgba(40,40,10,.28);overflow:hidden}
  .stk::after{content:"";position:absolute;right:0;bottom:0;width:30px;height:30px;background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.1) 50%)}
  .stk.big{font-size:34px;padding:18px 24px}
`;

const scene96 = `${sageWall()}
  ${calendar96()}
  <div style="${abs(0, 1296, 1000, 36, "background:linear-gradient(#b98d57,#9d7343);box-shadow:0 8px 14px rgba(30,45,25,.35)")}"></div>
  <div style="${abs(0, 1296, 1000, 5, "background:#e1bd8a;opacity:.8")}"></div>
  ${plant({ x: 770, y: 1085, s: 0.74 })}
  ${pencil({ x: 120, y: 1262, len: 330, rot: 1.5 })}`;

/* ===================================================================== */
/* 97: two letters, a stamp and a pen, on a gingham cloth                  */
/* ===================================================================== */

function gingham() {
  return `<div style="${abs(0, SCENE_TOP, 1000, H, "overflow:hidden;background:#f5ebda")}"><div style="position:absolute;left:-200px;top:-200px;width:1400px;height:1600px;transform:rotate(-5deg);background:
    repeating-linear-gradient(0deg,rgba(184,86,58,.42) 0 56px,transparent 56px 112px),
    repeating-linear-gradient(90deg,rgba(184,86,58,.42) 0 56px,transparent 56px 112px),#f7eddc"></div>
    <div style="${abs(0, 0, 1000, H, "background:radial-gradient(120% 90% at 30% 8%,rgba(255,255,255,.28),rgba(60,25,10,.3))")}"></div></div>`;
}

/** A line of scribble standing for body text: marks, never words. */
const lines = (n, w, color = "#b9b2a4") => Array.from({ length: n }, (_, k) => `<div style="height:5px;border-radius:3px;background:${color};width:${k === n - 1 ? Math.round(w * 0.6) : w}px;margin-top:18px;opacity:.75"></div>`).join("");

const SIGN = `<svg width="170" height="60" viewBox="0 0 170 60" aria-hidden="true"><path d="M6 40 C 20 6, 34 6, 30 36 C 28 52, 46 8, 56 30 C 62 46, 76 14, 88 34 C 94 44, 110 24, 126 36 C 138 44, 152 30, 164 36" fill="none" stroke="#25324a" stroke-width="3.2" stroke-linecap="round"/></svg>`;

function letterLeft() {
  const i = idea(97);
  const [lead, rest] = [i.items[0].split(": ")[0], i.items[0].split(": ").slice(1).join(": ")];
  const [says, goes] = [rest.split(". ")[0] + ".", rest.split(". ").slice(1).join(". ")];
  return `<div style="${abs(38, 428, 440, 790, "transform:rotate(-2.2deg);background:#fffdf6;box-shadow:0 2px 3px rgba(40,20,5,.25),0 22px 38px rgba(40,20,5,.4)")}">
    <div style="${abs(0, 0, 440, 22, "background:#7a4b8a")}"></div>
    <div style="${abs(40, 52, 120, 66, "")}"><div style="width:54px;height:54px;border-radius:50%;border:5px solid #7a4b8a;display:grid;place-items:center"><div style="width:20px;height:20px;border-radius:50%;background:#7a4b8a"></div></div></div>
    <div style="${abs(250, 62, 150, 60, "")}">${lines(3, 150, "#c9c0b0").replace(/margin-top:18px/g, "margin-top:12px")}</div>
    <div style="${abs(0, 150, 440, 60, "border-top:2px solid #e3dccd")}"></div>
    <div class="pl" style="${abs(40, 168, 360, 330, "")}" data-check="letter-left"><div class="ph">${esc(lead)}</div><div class="pb">${esc(says)}</div></div>
    <div style="${abs(40, 390, 360, 150, "")}">${lines(4, 360)}</div>
    <div style="${abs(48, 560, 200, 70, "")}">${SIGN}</div>
    <div class="tag" data-check="tag-left" style="${abs(32, 650, 380, 108, "transform:rotate(1.4deg)")}">${esc(goes)}</div></div>`;
}

function envelopeRight() {
  const i = idea(97);
  const [lead, rest] = [i.items[1].split(": ")[0], i.items[1].split(": ").slice(1).join(": ")];
  const [says, goes] = [rest.split(". ")[0] + ".", rest.split(". ").slice(1).join(". ")];
  const sheet = `<div style="${abs(548, 468, 420, 560, "transform:rotate(2deg);background:#fffdf6;box-shadow:0 2px 3px rgba(40,20,5,.25),0 16px 30px rgba(40,20,5,.35)")}">
    <div style="${abs(0, 0, 420, 22, "background:#5f8a8f")}"></div>
    <div class="pl" style="${abs(34, 52, 352, 360, "")}" data-check="letter-right"><div class="ph">${esc(lead)}</div><div class="pb">${esc(says)}</div></div>
    <div style="${abs(34, 300, 352, 100, "")}">${lines(3, 352)}</div></div>`;
  const env = `<div style="${abs(532, 858, 440, 360, "transform:rotate(-1.2deg)")}">
    <div style="${abs(0, 0, 440, 360, "background:linear-gradient(160deg,#f1e2c6,#e3cfa8);border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 24px 40px rgba(40,20,5,.42)")}"></div>
    <svg style="${abs(0, 0, 440, 360)}" viewBox="0 0 440 360" aria-hidden="true"><path d="M0 360 L 200 186 L 0 14" fill="none" stroke="#b79a69" stroke-width="2" opacity=".55"/><path d="M440 360 L 240 186 L 440 14" fill="none" stroke="#b79a69" stroke-width="2" opacity=".55"/><path d="M0 4 L 220 196 L 440 4" fill="#ead8b6" stroke="#b79a69" stroke-width="2" opacity=".0"/></svg>
    <div class="tag white" data-check="tag-right" style="${abs(34, 52, 372, 118, "transform:rotate(-1deg)")}">${esc(goes)}</div>
    <div style="${abs(34, 214, 250, 120, "")}">${lines(3, 250, "#a28c64")}</div></div>`;
  return sheet + env;
}

/** A postage stamp: perforated edge, a small house. No denomination, no words. */
function stamp({ x, y, rot = 8 }) {
  const w = 120, h = 144;
  const holes = [];
  for (let k = 0; k < 8; k++) holes.push(`<circle cx="${8 + k * 14.7}" cy="2" r="4.4"/><circle cx="${8 + k * 14.7}" cy="${h - 2}" r="4.4"/>`);
  for (let k = 0; k < 10; k++) holes.push(`<circle cx="2" cy="${8 + k * 14.4}" r="4.4"/><circle cx="${w - 2}" cy="${8 + k * 14.4}" r="4.4"/>`);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(40,20,5,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><mask id="stm"><rect width="${w}" height="${h}" fill="#fff"/><g fill="#000">${holes.join("")}</g></mask></defs>
    <g mask="url(#stm)"><rect width="${w}" height="${h}" fill="#fff9ec"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="#cfe0d2"/><circle cx="84" cy="40" r="12" fill="#f2c14e"/><rect x="30" y="72" width="54" height="40" fill="#c4573e"/><path d="M24 76 L57 48 L90 76 Z" fill="#7a4b8a"/><rect x="50" y="88" width="14" height="24" fill="#f6e7b4"/><rect x="12" y="112" width="${w - 24}" height="${h - 124}" fill="#7fa57c"/></g></svg>`;
}

/** A fountain pen lying at an angle. */
function pen({ x, y, len = 470, rot = -24 }) {
  return `<svg style="${abs(x, y, len, 40, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(40,20,5,.4))`)}" viewBox="0 0 ${len} 40" aria-hidden="true">
    <rect x="70" y="8" width="${len - 90}" height="24" rx="12" fill="#22304a"/><rect x="70" y="10" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".25"/>
    <rect x="${len - 150}" y="6" width="10" height="28" fill="#d6b25e"/><rect x="${len - 108}" y="14" width="64" height="4" rx="2" fill="#d6b25e"/>
    <path d="M70 8 L22 16 Q 14 20 22 24 L70 32 Z" fill="#d6b25e"/><path d="M22 16 Q 14 20 22 24 L36 22 L36 18 Z" fill="#25324a"/><path d="M70 8 L40 14 L40 26 L70 32 Z" fill="#c29c45"/>
    <path d="M22 20 H 44" stroke="#25324a" stroke-width="1.6"/></svg>`;
}

const css97 = `
  .pl{overflow:hidden}
  .ph{font:500 48px/1.05 "Newsreader",Georgia,serif;color:#2a1f33;letter-spacing:-.01em}
  .pb{font:500 29px/1.28 "Newsreader",Georgia,serif;color:#2a2622;margin-top:18px}
  .tag{display:flex;align-items:center;padding:12px 18px;font:600 27px/1.2 "Plex",sans-serif;color:#2a2018;background:linear-gradient(160deg,#d9b783,#c7a06a);border-radius:8px;box-shadow:0 3px 5px rgba(40,20,5,.3);overflow:hidden}
  .tag.white{background:#fffdf6;color:#2a2018;border:2px solid #cdbfa3}
`;

const scene97 = `${gingham()}
  ${letterLeft()}
  ${envelopeRight()}
  ${stamp({ x: 438, y: 520, rot: 9 })}
  ${pen({ x: 300, y: 1135, len: 470, rot: -17 })}`;

export const pins = [
  printable({ n: 95, scene: scene95, extraCss: css95, paper: "#e9e7e4" }),
  printable({ n: 96, scene: scene96, extraCss: css96, paper: "#f1eadb" }),
  printable({ n: 97, scene: scene97, extraCss: css97, paper: "#efe7da" }),
];
