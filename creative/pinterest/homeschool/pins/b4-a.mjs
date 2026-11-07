/**
 * Batch 4, module A: five guide pins about keeping and clearing out records
 * (guides: how-long-to-keep-homeschool-records, homeschool-record-keeping-template)
 * plus one product quote card. Every word is the idea bank's own.
 *
 *   #20  question    a banker's box on a shelf against a deep teal wall; three papers rise out of it, one per line
 *   #22  comparison  a green self-healing cutting mat, three sorting rows: a folder, a phone with a volcano photo, a crate
 *   #100 scenario    a butter-yellow table in early-summer leaf shadow: the open box, the worksheets, the log, two photos
 *   #35  quote-card  a lavender-grey ground, one large cream card with a plum rule, quiet, no props
 *   #37  question    a round wall clock on a peach wall, the short answer on a kraft drawer label
 *
 * #20, #37 and #100 speak of "your state", so they carry the guide's caution line
 * "Laws change. Confirm with your state before relying on this."
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, footFor, p } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { page, esc } from "../../v3/kit.mjs";

const CAUTION = "Laws change. Confirm with your state before relying on this.";
const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const SH = "0 2px 3px rgba(30,15,5,.25),0 14px 24px rgba(30,15,5,.32)";
const BOTTOM = 1354;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const exampleCss = `.example{font-size:24px;letter-spacing:.12em;color:#2a2530;background:#fffdf6;padding:7px 14px;box-shadow:0 2px 4px rgba(0,0,0,.25)}`;
let uid = 0;
const nid = (s) => `${s}${++uid}`;
const lead = (s) => [s.split(": ")[0], s.split(": ").slice(1).join(": ")];

const cautionPill = (x, y, w, bg = "#fffaf0") => `<div data-check="caution" style="${at(x, y, w, 66, `background:${bg};border-radius:12px;box-shadow:0 8px 14px rgba(0,0,0,.35);display:flex;align-items:center;gap:14px;padding:0 22px;font:600 26px/1.15 'Plex',sans-serif;color:#2b2330;z-index:6`)}">${icon("warning", { size: 34, color: "#8a5a12", weight: "fill" })}${esc(CAUTION)}</div>`;

/** A baking-soda volcano photo: sky, table, papier-mache cone, foam. */
function volcano(w, h, { sky = ["#a9d2e6", "#e8f1e9"], table = "#b88a58" } = {}) {
  const g = nid("vg");
  return `<svg viewBox="0 0 300 220" style="${at(0, 0, w, h)}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs>
    <rect width="300" height="220" fill="url(#${g})"/><circle cx="246" cy="44" r="20" fill="#fbe9a5"/>
    <rect y="150" width="300" height="70" fill="${table}"/><rect y="150" width="300" height="5" fill="#000" opacity=".15"/>
    <path d="M70 168 L124 66 L178 66 L232 168 Z" fill="#8a5a3a"/><path d="M124 66 L178 66 L196 100 L106 100 Z" fill="#a46f48"/>
    <path d="M70 168 L100 112 L116 168 Z" fill="#6f452b" opacity=".45"/>
    <ellipse cx="151" cy="66" rx="30" ry="8" fill="#3d2414"/>
    <g fill="#e8553a"><circle cx="151" cy="54" r="15"/><circle cx="132" cy="62" r="12"/><circle cx="170" cy="60" r="13"/><circle cx="150" cy="40" r="10"/><circle cx="125" cy="48" r="8"/><circle cx="178" cy="46" r="8"/></g>
    <g fill="#f4a04a"><circle cx="150" cy="50" r="9"/><circle cx="136" cy="57" r="6"/><circle cx="166" cy="56" r="7"/></g>
    <path d="M128 70 C 118 96, 108 120, 96 160 L112 160 C 124 126, 134 100, 140 72 Z" fill="#e8553a"/>
    <path d="M168 70 C 180 100, 190 128, 204 160 L186 160 C 176 128, 168 100, 160 72 Z" fill="#e8553a"/></svg>`;
}

/** A strip of washi / masking tape centred on (x, y). */
const tape = (x, y, w = 130, rot = -4, color = "rgba(224,200,140,.88)") => `<div style="${at(x - w / 2, y - 21, w, 42, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.3) 14px 22px);box-shadow:0 2px 4px rgba(30,15,5,.25);z-index:4`)}"></div>`;

