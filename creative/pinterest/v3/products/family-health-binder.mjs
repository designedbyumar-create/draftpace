/**
 * Family Health Binder, v3 test pins: two of the seven visuals in
 * pinterest/strategy/family-health-binder.json, drawn from the family's own
 * kitchen, not a clinic.
 *
 * - health/pin-10.1, binder flat-lay (guide): an open binder on the kitchen
 *   table with one tab per person (labels.ts RELATIONSHIP_LABEL, coloured
 *   from personColors.ts PERSON_HUES), open at the Parent page with the
 *   guide's same headings on it (guides.ts,
 *   caring-for-a-parent-and-kids-one-place, "Set it up in an evening").
 * - health/pin-7.2, fridge and wallet (product): the Emergency card under a
 *   fridge magnet, its printed page being cut out, and a second copy in a
 *   wallet. Row labels and the cut line are generateEmergencyCard.tsx's own.
 *
 * Filled-in values are grey strokes, never invented names or numbers.
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("family-health-binder");
const STRATEGY = (await import("../../strategy/family-health-binder.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the family health binder strategy`);
  return pin;
};

/** The product's own palette (definition.ts theme and personColors.ts). */
const C = {
  rose: p.accent, strong: p.strong, soft: p.soft, wash: "#fdf1f4",
  ground: "#faf6f3", surface: "#fffdfb", ink: "#241a1b", line: "#eaddd6", tan: "#d5c3ba",
  stroke: "#d9cdc6", strokeDark: "#bcaea6",
  butter: "#f3d27a", peach: "#f2b48f",
};
const HUES = { rose: "#b23a5b", blue: "#3f6fb5", green: "#2f8a68", amber: "#b0791a", violet: "#7a55ad", rust: "#c25a2e" };
/** A quiet tint of a person colour, as the app mixes it with the surface. */
const tint = (hex, pct) => `color-mix(in srgb, ${hex} ${pct}%, ${C.surface})`;
const deep = (hex, pct = 70) => `color-mix(in srgb, ${hex} ${pct}%, ${C.ink})`;

const shadowDefs = `
  <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="8" dy="16" stdDeviation="12" flood-color="#4a2a1c" flood-opacity=".22"/></filter>
  <filter id="sh-s" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="3" dy="7" stdDeviation="5" flood-color="#4a2a1c" flood-opacity=".22"/></filter>`;

/** Grey fill strokes standing for whatever a family typed in. */
const strokes = (x, y, widths, { gap = 22, h = 9, fill = C.stroke } = {}) =>
  widths.map((w, i) => `<rect x="${x}" y="${y + i * gap}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>`).join("");

/* ------------------------------------------------------------ props */

/** A pill bottle lying on its side: amber body, white ridged cap, a blank label. */
function pillBottle() {
  return `
  <g filter="url(#sh-s)">
    <rect x="-70" y="-38" width="132" height="76" rx="14" fill="#c98f2e"/>
    <rect x="-70" y="-38" width="132" height="22" rx="10" fill="#d9a54a" opacity=".55"/>
    <rect x="-46" y="-30" width="88" height="60" rx="5" fill="${C.surface}"/>
    ${strokes(-36, -16, [62, 44], { gap: 18, h: 7 })}
    <rect x="60" y="-44" width="44" height="88" rx="9" fill="#fbfaf7"/>
    ${Array.from({ length: 6 }, (_, i) => `<line x1="${66 + i * 6.5}" y1="-38" x2="${66 + i * 6.5}" y2="38" stroke="#e1dcd3" stroke-width="2.5"/>`).join("")}
  </g>`;
}

/** A pen: ink barrel, rose clip, triangular tip. */
function pen() {
  return `
  <g filter="url(#sh-s)">
    <rect x="-150" y="-11" width="270" height="22" rx="11" fill="${C.ink}"/>
    <path d="M120 -9 L162 0 L120 9 Z" fill="#3a2d2e"/><path d="M150 -3 L162 0 L150 3 Z" fill="#c7b9b2"/>
    <rect x="-150" y="-11" width="60" height="22" rx="11" fill="#3a2d2e"/>
    <rect x="-128" y="-17" width="120" height="9" rx="4.5" fill="${C.rose}"/>
    <rect x="-40" y="-11" width="10" height="22" fill="#4a3c3d"/>
  </g>`;
}

