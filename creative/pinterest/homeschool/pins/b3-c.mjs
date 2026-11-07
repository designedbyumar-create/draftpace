/**
 * Batch 3, module c: #17 (a sunny window with a clothesline of five pegged
 * day cards), #21 (a sheet taped to a red front door, the first-week checklist), #25 (three
 * stacked file folders: file, record, can wait), #29 (a window-lit table:
 * the crumpled "research" slip beside the plain truth) and #18 (the quote
 * set large on a cream page, a real strip of the book peeking out).
 * Every word is the idea bank's own.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, pencil, mug, binderClip, drawing } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "0 2px 3px rgba(40,20,5,.25),0 16px 28px rgba(40,20,5,.32)";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------- #17 */

/** A wooden clothes peg, centred on (x, y). */
const peg = (x, y, rot = 0) =>
  `<svg style="${abs(x - 13, y - 30, 26, 62, `transform:rotate(${rot}deg);filter:drop-shadow(2px 4px 3px rgba(40,25,5,.35));z-index:6`)}" viewBox="0 0 26 62" aria-hidden="true"><rect x="2" y="0" width="22" height="60" rx="5" fill="#d9b27a"/><rect x="2" y="0" width="9" height="60" rx="4" fill="#fff" opacity=".22"/><rect x="0" y="22" width="26" height="9" rx="3" fill="#8f98a3"/><path d="M13 36 V60" stroke="#8a6535" stroke-width="2.5"/></svg>`;

