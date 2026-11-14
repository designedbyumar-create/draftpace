/**
 * Group P: bathroom and pipes. Water shutoff guide pins #86, #88, #90, #92,
 * #94. Every word is the idea bank's (headline, sub, items) or a label the
 * idea names. No printed page or app screen is shown; every drawing and prop
 * is flat vector, made here.
 */
import { idea, C } from "../kit/bank.mjs";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { pencil, clipboard } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const split = (s) => {
  const k = s.indexOf(": ");
  return k < 0 ? [s, ""] : [s.slice(0, k), s.slice(k + 2)];
};
const COPPER = ["#7c4220", "#b8683a", "#e9a877"];
const BR = ["#7a5a1c", "#c79a3b", "#efd68c"];
const SLATE = ["#3f5463", C.slate, "#9bb0c1"];
const SH = "filter:drop-shadow(0 12px 9px rgba(10,15,12,.4))";

const numBadge = (n, { size = 52, bg = C.sageDeep, fs = 28 } = {}) =>
  `<div style="width:${size}px;height:${size}px;flex:none;border-radius:50%;background:${bg};color:#fff;display:grid;place-items:center;font:600 ${fs}px/1 'Plex',sans-serif;box-shadow:0 3px 5px rgba(0,0,0,.25)">${n}</div>`;
const svgBadge = (x, y, n, { r = 24, bg = C.sageDeep, fs = 28 } = {}) =>
  `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${bg}" stroke="#fff" stroke-width="3.5"/><text x="${x}" y="${y + fs * 0.36}" text-anchor="middle" font-family="Plex,sans-serif" font-weight="600" font-size="${fs}" fill="#fff">${n}</text></g>`;

/** A horizontal pipe (SVG fragment): dark edge, body, highlight. */
const pipeH = (x1, x2, y, d, col = COPPER) =>
  `<rect x="${x1}" y="${y - d / 2}" width="${x2 - x1}" height="${d}" fill="${col[0]}"/><rect x="${x1}" y="${y - d / 2 + 2}" width="${x2 - x1}" height="${d - 4}" fill="${col[1]}"/><rect x="${x1}" y="${y - d / 2 + 5}" width="${x2 - x1}" height="${Math.max(3, d * 0.18)}" fill="${col[2]}" opacity=".8"/>`;
const pipeV = (x, y1, y2, d, col = COPPER) =>
  `<rect x="${x - d / 2}" y="${y1}" width="${d}" height="${y2 - y1}" fill="${col[0]}"/><rect x="${x - d / 2 + 2}" y="${y1}" width="${d - 4}" height="${y2 - y1}" fill="${col[1]}"/><rect x="${x - d / 2 + 5}" y="${y1}" width="${Math.max(3, d * 0.18)}" height="${y2 - y1}" fill="${col[2]}" opacity=".8"/>`;

/** A round-handle gate valve on a pipe axis at (0,0), local coordinates. */
const gateValveG = () => `
  <rect x="-96" y="-36" width="26" height="72" rx="5" fill="${BR[0]}"/><rect x="70" y="-36" width="26" height="72" rx="5" fill="${BR[0]}"/>
  <rect x="-72" y="-44" width="144" height="88" rx="24" fill="${BR[1]}"/><rect x="-62" y="-44" width="124" height="14" rx="7" fill="${BR[2]}" opacity=".6"/><rect x="-72" y="30" width="144" height="14" rx="7" fill="${BR[0]}" opacity=".5"/>
  <rect x="-34" y="-114" width="68" height="76" rx="8" fill="${BR[1]}"/><rect x="-28" y="-114" width="12" height="76" fill="${BR[2]}" opacity=".55"/>
  <rect x="-46" y="-102" width="92" height="16" rx="5" fill="${BR[0]}"/><rect x="-26" y="-130" width="52" height="18" rx="4" fill="${BR[1]}"/>
  <rect x="-7" y="-196" width="14" height="68" fill="#c9ced1"/>${[-186, -172, -158, -144].map((y) => `<rect x="-7" y="${y}" width="14" height="3" fill="#8a9298"/>`).join("")}
  <ellipse cx="0" cy="-204" rx="98" ry="32" fill="none" stroke="${C.sageDeep}" stroke-width="18"/><ellipse cx="0" cy="-206" rx="98" ry="32" fill="none" stroke="${C.sage}" stroke-width="12"/>
  ${[0, 60, 120].map((a) => { const x = 98 * Math.cos((a * Math.PI) / 180), y = 32 * Math.sin((a * Math.PI) / 180); return `<line x1="${-x}" y1="${-204 - y}" x2="${x}" y2="${-204 + y}" stroke="${C.sageDeep}" stroke-width="9" stroke-linecap="round"/>`; }).join("")}
  <ellipse cx="0" cy="-204" rx="22" ry="11" fill="${C.sageDeep}"/><rect x="-10" y="-226" width="20" height="14" rx="3" fill="#9aa39d"/>`;

