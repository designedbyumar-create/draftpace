/**
 * App-store promos for ideas 59, 63, 67 and 71 (Homeschooling Companion).
 * Every screen is a real capture, cropped and placed, never redrawn; the
 * words are the bank's own (a few feature rows are the whole-sentence form
 * the idea's `visual` asks for: same words, capital letter added).
 */
import { promo } from "../kit/promo.mjs";
import { idea } from "../kit/bank.mjs";
import { screen, asset } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";
import { sheet, pencil, books } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SOFT = "drop-shadow(0 12px 9px rgba(10,5,14,.45))";

/** Same placement maths as promo()'s managed phone, so a custom phone sits where the kit's would. */
function place({ n, display = idea(n).display, headSize, width, tilt }) {
  const longest = Math.max(...display.map((l) => l.length));
  const size = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  const top = 216 + Math.round(display.length * size * 1.04) + 40;
  const lean = Math.round(Math.sin((Math.abs(tilt) * Math.PI) / 180) * (1400 - top));
  const x = Math.round(1000 - (width + 30) + (tilt < 0 ? lean * 0.8 : -lean * 0.45));
  return { top, x };
}

/** A closed kraft folder with a cream sheet and a pencil resting on it. */
function folder({ x, y, w = 330 }) {
  const h = Math.round(w * 0.7);
  return `<svg style="${abs(x, y, w, h + 40, `filter:${SOFT}`)}" viewBox="0 0 330 261" aria-hidden="true">
    <g transform="rotate(-4 160 150)">
      <rect x="22" y="44" width="290" height="190" rx="8" fill="#fbf7ec"/><rect x="22" y="44" width="290" height="190" rx="8" fill="none" stroke="#000" stroke-opacity=".08"/>
      <path d="M44 74 H270 M44 96 H250 M44 118 H262" stroke="#cdbfa6" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 70 H112 L128 52 H300 Q318 52 318 70 V228 Q318 244 302 244 H26 Q10 244 10 228 Z" fill="#c59a62"/>
      <path d="M10 70 H112 L128 52 H300 Q318 52 318 70 V80 H10 Z" fill="#d6ad78"/>
      <path d="M10 112 H318 V228 Q318 244 302 244 H26 Q10 244 10 228 Z" fill="#b98a52"/>
      <path d="M10 112 H318" stroke="#fff" stroke-opacity=".22" stroke-width="3"/>
      <rect x="10" y="226" width="308" height="18" rx="0" fill="#000" opacity=".07"/>
      <rect x="132" y="150" width="68" height="40" rx="5" fill="#f3ead6" stroke="#8a6234" stroke-opacity=".35"/><path d="M144 162 H188 M144 174 H176" stroke="#b5a487" stroke-width="3" stroke-linecap="round"/>
    </g></svg>
    ${pencil({ x: x - 90, y: y + 70, len: 300, rot: -24, body: "#6f9a74", band: "#c9ccd1" })}`;
}

