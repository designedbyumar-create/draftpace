/**
 * Batch 1, builder E: the calendar, year-end and holiday world.
 *   101 a charcoal December desk by candlelight: an open three-ring binder, seven numbered tabs, the five-line checklist, two ticks in pencil
 *   100 kraft paper and wrapping paper: a glass jar labelled Holiday gifts, $450, a December gift tag, the sum card with its Example tag
 *   66  a sage wall: a twelve-month year planner with the same day ringed in every month, five step strips, a closed binder on a shelf
 *   58  a snowy window: a wooden ten-minute ruler down the frame, five cards taped to the glass, Minute 7 ringed in the pop colour
 *   4   a peach wall: three clotheslines of index cards, five checklist cards, two ticked in pencil, a sticky note and a mug on a shelf
 * Every word is the idea bank's own (headline, sub, items) or the guide's own label for what is drawn
 * (the binder's seven section names, the Confirmed and Stale labels, month abbreviations on a calendar).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { desk, pencil, mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SHADOW = "drop-shadow(0 2px 2px rgba(20,10,5,.25)) drop-shadow(0 12px 14px rgba(20,10,5,.30))";
const split = (t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; };
const POP = "#e2624a";

/** A pencil tick (or the first stroke of one when `half`). */
function tick({ size = 64, color = "#2f343b", sw = 6, half = false, x = 0, y = 0 }) {
  const d = half ? "M10 40 l14 16 l9 -12" : "M10 40 l15 17 l34 -44";
  return `<svg style="${abs(x, y, size, size, "overflow:visible")}" viewBox="0 0 70 70" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** An empty tick box with an optional tick. */
function box({ size = 40, ticked = false, half = false, tickColor = "#2f343b", edge = "#2a3350", dash = false }) {
  return `<div style="flex:none;position:relative;width:${size}px;height:${size}px;border:4px ${dash ? "dashed" : "solid"} ${edge};border-radius:8px;background:rgba(255,255,255,.55)">${ticked || half ? tick({ size: size * 1.2, color: tickColor, half, sw: half ? 7 : 6, x: -size * 0.12, y: -size * 0.3 }) : ""}</div>`;
}

/** A slim ballpoint pen. */
function pen({ x, y, len = 340, rot = 0, body = "#1f3d36" }) {
  return `<svg style="${abs(x, y, len, 26, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(0,0,0,.4))`)}" viewBox="0 0 ${len} 26" aria-hidden="true">
    <rect x="30" y="5" width="${len - 58}" height="16" rx="8" fill="${body}"/><rect x="30" y="7" width="${len - 58}" height="4" rx="2" fill="#fff" opacity=".22"/>
    <rect x="${len - 112}" y="5" width="14" height="16" fill="#d9b24c"/><path d="M30 5 L2 13 L30 21 Z" fill="#c9ccd2"/><path d="M10 11 L2 13 L10 15 Z" fill="#33363b"/>
    <rect x="${len - 30}" y="9" width="22" height="8" rx="3" fill="#d9b24c"/></svg>`;
}

/* ------------------------------------------------------------------ #101 */

function pin101() {
  const i = idea(101);
  const wood = desk({ top: SCENE_TOP, height: 1128, base: "#3d424b", dark: "#2c3037", planks: 5, seed: 7 });
  const glow = `<div style="${abs(0, SCENE_TOP, 1000, 1128, "background:radial-gradient(circle at 13% 94%,rgba(255,186,92,.55),rgba(255,160,70,.18) 30%,transparent 58%);z-index:1")}"></div>`;

  const tabs = ["01 Accounts", "02 Income", "03 Bills", "04 Subscriptions", "05 Debt", "06 Savings goals", "07 A written summary"];
  const tints = ["#f0d58a", "#e9a9b4", "#b8d4c0", "#b7cfe3", "#cdbfe0", "#efb98a", "#d8dfc2"];
  const tabHtml = tabs.map((t, k) => {
    const [num, ...rest] = t.split(" ");
    return `<div style="${abs(722, 22 + k * 108, 254, 84, `background:${tints[k]};border-radius:6px 16px 16px 6px;box-shadow:0 5px 9px rgba(0,0,0,.4);display:flex;align-items:center;padding:0 10px 0 48px;gap:8px;z-index:1`)}">
      <span class="mono" style="font-weight:600;font-size:22px;color:#1d1d20">${num}</span><span data-check="tab-${k}" style="font-weight:600;font-size:22px;line-height:26px;color:#1d1d20;flex:1;min-width:0">${esc(rest.join(" "))}</span></div>`;
  }).join("");

  const chip = (label, kind) => `<span style="display:inline-block;font:600 22px 'Plex';padding:4px 14px;border-radius:999px;${kind === "ok" ? `background:#d3e6dc;color:${C.forestDeep}` : "background:#f6dfae;color:#6a4309"}">${esc(label)}</span>`;
  const bar = (w, c = "#d9d3c2") => `<div style="width:${w}px;height:16px;border-radius:8px;background:${c}"></div>`;
  const rows = [["Confirmed", "ok", 130, 60], ["Confirmed", "ok", 104, 72], ["Stale", "stale", 140, 52], ["Confirmed", "ok", 116, 64], ["Stale", "stale", 96, 76]].map(([lab, kind, a, b]) => `
    <div style="padding:14px 0 16px;border-bottom:2px solid #e3dccb"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">${bar(a, "#cfc8b4")}${bar(b, "#d9d3c2")}</div>
    <div style="display:flex;justify-content:space-between;align-items:center">${chip(lab, kind)}${bar(66, "#e1dbc9")}</div></div>`).join("");

  const items = i.items.map((t, k) => `<div style="display:flex;gap:16px;align-items:flex-start">${box({ size: 34, ticked: k < 2, edge: "#3a3f46" })}<div data-check="step-${k}" style="font-size:27px;line-height:1.2;font-weight:500;color:#26211c;padding-top:0;width:286px">${esc(t)}</div></div>`).join("");

  const ringAt = (y) => `<svg style="${abs(274, y, 88, 70, "z-index:4;filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))")}" viewBox="0 0 120 70" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f7"/><stop offset=".5" stop-color="#aeb2b9"/><stop offset="1" stop-color="#e0e2e6"/></linearGradient></defs>
    <rect x="46" y="28" width="28" height="30" rx="6" fill="#8d9097"/><path d="M12 38 C 12 4, 108 4, 108 38" fill="none" stroke="url(#rg)" stroke-width="11" stroke-linecap="round"/></svg>`;

  const binder = `<div style="${abs(14, 392, 966, 804, "transform:rotate(-1.1deg);transform-origin:50% 50%;z-index:3")}">
    ${tabHtml}
    <div style="${abs(0, 0, 756, 804, `background:linear-gradient(150deg,${C.forest},${C.forestDeep});border-radius:22px;box-shadow:0 4px 7px rgba(0,0,0,.45),0 30px 50px rgba(0,0,0,.55);z-index:2`)}"></div>
    <div style="${abs(0, 0, 756, 804, "border-radius:22px;background:linear-gradient(90deg,rgba(255,255,255,.12),transparent 14%);z-index:2")}"></div>
    <div style="${abs(12, 22, 732, 764, "background:#d8d1bf;border-radius:8px;z-index:2")}"></div>
    <div style="${abs(18, 14, 300, 772, "background:linear-gradient(90deg,#fffdf7 82%,#e7e0cd);border-radius:8px 0 0 8px;z-index:2;overflow:hidden")}">
      <div style="${abs(0, 0, 300, 772, "background:repeating-linear-gradient(180deg,transparent 0 44px,rgba(120,150,170,.16) 44px 46px)")}"></div>
      <div style="${abs(26, 28, 232, 60, "display:flex;align-items:flex-end;gap:12px")}"><div class="serif" style="font-size:46px;font-weight:500;line-height:1">Accounts</div></div>
      <div style="${abs(26, 94, 232, 4, `background:${C.forest}`)}"></div>
      <div style="${abs(26, 112, 232, 640)}">${rows}</div>
    </div>
    <div style="${abs(318, 14, 420, 772, "background:linear-gradient(270deg,#fffdf7 82%,#e7e0cd);border-radius:0 8px 8px 0;z-index:2;overflow:hidden")}">
      <div style="${abs(0, 0, 420, 772, "background:repeating-linear-gradient(180deg,transparent 0 44px,rgba(120,150,170,.16) 44px 46px)")}"></div>
      <div style="${abs(58, 28, 340, 60, "display:flex;align-items:flex-end")}"><div class="serif" style="font-size:40px;white-space:nowrap;font-weight:500;line-height:1">Keeping it current</div></div>
      <div style="${abs(58, 94, 340, 4, `background:${C.forest}`)}"></div>
      <div style="${abs(58, 120, 340, 640, "display:flex;flex-direction:column;gap:20px")}">${items}</div>
    </div>
    <div style="${abs(306, 14, 24, 772, "background:linear-gradient(90deg,rgba(0,0,0,0),rgba(0,0,0,.2),rgba(0,0,0,0));z-index:3")}"></div>
    ${[96, 376, 656].map((y) => `<div style="${abs(278, y + 24, 20, 20, "border-radius:50%;background:#26292f;opacity:.55;z-index:3")}"></div><div style="${abs(340, y + 24, 20, 20, "border-radius:50%;background:#26292f;opacity:.55;z-index:3")}"></div>${ringAt(y)}`).join("")}
  </div>`;

  const candle = `<div style="${abs(34, 1130, 160, 214, "z-index:4")}">
    <div style="${abs(-70, -80, 300, 300, "background:radial-gradient(circle,rgba(255,200,110,.5),rgba(255,170,80,.18) 36%,transparent 66%)")}"></div>
    <svg style="${abs(0, 0, 160, 214, "filter:drop-shadow(0 10px 8px rgba(0,0,0,.5))")}" viewBox="0 0 160 214" aria-hidden="true"><defs><linearGradient id="cw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dfc9"/><stop offset=".45" stop-color="#fbf6e8"/><stop offset="1" stop-color="#cfc3a8"/></linearGradient><linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d77a"/><stop offset="1" stop-color="#9a7418"/></linearGradient></defs>
      <ellipse cx="80" cy="190" rx="70" ry="18" fill="url(#br)"/><ellipse cx="80" cy="184" rx="60" ry="13" fill="#e6c76a"/>
      <rect x="40" y="84" width="80" height="104" rx="6" fill="url(#cw)"/><ellipse cx="80" cy="84" rx="40" ry="9" fill="#f7f1df"/><path d="M52 90 q8 24 -2 40" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
      <path d="M80 82 v-12" stroke="#3b2e22" stroke-width="3"/><path d="M80 24 C 94 44 96 60 80 72 C 64 60 66 44 80 24 Z" fill="#ffb347"/><path d="M80 44 C 87 54 87 62 80 68 C 73 62 74 54 80 44 Z" fill="#fff1b0"/></svg></div>`;

  const scene = `${wood}${glow}${binder}${candle}${pen({ x: 296, y: 1262, len: 360, rot: -3.5 })}${mug({ x: 700, y: 1200, size: 144, color: "#f3ede4", drink: "#6b4226" })}`;
  return printable({ n: 101, paper: "#ece7de", scene });
}

/* ------------------------------------------------------------------ #100 */

function pin100() {
  const i = idea(100);
  const r = seeded(41);
  // Kraft paper with fibres, then a sheet of cream wrapping paper with forest sprigs laid on it.
  const fibres = Array.from({ length: 220 }, () => `<path d="M${(r() * 1000).toFixed(0)} ${(380 + r() * 980).toFixed(0)} l${(20 + r() * 70).toFixed(0)} ${((r() - 0.5) * 12).toFixed(0)}" stroke="#7a5a30" stroke-opacity="${(0.06 + r() * 0.1).toFixed(2)}" stroke-width="${(1 + r()).toFixed(1)}"/>`).join("");
  const kraft = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><radialGradient id="kg" cx="30%" cy="25%" r="95%"><stop offset="0" stop-color="#d7b283"/><stop offset="1" stop-color="#b48d5c"/></radialGradient></defs><rect width="1000" height="1500" fill="url(#kg)"/>${fibres}</svg>`;
  const leafs = [];
  for (let gy = 0; gy < 15; gy++) for (let gx = 0; gx < 10; gx++) {
    const cx = gx * 100 + (gy % 2 ? 50 : 8), cy = gy * 56 + 12;
    leafs.push(`<g transform="translate(${cx} ${cy}) rotate(${(r() * 60 - 30).toFixed(0)})" fill="${C.forest}" opacity=".24"><path d="M0 0 C 10 -14 24 -14 30 0 C 22 12 8 12 0 0 Z"/><circle cx="-8" cy="10" r="4" fill="${POP}" opacity=".0"/></g>`);
  }
  const wrap = `<div style="${abs(34, 404, 932, 720, "transform:rotate(-1.6deg);background:#f4ecd9;box-shadow:0 3px 4px rgba(50,30,10,.3),0 22px 40px rgba(50,30,10,.4);overflow:hidden;z-index:1")}"><svg style="${abs(0, 0, 932, 720)}" viewBox="0 0 1000 800" preserveAspectRatio="none" aria-hidden="true">${leafs.join("")}</svg></div>`;

  // The jar: a mason jar with a cork lid, a label and a few coins in the bottom.
  const JX = 70, JY = 452;
  const coins = [[110, 560, 0], [182, 566, 0], [250, 556, 0], [146, 534, 1], [214, 530, 0], [180, 506, 1], [112, 508, 0]].map(([cx, cy, s]) => `<g><ellipse cx="${cx}" cy="${cy + 8}" rx="40" ry="13" fill="${s ? "#a8abb1" : "#b28a2c"}"/><ellipse cx="${cx}" cy="${cy}" rx="40" ry="13" fill="${s ? "#d3d6db" : "#e3bf55"}"/><ellipse cx="${cx}" cy="${cy}" rx="28" ry="8" fill="none" stroke="${s ? "#a8abb1" : "#b28a2c"}" stroke-width="2.5"/></g>`).join("");
  const jar = `<svg style="${abs(JX, JY, 400, 700, "z-index:3;filter:drop-shadow(0 22px 16px rgba(50,30,10,.4))")}" viewBox="0 0 400 700" aria-hidden="true"><defs>
      <linearGradient id="gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".18" stop-color="#ffffff" stop-opacity=".16"/><stop offset=".8" stop-color="#d7ecee" stop-opacity=".16"/><stop offset="1" stop-color="#ffffff" stop-opacity=".5"/></linearGradient>
      <linearGradient id="ck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b98c58"/><stop offset=".5" stop-color="#d9b07a"/><stop offset="1" stop-color="#a77b49"/></linearGradient></defs>
    <path d="M70 70 H330 V96 C 330 120 392 132 392 190 V640 C 392 676 366 696 330 696 H70 C 34 696 8 676 8 640 V190 C 8 132 70 120 70 96 Z" fill="#e6f1f1" fill-opacity=".34" stroke="#ffffff" stroke-opacity=".7" stroke-width="5"/>
    <path d="M70 70 H330 V96 C 330 120 392 132 392 190 V640 C 392 676 366 696 330 696 H70 C 34 696 8 676 8 640 V190 C 8 132 70 120 70 96 Z" fill="url(#gl)"/>
    <g transform="translate(34 100)">${coins}</g>
    <rect x="62" y="30" width="276" height="48" rx="10" fill="url(#ck)"/><path d="M62 44 H338 M62 58 H338" stroke="#8a6234" stroke-opacity=".35" stroke-width="2"/>
    <path d="M66 112 C 40 150 36 220 40 330" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="10" stroke-linecap="round"/>
    <path d="M356 220 V 420" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="7" stroke-linecap="round"/></svg>`;
  const label = `<div style="${abs(JX + 52, JY + 270, 296, 196, "transform:rotate(-1deg);background:#fbf5e4;border:3px solid #8a6234;border-radius:10px;z-index:4;box-shadow:0 4px 8px rgba(50,30,10,.3);padding:22px 20px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center")}">
      <div style="${abs(8, 8, 280, 180, `border:2px solid ${C.forest};border-radius:6px;opacity:.5`)}"></div>
      <div class="serif" data-check="jar-label" style="font-size:44px;line-height:1.08;font-weight:600;color:${C.forestDeep};width:250px;height:136px;display:flex;align-items:center;justify-content:center">${esc(i.items[0])}</div></div>`;

  // The gift tag tied to the neck: twine round the neck, then a coral tag reading December hanging over the shoulder.
  const HX = 452, HY = 612;
  const tag = `<svg style="${abs(0, 0, 1000, 1500, "z-index:5;overflow:visible;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true">
      <path d="M${JX + 66} ${JY + 98} C ${JX + 150} ${JY + 122}, ${JX + 290} ${JY + 122}, ${JX + 336} ${JY + 94}" fill="none" stroke="#efe3c6" stroke-width="6" stroke-linecap="round"/>
      <path d="M${JX + 336} ${JY + 94} C ${JX + 372} ${JY + 120}, ${HX - 6} ${HY - 40}, ${HX} ${HY}" fill="none" stroke="#efe3c6" stroke-width="5" stroke-linecap="round"/></svg>
    <div style="${abs(HX, HY, 0, 0, "transform:rotate(-14deg);transform-origin:0 0;z-index:6")}">
      <svg style="${abs(-250, -52, 262, 104, "overflow:visible;filter:drop-shadow(0 8px 6px rgba(50,30,10,.4))")}" viewBox="0 0 262 104" aria-hidden="true"><path d="M250 52 L214 4 H34 Q14 4 14 24 V80 Q14 100 34 100 H214 Z" fill="${POP}"/><path d="M236 52 L206 14 H36 Q26 14 26 26 V78 Q26 90 36 90 H206 Z" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><circle cx="226" cy="52" r="12" fill="#fff6e6"/><circle cx="226" cy="52" r="12" fill="none" stroke="#c34a35" stroke-width="3"/></svg>
      <div class="serif" data-check="tag" style="${abs(-232, -22, 176, 44, "font-size:38px;font-weight:600;color:#fff;display:flex;align-items:center;justify-content:center;white-space:nowrap")}">${esc(i.items[1].replace("Lands in ", ""))}</div></div>`;

  // The sum card.
  const [cost, , monthly] = i.items;
  const card = `<div style="${abs(590, 470, 372, 456, `transform:rotate(1.4deg);background:#fffdf5;border-radius:8px;filter:${SHADOW};z-index:4`)}">
      <div style="${abs(0, 0, 372, 18, `background:${C.forest};border-radius:8px 8px 0 0`)}"></div>
      <div style="${abs(26, 40, 320, 440, "display:flex;flex-direction:column")}">
        <div><span class="example" style="font-size:24px;padding:4px 12px">Example</span></div>
        <div class="serif" data-check="sum-cost" style="margin-top:20px;font-size:44px;line-height:1.08;font-weight:500;height:96px;width:320px">${esc(cost)}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:14px;color:${C.forest}">${icon("arrow-down", { size: 44, color: C.forest, weight: "bold" })}<div data-check="sum-lands" style="font-size:27px;font-weight:600;line-height:1.15;color:#4b4339;width:250px;height:34px">${esc(i.items[1])}</div></div>
        <div style="height:4px;background:${C.forest};margin:18px 0 12px;opacity:.85"></div>
        <div class="serif" data-check="sum-monthly" style="font-size:80px;line-height:.98;font-weight:600;color:${C.forestDeep};width:320px;height:80px">${esc(monthly.split(" ")[0])}</div>
        <div class="serif" data-check="sum-a-month" style="font-size:44px;line-height:1.1;font-weight:500;color:${C.forest};width:320px;height:50px">${esc(monthly.split(" ").slice(1).join(" "))}</div>
      </div></div>`;

  // Props at the bottom: a wrapped box, ribbon curls and paper scraps.
  const box = `<div style="${abs(618, 1062, 300, 252, "z-index:4;filter:drop-shadow(0 18px 14px rgba(50,30,10,.45))")}">
      <div style="${abs(0, 52, 300, 200, `background:linear-gradient(150deg,${C.forest},${C.forestDeep});border-radius:6px`)}"></div>
      <div style="${abs(0, 52, 300, 200, "background:radial-gradient(circle,rgba(255,255,255,.2) 4px,transparent 5px) 0 0/34px 34px;border-radius:6px")}"></div>
      <div style="${abs(-8, 32, 316, 52, "background:linear-gradient(#2d6a56,#154538);border-radius:6px;box-shadow:0 4px 6px rgba(0,0,0,.3)")}"></div>
      <div style="${abs(124, 32, 52, 220, "background:#f1e6c8")}"></div>
      <svg style="${abs(70, -12, 160, 80)}" viewBox="0 0 160 80" aria-hidden="true"><path d="M80 56 C 40 10, 6 18, 14 46 C 22 70, 64 66, 80 56 Z" fill="#f6ecd0"/><path d="M80 56 C 120 10, 154 18, 146 46 C 138 70, 96 66, 80 56 Z" fill="#efe2bf"/><circle cx="80" cy="54" r="14" fill="#f1e6c8"/></svg></div>`;
  const scrap = (x, y, w, h, rot, bg, pat) => `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${bg};box-shadow:0 8px 12px rgba(50,30,10,.35);z-index:3;overflow:hidden`)}"><div style="${abs(0, 0, w, h, pat)}"></div></div>`;
  const scraps = scrap(40, 1180, 280, 130, -6, "#f6efdc", `background:repeating-linear-gradient(45deg,transparent 0 16px,${C.forest} 16px 22px);opacity:.28`) + scrap(190, 1168, 250, 120, 8, "#dfeadf", "background:radial-gradient(circle,rgba(23,71,58,.4) 5px,transparent 6px) 0 0/30px 30px");
  const rings = [66, 56, 46, 36].map((rr, k) => `<circle cx="80" cy="80" r="${rr}" fill="none" stroke="${k % 2 ? "#2d6a56" : "#0f3a2e"}" stroke-width="9"/>`).join("");
  const curl = `<svg style="${abs(300, 1150, 330, 180, "z-index:5;filter:drop-shadow(0 8px 6px rgba(50,30,10,.4))")}" viewBox="0 0 330 180" aria-hidden="true">
      <path d="M96 140 C 140 168, 190 120, 236 150 S 300 170, 318 140" fill="none" stroke="${C.forest}" stroke-width="22" stroke-linecap="round"/><path d="M96 134 C 140 162, 190 114, 236 144 S 300 164, 318 134" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="5" stroke-linecap="round"/>
      <g transform="translate(0 10)"><circle cx="80" cy="80" r="76" fill="${C.forestDeep}"/>${rings}<circle cx="80" cy="80" r="24" fill="#c9a679"/><circle cx="80" cy="80" r="24" fill="none" stroke="#8a6234" stroke-width="3"/><path d="M20 50 A 66 66 0 0 1 64 16" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="6" stroke-linecap="round"/></g></svg>`;

  return printable({ n: 100, paper: "#efe3cf", scene: `${kraft}${wrap}${jar}${label}${card}${tag}${scraps}${curl}${box}` });
}

/* ------------------------------------------------------------------ #66 */

function pin66() {
  const i = idea(66);
  const r = seeded(13);
  const speck = Array.from({ length: 240 }, () => `<circle cx="${(r() * 1000).toFixed(0)}" cy="${(380 + r() * 900).toFixed(0)}" r="${(0.8 + r() * 2).toFixed(1)}" fill="${r() > 0.5 ? "#fff" : "#37604c"}" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`).join("");
  const wall = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><radialGradient id="sw" cx="25%" cy="20%" r="95%"><stop offset="0" stop-color="#dcebdf"/><stop offset="1" stop-color="#a9c6b3"/></radialGradient><linearGradient id="oakp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b681"/><stop offset="1" stop-color="#b58d58"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="url(#sw)"/>${speck}
    <rect x="-10" y="1282" width="1020" height="90" fill="url(#oakp)"/><rect x="-10" y="1278" width="1020" height="8" fill="#8a6234" opacity=".6"/><rect x="-10" y="1286" width="1020" height="4" fill="#fff" opacity=".28"/></svg>`;

  // The year planner: twelve months, the same day ringed in every one (no number, just its place in the grid).
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const tile = (m, k) => {
    const col = k % 6, row = Math.floor(k / 6);
    const tx = 14 + col * 148, ty = 62 + row * 126;
    const dots = [];
    for (let ro = 0; ro < 5; ro++) for (let co = 0; co < 7; co++) dots.push(`<rect x="${12 + co * 17}" y="${38 + ro * 15}" width="11" height="10" rx="2.5" fill="#c9d3cc"/>`);
    return `<div style="${abs(tx, ty, 140, 118, "background:#fff;border-radius:8px;box-shadow:0 2px 3px rgba(20,50,35,.25)")}"><div style="${abs(12, 4, 100, 30, `font:600 22px 'Plex';color:${C.forestDeep}`)}">${esc(m)}</div>
      <svg style="${abs(0, 0, 140, 118, "overflow:visible")}" viewBox="0 0 140 118" aria-hidden="true">${dots.join("")}<ellipse cx="${12 + 3 * 17 + 5.5}" cy="${38 + 2 * 15 + 5}" rx="15" ry="13" fill="none" stroke="${C.forest}" stroke-width="3.5"/></svg></div>`;
  };
  const planner = `<div style="${abs(40, 396, 920, 326, "background:#f7f5ee;border-radius:12px;box-shadow:0 4px 6px rgba(20,50,35,.28),0 26px 40px rgba(20,50,35,.35);z-index:2")}">
      <div style="${abs(0, 0, 920, 50, `background:linear-gradient(${C.forest},${C.forestDeep});border-radius:12px 12px 0 0`)}"></div>
      <div style="${abs(430, -14, 60, 30, "background:linear-gradient(#f1d77a,#9a7418);border-radius:8px;box-shadow:0 3px 5px rgba(0,0,0,.35)")}"></div>
      <div style="${abs(0, 0, 920, 326)}">${months.map(tile).join("")}</div></div>`;

  // Five step strips.
  const strips = i.items.map((t, k) => {
    const y = 744 + k * 98;
    return `<div style="${abs(50, y, 900, 88, `background:#fffdf7;border-radius:8px;filter:${SHADOW};z-index:3`)}">
      <div style="${abs(0, 0, 14, 88, `background:${k === 0 ? POP : C.forest};border-radius:8px 0 0 8px;opacity:${k === 0 ? 1 : 0.85}`)}"></div>
      <div style="${abs(40, 21, 46, 46)}">${box({ size: 46, half: k === 0, tickColor: POP, edge: "#3a3f46" })}</div>
      <div data-check="step-${k}" style="${abs(110, 8, 770, 72, "display:flex;align-items:center;font-size:29px;line-height:1.16;font-weight:500;color:#26211c")}">${esc(t)}</div></div>`;
  }).join("");

  // A closed binder lying on the shelf with an index tab, and a pencil.
  const binder = `<div style="${abs(500, 1230, 380, 50, "z-index:3;filter:drop-shadow(0 12px 8px rgba(40,25,10,.4))")}">
      <div style="${abs(0, 0, 380, 50, `background:linear-gradient(${C.forest},${C.forestDeep});border-radius:8px 6px 6px 8px`)}"></div>
      <div style="${abs(0, 0, 380, 11, "background:rgba(255,255,255,.18);border-radius:8px 6px 0 0")}"></div>
      <div style="${abs(370, 10, 62, 26, "background:#f0d58a;border-radius:0 8px 8px 0;box-shadow:0 3px 5px rgba(0,0,0,.35)")}"></div>
      <div style="${abs(24, 15, 140, 20, "background:#f4efe0;border-radius:4px;opacity:.9")}"></div></div>`;
  const scene = `${wall}${planner}${strips}${binder}${pencil({ x: 70, y: 1246, len: 380, rot: 1.5 })}`;
  return printable({ n: 66, paper: "#e5eee6", scene });
}