/** A lever-handle ball valve with the lever across the pipe, local coordinates. */
const leverValveG = () => `
  <rect x="-80" y="-32" width="30" height="64" rx="5" fill="${BR[0]}"/><rect x="50" y="-32" width="30" height="64" rx="5" fill="${BR[0]}"/>
  <rect x="-54" y="-38" width="108" height="76" rx="18" fill="${BR[1]}"/><rect x="-44" y="-38" width="88" height="13" rx="6" fill="${BR[2]}" opacity=".6"/><rect x="-54" y="26" width="108" height="12" rx="6" fill="${BR[0]}" opacity=".5"/>
  <rect x="-16" y="-66" width="32" height="32" fill="${BR[1]}"/><rect x="-32" y="-78" width="64" height="16" rx="5" fill="#aab3ad"/><rect x="-11" y="-90" width="22" height="14" rx="3" fill="#8f9892"/>
  <rect x="-10" y="-232" width="20" height="150" rx="8" fill="#5b655f"/><rect x="-16" y="-234" width="32" height="92" rx="15" fill="${C.sage}"/><rect x="-12" y="-228" width="8" height="80" rx="4" fill="#fff" opacity=".25"/><circle cx="0" cy="-216" r="6" fill="#26332a"/>`;

/** A blank kraft shutoff tag on a string loop (fragment, hangs from (0,0)). */
const tagG = (rot = 6) => `<g transform="rotate(${rot})"><path d="M0 0 V26" stroke="#e8e2d0" stroke-width="3"/><path d="M0 26 H-30 L-42 42 V122 H42 V42 L30 26 Z" fill="#cdb089" stroke="#8a6a3a" stroke-width="3"/><circle cx="0" cy="44" r="7" fill="#3a463f" opacity=".55"/><path d="M-26 78 H26 M-26 94 H14" stroke="#7a5f36" stroke-width="3" stroke-linecap="round" opacity=".6"/></g>`;

const noiseDefs = (id, seed = 4, a = 0.4) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .12  0 0 0 0 .1  0 0 0 ${a} 0"/></filter>`;

