/**
 * ADHD Life Companion pins, group C: kitchen-table morning, sofa evening, bedside.
 * #3  "How this book works" (book p2) on a pale-oak kitchen table: mug, toast plate, mail pile
 * #7  "Waiting on someone" (book p4) on a slate sofa cushion: throw blanket, lamplight, phone face down
 * #11 "Ongoing thread" (book p5) on a nightstand: lamp, glass of water, a second copy beneath
 *
 * Every page is the real printed page image, untouched. Props lie beside or on the blank part of a page.
 */
import { idea, C } from "../kit/bank.mjs";
import { bookPage } from "../kit/assets.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, sheet, pencil, mug } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/** A butter sticky note (blank, or with a short handwritten label). */
const sticky = ({ x, y, size = 190, rot = 4, text = "", color = "#f4dc8e" }) =>
  `<div style="${abs(x, y, size, size, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},#ecc96b);box-shadow:0 2px 3px rgba(40,20,5,.25),0 14px 18px rgba(40,20,5,.35);display:grid;place-items:center;text-align:center;padding:14px`)}"><span class="hand" style="font:600 36px/1.05 'Hand',cursive;color:#5f3d4b">${text}</span></div>`;

/** A ballpoint pen lying at an angle. */
const pen = ({ x, y, len = 400, rot = 0, body = "#5f3d4b", trim = "#d6b36a" }) =>
  `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;

/** A plate seen from above with two slices of toast. */
const toastPlate = ({ x, y, size = 250 }) =>
  `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 16px 10px rgba(40,20,5,.38))")}" viewBox="0 0 250 250" aria-hidden="true">
    <circle cx="125" cy="125" r="120" fill="#f4efe6"/><circle cx="125" cy="125" r="120" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/>
    <circle cx="125" cy="125" r="92" fill="#ebe4d7"/><circle cx="125" cy="125" r="92" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>
    <g transform="rotate(-14 125 125)">
      <rect x="62" y="64" width="112" height="104" rx="28" fill="#c78a45"/><rect x="70" y="72" width="96" height="88" rx="22" fill="#e6b46a"/><rect x="80" y="82" width="76" height="68" rx="16" fill="#efc785" opacity=".7"/></g>
    <g transform="rotate(10 125 125) translate(50 12)">
      <rect x="52" y="76" width="112" height="104" rx="28" fill="#c78a45"/><rect x="60" y="84" width="96" height="88" rx="22" fill="#e9bb72"/><rect x="70" y="94" width="76" height="68" rx="16" fill="#f1cb8c" opacity=".7"/>
      <ellipse cx="108" cy="130" rx="26" ry="16" fill="#b86a8a" opacity=".55"/></g></svg>`;

/** An envelope seen from above. */
const envelope = ({ x, y, w = 260, rot = 0, c1 = "#d8bb8e", c2 = "#c8a679", window: win = false }) => {
  const h = w * 0.66;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 7px rgba(40,20,5,.35))`)}" viewBox="0 0 260 172" aria-hidden="true">
    <rect width="260" height="172" rx="6" fill="${c1}"/><path d="M0 0 L130 98 L260 0 Z" fill="${c2}"/><path d="M0 172 L104 84 M260 172 L156 84" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M0 0 L130 98 L260 0" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>
    ${win ? `<rect x="150" y="112" width="86" height="34" rx="4" fill="#f4efe6" opacity=".85"/>` : ""}</svg>`;
};

/** A cream index card with ruled lines; optional handwritten label. */
const indexCard = ({ x, y, w = 330, rot = 0, text = "" }) => {
  const h = Math.round(w * 0.62);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fbf4e6;border-radius:5px;box-shadow:0 2px 3px rgba(40,20,5,.25),0 16px 22px rgba(20,10,5,.4);overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:64px;height:3px;background:#d9818e;opacity:.6"></div>
    ${[104, 142, 180].filter((t) => t < h - 6).map((t) => `<div style="position:absolute;left:0;right:0;top:${t}px;height:2px;background:#9db6cc;opacity:.55"></div>`).join("")}
    <span style="position:absolute;left:22px;top:16px;font:600 40px/1 'Hand',cursive;color:#3c3350">${text}</span></div>`;
};

