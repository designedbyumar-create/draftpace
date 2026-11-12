/**
 * Batch 2, group G6: the hardware store (small-parts drawers with brass labels, a tape
 * measure, paint chips, sandpaper, paint pails on a shelf, a spirit level).
 *
 *   #59  two pulled-out drawers of a small-parts cabinet, Sinking fund and Emergency fund
 *   #61  the five yearly costs piled on one card, then as ruled rows, split by a tape measure
 *   #63  the by-hand sum on a worksheet card against a wall of paint chips
 *   #71  the phone-bill script on a note clipped to a divider, on sheets of sandpaper
 *   #73  two shelves of mixing pails filled to the rule, one overflowing, a spirit level between
 *
 * Words: the idea's own (headline, sub, items) plus labels that are real in the guide the
 * pin is about (the table headings Cost / Date / Size / When it is used, Needs / Wants /
 * Savings and extra debt, the monthly amounts of the guide's year-of-costs table).
 */
import { esc } from "../../v3/kit.mjs";
import { idea } from "../kit/bank.mjs";
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_H = 1354 - SCENE_TOP;
const lcg = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const SHADOW = "box-shadow:0 2px 3px rgba(20,20,10,.28),0 16px 30px rgba(20,20,10,.38)";
const hl = (t, c = "rgba(246,184,52,.75)") => `<span style="background:linear-gradient(transparent 12%,${c} 12% 88%,transparent 88%);padding:0 .12em;margin:0 -.12em">${esc(t)}</span>`;
const exTag = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 10px;${extra}">Example</span>`;

/* ------------------------------------------------------------------ props */

/** A brass label holder with a paper card inside. */
function brass({ x, y, w, h, html, extra = "" }) {
  return `<div style="${abs(x, y, w, h, `border-radius:7px;background:linear-gradient(#f0d98f,#c29b43 50%,#dcc070);border:3px solid #8f6f25;box-shadow:0 2px 0 #6b4f16,0 8px 12px rgba(0,0,0,.4);padding:7px;${extra}`)}"><div style="width:100%;height:100%;background:#f9f4e3;border-radius:3px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 2px 5px rgba(60,40,0,.25);text-align:center;line-height:1.05;color:#1d1d20">${html}</div>
  <i style="position:absolute;left:10px;top:50%;width:7px;height:7px;margin-top:-3px;border-radius:50%;background:#7c5f1d;opacity:.8"></i><i style="position:absolute;right:10px;top:50%;width:7px;height:7px;margin-top:-3px;border-radius:50%;background:#7c5f1d;opacity:.8"></i></div>`;
}

/** A flat carpenter's pencil. */
function carpenter({ x, y, len = 440, rot = 0, body = "#c8452d" }) {
  const h = 34;
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(20,20,10,.4))`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
  <path d="M60 2 H${len - 4} Q${len} 2 ${len} 7 V27 Q${len} 32 ${len - 4} 32 H60 L2 21 V13 Z" fill="${body}"/>
  <path d="M60 2 H${len - 4} Q${len} 2 ${len} 7 V12 H60 Z" fill="#fff" opacity=".22"/>
  <path d="M60 24 H${len} V32 H60 Z" fill="#000" opacity=".2"/>
  <path d="M2 13 L2 21 L60 32 L60 2 Z" fill="#e8c9a0"/><path d="M2 13 L2 21 L16 23.5 L16 10.5 Z" fill="#33363b"/>
  </svg>`;
}

/** A pocket calculator, upright; the display shows the answer. */
function calculator({ x, y, w = 230, rot = 0, answer = "112.50" }) {
  const h = w * 1.5;
  const keys = [];
  const rows = [["C", "÷", "×", "−"], ["7", "8", "9", "+"], ["4", "5", "6", "+"], ["1", "2", "3", "="], ["0", "0", ".", "="]];
  rows.forEach((r, ri) => r.forEach((k, ci) => {
    if ((ri === 2 && ci === 3) || (ri === 4 && (ci === 1 || ci === 3))) return;
    const op = ci === 3 || ri === 0;
    const tall = ci === 3 && (ri === 1 || ri === 3);
    const wide = ri === 4 && ci === 0;
    keys.push(`<rect x="${22 + ci * 47}" y="${150 + ri * 38}" width="${wide ? 85 : 40}" height="${tall ? 76 : 31}" rx="6" fill="${op ? "#2f6b57" : "#faf7ee"}"/><rect x="${22 + ci * 47}" y="${150 + ri * 38}" width="${wide ? 85 : 40}" height="${tall ? 76 : 31}" rx="6" fill="none" stroke="#000" stroke-opacity=".18"/><text x="${22 + ci * 47 + (wide ? 42 : 20)}" y="${150 + ri * 38 + (tall ? 44 : 22)}" font-family="Plex" font-weight="600" font-size="17" fill="${op ? "#fff" : "#1d1d20"}" text-anchor="middle">${k}</text>`);
  }));
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(20,20,10,.45))`)}" viewBox="0 0 230 345" aria-hidden="true">
  <rect x="4" y="4" width="222" height="337" rx="22" fill="#e6e0d0"/><rect x="4" y="4" width="222" height="337" rx="22" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
  <rect x="18" y="20" width="194" height="108" rx="10" fill="#26352f"/><rect x="26" y="28" width="178" height="92" rx="6" fill="#c9d8b8"/>
  <text x="196" y="92" font-family="Plex Mono" font-weight="500" font-size="44" fill="#1f2a22" text-anchor="end">${answer}</text>
  <path d="M26 28 H204 L170 120 H26Z" fill="#fff" opacity=".12"/>
  ${keys.join("")}</svg>`;
}

