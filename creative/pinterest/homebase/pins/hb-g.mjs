/**
 * Group G: basement and furnace room. Maintenance guide pins #28, #30, #32,
 * #34, #36, #38. Every word is the idea bank's (headline, sub, items) or a
 * label named in the idea's own `visual` line. No printed page or app screen
 * is shown; every drawing and prop is flat vector, made here.
 */
import { idea, C } from "../kit/bank.mjs";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const SHADOW = "filter:drop-shadow(0 12px 9px rgba(10,15,12,.4))";
const split = (s) => {
  const k = s.indexOf(": ");
  return k < 0 ? [s, ""] : [s.slice(0, k), s.slice(k + 2)];
};
const COPPER = ["#7c4220", "#b8683a", "#e9a877"];

/* ---------- basement props (flat vector, soft shadows) ---------- */

/** A copper pipe following an SVG path: dark edge, body, highlight. Whole-pin overlay. */
function copper(d, w = 24, extra = "") {
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;pointer-events:none;filter:drop-shadow(0 8px 6px rgba(10,10,5,.45));${extra}" viewBox="0 0 1000 1500" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${COPPER[0]}" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${COPPER[1]}" stroke-width="${w - 5}" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="${COPPER[2]}" stroke-width="${Math.round(w / 6)}" stroke-opacity=".8" stroke-linecap="butt" stroke-linejoin="round" transform="translate(-${w / 6} -${w / 6})"/></svg>`;
}
/** A clamp or coupling ring around a pipe, as an SVG fragment (pin coordinates). */
const ring = (x, y, w, h, r = 5) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="#d09061"/><rect x="${x}" y="${y}" width="${w}" height="${Math.max(3, h * 0.28)}" rx="${r}" fill="#f2c9a3" opacity=".8"/><rect x="${x}" y="${y + h - 4}" width="${w}" height="4" fill="#5e3319" opacity=".55"/>`;
const rings = (items) => `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;pointer-events:none;filter:drop-shadow(0 5px 4px rgba(10,10,5,.4))" viewBox="0 0 1000 1500" aria-hidden="true">${items.join("")}</svg>`;

/** A furnace cabinet: duct on top, louvred lower panel, access door, and the filter slot with a kraft filter sliding out. */
function furnace({ x, y, w = 360, h = 300, rot = 0 }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 360 300" aria-hidden="true"><defs>
    <linearGradient id="fg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3e8e2"/><stop offset="1" stop-color="#aab3ab"/></linearGradient>
    <linearGradient id="fd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdd5cd"/><stop offset="1" stop-color="#b3bdb4"/></linearGradient></defs>
    <path d="M96 0 H232 L252 60 H76 Z" fill="#c4ccc5"/><path d="M96 0 H232 L238 18 H90 Z" fill="#fff" opacity=".35"/><rect x="82" y="56" width="164" height="10" fill="#8c968e"/>
    <rect x="26" y="62" width="300" height="236" rx="10" fill="url(#fg)"/><rect x="26" y="62" width="300" height="236" rx="10" fill="none" stroke="#7f8a82" stroke-width="3"/>
    <rect x="44" y="82" width="190" height="124" rx="6" fill="url(#fd)" stroke="#8b958d" stroke-width="2"/>
    <circle cx="62" cy="100" r="5" fill="#7f8a82"/><circle cx="216" cy="100" r="5" fill="#7f8a82"/><circle cx="62" cy="190" r="5" fill="#7f8a82"/><circle cx="216" cy="190" r="5" fill="#7f8a82"/>
    <rect x="94" y="126" width="90" height="46" rx="5" fill="#3b4741"/><rect x="100" y="132" width="78" height="34" rx="3" fill="#8fb39b"/><rect x="100" y="132" width="78" height="9" rx="3" fill="#fff" opacity=".35"/>
    ${[222, 236, 250, 264, 278].map((yy) => `<rect x="44" y="${yy}" width="190" height="6" rx="3" fill="#7f8a82" opacity=".75"/>`).join("")}
    <rect x="250" y="82" width="62" height="40" rx="5" fill="#f6f3ea" stroke="#8b958d" stroke-width="2"/><rect x="258" y="92" width="34" height="5" rx="2" fill="#98a39b"/><rect x="258" y="104" width="44" height="5" rx="2" fill="#98a39b"/>
    <rect x="250" y="150" width="104" height="58" rx="3" fill="#2f3a34"/>
    <rect x="256" y="156" width="98" height="46" fill="#cdb089"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${262 + k * 10.5} 158 V200" stroke="${k % 2 ? "#b79c76" : "#f4ead6"}" stroke-width="5"/>`).join("")}<rect x="256" y="156" width="98" height="46" fill="none" stroke="#8a7350" stroke-width="2"/>
    <rect x="22" y="296" width="308" height="4" fill="#000" opacity=".25"/></svg>`;
}

/** A tall water heater tank: cylinder shading, top fittings, dial plate, drain valve. */
function heater({ x, y, w = 190, h = 420, rot = 0, band = "#6f9a7c" }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 190 420" aria-hidden="true"><defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f4ef"/><stop offset=".35" stop-color="#dfe5de"/><stop offset="1" stop-color="#9aa69d"/></linearGradient></defs>
    <rect x="68" y="0" width="22" height="46" fill="${COPPER[1]}"/><rect x="68" y="0" width="7" height="46" fill="${COPPER[2]}" opacity=".8"/><rect x="108" y="0" width="22" height="46" fill="${COPPER[1]}"/><rect x="108" y="0" width="7" height="46" fill="${COPPER[2]}" opacity=".8"/>
    <rect x="62" y="36" width="74" height="12" rx="3" fill="#d09061"/>
    <path d="M18 70 C 18 40 50 36 99 36 C 148 36 180 40 180 70 V 392 H 18 Z" fill="url(#hg)"/>
    <path d="M18 70 C 18 40 50 36 99 36" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>
    <rect x="18" y="150" width="162" height="28" fill="${band}"/><rect x="18" y="150" width="162" height="8" fill="#fff" opacity=".25"/>
    <rect x="62" y="210" width="74" height="96" rx="8" fill="#fbfaf6" stroke="#8b958d" stroke-width="2"/>
    <circle cx="99" cy="244" r="20" fill="#e8ede6" stroke="#6c786f" stroke-width="3"/><path d="M99 244 L110 232" stroke="#26332a" stroke-width="3" stroke-linecap="round"/><circle cx="99" cy="244" r="3" fill="#26332a"/>
    <rect x="76" y="276" width="46" height="5" rx="2" fill="#98a39b"/><rect x="82" y="288" width="34" height="5" rx="2" fill="#98a39b"/>
    <rect x="18" y="384" width="162" height="22" rx="4" fill="#7f8a82"/><rect x="40" y="404" width="12" height="16" fill="#6b756e"/><rect x="138" y="404" width="12" height="16" fill="#6b756e"/>
    <rect x="150" y="332" width="40" height="14" rx="4" fill="#c9cdd0"/><circle cx="192" cy="339" r="9" fill="${COPPER[1]}"/></svg>`;
}

