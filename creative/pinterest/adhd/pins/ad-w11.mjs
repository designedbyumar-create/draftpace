/**
 * ADHD Life Companion guide pins, world w11: waiting room and clinic desk.
 * Teal-grey laminate, cream paper, soft green; a clipboard, an appointment card,
 * a plastic chair, a plant, a pen on a chain, a reception counter edge.
 * #81 how-to-steps      five stepping-stone cards from an appointment card to a small calendar, on a laminate counter
 * #83 template-preview  a ruled one-page sheet beside a kraft envelope, the Reference numbers row ringed, on a green blotter
 * #85 checklist         a spiral pad on a clipboard at a reception counter edge, four empty boxes, a pen on a chain
 * #87 quote-card        a wide pile of unopened mail on a blush counter, one cream card across it
 * #89 scenario          a waiting-room lap seen from above: knees, a tote bag, one page with four lines
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

const G = {
  ink: "#1f2a2b", teal: "#4f7f7d", tealDeep: "#2f5654", tealGrey: "#8fa9a6", tealSoft: "#dbe8e5",
  green: "#a9c3a4", greenDeep: "#6f9470", greenSoft: "#e5eede", cream: "#fbf6ea", creamDeep: "#efe6d0",
};

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** Header block (eyebrow, headline) and footer band, as the finished pins have. */
function frame(i, { paper, size = 76, split = ": ", textTop = 60, extraCss = "" }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(split);
  if (at > 0) { eyebrow = i.headline.slice(0, at); head = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(20,35,35,.28);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(20,35,35,.28);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d4549}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1></div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

/** A hand-drawn loop around a box of w x h, as an svg. */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, halo = null, sq = 2 } = {}) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2, N = 56, start = r() * 6.28;
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, a = start + t * Math.PI * 2 * 1.08;
    const wob = 1 + 0.02 * Math.sin(t * 11 + seed) + t * 0.04;
    const c = Math.cos(a), sn = Math.sin(a), e = 2 / sq;
    pts.push(`${(cx + Math.sign(c) * Math.abs(c) ** e * (w / 2 - sw) * wob).toFixed(1)},${(cy + Math.sign(sn) * Math.abs(sn) ** e * (h / 2 - sw) * wob).toFixed(1)}`);
  }
  const d = `M${pts.join(" L")}`;
  return `<svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${halo ? `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${sw + 8}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

const exTag = (x, y, rot = 0, z = 20) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.25)">Example</div>`;

/** A top-down potted plant: a pot, then leaves radiating from it. */
function plant({ x, y, r = 130, seed = 4, z = 8, leaves = 11 }) {
  const rg = rng(seed);
  const cx = r + 60, cy = r + 60, S = (r + 60) * 2;
  const tones = ["#6f9a6c", "#7fa97a", "#5d8a5e", "#8db487"];
  let lv = "";
  for (let k = 0; k < leaves; k++) {
    const a = (k / leaves) * 360 + rg() * 18;
    const len = r * (0.8 + rg() * 0.5), wd = 26 + rg() * 12;
    const t = tones[k % tones.length];
    lv += `<g transform="rotate(${a} ${cx} ${cy})"><path d="M${cx} ${cy} C${cx - wd} ${cy - len * 0.35} ${cx - wd * 0.7} ${cy - len * 0.85} ${cx} ${cy - len} C${cx + wd * 0.7} ${cy - len * 0.85} ${cx + wd} ${cy - len * 0.35} ${cx} ${cy}Z" fill="${t}"/><path d="M${cx} ${cy - 6} L${cx} ${cy - len + 8}" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/><path d="M${cx} ${cy} C${cx - wd} ${cy - len * 0.35} ${cx - wd * 0.7} ${cy - len * 0.85} ${cx} ${cy - len}" fill="none" stroke="#2f5a3a" stroke-opacity=".25" stroke-width="3"/></g>`;
  }
  return `<svg style="${abs(x - 60, y - 60, S, S, `z-index:${z};filter:drop-shadow(10px 16px 12px rgba(10,30,30,.4))`)}" viewBox="0 0 ${S} ${S}" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${r * 0.46}" fill="#d9d2c4"/><circle cx="${cx}" cy="${cy}" r="${r * 0.38}" fill="#4a3b30"/>${lv}
    <circle cx="${cx}" cy="${cy}" r="14" fill="#3f7544"/></svg>`;
}

