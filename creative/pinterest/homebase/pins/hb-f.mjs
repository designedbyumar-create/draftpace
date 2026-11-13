/**
 * Home Base pins, group F: fridge door and kitchen wall.
 * Appliance and warranty guide pins #16, #18, #20, #22, #24, #26.
 *
 * Every pin lives in the kitchen: a tiled splashback, a fridge door, a
 * beadboard wall with a hook rail, a stone worktop, an oak counter, a
 * dishwasher. All words are the idea bank's (headline, sub, items) except
 * the labels listed in the builder's report.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";
import { desk, pencil } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const split = (s) => { const k = s.indexOf(": "); return [s.slice(0, k), s.slice(k + 2)]; };

/* ---------- shared kitchen props ---------- */

/** A tiled splashback: subway tiles with grout lines and a soft gloss. */
function tiles({ x = 0, y = SCENE_TOP, w = 1000, h = 1354 - SCENE_TOP, tile = "#f4f7f1", tile2 = "#e6ece1", grout = "#c9d4c3", tw = 140, th = 70, shade = 0.18 }) {
  return `<svg style="${abs(x, y, w, h)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs>
    <linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tile}"/><stop offset="1" stop-color="${tile2}"/></linearGradient>
    <pattern id="sw" width="${tw}" height="${th * 2}" patternUnits="userSpaceOnUse">
      <rect width="${tw}" height="${th * 2}" fill="${grout}"/>
      <rect x="2" y="2" width="${tw - 4}" height="${th - 4}" rx="4" fill="url(#gl)"/>
      <rect x="${-tw / 2 + 2}" y="${th + 2}" width="${tw - 4}" height="${th - 4}" rx="4" fill="url(#gl)"/>
      <rect x="${tw / 2 + 2}" y="${th + 2}" width="${tw - 4}" height="${th - 4}" rx="4" fill="url(#gl)"/>
    </pattern>
    <radialGradient id="vg" cx="30%" cy="15%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#1a2a1f" stop-opacity="${shade}"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#sw)"/><rect width="${w}" height="${h}" fill="url(#vg)"/></svg>`;
}

/** A wooden wall rail with J hooks (hook x offsets are from the rail's left). */
function rail({ x, y, w, hooks = [], wood = "#c99b66", metal = "#4a4f55" }) {
  const hk = hooks.map((cx) => `<path d="M${cx} 20 V46 q0 15 15 15 q15 0 15 -15" fill="none" stroke="${metal}" stroke-width="5.5" stroke-linecap="round"/><circle cx="${cx}" cy="14" r="5" fill="${metal}"/>`).join("");
  return `<svg style="${abs(x, y, w, 70, "filter:drop-shadow(0 8px 6px rgba(30,20,8,.35))")}" viewBox="0 0 ${w} 70" aria-hidden="true">
    <rect y="2" width="${w}" height="24" rx="6" fill="${wood}"/><rect y="2" width="${w}" height="8" rx="4" fill="#fff" opacity=".22"/><rect y="19" width="${w}" height="7" rx="3" fill="#6b4a22" opacity=".3"/>
    <circle cx="14" cy="14" r="4" fill="${metal}"/><circle cx="${w - 14}" cy="14" r="4" fill="${metal}"/>${hk}</svg>`;
}

/** A tea towel: stripes, a hem, a hanging loop. `drop` is how far it hangs. */
function towel({ x, y, w, h, base = "#f6f3ea", stripe = "#4f7a5c", tilt = 0, bands = 2 }) {
  const b = Array.from({ length: bands }, (_, k) => {
    const yy = 0.62 + k * 0.1;
    return `linear-gradient(transparent ${yy * 100}%, ${stripe} ${yy * 100}%, ${stripe} ${(yy + 0.045) * 100}%, transparent ${(yy + 0.045) * 100}%)`;
  }).join(",");
  const warp = `repeating-linear-gradient(90deg, rgba(0,0,0,.035) 0 3px, transparent 3px 9px)`;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);transform-origin:50% 0;background:${b},${warp},${base};border-radius:3px 3px 10px 10px;box-shadow:0 4px 6px rgba(30,20,8,.25),0 22px 30px rgba(30,20,8,.3)`)}"><div style="position:absolute;left:0;right:0;top:0;height:22px;background:linear-gradient(rgba(0,0,0,.14),transparent);border-radius:3px 3px 0 0"></div><div style="position:absolute;left:0;right:0;bottom:0;height:10px;border-top:2px dashed rgba(0,0,0,.14)"></div></div>`;
}

