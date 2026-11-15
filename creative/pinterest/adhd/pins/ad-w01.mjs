/**
 * ADHD Life Companion guide pins, world w01: the telephone desk
 * (a landline handset and curly cord, an address book, a notepad under a pen,
 * a desk lamp, a headset; plum, brass and walnut).
 *
 * #2  script-card   four index cards, one pulled forward with mulberry quote marks, beside a desk phone, on a blush mat
 * #6  question      a ringing phone with five butter notes stuck round it and one card, "the talking", on dark walnut
 * #8  how-to-steps  a phone on its side with a voicemail waveform, a card of numbered steps propped on it, on plum
 * #16 scenario      a phone on speaker, a speech bubble and three reply cards along the foot of a lined page
 * #18 question      one big card, five tick circles, a quiet phone, on an open address book
 * #20 scenario      a handset and curly cord, a glass of water, a notepad and three reply cards on a light walnut table
 *
 * Every word is the idea record's own (headline split at its colon or question mark, sub, items, proof)
 * or a label named in the record's visual. All props are flat vector with soft shadows.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rngOf = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const SCENE_TOP = 372;
const INK = "#231a1f";

/* ------------------------------------------------------------------ frame */

/** The paper header (eyebrow, headline, sub), the footer band and the product line. */
function frame(n, { scene, paper, size = 72, extraCss = "", splitAt = ": ", shadow = "rgba(30,15,25,.32)", foot = "" }) {
  const i = idea(n);
  const k = i.headline.indexOf(splitAt);
  const eyebrow = k >= 0 ? i.headline.slice(0, k + (splitAt === "? " ? 1 : 0)) : null;
  const rest = k >= 0 ? i.headline.slice(k + splitAt.length) : i.headline;
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px ${shadow};z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px ${shadow};z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:58px;z-index:6}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:14px;color:${INK};text-wrap:balance}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4f4047;max-width:840px}
  .example{font-size:24px;padding:5px 12px;background:#fffaf0}
  ${extraCss}`;
  const body = `${scene}
  <div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${SCENE_TOP - 6}">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(rest)}</h1>${i.sub ? `<p>${esc(i.sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper }) };
}

/* ---------------------------------------------------------------- surfaces */

/** Dark or light walnut planks running across the scene, with grain. */
function walnut({ base = "#4a2e22", dark = "#3b231a", grain = "#1f110b", seed = 5, top = SCENE_TOP, planks = 6 } = {}) {
  const r = rngOf(seed);
  const H = 1500 - top;
  const ph = H / planks;
  let s = "";
  for (let k = 0; k < planks; k++) {
    const y = k * ph;
    s += `<rect x="0" y="${y}" width="1000" height="${ph}" fill="${k % 2 ? base : dark}"/><rect x="0" y="${y}" width="1000" height="3" fill="#000" opacity=".4"/>`;
    for (let g = 0; g < 10; g++) {
      const gy = y + 8 + r() * (ph - 16);
      s += `<path d="M${r() * 160} ${gy.toFixed(1)} C ${300 + r() * 160} ${(gy + (r() - 0.5) * 16).toFixed(1)}, ${600 + r() * 160} ${(gy + (r() - 0.5) * 16).toFixed(1)}, 1000 ${(gy + (r() - 0.5) * 10).toFixed(1)}" fill="none" stroke="${grain}" stroke-opacity="${(0.1 + r() * 0.18).toFixed(2)}" stroke-width="${(1 + r() * 2).toFixed(1)}"/>`;
    }
  }
  return `<svg style="position:absolute;left:0;top:${top}px;width:1000px;height:${H}px" viewBox="0 0 1000 ${H}" aria-hidden="true">${s}</svg>`;
}

/** A plain coloured desk mat with a faint weave and a soft vignette. */
function mat({ c1, c2, weave = "rgba(255,255,255,.05)", top = SCENE_TOP }) {
  return `<div style="${abs(0, top, 1000, 1500 - top, `background:radial-gradient(120% 90% at 25% 15%,${c1},${c2});`)}"></div>
  <div style="${abs(0, top, 1000, 1500 - top, `background-image:repeating-linear-gradient(90deg,${weave} 0 2px,transparent 2px 7px),repeating-linear-gradient(0deg,${weave} 0 2px,transparent 2px 7px)`)}"></div>`;
}

/** A pool of warm lamplight. */
const glow = (cx, cy, r, color = "255,214,140", a = 0.5) =>
  `<div style="${abs(cx - r, cy - r, r * 2, r * 2, `border-radius:50%;background:radial-gradient(circle,rgba(${color},${a}),rgba(${color},${a * 0.45}) 45%,rgba(${color},0) 72%);mix-blend-mode:soft-light`)}"></div>`;

/* ------------------------------------------------------------------ props */

