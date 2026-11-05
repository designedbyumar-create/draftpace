/**
 * Home Base, v3 test pins: two of the seven visuals in
 * pinterest/strategy/home-management-companion.json, drawn from the
 * product's own world (the Home Survey's drawing set of your house).
 *
 * - homebase/pin-2.4, labelled house cutaway: a section through a
 *   two-storey house with a basement, each callout on the real spot and
 *   tagged SAFETY or COSTLY from the care template's consequence
 *   (homeKnowledge.ts HOME_ITEM_TYPES; tag words from Home Survey
 *   Plate 14, workbook.tsx). The cosmetic job is the one greyed label.
 * - homebase/pin-2.3, the year as a wheel: twelve wedges shaded by the
 *   seasonal job counts Plate 15 prints (workbook.tsx seasonalByMonth),
 *   and the interval jobs beside it (guides.ts
 *   how-often-home-systems-need-servicing).
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("home-management-companion");
const STRATEGY = (await import("../../strategy/home-management-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the home-management-companion strategy`);
  return pin;
};

/* The strategy's palette: Home Survey paper, ink, Home Base sage, ochre only for SAFETY, kraft for cardboard, slate blue only for water. */
const C = {
  paper: "#f4f2ec",
  sheet: "#fbfaf6",
  ink: "#1a2420",
  inkSoft: "#4a5550",
  muted: "#66706b",
  sage: p.accent,
  deep: p.strong,
  soft: p.soft,
  ochre: "#8a5a11",
  ochreSoft: "#f6edda",
  kraft: "#c9a46e",
  kraftSoft: "#e6d3ad",
  water: "#6f8ea3",
  pale: "#b4c4b7",
  paleFill: "#f3f5ef",
  grid: "#e6e2d6",
};

/** The Home Survey's faint squared grid and registration ticks (workbook.tsx GridField, Ticks). */
const gridField = (x, y, w, h, step = 40) => {
  const lines = [];
  for (let gx = x; gx <= x + w; gx += step) lines.push(`<line x1="${gx}" y1="${y}" x2="${gx}" y2="${y + h}"/>`);
  for (let gy = y; gy <= y + h; gy += step) lines.push(`<line x1="${x}" y1="${gy}" x2="${x + w}" y2="${gy}"/>`);
  return `<g stroke="${C.grid}" stroke-width="1">${lines.join("")}</g>`;
};
const ticks = (x, y, w, h, len = 22) =>
  `<g stroke="${C.inkSoft}" stroke-width="2" fill="none" opacity=".55">${[
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]
    .map(([cx, cy, sx, sy]) => `<path d="M${cx} ${cy + sy * len} V${cy} H${cx + sx * len}"/><path d="M${cx - 8} ${cy} h16 M${cx} ${cy - 8} v16" opacity=".6"/>`)
    .join("")}</g>`;

/* ================================================================ house cutaway */

/** Small stipple of soil dots inside a rectangle. */
const stipple = (x, y, w, h, step = 14) => {
  const dots = [];
  let row = 0;
  for (let sy = y + 6; sy < y + h; sy += step, row++) {
    for (let sx = x + (row % 2 ? step / 2 : 0) + 4; sx < x + w; sx += step) dots.push(`<circle cx="${sx}" cy="${sy}" r="2"/>`);
  }
  return `<g fill="#c4b393">${dots.join("")}</g>`;
};

/** Ribbed flexible duct along a polyline of points, drawn as a fat tube with rib arcs. */
const ribbedDuct = (pts, width = 20) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const ribs = [];
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.floor(len / 8);
    const nx = -(y2 - y1) / len;
    const ny = (x2 - x1) / len;
    for (let k = 1; k < n; k++) {
      const cx = x1 + ((x2 - x1) * k) / n;
      const cy = y1 + ((y2 - y1) * k) / n;
      ribs.push(`<line x1="${cx + (nx * width) / 2}" y1="${cy + (ny * width) / 2}" x2="${cx - (nx * width) / 2}" y2="${cy - (ny * width) / 2}"/>`);
    }
  }
  return `<path d="${d}" fill="none" stroke="#9aa3a0" stroke-width="${width}" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#c9cfcc" stroke-width="${width - 6}" stroke-linejoin="round"/><g stroke="#8b9592" stroke-width="1.6">${ribs.join("")}</g>`;
};

