/**
 * Vehicle Maintenance Companion, v3 test pins: two of the seven visuals in
 * pinterest/strategy/vehicle-maintenance-companion.json, drawn from the
 * car owner's own world.
 *
 * - vehicle/pin-8.1, glove box opened and labelled: the guide's real
 *   "What is worth having in the car" items fanned out of a dropped-open
 *   glove box, and its "What is better kept at home" items in a kitchen
 *   drawer (guides.ts, glove-box-checklist-what-to-keep).
 * - vehicle/pin-6.1, the car with numbered callouts, winter variant: a
 *   frosted car with the hood up and the tailgate raised on the kit, its
 *   eight numbers the winter guide's real "Check" column (guides.ts,
 *   winter-car-prep-checklist).
 *
 * Nothing on either pin is plugged into the car or lit on its dash: the
 * product reads nothing from the vehicle.
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("vehicle-maintenance-companion");
const STRATEGY = (await import("../../strategy/vehicle-maintenance-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the vehicle strategy`);
  return pin;
};
/** A table heading from the strategy's grounded source, used as the pin's small tag line. */
const heading = (pin, name) => {
  if (!pin.content.source.includes(`'${name}'`)) throw new Error(`${pin.id}: '${name}' is not in its grounded source`);
  return name;
};

/* The printables' own palette, plus graphite for dash, tyres and road (strategy palette). */
const INK = "#211f1a";
const MUTED = "#6f6c62";
const HAIR = "#e2e0d8";
const PAPER = "#fffdf8";
const WASH = "#fdf3e8";
const G1 = "#2b2925"; // deepest graphite: cavities, tyres
const G2 = "#3b3833"; // graphite: dashboard
const G3 = "#4d4942"; // lifted graphite: inner faces
const STEEL = "#a9a69f";

/** Draw `svg` (centred on its own origin) at x,y, turned and scaled, over a soft blurred shadow of itself. */
const lay = (svg, x, y, rot = 0, s = 1, depth = 1) => {
  const t = (dx, dy) => `translate(${x + dx} ${y + dy}) rotate(${rot}) scale(${s})`;
  const ghost = svg.replace(/fill="(?!none)[^"]+"/g, 'fill="#3b2a14"').replace(/stroke="[^"]+"/g, 'stroke="#3b2a14"');
  return `<g transform="${t(5 * depth, 9 * depth)}" opacity=".16" filter="url(#soft)">${ghost}</g><g transform="${t(0, 0)}">${svg}</g>`;
};

/** A small target dot where a leader line lands on an object. */
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff"/><circle cx="${x}" cy="${y}" r="4.5" fill="${p.accent}"/>`;

const HEAD_CSS = `
  .top{position:absolute;left:64px;right:64px;top:64px}
  .top h1{font-family:"Plex";font-weight:700;font-size:82px;line-height:.98;letter-spacing:-.03em;margin-top:16px;color:var(--ink)}
  .top p{font-size:27px;line-height:1.36;color:var(--muted);margin-top:20px;max-width:840px}
`;

/* ================================================================ glove box */