/** A desk phone from above, handset across the top: a rotary dial or a push-button pad. */
let phoneId = 0;
function deskPhone({ x, y, w = 300, rot = 0, body = "#5f3d4b", hi = "#7d5566", key = "#f3e9da", brass = "#c9a24b", ring = false, speaker = false, handset = true, dial = "rotary" }) {
  const h = (w * 460) / 360;
  const id = `ph${phoneId++}`;
  const dark = "#1d0f16";
  const holes = Array.from({ length: 10 }, (_, k) => {
    const a = ((40 + k * 28.5) * Math.PI) / 180;
    const cx = 180 + Math.cos(a) * 68, cy = 292 + Math.sin(a) * 68;
    return `<circle cx="${cx.toFixed(1)}" cy="${(cy + 1.5).toFixed(1)}" r="14.5" fill="#fff" opacity=".35"/><circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="14" fill="${dark}"/><circle cx="${cx.toFixed(1)}" cy="${(cy - 2).toFixed(1)}" r="11" fill="#000" opacity=".45"/>`;
  }).join("");
  const rotary = `<circle cx="180" cy="292" r="108" fill="#000" opacity=".3"/><circle cx="180" cy="292" r="102" fill="${brass}"/><circle cx="180" cy="292" r="95" fill="${key}"/>
    <circle cx="180" cy="292" r="95" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="2"/>${holes}
    <circle cx="180" cy="292" r="36" fill="${body}"/><circle cx="180" cy="292" r="36" fill="none" stroke="${brass}" stroke-width="5"/><circle cx="180" cy="292" r="12" fill="${brass}"/>
    <path d="M262 340 L286 356 L276 372 L252 358 Z" fill="${brass}" stroke="#000" stroke-opacity=".25" stroke-width="2"/>
    <ellipse cx="136" cy="226" rx="46" ry="16" fill="#fff" opacity=".35" transform="rotate(-30 136 226)"/>`;
  const pad = `<rect x="66" y="176" width="228" height="242" rx="24" fill="#000" opacity=".16"/>` + Array.from({ length: 12 }, (_, k) => {
    const cx = 112 + (k % 3) * 68, cy = 222 + Math.floor(k / 3) * 56;
    return `<rect x="${cx - 26}" y="${cy - 17}" width="52" height="40" rx="11" fill="#000" opacity=".35"/><rect x="${cx - 26}" y="${cy - 21}" width="52" height="40" rx="11" fill="${key}"/><rect x="${cx - 26}" y="${cy - 21}" width="52" height="40" rx="11" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="2"/><rect x="${cx - 18}" y="${cy - 16}" width="30" height="7" rx="3.5" fill="#fff" opacity=".6"/>`;
  }).join("");
  const arcs = ring ? [0, 1, 2].map((k) => `<path d="M${-14 - k * 28} ${92 - 30 - k * 12} Q ${-30 - k * 32} 92 ${-14 - k * 28} ${92 + 30 + k * 12}" fill="none" stroke="${brass}" stroke-width="8" stroke-linecap="round" opacity="${1 - k * 0.25}"/><path d="M${374 + k * 28} ${92 - 30 - k * 12} Q ${390 + k * 32} 92 ${374 + k * 28} ${92 + 30 + k * 12}" fill="none" stroke="${brass}" stroke-width="8" stroke-linecap="round" opacity="${1 - k * 0.25}"/>`).join("") : "";
  const bell = dial === "keys" ? "M72 30 H288 Q330 30 334 72 L346 398 Q348 442 304 442 H56 Q12 442 14 398 L26 72 Q30 30 72 30 Z" : "M76 30 Q 46 230 20 410 Q 14 442 46 442 L 314 442 Q 346 442 340 410 Q 314 230 284 30 Z";
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 6px 4px rgba(0,0,0,.35)) drop-shadow(0 30px 28px rgba(0,0,0,.45))`)}" viewBox="0 0 360 460" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${body}"/></linearGradient></defs>
    ${arcs}
    <path d="${bell}" fill="url(#${id})"/><path d="${bell}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" transform="translate(3 4)"/>
    <path d="${bell}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
    <rect x="64" y="150" width="232" height="8" rx="4" fill="${brass}"/>
    ${dial === "rotary" ? rotary : pad}
    ${speaker ? `<circle cx="284" cy="132" r="9" fill="#ffd36a"/><circle cx="284" cy="132" r="15" fill="none" stroke="#ffd36a" stroke-opacity=".5" stroke-width="3"/>` : ""}
    ${!handset && !speaker ? `<g><rect x="52" y="30" width="46" height="34" rx="12" fill="#000" opacity=".35"/><rect x="262" y="30" width="46" height="34" rx="12" fill="#000" opacity=".35"/><rect x="52" y="24" width="46" height="34" rx="12" fill="${brass}"/><rect x="262" y="24" width="46" height="34" rx="12" fill="${brass}"/></g>` : ""}
    ${handset ? `<g><rect x="8" y="34" width="98" height="104" rx="36" fill="#000" opacity=".4"/><rect x="254" y="34" width="98" height="104" rx="36" fill="#000" opacity=".4"/><rect x="86" y="62" width="188" height="50" rx="25" fill="#000" opacity=".4"/>
      <rect x="6" y="26" width="98" height="104" rx="36" fill="${hi}"/><rect x="256" y="26" width="98" height="104" rx="36" fill="${hi}"/><rect x="84" y="60" width="192" height="40" rx="20" fill="${hi}"/>
      <rect x="6" y="26" width="98" height="104" rx="36" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/><rect x="256" y="26" width="98" height="104" rx="36" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="3"/>
      <rect x="100" y="66" width="160" height="8" rx="4" fill="#fff" opacity=".3"/>
      <circle cx="55" cy="78" r="28" fill="#000" opacity=".25"/><circle cx="55" cy="78" r="15" fill="#000" opacity=".25"/><circle cx="305" cy="78" r="28" fill="#000" opacity=".25"/><circle cx="305" cy="78" r="15" fill="#000" opacity=".25"/>
      <ellipse cx="38" cy="50" rx="16" ry="8" fill="#fff" opacity=".35" transform="rotate(-30 38 50)"/><ellipse cx="288" cy="50" rx="16" ry="8" fill="#fff" opacity=".35" transform="rotate(-30 288 50)"/></g>` : ""}
  </svg>`;
}