/** A ceramic jar of wooden spoons, standing on whatever is under y + the height. */
function spoonJar({ x, y, s = 1, jar = "#8fae96", band = "#f3ede4" }) {
  const w = 200 * s, h = 300 * s;
  const spoon = (cx, rot, wood) => `<g transform="rotate(${rot} ${cx} 150)"><rect x="${cx - 7}" y="60" width="14" height="110" rx="6" fill="${wood}"/><ellipse cx="${cx}" cy="48" rx="21" ry="34" fill="${wood}"/><ellipse cx="${cx - 5}" cy="40" rx="8" ry="16" fill="#fff" opacity=".2"/></g>`;
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 14px 10px rgba(30,20,8,.4))")}" viewBox="0 0 200 300" aria-hidden="true">
    ${spoon(70, -14, "#c99b66")}${spoon(104, 4, "#b98a52")}${spoon(138, 16, "#d5ac78")}
    <path d="M40 140 H160 L170 280 Q170 296 150 296 H50 Q30 296 30 280 Z" fill="${jar}"/>
    <path d="M40 140 H160 L162 168 H38 Z" fill="${band}"/><path d="M52 150 H70 L74 288 H56 Z" fill="#fff" opacity=".2"/>
    <ellipse cx="100" cy="140" rx="60" ry="9" fill="#2a2a24" opacity=".35"/></svg>`;
}

/** A round fridge magnet. */
function magnet({ x, y, r = 24, color }) {
  return `<div style="${abs(x - r, y - r, r * 2, r * 2, `border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff9 0,transparent 38%),${color};box-shadow:0 2px 2px rgba(0,0,0,.3),0 10px 14px rgba(20,30,30,.35)`)}"></div>`;
}

/** A disc carrying one Phosphor icon, the key that ties a tag to its appliance. */
const disc = (name, size = 56, bg = C.sageDeep, fg = "#fff") =>
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};display:grid;place-items:center;flex:none;box-shadow:0 3px 6px rgba(20,30,20,.3)">${icon(name, { size: Math.round(size * 0.58), color: fg, weight: "bold" })}</div>`;

/** The bank's own lines for an idea's items. */
const items = (n) => idea(n).items;

/* =============================================================
   #16  Appliance Info to Record: house cutaway on a sage splashback
   ============================================================= */
