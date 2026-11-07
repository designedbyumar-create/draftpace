/**
 * Batch 3, module c: #17 (a fridge door, the first two weeks), #21 (an open
 * spiral notebook on green felt, the first-week checklist), #25 (three
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

/** A round fridge magnet, centred on (x, y). */
const magnet = (x, y, color, d = 56) =>
  `<div style="${abs(x - d / 2, y - d / 2, d, d, `border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.65),${color} 36%,${color});box-shadow:0 3px 3px rgba(20,30,40,.35),0 10px 10px rgba(20,30,40,.25);z-index:6`)}"></div>`;

/* ---------------------------------------------------------------- #17 */

function pin17() {
  const i = idea(17);
  const offs = [0, 60, 10, 50, 0];
  const widths = [740, 760, 640, 700, 500];
  const rots = [-1.2, 1, -0.8, 1.3, -1];
  const mags = ["#d9694f", "#e0a95a", "#7fa08a", "#7a4b8a", "#4f6c8c"];
  const cards = i.items.map((t, k) => `<div class="icard serif" style="margin-left:${offs[k]}px;width:${widths[k]}px;transform:rotate(${rots[k]}deg)">
      <span style="position:absolute;left:50%;top:-26px;margin-left:-28px;width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.65),${mags[k]} 36%,${mags[k]});box-shadow:0 3px 3px rgba(20,30,40,.35),0 10px 10px rgba(20,30,40,.25)"></span>${esc(t)}</div>`).join("");
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(90deg,#a9c4cf 0,#bcd5de 6%,#c9dfe6 36%,#bdd6df 64%,#aac5d0 100%)")}"></div>
  <div style="${abs(0, SCENE_TOP, 22, 1500 - SCENE_TOP, "background:linear-gradient(90deg,#7e9aa6,#a5bfca);box-shadow:inset -3px 0 4px rgba(0,0,0,.12)")}"></div>
  <div style="${abs(250, SCENE_TOP, 160, 1500 - SCENE_TOP, "background:linear-gradient(100deg,transparent,rgba(255,255,255,.28) 50%,transparent);transform:skewX(-8deg)")}"></div>
  <div style="${abs(56, 480, 38, 760, "border-radius:19px;background:linear-gradient(90deg,#8f969c,#f1f3f5 40%,#c4c8cd 70%,#7a8087);box-shadow:8px 14px 18px rgba(30,45,55,.38)")}"></div>
  <div style="${abs(94, 540, 38, 18, "background:#8d9399;border-radius:3px;box-shadow:4px 6px 6px rgba(30,45,55,.3)")}"></div>
  <div style="${abs(94, 1160, 38, 18, "background:#8d9399;border-radius:3px;box-shadow:4px 6px 6px rgba(30,45,55,.3)")}"></div>
  <div class="stack">${cards}</div>
  ${drawing({ x: 700, y: 1168, w: 230, rot: 4 })}
  ${magnet(820, 1172, "#e0a95a")}
  <div style="${abs(766, 408, 190, 64, "background:#fffdf6;border-radius:6px;transform:rotate(2deg);box-shadow:0 2px 3px rgba(20,30,40,.25),0 12px 18px rgba(20,30,40,.3);display:grid;place-items:center;z-index:3")}"><span class="example" style="font-size:24px;padding:5px 12px;color:#4b4339">Example</span></div>
  ${magnet(861, 410, "#d9694f", 46)}`;
  return printable({
    n: 17,
    scene,
    paper: "#f4eee4",
    extraCss: `
    .top{top:52px}.top h1{font-size:78px}.top p{font-size:26px;margin-top:12px}
    .stack{position:absolute;left:130px;top:446px;width:830px;display:flex;flex-direction:column;gap:28px;z-index:4}
    .icard{position:relative;width:640px;padding:48px 30px 12px;background:
      linear-gradient(#d2584a,#d2584a) 0 36px/100% 3px no-repeat,
      repeating-linear-gradient(transparent 0 40px,#aac3d3 40px 42px) 0 48px/100% 100% no-repeat,#fffdf6;
      font-size:34px;line-height:42px;color:#26221d;border-radius:6px;box-shadow:0 2px 3px rgba(20,30,40,.25),0 14px 22px rgba(20,30,40,.3)}`,
  });
}

/* ---------------------------------------------------------------- #21 */

function felt() {
  return `<svg style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP)}" viewBox="0 0 1000 ${1500 - SCENE_TOP}" aria-hidden="true"><defs>
    <filter id="fz" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 .1  0 0 0 0 0  0 0 0 .55 -.12"/></filter>
    <radialGradient id="fv" cx="30%" cy="10%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#0d1f15" stop-opacity=".4"/></radialGradient></defs>
    <rect width="1000" height="${1500 - SCENE_TOP}" fill="#4a6b57"/><rect width="1000" height="${1500 - SCENE_TOP}" filter="url(#fz)"/><rect width="1000" height="${1500 - SCENE_TOP}" fill="url(#fv)"/></svg>`;
}

function pin21() {
  const i = idea(21);
  const rings = Array.from({ length: 15 }, (_, k) => {
    const x = 36 + k * 53;
    return `<ellipse cx="${x}" cy="40" rx="11" ry="8" fill="#2a2c30" opacity=".55"/><path d="M${x - 10} 52 C ${x - 8} 6, ${x + 20} 6, ${x + 18} 46" fill="none" stroke="#b9bdc4" stroke-width="7" stroke-linecap="round"/><path d="M${x - 8} 24 C ${x - 4} 8, ${x + 12} 8, ${x + 14} 24" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join("");
  const tick = `<svg viewBox="0 0 72 72" style="position:absolute;left:-6px;top:-14px;width:84px;height:84px;overflow:visible" aria-hidden="true"><path d="M12 38 L28 56 L66 6" fill="none" stroke="#27509c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows = i.items.map((t) => `<div class="row"><div class="box">${tick}</div><div class="hand txt">${esc(t)}</div></div>`).join("");
  const scene = `${felt()}
  <div style="${abs(40, 1088, 560, 270, "transform:rotate(-7deg);z-index:1")}">${drawing({ x: 60, y: 90, w: 300, rot: 0 })}</div>
  <div style="${abs(66, 436, 868, 900, "transform:rotate(-1.6deg);background:#25282d;border-radius:14px;box-shadow:0 4px 6px rgba(0,0,0,.35),0 34px 50px rgba(0,0,0,.5)")}"></div>
  <div class="nb" style="${abs(78, 428, 844, 890, "transform:rotate(-1.6deg)")}">
    <div class="paper"></div>
    <svg style="${abs(0, -4, 844, 70, "z-index:3")}" viewBox="0 0 844 70" aria-hidden="true">${rings}</svg>
    <div class="rows">${rows}</div>
  </div>
  ${pencil({ x: 440, y: 1272, len: 470, rot: -5 })}`;
  return printable({
    n: 21,
    scene,
    paper: "#efe9dc",
    extraCss: `
    .nb .paper{position:absolute;left:0;right:0;top:20px;bottom:0;background:
      linear-gradient(90deg,transparent 108px,#d98279 108px 111px,transparent 111px),
      repeating-linear-gradient(transparent 0 70px,#a9c0d6 70px 72px) 0 112px/100% 100% no-repeat,#fbf7ea;
      border-radius:6px;box-shadow:inset 0 0 40px rgba(120,90,40,.12)}
    .rows{position:absolute;left:0;right:30px;top:112px;z-index:2}
    .row{position:relative;padding-left:150px;margin-bottom:72px}
    .row .box{position:absolute;left:34px;top:14px;width:62px;height:62px;border:5px solid #3a3a44;border-radius:9px;background:#fffdf6}
    .row .txt{font-weight:700;font-size:58px;line-height:72px;color:#2b2a33;margin-top:-2px}`,
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
    body: labelCard(`<div class="serif t1">${esc(strip(file, "File"))}</div>`, "left:46px;top:96px;width:784px"),
  });
  const f2 = folder({
    x: 74, y: 646, w: 856, h: 560, tabX: 330, color: "#e2b868", dark: "#cb9d4b", rot: 0.5, label: "Record", labelColor: "#3a2a0c", z: 2,
    body: labelCard(`<div class="serif t1">${esc(strip(record, "Record"))}</div>`, "left:44px;top:94px;width:768px"),
  });
  const lightLine = (s) => `<div class="serif t2">${esc(cap(strip(s, "Can wait")))}</div>`;
  const f3 = folder({
    x: 60, y: 898, w: 880, h: 600, tabX: 596, tabW: 250, color: "#d3dde3", dark: "#c0cdd5", rot: -0.4, label: "Can wait", labelColor: "#34444f", z: 3,
    body: labelCard(wait.map(lightLine).join(""), "left:46px;top:96px;width:788px;background:#fbfcfc"),
  });
  const scene = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, base: "#ddd8ce", dark: "#cfc9bd", planks: 5, seed: 7 })}
  ${f1}${f2}${f3}
  ${binderClip({ x: 770, y: 468, rot: 6, size: 100 })}
  ${pencil({ x: 470, y: 1268, len: 440, rot: -4 }).replace("<svg", "<svg data-z")}`;
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
  ${calendarPage({ x: 70, y: 1010, w: 400, h: 330, rot: -2 })}
  <div class="light serif">${esc(cap(lighter))}</div>
  ${pencil({ x: 560, y: 1294, len: 340, rot: -3 })}`;
  return printable({
    n: 29,
    scene,
    paper: "#f4ece0",
    extraCss: `
    .top{top:56px}.top h1{font-size:60px}
    .truth{position:absolute;left:70px;top:724px;width:860px;padding:26px 40px 30px;background:#fffdf8;border-radius:8px;transform:rotate(.6deg);box-shadow:${SHADOW}}
    .truth .cap{font:600 24px 'Plex';letter-spacing:.16em;text-transform:uppercase;color:${C.plum}}
    .truth .tt{font-size:40px;line-height:1.22;margin-top:12px;color:#1d1b19}
    .light{position:absolute;left:506px;top:1030px;width:430px;padding:26px 28px 26px;background:linear-gradient(180deg,#fbe7a8,#f6da8c);font-size:38px;line-height:1.2;color:#2a2318;transform:rotate(1.6deg);box-shadow:0 2px 3px rgba(60,25,10,.25),0 18px 24px rgba(60,25,10,.3)}`,
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
  .peek img{position:absolute;left:-60px;top:-34px;width:820px}
  .card{position:absolute;left:78px;top:92px;width:844px;height:1012px;transform:rotate(-1deg);background:#fbfaf7;border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,.4),0 34px 56px rgba(0,0,0,.5)}
  .card::before{content:"";position:absolute;left:0;right:0;top:0;height:14px;background:${C.plum};border-radius:6px 6px 0 0}
  .card .in{position:absolute;left:68px;right:68px;top:70px;bottom:56px;display:flex;flex-direction:column}
  .card .eyebrow{font-size:26px;letter-spacing:.18em;color:${C.plum}}
  .card .rule{width:132px;height:6px;background:${C.plum};margin:30px 0 40px}
  .card .big{font:500 118px/1.0 "Newsreader",Georgia,serif;letter-spacing:-.025em;color:#1d1d20}
  .card .second{font:400 58px/1.2 "Newsreader",Georgia,serif;color:#34323a;margin-top:44px}
  .card .chap{margin-top:auto;border-top:2px solid #1d1d20;padding-top:22px;font:400 26px/1.4 "Plex",sans-serif;color:#55525c;letter-spacing:.01em}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#f0e8d8;box-shadow:0 -8px 22px rgba(0,0,0,.4);z-index:5}
  .foot{z-index:7}`;
  const body = `<div class="bg"></div>
  <div class="peek" data-check="page"><img src="${bookPage(6)}" alt=""></div>
  ${binderClip({ x: 760, y: 1060, rot: 3, size: 96 })}
  <div class="card" data-check="quote"><div class="in">
    <div class="eyebrow">${esc(eyebrow)}</div><div class="rule"></div>
    <div class="big">${esc(first)}</div>
    <div class="second">${esc(second)}</div>
    <div class="chap">${esc(i.sub)}</div></div></div>
  <div class="footbar"></div>${footFor(i)}`;
  return { n: 18, id: `18-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper: "#2f2a36" }) };
}

export const pins = [pin17(), pin21(), pin25(), pin29(), pin18()];