/** A school form: wordless checkbox grid and label strokes, a child's crayon drawing in the corner. */
function schoolForm(w, h) {
  const rows = Math.floor((h - 120) / 46);
  const boxes = [];
  for (let r = 0; r < rows; r++) {
    boxes.push(`<rect x="28" y="${110 + r * 46}" width="20" height="20" rx="3" fill="none" stroke="#b9aca5" stroke-width="2.5"/>`);
    boxes.push(`<rect x="60" y="${116 + r * 46}" width="${[120, 150, 90, 140, 110, 130, 100, 145][r % 8]}" height="8" rx="4" fill="${C.stroke}"/>`);
    boxes.push(`<rect x="${w - 118}" y="${112 + r * 46}" width="18" height="18" rx="3" fill="none" stroke="#b9aca5" stroke-width="2.5"/>`);
    boxes.push(`<rect x="${w - 90}" y="${117 + r * 46}" width="58" height="8" rx="4" fill="${C.stroke}"/>`);
  }
  const sun = `<g transform="translate(${w - 50} 44)" stroke="#f0ad1c" stroke-linecap="round" fill="none">
    <circle r="15" stroke-width="6"/><path d="M-6 -4 l12 0 M-8 3 l16 0 M-5 9 l10 0" stroke-width="5" opacity=".7"/>
    ${Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2; return `<line x1="${Math.cos(a) * 22}" y1="${Math.sin(a) * 22}" x2="${Math.cos(a) * 32}" y2="${Math.sin(a) * 32}" stroke-width="4.5"/>`; }).join("")}
  </g>`;
  return `
  <rect width="${w}" height="${h}" rx="4" fill="#ffffff"/>
  <rect x="28" y="34" width="${w * 0.44}" height="14" rx="7" fill="${C.strokeDark}"/>
  <rect x="28" y="60" width="${w * 0.28}" height="8" rx="4" fill="${C.stroke}"/>
  ${boxes.join("")}
  ${sun}
  <path d="M${w - 130} 92 q12 -14 22 0 t22 0 t22 0 t22 0 t22 0" fill="none" stroke="#5db36a" stroke-width="5" stroke-linecap="round"/>
  <path d="M${w - 112} 90 l-4 -16 M${w - 70} 90 l3 -14" stroke="#5db36a" stroke-width="4" stroke-linecap="round"/>
  <circle cx="${w - 116}" cy="70" r="6" fill="#e86a8a"/><circle cx="${w - 67}" cy="72" r="6" fill="#6a8fe8"/>`;
}

/* ------------------------------------------------------------ binder flat-lay */

/**
 * One tab per person, in the order the strategy names them, each in its own
 * person colour. Parent is the open section, pulled forward and outlined.
 */
