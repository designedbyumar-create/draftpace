/**
 * Batch 2, group G1: five subscription guide pins on a garden potting bench.
 * Every word is the idea bank's own (headline, sub, items, proof) or a label
 * that is real on the thing shown (the guide table's column headings
 * "Charge", "How often", "What you see", "Cost per year", "What the line looks
 * like", "What it usually is", and the tracker's "Name", "Charge", "Cycle",
 * "Renews"). Placeholder rows are plain grey bars with no words.
 *
 *   #6   side-by-side  two statement stacks (three months / a full year) on weathered grey bench boards
 *   #8   comparison    three seed packets pinned to a duck-egg shed wall, a total plaque, a watering can on the shelf
 *   #12  infographic   a statement-line decoder sheet on burlap, a highlighter, a receipt and a terracotta pot
 *   #14  scenario      a two-week timeline strip on dark compost, a sticky note, a record card and a plant label
 *   #16  quote card    one forest index card on honey crate slats, a pencil, seed packets and a pot
 */
import { printable } from "../kit/printable.mjs";
import { idea, C } from "../kit/bank.mjs";
import { esc } from "../../v3/kit.mjs";

const SCENE_TOP = 372;
const SCENE_H = 1354 - SCENE_TOP;
const POP = "#c9502f"; // the warm pop
const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
let uid = 0;
const nid = (s) => `${s}${++uid}`;
const check = (cond, msg) => { if (!cond) throw new Error(msg); };
const EXAMPLE = (extra = "") => `<span class="example" style="font-size:24px;padding:5px 12px;background:#fffdf6;color:#1d1d20;border-color:#1d1d20;${extra}">Example</span>`;
const PAPER_SHADOW = "0 2px 3px rgba(30,20,10,.28),0 16px 28px rgba(30,20,10,.34)";

/* ================================================================== surfaces */

/** Wooden boards filling the scene: horizontal planks or vertical slats, with grain, gaps, nails and knots. */
function boards({ vertical = false, n = 7, alts, gap = "#2a2118", gapW = 5, seed = 3, nails = true, knots = 3, grain = "#6b5a44", grainOp = 0.2, light = 0.2, dark = 0.34, chips = 0, chip = "#efe9da", top = SCENE_TOP, h = SCENE_H }) {
  const r = rng(seed);
  const out = [];
  const L = vertical ? 1000 : h; // length along the board
  const T = vertical ? h : 1000; // across
  const span = (vertical ? 1000 : h) / n;
  for (let k = 0; k < n; k++) {
    const a = span * k;
    const col = alts[k % alts.length];
    if (vertical) out.push(`<rect x="${a}" y="0" width="${span}" height="${h}" fill="${col}"/>`);
    else out.push(`<rect x="0" y="${a}" width="1000" height="${span}" fill="${col}"/>`);
    for (let g = 0; g < 8; g++) {
      const o = a + 6 + r() * (span - 12);
      const s0 = r() * 120, s1 = 360 + r() * 240, s2 = 640 + r() * 200;
      const e = (vertical ? h : 1000);
      const wob = () => (r() - 0.5) * 8;
      out.push(vertical
        ? `<path d="M${o} ${s0} C ${o + wob()} ${s1}, ${o + wob()} ${s2}, ${o + wob()} ${e}" fill="none" stroke="${grain}" stroke-opacity="${(grainOp * (0.5 + r())).toFixed(2)}" stroke-width="${(1 + r() * 1.8).toFixed(1)}"/>`
        : `<path d="M${s0} ${o} C ${s1} ${o + wob()}, ${s2} ${o + wob()}, ${e} ${o + wob()}" fill="none" stroke="${grain}" stroke-opacity="${(grainOp * (0.5 + r())).toFixed(2)}" stroke-width="${(1 + r() * 1.8).toFixed(1)}"/>`);
    }
    if (k > 0) out.push(vertical ? `<rect x="${a - gapW / 2}" y="0" width="${gapW}" height="${h}" fill="${gap}"/>` : `<rect x="0" y="${a - gapW / 2}" width="1000" height="${gapW}" fill="${gap}"/>`);
    if (k > 0) out.push(vertical ? `<rect x="${a + gapW / 2}" y="0" width="2" height="${h}" fill="#fff" opacity=".18"/>` : `<rect x="0" y="${a + gapW / 2}" width="1000" height="2" fill="#fff" opacity=".2"/>`);
    for (let c = 0; c < knots / n * 2; c++) {
      if (r() > 0.5) continue;
      const kx = vertical ? a + span / 2 : 80 + r() * 840, ky = vertical ? 60 + r() * (h - 120) : a + span / 2;
      out.push(`<ellipse cx="${kx}" cy="${ky}" rx="${vertical ? 11 : 24}" ry="${vertical ? 24 : 11}" fill="${grain}" opacity=".32"/><ellipse cx="${kx}" cy="${ky}" rx="${vertical ? 5 : 13}" ry="${vertical ? 13 : 5}" fill="#2a2118" opacity=".4"/>`);
    }
    if (nails) for (const q of [26, 974]) {
      const nx = vertical ? a + span / 2 : q, ny = vertical ? (q === 26 ? 26 : h - 26) : a + span / 2;
      out.push(`<circle cx="${nx}" cy="${ny}" r="5.5" fill="#3b342c"/><circle cx="${nx - 1.4}" cy="${ny - 1.4}" r="2" fill="#c9c5bb" opacity=".7"/>`);
    }
    for (let c = 0; c < chips; c++) { // chips of old paint
      const cx = vertical ? a + 4 + r() * (span - 8) : r() * 1000, cy = vertical ? r() * h : a + 4 + r() * (span - 8);
      out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${3 + r() * 9}" ry="${2 + r() * 4}" fill="${chip}" opacity="${(0.4 + r() * 0.4).toFixed(2)}" transform="rotate(${r() * 180} ${cx} ${cy})"/>`);
    }
  }
  void L; void T;
  const g = nid("bg");
  return `<svg style="${at(0, top, 1000, h)}" viewBox="0 0 1000 ${h}" aria-hidden="true"><defs><radialGradient id="${g}" cx="22%" cy="8%" r="105%"><stop offset="0" stop-color="#fff" stop-opacity="${light}"/><stop offset="1" stop-color="#1c1208" stop-opacity="${dark}"/></radialGradient></defs>${out.join("")}<rect width="1000" height="${h}" fill="url(#${g})"/></svg>`;
}

