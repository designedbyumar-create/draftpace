/**
 * ADHD Life Companion guide pins, world w03: the mail pile.
 * Kraft and window envelopes, a letter opener, rubber bands, a recycling bin,
 * mail trays, a door mat, a slice of floor. Warm kraft and cream.
 *
 * #28 scenario     pale-ash desk from above: a kraft envelope face down, a damp ring, a laptop with four tabs
 * #42 quote-card   a door mat under a tall mail pile, one big butter note, the top five circled
 * #45 scenario     a dark kitchen table in lamplight: one envelope sliding out from under a fruit bowl
 * #57 before-after a tote spilling mail, an arrow, four kraft trays (Act, Keep, Ask someone, Bin or shred)
 * #59 question     a chair seat holding a leaning stack, a note that spells D.O.O.M.
 * #61 how-to-steps a five-stop timeline: bin and clock, envelope slit open, a blank page, pick one, stop
 *
 * No app screens and no printed book pages. Every word is bank text or a label real to the thing drawn.
 */
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { page, esc } from "../../v3/kit.mjs";
import { desk } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const SCENE_H = 1500 - SCENE_TOP;

const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};
let UID = 0;
const gid = (k = "g") => `${k}${++UID}`;

/* ------------------------------------------------------------------ frame */
function frame(i, { paper, ink = "#231a1f", eyebrow = C.mulberry, muted = "#4b4339", size = 72, sub = null, textTop = 70, dark = false, shadow = "rgba(40,20,5,.28)", bottomMax = 366, splitOn = ": " }) {
  const [eb, rest] = i.headline.includes(splitOn) ? [i.headline.split(splitOn)[0] + (splitOn === "? " ? "?" : ""), i.headline.split(splitOn).slice(1).join(splitOn)] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px ${shadow};z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px ${shadow};z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:6;color:${ink}}
  .top .eyebrow{color:${eyebrow}}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:16px}
  .top p{font-size:28px;line-height:1.32;margin-top:16px;color:${muted};max-width:860px}
  .example{font-size:24px;padding:5px 10px;background:rgba(255,253,248,.92);color:#4b4339}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${bottomMax}">${eb ? `<div class="eyebrow">${esc(eb)}</div>` : ""}<h1>${esc(rest)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i, { dark })}`;
  return { css, html };
}

/* ------------------------------------------------------------------ props */
const KINDS = {
  kraft: ["#d3b383", "#bf9a68", "#a98550"],
  manila: ["#e6cd96", "#d6b676", "#bf9a52"],
  cream: ["#f7eedc", "#eadcc0", "#d9c7a3"],
  white: ["#fbf8f1", "#eee7d8", "#dccfb8"],
  blush: ["#efd8cb", "#e0bfae", "#cea08c"],
  sage: ["#d7dac1", "#c2c7a4", "#a9b088"],
};

/** An envelope: front (address bars, stamp, optional window) or back (flap). `label` is a printed address label with real words. */
function envelope({ x, y, w = 420, h = Math.round(w * 0.66), rot = 0, kind = "kraft", face = "front", win = false, label = null, labelSize = 26, stamp = true, z = 1, seed = 1, shadow = 1 }) {
  const [a, b, c] = KINDS[kind];
  const r = rng(seed * 7 + w);
  const id = gid("e");
  const bars = (bx, by, n, bw) => Array.from({ length: n }, (_, k) => `<rect x="${bx}" y="${by + k * 20}" width="${(bw * (0.6 + r() * 0.4)).toFixed(0)}" height="9" rx="4.5" fill="#4a382c" opacity=".34"/>`).join("");
  const fibres = kind === "kraft" || kind === "manila" ? Array.from({ length: 14 }, () => { const fx = r() * w, fy = r() * h; return `<path d="M${fx.toFixed(0)} ${fy.toFixed(0)} l${(18 + r() * 40).toFixed(0)} ${((r() - 0.5) * 5).toFixed(1)}" stroke="#7a5a30" stroke-opacity=".13" stroke-width="1.4" fill="none"/>`; }).join("") : "";
  let inner = "";
  if (face === "front") {
    if (win) {
      inner += `<rect x="${w * 0.07}" y="${h * 0.34}" width="${w * 0.52}" height="${h * 0.3}" rx="4" fill="#fdfcf8" stroke="#000" stroke-opacity=".16" stroke-width="2"/><rect x="${w * 0.07}" y="${h * 0.34}" width="${w * 0.52}" height="6" fill="#000" opacity=".07"/>${bars(w * 0.1, h * 0.42, 3, w * 0.4)}`;
    } else if (!label) {
      inner += bars(w * 0.3, h * 0.44, 3, w * 0.46);
    }
    inner += bars(w * 0.06, h * 0.08, 2, w * 0.2);
    if (stamp) inner += `<g transform="translate(${w - 78} 16)"><rect width="58" height="66" fill="${r() > 0.5 ? "#b9806a" : "#8aa090"}" rx="2"/><rect x="6" y="6" width="46" height="54" fill="#fff" opacity=".28"/><rect x="-2" y="-2" width="62" height="70" fill="none" stroke="${a}" stroke-width="4" stroke-dasharray="3 4"/></g><path d="M${w - 120} 40 q10 -14 20 0 t20 0 t20 0" stroke="#4a382c" stroke-opacity=".3" stroke-width="3" fill="none"/>`;
  } else {
    inner += `<path d="M0 ${h} L${w * 0.42} ${h * 0.46} M${w} ${h} L${w * 0.58} ${h * 0.46}" stroke="#000" stroke-opacity=".1" stroke-width="2"/>
    <path d="M0 0 L${w / 2} ${h * 0.6} L${w} 0 Z" fill="url(#${id}f)"/><path d="M0 0 L${w / 2} ${h * 0.6} L${w} 0" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M6 3 L${w / 2} ${h * 0.6 - 5} L${w - 6} 3" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2"/>`;
  }
  const lab = label ? `<div style="position:absolute;left:${w * 0.08}px;top:${h * 0.36}px;width:${w * 0.62}px;min-height:${h * 0.3}px;padding:8px 12px;background:#fffdf8;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,.25);font:600 ${labelSize}px/1.15 'Plex',sans-serif;color:#2c2320;display:flex;align-items:center" data-check="label">${esc(label)}</div>` : "";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};${shadow ? "filter:drop-shadow(0 2px 2px rgba(40,22,8,.34)) drop-shadow(0 12px 12px rgba(40,22,8,.26))" : ""}`)}">
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;inset:0" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
    <rect width="${w}" height="${h}" rx="4" fill="url(#${id})"/>${fibres}${inner}
    <rect width="${w}" height="${h}" rx="4" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="1.5"/></svg>${lab}</div>`;
}

