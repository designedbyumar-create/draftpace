/**
 * ADHD Life Companion guide pins, world w05: kitchen counter and fridge
 * (sage-cream, terracotta, white; fruit bowl, mug, fridge door with magnets and a calendar, tea towel, tiled splashback).
 *
 * #10 script-card   sage tile splashback; a recipe box of tabbed cards, the "Charged twice" card lifted out with its line large
 * #63 checklist     a white fridge door: a magnetic list pad with the six steps, a month calendar with circled dates, kraft envelopes
 * #65 scenario      a terracotta wall: a wall calendar with the 4th, 12th and 13th, a phone with a text bubble on the counter edge
 * #66 before-after  oak butcher-block counter from above: five sticky notes, one lifted forward with Tuesday circled
 * #69 before-after  sage laminate counter from above, a striped tea towel: one month of three bills, before and after
 *
 * Every picture here is drawn (flat vector); no app screen and no book page is used.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { mug } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const INK = "#231a1f";
const MUL = C.mulberry;
const MULD = C.mulberryDeep;
const TERRA = "#b8654a";
const TERRAD = "#9a4f38";
const SAGE = "#a9b99a";
const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};

/** The paper header block (eyebrow, headline, optional sub) and footer band every pin here shares. */
function frame(i, { paper, size = 72, eyebrow, headline, sub = null, textTop = 64, extraCss = "" }) {
  const [e0, rest] = i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px rgba(40,20,5,.3);z-index:20}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(40,20,5,.3);z-index:20}
  .foot{z-index:22}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:21}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:14px;color:${INK}}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4b4339;max-width:840px}
  ${extraCss}`;
  const ey = eyebrow ?? e0;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${SCENE_TOP - 6}">${ey ? `<div class="eyebrow">${esc(ey)}</div>` : ""}<h1>${esc(headline ?? rest)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

const exampleTag = (style = "") => `<span class="example" style="font-size:24px;padding:5px 12px;${style}">Example</span>`;

/* ------------------------------------------------------------ shared props */

/** A top-down fruit bowl: terracotta bowl, lemons, limes and oranges. */
function fruitBowl({ x, y, s = 320, rot = 0 }) {
  const r = rng(5);
  const fruit = [
    ["#f0d24a", "#d8b52c", 0.0, -0.2, 40, 30, 20],
    ["#f0d24a", "#d8b52c", 0.28, 0.1, 40, 30, -50],
    ["#9fb86a", "#7e9a4c", -0.28, 0.12, 31, 31, 0],
    ["#e8934a", "#c9722c", 0.0, 0.25, 36, 36, 0],
    ["#9fb86a", "#7e9a4c", 0.22, -0.32, 28, 28, 0],
    ["#e8934a", "#c9722c", -0.25, -0.3, 33, 33, 0],
  ];
  const fr = fruit.map(([a, b, fx, fy, rx, ry, rr]) => `<g transform="translate(${150 + fx * 190} ${150 + fy * 190}) rotate(${rr})"><ellipse cx="4" cy="8" rx="${rx}" ry="${ry}" fill="#000" fill-opacity=".22"/><ellipse rx="${rx}" ry="${ry}" fill="${a}"/><ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${b}" stroke-width="3"/><ellipse cx="${-rx * 0.35}" cy="${-ry * 0.35}" rx="${rx * 0.35}" ry="${ry * 0.22}" fill="#fff" fill-opacity=".35"/><circle cx="${rx * 0.2}" cy="${ry * 0.15}" r="2.5" fill="${b}"/></g>`).join("");
  void r;
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 18px 14px rgba(40,20,5,.35))`)}" viewBox="0 0 300 300" aria-hidden="true">
    <defs><radialGradient id="fb${x}${y}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#d9805f"/><stop offset="1" stop-color="${TERRAD}"/></radialGradient></defs>
    <circle cx="150" cy="150" r="144" fill="url(#fb${x}${y})"/><circle cx="150" cy="150" r="144" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    <circle cx="150" cy="150" r="124" fill="#8a4430"/><circle cx="150" cy="152" r="116" fill="#a45a40"/>${fr}</svg>`;
}

/** A cream-and-terracotta striped tea towel with a woven texture. */
function towel({ x, y, w, h, rot = 0, stripe = TERRA }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(${stripe} 0 14px,transparent 14px 26px,${stripe} 26px 32px,transparent 32px calc(100% - 32px),${stripe} calc(100% - 32px) calc(100% - 26px),transparent calc(100% - 26px) calc(100% - 14px),${stripe} calc(100% - 14px)),repeating-linear-gradient(90deg,rgba(0,0,0,.035) 0 2px,transparent 2px 6px),#f6efe2;box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 26px rgba(40,20,5,.35);border-radius:3px`)}"></div>`;
}

/** A butter sticky note with handwriting. */
function note({ x, y, w = 200, h = 200, rot = 0, text = "", size = 36, color = MULD, fade = false, z = 1, extra = "", shadow = "0 2px 3px rgba(40,20,5,.3),0 12px 16px rgba(40,20,5,.3)" }) {
  const a = fade ? "#efe2b3" : "#f7e18f";
  const b = fade ? "#e7d49a" : "#efcb68";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${a},${b});box-shadow:${shadow};z-index:${z};display:grid;place-items:center;text-align:center;padding:10px 14px;${fade ? "opacity:.86;" : ""}${extra}`)}"><div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></div><span class="hand" style="position:relative;font:600 ${size}px/1.04 'Hand',cursive;color:${color}">${text}</span></div>`;
}

