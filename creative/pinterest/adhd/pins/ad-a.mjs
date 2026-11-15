/**
 * ADHD Life Companion pins, group A: app-store promos (ideas 1, 5, 9, 13).
 * Every screen is a real capture, cropped and placed, never redrawn. Words
 * are the bank's own (display lines are cuts of each headline; feature rows
 * are cuts of the idea's items, sub or source).
 *
 * #1  plum / wave 0 / tilt +7   Now, quiet state; phone set low, butter sticky note + mug at its foot
 * #5  deep / wave 1 / tilt -6   Make a phone call, "Your opening"; cream index card + phone face down
 * #9  berry / wave 2 / tilt +2  Break something down, first physical step; three butter sticky notes
 * #13 plum / wave 1 / tilt -4   Settings, Reminders (cropped above the test button); calendar page + clock
 */
import { promo } from "../kit/promo.mjs";
import { asset } from "../kit/assets.mjs";
import { phone as phoneFrame } from "../kit/phone.mjs";
import { mug, pencil } from "../kit/paper.mjs";

const APP_BG = "#f4f0f1"; // the app's own background colour in the captures
const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/**
 * A phone placed the way promo() places one, but under my control: `top` is the phone's top,
 * `endY` where the phone's screen should run to (past the band, so it bleeds), and the
 * screen is cut at exactly y0..y1 capture units (390 wide) so nothing below the crop shows.
 */
function place({ src, y0, y1, width = 450, tilt = 0, top, endY = 1480, dx = 0, extend = true }) {
  const k = width / 390;
  const lean = Math.round(Math.sin((Math.abs(tilt) * Math.PI) / 180) * (1400 - top));
  const x = Math.round(1000 - (width + 30) + (tilt < 0 ? lean * 0.8 : -lean * 0.45)) + dx;
  const need = extend ? Math.ceil((endY - top - 61) / k) : 0;
  return phoneFrame({ src, y0, y1: Math.max(y1, y0 + need), width, tilt, x, y: top, appBg: APP_BG });
}
/** Headline block height as promo() computes it, so a placed phone can sit under it. */
const headBottom = (display, headSize) => {
  const longest = Math.max(...display.map((l) => l.length));
  const size = headSize ?? Math.max(66, Math.min(108, Math.floor(860 / (longest * 0.54))));
  return 216 + Math.round(display.length * size * 1.04);
};

/** A butter sticky note (blank, no writing). */
const sticky = ({ x, y, size = 190, rot = 4, color = "#f4dc8e", color2 = "#ecc96b" }) =>
  `<div style="${abs(x, y, size, size, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},${color2});box-shadow:0 2px 3px rgba(20,8,14,.3),0 16px 20px rgba(14,6,10,.45)`)}"><div style="position:absolute;left:0;right:0;top:0;height:${Math.round(size * 0.12)}px;background:#fff;opacity:.22"></div><div style="position:absolute;left:0;right:0;bottom:0;height:${Math.round(size * 0.07)}px;background:#000;opacity:.06"></div></div>`;

