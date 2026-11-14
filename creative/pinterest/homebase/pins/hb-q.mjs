/**
 * Group Q: hallway and front door. First-week safety and maintenance guide
 * pins #96, #98, #99, #100. Every word is the idea bank's (headline, sub,
 * items) or a label named in the idea's visual ("Safety", "Example",
 * "Friday", "Monday"). No printed page or app screen is shown: all four are
 * drawn scenes, so nothing printed is marked.
 */
import { idea, footFor, C, p } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { icon } from "../kit/icons.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const exampleTag = (x, y, extra = "") =>
  `<div class="example" style="${abs(x, y, 150, 42, `display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;padding:0;${extra}`)}">Example</div>`;
const safetyTag = (x, y, w = 150, extra = "") =>
  `<div style="${abs(x, y, w, 46, `display:flex;align-items:center;justify-content:center;gap:8px;background:${C.ochre};color:#fff8ea;border-radius:8px;font:600 24px/1 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;box-shadow:0 6px 10px rgba(40,20,5,.3);${extra}`)}">Safety</div>`;

/* ---------- hallway props (flat vector, soft shadows) ---------- */

/** A bunch of brass keys on a ring with a sage tag (viewBox 220 x 330, hanging from the top). */
function keys({ x, y, w = 200, rot = 0, tag = C.sage }) {
  const h = w * 1.5;
  const key = (cx, len, rotk, teeth) => `<g transform="rotate(${rotk} 110 70) translate(${cx - 110} 0)">
    <circle cx="110" cy="132" r="25" fill="url(#brass)" stroke="#8c6b22" stroke-width="2"/><circle cx="110" cy="132" r="11" fill="#e9dfc9"/>
    <rect x="102" y="152" width="16" height="${len}" fill="url(#brass)" stroke="#8c6b22" stroke-width="2"/>
    ${teeth.map((t, k) => `<rect x="118" y="${152 + len - 10 - k * 18}" width="${t}" height="9" fill="url(#brass)" stroke="#8c6b22" stroke-width="1.5"/>`).join("")}</g>`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);transform-origin:50% 0;filter:drop-shadow(0 14px 10px rgba(40,25,5,.4))`)}" viewBox="0 0 220 330" aria-hidden="true">
    <defs><linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dc8e"/><stop offset=".5" stop-color="#cfa94a"/><stop offset="1" stop-color="#a9822e"/></linearGradient></defs>
    ${key(110, 112, -24, [20, 14, 20])}${key(110, 100, 22, [18, 22])}${key(110, 124, 0, [22, 16, 22])}
    <circle cx="110" cy="62" r="40" fill="none" stroke="#9aa0a6" stroke-width="7"/><circle cx="110" cy="62" r="40" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-dasharray="60 200"/>
    <g transform="translate(110 30)"><path d="M0 0 C 40 -8 70 24 78 60 L 70 62" fill="none" stroke="#6b6f74" stroke-width="2" opacity="0"/></g>
    <g transform="rotate(14 150 190)"><rect x="118" y="188" width="76" height="98" rx="16" fill="${tag}"/><rect x="118" y="188" width="76" height="22" rx="14" fill="#fff" opacity=".2"/><circle cx="156" cy="206" r="7" fill="#f4f2ec"/><path d="M156 206 L134 120" stroke="#6b6f74" stroke-width="3" fill="none" opacity="0"/></g>
    <path d="M110 100 C 120 140 150 180 156 206" stroke="#e9e4d4" stroke-width="3" fill="none"/>
  </svg>`;
}

