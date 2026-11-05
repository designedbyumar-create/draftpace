/**
 * Personal Life Affairs Companion, v3 test pins: two of the seven visuals in
 * pinterest/strategy/personal-life-affairs-companion.json, drawn from the
 * product's own study-desk world (navy, brass, slate, manila on cream).
 *
 * - ple/pin-3.1, the line on the form: a beneficiary form pulled out of the
 *   navy band, its "Named beneficiary" line highlighted and left blank, the
 *   guide's real "What passes by form, and what the will controls" rows
 *   printed on it, and a sealed will envelope tucked behind (guides.ts,
 *   beneficiary-forms-override-your-will).
 * - ple/pin-10.1, where, not what: a key ring hanging over a bank deposit
 *   box and a home safe, its manila tags carrying the guide's real "Three
 *   things to write down" and the book's "Who has a spare key" (guides.ts,
 *   safe-deposit-box-and-spare-keys-who-can-open-it; affairsKnowledge.ts
 *   home.keys). No tag, dial or box carries a number or a code.
 */
import { product, page, foot, esc } from "../kit.mjs";

const p = product("personal-life-affairs-companion");
const STRATEGY = (await import("../../strategy/personal-life-affairs-companion.json", { with: { type: "json" } })).default;
const plan = (id) => {
  const pin = STRATEGY.pins.find((x) => x.id === id);
  if (!pin) throw new Error(`no ${id} in the personal-life-affairs strategy`);
  return pin;
};

/* The strategy's palette: the product's own ink and paper. */
const C = {
  navy: p.accent, // #26374f
  strong: p.strong, // #1a2738
  slate: p.soft, // #e6eaf0
  ground: "#efebe2",
  paper: "#fbf8f1",
  deep: "#e4ded0",
  text: "#1b1f27",
  muted: "#565c68",
  brass: "#9a7b3f",
  brassLight: "#d6bf8a",
  highlight: "#ead9a6",
  manila: "#f1e6c8",
  manilaEdge: "#ddc994",
};

/* ------------------------------------------------------------ the line on the form */

/** "401(k) or other workplace plan: Beneficiary form on file with the plan. Does the will control it: No" -> [asset, passes by, will controls]. */
function formRow(line) {
  const at = line.indexOf(": ");
  const asset = line.slice(0, at);
  let rest = line.slice(at + 2).replace(/\.?\s*Does the will control it:\s*/, ". ");
  const cut = rest.lastIndexOf(". ");
  return [asset, rest.slice(0, cut), rest.slice(cut + 2)];
}

const willEnvelope = () => `
  <svg class="envelope" viewBox="0 0 480 218" aria-hidden="true">
    <rect x="1.5" y="1.5" width="477" height="215" rx="6" fill="${C.paper}" stroke="#d6cdb8" stroke-width="3"/>
    <path d="M3 4 L240 118 L477 4" fill="#f3eee2" stroke="#d6cdb8" stroke-width="3" stroke-linejoin="round"/>
    <path d="M3 214 L190 96 M477 214 L290 96" stroke="#e6dfcf" stroke-width="2.5"/>
    <circle cx="240" cy="118" r="27" fill="${C.brass}"/>
    <circle cx="240" cy="118" r="19" fill="none" stroke="${C.brassLight}" stroke-width="2.5"/>
    <path d="M232 112 q8 -9 16 0 q-8 9 -16 0" fill="none" stroke="${C.brassLight}" stroke-width="2"/>
    <text x="300" y="186" font-family="Newsreader" font-style="italic" font-size="46" fill="${C.navy}">Will</text>
  </svg>`;

const paperclip = () => `
  <svg class="clip" viewBox="0 0 54 150" aria-hidden="true">
    <path d="M15 128 V26 a12 12 0 0 1 24 0 V112 a6 6 0 0 1 -12 0 V40" fill="none" stroke="#8a919c" stroke-width="5" stroke-linecap="round"/>
    <path d="M15 128 a12 12 0 0 0 24 0 V112" fill="none" stroke="#8a919c" stroke-width="5" stroke-linecap="round"/>
  </svg>`;