/** A cream index card with ruled lines, nothing written on it. */
const indexCard = ({ x, y, w = 340, rot = 0 }) => {
  const h = Math.round(w * 0.62);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fbf4e6;border-radius:5px;box-shadow:0 2px 3px rgba(20,8,14,.3),0 16px 22px rgba(14,6,10,.5);overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:${Math.round(h * 0.2)}px;height:3px;background:#d9818e;opacity:.6"></div>
    ${[0.38, 0.55, 0.72, 0.89].map((t) => `<div style="position:absolute;left:0;right:0;top:${Math.round(h * t)}px;height:2px;background:#9db6cc;opacity:.55"></div>`).join("")}</div>`;
};

/** A phone lying face down: back, camera bump. */
const phoneDown = ({ x, y, rot = 0, w = 170, color = "#4a4150" }) => {
  const h = w * 2.05;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);border-radius:30px;background:linear-gradient(145deg,${color},#241f29);box-shadow:inset 0 0 0 3px rgba(255,255,255,.1),0 3px 4px rgba(0,0,0,.45),0 24px 30px rgba(0,0,0,.55)`)}">
    <div style="position:absolute;left:14px;top:14px;width:68px;height:68px;border-radius:20px;background:#15121a;box-shadow:inset 0 0 0 3px rgba(255,255,255,.1)"></div>
    <div style="position:absolute;left:25px;top:25px;width:22px;height:22px;border-radius:50%;background:#2a3140;box-shadow:inset 0 0 0 3px #4a5160"></div>
    <div style="position:absolute;left:51px;top:51px;width:18px;height:18px;border-radius:50%;background:#2a3140;box-shadow:inset 0 0 0 3px #4a5160"></div>
    <div style="position:absolute;left:${w / 2 - 14}px;top:${h / 2 - 14}px;width:28px;height:28px;border-radius:50%;background:#fff;opacity:.1"></div></div>`;
};

/** A tear-off calendar page: a mulberry header band with two rings, a blank grid of days, one cell circled in mulberry. No numerals. */
const calendar = ({ x, y, w = 270, rot = 0 }) => {
  const h = Math.round(w * 1.08);
  const cols = 7, rows = 5, gx = 18, gy = 76, cw = (w - gx * 2) / cols, ch = (h - gy - 18) / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(`<rect x="${gx + c * cw + 5}" y="${gy + r * ch + 8}" width="${cw - 10}" height="${ch - 16}" rx="5" fill="#e9dfe3"/>`);
  const cr = 2, cc = 4; // the chosen date
  const ccx = gx + cc * cw + cw / 2, ccy = gy + cr * ch + ch / 2;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 16px rgba(14,6,10,.5)) drop-shadow(0 3px 3px rgba(14,6,10,.35))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" rx="12" fill="#fbf7f8"/>
    <path d="M0 12 Q0 0 12 0 H${w - 12} Q${w} 0 ${w} 12 V58 H0 Z" fill="#86586a"/><rect width="${w}" height="12" fill="#fff" opacity=".16"/>
    <g fill="#e8e0e4" stroke="#6d6670" stroke-width="2"><rect x="${w * 0.28 - 7}" y="-8" width="14" height="30" rx="7"/><rect x="${w * 0.72 - 7}" y="-8" width="14" height="30" rx="7"/></g>
    <rect x="${gx + 4}" y="22" width="${w * 0.4}" height="14" rx="7" fill="#fff" opacity=".4"/>
    ${cells.join("")}
    <circle cx="${ccx}" cy="${ccy}" r="${Math.min(cw, ch) * 0.52}" fill="none" stroke="#86586a" stroke-width="6"/>
    <circle cx="${ccx}" cy="${ccy}" r="${Math.min(cw, ch) * 0.52}" fill="#86586a" opacity=".16"/></svg>`;
};

