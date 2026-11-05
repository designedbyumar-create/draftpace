/**
 * Travel Companion, v3 test pins: two of the seven visuals in
 * pinterest/strategy/travel-companion.json, drawn from travel's own world.
 *
 * - travel/pin-5.1, departure board: the guide's real "what to do, in
 *   order" timeline as split-flap rows (guides.ts,
 *   flight-delayed-with-a-connection-what-to-do-first).
 * - travel/pin-3.3, packing flat-lay: an open carry-on and the guide's
 *   real "what stays in reach" items, numbered (guides.ts,
 *   carry-on-only-packing-list; the liquids bag from STARTER_LISTS).
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("travel-companion");
const STRATEGY = (await import("../../strategy/travel-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the travel strategy`);
  return pin;
};

/* ------------------------------------------------------------ departure board */

function departureBoard() {
  const pin = plan("travel/pin-5.1");
  const rows = pin.content.items.map((line) => line.split(" · "));
  const flap = (text, cls) => `<span class="flap ${cls}">${esc(text)}</span>`;
  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">What to do, in order</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  <div class="board" data-check="board">
    <div class="board-head">
      <svg class="clock" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#f4efe6"/><circle cx="32" cy="32" r="29" fill="none" stroke="#3a4247" stroke-width="3"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<line x1="${32 + Math.sin(a) * 22}" y1="${32 - Math.cos(a) * 22}" x2="${32 + Math.sin(a) * 26}" y2="${32 - Math.cos(a) * 26}" stroke="#3a4247" stroke-width="${i % 3 ? 1.5 : 3}"/>`; }).join("")}<line x1="32" y1="32" x2="32" y2="13" stroke="#1d1d20" stroke-width="3.5" stroke-linecap="round"/><line x1="32" y1="32" x2="45" y2="38" stroke="#1d1d20" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#c0392b"/></svg>
      <div class="cols"><span>When</span><span>What to do</span></div>
    </div>
    <div class="status"><span class="flap amber">Your flight</span><span class="flap red">Delayed</span></div>
    ${rows.map(([when, what], i) => `<div class="row"><span class="n">${i + 1}</span>${flap(when, "amber when")}${flap(what, "what")}</div>`).join("")}
  </div>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:64px;right:64px;top:70px;height:390px}
  .top h1{font-size:60px;line-height:1.06;letter-spacing:-.015em;margin-top:16px;font-weight:500}
  .top p{font-size:27px;line-height:1.35;color:var(--muted);margin-top:18px;max-width:820px}
  .board{position:absolute;left:40px;right:40px;top:480px;height:850px;background:#15191c;border-radius:26px;padding:30px 30px 34px;box-shadow:0 30px 60px -28px rgba(0,0,0,.55),inset 0 0 0 6px #22292e}
  .board-head{display:flex;align-items:center;gap:22px;padding:0 6px 20px;border-bottom:2px solid #2b3338}
  .clock{width:66px;height:66px;flex:none}
  .cols{display:grid;grid-template-columns:260px 1fr;flex:1;font:600 19px "Plex";letter-spacing:.2em;text-transform:uppercase;color:#8b969c}
  .status{display:flex;gap:12px;margin:26px 0 14px 54px}
  .flap{position:relative;display:inline-block;font:500 27px/1.25 "Plex Mono";letter-spacing:.02em;background:linear-gradient(#20272b 0 49%,#0e1215 49% 51%,#1b2125 51%);border-radius:7px;padding:10px 14px;color:#eef1f2;text-transform:uppercase}
  .flap.amber{color:#ffc34d}.flap.red{color:#ff6b5b}
  .row{display:grid;grid-template-columns:40px 262px 1fr;gap:12px;align-items:stretch;margin-top:12px}
  .row .n{font:600 22px "Plex Mono";color:#5c676d;padding-top:12px;text-align:right}
  .row .when{font-size:21px;line-height:1.28;display:flex;align-items:center;padding:12px 14px}
  .row .what{font-size:25px;line-height:1.28;text-transform:none;letter-spacing:0;padding:12px 16px}
  `;
  return { id: "pin-5.1-departure-board", html: page(p, { body, css, paper: "#f4efe6" }) };
}

/* ------------------------------------------------------------ packing flat-lay */

/** Top-down drawings, each centred on its own origin. */
const ink = "#1f2a2e";
const DRAW = {
  carryOn: () => `
    <g>
      <rect x="-312" y="-226" width="300" height="452" rx="34" fill="#00434d"/>
      <rect x="-302" y="-216" width="280" height="432" rx="28" fill="#00626f"/>
      <rect x="-286" y="-200" width="248" height="400" rx="20" fill="#d6e7e6"/>
      <rect x="-270" y="-182" width="216" height="170" rx="14" fill="#c4dad9"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${-262 + i * 25}" y1="-176" x2="${-262 + i * 25}" y2="-18" stroke="#a9c6c5" stroke-width="2"/>`).join("")}
      <rect x="-270" y="-24" width="216" height="10" rx="5" fill="#00626f"/>
      <rect x="-210" y="-246" width="96" height="26" rx="13" fill="#00434d"/>
      <rect x="12" y="-226" width="300" height="452" rx="34" fill="#00434d"/>
      <rect x="22" y="-216" width="280" height="432" rx="28" fill="#00626f"/>
      <rect x="38" y="-200" width="248" height="400" rx="20" fill="#e3efee"/>
      <path d="M-12 -200 V 200" stroke="#9fb9b8" stroke-width="6" stroke-dasharray="2 9" stroke-linecap="round"/>
      ${[-180, 180].flatMap((y) => [-290, 290].map((x) => `<circle cx="${x}" cy="${y + (y > 0 ? 34 : -34)}" r="13" fill="#2b2f31"/>`)).join("")}
    </g>`,
  shirt: () => `
    <g>
      <rect x="-92" y="-70" width="184" height="140" rx="10" fill="#fbfaf7"/>
      <path d="M-30 -70 L0 -40 L30 -70 Z" fill="#e8e5de"/>
      <path d="M-30 -70 L-14 -40 L0 -40 Z M30 -70 L14 -40 L0 -40 Z" fill="#fff"/>
      <line x1="0" y1="-40" x2="0" y2="70" stroke="#e1ddd4" stroke-width="3"/>
      ${[-12, 14, 40].map((y) => `<circle cx="0" cy="${y}" r="3.5" fill="#cfcac0"/>`).join("")}
      <rect x="-92" y="44" width="184" height="26" rx="6" fill="#efece6"/>
    </g>`,
  underwear: () => `<g><rect x="-58" y="-36" width="116" height="72" rx="16" fill="#9fb3c8"/><path d="M-58 -10 H58" stroke="#8aa0b6" stroke-width="4"/><path d="M-40 36 Q0 0 40 36" fill="#8aa0b6"/></g>`,
  passportPhone: () => `
    <g>
      <rect x="-82" y="-60" width="104" height="146" rx="8" fill="#1d2b4a" transform="rotate(-8)"/>
      <circle cx="-28" cy="0" r="22" fill="none" stroke="#c9a85a" stroke-width="3" transform="rotate(-8)"/>
      <rect x="-56" y="44" width="56" height="5" rx="2.5" fill="#c9a85a" transform="rotate(-8)"/>
      <rect x="10" y="-82" width="86" height="168" rx="16" fill="#26292b" transform="rotate(6)"/>
      <rect x="17" y="-72" width="72" height="148" rx="10" fill="#3b4a52" transform="rotate(6)"/>
      <rect x="42" y="-78" width="22" height="5" rx="2.5" fill="#111" transform="rotate(6)"/>
    </g>`,
  pillPouch: () => `
    <g>
      <rect x="-80" y="-48" width="160" height="96" rx="24" fill="#e7b7a6"/>
      <path d="M-80 -14 H80" stroke="#c98f7c" stroke-width="5"/>
      <rect x="50" y="-26" width="18" height="10" rx="4" fill="#9a6555"/>
      <rect x="-56" y="2" width="44" height="26" rx="6" fill="#fbfaf7"/>
      <g fill="#fff">${[[-46, 10], [-30, 10], [-46, 21], [-30, 21]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" stroke="#d8d2c8" stroke-width="1.5"/>`).join("")}</g>
    </g>`,
  chargerHeadphones: () => `
    <g>
      <path d="M-70 10 a46 46 0 1 1 92 0 a36 36 0 1 1 -72 0 a26 26 0 1 1 52 0" fill="none" stroke="#fbfaf7" stroke-width="7" stroke-linecap="round"/>
      <rect x="-104" y="-6" width="40" height="34" rx="7" fill="#fbfaf7"/>
      <rect x="-98" y="-18" width="6" height="14" rx="2" fill="#bdb7ad"/><rect x="-80" y="-18" width="6" height="14" rx="2" fill="#bdb7ad"/>
      <path d="M40 -46 q48 -34 96 0" fill="none" stroke="#2e3335" stroke-width="12" stroke-linecap="round"/>
      <rect x="22" y="-46" width="36" height="58" rx="16" fill="#2e3335"/><rect x="118" y="-46" width="36" height="58" rx="16" fill="#2e3335"/>
      <rect x="28" y="-36" width="24" height="38" rx="10" fill="#4a5154"/><rect x="124" y="-36" width="24" height="38" rx="10" fill="#4a5154"/>
    </g>`,
  snackBottle: () => `
    <g>
      <rect x="-104" y="-26" width="120" height="52" rx="10" fill="#d99a3d" transform="rotate(-12)"/>
      <path d="M-104 -26 l12 26 l-12 26 M16 -26 l-12 26 l12 26" fill="#c4842a" transform="rotate(-12)"/>
      <rect x="-80" y="-10" width="72" height="20" rx="6" fill="#f2c27a" transform="rotate(-12)"/>
      <rect x="40" y="-30" width="146" height="60" rx="26" fill="#bcd6dc"/>
      <rect x="186" y="-16" width="24" height="32" rx="6" fill="#4d6e77"/>
      <rect x="64" y="-30" width="10" height="60" fill="#a7c5cc"/>
    </g>`,
  liquids: () => `
    <g>
      <rect x="-104" y="-74" width="208" height="148" rx="18" fill="#ffffff" fill-opacity=".55" stroke="#9fc0c4" stroke-width="3"/>
      <rect x="-104" y="-74" width="208" height="22" rx="10" fill="#7fb2b8"/>
      <rect x="-80" y="-34" width="34" height="88" rx="12" fill="#f2a7a0"/><rect x="-74" y="-46" width="22" height="14" rx="4" fill="#c66b63"/>
      <rect x="-30" y="-16" width="44" height="70" rx="10" fill="#9fd1b7"/><rect x="-22" y="-28" width="28" height="14" rx="4" fill="#4f9a77"/>
      <rect x="30" y="-24" width="50" height="78" rx="22" fill="#f6dc8c"/><rect x="44" y="-36" width="22" height="14" rx="4" fill="#c9a440"/>
    </g>`,
};

function packingFlatlay() {
  const pin = plan("travel/pin-3.3");
  const items = pin.content.items;
  // Where each real item lies around (or in) the bag, and where its number sits.
  const placed = [
    { draw: "passportPhone", at: [108, 170], tag: [196, 64] },
    { draw: "pillPouch", at: [110, 440], tag: [196, 372] },
    { draw: "shirt", at: [614, 290], s: 0.92, tag: [742, 180], extra: { draw: "underwear", at: [614, 452] } },
    { draw: "chargerHeadphones", at: [640, 628], tag: [826, 568] },
    { draw: "snackBottle", at: [292, 628], tag: [176, 568] },
    { draw: "liquids", at: [347, 430], s: 0.82, tag: [456, 352] },
  ];
  const shadow = (svg, [x, y], s = 1) => `<g transform="translate(${x + 6} ${y + 10}) scale(${s})" opacity=".14" filter="url(#soft)">${svg.replace(/fill="[^"]+"/g, 'fill="#3b2f1e"').replace(/stroke="[^"]+"/g, 'stroke="#3b2f1e"')}</g><g transform="translate(${x} ${y}) scale(${s})">${svg}</g>`;
  const scene = `
  <svg class="scene" data-check="scene" viewBox="0 0 900 760" aria-hidden="true">
    <defs><filter id="soft"><feGaussianBlur stdDeviation="7"/></filter></defs>
    ${shadow(DRAW.carryOn(), [480, 350], 0.82)}
    ${placed.flatMap((it) => [shadow(DRAW[it.draw](), it.at, it.s), it.extra ? shadow(DRAW[it.extra.draw](), it.extra.at) : ""]).join("")}
    ${placed.map((it, i) => `<g transform="translate(${it.tag[0]} ${it.tag[1]})"><circle r="25" fill="${p.accent}"/><text y="9" text-anchor="middle" font-family="Plex Mono" font-weight="600" font-size="26" fill="#fff">${i + 1}</text></g>`).join("")}
  </svg>`;
  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">What stays in reach</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${scene}
  <ol class="legend" data-check="legend">${items.map((it, i) => `<li><span>${i + 1}</span>${esc(it)}</li>`).join("")}</ol>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:64px;right:64px;top:70px;height:300px}
  .top h1{font-size:76px;line-height:1.02;letter-spacing:-.02em;margin-top:16px;font-weight:500}
  .top p{font-size:27px;line-height:1.35;color:var(--muted);margin-top:18px;max-width:800px}
  .scene{position:absolute;left:50px;top:350px;width:900px;height:760px}
  .legend{position:absolute;left:64px;right:64px;top:1080px;height:280px;list-style:none;display:grid;grid-template-columns:1fr 1fr;column-gap:34px;row-gap:14px;align-content:start}
  .legend li{display:flex;gap:14px;align-items:flex-start;font-size:24px;line-height:1.28}
  .legend li span{flex:none;width:38px;height:38px;border-radius:50%;background:var(--accent);color:#fff;font:600 21px/38px "Plex Mono";text-align:center}
  `;
  return { id: "pin-3.3-packing-flatlay", html: page(p, { body, css, paper: "#efe7da" }) };
}

export const pins = [departureBoard(), packingFlatlay()];
