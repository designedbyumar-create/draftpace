/**
 * Batch 4, module c: #9 (the four levels as four books of rising thickness on a
 * shelf), #19 (two letters, each with its envelope, in two cubbies of a
 * pigeonhole unit), #23 (three tabbed divider cards in a shoebox: notice,
 * declaration, affidavit), #27 (a window sill at dawn, the question in the
 * sky and the answer in a plum band) and #31 (five recipe-style step cards
 * on a teal enamel counter, joined by pencil arrows).
 * Every word is the idea bank's own; a card may carry one fragment of a
 * bank sentence, never a rewording.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SHADOW = "0 2px 3px rgba(30,15,5,.28),0 16px 26px rgba(30,15,5,.34)";
const CAUTION = "Laws change. Confirm with your state before relying on this.";
const slug = (i) => `${i.n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`;
/** Guard: a fragment I split out of a bank sentence must still be that sentence's words. */
const must = (src, ...parts) => { for (const s of parts) if (!src.includes(s)) throw new Error(`b4-c: "${s}" is not in the bank text`); };

/* ---------------------------------------------------------------- #9 */

/** The four levels as four books stacked on a shelf, each thicker than the one above; the guide's line is printed on the spine. */
function pin9() {
  const i = idea(9);
  const cloth = [
    { a: "#efe3f1", b: "#d8c4dc", ink: "#2b1a30", gilt: "#b58a2c", pages: "#fbf6ea" },
    { a: "#cdb2d4", b: "#b295bb", ink: "#26142c", gilt: "#7a5a1c", pages: "#faf3e2" },
    { a: "#9a74a6", b: "#7d5889", ink: "#ffffff", gilt: "#f0d58a", pages: "#f8f0dc" },
    { a: "#5a3f62", b: "#3e2946", ink: "#ffffff", gilt: "#f0d58a", pages: "#f4ead2" },
  ];
  const heights = [168, 196, 228, 252];
  const xs = [58, 92, 48, 74];
  const ws = [860, 826, 872, 846];
  let y = 392;
  const books = i.items.map((t, k) => {
    const [head, ...rest] = t.split(": ");
    const c = cloth[k], h = heights[k], w = ws[k];
    const html = `<div class="book" data-check="book${k}" style="left:${xs[k]}px;top:${y}px;width:${w}px;height:${h}px;background:linear-gradient(180deg,${c.a},${c.b});color:${c.ink}">
      <div class="gl" style="top:10px;background:${c.gilt}"></div><div class="gl" style="top:15px;background:${c.gilt};opacity:.6"></div>
      <div class="gl" style="bottom:10px;background:${c.gilt}"></div><div class="gl" style="bottom:15px;background:${c.gilt};opacity:.6"></div>
      <div class="pages" style="background:repeating-linear-gradient(180deg,${c.pages} 0 4px,#d9cfb8 4px 5px)"></div>
      <div class="sin"><div class="hd serif" style="font-size:${36 + k * 5}px">${esc(head)}:</div><div class="bd">${esc(rest.join(": "))}</div></div></div>`;
    y += h - 2;
    return html;
  }).join("");
  const scene = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(90deg,rgba(255,255,255,.2),transparent 40%),#d7e1e8")}"></div>
  <div style="${abs(0, 1240, 1000, 114, "background:linear-gradient(#c99b66,#b0834d);box-shadow:0 -6px 14px rgba(40,25,5,.3)")}"></div>
  <div style="${abs(0, 1240, 1000, 8, "background:rgba(255,255,255,.35)")}"></div>
  ${books}
  <div class="caut" data-check="caution" style="${abs(44, 1270, 780, 56, "transform:rotate(-.4deg)")}">${esc(CAUTION)}</div>`;
  return printable({
    n: 9,
    scene,
    paper: "#f1ebdc",
    extraCss: `
    .book{position:absolute;border-radius:10px 4px 4px 10px;box-shadow:0 3px 3px rgba(30,20,40,.3),0 16px 22px rgba(30,20,40,.3)}
    .gl{position:absolute;left:0;right:34px;height:2px}
    .pages{position:absolute;right:0;top:6px;bottom:6px;width:30px;border-radius:0 3px 3px 0;box-shadow:inset 3px 0 5px rgba(0,0,0,.25)}
    .sin{position:absolute;left:54px;right:50px;top:24px}
    .hd{font-weight:600;letter-spacing:-.01em;line-height:1.1}
    .bd{font-size:29px;line-height:37px;margin-top:8px}
    .caut{background:#fffdf4;border-radius:4px;padding:0 22px;font:500 27px/56px "Plex";color:#2c2218;box-shadow:0 2px 3px rgba(30,15,5,.3),0 8px 12px rgba(30,15,5,.25)}
    .top p{font-size:25px;margin-top:12px}`,
  });
}

/* ---------------------------------------------------------------- #19 */

/** An upright envelope leaning in a cubby, its address on a label. */
function envelope({ x, y, w, h, rot, color, shade, address }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:3;background:${color};border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 12px 20px rgba(0,0,0,.35)`)}">
    <svg style="${abs(0, 0, w, h)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M0 0 L${w / 2} ${h * 0.3} L${w} 0" fill="${shade}" fill-opacity=".25" stroke="${shade}" stroke-width="3"/><path d="M0 ${h} L${w * 0.5} ${h * 0.5} L${w} ${h}" fill="none" stroke="${shade}" stroke-width="2.5" opacity=".55"/></svg>
    <div style="${abs(w - 94, 14, 66, 80, "background:#f8f4e8;border:3px dotted #c8bfa6;padding:6px;box-shadow:0 2px 3px rgba(0,0,0,.2)")}"><div style="width:100%;height:100%;background:linear-gradient(#bfe0d4 0 60%,#7fae7a 60%);position:relative"><div style="${abs(16, 20, 20, 18, "background:#c4573e")}"></div><div style="${abs(10, 8, 32, 14, "background:#7a4b8a;clip-path:polygon(50% 0,100% 100%,0 100%)")}"></div></div></div>
    <div class="addr hand" data-check="address" style="${abs(18, h * 0.42, w - 36, h * 0.5)}">${esc(address)}</div></div>`;
}

function letter({ x, y, w, h, rot, head, body, accent }) {
  return `<div class="ltr" data-check="letter" style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:2;border-top:14px solid ${accent}`)}">
    <div class="lh serif">${esc(head)}</div><div class="lb serif">${esc(body)}</div></div>`;
}