/* ============================================================ #20 question */

function pin20() {
  const n = 20;
  const i = idea(n);
  if (i.items.length !== 3 || !i.items[2].startsWith("Your own log")) throw new Error("#20: items are not the three lines");
  // deep teal wall of vertical boards, a wooden shelf
  const r = seeded(7);
  const boards = Array.from({ length: 10 }, (_, k) => `<rect x="${k * 100}" y="0" width="100" height="982" fill="${k % 2 ? "#2b4452" : "#2f4a59"}"/><rect x="${k * 100}" y="0" width="3" height="982" fill="#000" opacity=".25"/>`).join("");
  const speck = Array.from({ length: 120 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 982).toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" opacity="${(0.03 + r() * 0.05).toFixed(2)}"/>`).join("");
  const wall = `<svg style="${at(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP + 146)}" viewBox="0 0 1000 982" preserveAspectRatio="none" aria-hidden="true">${boards}${speck}</svg>
    <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.14),rgba(0,0,0,.4))")}"></div>`;
  const shelf = `<div style="${at(0, 1262, 1000, 84, "background:linear-gradient(#c99b66,#b0834d);box-shadow:0 14px 24px rgba(0,0,0,.5)")}"></div><div style="${at(0, 1262, 1000, 8, "background:#e2bd8d")}"></div>
    <div style="${at(0, 1290, 1000, 3, "background:#7d5a30;opacity:.5")}"></div>`;
  const sheetDefs = [
    { y: 414, x: 118, rot: -1.8, icon: "clipboard-text", bg: "#fffdf7", line: "rgba(80,90,110,.0)", edge: "#e9e0cc" },
    { y: 608, x: 134, rot: 1.4, icon: "envelope-simple", bg: "#f4f8fb", line: "rgba(80,115,170,.0)", edge: "#d6e1ea" },
    { y: 800, x: 120, rot: -1, icon: "notebook", bg: "#fff6cf", line: "rgba(80,115,170,.3)", edge: "#e9d98f" },
  ];
  const sheets = sheetDefs.map((s, k) => `<div style="${at(s.x, s.y, 660, 440, `transform:rotate(${s.rot}deg);background:${s.bg};border-radius:5px 5px 0 0;box-shadow:0 -2px 3px rgba(0,0,0,.18),0 10px 20px rgba(0,0,0,.4);background-image:repeating-linear-gradient(180deg,transparent 0 41px,${s.line} 41px 43px);z-index:${2 + k}`)}">
    <div style="${at(0, 0, 660, 6, `background:${s.edge}`)}"></div>
    <div style="${at(34, 34, 72, 72, "border-radius:50%;background:#2f4a59;display:grid;place-items:center")}">${icon(s.icon, { size: 44, color: "#fffaf0", weight: "duotone" })}</div>
    <div data-check="item" style="${at(128, 30, 500, 130, "display:flex;align-items:center;font:500 38px/1.2 'Newsreader',Georgia,serif;color:#1f2630")}">${esc(i.items[k])}</div></div>`).join("");
  // the box: kraft front, lid band, handle hole, blank label
  const box = `<div style="${at(80, 1000, 740, 262, "z-index:8;filter:drop-shadow(0 16px 14px rgba(0,0,0,.45))")}">
    <div style="${at(0, 0, 740, 262, "background:linear-gradient(170deg,#d2b083,#bd9a69);border-radius:4px 4px 8px 8px")}"></div>
    <div style="${at(-10, 0, 760, 52, "background:linear-gradient(#cba878,#b58f5d);border-radius:5px;box-shadow:0 5px 8px rgba(0,0,0,.3)")}"></div>
    <div style="${at(250, 98, 240, 46, "border-radius:23px;background:#4a331c;box-shadow:inset 0 6px 8px rgba(0,0,0,.6)")}"></div>
    <div style="${at(40, 82, 150, 112, "background:#fbf6ea;border-radius:4px;box-shadow:0 3px 5px rgba(0,0,0,.3)")}">${[22, 46, 70].map((y, k) => `<div style="${at(16, y, k === 2 ? 70 : 118, 8, "background:#7a6a55;border-radius:4px;opacity:.55")}"></div>`).join("")}</div>
    <div style="${at(552, 100, 150, 100, "")}">${[0, 1, 2].map((k) => `<div style="${at(0, k * 36, 150, 5, "background:#8c6a3e;opacity:.4;border-radius:3px")}"></div>`).join("")}</div></div>`;
  // a small plant on the shelf
  const plant = `<div style="${at(800, 1010, 180, 256, "z-index:7;filter:drop-shadow(0 12px 10px rgba(0,0,0,.45))")}">
    <svg viewBox="0 0 180 256" style="${at(0, 0, 180, 256)}" aria-hidden="true">
      <g fill="#6f9a6b"><path d="M90 150 C 60 120, 40 80, 52 30 C 82 56, 92 100, 90 150Z"/><path d="M90 150 C 120 116, 144 78, 132 24 C 100 52, 88 100, 90 150Z" fill="#82ad78"/><path d="M90 150 C 80 100, 84 56, 92 8 C 108 52, 104 104, 90 150Z" fill="#5d8a5c"/><path d="M90 156 C 50 150, 22 124, 14 92 C 54 98, 80 122, 90 156Z" fill="#8bb583"/><path d="M90 156 C 130 148, 158 120, 166 90 C 128 98, 100 122, 90 156Z" fill="#6f9a6b"/></g>
      <path d="M40 150 H140 L128 252 H52 Z" fill="#c4573e"/><rect x="34" y="144" width="112" height="22" rx="4" fill="#d4694e"/><path d="M40 168 H140 L138 182 H42Z" fill="#000" opacity=".12"/></svg></div>`;
  return printable({ n, paper: "#e6eef0", extraCss: ".top h1{font-size:62px}", scene: `${wall}${sheets}${box}${shelf}${plant}${cautionPill(50, 1272, 900, "#fffaf0")}` });
}

/* ============================================================ #22 comparison */

function pin22() {
  const n = 22;
  const i = idea(n);
  const rows = i.items.map(lead);
  if (rows.length !== 4 || rows[1][1] !== "Permanently") throw new Error("#22: items are not the four table rows");
  // green cutting mat with a grid
  const grid = Array.from({ length: 26 }, (_, k) => `<path d="M${k * 40} 0 V982" stroke="#fff" stroke-opacity="${k % 5 ? 0.14 : 0.32}" stroke-width="${k % 5 ? 1.5 : 2.5}"/>`).join("") + Array.from({ length: 25 }, (_, k) => `<path d="M0 ${k * 40} H1000" stroke="#fff" stroke-opacity="${k % 5 ? 0.14 : 0.32}" stroke-width="${k % 5 ? 1.5 : 2.5}"/>`).join("");
  const mat = `<div style="${at(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP + 146, "background:#3d7c69")}"></div>
    <svg style="${at(0, SCENE_TOP, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true">${grid}<path d="M0 0 L1000 982" stroke="#fff" stroke-opacity=".12" stroke-width="2"/></svg>
    <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 28% 8%,rgba(255,255,255,.2),rgba(0,20,10,.38))")}"></div>`;
  const card = (y, h, accent, inner) => `<div style="${at(404, y, 546, h, `background:#fffdf6;border-radius:8px;box-shadow:${SH};z-index:3;overflow:hidden`)}"><div style="${at(0, 0, 14, h, `background:${accent}`)}"></div>${inner}</div>`;
  const entry = (a, b, y, h) => `<div style="${at(38, y, 484, h, "display:flex;flex-direction:column;justify-content:center")}"><div data-check="lead" style="font:500 27px/1.2 'Plex',sans-serif;color:#4b4339">${esc(a)}</div><div data-check="answer" style="margin-top:6px;font:600 44px/1.06 'Newsreader',Georgia,serif;color:#1d1a22">${esc(b)}</div></div>`;
  const Y1 = 392, Y2 = 714, Y3 = 1036, RH = 300;
  // row 1: the folder (Keep)
  const folder = `<div style="${at(46, Y1 + 8, 330, 284, "transform:rotate(-2.5deg);z-index:3;filter:drop-shadow(0 14px 14px rgba(0,0,0,.45))")}">
    <div style="${at(150, 0, 140, 44, "background:#cdab78;border-radius:12px 12px 0 0")}"><div data-check="tab" style="${at(0, 7, 140, null, "text-align:center;font:700 26px/1.2 'Plex',sans-serif;color:#2c1f10")}">Keep</div></div>
    <div style="${at(0, 44, 330, 240, "background:linear-gradient(165deg,#e3c690,#d0ac74);border-radius:6px 14px 14px 14px;box-shadow:inset 0 3px 0 rgba(255,255,255,.3)")}">
      <div style="${at(26, 30, 270, 190, "background:#fffdf6;border-radius:3px;box-shadow:0 3px 5px rgba(0,0,0,.25);transform:rotate(1.5deg)")}">${[26, 52, 78, 104, 130, 156].map((y, k) => `<div style="${at(22, y, k % 3 === 2 ? 130 : 226, 8, "background:#6a6a72;border-radius:4px;opacity:.45")}"></div>`).join("")}</div></div></div>`;
  const row1 = card(Y1, RH, "#c8a679", entry(rows[0][0], rows[0][1], 0, 150) + `<div style="${at(38, 148, 484, 3, "background:rgba(60,45,30,.25)")}"></div>` + entry(rows[1][0], rows[1][1], 152, 148));
  // row 2: the phone with the volcano
  const phone = `<div style="${at(36, Y2 + 36, 352, 228, "transform:rotate(-3deg);z-index:3;filter:drop-shadow(0 16px 14px rgba(0,0,0,.5))")}">
    <div style="${at(0, 0, 352, 228, "background:#1c1d21;border-radius:30px")}"></div>
    <div style="${at(14, 14, 324, 200, "border-radius:18px;overflow:hidden;background:#9cc")}">${volcano(324, 200)}</div>
    <div style="${at(327, 90, 6, 48, "background:#3a3c43;border-radius:3px")}"></div></div>
    <div data-check="tab" style="${at(190, Y2 + 6, null, null, "z-index:4;transform:rotate(-3deg);background:#fffdf6;padding:6px 16px;border-radius:5px;box-shadow:0 3px 6px rgba(0,0,0,.35);font:700 26px/1.2 'Plex',sans-serif;color:#2c1f10")}">Photograph</div>`;
  const row2 = card(Y2, RH, "#6a8fb0", `<div style="${at(38, 0, 484, RH, "display:flex;flex-direction:column;justify-content:center")}"><div data-check="lead" style="font:500 27px/1.2 'Plex',sans-serif;color:#4b4339">${esc(rows[2][0])}</div><div data-check="answer" style="margin-top:6px;font:600 44px/1.06 'Newsreader',Georgia,serif;color:#1d1a22">${esc(rows[2][1])}</div></div>`);
  // row 3: the recycling crate with finished curriculum books
  const crate = `<div style="${at(40, Y3 + 38, 340, 244, "z-index:3;filter:drop-shadow(0 16px 14px rgba(0,0,0,.5))")}">
    <svg viewBox="0 0 340 244" style="${at(0, 0, 340, 244)}" aria-hidden="true">
      <rect x="40" y="6" width="42" height="120" rx="3" fill="#c4573e" transform="rotate(-6 60 66)"/><rect x="92" y="0" width="38" height="128" rx="3" fill="#e0a95a" transform="rotate(3 110 64)"/><rect x="140" y="10" width="46" height="116" rx="3" fill="#5f8a8f" transform="rotate(-2 160 68)"/><rect x="198" y="2" width="40" height="124" rx="3" fill="#f2ecd9" transform="rotate(7 218 64)"/><rect x="246" y="12" width="40" height="114" rx="3" fill="#8a6aa0" transform="rotate(-4 266 70)"/>
      <rect x="0" y="76" width="340" height="168" rx="14" fill="#2d6fb0"/><rect x="0" y="76" width="340" height="22" rx="10" fill="#4a8bcb"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="${26 + k * 38}" y="170" width="22" height="40" rx="6" fill="#1b4f84" opacity=".7"/>`).join("")}
      <rect x="128" y="108" width="84" height="34" rx="17" fill="#1b4f84" opacity=".7"/></svg>
    <div style="${at(240, 152, 80, 80, "display:grid;place-items:center;opacity:.9")}">${icon("recycle", { size: 66, color: "#e6f1fb", weight: "bold" })}</div></div>
    <div data-check="tab" style="${at(210, Y3 + 6, null, null, "z-index:4;transform:rotate(2deg);background:#fffdf6;padding:6px 16px;border-radius:5px;box-shadow:0 3px 6px rgba(0,0,0,.35);font:700 26px/1.2 'Plex',sans-serif;color:#2c1f10")}">Recycle</div>`;
  const row3 = card(Y3, RH - 12, "#c4573e", `<div style="${at(38, 0, 484, RH - 12, "display:flex;flex-direction:column;justify-content:center")}"><div data-check="lead" style="font:500 27px/1.2 'Plex',sans-serif;color:#4b4339">${esc(rows[3][0])}</div><div data-check="answer" style="margin-top:6px;font:600 44px/1.06 'Newsreader',Georgia,serif;color:#1d1a22">${esc(rows[3][1])}</div></div>`);
  return printable({ n, paper: "#e8f0ea", extraCss: ".top h1{font-size:60px}", scene: `${mat}${folder}${row1}${phone}${row2}${crate}${row3}` });
}

