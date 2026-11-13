/**
 * Home Base pins, group L: moving day.
 * New-house guide pins #58, #60, #62, #64, #66, #68.
 *
 * Every pin lives in the moving-day world (cardboard, packing tape, a
 * ladder, keys on a ring, a new door, a welcome mat, a moving blanket) but
 * each has its own surface and palette: a stacked-carton wall, a painted
 * sage wall, a bare ash floor, a deep green front door, a quilted moving
 * blanket and a butter-yellow wall. All words are the idea bank's except
 * the labels listed in the builder's report.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";
import { pencil, sheet, binderClip, clipboard } from "../kit/paper.mjs";
import { bookPage } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_H = 1354 - SCENE_TOP;
const items = (n) => idea(n).items;
const SH = "0 2px 3px rgba(30,18,6,.28),0 16px 28px rgba(30,18,6,.34)";

/* ---------- shared moving-day props ---------- */

/** A cardboard wall of stacked, taped cartons filling the scene (seams, corrugation, tape). */
function cartonWall({ y = SCENE_TOP, h = SCENE_H, rows = [0, 330, 660], base = "#c8a679", dark = "#b08a5c" }) {
  const seams = rows.map((r, k) => {
    const yy = r;
    const shift = k % 2 ? 380 : 0;
    return `<div style="position:absolute;left:0;right:0;top:${yy}px;height:6px;background:rgba(70,45,15,.35);box-shadow:0 2px 3px rgba(255,255,255,.18)"></div>
    <div style="position:absolute;left:${shift + 300}px;top:${yy}px;width:6px;height:${(rows[k + 1] ?? h) - yy}px;background:rgba(70,45,15,.28)"></div>
    <div style="position:absolute;left:${shift + 300 - 34}px;top:${yy - 20}px;width:74px;height:${(rows[k + 1] ?? h) - yy + 60}px;background:linear-gradient(90deg,rgba(235,214,170,.0),rgba(235,214,170,.5),rgba(235,214,170,.0));opacity:.0"></div>`;
  }).join("");
  const tapes = rows.map((r, k) => {
    const shift = k % 2 ? 380 : 0;
    const x = shift + 300 - 37;
    return `<div style="position:absolute;left:${x}px;top:${r - 6}px;width:74px;height:${Math.min(210, ((rows[k + 1] ?? h) - r) * 0.7)}px;background:linear-gradient(90deg,rgba(226,204,150,.92),rgba(240,224,180,.95) 45%,rgba(214,190,134,.92));box-shadow:0 2px 4px rgba(50,30,8,.3)"></div>`;
  }).join("");
  return `<div style="${abs(0, y, 1000, h, `overflow:hidden;background:repeating-linear-gradient(90deg,${base} 0 11px,${dark} 11px 13px,${base} 13px 24px),${base}`)}">
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 28% 8%,rgba(255,255,255,.22),rgba(40,20,5,.32) 95%)"></div>${seams}${tapes}</div>`;
}

