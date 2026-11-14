/**
 * Group A: app promos for Home Base. Pins #1, #5, #9, #13, #17, #21, #59.
 * Every screen is a real capture, cropped and placed, never redrawn. Words are the
 * bank's own (display lines are cuts of each headline; feature rows are cuts of
 * the idea's items / sub / proof, or labels real on the screen shown). The phones
 * are placed here (same geometry as promo()) so a crop can stop above the
 * Next.js dev badge and the "Start" bar of the three older screens and so an
 * "Example" tag can sit beside a demo figure.
 */
import { promo } from "../kit/promo.mjs";
import { phone } from "../kit/phone.mjs";
import { screen, asset } from "../kit/assets.mjs";
import { mug, pencil } from "../kit/paper.mjs";
import { C } from "../kit/bank.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const APP_BG = "#f4f2ec"; // the app's own background in the captures
const SOFT = "drop-shadow(0 14px 10px rgba(2,12,8,.5))";

/**
 * A phone placed exactly as promo() places a `screen`, with two extras: `cut` (capture y,
 * in 390-wide units) after which the screen continues in the app's own background colour,
 * so the dev badge and the Start bar never show, and `tag` ({ y, x }) for an Example tag.
 */
function place({ src, y0, cut, width = 450, tilt = 0, lines, size, headSize, tag, xShift = 0 }) {
  const longest = Math.max(...lines.map((l) => l.length));
  const hs = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  const headH = Math.round(lines.length * hs * 1.04);
  const k = width / 390;
  const top = 216 + headH + 40;
  const y1 = y0 + Math.ceil((1420 - top - 61) / k);
  const lean = Math.round(Math.sin((Math.abs(tilt) * Math.PI) / 180) * (1400 - top));
  const x = Math.round(1000 - (width + 30) + (tilt < 0 ? lean * 0.8 : -lean * 0.45)) + xShift;
  let html = phone({ src, y0, y1, width, tilt, x, y: top, appBg: APP_BG });
  let extra = "";
  if (cut != null) extra += `<div style="position:absolute;left:0;right:0;top:${Math.round((cut - y0) * k)}px;bottom:0;background:${APP_BG}"></div>`;
  if (tag) extra += `<div class="example" style="position:absolute;left:${Math.round(tag.x * k)}px;top:${Math.round((tag.y - y0) * k)}px;font-size:24px;padding:5px 12px;color:#4a4f49;background:${APP_BG};border-color:#8b9189">Example</div>`;
  if (extra) html = html.replace('alt=""></div>', `alt="">${extra}</div>`);
  return html;
}

/* ---------------------------------------------------------------- props */

/** A maple leaf, flat, with veins and a stem. */
function leaf({ x, y, s = 1, rot = 0, fill = "#b4532a" }) {
  return `<svg style="${abs(x, y, 110 * s, 120 * s, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 110 120" aria-hidden="true">
    <path d="M55 6 L64 28 L80 20 L75 43 L100 38 L86 58 L106 68 L80 74 L84 92 L64 84 L60 104 L50 104 L46 84 L26 92 L30 74 L4 68 L24 58 L10 38 L35 43 L30 20 L46 28 Z" fill="${fill}"/>
    <path d="M55 6 L64 28 L80 20 L75 43 L100 38 L86 58 L56 62Z" fill="#fff" opacity=".12"/>
    <g stroke="#000" stroke-opacity=".28" stroke-width="2" fill="none" stroke-linecap="round"><path d="M55 104 V30"/><path d="M55 80 L24 66"/><path d="M55 80 L86 66"/><path d="M55 60 L30 42"/><path d="M55 60 L80 42"/></g>
    <path d="M55 104 L55 118" stroke="#6b4a22" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** A small drift of fall leaves. */
function leafPile({ x, y }) {
  const L = [
    [0, 70, 1.0, -20, "#a8481f"], [90, 40, 1.15, 14, "#d9962b"], [190, 80, 1.0, 38, "#8a5a11"], [270, 30, 1.2, -8, "#b4532a"],
    [60, 120, 0.9, 52, "#d9962b"], [160, 130, 1.1, -34, "#a8481f"], [250, 120, 0.95, 20, "#c87a22"], [330, 90, 0.85, -48, "#8a5a11"],
  ];
  return L.map(([dx, dy, s, r, f]) => leaf({ x: x + dx, y: y + dy, s, rot: r, fill: f })).join("");
}

/** A pleated furnace filter in a kraft frame, tilted. Nothing is printed on it. */
function furnaceFilter({ x, y, w = 300, h = 380, rot = -8 }) {
  const pleats = [];
  const n = 18;
  for (let k = 0; k < n; k++) pleats.push(`<path d="M${24 + k * ((w - 48) / n)} 24 L${24 + (k + 0.5) * ((w - 48) / n)} ${h - 24}" stroke="#a9a79c" stroke-width="2" opacity=".75"/><rect x="${24 + k * ((w - 48) / n)}" y="24" width="${(w - 48) / n / 2}" height="${h - 48}" fill="#fff" opacity="${k % 2 ? 0.18 : 0.0}"/>`);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="#c8a679"/><rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="none" stroke="#7d5f35" stroke-opacity=".5" stroke-width="3"/>
    <rect x="22" y="22" width="${w - 44}" height="${h - 44}" fill="#eceae0"/>${pleats.join("")}
    <path d="M22 22 H${w - 22} V${h - 22} H22Z" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="6" fill="#fff" opacity=".08"/></svg>`;
}