/* ------------------------------------------------------------------ #58 */

function pin58() {
  const i = idea(58);
  const r = seeded(77);
  const steps = i.items.map(split);

  // Glass: icy sky, snow, pines and a drift, then frost in the corners.
  const GX = 44, GY = 414, GW = 912, GH = 902;
  const snow = Array.from({ length: 150 }, () => { const rad = 2 + r() * 7; return `<circle cx="${(r() * GW).toFixed(0)}" cy="${(r() * GH).toFixed(0)}" r="${rad.toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.55).toFixed(2)}"/>`; }).join("");
  const pine = (x, h, c) => `<g transform="translate(${x} ${GH - 70})"><path d="M0 0 L${-h * 0.34} 0 L0 ${-h} L${h * 0.34} 0 Z" fill="${c}"/><path d="M0 ${-h * 0.35} L${-h * 0.28} ${-h * 0.05} L0 ${-h * 0.8} L${h * 0.28} ${-h * 0.05} Z" fill="${c}"/><path d="M${-h * 0.18} ${-h * 0.62} Q0 ${-h * 0.5} ${h * 0.18} ${-h * 0.62} L0 ${-h * 0.95} Z" fill="#fff" opacity=".85"/></g>`;
  const pines = [[110, 120, "#7b9b91"], [786, 330, "#628579"], [850, 250, "#6b8f84"], [896, 170, "#7b9b91"], [760, 190, "#7b9b91"]].map(([x, h, c]) => pine(x, h, c)).join("");
  const glass = `<svg style="${abs(GX, GY, GW, GH, "z-index:1")}" viewBox="0 0 ${GW} ${GH}" aria-hidden="true"><defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c3d7e6"/><stop offset=".7" stop-color="#e4eef4"/><stop offset="1" stop-color="#f4f8fa"/></linearGradient>
      <radialGradient id="fr1" cx="0" cy="0" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <rect width="${GW}" height="${GH}" fill="url(#sk)"/>${snow}${pines}
    <path d="M0 ${GH - 80} C 200 ${GH - 110}, 360 ${GH - 60}, 560 ${GH - 90} S 820 ${GH - 100}, ${GW} ${GH - 76} V${GH} H0 Z" fill="#fff"/><path d="M0 ${GH - 50} C 240 ${GH - 70}, 600 ${GH - 40}, ${GW} ${GH - 56} V${GH} H0 Z" fill="#e3edf3"/>
    <circle cx="0" cy="0" r="260" fill="url(#fr1)"/><circle cx="${GW}" cy="0" r="220" fill="url(#fr1)"/><circle cx="${GW}" cy="${GH}" r="260" fill="url(#fr1)"/></svg>`;
  const frame = `<div style="${abs(14, 384, 972, 962, "background:linear-gradient(145deg,#faf9f5,#e3e0d6);border-radius:14px;box-shadow:0 4px 6px rgba(30,40,50,.3),0 24px 40px rgba(30,40,50,.4);z-index:0")}"></div>
    <div style="${abs(GX - 8, GY - 8, GW + 16, GH + 16, "border-radius:6px;box-shadow:inset 0 3px 8px rgba(40,50,60,.45),inset 0 0 0 5px #d8d4c8;z-index:2;pointer-events:none")}"></div>`;
  const sill = `<div style="${abs(-10, 1318, 1020, 60, "background:linear-gradient(#fbfaf6,#d9d5c9);box-shadow:0 -4px 8px rgba(30,40,50,.3);z-index:2")}"></div>`;

  // The ruler down the left rail: ticks every half minute, a number at each minute, coloured brackets for the five stops.
  const RX = 54, R0 = 454, PM = 82; // pixels per minute
  const yAt = (m) => R0 + m * PM;
  const ticks = [];
  for (let m = 0; m <= 10; m += 0.5) {
    const major = Number.isInteger(m);
    ticks.push(`<path d="M80 ${yAt(m) - 414 + 0} h${major ? 46 : 26}" stroke="#7a5a30" stroke-width="${major ? 3 : 2}"/>`);
    if (major) ticks.push(`<text x="22" y="${yAt(m) - 414 + 9}" font-family="Plex" font-weight="600" font-size="26" fill="#5a3f1d" text-anchor="middle">${m}</text>`);
  }
  const ruler = `<div style="${abs(RX, 424, 82, 884, "background:linear-gradient(90deg,#efd4a0,#e2bf86);border-radius:6px;box-shadow:0 3px 4px rgba(40,25,10,.35),0 14px 18px rgba(40,25,10,.3);z-index:3")}"><svg style="${abs(0, -10 + 0, 82, 884, "overflow:visible")}" viewBox="0 0 82 884" aria-hidden="true"><g transform="translate(0 0)">${ticks.join("").replace(/M80/g, "M46").replace(/h46/g, "h32").replace(/x="22"/g, 'x="24"').replace(/font-size="26"/g, 'font-size="24"')}</g></svg></div>`;
  const cols = [C.forest, "#3d7d68", POP, "#5f9a85", C.forest];
  const spans = [[0, 2], [2, 6], [7, 7], [7, 9], [10, 10]];
  const brackets = spans.map(([a, b], k) => {
    const x = k === 3 ? 168 : 146;
    if (a === b) return `<div style="${abs(x - 2, yAt(a) - 12, 24, 24, `border-radius:50%;background:${cols[k]};box-shadow:0 2px 4px rgba(0,0,0,.3);z-index:3`)}"></div>`;
    return `<div style="${abs(x, yAt(a) + 3, 14, yAt(b) - yAt(a) - 6, `border-radius:7px;background:${cols[k]};box-shadow:0 2px 4px rgba(0,0,0,.25);z-index:3`)}"></div>`;
  }).join("");

  // The five cards taped to the glass.
  const cards = steps.map(([when, what], k) => {
    const y = 430 + k * 170;
    const isSeven = k === 2;
    const tape = `<div style="${abs(330, -14, 120, 32, `transform:rotate(${k % 2 ? -3 : 2}deg);background:${["#f0d58a", "#cfe3da", "#f4cdbd", "#d8dfc2", "#cfe0ee"][k]};opacity:.9;box-shadow:0 2px 3px rgba(0,0,0,.2)`)}"></div>`;
    return `<div style="${abs(196, y, 590, 150, `background:#fffefa;border-radius:8px;filter:${SHADOW};z-index:4`)}">${tape}
      <div style="${abs(0, 0, 14, 150, `background:${cols[k]};border-radius:8px 0 0 8px`)}"></div>
      <div style="${abs(36, 12, 536, 128, "display:flex;flex-direction:column;justify-content:center;gap:12px")}">
        <div style="position:relative;align-self:flex-start;padding:2px 0"><span data-check="when-${k}" class="eyebrow" style="font-size:26px;letter-spacing:.1em;color:${isSeven ? "#b23f2a" : C.forest};white-space:nowrap">${esc(when)}</span>${isSeven ? `<svg style="${abs(-24, -17, 0, 0, "overflow:visible;width:calc(100% + 48px);height:calc(100% + 28px)")}" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true"><path d="M30 12 C 70 -2, 150 0, 184 14 C 204 26, 170 46, 100 46 C 40 46, -2 36, 10 20 C 18 8, 70 4, 120 4" fill="none" stroke="${POP}" stroke-width="5" stroke-linecap="round"/></svg>` : ""}</div>
        <div class="serif" data-check="what-${k}" style="font-size:36px;line-height:1.08;font-weight:500;color:#26211c;width:536px;max-height:84px;overflow:hidden">${esc(what)}</div></div></div>`;
  }).join("");

  const scene = `${frame}${glass}${ruler}${brackets}${cards}${sill}${pencil({ x: 560, y: 1322, len: 360, rot: -2 })}`;
  return printable({ n: 58, paper: "#e6edf2", scene, extraCss: ".top h1{font-size:74px}.top p{font-size:26px;margin-top:12px}" });
}

/* ------------------------------------------------------------------ #4 */

function pin4() {
  const i = idea(4);
  const r = seeded(29);
  const stripes = Array.from({ length: 21 }, (_, k) => `<rect x="${k * 50}" y="380" width="22" height="1000" fill="#fff" opacity=".13"/>`).join("");
  const wall = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><radialGradient id="pw" cx="25%" cy="18%" r="100%"><stop offset="0" stop-color="#f7dcc6"/><stop offset="1" stop-color="#e2b090"/></radialGradient><linearGradient id="oakq" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b681"/><stop offset="1" stop-color="#b58d58"/></linearGradient></defs>
    <rect width="1000" height="1500" fill="url(#pw)"/>${stripes}
    <rect x="470" y="1284" width="560" height="60" fill="url(#oakq)"/><rect x="470" y="1280" width="560" height="7" fill="#8a6234" opacity=".6"/></svg>`;

  const LINES = [{ y0: 424, sag: 30 }, { y0: 726, sag: 30 }, { y0: 1028, sag: 30 }];
  const lineY = (ln, x) => { const t = (x + 10) / 1020; return ln.y0 + 4 * ln.sag * t * (1 - t); };
  const rope = LINES.map((ln) => `<path d="M-10 ${ln.y0} Q 500 ${ln.y0 + 2 * ln.sag} 1010 ${ln.y0}" fill="none" stroke="#a8824f" stroke-width="7" stroke-linecap="round"/><path d="M-10 ${ln.y0 - 2} Q 500 ${ln.y0 + 2 * ln.sag - 2} 1010 ${ln.y0 - 2}" fill="none" stroke="#e1c391" stroke-width="2.5" stroke-linecap="round"/><circle cx="14" cy="${ln.y0}" r="9" fill="#6f6a66"/><circle cx="986" cy="${ln.y0}" r="9" fill="#6f6a66"/>`).join("");
  const ropeSvg = `<svg style="${abs(0, 0, 1000, 1500, "z-index:1;filter:drop-shadow(0 6px 4px rgba(80,40,20,.3))")}" viewBox="0 0 1000 1500" aria-hidden="true">${rope}</svg>`;

  const peg = (x, y, rot) => `<div style="${abs(x - 14, y - 26, 28, 78, `transform:rotate(${rot}deg);background:linear-gradient(90deg,#d9b27a,#b98a54);border-radius:6px;box-shadow:0 4px 5px rgba(60,30,10,.35);z-index:6`)}"><div style="${abs(0, 28, 28, 5, "background:#8a8d93")}"></div></div>`;
  const placements = [[0, 40, -2.2], [0, 520, 2.4], [1, 60, 1.8], [1, 530, -2], [2, 40, -1.6]];
  const cards = i.items.map((t, k) => {
    const [li, x, rot] = placements[k];
    const ln = LINES[li];
    const w = 440, h = 244, cy = lineY(ln, x + w / 2) + 14;
    return `<div style="${abs(x, cy, w, h, `transform:rotate(${rot}deg);transform-origin:50% 0;background:#fffdf6;border-radius:6px;filter:${SHADOW};z-index:4`)}">
      <div style="${abs(0, 52, w, 3, "background:#d9695a;opacity:.85")}"></div>
      <div style="${abs(0, 56, w, h - 56, "background:repeating-linear-gradient(180deg,transparent 0 39px,#cbd7e6 39px 41px);opacity:.5")}"></div>
      <div style="${abs(24, 8, 56, 42)}">${box({ size: 38, ticked: k < 2, edge: "#3a3f46" })}</div>
      <div data-check="item-${k}" style="${abs(24, 66, w - 48, h - 80, "font-size:33px;line-height:41px;font-weight:500;color:#26211c;overflow:hidden")}">${esc(t)}</div></div>
      ${peg(x + 150, lineY(ln, x + 150) + 4, -4)}${peg(x + w - 70, lineY(ln, x + w - 70) + 4, 4)}`;
  }).join("");

  // A sticky note on the third line, and a mug and pen on the shelf.
  const sx = 560, sy = lineY(LINES[2], sx + 85) + 14;
  const sticky = `<div style="${abs(sx, sy, 170, 170, "transform:rotate(4deg);transform-origin:50% 0;background:linear-gradient(160deg,#fbe38a,#f1cf62);box-shadow:0 10px 14px rgba(80,40,20,.35);z-index:4")}"><div style="${abs(0, 0, 170, 30, "background:rgba(255,255,255,.22)")}"></div></div>${peg(sx + 85, lineY(LINES[2], sx + 85) + 4, 3)}`;
  const props = `${mug({ x: 790, y: 1166, size: 140, color: "#f3ede4", drink: "#6b4226" })}${pen({ x: 560, y: 1264, len: 220, rot: -2, body: C.forestDeep })}`;
  return printable({ n: 4, paper: "#f4e3d4", scene: `${wall}${ropeSvg}${cards}${sticky}${props}` });
}

export const pins = [pin101(), pin100(), pin66(), pin58(), pin4()];