/** A handset on its own, lying flat. */
function handset({ x, y, w = 340, rot = 0, body = "#5f3d4b", hi = "#7d5566" }) {
  const h = w * (92 / 320);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 6px 4px rgba(0,0,0,.35)) drop-shadow(0 22px 18px rgba(0,0,0,.4))`)}" viewBox="0 0 320 92" aria-hidden="true">
    <rect x="0" y="4" width="92" height="88" rx="34" fill="#2c1a23"/><rect x="228" y="4" width="92" height="88" rx="34" fill="#2c1a23"/><rect x="60" y="28" width="200" height="44" rx="22" fill="#2c1a23"/>
    <rect x="0" y="0" width="92" height="88" rx="34" fill="${hi}"/><rect x="228" y="0" width="92" height="88" rx="34" fill="${hi}"/><rect x="60" y="24" width="200" height="44" rx="22" fill="${hi}"/>
    <rect x="70" y="32" width="180" height="9" rx="4.5" fill="#fff" opacity=".28"/>
    <circle cx="46" cy="44" r="23" fill="#000" opacity=".22"/><circle cx="274" cy="44" r="23" fill="#000" opacity=".22"/>
    <rect x="12" y="10" width="44" height="10" rx="5" fill="#fff" opacity=".22"/></svg>`;
}

/** A curly telephone cord along a cubic bezier: loops sampled along the curve. */
function cord({ p0, p1, p2, p3, loops = 22, r = 17, color = "#2c1a23", lite = "#6d4a5c", width = 7 }) {
  const B = (t) => {
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  };
  let len = 0, prev = B(0);
  for (let k = 1; k <= 60; k++) { const q = B(k / 60); len += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; }
  const pitch = len / loops;
  const amp = pitch * 0.9;
  const N = loops * 24;
  let d = "";
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const [bx, by] = B(t);
    const [ax, ay] = B(Math.min(1, t + 0.002)), [cx, cy] = B(Math.max(0, t - 0.002));
    const tl = Math.hypot(ax - cx, ay - cy) || 1;
    const tx = (ax - cx) / tl, ty = (ay - cy) / tl;
    const nx = -ty, ny = tx;
    const ph = t * loops * Math.PI * 2;
    const taper = Math.min(1, t * 14, (1 - t) * 14);
    const ox = nx * r * Math.sin(ph) * taper - tx * amp * Math.cos(ph) * taper;
    const oy = ny * r * Math.sin(ph) * taper - ty * amp * Math.cos(ph) * taper;
    d += `${k ? "L" : "M"}${(bx + ox).toFixed(1)} ${(by + oy).toFixed(1)} `;
  }
  return `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;pointer-events:none;overflow:visible;filter:drop-shadow(6px 12px 6px rgba(0,0,0,.4))" viewBox="0 0 1000 1500" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${lite}" stroke-width="${width * 0.32}" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1.2 -1.5)"/></svg>`;
}

/** A brass desk lamp seen from above: round base, jointed arm, a domed shade. */
function lamp({ x, y, s = 300, rot = 0 }) {
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))`)}" viewBox="0 0 300 300" aria-hidden="true">
    <defs><radialGradient id="lb${x}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f1d98c"/><stop offset=".55" stop-color="#c49a3f"/><stop offset="1" stop-color="#7f5c1d"/></radialGradient>
    <radialGradient id="ls${x}" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#f6e2a0"/><stop offset=".5" stop-color="#cfa447"/><stop offset="1" stop-color="#6e4d16"/></radialGradient></defs>
    <circle cx="70" cy="232" r="56" fill="url(#lb${x})"/><circle cx="70" cy="232" r="40" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
    <path d="M70 232 L150 128 L226 82" fill="none" stroke="#7a581b" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M70 232 L150 128 L226 82" fill="none" stroke="#e4c36b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="150" cy="128" r="13" fill="#a47b2a"/><circle cx="70" cy="232" r="14" fill="#a47b2a"/>
    <circle cx="226" cy="82" r="82" fill="url(#ls${x})"/><circle cx="226" cy="82" r="82" fill="none" stroke="#5a3d0f" stroke-opacity=".5" stroke-width="3"/>
    <circle cx="226" cy="82" r="56" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3"/><circle cx="226" cy="82" r="15" fill="#7f5c1d"/><ellipse cx="196" cy="52" rx="26" ry="14" fill="#fff" opacity=".35" transform="rotate(-35 196 52)"/></svg>`;
}

/** A pen: plum barrel, brass clip and ring. */
function pen({ x, y, len = 400, rot = 0, body = "#5f3d4b", trim = "#c9a24b" }) {
  return `<svg style="${abs(x, y, len, 34, `transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(20,10,5,.4))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".24"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="${trim}"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;
}

