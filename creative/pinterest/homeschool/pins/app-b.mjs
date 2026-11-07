/**
 * Five Homeschooling Companion app-store promos (ideas 82, 86, 92, 75, 79).
 * Every screen is a real capture used as it is: only cropped and placed.
 * The words are the bank's own; a headline is cut into lines using only
 * words of the idea's headline, and the feature rows are the bank's.
 */
import { promo } from "../kit/promo.mjs";
import { phone } from "../kit/phone.mjs";
import { screen, asset } from "../kit/assets.mjs";
import { books } from "../kit/paper.mjs";
import { idea } from "../kit/bank.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SHADOW = "filter:drop-shadow(0 14px 10px rgba(10,5,14,.45))";

/* ---------- props (flat vector, in pin coordinates, bottom right or bottom strip) ---------- */

/** A glazed pencil cup with a fan of pencils and a pair of brushes. */
function pencilCup({ x, y, size = 1, rot = 0 }) {
  const w = 200 * size, h = 290 * size;
  const pencils = [
    { r: -24, c: "#e7b23f" }, { r: -10, c: "#c4573e" }, { r: 4, c: "#5f8a8f" }, { r: 17, c: "#e7b23f" }, { r: 30, c: "#8aa182" },
  ].map(({ r, c }, k) => `<g transform="rotate(${r} 100 150)"><rect x="92" y="${k % 2 ? 18 : 6}" width="16" height="150" fill="${c}"/><rect x="92" y="${k % 2 ? 18 : 6}" width="5" height="150" fill="#fff" opacity=".22"/><path d="M92 ${k % 2 ? 18 : 6} L100 ${k % 2 ? -14 : -26} L108 ${k % 2 ? 18 : 6} Z" fill="#e9c9a0"/><path d="M96.4 ${k % 2 ? -4 : -16} L100 ${k % 2 ? -14 : -26} L103.6 ${k % 2 ? -4 : -16} Z" fill="#33363b"/></g>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 -40 200 290" aria-hidden="true">
    <ellipse cx="100" cy="150" rx="68" ry="13" fill="#3a2430"/>
    ${pencils}
    <path d="M32 150 Q100 176 168 150 L156 232 Q100 250 44 232 Z" fill="#d9856a"/>
    <path d="M32 150 Q100 176 168 150 L164 176 Q100 202 36 176 Z" fill="#f3ede4"/>
    <path d="M44 232 Q100 250 156 232 L152 250 Q100 262 48 250 Z" fill="#000" opacity=".12"/>
    <path d="M50 160 Q54 205 62 236" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="7" stroke-linecap="round"/>
  </svg>`;
}

/** A wooden ruler lying at an angle: ticks only, no numerals. */
function ruler({ x, y, len = 520, rot = 0 }) {
  const h = 74;
  const ticks = Array.from({ length: Math.floor((len - 36) / 14) + 1 }, (_, k) => {
    const tx = 18 + k * 14;
    const l = k % 10 === 0 ? 30 : k % 5 === 0 ? 22 : 13;
    return `<line x1="${tx}" y1="0" x2="${tx}" y2="${l}" stroke="#6e4a1c" stroke-width="${k % 5 === 0 ? 2.4 : 1.6}"/>`;
  }).join("");
  return `<svg style="${abs(x, y, len, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
    <rect width="${len}" height="${h}" rx="7" fill="#e8c27a"/><rect width="${len}" height="9" rx="4" fill="#fff" opacity=".28"/>
    <rect y="${h - 8}" width="${len}" height="8" rx="4" fill="#9a6a2a" opacity=".38"/>
    <g transform="translate(0 6)">${ticks}</g>
    <circle cx="${len - 34}" cy="${h - 24}" r="8" fill="#7a521f" opacity=".5"/>
  </svg>`;
}

/** A potted plant: cream pot with a plum band, sage leaves. */
function plant({ x, y, size = 1, rot = 0 }) {
  const w = 220 * size, h = 300 * size;
  const leaf = (cx, cy, rx, ry, r, c) => `<g transform="rotate(${r} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}"/><path d="M${cx - rx + 4} ${cy} L${cx + rx - 4} ${cy}" stroke="#fff" stroke-opacity=".3" stroke-width="2.5"/></g>`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 220 300" aria-hidden="true">
    ${leaf(58, 112, 20, 62, -34, "#7f9d78")}${leaf(160, 104, 20, 64, 30, "#6f9070")}${leaf(110, 68, 22, 70, 2, "#8aa182")}${leaf(78, 82, 17, 54, -14, "#a2b79a")}${leaf(142, 78, 17, 52, 16, "#93ab8b")}
    <path d="M52 168 H168 L152 282 Q110 294 68 282 Z" fill="#f3ede4"/>
    <path d="M56 188 H164 L162 206 H58 Z" fill="#7b4a7e"/>
    <path d="M52 168 H168 V182 H52 Z" fill="#fff" opacity=".35"/>
    <path d="M64 214 Q68 250 74 276" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="110" cy="168" rx="58" ry="9" fill="#4a3427"/>
  </svg>`;
}

/** A red apple with a leaf. */
function apple({ x, y, size = 1, rot = 0 }) {
  const w = 190 * size, h = 190 * size;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${SHADOW}`)}" viewBox="0 0 190 190" aria-hidden="true">
    <path d="M95 52 C 60 28, 8 52, 14 108 C 20 156, 58 182, 82 174 C 90 171, 100 171, 108 174 C 134 182, 172 156, 178 108 C 184 52, 130 28, 95 52 Z" fill="#c8453b"/>
    <path d="M95 52 C 60 28, 8 52, 14 108 C 20 156, 58 182, 82 174 C 90 171, 100 171, 108 174 C 134 182, 172 156, 178 108 C 184 52, 130 28, 95 52 Z" fill="none" stroke="#7d2420" stroke-opacity=".35" stroke-width="3"/>
    <path d="M40 80 C 34 100, 38 126, 52 144" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="10" stroke-linecap="round"/>
    <path d="M96 52 C 96 36, 102 22, 112 12" fill="none" stroke="#5a3b22" stroke-width="7" stroke-linecap="round"/>
    <path d="M110 30 C 126 6, 156 6, 168 20 C 154 40, 126 42, 110 30 Z" fill="#7f9d78"/><path d="M114 30 C 130 24, 146 20, 164 20" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2.4"/>
  </svg>`;
}

/** A roll of washi tape (plum stripe) with a strip peeled off it, and open scissors. */
function scissorsAndTape({ x, y, size = 1 }) {
  const w = 440 * size, h = 220 * size;
  return `<svg style="${abs(x, y, w, h, SHADOW)}" viewBox="0 0 440 220" aria-hidden="true">
    <defs>
      <pattern id="wst" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="22" height="22" fill="#d9a7d6"/><rect width="11" height="22" fill="#fff" opacity=".55"/></pattern>
      <linearGradient id="blade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f5"/><stop offset="1" stop-color="#a5abb3"/></linearGradient>
    </defs>
    <path d="M60 176 L236 186 L240 204 L62 196 Z" fill="url(#wst)" opacity=".95"/>
    <circle cx="72" cy="134" r="64" fill="#cfa8cc"/><circle cx="72" cy="134" r="64" fill="url(#wst)"/>
    <circle cx="72" cy="134" r="26" fill="#f3ede4"/><circle cx="72" cy="134" r="26" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    <circle cx="72" cy="134" r="64" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    <g transform="translate(150 20)">
      <path d="M96 62 L270 14 Q276 12 276 18 L276 22 Q176 70 100 78 Z" fill="url(#blade)"/>
      <path d="M96 58 L270 108 Q276 110 276 104 L276 100 Q176 62 100 46 Z" fill="url(#blade)"/>
      <path d="M96 62 L270 14" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>
      <circle cx="98" cy="60" r="8" fill="#6b727a"/>
      <g fill="none" stroke="#c4573e" stroke-width="13" stroke-linecap="round">
        <ellipse cx="34" cy="36" rx="30" ry="20" transform="rotate(24 34 36)"/>
        <ellipse cx="34" cy="86" rx="30" ry="20" transform="rotate(-24 34 86)"/>
      </g>
      <path d="M56 46 L96 58 M56 76 L96 62" stroke="#c4573e" stroke-width="13" stroke-linecap="round"/>
    </g>
  </svg>`;
}

/** Pieces of washi tape across a corner of a card. */
const tapeStrip = ({ x, y, w = 150, rot = 0 }) =>
  `<div style="${abs(x, y, w, 52, `transform:rotate(${rot}deg);background:repeating-linear-gradient(45deg,rgba(231,196,226,.92) 0 12px,rgba(255,255,255,.7) 12px 24px);box-shadow:0 3px 8px rgba(10,5,14,.3);clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,100% 100%,9% 100%,6% 92%,3% 100%,0 90%)`)}"></div>`;

/** Where the promo layout puts the phone: under the headline. */
const topFor = (display, headSize) => {
  const longest = Math.max(...display.map((l) => l.length));
  const size = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  return 216 + Math.round(display.length * size * 1.04) + 40;
};

/**
 * The bank's own feature rows. The kit's icon() only capitalises hyphenated
 * names, so a one-word icon from the bank ("signpost") would fail: capitalise it here.
 */
const featuresOf = (n) => idea(n).features.map((f) => ({ ...f, icon: f.icon[0].toUpperCase() + f.icon.slice(1) }));

/** The real screens' own page colour, for the strip a phone shows under an image. */
const APP_BG = "#f4f2ec";

export const pins = [
  // #82  Schedule by subject, zero days allowed. Workspace screen, lower half, leaning right.
  promo({
    n: 82,
    features: featuresOf(82),
    tone: "deep",
    wave: 1,
    display: ["Homeschool Schedule", "by Subject:", "Zero Days", "Is Allowed"],
    highlight: ["Zero Days", "Is Allowed"],
    // y1 stops at 780: below it the real capture shows the tab bar and the Next.js dev badge.
    phone: phone({ src: screen("workspace"), y0: 340, y1: 780, width: 500, tilt: 12, x: 428, y: 770 }),
    prop: pencilCup({ x: 810, y: 1150, size: 0.84, rot: 6 }),
  }),

  // #86  Progress without comparison. Top of the Record screen, enlarged, almost upright.
  (() => {
    const display = ["Progress Without", "Comparison:", "Same Child,", "Weeks Earlier"];
    return promo({
      n: 86,
      features: featuresOf(86),
      tone: "berry",
      wave: 2,
      display,
      highlight: ["Same Child,", "Weeks Earlier"],
      phone: phone({ src: screen("record"), y0: 56, y1: 511, width: 500, tilt: 3, x: 470, y: 760 }),
      prop: ruler({ x: 430, y: 1286, len: 540, rot: -4 }),
    });
  })(),

  // #92  Requirements by state. Kids screen: state card plus the child rows. Different crop, tone and lean from #59.
  promo({
    n: 92,
    tone: "plum",
    wave: 0,
    display: ["Requirements", "by State:", "Name Yours Once", "See Your Level"],
    highlight: ["Name Yours Once", "See Your Level"],
    headSize: 96,
    appTagline: "keep track of what you actually taught",
    features: [
      { icon: "MapPin", label: "Which state do you homeschool in?", text: "" },
      { icon: "Flag", label: "Oregon · Moderate regulation", text: "Notice on starting; testing at certain grades, results kept" },
      { icon: "ListChecks", label: "Your state's record keeping requirements", text: "set line by line against what you've recorded" },
      { icon: "Warning", label: "Laws change.", text: "Confirm with your state before relying on this." },
    ],
    screen: { src: screen("kids"), y0: 130, y1: 560, width: 480, tilt: -7 },
    prop: books({ x: 700, y: 1215, size: 1.1 }),
  }),

  // #75  Check whether it landed. The whole real result screen in a closed phone, leaning left.
  (() => {
    const display = ["Check Whether It Landed:", "Honest Results,", "One Topic at a Time"];
    const top = topFor(display);
    return promo({
      n: 75,
      features: featuresOf(75),
      tone: "deep",
      wave: 0,
      display,
      highlight: ["Honest Results,"],
      phone: phone({ src: asset("screen-check-result.png"), y0: 0, y1: 520, width: 470, tilt: -5, x: 505, y: top + 62, closed: true, appBg: APP_BG }),
      prop: plant({ x: 780, y: 1085, size: 1.05, rot: 4 }),
    });
  })(),

  // #79  Private records printed on your own device. The real print section as a floating card, not a phone.
  (() => {
    const w = 500, h = Math.round((w * 918) / 1170);
    const cx = 488, cy = 705;
    const card = `
      <div style="${abs(cx, cy, w, h, "transform:rotate(-4deg);border-radius:26px;background:#f4f2ec;overflow:hidden;box-shadow:0 0 0 1px rgba(255,255,255,.5),0 0 110px 20px rgba(190,120,200,.5),0 40px 70px rgba(10,5,14,.55),0 8px 16px rgba(10,5,14,.35)")}"><img src="${asset("screen-print-section.png")}" style="width:${w}px;height:${h}px;display:block" alt=""></div>
      ${tapeStrip({ x: cx + w - 100, y: cy - 6, w: 140, rot: 38 })}${tapeStrip({ x: cx - 30, y: cy + h - 44, w: 110, rot: 38 })}`;
    return promo({
      n: 79,
      tone: "berry",
      wave: 1,
      phone: card,
      prop: scissorsAndTape({ x: 520, y: 1128, size: 1.0 }),
    });
  })(),
];
