/**
 * ADHD Life Companion pins, group F: sticky wall, crumpled note, notepad.
 * #33 before-after   a wall of scribbled butter sticky notes on a monitor edge, one arrow down to one calm card on a phone
 * #37 myth-vs-truth  a crumpled, struck-through myth note beside a clean truth card, a real Life screen on a phone
 * #41 checklist      a spiral pad with the four real items (two ticked) beside the real billing step, a glass of water
 *
 * Every phone shows a real capture, cropped and placed, never redrawn.
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { asset, screen } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;

/** A small seeded random, so every render draws the same pin. */
const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** The cream header block (eyebrow, headline, optional sub) and footer band every pin here shares. */
function frame(i, { paper, size, sub = null, headline, textTop = 64, extraCss = "" }) {
  const [eyebrow, rest] = i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(40,20,5,.28);z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(40,20,5,.28);z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:6}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px;text-shadow:0 1px 0 rgba(255,255,255,.35)}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4b4339;max-width:820px}
  ${extraCss}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="366">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(headline ?? rest)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

/** Wavy, unreadable pen scribbles for a sticky note: lines of loops, never words. */
function scribbles(w, h, r) {
  const rows = 3 + Math.floor(r() * 3);
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = h * (0.2 + (k / rows) * 0.62) + r() * 6;
    const len = w * (0.3 + r() * 0.5);
    let x = w * 0.12;
    d += `M${x.toFixed(1)} ${y.toFixed(1)} `;
    while (x < w * 0.12 + len) {
      const dx = 7 + r() * 8;
      const up = r() > 0.5 ? -1 : 1;
      d += `q${(dx / 2).toFixed(1)} ${(up * (4 + r() * 6)).toFixed(1)} ${dx.toFixed(1)} ${((r() - 0.5) * 3).toFixed(1)} `;
      x += dx;
    }
  }
  return `<path d="${d}" fill="none" stroke="#4d3a45" stroke-opacity=".5" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A butter sticky note with scribbles (no words) and a soft lift at the lower edge. */
function sticky({ x, y, s = 160, rot = 0, tint = 0, r }) {
  const tints = [["#f6e08f", "#efcc66"], ["#f8e8a6", "#f0d37a"], ["#f2d37c", "#e7bd55"], ["#f4dca0", "#ebc872"]];
  const [a, b] = tints[tint % tints.length];
  return `<div style="${abs(x, y, s, s, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${a},${b});box-shadow:0 1px 2px rgba(0,0,0,.35),0 10px 14px rgba(0,0,0,.38)`)}"><div style="position:absolute;left:0;right:0;top:0;height:14%;background:rgba(255,255,255,.18)"></div><svg style="position:absolute;inset:0" viewBox="0 0 ${s} ${s}" aria-hidden="true">${scribbles(s, s, r)}</svg></div>`;
}

/* ---------------------------------------------------------------- #33 */
function p33() {
  const n = 33;
  const i = idea(n);
  const r = rng(11);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e7eb", size: 64 });

  // The wall of notes across the monitor: a loose grid with jitter, overlapping.
  let notes = "";
  let k = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      const x = 16 + col * 134 + (row % 2 ? 44 : 0) + (r() - 0.5) * 30;
      const y = 348 + row * 86 + (r() - 0.5) * 22;
      notes += sticky({ x, y, s: 140 + r() * 30, rot: (r() - 0.5) * 24, tint: k++, r });
    }
  }

  const monitor = `
  <div style="${abs(-20, SCENE_TOP, 1040, 556, "background:linear-gradient(#2f282f,#221c24);border-radius:0 0 34px 34px;box-shadow:0 30px 44px rgba(60,30,45,.45)")}"></div>
  <div style="${abs(26, SCENE_TOP, 948, 452, "background:linear-gradient(160deg,#3b3340,#26202b);border-radius:0 0 12px 12px;box-shadow:inset 0 0 0 3px #15111a")}"></div>
  <div style="${abs(495, 898, 10, 10, "border-radius:50%;background:#6c5a66")}"></div>`;

  const label = `
  <div style="${abs(92, 552, 816, 176, "transform:rotate(-1.6deg);background:#fffaf2;box-shadow:0 2px 3px rgba(0,0,0,.3),0 18px 26px rgba(0,0,0,.45);display:grid;place-items:center;padding:0 52px;z-index:3")}" data-check="label">
    <div class="hand" style="font:600 62px/1.04 'Hand',cursive;color:#231a1f;text-align:center">${esc(i.items[0])}</div>
  </div>
  <div style="${abs(420, 524, 160, 44, "transform:rotate(-1.6deg);background:rgba(206,214,222,.82);box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:4")}"></div>`;

  const arrow = `
  <svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:4;filter:drop-shadow(0 4px 4px rgba(40,20,5,.25))" viewBox="0 0 1000 1500" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M470 750 C 430 840, 560 880, 616 944" stroke="#fffaf2" stroke-width="22"/><path d="M586 912 L620 952 L640 904" stroke="#fffaf2" stroke-width="22"/>
      <path d="M470 750 C 430 840, 560 880, 616 944" stroke="#231a1f" stroke-width="9"/><path d="M586 912 L620 952 L640 904" stroke="#231a1f" stroke-width="9"/>
    </g>
  </svg>`;

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(120% 80% at 70% 80%,#f7ebee,#f0dde3 60%,#e9d2da)")}"></div>`;

  const leftText = `
  <div style="${abs(60, 1000, 410, 340)}" data-check="items">
    <div class="hand" style="font:600 45px/1.08 'Hand',cursive;color:#231a1f">${esc(i.items[1])}</div>
    <div style="font:600 30px/1.3 'Plex',sans-serif;color:#5f3d4b;margin-top:22px;text-wrap:balance">${esc(i.sub)}</div>
  </div>`;

  const ph = phone({ src: asset("now-one-card.png"), y0: 12, y1: 345, width: 440, tilt: 2, x: 520, y: 964, appBg: "#f4f0f1" });

  const body = `${ground}${monitor}${notes}${label}${arrow}${leftText}${ph}${fh}`;
  return { n, id: `${n}-sticky-note-overload`, html: page(p, { body, css: fc, paper: "#f1e7eb" }) };
}

/* ---------------------------------------------------------------- #37 */
/** A crumpled butter note: an irregular outline with creased facets and a soft shadow. Text is set over it. */
function crumple({ x, y, w, h, rot, seed }) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2;
  const pts = [];
  const N = 22;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2;
    const rr = 0.9 + (r() - 0.5) * 0.2;
    pts.push([cx + Math.cos(a) * (w / 2) * rr, cy + Math.sin(a) * (h / 2) * rr]);
  }
  const poly = pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const hubs = Array.from({ length: 11 }, () => [cx + (r() - 0.5) * w * 0.7, cy + (r() - 0.5) * h * 0.7]);
  let facets = "";
  for (let k = 0; k < N; k++) {
    const a = pts[k], b = pts[(k + 1) % N];
    const hub = hubs[k % hubs.length];
    const lit = r() > 0.5;
    facets += `<polygon points="${a[0].toFixed(1)},${a[1].toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)} ${hub[0].toFixed(1)},${hub[1].toFixed(1)}" fill="${lit ? "#fff7d0" : "#a97a1c"}" fill-opacity="${(lit ? 0.07 + r() * 0.1 : 0.04 + r() * 0.08).toFixed(2)}"/>`;
  }
  let creases = "";
  for (let k = 0; k < 16; k++) {
    const a = pts[Math.floor(r() * N)], hub = hubs[Math.floor(r() * hubs.length)];
    const m = [(a[0] + hub[0]) / 2 + (r() - 0.5) * 30, (a[1] + hub[1]) / 2 + (r() - 0.5) * 30];
    creases += `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${m[0].toFixed(1)} ${m[1].toFixed(1)} ${hub[0].toFixed(1)} ${hub[1].toFixed(1)}" fill="none" stroke="#7a5510" stroke-opacity="${(0.1 + r() * 0.14).toFixed(2)}" stroke-width="${(0.9 + r() * 1.2).toFixed(1)}"/>`;
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 4px 4px rgba(40,25,10,.3)) drop-shadow(0 26px 24px rgba(40,25,10,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><radialGradient id="cr${seed}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#f8e6a4"/><stop offset="1" stop-color="#ecce72"/></radialGradient></defs>
    <polygon points="${poly}" fill="url(#cr${seed})" stroke="#b58a25" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/>${facets}${creases}</svg>`;
}

/** A little paper ball: a crumpled sphere seen from above. */
function paperBall({ x, y, s = 120, seed = 4 }) {
  const r = rng(seed);
  let f = "";
  for (let k = 0; k < 14; k++) {
    const a1 = r() * 6.28, a2 = a1 + 0.5 + r();
    const rr = s * 0.46;
    f += `<polygon points="${s / 2 + (r() - 0.5) * 30},${s / 2 + (r() - 0.5) * 30} ${s / 2 + Math.cos(a1) * rr},${s / 2 + Math.sin(a1) * rr} ${s / 2 + Math.cos(a2) * rr},${s / 2 + Math.sin(a2) * rr}" fill="${r() > 0.5 ? "#fff7d0" : "#a97a1c"}" fill-opacity="${(0.1 + r() * 0.2).toFixed(2)}"/>`;
  }
  return `<svg style="${abs(x, y, s, s, "filter:drop-shadow(0 14px 12px rgba(40,25,10,.4))")}" viewBox="0 0 ${s} ${s}" aria-hidden="true"><circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.46}" fill="#efd27c"/>${f}<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.46}" fill="none" stroke="#7a5510" stroke-opacity=".25" stroke-width="2"/></svg>`;
}

function p37() {
  const n = 37;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f8f1ea", size: 76, textTop: 92, extraCss: `.chip{position:absolute;display:flex;align-items:center;gap:12px;padding:10px 26px 10px 18px;border-radius:999px;font:600 30px "Plex",sans-serif;z-index:3}` });

  const left = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(#e6dfd6,#d9d0c5)")}"></div>`;
  // The right half is a slanted deep-mulberry panel, as the other myth-vs-truth pins have.
  const right = `<div style="${abs(0, SCENE_TOP, 1000, 982, `background:radial-gradient(90% 70% at 70% 30%,#74495a,${C.mulberryDeep} 70%);clip-path:polygon(53% 0,100% 0,100% 100%,43% 100%)`)}"></div>`;

  const mythChip = `<div class="chip" style="left:56px;top:424px;background:#cfc6ba;color:#231a1f">${icon("x-circle", { size: 36, color: "#231a1f", weight: "fill" })}Myth</div>`;
  const truthChip = `<div class="chip" style="left:560px;top:424px;background:#f8f1ea;color:#231a1f">${icon("check-circle", { size: 36, color: C.mulberry, weight: "fill" })}Truth</div>`;

  const mythNote = crumple({ x: 28, y: 508, w: 470, h: 440, rot: -5, seed: 7 });
  const mythText = `<div style="${abs(104, 596, 318, 280, "transform:rotate(-5deg);display:grid;align-items:center")}" data-check="myth">
    <div class="hand" style="font:600 52px/1.12 'Hand',cursive;color:#231a1f;text-decoration:line-through;text-decoration-thickness:5px;text-decoration-color:#5f3d4b">${esc(i.items[0])}</div></div>`;

  const card = `
  <div style="${abs(548, 506, 400, 612, "background:#fffaf2;border-radius:6px;transform:rotate(1.6deg);box-shadow:0 2px 3px rgba(0,0,0,.3),0 30px 44px rgba(10,4,12,.55);background-image:repeating-linear-gradient(transparent 0 49px,#ead9d2 49px 50px);background-position:0 30px")}" data-check="truth">
    <svg style="position:absolute;left:30px;top:30px" width="84" height="84" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="38" fill="${C.mulberry}"/><path d="M22 44 L37 59 L63 27" fill="none" stroke="#fffaf2" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="hand" style="position:absolute;left:34px;right:30px;top:130px;font:600 43px/50px 'Hand',cursive;color:#231a1f">${esc(i.items[1])}<div style="height:26px"></div>${esc(i.items[2])}</div>
  </div>`;

  const ph = phone({ src: screen("life"), y0: 52, y1: 336, width: 430, tilt: -4, x: 36, y: 1030, appBg: "#fbf9fa" });
  const ball = crumple({ x: 600, y: 1200, w: 120, h: 112, rot: 20, seed: 3 });

  const body = `${left}${right}${mythChip}${truthChip}${mythNote}${mythText}${card}${ball}${ph}${fh}`;
  return { n, id: `${n}-adhd-life-admin-without-a-score`, html: page(p, { body, css: fc, paper: "#f8f1ea" }) };
}

/* ---------------------------------------------------------------- #41 */
function tick(color) {
  return `<svg style="position:absolute;left:-4px;top:-18px" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true"><path d="M9 30 L22 43 C 28 28, 38 14, 54 3" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function glass({ x, y, s = 200 }) {
  // A tumbler of water seen from the front and above: rim ellipse, tapering body, water line, highlights.
  return `<svg style="${abs(x, y, s * 0.86, s, "filter:drop-shadow(16px 20px 12px rgba(20,40,60,.4))")}" viewBox="0 0 172 200" aria-hidden="true">
    <defs><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#e3f1f8" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>
    <linearGradient id="wt" x1="0" x2="1"><stop offset="0" stop-color="#cfe6f2"/><stop offset=".5" stop-color="#e6f3f9"/><stop offset="1" stop-color="#a9cde1"/></linearGradient></defs>
    <path d="M10 28 L162 28 L148 178 Q147 192 132 192 L40 192 Q25 192 24 178 Z" fill="url(#gl)" stroke="#fff" stroke-width="3"/>
    <path d="M16 70 L156 70 L146 176 Q145 186 132 186 L40 186 Q27 186 26 176 Z" fill="url(#wt)" fill-opacity=".9"/>
    <ellipse cx="86" cy="70" rx="70" ry="10" fill="#f4fafd" stroke="#8fb7cc" stroke-width="2"/>
    <ellipse cx="86" cy="28" rx="76" ry="13" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/><ellipse cx="86" cy="28" rx="70" ry="9" fill="#dcecf4" fill-opacity=".7"/>
    <path d="M30 48 L40 168" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/><path d="M134 90 L130 160" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="86" cy="186" rx="44" ry="5" fill="#7ea9c1" fill-opacity=".45"/>
    <circle cx="70" cy="120" r="3.5" fill="#fff" fill-opacity=".8"/><circle cx="102" cy="140" r="3" fill="#fff" fill-opacity=".7"/><circle cx="92" cy="100" r="2.5" fill="#fff" fill-opacity=".8"/>
  </svg>`;
}

function pen({ x, y, len = 380, rot = 0 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,30,45,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="#2f3a4a"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".2"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="#c9ccd2"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="#c9ccd2"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#22252b"/></svg>`;
}

function p41() {
  const n = 41;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9eef1", size: 76, textTop: 92 });

  const desk = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(110% 80% at 25% 15%,#c4d3de,#a3b8c8 70%,#92a9bb)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 2px,transparent 2px 7px),repeating-linear-gradient(0deg,rgba(40,70,100,.05) 0 2px,transparent 2px 6px)")}"></div>`;

  // The spiral pad: a back board, a paper block, ruled lines, a row of wire loops.
  const PX = 34, PY = 436, PW = 566, PH = 840;
  const rings = Array.from({ length: 11 }, (_, k) => {
    const rx = 36 + k * 47;
    return `<g><ellipse cx="${rx}" cy="26" rx="9" ry="7" fill="#7f95a6"/><path d="M${rx - 5} 30 C ${rx - 6} -10, ${rx + 18} -14, ${rx + 18} 30" fill="none" stroke="#dfe5ea" stroke-width="6" stroke-linecap="round"/><path d="M${rx - 5} 30 C ${rx - 6} -10, ${rx + 18} -14, ${rx + 18} 30" fill="none" stroke="#8d9aa6" stroke-width="2" stroke-linecap="round" transform="translate(1 2)"/></g>`;
  }).join("");
  const LH = 54; // line pitch
  const row = (text, ticked, mt) => `
    <div style="position:relative;margin-top:${mt}px;padding-left:92px;font:600 44px/${LH}px 'Hand',cursive;color:#231a1f">
      <div style="position:absolute;left:20px;top:7px;width:42px;height:42px;border:4px solid #3a2f36;border-radius:7px;transform:rotate(-2deg)">${ticked ? tick(C.mulberry) : ""}</div>${esc(text)}
    </div>`;
  const pad = `
  <div style="${abs(PX, PY, PW, PH, "transform:rotate(-2.4deg)")}">
    <div style="position:absolute;left:10px;top:14px;right:-10px;bottom:-14px;background:#7b8f9f;border-radius:14px;box-shadow:0 30px 44px rgba(20,40,60,.45)"></div>
    <div style="position:absolute;inset:0;background:#fffdf8;border-radius:12px;box-shadow:0 2px 3px rgba(20,40,60,.3);background-image:linear-gradient(90deg,transparent 78px,#ecc2cd 78px 80px,transparent 80px),repeating-linear-gradient(transparent 0 ${LH - 2}px,#c9d6e3 ${LH - 2}px ${LH}px);background-position:0 0,0 118px;overflow:hidden"></div>
    <svg style="position:absolute;left:0;top:-4px;width:${PW}px;height:60px;overflow:visible" viewBox="0 0 ${PW} 60" aria-hidden="true"><rect x="8" y="14" width="${PW - 16}" height="36" rx="8" fill="#8d9fae" opacity=".35"/>${rings}</svg>
    <div style="position:absolute;left:0;top:78px;width:${PW - 70}px" data-check="pad">
      <div style="padding-left:92px;font:700 56px/${LH + 6}px 'Hand',cursive;color:#231a1f;margin-bottom:${LH - 6}px">${esc(i.sub)}</div>
      ${i.items.map((t, k) => row(t, k < 2, k ? 14 : 0)).join("")}
    </div>
  </div>`;

  const ph = phone({ src: asset("billing-worth-having.png"), y0: 0, y1: 549, width: 430, tilt: 2, x: 538, y: 520, closed: true, appBg: "#f4f0f1" });
  const water = glass({ x: 322, y: 1090, s: 230 });
  const biro = pen({ x: 620, y: 1290, len: 360, rot: -6 });

  const body = `${desk}${pad}${ph}${water}${biro}${fh}`;
  return { n, id: `${n}-billing-problem-checklist`, html: page(p, { body, css: fc, paper: "#e9eef1" }) };
}

export const pins = [p33(), p37(), p41()];