/** A kraft envelope from above. */
function envelope({ x, y, w = 220, rot = 0, c1 = "#d9b98a", c2 = "#c9a574", z = 1 }) {
  const h = Math.round(w * 0.66);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 10px 8px rgba(40,20,5,.35))`)}" viewBox="0 0 260 172" aria-hidden="true">
    <rect width="260" height="172" rx="6" fill="${c1}"/><path d="M0 172 L104 84 M260 172 L156 84" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <path d="M0 0 L130 98 L260 0 Z" fill="${c2}"/><path d="M0 0 L130 98 L260 0" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="2"/></svg>`;
}

/** A round fridge magnet with a soft highlight. */
function magnet({ x, y, s = 56, c = TERRA, z = 6 }) {
  return `<div style="${abs(x, y, s, s, `z-index:${z};border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff8,transparent 40%),${c};box-shadow:0 2px 2px rgba(0,0,0,.35),0 8px 10px rgba(30,40,30,.3)`)}"></div>`;
}

function lemonMagnet({ x, y, rot = 0, z = 6 }) {
  return `<svg style="${abs(x, y, 92, 66, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 6px 6px rgba(30,40,30,.4))`)}" viewBox="0 0 92 66" aria-hidden="true"><path d="M4 33 C10 10 30 4 46 4 C62 4 82 10 88 33 C82 56 62 62 46 62 C30 62 10 56 4 33Z" fill="#f0d24a"/><path d="M4 33 C10 10 30 4 46 4 C62 4 82 10 88 33 C82 56 62 62 46 62 C30 62 10 56 4 33Z" fill="none" stroke="#d1ac22" stroke-width="3"/><ellipse cx="32" cy="22" rx="16" ry="7" fill="#fff" fill-opacity=".4"/><path d="M70 6 C78 -2 88 0 92 4 C84 10 76 10 70 6Z" fill="#7e9a4c"/></svg>`;
}