/** A butter sticky note with handwriting. */
function sticky({ x, y, w, h, rot = 0, body, z = 8, tint = ["#f8e8a4", "#efd06a"] }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};background:linear-gradient(172deg,${tint[0]},${tint[1]});box-shadow:0 2px 3px rgba(40,22,8,.35),0 18px 24px rgba(40,22,8,.38)`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:11%;background:rgba(255,255,255,.22)"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:14%;background:linear-gradient(transparent,rgba(150,105,20,.16))"></div>${body}</div>`;
}

/** A hand-drawn mulberry marker loop around a region (one overshooting stroke). */
function loop({ cx, cy, rx, ry, rot = 0, sw = 10, color = C.mulberry, seed = 3, z = 9 }) {
  const r = rng(seed);
  const N = 72;
  const a0 = -2.2 + r() * 0.5;
  const ph = r() * 6;
  let d = "";
  for (let t = 0; t <= N; t++) {
    const ang = a0 + (t / N) * (Math.PI * 2 + 0.7);
    const rr = 1 + 0.035 * Math.sin(3 * ang + ph) + 0.025 * Math.sin(5 * ang + ph * 2) + (t / N) * 0.07;
    d += `${t ? "L" : "M"}${(Math.cos(ang) * rx * rr).toFixed(1)} ${(Math.sin(ang) * ry * rr).toFixed(1)} `;
  }
  const W = rx * 2 + 80, H = ry * 2 + 80;
  return `<svg style="${abs(cx - W / 2, cy - H / 2, W, H, `transform:rotate(${rot}deg);z-index:${z};overflow:visible;filter:drop-shadow(0 3px 3px rgba(40,10,25,.28))`)}" viewBox="${-W / 2} ${-H / 2} ${W} ${H}" aria-hidden="true"><path d="${d}" fill="none" stroke="#fffaf2" stroke-opacity=".55" stroke-width="${sw + 7}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity=".94"/></svg>`;
}

/** A brass letter opener lying at an angle. */
function opener({ x, y, len = 360, rot = 0, z = 6 }) {
  const id = gid("o");
  return `<svg style="${abs(x, y, len, 56, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 10px 8px rgba(30,15,5,.4))`)}" viewBox="0 0 360 56" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1deaa"/><stop offset=".5" stop-color="#d1a850"/><stop offset="1" stop-color="#a97f2e"/></linearGradient></defs>
  <path d="M2 28 C 60 6, 150 6, 232 14 L232 42 C 150 50, 60 50, 2 28 Z" fill="url(#${id})"/><path d="M8 28 C 60 20, 150 18, 230 22" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>
  <rect x="228" y="6" width="14" height="44" rx="4" fill="#b88a34"/><rect x="230" y="8" width="4" height="40" fill="#fff" opacity=".35"/>
  <path d="M242 14 L330 12 Q354 12 354 28 Q354 44 330 42 L242 42 Z" fill="#5f3d4b"/><path d="M246 18 L328 17 Q346 17 346 24 L246 24 Z" fill="#fff" opacity=".16"/><circle cx="338" cy="28" r="6" fill="#2c1a22" opacity=".5"/></svg>`;
}

/** A rubber band round a bundle: two bands, drawn as stretched ovals. */
function band({ cx, cy, w, h, rot = 0, z = 7 }) {
  return `<svg style="${abs(cx - w / 2 - 10, cy - h / 2 - 10, w + 20, h + 20, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 4px 3px rgba(40,20,5,.35))`)}" viewBox="-10 -10 ${w + 20} ${h + 20}" aria-hidden="true"><rect x="0" y="0" width="${w}" height="${h}" rx="${Math.min(w, h) / 2.4}" fill="none" stroke="#d9a064" stroke-width="9"/><rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="${Math.min(w, h) / 2.4}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="2.5"/></svg>`;
}

/** A pencil-thin pen lying at an angle. */
function pen({ x, y, len = 360, rot = 0, body = "#3a2f36", z = 6 }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 9px 6px rgba(30,15,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="#d6b36a"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="#d6b36a"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;
}

/** An analogue clock face (no numerals), hands at ten to two. */
function clock({ x, y, s = 130, z = 4 }) {
  const t = Array.from({ length: 12 }, (_, k) => { const a = (k * Math.PI) / 6; return `<line x1="${60 + Math.sin(a) * 46}" y1="${60 - Math.cos(a) * 46}" x2="${60 + Math.sin(a) * 52}" y2="${60 - Math.cos(a) * 52}" stroke="#4a382c" stroke-width="${k % 3 ? 2.5 : 4.5}" stroke-linecap="round"/>`; }).join("");
  return `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 8px 7px rgba(40,22,8,.35))`)}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="58" fill="#4a382c"/><circle cx="60" cy="60" r="54" fill="#fffdf8"/>${t}<line x1="60" y1="60" x2="60" y2="22" stroke="#231a1f" stroke-width="5" stroke-linecap="round"/><line x1="60" y1="60" x2="86" y2="74" stroke="#231a1f" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="60" r="5" fill="#231a1f"/></svg>`;
}

/** An open recycling bin seen from above, with torn scraps inside. */
function bin({ x, y, s = 170, z = 4, seed = 2 }) {
  const r = rng(seed);
  const scraps = Array.from({ length: 7 }, () => `<rect x="${(r() * 70 + 26).toFixed(0)}" y="${(r() * 70 + 26).toFixed(0)}" width="${(22 + r() * 22).toFixed(0)}" height="${(12 + r() * 16).toFixed(0)}" fill="#f6f1e6" opacity=".9" transform="rotate(${(r() * 120 - 60).toFixed(0)} 60 60)"/>`).join("");
  return `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 12px 10px rgba(40,22,8,.4))`)}" viewBox="0 0 120 120" aria-hidden="true"><rect x="2" y="2" width="116" height="116" rx="20" fill="#7e9a97"/><rect x="2" y="2" width="116" height="116" rx="20" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><rect x="12" y="12" width="96" height="96" rx="12" fill="#43595a"/><rect x="12" y="12" width="96" height="96" rx="12" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>${scraps}<rect x="30" y="2" width="60" height="9" rx="4" fill="#5d7774"/></svg>`;
}

