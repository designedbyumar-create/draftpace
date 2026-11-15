/**
 * ADHD Life Companion pins, group B: app-store promos.
 * #17 Life screen (real, demo rows flagged Example), four kraft trays at the phone's foot   (deep, wave 2, tilt +7)
 * #21 "How did it go?" capture, a tick on a butter sticky note and a pen                    (berry, wave 1, tilt -8)
 * #25 Help screen (real), a ringing-phone silhouette with an unsent email window behind it  (plum, wave 0, tilt +11)
 * #29 Now first-run capture, an empty kraft envelope and a pen                              (deep, wave 1, tilt -4)
 *
 * Every screen is the real image, cropped and placed, never redrawn. Words come from the idea records.
 */
import { promo } from "../kit/promo.mjs";
import { idea } from "../kit/bank.mjs";
import { screen, asset } from "../kit/assets.mjs";
import { phone as phoneFrame } from "../kit/phone.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/** Same placement maths as promo()'s managed phone, so a hand-placed phone sits where the kit's would. */
function place({ display, headSize, tilt }) {
  const longest = Math.max(...display.map((l) => l.length));
  const size = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  const top = 216 + Math.round(display.length * size * 1.04) + 40;
  return { top, lean: Math.round(Math.sin((Math.abs(tilt) * Math.PI) / 180) * (1400 - top)) };
}

/**
 * A phone on a real screen strip y0..y1 (390-wide units). It is stretched (wider, or with blank app
 * background below the capture) until its foot runs behind the band, so no hard bottom edge shows.
 */
function hero({ display, headSize, src, y0, y1, maxY1, width = 450, tilt, appBg, dx = 0, dy = 0 }) {
  const { top, lean } = place({ display, headSize, tilt });
  const need = (1420 - top - 61) / (width / 390);
  if (maxY1 && y0 + need > maxY1) width = Math.ceil(((1420 - top - 61) * 390) / (maxY1 - y0));
  const k = width / 390;
  const end = Math.max(y1, y0 + (1420 - top - 61) / k);
  const x = Math.round(1000 - (width + 30) + (tilt < 0 ? lean * 0.8 : -lean * 0.45)) + dx;
  return { html: phoneFrame({ src, y0, y1: end, width, tilt, x, y: top + dy, appBg }), x, top, width };
}

/* ------------------------------------------------------------------ props */

const SOFT = "drop-shadow(0 12px 9px rgba(10,5,14,.5))";

