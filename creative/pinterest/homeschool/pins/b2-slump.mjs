/**
 * Batch 2, the mid-year slump set: #81, #90, #44, #60, #42.
 * Five different worlds: a cork board of index cards, a sage felt week
 * board, sticky-note columns on a slate wall, a wall calendar of torn notes
 * on an oak table, and a quote card clipped over a child's drawing on
 * gingham. Every word is the idea bank's own (items, sub, proof).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, pencil, mug, binderClip, drawing } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const SHADOW = "drop-shadow(0 2px 2px rgba(30,15,5,.25)) drop-shadow(0 10px 12px rgba(30,15,5,.3))";

/** A coloured push pin, centred on (x, y). */
function pushPin(x, y, color = "#c4573e") {
  return `<svg style="${abs(x - 22, y - 22, 44, 50, "filter:drop-shadow(5px 8px 4px rgba(0,0,0,.35));z-index:4")}" viewBox="0 0 44 50" aria-hidden="true"><ellipse cx="22" cy="24" rx="15" ry="15" fill="${color}"/><ellipse cx="22" cy="24" rx="15" ry="15" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="2"/><ellipse cx="17" cy="18" rx="6" ry="4.5" fill="#fff" opacity=".45" transform="rotate(-30 17 18)"/></svg>`;
}

/** A strip of washi tape, centred on (x, y). */
function tape(x, y, w = 150, rot = -4, color = "rgba(224,169,90,.78)", stripe = "rgba(255,255,255,.3)") {
  return `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,${stripe} 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:4;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A jagged torn-paper polygon (px), torn along the top and bottom edges. */
function torn(seed, w, h, amp = 6, step = 20) {
  const r = seeded(seed);
  const pts = [];
  for (let x = 0; x <= w; x += step) pts.push(`${x}px ${(r() * amp).toFixed(1)}px`);
  pts.push(`${w}px ${h / 2}px`);
  for (let x = w; x >= 0; x -= step) pts.push(`${x}px ${(h - r() * amp).toFixed(1)}px`);
  return `polygon(${pts.join(",")})`;
}

/** A curved arrow in plum pencil-pen, from (x0,y0) to (x1,y1) bowing by `bow`. */
function arrow(x0, y0, x1, y1, bow = 40, color = C.plumDeep, sw = 6) {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * bow, cy = my + (dx / len) * bow;
  const ang = Math.atan2(y1 - cy, x1 - cx);
  const ah = 22;
  const a1 = [x1 - Math.cos(ang - 0.5) * ah, y1 - Math.sin(ang - 0.5) * ah];
  const a2 = [x1 - Math.cos(ang + 0.5) * ah, y1 - Math.sin(ang + 0.5) * ah];
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:5;pointer-events:none" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"><path d="M${x0} ${y0} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x1} ${y1}"/><path d="M${a1[0].toFixed(1)} ${a1[1].toFixed(1)} L ${x1} ${y1} L ${a2[0].toFixed(1)} ${a2[1].toFixed(1)}"/></g></svg>`;
}

const exampleCss = `.example{font-size:22px;color:#4b4339;background:#fffdf6;padding:7px 13px;box-shadow:0 2px 4px rgba(0,0,0,.2)}`;
const exampleTag = (x, y, rot = -3) => `<span class="example" style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:6">Example</span>`;

/* ------------------------------------------------------------------ #81 */