/** A ballpoint pen. */
function pen({ x, y, len = 360, rot = 0, body = MULD, trim = "#d6b36a", z = 3 }) {
  return `<svg style="${abs(x, y, len, 34, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(30,15,10,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;
}

/** A hand-drawn tick in the one-thing colour. */
const tick = (c = MUL) => `<svg style="position:absolute;left:-4px;top:-18px" width="58" height="58" viewBox="0 0 58 58" aria-hidden="true"><path d="M9 30 L22 43 C 28 28, 38 14, 54 3" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** A wobbly hand-drawn ring (hollow ellipse) as an SVG path. */
function ring({ x, y, w, h, color = MUL, sw = 8, rot = -3, z = 8, seed = 2 }) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2;
  let d = "";
  const N = 28;
  for (let k = 0; k <= N + 3; k++) {
    const a = (k / N) * Math.PI * 2 - 0.6;
    const wob = 1 + (r() - 0.5) * 0.05 + (k > N ? 0.05 * (k - N) : 0);
    const px = cx + Math.cos(a) * (w / 2 - sw) * wob;
    const py = cy + Math.sin(a) * (h / 2 - sw) * wob;
    d += `${k ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
  }
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);overflow:visible`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ================================================================== #10 */
/** A tab-and-card in the recipe box: a cream card top with a raised tab and its label. */
function boxCard({ x, y, label }) {
  return `<div style="${abs(x, y, 880 / 4, 120, "z-index:3")}">
    <div style="position:absolute;left:0;right:0;top:56px;bottom:0;background:linear-gradient(#fbf4e4,#f3e9d1);box-shadow:inset 0 2px 0 #fffdf4"></div>
    <div style="position:absolute;left:8px;top:0;width:204px;height:66px;background:linear-gradient(#fcf6e8,#f6ecd6);border-radius:12px 12px 0 0;border:2px solid #e2d3b0;border-bottom:0;box-shadow:0 -2px 4px rgba(40,20,5,.12);display:grid;place-items:center;text-align:center">
      <span style="font:600 22px/1.12 'Plex',sans-serif;color:${INK}">${label}</span></div></div>`;
}

function p10() {
  const n = 10;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e8ecdf", size: 72, sub: i.sub });

  // Sage tile splashback: individual glossy square tiles with grout.
  const r = rng(21);
  let tiles = "";
  const TS = 112;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      const shade = r();
      const base = ["#c7d5bb", "#cfdcc4", "#c1d0b4", "#d3dfc9"][Math.floor(shade * 4)];
      tiles += `<div style="${abs(col * TS - 6, SCENE_TOP + row * TS - 4, TS - 4, TS - 4, `background:linear-gradient(140deg,rgba(255,255,255,.35),transparent 45%),${base};border-radius:5px;box-shadow:inset 0 0 0 2px rgba(255,255,255,.18)`)}"></div>`;
    }
  }
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 430, "background:#e6ece0")}"></div>${tiles}`;
  // Counter top: cream with speckle, and the shadow where it meets the tiles.
  const speck = Array.from({ length: 170 }, () => `<i style="position:absolute;left:${(r() * 1000).toFixed(0)}px;top:${(r() * 570).toFixed(0)}px;width:${(2 + r() * 4).toFixed(1)}px;height:${(2 + r() * 3).toFixed(1)}px;border-radius:50%;background:${r() > 0.5 ? "#b9ad8c" : "#fffdf0"};opacity:.55"></i>`).join("");
  const counter = `<div style="${abs(0, 790, 1000, 564, "background:linear-gradient(#ebe4cf,#e3dac1 40%,#dcd2b6);overflow:hidden")}">${speck}<div style="position:absolute;left:0;right:0;top:0;height:46px;background:linear-gradient(rgba(60,70,50,.38),transparent)"></div></div>`;

  // The lifted-out card, leaning behind the box: quote marks in mulberry, the real sentence large.
  const sentence = i.items[1].split(": ").slice(1).join(": ");
  const tabLabel = i.items[1].split(": ")[0];
  const card = `
  <div style="${abs(40, 512, 730, 610, "transform:rotate(-1.8deg);z-index:2")}">
    <div style="position:absolute;left:28px;top:-58px;width:300px;height:62px;border-radius:12px 12px 0 0;background:#fcf6e8;border:2px solid #e2d3b0;border-bottom:0;display:grid;place-items:center"><span class="hand" style="font:700 42px/1 'Hand',cursive;color:${MULD}">${esc(tabLabel)}</span></div>
    <div style="position:absolute;inset:0;background:#fcf6e8;border-radius:8px;box-shadow:0 3px 4px rgba(40,50,30,.3),0 34px 46px rgba(40,50,30,.5);background-image:repeating-linear-gradient(transparent 0 68px,#e8d6cf 68px 70px);background-position:0 36px">
      <div style="position:absolute;left:0;right:0;top:0;height:6px;background:#e9c9d3;border-radius:8px 8px 0 0"></div>
      <div data-check="sentence" style="position:absolute;left:50px;right:30px;top:38px;height:500px;font:500 60px/70px 'Newsreader',Georgia,serif;letter-spacing:-.01em;color:${INK}"><span style="color:${MUL};font-size:110px;line-height:0;vertical-align:-34px;margin-right:6px">“</span>${esc(sentence)}<span style="color:${MUL};font-size:110px;line-height:0;vertical-align:-34px;margin-left:4px">”</span></div>
    </div></div>`;

  // The recipe box: four slots, the second one empty (its card is the one lifted out).
  const cardsX = 40;
  const slotW = 220;
  const boxCards = [
    [0, i.items[0].split(": ")[0]],
    [2, i.items[2].split(": ")[0]],
    [3, i.items[3].split(": ")[0]],
  ].map(([s, label]) => boxCard({ x: cardsX + s * slotW, y: 1032, label: label.replace(/^(\S+ \S+) /, "$1<br>").replace("Charge you don't recognize", "Charge you don't<br>recognize") })).join("");
  const slot = `<div style="${abs(cardsX + slotW + 6, 1082, slotW - 12, 70, "background:linear-gradient(#5b2f22,#7c4130);z-index:2")}"></div>`;
  const box = `
  <div style="${abs(22, 1082, 936, 70, "background:linear-gradient(#6b3828,#7c4130);border-radius:14px 14px 0 0;z-index:1")}"></div>
  ${slot}${boxCards}
  <div style="${abs(22, 1140, 936, 190, `background:linear-gradient(#cf7656,${TERRA} 35%,${TERRAD});border-radius:12px 12px 22px 22px;box-shadow:0 3px 4px rgba(40,20,10,.35),0 24px 32px rgba(40,30,20,.45);z-index:4`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:8px;background:rgba(255,230,210,.45);border-radius:12px 12px 0 0"></div>
    <div style="position:absolute;left:50%;top:50px;width:180px;height:84px;margin-left:-90px;border-radius:10px;background:linear-gradient(#e9cf8a,#c9a54f);box-shadow:inset 0 0 0 4px #b58d3a,0 3px 5px rgba(0,0,0,.3)"><div style="position:absolute;inset:14px;border-radius:5px;background:#f6ecd0"></div></div>
  </div>`;

  // A folded bill (trifold, blurred lines, no words, no figures) leaning at the right, and a mug.
  const bars = (ys, ws) => ys.map((y, k) => `<div style="position:absolute;left:22px;top:${y}px;width:${ws[k]}px;height:10px;border-radius:5px;background:#c9ccd1"></div>`).join("");
  const bill = `
  <div style="${abs(800, 500, 170, 340, "transform:rotate(5deg);z-index:2")}">
    <div style="position:absolute;inset:0;background:linear-gradient(#ffffff,#f1f1ee);box-shadow:0 2px 3px rgba(40,50,30,.3),0 20px 28px rgba(40,50,30,.4);border-radius:3px"></div>
    <div style="position:absolute;left:0;right:0;top:118px;height:3px;background:rgba(0,0,0,.1)"></div><div style="position:absolute;left:0;right:0;top:240px;height:3px;background:rgba(0,0,0,.1)"></div>
    <div style="position:absolute;left:22px;top:24px;width:60px;height:34px;border-radius:6px;background:${SAGE}"></div>
    ${bars([84, 140, 160, 180, 262, 282], [118, 120, 90, 110, 100, 126])}
  </div>`;
  const cup = mug({ x: 800, y: 900, size: 112, color: "#fbf7ee", drink: "#6b4226" });

  const body = `${wall}${counter}${card}${box}${bill}${cup}${fh}`;
  return { n, id: `${n}-wrong-charge-on-your-bill-four-opening-lines`, html: page(p, { body, css: fc, paper: "#e8ecdf" }) };
}

/* ================================================================== #63 */
function p63() {
  const n = 63;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e6eadf", size: 76, textTop: 80 });

  // Fridge door: white enamel with a soft sheen, the door seam, a chrome handle, sage cabinet edges.
  const door = `
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background:linear-gradient(90deg,#dfe3dc 0,#f6f8f4 9%,#f1f4ee 60%,#e8ece5 94%,#cfd5cb 100%)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(70% 45% at 30% 20%,rgba(255,255,255,.7),transparent 70%)")}"></div>
  <div style="${abs(0, 664, 1000, 6, "background:linear-gradient(#cfd4cc,#f9fbf7);box-shadow:0 3px 5px rgba(30,40,30,.25)")}"></div>
  <div style="${abs(0, SCENE_TOP, 12, 982, `background:${SAGE}`)}"></div><div style="${abs(988, SCENE_TOP, 12, 982, `background:${SAGE}`)}"></div>
  <div style="${abs(28, 724, 26, 400, "border-radius:13px;background:linear-gradient(90deg,#8d948f,#f3f6f4 40%,#a9b0ab);box-shadow:8px 10px 12px rgba(30,40,30,.35)")}"></div>
  <div style="${abs(24, 744, 12, 22, "background:#7c837e;border-radius:3px")}"></div><div style="${abs(24, 1080, 12, 22, "background:#7c837e;border-radius:3px")}"></div>`;

  // The month calendar behind the pad: a terracotta band, a blank grid (faint bars where numerals would be), three dates circled.
  const CX = 420, CY = 408, CW = 540, CH = 470;
  const cw = CW / 7, ch = (CH - 118) / 5;
  const r = rng(9);
  let grid = "";
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      grid += `<div style="${abs(col * cw, 108 + row * ch, cw, ch, "border:1.5px solid #dcd7cb;box-sizing:border-box")}"><i style="position:absolute;left:10px;top:9px;width:${14 + Math.floor(r() * 3) * 5}px;height:7px;border-radius:4px;background:#cfd3d0"></i></div>`;
    }
  }
  const circled = [[4, 1], [5, 3], [6, 0]].map(([c, rw], k) => ring({ x: CX + c * cw + 8, y: CY + 108 + rw * ch + 6, w: cw - 16, h: ch - 12, rot: k * 3 - 3, seed: 3 + k, sw: 7, z: 4 })).join("");
  const calendar = `
  <div style="${abs(CX, CY, CW, CH, "transform:rotate(2.2deg);z-index:2")}">
    <div style="position:absolute;inset:0;background:#fffdf9;box-shadow:0 2px 3px rgba(30,40,30,.3),0 22px 30px rgba(30,40,30,.35);border-radius:4px"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:92px;background:linear-gradient(${TERRA},${TERRAD});border-radius:4px 4px 0 0"></div>
    <div style="position:absolute;left:0;right:0;top:92px;height:16px;background:#f2ece0"></div>
    ${grid}
  </div>
  `;

  // The list pad: a magnetic notepad, terracotta header band, the real steps with boxes.
  const PX = 70, PY = 446, PW = 600, PH = 870;
  const row = (t, ticked) => `<div style="position:relative;padding-left:78px;margin-top:26px;font:600 40px/44px 'Hand',cursive;color:${INK}"><div style="position:absolute;left:8px;top:2px;width:40px;height:40px;border:4px solid #3a2f36;border-radius:7px;transform:rotate(-2deg)">${ticked ? tick() : ""}</div>${esc(t)}</div>`;
  const pad = `
  <div style="${abs(PX, PY, PW, PH, "transform:rotate(-1.8deg);z-index:5")}">
    <div style="position:absolute;inset:0;background:#fffdf5;border-radius:10px;box-shadow:0 3px 4px rgba(30,40,30,.3),0 30px 44px rgba(30,40,30,.42)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:64px;background:linear-gradient(${TERRA},${TERRAD});border-radius:10px 10px 0 0"></div>
    <div style="position:absolute;left:0;right:0;top:64px;height:6px;background:rgba(0,0,0,.08)"></div>
    <div data-check="pad" style="position:absolute;left:34px;right:30px;top:92px;bottom:26px">
      <div style="padding-left:6px;font:700 52px/54px 'Hand',cursive;color:${MULD}">${esc(i.sub)}</div>
      ${i.items.map((t, k) => row(t, k < 2)).join("")}
    </div>
  </div>
  ${magnet({ x: PX + 130, y: PY - 24, s: 62, c: SAGE, z: 8 })}${magnet({ x: PX + PW - 190, y: PY - 24, s: 62, c: "#f1d77a", z: 8 })}`;

  // Kraft envelopes held by a lemon magnet, and a fruit magnet on the calendar.
  const env = `${envelope({ x: 712, y: 1000, w: 250, rot: 5, z: 4 })}${envelope({ x: 722, y: 1086, w: 236, rot: -4, c1: "#e3c99c", c2: "#d2b384", z: 5 })}${lemonMagnet({ x: 800, y: 1072, rot: -12, z: 9 })}`;
  const mags = `${magnet({ x: CX + 40, y: CY - 14, s: 58, c: TERRA, z: 7 })}${magnet({ x: CX + CW - 80, y: CY - 6, s: 58, c: SAGE, z: 7 })}`;

  const body = `${door}${calendar}${circled}${mags}${pad}${env}${fh}`;
  return { n, id: `${n}-bill-due-date-system-for-adhd`, html: page(p, { body, css: fc, paper: "#e6eadf" }) };
}

/* ================================================================== #65 */
function p65() {
  const n = 65;
  const i = idea(n);
  const [ey, h1] = ["Why Do I Forget to Pay Bills?", "The 12th Never Showed Up With the Bill in Front of You"];
  const { css: fc, html: fh } = frame(i, { paper: "#f6ece4", size: 70, eyebrow: ey, headline: h1 });

  // Terracotta painted wall with a slim white tile skirting at the counter, then the counter edge.
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 700, `background:radial-gradient(90% 70% at 50% 25%,#cd7a5c,${TERRA} 60%,#a9573f)`)}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 700, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 3px,transparent 3px 9px)")}"></div>`;
  const tileBand = Array.from({ length: 9 }, (_, k) => `<div style="${abs(k * 118 - 10, 1000, 114, 60, "background:linear-gradient(150deg,#ffffff,#eceae4);border-radius:3px;box-shadow:0 1px 0 rgba(0,0,0,.12)")}"></div>`).join("");
  const counter = `<div style="${abs(0, 1060, 1000, 294, "background:linear-gradient(#efe6d2,#e4d9bf)")}"></div><div style="${abs(0, 1060, 1000, 30, "background:linear-gradient(rgba(60,30,15,.4),transparent)")}"></div>`;

  // The wall calendar: sage header, blank pale cells; only the 4th, 12th and 13th carry numerals.
  const CX = 70, CY = 446, CW = 860, CH = 540, HDR = 84, GX = 30;
  const cols = 7, rows = 5;
  const cw = (CW - GX * 2) / cols, ch = (CH - HDR - 26) / rows;
  const marked = { "0,3": "4th", "1,4": "12th", "1,5": "13th" }; // row,col
  const r = rng(13);
  let grid = "";
  for (let rw = 0; rw < rows; rw++) {
    for (let cl = 0; cl < cols; cl++) {
      const key = `${rw},${cl}`;
      const lab = marked[key];
      grid += `<div style="${abs(GX + cl * cw, HDR + 14 + rw * ch, cw, ch, "border:2px solid #ddd8cc;box-sizing:border-box;background:#fffdf9")}">${lab ? `<span style="position:absolute;left:10px;top:6px;font:600 30px/1 'Newsreader',serif;color:${INK}">${lab}</span>` : `<i style="position:absolute;left:12px;top:12px;width:${16 + Math.floor(r() * 3) * 5}px;height:8px;border-radius:4px;background:#e3e1da"></i>`}</div>`;
    }
  }
  const cell = (rw, cl) => ({ x: CX + GX + cl * cw, y: CY + HDR + 14 + rw * ch });
  const c4 = cell(0, 3), c12 = cell(1, 4), c13 = cell(1, 5);
  const calendar = `
  <div style="${abs(CX, CY, CW, CH, "transform:rotate(-.8deg);z-index:2")}">
    <div style="position:absolute;inset:0;background:#fffdf9;box-shadow:0 2px 3px rgba(40,10,0,.35),0 30px 42px rgba(60,20,5,.5);border-radius:6px"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:${HDR}px;background:linear-gradient(#b9c8aa,#9fb190);border-radius:6px 6px 0 0"></div>
    <div style="position:absolute;right:30px;top:24px;z-index:3">${exampleTag("background:#fffdf9;color:#4b4339")}</div>
    ${grid}
  </div>
  <div style="${abs(CX + CW / 2 - 14, CY - 40, 28, 28, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff9,transparent 40%),#efe7da;box-shadow:0 3px 5px rgba(40,10,0,.45);z-index:7")}"></div>`;
  // Butter notes in the guide's own words, on the three days (the days between stay blank and pale).
  const notes = `
  ${note({ x: c4.x + 6, y: c4.y + 40, w: 118, h: 92, rot: -4, text: "email", size: 36, z: 4 })}
  ${note({ x: c12.x - 2, y: c12.y + 52, w: 98, h: 84, rot: 3, text: "due", size: 42, z: 4 })}
  ${note({ x: c13.x + 18, y: c13.y + 60, w: 162, h: 124, rot: -3, text: "text about a late fee", size: 33, z: 5 })}`;
  const hollow = ring({ x: c12.x - 24, y: c12.y - 14, w: cw + 28, h: 168, rot: 1, seed: 4, sw: 9, z: 6 });

  // The counter: a ruled index card with the guide's lines, a phone showing only a text bubble, a mug and a tea towel.
  const card = `
  <div style="${abs(48, 1100, 590, 236, "transform:rotate(-1.6deg);z-index:8")}">
    <div style="position:absolute;inset:0;background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.3),0 18px 26px rgba(40,20,5,.35);background-image:repeating-linear-gradient(transparent 0 37px,#e4d3cf 37px 39px);background-position:0 18px"></div>
    <div data-check="card" style="position:absolute;left:26px;right:22px;top:14px;bottom:10px">
      <div class="hand" style="font:600 33px/39px 'Hand',cursive;color:${INK}">${esc(i.items[0])}</div>
      <div class="hand" style="font:600 33px/39px 'Hand',cursive;color:${INK};margin-top:2px">${esc(i.items[1])}</div>
      <div class="hand" style="font:700 40px/42px 'Hand',cursive;color:${MUL};margin-top:4px">${esc(i.items[2])}</div>
    </div>
  </div>`;
  const phoneObj = `
  <div style="${abs(662, 1076, 180, 252, "transform:rotate(7deg);z-index:7")}">
    <div style="position:absolute;inset:0;border-radius:30px;background:#2a2326;box-shadow:0 3px 4px rgba(40,10,0,.4),0 22px 26px rgba(40,20,10,.5)"></div>
    <div style="position:absolute;left:9px;top:9px;right:9px;bottom:9px;border-radius:22px;background:#f4f1ec;overflow:hidden">
      <div style="position:absolute;left:62px;top:9px;width:50px;height:12px;border-radius:6px;background:#2a2326"></div>
      <div style="position:absolute;left:14px;top:60px;width:112px;height:62px;border-radius:20px 20px 20px 6px;background:#dedbd6"><i style="position:absolute;left:14px;top:18px;width:80px;height:8px;border-radius:4px;background:#bdbab5"></i><i style="position:absolute;left:14px;top:36px;width:56px;height:8px;border-radius:4px;background:#bdbab5"></i></div>
    </div></div>`;
  const cup = mug({ x: 836, y: 1180, size: 100, color: "#fbf7ee", drink: "#6b4226" });
  const towelObj = towel({ x: 620, y: 1296, w: 340, h: 70, rot: -2, stripe: TERRA });

  const body = `${wall}${tileBand}${counter}${calendar}${notes}${hollow}${card}${phoneObj}${cup}${fh}`;
  void towelObj;
  return { n, id: `${n}-why-do-i-forget-to-pay-bills`, html: page(p, { body, css: fc, paper: "#f6ece4" }) };
}

