/**
 * ADHD Life Companion guide pins, world w10: whiteboard and corkboard.
 * White, cork, a mulberry marker; aluminium and oak frames, marker trays, magnets, pushpins, string.
 * #38 checklist       a wall-mounted whiteboard, three marker boxes, magnets and markers on the tray
 * #40 comparison      a rolling whiteboard on a wood floor, two rows struck through, one ringed, a letter on the floor
 * #44 checklist       a small oak-framed board on a desk, five ticked boxes, a pencil and a folder
 * #46 how-to-steps    a flip chart on a tripod, six numbered lines, a phone, a form and a paper in the margin
 * #50 myth-vs-truth   a whiteboard in two columns, a crossed-out note, two cards on magnets, a ringed line, a form on the desk
 * #52 question        a corkboard with five index cards on pushpins and mulberry string
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const MK = { ink: "#1b2431", grey: "#8c949b", greyLine: "#c9ced2", mul: C.mulberry, mulDeep: C.mulberryDeep };

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
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(20,20,30,.3);z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(20,20,30,.3);z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4a4348;max-width:830px}
  .example{font-size:24px;padding:5px 11px;background:#fffdf8;color:#3d3a40}
  .mk{font-family:"Hand",cursive;font-weight:700;color:${MK.ink}}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/* ------------------------------------------------------------ shared props */

/** A hand-drawn loop (an ellipse that overshoots its start), as an svg over a box of w x h. */
function ring(w, h, { color = C.mulberry, sw = 7, seed = 3, halo = null, sq = 2, over = 1.08 } = {}) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2, N = 56, start = r() * 6.28;
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const t = k / N, a = start + t * Math.PI * 2 * over;
    const wob = 1 + 0.02 * Math.sin(t * 11 + seed) + t * 0.04;
    const c = Math.cos(a), sn = Math.sin(a), e = 2 / sq;
    pts.push(`${(cx + Math.sign(c) * Math.abs(c) ** e * (w / 2 - sw) * wob).toFixed(1)},${(cy + Math.sign(sn) * Math.abs(sn) ** e * (h / 2 - sw) * wob).toFixed(1)}`);
  }
  const d = `M${pts.join(" L")}`;
  return `<svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${halo ? `<path d="${d}" fill="none" stroke="${halo}" stroke-width="${sw + 8}" stroke-linecap="round" stroke-linejoin="round"/>` : ""}<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
const scrib = (w, h, seed, o) => `<svg style="position:absolute;inset:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${scribbles(w, h, rng(seed), o)}</svg>`;

/** A whiteboard: a frame around a gloss-white face with faint rubbed-out ghosts. `inner` is placed in the face. */
function board({ x, y, w, h, rot = 0, frameKind = "alu", z = 4, inner = "", fw = 16, ghosts = 7, seed = 1 }) {
  const fr = frameKind === "alu"
    ? "linear-gradient(160deg,#f0f2f3,#b4bbc0 55%,#d9dde0)"
    : "linear-gradient(160deg,#dcaa70,#b17a42 55%,#c68c55)";
  const r = rng(seed);
  let gh = "";
  for (let k = 0; k < ghosts; k++) {
    gh += `<div style="${abs(r() * (w - 2 * fw - 200), r() * (h - 2 * fw - 80), 140 + r() * 260, 34 + r() * 40, `transform:rotate(${(r() * 14 - 7).toFixed(1)}deg);background:rgba(120,135,150,${(0.045 + r() * 0.04).toFixed(3)});filter:blur(11px);border-radius:40px`)}"></div>`;
  }
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:10px;background:${fr};box-shadow:0 2px 3px rgba(0,0,0,.3),0 26px 38px rgba(20,22,30,.42);z-index:${z}`)}">
    <div style="position:absolute;left:${fw}px;top:${fw}px;right:${fw}px;bottom:${fw}px;border-radius:4px;background:linear-gradient(#fcfdfd,#f4f6f7);overflow:hidden;box-shadow:inset 0 2px 6px rgba(0,0,0,.28)">
      ${gh}
      <div style="position:absolute;inset:0;background:linear-gradient(112deg,rgba(255,255,255,0) 22%,rgba(255,255,255,.75) 33%,rgba(255,255,255,0) 44%,rgba(255,255,255,0) 68%,rgba(255,255,255,.5) 74%,rgba(255,255,255,0) 82%)"></div>
      <div style="position:absolute;inset:0">${inner}</div>
    </div></div>`;
}

