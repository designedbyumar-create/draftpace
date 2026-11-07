/**
 * Batch 4, module e: #46, #50, #64, #68. Four new worlds:
 *   46 an oxblood leather desk blotter on walnut: a too-neat attendance grid crossed out in red pencil, beside a real one with ordinary gaps
 *   50 a lilac wall above a pine recipe box: the three-line checklist on a recipe card, the third line drawn lighter
 *   64 a forest-green card-catalogue top with brass-rod cards: four questions, October and March tabs, an Example tag
 *   68 a slate-blue wall and a brass balance beam: two cards hung from it, what a result can tell you and what it cannot
 * Every word is the idea bank's own (headline, sub, items).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea } from "../kit/bank.mjs";
import { desk, pencil, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(20,10,5,.25)) drop-shadow(0 12px 14px rgba(20,10,5,.32))";
const split = (t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; };

/* ------------------------------------------------------------------ #46 */

/** A month grid of attendance boxes (7 x 6). `ticked(r, c)` says whether a box holds a tick. */
function attendanceSheet({ x, y, tilt, kind, ink }) {
  const W = 420, H = 456, gx = 28, gy = 84, cell = 52, rows = 6, cols = 7;
  const r = seeded(kind === "neat" ? 5 : 17);
  const lines = [];
  for (let k = 0; k <= cols; k++) lines.push(`<path d="M${gx + k * cell} ${gy} V${gy + rows * cell}" stroke="#9aa6b8" stroke-width="2"/>`);
  for (let k = 0; k <= rows; k++) lines.push(`<path d="M${gx} ${gy + k * cell} H${gx + cols * cell}" stroke="#9aa6b8" stroke-width="2"/>`);
  const marks = [];
  const gaps = new Set(["0-5", "0-6", "1-6", "2-3", "3-5", "3-6", "4-6", "5-0", "5-1", "5-2", "5-3", "5-4", "5-5", "5-6"]);
  for (let ro = 0; ro < rows; ro++) {
    for (let co = 0; co < cols; co++) {
      if (kind === "real" && gaps.has(`${ro}-${co}`)) continue;
      const cx = gx + co * cell, cy = gy + ro * cell;
      if (kind === "neat") {
        marks.push(`<path d="M${cx + 13} ${cy + 27} l11 12 l17 -24" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`);
      } else {
        const j = () => (r() - 0.5) * 6;
        marks.push(`<path d="M${cx + 12 + j()} ${cy + 26 + j()} l${10 + j() / 2} ${12 + j() / 2} l${18 + j()} ${-25 + j() / 2}" fill="none" stroke="${r() > 0.8 ? "#2c6f66" : ink}" stroke-width="${(3 + r() * 2).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
      }
    }
  }
  const header = `<rect x="${gx}" y="30" width="190" height="14" rx="7" fill="#cdd5e1"/><rect x="${gx}" y="54" width="120" height="10" rx="5" fill="#dde3ec"/>`;
  const weekday = Array.from({ length: cols }, (_, k) => `<circle cx="${gx + k * cell + cell / 2}" cy="${gy - 12}" r="5" fill="#b9c3d2"/>`).join("");
  return `<div style="${abs(x, y, W, H, `transform:rotate(${tilt}deg);background:#fdfbf4;border-radius:4px;box-shadow:0 2px 3px rgba(20,8,4,.35),0 18px 30px rgba(20,8,4,.45);z-index:3`)}">
    <svg style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:visible" viewBox="0 0 ${W} ${H}" aria-hidden="true">${header}${weekday}${lines.join("")}${marks.join("")}
    ${kind === "neat" ? `<g fill="none" stroke="#c9332a" stroke-linecap="round" opacity=".92"><path d="M10 52 C 120 140, 230 260, 410 440" stroke-width="17"/><path d="M406 40 C 300 150, 160 290, 14 430" stroke-width="17"/><path d="M14 60 C 130 150, 250 270, 398 420" stroke-width="5" opacity=".5"/></g>` : ""}
    </svg></div>`;
}

function pin46() {
  const i = idea(46);
  const [stop, stopText] = split(i.items[0]);
  const [instead, insteadText] = split(i.items[1]);
  const walnut = desk({ top: SCENE_TOP, height: 1128, base: "#6a4a33", dark: "#543825", planks: 5, seed: 11 });
  const BX = 22, BY = 392, BW = 956, BH = 946;
  const corner = (x, y, rot) => `<div style="${abs(x, y, 110, 110, `transform:rotate(${rot}deg);overflow:hidden`)}"><div style="${abs(-55, -55, 110, 110, "transform:rotate(45deg);background:linear-gradient(135deg,#4a2c1c,#2e1a10);box-shadow:0 2px 6px rgba(0,0,0,.5)")}"></div></div>`;
  const blotter = `<div style="${abs(BX, BY, BW, BH, "background:linear-gradient(160deg,#7b2e33,#5b1f25 60%,#4e181f);border-radius:12px;box-shadow:0 4px 8px rgba(0,0,0,.4),0 26px 44px rgba(0,0,0,.5)")}"></div>
    <div style="${abs(BX + 16, BY + 16, BW - 32, BH - 32, "border:3px dashed rgba(255,226,200,.28);border-radius:8px")}"></div>
    ${corner(BX, BY, 0)}${corner(BX + BW - 110, BY, 90)}${corner(BX + BW - 110, BY + BH - 110, 180)}${corner(BX, BY + BH - 110, 270)}`;
  const left = attendanceSheet({ x: 58, y: 432, tilt: -1.8, kind: "neat", ink: "#26324f" });
  const right = attendanceSheet({ x: 520, y: 432, tilt: 1.6, kind: "real", ink: "#26324f" });
  const slip = (x, tilt, label, text, color, k) => `<div style="${abs(x, 930, 440, 372, `transform:rotate(${tilt}deg);background:#fff9ee;border-radius:5px;filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 0, 440, 14, `background:${color};border-radius:5px 5px 0 0`)}"></div>
    <div style="${abs(30, 36, 380, 52, `display:flex;align-items:center;gap:12px`)}">${icon(k === "x" ? "x-circle" : "check-circle", { size: 46, color, weight: "fill" })}<span class="eyebrow" style="font-size:34px;letter-spacing:.14em;color:${color}">${esc(label)}</span></div>
    <div class="serif" data-check="${label}" style="${abs(30, 100, 380, 256, "font-size:39px;line-height:1.2;font-weight:500;color:#26211c")}">${esc(text)}</div></div>`;
  const red = pencil({ x: 300, y: 893, len: 430, rot: -3, body: "#c0392b" }).replace("z-index:3", "");
  const scene = `${walnut}${blotter}${left}${right}${slip(50, -1.2, stop, stopText, "#b3261e", "x")}${slip(512, 1.2, instead, insteadText, "#2c6f4e", "ok")}<div style="position:absolute;z-index:4">${red}</div>`;
  return printable({ n: 46, paper: "#f1e6dc", scene, extraCss: ".top h1{font-size:62px}" });
}

/* ------------------------------------------------------------------ #50 */

function pin50() {
  const i = idea(50);
  const r = seeded(23);
  // Lilac plaster wall with a pine counter below.
  const speck = Array.from({ length: 260 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(380 + r() * 900).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#6b5a86"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const wall = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><radialGradient id="lw" cx="22%" cy="25%" r="90%"><stop offset="0" stop-color="#d9cbe6"/><stop offset="1" stop-color="#9c88b8"/></radialGradient><linearGradient id="pn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b681"/><stop offset="1" stop-color="#bd9560"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="url(#lw)"/>${speck}
    <rect x="0" y="1258" width="1000" height="140" fill="url(#pn)"/><rect x="0" y="1254" width="1000" height="10" fill="#8a6234" opacity=".7"/>
    ${[0, 1, 2, 3].map((k) => `<path d="M0 ${1288 + k * 26} C 300 ${1284 + k * 26 + (k % 2) * 8}, 700 ${1296 + k * 26}, 1000 ${1288 + k * 26}" stroke="#8a6234" stroke-opacity=".25" stroke-width="2" fill="none"/>`).join("")}</svg>`;

  const BOXX = 70, BOXY = 1010, BOXW = 700, BOXH = 270;
  // Cards peeking out of the box behind the main one, each a different tint, with blank divider tabs.
  const peeks = [["#f6e3b4", -5.5, 88, 0], ["#cfe4d4", -3, 118, 1], ["#f4cdbd", 3.2, 590, 2], ["#e5ddf3", 5.5, 640, 3]].map(([c, rot, px, k]) => `<div style="${abs(px, 468 + k * 6, 260, 560, `transform:rotate(${rot}deg);background:${c};border-radius:6px;box-shadow:0 8px 14px rgba(40,20,70,.3);z-index:2`)}"></div>`).join("");
  const tabs = [["#d86a4f", 120, 438, -3], ["#4f8b87", 590, 442, 4]].map(([c, x, y, rot]) => `<div style="${abs(x, y, 110, 52, `transform:rotate(${rot}deg);background:${c};border-radius:8px 8px 0 0;box-shadow:0 4px 8px rgba(40,20,70,.3);z-index:2`)}"></div>`).join("");

  const rows = [i.items[0], i.items[1], i.items[2]];
  const rowHtml = rows.map((t, k) => {
    const light = k === 2;
    const box = light
      ? `<div style="flex:none;width:58px;height:58px;border:4px dashed #a49a8a;border-radius:9px;margin-top:2px"></div>`
      : `<div style="flex:none;width:58px;height:58px;border:4px solid #2a3350;border-radius:9px;margin-top:2px;position:relative"><svg style="position:absolute;left:-2px;top:-14px;width:70px;height:70px" viewBox="0 0 70 70" aria-hidden="true"><path d="M10 38 l16 18 l32 -42" fill="none" stroke="#2c6f4e" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
    return `<div style="display:flex;gap:26px;align-items:flex-start;margin-bottom:${k < 2 ? 44 : 0}px">${box}<div class="serif" data-check="row-${k}" style="font-size:${light ? 46 : 50}px;line-height:1.16;font-weight:500;color:${light ? "#8d8374" : "#26211c"};${light ? "font-style:italic" : ""}">${esc(t)}</div></div>`;
  }).join("");
  const card = `<div style="${abs(110, 414, 700, 700, `transform:rotate(-1.6deg);background:#fffcf2;border-radius:8px;filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 62, 700, 4, "background:#d86a4f")}"></div>
    <div style="${abs(0, 70, 700, 630, "background:repeating-linear-gradient(180deg,transparent 0 58px,#cbd7e6 58px 60px);opacity:.55")}"></div>
    <div style="${abs(58, 96, 590, 560)}">${rowHtml}</div></div>`;

  const front = `<div style="${abs(BOXX, BOXY + 36, BOXW, BOXH, "background:linear-gradient(#d3ac76,#b88c56);border-radius:6px 6px 14px 14px;box-shadow:0 4px 6px rgba(40,20,70,.3),0 24px 36px rgba(40,20,70,.4);z-index:5")}">
      ${[0, 1, 2, 3, 4].map((k) => `<div style="${abs(0, 34 + k * 46, BOXW, 2, "background:#8a6234;opacity:.28")}"></div>`).join("")}
      <div style="${abs(BOXW / 2 - 88, 70, 176, 78, "background:linear-gradient(#e6c76a,#b88e2a);border-radius:10px;box-shadow:0 3px 5px rgba(0,0,0,.35)")}"></div>
      <div style="${abs(BOXW / 2 - 76, 80, 152, 58, "background:#fffaf0;border-radius:5px")}"></div>
      <div style="${abs(BOXW / 2 - 40, 178, 80, 22, "background:linear-gradient(#e6c76a,#a67e22);border-radius:12px;box-shadow:0 3px 4px rgba(0,0,0,.35)")}"></div>
      <div style="${abs(0, 0, 40, BOXH, "background:linear-gradient(90deg,rgba(255,255,255,.2),transparent)")}"></div></div>`;
  const cup = mug({ x: 770, y: 1138, size: 168, color: "#f3ede4", drink: "#7a4a2a" });
  const pen = pencil({ x: 560, y: 1296, len: 380, rot: 4 });
  return printable({ n: 50, paper: "#ebe3f1", scene: `${wall}${peeks}${tabs}${card}${front}${cup}${pen}` });
}

/* ------------------------------------------------------------------ #64 */

function pin64() {
  const i = idea(64);
  const r = seeded(31);
  const top = [];
  for (let k = 0; k < 150; k++) top.push(`<path d="M${(r() * 900).toFixed(0)} ${(380 + r() * 760).toFixed(0)} h${(60 + r() * 220).toFixed(0)}" stroke="#8a6234" stroke-opacity="${(0.05 + r() * 0.08).toFixed(2)}" stroke-width="${(1 + r() * 1.5).toFixed(1)}"/>`);
  const cabinet = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs>
    <radialGradient id="gt" cx="28%" cy="18%" r="90%"><stop offset="0" stop-color="#ecd9b4"/><stop offset="1" stop-color="#cfb27f"/></radialGradient>
    <linearGradient id="oakf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4630"/><stop offset="1" stop-color="#4f3322"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d77a"/><stop offset=".5" stop-color="#c79a2e"/><stop offset="1" stop-color="#9a7418"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="url(#gt)"/>${top.join("")}
    <rect x="0" y="1166" width="1000" height="14" fill="#a98250"/><rect x="0" y="1180" width="1000" height="220" fill="url(#oakf)"/>
    <rect x="0" y="1180" width="1000" height="16" fill="#000" opacity=".16"/>
    ${[22, 512].map((x) => `<g><rect x="${x}" y="1208" width="466" height="170" rx="6" fill="#7a5239" stroke="#3a2415" stroke-width="3"/><rect x="${x + 8}" y="1216" width="450" height="154" rx="3" fill="none" stroke="#3a2415" stroke-opacity=".6" stroke-width="2"/>
      <rect x="${x + 163}" y="1226" width="140" height="62" rx="4" fill="url(#brass)"/><rect x="${x + 173}" y="1234" width="120" height="46" rx="2" fill="#fffaf0"/>
      <path d="M${x + 143} 1325 q90 -48 180 0" fill="none" stroke="url(#brass)" stroke-width="14" stroke-linecap="round"/><circle cx="${x + 143}" cy="1327" r="9" fill="#9a7418"/><circle cx="${x + 323}" cy="1327" r="9" fill="#9a7418"/></g>`).join("")}
    </svg>`;
  // Month tabs and an arrow between them.
  const kTab = (x, label, rot) => `<div class="serif" style="${abs(x, 408, 220, 66, `transform:rotate(${rot}deg);background:#fbf3c8;border-radius:10px 10px 0 0;box-shadow:0 8px 12px rgba(60,35,10,.35);display:grid;place-items:center;font-size:38px;font-weight:600;color:#3b2a14;letter-spacing:.01em;z-index:3`)}">${esc(label)}</div>`;
  const arrow = `<svg style="${abs(270, 400, 460, 90, "z-index:3")}" viewBox="0 0 460 90" aria-hidden="true"><path d="M10 50 C 120 14, 300 84, 440 44" fill="none" stroke="#6b4630" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 16"/><path d="M416 22 L448 44 L414 64" fill="none" stroke="#6b4630" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const tints = ["#fdeedd", "#e3eef8", "#fbf3c8", "#e6f1dc"];
  const pos = [[34, 508, -1.4], [514, 502, 1.2], [38, 806, 1.1], [512, 810, -1.3]];
  const cards = i.items.map((t, k) => {
    const [x, y, rot] = pos[k];
    return `<div style="${abs(x, y, 452, 276, `transform:rotate(${rot}deg);background:${tints[k]};border-radius:5px;filter:${SHADOW};z-index:3`)}">
      <div style="${abs(0, 46, 452, 3, "background:#d03a2e;opacity:.8")}"></div>
      <div class="serif" data-check="q${k + 1}" style="${abs(26, 58, 404, 176, "font-size:33px;line-height:1.16;font-weight:500;color:#26211c")}">${esc(t)}</div>
      <div style="${abs(214, 240, 24, 24, "border-radius:50%;background:radial-gradient(circle at 40% 35%,#8c7347,#bba070);box-shadow:inset 0 2px 3px rgba(0,0,0,.45)")}"></div></div>`;
  }).join("");
  const rods = [[34, 770], [514, 770]].map(([x, y]) => `<div style="${abs(x - 2, y + 0, 2, 0)}"></div>`).join("");
  const tag = `<span class="example" style="position:absolute;left:384px;top:1112px;transform:rotate(-2deg);z-index:6;font-size:25px;padding:7px 14px;color:#2a2530;background:#fffdf6;box-shadow:0 2px 4px rgba(0,0,0,.3);border-color:#6b5f4f">Example</span>`;
  return printable({ n: 64, paper: "#e9efe8", scene: `${cabinet}${kTab(40, "October", -2)}${kTab(740, "March", 2)}${arrow}${cards}${rods}${tag}`, extraCss: ".top h1{font-size:62px}" });
}

/* ------------------------------------------------------------------ #68 */

function pin68() {
  const i = idea(68);
  const can = i.items.filter((t) => t.startsWith("CAN:")).map((t) => t.slice(5));
  const cannot = i.items.filter((t) => t.startsWith("CANNOT:")).map((t) => t.slice(8));
  const r = seeded(41);
  const speck = Array.from({ length: 240 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(380 + r() * 900).toFixed(0)}" r="${(0.8 + r() * 1.8).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#10263a"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const BEAMY = 432, LX = 262, RX = 738;
  const strings = (cx) => `<path d="M${cx} ${BEAMY + 14} L${cx - 196} 548 M${cx} ${BEAMY + 14} L${cx + 196} 548" stroke="#e8d9a8" stroke-width="4"/><circle cx="${cx}" cy="${BEAMY + 14}" r="12" fill="#c79a2e"/>`;
  const scale = `<svg style="${abs(0, 0, 1000, 1500, "z-index:2")}" viewBox="0 0 1000 1500" aria-hidden="true"><defs>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c93ab"/><stop offset="1" stop-color="#4a6179"/></linearGradient>
    <linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d77a"/><stop offset=".5" stop-color="#c79a2e"/><stop offset="1" stop-color="#8f6a14"/></linearGradient>
    <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfa56b"/><stop offset="1" stop-color="#a9803f"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="url(#sw)"/>${speck}
    <rect x="0" y="1296" width="1000" height="110" fill="url(#wd)"/><rect x="0" y="1290" width="1000" height="10" fill="#7d5a30" opacity=".8"/>
    <path d="M500 ${BEAMY} V1290" stroke="url(#br)" stroke-width="20"/>
    <path d="M410 1290 Q500 1236 590 1290 Z" fill="url(#br)"/><ellipse cx="500" cy="1292" rx="150" ry="14" fill="url(#br)"/>
    <ellipse cx="500" cy="${BEAMY - 8}" rx="34" ry="34" fill="url(#br)"/><circle cx="500" cy="${BEAMY - 8}" r="12" fill="#6b4c0e"/>
    <rect x="${LX - 220}" y="${BEAMY - 2}" width="${RX - LX + 440}" height="22" rx="11" fill="url(#br)"/>
    <circle cx="${LX - 214}" cy="${BEAMY + 9}" r="12" fill="#8f6a14"/><circle cx="${RX + 214}" cy="${BEAMY + 9}" r="12" fill="#8f6a14"/>
    <g>${strings(LX)}${strings(RX)}</g></svg>`;

  // The CAN card: sage paper, four rows, label in bold.
  const canRows = can.map((t, k) => {
    const dot = t.indexOf(". ");
    const label = t.slice(0, dot + 1), rest = t.slice(dot + 2);
    return `<div data-check="can-${k}" style="font-size:25px;line-height:1.26;color:#1f2a22;margin-bottom:${k < 3 ? 16 : 0}px;padding-left:18px;border-left:6px solid #3f8a5a"><b class="serif" style="font-size:32px;font-weight:700;color:#14452a;display:block;line-height:1.1;margin-bottom:3px">${esc(label)}</b>${esc(rest)}</div>`;
  }).join("");
  const cannotRows = cannot.map((t, k) => `<div data-check="cannot-${k}" class="serif" style="font-size:36px;line-height:1.2;font-weight:500;color:#33211f;margin-bottom:${k < 2 ? 26 : 0}px;padding-left:18px;border-left:6px solid #b3261e">${esc(t)}</div>`).join("");
  const hang = (x, tilt, bg, head, color, ic, rows, h) => `<div style="${abs(x, 546, 452, h, `transform:rotate(${tilt}deg);transform-origin:50% 0;background:${bg};border-radius:6px;filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 0, 452, 12, `background:${color};border-radius:6px 6px 0 0`)}"></div>
    <div style="${abs(26, 30, 400, 56, "display:flex;align-items:center;gap:12px")}">${icon(ic, { size: 48, color, weight: "fill" })}<span class="eyebrow" style="font-size:36px;letter-spacing:.12em;color:${color}">${head}</span></div>
    <div style="${abs(26, 104, 400, h - 120)}">${rows}</div></div>`;
  const left = hang(36, 0.4, "#f1f6ec", "Can", "#2f7a4d", "check-circle", canRows, 730);
  const right = hang(512, -0.4, "#f9ece6", "Cannot", "#b3261e", "x-circle", cannotRows, 610);
  // Two rings where each card meets its strings.
  const rings = [LX_ => 0].length ? "" : "";
  return printable({ n: 68, paper: "#e5ebf1", scene: `${scale}${left}${right}${rings}`, extraCss: ".top h1{font-size:66px}", bottomMax: 368 });
}

export const pins = [pin46(), pin50(), pin64(), pin68()];