/** Dark compost: noise, clods, white perlite chips and pebbles. */
function soil(seed = 12) {
  const r = rng(seed);
  const out = [];
  for (let k = 0; k < 1500; k++) {
    const x = r() * 1000, y = r() * SCENE_H, rx = 2 + Math.pow(r(), 2) * 9, ry = rx * (0.5 + r() * 0.5);
    const tone = ["#2a1d14", "#3b2a1c", "#4a3524", "#241811", "#55402c", "#33261a"][Math.floor(r() * 6)];
    out.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${tone}" opacity="${(0.55 + r() * 0.45).toFixed(2)}" transform="rotate(${(r() * 180) | 0} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
  }
  for (let k = 0; k < 120; k++) { // perlite
    const x = r() * 1000, y = r() * SCENE_H;
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1.4 + r() * 3).toFixed(1)}" fill="#e8e3d6" opacity="${(0.45 + r() * 0.45).toFixed(2)}"/>`);
  }
  for (let k = 0; k < 26; k++) { // pebbles
    const x = r() * 1000, y = r() * SCENE_H, rr = 6 + r() * 12;
    const tone = ["#8f8a80", "#a39d8f", "#7c776e", "#b2a58d"][Math.floor(r() * 4)];
    out.push(`<ellipse cx="${x + 2}" cy="${y + 3}" rx="${rr}" ry="${rr * 0.75}" fill="#000" opacity=".3"/><ellipse cx="${x}" cy="${y}" rx="${rr}" ry="${rr * 0.75}" fill="${tone}"/><ellipse cx="${x - rr * 0.3}" cy="${y - rr * 0.25}" rx="${rr * 0.4}" ry="${rr * 0.22}" fill="#fff" opacity=".28"/>`);
  }
  const f = nid("sf"), g = nid("sg");
  return `<svg style="${at(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs>
  <filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".55" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .13  0 0 0 0 .08  0 0 0 .9 -.25"/></filter>
  <radialGradient id="${g}" cx="25%" cy="10%" r="110%"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="#3a281a"/>${out.join("")}<rect width="1000" height="${SCENE_H}" filter="url(#${f})" opacity=".55"/><rect width="1000" height="${SCENE_H}" fill="url(#${g})"/></svg>`;
}

/** A burlap sack: woven threads, uneven slubs, a stitched seam. */
function burlap(seed = 21) {
  const r = rng(seed);
  const slubs = [];
  for (let k = 0; k < 90; k++) {
    const y = r() * SCENE_H, x = r() * 900, len = 40 + r() * 140;
    slubs.push(`<rect x="${x}" y="${y}" width="${len}" height="${2 + r() * 3}" rx="2" fill="${r() > 0.5 ? "#8c6c3e" : "#e4cb9a"}" opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`);
  }
  const f = nid("bf"), g = nid("bg"), pt = nid("bp");
  return `<svg style="${at(0, SCENE_TOP, 1000, SCENE_H)}" viewBox="0 0 1000 ${SCENE_H}" aria-hidden="true"><defs>
  <pattern id="${pt}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#8f6c3c"/>
  <rect x="0.5" y="0.5" width="7" height="7" rx="2" fill="#dcc08a"/><rect x="0.5" y="1.5" width="7" height="2" fill="#fff" opacity=".28"/>
  <rect x="8.5" y="0.5" width="7" height="7" rx="2" fill="#c49d62"/><rect x="9.5" y="0.5" width="2" height="7" fill="#fff" opacity=".2"/>
  <rect x="0.5" y="8.5" width="7" height="7" rx="2" fill="#c49d62"/><rect x="1.5" y="8.5" width="2" height="7" fill="#fff" opacity=".2"/>
  <rect x="8.5" y="8.5" width="7" height="7" rx="2" fill="#d6b87e"/><rect x="8.5" y="9.5" width="7" height="2" fill="#fff" opacity=".25"/></pattern>
  <filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .5" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .1  0 0 0 .8 -.2"/></filter>
  <radialGradient id="${g}" cx="25%" cy="8%" r="110%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#2b1a08" stop-opacity=".34"/></radialGradient></defs>
  <rect width="1000" height="${SCENE_H}" fill="url(#${pt})"/>${slubs.join("")}<rect width="1000" height="${SCENE_H}" filter="url(#${f})" opacity=".32"/>
  <path d="M 118 0 V ${SCENE_H}" stroke="#4a3418" stroke-width="3" stroke-dasharray="14 9" opacity=".55" fill="none"/><path d="M 108 0 V ${SCENE_H}" stroke="#3a2810" stroke-opacity=".2" stroke-width="10" fill="none"/>
  <rect width="1000" height="${SCENE_H}" fill="url(#${g})"/></svg>`;
}

/* ================================================================== props */

/** A terracotta pot seen from the side, with leaves, a sprout, or nothing. */
function pot({ x, y, w = 200, rot = 0, plant = "leaf", tone = "#c9714b", seed = 1 }) {
  const h = w * 1.2, r = rng(seed);
  const g = nid("pt"), lg = nid("lf");
  let leaves = "";
  if (plant === "leaf") {
    for (let k = 0; k < 9; k++) {
      const a = -80 + k * 20 + (r() - 0.5) * 8, len = 70 + r() * 40;
      leaves += `<g transform="translate(100 78) rotate(${a})"><path d="M0 0 C -16 -${len * 0.35}, -14 -${len * 0.8}, 0 -${len} C 14 -${len * 0.8}, 16 -${len * 0.35}, 0 0Z" fill="url(#${lg})"/><path d="M0 -4 V -${len * 0.85}" stroke="#fff" stroke-opacity=".28" stroke-width="2"/></g>`;
    }
  } else if (plant === "sprout") {
    leaves = `<path d="M100 80 C 100 50, 98 36, 100 20" stroke="#4f8a45" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M100 28 C 76 8, 52 18, 50 34 C 72 40, 90 38, 100 28Z" fill="#6ba95a"/><path d="M100 24 C 124 4, 150 12, 152 30 C 130 36, 110 34, 100 24Z" fill="#5a9a4c"/>`;
  }
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);z-index:5;overflow:visible;filter:drop-shadow(0 14px 10px rgba(30,20,10,.4))`)}" viewBox="0 0 200 240" aria-hidden="true"><defs>
  <linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#4a1d08" stop-opacity=".38"/></linearGradient>
  <linearGradient id="${lg}" x1="0" x2="1"><stop offset="0" stop-color="#5f9e55"/><stop offset="1" stop-color="#3d7a3f"/></linearGradient></defs>
  ${leaves}
  <path d="M34 98 H166 L150 232 H50 Z" fill="${tone}"/><path d="M34 98 H166 L150 232 H50 Z" fill="url(#${g})"/>
  <rect x="22" y="72" width="156" height="32" rx="7" fill="${tone}"/><rect x="22" y="72" width="156" height="32" rx="7" fill="url(#${g})"/><rect x="26" y="75" width="148" height="6" rx="3" fill="#fff" opacity=".22"/>
  <ellipse cx="100" cy="78" rx="70" ry="7" fill="#3a2414" opacity=".85"/>
  <path d="M50 214 H150" stroke="#000" stroke-opacity=".12" stroke-width="4"/></svg>`;
}

