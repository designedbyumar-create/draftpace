/**
 * Batch 2, states A: three guide pins that each show ONE state exactly as
 * the product's own data has it (src/lib/homeschoolStateRequirements.ts):
 * its level, its note word for word, the checklist ticked from the data,
 * and the line "Laws change. Confirm with your state before relying on
 * this." The labels of the four ticks are the printed record's own
 * (src/products/homeschooling-companion/book.ts). Nothing is typed here
 * that the data does not hold: the module reads the data, and throws if
 * the idea bank, the data or the book's labels disagree.
 *
 *   #76 Texas     a big state tile map on a cork board, Texas lit, its note on an index card
 *   #78 Florida   a terracotta clipboard on gingham: the note, four boxes, the level stamp
 *   #83 New York  a manila folder pulled from a steel file drawer, its note typed on a card
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea } from "../kit/bank.mjs";
import { esc } from "../../v3/kit.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const DATA = await import(pathToFileURL(path.join(ROOT, "src/lib/homeschoolStateRequirements.ts")).href);
const BOOK = fs.readFileSync(path.join(ROOT, "src/products/homeschooling-companion/book.ts"), "utf8");

const CAUTION = "Laws change. Confirm with your state before relying on this.";

/** The four ticks: the checklist key in the data, and the printed record's own label for it. */
const TICKS = [
  ["log", "A log or record of instruction"],
  ["attendanceOrHours", "Attendance or hours"],
  ["workSamples", "Samples of work or a portfolio"],
  ["testOrEvaluation", "A test score or evaluation"],
];
for (const [, label] of TICKS) if (!BOOK.includes(`"${label}"`)) throw new Error(`"${label}" is not a label in book.ts`);

/** One state from the data, checked against the idea bank's own items so a pin can never drift from either. */
function stateFor(n, name) {
  const row = DATA.getHomeschoolStateRequirement(name);
  if (!row) throw new Error(`no ${name} in the data`);
  const items = idea(n).items;
  if (items[0] !== `${row.state} - ${row.level}`) throw new Error(`#${n}: item 0 is not "${row.state} - ${row.level}"`);
  if (items[1] !== row.note) throw new Error(`#${n}: item 1 is not the data's note`);
  if (!items.includes(CAUTION)) throw new Error(`#${n}: no caution line`);
  const rows = row.checklist ? TICKS.map(([key, label]) => ({ label, on: row.checklist[key] })) : [];
  if (row.checklist) {
    rows.forEach((r, k) => { if (items[2 + k] !== `[${r.on ? "x" : " "}] ${r.label}`) throw new Error(`#${n}: tick ${k} disagrees with the data`); });
    for (const extra of row.checklist.otherNotes) if (!items.includes(extra)) throw new Error(`#${n}: "${extra}" missing from the items`);
  } else if (items.some((t) => t.startsWith("["))) throw new Error(`#${n}: ticks drawn for a state with no checklist`);
  return { ...row, rows };
}

