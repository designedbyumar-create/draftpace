/**
 * Batch 2, level overviews of the state record keeping series (ideas 57, 70,
 * 72, 74): None 8 states, Low 15, Moderate 19, High 9. Every state name and
 * count is read from src/lib/homeschoolStateRequirements.ts, the level's one
 * line from the guide's "What the four levels mean"; the module throws if the
 * data, the guide and the bank's headline numbers disagree.
 *
 * Four different presentations, four different tables:
 *   57 None      the 51-tile map on an oak desk, the 8 lit, the rest ghosted
 *   70 Low       15 luggage tags pinned to a cork board
 *   72 Moderate  19 folders in two stacks, one tab each, on slate-blue linen
 *   74 High      a ring binder with nine tabbed dividers, each ticked, on sage felt
 */
import fs from "node:fs";
import path from "node:path";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, binderClip } from "../kit/paper.mjs";
import { idea, C } from "../kit/bank.mjs";
import { esc } from "../../v3/kit.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const CAUTION = "Laws change. Confirm with your state before relying on this.";
const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/* ---------------------------------------------------------------- the data */

const ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME",
  Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

/** The standard US tile grid: [column, row] for each of the 50 states and DC. */
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

const rows = [...fs.readFileSync(path.join(ROOT, "src/lib/homeschoolStateRequirements.ts"), "utf8").matchAll(/state:\s*"([^"]+)",\s*level:\s*"(None|Low|Moderate|High)"/g)]
  .map(([, state, level]) => ({ state, level, abbr: ABBR[state] }));
if (rows.length !== 51) throw new Error(`b2-levels: expected 51 jurisdictions, read ${rows.length}`);
for (const r of rows) if (!r.abbr || !GRID[r.abbr]) throw new Error(`b2-levels: no tile for ${r.state}`);

const guideSrc = fs.readFileSync(path.join(ROOT, "src/content/guides.ts"), "utf8");
const MEANING = {};
for (const [, level, count, meaning] of guideSrc.matchAll(/"(None|Low|Moderate|High), (\d+) states: ([^"]+)"/g)) MEANING[level] = { count: Number(count), text: meaning };
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** The level's states from the data, checked against the guide, the bank's headline and the bank's own item list. */
function level(n, name, expected) {
  const i = idea(n);
  const list = rows.filter((r) => r.level === name).map((r) => r.state);
  if (list.length !== expected) throw new Error(`b2-levels: ${name} has ${list.length} states in the data, expected ${expected}`);
  if (MEANING[name]?.count !== expected) throw new Error(`b2-levels: the guide says ${MEANING[name]?.count} for ${name}, expected ${expected}`);
  if (!new RegExp(`\\b${expected}\\b`).test(i.headline)) throw new Error(`b2-levels: #${n} headline does not carry ${expected}`);
  const bank = i.items.filter((x) => x !== CAUTION);
  if (JSON.stringify([...bank].sort()) !== JSON.stringify([...list].sort())) throw new Error(`b2-levels: #${n} bank items differ from the data's ${name} states`);
  if (!i.items.includes(CAUTION)) throw new Error(`b2-levels: #${n} lost its caution line`);
  return { states: list, label: `${name}, ${expected} states`, line: cap(MEANING[name].text), count: expected };
}

const NONE = level(57, "None", 8);
const LOW = level(70, "Low", 15);
const MOD = level(72, "Moderate", 19);
const HIGH = level(74, "High", 9);
const PARA = "Read None as low paperwork, not as no rules.";
if (!guideSrc.includes(PARA)) throw new Error("b2-levels: the guide no longer carries the 'Read None' sentence");

/* ---------------------------------------------------------------- #57 None: the tile map */