/** A garden trowel lying horizontally (blade to the right); rotation turns it about its centre. */
function trowel({ x, y, len = 380, rot = 0, handle = "#2f6b57" }) {
  const h = len * 0.24, s = len / 380;
  const g = nid("tw"), hg = nid("th");
  return `<svg style="${at(x, y, len, h, `transform:rotate(${rot}deg);z-index:5;filter:drop-shadow(0 12px 8px rgba(30,20,10,.4))`)}" viewBox="0 0 380 91" aria-hidden="true"><defs>
  <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef0f2"/><stop offset=".5" stop-color="#b9bec4"/><stop offset="1" stop-color="#8d939b"/></linearGradient>
  <linearGradient id="${hg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>
  <rect x="6" y="28" width="134" height="36" rx="18" fill="${handle}"/><rect x="6" y="28" width="134" height="36" rx="18" fill="url(#${hg})"/><circle cx="26" cy="46" r="5" fill="#0c1f18" opacity=".6"/>
  <rect x="136" y="32" width="28" height="28" rx="4" fill="url(#${g})"/>
  <rect x="162" y="40" width="40" height="12" fill="url(#${g})"/>
  <path d="M196 46 C 214 8, 310 4, 376 46 C 310 88, 214 84, 196 46Z" fill="url(#${g})"/><path d="M206 46 H356" stroke="#fff" stroke-opacity=".55" stroke-width="3"/><path d="M210 30 C 250 16, 300 16, 340 32" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/></svg>`.replace("${s}", String(s));
}

/** A seed packet: folded top, a label panel with a drawn flower or vegetable, no words. */
function packet({ x, y, w = 190, rot = 0, hue = "#e8c15a", art = "daisy", z = 1 }) {
  const h = w * 1.42;
  let pic = "";
  if (art === "daisy") pic = `<g transform="translate(100 112)">${[0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => `<ellipse cx="0" cy="-26" rx="9" ry="20" fill="#fff" transform="rotate(${a})"/>`).join("")}<circle r="13" fill="#e8a317"/></g><path d="M100 138 V196" stroke="#4f8a45" stroke-width="5"/><path d="M100 176 C 78 162, 66 170, 64 180 C 80 186, 94 184, 100 176Z" fill="#5f9e55"/>`;
  else if (art === "carrot") pic = `<path d="M70 96 C 100 90, 130 96, 134 108 L 104 196 C 100 202, 98 202, 94 196 Z" fill="#e2823a"/><path d="M82 120 H 118 M88 146 H 112 M94 170 H 106" stroke="#a9541c" stroke-width="3" opacity=".5"/><g fill="#5f9e55"><ellipse cx="86" cy="86" rx="7" ry="22" transform="rotate(-18 86 86)"/><ellipse cx="102" cy="80" rx="7" ry="26"/><ellipse cx="118" cy="86" rx="7" ry="22" transform="rotate(18 118 86)"/></g>`;
  else if (art === "tulip") pic = `<path d="M70 96 C 70 130, 130 130, 130 96 L 118 114 L 100 90 L 82 114 Z" fill="#d94f5c"/><path d="M100 126 V196" stroke="#4f8a45" stroke-width="5"/><path d="M100 188 C 70 170, 62 150, 66 138 C 90 148, 100 168, 100 188Z" fill="#5f9e55"/>`;
  else pic = `<g fill="#4f8a45"><ellipse cx="100" cy="130" rx="26" ry="56"/><ellipse cx="68" cy="146" rx="20" ry="46" transform="rotate(-32 68 146)" fill="#5f9e55"/><ellipse cx="132" cy="146" rx="20" ry="46" transform="rotate(32 132 146)" fill="#5f9e55"/></g><path d="M100 90 V196" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>`;
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 12px 9px rgba(30,20,10,.4))`)}" viewBox="0 0 200 284" aria-hidden="true">
  <rect x="4" y="4" width="192" height="276" rx="5" fill="#f7f1e2"/><rect x="4" y="4" width="192" height="276" rx="5" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
  <rect x="4" y="4" width="192" height="46" rx="5" fill="${hue}"/><path d="M4 44 H196 V54 H4Z" fill="${hue}"/>${Array.from({ length: 13 }, (_, k) => `<path d="M${10 + k * 14.5} 56 l 7 -8 l 7 8Z" fill="#f7f1e2"/>`).join("")}<rect x="4" y="12" width="192" height="6" fill="#fff" opacity=".25"/>
  <rect x="26" y="70" width="148" height="190" rx="14" fill="#fff"/><rect x="26" y="70" width="148" height="190" rx="14" fill="none" stroke="${hue}" stroke-width="5"/>${pic}
  <rect x="48" y="226" width="104" height="8" rx="4" fill="${hue}" opacity=".55"/><rect x="62" y="242" width="76" height="6" rx="3" fill="#000" opacity=".1"/></svg>`;
}

/** A galvanised watering can, spout to the right. */
function wateringCan({ x, y, w = 300, rot = 0 }) {
  const h = w * 0.8;
  const g = nid("wc"), g2 = nid("wd");
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 11px rgba(10,30,30,.45))`)}" viewBox="0 0 300 240" aria-hidden="true"><defs>
  <linearGradient id="${g}" x1="0" x2="1"><stop offset="0" stop-color="#8f979e"/><stop offset=".3" stop-color="#e6eaed"/><stop offset=".6" stop-color="#b3bac0"/><stop offset="1" stop-color="#7d858c"/></linearGradient>
  <linearGradient id="${g2}" x1="0" x2="1"><stop offset="0" stop-color="#9aa2a9"/><stop offset=".5" stop-color="#e0e4e7"/><stop offset="1" stop-color="#8a9299"/></linearGradient></defs>
  <path d="M60 80 C 60 4, 176 4, 176 80" fill="none" stroke="#7d858c" stroke-width="14" stroke-linecap="round"/><path d="M60 80 C 60 10, 176 10, 176 80" fill="none" stroke="#dfe3e6" stroke-width="4" stroke-linecap="round" opacity=".7"/>
  <path d="M44 100 C -6 108, -4 196, 44 204" fill="none" stroke="#7d858c" stroke-width="14" stroke-linecap="round"/>
  <path d="M184 168 L 270 56 L 284 66 L 196 196 Z" fill="url(#${g2})"/><path d="M270 56 L284 66" stroke="#5f666c" stroke-width="3"/>
  <g transform="translate(282 52) rotate(-38)"><ellipse rx="26" ry="9" fill="#8f979e"/><ellipse rx="22" ry="6" cy="-3" fill="#e6eaed"/>${[-14, -7, 0, 7, 14].map((d) => `<circle cx="${d}" cy="-3" r="1.6" fill="#4a5056"/>`).join("")}</g>
  <path d="M38 84 H190 L198 216 C 198 230, 188 238, 174 238 H54 C 40 238, 30 230, 30 216 Z" fill="url(#${g})"/>
  <ellipse cx="114" cy="84" rx="76" ry="15" fill="#6c747a"/><ellipse cx="114" cy="86" rx="68" ry="11" fill="#2b3338"/>
  <path d="M34 126 H194 M33 168 H195" stroke="#5f666c" stroke-opacity=".5" stroke-width="3"/><path d="M34 128 H194 M33 170 H195" stroke="#fff" stroke-opacity=".5" stroke-width="2"/></svg>`;
}

