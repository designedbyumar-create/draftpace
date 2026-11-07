/**
 * Four printed-page mockups made from the real record pages the product's own
 * code produced (out/homeschool/assets) and the real working page of the book:
 *   88  evaluation prep   kraft folder, three pages sliding out, on pale stone
 *   80  Pennsylvania      the real state page on a sage mat, beside a plum binder
 *   45  three tick boxes  the real Record card floating, the real cover behind
 *   52  attendance        the real 'Days schooled' page on a cream wall
 * No page or screen is altered; props carry no words or numbers.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { sheet, pencil, binderClip } from "../kit/paper.mjs";
import { bookPage, asset, screen } from "../kit/assets.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const PLUM = "#6d4a78";
/** Two-line sub-lines: lift the header block a little so it ends above the scene. */
const TIGHT = ".top{top:46px}.top h1{margin-top:10px}";

/** A strip of washi tape across a page corner. */
function tape({ x, y, w = 190, h = 56, rot = 0, color = "#e9b8c4", stripe = "#fff" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 22px,rgba(255,255,255,.35) 22px 30px);opacity:.88;clip-path:polygon(0 8%,3% 0,6% 10%,9% 0,100% 0,100% 100%,9% 100%,6% 90%,3% 100%,0 92%);box-shadow:0 2px 4px rgba(40,20,5,.25);filter:drop-shadow(0 3px 3px rgba(40,20,5,.25))`)}"></div>`;
}

/** A round-headed push pin seen from the front. */
function pin({ x, y, size = 64, color = "#c4573e" }) {
  return `<svg style="${abs(x, y, size, size, "filter:drop-shadow(5px 9px 5px rgba(40,20,5,.4))")}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="${color}"/><circle cx="32" cy="32" r="26" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/><circle cx="32" cy="32" r="15" fill="#fff" opacity=".1"/><ellipse cx="22" cy="21" rx="10" ry="6" fill="#fff" opacity=".5" transform="rotate(-35 22 21)"/></svg>`;
}

// ---------------------------------------------------------------- 88
const folder = {
  back: `<div style="${abs(40, 590, 920, 900, "background:linear-gradient(#c9a577,#b78f5c);border-radius:22px 22px 0 0;box-shadow:0 -2px 4px rgba(40,20,5,.2),0 30px 50px rgba(40,20,5,.35)")}"></div>
    <div style="${abs(560, 548, 250, 62, "background:linear-gradient(#cdaa7c,#bd9663);border-radius:18px 18px 0 0;box-shadow:0 -3px 5px rgba(40,20,5,.18)")}"></div>`,
  front: `<div style="${abs(20, 1170, 960, 400, "background:linear-gradient(#d7b583,#c19a66);border-radius:20px 20px 0 0;box-shadow:0 -6px 14px rgba(40,20,5,.35),inset 0 3px 0 rgba(255,255,255,.35)")}"></div>
    <div style="${abs(20, 1170, 960, 400, "border-radius:20px 20px 0 0;background:repeating-linear-gradient(100deg,transparent 0 9px,rgba(120,80,30,.045) 9px 10px)")}"></div>
    <div style="${abs(690, 1128, 230, 50, "background:linear-gradient(#d9b887,#d3b080);border-radius:16px 16px 0 0;box-shadow:0 -4px 8px rgba(40,20,5,.25),inset 0 3px 0 rgba(255,255,255,.35)")}"></div>`,
};
const stone = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${H}px" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .4  0 0 0 0 .33  0 0 0 .09 0"/></filter>
  <radialGradient id="stl" cx="30%" cy="10%" r="100%"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#ddd6c8"/></radialGradient></defs>
  <rect width="1000" height="${H}" fill="url(#stl)"/><rect width="1000" height="${H}" filter="url(#grain)"/>
  <path d="M-20 160 C 180 120 260 230 470 190 S 800 120 1020 230" fill="none" stroke="#b9b0a0" stroke-opacity=".28" stroke-width="2"/>
  <path d="M120 -10 C 160 120 90 260 230 420 S 330 700 300 1000" fill="none" stroke="#b9b0a0" stroke-opacity=".2" stroke-width="1.6"/></svg>`;

const scene88 = `${stone}
  ${folder.back}
  ${sheet({ src: asset("record-oregon-p4.png"), x: 70, y: 470, w: 560, tilt: -8, id: "p-log" })}
  ${sheet({ src: asset("record-oregon-p2.png"), x: 395, y: 440, w: 560, tilt: 6, id: "p-state" })}
  ${sheet({ src: asset("record-oregon-p1.png"), x: 215, y: 625, w: 560, tilt: -1.5, id: "p-cover" })}
  ${folder.front}
  ${binderClip({ x: 676, y: 584, rot: -3, size: 96 })}
  ${pencil({ x: 330, y: 1275, len: 400, rot: -5 })}`;

// ---------------------------------------------------------------- 80
const sage = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${H}px" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
  <filter id="gr2"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .16 0"/></filter>
  <radialGradient id="sg" cx="28%" cy="12%" r="105%"><stop offset="0" stop-color="#c6d2bc"/><stop offset="1" stop-color="#8c9e85"/></radialGradient></defs>
  <rect width="1000" height="${H}" fill="url(#sg)"/><rect width="1000" height="${H}" filter="url(#gr2)"/></svg>`;