/** A steel paper clip. */
function paperclip({ x, y, rot = 0, size = 150, color = "#c9ced6" }) {
  const w = size, h = size * 2.1;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(10,5,14,.4))`)}" viewBox="0 0 50 105" aria-hidden="true">
    <path d="M18 70 V20 a12 12 0 0 1 24 0 V82 a17 17 0 0 1 -34 0 V30" fill="none" stroke="#6b7078" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 1)" opacity=".5"/>
    <path d="M18 70 V20 a12 12 0 0 1 24 0 V82 a17 17 0 0 1 -34 0 V30" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 70 V20 a12 12 0 0 1 24 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

/** Three coloured pencils fanned out from one point. */
function fan({ x, y }) {
  const one = (rot, body, dx, dy) => pencil({ x: x + dx, y: y + dy, len: 330, rot, body, band: "#c9ccd1" });
  return `${one(-28, "#d9684f", 0, 0)}${one(-12, "#e7b23f", 18, 34)}${one(4, "#4f87b8", 28, 70)}`;
}

/** A ceramic pencil cup with three pencils at different heights. */
function cup({ x, y, w = 190 }) {
  const h = Math.round(w * 1.55);
  const pen = (px, top, rot, body, tip) => `<g transform="rotate(${rot} ${px} 200)"><rect x="${px - 12}" y="${top}" width="24" height="${210 - top}" fill="${body}"/><rect x="${px - 12}" y="${top}" width="7" height="${210 - top}" fill="#fff" opacity=".25"/><path d="M${px - 12} ${top} L${px} ${top - 34} L${px + 12} ${top} Z" fill="#ecd0a4"/><path d="M${px - 4.5} ${top - 13} L${px} ${top - 34} L${px + 4.5} ${top - 13} Z" fill="${tip}"/><rect x="${px - 12}" y="${top + 14}" width="24" height="12" fill="#bfc2c8"/></g>`;
  return `<svg style="${abs(x, y, w, h, `filter:${SOFT}`)}" viewBox="0 0 190 294" aria-hidden="true">
    ${pen(60, 70, -9, "#d9684f", "#33363b")}${pen(98, 20, 2, "#4f87b8", "#33363b")}${pen(132, 100, 11, "#e7b23f", "#33363b")}
    <path d="M30 190 H160 L152 282 Q150 290 140 290 H50 Q40 290 38 282 Z" fill="#7aa68f"/>
    <path d="M30 190 H160 L158 212 H32 Z" fill="#9bc2ab"/>
    <path d="M44 232 H146" stroke="#fff" stroke-opacity=".28" stroke-width="3"/>
    <ellipse cx="95" cy="190" rx="65" ry="9" fill="#5f8c76"/><ellipse cx="95" cy="189" rx="62" ry="6" fill="#33463c"/>
    <path d="M30 190 H160" stroke="#000" stroke-opacity=".12" stroke-width="2"/></svg>`;
}

/** An exercise book, flat, seen at a slight angle. */
function exerciseBook({ x, y, w = 250, rot = -4, cover = "#4f87b8", band = "#f3ead6" }) {
  const h = 46;
  return `<svg style="${abs(x, y, w, h + 10, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 250 56" aria-hidden="true">
    <rect x="6" y="6" width="238" height="44" rx="5" fill="${cover}"/><rect x="6" y="6" width="238" height="10" rx="5" fill="#fff" opacity=".2"/>
    <rect x="236" y="10" width="10" height="36" rx="2" fill="${band}"/><rect x="18" y="20" width="70" height="20" rx="3" fill="${band}" opacity=".9"/></svg>`;
}

/** The kit's icon() only capitalises hyphenated names ("flag" fails, "Flag" works): give single-word names their capital. */
const feats = (n, edit = (f) => f) => idea(n).features.map(edit).map((f) => ({ ...f, icon: f.icon.includes("-") ? f.icon : f.icon[0].toUpperCase() + f.icon.slice(1) }));

const TILT_59 = 6;
const W_59 = 470;
const D59 = ["State Requirements", "Set Beside", "What You Recorded"];
const P59 = place({ n: 59, display: D59, width: W_59, tilt: TILT_59 });

const TILT_63 = 10;
const W_63 = 440;
const P63 = place({ n: 63, width: W_63, tilt: TILT_63 });

const TILT_67 = -7;
const W_67 = 440;
const P67 = place({ n: 67, width: W_67, tilt: TILT_67 });

const W_71 = 340;
const P71 = place({ n: 71, width: W_71, tilt: 5 });

export const pins = [
  // 59: the state card is the hero, glowing, at the top of the real Kids screen.
  promo({
    n: 59,
    tone: "berry",
    wave: 1,
    display: D59,
    features: feats(59),
    highlight: ["State Requirements", "What You Recorded"],
    phone: `
      <div style="filter:drop-shadow(0 0 46px rgba(226,150,240,.85)) drop-shadow(0 0 120px rgba(200,120,230,.7))">
        ${phone({ src: screen("kids"), y0: 60, y1: 780, width: W_59, tilt: TILT_59, x: P59.x, y: P59.top })}
      </div>
      <div style="${abs(570, 700, 425, 190, "border-radius:14px;transform:rotate(6deg);box-shadow:0 0 34px 12px rgba(226,140,245,.8),0 0 90px 30px rgba(200,110,235,.45);pointer-events:none")}"></div>`,
    prop: folder({ x: 640, y: 1130, w: 330 }),
  }),

  // 63: the Record card zoomed to fill a whole phone; a real printed cover page tilted the other way behind it.
  promo({
    n: 63,
    tone: "deep",
    wave: 2,
    features: feats(63, (f, k) => (k === 3 ? { ...f, text: "It says what was done and makes no claim about how any of it went." } : f)),
    phone: `
      ${sheet({ src: asset("record-oregon-p1.png"), x: 585, y: 845, w: 440, tilt: -9 })}
      ${phone({ src: screen("record"), y0: 302, y1: 748, width: W_63, tilt: TILT_63, x: 505, y: P63.top, closed: true })}`,
    prop: `<div style="${abs(0, 0, 1000, 1500, "")}">${paperclip({ x: 928, y: 1150, rot: 14, size: 50 })}</div>`,
  }),

  // 67: the log only (day headings and entries), leaning left.
  promo({
    n: 67,
    tone: "plum",
    wave: 0,
    features: feats(67, (f, k) => (k === 2 ? { ...f, text: "Notes in your own words about the day something landed" } : f)),
    phone: phone({ src: screen("record"), y0: 950, y1: 950 + Math.ceil((1420 - P67.top - 61) / (W_67 / 390)), width: W_67, tilt: TILT_67, x: 560, y: P67.top }),
    prop: fan({ x: 640, y: 1190 }),
  }),

  // 71: a small phone with two copies of the same crop behind it, one per child.
  promo({
    n: 71,
    tone: "plum",
    wave: 2,
    features: feats(71, (f, k) => (k === 0 ? { ...f, text: "Each with their own curriculum, subjects, plan and checks" } : f)),
    phone: (() => {
      const base = { src: screen("kids"), y0: 292, y1: 650, width: W_71, closed: true };
      const y = P71.top + 40;
      const dim = (h) => `<div style="filter:brightness(.78)">${h}</div>`;
      return `
        ${dim(phone({ ...base, tilt: -3, x: P71.x - 85, y: y - 36, id: "ph2", shadow: false }))}
        ${dim(phone({ ...base, tilt: 10, x: P71.x + 20, y: y - 74, id: "ph3", shadow: false }))}
        ${phone({ ...base, tilt: 5, x: P71.x - 12, y, id: "ph" })}`;
    })(),
    prop: `${books({ x: 560, y: 1262, size: 0.7 })}${cup({ x: 790, y: 1040, w: 170 })}`,
  }),
];
