/**
 * Batch 3, module e: #54, #58, #66, #11.
 * Four different worlds: a mint fridge door with a quote card on magnets
 * (#54), a butter-yellow breakfast table with a day-timeline (#58), a
 * notebook open flat on a slate desk with a red pencil (#66), and a dusty
 * plum pegboard with a quote card on hooks and a jar of pencils (#11).
 * Every word is the idea bank's own (headline, sub, items).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { sheet, pencil, drawing } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(30,15,5,.22)) drop-shadow(0 12px 14px rgba(30,15,5,.28))";

/** Replace `phrase` in already-escaped text with a highlighted span. */
function mark(text, phrase, style) {
  const t = esc(text);
  const p = esc(phrase);
  if (!t.includes(p)) throw new Error(`"${phrase}" is not in "${text}"`);
  return t.replace(p, `<span style="${style}">${p}</span>`);
}

/* ------------------------------------------------------------------ #54 */

/** A round fridge magnet centred on (x, y). */
function magnet(x, y, color, r = 30) {
  return `<div style="${abs(x - r, y - r, r * 2, r * 2, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff8 0 12%,transparent 30%),${color};box-shadow:0 3px 2px rgba(0,0,0,.25),5px 9px 8px rgba(0,0,0,.28);z-index:6`)}"></div>`;
}

function pin54() {
  const i = idea(54);
  const quote = i.items[0];
  const fridge = `<svg style="${abs(0, SCENE_TOP, 1000, 1128)}" viewBox="0 0 1000 1128" aria-hidden="true"><defs>
      <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b6d6c7"/><stop offset=".35" stop-color="#c7e2d4"/><stop offset=".6" stop-color="#bcdacb"/><stop offset="1" stop-color="#a3c7b6"/></linearGradient>
      <linearGradient id="hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d8a88"/><stop offset=".45" stop-color="#e9efee"/><stop offset="1" stop-color="#8d9997"/></linearGradient></defs>
    <rect width="1000" height="1128" fill="url(#fg)"/>
    <rect x="0" y="0" width="1000" height="14" fill="#8fb5a3"/>
    <path d="M0 52 H1000" stroke="#7fa595" stroke-width="3" opacity=".7"/>
    <rect x="0" y="0" width="1000" height="1128" fill="none"/>
    <rect x="42" y="130" width="34" height="520" rx="17" fill="url(#hg)"/><rect x="42" y="130" width="34" height="520" rx="17" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
    <rect x="68" y="168" width="22" height="44" fill="#6c7876"/><rect x="68" y="570" width="22" height="44" fill="#6c7876"/>
    <rect x="0" y="0" width="1000" height="1128" fill="url(#fv)" opacity="0"/>
    <path d="M930 40 V1100" stroke="#fff" stroke-opacity=".25" stroke-width="16"/>
  </svg>`;
  const counter = `<div style="${abs(0, 1262, 1000, 100, "background:linear-gradient(#c99b66,#b0834d);box-shadow:0 -6px 14px rgba(30,60,50,.4)")}"></div><div style="${abs(0, 1256, 1000, 12, "background:#8a6234")}"></div>`;

  const card = `<div style="${abs(150, 436, 740, 640, `transform:rotate(-1.6deg);z-index:4;filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 740, 640, "background:#fffcf3;border-radius:4px")}"></div>
    <div class="serif" style="${abs(40, 6, 120, 140, `font-size:170px;line-height:1;color:#c4573e;opacity:.9`)}">&ldquo;</div>
    <div class="serif" data-check="quote" style="${abs(54, 118, 632, 410, "font-size:57px;line-height:1.16;font-weight:500;color:#26211c;letter-spacing:-.005em")}">${mark(quote, "no room in it for an ordinary bad day", "color:#b2412a;font-style:italic")}</div>
    <div style="${abs(54, 548, 90, 4, "background:#c4573e")}"></div>
    <div class="serif" style="${abs(54, 568, 632, 40, "font-size:30px;font-weight:500;color:#5a4f43;letter-spacing:.02em")}">The Homeschool Year</div>
  </div>
  ${magnet(330, 450, "#c4573e", 32)}${magnet(796, 428, "#e0a95a", 32)}`;

  const art = `${drawing({ x: 70, y: 1100, w: 270, rot: -4 })}${magnet(210, 1096, "#5f8a8f", 28)}`;
  // A strip of fruit magnets across the lower right.
  const fruit = `${magnet(640, 1170, "#d86a4f", 34)}${magnet(722, 1130, "#7a4b8a", 30)}${magnet(800, 1172, "#e0a95a", 34)}`;
  // The mug: half drunk, seen from the front on the counter.
  const mug = `<svg style="${abs(660, 1090, 280, 200, "z-index:6;filter:drop-shadow(0 12px 8px rgba(40,20,5,.4))")}" viewBox="0 0 280 200" aria-hidden="true">
    <path d="M178 52 C 240 44 246 134 176 138" fill="none" stroke="#f3ede4" stroke-width="22" stroke-linecap="round"/>
    <path d="M60 24 H176 V146 Q176 174 148 174 H88 Q60 174 60 146 Z" fill="#f3ede4"/><path d="M60 24 H176 V44 H60 Z" fill="#fff" opacity=".35"/>
    <path d="M60 80 H176 V100 H60 Z" fill="#c4573e" opacity=".85"/>
    <ellipse cx="118" cy="24" rx="58" ry="10" fill="#6b4226"/><ellipse cx="118" cy="22" rx="58" ry="8" fill="#8a5a36"/>
    <path d="M96 4 C 86 -6 104 -14 96 -26 M130 6 C 120 -4 138 -12 130 -24" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round" transform="translate(0 20)"/></svg>`;
  return printable({ n: 54, paper: "#eef0e6", scene: `${fridge}${counter}${card}${art}${mug}`.replace(fruit, "") });
}