/** An oak rail with brass hooks (hooks only; keys placed separately). */
function hookRail({ x, y, w, hooks = [] }) {
  return `<div style="${abs(x, y, w, 44, `background:linear-gradient(#d3a468,#a9783f);border-radius:8px;box-shadow:0 3px 3px rgba(40,20,5,.3),0 16px 20px rgba(40,20,5,.32)`)}"><div style="position:absolute;inset:0;border-radius:8px;background:linear-gradient(rgba(255,255,255,.28),transparent 40%)"></div></div>` +
    hooks.map((hx) => `<svg style="${abs(x + hx - 16, y + 30, 32, 52, "filter:drop-shadow(0 6px 4px rgba(40,20,5,.35))")}" viewBox="0 0 32 52" aria-hidden="true"><circle cx="16" cy="8" r="7" fill="#b8902f"/><path d="M16 8 V34 C 16 48 30 48 30 34" fill="none" stroke="#c9a24a" stroke-width="7" stroke-linecap="round"/></svg>`).join("");
}

/** A cardboard moving box, front corner view (viewBox 300 x 220). */
function movingBox({ x, y, w = 300, rot = 0 }) {
  const h = w * (220 / 300);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,20,8,.42))`)}" viewBox="0 0 300 220" aria-hidden="true">
    <path d="M10 50 H290 V214 H10 Z" fill="#c8a276"/><path d="M10 50 H290 V74 H10 Z" fill="#d9b88c"/>
    <path d="M10 50 L40 6 H260 L290 50 Z" fill="#dcbd90"/><path d="M150 6 V50" stroke="#b08b5c" stroke-width="3"/><path d="M40 6 L10 50 M260 6 L290 50" stroke="#b08b5c" stroke-width="2"/>
    <rect x="112" y="50" width="76" height="164" fill="#e8dcc4" opacity=".75"/><rect x="112" y="50" width="76" height="164" fill="none" stroke="#bfae8a" stroke-width="2"/>
    <rect x="30" y="110" width="52" height="30" rx="14" fill="#6a4f30" opacity=".5"/>
    <path d="M10 50 V214" stroke="#fff" stroke-opacity=".28" stroke-width="5"/></svg>`;
}

/* =================== pin 96: day-one safety jobs (kraft card, key hook) =================== */

