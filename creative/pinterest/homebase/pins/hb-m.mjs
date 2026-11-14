/**
 * Group M: old house and rental. Home Base guide pins #70, #72, #74, #76, #78, #80, #82, #84.
 * Eight different surfaces and moods: a dark water-heater tank lit by a flashlight (70), a dusk-sky house
 * cutaway (72), a cream graph-paper sketch with big ringed objects (74), a sage felt-lined heirloom drawer (76),
 * brown kraft paper (78), a butter legal pad (80), an oak table with a floor plan (82) and a herringbone parquet
 * floor with Polaroids (84). Every word is the idea bank's, or a label that is a cut of the idea's own items
 * (see the report). No printed workbook page or app screen is used (guide pins); nothing is drawn on one.
 */
import { esc } from "../../v3/kit.mjs";
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const svg = (x, y, w, h, vb, inner, extra = "") => `<svg style="${abs(x, y, w, h, extra)}" viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
const SH = "filter:drop-shadow(0 12px 9px rgba(10,15,12,.4))";
const CARD = "background:#fbfaf6;border-radius:12px;box-shadow:0 3px 4px rgba(20,30,20,.28),0 18px 32px rgba(20,30,20,.34)";
const exTag = (x, y) => `<span class="example" style="position:absolute;left:${x}px;top:${y}px;font-size:24px;padding:6px 12px;background:#fbfaf6;color:#4b4339">Example</span>`;
const badge = (n, x, y, s = 56, bg = C.sage) => `<div style="${abs(x, y, s, s, `border-radius:50%;background:${bg};color:#fff;display:grid;place-items:center;font:700 ${Math.round(s * 0.55)}px/1 'Plex',sans-serif;box-shadow:0 4px 6px rgba(0,0,0,.35);border:3px solid #fbfaf6;box-sizing:border-box`)}">${n}</div>`;
const tick = (size = 34, filled = true, color = C.sage) =>
  `<span style="display:inline-grid;place-items:center;flex:none;width:${size}px;height:${size}px;border:3px solid ${color};border-radius:8px;background:${filled ? color : "transparent"}">${filled ? icon("check", { size: size - 8, color: "#fff", weight: "bold" }) : ""}</span>`;
/** Photo-frame corner brackets around a box. */
const corners = (x, y, w, h, c = C.sage, t = 5, l = 26) => {
  const b = (px, py, bt, br, bb, bl) => `<div style="${abs(px, py, l, l, `border-style:solid;border-color:${c};border-width:${bt}px ${br}px ${bb}px ${bl}px`)}"></div>`;
  return b(x, y, t, 0, 0, t) + b(x + w - l, y, t, t, 0, 0) + b(x, y + h - l, 0, 0, t, t) + b(x + w - l, y + h - l, 0, t, t, 0);
};

/* ---------- props: brass keys, flashlight, phone ---------- */

function brassKey({ x, y, len = 260, rot = 0, bow = 1 }) {
  const h = len * 0.4;
  return svg(x, y, len, h, "0 0 260 104", `<defs><linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d98a"/><stop offset=".5" stop-color="#d1a640"/><stop offset="1" stop-color="#97701d"/></linearGradient></defs>
    <path fill-rule="evenodd" d="M40 14 C 62 14 76 30 76 52 C 76 74 62 90 40 90 C 18 90 4 74 4 52 C 4 30 18 14 40 14Z M40 34 C 30 34 24 42 24 52 C 24 62 30 70 40 70 C 50 70 56 62 56 52 C 56 42 50 34 40 34Z" fill="url(#br)"/>
    <rect x="72" y="45" width="168" height="14" rx="4" fill="url(#br)"/><rect x="86" y="36" width="12" height="32" rx="3" fill="url(#br)"/><rect x="112" y="40" width="8" height="24" rx="3" fill="url(#br)"/>
    <path d="M196 59 H240 V86 H226 V74 H214 V86 H196Z" fill="url(#br)"/><rect x="72" y="46" width="168" height="4" fill="#fff" opacity=".4"/>`, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,10,0,.45))`);
}
function keyRing({ x, y, w = 150, rot = 0 }) {
  return svg(x, y, w, w, "0 0 100 100", `<circle cx="50" cy="50" r="40" fill="none" stroke="#7d8388" stroke-width="7"/><circle cx="50" cy="50" r="40" fill="none" stroke="#dfe3e6" stroke-width="3" stroke-dasharray="40 20"/>`, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 5px rgba(20,10,0,.4))`);
}
function flashlight({ x, y, len = 340, rot = 0 }) {
  return svg(x, y, len, len * 0.3, "0 0 340 102", `<defs><linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6660"/><stop offset=".45" stop-color="#2c3430"/><stop offset="1" stop-color="#171c19"/></linearGradient></defs>
    <rect x="0" y="32" width="30" height="40" rx="10" fill="#171c19"/><rect x="24" y="36" width="170" height="32" rx="4" fill="url(#fl)"/><rect x="80" y="36" width="14" height="32" fill="${C.sage}"/>
    ${Array.from({ length: 8 }, (_, k) => `<rect x="${112 + k * 9}" y="38" width="3" height="28" fill="#fff" opacity=".12"/>`).join("")}
    <path d="M194 36 L240 14 V90 L194 68Z" fill="url(#fl)"/><rect x="236" y="8" width="16" height="86" rx="5" fill="#3a4540"/><ellipse cx="252" cy="51" rx="9" ry="38" fill="#fdf3c8"/>`, `transform:rotate(${rot}deg);${SH}`);
}
function phoneFlat({ x, y, w = 260, h = 500, rot = 0, screen = "" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:40px;background:#1b1820;box-shadow:0 3px 4px rgba(0,0,0,.35),0 24px 40px rgba(0,0,0,.4)`)}">
    <div style="${abs(11, 11, w - 22, h - 22, "border-radius:30px;background:#f4f2ee;overflow:hidden")}">${screen}</div>
    <div style="${abs(w / 2 - 38, 20, 76, 22, "border-radius:12px;background:#1b1820")}"></div></div>`;
}

/* ---------- house objects (all flat vector) ---------- */