/* ------------------------------------------------------------------ #58 */

function pin58() {
  const i = idea(58);
  const linen = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs>
    <pattern id="wv" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 4 H8" stroke="#b78e2a" stroke-opacity=".16" stroke-width="1.4"/><path d="M4 0 V8" stroke="#b78e2a" stroke-opacity=".12" stroke-width="1.4"/></pattern>
    <linearGradient id="sun" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff7d6" stop-opacity=".85"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="#f2d98a"/><rect width="1000" height="1500" fill="url(#wv)"/>
    <g fill="url(#sun)"><path d="M-40 420 L470 372 L1000 1000 L420 1060 Z" opacity=".75"/><path d="M520 372 L1000 372 L1000 760 Z" opacity=".6"/><path d="M-40 1000 L420 1130 L220 1400 L-40 1400 Z" opacity=".5"/></g>
    <rect x="0" y="372" width="1000" height="1128" fill="#a8741a" opacity=".07"/></svg>`;

  // Timeline: five blocks of the day; the hard subject is first, a dashed ghost where it used to sit.
  const tx = 56, ty = 440, tw = 168, gap = 16;
  const tiles = [0, 1, 2, 3, 4].map((k) => {
    const x = tx + k * (tw + gap);
    if (k === 0) {
      return `<div style="${abs(x, ty - 26, tw, 190, `background:${C.plum};border-radius:14px;transform:rotate(-1.5deg);box-shadow:0 12px 20px rgba(60,30,10,.35);color:#fff;z-index:3`)}">
        <div class="serif" data-check="hard" style="${abs(12, 18, tw - 24, 140, "font-size:34px;line-height:1.08;font-weight:600;display:flex;align-items:flex-end;letter-spacing:-.01em")}">Hard subject</div>
        <div style="${abs(tw - 56, 12, 40, 40, "")}">${icon("star", { size: 38, color: "#ffd98a", weight: "fill" })}</div></div>`;
    }
    if (k === 4) {
      return `<div style="${abs(x, ty, tw, 164, "border:4px dashed #8a6a2a;border-radius:14px;opacity:.7")}"></div>`;
    }
    const fills = ["#fffaf0", "#e6f0dd", "#fbe3d3"];
    return `<div style="${abs(x, ty, tw, 164, `background:${fills[k - 1]};border-radius:14px;box-shadow:0 8px 14px rgba(60,30,10,.25)`)}"></div>`;
  }).join("");
  const sunrise = `<div style="${abs(tx + 6, ty - 66, 60, 60)}">${icon("sun-horizon", { size: 58, color: "#d9822b", weight: "fill" })}</div>
    <div style="${abs(tx + 2 * (tw + gap) + 54, ty - 70, 60, 60)}">${icon("sun", { size: 58, color: "#e0a42a", weight: "fill" })}</div>
    <div style="${abs(tx + 4 * (tw + gap) + 54, ty - 62, 60, 60)}">${icon("sun-dim", { size: 54, color: "#b8862f", weight: "fill" })}</div>`;
  // An arrow from the dashed ghost over to the first block.
  const arrowSvg = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:5" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke="#5a2f6a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M${tx + 4 * (tw + gap) + 84} ${ty + 186} C ${tx + 3 * (tw + gap)} ${ty + 300}, ${tx + 700 - 600} ${ty + 300}, ${tx + 90} ${ty + 192}"/><path d="M${tx + 62} ${ty + 224} L ${tx + 90} ${ty + 190} L ${tx + 128} ${ty + 214}"/></g></svg>`;

  const answer = `<div style="${abs(48, 760, 590, 440, `background:#fffdf6;border-radius:8px;transform:rotate(-1.2deg);filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 0, 590, 440, "background:repeating-linear-gradient(180deg,transparent 0 63px,#c9d7e6 63px 65px);opacity:.55;top:40px")}"></div>
    <div style="${abs(34, 28, 6, 384, "background:#e3a3a3;opacity:.0")}"></div>
    <div class="serif" data-check="answer" style="${abs(36, 30, 520, 380, "font-size:48px;line-height:1.18;font-weight:500;color:#26211c;letter-spacing:-.005em")}">${mark(i.items[0], "goes first in the day", `color:${C.plumDeep};font-weight:700;background:linear-gradient(transparent 62%,#f6cf6a 62% 92%,transparent 92%)`)}</div>
  </div>`;
  const sticky = `<div style="${abs(670, 770, 286, 340, `background:#ffe08a;transform:rotate(2.6deg);filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 0, 286, 34, "background:rgba(0,0,0,.06)")}"></div>
    <div class="hand" data-check="sticky" style="${abs(20, 44, 248, 280, "font-size:33px;line-height:1.04;font-weight:600;color:#3a2c14")}">&hellip;${esc(i.items[1])}</div></div>`;

  // Breakfast: a plate of toast and a cup of tea, from above.
  const plate = `<svg style="${abs(640, 1120, 330, 240, "z-index:4;filter:drop-shadow(0 12px 10px rgba(60,30,10,.35))")}" viewBox="0 0 330 240" aria-hidden="true">
    <ellipse cx="170" cy="130" rx="150" ry="104" fill="#fbf7ee"/><ellipse cx="170" cy="130" rx="150" ry="104" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/><ellipse cx="170" cy="130" rx="112" ry="76" fill="#efe8da"/>
    <g transform="rotate(-8 150 130)"><rect x="84" y="78" width="104" height="92" rx="22" fill="#d9a05a"/><rect x="94" y="88" width="84" height="72" rx="14" fill="#f0cf93"/><rect x="108" y="102" width="40" height="22" rx="5" fill="#f7e27a"/></g>
    <g transform="rotate(10 210 130)"><rect x="170" y="82" width="104" height="92" rx="22" fill="#d6985a"/><rect x="180" y="92" width="84" height="72" rx="14" fill="#efc78a"/><circle cx="214" cy="126" r="14" fill="#c4573e" opacity=".8"/></g></svg>`;
  const cup = `<svg style="${abs(44, 1196, 250, 160, "z-index:4;filter:drop-shadow(0 12px 9px rgba(60,30,10,.35))")}" viewBox="0 0 250 160" aria-hidden="true">
    <ellipse cx="116" cy="96" rx="104" ry="58" fill="#f6f3ec"/><ellipse cx="116" cy="96" rx="84" ry="44" fill="#e5decf"/>
    <ellipse cx="116" cy="98" rx="104" ry="58" fill="none" stroke="#2f6a73" stroke-width="5" opacity=".7"/>
    <ellipse cx="110" cy="64" rx="70" ry="36" fill="#f6f3ec"/><ellipse cx="110" cy="62" rx="58" ry="28" fill="#b5651f"/><ellipse cx="94" cy="54" rx="22" ry="8" fill="#fff" opacity=".22"/>
    <path d="M178 60 C 236 44 240 112 182 108" fill="none" stroke="#f6f3ec" stroke-width="14" stroke-linecap="round"/></svg>`;

  return printable({ n: 58, paper: "#fbf1cf", scene: `${linen}${sunrise}${arrowSvg}${tiles}${answer}${sticky}${plate}${cup}` });
}