/** A round clock, no numerals: cream face, tick marks, two hands, a steel rim. */
const clock = ({ x, y, size = 190 }) => {
  const r = 100, ticks = [];
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180, long = i % 3 === 0;
    ticks.push(`<line x1="${100 + Math.sin(a) * (long ? 70 : 76)}" y1="${100 - Math.cos(a) * (long ? 70 : 76)}" x2="${100 + Math.sin(a) * 86}" y2="${100 - Math.cos(a) * 86}" stroke="#3b2a33" stroke-width="${long ? 6 : 3.5}" stroke-linecap="round"/>`);
  }
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(0 16px 14px rgba(14,6,10,.55)) drop-shadow(0 3px 3px rgba(14,6,10,.35))")}" viewBox="0 0 200 200" aria-hidden="true">
    <circle cx="100" cy="100" r="${r - 1}" fill="#c9ccd2"/><circle cx="100" cy="100" r="${r - 8}" fill="#f6efe6"/><circle cx="100" cy="100" r="${r - 8}" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    ${ticks.join("")}
    <line x1="100" y1="100" x2="100" y2="48" stroke="#2c1a24" stroke-width="7" stroke-linecap="round" transform="rotate(300 100 100)"/>
    <line x1="100" y1="100" x2="100" y2="30" stroke="#2c1a24" stroke-width="5" stroke-linecap="round" transform="rotate(60 100 100)"/>
    <circle cx="100" cy="100" r="9" fill="#86586a"/><ellipse cx="72" cy="56" rx="38" ry="22" fill="#fff" opacity=".14" transform="rotate(-30 72 56)"/></svg>`;
};

// ---------------------------------------------------------------- 1
const D1 = ["Says So When", "Nothing", "Needs You", "Right Now"];
const P1_TOP = 800;
const P1 = promo({
  n: 1,
  tone: "plum",
  wave: 0,
  display: D1,
  highlight: ["Nothing", "Needs You"],
  appTagline: "adhd life admin app",
  features: [
    { icon: "calendar-check", label: "Derived fresh each time", text: "From dates and notes you put there yourself" },
    { icon: "hand-palm", label: "Nothing is invented", text: "Quiet is a real, honest answer" },
    { icon: "chat-teardrop-text", label: "Said plainly", text: "On the days that's true" },
  ],
  phone: place({ src: asset("now-quiet.png"), y0: 0, y1: 246, width: 520, tilt: 7, top: P1_TOP, endY: 1500 }),
  prop: `${sticky({ x: 70, y: 1118, size: 196, rot: -6 })}${pencil({ x: 40, y: 1272, len: 360, rot: -13 })}${mug({ x: 745, y: 1205, size: 150 })}`,
});

// ---------------------------------------------------------------- 5
const D5 = ["An Opening Line", "You Can Use or", "Replace With", "Your Own"];
const P5 = promo({
  n: 5,
  tone: "deep",
  wave: 1,
  display: D5,
  highlight: ["An Opening Line", "Your Own"],
  headSize: 100,
  appTagline: "phone call anxiety app",
  features: [
    { icon: "chat-circle-text", label: "Your opening", text: "The first fifteen seconds are the part people rehearse." },
    { icon: "pencil-simple-line", label: "Change any of this", text: "Or write your own." },
    { icon: "phone-call", label: "Ready to call?", text: "Calling now while it is fresh, or naming one exact time today." },
  ],
  phone: place({ src: asset("opening-line.png"), y0: 0, y1: 437, width: 450, tilt: -6, top: headBottom(D5, 100) + 40 }),
  prop: `${phoneDown({ x: 318, y: 1100, rot: 12, w: 120 })}${indexCard({ x: 46, y: 1120, w: 290, rot: -7 })}`,
});

// ---------------------------------------------------------------- 9
const D9 = ["It Asks for", "the First", "Physical Step,", "Nothing Else"];
const P9 = promo({
  n: 9,
  tone: "berry",
  wave: 2,
  display: D9,
  highlight: ["the First", "Physical Step,"],
  headSize: 108,
  appTagline: "adhd task paralysis app",
  features: [
    { icon: "question", label: "What is the thing?", text: "What would be true when it is finished?" },
    { icon: "footprints", label: "The first physical step", text: "Something somebody watching could see happen." },
    { icon: "calendar-dot", label: "Which of those could happen today?", text: "One of them. Not the list." },
  ],
  phone: place({ src: asset("first-physical-step.png"), y0: 0, y1: 358, width: 470, tilt: 2, top: headBottom(D9, 108) + 60 }),
  prop: `${sticky({ x: 56, y: 1150, size: 150, rot: -9, color: "#f1d77f", color2: "#e6bf5c" })}${sticky({ x: 140, y: 1170, size: 150, rot: 5 })}${sticky({ x: 246, y: 1140, size: 165, rot: -3, color: "#f7e5a1", color2: "#f0d27c" })}`,
});

// ---------------------------------------------------------------- 13
const D13 = ["One Opt-In", "Notification", "for a Date You", "Chose Yourself"];
const P13 = promo({
  n: 13,
  tone: "plum",
  wave: 2,
  display: D13,
  highlight: ["Notification", "Chose Yourself"],
  headSize: 94,
  appTagline: "adhd reminder app",
  features: [
    { icon: "bell-ringing", label: "Remind me on the date I chose", text: "Off unless you switch it on." },
    { icon: "eye-slash", label: "Say what it is about", text: "Says nothing about what it is for on your lock screen unless you allow that." },
    { icon: "moon-stars", label: "Quiet hours", text: "Nothing is sent in this window." },
  ],
  phone: place({ src: asset("reminders.png"), y0: 40, y1: 622, width: 450, tilt: -4, top: headBottom(D13, 94) + 40, extend: false }),
  prop: `${calendar({ x: 60, y: 1075, w: 250, rot: -6 })}${clock({ x: 330, y: 1170, size: 170 })}`,
});

export const pins = [P1, P5, P9, P13];