const GLOVE = {
  manual: () => `
    <g>
      <rect x="-80" y="-106" width="168" height="220" rx="5" fill="#f2efe7"/>
      ${[0, 1, 2, 3].map((i) => `<line x1="84" y1="${-96 + i * 4}" x2="84" y2="${106 - i * 2}" stroke="#d8d3c8" stroke-width="1.2" transform="translate(${-i * 2} 0)"/>`).join("")}
      <rect x="-86" y="-112" width="164" height="218" rx="6" fill="#efe2cb"/>
      <rect x="-86" y="-112" width="30" height="218" rx="6" fill="${p.accent}"/>
      <rect x="-64" y="-112" width="8" height="218" fill="${p.strong}"/>
      <rect x="-36" y="-84" width="92" height="11" rx="5.5" fill="${INK}"/>
      <rect x="-36" y="-64" width="62" height="8" rx="4" fill="${MUTED}"/>
      <g transform="translate(10 18)">
        <path d="M-48 16 Q-48 4 -36 2 L-20 -12 Q-14 -17 -4 -17 L18 -17 Q28 -17 34 -9 L42 2 Q54 4 54 14 L54 20 L-48 20 Z" fill="none" stroke="${p.strong}" stroke-width="4" stroke-linejoin="round"/>
        <line x1="-16" y1="1" x2="40" y2="1" stroke="${p.strong}" stroke-width="3"/>
        <circle cx="-26" cy="22" r="10" fill="#efe2cb" stroke="${p.strong}" stroke-width="4"/>
        <circle cx="34" cy="22" r="10" fill="#efe2cb" stroke="${p.strong}" stroke-width="4"/>
      </g>
      <rect x="-36" y="66" width="80" height="6" rx="3" fill="#cdbfa6"/>
      <path d="M38 104 L38 158 L46 149 L54 158 L54 104 Z" fill="${p.accent}"/>
    </g>`,
  registration: () => `
    <g>
      <rect x="-92" y="-60" width="184" height="120" rx="10" fill="${PAPER}"/>
      <path d="M-92 -50 Q-92 -60 -82 -60 L82 -60 Q92 -60 92 -50 L92 -34 L-92 -34 Z" fill="${p.accent}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-72 + i * 19}" y="-20" width="13" height="20" rx="2" fill="${INK}"/>`).join("")}
      <rect x="-72" y="14" width="124" height="7" rx="3.5" fill="#d9d4c8"/>
      <rect x="-72" y="30" width="88" height="7" rx="3.5" fill="#d9d4c8"/>
      <path d="M64 60 L92 32 L92 52 Q92 60 84 60 Z" fill="#e6e0d3"/>
      <path d="M64 60 L92 32 L64 32 Z" fill="#f3efe6"/>
    </g>`,
  insurance: () => `
    <g>
      <rect x="-92" y="-60" width="184" height="120" rx="10" fill="${p.soft}"/>
      <circle cx="-62" cy="-30" r="14" fill="none" stroke="${p.accent}" stroke-width="4"/>
      <circle cx="-62" cy="-30" r="5" fill="${p.accent}"/>
      <rect x="-36" y="-36" width="104" height="10" rx="5" fill="${p.strong}"/>
      <rect x="-72" y="2" width="140" height="7" rx="3.5" fill="#e9c9a6"/>
      <rect x="-72" y="18" width="116" height="7" rx="3.5" fill="#e9c9a6"/>
      <rect x="-72" y="34" width="70" height="7" rx="3.5" fill="#e9c9a6"/>
    </g>`,
  roadside: () => `
    <g>
      <rect x="-50" y="-88" width="100" height="176" rx="10" fill="${PAPER}"/>
      <circle cx="0" cy="-66" r="9" fill="#e9e2d4"/>
      <circle cx="0" cy="-66" r="9" fill="none" stroke="#cfc8b9" stroke-width="2.5"/>
      <g transform="translate(0 -14) rotate(-12)">
        <path d="M-22 -22 Q-30 -14 -26 -2 Q-16 22 6 30 Q18 34 24 26 L26 22 Q27 18 24 16 L14 10 Q10 8 7 11 L3 15 Q-10 8 -15 -5 L-11 -9 Q-8 -12 -10 -16 L-15 -26 Q-18 -29 -22 -26 Z" fill="${p.accent}"/>
      </g>
      <line x1="-34" y1="38" x2="34" y2="38" stroke="#c9c2b3" stroke-width="3"/>
      <line x1="-34" y1="60" x2="34" y2="60" stroke="#c9c2b3" stroke-width="3"/>
    </g>`,
  gauge: () => `
    <g>
      <rect x="48" y="-7" width="74" height="14" rx="3" fill="${PAPER}"/>
      ${Array.from({ length: 9 }, (_, i) => `<line x1="${56 + i * 7.5}" y1="-7" x2="${56 + i * 7.5}" y2="${i % 2 ? -1 : 2}" stroke="${INK}" stroke-width="1.6"/>`).join("")}
      <rect x="-96" y="-14" width="150" height="28" rx="14" fill="${STEEL}"/>
      <rect x="-96" y="-14" width="150" height="9" rx="4.5" fill="#cfccc5"/>
      <rect x="-60" y="-19" width="58" height="7" rx="3.5" fill="#7f7c76"/>
      <g transform="translate(-102 0) rotate(-28)">
        <rect x="-30" y="-15" width="40" height="30" rx="7" fill="#7f7c76"/>
        <circle cx="-22" cy="0" r="8" fill="${G1}"/>
      </g>
    </g>`,
  notepad: () => `
    <g>
      <rect x="-70" y="-84" width="140" height="170" rx="6" fill="${PAPER}"/>
      <rect x="-70" y="-84" width="140" height="24" rx="6" fill="${p.soft}"/>
      ${Array.from({ length: 7 }, (_, i) => `<path d="M${-54 + i * 18} -78 v-12 a5 5 0 0 1 10 0 v12" fill="none" stroke="${G2}" stroke-width="3"/>`).join("")}
      <line x1="-46" y1="-56" x2="-46" y2="80" stroke="#efc9a3" stroke-width="2"/>
      ${Array.from({ length: 6 }, (_, i) => `<line x1="-60" y1="${-34 + i * 20}" x2="60" y2="${-34 + i * 20}" stroke="${HAIR}" stroke-width="2"/>`).join("")}
      <g transform="translate(6 12) rotate(-38)">
        <rect x="-96" y="-8" width="170" height="16" rx="8" fill="${G2}"/>
        <rect x="-60" y="-12" width="54" height="5" rx="2.5" fill="${STEEL}"/>
        <path d="M74 -8 L100 0 L74 8 Z" fill="#cfccc5"/>
        <circle cx="100" cy="0" r="2" fill="${INK}"/>
        <rect x="-102" y="-6" width="10" height="12" rx="3" fill="${p.accent}"/>
      </g>
    </g>`,
  card: () => `
    <g>
      <rect x="-110" y="-66" width="220" height="132" rx="8" fill="${PAPER}"/>
      <rect x="-102" y="-58" width="204" height="116" rx="5" fill="none" stroke="#bdb6a6" stroke-width="2" stroke-dasharray="7 5"/>
      <g transform="translate(-102 -58) rotate(-30)" stroke="${MUTED}" stroke-width="2" fill="none">
        <circle cx="-6" cy="-5" r="4"/><circle cx="-6" cy="5" r="4"/>
        <line x1="-2" y1="-3" x2="12" y2="4"/><line x1="-2" y1="3" x2="12" y2="-4"/>
      </g>
      <text x="-86" y="-24" font-family="Newsreader" font-weight="700" font-size="21" fill="${p.accent}">Glove box card</text>
      ${[0, 1, 2].map((i) => `<rect x="-86" y="${-4 + i * 22}" width="${[44, 30, 52][i]}" height="6" rx="3" fill="#c9c2b3"/><line x1="-30" y1="${2 + i * 22}" x2="86" y2="${2 + i * 22}" stroke="${HAIR}" stroke-width="2"/>`).join("")}
    </g>`,
};

/** The dashboard band, the dark glove box cavity and its door dropped open (page coordinates). */
const gloveBox = () => `
  <path d="M-10 412 Q500 386 1010 412 L1010 548 Q1010 570 988 570 L12 570 Q-10 570 -10 548 Z" fill="${G2}"/>
  <path d="M-10 412 Q500 386 1010 412 L1010 434 Q500 408 -10 434 Z" fill="#504c45"/>
  <path d="M-10 446 Q500 420 1010 446" fill="none" stroke="#6b665d" stroke-width="2" stroke-dasharray="7 7"/>
  ${[[40, 466], [840, 466]].map(([x, y]) => `<rect x="${x}" y="${y}" width="124" height="62" rx="14" fill="${G1}"/>${[0, 1, 2, 3].map((i) => `<rect x="${x + 10}" y="${y + 10 + i * 12}" width="104" height="5" rx="2.5" fill="#57534b"/>`).join("")}`).join("")}
  <rect x="306" y="452" width="388" height="124" rx="16" fill="#5b574f"/>
  <rect x="316" y="460" width="368" height="116" rx="12" fill="#14120f"/>
  <rect x="316" y="460" width="368" height="26" rx="12" fill="#000" opacity=".35"/>
  <line x1="326" y1="490" x2="300" y2="700" stroke="#8a857c" stroke-width="5" stroke-linecap="round"/>
  <line x1="674" y1="490" x2="700" y2="700" stroke="#8a857c" stroke-width="5" stroke-linecap="round"/>
  <path d="M306 576 L694 576 L742 812 L258 812 Z" fill="${G3}"/>
  <path d="M322 590 L678 590 L718 796 L282 796 Z" fill="#5a564e"/>
  <rect x="300" y="764" width="86" height="20" rx="10" fill="#47433c"/>
  <rect x="614" y="764" width="86" height="20" rx="10" fill="#47433c"/>
  <path d="M258 812 L742 812 L742 830 Q742 840 732 840 L268 840 Q258 840 258 830 Z" fill="${G1}"/>
  <rect x="446" y="818" width="108" height="13" rx="6.5" fill="#d5d3cc"/>
  <rect x="446" y="818" width="108" height="5" rx="2.5" fill="#f2f1ec"/>
