/**
 * Home Base pins, group N: desk with binders.
 * Home binder guide pins #75, #77, #79, #81, #83, #85, #87.
 *
 * Ring binders, index dividers, a label maker, a hole punch, sticky tabs,
 * sheet protectors, a cork board. Seven different desks. Printed workbook
 * pages (book page 6) are placed exactly as printed; the tick and plus
 * badges sit beside a page, never on it. Words are the idea bank's.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";
import { desk, sheet, pencil, mug } from "../kit/paper.mjs";
import { bookPage, screen } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const items = (n) => idea(n).items;
const SH = "box-shadow:0 3px 4px rgba(30,20,8,.28),0 16px 26px rgba(30,20,8,.34)";

/* ---------- props ---------- */

/** Three binder rings (open, seen from above) down a vertical line at cx. */
function rings(cx, ys, { r = 30 } = {}) {
  return ys.map((y) => `<svg style="${abs(cx - r - 6, y - r, r * 2 + 12, r * 2, "filter:drop-shadow(0 5px 3px rgba(20,15,5,.4))")}" viewBox="0 0 ${r * 2 + 12} ${r * 2}" aria-hidden="true"><ellipse cx="${r + 6}" cy="${r}" rx="${r}" ry="${r * 0.62}" fill="none" stroke="#9aa0a6" stroke-width="9"/><ellipse cx="${r + 6}" cy="${r}" rx="${r}" ry="${r * 0.62}" fill="none" stroke="#e8ebee" stroke-width="3" transform="translate(-1 -2)"/><rect x="${r - 18}" y="${r - 9}" width="48" height="18" rx="5" fill="#c4c8cd"/></svg>`).join("");
}

/** A hole punch: steel base, a red-free sage lever. */
function holePunch({ x, y, s = 1, rot = 0 }) {
  return `<svg style="${abs(x, y, 210 * s, 130 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(30,20,8,.4))`)}" viewBox="0 0 210 130" aria-hidden="true">
    <rect x="6" y="60" width="198" height="56" rx="12" fill="#6f7780"/><rect x="6" y="60" width="198" height="14" rx="8" fill="#a9b0b7"/>
    <rect x="22" y="96" width="166" height="12" rx="5" fill="#2d3236" opacity=".5"/>
    <path d="M14 62 C 14 28, 60 14, 150 14 L196 18 Q 206 20 206 34 L206 62 Z" fill="${C.sageDeep}"/><path d="M14 62 C 14 36, 60 22, 150 22 L200 26 L206 34 L206 62 Z" fill="${C.sage}" opacity=".75"/>
    <rect x="20" y="30" width="86" height="8" rx="4" fill="#fff" opacity=".28"/><circle cx="178" cy="40" r="8" fill="#cfd6d1"/></svg>`;
}

/** A label maker: a chunky sage body with keys and a tape slot (no printed words). */
function labelMaker({ x, y, s = 1, rot = 0 }) {
  return `<svg style="${abs(x, y, 300 * s, 150 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(30,20,8,.4))`)}" viewBox="0 0 300 150" aria-hidden="true">
    <rect x="6" y="8" width="288" height="134" rx="26" fill="${C.sageDeep}"/><rect x="6" y="8" width="288" height="30" rx="20" fill="#fff" opacity=".13"/>
    <rect x="30" y="26" width="150" height="38" rx="8" fill="#cfe0d2"/><rect x="42" y="38" width="102" height="9" rx="4" fill="${C.sageDeep}" opacity=".55"/>
    <rect x="196" y="24" width="78" height="42" rx="10" fill="#e6ede2"/><path d="M196 54 H274" stroke="#bccab8" stroke-width="3"/>
    ${Array.from({ length: 21 }, (_, k) => `<rect x="${30 + (k % 7) * 36}" y="${80 + Math.floor(k / 7) * 19}" width="28" height="14" rx="4" fill="#eef2ea" opacity=".92"/>`).join("")}
    <rect x="262" y="76" width="22" height="50" rx="6" fill="${C.butter}"/></svg>`;
}

/** A small pad of sticky flags in a few colours. */
function flags({ x, y, rot = 0, s = 1 }) {
  const cols = [C.butter, "#cfe0c4", "#e9c9a8", "#d7e3e8"];
  return `<svg style="${abs(x, y, 150 * s, 120 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(30,20,8,.38))`)}" viewBox="0 0 150 120" aria-hidden="true">
    <rect x="30" y="10" width="110" height="100" rx="5" fill="#f6efd8"/>
    ${cols.map((c, k) => `<rect x="${12 + k * 4}" y="${22 + k * 22}" width="${70 + k * 6}" height="18" rx="3" fill="${c}"/>`).join("")}
    <rect x="30" y="10" width="110" height="100" rx="5" fill="none" stroke="#000" stroke-opacity=".08"/></svg>`;
}

/** A translucent sheet protector (punched edge on the left). */
function protector({ x, y, w, h, tilt = 0, tint = "rgba(230,242,240,.55)", edge = "rgba(255,255,255,.9)" }) {
  const holes = [0.2, 0.5, 0.8].map((f) => `<div style="position:absolute;left:12px;top:${f * h - 8}px;width:16px;height:16px;border-radius:50%;background:rgba(40,60,50,.28)"></div>`).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:${tint};border:2px solid ${edge};border-left:34px solid rgba(255,255,255,.7);border-radius:4px;box-shadow:0 2px 3px rgba(30,20,8,.2),0 12px 18px rgba(30,20,8,.3)`)}">${holes}<div style="position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.55) 0,transparent 30%,transparent 62%,rgba(255,255,255,.25) 80%,transparent)"></div></div>`;
}

