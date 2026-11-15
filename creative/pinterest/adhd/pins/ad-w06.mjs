/**
 * ADHD Life Companion guide pins, world w06: sticky notes and monitor edge.
 * Butter notes, graphite bezels, a little teal, a desk lamp, a pen pot, page flags.
 * #34 myth-vs-truth      a crossed-out grey note on an angled monitor, one ringed card, an open folder
 * #36 before-after       three cards stepping down on a monitor face, a letter and a phone on the desk
 * #54 template-preview   a worksheet card (three columns, three rows) under a monitor edge hung with notes
 * #56 quote-card         an evening desk: lamp, wall clock near eleven, a folder with one butter note
 * #58 how-to-steps       a pad with seven numbered strips, step five on a butter note, a monitor column
 * #60 before-after       nine crammed rows to a clean two-line card on a monitor
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

const G = { ink: "#232a2f", graphite: "#2b3033", graphiteLight: "#454d52", teal: "#2f8a86", tealDeep: "#1f5e5b", tealSoft: "#d3e6e3", butterA: "#f6e08f", butterB: "#efcc66" };

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** Header block (eyebrow, headline, optional sub) and footer band, as the finished pins have. */
function frame(i, { paper, size = 76, sub = null, textTop = 62, split = ": ", extraCss = "" }) {
  let eyebrow = null, head = i.headline;
  const at = i.headline.indexOf(split);
  if (at > 0) { eyebrow = i.headline.slice(0, at + (split === "? " ? 1 : 0)); head = i.headline.slice(at + split.length); }
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(20,30,30,.3);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(20,30,30,.3);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#41484b;max-width:830px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d4549}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head).replace("To-Do", '<span style="white-space:nowrap">To-Do</span>')}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

/** A hand-drawn loop (an ellipse that overshoots its start), as an svg that sits over a box of w x h. */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, halo = null, grow = 0, sq = 2 } = {}) {
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
  return `<svg style="position:absolute;left:${-grow}px;top:${-grow}px;overflow:visible;pointer-events:none" width="${w + grow * 2}" height="${h + grow * 2}" viewBox="${-grow} ${-grow} ${w + grow * 2} ${h + grow * 2}" aria-hidden="true">${halo ? `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${sw + 8}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Wavy scribbles that read as writing without being words. */
function scribbles(w, h, r, { rows = 4, color = "#4d5a60", op = 0.45, x0 = 0.12, y0 = 0.2, span = 0.62 } = {}) {
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (y0 + (k / rows) * span) + r() * 5;
    const len = w * (0.3 + r() * 0.5);
    let x = w * x0;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} `;
    while (x < w * x0 + len) {
      const dx = 7 + r() * 8;
      const up = r() > 0.5 ? -1 : 1;
      d += `q${(dx / 2).toFixed(1)} ${(up * (4 + r() * 5)).toFixed(1)} ${dx.toFixed(1)} ${((r() - 0.5) * 3).toFixed(1)} `;
      x += dx;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const BUTTERS = [["#f6e08f", "#efcc66"], ["#f8e8a6", "#f0d37a"], ["#f2d37c", "#e7bd55"], ["#f4dca0", "#ebc872"]];
const GREYS = [["#d8dbdd", "#c6cacd"], ["#cfd3d5", "#bec3c6"]];

/** A sticky note. `inner` is html placed in it; `scrib` draws unreadable scribbles instead of words. */
function note({ x, y, w, h = w, rot = 0, tone = BUTTERS[0], inner = "", scrib = null, z = 1, extra = "", check = "" }) {
  const sv = scrib ? `<svg style="position:absolute;inset:0" viewBox="0 0 ${w} ${h}" aria-hidden="true">${scribbles(w, h, rng(scrib.seed), scrib)}</svg>` : "";
  return `<div ${check ? `data-check="${check}"` : ""} style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${tone[0]},${tone[1]});box-shadow:0 1px 2px rgba(0,0,0,.35),0 10px 14px rgba(20,25,25,.34);z-index:${z};${extra}`)}"><div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div>${sv}${inner}</div>`;
}

const tape = (x, y, w = 150, rot = 0, c = "rgba(214,224,228,.85)") => `<div style="${abs(x, y, w, 40, `transform:rotate(${rot}deg);background:${c};box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:12`)}"></div>`;

