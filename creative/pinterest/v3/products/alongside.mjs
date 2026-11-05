/**
 * ADHD Life Companion (alongside), v3 test pins: two of the seven
 * archetypes in pinterest/strategy/alongside.json, drawn from the
 * product's own world (the home-admin corner: the mail pile, the phone).
 *
 * - adhd/pin-4.3, pile-sort (guide pin): the doom pile of unopened mail,
 *   sorted into the three real piles "A person", "A date", "Nobody"
 *   (the pin's own description; pile meanings from guides.ts
 *   how-to-start-when-everything-is-overdue). The kitchen timer is the
 *   guide's ten minutes (guide pins only: the product has no timer).
 * - adhd/pin-9.2, companion-step-phone (product pin): the real outcome
 *   step, "How did it go?" with OUTCOME_OPTIONS (steps.ts) and its why
 *   line (makeAPhoneCall.ts step "result"), "Did not get to it" ringed;
 *   beside it, a habit tracker with its streak and percent, struck out.
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("alongside");
const STRATEGY = (await import("../../strategy/alongside.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the alongside strategy`);
  return pin;
};

/** The product's own ground (definition.ts theme.ground.light) and the strategy's paper props. */
const G = { appBg: "#f4f0f1", wash: "#f7f1f3", surface: "#fbf9fa", surfaceMuted: "#eee8eb", border: "#e6dde1", borderStrong: "#d5cacf", text: "#241e21", muted: "#645a5f" };
const PAPER = { kraft: "#d8b78c", kraftDark: "#bf9a6c", cream: "#fbf7ef", offWhite: "#f3eee6", blush: "#ecd5dc", blue: "#e2e7ec", butter: "hsl(43 92% 70%)" };

/** Small deterministic random, so a pin renders the same every time. */
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A hand-drawn line through points, slightly wobbly, as one quadratic path. */
const hand = (pts) => pts.reduce((d, [x, y], i, a) => (i === 0 ? `M${x} ${y}` : i === a.length - 1 ? `${d} T${x} ${y}` : `${d} Q${x} ${y} ${(x + a[i + 1][0]) / 2} ${(y + a[i + 1][1]) / 2}`), "");

/* ------------------------------------------------------------ paper props */

/**
 * One envelope (or flyer), centred on its origin. No legible words: the
 * address is grey bars, as the strategy's mail-pile notes ask.
 */