function nameLine() {
  const pin = plan("ple/pin-3.1");
  const rows = pin.content.items.map(formRow);
  // The column heads and the small print are the guide table's own (same source as the rows).
  const body = `
  <div class="band"></div>
  <div class="top" data-check="headline">
    <div class="eyebrow">Beneficiary vs will</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${willEnvelope()}
  <div class="form" data-check="form">
    ${paperclip()}
    <div class="form-head">What passes by form, and what the will controls</div>
    <div class="named">
      <span class="label">Named beneficiary</span>
      <span class="line"><i></i></span>
    </div>
    <div class="cols"><span>Asset · Usually passes by</span><span>Does the will control it</span></div>
    <div class="rows" data-check="rows">
      ${rows.map(([asset, by, will]) => `<div class="row"><div><b>${esc(asset)}</b><span>${esc(by)}</span></div><em class="serif">${esc(will)}</em></div>`).join("")}
    </div>
    <p class="small">General shape for the United States. Confirm the details with each plan or provider, since rules vary.</p>
  </div>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .band{position:absolute;left:0;right:0;top:0;height:560px;background:var(--accent)}
  .top{position:absolute;left:72px;right:72px;top:72px;height:420px}
  .top .eyebrow{color:${C.brassLight}}
  .top h1{font-size:78px;line-height:1.03;letter-spacing:-.018em;margin-top:18px;font-weight:500;color:${C.paper}}
  .top p{font-size:28px;line-height:1.36;color:rgba(251,248,241,.78);margin-top:22px;max-width:800px}
  .envelope{position:absolute;left:606px;top:600px;width:440px;height:200px;transform:rotate(8deg);filter:drop-shadow(0 14px 18px rgba(40,34,20,.16))}
  .form{position:absolute;left:60px;top:500px;width:712px;height:812px;background:${C.paper};border-radius:6px;transform:rotate(-4deg);transform-origin:50% 0;box-shadow:0 2px 0 #e2dccd,0 34px 50px -24px rgba(26,39,56,.42);padding:0 0 26px}
  .clip{position:absolute;left:56px;top:-44px;width:44px;height:122px}
  .form-head{background:var(--accent);color:${C.paper};font:600 23px/1.2 "Plex";padding:24px 34px 22px 116px;border-radius:6px 6px 0 0}
  .named{padding:30px 34px 6px}
  .named .label{display:block;font:600 19px "Plex";letter-spacing:.14em;text-transform:uppercase;color:${C.muted}}
  .named .line{position:relative;display:block;height:62px;margin-top:6px;border-bottom:2.5px solid ${C.navy}}
  .named .line i{position:absolute;left:-8px;right:-10px;top:22px;bottom:-12px;background:${C.highlight};opacity:.85;border-radius:12px 18px 14px 10px;transform:rotate(-.6deg)}
  .cols{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin:26px 34px 0;padding-bottom:10px;border-bottom:1.5px solid #cfc8b6;font:600 17px/1.25 "Plex";letter-spacing:.12em;text-transform:uppercase;color:${C.muted}}
  .cols span:last-child{width:210px;text-align:right}
  .rows{margin:0 34px;height:408px}
  .row{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:10px 0;border-bottom:1.5px dashed #d9d2c2;height:102px}
  .row div{display:flex;flex-direction:column;gap:4px}
  .row b{font-weight:600;font-size:25px;line-height:1.2;color:${C.text}}
  .row span{font-size:22px;line-height:1.25;color:${C.muted}}
  .row em{flex:none;width:96px;text-align:center;font-style:normal;font-weight:600;font-size:38px;color:var(--accent)}
  .small{margin:16px 34px 0;font-size:22px;line-height:1.35;color:${C.muted};font-style:italic}
  `;
  return { id: "pin-3.1-the-name-line", html: page(p, { body, css, paper: C.ground, ink: C.text, muted: C.muted }) };
}

/* ------------------------------------------------------------ where, not what */

/** A flat key hanging from its bow hole at the origin, pointing down. */
function key({ len = 170, fill, edge, bow = "round", teeth = [0, 1, 0, 1] }) {
  const shankTop = 64;
  const tipY = shankTop + len;
  const bowShape = bow === "round"
    ? `<circle cx="0" cy="34" r="32" fill="${fill}" stroke="${edge}" stroke-width="3"/>`
    : `<path d="M-34 6 h68 a8 8 0 0 1 8 8 v34 a18 18 0 0 1 -18 18 h-48 a18 18 0 0 1 -18 -18 v-34 a8 8 0 0 1 8 -8 Z" fill="${fill}" stroke="${edge}" stroke-width="3"/>`;
  const toothH = 18;
  const bits = teeth.map((t, i) => {
    const y = tipY - 26 - i * (toothH + 6);
    return `<rect x="7" y="${y - toothH}" width="${t ? 22 : 13}" height="${toothH}" fill="${fill}" stroke="${edge}" stroke-width="3"/>`;
  }).join("");
  return `
    ${bits}
    <path d="M-9 ${shankTop} H9 V${tipY - 10} L0 ${tipY} L-9 ${tipY - 10} Z" fill="${fill}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/>
    <line x1="-2" y1="${shankTop + 8}" x2="-2" y2="${tipY - 18}" stroke="${edge}" stroke-width="2" opacity=".45"/>
    ${bowShape}
    <rect x="-17" y="${shankTop - 6}" width="34" height="10" rx="3" fill="${fill}" stroke="${edge}" stroke-width="3"/>
    <circle cx="0" cy="14" r="9" fill="${C.ground}" stroke="${edge}" stroke-width="3"/>`;
}