/** A top-down mail tray: kraft board with a raised rim, a darker floor. */
function tray({ x, y, w, h, z = 2 }) {
  const id = gid("t");
  return `<svg style="${abs(x, y, w, h, `z-index:${z};filter:drop-shadow(0 3px 3px rgba(40,22,8,.35)) drop-shadow(0 16px 16px rgba(40,22,8,.3))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9bb8b"/><stop offset="1" stop-color="#bf9a66"/></linearGradient><linearGradient id="${id}i" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9c7a4a"/><stop offset=".25" stop-color="#b8935f"/><stop offset="1" stop-color="#c8a674"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="14" fill="url(#${id})"/><rect width="${w}" height="${h}" rx="14" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/>
  <rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="7" fill="url(#${id}i)"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="7" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="2"/></svg>`;
}

/** A coir door mat with a darker border band. */
function mat({ x, y, w, h, z = 1 }) {
  return `<div style="${abs(x, y, w, h, `z-index:${z};border-radius:26px;background:#8c6b45;box-shadow:0 3px 3px rgba(30,15,5,.4),0 22px 34px rgba(30,15,5,.4);overflow:hidden`)}">
    <div style="position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,rgba(40,22,8,.18) 0 3px,transparent 3px 11px),repeating-linear-gradient(0deg,rgba(255,230,180,.1) 0 2px,transparent 2px 7px),radial-gradient(120% 90% at 30% 20%,#a07e55,#7d5e3b)"></div>
    <div style="position:absolute;inset:34px;border:16px solid #5b402a;border-radius:12px;opacity:.55"></div>
    <div style="position:absolute;inset:92px;border:4px solid #d9b98a;border-radius:6px;opacity:.28"></div></div>`;
}

/** A kitchen timer from the front: a round cream body with a dial, no numerals. */
function timer({ x, y, s = 150, z = 4 }) {
  const t = Array.from({ length: 12 }, (_, k) => { const a = (k * Math.PI) / 6; return `<line x1="${70 + Math.sin(a) * 46}" y1="${70 - Math.cos(a) * 46}" x2="${70 + Math.sin(a) * 54}" y2="${70 - Math.cos(a) * 54}" stroke="#4a382c" stroke-width="3" stroke-linecap="round"/>`; }).join("");
  return `<svg style="${abs(x, y, s, s, `z-index:${z};filter:drop-shadow(0 10px 8px rgba(40,22,8,.38))`)}" viewBox="0 0 140 140" aria-hidden="true"><circle cx="70" cy="70" r="68" fill="#e9dcc4"/><circle cx="70" cy="70" r="68" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2.5"/><circle cx="70" cy="70" r="58" fill="#fffdf8"/>${t}<path d="M70 70 L70 30" stroke="#231a1f" stroke-width="5" stroke-linecap="round"/><circle cx="70" cy="70" r="6" fill="#231a1f"/><rect x="58" y="-2" width="24" height="10" rx="4" fill="#cdb78f"/></svg>`;
}