function binderFlatlay() {
  const pin = plan("health/pin-10.1");
  // "Person tabs: Child, Child, Parent, You (...)"; "Same headings on every page: allergies, ..."
  const people = pin.content.items[0].match(/:\s*([^(]+)/)[1].split(",").map((s) => s.trim());
  const headings = pin.content.items[1].split(":")[1].split(",").map((s) => s.trim());
  const hues = [HUES.blue, HUES.green, HUES.amber, HUES.rose];
  const open = people.indexOf("Parent");

  // Binder frame: covers 426 wide either side of a 60 spine; the open page 372 x 492.
  const PX = 52, PY = -246, PW = 372, PH = 492;
  const ringsY = [-160, 0, 160];
  const tabs = people.map((who, i) => {
    const y = PY + 30 + i * 96, hue = hues[i], isOpen = i === open;
    const x = PX + PW - 8, w = isOpen ? 150 : 136;
    return `
      <g ${isOpen ? 'filter="url(#sh-s)"' : ""}>
        <path d="M${x} ${y} h${w} a16 16 0 0 1 16 16 v50 a16 16 0 0 1 -16 16 h-${w} z" fill="${tint(hue, isOpen ? 36 : 24)}" ${isOpen ? `stroke="${C.ink}" stroke-width="3.5"` : `stroke="${tint(hue, 48)}" stroke-width="2"`}/>
        <rect x="${x}" y="${y + 2}" width="9" height="78" fill="${hue}" opacity=".9"/>
        <text x="${x + 26}" y="${y + 52}" font-family="Plex" font-weight="600" font-size="31" fill="${deep(hue)}">${esc(who)}</text>
      </g>`;
  }).join("");
  // Divider pages beneath the open page, their edges showing.
  const stack = people.map((_, i) => `<rect x="${PX + 4 + i * 3}" y="${PY + 4 + i * 3}" width="${PW}" height="${PH}" rx="4" fill="${i % 2 ? "#f3ebe5" : "#fbf7f4"}" stroke="${C.line}" stroke-width="1.5"/>`).reverse().join("");

  const TX = PX + 66;
  const sec = headings.map((h, i) => {
    const y = PY + 156 + i * 72;
    const band = i === 0 ? `<rect x="${TX - 18}" y="${y - 34}" width="${PW - TX + PX - 6}" height="70" rx="8" fill="${C.soft}"/>` : "";
    const rule = i > 0 ? `<line x1="${TX}" y1="${y - 40}" x2="${PX + PW - 30}" y2="${y - 40}" stroke="${C.line}" stroke-width="2"/>` : "";
    return `${band}${rule}<text x="${TX}" y="${y}" font-family="Plex" font-weight="600" font-size="26" letter-spacing="1.8" fill="${C.rose}">${esc(h.toUpperCase())}</text>
      ${strokes(TX, y + 13, [[200, 230, 170, 210, 240][i]], { h: 9, fill: i === 0 ? "#dcbfc6" : C.stroke })}`;
  }).join("");
  const thePage = `
    <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" rx="4" fill="#ffffff"/>
    <rect x="${PX}" y="${PY}" width="${PW}" height="12" fill="${C.rose}"/>
    <rect x="${TX - 18}" y="${PY + 42}" width="12" height="46" rx="6" fill="${hues[open]}"/>
    <text x="${TX + 8}" y="${PY + 77}" font-family="Newsreader" font-weight="500" font-size="40" fill="${C.ink}">${esc(people[open])}</text>
    ${sec}
    ${ringsY.map((dy) => `<circle cx="${PX + 24}" cy="${dy}" r="9" fill="#efe6e0"/>`).join("")}`;

  // D-rings: a steel bar on the cover, each ring rising over the page's punched holes.
  const rings = ringsY.map((dy) => `
    <path d="M${PX - 26} ${dy} C ${PX - 26} ${dy - 26}, ${PX + 34} ${dy - 26}, ${PX + 34} ${dy}" fill="none" stroke="#8f979e" stroke-width="10" stroke-linecap="round"/>
    <path d="M${PX - 22} ${dy - 4} C ${PX - 20} ${dy - 24}, ${PX + 26} ${dy - 24}, ${PX + 30} ${dy - 6}" fill="none" stroke="#e6eaee" stroke-width="3" stroke-linecap="round"/>`).join("");

  // Left half: the inside cover's clear pocket, a child's school form tucked in it.
  const left = `
    <g transform="translate(-396 -280) rotate(-1.5)">${schoolForm(330, 540)}</g>
    <rect x="-414" y="-96" width="370" height="372" rx="10" fill="#ffffff" fill-opacity=".34" stroke="#ffffff" stroke-opacity=".8" stroke-width="3"/>
    <path d="M-400 -84 L-300 -84 L-402 60 Z" fill="#ffffff" opacity=".22"/>
    <path d="M-414 -96 h370" stroke="#ffffff" stroke-width="7" opacity=".7" stroke-linecap="round"/>`;

  const binder = `
  <g transform="translate(452 420) rotate(-6) scale(.9)">
    <g filter="url(#sh)">
      <rect x="-456" y="-306" width="430" height="612" rx="24" fill="${C.rose}"/>
      <rect x="26" y="-306" width="430" height="612" rx="24" fill="${C.rose}"/>
      <rect x="-32" y="-306" width="64" height="612" fill="${C.strong}"/>
    </g>
    <rect x="-442" y="-292" width="402" height="584" rx="16" fill="#be4a69"/>
    <rect x="40" y="-292" width="402" height="584" rx="16" fill="#be4a69"/>
    <line x1="-32" y1="-300" x2="-32" y2="300" stroke="#6e1b33" stroke-width="3"/><line x1="32" y1="-300" x2="32" y2="300" stroke="#6e1b33" stroke-width="3"/>
    ${left}
    <rect x="${PX - 40}" y="-236" width="24" height="472" rx="9" fill="#aab2b9"/><rect x="${PX - 34}" y="-230" width="6" height="460" rx="3" fill="#dfe4e8"/>
    ${stack}
    <g filter="url(#sh-s)">${thePage}</g>
    ${tabs}
    ${rings}
  </g>`;

  const grain = Array.from({ length: 14 }, (_, i) => {
    const y = 30 + i * 62;
    return `<path d="M-20 ${y} C 220 ${y - 14}, 420 ${y + 16}, 640 ${y - 4} S 900 ${y + 10}, 1020 ${y - 6}" fill="none" stroke="#7a4a26" stroke-width="${i % 4 ? 2 : 3}" opacity="${i % 4 ? 0.06 : 0.1}"/>`;
  }).join("");

  const scene = `
  <svg class="scene" data-check="binder" viewBox="0 0 1000 860" aria-hidden="true">
    <defs>${shadowDefs}</defs>
    <rect width="1000" height="860" fill="#e7cfb2"/>
    ${grain}
    ${[215, 430, 645].map((y) => `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="#a86f45" stroke-width="2" opacity=".14"/>`).join("")}
    ${binder}
    <g transform="translate(150 792) rotate(-8)">${pillBottle()}</g>
    <g transform="translate(770 796) rotate(-12)">${pen()}</g>
  </svg>`;

  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">One page each</div>
    <h1 class="serif">${pin.headline.split(": ").map((part, i, all) => `<span>${esc(part)}${i < all.length - 1 ? ":" : ""}</span>`).join(" ")}</h1>
  </div>
  ${scene}
  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:64px;right:64px;top:62px;height:290px}
  .top h1{font-size:64px;line-height:1.04;letter-spacing:-.015em;margin-top:16px;font-weight:500}
  .top h1 span{display:block;text-wrap:balance}
  .scene{position:absolute;left:0;top:360px;width:1000px;height:860px}
  .sub{position:absolute;left:64px;right:64px;top:1246px;height:90px;font-size:28px;line-height:1.35;color:var(--muted)}
  `;
  return { id: "pin-10.1-binder-flatlay", html: page(p, { body, css, paper: C.ground, ink: C.ink, muted: "#6f5f5c" }) };
}

/* ------------------------------------------------------------ fridge and wallet */

/**
 * The Emergency card as it prints: name, then ALLERGIES in its soft box,
 * then the five rows that follow it. Values are grey strokes.
 */
function emergencyCard(labels, { w, h, label = 21, scale = 1 }) {
  const [allergies, ...rows] = labels;
  const pad = 26;
  const rowY0 = 168;
  const rowGap = (h - rowY0 - 26) / rows.length;
  return `
  <rect width="${w}" height="${h}" rx="16" fill="#ffffff"/>
  <rect x="10" y="10" width="${w - 20}" height="${h - 20}" rx="11" fill="none" stroke="#9c8c86" stroke-width="2.5" stroke-dasharray="10 8"/>
  <rect x="${pad}" y="30" width="${w * 0.46}" height="18" rx="9" fill="#5a4a4b"/>
  <rect x="${pad}" y="58" width="${w * 0.26}" height="9" rx="4.5" fill="${C.stroke}"/>
  <rect x="${pad}" y="80" width="${w - pad * 2}" height="72" rx="9" fill="${C.soft}"/>
  <text x="${pad + 16}" y="${80 + 31}" font-family="Plex" font-weight="700" font-size="${label}" letter-spacing="${1.8 * scale}" fill="${C.rose}">${esc(allergies)}</text>
  <rect x="${pad + 16}" y="${80 + 44}" width="${w * 0.5}" height="13" rx="6.5" fill="#6b5557"/>
  ${rows.map((r, i) => {
    const y = rowY0 + 8 + i * rowGap + rowGap / 2;
    return `<text x="${pad}" y="${y + label * 0.36}" font-family="Plex" font-weight="500" font-size="${label}" letter-spacing="${1.2 * scale}" fill="#7d6c6a">${esc(r)}</text>
      <rect x="${pad + label * 8.4}" y="${y - 4}" width="${[0.34, 0.42, 0.3, 0.38, 0.33][i] * w}" height="9" rx="4.5" fill="${C.stroke}"/>`;
  }).join("")}`;
}

function fridgeAndWallet() {
  const pin = plan("health/pin-7.2");
  const items = pin.content.items;
  const labels = items.filter((s) => /^[A-Z]+$/.test(s)); // ALLERGIES ... INSURANCE
  const cutLine = items.find((s) => /dashed line/.test(s));

  // A child's crayon drawing on the freezer door: a house, a sun, grass. Wordless.
  const drawing = `
    <rect width="210" height="160" rx="3" fill="#ffffff"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M40 132 V82 L86 46 L132 82 V132 Z" stroke="#e0607e" stroke-width="5"/>
      <path d="M48 124 l70 -6 M50 110 l68 -8 M52 96 l60 -6" stroke="#f3b2c2" stroke-width="5" opacity=".8"/>
      <path d="M74 132 V106 H96 V132" stroke="#6a8fe8" stroke-width="5"/>
      <circle cx="170" cy="40" r="15" stroke="#f0ad1c" stroke-width="5"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="${170 + Math.cos(a) * 21}" y1="${40 + Math.sin(a) * 21}" x2="${170 + Math.cos(a) * 30}" y2="${40 + Math.sin(a) * 30}" stroke="#f0ad1c" stroke-width="4"/>`; }).join("")}
      <path d="M12 140 q10 -12 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#5db36a" stroke-width="5"/>
    </g>`;

  const magnet = (fill, rim, r = 34) => `
    <circle r="${r}" fill="${fill}"/><circle r="${r}" fill="none" stroke="${rim}" stroke-width="3"/>
    <path d="M${-r * 0.55} ${-r * 0.4} a${r * 0.65} ${r * 0.65} 0 0 1 ${r * 0.55} ${-r * 0.3}" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="${r * 0.18}" stroke-linecap="round"/>`;

  // The fridge: a tall door filling the left of the pin, freezer above.
  const fridge = `
  <svg class="fridge" data-check="fridge" viewBox="0 0 640 940" aria-hidden="true">
    <defs>${shadowDefs}
      <linearGradient id="door" x1="0" x2="1"><stop offset="0" stop-color="#ebe6e1"/><stop offset=".8" stop-color="#f2eeea"/><stop offset="1" stop-color="#e4ded8"/></linearGradient>
    </defs>
    <rect x="-40" y="0" width="660" height="960" rx="30" fill="#d6cec7"/>
    <rect x="-40" y="0" width="650" height="276" rx="26" fill="url(#door)"/>
    <rect x="-40" y="288" width="650" height="700" rx="26" fill="url(#door)"/>
    <rect x="-40" y="270" width="650" height="6" fill="#ddd6cf"/>
    <rect x="568" y="90" width="22" height="140" rx="11" fill="#cbc3bb"/><rect x="573" y="94" width="9" height="132" rx="4.5" fill="#f8f5f2"/>
    <rect x="568" y="330" width="22" height="340" rx="11" fill="#cbc3bb"/><rect x="573" y="334" width="9" height="332" rx="4.5" fill="#f8f5f2"/>
    <g transform="translate(232 62) rotate(3)"><g filter="url(#sh-s)">${drawing}</g><g transform="translate(104 4)" filter="url(#sh-s)">${magnet(C.peach, "#e0976f", 22)}</g></g>
    <g transform="translate(52 374) rotate(-2)">
      <g filter="url(#sh)">${emergencyCard(labels, { w: 500, h: 460, label: 24 })}</g>
    </g>
    <g transform="translate(300 370)" filter="url(#sh-s)">${magnet(C.butter, "#e2b84f")}</g>
  </svg>`;

  // Right column, top: the printed page with the card on it, half cut out.
  const sheet = `
  <svg class="sheet" data-check="sheet" viewBox="0 0 320 400" aria-hidden="true">
    <defs>${shadowDefs}</defs>
    <g transform="translate(22 14) rotate(3)">
      <g filter="url(#sh-s)"><rect width="276" height="357" rx="4" fill="#ffffff"/></g>
      <rect width="276" height="10" fill="${C.rose}"/>
      <rect x="22" y="30" width="112" height="8" rx="4" fill="#e3b3c0"/>
      <rect x="22" y="48" width="196" height="7" rx="3.5" fill="${C.stroke}"/>
      <rect x="22" y="72" width="232" height="146" rx="8" fill="none" stroke="#9c8c86" stroke-width="2.5" stroke-dasharray="9 7"/>
      <rect x="38" y="90" width="104" height="11" rx="5.5" fill="#5a4a4b"/>
      <rect x="38" y="112" width="200" height="36" rx="6" fill="${C.soft}"/>
      <rect x="48" y="132" width="96" height="8" rx="4" fill="#d7a7b4"/>
      ${strokes(38, 162, [150, 120, 166], { gap: 17, h: 7 })}
      ${strokes(22, 236, [228, 160], { gap: 16, h: 6 })}
      <g transform="translate(140 218) rotate(-4)">
        <path d="M6 -6 L-136 -18 Q-140 -14 -136 -11 L6 2 Z" fill="#cdd4d9"/><path d="M-136 -18 Q-140 -14 -136 -11 L-60 -4 Z" fill="#e8ecef"/>
        <path d="M6 6 L-128 12 Q-131 17 -127 19 L6 -2 Z" fill="#a9b2b9"/>
        <path d="M2 -4 C 18 -10, 26 -16, 34 -22" stroke="${C.rose}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M2 4 C 18 10, 26 16, 34 22" stroke="${C.strong}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <ellipse cx="58" cy="-32" rx="25" ry="16" transform="rotate(-20 58 -32)" fill="none" stroke="${C.rose}" stroke-width="9"/>
        <ellipse cx="58" cy="32" rx="25" ry="16" transform="rotate(20 58 32)" fill="none" stroke="${C.strong}" stroke-width="9"/>
        <circle r="6" fill="#7d878e"/><circle r="2.5" fill="#dfe4e8"/>
      </g>
    </g>
  </svg>`;

  // Right column, bottom: a second copy slid into a card-holder wallet.
  const wallet = `
  <svg class="wallet" data-check="wallet" viewBox="0 0 320 290" aria-hidden="true">
    <defs>${shadowDefs}</defs>
    <g transform="translate(16 12) rotate(-3)">
      <g filter="url(#sh)"><rect x="0" y="64" width="288" height="200" rx="20" fill="#8e5d3d"/></g>
      <g transform="translate(46 0) rotate(-5)">
        <rect width="206" height="130" rx="9" fill="#ffffff"/>
        <rect x="6" y="6" width="194" height="118" rx="6" fill="none" stroke="#9c8c86" stroke-width="2" stroke-dasharray="7 6"/>
        <rect x="18" y="18" width="88" height="10" rx="5" fill="#5a4a4b"/>
        <rect x="16" y="36" width="174" height="42" rx="6" fill="${C.soft}"/>
        <text x="28" y="65" font-family="Plex" font-weight="700" font-size="20" letter-spacing="1.4" fill="${C.rose}">${esc(labels[0])}</text>
      </g>
      <path d="M0 112 Q0 98 16 98 H112 Q122 98 124 108 A20 20 0 0 0 164 108 Q166 98 176 98 H272 Q288 98 288 112 V244 Q288 264 268 264 H20 Q0 264 0 244 Z" fill="#b07a55"/>
      <path d="M180 110 H268 Q276 110 276 118 V240 Q276 252 264 252 H24 Q12 252 12 240 V118 Q12 110 20 110 H108" fill="none" stroke="#e6c9a8" stroke-width="2.5" stroke-dasharray="8 7"/>
      <path d="M0 196 H288" stroke="#9a6644" stroke-width="2.5" opacity=".6"/>
    </g>
  </svg>`;

  const body = `
  <div class="band"></div>
  <div class="top" data-check="headline">
    <div class="eyebrow">Emergency card</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
  </div>
  ${fridge}
  ${sheet}
  <p class="cut" data-check="cut">${esc(cutLine)}</p>
  ${wallet}
  <p class="sub" data-check="sub">${esc(pin.sub)}</p>
  ${foot(p, { cta: "price" })}`;
  const css = `
  .band{position:absolute;left:0;right:0;top:0;height:330px;background:${C.wash}}
  .top{position:absolute;left:64px;right:64px;top:64px;height:250px}
  .top h1{font-size:74px;line-height:1.03;letter-spacing:-.02em;margin-top:16px;font-weight:500;text-wrap:balance}
  .fridge{position:absolute;left:0;top:330px;width:640px;height:940px}
  .sheet{position:absolute;left:660px;top:372px;width:320px;height:400px}
  .cut{position:absolute;left:684px;right:36px;top:790px;height:96px;font-size:24px;line-height:1.32;color:var(--muted)}
  .wallet{position:absolute;left:652px;top:930px;width:320px;height:290px}
  .sub{position:absolute;left:64px;right:64px;top:1290px;height:76px;font-size:26px;line-height:1.35;color:var(--muted)}
  `;
  return { id: "pin-7.2-fridge-and-wallet", html: page(p, { body, css, paper: C.ground, ink: C.ink, muted: "#6f5f5c" }) };
}

export const pins = [binderFlatlay(), fridgeAndWallet()];
