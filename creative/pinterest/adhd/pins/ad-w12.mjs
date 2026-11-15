/**
 * ADHD Life Companion guide pins, world w12: brain-fog evening.
 * A sofa arm, a throw blanket, a rainy window, a mug, a lamp's soft glow, a phone face down,
 * a knitted cushion; dusk blue, warm grey, a candle. Calm and soft, never a drawing of a head.
 *
 * #67 template-preview  a walnut side table at dusk: the lamp glowing, the five-line note on a cream card, a blue folder and a pen
 * #71 comparison        a window seat: rain on the glass, a knitted cushion, two tall columns on the linen cushion, the right one ringed
 * #73 script-card       a cable-and-stitch knit throw close up: five cream cards cascading, a phone face down and a pen
 * #75 quote-card        a rainy window at dusk, a big cream card leaning on the sill, a closed folder, a mug and a candle
 * #77 scenario          a grey rainy-day desk from above: a planner with a full Tuesday and an empty Thursday, a mug and an envelope
 * #79 before-after      a wooden bedside tray on a quilted duvet: a page left alone, three untouched weeks, a crowded tracker page
 *
 * Every picture here is drawn (flat vector); no app screen and no book page is used.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { mug, desk } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const SCENE_TOP = 372;
const INK = "#231a1f";
const MUL = C.mulberry;
const MULD = C.mulberryDeep;
const rng = (seed) => {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
};
const split1 = (s) => {
  const k = s.indexOf(": ");
  return [s.slice(0, k), s.slice(k + 2)];
};

/** The paper header block (eyebrow, headline, optional sub) and footer band every pin here shares. */
function frame(i, { paper, size = 72, sub = null, textTop = 62, shadow = "rgba(15,20,40,.4)" }) {
  const at = i.headline.indexOf(": ");
  const eyebrow = at > 0 ? i.headline.slice(0, at) : null;
  const head = at > 0 ? i.headline.slice(at + 2) : i.headline;
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${SCENE_TOP}px;background:${paper};box-shadow:0 8px 22px ${shadow};z-index:30}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px ${shadow};z-index:30}
  .foot{z-index:32}
  .top{position:absolute;left:64px;right:64px;top:${textTop}px;z-index:31}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;text-wrap:balance;margin-top:14px;color:${INK}}
  .top p{font-size:27px;line-height:1.35;margin-top:14px;color:#4a4350;max-width:850px}
  .example{background:#fffdf8;color:#4a4350}`;
  const html = `<div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${SCENE_TOP - 6}">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { css, html };
}

const exampleTag = (style = "") => `<span class="example" style="font-size:24px;padding:5px 12px;${style}">Example</span>`;

/* ------------------------------------------------------------ shared props */

/** Rain on dusk glass: a sky gradient, blurred warm lights far away, then drops and trails. */
function glass({ x, y, w, h, stops, seed = 1, drops = 80, trails = 16, bokeh = 12, bokehY = 0.35, dropStroke = "rgba(255,255,255,.28)", dropTop = "rgba(0,0,10,.22)", dropBot = "rgba(255,255,255,.34)", trailC = "rgba(255,255,255,.22)", z = 1 }) {
  const r = rng(seed);
  const cols = ["255,196,110", "255,224,160", "255,150,120", "255,236,200", "170,200,255"];
  const bk = Array.from({ length: bokeh }, () => {
    const s = 26 + r() * 70;
    const c = cols[Math.floor(r() * cols.length)];
    return `<i style="position:absolute;left:${(r() * (w - s)).toFixed(0)}px;top:${(h * bokehY + r() * h * (1 - bokehY) - s / 2).toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;border-radius:50%;background:radial-gradient(circle,rgba(${c},.85),rgba(${c},.45) 60%,rgba(${c},.25));filter:blur(${(3 + r() * 6).toFixed(1)}px);opacity:${(0.35 + r() * 0.4).toFixed(2)}"></i>`;
  }).join("");
  let d = "";
  for (let k = 0; k < trails; k++) {
    const tx = r() * w, ty = r() * h * 0.6, len = 60 + r() * 220;
    d += `<path d="M${tx.toFixed(1)} ${ty.toFixed(1)} q 4 ${(len * 0.5).toFixed(0)} -2 ${len.toFixed(0)}" stroke="${trailC}" stroke-width="${(1.6 + r() * 1.6).toFixed(1)}" fill="none" stroke-linecap="round"/>`;
  }
  for (let k = 0; k < drops; k++) {
    const cx = r() * w, cy = r() * h, ry = 4 + r() * 10, rx = ry * 0.72;
    const el = r() < 0.4 ? 1.5 : 1;
    d += `<g><ellipse cx="${cx.toFixed(1)}" cy="${(cy + 2).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(ry * el).toFixed(1)}" fill="rgba(0,0,0,.16)"/><ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${(ry * el).toFixed(1)}" fill="url(#dg${seed})" stroke="${dropStroke}" stroke-width="1"/><ellipse cx="${(cx - rx * 0.32).toFixed(1)}" cy="${(cy - ry * el * 0.36).toFixed(1)}" rx="${(rx * 0.28).toFixed(1)}" ry="${(ry * 0.22).toFixed(1)}" fill="#fff" fill-opacity=".8"/></g>`;
  }
  return `<div style="${abs(x, y, w, h, `overflow:hidden;background:linear-gradient(${stops});z-index:${z}`)}">${bk}<svg style="position:absolute;left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><defs><linearGradient id="dg${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dropTop}"/><stop offset="1" stop-color="${dropBot}"/></linearGradient></defs>${d}</svg></div>`;
}

/** A knitted surface (rows of V stitches) with soft shading; used for the throw and the cushions. */
function knit({ x, y, w, h, rot = 0, base, light, dark, radius = 0, id, vs = 20, shadow = true, shade = "rgba(20,15,30,.35)", z = 1, rib = null }) {
  const th = vs * 1.12;
  const v = `M${vs * 0.1} ${vs * 0.12} L${vs * 0.5} ${vs * 0.88} L${vs * 0.9} ${vs * 0.12}`;
  const ribs = rib
    ? Array.from({ length: Math.floor(w / rib) }, (_, k) => `<rect x="${k * rib + rib * 0.1}" y="0" width="${rib * 0.22}" height="${h}" fill="rgba(0,0,0,.12)"/>`).join("")
    : "";
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};${shadow ? "filter:drop-shadow(0 16px 14px rgba(10,10,30,.42));" : ""}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <defs>
   <pattern id="${id}" width="${vs}" height="${th}" patternUnits="userSpaceOnUse"><rect width="${vs}" height="${th}" fill="${base}"/>
    <path d="${v}" fill="none" stroke="${dark}" stroke-width="${vs * 0.34}" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${vs * 0.1})"/>
    <path d="${v}" fill="none" stroke="${light}" stroke-width="${vs * 0.24}" stroke-linecap="round" stroke-linejoin="round"/></pattern>
   <clipPath id="${id}c"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>
   <radialGradient id="${id}g" cx="35%" cy="25%" r="85%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${shade}"/></radialGradient>
  </defs>
  <g clip-path="url(#${id}c)"><rect width="${w}" height="${h}" fill="url(#${id})"/>${ribs}<rect width="${w}" height="${h}" fill="url(#${id}g)"/></g></svg>`;
}

/** A phone lying face down: the plain back with its camera bump. */
function phoneBack({ x, y, w = 180, h = 370, rot = 0, color = "#2d3340", z = 3 }) {
  const r = w * 0.17;
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};border-radius:${r}px;background:linear-gradient(145deg,${color}ee,${color});box-shadow:0 2px 3px rgba(0,0,0,.4),0 20px 26px rgba(0,0,0,.45),inset 0 0 0 3px rgba(255,255,255,.1),inset 0 0 0 7px rgba(0,0,0,.18)`)}">
   <div style="position:absolute;left:${w * 0.1}px;top:${w * 0.1}px;width:${w * 0.46}px;height:${w * 0.46}px;border-radius:${w * 0.12}px;background:rgba(0,0,0,.38);box-shadow:inset 0 0 0 2px rgba(255,255,255,.12)">
    <i style="position:absolute;left:${w * 0.06}px;top:${w * 0.06}px;width:${w * 0.15}px;height:${w * 0.15}px;border-radius:50%;background:#12141a;box-shadow:0 0 0 3px rgba(255,255,255,.14)"></i>
    <i style="position:absolute;left:${w * 0.06}px;top:${w * 0.25}px;width:${w * 0.15}px;height:${w * 0.15}px;border-radius:50%;background:#12141a;box-shadow:0 0 0 3px rgba(255,255,255,.14)"></i>
    <i style="position:absolute;left:${w * 0.26}px;top:${w * 0.15}px;width:${w * 0.13}px;height:${w * 0.13}px;border-radius:50%;background:#12141a;box-shadow:0 0 0 3px rgba(255,255,255,.14)"></i>
   </div>
   <div style="position:absolute;left:${w * 0.34}px;top:${h * 0.55}px;width:${w * 0.32}px;height:${w * 0.32}px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.08)"></div></div>`;
}

/** A mug seen from the side, with a little steam. */
function mugSide({ x, y, s = 1, color = "#e9e1d6", drink = "#3a2a22", steam = true, z = 4 }) {
  const w = 200 * s, h = 190 * s;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};filter:drop-shadow(0 12px 8px rgba(10,10,30,.4))`)}" viewBox="0 0 200 190" aria-hidden="true">
  ${steam ? `<path d="M62 24 C 50 12 74 4 62 -8 M92 26 C 80 12 104 6 92 -8" transform="translate(0 20)" stroke="#fff" stroke-opacity=".38" stroke-width="5" fill="none" stroke-linecap="round"/>` : ""}
  <path d="M148 76 C 196 70 198 142 142 144" fill="none" stroke="${color}" stroke-width="17" stroke-linecap="round"/>
  <path d="M20 50 L152 50 L144 170 Q142 182 128 182 L44 182 Q30 182 28 170 Z" fill="${color}"/>
  <path d="M20 50 L36 50 L40 182 L28 170 Z" fill="#fff" opacity=".4"/><path d="M120 50 L152 50 L144 170 Q142 182 128 182 L118 182 Z" fill="#000" opacity=".1"/>
  <ellipse cx="86" cy="50" rx="66" ry="12" fill="${color}"/><ellipse cx="86" cy="51" rx="58" ry="8.5" fill="${drink}"/></svg>`;
}

/** A candle in a glass jar with a small flame (the glow is added by the scene). */
function candleJar({ x, y, s = 1, z = 4 }) {
  const w = 130 * s, h = 220 * s;
  return `<svg style="${abs(x, y, w, h, `z-index:${z};overflow:visible;filter:drop-shadow(0 10px 8px rgba(10,10,30,.4))`)}" viewBox="0 0 130 220" aria-hidden="true">
  <rect x="10" y="108" width="110" height="106" rx="14" fill="#c9d6e6" fill-opacity=".3" stroke="#e4ecf5" stroke-opacity=".55" stroke-width="3"/>
  <rect x="17" y="124" width="96" height="84" rx="8" fill="#f2e6c9"/><rect x="17" y="124" width="96" height="14" fill="#fff" opacity=".4"/>
  <rect x="62.5" y="92" width="5" height="34" rx="2" fill="#3a2f2a"/>
  <path d="M65 28 C 46 58 52 88 65 96 C 78 88 84 58 65 28Z" fill="#ffc760"/><path d="M65 58 C 57 72 59 86 65 90 C 71 86 73 72 65 58Z" fill="#fff3cf"/>
  <rect x="22" y="146" width="12" height="52" rx="6" fill="#fff" opacity=".22"/></svg>`;
}

/** A top-down candle tin with a flame. */
function candleTop({ x, y, s = 120, z = 4 }) {
  return `<svg style="${abs(x, y, s, s, `z-index:${z};overflow:visible;filter:drop-shadow(0 10px 8px rgba(10,10,30,.45))`)}" viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="56" fill="#b9bcc4"/><circle cx="60" cy="60" r="56" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
  <circle cx="60" cy="60" r="46" fill="#8c909a"/><circle cx="60" cy="60" r="40" fill="#f1e5c8"/><circle cx="52" cy="50" r="22" fill="#fff" opacity=".28"/>
  <circle cx="60" cy="60" r="16" fill="#ffcf72" opacity=".55"/><circle cx="60" cy="60" r="9" fill="#ffc760"/><circle cx="60" cy="60" r="4.5" fill="#fff3cf"/></svg>`;
}

/** A folder from above: tab, a front edge and a little shading. */
function folder({ x, y, w, h, rot = 0, c1 = "#d9b98a", c2 = "#c9a574", tab = 0.34, z = 3, heavy = false, extra = "" }) {
  const t = Math.round(h * 0.12);
  const stack = heavy
    ? [4, 3, 2, 1].map((k) => `<div style="position:absolute;left:${k * 3}px;right:${-k * 3}px;top:${t + k * 3}px;bottom:${-k * 4}px;background:${c2};border-radius:6px;box-shadow:0 0 0 1px rgba(0,0,0,.12)"></div>`).join("")
    : "";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 14px 12px rgba(10,10,30,.42));${extra}`)}">
   ${stack}
   <div style="position:absolute;left:0;top:0;width:${w * tab}px;height:${t + 10}px;background:${c2};border-radius:8px 8px 0 0"></div>
   <div style="position:absolute;left:0;right:0;top:${t}px;bottom:0;background:linear-gradient(165deg,${c1},${c2});border-radius:0 8px 8px 8px;box-shadow:inset 0 3px 0 rgba(255,255,255,.28),inset 0 0 0 1px rgba(0,0,0,.1)"></div></div>`;
}

/** A kraft envelope from above, optionally open with a card showing. */
function envelope({ x, y, w = 220, rot = 0, c1 = "#d9b98a", c2 = "#c9a574", z = 1, open = false }) {
  const h = Math.round(w * 0.66);
  if (open) {
    return `<svg style="${abs(x, y - w * 0.3, w, h + w * 0.3, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 10px 8px rgba(10,10,30,.4))`)}" viewBox="0 -78 260 250" aria-hidden="true">
    <path d="M0 0 L130 -76 L260 0 Z" fill="${c2}"/><path d="M0 0 L130 -76 L260 0" fill="none" stroke="#000" stroke-opacity=".14" stroke-width="2"/>
    <rect y="0" width="260" height="172" rx="6" fill="${c1}"/><rect x="26" y="-18" width="208" height="120" rx="3" fill="#fbf5e8"/><rect x="48" y="14" width="120" height="8" rx="4" fill="#ddd2bc"/><rect x="48" y="38" width="150" height="8" rx="4" fill="#ddd2bc"/><rect x="48" y="62" width="96" height="8" rx="4" fill="#ddd2bc"/>
    <path d="M0 172 L104 84 M260 172 L156 84" stroke="#000" stroke-opacity=".12" stroke-width="2"/><path d="M0 172 L130 78 L260 172 Z" fill="${c2}" opacity=".9"/></svg>`;
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z};filter:drop-shadow(0 10px 8px rgba(10,10,30,.4))`)}" viewBox="0 0 260 172" aria-hidden="true">
    <rect width="260" height="172" rx="6" fill="${c1}"/><path d="M0 172 L104 84 M260 172 L156 84" stroke="#000" stroke-opacity=".12" stroke-width="2"/>
    <path d="M0 0 L130 98 L260 0 Z" fill="${c2}"/><path d="M0 0 L130 98 L260 0" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="2"/></svg>`;
}

/** A blank butter sticky note. */
function sticky({ x, y, s = 150, rot = 0, z = 5 }) {
  return `<div style="${abs(x, y, s, s, `transform:rotate(${rot}deg);z-index:${z};background:linear-gradient(172deg,#f7e18f,#efcb68);box-shadow:0 2px 3px rgba(20,10,5,.3),0 12px 16px rgba(20,10,5,.3)`)}"><div style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.22)"></div></div>`;
}

