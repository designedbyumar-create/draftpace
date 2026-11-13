/**
 * Home Base pins, group C: the living room.
 * #23 safety page on a walnut coffee table under lamplight
 * #25 maintenance log on a kraft card on a sage sofa cushion, throw over the edge
 * #29 quick reference sheet taped to a living-room wall above a sideboard
 * #33 the twelve areas as a house cutaway (the living room is one of its rooms)
 * #51 the year page on a clipboard on a woven rug, headline in the left third
 * #101 the emergency page on a parquet floor beside a binder and a pen
 *
 * Every page is the real Home Survey page image; nothing on a page is redrawn.
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { bookPage } from "../kit/assets.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, sheet, pencil, mug, clipboard } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const id = (n) => `${n}-${idea(n).headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`;

/** A cut-and-taped strip of washi tape. */
const washi = (x, y, rot, c1 = "#e9c46a", c2 = "#f0d58a") =>
  `<div style="${abs(x, y, 130, 38, `transform:rotate(${rot}deg);background:repeating-linear-gradient(45deg,${c1} 0 10px,${c2} 10px 20px);opacity:.88;box-shadow:0 2px 4px rgba(40,20,5,.25);clip-path:polygon(0 0,100% 0,97% 25%,100% 50%,97% 75%,100% 100%,0 100%,3% 75%,0 50%,3% 25%)`)}"></div>`;

/* ------------------------------------------------------------------ #23 */
function p23() {
  const scene = `
  ${desk({ top: 372, height: 1000, base: "#6a4630", dark: "#58391f", planks: 4, seed: 11 })}
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 560px 520px at 330px 760px,rgba(255,214,150,.55),rgba(255,214,150,0) 70%),radial-gradient(ellipse 120% 100% at 50% 50%,rgba(0,0,0,0) 45%,rgba(12,6,0,.55) 100%)")}"></div>
  ${sheet({ src: bookPage(13), x: 140, y: 438, w: 640, tilt: -3 })}
  ${mug({ x: 800, y: 810, size: 140, color: "#efe7d8", drink: "#3b2415" })}
  <div style="${abs(798, 470, 190, 104, "transform:rotate(3deg);background:#f0d58a;border:3px solid #8a5a11;border-radius:10px;box-shadow:0 10px 16px rgba(0,0,0,.4);display:grid;place-items:center;text-align:center")}"><span style="font:600 28px/1.15 'Plex',sans-serif;color:#8a5a11;letter-spacing:.01em">Safety and security</span></div>
  <svg style="${abs(722, 1096, 230, 230, "filter:drop-shadow(0 16px 12px rgba(0,0,0,.5))")}" viewBox="0 0 230 230" aria-hidden="true">
    <circle cx="115" cy="115" r="108" fill="#f3f1ea"/><circle cx="115" cy="115" r="108" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    <circle cx="115" cy="115" r="86" fill="#e8e5dc"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const a = (k * Math.PI) / 4 + 0.2; return `<ellipse cx="${115 + Math.cos(a) * 58}" cy="${115 + Math.sin(a) * 58}" rx="26" ry="7" transform="rotate(${(a * 180) / Math.PI} ${115 + Math.cos(a) * 58} ${115 + Math.sin(a) * 58})" fill="#bdb9ad"/>`; }).join("")}
    <circle cx="115" cy="115" r="30" fill="#f3f1ea" stroke="#cfcabd" stroke-width="3"/><circle cx="115" cy="115" r="9" fill="#d9d5c9"/>
    <circle cx="168" cy="52" r="6" fill="#7fb08a"/></svg>
  ${pencil({ x: 40, y: 1272, len: 400, rot: -4, body: "#2f4a3a", band: "#c9ccd2" })}`;
  return printable({ n: 23, scene, paper: "#e9e1d0" });
}