/* ------------------------------------------------------------------ #66 */

function pin66() {
  const i = idea(66);
  const r = seeded(7);
  const grain = [];
  for (let k = 0; k < 420; k++) grain.push(`<rect x="${(r() * 1000).toFixed(0)}" y="${(372 + r() * 1000).toFixed(0)}" width="${(6 + r() * 26).toFixed(0)}" height="1.6" fill="#fff" opacity="${(0.04 + r() * 0.08).toFixed(2)}"/>`);
  const desk = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><radialGradient id="sd" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#0b1626" stop-opacity=".35"/></radialGradient></defs>
    <rect width="1000" height="1500" fill="#4b6079"/>${grain.join("")}<rect width="1000" height="1500" fill="url(#sd)"/></svg>`;

  // The notebook: a navy cloth cover with two cream pages and a gutter.
  const NW = 900, NH = 820;
  const page = (x, side, content) => `<div style="${abs(x, 18, 436, NH - 36, `background:#fdfaf0;${side === "l" ? "border-radius:6px 2px 2px 6px" : "border-radius:2px 6px 6px 2px"}`)}">
    <div style="${abs(0, 0, 436, NH - 36, "background:repeating-linear-gradient(180deg,transparent 0 69px,#bccfe0 69px 71px);top:46px;opacity:.85")}"></div>
    <div style="${abs(side === "l" ? 62 : 36, 0, 3, NH - 36, "background:#e3a3a3;opacity:.7")}"></div>
    <div style="${abs(0, 0, 436, NH - 36, side === "l" ? "background:linear-gradient(90deg,transparent 80%,rgba(60,40,10,.18))" : "background:linear-gradient(270deg,transparent 80%,rgba(60,40,10,.18))")}"></div>
    ${content}</div>`;
  const line = (t, k) => `<div class="hand" data-check="item-${k}" style="margin-bottom:46px;padding-right:14px;font-size:58px;font-weight:700;line-height:70px;color:#232842;text-decoration:line-through;text-decoration-color:#d03a2e;text-decoration-thickness:6px;text-decoration-skip-ink:none">${esc(t)}</div>`;
  const left = `<div style="${abs(84, 70, 340, 700)}">${i.items.slice(0, 3).map((t, k) => line(t, k)).join("")}</div>`;
  const right = `<div style="${abs(58, 70, 368, 700)}">${i.items.slice(3).map((t, k) => line(t, k + 3)).join("")}</div>`;
  const notebook = `<div style="${abs(50, 420, NW, NH, `transform:rotate(-1.4deg);filter:${SHADOW};z-index:3`)}">
    <div style="${abs(0, 0, NW, NH, "background:#1f2a44;border-radius:16px")}"></div>
    ${page(10, "l", left)}${page(454, "r", right)}
    <div style="${abs(NW / 2 - 18, 18, 36, NH - 36, "background:linear-gradient(90deg,rgba(60,40,10,0),rgba(60,40,10,.3) 50%,rgba(60,40,10,0))")}"></div>
    <div style="${abs(NW / 2 - 1, 18, 2, NH - 36, "background:rgba(60,40,10,.25)")}"></div>
    ${[110, 330, 550, 770].map((y) => `<div style="${abs(NW / 2 - 28, y, 56, 8, "background:#c9a96a;border-radius:4px;opacity:.9")}"></div>`).join("")}
  </div>`;
  // Props: a red pencil across the lower right page, an eraser, a paper clip.
  const props = `<div style="position:absolute;z-index:6">${pencil({ x: 430, y: 1190, len: 470, rot: -8, body: "#c4392f", band: "#c0c4ca" })}</div>
    <svg style="${abs(120, 1260, 130, 60, "z-index:6;transform:rotate(-12deg);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))")}" viewBox="0 0 130 60" aria-hidden="true"><rect x="2" y="6" width="126" height="48" rx="8" fill="#f2efe8"/><rect x="2" y="6" width="84" height="48" rx="8" fill="#8fb6d9"/></svg>`;
  return printable({ n: 66, paper: "#e9eef3", scene: `${desk}${notebook}${props}` });
}

/* ------------------------------------------------------------------ #11 */

function hook(x, y) {
  return `<svg style="${abs(x - 20, y - 40, 40, 90, "z-index:5;filter:drop-shadow(4px 7px 4px rgba(20,0,30,.4))")}" viewBox="0 0 40 90" aria-hidden="true"><path d="M20 90 V18 Q20 4 32 8" fill="none" stroke="#d9dce1" stroke-width="7" stroke-linecap="round"/><path d="M20 90 V18" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/></svg>`;
}

function pin11() {
  const i = idea(11);
  const board = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs>
    <pattern id="holes" width="52" height="52" patternUnits="userSpaceOnUse"><circle cx="26" cy="26" r="7.5" fill="#3a2342"/><circle cx="26" cy="28" r="7.5" fill="#ffffff" opacity=".12"/><circle cx="26" cy="26" r="7" fill="#33203b"/></pattern>
    <radialGradient id="pl" cx="28%" cy="18%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#20102a" stop-opacity=".34"/></radialGradient></defs>
    <rect width="1000" height="1500" fill="#9a7aa0"/><rect width="1000" height="1500" fill="url(#holes)" opacity=".85"/><rect width="1000" height="1500" fill="url(#pl)"/></svg>`;

  const card = `<div style="${abs(110, 440, 780, 560, `transform:rotate(1.1deg);z-index:4;filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 780, 560, "background:#fffcf3;border-radius:6px")}"></div>
    <div style="${abs(0, 0, 780, 14, `background:${C.plum};border-radius:6px 6px 0 0`)}"></div>
    <div class="serif" data-check="quote" style="${abs(56, 54, 668, 440, "font-size:64px;line-height:1.14;font-weight:500;color:#26211c;letter-spacing:-.008em")}">&hellip;${mark(i.items[0], "June", `color:${C.plum};font-weight:700;font-style:italic;text-decoration:underline;text-decoration-thickness:5px;text-underline-offset:8px`)}</div>
  </div>
  ${hook(250, 440)}${hook(750, 440)}`;

  // A corner of the real days-schooled grid peeking in at the lower left, with a pencil laid across it.
  const grid = sheet({ src: bookPage(19), x: 70, y: 1050, w: 560, tilt: -1.8, crop: { x0: 0.07, y0: 0.25, x1: 0.62, y1: 0.52 }, id: "grid" });
  const pen = pencil({ x: 150, y: 1245, len: 560, rot: -3 });

  // A shelf on the board with a jar of pencils.
  const shelf = `<div style="${abs(660, 1300, 330, 24, "background:linear-gradient(#c99b66,#a6773f);box-shadow:0 10px 12px rgba(20,0,30,.45);z-index:3")}"></div>
    <div style="${abs(676, 1296, 18, 56, "background:#8d6a35;z-index:2")}"></div>`;
  const penc = (x, h, c, rot) => `<div style="${abs(x, 1300 - 200 - h + 100, 18, 190 + h - 60, `background:${c};transform:rotate(${rot}deg);transform-origin:50% 100%;border-radius:3px 3px 0 0;box-shadow:inset -4px 0 0 rgba(0,0,0,.12)`)}"></div>`;
  const jar = `<div style="${abs(700, 1050, 250, 260, "z-index:4")}">
    ${[[60, "#e7b23f", -9, 70], [96, "#c4573e", -3, 20], [132, "#5f8a8f", 5, 50], [168, "#7a4b8a", 11, 0], [112, "#8aa182", 1, 90]].map(([x, c, rot, h]) => `<div style="${abs(x, 20 + h * 0.2, 18, 190 - h * 0.2, `background:${c};transform:rotate(${rot}deg);transform-origin:50% 100%;border-radius:4px 4px 0 0;box-shadow:inset -4px 0 0 rgba(0,0,0,.14)`)}"></div>`).join("")}
    <div style="${abs(24, 120, 202, 138, "background:linear-gradient(90deg,rgba(255,255,255,.35),rgba(220,235,240,.45) 40%,rgba(180,205,215,.5));border:3px solid rgba(255,255,255,.65);border-radius:10px 10px 26px 26px;box-shadow:0 10px 16px rgba(20,0,30,.4)")}"></div>
  </div>`;
  return printable({ n: 11, paper: "#efe4ef", scene: `${board}${card}${grid}${pen}${shelf}${jar}` });
}

export const pins = [pin54(), pin58(), pin66(), pin11()];