/* ================================================================== #66 */
function p66() {
  const n = 66;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3eadb", size: 66, eyebrow: "A Weekly Reset Example", headline: "Five Things on the Counter, One Gets a Day", sub: i.sub, textTop: 56 });

  // Oak butcher-block counter from above: planks with end-grain tone, a front edge and the cupboard beneath.
  const r = rng(31);
  let planks = "";
  const PW_ = 1000 / 7;
  for (let k = 0; k < 7; k++) {
    const t = ["#d9ae78", "#d1a46d", "#dcb480", "#cf9f68"][k % 4];
    planks += `<div style="${abs(k * PW_, SCENE_TOP, PW_, 900, `background:linear-gradient(90deg,rgba(255,255,255,.12),transparent 30%,rgba(90,50,10,.1)),${t}`)}"></div>`;
    for (let g = 0; g < 14; g++) planks += `<i style="position:absolute;left:${(k * PW_ + r() * (PW_ - 20)).toFixed(0)}px;top:${(SCENE_TOP + r() * 880).toFixed(0)}px;width:${(30 + r() * 80).toFixed(0)}px;height:3px;border-radius:2px;background:rgba(120,70,20,${(0.1 + r() * 0.14).toFixed(2)})"></i>`;
    planks += `<div style="${abs(k * PW_, SCENE_TOP, 2, 900, "background:rgba(90,50,10,.28)")}"></div>`;
  }
  const counter = `${planks}
  <div style="${abs(0, 1262, 1000, 20, "background:linear-gradient(#e8c493,#bf9059)")}"></div>
  <div style="${abs(0, 1282, 1000, 80, `background:linear-gradient(#d9dfd0,${SAGE})`)}"></div><div style="${abs(0, 1282, 1000, 26, "background:linear-gradient(rgba(40,40,20,.4),transparent)")}"></div>`;

  const bowl = fruitBowl({ x: -70, y: 392, s: 320, rot: 10 });
  const cup = mug({ x: 800, y: 420, size: 140, color: "#fbf7ee", drink: "#6b4226" });

  // The four notes that stay where they are: faded, in a loose row along the edge.
  const stays = [
    { t: i.items[1], x: 44, y: 1012, rot: -3, h: 200 },
    { t: i.items[2], x: 270, y: 1022, rot: 2, h: 196 },
    { t: i.items[3], x: 494, y: 1010, rot: -1.5, h: 204 },
    { t: i.items[4], x: 722, y: 1024, rot: 3, h: 194 },
  ].map(({ t, x, y, rot, h }, k) => note({ x, y, w: 206, h, rot, text: esc(t), size: 33, color: "#6b5560", fade: true, z: 2, shadow: "0 1px 2px rgba(40,20,5,.2),0 6px 8px rgba(40,20,5,.18)" })).join("");
  const label = `<div class="hand" data-check="stays" style="${abs(44, 1224, 520, 54, "font:700 42px/50px 'Hand',cursive;color:#3b2a1e;z-index:3")}">Stays where it is.</div>
  <svg style="${abs(40, 1214, 900, 12, "z-index:3")}" viewBox="0 0 900 12" aria-hidden="true"><path d="M4 8 C 220 2, 600 12, 896 4" fill="none" stroke="#4a3a2c" stroke-opacity=".5" stroke-width="3.5" stroke-linecap="round"/></svg>`;

  // The note that gets a day: lifted forward, large, with Tuesday circled in the one-thing colour.
  const lifted = `
  <div style="${abs(250, 560, 470, 430, "transform:rotate(-2.6deg);z-index:6")}">
    <div style="position:absolute;inset:0;background:linear-gradient(170deg,#fbe79a,#f2d06c);box-shadow:0 3px 4px rgba(40,20,5,.35),0 26px 30px rgba(40,20,5,.4),0 60px 64px rgba(40,20,5,.28)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:12%;background:rgba(255,255,255,.22)"></div>
    <div data-check="lifted" style="position:absolute;left:34px;right:34px;top:50px;bottom:30px;text-align:center">
      <div class="hand" style="font:700 100px/92px 'Hand',cursive;color:${INK}">${esc(i.items[0])}</div>
      <div class="hand" style="position:relative;display:inline-block;margin-top:40px;font:700 86px/1 'Hand',cursive;color:${MULD};padding:0 22px">Tuesday</div>
    </div>
  </div>
  ${ring({ x: 322, y: 822, w: 336, h: 132, rot: -3, seed: 8, sw: 9, z: 7 })}
  <div style="${abs(26, 730, 214, 112, "background:#fffaf0;z-index:7;transform:rotate(-4deg);box-shadow:0 2px 3px rgba(40,20,5,.3),0 14px 18px rgba(40,20,5,.35);display:grid;place-items:center;text-align:center;padding:6px 12px;box-sizing:border-box")}"><span class="hand" style="font:700 46px/1 'Hand',cursive;color:${MULD}">This is the one.</span></div>`;

  const exTag = `<div style="position:absolute;left:44px;top:640px;z-index:7;transform:rotate(-3deg)">${exampleTag("background:#fffaf0;color:#4b4339;box-shadow:0 3px 6px rgba(40,20,5,.3)")}</div>`;
  const env = envelope({ x: 744, y: 756, w: 220, rot: 7, c1: "#d9b98a", c2: "#c9a574", z: 3 });
  const pencil = pen({ x: 560, y: 1316, len: 300, rot: 0, body: TERRA, z: 3 });
  void pencil;

  const body = `${counter}${bowl}${cup}${env}${stays}${label}${lifted}${exTag}${fh}`;
  return { n, id: `${n}-five-things-on-the-counter-one-gets-a-day`, html: page(p, { body, css: fc, paper: "#f3eadb" }) };
}

/* ================================================================== #69 */
function p69() {
  const n = 69;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9eddf", size: 76, sub: i.sub, textTop: 58 });

  // Sage-cream laminate, top-down, with a speckle; a striped tea towel under the card.
  const r = rng(44);
  const speck = Array.from({ length: 220 }, () => `<i style="position:absolute;left:${(r() * 1000).toFixed(0)}px;top:${(r() * 982).toFixed(0)}px;width:${(2 + r() * 4).toFixed(1)}px;height:${(2 + r() * 3).toFixed(1)}px;border-radius:50%;background:${r() > 0.5 ? "#9aab8c" : "#fbfdf4"};opacity:.55"></i>`).join("");
  const surface = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(100% 70% at 30% 20%,#dfe7d2,#cfdac2 70%,#c4d1b6);overflow:hidden")}">${speck}</div>`;
  const tea = towel({ x: 150, y: 402, w: 900, h: 560, rot: 9, stripe: TERRA });
  void tea;

  // The card: a before-after table; shared payday axis, three bills each with the old date (ring) moved to the new (dot).
  const X0 = 214, DAY = 20.4;
  const dx = (d) => X0 + (d - 1) * DAY;
  const rowsData = [
    { bill: "Card", from: 25, to: 6, pay: "5th paycheck" },
    { bill: "Phone", from: 12, to: 21, pay: "20th paycheck" },
    { bill: "Electric", from: 18, to: 21, pay: "20th paycheck" },
  ];
  const ROW0 = 206, RH = 190;
  const ord = (d) => `${d}${d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th"}`;
  const guides = [5, 20].map((d) => `<div style="${abs(dx(d) - 1.5, 150, 3, ROW0 + 3 * RH - 160, "background:repeating-linear-gradient(transparent 0 8px,#c8b8b0 8px 14px)")}"></div>`).join("");
  const axis = [5, 20].map((d) => `
    <div style="position:absolute;left:${dx(d) - 62}px;top:84px;width:124px;text-align:center">
      <div style="margin:0 auto;width:58px;height:58px;display:grid;place-items:center">${icon("envelope-simple", { size: 52, color: TERRAD, weight: "fill" })}</div>
      <div style="font:600 25px/1.1 'Plex',sans-serif;color:${INK};margin-top:2px">${ord(d)}</div></div>`).join("");
  const arrowDef = `<defs><marker id="ah" markerUnits="userSpaceOnUse" markerWidth="26" markerHeight="26" refX="20" refY="13" orient="auto"><path d="M3 3 L21 13 L3 23" fill="none" stroke="${MUL}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;
  const rowsHtml = rowsData.map((rw, k) => {
    const y = ROW0 + k * RH;
    const x1 = dx(rw.from), x2 = dx(rw.to);
    const midx = (x1 + x2) / 2;
    const lift = Math.min(70, 28 + Math.abs(x1 - x2) / 5);
    const near = Math.abs(x1 - x2) < 110;
    const right = x2 > x1;
    const lf = near ? (right ? { l: x1 + 22 - 100, a: "right" } : { l: x1 - 22, a: "left" }) : { l: x1 - 50, a: "center" };
    const lt = near ? (right ? { l: x2 - 22, a: "left" } : { l: x2 + 22 - 100, a: "right" }) : { l: x2 - 50, a: "center" };
    return `
    <div style="position:absolute;left:34px;top:${y + 38}px;font:700 50px/1 'Hand',cursive;color:${INK}">${esc(rw.bill)}</div>
    <div style="position:absolute;left:${X0 - 12}px;top:${y + 76}px;width:${DAY * 30 + 24}px;height:8px;border-radius:4px;background:#e4ddd4"></div>
    <svg style="position:absolute;left:0;top:${y}px;width:860px;height:${RH}px;overflow:visible" viewBox="0 0 860 ${RH}" aria-hidden="true">${arrowDef}
      <path d="M${x1} 66 Q ${midx} ${66 - lift * 1.6} ${x2 + (x2 < x1 ? 12 : -12)} 66" fill="none" stroke="${MUL}" stroke-width="5" stroke-linecap="round" marker-end="url(#ah)"/>
      <circle cx="${x1}" cy="80" r="15" fill="#fffdf9" stroke="#8c7f78" stroke-width="5"/>
      <circle cx="${x2}" cy="80" r="15" fill="${MUL}"/>
    </svg>
    <div class="hand" style="position:absolute;left:${lf.l}px;top:${y + 106}px;width:100px;text-align:${lf.a};font:600 38px/1 'Hand',cursive;color:#5d514b"><span style="background:#fffdf9;padding:0 4px">${ord(rw.from)}</span></div>
    <div class="hand" style="position:absolute;left:${lt.l}px;top:${y + 106}px;width:100px;text-align:${lt.a};font:700 40px/1 'Hand',cursive;color:${MULD}"><span style="background:#fffdf9;padding:0 4px">${ord(rw.to)}</span></div>
    <div style="position:absolute;left:34px;top:${y + 150}px;font:500 24px/1 'Plex',sans-serif;color:#4b4339"><span style="background:#fffdf9;padding:2px 6px 2px 0">paid from the ${esc(rw.pay)}</span></div>`;
  }).join("");

  const card = `
  <div style="${abs(50, 410, 900, 836, "transform:rotate(-.8deg);z-index:4")}">
    <div style="position:absolute;inset:0;background:#fffdf9;border-radius:10px;box-shadow:0 3px 4px rgba(40,50,30,.3),0 32px 44px rgba(40,50,30,.4)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:10px;background:${TERRA};border-radius:10px 10px 0 0"></div>
    <div data-check="table" style="position:absolute;left:0;top:0;width:900px;height:836px;overflow:hidden">
      <div style="position:absolute;left:34px;top:34px;display:flex;gap:30px;align-items:center;font:600 25px/1 'Plex',sans-serif;color:${INK}">
        <span style="display:flex;align-items:center;gap:10px"><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="12" fill="#fffdf9" stroke="#8c7f78" stroke-width="5"/></svg>Due now</span>
        <span style="display:flex;align-items:center;gap:10px"><svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="13" fill="${MUL}"/></svg>Asked to move to</span>
      </div>
      <div style="position:absolute;right:30px;top:26px">${exampleTag()}</div>
      ${guides}${axis}${rowsHtml}
    </div>
  </div>`;

  const bowl = fruitBowl({ x: 770, y: 1180, s: 250, rot: -20 });
  const cup = mug({ x: 20, y: 1204, size: 112, color: "#fbf7ee", drink: "#6b4226" });

  const body = `${surface}${tea}${card}${bowl}${cup}${fh}`;
  return { n, id: `${n}-how-to-change-bill-due-dates-to-match-payday`, html: page(p, { body, css: fc, paper: "#e9eddf" }) };
}

export const pins = [p10(), p63(), p65(), p66(), p69()];