/** A cubby of the pigeonhole unit: dark back, a floor lip, and whatever stands in it. */
function cubby(y, h, inner) {
  return `<div style="${abs(48, y, 904, h, "overflow:hidden;background:linear-gradient(180deg,#8a6238,#b5875a 35%,#c39668);box-shadow:inset 0 14px 22px rgba(30,15,5,.55),inset 14px 0 18px rgba(30,15,5,.3),inset -14px 0 18px rgba(30,15,5,.3)")}">${inner}
    <div style="${abs(0, h - 26, 904, 26, "background:linear-gradient(#d9ae7a,#b98c58);z-index:5;box-shadow:0 -4px 8px rgba(30,15,5,.35)")}"></div></div>`;
}

function pin19() {
  const i = idea(19);
  const [wd, rr, toA, toB] = i.items;
  const [wh, ...wrest] = wd.split(": ");
  const [rh, ...rrest] = rr.split(": ");
  // coordinates inside a cubby (904 wide)
  const cubA = cubby(402, 440,
    letter({ x: 40, y: 78, w: 520, h: 380, rot: -2, head: wh, body: wrest.join(": "), accent: C.plum }) +
    envelope({ x: 590, y: 70, w: 290, h: 340, rot: 2.5, color: "#fbf8ef", shade: "#bfb59c", address: toA }));
  const cubB = cubby(890, 440,
    envelope({ x: 26, y: 70, w: 290, h: 340, rot: -2.5, color: "#e1c490", shade: "#8f6e32", address: toB }) +
    letter({ x: 340, y: 78, w: 524, h: 380, rot: 2, head: rh, body: rrest.join(": "), accent: "#4f8a8f" }));
  const scene = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:#f1ece0")}"></div>
  <div style="${abs(24, 384, 952, 960, "background:#f6f1e4;border-radius:10px;box-shadow:0 4px 6px rgba(30,20,10,.3),0 22px 34px rgba(30,20,10,.4)")}"></div>
  ${cubA}${cubB}
  <div style="${abs(24, 842, 952, 48, "background:linear-gradient(#fffaee,#e9e1cf);box-shadow:0 3px 6px rgba(30,20,10,.25)")}"></div>
  <div style="${abs(24, 1330, 952, 14, "background:#e0d8c4")}"></div>
  <div class="plus" style="${abs(458, 828, 84, 76)}">+</div>`;
  return printable({
    n: 19,
    scene,
    paper: "#eee7d8",
    extraCss: `
    .ltr{background:#fffdf6;border-radius:4px;padding:20px 34px;box-shadow:0 2px 3px rgba(0,0,0,.3),0 10px 18px rgba(0,0,0,.3);overflow:hidden}
    .lh{font-size:50px;line-height:1.05;font-weight:600;color:#1f1b17}
    .lb{font-size:34px;line-height:1.22;margin-top:12px;color:#38322b}
    .addr{font-size:38px;line-height:1.1;color:#2a2f4a;font-weight:600;display:flex;align-items:center;background:rgba(255,255,255,.62);padding:0 14px;border-radius:4px;transform:rotate(-1deg)}
    .plus{z-index:6;border-radius:50%;background:${C.plum};color:#fff;font:600 66px/70px "Plex";text-align:center;box-shadow:0 6px 12px rgba(0,0,0,.4);border:5px solid #f6efe0}
    .top h1{font-size:86px}`,
  });
}

/* ---------------------------------------------------------------- #23 */

/** Three divider cards in a shoebox on a shelf; the bank sentence is split across them in order. */
function pin23() {
  const i = idea(23);
  const src = i.items[0];
  const frags = [
    "Some states call it a notice,",
    "some a declaration,",
    "and some an affidavit, which usually means it has to be signed under oath or notarized.",
  ];
  must(src, ...frags);
  const tabs = ["notice", "declaration", "affidavit"];
  const tabColor = ["#f2a58f", "#f2d27a", "#a9d3b8"];
  const cardAt = (k, top) => {
    const h = 1128 - top;
    return `<div class="icard" data-check="card${k}" style="${abs(104, top, 792, h, `z-index:${2 + k};--tab:${tabColor[k]}`)}">
      <div class="tabl" style="left:${30 + k * 255}px">${esc(tabs[k])}</div>
      <div class="frag serif ${k === 2 ? "big" : ""}">${esc(frags[k])}</div></div>`;
  };
  const corr = "repeating-linear-gradient(90deg,rgba(90,60,25,.12) 0 3px,transparent 3px 9px)";
  const scene = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(90deg,rgba(255,255,255,.25),transparent 45%),#cfe0e8")}"></div>
  <div style="${abs(0, 1290, 1000, 70, "background:linear-gradient(#fbf8f0,#e6dfcf);box-shadow:0 -4px 12px rgba(30,40,50,.25)")}"></div>
  <div style="${abs(60, 440, 880, 700, `background:linear-gradient(#8f6c3e,#a9824f);border-radius:8px 8px 0 0;box-shadow:inset 0 18px 24px rgba(30,15,5,.5)`)}"></div>
  ${cardAt(0, 500)}${cardAt(1, 646)}${cardAt(2, 792)}
  <div style="${abs(40, 1112, 920, 190, `z-index:8;background:${corr},linear-gradient(#cfa972,#b88f58);border-radius:6px 6px 10px 10px;box-shadow:0 6px 8px rgba(30,15,5,.35),0 22px 24px rgba(30,40,50,.35)`)}"></div>
  <div style="${abs(40, 1112, 920, 12, "z-index:9;background:rgba(255,255,255,.3);border-radius:6px 6px 0 0")}"></div>
  <div class="ans" data-check="answer" style="${abs(110, 1148, 780, 108, "z-index:9;transform:rotate(-.6deg)")}"><div class="serif">${esc(i.sub)}</div></div>`;
  return printable({
    n: 23,
    scene,
    sub: false,
    paper: "#efe6d6",
    extraCss: `
    .top h1{font-size:76px}
    .icard{border-radius:10px 10px 0 0;background:#fffdf4;box-shadow:0 -4px 8px rgba(30,15,5,.25);padding:22px 40px;border-top:14px solid var(--tab)}
    .icard .tabl{position:absolute;top:-62px;width:230px;height:48px;border-radius:10px 10px 0 0;background:var(--tab);box-shadow:0 -3px 5px rgba(30,15,5,.2);font:600 26px/50px "Plex";letter-spacing:.06em;color:#2c2218;text-align:center}
    .icard .frag{font-size:34px;line-height:44px;color:#241a10}
    .icard .frag.big{font-size:46px;line-height:58px;margin-top:20px}
    .ans{background:#fffdf6;border-radius:8px;display:grid;place-items:center;box-shadow:0 2px 3px rgba(30,15,5,.3),inset 0 0 0 4px #e8ded0}
    .ans div{font-size:39px;font-weight:600;color:#25190e;text-align:center;line-height:1.1;padding:0 14px}`,
  });
}

/* ---------------------------------------------------------------- #27 */

function pin27() {
  const i = idea(27);
  const [eyebrow, rest] = i.headline.split(": ");
  const sky = `<div style="${abs(0, 0, 1000, 1000, "transform:translateY(-60px)")}"><svg style="${abs(0, 0, 1000, 930)}" viewBox="0 0 1000 930" aria-hidden="true"><defs>
    <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6f4"/><stop offset=".55" stop-color="#f7e8d2"/><stop offset="1" stop-color="#f6c9a0"/></linearGradient>
    <radialGradient id="sun" cx="78%" cy="76%" r="40%"><stop offset="0" stop-color="#fff6d0" stop-opacity=".95"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></radialGradient></defs>
    <rect width="1000" height="930" fill="url(#sk)"/><rect width="1000" height="930" fill="url(#sun)"/>
    <path d="M0 640 C 140 590 260 620 400 600 C 560 575 700 620 1000 580 V930 H0Z" fill="#b9c8b7"/>
    <path d="M0 700 C 200 660 360 690 560 668 C 760 646 880 690 1000 664 V930 H0Z" fill="#9db497"/>
    <g><rect x="120" y="640" width="90" height="62" fill="#d78d70"/><path d="M110 642 L165 596 L220 642Z" fill="#7a4b5a"/><rect x="148" y="668" width="20" height="34" fill="#f4e6c0"/></g>
    <g><rect x="680" y="650" width="70" height="52" fill="#e3b26a"/><path d="M672 652 L715 616 L758 652Z" fill="#8d5a48"/></g>
    <path d="M0 760 C 180 722 400 760 640 736 C 800 720 900 748 1000 734 V930 H0Z" fill="#7f9c78"/>
    <g fill="#5f7f5b"><circle cx="300" cy="730" r="30"/><rect x="295" y="740" width="10" height="34"/><circle cx="888" cy="722" r="26"/><rect x="883" y="732" width="10" height="34"/></g>
    <rect x="0" y="0" width="1000" height="930" fill="none" stroke="#fffdf6" stroke-width="30"/><rect x="0" y="0" width="1000" height="930" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="2" transform="translate(15 15) scale(.97)"/></svg>`;
  const clouds = [[560, 470, 1.1], [90, 520, .8], [740, 330, .7]].map(([x, y, sc]) => `<div style="${abs(x, y, 230 * sc, 70 * sc, "opacity:.85;filter:blur(1px)")}"><div style="${abs(0, 28 * sc, 230 * sc, 42 * sc, "background:#fff;border-radius:40px")}"></div><div style="${abs(36 * sc, 4 * sc, 94 * sc, 60 * sc, "background:#fff;border-radius:50%")}"></div><div style="${abs(104 * sc, 12 * sc, 84 * sc, 52 * sc, "background:#fff;border-radius:50%")}"></div></div>`).join("");
  // the window sill, with a stack of folders under a closed laptop, a mug, and a small plant
  const sill = `${clouds}<div style="${abs(0, 892, 1000, 36, "background:linear-gradient(#fffdf8,#ece4d4);box-shadow:0 6px 10px rgba(30,15,50,.3)")}"></div>
  <div style="${abs(0, 928, 1000, 22, "background:#d9cfbb;box-shadow:0 8px 14px rgba(30,15,50,.35)")}"></div>
  <svg style="${abs(70, 700, 560, 194, "filter:drop-shadow(0 10px 8px rgba(30,15,50,.35))")}" viewBox="0 0 560 194" aria-hidden="true">
    <rect x="10" y="156" width="430" height="34" rx="5" fill="#d9b66f"/><rect x="10" y="156" width="430" height="9" fill="#fff" opacity=".25"/><rect x="430" y="160" width="14" height="26" fill="#f2ecd9"/>
    <rect x="30" y="122" width="400" height="34" rx="5" fill="#8aa182"/><rect x="30" y="122" width="400" height="9" fill="#fff" opacity=".25"/><rect x="420" y="126" width="14" height="26" fill="#f2ecd9"/>
    <rect x="0" y="92" width="420" height="30" rx="6" fill="#c9ced6"/><rect x="0" y="92" width="420" height="8" rx="4" fill="#fff" opacity=".45"/><rect x="0" y="116" width="420" height="6" fill="#8b919b"/>
    <rect x="150" y="62" width="130" height="30" rx="10" fill="#c4573e"/><rect x="150" y="62" width="130" height="7" rx="4" fill="#fff" opacity=".22"/></svg>
  <svg style="${abs(700, 690, 160, 204, "filter:drop-shadow(0 10px 8px rgba(30,15,50,.35))")}" viewBox="0 0 160 204" aria-hidden="true">
    <path d="M52 40 C 40 22 66 14 56 0 M84 40 C 72 22 98 14 88 0" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
    <path d="M18 62 H128 L120 196 H26Z" fill="#fbf5ea"/><path d="M18 62 H128 L126 82 H20Z" fill="#000" opacity=".06"/><path d="M128 84 C 164 82 164 150 124 150" fill="none" stroke="#fbf5ea" stroke-width="16" stroke-linecap="round"/>
    <ellipse cx="73" cy="62" rx="55" ry="10" fill="#6b4226"/></svg>
  <svg style="${abs(830, 760, 140, 136, "filter:drop-shadow(0 8px 6px rgba(30,15,50,.35))")}" viewBox="0 0 140 136" aria-hidden="true"><path d="M36 76 H104 L97 132 H43Z" fill="#c4724a"/><rect x="30" y="66" width="80" height="16" rx="4" fill="#d4825a"/><g fill="#5d8a56"><path d="M70 68 C 40 30 20 32 8 12 C 40 10 66 30 70 68Z"/><path d="M70 68 C 100 24 124 26 134 8 C 104 2 74 26 70 68Z"/><path d="M70 68 C 62 36 70 16 70 2 C 82 22 80 48 70 68Z"/></g></svg></div>`;
  const band = `<div style="${abs(0, 890, 1000, 464, "background:linear-gradient(#6a4a72,#4a3350)")}"></div>
  <div style="${abs(0, 890, 1000, 8, "background:rgba(255,255,255,.18)")}"></div>
  <div class="ans" data-check="answer" style="${abs(64, 930, 872, 400)}"><div class="a1 serif">${esc(i.sub)}</div><div class="a2">${esc(i.items[0])}</div></div>`;
  const body = `${sky}${sill}${band}
  <div class="q" data-check="question" style="${abs(64, 60, 872, 380)}"><div class="eb">${esc(eyebrow)}</div><h1 class="serif">${esc(rest)}</h1></div>
  <div class="footbar"></div>${footFor(i)}`;
  const css = `
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:#efe6d6;box-shadow:0 -8px 22px rgba(30,15,50,.35);z-index:5}
  .foot{z-index:7}
  .q .eb{font:600 24px "Plex";letter-spacing:.16em;text-transform:uppercase;color:#4a3350}
  .q h1{font-weight:500;font-size:108px;line-height:1.02;letter-spacing:-.02em;color:#17304a;margin-top:18px;text-shadow:0 1px 0 rgba(255,255,255,.5)}
  .ans .a1{font-size:56px;line-height:1.08;color:#fff;font-weight:500;letter-spacing:-.01em;padding-top:8px}
  .ans .a2{font-size:37px;line-height:50px;color:#f1e8f3;margin-top:24px;border-top:2px solid rgba(255,255,255,.3);padding-top:22px}`;
  return { n: 27, id: slug(i), html: page(p, { body, css, paper: "#cfe6f4" }) };
}

/* ---------------------------------------------------------------- #31 */

function arrow(dir) {
  // a pencil-drawn curved arrow from one card down to the next, leaning left or right
  const s = dir > 0 ? 1 : -1;
  return `<svg class="arr" viewBox="0 0 160 50" style="${s > 0 ? "" : "transform:scaleX(-1)"}" aria-hidden="true"><path d="M14 6 C 56 4 100 6 118 40" fill="none" stroke="#2a2a30" stroke-width="5" stroke-linecap="round" opacity=".85"/><path d="M104 38 L120 44 L126 28" fill="none" stroke="#2a2a30" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/><path d="M18 11 C 60 9 98 11 112 36" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".35"/></svg>`;
}

function pin31() {
  const i = idea(31);
  const rots = [-0.6, 0.5, -0.4, 0.6, -0.5];
  const cards = i.items.map((t, k) => {
    const left = k % 2 === 0;
    return `<div class="rc ${left ? "l" : "r"}" data-check="step${k + 1}" style="transform:rotate(${rots[k]}deg)"><div class="num serif">${k + 1}</div><div class="rt serif">${esc(t)}</div></div>${k < 4 ? `<div class="gap ${left ? "l" : "r"}">${arrow(left ? 1 : -1)}</div>` : ""}`;
  }).join("");
  const counter = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 22% 8%,rgba(255,255,255,.2),transparent 60%),linear-gradient(#2f6f77,#265b63)")}"></div>
  <div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,transparent 2px 9px)")}"></div>
  ${Array.from({ length: 70 }, (_, k) => { const a = (k * 9301 + 49297) % 233280; return `<div style="${abs((a * 7) % 1000, SCENE_TOP + ((a * 13) % 980), 4, 4, "border-radius:50%;background:rgba(255,255,255,.07)")}"></div>`; }).join("")}`;
  const scene = `${counter}<div class="stack">${cards}</div>
  ${pencil({ x: 836, y: 478, len: 190, rot: 90 }).replace("<svg", '<svg data-z')}`;
  return printable({
    n: 31,
    scene: scene.replace(/<svg data-z style="/, '<svg style="z-index:6;'),
    paper: "#f1ebdc",
    extraCss: `
    .top h1{font-size:68px}
    .stack{position:absolute;left:0;top:${SCENE_TOP + 18}px;width:1000px;display:flex;flex-direction:column}
    .rc{position:relative;width:790px;background:linear-gradient(#e46a5b 0 3px,transparent 3px),repeating-linear-gradient(transparent 0 38px,rgba(80,120,170,.3) 38px 40px),#fffdf3;border-radius:6px;box-shadow:0 2px 3px rgba(0,0,0,.28),0 14px 22px rgba(0,0,0,.34);padding:14px 36px 16px 112px;border-top:18px solid #fffdf3}
    .rc.l{margin-left:46px}.rc.r{margin-left:168px}
    .rc::before{content:"";position:absolute;left:0;right:0;top:-18px;height:3px;background:#e46a5b}
    .rc .num{position:absolute;left:22px;top:2px;width:70px;height:70px;border-radius:50%;background:${C.plum};color:#fff;font-size:46px;line-height:68px;text-align:center;font-weight:600;box-shadow:0 4px 6px rgba(0,0,0,.3)}
    .rc .rt{font-size:32px;line-height:40px;color:#1f1b17}
    .gap{height:42px;position:relative}
    .gap .arr{position:absolute;top:-4px;width:150px;height:50px}
    .gap.l .arr{left:330px}.gap.r .arr{left:420px}`,
  });
}

export const pins = [pin9(), pin19(), pin23(), pin27(), pin31()];