/* ------------------------------------------------------------------ #25 */
function p25() {
  const plaid = `<pattern id="pl" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#eadfc6"/><rect x="0" y="0" width="90" height="26" fill="#35503f" opacity=".85"/><rect x="0" y="0" width="26" height="90" fill="#35503f" opacity=".85"/><rect x="0" y="52" width="90" height="5" fill="#d9962b" opacity=".8"/><rect x="52" y="0" width="5" height="90" fill="#d9962b" opacity=".8"/><rect x="0" y="66" width="90" height="2" fill="#35503f"/><rect x="66" y="0" width="2" height="90" fill="#35503f"/></pattern>`;
  const scene = `
  <div style="${abs(0, 372, 1000, 982, "background:linear-gradient(180deg,#a9c1ab,#93ae97);")}"></div>
  <div style="${abs(0, 372, 1000, 982, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.09) 0 2px,transparent 2px 5px),repeating-linear-gradient(90deg,rgba(40,70,50,.07) 0 2px,transparent 2px 5px)")}"></div>
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 80% 70% at 35% 45%,rgba(255,255,255,.2),rgba(0,0,0,0) 70%)")}"></div>
  <!-- piped seam of the cushion -->
  <div style="${abs(0, 1196, 830, 6, "background:#e9efe4;box-shadow:0 2px 3px rgba(0,0,0,.25);opacity:.9")}"></div>
  <!-- sofa arm -->
  <div style="${abs(826, 340, 220, 1000, "border-radius:90px 0 0 90px;background:linear-gradient(90deg,#4f7a5c,#6d9a7f 40%,#5f8b6d);box-shadow:-18px 0 30px rgba(20,40,28,.45),inset 6px 0 0 #e9efe4")}"></div>
  <div style="${abs(850, 372, 160, 982, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 2px,transparent 2px 5px)")}"></div>
  ${mug({ x: 850, y: 440, size: 110, color: "#f3ede4", drink: "#5a3a22" })}
  <!-- kraft card -->
  <div style="${abs(76, 412, 716, 838, "background:linear-gradient(135deg,#d3b283,#c3a070);border-radius:14px;box-shadow:0 2px 4px rgba(40,25,10,.35),0 24px 40px rgba(30,45,35,.45)")}"></div>
  <div style="${abs(90, 426, 688, 810, "border:2px dashed rgba(110,80,40,.45);border-radius:8px")}"></div>
  ${sheet({ src: bookPage(33), x: 132, y: 456, w: 580, tilt: 0 })}
  ${pencil({ x: 270, y: 1108, len: 420, rot: -7, body: "#2f4a3a", band: "#c9ccd2" })}
  <!-- throw blanket -->
  <svg style="${abs(0, 1196, 1000, 160, "filter:drop-shadow(0 -6px 8px rgba(20,40,28,.4))")}" viewBox="0 0 1000 160" aria-hidden="true"><defs>${plaid}</defs>
    <path d="M0 58 C 120 22 240 62 380 38 C 520 14 640 58 780 34 C 880 18 940 40 1000 30 L1000 160 L0 160 Z" fill="url(#pl)"/>
    <path d="M0 58 C 120 22 240 62 380 38 C 520 14 640 58 780 34 C 880 18 940 40 1000 30" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="3"/></svg>`;
  return printable({ n: 25, scene, paper: "#efe8d6" });
}