/* ============================================================ #100 scenario */

function pin100() {
  const n = 100;
  const i = idea(n);
  if (i.items.length !== 4 || !i.items[0].startsWith("Forty worksheets")) throw new Error("#100: items are not the four scenario lines");
  const [keepLead, keepRest] = lead(i.items[2]);
  if (keepLead !== "Keep") throw new Error("#100: third item is not the Keep line");
  // butter-yellow painted boards with early-summer leaf shadow and a window beam
  const r = seeded(21);
  const planks = Array.from({ length: 5 }, (_, k) => `<rect x="0" y="${k * 196}" width="1000" height="196" fill="${k % 2 ? "#ebcf74" : "#e5c668"}"/><rect x="0" y="${k * 196}" width="1000" height="3" fill="#7a5d12" opacity=".3"/>`).join("");
  const grain = Array.from({ length: 36 }, () => { const y = r() * 982; return `<path d="M0 ${y} C 300 ${y + (r() - 0.5) * 12}, 650 ${y + (r() - 0.5) * 12}, 1000 ${y + (r() - 0.5) * 10}" stroke="#8a6a18" stroke-opacity="${(0.06 + r() * 0.08).toFixed(2)}" stroke-width="${(1 + r() * 1.4).toFixed(1)}" fill="none"/>`; }).join("");
  const leaves = Array.from({ length: 34 }, () => `<ellipse cx="${(520 + r() * 520).toFixed(0)}" cy="${(r() * 560).toFixed(0)}" rx="${(22 + r() * 30).toFixed(0)}" ry="${(10 + r() * 14).toFixed(0)}" transform="rotate(${(r() * 180).toFixed(0)} ${(520 + r() * 520).toFixed(0)} 200)" fill="#4a5a1a" opacity="${(0.1 + r() * 0.08).toFixed(2)}"/>`).join("");
  const table = `<svg style="${at(0, SCENE_TOP, 1000, 1128)}" viewBox="0 0 1000 982" preserveAspectRatio="none" aria-hidden="true">${planks}${grain}<g fill="#fff8d6" opacity=".28"><polygon points="40,0 360,0 470,560 150,560"/><polygon points="420,0 520,0 600,560 500,560"/></g>${leaves}</svg>
    <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 22% 10%,rgba(255,255,230,.3),rgba(90,60,0,.3))")}"></div>`;
  // props: open box, the thin pile, the log, two photos
  const box = `<div style="${at(34, 428, 306, 276, "z-index:3;filter:drop-shadow(0 16px 14px rgba(60,35,0,.45))")}">
    <div style="${at(0, 0, 306, 276, "background:linear-gradient(170deg,#d2b083,#bd9a69);border-radius:6px")}"></div>
    <div style="${at(14, 12, 278, 200, "background:#3d2a16;border-radius:4px;box-shadow:inset 0 8px 14px rgba(0,0,0,.6);overflow:hidden")}">
      <div style="${at(18, 30, 238, 190, "background:#fffdf6;border-radius:2px;transform:rotate(-2deg)")}"></div>
      <div style="${at(26, 44, 232, 180, "background:#f6f1e4;border-radius:2px;transform:rotate(1.5deg)")}">${[24, 50, 76, 102].map((y, k) => `<div style="${at(18, y, k === 3 ? 90 : 190, 7, "background:#6a6a72;border-radius:4px;opacity:.4")}"></div>`).join("")}</div></div>
    <div style="${at(0, 206, 306, 70, "background:linear-gradient(#c6a370,#b48f5d);border-radius:0 0 6px 6px;box-shadow:inset 0 4px 6px rgba(0,0,0,.18)")}"></div>
    <div style="${at(98, 222, 110, 30, "border-radius:15px;background:#4a331c;box-shadow:inset 0 4px 6px rgba(0,0,0,.6)")}"></div></div>`;
  const pile = `<div style="${at(366, 450, 224, 270, "z-index:3")}">${[0, 1, 2, 3, 4].map((k) => `<div style="${at(10 - k * 3 + (k % 2) * 4, 206 - k * 6, 196, 54, `background:#fffdf6;border-radius:2px;box-shadow:0 2px 3px rgba(60,35,0,.3);transform:rotate(${[-1.5, 1, -0.6, 1.4, 0][k]}deg)`)}"></div>`).join("")}
    <div style="${at(8, 4, 204, 228, "background:#fffdf6;border-radius:3px;transform:rotate(-2.5deg);box-shadow:0 14px 16px rgba(60,35,0,.4)")}">
      <div style="${at(18, 22, 120, 14, "background:#3b3b44;border-radius:6px;opacity:.7")}"></div>
      ${[64, 92, 120, 148, 176].map((y, k) => `<div style="${at(18, y, k === 4 ? 100 : 168, 6, "background:#7d7d86;border-radius:3px;opacity:.55")}"></div>`).join("")}
      <svg viewBox="0 0 80 80" style="${at(110, 120, 80, 80)}" aria-hidden="true"><path d="M10 44 L30 64 L70 14" stroke="#c4372e" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".85"/></svg></div></div>`;
  const log = `<div style="${at(616, 426, 188, 276, "transform:rotate(3deg);z-index:3;filter:drop-shadow(0 16px 14px rgba(60,35,0,.5))")}">
    <div style="${at(0, 0, 188, 276, "background:linear-gradient(160deg,#2f4a6e,#223755);border-radius:6px 12px 12px 6px")}"></div>
    <div style="${at(0, 0, 22, 276, "background:#1a2b44;border-radius:6px 0 0 6px")}"></div>
    ${Array.from({ length: 8 }, (_, k) => `<div style="${at(-8, 18 + k * 32, 30, 11, "border-radius:6px;background:linear-gradient(#e8eaed,#8d9399)")}"></div>`).join("")}
    <div style="${at(52, 58, 106, 120, "background:#fbf6ea;border-radius:4px")}">${[24, 50, 76].map((y, k) => `<div style="${at(16, y, k === 2 ? 50 : 76, 7, "background:#6a6a72;border-radius:4px;opacity:.5")}"></div>`).join("")}</div></div>`;
  const photo = (x, y, rot, w, h, sk) => `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);z-index:4;background:#fffdf8;padding:10px 10px 30px;border-radius:3px;box-shadow:0 12px 16px rgba(60,35,0,.45)`)}"><div style="${at(10, 10, w - 20, h - 40, "overflow:hidden")}">${volcano(w - 20, h - 40, { sky: sk })}</div></div>`;
  const photos = photo(804, 448, 6, 168, 168, ["#a9d2e6", "#e8f1e9"]) + photo(790, 600, -5, 178, 150, ["#f6d9a0", "#f1ece0"]);
  const example = `<div class="example" style="${at(48, 726, null, null, "z-index:6")}">Example</div>`;
  // text slips
  const s1 = `<div style="${at(40, 770, 920, null, `background:#fffdf6;border-radius:8px;box-shadow:${SH};padding:16px 28px 18px 38px;z-index:5;border-left:14px solid #c4573e`)}"><div data-check="item1" style="font:500 31px/1.28 'Plex',sans-serif;color:#2a2530">${esc(i.items[0])}</div></div>`;
  const s2 = `<div style="${at(50, 940, 900, null, "z-index:5;transform:rotate(-1deg)")}"><div data-check="item2" style="padding:8px 4px;font:600 50px/1.05 'Newsreader',Georgia,serif;color:#2a1c0a">${esc(i.items[1])}</div></div>`;
  const s3 = `<div style="${at(48, 1032, 904, null, `background:#d7ecc4;border-radius:6px;box-shadow:${SH};padding:16px 26px 18px 26px;z-index:5;transform:rotate(.4deg)`)}"><div data-check="item3" style="font:500 31px/1.28 'Plex',sans-serif;color:#1f3a1a"><b style="font:700 31px 'Plex',sans-serif;letter-spacing:.04em;color:#2b5f26">${esc(keepLead)}:</b> ${esc(keepRest)}</div></div>`;
  const s4 = `<div style="${at(48, 1176, 904, null, `background:#26405f;border-radius:6px;box-shadow:${SH};padding:16px 26px 18px 26px;z-index:5;transform:rotate(-.4deg)`)}"><div data-check="item4" style="font:600 33px/1.25 'Plex',sans-serif;color:#fffaf0">${esc(i.items[3])}</div></div>`;
  return printable({ n, paper: "#f6efd8", extraCss: `.top h1{font-size:58px}${exampleCss}`, scene: `${table}${box}${pile}${log}${photos}${example}${s1}${s2}${s3}${s4}${cautionPill(48, 1276, 904, "#fffaf0")}` });
}