function pin17() {
  const i = idea(17);
  const bands = ["#e08a6c", "#e6b34f", "#8fae8a", "#9b7aa6", "#6f93b3"];
  // [row line y, x, width, tilt] for the five cards: two on each of the first two lines, one on the third
  const slots = [
    { line: 430, x: 52, w: 436, rot: -1.2 }, { line: 430, x: 520, w: 436, rot: 1.0 },
    { line: 765, x: 52, w: 436, rot: 0.9 }, { line: 765, x: 520, w: 436, rot: -1.1 },
    { line: 1030, x: 52, w: 436, rot: -0.8 },
  ];
  const sag = (x, y) => y + 4 * 20 * (x / 1000) * (1 - x / 1000);
  const lines = [430, 765, 1030].map((y) => `<path d="M26 ${y} Q 500 ${y + 40} 974 ${y}" fill="none" stroke="#f3ecdd" stroke-width="6" stroke-linecap="round"/><path d="M26 ${y + 3} Q 500 ${y + 43} 974 ${y + 3}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>`).join("");
  const cards = i.items.map((t, k) => {
    const s = slots[k], cx = s.x + s.w / 2, top = sag(cx, s.line) + 6;
    return `<div class="tcard serif" style="left:${s.x}px;top:${top}px;width:${s.w}px;transform:rotate(${s.rot}deg);transform-origin:50% 0;--band:${bands[k]}">${esc(t)}</div>${peg(s.x + 70, sag(s.x + 70, s.line) + 14)}${peg(s.x + s.w - 70, sag(s.x + s.w - 70, s.line) + 14)}`;
  }).join("");
  const hills = `<svg style="${abs(0, 1000, 1000, 270)}" viewBox="0 0 1000 270" aria-hidden="true"><path d="M0 120 C 150 40 300 70 450 110 C 620 150 800 60 1000 100 V270 H0Z" fill="#a8c4a0"/><path d="M0 180 C 200 120 380 170 560 150 C 760 130 880 160 1000 140 V270 H0Z" fill="#87a97f"/><g fill="#6d9166"><circle cx="760" cy="120" r="42"/><rect x="753" y="140" width="14" height="50"/></g></svg>`;
  const cloud = (x, y, s) => `<div style="${abs(x, y, 220 * s, 70 * s, "filter:blur(1px);opacity:.9")}"><div style="${abs(0, 28 * s, 220 * s, 42 * s, "background:#fff;border-radius:40px")}"></div><div style="${abs(34 * s, 4 * s, 90 * s, 60 * s, "background:#fff;border-radius:50%")}"></div><div style="${abs(100 * s, 12 * s, 80 * s, 52 * s, "background:#fff;border-radius:50%")}"></div></div>`;
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(#a9d3ec 0,#cfe6f0 45%,#fbf0d4 78%,#f6e2b4 100%);overflow:hidden")}"></div>
  <div style="${abs(560, 372, 520, 520, "background:radial-gradient(circle at 80% 8%,rgba(255,244,196,.95),rgba(255,244,196,0) 62%)")}"></div>
  ${cloud(120, 400, 1)}${cloud(640, 560, 1.2)}${cloud(300, 920, .8)}
  ${hills}
  <div style="${abs(150, 372, 140, 980, "background:linear-gradient(100deg,transparent,rgba(255,255,255,.3) 50%,transparent);transform:skewX(-10deg)")}"></div>
  <div style="${abs(640, 372, 100, 980, "background:linear-gradient(100deg,transparent,rgba(255,255,255,.22) 50%,transparent);transform:skewX(-10deg)")}"></div>
  <svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${lines}</svg>
  ${cards}
  <div style="${abs(536, 1046, 250, 58, "background:#fffdf6;border-radius:6px;transform:rotate(2deg);box-shadow:0 2px 3px rgba(40,25,5,.25),0 12px 18px rgba(40,25,5,.3);display:grid;place-items:center;z-index:3")}"><span class="example" style="font-size:24px;padding:5px 12px;color:#4b4339">Example</span></div>
  ${peg(556, sag(556, 1030) + 14)}${peg(766, sag(766, 1030) + 14)}
  <div style="${abs(0, 1262, 1000, 100, "background:linear-gradient(#e2bf8b,#c99b66 30%,#a9783f);box-shadow:0 -4px 14px rgba(40,25,5,.3);z-index:2")}"></div>
  <div style="${abs(0, 1262, 1000, 8, "background:rgba(255,255,255,.35);z-index:2")}"></div>
  <div style="z-index:3;position:absolute;left:0;top:0">${drawing({ x: 540, y: 1124, w: 190, rot: 3 })}</div>
  <svg style="${abs(770, 1076, 200, 200, "z-index:3;filter:drop-shadow(0 12px 8px rgba(40,25,5,.4))")}" viewBox="0 0 200 200" aria-hidden="true"><path d="M62 96 H138 L128 190 H72 Z" fill="#c4724a"/><rect x="56" y="84" width="88" height="22" rx="5" fill="#d4825a"/><g fill="#5d8a56"><path d="M100 86 C 70 40 40 40 28 20 C 62 18 92 40 100 86Z"/><path d="M100 86 C 130 30 162 36 176 16 C 142 10 108 36 100 86Z"/><path d="M100 86 C 94 44 100 20 100 4 C 112 26 112 56 100 86Z"/></g></svg>`;
  return printable({
    n: 17,
    scene,
    paper: "#f4eee4",
    extraCss: `
    .top{top:52px}.top h1{font-size:78px}.top p{font-size:26px;margin-top:12px}
    .tcard{position:absolute;padding:60px 28px 22px;background:linear-gradient(var(--band),var(--band)) 0 0/100% 34px no-repeat,#fffdf6;
      font-size:33px;line-height:40px;text-wrap:balance;color:#26221d;border-radius:4px;box-shadow:0 2px 3px rgba(40,25,5,.25),0 16px 22px rgba(40,25,5,.3)}`,
  });
}

/* ---------------------------------------------------------------- #21 */

function door() {
  const panel = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#7c3029"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="none" stroke="#5a1f1a" stroke-width="6"/><path d="M${x + 6} ${y + h - 4} V${y + 6} H${x + w - 6}" fill="none" stroke="#ad5b4f" stroke-opacity=".65" stroke-width="4"/><rect x="${x + 22}" y="${y + 22}" width="${w - 44}" height="${h - 44}" rx="3" fill="#873730" stroke="#5a1f1a" stroke-opacity=".5" stroke-width="3"/>`;
  return `<svg style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP)}" viewBox="0 0 1000 ${1500 - SCENE_TOP}" aria-hidden="true"><defs>
    <linearGradient id="dd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a24438"/><stop offset="1" stop-color="#7a2e27"/></linearGradient>
    <linearGradient id="br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e3a1"/><stop offset=".5" stop-color="#cfa044"/><stop offset="1" stop-color="#8b6414"/></linearGradient>
    <radialGradient id="lt" cx="25%" cy="8%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#220806" stop-opacity=".35"/></radialGradient></defs>
    <rect width="1000" height="${1500 - SCENE_TOP}" fill="#ebe1cf"/>
    <g opacity=".5">${Array.from({ length: 13 }, (_, k) => `<rect x="0" y="${k * 80}" width="1000" height="2" fill="#c9bba3"/>`).join("")}</g>
    <rect x="40" y="26" width="920" height="1200" fill="#f7f2e8"/><rect x="40" y="26" width="920" height="1200" fill="none" stroke="#cfc4b0" stroke-width="3"/>
    <rect x="76" y="58" width="848" height="1200" fill="url(#dd)"/>
    ${panel(112, 92, 360, 520)}${panel(528, 92, 360, 520)}${panel(112, 668, 360, 520)}${panel(528, 668, 360, 520)}
    <rect x="76" y="58" width="848" height="1200" fill="url(#lt)"/>
    <rect x="76" y="58" width="848" height="1200" fill="none" stroke="#4a1813" stroke-width="5"/>
    <g transform="translate(790 870)"><rect x="-26" y="-60" width="52" height="150" rx="22" fill="url(#br)" stroke="#6b4a0c" stroke-width="3"/><circle cx="0" cy="-8" r="32" fill="url(#br)" stroke="#6b4a0c" stroke-width="3"/><circle cx="-10" cy="-18" r="9" fill="#fff" opacity=".5"/><circle cx="0" cy="62" r="9" fill="#3b2a08"/><rect x="-5" y="62" width="10" height="20" rx="3" fill="#3b2a08"/></g>
    <path d="M110 10 Q500 -14 890 10" fill="none" stroke="#000" stroke-opacity=".0"/></svg>`;
}

const washi = (x, y, rot, color, w = 150) => `<div style="${abs(x - w / 2, y - 22, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,rgba(255,255,255,.32) 14px 22px);opacity:.92;box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:5;clip-path:polygon(0 0,3% 12%,0 26%,3% 40%,0 54%,3% 70%,0 86%,2% 100%,100% 100%,97% 86%,100% 70%,97% 56%,100% 40%,97% 26%,100% 12%,98% 0)`)}"></div>`;