const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/** A hand-drawn ink tick in a box of `s` px, overshooting the top right as a real tick does. */
const tick = (s, color = "#4a2f55") =>
  `<svg viewBox="0 0 50 50" style="position:absolute;left:${-s * 0.04}px;top:${-s * 0.22}px;width:${s * 1.1}px;height:${s * 1.1}px;overflow:visible" aria-hidden="true"><path d="M7 27 C 11 31, 15 36, 19 43 C 26 28, 36 14, 48 3" fill="none" stroke="${color}" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** The checklist box: an open square, ticked or not. */
const box = (on, s, { color = "#4a2f55", line = "#6b5a70", bg = "#fffdf8" } = {}) =>
  `<span style="position:relative;display:block;flex:none;width:${s}px;height:${s}px;border:3px solid ${line};border-radius:6px;background:${bg}">${on ? tick(s, color) : ""}</span>`;

/* ============================================================ #76 Texas */

/** The standard US tile grid, [column, row] for the 50 states and DC (same geometry as v3's tile map). */
const GRID = {
  AK: [0, 0], ME: [10, 0],
  VT: [9, 1], NH: [10, 1],
  WA: [0, 2], ID: [1, 2], MT: [2, 2], ND: [3, 2], MN: [4, 2], IL: [5, 2], WI: [6, 2], MI: [7, 2], NY: [8, 2], RI: [9, 2], MA: [10, 2],
  OR: [0, 3], NV: [1, 3], WY: [2, 3], SD: [3, 3], IA: [4, 3], IN: [5, 3], OH: [6, 3], PA: [7, 3], NJ: [8, 3], CT: [9, 3],
  CA: [0, 4], UT: [1, 4], CO: [2, 4], NE: [3, 4], MO: [4, 4], KY: [5, 4], WV: [6, 4], VA: [7, 4], MD: [8, 4], DE: [9, 4],
  AZ: [1, 5], NM: [2, 5], KS: [3, 5], AR: [4, 5], TN: [5, 5], NC: [6, 5], SC: [7, 5], DC: [8, 5],
  OK: [3, 6], LA: [4, 6], MS: [5, 6], AL: [6, 6], GA: [7, 6],
  HI: [0, 7], TX: [3, 7], FL: [8, 7],
};
const ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME",
  Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

function texas() {
  const n = 76;
  const st = stateFor(n, "Texas");
  if (DATA.HOMESCHOOL_STATE_REQUIREMENTS.length !== 51) throw new Error("expected 51 jurisdictions");
  const T = 76, G = 8, MX = 42, MY = SCENE_TOP + 34;
  const tiles = DATA.HOMESCHOOL_STATE_REQUIREMENTS.map((r) => {
    const a = ABBR[r.state];
    if (!a || !GRID[a]) throw new Error(`no tile for ${r.state}`);
    return { a, lit: r.state === st.state, c: GRID[a][0], r: GRID[a][1] };
  });
  const tile = ({ a, lit, c, r }) => {
    const x = MX + c * (T + G), y = MY + r * (T + G);
    if (lit) {
      const S = 1.38, cx = x + T / 2, cy = y + T / 2, s = T * S;
      return `<div data-check="lit tile" style="${at(cx - s / 2, cy - s / 2, s, s, "border-radius:15px;background:linear-gradient(160deg,#7a4f87,#4a2f55);border:3px solid #fff4d6;box-shadow:0 0 0 7px rgba(255,214,120,.55),0 0 46px 16px rgba(255,205,110,.65),0 14px 18px rgba(40,20,5,.5);display:grid;place-items:center;z-index:3")}"><span style="font:700 46px 'Plex';letter-spacing:.02em;color:#fff">${a}</span></div>`;
    }
    return `<div style="${at(x, y, T, T, "border-radius:11px;background:linear-gradient(#e2d2b6,#d3bf9d);border:2px solid rgba(255,244,222,.55);box-shadow:0 5px 7px rgba(60,35,10,.38);display:grid;place-items:center;opacity:.93")}"><span style="font:600 24px 'Plex';letter-spacing:.03em;color:#6d5b44">${a}</span></div>`;
  };
  const tx = tiles.find((t) => t.lit);
  const txX = MX + tx.c * (T + G) + T / 2, txY = MY + tx.r * (T + G) + T / 2;

  const CARD_X = 52, CARD_Y = 1098, CARD_W = 640, CARD_H = 232;
  const pinX = CARD_X + 300, pinY = CARD_Y + 8;
  const scene = `
  <div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 28% 20%,#e0b585,#c79a66 55%,#a97d4d);overflow:hidden")}">
    <svg viewBox="0 0 1000 1128" style="position:absolute;inset:0;width:1000px;height:1128px" aria-hidden="true">
      <defs><pattern id="cork" width="46" height="46" patternUnits="userSpaceOnUse"><circle cx="6" cy="9" r="2.4" fill="#a67a49"/><circle cx="26" cy="22" r="1.9" fill="#ecc9a0"/><circle cx="14" cy="38" r="2.2" fill="#a67a49"/><circle cx="38" cy="6" r="1.6" fill="#8f6639"/><circle cx="40" cy="33" r="2.6" fill="#d9b185"/><circle cx="20" cy="4" r="1.4" fill="#ecc9a0"/></pattern></defs>
      <rect width="1000" height="1128" fill="url(#cork)"/>
    </svg>
  </div>
  <div style="${at(0, SCENE_TOP, 20, 1128, "background:linear-gradient(90deg,#7b5230,#a8743f);box-shadow:4px 0 10px rgba(40,20,5,.4)")}"></div>
  <div style="${at(980, SCENE_TOP, 20, 1128, "background:linear-gradient(270deg,#7b5230,#a8743f);box-shadow:-4px 0 10px rgba(40,20,5,.4)")}"></div>
  ${tiles.filter((t) => !t.lit).map(tile).join("")}
  <svg viewBox="0 0 1000 1500" style="position:absolute;inset:0;width:1000px;height:1500px;z-index:4;pointer-events:none" aria-hidden="true">
    <path d="M${txX} ${txY + 60} C ${txX - 6} ${txY + 80}, ${pinX + 8} ${pinY - 24}, ${pinX} ${pinY}" fill="none" stroke="#b3261e" stroke-width="5" stroke-linecap="round"/>
  </svg>
  ${tile(tx)}
  <div data-check="index card" style="${at(CARD_X, CARD_Y, CARD_W, CARD_H, "z-index:5;transform:rotate(-1.8deg);background:#fffdf6;box-shadow:0 3px 4px rgba(40,20,5,.3),0 18px 26px -6px rgba(40,20,5,.5);overflow:hidden")}">
    <div style="position:absolute;left:0;right:0;top:50px;height:3px;background:#d8736b"></div>
    ${[0, 1, 2].map((k) => `<div style="position:absolute;left:0;right:0;top:${122 + k * 54}px;height:2px;background:#bcd0e0"></div>`).join("")}
    <div style="position:absolute;left:30px;top:6px;font:500 46px/1 'Newsreader',serif;color:#1d1d20">${esc(st.state)}</div>
    <div style="position:absolute;right:28px;top:8px;padding:2px 20px 4px;border-radius:999px;background:#6b4a72;color:#fff;font:600 32px/1.2 'Plex'">${esc(st.level)}</div>
    <div style="position:absolute;left:30px;right:26px;top:66px;font:600 50px/54px 'Hand',cursive;color:#27345a">${esc(st.note)}</div>
  </div>
  <svg viewBox="0 0 1000 1500" style="position:absolute;inset:0;width:1000px;height:1500px;z-index:6;pointer-events:none" aria-hidden="true">
    <g transform="translate(${pinX} ${pinY})"><circle cx="4" cy="7" r="15" fill="#3b2f1e" opacity=".3"/><circle r="15" fill="#b3261e"/><circle cx="-5" cy="-5" r="5" fill="#fff" opacity=".6"/></g>
    <g transform="translate(${txX + 22} ${txY - 46})"><circle cx="4" cy="6" r="13" fill="#3b2f1e" opacity=".3"/><circle r="13" fill="#e0a95a"/><circle cx="-4" cy="-4" r="4" fill="#fff" opacity=".6"/></g>
  </svg>
  <div data-check="caution slip" style="${at(722, 1118, 244, 188, "z-index:5;transform:rotate(2.4deg);background:#f6e3a1;box-shadow:0 14px 20px -6px rgba(40,20,5,.5);padding:22px 18px 14px;font:600 26px/1.28 'Plex';color:#2a2418;overflow:hidden")}">${esc(CAUTION)}</div>
  <div style="${at(790, 1102, 110, 34, "z-index:6;transform:rotate(-5deg);background:rgba(142,111,149,.75);box-shadow:0 2px 4px rgba(40,20,5,.25)")}"></div>`;
  return printable({ n, scene, paper: "#efe7da" });
}

