/**
 * ADHD Life Companion pins, group E: phone, card and trays (guide-style, whole-page designs).
 * #27 script-card    an index card with the real suggested opening line, clipped to a ringing phone, on plum felt
 * #31 comparison     a crammed, scribbled to-do pad against the real Now card, on an oak desk
 * #35 infographic    four kraft life trays with their real one-line descriptions, on blush linen
 *
 * Real screens are used as captured (cropped, never redrawn). Props are flat vector.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { asset } from "../kit/assets.mjs";
import { phone } from "../kit/phone.mjs";
import { desk, binderClip } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rngOf = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

/** The whole-page frame: a paper header with the bank's headline, the scene, a paper footer with the product line. */
function frame({ n, scene, paper, headH, size, sub = true, extraCss = "" }) {
  const i = idea(n);
  const [eyebrow, rest] = i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${headH}px;background:${paper};box-shadow:0 8px 22px rgba(30,15,25,.3);z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(30,15,25,.3);z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:62px;z-index:6}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:14px;color:${C.ink}}
  .top p{font-size:28px;line-height:1.35;margin-top:14px;color:#4f4047;max-width:820px}
  ${extraCss}`;
  const body = `
  ${scene}
  <div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${headH - 6}">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(rest)}</h1>${sub && i.sub ? `<p>${esc(i.sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper }) };
}

/** A butter sticky note. Text is optional, handwritten. */
const sticky = ({ x, y, w = 190, h = 190, rot = 4, text = "", size = 40, color = "#f4dc8e" }) =>
  `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${color},#ecc96b);box-shadow:0 2px 3px rgba(40,20,5,.25),0 14px 18px rgba(40,20,5,.35);display:grid;place-items:center;text-align:center;padding:14px`)}"><span style="font:600 ${size}px/1.02 'Hand',cursive;color:#5f3d4b">${text}</span></div>`;

/** A ballpoint pen lying at an angle. */
const pen = ({ x, y, len = 400, rot = 0, body = "#5f3d4b", trim = "#d6b36a" }) =>
  `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;

/** A kraft envelope seen from above. */
const envelope = ({ x, y, w = 200, rot = 0, c1 = "#e9dcc3", c2 = "#d9c8a6", flapDown = true }) => {
  const h = w * 0.66;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 7px rgba(40,20,5,.35))`)}" viewBox="0 0 260 172" aria-hidden="true">
    <rect width="260" height="172" rx="6" fill="${c1}"/><path d="M0 172 L104 84 M260 172 L156 84" stroke="#000" stroke-opacity=".1" stroke-width="2"/>
    ${flapDown ? `<path d="M0 0 L130 98 L260 0 Z" fill="${c2}"/><path d="M0 0 L130 98 L260 0" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>` : ""}</svg>`;
};

/** A cream index card, blank, ruled. */
const blankCard = ({ x, y, w = 190, rot = 0 }) => {
  const h = Math.round(w * 0.62);
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fbf4e6;border-radius:5px;box-shadow:0 2px 3px rgba(40,20,5,.25),0 14px 18px rgba(20,10,5,.38);overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:${h * 0.26}px;height:3px;background:#d9818e;opacity:.6"></div>
    ${[0.46, 0.64, 0.82].map((f) => `<div style="position:absolute;left:0;right:0;top:${h * f}px;height:2px;background:#9db6cc;opacity:.6"></div>`).join("")}</div>`;
};

/** An open manila folder, blank, seen from above. */
const folder = ({ x, y, w = 200, rot = 0 }) => {
  const h = w * 0.78;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 8px rgba(40,20,5,.38))`)}" viewBox="0 0 260 200" aria-hidden="true">
    <path d="M6 30 Q6 16 20 16 H92 L110 36 H240 Q254 36 254 50 V184 Q254 194 244 194 H16 Q6 194 6 184 Z" fill="#d7b878"/>
    <path d="M6 58 Q6 46 18 46 H242 Q254 46 254 58 V184 Q254 194 244 194 H16 Q6 194 6 184 Z" fill="#ecd29b"/>
    <path d="M6 58 Q6 46 18 46 H242 Q254 46 254 58 V70 H6Z" fill="#fff" opacity=".28"/>
    <rect x="34" y="96" width="150" height="7" rx="3.5" fill="#9b7d45" opacity=".35"/><rect x="34" y="122" width="190" height="7" rx="3.5" fill="#9b7d45" opacity=".3"/><rect x="34" y="148" width="120" height="7" rx="3.5" fill="#9b7d45" opacity=".26"/></svg>`;
};