/** The tape measure: a yellow case at the left and the blade running right across the pin. */
function tapeMeasure({ y, caseX = -30, blade = 56 }) {
  const ticks = [];
  for (let x = caseX + 150; x < 1000; x += 8) {
    const k = Math.round((x - caseX - 150) / 8);
    const th = k % 20 === 0 ? 34 : k % 10 === 0 ? 26 : k % 5 === 0 ? 19 : 12;
    ticks.push(`<line x1="${x}" y1="0" x2="${x}" y2="${th}" stroke="#1d1d20" stroke-width="${k % 10 === 0 ? 2.4 : 1.5}"/>`);
  }
  return `<svg style="${abs(0, y, 1000, 170, "overflow:visible")}" viewBox="0 0 1000 170" aria-hidden="true">
  <defs><linearGradient id="tb${++uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f9e168"/><stop offset=".5" stop-color="#f1d03b"/><stop offset="1" stop-color="#d9b21f"/></linearGradient></defs>
  <g transform="translate(0 52)">
    <rect x="${caseX + 140}" y="0" width="${1000 - caseX - 140}" height="${blade}" fill="#000" opacity=".28" transform="translate(0 12)" style="filter:blur(8px)"/>
    <rect x="${caseX + 140}" y="0" width="${1000 - caseX - 140}" height="${blade}" fill="url(#tb${uid})"/>
    <rect x="${caseX + 140}" y="${blade - 4}" width="${1000 - caseX - 140}" height="4" fill="#000" opacity=".18"/>
    ${ticks.join("")}
  </g>
  <g transform="translate(${caseX} 0)" style="filter:drop-shadow(0 16px 12px rgba(20,20,10,.45))">
    <rect x="0" y="6" width="230" height="150" rx="34" fill="#e9bf1f"/><rect x="0" y="6" width="230" height="150" rx="34" fill="none" stroke="#7a5e00" stroke-opacity=".5" stroke-width="3"/>
    <path d="M0 90 H230 V122 Q230 156 196 156 H34 Q0 156 0 122Z" fill="#26282d"/>
    <rect x="22" y="22" width="150" height="58" rx="14" fill="#f4d54b"/><rect x="22" y="22" width="150" height="20" rx="10" fill="#fff" opacity=".35"/>
    <circle cx="190" cy="46" r="13" fill="#26282d"/><circle cx="190" cy="46" r="7" fill="#7b7f86"/>
    <rect x="198" y="40" width="36" height="42" rx="6" fill="#d4ad14"/>
  </g></svg>`;
}