/** A dry-erase marker lying flat; the tip end is on the left. */
function marker({ x, y, len = 200, rot = 0, cap = C.mulberry, z = 8 }) {
  return `<svg style="${abs(x, y, len, 40, `transform:rotate(${rot}deg);filter:drop-shadow(0 7px 4px rgba(0,0,0,.38));z-index:${z}`)}" viewBox="0 0 ${len} 40" aria-hidden="true">
    <rect x="34" y="6" width="${len - 34}" height="28" rx="9" fill="#f1f3f4"/><rect x="34" y="7" width="${len - 34}" height="8" rx="4" fill="#fff" opacity=".8"/>
    <rect x="${len - 78}" y="6" width="78" height="28" rx="9" fill="${cap}"/><rect x="${len - 118}" y="6" width="20" height="28" fill="${cap}"/>
    <rect x="${len - 78}" y="8" width="78" height="6" rx="3" fill="#fff" opacity=".25"/>
    <path d="M34 9 L8 17 L8 23 L34 31Z" fill="#dde0e2"/><path d="M14 17 L2 20 L14 23Z" fill="${cap}"/></svg>`;
}

/** A felt eraser block. */
const eraser = ({ x, y, w = 170, rot = 0, z = 8 }) => `<div style="${abs(x, y, w, 52, `transform:rotate(${rot}deg);border-radius:8px;background:linear-gradient(#5d6a73,#3f4a52);box-shadow:0 8px 8px rgba(0,0,0,.35);z-index:${z}`)}"><div style="${abs(0, 28, w, 24, "border-radius:0 0 8px 8px;background:#e3d9bf")}"></div></div>`;

/** A round magnet (optionally with a tick). */
function magnet({ x, y, s = 44, color = "#4a5258", tick = false, z = 9 }) {
  return `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 5px 4px rgba(0,0,0,.4))`)}" viewBox="0 0 44 44" aria-hidden="true"><defs><radialGradient id="mg${color.replace("#", "")}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="22" cy="22" r="20" fill="${color}"/><circle cx="22" cy="22" r="20" fill="url(#mg${color.replace("#", "")})"/>${tick ? '<path d="M11 23 L19 31 L33 13" fill="none" stroke="#fffaf2" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' : ""}</svg>`;
}

/** A pushpin seen from above: a round head with a bright spot. */
function pin({ x, y, s = 34, color = "#e8e2d6", z = 14 }) {
  const id = `pn${Math.round(x)}${Math.round(y)}`;
  return `<svg style="${abs(x - s / 2, y - s / 2, s, s, `z-index:${z};filter:drop-shadow(5px 8px 4px rgba(40,20,5,.5))`)}" viewBox="0 0 34 34" aria-hidden="true"><defs><radialGradient id="${id}" cx=".34" cy=".3" r=".75"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="17" cy="17" r="15" fill="${color}"/><circle cx="17" cy="17" r="15" fill="url(#${id})"/><circle cx="17" cy="17" r="15" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/></svg>`;
}

/** A hand-drawn box, optionally ticked in mulberry. */
const hbox = (s, ticked, style = "") => `<svg style="${style}" width="${s}" height="${s}" viewBox="0 0 60 60" overflow="visible" aria-hidden="true"><path d="M8 10 L52 6 L54 52 L9 55 Z" fill="${ticked ? "rgba(134,88,106,.10)" : "none"}" stroke="${MK.ink}" stroke-width="5" stroke-linejoin="round"/>${ticked ? `<path d="M13 32 L27 47 L62 -3" fill="none" stroke="${MK.mul}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` : ""}</svg>`;

const tickDisc = (s = 80, style = "") => `<svg style="${style}" width="${s}" height="${s}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const crossDisc = (s = 80, style = "", fill = "#aab1b7") => `<svg style="${style}" width="${s}" height="${s}" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${fill}"/><path d="M27 27 L57 57 M57 27 L27 57" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/></svg>`;

const exTag = (x, y, rot = 0, z = 20) => `<div class="example" style="position:absolute;left:${x}px;top:${y}px;z-index:${z};transform:rotate(${rot}deg);box-shadow:0 2px 6px rgba(0,0,0,.28)">Example</div>`;

