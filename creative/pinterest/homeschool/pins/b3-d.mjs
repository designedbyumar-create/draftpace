/**
 * Batch 3, set D: the four-day-week guides (four-day-homeschool-week and
 * homeschool-weekly-plan-with-a-spare-day), four pins in four worlds:
 *   33 a fridge door: three magnetic week rows, label-maker tape, one open day each
 *   36 a slate-blue pegboard: six oak rails, a peg for each day a subject gets
 *   38 an open notebook on a mustard knit blanket: the ordinary week, then the sick-Tuesday week
 *   62 a teal breakfast table: two paper year ribbons and an index-card answer beside tea and toast
 * Every word is the idea bank's own (headline, sub, items, proof).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, pencil, mug } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(30,15,5,.25)) drop-shadow(0 10px 12px rgba(30,15,5,.28))";
const BOTTOM = 1354;
const exampleCss = `.example{font-size:22px;color:#2a2530;background:#fffdf6;padding:7px 13px;box-shadow:0 2px 4px rgba(0,0,0,.25)}`;

/** A strip of washi tape centred on (x, y). */
function tape(x, y, w = 140, rot = -4, color = "rgba(224,169,90,.8)") {
  return `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.3) 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:4;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 40%,100% 55%,97% 72%,100% 88%,98% 100%,6% 100%,3% 90%,0 100%,2% 60%,0 30%)`)}"></div>`;
}

/** A round fridge magnet centred on (x, y). */
function roundMagnet(x, y, color = "#e0a95a", r = 17) {
  return `<div style="${abs(x - r, y - r, r * 2, r * 2, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff8,${color} 45%,${color});box-shadow:0 3px 5px rgba(0,0,0,.35),inset 0 -3px 4px rgba(0,0,0,.2);z-index:4`)}"></div>`;
}

/* ------------------------------------------------------------------ #33 */

