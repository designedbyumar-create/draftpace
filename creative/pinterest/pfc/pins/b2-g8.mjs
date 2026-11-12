/**
 * Batch 2, group G8: the library corner.
 *
 *   #60  the guide's six-row organizer table as a fill-in page, ?s circled, on a mahogany reading table under a brass lamp
 *   #62  one large question card on a faded wall of blank sticky notes, a library ladder at the edge
 *   #64  two ruled pages (tidy and stamped Wrong, honest and stamped Useful) on navy book cloth, three-line list below
 *   #70  a split In / Out sheet with binder rings, leaning in front of a bookshelf and a rolling ladder
 *   #74  five ticked-test checklist card on a herringbone library floor, phone face down, a coral pencil, cloth books
 *
 * Words: every word is the idea's own (headline, sub, items, proof). Labels that are not verbatim bank text
 * are listed in the report: "Example" tag (the kit's), the stamps "Wrong" / "Useful" (#64, the idea's visual),
 * and the column heading "Area / What you write / Gap to close" (the guide's own proof words).
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const lcg = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const SCENE_TOP = 372, SCENE_BOTTOM = 1354, SCENE_H = SCENE_BOTTOM - SCENE_TOP;
const POP = "#e0572f";

/* ------------------------------------------------------------------ shared library props */

/** Grain: a fractal-noise layer that fills its (positioned) parent. */
const grain = (freq = ".8", op = 0.2, seed = 2, mode = "multiply", matrix = "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -.25") => {
  const id = `nz${++uid}`;
  return `<svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:${mode}" aria-hidden="true"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}"/><feColorMatrix values="${matrix}"/></filter><rect width="100%" height="100%" filter="url(#${id})" opacity="${op}"/></svg>`;
};
const lightGrain = (freq, op, seed) => grain(freq, op, seed, "overlay", "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.2 -.1");

const exTag = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 10px;${extra}">Example</span>`;

/** Wrap each question mark in a hand-circled span (CSS class .qm). */
const withQ = (t) => esc(t).replace(/\?/g, '<span class="qm">?</span>');

const QM_CSS = `
  .qm{display:inline-block;position:relative;padding:0 11px;margin:0 3px;color:#b83a18;font-weight:700}
  .qm::after{content:"";position:absolute;inset:-4px -1px -2px -3px;border:3.5px solid ${POP};border-radius:54% 46% 52% 48%/48% 56% 44% 52%;transform:rotate(-9deg);border-right-color:transparent;border-top-width:3px}
  .qm::before{content:"";position:absolute;inset:-7px -4px -5px -1px;border:3px solid ${POP};border-radius:48% 52% 46% 54%/55% 45% 55% 45%;transform:rotate(7deg);border-left-color:transparent;opacity:.9}`;

/** A row of blank book spines, bottom aligned, in a palette. */
function spines({ x, y, w, h, seed = 1, palette, z = 1 }) {
  const rnd = lcg(seed);
  const out = [];
  let cx = 0;
  while (cx < w) {
    const bw = 38 + Math.floor(rnd() * 44);
    const bh = Math.round(h * (0.7 + rnd() * 0.28));
    const col = palette[Math.floor(rnd() * palette.length)];
    const band = rnd() > 0.4 ? "#d9b866" : "#f1e7cf";
    const lab = rnd() > 0.55;
    out.push(`<div style="position:absolute;left:${cx}px;bottom:0;width:${bw - 2}px;height:${bh}px;background:linear-gradient(90deg,rgba(255,255,255,.2),rgba(255,255,255,0) 22%,rgba(0,0,0,0) 62%,rgba(0,0,0,.34)),${col};border-radius:3px 3px 0 0;box-shadow:inset 0 3px 0 rgba(255,255,255,.12)">
      <div style="position:absolute;left:0;right:0;top:${10 + Math.floor(rnd() * 12)}px;height:6px;background:${band};opacity:.85"></div>
      <div style="position:absolute;left:0;right:0;top:${24 + Math.floor(rnd() * 12)}px;height:3px;background:${band};opacity:.7"></div>
      ${lab ? `<div style="position:absolute;left:7px;right:7px;top:${bh * 0.34}px;height:${Math.min(86, bh * 0.3)}px;background:#efe3c4;opacity:.86;border-radius:2px"></div>` : ""}
      <div style="position:absolute;left:0;right:0;bottom:12px;height:5px;background:${band};opacity:.8"></div></div>`);
    cx += bw;
  }
  return `<div style="${abs(x, y, w, h, `overflow:hidden;z-index:${z}`)}">${out.join("")}</div>`;
}