/** A ballpoint pen. */
function pen({ x, y, len = 340, rot = 0, body = "#2f3a55", trim = "#d6b36a", z = 3 }) {
  return `<svg style="${abs(x, y, len, 34, `z-index:${z};transform:rotate(${rot}deg);filter:drop-shadow(0 9px 6px rgba(10,10,30,.42))`)}" viewBox="0 0 ${len} 34" aria-hidden="true">
    <rect x="50" y="6" width="${len - 70}" height="22" rx="11" fill="${body}"/><rect x="56" y="9" width="${len - 90}" height="6" rx="3" fill="#fff" opacity=".22"/>
    <rect x="${len - 150}" y="5" width="12" height="24" fill="${trim}"/><rect x="${len - 36}" y="9" width="12" height="16" rx="3" fill="${trim}"/>
    <path d="M50 8 L14 16 L14 18 L50 26 Z" fill="#c9ccd2"/><path d="M18 15 L2 17 L18 19 Z" fill="#33363b"/></svg>`;
}

/** A wobbly hand-drawn ring (hollow ellipse). */
function ring({ x, y, w, h, color = MUL, sw = 8, rot = -3, z = 8, seed = 2 }) {
  const r = rng(seed);
  const cx = w / 2, cy = h / 2;
  let d = "";
  const N = 90;
  let ph = 0;
  for (let k = 0; k <= N + 8; k++) {
    const a = (k / N) * Math.PI * 2 - 0.6;
    if (k % 6 === 0) ph = (r() - 0.5) * 0.04;
    const wob = 1 + ph + (k > N ? 0.012 * (k - N) : 0);
    d += `${k ? "L" : "M"}${(cx + Math.cos(a) * (w / 2 - sw) * wob).toFixed(1)} ${(cy + Math.sin(a) * (h / 2 - sw) * wob).toFixed(1)} `;
  }
  return `<svg style="${abs(x, y, w, h, `z-index:${z};transform:rotate(${rot}deg);overflow:visible`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A hand-drawn tick. */
const tick = (size = 44, c = MUL) => `<svg width="${size}" height="${size}" viewBox="0 0 58 58" aria-hidden="true" style="display:block"><path d="M9 30 L22 43 C 28 28, 38 14, 54 3" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Handwriting-like scribble lines (no letters): `rows` lines at (x, y) of width w. */
function scribble({ x, y, w, rows = 4, gap = 40, seed = 1, sw = 3.2, color = "#3d3446", amp = 7, widths = null, cross = false, z = 2 }) {
  const r = rng(seed);
  let d = "";
  for (let k = 0; k < rows; k++) {
    const lw = widths ? widths[k % widths.length] * w : w * (0.55 + r() * 0.45);
    let cx = 0;
    let line = `M0 ${(k * gap).toFixed(1)} `;
    while (cx < lw) {
      const seg = 7 + r() * 7;
      if (r() < 0.12) { cx += 12; line += `M${cx.toFixed(1)} ${(k * gap + (r() - 0.5) * 4).toFixed(1)} `; continue; }
      line += `q ${(seg / 2).toFixed(1)} ${((r() - 0.5) * amp * 3.6).toFixed(1)} ${seg.toFixed(1)} ${((r() - 0.5) * 3).toFixed(1)} `;
      cx += seg;
    }
    d += line;
    if (cross && k % 2 === 1) d += `M-6 ${(k * gap + 8).toFixed(1)} L${(lw + 8).toFixed(1)} ${(k * gap - 8).toFixed(1)} `;
  }
  return `<svg style="${abs(x, y - 20, w + 20, rows * gap + 30, `z-index:${z};overflow:visible`)}" viewBox="0 -20 ${w + 20} ${rows * gap + 30}" aria-hidden="true"><path d="${d}" transform="translate(0 0)" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** A glowing lamp from the side, on a table: shade, neck and a glazed body. Box is 276 x 304. */
function lamp({ x, y, s = 0.92, z = 4 }) {
  return `<svg style="${abs(x, y, 300 * s, 330 * s, `z-index:${z};overflow:visible`)}" viewBox="0 0 300 330" aria-hidden="true">
  <defs><linearGradient id="ls" x1="0" x2="1"><stop offset="0" stop-color="#f3c675"/><stop offset=".5" stop-color="#fdeab7"/><stop offset="1" stop-color="#eebb62"/></linearGradient>
  <linearGradient id="lb" x1="0" x2="1"><stop offset="0" stop-color="#5d7f9a"/><stop offset=".45" stop-color="#43627c"/><stop offset="1" stop-color="#27394d"/></linearGradient></defs>
  <ellipse cx="150" cy="326" rx="104" ry="13" fill="#000" opacity=".4"/>
  <path d="M104 322 L110 296 L190 296 L196 322 Z" fill="#26364a"/>
  <path d="M120 188 C 66 214 56 292 108 304 L192 304 C 244 292 234 214 180 188 Z" fill="url(#lb)"/>
  <path d="M104 214 C 90 240 90 272 108 290" stroke="#fff" stroke-opacity=".3" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="142" y="140" width="16" height="56" fill="#b69a6a"/>
  <path d="M72 8 L228 8 L286 150 L14 150 Z" fill="url(#ls)"/><ellipse cx="150" cy="8" rx="78" ry="8" fill="#fff4cf"/><ellipse cx="150" cy="150" rx="136" ry="14" fill="#fff6d2"/>
  <path d="M72 8 L14 150 M228 8 L286 150" stroke="#e1a64e" stroke-opacity=".55" stroke-width="3"/></svg>`;
}

/* ================================================================== #67 */
function p67() {
  const n = 67;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ece8ef", size: 72, shadow: "rgba(15,12,30,.45)" });

  const TABLE = 672;
  const wall = `<div style="${abs(0, SCENE_TOP, 1000, TABLE - SCENE_TOP + 8, "background:linear-gradient(#202b43,#2f3d5c 70%,#3a4768)")}"></div>`;
  // A rainy window slice on the wall, left of the lamp.
  const win = `<div style="${abs(40, 392, 420, 262, "background:#d9d3cc;padding:14px;box-shadow:0 10px 24px rgba(5,8,20,.5)")}"><div style="position:absolute;inset:14px;overflow:hidden">${glass({ x: 0, y: 0, w: 392, h: 234, stops: "180deg,#17233f,#2a456f 55%,#5a6f92 90%,#8a7587", seed: 7, drops: 46, trails: 8, bokeh: 8, bokehY: 0.4 })}</div><div style="position:absolute;left:204px;top:14px;width:12px;bottom:14px;background:#d9d3cc"></div></div>`;
  const sill = `<div style="${abs(26, 648, 448, 24, "background:linear-gradient(#e6e0d9,#bdb6ae);box-shadow:0 8px 12px rgba(0,0,0,.4);border-radius:3px")}"></div>`;
  const table = desk({ top: TABLE, height: 700, base: "#7b563a", dark: "#5d3f2a", planks: 5, seed: 11 });
  const edge = `<div style="${abs(0, TABLE, 1000, 14, "background:linear-gradient(#b48a64,#8a6446);box-shadow:0 6px 12px rgba(0,0,0,.45)")}"></div>`;

  const glowWall = `<div style="${abs(0, SCENE_TOP, 1000, 700, "background:radial-gradient(ellipse 520px 380px at 850px 190px,rgba(255,205,125,.55),rgba(255,180,90,.16) 55%,transparent 75%);pointer-events:none;z-index:3")}"></div>`;
  const glowTable = `<div style="${abs(0, TABLE, 1000, 682, "background:radial-gradient(ellipse 520px 330px at 840px 120px,rgba(255,200,120,.42),rgba(255,170,90,.12) 60%,transparent 80%);pointer-events:none;z-index:3")}"></div>`;
  const lampEl = lamp({ x: 712, y: 384, s: 0.92 });

  // The cream card: five labelled rows in handwriting, the last ringed in mulberry.
  const rows = i.items.map((it, k) => {
    const [lab, txt] = split1(it);
    const last = k === i.items.length - 1;
    const inner = `<div style="font:600 22px/1 'Plex',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:${MULD}">${esc(lab)}</div><div class="hand" style="font:600 37px/1.05 'Hand',cursive;color:${INK};margin-top:5px">${esc(txt)}</div>`;
    return last
      ? `<div style="margin:2px 0 0 -18px;padding:10px 14px 12px 18px;border:6px solid ${MUL};border-radius:44px 30px 46px 28px / 30px 42px 30px 44px;transform:rotate(-.5deg)">${inner}</div>`
      : `<div style="margin-bottom:14px">${inner}</div>`;
  }).join("");
  const card = `<div style="${abs(40, 706, 670, 632, "transform:rotate(-1.2deg);z-index:6")}">
    <div style="position:absolute;inset:0;background:#fcf6e8;border-radius:8px;box-shadow:0 3px 4px rgba(10,5,5,.4),0 30px 44px rgba(10,5,5,.55);background-image:repeating-linear-gradient(transparent 0 45px,rgba(143,170,200,.28) 45px 47px);background-position:0 20px">
     <div style="position:absolute;left:0;right:0;top:0;height:7px;background:#e9c9d3;border-radius:8px 8px 0 0"></div>
     <div style="position:absolute;right:22px;top:20px">${exampleTag()}</div>
     <div data-check="note" style="position:absolute;left:40px;right:34px;top:58px;bottom:40px">${rows}</div>
     <div style="position:absolute;left:40px;right:30px;bottom:16px;font:500 24px/1.1 'Plex',sans-serif;color:#6b5e66">An illustration, not a real account</div>
    </div></div>`;

  const fold = folder({ x: 700, y: 918, w: 250, h: 300, rot: 7, c1: "#5b7fa6", c2: "#46688f", z: 4 });
  const cup = mug({ x: 752, y: 724, size: 120, color: "#ece4d8", drink: "#5a3a26" });
  const pn = pen({ x: 640, y: 1268, len: 330, rot: -8, body: "#2f3a55", z: 7 });

  const body = `${wall}${win}${sill}${table}${edge}${glowWall}${lampEl}${glowTable}${fold}${cup}${card}${pn}${fh}`;
  return { n, id: "brain-fog-life-admin-the-five-line-note", html: page(p, { body, css: fc, paper: "#ece8ef" }) };
}

/* ================================================================== #71 */
function colCard({ x, y, w, h, bg, title, titleColor, items, marker, pictogram, rot = 0, shadow }) {
  const list = items.map((t) => `<div style="display:flex;gap:16px;align-items:flex-start"><span style="flex:none;margin-top:10px">${marker}</span><span style="font:500 32px/1.2 'Plex',sans-serif;color:${INK};text-wrap:balance">${esc(t)}</span></div>`).join("");
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:6;background:${bg};border-radius:22px;box-shadow:${shadow}`)}">
   ${pictogram}
   <div style="position:absolute;left:32px;right:22px;top:214px"><div class="serif" data-check="title" style="font:500 46px/1.05 'Newsreader',Georgia,serif;letter-spacing:-.015em;color:${titleColor}">${esc(title)}</div><div style="height:4px;width:70px;border-radius:2px;background:${titleColor};opacity:.5;margin:14px 0 20px"></div>
   <div data-check="list" style="display:flex;flex-direction:column;gap:21px">${list}</div></div></div>`;
}

function p71() {
  const n = 71;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e6ebf1", size: 66, sub: i.sub, shadow: "rgba(20,30,55,.4)" });

  const TOP = 664;
  const win = glass({ x: 0, y: SCENE_TOP, w: 1000, h: 270, stops: "180deg,#38507a,#5b7599 55%,#97a8c1", seed: 31, drops: 70, trails: 14, bokeh: 9, bokehY: 0.45 });
  const frames = `<div style="${abs(0, SCENE_TOP, 34, 270, "background:linear-gradient(90deg,#cfcac5,#e6e2dd);z-index:2")}"></div><div style="${abs(966, SCENE_TOP, 34, 270, "background:linear-gradient(90deg,#e6e2dd,#cfcac5);z-index:2")}"></div><div style="${abs(481, SCENE_TOP, 38, 270, "background:linear-gradient(90deg,#d6d1cc,#ebe7e2,#d6d1cc);z-index:2;box-shadow:0 0 14px rgba(0,0,0,.25)")}"></div>`;
  const ledge = `<div style="${abs(0, 628, 1000, 36, "background:linear-gradient(#ece8e3,#c9c3bc);box-shadow:0 8px 14px rgba(20,25,45,.4);z-index:3")}"></div>`;
  const seat = `<div style="${abs(0, 664, 1000, 700, "background:radial-gradient(ellipse 800px 500px at 20% 30%,rgba(255,255,255,.14),transparent 70%),repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 7px),repeating-linear-gradient(0deg,rgba(0,0,0,.035) 0 2px,transparent 2px 6px),linear-gradient(#cdbdbb,#b4a2a1)")}"></div>
    <div style="${abs(0, 664, 1000, 12, "background:linear-gradient(#a38f8f,#bcaaa9)")}"></div>`;
  const cushion = knit({ x: 742, y: 520, w: 230, h: 210, rot: 9, base: "#4a5f86", light: "#7d93b8", dark: "#2f3f5e", radius: 26, id: "k71", vs: 18, z: 4 });
  const cup = mugSide({ x: 56, y: 470, s: 0.78, color: "#efe7dc", drink: "#3a2a22", z: 4 });

  const [l, r] = [i.items.slice(0, 4), i.items.slice(4)];
  const strip = (arr) => arr.map((t) => split1(t)[1]);
  const sq = `<i style="display:block;width:16px;height:16px;border-radius:4px;background:#5a5f73"></i>`;

  // Left: a heavy kraft folder and a stack of phones.
  const leftPic = `${folder({ x: 36, y: 30, w: 220, h: 138, rot: -2, c1: "#c9a574", c2: "#b48d5c", heavy: true, z: 2 })}
    <div style="position:absolute;left:58px;top:92px;width:150px;height:14px;border-radius:7px;background:#e7d6b4;opacity:.8;z-index:3;transform:rotate(-2deg)"></div>
    ${phoneBack({ x: 276, y: 52, w: 84, h: 126, rot: -6, color: "#3a4256", z: 2 })}${phoneBack({ x: 292, y: 40, w: 84, h: 126, rot: 3, color: "#2c3243", z: 3 })}${phoneBack({ x: 308, y: 30, w: 84, h: 126, rot: -2, color: "#22262f", z: 4 })}`;
  // Right: one opened envelope and a sticky note.
  const rightPic = `${envelope({ x: 44, y: 70, w: 190, rot: -3, open: true, z: 2 })}${sticky({ x: 282, y: 40, s: 118, rot: 5, z: 3 })}`;

  const L = colCard({ x: 34, y: TOP + 8, w: 454, h: 664, bg: "#d3d9e6", title: split1(i.items[0])[0], titleColor: "#2e3550", items: strip(l), marker: sq, pictogram: leftPic, rot: 0, shadow: "0 4px 6px rgba(15,20,45,.35),0 26px 38px rgba(15,20,45,.45)" });
  const R = colCard({ x: 512, y: TOP + 8, w: 454, h: 664, bg: "#fbf5ea", title: split1(i.items[4])[0], titleColor: MULD, items: strip(r), marker: `<span style="display:block;margin-top:-6px">${tick(34)}</span>`, pictogram: rightPic, rot: 0, shadow: "0 4px 6px rgba(15,20,45,.3),0 26px 38px rgba(15,20,45,.4)" });
  // Mulberry ring around the right column (a hand-drawn rounded outline).
  const rx = 512 - 12, ry = TOP + 8 - 12, rw = 454 + 24, rh = 664 + 24;
  const ringR = `<svg style="${abs(rx, ry, rw, rh, "z-index:8;overflow:visible")}" viewBox="0 0 ${rw} ${rh}" aria-hidden="true"><path d="M44 6 C 150 -2 300 6 ${rw - 40} 4 C ${rw - 6} 6 ${rw + 2} 30 ${rw - 3} 70 C ${rw + 3} 250 ${rw - 3} 480 ${rw - 1} ${rh - 50} C ${rw - 4} ${rh - 12} ${rw - 24} ${rh + 2} ${rw - 54} ${rh - 2} C 300 ${rh + 4} 160 ${rh - 4} 46 ${rh} C 10 ${rh + 2} 0 ${rh - 24} 3 ${rh - 60} C -3 450 3 250 1 60 C 0 24 14 10 44 6 Z" fill="none" stroke="${MUL}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const body = `${win}${frames}${ledge}${seat}${cup}${cushion}${L}${R}${ringR}${fh}`;
  return { n, id: "brain-fog-task-list-clear-head-or-foggy-day", html: page(p, { body, css: fc, paper: "#e6ebf1" }) };
}

/* ================================================================== #73 */
function qCard({ x, y, w, h, rot, tab, line, z }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">
   <div style="position:absolute;left:34px;top:-40px;padding:0 22px;height:42px;display:flex;align-items:center;background:#fcf6e8;border:2px solid #e6d8b8;border-bottom:0;border-radius:12px 12px 0 0;box-shadow:0 -3px 5px rgba(20,10,5,.2);font:600 23px 'Plex',sans-serif;color:${INK};white-space:nowrap">${esc(tab)}</div>
   <div style="position:absolute;inset:0;background:#fcf6e8;border-radius:6px 6px 8px 8px;box-shadow:0 3px 4px rgba(20,10,5,.3),0 18px 28px rgba(20,10,5,.42);overflow:hidden">
    <div style="position:absolute;left:0;right:0;top:0;height:6px;background:#e9c9d3"></div>
    <div class="serif" style="position:absolute;left:26px;top:2px;font:500 120px/1 'Newsreader',serif;color:${MUL}">“</div>
    <div data-check="line" style="position:absolute;left:92px;right:76px;top:22px;padding-bottom:30px;font:700 41px/1.06 'Hand',cursive;color:${INK}">${esc(line)}<span style="color:${MUL};font:500 60px/0 'Newsreader',serif;vertical-align:-20px;margin-left:4px">”</span></div>
   </div></div>`;
}

function p73() {
  const n = 73;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#f1ebe4", size: 70, sub: i.sub, shadow: "rgba(40,25,10,.4)" });

  const blanket = `<div style="${abs(0, SCENE_TOP, 1000, 990, "")}">${knit({ x: 0, y: 0, w: 1000, h: 990, base: "#c9bcaa", light: "#e2d6c3", dark: "#a2937d", id: "k73", vs: 24, shadow: false, shade: "rgba(40,25,10,.45)" })}</div>
  <div style="${abs(0, SCENE_TOP, 1000, 990, "background:linear-gradient(115deg,transparent 30%,rgba(60,40,20,.2) 36%,transparent 46%),linear-gradient(80deg,transparent 62%,rgba(60,40,20,.16) 70%,transparent 80%),radial-gradient(ellipse 700px 520px at 5% 8%,rgba(255,214,150,.4),transparent 70%)")}"></div>`;

  const cards = i.items.map((it, k) => {
    const [tab, line] = split1(it);
    const xs = [46, 74, 40, 80, 54];
    const rots = [-1.2, 0.8, -0.7, 1.1, -0.9];
    return qCard({ x: xs[k], y: 446 + k * 188, w: 770, h: 200, rot: rots[k], tab, line, z: 3 + k });
  }).join("");

  const ph = phoneBack({ x: 836, y: 830, w: 200, h: 410, rot: 8, color: "#35405a", z: 12 });
  const pn = pen({ x: 760, y: 560, len: 300, rot: 74, body: "#7a4a5c", trim: "#d6b36a", z: 12 });
  const fringe = "";

  const body = `${blanket}${cards}${ph}${pn}${fringe}${fh}`;
  return { n, id: "phone-calls-with-brain-fog-five-lines", html: page(p, { body, css: fc, paper: "#f1ebe4" }) };
}

/* ================================================================== #75 */
function p75() {
  const n = 75;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e4e9f1", size: 72, shadow: "rgba(10,15,35,.45)" });

  const win = glass({ x: 0, y: SCENE_TOP, w: 1000, h: 644, stops: "180deg,#121d36,#223a63 50%,#3f5a85 78%,#8a7088", seed: 53, drops: 130, trails: 26, bokeh: 20, bokehY: 0.42 });
  const sideL = `<div style="${abs(0, SCENE_TOP, 38, 644, "background:linear-gradient(90deg,#b7b1ab,#dcd7d1);z-index:2;box-shadow:6px 0 14px rgba(0,0,0,.35)")}"></div><div style="${abs(962, SCENE_TOP, 38, 644, "background:linear-gradient(90deg,#dcd7d1,#b7b1ab);z-index:2;box-shadow:-6px 0 14px rgba(0,0,0,.35)")}"></div>`;
  const sill = `<div style="${abs(0, 1016, 1000, 340, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.05) 0 2px,transparent 2px 9px),linear-gradient(#d7d1ca,#b6aea7)")}"></div>
   <div style="${abs(0, 1012, 1000, 18, "background:linear-gradient(#8f8780,#c2bab3);box-shadow:0 -4px 14px rgba(0,0,0,.3)")}"></div>`;

  // The big cream card leaning on the glass; the stopping note in mulberry.
  const sentence = i.items[0];
  const marked = "the stopping note";
  const at = sentence.indexOf(marked);
  const before = sentence.slice(0, at), after = sentence.slice(at + marked.length);
  const card = `<div style="${abs(110, 496, 740, 548, "transform:rotate(-1.2deg);z-index:6")}">
    <div style="position:absolute;inset:0;background:#fcf6e8;border-radius:10px;box-shadow:0 3px 5px rgba(5,8,20,.4),0 34px 54px rgba(5,8,20,.6)">
     <div style="position:absolute;left:0;right:0;top:0;height:8px;background:#e9c9d3;border-radius:10px 10px 0 0"></div>
     <div style="position:absolute;left:58px;top:56px;width:70px;height:6px;border-radius:3px;background:${MUL}"></div>
     <div data-check="quote" class="serif" style="position:absolute;left:58px;right:54px;top:92px;font:500 80px/1.1 'Newsreader',Georgia,serif;letter-spacing:-.02em;color:${INK}">${esc(before)}<span style="color:${MUL}">${esc(marked)}</span>${esc(after)}</div>
     <div data-check="sub" style="position:absolute;left:58px;right:54px;bottom:42px;font:500 28px/1.3 'Plex',sans-serif;color:#5b4f57">${esc(i.sub)}</div>
    </div></div>`;

  const fold = folder({ x: 70, y: 1086, w: 420, h: 250, rot: -3, c1: "#d4b283", c2: "#bf9a68", z: 5 });
  const note = sticky({ x: 118, y: 1130, s: 150, rot: -7, z: 7 });
  const cup = mugSide({ x: 560, y: 1108, s: 0.9, color: "#ece4d8", drink: "#3a2a22", z: 5 });
  const candle = candleJar({ x: 830, y: 1020, s: 1.0, z: 5 });
  const glow = `<div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(circle 430px at 896px 1050px,rgba(255,195,110,.5),rgba(255,170,90,.18) 55%,transparent 75%);z-index:9;pointer-events:none")}"></div>`;

  const body = `${win}${sideL}${sill}${card}${fold}${note}${cup}${candle}${glow}${fh}`;
  return { n, id: "brain-fog-admin-the-stopping-note", html: page(p, { body, css: fc, paper: "#e4e9f1" }) };
}

/* ================================================================== #77 */
function p77() {
  const n = 77;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#ebe9e6", size: 64, sub: i.sub, textTop: 52, shadow: "rgba(30,35,45,.4)" });

  const WIN_H = 190;
  const win = glass({ x: 0, y: SCENE_TOP, w: 1000, h: WIN_H, stops: "180deg,#8798ae,#aebccc 60%,#ccd5df", seed: 77, drops: 60, trails: 12, bokeh: 4, bokehY: 0.6, dropStroke: "rgba(40,60,95,.4)", dropTop: "rgba(40,60,95,.28)", dropBot: "rgba(255,255,255,.7)", trailC: "rgba(50,70,105,.2)" });
  const bars = [0, 326, 660].map((bx) => `<div style="${abs(bx, SCENE_TOP, 14, WIN_H, "background:#f0eeeb;z-index:2")}"></div>`).join("") + `<div style="${abs(986, SCENE_TOP, 14, WIN_H, "background:#f0eeeb;z-index:2")}"></div>`;
  const sillBar = `<div style="${abs(0, SCENE_TOP + WIN_H - 4, 1000, 26, "background:linear-gradient(#f4f2ef,#cfcbc5);box-shadow:0 8px 14px rgba(30,35,45,.4);z-index:3")}"></div>`;
  const dk = desk({ top: SCENE_TOP + WIN_H + 22, height: 982 - WIN_H - 22, base: "#b7b2a8", dark: "#a29d93", planks: 6, seed: 8 });
  const glow = `<div style="${abs(0, SCENE_TOP + WIN_H + 22, 1000, 780, "background:radial-gradient(ellipse 700px 560px at 100% 0%,rgba(255,206,135,.5),rgba(255,190,110,.14) 55%,transparent 75%);pointer-events:none;z-index:4")}"></div>`;

  // The planner: a dusk-blue cover, two pages, a ribbon.
  const PX = 34, PY = 626, PW = 932, PH = 706;
  const pageW = 448, pageH = 664;
  const lines = (c = "#d7d4ea") => `repeating-linear-gradient(transparent 0 51px,${c} 51px 53px)`;
  const tues = `<div style="position:absolute;left:18px;top:20px;width:${pageW}px;height:${pageH}px;background:linear-gradient(90deg,#fffdfa,#f9f6ef 90%,#e9e4d9);border-radius:4px 0 0 4px;box-shadow:inset -14px 0 18px -10px rgba(40,30,20,.3)">
    <div class="serif" style="position:absolute;left:34px;top:26px;font:500 50px/1 'Newsreader',serif;color:${INK}">Tuesday</div>
    <div style="position:absolute;left:34px;right:30px;top:90px;height:3px;background:${MUL};opacity:.6"></div>
    ${[0, 1, 2, 3, 4, 5].map((k) => `<div style="position:absolute;left:34px;top:${124 + k * 88}px;width:36px;height:36px;border:3px solid #6c5b68;border-radius:7px;background:#fff"></div><div style="position:absolute;left:30px;top:${100 + k * 88}px">${tick(52)}</div>`).join("")}
    ${[0, 1, 2, 3, 4, 5].map((k) => scribble({ x: 94, y: 148 + k * 88, w: 300, rows: 2, gap: 30, seed: 10 + k, sw: 3.4, color: "#2e2840", amp: 6, widths: [0.95, 0.7] })).join("")}
   </div>`;
  const thurs = `<div style="position:absolute;left:${18 + pageW + 16}px;top:20px;width:${pageW}px;height:${pageH}px;background:linear-gradient(90deg,#e9e4d9,#f9f6ef 10%,#fffdfa);border-radius:0 4px 4px 0;box-shadow:inset 14px 0 18px -10px rgba(40,30,20,.3)">
    <div class="serif" style="position:absolute;left:34px;top:26px;font:500 50px/1 'Newsreader',serif;color:${INK}">Thursday</div>
    <div style="position:absolute;left:30px;right:34px;top:90px;height:3px;background:#cfc8d4"></div>
    <div style="position:absolute;left:24px;right:24px;top:116px;bottom:30px;background:${lines()}"></div>
   </div>`;
  const ribbon = `<div style="position:absolute;left:${PW / 2 + 90}px;top:${PH - 14}px;width:26px;height:60px;background:linear-gradient(${MUL},${MULD});clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%);box-shadow:0 6px 8px rgba(0,0,0,.3)"></div>`;
  const planner = `<div style="${abs(PX, PY, PW, PH, "transform:rotate(-1.3deg);z-index:6")}">
    <div style="position:absolute;inset:0;background:linear-gradient(#34456a,#27355a);border-radius:20px;box-shadow:0 4px 6px rgba(20,25,40,.35),0 30px 44px rgba(20,25,40,.5)"></div>
    ${tues}${thurs}${ribbon}
   </div>`;

  // On the empty Thursday page: a mug and an unopened envelope.
  const cupT = mug({ x: 670, y: 760, size: 170, color: "#f2ece3", drink: "#54372a" });
  const env = envelope({ x: 560, y: 1048, w: 290, rot: 5, c1: "#f1ebe0", c2: "#e2d9c8", z: 8 });
  const cupWrap = `<div style="position:absolute;left:0;top:0;z-index:9;transform:rotate(-1.3deg);transform-origin:500px 980px">${cupT}</div>`;
  const envWrap = `<div style="position:absolute;left:0;top:0;z-index:9;transform:rotate(-1.3deg);transform-origin:500px 980px">${env}</div>`;
  const seal = `<div style="${abs(680, 1088, 44, 44, "z-index:10;border-radius:50%;background:radial-gradient(circle at 35% 30%,#c98aa3,#86586a);box-shadow:0 3px 4px rgba(0,0,0,.35);transform:rotate(3deg)")}"></div>`;

  const body = `${win}${bars}${sillBar}${dk}${glow}${planner}${cupWrap}${envWrap}${seal}${fh}`;
  return { n, id: "brain-fog-planning-good-tuesday-meets-thursday", html: page(p, { body, css: fc, paper: "#ebe9e6" }) };
}

/* ================================================================== #79 */
function p79() {
  const n = 79;
  const i = idea(n);
  const { css: fc, html: fh } = frame(i, { paper: "#e9e6ef", size: 66, sub: i.sub, shadow: "rgba(15,15,40,.45)" });

  const duvet = `<svg style="${abs(0, SCENE_TOP, 1000, 982, "")}" viewBox="0 0 1000 982" aria-hidden="true"><defs>
    <radialGradient id="puff" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="#3c4f86"/><stop offset="1" stop-color="#232f55"/></radialGradient>
    <pattern id="quilt" width="150" height="150" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="150" height="150" fill="url(#puff)"/><rect x="1" y="1" width="148" height="148" fill="none" stroke="rgba(235,240,255,.28)" stroke-width="2" stroke-dasharray="7 6"/></pattern></defs>
    <rect width="1000" height="982" fill="url(#quilt)"/></svg>
   <div style="${abs(0, SCENE_TOP, 1000, 982, "background:radial-gradient(ellipse 760px 560px at 0% 0%,rgba(255,205,140,.32),transparent 70%),radial-gradient(ellipse 900px 700px at 100% 100%,rgba(5,8,25,.45),transparent 70%)")}"></div>`;

  // The tray: oak rim, birch floor, two hand slots.
  const TX = 28, TY = 408, TW = 944, TH = 934;
  const tray = `<div style="${abs(TX, TY, TW, TH, "border-radius:40px;background:linear-gradient(145deg,#c99b66,#a77a47);box-shadow:0 4px 6px rgba(5,8,25,.4),0 36px 56px rgba(5,8,25,.6);z-index:2")}"></div>
   <div style="${abs(TX + 6, TY + 6, TW - 12, TH - 12, "border-radius:34px;box-shadow:inset 0 4px 0 rgba(255,235,200,.4),inset 0 -4px 0 rgba(70,40,10,.25);z-index:2")}"></div>
   <div style="${abs(TX + 44, TY + 44, TW - 88, TH - 88, "border-radius:16px;background:repeating-linear-gradient(0deg,rgba(120,80,40,.07) 0 3px,transparent 3px 22px),linear-gradient(#e6d4b0,#d9c39a);box-shadow:inset 0 8px 14px rgba(70,40,10,.3),inset 0 0 0 2px rgba(120,80,40,.25);z-index:2")}"></div>
   <div style="${abs(TX + 12, TY + TH / 2 - 62, 20, 124, "border-radius:10px;background:#5c3f23;box-shadow:inset 0 3px 4px rgba(0,0,0,.5);z-index:3")}"></div>
   <div style="${abs(TX + TW - 32, TY + TH / 2 - 62, 20, 124, "border-radius:10px;background:#5c3f23;box-shadow:inset 0 3px 4px rgba(0,0,0,.5);z-index:3")}"></div>`;

  // A. the page left alone: still readable, ringed in mulberry. Words from the bank beside it.
  const pageA = `<div style="${abs(104, 498, 470, 262, "transform:rotate(-1.6deg);z-index:5;background:linear-gradient(#fffdf8,#f7f2e7);border-radius:4px;box-shadow:0 2px 3px rgba(40,25,10,.25),0 16px 22px rgba(40,25,10,.35)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:36px;background:#ece3ea;border-radius:4px 4px 0 0"></div>
    ${scribble({ x: 34, y: 82, w: 400, rows: 5, gap: 38, seed: 3, sw: 3.6, color: "#2e2840", amp: 6, widths: [0.98, 0.8, 0.92, 0.6, 0.86] })}
  </div>`;
  const ringA = ring({ x: 76, y: 466, w: 526, h: 322, sw: 8, rot: -2, seed: 5, z: 8 });
  const capA = `<div data-check="caption" class="hand" style="${abs(650, 540, 276, 180, `z-index:5;font:700 52px/1.02 'Hand',cursive;color:${MULD}`)}">${esc(i.items[0])}</div>`;

  // The calendar: three weeks of untouched squares.
  const cols = 7, rows = 3, cw = 58, chh = 38;
  const calW = cols * cw + 28, calH = rows * chh + 60;
  const cells = Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => `<div style="position:absolute;left:${14 + c * cw}px;top:${48 + r * chh}px;width:${cw}px;height:${chh}px;border:2px solid #d8d0c0;background:#fffdf8"></div>`).join("")).join("");
  const cal = `<div style="${abs(286, 810, calW, calH, "transform:rotate(1deg);z-index:5;background:#f8f3e8;border-radius:6px;box-shadow:0 2px 3px rgba(40,25,10,.25),0 16px 22px rgba(40,25,10,.35)")}">
    <div style="position:absolute;left:0;right:0;top:0;height:42px;background:#d8cfdc;border-radius:6px 6px 0 0"></div>
    <i style="position:absolute;left:${calW / 2 - 9}px;top:-6px;width:18px;height:18px;border-radius:50%;background:#7b7384;box-shadow:inset 0 3px 3px rgba(0,0,0,.4)"></i>
    ${cells}</div>`;
  const cupA = mug({ x: 98, y: 812, size: 138, color: "#f3ede4", drink: "#5a3a26" });
  const candle = candleTop({ x: 770, y: 826, s: 124, z: 6 });
  const candleGlow = `<div style="${abs(670, 726, 324, 324, "border-radius:50%;background:radial-gradient(circle,rgba(255,205,120,.5),rgba(255,190,100,.15) 55%,transparent 72%);z-index:4;pointer-events:none")}"></div>`;

  // B. the crowded tracker left to go stale: crossed-out entries, a faded date chip.
  const grid = Array.from({ length: 5 }, (_, r) => `<div style="position:absolute;left:18px;right:18px;top:${70 + r * 40}px;height:2px;background:#cfc3a4"></div>`).join("") + [150, 270, 372].map((cx) => `<div style="position:absolute;left:${cx}px;top:62px;width:2px;bottom:18px;background:#cfc3a4"></div>`).join("");
  const boxes = Array.from({ length: 5 }, (_, r) => `<div style="position:absolute;left:${420}px;top:${80 + r * 40}px;width:22px;height:22px;border:2.5px solid #9d927a;border-radius:4px;${r % 2 ? "background:rgba(120,100,70,.18)" : ""}"></div>`).join("");
  const pageB = `<div style="${abs(384, 1014, 560, 282, "transform:rotate(1.4deg);z-index:5;background:linear-gradient(#f2e8c8,#e6d9b0);border-radius:4px;box-shadow:0 2px 3px rgba(40,25,10,.25),0 16px 22px rgba(40,25,10,.38);overflow:hidden")}">
    <div style="position:absolute;left:18px;top:14px;width:120px;height:34px;border-radius:7px;background:rgba(150,135,110,.35)"></div>
    <div style="position:absolute;left:8px;top:30px;width:150px;height:4px;background:#6b6256;transform:rotate(-4deg)"></div>
    <div style="position:absolute;right:20px;top:18px;width:150px;height:14px;border-radius:7px;background:rgba(150,135,110,.35)"></div>
    ${grid}${boxes}
    ${scribble({ x: 26, y: 100, w: 108, rows: 5, gap: 40, seed: 21, sw: 3, color: "#5a5262", amp: 4, widths: [0.95, 0.8, 0.9, 0.7, 0.95], cross: true })}
    ${scribble({ x: 160, y: 100, w: 100, rows: 5, gap: 40, seed: 31, sw: 3, color: "#5a5262", amp: 4, widths: [0.9, 0.95, 0.7, 0.85, 0.6], cross: true })}
    ${scribble({ x: 282, y: 100, w: 80, rows: 5, gap: 40, seed: 41, sw: 3, color: "#5a5262", amp: 4, widths: [0.8, 0.9, 0.95, 0.7, 0.85] })}
    <div style="position:absolute;right:-26px;bottom:-30px;width:90px;height:90px;border-radius:50%;border:5px solid rgba(110,70,40,.2)"></div>
   </div>`;
  const capB = `<div data-check="caption" class="hand" style="${abs(84, 1024, 292, 270, `z-index:5;font:700 44px/1.04 'Hand',cursive;color:${INK}`)}">${esc(i.items[1])}</div>`;

  const body = `${duvet}${tray}${pageA}${ringA}${capA}${cal}${cupA}${candleGlow}${candle}${pageB}${capB}${fh}`;
  return { n, id: "brain-fog-systems-three-weeks-of-ignoring-it", html: page(p, { body, css: fc, paper: "#e9e6ef" }) };
}

export const pins = [p67(), p71(), p73(), p75(), p77(), p79()];