/** A tarnished brass-and-silver pair of keys on a ring. */
function keysOnRing({ x, y, rot = -12, s = 1 }) {
  const key = (dx, col, len, r) => `<g transform="translate(${dx} 70) rotate(${r})"><circle cx="0" cy="0" r="26" fill="${col}"/><circle cx="0" cy="-2" r="11" fill="#2a2f2b" opacity=".85"/><rect x="-9" y="22" width="18" height="${len}" rx="5" fill="${col}"/><rect x="9" y="${len - 4}" width="16" height="9" fill="${col}"/><rect x="9" y="${len + 12}" width="11" height="8" fill="${col}"/><rect x="-9" y="22" width="6" height="${len}" fill="#fff" opacity=".28"/></g>`;
  return `<svg style="${abs(x, y, 220 * s, 280 * s, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 220 280" aria-hidden="true">
    <circle cx="106" cy="46" r="40" fill="none" stroke="#8c9296" stroke-width="9"/><circle cx="106" cy="46" r="40" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" transform="translate(-2 -2)"/>
    ${key(66, "#d9b25a", 120, 14)}${key(150, "#c9ccd0", 100, -10)}</svg>`;
}

/** A closed manila lease folder with a tab. Blank. */
function leaseFolder({ x, y, w = 330, rot = 7 }) {
  const h = w * 0.72;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 330 238" aria-hidden="true">
    <path d="M6 22 Q6 8 20 8 H112 L134 30 H310 Q324 30 324 44 V220 Q324 232 312 232 H18 Q6 232 6 220Z" fill="#b99358"/>
    <path d="M6 54 Q6 42 18 42 H312 Q324 42 324 54 V220 Q324 232 312 232 H18 Q6 232 6 220Z" fill="#d6b176"/>
    <path d="M6 54 Q6 42 18 42 H312 Q324 42 324 54 V70 H6Z" fill="#fff" opacity=".18"/>
    <rect x="30" y="108" width="140" height="10" rx="5" fill="#8c6b36" opacity=".28"/><rect x="30" y="132" width="96" height="10" rx="5" fill="#8c6b36" opacity=".22"/></svg>`;
}

/** A plain microfibre cloth, loosely folded, with a stitched hem. Used to rest on the foot of the phone. */
function cloth({ x, y, w = 620, h = 190, rot = -3 }) {
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 12px rgba(2,12,8,.55))`)}" viewBox="0 0 620 190" aria-hidden="true">
    <path d="M10 40 Q60 8 150 22 T330 16 T500 26 T610 20 L604 170 Q540 186 440 172 T250 178 T20 168Z" fill="#e8d27a"/>
    <path d="M10 40 Q60 8 150 22 T330 16 T500 26 T610 20 L608 70 Q500 52 330 62 T10 76Z" fill="#fff" opacity=".22"/>
    <path d="M150 22 Q170 90 140 176" stroke="#8a6f1c" stroke-opacity=".28" stroke-width="5" fill="none"/>
    <path d="M360 18 Q382 92 350 174" stroke="#8a6f1c" stroke-opacity=".22" stroke-width="5" fill="none"/>
    <path d="M24 154 Q200 168 330 160 T598 156" stroke="#8a6f1c" stroke-opacity=".55" stroke-width="3" stroke-dasharray="9 7" fill="none"/></svg>`;
}

/** An open-end wrench, flat steel, jaws at both ends. */
function wrench({ x, y, len = 420, rot = -24 }) {
  return `<svg style="${abs(x, y, len, 110, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 420 110" aria-hidden="true">
    <defs><mask id="wm"><rect width="420" height="110" fill="#fff"/><rect x="0" y="39" width="66" height="32" fill="#000"/><rect x="364" y="43" width="60" height="24" fill="#000"/></mask></defs>
    <g mask="url(#wm)"><rect x="70" y="42" width="290" height="26" rx="6" fill="#a9b1b6"/><circle cx="64" cy="55" r="46" fill="#a9b1b6"/><circle cx="364" cy="55" r="36" fill="#a9b1b6"/>
    <rect x="70" y="42" width="290" height="8" fill="#fff" opacity=".4"/><circle cx="64" cy="55" r="46" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/></g>
    <circle cx="214" cy="55" r="7" fill="#6c757b"/></svg>`;
}

/** A paper receipt with a torn edge. Rules only; no words, no figures. */
function receipt({ x, y, w = 190, h = 330, rot = 8 }) {
  const lines = [50, 82, 114, 146, 190, 222].map((ly, k) => `<rect x="26" y="${ly}" width="${k === 3 ? 90 : k === 4 ? 70 : 136}" height="9" rx="4" fill="#c7c3b8"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 190 330" aria-hidden="true">
    <path d="M8 8 H182 V310 L166 298 L150 310 L134 298 L118 310 L102 298 L86 310 L70 298 L54 310 L38 298 L22 310 L8 300Z" fill="#fbf9f1"/>
    <path d="M8 8 H182 V40 H8Z" fill="#000" opacity=".03"/>${lines}</svg>`;
}

/** A pair of canvas garden gloves, palms down, with green cuffs. */
function gloves({ x, y, s = 1, rot = -10 }) {
  const glove = (dx, flip) => `<g transform="translate(${dx} 0) ${flip ? "scale(-1 1) translate(-120 0)" : ""}">
    <rect x="14" y="196" width="92" height="52" rx="10" fill="#4f7a5c"/><rect x="14" y="196" width="92" height="12" rx="6" fill="#fff" opacity=".22"/>
    <rect x="18" y="84" width="84" height="120" rx="30" fill="#cfae74"/>
    <rect x="18" y="14" width="19" height="92" rx="9.5" fill="#cfae74" transform="rotate(-5 28 100)"/><rect x="40" y="2" width="19" height="104" rx="9.5" fill="#cfae74" transform="rotate(-1 50 100)"/>
    <rect x="62" y="6" width="19" height="100" rx="9.5" fill="#cfae74" transform="rotate(3 72 100)"/><rect x="83" y="26" width="18" height="84" rx="9" fill="#cfae74" transform="rotate(9 92 100)"/>
    <rect x="-14" y="96" width="19" height="78" rx="9.5" fill="#cfae74" transform="rotate(-42 4 150)"/>
    <g stroke="#7d5f35" stroke-opacity=".4" stroke-width="2.5" fill="none" stroke-linecap="round"><path d="M40 108 V190"/><path d="M62 108 V190"/><path d="M84 108 V190"/><path d="M26 150 H96" stroke-dasharray="6 6"/></g>
    <rect x="18" y="84" width="84" height="26" rx="12" fill="#fff" opacity=".1"/></g>`;
  return `<svg style="${abs(x, y, 260 * s, 250 * s, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 260 250" aria-hidden="true">${glove(0, false)}${glove(136, true)}</svg>`;
}

/** A coiled garden hose with a brass nozzle. */
function hoseCoil({ x, y, size = 300 }) {
  const rings = [0, 1, 2, 3].map((k) => `<ellipse cx="150" cy="${112 + k * 3}" rx="${132 - k * 26}" ry="${74 - k * 15}" fill="none" stroke="#3f7a52" stroke-width="22"/><ellipse cx="150" cy="${108 + k * 3}" rx="${132 - k * 26}" ry="${74 - k * 15}" fill="none" stroke="#7fb78f" stroke-opacity=".55" stroke-width="5"/>`).join("");
  return `<svg style="${abs(x, y, size, size * 0.68, `filter:${SOFT}`)}" viewBox="0 0 300 204" aria-hidden="true">
    <ellipse cx="150" cy="120" rx="140" ry="82" fill="#000" opacity=".16"/>${rings}
    <path d="M276 124 q20 24 -4 46" fill="none" stroke="#3f7a52" stroke-width="20" stroke-linecap="round"/>
    <rect x="248" y="158" width="46" height="26" rx="6" fill="#c9962b" transform="rotate(-20 270 170)"/><rect x="286" y="162" width="14" height="22" rx="4" fill="#8a5a11" transform="rotate(-20 270 170)"/></svg>`;
}

/** A small saucer under the mug. */
function saucer({ x, y, w = 270 }) {
  return `<svg style="${abs(x, y, w, w * 0.4, "filter:drop-shadow(0 10px 8px rgba(2,12,8,.45))")}" viewBox="0 0 270 108" aria-hidden="true"><ellipse cx="135" cy="54" rx="130" ry="46" fill="#ece6da"/><ellipse cx="135" cy="50" rx="92" ry="28" fill="#d8d0c1"/></svg>`;
}

/* ---------------------------------------------------------------- pins */

// 1: the workspace screen below the cards: Coming up, Recently handled, "Everything else is under control."
const L1 = ["Home Maintenance", "App That Says So", "When Nothing", "Needs You"];
const P1 = promo({
  n: 1,
  tone: "plum",
  wave: 0,
  display: L1,
  highlight: ["App That Says So", "Needs You"],
  appTagline: "home maintenance app",
  features: [
    { icon: "warning-circle", label: "Wrong", text: "What needs you now" },
    { icon: "clock", label: "Coming up", text: "What is coming up" },
    { icon: "check-circle", label: "Handled", text: "What has recently been handled" },
    { icon: "house-line", label: "When there is nothing", text: "It says so" },
  ],
  phone: place({ src: screen("workspace"), y0: 902, width: 450, tilt: 7, lines: L1 }),
  prop: `${saucer({ x: 742, y: 1262, w: 230 })}${mug({ x: 770, y: 1180, size: 150 })}`,
});

// 5: the seasons screen, whole: Fall selected, October list.
const L5 = ["Seasonal Jobs", "in the Month", "They Belong"];
const P5 = promo({
  n: 5,
  tone: "deep",
  wave: 1,
  display: L5,
  highlight: ["Seasonal Jobs", "They Belong"],
  appTagline: "fall home maintenance checklist app",
  features: [
    { icon: "leaf", label: "Spring, Summer, Fall, Winter", text: "Seasonal work" },
    { icon: "calendar-check", label: "October", text: "Raised in the month it actually belongs to" },
    { icon: "fire", label: "Annual boiler service", text: "October" },
    { icon: "bell-ringing", label: "Test the smoke alarms", text: "October" },
  ],
  phone: place({ src: screen("seasons"), y0: 60, cut: 700, width: 470, tilt: -7, lines: L5, tag: { x: 16, y: 574 } }),
  prop: leafPile({ x: 50, y: 1090 }),
});

// 9: the history screen, three entries, with a wrench and a blank receipt.
const L9 = ["Who Did the Work,", "What They Did,", "What It Cost"];
const P9 = promo({
  n: 9,
  tone: "plum",
  wave: 2,
  display: L9,
  highlight: ["Who Did the Work,", "What It Cost"],
  appTagline: "home repair history log",
  features: [
    { icon: "wrench", label: "The work", text: "What was taken care of, when" },
    { icon: "user", label: "The person", text: "Who did it" },
    { icon: "coins", label: "The cost", text: "And what it cost" },
    { icon: "question", label: "Your home's memory", text: "So the question three years from now has an answer" },
  ],
  phone: place({ src: screen("history"), y0: 56, cut: 640, width: 480, tilt: 3, lines: L9, tag: { x: 16, y: 412 } }),
  prop: `${receipt({ x: 770, y: 1040, w: 200, rot: 10 })}${wrench({ x: 540, y: 1220, len: 420, rot: -14 })}`,
});

// 13: the Renting care list capture. The real list offers Lease and Renters insurance only.
const L13 = ["Renter Home App:", "It Stops Asking", "About the Roof"];
const P13 = promo({
  n: 13,
  tone: "berry",
  wave: 1,
  display: L13,
  highlight: ["It Stops Asking"],
  appTagline: "renter home maintenance tracker",
  features: [
    { icon: "calendar-x", label: "The notice deadline", text: "Decide before the notice deadline" },
    { icon: "arrows-clockwise", label: "Lease renews", text: "Lease, every year" },
    { icon: "shield-check", label: "Renters insurance", text: "Review before it renews, every year" },
    { icon: "check-square", label: "Untick anything that doesn't apply", text: "And change any of it later" },
  ],
  screen: { src: asset("renting-care-list.png"), y0: 0, y1: 474, width: 500, tilt: 5 },
  prop: `${leaseFolder({ x: 40, y: 1130, w: 330, rot: 6 })}${keysOnRing({ x: 300, y: 1100, rot: -14, s: 0.9 })}`,
});

// 17: the care list for Heating, cooling and air (area-care-list.png), the whole list.
const L17 = ["It Suggests the Care,", "You Untick What", "Does Not Apply"];
const P17 = promo({
  n: 17,
  tone: "deep",
  wave: 0,
  display: L17,
  highlight: ["You Untick What"],
  appTagline: "home maintenance schedule app",
  features: [
    { icon: "house-line", label: "Tell it whether you own or rent", text: "" },
    { icon: "hand-tap", label: "Tap what your home has", text: "It suggests the care each one usually needs" },
    { icon: "check-square", label: "Untick anything that does not apply", text: "And change any of it later" },
    { icon: "seal-check", label: "Nothing is created", text: "Without you confirming it" },
  ],
  screen: { src: asset("area-care-list.png"), y0: 8, y1: 780, width: 460, tilt: -5 },
  prop: furnaceFilter({ x: 60, y: 1020, w: 260, h: 310, rot: -9 }),
  extraCss: ".feat span:empty{display:none}",
});

// 21: the real condenser-coils card; the phone's foot rests under a cloth.
const L21 = ["Act on a Job", "and It Records", "Who Did It and", "What It Cost"];
const P21 = promo({
  n: 21,
  tone: "plum",
  wave: 1,
  display: L21,
  highlight: ["and It Records", "What It Cost"],
  appTagline: "home maintenance log app",
  features: [
    { icon: "hand-pointing", label: "Act on a job or push it back", text: "Action, or Snooze" },
    { icon: "user", label: "Who did it", text: "Acting records what actually happened" },
    { icon: "coins", label: "What it cost", text: "And anything worth remembering next time" },
  ],
  phone: place({ src: screen("workspace"), y0: 560, cut: 785, width: 490, tilt: -4, lines: L21, headSize: 108, xShift: 14 }),
  prop: `${cloth({ x: 420, y: 1090, w: 640, h: 195, rot: -3 })}${pencil({ x: 450, y: 1215, len: 400, rot: -6 })}`,
});

// 59: the fall pin, the same seasons screen but cropped tight on the tabs and the list.
const L59 = ["A Fall Tab", "Built From", "Your House"];
const P59 = promo({
  n: 59,
  tone: "berry",
  wave: 2,
  display: L59,
  highlight: ["A Fall Tab", "Your House"],
  appTagline: "fall home maintenance checklist app",
  features: [
    { icon: "leaf", label: "Fall tab", text: "For September to November" },
    { icon: "drop", label: "No irrigation system", text: "Does not see the irrigation job" },
    { icon: "pencil-simple", label: "You type in what you did", text: "Nothing is scanned" },
    { icon: "bell-slash", label: "Reminders stay off", text: "Until you turn them on" },
  ],
  phone: place({ src: screen("seasons"), y0: 312, cut: 580, width: 540, tilt: 9, lines: L59, xShift: 10 }),
  prop: `${hoseCoil({ x: 40, y: 1150, size: 330 })}${gloves({ x: 690, y: 1100, s: 0.95, rot: 12 })}`,
});

export const pins = [P1, P5, P9, P13, P17, P21, P59];