/** A level lying flat: a long yellow-and-black body with three vials. */
function spiritLevel({ x, y, w, h = 60, rot = 0 }) {
  const id = `sl${++uid}`;
  const vial = (cx, bubble) => `<rect x="${cx - 34}" y="${h / 2 - 12}" width="68" height="24" rx="12" fill="#e6f1d0"/><rect x="${cx - 34}" y="${h / 2 - 12}" width="68" height="24" rx="12" fill="none" stroke="#33363b" stroke-width="3"/><ellipse cx="${cx + bubble}" cy="${h / 2}" rx="11" ry="7" fill="#9fcf6a" stroke="#4d7a2a" stroke-width="1.5"/><line x1="${cx - 15}" y1="${h / 2 - 12}" x2="${cx - 15}" y2="${h / 2 + 12}" stroke="#33363b" stroke-width="2"/><line x1="${cx + 15}" y1="${h / 2 - 12}" x2="${cx + 15}" y2="${h / 2 + 12}" stroke="#33363b" stroke-width="2"/>`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(20,20,10,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset=".55" stop-color="#f1c62f"/><stop offset="1" stop-color="#c79b12"/></linearGradient></defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="url(#${id})"/><rect x="0" y="${h - 9}" width="${w}" height="9" rx="4" fill="#000" opacity=".16"/>
  ${vial(w / 2, 0)}${vial(w * 0.2, 0)}${vial(w * 0.8, 0)}
  ${[0.07, 0.34, 0.66, 0.93].map((f) => `<circle cx="${w * f}" cy="${h / 2}" r="9" fill="#26282d"/><circle cx="${w * f}" cy="${h / 2}" r="4" fill="#9a9ea6"/>`).join("")}</svg>`;
}

/* ------------------------------------------------------------------ #59 */

/** The face of a small-parts cabinet: rows of little steel drawers, each with a pull and an empty label holder. */
function partsCabinet() {
  const cols = 4, rows = 7;
  const dw = 238, dh = 138, gx = 14, gy = 12;
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = 12 + c * (dw + gx), y = 10 + r * (dh + gy);
    out.push(`<rect x="${x}" y="${y}" width="${dw}" height="${dh}" rx="5" fill="url(#dr)"/><rect x="${x}" y="${y}" width="${dw}" height="${dh}" rx="5" fill="none" stroke="#1c2a25" stroke-opacity=".6" stroke-width="2"/>
    <rect x="${x + 50}" y="${y + 20}" width="${dw - 100}" height="46" rx="4" fill="#cdb15f" stroke="#8f6f25" stroke-width="2.5"/><rect x="${x + 58}" y="${y + 26}" width="${dw - 116}" height="34" rx="2" fill="#efe8d2"/>
    <rect x="${x + 70}" y="${y + 86}" width="${dw - 140}" height="14" rx="7" fill="#b9bdc2"/><rect x="${x + 70}" y="${y + 86}" width="${dw - 140}" height="5" rx="3" fill="#fff" opacity=".6"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true">
  <defs><linearGradient id="dr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f8274"/><stop offset="1" stop-color="#456459"/></linearGradient>
  <radialGradient id="cv" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#0b1713" stop-opacity=".05"/><stop offset="1" stop-color="#050b09" stop-opacity=".62"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="#2a3d35"/>${out.join("")}<rect width="1000" height="${SCENE_H}" fill="url(#cv)"/></svg>`;
}

function drawer({ x, y, w, title, rows, labels, hot = -1 }) {
  const cells = rows.map((t, k) => `<div class="cl"><small>${esc(labels[k])}</small><b>${k === hot ? hl(t) : esc(t)}</b></div>`).join("");
  return `<div style="${abs(x, y, w, 690)}">
    <div style="${abs(0, 0, w, 132, "border-radius:10px 10px 4px 4px;background:linear-gradient(#a9c4b8,#7fa194);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 10px 18px rgba(0,0,0,.45)")}"></div>
    ${brass({ x: 36, y: 26, w: w - 72, h: 80, html: `<span style="font:600 38px/1 'Newsreader',Georgia,serif">${esc(title)}</span>` })}
    <div style="${abs(8, 124, w - 16, 566, "background:linear-gradient(#17221d,#22332c);border-radius:0 0 14px 14px;box-shadow:0 22px 34px rgba(0,0,0,.55),inset 0 12px 16px rgba(0,0,0,.5)")}"></div>
    <div style="${abs(26, 150, w - 52, 520, `background:#fbf8ee;border-radius:3px;${SHADOW};padding:6px 26px 4px`)}">${cells}</div></div>`;
}

function pin59() {
  const labels = ["Cost", "Date", "Size", "When it is used"];
  const i = idea(59);
  // items run in pairs: sinking fund then emergency fund, row by row
  const left = [i.items[0], i.items[2], i.items[4], i.items[6]];
  const right = [i.items[1], i.items[3], i.items[5], i.items[7]];
  const css = `.cl{height:128px;border-bottom:2px solid #c9d6cd;display:flex;flex-direction:column;justify-content:center;gap:5px}
  .cl:last-child{border-bottom:0}
  .cl small{font:600 22px/1 "Plex",sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#17473a}
  .cl b{font:600 29px/1.12 "Plex",sans-serif;color:#1d1d20}`;
  const scene = `
  ${partsCabinet()}
  ${drawer({ x: 24, y: 404, w: 456, title: "Sinking fund", rows: left, labels })}
  ${drawer({ x: 520, y: 404, w: 456, title: "Emergency fund", rows: right, labels, hot: 1 })}
  <div style="${abs(236, 1150, 520, 110, `transform:rotate(-2.5deg);background:#f7d98a;${SHADOW};padding:10px 26px;display:flex;align-items:center;justify-content:center;text-align:center`)}"><div style="font:700 62px/1 'Hand',cursive;color:#2a2a2a;white-space:nowrap">Keep the two apart</div></div>
  <div style="${abs(274, 1138, 110, 36, "transform:rotate(-5deg);background:repeating-linear-gradient(115deg,#2f6b57 0 14px,#2f6b57cc 14px 28px);opacity:.9;box-shadow:0 2px 4px rgba(0,0,0,.3)")}"></div>
  ${carpenter({ x: 740, y: 1262, len: 240, rot: -8 })}
  `;
  return printable({ n: 59, scene, paper: "#e5ece7", extraCss: css + ".top h1{font-size:68px}" });
}

/* ------------------------------------------------------------------ #61 */

function plywood(seed = 5) {
  const r = lcg(seed);
  const out = [];
  for (let k = 0; k < 90; k++) {
    const y = r() * SCENE_H, amp = 10 + r() * 26, x0 = -20 - r() * 100;
    out.push(`<path d="M${x0} ${y} C ${250 + r() * 100} ${y - amp}, ${600 + r() * 150} ${y + amp}, 1040 ${y + (r() - 0.5) * 30}" fill="none" stroke="#a8803f" stroke-opacity="${(0.1 + r() * 0.18).toFixed(2)}" stroke-width="${(0.8 + r() * 2).toFixed(1)}"/>`);
  }
  for (let k = 0; k < 5; k++) {
    const cx = 120 + r() * 760, cy = 80 + r() * (SCENE_H - 160);
    for (let q = 1; q < 5; q++) out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${q * 46 + r() * 20}" ry="${q * 9 + r() * 4}" fill="none" stroke="#a8803f" stroke-opacity=".2" stroke-width="1.6"/>`);
  }
  return `<svg style="${abs(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs><radialGradient id="pw" cx=".25" cy=".05" r="1.1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#3a2a10" stop-opacity=".3"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="#e8d3a2"/>${out.join("")}
  <rect x="0" y="${SCENE_H * 0.5}" width="1000" height="3" fill="#7d5a30" opacity=".3"/><rect width="1000" height="${SCENE_H}" fill="url(#pw)"/></svg>`;
}