/** A page flag with a notched end. */
function flag({ x, y, w = 150, h = 46, rot = 0, color = G.teal, z = 8 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${color};clip-path:polygon(0 0,100% 0,88% 50%,100% 100%,0 100%);box-shadow:0 4px 6px rgba(0,0,0,.3);z-index:${z}`)}"></div>`;
}

/** A pen pot with pens, seen from the side. */
function penPot({ x, y, s = 1 }) {
  const w = 160 * s, h = 230 * s;
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(8px 14px 10px rgba(10,20,20,.45));z-index:9")}" viewBox="0 0 160 230" aria-hidden="true">
    <g transform="rotate(-12 60 110)"><rect x="52" y="10" width="14" height="130" rx="3" fill="#f2c94c"/><path d="M52 10 L59 -12 L66 10Z" fill="#e8d3a2"/><path d="M56 -2 L59 -12 L62 -2Z" fill="#232a2f"/></g>
    <g transform="rotate(8 90 110)"><rect x="84" y="2" width="14" height="140" rx="7" fill="${G.teal}"/><rect x="86" y="2" width="4" height="140" fill="#fff" opacity=".25"/></g>
    <g transform="rotate(22 112 110)"><rect x="106" y="22" width="13" height="120" rx="6" fill="#3c4348"/><rect x="106" y="22" width="13" height="26" rx="5" fill="#d9dcde"/></g>
    <rect x="22" y="96" width="116" height="126" rx="10" fill="#3a4146"/><rect x="22" y="96" width="116" height="126" rx="10" fill="url(#pp)"/>
    <defs><linearGradient id="pp" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient></defs>
    <rect x="22" y="150" width="116" height="16" fill="${G.teal}"/>
    <ellipse cx="80" cy="97" rx="58" ry="9" fill="#14181a"/></svg>`;
}

/** A pen lying flat. */
function pen({ x, y, len = 360, rot = 0, color = "#2f3a4a" }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(10,20,25,.4));z-index:9`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${color}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".2"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="#c9ccd2"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="#c9ccd2"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#22252b"/></svg>`;
}

/** The mulberry tick used for the chosen thing. */
const exTag = (x, y, rot = 0) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:20;transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

const tickDisc = (x, y, s = 88, z = 6) => `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 4px 5px rgba(0,0,0,.3))`)}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ================================================================ #34 */
function p34() {
  const n = 34;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e6edec", sub: i.sub });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 70% at 70% 30%,#e9f1ef,#d0dedb 60%,#bccfcb)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(0deg,rgba(40,80,80,.045) 0 2px,transparent 2px 7px)")}"></div>`;

  // The monitor, seen from the right so its left edge recedes. The notes ride in its perspective.
  const sc = rng(5);
  const monitor = `
  <div style="${abs(-4, 400, 560, 640, "transform-origin:0 50%;transform:perspective(1800px) rotateY(11deg) rotate(-1.2deg);filter:drop-shadow(26px 30px 24px rgba(15,35,35,.5));z-index:3")}">
    <div style="position:absolute;inset:0;border-radius:26px;background:linear-gradient(150deg,#3b4448,#171b1e)"></div>
    <div style="position:absolute;left:26px;top:26px;right:26px;bottom:26px;border-radius:12px;background:linear-gradient(160deg,#2d5b5d,#1c3a3d 55%,#16282b);box-shadow:inset 0 0 0 3px #0f1315,inset 0 0 60px rgba(120,210,200,.2);overflow:hidden">
      <div style="position:absolute;left:-30%;top:-40%;width:80%;height:220%;transform:rotate(18deg);background:linear-gradient(90deg,rgba(255,255,255,.07),rgba(255,255,255,0) 60%)"></div>
      ${note({ x: 340, y: -26, w: 130, rot: 9, tone: GREYS[1], scrib: { seed: 2, rows: 3 } })}
      ${note({ x: 24, y: 400, w: 180, rot: 6, tone: GREYS[0], scrib: { seed: 8, rows: 4 } })}
      ${note({ x: 250, y: 420, w: 210, h: 170, rot: -4, tone: GREYS[1], scrib: { seed: 12, rows: 4 } })}
      ${note({ x: 30, y: 70, w: 440, h: 320, rot: -3.5, tone: ["#d5d8da", "#c0c5c8"], z: 4, check: "myth", inner: `
        <div class="hand" style="position:absolute;left:34px;right:34px;top:92px;font:600 88px/1.02 'Hand',cursive;color:#4c5358;text-align:center">Snap out of it</div>
        <svg style="position:absolute;inset:0;overflow:visible" viewBox="0 0 440 320" aria-hidden="true"><path d="M24 120 L420 168" stroke="${G.ink}" stroke-width="12" stroke-linecap="round" opacity=".88"/><path d="M40 218 L398 178" stroke="${G.ink}" stroke-width="9" stroke-linecap="round" opacity=".6"/></svg>` })}
    </div>
  </div>
  ${tape(190, 440, 160, -3)}`;

  const caption = `<div class="hand" style="${abs(46, 1072, 470, 70, "font:600 46px/1.05 'Hand',cursive;color:#2c3438;z-index:6")}" data-check="items">${esc(i.items[0])}</div>`;

  // The chosen card, ringed once in mulberry.
  const CX = 548, CY = 528, CW = 392, CH = 460;
  const card = `
  <div style="${abs(CX, CY, CW, CH, "transform:rotate(2deg);background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.28),0 26px 34px rgba(20,45,45,.4);background-image:repeating-linear-gradient(transparent 0 57px,#cfe0dd 57px 58px);background-position:0 60px;z-index:5")}">
    <div style="position:absolute;left:0;right:0;top:0;height:60px;border-bottom:3px solid #e6a9b8;"></div>
    <div class="hand" style="position:absolute;left:34px;right:28px;top:84px;height:300px;font:600 66px/64px 'Hand',cursive;color:${G.ink}" data-check="truth">${esc(i.items[1])}</div>
    <div style="position:absolute;left:0;top:0;width:${CW}px;height:${CH}px">${ring(CW + 52, CH + 52, { sw: 8, seed: 6, halo: "#fffaf0", grow: 0, sq: 3.4 }).replace("left:0px;top:0px", "left:-26px;top:-26px")}</div>
  </div>`;

  // An open manila folder across the bottom edge, one tick, a few flags.
  const folder = `
  <div style="${abs(40, 1196, 920, 330, "background:linear-gradient(#e7cf96,#d9bd7c);border-radius:14px;box-shadow:0 -4px 14px rgba(40,30,10,.25),0 20px 30px rgba(20,35,35,.35);z-index:6")}"></div>
  <div style="${abs(70, 1162, 250, 52, "background:linear-gradient(#e7cf96,#dfc383);border-radius:12px 12px 0 0;z-index:6")}"></div>
  <div style="${abs(40, 1236, 920, 200, "background:linear-gradient(#f2e3b8,#e9d29c);border-radius:6px;z-index:6;box-shadow:0 -2px 6px rgba(60,40,10,.2)")}"></div>
  ${flag({ x: 700, y: 1150, w: 130, h: 48, rot: -4, color: G.teal, z: 5 })}${flag({ x: 790, y: 1160, w: 130, h: 48, rot: 3, color: "#f0c850", z: 5 })}
  <div class="hand" style="${abs(96, 1258, 640, 80, "font:600 58px/1.05 'Hand',cursive;color:#3a2c14;z-index:7")}" data-check="folder">${esc(i.items[2])}</div>
  ${tickDisc(812, 1252, 92, 8)}`;

  const body = `${desk}${monitor}${caption}${card}${folder}${fh}`;
  return { n, id: `${n}-task-paralysis-you-shrink-the-task`, html: page(p, { body, css: fc, paper: "#e6edec" }) };
}