function waterHeater({ x, y, w = 120, plate = true }) {
  return svg(x, y, w, w * 200 / 120, "0 0 120 200", `<defs><linearGradient id="whg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4f6f2"/><stop offset=".4" stop-color="#e0e6e0"/><stop offset="1" stop-color="#9aa69d"/></linearGradient></defs>
    <rect x="30" y="0" width="12" height="34" fill="#b9733f"/><rect x="30" y="0" width="4" height="34" fill="#e9a877" opacity=".8"/><rect x="78" y="0" width="12" height="34" fill="${C.slate}"/><rect x="78" y="0" width="4" height="34" fill="#fff" opacity=".3"/>
    <path d="M14 62 C14 38 34 30 60 30 C86 30 106 38 106 62 V180 Q106 194 92 194 H28 Q14 194 14 180Z" fill="url(#whg)"/>
    <rect x="14" y="108" width="92" height="12" fill="${C.sage}" opacity=".85"/>
    ${plate ? `<rect x="34" y="72" width="52" height="30" rx="3" fill="#fbfaf6" stroke="#9aa69d" stroke-width="2"/><rect x="40" y="79" width="40" height="4" rx="2" fill="#aab4ac"/><rect x="40" y="88" width="28" height="4" rx="2" fill="#aab4ac"/>` : ""}
    <rect x="102" y="132" width="14" height="10" rx="3" fill="#9a8f7a"/><rect x="40" y="152" width="40" height="26" rx="4" fill="#3b4741"/><circle cx="60" cy="165" r="7" fill="#8fb39b"/>`);
}
function furnaceObj({ x, y, w = 160 }) {
  return svg(x, y, w, w, "0 0 160 160", `<path d="M44 0 H116 L128 26 H32Z" fill="#c4ccc5"/><rect x="12" y="24" width="136" height="130" rx="8" fill="#d4dad3" stroke="#7f8a82" stroke-width="3"/>
    <rect x="22" y="36" width="88" height="62" rx="5" fill="#e6ebe7" stroke="#8b958d" stroke-width="2"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="30" y="${46 + k * 9}" width="72" height="4" rx="2" fill="#98a39b"/>`).join("")}
    <rect x="22" y="106" width="88" height="38" rx="5" fill="#dfe5e1" stroke="#8b958d" stroke-width="2"/><circle cx="40" cy="125" r="8" fill="${C.sage}"/><rect x="60" y="116" width="40" height="18" rx="3" fill="#3b4741"/>
    <rect x="118" y="36" width="22" height="108" rx="4" fill="#c4ccc5"/>`);
}
function panelObj({ x, y, w = 140 }) {
  return svg(x, y, w, w * 1.2, "0 0 140 168", `<rect x="8" y="6" width="124" height="156" rx="7" fill="#c9cfca" stroke="#7f8a82" stroke-width="3"/><rect x="18" y="16" width="104" height="136" rx="4" fill="#e3e7e2" stroke="#9aa59d" stroke-width="2"/>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="26" y="${26 + k * 16}" width="34" height="11" rx="2" fill="#2f3a34"/><rect x="26" y="${26 + k * 16}" width="17" height="11" rx="2" fill="#5d6a63"/><rect x="80" y="${26 + k * 16}" width="34" height="11" rx="2" fill="#2f3a34"/><rect x="97" y="${26 + k * 16}" width="17" height="11" rx="2" fill="#5d6a63"/>`).join("")}
    <rect x="52" y="124" width="36" height="22" rx="2" fill="#f6f3ea" stroke="#b8a77a" stroke-width="1.5" transform="rotate(-3 70 135)"/><rect x="57" y="130" width="26" height="3" fill="#aaa28a" transform="rotate(-3 70 135)"/><rect x="57" y="137" width="18" height="3" fill="#aaa28a" transform="rotate(-3 70 135)"/>`);
}
function washerObj({ x, y, w = 150 }) {
  return svg(x, y, w, w * 1.08, "0 0 150 162", `<rect x="8" y="4" width="134" height="154" rx="8" fill="#eef0ec" stroke="#8b958d" stroke-width="3"/><rect x="8" y="4" width="134" height="30" rx="8" fill="#dfe4de"/>
    <circle cx="30" cy="19" r="8" fill="${C.sage}"/><circle cx="56" cy="19" r="6" fill="#98a39b"/><rect x="92" y="13" width="38" height="12" rx="3" fill="#3b4741"/>
    <circle cx="75" cy="94" r="46" fill="#c4ccc5" stroke="#8b958d" stroke-width="3"/><circle cx="75" cy="94" r="36" fill="#586a73"/><circle cx="75" cy="94" r="36" fill="none" stroke="#e8eeee" stroke-width="3"/><path d="M52 80 Q75 62 100 80" stroke="#fff" stroke-opacity=".45" stroke-width="5" fill="none" stroke-linecap="round"/>`);
}
function meterObj({ x, y, w = 140 }) {
  return svg(x, y, w, w * 1.16, "0 0 140 162", `<rect x="52" y="0" width="36" height="22" fill="#b9733f"/><rect x="52" y="140" width="36" height="22" fill="#b9733f"/><rect x="46" y="18" width="48" height="10" rx="3" fill="#d09061"/><rect x="46" y="134" width="48" height="10" rx="3" fill="#d09061"/>
    <circle cx="70" cy="81" r="58" fill="#cfd5d0" stroke="#7f8a82" stroke-width="3"/><circle cx="70" cy="81" r="46" fill="#f4f2ec" stroke="#98a39b" stroke-width="2"/>
    ${[0, 1, 2, 3, 4].map((k) => `<rect x="${28 + k * 17}" y="62" width="14" height="22" rx="2" fill="#2f3a34"/>`).join("")}<circle cx="52" cy="110" r="8" fill="none" stroke="${C.sage}" stroke-width="3"/><circle cx="88" cy="110" r="8" fill="none" stroke="${C.sage}" stroke-width="3"/><path d="M20 52 Q70 30 120 52" stroke="#fff" stroke-opacity=".6" stroke-width="4" fill="none"/>`);
}
function atticObj({ x, y, w = 150 }) {
  return svg(x, y, w, w * 0.8, "0 0 200 160", `<rect x="6" y="64" width="114" height="92" rx="6" fill="#8a5a3a"/><rect x="6" y="64" width="114" height="22" fill="#a9744a"/><rect x="48" y="96" width="30" height="22" rx="4" fill="#d1a640"/><path d="M6 64 Q63 30 120 64Z" fill="#a9744a"/>
    <rect x="102" y="92" width="92" height="64" fill="#c8a679"/><path d="M102 92 H194 L186 82 H110Z" fill="#dcc299"/><rect x="132" y="92" width="32" height="64" fill="#e9dbbb" opacity=".8"/>
    <rect x="124" y="30" width="62" height="56" fill="#d8bc8d"/><path d="M124 30 H186 L180 22 H130Z" fill="#e8d3ac"/><rect x="146" y="30" width="18" height="56" fill="#efe1c2" opacity=".8"/>`);
}

/** A little cardboard stripe-and-tape frame used on several stops. */
const frameBox = (x, y, w, h, inner) => `<div style="${abs(x, y, w, h, "background:#f6f3ea;border-radius:8px;box-shadow:0 3px 5px rgba(20,30,20,.3);overflow:hidden")}">${inner}</div>`;

/* ======================================================================
 * #70 plate-closeup: a water heater data plate lit by a flashlight
 * ====================================================================== */