/** A ball of garden twine. */
function twineBall({ x, y, r = 54, color = "#d4b684", rot = 0 }) {
  const wraps = [];
  for (let k = 0; k < 15; k++) wraps.push(`<path d="M ${r * 0.16} ${r * (0.3 + k * 0.09)} C ${r * 0.7} ${r * (0.1 + k * 0.1)}, ${r * 1.3} ${r * (0.1 + k * 0.1)}, ${r * 1.84} ${r * (0.3 + k * 0.09)}" fill="none" stroke="#7a5f34" stroke-opacity=".4" stroke-width="2.4"/>`);
  const g = nid("tb");
  return `<svg style="${at(x, y, r * 2.2, r * 2.2, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(30,20,10,.4))`)}" viewBox="0 0 ${r * 2.2} ${r * 2.2}" aria-hidden="true"><defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></radialGradient><clipPath id="${g}c"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath></defs>
  <circle cx="${r}" cy="${r}" r="${r}" fill="${color}"/><g clip-path="url(#${g}c)">${wraps.join("")}</g><circle cx="${r}" cy="${r}" r="${r}" fill="url(#${g})"/>
  <path d="M ${r * 1.8} ${r * 1.5} C ${r * 2.1} ${r * 1.7}, ${r * 2.1} ${r * 2.05}, ${r * 1.7} ${r * 2.1}" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** A yellow highlighter lying at an angle, cap to the left. */
function highlighter({ x, y, len = 380, rot = 0 }) {
  const h = 52;
  return `<svg style="${at(x, y, len, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 7px rgba(30,20,10,.4))`)}" viewBox="0 0 ${len} ${h}" aria-hidden="true">
  <rect x="4" y="6" width="${len * 0.34}" height="40" rx="12" fill="#e4c93a"/><rect x="4" y="6" width="${len * 0.34}" height="11" rx="8" fill="#fff" opacity=".35"/><rect x="${len * 0.3}" y="6" width="14" height="40" fill="#b99b1e"/>
  <rect x="${len * 0.34}" y="10" width="${len * 0.52}" height="32" rx="3" fill="#f3de5a"/><rect x="${len * 0.34}" y="10" width="${len * 0.52}" height="9" fill="#fff" opacity=".4"/><rect x="${len * 0.34}" y="34" width="${len * 0.52}" height="8" fill="#a98a14" opacity=".3"/>
  <path d="M${len * 0.86} 12 L ${len - 8} 20 V 32 L ${len * 0.86} 40Z" fill="#f6ec7a"/><path d="M${len - 20} 20 L ${len - 8} 22 V 30 L ${len - 20} 32Z" fill="#fff" opacity=".6"/></svg>`;
}

/** A till-style receipt slip: grey bars only, zig-zag edges. */
function receipt({ x, y, w = 200, h = 320, rot = 0, seed = 3 }) {
  const r = rng(seed);
  const bars = [];
  for (let k = 0; k < 11; k++) {
    const yy = 50 + k * ((h - 120) / 11);
    bars.push(`<rect x="22" y="${yy}" width="${60 + r() * (w - 150)}" height="9" rx="3" fill="#8a8d92" opacity=".55"/><rect x="${w - 76}" y="${yy}" width="52" height="9" rx="3" fill="#8a8d92" opacity=".55"/>`);
  }
  const zig = (yy, dir) => Array.from({ length: Math.floor(w / 14) }, (_, k) => `L ${(k + 0.5) * 14} ${yy + dir * 8} L ${(k + 1) * 14} ${yy}`).join(" ");
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(30,20,10,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <path d="M0 8 ${zig(8, -1)} V ${h - 8} ${Array.from({ length: Math.floor(w / 14) }, (_, k) => `L ${w - (k + 0.5) * 14} ${h} L ${w - (k + 1) * 14} ${h - 8}`).join(" ")} Z" fill="#fbfaf6"/>
  <rect x="22" y="22" width="${w * 0.5}" height="12" rx="3" fill="#1d1d20" opacity=".55"/>${bars.join("")}</svg>`;
}

/** A kraft hang tag tied up with twine from the top edge of the scene. */
function hangTag({ x, y, w = 270, h = 76, rot = 0, text, size = 30, from = SCENE_TOP }) {
  const hx = x + 24, hy = y + h / 2;
  const tag = `<div data-check="tag" style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(#d9bd8d,#c8a874);clip-path:polygon(0 50%,${h * 0.45}px 0,100% 0,100% 100%,${h * 0.45}px 100%);box-shadow:0 8px 10px rgba(30,20,10,.4);display:flex;align-items:center;padding-left:${h * 0.62}px;padding-right:18px;font:600 ${size}px/1 'Plex',sans-serif;color:#2a2013;white-space:nowrap;z-index:6;overflow:hidden`)}">${esc(text)}</div>`;
  const twine = `<svg style="${at(0, 0, 1000, 1500, "z-index:7;pointer-events:none")}" viewBox="0 0 1000 1500" aria-hidden="true"><path d="M${hx - 4} ${from} C ${hx + 10} ${y - 30}, ${hx - 14} ${hy - 30}, ${hx} ${hy}" fill="none" stroke="#7a5f34" stroke-width="4" stroke-linecap="round"/><circle cx="${hx}" cy="${hy}" r="8" fill="none" stroke="#7a5f34" stroke-width="3.5"/></svg>`;
  return tag + twine;
}

/** A sticky note. */
function sticky({ x, y, w, h, rot = 0, color = ["#f7de8e", "#f0d072"], body, size = 36 }) {
  return `<div data-check="note" style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(${color[0]},${color[1]});box-shadow:0 2px 3px rgba(0,0,0,.3),0 16px 20px rgba(0,0,0,.42);padding:18px 22px;display:flex;flex-direction:column;justify-content:center;font:600 ${size}px/1.12 'Hand',cursive;color:#2c2512;overflow:hidden;z-index:6`)}">${body}</div>`;
}

/** A white wooden plant label, pointed at the bottom edge. */
function stake({ x, y, w, h, rot = 0, body, tip = false }) {
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);z-index:6`)}"><div data-check="label" style="position:absolute;inset:0;background:linear-gradient(#fbf9f1,#ebe6d6);clip-path:${tip ? "polygon(0 0,100% 0,100% 100%,0 100%)" : "polygon(0 0,100% 0,100% 100%,0 100%)"};box-shadow:0 14px 18px rgba(0,0,0,.45);border-radius:6px;display:flex;align-items:center;padding:14px 30px;overflow:hidden">${body}</div>
  <div style="position:absolute;inset:0;border-radius:6px;box-shadow:inset 0 0 0 2px rgba(120,95,60,.28);pointer-events:none"></div></div>`;
}

