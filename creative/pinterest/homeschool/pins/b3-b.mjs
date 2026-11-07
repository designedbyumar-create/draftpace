/**
 * Batch 3, set B: #8, #10, #12, #14, #16 (guide pins). Five different worlds:
 *   8  what to leave off the page      a mint fridge door, three paper slips held by magnets, each crossed off
 *   10 habits to stop                  a lined page torn from a spiral notebook, five STOP stamps, on slate linen
 *   12 one page or one per child       two halves: mustard with one tangled sheet, teal with two folders
 *   14 one read-aloud, two records     a powder-blue breakfast table: toast, tea, a child's drawing, two entry cards
 *   16 memory vs right after           a dusk-grey crumpled sheet above a sunlit ruled page with a pencil on it
 * Every word is the idea bank's own (items and sub, through idea(n)).
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { pencil } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(30,15,5,.25)) drop-shadow(0 10px 12px rgba(30,15,5,.3))";
const exampleCss = `.example{font-size:22px;color:#4b4339;background:#fffdf6;padding:7px 13px;box-shadow:0 2px 4px rgba(0,0,0,.2)}`;

/** A round fridge magnet centred on (x, y). */
function magnet(x, y, color = "#c4573e", r = 30) {
  return `<svg style="${abs(x - r - 6, y - r - 4, r * 2 + 16, r * 2 + 16, "filter:drop-shadow(4px 7px 4px rgba(0,0,0,.3));z-index:4")}" viewBox="0 0 ${r * 2 + 16} ${r * 2 + 16}" aria-hidden="true"><circle cx="${r + 6}" cy="${r + 4}" r="${r}" fill="${color}"/><circle cx="${r + 6}" cy="${r + 4}" r="${r}" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="2"/><ellipse cx="${r - 4}" cy="${r - 8}" rx="${r * 0.42}" ry="${r * 0.28}" fill="#fff" opacity=".45" transform="rotate(-30 ${r - 4} ${r - 8})"/></svg>`;
}

/** A strip of washi tape centred on (x, y). */
function tape(x, y, w = 150, rot = -4, color = "rgba(224,169,90,.8)") {
  return `<div style="${abs(x - w / 2, y - 20, w, 40, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.3) 14px 22px);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:4;clip-path:polygon(0 10%,3% 0,100% 0,97% 30%,100% 55%,97% 80%,100% 100%,3% 100%,0 85%,2% 50%)`)}"></div>`;
}

/** A scribble of pretend handwriting along a baseline: a zigzag path (no words). */
function scribble(r, x0, y, len, amp = 5) {
  let x = x0, d = `M${x} ${y}`;
  while (x < x0 + len) {
    x += 6 + r() * 7;
    d += ` L${x.toFixed(1)} ${(y + (r() - 0.5) * amp * 2).toFixed(1)}`;
    if (r() < 0.07) { x += 12; d += ` M${x.toFixed(1)} ${y}`; }
  }
  return d;
}