/* ================================================================ #36 */
function phoneProp({ x, y, w = 200, h = 380, rot = 0 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:6;filter:drop-shadow(14px 22px 16px rgba(30,30,20,.45))`)}">
    <div style="position:absolute;inset:0;border-radius:36px;background:linear-gradient(150deg,#4a5358,#1d2225)"></div>
    <div style="position:absolute;left:10px;top:10px;right:10px;bottom:10px;border-radius:28px;background:linear-gradient(160deg,#2c6b6a,#17393b);display:grid;place-items:center">${icon("phone", { size: 96, color: "#d3ece8", weight: "fill" })}</div>
    <div style="position:absolute;left:50%;top:20px;width:56px;height:14px;margin-left:-28px;border-radius:8px;background:#0e1214"></div></div>`;
}

function p36() {
  const n = 36;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3efe3", sub: i.sub });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 70% at 30% 90%,#ece7d9,#ddd6c4 65%,#cfc7b2)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(80,70,40,.04) 0 2px,transparent 2px 9px)")}"></div>`;

  // The monitor face, its chin sloping down to the right.
  const mon = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px;filter:drop-shadow(0 22px 22px rgba(40,35,20,.45));z-index:2" width="1000" height="640" viewBox="0 0 1000 640" aria-hidden="true">
    <defs><linearGradient id="scr36" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a5d5e"/><stop offset=".6" stop-color="#1c3b3e"/><stop offset="1" stop-color="#15292c"/></linearGradient></defs>
    <polygon points="0,0 1000,0 1000,614 0,540" fill="#22282b"/>
    <polygon points="0,0 1000,0 1000,614 0,540" fill="none" stroke="#3d464b" stroke-width="3"/>
    <polygon points="26,0 974,0 974,566 26,500" fill="url(#scr36)"/>
    <polygon points="26,0 974,0 974,566 26,500" fill="none" stroke="#0f1315" stroke-width="3"/>
    <circle cx="936" cy="590" r="6" fill="${G.teal}"/>
  </svg>`;

  // Three cards stepping down: the wall, a smaller step, the one small note.
  const card1 = `<div data-check="c1" style="${abs(44, 452, 360, 410, "transform:rotate(-1.4deg);background:linear-gradient(#cfd2d4,#bdc2c5);box-shadow:0 2px 3px rgba(0,0,0,.35),0 22px 28px rgba(0,0,0,.45);z-index:6")}">
    <div class="hand" style="position:absolute;left:30px;right:26px;top:30px;font:600 64px/1 'Hand',cursive;color:#464e53">${esc(i.items[0])}</div>
    <svg style="position:absolute;left:0;top:0" width="360" height="410" viewBox="0 0 360 410" aria-hidden="true">${scribbles(360, 410, rng(21), { rows: 7, x0: 0.08, y0: 0.6, span: 0.36, color: "#5a6368", op: 0.4 })}</svg></div>`;
  const card2 = `<div data-check="c2" style="${abs(474, 534, 216, 328, "transform:rotate(1.2deg);background:linear-gradient(#e6e8e8,#d6d9da);box-shadow:0 2px 3px rgba(0,0,0,.35),0 18px 24px rgba(0,0,0,.45);z-index:6")}">
    <div class="hand" style="position:absolute;left:22px;right:18px;top:26px;font:600 56px/1 'Hand',cursive;color:#3c4448">${esc(i.items[1])}</div></div>`;
  const noteTxt = `<div class="hand" style="position:absolute;left:28px;right:22px;top:36px;font:600 33px/1.06 'Hand',cursive;color:${G.ink}">${esc(i.items[2])}</div>`;
  const card3 = note({ x: 740, y: 598, w: 236, h: 264, rot: -2.5, tone: BUTTERS[0], z: 7, inner: noteTxt + `<div style="position:absolute;left:0;top:0;width:236px;height:264px">${ring(260, 290, { sw: 6, seed: 9, sq: 3 }).replace("left:0px;top:0px", "left:-12px;top:-14px")}</div>` });

  const step = (x, y) => `<div style="${abs(x, y, 50, 50, `border-radius:50%;background:#f3efe3;display:grid;place-items:center;z-index:9;box-shadow:0 3px 6px rgba(0,0,0,.4)`)}">${icon("caret-right", { size: 34, color: G.tealDeep, weight: "bold" })}</div>`;
  const arrows = step(412, 610) + step(692, 640);

  const exTagS = exTag(52, 398);

  // Desk: a letter half out of an envelope, a phone, a flag and a pen pot.
  const letter = `
  <div style="${abs(86, 1066, 372, 236, "transform:rotate(-5deg);background:linear-gradient(#f4f1ea,#e5e0d3);border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 16px 22px rgba(40,35,20,.4);z-index:5")}"></div>
  <div style="${abs(120, 1002, 300, 300, "transform:rotate(-7deg);background:#fffdf9;box-shadow:0 2px 3px rgba(0,0,0,.28),0 10px 16px rgba(40,35,20,.3);z-index:6")}">
    <div style="position:absolute;left:28px;top:28px;width:90px;height:16px;background:${G.teal};border-radius:3px"></div>
    <svg style="position:absolute;left:0;top:50px" width="300" height="220" viewBox="0 0 300 220" aria-hidden="true">${scribbles(300, 220, rng(31), { rows: 6, x0: 0.09, y0: 0.08, span: 0.8, color: "#3d4a52", op: 0.42 })}</svg></div>
  <div style="${abs(80, 1150, 400, 170, "transform:rotate(-5deg);background:linear-gradient(#f4f1ea,#e8e3d6);border-radius:4px 4px 8px 8px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%,0 50%);z-index:7;box-shadow:0 8px 14px rgba(40,35,20,.3)")}"></div>`;
  const ph = phoneProp({ x: 590, y: 1000, w: 190, h: 340, rot: 8 });
  const flags = flag({ x: 500, y: 1262, w: 120, h: 44, rot: -4, color: G.teal, z: 10 });
  const pot = penPot({ x: 820, y: 1070, s: 1 });

  const body = `${desk}${mon}${card1}${card2}${card3}${arrows}${exTagS}${letter}${ph}${flags}${pot}${fh}`;
  return { n, id: `${n}-break-down-a-task-insurance-claim`, html: page(p, { body, css: fc, paper: "#f3efe3" }) };
}

/* ================================================================ #54 */
function p54() {
  const n = 54;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#edf1ef", split: "? ", size: 84 });
  const rows = i.items.map((s) => s.split(" | "));

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 50% 40%,#dbe6e3,#c3d4d0 70%,#b4c8c3)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 2px,transparent 2px 7px)")}"></div>`;

  // A monitor's lower edge along the top of the scene, hung with notes and flags.
  const mon = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px;filter:drop-shadow(0 16px 16px rgba(10,35,35,.45));z-index:2" width="1000" height="130" viewBox="0 0 1000 130" aria-hidden="true">
    <polygon points="-10,0 1010,0 1010,66 -10,106" fill="#22282b"/><polygon points="-10,98 1010,58 1010,66 -10,106" fill="#3a4348"/>
    <polygon points="-10,0 1010,0 1010,40 -10,76" fill="#1b3a3d"/><circle cx="930" cy="62" r="5" fill="${G.teal}"/></svg>`;
  const hung = [
    note({ x: 70, y: 410, w: 112, rot: -5, tone: BUTTERS[0], scrib: { seed: 41, rows: 3 }, z: 3 }),
    note({ x: 200, y: 400, w: 100, rot: 4, tone: BUTTERS[2], scrib: { seed: 42, rows: 3 }, z: 3 }),
    note({ x: 316, y: 414, w: 108, rot: -2, tone: BUTTERS[1], scrib: { seed: 43, rows: 3 }, z: 3 }),
    flag({ x: 470, y: 432, w: 130, h: 44, rot: 3, color: G.teal, z: 3 }), flag({ x: 560, y: 440, w: 120, h: 44, rot: -3, color: "#f0c850", z: 3 }),
    note({ x: 740, y: 404, w: 110, rot: 5, tone: BUTTERS[3], scrib: { seed: 44, rows: 3 }, z: 3 }),
  ].join("");

  // The worksheet card: three columns, three rows, the guide's own illustrations.
  const colW = [262, 312, 282];
  const hdr = ["The thought", "Next physical action", "What needs to be in front of me"];
  const cell = (t, color, bl) => `<div style="padding:16px 18px 0 20px;${bl ? "border-left:2px solid #c9d8d5;" : ""}font:600 40px/42px 'Hand',cursive;color:${color}">${esc(t)}</div>`;
  const sheet = `
  <div style="${abs(40, 466, 920, 744, "transform:rotate(-1.1deg);background:#fffefb;border-radius:6px;box-shadow:0 2px 3px rgba(20,40,40,.3),0 26px 34px rgba(10,35,35,.42);z-index:6")}">
    <div class="hand" style="position:absolute;left:34px;right:200px;top:20px;font:600 40px/40px 'Hand',cursive;color:${G.ink}">${esc(i.sub[0].toUpperCase() + i.sub.slice(1))}</div>
    <div class="example" style="position:absolute;right:30px;top:30px">Example</div>
    <div style="position:absolute;left:30px;right:30px;top:118px;border:2px solid #b8cdc9;border-radius:6px;overflow:hidden" data-check="grid">
      <div style="display:grid;grid-template-columns:${colW.map((w) => w + "px").join(" ")};background:${G.tealSoft}">
        ${hdr.map((h, k) => `<div style="padding:12px 18px;font:600 24px/28px Plex,sans-serif;color:${G.tealDeep};min-height:84px;${k ? "border-left:2px solid #b8cdc9" : ""}">${esc(h)}</div>`).join("")}
      </div>
      ${rows.map((r) => `<div style="display:grid;grid-template-columns:${colW.map((w) => w + "px").join(" ")};border-top:2px solid #b8cdc9;height:176px;overflow:hidden">${cell(r[0], G.ink, false)}${cell(r[1], C.mulberry, true)}${cell(r[2], G.ink, true)}</div>`).join("")}
    </div>
  </div>`;

  const bottom = `${pen({ x: 60, y: 1268, len: 380, rot: -3, color: "#2f3a4a" })}${flag({ x: 480, y: 1262, w: 120, h: 44, rot: 3, color: G.teal, z: 8 })}${flag({ x: 560, y: 1286, w: 120, h: 44, rot: -4, color: "#f0c850", z: 8 })}${penPot({ x: 830, y: 1208, s: 0.66 })}`;

  const body = `${desk}${mon}${hung}${sheet}${bottom}${fh}`;
  return { n, id: `${n}-keep-thinking-about-a-task`, html: page(p, { body, css: fc, paper: "#edf1ef" }) };
}

/* ================================================================ #56 */
function lamp({ x, y }) {
  return `<svg style="${abs(x, y, 300, 420, "z-index:4;filter:drop-shadow(10px 14px 10px rgba(0,0,0,.45))")}" viewBox="0 0 300 420" aria-hidden="true">
    <ellipse cx="70" cy="398" rx="64" ry="16" fill="#14181a"/><ellipse cx="70" cy="390" rx="54" ry="12" fill="#3c4348"/>
    <path d="M70 388 L150 204" stroke="#2b3033" stroke-width="13" stroke-linecap="round"/><path d="M68 386 L148 202" stroke="#6a747a" stroke-width="3" stroke-linecap="round"/>
    <path d="M150 204 L226 116" stroke="#2b3033" stroke-width="13" stroke-linecap="round"/><path d="M148 202 L224 114" stroke="#6a747a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="150" cy="204" r="15" fill="${G.teal}"/><circle cx="150" cy="204" r="6" fill="#14181a"/>
    <g transform="translate(228 116) rotate(32)">
      <path d="M-30 -26 L30 -26 L56 42 L-56 42 Z" fill="${G.teal}"/><path d="M-30 -26 L-8 -26 L-26 42 L-56 42 Z" fill="#fff" opacity=".18"/>
      <ellipse cx="0" cy="42" rx="56" ry="11" fill="#fff0bd"/><ellipse cx="0" cy="44" rx="34" ry="6" fill="#ffd978"/>
      <rect x="-9" y="-36" width="18" height="12" rx="3" fill="#14181a"/></g></svg>`;
}

function clock({ x, y, s = 210 }) {
  let ticks = "";
  for (let k = 0; k < 12; k++) ticks += `<line x1="100" y1="${k % 3 ? 20 : 16}" x2="100" y2="${k % 3 ? 28 : 34}" stroke="#2b3033" stroke-width="${k % 3 ? 4 : 7}" stroke-linecap="round" transform="rotate(${k * 30} 100 100)"/>`;
  return `<svg style="${abs(x, y, s, s, "z-index:4;filter:drop-shadow(8px 14px 12px rgba(0,0,0,.5))")}" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="97" fill="#14181a"/><circle cx="100" cy="100" r="88" fill="#f6f0e2"/><circle cx="100" cy="100" r="88" fill="none" stroke="#c8bfa8" stroke-width="2"/>${ticks}
    <line x1="100" y1="100" x2="100" y2="56" stroke="#2b3033" stroke-width="9" stroke-linecap="round" transform="rotate(327.5 100 100)"/>
    <line x1="100" y1="100" x2="100" y2="34" stroke="#2b3033" stroke-width="5" stroke-linecap="round" transform="rotate(330 100 100)"/>
    <circle cx="100" cy="100" r="8" fill="${G.teal}"/></svg>`;
}

function p56() {
  const n = 56;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ece6d8", split: "? ", size: 76 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(#1b2327,#27323a 48%,#222c32)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(60% 40% at 86% 28%,rgba(255,208,120,.5),rgba(255,208,120,0) 70%)")}"></div>`;
  const deskTop = `<div style="${abs(0, 770, 1000, 700, "background:linear-gradient(#53473c,#35302c 30%,#2a2724);box-shadow:0 -3px 0 #75665a,0 -14px 24px rgba(0,0,0,.35);z-index:2")}"></div>
  <div style="${abs(0, 770, 1000, 700, "background:radial-gradient(50% 45% at 55% 38%,rgba(255,205,120,.32),rgba(255,205,120,0) 70%);z-index:3")}"></div>`;

  const clk = clock({ x: 64, y: 430, s: 220 });
  const sub = `<div style="${abs(330, 452, 380, 170, "z-index:5")}" data-check="sub"><div class="serif" style="font:italic 400 36px/1.22 'Newsreader',serif;color:#efe6cf">${esc(i.sub)}</div></div>`;
  const lmp = lamp({ x: 700, y: 392 });
  const pot = penPot({ x: 20, y: 590, s: 0.82 });

  // A teal folder lying toward us, one butter note stuck on its front.
  const folder = `
  <div style="${abs(66, 802, 270, 70, "background:linear-gradient(#3a9792,#2c807c);border-radius:14px 14px 0 0;z-index:5")}"></div>
  <div style="${abs(66, 840, 868, 560, "background:linear-gradient(160deg,#3d9a95,#2a7773 60%,#245f5d);border-radius:6px 16px 0 0;box-shadow:0 -2px 0 rgba(255,255,255,.18),0 24px 34px rgba(0,0,0,.5);z-index:5")}"></div>
  <div style="${abs(66, 840, 868, 560, "background:radial-gradient(60% 60% at 60% 20%,rgba(255,225,150,.28),rgba(255,225,150,0));border-radius:6px 16px 0 0;z-index:5")}"></div>`;
  const NW = 600, NH = 420;
  const ringed = `<span style="position:relative;display:inline-block;margin-right:26px">Tonight,${ring(250, 104, { sw: 7, seed: 5, halo: "#fff6d4" }).replace("left:0px;top:0px", "left:-22px;top:-18px")}</span>`;
  const sticky = note({
    x: 190, y: 872, w: 620, h: 440, rot: -2, tone: BUTTERS[0], z: 8, check: "quote",
    inner: `<div class="hand" style="position:absolute;left:38px;right:34px;top:40px;font:600 72px/72px 'Hand',cursive;color:${G.ink}">${ringed}${esc(i.items[0].replace(/^Tonight,/, ""))}</div>`,
    extra: "box-shadow:0 2px 3px rgba(0,0,0,.4),0 22px 30px rgba(0,0,0,.55)",
  });

  const body = `${wall}${deskTop}${clk}${sub}${lmp}${pot}${folder}${sticky}${fh}`;
  return { n, id: `${n}-task-on-your-mind-at-night`, html: page(p, { body, css: fc, paper: "#ece6d8" }) };
}

/* ================================================================ #58 */
function p58() {
  const n = 58;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1ecd8", size: 78 });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(100% 70% at 30% 20%,#4a575c,#333d41 60%,#272f32)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 2px,transparent 2px 8px)")}"></div>`;

  // A monitor's right edge with a column of notes and flags.
  const mon = `
  <div style="${abs(850, 372, 240, 760, "transform:rotate(2.5deg);transform-origin:0 0;z-index:2;filter:drop-shadow(-10px 16px 18px rgba(0,0,0,.5))")}">
    <div style="position:absolute;inset:0;border-radius:0 0 0 26px;background:linear-gradient(120deg,#4a5359,#1a1e21)"></div>
    <div style="position:absolute;left:34px;top:0;right:-10px;bottom:34px;border-radius:0 0 0 12px;background:linear-gradient(160deg,#2a5758,#183436);box-shadow:inset 0 0 0 3px #0e1214;overflow:hidden">
      ${note({ x: 20, y: 40, w: 118, rot: -4, tone: BUTTERS[0], scrib: { seed: 61, rows: 3 } })}
      ${note({ x: 14, y: 176, w: 118, rot: 3, tone: BUTTERS[2], scrib: { seed: 62, rows: 3 } })}
      ${note({ x: 24, y: 312, w: 118, rot: -2, tone: BUTTERS[1], scrib: { seed: 63, rows: 3 } })}
      ${note({ x: 16, y: 448, w: 118, rot: 5, tone: BUTTERS[3], scrib: { seed: 64, rows: 3 } })}
    </div></div>
  ${flag({ x: 806, y: 470, w: 112, h: 42, rot: 4, color: G.teal, z: 6 })}${flag({ x: 812, y: 740, w: 112, h: 42, rot: -3, color: "#f0c850", z: 6 })}`;

  // The pad: a graph page under a teal binding, seven numbered strips; a second page peeks out beneath.
  const PX = 36, PY = 410, PW = 796, PH = 896;
  const strip = (k, text) => {
    const num = `<div style="flex:none;width:54px;height:54px;border-radius:50%;background:${G.teal};color:#fff;font:600 30px/54px Plex,sans-serif;text-align:center">${k}</div>`;
    return `<div style="display:flex;align-items:center;gap:20px;padding:9px 22px 9px 18px;border-radius:8px;background:${k % 2 ? "#eef5f3" : "#f8fbfa"}">${num}<div class="hand" style="font:600 41px/42px 'Hand',cursive;color:${G.ink}">${esc(text)}</div></div>`;
  };
  const stripFive = `<div style="position:relative;height:120px;margin-top:6px"><div style="position:absolute;left:-22px;top:-8px;width:780px;height:124px;z-index:7;transform:rotate(-1.4deg);background:linear-gradient(172deg,${BUTTERS[0][0]},${BUTTERS[0][1]});box-shadow:0 1px 2px rgba(0,0,0,.4),0 14px 20px rgba(0,0,0,.45);display:flex;align-items:center;gap:20px;padding-left:38px">
    <div style="flex:none;width:54px;height:54px;border-radius:50%;background:${G.teal};color:#fff;font:600 30px/54px Plex,sans-serif;text-align:center">5</div>
    <div class="hand" style="position:relative;font:700 64px/1 'Hand',cursive;color:${G.ink}">${esc(i.items[4])}${ring(484, 106, { sw: 7, seed: 4, halo: "#fff3c6", sq: 3 }).replace("left:0px;top:0px", "left:-24px;top:-22px")}</div></div></div>`;
  const strips = i.items.map((t, k) => (k === 4 ? stripFive : strip(k + 1, t))).join("");
  const pad = `
  <div style="${abs(PX + 34, PY + 26, PW, PH, "transform:rotate(2deg);background:#f2efe4;border-radius:10px;box-shadow:0 18px 24px rgba(0,0,0,.4);z-index:3")}"></div>
  <div style="${abs(PX + 20, PY + 14, PW, PH, "transform:rotate(1deg);background:#f6f3ea;border-radius:10px;box-shadow:0 12px 18px rgba(0,0,0,.35);z-index:3")}"></div>
  <div style="${abs(PX, PY, PW, PH, "transform:rotate(-0.8deg);background:#fcfbf5;border-radius:10px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 28px 40px rgba(0,0,0,.5);z-index:4;background-image:linear-gradient(rgba(47,138,134,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(47,138,134,.09) 1px,transparent 1px);background-size:34px 34px")}">
    <div style="position:absolute;left:0;right:0;top:0;height:50px;border-radius:10px 10px 0 0;background:linear-gradient(${G.teal},${G.tealDeep})"></div>
    <div style="position:absolute;left:0;right:0;top:50px;height:6px;background:repeating-linear-gradient(90deg,transparent 0 14px,rgba(0,0,0,.18) 14px 22px)"></div>
    <div class="hand" style="position:absolute;left:34px;right:34px;top:68px;font:600 40px/42px 'Hand',cursive;color:#3a4348">${esc(i.sub)}</div>
    <div style="position:absolute;left:24px;right:24px;top:160px;display:flex;flex-direction:column;gap:8px">${strips}</div>
  </div>`;

  const pot = penPot({ x: 836, y: 1124, s: 1.1 });
  const body = `${desk}${mon}${pad}${pot}${fh}`;
  return { n, id: `${n}-cut-a-long-to-do-list-to-one-thing`, html: page(p, { body, css: fc, paper: "#f1ecd8" }) };
}

/* ================================================================ #60 */
function p60() {
  const n = 60;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9eeec", split: "? " });
  const nine = i.items[0].split(". ").map((s) => s.replace(/\.$/, "") + ".");
  const final = i.items[1].replace(/^what you look at tomorrow morning is two lines: /, "").replace(/\.$/, "");
  const [l1, l2] = final.split(", and ").map((s) => s[0].toUpperCase() + s.slice(1));

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:#cfdcd9")}"></div>`;

  // The crowded page, cropped by the pin edges: nine rows, staggered and overlapping.
  const r = rng(77);
  const xs = [44, 430, 150, 590, 360, 60, 520, 210, 690];
  const rowsHtml = nine.map((t, k) => `<div class="hand" style="position:absolute;left:${xs[k]}px;top:${8 + k * 40}px;font:${k % 3 === 1 ? 700 : 600} ${66 + (k % 3) * 4}px/48px 'Hand',cursive;color:#2b3a47;opacity:${0.78 + (k % 3) * 0.1};transform:rotate(${((r() - 0.5) * 5).toFixed(1)}deg);white-space:nowrap">${esc(t)}</div>`).join("");
  const doodles = `<svg style="position:absolute;left:0;top:0" width="1070" height="470" viewBox="0 0 1070 470" aria-hidden="true">
    <g fill="none" stroke="#2b3a47" stroke-opacity=".5" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M330 52 q40 -14 90 2 M740 96 q50 -10 120 6 M860 140 q40 -8 90 4 M300 230 q60 -10 110 6 M820 320 q50 -10 130 4"/>
      <path d="M960 36 c30 -22 70 6 40 30 c-30 18 -60 -8 -30 -26"/><path d="M930 250 l34 -26 m-34 26 l40 6"/><path d="M52 380 q80 -16 160 4"/><path d="M350 150 q70 -18 150 4 M620 300 q60 -12 120 2 M90 150 q40 -10 90 4"/>
      <path d="M700 380 q30 -30 66 -2 q-16 34 -60 8"/><path d="M420 426 q60 -12 120 2 M870 420 q34 -8 80 2"/></g></svg>`;
  const sheet = `
  <div data-check="page" style="${abs(-36, 396, 1076, 430, "transform:rotate(-1.2deg);background:#fffefa;box-shadow:0 2px 3px rgba(20,40,40,.3),0 22px 30px rgba(10,35,35,.42);z-index:6;overflow:hidden;background-image:linear-gradient(90deg,transparent 100px,#e8b6c3 100px 102px,transparent 102px),repeating-linear-gradient(transparent 0 45px,#c4d7d4 45px 47px);background-position:0 0,0 18px")}">${rowsHtml}${doodles}</div>`;
  const exA = exTag(806, 412, 1);

  // The monitor, its top edge sloping, with the clean card on its screen.
  const mon = `<svg style="position:absolute;left:0;top:872px;z-index:3;filter:drop-shadow(0 -10px 16px rgba(10,35,35,.4))" width="1000" height="640" viewBox="0 0 1000 640" aria-hidden="true">
    <defs><linearGradient id="scr60" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2d6264"/><stop offset=".6" stop-color="#1d3f42"/><stop offset="1" stop-color="#162b2e"/></linearGradient></defs>
    <polygon points="0,36 1000,0 1000,640 0,640" fill="#22282b"/><polygon points="0,36 1000,0 1000,10 0,46" fill="#4a545a"/>
    <polygon points="26,84 974,52 974,640 26,640" fill="url(#scr60)"/><polygon points="26,84 974,52 974,640 26,640" fill="none" stroke="#0f1315" stroke-width="3"/>
    <circle cx="500" cy="64" r="5" fill="${G.teal}" opacity="0"/></svg>`;
  const flags = flag({ x: 640, y: 858, w: 130, h: 46, rot: -2, color: G.teal, z: 7 }) + flag({ x: 730, y: 850, w: 120, h: 46, rot: 2, color: "#f0c850", z: 7 }) + flag({ x: 810, y: 856, w: 130, h: 46, rot: -1, color: "#aab4ba", z: 7 });

  const CARD = { x: 200, y: 962, w: 660, h: 246 };
  const line = (t, top) => `<div style="position:absolute;left:84px;right:22px;top:${top}px;display:flex;align-items:center;gap:18px"><div style="flex:none;width:30px;height:30px;border-radius:50%;background:${G.teal};margin-top:6px"></div><div class="hand" style="font:700 56px/1 'Hand',cursive;color:${G.ink};white-space:nowrap">${esc(t)}</div></div>`;
  const card = `
  <div style="${abs(CARD.x, CARD.y, CARD.w, CARD.h, "transform:rotate(1.2deg);background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.4),0 26px 34px rgba(0,0,0,.5);z-index:8;overflow:hidden;background-image:repeating-linear-gradient(transparent 0 83px,#cfe0dd 83px 84px);background-position:0 40px")}" >
    <div style="position:absolute;left:0;right:0;top:0;height:40px;border-bottom:3px solid #e6a9b8"></div>
    ${line(l1, 64)}${line(l2, 150)}</div>
  ${exTag(CARD.x + CARD.w - 160, CARD.y - 24, 1)}`;

  const subTxt = `<div class="serif" style="${abs(70, 1244, 860, 90, "font:italic 400 33px/1.25 'Newsreader',serif;color:#e8eeea;z-index:8;text-align:center")}" data-check="sub">${esc(i.sub)}</div>`;

  // A mulberry arrow from the crowd down to the card.
  const arrow = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:9;filter:drop-shadow(0 4px 5px rgba(0,0,0,.35))" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M110 800 C 50 880, 70 1000, 150 1070" stroke="#fffaf2" stroke-width="26"/><path d="M104 1066 L156 1078 L152 1022" stroke="#fffaf2" stroke-width="26"/>
    <path d="M110 800 C 50 880, 70 1000, 150 1070" stroke="${C.mulberry}" stroke-width="12"/><path d="M104 1066 L156 1078 L152 1022" stroke="${C.mulberry}" stroke-width="12"/></g></svg>`;

  const body = `${desk}${sheet}${exA}${mon}${flags}${card}${arrow}${subTxt}${fh}`;
  return { n, id: `${n}-to-do-list-too-long-two-lines`, html: page(p, { body, css: fc, paper: "#e9eeec" }) };
}

export const pins = [p34(), p36(), p54(), p56(), p58(), p60()];