/* ------------------------------------------------------------------ #29 */
function p29() {
  const scene = `
  <div style="${abs(0, 372, 1000, 982, "background:linear-gradient(180deg,#cfdcc9,#c1d1bb)")}"></div>
  <!-- dado rail and lower panelling -->
  <div style="${abs(0, 1160, 1000, 12, "background:#f1eee4;box-shadow:0 3px 4px rgba(40,50,40,.25)")}"></div>
  <div style="${abs(0, 1172, 1000, 190, "background:repeating-linear-gradient(90deg,#b9cab2 0 3px,#c9d8c2 3px 190px)")}"></div>
  <!-- lamp light on the wall -->
  <div style="${abs(0, 372, 1000, 982, "background:radial-gradient(ellipse 330px 420px at 872px 900px,rgba(255,228,160,.7),rgba(255,228,160,0) 70%)")}"></div>
  ${sheet({ src: bookPage(30), x: 92, y: 412, w: 600, tilt: -1.2 })}
  ${washi(98, 378, -8)}${washi(566, 384, 7, "#b9cfb4", "#cfe0ca")}
  <!-- sideboard -->
  <div style="${abs(-10, 1226, 1020, 40, "background:linear-gradient(#d9b27d,#c99b66);border-radius:6px 6px 0 0;box-shadow:0 -4px 8px rgba(40,50,40,.2),0 10px 14px rgba(40,25,10,.35)")}"></div>
  <div style="${abs(-10, 1266, 1020, 100, "background:linear-gradient(#b8854f,#a0703d)")}"></div>
  <div style="${abs(60, 1286, 400, 70, "border:3px solid rgba(70,40,15,.35);border-radius:4px")}"></div>
  <div style="${abs(540, 1286, 400, 70, "border:3px solid rgba(70,40,15,.35);border-radius:4px")}"></div>
  <!-- plant -->
  <svg style="${abs(700, 1070, 130, 160, "filter:drop-shadow(0 10px 8px rgba(40,25,10,.3))")}" viewBox="0 0 130 160" aria-hidden="true">
    <path d="M65 110 C 40 80, 10 70, 8 30 C 36 40, 58 70, 65 110Z" fill="#5f8b6d"/><path d="M65 110 C 60 70, 62 30, 70 4 C 84 40, 76 80, 65 110Z" fill="#4f7a5c"/><path d="M65 110 C 90 80, 118 70, 122 36 C 92 44, 70 74, 65 110Z" fill="#6d9a7f"/>
    <path d="M65 110 C 50 100, 30 100, 18 84 C 40 80, 58 90, 65 110Z" fill="#79a68a"/>
    <path d="M26 108 H104 L96 156 H34 Z" fill="#d7a47a"/><rect x="22" y="102" width="86" height="12" rx="4" fill="#c28d62"/></svg>
  <!-- lamp -->
  <svg style="${abs(792, 930, 180, 300, "filter:drop-shadow(0 10px 8px rgba(40,25,10,.3))")}" viewBox="0 0 180 300" aria-hidden="true">
    <path d="M40 10 H140 L170 130 H10 Z" fill="#f6e7bf"/><path d="M40 10 H140 L170 130 H10 Z" fill="#fff" opacity=".35"/><path d="M10 130 H170" stroke="#d9c48f" stroke-width="5"/>
    <rect x="86" y="130" width="8" height="40" fill="#8a6a45"/>
    <path d="M60 296 C 40 240, 44 190, 90 172 C 136 190, 140 240, 120 296 Z" fill="#e9efe4"/><path d="M60 296 C 40 240, 44 190, 90 172 C 136 190, 140 240, 120 296 Z" fill="none" stroke="#9cb39f" stroke-width="3"/></svg>`;
  return printable({ n: 29, scene, paper: "#ece8dc" });
}