function pin61() {
  const i = idea(61);
  const costs = i.items.slice(0, 5);
  const monthly = ["$90.00", "$10.00", "$37.50", "$8.00", "$30.00"]; // the guide's own table
  const slips = costs.map((t, k) => {
    const rot = [-3.5, 2, -1.5, 3.2, -2.4][k];
    const x = [34, 62, 24, 70, 40][k];
    return `<div class="slip" style="left:${x}px;top:${398 + k * 64}px;transform:rotate(${rot}deg);z-index:${k + 2}">${esc(t)}</div>`;
  }).join("");
  const rows = costs.map((t, k) => `<div class="rw"><span>${esc(t)}</span><em>${monthly[k]}</em></div>`).join("");
  const css = `
  .slip{position:absolute;width:520px;height:58px;padding:0 20px;background:#fffdf6;display:flex;align-items:center;font:600 25px "Plex",sans-serif;color:#1d1d20;white-space:nowrap;box-shadow:0 1px 2px rgba(20,20,10,.3),0 8px 14px rgba(20,20,10,.28);border-bottom:2px dashed #cfc6b0}
  .card{position:absolute;left:566px;top:432px;width:400px;height:250px;border-radius:24px;transform:rotate(5deg);background:linear-gradient(135deg,#2f6b57,#0f2f27);box-shadow:0 4px 6px rgba(20,20,10,.35),0 26px 40px rgba(20,20,10,.45);color:#fff;z-index:1}
  .card .chip{position:absolute;right:34px;top:30px;width:58px;height:44px;border-radius:9px;background:linear-gradient(135deg,#f0d98f,#c29b43)}
  .card .big{position:absolute;left:150px;top:112px;font:600 66px/1 "Newsreader",Georgia,serif;letter-spacing:-.01em;white-space:nowrap}
  .card .yr{position:absolute;left:152px;top:190px;font:500 34px/1 "Plex",sans-serif;opacity:.92}
  .card .stripe{position:absolute;left:0;right:0;top:0;height:0}
  .tbl{position:absolute;left:48px;top:872px;width:760px;background:#fffdf7;border-radius:4px;${SHADOW};padding:0 26px 18px;transform:rotate(-1.2deg)}
  .tbl .hd{height:52px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #17473a;font:600 22px "Plex",sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#17473a}
  .rw{height:54px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #c9d6cd}
  .rw span{font:600 26px "Plex",sans-serif}.rw em{font:500 27px "Plex Mono",monospace;font-style:normal}
  .tot{height:100px;display:flex;align-items:center;justify-content:space-between;color:#17473a}
  .tot>span{font:600 26px "Plex",sans-serif}.tot div{display:flex;align-items:baseline;gap:14px}
  .tot strong{font:600 76px/1 "Newsreader",Georgia,serif}.tot small{font:600 28px "Plex",sans-serif;color:#1d1d20}`;
  const total = `<div class="tot"><span>All five together</span><div><strong>${hl(i.items[5])}</strong><small>a month</small></div></div>`;
  const scene = `
  ${plywood()}
  <div class="card"><div class="chip"></div><div class="big">${esc(i.items[6].split(" ")[0])}</div><div class="yr">${esc(i.items[6].split(" ").slice(1).join(" "))}</div></div>
  ${slips}
  <div style="${abs(740, 690, 0, 0, "z-index:3")}">${exTag("position:absolute;left:0;top:0;background:#fffdf7")}</div>
  ${tapeMeasure({ y: 752 })}
  <div class="tbl"><div class="hd"><span>Cost</span><span>Monthly amount</span></div>${rows}${total}</div>
  ${carpenter({ x: 770, y: 1110, len: 300, rot: -74, body: "#d9962b" })}`;
  return printable({ n: 61, scene, paper: "#f2e9d4", extraCss: css + ".top h1{font-size:62px}" });
}