function pin81() {
  const i = idea(81);
  const r = seeded(11);
  const speck = [];
  for (let k = 0; k < 900; k++) {
    const x = 30 + r() * 940, y = 395 + r() * 800, rad = 1 + r() * 3;
    const c = ["#b98d5c", "#e0bf96", "#a87d4f", "#d9b384", "#8f6a40"][Math.floor(r() * 5)];
    speck.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rad.toFixed(1)}" ry="${(rad * (0.6 + r() * 0.5)).toFixed(1)}" fill="${c}" opacity="${(0.35 + r() * 0.5).toFixed(2)}"/>`);
  }
  const board = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><linearGradient id="cl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d7b184"/><stop offset="1" stop-color="#c09468"/></linearGradient><linearGradient id="fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99b66"/><stop offset="1" stop-color="#9c6f3c"/></linearGradient></defs>
    <rect x="0" y="372" width="1000" height="860" fill="#a87d4f"/>
    <rect x="26" y="394" width="948" height="810" rx="6" fill="url(#cl)"/>${speck.join("")}
    <rect x="26" y="394" width="948" height="810" rx="6" fill="none" stroke="url(#fr)" stroke-width="22"/>
    <rect x="15" y="383" width="970" height="832" rx="10" fill="none" stroke="#7d5a30" stroke-opacity=".5" stroke-width="2"/></svg>`;
  const ledge = desk({ top: 1215, height: 285, planks: 3, seed: 8 });
  const lip = `<div style="${abs(0, 1204, 1000, 22, "background:linear-gradient(#b0834d,#8a6234);box-shadow:0 6px 12px rgba(40,20,5,.45);z-index:2")}"></div>`;

  const cards = i.items.map((t, k) => {
    const [, num, label] = t.match(/^(\d)\.\s*(.*)$/);
    const left = k % 2 === 0;
    const x = left ? 74 : 524, y = 418 + k * 158, rot = [-2.4, 2, -1.6, 2.6][k];
    const w = 402, h = 236;
    return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:3`)}">
      <div style="${abs(0, 0, w, h, `background:#fffdf6;border-radius:5px;filter:${SHADOW};overflow:hidden`)}">
        <div style="${abs(0, 0, w, h, "background:repeating-linear-gradient(180deg,transparent 0 53px,#b9cde0 53px 55px);opacity:.75;top:30px")}"></div>
        <div style="${abs(0, 52, w, 3, "background:#d9776b")}"></div>
        <div style="${abs(86, 0, 2, h, "background:#e3a3a3;opacity:.7")}"></div>
        <div class="serif" style="${abs(14, 62, 70, 120, `font-size:112px;line-height:1;font-weight:500;color:${C.plum};text-align:center`)}">${num}</div>
        <div class="hand" style="${abs(104, 66, w - 120, 150, "font-size:62px;font-weight:700;line-height:.98;color:#2c2540")}">${esc(label)}</div>
      </div>
      ${pushPin(w / 2, 16, ["#c4573e", "#e0a95a", "#5f8a8f", "#7a4b8a"][k])}
    </div>`;
  }).join("");

  const arrows = arrow(440, 600, 538, 690, -28, C.plumDeep, 7) + arrow(560, 835, 438, 905, -30, C.plumDeep, 7) + arrow(440, 1000, 540, 1045, -26, C.plumDeep, 7);
  const props = `${pencil({ x: 440, y: 1262, len: 400, rot: -3 })}${mug({ x: 70, y: 1222, size: 122, drink: "#cbb89a" })}`;
  return printable({ n: 81, paper: "#efe7da", scene: `${board}${ledge}${lip}${cards}${arrows}${props}` });
}

/* ------------------------------------------------------------------ #90 */

function scribbleRows(seed, w, rows, gap = 40) {
  const r = seeded(seed);
  let d = "";
  let boxes = "";
  for (let k = 0; k < rows; k++) {
    const y = 28 + k * gap;
    const len = (0.55 + r() * 0.4) * (w - 66);
    let x = 40;
    d += `M${x} ${y}`;
    while (x < 40 + len) {
      x += 7 + r() * 7;
      d += ` L${x.toFixed(1)} ${(y + (r() - 0.5) * 9).toFixed(1)}`;
      if (r() < 0.07) { x += 12; d += ` M${x.toFixed(1)} ${y}`; }
    }
    boxes += `<rect x="9" y="${y - 12}" width="22" height="22" rx="4" fill="none" stroke="#5a5560" stroke-width="2.2"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${rows * gap + 20}" style="position:absolute;left:0;top:0;width:${w}px;height:${rows * gap + 20}px" aria-hidden="true"><path d="${d}" fill="none" stroke="#4d4954" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>${boxes}</svg>`;
}

function pin90() {
  const i = idea(90);
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const colW = 168, gap = 15, x0 = 50, y0 = 410, tabH = 66, slotH = 440;
  const felt = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><filter id="ft" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .1  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .55 0"/></filter><radialGradient id="fl" cx="25%" cy="18%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#1b2a1a" stop-opacity=".3"/></radialGradient></defs><rect width="1000" height="1500" fill="#8aa182"/><rect width="1000" height="1500" filter="url(#ft)"/><rect width="1000" height="1500" fill="url(#fl)"/></svg>`;
  const cols = days.map((d, k) => {
    const x = x0 + k * (colW + gap);
    const wed = d === "Wednesday";
    const rot = [-0.5, 0.4, 0, -0.3, 0.5][k];
    if (wed) {
      return `<div style="${abs(x, y0, colW, tabH + slotH, `transform:rotate(${rot}deg)`)}">
        <div style="${abs(0, 0, colW, tabH, `border:5px solid ${C.plum};border-bottom:none;border-radius:12px 12px 0 0;background:rgba(255,253,246,.1);display:grid;place-items:center;font:600 26px Plex;color:#fffdf6;text-shadow:0 1px 2px rgba(0,0,0,.45)`)}">${d}</div>
        <div style="${abs(0, tabH, colW, slotH, `border:5px dashed ${C.plum};border-radius:0 0 12px 12px;background:rgba(40,60,38,.2);box-shadow:inset 0 5px 14px rgba(0,0,0,.25)`)}"></div></div>`;
    }
    return `<div style="${abs(x, y0, colW, tabH + slotH, `transform:rotate(${rot}deg);filter:${SHADOW}`)}">
      <div style="${abs(0, 0, colW, tabH, `background:#b78a52;border-radius:12px 12px 0 0;display:grid;place-items:center;font:600 26px Plex;color:#2a1c0c`)}">${d}</div>
      <div style="${abs(0, tabH, colW, slotH, "background:#fbf6ea;border-radius:0 0 8px 8px;overflow:hidden")}">${scribbleRows(31 + k * 7, colW, 9, 46)}</div></div>`;
  }).join("");

  // Tuesday's work carried across into Wednesday's empty slot.
  const wedX = x0 + 2 * (colW + gap);
  const arr = arrow(x0 + 1 * (colW + gap) + 110, 640, wedX + 78, 690, -36, C.plum, 9);
  const caption = `<div style="${abs(50, 934, 900, 74, `background:#fbf6ea;border-radius:6px;filter:${SHADOW};display:flex;align-items:center;padding:0 24px;font:500 25px/1.25 Plex;color:#2a2530;transform:rotate(-.4deg)`)}" data-check="caption">${esc(i.items[0])}</div>`;

  const slip = (x, y, w, h, text, rot, seed, color) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SHADOW}`)}"><div data-check="story" style="${abs(0, 0, w, h, `background:${color};clip-path:${torn(seed, w, h, 7, 22)};padding:26px 24px;font:600 40px/1.02 Hand;color:#2a2530;display:flex;align-items:center`)}">${esc(text)}</div></div>`;
  const story = `${slip(50, 1040, 410, 250, cap(i.proof[0].match(/the toddler gets a stomach bug on Tuesday night/)[0]), -2, 5, "#f7e7c4")}
    ${arrow(470, 1160, 545, 1170, -20, C.plumDeep, 7)}
    ${slip(560, 1030, 390, 260, i.items[1], 1.8, 9, "#fffdf6")}
    ${tape(255, 1040, 120, -5, "rgba(138,161,130,.85)")}${tape(755, 1030, 120, 4, "rgba(106,74,114,.65)")}
    ${exampleTag(60, 1305, -2)}`;
  return printable({ n: 90, paper: "#e7ecdf", extraCss: `${exampleCss}.top h1{font-size:72px}`, scene: `${felt}${cols}${arr}${caption}${story}` });
}

/* ------------------------------------------------------------------ #44 */

function pin44() {
  const i = idea(44);
  const heads = ["Division", "Reading", "Spelling"];
  const steps = i.items.map((t) => {
    const [, num, label, rest] = t.match(/^(\d)\.\s*([^:]+):\s*(.*)$/);
    return { num, label, cells: rest.split(" | ") };
  });
  const tone = [
    { note: "#f4d56e", tab: "#e0a95a", ink: "#3a2c08" },
    { note: "#f2ac92", tab: "#c4573e", ink: "#4a1d10" },
    { note: "#bcd8aa", tab: "#6f8f66", ink: "#1f3a1c" },
  ];
  const wall = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><filter id="pl"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .15  0 0 0 0 .25  0 0 0 .18 0"/></filter><linearGradient id="wl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6f879c"/><stop offset="1" stop-color="#4b6075"/></linearGradient></defs><rect width="1000" height="1500" fill="url(#wl)"/><rect width="1000" height="1500" filter="url(#pl)"/></svg>`;
  const colW = 292, gap = 16, x0 = 46;
  const out = [];
  heads.forEach((h, c) => {
    const x = x0 + c * (colW + gap);
    out.push(`<div style="${abs(x, 396, colW, 76, `background:${tone[c].tab};border-radius:8px;filter:${SHADOW};display:grid;place-items:center;font:600 46px Newsreader;color:#fffdf6;text-shadow:0 1px 2px rgba(0,0,0,.35)`)}">${h}</div>`);
    steps.forEach((s, r) => {
      const y = 488 + r * 266;
      const rot = [-1.4, 1.1, -0.8, 1.5, -1.1, 0.9, -1.6, 1.2, -0.6][r * 3 + c] ?? 0;
      out.push(`<div style="${abs(x, y, colW, 250, `transform:rotate(${rot}deg);filter:${SHADOW}`)}">
        <div data-check="sticky" style="${abs(0, 0, colW, 250, `background:linear-gradient(170deg,${tone[c].note},${tone[c].note} 82%,rgba(0,0,0,.08));clip-path:polygon(0 0,100% 0,100% 90%,92% 100%,0 100%);padding:30px 18px 16px;color:${tone[c].ink}`)}">
          <div style="font:700 23px/1.1 Plex;letter-spacing:.02em">${s.num}. ${esc(s.label)}</div>
          <div style="margin-top:10px;height:3px;background:${tone[c].ink};opacity:.35"></div>
          <div class="hand" style="margin-top:10px;font-size:39px;font-weight:600;line-height:1">${esc(s.cells[c])}</div>
        </div>
        <div style="${abs(colW - 28, 222, 28, 28, `background:linear-gradient(135deg,transparent 50%,rgba(0,0,0,.22) 50%);clip-path:polygon(100% 0,0 100%,100% 100%)`)}"></div>
        ${pushPin(colW / 2, 6, ["#c4573e", "#f6f1e6", "#2f2f35"][(r + c) % 3])}
      </div>`);
    });
  });
  // The same order, read down: one pencil line beside each row of the three columns.
  return printable({ n: 44, paper: "#e2e8ee", extraCss: exampleCss, scene: `${wall}${out.join("")}${exampleTag(46, 1300, -2)}${pencil({ x: 520, y: 1296, len: 380, rot: -2, body: "#c4573e" })}` });
}

/* ------------------------------------------------------------------ #60 */

function divisionSketch(x, y) {
  return `<div style="${abs(x, y, 250, 152, "transform:rotate(4deg);z-index:3")}">
    <svg viewBox="0 0 250 152" style="position:absolute;left:0;top:0;width:250px;height:152px;filter:${SHADOW}" aria-hidden="true">
      <path d="M0 0 H250 V152 H44 L0 108 Z" fill="#fffdf6"/>
      <path d="M0 108 L44 152 L44 118 Q 44 108 34 108 Z" fill="#e4dac6"/>
      <path d="M0 108 L34 108 Q44 108 44 118 L44 152" fill="none" stroke="#b9ac92" stroke-width="2"/>
      <g stroke="#9a9a9f" stroke-width="2" stroke-opacity=".6"><path d="M60 18 H236 M60 46 H236 M60 74 H236 M60 102 H236 M60 130 H236"/></g>
      <g fill="none" stroke="#33363b" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"><path d="M88 34 V104 Q 88 116 100 116"/><path d="M88 34 H228"/><path d="M104 54 q10 -14 16 2 t16 -4 q10 -8 14 6 t16 -2 t16 4 t14 -2"/><path d="M52 74 q8 -10 14 2 t12 -2"/><path d="M110 88 q8 -10 14 2 t14 -4 q8 -6 14 4"/><path d="M106 134 q8 -8 12 2 t14 -4 q8 -6 14 4"/></g>
      <path d="M70 30 C 150 4, 236 32, 214 84 C 196 128, 80 124, 82 76 C 84 38, 170 20, 226 54" fill="none" stroke="#c4573e" stroke-width="4.2" stroke-linecap="round" opacity=".85"/>
    </svg></div>`;
}

function pin60() {
  const i = idea(60);
  const [sit, move, cut, stuck] = i.items;
  const calX = 46, calY = 396, calW = 908, calH = 770;
  const gx = 70, gy = 482, cw = 123, rh = 168;
  const sheetBg = `<div style="${abs(calX, calY, calW, calH, `background:#fbf8f0;border-radius:6px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 24px 40px rgba(40,20,5,.45);transform:rotate(-.5deg)`)}">
    <div style="${abs(0, 0, calW, 70, `background:${C.plum};border-radius:6px 6px 0 0`)}"></div>
    ${Array.from({ length: 12 }, (_, k) => `<div style="${abs(40 + k * 76, 8, 18, 18, "background:#2b2230;border-radius:50%;box-shadow:inset 0 2px 3px rgba(0,0,0,.6)")}"></div><div style="${abs(46 + k * 76, -10, 6, 40, "background:linear-gradient(90deg,#d9dce0,#8f9399);border-radius:3px;box-shadow:1px 2px 3px rgba(0,0,0,.35)")}"></div>`).join("")}
    <svg style="${abs(0, 0, calW, calH)}" viewBox="0 0 ${calW} ${calH}" aria-hidden="true"><g stroke="#cfc5b0" stroke-width="2">${Array.from({ length: 8 }, (_, k) => `<line x1="${gx - calX + k * cw}" y1="${gy - calY}" x2="${gx - calX + k * cw}" y2="${gy - calY + rh * 4}"/>`).join("")}${Array.from({ length: 5 }, (_, k) => `<line x1="${gx - calX}" y1="${gy - calY + k * rh}" x2="${gx - calX + 7 * cw}" y2="${gy - calY + k * rh}"/>`).join("")}</g></svg></div>`;
  const note = (col, row, span, text, color, rot, seed, tapeColor) => {
    const x = gx + col * cw + 4, y = gy + row * rh + 6, w = span * cw - 8, h = rh - 12;
    return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:3;filter:${SHADOW}`)}"><div data-check="note" style="${abs(0, 0, w, h, `background:${color};clip-path:${torn(seed, w, h, 8, 19)};padding:22px 20px 18px;font:600 33px/1.02 Hand;color:#26212c;display:flex;align-items:center`)}">${esc(text)}</div></div>${tape(x + w / 2, y + 3, 96, rot * 3, tapeColor)}`;
  };
  const notes = `${note(0, 0, 4, sit, "#fffdf6", -1.2, 3, "rgba(138,161,130,.85)")}
    ${divisionSketch(gx + 4 * cw + 30, gy + 8)}
    ${note(1, 1, 4, move, "#f6e3b8", 1, 7, "rgba(106,74,114,.6)")}
    ${note(2, 2, 5, cut, "#dce8f2", -.9, 12, "rgba(224,169,90,.8)")}
    ${note(3, 3, 4, stuck, "#f4d3cb", 1.2, 15, "rgba(138,161,130,.85)")}`;
  const closing = `<div style="${abs(46, 1190, 908, 140, `transform:rotate(.4deg);z-index:3;filter:${SHADOW}`)}"><div data-check="closing" style="${abs(0, 0, 908, 140, `background:#fffdf6;clip-path:${torn(21, 908, 140, 7, 24)};padding:34px 30px 18px;font:500 27px/1.28 Plex;color:#26212c;display:flex;align-items:center`)}">${esc(i.sub)}</div></div>${tape(150, 1194, 130, -3, "rgba(224,169,90,.8)")}`;
  return printable({
    n: 60,
    sub: false,
    scene: `${desk({ top: 0, height: 1500, planks: 7, seed: 14 })}${sheetBg}${notes}${closing}${exampleTag(792, 410, 3)}`,
    extraCss: `${exampleCss}.example{z-index:8}`,
    paper: "#f1e6d6",
  });
}

/* ------------------------------------------------------------------ #42 */

function pin42() {
  const i = idea(42);
  const quote = i.proof.slice(1).join(" ");
  const gingham = `<div style="${abs(0, 0, 1000, 1500, `background:repeating-linear-gradient(0deg,rgba(106,74,114,.3) 0 56px,transparent 56px 112px),repeating-linear-gradient(90deg,rgba(106,74,114,.3) 0 56px,transparent 56px 112px),#fbf5ea`)}"></div><div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 25% 15%,rgba(255,255,255,.2),rgba(60,30,60,.22))")}"></div>`;
  const draw = drawing({ x: 70, y: 640, w: 860, rot: -2 });
  const card = `<div style="${abs(130, 452, 650, 486, "transform:rotate(1.6deg);z-index:3")}">
    <div style="${abs(0, 0, 650, 486, `background:#fffdf6;border-radius:6px;filter:${SHADOW};overflow:hidden`)}">
      <div style="${abs(0, 0, 650, 486, "background:repeating-linear-gradient(180deg,transparent 0 77px,#c4d3e3 77px 79px);top:46px;opacity:.8")}"></div>
      <div style="${abs(0, 0, 650, 56, "background:#f2e6cf")}"></div>
      <div data-check="quote" style="${abs(44, 72, 570, 330, "font:700 76px/1.03 Hand;color:#2c2540")}">${esc(quote)}</div>
      <div class="serif" style="${abs(44, 420, 560, 50, `font-size:36px;font-style:italic;color:${C.plumDeep}`)}">The Homeschool Year</div>
    </div>
    ${binderClip({ x: 262, y: -52, rot: 0, size: 130 })}
  </div>`;
  const washi = tape(110, 650, 130, -38, "rgba(224,169,90,.82)") + tape(890, 660, 120, 34, "rgba(138,161,130,.85)");
  return printable({ n: 42, paper: "#f6efe0", extraCss: ".top h1{font-size:56px}", scene: `${gingham}${draw}${washi}${card}${pencil({ x: 440, y: 1268, len: 420, rot: -4 })}` });
}

export const pins = [pin81(), pin90(), pin44(), pin60(), pin42()];
