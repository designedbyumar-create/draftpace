/**
 * Batch 4, module c: #9 (the four levels as a plum staircase on a butter wall),
 * #19 (two letters, each coming out of its own envelope, on a slate-blue desk
 * blotter), #23 (a card-catalogue cabinet with one drawer open: notice,
 * declaration, affidavit), #27 (a window sill at dawn, the question in the
 * sky and the answer in a plum band) and #31 (five recipe-style step cards
 * on a teal enamel counter, joined by pencil arrows).
 * Every word is the idea bank's own; a card may carry one fragment of a
 * bank sentence, never a rewording.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { desk, pencil, binderClip } from "../kit/paper.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SHADOW = "0 2px 3px rgba(30,15,5,.28),0 16px 26px rgba(30,15,5,.34)";
const CAUTION = "Laws change. Confirm with your state before relying on this.";
const slug = (i) => `${i.n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`;
/** Guard: a fragment I split out of a bank sentence must still be that sentence's words. */
const must = (src, ...parts) => { for (const s of parts) if (!src.includes(s)) throw new Error(`b4-c: "${s}" is not in the bank text`); };

/* ---------------------------------------------------------------- #9 */

function pin9() {
  const i = idea(9);
  const tints = [
    { bg: "#ece1ee", top: "#f8f1f9", ink: "#2b1a30", edge: "#cdb8d3" },
    { bg: "#c9afd0", top: "#dcc6e1", ink: "#26142c", edge: "#a98cb2" },
    { bg: "#8f6a9a", top: "#a883b3", ink: "#ffffff", edge: "#6f4d79" },
    { bg: "#4a3350", top: "#65496c", ink: "#ffffff", edge: "#2f1f34" },
  ];
  const widths = [800, 862, 924, 986];
  const heights = [162, 196, 232, 268];
  let y = 396;
  const steps = i.items.map((t, k) => {
    const [head, ...rest] = t.split(": ");
    const body = rest.join(": ");
    const tn = tints[k];
    const h = heights[k];
    const html = `<div class="step" data-check="step${k}" style="left:0;top:${y}px;width:${widths[k]}px;height:${h}px;background:${tn.bg};color:${tn.ink};border-right:10px solid ${tn.edge}">
      <div class="tread" style="background:${tn.top}"></div>
      <div class="sin" style="padding-left:${50 + k * 8}px"><div class="hd serif" style="font-size:${38 + k * 5}px">${esc(head)}:</div><div class="bd">${esc(body)}</div></div></div>`;
    y += h + 4;
    return html;
  }).join("");
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(90deg,rgba(255,255,255,.18),transparent 30%),repeating-linear-gradient(90deg,rgba(120,90,40,.05) 0 2px,transparent 2px 120px),#efe3c6")}"></div>
  <div style="${abs(0, 1196, 1000, 8, "background:rgba(120,90,40,.1)")}"></div>`;
  const scene = `${wall}${steps}
  ${pencil({ x: 805, y: 465, len: 150, rot: 90 }).replace("<svg", '<svg data-z')}
  <div class="caut" data-check="caution" style="${abs(40, 1284, 920, 44)}">${esc(CAUTION)}</div>`;
  return printable({
    n: 9,
    scene,
    paper: "#f3ecda",
    extraCss: `
    .step{position:absolute;box-shadow:0 3px 3px rgba(40,25,5,.25),0 18px 24px rgba(40,25,5,.28);border-radius:0 10px 10px 0}
    .tread{position:absolute;left:0;right:0;top:0;height:16px;border-radius:0 8px 0 0}
    .sin{position:absolute;left:0;right:30px;top:22px}
    .hd{font-weight:600;letter-spacing:-.01em;line-height:1.1}
    .bd{font-size:31px;line-height:40px;margin-top:10px}
    .caut{font:500 27px/44px "Plex";color:#3c3224}
    .top p{font-size:25px;margin-top:12px}`,
  });
}

/* ---------------------------------------------------------------- #19 */

function envelope({ x, y, w, h, rot, color, shade, address, z = 3, stamp = true }) {
  const flap = `<svg style="${abs(0, 0, w, h)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="M0 0 L${w / 2} ${h * 0.52} L${w} 0" fill="none" stroke="${shade}" stroke-width="3"/><path d="M0 ${h} L${w * 0.36} ${h * 0.46}" fill="none" stroke="${shade}" stroke-width="2.5" opacity=".7"/><path d="M${w} ${h} L${w * 0.64} ${h * 0.46}" fill="none" stroke="${shade}" stroke-width="2.5" opacity=".7"/></svg>`;
  const st = stamp ? `<div style="${abs(w - 118, 20, 82, 98, "background:#f8f4e8;border:3px dotted #c8bfa6;padding:7px;box-shadow:0 2px 3px rgba(0,0,0,.2)")}"><div style="width:100%;height:100%;background:linear-gradient(#bfe0d4 0 62%,#7fae7a 62%);position:relative"><div style="${abs(22, 22, 24, 22, "background:#c4573e")}"></div><div style="${abs(14, 8, 40, 16, "background:#7a4b8a;clip-path:polygon(50% 0,100% 100%,0 100%)")}"></div><div style="${abs(52, 6, 14, 14, "background:#f2c14e;border-radius:50%")}"></div></div></div>` : "";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};background:linear-gradient(170deg,${color},${shade}22 160%),${color};border-radius:6px;box-shadow:${SHADOW}`)}">${flap}${st}
    <div class="addr hand" data-check="address" style="${abs(40, h * 0.3, w - 210, h * 0.62, "background:rgba(255,255,255,.6);padding:0 22px;border-radius:4px")}">${esc(address)}</div></div>`;
}