/** A tumbler of water. */
function glass({ x, y, s = 220 }) {
  return `<svg style="${abs(x, y, s * 0.86, s, "filter:drop-shadow(14px 18px 11px rgba(20,10,5,.42))")}" viewBox="0 0 172 200" aria-hidden="true">
    <defs><linearGradient id="gg${x}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".78"/><stop offset=".5" stop-color="#e6f2f6" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></linearGradient>
    <linearGradient id="gw${x}" x1="0" x2="1"><stop offset="0" stop-color="#d3e7ef"/><stop offset=".5" stop-color="#e9f4f8"/><stop offset="1" stop-color="#abcddd"/></linearGradient></defs>
    <path d="M10 28 L162 28 L148 178 Q147 192 132 192 L40 192 Q25 192 24 178 Z" fill="url(#gg${x})" stroke="#fff" stroke-width="3"/>
    <path d="M16 70 L156 70 L146 176 Q145 186 132 186 L40 186 Q27 186 26 176 Z" fill="url(#gw${x})" fill-opacity=".9"/>
    <ellipse cx="86" cy="70" rx="70" ry="10" fill="#f4fafd" stroke="#8fb7cc" stroke-width="2"/>
    <ellipse cx="86" cy="28" rx="76" ry="13" fill="#fff" fill-opacity=".5" stroke="#fff" stroke-width="4"/><ellipse cx="86" cy="28" rx="70" ry="9" fill="#dcecf4" fill-opacity=".7"/>
    <path d="M30 48 L40 168" stroke="#fff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/><path d="M134 90 L130 160" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>
    <circle cx="70" cy="120" r="3.5" fill="#fff" fill-opacity=".8"/><circle cx="102" cy="140" r="3" fill="#fff" fill-opacity=".7"/></svg>`;
}

/** A mug from above, plum glaze. */
function mug({ x, y, size = 170, color = "#6e4557", drink = "#4a2a1c" }) {
  return `<svg style="${abs(x, y, size * 1.3, size, "filter:drop-shadow(0 14px 10px rgba(0,0,0,.4))")}" viewBox="0 0 260 200" aria-hidden="true">
    <path d="M196 62 C 246 56 250 128 196 130" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>
    <path d="M196 62 C 240 58 242 124 196 128" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="22" stroke-linecap="round"/>
    <ellipse cx="100" cy="100" rx="96" ry="94" fill="${color}"/><ellipse cx="100" cy="100" rx="96" ry="94" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3"/>
    <ellipse cx="100" cy="100" rx="80" ry="78" fill="#3b2330"/><ellipse cx="100" cy="102" rx="72" ry="70" fill="${drink}"/><ellipse cx="80" cy="80" rx="28" ry="19" fill="#fff" opacity=".14"/></svg>`;
}

/** A headset from above: headband, two cushioned cups, a boom microphone. */
function headset({ x, y, s = 330, rot = 0 }) {
  return `<svg style="${abs(x, y, s, s * 0.9, `transform:rotate(${rot}deg);overflow:visible;filter:drop-shadow(0 18px 14px rgba(0,0,0,.45))`)}" viewBox="0 0 330 297" aria-hidden="true">
    <path d="M40 150 C 30 20, 300 20, 290 150" fill="none" stroke="#1d1418" stroke-width="26" stroke-linecap="round"/>
    <path d="M40 150 C 30 24, 300 24, 290 150" fill="none" stroke="#7d5566" stroke-width="9" stroke-linecap="round"/>
    <path d="M40 150 C 30 24, 300 24, 290 150" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="3" stroke-linecap="round" transform="translate(-2 -4)"/>
    <rect x="6" y="116" width="70" height="132" rx="30" fill="#2a1b23"/><rect x="254" y="116" width="70" height="132" rx="30" fill="#2a1b23"/>
    <rect x="14" y="126" width="54" height="112" rx="24" fill="#6a4256"/><rect x="262" y="126" width="54" height="112" rx="24" fill="#6a4256"/>
    <rect x="22" y="140" width="22" height="70" rx="11" fill="#fff" opacity=".16"/><rect x="270" y="140" width="22" height="70" rx="11" fill="#fff" opacity=".16"/>
    <path d="M40 248 C 44 296, 120 292, 160 280" fill="none" stroke="#c9a24b" stroke-width="7" stroke-linecap="round"/>
    <rect x="150" y="268" width="46" height="22" rx="11" fill="#2a1b23"/><rect x="154" y="271" width="38" height="7" rx="3.5" fill="#fff" opacity=".25"/></svg>`;
}

/** A butter sticky note. */
const sticky = ({ x, y, w = 220, h = 200, rot = 0, children = "", pad = 16, tint = "#f4dc8e" }) =>
  `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${tint},#ecc96b);box-shadow:0 2px 3px rgba(20,8,12,.35),0 14px 18px rgba(20,8,12,.4);padding:${pad}px;display:grid;place-items:center;text-align:center;`)}"><div style="${abs(0, 0, w, Math.round(h * 0.13), "background:rgba(255,255,255,.2)")}"></div>${children}</div>`;

/** A cream index card with an optional header rule; the ruled lines live on the text block (see `ruled`). */
const card = ({ x, y, w, h, rot = 0, children = "", extra = "", top = "#e7b9c8", topAt = 58 }) =>
  `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background-color:#fffaf0;background-image:linear-gradient(transparent 0 ${topAt}px,${top} ${topAt}px ${topAt + 2}px,transparent ${topAt + 2}px);box-shadow:0 2px 3px rgba(20,8,12,.3),0 18px 30px rgba(20,8,12,.42);border-radius:5px;${extra}`)}">${children}</div>`;

/** Ruled lines under handwriting: one rule per line box of height lh. */
const ruled = (lh, color = "#c3d1e0") => `background-image:repeating-linear-gradient(transparent 0 ${lh - 9}px,${color} ${lh - 9}px ${lh - 7}px,transparent ${lh - 7}px ${lh}px);`;
/** A handwritten, ruled text block filling the rest of its card. */
const script = ({ left, right, top, bottom, size, lh, check = "text", text, extra = "" }) =>
  `<div style="position:absolute;left:${left}px;right:${right}px;top:${top}px;bottom:${bottom}px;${hand(size, `line-height:${lh}px;`)}${ruled(lh)}${extra}" data-check="${check}">${esc(text)}</div>`;