/** A binder lying closed seen from above: spine on the left, an empty label slot. */
function closedBinder({ x, y, w, h, cover = C.sageDeep, tilt = 0 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:linear-gradient(135deg,${cover},${C.sage});border-radius:8px 14px 14px 8px;${SH}`)}">
    <div style="position:absolute;left:0;top:0;bottom:0;width:${Math.round(w * 0.14)}px;background:linear-gradient(90deg,rgba(0,0,0,.25),rgba(0,0,0,.05));border-radius:8px 0 0 8px"></div>
    <div style="position:absolute;left:${Math.round(w * 0.24)}px;top:${Math.round(h * 0.2)}px;width:${Math.round(w * 0.46)}px;height:${Math.round(h * 0.26)}px;background:#f2f0e6;border-radius:5px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)"></div>
    <div style="position:absolute;inset:0;border-radius:inherit;background:linear-gradient(115deg,rgba(255,255,255,.14),transparent 40%)"></div></div>`;
}

/** A round step number disc. */
const disc = (t, size = 56, bg = C.sageDeep, fg = "#fff", fs = 0.52) =>
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${fg};display:grid;place-items:center;flex:none;font:700 ${Math.round(size * fs)}px 'Newsreader',Georgia,serif;box-shadow:0 3px 6px rgba(20,30,20,.3)">${t}</div>`;
const idisc = (name, size = 56, bg = C.sageDeep, fg = "#fff") =>
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:grid;place-items:center;flex:none;box-shadow:0 3px 6px rgba(20,30,20,.3)">${icon(name, { size: Math.round(size * 0.58), color: fg, weight: "bold" })}</div>`;

/* =============================================================
   #75  Five tabbed dividers staggered down an open binder, oak desk
   ============================================================= */
function pin75() {
  const labels = items(75);
  const tabCols = ["#b7cdb7", "#e3cf9f", "#c5d6c0", "#ecdcb6", "#a9c4b0"];
  const TY = (k) => 468 + k * 134;
  const tab = (k) => `<div style="${abs(660, TY(k), 330, 98, `background:linear-gradient(${tabCols[k]},${tabCols[k]}ee);border-radius:0 18px 18px 0;box-shadow:0 3px 3px rgba(30,20,8,.25),0 10px 16px rgba(30,20,8,.3);display:flex;align-items:center;gap:14px;padding:0 14px 0 14px`)}">
    ${disc(k + 1, 52)}<div style="font-size:25px;line-height:1.1;font-weight:700;color:#1a2420">${esc(labels[k])}</div></div>`;
  const body = (k, extra = "") => `<div style="${abs(372, TY(k) - 52 - k * 6, 296, 760, `background:${tabCols[k]};border-radius:6px 0 0 6px;box-shadow:-2px 4px 8px rgba(30,20,8,.2);${extra}`)}"></div>`;
  const front = `<div style="${abs(372, TY(0) - 52, 618, 790, "transform:rotate(-2.2deg);transform-origin:0% 55%;filter:drop-shadow(0 26px 22px rgba(30,20,8,.45))")}">
      <div style="position:absolute;left:0;top:52px;width:296px;height:738px;background:#f4ecd6;border-radius:6px 0 0 6px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.08)">
        <div class="serif" style="position:absolute;left:34px;top:46px;font-size:210px;line-height:1;font-weight:500;color:${C.sage};opacity:.9">1</div>
        <div class="serif" style="position:absolute;left:34px;top:300px;width:230px;font-size:40px;line-height:1.08;font-weight:600;color:#1a2420">${esc(labels[0])}</div>
        <div style="position:absolute;left:34px;top:500px;width:228px;border-top:3px solid ${C.sage};opacity:.5"></div>
      </div>
      <div style="${abs(288, 52, 330, 98, `background:linear-gradient(${tabCols[0]},${tabCols[0]}ee);border-radius:0 18px 18px 0;display:flex;align-items:center;gap:14px;padding:0 14px 0 14px;${SH}`)}">${disc(1, 52)}<div style="font-size:25px;line-height:1.1;font-weight:700;color:#1a2420">${esc(labels[0])}</div></div>
    </div>`;
  const tag = `<div style="${abs(776, 396, 190, 54, `transform:rotate(5deg);background:${C.ochre};color:#fff;border-radius:10px;display:grid;place-items:center;font:700 28px 'Plex',sans-serif;letter-spacing:.04em;${SH}`)}">tonight</div><div style="${abs(760, 428, 46, 6, "background:#6a460c;border-radius:3px;transform:rotate(-12deg)")}"></div>`;
  const left = `<div style="${abs(30, 420, 760, 860, `background:linear-gradient(135deg,${C.sageDeep},#3b6249);border-radius:20px;box-shadow:0 4px 6px rgba(30,20,8,.35),0 34px 50px rgba(30,20,8,.5)`)}"></div>
    <div style="${abs(58, 456, 312, 790, "background:#fbfaf6;border-radius:6px;box-shadow:0 2px 4px rgba(0,0,0,.25);background-image:repeating-linear-gradient(transparent 0 46px,#d9e0d6 46px 48px);background-position:0 30px")}"></div>`;
  return `${desk({ base: "#cf9f68", dark: "#b5874f", planks: 5, seed: 7 })}
    ${left}${rings(372, [540, 850, 1160])}
    ${[4, 3, 2, 1].map((k) => body(k)).join("")}${[4, 3, 2, 1].map(tab).join("")}${front}${tag}
    ${holePunch({ x: 770, y: 1196, s: 1, rot: -8 })}
    ${flags({ x: 56, y: 1262, s: 0.9, rot: -6 })}${pencil({ x: 230, y: 1306, len: 400, rot: -2 })}`;
}

/* =============================================================
   #77  Supplies flat-lay: four callouts on a sage cutting mat
   ============================================================= */
function pin77() {
  const t = items(77);
  const cell = (cx, cy, k, obj, icn) => `
    ${obj}
    <div style="${abs(cx, cy + 262, 450, 180, `background:linear-gradient(#d7b783,#c8a679);border-radius:10px 24px 24px 10px;${SH};display:flex;gap:16px;align-items:center;padding:14px 20px`)}">
      ${disc(k, 54, C.sageDeep)}<div style="font-size:25px;line-height:1.26;color:#241d10;font-weight:500">${esc(t[k - 1])}</div></div>
    <div style="${abs(cx + 36, cy + 224, 6, 40, `background:${C.sageDeep}`)}"></div>`;
  const mat = `<div style="${abs(0, SCENE_TOP, 1000, 982, `background:#6f9a7c;background-image:linear-gradient(rgba(255,255,255,.14) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(255,255,255,.14) 1.5px,transparent 1.5px),linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:100px 100px,100px 100px,20px 20px,20px 20px;box-shadow:inset 0 0 90px rgba(15,40,25,.35)`)}"></div>`;
  const X1 = 30, X2 = 520, Y1 = 396, Y2 = 880;
  // 1: closed binder and a single folder behind it
  const o1 = `<div style="${abs(X1 + 120, Y1 + 8, 260, 200, `transform:rotate(7deg);background:linear-gradient(#e0c080,#d1ad66);border-radius:6px 16px 6px 6px;${SH}`)}"></div>
    <div style="${abs(X1 + 120, Y1 - 4, 110, 24, "transform:rotate(7deg);background:#d8b673;border-radius:8px 8px 0 0")}"></div>
    ${closedBinder({ x: X1 + 24, y: Y1 + 20, w: 250, h: 214, tilt: -4 })}`;
  // 2: sheet protectors and a mug
  const o2 = `${protector({ x: X2 + 40, y: Y1 + 26, w: 220, h: 200, tilt: -6 })}${protector({ x: X2 + 56, y: Y1 + 16, w: 220, h: 200, tilt: -1, tint: "rgba(235,246,243,.5)" })}${protector({ x: X2 + 70, y: Y1 + 8, w: 220, h: 200, tilt: 4, tint: "rgba(240,248,245,.45)" })}
    ${mug({ x: X2 + 300, y: Y1 + 60, size: 150 })}`;
  // 3: five kraft dividers fanned
  const kr = ["#d3b180", "#c9a672", "#dcbd8e", "#c4a06c", "#d6b585"];
  const o3 = kr.map((c, k) => `<div style="${abs(X1 + 40 + k * 56, Y2 + 12 + k * 4, 170, 206, `transform:rotate(${-8 + k * 4}deg);transform-origin:50% 100%;background:${c};border-radius:5px;box-shadow:0 3px 4px rgba(30,20,8,.28),0 10px 16px rgba(30,20,8,.3)`)}"><div style="position:absolute;left:${20 + (k % 3) * 30}px;top:-22px;width:62px;height:24px;background:${c};border-radius:8px 8px 0 0;filter:brightness(.93)"></div></div>`).join("");
  // 4: laptop with a five-subfolder tree
  const bar = (w) => `<div style="height:9px;width:${w}px;background:#b9c6bd;border-radius:5px"></div>`;
  const kids = [0, 1, 2, 3, 4].map((k) => `<div style="display:flex;align-items:center;gap:8px;margin:3px 0 3px 26px">${icon("folder", { size: 28, color: C.sageDeep, weight: "fill" })}${bar(60 + (k % 3) * 18)}</div>`).join("");
  const o4 = `<div style="${abs(X2 + 20, Y2 + 10, 400, 214, `background:linear-gradient(#2d3338,#1f2428);border-radius:14px;${SH}`)}"><div style="position:absolute;inset:12px;background:#f6f3ea;border-radius:6px;padding:10px 16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">${icon("folder-open", { size: 30, color: C.sageDeep, weight: "fill" })}${bar(90)}</div>${kids}</div></div>
    <div style="${abs(X2 + 4, Y2 + 222, 432, 22, "background:linear-gradient(#cfd4d8,#9aa1a7);border-radius:0 0 18px 18px;box-shadow:0 10px 14px rgba(15,30,20,.4)")}"></div>`;
  return `${mat}${cell(X1, Y1, 1, o1)}${cell(X2, Y1, 2, o2)}${cell(X1, Y2, 3, o3)}${cell(X2, Y2, 4, o4)}`
    .replace(/\n\s+/g, "\n");
}

/* =============================================================
   #79  Filled-in table of contents on a dark walnut desk
   ============================================================= */
function pin79() {
  const rows = items(79).map((s) => { const m = s.match(/^(\d)\. (.+?): (.+)$/); return { n: m[1], name: m[2], text: m[3] }; });
  const row = (r, k) => `<div style="position:absolute;left:58px;right:58px;top:${126 + k * 134}px;height:122px;border-top:2px solid #cdd6c8;display:flex;gap:20px;align-items:flex-start;padding-top:16px">
      ${disc(r.n, 54, C.sage)}<div><div class="serif" style="font-size:37px;line-height:1.05;font-weight:600;color:${C.sageDeep}">${esc(r.name)}</div><div style="font-size:26px;line-height:1.27;margin-top:7px;color:#2b2e2b">${esc(r.text)}</div></div></div>`;
  const pg = `<div style="${abs(48, 410, 800, 880, `transform:rotate(-1.6deg);background:#fdfbf4;border-radius:4px;box-shadow:0 3px 4px rgba(0,0,0,.35),0 26px 44px rgba(0,0,0,.5)`)}">
      <div style="position:absolute;left:58px;top:44px;font:600 24px 'Plex',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${C.sage}">Table of Contents</div>
      <div class="example" style="position:absolute;right:50px;top:30px;font-size:24px;padding:6px 12px;color:#4b4339;transform:rotate(4deg)">Example</div>
      ${rows.map(row).join("")}</div>`;
  const spine = `<div style="${abs(836, 384, 150, 900, `transform:rotate(1.2deg);background:linear-gradient(90deg,#2f4a38,${C.sageDeep} 40%,#2b4635);border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.4),0 30px 40px rgba(0,0,0,.5)`)}">
      <div style="position:absolute;left:46px;top:210px;width:58px;height:440px;background:#efeadc;border-radius:5px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.15)"></div>
      <div style="position:absolute;left:0;top:40px;width:150px;height:10px;background:rgba(255,255,255,.12)"></div><div style="position:absolute;left:0;bottom:40px;width:150px;height:10px;background:rgba(255,255,255,.12)"></div></div>`;
  return `${desk({ base: "#7a5233", dark: "#5e3d22", planks: 7, seed: 11 })}
    ${spine}${pg}${pencil({ x: 120, y: 1308, len: 460, rot: -1.5, body: "#e7b23f" })}${labelMaker({ x: 668, y: 1244, s: 0.52, rot: 6 })}`;
}

/* =============================================================
   #81  Five-paper checklist card on a cork board, binder on the ledge
   ============================================================= */
function pin81() {
  const t = items(81);
  const cork = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:#c79e68;background-image:radial-gradient(rgba(110,70,30,.28) 1.6px,transparent 2.2px),radial-gradient(rgba(255,235,200,.28) 1.4px,transparent 2px),radial-gradient(rgba(90,55,20,.2) 3px,transparent 3.6px);background-size:23px 19px,31px 27px,53px 47px;background-position:0 0,11px 8px,5px 14px;box-shadow:inset 0 0 120px rgba(70,40,10,.4)")}"></div>`;
  const row = (s, k) => `<div style="position:absolute;left:44px;right:44px;top:${92 + k * 118}px;height:104px;display:flex;align-items:center;gap:26px;border-bottom:2px dotted #cdd6c8">
      <div style="flex:none;width:50px;height:50px;border:5px solid ${C.sage};border-radius:11px;background:#fff"></div><div style="font-size:31px;line-height:1.2;color:#1a2420;font-weight:500">${esc(s)}</div></div>`;
  const card = `<div style="${abs(50, 420, 710, 700, `transform:rotate(-1.4deg);background:#fdfcf7;border-radius:6px;box-shadow:0 3px 4px rgba(40,25,8,.3),0 24px 40px rgba(40,25,8,.45)`)}">
      <div style="position:absolute;left:0;right:0;top:0;height:14px;background:${C.sage};border-radius:6px 6px 0 0"></div>${t.map(row).join("")}</div>`;
  const pushpin = (x, y, c) => `<div style="${abs(x, y, 34, 34, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff9 0,transparent 40%),${c};box-shadow:0 8px 8px rgba(40,25,8,.45)`)}"></div>`;
  const bclip = `<svg style="${abs(330, 384, 110, 100, "transform:rotate(-2deg);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))")}" viewBox="0 0 100 80" aria-hidden="true"><path d="M26 34 C 20 6, 80 6, 74 34" fill="none" stroke="#b9bcc2" stroke-width="5" stroke-linecap="round"/><path d="M8 80 L14 30 Q 50 22 86 30 L92 80 Z" fill="#26282d"/><path d="M14 30 Q 50 22 86 30 L88 40 Q 50 32 12 40 Z" fill="#40434a"/></svg>`;
  const spine = (x, h, col, w = 96) => `<div style="${abs(x, 1262 - h, w, h, `background:linear-gradient(90deg,rgba(0,0,0,.25),transparent 25%,rgba(255,255,255,.1) 60%,rgba(0,0,0,.2)),${col};border-radius:7px 7px 2px 2px;box-shadow:0 8px 14px rgba(40,25,8,.45)`)}"><div style="position:absolute;left:${w / 2 - 17}px;top:${h * 0.22}px;width:34px;height:${h * 0.52}px;background:#efeadc;border-radius:4px;box-shadow:inset 0 0 0 2px rgba(0,0,0,.14)"></div></div>`;
  const ledge = `<div style="${abs(0, 1262, 1000, 44, "background:linear-gradient(#e4be86,#b9894c);box-shadow:0 12px 16px rgba(40,25,8,.45)")}"></div>`;
  const sleeve = `<div style="${abs(836, 1052, 118, 150, "transform:rotate(3deg);background:rgba(236,246,244,.62);border:2px solid rgba(255,255,255,.9);border-radius:4px;box-shadow:0 8px 12px rgba(40,25,8,.35)")}"><div style="position:absolute;left:14px;right:14px;top:22px;height:9px;background:#d4ded8;border-radius:5px"></div><div style="position:absolute;left:14px;right:34px;top:48px;height:9px;background:#d4ded8;border-radius:5px"></div></div>`;
  return `${cork}${spine(800, 196, C.sageDeep)}${sleeve}${spine(742, 168, "#59745f", 78)}${spine(890, 214, C.sage, 88)}
    ${card}${bclip}${pushpin(78, 440, "#d9b24a")}${pushpin(700, 456, "#7fa38a")}${ledge}
    ${pencil({ x: 80, y: 1296, len: 360, rot: -2 })}${flags({ x: 480, y: 1214, s: 0.8, rot: 8 })}`;
}

/* =============================================================
   #83  Three vignette tiles and a kraft "What never goes in" card, cool linen
   ============================================================= */
function pin83() {
  const i = idea(83);
  const caps = [i.items[1], i.items[2], i.items[3]];
  const person = (x, y, body, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="0" r="26" fill="#e3b995"/><path d="M-26 -6 Q0 -40 26 -6 Q10 -16 -26 -6Z" fill="#4a3a2c"/><rect x="-32" y="30" width="64" height="104" rx="26" fill="${body}"/><rect x="-24" y="120" width="19" height="62" rx="9" fill="#3d4a55"/><rect x="5" y="120" width="19" height="62" rx="9" fill="#3d4a55"/></g>`;
  const binder = (x, y, w, h, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect width="${w}" height="${h}" rx="7" fill="${C.sageDeep}"/><rect x="${w * 0.18}" y="${h * 0.18}" width="${w * 0.6}" height="${h * 0.26}" rx="3" fill="#f2f0e6"/><rect width="${w * 0.1}" height="${h}" rx="5" fill="#000" opacity=".2"/></g>`;
  const t1 = `<rect width="290" height="360" fill="#dfe9de"/><rect x="150" y="30" width="120" height="330" fill="#c9a66f"/><rect x="164" y="46" width="92" height="314" fill="#efe3c8"/><circle cx="244" cy="212" r="7" fill="#7a5a2a"/><rect x="0" y="332" width="290" height="28" fill="#b7c6b3"/>
    ${person(66, 130, "#d29a52", 1.02)}${person(206, 128, C.sage, 1.02)}${binder(92, 200, 70, 92, -6)}<path d="M62 190 Q80 232 106 244" stroke="#e3b995" stroke-width="15" fill="none" stroke-linecap="round"/><path d="M178 192 Q150 232 134 244" stroke="#e3b995" stroke-width="15" fill="none" stroke-linecap="round"/>`;
  const t2 = `<rect width="290" height="360" fill="#f1ead4"/><rect x="38" y="190" width="214" height="150" rx="4" fill="#fdfbf4" transform="rotate(-3 145 265)"/><g stroke="#cdd6c8" stroke-width="5" transform="rotate(-3 145 265)"><path d="M62 220 H190 M62 246 H226 M62 272 H170 M62 298 H212"/></g>
    <g transform="rotate(8 190 120)"><rect x="118" y="26" width="124" height="214" rx="22" fill="#23272c"/><rect x="128" y="40" width="104" height="180" rx="10" fill="#a9bfa5"/><circle cx="224" cy="52" r="5" fill="#3a3f45"/></g>
    <g stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" transform="rotate(8 190 120)"><path d="M140 62 v-10 h12 M208 52 h12 v10 M140 198 v10 h12 M208 208 h12 v-10"/></g>`;
  const t3 = `<rect width="290" height="360" fill="#e6ece1"/><g stroke="#cdd6c8" stroke-width="3"><path d="M0 70 H290 M0 120 H290 M0 170 H290 M0 220 H290 M0 270 H290 M70 20 V290 M150 20 V290 M230 20 V290"/></g>
    <rect x="0" y="262" width="290" height="98" fill="#c99b66"/><rect x="0" y="262" width="290" height="14" fill="#e0b985"/>
    <g transform="translate(20 188)"><path d="M0 74 L128 50 V12 L0 38 Z" fill="${C.sageDeep}"/><path d="M256 74 L128 50 V12 L256 38 Z" fill="#3b6249"/><path d="M8 70 L128 47 L248 70 V80 L128 58 L8 80 Z" fill="#fbfaf6"/><path d="M20 36 L128 14 L236 36" stroke="#e6ede2" stroke-width="7" fill="none"/></g>
    <g transform="translate(206 190)"><path d="M0 0 H46 V62 Q23 76 0 62Z" fill="#f3ede4"/><path d="M46 14 C74 12 74 54 46 52" fill="none" stroke="#f3ede4" stroke-width="10"/></g>`;
  const tile = (svg, k) => `<div style="${abs(40 + k * 315, 396, 290, 360, `border-radius:20px;overflow:hidden;${SH}`)}"><svg viewBox="0 0 290 360" width="290" height="360" aria-hidden="true">${svg}</svg></div>
    <div style="${abs(40 + k * 315, 766, 290, 70, "font-size:26px;line-height:1.2;font-weight:700;color:#1a2420;text-align:center;display:grid;place-items:center")}">${esc(caps[k])}</div>`;
  const card = `<div style="${abs(40, 858, 920, 436, `transform:rotate(-.5deg);background:linear-gradient(#d7b783,#c8a679);border-radius:8px 26px 26px 8px;${SH};overflow:hidden`)}">
      <div style="position:absolute;left:0;top:0;bottom:0;width:14px;background:${C.ochre}"></div>
      <div class="serif" style="position:absolute;left:64px;top:36px;font-size:52px;font-weight:600;color:#1a2420">What never goes in</div>
      <div style="position:absolute;left:64px;right:50px;top:122px;display:flex;gap:20px;align-items:center">${idisc("lock-key", 58)}<div style="font-size:32px;line-height:1.2;color:#241d10;font-weight:500">${esc(i.items[0])}</div></div>
      <div style="position:absolute;left:64px;right:50px;top:228px;border-top:3px solid rgba(36,29,16,.25)"></div>
      <div style="position:absolute;left:64px;right:50px;top:262px;display:flex;gap:20px;align-items:center">${idisc("map-pin", 58, C.sage)}<div class="serif" style="font-size:42px;line-height:1.1;color:#1a2420;font-weight:600">${esc(i.items[4])}</div></div>
    </div>`;
  const bg = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:#dbe4e4;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.22) 0 2px,transparent 2px 7px),repeating-linear-gradient(90deg,rgba(60,90,90,.06) 0 2px,transparent 2px 7px);box-shadow:inset 0 0 120px rgba(40,70,70,.25)")}"></div>`;
  return `${bg}${[t1, t2, t3].map(tile).join("")}${card}${pencil({ x: 80, y: 1312, len: 380, rot: -1, body: C.sage })}${flags({ x: 760, y: 1240, s: 0.8, rot: 5 })}`;
}

/* =============================================================
   #85  Paper (a kraft binder open to the real page) and an app (a real screen)
   ============================================================= */
function pin85() {
  const t = items(85);
  const bg = `<div style="${abs(0, SCENE_TOP, 545, 982, "background:#e8dcc2;background-image:repeating-linear-gradient(90deg,rgba(150,120,70,.08) 0 2px,transparent 2px 9px);box-shadow:inset 0 0 90px rgba(100,70,30,.25)")}"></div>
    <div style="${abs(545, SCENE_TOP, 455, 982, "background:#cfdecd;background-image:radial-gradient(rgba(60,100,70,.12) 1.4px,transparent 2px);background-size:13px 13px;box-shadow:inset 0 0 90px rgba(40,80,50,.25)")}"></div>`;
  const cover = `<div style="${abs(8, 396, 600, 640, `transform:rotate(-2deg);background:linear-gradient(135deg,#cfae78,#bd9a62);border-radius:14px;${SH}`)}"></div>`;
  const pg = sheet({ src: bookPage(6), x: 22, y: 416, w: 548, tilt: -2, crop: { x0: 0, y0: 0, x1: 1, y1: 0.74 }, id: "pg" });
  const ph = phone({ src: screen("seasons"), y0: 56, y1: 560, width: 430, tilt: 2.5, x: 548, y: 420 });
  const plus = `<div style="${abs(522, 640, 76, 76, `border-radius:50%;background:${C.sageDeep};display:grid;place-items:center;border:5px solid #fbfaf6;${SH};z-index:4`)}">${icon("plus", { size: 40, color: "#fff", weight: "bold" })}</div>`;
  const blk = (ic, text, x, y, w) => `<div style="${abs(x, y, w, 150, "display:flex;gap:16px;align-items:flex-start")}">${idisc(ic, 54, C.sageDeep)}<div style="font-size:27px;line-height:1.24;color:#1a2420;font-weight:600">${esc(text)}</div></div>`;
  const banner = `<div style="${abs(40, 1226, 920, 84, `background:linear-gradient(${C.sage},${C.sageDeep});border-radius:42px;${SH};display:flex;align-items:center;justify-content:center;gap:18px;color:#fff;font:600 38px 'Newsreader',Georgia,serif`)}" data-check="banner">${icon("plus-circle", { size: 44, color: "#fff", weight: "bold" })}${esc(t[3])}</div>`;
  return `${bg}${cover}${rings(36, [520, 700, 880], { r: 26 })}${pg}${ph}${plus}
    ${blk("notebook", t[0], 40, 1030, 470)}${blk("hourglass", t[1], 40, 1136, 470)}${blk("device-mobile", t[2], 560, 1030, 400)}${banner}`;
}

/* =============================================================
   #87  A stalled binder on a closet shelf, and the one real page that is still worth having
   ============================================================= */
function pin87() {
  const t = items(87);
  const left = `<div style="${abs(0, SCENE_TOP, 340, 982, "background:linear-gradient(#cfcabd,#b4ae9f);box-shadow:inset -30px 0 40px rgba(40,35,20,.3),inset 0 40px 60px rgba(40,35,20,.28)")}"></div>
    <div style="${abs(40, 430, 240, 150, "background:linear-gradient(#bfa77c,#a98f63);border-radius:5px;box-shadow:0 10px 16px rgba(30,25,10,.35)")}"><div style="position:absolute;left:0;right:0;top:0;height:26px;background:#cbb68c;border-radius:5px 5px 0 0"></div></div>
    <div style="${abs(0, 1052, 340, 36, "background:linear-gradient(#b99b6a,#8f7348);box-shadow:0 14px 18px rgba(30,25,10,.45)")}"></div>
    <div style="${abs(0, 580, 340, 8, "background:#8f7348;opacity:.0")}"></div>`;
  const stalled = `<div style="${abs(30, 922, 290, 130, "background:linear-gradient(#7f9a86,#5d7a66);border-radius:8px 8px 4px 4px;box-shadow:0 10px 16px rgba(30,25,10,.4)")}"><div style="position:absolute;left:14px;right:14px;top:14px;height:12px;background:rgba(255,255,255,.35);border-radius:6px"></div><div style="position:absolute;left:20px;top:44px;width:150px;height:46px;background:#efeadc;border-radius:5px;opacity:.9"></div></div>
    <div style="${abs(58, 906, 250, 20, "background:#f7f5ee;border-radius:3px;box-shadow:0 2px 3px rgba(30,25,10,.3)")}"></div><div style="${abs(66, 892, 236, 16, "background:#fbfaf6;border-radius:3px;box-shadow:0 2px 3px rgba(30,25,10,.3)")}"></div>
    <div style="${abs(0, SCENE_TOP, 340, 982, "background:rgba(70,70,60,.22)")}"></div>`;
  const right = `<div style="${abs(340, SCENE_TOP, 660, 982, "")}">${desk({ base: "#d9ac74", dark: "#c1925a", planks: 4, seed: 5 }).replace("top:0px", "top:0px")}</div>`;
  const right2 = `<div style="${abs(340, SCENE_TOP, 660, 982, "overflow:hidden")}"><div style="position:absolute;left:-340px;top:-${SCENE_TOP}px">${desk({ base: "#d9ac74", dark: "#c1925a", planks: 5, seed: 5 })}</div></div>
    <div style="${abs(340, SCENE_TOP, 6, 982, "background:#fbfaf6;box-shadow:0 0 14px rgba(0,0,0,.35)")}"></div>`;
  const cover = `<div style="${abs(366, 396, 624, 810, `transform:rotate(1.2deg);background:linear-gradient(135deg,${C.sageDeep},#3b6249);border-radius:16px;${SH}`)}"></div>`;
  const pg = sheet({ src: bookPage(6), x: 392, y: 420, w: 586, tilt: 1.2, id: "pg" });
  const tick = `<div style="${abs(884, 1134, 112, 112, `border-radius:50%;background:${C.sage};border:6px solid #fbfaf6;display:grid;place-items:center;${SH}`)}">${icon("check", { size: 66, color: "#fff", weight: "bold" })}</div>`;
  const chip = (ic, text, x, y, w, h) => `<div style="${abs(x, y, w, h, `background:#fbfaf6;border-radius:22px;${SH};display:flex;gap:14px;align-items:center;padding:0 18px`)}">${idisc(ic, 48)}<div style="font-size:25px;line-height:1.2;font-weight:700;color:#1a2420">${esc(text)}</div></div>`;
  return `${left}${stalled}${right2}${cover}${rings(392, [560, 800, 1040], { r: 26 })}${pg}${tick}
    ${chip("calendar-plus", t[0], 24, 1236, 330, 76)}${chip("hand-pointing", t[1], 372, 1228, 608, 92)}`;
}

/* ---------- the pins ---------- */
export const pins = [
  printable({ n: 75, scene: pin75(), paper: "#f1e7d2" }),
  printable({ n: 77, scene: pin77(), paper: "#e3ebdd" }),
  printable({ n: 79, scene: pin79(), paper: "#efe9dc", extraCss: ".top h1{font-size:68px}" }),
  printable({ n: 81, scene: pin81(), paper: "#f3ead6", sub: false }),
  printable({ n: 83, scene: pin83(), paper: "#e6eeee", extraCss: ".top h1{font-size:68px}" }),
  printable({ n: 85, scene: pin85(), paper: "#eee6d4" }),
  printable({ n: 87, scene: pin87(), paper: "#e8eadf", extraCss: ".top h1{font-size:72px}" }),
];
