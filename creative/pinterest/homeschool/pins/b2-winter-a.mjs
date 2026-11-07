/**
 * Batch 2, winter break set A: the catch-up-on-records guide
 * (how-to-catch-up-on-homeschool-records), four different pins.
 *   93  a dark evening window, lamp and mug; the guide's evening as dials on a timeline
 *   101 a wall calendar with October and December and a torn-out blank stretch between
 *   6   five numbered index cards fanned on slate felt beside loose papers and a timer
 *   30  before / after: a cork board pile with a sticky note over a tidy page of entries
 * Every word on a pin is the bank's (items, headline, sub) or the guide's own
 * "reconstructed" (guides.ts: "mark it as reconstructed").
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea } from "../kit/bank.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H_BOTTOM = 1354; // where the cream footer starts

/** Small deterministic random for torn edges and scribbles. */
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

/** A horizontal torn edge as an SVG path fragment from x0 to x1 at about y, going left to right. */
function tornPoints(x0, x1, y, amp, seed, step = 14) {
  const r = rng(seed);
  const pts = [];
  for (let x = x0; x <= x1; x += step) pts.push([x, y + (r() - 0.5) * 2 * amp]);
  pts.push([x1, y + (r() - 0.5) * 2 * amp]);
  return pts;
}

/** A scribble of faux handwriting (no letters): a wavy stroke of the given width. */
function scribble(x, y, w, seed, color = "#6b6b72", sw = 3) {
  const r = rng(seed);
  let d = `M${x} ${y}`;
  let cx = x;
  while (cx < x + w) {
    const dx = 10 + r() * 14;
    d += ` q${dx / 2} ${-8 - r() * 8} ${dx} ${(r() - 0.5) * 6}`;
    cx += dx;
    if (r() > 0.78) {
      cx += 14;
      d += ` m14 0`;
    }
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`;
}

// ---------------------------------------------------------------- 93

/** One 90-minute dial: the cumulative time light, this segment solid, a hand at the segment's end. */
function dial({ from, to, color, tint, size = 92 }) {
  const c = size / 2, r = size / 2 - 5;
  const pt = (m, rr = r) => {
    const a = (m / 90) * 2 * Math.PI - Math.PI / 2;
    return [c + Math.cos(a) * rr, c + Math.sin(a) * rr];
  };
  const wedge = (a, b, fill) => {
    const [x0, y0] = pt(a), [x1, y1] = pt(b);
    const large = (b - a) / 90 > 0.5 ? 1 : 0;
    return `<path d="M${c} ${c} L${x0} ${y0} A${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${fill}"/>`;
  };
  const ticks = Array.from({ length: 18 }, (_, k) => {
    const [x0, y0] = pt(k * 5, r), [x1, y1] = pt(k * 5, r - (k % 3 === 0 ? 9 : 5));
    return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#7a6d5a" stroke-width="${k % 3 === 0 ? 2.4 : 1.4}"/>`;
  }).join("");
  const [hx, hy] = pt(to, r - 6);
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${c}" cy="${c}" r="${r + 3}" fill="#fffaf0" stroke="#cbbda5" stroke-width="3"/>
    ${from > 0 ? wedge(0, from, tint) : ""}${wedge(from, to, color)}${ticks}
    <line x1="${c}" y1="${c}" x2="${hx}" y2="${hy}" stroke="#26282d" stroke-width="3.4" stroke-linecap="round"/><circle cx="${c}" cy="${c}" r="4.6" fill="#26282d"/></svg>`;
}

function scene93() {
  const i = idea(93);
  const segs = [
    { from: 0, to: 20, color: "#8aa182", tint: "#dbe5d4" },
    { from: 20, to: 40, color: "#e0a95a", tint: "#f5e3c4" },
    { from: 40, to: 60, color: "#c4573e", tint: "#efcdc2" },
    { from: 60, to: 75, color: "#5b7a9a", tint: "#cfdae6" },
    { from: 75, to: 90, color: "#7a4b8a", tint: "#dccbe2" },
  ];
  const T = SCENE_TOP;
  // the window, lamp and mug
  const wall = `<svg style="${abs(0, T, 1000, H_BOTTOM - T)}" viewBox="0 0 1000 ${H_BOTTOM - T}" aria-hidden="true">
    <defs>
      <linearGradient id="w93wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2640"/><stop offset="1" stop-color="#121a2e"/></linearGradient>
      <linearGradient id="w93sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1429"/><stop offset="1" stop-color="#2a3a63"/></linearGradient>
      <radialGradient id="w93glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffcf80" stop-opacity=".55"/><stop offset=".55" stop-color="#ffb35a" stop-opacity=".16"/><stop offset="1" stop-color="#ffb35a" stop-opacity="0"/></radialGradient>
      <linearGradient id="w93desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3427"/><stop offset="1" stop-color="#2c1e17"/></linearGradient>
      <linearGradient id="w93curt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d4666"/><stop offset=".5" stop-color="#85597d"/><stop offset="1" stop-color="#5d3a57"/></linearGradient>
    </defs>
    <rect width="1000" height="${H_BOTTOM - T}" fill="url(#w93wall)"/>
    <!-- window: frame, night sky, bare branches, the neighbours' lights -->
    <rect x="452" y="26" width="496" height="324" rx="6" fill="#d8ccb6"/>
    <rect x="468" y="42" width="464" height="292" fill="url(#w93sky)"/>
    <circle cx="840" cy="100" r="30" fill="#f4ecd2"/><circle cx="852" cy="92" r="27" fill="#16203a"/>
    ${[[520, 80], [600, 130], [690, 70], [760, 150], [560, 190], [880, 190], [640, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="#f4ecd2" opacity=".85"/>`).join("")}
    <path d="M468 334 L468 262 L520 262 L520 236 L560 236 L560 262 L600 262 L600 334 Z" fill="#0e1527"/>
    <rect x="528" y="246" width="12" height="14" fill="#f2c36b"/><rect x="574" y="276" width="12" height="14" fill="#f2c36b"/>
    <path d="M932 334 L932 230 L880 230 L880 334 Z" fill="#0e1527"/><rect x="896" y="250" width="12" height="14" fill="#f2c36b"/>
    <g stroke="#0a1020" stroke-width="5" fill="none" stroke-linecap="round"><path d="M468 300 C 540 280 600 250 690 240 C 740 232 790 216 840 160"/><path d="M690 240 C 700 210 720 190 744 176"/><path d="M600 262 C 640 252 660 220 650 190"/></g>
    <!-- muntins -->
    <rect x="696" y="42" width="12" height="292" fill="#d8ccb6"/><rect x="468" y="182" width="464" height="12" fill="#d8ccb6"/>
    <!-- curtains -->
    <path d="M440 8 L506 8 L498 360 L440 360 Z" fill="url(#w93curt)"/><path d="M960 8 L894 8 L902 360 L960 360 Z" fill="url(#w93curt)"/>
    <g stroke="#000" stroke-opacity=".16" stroke-width="3"><line x1="462" y1="8" x2="458" y2="360"/><line x1="480" y1="8" x2="476" y2="360"/><line x1="938" y1="8" x2="942" y2="360"/><line x1="920" y1="8" x2="924" y2="360"/></g>
    <rect x="430" y="350" width="540" height="22" rx="4" fill="#e6dcc8"/>
    <rect x="0" y="372" width="1000" height="${H_BOTTOM - T - 372}" fill="url(#w93desk)"/>
    <rect x="0" y="372" width="1000" height="4" fill="#6b4a37"/>
    <!-- the lamp -->
    <ellipse cx="180" cy="170" rx="330" ry="300" fill="url(#w93glow)"/>
    <ellipse cx="170" cy="386" rx="78" ry="14" fill="#000" opacity=".35"/>
    <ellipse cx="170" cy="370" rx="62" ry="16" fill="#8a6a46"/><rect x="108" y="352" width="124" height="20" rx="8" fill="#a98354"/>
    <rect x="162" y="168" width="16" height="188" rx="6" fill="#b79257"/>
    <path d="M96 168 L244 168 L214 52 L126 52 Z" fill="#f2c37a"/><path d="M126 52 L214 52 L222 82 L118 82 Z" fill="#fbe0a9"/><ellipse cx="170" cy="168" rx="74" ry="9" fill="#ffe9bd"/>
    <!-- the mug on the sill, steaming -->
    <ellipse cx="640" cy="350" rx="66" ry="9" fill="#000" opacity=".3"/>
    <path d="M702 292 C 744 286 744 334 700 332" fill="none" stroke="#f3ede4" stroke-width="15" stroke-linecap="round"/>
    <path d="M582 268 H 700 V 322 Q 700 350 672 350 H 610 Q 582 350 582 322 Z" fill="#f3ede4"/>
    <path d="M582 268 H 700 V 280 H 582 Z" fill="#fff" opacity=".6"/><rect x="590" y="300" width="104" height="14" fill="#c4573e" opacity=".85"/>
    <ellipse cx="641" cy="268" rx="59" ry="9" fill="#e4dccf"/><ellipse cx="641" cy="270" rx="52" ry="6" fill="#6b4226"/>
    <g fill="none" stroke="#f1e9d8" stroke-width="5" stroke-linecap="round" opacity=".5"><path d="M622 248 C 608 230 636 218 622 198"/><path d="M652 250 C 638 228 668 214 654 192"/></g>
  </svg>`;

  // the evening: the whole 90 minutes as one bar, then one row per segment, each with its dial
  const total = 90;
  const bar = segs.map((s) => `<div style="flex:${s.to - s.from};background:${s.color};height:100%"></div>`).join("");
  const rowH = 104;
  const rows = i.items
    .map((line, k) => {
      const [head, ...rest] = line.split(": ");
      const s = segs[k];
      return `<div class="r93" style="top:${58 + k * rowH}px">
        <div class="d93">${dial(s)}</div>
        <div class="t93"><b style="color:${k === 0 ? "#4f6a49" : k === 1 ? "#9a6a1c" : k === 2 ? "#a63f29" : k === 3 ? "#3f5f80" : "#6a3a7a"}">${head}</b><span>${rest.join(": ")}</span></div>
      </div>`;
    })
    .join("");
  const card = `<div class="c93" style="${abs(46, 746, 908, 584)}">
    <div style="${abs(24, 20, 860, 20, "display:flex;border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(40,20,5,.25)")}">${bar}</div>
    ${rows}
  </div>`;
  return wall + card;
}

const css93 = `
  .top h1{color:#f6ecd8;text-shadow:none;text-wrap:balance}
  .top p{color:#c9d0e2}
  .eyebrow{color:#e0a95a}
  .foot .who b{color:#f6ecd8}.foot .who span{color:#b9c0d4}
  .c93{background:#fbf5e8;border-radius:14px;box-shadow:0 3px 4px rgba(0,0,0,.4),0 24px 44px rgba(0,0,0,.5);transform:rotate(-.6deg)}
  .r93{position:absolute;left:24px;right:24px;height:96px;display:flex;align-items:center;gap:26px}
  .r93:not(:last-child)::after{content:"";position:absolute;left:46px;top:94px;width:0;height:14px;border-left:3px dotted #b6a78c}
  .d93{width:92px;height:92px;flex:none}
  .t93{display:flex;flex-direction:column;gap:3px}
  .t93 b{font:700 31px/1.1 "Plex",sans-serif;letter-spacing:-.005em}
  .t93 span{font:500 27px/1.25 "Plex",sans-serif;color:#2b2824}
`;

// ---------------------------------------------------------------- 101

function scene101() {
  const i = idea(101);
  const T = SCENE_TOP;
  const grid = (days, start, accent) => {
    const cells = [];
    for (let d = 1; d <= days; d++) {
      const idx = d - 1 + start;
      const col = idx % 7, row = Math.floor(idx / 7);
      cells.push(`<div style="position:absolute;left:${col * 80}px;top:${row * 34}px;width:80px;height:34px;display:grid;place-items:center;font:500 24px/1 'Plex',sans-serif;color:${col === 0 || col === 6 ? accent : "#3a3530"}">${d}</div>`);
    }
    return cells.join("");
  };
  // October sheet (torn along its foot), December sheet (torn along its head)
  const octTop = 424, octBottom = 690, decTop = 1040, decBottom = 1330;
  const octTear = tornPoints(150, 850, octBottom, 7, 11);
  const decTear = tornPoints(150, 850, decTop, 7, 29);
  const octPath = `M150 ${octTop} H850 V${octTear[octTear.length - 1][1]} ${[...octTear].reverse().map(([x, y]) => `L${x} ${y}`).join(" ")} Z`;
  const decPath = `M150 ${decBottom} H850 V${decTear[decTear.length - 1][1]} ${[...decTear].reverse().map(([x, y]) => `L${x} ${y}`).join(" ")} Z`;
  const wallSvg = `<svg style="${abs(0, T, 1000, H_BOTTOM - T)}" viewBox="0 ${T} 1000 ${H_BOTTOM - T}" aria-hidden="true">
    <defs>
      <linearGradient id="w101wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fb296"/><stop offset=".5" stop-color="#a9bba0"/><stop offset="1" stop-color="#93a78a"/></linearGradient>
      <filter id="w101sh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#1b2a18" flood-opacity=".38"/></filter>
      <filter id="w101sh2" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#2b1a08" flood-opacity=".4"/></filter>
    </defs>
    <rect y="${T}" width="1000" height="${H_BOTTOM - T}" fill="url(#w101wall)"/>
    ${Array.from({ length: 21 }, (_, k) => `<rect x="${k * 50 - 6}" y="${T}" width="3" height="${H_BOTTOM - T}" fill="#fff" opacity=".07"/>`).join("")}
    <!-- the backing board of the calendar, kraft, with a hanger -->
    <g filter="url(#w101sh)"><rect x="126" y="${T + 14}" width="748" height="${H_BOTTOM - T + 40}" rx="6" fill="#c8a679"/></g>
    <rect x="126" y="${T + 14}" width="748" height="${H_BOTTOM - T + 40}" fill="#fff" opacity=".05"/>
    <circle cx="500" cy="${T + 26}" r="9" fill="#555a62"/><circle cx="500" cy="${T + 26}" r="4" fill="#2b2e33"/>
    ${Array.from({ length: 15 }, (_, k) => `<rect x="${166 + k * 46}" y="${T + 36}" width="9" height="26" rx="4.5" fill="#3b3e44"/><circle cx="${170.5 + k * 46}" cy="${T + 40}" r="4" fill="#9a9ea6"/>`).join("")}
    <!-- the blank stretch: where the pages were, outlined in pencil -->
    <rect x="156" y="${octBottom + 14}" width="688" height="${decTop - octBottom - 28}" fill="#d7bb8f" opacity=".55"/>
    <rect x="156" y="${octBottom + 14}" width="688" height="${decTop - octBottom - 28}" fill="none" stroke="#7a5a30" stroke-width="3" stroke-dasharray="14 12" opacity=".7"/>
    <!-- October -->
    <g filter="url(#w101sh2)"><path d="${octPath}" fill="#fffaf0"/></g>
    <rect x="150" y="${octTop}" width="700" height="62" fill="#c4573e"/>
    <!-- December -->
    <g filter="url(#w101sh2)"><path d="${decPath}" fill="#fffaf0"/></g>
    <rect x="150" y="${decTop + 26}" width="700" height="62" fill="#5b7a9a"/>
  </svg>`;
  const octGrid = `<div style="${abs(220, octTop + 80, 560, 34 * 5)}">${grid(31, 3, "#c4573e")}</div>`;
  const decGrid = `<div style="${abs(220, decTop + 100, 560, 34 * 5)}">${grid(31, 2, "#5b7a9a")}</div>`;
  const octName = `<div style="${abs(150, octTop, 700, 62, "display:grid;place-items:center;font:600 40px/1 'Newsreader',serif;color:#fffaf0;letter-spacing:.05em")}">October</div>`;
  const decName = `<div style="${abs(150, decTop + 26, 700, 62, "display:grid;place-items:center;font:600 40px/1 'Newsreader',serif;color:#fffaf0;letter-spacing:.05em")}">December</div>`;
  // the quote: handwritten on a ruled card taped into the gap
  const q = i.items[0];
  const [qa, qb] = q.split("October to December");
  const quote = `<div class="q101" style="${abs(214, 748, 600, 262)}">
      <div class="tape" style="left:230px;top:-18px;transform:rotate(-3deg)"></div>
      <p>${qa}<mark>October to December</mark>${qb}</p>
    </div>`;
  const pencil = `<svg style="${abs(560, 985, 340, 30, "transform:rotate(7deg);filter:drop-shadow(0 8px 6px rgba(40,20,5,.35))")}" viewBox="0 0 340 30" aria-hidden="true"><rect x="46" y="3" width="246" height="24" rx="2" fill="#e7b23f"/><rect x="46" y="3" width="246" height="7" fill="#f3cf6a" opacity=".7"/><rect x="46" y="20" width="246" height="7" fill="#b98a22" opacity=".55"/><rect x="286" y="3" width="16" height="24" fill="#b9b9c0"/><rect x="302" y="3" width="26" height="24" rx="8" fill="#e58b8b"/><path d="M46 3 L2 15 L46 27 Z" fill="#e9c9a0"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;
  return wallSvg + octName + octGrid + decName + decGrid + quote + pencil;
}

const css101 = `
  .top h1{text-wrap:balance}
  .q101{background:#fffdf4;border-radius:6px;transform:rotate(-1.6deg);box-shadow:0 2px 3px rgba(40,20,5,.3),0 22px 34px rgba(40,20,5,.4);padding:30px 38px 18px 60px;
    background-image:linear-gradient(transparent 55px,#9fb4cf 56px,transparent 57px);background-size:100% 56px;background-position:0 12px;
    border-left:0}
  .q101::before{content:"";position:absolute;left:44px;top:0;bottom:0;width:2px;background:#d9776b;opacity:.7}
  .q101 p{font:600 49px/56px "Hand",cursive;color:#25324a;margin-top:-2px}
  .q101 mark{background:linear-gradient(transparent 14%,#f6c85a 14%,#f6c85a 88%,transparent 88%);color:#25324a;padding:0 4px;margin:0 -4px}
  .tape{position:absolute;width:150px;height:38px;background:rgba(224,169,90,.78);box-shadow:0 2px 3px rgba(40,20,5,.2);
    clip-path:polygon(0 0,4% 18%,0 36%,4% 55%,0 78%,3% 100%,100% 100%,96% 80%,100% 56%,96% 36%,100% 16%,97% 0)}
`;

// ---------------------------------------------------------------- 6

function scene6() {
  const i = idea(6);
  const T = SCENE_TOP;
  const accents = ["#8aa182", "#e0a95a", "#c4573e", "#5b7a9a", "#7a4b8a"];
  const rots = [-2.6, -1.4, 0.3, 1.8, 2.6];
  const dx = [0, 14, -4, 12, 0];
  const felt = `<svg style="${abs(0, T, 1000, H_BOTTOM - T)}" viewBox="0 0 1000 ${H_BOTTOM - T}" aria-hidden="true">
    <defs>
      <filter id="w6felt" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .1  0 0 0 0 .15  0 0 0 0 .22  0 0 0 .55 0"/></filter>
      <radialGradient id="w6lt" cx="30%" cy="10%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#0a1220" stop-opacity=".34"/></radialGradient>
    </defs>
    <rect width="1000" height="${H_BOTTOM - T}" fill="#46607c"/><rect width="1000" height="${H_BOTTOM - T}" filter="url(#w6felt)"/><rect width="1000" height="${H_BOTTOM - T}" fill="url(#w6lt)"/>
  </svg>`;
  const cards = i.items
    .map((line, k) => {
      const [head, ...rest] = line.split(": ");
      const body = rest.join(": ");
      return `<div class="ic6" style="left:${54 + dx[k]}px;top:${T + 26 + k * 186}px;transform:rotate(${rots[k]}deg)">
        <div class="n6" style="background:${accents[k]}">${k + 1}</div>
        <div class="x6"><b>${head}</b><span>${body}</span></div>
      </div>`;
    })
    .join("");
  // loose papers on the right, bleeding off the edge
  const sheetSvg = (x, y, w, h, rot, seed, lines = 11, extra = "") => {
    const r = rng(seed);
    const ls = Array.from({ length: lines }, (_, k) => scribble(24, 60 + k * 30, (w - 60) * (0.55 + r() * 0.45), seed * 7 + k, "#6b6b72", 2.6)).join("");
    return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 8px rgba(5,10,25,.45))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" fill="#fbfaf5"/>${ls}${extra}</svg>`;
  };
  const papers = [
    sheetSvg(752, T + 40, 300, 400, 9, 3),
    sheetSvg(742, T + 70, 300, 400, -5, 5, 10),
    sheetSvg(764, T + 110, 300, 400, 4, 7, 12, `<rect x="0" y="0" width="300" height="34" fill="#e8ddc6"/><circle cx="26" cy="17" r="7" fill="#46607c" opacity=".5"/>`),
  ].join("");
  // a long receipt and a paperclip
  const receipt = `<svg style="${abs(786, T + 504, 130, 300, "transform:rotate(-8deg);filter:drop-shadow(0 6px 6px rgba(5,10,25,.45))")}" viewBox="0 0 130 300" aria-hidden="true"><path d="M0 0 H130 V300 L118 292 L106 300 L94 292 L82 300 L70 292 L58 300 L46 292 L34 300 L22 292 L10 300 L0 294 Z" fill="#f6f3ea"/>${Array.from({ length: 10 }, (_, k) => scribble(14, 40 + k * 24, 56 + ((k * 37) % 50), 90 + k, "#8a8a90", 2.4)).join("")}</svg>`;
  const clip = `<svg style="${abs(790, T + 36, 46, 110, "transform:rotate(12deg);filter:drop-shadow(0 4px 3px rgba(5,10,25,.4))")}" viewBox="0 0 46 110" aria-hidden="true"><path d="M13 60 V20 a10 10 0 0 1 20 0 V84 a16 16 0 0 1 -32 0 V30" fill="none" stroke="#cfd3da" stroke-width="4.5" stroke-linecap="round"/></svg>`;
  // a kitchen timer, bottom right
  const timer = `<svg style="${abs(758, T + 658, 250, 300, "transform:rotate(-6deg);filter:drop-shadow(0 14px 10px rgba(5,10,25,.5))")}" viewBox="0 0 250 300" aria-hidden="true">
    <ellipse cx="125" cy="262" rx="100" ry="26" fill="#a9402a"/>
    <circle cx="125" cy="140" r="118" fill="#c4573e"/><circle cx="125" cy="140" r="118" fill="none" stroke="#a9402a" stroke-width="5"/>
    <circle cx="125" cy="140" r="88" fill="#fbf5e8"/>
    ${Array.from({ length: 60 }, (_, k) => { const a = (k / 60) * 2 * Math.PI; const r1 = 88, r2 = k % 5 === 0 ? 74 : 81; return `<line x1="${125 + Math.cos(a) * r1}" y1="${140 + Math.sin(a) * r1}" x2="${125 + Math.cos(a) * r2}" y2="${140 + Math.sin(a) * r2}" stroke="#4a3f33" stroke-width="${k % 5 === 0 ? 3 : 1.5}"/>`; }).join("")}
    <path d="M125 140 L125 66 A74 74 0 0 1 175 85 Z" fill="#e0a95a" opacity=".55"/>
    <line x1="125" y1="140" x2="125" y2="64" stroke="#26282d" stroke-width="5" stroke-linecap="round"/><circle cx="125" cy="140" r="9" fill="#26282d"/>
    <rect x="100" y="12" width="50" height="22" rx="8" fill="#a9402a"/><ellipse cx="60" cy="48" rx="20" ry="8" fill="#fff" opacity=".18" transform="rotate(-30 60 48)"/></svg>`;
  const pencil = `<svg style="${abs(660, T + 880, 340, 30, "transform:rotate(-18deg);filter:drop-shadow(0 8px 6px rgba(5,10,25,.45))")}" viewBox="0 0 340 30" aria-hidden="true"><rect x="46" y="3" width="246" height="24" rx="2" fill="#e7b23f"/><rect x="46" y="3" width="246" height="7" fill="#f3cf6a" opacity=".7"/><rect x="46" y="20" width="246" height="7" fill="#b98a22" opacity=".55"/><rect x="286" y="3" width="16" height="24" fill="#b9b9c0"/><rect x="302" y="3" width="26" height="24" rx="8" fill="#e58b8b"/><path d="M46 3 L2 15 L46 27 Z" fill="#e9c9a0"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;
  return felt + papers + receipt + clip + cards + timer + pencil;
}

const css6 = `
  .top h1{text-wrap:balance}
  .ic6{position:absolute;width:690px;height:176px;background:#fffdf6;border-radius:6px;box-shadow:0 2px 3px rgba(5,10,25,.35),0 16px 24px rgba(5,10,25,.4);
    background-image:linear-gradient(transparent 31px,#cdd9ea 32px,transparent 33px);background-size:100% 30px;background-position:0 5px;overflow:hidden;transform-origin:40% 50%}
  .ic6::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:#d9776b;opacity:0}
  .n6{position:absolute;left:22px;top:50%;margin-top:-34px;width:68px;height:68px;border-radius:50%;display:grid;place-items:center;font:600 44px/1 "Newsreader",serif;color:#fff;box-shadow:0 3px 5px rgba(40,20,5,.3)}
  .x6{position:absolute;left:112px;right:24px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:4px}
  .x6 b{font:700 29px/1.1 "Plex",sans-serif;color:#1d1d20}
  .x6 span{font:500 24px/1.26 "Plex",sans-serif;color:#2b2b30}
`;

// ---------------------------------------------------------------- 30

function scene30() {
  const T = SCENE_TOP;
  const seam = 846;
  const r = rng(77);
  // cork board for the top half
  const cork = `<svg style="${abs(0, T, 1000, seam - T + 20)}" viewBox="0 0 1000 ${seam - T + 20}" aria-hidden="true">
    <defs>
      <filter id="w30cork" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".05 .09" numOctaves="4" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .08  0 0 0 1.1 -.2"/></filter>
      <filter id="w30corkb" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .98  0 0 0 0 .86  0 0 0 0 .68  0 0 0 .8 -.28"/></filter>
    </defs>
    <rect width="1000" height="${seam - T + 20}" fill="#c4965f"/><rect width="1000" height="${seam - T + 20}" filter="url(#w30cork)"/><rect width="1000" height="${seam - T + 20}" filter="url(#w30corkb)"/>
  </svg>`;
  // the messy pile: crumpled sheets, a workbook, loose receipts
  const crumple = (cx, cy, rad, rot, seed, fill = "#f7f2e6") => {
    const rr = rng(seed);
    const n = 11;
    const pts = Array.from({ length: n }, (_, k) => {
      const a = (k / n) * 2 * Math.PI;
      const rd = rad * (0.74 + rr() * 0.4);
      return `${rad + Math.cos(a) * rd},${rad + Math.sin(a) * rd}`;
    });
    const creases = Array.from({ length: 5 }, () => `<path d="M${rad * (0.3 + rr() * 0.8)} ${rad * (0.3 + rr() * 0.8)} L${rad * (0.5 + rr() * 0.9)} ${rad * (0.5 + rr() * 0.9)}" stroke="#000" stroke-opacity=".14" stroke-width="2.4"/>`).join("");
    return `<svg style="${abs(cx - rad, cy - rad, rad * 2, rad * 2, `transform:rotate(${rot}deg);filter:drop-shadow(0 7px 6px rgba(40,20,5,.4))`)}" viewBox="0 0 ${rad * 2} ${rad * 2}" aria-hidden="true"><polygon points="${pts.join(" ")}" fill="${fill}" stroke="#d9d1bd" stroke-width="2"/>${creases}</svg>`;
  };
  const flatSheet = (x, y, w, h, rot, seed, lines = 7) => `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 6px rgba(40,20,5,.4))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" fill="#fbfaf5"/>${Array.from({ length: lines }, (_, k) => scribble(18, 36 + k * 26, (w - 40) * (0.4 + rng(seed + k)() * 0.5), seed * 3 + k, "#6b6b72", 2.4)).join("")}</svg>`;
  const workbook = `<svg style="${abs(70, T + 150, 250, 300, "transform:rotate(-12deg);filter:drop-shadow(0 10px 8px rgba(40,20,5,.45))")}" viewBox="0 0 250 300" aria-hidden="true"><rect width="250" height="300" rx="6" fill="#5f8a8f"/><rect x="0" y="0" width="22" height="300" fill="#4a7075"/><rect x="48" y="50" width="160" height="54" rx="4" fill="#f2ecd9"/><rect x="62" y="68" width="110" height="9" rx="3" fill="#5f8a8f" opacity=".6"/><rect x="62" y="84" width="70" height="9" rx="3" fill="#5f8a8f" opacity=".45"/></svg>`;
  const pile = [
    flatSheet(300, T + 70, 250, 330, 7, 4, 9),
    crumple(250, T + 330, 96, 20, 5),
    flatSheet(420, T + 200, 230, 300, -9, 8, 8),
    workbook,
    crumple(560, T + 400, 84, -15, 9, "#f2ebd9"),
    flatSheet(120, T + 40, 200, 150, -18, 11, 4),
    crumple(480, T + 120, 70, 40, 13),
    // pins
    ...[[258, T + 112], [520, T + 266], [168, T + 100]].map(([x, y]) => `<span class="pin30" style="left:${x}px;top:${y}px"></span>`),
  ].join("");
  // sticky notes, one with the real words
  const sticky = (x, y, rot, color, content, size = 190) => `<div class="sn30" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};transform:rotate(${rot}deg)">${content}</div>`;
  const stickies = [
    sticky(690, T + 50, 6, "#f6d964", `<div class="sw30">a made-up<br>Tuesday</div>`, 250),
    sticky(660, T + 330, -9, "#f2a5b0", `<svg viewBox="0 0 150 150" width="100%" height="100%" aria-hidden="true">${scribble(18, 50, 100, 21, "#7a3140", 3)}${scribble(18, 84, 70, 22, "#7a3140", 3)}${scribble(18, 118, 90, 23, "#7a3140", 3)}</svg>`, 150),
    sticky(850, T + 330, 8, "#a9d9c0", `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">${scribble(14, 44, 78, 31, "#2f5a44", 3)}${scribble(14, 82, 56, 32, "#2f5a44", 3)}</svg>`, 120),
    sticky(40, T + 270, -6, "#9fd0ee", `<svg viewBox="0 0 150 150" width="100%" height="100%" aria-hidden="true">${scribble(18, 50, 100, 41, "#25506f", 3)}${scribble(18, 90, 60, 42, "#25506f", 3)}</svg>`, 150),
  ].join("");
  // the clean half: ash-white table, a tidy ruled page of entries each marked reconstructed
  const clean = `<svg style="${abs(0, seam, 1000, H_BOTTOM - seam)}" viewBox="0 0 1000 ${H_BOTTOM - seam}" aria-hidden="true">
    <defs><linearGradient id="w30ash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9e1d1"/><stop offset="1" stop-color="#d8cdb8"/></linearGradient></defs>
    <rect width="1000" height="${H_BOTTOM - seam}" fill="url(#w30ash)"/>
    ${Array.from({ length: 8 }, (_, k) => `<path d="M0 ${30 + k * 66} C 300 ${24 + k * 66 + (k % 3) * 5}, 700 ${38 + k * 66}, 1000 ${28 + k * 66}" stroke="#a89675" stroke-opacity=".18" stroke-width="2" fill="none"/>`).join("")}
  </svg>`;
  const rowH = 78;
  const entries = Array.from({ length: 4 }, (_, k) => `<div class="en30" style="top:${62 + k * rowH}px">
      <span class="dt30">October to December</span>
      <svg viewBox="0 0 150 50" width="150" height="50" aria-hidden="true" style="flex:none">${scribble(4, 34, 136, 50 + k * 3, "#4b4b52", 3)}</svg>
      <span class="st30">reconstructed</span>
    </div>`).join("");
  const page = `<div class="pg30" style="${abs(64, 932, 872, 396)}">
      <div class="rule30" style="top:54px"></div>
      ${entries}
      <div class="bc30"></div>
    </div>`;
  const tabBefore = `<div class="tab30" style="left:40px;top:${T + 22}px;transform:rotate(-2deg)">Before</div>`;
  const tabAfter = `<div class="tab30 aft" style="left:40px;top:${seam + 52}px;transform:rotate(1.5deg)">After</div>`;
  // the band over the seam with the guide's own sentence
  const band = `<div class="band30" style="${abs(44, seam - 36, 912, 78)}">A record that says roughly when something happened is credible.</div>`;
  return cork + pile + stickies + tabBefore + clean + page + tabAfter + band;
}

const css30 = `
  .top h1{text-wrap:balance}
  .pin30{position:absolute;width:20px;height:20px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 12%,#d9534a 14%,#a52f27);box-shadow:0 5px 4px rgba(40,20,5,.45);z-index:2}
  .sn30{position:absolute;box-shadow:0 2px 2px rgba(40,20,5,.25),0 14px 16px rgba(40,20,5,.38);padding:18px 20px;z-index:2}
  .sn30::after{content:"";position:absolute;left:0;right:0;top:0;height:20%;background:linear-gradient(rgba(255,255,255,.28),transparent)}
  .sw30{color:#2a2418;font:700 58px/1.15 'Hand',cursive;white-space:nowrap;text-decoration:line-through;text-decoration-color:#c4392e;text-decoration-thickness:5px}
  .tab30{position:absolute;z-index:4;background:#fbf5e8;color:#6a2f2a;font:700 34px/1 "Plex",sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:12px 24px;border-radius:5px;box-shadow:0 3px 4px rgba(40,20,5,.35)}
  .tab30.aft{color:#3d5a3a}
  .band30{z-index:4;background:#fbf5e8;border-radius:6px;box-shadow:0 4px 6px rgba(40,20,5,.35),0 14px 22px rgba(40,20,5,.3);display:grid;place-items:center;text-align:center;font:600 27px/1.25 "Plex",sans-serif;color:#1d1d20;padding:0 24px;border-top:6px solid #8aa182}
  .pg30{background:#fffdf7;border-radius:4px;box-shadow:0 2px 3px rgba(40,20,5,.28),0 18px 28px rgba(40,20,5,.3);overflow:hidden;z-index:3}
  .pg30::before{content:"";position:absolute;left:62px;top:0;bottom:0;width:2px;background:#d9776b;opacity:.6}
  .rule30{position:absolute;left:0;right:0;height:3px;background:#8aa182;opacity:.0}
  .en30{position:absolute;left:84px;right:26px;height:74px;display:flex;align-items:center;gap:20px;border-bottom:2px solid #c9d6e6}
  .dt30{font:600 40px/1 "Hand",cursive;color:#25324a;white-space:nowrap;flex:none;width:290px}
  .st30{margin-left:auto;font:600 22px/1 "Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:#a63f29;border:3px solid #a63f29;border-radius:6px;padding:7px 10px;transform:rotate(-4deg);opacity:.92;white-space:nowrap}
`;

// ---------------------------------------------------------------- exports

export const pins = [
  printable({ n: 93, scene: scene93(), paper: "#1b2640", extraCss: css93 }),
  printable({ n: 101, scene: scene101(), paper: "#e9ece2", extraCss: css101 }),
  printable({ n: 6, scene: scene6(), paper: "#efe7da", extraCss: css6 }),
  printable({ n: 30, scene: scene30(), paper: "#f3ece0", extraCss: css30 }),
];