/* ------------------------------------------------------------------ #33 */
function p33() {
  const i = idea(33);
  const [eyebrow, rest] = i.headline.split(": ");
  const OY = 338;
  const ink = "#1a2420";
  const tag = (num, label, x, y, w, col = C.sage, wrap = true) =>
    `<div style="position:absolute;left:${x}px;top:${y + OY}px;width:${w}px;display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;background:#fff;border:2px solid ${C.rule};border-radius:999px;box-shadow:0 5px 10px rgba(30,50,35,.2);${wrap ? "" : "white-space:nowrap;width:auto;"}"><span style="flex:none;width:36px;height:36px;border-radius:50%;background:${col};color:#fff;font:600 19px 'Plex Mono',monospace;display:grid;place-items:center">${num}</span><span style="font:600 23px/1.1 'Plex',sans-serif;color:${ink}">${esc(label)}</span></div>`;
  const stroke = `stroke="${ink}" stroke-width="4" stroke-linejoin="round"`;
  const thin = `stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"`;
  const tiles = Array.from({ length: 9 }, (_, k) => `<path d="M${40 + k * 12} ${180 - k * 19.4} L${960 - k * 12} ${180 - k * 19.4}" stroke="#fff" stroke-opacity=".16" stroke-width="3"/>`).join("");
  const svg = `<svg style="${abs(0, OY, 1000, 950)}" viewBox="0 0 1000 950" aria-hidden="true">
    <!-- chimney and roof -->
    <rect x="735" y="40" width="60" height="100" fill="#c9b79c" ${thin}/><rect x="729" y="34" width="72" height="14" fill="#a99877" ${thin}/>
    <path d="M40 182 L500 6 L960 182 Z" fill="${C.sageDeep}" ${stroke}/>${tiles}
    <rect x="42" y="176" width="916" height="10" rx="3" fill="#8c9590" ${thin}/>
    <!-- upper floor -->
    <rect x="50" y="186" width="300" height="190" fill="#f6f3ea" ${stroke}/><rect x="350" y="186" width="300" height="190" fill="#eef2e8" ${stroke}/><rect x="650" y="186" width="300" height="190" fill="#f6f3ea" ${stroke}/>
    <circle cx="200" cy="208" r="20" fill="#fff" ${thin}/><circle cx="200" cy="208" r="8" fill="none" ${thin}/>
    <rect x="276" y="272" width="54" height="104" fill="#d6c3a0" ${thin}/><circle cx="318" cy="326" r="4" fill="${ink}"/><rect x="296" y="300" width="14" height="18" fill="none" ${thin}/>
    <path d="M352 188 H470 C 450 214 410 236 362 230 L352 232 Z" fill="#b5bba3" opacity=".75"/>
    <rect x="552" y="236" width="76" height="86" fill="#dbe8ee" ${thin}/><path d="M590 236 V322 M552 279 H628" ${thin}/>
    <rect x="676" y="326" width="206" height="34" rx="4" fill="#dfe8dc" ${thin}/><rect x="668" y="296" width="14" height="64" rx="3" fill="#b79a6c" ${thin}/><rect x="686" y="312" width="52" height="16" rx="8" fill="#fff" ${thin}/><path d="M740 326 H882 V350 H740 Z" fill="#8fb29a" ${thin}/><rect x="676" y="360" width="206" height="8" fill="#b79a6c"/>
    <path d="M918 232 V244" ${thin}/><circle cx="918" cy="256" r="9" fill="none" stroke="${C.amber}" stroke-width="3.5"/><path d="M918 265 V296 M918 282 h10 M918 292 h8" stroke="${C.amber}" stroke-width="3.5" fill="none"/>
    <!-- ground floor -->
    <rect x="50" y="376" width="225" height="230" fill="#fbfaf6" ${stroke}/><rect x="275" y="376" width="225" height="230" fill="#f0f3ea" ${stroke}/><rect x="500" y="376" width="225" height="230" fill="#fbf4e1" ${stroke}/><rect x="725" y="376" width="225" height="230" fill="#f0f3ea" ${stroke}/>
    <rect x="60" y="540" width="205" height="66" fill="#e6ede2" ${thin}/><rect x="56" y="532" width="213" height="10" fill="#8c8a80" ${thin}/><rect x="104" y="506" width="50" height="26" rx="4" fill="#cfd6d0" ${thin}/><path d="M154 516 h14" ${thin}/><path d="M196 532 v-26 h30 v26" fill="#fff" ${thin}/>
    <rect x="300" y="502" width="104" height="104" rx="6" fill="#fff" ${thin}/><circle cx="352" cy="560" r="32" fill="#cfd9d0" ${thin}/><circle cx="352" cy="560" r="21" fill="#aebdb2" ${thin}/><circle cx="318" cy="518" r="4" fill="${ink}"/><rect x="420" y="552" width="50" height="54" rx="4" fill="#c8a679" ${thin}/>
    <ellipse cx="610" cy="604" rx="104" ry="7" fill="#f0d58a" opacity=".65"/>
    <rect x="514" y="522" width="140" height="58" rx="14" fill="#8fb29a" ${thin}/><rect x="508" y="556" width="152" height="44" rx="12" fill="#6d9a7f" ${thin}/>
    <path d="M692 600 V510" ${thin}/><path d="M676 478 H708 L714 512 H670 Z" fill="#f6e7bf" ${thin}/>
    <rect x="700" y="570" width="20" height="30" rx="3" fill="#d7a47a" ${thin}/><path d="M710 570 C 694 552 696 540 704 530 C 716 542 718 556 710 570Z M710 570 C 724 556 732 548 726 536 C 716 544 712 556 710 570Z" fill="#5f8b6d" ${thin}/>
    <rect x="870" y="474" width="64" height="132" rx="4" fill="#8a6a45" ${thin}/><circle cx="886" cy="544" r="5" fill="#f0d58a"/><rect x="744" y="574" width="86" height="8" fill="#b79a6c" ${thin}/><path d="M754 582 V606 M820 582 V606" ${thin}/>
    <path d="M746 574 V532 Q746 528 750 528 H772 L780 538 H824 Q828 538 828 542 V574 Z" fill="#f0d58a" ${thin}/><path d="M760 552 H812 M760 562 H800" stroke="#8a7a50" stroke-width="2.5"/>
    <!-- basement -->
    <rect x="50" y="606" width="300" height="200" fill="#e0e4da" ${stroke}/><rect x="350" y="606" width="300" height="200" fill="#d9dfd6" ${stroke}/><rect x="650" y="606" width="300" height="200" fill="#e0e4da" ${stroke}/>
    <rect x="86" y="706" width="86" height="94" rx="14" fill="#fff" ${thin}/><circle cx="129" cy="738" r="14" fill="#e6ede2" ${thin}/><path d="M129 738 L136 730" ${thin}/><rect x="104" y="768" width="50" height="18" rx="3" fill="#cfd6d0" ${thin}/>
    <path d="M172 746 H330" stroke="#8a8f89" stroke-width="14" stroke-linecap="round"/><path d="M172 746 H330" stroke="#fff" stroke-opacity=".3" stroke-width="4"/>
    <path d="M360 764 H560" stroke="${C.slate}" stroke-width="10" stroke-linecap="round"/><path d="M470 764 V734" stroke="${C.slate}" stroke-width="8"/><path d="M450 734 H490" stroke="${C.slate}" stroke-width="6" stroke-linecap="round"/><circle cx="470" cy="764" r="12" fill="#fff" stroke="${C.slate}" stroke-width="4"/>
    <rect x="560" y="700" width="72" height="102" rx="14" fill="#fff" ${thin}/><path d="M596 700 V676" stroke="${C.slate}" stroke-width="8"/><path d="M560 764 H574" stroke="${C.slate}" stroke-width="8"/>
    <rect x="820" y="696" width="104" height="104" rx="4" fill="#cfd6d0" ${thin}/><rect x="832" y="708" width="80" height="80" fill="#e9eee8" ${thin}/>${[0, 1, 2, 3].map((r) => `<rect x="840" y="${716 + r * 18}" width="26" height="12" fill="#fff" ${thin}/><rect x="878" y="${716 + r * 18}" width="26" height="12" fill="#fff" ${thin}/>`).join("")}
    <path d="M900 696 V612" stroke="#8a8f89" stroke-width="8"/>
    <!-- grounds -->
    <rect x="0" y="826" width="1000" height="110" rx="10" fill="#b8cfa6"/><rect x="0" y="826" width="1000" height="10" fill="#9bb98a"/>
    <path d="M410 936 L440 836 H560 L590 936 Z" fill="#e9dfc6"/>
    <ellipse cx="660" cy="870" rx="48" ry="34" fill="#6f9a77" ${thin}/><ellipse cx="740" cy="866" rx="56" ry="38" fill="#5f8b6d" ${thin}/><ellipse cx="830" cy="874" rx="46" ry="32" fill="#6f9a77" ${thin}/>
    <rect x="925" y="850" width="10" height="70" fill="#8a6a45"/><circle cx="930" cy="840" r="36" fill="#5f8b6d" ${thin}/>
    ${[[640, 910], [690, 922], [760, 912], [806, 924], [860, 912], [700, 892], [790, 898]].map(([x, y], k) => `<circle cx="${x}" cy="${y}" r="9" fill="${["#f0d58a", "#fff", "#e8b7a8"][k % 3]}" ${thin}/>`).join("")}
  </svg>`;
  const body = `
  ${svg}
  ${tag("08", "Structure and exterior", 345, 64, 450, C.sage, false).replace("width:450px;", "")}
  ${tag("07", "Safety and security", 66, 222, 214, C.ochre)}
  ${tag("10", "Pests and damp", 366, 222, 214)}
  ${tag("13", "Renting", 666, 222, 214)}
  ${tag("02", "Kitchen", 62, 414, 200)}
  ${tag("03", "Laundry", 287, 414, 200)}
  ${tag("11", "Everyday things", 512, 414, 200)}
  ${tag("12", "Papers and facts", 737, 414, 200)}
  ${tag("04", "Heating, cooling and air", 66, 618, 236)}
  ${tag("05", "Water and plumbing", 366, 618, 236, C.slate)}
  ${tag("06", "Power and electrical", 666, 618, 236)}
  ${tag("09", "Grounds and garden", 40, 850, 300, C.sage, false)}
  <div class="top" data-check="headline" data-bottom-max="${OY - 4}"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(rest)}</h1><p>${esc(i.sub)}</p></div>
  ${footFor(i)}`;
  const css = `
  .top{position:absolute;left:56px;right:56px;top:46px;z-index:6}
  .top h1{font:500 62px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:10px}
  .top p{font-size:26px;line-height:1.3;margin-top:10px;color:#4b4a42}`;
  return { n: 33, id: id(33), html: page(p, { body, css, paper: C.paper }) };
}