function pin21() {
  const i = idea(21);
  const tick = `<svg viewBox="0 0 72 72" style="position:absolute;left:-6px;top:-14px;width:84px;height:84px;overflow:visible" aria-hidden="true"><path d="M12 38 L28 56 L66 6" fill="none" stroke="#27509c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows = i.items.map((t) => `<div class="row"><div class="box">${tick}</div><div class="hand txt">${esc(t)}</div></div>`).join("");
  const scene = `${door()}
  <div class="sheet" style="${abs(112, 440, 756, 708, "transform:rotate(-1.2deg)")}"><div class="rows">${rows}</div></div>
  ${washi(180, 444, -6, "#e0a95a")}${washi(830, 440, 5, "#8aa182")}${washi(150, 1136, 5, "#c9889a", 130)}${washi(826, 1140, -5, "#e0a95a", 130)}
  <svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><path d="M900 452 C 904 580 894 700 900 800" fill="none" stroke="#f3ecdd" stroke-width="4" stroke-linecap="round"/></svg>
  ${pencil({ x: 750, y: 938, len: 300, rot: 90 })}`;
  return printable({
    n: 21,
    scene,
    paper: "#efe9dc",
    extraCss: `
    .sheet{background:repeating-linear-gradient(transparent 0 64px,#a9c0d6 64px 66px) 0 88px/100% 100% no-repeat,linear-gradient(90deg,transparent 96px,#d98279 96px 99px,transparent 99px),#fbf7ea;
      box-shadow:0 2px 3px rgba(20,5,3,.3),0 22px 34px rgba(20,5,3,.45);z-index:3}
    .rows{position:absolute;left:0;right:20px;top:78px}
    .row{position:relative;padding-left:196px;margin-bottom:66px}
    .row .box{position:absolute;left:112px;top:4px;width:58px;height:58px;border:5px solid #3a3a44;border-radius:9px;background:#fffdf6}
    .row .txt{font-weight:700;font-size:56px;line-height:66px;color:#2b2a33}`,
  });
}

/* ---------------------------------------------------------------- #25 */

function folder({ x, y, w, h, tabX, tabW = 230, color, dark, rot = 0, label, labelColor = "#fff", body, light = false, z = 1 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">
    <div style="${abs(tabX, 0, tabW, 62, `background:${color};border-radius:16px 16px 0 0;box-shadow:inset 0 3px 0 rgba(255,255,255,.35)`)}"><div style="position:absolute;inset:0;display:grid;place-items:center;font:600 30px 'Plex';letter-spacing:.04em;color:${labelColor}">${esc(label)}</div></div>
    <div style="${abs(0, 54, w, h - 54, `background:linear-gradient(180deg,${color},${dark});border-radius:${tabX < 40 ? "0" : "16px"} 16px 0 0;box-shadow:0 -6px 18px rgba(40,20,5,.28),0 30px 40px rgba(40,20,5,.3)`)}"></div>
    <div style="${abs(0, 54, w, 10, "background:rgba(255,255,255,.28);border-radius:16px 16px 0 0")}"></div>
    ${body}</div>`;
}

function pin25() {
  const i = idea(25);
  const [file, record, ...wait] = i.items;
  const strip = (s, pre) => s.replace(new RegExp(`^${pre}: `), "");
  const labelCard = (inner, extra = "") => `<div class="lcard" style="${extra}">${inner}</div>`;
  const f1 = folder({
    x: 62, y: 392, w: 876, h: 520, tabX: 36, color: "#7f9a78", dark: "#6a8563", rot: -0.5, label: "File", z: 1,
    body: labelCard(`<div class="serif t1">${esc(strip(file, "File"))}</div>`, "left:46px;top:96px;width:762px"),
  });
  const f2 = folder({
    x: 74, y: 646, w: 856, h: 560, tabX: 330, color: "#e2b868", dark: "#cb9d4b", rot: 0.5, label: "Record", labelColor: "#3a2a0c", z: 2,
    body: labelCard(`<div class="serif t1">${esc(strip(record, "Record"))}</div>`, "left:44px;top:84px;width:768px"),
  });
  const lightLine = (s) => `<div class="serif t2">${esc(strip(s, "Can wait"))}</div>`;
  const f3 = folder({
    x: 60, y: 906, w: 880, h: 600, tabX: 596, tabW: 250, color: "#d3dde3", dark: "#c0cdd5", rot: -0.4, label: "Can wait", labelColor: "#34444f", z: 3,
    body: labelCard(wait.map(lightLine).join(""), "left:46px;top:96px;width:788px;background:#fbfcfc"),
  });
  const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, base: "#ddd8ce", dark: "#cfc9bd", planks: 5, seed: 7 })}
  ${f1}${f2}${f3}
  <div style="z-index:10;position:absolute;left:0;top:0">${binderClip({ x: 832, y: 478, rot: 6, size: 100 })}</div>
  ${pencil({ x: 90, y: 962, len: 470, rot: -1.5 }).replace("<svg", "<svg data-z")}`;
  return printable({
    n: 25,
    scene: scene.replace(/(<svg data-z style=")/, "$1z-index:9;"),
    paper: "#f2ece0",
    extraCss: `
    .lcard{position:absolute;background:#fffdf6;border-radius:6px;padding:20px 28px;box-shadow:0 2px 3px rgba(40,20,5,.22),0 8px 14px rgba(40,20,5,.2);color:#25211c}
    .t1{font-size:38px;line-height:1.2;font-weight:500}
    .t2{font-size:34px;line-height:1.2;padding:12px 0 12px 34px;position:relative;color:#3b4852;border-bottom:2px dashed #bfcad2}
    .t2:last-child{border-bottom:0}
    .t2::before{content:"";position:absolute;left:4px;top:25px;width:14px;height:14px;border-radius:50%;border:3px solid #8a9aa5}`,
  });
}

/* ---------------------------------------------------------------- #29 */

function crumpled({ x, y, w, h, rot, seed = 5 }) {
  const r = seeded(seed);
  const pts = [];
  const n = 26;
  for (let k = 0; k < n; k++) {
    const t = k / n, per = t * 4;
    let px, py;
    if (per < 1) { px = per * w; py = 0; } else if (per < 2) { px = w; py = (per - 1) * h; } else if (per < 3) { px = w - (per - 2) * w; py = h; } else { px = 0; py = h - (per - 3) * h; }
    const j = 11;
    px = Math.min(w, Math.max(0, px + (r() - 0.5) * 2 * j + (px === 0 ? j : px === w ? -j : 0)));
    py = Math.min(h, Math.max(0, py + (r() - 0.5) * 2 * j + (py === 0 ? j : py === h ? -j : 0)));
    pts.push(`${px.toFixed(0)},${py.toFixed(0)}`);
  }
  const creases = Array.from({ length: 14 }, () => {
    const a = [r() * w, r() * h], b = [r() * w, r() * h], dark = r() > 0.5;
    return `<path d="M${a[0].toFixed(0)} ${a[1].toFixed(0)} L${b[0].toFixed(0)} ${b[1].toFixed(0)}" stroke="${dark ? "#6b5a42" : "#fff"}" stroke-opacity="${dark ? 0.22 : 0.7}" stroke-width="${dark ? 2 : 3}"/>`;
  }).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 4px 4px rgba(60,25,10,.3)) drop-shadow(0 22px 22px rgba(60,25,10,.3))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><clipPath id="cr"><polygon points="${pts.join(" ")}"/></clipPath><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f1e4"/><stop offset=".5" stop-color="#e8dfcd"/><stop offset="1" stop-color="#f4ecdc"/></linearGradient></defs>
    <g clip-path="url(#cr)"><rect width="${w}" height="${h}" fill="url(#cg)"/>${creases}</g>
    <text x="${w / 2}" y="${h * 0.66}" text-anchor="middle" font-family="Hand" font-weight="700" font-size="118" fill="#4a3f33" transform="rotate(-3 ${w / 2} ${h / 2})">Research</text>
    <path d="M30 ${h * 0.58} L${w - 24} ${h * 0.42}" stroke="#35323a" stroke-width="12" stroke-linecap="round" opacity=".92"/><path d="M42 ${h * 0.64} L${w - 40} ${h * 0.5}" stroke="#35323a" stroke-width="7" stroke-linecap="round" opacity=".7"/></svg>`;
}

function calendarPage({ x, y, w, h, rot }) {
  const cols = 7, rows = 5, gx = 20, top = 98, cw = (w - gx * 2) / cols, ch = (h - top - 22) / rows;
  const light = new Set([8, 9, 10, 11, 12]);
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c, cx = gx + c * cw, cy = top + r * ch;
    cells.push(`<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="${light.has(k) ? "#f6d79a" : c > 4 ? "#f1ebe0" : "#fffdf8"}" stroke="#bfb29c" stroke-width="1.5"/>`);
    if (light.has(k)) cells.push(`<circle cx="${cx + cw / 2}" cy="${cy + ch / 2}" r="${cw * 0.2}" fill="#e0a95a"/>`);
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 3px 3px rgba(60,25,10,.25)) drop-shadow(0 20px 20px rgba(60,25,10,.3))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <path d="M0 0 H${w} V${h} H0 Z" fill="#fffdf8"/><rect width="${w}" height="70" fill="#a8564a"/><rect x="24" y="22" width="${w * 0.46}" height="14" rx="7" fill="#fff" opacity=".3"/>
    ${cells.join("")}${Array.from({ length: 5 }, (_, k) => `<rect x="${42 + k * ((w - 84) / 4) - 6}" y="-8" width="12" height="40" rx="6" fill="#c9ced4" stroke="#8d939b" stroke-width="2"/>`).join("")}</svg>`;
}

function pin29() {
  const i = idea(29);
  const [lighter, truth] = i.items;
  const pane = (x, y, w, h) => `<div style="${abs(x, y, w, h, "background:rgba(255,246,214,.32);transform:skewX(-14deg)")}"></div>`;
  const scene = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 12% 6%,#f5d3b3,#e1a982 55%,#c98a63);overflow:hidden")}">
      <div style="${abs(0, 0, 1000, 1128, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 7px),repeating-linear-gradient(0deg,rgba(120,60,30,.06) 0 2px,transparent 2px 7px)")}"></div>
      ${pane(60, -10, 270, 540)}${pane(366, -10, 270, 540)}${pane(60, 560, 270, 560)}${pane(366, 560, 270, 560)}
    </div>
  ${crumpled({ x: 70, y: 428, w: 540, h: 250, rot: -3 })}
  ${mug({ x: 690, y: 436, size: 190, color: "#fbf5ea", drink: "#8a5a35" })}
  <div class="truth"><div class="cap">Rule of Thumb</div><div class="serif tt">${esc(truth)}</div></div>
  ${calendarPage({ x: 70, y: 1034, w: 400, h: 304, rot: -2 })}
  <div class="light serif">${esc(lighter)}</div>
  ${pencil({ x: 560, y: 1304, len: 340, rot: -3 })}`;
  return printable({
    n: 29,
    scene,
    paper: "#f4ece0",
    extraCss: `
    .top{top:56px}.top h1{font-size:60px}
    .truth{position:absolute;left:70px;top:704px;width:860px;padding:26px 40px 30px;background:#fffdf8;border-radius:8px;transform:rotate(.6deg);box-shadow:${SHADOW}}
    .truth .cap{font:600 24px 'Plex';letter-spacing:.16em;text-transform:uppercase;color:${C.plum}}
    .truth .tt{font-size:40px;line-height:1.22;margin-top:12px;color:#1d1b19}
    .light{position:absolute;left:506px;top:1056px;width:430px;padding:26px 28px 26px;background:linear-gradient(180deg,#fbe7a8,#f6da8c);font-size:38px;line-height:1.2;color:#2a2318;transform:rotate(1.6deg);box-shadow:0 2px 3px rgba(60,25,10,.25),0 18px 24px rgba(60,25,10,.3)}`,
  });
}

/* ---------------------------------------------------------------- #18 */

function pin18() {
  const i = idea(18);
  const [eyebrow] = i.headline.split(": ");
  const [first, second] = i.items[0].split(". ").map((s, k) => (k === 0 ? `${s}.` : s));
  const css = `
  .bg{position:absolute;left:0;right:0;top:0;bottom:0;background:
    radial-gradient(ellipse at 28% 8%,rgba(255,255,255,.12),transparent 55%),
    repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 2px,transparent 2px 6px),#2f2a36}
  .peek{position:absolute;left:150px;top:1088px;width:700px;height:210px;transform:rotate(2.4deg);overflow:hidden;background:#fbfaf7;border-radius:3px;box-shadow:0 4px 6px rgba(0,0,0,.4),0 24px 36px rgba(0,0,0,.45)}
  .peek img{position:absolute;left:-60px;top:-50px;width:820px}
  .card{position:absolute;left:78px;top:92px;width:844px;height:1012px;transform:rotate(-1deg);background:#fbfaf7;border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,.4),0 34px 56px rgba(0,0,0,.5)}
  .card::before{content:"";position:absolute;left:0;right:0;top:0;height:14px;background:${C.plum};border-radius:6px 6px 0 0}
  .card .in{position:absolute;left:68px;right:68px;top:70px;bottom:56px;display:flex;flex-direction:column}
  .card .eyebrow{font-size:26px;letter-spacing:.18em;color:${C.plum}}
  .card .rule{width:132px;height:6px;background:${C.plum};margin:30px 0 40px}
  .card .big{font:500 120px/1.0 "Newsreader",Georgia,serif;letter-spacing:-.025em;color:#1d1d20}
  .card .second{font:400 62px/1.2 "Newsreader",Georgia,serif;color:#34323a;margin-top:48px}
  .card .chap{margin-top:auto;border-top:2px solid #1d1d20;padding-top:22px;font:400 26px/1.4 "Plex",sans-serif;color:#55525c;letter-spacing:.01em}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#f0e8d8;box-shadow:0 -8px 22px rgba(0,0,0,.4);z-index:5}
  .foot{z-index:7}`;
  const body = `<div class="bg"></div>
  <div class="peek" data-check="page"><img src="${bookPage(6)}" alt=""></div>
  <div class="card" data-check="quote"><div class="in">
    <div class="eyebrow">${esc(eyebrow)}</div><div class="rule"></div>
    <div class="big">${esc(first)}</div>
    <div class="second">${esc(second)}</div>
    <div class="chap">${esc(i.sub)}</div></div></div>
  ${binderClip({ x: 740, y: 1050, rot: 3, size: 100 })}
  <div class="footbar"></div>${footFor(i)}`;
  return { n: 18, id: `18-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: "#2f2a36" }) };
}

export const pins = [pin17(), pin21(), pin25(), pin29(), pin18()];