/* ================================================================== #28 */
function p28() {
  const n = 28;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f6efe3", size: 70, sub: i.sub });

  const ground = desk({ top: SCENE_TOP, height: SCENE_H, base: "#dcc39c", dark: "#cdb085", planks: 4, seed: 5 });

  // The laptop from above, cropped by the right edge: a screen with four stacked tabs, all labels blank.
  const tabs = [0, 1, 2, 3].map((k) => `<div style="position:absolute;left:${16 + k * 34}px;top:${14}px;width:142px;height:38px;border-radius:12px 12px 0 0;background:${k === 3 ? "#fffefb" : "#e3e0da"};box-shadow:${k === 3 ? "none" : "-3px 0 3px rgba(0,0,0,.12)"};z-index:${k + 1}"><div style="position:absolute;left:14px;top:12px;width:14px;height:14px;border-radius:50%;background:#bdb7ac"></div><div style="position:absolute;left:38px;top:16px;width:60px;height:7px;border-radius:4px;background:#cfc9be"></div></div>`).join("");
  const laptop = `
  <div style="${abs(548, 408, 520, 330, "transform:rotate(4deg);border-radius:20px;background:#2b2a30;box-shadow:0 3px 4px rgba(20,10,5,.4),0 26px 36px rgba(30,15,5,.4)")}">
    <div style="position:absolute;left:14px;top:14px;right:14px;bottom:14px;border-radius:8px;background:#f7f5f0;overflow:hidden">
      <div style="position:absolute;left:0;right:0;top:0;height:54px;background:#cfcac0"></div>${tabs}
      <div style="position:absolute;left:0;right:0;top:54px;height:44px;background:#fffefb;box-shadow:0 1px 0 #ddd8ce"><div style="position:absolute;left:18px;top:11px;width:300px;height:22px;border-radius:11px;background:#ece8df"></div></div>
      <div style="position:absolute;left:30px;top:130px;width:180px;height:120px;border-radius:8px;background:#ebe6dc"></div><div style="position:absolute;left:230px;top:130px;width:230px;height:16px;border-radius:8px;background:#e1dcd1"></div><div style="position:absolute;left:230px;top:160px;width:190px;height:16px;border-radius:8px;background:#e1dcd1"></div>
    </div></div>
  <div style="${abs(528, 742, 560, 190, "transform:rotate(4deg);border-radius:12px 12px 22px 22px;background:linear-gradient(#cfd2d6,#b9bdc3);box-shadow:0 3px 3px rgba(20,10,5,.35),0 20px 26px rgba(30,15,5,.35)")}">
    <div style="position:absolute;left:24px;right:24px;top:20px;bottom:64px;background-image:repeating-linear-gradient(90deg,#8e9299 0 2px,transparent 2px 46px),repeating-linear-gradient(0deg,#8e9299 0 2px,transparent 2px 38px);opacity:.35"></div>
    <div style="position:absolute;left:180px;right:180px;bottom:12px;height:36px;border-radius:8px;background:#aaaeb5"></div></div>`;

  // The damp ring and a folded dishcloth: the table was being wiped.
  const ring = `<svg style="${abs(716, 930, 300, 300, "z-index:1")}" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="104" fill="none" stroke="#7a5630" stroke-opacity=".2" stroke-width="16"/><circle cx="150" cy="150" r="92" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="5"/></svg>`;
  const cloth = `<div style="${abs(540, 1030, 280, 190, "transform:rotate(9deg);z-index:2;border-radius:14px;background:repeating-linear-gradient(90deg,#c9d2c0 0 26px,#b4c0a9 26px 30px,#c9d2c0 30px 56px),#c9d2c0;box-shadow:0 2px 3px rgba(30,15,5,.3),0 16px 18px rgba(30,15,5,.3)")}"><div style="position:absolute;inset:0;border-radius:14px;background:repeating-linear-gradient(0deg,transparent 0 24px,rgba(80,100,70,.22) 24px 28px);box-shadow:inset 0 0 0 3px rgba(255,255,255,.2)"></div><div style="position:absolute;left:10px;right:10px;top:78px;height:3px;background:rgba(60,80,50,.25)"></div></div>`;

  // Cluttered edges: loose paper at the left edge, a mug, a pen, paperclips.
  const edges = `
  <div style="${abs(-40, 880, 190, 150, "transform:rotate(-8deg);background:#fbf8f0;box-shadow:0 3px 3px rgba(30,15,5,.3),0 12px 14px rgba(30,15,5,.3)")}"></div>
  <div style="${abs(-30, 860, 190, 150, "transform:rotate(4deg);background:#f4efe4;box-shadow:0 3px 3px rgba(30,15,5,.3),0 12px 14px rgba(30,15,5,.3)")}"></div>
  <svg style="${abs(780, 1130, 220, 200, "filter:drop-shadow(0 14px 10px rgba(30,15,5,.4))")}" viewBox="0 0 220 200" aria-hidden="true"><path d="M168 74 C 214 70 214 138 166 140" fill="none" stroke="#e9e1d3" stroke-width="20" stroke-linecap="round"/><circle cx="96" cy="104" r="86" fill="#f3ede2"/><circle cx="96" cy="104" r="86" fill="none" stroke="#000" stroke-opacity=".1" stroke-width="3"/><circle cx="96" cy="104" r="70" fill="#d8d0c2"/><circle cx="96" cy="106" r="63" fill="#7a5233"/><ellipse cx="78" cy="86" rx="24" ry="14" fill="#fff" opacity=".14"/></svg>
  ${pen({ x: 60, y: 1050, len: 330, rot: -4, z: 2 })}`;

  const env = envelope({ x: 108, y: 712, w: 470, h: 310, rot: -7, kind: "kraft", face: "back", z: 3, seed: 4 });
  const circle = loop({ cx: 345, cy: 868, rx: 322, ry: 212, rot: -5, seed: 5 });

  const card = `<div style="${abs(50, 1112, 668, 196, "transform:rotate(-1deg);background:#fffaf0;border-radius:5px;box-shadow:0 2px 3px rgba(30,15,5,.3),0 18px 24px rgba(30,15,5,.38);z-index:6;padding:26px 34px;background-image:repeating-linear-gradient(transparent 0 46px,#e5d8c4 46px 48px);background-position:0 18px")}" data-check="caption">
    <div class="hand" style="font:600 46px/48px 'Hand',cursive;color:#231a1f;text-wrap:balance">${esc(i.items[0])}</div></div>`;

  const body = `${ground}${edges}${laptop}${ring}${cloth}${env}${circle}${card}${fh}`;
  return { n, id: `${n}-what-task-paralysis-feels-like`, html: page(p, { body, css: fc, paper: "#f6efe3" }) };
}