function pin96() {
  const i = idea(96);
  const rows = i.items;
  // The alarm row is the third; the safety tag sits beside it.
  const rowH = [112, 66, 148, 112];
  let top = 0;
  const list = rows.map((t, k) => {
    const y = top;
    top += rowH[k];
    return `<div style="${abs(0, y, 740, rowH[k] - 10, "display:flex;align-items:flex-start;gap:22px;border-bottom:2.5px dashed rgba(70,45,15,.38)")}">
      <div style="flex:none;width:38px;height:38px;margin-top:5px;border:4px solid ${C.ink};border-radius:8px;background:rgba(255,250,236,.55)"></div>
      <div style="font:500 31px/1.28 'Plex',sans-serif;color:${C.ink};width:${k === 2 ? 560 : 640}px">${esc(t)}</div></div>`;
  }).join("");
  const card = `<div style="${abs(66, 700, 868, 592, "transform:rotate(-1.2deg)")}">
    <div style="position:absolute;inset:0;border-radius:14px;background:linear-gradient(160deg,#dcc196,#c9a577);box-shadow:0 3px 4px rgba(40,20,5,.3),0 26px 46px rgba(40,20,5,.42)"></div>
    <div style="position:absolute;inset:0;border-radius:14px;background:repeating-linear-gradient(90deg,rgba(120,80,30,.05) 0 2px,transparent 2px 7px)"></div>
    <div style="${abs(60, 48, 760, 500)}">${list}</div>
    ${safetyTag(676, 48 + 112 + 66 + 8, 140)}
  </div>`;
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(180deg,#ece5d3,#e4dcc7)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:repeating-linear-gradient(90deg,rgba(120,100,60,.07) 0 2px,transparent 2px 64px)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:radial-gradient(ellipse at 22% 6%,rgba(255,255,255,.55),transparent 60%),radial-gradient(ellipse at 90% 100%,rgba(40,30,10,.22),transparent 60%)")}"></div>
  ${hookRail({ x: 80, y: 440, w: 560, hooks: [150, 330, 520] })}
  ${keys({ x: 232, y: 492, w: 186, rot: 2 })}
  ${keys({ x: 420, y: 500, w: 130, rot: -4, tag: C.sageDeep })}
  <div style="${abs(700, 430, 220, 120, "display:flex;align-items:center;justify-content:center;opacity:.9")}">${icon("house-line", { size: 110, color: C.sage, weight: "duotone" })}</div>
  ${card}`;
  return printable({ n: 96, paper: C.paper, scene });
}

/* =================== pin 98: the first weekend, a week of easy access =================== */

function pin98() {
  const i = idea(98);
  const [monday, weekend] = i.items;
  const monClauses = monday.replace(/^By Monday, /, "").replace(/\.$/, "").split(/, (?:and )?/); // the shutoffs are found / the meters are photographed / the smoke alarms are tested
  const afterWeekend = weekend.replace(/^By the following weekend, /, ""); // the inspection report is marked up with a date beside each item
  const heights = [0.5, 0.8, 0.93, 1, 0.86, 0.74, 0.62, 0.52, 0.44, 0.36, 0.29, 0.23, 0.18, 0.13, 0.09, 0.06];
  const bw = 40, gap = 14, cx0 = 54, cyBase = 262, chartH = 220;
  const bars = heights.map((hh, k) => {
    const hpx = Math.max(8, hh * chartH);
    const x = cx0 + k * (bw + gap);
    const col = k === 3 ? C.sageDeep : k < 3 ? C.sage : "#8fb09a";
    return `<rect x="${x}" y="${cyBase - hpx}" width="${bw}" height="${hpx}" rx="7" fill="${col}"/><rect x="${x}" y="${cyBase - hpx}" width="${bw}" height="${Math.min(14, hpx)}" rx="7" fill="#fff" opacity=".22"/>`;
  }).join("");
  const tickX = (k) => cx0 + k * (bw + gap) + bw / 2;
  const tick = (k, label, anchor = "middle") => `<path d="M${tickX(k)} ${cyBase + 8} V${cyBase + 28}" stroke="${C.ink}" stroke-width="3"/><text x="${tickX(k)}" y="${cyBase + 62}" text-anchor="${anchor}" font-family="Plex,sans-serif" font-weight="600" font-size="26" fill="${C.ink}">${label}</text>`;
  const chart = `<svg style="${abs(30, 56, 900, 340)}" viewBox="0 0 900 340" aria-hidden="true">
    <path d="M30 ${cyBase + 4} H880" stroke="${C.ink}" stroke-width="3.5"/>
    <g stroke="${C.rule}" stroke-width="2" stroke-dasharray="3 9">${[0.33, 0.66, 1].map((f) => `<path d="M30 ${cyBase - f * chartH} H880"/>`).join("")}</g>
    ${bars}${tick(0, "Friday")}${tick(3, "Monday")}${tick(8, "The following weekend")}</svg>`;
  const tiles = [
    { ic: "drop", t: cap(monClauses[0]), c: C.sage },
    { ic: "gauge", t: cap(monClauses[1]), c: C.sage },
    { ic: "bell-ringing", t: cap(monClauses[2]), c: C.sage },
  ].map((t, k) => `<div style="${abs(28 + k * 292, 0, 276, 150, "background:#fff;border:2.5px solid #d7dfd3;border-radius:16px;box-shadow:0 6px 12px rgba(30,40,30,.12);padding:16px 18px;display:flex;flex-direction:column;gap:8px")}">
      <div style="height:44px">${icon(t.ic, { size: 44, color: t.c, weight: "duotone" })}</div>
      <div style="font:600 25px/1.22 'Plex',sans-serif;color:${C.ink}">${esc(t.t)}</div></div>`).join("");
  const board = `<div style="${abs(50, 404, 900, 840)}" >
    <div style="position:absolute;inset:0;border-radius:22px;background:${C.paperLight};box-shadow:0 4px 6px rgba(0,0,0,.3),0 30px 56px rgba(0,0,0,.5)"></div>
    <div style="position:absolute;inset:0;border-radius:22px;border:3px solid #e1e6dc"></div>
    ${exampleTag(722, 24)}
    <div class="eyebrow" style="${abs(34, 40, 400, 30)}">By Monday</div>
    ${chart.replace("top:56px", "top:70px")}
    <div style="${abs(0, 436, 900, 150)}">${tiles}</div>
    <div class="eyebrow" style="${abs(34, 606, 600, 30)}">By the following weekend</div>
    <div style="${abs(28, 648, 844, 150, "background:#fff;border:2.5px solid #d7dfd3;border-radius:16px;box-shadow:0 6px 12px rgba(30,40,30,.12);display:flex;align-items:center;gap:22px;padding:0 26px")}" data-check="note">
      <div style="flex:none">${icon("clipboard-text", { size: 66, color: C.sageDeep, weight: "duotone" })}</div>
      <div style="font:600 32px/1.25 'Plex',sans-serif;color:${C.ink}">${esc(cap(afterWeekend))}</div></div>
  </div>`;
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(180deg,#2f4a3b,#243a2d)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 3px,rgba(255,255,255,.04) 3px 6px,transparent 6px 78px)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:radial-gradient(ellipse at 20% 5%,rgba(255,255,255,.18),transparent 60%),radial-gradient(ellipse at 90% 100%,rgba(0,0,0,.35),transparent 60%)")}"></div>
  ${board}
  ${movingBox({ x: 690, y: 1186, w: 280, rot: 2 })}
  ${keys({ x: 70, y: 1196, w: 120, rot: 74 })}`;
  return printable({ n: 98, paper: "#e4ebe1", scene });
}

/* =================== pin 99: smoke and CO alarms, test monthly and replace at 10 years =================== */

function alarmArt() {
  const stroke = `stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"`;
  const slots = (cx, cy, r) => Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    return `<path d="M${cx + Math.cos(a) * (r * 0.5)} ${cy + Math.sin(a) * (r * 0.5)} L${cx + Math.cos(a) * (r * 0.74)} ${cy + Math.sin(a) * (r * 0.74)}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
  }).join("");
  return `<svg style="${abs(0, 372, 1000, 400)}" viewBox="0 0 1000 400" aria-hidden="true">
    <defs><linearGradient id="ceil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3dfcd"/><stop offset="1" stop-color="#dfe8da"/></linearGradient></defs>
    <rect width="1000" height="400" fill="url(#ceil)"/>
    <g stroke="#bccab6" stroke-width="3"><path d="M0 120 H1000"/><path d="M0 250 H1000"/></g>
    <rect y="372" width="1000" height="28" fill="#f4f7f1"/><rect y="372" width="1000" height="6" fill="#000" opacity=".1"/><rect y="396" width="1000" height="4" fill="#000" opacity=".06"/>
    <ellipse cx="300" cy="226" rx="128" ry="20" fill="#000" opacity=".12"/>
    <circle cx="300" cy="196" r="128" fill="#fbfaf6" ${stroke}/><circle cx="300" cy="196" r="104" fill="none" stroke="${C.ink}" stroke-width="3" opacity=".5"/>
    ${slots(300, 196, 176)}
    <circle cx="300" cy="196" r="38" fill="${C.wash}" ${stroke}/><circle cx="300" cy="196" r="14" fill="${C.sage}"/><circle cx="388" cy="118" r="7" fill="${C.sage}"/>
    <ellipse cx="700" cy="226" rx="118" ry="20" fill="#000" opacity=".12"/>
    <rect x="590" y="94" width="220" height="220" rx="46" fill="#fbfaf6" ${stroke}/><rect x="610" y="114" width="180" height="180" rx="32" fill="none" stroke="${C.ink}" stroke-width="3" opacity=".5"/>
    <rect x="636" y="140" width="128" height="92" rx="10" fill="${C.wash}" ${stroke}/>
    <text x="700" y="203" text-anchor="middle" font-family="Plex,sans-serif" font-weight="700" font-size="56" fill="${C.ink}">CO</text>
    ${[0, 1, 2, 3, 4].map((k) => `<path d="M${644 + k * 18} 252 V282" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`).join("")}
    <circle cx="778" cy="136" r="7" fill="${C.sage}"/>
    <g fill="none" stroke="${C.sage}" stroke-width="7" stroke-linecap="round"><path d="M124 100 C 96 140 96 252 124 292" opacity=".9"/><path d="M84 70 C 36 130 36 262 84 322" opacity=".6"/><path d="M876 100 C 904 140 904 252 876 292" opacity=".9"/><path d="M916 70 C 964 130 964 262 916 322" opacity=".6"/></g>
    <path d="M176 258 C 176 300 190 318 214 330" stroke="#bfb9a8" stroke-width="3" fill="none" opacity="0"/>
  </svg>`;
}

function pin99() {
  const i = idea(99);
  const [eyebrow, big] = i.headline.split(": ");
  const [test, replace] = i.items[1].split(", ").map(cap);
  const chip = (x, ic, label) => `<div style="${abs(x, 1130, 420, 120, "display:flex;align-items:center;gap:20px;padding:0 28px;background:linear-gradient(160deg,#dcc196,#c9a577);border-radius:14px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 16px 26px rgba(40,20,5,.35)")}">
    ${icon(ic, { size: 56, color: C.ink, weight: "duotone" })}<div style="font:600 36px/1.1 'Plex',sans-serif;color:${C.ink}">${esc(label)}</div></div>`;
  const body = `
  <div style="${abs(0, 0, 1000, 372, "background:#e6ede2")}"></div>
  <div style="position:absolute;left:64px;right:64px;top:64px" data-check="headline" data-bottom-max="366">
    <div class="eyebrow">${esc(eyebrow)}</div>
    <h1 style="font:500 92px/1.02 'Newsreader',Georgia,serif;letter-spacing:-.02em;margin-top:14px">${esc(big)}</h1></div>
  ${alarmArt()}
  <div style="position:absolute;left:560px;top:690px;width:3px;height:0"></div>
  ${safetyTag(780, 700, 150, "transform:rotate(4deg)")}
  <div style="${abs(500, 296, 3, 3)}"></div>
  <div style="${abs(60, 810, 880, 280, "background:#fbfaf6;border-radius:18px;box-shadow:0 4px 6px rgba(30,40,30,.15),0 22px 40px rgba(30,40,30,.22)")}"></div>
  <div style="${abs(60, 810, 14, 280, `background:${C.sage};border-radius:18px 0 0 18px`)}"></div>
  <div data-check="quote" style="${abs(110, 836, 800, 232, "display:flex;align-items:center;font:500 62px/1.12 'Newsreader',Georgia,serif;letter-spacing:-.01em;color:#1a2420")}">${esc(i.sub)}</div>
  ${chip(60, "bell-ringing", test)}${chip(520, "calendar-check", replace)}
  ${footFor(i)}`;
  return { n: 99, id: `99-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, paper: "#e6ede2", css: ".foot{z-index:7}" }) };
}