/** A rolling library ladder, side-on: two rails, rungs, brass hooks. */
function ladder({ x, y, h, rot = 0, rail = ["#c5924f", "#9a6a30"], gap = 66, w = 96, z = 4 }) {
  const rungs = [];
  for (let k = 0; k < Math.floor((h - 60) / 72); k++) {
    rungs.push(`<rect x="10" y="${58 + k * 72}" width="${w - 20}" height="16" rx="3" fill="url(#lr${uid})"/><rect x="10" y="${58 + k * 72}" width="${w - 20}" height="4" fill="#fff" opacity=".28"/><rect x="10" y="${72 + k * 72}" width="${w - 20}" height="5" fill="#000" opacity=".18"/>`);
  }
  uid++;
  const id = uid;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(14px 6px 12px rgba(20,10,5,.42));z-index:${z}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs><linearGradient id="lr${id - 1}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${rail[0]}"/><stop offset="1" stop-color="${rail[1]}"/></linearGradient>
  <linearGradient id="rl${id}" x1="0" x2="1"><stop offset="0" stop-color="${rail[0]}"/><stop offset=".55" stop-color="${rail[1]}"/><stop offset="1" stop-color="#6e4a20"/></linearGradient></defs>
  <rect x="2" y="0" width="16" height="${h}" fill="url(#rl${id})"/><rect x="${w - 18}" y="0" width="16" height="${h}" fill="url(#rl${id})"/>
  <rect x="2" y="0" width="5" height="${h}" fill="#fff" opacity=".22"/><rect x="${w - 18}" y="0" width="5" height="${h}" fill="#fff" opacity=".22"/>
  ${rungs.join("")}
  <path d="M0 0 H20 V30 Q10 44 0 30 Z" fill="#d9b866"/><path d="M${w - 20} 0 H${w} V30 Q${w - 10} 44 ${w - 20} 30 Z" fill="#d9b866"/>
  <circle cx="10" cy="14" r="4" fill="#8c6a22"/><circle cx="${w - 10}" cy="14" r="4" fill="#8c6a22"/></svg>`;
}

/** A stack of cloth-bound books lying flat, fore-edges to the right, ribbon tails hanging. */
function clothStack({ x, y, w = 330, rot = 0, colors = ["#2f5d73", "#a8452f", "#c79a3b"], z = 4, ribbon = "#d9a53a" }) {
  const wv = 300, hv = 170;
  const h = (w * hv) / wv;
  const row = (k, col, dx, wd) => {
    const top = 98 - k * 48;
    return `<rect x="${dx}" y="${top}" width="${wd}" height="44" rx="5" fill="${col}"/>
    <rect x="${dx}" y="${top}" width="${wd}" height="44" rx="5" fill="url(#cw${uid})"/>
    <rect x="${dx}" y="${top}" width="${wd}" height="9" rx="4" fill="#fff" opacity=".16"/><rect x="${dx}" y="${top + 38}" width="${wd}" height="6" fill="#000" opacity=".22"/>
    <rect x="${dx + 16}" y="${top + 8}" width="${wd - 40}" height="3" fill="#e5c777" opacity=".85"/><rect x="${dx + 16}" y="${top + 33}" width="${wd - 40}" height="3" fill="#e5c777" opacity=".85"/>
    <rect x="${dx + wd - 12}" y="${top + 5}" width="14" height="34" rx="2" fill="#f4eddb"/><path d="M${dx + wd - 10} ${top + 12} h12 M${dx + wd - 10} ${top + 19} h12 M${dx + wd - 10} ${top + 26} h12 M${dx + wd - 10} ${top + 33} h12" stroke="#c9bfa5" stroke-width="1.5"/>`;
  };
  const html = `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,15,5,.42));z-index:${z}`)}" viewBox="0 0 ${wv} ${hv}" aria-hidden="true">
  <defs><pattern id="cw${uid}" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 2.5 H5 M2.5 0 V5" stroke="#000" stroke-opacity=".13" stroke-width="1"/></pattern></defs>
  ${row(0, colors[0], 6, 266)}${row(1, colors[1], 24, 242)}${row(2, colors[2], 14, 254)}
  <path d="M60 144 C 56 160, 60 168, 56 170" stroke="${ribbon}" stroke-width="5" fill="none" stroke-linecap="round"/></svg>`;
  uid++;
  return html;
}