/** A closed ring binder seen from above: plum cloth cover, spine and rings at the left, a blank label card. */
function binder({ x, y, w = 400, h = 520, rot = 0 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg)`)}">
    <div style="position:absolute;inset:0;border-radius:14px 22px 22px 14px;background:linear-gradient(120deg,#7b5588,#5f3f6b);box-shadow:0 3px 5px rgba(30,10,40,.35),0 30px 50px rgba(30,10,40,.45)"></div>
    <div style="position:absolute;inset:0;border-radius:14px 22px 22px 14px;background:repeating-linear-gradient(45deg,rgba(255,255,255,.035) 0 3px,transparent 3px 6px)"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:62px;border-radius:14px 0 0 14px;background:linear-gradient(90deg,#4b2f56,#6a4777);box-shadow:inset -3px 0 5px rgba(0,0,0,.25)"></div>
    <div style="position:absolute;left:62px;top:0;bottom:0;width:3px;background:rgba(255,255,255,.18)"></div>
    <div style="position:absolute;left:130px;top:70px;width:200px;height:110px;border-radius:6px;background:#f6f0e3;box-shadow:0 2px 3px rgba(0,0,0,.3),inset 0 0 0 4px #d8c9a8"></div>
  </div>`;
}

const scene80 = `${sage}
  ${sheet({ src: asset("record-pa-p1.png"), x: 360, y: 395, w: 560, tilt: 9, id: "p-cover" })}
  ${binder({ x: 610, y: 950, w: 380, h: 520, rot: 7 })}
  ${sheet({ src: asset("record-pa-p2.png"), x: 50, y: 430, w: 640, tilt: -4, id: "p-state" })}
  ${pencil({ x: 80, y: 1290, len: 400, rot: 4 })}`;

// ---------------------------------------------------------------- 45
const plumRoom = `<div style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${H}px;overflow:hidden;background:linear-gradient(160deg,#e6d9ee 0%,#f1e9ea 48%,#f7efe2 100%)">
  <div style="position:absolute;left:-220px;top:-120px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(109,74,120,.34),transparent 68%)"></div>
  <div style="position:absolute;left:520px;top:520px;width:720px;height:720px;border-radius:50%;background:radial-gradient(circle,rgba(224,169,90,.28),transparent 66%)"></div>
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(135deg,rgba(109,74,120,.035) 0 2px,transparent 2px 26px)"></div></div>`;

const CARD_W = 560, SC = CARD_W / 358, CARD_H = Math.round(414 * SC);
const card = `<div data-check="page" style="${abs(48, 455, CARD_W, CARD_H, `transform:rotate(-3deg);border-radius:${Math.round(16 * SC)}px;overflow:hidden;box-shadow:0 0 0 1px rgba(109,74,120,.18),0 0 90px 10px rgba(109,74,120,.45),0 34px 60px -10px rgba(40,20,60,.45)`)}"><img src="${screen("record")}" style="position:absolute;left:${-16 * SC}px;top:${-316 * SC}px;width:${390 * SC}px;display:block" alt=""></div>`;

const scene45 = `${plumRoom}
  ${sheet({ src: asset("record-oregon-p1.png"), x: 390, y: 700, w: 560, tilt: 6, id: "p-cover" })}
  ${card}`;

