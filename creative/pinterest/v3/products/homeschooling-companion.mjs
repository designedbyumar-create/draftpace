/**
 * Homeschooling Companion, v3 test pins: two of the seven visuals in
 * pinterest/strategy/homeschooling-companion.json, drawn from the
 * kitchen-table classroom.
 *
 * - homeschool/pin-3.1, state tile map: the 51 tiles coloured by the
 *   level each state really has in HOMESCHOOL_STATE_REQUIREMENTS
 *   (src/lib/homeschoolStateRequirements.ts), counted from that file, and
 *   the guide's own line for each level ("What the four levels mean").
 * - homeschool/pin-7.1, four-day week board: the guide's front-loaded
 *   week (Monday to Thursday, Friday open) pinned to the cork board, and
 *   its "One shape, as a suggestion" split on an index card on the table
 *   (guides.ts, four-day-homeschool-week). Both are the guide's examples.
 */
import fs from "node:fs";
import path from "node:path";
import { product, page, foot, esc } from "../kit.mjs";

const ROOT = path.resolve(import.meta.dirname, "../../../..");
const p = product("homeschooling-companion");
const STRATEGY = (await import("../../strategy/homeschooling-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the homeschooling strategy`);
  return pin;
};

/* The strategy's palette: paper first, plum second, warm natural props. */
const C = {
  cream: "#fbfaf7",
  paper: "#f5f1ea",
  ink: "#1a1d24",
  plum: p.accent,
  plumDeep: "#4a3350",
  plumMid: "#8e6f95",
  plumSoft: "#f1ebf2",
  oak: "#d9c3a5",
  oakDark: "#c4a982",
  kraft: "#c9a87a",
  cork: "#cfa77a",
  ochre: "#d8a657",
  sage: "#a3b18a",
  rose: "#d9a5a0",
  rule: "#ddd8d0",
  pencil: "#8a8478",
};

/* ------------------------------------------------------------ shared props */

/** The oak table, seen from a little above: a few long, lighter grain strokes. */
function oakTable(w, h, seed = 0) {
  const grain = Array.from({ length: 11 }, (_, i) => {
    const y = 40 + i * (h / 11) + ((i * 37 + seed) % 23);
    const a = 6 + ((i * 13 + seed) % 9);
    return `<path d="M-20 ${y} C ${w * 0.25} ${y - a}, ${w * 0.45} ${y + a}, ${w * 0.7} ${y - a / 2} S ${w + 20} ${y + a / 2}, ${w + 20} ${y}" fill="none" stroke="${i % 3 ? "#e3d1b7" : "#cbb18d"}" stroke-width="${i % 3 ? 3 : 2}" opacity=".75"/>`;
  }).join("");
  const knots = [[0.18, 0.31], [0.82, 0.62]].map(([x, y]) => `<ellipse cx="${w * x}" cy="${h * y}" rx="26" ry="7" fill="none" stroke="#c9ae88" stroke-width="2" opacity=".7"/><ellipse cx="${w * x}" cy="${h * y}" rx="12" ry="3" fill="#c9ae88" opacity=".6"/>`).join("");
  return `<rect width="${w}" height="${h}" fill="${C.oak}"/>${grain}${knots}`;
}

/** A pencil lying flat, drawn along +x from its eraser at the origin. */
function pencil(len = 420) {
  const body = len - 70;
  return `
    <g>
      <rect x="0" y="-11" width="26" height="22" rx="6" fill="${C.rose}"/>
      <rect x="22" y="-12" width="22" height="24" fill="#b9b3a7"/>
      ${[27, 33, 39].map((x) => `<line x1="${x}" y1="-12" x2="${x}" y2="12" stroke="#9c968b" stroke-width="1.5"/>`).join("")}
      <rect x="44" y="-12" width="${body - 44}" height="24" fill="${C.ochre}"/>
      <rect x="44" y="-12" width="${body - 44}" height="7" fill="#e6bd74"/>
      <rect x="44" y="5" width="${body - 44}" height="7" fill="#c48f3f"/>
      <path d="M${body} -12 L${len - 16} -3 L${len - 16} 3 L${body} 12 Z" fill="#ecd3a8"/>
      <path d="M${body} -12 q5 4 0 8 q5 4 0 8 q5 4 0 8" fill="none" stroke="#c48f3f" stroke-width="2"/>
      <path d="M${len - 16} -3 L${len} 0 L${len - 16} 3 Z" fill="#4a4844"/>
    </g>`;
}

/** A soft drop shadow for anything flat on the table. */
const SHADOW = `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>`;

/* ------------------------------------------------------------ state tile map */

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

/** Postal abbreviations, to place each row of the product's data on the grid. */
const ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA", Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME",
  Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

/** Every state's level, read from the product's own data file, never typed here. */
function stateLevels() {
  const src = fs.readFileSync(path.join(ROOT, "src/lib/homeschoolStateRequirements.ts"), "utf8");
  const rows = [...src.matchAll(/state:\s*"([^"]+)",\s*level:\s*"(None|Low|Moderate|High)"/g)].map(([, state, level]) => ({ state, level, abbr: ABBR[state] }));
  if (rows.length !== 51) throw new Error(`expected 51 jurisdictions in HOMESCHOOL_STATE_REQUIREMENTS, read ${rows.length}`);
  for (const r of rows) if (!r.abbr || !GRID[r.abbr]) throw new Error(`no tile for ${r.state}`);
  return rows;
}

/** The guide's own line for each level ("What the four levels mean"), first sentence only. */
function levelMeanings() {
  const src = fs.readFileSync(path.join(ROOT, "src/content/guides.ts"), "utf8");
  const out = {};
  for (const [, level, count, meaning] of src.matchAll(/"(None|Low|Moderate|High), (\d+) states: ([^"]+)"/g)) out[level] = { count: Number(count), meaning: meaning.split(/(?<=\.)\s/)[0] };
  return out;
}

const LEVEL_FILL = {
  None: { fill: C.cream, stroke: C.plum, text: C.plum },
  Low: { fill: C.plumSoft, stroke: "#dccfde", text: C.plumDeep },
  Moderate: { fill: C.plumMid, stroke: C.plumMid, text: "#fff" },
  High: { fill: C.plumDeep, stroke: C.plumDeep, text: "#fff" },
};

/** Top-down coffee mug with its ring stain. */
function mugTop() {
  return `
    <g>
      <circle cx="58" cy="96" r="70" fill="none" stroke="#b8946a" stroke-width="5" opacity=".35"/>
      <rect x="62" y="-16" width="58" height="34" rx="16" fill="#e9e1d4"/>
      <circle r="78" fill="${C.paper}"/>
      <circle r="78" fill="none" stroke="#e2d9ca" stroke-width="3"/>
      <circle r="62" fill="#6b4a35"/>
      <circle r="62" fill="none" stroke="#5a3d2b" stroke-width="5"/>
      <ellipse cx="-18" cy="-20" rx="20" ry="9" fill="#8a6650" opacity=".7" transform="rotate(-30 -18 -20)"/>
    </g>`;
}


function stateTileMap() {
  const pin = plan("homeschool/pin-3.1");
  const rows = stateLevels();
  const meaning = levelMeanings();
  const levels = ["None", "Low", "Moderate", "High"];
  const count = Object.fromEntries(levels.map((l) => [l, rows.filter((r) => r.level === l).length]));
  // The strategy's items and the guide's printed counts must both agree with the data.
  for (const l of levels) {
    if (!pin.content.items.includes(`${l}, ${count[l]} states`)) throw new Error(`strategy item for ${l} does not match the data (${count[l]})`);
    if (meaning[l]?.count !== count[l]) throw new Error(`guide count for ${l} does not match the data`);
  }

  const T = 72, G = 8;
  const tiles = rows.map(({ abbr, level }) => {
    const [c, r] = GRID[abbr];
    const s = LEVEL_FILL[level];
    const x = c * (T + G), y = r * (T + G);
    return `<g transform="translate(${x} ${y})"><rect x="1.5" y="1.5" width="${T - 3}" height="${T - 3}" rx="11" fill="${s.fill}" stroke="${s.stroke}" stroke-width="3"/><text x="${T / 2}" y="${T / 2 + 9}" text-anchor="middle" font-family="Plex" font-weight="600" font-size="25" letter-spacing=".5" fill="${s.text}">${abbr}</text></g>`;
  }).join("");
  const mapW = 11 * (T + G) - G, mapH = 8 * (T + G) - G;

  const legend = levels.map((l) => {
    const s = LEVEL_FILL[l];
    return `<li><svg viewBox="0 0 44 44" aria-hidden="true"><rect x="2" y="2" width="40" height="40" rx="8" fill="${s.fill}" stroke="${s.stroke}" stroke-width="3"/></svg><div><b>${esc(`${l}, ${count[l]} states`)}</b><span>${esc(meaning[l].meaning)}</span></div></li>`;
  }).join("");

  const body = `
  <svg class="table" viewBox="0 0 1000 1500" aria-hidden="true">
    <defs>${SHADOW}</defs>
    ${oakTable(1000, 1500, 5)}
    <rect x="58" y="58" width="896" height="1290" fill="#5b4428" opacity=".28" filter="url(#soft)" transform="rotate(-1 500 700)"/>
  </svg>
  <div class="sheet">
    <div class="spine"></div>
    <div class="top" data-check="headline">
      <div class="eyebrow">What the four levels mean</div>
      <h1 class="serif">${esc(pin.headline)}</h1>
    </div>
    <p class="sub" data-check="sub">${esc(pin.sub)}</p>
    <svg class="map" data-check="map" viewBox="-4 -4 ${mapW + 8} ${mapH + 8}" aria-label="US states by level">${tiles}</svg>
    <ul class="legend" data-check="legend">${legend}</ul>
    <p class="caution">Laws change. Confirm with your state before relying on this.</p>
  </div>
  <svg class="props" viewBox="0 0 1000 1500" aria-hidden="true">
    <defs>${SHADOW}</defs>
    <g transform="translate(948 70)"><g transform="translate(8 12)" opacity=".22" filter="url(#soft)"><circle r="80" fill="#3b2f1e"/></g>${mugTop()}</g>
    <g transform="translate(560 1385) rotate(-14)"><g transform="translate(6 12)" opacity=".2" filter="url(#soft)"><rect x="0" y="-12" width="430" height="24" rx="8" fill="#3b2f1e"/></g>${pencil(430)}</g>
  </svg>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .table,.props{position:absolute;inset:0;width:1000px;height:1500px}
  .props{pointer-events:none}
  .sheet{position:absolute;left:46px;top:44px;width:908px;height:1296px;background:${C.cream};border-radius:4px;transform:rotate(-1deg);transform-origin:500px 700px;padding:0 18px}
  .spine{position:absolute;left:0;right:0;top:0;height:7px;background:var(--accent);border-radius:4px 4px 0 0}
  .top{position:absolute;left:46px;right:96px;top:54px;height:250px}
  .top h1{font-size:60px;line-height:1.04;letter-spacing:-.015em;margin-top:14px;font-weight:500;color:${C.ink}}
  .map{position:absolute;left:14px;top:284px;width:880px;height:${Math.round(880 * (mapH + 8) / (mapW + 8))}px}
  .sub{position:absolute;left:118px;width:560px;top:302px;height:136px;display:flex;align-items:center;font:italic 400 31px/1.3 "Newsreader",serif;color:#4d4740}
  .legend{position:absolute;left:30px;right:30px;top:958px;height:272px;list-style:none;display:grid;grid-template-columns:1fr 1fr;column-gap:34px;row-gap:22px;align-content:start}
  .legend li{display:flex;gap:16px;align-items:flex-start}
  .legend svg{flex:none;width:44px;height:44px;margin-top:2px}
  .legend b{display:block;font-size:27px;line-height:1.2;font-weight:600;color:${C.ink}}
  .legend span{display:block;font-size:22px;line-height:1.3;color:var(--muted);margin-top:4px}
  .caution{position:absolute;left:46px;right:46px;top:1246px;font-size:22px;color:var(--muted);border-top:1.5px solid ${C.rule};padding-top:12px}
  .foot{z-index:2}
  `;
  return { id: "pin-3.1-state-tile-map", html: page(p, { body, css, paper: C.oak, ink: C.ink, muted: "#5c564d" }) };
}

/* ------------------------------------------------------------ four-day week board */

/** A wavy pencil scribble, standing in for handwriting where there are no real words. */
function scribble(x, y, w, seed) {
  const n = Math.max(3, Math.round(w / 16));
  let d = `M${x} ${y}`;
  for (let i = 1; i <= n; i++) d += ` q ${w / n / 2} ${((i + seed) % 2 ? -1 : 1) * (4 + ((i * 7 + seed) % 4))} ${w / n} 0`;
  return `<path d="${d}" fill="none" stroke="${C.pencil}" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`;
}

/** A push pin seen from above. */
const pushPin = (x, y, c) => `<g transform="translate(${x} ${y})"><circle cx="3" cy="5" r="13" fill="#3b2f1e" opacity=".25"/><circle r="13" fill="${c}"/><circle cx="-4" cy="-4" r="4.5" fill="#fff" opacity=".55"/></g>`;

/** Side-view mug in cream with a plum band, holding three pencils. */
function pencilsInMug() {
  const stick = (x, h, rot) => `<g transform="translate(${x} 0) rotate(${rot})"><rect x="-9" y="${-h}" width="18" height="${h}" fill="${C.ochre}"/><rect x="-9" y="${-h}" width="6" height="${h}" fill="#e6bd74"/><path d="M-9 ${-h} L0 ${-h - 34} L9 ${-h} Z" fill="#ecd3a8"/><path d="M-3 ${-h - 22} L0 ${-h - 34} L3 ${-h - 22} Z" fill="#4a4844"/></g>`;
  return `
    <g>
      ${stick(-30, 150, -9)}${stick(4, 190, 2)}${stick(34, 130, 11)}
      <path d="M58 30 h18 a34 34 0 0 1 0 68 h-18" fill="none" stroke="#e7dfd2" stroke-width="16"/>
      <rect x="-66" y="0" width="128" height="160" rx="18" fill="${C.paper}"/>
      <rect x="-66" y="0" width="128" height="160" rx="18" fill="none" stroke="#e2d9ca" stroke-width="3"/>
      <rect x="-66" y="38" width="128" height="22" fill="${C.plum}"/>
      <ellipse cx="-2" cy="2" rx="62" ry="10" fill="#d9cfbf"/>
    </g>`;
}

/** A child's drawing: sun, house, two stick figures, in ochre, sage and plum. No words. */
function childsDrawing() {
  return `
    <g>
      <rect x="0" y="0" width="230" height="170" fill="#fffdf8"/>
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="186" cy="38" r="17" stroke="${C.ochre}" stroke-width="6"/>
        ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="${186 + Math.cos(a) * 25}" y1="${38 + Math.sin(a) * 25}" x2="${186 + Math.cos(a) * 34}" y2="${38 + Math.sin(a) * 34}" stroke="${C.ochre}" stroke-width="5"/>`; }).join("")}
        <path d="M28 150 V 96 H 92 V 150" stroke="${C.plum}" stroke-width="6"/>
        <path d="M20 100 L60 62 L100 100" stroke="${C.rose}" stroke-width="6"/>
        <rect x="50" y="118" width="18" height="32" stroke="${C.plum}" stroke-width="4"/>
        <circle cx="128" cy="98" r="9" stroke="${C.sage}" stroke-width="5"/>
        <path d="M128 107 V 132 M114 118 H 142 M128 132 L118 152 M128 132 L138 152" stroke="${C.sage}" stroke-width="5"/>
        <circle cx="166" cy="108" r="7" stroke="${C.plumMid}" stroke-width="5"/>
        <path d="M166 115 V 136 M155 124 H 177 M166 136 L158 152 M166 136 L174 152" stroke="${C.plumMid}" stroke-width="5"/>
        <path d="M8 158 Q 115 150 222 160" stroke="${C.sage}" stroke-width="5"/>
      </g>
    </g>`;
}

function weekBoard() {
  const pin = plan("homeschool/pin-7.1");
  const [taught, fifth, ...split] = pin.content.items;
  const days = taught.split(", ");
  const subjects = split.map((s) => { const m = s.match(/^(.+) (\d)$/); if (!m) throw new Error(`unreadable subject item: ${s}`); return { name: m[1], n: Number(m[2]) }; });
  // The board's four days each carry an equal share of the split's sessions, drawn as unnamed pencil tiles.
  const sessions = subjects.reduce((a, s) => a + s.n, 0);
  if (sessions % days.length) throw new Error("sessions do not divide evenly across the taught days");
  const perDay = sessions / days.length;

  const dayCols = days.map((d, i) => `
    <div class="day">
      <div class="dname">${esc(d)}</div>
      ${Array.from({ length: perDay }, (_, k) => `<div class="tile"><svg viewBox="0 0 120 34" aria-hidden="true">${scribble(10, 12, 70 + ((i * 3 + k * 5) % 4) * 9, i + k)}${scribble(10, 26, 36 + ((i + k * 2) % 3) * 12, i + k + 1)}</svg></div>`).join("")}
    </div>`).join("");
  const friday = fifth.split(" ")[0];

  const card = subjects.map(({ name, n }) => `<li><span class="sname">${esc(name)}</span><span class="dots">${Array.from({ length: 4 }, (_, k) => `<i class="${k < n ? "on" : ""}"></i>`).join("")}</span><span class="num">${n}</span></li>`).join("");

  const body = `
  <svg class="scene" viewBox="0 0 1000 1500" aria-hidden="true">
    <defs>${SHADOW}
      <pattern id="corkdots" width="34" height="34" patternUnits="userSpaceOnUse"><circle cx="5" cy="7" r="2" fill="#b98d5c"/><circle cx="22" cy="18" r="1.6" fill="#e0bf96"/><circle cx="12" cy="28" r="1.8" fill="#b98d5c"/><circle cx="29" cy="4" r="1.3" fill="#a87d4f"/></pattern>
    </defs>
    <rect width="1000" height="1500" fill="${C.paper}"/>
    <g transform="translate(0 968)">${oakTable(1000, 532, 11)}</g>
    <rect x="0" y="960" width="1000" height="14" fill="${C.oakDark}"/>
    <rect x="22" y="394" width="956" height="556" rx="16" fill="#5b4428" opacity=".25" filter="url(#soft)"/>
    <rect x="20" y="378" width="960" height="556" rx="16" fill="#b8915f"/>
    <rect x="34" y="392" width="932" height="528" rx="8" fill="${C.cork}"/>
    <rect x="34" y="392" width="932" height="528" rx="8" fill="url(#corkdots)"/>
  </svg>
  <div class="top" data-check="headline">
    <div class="eyebrow">Plan four days, not five</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  <div class="board" data-check="week board">
    <div class="spine"></div>
    <div class="bhead"><span class="serif">Front-loaded</span><span class="example">Example</span></div>
    <div class="cols">${dayCols}
      <div class="day open"><div class="dname">${esc(friday)}</div><div class="hatch"><span class="hand">${esc(fifth)}</span></div></div>
    </div>
  </div>
  <svg class="pins" viewBox="0 0 1000 1500" aria-hidden="true">
    ${pushPin(90, 424, C.plum)}${pushPin(910, 424, C.sage)}
    <rect x="452" y="406" width="96" height="30" fill="${C.plumSoft}" opacity=".85" transform="rotate(-4 500 421)"/>
  </svg>
  <div class="card" data-check="subject card">
    <div class="chead"><span class="serif">One shape, as a suggestion</span><span class="example">Example</span></div>
    <div class="cols2"><span>Subject</span><span>Days a week</span></div>
    <ul>${card}</ul>
  </div>
  <svg class="props" viewBox="0 0 1000 1500" aria-hidden="true">
    <defs>${SHADOW}</defs>
    <g transform="translate(790 1000) rotate(8)"><g transform="translate(6 10)" opacity=".18" filter="url(#soft)"><rect width="230" height="170" fill="#3b2f1e"/></g>${childsDrawing()}</g>
    <g transform="translate(748 1150)"><ellipse cx="0" cy="168" rx="84" ry="14" fill="#5b4428" opacity=".25" filter="url(#soft)"/>${pencilsInMug()}</g>
  </svg>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .scene,.pins,.props{position:absolute;inset:0;width:1000px;height:1500px}
  .top{position:absolute;left:64px;right:64px;top:62px;height:300px}
  .top h1{font-size:66px;line-height:1.04;letter-spacing:-.015em;margin-top:14px;font-weight:500;color:${C.ink}}
  .top p{font-size:28px;line-height:1.35;color:var(--muted);margin-top:18px;max-width:820px}
  .board{position:absolute;left:56px;top:420px;width:888px;height:480px;background:${C.cream};border-radius:4px;box-shadow:0 14px 26px -14px rgba(60,40,20,.55);transform:rotate(-.6deg);padding:30px 24px 22px}
  .board .spine{position:absolute;left:0;right:0;top:0;height:7px;background:var(--accent);border-radius:4px 4px 0 0}
  .bhead{display:flex;align-items:center;gap:16px;margin-bottom:16px}
  .bhead .serif{font-size:36px;font-weight:500;color:${C.ink}}
  .cols{display:grid;grid-template-columns:repeat(4,1fr) 1.18fr;gap:10px;height:360px}
  .day{display:flex;flex-direction:column;gap:9px;min-width:0}
  .dname{font:600 19px "Plex";letter-spacing:.08em;text-transform:uppercase;color:var(--accent);padding:0 2px 6px;border-bottom:2px solid ${C.rule}}
  .tile{flex:1;background:${C.plumSoft};border-radius:10px;display:flex;align-items:center;padding:0 6px}
  .tile svg{width:100%;height:34px}
  .open .dname{color:${C.pencil}}
  .hatch{flex:1;border:2.5px dashed ${C.plumMid};border-radius:10px;background:repeating-linear-gradient(135deg,rgba(142,111,149,.13) 0 6px,transparent 6px 16px);display:flex;align-items:center;padding:12px 14px}
  .hatch .hand{font-size:33px;line-height:1.08;font-weight:600;color:${C.plumDeep}}
  .card{position:absolute;left:52px;top:1004px;width:600px;height:316px;background:#fff;border-radius:4px;box-shadow:0 14px 24px -12px rgba(60,40,20,.5);transform:rotate(-1.6deg);padding:20px 30px 18px;border-top:6px solid var(--accent)}
  .chead{display:flex;align-items:center;gap:14px}
  .chead .serif{font-size:31px;font-weight:500;color:${C.ink}}
  .cols2{display:grid;grid-template-columns:1fr 240px;font:600 17px "Plex";letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:12px 0 4px;padding-bottom:6px;border-bottom:1.5px solid ${C.rule}}
  .card ul{list-style:none}
  .card li{display:grid;grid-template-columns:1fr 168px 72px;align-items:center;height:35px;border-bottom:1px solid #eeeae3;font-size:24px}
  .card li:last-child{border-bottom:0}
  .dots{display:flex;gap:9px}
  .dots i{width:18px;height:18px;border-radius:50%;border:2px solid ${C.plumMid}}
  .dots i.on{background:var(--accent);border-color:var(--accent)}
  .num{font:600 24px "Plex Mono";color:var(--accent);text-align:right}
  .foot{z-index:2}
  `;
  return { id: "pin-7.1-four-day-week", html: page(p, { body, css, paper: C.paper, ink: C.ink, muted: "#5c564d" }) };
}

export const pins = [stateTileMap(), weekBoard()];