/* ============================================================ #78 Florida */

function florida() {
  const n = 78;
  const st = stateFor(n, "Florida");
  const rows = st.rows.map((r, k) => `
    <div style="display:flex;align-items:center;gap:26px;height:96px;border-bottom:2px solid #e3dccd">
      ${box(r.on, 48, { color: "#4a2f55" })}
      <span style="font:500 32px/1.15 'Plex';color:#1d1d20">${esc(r.label)}</span>
    </div>`).join("");
  const BX = 56, BY = SCENE_TOP + 44, BW = 700, BH = 910;
  const scene = `
  <div style="${at(0, SCENE_TOP, 1000, 1128, "background:linear-gradient(90deg,rgba(125,152,116,.62) 50%,transparent 50%),linear-gradient(rgba(125,152,116,.62) 50%,transparent 50%),#f7f1e4;background-size:76px 76px;background-position:10px 22px")}"></div>
  <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 24% 14%,rgba(255,255,255,.28),transparent 55%),radial-gradient(ellipse at 100% 100%,rgba(40,50,30,.34),transparent 62%)")}"></div>
  <div style="${at(BX, BY, BW, BH, "transform:rotate(-1.8deg)")}">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#c55f44,#a84a33);border-radius:22px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 28px 46px rgba(40,20,5,.45)"></div>
    <div style="position:absolute;left:${BW / 2 - 96}px;top:-26px;width:192px;height:78px;border-radius:14px;background:linear-gradient(#f0d58f,#b88f33);box-shadow:0 6px 10px rgba(0,0,0,.35)"></div>
    <div style="position:absolute;left:${BW / 2 - 62}px;top:-42px;width:124px;height:36px;border-radius:12px 12px 0 0;background:linear-gradient(#f8e3a8,#c9a043);box-shadow:0 3px 6px rgba(0,0,0,.25)"></div>
    <div data-check="checklist" style="${at(36, 76, BW - 72, BH - 106, "background:#fffdf8;box-shadow:0 2px 3px rgba(40,20,5,.25);overflow:hidden;padding:30px 38px 0")}">
      <div style="position:absolute;left:0;right:0;top:0;height:7px;background:#6b4a72"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;height:92px">
        <div style="font:500 74px/1 'Newsreader',serif;color:#1d1d20;letter-spacing:-.01em">${esc(st.state)}</div>
        <div style="transform:rotate(-9deg);padding:2px 22px 4px;border:5px double #6b4a72;border-radius:10px;color:#6b4a72;font:700 54px/1.1 'Plex';letter-spacing:.06em;opacity:.92">${esc(st.level)}</div>
      </div>
      <div style="height:3px;background:#1d1d20;margin:12px 0 18px;opacity:.8"></div>
      <div style="font:italic 400 36px/1.26 'Newsreader',serif;color:#3a342c;margin-bottom:22px">${esc(st.note)}</div>
      ${rows}
      <div style="font:400 26px/1.3 'Plex';color:#4b453d;margin-top:26px">${esc(CAUTION)}</div>
    </div>
  </div>
  <svg viewBox="0 0 1000 1500" style="position:absolute;inset:0;width:1000px;height:1500px;pointer-events:none" aria-hidden="true">
    <defs><filter id="fs"><feGaussianBlur stdDeviation="7"/></filter></defs>
    <ellipse cx="880" cy="1176" rx="96" ry="92" fill="#2a3a22" opacity=".4" filter="url(#fs)"/>
    <g transform="translate(862 1150)"><path d="M70 -12 C 112 -16 114 54 70 56" fill="none" stroke="#2e5d70" stroke-width="20" stroke-linecap="round"/><circle r="84" fill="#3b7387"/><circle r="84" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/><circle r="68" fill="#e9e1d4"/><circle r="60" fill="#6b4226"/><ellipse cx="-16" cy="-18" rx="22" ry="12" fill="#fff" opacity=".14"/></g>
  </svg>
  <svg viewBox="0 0 1000 1500" style="position:absolute;inset:0;width:1000px;height:1500px;pointer-events:none;filter:drop-shadow(0 8px 6px rgba(40,20,5,.35))" aria-hidden="true">
    <g transform="translate(884 470) rotate(84)"><rect x="46" y="3" width="360" height="24" rx="2" fill="#6f9a5f"/><rect x="46" y="3" width="360" height="7" fill="#9bc28a" opacity=".8"/><rect x="46" y="20" width="360" height="7" fill="#3e6a3a" opacity=".55"/><rect x="398" y="3" width="16" height="24" fill="#b9b9c0"/><rect x="414" y="3" width="26" height="24" rx="8" fill="#e58b8b"/><path d="M46 3 L2 15 L46 27 Z" fill="#e9c9a0"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></g>
  </svg>`;
  return printable({ n, scene, paper: "#e5ebdb" });
}