/* ================================================================== #42 */
function p42() {
  const n = 42;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1e5d3", size: 76, textTop: 92, eyebrow: C.mulberryDeep });

  // A slice of tile floor, a door mat on it.
  const floor = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(135deg,#e9dcc6,#d8c8ac);background-image:repeating-linear-gradient(0deg,transparent 0 238px,rgba(110,80,45,.28) 238px 242px),repeating-linear-gradient(90deg,transparent 0 238px,rgba(110,80,45,.28) 238px 242px)")}"></div>`;
  const doormat = mat({ x: -50, y: 410, w: 1100, h: 960 });

  // The pile: many envelopes, cropped by the pin edges, behind the sticky note.
  const r = rng(9);
  const kinds = ["kraft", "cream", "white", "blush", "kraft", "manila", "sage", "kraft"];
  let pile = "";
  for (let k = 0; k < 30; k++) {
    const w = 330 + Math.floor(r() * 110);
    pile += envelope({ x: -60 + r() * 880, y: 430 + r() * 640, w, rot: (r() - 0.5) * 56, kind: kinds[k % kinds.length], face: r() > 0.28 ? "front" : "back", win: r() > 0.7, z: 2 + (k % 3), seed: k + 2 });
  }
  const bundleX = 730, bundleY = 880;
  const bundle = [0, 1, 2, 3].map((k) => envelope({ x: bundleX + k * 6, y: bundleY + k * 14, w: 300, rot: 8, kind: ["cream", "kraft", "white", "blush"][k], z: 11 + k, seed: 40 + k })).join("") + band({ cx: bundleX + 150 + 28, cy: bundleY + 125, w: 38, h: 270, rot: 8, z: 16 });

  // The top five: a neat staggered stack, the top one whole, the others peeking below it.
  const topKinds = ["kraft", "white", "manila", "cream", "white"];
  let five = "";
  for (let k = 0; k < 5; k++) {
    five += envelope({ x: 140 + (k % 2 ? 14 : -6) + k * 6, y: 1062 - k * 44, w: 410, h: 268, rot: (k - 2) * 1.8, kind: topKinds[k], win: k === 4 || k === 1, z: 20 + k, seed: 60 + k });
  }
  const ring = loop({ cx: 350, cy: 1105, rx: 318, ry: 252, rot: -3, seed: 8, z: 40 });

  const note = sticky({
    x: 150, y: 428, w: 600, h: 440, rot: -3, z: 30,
    body: `<div class="hand" style="position:absolute;left:40px;right:40px;top:40px;bottom:30px;display:grid;align-items:center;font:700 92px/0.98 'Hand',cursive;color:#3a2230" data-check="note">${esc(i.items[0])}</div>`,
  });
  const tape = `<div style="${abs(390, 410, 150, 46, "transform:rotate(-3deg);background:rgba(220,208,190,.75);box-shadow:0 2px 4px rgba(0,0,0,.2);z-index:31")}"></div>`;
  const blade = opener({ x: 640, y: 1238, len: 380, rot: -9, z: 42 });

  const body = `${floor}${doormat}${pile}${bundle}${five}${ring}${note}${tape}${blade}${fh}`;
  return { n, id: `${n}-sort-the-mail-pile`, html: page(p, { body, css: fc, paper: "#f1e5d3" }) };
}

/* ================================================================== #45 */
function p45() {
  const n = 45;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#2a2025", ink: "#fbf1ea", eyebrow: "#e2bccb", muted: "#e7d6cf", size: 72, sub: i.sub, dark: true, shadow: "rgba(0,0,0,.5)" });

  // A walnut table in lamplight: the middle is warm and bright, the edges fall away into dark.
  const table = desk({ top: SCENE_TOP, height: SCENE_H, base: "#5a4033", dark: "#4a3329", planks: 5, seed: 11 });
  const light = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "z-index:10;pointer-events:none;background:radial-gradient(ellipse 62% 52% at 52% 50%,rgba(255,214,150,.42),rgba(255,200,130,.14) 55%,rgba(20,8,10,.0) 75%),radial-gradient(ellipse 85% 80% at 50% 50%,transparent 45%,rgba(14,6,10,.66) 100%)")}"></div>`;

  // The envelope is under the bowl and slides out toward the lower left.
  const env = envelope({ x: 130, y: 740, w: 520, h: 343, rot: -24, kind: "kraft", face: "front", z: 3, seed: 21 });

  // The fruit bowl from above.
  const bowlId = gid("b");
  const fruit = (cx, cy, rr, c1, c2, stem = true, leaf = null) => `<g><circle cx="${cx}" cy="${cy + 6}" r="${rr}" fill="#000" opacity=".28"/><circle cx="${cx}" cy="${cy}" r="${rr}" fill="url(#${bowlId}${c1.slice(1)})"/><ellipse cx="${cx - rr * 0.32}" cy="${cy - rr * 0.38}" rx="${rr * 0.3}" ry="${rr * 0.18}" fill="#fff" opacity=".35" transform="rotate(-30 ${cx - rr * 0.32} ${cy - rr * 0.38})"/>${stem ? `<circle cx="${cx}" cy="${cy}" r="${rr * 0.09}" fill="#3b2410" opacity=".7"/>` : ""}${leaf ? `<path d="M${cx} ${cy} q${rr * 0.5} ${-rr * 0.7} ${rr * 0.9} ${-rr * 0.3} q${-rr * 0.4} ${rr * 0.5} ${-rr * 0.9} ${rr * 0.3}z" fill="${leaf}"/>` : ""}</g>`;
  const grads = [["#d9822a", "#f0b25a"], ["#b84a3a", "#df7d62"], ["#98a844", "#cfd77a"], ["#e5c13c", "#f6e08a"]].map(([a, b]) => `<radialGradient id="${bowlId}${a.slice(1)}" cx="38%" cy="34%" r="75%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient>`).join("");
  const bowl = `<svg style="${abs(300, 440, 540, 540, "z-index:4;filter:drop-shadow(0 4px 4px rgba(10,4,6,.5)) drop-shadow(0 30px 34px rgba(10,4,6,.5))")}" viewBox="0 0 540 540" aria-hidden="true">
  <defs>${grads}<radialGradient id="${bowlId}rim" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#f6ecdc"/><stop offset="1" stop-color="#d3c3a6"/></radialGradient><radialGradient id="${bowlId}in" cx="50%" cy="60%" r="60%"><stop offset="0" stop-color="#d9caad"/><stop offset="1" stop-color="#efe3cc"/></radialGradient></defs>
  <circle cx="270" cy="270" r="262" fill="url(#${bowlId}rim)"/><circle cx="270" cy="270" r="262" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/>
  <circle cx="270" cy="270" r="226" fill="url(#${bowlId}in)"/><circle cx="270" cy="270" r="226" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="3"/>
  ${fruit(200, 214, 86, "#d9822a", "", true, "#6f8a3a")}${fruit(340, 200, 80, "#b84a3a", "", true, "#6f8a3a")}${fruit(300, 330, 90, "#98a844", "", true)}${fruit(180, 336, 74, "#e5c13c", "", true)}${fruit(392, 322, 64, "#d9822a", "", true)}</svg>`;

  // A phone face down, and the lamp's own base at the corner.
  const phoneDown = `<div style="${abs(740, 1010, 220, 440, "transform:rotate(14deg);z-index:5;border-radius:36px;background:linear-gradient(145deg,#38343d,#1c1a20);box-shadow:inset 0 0 0 3px rgba(255,255,255,.08),0 4px 5px rgba(0,0,0,.5),0 26px 34px rgba(0,0,0,.55)")}"><div style="position:absolute;left:16px;top:16px;width:84px;height:84px;border-radius:24px;background:#121016;box-shadow:inset 0 0 0 3px rgba(255,255,255,.09)"></div><div style="position:absolute;left:30px;top:30px;width:26px;height:26px;border-radius:50%;background:#2b3140;box-shadow:inset 0 0 0 3px #4a505e"></div><div style="position:absolute;left:62px;top:56px;width:26px;height:26px;border-radius:50%;background:#2b3140;box-shadow:inset 0 0 0 3px #4a505e"></div></div>`;
  const lamp = `<svg style="${abs(780, 380, 300, 300, "z-index:11;filter:drop-shadow(0 20px 20px rgba(0,0,0,.45))")}" viewBox="0 0 300 300" aria-hidden="true"><defs><radialGradient id="${bowlId}lamp" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3d2"/><stop offset=".5" stop-color="#f5d99a"/><stop offset="1" stop-color="#c79a4c"/></radialGradient></defs><circle cx="150" cy="150" r="130" fill="url(#${bowlId}lamp)"/><circle cx="150" cy="150" r="130" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4"/><circle cx="150" cy="150" r="52" fill="#fffbe9" opacity=".8"/></svg>`;

  const note = sticky({
    x: 52, y: 428, w: 400, h: 240, rot: -3, z: 12,
    body: `<div class="hand" style="position:absolute;left:30px;right:26px;top:24px;font:700 62px/1.2 'Hand',cursive;color:#3a2230" data-check="note">${esc(i.items[0])}</div>`,
  });
  const tag = `<div style="${abs(66, 696, 160, 44, "z-index:12")}"><span class="example">Example</span></div>`;

  const body = `${table}${env}${bowl}${phoneDown}${light}${lamp}${note}${tag}${fh}`;
  return { n, id: `${n}-afraid-to-open-the-mail`, html: page(p, { body, css: fc, paper: "#2a2025", ink: "#fbf1ea", muted: "#d9c8c1" }) };
}