function pin33() {
  const i = idea(33);
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const rowsData = i.items.map((line) => {
    const [label, rest] = [line.split(": ")[0], line.split(": ").slice(1).join(": ")];
    const [daysSentence, caption] = [rest.split(". ")[0], rest.split(". ").slice(1).join(". ")];
    const taught = DAYS.map((d) => daysSentence.includes(d));
    return { label, caption, taught };
  });
  const tileW = 156, gap = 6, x0 = 112;
  const fridge = `<div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:linear-gradient(90deg,#c3d2cd 0,#e4eeea 8%,#dbe7e3 60%,#cddbd6 100%)")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.55),rgba(60,90,85,.12) 70%)")}"></div>
    <div style="${abs(22, SCENE_TOP + 40, 34, 820, "border-radius:17px;background:linear-gradient(90deg,#8e969b,#e9edef 40%,#aab1b6);box-shadow:8px 10px 14px rgba(30,50,45,.35)")}"></div>
    <div style="${abs(50, SCENE_TOP + 70, 30, 14, "background:#9aa1a6;border-radius:4px;box-shadow:3px 4px 6px rgba(30,50,45,.3)")}"></div>
    <div style="${abs(50, SCENE_TOP + 800, 30, 14, "background:#9aa1a6;border-radius:4px;box-shadow:3px 4px 6px rgba(30,50,45,.3)")}"></div>`;
  const rows = rowsData
    .map((r, k) => {
      const top = SCENE_TOP + 26 + k * 322;
      const rot = [-0.6, 0.5, -0.4][k];
      const label = `<div style="position:absolute;left:${x0 - 6}px;top:${top}px;height:52px;padding:0 24px;display:flex;align-items:center;background:#2c2a33;color:#fffdf6;font:600 30px 'Plex Mono';letter-spacing:.04em;border-radius:4px;transform:rotate(${rot}deg);box-shadow:0 3px 5px rgba(30,50,45,.35),inset 0 0 0 2px #46434f;z-index:3" data-check="label">${esc(r.label)}</div>`;
      const tiles = DAYS.map((d, c) => {
        const x = x0 + c * (tileW + gap);
        const y = top + 66;
        const tilt = ((c * 7 + k * 3) % 5 - 2) * 0.35;
        if (r.taught[c]) {
          return `<div data-check="tile" style="${abs(x, y, tileW, 124, `border-radius:14px;background:linear-gradient(160deg,#8d5aa0,${C.plum} 45%,${C.plumDeep});color:#fffdf6;display:grid;place-items:center;font:600 25px Plex;letter-spacing:-.01em;transform:rotate(${tilt}deg);box-shadow:0 2px 3px rgba(30,15,50,.35),0 12px 16px rgba(30,50,45,.3),inset 0 2px 0 rgba(255,255,255,.28);z-index:2`)}">${d}</div>`;
        }
        return `<div data-check="open" style="${abs(x, y, tileW, 124, "border-radius:14px;border:3px dashed #5f7d75;background:rgba(255,255,255,.4);color:#4a6a62;display:grid;place-items:center;font:600 25px Plex;letter-spacing:-.01em;box-shadow:inset 0 2px 5px rgba(50,80,75,.18)")}">${d}</div>`;
      }).join("");
      const note = `<div data-check="caption" style="${abs(x0 + 12, top + 206, 790, 84, `background:#fffefa;border-radius:4px;transform:rotate(${-rot * 0.7}deg);box-shadow:0 2px 3px rgba(30,50,45,.25),0 9px 14px rgba(30,50,45,.22);display:flex;align-items:center;padding:0 24px 0 56px;text-wrap:balance;font:500 26px/1.22 Plex;color:#2a2530;z-index:2`)}">${esc(r.caption)}</div>`;
      return label + tiles + note + roundMagnet(x0 + 36, top + 248, ["#e0a95a", "#c4573e", "#5b7a9a"][k], 14);
    })
    .join("");
  return printable({ n: 33, paper: "#e7eeea", scene: `${fridge}${rows}`, extraCss: ".top h1{font-size:80px}" });
}

/* ------------------------------------------------------------------ #36 */

function pin36() {
  const i = idea(36);
  const subjectColor = { Math: "#a566b8", Reading: "#e0a95a", Writing: "#8fb88a", Science: "#6cb4d6", History: "#d9805f", Geography: "#e8d7a0" };
  const holes = `background-color:#4f6b85;background-image:radial-gradient(circle at 20px 20px,#2a3d50 0 6.5px,transparent 7.5px),radial-gradient(circle at 21px 22px,rgba(255,255,255,.18) 0 7px,transparent 8px);background-size:40px 40px`;
  const board = `<div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, holes)}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:radial-gradient(ellipse at 25% 8%,rgba(255,255,255,.18),rgba(10,20,35,.38))")}"></div>`;
  const pitch = 148;
  const rows = i.items
    .map((line, k) => {
      const [head, why] = [line.split(": ")[0], line.split(": ").slice(1).join(": ")];
      const [subject, daysTxt] = head.split(", ");
      const n = parseInt(daysTxt, 10);
      const y = SCENE_TOP + 26 + k * pitch;
      const col = subjectColor[subject];
      // the oak rail with four peg holes (a four day week) and a peg in each day the subject gets
      const railX = 312, railW = 292;
      const pegs = [0, 1, 2, 3]
        .map((c) => {
          const cx = railX + 40 + c * 71;
          const cy = y + 56;
          return c < n
            ? `<div style="${abs(cx - 27, cy - 27, 54, 54, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff9,${col} 42%,${col});box-shadow:0 5px 6px rgba(0,0,0,.4),inset 0 -4px 5px rgba(0,0,0,.22),0 0 0 3px rgba(0,0,0,.18);z-index:3`)}"></div>`
            : `<div style="${abs(cx - 20, cy - 20, 40, 40, "border-radius:50%;background:#4a331c;box-shadow:inset 0 4px 6px rgba(0,0,0,.7),0 1px 0 rgba(255,255,255,.25);z-index:2")}"></div>`;
        })
        .join("");
      const rail = `<div style="${abs(railX, y + 8, railW, 96, "border-radius:12px;background:linear-gradient(180deg,#d9ac76,#c99b66 50%,#b58652);box-shadow:0 3px 4px rgba(0,0,0,.35),0 12px 16px rgba(5,15,30,.4);z-index:1")}"></div>
        <div style="${abs(railX + 8, y + 40, railW - 16, 2, "background:rgba(100,60,20,.18);z-index:1")}"></div>
        <div style="${abs(railX + 10, y + 74, railW - 20, 2, "background:rgba(100,60,20,.14);z-index:1")}"></div>
        <div style="${abs(railX - 14, y + 44, 22, 22, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9aa1a6);box-shadow:0 3px 4px rgba(0,0,0,.4);z-index:2")}"></div>
        <div style="${abs(railX + railW - 8, y + 44, 22, 22, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9aa1a6);box-shadow:0 3px 4px rgba(0,0,0,.4);z-index:2")}"></div>`;
      const tag = `<div data-check="tag" style="${abs(40, y + 2, 244, 108, `background:#fbf4e3;border-radius:6px 20px 20px 6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 10px 14px rgba(5,15,30,.35);padding:14px 10px 8px 38px;z-index:3`)}">
          <div style="${abs(14, 42, 14, 14, "border-radius:50%;background:#4f6b85;box-shadow:inset 0 2px 3px rgba(0,0,0,.5)")}"></div>
          <div class="serif" style="font-size:38px;line-height:1.05;font-weight:600;color:#2a2530">${esc(subject)}</div>
          <div style="font:600 27px/1.2 Plex;color:${C.plumDeep};margin-top:4px">${esc(daysTxt)}</div>
        </div>`;
      const note = `<div data-check="why" style="${abs(636, y + 2, 322, 108, `background:#fffefa;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 10px 14px rgba(5,15,30,.35);padding:0 18px;display:flex;align-items:center;font:500 25px/1.22 Plex;color:#2a2530;z-index:3`)}">${esc(why)}</div>`;
      return tag + rail + pegs + note;
    })
    .join("");
  const exampleTag = `<span class="example" style="position:absolute;left:46px;top:${SCENE_TOP + 26 + 6 * pitch - 6}px;transform:rotate(-2deg);z-index:6">Example</span>`;
  return printable({ n: 36, paper: "#e8edf2", scene: `${board}${rows}${exampleTag}`, extraCss: `${exampleCss}.top h1{font-size:62px}` });
}

/* ------------------------------------------------------------------ #38 */

function pin38() {
  const i = idea(38);
  const blanket = `<div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.1) 0 6px,rgba(0,0,0,.06) 6px 12px),repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 8px,rgba(0,0,0,.07) 8px 16px),#d6a03a")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:radial-gradient(ellipse at 25% 8%,rgba(255,255,255,.28),rgba(90,45,5,.34))")}"></div>`;
  const chipCol = ["#a566b8", "#e0a95a", "#6f9f6a", "#5b9bc2"];
  const chipsRow = (mathState) => {
    return chipCol
      .map((c, k) => {
        const x = k * 64;
        if (k === 0 && mathState === "ghost")
          return `<div style="${abs(x, 0, 58, 46, "border-radius:8px;border:3px dashed #a566b8")}"></div>`;
        return `<div style="${abs(x, 0, 58, 46, `border-radius:8px;background:${c};box-shadow:0 2px 3px rgba(0,0,0,.28);${k === 0 ? "color:#fffdf6;display:grid;place-items:center;font:600 22px Plex" : ""}`)}">${k === 0 ? "math" : ""}</div>`;
      })
      .join("");
  };
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const NB_Y = 404, NB_H = 640, PW = 450, PX = 50;
  const ROWS_Y = 262, PITCH = 74;
  const page = (side) => {
    const left = side === "left";
    const rowsHtml = DAYS.map((d, k) => {
      const y = ROWS_Y + k * PITCH;
      let inner;
      if (left) {
        inner = d === "Wednesday" ? `<div style="${abs(144, 0, 250, 46, "border-radius:8px;border:3px dashed #9b8f7a")}"></div>` : `<div style="${abs(144, 0, 250, 46)}">${chipsRow("full")}</div>`;
      } else if (d === "Tuesday") {
        inner = `<div style="${abs(144, 0, 250, 46)}">${chipsRow("ghost")}</div>`;
      } else if (d === "Wednesday") {
        inner = `<div style="${abs(144, 0, 250, 46)}">${chipsRow("full")}</div>`;
      } else inner = `<div style="${abs(144, 0, 250, 46)}">${chipsRow("full")}</div>`;
      return `<div style="${abs(26, y, 400, 46)}"><div style="${abs(0, 0, 140, 46, "display:flex;align-items:center;font:600 24px Plex;color:#2a2530")}">${d}</div>${inner}</div>`;
    }).join("");
    const text = left ? i.items[0] : i.items[1];
    return `<div style="${abs(left ? 0 : PW, 0, PW, NB_H, `background-color:#fffdf6;background-image:repeating-linear-gradient(180deg,transparent 0 35px,rgba(120,160,200,.3) 35px 37px),linear-gradient(${left ? 90 : 270}deg,#e6dcc4,rgba(255,253,246,0) 14%);border-radius:${left ? "10px 0 0 10px" : "0 10px 10px 0"}`)}">
      <div data-check="story" style="${abs(34, 24, 384, 224, `font:600 ${left ? 40 : 32}px/1.14 Hand;color:#2a2540;overflow:hidden`)}">${esc(text)}</div>
      ${rowsHtml}
    </div>`;
  };
  const notebook = `<div style="${abs(PX, NB_Y, PW * 2, NB_H, `filter:${SHADOW}`)}">
      <div style="${abs(-12, -10, PW * 2 + 24, NB_H + 20, "border-radius:16px;background:#3f4f7a")}"></div>
      ${page("left")}${page("right")}
      <div style="${abs(PW - 10, 0, 20, NB_H, "background:linear-gradient(90deg,rgba(0,0,0,0),rgba(60,40,10,.28) 50%,rgba(0,0,0,0))")}"></div>
    </div>`;
  // the arrow carrying Tuesday's math to Wednesday (right page, left edge of the chips)
  const ax = PX + PW + 26 + 144 + 29, ay1 = NB_Y + ROWS_Y + PITCH + 47, ay2 = NB_Y + ROWS_Y + 2 * PITCH - 1;
  const arrow = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:5" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke="${C.plumDeep}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M${ax} ${ay1 + 2} L${ax} ${ay2}"/><path d="M${ax - 10} ${ay2 - 11} L${ax} ${ay2} L${ax + 10} ${ay2 - 11}"/></g></svg>`;
  // the legend card, from the guide's own sentence
  const legendText = "a family teaches four subjects, math, reading, writing and science, four days a week each";
  const sw = (c, w) => `<span style="display:inline-flex;align-items:center;gap:8px;margin-right:18px"><i style="display:inline-block;width:26px;height:26px;border-radius:6px;background:${c}"></i>${w}</span>`;
  const legend = `<div style="${abs(66, 1086, 590, 226, "transform:rotate(-1.4deg);z-index:3")}">
      <div style="${abs(0, 0, 590, 226, `background:#fffdf6;border-radius:6px;filter:${SHADOW};overflow:hidden`)}">
        <div style="${abs(0, 0, 590, 226, "background:repeating-linear-gradient(180deg,transparent 0 41px,#c4d3e3 41px 43px);top:52px")}"></div>
        <div style="${abs(0, 0, 590, 46, "background:#f2e6cf")}"></div>
        <div data-check="legend" style="${abs(26, 56, 546, 92, "font:600 34px/1.1 Hand;color:#2a2540")}">${esc(legendText)}</div>
        <div style="${abs(26, 168, 548, 40, "font:500 22px/1.2 Plex;color:#2a2530;white-space:nowrap")}">${sw(chipCol[0], "math")}${sw(chipCol[1], "reading")}${sw(chipCol[2], "writing")}${sw(chipCol[3], "science")}</div>
      </div>${tape(295, 6, 130, -2, "rgba(138,161,130,.85)")}
    </div>`;
  const exampleTag = `<span class="example" style="position:absolute;left:480px;top:1096px;transform:rotate(-2deg);z-index:6;font-size:22px;padding:4px 10px;background:#fffdf6;box-shadow:none;border-color:#6b5f4f;color:#4b4339">Example</span>`;
  const props = mug({ x: 724, y: 1110, size: 190, color: "#f3ede4", drink: "#6b4226" }) + pencil({ x: 380, y: 1316, len: 420, rot: -3 });
  return printable({ n: 38, paper: "#f6ecd3", scene: `${blanket}${notebook}${arrow}${legend}${props}${exampleTag}`, extraCss: `${exampleCss}.top h1{font-size:60px}` });
}

/* ------------------------------------------------------------------ #62 */

function ribbon({ y, label, pattern, color, cellH }) {
  // pattern: array of [on(true)/off(false), count]; one column per week of the year
  const cols = [];
  for (const [on, n] of pattern) for (let k = 0; k < n; k++) cols.push(on);
  const pitch = 17, x0 = 22, base = 142;
  const cells = cols
    .map((on, c) => {
      const x = x0 + c * pitch;
      if (!on) return `<div style="${abs(x, base - 5 * pitch + 2, 13, 5 * pitch - 4, "border-left:2px dotted #b9ad97;border-right:2px dotted #b9ad97;opacity:.7")}"></div>`;
      return Array.from({ length: cellH }, (_, r) => `<div style="${abs(x, base - (r + 1) * pitch + 2, 13, 13, `background:${color};border-radius:3px`)}"></div>`).join("");
    })
    .join("");
  return `<div style="${abs(30, y, 940, 190, "z-index:3;transform:rotate(" + (y < 600 ? -0.5 : 0.5) + "deg)")}">
    <div style="${abs(0, 0, 940, 190, `background:#fbf6ea;border-radius:5px;filter:${SHADOW};box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)`)}"></div>
    <div data-check="rlabel" style="${abs(190, 16, 600, 36, `font:600 27px/1.2 Plex;color:${color === C.plum ? C.plumDeep : "#8f3a26"}`)}">${esc(label)}</div>
    ${cells}
    <div style="${abs(22, 152, 896, 3, "background:#cfc3ac")}"></div>
  </div>`;
}

function toast({ x, y }) {
  return `<svg style="${abs(x, y, 240, 200, "filter:drop-shadow(0 12px 10px rgba(0,0,0,.4))")}" viewBox="0 0 240 200" aria-hidden="true">
    <ellipse cx="120" cy="104" rx="116" ry="90" fill="#f6f1e7"/><ellipse cx="120" cy="104" rx="92" ry="70" fill="none" stroke="#d6cdbc" stroke-width="3"/>
    <g transform="rotate(-8 120 100)"><path d="M62 130 V76 C 42 58 56 30 90 34 C 106 22 134 22 150 34 C 184 30 198 58 178 76 V130 Q 120 140 62 130 Z" fill="#c98d4a"/>
    <path d="M72 124 V80 C 56 66 64 44 92 46 C 108 36 132 36 148 46 C 176 44 184 66 168 80 V124 Q 120 132 72 124 Z" fill="#f0cf94"/>
    <path d="M86 76 Q 120 64 152 78 Q 150 106 118 108 Q 90 106 86 76 Z" fill="#f7e27a" opacity=".9"/></g></svg>`;
}

function pin62() {
  const i = idea(62);
  const table = desk({ top: SCENE_TOP, height: BOTTOM - SCENE_TOP, base: "#2f6f70", dark: "#285f62", planks: 5, seed: 8 });
  const A = [[false, 3], [true, 16], [false, 2], [true, 20], [false, 11]];
  // B: six-on blocks with a one-week break between them, then the last three
  const bPattern = [[true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 3]];
  const sum = (p, v) => p.filter(([o]) => o === v).reduce((a, [, n]) => a + n, 0);
  if (sum(bPattern, true) !== 45 || sum(bPattern, false) !== 7 || sum(A, true) !== 36 || sum(A, true) * 5 !== sum(bPattern, true) * 4) throw new Error("year strips must hold the same total work");
  const rA = ribbon({ y: 404, label: "five days of content", pattern: A, color: "#c4573e", cellH: 5 });
  const rB = ribbon({ y: 640, label: "four days year-round", pattern: bPattern, color: C.plum, cellH: 4 });
  const tapes = tape(110, 408, 120, -3, "rgba(224,169,90,.85)") + tape(900, 410, 120, 3, "rgba(224,169,90,.85)") + tape(110, 644, 120, 3, "rgba(224,169,90,.85)") + tape(900, 646, 120, -3, "rgba(224,169,90,.85)");
  const card = `<div style="${abs(56, 940, 640, 330, "transform:rotate(-1.6deg);z-index:3")}">
    <div style="${abs(0, 0, 640, 330, `background:#fffdf6;border-radius:6px;filter:${SHADOW};overflow:hidden`)}">
      <div style="${abs(0, 0, 640, 330, "background:repeating-linear-gradient(180deg,transparent 0 57px,#c4d3e3 57px 59px);top:30px;opacity:.85")}"></div>
      <div style="${abs(0, 54, 640, 3, "background:#e08a8a")}"></div>
      <div data-check="answer" style="${abs(34, 20, 580, 300, "font:700 46px/1.1 Hand;color:#2a2540;overflow:hidden;display:flex;align-items:center")}">${esc(i.items[0])}</div>
    </div>${tape(320, 4, 140, -2, "rgba(138,161,130,.85)")}
  </div>`;
  const props = mug({ x: 726, y: 960, size: 190, color: "#f3ede4", drink: "#a86a2c" }) + toast({ x: 732, y: 1130 });
  return printable({ n: 62, paper: "#e9f0ec", scene: `${table}${rA}${rB}${tapes}${card}${props}`, extraCss: ".top h1{font-size:58px}" });
}

export const pins = [pin33(), pin36(), pin38(), pin62()];