/** A taped carton seen from the front. */
function carton({ x, y, w, h, tilt = 0, base = "#c8a679", label = "" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:repeating-linear-gradient(90deg,${base} 0 9px,#b99564 9px 11px,${base} 11px 20px);border-radius:4px;box-shadow:${SH}`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:${Math.round(h * 0.2)}px;background:linear-gradient(rgba(70,45,15,.28),rgba(70,45,15,.06));border-bottom:3px solid rgba(70,45,15,.35)"></div>
    <div style="position:absolute;left:${w / 2 - 34}px;top:0;width:68px;height:${Math.round(h * 0.62)}px;background:linear-gradient(90deg,rgba(224,202,148,.95),rgba(241,226,182,.97) 45%,rgba(212,188,132,.95));box-shadow:0 2px 4px rgba(50,30,8,.3)"></div>${label}</div>`;
}

/** A roll of packing tape lying flat. */
function tapeRoll({ x, y, s = 1, rot = 0 }) {
  const d = 190 * s;
  return `<svg style="${abs(x, y, d, d, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,18,6,.4))`)}" viewBox="0 0 190 190" aria-hidden="true">
    <circle cx="95" cy="95" r="90" fill="#d9bf86"/><circle cx="95" cy="95" r="90" fill="none" stroke="#a98a4c" stroke-width="3"/>
    <circle cx="95" cy="95" r="58" fill="#efe3c3"/><circle cx="95" cy="95" r="58" fill="none" stroke="#b79b5d" stroke-width="2"/>
    <circle cx="95" cy="95" r="44" fill="#9a7b44"/><circle cx="95" cy="95" r="40" fill="#cdb98a"/>
    <path d="M30 60 A72 72 0 0 1 120 28" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/></svg>`;
}

/** A single brass key pointing down, hung from (0,0) of its group. */
const keyShape = (rot, fill = "url(#brass)") => `<g transform="rotate(${rot})"><circle cx="0" cy="36" r="30" fill="${fill}"/><circle cx="0" cy="36" r="13" fill="#2b2a24" opacity=".85"/><circle cx="0" cy="36" r="30" fill="none" stroke="#7a5f1d" stroke-width="2.5"/><rect x="-9" y="64" width="18" height="150" rx="5" fill="${fill}"/><rect x="9" y="164" width="22" height="16" fill="${fill}"/><rect x="9" y="188" width="16" height="16" fill="${fill}"/><rect x="-9" y="64" width="18" height="150" rx="5" fill="none" stroke="#7a5f1d" stroke-width="2"/></g>`;

/** A key ring with keys, in its own svg box (w x h); the ring centre is at (w/2, 70). */
function keyRing({ x, y, s = 1, rot = 0, keys = [-24, 0, 22, 44] }) {
  const w = 340, h = 330;
  return `<svg style="${abs(x, y, w * s, h * s, `transform:rotate(${rot}deg);transform-origin:50% 20%;filter:drop-shadow(0 12px 8px rgba(20,12,4,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d98a"/><stop offset=".5" stop-color="#cfa646"/><stop offset="1" stop-color="#a87e26"/></linearGradient></defs>
    <g transform="translate(${w / 2} 100)">${keys.map((r) => keyShape(r)).join("")}</g>
    <circle cx="${w / 2}" cy="64" r="54" fill="none" stroke="#9aa1a8" stroke-width="9"/><circle cx="${w / 2}" cy="64" r="54" fill="none" stroke="#e6eaee" stroke-width="3" stroke-dasharray="40 300" stroke-dashoffset="-20"/></svg>`;
}

/** A ladder standing in the margin (a side view: two rails and rungs). */
function ladder({ x, y, h, w = 110, wood = "#c99b66", tilt = 0 }) {
  const rungs = [];
  for (let r = 40; r < h - 20; r += 78) rungs.push(`<rect x="8" y="${r}" width="${w - 16}" height="16" rx="3" fill="${wood}"/><rect x="8" y="${r}" width="${w - 16}" height="5" fill="#fff" opacity=".25"/>`);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);filter:drop-shadow(0 12px 10px rgba(30,18,6,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${rungs.join("")}<rect x="0" y="0" width="16" height="${h}" rx="4" fill="#b98550"/><rect x="${w - 16}" y="0" width="16" height="${h}" rx="4" fill="#b98550"/><rect x="0" y="0" width="5" height="${h}" fill="#fff" opacity=".22"/><rect x="${w - 16}" y="0" width="5" height="${h}" fill="#fff" opacity=".22"/></svg>`;
}

/** A coir welcome mat, flat (full width strip). No words on it. */
function mat({ x, y, w, h, tilt = 0 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);border-radius:10px;background:repeating-linear-gradient(90deg,#a68457 0 5px,#8f6f45 5px 8px,#b79566 8px 14px);box-shadow:0 10px 18px rgba(20,12,4,.45)`)}"><div style="position:absolute;inset:12px;border:6px solid #5f4527;border-radius:6px;opacity:.75"></div></div>`;
}

/** A small round disc carrying one Phosphor icon. */
const disc = (name, size = 64, bg = C.sageDeep, fg = "#fff") =>
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:grid;place-items:center;flex:none;box-shadow:0 3px 6px rgba(20,30,20,.3)">${icon(name, { size: Math.round(size * 0.58), color: fg, weight: "bold" })}</div>`;

const exampleTag = (extra = "") => `<span class="example" style="font-size:24px;${extra}">Example</span>`;

/* =============================================================
   #58  New House Checklist: carton wall, checklist card, ring of keys
   ============================================================= */
function pin58() {
  const it = items(58);
  const ic = ["gauge", "drop", "lightning", "keyhole", "bell-ringing"];
  const rows = it
    .map(
      (t, k) => `<div style="display:flex;align-items:center;gap:22px;padding:24px 0;${k ? "border-top:2px dashed #cdd6c8;" : ""}">
      <div style="width:44px;height:44px;border:4px solid ${C.ink};border-radius:8px;background:${C.paperLight};flex:none"></div>
      <div style="flex:1;font-size:27px;line-height:1.28;color:${C.ink};font-weight:500">${esc(t)}</div>${disc(ic[k], 66)}</div>`
    )
    .join("");
  const scene = `
  ${cartonWall({ rows: [0, 340, 700] })}
  <div style="${abs(66, 424, 830, 832, `background:${C.paperLight};border:7px solid ${C.sage};border-radius:18px;box-shadow:${SH};transform:rotate(-1deg);padding:30px 38px 14px`)}" data-check="card">
    <div style="font:600 22px 'Plex';letter-spacing:.16em;text-transform:uppercase;color:${C.sageDeep}">The Day One List</div>
    ${rows}
  </div>
  <div style="${abs(250, 396, 170, 62, "background:linear-gradient(90deg,rgba(226,204,150,.92),rgba(240,224,180,.96),rgba(214,190,134,.92));transform:rotate(-3deg);box-shadow:0 3px 5px rgba(50,30,8,.3)")}"></div>
  <div style="${abs(640, 396, 170, 62, "background:linear-gradient(90deg,rgba(226,204,150,.92),rgba(240,224,180,.96),rgba(214,190,134,.92));transform:rotate(4deg);box-shadow:0 3px 5px rgba(50,30,8,.3)")}"></div>
  ${keyRing({ x: 800, y: 1190, s: 0.6, rot: 14 })}
  ${tapeRoll({ x: 60, y: 1218, s: 0.72, rot: -20 })}`;
  return printable({ n: 58, scene, paper: "#ecdfc7", extraCss: ".top p{color:#4b4033}" });
}

/* =============================================================
   #60  Timing: a two-week calendar strip on a sage wall
   ============================================================= */
function pin60() {
  const it = items(60);
  const cell = (x, y, w, h, body, { bg = "#fff", border = "#cdd6c8", extra = "" } = {}) =>
    `<div style="${abs(x, y, w, h, `background:${bg};border:3px solid ${border};border-radius:14px;box-shadow:0 2px 3px rgba(30,40,30,.18),0 12px 20px rgba(30,40,30,.18);padding:14px 16px;${extra}`)}">${body}</div>`;
  const head = (t, color = C.sageDeep) => `<div style="font:600 22px 'Plex';letter-spacing:.14em;text-transform:uppercase;color:${color}">${esc(t)}</div>`;
  const tick = `<div style="width:48px;height:48px;border-radius:50%;background:${C.sage};display:grid;place-items:center;box-shadow:0 3px 6px rgba(20,40,25,.35)">${icon("check", { size: 30, color: "#fff", weight: "bold" })}</div>`;
  const blank = (x, y) => `<div style="${abs(x, y, 100, 200, "background:rgba(255,255,255,.65);border:3px dashed #b9c6b4;border-radius:14px")}"></div>`;
  const li = (t) => `<div style="display:flex;gap:12px;align-items:flex-start;font-size:24px;line-height:1.22;margin-top:10px;color:${C.ink}"><div style="margin-top:3px;width:22px;height:22px;border-radius:5px;background:${C.sage};flex:none;display:grid;place-items:center">${icon("check", { size: 15, color: "#fff", weight: "bold" })}</div><div>${esc(t)}</div></div>`;
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(180deg,#dbe6d6,#c9d8c4)")}"></div>
  <div style="${abs(0, 1254, 1000, 100, "background:linear-gradient(#efe9db,#d8cdb4);box-shadow:0 -4px 8px rgba(30,40,30,.2)")}"></div>
  ${ladder({ x: 22, y: 380, h: 880, w: 92, tilt: 0 })}
  <div style="${abs(150, 410, 810, 60, "")}"><div style="font:600 24px 'Plex';letter-spacing:.14em;text-transform:uppercase;color:${C.sageDeep}">${esc("Friday")} to the following weekend</div></div>
  ${cell(150, 470, 210, 330, `${head("Friday")}<div style="margin-top:10px;font-size:26px;line-height:1.25;font-weight:500">${esc("Say you close on a Friday")}</div><div style="margin-top:12px">${icon("key", { size: 84, color: C.sageDeep, weight: "duotone" })}</div>`, { bg: "#fffdf6" })}
  ${cell(376, 470, 270, 330, `${head("The weekend")}<div style="margin-top:10px;font-size:26px;line-height:1.25;font-weight:500">${esc("and move in over the weekend")}</div><div style="margin-top:12px">${icon("package", { size: 84, color: C.sageDeep, weight: "duotone" })}</div>`, { bg: "#fffdf6" })}
  ${cell(662, 470, 298, 330, `<div style="display:flex;justify-content:space-between;align-items:center">${head("Monday")}${tick}</div>${li("the shutoffs are found")}${li("the meters are photographed")}${li("the smoke alarms are tested")}`, { bg: "#eef5ea", border: C.sage })}
  <svg style="${abs(150, 805, 810, 70)}" viewBox="0 0 810 70" aria-hidden="true"><path d="M810 0 V30 H40 V62" fill="none" stroke="${C.sageDeep}" stroke-width="4" stroke-dasharray="3 10" stroke-linecap="round"/><path d="M28 50 L40 66 L52 50" fill="none" stroke="${C.sageDeep}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>
  ${blank(150, 880)}${blank(264, 880)}${blank(378, 880)}${blank(492, 880)}
  ${cell(606, 880, 354, 200, `${head("The following weekend")}<div style="margin-top:10px;font-size:25px;line-height:1.24;font-weight:500">${esc("the inspection report is marked up with a date beside each item")}</div>`, { bg: "#fffdf6" })}
  <div style="${abs(150, 1104, 810, 120, "background:linear-gradient(90deg,rgba(255,255,255,.95),rgba(255,255,255,.55) 70%,rgba(255,255,255,.12));border-radius:30px 30px 30px 6px;box-shadow:0 8px 18px rgba(30,40,30,.14);padding:22px 30px;display:flex;align-items:center;gap:20px")}"><div style="font-size:27px;line-height:1.28;color:#4a5a4a;font-weight:500;flex:1">${esc("The previous owner, who's been quick to answer texts so far, has gone quiet.")}</div>${exampleTag("flex:none")}</div>
  ${carton({ x: 770, y: 1226, w: 190, h: 140, tilt: 2, base: "#c8a679" })}
  ${keyRing({ x: 250, y: 1252, s: 0.4, rot: -72 })}`;
  return printable({ n: 60, scene, paper: "#e2ebdd" });
}

/* =============================================================
   #62  Inspection report, read once then read again (bare ash floor)
   ============================================================= */
function pin62() {
  const i = idea(62);
  const floor = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(0deg,#d7ccb8 0 118px,#b9ac94 118px 121px,#d0c4ae 121px 238px,#b9ac94 238px 241px),#d7ccb8")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(ellipse at 30% 10%,rgba(255,255,255,.35),rgba(60,45,25,.25) 95%)")}"></div>`;
  const bars = (hl) => {
    const widths = [100, 82, 94, 70, 90, 76, 96, 64];
    return widths
      .map((w, k) => {
        const lit = hl && [1, 3, 5, 6].includes(k);
        return `<div style="display:flex;align-items:center;gap:14px;margin-top:${k ? (hl ? 14 : 24) : 0}px"><div style="height:${lit ? 22 : 16}px;width:${w * (hl ? 2.0 : 3.1)}px;max-width:${hl ? 224 : 330}px;border-radius:6px;background:${lit ? "#b9d4bd" : "#dcdcd6"};${lit ? `box-shadow:0 0 0 8px #d7e8d8,0 0 0 9px #b9d4bd` : ""}"></div>${hl ? `<div style="width:92px;height:38px;border:3px solid #9fb2a2;border-radius:8px;background:#fff;margin-left:auto;flex:none;visibility:${lit ? "visible" : "hidden"}"></div>` : ""}</div>`;
      })
      .join("");
  };
  const report = (x, y, hl, tilt) => `<div style="${abs(x, y, 420, 590, `background:#fffefb;border-radius:4px;transform:rotate(${tilt}deg);box-shadow:${SH};padding:36px 32px`)}" data-check="page">
    <div style="height:30px;width:210px;background:${hl ? C.sageDeep : "#aeb4a8"};border-radius:5px"></div><div style="height:12px;width:120px;background:#dcdcd6;border-radius:5px;margin:14px 0 30px"></div>${bars(hl)}</div>`;
  const label = (x, y, w, t, strong) => `<div style="${abs(x, y, w, 80, `font:${strong ? 600 : 500} 29px/1.2 'Plex';color:${strong ? C.sageDeep : "#4b4339"}`)}">${esc(t)}</div>`;
  const scene = `${floor}
  ${label(60, 410, 420, "Read once, as a buying decision", false)}
  ${label(528, 410, 420, "Read it again now as a maintenance plan", true)}
  ${report(50, 500, false, -2)}${report(528, 500, true, 1.5)}
  ${binderClip({ x: 360, y: 486, rot: 8, size: 100 })}
  <div style="${abs(112, 1112, 776, 100, `background:#fffdf6;border-left:10px solid ${C.sage};border-radius:6px;box-shadow:${SH};padding:14px 24px;font-size:29px;line-height:1.28;font-weight:500;color:${C.ink};display:flex;align-items:center;transform:rotate(-.8deg)`)}">${esc(i.items[1])}</div>
  <div style="${abs(112, 1226, 640, 84, `background:${C.sageDeep};border-radius:6px;box-shadow:${SH};padding:12px 24px;font-size:26px;line-height:1.25;font-weight:500;color:#fff;display:flex;align-items:center;transform:rotate(.6deg)`)}">${esc(i.items[2])}</div>
  ${pencil({ x: 640, y: 1290, len: 320, rot: -6 })}`;
  return printable({ n: 62, scene, paper: "#efe7d6", extraCss: ".top h1{text-wrap:balance}" });
}

/* =============================================================
   #64  Locks: a deep green front door, a ring of tagged keys, a mat
   ============================================================= */
function pin64() {
  const it = items(64);
  const door = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(135deg,#34523f,#233a2d)")}"></div>
  <div style="${abs(40, 400, 400, 330, "border:6px solid rgba(0,0,0,.22);border-radius:6px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.06),inset 8px 10px 22px rgba(0,0,0,.28)")}"></div>
  <div style="${abs(560, 400, 400, 330, "border:6px solid rgba(0,0,0,.22);border-radius:6px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.06),inset 8px 10px 22px rgba(0,0,0,.28)")}"></div>
  <div style="${abs(40, 770, 400, 440, "border:6px solid rgba(0,0,0,.22);border-radius:6px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.06),inset 8px 10px 22px rgba(0,0,0,.28)")}"></div>
  <div style="${abs(560, 770, 400, 440, "border:6px solid rgba(0,0,0,.22);border-radius:6px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.06),inset 8px 10px 22px rgba(0,0,0,.28)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(ellipse at 70% 30%,rgba(255,255,255,.12),rgba(0,0,0,.28) 95%)")}"></div>`;
  // brass deadbolt with a spare key in it, centred on the door's stile
  const bolt = `<svg style="${abs(440, 470, 120, 380, "filter:drop-shadow(0 12px 10px rgba(0,0,0,.45))")}" viewBox="0 0 120 380" aria-hidden="true"><defs><linearGradient id="bz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d98a"/><stop offset=".55" stop-color="#cfa646"/><stop offset="1" stop-color="#94701f"/></linearGradient></defs>
    <rect x="14" y="10" width="92" height="360" rx="46" fill="url(#bz)"/><rect x="14" y="10" width="92" height="360" rx="46" fill="none" stroke="#7a5f1d" stroke-width="3"/>
    <circle cx="60" cy="110" r="34" fill="#e1bf62" stroke="#7a5f1d" stroke-width="3"/><rect x="40" y="96" width="40" height="28" rx="8" fill="#6f5518"/><circle cx="60" cy="110" r="10" fill="#2a2210"/>
    <circle cx="60" cy="270" r="30" fill="#e1bf62" stroke="#7a5f1d" stroke-width="3"/><circle cx="60" cy="270" r="14" fill="#2a2210"/><rect x="55" y="268" width="10" height="26" rx="3" fill="#2a2210"/>
    <circle cx="60" cy="38" r="5" fill="#7a5f1d"/><circle cx="60" cy="344" r="5" fill="#7a5f1d"/></svg>`;
  const tag = (x, y, rot, text, o = {}) => `<div style="${abs(x, y, o.w ?? 230, 96, `transform:rotate(${rot}deg);background:${o.bg ?? "#d4b383"};clip-path:polygon(0 50%,40px 0,100% 0,100% 100%,40px 100%);display:flex;align-items:center;padding-left:60px;font:600 27px 'Plex';color:${o.fg ?? C.ink};box-shadow:${SH}`)}">${esc(text)}</div>`;
  const tagS = (x, y, rot, text, o = {}) => `<div style="${abs(x, y, o.w ?? 230, 96, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 10px rgba(0,0,0,.4))`)}"><div style="position:absolute;inset:0;background:${o.bg ?? "#d4b383"};clip-path:polygon(0 50%,40px 0,100% 0,100% 100%,40px 100%)"></div><div style="position:absolute;left:24px;top:41px;width:14px;height:14px;border-radius:50%;background:#3b2b17"></div><div style="position:absolute;left:60px;top:0;right:8px;bottom:0;display:flex;align-items:center;font:600 27px 'Plex';color:${o.fg ?? C.ink}">${esc(text)}</div></div>`;
  const scene = `${door}
  <svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><g stroke="#e8dcc0" stroke-width="3" stroke-linecap="round" opacity=".9"><path d="M717 430 L591 740"/><path d="M717 430 L811 760"/><path d="M717 430 L591 872"/><path d="M717 430 L811 900"/></g></svg>
  ${keyRing({ x: 612, y: 385, s: 0.62, rot: 0, keys: [-30, -10, 12, 30] })}
  ${bolt}
  ${tagS(562, 692, -5, "Front door", { w: 212 })}
  ${tagS(782, 722, 5, "Back door", { w: 206 })}
  ${tagS(562, 826, 4, "Any gate", { w: 212 })}
  ${tagS(782, 856, -4, "Garage keypad", { w: 206 })}
  <div style="${abs(650, 1000, 104, 104, `border-radius:50%;background:${C.sage};display:grid;place-items:center;font:600 64px 'Newsreader',serif;color:#fff;box-shadow:${SH};transform:rotate(-8deg)`)}">?</div>
  <div style="${abs(52, 860, 450, 360, `background:#fbf6e8;border-radius:10px;box-shadow:${SH};padding:24px 28px;transform:rotate(-1deg);font-size:27px;line-height:1.3;font-weight:500;color:${C.ink}`)}" data-check="note">
    <div style="font:600 22px 'Plex';letter-spacing:.14em;text-transform:uppercase;color:${C.sageDeep};margin-bottom:10px">Rekey Before You Move In</div>
    <div>${esc(it[1])}</div><div style="margin-top:14px;color:${C.sageDeep}">${esc(it[3])}</div></div>
  <div style="${abs(52, 440, 380, 230, `background:#fbf6e8;border-radius:10px;box-shadow:${SH};padding:20px 24px;transform:rotate(1deg);font-size:26px;line-height:1.3;font-weight:500;color:${C.ink}`)}" data-check="note">${esc(it[0])}</div>
  ${mat({ x: 520, y: 1250, w: 400, h: 120, tilt: -1 })}`;
  return printable({ n: 64, scene, paper: "#e4ebe0", headline: "Should You Change the Locks When You Buy a House?" });
}

/* =============================================================
   #66  Week one: the real Heating page on a clipboard on a moving blanket
   ============================================================= */
function pin66() {
  const it = items(66);
  const blanket = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:#a4b3b8")}"></div>
  <svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><pattern id="qt" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="90" height="90" fill="#a4b3b8"/><path d="M0 0 H90 M0 0 V90" stroke="#7e9096" stroke-width="3" stroke-dasharray="9 7"/><circle cx="0" cy="0" r="4" fill="#6f8187"/></pattern>
    <radialGradient id="bl" cx="30%" cy="12%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#1c2a30" stop-opacity=".38"/></radialGradient></defs>
    <rect width="1000" height="${SCENE_H}" fill="url(#qt)"/><rect width="1000" height="${SCENE_H}" fill="url(#bl)"/>
    <rect x="0" y="${SCENE_H - 16}" width="1000" height="16" fill="#3d4f56" opacity=".45"/></svg>`;
  const page = sheet({ src: bookPage(10), x: 38, y: 64, w: 600, crop: { x0: 0, y0: 0, x1: 1, y1: 0.6 }, radius: 2, shadow: false });
  const board = clipboard({ x: 150, y: 450, w: 680, h: 600, tilt: -2, content: `<div style="position:absolute;left:0;top:0;width:680px;height:600px">${page}</div>` });
  const chips = [
    ["Brand, model and serial", "wrench"],
    ["When the furnace or boiler was last serviced", "calendar-check"],
    ["The age of the roof, windows, and any major system", "house-line"],
    ["Warranty end dates for anything recent", "seal-check"],
    ["Any technician the previous owner recommends", "phone"],
  ];
  const note = `<div style="${abs(110, 1066, 780, 262, `background:#fbf6e8;border-radius:8px;box-shadow:${SH};padding:14px 30px;transform:rotate(.6deg)`)}" data-check="note">
    ${chips.map(([t, ic], k) => `<div style="display:flex;align-items:center;gap:18px;height:47px;${k ? "border-top:2px dashed #d6d2c0;" : ""}">${icon(ic, { size: 30, color: C.sageDeep, weight: "bold" })}<div style="font-size:25px;font-weight:500;color:${C.ink};white-space:nowrap">${esc(t)}</div></div>`).join("")}</div>`;
  const scene = `${blanket}${board}${note}
  ${pencil({ x: 640, y: 1004, len: 330, rot: -14 })}`;
  return printable({ n: 66, scene, paper: "#e5ebec", extraCss: ".top p{color:#445056}" });
}

/* =============================================================
   #68  Service lives: a house in section with six range bars
   ============================================================= */
function pin68() {
  const it = items(68);
  const SCALE = 35; // unlabelled ruler: bars are drawn to scale on it
  const rowsDef = [
    { k: 4, from: 15, to: 30, unit: { x: 150, y: 28 }, col: "#7a8f5f" },
    { k: 5, from: 30, to: 35, open: true, unit: { x: 278, y: 262 }, col: "#c99b66" },
    { k: 3, from: 14, to: 16, unit: { x: 350, y: 360 }, col: "#6f8a93" },
    { k: 0, from: 15, to: 20, unit: { x: 228, y: 400 }, col: C.sage },
    { k: 1, from: 8, to: 12, unit: { x: 112, y: 548 }, col: "#a16c3c" },
    { k: 2, from: 15, to: 20, unit: { x: 262, y: 548 }, col: "#4f7d86" },
  ];
  const RX = 440, RW = 470, RY0 = 456, RH = 134;
  const rows = rowsDef
    .map((r, idx) => {
      const [label, range] = it[r.k].split(": ");
      const y = RY0 + idx * RH;
      const bx = (r.from / SCALE) * RW, bw = ((r.to - r.from) / SCALE) * RW;
      return `<div style="${abs(RX, y, RW + 20, RH - 6)}">
        <div style="font:600 29px/1.1 'Plex';color:${C.ink}">${esc(label)}</div>
        <div style="font:500 24px/1.2 'Plex';color:#5b4a2a;margin-top:2px">${esc(range)}</div>
        <div style="position:absolute;left:0;top:78px;width:${RW}px;height:24px;border-radius:12px;background:rgba(80,60,20,.16)"></div>
        <div style="position:absolute;left:${bx}px;top:74px;width:${Math.max(bw, 26)}px;height:32px;border-radius:16px;background:${r.col};box-shadow:0 4px 8px rgba(40,25,5,.35)"></div>
        ${r.open ? `<div style="position:absolute;left:${RW - 14}px;top:74px;width:48px;height:32px;display:grid;place-items:center">${icon("caret-double-right", { size: 30, color: r.col, weight: "bold" })}</div>` : ""}</div>`;
    })
    .join("");
  const leaders = rowsDef
    .map((r, idx) => {
      const y = RY0 + idx * RH + 90;
      const ux = 40 + r.unit.x + 28, uy = 420 + r.unit.y + 20;
      return `<path d="M${ux} ${uy} L${ux + 60} ${y} L${RX - 6} ${y}" fill="none" stroke="#6b4f1a" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round"/><circle cx="${ux}" cy="${uy}" r="8" fill="${r.col}" stroke="#fff" stroke-width="3"/>`;
    })
    .join("");
  const house = `<svg style="${abs(40, 410, 392, 780, "filter:drop-shadow(0 18px 20px rgba(60,40,10,.4))")}" viewBox="0 0 392 780" aria-hidden="true">
    <polygon points="0,150 196,6 392,150 392,176 0,176" fill="#7a8f5f"/><polygon points="0,150 196,6 392,150 374,150 196,26 18,150" fill="#5c7046"/>
    <path d="M44 150 L196 36 M80 150 L196 64" stroke="#fff" stroke-opacity=".12" stroke-width="3" fill="none"/>
    <rect x="12" y="176" width="368" height="560" fill="#e9dfc7"/>
    <rect x="12" y="176" width="368" height="560" fill="none" stroke="#5a4a2c" stroke-width="6"/>
    <rect x="12" y="360" width="368" height="14" fill="#8a7a58"/><rect x="12" y="520" width="368" height="14" fill="#8a7a58"/>
    <rect x="24" y="192" width="150" height="140" fill="#cfe0e8"/><path d="M99 192 V332 M24 262 H174" stroke="#fff" stroke-width="6"/>
    <rect x="12" y="534" width="368" height="202" fill="#cfc6ae"/><g stroke="#b3a98f" stroke-width="2" opacity=".8"><path d="M12 600 H380 M12 660 H380"/></g>
    <rect x="12" y="728" width="368" height="14" fill="#5a4a2c"/>
    <!-- electrical panel -->
    <rect x="${278 - 12}" y="${262 - 4}" width="64" height="88" rx="6" fill="#8d959b" stroke="#5a6268" stroke-width="3"/><rect x="${278 - 4}" y="${262 + 6}" width="48" height="68" rx="3" fill="#b9c0c5"/><g fill="#4a5258"><rect x="${278 + 2}" y="${262 + 12}" width="14" height="8"/><rect x="${278 + 22}" y="${262 + 12}" width="14" height="8"/><rect x="${278 + 2}" y="${262 + 28}" width="14" height="8"/><rect x="${278 + 22}" y="${262 + 28}" width="14" height="8"/><rect x="${278 + 2}" y="${262 + 44}" width="14" height="8"/><rect x="${278 + 22}" y="${262 + 44}" width="14" height="8"/></g>
    <!-- air conditioner, outside right wall -->
    <rect x="${350}" y="${360}" width="40" height="100" rx="6" fill="#d7dde0" stroke="#7d868c" stroke-width="3"/><g stroke="#9ba4a9" stroke-width="2"><path d="M356 372 H384 M356 384 H384 M356 396 H384 M356 408 H384 M356 420 H384 M356 432 H384"/></g><circle cx="370" cy="446" r="6" fill="#7d868c"/>
    <!-- furnace -->
    <rect x="${228 - 18}" y="${400 - 16}" width="90" height="116" rx="6" fill="#aab4ae" stroke="#5f6b64" stroke-width="3"/><rect x="${228 - 6}" y="${400 - 4}" width="66" height="44" rx="3" fill="#c8d0cb"/><circle cx="${228 + 27}" cy="${400 + 70}" r="14" fill="#5f6b64"/><rect x="${228 + 2}" y="${400 + 52}" width="14" height="10" fill="#e7b04a"/>
    <path d="M${228 + 27} ${400 - 16} V${210}" stroke="#8a8f94" stroke-width="12" fill="none"/>
    <!-- tank water heater -->
    <rect x="${112 - 22}" y="${548 - 24}" width="64" height="118" rx="22" fill="#d9ded9" stroke="#7d867f" stroke-width="3"/><rect x="${112 - 8}" y="${548 + 40}" width="36" height="18" rx="4" fill="#7d867f"/>
    <!-- tankless water heater -->
    <rect x="${262 - 8}" y="${548 - 2}" width="74" height="96" rx="8" fill="#e8eef0" stroke="#6f8a93" stroke-width="3"/><rect x="${262 + 8}" y="${548 + 14}" width="40" height="24" rx="4" fill="#4f7d86"/><circle cx="${262 + 28}" cy="${548 + 64}" r="9" fill="#6f8a93"/>
    <!-- roof panels -->
    <path d="M60 130 L196 38 M110 150 L220 76" stroke="#3f5030" stroke-width="3" stroke-opacity=".5" fill="none"/>
    </svg>`;
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(180deg,#f0e0ae,#e4cf92)")}"></div>
  <div style="${abs(0, 1240, 1000, 114, "background:linear-gradient(#d2b88a,#b79563)")}"></div>
  ${ladder({ x: 930, y: 380, h: 880, w: 62, tilt: 0 })}
  ${house}
  <svg style="${abs(0, 0, 1000, 1500, "pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">${leaders}</svg>
  <div style="${abs(RX, 408, RW, 40, `font:600 22px 'Plex';letter-spacing:.16em;text-transform:uppercase;color:${C.sageDeep}`)}">Typical Service Lives</div>
  ${rows}
  ${carton({ x: 40, y: 1222, w: 210, h: 150, tilt: -2 })}
  ${tapeRoll({ x: 262, y: 1236, s: 0.56, rot: 10 })}`;
  return printable({ n: 68, scene, paper: "#f1e6c6", headline: "How Long Do Furnaces, Water Heaters and Roofs Last?" });
}

export const pins = [pin58(), pin60(), pin62(), pin64(), pin66(), pin68()];