/** A hand-drawn, slightly open circle. */
function handCircle(cx, cy, r, { color = INK, width = 4, seed = 1, over = 0.5 } = {}) {
  const rg = rngOf(seed);
  let d = "";
  const steps = 40;
  for (let k = 0; k <= steps; k++) {
    const a = -1.2 + (k / steps) * (Math.PI * 2 + over);
    const rr = r * (1 + 0.05 * Math.sin(a * 2 + seed) + (rg() - 0.5) * 0.04 + (k / steps) * 0.07);
    d += `${k ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * 0.96).toFixed(1)} `;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/** A hand-drawn loose ring around a text block (rounded rectangle with a wobble and an overlap). */
function handRing(x, y, w, h, { color = C.mulberry, width = 6, seed = 3 } = {}) {
  const rg = rngOf(seed);
  const j = () => (rg() - 0.5) * 5;
  const r = Math.min(h / 2, 46);
  const d = `M${x + r + 30} ${y + j()} L${x + w - r} ${y + j()} Q${x + w + j()} ${y} ${x + w + j()} ${y + r} L${x + w + j()} ${y + h - r} Q${x + w} ${y + h + j()} ${x + w - r} ${y + h + j()} L${x + r} ${y + h + j()} Q${x + j()} ${y + h} ${x + j()} ${y + h - r} L${x + j()} ${y + r} Q${x} ${y + j()} ${x + r + 10} ${y - 4} L${x + r + 70} ${y - 6}`;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const hand = (size, extra = "") => `font:600 ${size}px/1.06 'Hand',cursive;color:${INK};${extra}`;
const quote = (size, color = C.mulberry) => `<span class="serif" style="font:700 ${size}px/1 'Newsreader',Georgia,serif;color:${color}">&#8220;</span>`;
/** The item's lead-in ("Canceling") and its sentence. */
const splitItem = (t) => { const k = t.indexOf(": "); return [t.slice(0, k), t.slice(k + 2)]; };

/** Pen scribble lines: unreadable squiggles, never words. */
function squiggle(w, rows, seed) {
  const r = rngOf(seed);
  let d = "";
  for (let k = 0; k < rows; k++) {
    const y = 14 + k * 36;
    let x = 10;
    const len = w * (0.55 + r() * 0.4);
    d += `M${x} ${y} `;
    while (x < len) { const dx = 8 + r() * 8; d += `q${(dx / 2).toFixed(1)} ${((r() > 0.5 ? -1 : 1) * (4 + r() * 5)).toFixed(1)} ${dx.toFixed(1)} 0 `; x += dx; }
  }
  return `<svg style="position:absolute;left:0;top:0" width="${w}" height="${rows * 36 + 20}" aria-hidden="true"><path d="${d}" fill="none" stroke="#5f4a55" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/></svg>`;
}

/* ------------------------------------------------------------------ #2 */
function p2() {
  const n = 2;
  const i = idea(n);
  const items = i.items.map(splitItem);

  const surface = mat({ c1: "#f0d6d8", c2: "#d9b3b9", weave: "rgba(255,255,255,.07)" });

  // The pulled-forward card (the first item), the other three cascading beneath it.
  const [h0, s0] = items[0];
  const front = card({
    x: 40, y: 408, w: 668, h: 364, rot: -2.2, topAt: 70,
    children: `<div style="position:absolute;left:34px;top:-10px">${quote(150)}</div>
      <div class="eyebrow" style="position:absolute;left:150px;top:30px;font-size:22px;color:${C.mulberryDeep}">${esc(h0)}</div>
      ${script({ left: 44, right: 36, top: 84, bottom: 20, size: 50, lh: 56, check: "front", text: s0 })}`,
  });
  const small = items.slice(1).map(([lead, line], k) => card({
    x: [58, 36, 70][k], y: 802 + k * 170, w: 612, h: 200, rot: [1.6, -1.8, 1.2][k], topAt: 52,
    children: `<div class="eyebrow" style="position:absolute;left:30px;top:10px;font-size:22px;color:${C.mulberryDeep}">${esc(lead)}</div>
      ${script({ left: 30, right: 26, top: 62, bottom: 10, size: 37, lh: 42, check: "line", text: line })}`,
  })).join("");

  const ph = deskPhone({ x: 668, y: 842, w: 330, rot: 7, body: "#5f3d4b", hi: "#85586a", handset: false });
  const hs = handset({ x: 716, y: 440, w: 300, rot: 74, body: "#5f3d4b", hi: "#85586a" });
  const cc = cord({ p0: [910, 632], p1: [960, 740], p2: [770, 760], p3: [760, 866], loops: 17, r: 15 });
  const pn = pen({ x: 520, y: 1306, len: 380, rot: -3 });

  const scene = `${surface}${hs}${cc}${ph}${small}${front}${pn}`;
  return frame(n, { scene, paper: "#f6e9ec", size: 70 });
}

/* ------------------------------------------------------------------ #6 */
function p6() {
  const n = 6;
  const i = idea(n);
  const surface = walnut({ base: "#4d3024", dark: "#3d251b", seed: 8 });
  const lampGlow = glow(500, 820, 700, "255,206,120", 0.6);

  const phone = deskPhone({ x: 300, y: 582, w: 400, rot: 0, body: "#c9a24b", hi: "#e9cd80", key: "#f3e9da", brass: "#f1dc9a", ring: true, handset: true });

  // Five butter notes stuck round its edge, one per job.
  const notes = [
    { x: 40, y: 386, rot: -6, h: 214, t: i.items[0] },
    { x: 706, y: 386, rot: 5, h: 214, t: i.items[1] },
    { x: 16, y: 756, rot: 4, h: 226, t: i.items[2] },
    { x: 738, y: 746, rot: -4, h: 226, t: i.items[3] },
    { x: 722, y: 1040, rot: 3, h: 226, t: i.items[4] },
  ].map(({ x, y, rot, h, t }) => sticky({
    x, y, w: 252, h, rot, pad: 12,
    children: `<div style="${hand(44, "line-height:44px;text-wrap:balance;position:relative")}" data-check="note">${esc(t)}</div>`,
  })).join("");
  const tape = [[250, 800, 12], [696, 868, 8], [706, 1062, -12]].map(([x, y, r]) => `<div style="${abs(x, y, 86, 26, `transform:rotate(${r}deg);background:rgba(223,230,236,.8);box-shadow:0 2px 3px rgba(0,0,0,.3)`)}"></div>`).join("");

  const talking = card({
    x: 150, y: 1176, w: 470, h: 116, rot: -2, top: "transparent",
    children: `<div style="position:absolute;inset:0;display:grid;place-items:center;${hand(78, "line-height:1")}" data-check="talking">the talking</div>`,
  });
  const arrow = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;overflow:visible;filter:drop-shadow(0 4px 4px rgba(0,0,0,.35))" viewBox="0 0 1000 1500" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M600 1178 C 676 1130, 650 1070, 566 1050" stroke="#fffaf0" stroke-width="18"/><path d="M596 1016 L558 1048 L604 1074" stroke="#fffaf0" stroke-width="18"/>
    <path d="M600 1178 C 676 1130, 650 1070, 566 1050" stroke="${C.mulberry}" stroke-width="8"/><path d="M596 1016 L558 1048 L604 1074" stroke="${C.mulberry}" stroke-width="8"/></g></svg>`;

  const scene = `${surface}${lampGlow}${phone}${tape}${notes}${talking}${arrow}`;
  return frame(n, { scene, paper: "#f3e8e6", size: 76, splitAt: "? ", shadow: "rgba(15,6,4,.5)" });
}

/* ------------------------------------------------------------------ #8 */
function waveform(w, h, seed, bars = 64) {
  const r = rngOf(seed);
  let s = "";
  const bw = w / bars;
  for (let k = 0; k < bars; k++) {
    const env = Math.sin((k / bars) * Math.PI);
    const a = Math.max(0.1, (0.25 + r() * 0.75) * (0.4 + env * 0.6));
    const bh = h * a;
    s += `<rect x="${(k * bw + 1).toFixed(1)}" y="${((h - bh) / 2).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${bh.toFixed(1)}" rx="${((bw - 3) / 2).toFixed(1)}" fill="#f1d58a"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">${s}</svg>`;
}

function p8() {
  const n = 8;
  const i = idea(n);
  const surface = mat({ c1: "#5a3347", c2: "#35192a", weave: "rgba(255,255,255,.045)" });
  const lampGlow = glow(500, 880, 640, "255,206,130", 0.4);

  // The phone lies on its side: a quarter turn, its keypad facing the card.
  const ph = deskPhone({ x: 600, y: 378, w: 340, rot: 90, body: "#b07a92", hi: "#d3a2b6", key: "#f3e9da", brass: "#d6ad52", dial: "keys" });

  const steps = i.items.slice(0, 4);
  const rowsHtml = steps.map((t, k) => `<div style="position:relative;padding-left:78px;margin-top:${k ? 12 : 0}px;${hand(46, "line-height:50px")}" data-check="step">
    <span style="position:absolute;left:0;top:-2px;width:52px;height:52px;border-radius:50%;background:${C.mulberry};color:#fffaf2;font:700 34px/52px 'Plex',sans-serif;text-align:center;box-shadow:0 2px 3px rgba(0,0,0,.25)">${k + 1}</span>${esc(t)}</div>`).join("");
  const cd = card({
    x: 36, y: 408, w: 520, h: 668, rot: -2.4, top: "transparent",
    children: `<div style="position:absolute;left:30px;right:26px;top:38px">${rowsHtml}</div>
      <div style="position:absolute;left:30px;right:26px;bottom:26px;border-top:3px dashed ${C.mulberry};padding-top:16px;${hand(42, "line-height:46px")}" data-check="last">${esc(i.items[4])}</div>`,
  });
  // The 'left it' note, with no time on it, and a headset on the mat.
  const left = sticky({ x: 560, y: 830, w: 222, h: 196, rot: 5, children: `<div style="${hand(70, "line-height:1")}">left it</div>` });
  const hset = headset({ x: 770, y: 856, s: 210, rot: -10 });

  const strip = `<div style="${abs(40, 1130, 920, 140, "background:linear-gradient(#2a1822,#1a0e14);border-radius:18px;border:4px solid #c9a24b;box-shadow:0 18px 26px rgba(0,0,0,.5), inset 0 0 22px rgba(0,0,0,.6);display:flex;align-items:center;padding:0 34px;gap:26px")}">
    <div style="width:0;height:0;border-left:46px solid #f1d58a;border-top:30px solid transparent;border-bottom:30px solid transparent;flex:none"></div>
    <div style="flex:1;height:98px;display:grid;place-items:center">${waveform(760, 98, 21, 60)}</div></div>`;

  const scene = `${surface}${lampGlow}${ph}${cd}${left}${hset}${strip}`;
  return frame(n, { scene, paper: "#f1e5ea", size: 72, shadow: "rgba(15,5,12,.5)" });
}

/* ------------------------------------------------------------------ #16 */
function p16() {
  const n = 16;
  const i = idea(n);
  const items = i.items.map(splitItem);
  const surface = walnut({ base: "#6b4430", dark: "#59372a", seed: 14, planks: 5 });
  const lampGlow = glow(800, 520, 560, "255,214,150", 0.55);

  // The lined page the cards sit on, running down under the foot.
  const pageEl = `<div style="${abs(50, 640, 900, 860, "transform:rotate(-0.8deg);background-color:#fffbf0;background-image:linear-gradient(90deg,transparent 100px,#e8b4c2 100px 103px,transparent 103px),repeating-linear-gradient(transparent 0 46px,#c7d5e4 46px 48px);background-position:0 0,0 22px;box-shadow:0 2px 3px rgba(20,8,5,.3),0 24px 40px rgba(20,8,5,.5);border-radius:6px 6px 0 0")}"></div>
  <div style="${abs(50, 640, 900, 26, "transform:rotate(-0.8deg);background:linear-gradient(#e6ddcf,#cdc2b0);border-radius:6px 6px 0 0")}"></div>`;

  // A phone on speaker: handset in its cradle, a lit button, sound arcs.
  const ph = deskPhone({ x: 360, y: 384, w: 270, rot: -4, body: "#e4d7bd", hi: "#f6edd8", key: "#85586a", brass: "#c9a24b", speaker: true, ring: true, handset: true, dial: "keys" });
  const bubble = `<svg style="position:absolute;left:0;top:0;width:1000px;height:1500px;overflow:visible;filter:drop-shadow(0 12px 12px rgba(10,4,3,.5))" viewBox="0 0 1000 1500" aria-hidden="true">
    <path d="M40 410 Q40 394 56 394 L314 394 Q330 394 330 410 L330 540 Q330 556 314 556 L300 556 L372 600 L270 556 L56 556 Q40 556 40 540 Z" fill="#fffaf0" stroke="#e8d9cf" stroke-width="2"/></svg>
  <div style="${abs(54, 402, 262, 148, `display:grid;place-items:center;text-align:center;${hand(54, "line-height:52px")}`)}" data-check="bubble">${esc(splitItem(i.items[0])[0])}</div>`;
  const lampSvg = lamp({ x: 660, y: 352, s: 340, rot: 0 });
  const mg = mug({ x: 800, y: 676, size: 118 });

  const rots = [-2.2, 1.2, -1.2];
  const cds = items.map(([lead, line], k) => card({
    x: 64 + k * 296, y: 780, w: 280, h: 500, rot: rots[k], topAt: 74,
    children: `<div class="eyebrow" style="position:absolute;left:20px;right:12px;top:10px;font-size:22px;line-height:1.1;letter-spacing:.06em;color:${C.mulberryDeep}">${esc(lead)}</div>
      ${script({ left: 20, right: 16, top: 88, bottom: 14, size: 40, lh: 44, check: "reply", text: line })}`,
  })).join("");

  const scene = `${surface}${lampGlow}${pageEl}${lampSvg}${mg}${ph}${bubble}${cds}`;
  return frame(n, { scene, paper: "#f6ece6", size: 74, splitAt: "\u0000", shadow: "rgba(15,6,4,.5)" });
}

/* ------------------------------------------------------------------ #18 */
function p18() {
  const n = 18;
  const i = idea(n);
  const surface = mat({ c1: "#d8cbd3", c2: "#b9a8b3", weave: "rgba(255,255,255,.1)" });

  // An open address book: plum leather cover, two cream pages ruled for entries, index tabs on the edge.
  const BX = 24, BY = 400, BW = 780, BH = 920;
  const rows = Array.from({ length: 14 }, (_, k) => `<path d="M50 ${120 + k * 56} H${BW / 2 - 20}" stroke="#c7d1de" stroke-width="2"/><path d="M${BW / 2 + 20} ${120 + k * 56} H${BW - 50}" stroke="#c7d1de" stroke-width="2"/>`).join("");
  const tabs = Array.from({ length: 11 }, (_, k) => `<rect x="${BW - 4}" y="${86 + k * 74}" width="52" height="58" rx="10" fill="${k % 2 ? "#c9a24b" : "#85586a"}"/><rect x="${BW - 4}" y="${86 + k * 74}" width="52" height="8" rx="4" fill="#fff" opacity=".25"/>`).join("");
  const book = `<svg style="${abs(BX, BY, BW + 52, BH, "transform:rotate(-1.4deg);overflow:visible;filter:drop-shadow(0 28px 30px rgba(40,20,35,.5))")}" viewBox="0 0 ${BW + 52} ${BH}" aria-hidden="true">
    <defs><linearGradient id="sp" x1="0" x2="1"><stop offset="0" stop-color="#9a7f6a" stop-opacity="0"/><stop offset="1" stop-color="#6e5545"/></linearGradient><linearGradient id="sp2" x1="1" x2="0"><stop offset="0" stop-color="#9a7f6a" stop-opacity="0"/><stop offset="1" stop-color="#6e5545"/></linearGradient></defs>
    <rect x="-14" y="-12" width="${BW + 28}" height="${BH + 26}" rx="30" fill="#4a2a3a"/>
    <rect x="0" y="0" width="${BW / 2}" height="${BH}" rx="8" fill="#fbf4e6"/><rect x="${BW / 2}" y="0" width="${BW / 2}" height="${BH}" rx="8" fill="#fffaf0"/>
    <rect x="${BW / 2 - 60}" y="0" width="60" height="${BH}" fill="url(#sp)" opacity=".5"/><rect x="${BW / 2}" y="0" width="60" height="${BH}" fill="url(#sp2)" opacity=".5"/>
    <rect x="${BW / 2 - 2}" y="0" width="4" height="${BH}" fill="#5a4436" opacity=".6"/>${rows}${tabs}
    <path d="M${BW / 2 + 70} ${BH} V${BH + 70}" stroke="#c9a24b" stroke-width="10"/></svg>`;

  const rowH = 118;
  const rowsHtml = i.items.map((t, k) => {
    const chosen = k === 0;
    const top = 226 + k * rowH;
    return `<div style="${abs(26, top, 540, rowH - 8, `display:flex;align-items:center;gap:22px;${hand(40, "line-height:41px")}`)}" data-check="option">
      <svg width="62" height="62" viewBox="0 0 62 62" style="flex:none;overflow:visible" aria-hidden="true">${handCircle(31, 31, 24, { seed: k + 2, width: 4.5 })}${chosen ? `<path d="M16 32 L28 44 C 34 30, 42 18, 56 8" fill="none" stroke="${C.mulberry}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>` : ""}</svg>
      <span>${esc(t)}</span></div>`;
  }).join("");
  const ring = `<svg style="${abs(0, 0, 640, 880, "overflow:visible")}" viewBox="0 0 640 880" aria-hidden="true">${handRing(8, 216, 592, 122, { seed: 5 })}</svg>`;
  const q = card({
    x: 100, y: 440, w: 600, h: 840, rot: 1.8, top: "transparent",
    children: `<div style="position:absolute;left:34px;right:30px;top:30px;${hand(74, "line-height:72px;color:" + C.mulberryDeep)}" data-check="question">What makes this one hard?</div>
      <div style="position:absolute;left:0;right:0;top:186px;bottom:24px;${ruled(59)}"></div>${ring}${rowsHtml}`,
  });

  const ph = deskPhone({ x: 700, y: 820, w: 330, rot: -8, body: "#2b1a22", hi: "#4a3340", key: "#f3e9da", brass: "#c9a24b", handset: true });
  const pn = pen({ x: 640, y: 1296, len: 360, rot: -3 });

  const scene = `${surface}${book}${ph}${q}${pn}`;
  return frame(n, { scene, paper: "#efe7ec", size: 72, shadow: "rgba(40,20,35,.38)" });
}

/* ------------------------------------------------------------------ #20 */
function p20() {
  const n = 20;
  const i = idea(n);
  const items = i.items.map(splitItem);
  // A light walnut table with a mulberry linen runner under the cards.
  const surface = walnut({ base: "#a77a54", dark: "#9a6e49", grain: "#5a3a1f", seed: 22, planks: 5 });
  const runner = `<div style="${abs(366, 360, 700, 1140, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 3px,transparent 3px 8px),linear-gradient(#8a5a70,#6f4558);box-shadow:-10px 0 24px rgba(40,18,25,.4);transform:rotate(1.2deg)")}"></div>
  <div style="${abs(372, 360, 6, 1140, "background:repeating-linear-gradient(transparent 0 12px,#d6b36a 12px 20px);transform:rotate(1.2deg)")}"></div>`;

  // A notepad under a pen, blank.
  const pad = `<div style="${abs(34, 436, 316, 560, "transform:rotate(-3deg)")}">
    <div style="position:absolute;inset:0;background:#fffbf0;border-radius:8px;box-shadow:0 2px 3px rgba(20,8,5,.3),0 24px 36px rgba(20,8,5,.45);background-image:linear-gradient(90deg,transparent 52px,#e8b4c2 52px 54px,transparent 54px),repeating-linear-gradient(transparent 0 40px,#c7d5e4 40px 42px);background-position:0 0,0 70px"></div>
    <div style="position:absolute;left:0;right:0;top:0;height:54px;background:#5f3d4b;border-radius:8px 8px 0 0;box-shadow:0 3px 5px rgba(0,0,0,.3)"></div>
    <div style="position:absolute;left:0;right:0;top:50px;height:6px;background:#c9a24b"></div></div>`;
  const pn = pen({ x: 40, y: 800, len: 380, rot: -15 });

  const cds = items.map(([lead, line], k) => card({
    x: [404, 392, 416][k], y: [424, 748, 1056][k], w: 548, h: 270, rot: [-3, 2.4, -1.8][k], topAt: 52,
    children: `<div class="eyebrow" style="position:absolute;left:28px;top:10px;font-size:22px;color:${C.mulberryDeep}">${esc(lead)}</div>
      ${script({ left: 28, right: 24, top: 62, bottom: 12, size: 40, lh: 44, check: "reply", text: line })}`,
  })).join("");
  const tag = `<span class="example" style="position:absolute;left:800px;top:386px;z-index:4;transform:rotate(2deg)">Example</span>`;

  const hs = handset({ x: 26, y: 1150, w: 230, rot: -7, body: "#5f3d4b", hi: "#85586a" });
  const cc = cord({ p0: [52, 1186], p1: [-70, 1230], p2: [150, 1320], p3: [90, 1420], loops: 13, r: 13, width: 6 });
  const gl = glass({ x: 262, y: 1070, s: 190 });

  const scene = `${surface}${runner}${pad}${pn}${cc}${hs}${gl}${cds}${tag}`;
  return frame(n, { scene, paper: "#f4eae4", size: 68, shadow: "rgba(30,14,8,.4)" });
}

export const pins = [p2(), p6(), p8(), p16(), p18(), p20()];