function pin70() {
  const rows = (x0, y0, n, w) => Array.from({ length: n }, (_, k) => `<div style="${abs(x0, y0 + k * 26, w - (k % 3) * 90, 7, "border-radius:4px;background:#b3bab4")}"></div>`).join("");
  const barcode = (x0, y0) => `<div style="${abs(x0, y0, 240, 44, "display:flex;gap:4px")}">${Array.from({ length: 30 }, (_, k) => `<span style="flex:none;width:${2 + ((k * 7) % 4)}px;height:44px;background:#3b423e"></span>`).join("")}</div>`;
  const plate = `<div data-check="plate" style="${abs(110, 452, 780, 396, "transform:rotate(-1.2deg);background:linear-gradient(#eff1ec,#d3d8d1);border:7px solid #a9b1aa;border-radius:20px;box-shadow:0 3px 5px rgba(0,0,0,.45),0 26px 44px rgba(0,0,0,.55)")}">
    ${[[16, 16], [736, 16], [16, 352], [736, 352]].map(([rx, ry]) => `<div style="${abs(rx, ry, 18, 18, "border-radius:50%;background:radial-gradient(circle at 35% 35%,#f5f6f4,#8a928c);box-shadow:0 2px 2px rgba(0,0,0,.4)")}"></div>`).join("")}
    ${exTag(560, 26)}
    <div class="mono" style="${abs(44, 40, 300, 46, "font-weight:600;font-size:40px;line-height:46px;color:#4a524e")}">Serial:</div>
    <div style="${abs(44, 120, 600, 110, "")}"></div>
    <div class="mono" style="${abs(44, 126, 640, 100, "font-weight:600;font-size:88px;line-height:100px;color:#1f2623;letter-spacing:0")}">2308-114477</div>
    <div style="${abs(40, 118, 114, 114, `border:7px solid ${C.sage};border-radius:50%`)}"></div>
    <div style="${abs(146, 118, 114, 114, `border:7px solid ${C.sage};border-radius:50%`)}"></div>
    <div style="${abs(91, 232, 4, 34, `background:${C.sage}`)}"></div>
    <div style="${abs(204, 232, 4, 34, `background:${C.sage}`)}"></div>
        <div style="${abs(52, 264, 80, 40, `background:${C.sage};border-radius:18px;color:#fff;font:700 26px/40px 'Plex',sans-serif;text-align:center`)}">year</div>
    <div style="${abs(150, 264, 112, 40, `background:${C.sage};border-radius:20px;color:#fff;font:700 26px/40px 'Plex',sans-serif;text-align:center`)}">month</div>
    ${barcode(430, 262)}
    ${rows(44, 318, 3, 340)}
  </div>`;
  const beam = `<svg style="${abs(0, 372, 1000, 982, "pointer-events:none")}" viewBox="0 372 1000 982" aria-hidden="true"><defs><linearGradient id="bm" gradientUnits="userSpaceOnUse" x1="330" y1="1250" x2="980" y2="700"><stop offset="0" stop-color="#fff4cc" stop-opacity=".6"/><stop offset="1" stop-color="#fff4cc" stop-opacity=".08"/></linearGradient><filter id="bl"><feGaussianBlur stdDeviation="9"/></filter></defs><polygon points="330,1236 1000,640 1000,1010 340,1274" fill="url(#bm)" filter="url(#bl)"/></svg>`;
  const scene = `
  <div style="${abs(0, 372, 1000, 982, "background:#121916")}"></div>
  <div style="${abs(30, 372, 940, 982, "background:linear-gradient(90deg,#76827d 0%,#c4ccc7 12%,#eceee9 34%,#f4f6f2 48%,#dce2dd 70%,#9ea8a3 90%,#69756f 100%)")}"></div>
  <div style="${abs(30, 372, 940, 982, "background:radial-gradient(ellipse at 66% 48%,rgba(0,0,0,0) 22%,rgba(10,16,13,.62) 100%)")}"></div>
  <div style="${abs(30, 410, 940, 8, "background:rgba(0,0,0,.14)")}"></div>
  ${beam}
  ${plate}
  <div data-check="result" style="${abs(110, 884, 780, 138, `background:${C.sageDeep};border-radius:14px;box-shadow:0 3px 5px rgba(0,0,0,.4),0 20px 34px rgba(0,0,0,.5);display:flex;align-items:center;padding:0 36px`)}"><span class="serif" style="font-size:54px;line-height:1.06;font-weight:500;color:#fff">Which would make this unit built in August 2023.</span></div>
  <div data-check="guess" style="${abs(150, 1056, 720, 122, `background:${C.butter};border-radius:6px;transform:rotate(1deg);box-shadow:0 3px 5px rgba(0,0,0,.4),0 18px 30px rgba(0,0,0,.5);display:flex;align-items:center;gap:20px;padding:0 30px`)}">${icon("warning-circle", { size: 50, color: C.ochre, weight: "bold" })}<span style="font:600 29px/1.22 'Plex',sans-serif;color:${C.ink}">Treat it as a starting guess until you confirm it against that brand's own page.</span></div>
  ${flashlight({ x: 30, y: 1216, len: 330, rot: -26 })}
  ${svg(780, 1198, 120, 120, "0 0 120 120", `<circle cx="60" cy="24" r="14" fill="#4a3a30"/><path d="M60 24 V10" stroke="#6b5a4c" stroke-width="5"/>`, "opacity:0")}
  ${brassKey({ x: 800, y: 1232, len: 170, rot: 16 })}${keyRing({ x: 770, y: 1218, w: 90, rot: 0 })}`;
  return printable({ n: 70, scene, paper: "#e6ebe4", bottomMax: 368 });
}

/* ======================================================================
 * #72 house-cutaway route: six numbered stops, dusk-sky house in section
 * ====================================================================== */
function pin72() {
  const stop = ({ x, y, n, label, art, w = 250, ah = 150, aw = 150, lh = 62 }) => {
    const ax = x + (w - aw) / 2;
    return `${frameBox(ax, y, aw, ah, "")}${art(ax, y)}${corners(ax - 8, y - 8, aw + 16, ah + 16)}${badge(n, ax - 22, y - 22, 48)}
    <div data-check="label" style="${abs(x, y + ah + 14, w, lh, `font:600 25px/1.14 'Plex',sans-serif;color:${C.ink};text-align:center;display:flex;align-items:flex-start;justify-content:center`)}">${esc(label)}</div>`;
  };
  const clap = Array.from({ length: 24 }, (_, k) => `<div style="${abs(50, 615 + k * 20, 670, 2, "background:#000;opacity:.07")}"></div>`).join("");
  const scene = `
  <div style="${abs(0, 372, 1000, 982, "background:linear-gradient(#2d4a46,#4d7570 55%,#9cbcb0)")}"></div>
  ${[[70, 420], [170, 500], [860, 440], [910, 520], [740, 410], [600, 470]].map(([sx, sy]) => `<div style="${abs(sx, sy, 6, 6, "border-radius:50%;background:#f1f4e8;opacity:.8")}"></div>`).join("")}
  <div style="${abs(880, 400, 70, 70, "border-radius:50%;background:#f4eed2;box-shadow:0 0 40px 10px rgba(244,238,210,.35)")}"></div>
  <div style="${abs(0, 1170, 1000, 190, "background:linear-gradient(#5f8a60,#4a7350)")}"></div>
  <div style="${abs(0, 1170, 1000, 8, "background:#7aa27a")}"></div>
  <svg style="${abs(0, 372, 1000, 900, "filter:drop-shadow(0 18px 24px rgba(0,0,0,.45))")}" viewBox="0 372 1000 900" aria-hidden="true">
    <polygon points="385,410 20,610 750,610" fill="#6b5b53"/><polygon points="385,424 70,602 700,602" fill="#efe6d2"/>
    ${Array.from({ length: 7 }, (_, k) => `<path d="M385 424 L${100 + k * 100} 602" stroke="#b79c76" stroke-width="3" opacity=".7"/>`).join("")}
    <rect x="50" y="602" width="670" height="12" fill="#8a7f6d"/>
    <rect x="50" y="614" width="670" height="266" fill="#f4eddc"/><rect x="50" y="880" width="670" height="14" fill="#8a7f6d"/>
    <rect x="50" y="894" width="670" height="276" fill="#c3c9bf"/><rect x="50" y="894" width="670" height="10" fill="#000" opacity=".12"/>
    <rect x="720" y="614" width="30" height="556" fill="#ddd5c0"/>
    <rect x="50" y="614" width="14" height="556" fill="#8a7f6d"/><rect x="706" y="614" width="14" height="556" fill="#8a7f6d"/>
    <rect x="344" y="660" width="82" height="110" rx="4" fill="#cfe3e0" stroke="#8a7f6d" stroke-width="6"/><path d="M385 660 V770 M344 715 H426" stroke="#8a7f6d" stroke-width="4"/>
    <path d="M385 894 V1170" stroke="#000" stroke-opacity=".06" stroke-width="3"/>
    <rect x="250" y="1086" width="0" height="0"/></svg>
  ${clap}
  ${stop({ x: 385 - 165, y: 446, n: 6, label: "Attic, basement and closets", art: (ax, ay) => atticObj({ x: ax, y: ay + 6, w: 150 }), w: 330, ah: 104, aw: 124, lh: 34 }).replace('height:62px', "height:34px")}
  ${stop({ x: 95, y: 646, n: 3, label: "Breaker panel", art: (ax, ay) => panelObj({ x: ax + 7, y: ay - 2, w: 136 }), ah: 150 })}
  ${stop({ x: 400, y: 646, n: 4, label: "Every major appliance", art: (ax, ay) => washerObj({ x: ax + 4, y: ay - 6, w: 142 }), ah: 150 })}
  ${stop({ x: 95, y: 912, n: 1, label: "Furnace, boiler or heat pump", art: (ax, ay) => furnaceObj({ x: ax - 4, y: ay - 4, w: 158 }), ah: 150 })}
  ${stop({ x: 400, y: 912, n: 2, label: "Water heater", art: (ax, ay) => waterHeater({ x: ax + 30, y: ay - 8, w: 92 }), ah: 150 })}
  ${stop({ x: 772, y: 690, n: 5, label: "Utility meters", art: (ax, ay) => meterObj({ x: ax + 6, y: ay - 8, w: 130 }), w: 190, ah: 150, aw: 150 })}
  ${flashlight({ x: 60, y: 1250, len: 300, rot: -3 })}
  ${phoneFlat({ x: 700, y: 1170, w: 100, h: 176, rot: 14, screen: `<div style="${abs(0, 0, 100, 200, "background:linear-gradient(#cfe3e0,#e8e2d0)")}"></div><div style="${abs(14, 48, 72, 80, `background:${C.sage};border-radius:8px;opacity:.9`)}"></div><div style="${abs(24, 74, 52, 28, "background:#f4eddc;border-radius:3px")}"></div>` })}
  ${brassKey({ x: 400, y: 1250, len: 150, rot: -8 })}`;
  return printable({ n: 72, scene, paper: "#e4ebe5", bottomMax: 368 });
}

/* ======================================================================
 * #74 question: a big sage ? over a faint house, three ringed objects
 * ====================================================================== */
function pin74() {
  const grid = `<div style="${abs(0, 372, 1000, 982, "background-color:#f2eee1;background-image:linear-gradient(rgba(79,122,92,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(79,122,92,.1) 1px,transparent 1px);background-size:40px 40px")}"></div>`;
  const line = "#b9c4b2";
  const house = `<svg style="${abs(0, 372, 1000, 982, "")}" viewBox="0 372 1000 982" aria-hidden="true" fill="none" stroke="${line}" stroke-width="4" stroke-linejoin="round" stroke-dasharray="14 8">
    <path d="M500 388 L40 640 H960 Z"/><path d="M110 640 V1330 M890 640 V1330 M110 1330 H890"/><path d="M110 740 H890 M110 1050 H890"/>
    <path d="M730 420 V500 H800 V560"/><rect x="480" y="880" width="120" height="90" rx="3"/><path d="M540 880 V970 M480 925 H600"/><rect x="480" y="1150" width="120" height="90" rx="3"/><rect x="620" y="1150" width="0" height="0"/></svg>`;
  const ringObj = (cx, cy, n, art, d = 292) => `<div style="${abs(cx - d / 2, cy - d / 2, d, d, `border-radius:50%;background:#fbfaf6;border:9px solid ${C.sage};box-shadow:0 4px 6px rgba(20,40,25,.3),0 22px 34px rgba(20,40,25,.35)`)}"></div>
    <div style="${abs(cx - d / 2 - 12, cy - d / 2 - 12, d + 24, d + 24, `border-radius:50%;border:4px dashed ${C.sage};opacity:.55`)}"></div>${art}${badge(n, cx - d / 2 - 18, cy - d / 2 - 14, 78)}`;
  const label = (x, y, w, t) => `<div data-check="label" class="serif" style="${abs(x, y, w, 180, `font-size:58px;line-height:1.04;font-weight:500;color:${C.ink};display:flex;align-items:center`)}">${esc(t)}</div>`;
  const scene = `${grid}${house}
  <div class="serif" style="${abs(580, 400, 400, 420, `font-size:440px;line-height:440px;font-weight:600;color:${C.sage};opacity:.9;text-align:center;letter-spacing:-.02em;z-index:0`)}">?</div>
  ${ringObj(236, 592, 1, waterHeater({ x: 236 - 62, y: 592 - 118, w: 124 }))}
  ${label(420, 502, 250, "The water heater")}
  ${label(60, 838, 440, "The furnace or heat pump")}
  ${ringObj(764, 928, 2, furnaceObj({ x: 764 - 88, y: 928 - 88, w: 176 }))}
  ${ringObj(236, 1196, 3, panelObj({ x: 236 - 62, y: 1196 - 76, w: 124 }), 270)}
  <div data-check="note" style="${abs(410, 1122, 540, 190, `background:${C.sageDeep};border-radius:14px;box-shadow:0 3px 5px rgba(0,0,0,.3),0 18px 30px rgba(20,40,25,.4);padding:20px 28px;display:flex;flex-direction:column;justify-content:center;gap:10px`)}"><div class="serif" style="font-size:54px;line-height:1.02;font-weight:500;color:#fff">The breaker panel</div><div style="font:500 29px/1.25 'Plex',sans-serif;color:#e3ece4">Photograph their plates, note the age if you can find it.</div></div>`;
  return printable({ n: 74, scene, paper: "#ebeee3", bottomMax: 368 });
}

/* ======================================================================
 * #76 template-preview: Field / Filled in card in a sage felt-lined heirloom drawer
 * ====================================================================== */
function pin76() {
  const fields = [["Photos taken", "22 rooms and closets, dated Sep 26"], ["Lease started", "Sep 26, renews Sep 26 next year"], ["Notice by", "60 days before renewal"], ["Deposit", "$1,400, held by the property manager"]];
  const rows = fields.map(([f, v], k) => `<div style="${abs(0, 76 + k * 108, 800, 108, `border-top:2px solid ${C.rule};display:flex;align-items:center`)}">
    <div class="serif" style="width:290px;padding-left:34px;font-size:40px;line-height:1.05;font-weight:500;color:${C.sageDeep}">${esc(f)}</div>
    <div class="hand" data-check="value" style="width:500px;font-size:43px;line-height:.98;font-weight:600;color:#26324a;transform:rotate(-1deg)">${esc(v)}</div></div>`).join("");
  const felt = `<div style="${abs(48, 400, 904, 940, "background:#7f9b83;border-radius:14px;box-shadow:inset 0 10px 20px rgba(0,0,0,.45),inset 0 -4px 10px rgba(0,0,0,.25),0 2px 0 rgba(255,255,255,.2)")}"></div>
  <div style="${abs(48, 400, 904, 940, "border-radius:14px;background:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0 2px,transparent 2px 5px),radial-gradient(circle at 30% 20%,rgba(255,255,255,.14),rgba(10,30,15,.28))")}"></div>`;
  const folder = `<div style="${abs(90, 996, 760, 340, "")}">
    <div style="${abs(0, 28, 760, 312, "background:linear-gradient(#d3b17f,#bf9b68);border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.3),0 22px 36px rgba(0,0,0,.4)")}"></div>
    <div style="${abs(0, 0, 230, 46, "background:#d3b17f;border-radius:12px 12px 0 0;box-shadow:0 -2px 3px rgba(0,0,0,.15)")}"></div>
    <div style="${abs(24, 8, 150, 6, "background:#a98a5c;border-radius:3px;opacity:.7")}"></div>
    <div style="${abs(0, 28, 760, 5, "background:#e8d2ac;border-radius:3px")}"></div></div>`;
  const card = `<div data-check="card" style="${abs(100, 424, 800, 590, "transform:rotate(-1deg);background:#fbfaf6;border-radius:8px;box-shadow:0 3px 5px rgba(0,0,0,.35),0 26px 44px rgba(0,0,0,.45);overflow:hidden")}">
    <div style="${abs(0, 0, 800, 76, `background:${C.sage}`)}"></div>
    <div class="serif" style="${abs(34, 0, 280, 76, "font-size:44px;line-height:76px;font-weight:600;color:#fff")}">Field</div>
    <div class="serif" style="${abs(324, 0, 280, 76, "font-size:44px;line-height:76px;font-weight:600;color:#fff")}">Filled in</div>
    ${rows}
    <div style="${abs(310, 76, 2, 432, `background:${C.rule}`)}"></div>
    <div style="${abs(0, 508, 800, 82, `background:${C.wash}`)}"></div>
    <div data-check="note" style="${abs(34, 508, 740, 82, "display:flex;align-items:center;font:500 27px/1.2 'Plex',sans-serif;color:#4b4339")}">An illustration, not a real lease.</div></div>
  ${exTag(722, 442)}`;
  const scene = `${desk({ top: 372, height: 982, base: "#6b4a2e", dark: "#573a22", planks: 3, seed: 9 })}${felt}${folder}${card}
  ${brassKey({ x: 600, y: 1128, len: 280, rot: -14 })}${brassKey({ x: 640, y: 1218, len: 250, rot: 8 })}${keyRing({ x: 570, y: 1106, w: 130, rot: 0 })}`;
  return printable({ n: 76, scene, paper: "#e7ece3", bottomMax: 368 });
}

/* ======================================================================
 * #78 comparison: split card on brown kraft paper, wear vs damage
 * ====================================================================== */
const V = (inner) => `<svg viewBox="0 0 200 130" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${inner}</svg>`;
const wallBg = (c = "#efe7d3") => `<rect width="200" height="130" fill="${c}"/><path d="M0 98 H200" stroke="#000" stroke-opacity=".12" stroke-width="3"/><rect y="98" width="200" height="32" fill="#b99870"/>`;
const vig = {
  carpet: V(`<rect width="200" height="130" fill="#8c9a8e"/>${Array.from({ length: 60 }, (_, k) => `<path d="M${(k * 37) % 200} ${(k * 53) % 130} l3 4" stroke="#6f7d71" stroke-width="2"/>`).join("")}<ellipse cx="100" cy="68" rx="62" ry="26" fill="#c3cbbb"/><ellipse cx="100" cy="68" rx="46" ry="16" fill="#d2d6c4" opacity=".9"/><rect x="0" y="0" width="200" height="14" fill="#6a5a46"/>`),
  holes: V(`${wallBg()}<rect x="62" y="22" width="76" height="52" rx="2" fill="#f6f0e0" stroke="#e1d7be" stroke-width="2"/>${[[78, 30], [116, 30], [98, 64]].map(([hx, hy]) => `<circle cx="${hx}" cy="${hy}" r="3.5" fill="#7a6e58"/>`).join("")}`),
  faded: V(`${wallBg("#d1c6a3")}<rect x="48" y="14" width="104" height="72" rx="3" fill="#efe3bd"/><rect x="48" y="14" width="104" height="72" rx="3" fill="url(#f)" opacity="0"/>`),
  door: V(`<rect width="200" height="130" fill="#efe7d3"/><rect x="40" y="6" width="120" height="124" fill="#8a7a5c"/><rect x="48" y="12" width="104" height="118" fill="#d9c9a4"/><path d="M48 12 L152 12 L152 130 L48 130Z" fill="none" stroke="#a69874" stroke-width="3"/><path d="M146 12 V130" stroke="#3b3328" stroke-width="5" opacity=".55"/><circle cx="130" cy="74" r="6" fill="#d1a640"/><rect x="46" y="4" width="108" height="6" fill="#7b6a4a"/>`),
  burn: V(`<rect width="200" height="130" fill="#b99870"/>${Array.from({ length: 6 }, (_, k) => `<path d="M0 ${12 + k * 22} H200" stroke="#8a6a42" stroke-width="2" opacity=".6"/>`).join("")}<ellipse cx="100" cy="66" rx="40" ry="30" fill="#4a3a2e"/><ellipse cx="100" cy="66" rx="52" ry="38" fill="none" stroke="#6b4e34" stroke-width="8" opacity=".7"/><ellipse cx="94" cy="60" rx="20" ry="14" fill="#241a12"/>`),
  stain: V(`<rect width="200" height="130" fill="#aab5aa"/>${Array.from({ length: 50 }, (_, k) => `<path d="M${(k * 41) % 200} ${(k * 59) % 130} l3 4" stroke="#8d998d" stroke-width="2"/>`).join("")}<path d="M60 64 C 56 36 96 22 126 36 C 160 46 160 88 128 98 C 96 112 64 96 60 64Z" fill="#a4906a"/><path d="M76 66 C 74 48 98 40 118 50 C 140 58 138 82 118 88 C 98 94 78 84 76 66Z" fill="#7a6648"/>`),
  tile: V(`<rect width="200" height="130" fill="#e8e4d8"/>${[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${c * 50 + 2}" y="${r * 44 + 2}" width="46" height="40" fill="#dfe9e5" stroke="#b3bdb6" stroke-width="2"/>`).join("")).join("")}<path d="M60 4 L74 36 L58 52 L82 90 L70 128" stroke="#2f2a24" stroke-width="3.5" fill="none" stroke-linejoin="round"/><path d="M100 46 L132 40 L128 78 L106 84Z" fill="#a39d90"/>`),
  hole: V(`${wallBg("#e6dcc4")}<path d="M70 50 L84 24 L112 30 L134 22 L142 58 L130 86 L96 94 L72 82Z" fill="#3a3028"/><path d="M84 40 L102 36 L118 44 L124 62 L112 76 L90 72Z" fill="#6b5a46"/><path d="M80 46 L96 38 M120 70 L132 80" stroke="#c9b894" stroke-width="3"/>`),
};

function pin78() {
  const left = [["A worn patch of carpet in a walkway", vig.carpet], ["Small nail holes from a picture", vig.holes], ["Faded paint", vig.faded], ["A sticking door", vig.door]];
  const right = [["A burn mark", vig.burn], ["A pet stain that soaked through", vig.stain], ["A broken tile", vig.tile], ["A hole in a wall", vig.hole]];
  const rowH = 150, top = 86;
  const col = (rows, x, tone) => rows.map(([t, art], k) => `<div style="${abs(x, top + k * rowH, 460, rowH, `border-top:2px solid ${C.rule};display:flex;align-items:center;gap:18px;padding:0 20px`)}">
    <div style="position:relative;flex:none;width:176px;height:118px;border-radius:10px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,.3);border:3px solid #fff">${art}</div>
    <div data-check="label" class="serif" style="font-size:34px;line-height:1.08;font-weight:500;color:${C.ink};flex:1">${esc(t)}</div></div>`).join("");
  const card = `<div data-check="card" style="${abs(40, 392, 920, 696, `${CARD};overflow:hidden`)}">
    <div style="${abs(0, 0, 460, 86, `background:${C.sage}`)}"></div><div style="${abs(460, 0, 460, 86, "background:#8c6b47")}"></div>
    <div class="serif" style="${abs(24, 0, 430, 86, "font-size:44px;line-height:86px;font-weight:600;color:#fff")}">Usually normal wear</div>
    <div class="serif" style="${abs(484, 0, 430, 86, "font-size:44px;line-height:86px;font-weight:600;color:#fff")}">Usually damage</div>
    ${col(left, 0)}${col(right, 460)}
    <div style="${abs(458, 86, 4, 610, `background:${C.rule}`)}"></div>
    <div style="${abs(436, 322, 48, 48, `border-radius:50%;background:#fbfaf6;border:3px solid ${C.rule};display:grid;place-items:center;font:600 26px 'Plex',sans-serif;color:#4b4339`)}">vs</div></div>`;
  const tile = `<div data-check="tile" style="${abs(110, 1116, 780, 214, "transform:rotate(-1deg);background:#fbfaf6;border-radius:8px;box-shadow:0 3px 5px rgba(60,35,10,.4),0 22px 36px rgba(60,35,10,.45);display:flex;align-items:center;gap:26px;padding:0 30px")}">
    <div style="position:relative;flex:none;width:260px;height:160px;border-radius:6px;overflow:hidden;border:3px solid #e8e0cf"><svg viewBox="0 0 260 160" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><rect width="260" height="160" fill="#e6dcc4"/><rect y="118" width="260" height="42" fill="#b99870"/><rect x="60" y="24" width="120" height="76" rx="3" fill="#cfe3e0" stroke="#8a7f6d" stroke-width="6"/><path d="M120 24 V100 M60 62 H180" stroke="#8a7f6d" stroke-width="4"/></svg>
      <div style="${abs(0, 126, 260, 34, "background:rgba(0,0,0,.2)")}"></div><div style="${abs(150, 132, 100, 22, "border-radius:4px;border:2px solid #f6f0e0;background:rgba(255,255,255,.25)")}"></div></div>
    <div style="flex:1"><div style="display:flex;align-items:center;gap:14px">${icon("camera", { size: 46, color: C.sage, weight: "duotone" })}<span style="display:inline-block;width:150px;height:30px;border-bottom:3px solid #8a7f6d"></span></div>
      <div class="serif" style="font-size:42px;line-height:1.05;font-weight:500;color:${C.ink};margin-top:8px">Photograph the condition at move-in</div></div></div>`;
  const kraft = `<div style="${abs(0, 372, 1000, 982, "background:#c4a06f")}"></div>
  <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 3px,transparent 3px 14px),radial-gradient(circle at 25% 15%,rgba(255,255,255,.2),rgba(80,50,15,.3))")}"></div>
  <svg style="${abs(0, 372, 1000, 982, "opacity:.35")}" viewBox="0 372 1000 982" aria-hidden="true"><path d="M0 700 L120 650 L260 720 L400 640 L560 700 M600 1000 L760 940 L900 1010 L1000 960 M0 1200 L90 1150 L220 1220" stroke="#8a6a3c" stroke-width="3" fill="none"/></svg>`;
  return printable({ n: 78, scene: `${kraft}${card}${tile}`, paper: "#ece4d6", bottomMax: 368, extraCss: ".top h1{font-size:76px}.top p{margin-top:10px}" });
}

/* ======================================================================
 * #80 how-to-steps: three numbered steps on a butter legal pad
 * ====================================================================== */
function pin80() {
  const pad = `<div style="${abs(0, 372, 1000, 982, "background:#f5e7a8")}"></div>
  <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(0deg,transparent 0 42px,rgba(70,110,150,.35) 42px 44px);background-position:0 8px")}"></div>
  <div style="${abs(26, 372, 4, 982, "background:rgba(190,60,50,.55)")}"></div><div style="${abs(34, 372, 4, 982, "background:rgba(190,60,50,.55)")}"></div>`;
  const text = (y, h, t, sz = 38, x = 396, w = 554) => `<div data-check="step" style="${abs(x, y, w, h, `${CARD};padding:0 28px;display:flex;align-items:center;font:500 ${sz}px/1.2 'Newsreader',serif;color:${C.ink}`)}">${esc(t)}</div>`;
  const bubbles = `<div style="${abs(24, 90, 140, 38, "border-radius:18px;background:#e1e5e0")}"></div><div style="${abs(24, 138, 100, 28, "border-radius:14px;background:#e1e5e0")}"></div>
    <div style="${abs(68, 200, 164, 74, `border-radius:20px;background:${C.sage}`)}"></div><div style="${abs(88, 218, 110, 8, "border-radius:4px;background:#fff;opacity:.8")}"></div><div style="${abs(88, 238, 80, 8, "border-radius:4px;background:#fff;opacity:.8")}"></div>
    <div style="${abs(24, 304, 150, 56, "border-radius:18px;background:#e1e5e0")}"></div><div style="${abs(24, 40, 150, 28, "")}"></div>`;
  const log = (() => {
    const heads = ["Date", "What", "The answer"];
    const widths = [110, 110, 172];
    let xx = 0;
    const th = heads.map((h, k) => { const s = `<div style="${abs(xx, 0, widths[k], 48, `border-right:2px solid ${C.rule};padding:0 10px;font:600 26px/48px 'Plex',sans-serif;color:#fff;background:${C.sage}`)}">${h}</div>`; xx += widths[k]; return s; }).join("");
    const lines = Array.from({ length: 4 }, (_, k) => `<div style="${abs(0, 48 + k * 48, 392, 48, `border-bottom:2px solid ${C.rule}`)}"></div>`).join("");
    const vlines = [110, 220].map((vx) => `<div style="${abs(vx, 48, 2, 192, `background:${C.rule}`)}"></div>`).join("");
    return `<div style="${abs(40, 34, 392, 244, "background:#fbfaf6;box-shadow:0 2px 4px rgba(0,0,0,.25)")}">${th}${lines}${vlines}
      <div style="${abs(330, 56, 48, 34, "display:grid;place-items:center")}">${icon("check", { size: 36, color: C.sage, weight: "bold" })}</div></div>`;
  })();
  const clip = `<div style="${abs(130, 752, 472, 306, "transform:rotate(-1.5deg)")}">
    <div style="${abs(0, 0, 472, 306, "background:linear-gradient(135deg,#c8a679,#a9824e);border-radius:18px;box-shadow:0 3px 5px rgba(60,40,10,.35),0 26px 44px rgba(60,40,10,.4)")}"></div>
    <div style="${abs(136, -22, 200, 70, "border-radius:14px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 6px 10px rgba(0,0,0,.35)")}"></div>
    <div style="${abs(166, -36, 140, 30, "border-radius:12px 12px 0 0;background:linear-gradient(#f4f5f7,#bcc0c6)")}"></div>${log}</div>`;
  const notes = [[100, 1170, -6, "#cfe0c8"], [98, 1140, 3, C.butter], [96, 1110, -2, "#fbfaf6"]].map(([nx, ny, nr, nc], k) => `<div style="${abs(nx, ny + 40, 250, 130, `transform:rotate(${nr}deg);background:${nc};box-shadow:0 4px 6px rgba(60,40,10,.35)`)}">${k === 2 ? `<div class="hand" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;font-size:48px;line-height:.95;font-weight:700;color:${C.sageDeep};padding:0 14px">flagged it first</div>` : ""}</div>`).join("");
  const scene = `${pad}
  ${badge(1, 44, 412, 70)}${badge(2, 44, 740, 70)}${badge(3, 44, 1100, 70)}
  ${phoneFlat({ x: 138, y: 400, w: 244, h: 296, rot: -3, screen: bubbles })}
  ${text(430, 236, "Tell the landlord in writing and keep a copy.", 46)}
  ${clip}
  ${text(740, 330, "Add a line to your log with the date, what you said and what they answered.", 35, 624, 326)}
  ${notes}
  ${text(1112, 216, "If the same problem comes back, that log is your record that you flagged it first.", 33)}`;
  return printable({ n: 80, scene, paper: "#f1ecd2", bottomMax: 368 });
}

/* ======================================================================
 * #82 comparison: floor plan of a small flat on an oak table
 * ====================================================================== */
function pin82() {
  const px = 60, py = 500;
  const tag = (x, y, w, ico, text, color) => `<div data-check="tag" style="${abs(x, y, w, 0, "")}"></div><div data-check="tag" style="${abs(x, y, w, 0, "")}"></div>
    <div data-check="tag" style="${abs(x, y, w, 88, `background:#fbfaf6;border-radius:10px;border-left:10px solid ${color};box-shadow:0 2px 4px rgba(40,30,15,.3),0 8px 16px rgba(40,30,15,.2);display:flex;align-items:center;gap:12px;padding:0 14px;font:600 25px/1.14 'Plex',sans-serif;color:${C.ink}`)}"><span style="flex:none">${icon(ico, { size: 40, color, weight: "duotone" })}</span><span>${esc(text)}</span></div>`;
  const wall = "#3a403c";
  const left = `<div style="${abs(px, py, 440, 584, `background:${C.wash}`)}"></div>`;
  const right = `<div style="${abs(px + 440, py, 440, 584, "background:#efe3cf")}"></div>`;
  const rooms = svg(px, py, 880, 584, "0 0 880 584", `
    <g fill="none" stroke="${wall}" stroke-width="9" stroke-linejoin="round"><rect x="4" y="4" width="872" height="576"/>
      <path d="M4 194 H196 M262 194 H436 M4 388 H150 M216 388 H436 M444 150 H600 M666 150 H876 M444 366 H590 M656 366 H876"/><path d="M440 4 V576" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round"/></g>
    <g fill="#fff" opacity=".85"><rect x="320" y="58" width="96" height="60" rx="6" stroke="#9aa89c" stroke-width="3"/><rect x="40" y="62" width="150" height="70" rx="6" stroke="#9aa89c" stroke-width="3"/>
      <rect x="40" y="440" width="120" height="104" rx="6" stroke="#9aa89c" stroke-width="3"/><circle cx="360" cy="480" r="46" stroke="#9aa89c" stroke-width="3"/></g>
    <g stroke="#b9733f" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M470 120 H850 M690 120 V210 M850 120 V250"/></g>
    <g fill="none" stroke="#d09061" stroke-width="4" opacity=".9"><path d="M470 114 H850 M684 114 V210"/></g>
    <path d="M444 8 L660 8 L874 8 L874 150 L444 150Z" fill="#c4b393" opacity=".45"/>
    <path d="M450 112 L660 24 L868 112" fill="none" stroke="#6b5b53" stroke-width="12" stroke-linejoin="round"/><path d="M450 112 L660 24 L868 112 Z" fill="#a39382" opacity=".45"/>
    <g fill="#fff" stroke="#b09a72" stroke-width="3"><rect x="720" y="400" width="130" height="64" rx="8"/><circle cx="786" cy="430" r="14"/><rect x="480" y="470" width="90" height="70" rx="10"/><path d="M500 440 V470" stroke-width="10"/></g>`);
  const sheetBase = `<div data-check="plan" style="${abs(40, 392, 920, 710, "background:#f6f1e3;border-radius:6px;box-shadow:0 3px 5px rgba(40,25,5,.4),0 26px 44px rgba(40,25,5,.45)")}"></div>
  <div style="${abs(px, 412, 440, 70, `background:${C.sage};display:flex;align-items:center;padding:0 22px`)}" ><span class="serif" style="font-size:46px;font-weight:600;color:#fff">Usually yours</span></div>
  <div style="${abs(px + 440, 412, 440, 70, "background:#c8a679;display:flex;align-items:center;padding:0 22px")}"><span class="serif" style="font-size:46px;font-weight:600;color:${C.ink};white-space:nowrap">Usually the landlord's</span></div>`;
  const scene = `${desk({ top: 372, height: 982, base: "#c99b66", dark: "#b0834d", planks: 5, seed: 13 })}${sheetBase}${left}${right}${rooms}
  ${tag(px + 24, py + 214, 392, "broom", "Keeping the place clean", C.sage)}
  ${tag(px + 24, py + 62 + 0, 280, "bell-ringing", "", C.sage).replace(/data-check="tag"/g, "").replace(/<div style="[^"]*">[^]*$/, "")}
  ${tag(px + 24, py + 12, 392, "bell-ringing", "Changing smoke alarm batteries, if your lease says so", C.sage).replace("height:88px", "height:108px")}
  ${tag(px + 24, py + 440, 392, "phone", "Reporting problems promptly", C.sage)}
  ${tag(px + 464, py + 44, 392, "house-line", "The roof and structure", "#8c6b47").replace("height:88px", "height:76px")}
  ${tag(px + 464, py + 210, 392, "wrench", "Major systems like heating and plumbing", "#8c6b47").replace("height:88px", "height:104px")}
  ${tag(px + 464, py + 440, 392, "seal-check", "Repairs that are not your fault", "#8c6b47")}
  ${pencil({ x: 80, y: 1236, len: 460, rot: -4 })}${brassKey({ x: 650, y: 1166, len: 250, rot: 12 })}${keyRing({ x: 620, y: 1150, w: 110, rot: 0 })}`;
  return printable({ n: 82, scene, paper: "#efe6d8", bottomMax: 368 });
}

/* ======================================================================
 * #84 checklist: Polaroid tiles on a herringbone parquet floor
 * ====================================================================== */
const P = (inner) => `<svg viewBox="0 0 176 176" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${inner}</svg>`;
const shots = {
  wall: P(`<rect width="176" height="176" fill="#e8dfc8"/><rect y="132" width="176" height="44" fill="#b99870"/><path d="M0 132 H176" stroke="#7a6a50" stroke-width="4"/><path d="M40 40 L110 76 M52 70 L130 56 M70 100 L120 106 M30 96 L60 90" stroke="#9c8c6c" stroke-width="5" stroke-linecap="round" opacity=".8"/><path d="M96 30 L132 44" stroke="#c9bb9a" stroke-width="8" stroke-linecap="round"/>`),
  floor: P(`<rect width="176" height="176" fill="#b58a58"/>${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M0 ${k * 30} H176" stroke="#7d5a30" stroke-width="3"/>`).join("")}<path d="M20 60 L110 112 L150 100" stroke="#e1c9a0" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M60 30 V60 M120 90 V120 M30 120 V150" stroke="#7d5a30" stroke-width="3"/>`),
  window: P(`<rect width="176" height="176" fill="#d9cfb9"/><rect x="34" y="20" width="108" height="118" fill="#bfd9e0" stroke="#fbfaf6" stroke-width="10"/><path d="M88 20 V138 M34 79 H142" stroke="#fbfaf6" stroke-width="7"/><rect x="24" y="138" width="128" height="14" fill="#fbfaf6"/><path d="M50 40 L74 30" stroke="#fff" stroke-opacity=".6" stroke-width="6"/>`),
  oven: P(`<rect width="176" height="176" fill="#b7bcb7"/><rect x="18" y="20" width="140" height="136" rx="6" fill="#3b4540"/><rect x="26" y="28" width="124" height="120" fill="#6f7a73"/>${[56, 92, 128].map((ry) => `<path d="M26 ${ry} H150" stroke="#d3d8d3" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M${36 + k * 15} ${ry} V${ry + 10}" stroke="#d3d8d3" stroke-width="2"/>`).join("")}`).join("")}<rect x="60" y="68" width="46" height="18" fill="#2b332f" opacity=".5"/>`),
  fridge: P(`<rect width="176" height="176" fill="#dfe6e8"/><rect x="14" y="12" width="148" height="152" rx="6" fill="#f4f7f8" stroke="#a9b6ba" stroke-width="4"/>${[50, 90, 130].map((ry) => `<rect x="14" y="${ry}" width="148" height="6" fill="#bfd6dc"/>`).join("")}<rect x="30" y="22" width="40" height="26" rx="4" fill="${C.sage}" opacity=".7"/><rect x="104" y="64" width="34" height="24" rx="5" fill="#e7c36a"/><rect x="36" y="100" width="50" height="30" rx="4" fill="#d6a39a" opacity=".8"/>`),
  cabinet: P(`<rect width="176" height="176" fill="#e1d6bd"/><rect x="12" y="16" width="72" height="144" rx="4" fill="#b1855a" stroke="#7d5a30" stroke-width="3"/><rect x="92" y="16" width="72" height="144" rx="4" fill="#b1855a" stroke="#7d5a30" stroke-width="3"/><rect x="22" y="28" width="52" height="120" fill="none" stroke="#8d6638" stroke-width="3"/><rect x="102" y="28" width="52" height="120" fill="none" stroke="#8d6638" stroke-width="3"/><circle cx="76" cy="90" r="6" fill="#d1a640"/><circle cx="100" cy="90" r="6" fill="#d1a640"/>`),
  room: P(`<rect width="176" height="176" fill="#ede4cf"/><path d="M0 120 H176" stroke="#7a6a50" stroke-width="3"/><rect y="120" width="176" height="56" fill="#b58a58"/><rect x="104" y="30" width="52" height="64" fill="#cfe3e0" stroke="#fbfaf6" stroke-width="6"/><rect x="24" y="64" width="64" height="62" rx="6" fill="${C.sage}"/><rect x="20" y="96" width="72" height="30" rx="6" fill="#6f9a7c"/>`),
};
function polaroid({ x, y, rot, art, label, w = 200 }) {
  const ph = w - 24;
  return `<div style="${abs(x, y, w, w + 56, `transform:rotate(${rot}deg);background:#fcfbf7;border-radius:4px;box-shadow:0 3px 4px rgba(20,10,0,.4),0 20px 30px rgba(20,10,0,.45)`)}">
    <div style="position:absolute;left:12px;top:12px;width:${ph}px;height:${ph}px;overflow:hidden;background:#ccc;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)">${art}
      <div style="${abs(ph - 62, ph - 26, 54, 18, "border-radius:3px;background:rgba(255,255,255,.3);border:2px solid rgba(255,255,255,.75)")}"></div></div>
    <div class="hand" data-check="label" style="${abs(8, w - 6, w - 16, 52, `font-size:36px;line-height:52px;font-weight:700;color:${C.sageDeep};text-align:center`)}">${esc(label)}</div></div>`;
}
function pin84() {
  const bands = (() => {
    const r = rng(5);
    let o = "";
    const cols = ["#7a4e2b", "#8a5a34", "#6b4424", "#94653b"];
    for (let k = 0; k < 2; k++) o += `<polygon points="0,${k * 40} 40,${k * 40 + 40} 80,${k * 40} 80,${k * 40 + 20} 40,${k * 40 + 60} 0,${k * 40 + 20}" fill="${cols[Math.floor(r() * 4)]}" stroke="#3d2412" stroke-width="2"/>`;
    return o + `<path d="M20 20 L10 30 M60 20 L70 30 M20 60 L10 70 M60 60 L70 70" stroke="#3d2412" stroke-width="2" opacity=".6"/>`;
  })();
  const floor = `<svg style="${abs(0, 372, 1000, 982, "")}" viewBox="0 0 1000 982" aria-hidden="true"><defs><pattern id="hb" width="80" height="80" patternUnits="userSpaceOnUse">${bands}</pattern></defs><rect width="1000" height="982" fill="url(#hb)"/>
    <rect width="1000" height="982" fill="url(#hbs)" /><defs><radialGradient id="hbs" cx="30%" cy="15%" r="90%"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".22"/><stop offset="1" stop-color="#1a0c02" stop-opacity=".5"/></radialGradient></defs></svg>`;
  const pols = [
    { x: 400, y: 396, rot: -5, art: shots.wall, label: "scratched" },
    { x: 626, y: 412, rot: 4, art: shots.floor, label: "floors" },
    { x: 770, y: 600, rot: -3, art: shots.window, label: "windows" },
    { x: 540, y: 660, rot: 5, art: shots.oven, label: "oven" },
    { x: 350, y: 640, rot: -6, art: shots.fridge, label: "refrigerator" },
    { x: 760, y: 330, rot: 0, art: shots.cabinet, label: "cabinets" },
  ];
  const useP = pols.slice(0, 5).concat([]).map((o) => polaroid(o)).join("");
  const roomPhoto = `<div style="position:absolute;left:10px;top:10px;width:260px;height:480px;overflow:hidden;border-radius:28px;background:#f4f2ee"><div style="${abs(0, 60, 260, 260, "overflow:hidden")}"><div style="position:absolute;left:-30px;top:0;width:320px;height:320px">${shots.room.replace('viewBox="0 0 176 176"', 'viewBox="0 0 176 176"')}</div></div>
    <div style="${abs(0, 60, 260, 26, "background:rgba(0,0,0,.0)")}"></div><div style="${abs(40, 340, 180, 36, `border-radius:18px;background:${C.sage}`)}"></div><div style="${abs(104, 392, 52, 52, "border-radius:50%;border:5px solid #1b1820")}"></div></div>`;
  const rowsT = ["Every room, wide shots first", "Then close shots of anything scratched, stained or worn", "The walls, the floors, the windows", "The inside of the oven, the refrigerator and any cabinets"];
  const list = `<div data-check="list" style="${abs(50, 944, 900, 392, `${CARD};padding:12px 26px;display:flex;flex-direction:column;justify-content:space-around`)}">${rowsT.map((t) => `<div style="display:flex;align-items:center;gap:20px">${tick(40)}<span class="serif" style="font-size:38px;line-height:1.1;font-weight:500;color:${C.ink}">${esc(t)}</span></div>`).join("")}</div>`;
  const scene = `${floor}
  ${phoneFlat({ x: 60, y: 410, w: 280, h: 500, rot: -3, screen: `<div style="position:absolute;left:0;top:0;width:258px;height:480px;overflow:hidden"><div style="${abs(-30, 70, 320, 320, "")}">${shots.room}</div><div style="${abs(0, 0, 258, 70, "background:#f4f2ee")}"></div><div style="${abs(0, 390, 258, 90, "background:#1b1820")}"></div><div style="${abs(103, 410, 52, 52, "border-radius:50%;border:5px solid #f4f2ee")}"></div></div>` })}
  ${polaroid({ x: 380, y: 404, rot: -5, art: shots.wall, label: "scratched" })}
  ${polaroid({ x: 596, y: 396, rot: 4, art: shots.floor, label: "floors" })}
  ${polaroid({ x: 776, y: 426, rot: -3, art: shots.window, label: "windows", w: 190 })}
  ${polaroid({ x: 430, y: 668, rot: 3, art: shots.oven, label: "oven" })}
  ${polaroid({ x: 640, y: 664, rot: -4, art: shots.fridge, label: "refrigerator" })}
  ${polaroid({ x: 790, y: 690, rot: 5, art: shots.cabinet, label: "cabinets", w: 170 })}
  ${list}`;
  return printable({ n: 84, scene, paper: "#efe4d3", bottomMax: 368 });
}

export const pins = [pin70(), pin72(), pin74(), pin76(), pin78(), pin80(), pin82(), pin84()];
