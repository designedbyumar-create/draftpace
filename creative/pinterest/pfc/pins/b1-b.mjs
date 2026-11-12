/**
 * Batch 1, Builder B: workbook pages on desks (5 pins). Walnut desk and
 * leather blotter (#3), clipboard in a wooden tray (#7), white desk with a
 * laptop edge (#11), marble slab with washi tape (#15), ring binder open on
 * linen (#23). Every page is the real workbook page, placed as printed.
 */
import { printable } from "../kit/printable.mjs";
import { bookPage } from "../kit/assets.mjs";
import { desk, sheet, pencil, mug, binderClip } from "../kit/paper.mjs";
import { C } from "../kit/bank.mjs";

const SCENE_TOP = 372;
const SCENE_H = 982; // 372..1354
const ab = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const seeded = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/* ---------------------------------------------------------------- props */

/** A fountain pen lying at an angle. */
function pen({ x, y, len = 440, rot = 0, body = "#1c3a2f", trim = "#c9a24a" }) {
  return `<svg style="${ab(x, y, len, 28, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,0,.4))`)}" viewBox="0 0 ${len} 28" aria-hidden="true">
    <rect x="72" y="4" width="${len - 80}" height="20" rx="10" fill="${body}"/>
    <rect x="86" y="7" width="${len - 120}" height="4" rx="2" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="0" width="112" height="5" rx="2.5" fill="${trim}"/>
    <rect x="${len - 196}" y="3" width="9" height="22" fill="${trim}"/>
    <rect x="62" y="5" width="10" height="18" fill="${trim}"/>
    <path d="M62 6 L30 11 L30 17 L62 22 Z" fill="#26282b"/>
    <path d="M30 11 L5 13.4 L5 14.6 L30 17 Z" fill="${trim}"/></svg>`;
}

/** A yellow highlighter with its cap on the far end. */
function highlighter({ x, y, len = 290, rot = 0 }) {
  return `<svg style="${ab(x, y, len, 44, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,0,.35))`)}" viewBox="0 0 ${len} 44" aria-hidden="true">
    <path d="M2 17 L36 8 L36 36 L2 27 Z" fill="#f2e04a"/><path d="M2 17 L14 14 L14 30 L2 27 Z" fill="#e8c92e"/>
    <rect x="36" y="6" width="${len - 130}" height="32" rx="6" fill="#f4e24d"/>
    <rect x="46" y="12" width="${len - 150}" height="14" rx="3" fill="#fffbe0" opacity=".85"/>
    <rect x="46" y="12" width="${len - 150}" height="3" rx="1.5" fill="#fff" opacity=".6"/>
    <rect x="${len - 96}" y="2" width="94" height="40" rx="9" fill="#2a2d31"/>
    <rect x="${len - 96}" y="2" width="94" height="8" rx="4" fill="#fff" opacity=".12"/></svg>`;
}

/** A pocket calculator from above, display and keys left blank. */
function calculator({ x, y, w = 210, rot = 0 }) {
  const h = w * 1.5;
  const keys = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const last = c === 3 && r >= 3;
    if (last && r === 4) continue;
    const kx = 22 + c * 46, ky = 96 + r * 44;
    const col = c === 3 ? "#d9962b" : r === 0 ? "#6b7178" : "#40454b";
    keys.push(`<rect x="${kx}" y="${ky}" width="38" height="34" rx="8" fill="${col}"/><rect x="${kx}" y="${ky}" width="38" height="8" rx="4" fill="#fff" opacity=".13"/>`);
  }
  keys.push(`<rect x="160" y="228" width="38" height="78" rx="8" fill="#d9962b"/><rect x="160" y="228" width="38" height="8" rx="4" fill="#fff" opacity=".15"/>`);
  return `<svg style="${ab(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 14px rgba(20,25,30,.38))`)}" viewBox="0 0 220 330" aria-hidden="true">
    <rect width="220" height="330" rx="22" fill="#25282c"/><rect x="3" y="3" width="214" height="324" rx="19" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
    <rect x="18" y="18" width="184" height="62" rx="8" fill="#cdd9c4"/><rect x="18" y="18" width="184" height="62" rx="8" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="2"/>
    <rect x="132" y="22" width="64" height="9" rx="3" fill="#1c2a3a" opacity=".5"/>
    ${keys.join("")}</svg>`;
}

/** A silver laptop keyboard deck seen from above, rotated so the hinge is off the right edge. */
function laptopDeck({ cx, cy, rot = 0 }) {
  const rnd = seeded(5);
  const keys = [];
  const rows = 5, cols = 12;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    keys.push(`<rect x="${42 + c * 39}" y="${38 + r * 38}" width="35" height="33" rx="6" fill="#23262a"/><rect x="${42 + c * 39}" y="${38 + r * 38}" width="35" height="6" rx="3" fill="#fff" opacity=".1"/>`);
  }
  const w = 560, h = 360;
  return `<svg style="${ab(cx - w / 2, cy - h / 2, w, h, `transform:rotate(${90 + rot}deg);filter:drop-shadow(0 20px 22px rgba(30,35,40,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <defs><linearGradient id="alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9ebee"/><stop offset=".5" stop-color="#cfd3d8"/><stop offset="1" stop-color="#bfc4ca"/></linearGradient></defs>
    <rect width="${w}" height="${h}" rx="26" fill="url(#alu)"/>
    <rect x="30" y="26" width="${w - 60}" height="222" rx="10" fill="#2d3035"/>
    ${keys.join("")}
    <rect x="${w / 2 - 90}" y="268" width="180" height="76" rx="12" fill="#c3c8ce" stroke="#aeb3ba" stroke-width="2"/>
    <rect x="0" y="0" width="${w}" height="10" rx="5" fill="#9ea4ab"/></svg>`;
}

/** A thermal receipt slip: a zigzag bottom and anonymous grey lines, no words or numbers. */
function receipt({ x, y, w = 168, h = 430, rot = 0, seed = 1, lines = 14 }) {
  const rnd = seeded(seed);
  const bars = [];
  for (let k = 0; k < lines; k++) {
    const bw = 40 + rnd() * (w - 70);
    bars.push(`<div style="position:absolute;left:18px;top:${34 + k * 22}px;width:${bw}px;height:7px;border-radius:3px;background:#c9cdcc"></div>`);
    if (rnd() > 0.55) bars.push(`<div style="position:absolute;right:18px;top:${34 + k * 22}px;width:34px;height:7px;border-radius:3px;background:#b9bdbc"></div>`);
  }
  const teeth = [];
  const n = Math.floor(w / 14);
  for (let k = 0; k <= n; k++) teeth.push(`${(k / n) * 100}% ${k % 2 ? 100 : 97.5}%`);
  return `<div style="${ab(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 7px rgba(20,25,40,.32))`)}"><div style="position:absolute;inset:0;background:#fdfdfa;clip-path:polygon(0 0,100% 0,${teeth.reverse().join(",")})">${bars.join("")}</div></div>`;
}

/** Washi tape: a translucent striped strip. */
function tape({ x, y, w = 190, h = 54, rot = 0, a = "#2f6b57", b = "#f4efe2" }) {
  return `<div style="${ab(x, y, w, h, `transform:rotate(${rot}deg);background:repeating-linear-gradient(115deg,${a} 0 16px,${b} 16px 32px);opacity:.82;box-shadow:0 3px 6px rgba(40,40,40,.25);clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,97% 12%,100% 25%,97% 38%,100% 50%,97% 62%,100% 75%,97% 88%,100% 100%,9% 100%,6% 90%,3% 100%,0 92%)`)}"></div>`;
}

/** A stitched leather desk blotter with tan corner pieces. */
function blotter({ x, y, w, h, base = "#274236", edge = "#d9c9a3" }) {
  const corner = (cx, cy, rot) => `<div style="${ab(cx, cy, 96, 96, `transform:rotate(${rot}deg);background:linear-gradient(135deg,#b88a56,#9c6f3f);clip-path:polygon(0 0,100% 0,0 100%);box-shadow:0 2px 3px rgba(0,0,0,.3)`)}"></div>`;
  return `<div style="${ab(x, y, w, h, `border-radius:10px;background:radial-gradient(120% 90% at 25% 15%,${base} 0%,#1b2f26 100%);box-shadow:0 4px 6px rgba(0,0,0,.35),0 26px 50px rgba(0,0,0,.5)`)}"></div>
  <div style="${ab(x + 14, y + 14, w - 28, h - 28, `border:3px dashed ${edge};opacity:.45;border-radius:6px`)}"></div>
  ${corner(x, y, 0)}${corner(x + w - 96, y, 90)}`;
}

/** A pale marble slab with soft grey and gold veins. */
function marble({ top = SCENE_TOP, height = SCENE_H, seed = 11 }) {
  const rnd = seeded(seed);
  const veins = [];
  for (let k = 0; k < 16; k++) {
    let px = -20, py = rnd() * height;
    const pts = [`M${px} ${py}`];
    for (let s = 0; s < 6; s++) {
      px += 120 + rnd() * 90; py += (rnd() - 0.35) * 200;
      pts.push(`S ${px - 40 + rnd() * 30} ${py + (rnd() - 0.5) * 120}, ${px} ${py}`);
    }
    const col = k % 5 === 0 ? "#b79e6a" : k % 2 ? "#8d969a" : "#a3acaf";
    veins.push(`<path d="${pts.join(" ")}" fill="none" stroke="${col}" stroke-opacity="${(0.12 + rnd() * 0.2).toFixed(2)}" stroke-width="${(0.8 + rnd() * 2).toFixed(1)}" stroke-linecap="round"/>`);
  }
  return `<svg style="${ab(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><linearGradient id="mb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f3f0"/><stop offset=".55" stop-color="#e9e8e5"/><stop offset="1" stop-color="#dcdbd8"/></linearGradient><filter id="mblur"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <rect width="1000" height="${height}" fill="url(#mb)"/><g filter="url(#mblur)" opacity=".4">${veins.slice(0, 8).join("")}</g>${veins.join("")}
    <rect width="1000" height="${height}" fill="url(#mb)" opacity=".0"/></svg>`;
}

/** A phone lying flat, its camera pointed at the card: the screen shows the real page as the photo. */
function phoneFlat({ x, y, w = 300, rot = 0, page }) {
  const h = Math.round(w * 2.1);
  const sw = w - 24;
  return `<div style="${ab(x, y, w, h, `transform:rotate(${rot}deg);border-radius:52px;background:linear-gradient(145deg,#2a2c30,#0f1013);box-shadow:0 3px 4px rgba(0,0,0,.4),0 26px 44px rgba(20,25,30,.5)`)}">
    <div style="${ab(12, 12, sw, h - 24, "border-radius:42px;overflow:hidden;background:#0b0c0e")}">
      <div style="${ab(sw / 2 - 52, 14, 104, 28, "border-radius:14px;background:#000;z-index:3")}"></div>
      <img src="${page}" style="${ab(14, 62, sw - 28, 0, "height:auto;transform:rotate(-1.5deg);box-shadow:0 4px 12px rgba(0,0,0,.6)")}" alt="">
      <div style="${ab(sw / 2 - 36, h - 24 - 150, 72, 72, "border-radius:50%;border:5px solid #fff;z-index:3")}"><div style="position:absolute;inset:6px;border-radius:50%;background:#fff"></div></div>
    </div></div>`;
}

/* ----------------------------------------------------------------- pins */

// #3: Account inventory on a walnut desk and a green leather blotter.
const pin3 = printable({
  n: 3,
  paper: "#e8ddcb",
  scene: `
    ${desk({ top: SCENE_TOP, height: SCENE_H, base: "#6c4731", dark: "#553624", planks: 4, seed: 7 })}
    <div style="${ab(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(70% 60% at 38% 40%,rgba(255,214,150,.22),transparent 70%)")}"></div>
    ${blotter({ x: 24, y: 402, w: 800, h: 940 })}
    ${sheet({ src: bookPage(13), x: 92, y: 436, w: 660, tilt: -2.4 })}
    ${highlighter({ x: 742, y: 636, len: 260, rot: 5 })}
    ${pen({ x: 250, y: 840, len: 450, rot: -12 })}
    ${mug({ x: 770, y: 1118, size: 175, color: "#e9efe9", drink: "#4a2d1a" })}`,
});

// #7: Subscription decisions on an indigo clipboard in a wooden tray, receipts beside.
const clip7 = (() => {
  const x = 62, y = 436, w = 652, h = 980;
  return `
    <div style="${ab(x, y, w, h, "background:linear-gradient(135deg,#454d78,#2f3659);border-radius:22px;box-shadow:0 4px 6px rgba(10,10,30,.35),0 28px 50px rgba(10,10,30,.5)")}"></div>
    ${sheet({ src: bookPage(26), x: 100, y: 462, w: 560, tilt: -3 })}
    ${sheet({ src: bookPage(27), x: 112, y: 712, w: 580, tilt: 2 })}
    <div style="${ab(x + w / 2 - 92, y - 30, 184, 78, "border-radius:14px;background:linear-gradient(#e8eaed,#a5a9b0);box-shadow:0 6px 10px rgba(0,0,0,.4)")}"></div>
    <div style="${ab(x + w / 2 - 60, y - 46, 120, 34, "border-radius:12px 12px 0 0;background:linear-gradient(#f5f6f8,#b9bdc4);box-shadow:0 3px 6px rgba(0,0,0,.28)")}"></div>`;
})();
const pin7 = printable({
  n: 7,
  paper: "#dfe8e2",
  scene: `
    <div style="${ab(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(90% 70% at 30% 20%,#7a8ba0,#566679)")}"></div>
    <div style="${ab(14, 398, 972, 1000, "border-radius:34px;background:linear-gradient(135deg,#c79a63,#a87a45);box-shadow:0 6px 10px rgba(20,25,40,.4),0 34px 60px rgba(20,25,40,.5)")}"></div>
    <div style="${ab(38, 422, 924, 960, "border-radius:22px;background:repeating-linear-gradient(0deg,rgba(150,110,60,.08) 0 2px,transparent 2px 15px),linear-gradient(135deg,#e2cfa6,#d2b98b);box-shadow:inset 0 5px 12px rgba(80,50,20,.35)")}"></div>
    ${clip7}
    ${receipt({ x: 742, y: 470, w: 176, h: 440, rot: 6, seed: 4, lines: 15 })}
    ${receipt({ x: 770, y: 560, w: 160, h: 420, rot: -4, seed: 9, lines: 14 })}
    ${binderClip({ x: 770, y: 478, rot: 6, size: 92 })}
    ${pen({ x: 520, y: 1230, len: 420, rot: -20, body: "#1d1f24", trim: "#c4c8ce" })}`,
});

// #11: Debt payoff comparison on a white desk, a laptop deck and calculator at the edge.
const pin11 = printable({
  n: 11,
  paper: "#e7ecee",
  scene: `
    <div style="${ab(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(110% 80% at 30% 15%,#fdfdfc 0%,#eceeee 55%,#d7dadc 100%)")}"></div>
    ${laptopDeck({ cx: 1000, cy: 700, rot: 3 })}
    ${sheet({ src: bookPage(38), x: 46, y: 424, w: 650, tilt: -1.8 })}
    ${pencil({ x: 90, y: 1282, len: 440, rot: -2, body: "#b2573a" })}
    ${pencil({ x: 190, y: 1314, len: 420, rot: -1, body: "#3f7f5f" })}
    ${calculator({ x: 748, y: 1010, w: 215, rot: -9 })}`,
});

// #15: Quick reference card taped to a marble slab, a phone just photographed it.
const pin15 = printable({
  n: 15,
  paper: "#efebe5",
  scene: `
    ${marble({ seed: 11 })}
    ${sheet({ src: bookPage(79), x: 40, y: 424, w: 610, tilt: -2.2 })}
    ${tape({ x: -45, y: 398, rot: -38, w: 150 })}
    ${tape({ x: 590, y: 384, rot: 36, w: 150, a: "#c9805b" })}
    ${tape({ x: 250, y: 1176, rot: -3, w: 190, a: "#d9a441" })}
    ${phoneFlat({ x: 700, y: 470, w: 262, rot: 5, page: bookPage(79) })}
    ${mug({ x: 700, y: 1130, size: 150, color: "#26282c", drink: "#3b2214" })}`,
});

// #23: January's two review pages as a spread, fanned over February to December in an open ring binder on linen.
const MONTHS = ["February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TABS = ["#c9805b", "#d9a441", "#8fae7b", "#6f9fb0", "#9a8fc4", "#c4789a", "#b5a07a", "#7f9c8e", "#cc8f6a", "#d1b24a", "#7aa0c0"];
const PW = 400, PH = Math.round(PW * 2200 / 1700);
const OX = 30;
const SPINE = OX + PW;
const fan = MONTHS.map((m, k) => `
  <div style="${ab(SPINE, 0, PW, PH, `transform-origin:0 100%;transform:rotate(${(k * 0.75).toFixed(2)}deg);z-index:${20 - k}`)}">
    <div style="position:absolute;inset:0;background:#fbfaf7;box-shadow:0 2px 6px rgba(40,25,5,.3);overflow:hidden"><img src="${bookPage(56 + 2 * k)}" style="width:${PW}px;display:block" alt=""></div>
    <div style="${ab(PW - 2, 3 + k * 49.5, 128, 44, `background:${TABS[k]};border-radius:0 9px 9px 0;box-shadow:2px 3px 5px rgba(40,25,5,.3);display:flex;align-items:center;padding-left:12px;font:600 22px/1 Plex,sans-serif;color:#1d1d20`)}">${m}</div>
  </div>`).join("");
const ring = (y) => `<svg style="${ab(SPINE - 30, y, 60, 80, "filter:drop-shadow(2px 5px 4px rgba(30,20,5,.4))")}" viewBox="0 0 60 80" aria-hidden="true"><defs><linearGradient id="rg${y}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".5" stop-color="#a7adb4"/><stop offset="1" stop-color="#e3e6ea"/></linearGradient></defs><path d="M12 76 V26 a18 18 0 0 1 36 0 V76" fill="none" stroke="url(#rg${y})" stroke-width="8" stroke-linecap="round"/><rect x="6" y="66" width="48" height="12" rx="4" fill="#80868d"/></svg>`;
const pin23 = printable({
  n: 23,
  paper: "#f1e8d4",
  extraCss: ".top h1{font-size:64px}",
  scene: `
    <div style="${ab(0, SCENE_TOP, 1000, SCENE_H, "background:radial-gradient(90% 70% at 40% 25%,#efe6d2,#d9ceb5)")}"></div>
    <div style="${ab(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(0deg,rgba(110,90,55,.07) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(110,90,55,.07) 0 1px,transparent 1px 4px)")}"></div>
    <div style="${ab(0, 470, 1000, 640, "transform:rotate(-2.6deg);transform-origin:50% 50%")}">
      <div style="${ab(OX - 14, 0, 2 * PW + 28, PH + 90, "border-radius:18px;background:linear-gradient(135deg,#27493c,#173128);box-shadow:0 5px 8px rgba(30,20,5,.35),0 30px 54px rgba(30,20,5,.5)")}"></div>
      <div style="${ab(OX, 44, PW, PH, "")}">
        <div style="position:absolute;inset:0;background:#fbfaf7;box-shadow:0 2px 4px rgba(40,25,5,.3);overflow:hidden"><img data-check="page" src="${bookPage(54)}" style="width:${PW}px;display:block" alt=""></div>
      </div>
      <div style="${ab(0, 44, 0, 0, "")}">${fan}
        <div style="${ab(SPINE, 0, PW, PH, "z-index:30;background:#fbfaf7;box-shadow:0 2px 4px rgba(40,25,5,.3);overflow:hidden")}"><img data-check="page" src="${bookPage(55)}" style="width:${PW}px;display:block" alt=""></div>
      </div>
      <div style="${ab(SPINE - 8, 44, 16, PH, "background:linear-gradient(90deg,transparent,rgba(40,25,5,.22),transparent);z-index:40")}"></div>
      <div style="position:absolute;left:0;top:44px;width:0;height:0;z-index:50">${ring(30)}${ring(PH / 2 - 40)}${ring(PH - 120)}</div>
    </div>
    ${mug({ x: 60, y: 1150, size: 160, color: "#f3ede4", drink: "#6b4226" })}
    ${pen({ x: 330, y: 1250, len: 440, rot: -5 })}`,
});

export const pins = [pin3, pin7, pin11, pin15, pin23];