/** A wobbly marker line from (x1,y1) to (x2,y2). */
function line(x1, y1, x2, y2, { color = MK.ink, sw = 5, seed = 1, op = 0.85 } = {}) {
  const r = rng(seed);
  const n = 7;
  let d = `M${x1} ${y1}`;
  for (let k = 1; k <= n; k++) d += ` L${(x1 + ((x2 - x1) * k) / n).toFixed(1)} ${(y1 + ((y2 - y1) * k) / n + (r() - 0.5) * 3.2).toFixed(1)}`;
  const w = Math.abs(x2 - x1) + 20, h = Math.abs(y2 - y1) + 20;
  return `<svg style="position:absolute;left:0;top:0;overflow:visible;pointer-events:none" width="${w}" height="${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** The tray under a wall board. */
function tray({ x, y, w, z = 6 }) {
  return `<div style="${abs(x, y, w, 46, `border-radius:4px 4px 12px 12px;background:linear-gradient(#cfd4d8,#9aa2a8);box-shadow:0 -1px 0 #e9ecee,0 16px 18px rgba(20,22,30,.4);z-index:${z}`)}"></div><div style="${abs(x + 8, y, w - 16, 12, `background:linear-gradient(#aeb5ba,#8f979d);z-index:${z};border-radius:4px 4px 0 0`)}"></div>`;
}

/* ================================================================ #38 */
function p38() {
  const n = 38;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3ebe0", split: "? " });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(90% 70% at 30% 20%,#f4e9db,#e6d5bf 70%,#d9c5ab)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(120,90,50,.035) 0 2px,transparent 2px 9px)")}"></div>`;

  const BW = 912, BH = 826;
  const row = (k, top, text, ticked, lines) => `
    <div style="${abs(34, top + 12, 70, 70)}">${hbox(70, ticked)}</div>
    <div class="mk" data-check="row${k}" style="${abs(138, top, 700, lines * 72 + 8, `font-size:68px;line-height:72px;${ticked ? "" : ""}`)}">${esc(text)}</div>`;
  const inner = `
    <div class="mk" data-check="sub" style="${abs(40, 28, 800, 126, `font-size:50px;line-height:56px;text-wrap:balance;color:${MK.mul}`)}">${esc(i.sub)}</div>
    ${line(40, 168, 820, 176, { color: MK.greyLine, sw: 5, seed: 4, op: 1 })}
    ${row(1, 214, i.items[0], true, 1)}
    ${row(2, 372, i.items[1], false, 3)}
    ${row(3, 640, i.items[2], false, 2)}`;
  const brd = board({ x: 44, y: 410, w: BW, h: BH, rot: 0, inner, seed: 11 });
  const tr = tray({ x: 110, y: 410 + BH - 6, w: 780 });
  const marks = marker({ x: 540, y: 410 + BH - 36, len: 200, rot: -3, cap: C.mulberry }) + marker({ x: 690, y: 410 + BH - 28, len: 190, rot: 2, cap: MK.ink }) + marker({ x: 370, y: 410 + BH - 30, len: 190, rot: -1, cap: "#7d868d" }) + eraser({ x: 140, y: 410 + BH - 44, w: 170, rot: -2 });
  const mags = [0, 1, 2].map((k) => magnet({ x: 160 + k * 0, y: 0 })).join("");
  void mags;
  // Three loose magnets stuck to the board's lower frame edge, one in mulberry.
  const magnets = magnet({ x: 800, y: 410 + BH - 70, s: 48, color: C.mulberry, tick: true }) + magnet({ x: 856, y: 410 + BH - 66, s: 44, color: "#59616a" }) + magnet({ x: 82, y: 410 + BH - 66, s: 44, color: "#59616a" });
  const body = `${wall}${brd}${tr}${marks}${magnets}${fh}`;
  return { n, id: `${n}-adhd-cant-start-a-task`, html: page(p, { body, css: fc, paper: "#f3ebe0" }) };
}

/* ================================================================ #40 */
function letter({ x, y, w = 320, h = 200 }) {
  return `<div style="${abs(x, y, w, h, "transform:perspective(500px) rotateX(48deg) rotateZ(-9deg);transform-origin:50% 50%;background:linear-gradient(#fffdf8,#ece7da);box-shadow:0 18px 20px rgba(30,20,10,.45);z-index:7")}">
    <div style="position:absolute;left:26px;top:24px;width:88px;height:14px;background:${C.mulberry};border-radius:3px"></div>${scrib(w, h, 33, { rows: 6, x0: 0.08, y0: 0.26, span: 0.66, color: "#3d3a40", op: 0.5 })}</div>`;
}