`;

/** A kitchen drawer pulled open: the blue folder (the guide's own "kitchen drawer, blue folder") and the spare keys. */
const homeDrawer = () => `
  <svg class="drawer" data-check="drawer" viewBox="0 0 360 200" aria-hidden="true">
    <defs><filter id="soft2"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <rect x="0" y="0" width="360" height="200" rx="14" fill="#eadbc3"/>
    <rect x="18" y="10" width="324" height="16" rx="6" fill="#bfa98a"/>
    <path d="M36 26 L324 26 L340 128 L20 128 Z" fill="#c9b293"/>
    <path d="M46 30 L314 30 L326 124 L34 124 Z" fill="#f5ead8"/>
    <g transform="translate(150 80) rotate(-5)">
      <rect x="-96" y="-40" width="180" height="86" rx="6" fill="#3a2a14" opacity=".18" filter="url(#soft2)" transform="translate(4 6)"/>
      <rect x="-96" y="-34" width="56" height="18" rx="5" fill="#2f5d8c"/>
      <rect x="-90" y="-28" width="172" height="6" rx="2" fill="#fffdf8"/>
      <rect x="-96" y="-22" width="180" height="70" rx="6" fill="#3d6fa3"/>
      <path d="M-96 -2 L84 -2" stroke="#2f5d8c" stroke-width="2"/>
    </g>
    <g transform="translate(270 82) rotate(20)">
      <circle cx="0" cy="0" r="17" fill="none" stroke="${STEEL}" stroke-width="5"/>
      <g transform="rotate(-30) translate(0 16)"><circle r="12" fill="#cfccc5"/><circle r="4" fill="#f5ead8"/><path d="M-5 10 L-5 48 L0 48 L0 42 L5 42 L5 36 L1 36 L1 30 L5 30 L5 10 Z" fill="#cfccc5"/></g>
      <g transform="rotate(30) translate(0 16)"><circle r="12" fill="#bdb9b1"/><circle r="4" fill="#f5ead8"/><path d="M-5 10 L-5 44 L0 44 L0 38 L5 38 L5 30 L1 30 L1 24 L5 24 L5 10 Z" fill="#bdb9b1"/></g>
    </g>
    <path d="M14 128 L346 128 L346 186 Q346 196 336 196 L24 196 Q14 196 14 186 Z" fill="#dcc7a6"/>
    <rect x="130" y="152" width="100" height="14" rx="7" fill="${STEEL}"/>
    <rect x="130" y="152" width="100" height="5" rx="2.5" fill="#d9d7d0"/>
  </svg>`;

function gloveBoxPin() {
  const pin = plan("vehicle/pin-8.1");
  const inCar = pin.content.items.filter((s) => !s.startsWith("At home: "));
  const atHome = pin.content.items.filter((s) => s.startsWith("At home: ")).map((s) => s.replace("At home: ", ""));
  const want = ["Registration", "Proof of insurance", "Roadside help number", "Owner's manual", "Tire size and oil type", "Pen and small notepad", "Tire pressure gauge"];
  if (want.some((w) => !inCar.includes(w)) || inCar.length !== want.length) throw new Error("pin-8.1 items changed in the strategy; redraw the glove box");
  if (atHome.join("|") !== "The title|Spare keys") throw new Error("pin-8.1 at-home items changed in the strategy");

  // Each real item: where it is drawn, where its leader lands, which column its label sits in and how high.
  const items = {
    "Owner's manual": { side: "R", y: 600, to: [566, 548] },
    Registration: { side: "L", y: 612, to: [340, 668] },
    "Proof of insurance": { side: "L", y: 742, to: [376, 760] },
    "Roadside help number": { side: "R", y: 724, to: [664, 700] },
    "Tire pressure gauge": { side: "L", y: 880, to: [292, 886] },
    "Pen and small notepad": { side: "R", y: 864, to: [676, 862] },
    "Tire size and oil type": { side: "R", y: 1008, to: [560, 972] },
  };
  const LX = 254; // right edge of the left label column
  const RX = 746; // left edge of the right label column
  const leaders = Object.values(items).map(({ side, y, to }) => {
    const x0 = side === "L" ? LX + 10 : RX - 10;
    return `<path d="M${x0} ${y} L${to[0]} ${to[1]}" stroke="${INK}" stroke-width="2.2" fill="none"/>${dot(to[0], to[1])}`;
  });

  const scene = `
  <svg class="scene" data-check="glove-box" viewBox="0 380 1000 700" aria-hidden="true">
    <defs><filter id="soft"><feGaussianBlur stdDeviation="7"/></filter></defs>
    ${gloveBox()}
    ${lay(GLOVE.manual(), 500, 566, -7, 1, 1)}
    ${lay(GLOVE.registration(), 380, 690, -15)}
    ${lay(GLOVE.insurance(), 434, 752, 8)}
    ${lay(GLOVE.roadside(), 630, 706, 11)}
    ${lay(GLOVE.gauge(), 360, 900, -12, 1.05)}
    ${lay(GLOVE.notepad(), 640, 900, 9, 0.92)}
    ${lay(GLOVE.card(), 500, 990, -3, 0.95)}
    ${leaders.join("")}
  </svg>`;

  const labels = Object.entries(items).map(([name, { side, y }]) => `<div class="lab ${side}" style="top:${y - 34}px" data-check="label: ${esc(name)}"><span>${esc(name)}</span></div>`).join("");

  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">${esc(heading(pin, "What is worth having in the car"))}</div>
    <h1>${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${scene}
  <div class="labels" data-check="labels">${labels}</div>
  <div class="home" data-check="at-home">
    ${homeDrawer()}
    <div class="home-text">
      <div class="eyebrow">At home</div>
      <ul>${atHome.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
    </div>
  </div>
  ${foot(p, { cta: "guide" })}`;

  const css = `${HEAD_CSS}
  .scene{position:absolute;left:0;top:380px;width:1000px;height:700px}
  .labels{position:absolute;left:0;top:0;width:1000px;height:1080px;pointer-events:none}
  .lab{position:absolute;width:214px;height:68px;display:flex;align-items:center;font-weight:600;font-size:26px;line-height:1.16;color:var(--ink)}
  .lab.L{left:40px;justify-content:flex-end;text-align:right}
  .lab.R{left:${RX}px}
  .home{position:absolute;left:40px;right:40px;top:1108px;height:206px;border-radius:22px;background:${WASH};box-shadow:inset 0 0 0 2px #f1dcc4;display:flex;align-items:center;gap:36px;padding:0 24px}
  .drawer{width:264px;height:147px;flex:none}
  .home-text .eyebrow{font-size:21px}
  .home-text ul{list-style:none;margin-top:10px}
  .home-text li{font-weight:600;font-size:30px;line-height:1.38;color:var(--ink);display:flex;align-items:center;gap:14px}
  .home-text li::before{content:"";width:12px;height:12px;border-radius:50%;background:#3d6fa3;flex:none}
  `;
  return { id: "pin-8.1-glove-box-open", html: page(p, { body, css, paper: "#f5eee3", ink: INK, muted: MUTED }) };
}