/* ------------------------------------------------------------------ #63 */

function paintChipWall(seed = 17) {
  const r = lcg(seed);
  const fams = [[158, 28], [150, 22], [95, 30], [36, 45], [18, 52], [200, 20], [48, 55], [160, 14], [340, 22], [70, 25], [28, 30], [170, 35]];
  const strips = [];
  const cols = 9, rows = 3;
  const cw = 118, ch = 330, gx = 4, gy = 10;
  for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
    const [hue, sat] = fams[Math.floor(r() * fams.length)];
    const x = -20 + c * (cw + gx) + (rr % 2) * 40, y = -30 + rr * (ch + gy) + (c % 2) * 12;
    const steps = 5;
    const sw = Array.from({ length: steps }, (_, s) => `<div style="height:${(ch - 40) / steps}px;background:hsl(${hue + s * 2} ${sat}% ${88 - s * 9}%)"></div>`).join("");
    strips.push(`<div style="${abs(x, y, cw, ch, `background:#fbfaf6;border-radius:3px;padding:30px 8px 10px;box-shadow:0 1px 2px rgba(20,20,10,.25),0 6px 10px rgba(20,20,10,.2);transform:rotate(${((r() - 0.5) * 2.2).toFixed(2)}deg)`)}"><i style="position:absolute;left:50%;top:9px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:#cfc8b6;box-shadow:inset 0 2px 3px rgba(0,0,0,.35)"></i>${sw}</div>`);
  }
  return `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "overflow:hidden;background:#d9d4c4")}">${strips.join("")}<div style="${abs(0, 0, 1000, SCENE_H, "background:radial-gradient(ellipse at 30% 40%,rgba(20,30,25,.05),rgba(20,30,25,.5))")}"></div></div>`;
}

function pin63() {
  const i = idea(63);
  const [need, have, months, ans] = i.items;
  const css = `
  .ws{position:absolute;left:40px;top:406px;width:700px;background:#fffdf7;border-radius:5px;transform:rotate(-1.4deg);${SHADOW};overflow:visible}
  .ws .hd{height:78px;background:#17473a;color:#fff;border-radius:5px 5px 0 0;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
  .ws .hd .example{background:#fff;color:#17473a;border-color:#17473a}
  .ws .ln{position:relative;height:146px;display:flex;align-items:center;padding:0 24px 0 96px;border-bottom:2px solid #b9cdc0;font:600 46px/1.05 "Newsreader",Georgia,serif;color:#1d1d20}
  .ws .ln i{position:absolute;left:26px;top:50%;margin-top:-26px;width:52px;height:52px;border-radius:50%;border:3px solid #17473a;color:#17473a;font:600 38px/46px "Plex",sans-serif;font-style:normal;text-align:center}
  .ws .ln.sum{height:206px;border-bottom:0;font-size:84px;color:#17473a}
  .ws .ln.sum small{font:600 40px "Plex",sans-serif;margin-left:14px;color:#1d1d20}
  .leaf{position:absolute;left:772px;top:420px;width:190px;height:150px;background:#fffdf7;border-radius:8px;transform:rotate(5deg);${SHADOW}}
  .leaf .band{height:78px;background:#9a2f22;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#fff;font:600 38px "Newsreader",Georgia,serif}
  .leaf .ring{position:absolute;top:-12px;width:18px;height:34px;border-radius:9px;background:linear-gradient(#e6e8eb,#8f949b);box-shadow:0 3px 5px rgba(0,0,0,.35)}`;
  const scene = `
  ${paintChipWall()}
  <div class="ws"><div class="hd"><span style="font:600 25px 'Plex',sans-serif;letter-spacing:.12em;text-transform:uppercase">${esc(i.headline.split(": ")[0].replace(/ by Hand$/i, ""))}</span>${exTag()}</div>
    <div class="ln"><i></i>${esc(need)}</div>
    <div class="ln"><i>−</i>${esc(have)}</div>
    <div class="ln"><i>÷</i>${esc(months)}</div>
    <div class="ln sum"><i>=</i><span>${hl(ans.replace(" a month", ""), "rgba(246,184,52,.8)")}<small>a month</small></span></div></div>
  <div class="leaf"><div class="ring" style="left:36px"></div><div class="ring" style="left:150px"></div><div class="band">December</div></div>
  ${calculator({ x: 760, y: 626, w: 214, rot: 4, answer: ans.replace(" a month", "").replace("$", "") })}
  ${carpenter({ x: 120, y: 1226, len: 460, rot: -3 })}
  `;
  return printable({ n: 63, scene, paper: "#e9e6d8", extraCss: css });
}

