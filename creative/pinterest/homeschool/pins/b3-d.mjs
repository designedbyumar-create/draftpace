/**
 * Batch 3, set D: the four-day-week guides (four-day-homeschool-week and
 * homeschool-weekly-plan-with-a-spare-day), four pins in four worlds:
 *   33 a blush plaster wall in window light: three washi-taped paper week strips with kraft label tabs
 *   36 a slate-blue pegboard: six oak rails, a peg for each day a subject gets
 *   38 an open notebook on a mustard knit blanket: the ordinary week, then the sick-Tuesday week
 *   62 a garden trellis: two paper year ribbons and an index-card answer pegged on twine lines
 * Every word is the idea bank's own (headline, sub, items, proof).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { pencil, mug } from "../kit/paper.mjs";
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
  // a blush plaster wall with window light falling across it
  const r = seeded(5);
  const speck = Array.from({ length: 260 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(r() * 982).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#7a3b2c"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:linear-gradient(180deg,#e4b3a2,#d79e8c)")}"></div>
    <svg style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP)}" viewBox="0 0 1000 982" aria-hidden="true">${speck}
      <g fill="#fff3d6" opacity=".3"><polygon points="520,-20 770,-20 1060,330 810,330"/><polygon points="830,350 1080,350 1120,560 870,560"/><polygon points="440,10 490,10 700,330 650,330" opacity=".6"/></g>
    </svg>
    <div style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP, "background:radial-gradient(ellipse at 80% 5%,rgba(255,244,220,.25),rgba(80,30,20,.3) 95%)")}"></div>`;
  const x0 = 54, W = 892, cellW = W / 5;
  const rows = rowsData
    .map((rw, k) => {
      const top = SCENE_TOP + 22 + k * 322;
      const rot = [-0.7, 0.5, -0.4][k];
      const cells = DAYS.map((d, c) => {
        const on = rw.taught[c];
        return `<div style="${abs(c * cellW, 0, cellW, 128, on ? `background:linear-gradient(180deg,${C.plumSoft},#dccbe6);border-right:2px solid rgba(60,30,80,.2)` : "border-right:2px solid rgba(60,30,80,.2)")}">
          <div style="${abs(0, 0, cellW, 128, `display:grid;place-items:center;font:${on ? 600 : 500} ${on ? 27 : 26}px Newsreader;color:${on ? C.plumDeep : "#9a8d78"}`)}">${d}</div>
          ${on ? `<div style="${abs(10, 112, cellW - 22, 7, `background:${C.plum};border-radius:4px`)}"></div>` : `<div style="${abs(8, 8, cellW - 20, 112, "border:3px dashed #b3a58c;border-radius:6px")}"></div>`}
        </div>`;
      }).join("");
      const strip = `<div style="${abs(x0, top + 62, W, 128, `background:#fbf6ea;filter:${SHADOW};transform:rotate(${rot}deg);z-index:2`)}"><div style="${abs(0, 0, W, 128, "overflow:hidden;border-radius:3px")}">${cells}</div></div>`;
      const label = `<div data-check="label" style="${abs(x0 + 8, top, 10, 56, `transform:rotate(${rot}deg);z-index:3`)}"></div><div style="position:absolute;left:${x0 + 8}px;top:${top + 2}px;height:56px;padding:0 24px 0 28px;display:flex;align-items:center;background:#c8a679;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,14px 50%);font:600 38px Newsreader;color:#2a1c0c;transform:rotate(${rot}deg);filter:${SHADOW};z-index:3" data-check="label2">${esc(rw.label)}</div>`;
      const slip = `<div style="${abs(x0 + 40, top + 218, 800, 78, `transform:rotate(${-rot}deg);z-index:2;filter:${SHADOW}`)}"><div data-check="caption" style="${abs(0, 0, 800, 78, "background:#fffdf6;border-radius:4px;padding:0 24px;display:flex;align-items:center;text-wrap:balance;font:500 26px/1.22 Plex;color:#2a2530")}">${esc(rw.caption)}</div></div>`;
      const tapes = tape(x0 + 14, top + 66, 96, -38 + rot * 4, "rgba(138,161,130,.88)") + tape(x0 + W - 14, top + 66, 96, 38 + rot * 4, "rgba(138,161,130,.88)") + tape(x0 + 140, top + 220, 90, 4, "rgba(224,169,90,.88)");
      return strip + label.replace(/^<div data-check="label"[^>]*><\/div>/, "") + slip + tapes;
    })
    .join("");
  return printable({ n: 33, paper: "#f3e3dc", scene: `${wall}${rows}`, extraCss: ".top h1{font-size:80px}" });
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

function peg(x, y, rot = 0) {
  return `<div style="${abs(x - 12, y - 8, 24, 62, `transform:rotate(${rot}deg);z-index:5;filter:drop-shadow(3px 5px 3px rgba(0,0,0,.4))`)}"><div style="${abs(0, 0, 24, 62, "background:linear-gradient(90deg,#d9ac76,#c49158 50%,#a97a44);border-radius:5px 5px 3px 3px")}"></div><div style="${abs(11, 24, 2, 38, "background:rgba(60,30,5,.45)")}"></div><div style="${abs(0, 20, 24, 5, "background:#8b8f94")}"></div></div>`;
}

function ribbon({ y, label, pattern, color }) {
  // pattern: array of [on(true)/off(false), count]; one column per week of the year
  const cols = [];
  for (const [on, n] of pattern) for (let k = 0; k < n; k++) cols.push(on);
  const cellH = color === C.plum ? 4 : 5;
  const pitch = 17, x0 = 22, base = 150;
  const cells = cols
    .map((on, c) => {
      const x = x0 + c * pitch;
      if (!on) return `<div style="${abs(x, base - 5 * pitch + 2, 13, 5 * pitch - 4, "border-left:2px dotted #b9ad97;border-right:2px dotted #b9ad97;opacity:.7")}"></div>`;
      return Array.from({ length: cellH }, (_, r) => `<div style="${abs(x, base - (r + 1) * pitch + 2, 13, 13, `background:${color};border-radius:3px`)}"></div>`).join("");
    })
    .join("");
  const rot = y < 600 ? -0.5 : 0.5;
  return `<div style="${abs(30, y, 940, 192, `z-index:3;transform:rotate(${rot}deg)`)}">
    <div style="${abs(0, 0, 940, 192, `background:#fbf6ea;border-radius:4px;filter:${SHADOW}`)}"></div>
    <div data-check="rlabel" style="${abs(22, 14, 700, 36, `font:600 27px/1.2 Plex;color:${color === C.plum ? C.plumDeep : "#8f3a26"}`)}">${esc(label)}</div>
    ${cells}
    <div style="${abs(22, 156, 896, 3, "background:#cfc3ac")}"></div>
  </div>${peg(80, y - 6, rot * 3)}${peg(890, y - 6, rot * 3)}`;
}

/** A garden trellis: pale slats crossing at a diagonal over a deep green hedge, with a few ivy leaves. */
function trellis() {
  const r = seeded(14);
  const leaves = Array.from({ length: 46 }, () => {
    const x = r() * 1000, y = r() * 982, edge = r() > 0.5;
    const cx = edge ? (r() > 0.5 ? r() * 90 : 910 + r() * 90) : x;
    return `<ellipse cx="${cx.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(13 + r() * 9).toFixed(0)}" ry="${(8 + r() * 6).toFixed(0)}" fill="${["#3f7a4a", "#2f6a40", "#58935a"][Math.floor(r() * 3)]}" transform="rotate(${(r() * 180).toFixed(0)} ${cx.toFixed(0)} ${y.toFixed(0)})" opacity="${edge ? 0.95 : 0.5}"/>`;
  }).join("");
  return `<svg style="${abs(0, SCENE_TOP, 1000, BOTTOM - SCENE_TOP)}" viewBox="0 0 1000 982" aria-hidden="true">
    <defs><pattern id="lat" width="140" height="140" patternUnits="userSpaceOnUse" patternTransform="rotate(0)"><g stroke="#00000033" stroke-width="2"><path d="M-10 -10 L150 150 M150 -10 L-10 150" stroke-width="22" stroke="#00000030" transform="translate(4 6)"/></g><path d="M-10 -10 L150 150 M150 -10 L-10 150" stroke-width="20" stroke="#efe6cf"/><path d="M-10 -10 L150 150" stroke-width="20" stroke="#fff" opacity=".18"/></pattern>
    <radialGradient id="lg" cx="30%" cy="5%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#05200f" stop-opacity=".45"/></radialGradient></defs>
    <rect width="1000" height="982" fill="#2f5a3b"/><rect width="1000" height="982" fill="url(#lat)"/>${leaves}<rect width="1000" height="982" fill="url(#lg)"/>
  </svg>`;
}