const depositBox = () => `
  <g>
    <rect x="0" y="0" width="470" height="170" rx="10" fill="#6f7a8a"/>
    <rect x="10" y="10" width="450" height="150" rx="6" fill="#8b95a4"/>
    <rect x="10" y="10" width="450" height="30" rx="6" fill="#9ea7b4"/>
    <line x1="10" y1="40" x2="460" y2="40" stroke="#5f6a7a" stroke-width="3"/>
    ${[60, 410].map((x) => `<rect x="${x - 22}" y="30" width="44" height="14" rx="3" fill="#5f6a7a"/>`).join("")}
    <rect x="44" y="70" width="150" height="56" rx="5" fill="${C.slate}" stroke="#5f6a7a" stroke-width="3"/>
    ${[290, 370].map((x) => `<g transform="translate(${x} 98)"><circle r="24" fill="#c9ced6" stroke="#5f6a7a" stroke-width="3"/><circle cy="-4" r="7" fill="${C.strong}"/><path d="M-4 0 h8 l3 14 h-14 Z" fill="${C.strong}"/></g>`).join("")}
    <rect x="200" y="140" width="70" height="12" rx="6" fill="#5f6a7a"/>
  </g>`;

const homeSafe = () => {
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r1 = i % 6 ? 30 : 26;
    return `<line x1="${Math.sin(a) * r1}" y1="${-Math.cos(a) * r1}" x2="${Math.sin(a) * 36}" y2="${-Math.cos(a) * 36}" stroke="${C.strong}" stroke-width="${i % 6 ? 2 : 3}"/>`;
  }).join("");
  return `
  <g>
    <rect x="18" y="262" width="34" height="16" rx="4" fill="${C.strong}"/><rect x="228" y="262" width="34" height="16" rx="4" fill="${C.strong}"/>
    <rect x="0" y="0" width="280" height="268" rx="18" fill="#33435c"/>
    <rect x="20" y="20" width="240" height="228" rx="16" fill="#41536f" stroke="#2a3850" stroke-width="3"/>
    <rect x="12" y="62" width="14" height="40" rx="4" fill="#2a3850"/><rect x="12" y="166" width="14" height="40" rx="4" fill="#2a3850"/>
    <g transform="translate(116 124)"><circle r="46" fill="#2a3850"/><circle r="38" fill="#e9e5db"/>${ticks}<circle r="16" fill="#c9ced6" stroke="${C.strong}" stroke-width="3"/><path d="M0 -36 l-6 -10 h12 Z" fill="${C.brass}"/></g>
    <g transform="translate(212 124)"><rect x="-7" y="-50" width="14" height="100" rx="7" fill="#c9ced6" stroke="${C.strong}" stroke-width="3"/><circle r="14" fill="#c9ced6" stroke="${C.strong}" stroke-width="3"/></g>
  </g>`;
};

/** A manila tag in HTML, hole at one end; the string is drawn in the scene SVG to that hole. */
const tag = ({ text, label, x, y, w, h, rot, side }) => `
  <div class="tag ${side}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;transform:rotate(${rot}deg)" data-check="tag">
    <div class="t"><span>${label ? `<b>${esc(label)}</b> ` : ""}${esc(text)}</span></div>
  </div>`;