/* ------------------------------------------------------------------ #71 */

function sandSheet({ x, y, w, h, rot, base, seed, dark = 0.55, light = 0.35 }) {
  const id = `sf${++uid}`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${base};overflow:hidden;box-shadow:0 2px 3px rgba(20,20,10,.4),0 20px 34px rgba(20,20,10,.5)`)}"><svg width="${w}" height="${h}" style="position:absolute;inset:0" aria-hidden="true"><defs>
  <filter id="${id}d" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.07  0 0 0 0 0.04  3.2 0 0 0 -1.35"/></filter>
  <filter id="${id}l" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="${seed + 9}"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.9  0 3.2 0 0 -1.5"/></filter></defs>
  <rect width="${w}" height="${h}" filter="url(#${id}d)" opacity="${dark}"/><rect width="${w}" height="${h}" filter="url(#${id}l)" opacity="${light}"/></svg></div>`;
}

function handset({ x, y, w = 330, rot = 0 }) {
  return `<svg style="${abs(x, y, w, w * 0.62, `transform:rotate(${rot}deg)`)}" viewBox="0 0 330 205" fill="none" stroke="#f6f3ea" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M30 150 C 30 60, 100 30, 165 30 C 230 30, 300 60, 300 150"/>
  <path d="M10 140 L 62 128 Q 78 126 80 142 L 84 188 Q 85 200 72 202 L 36 204 Q 20 204 16 190 Z"/>
  <path d="M320 140 L 268 128 Q 252 126 250 142 L 246 188 Q 245 200 258 202 L 294 204 Q 310 204 314 190 Z"/>
  <path d="M130 100 Q 165 82 200 100" stroke-width="6" opacity=".7"/><path d="M110 76 Q 165 44 220 76" stroke-width="6" opacity=".5"/></svg>`;
}