/* ============================================================ #83 New York */

function newYork() {
  const n = 83;
  const st = stateFor(n, "New York");
  const extra = st.checklist.otherNotes;
  if (extra.length !== 1) throw new Error("expected one extra note for New York");
  const FX = 70, FW = 860, FTOP = 492, DRAWER = 1224;
  const back = [
    ["#98b08c", "#85a07a", 468, 440, 330],
    ["#dca95a", "#c8943f", 452, 600, 320],
    ["#cf8c7e", "#bb7566", 438, 770, 160],
  ].map(([c1, c2, top, tx, tw]) => `
    <div style="${at(FX, top, FW, DRAWER - top + 40, `background:linear-gradient(${c1},${c2});border-radius:10px 10px 0 0;box-shadow:0 -3px 8px rgba(0,0,0,.28)`)}"></div>
    <div style="${at(tx, top - 42, tw, 46, `background:linear-gradient(${c1},${c1});border-radius:12px 12px 0 0;box-shadow:0 -3px 6px rgba(0,0,0,.22)`)}"></div>`).join("");
  const rows = st.rows.map((r) => `
    <div style="display:flex;align-items:center;gap:26px;height:66px;border-bottom:2px dotted #b8b3a6">
      ${box(r.on, 40, { color: "#3d2750", line: "#4b4b50", bg: "#fff" })}
      <span style="font:500 32px/1.1 'Plex';color:#1d1d20">${esc(r.label)}</span>
    </div>`).join("");
  const scene = `
  <div style="${at(0, SCENE_TOP, 1000, 1128, "background:linear-gradient(#60778f,#4a6076)")}"></div>
  <div style="${at(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.2),transparent 60%),radial-gradient(ellipse at 50% 100%,rgba(10,20,34,.45),transparent 70%)")}"></div>
  ${back}
  <div style="${at(FX, FTOP, FW, DRAWER - FTOP + 40, "background:linear-gradient(180deg,#ecd29b,#dcbd80);border-radius:10px 10px 0 0;box-shadow:0 -4px 12px rgba(0,0,0,.34),inset 0 2px 0 rgba(255,255,255,.55)")}"></div>
  <div data-check="folder tab" style="${at(FX + 22, FTOP - 54, 360, 62, "background:linear-gradient(#efd9a6,#ecd29b);border-radius:14px 14px 0 0;box-shadow:0 -4px 8px rgba(0,0,0,.28);display:flex;align-items:center;padding:0 24px")}"><span style="font:600 38px/1 'Plex Mono',monospace;color:#2a2418;white-space:nowrap">${esc(st.state)}</span></div>
  <div style="${at(FX + 3, FTOP + 2, 28, DRAWER - FTOP, "background:linear-gradient(90deg,rgba(120,85,30,.22),transparent)")}"></div>
  <div style="${at(FX + FW - 31, FTOP + 2, 28, DRAWER - FTOP, "background:linear-gradient(270deg,rgba(120,85,30,.22),transparent)")}"></div>
  <div data-check="note card" style="${at(104, 536, 548, 252, "transform:rotate(-1.5deg);background:#fffefa;box-shadow:0 2px 3px rgba(60,40,10,.3),0 14px 20px -6px rgba(60,40,10,.5);overflow:hidden")}">
    <div style="position:absolute;left:0;right:0;top:46px;height:3px;background:#d8736b"></div>
    ${[0, 1, 2, 3].map((k) => `<div style="position:absolute;left:0;right:0;top:${100 + k * 40}px;height:2px;background:#bcd0e0"></div>`).join("")}
    <div style="position:absolute;left:26px;right:22px;top:58px;font:500 29px/40px 'Plex Mono',monospace;color:#1d1d20;letter-spacing:-.01em">${esc(st.note)}</div>
  </div>
  <div style="${at(560, 520, 70, 28, "transform:rotate(-8deg);background:rgba(142,111,149,.8);box-shadow:0 2px 3px rgba(40,20,5,.3)")}"></div>
  <div style="${at(746, 524, 168, 168, "transform:rotate(9deg);border:7px solid #6b4a72;border-radius:50%;display:grid;place-items:center;color:#6b4a72;opacity:.9")}"><div style="position:absolute;inset:8px;border:2.5px solid #6b4a72;border-radius:50%"></div><span style="font:700 56px/1 'Plex';letter-spacing:.02em;">${esc(st.level)}</span></div>
  <div data-check="margin note" style="${at(668, 706, 252, 200, "transform:rotate(3deg);background:#f7e58f;box-shadow:0 14px 18px -6px rgba(60,40,10,.5);padding:20px 22px;font:600 36px/1.05 'Hand',cursive;color:#27345a;overflow:hidden")}">${esc(extra[0])}</div>
  <div data-check="checklist" style="${at(104, 902, 726, 296, "transform:rotate(.6deg);background:#fffefa;box-shadow:0 2px 3px rgba(60,40,10,.3),0 12px 18px -6px rgba(60,40,10,.45);padding:18px 34px 0;overflow:hidden")}">
    ${rows}
  </div>
  <div style="${at(30, DRAWER - 20, 940, 40, "background:linear-gradient(#10161d,#2a333d);border-radius:6px 6px 0 0")}"></div>
  <div style="${at(30, DRAWER, 940, 400, "background:linear-gradient(#a9b4bf,#8794a1 40%,#77838f);border-top:5px solid #d4dbe2;box-shadow:0 -10px 18px rgba(0,0,0,.4)")}"></div>
  <div style="${at(150, DRAWER + 14, 700, 14, "background:linear-gradient(#2d3640,#4b5661);border-radius:7px;box-shadow:0 1px 0 rgba(255,255,255,.4)")}"></div>
  <div style="${at(80, DRAWER + 40, 840, 72, "border-radius:6px;background:linear-gradient(#e8d29a,#b9954a);box-shadow:0 4px 6px rgba(0,0,0,.4);padding:6px")}"><div data-check="caution label" style="width:100%;height:100%;background:#fffdf2;display:flex;align-items:center;justify-content:center;font:500 26px/1.15 'Plex';color:#1d1d20;white-space:nowrap">${esc(CAUTION)}</div></div>`;
  return printable({ n, scene, paper: "#e7e2ee" });
}

export const pins = [texas(), florida(), newYork()];