/* ================================================================== #57 */
function p57() {
  const n = 57;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f3ead9", size: 76, textTop: 92, eyebrow: C.mulberryDeep });

  // Pale ash floor planks.
  const floor = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(135deg,#ecdcc0,#dcc7a3);background-image:repeating-linear-gradient(0deg,transparent 0 118px,rgba(110,80,45,.22) 118px 121px),linear-gradient(135deg,#ecdcc0,#dcc7a3)")}"></div>`;

  // The tote on its side at the top left, spilling mail to the right.
  const tote = `<div style="${abs(-70, 470, 340, 270, "transform:rotate(12deg);z-index:6;background:linear-gradient(135deg,#f1e9d8,#ddd1b8);border-radius:10px 10px 22px 22px;box-shadow:0 3px 4px rgba(40,22,8,.35),0 24px 28px rgba(40,22,8,.35)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:22px;background:rgba(0,0,0,.09);border-radius:10px 10px 0 0"></div>
    <div style="position:absolute;left:0;right:0;top:120px;height:34px;background:#c9b48f;opacity:.55"></div>
    <div style="position:absolute;left:50px;right:50px;top:-70px;height:100px;border:15px solid #b88a62;border-bottom:none;border-radius:90px 90px 0 0"></div></div>`;
  const spill = [
    envelope({ x: 70, y: 392, w: 300, rot: -16, kind: "kraft", z: 5, seed: 75 }),
    envelope({ x: 236, y: 420, w: 330, rot: -5, kind: "white", label: "Bank statement", labelSize: 28, z: 7, seed: 71, stamp: false }),
    envelope({ x: 566, y: 410, w: 340, rot: 5, kind: "cream", label: "Electric bill", labelSize: 30, z: 8, seed: 72, stamp: false }),
    envelope({ x: 250, y: 600, w: 340, rot: 4, kind: "blush", label: "Medical bill, unclear", labelSize: 26, z: 9, seed: 73, stamp: false }),
    // The charity flyer is a folded leaflet, not an envelope.
    `<div style="${abs(640, 596, 290, 170, "transform:rotate(-5deg);z-index:10;background:linear-gradient(160deg,#f7e3c6,#ecc89a);border-radius:4px;box-shadow:0 2px 3px rgba(40,22,8,.32),0 14px 16px rgba(40,22,8,.28);display:flex;align-items:center;justify-content:center;font:600 30px/1.1 'Plex',sans-serif;color:#2c2320;text-align:center;padding:10px")}" data-check="flyer">Charity flyer</div>`,
    envelope({ x: 850, y: 470, w: 280, rot: 20, kind: "kraft", z: 6, seed: 74 }),
    envelope({ x: 860, y: 640, w: 260, rot: -18, kind: "manila", face: "back", z: 5, seed: 76 }),
  ].join("");
  const tag = `<div style="${abs(780, 778, 160, 44, "z-index:12")}"><span class="example">Example</span></div>`;

  // The arrow down, with the sub beside it on a note so it reads.
  const arrow = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;z-index:12;filter:drop-shadow(0 4px 4px rgba(40,22,8,.28))" viewBox="0 0 1000 1500" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M130 760 C 118 782, 126 800, 132 822" stroke="#fffaf2" stroke-width="22"/><path d="M100 796 L132 830 L164 796" stroke="#fffaf2" stroke-width="22"/><path d="M130 760 C 118 782, 126 800, 132 822" stroke="#231a1f" stroke-width="9"/><path d="M100 796 L132 830 L164 796" stroke="#231a1f" stroke-width="9"/></g></svg>`;
  const subText = `<div style="${abs(216, 768, 540, 72, "z-index:12;background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(40,22,8,.3),0 10px 14px rgba(40,22,8,.22);padding:10px 20px;display:flex;align-items:center")}" data-check="sub"><div style="font:600 24px/1.22 'Plex',sans-serif;color:#4a2a38">${esc(i.sub)}</div></div>`;

  // Four trays, two by two; the Act tray is the one ringed in mulberry.
  const T = [
    { x: 36, y: 874, label: "Act", text: "a person is waiting on you, or a date is printed on it.", seed: 81 },
    { x: 514, y: 874, label: "Keep", text: "a reference or record you'll need again, like a claim letter or statement.", seed: 82 },
    { x: 36, y: 1110, label: "Ask someone", text: "you can't tell what it is or what it wants.", seed: 83 },
    { x: 514, y: 1110, label: "Bin or shred", text: "junk, or anything with an account number on it that you're sure is finished.", seed: 84 },
  ];
  // The bank item is "Act: a person is ..." so the label is the part before the colon and the line is what follows it, verbatim.
  const trays = T.map((t, k) => {
    const w = 450, h = 220;
    return `${tray({ x: t.x, y: t.y, w, h, z: 3 })}
    ${envelope({ x: t.x + 30, y: t.y + 24, w: 330, rot: -3 + k, kind: ["kraft", "white", "cream", "manila"][k], z: 4, seed: 90 + k, stamp: false })}
    <div style="${abs(t.x + 28, t.y + 26, w - 56, h - 52, `z-index:5;transform:rotate(${k % 2 ? 0.8 : -0.8}deg);background:#fffaf0;border-radius:6px;box-shadow:0 2px 3px rgba(40,22,8,.3),0 8px 12px rgba(40,22,8,.2);padding:14px 20px`)}" data-check="tray">
      <div style="font:600 44px/1 'Newsreader',serif;color:#231a1f">${esc(t.label)}</div>
      <div style="font:500 24px/1.28 'Plex',sans-serif;color:#4b4339;margin-top:8px">${esc(t.text)}</div></div>`;
  }).join("");
  const actRing = loop({ cx: 36 + 225, cy: 874 + 120, rx: 262, ry: 122, rot: -1, seed: 6, z: 14, sw: 10 });

  const body = `${floor}${tote}${spill}${tag}${arrow}${subText}${trays}${actRing}${fh}`;
  return { n, id: `${n}-how-to-organize-a-bag-of-unopened-mail`, html: page(p, { body, css: fc, paper: "#f3ead9" }) };
}

/* ================================================================== #59 */
function folder({ x, y, w, h, rot = 0, color = "#e3c88c", tab = 0.15, z = 3 }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 2px 2px rgba(40,22,8,.32)) drop-shadow(0 8px 8px rgba(40,22,8,.2))`)}">
    <div style="position:absolute;left:${w * 0.58}px;top:-22px;width:${w * 0.28}px;height:30px;border-radius:7px 7px 0 0;background:${color};filter:brightness(.94)"></div>
    <div style="position:absolute;inset:0;border-radius:6px;background:linear-gradient(170deg,${color},${color});box-shadow:inset 0 0 0 2px rgba(0,0,0,.12)"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:14px;background:rgba(255,255,255,.22);border-radius:6px 6px 0 0"></div></div>`;
}