/** A hand-drawn loop in the warm pop around a region (x, y, w, h in its own box). */
function loop({ x, y, w, h, color = POP, sw = 5, flip = false }) {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 6, ry = h / 2 - 5;
  const d = flip
    ? `M ${cx + rx * 0.9} ${cy - ry * 0.55} C ${cx + rx * 0.5} ${cy - ry * 1.15}, ${cx - rx * 0.7} ${cy - ry * 1.1}, ${cx - rx} ${cy - ry * 0.1} C ${cx - rx * 1.02} ${cy + ry * 0.9}, ${cx + rx * 0.4} ${cy + ry * 1.15}, ${cx + rx * 0.98} ${cy + ry * 0.2} C ${cx + rx * 1.04} ${cy - ry * 0.6}, ${cx + rx * 0.3} ${cy - ry * 1.0}, ${cx - rx * 0.4} ${cy - ry * 0.95}`
    : `M ${cx - rx * 0.85} ${cy - ry * 0.6} C ${cx - rx * 0.4} ${cy - ry * 1.2}, ${cx + rx * 0.8} ${cy - ry * 1.1}, ${cx + rx} ${cy - ry * 0.05} C ${cx + rx * 1.02} ${cy + ry * 0.95}, ${cx - rx * 0.5} ${cy + ry * 1.18}, ${cx - rx * 0.98} ${cy + ry * 0.15} C ${cx - rx * 1.05} ${cy - ry * 0.65}, ${cx - rx * 0.3} ${cy - ry * 1.02}, ${cx + rx * 0.45} ${cy - ry * 0.98}`;
  return `<svg style="${at(x, y, w, h, "overflow:visible;z-index:5")}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A sprig of seedlings in the soil. */
function sprouts({ x, y, s = 1, rot = 0 }) {
  return `<svg style="${at(x, y, 80 * s, 70 * s, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(0,0,0,.4))`)}" viewBox="0 0 80 70" aria-hidden="true"><path d="M40 68 C 40 50, 38 36, 40 22" stroke="#7fb86a" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M40 28 C 18 8, 2 18, 2 32 C 22 38, 34 36, 40 28Z" fill="#8cc873"/><path d="M40 24 C 60 2, 78 12, 78 28 C 58 34, 46 32, 40 24Z" fill="#6fb05b"/><path d="M12 24 C 26 26, 34 28, 38 28" stroke="#fff" stroke-opacity=".35" fill="none" stroke-width="1.6"/></svg>`;
}

/* ================================================================== #6 */