/** A small kraft tray seen from above, holding one slip of paper. */
const tray = ({ x, y, w = 150, rot = 0, slip = "#f4dc8e", slipRot = -4 }) => {
  const h = Math.round(w * 0.72);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 150 108" aria-hidden="true">
    <rect x="4" y="6" width="142" height="96" rx="8" fill="#b88e55"/>
    <rect x="12" y="14" width="126" height="72" rx="4" fill="#9c7440"/>
    <g transform="rotate(${slipRot} 75 50)"><rect x="26" y="20" width="98" height="62" rx="2" fill="${slip}"/><rect x="26" y="20" width="98" height="8" fill="#fff" opacity=".28"/><path d="M38 44 H108 M38 56 H94" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round"/></g>
    <path d="M4 82 H146 V94 Q146 102 138 102 H12 Q4 102 4 94 Z" fill="#cba46d"/>
    <path d="M4 82 H146" stroke="#fff" stroke-opacity=".3" stroke-width="2"/>
    <rect x="52" y="86" width="46" height="9" rx="2" fill="#f1e4c6" opacity=".9"/></svg>`;
};

/** A butter sticky note with a mulberry tick drawn on it. */
const tickNote = ({ x, y, size = 200, rot = -7 }) =>
  `<div style="${abs(x, y, size, size, `transform:rotate(${rot}deg);background:linear-gradient(172deg,#f7e39b,#ecc96b);box-shadow:0 2px 3px rgba(40,20,5,.25),0 16px 22px rgba(10,5,14,.5)`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:24px;background:linear-gradient(rgba(255,255,255,.35),rgba(255,255,255,0))"></div>
    <svg viewBox="0 0 200 200" style="position:absolute;inset:0" aria-hidden="true"><path d="M48 104 L86 146 L156 52" fill="none" stroke="#5f3d4b" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 108 L88 150" fill="none" stroke="#86586a" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/></svg></div>`;

/** A ballpoint pen lying at an angle. */
const pen = ({ x, y, len = 400, rot = 0, body = "#231a1f", trim = "#d6b36a" }) =>
  `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(10,5,14,.5))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;

/** A phone silhouette, front on, with ring arcs either side. No screen content. */
const ringing = ({ x, y, w = 150, rot = 0 }) => {
  const h = Math.round(w * 1.95);
  return `<svg style="${abs(x - 40, y - 20, w + 80, h + 40, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="-40 -20 ${w + 80} ${h + 40}" aria-hidden="true">
    <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="#1c1722"/>
    <rect x="0" y="0" width="${w}" height="${h}" rx="30" fill="none" stroke="#4a4352" stroke-width="3"/>
    <rect x="9" y="9" width="${w - 18}" height="${h - 18}" rx="23" fill="#2c2433"/>
    <rect x="${w / 2 - 22}" y="19" width="44" height="11" rx="5.5" fill="#0d0a11"/>
    <circle cx="${w / 2}" cy="${h / 2 - 8}" r="28" fill="#86586a"/>
    <path d="M${w / 2 - 12} ${h / 2 - 20} q-4 2 -2 8 q6 16 20 22 q6 2 8 -2 l2 -6 q1 -3 -2 -4 l-8 -3 q-2 -1 -4 1 l-3 3 q-7 -4 -11 -11 l3 -3 q2 -2 1 -4 l-3 -8 q-1 -3 -4 -2 z" fill="#fff" transform="translate(6 6) scale(.9)"/>
    <g fill="none" stroke="#f6d7a3" stroke-width="7" stroke-linecap="round">
      <path d="M-14 ${h / 2 - 50} q-14 30 0 60"/><path d="M-30 ${h / 2 - 70} q-26 50 0 100" opacity=".7"/>
      <path d="M${w + 14} ${h / 2 - 50} q14 30 0 60"/><path d="M${w + 30} ${h / 2 - 70} q26 50 0 100" opacity=".7"/></g></svg>`;
};

/** An email window with nothing in it yet: title bar, address lines, an empty body. No words. */
const emailWindow = ({ x, y, w = 330, rot = 0 }) => {
  const h = Math.round(w * 0.72);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 330 238" aria-hidden="true">
    <rect width="330" height="238" rx="14" fill="#fbf7f8"/>
    <path d="M0 14 Q0 0 14 0 H316 Q330 0 330 14 V40 H0 Z" fill="#e3d3da"/>
    <circle cx="26" cy="20" r="7" fill="#d9818e"/><circle cx="48" cy="20" r="7" fill="#e9c46a"/><circle cx="70" cy="20" r="7" fill="#9bc2ab"/>
    <path d="M22 70 H308 M22 104 H308" stroke="#d8c7cf" stroke-width="3"/>
    <rect x="22" y="58" width="44" height="8" rx="4" fill="#bfa5b1"/><rect x="22" y="92" width="64" height="8" rx="4" fill="#bfa5b1"/>
    <rect x="22" y="196" width="86" height="26" rx="13" fill="#86586a" opacity=".55"/></svg>`;
};

/** An empty kraft envelope, flap open, seen from above. */
const openEnvelope = ({ x, y, w = 330, rot = 0 }) => {
  const h = Math.round(w * 0.9);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 330 297" aria-hidden="true">
    <path d="M0 120 L165 12 L330 120 V282 Q330 297 315 297 H15 Q0 297 0 282 Z" fill="#a98450"/>
    <path d="M14 126 L165 30 L316 126 V282 H14 Z" fill="#8a6836"/>
    <path d="M14 126 L165 30 L316 126" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
    <path d="M0 282 L165 168 L330 282 V282 Q330 297 315 297 H15 Q0 297 0 282 Z" fill="#cba46d"/>
    <path d="M0 120 L165 12 L330 120 L330 282 L165 170 L0 282 Z" fill="none"/>
    <path d="M0 120 L165 240 L330 120 V282 Q330 297 315 297 H15 Q0 297 0 282 Z" fill="#d6b27a"/>
    <path d="M0 120 L165 240 L330 120" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"/>
    <path d="M0 290 L120 190 M330 290 L210 190" stroke="#000" stroke-opacity=".1" stroke-width="3"/></svg>`;
};

/* ------------------------------------------------------------------ #17 */
const D17 = ["Everything You", "Are Holding,", "in Four Shapes"];
const T17 = 6;
function p17() {
  const h = hero({ display: D17, src: screen("life"), y0: 70, y1: 745, maxY1: 745, width: 450, tilt: T17, dx: -28 });
  const example = `<span class="example" style="${abs(372, 1030, 0, 0, "width:auto;height:auto;transform:rotate(6deg);font-size:24px;color:#fff;background:#5f3d4b;border-color:#f6d7a3;padding:6px 12px;box-shadow:0 6px 14px rgba(10,5,14,.45);z-index:6")}">Example</span>`;
  return promo({
    n: 17,
    tone: "deep",
    wave: 2,
    display: D17,
    highlight: ["Everything You", "in Four Shapes"],
    features: [
      { icon: "check-square", label: "Something to do", text: "Everything you are holding" },
      { icon: "hourglass-medium", label: "Waiting on someone", text: "In four shapes" },
      { icon: "arrows-clockwise", label: "Something ongoing", text: "Never mixed together" },
      { icon: "bookmark-simple", label: "Worth having to hand", text: "Life" },
    ],
    phone: h.html + example,
    prop: `${tray({ x: 470, y: 1288, w: 118, rot: -5, slip: "#f4dc8e" })}${tray({ x: 604, y: 1300, w: 118, rot: 3, slip: "#cfe0ee", slipRot: 5 })}${tray({ x: 738, y: 1284, w: 118, rot: -3, slip: "#f1e7eb", slipRot: -7 })}${tray({ x: 868, y: 1298, w: 112, rot: 6, slip: "#e8c9d6", slipRot: 3 })}`,
  });
}