function envelope({ w = 250, h = 160, kind = "back", fill = PAPER.offWhite, edge, stamp = false, win = false }) {
  const x = -w / 2, y = -h / 2;
  const line = edge ?? shade(fill);
  const body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${line}" stroke-width="1.5"/>`;
  if (kind === "back") {
    return `${body}
      <path d="M${x + 3} ${y + h - 3} L${-w * 0.06} ${h * 0.02} M${-x - 3} ${y + h - 3} L${w * 0.06} ${h * 0.02}" stroke="${line}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M${x} ${y + 2} L0 ${h * 0.1} L${-x} ${y + 2} Z" fill="${shade(fill, 0.04)}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  if (kind === "flyer") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h * 0.16}" rx="4" fill="${shade(fill, 0.18)}"/>
      <rect x="${x + w * 0.1}" y="${y + h * 0.26}" width="${w * 0.8}" height="${h * 0.34}" rx="3" fill="#fff" fill-opacity=".5"/>
      <path d="M${x + w * 0.1} ${y + h * 0.6} l${w * 0.24} ${-h * 0.16} l${w * 0.16} ${h * 0.1} l${w * 0.16} ${-h * 0.14} l${w * 0.24} ${h * 0.2} Z" fill="${shade(fill, 0.1)}"/>
      ${[0.68, 0.76, 0.84].map((f, i) => `<rect x="${x + w * 0.1}" y="${y + h * f}" width="${w * (i === 1 ? 0.62 : 0.74)}" height="${h * 0.04}" rx="2" fill="#fff" fill-opacity=".75"/>`).join("")}`;
  }
  if (kind === "coupons") {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${line}" stroke-width="1.5"/>
      <path d="M${x + w * 0.3} ${y + 6} V${-y - 6}" stroke="${line}" stroke-width="2" stroke-dasharray="3 6"/>
      <rect x="${x + w * 0.42}" y="${y + h * 0.28}" width="${w * 0.44}" height="${h * 0.18}" rx="4" fill="${line}" fill-opacity=".45"/>
      <rect x="${x + w * 0.42}" y="${y + h * 0.56}" width="${w * 0.3}" height="${h * 0.1}" rx="3" fill="${line}" fill-opacity=".35"/>`;
  }
  // The front: address bars, maybe a window and a stamp.
  return `${body}
    ${win ? `<rect x="${x + w * 0.1}" y="${y + h * 0.42}" width="${w * 0.46}" height="${h * 0.32}" rx="4" fill="#ffffff" fill-opacity=".7" stroke="${line}" stroke-width="1.5"/>
      ${[0.5, 0.58, 0.66].map((f, i) => `<rect x="${x + w * 0.14}" y="${y + h * f}" width="${w * (i === 2 ? 0.22 : 0.32)}" height="${h * 0.04}" rx="2" fill="#b9b2b5"/>`).join("")}`
      : [0.48, 0.58, 0.68].map((f, i) => `<rect x="${x + w * 0.34}" y="${y + h * f}" width="${w * (i === 1 ? 0.4 : 0.32)}" height="${h * 0.045}" rx="2" fill="#a59da1"/>`).join("")}
    <rect x="${x + w * 0.07}" y="${y + h * 0.12}" width="${w * 0.22}" height="${h * 0.035}" rx="2" fill="${line}"/>
    <rect x="${x + w * 0.07}" y="${y + h * 0.19}" width="${w * 0.15}" height="${h * 0.035}" rx="2" fill="${line}"/>
    ${stamp ? `<g transform="translate(${-x - w * 0.17} ${y + h * 0.24})">
        <rect x="-19" y="-23" width="38" height="46" rx="2" fill="#fff" stroke="#d9cfd3" stroke-width="2" stroke-dasharray="3 2.5"/>
        <rect x="-13" y="-17" width="26" height="34" rx="1.5" fill="${stamp === true ? "#7f9fae" : stamp}"/>
        <path d="M-36 -10 q9 -6 18 0 t18 0 t18 0 M-36 0 q9 -6 18 0 t18 0 t18 0" stroke="#6d6468" stroke-opacity=".55" stroke-width="2" fill="none"/>
      </g>` : ""}`;
}

/** A slightly darker version of a hex colour, for edges and folds. */
function shade(hex, by = 0.12) {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return "#c9c0c3";
  const n = parseInt(m[1], 16);
  const ch = (s) => Math.max(0, Math.round(((n >> s) & 255) * (1 - by)));
  return `#${[16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("")}`;
}

/** A kitchen timer from above, its wedge showing ten minutes (the guide's ten). */
function kitchenTimer() {
  const r = 74;
  const a = (10 / 60) * Math.PI * 2;
  const wedge = `M0 0 L0 ${-r + 14} A${r - 14} ${r - 14} 0 0 1 ${Math.sin(a) * (r - 14)} ${-Math.cos(a) * (r - 14)} Z`;
  return `
    <ellipse cx="6" cy="${r + 6}" rx="${r - 4}" ry="12" fill="#3b2a30" opacity=".12"/>
    <circle r="${r}" fill="#fbf7ef" stroke="${G.text}" stroke-width="3"/>
    <circle r="${r - 10}" fill="#fff" stroke="#e2dad6" stroke-width="2"/>
    <path d="${wedge}" fill="${p.accent}" fill-opacity=".85"/>
    ${Array.from({ length: 12 }, (_, i) => { const t = (i / 12) * Math.PI * 2; const r1 = r - 14, r2 = i % 3 ? r - 20 : r - 24; return `<line x1="${Math.sin(t) * r1}" y1="${-Math.cos(t) * r1}" x2="${Math.sin(t) * r2}" y2="${-Math.cos(t) * r2}" stroke="${G.text}" stroke-width="${i % 3 ? 2 : 3}" stroke-linecap="round"/>`; }).join("")}
    <text x="${Math.sin(a / 2) * (r - 36)}" y="${-Math.cos(a / 2) * (r - 36) + 7}" text-anchor="middle" font-family="Plex Mono" font-weight="600" font-size="19" fill="${p.strong}">10</text>
    <rect x="-16" y="${-r - 18}" width="32" height="22" rx="6" fill="${G.text}"/>
    <circle r="12" fill="${G.text}"/><circle r="5" fill="#fbf7ef"/>`;
}

/* ------------------------------------------------------------ pile sort */

function pileSort() {
  const pin = plan("adhd/pin-4.3");
  const [person, date, nobody] = pin.content.items;
  // What each pile means, from the guide the strategy grounds them in
  // (guides.ts how-to-start-when-everything-is-overdue, "Three piles, not a ranking").
  const meaning = ["someone has asked, or will notice soon", "there is a real day it has to happen by", "it counts, but nothing changes this week"];

  // The doom pile: wide enough that the page crops it.
  const r = rng(43);
  const kinds = [
    { kind: "back", fill: PAPER.kraft },
    { kind: "front", fill: PAPER.offWhite, win: true },
    { kind: "back", fill: PAPER.cream },
    { kind: "front", fill: PAPER.blue, win: true },
    { kind: "flyer", fill: "#e9c7cf" },
    { kind: "back", fill: "#e5d3b6" },
    { kind: "front", fill: PAPER.cream, stamp: true },
    { kind: "back", fill: PAPER.offWhite },
    { kind: "coupons", fill: "#f1e3b8" },
    { kind: "front", fill: PAPER.kraft, stamp: "#b7889a" },
    { kind: "back", fill: PAPER.blue },
    { kind: "front", fill: PAPER.offWhite },
    { kind: "flyer", fill: "#c9d7d2" },
    { kind: "back", fill: "#d2b083" },
  ];
  // Rough rows across the band, denser in the middle, cropped at both edges.
  const spots = [
    [-30, 240], [170, 168], [370, 136], [570, 130], [770, 160], [970, 230],
    [60, 262], [260, 222], [460, 196], [650, 216], [850, 252], [1040, 280],
    [-20, 350], [150, 330], [330, 300], [520, 290], [700, 322], [880, 342],
    [80, 420], [280, 410], [470, 396], [660, 420],
  ];
  const pile = spots.map(([x, y], i) => {
    const k = kinds[(i * 5) % kinds.length];
    const w = k.kind === "flyer" ? 200 + r() * 30 : k.kind === "coupons" ? 190 : 230 + r() * 50;
    const h = k.kind === "flyer" ? 270 : k.kind === "coupons" ? 120 : w * (0.58 + r() * 0.06);
    const rot = -15 + r() * 35;
    return `<g transform="translate(${x + (r() - 0.5) * 30} ${y + (r() - 0.5) * 20}) rotate(${rot.toFixed(1)})" filter="url(#lift)">${envelope({ w, h, ...k })}</g>`;
  });

  // Three neat stacks, each a few envelopes offset so the stack reads.
  const stackAt = [190, 500, 810];
  const tops = [
    { kind: "front", fill: PAPER.cream, stamp: true }, // a person: a handwritten-looking letter
    { kind: "front", fill: PAPER.offWhite, win: true }, // a date: a window envelope, a bill
    { kind: "flyer", fill: "#e9c7cf" }, // nobody: a flyer
  ];
  const under = [
    [PAPER.kraft, PAPER.offWhite, PAPER.blue],
    [PAPER.cream, PAPER.kraft, PAPER.offWhite],
    [PAPER.offWhite, "#f1e3b8", PAPER.kraft],
  ];
  const stacks = stackAt.map((cx, s) => {
    const layers = under[s].map((fill, i) => `<g transform="translate(${cx - 9 + i * 3} ${148 - (3 - i) * -0 - i * 7}) rotate(${[-2.5, 1.5, -1][i]})" filter="url(#lift)">${envelope({ w: 236, h: 146, kind: i % 2 ? "front" : "back", fill })}</g>`).join("");
    const top = tops[s].kind === "flyer"
      ? `<g transform="translate(${cx + 2} ${120}) rotate(1.5)" filter="url(#lift)">${envelope({ w: 228, h: 150, ...tops[s] })}</g>`
      : `<g transform="translate(${cx + 2} ${124}) rotate(1)" filter="url(#lift)">${envelope({ w: 236, h: 146, ...tops[s] })}</g>`;
    return `<ellipse cx="${cx + 6}" cy="${232}" rx="132" ry="16" fill="#3b2a30" opacity=".09"/>${layers}${top}`;
  }).join("");

  const scene = `
  <svg class="mess" data-check="pile" viewBox="0 0 1000 520" aria-hidden="true">
    <defs><filter id="lift" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#3b2a30" flood-opacity=".2"/></filter></defs>
    <ellipse cx="500" cy="486" rx="540" ry="40" fill="#3b2a30" opacity=".08"/>
    ${pile.join("")}
    <g transform="translate(870 398) rotate(8)">${kitchenTimer()}</g>
  </svg>`;
  const arrows = `
  <svg class="arrows" viewBox="0 0 1000 120" aria-hidden="true">
    ${[[-300, 0], [0, 0], [300, 0]].map(([dx]) => {
      const x2 = 500 + dx, y2 = 104;
      const d = hand([[500 + dx * 0.22, 8], [500 + dx * 0.62, 46], [x2, y2]]);
      const ang = Math.atan2(y2 - 46, x2 - (500 + dx * 0.62));
      const head = (s) => `${x2 - Math.cos(ang + s) * 22} ${y2 - Math.sin(ang + s) * 22}`;
      return `<path d="${d}" stroke="${G.text}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M${head(0.5)} L${x2} ${y2} L${head(-0.5)}" stroke="${G.text}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join("")}
  </svg>`;
  const sorted = `
  <div class="sorted" data-check="piles">
    <svg class="stacks" viewBox="0 0 1000 250" aria-hidden="true">
      <defs><filter id="lift2" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#3b2a30" flood-opacity=".16"/></filter></defs>
      ${stacks.replace(/url\(#lift\)/g, "url(#lift2)")}
    </svg>
    <div class="labels">
      ${[person, date, nobody].map((label, i) => `<div class="pile${i === 2 ? " later" : ""}"><span class="tab">${esc(label)}</span><span class="means">${esc(meaning[i])}</span></div>`).join("")}
    </div>
  </div>`;

  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">Paperwork organization</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
  </div>
  ${scene}
  <p class="sub hand" data-check="sub">${esc(pin.sub)}</p>
  ${arrows}
  ${sorted}
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:68px;right:68px;top:66px;height:250px}
  .top h1{font-size:84px;line-height:1.0;letter-spacing:-.02em;margin-top:14px;font-weight:500;color:var(--ink)}
  .mess{position:absolute;left:0;top:272px;width:1000px;height:520px}
  .sub{position:absolute;left:60px;right:60px;top:792px;height:76px;text-align:center;font-size:56px;font-weight:600;line-height:70px;color:var(--ink)}
  .arrows{position:absolute;left:0;top:866px;width:1000px;height:120px}
  .sorted{position:absolute;left:0;right:0;top:944px;height:420px}
  .stacks{position:absolute;left:0;top:0;width:1000px;height:250px}
  .labels{position:absolute;left:40px;right:40px;top:248px;display:grid;grid-template-columns:repeat(3,1fr);gap:26px}
  .pile{display:flex;flex-direction:column;align-items:center;text-align:center;gap:10px}
  .tab{display:inline-block;background:var(--soft);color:var(--strong);border:2px solid ${p.accent};border-radius:12px;padding:6px 22px;font:600 30px "Plex";white-space:nowrap}
  .pile.later .tab{background:${G.surfaceMuted};border-color:${G.borderStrong};color:${G.muted}}
  .means{font-size:22px;line-height:1.3;color:var(--muted);max-width:270px}
  `;
  return { id: "pin-4.3-pile-sort", html: page(p, { body, css, paper: G.appBg, ink: G.text, muted: G.muted }) };
}

/* ------------------------------------------------------------ the button for "did not get to it" */

/** A paper habit tracker: a streak flame, a percent ring, a grid of days. The thing this app does not keep. */
function habitTracker() {
  const cols = 7, rows = 5, cell = 40, gx = 36, gy = 150;
  const r = rng(92);
  // Filled for a run of days, then the run breaks: the missed week.
  const filled = (i) => i < 17 && !(i === 9);
  const dots = Array.from({ length: cols * rows }, (_, i) => {
    const cx = gx + (i % cols) * cell + cell / 2, cy = gy + Math.floor(i / cols) * cell + cell / 2;
    return filled(i)
      ? `<circle cx="${cx}" cy="${cy}" r="13" fill="#7fae8f"/><path d="M${cx - 6} ${cy} l4 5 l8 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<circle cx="${cx}" cy="${cy}" r="13" fill="none" stroke="#d2c8cc" stroke-width="2.5"/>`;
  }).join("");
  const ring = (cx, cy, rr, f) => {
    const a = f * Math.PI * 2;
    return `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="#e8e1e3" stroke-width="12"/>
      <path d="M${cx} ${cy - rr} A${rr} ${rr} 0 ${f > 0.5 ? 1 : 0} 1 ${cx + Math.sin(a) * rr} ${cy - Math.cos(a) * rr}" fill="none" stroke="#7fae8f" stroke-width="12" stroke-linecap="round"/>
      <text x="${cx}" y="${cy + 13}" text-anchor="middle" font-family="Plex" font-weight="600" font-size="36" fill="#55796a">%</text>`;
  };
  const flame = `
    <g transform="translate(92 82)">
      <path d="M0 -46 C 18 -24 34 -8 30 14 C 27 34 12 44 0 44 C -16 44 -30 32 -30 12 C -30 -6 -18 -14 -14 -28 C -6 -18 -4 -10 -2 -4 C 4 -16 4 -30 0 -46 Z" fill="#f0a35b"/>
      <path d="M2 -8 C 12 4 18 14 14 26 C 11 36 5 40 0 40 C -9 40 -15 32 -14 22 C -13 12 -6 8 -4 0 C 0 6 1 8 2 10 Z" fill="#f8d36b"/>
    </g>`;
  const w = cols * cell + gx * 2;
  return `
    <rect x="6" y="10" width="${w}" height="372" rx="10" fill="#3b2a30" opacity=".12" filter="url(#blur)"/>
    <rect x="0" y="0" width="${w}" height="372" rx="10" fill="#fffdf8"/>
    <rect x="0" y="0" width="${w}" height="16" rx="8" fill="#e9e2d6"/>
    ${Array.from({ length: 9 }, (_, i) => `<circle cx="${24 + i * 39}" cy="8" r="5" fill="${G.appBg}"/>`).join("")}
    ${flame}
    ${ring(w - 78, 84, 40, 0.72)}
    <line x1="${gx}" y1="${gy - 14}" x2="${w - gx}" y2="${gy - 14}" stroke="#ece5e2" stroke-width="2"/>
    ${dots}
    <path d="${hand([[-22, 300], [120, 214 + r() * 6], [250, 140], [w + 26, 42]])}" stroke="${G.text}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".88"/>
    <path d="${hand([[-14, 318], [140, 226], [270, 152], [w + 30, 60]])}" stroke="${G.text}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`;
}

function didNotGetToIt() {
  const pin = plan("adhd/pin-9.2");
  const [prompt, ...options] = pin.content.items;
  // The step as the real Companion draws it (CompanionRun.tsx): the playbook
  // title as eyebrow, the progress bar, the prompt, its why, the choices.
  const playbookTitle = "Make a phone call"; // makeAPhoneCall.ts title
  const why = "Whatever you pick, this is the last thing it will ask."; // makeAPhoneCall.ts step "result"
  const chosen = "Did not get to it";
  const head = pin.headline.replace(/"([^"]+)"/, "“$1”");

  const screen = `
    <div class="phone" data-check="phone">
      <div class="screen">
        <div class="notch"></div>
        <div class="appbar">
          <svg viewBox="0 0 24 24" class="glyph"><path d="M15 5 L8 12 L15 19" stroke="${G.text}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <b>${esc(p.name)}</b>
          <svg viewBox="0 0 24 24" class="glyph"><path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="${G.text}" stroke-width="2.2" stroke-linecap="round"/></svg>
        </div>
        <div class="step">
          <div class="pb">${esc(playbookTitle)}</div>
          <div class="progress">${Array.from({ length: 6 }, () => `<i></i>`).join("")}</div>
          <h2 class="serif">${esc(prompt)}</h2>
          <p class="why">${esc(why)}</p>
          <ul>${options.map((o) => `<li class="${o === chosen ? "chosen" : ""}">${o === options[0] ? `<svg viewBox="0 0 16 16" class="check"><path d="M3 8.5 L6.5 12 L13 4.5" stroke="${G.text}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}${esc(o)}</li>`).join("")}</ul>
        </div>
      </div>
    </div>`;
  const props = `
  <svg class="props" viewBox="0 0 470 500" aria-hidden="true">
    <defs><filter id="blur"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <g transform="translate(40 70) rotate(-5)">${habitTracker()}</g>
    <g transform="translate(340 396) rotate(-38)">
      <rect x="-104" y="2" width="214" height="20" rx="10" fill="#3b2a30" opacity=".14" filter="url(#blur)"/>
      <path d="M-110 -9 L-132 0 L-110 9 Z" fill="#e8dccb"/><path d="M-126 -2.4 L-133 0 L-126 2.4 Z" fill="#2c2a2b"/>
      <rect x="-112" y="-11" width="200" height="22" rx="6" fill="#3f4a5c"/>
      <rect x="-112" y="-11" width="200" height="7" rx="3" fill="#56637a"/>
      <rect x="84" y="-12" width="22" height="24" rx="8" fill="#2f3747"/>
      <rect x="30" y="-16" width="64" height="8" rx="4" fill="#c7ccd4"/>
    </g>
  </svg>`;
  // The one thing, pointed at by hand from the tracker's side of the page.
  const pointer = (() => {
    const pts = [[18, 18], [40, 150], [150, 196], [262, 150]];
    const [ex, ey] = pts[pts.length - 1];
    const ang = Math.atan2(ey - 196, ex - 150);
    const head = (s) => `${ex - Math.cos(ang + s) * 26} ${ey - Math.sin(ang + s) * 26}`;
    return `
  <svg class="pointer" viewBox="0 0 280 230" aria-hidden="true">
    <path d="${hand(pts)}" stroke="${p.accent}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M${head(0.5)} L${ex} ${ey} L${head(-0.5)}" stroke="${p.accent}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
  })();

  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">ADHD weekly reset</div>
    <h1 class="serif">${esc(head)}</h1>
  </div>
  ${props}
  ${screen}
  ${pointer}
  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${foot(p, { cta: "price" })}`;
  const css = `
  .top{position:absolute;left:68px;right:68px;top:66px;height:270px}
  .top h1{font-size:72px;line-height:1.04;letter-spacing:-.018em;margin-top:14px;font-weight:500}
  .props{position:absolute;left:0;top:372px;width:470px;height:500px}
  .phone{position:absolute;left:452px;top:330px;width:508px;height:822px;border-radius:70px;background:#2a2428;padding:16px;box-shadow:0 40px 70px -34px rgba(59,42,48,.55),inset 0 0 0 2px #463c41}
  .screen{position:relative;width:100%;height:100%;border-radius:56px;background:${G.appBg};overflow:hidden;padding:64px 28px 0}
  .notch{position:absolute;top:18px;left:50%;width:120px;height:32px;margin-left:-60px;border-radius:20px;background:#2a2424}
  .appbar{display:flex;align-items:center;justify-content:space-between;padding:0 4px 16px;border-bottom:1.5px solid ${G.border};margin:0 -28px;padding-left:28px;padding-right:28px}
  .appbar b{font-size:23px;font-weight:600;color:${G.text}}
  .glyph{width:28px;height:28px}
  .step{padding-top:26px}
  .pb{font:700 22px "Plex";letter-spacing:.1em;text-transform:uppercase;color:${p.accent}}
  .progress{display:flex;gap:7px;margin:16px 0 22px}
  .progress i{flex:1;height:6px;border-radius:3px;background:${p.accent}}
  .step h2{font-size:48px;line-height:1.05;font-weight:500;color:${G.text}}
  .why{font-size:22px;line-height:1.36;color:${G.muted};margin-top:10px}
  .step ul{list-style:none;display:flex;flex-direction:column;gap:10px;margin-top:22px}
  .step li{display:flex;align-items:center;gap:10px;background:${G.surface};border:1.5px solid ${G.border};border-radius:16px;padding:15px 18px;font-size:23px;line-height:1.2;color:${G.text}}
  .step li.chosen{border:2.5px solid ${p.accent};background:${p.soft};color:${p.strong};font-weight:600}
  .check{width:22px;height:22px;flex:none}
  .pointer{position:absolute;left:226px;top:866px;width:280px;height:230px}
  .sub{position:absolute;left:68px;right:68px;top:1196px;height:110px;font-size:31px;line-height:1.36;color:var(--muted)}
  `;
  return { id: "pin-9.2-did-not-get-to-it", html: page(p, { body, css, paper: G.wash, ink: G.text, muted: G.muted }) };
}

export const pins = [pileSort(), didNotGetToIt()];
