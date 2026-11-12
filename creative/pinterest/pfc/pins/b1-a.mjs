/**
 * Batch 1, Builder A: three app-store promos for Personal Finance Companion
 * (ideas 1, 5 and 9). Every screen is a real capture, cropped and placed,
 * never redrawn. The words are the bank's own (display lines are cut from
 * each headline; feature rows are cuts of the idea's items, sub or source,
 * with a capital letter added where a cut starts mid-sentence).
 */
import { promo } from "../kit/promo.mjs";
import { screen } from "../kit/assets.mjs";
import { mug } from "../kit/paper.mjs";
import { phone } from "../kit/phone.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SOFT = "drop-shadow(0 14px 10px rgba(2,12,8,.5))";
const APP_BG = "#f3f4f3"; // the app's own background colour in the captures

/** A closed ring binder seen from the front: deep teal cover, darker spine with steel rings, a blank label card. */
function binder({ x, y, w = 250, rot = -6 }) {
  return `<svg style="${abs(x, y, w, w * 1.3, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 250 325" aria-hidden="true">
    <rect x="10" y="10" width="230" height="305" rx="12" fill="#2f6f5e"/>
    <rect x="10" y="10" width="42" height="305" rx="12" fill="#1f5646"/>
    <path d="M52 12 V313" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
    <rect x="10" y="10" width="230" height="40" rx="12" fill="#fff" opacity=".1"/>
    <g fill="#d3d8de" stroke="#8a9199" stroke-width="2"><rect x="28" y="62" width="40" height="12" rx="6"/><rect x="28" y="150" width="40" height="12" rx="6"/><rect x="28" y="238" width="40" height="12" rx="6"/></g>
    <rect x="88" y="96" width="120" height="86" rx="5" fill="#f4efe2"/><rect x="88" y="96" width="120" height="86" rx="5" fill="none" stroke="#000" stroke-opacity=".14"/>
    <path d="M10 296 H240 V303 Q240 315 228 315 H22 Q10 315 10 303 Z" fill="#000" opacity=".16"/>
  </svg>`;
}

/** A pen lying at an angle: forest barrel, steel clip, ballpoint tip. */
function pen({ x, y, len = 320, rot = -20, body = "#1f5a49" }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(2,12,8,.45))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="52" y="6" width="${len - 70}" height="22" rx="10" fill="${body}"/>
    <rect x="52" y="6" width="${len - 70}" height="7" rx="3.5" fill="#fff" opacity=".28"/>
    <rect x="${len - 150}" y="3" width="110" height="5" rx="2.5" fill="#d9dde2"/>
    <rect x="${len - 28}" y="9" width="14" height="16" rx="4" fill="#d9dde2"/>
    <path d="M52 6 L8 15 L8 19 L52 28 Z" fill="#c9ced6"/><path d="M12 16 L2 17 L12 18 Z" fill="#33363b"/>
  </svg>`;
}

/** A stack of paper bills with a butter sticky note on top; the pen lies across it. Nothing is written on the paper. */
function billsStack({ x, y, w = 330 }) {
  const sheetAt = (dy, rot, fill) => `<g transform="rotate(${rot} 165 90) translate(0 ${dy})"><rect x="22" y="30" width="286" height="150" rx="5" fill="${fill}"/><rect x="22" y="30" width="286" height="150" rx="5" fill="none" stroke="#000" stroke-opacity=".1"/></g>`;
  return `<svg style="${abs(x, y, w, w * 0.64, `filter:${SOFT}`)}" viewBox="0 0 330 212" aria-hidden="true">
    ${sheetAt(14, -5, "#ece8dc")}${sheetAt(7, 3, "#f3efe4")}${sheetAt(0, -1, "#fbf8f0")}
    <g fill="none" stroke="#d3cab6" stroke-width="3" stroke-linecap="round" transform="rotate(-1 165 90)"><path d="M46 62 H150"/><path d="M46 84 H128"/><path d="M46 150 H108"/></g>
    <g transform="rotate(7 250 70)"><rect x="196" y="22" width="84" height="84" fill="#f4d56b"/><rect x="196" y="22" width="84" height="16" fill="#fff" opacity=".25"/><rect x="196" y="96" width="84" height="10" fill="#000" opacity=".06"/></g>
  </svg>${pen({ x: x - 10, y: y + 118, len: 330, rot: -14 })}`;
}

/** A desk calculator, keys only, with a blank grey display. */
function calculator({ x, y, w = 190, rot = 8 }) {
  const keys = [];
  const cols = ["#3a4a44", "#3a4a44", "#3a4a44", "#d9962b"];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) keys.push(`<rect x="${20 + c * 42}" y="${74 + r * 38}" width="34" height="30" rx="7" fill="${c === 3 ? cols[3] : r === 0 ? "#6d8a7e" : cols[0]}"/><rect x="${20 + c * 42}" y="${74 + r * 38}" width="34" height="9" rx="4" fill="#fff" opacity=".2"/>`);
  return `<svg style="${abs(x, y, w, w * 1.45, `transform:rotate(${rot}deg);filter:${SOFT}`)}" viewBox="0 0 190 276" aria-hidden="true">
    <rect x="4" y="4" width="182" height="268" rx="20" fill="#1f2d28"/><rect x="4" y="4" width="182" height="268" rx="20" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2"/>
    <rect x="18" y="18" width="154" height="44" rx="8" fill="#b9c9bd"/><rect x="18" y="18" width="154" height="14" rx="8" fill="#fff" opacity=".22"/>
    ${keys.join("")}
  </svg>`;
}