// ---------------------------------------------------------------- 52
const wall = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${H}px" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs>
  <filter id="gr3"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .42  0 0 0 0 .3  0 0 0 .1 0"/></filter>
  <linearGradient id="win" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="wl" cx="20%" cy="8%" r="110%"><stop offset="0" stop-color="#f8f0df"/><stop offset="1" stop-color="#e2d4b8"/></radialGradient></defs>
  <rect width="1000" height="${H}" fill="url(#wl)"/>
  ${Array.from({ length: 9 }, (_, k) => `<rect x="${k * 125 + 58}" y="0" width="9" height="${H}" fill="#b49a6e" opacity=".13"/><rect x="${k * 125 + 67}" y="0" width="3" height="${H}" fill="#fff" opacity=".3"/>`).join("")}
  <rect width="1000" height="${H}" filter="url(#gr3)"/>
  <polygon points="520,0 760,0 360,${H} 120,${H}" fill="url(#win)" opacity=".7"/></svg>`;

const shelfY = SCENE_TOP + 880;
const shelf = `<div style="${abs(40, shelfY, 920, 26, "background:linear-gradient(#c99b66,#a9743c);border-radius:4px;box-shadow:0 3px 5px rgba(40,20,5,.35),0 20px 26px rgba(40,20,5,.3)")}"></div>
  ${[120, 800].map((bx) => `<div style="${abs(bx, shelfY + 26, 34, 58, "background:linear-gradient(90deg,#8d5d2c,#a9743c);border-radius:0 0 6px 6px;box-shadow:0 8px 10px rgba(40,20,5,.3)")}"></div>`).join("")}`;

/** A potted plant: terracotta-and-cream pot, fan of leaves. Origin is the bottom of the pot. */
function plant({ x, y, s = 1 }) {
  const leaves = [[-62, 120, "#6f9467"], [-34, 160, "#82a876"], [-8, 188, "#6f9467"], [20, 170, "#8aae7e"], [48, 138, "#6f9467"], [70, 100, "#7aa070"], [-76, 80, "#7aa070"]];
  return `<svg style="${abs(x, y - 260 * s, 220 * s, 260 * s, "filter:drop-shadow(0 12px 8px rgba(40,20,5,.3))")}" viewBox="0 0 220 260" aria-hidden="true">
    ${leaves.map(([a, l, c]) => `<g transform="translate(110 150) rotate(${a})"><path d="M0 0 C -26 -${l * 0.35}, -16 -${l * 0.85}, 0 -${l} C 16 -${l * 0.85}, 26 -${l * 0.35}, 0 0 Z" fill="${c}"/><path d="M0 0 L0 -${l * 0.92}" stroke="#fff" stroke-opacity=".28" stroke-width="2"/></g>`).join("")}
    <path d="M44 150 H176 L160 256 H60 Z" fill="#d4825a"/><rect x="38" y="140" width="144" height="26" rx="6" fill="#df9168"/><path d="M60 256 H160 L162 240 H58 Z" fill="#000" opacity=".08"/>
    <rect x="38" y="140" width="144" height="8" rx="4" fill="#fff" opacity=".2"/></svg>`;
}

/** A small wall calendar silhouette: no dates, no numbers. */
function calendar({ x, y, w = 210, rot = 3 }) {
  const h = w * 1.2;
  const cells = Array.from({ length: 30 }, (_, k) => `<rect x="${14 + (k % 6) * 30}" y="${58 + Math.floor(k / 6) * 28}" width="22" height="19" rx="3" fill="#b8a98f" opacity=".5"/>`).join("");
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 10px rgba(40,20,5,.35))`)}" viewBox="0 0 200 240" aria-hidden="true">
    <rect width="200" height="240" rx="8" fill="#fbf8f1"/><path d="M0 8 Q0 0 8 0 H192 Q200 0 200 8 V44 H0 Z" fill="${PLUM}"/>
    <circle cx="60" cy="14" r="5" fill="#2a1a30" opacity=".5"/><circle cx="140" cy="14" r="5" fill="#2a1a30" opacity=".5"/>${cells}</svg>
    <div style="${abs(x + w / 2 - 7, y - 16, 14, 14, "border-radius:50%;background:#9a9aa0;box-shadow:0 3px 3px rgba(0,0,0,.35)")}"></div>`;
}

const PW = 600;
const scene52 = `${wall}
  ${sheet({ src: bookPage(19), x: 70, y: 440, w: PW, tilt: -2, id: "p-days" })}
  ${tape({ x: -16, y: 420, w: 160, rot: -40, color: "#e4a9b8" })}
  ${tape({ x: 606, y: 1178, w: 160, rot: -40, color: "#a9c4a0" })}
  ${pin({ x: 628, y: 424, size: 70 })}
  ${calendar({ x: 745, y: 520, w: 210, rot: 3 })}
  ${shelf}
  ${plant({ x: 700, y: shelfY, s: 1.1 })}`;

export const pins = [
  printable({ n: 88, scene: scene88, extraCss: TIGHT }),
  printable({ n: 80, scene: scene80, extraCss: ".top{top:100px}.top h1{font-size:76px}" }),
  printable({ n: 45, scene: scene45 }),
  printable({ n: 52, scene: scene52, extraCss: TIGHT }),
];