function letter({ x, y, w, h, rot, head, body, accent, z = 2 }) {
  return `<div class="ltr" data-check="letter" style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};border-top:14px solid ${accent}`)}">
    <div class="lh serif">${esc(head)}</div><div class="lb serif">${esc(body)}</div></div>`;
}

function pin19() {
  const i = idea(19);
  const [wd, rr, toA, toB] = i.items;
  const [wh, ...wrest] = wd.split(": ");
  const wb = wrest.join(": ");
  const [rh, ...rrest] = rr.split(": ");
  const rb = rrest.join(": ");
  const blotter = `${desk({ top: SCENE_TOP, height: 1500 - SCENE_TOP, base: "#6d4c35", dark: "#5c3f2b", planks: 4, seed: 11 })}
  <div style="${abs(26, 394, 948, 940, "background:linear-gradient(160deg,#3e546b,#2f4256);border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.35),0 26px 40px rgba(0,0,0,.45)")}"></div>
  <div style="${abs(26, 394, 948, 940, "border-radius:10px;border:3px solid rgba(255,255,255,.08);background:repeating-linear-gradient(45deg,transparent 0 6px,rgba(255,255,255,.015) 6px 7px)")}"></div>
  ${[[26, 394, "0 0 0 0"], [840, 394, ""], [26, 1220, ""], [840, 1220, ""]].map(([cx, cy], k) => `<div style="${abs(cx, cy, 134, 114, `background:linear-gradient(135deg,#a8744a,#855834);clip-path:polygon(${k === 0 ? "0 0,100% 0,0 100%" : k === 1 ? "0 0,100% 0,100% 100%" : k === 2 ? "0 0,0 100%,100% 100%" : "100% 0,100% 100%,0 100%"});z-index:1`)}"></div>`).join("")}`;
  const scene = `${blotter}
  ${letter({ x: 110, y: 410, w: 560, h: 270, rot: -1.2, head: wh, body: wb, accent: C.plum })}
  ${envelope({ x: 70, y: 640, w: 720, h: 190, rot: -1.2, color: "#fbf8ef", shade: "#cfc6b0", address: toA })}
  <div class="plus" style="${abs(836, 706, 100, 100)}">+</div>
  ${letter({ x: 300, y: 868, w: 600, h: 300, rot: 1, head: rh, body: rb, accent: "#4f8a8f", z: 2 })}
  ${envelope({ x: 230, y: 1130, w: 720, h: 190, rot: 1, color: "#e1c490", shade: "#a98749", address: toB })}
  ${binderClip({ x: 640, y: 1120, rot: 8, size: 90 }).replace("<svg", '<svg data-z')}
  ${pencil({ x: 56, y: 940, len: 330, rot: -64, body: "#1f3a63", band: "#c9a24a", tip: "#e9c9a0" })}`;
  return printable({
    n: 19,
    scene: scene.replace(/<svg data-z style="/, '<svg style="z-index:6;'),
    paper: "#eee7d8",
    extraCss: `
    .ltr{background:#fffdf6;border-radius:4px;padding:22px 38px;box-shadow:0 2px 3px rgba(0,0,0,.25),0 10px 16px rgba(0,0,0,.25);overflow:hidden}
    .lh{font-size:54px;line-height:1.05;font-weight:600;color:#1f1b17}
    .lb{font-size:35px;line-height:1.22;margin-top:12px;color:#38322b}
    .addr{font-size:40px;line-height:1.1;color:#2a2f4a;font-weight:600;display:flex;align-items:center;transform:rotate(-1deg)}
    .plus{z-index:5;border-radius:50%;background:${C.plum};color:#fff;font:600 78px/92px "Plex";text-align:center;box-shadow:0 8px 14px rgba(0,0,0,.4);border:5px solid #f6efe0}
    .top h1{font-size:86px}`,
  });
}

/* ---------------------------------------------------------------- #23 */

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
  const brass = "linear-gradient(135deg,#f3dc93,#c79a3a 55%,#8e6a1e)";
  const closed = (x, y, w, h) => `<div style="${abs(x, y, w, h, "background:linear-gradient(#7a4f30,#684226);border-radius:5px;box-shadow:inset 0 0 0 5px #5a3720,inset 0 0 0 7px rgba(255,255,255,.08),0 3px 5px rgba(0,0,0,.35)")}">
    <div style="${abs(w / 2 - 70, 16, 140, h * 0.34, `background:#efe5c6;border:5px solid #b98f35;border-radius:3px`)}"></div>
    <div style="${abs(w / 2 - 34, h - 36, 68, 14, `background:${brass};border-radius:7px;box-shadow:0 3px 4px rgba(0,0,0,.4)`)}"></div></div>`;
  const rowsTop = [392, 492].map((yy) => [0, 1, 2, 3].map((c) => closed(34 + c * 237, yy, 226, 92)).join("")).join("");
  const rowBottom = [0, 1, 2, 3].map((c) => closed(34 + c * 237, 1262, 226, 92)).join("");
  const cardAt = (k, top) => {
    const colors = ["#fbf5e3", "#f8f0d9", "#fffdf4"];
    const h = 1092 - top;
    const front = k === 2;
    return `<div class="icard" data-check="card${k}" style="${abs(110, top, 780, h, `background:${colors[k]};z-index:${2 + k}`)}">
      <div class="tabl" style="left:${30 + k * 255}px">${esc(tabs[k])}</div>
      <div class="frag serif ${front ? "big" : ""}">${esc(frags[k])}</div>
    </div>`;
  };
  const scene = `<div style="${abs(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(90deg,rgba(255,255,255,.1),transparent 40%,rgba(0,0,0,.18)),repeating-linear-gradient(90deg,rgba(0,0,0,.05) 0 3px,transparent 3px 11px),#5e3c24")}"></div>
  ${rowsTop}${rowBottom}
  <div style="${abs(70, 590, 860, 520, "background:#3d2616;border-radius:10px 10px 0 0;z-index:1")}"></div>
  ${cardAt(0, 640)}${cardAt(1, 756)}${cardAt(2, 872)}
  <div style="${abs(60, 1080, 880, 190, `z-index:8;background:linear-gradient(#845a38,#6f4727);border-radius:8px;box-shadow:inset 0 0 0 8px #5a3720,inset 0 0 0 10px rgba(255,255,255,.1),0 12px 18px rgba(0,0,0,.5)`)}"></div>
  <div class="ans" data-check="answer" style="${abs(112, 1112, 776, 112, "z-index:9")}"><div class="serif">${esc(i.sub)}</div></div>
  <div style="${abs(436, 1230, 128, 22, `z-index:9;background:${brass};border-radius:11px;box-shadow:0 4px 6px rgba(0,0,0,.5)`)}"></div>`;
  return printable({
    n: 23,
    scene,
    sub: false,
    paper: "#efe6d6",
    extraCss: `
    .top h1{font-size:76px}
    .icard{border-radius:10px 10px 0 0;box-shadow:0 -4px 8px rgba(0,0,0,.25);padding:22px 40px;border-top:3px solid rgba(255,255,255,.7)}
    .icard .tabl{position:absolute;top:-47px;width:230px;height:48px;border-radius:10px 10px 0 0;background:inherit;box-shadow:0 -4px 6px rgba(0,0,0,.22);font:600 26px/50px "Plex";letter-spacing:.06em;color:#3a2a18;text-align:center;border-top:3px solid rgba(255,255,255,.7)}
    .icard .frag{font-size:34px;line-height:44px;color:#241a10}
    .icard .frag.big{font-size:40px;line-height:50px;margin-top:14px}
    .ans{background:#fdf7e6;border:7px solid #b98f35;border-radius:6px;display:grid;place-items:center;box-shadow:inset 0 2px 5px rgba(0,0,0,.25)}
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