function p59() {
  const n = 59;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#efe7d9", size: 64, sub: i.sub, textTop: 72, eyebrow: C.mulberryDeep, splitOn: "? " });

  // Calm and light: a cream wall, a strip of window light, a pale oak floor.
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, 700, "background:linear-gradient(180deg,#f3ece0,#e9dfcf)")}"></div>
  <div style="${abs(600, SCENE_TOP, 520, 700, "background:linear-gradient(100deg,rgba(255,250,235,.8),rgba(255,250,235,0) 70%);transform:skewX(-14deg);transform-origin:top")}"></div>
  <div style="${abs(0, 1030, 1000, 24, "background:#f7f1e6;box-shadow:0 -2px 0 #d7c9b0 inset,0 6px 10px rgba(60,40,15,.15)")}"></div>
  <div style="${abs(0, 1054, 1000, 446, "background:linear-gradient(180deg,#d9bf94,#c9ab7c);background-image:repeating-linear-gradient(90deg,transparent 0 158px,rgba(110,80,45,.25) 158px 161px),linear-gradient(180deg,#d9bf94,#c9ab7c)")}"></div>`;

  // The chair, front on: back posts, rails, a seat and legs. The stack hides most of it.
  const CX = 330;
  const wood = "#9d6e41", woodDark = "#7d5430";
  const chair = `
  <div style="${abs(CX - 320, 1196, 640, 70, "background:radial-gradient(ellipse at 50% 50%,rgba(60,35,10,.42),rgba(60,35,10,0) 70%);z-index:1")}"></div>
  <div style="${abs(CX - 250, 520, 30, 520, `z-index:2;background:linear-gradient(90deg,${woodDark},${wood});border-radius:6px`)}"></div>
  <div style="${abs(CX + 220, 520, 30, 520, `z-index:2;background:linear-gradient(90deg,${wood},${woodDark});border-radius:6px`)}"></div>
  <div style="${abs(CX - 256, 500, 512, 54, `z-index:2;background:linear-gradient(${wood},${woodDark});border-radius:10px;box-shadow:0 4px 5px rgba(40,22,8,.3)`)}"></div>
  <div style="${abs(CX - 250, 640, 500, 28, `z-index:2;background:${woodDark};border-radius:6px`)}"></div>
  <div style="${abs(CX - 250, 740, 500, 28, `z-index:2;background:${woodDark};border-radius:6px`)}"></div>
  <div style="${abs(CX - 262, 1040, 36, 190, `z-index:4;background:linear-gradient(90deg,${woodDark},${wood});border-radius:5px 5px 8px 8px;box-shadow:6px 6px 8px rgba(40,22,8,.25)`)}"></div>
  <div style="${abs(CX + 226, 1040, 36, 190, `z-index:4;background:linear-gradient(90deg,${wood},${woodDark});border-radius:5px 5px 8px 8px;box-shadow:6px 6px 8px rgba(40,22,8,.25)`)}"></div>
  <div style="${abs(CX - 290, 1000, 580, 52, `z-index:5;background:linear-gradient(${"#b98652"},${wood});border-radius:10px;box-shadow:0 3px 3px rgba(40,22,8,.35),0 14px 14px rgba(40,22,8,.28)`)}"></div>
  <div style="${abs(CX - 290, 1000, 580, 10, "z-index:6;background:rgba(255,235,200,.4);border-radius:10px 10px 0 0")}"></div>`;

  // The leaning stack: a jumper at the bottom, folders, mail. All tipped a little.
  const stack = `<div style="${abs(0, 0, 1000, 1500, "z-index:7;transform-origin:330px 1000px;transform:rotate(3deg)")}">
    <div style="${abs(CX - 270, 930, 560, 80, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.14) 0 6px,transparent 6px 12px),linear-gradient(#cdb0bf,#b9959f);border-radius:40px 60px 14px 14px;box-shadow:0 4px 6px rgba(40,22,8,.3)")}"></div>
    <div style="${abs(CX + 210, 960, 120, 150, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.16) 0 6px,transparent 6px 12px),linear-gradient(90deg,#c1a0ae,#b08f9c);border-radius:20px 20px 44px 44px;transform:rotate(-8deg);box-shadow:0 6px 8px rgba(40,22,8,.3)")}"></div>
    ${folder({ x: CX - 230, y: 840, w: 460, h: 100, rot: -2, color: "#e3c88c", z: 8 })}
    ${envelope({ x: CX - 150, y: 770, w: 330, rot: 6, kind: "kraft", z: 9, seed: 31, stamp: false })}
    ${folder({ x: CX - 200, y: 720, w: 430, h: 90, rot: 2, color: "#d8b873", z: 10 })}
    ${envelope({ x: CX - 130, y: 650, w: 320, rot: -5, kind: "white", win: true, z: 11, seed: 32 })}
    ${folder({ x: CX - 180, y: 590, w: 400, h: 90, rot: 3, color: "#e8d19a", z: 12 })}
    ${envelope({ x: CX - 60, y: 540, w: 300, rot: 7, kind: "cream", z: 13, seed: 33 })}
  </div>`;

  const note = sticky({
    x: CX - 150, y: 640, w: 330, h: 290, rot: -4, z: 30,
    body: `<div style="position:absolute;left:26px;right:24px;top:26px;bottom:20px;display:flex;flex-direction:column;justify-content:center"><div class="hand" style="font:700 86px/0.95 'Hand',cursive;color:#3a2230;letter-spacing:.02em">D.O.O.M.</div><div class="hand" style="font:600 46px/1.1 'Hand',cursive;color:#3a2230;margin-top:10px;padding-bottom:6px" data-check="note">${esc(i.items[0])}</div></div>`,
  });

  const card = (y, text, rot, w = 330) => `<div style="${abs(646, y, w, 240, `z-index:8;transform:rotate(${rot}deg);background:#fffaf0;border-radius:5px;box-shadow:0 2px 3px rgba(40,22,8,.3),0 16px 22px rgba(40,22,8,.3);padding:26px 26px;background-image:repeating-linear-gradient(transparent 0 46px,#e5d8c4 46px 48px);background-position:0 20px`)}" data-check="card"><div class="hand" style="font:600 41px/48px 'Hand',cursive;color:#231a1f">${esc(text)}</div></div>`;
  const a1 = card(440, i.items[1], 1.6);
  const a2 = card(730, i.items[2], -1.2);

  const body = `${wall}${chair}${stack}${note}${a1}${a2}${fh}`;
  return { n, id: `${n}-what-is-a-doom-pile`, html: page(p, { body, css: fc, paper: "#efe7d9" }) };
}