/* ================================================================ winter car */

/** A tyre seen side-on: graphite with notched tread, a five-spoke rim and a hub. */
const tyre = (cx, cy) => {
  const holes = Array.from({ length: 5 }, (_, k) => {
    const a = ((k * 72 + 36 - 90) * Math.PI) / 180;
    const d = 22 * (Math.PI / 180);
    const pt = (r, t) => `${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`;
    return `<path d="M${pt(18, a - d * 0.7)} L${pt(38, a - d)} A38 38 0 0 1 ${pt(38, a + d)} L${pt(18, a + d * 0.7)} Z" fill="#46433d"/>`;
  }).join("");
  return `
    <circle cx="${cx}" cy="${cy}" r="78" fill="${G1}"/>
    <circle cx="${cx}" cy="${cy}" r="73" fill="none" stroke="#1a1815" stroke-width="10" stroke-dasharray="9 7"/>
    <circle cx="${cx}" cy="${cy}" r="62" fill="#34312c"/>
    <circle cx="${cx}" cy="${cy}" r="47" fill="#e4dfd4"/>
    <circle cx="${cx}" cy="${cy}" r="43" fill="#d3cdc0"/>
    ${holes}
    <circle cx="${cx}" cy="${cy}" r="13" fill="#eeeae2"/>
    ${Array.from({ length: 5 }, (_, k) => { const a = ((k * 72 - 90) * Math.PI) / 180; return `<circle cx="${(cx + Math.cos(a) * 8).toFixed(1)}" cy="${(cy + Math.sin(a) * 8).toFixed(1)}" r="2" fill="#9d978b"/>`; }).join("")}`;
};