/* ------------------------------------------------------------------ #27 */
/** The phone lying face up, ringing: a person icon in ripples, nothing written on it. */
function ringingPhone({ x, y, w = 520, h = 1000, tilt = -5 }) {
  const cx = w / 2;
  const rings = [96, 148, 200]
    .map((r, k) => `<circle cx="${cx}" cy="226" r="${r}" fill="none" stroke="#e8c9d6" stroke-opacity="${(0.5 - k * 0.14).toFixed(2)}" stroke-width="${4 - k}"/>`)
    .join("");
  const arcs = (side) =>
    [0, 1, 2]
      .map((k) => {
        const off = 22 + k * 24;
        const sx = side < 0 ? -off : w + off;
        const d = side < 0 ? `M${sx + 12} 250 q-16 50 0 100` : `M${sx - 12} 250 q16 50 0 100`;
        return `<path d="${d}" fill="none" stroke="#f1d9e2" stroke-opacity="${(0.85 - k * 0.22).toFixed(2)}" stroke-width="7" stroke-linecap="round" transform="translate(0 0)"/>`;
      })
      .join("");
  return `
  <div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);transform-origin:50% 30%;filter:drop-shadow(0 34px 40px rgba(0,0,0,.5)) drop-shadow(0 6px 8px rgba(0,0,0,.4))`)}">
    <svg style="position:absolute;left:-90px;top:30px;width:${w + 180}px;height:520px;overflow:visible" viewBox="-90 0 ${w + 180} 520" aria-hidden="true">${arcs(-1)}${arcs(1)}</svg>
    <div style="position:absolute;inset:0;background:#1b1820;border-radius:72px;box-shadow:inset 0 0 0 2px #3a3540,inset 0 0 0 5px #0e0c11"></div>
    <div style="position:absolute;inset:16px;border-radius:58px;overflow:hidden;background:linear-gradient(180deg,#7a4d61 0%,#5f3d4b 45%,#2f1e27 100%)">
      <div style="position:absolute;left:50%;top:14px;width:120px;height:32px;margin-left:-60px;border-radius:20px;background:#0b0a0d"></div>
      <svg style="position:absolute;left:0;top:0;width:${w - 32}px;height:620px" viewBox="16 0 ${w - 32} 620" aria-hidden="true">${rings}</svg>
      <div style="position:absolute;left:${cx - 16 - 74}px;top:${226 - 74}px;width:148px;height:148px;border-radius:50%;background:#f1e7eb;display:grid;place-items:center;box-shadow:0 10px 24px rgba(0,0,0,.35)">${icon("user", { size: 92, color: C.mulberry, weight: "fill" })}</div>
    </div>
  </div>`;
}

function p27() {
  const i = idea(27);
  const line = i.items[0];
  const caption = i.items[1];
  const headH = 346;
  const LH = 62;
  const scene = `
  <svg style="${abs(0, headH, 1000, 1500 - headH)}" viewBox="0 0 1000 ${1500 - headH}" aria-hidden="true"><defs>
    <filter id="felt" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .16  0 0 0 0 .08  0 0 0 0 .13  0 0 0 .5 0"/></filter>
    <radialGradient id="fl" cx="30%" cy="18%" r="95%"><stop offset="0" stop-color="#7a4f62"/><stop offset="1" stop-color="#2e1c26"/></radialGradient></defs>
    <rect width="1000" height="${1500 - headH}" fill="url(#fl)"/><rect width="1000" height="${1500 - headH}" filter="url(#felt)" opacity=".7"/></svg>
  ${ringingPhone({ x: 70, y: 396, w: 500, h: 1060, tilt: -4 })}
  <div style="${abs(268, 690, 690, 566, "transform:rotate(-2.2deg);background:#fbf4e6;border-radius:8px;box-shadow:0 2px 3px rgba(20,8,14,.35),0 22px 30px rgba(10,4,8,.55),0 50px 60px -10px rgba(10,4,8,.4);overflow:hidden")}">
    <div style="position:absolute;left:0;right:0;top:0;height:5px;background:#e9c8d3"></div>
    <div style="position:absolute;left:44px;top:6px;font:500 170px/1 'Newsreader',Georgia,serif;color:${C.mulberry}">&ldquo;</div>
    <div data-check="script" style="position:absolute;left:50px;right:50px;top:108px;font:500 47px/${LH}px 'Newsreader',Georgia,serif;color:${C.ink};background-image:repeating-linear-gradient(transparent 0 ${LH - 3}px,rgba(140,170,200,.5) ${LH - 3}px ${LH - 1}px,transparent ${LH - 1}px ${LH}px);background-position:0 7px;height:${LH * 5}px">${esc(line)}<span style="color:${C.mulberry};font-weight:600">&rdquo;</span></div>
    <div style="position:absolute;left:50px;right:40px;bottom:34px;font:500 29px/1.3 'Plex',sans-serif;color:#5f4a54;display:flex;gap:16px;align-items:center"><span style="flex:none;width:44px;height:5px;border-radius:3px;background:${C.mulberry}"></span><span data-check="caption">${esc(caption)}</span></div>
  </div>
  ${binderClip({ x: 462, y: 640, rot: 3, size: 130 })}
  ${phone({ src: asset("difficult-call-opening.png"), y0: 112, y1: 200, width: 400, tilt: -3, x: 574, y: 1236, appBg: "#f4f0f1", id: "corner" })}`;
  return frame({ n: 27, scene, paper: C.mulberrySoft, headH, size: 74, sub: false });
}

/* ------------------------------------------------------------------ #31 */
/** A pencil-scribbled line of "writing": unreadable loops and strokes with word gaps. */
function scribble(rnd, x0, y, width, color) {
  let d = `M${x0} ${y}`;
  let x = x0;
  while (x < x0 + width) {
    if (rnd() < 0.13) { x += 10 + rnd() * 10; d += ` M${x.toFixed(1)} ${(y + (rnd() - 0.5) * 3).toFixed(1)}`; continue; }
    const step = 5 + rnd() * 7;
    const up = rnd() < 0.55 ? -(6 + rnd() * 12) : 5 + rnd() * 4;
    d += ` q${(step / 2).toFixed(1)} ${up.toFixed(1)} ${step.toFixed(1)} ${((rnd() - 0.5) * 3).toFixed(1)}`;
    x += step;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>`;
}