/** A phone lying face down: back, camera bump. */
const phoneDown = ({ x, y, rot = 0, w = 200, color = "#2e2a33" }) => {
  const h = w * 2.05;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:34px;background:linear-gradient(145deg,${color},#1b181f);box-shadow:inset 0 0 0 3px rgba(255,255,255,.07),0 3px 4px rgba(0,0,0,.4),0 24px 30px rgba(0,0,0,.5)`)}">
    <div style="position:absolute;left:16px;top:16px;width:78px;height:78px;border-radius:22px;background:#12101a;box-shadow:inset 0 0 0 3px rgba(255,255,255,.08)"></div>
    <div style="position:absolute;left:28px;top:28px;width:24px;height:24px;border-radius:50%;background:#2a3140;box-shadow:inset 0 0 0 3px #444a58"></div>
    <div style="position:absolute;left:58px;top:58px;width:24px;height:24px;border-radius:50%;background:#2a3140;box-shadow:inset 0 0 0 3px #444a58"></div>
    <div style="position:absolute;left:${w / 2 - 14}px;top:${h / 2 - 14}px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.1)"></div></div>`;
};

/* ------------------------------------------------------------------ #3 */
function p3() {
  const scene = `
  ${desk({ top: 372, height: 982, base: "#dcbd8f", dark: "#cfae7c", planks: 5, seed: 5 })}
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 100% 80% at 20% 15%,rgba(255,245,220,.35),rgba(255,245,220,0) 70%)")}"></div>
  ${sheet({ src: bookPage(2), x: 96, y: 424, w: 640, tilt: -3 })}
  ${sticky({ x: 176, y: 1128, size: 180, rot: -6 })}
  ${pen({ x: 400, y: 1180, len: 340, rot: 8, body: "#86586a" })}
  ${mug({ x: 752, y: 424, size: 160, color: "#f6efe4", drink: "#5a3a22" })}
  ${toastPlate({ x: 740, y: 700, size: 250 })}
  ${envelope({ x: 726, y: 1042, w: 250, rot: 8, window: true })}
  ${envelope({ x: 744, y: 1070, w: 230, rot: -5, c1: "#f4ecdc", c2: "#e6dac2" })}
  ${envelope({ x: 790, y: 1150, w: 200, rot: 14, c1: "#cfae80", c2: "#bf9a6a" })}`;
  return printable({ n: 3, scene, paper: "#f1e7eb" });
}

/* ------------------------------------------------------------------ #7 */
function p7() {
  const scene = `
  <div style="${abs(0, 372, 1000, 982, "background:linear-gradient(180deg,#5d7886,#4d6775)")}"></div>
  <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(20,40,55,.07) 0 2px,transparent 2px 5px)")}"></div>
  <div style="${abs(0, 1128, 810, 6, "background:#a9bfca;box-shadow:0 2px 3px rgba(0,0,0,.3);opacity:.8")}"></div>
  <!-- sofa arm -->
  <div style="${abs(830, 340, 240, 1020, "border-radius:100px 0 0 100px;background:linear-gradient(90deg,#3f5866,#587583 45%,#4a6574);box-shadow:-20px 0 34px rgba(10,25,35,.5),inset 6px 0 0 #a9bfca")}"></div>
  <!-- lamplight pooling from the top right -->
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 620px 560px at 880px 420px,rgba(255,196,130,.32),rgba(255,196,130,0) 72%),radial-gradient(ellipse 130% 110% at 55% 45%,rgba(0,0,0,0) 40%,rgba(8,16,24,.55) 100%)")}"></div>
  <!-- throw blanket, draped from the lower right over the arm -->
  <svg style="${abs(470, 1040, 560, 330, "filter:drop-shadow(-10px 14px 16px rgba(0,0,0,.45))")}" viewBox="0 0 560 330" aria-hidden="true">
    <defs><pattern id="knit" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#efe3d3"/><path d="M0 11 L11 0 L22 11 L11 22 Z" fill="none" stroke="#d5c3ac" stroke-width="2"/></pattern></defs>
    <path d="M110 330 C 140 230, 90 150, 190 90 C 270 40, 420 20, 560 0 L560 330 Z" fill="url(#knit)"/>
    <path d="M110 330 C 140 230, 90 150, 190 90 C 270 40, 420 20, 560 0" fill="none" stroke="#c9b79e" stroke-width="5"/>
    <path d="M150 330 C 178 244, 136 176, 218 122 C 290 78, 420 52, 560 34" fill="none" stroke="#86586a" stroke-width="14"/>
    <path d="M176 330 C 202 252, 164 192, 238 142 C 304 100, 424 76, 560 58" fill="none" stroke="#86586a" stroke-width="5"/></svg>
  ${sheet({ src: bookPage(4), x: 64, y: 430, w: 640, tilt: 2 })}
  ${indexCard({ x: 716, y: 440, w: 260, rot: -4, text: "Check back on" })}
  ${phoneDown({ x: 736, y: 700, rot: 6, w: 170 })}
  ${pen({ x: 150, y: 1228, len: 380, rot: -4, body: "#5f3d4b", trim: "#d6b36a" })}`;
  return printable({ n: 7, scene, paper: "#e8dfe3" });
}

/* ------------------------------------------------------------------ #11 */
function p11() {
  const ring = (cx, cy, r, c, o = 1) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="${o}"/>`;
  const scene = `
  ${desk({ top: 372, height: 982, base: "#5a3a3a", dark: "#4b2f33", planks: 3, seed: 21 })}
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 760px 700px at 860px 470px,rgba(255,208,140,.6),rgba(255,208,140,0) 72%),radial-gradient(ellipse 120% 100% at 55% 50%,rgba(0,0,0,0) 35%,rgba(15,6,14,.7) 100%)")}"></div>
  <!-- the second copy, a page underneath (the same printed page) -->
  ${sheet({ src: bookPage(5), x: 168, y: 470, w: 600, tilt: 9 })}
  ${sheet({ src: bookPage(5), x: 96, y: 436, w: 620, tilt: -3 })}
  ${indexCard({ x: 150, y: 1030, w: 300, rot: -4 })}
  ${pen({ x: 340, y: 1200, len: 360, rot: 5, body: "#23202a", trim: "#d6b36a" })}
  <!-- lamp, seen from above: shade and base -->
  <svg style="${abs(760, 372, 280, 280, "filter:drop-shadow(0 16px 14px rgba(0,0,0,.5))")}" viewBox="0 0 280 280" aria-hidden="true">
    ${ring(140, 140, 130, "#e9d3b0")}${ring(140, 140, 110, "#f6e4bd")}${ring(140, 140, 70, "#fff0cf")}${ring(140, 140, 24, "#b9946a")}${ring(140, 140, 8, "#d9bf94")}
    ${[0,1,2,3,4,5,6,7,8,9,10,11].map((k)=>`<line x1="${140+Math.cos(k*Math.PI/6)*28}" y1="${140+Math.sin(k*Math.PI/6)*28}" x2="${140+Math.cos(k*Math.PI/6)*128}" y2="${140+Math.sin(k*Math.PI/6)*128}" stroke="#b99466" stroke-opacity=".5" stroke-width="3"/>`).join("")}<circle cx="140" cy="140" r="130" fill="none" stroke="#a9835a" stroke-width="4"/></svg>
  <!-- glass of water on a coaster -->
  <svg style="${abs(700, 1020, 270, 270, "filter:drop-shadow(0 18px 14px rgba(0,0,0,.55))")}" viewBox="0 0 270 270" aria-hidden="true">
    ${ring(135, 135, 128, "#e8dfd3")}<circle cx="135" cy="135" r="128" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
    ${ring(135, 135, 96, "#cfe0e6", 0.92)}${ring(135, 135, 82, "#a9c6d1", 0.8)}${ring(135, 135, 60, "#c4dbe3", 0.7)}
    <circle cx="135" cy="135" r="96" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="5"/>
    <path d="M78 98 C 92 72, 122 62, 150 66" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="9" stroke-linecap="round"/></svg>`;
  return printable({ n: 11, scene, paper: "#efe5ea" });
}

export const pins = [p3(), p7(), p11()];