function pin71() {
  const i = idea(71);
  const script = i.items[0];
  const [pre, post] = script.split("$85");
  const tip = i.items[1];
  const css = `
  .div{position:absolute;left:66px;top:566px;width:850px;height:640px;background:linear-gradient(#d9b87d,#c9a468);border-radius:6px;transform:rotate(-3deg);${SHADOW}}
  .div .tab{position:absolute;right:46px;top:-52px;width:230px;height:62px;background:#2f6b57;border-radius:10px 10px 0 0;box-shadow:0 -2px 6px rgba(0,0,0,.25);transform:none}
  .note{position:absolute;left:98px;top:606px;width:800px;padding:96px 58px 54px;background:#f8e08c;transform:rotate(1.4deg);${SHADOW};font:500 52px/1.2 "Newsreader",Georgia,serif;color:#1d1d20;letter-spacing:-.005em}
  .note::before{content:"\\201C";position:absolute;left:44px;top:14px;font:600 150px/1 "Newsreader",Georgia,serif;color:#a85d0a;opacity:.55}
  .tip{position:absolute;left:150px;top:1196px;width:700px;padding:26px 36px 26px 86px;background:#f2e7cf;border-radius:8px 30px 30px 8px;transform:rotate(-1.4deg);${SHADOW};font:600 28px/1.25 "Plex",sans-serif;color:#2a2a2a}
  .tip i{position:absolute;left:30px;top:50%;margin-top:-16px;width:32px;height:32px;border-radius:50%;background:#7e7767;box-shadow:inset 0 3px 5px rgba(0,0,0,.5)}`;
  const billLines = Array.from({ length: 7 }, (_, k) => `<div style="${abs(34, 120 + k * 46, 240 - (k % 3) * 40, 12, "background:#c9cdd1;border-radius:6px")}"></div><div style="${abs(290, 120 + k * 46, 66, 12, "background:#c9cdd1;border-radius:6px")}"></div>`).join("");
  const scene = `
  <div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:#2b2926")}"></div>
  ${sandSheet({ x: -80, y: 380, w: 620, h: 560, rot: -7, base: "#c9a56b", seed: 3 })}
  ${sandSheet({ x: 440, y: 400, w: 640, h: 600, rot: 6, base: "#3d3f43", seed: 11, dark: 0.5, light: 0.55 })}
  ${sandSheet({ x: -60, y: 900, w: 700, h: 520, rot: 4, base: "#8f9d8b", seed: 21 })}
  ${sandSheet({ x: 560, y: 960, w: 520, h: 460, rot: -5, base: "#d0b88a", seed: 33 })}
  <div style="${abs(640, 400, 390, 350, `background:#fdfdfb;transform:rotate(8deg);${SHADOW}`)}">${billLines}<div style="${abs(34, 40, 150, 22, "background:#2f6b57;border-radius:4px")}"></div></div>
  ${handset({ x: 40, y: 392, w: 340, rot: -8 })}
  <div class="div"><div class="tab"></div></div>
  <div class="note">${esc(pre)}${hl("$85", "rgba(232,128,36,.78)")}${esc(post)}</div>
  <div style="${abs(0, 0, 0, 0)}"></div>
  <div style="position:absolute;left:672px;top:638px;z-index:3">${exTag("background:#f8e08c;color:#6b5420")}</div>
  <div style="position:absolute;left:280px;top:560px;z-index:4">${(await_binderClip())}</div>
  <div class="tip"><i></i>${esc(tip)}</div>`;
  return printable({ n: 71, scene, paper: "#efe6d4", extraCss: css + ".top h1{font-size:76px}" });
}

function await_binderClip() {
  return `<svg style="width:140px;height:112px;transform:rotate(-4deg);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))" viewBox="0 0 100 80" aria-hidden="true"><path d="M26 34 C 20 6, 80 6, 74 34" fill="none" stroke="#b9bcc2" stroke-width="5" stroke-linecap="round"/><path d="M8 80 L14 30 Q 50 22 86 30 L92 80 Z" fill="#26282d"/><path d="M14 30 Q 50 22 86 30 L88 40 Q 50 32 12 40 Z" fill="#40434a"/></svg>`;
}

/* ------------------------------------------------------------------ #73 */

/**
 * A clear mixing pail (slightly wider at the top) with paint to `fill` (0-1 of its height)
 * and a dashed rule line at `rule`. Paint above the rule is `over`-coloured; `spill` drips it over the rim.
 */
function pail({ x, y, w = 190, h = 200, fill, rule, color, over = "#e8801f", spill = false }) {
  const id = `pl${++uid}`;
  const bw = w * 0.82, inset = (w - bw) / 2;
  const body = `M2 8 H${w - 2} L${w - inset} ${h - 4} Q${w - inset} ${h} ${w - inset - 8} ${h} H${inset + 8} Q${inset} ${h} ${inset} ${h - 4} Z`;
  const yFill = h - fill * h, yRule = h - rule * h;
  const paint = fill > rule
    ? `<rect x="0" y="${yFill}" width="${w}" height="${yRule - yFill}" fill="${over}"/><rect x="0" y="${yRule}" width="${w}" height="${h - yRule}" fill="${color}"/>`
    : `<rect x="0" y="${yFill}" width="${w}" height="${h - yFill}" fill="${color}"/>`;
  const drips = spill ? `
    <path d="M-4 8 C -2 30 -14 44 -10 74 C -8 90 6 90 8 74 C 10 54 4 36 14 8Z" fill="${over}"/>
    <path d="M${w * 0.36} 8 C ${w * 0.36} 52 ${w * 0.3} 66 ${w * 0.33} 112 C ${w * 0.35} 126 ${w * 0.43} 126 ${w * 0.44} 112 C ${w * 0.46} 70 ${w * 0.5} 40 ${w * 0.52} 8Z" fill="${over}"/>
    <path d="M${w - 18} 8 C ${w - 14} 36 ${w - 4} 50 ${w} 86 C ${w + 2} 100 ${w + 14} 100 ${w + 16} 84 C ${w + 18} 50 ${w + 8} 30 ${w - 4} 8Z" fill="${over}"/>
    <path d="M-6 6 Q ${w / 2} -26 ${w + 6} 6 Q ${w * 0.7} 18 ${w * 0.5} 12 Q ${w * 0.3} 20 -6 6Z" fill="${over}"/>
    <path d="M${w * 0.1} -2 Q ${w * 0.3} -10 ${w * 0.45} -4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>` : "";
  const ticks = [0.2, 0.4, 0.6, 0.8].map((f) => `<line x1="${w - inset - (1 - f) * inset * 0 - 4}" y1="${h - f * h}" x2="${w - inset - 26}" y2="${h - f * h}" stroke="#335" stroke-opacity=".5" stroke-width="2.5"/>`).join("");
  return `<svg style="${abs(x - 24, y - 40, w + 48, h + 150, "overflow:visible;filter:drop-shadow(0 14px 10px rgba(0,0,0,.45))")}" viewBox="-24 -40 ${w + 48} ${h + 150}" aria-hidden="true">
  <defs><clipPath id="${id}"><path d="${body}"/></clipPath><linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#e9f2f7" stop-opacity=".18"/><stop offset=".8" stop-color="#cfdde6" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient></defs>
  <path d="${body}" fill="#dce8ee" fill-opacity=".5"/>
  <g clip-path="url(#${id})">${paint}<rect x="0" y="${yFill}" width="${w}" height="9" fill="#fff" opacity=".3"/><line x1="0" y1="${yRule}" x2="${w}" y2="${yRule}" stroke="#1d1d20" stroke-width="3.5" stroke-dasharray="14 9"/></g>
  <path d="${body}" fill="url(#${id}g)" stroke="#7d93a0" stroke-width="3"/>
  <path d="M12 12 L ${inset + 10} ${h - 20}" stroke="#fff" stroke-opacity=".75" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="${w / 2}" cy="8" rx="${w / 2 - 1}" ry="9" fill="none" stroke="#7d93a0" stroke-width="3.5"/>
  ${ticks}${drips}</svg>`;
}