// 1: the whole Records screen, leaning right, with a mug and a closed binder.
const P1 = promo({
  n: 1,
  tone: "plum",
  wave: 0,
  display: ["Accounts, Bills,", "Debt and Savings", "in One Place"],
  highlight: ["Accounts, Bills,", "in One Place"],
  appTagline: "finance tracker app",
  features: [
    { icon: "bank", label: "Accounts", text: "One always-current picture of your accounts" },
    { icon: "stack", label: "All seven areas", text: "Accounts, income, bills, subscriptions, transactions, debt, and savings" },
  ],
  screen: { src: screen("records"), y0: 56, y1: 744, width: 450, tilt: 7, appBg: APP_BG },
  prop: `${binder({ x: 90, y: 960, w: 250, rot: -6 })}${mug({ x: 786, y: 1190, size: 150 })}`,
});

// 5's phone is placed here for the same reason as 9's below (the capture's dev badge and "Add bill" bar sit under the cut).
const P5_WIDTH = 450, P5_TILT = -7, P5_Y0 = 185, P5_CUT = 770;
const P5_TOP = 216 + Math.round(3 * 108 * 1.04) + 40;
const P5_LEAN = Math.round(Math.sin((Math.abs(P5_TILT) * Math.PI) / 180) * (1400 - P5_TOP));
const P5_K = P5_WIDTH / 390;
const P5_PHONE = phone({ src: screen("bills"), y0: P5_Y0, y1: P5_Y0 + Math.ceil((1420 - P5_TOP - 61) / P5_K), width: P5_WIDTH, tilt: P5_TILT, x: Math.round(1000 - (P5_WIDTH + 30) + P5_LEAN * 0.8), y: P5_TOP, appBg: APP_BG })
  .replace('alt=""></div>', `alt=""><div style="position:absolute;left:0;right:0;top:${Math.round((P5_CUT - P5_Y0) * P5_K)}px;bottom:0;background:${APP_BG}"></div></div>`);

// 5: the Bills screen leaning left, deep tone, a stack of bills and a pen.
const P5 = promo({
  n: 5,
  tone: "deep",
  wave: 1,
  display: ["Tick a Bill", "Paid for", "the Month"],
  highlight: ["Tick a Bill", "the Month"],
  appTagline: "monthly bill tracker app",
  features: [
    { icon: "check-circle", label: "Tick a bill paid", text: "For the month" },
    { icon: "calculator", label: "What is left to pay", text: "Is worked out from what you ticked" },
    { icon: "list-checks", label: "A paid bill", text: "Leaves the list of what is coming up" },
    { icon: "note", label: "A note on any bill", text: "With no due date" },
  ],
  phone: P5_PHONE,
  prop: billsStack({ x: 50, y: 1120, w: 340 }),
});

// 9's phone is placed here, not by promo(), so the screen can stop at the crop line (capture y 770, above the dev badge
// and the sticky "Add debt" bar) and carry on in the app's own background colour instead of showing them.
const P9_WIDTH = 450, P9_TILT = 3, P9_Y0 = 200, P9_CUT = 770;
const P9_TOP = 216 + Math.round(3 * 99 * 1.04) + 40;
const P9_LEAN = Math.round(Math.sin((P9_TILT * Math.PI) / 180) * (1400 - P9_TOP));
const P9_K = P9_WIDTH / 390;
const P9_PHONE = phone({ src: screen("debt"), y0: P9_Y0, y1: P9_Y0 + Math.ceil((1420 - P9_TOP - 61) / P9_K), width: P9_WIDTH, tilt: P9_TILT, x: Math.round(1000 - (P9_WIDTH + 30) - P9_LEAN * 0.45), y: P9_TOP, appBg: APP_BG })
  .replace('alt=""></div>', `alt=""><div style="position:absolute;left:0;right:0;top:${Math.round((P9_CUT - P9_Y0) * P9_K)}px;bottom:0;background:${APP_BG}"></div></div>`);

// 9: the Debt screen, a gentle right lean, berry tone, a calculator.
const P9 = promo({
  n: 9,
  tone: "berry",
  wave: 2,
  display: ["Smallest Balance", "First or Highest", "Rate First"],
  highlight: ["Smallest Balance", "Rate First"],
  appTagline: "debt payoff planner app",
  features: [
    { icon: "coins", label: "Extra each month", text: "An extra amount you choose" },
    { icon: "sort-ascending", label: "Smallest balance first", text: "Or highest rate first" },
    { icon: "warning-circle", label: "A debt with no rate", text: "Is named as left out, never guessed at" },
    { icon: "chart-line-up", label: "It's a model", text: "From your numbers and doesn't change what you pay" },
  ],
  phone: P9_PHONE,
  prop: calculator({ x: 110, y: 1080, w: 200, rot: -9 }),
});

export const pins = [P1, P5, P9];