/** A clamp work lamp: a dome shade on an arm. The pool of light is drawn by the scene. */
function workLamp({ x, y, rot = 0, s = 1 }) {
  return `<svg style="${abs(x, y, 200 * s, 180 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 8px rgba(0,0,0,.45))`)}" viewBox="0 0 200 180" aria-hidden="true">
    <rect x="86" y="0" width="14" height="52" fill="#aeb6b0"/><rect x="70" y="0" width="46" height="14" rx="4" fill="#cfd6d0"/>
    <path d="M18 128 C 18 74 58 50 93 50 C 128 50 168 74 168 128 Z" fill="#3f6a52"/><path d="M18 128 C 18 74 58 50 93 50 C 80 70 66 96 66 128 Z" fill="#fff" opacity=".18"/><rect x="12" y="124" width="162" height="12" rx="6" fill="#2b4a38"/>
    <ellipse cx="93" cy="142" rx="34" ry="14" fill="#fff6c9"/><ellipse cx="93" cy="140" rx="22" ry="8" fill="#fffdf0"/></svg>`;
}

/** A ballpoint pen lying at an angle. */
function pen({ x, y, len = 340, rot = 0 }) {
  return `<svg style="${abs(x, y, len, 36, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 7px rgba(10,10,5,.45))`)}" viewBox="0 0 340 36" aria-hidden="true">
    <rect x="44" y="6" width="236" height="24" rx="11" fill="#26402f"/><rect x="44" y="6" width="236" height="7" rx="3" fill="#fff" opacity=".22"/>
    <rect x="60" y="2" width="168" height="6" rx="3" fill="#c9ced1"/><rect x="60" y="2" width="12" height="14" rx="3" fill="#aab1b5"/>
    <rect x="276" y="9" width="48" height="18" rx="7" fill="#c9ced1"/><rect x="318" y="14" width="18" height="8" rx="3" fill="#6f777c"/>
    <path d="M44 6 L18 14 V22 L44 30 Z" fill="#d8dddf"/><path d="M18 14 L2 18 L18 22 Z" fill="#33363b"/></svg>`;
}

/** A round steel-and-sage magnet. */
const magnet = (x, y, d = 44) => `<div style="${abs(x, y, d, d, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#8fb39b,#3f6a52 70%);box-shadow:0 5px 7px rgba(0,0,0,.45),inset 0 -3px 4px rgba(0,0,0,.25)`)}"></div>`;

/** A numbered badge for use in HTML. */
const numBadge = (n, { size = 52, bg = C.sageDeep, fg = "#fff", fs = 28 } = {}) => `<div style="width:${size}px;height:${size}px;flex:none;border-radius:50%;background:${bg};color:${fg};display:grid;place-items:center;font:600 ${fs}px/1 'Plex',sans-serif;box-shadow:0 3px 5px rgba(0,0,0,.25)">${n}</div>`;
/** A numbered badge as SVG. */
const svgBadge = (x, y, n, { r = 19, bg = C.sageDeep, fs = 22 } = {}) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + fs * 0.36}" text-anchor="middle" font-family="Plex,sans-serif" font-weight="600" font-size="${fs}" fill="#fff">${n}</text></g>`;

/** A painted cinder-block wall, with a soft light from a point. */
function blockWall({ top = SCENE_TOP, height = H, base = "#cdd5cb", mortar = "#a9b3a8", light = [0.78, 0.04], tone = 0.3, bw = 100, bh = 50 } = {}) {
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <pattern id="blk" width="${bw * 2}" height="${bh * 2}" patternUnits="userSpaceOnUse"><rect width="${bw * 2}" height="${bh * 2}" fill="${mortar}"/>
      <rect x="3" y="3" width="${bw - 6}" height="${bh - 6}" rx="4" fill="${base}"/><rect x="${bw + 3}" y="3" width="${bw - 6}" height="${bh - 6}" rx="4" fill="${base}"/>
      <rect x="${-bw / 2 + 3}" y="${bh + 3}" width="${bw - 6}" height="${bh - 6}" rx="4" fill="${base}"/><rect x="${bw / 2 + 3}" y="${bh + 3}" width="${bw - 6}" height="${bh - 6}" rx="4" fill="${base}"/><rect x="${bw * 1.5 + 3}" y="${bh + 3}" width="${bw - 6}" height="${bh - 6}" rx="4" fill="${base}"/></pattern>
    <filter id="bn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .1  0 0 0 .35 0"/></filter>
    <radialGradient id="bl" cx="${light[0] * 100}%" cy="${light[1] * 100}%" r="105%"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#101a14" stop-opacity="${tone}"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="url(#blk)"/><rect width="1000" height="${height}" filter="url(#bn)" opacity=".7"/><rect width="1000" height="${height}" fill="url(#bl)"/></svg>`;
}

