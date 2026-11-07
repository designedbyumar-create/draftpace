/**
 * Batch 4, module B: five guide pins about the evaluation folder and the
 * portfolio samples (guides: preparing-for-a-homeschool-evaluation and
 * what-goes-in-a-homeschool-portfolio). Every word is the idea bank's own;
 * each scene reads its words from the bank and throws if the record is not
 * the one it was drawn for.
 *
 *   #47  question      a wooden recipe box on a birch counter against a dusty-teal wall: one index card standing
 *                      tall out of the box, a work-sample page taped up beside it with a clipped hand-written note
 *   #53  checklist     a green leather desk blotter on dark walnut: the six-line list slid into a kraft folder, plum ticks
 *   #98  quote-card    a navy bookcase: the ruled page propped on a shelf, pencil underline, a manila folder corner
 *   #41  comparison    a grey-washed pallet-wood board: a September page and a May page clipped side by side
 *   #99  comparison    a divided kraft box on denim: one glossy page alone, two plain dated pages together
 *
 * None of the five names a state, so none carries the state caution line.
 * The three `example-tag` pins (#47, #98, #41) carry a small "Example" tag.
 * No British spelling turned up in these five records.
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { idea } from "../kit/bank.mjs";
import { binderClip, pencil } from "../kit/paper.mjs";
import { esc } from "../../v3/kit.mjs";

const at = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;${w == null ? "" : `width:${w}px;`}${h == null ? "" : `height:${h}px;`}${extra}`;
const SHADOW = "0 2px 3px rgba(20,15,10,.28),0 16px 28px rgba(20,15,10,.38)";
const EXAMPLE_CSS = `.example{font-size:24px;color:#4b4339;background:#fffdf6;padding:7px 14px;box-shadow:0 2px 4px rgba(0,0,0,.22);letter-spacing:.12em}`;
const exampleTag = (x, y, rot = -3) => `<span class="example" style="position:absolute;left:${x}px;top:${y}px;transform:rotate(${rot}deg);z-index:9">Example</span>`;
const lead = (s) => [s.split(": ")[0], s.split(": ").slice(1).join(": ")];

/** A strip of washi tape. */
function tape(x, y, w, rot, color = "rgba(214,186,128,.84)", stripe = "rgba(255,255,255,.35)") {
  return `<div style="${at(x, y, w, 44, `transform:rotate(${rot}deg);background:repeating-linear-gradient(90deg,${color} 0 14px,${stripe} 14px 22px);box-shadow:0 3px 5px rgba(20,15,10,.25);opacity:.95;z-index:6`)}"></div>`;
}

/** Pretend handwriting (no words): rows of a soft zigzag, as ink-coloured paths. */
function scrib({ w, rows, gap, amp = 7, color = "#4a5878", seed = 1, sw = 3, width = 0.9 }) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const paths = [];
  for (let r = 0; r < rows; r++) {
    const len = w * (r === rows - 1 ? 0.5 : width - rnd() * 0.12);
    let d = `M0 ${(r * gap).toFixed(1)}`;
    for (let x = 0; x < len; x += 16) d += ` q 4 ${(-amp - rnd() * amp).toFixed(1)} 8 0 t 8 ${((rnd() - 0.5) * 3).toFixed(1)}`;
    paths.push(`<path d="${d}" transform="translate(0 ${amp * 2})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" opacity=".78"/>`);
  }
  return `<svg width="${w}" height="${rows * gap + amp * 4}" viewBox="0 0 ${w} ${rows * gap + amp * 4}" style="display:block;overflow:visible" aria-hidden="true">${paths.join("")}</svg>`;
}