/* ------------------------------------------------------------------ #21 */
const D21 = ["Sorted, Waiting,", "Made Progress,", "Did Not Get to It"];
const T21 = -8;
function p21() {
  const h = hero({ display: D21, src: asset("how-did-it-go.png"), y0: 0, y1: 586, width: 470, tilt: T21, appBg: "#f4f0f1", dx: -34 });
  return promo({
    n: 21,
    tone: "berry",
    wave: 1,
    display: D21,
    highlight: ["Sorted, Waiting,", "Did Not Get to It"],
    features: [
      { icon: "phone-call", label: "How did it go?", text: "How it went changes what happens next" },
      { icon: "check-circle", label: "Sorted", text: "Closes it" },
      { icon: "hourglass-medium", label: "Waiting on someone", text: "Turns it into that, with a date to check back" },
      { icon: "arrow-bend-down-right", label: "Did not get to it", text: "Changes nothing at all, on purpose" },
    ],
    phone: h.html,
    prop: `${tickNote({ x: 150, y: 1112, size: 200, rot: -8 })}${pen({ x: 310, y: 1318, len: 400, rot: -5, body: "#231a1f" })}`,
  });
}

/* ------------------------------------------------------------------ #25 */
const D25 = ["Eight Walkthroughs", "for the Hardest", "Things to Start"];
const T25 = 10;
function p25() {
  const h = hero({ display: D25, src: screen("help"), y0: 70, y1: 728, maxY1: 728, width: 450, tilt: T25, dx: -42 });
  return promo({
    n: 25,
    tone: "plum",
    wave: 0,
    display: D25,
    highlight: ["for the Hardest"],
    features: [
      { icon: "phone", label: "A call to make", text: "It has been sitting there" },
      { icon: "envelope-simple", label: "An email that needs writing", text: "It has not been written" },
      { icon: "arrow-u-up-left", label: "Somebody has not come back to you", text: "It needs chasing" },
      { icon: "receipt", label: "Charged wrongly", text: "It needs sorting" },
    ],
    phone: h.html,
    prop: `${emailWindow({ x: 100, y: 1130, w: 290, rot: -6 })}${ringing({ x: 290, y: 1160, w: 112, rot: 7 })}`,
  });
}

/* ------------------------------------------------------------------ #29 */
const D29 = ["Help With One", "Thing Today,", "Nothing Set", "Up First"];
const T29 = -4;
function p29() {
  const h = hero({ display: D29, src: asset("now-first-run.png"), y0: 0, y1: 565, width: 450, tilt: T29, appBg: "#f4f0f1" });
  return promo({
    n: 29,
    tone: "deep",
    wave: 1,
    display: D29,
    highlight: ["Help With One", "Up First"],
    features: [
      { icon: "lightbulb", label: "Nothing set up first", text: "Help with one thing today" },
      { icon: "hand-pointing", label: "Pick the closest", text: "It walks you through that one thing" },
      { icon: "hand-palm", label: "Stop at any point", text: "No obligation to turn it into a system" },
    ],
    phone: h.html,
    prop: `${openEnvelope({ x: 110, y: 1085, w: 290, rot: -6 })}${pen({ x: 280, y: 1290, len: 380, rot: 4, body: "#86586a" })}`,
  });
}

export const pins = [p17(), p21(), p25(), p29()];