function houseScene() {
  const pale = `stroke="${C.pale}" stroke-width="2" fill="${C.paleFill}"`;
  const inkLine = `stroke="${C.ink}" stroke-width="2.4"`;
  // Roof shingle hatch along both slopes.
  const shingles = [];
  for (let t = 0.06; t < 1; t += 0.055) {
    const lx = 500 - 314 * t, ly = 350 + 182 * t;
    const rx = 500 + 314 * t;
    shingles.push(`<line x1="${lx}" y1="${ly}" x2="${lx + 8}" y2="${ly + 16}"/><line x1="${rx}" y1="${ly}" x2="${rx - 8}" y2="${ly + 16}"/>`);
  }
  // Attic insulation zigzag.
  const zig = [];
  for (let x = 262, i = 0; x <= 738; x += 12, i++) zig.push(`${x},${i % 2 ? 516 : 530}`);
  // Leaves in the right gutter.
  const leaf = (x, y, r, c) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="4.5" transform="rotate(${r} ${x} ${y})" fill="${c}"/>`;

  return `
  <svg class="scene" data-check="house" viewBox="0 330 1000 1030" aria-hidden="true">
    <defs>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="tank" x1="0" x2="1"><stop offset="0" stop-color="#e9e7e0"/><stop offset=".45" stop-color="#fbfaf6"/><stop offset="1" stop-color="#d9d6cd"/></linearGradient>
      <linearGradient id="cab" x1="0" x2="1"><stop offset="0" stop-color="#dfe3dc"/><stop offset=".5" stop-color="#eef0ea"/><stop offset="1" stop-color="#d3d8d0"/></linearGradient>
    </defs>
    ${gridField(20, 340, 960, 1000)}
    ${ticks(28, 344, 944, 1004)}

    <!-- soil and grade -->
    <rect x="214" y="992" width="572" height="232" fill="#ece3d1"/>
    ${stipple(214, 992, 572, 232)}
    <line x1="120" y1="992" x2="880" y2="992" stroke="${C.ink}" stroke-width="3"/>
    <g stroke="${C.inkSoft}" stroke-width="1.5" opacity=".5">${Array.from({ length: 10 }, (_, i) => `<line x1="${128 + i * 7}" y1="992" x2="${120 + i * 7}" y2="1002"/><line x1="${812 + i * 7}" y1="992" x2="${804 + i * 7}" y2="1002"/>`).join("")}</g>

    <!-- shadow under the house -->
    <rect x="248" y="548" width="520" height="664" rx="6" fill="#3b2f1e" opacity=".10" filter="url(#soft)"/>

    <!-- roof -->
    <polygon points="182,534 500,348 818,534 800,546 500,372 200,546" fill="#55625d"/>
    <g stroke="#3e4945" stroke-width="2">${shingles.join("")}</g>
    <!-- attic -->
    <polygon points="250,536 500,390 750,536" fill="#f3ecdc"/>
    <polyline points="${zig.join(" ")}" fill="none" stroke="#d9b98f" stroke-width="7" stroke-linejoin="round"/>
    <polygon points="250,536 500,390 750,536" fill="none" stroke="#b9ae97" stroke-width="2"/>
    <circle cx="500" cy="462" r="20" fill="#e2e8e8" stroke="#b9ae97" stroke-width="2"/><path d="M480 462 h40 M500 442 v40" stroke="#b9ae97" stroke-width="2"/>

    <!-- walls and floors -->
    <rect x="240" y="534" width="520" height="428" fill="#e2d9c6"/>
    <rect x="254" y="548" width="492" height="186" fill="#eef2ea"/>
    <rect x="254" y="746" width="492" height="202" fill="#f4efe5"/>
    <rect x="254" y="734" width="492" height="12" fill="#cfc4ad"/>
    <rect x="240" y="948" width="520" height="14" fill="#cfc4ad"/>
    <!-- foundation and basement -->
    <rect x="240" y="962" width="520" height="252" fill="#d3d0c7"/>
    <rect x="256" y="962" width="488" height="226" fill="#ebe8df"/>
    <rect x="240" y="1188" width="520" height="16" fill="#c8c4b9"/>

    <!-- partitions -->
    <rect x="468" y="548" width="10" height="186" fill="#e2d9c6"/>
    <rect x="516" y="746" width="10" height="202" fill="#e2d9c6"/>
    <!-- bedroom right, upstairs -->
    <rect x="746" y="584" width="14" height="96" fill="#dfe8ea" stroke="#b9ae97" stroke-width="2"/>
    <rect x="566" y="666" width="22" height="68" rx="3" ${pale}/>
    <rect x="586" y="694" width="140" height="28" rx="6" ${pale}/>
    <rect x="596" y="684" width="40" height="14" rx="6" fill="#fff" stroke="${C.pale}" stroke-width="2"/>
    <rect x="586" y="720" width="140" height="10" fill="${C.pale}" opacity=".6"/>
    <rect x="500" y="702" width="40" height="32" rx="2" ${pale}/><path d="M512 702 l4 -26 h8 l4 26" ${pale}/>
    <!-- hallway left, upstairs -->
    <rect x="388" y="604" width="64" height="130" rx="2" ${pale}/><circle cx="440" cy="672" r="3" fill="${C.pale}"/>
    <rect x="292" y="616" width="56" height="44" rx="2" ${pale}/><path d="M298 652 l14 -16 l10 10 l8 -8 l12 14" fill="none" stroke="${C.pale}" stroke-width="2"/>
    <rect x="270" y="728" width="180" height="6" rx="3" fill="#d7e0d3"/>

    <!-- kitchen left, downstairs -->
    <rect x="240" y="786" width="14" height="80" fill="#dfe8ea" stroke="#b9ae97" stroke-width="2"/>
    <rect x="268" y="808" width="62" height="140" rx="6" ${pale}/><line x1="268" y1="852" x2="330" y2="852" stroke="${C.pale}" stroke-width="2"/><rect x="320" y="820" width="4" height="22" fill="${C.pale}"/><rect x="320" y="862" width="4" height="40" fill="${C.pale}"/>
    <rect x="340" y="768" width="164" height="42" rx="2" ${pale}/><line x1="422" y1="768" x2="422" y2="810" stroke="${C.pale}" stroke-width="2"/>
    <rect x="340" y="894" width="164" height="54" rx="2" ${pale}/><rect x="336" y="886" width="172" height="10" rx="2" fill="${C.pale}"/>
    <path d="M410 886 v-26 h18 v8" fill="none" stroke="${C.pale}" stroke-width="3"/>
    <!-- living room right, downstairs -->
    <rect x="746" y="776" width="14" height="80" fill="#dfe8ea" stroke="#b9ae97" stroke-width="2"/>
    <rect x="560" y="890" width="146" height="40" rx="10" ${pale}/><rect x="552" y="876" width="22" height="64" rx="8" ${pale}/><rect x="692" y="876" width="22" height="64" rx="8" ${pale}/>
    <rect x="574" y="864" width="118" height="30" rx="8" ${pale}/>
    <line x1="590" y1="930" x2="590" y2="948" stroke="${C.pale}" stroke-width="3"/><line x1="676" y1="930" x2="676" y2="948" stroke="${C.pale}" stroke-width="3"/>
    <path d="M556 780 h40 l-8 30 h-24 z" ${pale}/><line x1="576" y1="810" x2="576" y2="872" stroke="${C.pale}" stroke-width="3"/>

    <!-- SMOKE OR CO DETECTOR on the upstairs hallway ceiling -->
    <g>
      <rect x="336" y="548" width="52" height="10" rx="3" fill="${C.sheet}" stroke="${C.ink}" stroke-width="2"/>
      <path d="M340 558 q22 14 44 0" fill="${C.sheet}" stroke="${C.ink}" stroke-width="2"/>
      ${[346, 354, 362, 370, 378].map((x) => `<line x1="${x}" y1="561" x2="${x}" y2="565" stroke="${C.inkSoft}" stroke-width="1.6"/>`).join("")}
      <circle cx="362" cy="568" r="3" fill="${C.sage}"/>
    </g>

    <!-- GUTTERS: U-channel at both eaves, downspout on the left -->
    <path d="M170 528 v18 q0 10 10 10 h16 q10 0 10 -10 v-18" fill="${C.sheet}" stroke="${C.ink}" stroke-width="2.4"/>
    <path d="M794 528 v18 q0 10 10 10 h16 q10 0 10 -10 v-18" fill="${C.sheet}" stroke="${C.ink}" stroke-width="2.4"/>
    ${leaf(804, 531, -20, "#b77a2a")}${leaf(817, 528, 25, "#8f8a3c")}${leaf(811, 536, 5, "#c99a45")}${leaf(799, 539, 40, "#8f8a3c")}${leaf(823, 538, -35, "#b77a2a")}
    <rect x="212" y="556" width="14" height="414" fill="#e7e3d8" stroke="${C.ink}" stroke-width="2"/>
    <path d="M212 970 v6 q0 10 -10 10 h-30 v-14 h26 v-2 z" fill="#e7e3d8" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="142" y="984" width="40" height="8" rx="2" fill="#cfc9bb" stroke="${C.inkSoft}" stroke-width="1.5"/>
    <rect x="196" y="548" width="30" height="10" fill="#e7e3d8" stroke="${C.ink}" stroke-width="2"/>
    ${[600, 700, 800, 900].map((y) => `<rect x="208" y="${y}" width="22" height="6" rx="2" fill="${C.inkSoft}" opacity=".5"/>`).join("")}

    <!-- OUTDOOR FAUCET on the right wall, hose coiled on the ground -->
    <g>
      <rect x="760" y="896" width="14" height="20" fill="#9c8a6a"/>
      <path d="M774 898 h18 q8 0 8 8 v12 h-10 v-8 h-16 z" fill="#c4a066" stroke="${C.ink}" stroke-width="2" stroke-linejoin="round"/>
      <rect x="780" y="884" width="6" height="14" fill="${C.ink}"/>
      <path d="M770 884 h26" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="783" cy="884" r="4" fill="#c4a066" stroke="${C.ink}" stroke-width="1.5"/>
    </g>
    <g fill="none" stroke-linecap="round">
      <ellipse cx="852" cy="981" rx="38" ry="9" stroke="#56795f" stroke-width="5"/>
      <ellipse cx="846" cy="976" rx="32" ry="8" stroke="#6b8e72" stroke-width="5"/>
      <ellipse cx="856" cy="971" rx="26" ry="7" stroke="#56795f" stroke-width="5"/>
      <path d="M830 968 q-6 -4 -2 -10" stroke="#56795f" stroke-width="5"/>
      <rect x="822" y="952" width="10" height="8" rx="2" fill="#c4a066" stroke="${C.ink}" stroke-width="1.2"/>
    </g>

    <!-- MAIN WATER LINE and shutoff entering the basement (not called out) -->
    <rect x="214" y="1146" width="66" height="10" fill="${C.water}" opacity=".7"/>
    <rect x="270" y="1052" width="10" height="104" fill="${C.water}" opacity=".7"/>
    <rect x="262" y="1144" width="18" height="14" rx="3" fill="#b9b3a5" stroke="${C.inkSoft}" stroke-width="1.5"/>
    <rect x="252" y="1122" width="6" height="22" rx="2" fill="#b9b3a5" transform="rotate(90 271 1138)"/>
    <rect x="268" y="1134" width="34" height="5" rx="2.5" fill="${C.inkSoft}"/>

    <!-- WATER HEATER -->
    <g>
      <rect x="292" y="1040" width="78" height="140" rx="6" fill="url(#tank)" stroke="${C.ink}" stroke-width="2.4"/>
      <ellipse cx="331" cy="1040" rx="39" ry="9" fill="#f4f2ec" stroke="${C.ink}" stroke-width="2.4"/>
      <rect x="306" y="1004" width="7" height="36" fill="${C.water}"/>
      <rect x="349" y="1004" width="7" height="36" fill="#b8784a"/>
      <path d="M306 1004 v-36 M313 1004 v-36" stroke="${C.water}" stroke-width="0"/>
      <rect x="306" y="962" width="7" height="44" fill="${C.water}"/>
      <rect x="349" y="962" width="7" height="44" fill="#b8784a"/>
      <rect x="302" y="1062" width="30" height="20" rx="2" fill="#fff" stroke="${C.inkSoft}" stroke-width="1.5"/>
      <line x1="306" y1="1069" x2="326" y2="1069" stroke="${C.pale}" stroke-width="2"/><line x1="306" y1="1075" x2="320" y2="1075" stroke="${C.pale}" stroke-width="2"/>
      <rect x="370" y="1058" width="12" height="10" fill="#b9b3a5" stroke="${C.ink}" stroke-width="1.5"/>
      <rect x="378" y="1048" width="4" height="14" fill="${C.ink}" transform="rotate(-30 380 1058)"/>
      <rect x="378" y="1068" width="6" height="104" fill="#b8784a" opacity=".85"/>
      <rect x="324" y="1166" width="14" height="8" rx="2" fill="#b9b3a5" stroke="${C.ink}" stroke-width="1.5"/>
      <rect x="306" y="1180" width="50" height="8" fill="#9e9a90"/>
    </g>

    <!-- FURNACE with its flue and the filter edge showing -->
    <g>
      <rect x="452" y="962" width="22" height="30" fill="#b9b3a5" stroke="${C.ink}" stroke-width="2"/>
      <path d="M452 992 h22 v8 h-22 z" fill="#a8a294"/>
      <rect x="500" y="962" width="58" height="34" fill="#dcd8cd" stroke="${C.inkSoft}" stroke-width="1.6"/>
      <rect x="430" y="1000" width="104" height="182" rx="6" fill="url(#cab)" stroke="${C.ink}" stroke-width="2.4"/>
      <rect x="440" y="1012" width="84" height="74" rx="3" fill="none" stroke="${C.inkSoft}" stroke-width="1.6"/>
      ${[1028, 1040, 1052, 1064, 1076].map((y) => `<rect x="456" y="${y}" width="52" height="5" rx="2.5" fill="#9aa39e"/>`).join("")}
      <rect x="440" y="1094" width="84" height="78" rx="3" fill="none" stroke="${C.inkSoft}" stroke-width="1.6"/>
      <circle cx="482" cy="1133" r="5" fill="${C.sage}"/>
      <rect x="418" y="1108" width="14" height="52" fill="${C.kraft}" stroke="${C.ink}" stroke-width="1.6"/>
      <path d="M421 1112 l6 6 l-6 6 l6 6 l-6 6 l6 6 l-6 6 l6 6" fill="none" stroke="#fbf6ea" stroke-width="1.5"/>
    </g>

    <!-- DRYER with its vent duct to the hood outside -->
    ${ribbedDuct([[622, 1110], [622, 978], [770, 978]], 20)}
    <g>
      <rect x="584" y="1108" width="74" height="78" rx="5" fill="#f2f1ec" stroke="${C.ink}" stroke-width="2.4"/>
      <rect x="584" y="1108" width="74" height="16" rx="5" fill="#dcdcd5" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="600" cy="1116" r="4" fill="${C.inkSoft}"/><rect x="618" y="1113" width="26" height="6" rx="2" fill="#9aa39e"/>
      <circle cx="621" cy="1154" r="20" fill="#e3e2db" stroke="${C.ink}" stroke-width="2"/>
      <circle cx="621" cy="1154" r="13" fill="#d0cfc8"/>
    </g>
    <g>
      <rect x="760" y="966" width="30" height="24" rx="3" fill="#ecebe5" stroke="${C.ink}" stroke-width="2.2"/>
      <path d="M764 970 h22 l-4 16 h-14 z" fill="#d7d5cc" stroke="${C.inkSoft}" stroke-width="1.5"/>
    </g>

    <!-- WASHING MACHINE, the cosmetic job: drawn pale -->
    <g>
      <rect x="666" y="1108" width="74" height="78" rx="5" ${pale}/>
      <rect x="666" y="1108" width="74" height="16" rx="5" fill="none" stroke="${C.pale}" stroke-width="2"/>
      <rect x="672" y="1112" width="20" height="8" rx="2" fill="${C.pale}"/>
      <circle cx="703" cy="1154" r="20" fill="none" stroke="${C.pale}" stroke-width="2"/>
    </g>
  </svg>`;
}

/** A callout: a 2px ink leader from the label's anchor to an open ring on the object. */
const leader = ([x1, y1], [x2, y2], { dashed = false, via } = {}) => {
  const pts = via ? [[x1, y1], via, [x2, y2]] : [[x1, y1], [x2, y2]];
  const col = dashed ? C.pale : C.ink;
  return `<polyline points="${pts.map((q) => q.join(",")).join(" ")}" fill="none" stroke="${col}" stroke-width="2" ${dashed ? 'stroke-dasharray="5 5"' : ""}/>
    <circle cx="${x1}" cy="${y1}" r="4" fill="${col}"/>
    <circle cx="${x2}" cy="${y2}" r="10" fill="none" stroke="${dashed ? C.pale : C.sage}" stroke-width="3"/>`;
};

function houseCutaway() {
  const pin = plan("homebase/pin-2.4");
  // "SAFETY: Smoke or CO detector, Press the test button" -> tag, item label, task name.
  const items = pin.content.items.map((line) => {
    const greyed = line.startsWith("(greyed) ");
    const rest = greyed ? line.slice("(greyed) ".length) : line;
    const m = rest.match(/^(?:(SAFETY|COSTLY): )?(.+?), (.+)$/);
    if (!m) throw new Error(`cannot read callout: ${line}`);
    return { tag: m[1] ?? null, label: m[2], task: m[3], greyed };
  });
  const by = (label) => {
    const it = items.find((x) => x.label === label);
    if (!it) throw new Error(`no callout for ${label} in homebase/pin-2.4`);
    return it;
  };

  // Where each label sits on the page, and where its leader meets the object (page coordinates).
  const callouts = [
    { it: by("Gutters"), box: { left: 40, top: 360, width: 230 }, from: [150, 488], to: [188, 540], via: [150, 516] },
    { it: by("Smoke or CO detector"), box: { left: 40, top: 586, width: 160 }, from: [196, 610], to: [362, 566], via: [300, 610] },
    { it: by("Water heater"), box: { left: 40, top: 1040, width: 168 }, from: [196, 1100], to: [322, 1100], via: [250, 1100] },
    { it: by("Furnace"), box: { left: 360, top: 1236, width: 300, center: true }, from: [482, 1236], to: [482, 1124] },
    { it: by("Outdoor faucet"), box: { left: 812, top: 672, width: 160 }, from: [840, 866], to: [794, 900] },
    { it: by("Dryer"), box: { left: 812, top: 1022, width: 160 }, from: [826, 1026], to: [776, 980], via: [800, 1000] },
    { it: by("Washing machine"), box: { left: 812, top: 1160, width: 160 }, from: [810, 1176], to: [742, 1160], dashed: true },
  ];

  const tag = (t) => (t ? `<span class="tag ${t.toLowerCase()}">${esc(t)}</span>` : "");
  const labels = callouts
    .map(({ it, box }, i) => `<div class="callout${it.greyed ? " greyed" : ""}${box.center ? " center" : ""}" data-check="callout ${i + 1}" style="left:${box.left}px;top:${box.top}px;width:${box.width}px">${tag(it.tag)}<b>${esc(it.label)}</b><span>${esc(it.task)}</span></div>`)
    .join("");
  const leaders = `<svg class="leaders" viewBox="0 0 1000 1500" aria-hidden="true">${callouts.map((c) => leader(c.from, c.to, { dashed: c.dashed, via: c.via })).join("")}</svg>`;

  const [lead, ...restWords] = pin.headline.split(" by ");
  const body = `
  <div class="top" data-check="headline">
    <h1 class="serif">${esc(lead)} by <em>${esc(restWords.join(" by "))}</em></h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${houseScene()}
  ${leaders}
  ${labels}
  ${foot(p, { cta: "price" })}`;
  const css = `
  .top{position:absolute;left:60px;right:60px;top:60px;height:270px}
  .top h1{font-size:80px;line-height:1.0;letter-spacing:-.02em;font-weight:500;color:${C.ink}}
  .top h1 em{font-style:normal;color:var(--strong)}
  .top p{font-size:27px;line-height:1.35;color:var(--muted);margin-top:20px;max-width:840px}
  .scene{position:absolute;left:0;top:330px;width:1000px;height:1030px}
  .leaders{position:absolute;inset:0;width:1000px;height:1500px;pointer-events:none}
  .callout{position:absolute;display:flex;flex-direction:column;align-items:flex-start;gap:4px;background:${C.paper};padding:6px 0}
  .callout.center{align-items:center;text-align:center;background:transparent}
  .callout b{font-weight:600;font-size:27px;line-height:1.12;color:${C.ink}}
  .callout span:not(.tag){font-size:22px;line-height:1.25;color:${C.inkSoft}}
  .callout.greyed b,.callout.greyed span{color:#9aa49e}
  .tag{font:600 16px "Plex";letter-spacing:.14em;padding:4px 9px 3px;border-radius:5px;margin-bottom:4px}
  .tag.safety{color:${C.ochre};background:${C.ochreSoft};box-shadow:inset 0 0 0 1.5px #e3cfa5}
  .tag.costly{color:${C.deep};background:${C.soft};box-shadow:inset 0 0 0 1.5px #c9d8c4}
  `;
  return { id: "pin-2.4-house-cutaway", html: page(p, { body, css, paper: C.paper, ink: C.ink, muted: C.muted }) };
}

/* ================================================================ year wheel */

/** Small flat drawings for the interval rail, each centred in a 64 x 56 box. */
const MINI = {
  filter: () => `
    <g transform="translate(32 28)">
      <rect x="-26" y="-20" width="52" height="40" rx="2" fill="${C.kraft}" stroke="${C.ink}" stroke-width="1.8"/>
      <rect x="-18" y="-13" width="36" height="26" fill="#fbf6ea"/>
      <polyline points="${Array.from({ length: 10 }, (_, i) => `${-18 + i * 4},${i % 2 ? 13 : -13}`).join(" ")}" fill="none" stroke="#cdbb98" stroke-width="1.4"/>
      <path d="M-8 -17 h14 l-3 -2 M6 -17 l-3 2" stroke="${C.ink}" stroke-width="1.3" fill="none"/>
    </g>`,
  waterHeater: () => `
    <g transform="translate(32 28)">
      <rect x="-15" y="-18" width="30" height="42" rx="3" fill="#f3f1ea" stroke="${C.ink}" stroke-width="1.8"/>
      <ellipse cx="0" cy="-18" rx="15" ry="4" fill="#fbfaf6" stroke="${C.ink}" stroke-width="1.8"/>
      <rect x="-10" y="-28" width="4" height="10" fill="${C.water}"/><rect x="6" y="-28" width="4" height="10" fill="#b8784a"/>
      <rect x="-9" y="-8" width="12" height="8" fill="#fff" stroke="${C.inkSoft}" stroke-width="1"/>
      <rect x="-3" y="20" width="6" height="5" fill="#9e9a90"/>
    </g>`,
  dryerVent: () => `
    <g transform="translate(32 28)">
      <rect x="-28" y="-20" width="30" height="40" rx="3" fill="#f2f1ec" stroke="${C.ink}" stroke-width="1.8"/>
      <circle cx="-13" cy="4" r="9" fill="#e3e2db" stroke="${C.ink}" stroke-width="1.4"/>
      <path d="M2 -10 q14 0 14 -8 h12" fill="none" stroke="#9aa3a0" stroke-width="9" stroke-linecap="round"/>
      <path d="M2 -10 q14 0 14 -8 h12" fill="none" stroke="#c9cfcc" stroke-width="5" stroke-linecap="round"/>
      <rect x="24" y="-26" width="8" height="16" rx="1.5" fill="#ecebe5" stroke="${C.ink}" stroke-width="1.4"/>
    </g>`,
  fridgeCoils: () => `
    <g transform="translate(32 28)">
      <rect x="-24" y="-26" width="26" height="52" rx="4" fill="#f2f1ec" stroke="${C.ink}" stroke-width="1.8"/>
      <line x1="-24" y1="-8" x2="2" y2="-8" stroke="${C.ink}" stroke-width="1.4"/>
      <rect x="-5" y="-22" width="3" height="10" fill="${C.inkSoft}"/><rect x="-5" y="-4" width="3" height="16" fill="${C.inkSoft}"/>
      <path d="M8 -20 h18 M8 -20 v40 M26 -20 v40 M8 -12 h18 M8 -4 h18 M8 4 h18 M8 12 h18 M8 20 h18" stroke="#6d726f" stroke-width="2" fill="none"/>
    </g>`,
  smokeAlarm: () => `
    <g transform="translate(32 28)">
      <circle r="22" fill="#fbfaf6" stroke="${C.ink}" stroke-width="1.8"/>
      <circle r="15" fill="none" stroke="#c8ccc6" stroke-width="1.4"/>
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="${Math.cos(a) * 9}" y1="${Math.sin(a) * 9}" x2="${Math.cos(a) * 13}" y2="${Math.sin(a) * 13}" stroke="#9aa39e" stroke-width="2" stroke-linecap="round"/>`; }).join("")}
      <circle r="4.5" fill="#e3e2db" stroke="${C.inkSoft}" stroke-width="1.2"/>
      <circle cx="12" cy="-12" r="2.6" fill="${C.sage}"/>
    </g>`,
};

/** Season markers (leaf-and-frost): an autumn leaf, a snowflake, a spring bud. */
const leafMark = (x, y, r, c, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 -26 C16 -16 16 12 0 26 C-16 12 -16 -16 0 -26 Z" fill="${c}"/><path d="M0 -22 V30" stroke="#6e4a1c" stroke-width="2" opacity=".55"/>${[-12, -2, 8].map((yy) => `<path d="M0 ${yy} l8 -6 M0 ${yy} l-8 -6" stroke="#6e4a1c" stroke-width="1.4" opacity=".4"/>`).join("")}</g>`;
const snowflake = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="${C.water}" stroke-width="3" stroke-linecap="round">${Array.from({ length: 6 }, (_, i) => `<g transform="rotate(${i * 60})"><line x1="0" y1="0" x2="0" y2="-24"/><line x1="0" y1="-14" x2="-7" y2="-20"/><line x1="0" y1="-14" x2="7" y2="-20"/></g>`).join("")}</g>`;
const bud = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 30 C0 14 2 4 0 -6" stroke="#5f7d4f" stroke-width="3" fill="none"/><path d="M0 12 C10 6 18 8 22 0 C12 -2 4 2 0 12 Z" fill="#8fae79"/><path d="M0 -4 C-8 -10 -8 -22 0 -30 C8 -22 8 -10 0 -4 Z" fill="#a9c58f"/></g>`;

function yearWheel() {
  const pin = plan("homebase/pin-2.3");
  const [wheelLine, ...railLines] = pin.content.items;
  // "Wheel: seasonal jobs per month (Jan 0, Feb 1, ...)" -> the twelve Plate 15 counts.
  const counts = [...wheelLine.matchAll(/([A-Z][a-z]{2}) (\d+)/g)].map((m) => ({ month: m[1], n: Number(m[2]) }));
  if (counts.length !== 12) throw new Error("homebase/pin-2.3: expected twelve month counts");
  // "Interval rail: Replace the furnace or AC filter, every 1 to 3 months" -> job and interval.
  const rail = railLines.map((line) => {
    const m = line.replace(/^Interval rail: /, "").match(/^(.+), (.+)$/);
    return { job: m[1], every: m[2].charAt(0).toUpperCase() + m[2].slice(1) };
  });
  const minis = [MINI.filter, MINI.waterHeater, MINI.dryerVent, MINI.fridgeCoils, MINI.smokeAlarm];

  // Plate 15's own words for a month: "Clear", "1 job", "10 jobs".
  const jobsWord = (n) => (n === 0 ? "Clear" : n === 1 ? "1 job" : `${n} jobs`);
  const max = Math.max(...counts.map((c) => c.n));
  const mix = (a, b, t) => {
    const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
    const [A, B] = [h(a), h(b)];
    return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
  };

  const cx = 500, cy = 670, R = 282, r = 128;
  const pt = (rad, deg) => [cx + rad * Math.sin((deg * Math.PI) / 180), cy - rad * Math.cos((deg * Math.PI) / 180)];
  const peak = counts.findIndex((c) => c.n === max);
  const wedges = counts
    .map(({ month, n }, i) => {
      const a0 = i * 30 - 15 + 0.8, a1 = i * 30 + 15 - 0.8, mid = i * 30;
      const off = i === peak ? 22 : 0;
      const [ox, oy] = [off * Math.sin((mid * Math.PI) / 180), -off * Math.cos((mid * Math.PI) / 180)];
      const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1), [x2, y2] = pt(r, a1), [x3, y3] = pt(r, a0);
      const t = n / max;
      const fill = n === 0 ? C.sheet : mix("#e6ede2", p.strong, 0.12 + 0.88 * t);
      const dark = t > 0.5;
      const [mx, my] = pt(212, mid);
      const [nx, ny] = [mx, my + 26];
      return `<g transform="translate(${ox} ${oy})">
        <path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 0 0 ${x3} ${y3} Z" fill="${fill}" stroke="${n === 0 ? "#cfd8cc" : "none"}" stroke-width="2" ${n === 0 ? 'stroke-dasharray="6 5"' : ""}/>
        <text x="${mx}" y="${my - 4}" text-anchor="middle" font-family="Plex Mono" font-weight="600" font-size="22" letter-spacing="1" fill="${dark ? "#ffffff" : C.ink}">${esc(month.toUpperCase())}</text>
        <text x="${nx}" y="${ny + 8}" text-anchor="middle" font-family="Plex" font-weight="${n ? 600 : 400}" font-size="22" fill="${n === 0 ? "#8d968f" : dark ? "#e6ede2" : C.deep}">${esc(jobsWord(n))}</text>
      </g>`;
    })
    .join("");

  const svg = `
  <svg class="wheel" data-check="wheel" viewBox="0 340 1000 620" aria-hidden="true">
    <defs><filter id="wsoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter></defs>
    ${gridField(40, 350, 920, 600)}
    ${ticks(48, 354, 904, 592)}
    <circle cx="${cx + 6}" cy="${cy + 14}" r="${R}" fill="#3b2f1e" opacity=".10" filter="url(#wsoft)"/>
    <circle cx="${cx}" cy="${cy}" r="${R + 2}" fill="${C.sheet}"/>
    ${wedges}
    <circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="${C.sheet}" stroke="#d7dfd3" stroke-width="2"/>
    ${leafMark(150, 520, -30, "#c58a3a", 1.1)}${leafMark(122, 590, 25, "#a8752e", 0.9)}${leafMark(176, 832, 70, "#d39a4c", 0.85)}
    ${snowflake(318, 404, 0.95)}${snowflake(690, 406, 0.75)}
    ${bud(858, 600, 1.1)}
  </svg>`;

  const body = `
  <div class="top" data-check="headline">
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${svg}
  <div class="hub" data-check="hub"><span>Plate 15</span><b class="serif">What belongs to which month.</b></div>
  <div class="note hand" data-check="note">Nothing seasonal.<br>A good month.</div>
  <svg class="arrow" viewBox="0 0 1000 1500" aria-hidden="true"><path d="M790 914 C 740 944, 620 966, 540 942" fill="none" stroke="${C.inkSoft}" stroke-width="2.5" stroke-linecap="round"/><path d="M553 932 l-14 10 l16 6" fill="none" stroke="${C.inkSoft}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
  <div class="rail" data-check="rail">
    <div class="rail-head"><span class="eyebrow">These go on an interval</span></div>
    ${rail.map((x, i) => `<div class="row"><svg viewBox="0 0 64 56">${minis[i]()}</svg><span class="job">${esc(x.job)}</span><span class="every">${esc(x.every)}</span></div>`).join("")}
  </div>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .top{position:absolute;left:60px;right:60px;top:56px;height:290px}
  .top h1{font-size:64px;line-height:1.04;letter-spacing:-.018em;font-weight:500}
  .top p{font-size:26px;line-height:1.36;color:var(--muted);margin-top:18px;max-width:860px}
  .wheel{position:absolute;left:0;top:340px;width:1000px;height:620px}
  .hub{position:absolute;left:${cx - 112}px;top:${cy - 72}px;width:224px;height:144px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px}
  .hub span{font:600 17px "Plex";letter-spacing:.18em;text-transform:uppercase;color:var(--accent)}
  .hub b{font-weight:500;font-size:27px;line-height:1.12;color:${C.ink}}
  .note{position:absolute;left:748px;top:836px;width:232px;white-space:nowrap;font-size:32px;line-height:1.12;padding:2px 0 6px;color:${C.inkSoft};transform:rotate(-4deg)}
  .arrow{position:absolute;inset:0;width:1000px;height:1500px;pointer-events:none}
  .rail{position:absolute;left:56px;right:56px;top:978px;height:384px;background:${C.sheet};border-radius:18px;padding:18px 26px 12px;box-shadow:0 18px 40px -26px rgba(40,30,15,.45),inset 0 0 0 1.5px #e3dfd3}
  .rail-head{padding:0 0 8px;border-bottom:2px solid ${C.ink}}
  .rail .eyebrow{font-size:19px}
  .row{display:grid;grid-template-columns:64px 1fr auto;align-items:center;column-gap:18px;height:66px;border-bottom:1.5px solid #e4e0d5}
  .row:last-child{border-bottom:0}
  .row svg{width:64px;height:56px}
  .row .job{font-size:24px;line-height:1.15;color:${C.ink}}
  .row .every{font-size:23px;font-weight:600;color:var(--strong);text-align:right;white-space:nowrap}
  `;
  return { id: "pin-2.3-year-wheel", html: page(p, { body, css, paper: C.paper, ink: C.ink, muted: C.muted }) };
}

export const pins = [houseCutaway(), yearWheel()];