/** A ribbon bookmark with a V-cut end. */
function bookmark({ x, y, len = 300, w = 46, rot = 0, color = "#b4452d", z = 5, tassel = false }) {
  return `<svg style="${abs(x, y, w, len + 40, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(30,15,5,.4));z-index:${z}`)}" viewBox="0 0 ${w} ${len + 40}" aria-hidden="true">
  <path d="M0 0 H${w} V${len} L${w / 2} ${len - 30} L0 ${len} Z" fill="${color}"/><path d="M0 0 H${w * 0.28} V${len - 20} L0 ${len} Z" fill="#fff" opacity=".16"/><path d="M${w - 5} 0 H${w} V${len} L${w - 6} ${len - 4} Z" fill="#000" opacity=".2"/>
  <rect x="${w / 2 - 2}" y="0" width="0" height="0"/>
  ${tassel ? `<rect x="${w / 2 - 5}" y="${len - 40}" width="10" height="14" rx="3" fill="#d9b866"/><path d="M${w / 2 - 6} ${len - 26} L${w / 2 - 8} ${len + 36} M${w / 2 - 2} ${len - 26} L${w / 2 - 2} ${len + 38} M${w / 2 + 2} ${len - 26} L${w / 2 + 3} ${len + 38} M${w / 2 + 6} ${len - 26} L${w / 2 + 8} ${len + 36}" stroke="#d9b866" stroke-width="3" stroke-linecap="round"/>` : ""}</svg>`;
}

/** A brass banker's lamp with a green glass shade, side view. */
function lamp({ x, y, w = 230, z = 4 }) {
  const h = w * 1.3;
  return `<svg style="${abs(x, y, w, h, `filter:drop-shadow(16px 22px 14px rgba(15,5,0,.5));z-index:${z}`)}" viewBox="0 0 230 300" aria-hidden="true">
  <defs><linearGradient id="gs${uid}" x1="0" x2="1"><stop offset="0" stop-color="#0f4a38"/><stop offset=".35" stop-color="#2a8a67"/><stop offset=".6" stop-color="#176a4d"/><stop offset="1" stop-color="#0a3427"/></linearGradient>
  <linearGradient id="br${uid}" x1="0" x2="1"><stop offset="0" stop-color="#8a6420"/><stop offset=".4" stop-color="#f1d98c"/><stop offset="1" stop-color="#7a5518"/></linearGradient></defs>
  <ellipse cx="116" cy="278" rx="76" ry="18" fill="url(#br${uid})"/><rect x="62" y="262" width="108" height="18" rx="6" fill="url(#br${uid})"/>
  <rect x="106" y="150" width="20" height="116" fill="url(#br${uid})"/><rect x="100" y="146" width="32" height="12" rx="4" fill="url(#br${uid})"/>
  <path d="M22 130 Q 30 40 116 30 Q 202 40 210 130 Z" fill="url(#gs${uid})"/>
  <path d="M22 130 Q 30 40 116 30 Q 202 40 210 130" fill="none" stroke="#06241b" stroke-opacity=".45" stroke-width="3"/>
  <path d="M52 104 Q 62 58 108 46" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="7" stroke-linecap="round"/>
  <rect x="14" y="126" width="204" height="10" rx="4" fill="url(#br${uid})"/><rect x="104" y="18" width="24" height="16" rx="5" fill="url(#br${uid})"/>
  <path d="M196 70 C 226 80 226 120 212 140" fill="none" stroke="#d9b866" stroke-width="3"/><circle cx="212" cy="146" r="5" fill="#d9b866"/></svg>`;
}

/** Pencil with a pop coral body (the kit pencil, re-coloured). */
const popPencil = (o) => pencil({ ...o, body: POP });

/** A blank sticky note. */
const sticky = ({ x, y, s = 150, rot = 0, color = "#f4dc83", z = 4 }) => `<div style="${abs(x, y, s, s, `transform:rotate(${rot}deg);background:linear-gradient(170deg,${color},${color} 70%,#00000014);box-shadow:0 2px 3px rgba(30,15,5,.25),0 14px 18px rgba(30,15,5,.34);z-index:${z}`)}"><div style="position:absolute;left:0;right:0;top:0;height:22px;background:linear-gradient(#0000000f,#0000)"></div></div>`;

/* ------------------------------------------------------------------ #60 */

function pin60() {
  const i = idea(60);
  const rows = i.items.map((t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; });
  const css = `
  .org{position:absolute;left:34px;top:410px;width:790px;transform:rotate(-1.4deg);z-index:3;background:#fdfcf7;border-radius:3px;padding:20px 22px 18px;box-shadow:0 2px 3px rgba(20,8,0,.3),0 20px 34px rgba(20,8,0,.45),0 44px 70px -20px rgba(20,8,0,.5);
    background-image:linear-gradient(90deg,transparent 31px,#e5a0a0 31px 33px,transparent 33px)}
  .org .bar{display:flex;align-items:center;justify-content:flex-end;height:36px;margin:0 0 6px 0}
  .org .grid{display:grid;grid-template-columns:152px 1fr 176px;border-top:3px solid ${C.forest};margin-left:30px}
  .org .h{font:600 22px "Plex",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};padding:11px 10px 10px;border-bottom:2px solid ${C.forest}}
  .org .a{font:600 25px "Plex",sans-serif;color:#1d1d20;padding:16px 10px;border-bottom:2px solid #c8d6cd;display:flex;align-items:flex-start}
  .org .w{font:600 35px/1.12 "Hand",cursive;color:#17473a;padding:10px 12px 12px;border-bottom:2px solid #c8d6cd;letter-spacing:.01em}
  .org .g{border-bottom:2px dashed #c8d6cd;border-left:2px solid #c8d6cd}
  ${QM_CSS}`;
  const cells = rows.map(([a, w]) => `<div class="a">${esc(a)}</div><div class="w">${withQ(w)}</div><div class="g"></div>`).join("");
  const org = `<div class="org" data-check="page"><div class="bar">${exTag()}</div><div class="grid"><div class="h">Area</div><div class="h">What you write</div><div class="h">Gap to close</div>${cells}</div></div>`;
  const table = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(90deg,#4a2418 0 3px,transparent 3px 190px),linear-gradient(178deg,#6b3524,#4e2517 60%,#3c1b11);overflow:hidden")}">${grain(".004 .1", .6, 3)}${grain(".01 .22", .32, 7)}${lightGrain(".006 .14", .16, 5)}
    <div style="position:absolute;left:560px;top:-60px;width:760px;height:700px;background:radial-gradient(ellipse at 40% 40%,rgba(255,214,140,.55),rgba(255,190,100,.18) 45%,transparent 70%);mix-blend-mode:screen"></div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 60% 20%,transparent 40%,rgba(20,6,0,.5))"></div></div>`;
  const props = `${lamp({ x: 770, y: 396, w: 220, z: 2 })}
  ${sticky({ x: 70, y: 1204, s: 128, rot: -6, color: "#f2d783", z: 4 })}
  ${popPencil({ x: 200, y: 1236, len: 440, rot: -9 })}
  ${clothStack({ x: 660, y: 1118, w: 320, rot: -3, colors: ["#2f5d73", "#8f3a2a", "#c79a3b"], z: 4 })}
  ${bookmark({ x: 892, y: 940, len: 150, w: 38, rot: 14, color: "#c4572e", z: 5 })}`;
  const scene = `${table}${org}${props}`;
  return printable({ n: 60, scene, paper: "#efe6d6", extraCss: css });
}

/* ------------------------------------------------------------------ #62 */

function pin62() {
  const i = idea(62);
  const [lead, tail] = ["Which Number Do You Most Want to Know About Your Money?", "Circle It First"];
  const colors = ["#f1dd9a", "#eab9bf", "#bfe0cd", "#bcd6e6", "#f1dd9a", "#d7c6e8"];
  const rnd = lcg(11);
  const notes = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 6; c++) {
    notes.push(`<div style="${abs(-40 + c * 188 + (r % 2) * 22, 6 + r * 190, 168, 168, `background:linear-gradient(165deg,${colors[Math.floor(rnd() * colors.length)]},${colors[Math.floor(rnd() * colors.length)]});opacity:.62;transform:rotate(${((rnd() - 0.5) * 6).toFixed(1)}deg);box-shadow:0 2px 3px rgba(40,50,40,.2),0 8px 12px rgba(40,50,40,.18)`)}"></div>`);
  }
  const circle = (txt, rot) => `<div class="ch"><span class="t">${esc(txt)}</span>
    <svg class="ring" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden="true" style="transform:rotate(${rot}deg)"><path d="M30 54 C 12 22, 120 6, 230 8 C 350 10, 396 34, 384 64 C 372 92, 250 96, 150 92 C 60 90, 14 74, 20 46 C 26 24, 70 12, 130 8" fill="none" stroke="#3f434b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/><path d="M36 60 C 20 34, 130 14, 232 14 C 340 14, 386 38, 376 62" fill="none" stroke="#3f434b" stroke-width="2.4" stroke-opacity=".5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></div>`;
  const css = `
  .wall{position:absolute;inset:0;background:radial-gradient(ellipse at 30% 10%,#e4ecdf,#cdd9c8 70%),#cdd9c8;overflow:hidden}
  .wash{position:absolute;inset:0;background:rgba(236,242,232,.38)}
  .card{position:absolute;left:78px;top:92px;width:844px;height:1210px;border-radius:6px;transform:rotate(-1.1deg);z-index:5;padding:64px 60px 0;display:flex;flex-direction:column;
    background:#fffdf7;box-shadow:0 2px 4px rgba(30,40,30,.3),0 28px 48px rgba(30,40,30,.4),0 60px 90px -30px rgba(30,40,30,.45)}
  .card .eyebrow{font-size:23px}
  .card h1{font:500 86px/1.02 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:22px;color:#1d1d20}
  .card h2{font:italic 500 78px/1 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:16px;color:${C.forest}}
  .card .rule{height:3px;background:${C.rule};margin:40px 0 46px}
  .ch{position:relative;display:inline-block;align-self:flex-start;margin:0 0 56px 20px;padding:30px 54px}
  .ch .t{position:relative;z-index:1;font:500 62px/1.05 "Newsreader",Georgia,serif;color:#17473a;white-space:nowrap}
  .ring{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
  .card .sub{font:500 38px/1.25 "Newsreader",Georgia,serif;color:#4b4339;margin-top:auto;padding-bottom:84px;max-width:640px}`;
  const body = `<div class="wall">${notes.join("")}<div class="wash"></div></div>
  ${ladder({ x: 892, y: -30, h: 1560, rot: 1.2, w: 98, z: 3 })}
  <div class="card"><div class="eyebrow">${esc(i.board)}</div>
    <div data-check="headline"><h1>${esc(lead)}</h1><h2>${esc(tail)}</h2></div>
    <div class="rule"></div>
    ${circle(i.items[0], -1.2)}${circle(i.items[1], 1)}
    <div class="sub">${esc(i.sub)}</div></div>
  ${popPencil({ x: 520, y: 1262, len: 420, rot: -8 }).replace("z-index", "z-index")}
  ${footFor(i)}`;
  const html = page(p, { body, css, paper: "#cdd9c8" });
  return { n: 62, id: `62-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html };
}

/* ------------------------------------------------------------------ #64 */

function pin64() {
  const i = idea(64);
  const tidy = [
    ["Bills", "Rent $1,450 on the 1st."],
    ["Subscriptions", "Streaming, phone backup, gym"],
    ["Debts", "Visa about $2,600. Student loan, payment about $120"],
  ];
  const real = [
    ["Bills", "Rent $1,450 on the 1st. Electric ?. Car insurance ?, date ?"],
    ["Subscriptions", "Streaming, phone backup, gym?"],
    ["Debts", "Visa about $2,600, rate ?. Student loan, payment about $120"],
  ];
  const css = `
  .rp{position:absolute;width:860px;z-index:3;padding:14px 22px 6px 56px;border-radius:3px;
    background:repeating-linear-gradient(#fdfcf7 0 51px,#b9cde0 51px 53px),#fdfcf7;
    box-shadow:0 2px 3px rgba(5,10,25,.4),0 20px 34px rgba(5,10,25,.5)}
  .rp::before{content:"";position:absolute;left:38px;top:0;bottom:0;width:2px;background:#e49a9a}
  .rp .tg{display:grid}
  .rp .eb{height:44px;display:flex;align-items:center}
  .rp .h{font:600 22px "Plex",sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.forest};padding:6px 6px 8px;border-bottom:2px solid ${C.forest}}
  .rp .a{font:600 24px "Plex",sans-serif;color:#1d1d20;padding:14px 6px;display:flex;align-items:flex-start}
  .rp .w{font:600 34px/1.1 "Hand",cursive;color:#17473a;padding:8px 8px 8px}
  .rp .g{border-left:2px solid #c8d6cd}
  .stamp{position:absolute;z-index:6;font:600 40px "Plex",sans-serif;letter-spacing:.2em;text-transform:uppercase;padding:6px 20px 6px 26px;border:5px solid;border-radius:8px;mask:linear-gradient(#000,#000);opacity:.92}
  .list{position:absolute;left:46px;top:1080px;width:900px;z-index:4;padding:24px 34px 22px;background:#f6f1e3;border-radius:4px;transform:rotate(-.6deg);box-shadow:0 2px 3px rgba(5,10,25,.4),0 18px 30px rgba(5,10,25,.5)}
  .list li{list-style:none;position:relative;padding-left:40px;font:500 29px/1.28 "Plex",sans-serif;color:#2a2c31;margin:10px 0}
  .list li::before{content:"";position:absolute;left:4px;top:11px;width:16px;height:16px;border:3px solid ${C.forest};border-radius:3px}
  ${QM_CSS}`;
  const tg = (rows, cols) => `<div class="tg" style="grid-template-columns:${cols}"><div class="h">Area</div><div class="h">What you write</div>${cols.split(" ").length > 2 ? '<div class="h">Gap to close</div>' : ""}${rows.map(([a, w]) => `<div class="a">${esc(a)}</div><div class="w">${withQ(w)}</div>${cols.split(" ").length > 2 ? '<div class="g"></div>' : ""}`).join("")}</div>`;
  const cover = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,rgba(0,0,0,.14) 0 1px,transparent 1px 4px),radial-gradient(ellipse at 24% 10%,rgba(255,255,255,.18),transparent 60%),#27395a;overflow:hidden")}">${grain(".7", .35, 6)}${lightGrain(".03 .5", .2, 4)}
    <div style="position:absolute;left:18px;right:18px;top:18px;bottom:18px;border:3px solid #cfae62;border-radius:6px;opacity:.55"></div>
    <div style="position:absolute;left:30px;right:30px;top:30px;bottom:30px;border:1.5px solid #cfae62;border-radius:4px;opacity:.5"></div></div>`;
  const pageA = `<div class="rp" data-check="page" style="left:24px;top:402px;transform:rotate(-1.3deg)"><div class="eb">${exTag()}</div>${tg(tidy, "190px 1fr")}<div class="stamp" style="right:34px;top:22px;color:#b3261e;transform:rotate(7deg)">Wrong</div><div style="position:absolute;left:62px;top:-14px;display:none"></div></div>`;
  const pageB = `<div class="rp" data-check="page" style="left:104px;top:716px;width:850px;transform:rotate(1deg)"><div class="eb">${exTag()}</div>${tg(real, "172px 1fr 150px")}<div class="stamp" style="right:30px;bottom:18px;color:#17473a;transform:rotate(-6deg);background:#fdfcf7cc">Useful</div></div>`;
  const list = `<ul class="list" data-check="list">${i.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  const scene = `${cover}${pageA}${pageB}${list}${bookmark({ x: 910, y: 960, len: 130, w: 38, rot: 8, color: "#d9a53a", z: 7 })}`;
  return printable({ n: 64, scene, paper: "#e8ecf2", extraCss: css });
}

/* ------------------------------------------------------------------ #70 */

function pin70() {
  const i = idea(70);
  const css = `
  .sp{position:absolute;left:64px;top:408px;width:800px;height:920px;transform:rotate(-1.2deg);z-index:4}
  .sp .pg{position:absolute;inset:0;background:#fdfcf7;border-radius:3px;box-shadow:0 2px 3px rgba(10,5,0,.35),0 22px 36px rgba(10,5,0,.5),0 50px 80px -20px rgba(10,5,0,.5);overflow:hidden}
  .sp .ring{position:absolute;left:-30px;width:86px;height:46px;border:9px solid #b8bcc3;border-radius:46px;background:transparent;box-shadow:0 5px 6px rgba(0,0,0,.35),inset 0 2px 3px rgba(255,255,255,.7);clip-path:none}
  .sp .hole{position:absolute;left:26px;width:30px;height:30px;border-radius:50%;background:#3a2a1a;box-shadow:inset 2px 3px 4px rgba(0,0,0,.6);opacity:.85}
  .sp .col{position:absolute;top:0;bottom:0;padding:34px 30px 0}
  .sp .L{left:84px;width:342px;background:linear-gradient(#eef4f1,#f7faf8)}
  .sp .R{left:426px;width:374px;background:#fdf6f2;border-left:3px solid #d8c7bf}
  .sp h3{font:500 92px/1 "Newsreader",Georgia,serif;letter-spacing:-.02em}
  .sp .L h3{color:${C.forest}}.sp .R h3{color:#a8321f}
  .fld{margin-top:26px;border:3px solid ${C.forest};border-radius:10px;background:#fff;padding:14px 16px 16px}
  .fld .lb{font:600 25px/1.2 "Plex",sans-serif;color:#2a2c31}
  .fld .bx{display:flex;gap:10px;margin-top:12px}
  .fld .bx i{display:block;width:46px;height:56px;border:3px solid #9bb3a5;border-radius:6px;background:#fafcfb}
  .fld .ln{margin-top:14px;height:50px;border-bottom:3px solid #9bb3a5}
  .strip{position:relative;margin-top:36px;padding:16px 18px;border-radius:6px;background:#fff;border:3px solid #cdb0a6;font:600 33px/1.15 "Plex",sans-serif;color:#2a2c31}
  .strip::after{content:"";position:absolute;left:-12px;right:-12px;top:50%;height:7px;margin-top:-3px;background:#a8321f;border-radius:4px;transform:rotate(-2.5deg);opacity:.92}
  .tabl{position:absolute;right:-6px;top:68px;width:30px;height:120px}`;
  const shelf = (y, seed, palette) => `${spines({ x: 0, y, w: 1000, h: 296, seed, palette, z: 1 })}<div style="${abs(0, y + 296, 1000, 26, "background:linear-gradient(#a87a45,#7a5028);box-shadow:0 8px 14px rgba(0,0,0,.5);z-index:2")}"></div>`;
  const pal = ["#7a2a22", "#1f4a3a", "#26395a", "#c79a3b", "#4a2f4f", "#8a5a2c", "#2f5d73", "#a8452f", "#efe3c4", "#17473a"];
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(#251610,#3a2418);overflow:hidden")}">
    ${shelf(14, 3, pal)}${shelf(336, 8, pal.slice().reverse())}${shelf(658, 15, pal)}
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 40% 45%,rgba(255,210,150,.12),rgba(10,4,0,.5) 90%);z-index:3"></div></div>`;
  // spines() / shelf() positions are scene-relative: lift them by SCENE_TOP via the wrapper above
  const rings = [120, 420, 720].map((t) => `<div class="ring" style="top:${t}px"></div><div class="hole" style="top:${t + 8}px"></div>`).join("");
  const sheet = `<div class="sp" data-check="page"><div class="pg">
    <div class="col L"><h3>In</h3><div class="fld"><div class="lb">${esc("last four digits")}</div><div class="bx"><i></i><i></i><i></i><i></i></div><div class="lb" style="margin-top:20px">${esc("where the full record lives")}</div><div class="ln"></div></div></div>
    <div class="col R"><h3>Out</h3><div class="strip">${esc("passwords")}</div><div class="strip">${esc("security answers")}</div></div></div>${rings}</div>`;
  const scene = `${wall}${ladder({ x: 892, y: 360, h: 1000, rot: 0, w: 96, z: 3 })}${sheet}`;
  return printable({ n: 70, scene, paper: "#efe6d6", extraCss: css });
}

/* ------------------------------------------------------------------ #74 */

function pin74() {
  const i = idea(74);
  const css = `
  .ck{position:absolute;left:36px;top:410px;width:730px;transform:rotate(-1.4deg);z-index:3;padding:34px 34px 30px 98px;border-radius:4px;
    background:linear-gradient(90deg,transparent 78px,#e49a9a 78px 80px,transparent 80px),repeating-linear-gradient(#fffdf6 0 43px,#c6d4cc 43px 45px),#fffdf6;
    box-shadow:0 2px 3px rgba(40,20,5,.3),0 20px 34px rgba(40,20,5,.42)}
  .ck .it{position:relative;font:500 28px/45px "Plex",sans-serif;color:#1d1d20;margin-bottom:45px}
  .ck .it:last-child{margin-bottom:0}
  .ck .bx{position:absolute;left:-62px;top:5px;width:36px;height:36px;border:3.5px solid ${C.forest};border-radius:6px;background:#fffdf6}
  .ck .bx.no{border-style:dashed;border-color:#7d8f86}
  .ck .bx svg{position:absolute;left:-2px;top:-9px;width:42px;height:44px}`;
  const check = `<svg viewBox="0 0 42 44" aria-hidden="true"><path d="M5 24 C 10 28, 14 34, 17 40 C 22 24, 30 10, 40 2" fill="none" stroke="${C.forest}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const items = i.items.map((t, k) => `<div class="it"><span class="bx${k === 4 ? " no" : ""}">${k === 4 ? "" : check}</span>${esc(t)}</div>`).join("");
  const ck = `<div class="ck" data-check="page">${items}</div>`;
  // herringbone-ish parquet: basket-weave of slats
  const slats = [];
  const rnd = lcg(21);
  const tones = ["#d9a867", "#cf9c5a", "#dcae72", "#c8944f"];
  for (let r = 0; r < 14; r++) for (let c = 0; c < 10; c++) {
    const horiz = (r + c) % 2 === 0;
    const x0 = c * 110, y0 = r * 110;
    for (let k = 0; k < 4; k++) {
      const t = tones[Math.floor(rnd() * tones.length)];
      slats.push(horiz ? `<rect x="${x0}" y="${y0 + k * 27.5 + 1}" width="108" height="25.5" fill="${t}"/>` : `<rect x="${x0 + k * 27.5 + 1}" y="${y0}" width="25.5" height="108" fill="${t}"/>`);
    }
  }
  const floor = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "overflow:hidden;background:#8a5a2c")}"><svg style="position:absolute;left:0;top:0;width:1100px;height:1540px" viewBox="0 0 1100 1540" aria-hidden="true">${slats.join("")}</svg>${grain(".02 .3", .3, 9)}
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 28% 12%,rgba(255,240,200,.3),transparent 60%),radial-gradient(ellipse at 50% 55%,transparent 55%,rgba(60,30,5,.35))"></div></div>`;
  const phone = `<div style="${abs(796, 448, 190, 392, "transform:rotate(6deg);border-radius:34px;z-index:3;background:linear-gradient(150deg,#1d5a47,#0f2f27);box-shadow:0 3px 4px rgba(20,10,0,.4),0 24px 34px rgba(20,10,0,.5)")}">
    <div style="position:absolute;left:16px;top:16px;width:78px;height:78px;border-radius:22px;background:#0b211b;box-shadow:inset 0 0 0 3px #2c6b57"></div>
    <div style="position:absolute;left:30px;top:30px;width:22px;height:22px;border-radius:50%;background:#050f0c;box-shadow:0 0 0 4px #1a4739"></div><div style="position:absolute;left:60px;top:30px;width:22px;height:22px;border-radius:50%;background:#050f0c;box-shadow:0 0 0 4px #1a4739"></div>
    <div style="position:absolute;left:30px;top:60px;width:22px;height:22px;border-radius:50%;background:#050f0c;box-shadow:0 0 0 4px #1a4739"></div>
    <div style="position:absolute;left:14px;top:14px;right:14px;bottom:14px;border-radius:22px;background:linear-gradient(120deg,rgba(255,255,255,.12),transparent 40%)"></div></div>`;
  const props = `${phone}
  ${clothStack({ x: 620, y: 1100, w: 360, rot: -4, colors: ["#a8452f", "#2f5d73", "#d9a53a"], z: 4, ribbon: "#2f5d73" })}
  ${popPencil({ x: 60, y: 1236, len: 500, rot: -5 })}
  ${bookmark({ x: 860, y: 868, len: 190, w: 40, rot: -18, color: "#17473a", z: 5, tassel: true })}`;
  return printable({ n: 74, scene: `${floor}${ck}${props}`, paper: "#f2e8d4", extraCss: css });
}

export const pins = [pin60(), pin62(), pin64(), pin70(), pin74()];