/** A statement sheet made of grey placeholder bars only. `rows` is an array of "bar" | "gap" | { real: [a,b,c] }. */
function sheetBase({ x, y, w, h, rot = 0, z = 1, body = "", shade = true }) {
  return `<div style="${at(x, y, w, h, `transform:rotate(${rot}deg);background:linear-gradient(#fdfcf8,#f4f1e8);border-radius:3px;box-shadow:${shade ? PAPER_SHADOW : "0 1px 2px rgba(30,20,10,.3)"};z-index:${z};overflow:hidden`)}">${body}</div>`;
}
const bar = (x, y, w, c = "#d3d6d2", hh = 14) => `<div style="${at(x, y, w, hh, `background:${c};border-radius:4px`)}"></div>`;

function pin6() {
  const i = idea(6);
  check(i.items[0] === "Fitness app | Once a year | $79.99" && i.items[1] === "Antivirus | Once a year | $59.99", "idea 6 is not the one this scene was drawn for");
  const [r1, r2] = [i.items[0], i.items[1]].map((s) => s.split(" | "));
  const note = i.items[2];

  // Left: three months of statements, a short stack. No annual rows, just gaps where they would be.
  const LW = 360, LH = 470;
  const leftRows = (() => {
    let s = bar(24, 26, 150, "#9aa39c", 18) + bar(LW - 80, 26, 56, "#9aa39c", 18);
    for (let k = 0; k < 8; k++) {
      const yy = 76 + k * 48;
      if (k === 2 || k === 5) s += `<div style="${at(16, yy - 10, LW - 32, 40, "border:2.5px dashed #b9bfb8;border-radius:8px")}"></div>`;
      else s += bar(24, yy, 90 + ((k * 37) % 70)) + bar(190, yy, 70) + bar(LW - 80, yy, 56);
    }
    return s;
  })();
  const leftStack = [
    sheetBase({ x: 62, y: 506, w: LW, h: LH, rot: 2.2, z: 1, shade: true }),
    sheetBase({ x: 50, y: 500, w: LW, h: LH, rot: -2.6, z: 2, shade: true }),
    sheetBase({ x: 56, y: 492, w: LW, h: LH, rot: 0.8, z: 3, body: leftRows }),
  ].join("");

  // Right: a full year, a tall stack, the top sheet shows the two once-a-year rows circled.
  const RW = 540, RH = 600, RX = 424, RY = 486;
  const ROW0 = 96, RH_ = 56;
  const cols = [46, 190, 360];
  const rows = ["bar", "bar", "bar", { real: r1 }, "bar", "bar", { real: r2 }, "bar", "bar"];
  let rightBody = `<div style="${at(0, 0, RW, 70, "background:#e6ebe6;border-bottom:2px solid #c8d6cd")}"></div>`;
  ["Charge", "How often", "What you see"].forEach((t, k) => { rightBody += `<div style="${at(cols[k], 22, 170, 30, "font:600 22px/1 'Plex',sans-serif;letter-spacing:.06em;color:#4b5a52;white-space:nowrap")}">${esc(t)}</div>`; });
  rows.forEach((row, k) => {
    const yy = ROW0 + k * RH_;
    if (row === "bar") rightBody += bar(cols[0], yy + 20, 100 + ((k * 41) % 60)) + bar(cols[1], yy + 20, 90) + bar(cols[2], yy + 20, 72) + `<div style="${at(14, yy + RH_ - 2, RW - 28, 1, "background:#e3e6e0")}"></div>`;
    else row.real.forEach((t, c) => { rightBody += `<div style="${at(cols[c], yy + 8, c === 0 ? 180 : 156, 40, `font:${c === 0 ? 600 : 500} 26px/40px 'Plex',sans-serif;color:#1d1d20;white-space:nowrap`)}">${esc(t)}</div>`; });
  });
  const circles = [3, 6].map((k, m) => loop({ x: RX - 2, y: RY + ROW0 + k * RH_ - 6, w: RW + 4, h: RH_ + 12, flip: m === 1 })).join("");
  // sheet edges: a deep stack for twelve months
  let edges = "";
  for (let k = 7; k >= 1; k--) edges += sheetBase({ x: RX + k * 1.6, y: RY + k * 7, w: RW, h: RH, rot: 1, z: 1, shade: k === 7 });
  const rightTop = sheetBase({ x: RX, y: RY, w: RW, h: RH, rot: 1, z: 3, body: rightBody });

  const tagL = hangTag({ x: 110, y: 396, w: 262, h: 72, rot: -3, text: "Three months", size: 30 });
  const tagR = hangTag({ x: 500, y: 396, w: 262, h: 72, rot: 3, text: "A full year", size: 30 });

  const noteCard = `<div data-check="note" style="${at(48, 1136, 640, 118, `transform:rotate(-1.2deg);background:linear-gradient(#e2c896,#cfae78);border-radius:10px;box-shadow:${PAPER_SHADOW};padding:0 34px;display:flex;align-items:center;font:500 33px/1.18 'Plex',sans-serif;color:#2a2013;overflow:hidden;z-index:6`)}">${esc(note.charAt(0).toUpperCase() + note.slice(1))}</div>`;

  const scene = `
  ${boards({ n: 7, alts: ["#a9a79d", "#b4b2a8", "#a09e94", "#aeaca2"], gap: "#37352f", seed: 5, grain: "#5c5a50", grainOp: 0.26, light: 0.22, dark: 0.36, chips: 8, chip: "#d9d6c9", knots: 6 })}
  ${leftStack}${edges}${rightTop}${circles}
  ${EXAMPLE(`position:absolute;left:${RX + RW - 160}px;top:${RY - 66}px;z-index:7;transform:rotate(2deg)`)}
  ${tagL}${tagR}
  ${noteCard}
  ${pot({ x: 745, y: 1130, w: 190, rot: 2, plant: "leaf", seed: 4 })}
  ${trowel({ x: 40, y: 1262, len: 420, rot: -4 })}
  ${packet({ x: 520, y: 1236, w: 130, rot: 12, hue: "#e8c15a", art: "daisy", z: 2 })}
  ${twineBall({ x: 480, y: 1250, r: 38 })}`;
  return printable({ n: 6, scene, paper: "#e3e6df" });
}

/* ================================================================== #8 */

function pin8() {
  const i = idea(8);
  check(i.items.length === 4 && i.items[3] === "Total | $553.50", "idea 8 is not the one this scene was drawn for");
  const rows = i.items.slice(0, 3).map((s) => { const [name, how, small, year] = s.split(" | "); return { name, how, small, year: year.replace(" a year", "") }; });
  check(rows.every((r) => /^\$/.test(r.small) && /^\$/.test(r.year)), "idea 8 rows changed");
  const total = i.items[3].split(" | ")[1];
  const hues = ["#e8c15a", "#9fcfb0", "#e9a9b4"];
  const PW = 900, PH = 156, PX = 50;
  let packets = "";
  rows.forEach((r, k) => {
    const y = 470 + k * 172;
    packets += `<div style="${at(PX, y, PW, PH, `transform:rotate(${[-0.7, 0.6, -0.4][k]}deg);background:linear-gradient(#fbf6e8,#f1ead6);border-radius:8px;box-shadow:0 2px 3px rgba(10,30,30,.3),0 16px 24px rgba(10,30,30,.4);overflow:hidden;z-index:3`)}">
      <div style="${at(0, 0, 26, PH, `background:${hues[k]}`)}"></div>
      <div style="${at(26, 0, 6, PH, "background:#fff;opacity:.5")}"></div>
      <div data-check="name" style="${at(58, 22, 400, 44, "font:600 33px/44px 'Plex',sans-serif;color:#1d1d20;white-space:nowrap")}">${esc(r.name)}</div>
      <div style="${at(58, 80, 400, 56, "display:flex;align-items:baseline;gap:18px;white-space:nowrap")}"><span style="font:500 40px/1 'Plex',sans-serif;color:#7b7e80">${esc(r.small)}</span><span style="font:500 26px/1 'Plex',sans-serif;color:#7b7e80">${esc(r.how)}</span></div>
      <div style="${at(470, 20, 2, PH - 40, "background:repeating-linear-gradient(#b9c4bd 0 8px,transparent 8px 15px)")}"></div>
      <div style="${at(510, 0, 370, PH, "display:flex;align-items:baseline;gap:12px;white-space:nowrap;padding-top:40px")}"><span style="font:600 68px/1 'Newsreader',Georgia,serif;color:${C.forest};letter-spacing:-.02em">${esc(r.year)}</span><span style="font:500 28px/1 'Plex',sans-serif;color:#2b4a3f">a year</span></div>
      </div>
      <div style="${at(PX + PW / 2 - 14, y - 10, 28, 28, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff9d80,#b8371c);box-shadow:0 5px 6px rgba(0,0,0,.4);z-index:5")}"></div>`;
  });
  const colLabel = (x, t) => `<div data-check="label" style="${at(x, 398, 330, 52, "background:linear-gradient(#d9bd8d,#c8a874);border-radius:6px;box-shadow:0 8px 10px rgba(10,30,30,.4);font:600 28px/52px 'Plex',sans-serif;color:#2a2013;text-align:center;z-index:6;white-space:nowrap;overflow:hidden")}">${esc(t)}</div>`;
  const plaque = `<div style="${at(50, 984, 520, 108, `transform:rotate(-0.6deg);background:linear-gradient(#c99b66,#b0834d);border-radius:8px;box-shadow:${PAPER_SHADOW};padding:10px;z-index:4`)}"><div data-check="total" style="width:100%;height:100%;background:#fffdf6;border:4px solid ${C.forest};border-radius:6px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;overflow:hidden"><span style="font:600 36px/1 'Plex',sans-serif;color:#1d1d20">Total</span><span style="font:600 62px/1 'Newsreader',Georgia,serif;color:${C.forest};letter-spacing:-.02em">${esc(total)}</span></div></div>`;
  const shelf = `<svg style="${at(0, 1196, 1000, 160)}" viewBox="0 0 1000 160" aria-hidden="true"><defs><linearGradient id="shf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0b97f"/><stop offset="1" stop-color="#c99b66"/></linearGradient></defs>
    <rect width="1000" height="150" fill="#6d4f2c"/><rect width="1000" height="40" fill="url(#shf)"/><rect y="38" width="1000" height="5" fill="#fff" opacity=".3"/><rect y="43" width="1000" height="107" fill="#b98c55"/><path d="M0 70 C 300 62, 700 80, 1000 68 M0 108 C 300 100, 700 118, 1000 106" stroke="#7d5a30" stroke-opacity=".35" stroke-width="3" fill="none"/></svg>
    <div style="${at(0, 1190, 1000, 30, "background:linear-gradient(rgba(0,0,0,.35),transparent);z-index:2")}"></div>`;
  const scene = `
  ${boards({ vertical: true, n: 10, alts: ["#a9cfc7", "#9fc7bf", "#b3d5ce", "#a4cbc3"], gap: "#44706a", gapW: 4, seed: 9, nails: false, knots: 2, grain: "#4d807a", grainOp: 0.2, light: 0.28, dark: 0.3, chips: 26, chip: "#f2ede0" })}
  ${colLabel(50, "What you see")}${colLabel(520, "Cost per year")}
  ${packets}
  ${plaque}
  ${EXAMPLE(`position:absolute;left:592px;top:1020px;z-index:7;transform:rotate(1.5deg)`)}
  ${shelf}
  ${pot({ x: 60, y: 1082, w: 118, plant: "sprout", seed: 2, tone: "#d0794f" })}
  ${pot({ x: 196, y: 1104, w: 100, plant: "leaf", seed: 8, tone: "#bd6542" })}
  ${wateringCan({ x: 690, y: 1040, w: 285, rot: -2 })}
  ${twineBall({ x: 330, y: 1118, r: 40 })}`;
  return printable({ n: 8, scene, paper: "#e2eeea", extraCss: ".top h1{font-size:72px}.top p{font-size:25px;max-width:900px}" });
}

/* ================================================================== #12 */

function pin12() {
  const i = idea(12);
  check(i.items.length === 5 && i.items[0].startsWith("Apple.com/bill | "), "idea 12 is not the one this scene was drawn for");
  const rows = i.items.map((s) => s.split(" | "));
  const SX = 52, SY = 424, SW = 896, HEAD = 70, RH_ = 134;
  const SH = HEAD + rows.length * RH_ + 18;
  let body = `<div style="${at(0, 0, SW, HEAD, "background:#e6ebe6;border-bottom:2px solid #c8d6cd")}"></div>
    <div style="${at(30, 20, 360, 32, "font:600 22px/32px 'Plex',sans-serif;letter-spacing:.05em;color:#4b5a52;white-space:nowrap")}">What the line looks like</div>
    <div style="${at(452, 20, 400, 32, "font:600 22px/32px 'Plex',sans-serif;letter-spacing:.05em;color:#4b5a52;white-space:nowrap")}">What it usually is</div>`;
  rows.forEach(([line, mean], k) => {
    const y = HEAD + k * RH_;
    body += `<div style="${at(0, y + RH_ - 1, SW, 1.5, "background:#dde5de")}"></div>
    <div data-check="line" style="${at(30, y + 17, 350, RH_ - 34, "background:linear-gradient(#f2f1ec,#e7e6df);border-top:2.5px dashed #b6b3a6;border-bottom:2.5px dashed #b6b3a6;display:flex;align-items:center;padding:0 16px;font:500 25px/1.22 'Plex Mono',ui-monospace,monospace;color:#26262a;overflow:hidden")}">${esc(line)}</div>
    <div style="${at(380, y + RH_ / 2 - 1, 54, 2.5, `background:${C.forest}`)}"></div>
    <div style="${at(373, y + RH_ / 2 - 8, 14, 14, `border-radius:50%;background:${C.forest}`)}"></div><div style="${at(427, y + RH_ / 2 - 8, 14, 14, `border-radius:50%;background:${C.forest}`)}"></div>
    <div data-check="meaning" style="${at(456, y + 12, 410, RH_ - 24, `display:flex;align-items:center;font:${k === 4 ? 600 : 500} 28px/1.25 'Plex',sans-serif;color:#1d1d20;overflow:hidden`)}">${esc(mean)}</div>`;
  });
  const sheetEl = `<div style="${at(SX, SY, SW, SH, `transform:rotate(-1deg);background:linear-gradient(#fdfcf8,#f5f2e9);border-radius:4px;box-shadow:${PAPER_SHADOW};overflow:hidden;z-index:3`)}">${body}</div>`;
  const scene = `
  ${burlap()}
  ${sheetEl}
  ${receipt({ x: 62, y: 1200, w: 190, h: 270, rot: 8, seed: 5 })}
  ${highlighter({ x: 290, y: 1252, len: 400, rot: -6 })}
  ${packet({ x: 622, y: 1222, w: 110, rot: 16, hue: "#9fcfb0", art: "leaf", z: 4 })}
  ${pot({ x: 770, y: 1196, w: 190, rot: 3, plant: "leaf", seed: 13 })}`;
  return printable({ n: 12, scene, paper: "#efe5cf", extraCss: ".top h1{font-size:68px}.top p{font-size:26px}" });
}

/* ================================================================== #14 */

function pin14() {
  const i = idea(14);
  check(i.items[0] === "Fitness app | $79.99 | Annual | Nov 14 | Planned to cancel", "idea 14 is not the one this scene was drawn for");
  const [name, charge, cycle, renews, decision] = i.items[0].split(" | ");
  const line2 = i.items[1];
  const SX = 40, SY = 428, SW = 920, SH = 336;
  const x0 = 82, x1 = SW - 82, base = 214;
  let ticks = "";
  for (let d = 0; d <= 14; d++) {
    const xx = x0 + (x1 - x0) * (d / 14), big = d === 0 || d === 14;
    ticks += `<div style="${at(xx - 1.5, base - (big ? 26 : 14), 3, big ? 52 : 28, `background:${big ? "#1d1d20" : "#7a8a80"};border-radius:2px`)}"></div>`;
  }
  const strip = `<div style="${at(SX, SY, SW, SH, `transform:rotate(-0.8deg);background:linear-gradient(#fdfcf8,#f5f2e9);border-radius:4px;box-shadow:${PAPER_SHADOW};z-index:3`)}">
    <div style="${at(x0 - 40, 30, 380, 30, `font:600 24px/30px 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.forest}`)}">Heads-up</div>
    <div data-check="date" style="${at(x0 - 40, 62, 400, 70, "font:600 62px/70px 'Newsreader',Georgia,serif;color:#1d1d20;white-space:nowrap;letter-spacing:-.01em")}">October 31</div>
    <div style="${at(SW - 40 - 380, 30, 380, 30, `font:600 24px/30px 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${POP};text-align:right`)}">Renews ${esc(charge)}</div>
    <div data-check="date" style="${at(SW - 40 - 400, 62, 400, 70, `font:600 62px/70px 'Newsreader',Georgia,serif;color:${POP};text-align:right;white-space:nowrap;letter-spacing:-.01em`)}">November 14</div>
    <div style="${at(x0, base - 2, x1 - x0, 4, "background:#1d1d20;border-radius:2px")}"></div>${ticks}
    <div style="${at(x0 - 18, base - 18, 36, 36, `border-radius:50%;background:${C.forest};box-shadow:0 0 0 5px #fdfcf8,0 0 0 8px ${C.forest}`)}"></div>
    <div style="${at(x1 - 18, base - 18, 36, 36, `border-radius:50%;background:${POP};box-shadow:0 0 0 5px #fdfcf8,0 0 0 8px ${POP}`)}"></div>
    <svg style="${at(x0, base + 30, x1 - x0, 40)}" viewBox="0 0 ${x1 - x0} 40" aria-hidden="true"><path d="M2 4 C 2 30, ${(x1 - x0) / 2 - 20} 22, ${(x1 - x0) / 2} 36 C ${(x1 - x0) / 2 + 20} 22, ${x1 - x0 - 2} 30, ${x1 - x0 - 2} 4" fill="none" stroke="#1d1d20" stroke-width="3.5" stroke-linecap="round"/></svg>
    <div style="${at(0, base + 70, SW, 44, "font:600 38px/44px 'Hand',cursive;color:#1d1d20;text-align:center")}">two weeks</div>
  </div>`;
  const sticky1 = sticky({ x: 58, y: 740, w: 300, h: 190, rot: -4, body: `<div>${esc(decision)}</div>`, size: 50 });
  const row = [["Name", name], ["Charge", charge], ["Cycle", cycle], ["Renews", renews]];
  const card = `<div style="${at(404, 806, 548, 262, `transform:rotate(1deg);background:linear-gradient(#fbf6e8,#f1ead6);border-radius:8px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 18px 26px rgba(0,0,0,.5);overflow:hidden;z-index:4`)}">
    <div style="${at(0, 0, 548, 12, `background:${C.forest}`)}"></div>
    ${row.map(([k, v], m) => `<div style="${at(30, 30 + m * 56, 490, 50, "display:flex;align-items:baseline;border-bottom:1.5px solid #ddd4bd;white-space:nowrap")}"><span style="font:600 22px/1 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#6b6a5f;width:150px">${esc(k)}</span><span style="font:600 ${m === 0 ? 36 : 36}px/1 'Plex',sans-serif;color:#1d1d20">${esc(v)}</span></div>`).join("")}
  </div>`;
  const label = stake({ x: 56, y: 1110, w: 890, h: 122, rot: -0.8, body: `<div style="font:500 33px/1.22 'Plex',sans-serif;color:#2a2013">${esc(line2)}</div>` });
  const scene = `
  ${soil(14)}
  ${strip}
  ${EXAMPLE(`position:absolute;left:${SX + SW - 150}px;top:${SY + SH + 14}px;z-index:7;transform:rotate(-1deg);display:none`)}
  ${sticky1}${card}${label}
  ${EXAMPLE(`position:absolute;left:${404 + 548 - 150}px;top:${806 - 40}px;z-index:7;transform:rotate(2deg)`)}
  ${sprouts({ x: 640, y: 1250, s: 1.1, rot: 6 })}${sprouts({ x: 760, y: 1262, s: 0.9, rot: -8 })}
  ${trowel({ x: 70, y: 1262, len: 400, rot: -3 })}
  ${packet({ x: 560, y: 1222, w: 110, rot: -14, hue: "#e9a9b4", art: "tulip", z: 2 })}
  ${pot({ x: 830, y: 1222, w: 150, plant: "none", seed: 3, tone: "#b85f3c", rot: 4 })}`;
  return printable({ n: 14, scene, paper: "#efe6dc", extraCss: ".top h1{font-size:70px}.top p{font-size:25px;line-height:1.3;max-width:900px}" });
}

/* ================================================================== #16 */

function pin16() {
  const i = idea(16);
  const quote = i.items[0];
  check(quote.includes("renewal date"), "idea 16 is not the one this scene was drawn for");
  const [a, b] = quote.split("renewal date");
  const CX = 62, CY = 460, CW = 876, CH = 580;
  const ruled = Array.from({ length: 9 }, (_, k) => `<div style="${at(0, 120 + k * 52, CW, 2, "background:rgba(255,255,255,.13)")}"></div>`).join("");
  const card = `<div style="${at(CX, CY, CW, CH, `transform:rotate(-2deg);background:linear-gradient(135deg,${C.forest},${C.forestDeep});border-radius:10px;box-shadow:0 3px 4px rgba(40,20,5,.35),0 26px 42px rgba(40,20,5,.5);overflow:hidden;z-index:4`)}">
    <div style="${at(0, 62, CW, 4, "background:#ffb866;opacity:.9")}"></div>${ruled}
    <div style="${at(0, 0, CW, 8, "background:rgba(255,255,255,.14)")}"></div>
    <div data-check="quote" style="${at(60, 96, CW - 120, CH - 130, "font:500 72px/1.18 'Newsreader',Georgia,serif;color:#f6f3ea;letter-spacing:-.01em;overflow:hidden;text-shadow:0 2px 0 rgba(0,0,0,.18)")}">${esc(a)}<span style="color:#ffb866;font-style:italic;margin:0 .12em">renewal date</span>${esc(b)}</div>
  </div>`;
  const scene = `
  ${boards({ n: 8, alts: ["#d9ae72", "#cfa267", "#e0b87d", "#d3a86d"], gap: "#3a2713", gapW: 7, seed: 31, nails: true, knots: 6, grain: "#8a6234", grainOp: 0.3, light: 0.3, dark: 0.34 })}
  ${card}
  ${pencil16({ x: 470, y: 1004, len: 450, rot: -6 })}
  ${packet({ x: 52, y: 1086, w: 150, rot: -10, hue: "#e8c15a", art: "daisy", z: 2 })}
  ${packet({ x: 168, y: 1100, w: 150, rot: 5, hue: "#9fcfb0", art: "leaf", z: 3 })}
  ${packet({ x: 280, y: 1090, w: 150, rot: 14, hue: "#e2823a", art: "carrot", z: 2 })}
  ${twineBall({ x: 440, y: 1150, r: 46 })}
  ${pot({ x: 735, y: 1100, w: 220, rot: 2, plant: "leaf", seed: 17 })}`;
  return printable({ n: 16, scene, paper: "#f1e7cf" });
}

/** The kit's pencil, drawn here so the group owns its look (a garden-label pencil in green). */
function pencil16({ x, y, len = 420, rot = 0 }) {
  const w = len, h = 30;
  return `<svg style="${at(x, y, w, h, `transform:rotate(${rot}deg);z-index:6;filter:drop-shadow(0 9px 7px rgba(40,20,5,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="46" y="3" width="${w - 100}" height="24" rx="2" fill="#2f6b57"/><rect x="46" y="3" width="${w - 100}" height="7" fill="#5f9e86" opacity=".7"/><rect x="46" y="20" width="${w - 100}" height="7" fill="#0f2f27" opacity=".5"/>
    <rect x="${w - 54}" y="3" width="16" height="24" fill="#c3c6cb"/><rect x="${w - 38}" y="3" width="26" height="24" rx="8" fill="#e9a9b4"/>
    <path d="M46 3 L2 15 L46 27 Z" fill="#e9c9a0"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;
}

export const pins = [pin6(), pin8(), pin12(), pin14(), pin16()];