const tick = (color = "#6b3f78") => `<svg width="52" height="52" viewBox="0 0 52 52" style="position:absolute;left:2px;top:-8px" aria-hidden="true"><path d="M7 28 Q 14 34 19 44 Q 28 18 48 4" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ============================================================ #47 question */

function question() {
  const n = 47;
  const i = idea(n);
  if (i.items.length !== 2 || !i.items[0].startsWith("Math: struggled with fractions")) throw new Error("#47: the bank's items are not the note and the credibility line");
  const [note, line] = i.items;

  // The wall: dusty teal with a slanted patch of window light, and a birch counter below.
  const wall = `<div style="${at(0, SCENE_TOP, 1000, 640, "background:linear-gradient(180deg,#86a9aa,#6b9093)")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 640, "background:linear-gradient(115deg,transparent 0 38%,rgba(255,255,255,.17) 38% 62%,transparent 62%)")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 640, "background:radial-gradient(ellipse at 22% 10%,rgba(255,255,255,.14),rgba(10,40,45,.3))")}"></div>`;
  const counter = `<div style="${at(0, 1012, 1000, 488, "background:repeating-linear-gradient(0deg,rgba(120,80,30,.07) 0 2px,transparent 2px 9px),linear-gradient(180deg,#e6cda1,#d3b183)")}"></div>
    <div style="${at(0, 1004, 1000, 14, "background:linear-gradient(#5d4a2c,#9d8458);opacity:.55")}"></div>
    <div style="${at(0, 1018, 1000, 120, "background:linear-gradient(rgba(60,40,10,.3),transparent)")}"></div>`;

  // The work-sample page taped up, with a note clipped over it.
  const page = `<div style="${at(596, 410, 340, 470, "transform:rotate(2.6deg);z-index:3")}">
      <div style="${at(0, 0, 340, 470, `background:repeating-linear-gradient(180deg,transparent 0 37px,rgba(80,115,170,.3) 37px 39px),#fffdf5;box-shadow:${SHADOW}`)}"></div>
      <div style="${at(0, 0, 3, 470, "left:44px;background:rgba(200,80,80,.45)")}"></div>
      <div style="${at(60, 54, 250, 200)}">${scrib({ w: 250, rows: 5, gap: 38, seed: 4 })}</div>
      <div style="${at(60, 300, 250, 120)}">${scrib({ w: 250, rows: 3, gap: 38, seed: 9 })}</div>
    </div>
    ${tape(716, 392, 120, -4, "rgba(138,161,130,.88)")}`;
  const noteEl = `<div style="${at(618, 540, 312, 296, "transform:rotate(-2.4deg);z-index:5")}">
      <div style="${at(0, 0, 312, 296, `background:linear-gradient(160deg,#fffae4,#f6eab8);box-shadow:${SHADOW}`)}"></div>
      <div data-check="note" class="hand" style="${at(22, 44, 272, 240, "font-size:46px;line-height:1.02;font-weight:700;color:#2c2e5a;overflow:hidden")}">${esc(note)}</div>
    </div>
    ${binderClip({ x: 720, y: 498, rot: 4, size: 96 }).replace("position:absolute", "position:absolute;z-index:6")}`;

  // Dividers peeking behind the front card.
  const divider = (x, y, tab, c, rot) => `<div style="${at(x, y, 190, 300, `z-index:4;transform:rotate(${rot}deg);background:linear-gradient(#f6f0e2,#e9e0cc);box-shadow:0 8px 14px rgba(40,25,5,.3);border-radius:3px`)}"><div style="${at(24 + tab * 60, -26, 64, 36, `background:${c};border-radius:6px 6px 0 0;box-shadow:0 -2px 4px rgba(40,25,5,.2)`)}"></div></div>`;
  const dividers = `${divider(612, 936, 0, "#8aa182", -2)}${divider(686, 930, 1, "#e0a95a", 2)}${divider(752, 940, 2, "#b9a0cc", 1)}`;

  // The standing card: a ruled index card with a plum header line.
  const card = `<div style="${at(64, 428, 520, 700, "transform:rotate(-1.6deg);z-index:4")}">
      <div style="${at(0, 0, 520, 700, `background:repeating-linear-gradient(180deg,transparent 0 71px,rgba(80,115,170,.26) 71px 73px),#fffdf3;box-shadow:${SHADOW};border-radius:6px`)}"></div>
      <div style="${at(0, 52, 520, 4, "background:#b3524a;opacity:.75")}"></div>
      <div data-check="line" class="serif" style="${at(38, 74, 450, 480, "font-size:43px;line-height:73px;font-weight:500;color:#1f1d26;overflow:hidden;padding-top:0")}">${esc(line)}</div>
    </div>`;

  // The recipe box: a wooden front with a brass label plate and corner pieces.
  const planks = Array.from({ length: 11 }, (_, k) => `<div style="${at(k * 80, 0, 2, 270, "background:rgba(60,35,10,.28)")}"></div>`).join("");
  const box = `<div style="${at(46, 1066, 908, 268, "z-index:7;filter:drop-shadow(0 22px 16px rgba(40,25,5,.5))")}">
      <div style="${at(0, 0, 908, 268, "background:linear-gradient(180deg,#c99a63,#a97b44);border-radius:12px;overflow:hidden")}">${planks}
        <div style="${at(0, 0, 908, 26, "background:linear-gradient(#e4b983,#c8975c);box-shadow:0 3px 4px rgba(60,35,10,.35)")}"></div>
        <div style="${at(0, 26, 908, 244, "background:radial-gradient(ellipse at 24% 8%,rgba(255,255,255,.2),rgba(60,30,5,.22))")}"></div></div>
      <div style="${at(344, 92, 220, 108, "background:linear-gradient(#e6c778,#b8913f 60%,#d9b765);border-radius:10px;box-shadow:0 5px 8px rgba(40,25,5,.5),inset 0 2px 2px rgba(255,255,255,.6)")}">
        <div style="${at(16, 14, 188, 80, "background:#fbf6e6;border-radius:4px;box-shadow:inset 0 2px 4px rgba(0,0,0,.25)")}"></div></div>
      ${[[18, 118], [868, 118]].map(([x, y]) => `<div style="${at(x, y, 22, 22, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f2dc9a,#a98530);box-shadow:0 2px 3px rgba(40,25,5,.5)")}"></div>`).join("")}
    </div>`;
  const scene = `${wall}${counter}${dividers}${page}${noteEl}${card}${box}${exampleTag(640, 846, 3)}`;
  return printable({ n, paper: "#eef0ea", extraCss: EXAMPLE_CSS, scene });
}

/* ============================================================ #53 checklist */

function checklist() {
  const n = 53;
  const i = idea(n);
  if (i.items.length !== 6 || !i.items[0].startsWith("The log of what was covered")) throw new Error("#53: the bank's items are not the six folder lines");

  const walnut = `<div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:repeating-linear-gradient(90deg,rgba(0,0,0,.1) 0 2px,transparent 2px 7px),linear-gradient(180deg,#5b3d28,#4a301f)")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 24% 10%,rgba(255,235,200,.16),rgba(10,5,0,.45))")}"></div>`;
  // The leather blotter with brass-edged corner pieces.
  const corner = (x, y, flipX, flipY) => `<svg style="${at(x, y, 120, 120, `transform:scale(${flipX ? -1 : 1},${flipY ? -1 : 1})`)}" viewBox="0 0 120 120" aria-hidden="true"><path d="M0 0 H120 L0 120 Z" fill="#c9a24d"/><path d="M0 0 H104 L0 104 Z" fill="#e0bf6c"/><path d="M0 0 H120" stroke="#8a6a25" stroke-width="3"/></svg>`;
  const blotter = `<div style="${at(36, 398, 928, 940, "background:linear-gradient(135deg,#3d6b57,#2f574a);border-radius:10px;box-shadow:0 4px 5px rgba(0,0,0,.4),0 30px 50px rgba(0,0,0,.5)")}"></div>
    <div style="${at(52, 414, 896, 908, "border:2px solid rgba(255,255,255,.14);border-radius:6px")}"></div>
    ${corner(36, 398, false, false)}${corner(844, 398, true, false)}${corner(36, 1218, false, true)}${corner(844, 1218, true, true)}`;

  // The kraft folder, back panel with a tab; the page slides into it; the front panel covers the page's foot.
  const folderBack = `<div style="${at(66, 1070, 868, 270, "background:linear-gradient(160deg,#d3b183,#bf9a68);border-radius:10px 10px 0 0;box-shadow:0 18px 30px rgba(0,0,0,.45)")}"></div>
    <div style="${at(800, 1030, 134, 52, "background:linear-gradient(160deg,#d6b688,#c4a06f);border-radius:12px 12px 0 0;box-shadow:0 -2px 4px rgba(0,0,0,.2)")}"></div>`;
  const paperTop = 424;
  const rows = i.items.map((t) => `<div style="display:flex;gap:22px;align-items:flex-start"><span style="flex:none;position:relative;margin-top:5px;width:40px;height:40px;border:3.5px solid #4a3a55;border-radius:7px;background:#fffdf8">${tick()}</span><span data-check="item" style="font:500 31px/1.28 'Plex',sans-serif;color:#26232b">${esc(t)}</span></div>`).join("");
  const paper = `<div style="${at(96, paperTop, 696, 800, "transform:rotate(-.9deg)")}">
      <div style="${at(0, 0, 696, 800, `background:repeating-linear-gradient(180deg,transparent 0 43px,rgba(80,115,170,.2) 43px 45px),#fffdf3;box-shadow:0 3px 5px rgba(0,0,0,.35),0 20px 36px rgba(0,0,0,.4)`)}"></div>
      <div style="${at(52, 0, 3, 800, "background:rgba(200,80,80,.4)")}"></div>
      <div style="${at(80, 36, 592, 700, "display:flex;flex-direction:column;gap:26px")}">${rows}</div>
    </div>`;
  const folderFront = `<div style="${at(56, 1130, 888, 212, "background:linear-gradient(170deg,#dbbb8c,#c7a272);border-radius:10px 10px 0 0;box-shadow:0 -6px 12px rgba(0,0,0,.3),0 22px 30px rgba(0,0,0,.4)")}"></div>
    <div style="${at(56, 1130, 888, 10, "background:rgba(255,255,255,.28);border-radius:10px 10px 0 0")}"></div>`;
  const pen = pencil({ x: 380, y: 1250, len: 460, rot: -7, body: "#7a4b8a", band: "#c3c3c9", tip: "#e9c9a0" });
  const scene = `${walnut}${blotter}${folderBack}${paper}${folderFront}${pen}`;
  return printable({ n, paper: "#efe9dd", scene });
}

/* ============================================================ #98 quote card */

function quoteCard() {
  const n = 98;
  const i = idea(n);
  const text = i.items[0];
  const key = "difficult until January";
  if (!text.includes(key)) throw new Error("#98: the quote no longer holds 'difficult until January'");
  const [before, after] = text.split(key);

  // A bookcase: navy back panel, a shelf board of standing books above, a lower shelf under the page.
  let s = 5;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const cols = ["#b4573a", "#d8a24a", "#7f9a7c", "#8a5f8f", "#e9dec4", "#3f7f8d", "#c9794f", "#5c6c9a"];
  let x = 24;
  const books = [];
  while (x < 940) {
    const w = 38 + Math.floor(rnd() * 34);
    const h = 128 + Math.floor(rnd() * 44);
    const c = cols[Math.floor(rnd() * cols.length)];
    books.push(`<rect x="${x}" y="${176 - h}" width="${w}" height="${h}" rx="3" fill="${c}"/><rect x="${x}" y="${176 - h}" width="${w}" height="8" fill="#fff" opacity=".2"/><rect x="${x + 5}" y="${176 - h + 28}" width="${w - 10}" height="5" fill="#fff" opacity=".4"/><rect x="${x + 5}" y="${176 - h + 40}" width="${w - 10}" height="5" fill="#fff" opacity=".28"/>`);
    x += w + 2 + (rnd() < 0.14 ? 26 : 0);
  }
  const back = `<div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:linear-gradient(180deg,#2e4260,#27384f)")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 24% 18%,rgba(255,255,255,.12),rgba(5,10,25,.45))")}"></div>`;
  const upperBooks = `<svg style="${at(0, 394, 1000, 180)}" viewBox="0 0 1000 180" aria-hidden="true">${books.join("")}</svg>`;
  const board = (y) => `<div style="${at(0, y, 1000, 46, "background:linear-gradient(180deg,#b88a58,#8d6338);box-shadow:0 12px 18px rgba(0,0,0,.5)")}"></div><div style="${at(0, y, 1000, 8, "background:rgba(255,255,255,.28)")}"></div>`;

  const lineH = 70;
  const underline = `url(data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='14' viewBox='0 0 120 14'><path d='M0 8 Q 15 3 30 8 T 60 7 T 90 9 T 120 6' fill='none' stroke='#4d4b58' stroke-width='3.4' stroke-linecap='round' opacity='.85'/></svg>`).replace(/'/g, "%27")})`;
  const page = `<div style="${at(80, 636, 840, 598, "transform:rotate(-1.1deg);z-index:3")}">
      <div style="${at(0, 0, 840, 598, `background:repeating-linear-gradient(180deg,transparent 0 ${lineH - 2}px,rgba(80,115,170,.28) ${lineH - 2}px ${lineH}px),#fbf5e6;box-shadow:${SHADOW}`)}"></div>
      <div style="${at(58, 0, 3, 598, "background:rgba(200,80,80,.4)")}"></div>
      <div data-check="quote" class="serif" style="${at(96, 22, 700, 560, `font-size:54px;line-height:${lineH}px;font-weight:500;color:#1f1d26;overflow:hidden`)}"><span style="font-size:96px;line-height:0;vertical-align:-28px;color:#b3524a;margin-right:6px">&ldquo;</span>${esc(before)}<span style="background:${underline} repeat-x left bottom/120px 14px;padding-bottom:10px;-webkit-box-decoration-break:clone;box-decoration-break:clone">${esc(key)}</span>${esc(after)}</div>
    </div>
    ${tape(396, 606, 160, -2, "rgba(214,186,128,.88)")}`;

  // A manila folder corner lying on the lower shelf, in front of the page's foot.
  const folder = `<div style="${at(560, 1196, 440, 170, "transform:rotate(-3deg);z-index:5")}">
      <div style="${at(0, 0, 440, 170, `background:linear-gradient(160deg,#eed9a3,#e2c682);border-radius:10px 0 0 0;box-shadow:${SHADOW}`)}"></div>
      <div style="${at(46, -30, 200, 40, "background:linear-gradient(160deg,#f0dca6,#e3c883);border-radius:12px 12px 0 0;box-shadow:0 -2px 4px rgba(0,0,0,.18)")}"></div></div>`;
  const scene = `${back}${upperBooks}${board(570)}${page}${board(1236)}${folder}${exampleTag(104, 590, -4)}`;
  return printable({ n, paper: "#efe8d8", extraCss: EXAMPLE_CSS, scene });
}

/* ============================================================ #41 comparison */

function palletBoard() {
  const n = 41;
  const i = idea(n);
  if (i.items.length !== 2 || !i.items[0].startsWith("A September math page")) throw new Error("#41: the bank's items are not the two comparison lines");
  const [one, two] = i.items;

  // Grey-washed pallet planks with nail heads.
  let s = 17;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const H = 1500 - SCENE_TOP;
  const plankH = 96;
  const tones = ["#b9b3a6", "#aaa496", "#c2bcaf", "#b1ab9d", "#a29c8f"];
  const planks = [];
  for (let k = 0; k * plankH < H; k++) {
    const y = k * plankH;
    planks.push(`<rect x="0" y="${y + 3}" width="1000" height="${plankH - 6}" fill="${tones[k % tones.length]}"/>`);
    for (let g = 0; g < 7; g++) {
      const gy = y + 10 + rnd() * (plankH - 24);
      planks.push(`<path d="M${rnd() * 300} ${gy} C ${300 + rnd() * 200} ${gy + (rnd() - 0.5) * 8}, ${600 + rnd() * 200} ${gy + (rnd() - 0.5) * 8}, 1000 ${gy + (rnd() - 0.5) * 6}" fill="none" stroke="#6d675a" stroke-opacity="${(0.15 + rnd() * 0.18).toFixed(2)}" stroke-width="${(1 + rnd() * 1.8).toFixed(1)}"/>`);
    }
    for (const nx of [26, 974]) planks.push(`<circle cx="${nx}" cy="${y + plankH / 2}" r="6" fill="#5c564b"/><circle cx="${nx - 1.5}" cy="${y + plankH / 2 - 1.5}" r="2" fill="#aaa"/>`);
  }
  const board = `<svg style="${at(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><rect width="1000" height="${H}" fill="#3b372f"/>${planks.join("")}</svg>
    <div style="${at(0, SCENE_TOP, 1000, H, "background:radial-gradient(ellipse at 24% 12%,rgba(255,255,255,.22),rgba(30,25,15,.4))")}"></div>`;

  const ruled = "repeating-linear-gradient(180deg,transparent 0 41px,rgba(80,115,170,.3) 41px 43px)";
  const sheetEl = (x, y, rot, label, seed, tidy) => `<div style="${at(x, y, 400, 540, `transform:rotate(${rot}deg);z-index:3`)}">
      <div style="${at(0, 0, 400, 540, `background:${ruled},#fffdf5;box-shadow:${SHADOW}`)}"></div>
      <div style="${at(48, 0, 3, 540, "background:rgba(200,80,80,.4)")}"></div>
      <div data-check="label" class="hand" style="${at(72, 36, 280, 64, "font-size:58px;line-height:1;font-weight:700;color:#2c2e5a")}">${esc(label)}</div>
      <div style="${at(72, 128, 290, 340)}">${scrib({ w: 290, rows: 5, gap: 84, amp: tidy ? 4 : 11, seed, sw: 3.2 })}</div>
    </div>`;
  const pages = `${sheetEl(62, 420, -2.6, "September", 3, false)}${sheetEl(540, 440, 2, "May", 8, true)}
    ${binderClip({ x: 340, y: 392, rot: -3, size: 104 }).replace("position:absolute", "position:absolute;z-index:6")}
    ${binderClip({ x: 822, y: 412, rot: 3, size: 104 }).replace("position:absolute", "position:absolute;z-index:6")}`;

  const strip = `<div style="${at(84, 1002, 832, 118, "transform:rotate(-.6deg);z-index:4")}">
      <div style="${at(0, 0, 832, 118, `background:linear-gradient(160deg,#fbf6e6,#efe5cb);box-shadow:${SHADOW}`)}"></div>
      <div data-check="line one" style="${at(104, 0, 624, 118, "display:flex;align-items:center;font:600 31px/1.25 'Plex',sans-serif;color:#2a2620")}">${esc(one)}</div></div>
    ${tape(56, 1030, 100, -90, "rgba(138,161,130,.88)")}${tape(776, 1030, 100, 90, "rgba(138,161,130,.88)")}`;

  // A thick stack of worksheets, crossed through in marker; the bank's words beside it.
  const edge = "repeating-linear-gradient(180deg,#f4efe2 0 3px,#cfc8b6 3px 4px)";
  const stack = `<div style="${at(84, 1150, 330, 180, "z-index:3;filter:drop-shadow(0 12px 10px rgba(0,0,0,.45))")}">
      <div style="${at(0, 74, 330, 100, `background:${edge};border-radius:2px;box-shadow:inset 0 -6px 8px rgba(80,60,30,.25)`)}"></div>
      <div style="${at(0, 0, 330, 82, `background:${ruled},#fbf8ee;border-radius:2px;transform:skewX(-6deg) translateX(10px)`)}"></div>
      <div style="${at(40, 18, 200, 8, "background:#9aa4b3;border-radius:5px;opacity:.7")}"></div>
    </div>
    <svg style="${at(66, 1128, 366, 210, "z-index:4")}" viewBox="0 0 366 210" aria-hidden="true"><path d="M16 18 L350 192 M350 14 L22 196" stroke="#b3322a" stroke-width="12" stroke-linecap="round" opacity=".88"/></svg>`;
  const slip = `<div style="${at(470, 1158, 450, 160, "transform:rotate(1.4deg);z-index:4")}">
      <div style="${at(0, 0, 450, 160, `background:linear-gradient(160deg,#d3b183,#c4a06f);box-shadow:${SHADOW}`)}"></div>
      <div data-check="line two" style="${at(30, 0, 400, 160, "display:flex;align-items:center;font:600 33px/1.25 'Plex',sans-serif;color:#2a2013")}">${esc(two)}</div></div>`;
  const scene = `${board}${pages}${strip}${stack}${slip}${exampleTag(380, 936, -3)}`;
  return printable({ n, paper: "#ece9e1", extraCss: EXAMPLE_CSS, scene });
}

/* ============================================================ #99 comparison */

function dividedBox() {
  const n = 99;
  const i = idea(n);
  if (i.items.length !== 2 || !i.items[0].startsWith("A highlight reel:")) throw new Error("#99: the bank's items are not the highlight reel and October/March lines");
  const [hLead, hText] = lead(i.items[0]);
  const [oLead, oText] = lead(i.items[1]);

  const denim = `<div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 2px,transparent 2px 6px),repeating-linear-gradient(90deg,rgba(0,0,20,.1) 0 2px,transparent 2px 6px),#3a5878")}"></div>
    <div style="${at(0, SCENE_TOP, 1000, 1500 - SCENE_TOP, "background:radial-gradient(ellipse at 24% 12%,rgba(255,255,255,.2),rgba(5,15,35,.45))")}"></div>`;
  // The kraft box seen from above: walls, an inner floor, a divider.
  const box = `<div style="${at(40, 396, 920, 940, "background:linear-gradient(150deg,#d6b688,#bf9a68);border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,.35),0 30px 50px rgba(0,0,0,.5)")}"></div>
    <div style="${at(66, 422, 868, 888, "background:linear-gradient(160deg,#a47f50,#94704270);border-radius:4px;box-shadow:inset 0 8px 14px rgba(40,25,5,.5),inset 0 -2px 3px rgba(255,255,255,.12)")}"></div>
    <div style="${at(370, 422, 24, 888, "background:linear-gradient(90deg,#d9bb8d,#c4a06f);box-shadow:4px 0 8px rgba(40,25,5,.4),-3px 0 6px rgba(40,25,5,.3)")}"></div>`;

  const ruled = "repeating-linear-gradient(180deg,transparent 0 33px,rgba(80,115,170,.3) 33px 35px)";
  const holes = (h) => [0.18, 0.5, 0.82].map((f) => `<div style="${at(12, h * f - 8, 16, 16, "border-radius:50%;background:#7e6540;box-shadow:inset 0 2px 3px rgba(0,0,0,.5)")}"></div>`).join("");
  // The one glossy finished page, alone: neat blocks, a border, a gold star, a sheen.
  const glossy = `<div style="${at(98, 462, 250, 400, "transform:rotate(-2deg);z-index:3")}">
      <div style="${at(0, 0, 250, 400, `background:linear-gradient(160deg,#ffffff,#f1ede2);box-shadow:${SHADOW}`)}"></div>
      <div style="${at(14, 14, 222, 372, "border:4px solid #3f7f8d;border-radius:4px")}"></div>
      <div style="${at(40, 40, 170, 60, "background:#d8a24a;border-radius:4px;opacity:.9")}"></div>
      <div style="${at(40, 124, 170, 12, "background:#9aa4b3;border-radius:6px")}"></div><div style="${at(40, 150, 170, 12, "background:#9aa4b3;border-radius:6px")}"></div><div style="${at(40, 176, 120, 12, "background:#9aa4b3;border-radius:6px")}"></div>
      <div style="${at(40, 222, 170, 100, "background:linear-gradient(135deg,#7f9a7c,#3f7f8d);border-radius:4px")}"></div>
      <svg style="${at(150, 320, 84, 80, "transform:rotate(12deg)")}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" fill="#e8b93c" stroke="#b9891c" stroke-width="1"/></svg>
      <div style="${at(0, 0, 250, 400, "background:linear-gradient(115deg,transparent 30%,rgba(255,255,255,.7) 42%,transparent 54%);mix-blend-mode:soft-light")}"></div>
    </div>`;
  // Two plain dated pages of the same kind of problem, punched on the left edge.
  const plain = (x, y, rot, label, seed) => `<div style="${at(x, y, 232, 400, `transform:rotate(${rot}deg);z-index:3`)}">
      <div style="${at(0, 0, 232, 400, `background:${ruled},#fffdf5;box-shadow:${SHADOW}`)}"></div>${holes(400)}
      <div data-check="label" class="hand" style="${at(44, 22, 170, 52, "font-size:46px;line-height:1;font-weight:700;color:#2c2e5a")}">${esc(label)}</div>
      <div style="${at(44, 92, 170, 280)}">${scrib({ w: 170, rows: 5, gap: 62, amp: 8, seed, sw: 3 })}</div></div>`;
  const pages = `${plain(412, 466, -2.4, "October", 6)}${plain(666, 458, 1.8, "March", 12)}`;

  const card = (x, y, w, rot, head, body, key, fs = 29) => `<div style="${at(x, y, w, 372, `transform:rotate(${rot}deg);z-index:5`)}">
      <div style="${at(0, 0, w, 372, `background:linear-gradient(#fffdf3,#f6f0df);box-shadow:${SHADOW};border-radius:5px`)}"></div>
      <div style="${at(0, 0, w, 10, "background:#6b3f78;border-radius:5px 5px 0 0")}"></div>
      <div data-check="${key}" style="${at(24, 26, w - 48, 328, `overflow:hidden;font:500 ${fs}px/1.3 'Plex',sans-serif;color:#26232b`)}"><div style="font:700 25px/1.2 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#6b3f78;margin-bottom:10px">${esc(head)}</div>${esc(body)}</div></div>`;
  const cards = `${card(88, 912, 306, -1.4, hLead, hText, "highlight reel", 29)}${card(430, 912, 484, 1.2, oLead, oText, "october and march", 36)}`;
  const scene = `${denim}${box}${glossy}${pages}${cards}`;
  return printable({ n, paper: "#efe7d6", extraCss: ".top h1{font-size:62px}", scene });
}

export const pins = [question(), checklist(), quoteCard(), palletBoard(), dividedBox()];