/* ===================================================================== */
/* #86: the house in section, four numbered places                        */
/* ===================================================================== */
const i86 = idea(86);
const PY = 336; // service pipe depth in the cutaway (svg coordinates)
const cutaway = `<svg style="${abs(0, SCENE_TOP, 1000, 560)}" viewBox="0 0 1000 560" aria-hidden="true"><defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3e4dc"/><stop offset="1" stop-color="#f1f2e8"/></linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b09068"/><stop offset="1" stop-color="#7a5f42"/></linearGradient></defs>
  <rect width="1000" height="236" fill="url(#sky)"/><circle cx="120" cy="96" r="44" fill="#f6e7b0" opacity=".85"/>
  <path d="M560 70 q20 -22 44 -8 q22 -20 46 4 q26 2 20 22 H548 q-16 -6 12 -18 Z" fill="#fff" opacity=".7" transform="translate(-340 -10)"/>
  <rect y="226" width="1000" height="334" fill="url(#soil)"/>
  ${Array.from({ length: 46 }, (_, k) => { const x = (k * 197) % 960 + 20, y = 300 + ((k * 89) % 240); return `<ellipse cx="${x}" cy="${y}" rx="${4 + (k % 4)}" ry="${3 + (k % 3)}" fill="${k % 2 ? "#6a5238" : "#c4a77f"}" opacity=".55"/>`; }).join("")}
  <path d="M0 400 C 200 388 330 410 470 398 M0 470 C 180 462 360 484 470 470" fill="none" stroke="#6a5238" stroke-width="3" opacity=".3"/>
  <!-- street, curb, grass -->
  <rect x="0" y="226" width="322" height="26" fill="#4b514e"/><rect x="0" y="226" width="322" height="5" fill="#6d746f"/><rect x="0" y="252" width="322" height="30" fill="#8d8d83"/>
  <rect x="322" y="214" width="26" height="90" rx="3" fill="#cfd3cb"/><rect x="322" y="214" width="8" height="90" fill="#fff" opacity=".5"/>
  <rect x="348" y="226" width="124" height="14" fill="#6f9a6a"/><rect x="348" y="226" width="124" height="5" fill="#8fb98a"/>
  <!-- house: roof, main floor, basement -->
  <path d="M440 130 L730 28 L1020 130 Z" fill="#55765f"/><path d="M440 130 L730 28 L730 40 L470 128 Z" fill="#fff" opacity=".14"/><rect x="456" y="124" width="548" height="10" fill="#3f6a52"/>
  <rect x="470" y="134" width="520" height="104" fill="#e9e2cf"/><rect x="494" y="146" width="472" height="86" fill="#f7f5ee"/>
  <rect x="540" y="160" width="86" height="58" rx="3" fill="#dce8ea" stroke="#8a8f86" stroke-width="4"/><path d="M583 160 V218 M540 189 H626" stroke="#8a8f86" stroke-width="3"/>
  <rect x="800" y="150" width="70" height="82" rx="4" fill="#d9c9a4" stroke="#8a6a3a" stroke-width="4"/><circle cx="854" cy="192" r="5" fill="#8a6a3a"/>
  <rect x="470" y="238" width="520" height="14" fill="#cdb48a"/>
  <rect x="470" y="252" width="26" height="236" fill="#b9bfb6"/><rect x="964" y="252" width="26" height="236" fill="#b9bfb6"/><rect x="470" y="468" width="520" height="22" fill="#9aa196"/><rect x="458" y="490" width="544" height="20" fill="#8e9489"/>
  <rect x="496" y="252" width="468" height="216" fill="#f4f3ea"/><rect x="496" y="252" width="468" height="12" fill="#000" opacity=".06"/>
  <path d="M496 440 H964" stroke="#c9cfc3" stroke-width="3"/>
  <!-- water heater -->
  <rect x="852" y="320" width="82" height="148" rx="16" fill="#e6ebe3" stroke="#8b958d" stroke-width="3"/><rect x="852" y="372" width="82" height="12" fill="#6f9a7c"/><circle cx="893" cy="424" r="12" fill="#fbfaf6" stroke="#8b958d" stroke-width="2"/>
  <!-- slate water pipes: main in the street, service line, riser to the curb box -->
  <circle cx="70" cy="${PY}" r="32" fill="${SLATE[0]}"/><circle cx="70" cy="${PY}" r="24" fill="${SLATE[1]}"/><circle cx="62" cy="${PY - 8}" r="8" fill="${SLATE[2]}" opacity=".7"/>
  ${pipeH(100, 852, PY, 16, SLATE)}
  ${pipeV(390, 240, PY, 12, SLATE)}
  <rect x="372" y="236" width="36" height="54" rx="4" fill="#3a463f" opacity=".35"/><rect x="380" y="290" width="20" height="26" rx="3" fill="${BR[1]}"/><rect x="378" y="298" width="24" height="8" rx="2" fill="${BR[0]}"/>
  <rect x="362" y="222" width="56" height="12" rx="3" fill="#3a463f"/><circle cx="390" cy="228" r="5" fill="#8f9892"/>
  <!-- small valve before the meter, meter, lever valve on the exposed pipe -->
  <rect x="512" y="320" width="26" height="32" rx="5" fill="${BR[1]}"/><rect x="522" y="296" width="6" height="26" fill="#c9ced1"/><ellipse cx="525" cy="294" rx="22" ry="7" fill="${C.sage}"/>
  <rect x="556" y="320" width="92" height="32" rx="10" fill="${BR[1]}"/><rect x="556" y="320" width="92" height="8" rx="4" fill="${BR[2]}" opacity=".6"/><rect x="548" y="324" width="12" height="24" fill="${BR[0]}"/><rect x="644" y="324" width="12" height="24" fill="${BR[0]}"/>
  <circle cx="602" cy="312" r="26" fill="#fbfaf6" stroke="${BR[0]}" stroke-width="6"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="${602 + 18 * Math.cos((a * Math.PI) / 180)}" y1="${312 + 18 * Math.sin((a * Math.PI) / 180)}" x2="${602 + 22 * Math.cos((a * Math.PI) / 180)}" y2="${312 + 22 * Math.sin((a * Math.PI) / 180)}" stroke="#3a463f" stroke-width="2"/>`).join("")}<path d="M602 312 L614 300" stroke="#3a463f" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(740 ${PY}) scale(.36)">${leverValveG()}</g>
  ${[690, 790].map((x) => `<path d="M${x} 252 V${PY - 10}" stroke="#8b958d" stroke-width="4"/><rect x="${x - 10}" y="${PY - 14}" width="20" height="6" rx="3" fill="#8b958d"/>`).join("")}
  <!-- numbered places -->
  <path d="M602 286 V256" stroke="${C.sageDeep}" stroke-width="3"/>${svgBadge(602, 274, 1)}
  <path d="M481 396 V344" stroke="${C.sageDeep}" stroke-width="3"/>${svgBadge(481, 410, 2)}
  <path d="M740 306 V288" stroke="${C.sageDeep}" stroke-width="3"/>${svgBadge(740, 286, 3)}
  <path d="M390 196 V222" stroke="${C.sageDeep}" stroke-width="3"/>${svgBadge(390, 168, 4)}
  </svg>`;