function p40() {
  const n = 40;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e8eef2", split: "? " });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 780, "background:radial-gradient(100% 80% at 40% 30%,#e6edf1,#d0dbe2 70%,#c0ced7)")}"></div>
  <div style="${abs(0, 1120, 1000, 22, "background:linear-gradient(#f3f5f6,#c9d1d6);box-shadow:0 4px 8px rgba(0,0,0,.2)")}"></div>
  <div style="${abs(0, 1142, 1000, 360, "background:linear-gradient(#b98b56,#9a6e3d 55%,#845a30)")}"></div>
  <div style="${abs(0, 1142, 1000, 360, "background-image:repeating-linear-gradient(90deg,rgba(60,35,10,.22) 0 2px,transparent 2px 160px),repeating-linear-gradient(0deg,rgba(255,235,200,.07) 0 3px,transparent 3px 11px)")}"></div>`;

  // The stand: two posts behind the board, a crossbar, T-feet with casters. A floor shadow beneath.
  const stand = `
  <div style="${abs(120, 1250, 760, 40, "background:radial-gradient(50% 50% at 50% 50%,rgba(40,20,5,.45),rgba(40,20,5,0));filter:blur(8px);z-index:2")}"></div>
  <div style="${abs(168, 1000, 26, 260, "background:linear-gradient(90deg,#c9cfd3,#8e979d);z-index:3;box-shadow:6px 0 10px rgba(0,0,0,.25)")}"></div>
  <div style="${abs(806, 1000, 26, 260, "background:linear-gradient(90deg,#c9cfd3,#8e979d);z-index:3;box-shadow:6px 0 10px rgba(0,0,0,.25)")}"></div>
  <div style="${abs(168, 1160, 664, 18, "background:linear-gradient(#b5bcc1,#8a9298);z-index:3;box-shadow:0 5px 8px rgba(0,0,0,.28)")}"></div>
  <div style="${abs(86, 1246, 190, 24, "border-radius:12px;background:linear-gradient(#aab2b8,#6d767c);z-index:3;box-shadow:0 8px 8px rgba(30,15,0,.4)")}"></div>
  <div style="${abs(724, 1246, 190, 24, "border-radius:12px;background:linear-gradient(#aab2b8,#6d767c);z-index:3;box-shadow:0 8px 8px rgba(30,15,0,.4)")}"></div>
  ${[96, 244, 734, 882].map((cx) => `<div style="${abs(cx - 5, 1262, 34, 34, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#7a838a,#2a3035 70%);z-index:4;box-shadow:0 6px 6px rgba(30,15,0,.45)")}"><div style="${abs(11, 11, 12, 12, "border-radius:50%;background:#c9cfd3")}"></div></div>`).join("")}`;

  const BX = 84, BY = 420, BW = 832, BH = 660;
  const R = 150; // row height
  const rowBase = (k, top, text, lines, ticked) => `
    <div style="${abs(26, top + (lines === 1 ? 2 : 36), 72, 72)}">${ticked ? tickDisc(72) : crossDisc(72)}</div>
    <div class="mk" data-check="row${k}" style="${abs(124, top + 6, 640, lines * 64 + 8, `font-size:62px;line-height:64px;${ticked ? "" : `color:${MK.grey};text-decoration:line-through;text-decoration-thickness:6px;text-decoration-color:${MK.ink}`}`)}">${esc(text)}</div>`;
  const inner = `
    ${rowBase(1, 34, i.items[0], 1, false)}
    ${line(20, 34 + R - 24, 790, 34 + R - 16, { color: MK.greyLine, sw: 5, seed: 2, op: 1 })}
    ${rowBase(2, 34 + R - 4, i.items[1], 2, false)}
    ${line(20, 34 + 2 * R - 6, 790, 34 + 2 * R + 2, { color: MK.greyLine, sw: 5, seed: 3, op: 1 })}
    ${rowBase(3, 34 + 2 * R + 14, i.items[2], 2, true)}
    <div style="${abs(8, 34 + 2 * R + 6, 786, 156)}">${ring(786, 156, { sw: 7, seed: 8, sq: 3.6 })}</div>
    <div class="mk" data-check="sub" style="${abs(26, 34 + 3 * R + 20, 770, 60, `font-size:46px;line-height:50px;color:${MK.mul}`)}">${esc(i.sub)}</div>`;
  const brd = board({ x: BX, y: BY, w: BW, h: BH, rot: -0.8, inner, seed: 21 });
  const tr = tray({ x: 250, y: BY + BH - 8, w: 500, z: 5 });
  const marks = marker({ x: 520, y: BY + BH - 40, len: 190, rot: -2, cap: C.mulberry, z: 6 }) + marker({ x: 340, y: BY + BH - 36, len: 180, rot: 1, cap: MK.ink, z: 6 });
  const ex = exTag(BX + BW - 192, BY - 30, 1.5, 12);
  const body = `${wall}${stand}${brd}${tr}${marks}${letter({ x: 350, y: 1196, w: 320, h: 190 })}${ex}${fh}`;
  return { n, id: `${n}-is-it-a-first-step`, html: page(p, { body, css: fc, paper: "#e8eef2" }) };
}

/* ================================================================ #44 */
function p44() {
  const n = 44;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9efe6", sub: i.sub });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 780, "background:radial-gradient(100% 80% at 60% 20%,#e6eee2,#d3dfcd 65%,#c4d3bc)")}"></div>
  <div style="${abs(0, 1128, 1000, 400, "background:linear-gradient(#d1a066,#b88448 40%,#a37238)")}"></div>
  <div style="${abs(0, 1128, 1000, 400, "background-image:repeating-linear-gradient(0deg,rgba(90,50,10,.14) 0 2px,transparent 2px 22px),repeating-linear-gradient(0deg,rgba(255,230,190,.12) 0 1px,transparent 1px 9px)")}"></div>
  <div style="${abs(0, 1124, 1000, 8, "background:#8a5d2c;box-shadow:0 -3px 8px rgba(0,0,0,.25)")}"></div>`;

  const BX = 66, BY = 408, BW = 868, BH = 704;
  const feet = `<div style="${abs(BX + 90, BY + BH - 10, 70, 30, "background:linear-gradient(#a87238,#7d5222);border-radius:0 0 8px 8px;z-index:3;box-shadow:0 10px 10px rgba(40,20,0,.4)")}"></div>
  <div style="${abs(BX + BW - 160, BY + BH - 10, 70, 30, "background:linear-gradient(#a87238,#7d5222);border-radius:0 0 8px 8px;z-index:3;box-shadow:0 10px 10px rgba(40,20,0,.4)")}"></div>
  <div style="${abs(BX + 20, 1100, BW - 40, 40, "background:radial-gradient(50% 50% at 50% 50%,rgba(60,30,0,.4),rgba(60,30,0,0));filter:blur(8px);z-index:2")}"></div>`;

  const items = i.items.map((t, k) => `<div style="display:flex;align-items:center;gap:26px"><div style="flex:none;width:58px;height:58px;margin-top:6px">${hbox(58, true)}</div><div class="mk" style="font-size:47px;line-height:50px">${esc(t)}</div></div>`).join("");
  const inner = `<div data-check="list" style="${abs(34, 18, 780, 606, "display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start")}">${items}</div>`;
  const brd = board({ x: BX, y: BY, w: BW, h: BH, rot: -0.7, frameKind: "oak", fw: 22, inner, seed: 31 });

  // On the desk: a pencil lying toward us and a manila folder at the corner.
  const pencil = `<svg style="${abs(70, 1232, 420, 40, "transform:rotate(-3deg);filter:drop-shadow(0 8px 5px rgba(50,25,0,.4));z-index:8")}" viewBox="0 0 420 40" aria-hidden="true">
    <rect x="52" y="8" width="350" height="24" rx="3" fill="#e0b64f"/><rect x="52" y="8" width="350" height="7" fill="#f2d57e"/><rect x="52" y="26" width="350" height="6" fill="#bd9335"/>
    <rect x="402" y="8" width="14" height="24" rx="3" fill="#c9ccd0"/><rect x="414" y="8" width="8" height="24" rx="3" fill="#e9a3b4"/>
    <path d="M52 8 L10 20 L52 32Z" fill="#ecd7b0"/><path d="M22 16 L8 20 L22 24Z" fill="#2c2c30"/></svg>`;
  const folder = `<div style="${abs(590, 1196, 400, 300, "transform:rotate(-4deg);background:linear-gradient(#ead9ac,#dcc58a);border-radius:12px;box-shadow:0 6px 10px rgba(50,25,0,.3),0 18px 26px rgba(50,25,0,.4);z-index:7")}"></div>
  <div style="${abs(620, 1166, 170, 44, "transform:rotate(-4deg);background:linear-gradient(#ead9ac,#e1cc94);border-radius:10px 10px 0 0;z-index:7")}"></div>`;
  const body = `${wall}${feet}${brd}${pencil}${folder}${eraser({ x: 330, y: 1296, w: 150, rot: 2, z: 8 })}${fh}`;
  return { n, id: `${n}-check-your-own-first-step`, html: page(p, { body, css: fc, paper: "#e9efe6" }) };
}

/* ================================================================ #46 */
function p46() {
  const n = 46;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e7eb", size: 76 });

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(90% 70% at 50% 25%,#7a5568,#533745 60%,#3a2530)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(40% 30% at 82% 18%,rgba(255,235,220,.22),rgba(255,235,220,0))")}"></div>`;

  // The tripod easel: two front legs splayed, a rear leg, a ledge, a top clamp bar.
  const leg = (x1, y1, x2, y2, w = 26, c = "#3f464b") => {
    const len = Math.hypot(x2 - x1, y2 - y1), ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    return `<div style="${abs(x1, y1 - w / 2, len, w, `transform-origin:0 50%;transform:rotate(${ang}deg);background:linear-gradient(#80898f,${c} 60%,#2b3135);border-radius:5px;box-shadow:0 10px 14px rgba(0,0,0,.4);z-index:2`)}"></div>`;
  };
  const legs = leg(500, 1120, 520, 1520, 24, "#2f3539") + leg(220, 1150, 90, 1520) + leg(780, 1150, 910, 1520);

  const SX = 90, SY = 466, SW = 820, SH = 790;
  const bar = `<div style="${abs(SX - 14, SY - 62, SW + 28, 58, "border-radius:10px;background:linear-gradient(#aeb6bb,#6c757b);box-shadow:0 8px 12px rgba(0,0,0,.45);z-index:6")}"></div>
  <div style="${abs(SX + 90, SY - 78, 120, 30, "border-radius:6px;background:#3b4348;z-index:6")}"></div><div style="${abs(SX + SW - 210, SY - 78, 120, 30, "border-radius:6px;background:#3b4348;z-index:6")}"></div>`;
  const ledge = `<div style="${abs(SX - 24, SY + SH + 10, SW + 48, 40, "border-radius:6px;background:linear-gradient(#aeb6bb,#6c757b);box-shadow:0 14px 16px rgba(0,0,0,.5);z-index:6")}"></div>`;
  const marks = marker({ x: 560, y: SY + SH - 22, len: 210, rot: -2, cap: C.mulberry, z: 7 }) + marker({ x: 330, y: SY + SH - 18, len: 190, rot: 1, cap: MK.ink, z: 7 });

  const icoStyle = `position:absolute;left:0;`;
  const steps = i.items.map((t, k) => {
    const underlined = k === 4;
    const num = `<div style="flex:none;width:58px;height:58px;border-radius:50%;background:${C.mulberry};color:#fff;font:700 38px/58px 'Hand',cursive;text-align:center;margin-top:2px">${k + 1}</div>`;
    return `<div style="display:flex;gap:18px;align-items:flex-start">${num}<div class="mk" style="font-size:40px;line-height:42px;${underlined ? `text-decoration:underline;text-decoration-thickness:5px;text-underline-offset:7px;text-decoration-color:${C.mulberry}` : ""}">${esc(t)}</div></div>`;
  }).join("");

  const sheetInner = `
    <div data-check="steps" style="${abs(32, 30, 640, SH - 52, "display:flex;flex-direction:column;justify-content:space-between")}">${steps}</div>
    ${line(700, 24, 700, SH - 24, { color: "#e0a9bb", sw: 4, seed: 6, op: 1 })}
    <div style="${abs(716, 250, 90, 330, "display:flex;flex-direction:column;justify-content:space-between;align-items:center")}">
      ${icon("phone", { size: 78, color: C.mulberry, weight: "bold" })}
      ${icon("clipboard-text", { size: 78, color: C.mulberry, weight: "bold" })}
      ${icon("file", { size: 78, color: C.mulberry, weight: "bold" })}
    </div>`;
  const sheet = `
  <div style="${abs(SX + 14, SY + 14, SW, SH, "transform:rotate(1.2deg);background:#f0eef0;border-radius:4px;box-shadow:0 10px 16px rgba(0,0,0,.35);z-index:3")}"></div>
  <div style="${abs(SX + 6, SY + 7, SW, SH, "transform:rotate(.6deg);background:#f6f4f6;border-radius:4px;box-shadow:0 10px 16px rgba(0,0,0,.35);z-index:4")}"></div>
  <div style="${abs(SX, SY, SW, SH, "transform:rotate(-.3deg);background-color:#fffefd;background-image:radial-gradient(circle,rgba(110,100,140,.2) 1.6px,transparent 2px);background-size:36px 36px;border-radius:4px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 24px 34px rgba(0,0,0,.45);z-index:5;overflow:hidden")}">
    <div style="position:absolute;inset:0;background:linear-gradient(112deg,rgba(255,255,255,0) 40%,rgba(255,255,255,.55) 50%,rgba(255,255,255,0) 60%)"></div>${sheetInner}</div>`;
  const body = `${wall}${legs}${bar}${sheet}${ledge}${marks}${fh}`;
  return { n, id: `${n}-how-to-turn-any-task-into-a-first-step`, html: page(p, { body, css: fc, paper: "#f1e7eb" }) };
}

/* ================================================================ #50 */
function p50() {
  const n = 50;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e6ebef", split: "~~", size: 68 });
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 840, "background:radial-gradient(90% 80% at 40% 20%,#566673,#3b4955 65%,#2c3740)")}"></div>
  <div style="${abs(0, 1196, 1000, 320, "background:linear-gradient(#cc9d63,#b27f45 45%,#9a6a36)")}"></div>
  <div style="${abs(0, 1196, 1000, 320, "background-image:repeating-linear-gradient(0deg,rgba(90,50,10,.13) 0 2px,transparent 2px 24px),repeating-linear-gradient(90deg,rgba(255,230,190,.08) 0 1px,transparent 1px 8px)")}"></div>
  <div style="${abs(0, 1190, 1000, 8, "background:#7c5127;box-shadow:0 -4px 10px rgba(0,0,0,.35)")}"></div>`;

  const BX = 46, BY = 408, BW = 908, BH = 762;
  const sticky = `<div style="${abs(30, 76, 292, 214, "transform:rotate(-3deg);background:linear-gradient(172deg,#d9dcde,#c4c9cc);box-shadow:0 2px 2px rgba(0,0,0,.3),0 12px 14px rgba(20,25,30,.3);z-index:3")}">
      <div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.25)"></div>
      <div class="mk" data-check="myth" style="${abs(20, 40, 252, 140, `font-size:62px;line-height:64px;text-align:center;color:#5d666c;text-decoration:line-through;text-decoration-thickness:7px;text-decoration-color:${MK.ink}`)}">Just an excuse</div></div>`;
  const card = (x, y, w, h, txt, rot, seedn, chk) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fffaf0;border-radius:4px;box-shadow:0 2px 3px rgba(0,0,0,.28),0 14px 18px rgba(20,25,30,.3);z-index:3;background-image:repeating-linear-gradient(transparent 0 45px,#d8e0e4 45px 46px);background-position:0 24px`)}">
      <div class="mk" data-check="${chk}" style="${abs(26, 36, w - 52, h - 44, "font-size:39px;line-height:46px;font-weight:600")}">${esc(txt)}</div></div>`;
  const tagStyle = "font-size:52px;line-height:52px;";
  const inner = `
    <div class="mk" style="${abs(40, 8, 200, 56, tagStyle + `color:${MK.grey}`)}">Myth</div>
    <div class="mk" style="${abs(412, 8, 200, 56, tagStyle + `color:${MK.mul}`)}">Truth</div>
    ${line(364, 24, 366, 546, { color: MK.greyLine, sw: 6, seed: 12, op: 1 })}
    ${sticky}
    <div class="mk" data-check="sub" style="${abs(34, 318, 318, 210, "font-size:42px;line-height:46px;font-weight:600")}">${esc(i.sub)}</div>
    ${card(404, 64, 446, 232, cap(i.items[0]), 1.1, 1, "def1")}
    ${card(404, 310, 446, 232, cap(i.items[1]), -1, 2, "def2")}
    <div style="${abs(26, 562, 818, 150)}"><div class="mk" data-check="useful" style="${abs(34, 22, 750, 114, `font-size:48px;line-height:54px;color:${MK.mul}`)}">${esc(cap(i.items[2]))}</div>${ring(818, 150, { sw: 7, seed: 14, sq: 3.6 })}</div>`;
  const brd = board({ x: BX, y: BY, w: BW, h: BH, rot: 0, inner, seed: 41 });
  const mags = magnet({ x: BX + 16 + 404 + 200, y: BY + 16 + 56, s: 40, color: "#59616a", z: 9 }) + magnet({ x: BX + 16 + 404 + 200, y: BY + 16 + 296, s: 40, color: "#59616a", z: 9 }) + magnet({ x: BX + 16 + 134, y: BY + 16 + 66, s: 40, color: "#59616a", z: 9 });
  const tr = tray({ x: 150, y: BY + BH - 8, w: 640, z: 5 });
  const marks = marker({ x: 520, y: BY + BH - 38, len: 200, rot: -2, cap: C.mulberry, z: 6 }) + marker({ x: 330, y: BY + BH - 34, len: 190, rot: 1.5, cap: MK.ink, z: 6 }) + eraser({ x: 180, y: BY + BH - 42, w: 120, rot: -2, z: 6 });

  // A form lying on the desk: a header bar, rows of lines, small boxes.
  const form = `<div style="${abs(560, 1230, 360, 400, "transform:rotate(-5deg);background:linear-gradient(#fffefb,#eeeae0);box-shadow:0 3px 4px rgba(50,25,0,.3),0 18px 24px rgba(50,25,0,.4);z-index:7")}">
    <div style="${abs(26, 26, 150, 18, `background:${C.mulberry};border-radius:3px`)}"></div>
    ${[0, 1, 2].map((k) => `<div style="${abs(26, 74 + k * 62, 22, 22, "border:3px solid #4b5258;border-radius:3px")}"></div><div style="${abs(66, 82 + k * 62, 250 - k * 30, 5, "background:#a8afb4;border-radius:3px")}"></div><div style="${abs(66, 98 + k * 62, 190 - k * 20, 5, "background:#c4c9cd;border-radius:3px")}"></div>`).join("")}</div>`;
  const body = `${wall}${brd}${mags}${tr}${marks}${form}${fh}`;
  return { n, id: `${n}-is-executive-dysfunction-just-an-excuse`, html: page(p, { body, css: fc, paper: "#e6ebef" }) };
}

/* ================================================================ #52 */
function cork(x, y, w, h) {
  return `<svg style="${abs(x, y, w, h, "z-index:1")}" width="${w}" height="${h}" aria-hidden="true">
    <defs>
      <filter id="ck1" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .36  0 0 0 0 .22  0 0 0 0 .1  0 0 0 2.2 -.9"/></filter>
      <filter id="ck2" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="21"/><feColorMatrix type="matrix" values="0 0 0 0 .95  0 0 0 0 .8  0 0 0 0 .55  0 0 0 2.2 -1.05"/></filter>
      <filter id="ck3" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .17  0 0 0 0 .06  0 0 0 1.6 -.55"/></filter>
    </defs>
    <rect width="${w}" height="${h}" fill="#c99a63"/>
    <rect width="${w}" height="${h}" filter="url(#ck3)" opacity=".5"/>
    <rect width="${w}" height="${h}" filter="url(#ck2)" opacity=".8"/>
    <rect width="${w}" height="${h}" filter="url(#ck1)" opacity=".85"/></svg>`;
}

function p52() {
  const n = 52;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e6d6", sub: i.sub, split: "? ", size: 74 });

  const FW = 30; // oak frame width at left and right
  const wood = `<div style="${abs(0, SCENE_TOP, FW, 1128, "background:linear-gradient(90deg,#8a5a2b,#c68d54);z-index:10;box-shadow:4px 0 10px rgba(0,0,0,.4)")}"></div>
  <div style="${abs(1000 - FW, SCENE_TOP, FW, 1128, "background:linear-gradient(90deg,#c68d54,#8a5a2b);z-index:10;box-shadow:-4px 0 10px rgba(0,0,0,.4)")}"></div>
  <div style="${abs(0, 1346, 1000, 40, "background:linear-gradient(#c68d54,#8a5a2b);z-index:10")}"></div>`;
  const shade = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(90% 70% at 50% 45%,rgba(255,230,180,.12),rgba(60,30,5,.28));z-index:2")}"></div>`;

  // Cards: [x, y, w, h, rot, font, lines]
  const specs = [
    { x: 78, y: 430, w: 400, h: 208, rot: -2.4, f: 44, t: i.items[0] },
    { x: 522, y: 450, w: 430, h: 300, rot: 2, f: 41, t: i.items[1] },
    { x: 92, y: 706, w: 396, h: 208, rot: 1.8, f: 44, t: i.items[2] },
    { x: 560, y: 846, w: 380, h: 176, rot: -2.2, f: 44, t: i.items[3] },
    { x: 120, y: 1070, w: 720, h: 216, rot: -2.6, f: 60, t: i.items[4], last: true },
  ];
  // Pin position on each card (top centre, given the card's own tilt a little off).
  const pins = specs.map((s) => ({ x: s.x + s.w / 2 + (s.rot > 0 ? 8 : -8), y: s.y + 20 }));
  const cardHtml = specs.map((s, k) => `
    <div style="${abs(s.x, s.y, s.w, s.h, `transform:rotate(${s.rot}deg);background:#fffaf0;border-radius:4px;${s.last ? `border:7px solid ${C.mulberry};box-sizing:border-box;box-shadow:0 3px 4px rgba(40,20,0,.35),0 34px 36px rgba(40,20,0,.5)` : "box-shadow:0 2px 3px rgba(40,20,0,.3),0 16px 20px rgba(40,20,0,.38)"};z-index:${6 + k};background-image:repeating-linear-gradient(transparent 0 ${s.f + 4}px,rgba(150,170,180,.45) ${s.f + 4}px ${s.f + 5}px);background-position:0 38px`)}">
      <div style="${abs(24, 52, 40, 40, "")}">${`<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" stroke="${MK.ink}" stroke-width="4"/></svg>`}</div>
      <div class="mk" data-check="q${k}" style="${abs(80, 40, s.w - 100, s.h - 52, `font-size:${s.f}px;line-height:${s.f + 5}px;font-weight:600`)}">${esc(s.t)}</div></div>`).join("");
  const pinHtml = pins.map((q, k) => pin({ x: q.x, y: q.y, s: 36, color: k === 4 ? C.mulberry : ["#f0ece4", "#d9d3c8", "#f0ece4", "#d9d3c8"][k], z: 20 })).join("");

  // The string runs pin to pin with a little sag, under the cards.
  let d = `M${pins[0].x} ${pins[0].y}`;
  for (let k = 1; k < pins.length; k++) {
    const a = pins[k - 1], b = pins[k];
    d += ` Q${((a.x + b.x) / 2).toFixed(0)} ${(Math.max(a.y, b.y) + 40 + Math.abs(a.x - b.x) * 0.05).toFixed(0)} ${b.x} ${b.y}`;
  }
  const string = `<svg style="${abs(0, 0, 1000, 1500, "z-index:5;pointer-events:none;filter:drop-shadow(3px 6px 3px rgba(40,20,0,.45))")}" viewBox="0 0 1000 1500" aria-hidden="true"><path d="${d}" fill="none" stroke="${C.mulberryDeep}" stroke-width="10" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C.mulberry}" stroke-width="6" stroke-linecap="round" stroke-dasharray="16 6"/></svg>`;

  const body = `${cork(0, SCENE_TOP, 1000, 1128)}${shade}${wood}${string}${cardHtml}${pinHtml}${fh}`;
  return { n, id: `${n}-procrastinating-or-unable-to-start`, html: page(p, { body, css: fc, paper: "#f1e6d6" }) };
}

export const pins = [p38(), p40(), p44(), p46(), p50(), p52()];