function twine(y0, y1) {
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:4" viewBox="0 0 1000 1500" aria-hidden="true"><path d="M-10 ${y0} Q 500 ${y1} 1010 ${y0}" fill="none" stroke="#00000040" stroke-width="7" transform="translate(2 5)"/><path d="M-10 ${y0} Q 500 ${y1} 1010 ${y0}" fill="none" stroke="#e3cf9b" stroke-width="5"/></svg>`;
}

function pin62() {
  const i = idea(62);
  const A = [[false, 3], [true, 16], [false, 2], [true, 20], [false, 11]];
  const bPattern = [[true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 6], [false, 1], [true, 3]];
  const sum = (p, v) => p.filter(([o]) => o === v).reduce((a, [, n]) => a + n, 0);
  if (sum(bPattern, true) !== 45 || sum(bPattern, false) !== 7 || sum(A, true) !== 36 || sum(A, true) * 5 !== sum(bPattern, true) * 4) throw new Error("year strips must hold the same total work");
  const rA = ribbon({ y: 420, label: "five days of content", pattern: A, color: "#c4573e" });
  const rB = ribbon({ y: 676, label: "four days year-round", pattern: bPattern, color: C.plum });
  const card = `<div style="${abs(80, 950, 700, 336, "transform:rotate(1.2deg);z-index:3")}">
    <div style="${abs(0, 0, 700, 336, `background:#fffdf6;border-radius:6px;filter:${SHADOW};overflow:hidden`)}">
      <div style="${abs(0, 0, 700, 336, "background:repeating-linear-gradient(180deg,transparent 0 57px,#c4d3e3 57px 59px);top:30px;opacity:.85")}"></div>
      <div style="${abs(0, 54, 700, 3, "background:#e08a8a")}"></div>
      <div data-check="answer" style="${abs(36, 20, 628, 300, "font:700 47px/1.1 Hand;color:#2a2540;overflow:hidden;display:flex;align-items:center")}">${esc(i.items[0])}</div>
    </div>
  </div>${peg(210, 940, 4)}${peg(640, 940, -3)}`;
  return printable({ n: 62, paper: "#e6efe4", scene: `${trellis()}${twine(402, 424)}${twine(658, 680)}${twine(930, 952)}${rA}${rB}${card}`, extraCss: ".top h1{font-size:58px}" });
}

export const pins = [pin33(), pin36(), pin38(), pin62()];