/* ============================================================ #35 quote card */

function pin35() {
  const n = 35;
  const i = idea(n);
  const [label] = i.headline.split(": ").slice(1);
  if (i.items[0] !== "Do not grade your own child." || !i.items[1].startsWith("It is anxiety")) throw new Error("#35: items are not the two sentences");
  const css = `
  .ground{position:absolute;inset:0;background:radial-gradient(ellipse at 24% 10%,#e9e1f1,#c9bdd7 85%)}
  .card{position:absolute;left:70px;right:70px;top:72px;height:1236px;background:linear-gradient(#fffdf8,#faf6ee);border-radius:6px;box-shadow:0 3px 4px rgba(40,25,60,.25),0 28px 50px rgba(40,25,60,.35),0 60px 90px -30px rgba(40,25,60,.4)}
  .card:before{content:"";position:absolute;left:72px;right:72px;top:92px;height:4px;background:${p.accent}}
  .eb{position:absolute;left:72px;right:72px;top:118px;font:600 26px/1.3 "Plex",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${p.accent}}
  .q1{position:absolute;left:72px;right:72px;top:240px;font:500 132px/1.0 "Newsreader",Georgia,serif;letter-spacing:-.025em;color:#1d1a24}
  .q2{position:absolute;left:72px;right:72px;top:790px;font:400 italic 72px/1.12 "Newsreader",Georgia,serif;color:#3d2a4d}
  .rule{position:absolute;left:72px;width:150px;height:4px;background:${p.accent};top:744px}
  .chap{position:absolute;left:72px;right:72px;bottom:70px;font:500 28px/1.3 "Plex",sans-serif;color:#5b5365}
  .chap:before{content:"";display:block;width:100%;height:2px;background:rgba(61,42,77,.22);margin-bottom:22px}
  `;
  const body = `<div class="ground"></div>
  <div class="card"><div class="eb">${esc(label)}</div>
    <div class="q1" data-check="quote" data-bottom-max="740">${esc(i.items[0])}</div><div class="rule"></div>
    <div class="q2" data-check="quote2">${esc(i.items[1])}</div>
    <div class="chap">${esc(i.sub)}</div></div>
  ${footFor(i)}`;
  return { n, id: `${n}-do-not-grade-your-own-child`, html: page(p, { body, css, paper: "#cfc4dc" }) };
}