/* =================== pin 100: washing machine hoses (a plate close-up in the hallway cupboard) =================== */

function hoseDrawing() {
  const line = `stroke="${C.ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const hose = (d) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="38" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#56615d" stroke-width="28" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#a8b2ae" stroke-width="28" stroke-dasharray="3 11" opacity=".55"/><path d="${d}" fill="none" stroke="#fff" stroke-width="5" opacity=".18" transform="translate(-6 -6)"/>`;
  const nut = (x, y) => `<rect x="${x - 25}" y="${y - 14}" width="50" height="28" rx="6" fill="url(#brs)" stroke="#8c6b22" stroke-width="3"/><path d="M${x - 10} ${y - 14} V${y + 14} M${x + 10} ${y - 14} V${y + 14}" stroke="#8c6b22" stroke-width="2"/>`;
  const tag = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-4 -30 L 10 4" stroke="#6b5a3a" stroke-width="3" fill="none"/><rect x="-10" y="0" width="154" height="62" rx="9" fill="#d7b783" stroke="#8a6a3a" stroke-width="3"/><circle cx="4" cy="12" r="5" fill="${C.paperLight}" stroke="#8a6a3a" stroke-width="2"/><text x="78" y="44" text-anchor="middle" font-family="Plex,sans-serif" font-weight="600" font-size="27" fill="${C.ink}">10 years</text></g>`;
  return `<svg style="${abs(110, 420, 780, 600, "filter:drop-shadow(0 4px 6px rgba(60,40,10,.3)) drop-shadow(0 28px 40px rgba(60,40,10,.4))")}" viewBox="0 0 780 600" aria-hidden="true">
    <defs><linearGradient id="brs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dc8e"/><stop offset=".55" stop-color="#cfa94a"/><stop offset="1" stop-color="#a9822e"/></linearGradient><clipPath id="pl"><rect width="780" height="600" rx="22"/></clipPath></defs>
    <rect width="780" height="600" rx="22" fill="#fbfaf6"/>
    <g clip-path="url(#pl)">
      <rect width="780" height="170" fill="#ece6d4"/><path d="M0 170 H780" stroke="#c9c1a8" stroke-width="4"/>
      <g stroke="#d9d1ba" stroke-width="3"><path d="M0 60 H780"/><path d="M0 116 H780"/></g>
      <rect x="150" y="26" width="360" height="94" rx="14" fill="#fbfaf6" ${line}/>
      <circle cx="238" cy="112" r="20" fill="#e9e4d4" ${line}/><path d="M238 112 L238 62" ${line} fill="none" stroke-width="9"/><circle cx="238" cy="58" r="12" fill="${C.sage}" stroke="${C.ink}" stroke-width="4"/>
      <circle cx="420" cy="112" r="20" fill="#e9e4d4" ${line}/><path d="M420 112 L420 62" ${line} fill="none" stroke-width="9"/><circle cx="420" cy="58" r="12" fill="${C.sage}" stroke="${C.ink}" stroke-width="4"/>
      <rect x="86" y="170" width="608" height="460" rx="22" fill="#fbfaf6" ${line}/>
      <rect x="112" y="196" width="556" height="420" rx="14" fill="#f1efe6" stroke="${C.ink}" stroke-width="3" opacity=".9"/>
      <g stroke="${C.ink}" stroke-width="5" stroke-linecap="round">${Array.from({ length: 7 }, (_, k) => `<path d="M470 ${246 + k * 22} H640"/>`).join("")}</g>
      <rect x="140" y="440" width="220" height="110" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="3"/><g stroke="${C.rule}" stroke-width="5" stroke-linecap="round"><path d="M160 468 H330"/><path d="M160 494 H300"/><path d="M160 520 H318"/></g>
      <path d="M690 340 C 740 340 760 400 700 470" fill="none" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/><path d="M690 340 C 740 340 760 400 700 470" fill="none" stroke="#56615d" stroke-width="8" stroke-linecap="round"/>
      ${hose("M238 130 C 128 160 128 262 238 294")}
      ${hose("M420 130 C 530 160 530 262 420 294")}
      ${nut(238, 126)}${nut(420, 126)}${nut(238, 298)}${nut(420, 298)}
      ${tag(124, 186, -4)}${tag(500, 180, 5)}
      <path d="M200 340 c 0 0 -17 24 -17 36 a17 17 0 0 0 34 0 c 0 -12 -17 -36 -17 -36 Z" fill="${C.slate}" opacity=".95"/><path d="M193 372 a10 10 0 0 0 8 10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>
    </g></svg>`;
}