function whereNotWhat() {
  const pin = plan("ple/pin-10.1");
  const items = pin.content.items;
  /** "What it is: a home safe..." keeps its own label in bold; the others are plain. */
  const split = (s) => {
    const m = s.match(/^([^:]{3,40}):\s(.+)$/);
    return m ? { label: `${m[1]}:`, text: m[2] } : { text: s };
  };
  const RING = [500, 140];
  const R = 44;
  // Tags around the ring, hole end towards the ring. Hole sits 30px in from that end, half-way down.
  const tags = [
    { ...split(items[0]), x: 36, y: 100, w: 364, h: 170, rot: -3, side: "right" },
    { ...split(items[1]), x: 50, y: 338, w: 340, h: 140, rot: 4, side: "right" },
    { ...split(items[2]), x: 606, y: 108, w: 356, h: 130, rot: 3, side: "left" },
    { ...split(items[3]), x: 620, y: 344, w: 330, h: 86, rot: -4, side: "left" },
  ];
  const hole = (t) => [t.side === "right" ? t.x + t.w - 30 : t.x + 30, t.y + t.h / 2];
  const strings = tags.map((t) => {
    const [hx, hy] = hole(t);
    const ang = Math.atan2(hy - RING[1], hx - RING[0]);
    const sx = RING[0] + Math.cos(ang) * R;
    const sy = RING[1] + Math.sin(ang) * R;
    const mx = (sx + hx) / 2;
    const my = Math.max(sy, hy) + 34;
    return `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${hx} ${hy}" fill="none" stroke="${C.navy}" stroke-width="2.5" stroke-linecap="round"/>`;
  }).join("");
  const keys = [
    { rot: 16, k: key({ len: 170, fill: "#d2b678", edge: "#8a6d33", teeth: [1, 0, 1, 1] }) },
    { rot: -15, k: key({ len: 214, fill: "#c3c8d0", edge: "#6b7380", bow: "square", teeth: [0, 1, 1, 0, 1] }) },
    { rot: 1, k: key({ len: 250, fill: "#a9b0bb", edge: "#5f6a7a", teeth: [1, 1, 0, 1, 0, 1] }) },
  ];
  const ringBottom = [RING[0], RING[1] + R - 6];
  const scene = `
  <svg class="scene" data-check="scene" viewBox="0 0 1000 900" aria-hidden="true">
    <defs><filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#2a2414" flood-opacity=".18"/></filter></defs>
    <rect x="0" y="848" width="1000" height="52" fill="${C.deep}"/>
    <rect x="0" y="848" width="1000" height="5" fill="#d6cdb9"/>
    <g transform="translate(56 664) scale(1.08)" filter="url(#sh)">${depositBox()}</g>
    <g transform="translate(626 542) scale(1.1)" filter="url(#sh)">${homeSafe()}</g>
    ${strings}
    <g filter="url(#sh)">
      <rect x="${RING[0] - 34}" y="0" width="68" height="34" rx="7" fill="${C.brass}"/>
      <circle cx="${RING[0] - 20}" cy="17" r="5" fill="#7a602e"/><circle cx="${RING[0] + 20}" cy="17" r="5" fill="#7a602e"/>
      <path d="M${RING[0]} 30 V${RING[1] - R - 2} a16 16 0 0 0 26 -6" fill="none" stroke="${C.brass}" stroke-width="9" stroke-linecap="round"/>
      ${keys.map(({ rot, k }) => `<g transform="translate(${ringBottom[0]} ${ringBottom[1]}) rotate(${rot})">${k}</g>`).join("")}
      <circle cx="${RING[0]}" cy="${RING[1]}" r="${R}" fill="none" stroke="${C.brass}" stroke-width="5"/>
      <circle cx="${RING[0]}" cy="${RING[1]}" r="${R - 6}" fill="none" stroke="#b89a5c" stroke-width="3"/>
    </g>
  </svg>`;
  const body = `
  ${scene}
  ${tags.map(tag).join("")}
  <div class="top" data-check="headline">
    <div class="eyebrow">Three things to write down</div>
    <h1 class="serif">${esc(pin.headline)}</h1>
    <p>${esc(pin.sub)}</p>
  </div>
  ${foot(p, { cta: "guide" })}`;
  const css = `
  .scene{position:absolute;left:0;top:0;width:1000px;height:900px}
  .tag{position:absolute;filter:drop-shadow(0 8px 10px rgba(42,36,20,.18))}
  .tag.left{transform-origin:30px 50%}.tag.right{transform-origin:calc(100% - 30px) 50%}
  .tag .t{width:100%;height:100%;background:${C.manila};display:flex;align-items:center;font-size:24px;line-height:1.3;color:${C.text}}
  .tag.left .t{clip-path:polygon(26px 0,100% 0,100% 100%,26px 100%,0 calc(100% - 26px),0 26px);padding:14px 22px 14px 66px}
  .tag.right .t{clip-path:polygon(0 0,calc(100% - 26px) 0,100% 26px,100% calc(100% - 26px),calc(100% - 26px) 100%,0 100%);padding:14px 66px 14px 22px}
  .tag .t span{display:block}
  .tag .t b{font-weight:600;color:var(--accent)}
  .tag::after{content:"";position:absolute;top:50%;width:22px;height:22px;margin-top:-11px;border-radius:50%;background:${C.ground};border:5px solid ${C.manilaEdge};box-sizing:border-box}
  .tag.left::after{left:19px}.tag.right::after{right:19px}
  .top{position:absolute;left:72px;right:72px;top:964px;height:400px}
  .top h1{font-size:68px;line-height:1.05;letter-spacing:-.015em;margin-top:14px;font-weight:500;color:var(--accent)}
  .top p{font-size:28px;line-height:1.35;color:var(--muted);margin-top:18px}
  `;
  return { id: "pin-10.1-where-not-what", html: page(p, { body, css, paper: C.ground, ink: C.text, muted: C.muted }) };
}

export const pins = [nameLine(), whereNotWhat()];