/** A pen lying with a beaded chain running to a small base on the counter (all in pin coordinates). */
function penChain({ px, py, rot = -8, len = 330, ax, ay, sag = 70, z = 14, color = "#2f5654" }) {
  const rad = (rot * Math.PI) / 180;
  const ex = px + Math.cos(rad) * len, ey = py + Math.sin(rad) * len; // far end of the pen, where the chain is fixed
  const cxp = (ex + ax) / 2, cyp = (ey + ay) / 2 + sag;
  let beads = "";
  for (let k = 0; k <= 34; k++) {
    const t = k / 34, u = 1 - t;
    const bx = u * u * ex + 2 * u * t * cxp + t * t * ax, by = u * u * ey + 2 * u * t * cyp + t * t * ay;
    beads += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="5.5" fill="#b9c0c4" stroke="#7d868b" stroke-width="1.4"/><circle cx="${(bx - 1.6).toFixed(1)}" cy="${(by - 1.8).toFixed(1)}" r="2" fill="#fff" opacity=".8"/>`;
  }
  return `<svg style="position:absolute;left:0;top:0;z-index:${z};pointer-events:none;overflow:visible" width="1000" height="1500" viewBox="0 0 1000 1500" aria-hidden="true">
    <g style="filter:drop-shadow(0 6px 4px rgba(10,25,25,.38))">${beads}</g>
    <g style="filter:drop-shadow(0 4px 4px rgba(10,25,25,.4))"><circle cx="${ax}" cy="${ay}" r="26" fill="#aeb6ba"/><circle cx="${ax}" cy="${ay}" r="26" fill="none" stroke="#7d868b" stroke-width="3"/><circle cx="${ax}" cy="${ay}" r="9" fill="#6c757a"/><path d="M${ax - 7} ${ay - 2} L${ax + 7} ${ay + 2}" stroke="#2b3236" stroke-width="3" stroke-linecap="round"/></g>
    <g transform="translate(${px} ${py}) rotate(${rot})" style="filter:drop-shadow(0 9px 6px rgba(10,25,25,.4))">
      <rect x="44" y="-11" width="${len - 56}" height="22" rx="11" fill="${color}"/><rect x="50" y="-8" width="${len - 80}" height="6" rx="3" fill="#fff" opacity=".22"/>
      <rect x="${len - 120}" y="-12" width="12" height="24" fill="#c9d1d4"/><rect x="${len - 22}" y="-8" width="12" height="16" rx="3" fill="#c9d1d4"/>
      <path d="M46 -9 L8 -2 L8 2 L46 9 Z" fill="#c9d1d4"/><path d="M12 -2 L-4 0 L12 2 Z" fill="#22252b"/></g></svg>`;
}

/** A clinic appointment card with a header strip, ruled lines and one circled cell (no words). */
function apptCard({ x, y, w = 330, h = 196, rot = 0, z = 6 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${G.cream};border-radius:8px;box-shadow:0 2px 3px rgba(20,40,40,.3),0 16px 22px rgba(10,35,35,.36);z-index:${z};overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:46px;background:${G.teal}"></div>
    <div style="position:absolute;left:20px;top:16px;width:96px;height:14px;border-radius:7px;background:rgba(255,255,255,.7)"></div>
    <div style="position:absolute;left:20px;right:150px;top:84px;height:3px;background:#d3dccf"></div>
    <div style="position:absolute;left:20px;right:150px;top:122px;height:3px;background:#d3dccf"></div>
    <div style="position:absolute;left:20px;right:150px;top:160px;height:3px;background:#d3dccf"></div>
    <div style="position:absolute;right:26px;top:70px;width:96px;height:96px;border-radius:50%;border:6px solid ${C.mulberry}"></div>
    <div style="position:absolute;right:50px;top:100px;width:48px;height:5px;border-radius:3px;background:#c9d4cb"></div>
    <div style="position:absolute;right:50px;top:124px;width:34px;height:5px;border-radius:3px;background:#c9d4cb"></div></div>`;
}

/** A small wall calendar: a header strip, a grid without numerals, one cell circled in mulberry. */
function wallCalendar({ x, y, w = 224, h = 290, rot = 0, z = 6, circle = [3, 2] }) {
  const cols = 7, rows = 5, gx = 16, gy = 78, cw = (w - gx * 2) / cols, chh = (h - gy - 16) / rows;
  let cells = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells += `<rect x="${gx + c * cw}" y="${gy + r * chh}" width="${cw}" height="${chh}" fill="none" stroke="#c5d3cc" stroke-width="2"/>`;
  const cxm = gx + circle[0] * cw + cw / 2, cym = gy + circle[1] * chh + chh / 2;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(8px 14px 12px rgba(10,35,35,.42))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="8" fill="${G.cream}"/><path d="M0 8 Q0 0 8 0 L${w - 8} 0 Q${w} 0 ${w} 8 L${w} 54 L0 54Z" fill="${G.greenDeep}"/>
    <circle cx="${w / 2}" cy="16" r="7" fill="#1c2b2b" opacity=".5"/><rect x="${w / 2 - 50}" y="30" width="100" height="12" rx="6" fill="#fff" opacity=".62"/>
    ${cells}<ellipse cx="${cxm}" cy="${cym}" rx="${cw * 0.8}" ry="${chh * 0.78}" fill="none" stroke="${C.mulberry}" stroke-width="5"/></svg>`;
}

/** A kraft envelope (flap down, drawn flat). */
function kraftEnvelope({ x, y, w = 420, h = 290, rot = 0, z = 4 }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(8px 18px 14px rgba(20,35,25,.42))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="6" fill="#c9a574"/><rect width="${w}" height="${h}" rx="6" fill="url(#kr${z})"/>
    <defs><linearGradient id="kr${z}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
    <path d="M0 0 L${w / 2} ${h * 0.55} L${w} 0" fill="#d4b383" stroke="#a98456" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M0 ${h} L${w * 0.4} ${h * 0.46}" stroke="#a98456" stroke-width="2" fill="none"/><path d="M${w} ${h} L${w * 0.6} ${h * 0.46}" stroke="#a98456" stroke-width="2" fill="none"/></svg>`;
}

/* ================================================================ #81 */
function p81() {
  const n = 81;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e3ecea", size: 76 });
  const steps = i.items.map((s) => { const k = s.indexOf(": "); return [s.slice(0, k), s.slice(k + 2)]; });

  const counter = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(120% 80% at 30% 20%,#a6bdba,#8ba6a3 60%,#7a9794)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:radial-gradient(rgba(255,255,255,.16) 1.5px,transparent 2px),radial-gradient(rgba(30,60,60,.12) 1.5px,transparent 2px);background-size:23px 23px,31px 31px;background-position:0 0,11px 14px")}"></div>`;

  const appt = apptCard({ x: 44, y: 424, w: 330, h: 190, rot: -3, z: 7 });
  const sub = `<div data-check="sub" style="${abs(486, 452, 450, 150, `background:${G.cream};border-radius:6px;box-shadow:0 2px 3px rgba(20,40,40,.3),0 14px 20px rgba(10,35,35,.34);transform:rotate(1.6deg);z-index:6;padding:20px 26px`)}"><div style="font:500 27px/1.3 'Plex',sans-serif;color:#2f3d3d">${esc(i.sub)}</div></div>`;

  const x0 = 30, dx = 56, cw = 500;
  const rot = [-0.8, 0.9, -0.6, 0.8, -0.7];
  const cards = steps.map(([when, what], k) => `
    <div data-check="step" style="position:relative;margin:${k ? 44 : 0}px 0 0 ${x0 + k * dx}px;width:${cw}px;transform:rotate(${rot[k]}deg);z-index:${10 + k}">
      <div style="position:absolute;left:22px;top:-32px;height:36px;padding:0 16px;border-radius:9px 9px 0 0;background:${C.mulberry};color:#fff;font:600 23px/36px 'Plex',sans-serif;white-space:nowrap;box-shadow:0 -2px 4px rgba(20,40,40,.15)">${esc(when)}</div>
      <div style="background:${G.cream};border-radius:7px 9px 9px 9px;box-shadow:0 2px 3px rgba(20,40,40,.3),0 14px 20px rgba(10,35,35,.34);padding:14px 22px 15px 22px;font:500 26px/1.27 'Plex',sans-serif;color:${G.ink};background-image:linear-gradient(rgba(255,255,255,.4),rgba(255,255,255,0) 40%)">${esc(what)}</div>
    </div>`).join("");
  const column = `<div style="position:absolute;left:0;top:672px;z-index:10">${cards}</div>`;

  const cal = wallCalendar({ x: 748, y: 1030, w: 214, h: 276, rot: 3, z: 9 });
  const step = `<div style="${abs(716, 1158, 56, 56, "border-radius:50%;background:#f5efe0;display:grid;place-items:center;z-index:12;box-shadow:0 3px 6px rgba(0,0,0,.35)")}">${icon("caret-right", { size: 36, color: C.mulberry, weight: "bold" })}</div>`;
  const pl = plant({ x: 720, y: 700, r: 125, seed: 9, z: 5 });

  const body = `${counter}${pl}${appt}${sub}${column}${cal}${step}${fh}`;
  return { n, id: `${n}-after-adhd-diagnosis-first-month-admin-in-order`, html: page(p, { body, css: fc, paper: "#e3ecea" }) };
}

/* ================================================================ #83 */
function p83() {
  const n = 83;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ecefdf", size: 74 });
  const rows = i.items.map((s) => { const k = s.indexOf(": "); return [s.slice(0, k), s.slice(k + 2)]; });

  const blotter = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 60% 30%,#bcd1b5,#a3bd9d 62%,#90ad8b)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 2px,transparent 2px 9px),repeating-linear-gradient(0deg,rgba(40,70,40,.05) 0 2px,transparent 2px 9px)")}"></div>`;

  const env = kraftEnvelope({ x: 690, y: 640, w: 390, h: 268, rot: 9, z: 4 });
  const envCard = `<div style="${abs(790, 612, 190, 120, `transform:rotate(9deg);background:${G.cream};border-radius:6px;z-index:3;box-shadow:0 6px 10px rgba(20,35,25,.3)`)}"><div style="position:absolute;left:0;right:0;top:0;height:30px;background:${G.teal};border-radius:6px 6px 0 0"></div></div>`;

  const ROWH = 158, PW = 750, HEAD = 92;
  const rowHtml = rows.map(([label, text], k) => `
    <div style="position:relative;height:${ROWH}px;padding:30px 26px 0 34px;border-bottom:2px solid #c7d6cf;overflow:hidden">
      <div style="font:600 22px/26px 'Plex',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${G.tealDeep}">${esc(label)}</div>
      <div class="hand" style="margin-top:6px;font:600 39px/41px 'Hand',cursive;color:${G.ink}">${esc(text)}</div>
    </div>`).join("");
  const ringIdx = rows.findIndex(([l]) => l === "Reference numbers");
  const ringBox = `<div style="${abs(10, HEAD + ringIdx * ROWH - 2, PW - 20, ROWH + 2, "z-index:5")}">${ring(PW - 20, ROWH + 2, { sw: 7, seed: 12, halo: "rgba(255,253,246,.9)", sq: 3.2 })}</div>`;

  const sheet = `
  <div style="${abs(24, 404, PW, HEAD + ROWH * rows.length + 8, "transform:rotate(-1.3deg);background:#fffdf6;border-radius:5px;box-shadow:0 2px 3px rgba(20,40,25,.3),0 26px 36px rgba(15,40,20,.42);z-index:8;overflow:visible")}">
    <div data-check="note" style="position:absolute;left:34px;top:30px;font:italic 400 28px/1.2 'Newsreader',serif;color:#4a5753">${esc(i.sub)}</div>
    <div class="example" style="position:absolute;right:28px;top:26px">Example</div>
    <div style="position:absolute;left:0;right:0;top:${HEAD}px;border-top:2px solid #c7d6cf" data-check="rows">${rowHtml}</div>
    <div style="position:absolute;left:22px;top:${HEAD}px;bottom:0;width:2px;background:#e7b9c6"></div>
    ${ringBox}
  </div>`;
  const clip = `<svg style="${abs(500, 376, 120, 130, "z-index:11;filter:drop-shadow(0 8px 6px rgba(0,0,0,.4));transform:rotate(-1.3deg)")}" viewBox="0 0 120 130" aria-hidden="true"><path d="M18 50 L18 14 Q18 4 28 4 L92 4 Q102 4 102 14 L102 50Z" fill="#2c3438"/><path d="M10 50 L110 50 L100 110 L20 110Z" fill="#1d2326"/><path d="M34 50 L34 20 L86 20 L86 50" fill="none" stroke="#9aa5aa" stroke-width="7" stroke-linecap="round"/></svg>`;
  const pencil = `<svg style="${abs(725, 910, 340, 40, "transform:rotate(-80deg);z-index:9;filter:drop-shadow(0 8px 6px rgba(15,35,20,.4))")}" viewBox="0 0 340 40" aria-hidden="true"><rect x="46" y="8" width="258" height="24" fill="#e9b94c"/><rect x="46" y="8" width="258" height="7" fill="#f6d27a"/><rect x="46" y="26" width="258" height="6" fill="#c8942e"/><rect x="298" y="8" width="14" height="24" fill="#c9d1d4"/><rect x="310" y="8" width="26" height="24" rx="6" fill="#d98aa0"/><path d="M46 8 L6 20 L46 32Z" fill="#ecd7b0"/><path d="M14 17 L2 20 L14 23Z" fill="#2a2a2a"/></svg>`;
  const pl = plant({ x: 820, y: 1170, r: 80, seed: 21, z: 10 });

  const body = `${blotter}${env}${envCard}${sheet}${pencil}${pl}${fh}`;
  return { n, id: `${n}-adhd-diagnosis-admin-the-one-page`, html: page(p, { body, css: fc, paper: "#ecefdf" }) };
}

/* ================================================================ #85 */
function p85() {
  const n = 85;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e2ecec", size: 70 });

  const counter = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 70% at 40% 30%,#5f8583,#4a6f6d 60%,#3f6361)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 8px)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 70, "background:linear-gradient(#e9efe9,#cdd9d3);box-shadow:0 8px 14px rgba(10,30,30,.45);z-index:3")}"></div>
  <div style="${abs(0, SCENE_TOP + 62, 1000, 8, "background:#9fb2ac;z-index:3")}"></div>`;

  // The clipboard: a board with a metal clip, carrying a spiral pad.
  const cbX = 62, cbY = 462, cbW = 800, cbH = 850;
  const board = `<div style="${abs(cbX, cbY, cbW, cbH, "transform:rotate(2.2deg);background:linear-gradient(150deg,#86ad8b,#6c9672);border-radius:18px;box-shadow:0 3px 3px rgba(5,25,25,.4),0 30px 40px rgba(5,25,25,.5);z-index:5")}"></div>`;
  const qs = i.items;
  const boxes = qs.map((q, k) => `
    <div data-check="q" style="padding-bottom:4px;display:flex;gap:22px;align-items:flex-start;margin-top:${k ? 36 : 0}px">
      <div style="flex:none;width:46px;height:46px;margin-top:5px;border:5px solid ${G.ink};border-radius:8px;background:rgba(255,255,255,.55)"></div>
      <div class="hand" style="font:600 41px/46px 'Hand',cursive;color:${G.ink};text-wrap:pretty">${esc(q)}</div>
    </div>`).join("");
  const padW = 690, padH = 730;
  const pad = `
  <div style="${abs(cbX + 52, cbY + 74, padW, padH, "transform:rotate(2.2deg);transform-origin:-52px -74px;background:#fffdf5;border-radius:6px 6px 10px 10px;box-shadow:0 2px 3px rgba(5,25,25,.3),0 14px 22px rgba(5,25,25,.34);z-index:7;background-image:repeating-linear-gradient(transparent 0 46px,#d1ddd6 46px 48px);background-position:0 48px")}">
    <div style="position:absolute;left:0;right:0;top:0;height:62px;background:linear-gradient(#dfe7e4,#c8d4d0);border-radius:6px 6px 0 0"></div>
    <div class="hand" data-check="sub" style="position:absolute;left:34px;right:30px;top:74px;font:600 36px/42px 'Hand',cursive;color:#2f5654;white-space:nowrap;padding-bottom:4px">${esc(i.sub)}</div>
    <div style="position:absolute;left:34px;right:26px;top:140px">${boxes}</div>
    <div data-check="disc" style="position:absolute;left:36px;bottom:20px;font:500 24px/30px 'Plex',sans-serif;color:#44575a">Not medical advice</div>
  </div>`;
  // spiral coils across the pad's top edge
  let coils = "";
  for (let k = 0; k < 13; k++) coils += `<path d="M${22 + k * 52} 40 Q${22 + k * 52} -16 ${42 + k * 52} -2" fill="none" stroke="#7b8588" stroke-width="7" stroke-linecap="round"/><ellipse cx="${34 + k * 52}" cy="28" rx="9" ry="11" fill="#2d3538"/>`;
  const coilSvg = `<svg style="${abs(cbX + 52, cbY + 56, padW, 80, "transform:rotate(2.2deg);transform-origin:-52px -56px;z-index:9;filter:drop-shadow(0 4px 3px rgba(5,25,25,.4))")}" viewBox="0 0 ${padW} 80" aria-hidden="true">${coils}</svg>`;
  const clip = `<svg style="${abs(cbX + 270, cbY - 30, 260, 120, "transform:rotate(2.2deg);transform-origin:-270px 30px;z-index:12;filter:drop-shadow(0 8px 6px rgba(0,0,0,.45))")}" viewBox="0 0 260 120" aria-hidden="true"><rect x="10" y="30" width="240" height="62" rx="12" fill="#b4bec2"/><rect x="10" y="30" width="240" height="20" rx="10" fill="#e6ecee"/><rect x="70" y="8" width="120" height="44" rx="10" fill="#8f9a9f"/><rect x="92" y="18" width="76" height="14" rx="7" fill="#4b565b"/></svg>`;

  const pl = plant({ x: 770, y: 450, r: 110, seed: 33, z: 4 });
  const pc = penChain({ px: 560, py: 1274, rot: -9, len: 340, ax: 936, ay: 1262, sag: 60, z: 13, color: "#f1f1ea" });

  const body = `${counter}${pl}${board}${pad}${coilSvg}${clip}${pc}${fh}`;
  return { n, id: `${n}-after-adhd-diagnosis-questions-to-ask`, html: page(p, { body, css: fc, paper: "#e2ecec" }) };
}


/* ================================================================ #87 */
/** One envelope in a pile: body, flap, and either a window or address bars (no words). */
function envPile({ x, y, w = 260, h = 180, rot = 0, body = "#fbfaf6", flap = null, win = false, bars = true, z = 1, seed = 1, stamp = true }) {
  const r = rng(seed);
  const fl = flap ?? body;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 6px 7px rgba(90,40,45,.34))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="5" fill="${body}"/><rect width="${w}" height="${h}" rx="5" fill="#000" opacity=".03"/>
    <path d="M0 0 L${w / 2} ${h * 0.56} L${w} 0 Z" fill="${fl}" stroke="rgba(60,40,40,.22)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M0 ${h} L${w * 0.42} ${h * 0.5} M${w} ${h} L${w * 0.58} ${h * 0.5}" stroke="rgba(60,40,40,.16)" stroke-width="2" fill="none"/>
    ${win ? `<rect x="${w * 0.08}" y="${h * 0.58}" width="${w * 0.46}" height="${h * 0.28}" rx="4" fill="#f4f7f6" stroke="rgba(60,40,40,.25)" stroke-width="2"/><rect x="${w * 0.12}" y="${h * 0.65}" width="${w * 0.3}" height="5" rx="2.5" fill="#9aa4a7"/><rect x="${w * 0.12}" y="${h * 0.75}" width="${w * 0.22}" height="5" rx="2.5" fill="#b5bdbf"/>` : bars ? `<rect x="${w * 0.1}" y="${h * 0.66}" width="${w * (0.3 + r() * 0.14)}" height="5" rx="2.5" fill="rgba(60,50,55,.35)"/><rect x="${w * 0.1}" y="${h * 0.77}" width="${w * (0.2 + r() * 0.12)}" height="5" rx="2.5" fill="rgba(60,50,55,.28)"/>` : ""}
    ${stamp ? `<rect x="${w * 0.8}" y="${h * 0.62}" width="${w * 0.11}" height="${h * 0.2}" rx="2" fill="none" stroke="rgba(60,50,55,.35)" stroke-width="2.5"/>` : ""}
  </svg>`;
}

function p87() {
  const n = 87;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f6e9e5", size: 76 });
  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(120% 80% at 50% 25%,#f2d9d5,#e7c3bf 65%,#dcb2ae)")}"></div>`;

  const BODIES = [["#fbfaf6", null], ["#f3ead6", null], ["#c9a574", "#d3b283"], ["#dbe6e9", null], ["#e2ebd9", null], ["#fbfaf6", null], ["#efd0cc", null], ["#f3ead6", null]];
  const rg = rng(17);
  const list = [];
  for (let k = 0; k < 44; k++) {
    const col = k % 9, row = Math.floor(k / 9);
    const w = 250 + rg() * 90, h = w * (0.66 + rg() * 0.06);
    list.push({
      x: -80 + col * 128 + (row % 2) * 50 + (rg() - 0.5) * 70,
      y: 340 + row * 96 + (rg() - 0.5) * 50,
      w, h, rot: (rg() - 0.5) * 56, ...(() => { const [b, f] = BODIES[Math.floor(rg() * BODIES.length)]; return { body: b, flap: f }; })(),
      win: rg() > 0.72, seed: k + 3,
    });
  }
  list.sort((a, b) => a.y - b.y);
  const pile = list.map((e, k) => envPile({ ...e, z: 2 + k })).join("");
  // an appointment card caught in the pile
  const appt = apptCard({ x: 650, y: 590, w: 260, h: 150, rot: 14, z: 60 }).replace("scale", "");

  const em = (t) => `<span style="color:${C.mulberry};font-weight:600;background:linear-gradient(transparent 82%,rgba(134,88,106,.22) 82% 94%,transparent 94%)">${t}</span>`;
  const first = esc(i.items[0]).replace("explain", em("explain"));
  const second = esc(i.sub).replace("building around", em("building around"));
  const card = `
  <div style="${abs(54, 796, 892, 464, "transform:rotate(-1.2deg);background:linear-gradient(#fffaf1,#fbf3e6);border-radius:8px;box-shadow:0 2px 3px rgba(80,30,40,.28),0 30px 40px rgba(90,35,45,.42);z-index:100")}">
    <div class="serif" style="position:absolute;left:44px;top:6px;font:500 150px/1 'Newsreader',serif;color:${C.mulberry};opacity:.9">\u201C</div>
    <div class="serif" data-check="quote" style="position:absolute;left:54px;right:52px;top:100px;font:500 54px/1.2 'Newsreader',serif;color:${G.ink};letter-spacing:-.005em">${first}. ${second}</div>
  </div>`;
  const pc = penChain({ px: 410, py: 1312, rot: -2, len: 330, ax: 930, ay: 1318, sag: 16, z: 110, color: G.tealDeep });

  const body = `${ground}${pile}${appt}${card}${pc}${fh}`;
  return { n, id: `${n}-adhd-diagnosed-still-behind`, html: page(p, { body, css: fc, paper: "#f6e9e5" }) };
}

/* ================================================================ #89 */
function p89() {
  const n = 89;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#efe8e4", size: 66 });
  const parts = i.items[0].split(/, (?:the |and )?/); // year / clinician or clinic / what was assessed / what happened
  const lines = ["the year", "the clinician or clinic", "what was assessed", "what happened"];
  const ok = lines.every((l) => i.items[0].includes(l));
  if (!ok) throw new Error("#89 lines must be cuts of the item");
  void parts;

  const floor = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 50% 40%,#b5c8c5,#9db4b1 65%,#8aa3a0)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(50,85,85,.13) 0 3px,transparent 3px 160px),repeating-linear-gradient(0deg,rgba(50,85,85,.13) 0 3px,transparent 3px 160px);background-position:40px 20px")}"></div>`;

  // The chair seat (soft green plastic) under the lap.
  const chair = `<div style="${abs(190, 760, 640, 700, "border-radius:70px 70px 0 0;background:linear-gradient(#a8c4a3,#8fb08c);box-shadow:inset 0 0 0 6px rgba(255,255,255,.18),0 24px 36px rgba(20,50,50,.4);z-index:2")}"></div>
  <div style="${abs(228, 800, 564, 640, "border-radius:50px 50px 0 0;background:linear-gradient(#b2cdad,#98b894);box-shadow:inset 0 4px 10px rgba(255,255,255,.3);z-index:2")}"></div>
  <div style="${abs(168, 880, 26, 520, "border-radius:13px;background:#5d6c70;z-index:1;box-shadow:6px 8px 10px rgba(20,50,50,.35)")}"></div>
  <div style="${abs(806, 880, 26, 520, "border-radius:13px;background:#5d6c70;z-index:1;box-shadow:6px 8px 10px rgba(20,50,50,.35)")}"></div>`;

  // Legs: shoes at the top, shins, knees, thighs running off the bottom.
  const leg = (cx, rot, sk) => `
    <div style="${abs(cx - 82, 560, 164, 820, `border-radius:80px 80px 20px 20px;background:linear-gradient(${rot > 0 ? 100 : 80}deg,#59686e,#44535a ${50}%,#39464c);box-shadow:0 18px 26px rgba(15,35,40,.45),inset 0 3px 6px rgba(255,255,255,.12);z-index:3`)}"></div>
    <div style="${abs(cx - 68, 420, 136, 230, `border-radius:60px 60px 40px 40px;background:linear-gradient(#52616a,#3d4a51);box-shadow:0 12px 18px rgba(15,35,40,.4);transform:rotate(${rot}deg);transform-origin:50% 100%;z-index:2`)}"></div>
    <div style="${abs(cx - 62 + sk, 396, 124, 110, `border-radius:55px 55px 34px 34px;background:linear-gradient(#fbf4ea,#e3d8c6);box-shadow:0 8px 12px rgba(15,35,40,.4);transform:rotate(${rot}deg);z-index:4`)}"></div>
    <div style="${abs(cx - 40 + sk, 412, 80, 6, `border-radius:3px;background:#cdbfa8;transform:rotate(${rot}deg);z-index:5`)}"></div><div style="${abs(cx - 40 + sk, 432, 80, 6, `border-radius:3px;background:#cdbfa8;transform:rotate(${rot}deg);z-index:5`)}"></div><div style="${abs(cx - 40 + sk, 452, 80, 6, `border-radius:3px;background:#cdbfa8;transform:rotate(${rot}deg);z-index:5`)}"></div>
    <div style="${abs(cx - 62 + sk, 468, 124, 22, `border-radius:0 0 30px 30px;background:#c7b9a1;transform:rotate(${rot}deg);z-index:4`)}"></div>`;
  const legs = leg(398, -3, 0) + leg(602, 3, 0);

  // The page: folded once and opened, four short handwritten lines.
  const PX = 268, PY = 806, PW = 472, PH = 520;
  const rowsHtml = lines.map((l, k) => `<div class="hand" style="height:100px;padding-top:26px;font:600 52px/54px 'Hand',cursive;color:${G.ink};border-bottom:2px solid #dcc8c3;white-space:nowrap">${esc(l)}</div>`).join("");
  const sheet = `
  <div style="${abs(PX, PY, PW, PH, "transform:rotate(-3.5deg);background:linear-gradient(#fff9f5,#f9ece6);border-radius:5px;box-shadow:0 2px 3px rgba(40,25,30,.3),0 24px 34px rgba(30,25,30,.48);z-index:20")}">
    <div style="position:absolute;left:0;right:0;top:50%;height:3px;background:rgba(150,110,110,.2);box-shadow:0 2px 3px rgba(255,255,255,.7)"></div>
    <div style="position:absolute;left:0;right:0;top:33%;height:2px;background:rgba(150,110,110,.12)"></div>
    <div data-check="lines" style="position:absolute;left:40px;right:30px;top:62px">${rowsHtml}</div>
    <div style="position:absolute;left:0;right:0;top:0;height:70px;background:linear-gradient(rgba(255,255,255,.55),rgba(255,255,255,0));border-radius:5px 5px 0 0"></div>
  </div>`;

  // A thumb on the left edge, and the other hand resting on the knee.
  const SK = ["#e8b497", "#d79c7e", "#f2c9b0"];
  const thumb = `<svg style="${abs(0, 0, 1000, 1500, "z-index:25;pointer-events:none;filter:drop-shadow(4px 8px 6px rgba(30,20,20,.35))")}" viewBox="0 0 1000 1500" aria-hidden="true">
    <g transform="translate(256 1196) rotate(-22)"><path d="M-84 -32 C-24 -36 30 -34 60 -22 C86 -12 86 14 60 24 C30 34 -24 36 -84 32 Z" fill="${SK[0]}"/><path d="M-84 14 C-24 22 30 22 60 14 L60 24 C30 34 -24 36 -84 32Z" fill="${SK[1]}" opacity=".5"/><path d="M26 -16 C44 -20 64 -14 66 -2 C68 10 50 16 28 12 C20 8 20 -12 26 -16Z" fill="${SK[2]}"/><path d="M-30 -8 Q-24 -2 -30 4 M-44 -10 Q-38 -2 -44 6" stroke="${SK[1]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></g>
    <g transform="translate(742 1232) rotate(-158)"><path d="M-84 -32 C-24 -36 30 -34 60 -22 C86 -12 86 14 60 24 C30 34 -24 36 -84 32 Z" fill="${SK[0]}"/><path d="M-84 14 C-24 22 30 22 60 14 L60 24 C30 34 -24 36 -84 32Z" fill="${SK[1]}" opacity=".5"/><path d="M26 -16 C44 -20 64 -14 66 -2 C68 10 50 16 28 12 C20 8 20 -12 26 -16Z" fill="${SK[2]}"/><path d="M-30 -8 Q-24 -2 -30 4 M-44 -10 Q-38 -2 -44 6" stroke="${SK[1]}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/></g>
  </svg>`;

  // The tote bag on the floor beside the chair.
  const tote = `<svg style="${abs(748, 520, 232, 330, "z-index:5;filter:drop-shadow(10px 16px 12px rgba(20,45,45,.45))")}" viewBox="0 0 232 330" aria-hidden="true">
    <path d="M62 70 C62 -10 170 -10 170 70" fill="none" stroke="#c9b48e" stroke-width="16" stroke-linecap="round"/>
    <rect x="14" y="62" width="204" height="250" rx="12" fill="#f0e6d1"/><rect x="14" y="62" width="204" height="250" rx="12" fill="url(#tg)"/>
    <defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>
    <rect x="14" y="140" width="204" height="30" fill="${C.mulberry}" opacity=".85"/><rect x="14" y="62" width="204" height="22" fill="#e1d4b8"/>
  </svg>`;

  const pl = plant({ x: 90, y: 470, r: 100, seed: 51, z: 6 });
  const note = `<div data-check="sub" style="${abs(748, 1000, 220, 134, "background:linear-gradient(172deg,#f6d2d0,#eebcbc);box-shadow:0 1px 2px rgba(0,0,0,.3),0 12px 16px rgba(30,40,40,.36);transform:rotate(3deg);z-index:12;padding:18px 20px;overflow:visible")}"><div class="hand" style="font:600 42px/1.05 'Hand',cursive;color:${G.ink}">${esc(i.sub)}</div></div>`;

  const body = `${floor}${chair}${pl}${tote}${legs}${sheet}${thumb}${note}${fh}`;
  return { n, id: `${n}-write-your-adhd-history-once`, html: page(p, { body, css: fc, paper: "#efe8e4" }) };
}

export const pins = [p81(), p83(), p85(), p87(), p89()];