function pin100() {
  const i = idea(100);
  const [interval, , burst] = [i.items[1], i.items[0], i.items[2]];
  const scene = `
  <div style="${abs(0, 372, 1000, 1000, "background:linear-gradient(180deg,#f0e6c6,#e8dcb6)")}"></div>
  <div style="${abs(0, 372, 1000, 880, "background:repeating-linear-gradient(0deg,rgba(150,120,50,.1) 0 3px,transparent 3px 60px)")}"></div>
  <div style="${abs(0, 372, 1000, 1000, "background:radial-gradient(ellipse at 20% 4%,rgba(255,255,255,.6),transparent 60%),radial-gradient(ellipse at 90% 80%,rgba(80,50,10,.18),transparent 60%)")}"></div>
  ${hoseDrawing()}
  <div style="${abs(110, 1052, 780, 100, "display:flex;align-items:center;justify-content:center;gap:20px;background:linear-gradient(160deg,#dcc196,#c9a577);border-radius:14px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 18px 28px rgba(40,20,5,.35);transform:rotate(-.8deg)")}" data-check="chip">
    ${icon("calendar-check", { size: 54, color: C.ink, weight: "duotone" })}<div style="font:600 34px/1.1 'Plex',sans-serif;color:${C.ink}">${esc(interval)}</div></div>
  <div style="${abs(110, 1180, 780, 80, "font:500 31px/1.3 'Plex',sans-serif;color:#1a2420;text-align:center")}" data-check="line">${esc(burst)}</div>
  <div style="${abs(0, 1290, 1000, 70, "background:linear-gradient(#b98d55,#9a6f3a)")}"></div>
  <div style="${abs(0, 1282, 1000, 12, "background:#f4efe0;box-shadow:0 -2px 4px rgba(0,0,0,.12)")}"></div>
  <div style="${abs(560, 1300, 340, 64, `background:repeating-linear-gradient(90deg,${C.sageDeep} 0 22px,#3d6a4d 22px 30px);border-radius:8px 8px 0 0;box-shadow:0 -6px 12px rgba(0,0,0,.3)`)}"></div>`;
  return printable({ n: 100, paper: "#f3ead0", scene });
}

export const pins = [pin96(), pin98(), pin99(), pin100()];