/** Plank surface in any colour (grain colour follows the plank colour). */
function planks({ top, height, base, dark, grain, n = 6, seed = 3, light = "#fff" }) {
  const r = seeded(seed), ph = height / n, out = [];
  for (let k = 0; k < n; k++) {
    const y = k * ph;
    out.push(`<rect x="0" y="${y}" width="1000" height="${ph}" fill="${k % 2 ? base : dark}"/><rect x="0" y="${y}" width="1000" height="3" fill="#000" opacity=".18"/>`);
    for (let g = 0; g < 7; g++) {
      const gy = y + 8 + r() * (ph - 16);
      out.push(`<path d="M${r() * 200} ${gy} C ${300 + r() * 200} ${gy + (r() - 0.5) * 12}, ${600 + r() * 200} ${gy + (r() - 0.5) * 12}, 1000 ${gy + (r() - 0.5) * 8}" fill="none" stroke="${grain}" stroke-opacity="${(0.1 + r() * 0.12).toFixed(2)}" stroke-width="${(1 + r() * 1.4).toFixed(1)}"/>`);
    }
  }
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><radialGradient id="pl${seed}" cx="25%" cy="10%" r="100%"><stop offset="0" stop-color="${light}" stop-opacity=".22"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>${out.join("")}<rect width="1000" height="${height}" fill="url(#pl${seed})"/></svg>`;
}

/* ------------------------------------------------------------------ #8 */

function pin8() {
  const i = idea(8);
  const door = `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 372 1000 982" aria-hidden="true"><defs>
      <linearGradient id="fd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bcd6c6"/><stop offset=".35" stop-color="#d4e8dc"/><stop offset=".7" stop-color="#c9e0d2"/><stop offset="1" stop-color="#b3cdbd"/></linearGradient>
      <linearGradient id="hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e949b"/><stop offset=".4" stop-color="#f2f4f6"/><stop offset="1" stop-color="#9aa0a8"/></linearGradient>
      <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect y="372" width="1000" height="982" fill="url(#fd)"/>
    <rect y="372" width="1000" height="982" fill="url(#gl)"/>
    <rect x="0" y="1190" width="1000" height="6" fill="#000" opacity=".12"/><rect x="0" y="1196" width="1000" height="3" fill="#fff" opacity=".35"/>
    <rect x="896" y="440" width="52" height="640" rx="26" fill="#000" opacity=".16" transform="translate(8 10)"/>
    <rect x="896" y="440" width="52" height="640" rx="26" fill="url(#hd)"/>
    <rect x="884" y="470" width="14" height="40" fill="#8e949b"/><rect x="884" y="1010" width="14" height="40" fill="#8e949b"/></svg>`;

  const strikeBox = (x, y, s = 74) => `<svg style="${abs(x, y, s, s)}" viewBox="0 0 74 74" aria-hidden="true"><path d="M8 10 L66 8 L64 66 L10 64 Z" fill="#fffdf6" stroke="#2c2540" stroke-width="5" stroke-linejoin="round"/><path d="M14 16 L60 60 M60 14 L16 60" stroke="#b4472f" stroke-width="7" stroke-linecap="round"/></svg>`;
  const txt = (t, size, w, extra = "") => `<div data-check="item" class="hand" style="position:absolute;left:150px;width:${w}px;top:50%;transform:translateY(-50%);font-size:${size}px;line-height:1.12;font-weight:700;color:#2c2540;text-decoration:line-through;text-decoration-color:#b4472f;text-decoration-thickness:6px;${extra}">${esc(t)}</div>`;

  const kraft = `<div style="${abs(70, 428, 770, 250, `transform:rotate(-1.6deg);filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 770, 250, "background:#cda877;border-radius:6px")}"><div style="${abs(0, 0, 770, 250, "background:repeating-linear-gradient(180deg,transparent 0 56px,rgba(80,50,20,.18) 56px 58px);top:34px;height:216px")}"></div>
    ${strikeBox(48, 88)}${txt(i.items[0], 60, 580, "padding-top:10px")}</div></div>`;
  const white = `<div style="${abs(120, 722, 700, 214, `transform:rotate(1.3deg);filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 700, 214, "background:#fffdf6;border-radius:4px;overflow:hidden")}"><div style="${abs(0, 40, 700, 174, "background:repeating-linear-gradient(180deg,transparent 0 60px,#b9cde0 60px 62px)")}"></div><div style="${abs(110, 0, 2, 214, "background:#e3a3a3;opacity:.7")}"></div>
    ${strikeBox(24, 70)}${txt(i.items[1], 92, 520, "left:140px;padding-top:6px")}</div></div>`;
  const yellow = `<div style="${abs(80, 976, 790, 270, `transform:rotate(-.9deg);filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 790, 270, "background:#f6dd7e;border-radius:4px;overflow:hidden")}"><div style="${abs(0, 0, 790, 40, "background:linear-gradient(#e6c658,#f6dd7e)")}"></div><div style="${abs(0, 40, 790, 230, "background:repeating-linear-gradient(180deg,transparent 0 62px,rgba(140,100,20,.2) 62px 64px)")}"></div>
    ${strikeBox(40, 100)}${txt(i.items[2], 60, 600, "padding-top:14px")}</div></div>`;
  const magnets = magnet(455, 436, "#c4573e") + magnet(470, 730, "#e0a95a") + magnet(475, 986, "#7a4b8a") + magnet(906, 1270, "#5f8a8f", 24) + magnet(120, 1290, "#e0a95a", 24);
  return printable({ n: 8, paper: "#e7efe6", extraCss: ".top h1{font-size:70px}", scene: `${door}${kraft}${white}${yellow}${magnets}` });
}

/* ------------------------------------------------------------------ #10 */

function pin10() {
  const i = idea(10);
  const r = seeded(21);
  const linen = `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><defs><pattern id="ln" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#5c7189"/><path d="M0 1 H6" stroke="#fff" stroke-opacity=".07"/><path d="M1 0 V6" stroke="#000" stroke-opacity=".07"/></pattern><radialGradient id="lv" cx="30%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#0d1824" stop-opacity=".4"/></radialGradient></defs><rect width="1000" height="982" fill="url(#ln)"/><rect width="1000" height="982" fill="url(#lv)"/></svg>`;

  const W = 870, H = 910;
  const left = [];
  for (let y = 0; y <= H; y += 14) left.push(`${(r() * 10).toFixed(1)}px ${y}px`);
  const clip = `polygon(0 0,${W}px 0,${W}px ${H}px,${left.reverse().join(",")})`;
  const stamps = [[-3, 3], [2, -2], [-2, 1], [3, -3], [-1, 2]];
  const rows = i.items.map((t, k) => `<div style="position:relative;height:104px;margin-bottom:52px">
      <div style="position:absolute;left:-118px;top:16px;width:104px;height:54px;border:5px solid #a5402b;border-radius:8px;color:#a5402b;font:700 29px/44px Plex;letter-spacing:.14em;text-align:center;transform:rotate(${stamps[k][0] * 2}deg);opacity:.88;box-shadow:inset 0 0 0 2px rgba(165,64,43,.25)">STOP</div>
      <div data-check="habit" style="height:104px;overflow:hidden;font:600 40px/52px Hand;color:#25304a">${esc(t)}</div></div>`).join("");
  const sheet = `<div style="${abs(50, 410, W, H, "transform:rotate(-.6deg);filter:drop-shadow(0 3px 3px rgba(5,10,20,.35)) drop-shadow(0 18px 22px rgba(5,10,20,.45))")}">
      <div style="${abs(0, 0, W, H, `background:#fbf8f0;clip-path:${clip}`)}">
        <div style="${abs(0, 0, W, H, "background:repeating-linear-gradient(180deg,transparent 0 46px,#b9cde0 46px 48px);background-position:0 100px")}"></div>
        <div style="${abs(150, 0, 3, H, "background:#e3a3a3;opacity:.8")}"></div>
        <div style="${abs(190, 100, 640, 760)}">${rows}</div>
      </div></div>`;
  // the crossed-out "later" note, stuck over the top corner of the page
  const note = `<div style="${abs(618, 410, 250, 96, `transform:rotate(3deg);filter:${SHADOW};z-index:4`)}"><div class="hand" style="${abs(0, 0, 250, 96, "background:#f3d77b;display:grid;place-items:center;font-size:58px;font-weight:700;color:#2c2540;text-decoration:line-through;text-decoration-color:#a5402b;text-decoration-thickness:5px")}">later</div></div>${tape(745, 408, 100, 2, "rgba(138,161,130,.85)")}`;
  const pen = pencil({ x: 725, y: 1010, len: 440, rot: 90, body: "#4e7a8c" });
  return printable({ n: 10, paper: "#e4e8ee", scene: `${linen}${sheet}${note}${pen}` });
}

/* ------------------------------------------------------------------ #12 */

function folder({ x, y, color, deep, rot, seed }) {
  const r = seeded(seed);
  const w = 410, h = 230, bodyTop = 34;
  const lines = [0, 1, 2].map((k) => `<path d="${scribble(r, 34, 22 + k * 24, 200, 3)}" fill="none" stroke="#4d4954" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>`).join("");
  return `<div style="${abs(x, y, w, h + 20, `transform:rotate(${rot}deg);filter:${SHADOW}`)}">
    <div style="${abs(0, 0, 160, 48, `background:${deep};border-radius:12px 12px 0 0`)}"></div>
    <div style="${abs(14, 6, 130, 30, "background:#fffdf6;border-radius:5px")}"><svg viewBox="0 0 130 30" style="${abs(0, 0, 130, 30)}" aria-hidden="true"><path d="${scribble(r, 12, 15, 100, 4)}" fill="none" stroke="#2c2540" stroke-width="3" stroke-linecap="round"/></svg></div>
    <div style="${abs(0, bodyTop, w, 14, `background:${deep};border-radius:0 12px 0 0`)}"></div>
    <div style="${abs(14, bodyTop - 4, w - 28, 64, "background:#fffdf6;border-radius:3px;overflow:hidden")}"><svg viewBox="0 0 ${w - 28} 64" style="${abs(0, 0, w - 28, 64)}" aria-hidden="true">${lines}</svg></div>
    <div style="${abs(0, bodyTop + 36, w, h - 36, `background:${color};border-radius:6px 12px 10px 10px;box-shadow:inset 0 2px 0 rgba(255,255,255,.35)`)}"></div>
  </div>`;
}

function pin12() {
  const i = idea(12);
  const [shared, once1, once2] = i.items;
  const [lab1, t1] = shared.split(": ");
  const [lab2, t2] = once1.split(": ");
  const [lab3, t3] = once2.split(": ");
  if (lab2 !== lab3) throw new Error("#12 expects both per-child items under one label");
  const r = seeded(7);

  const halves = `<div style="${abs(0, 372, 500, 982, "background:linear-gradient(135deg,#e2b34f,#c9922f)")}"></div>
    <div style="${abs(500, 372, 500, 982, "background:linear-gradient(135deg,#3c7d80,#255a5e)")}"></div>
    <svg style="${abs(0, 372, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><defs><pattern id="tw" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8 L8 0" stroke="#000" stroke-opacity=".06"/></pattern></defs><rect width="1000" height="982" fill="url(#tw)"/></svg>
    <div style="${abs(494, 372, 12, 982, "background:#fffdf6;box-shadow:0 0 14px rgba(0,0,0,.35);z-index:3")}"></div>`;

  // one shared page, two children's lines tangled together
  const tangle = [];
  for (let k = 0; k < 9; k++) {
    const y = 70 + k * 40;
    tangle.push(`<path d="${scribble(r, 30 + r() * 16, y, 160 + r() * 130, 4)}" fill="none" stroke="${k % 2 ? "#7a4b8a" : "#2f7f86"}" stroke-width="3" stroke-linecap="round" opacity=".85"/>`);
    if (k % 3 === 1) tangle.push(`<path d="M${40 + r() * 50} ${y + 10} L ${240 + r() * 80} ${y - 12}" stroke="#b4472f" stroke-width="5" stroke-linecap="round"/>`);
  }
  tangle.push(`<path d="M30 400 C 120 120, 200 380, 330 90 S 260 300, 70 330" fill="none" stroke="#7a4b8a" stroke-width="3" opacity=".55"/><path d="M50 150 C 210 340, 120 60, 320 320" fill="none" stroke="#2f7f86" stroke-width="3" opacity=".55"/>`);
  const page = `<div style="${abs(66, 478, 370, 460, `transform:rotate(-3deg);filter:${SHADOW}`)}"><div style="${abs(0, 0, 370, 460, "background:#fffdf6;border-radius:3px;overflow:hidden")}"><svg viewBox="0 0 370 460" style="${abs(0, 0, 370, 460)}" aria-hidden="true">${tangle.join("")}</svg></div></div>${tape(250, 482, 120, -4, "rgba(122,75,138,.7)")}`;

  const chip = (x, w, t) => `<div style="${abs(x, 408, w, 56, "background:#2c2540;border-radius:10px;display:grid;place-items:center;font:600 28px Plex;color:#fffdf6;z-index:3;transform:rotate(-1deg)")}">${esc(t)}</div>`;
  const note = (x, body, h = 250) => `<div data-check="note" style="${abs(x, 1000, 430, h, `background:#fffdf6;border-radius:6px;filter:${SHADOW};padding:24px 26px;font:500 27px/1.33 Plex;color:#2c2540;overflow:hidden`)}">${body}</div>`;
  const right = `${folder({ x: 546, y: 492, color: "#d9b46b", deep: "#c39a4c", rot: -2, seed: 5 })}${folder({ x: 566, y: 740, color: "#c9b6d6", deep: "#a98ec0", rot: 1.6, seed: 9 })}`;

  return printable({
    n: 12, paper: "#f1e9d6", extraCss: ".top h1{font-size:70px}",
    scene: `${halves}${chip(46, 300, lab1)}${page}${note(40, esc(t1))}${chip(530, 360, lab2)}${right}${note(530, `${esc(t2)}<div style="height:2px;background:#d8cfbd;margin:12px 0"></div>${esc(t3)}`)}`,
  });
}

/* ------------------------------------------------------------------ #14 */

function bookDrawing(x, y, w = 330, rot = -3) {
  const h = w * 0.76;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(40,20,5,.35))`)}" viewBox="0 0 330 250" aria-hidden="true"><rect width="330" height="250" fill="#fffdf6"/>
    <circle cx="58" cy="50" r="24" fill="#f2c14e"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="${58 + Math.cos((a * Math.PI) / 180) * 31}" y1="${50 + Math.sin((a * Math.PI) / 180) * 31}" x2="${58 + Math.cos((a * Math.PI) / 180) * 44}" y2="${50 + Math.sin((a * Math.PI) / 180) * 44}" stroke="#f2c14e" stroke-width="5" stroke-linecap="round"/>`).join("")}
    <path d="M60 210 C 100 150, 150 150, 165 175 C 180 150, 230 150, 270 210 Z" fill="#d86a4f" stroke="#8a3a28" stroke-width="4" stroke-linejoin="round"/>
    <path d="M165 175 V 214" stroke="#8a3a28" stroke-width="4"/>
    <path d="M82 192 C 108 168, 135 168, 150 182 M180 182 C 196 168, 225 168, 250 192" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    <g fill="#7a4b8a"><path d="M262 50 l6 14 15 1 -12 9 4 15 -13 -8 -13 8 4 -15 -12 -9 15 -1 z" transform="translate(0 -4)"/><path d="M215 40 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1 z"/></g>
    <g stroke="#3b7fb2" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="294" cy="150" r="9"/><path d="M294 159 V 190 M294 168 L282 178 M294 168 L306 178"/></g>
    <path d="M0 232 H330" stroke="#6aa86a" stroke-width="12"/></svg>`;
}

function pin14() {
  const i = idea(14);
  const table = planks({ top: 372, height: 982, base: "#a9c3d3", dark: "#94b2c5", grain: "#3d5a6e", n: 8, seed: 14, light: "#fff" });
  const plate = `<svg style="${abs(32, 404, 250, 230, "filter:drop-shadow(0 12px 9px rgba(20,30,40,.4))")}" viewBox="0 0 250 230" aria-hidden="true"><circle cx="125" cy="115" r="108" fill="#fbfaf7"/><circle cx="125" cy="115" r="108" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/><circle cx="125" cy="115" r="82" fill="#eee9df"/>
    <path d="M70 92 C 70 52, 180 52, 180 92 C 190 102, 182 112, 176 112 L 176 168 C 176 178, 74 178, 74 168 L 74 112 C 66 112, 60 100, 70 92 Z" fill="#d79a4a" stroke="#a96c25" stroke-width="5" stroke-linejoin="round"/>
    <path d="M86 94 C 90 70, 160 70, 164 94 L 164 160 L 86 160 Z" fill="#f0c677"/><rect x="104" y="108" width="42" height="26" rx="5" fill="#f6e08e" transform="rotate(-6 125 120)"/></svg>`;
  const cup = `<svg style="${abs(690, 400, 280, 230, "filter:drop-shadow(0 12px 9px rgba(20,30,40,.4))")}" viewBox="0 0 280 230" aria-hidden="true"><ellipse cx="130" cy="120" rx="118" ry="100" fill="#fbfaf7"/><ellipse cx="130" cy="120" rx="118" ry="100" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <path d="M206 88 C 262 80 262 152 206 152" fill="none" stroke="#e9e3d6" stroke-width="22" stroke-linecap="round"/><circle cx="118" cy="116" r="76" fill="#e9e3d6"/><circle cx="118" cy="116" r="64" fill="#fbfaf7"/><circle cx="118" cy="118" r="56" fill="#a5642f"/><ellipse cx="98" cy="98" rx="24" ry="16" fill="#fff" opacity=".2"/></svg>`;

  const card = ({ x, y, rot, name, subject, note, ink, nameSize, weight, spacing, bg }) => `<div style="${abs(x, y, 440, 500, `transform:rotate(${rot}deg);filter:${SHADOW}`)}">
      <div style="${abs(0, 0, 440, 500, `background:${bg};border-radius:6px;overflow:hidden`)}">
        <div style="${abs(0, 96, 440, 404, "background:repeating-linear-gradient(180deg,transparent 0 51px,#b9cde0 51px 53px);background-position:0 20px")}"></div>
        <div style="${abs(0, 94, 440, 3, "background:#d9776b")}"></div>
        <div data-check="entry" class="hand" style="${abs(28, 18, 390, 470, `color:${ink};font-weight:${weight};letter-spacing:${spacing}em;overflow:hidden`)}">
          <div style="font-size:${nameSize}px;line-height:70px;font-weight:700">${esc(name)}</div>
          <div style="font-size:40px;line-height:53px;margin-top:35px">${esc(subject)}</div>
          <div style="font-size:40px;line-height:53px;margin-top:53px">${esc(note)}</div>
        </div></div></div>`;
  const [n1, s1, t1, n2, s2, t2] = i.items;
  const cards = card({ x: 46, y: 716, rot: -2, name: n1, subject: s1, note: t1, ink: "#23478a", nameSize: 60, weight: 600, spacing: 0, bg: "#fffdf6" })
    + card({ x: 514, y: 732, rot: 2, name: n2, subject: s2, note: t2, ink: "#3a3a44", nameSize: 58, weight: 500, spacing: 0, bg: "#fcf6e4" })
    + tape(266, 718, 120, 3, "rgba(224,169,90,.85)") + tape(734, 732, 120, -3, "rgba(122,75,138,.6)");
  const drawing = `${bookDrawing(335, 404)}${tape(500, 408, 130, 2, "rgba(138,161,130,.85)")}`;
  const tag = `<span class="example" style="position:absolute;left:46px;top:1290px;transform:rotate(-2deg);z-index:4">Example</span>`;
  return printable({ n: 14, paper: "#e8eff4", extraCss: exampleCss, scene: `${table}${plate}${cup}${drawing}${cards}${pencil({ x: 300, y: 1262, len: 440, rot: -3 })}${tag}` });
}

/* ------------------------------------------------------------------ #16 */

function crumple(w, h, seed) {
  const r = seeded(seed);
  const cx = w / 2, cy = h / 2, n = 14;
  const ring = (k, f) => { const a = ((k + (r() - 0.5) * 0.5) / n) * Math.PI * 2; const rad = f * (0.8 + r() * 0.2); return [cx + Math.cos(a) * (w / 2 - 6) * rad, cy + Math.sin(a) * (h / 2 - 6) * rad]; };
  const outer = Array.from({ length: n }, (_, k) => ring(k, 1)), inner = Array.from({ length: n }, (_, k) => ring(k + 0.5, 0.5));
  const shades = ["#d9d5ca", "#bdb9ae", "#e8e4d9", "#a9a59b", "#cfcbc0", "#f1ede3", "#c4c0b4"];
  const sh = () => shades[Math.floor(r() * shades.length)];
  const P = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  let facets = "";
  for (let k = 0; k < n; k++) {
    const k2 = (k + 1) % n;
    facets += `<path d="M${cx} ${cy} L${P(inner[k])} L${P(inner[k2])} Z" fill="${sh()}"/><path d="M${P(inner[k])} L${P(outer[k])} L${P(outer[k2])} Z" fill="${sh()}"/><path d="M${P(inner[k])} L${P(outer[k2])} L${P(inner[k2])} Z" fill="${sh()}"/>`;
  }
  let marks = "";
  for (let k = 0; k < 11; k++) marks += `<path d="${scribble(r, 50 + r() * 40, 60 + k * 24, 120 + r() * 160, 5)}" fill="none" stroke="#3d3d4c" stroke-width="2.6" opacity=".5" stroke-linecap="round"/>`;
  const creases = Array.from({ length: 10 }, () => `<path d="M${(r() * w).toFixed(0)} ${(r() * h).toFixed(0)} L${(r() * w).toFixed(0)} ${(r() * h).toFixed(0)}" stroke="#6d695f" stroke-width="2" opacity=".3"/>`).join("");
  return `<svg viewBox="0 0 ${w} ${h}" style="${abs(0, 0, w, h)}" aria-hidden="true"><defs><clipPath id="cr${seed}"><polygon points="${outer.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}"/></clipPath></defs><g clip-path="url(#cr${seed})">${facets}${marks}${creases}</g></svg>`;
}

function pin16() {
  const i = idea(16);
  const [before, after, entry] = i.items;
  const beforeText = before.replace(/^Before: /, "");
  const afterText = after.replace(/^After: /, "");
  if (beforeText === before || afterText === after) throw new Error("#16 items lost their Before:/After: prefixes");

  const dusk = `<div style="${abs(0, 372, 1000, 470, "background:linear-gradient(160deg,#4d5668,#363d4b);clip-path:polygon(0 0,100% 0,100% 88%,0 100%);z-index:2")}"></div>
    <div style="${abs(0, 372, 1000, 470, "background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 3px,transparent 3px 9px);clip-path:polygon(0 0,100% 0,100% 88%,0 100%);z-index:2")}"></div>`;
  const oak = planks({ top: 760, height: 594, base: "#dcb784", dark: "#cfa56e", grain: "#8a6234", n: 5, seed: 16, light: "#fff6d8" });
  const sun = `<div style="${abs(0, 800, 1000, 554, "background:linear-gradient(115deg,rgba(255,244,205,.5) 0 22%,transparent 22% 34%,rgba(255,244,205,.35) 34% 50%,transparent 50%);mix-blend-mode:soft-light")}"></div>`;

  const ball = `<div style="${abs(40, 408, 450, 400, `transform:rotate(-7deg);filter:drop-shadow(0 16px 14px rgba(0,0,0,.55));z-index:3`)}">${crumple(450, 400, 3)}</div>`;
  const beforeCard = `<div style="${abs(520, 430, 430, 320, `transform:rotate(1.6deg);filter:drop-shadow(0 12px 14px rgba(0,0,0,.5));z-index:3`)}">
      <div style="${abs(0, 0, 430, 320, "background:#e7e2d6;border-radius:5px;padding:26px 28px;overflow:hidden")}" data-check="before">
        <div style="font:600 25px Plex;letter-spacing:.16em;text-transform:uppercase;color:#59606f">Before</div>
        <div style="font:500 34px/1.28 Plex;color:#2a2f3a;margin-top:12px">${esc(beforeText)}</div></div></div>`;

  const sheet = `<div style="${abs(60, 868, 880, 458, `transform:rotate(-.5deg);filter:${SHADOW};z-index:3`)}">
      <div style="${abs(0, 0, 880, 458, "background:#fffdf6;border-radius:5px;overflow:hidden")}">
        <div style="${abs(0, 0, 880, 458, "background:repeating-linear-gradient(180deg,transparent 0 53px,#b9cde0 53px 55px);background-position:0 152px")}"></div>
        <div style="${abs(96, 0, 2, 458, "background:#e3a3a3;opacity:.7")}"></div>
        <div data-check="after" style="${abs(124, 52, 724, 110, `font:500 40px/55px Newsreader;color:${C.plumDeep}`)}">${esc(afterText)}</div>
        <div data-check="entry" class="hand" style="${abs(124, 162, 724, 170, "font-size:50px;line-height:55px;font-weight:600;color:#25304a;overflow:hidden")}">${esc(entry)}</div>
      </div></div>
    <div style="${abs(86, 826, 160, 56, `background:${C.plum};border-radius:10px 10px 0 0;display:grid;place-items:center;font:600 28px Plex;color:#fff;letter-spacing:.06em;z-index:3`)}">After</div>`;
  const pen = `<div style="z-index:4">${pencil({ x: 470, y: 1236, len: 440, rot: -5 })}</div>`;
  return printable({ n: 16, paper: "#f1e9dc", scene: `${oak}${dusk}${sun}${ball}${beforeCard}${sheet}${pen}` });
}

export const pins = [pin8(), pin10(), pin12(), pin14(), pin16()];