function pin16() {
  const [fr, fx] = split(items(16)[0]);
  const [fu, fux] = split(items(16)[1]);
  const [wh, whx] = split(items(16)[2]);
  const [gd, gdx] = split(items(16)[3]);
  const K = 900 / 880; // local cutaway units -> pin px
  const HX = 50, HY = 388;
  const at = (lx, ly) => `left:${HX + lx * K}px;top:${HY + ly * K}px`;
  const house = `<svg style="${abs(HX, HY, 900, 440, "filter:drop-shadow(0 20px 22px rgba(20,35,25,.45))")}" viewBox="0 0 880 430" aria-hidden="true">
    <defs><linearGradient id="fg" x1="0" x2="1"><stop offset="0" stop-color="#f4f7f8"/><stop offset=".6" stop-color="#dfe5e7"/><stop offset="1" stop-color="#c5cdd0"/></linearGradient>
    <linearGradient id="hg" x1="0" x2="1"><stop offset="0" stop-color="#d9dedb"/><stop offset=".5" stop-color="#f0f3f1"/><stop offset="1" stop-color="#bcc4c0"/></linearGradient>
    <linearGradient id="fn" x1="0" x2="1"><stop offset="0" stop-color="#b4bdb8"/><stop offset="1" stop-color="#8c968f"/></linearGradient></defs>
    <polygon points="0,96 440,2 880,96" fill="#3f6a4d"/><polygon points="0,96 440,2 880,96 862,96 440,14 18,96" fill="#2f5240"/>
    <path d="M60 80 L440 -4 M120 90 L440 22" stroke="#fff" stroke-opacity=".08" stroke-width="3" fill="none"/>
    <rect x="30" y="96" width="820" height="334" fill="#2f4a38"/>
    <rect x="38" y="104" width="322" height="186" fill="#e4dfce"/><rect x="368" y="104" width="474" height="186" fill="#f4efe0"/>
    <rect x="38" y="104" width="322" height="186" fill="none"/>
    <rect x="38" y="274" width="322" height="16" fill="#cfc9b6"/><rect x="368" y="274" width="474" height="16" fill="#d9cfb8"/>
    <rect x="360" y="104" width="8" height="186" fill="#2f4a38"/>
    <rect x="30" y="290" width="820" height="14" fill="#8a7a62"/>
    <rect x="38" y="304" width="804" height="118" fill="#d6d1c1"/>
    <g stroke="#b9b3a0" stroke-width="2" opacity=".7"><path d="M38 330 H842 M38 362 H842 M38 394 H842"/></g>
    <rect x="30" y="418" width="820" height="12" fill="#5f5846"/>
    <!-- garage: door lifted under the ceiling, rail, opener, keypad -->
    <rect x="52" y="118" width="196" height="26" rx="3" fill="#cdd3d6"/><g stroke="#9aa2a6" stroke-width="2"><path d="M101 118 V144 M150 118 V144 M199 118 V144"/></g>
    <rect x="60" y="150" width="226" height="7" rx="3" fill="#8f959c"/>
    <rect x="262" y="140" width="76" height="32" rx="8" fill="#37463e"/><rect x="274" y="148" width="26" height="8" rx="3" fill="#a8c4ae"/><circle cx="322" cy="156" r="5" fill="#f0d58a"/>
    <path d="M286 153 H262" stroke="#8f959c" stroke-width="4"/>
    <rect x="316" y="186" width="30" height="48" rx="5" fill="#37463e"/><g fill="#d7e2d9"><circle cx="324" cy="196" r="3"/><circle cx="331" cy="196" r="3"/><circle cx="338" cy="196" r="3"/><circle cx="324" cy="206" r="3"/><circle cx="331" cy="206" r="3"/><circle cx="338" cy="206" r="3"/><circle cx="324" cy="216" r="3"/><circle cx="331" cy="216" r="3"/><circle cx="338" cy="216" r="3"/></g>
    <!-- kitchen: cabinet, counter, window, fridge -->
    <rect x="388" y="112" width="150" height="62" rx="4" fill="#c99b66"/><rect x="388" y="112" width="150" height="10" fill="#fff" opacity=".2"/><circle cx="520" cy="158" r="4" fill="#5b4122"/>
    <rect x="560" y="124" width="92" height="76" rx="3" fill="#cfe0e8"/><path d="M606 124 V200 M560 162 H652" stroke="#fff" stroke-width="5"/><rect x="560" y="124" width="92" height="76" rx="3" fill="none" stroke="#fff" stroke-width="6"/>
    <rect x="384" y="236" width="296" height="38" fill="#a9bfa5"/><rect x="380" y="226" width="304" height="12" rx="3" fill="#ddd6c6"/>
    <rect x="700" y="132" width="104" height="158" rx="7" fill="url(#fg)"/><rect x="700" y="132" width="104" height="158" rx="7" fill="none" stroke="#aab3b6" stroke-width="2"/>
    <path d="M702 186 H802" stroke="#98a2a6" stroke-width="3"/><rect x="712" y="150" width="6" height="26" rx="3" fill="#8a9296"/><rect x="712" y="198" width="6" height="42" rx="3" fill="#8a9296"/>
    <!-- basement: furnace and water heater -->
    <rect x="196" y="304" width="34" height="14" fill="#9aa39e"/>
    <rect x="130" y="318" width="170" height="100" rx="5" fill="url(#fn)"/><rect x="144" y="330" width="86" height="76" rx="3" fill="#6f7a73"/>
    <g stroke="#9aa59e" stroke-width="3"><path d="M152 342 H222 M152 354 H222 M152 366 H222 M152 378 H222 M152 390 H222"/></g>
    <rect x="244" y="334" width="42" height="26" rx="3" fill="#2f3a34"/><rect x="250" y="340" width="12" height="14" rx="2" fill="#e49b3c"/><circle cx="272" cy="392" r="8" fill="#cfd6d1"/>
    <rect x="650" y="316" width="96" height="102" rx="16" fill="url(#hg)"/><rect x="650" y="316" width="96" height="102" rx="16" fill="none" stroke="#a5ada9" stroke-width="2"/>
    <rect x="672" y="366" width="52" height="26" rx="3" fill="#7c8a82"/><circle cx="698" cy="379" r="5" fill="#f0d58a"/>
    <path d="M678 316 V300 M718 316 V304" stroke="#5b7387" stroke-width="9" stroke-linecap="round"/><path d="M678 312 H600" stroke="#5b7387" stroke-width="9" stroke-linecap="round"/>
    </svg>`;
  const disc16 = (lx, ly, name) => `<div style="position:absolute;${at(lx, ly)};margin:-26px 0 0 -26px">${disc(name, 52)}</div>`;
  const card = (x, y, name, label, text, tilt) => `<div style="${abs(x, y, 440, 168, `transform:rotate(${tilt}deg);background:linear-gradient(#d7b783,#c8a679);border-radius:10px 26px 26px 10px;box-shadow:0 3px 4px rgba(40,25,8,.3),0 16px 24px rgba(40,25,8,.35);display:flex;align-items:center;gap:20px;padding:14px 22px 14px 50px`)}">
    <div style="position:absolute;left:18px;top:50%;margin-top:-10px;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 40% 40%,#8c6a38,#e9dcc0 70%);box-shadow:inset 0 2px 3px rgba(0,0,0,.4)"></div>
    ${disc(name, 58)}<div style="min-width:0"><div class="serif" style="font-weight:600;font-size:27px;line-height:1.05;color:#1a2420">${esc(label)}</div><div style="font-size:24px;line-height:1.28;margin-top:7px;color:#2b2518">${esc(text)}</div></div></div>`;
  return `${tiles({ tile: "#f6f9f3", tile2: "#e3eadf", grout: "#bccab8" })}
    ${house}${disc16(672, 192, "snowflake")}${disc16(282, 212, "garage")}${disc16(338, 372, "fan")}${disc16(782, 372, "drop")}
    ${card(40, 846, "snowflake", fr, fx, -0.7)}${card(520, 850, "fan", fu, fux, 0.6)}
    ${card(40, 1026, "drop", wh, whx, 0.5)}${card(520, 1022, "garage", gd, gdx, -0.6)}
    <div style="${abs(0, 1300, 1000, 60, "background:linear-gradient(#cda26c,#a97d47);box-shadow:0 -6px 12px rgba(30,20,8,.3)")}"></div>
    ${spoonJar({ x: 800, y: 1176, s: 0.62 })}`;
}

/* =============================================================
   #18  Appliance Warranty Tracker: binder page held to a fridge door
   ============================================================= */
function pin18() {
  const rows = items(18);
  const clip = `<svg style="${abs(846, 690, 62, 150, "transform:rotate(8deg);filter:drop-shadow(3px 6px 4px rgba(40,25,8,.4))")}" viewBox="0 0 62 150" aria-hidden="true"><path d="M20 118 V30 a12 12 0 0 1 24 0 V120 a22 22 0 0 1 -44 0 V40" fill="none" stroke="#8a5a11" stroke-width="5.5" stroke-linecap="round" transform="translate(9 4)"/></svg>`;
  const heater = `<svg style="${abs(684, 1108, 130, 150)}" viewBox="0 0 130 150" fill="none" stroke="${C.sageDeep}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="30" y="34" width="70" height="104" rx="16"/><path d="M30 56 H100"/><rect x="46" y="86" width="38" height="22" rx="3"/><circle cx="65" cy="97" r="4"/>
    <path d="M50 34 V14 H20 M82 34 V8" stroke="${C.slate}" stroke-width="5"/><path d="M104 56 V76 M104 76 H112" stroke="${C.sageDeep}" stroke-width="3"/><path d="M40 138 V146 M90 138 V146"/></svg>`;
  const rowHtml = rows.map((t, k) => `<div style="position:absolute;left:96px;right:36px;top:${112 + k * 118}px;height:108px;display:flex;align-items:center;gap:24px;border-bottom:2px solid #e3e9de">
      <div style="flex:none;width:48px;height:48px;border:4.5px solid ${C.sage};border-radius:10px;background:#f1f6ee"></div>
      <div style="font-size:30px;line-height:1.22;font-weight:500;color:${C.ink};max-width:540px">${esc(t)}</div></div>`).join("");
  return `
    <div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(100deg,#d8dfe0 0%,#f2f5f5 20%,#e7ecec 52%,#f0f3f3 74%,#d4dbdc 100%)")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, 982, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.18) 0 2px,rgba(0,0,0,.015) 2px 6px)")}"></div>
    <div style="${abs(26, 420, 34, 640, "border-radius:17px;background:linear-gradient(90deg,#8d959a,#eef1f2 45%,#9aa2a7);box-shadow:4px 8px 14px rgba(40,50,55,.35)")}"></div>
    <div style="${abs(60, 452, 30, 14, "background:#8a9298;border-radius:3px")}"></div><div style="${abs(60, 1012, 30, 14, "background:#8a9298;border-radius:3px")}"></div>
    <div style="${abs(0, 1290, 1000, 8, "background:linear-gradient(#aab3b6,#7f898d)")}"></div><div style="${abs(0, 1298, 1000, 60, "background:linear-gradient(#e6ebec,#cdd4d6)")}"></div>
    <div style="${abs(130, 408, 800, 852, "transform:rotate(-1deg);background:#fffdf8;border-radius:5px;box-shadow:0 2px 3px rgba(30,40,40,.25),0 22px 40px rgba(30,40,40,.38);overflow:hidden")}">
      ${[130, 420, 710].map((yy) => `<div style="${abs(34, yy, 40, 40, "border-radius:50%;background:#dfe5e6;box-shadow:inset 0 3px 5px rgba(0,0,0,.35)")}"></div>`).join("")}
      <div style="${abs(0, 0, 800, 16, `background:${C.sage}`)}"></div>
      <div class="serif" style="${abs(110, 40, 660, 60)};font-size:40px;font-weight:600;letter-spacing:-.01em;color:${C.sageDeep}">Appliance Warranty Tracker</div>
      ${rowHtml}
    </div>
    ${heater}${clip}
    ${magnet({ x: 168, y: 430, r: 24, color: C.sage })}${magnet({ x: 848, y: 408, r: 25, color: C.butter })}${magnet({ x: 214, y: 1236, r: 25, color: "#e7e3d8" })}
    <div style="${abs(836, 1196, 118, 118, `border-radius:50%;background:radial-gradient(circle at 36% 30%,#fff8 0,transparent 36%),${C.sageDeep};box-shadow:0 4px 5px rgba(0,0,0,.3),0 14px 18px rgba(30,40,40,.35)`)}"><div style="position:absolute;inset:14px;border-radius:50%;background:#f7f4ea"></div><div style="position:absolute;left:55px;top:26px;width:6px;height:36px;background:${C.sageDeep};border-radius:3px"></div><div style="position:absolute;left:58px;top:56px;width:32px;height:6px;background:${C.sageDeep};border-radius:3px;transform:rotate(-30deg);transform-origin:left"></div></div>`;
}

/* =============================================================
   #20  Manufacturer's Warranty vs Home Warranty Plan: two hanging cards
   ============================================================= */
function pin20() {
  const [lt, ll] = split(items(20)[0]);
  const [rt, rl] = split(items(20)[1]);
  const L = ll.split("; "), R = rl.split("; ");
  const beadboard = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:repeating-linear-gradient(90deg,#9db08a 0 78px,#6f8560 78px 82px,#b3c4a0 82px 84px)")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(ellipse at 28% 12%,rgba(255,255,255,.28),transparent 60%),linear-gradient(transparent 60%,rgba(20,35,20,.28))")}"></div>`;
  const lines = (arr) => arr.map((t) => `<div style="display:flex;gap:14px;align-items:flex-start;padding:13px 0;border-top:2px dashed rgba(26,36,32,.22)"><div style="flex:none;margin-top:3px">${icon("check-circle", { size: 28, color: C.sageDeep, weight: "fill" })}</div><div style="font-size:26px;line-height:1.24;font-weight:500">${esc(t)}</div></div>`).join("");
  const sys = ["fan", "drop", "flame", "lightning"].map((n) => `<div style="width:60px;height:60px;border-radius:14px;background:#fffaf0;display:grid;place-items:center;box-shadow:0 3px 5px rgba(40,25,8,.25)">${icon(n, { size: 36, color: C.sageDeep, weight: "duotone" })}</div>`).join("");
  const leftArt = `<div style="height:200px;position:relative;margin:4px 0 14px">
      <div style="${abs(24, 34, 140, 166, "border-radius:14px;background:linear-gradient(90deg,#f6f9f9,#d6dddf);box-shadow:0 8px 14px rgba(20,35,25,.3);border:2px solid #aab3b6")}"><div style="${abs(0, 52, 140, 3, "background:#98a2a6")}"></div><div style="${abs(14, 14, 7, 26, "background:#8a9296;border-radius:3px")}"></div><div style="${abs(14, 70, 7, 54, "background:#8a9296;border-radius:3px")}"></div></div>
      <div style="${abs(184, 24, 150, 176, "transform:rotate(5deg);background:#fffdf6;box-shadow:0 8px 14px rgba(20,35,25,.3);clip-path:polygon(0 0,100% 0,100% 94%,92% 100%,84% 94%,76% 100%,68% 94%,60% 100%,52% 94%,44% 100%,36% 94%,28% 100%,20% 94%,12% 100%,6% 94%,0 100%)")}">
        <div style="${abs(18, 20, 114, 8, "background:#cfd2c4;border-radius:4px")}"></div><div style="${abs(18, 44, 90, 8, "background:#d9dccf;border-radius:4px")}"></div><div style="${abs(18, 68, 102, 8, "background:#d9dccf;border-radius:4px")}"></div><div style="${abs(18, 92, 70, 8, "background:#d9dccf;border-radius:4px")}"></div><div style="${abs(18, 124, 114, 12, `background:${C.sage};border-radius:4px;opacity:.85`)}"></div></div></div>`;
  const rightArt = `<div style="height:200px;position:relative;margin:4px 0 14px;display:flex;align-items:flex-end;gap:16px">
      <svg width="196" height="190" viewBox="0 0 196 190" aria-hidden="true" style="flex:none;filter:drop-shadow(0 8px 10px rgba(40,25,8,.3))"><path d="M10 92 L98 10 L186 92 V184 H10 Z" fill="#fbf4e4" stroke="${C.sageDeep}" stroke-width="6" stroke-linejoin="round"/><path d="M0 96 L98 6 L196 96" fill="none" stroke="${C.sageDeep}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><rect x="78" y="116" width="40" height="68" rx="4" fill="${C.sage}"/></svg>
      <div style="display:grid;grid-template-columns:60px 60px;gap:12px;padding-bottom:8px">${sys}</div></div>`;
  const hang = (cx) => `<svg style="${abs(cx - 190, 456, 380, 90)}" viewBox="0 0 380 90" aria-hidden="true"><path d="M190 4 L30 84 M190 4 L350 84" stroke="#f3ede0" stroke-width="3" fill="none"/></svg>`;
  const cardBox = (x, y, w, bg, tilt, body) => `<div style="${abs(x, y, w, 640, `transform:rotate(${tilt}deg);transform-origin:50% 0;background:${bg};border-radius:22px;box-shadow:0 3px 4px rgba(20,30,15,.3),0 26px 40px rgba(20,30,15,.45);padding:28px 30px`)}">${body}</div>`;
  const hole = `<div style="position:absolute;top:12px;width:20px;height:20px;border-radius:50%;background:#7d8f6e;box-shadow:inset 0 2px 3px rgba(0,0,0,.45)"></div>`;
  const L1 = cardBox(48, 520, 420, "linear-gradient(#e2eddb,#cfdfc6)", -1.4,
    `<div style="position:absolute;left:30px;top:12px;width:20px;height:20px;border-radius:50%;background:#7d8f6e;box-shadow:inset 0 2px 3px rgba(0,0,0,.45)"></div>
     <div style="height:20px"></div><div class="serif" style="font-size:40px;line-height:1.02;font-weight:600;color:#14301f;margin-bottom:12px">${esc(lt)}</div>${leftArt}${lines(L)}`);
  const R1 = cardBox(532, 520, 420, "linear-gradient(#dcbd8b,#c8a679)", 1.2,
    `<div style="position:absolute;right:30px;top:12px;width:20px;height:20px;border-radius:50%;background:#8c6a38;box-shadow:inset 0 2px 3px rgba(0,0,0,.45)"></div>
     <div style="height:20px"></div><div class="serif" style="font-size:40px;line-height:1.02;font-weight:600;color:#2b2010;margin-bottom:12px">${esc(rt)}</div>${rightArt}${lines(R)}`);
  return `${beadboard}
    ${rail({ x: 20, y: 396, w: 960, hooks: [210, 790] })}
    <svg style="${abs(0, 444, 1000, 110)}" viewBox="0 0 1000 110" aria-hidden="true"><path d="M240 36 L78 112 M240 36 L402 112" stroke="#f3ede0" stroke-width="3.5" fill="none"/><path d="M820 36 L572 112 M820 36 L932 112" stroke="#f3ede0" stroke-width="3.5" fill="none"/></svg>
    ${L1}${R1}
    <div style="${abs(452, 700, 96, 96, `border-radius:50%;background:${C.sageDeep};color:#fff;display:grid;place-items:center;font:600 38px Newsreader,Georgia,serif;box-shadow:0 8px 14px rgba(20,35,20,.45);border:5px solid #f3ede0;z-index:3`)}">vs</div>
    <div style="${abs(0, 1318, 1000, 40, "background:linear-gradient(#cda26c,#a97d47);box-shadow:0 -6px 12px rgba(30,20,8,.3)")}"></div>
    ${spoonJar({ x: 800, y: 1198, s: 0.5, jar: "#d9c08e", band: "#7a9a85" })}`;
}

/* =============================================================
   #22  Does Your Furnace Warranty Require Annual Service?
   ============================================================= */
function pin22() {
  const [i1, i2] = items(22);
  const bars = (arr, color = "#cfd5c8") => arr.map((w) => `<div style="height:9px;width:${w}%;background:${color};border-radius:5px;margin:0 0 15px"></div>`).join("");
  const furnace = `<svg style="${abs(30, 110, 220, 220)}" viewBox="0 0 220 220" fill="none" stroke="${C.sageDeep}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="34" y="52" width="150" height="150" rx="8" fill="#eef2ea"/><rect x="50" y="70" width="86" height="112" rx="4"/><path d="M60 88 H126 M60 104 H126 M60 120 H126 M60 136 H126 M60 152 H126 M60 168 H126"/>
    <rect x="148" y="76" width="22" height="34" rx="3"/><circle cx="159" cy="140" r="9"/><path d="M92 52 V20 M92 20 H164 V52" /><path d="M60 202 V212 M158 202 V212"/></svg>`;
  const dates = [0, 1, 2, 3].map((k) => `<div style="display:flex;align-items:center;gap:14px;margin-top:${k ? 18 : 0}px"><div style="flex:none">${icon("calendar-blank", { size: 34, color: C.sage, weight: "regular" })}</div><div style="flex:1;border-bottom:3px solid #b7c4b0;height:30px"></div></div>`).join("");
  const booklet = `<div style="${abs(40, 566, 920, 470, "transform:rotate(-1deg);display:flex;filter:drop-shadow(0 22px 28px rgba(0,0,0,.5))")}">
      <div style="flex:1;background:linear-gradient(90deg,#fbfaf4 0%,#f1efe4 96%,#d9d6c6 100%);border-radius:8px 0 0 8px;position:relative;padding:34px 38px">
        <div style="${abs(0, 0, 460, 12, `background:${C.sage};border-radius:8px 0 0 0`)}"></div>
        ${furnace}
        <div style="${abs(244, 76, 176, 220)}"><div style="font-size:26px;font-weight:600;color:${C.sageDeep};letter-spacing:.04em;margin-bottom:22px;line-height:1.15">Service dates</div>${dates}</div>
      </div>
      <div style="flex:1;background:linear-gradient(90deg,#d9d6c6 0%,#f2f0e5 5%,#fbfaf4 100%);border-radius:0 8px 8px 0;position:relative;padding:48px 44px 0 52px">
        <div style="height:16px;width:46%;background:#a9b6a3;border-radius:6px;margin-bottom:26px"></div>
        ${bars([100, 94, 100, 62])}
        <div style="position:relative;margin:30px -14px 30px -14px;padding:14px 14px 1px;background:linear-gradient(100deg,rgba(214,150,40,.55),rgba(214,150,40,.4));border-radius:6px 14px 8px 12px;box-shadow:0 0 0 2px rgba(138,90,17,.35) inset">${bars([100, 96, 100, 58], "#9a8a63")}</div>
        ${bars([100, 90, 76], "#cfd5c8")}
        <div class="serif" style="${abs(34, 398, 70, 52)};font-size:40px;font-weight:500;color:#8a8a7a;text-align:left">4</div>
      </div></div>
    <div class="hand" style="${abs(640, 896, 300, 60, `transform:rotate(-4deg);background:${C.butter};box-shadow:0 8px 14px rgba(0,0,0,.4);border-radius:3px;display:grid;place-items:center;font-size:40px;font-weight:700;color:#3a2a08;z-index:2`)}">Check Page Four</div>`;
  const slip = (x, y, w, tilt, text, ic) => `<div style="${abs(x, y, w, 232, `transform:rotate(${tilt}deg);background:#f5f1e4;border-radius:6px;box-shadow:0 14px 22px rgba(0,0,0,.45);padding:22px 26px 20px;display:flex;flex-direction:column;gap:12px`)}"><div>${icon(ic, { size: 40, color: ic === "file-text" ? C.sageDeep : C.sageDeep, weight: "duotone" })}</div><div style="font-size:26px;line-height:1.28;font-weight:500;color:${C.ink}">${esc(text)}</div></div>`;
  return `${tiles({ h: 220, tile: "#46644f", tile2: "#385443", grout: "#2c4235", shade: 0.4 })}
    <svg style="${abs(0, 560, 1000, 800)}" viewBox="0 0 1000 800" aria-hidden="true"><defs><linearGradient id="st" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4a42"/><stop offset="1" stop-color="#27342d"/></linearGradient></defs><rect width="1000" height="800" fill="url(#st)"/>
      ${Array.from({ length: 260 }, (_, k) => { const s = (k * 9301 + 49297) % 233280; return `<circle cx="${(s * 7) % 1000}" cy="${(s * 13) % 800}" r="${1 + (s % 3) * 0.6}" fill="${s % 2 ? "#6a7d72" : "#1c2721"}" opacity=".5"/>`; }).join("")}</svg>
    <div style="${abs(0, 556, 1000, 12, "background:linear-gradient(#a8b6ac,#6b7a70);box-shadow:0 6px 10px rgba(0,0,0,.45)")}"></div>
    ${rail({ x: 520, y: 384, w: 440, hooks: [90, 330] })}
    ${towel({ x: 570, y: 420, w: 200, h: 170, base: "#f6f3ea", stripe: C.sage, tilt: 1.5 })}
    ${booklet}
    ${slip(40, 1070, 450, -1, i1, "wrench")}${slip(520, 1062, 440, 1, i2, "file-text")}`;
}

/* =============================================================
   #24  How to Make an Appliance Warranty Claim: oak counter
   ============================================================= */
function pin24() {
  const steps = items(24);
  const H = 205, G = 24, Y0 = 404;
  const card = (t, k) => `<div style="${abs(34, Y0 + k * (H + G), 596, H, `transform:rotate(${[-0.7, 0.5, -0.4, 0.6][k]}deg);background:linear-gradient(#e3c99c,#d2b384);border-radius:18px;box-shadow:0 3px 4px rgba(40,25,8,.3),0 18px 28px rgba(40,25,8,.4);display:flex;align-items:center;gap:22px;padding:0 28px 0 24px`)}">
      <div class="serif" style="flex:none;width:76px;height:76px;border-radius:50%;background:${C.sage};color:#fff;display:grid;place-items:center;font-size:46px;font-weight:600;box-shadow:0 4px 8px rgba(20,35,25,.35)">${k + 1}</div>
      <div style="font-size:30px;line-height:1.24;font-weight:500;color:#231c10">${esc(t)}</div></div>`;
  const phone = `<div style="${abs(676, 424, 214, 400, "transform:rotate(7deg);border-radius:34px;background:linear-gradient(135deg,#2a2e33,#14171a);box-shadow:0 4px 5px rgba(0,0,0,.4),0 28px 36px rgba(30,15,3,.55);padding:10px")}">
      <div style="width:100%;height:100%;border-radius:26px;background:linear-gradient(#244a35,#17301f);display:grid;place-items:center;position:relative"><div style="width:96px;height:96px;border-radius:50%;background:${C.sage};display:grid;place-items:center">${icon("phone-call", { size: 56, color: "#fff", weight: "fill" })}</div><div style="${abs(84, 14, 46, 8, "background:#0c0f10;border-radius:4px")}"></div></div></div>`;
  const receipt = `<div style="${abs(742, 726, 206, 330, "transform:rotate(-5deg);background:#fffdf6;box-shadow:0 18px 26px rgba(30,15,3,.5);clip-path:polygon(0 0,100% 0,100% 96%,93% 100%,86% 96%,79% 100%,72% 96%,65% 100%,58% 96%,51% 100%,44% 96%,37% 100%,30% 96%,23% 100%,16% 96%,9% 100%,0 96%)")}">
      <div style="${abs(24, 28, 158, 12, "background:#bfc4b6;border-radius:5px")}"></div>
      ${[70, 104, 138, 172, 206].map((yy, k) => `<div style="${abs(24, yy, k % 2 ? 110 : 140, 8, "background:#d9dccf;border-radius:4px")}"></div>`).join("")}
      <div style="${abs(24, 252, 158, 14, `background:${C.sage};opacity:.85;border-radius:4px`)}"></div></div>`;
  const wcard = `<div style="${abs(640, 1012, 290, 184, "transform:rotate(4deg);border-radius:18px;background:linear-gradient(135deg,#6f9a7c,#3f6a4d);box-shadow:0 4px 5px rgba(0,0,0,.3),0 20px 28px rgba(30,15,3,.5);display:grid;place-items:center")}">${icon("shield-check", { size: 100, color: "#f3f1e4", weight: "duotone" })}<div style="${abs(22, 24, 70, 50, "border-radius:8px;background:linear-gradient(135deg,#f0d58a,#d9962b)")}"></div></div>`;
  return `${desk({ top: SCENE_TOP, height: 982, planks: 8, base: "#d4a36a", dark: "#bd8d54", seed: 11 })}
    ${steps.map(card).join("")}
    ${receipt}${phone}${wcard}
    ${pencil({ x: 380, y: 1304, len: 380, rot: -3 })}`;
}

/* =============================================================
   #26  Something Broke Today: dishwasher door open, sticky note
   ============================================================= */
function pin26() {
  const opts = items(26);
  const icons = ["wrench", "phone", "receipt"];
  const dishes = (cx, y0, n) => Array.from({ length: n }, (_, k) => `<ellipse cx="${cx + k * 34}" cy="${y0}" rx="9" ry="44" fill="#eef1ee"/><ellipse cx="${cx + k * 34 + 3}" cy="${y0}" rx="5" ry="40" fill="#cfd6d1"/>`).join("");
  const glass = (cx, cy) => `<path d="M${cx - 14} ${cy - 34} h28 l-5 58 q-9 6 -18 0 Z" fill="#dff0f5" opacity=".75" stroke="#fff" stroke-opacity=".6"/>`;
  const dw = `<svg style="${abs(0, 590, 1000, 540)}" viewBox="0 0 1000 540" aria-hidden="true"><defs>
      <linearGradient id="ss" x1="0" x2="1"><stop offset="0" stop-color="#b7bec2"/><stop offset=".3" stop-color="#e9edef"/><stop offset=".7" stop-color="#d3d9dc"/><stop offset="1" stop-color="#aab2b7"/></linearGradient>
      <linearGradient id="tb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a747a"/><stop offset="1" stop-color="#3f484d"/></linearGradient>
      <linearGradient id="cab" x1="0" x2="1"><stop offset="0" stop-color="#b3c8ae"/><stop offset="1" stop-color="#93ac90"/></linearGradient></defs>
    <rect x="0" y="0" width="150" height="540" fill="url(#cab)"/><rect x="850" y="0" width="150" height="540" fill="url(#cab)"/>
    <rect x="14" y="28" width="122" height="470" rx="6" fill="none" stroke="#7f9a7c" stroke-width="3"/><rect x="864" y="28" width="122" height="470" rx="6" fill="none" stroke="#7f9a7c" stroke-width="3"/>
    <circle cx="118" cy="60" r="8" fill="#5b4122"/><circle cx="882" cy="60" r="8" fill="#5b4122"/>
    <rect x="150" y="0" width="700" height="540" fill="#1f282c"/>
    <rect x="162" y="8" width="676" height="38" rx="6" fill="url(#ss)"/>
    <rect x="178" y="48" width="644" height="352" rx="10" fill="url(#tb)"/>
    <rect x="178" y="48" width="644" height="352" rx="10" fill="none" stroke="#8d979c" stroke-width="3"/>
    <!-- upper rack: glasses and bowls -->
    <rect x="206" y="196" width="588" height="8" rx="4" fill="#cfd6d9"/><g stroke="#cfd6d9" stroke-width="3"><path d="M218 204 V232 M310 204 V232 M402 204 V232 M494 204 V232 M586 204 V232 M678 204 V232 M770 204 V232"/></g>
    ${[250, 330, 410, 490, 570].map((cx) => glass(cx, 150)).join("")}
    <path d="M620 160 q50 62 100 0 z" fill="#f2efe4"/><path d="M730 160 q40 54 80 0 z" fill="#c9d8cd"/>
    <!-- lower rack: plates on edge -->
    <rect x="206" y="352" width="588" height="8" rx="4" fill="#cfd6d9"/>
    ${dishes(232, 306, 8)}<ellipse cx="560" cy="306" rx="10" ry="42" fill="#c9d8cd"/><ellipse cx="594" cy="306" rx="10" ry="42" fill="#c9d8cd"/><ellipse cx="628" cy="306" rx="10" ry="42" fill="#eef1ee"/>
    <!-- the lowered door seen from the front -->
    <path d="M178 400 H822 L896 524 H104 Z" fill="url(#ss)"/><path d="M178 400 H822 L828 412 H172 Z" fill="#8d979c"/>
    <path d="M214 424 H786 L840 506 H160 Z" fill="#b9c1c5" opacity=".7"/>
    </svg>`;
  const note = `<div style="${abs(690, 868, 240, 230, `transform:rotate(4deg);background:linear-gradient(#f6e29a,#efd373);box-shadow:0 3px 4px rgba(0,0,0,.3),0 18px 24px rgba(40,25,8,.4);padding:30px 24px;display:flex;flex-direction:column;justify-content:center`)}">
      <div class="hand" style="font-size:50px;font-weight:700;line-height:.98;color:#2d2a1c">Warranty expiration date</div><div style="margin-top:20px;border-bottom:4px solid #2d2a1c;opacity:.7;transform:rotate(-1.5deg)"></div></div>`;
  const CW = [[44, 258], [316, 296], [626, 334]];
  const chip = (t, k) => `<div style="${abs(CW[k][0], 1156, CW[k][1], 148, `background:linear-gradient(${C.sage},${C.sageDeep});border-radius:26px;box-shadow:0 4px 5px rgba(20,35,25,.3),0 16px 22px rgba(20,35,25,.35);display:flex;align-items:center;gap:14px;padding:0 18px;color:#fff`)}">
      <div style="flex:none;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.18);display:grid;place-items:center">${icon(icons[k], { size: 34, color: "#fff", weight: "bold" })}</div>
      <div style="font-size:28px;line-height:1.16;font-weight:600">${esc(t)}</div></div>`;
  return `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(ellipse at 25% 10%,#f9f3df,#efe4c4 70%,#e3d4ab)")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, 230, "background:repeating-linear-gradient(90deg,rgba(138,120,70,.10) 0 2px,transparent 2px 70px)")}"></div>
    ${rail({ x: 40, y: 392, w: 520, hooks: [110, 330, 470] })}
    ${towel({ x: 60, y: 432, w: 158, h: 150, base: "#f6f3ea", stripe: C.sage, tilt: -1.5, bands: 3 })}
    ${towel({ x: 290, y: 432, w: 150, h: 128, base: "#e4d3ad", stripe: "#7a5a2a", tilt: 1.2 })}
    ${spoonJar({ x: 780, y: 438, s: 0.56, jar: "#8fae96" })}
    <div style="${abs(0, 566, 1000, 26, "background:linear-gradient(#d9ab74,#b78647);box-shadow:0 8px 12px rgba(30,20,8,.35)")}"></div>
    ${dw}${note}${opts.map(chip).join("")}`;
}

/* ---------- the pins ---------- */
const mk = (n, scene, paper, extraCss = "") => printable({ n, scene, paper, extraCss });
export const pins = [
  mk(16, pin16(), "#e5ede1"),
  mk(18, pin18(), "#e8eeef"),
  mk(20, pin20(), "#f1ead8", ".top h1{font-size:70px}"),
  mk(22, pin22(), "#dde5d6"),
  mk(24, pin24(), "#f0e2c8"),
  mk(26, pin26(), "#efe6cf"),
];