function todoPad({ x, y, w, h, rot }) {
  const rnd = rngOf(11);
  const top = 70, gap = 41;
  const rows = [];
  const lines = [];
  for (let r = 0, yy = top; yy < h - 24; r++, yy += gap) {
    lines.push(`<line x1="0" y1="${yy + 8}" x2="${w}" y2="${yy + 8}" stroke="#a8bdd3" stroke-opacity=".7" stroke-width="2"/>`);
    const boxed = r % 3 !== 2;
    const indent = boxed ? 52 : 26 + (r % 2) * 18;
    if (boxed) rows.push(`<rect x="22" y="${yy - 15}" width="19" height="19" rx="3" fill="none" stroke="#4d4350" stroke-width="2.4" opacity=".75" transform="rotate(${(rnd() - 0.5) * 8} 31 ${yy - 5})"/>`);
    const len = (w - indent - 20) * (0.55 + rnd() * 0.45);
    rows.push(scribble(rnd, indent, yy + 1, len, r % 4 === 1 ? "#33507a" : "#3d3540"));
    if (r % 5 === 3) rows.push(`<path d="M${indent - 4} ${yy - 4} H${indent + len * 0.8}" stroke="#3d3540" stroke-width="2.6" opacity=".7"/>`);
  }
  return `
  <div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:#fdfaf3;border-radius:6px 6px 4px 4px;box-shadow:0 2px 3px rgba(40,20,5,.28),0 18px 30px rgba(40,20,5,.4),0 44px 60px -16px rgba(40,20,5,.4);overflow:hidden`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:46px;background:linear-gradient(#a79aa2,#8c7e87)"></div>
    <div style="position:absolute;left:0;right:0;top:46px;height:6px;background:rgba(0,0,0,.14)"></div>
    <svg style="position:absolute;left:0;top:0;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line x1="14" y1="52" x2="14" y2="${h}" stroke="#e29aa8" stroke-opacity=".8" stroke-width="2"/>${lines.join("")}${rows.join("")}</svg>
  </div>`;
}

/** A hand-drawn loop around a rectangle in the one-thing colour (a wobbly rounded outline that overshoots its start). */
const ring = ({ x, y, w, h, color = C.mulberry, sw = 9 }) => {
  const r = 52;
  const d = `M${w * 0.42} 3 C ${w * 0.6} -2, ${w * 0.82} 1, ${w - r} 4 Q ${w + 2} 8 ${w - 2} ${r + 6} C ${w + 4} ${h * 0.4}, ${w - 3} ${h * 0.7}, ${w - 2} ${h - r} Q ${w - 4} ${h - 2} ${w - r - 6} ${h - 3} C ${w * 0.7} ${h + 3}, ${w * 0.3} ${h - 2}, ${r + 4} ${h - 4} Q 3 ${h - 6} 2 ${h - r - 4} C -3 ${h * 0.7}, 4 ${h * 0.3}, 3 ${r + 6} Q 4 6 ${r + 10} 4 C ${w * 0.2} -1, ${w * 0.34} 6, ${w * 0.55} 12`;
  return `<svg style="${abs(x, y, w, h, "overflow:visible;filter:drop-shadow(0 3px 3px rgba(40,20,5,.25))")}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
};

function p31() {
  const i = idea(31);
  const [left, sorted, right] = i.items;
  const headH = 318;
  const padX = 34, padY = 392, padW = 372, padH = 776;
  const cardW = 458, cardH = Math.round((cardW * 534) / 714);
  const cardX = 486, cardY = 640;
  const k = cardW / 714;
  const scene = `
  ${desk({ top: headH, height: 1500 - headH, base: "#d8b184", dark: "#caa072", planks: 5, seed: 9 })}
  <div style="${abs(0, headH, 1000, 1500 - headH, "background:radial-gradient(ellipse 90% 70% at 70% 30%,rgba(255,244,225,.32),rgba(255,244,225,0) 70%)")}"></div>
  ${todoPad({ x: padX, y: padY, w: padW, h: padH, rot: -2.5 })}
  <svg style="${abs(padX - 10, padY - 10, padW + 20, padH + 20, "transform:rotate(-2.5deg);overflow:visible;filter:drop-shadow(0 3px 3px rgba(20,8,14,.3))")}" viewBox="0 0 ${padW + 20} ${padH + 20}" aria-hidden="true"><path d="M26 40 C 120 150, 250 330, ${padW - 10} ${padH - 30}" stroke="${C.ink}" stroke-opacity=".86" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M${padW - 6} 56 C 280 190, 130 410, 40 ${padH - 20}" stroke="${C.ink}" stroke-opacity=".86" stroke-width="15" stroke-linecap="round" fill="none"/></svg>
  ${sticky({ x: 232, y: 396, w: 200, h: 130, rot: 6, text: esc(sorted), size: 40 })}
  <div style="${abs(cardX - 34, cardY - 110, cardW + 68, cardH + 220, "background:#f3e8ec;border-radius:26px;transform:rotate(1deg);box-shadow:0 2px 3px rgba(40,20,5,.25),0 22px 36px rgba(40,20,5,.35)")}"></div>
  <div data-check="page" style="${abs(cardX, cardY, cardW, cardH, `border-radius:${Math.round(46 * k)}px;overflow:hidden;background:#fcfafa;box-shadow:0 2px 4px rgba(40,20,5,.2),0 16px 26px rgba(60,30,45,.28);transform:rotate(1deg)`)}"><img src="${asset("now-one-card.png")}" style="position:absolute;left:${-33 * k}px;top:${-32 * k}px;width:${780 * k}px;height:auto;display:block" alt=""></div>
  ${ring({ x: cardX - 26, y: cardY - 26, w: cardW + 52, h: cardH + 52 })}
  <div style="${abs(padX, 1196, padW, 150)};z-index:2;display:flex;gap:14px;align-items:flex-start">
    <span style="flex:none;margin-top:6px;width:48px;height:48px;border-radius:50%;background:${C.ink};display:grid;place-items:center">${icon("x", { size: 30, color: "#fff", weight: "bold" })}</span>
    <span data-check="label" style="font:600 30px/1.22 'Plex',sans-serif;color:${C.ink}">${esc(left)}</span></div>
  <div style="${abs(cardX - 20, 1196, 490, 150)};z-index:2;display:flex;gap:14px;align-items:flex-start">
    <span style="flex:none;margin-top:6px;width:48px;height:48px;border-radius:50%;background:${C.mulberry};display:grid;place-items:center">${icon("check", { size: 30, color: "#fff", weight: "bold" })}</span>
    <span data-check="label" style="font:600 30px/1.22 'Plex',sans-serif;color:${C.mulberryDeep}">${esc(right)}</span></div>
  ${pen({ x: 540, y: 1078, len: 380, rot: -7 })}`;
  return frame({ n: 31, scene, paper: "#f7efe2", headH, size: 70, sub: false });
}

/* ------------------------------------------------------------------ #35 */
function tray({ x, y, w = 456, h = 478, title, text, prop, seed = 1 }) {
  const rnd = rngOf(seed);
  const grain = Array.from({ length: 9 }, () => {
    const gy = 16 + rnd() * (h - 32);
    return `<path d="M${6 + rnd() * 60} ${gy} q${w * 0.3} ${(rnd() - 0.5) * 10} ${w * 0.9} ${(rnd() - 0.5) * 8}" stroke="#7a5a30" stroke-opacity="${(0.1 + rnd() * 0.1).toFixed(2)}" stroke-width="1.6" fill="none"/>`;
  }).join("");
  return `
  <div style="${abs(x, y, w, h)}">
    <div style="position:absolute;inset:0;border-radius:22px;background:linear-gradient(160deg,#d7b886,#c3a070);box-shadow:0 2px 3px rgba(60,30,10,.3),0 22px 30px rgba(60,30,10,.38)"></div>
    <svg style="position:absolute;inset:0;width:${w}px;height:${h}px" viewBox="0 0 ${w} ${h}" aria-hidden="true">${grain}</svg>
    <div style="position:absolute;inset:16px;border-radius:12px;background:linear-gradient(170deg,#a98558,#bd9966);box-shadow:inset 0 6px 14px rgba(40,20,5,.45),inset 0 0 0 2px rgba(60,35,12,.2)"></div>
    <div style="position:absolute;left:34px;right:34px;top:38px;bottom:30px;border-radius:10px;background:#fbf5ea;box-shadow:0 2px 3px rgba(40,20,5,.3),0 8px 12px rgba(40,20,5,.28);padding:24px 26px 0;overflow:hidden" data-check="tray">
      <div style="font:500 50px/1.05 'Newsreader',Georgia,serif;color:${C.mulberry};letter-spacing:-.01em;padding-right:${prop.pad ?? 0}px">${esc(title)}</div>
      <div style="width:56px;height:5px;border-radius:3px;background:${C.mulberry};opacity:.55;margin:14px 0 12px"></div>
      <div style="font:400 32px/1.3 'Plex',sans-serif;color:${C.ink}">${esc(text)}</div>
    </div>
    ${prop.html}
  </div>`;
}

function p35() {
  const i = idea(35);
  const [t1, t2, t3, t4] = ["Something to do", "Waiting on someone", "Something ongoing", "Worth having to hand"];
  const headH = 340;
  const gx = 36, gy = 410, tw = 456, th = 404, th2 = 512, gap = 16;
  const x2 = gx + tw + gap + 0;
  const y2 = gy + th + 16;
  const scene = `
  <svg style="${abs(0, headH, 1000, 1500 - headH)}" viewBox="0 0 1000 ${1500 - headH}" aria-hidden="true"><defs>
    <pattern id="lin" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#ead3d9"/><path d="M0 4 H8" stroke="#fff" stroke-opacity=".28" stroke-width="1"/><path d="M4 0 V8" stroke="#b78b98" stroke-opacity=".22" stroke-width="1"/></pattern>
    <radialGradient id="ll" cx="25%" cy="10%" r="100%"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#5f3d4b" stop-opacity=".28"/></radialGradient></defs>
    <rect width="1000" height="${1500 - headH}" fill="url(#lin)"/><rect width="1000" height="${1500 - headH}" fill="url(#ll)"/></svg>
  ${tray({ x: gx, y: gy, w: tw, h: th, title: t1, text: i.items[0], seed: 2, prop: { pad: 70, html: sticky({ x: tw - 142, y: -26, w: 130, h: 130, rot: 7 }) } })}
  ${tray({ x: x2 + 0, y: gy, w: tw, h: th, title: t2, text: i.items[1], seed: 5, prop: { pad: 20, html: envelope({ x: tw - 150, y: -34, w: 160, rot: 9 }) } })}
  ${tray({ x: gx, y: y2, w: tw, h: th2, title: t3, text: i.items[2], seed: 7, prop: { pad: 20, html: folder({ x: tw - 150, y: -32, w: 160, rot: -8 }) } })}
  ${tray({ x: x2, y: y2, w: tw, h: th2, title: t4, text: i.items[3], seed: 9, prop: { pad: 20, html: blankCard({ x: tw - 150, y: -26, w: 160, rot: 8 }) } })}`;
  return frame({ n: 35, scene, paper: "#f6e9ec", headH, size: 76 });
}

export const pins = [p27(), p31(), p35()];