/** A six-armed frost sparkle. */
const flake = (x, y, r, o = 1) => `<g transform="translate(${x} ${y})" stroke="#fff" stroke-width="${r > 10 ? 3 : 2.2}" stroke-linecap="round" opacity="${o}">${[0, 60, 120].map((a) => `<line x1="0" y1="${-r}" x2="0" y2="${r}" transform="rotate(${a})"/>`).join("")}${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M${-r * 0.3} ${-r * 0.75} L0 ${-r * 0.5} L${r * 0.3} ${-r * 0.75}" fill="none" transform="rotate(${a})"/>`).join("")}</g>`;

/** A numbered accent circle with a leader to the part it names. */
const callout = (n, [cx, cy], [tx, ty]) => `
  <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${INK}" stroke-width="2.5"/>
  ${dot(tx, ty)}
  <circle cx="${cx}" cy="${cy}" r="27" fill="#fff"/>
  <circle cx="${cx}" cy="${cy}" r="23" fill="${p.accent}"/>
  <text x="${cx}" y="${cy + 8.5}" text-anchor="middle" font-family="Plex Mono" font-weight="600" font-size="24" fill="#fff">${n}</text>`;

const BODY = "#6d685f";
const BODY_LO = "#5d5951";
const GLASS = "#dfe2dc";

function winterCar() {
  const F = [282, 884]; // front wheel
  const R = [690, 884]; // rear wheel
  const body = `M160 934 L142 934 Q120 934 118 912 L114 846 Q114 808 150 798 L384 752 L498 630 Q506 620 520 620 L742 616 Q760 616 772 628 L838 706 Q848 718 850 736 L854 906 Q854 934 828 934 L760 934 A86 86 0 1 0 620 934 L352 934 A86 86 0 1 0 212 934 Z`;
  return `
  <svg class="scene" data-check="winter-car" viewBox="0 380 1000 650" aria-hidden="true">
    <defs>
      <filter id="soft"><feGaussianBlur stdDeviation="7"/></filter>
      <filter id="haze"><feGaussianBlur stdDeviation="12"/></filter>
      <pattern id="frost" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.6" fill="#fff"/><circle cx="10" cy="10" r="1.2" fill="#fff"/><circle cx="11" cy="2" r=".9" fill="#fff"/><circle cx="4" cy="11" r=".8" fill="#fff"/></pattern>
      <clipPath id="body"><path d="${body}"/></clipPath>
    </defs>

    ${flake(90, 470, 16, 0.95)}${flake(930, 430, 13, 0.9)}${flake(560, 438, 10, 0.85)}${flake(980, 640, 9, 0.8)}${flake(36, 640, 9, 0.8)}${flake(420, 520, 8, 0.75)}${flake(800, 500, 9, 0.8)}

    <!-- snowy driveway -->
    <path d="M-10 950 Q120 936 260 946 Q420 958 560 944 Q720 932 860 946 Q940 954 1010 944 L1010 1030 L-10 1030 Z" fill="#fbf8f2"/>
    <ellipse cx="490" cy="960" rx="420" ry="20" fill="#5b4a33" opacity=".22" filter="url(#haze)"/>

    <!-- washer fluid jug in front of the car -->
    ${lay(`<g>
      <path d="M-30 -48 L14 -48 Q22 -48 24 -40 L32 -6 L32 46 Q32 54 24 54 L-30 54 Q-38 54 -38 46 L-38 -40 Q-38 -48 -30 -48 Z" fill="#f4e4cf"/>
      <path d="M-38 -2 Q-24 -8 -8 -2 Q8 4 32 -2 L32 46 Q32 54 24 54 L-30 54 Q-38 54 -38 46 Z" fill="#f2c79a"/>
      <path d="M-4 -48 L-4 -30 Q-4 -22 4 -22 L20 -22 L14 -48 Z" fill="none" stroke="#e7cfae" stroke-width="7"/>
      <rect x="-32" y="-64" width="24" height="18" rx="4" fill="${p.accent}"/>
      <rect x="-26" y="8" width="44" height="30" rx="5" fill="${PAPER}"/>
      <path d="M-18 30 Q-4 14 10 30" fill="none" stroke="${p.accent}" stroke-width="3"/>
      ${[-10, -4, 2].map((x, i) => `<circle cx="${x}" cy="${16 - i}" r="1.8" fill="${p.accent}"/>`).join("")}
    </g>`, 62, 896, 0, 1)}

    <!-- kit out of the boot, on the snow -->
    ${lay(`<g>
      <rect x="-56" y="2" width="112" height="22" rx="8" fill="#c98b4a"/>
      <rect x="-60" y="-18" width="118" height="22" rx="8" fill="#e2b07a"/>
      <rect x="-56" y="-38" width="112" height="22" rx="8" fill="#c98b4a"/>
      <rect x="-56" y="-31" width="112" height="5" fill="#f3dcbc"/><rect x="-56" y="9" width="112" height="5" fill="#f3dcbc"/>
    </g>`, 924, 920)}
    ${lay(`<g fill="none" stroke-linecap="round">
      <ellipse cx="-6" cy="0" rx="34" ry="14" stroke="${INK}" stroke-width="6"/>
      <ellipse cx="6" cy="-4" rx="32" ry="12" stroke="${p.accent}" stroke-width="6"/>
      <g transform="translate(-44 -2) rotate(20)"><rect x="-16" y="-6" width="20" height="12" rx="3" fill="${G2}" stroke="none"/><path d="M-16 -6 l-6 -3 M-16 6 l-6 3" stroke="${G2}" stroke-width="4"/></g>
      <g transform="translate(44 -8) rotate(-20)"><rect x="-4" y="-6" width="20" height="12" rx="3" fill="${p.accent}" stroke="none"/><path d="M16 -6 l6 -3 M16 6 l6 3" stroke="${p.accent}" stroke-width="4"/></g>
    </g>`, 922, 868)}
    ${lay(`<g>
      <rect x="-50" y="-7" width="76" height="14" rx="7" fill="${G2}"/>
      <path d="M26 -16 L58 -22 L58 22 L26 16 Z" fill="${p.soft}"/>
      <path d="M58 -22 L62 -22 L62 22 L58 22 Z" fill="#e3c39e"/>
    </g>`, 868, 970, -6)}

    <!-- engine bay behind the raised hood -->
    <path d="M150 800 L150 784 Q156 768 186 764 L366 742 L384 756 Z" fill="${G1}"/>
    <!-- coolant reservoir -->
    <g>
      <rect x="166" y="744" width="42" height="56" rx="10" fill="#f1e6d4"/>
      <path d="M166 770 Q178 764 187 770 Q197 776 208 770 L208 790 Q208 800 198 800 L176 800 Q166 800 166 790 Z" fill="#f0c48e"/>
      <rect x="176" y="734" width="22" height="12" rx="4" fill="${G2}"/>
    </g>
    <!-- battery, frosted -->
    <g>
      <rect x="222" y="700" width="108" height="78" rx="8" fill="${G2}"/>
      <rect x="222" y="726" width="108" height="20" fill="${p.accent}"/>
      <rect x="238" y="688" width="16" height="14" rx="3" fill="#bdb9b1"/>
      <rect x="298" y="688" width="16" height="14" rx="3" fill="#bdb9b1"/>
      <path d="M241 694 h10 M246 689 v10" stroke="${INK}" stroke-width="2.2"/>
      <path d="M301 694 h10" stroke="${INK}" stroke-width="2.2"/>
      <path d="M222 708 Q222 700 230 700 L322 700 Q330 700 330 708 L330 712 Q324 718 318 712 Q312 706 306 712 Q298 718 290 712 Q282 706 274 712 Q266 718 258 712 Q250 706 242 712 Q234 718 228 712 Q222 706 222 712 Z" fill="#fff"/>
      ${[240, 270, 302].map((x, i) => `<path d="M${x} 746 L${x + 5} ${762 + i * 3} L${x + 10} 746 Z" fill="#fff"/>`).join("")}
    </g>

    <!-- the car -->
    <path d="${body}" fill="#5b4a33" opacity=".18" filter="url(#soft)" transform="translate(6 10)"/>
    <path d="${body}" fill="${BODY}"/>
    <g clip-path="url(#body)">
      <rect x="100" y="842" width="780" height="100" fill="${BODY_LO}"/>
      <rect x="100" y="838" width="780" height="5" fill="#7c776d"/>
    </g>
    <!-- windows: windscreen edge, front and rear side glass, frosted -->
    <path d="M392 752 L496 638 L508 636 L410 752 Z" fill="${GLASS}"/>
    <path d="M420 750 L508 652 Q514 644 524 644 L586 642 L586 750 Z" fill="${GLASS}"/>
    <path d="M602 750 L602 642 L734 638 Q748 638 756 648 L812 714 Q818 724 818 750 Z" fill="${GLASS}"/>
    <path d="M392 752 L496 638 L508 636 L410 752 Z M420 750 L508 652 Q514 644 524 644 L586 642 L586 750 Z M602 750 L602 642 L734 638 Q748 638 756 648 L812 714 Q818 724 818 750 Z" fill="url(#frost)" opacity=".95"/>
    <!-- dashboard and the defroster's warm air, seen through the front glass -->
    <path d="M420 750 L452 714 Q470 700 500 700 L586 704 L586 750 Z" fill="#3e3a34"/>
    <rect x="470" y="706" width="34" height="8" rx="4" fill="#24221e"/>
    ${[0, 1, 2].map((i) => `<path d="M${470 + i * 13} 700 q-12 -14 0 -26 q12 -12 0 -26" fill="none" stroke="${p.accent}" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>`).join("")}
    <!-- blanket through the rear glass -->
    <rect x="690" y="716" width="110" height="34" rx="8" fill="#c98b4a" opacity=".8"/>
    <rect x="690" y="724" width="110" height="5" fill="#f3dcbc" opacity=".8"/>
    <!-- pillars and trim -->
    <path d="M586 642 L602 642 L602 760 L586 760 Z" fill="${BODY}"/>
    <rect x="410" y="750" width="410" height="8" rx="4" fill="#4a463f"/>
    <!-- door seams and handles -->
    <path d="M410 760 L404 920 M594 760 L594 930 M770 760 Q790 820 772 860" stroke="#55514a" stroke-width="2.5" fill="none"/>
    <rect x="536" y="786" width="38" height="9" rx="4.5" fill="#55514a"/>
    <rect x="714" y="786" width="38" height="9" rx="4.5" fill="#55514a"/>
    <!-- mirror -->
    <path d="M430 744 Q420 722 440 718 L462 720 L458 744 Z" fill="${BODY_LO}"/>
    <!-- snow on the roof -->
    <path d="M512 624 Q520 604 540 606 Q560 594 584 604 Q608 594 634 602 Q660 592 688 602 Q714 596 736 606 Q756 606 766 620 L742 618 L520 622 Z" fill="#fff"/>
    <!-- headlamp (off) and tail lamp -->
    <path d="M116 820 Q118 806 140 802 L176 796 Q170 820 150 826 L118 830 Z" fill="#f3efe6"/>
    <path d="M124 818 Q128 810 144 808" stroke="#d8d1c3" stroke-width="3" fill="none"/>
    <path d="M840 724 Q848 732 850 746 L851 790 L838 790 L834 732 Z" fill="${p.strong}"/>
    <rect x="114" y="866" width="38" height="12" rx="6" fill="#4a463f"/>
    <!-- wiper lying on the windscreen -->
    <path d="M394 750 L462 680" stroke="${G1}" stroke-width="5" stroke-linecap="round"/>
    <path d="M440 712 L478 668" stroke="${G1}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="394" cy="750" r="6" fill="${G1}"/>

    <!-- hood up on its prop rod -->
    <line x1="156" y1="796" x2="246" y2="584" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M386 750 L240 562 Q236 556 230 560 L224 566 Q222 572 226 576 L372 762 Z" fill="${BODY}"/>
    <path d="M378 758 L232 570 L226 576 L372 762 Z" fill="#8b857a"/>
    <path d="M300 640 Q320 618 330 640" fill="none" stroke="#fff" stroke-width="0"/>

    <!-- tailgate raised -->
    <line x1="826" y1="720" x2="872" y2="596" stroke="${STEEL}" stroke-width="5" stroke-linecap="round"/>
    <path d="M766 614 L930 552 Q942 548 946 558 L950 570 Q952 578 944 582 L782 640 Z" fill="${BODY}"/>
    <path d="M800 614 L916 570 L922 584 L806 628 Z" fill="${GLASS}"/>
    <path d="M800 614 L916 570 L922 584 L806 628 Z" fill="url(#frost)"/>

    ${tyre(...F)}
    ${tyre(...R)}
    <path d="M196 940 Q240 930 282 934 Q330 930 372 942 L372 960 L196 960 Z M604 940 Q650 930 692 934 Q736 930 780 942 L780 960 L604 960 Z" fill="#fbf8f2"/>
  </svg>`;
}

function winterPin() {
  const pin = plan("vehicle/pin-6.1");
  const checks = pin.content.items;
  const want = ["Battery", "Tires", "Wiper blades", "Washer fluid", "Coolant", "Lights", "Heater and defroster", "Kit in the car"];
  if (checks.join("|") !== want.join("|")) throw new Error("pin-6.1 checks changed in the strategy; move the callouts");
  // Each check's numbered circle and the point on the drawing it names.
  const at = {
    Battery: [[276, 628], [276, 704]],
    Tires: [[150, 990], [222, 930]],
    "Wiper blades": [[400, 618], [446, 706]],
    "Washer fluid": [[62, 790], [62, 846]],
    Coolant: [[130, 700], [176, 760]],
    Lights: [[60, 900], [130, 822]],
    "Heater and defroster": [[520, 560], [484, 680]],
    "Kit in the car": [[900, 796], [916, 866]],
  };
  const svg = winterCar().replace("</svg>", `${checks.map((c, i) => callout(i + 1, ...at[c])).join("")}</svg>`);
  const body = `
  <div class="top" data-check="headline">
    <div class="eyebrow">${esc(heading(pin, "What to look at, and what to write down"))}</div>
    <h1>${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${svg}
  <ol class="checks" data-check="checklist">${checks.map((c, i) => `<li><span class="n">${i + 1}</span><span class="t">${esc(c)}</span><span class="box"></span></li>`).join("")}</ol>
  ${foot(p, { cta: "guide" })}`;
  const css = `${HEAD_CSS}
  .scene{position:absolute;left:0;top:380px;width:1000px;height:650px}
  .checks{position:absolute;left:40px;right:40px;top:1040px;height:262px;list-style:none;background:${PAPER};border-radius:20px;box-shadow:0 18px 40px -24px rgba(59,42,20,.45);padding:22px 30px;display:grid;grid-template-columns:1fr 1fr;grid-auto-flow:column;grid-template-rows:repeat(4,1fr);column-gap:44px}
  .checks li{display:flex;align-items:center;gap:16px;border-bottom:2px solid ${HAIR}}
  .checks li:nth-child(4n){border-bottom:0}
  .checks .n{flex:none;width:40px;height:40px;border-radius:50%;background:var(--accent);color:#fff;font:600 21px/40px "Plex Mono";text-align:center}
  .checks .t{flex:1;font-weight:600;font-size:27px;color:var(--ink);white-space:nowrap}
  .checks .box{flex:none;width:26px;height:26px;border:2.5px solid #c9c2b3;border-radius:6px}
  `;
  return { id: "pin-6.1-winter-car-callouts", html: page(p, { body, css, paper: "#f1eadf", ink: INK, muted: MUTED }) };
}

export const pins = [gloveBoxPin(), winterPin()];