function shelfPanel({ y0, title, pails, plates, tags = "" }) {
  const xs = [96, 402, 708];
  const pailHtml = pails.map((p, k) => pail({ x: xs[k], y: y0 + 78, ...p })).join("");
  const plateHtml = plates.map((html, k) => brass({ x: xs[k] - 38, y: y0 + 322, w: 290, h: 96, html })).join("");
  return `
  <div style="${abs(56, y0 + 12, 400, 66, "display:flex;align-items:center;gap:14px")}"><span style="font:600 56px/1 'Newsreader',Georgia,serif;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.4);white-space:nowrap">${esc(title)}</span></div>
  <div style="${abs(0, y0 + 274, 1000, 36, "background:linear-gradient(#d8b27c,#b98d55);box-shadow:0 10px 16px rgba(0,0,0,.45),inset 0 3px 0 rgba(255,255,255,.35)")}"></div>
  <div style="${abs(0, y0 + 308, 1000, 110, "background:linear-gradient(#a97c47,#8c6535)")}"></div>
  ${pailHtml}${plateHtml}${tags}`;
}

function pin73() {
  const i = idea(73);
  const bg = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(#3f586a,#2c4150)")}"></div>
  <div style="${abs(0, SCENE_TOP, 22, SCENE_H, "background:repeating-linear-gradient(#26343e 0 38px,#1c2830 38px 50px)")}"></div><div style="${abs(978, SCENE_TOP, 22, SCENE_H, "background:repeating-linear-gradient(#26343e 0 38px,#1c2830 38px 50px)")}"></div>`;
  const nm = (name, val, vs = 31) => `<span style="font:600 22px/1 'Plex',sans-serif;white-space:nowrap">${esc(name)}</span>${val ? `<span style="font:600 ${vs}px/1.05 'Newsreader',Georgia,serif;margin-top:6px;white-space:nowrap">${esc(val)}</span>` : ""}`;
  const tagCss = (extra) => `${extra};background:#f7d98a;${SHADOW};padding:10px 16px;font:600 25px/1.1 'Plex',sans-serif;color:#2a2a2a`;
  const top = shelfPanel({
    y0: 380, title: "$3,500 Month",
    pails: [
      { fill: 0.8, rule: 0.8, color: "#1f5a49" },
      { fill: 0.48, rule: 0.48, color: "#6fae98" },
      { fill: 0.32, rule: 0.32, color: "#b9dccf" },
    ],
    plates: [nm("Needs", i.items[0]), nm("Wants", "$1,050"), nm("Savings and extra debt", "$700")],
  });
  const bottom = shelfPanel({
    y0: 900, title: "$2,400 Month",
    pails: [
      { fill: 1.0, rule: 0.55, color: "#1f5a49", spill: true },
      { fill: 0.1, rule: 0.33, color: "#6fae98" },
      { fill: 0.07, rule: 0.22, color: "#b9dccf" },
    ],
    plates: [nm("Needs", "$2,075, or 86 percent", 26), nm("Wants", ""), nm("Savings and extra debt", "")],
    tags: `<div style="${abs(246, 1096, 200, 74, tagCss("transform:rotate(5deg);z-index:3;display:flex;flex-direction:column;justify-content:center"))}"><b>Rent</b><span>$1,300, 54%</span></div>
    <div style="${abs(500, 1040, 410, 64, tagCss("transform:rotate(-2deg);z-index:3;display:flex;align-items:center;justify-content:center;font-size:27px;text-align:center"))}">$325 for everything else</div>`,
  });
  const scene = `${bg}${top}${bottom}
  ${spiritLevel({ x: 70, y: 810, w: 860, h: 58, rot: 0 })}
  <div style="${abs(0, 862, 1000, 18, "background:linear-gradient(#d8b27c,#b98d55);box-shadow:0 8px 12px rgba(0,0,0,.4)")}"></div>
  <div style="position:absolute;left:466px;top:404px">${exTag("background:#fff")}</div>
  <div style="position:absolute;left:466px;top:924px">${exTag("background:#fff")}</div>`;
  return printable({ n: 73, scene, paper: "#e6ebee" });
}

export const pins = [pin59(), pin61(), pin63(), pin71(), pin73()];