function pin57() {
  const T = 76, G = 7;
  const mapW = 11 * (T + G) - G, mapH = 8 * (T + G) - G;
  const lit = new Set(NONE.states.map((s) => ABBR[s]));
  const tiles = rows.map(({ abbr }) => {
    const [c, r] = GRID[abbr];
    const x = c * (T + G), y = r * (T + G);
    if (lit.has(abbr)) {
      return `<g transform="translate(${x} ${y})"><rect x="3" y="7" width="${T - 3}" height="${T - 3}" rx="12" fill="#2a1830" opacity=".28"/><rect x="1.5" y="1.5" width="${T - 3}" height="${T - 3}" rx="12" fill="${C.plum}" stroke="#4a3350" stroke-width="3"/><rect x="6" y="6" width="${T - 12}" height="14" rx="8" fill="#fff" opacity=".13"/><text x="${T / 2}" y="${T / 2 + 10}" text-anchor="middle" font-family="Plex" font-weight="700" font-size="28" letter-spacing=".5" fill="#fff">${abbr}</text></g>`;
    }
    return `<g transform="translate(${x} ${y})"><rect x="1.5" y="1.5" width="${T - 3}" height="${T - 3}" rx="12" fill="#f3eee4" stroke="#e4dccd" stroke-width="2.5"/><text x="${T / 2}" y="${T / 2 + 9}" text-anchor="middle" font-family="Plex" font-weight="500" font-size="24" fill="#cdc4b4">${abbr}</text></g>`;
  }).join("");
  const mapPx = 880, mapHpx = Math.round((mapPx * (mapH + 8)) / (mapW + 8));
  const chips = NONE.states.map((s) => `<span class="chip" data-check="state name">${esc(s)}</span>`).join("");
  const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, seed: 7 })}
  <div class="s57" style="${abs(46, 392, 908, 944)}">
    <svg class="map57" data-check="map" viewBox="-4 -4 ${mapW + 8} ${mapH + 8}" style="${abs(14, 14, mapPx, mapHpx)}" aria-label="US states, the ${NONE.count} None states lit">${tiles}</svg>
    <div class="big57" style="${abs(110, 16, 120, 165)}" aria-hidden="true">${NONE.count}</div>
    <div class="lab57" data-check="level label" style="${abs(250, 40, 470, 110)}">${esc(NONE.label)}</div>
    <div class="chips" style="${abs(30, 706, 848, 130)}">${chips}</div>
    <p class="para57" data-check="guide line" style="${abs(30, 852, 760, 44)}">${esc(PARA)}</p>
    <p class="caut57" data-check="caution" style="${abs(30, 904, 640, 32)}">${esc(CAUTION)}</p>
  </div>
  ${binderClip({ x: 848, y: 1228, rot: -14, size: 120 })}`;
  const extraCss = `
  .s57{background:#fbfaf7;border-radius:5px;transform:rotate(-.9deg);box-shadow:0 2px 3px rgba(40,20,5,.3),0 24px 46px rgba(40,20,5,.45)}
  .big57{font:500 190px/1 "Newsreader",serif;color:${C.plum};letter-spacing:-.04em;text-align:center}
  .lab57{font:500 44px/1.1 "Newsreader",serif;color:${C.plumDeep};display:flex;align-items:center}
  .chips{display:grid;grid-template-columns:repeat(4,1fr);gap:14px 14px;align-content:start}
  .chip{display:flex;align-items:center;justify-content:center;height:58px;border:2.5px solid ${C.plum};border-radius:12px;color:${C.plumDeep};font:600 26px "Plex";background:#f6eff6}
  .para57{font:italic 400 33px/1.2 "Newsreader",serif;color:#3d3640}
  .caut57{font-size:22px;color:#6a6258;line-height:32px}`;
  return printable({ n: 57, scene, extraCss });
}

/* ---------------------------------------------------------------- #70 Low: luggage tags on cork */

function corkBoard({ top, height }) {
  let s = 5;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const flecks = Array.from({ length: 900 }, () => {
    const dark = rnd() > 0.45;
    return `<ellipse cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * height).toFixed(0)}" rx="${(1.2 + rnd() * 3.6).toFixed(1)}" ry="${(1 + rnd() * 2.4).toFixed(1)}" fill="${dark ? "#7d5430" : "#e6c28c"}" opacity="${(0.18 + rnd() * 0.3).toFixed(2)}" transform="rotate(${(rnd() * 180).toFixed(0)} ${(rnd() * 1000).toFixed(0)} 0)"/>`;
  }).join("");
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><radialGradient id="cg" cx="30%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#3a220c" stop-opacity=".3"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="#c89b63"/>${flecks}<rect width="1000" height="${height}" fill="url(#cg)"/>
    <rect x="0" y="0" width="22" height="${height}" fill="#8a5d30"/><rect x="978" y="0" width="22" height="${height}" fill="#7a5028"/><rect x="0" y="${height - 24}" width="1000" height="24" fill="#6e4722"/>
    <rect x="22" y="0" width="5" height="${height - 24}" fill="#000" opacity=".25"/><rect x="973" y="0" width="5" height="${height - 24}" fill="#000" opacity=".2"/><rect x="22" y="${height - 29}" width="956" height="5" fill="#000" opacity=".25"/></svg>`;
}

function pushpin(x, y, color = "#c4573e") {
  return `<svg style="${abs(x - 18, y - 18, 40, 44, "filter:drop-shadow(5px 8px 4px rgba(40,20,5,.4))")}" viewBox="0 0 40 44" aria-hidden="true"><ellipse cx="22" cy="30" rx="11" ry="5" fill="#000" opacity=".15"/><circle cx="18" cy="18" r="14" fill="${color}"/><circle cx="18" cy="18" r="14" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/><ellipse cx="13" cy="12" rx="6" ry="4" fill="#fff" opacity=".4" transform="rotate(-30 13 12)"/></svg>`;
}

function pin70() {
  const W = 280, H = 114;
  const manila = ["#ecd9b0", "#fbf6e8", "#f1cf8c", "#d3e0c9", "#ecd9b0", "#f4dcd2"];
  const ring = ["#c4573e", "#6b4a82", "#4f7a8a", "#c4573e", "#e0a95a", "#6b4a82"];
  const tags = LOW.states.map((st, k) => {
    const col = k % 3, row = Math.floor(k / 3);
    const x = 50 + col * (W + 30), y = 590 + row * 134;
    const rot = [-2.4, 1.6, -1, 2.2, -1.8, 1, -2, 1.4, -.6, 2, -1.2, 1.8, -.4, -2.2, 1.2][k];
    const body = manila[k % manila.length];
    const shape = `M44 0 H${W - 8} Q${W} 0 ${W} 8 V${H - 8} Q${W} ${H} ${W - 8} ${H} H44 L0 ${H - 40} V40 Z`;
    return `<div style="${abs(x, y, W, H, `transform:rotate(${rot}deg);filter:drop-shadow(0 2px 2px rgba(40,20,5,.35)) drop-shadow(0 12px 10px rgba(40,20,5,.3))`)}">
      <svg viewBox="0 0 ${W} ${H}" style="${abs(0, 0, W, H)}" aria-hidden="true"><path d="${shape}" fill="${body}"/><path d="${shape}" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/><circle cx="34" cy="${H / 2}" r="21" fill="#fffdf6" stroke="${ring[k % ring.length]}" stroke-width="3" opacity=".95"/><circle cx="34" cy="${H / 2}" r="9" fill="#6b4a2c" opacity=".55"/>
      <path d="M34 ${H / 2} C 70 ${H / 2 - 44}, 108 ${H / 2 - 30}, 98 ${H / 2 - 10}" fill="none" stroke="#a98456" stroke-width="3" stroke-linecap="round" opacity=".0"/></svg>
      <div data-check="state name" style="${abs(62, 8, W - 70, H - 16, "display:flex;align-items:center;justify-content:center;text-align:center;font:700 40px/1 'Hand',cursive;color:#2b2420;white-space:nowrap")}">${esc(st)}</div>
      ${pushpin(34, H / 2, ring[(k + 1) % ring.length])}</div>`;
  }).join("");
  const scene = `${corkBoard({ top: SCENE_TOP, height: 1500 - SCENE_TOP })}
  <div class="card70" style="${abs(52, 406, 896, 156, "transform:rotate(-.6deg)")}">
    <div class="n70" aria-hidden="true">${LOW.count}</div>
    <div class="t70"><b data-check="level label">${esc(LOW.label)}</b><span data-check="guide line">${esc(LOW.line)}</span></div>
  </div>
  ${pushpin(500, 410, "#2f6f7e")}
  ${tags}
  <div class="slip70" data-check="caution" style="${abs(130, 1262, 740, 50, "transform:rotate(.7deg)")}">${esc(CAUTION)}</div>
  ${pushpin(142, 1268, "#e0a95a")}`;
  const extraCss = `
  .card70{background:#fffdf6;border-radius:4px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 16px 26px rgba(40,20,5,.35);display:flex;align-items:center;gap:26px;padding:0 32px;
    background-image:linear-gradient(#fffdf6 0 34px,#d86a5f 34px 36px,transparent 36px),repeating-linear-gradient(transparent 0 33px,#bfd3e3 33px 35px);background-position:0 0,0 36px;background-size:100% 36px,100% 100%;background-repeat:no-repeat,repeat-y}
  .card70 .n70{font:500 128px/1 "Newsreader",serif;color:${C.plum};letter-spacing:-.04em;padding-top:26px}
  .card70 .t70{display:flex;flex-direction:column;gap:8px;padding-top:24px}
  .card70 b{font:600 36px/1.1 "Newsreader",serif;color:${C.plumDeep}}
  .card70 span{font:500 29px/1.28 "Plex",sans-serif;color:#2d2830}
  .slip70{background:#fbf3df;border-radius:3px;box-shadow:0 8px 14px rgba(40,20,5,.35);font:500 24px "Plex";color:#3a332a;display:flex;align-items:center;justify-content:center}`;
  return printable({ n: 70, scene, extraCss, sub: false, paper: "#f1e6d2" });
}

/* ---------------------------------------------------------------- #72 Moderate: two stacks of folders on linen */

function linen({ top, height }) {
  return `<div style="${abs(0, top, 1000, height, "background:#8ea3b9;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(20,40,70,.1) 0 1px,transparent 1px 4px),radial-gradient(120% 90% at 25% 8%,rgba(255,255,255,.2),rgba(20,35,60,.34))")}"></div>`;
}

function pin72() {
  const tints = [["#ead3a1", "#dcc088"], ["#bfd2b5", "#a6bf9b"], ["#efca8c", "#e0b36f"], ["#e6b7a4", "#d79f89"]];
  const PITCH = 52, TAB = 46, SW = 440, TW = 214;
  const stacks = [MOD.states.slice(0, 10), MOD.states.slice(10)];
  const folders = stacks.map((list, si) => {
    const x0 = 50 + si * (SW + 20);
    const y0 = 650;
    return list.map((st, k) => {
      const [light, mid] = tints[(k + si * 2) % tints.length];
      const top = y0 + k * PITCH;
      const right = k % 2 === 1;
      const last = k === list.length - 1;
      const bodyH = last ? 84 : 70;
      return `<div style="${abs(x0, top, SW, TAB + bodyH, "filter:drop-shadow(0 -3px 5px rgba(20,35,60,.35))")}">
        <div style="${abs(0, TAB, SW, bodyH, `background:linear-gradient(${light},${mid});border-radius:0 10px ${last ? "10px" : "0"} 10px;box-shadow:inset 0 2px 0 rgba(255,255,255,.55)`)}"></div>
        <div data-check="state name" style="${abs(right ? SW - TW - 4 : 0, 0, TW, TAB + 2, `background:linear-gradient(${light},${light});border-radius:12px 12px 0 0;box-shadow:inset 0 2px 0 rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;font:600 25px 'Plex';color:#2b2420;white-space:nowrap`)}">${esc(st)}</div>
      </div>`;
    }).join("");
  }).join("");
  const scene = `${linen({ top: SCENE_TOP, height: 1500 - SCENE_TOP })}
  <div class="label72" style="${abs(50, 404, 900, 196, "transform:rotate(-.5deg)")}">
    <div class="n72" aria-hidden="true">${MOD.count}</div>
    <div class="t72"><b data-check="level label">${esc(MOD.label)}</b><span data-check="guide line">${esc(MOD.line)}</span></div>
  </div>
  ${folders}
  <div class="cau72" data-check="caution" style="${abs(50, 1268, 740, 50, "transform:rotate(-.4deg)")}">${esc(CAUTION)}</div>`;
  const extraCss = `
  .label72{background:#fbf8f0;border-radius:6px;box-shadow:0 2px 3px rgba(20,35,60,.3),0 18px 30px rgba(20,35,60,.4);display:flex;align-items:center;gap:26px;padding:0 34px;border-left:16px solid ${C.plum}}
  .label72 .n72{font:500 150px/1 "Newsreader",serif;color:${C.plum};letter-spacing:-.04em}
  .label72 .t72{display:flex;flex-direction:column;gap:10px}
  .label72 b{font:600 40px/1.1 "Newsreader",serif;color:${C.plumDeep}}
  .label72 span{font:500 29px/1.28 "Plex";color:#2d2830}
  .cau72{background:#fbf8f0;border-radius:4px;box-shadow:0 8px 14px rgba(20,35,60,.4);font:500 24px "Plex";color:#3a332a;display:flex;align-items:center;justify-content:center}`;
  return printable({ n: 72, scene, extraCss, sub: false, paper: "#e9eef2" });
}

/* ---------------------------------------------------------------- #74 High: a binder of nine ticked dividers on sage felt */

function sageFelt({ top, height }) {
  let s = 17;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const dots = Array.from({ length: 520 }, () => `<circle cx="${(rnd() * 1000).toFixed(0)}" cy="${(rnd() * height).toFixed(0)}" r="${(0.8 + rnd() * 1.6).toFixed(1)}" fill="${rnd() > 0.5 ? "#fff" : "#4b6148"}" opacity="${(0.07 + rnd() * 0.1).toFixed(2)}"/>`).join("");
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><radialGradient id="fg" cx="28%" cy="14%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#25361f" stop-opacity=".36"/></radialGradient></defs><rect width="1000" height="${height}" fill="#97ae92"/>${dots}<rect width="1000" height="${height}" fill="url(#fg)"/></svg>`;
}

function pin74() {
  const tabCols = ["#f0c978", "#e8b4a6", "#f4ecd8", "#b4c6da", "#dccbe0"];
  const PX = 96, PW = 520, PY = 412, PH = 862;
  const TX = PX + PW, TW = 350, TH = 80, TP = 92, TY0 = 436;
  const tick = `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" style="flex:none"><rect x="3" y="3" width="34" height="34" rx="7" fill="#fffdf6" stroke="${C.plumDeep}" stroke-width="3"/><path d="M10 21 L18 29 L31 11" fill="none" stroke="${C.plum}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const tabs = HIGH.states.map((st, k) => `<div data-check="state name" style="${abs(TX - 14, TY0 + k * TP, TW, TH, `background:${tabCols[k % tabCols.length]};border-radius:0 16px 16px 0;box-shadow:0 2px 2px rgba(20,30,15,.3),5px 8px 10px rgba(20,30,15,.3),inset 0 2px 0 rgba(255,255,255,.5);display:flex;align-items:center;gap:14px;padding-left:36px;font:600 25px 'Plex';color:#2b2420;white-space:nowrap`)}">${tick}<span>${esc(st)}</span></div>`).join("");
  const rings = [560, 840, 1120].map((y) => `<ellipse cx="${PX + 26}" cy="${y}" rx="48" ry="24" fill="none" stroke="#5d6169" stroke-width="12"/><ellipse cx="${PX + 26}" cy="${y}" rx="48" ry="24" fill="none" stroke="#e4e6ea" stroke-width="5"/>`).join("");
  const holes = [560, 840, 1120].map((y) => `<circle cx="26" cy="${y - PY}" r="15" fill="#7f9a79" stroke="#00000033" stroke-width="2"/><circle cx="26" cy="${y - PY}" r="15" fill="#6f8a69" opacity=".7"/>`).join("");
  const scene = `${sageFelt({ top: SCENE_TOP, height: 1500 - SCENE_TOP })}
  <div style="${abs(50, 396, 640, 904, `background:linear-gradient(135deg,#5b3d63,${C.plumDeep});border-radius:16px;box-shadow:0 3px 4px rgba(20,30,15,.35),0 26px 46px rgba(20,30,15,.5)`)}"></div>
  <div style="${abs(50, 396, 20, 904, "background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.1));border-radius:16px 0 0 16px")}"></div>
  <div style="${abs(PX + 8, PY + 18, PW, PH, "background:#e8e0cf;border-radius:3px;box-shadow:0 2px 3px rgba(20,30,15,.3)")}"></div>
  <div style="${abs(PX + 3, PY + 10, PW, PH, "background:#f1ebdc;border-radius:3px;box-shadow:0 1px 2px rgba(20,30,15,.3)")}"></div>
  <div class="pg74" style="${abs(PX, PY, PW, PH)}">
    <svg viewBox="0 0 ${PW} ${PH}" style="${abs(0, 0, PW, PH)}" aria-hidden="true">${holes}</svg>
    <div class="n74" aria-hidden="true">${HIGH.count}</div>
    <b data-check="level label">${esc(HIGH.label)}</b>
    <p data-check="guide line"><i aria-hidden="true">“</i>${esc(HIGH.line)}</p>
    <em data-check="caution">${esc(CAUTION)}</em>
  </div>
  <svg style="${abs(0, SCENE_TOP, 1000, 1128, "pointer-events:none;filter:drop-shadow(2px 5px 3px rgba(20,30,15,.45))")}" viewBox="0 ${SCENE_TOP} 1000 1128" aria-hidden="true">${rings}</svg>
  ${tabs}`;
  const extraCss = `
  .pg74{background:#fffdf6;border-radius:3px;box-shadow:0 2px 3px rgba(20,30,15,.3);
    background-image:repeating-linear-gradient(transparent 0 43px,#cfdceb 43px 45px);background-position:0 36px}
  .pg74 .n74{position:absolute;left:104px;top:22px;font:500 190px/1 "Newsreader",serif;color:${C.plum};letter-spacing:-.04em}
  .pg74 b{position:absolute;left:104px;top:226px;font:600 40px/1.1 "Newsreader",serif;color:${C.plumDeep}}
  .pg74 p{position:absolute;left:104px;right:36px;top:306px;font:400 36px/1.3 "Newsreader",serif;color:#2b2430}
  .pg74 p i{position:absolute;left:-44px;top:-18px;font:500 100px/1 "Newsreader",serif;color:${C.plum};font-style:normal}
  .pg74 em{position:absolute;left:104px;right:30px;bottom:30px;font:500 24px/1.3 "Plex";color:#4b4339;font-style:normal;background:#fffdf6}`;
  return printable({ n: 74, scene, extraCss, sub: false, paper: "#eef0e8" });
}

export const pins = [pin57(), pin70(), pin72(), pin74()];