const scene86 = `<div style="${abs(0, SCENE_TOP, 1000, H, "background:#f1efe6")}"></div>
  ${cutaway}
  <svg style="${abs(0, SCENE_TOP + 560, 1000, 48, "filter:drop-shadow(0 6px 5px rgba(20,10,5,.4))")}" viewBox="0 0 1000 48" aria-hidden="true">${pipeH(-10, 1010, 14, 26)}${[90, 500, 910].map((x) => `<rect x="${x - 14}" y="-2" width="28" height="42" rx="5" fill="#d09061"/><rect x="${x - 14}" y="-2" width="28" height="9" rx="4" fill="#f2c9a3" opacity=".8"/>`).join("")}</svg>
  ${[0, 1, 2, 3].map((k) => {
    const [a, b] = split(i86.items[k]);
    const x = 36 + (k % 2) * 478, y = 962 + Math.floor(k / 2) * 196;
    return `<div data-check="tag" style="${abs(x, y, 450, 184, `box-sizing:border-box;display:flex;align-items:flex-start;gap:16px;padding:16px 18px;border-radius:16px;background:${k === 0 ? "linear-gradient(135deg,#d3b184,#c8a679)" : "linear-gradient(135deg,#eaf2e7,#d9e6d6)"};border:3px solid ${k === 0 ? "#8a6a3a" : C.sage};box-shadow:0 3px 4px rgba(30,40,30,.2),0 12px 18px rgba(30,40,30,.22);overflow:hidden`)}">
      ${numBadge(k + 1)}
      <div style="flex:1;min-width:0"><div style="font:700 29px/1.14 'Plex',sans-serif;color:${C.ink}">${esc(a)}</div>${b ? `<div style="font:500 26px/1.2 'Plex',sans-serif;color:#33403a;margin-top:6px;overflow-wrap:anywhere">${esc(b)}</div>` : ""}</div></div>`;
  }).join("")}`;

/* ===================================================================== */
/* #88: the ten minute check, a kraft card taped to a tiled wall           */
/* ===================================================================== */
const i88 = idea(88);
const tick = `<svg viewBox="0 0 64 64" style="width:64px;height:64px;display:block" aria-hidden="true"><rect x="6" y="8" width="48" height="48" rx="9" fill="rgba(255,255,255,.4)" stroke="#4a3a22" stroke-width="5"/><path d="M14 34 L28 48 L60 6" fill="none" stroke="#2f5a3f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const valveSketch = `<svg viewBox="0 0 280 170" style="width:280px;height:170px;display:block" aria-hidden="true" fill="none" stroke="#3a2a14" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 112 H92 M188 112 H276 M4 138 H92 M188 138 H276"/><path d="M92 100 H188 V150 H92 Z"/><path d="M118 100 V84 H162 V100"/><path d="M140 84 V30"/>
  <path d="M128 30 H152 V14 H128 Z" fill="#cdb089"/>
  <path d="M130 56 L152 50 L154 70 L132 76 Z" fill="#f0d58a"/><path d="M130 62 L153 56 M131 68 L153 62" stroke="#a98a2a" stroke-width="2"/>
  <path d="M40 112 V138 M60 112 V138" stroke-width="2" opacity=".6"/></svg>`;
const flashlight = `<svg style="${abs(540, 1214, 380, 96, "transform:rotate(-2deg);filter:drop-shadow(0 12px 8px rgba(20,25,20,.4))")}" viewBox="0 0 380 96" aria-hidden="true">
  <rect x="86" y="24" width="270" height="48" rx="14" fill="${C.sageDeep}"/><rect x="86" y="24" width="270" height="12" rx="6" fill="#fff" opacity=".2"/>
  ${Array.from({ length: 9 }, (_, k) => `<rect x="${150 + k * 16}" y="26" width="6" height="44" rx="2" fill="#000" opacity=".28"/>`).join("")}
  <rect x="30" y="8" width="64" height="80" rx="10" fill="#c3cacc"/><rect x="30" y="8" width="64" height="16" rx="8" fill="#fff" opacity=".45"/><ellipse cx="30" cy="48" rx="12" ry="38" fill="#9aa4a7"/><ellipse cx="28" cy="48" rx="8" ry="30" fill="#fff6c9"/>
  <rect x="112" y="14" width="34" height="14" rx="6" fill="#d9d3c0"/><rect x="354" y="34" width="14" height="28" rx="5" fill="#26332a"/></svg>`;
const tapeRoll = `<svg style="${abs(120, 1210, 120, 100, "filter:drop-shadow(0 10px 7px rgba(20,25,20,.4))")}" viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="62" cy="52" rx="52" ry="44" fill="#d9c995"/><ellipse cx="54" cy="46" rx="52" ry="44" fill="#efe4bb"/><ellipse cx="54" cy="46" rx="22" ry="18" fill="#e4e6dc"/><ellipse cx="54" cy="46" rx="22" ry="18" fill="none" stroke="#b8a870" stroke-width="3"/><path d="M14 28 q40 -34 80 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/></svg>`;
const tapeStrip = (x, y, rot) => `<div style="${abs(x, y, 150, 50, `transform:rotate(${rot}deg);background:rgba(240,228,184,.88);box-shadow:0 2px 4px rgba(40,30,10,.3);clip-path:polygon(0 8%,6% 0,12% 10%,18% 0,100% 0,100% 100%,18% 100%,12% 92%,6% 100%,0 90%)`)}"></div>`;
const scene88 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <pattern id="tl" width="200" height="100" patternUnits="userSpaceOnUse"><rect width="200" height="100" fill="#bfd0bf"/><rect x="3" y="3" width="94" height="44" rx="5" fill="#e9f1e8"/><rect x="103" y="3" width="94" height="44" rx="5" fill="#e3ede3"/><rect x="-47" y="53" width="94" height="44" rx="5" fill="#e3ede3"/><rect x="53" y="53" width="94" height="44" rx="5" fill="#e9f1e8"/><rect x="153" y="53" width="94" height="44" rx="5" fill="#e3ede3"/>
      <rect x="3" y="3" width="94" height="8" fill="#fff" opacity=".5"/><rect x="103" y="3" width="94" height="8" fill="#fff" opacity=".5"/><rect x="53" y="53" width="94" height="8" fill="#fff" opacity=".5"/><rect x="153" y="53" width="94" height="8" fill="#fff" opacity=".5"/><rect x="-47" y="53" width="94" height="8" fill="#fff" opacity=".5"/></pattern>
    ${noiseDefs("tn", 7, 0.25)}
    <radialGradient id="tg" cx="30%" cy="5%" r="110%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#2d4a3a" stop-opacity=".28"/></radialGradient></defs>
    <rect width="1000" height="${H}" fill="url(#tl)"/><rect width="1000" height="${H}" filter="url(#tn)" opacity=".5"/><rect width="1000" height="${H}" fill="url(#tg)"/>
    <rect y="${1290 - SCENE_TOP}" width="1000" height="80" fill="#f3f1ea"/><rect y="${1290 - SCENE_TOP}" width="1000" height="6" fill="#fff"/><rect y="${1296 - SCENE_TOP}" width="1000" height="10" fill="#000" opacity=".12"/></svg>
  <div style="${abs(82, 414, 836, 798, "box-sizing:border-box;padding:62px 46px 0;background:linear-gradient(135deg,#d8bb8f,#c8a679);border-radius:8px;box-shadow:0 3px 4px rgba(20,12,4,.3),0 26px 40px rgba(20,12,4,.45);transform:rotate(-1deg)")}">
    ${i88.items.map((t, k) => `<div data-check="row" style="display:flex;align-items:center;gap:20px;padding:12px 0;${k ? "border-top:3px dashed rgba(90,64,32,.4);" : ""}"><div style="flex:none">${tick}</div><div style="flex:1;min-width:0;font:600 29px/1.22 'Plex',sans-serif;color:#26180a"><span style="display:block" class="cap">${esc(t)}</span></div></div>`).join("")}
    <div style="position:absolute;right:34px;bottom:18px">${valveSketch}</div></div>
  ${tapeStrip(110, 396, -8)}${tapeStrip(742, 392, 7)}
  ${pencil({ x: 120, y: 1128, len: 360, rot: -7 })}
  ${tapeRoll}${flashlight}`;

/* ===================================================================== */
/* #90: wheel handle against lever handle on one copper pipe               */
/* ===================================================================== */
const i90 = idea(90);
const PY90 = 640;
const win = (x) => `<rect x="${x}" y="${PY90 - 20}" width="58" height="40" rx="8" fill="${BR[0]}"/><rect x="${x + 5}" y="${PY90 - 15}" width="48" height="30" rx="5" fill="${SLATE[1]}"/><path d="M${x + 10} ${PY90 - 4} q8 -6 14 0 t14 0 t12 0 M${x + 10} ${PY90 + 8} q8 -6 14 0 t14 0" fill="none" stroke="${SLATE[2]}" stroke-width="3" opacity=".85"/><rect x="${x + 5}" y="${PY90 - 15}" width="48" height="8" fill="#fff" opacity=".2"/>`;
const rim = (x) => `<rect x="${x - 7}" y="${PY90 - 31}" width="14" height="62" rx="4" fill="${BR[1]}"/><rect x="${x - 7}" y="${PY90 - 31}" width="5" height="62" fill="${BR[2]}" opacity=".6"/>`;
const col90 = (k, x, head, items, hdrBg) => `<div style="${abs(x, 790, 450, 542, "background:#f4f2ec;border-radius:14px;box-shadow:0 3px 4px rgba(0,0,0,.4),0 24px 36px rgba(0,0,0,.5);overflow:hidden")}">
    <div style="height:78px;background:${hdrBg};color:#fff;display:flex;align-items:center;padding:0 26px;font:700 33px/1.1 'Plex',sans-serif">${esc(head)}</div>
    ${items.map((t, j) => `<div data-check="row" style="height:116px;display:flex;align-items:center;gap:16px;padding:0 24px;${j ? "border-top:3px dashed #cdd6c8;" : ""}overflow:hidden"><span style="flex:none;width:16px;height:16px;border-radius:50%;background:${hdrBg}"></span><span style="font:600 27px/1.2 'Plex',sans-serif;color:${C.ink}">${esc(t)}</span></div>`).join("")}</div>`;
const wheelItems = split(i90.items[0]);
const leverItems = split(i90.items[1]);
const scene90 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>${noiseDefs("wn", 5, 0.5)}
    <linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a5a4d"/><stop offset="1" stop-color="#1e3129"/></linearGradient>
    <radialGradient id="wl" cx="50%" cy="25%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient></defs>
    <rect width="1000" height="${H}" fill="url(#wg)"/><rect width="1000" height="${H}" filter="url(#wn)" opacity=".6"/><rect width="1000" height="${H}" fill="url(#wl)"/></svg>
  <svg style="${abs(0, 0, 1000, 1500, "filter:drop-shadow(0 12px 8px rgba(0,0,0,.5))")}" viewBox="0 0 1000 1500" aria-hidden="true">
    ${pipeH(40, 470, PY90, 46)}${pipeH(530, 960, PY90, 46)}${rim(40)}${rim(470)}${rim(530)}${rim(960)}
    ${win(88)}${win(372)}${win(578)}${win(862)}
    <g transform="translate(255 ${PY90}) scale(.9)">${gateValveG()}</g>
    <g transform="translate(745 ${PY90}) scale(.9)">${leverValveG()}</g>
    <g transform="translate(345 ${PY90 + 22})">${tagG(7)}</g><g transform="translate(835 ${PY90 + 22})">${tagG(-6)}</g></svg>
  ${col90(0, 36, wheelItems[0], wheelItems[1].split("; "), C.sage)}
  ${col90(1, 514, leverItems[0], leverItems[1].split("; "), C.sageDeep)}`;

/* ===================================================================== */
/* #92: one household's shutoff page on a clipboard, on a hex tile floor   */
/* ===================================================================== */
const i92 = idea(92);
const hexPath = (cx, cy, r) => `M${cx} ${cy - r} L${cx + r * 0.866} ${cy - r / 2} L${cx + r * 0.866} ${cy + r / 2} L${cx} ${cy + r} L${cx - r * 0.866} ${cy + r / 2} L${cx - r * 0.866} ${cy - r / 2} Z`;
const hexes = [[0, 0], [69.28, 0], [0, 120], [69.28, 120], [34.64, 60], [34.64, -60], [34.64, 180]].map(([x, y]) => `<path d="${hexPath(x, y, 37.5)}" fill="#d6dcd8"/><path d="${hexPath(x, y, 37.5)}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" transform="translate(-1 -1)"/>`).join("");
const row92 = (label, answer, h = 128) => `<div style="height:${h}px;border-bottom:2.5px solid #b9c7d6;position:relative"><div style="font:600 24px/1 'Plex',sans-serif;color:#4b4339;padding-top:12px">${esc(label)}</div><div class="hand" style="font-size:46px;line-height:.98;font-weight:700;color:#2b4054;margin-top:8px">${esc(answer)}</div></div>`;
const [m92, mA] = split(i92.items[0]);
const [t92, tA] = split(i92.items[1]);
const [n92, nA] = split(i92.items[2]);
const [d92, dA] = split(i92.items[3]);
const sketch92 = `<svg viewBox="0 0 600 220" style="width:600px;height:220px;display:block" aria-hidden="true" fill="none" stroke="#2b4054" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M20 14 H580 V206 H20 Z" stroke-width="6"/><path d="M20 14 H580" stroke-width="6"/>
  <circle cx="110" cy="110" r="42" fill="rgba(79,122,92,.1)"/><circle cx="110" cy="110" r="22" opacity=".55"/><path d="M20 70 V150" stroke="#2b4054" stroke-width="8"/>
  <circle cx="196" cy="92" r="26" fill="${C.sage}" stroke="#fff" stroke-width="3"/><text x="196" y="102" text-anchor="middle" font-family="Plex,sans-serif" font-weight="700" font-size="30" fill="#fff" stroke="none">W</text>
  </svg>`;
const pageW = 700, pageH = 900;
const clip92 = clipboard({
  x: 60, y: 424, w: pageW, h: pageH, tilt: -2,
  content: `<div style="${abs(34, 58, pageW - 68, pageH - 94, "box-sizing:border-box;background:#fffdf6;border-radius:3px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);padding:0 30px;overflow:hidden")}">
    <div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:#e4b3b3;left:20px"></div>
    <div style="position:absolute;right:20px;top:14px"><span class="example" style="font-size:24px;padding:5px 12px;color:#4b4339">Example</span></div>
    <div style="padding-top:44px">${row92(m92, mA, 148)}${row92(t92, tA, 138)}${row92(n92, nA, 106)}
      <div style="padding-top:14px"><div style="font:600 24px/1 'Plex',sans-serif;color:#4b4339">${esc(d92)}</div>
      <div style="margin-top:8px">${sketch92}</div><div class="hand" data-check="caption" style="font-size:40px;line-height:1;font-weight:700;color:#2b4054;margin-top:4px;height:44px;overflow:hidden;white-space:nowrap">${esc(dA)}</div></div></div></div>`,
});
const bucket = `<svg style="${abs(786, 1120, 200, 240, "filter:drop-shadow(0 16px 10px rgba(10,20,20,.5))")}" viewBox="0 0 200 240" aria-hidden="true">
  <path d="M26 70 C 26 -10 174 -10 174 70" fill="none" stroke="#6f7a7d" stroke-width="7" stroke-linecap="round"/>
  <path d="M10 56 H190 L166 226 Q100 240 34 226 Z" fill="#aab4b6"/><path d="M10 56 H60 L52 226 H34 Z" fill="#dfe5e6" opacity=".7"/><path d="M190 56 H150 L146 232 Q164 230 166 226 Z" fill="#6f7a7d" opacity=".55"/>
  <path d="M26 118 H176 M30 160 H172" stroke="#6f7a7d" stroke-width="5" opacity=".45"/>
  <ellipse cx="100" cy="56" rx="90" ry="22" fill="#cdd5d6"/><ellipse cx="100" cy="58" rx="76" ry="16" fill="#46535a"/><ellipse cx="100" cy="64" rx="66" ry="10" fill="${SLATE[1]}"/><path d="M52 62 q14 -5 28 0 t28 0 t28 0" fill="none" stroke="${SLATE[2]}" stroke-width="3" opacity=".8"/></svg>`;
const scene92 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <pattern id="hx" width="69.28" height="120" patternUnits="userSpaceOnUse"><rect width="69.28" height="120" fill="#a9b6b2"/>${hexes}</pattern>
    ${noiseDefs("hn", 3, 0.3)}<radialGradient id="hv" cx="35%" cy="10%" r="110%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#0e1c22" stop-opacity=".45"/></radialGradient></defs>
    <rect width="1000" height="${H}" fill="url(#hx)"/><rect width="1000" height="${H}" filter="url(#hn)" opacity=".5"/><rect width="1000" height="${H}" fill="url(#hv)"/></svg>
  ${clip92}${bucket}`;

/* ===================================================================== */
/* #94: four steps down a white plastic pipe                               */
/* ===================================================================== */
const i94 = idea(94);
const stepArt = [
  `<svg viewBox="0 0 150 150" style="position:absolute;inset:0;width:150px;height:150px" aria-hidden="true"><rect width="150" height="150" rx="14" fill="#e6ede2"/>${pipeH(0, 150, 124, 20)}<g transform="translate(75 124) scale(.44)">${gateValveG()}</g></svg><div style="position:absolute;right:-12px;top:-12px;width:54px;height:54px;border-radius:50%;background:${C.sage};border:3px solid #fff;display:grid;place-items:center;box-shadow:0 3px 5px rgba(0,0,0,.25)">${icon("hand-palm", { size: 32, color: "#fff", weight: "bold" })}</div>`,
  `<svg viewBox="0 0 150 150" style="position:absolute;inset:0;width:150px;height:150px" aria-hidden="true"><rect width="150" height="150" rx="14" fill="#e6ede2"/><rect x="26" y="16" width="84" height="116" rx="5" fill="#fffdf6" stroke="#8b958d" stroke-width="3"/>${[42, 58, 74, 90, 106].map((y) => `<path d="M38 ${y} H98" stroke="#b9c7d6" stroke-width="3"/>`).join("")}<path d="M38 48 H78 M38 64 H90" stroke="#2b4054" stroke-width="4" stroke-linecap="round"/><g transform="translate(70 118) rotate(-38)"><rect x="0" y="-8" width="74" height="16" fill="#e7b23f"/><rect x="0" y="-8" width="74" height="5" fill="#f3cf6a"/><rect x="74" y="-8" width="10" height="16" fill="#b9b9c0"/><rect x="84" y="-8" width="14" height="16" rx="6" fill="#e58b8b"/><path d="M0 -8 L-22 0 L0 8 Z" fill="#e9c9a0"/><path d="M-14 -3 L-22 0 L-14 3 Z" fill="#33363b"/></g></svg>`,
  `<svg viewBox="0 0 150 150" style="position:absolute;inset:0;width:150px;height:150px" aria-hidden="true"><rect width="150" height="150" rx="14" fill="#e6ede2"/><rect x="24" y="22" width="102" height="14" rx="6" fill="#f7f8f6" stroke="#8b958d" stroke-width="3"/><path d="M28 36 q0 40 47 40 q47 0 47 -40 Z" fill="#fbfaf6" stroke="#8b958d" stroke-width="3"/><path d="M68 4 V22 M68 4 H88 q8 0 8 8" fill="none" stroke="#9aa4a7" stroke-width="8" stroke-linecap="round"/><rect x="69" y="76" width="12" height="30" fill="${COPPER[1]}"/><rect x="58" y="104" width="34" height="22" rx="5" fill="${BR[1]}"/><rect x="58" y="104" width="34" height="6" fill="${BR[2]}" opacity=".6"/><rect x="92" y="108" width="26" height="14" rx="7" fill="${C.sage}"/><rect x="118" y="112" width="32" height="8" fill="${COPPER[1]}"/></svg>`,
  `<svg viewBox="0 0 150 150" style="position:absolute;inset:0;width:150px;height:150px" aria-hidden="true"><rect width="150" height="150" rx="14" fill="#e6ede2"/><g transform="rotate(-5 75 75)"><rect x="14" y="30" width="122" height="90" rx="8" fill="#fffdf6" stroke="#8b958d" stroke-width="3"/><rect x="14" y="30" width="122" height="22" rx="8" fill="${C.sageDeep}"/><rect x="26" y="70" width="60" height="9" rx="4" fill="#b7c6b8"/><rect x="26" y="90" width="44" height="9" rx="4" fill="#d0dacf"/></g></svg><div style="position:absolute;right:16px;top:58px">${icon("wrench", { size: 52, color: C.sageDeep, weight: "duotone" })}</div>`,
];
const scene94 = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
    <pattern id="ln" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 39.5 H40" stroke="#ddd6c0" stroke-width="1.5"/></pattern>
    <linearGradient id="pv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9c0bb"/><stop offset=".3" stop-color="#fbfcfa"/><stop offset="1" stop-color="#aab2ac"/></linearGradient>
    <linearGradient id="pc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a4ada7"/><stop offset=".3" stop-color="#f4f6f3"/><stop offset="1" stop-color="#8f9993"/></linearGradient></defs>
    <rect width="1000" height="${H}" fill="#efeadb"/><rect width="1000" height="${H}" fill="url(#ln)"/>
    <g style="filter:drop-shadow(6px 8px 6px rgba(40,30,10,.3))"><rect x="42" y="0" width="52" height="${H}" fill="url(#pv)"/>
    ${[0, 1, 2, 3].map((k) => { const cy = 22 + k * 240 + 107; return `<rect x="92" y="${cy - 16}" width="70" height="32" fill="url(#pv)"/><rect x="28" y="${cy - 34}" width="80" height="68" rx="9" fill="url(#pc)"/><rect x="28" y="${cy - 22}" width="80" height="5" fill="#000" opacity=".12"/><rect x="28" y="${cy + 17}" width="80" height="5" fill="#000" opacity=".12"/>`; }).join("")}</g></svg>
  ${i94.items.map((t, k) => {
    const y = 394 + k * 240, first = k === 0;
    return `<div style="${abs(150, y, 810, 214, "box-sizing:border-box;display:flex;align-items:center;gap:22px;padding:0 28px 0 26px;background:#fffdf8;border-radius:16px;box-shadow:0 3px 4px rgba(40,30,10,.25),0 16px 26px rgba(40,30,10,.28)")}">
      ${numBadge(k + 1, { size: 68, fs: 36, bg: first ? C.ochre : C.sageDeep })}
      <div style="position:relative;flex:none;width:150px;height:150px">${stepArt[k]}</div>
      <div data-check="step" style="flex:1;min-width:0;height:180px;display:flex;align-items:center;overflow:hidden"><div class="cap" style="font:600 31px/1.22 'Plex',sans-serif;color:${C.ink}">${esc(t)}</div></div></div>`;
  }).join("")}`;

const CAP = ".cap::first-letter{text-transform:uppercase}";
export const pins = [
  printable({ n: 86, scene: scene86, paper: "#e7efe5", extraCss: CAP }),
  printable({ n: 88, scene: scene88, paper: "#e3ece3", extraCss: CAP }),
  printable({ n: 90, scene: scene90, paper: "#ece9dd", extraCss: CAP }),
  printable({ n: 92, scene: scene92, paper: "#e8ecea", extraCss: `${CAP}.top h1{font-size:74px}.top p{font-size:26px}` }),
  printable({ n: 94, scene: scene94, paper: "#efe9d8", headline: i94.headline, extraCss: `${CAP}.top .eyebrow{display:none}` }),
];