/* ------------------------------------------------------------------ #51 */
function p51() {
  const i = idea(51);
  const [eyebrow, rest] = i.headline.split(": ");
  const stripes = Array.from({ length: 17 }, (_, k) => `<rect x="0" y="${k * 92}" width="1000" height="92" fill="${k % 2 ? "#3c5c48" : "#34503f"}"/><rect x="0" y="${k * 92 + 8}" width="1000" height="4" fill="#e9dfc6" opacity=".3"/><rect x="0" y="${k * 92 + 16}" width="1000" height="2" fill="#d9962b" opacity="${k % 3 === 0 ? 0.55 : 0.25}"/>`).join("");
  const rug = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><rect width="1000" height="1500" fill="#34503f"/>${stripes}
    <rect x="26" y="26" width="948" height="1448" fill="none" stroke="#e9dfc6" stroke-opacity=".5" stroke-width="5"/><rect x="44" y="44" width="912" height="1412" fill="none" stroke="#e9dfc6" stroke-opacity=".3" stroke-width="2"/></svg>
  <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse 700px 800px at 640px 640px,rgba(255,225,170,.28),rgba(0,0,0,0) 70%),radial-gradient(ellipse 120% 100% at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,.45) 100%)")}"></div>`;
  const body = `
  ${rug}
  ${clipboard({ x: 336, y: 262, w: 656, h: 1020, tilt: 2 })}
  ${sheet({ src: bookPage(29), x: 372, y: 346, w: 586, tilt: 2 })}
  ${mug({ x: 40, y: 1066, size: 190, color: "#f1eadb", drink: "#4a2f1c" })}
  ${pencil({ x: 50, y: 1262, len: 420, rot: -6 })}
  <div class="top" data-check="headline" data-bottom-max="1040"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(rest)}</h1><p>${esc(i.sub)}</p></div>
  <div style="${abs(0, 1354, 1000, 146, "background:#efe8d6;box-shadow:0 -8px 22px rgba(0,0,0,.35);z-index:5")}"></div>
  ${footFor(i)}`;
  const css = `
  .foot{z-index:7}
  .top{position:absolute;left:56px;width:290px;top:70px;z-index:6;color:#f4efe2}
  .top .eyebrow{color:#e9dfc6;font-size:21px;line-height:1.5}
  .top h1{font:500 60px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:22px;color:#fbf6ea}
  .top p{font-size:25px;line-height:1.35;margin-top:26px;color:#e9dfc6}`;
  return { n: 51, id: id(51), html: page(p, { body, css, paper: "#34503f" }) };
}

/* ------------------------------------------------------------------ #101 */
function p101() {
  const i = idea(101);
  const [eyebrow, rest] = i.headline.split(": ");
  // Chequerboard parquet, light honey oak.
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const tones = ["#e2c595", "#d9b983", "#e8cfa3", "#d3b07a", "#dfc08d"];
  const cell = 125, parts = [];
  for (let r = 0; r < 12; r++) for (let c = 0; c < 8; c++) {
    const horiz = (r + c) % 2 === 0;
    for (let k = 0; k < 5; k++) {
      const t = tones[Math.floor(rnd() * tones.length)];
      const x = c * cell + (horiz ? 0 : k * 25), y = r * cell + (horiz ? k * 25 : 0);
      parts.push(`<rect x="${x}" y="${y}" width="${horiz ? cell : 25}" height="${horiz ? 25 : cell}" fill="${t}" stroke="#8a6234" stroke-opacity=".35" stroke-width="1.5"/>`);
    }
  }
  const floor = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true">${parts.join("")}</svg>
  <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse 90% 70% at 40% 55%,rgba(255,255,255,.2),rgba(60,30,5,.3) 100%)")}"></div>`;
  const binder = `<div style="${abs(34, 540, 440, 790, "transform:rotate(-5deg);background:linear-gradient(135deg,#4a6f57,#2f4a3a);border-radius:16px;box-shadow:0 4px 6px rgba(20,30,20,.4),0 28px 44px rgba(40,25,10,.45)")}"></div>
  <div style="${abs(70, 590, 150, 70, "transform:rotate(-5deg);background:#f2efe4;border-radius:6px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.12)")}"></div>`;
  const body = `
  ${floor}
  ${binder}
  <div style="${abs(48, 52, 904, 410, "transform:rotate(-1deg);background:#f7f3e8;box-shadow:0 3px 4px rgba(40,25,10,.3),0 22px 36px rgba(40,25,10,.4);border-radius:3px")}"></div>
  ${washi(76, 34, -4)}${washi(796, 40, 5, "#b9cfb4", "#cfe0ca")}
  ${sheet({ src: bookPage(6), x: 262, y: 500, w: 640, tilt: 4 })}
  ${pencil({ x: 380, y: 1296, len: 430, rot: -5, body: "#2f4a3a", band: "#c9ccd2" })}
  <div class="top" data-check="headline" data-bottom-max="470"><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(rest)}</h1><p>${esc(i.sub)}</p></div>
  <div style="${abs(0, 1354, 1000, 146, "background:#efe8d6;box-shadow:0 -8px 22px rgba(40,25,10,.3);z-index:5")}"></div>
  ${footFor(i)}`;
  const css = `
  .foot{z-index:7}
  .top{position:absolute;left:92px;right:92px;top:92px;z-index:6;transform:rotate(-1deg)}
  .top h1{font:500 86px/1.02 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:14px}
  .top p{font-size:28px;line-height:1.3;margin-top:16px;color:#4b4339}`;
  return { n: 101, id: id(101), html: page(p, { body, css, paper: "#e2c595" }) };
}

export const pins = [p23(), p25(), p29(), p33(), p51(), p101()];