/* ===================================================================== */
/* #28: two panels, "start from the day you wrote the list" vs "count from the last time"  */
/* ===================================================================== */
const i28 = idea(28);
const calendarMuted = `<svg viewBox="0 0 380 300" style="width:380px;height:300px;display:block" aria-hidden="true">
  <rect x="6" y="6" width="368" height="288" rx="14" fill="#fbfaf6" stroke="#aeb6af" stroke-width="3"/>
  <path d="M6 20 a14 14 0 0 1 14 -14 H360 a14 14 0 0 1 14 14 V62 H6 Z" fill="#a9b2ab"/>
  <rect x="86" y="-4" width="12" height="30" rx="6" fill="#6f7872"/><rect x="282" y="-4" width="12" height="30" rx="6" fill="#6f7872"/>
  ${Array.from({ length: 5 }, (_, r) => Array.from({ length: 7 }, (_, c) => `<rect x="${24 + c * 47}" y="${80 + r * 42}" width="38" height="32" rx="5" fill="${r === 2 && c === 3 ? "#8d968f" : "#eef0eb"}" stroke="#c4cac4" stroke-width="2"/>`).join("")).join("")}
  <rect x="${24 + 3 * 47}" y="${80 + 2 * 42}" width="38" height="32" rx="5" fill="#8d968f"/></svg>`;
const struckArrow = `<svg viewBox="0 0 380 150" style="width:380px;height:150px;display:block" aria-hidden="true">
  <path d="M190 4 V70" stroke="#8d968f" stroke-width="11" stroke-linecap="round" stroke-dasharray="2 18"/>
  <path d="M60 96 H300" stroke="#8d968f" stroke-width="11" stroke-linecap="round" stroke-opacity=".0"/>
  <path d="M40 100 C 120 60, 220 60, 320 100" fill="none" stroke="#8d968f" stroke-width="12" stroke-linecap="round" stroke-opacity=".75"/>
  <path d="M296 70 L330 104 L288 118" fill="none" stroke="#8d968f" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".75"/>
  <path d="M120 22 L250 140" stroke="#5a625d" stroke-width="12" stroke-linecap="round"/></svg>`;
const logLine = `<div style="display:flex;align-items:center;gap:16px;background:#fbfaf6;border:3px solid ${C.sage};border-radius:16px;padding:18px 20px;box-shadow:0 4px 8px rgba(30,60,40,.15)">
  <div style="flex:none">${icon("calendar-check", { size: 62, color: C.sageDeep, weight: "duotone" })}</div>
  <div style="flex:1"><div style="height:12px;border-radius:6px;background:#b7c6b8;width:92%"></div><div style="height:12px;border-radius:6px;background:#d0dacf;width:62%;margin-top:12px"></div></div>
  <div style="flex:none;width:58px;height:58px;border-radius:50%;background:${C.sage};display:grid;place-items:center;box-shadow:0 4px 6px rgba(0,0,0,.25)">${icon("check", { size: 36, color: "#fff", weight: "bold" })}</div></div>`;
const timeline = `<svg viewBox="0 0 380 150" style="width:380px;height:150px;display:block" aria-hidden="true">
  <path d="M40 76 H330" stroke="${C.sage}" stroke-width="8" stroke-linecap="round"/>
  ${[100, 160, 220, 280].map((xx) => `<path d="M${xx} 62 V90" stroke="${C.sage}" stroke-width="5" stroke-linecap="round" stroke-opacity=".6"/>`).join("")}
  <circle cx="40" cy="76" r="20" fill="${C.sageDeep}"/><circle cx="40" cy="76" r="8" fill="#fff"/>
  <path d="M318 40 V112" stroke="${C.sageDeep}" stroke-width="7" stroke-linecap="round"/><path d="M318 42 H364 L350 58 L364 74 H318 Z" fill="${C.sage}"/>
  <path d="M30 118 C 30 138 80 138 100 124" fill="none" stroke="${C.sageDeep}" stroke-width="0"/></svg>`;
const scene28 = `${blockWall({ base: "#d3dacf", mortar: "#aeb8ab", light: [0.8, 0.02], tone: 0.34 })}
  ${copper("M-10 1196 H1010", 26)}${rings([ring(150, 1182, 30, 54), ring(480, 1182, 30, 54), ring(820, 1182, 30, 54)])}
  <svg style="${abs(0, 1262, 1000, 94)}" viewBox="0 0 1000 94" aria-hidden="true"><defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6b9b0"/><stop offset="1" stop-color="#8a8e86"/></linearGradient></defs><rect width="1000" height="94" fill="url(#fl)"/><rect width="1000" height="6" fill="#6e7269"/><rect y="6" width="1000" height="3" fill="#fff" opacity=".35"/></svg>
  <div style="${abs(34, 408, 450, 700, "transform:rotate(-1.4deg);background:#f4f2ec;border-radius:10px;box-shadow:0 3px 4px rgba(20,25,20,.3),0 26px 40px rgba(20,25,20,.45)")}">
    <div style="position:absolute;left:30px;right:30px;top:26px;font:700 33px/1.12 'Plex',sans-serif;color:#5b625e">Start from the day you wrote the list</div>
    <div style="position:absolute;left:35px;top:134px;opacity:.95">${calendarMuted}</div>
    <div style="position:absolute;left:35px;top:424px;transform:scale(.8);transform-origin:0 0">${struckArrow}</div>
    <div data-check="caption" style="position:absolute;left:30px;right:30px;bottom:22px;height:112px;font:500 25px/1.28 'Plex',sans-serif;color:#4b524e;overflow:hidden">${esc(i28.items[0])}</div></div>
  <div style="${abs(516, 396, 450, 712, "transform:rotate(1.2deg);background:#e6efe4;border:4px solid #4f7a5c;border-radius:10px;box-shadow:0 3px 4px rgba(20,25,20,.3),0 26px 40px rgba(20,25,20,.45)")}">
    <div style="position:absolute;left:30px;right:30px;top:26px;font:700 33px/1.12 'Plex',sans-serif;color:${C.sageDeep}">Count from the last time it was done</div>
    <div style="position:absolute;left:30px;right:30px;top:154px">${logLine}</div>
    <div style="position:absolute;left:35px;top:340px">${timeline}</div>
    <div data-check="caption" style="position:absolute;left:30px;right:30px;bottom:22px;height:112px;font:500 25px/1.28 'Plex',sans-serif;color:${C.ink};overflow:hidden">${esc(i28.items[1])}</div></div>
  ${furnace({ x: 28, y: 1124, w: 300, h: 250 })}
  ${pen({ x: 560, y: 1292, len: 360, rot: -4 })}`;

/* ===================================================================== */
/* A house in section: shared by #30 (whole house) and #32 (the lower, closer crop)  */
/* ===================================================================== */
function houseSection({ viewBox, width, height, badges = [], markers = "", glow = false, ink = "#3f6a52", fill = "#f7f5ee", wall = "#e8ede4" }) {
  const b = badges.map(([x, y, n, o]) => svgBadge(x, y, n, o)).join("");
  return `<svg viewBox="${viewBox}" style="width:${width}px;height:${height}px;display:block" aria-hidden="true"><defs>
    <pattern id="hb" width="44" height="28" patternUnits="userSpaceOnUse"><rect width="44" height="28" fill="#d9dfd3"/><rect x="2" y="2" width="40" height="11" fill="#e8ecdf"/><rect x="-18" y="16" width="40" height="10" fill="#e8ecdf"/><rect x="24" y="16" width="40" height="10" fill="#e8ecdf"/></pattern>
    <linearGradient id="hf" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e3e8e2"/><stop offset="1" stop-color="#aab3ab"/></linearGradient>
    <linearGradient id="hh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f1f4ef"/><stop offset="1" stop-color="#9aa69d"/></linearGradient></defs>
    <!-- ground and basement walls -->
    <rect x="0" y="300" width="900" height="170" fill="#e9e5d8"/><path d="M0 300 H900" stroke="${ink}" stroke-width="5"/>
    <rect x="90" y="296" width="720" height="172" fill="url(#hb)" stroke="${ink}" stroke-width="5"/>
    <rect x="112" y="300" width="676" height="144" fill="${fill}"/><rect x="90" y="440" width="720" height="28" fill="#bcc5ba" stroke="${ink}" stroke-width="5"/>
    <!-- main floor -->
    <rect x="90" y="150" width="720" height="146" fill="${wall}" stroke="${ink}" stroke-width="5"/><rect x="112" y="156" width="676" height="130" fill="${fill}"/><rect x="104" y="286" width="692" height="16" fill="#c9b48f" stroke="${ink}" stroke-width="3"/>
    <!-- roof and attic -->
    <path d="M52 154 L450 22 L848 154 Z" fill="#dfe9dc" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/><path d="M96 150 L450 36 L804 150" fill="none" stroke="${ink}" stroke-width="3" stroke-opacity=".5"/><rect x="90" y="146" width="720" height="10" fill="#c9b48f" stroke="${ink}" stroke-width="3"/>
    <!-- gutter and downspout, left eave -->
    <path d="M30 150 H66 V166 Q66 178 54 178 H42 Q30 178 30 166 Z" fill="#cfd9cd" stroke="${ink}" stroke-width="4"/><rect x="62" y="170" width="16" height="130" fill="#cfd9cd" stroke="${ink}" stroke-width="4"/><path d="M62 300 q-14 0 -22 10" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
    <!-- kitchen: window, counter, fridge with coils -->
    <rect x="160" y="190" width="110" height="64" rx="4" fill="#dce8ea" stroke="${ink}" stroke-width="4"/><path d="M215 190 V254 M160 222 H270" stroke="${ink}" stroke-width="3"/>
    <rect x="520" y="226" width="130" height="60" fill="#ddd5c0" stroke="${ink}" stroke-width="4"/><rect x="514" y="216" width="142" height="12" rx="3" fill="#c9b48f" stroke="${ink}" stroke-width="3"/>
    <rect x="672" y="170" width="80" height="116" rx="8" fill="#f1f4ef" stroke="${ink}" stroke-width="4"/><path d="M672 218 H752" stroke="${ink}" stroke-width="3"/><rect x="738" y="186" width="5" height="24" rx="2" fill="${ink}"/><rect x="738" y="228" width="5" height="34" rx="2" fill="${ink}"/>
    <rect x="678" y="270" width="68" height="12" rx="2" fill="${ink}" opacity=".18"/>${[684, 696, 708, 720, 732].map((xx) => `<path d="M${xx} 272 V280" stroke="${ink}" stroke-width="3"/>`).join("")}
    <!-- ceiling alarm -->
    <rect x="440" y="156" width="20" height="8" fill="${ink}" opacity=".5"/><ellipse cx="450" cy="170" rx="30" ry="12" fill="#fbfaf6" stroke="${ink}" stroke-width="4"/><circle cx="450" cy="170" r="4" fill="${ink}"/>
    <!-- floor register over the furnace duct -->
    <rect x="232" y="296" width="60" height="8" rx="2" fill="#7f8a82"/>
    <!-- basement: furnace with filter slot -->
    <path d="M232 304 V336 M292 304 V336" stroke="${ink}" stroke-width="4"/><rect x="224" y="332" width="76" height="12" fill="#aab3ab" stroke="${ink}" stroke-width="3"/>
    <rect x="146" y="342" width="190" height="100" rx="6" fill="url(#hf)" stroke="${ink}" stroke-width="4"/><rect x="160" y="356" width="104" height="58" rx="4" fill="#d7ddd6" stroke="${ink}" stroke-width="3"/><circle cx="172" cy="368" r="4" fill="${ink}"/><circle cx="252" cy="368" r="4" fill="${ink}"/><rect x="190" y="380" width="50" height="22" rx="3" fill="#3b4741"/><rect x="195" y="385" width="40" height="12" rx="2" fill="#8fb39b"/>
    ${[422, 430].map((yy) => `<rect x="160" y="${yy}" width="104" height="4" rx="2" fill="#7f8a82"/>`).join("")}
    <rect x="334" y="384" width="62" height="40" rx="3" fill="#2f3a34"/><rect x="338" y="388" width="58" height="32" fill="#cdb089" stroke="#8a7350" stroke-width="2"/>${Array.from({ length: 6 }, (_, k) => `<path d="M${344 + k * 9.6} 390 V418" stroke="${k % 2 ? "#b79c76" : "#f4ead6"}" stroke-width="5"/>`).join("")}
    <!-- basement: water heater -->
    <rect x="596" y="304" width="12" height="30" fill="#b8683a"/><rect x="620" y="304" width="12" height="30" fill="#b8683a"/>
    <path d="M560 354 C 560 336 582 332 614 332 C 646 332 668 336 668 354 V 440 H 560 Z" fill="url(#hh)" stroke="${ink}" stroke-width="4"/><rect x="560" y="378" width="108" height="14" fill="#7aa485" opacity=".9"/><rect x="590" y="402" width="48" height="30" rx="4" fill="#fbfaf6" stroke="${ink}" stroke-width="2"/><circle cx="614" cy="417" r="9" fill="#e8ede6" stroke="${ink}" stroke-width="2"/>
    <path d="M614 334 V318 H112" fill="none" stroke="#7c4220" stroke-width="12" stroke-linejoin="round"/><path d="M614 334 V318 H112" fill="none" stroke="#b8683a" stroke-width="8" stroke-linejoin="round"/><path d="M614 331 V315 H112" fill="none" stroke="#e9a877" stroke-width="2" stroke-opacity=".8"/>
    ${[170, 420].map((xx) => `<rect x="${xx}" y="310" width="14" height="18" rx="3" fill="#d09061" stroke="#7c4220" stroke-width="2"/>`).join("")}
    ${markers}${b}</svg>`;
}

/* ===================================================================== */
/* #30: the house in section on paper, six numbered tags                    */
/* ===================================================================== */
const i30 = idea(30);
const tagIcons30 = ["wind", "flame", "drop", "snowflake", "house-line", "bell"];
const scene30 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0 H0 V40" fill="none" stroke="#c9d3c4" stroke-width="1.5"/></pattern></defs><rect width="1000" height="${H}" fill="#f4f2ec"/><rect width="1000" height="${H}" fill="url(#gr)"/></svg>
  <div style="${abs(50, 392, 900, 470, "")}">${houseSection({
    viewBox: "0 0 900 470",
    width: 900,
    height: 470,
    badges: [[385, 360, 1], [186, 326, 2], [640, 322, 3], [716, 150, 4], [26, 128, 5], [450, 214, 6]].map(([x, y, n]) => [x, y, n, { r: 22, fs: 26 }]),
  })}</div>
  ${[0, 1, 2, 3, 4, 5].map((k) => {
    const [job, when] = split(i30.items[k]);
    const x = 50 + (k % 2) * 460, y = 884 + Math.floor(k / 2) * 154;
    const kraft = k === 0;
    return `<div data-check="tag" style="${abs(x, y, 440, 142, `box-sizing:border-box;display:flex;align-items:center;gap:16px;padding:12px 18px;border-radius:16px;background:${kraft ? "linear-gradient(135deg,#d3b184,#c8a679)" : "linear-gradient(135deg,#e9f1e6,#d9e6d6)"};border:3px solid ${kraft ? "#8a6a3a" : C.sage};box-shadow:0 3px 4px rgba(30,40,30,.2),0 12px 18px rgba(30,40,30,.22);transform:rotate(${[-0.6, 0.5, 0.4, -0.5, -0.4, 0.6][k]}deg)`)}">
      ${numBadge(k + 1, { size: 52, fs: 28 })}
      <div style="flex:1;min-width:0"><div style="font:700 26px/1.12 'Plex',sans-serif;color:${C.ink}">${esc(job).replace("tune-up", '<span style="white-space:nowrap">tune-up</span>')}</div><div style="font:500 24px/1.2 'Plex',sans-serif;color:#3a463f;margin-top:6px">${esc(when)}</div></div>
      <div style="flex:none;opacity:.9">${icon(tagIcons30[k], { size: 44, color: kraft ? "#5a4020" : C.sageDeep, weight: "duotone" })}</div></div>`;
  }).join("")}`;

/* ===================================================================== */
/* #32: a close crop of the basement, three "needs a look" dots, on a dark wall    */
/* ===================================================================== */
const i32 = idea(32);
const ochreDot = (x, y, n) => `<circle cx="${x}" cy="${y}" r="30" fill="${C.ochre}" opacity=".18"/><circle cx="${x}" cy="${y}" r="21" fill="${C.ochre}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 9}" text-anchor="middle" font-family="Plex,sans-serif" font-weight="600" font-size="26" fill="#fff">${n}</text>`;
const keyTag = ({ x, y, rot }) => `<div style="${abs(x, y, 240, 330, `transform:rotate(${rot}deg);transform-origin:50% 0`)}">
  <svg style="position:absolute;left:0;top:0;width:240px;height:330px;filter:drop-shadow(0 12px 9px rgba(0,0,0,.5))" viewBox="0 0 240 330" aria-hidden="true">
    <circle cx="120" cy="14" r="9" fill="#9aa39d"/><circle cx="120" cy="50" r="30" fill="none" stroke="#c4cac4" stroke-width="7"/>
    <rect x="112" y="78" width="16" height="80" rx="6" fill="#d9b25a"/><rect x="112" y="116" width="34" height="10" fill="#d9b25a"/><rect x="112" y="136" width="26" height="9" fill="#d9b25a"/><circle cx="120" cy="82" r="5" fill="#9a7a2c"/>
    <path d="M60 168 H180 L204 196 V318 H36 V196 Z" fill="#cdb089" stroke="#8a6a3a" stroke-width="3"/><circle cx="120" cy="186" r="8" fill="#5a4630"/><path d="M60 168 H180 L204 196 H36 Z" fill="#fff" opacity=".2"/></svg>
  <div style="position:absolute;left:44px;right:44px;top:208px;font:600 38px/1.12 'Hand',cursive;color:#3a2a14;text-align:center">Three years ago</div></div>`;
const scene32 = `${blockWall({ base: "#355248", mortar: "#243a32", light: [0.18, 0.02], tone: 0.55 })}
  ${copper("M-10 428 H800 Q830 428 830 458 V520", 28)}${rings([ring(120, 413, 30, 58), ring(420, 413, 30, 58)])}
  <div style="${abs(40, 480, 920, 380, "background:#f4f2ec;border-radius:12px;box-shadow:0 3px 4px rgba(0,0,0,.4),0 28px 40px rgba(0,0,0,.55);overflow:hidden;transform:rotate(-0.6deg)")}">
    ${houseSection({
      viewBox: "104 150 700 320",
      width: 920,
      height: 380,
      markers: `${ochreDot(352, 398, 1)}${ochreDot(614, 376, 2)}${ochreDot(450, 206, 3)}`,
    })}</div>
  ${[[888, 138], [1038, 100], [1150, 182]].map(([yy, hh], k) => `<div data-check="item" style="${abs(40, yy, 640, hh, `box-sizing:border-box;display:flex;align-items:center;gap:18px;padding:14px 20px;border-radius:14px;background:#f4f2ec;box-shadow:0 3px 4px rgba(0,0,0,.35),0 14px 20px rgba(0,0,0,.4);transform:rotate(${[-0.4, 0.3, -0.3][k]}deg)`)}">
      ${numBadge(k + 1, { size: 50, bg: C.ochre, fs: 28 })}
      <div style="flex:1;min-width:0;font:500 25px/1.25 'Plex',sans-serif;color:${C.ink}">${esc(i32.items[k])}${k === 2 ? `<div style="margin-top:10px"><span class="example" style="font-size:24px;padding:5px 12px;color:#4b4339">Example</span></div>` : ""}</div></div>`).join("")}
  ${keyTag({ x: 712, y: 878, rot: 5 })}
  ${workLamp({ x: 44, y: 372, s: 0.5 })}
  <svg style="${abs(0, SCENE_TOP, 520, 360, "pointer-events:none")}" viewBox="0 0 520 360" aria-hidden="true"><defs><radialGradient id="ll" cx="20%" cy="0%" r="90%"><stop offset="0" stop-color="#fff2b8" stop-opacity=".38"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/></radialGradient></defs><rect width="520" height="360" fill="url(#ll)"/></svg>`;

/* ===================================================================== */
/* #34: the steel panel door with a kraft list held by magnets             */
/* ===================================================================== */
const i34 = idea(34);
const icons34 = ["snowflake", "wind", "washing-machine", "cooking-pot"];
const scene34 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <filter id="cn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="9"/><feColorMatrix values="0 0 0 0 .12  0 0 0 0 .12  0 0 0 0 .12  0 0 0 .6 0"/></filter>
    <filter id="cb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .25  0 0 0 0 .27  0 0 0 0 .24  0 0 0 .5 0"/></filter>
    <radialGradient id="cl" cx="50%" cy="0%" r="110%"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#17201a" stop-opacity=".42"/></radialGradient></defs>
    <rect width="1000" height="${H}" fill="#a2a69b"/><rect width="1000" height="${H}" filter="url(#cb)"/><rect width="1000" height="${H}" filter="url(#cn)" opacity=".45"/>
    ${[110, 330, 560, 820].map((yy) => [90, 910].map((xx) => `<circle cx="${xx}" cy="${yy}" r="9" fill="#4e5249" opacity=".7"/><circle cx="${xx}" cy="${yy + 2}" r="9" fill="#fff" opacity=".18"/><circle cx="${xx}" cy="${yy}" r="6" fill="#34382f" opacity=".8"/>`).join("")).join("")}
    <rect width="1000" height="${H}" fill="url(#cl)"/></svg>
  ${copper("M52 372 V1360", 26)}${copper("M948 372 V1360", 26)}${rings([ring(36, 520, 52, 28), ring(36, 900, 52, 28), ring(36, 1240, 52, 28), ring(932, 520, 52, 28), ring(932, 900, 52, 28), ring(932, 1240, 52, 28)])}
  <div style="${abs(118, 398, 764, 940, "border-radius:14px;background:linear-gradient(135deg,#c3cec5,#9fb0a5 60%,#8fa196);box-shadow:0 4px 6px rgba(10,15,10,.4),0 30px 50px rgba(10,15,10,.5);border:3px solid #6e7d73")}">
    <div style="position:absolute;inset:14px;border:3px solid rgba(60,80,68,.35);border-radius:8px"></div>
    <div style="position:absolute;left:0;top:0;width:100%;height:100%;border-radius:14px;background:linear-gradient(115deg,rgba(255,255,255,.28),rgba(255,255,255,0) 40%)"></div>
    ${[90, 460, 830].map((t) => `<div style="${abs(-14, t, 30, 70, "border-radius:6px;background:linear-gradient(90deg,#6f7a73,#aeb8b1,#6f7a73);box-shadow:0 4px 6px rgba(0,0,0,.35)")}"></div>`).join("")}
    <div style="${abs(690, 440, 40, 92, "border-radius:10px;background:linear-gradient(90deg,#838e87,#d3dad5,#838e87);box-shadow:0 5px 7px rgba(0,0,0,.4)")}"></div>
    <div style="${abs(656, 474, 108, 24, "border-radius:12px;background:linear-gradient(#e2e7e3,#8f9a93);box-shadow:0 4px 6px rgba(0,0,0,.35)")}"></div>
    <div style="${abs(296, 902, 172, 24, "border-radius:4px;background:#f4f2ec;box-shadow:inset 0 0 0 2px #8b958d")}"></div>
  </div>
  <div style="${abs(160, 440, 700, 800, "box-sizing:border-box;padding:40px 40px 30px;background:linear-gradient(135deg,#d6b88b,#c8a679);border-radius:8px;box-shadow:0 3px 4px rgba(20,12,4,.3),0 24px 36px rgba(20,12,4,.5);transform:rotate(-1.2deg)")}">
    ${[0, 1, 2, 3].map((k) => {
      const [job, when] = split(i34.items[k]);
      return `<div data-check="row" style="display:flex;align-items:center;gap:20px;height:174px;${k ? "border-top:3px dashed rgba(90,64,32,.38);" : ""}">
        <div style="flex:none;width:50px;height:50px;border:5px solid #4a3a22;border-radius:9px;background:rgba(255,255,255,.35)"></div>
        <div style="flex:none;width:76px;height:76px;border-radius:50%;background:${C.sageDeep};display:grid;place-items:center;box-shadow:0 4px 6px rgba(0,0,0,.3)">${icon(icons34[k], { size: 46, color: "#fff", weight: "regular" })}</div>
        <div style="flex:1;min-width:0"><div style="font:700 30px/1.12 'Plex',sans-serif;color:#26180a">${esc(job)}</div><div style="font:500 26px/1.2 'Plex',sans-serif;color:#3d2e17;margin-top:6px">${esc(when)}</div></div></div>`;
    }).join("")}</div>
  ${magnet(176, 454)}${magnet(814, 450)}${magnet(176, 1182)}${magnet(814, 1186)}`;

/* ===================================================================== */
/* #36: three shelves of before-after strips                                */
/* ===================================================================== */
const i36 = idea(36);
const strips36 = [
  { job: "Clear the gutters", chain: ["Water pools at the roof edge", "then soaks the fascia", "then rots wood you cannot see from the ground"], icons: ["drop", "wall", "tree"], art: "gutter" },
  { job: "Flush the water heater", chain: ["Sediment settles on the tank floor", "which lowers efficiency", "and shortens the tank's life"], icons: ["stack", "chart-line-down", "hourglass"], art: "tank" },
  { job: "Inspect the roof and flashing", chain: ["A small gap at a flashing joint becomes a leak", "then wet insulation", "then a stained ceiling"], icons: ["drop", "waves", "house-simple"], art: "roof" },
];
// Each job and chain is a cut of the bank item "<job>: <consequence>"; say so loudly if the wording ever drifts.
strips36.forEach((st, k) => {
  const [job, rest] = split(i36.items[k]);
  const flat = (t) => t.replace(/,/g, "");
  if (job !== st.job || flat(st.chain.join(" ")) !== flat(rest)) console.log(`⚠ #36 strip ${k + 1} differs from the bank: "${st.chain.join(" ")}" vs "${rest}"`);
});
function art36(kind) {
  if (kind === "gutter")
    return `<svg viewBox="0 0 250 170" style="width:250px;height:170px;display:block" aria-hidden="true"><rect width="250" height="170" rx="10" fill="#e6ede2"/>
      <path d="M250 6 L132 52 V84 L250 38 Z" fill="#9fb3a3" stroke="#4f7a5c" stroke-width="4" stroke-linejoin="round"/>
      <rect x="116" y="52" width="18" height="84" fill="#cdb089" stroke="#8a6a3a" stroke-width="3"/>
      <path d="M116 52 H52 V104 Q52 132 78 132 H104 Q116 132 116 122 Z" fill="#dfe6dc" stroke="#4f7a5c" stroke-width="5" stroke-linejoin="round"/>
      <g fill="#c4a35a" stroke="#8a6a2a" stroke-width="2"><ellipse cx="72" cy="86" rx="16" ry="8" transform="rotate(-14 72 86)"/><ellipse cx="98" cy="80" rx="16" ry="8" transform="rotate(12 98 80)"/><ellipse cx="84" cy="106" rx="18" ry="8"/></g><ellipse cx="86" cy="68" rx="15" ry="7" fill="#9bb07a" stroke="#6a7f48" stroke-width="2" transform="rotate(8 86 68)"/>
      <rect x="62" y="130" width="26" height="36" fill="#dfe6dc" stroke="#4f7a5c" stroke-width="5"/></svg>`;
  if (kind === "tank")
    return `<svg viewBox="0 0 250 170" style="width:250px;height:170px;display:block" aria-hidden="true"><rect width="250" height="170" rx="10" fill="#e6ede2"/>
      <rect x="86" y="6" width="14" height="22" fill="${COPPER[1]}"/><rect x="128" y="6" width="14" height="22" fill="${COPPER[1]}"/>
      <rect x="62" y="22" width="106" height="132" rx="26" fill="#f1f4ef" stroke="#4f7a5c" stroke-width="5"/><rect x="62" y="64" width="106" height="14" fill="#6f9a7c"/>
      <path d="M72 138 H158" stroke="#4f7a5c" stroke-width="5" stroke-linecap="round" stroke-dasharray="3 10"/><rect x="104" y="156" width="22" height="10" fill="#7f8a82"/></svg>`;
  return `<svg viewBox="0 0 250 170" style="width:250px;height:170px;display:block" aria-hidden="true"><rect width="250" height="170" rx="10" fill="#e6ede2"/>
    <path d="M14 140 L124 40 L234 140 Z" fill="#cfd9cd" stroke="#4f7a5c" stroke-width="5" stroke-linejoin="round"/>
    <rect x="148" y="30" width="34" height="62" fill="#dfe6dc" stroke="#4f7a5c" stroke-width="5"/><path d="M138 92 H192 L186 80 H144 Z" fill="#aab3ab" stroke="#4f7a5c" stroke-width="4" stroke-linejoin="round"/>
    <path d="M132 92 H198" stroke="#4f7a5c" stroke-width="5" stroke-linecap="round"/></svg>`;
}
const needsLook = `<div style="position:absolute;right:16px;top:12px;display:flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:#f6e9c4;border:2px solid ${C.ochre};font:600 22px/1 'Plex',sans-serif;color:${C.ochre}">${icon("magnifying-glass", { size: 24, color: C.ochre, weight: "bold" })}Needs a look</div>`;
const shelfY = [704, 1016, 1328];
const scene36 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <linearGradient id="sw" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3d5448"/><stop offset="1" stop-color="#1f2d25"/></linearGradient>
    <linearGradient id="sb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe3df"/><stop offset="1" stop-color="#8d948f"/></linearGradient></defs>
    <rect width="1000" height="${H}" fill="url(#sw)"/>
    <rect x="22" y="0" width="26" height="${H}" fill="#a3aca6"/><rect x="22" y="0" width="8" height="${H}" fill="#fff" opacity=".4"/><rect x="952" y="0" width="26" height="${H}" fill="#838d87"/>
    ${shelfY.map((y) => `<rect x="22" y="${y - SCENE_TOP}" width="956" height="22" fill="url(#sb)"/><rect x="22" y="${y - SCENE_TOP + 22}" width="956" height="20" fill="#000" opacity=".32"/>`).join("")}</svg>
  ${strips36.map((s, k) => {
    const yb = shelfY[k];
    const top = yb - 292;
    return `<div style="${abs(66, top, 296, 286, "box-sizing:border-box;padding:12px 12px 10px;border-radius:14px;background:linear-gradient(135deg,#d6b88b,#c8a679);box-shadow:0 3px 4px rgba(0,0,0,.35),0 14px 20px rgba(0,0,0,.45);transform:rotate(" + [-0.8, 0.6, -0.5][k] + "deg)")}">
        <div style="border-radius:10px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.25);width:272px;height:170px;display:flex;justify-content:center;background:#e6ede2"><div style="transform:scale(1.09);transform-origin:0 0;margin-left:0">${art36(s.art)}</div></div>
        <div data-check="job" style="display:flex;align-items:center;gap:10px;height:92px;font:700 28px/1.1 'Plex',sans-serif;color:#26180a"><span style="flex:none;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:${C.sageDeep}">${icon("check", { size: 26, color: "#fff", weight: "bold" })}</span><span>${esc(s.job)}</span></div></div>
      <div style="${abs(370, top + 100, 56, 70, "")}">${icon("arrow-right", { size: 52, color: "#e8ede4", weight: "bold" })}</div>
      <div style="${abs(432, top, 506, 286, "box-sizing:border-box;border-radius:14px;background:#f4f2ec;box-shadow:0 3px 4px rgba(0,0,0,.35),0 14px 20px rgba(0,0,0,.45);padding:62px 14px 10px;display:flex;gap:6px")}">${needsLook}
        ${s.chain.map((c, j) => `<div data-check="step" style="flex:1;min-width:0;height:206px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px;overflow:hidden">
          <div style="flex:none;width:62px;height:62px;border-radius:50%;background:${j === 2 ? "#f6e9c4" : C.sageSoft};border:3px solid ${j === 2 ? C.ochre : C.sage};display:grid;place-items:center">${icon(s.icons[j], { size: 36, color: j === 2 ? C.ochre : C.sageDeep, weight: "duotone" })}</div>
          <div style="font:600 22px/1.2 'Plex',sans-serif;color:${C.ink}">${esc(c)}</div></div>${j < 2 ? `<div style="flex:none;align-self:flex-start;margin-top:16px;color:${C.sage}">${icon("caret-right", { size: 26, color: C.sage, weight: "bold" })}</div>` : ""}`).join("")}</div>`;
  }).join("")}`;

/* ===================================================================== */
/* #38: the gutter cross-section, a sage line drawing on paper on a workbench  */
/* ===================================================================== */
const i38 = idea(38);
const SL = C.slate;
const ink38 = "#3f6a52";
const arrowHead = (x, y, ang, len = 30, wid = 15, col = SL) => {
  const c = Math.cos(ang), n = Math.sin(ang);
  return `<path d="M${x} ${y} L${x - c * len - n * wid} ${y - n * len + c * wid} L${x - c * len + n * wid} ${y - n * len - c * wid} Z" fill="${col}"/>`;
};
const roofY = (x) => 232 - 0.377 * (x - 330); // top of the roof deck
const gutterDiagram = `<svg viewBox="0 0 860 560" style="width:860px;height:560px;display:block" aria-hidden="true">
  <g transform="translate(-30 0)">
    <path d="M60 548 H840" stroke="${ink38}" stroke-width="5"/>
    <!-- house wall -->
    <rect x="640" y="150" width="40" height="398" fill="#e8e4d6" stroke="${ink38}" stroke-width="5"/>${[200, 270, 340, 410, 480].map((yy) => `<path d="M640 ${yy} H680" stroke="${ink38}" stroke-width="2" stroke-opacity=".35"/>`).join("")}
    <!-- soffit -->
    <rect x="320" y="392" width="320" height="14" fill="#e8dcc0" stroke="${ink38}" stroke-width="4"/>
    <!-- roof deck (the sheathing), shingles on top -->
    <path d="M330 ${roofY(330)} L860 ${roofY(860)} V${roofY(860) + 40} L330 ${roofY(330) + 40} Z" fill="#e8dcc0" stroke="${ink38}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M326 ${roofY(326) - 16} L860 ${roofY(860) - 16} V${roofY(860)} L326 ${roofY(326)} Z" fill="#cfdccb" stroke="${ink38}" stroke-width="5" stroke-linejoin="round"/>
    ${[420, 510, 600, 690, 780].map((xx) => `<path d="M${xx} ${roofY(xx) - 16} V${roofY(xx)}" stroke="${ink38}" stroke-width="3" stroke-opacity=".5"/>`).join("")}
    <!-- fascia board -->
    <rect x="300" y="${roofY(330) - 8}" width="32" height="${392 - roofY(330) + 22}" fill="#e8dcc0" stroke="${ink38}" stroke-width="5"/><path d="M310 262 V386 M322 258 V380" stroke="${ink38}" stroke-width="2" stroke-opacity=".35"/>
    <!-- gutter, full of leaves -->
    <path d="M300 222 H212 V300 Q212 346 258 346 H288 Q300 346 300 332 Z" fill="#dfe6dc" stroke="${ink38}" stroke-width="6" stroke-linejoin="round"/>
    <g fill="#c4a35a" stroke="#8a6a2a" stroke-width="3"><ellipse cx="236" cy="262" rx="28" ry="13" transform="rotate(-18 236 262)"/><ellipse cx="274" cy="252" rx="28" ry="13" transform="rotate(14 274 252)"/><ellipse cx="252" cy="286" rx="30" ry="13" transform="rotate(-6 252 286)"/><ellipse cx="228" cy="306" rx="22" ry="11" transform="rotate(20 228 306)"/><ellipse cx="274" cy="312" rx="24" ry="11" transform="rotate(-16 274 312)"/></g>
    <g fill="#9bb07a" stroke="#6a7f48" stroke-width="3"><ellipse cx="258" cy="232" rx="30" ry="12" transform="rotate(6 258 232)"/><ellipse cx="226" cy="238" rx="22" ry="10" transform="rotate(-14 226 238)"/></g>
    <!-- downspout -->
    <rect x="224" y="344" width="36" height="204" fill="#dfe6dc" stroke="${ink38}" stroke-width="5"/><rect x="214" y="540" width="56" height="12" rx="3" fill="${ink38}"/>
    <!-- water: down the roof, backing up at the edge, then into the board -->
    <path d="M630 ${roofY(630) - 52} L372 ${roofY(372) - 44}" stroke="${SL}" stroke-width="9" stroke-linecap="round" stroke-dasharray="26 16"/>
    <path d="M630 ${roofY(630) - 52} L400 ${roofY(400) - 46}" stroke="${SL}" stroke-width="9" stroke-linecap="round" opacity="0"/>
    ${arrowHead(372, roofY(372) - 44, Math.atan2(roofY(372) - roofY(630) + 8, 372 - 630))}
    <path d="M248 176 Q 306 166 312 ${roofY(330) - 10}" fill="none" stroke="${SL}" stroke-width="9" stroke-linecap="round"/>${arrowHead(312, roofY(330) + 4, Math.PI / 2 - 0.05)}
    ${[[318, 276], [316, 322], [318, 366]].map(([a, b]) => `<path d="M${a} ${b - 14} q-9 14 -9 20 a9 9 0 0 0 18 0 q0 -6 -9 -20 Z" fill="${SL}"/>`).join("")}
    <!-- hidden rot: a dashed ochre marker inside the board -->
    <rect x="292" y="300" width="48" height="96" rx="10" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="9 8" opacity="0"/>
    <rect x="296" y="330" width="40" height="64" rx="10" fill="none" stroke="${C.ochre}" stroke-width="5" stroke-dasharray="9 8"/>
    ${svgBadge(168, 240, 1, { r: 27, bg: SL, fs: 31 })}
    ${svgBadge(386, 262, 2, { r: 27, bg: SL, fs: 31 })}
    ${svgBadge(388, 366, 3, { r: 27, bg: C.ochre, fs: 31 })}
    <path d="M470 ${roofY(470) + 42} V 292" stroke="${C.sageDeep}" stroke-width="4"/>${svgBadge(470, 318, 4, { r: 27, bg: C.sageDeep, fs: 31 })}
  </g></svg>`;
const scene38 = `${desk({ top: SCENE_TOP, height: H, base: "#c99b66", dark: "#a97b45", planks: 5, seed: 21 })}
  <svg style="${abs(0, SCENE_TOP, 1000, H, "pointer-events:none")}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><radialGradient id="wb" cx="70%" cy="6%" r="75%"><stop offset="0" stop-color="#fff3c2" stop-opacity=".5"/><stop offset="1" stop-color="#fff3c2" stop-opacity="0"/></radialGradient></defs><rect width="1000" height="${H}" fill="url(#wb)"/></svg>
  <div style="${abs(56, 400, 888, 612, "background:#f4f2ec;border-radius:4px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 22px 38px rgba(40,20,5,.45);transform:rotate(-0.8deg);overflow:hidden")}">
    <div style="position:absolute;left:14px;top:20px;width:860px;height:560px;overflow:hidden">${gutterDiagram}</div>
    <span class="example" style="position:absolute;right:22px;top:20px;font-size:26px;padding:5px 12px;background:#f4f2ec;color:#4b4339">Example</span>
  </div>
  ${[0, 1, 2, 3].map((k) => {
    const x = 56 + (k % 2) * 456, y = 1040 + Math.floor(k / 2) * 150;
    return `<div data-check="caption" style="${abs(x, y, 432, 138, `box-sizing:border-box;display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px;background:linear-gradient(135deg,#d6b88b,#c8a679);border:2px solid #8a6a3a;box-shadow:0 3px 4px rgba(40,20,5,.3),0 14px 20px rgba(40,20,5,.4);transform:rotate(${[-0.5, 0.4, 0.4, -0.4][k]}deg)`)}">
      ${numBadge(k + 1, { size: 48, bg: k === 2 ? C.ochre : k === 3 ? C.sageDeep : SL, fs: 27 })}
      <div style="flex:1;min-width:0;font:600 24px/1.22 'Plex',sans-serif;color:#26180a">${esc(i38.items[k])}</div></div>`;
  }).join("")}
  ${pencil({ x: 600, y: 985, len: 340, rot: -4 })}`;

export const pins = [
  printable({ n: 28, scene: scene28, paper: "#e7ede4" }),
  printable({ n: 30, scene: scene30, paper: "#f4f2ec" }),
  printable({ n: 32, scene: scene32, paper: "#e4eae6" }),
  printable({ n: 34, scene: scene34, paper: "#ebe9df", extraCss: ".top h1{font-size:76px}" }),
  printable({ n: 36, scene: scene36, paper: "#efe9dc" }),
  printable({ n: 38, scene: scene38, paper: "#f1e8d6" }),
];