/* ============================================================ #37 question */

function pin37() {
  const n = 37;
  const i = idea(n);
  if (!i.sub.startsWith("Only if your state's summary") || !i.items[0].startsWith("Logging time")) throw new Error("#37: sub/items are not the answer");
  // dusty peach plaster wall, a nail, a big wall clock
  const r = seeded(33);
  const speck = Array.from({ length: 260 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 982).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#7a3b2c"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const wall = `<div style="${at(0, SCENE_TOP, 1000, 1128, "background:linear-gradient(180deg,#f0c2ab,#e5a98f)")}"></div>
    <svg style="${at(0, SCENE_TOP, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true">${speck}</svg>
    <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 26% 12%,rgba(255,244,230,.3),rgba(90,35,20,.3) 95%)")}"></div>`;
  const D = 500, cx = D / 2;
  const ticks = Array.from({ length: 60 }, (_, k) => { const a = (k * 6 * Math.PI) / 180, big = k % 5 === 0; const r1 = cx - 34, r2 = r1 - (big ? 26 : 11); return `<line x1="${cx + Math.sin(a) * r1}" y1="${cx - Math.cos(a) * r1}" x2="${cx + Math.sin(a) * r2}" y2="${cx - Math.cos(a) * r2}" stroke="#2a2530" stroke-width="${big ? 6 : 2.5}" stroke-linecap="round"/>`; }).join("");
  const nums = Array.from({ length: 12 }, (_, k) => { const a = ((k + 1) * 30 * Math.PI) / 180, rr = cx - 96; return `<text x="${cx + Math.sin(a) * rr}" y="${cx - Math.cos(a) * rr + 17}" text-anchor="middle" font-family="Newsreader" font-weight="500" font-size="50" fill="#2a2530">${k + 1}</text>`; }).join("");
  const clock = `<div style="${at(250, 414, D, D, "filter:drop-shadow(0 22px 18px rgba(60,20,10,.45))")}">
    <svg viewBox="0 0 ${D} ${D}" style="${at(0, 0, D, D)}" aria-hidden="true">
      <circle cx="${cx}" cy="${cx}" r="${cx - 2}" fill="#2a2530"/><circle cx="${cx}" cy="${cx}" r="${cx - 18}" fill="#fffdf6"/><circle cx="${cx}" cy="${cx}" r="${cx - 18}" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/>
      ${ticks}${nums}
      <g stroke="#2a2530" stroke-linecap="round"><line x1="${cx}" y1="${cx}" x2="${cx - 82}" y2="${cx - 66}" stroke-width="16"/><line x1="${cx}" y1="${cx}" x2="${cx + 112}" y2="${cx - 122}" stroke-width="10"/></g>
      <line x1="${cx - 36}" y1="${cx + 40}" x2="${cx + 20}" y2="${cx - 26}" stroke="#c4573e" stroke-width="4" stroke-linecap="round" transform="rotate(26 ${cx} ${cx})"/>
      <circle cx="${cx}" cy="${cx}" r="14" fill="#c4573e"/><circle cx="${cx}" cy="${cx}" r="5" fill="#2a2530"/></svg></div>
    <div style="${at(484, 394, 32, 32, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#d0d3d8,#6a6e75);box-shadow:0 3px 4px rgba(0,0,0,.4);z-index:4")}"></div>`;
  // kraft drawer label with the short answer
  const label = `<div style="${at(100, 940, 800, 156, "transform:rotate(-.8deg);z-index:5;filter:drop-shadow(0 12px 12px rgba(60,20,10,.45))")}">
    <div style="${at(0, 0, 800, 156, "background:linear-gradient(170deg,#d6b585,#c3a068);border-radius:8px")}"></div>
    <div style="${at(10, 10, 780, 136, "border:3px dashed rgba(90,60,25,.45);border-radius:5px")}"></div>
    <div style="${at(18, 18, 24, 24, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#e6e8eb,#8d9399)")}"></div><div style="${at(758, 18, 24, 24, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#e6e8eb,#8d9399)")}"></div>
    <div data-check="answer" style="${at(40, 14, 720, 128, "display:flex;align-items:center;justify-content:center;text-align:center;font:600 40px/1.18 'Newsreader',Georgia,serif;color:#2c1f10")}">${esc(i.sub)}</div></div>`;
  const note = `<div style="${at(80, 1124, 840, null, `background:#fffdf6;border-radius:6px;box-shadow:${SH};padding:16px 28px 18px 28px;z-index:5;transform:rotate(.5deg);border-left:14px solid #6a8fb0`)}"><div data-check="note" style="font:500 30px/1.28 'Plex',sans-serif;color:#2a2530">${esc(i.items[0])}</div></div>`;
  return printable({ n, paper: "#f6e6dc", sub: false, scene: `${wall}${clock}${label}${note}${cautionPill(80, 1276, 840, "#fffaf0")}` });
}

export const pins = [pin20(), pin22(), pin100(), pin35(), pin37()];