/* ================================================================== #61 */
function p61() {
  const n = 61;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f7f1f3", size: 66, sub: i.sub, textTop: 64, eyebrow: C.mulberry, muted: "#5a4a52" });

  const ground = `<div style="${abs(0, SCENE_TOP, 1000, SCENE_H, "background:linear-gradient(180deg,#f8f2f4,#f3eaee)")}"></div>`;

  const X = 124;
  const ys = [488, 676, 864, 1052, 1236];
  const line = `<div style="${abs(X - 4, ys[0], 8, ys[4] - ys[0], `background:${C.mulberry};border-radius:4px;z-index:2`)}"></div>`;
  const labels = i.items;
  const stops = ys.map((y, k) => {
    const last = k === 4;
    const dot = `<div style="${abs(X - 42, y - 42, 84, 84, `z-index:3;border-radius:50%;background:${last ? C.mulberry : "#fffdf8"};border:5px solid ${last ? C.mulberry : "#231a1f"};display:grid;place-items:center;box-shadow:0 6px 10px rgba(40,22,8,.22)`)}">${last
      ? `<svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><path d="M10 25 L20 35 L39 12" fill="none" stroke="#fffaf2" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      : `<span style="font:600 40px/1 'Newsreader',serif;color:#231a1f">${k + 1}</span>`}</div>`;
    const text = `<div style="${abs(212, y - 64, 380, 128, "z-index:3;display:flex;align-items:center")}" data-check="step"><div style="font:600 41px/1.12 'Newsreader',Georgia,serif;color:#231a1f;text-wrap:balance">${esc(labels[k])}</div></div>`;
    return dot + text;
  }).join("");

  // Stop 1: an open bin and a clock. Stop 2: an envelope slit open. Stop 3: a blank page and a pen.
  // Stop 4: three envelopes held by a band, one pulled out. Stop 5: the timer.
  const s1 = bin({ x: 636, y: ys[0] - 72, s: 144, seed: 3 }) + clock({ x: 812, y: ys[0] - 66, s: 124 });
  const s2 = envelope({ x: 650, y: ys[1] - 62, w: 250, rot: 2, kind: "kraft", z: 4, seed: 51 }) + `<div style="${abs(656, ys[1] - 62, 238, 14, "z-index:5;transform:rotate(2deg);background:rgba(250,246,238,.92);box-shadow:inset 0 2px 3px rgba(0,0,0,.25)")}"></div>` + opener({ x: 700, y: ys[1] - 86, len: 270, rot: 8, z: 6 });
  const s3 = `<div style="${abs(660, ys[2] - 80, 200, 156, "z-index:4;transform:rotate(-4deg);background:#fffdf8;border-radius:4px;box-shadow:0 2px 3px rgba(40,22,8,.3),0 14px 16px rgba(40,22,8,.25);background-image:repeating-linear-gradient(transparent 0 31px,#d8cdbd 31px 33px);background-position:0 18px")}"></div>` + pen({ x: 740, y: ys[2] - 6, len: 230, rot: -20, body: "#3a2f36", z: 5 });
  const s4 = envelope({ x: 640, y: ys[3] - 64, w: 230, rot: -3, kind: "white", z: 4, seed: 52 }) + envelope({ x: 646, y: ys[3] - 76, w: 230, rot: 2, kind: "cream", z: 5, seed: 53, win: true }) + band({ cx: 760, cy: ys[3] + 6, w: 34, h: 150, rot: 2, z: 7 }) + envelope({ x: 744, y: ys[3] - 108, w: 230, rot: 9, kind: "blush", z: 6, seed: 54 });
  const s5 = timer({ x: 706, y: ys[4] - 66, s: 140, z: 4 });

  const body = `${ground}${line}${s1}${s2}${s3}${s4}${s5}${stops}${fh}`;
  return { n, id: `${n}-paperwork-pile-where-to-start`, html: page(p, { body, css: fc, paper: "#f7f1f3" }) };
}

export const pins = [p28(), p42(), p45(), p57(), p59(), p61()];
