/**
 * ADHD Life Companion guide pins, world w02: inbox and laptop.
 * Drawn laptop and monitor windows (compose windows, inbox rows, a calendar window), a keyboard edge,
 * a mug, in cool blue-grey and white, with butter sticky notes and cream index cards as the only warm things.
 * Windows carry no words except the guide's own: field labels and the send button are bars and an icon.
 *
 * #22 before-after   two compose windows, one with only "Hi,", one with the real first line, and the same line on a card
 * #24 comparison     four inbox rows on a laptop, vague subject struck through, the specific one with a tick
 * #26 infographic    a chase plan on a monitor: an undated calendar window, a paper strip, four day stops
 * #30 script-card    a compose window with a taped index card and two more tabbed cards behind it
 * #39 script-card    three fanned cards clipped to an envelope, a keyboard edge below
 * #53 script-card    a phone in hand with two short bubbles, two small situation cards, a sticky note
 */
import { page, esc } from "../../v3/kit.mjs";
import { idea, footFor, p, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { binderClip } from "../kit/paper.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const rng = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const HEAD = 372;

/** The paper header block (eyebrow, headline, optional sub), the scene, the paper footer with the product line. */
function frame({ n, scene, paper, size = 72, sub = false, extraCss = "", headCss = "", top = 58 }) {
  const i = idea(n);
  const [eyebrow, rest] = i.headline.includes(": ") ? [i.headline.split(": ")[0], i.headline.split(": ").slice(1).join(": ")] : [null, i.headline];
  const css = `
  .headbar{position:absolute;left:0;right:0;top:0;height:${HEAD}px;background:${paper};box-shadow:0 8px 22px rgba(20,35,50,.3);z-index:5}
  .footbar{position:absolute;left:0;right:0;bottom:0;height:146px;background:${paper};box-shadow:0 -8px 22px rgba(20,35,50,.3);z-index:5}
  .foot{z-index:7}
  .top{position:absolute;left:64px;right:64px;top:${top}px;z-index:6}
  .top h1{font:500 ${size}px/1.04 "Newsreader",Georgia,serif;letter-spacing:-.02em;margin-top:12px;color:${C.ink};text-wrap:balance;${headCss}}
  .top p{font-size:28px;line-height:1.32;margin-top:14px;color:#42505e;max-width:860px}
  .example{font-size:24px;padding:5px 12px;background:#fff}
  ${extraCss}`;
  const body = `${scene}
  <div class="headbar"></div><div class="footbar"></div>
  <div class="top" data-check="headline" data-bottom-max="${HEAD - 8}">${eyebrow ? `<div class="eyebrow">${esc(eyebrow)}</div>` : ""}<h1>${esc(rest)}</h1>${sub && i.sub ? `<p>${esc(i.sub)}</p>` : ""}</div>
  ${footFor(i)}`;
  return { n, id: `${n}-${i.headline.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/-$/, "")}`, html: page(p, { body, css, paper }) };
}

/* ------------------------------------------------------------------ props */

/** A butter sticky note with handwritten text. */
const sticky = ({ x, y, s = 190, rot = 4, text = "", size = 46, z = 3, color = ["#f6e08f", "#efcc66"] }) =>
  `<div style="${abs(x, y, s, s, `transform:rotate(${rot}deg);background:linear-gradient(172deg,${color[0]},${color[1]});box-shadow:0 2px 3px rgba(20,35,50,.3),0 14px 18px rgba(20,35,50,.34);display:grid;place-items:center;text-align:center;padding:16px;z-index:${z}`)}" data-check="sticky"><span style="font:600 ${size}px/1.02 'Hand',cursive;color:${C.mulberryDeep}">${esc(text)}</span><span style="position:absolute;left:0;right:0;top:0;height:13%;background:rgba(255,255,255,.2)"></span></div>`;

/** A strip of translucent tape. */
const tape = ({ x, y, w = 150, rot = 0, z = 4 }) =>
  `<div style="${abs(x, y, w, 44, `transform:rotate(${rot}deg);background:rgba(214,224,233,.78);box-shadow:0 2px 4px rgba(20,35,50,.25);z-index:${z}`)}"></div>`;

/** A mug seen from above: white ceramic, a handle, dark coffee. */
function mug({ x, y, s = 160, color = "#f4f8fb", z = 3, rot = 0 }) {
  return `<svg style="${abs(x, y, s * 1.3, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(15,30,45,.38));z-index:${z}`)}" viewBox="0 0 260 200" aria-hidden="true">
    <path d="M196 62 C 246 56 250 128 196 130" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>
    <path d="M196 62 C 240 58 242 124 196 128" fill="none" stroke="#1d3347" stroke-opacity=".1" stroke-width="22" stroke-linecap="round"/>
    <ellipse cx="100" cy="100" rx="96" ry="94" fill="${color}"/><ellipse cx="100" cy="100" rx="96" ry="94" fill="none" stroke="#1d3347" stroke-opacity=".12" stroke-width="3"/>
    <ellipse cx="100" cy="100" rx="80" ry="78" fill="#dbe4ec"/><ellipse cx="100" cy="102" rx="72" ry="70" fill="#5b3d2c"/><ellipse cx="82" cy="82" rx="28" ry="20" fill="#fff" opacity=".14"/></svg>`;
}

/** The top edge of a laptop keyboard: rows of unlabelled keys on a base, cropped by whatever is drawn over it. */
function keyboard({ x, y, w = 1000, rows = 3, rot = 0, base = "#aab8c5", key = "#eef3f7", keyEdge = "#c3cfda", z = 1, kw = 66, kh = 58 }) {
  const gap = 11;
  const cols = Math.floor((w - 60) / (kw + gap));
  const h = rows * (kh + gap) + 50;
  let keys = "";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const off = r % 2 ? (kw + gap) / 2 : 0;
    if (c === cols - 1 && off) continue;
    keys += `<rect x="${30 + off + c * (kw + gap)}" y="${28 + r * (kh + gap)}" width="${kw}" height="${kh}" rx="9" fill="${key}" stroke="${keyEdge}" stroke-width="2"/>`;
  }
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><rect width="${w}" height="${h}" rx="26" fill="${base}"/><rect width="${w}" height="${h}" rx="26" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>${keys}</svg>`;
}

/** A cream index card with a rose top rule and blue lines. */
function card({ x, y, w, h, rot = 0, z = 3, tab = null, inner = "", lined = true, shadow = true }) {
  const lines = lined ? `<div style="position:absolute;left:0;right:0;top:0;height:5px;background:#e8c6d2"></div>` : "";
  const tabEl = tab ? `<div style="position:absolute;left:34px;top:-42px;height:46px;padding:0 24px;display:flex;align-items:center;background:#fbf4e6;border-radius:12px 12px 0 0;font:600 25px 'Plex',sans-serif;color:${C.mulberryDeep};white-space:nowrap;box-shadow:0 -3px 5px rgba(20,35,50,.12)">${esc(tab)}</div>` : "";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);z-index:${z}`)}">${tabEl}<div style="position:absolute;inset:0;background:#fbf4e6;border-radius:8px;${shadow ? "box-shadow:0 2px 3px rgba(20,35,50,.3),0 20px 28px rgba(15,30,45,.4),0 44px 50px -12px rgba(15,30,45,.3)" : ""};overflow:hidden">${lines}</div>${inner}</div>`;
}

/** A window: rounded white panel, a bar with three grey dots, optional right-hand content in the bar. */
function win({ x, y, w, h, rot = 0, body = "", barRight = "", dark = false, z = 2, radius = 18 }) {
  const bg = dark ? "#1d2833" : "#ffffff";
  const bar = dark ? "#2a3744" : "#e6ecf1";
  const dot = dark ? "#52657a" : "#c4cfda";
  return `<div style="${abs(x, y, w, h, `transform:rotate(${rot}deg);background:${bg};border-radius:${radius}px;box-shadow:0 3px 4px rgba(20,40,60,.2),0 26px 40px rgba(20,40,60,.3);overflow:hidden;z-index:${z}`)}">
    <div style="position:absolute;left:0;right:0;top:0;height:54px;background:${bar};display:flex;align-items:center;gap:11px;padding:0 22px">${[0, 1, 2].map(() => `<span style="width:16px;height:16px;border-radius:50%;background:${dot}"></span>`).join("")}<span style="margin-left:auto">${barRight}</span></div>
    ${body}</div>`;
}

/** Soft grey bars standing in for text that is not on the record. */
const bar = (x, y, w, h = 16, color = "#d6dee6") => `<div style="${abs(x, y, w, h, `background:${color};border-radius:${h / 2}px`)}"></div>`;

/** The send button: an icon on a blue pill, no word. */
const sendBtn = (x, y, w = 96, h = 56) => `<div style="${abs(x, y, w, h, "background:#3f6fa0;border-radius:14px;display:grid;place-items:center;box-shadow:0 3px 6px rgba(30,60,100,.3)")}">${icon("paper-plane-tilt", { size: 34, color: "#fff", weight: "fill" })}</div>`;

/** Compose window furniture: a to-row and a subject-row of bars, a toolbar of bars and the send icon. */
function composeFurniture(w, h, { sendLeft = false } = {}) {
  return `<div style="${abs(0, 54, w, 2, "background:#e3e9ee")}"></div>
    <div style="${abs(26, 78, 36, 36, "border-radius:50%;background:#c9d4de")}"></div>${bar(78, 89, 210)}${bar(300, 89, 130, 16, "#e1e8ee")}
    <div style="${abs(0, 126, w, 2, "background:#e3e9ee")}"></div>
    ${bar(26, 150, 330, 18, "#cfd9e2")}
    <div style="${abs(0, 190, w, 2, "background:#e3e9ee")}"></div>
    ${sendBtn(sendLeft ? 26 : w - 124, h - 82)}
    ${bar(sendLeft ? 150 : w - 330, h - 62, 36, 16, "#d6dee6")}${bar(sendLeft ? 200 : w - 280, h - 62, 36, 16, "#d6dee6")}${bar(sendLeft ? 250 : w - 230, h - 62, 36, 16, "#d6dee6")}`;
}

/** A quote-marked sentence on a card: mulberry open mark, the line, a mulberry close mark. */
const quoted = (text, { size = 46, lh = 52, w, top = 78, left = 38, h }) =>
  `<div style="${abs(left - 4, 6, 90, 120, "")}"><span style="font:500 150px/1 'Newsreader',Georgia,serif;color:${C.mulberry}">&ldquo;</span></div>
   <div data-check="quote" style="${abs(left, top, w, h, `font:600 ${size}px/${lh}px 'Hand',cursive;color:${C.ink}`)}">${esc(text)}<span style="color:${C.mulberry};font-weight:700">&rdquo;</span></div>`;

/** A fine cool texture over a ground. */
const ground = (css) => `<div style="${abs(0, HEAD, 1000, 1500 - HEAD, css)}"></div>`;

/** A computer mouse seen from above. */
const mouse = ({ x, y, s = 150, rot = 0, z = 3 }) =>
  `<svg style="${abs(x, y, s * 0.64, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(15,30,45,.38));z-index:${z}`)}" viewBox="0 0 96 150" aria-hidden="true"><path d="M48 3 C 84 3, 93 40, 93 86 C 93 126, 74 147, 48 147 C 22 147, 3 126, 3 86 C 3 40, 12 3, 48 3 Z" fill="#f3f7fa" stroke="#1d3347" stroke-opacity=".14" stroke-width="2"/><path d="M48 4 L48 62 M8 62 C 30 68, 66 68, 88 62" fill="none" stroke="#9fb0bf" stroke-width="2.5"/><rect x="42" y="26" width="12" height="26" rx="6" fill="#9fb0bf"/></svg>`;

/** A pot plant seen from above: a pale pot and a ring of muted green leaves. */
function plant({ x, y, s = 190, rot = 0, z = 3 }) {
  const leaves = Array.from({ length: 9 }, (_, k) => `<ellipse cx="100" cy="46" rx="21" ry="56" fill="${k % 2 ? "#6f9a88" : "#85ae9c"}" stroke="#4c7565" stroke-opacity=".5" stroke-width="2" transform="rotate(${k * 40} 100 100)"/><path d="M100 36 L100 92" stroke="#4c7565" stroke-opacity=".45" stroke-width="2.5" transform="rotate(${k * 40} 100 100)"/>`).join("");
  return `<svg style="${abs(x, y, s, s, `transform:rotate(${rot}deg);filter:drop-shadow(0 16px 12px rgba(15,30,45,.4));z-index:${z}`)}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" fill="#e9eff4" stroke="#1d3347" stroke-opacity=".15" stroke-width="3"/><circle cx="100" cy="100" r="80" fill="#4f4237"/>${leaves}<circle cx="100" cy="100" r="9" fill="#5c8472"/></svg>`;
}

/** A USB drive lying flat. */
const usb = ({ x, y, rot = 0, z = 3 }) =>
  `<svg style="${abs(x, y, 76, 190, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(15,30,45,.4));z-index:${z}`)}" viewBox="0 0 76 190" aria-hidden="true"><rect x="8" y="64" width="60" height="122" rx="16" fill="#2f4256"/><rect x="8" y="64" width="60" height="26" rx="12" fill="#43596f"/><circle cx="38" cy="162" r="9" fill="#0f1a26"/><rect x="16" y="6" width="44" height="64" rx="4" fill="#cdd6de" stroke="#8f9eab" stroke-width="2"/><rect x="26" y="16" width="8" height="14" fill="#6a7a88"/><rect x="42" y="16" width="8" height="14" fill="#6a7a88"/></svg>`;

/** A wireless earbud case, closed. */
const earbuds = ({ x, y, rot = 0, z = 3 }) =>
  `<svg style="${abs(x, y, 170, 120, `transform:rotate(${rot}deg);filter:drop-shadow(0 12px 9px rgba(15,30,45,.4));z-index:${z}`)}" viewBox="0 0 170 120" aria-hidden="true"><rect x="4" y="4" width="162" height="112" rx="52" fill="#f4f8fb" stroke="#1d3347" stroke-opacity=".14" stroke-width="2"/><path d="M12 56 C 60 66, 110 66, 158 56" fill="none" stroke="#b4c2ce" stroke-width="3"/><circle cx="85" cy="90" r="6" fill="#7fb0d6"/><rect x="72" y="52" width="26" height="8" rx="4" fill="#d3dde6"/></svg>`;

/* ------------------------------------------------------------------ #22 */
function p22() {
  const n = 22;
  const i = idea(n);
  const typed = i.items[1].replace(/^After:\s*/, "");
  const chip = (x, y, text, strong) => `<div style="position:absolute;left:${x}px;top:${y}px;z-index:4;padding:8px 26px;border-radius:999px;font:600 30px 'Plex',sans-serif;background:${strong ? C.mulberry : "#2f3d4b"};color:#fff;box-shadow:0 6px 12px rgba(20,40,60,.3)">${esc(text)}</div>`;

  const bg = ground("background:radial-gradient(120% 90% at 20% 10%,#fbfdff,#e8eef3 55%,#d3dde6)");

  // Before: only "Hi," and the cursor.
  const before = win({
    x: 44, y: 470, w: 650, h: 330, rot: -2,
    body: `${composeFurniture(650, 330)}
    <div style="${abs(34, 214, 300, 70, "font:500 54px/70px 'Plex',sans-serif;color:#1c2630")}" data-check="hi">Hi,<span style="display:inline-block;width:5px;height:54px;background:#1c2630;margin-left:8px;vertical-align:-9px"></span></div>`,
  });
  const note = sticky({ x: 610, y: 434, s: 230, rot: 6, text: "A blank draft is the whole problem", size: 40 });

  const arrow = `<svg style="${abs(0, 0, 1000, 1500, "z-index:4;filter:drop-shadow(0 4px 4px rgba(20,40,60,.25))")}" viewBox="0 0 1000 1500" aria-hidden="true">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M500 822 C 470 850, 530 876, 496 914" stroke="#fff" stroke-width="22"/><path d="M462 886 L498 926 L536 882" stroke="#fff" stroke-width="22"/>
      <path d="M500 822 C 470 850, 530 876, 496 914" stroke="${C.ink}" stroke-width="9"/><path d="M462 886 L498 926 L536 882" stroke="${C.ink}" stroke-width="9"/>
    </g></svg>`;

  // After: the real first line typed in.
  const after = win({
    x: 40, y: 944, w: 650, h: 398, rot: 1.2,
    body: `${composeFurniture(650, 398, { sendLeft: true })}
    <div style="${abs(34, 206, 580, 108, "font:500 42px/54px 'Plex',sans-serif;color:#1c2630")}" data-check="typed">${esc(typed)}<span style="display:inline-block;width:5px;height:44px;background:#1c2630;margin-left:6px;vertical-align:-8px"></span></div>`,
  });
  const lineCard = card({
    x: 640, y: 990, w: 330, h: 318, rot: 3.5, z: 5,
    inner: quoted(typed, { size: 48, lh: 52, w: 280, top: 86, left: 30, h: 216 }),
  });

  const scene = `${bg}${chip(60, 420, "Before", false)}${before}${note}${arrow}${chip(60, 892, "After", true)}${after}${tape({ x: 740, y: 972, w: 130, rot: 3, z: 6 })}${lineCard}${mug({ x: 770, y: 700, s: 140, rot: 8 })}`;
  return frame({ n, scene, paper: "#e7eef4", size: 100, sub: true, top: 84 });
}

/* ------------------------------------------------------------------ #24 */
function p24() {
  const n = 24;
  const i = idea(n);
  const rows = i.items.map((t) => t.split("  >  "));

  const bg = ground("background:radial-gradient(110% 80% at 30% 10%,#7790a6,#5a7389 55%,#455b70)");
  const LX = 34, LY = 398, LW = 932, LH = 790;
  const lid = `<div style="${abs(LX, LY, LW, LH, "background:#161d26;border-radius:34px 34px 10px 10px;box-shadow:0 30px 50px rgba(8,16,28,.5),inset 0 0 0 3px #2c3846")}"></div>
    <div style="${abs(LX + 20, LY + 20, LW - 40, LH - 40, "background:#f6f9fb;border-radius:18px 18px 4px 4px;overflow:hidden")}">
      <div style="${abs(0, 0, LW - 40, 78, "background:#e8eef3;border-bottom:2px solid #d9e2ea")}"></div>
      <div style="${abs(24, 17, 44, 44, "border-radius:50%;background:#bfcbd6")}"></div>${bar(86, 31, 250, 18, "#cdd7e0")}
      <div style="position:absolute;left:372px;top:16px" class="example">Example</div>
      ${rows.map(([vague, specific], k) => {
        const y = 78 + k * 165;
        return `<div style="${abs(0, y, LW - 40, 165, `background:${k % 2 ? "#f6f9fb" : "#fff"};border-bottom:2px solid #e0e7ee`)}"></div>
        <div style="${abs(24, y + 56, 40, 40, "border-radius:50%;background:#d3dce5")}"></div>
        <div style="${abs(82, y + 52, 190, 50, "font:500 28px/50px 'Plex',sans-serif;color:#66737f;text-decoration:line-through;text-decoration-thickness:3px;text-decoration-color:#4f5c68")}" data-check="vague">${esc(vague)}</div>
        <div style="${abs(276, y + 44, 56, 66, "display:grid;place-items:center")}">${icon("caret-right", { size: 40, color: "#8d99a5", weight: "bold" })}</div>
        <div style="${abs(338, y + 22, 490, 122, "font:600 30px/38px 'Plex',sans-serif;color:#17212b;display:flex;align-items:center")}" data-check="specific"><span>${esc(specific)}</span></div>
        <div style="${abs(836, y + 50, 52, 52, `border-radius:50%;background:${C.mulberry};display:grid;place-items:center`)}">${icon("check", { size: 32, color: "#fff", weight: "bold" })}</div>`;
      }).join("")}
    </div>`;
  // The hinge, the base edge and the keys.
  const base = `<div style="${abs(-30, LY + LH, 1060, 46, "background:linear-gradient(#e9eef2,#b5c2cd);border-radius:0 0 40px 40px;box-shadow:0 16px 24px rgba(8,16,28,.45)")}"></div>
    <div style="${abs(400, LY + LH, 200, 14, "background:#9fadba;border-radius:0 0 14px 14px")}"></div>`;
  const keys = keyboard({ x: 20, y: 1232, w: 960, rows: 2, base: "#8fa1b1", key: "#e9eff4", keyEdge: "#b6c3ce", z: 1 });
  const note = sticky({ x: 56, y: 1150, s: 176, rot: -7, text: "Say the ask", size: 50, z: 6 });
  const scene = `${bg}${keys}${lid}${base}${mouse({ x: 830, y: 1184, s: 150, rot: -8, z: 6 })}${note}`;
  return frame({ n, scene, paper: "#e9eff4", size: 68, sub: true });
}

/* ------------------------------------------------------------------ #26 */
function p26() {
  const n = 26;
  const i = idea(n);
  const stops = i.items.map((t) => {
    const k = t.indexOf(":");
    const body = t.slice(k + 1).trim();
    return { day: t.slice(0, k), text: body[0].toUpperCase() + body.slice(1) };
  });

  const wall = ground("background:linear-gradient(#edf2f6,#dde6ed 70%,#cfdae3)");
  const desk = `<div style="${abs(0, 1214, 1000, 290, "background:linear-gradient(#a9bac8,#8ea3b4);box-shadow:inset 0 10px 18px rgba(20,40,60,.25)")}"></div>`;
  const MX = 28, MY = 392, MW = 944, MH = 810;
  const SX = MX + 20, SY = MY + 20, SW = MW - 40, SH = MH - 40;
  const stand = `<div style="${abs(440, MY + MH - 4, 120, 70, "background:linear-gradient(90deg,#9aa9b6,#cfd8e0,#9aa9b6)")}"></div>`;
  const monitor = `<div style="${abs(MX, MY, MW, MH, "background:#141c26;border-radius:28px;box-shadow:0 30px 50px rgba(15,30,45,.45),inset 0 0 0 3px #2b3744")}"></div>`;

  // Calendar grid behind the strip: undated cells, no numerals.
  const cells = Array.from({ length: 7 }, (_, c) => `<div style="${abs(c * (SW / 7), 62, 1, SH - 62, "background:#2a3948")}"></div>`).join("") +
    Array.from({ length: 6 }, (_, r) => `<div style="${abs(0, 62 + r * ((SH - 62) / 5), SW, 1, "background:#2a3948")}"></div>`).join("");

  const RowH = 172;
  const R0 = 78;
  const rowsHtml = stops.map((s, k) => {
    const y = R0 + k * RowH;
    const ring = k === 1;
    return `<div style="${abs(32, y + 40, 112, 112, `border-radius:50%;background:${ring ? C.mulberry : "#fbf4e6"};display:grid;place-items:center;font:700 29px 'Plex',sans-serif;color:${ring ? "#fff" : C.ink};box-shadow:0 4px 8px rgba(0,0,0,.35);z-index:3`)}" data-check="day">${esc(s.day)}</div>
    <div style="${abs(212, y + 6, 640, 156, `transform:rotate(${[-0.8, 0.8, -0.5, 0.7][k]}deg);background:linear-gradient(172deg,#f6e08f,#efcc66);box-shadow:0 2px 3px rgba(0,0,0,.35),0 12px 16px rgba(0,0,0,.35);display:flex;align-items:center;padding:0 30px;z-index:3`)}"><div style="font:600 29px/38px 'Plex',sans-serif;color:#2c2230" data-check="note">${esc(s.text)}</div></div>
    ${ring ? `<svg style="${abs(188, y - 18, 700, 198, "z-index:4;overflow:visible")}" viewBox="0 0 700 198" aria-hidden="true"><path d="M60 22 C 220 -6, 560 -4, 668 24 C 706 56, 704 134, 650 168 C 520 204, 200 200, 56 170 C 10 148, 4 70, 52 30 C 70 14, 96 8, 128 4" fill="none" stroke="${C.mulberry}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>` : ""}`;
  }).join("");

  const screen = `<div style="${abs(SX, SY, SW, SH, "background:#1f2a36;border-radius:14px;overflow:hidden")}">
      <div style="${abs(0, 0, SW, 62, "background:#2a3744;display:flex;align-items:center;gap:11px;padding:0 24px")}">${[0, 1, 2].map(() => `<span style="width:16px;height:16px;border-radius:50%;background:#52657a"></span>`).join("")}<span class="example" style="margin-left:auto;background:transparent;color:#d3dde6">Example</span></div>
      ${cells}
      <div style="${abs(34, 62, 108, SH - 62, "background:#2a3847")}"></div>
      <div style="${abs(86, 62, 4, SH - 62, "background:#52657a")}"></div>
      ${rowsHtml}
    </div>`;

  const keys = keyboard({ x: 60, y: 1292, w: 880, rows: 2, base: "#c3cfda", key: "#f1f5f8", keyEdge: "#cdd8e1", z: 2 });
  const scene = `${wall}${desk}${stand}${monitor}${screen}${keys}${mug({ x: 800, y: 1228, s: 120, rot: 6, z: 6 })}`;
  return frame({ n, scene, paper: "#e6edf3", size: 92, sub: true });
}

/* ------------------------------------------------------------------ #30 */
function p30() {
  const n = 30;
  const i = idea(n);
  const items = i.items.map((t) => {
    const k = t.indexOf(": ");
    return { tab: t.slice(0, k), line: t.slice(k + 2) };
  });

  // A cool grey desk; the laptop is turned away in perspective and the cards stand in front of it.
  const bg = ground("background:radial-gradient(120% 70% at 30% 0%,#dfe7ee,#c3cfd9 55%,#a9b8c5);");
  const LX = 90, LY = 402, LW = 820, LH = 470;
  const lid = `<div style="${abs(0, 0, 1000, 1500, "transform-origin:500px 640px;transform:perspective(1500px) rotateY(-17deg) rotateX(3deg);z-index:2")}">
    <div style="${abs(LX, LY, LW, LH, "background:#323b46;border-radius:30px 30px 8px 8px;box-shadow:0 30px 50px rgba(20,40,60,.45),inset 0 0 0 3px #4a5663")}"></div>
    ${win({ x: LX + 20, y: LY + 20, w: LW - 40, h: LH - 40, radius: 12, body: composeFurniture(LW - 40, LH - 40), z: 2 })}
    <div style="${abs(LX - 24, LY + LH, LW + 48, 40, "background:linear-gradient(#e6ecf1,#a7b6c3);border-radius:0 0 34px 34px;box-shadow:0 14px 22px rgba(20,40,60,.4)")}"></div></div>`;

  // The cards stand in front of the base: tabs rising one above the other, the chase line on the front card.
  const CX = 66, CW = 700;
  const back2 = card({ x: CX + 26, y: 906, w: CW, h: 380, rot: 1.2, z: 3, tab: items[2].tab });
  const back1 = card({ x: CX + 12, y: 966, w: CW, h: 380, rot: -0.8, z: 4, tab: items[1].tab });
  const front = card({
    x: CX, y: 1026, w: CW, h: 340, rot: -2, z: 5, tab: items[0].tab,
    inner: quoted(items[0].line, { size: 52, lh: 58, w: CW - 80, top: 84, left: 40, h: 250 }),
  });
  const scene = `${bg}${lid}${back2}${back1}${front}${plant({ x: 790, y: 1100, s: 200, rot: 14, z: 6 })}${earbuds({ x: 800, y: 920, rot: -10, z: 6 })}`;
  return frame({ n, scene, paper: "#eaf0f5", size: 72, sub: true });
}

/* ------------------------------------------------------------------ #39 */
function p39() {
  const n = 39;
  const i = idea(n);
  const labels = ["Keep it short", "Name it plainly", "Ask where it stands"];

  const bg = ground("background:radial-gradient(120% 80% at 30% 0%,#4d6075,#3a4c5f 60%,#2d3d4e)") +
    `<div style="${abs(26, HEAD + 22, 948, 940, "border:3px dashed rgba(220,230,240,.35);border-radius:26px")}"></div>`;
  // A cool paper envelope behind the cards, only its edges and flap showing.
  const env = `<svg style="${abs(52, 416, 880, 600, "transform:rotate(1.4deg);filter:drop-shadow(0 22px 24px rgba(20,40,60,.35));z-index:2")}" viewBox="0 0 880 600" aria-hidden="true">
    <rect width="880" height="600" rx="12" fill="#e7edf2"/><path d="M0 600 L330 300 M880 600 L550 300" stroke="#9db0c0" stroke-opacity=".5" stroke-width="3"/>
    <path d="M0 0 L440 340 L880 0 Z" fill="#d6dfe7"/><path d="M0 0 L440 340 L880 0" fill="none" stroke="#9db0c0" stroke-opacity=".55" stroke-width="3"/></svg>`;

  const line = (size) => `font:600 ${size}px/${Math.round(size * 1.1)}px 'Hand',cursive;color:${C.ink}`;
  const label = (t, top) => `<div style="${abs(40, top, 520, 36, "font:600 23px 'Plex',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5f3d4b")}">${esc(t)}</div>`;

  const c1 = card({
    x: 104, y: 464, w: 790, h: 330, rot: -2, z: 6,
    inner: `${label(labels[0], 26)}
      <div style="${abs(38, 52, 90, 110, "")}"><span style="font:500 130px/1 'Newsreader',Georgia,serif;color:${C.mulberry}">&ldquo;</span></div>
      <div data-check="line1" style="${abs(52, 112, 640, 200, line(56))}">${esc(i.items[0])}<span style="color:${C.mulberry};font-weight:700">&rdquo;</span></div>`,
  });
  const c2 = card({
    x: 150, y: 772, w: 760, h: 250, rot: 2.2, z: 5,
    inner: `${label(labels[1], 56)}<div data-check="line2" style="${abs(40, 104, 680, 130, line(46))}">${esc(i.items[1])}</div>`,
  });
  const c3 = card({
    x: 78, y: 1000, w: 760, h: 250, rot: -1.6, z: 4,
    inner: `${label(labels[2], 56)}<div data-check="line3" style="${abs(40, 104, 680, 130, line(46))}">${esc(i.items[2])}</div>`,
  });
  const clip = binderClip({ x: 500, y: 430, rot: 3, size: 130 }).replace("position:absolute", "z-index:8;position:absolute");
  const note = sticky({ x: 790, y: 410, s: 190, rot: 7, text: "Change any word", size: 44, z: 9 });
  const trackpad = `<div style="${abs(250, 1272, 500, 250, "background:linear-gradient(#e3eaf0,#c9d4de);border-radius:26px;box-shadow:inset 0 0 0 3px #f4f8fb,0 10px 18px rgba(0,0,0,.4);z-index:1")}"></div>`;
  const scene = `${bg}${trackpad}${env}${c3}${c2}${c1}${clip}${note}${usb({ x: 872, y: 1150, rot: 14, z: 7 })}`;
  return frame({ n, scene, paper: "#e8edf2", size: 72, sub: true });
}

/* ------------------------------------------------------------------ #53 */
function p53() {
  const n = 53;
  const i = idea(n);
  const [sit1, sit2] = ["Someone waits on a reply", "You need more time"];

  const bg = ground("background:radial-gradient(110% 80% at 25% 10%,#46586b,#2f3e4e 60%,#222e3b)");
  // A hand holding the phone: thumb at the left, fingertips on the right edge, the palm cropped by the footer.
  const skin = "#e8c1a4", skinDark = "#cf9f80";
  const PX = 96, PY = 410, PW = 470, PH = 916;
  const bubble = (t, y, h) => `<div style="${abs(PW - 410 - 20, y, 410, h, "background:#3f6fa0;border-radius:30px 30px 8px 30px;padding:22px 26px;font:500 31px/40px 'Plex',sans-serif;color:#fff;box-shadow:0 3px 6px rgba(0,0,0,.2)")}" data-check="bubble">${esc(t)}</div>`;
  const incoming = (y) => `<div style="${abs(20, y, 60, 60, "border-radius:50%;background:#c3ced8")}"></div><div style="${abs(94, y, 220, 60, "background:#e4eaf0;border-radius:30px 30px 30px 8px")}">${bar(26, 22, 160, 16, "#c1ccd6")}</div>`;
  // Fingers wrap round the right edge (behind the phone); the thumb lies over the left bezel.
  const finger = (y, len) => `<div style="${abs(PW - 40, y, len, 74, `border-radius:37px;background:linear-gradient(${skin},#dbb092);box-shadow:inset 0 -6px 8px rgba(120,70,40,.25)`)}"></div>`;
  const hand = `
      ${finger(420, 96)}${finger(504, 104)}${finger(588, 98)}${finger(672, 82)}
      `;
  const thumb = `<div style="${abs(-50, PH - 400, 96, 290, `border-radius:56px 56px 40px 40px;background:linear-gradient(90deg,${skin},#dcb294);transform:rotate(-9deg);box-shadow:0 10px 16px rgba(0,0,0,.35),inset 0 -8px 10px rgba(120,70,40,.25);z-index:4`)}"><div style="${abs(24, 12, 46, 56, "border-radius:26px 26px 20px 20px;background:#f2d6c0;box-shadow:inset 0 0 0 3px rgba(150,100,70,.35)")}"></div></div>`;
  const phone = `<div style="${abs(PX, PY, PW, PH, "transform:rotate(-4deg);transform-origin:50% 100%;filter:drop-shadow(0 34px 44px rgba(0,0,0,.55)) drop-shadow(0 6px 8px rgba(0,0,0,.4));z-index:3")}">
      ${hand}
      <div style="position:absolute;inset:0;background:#0f141a;border-radius:70px;box-shadow:inset 0 0 0 2px #35404c,inset 0 0 0 5px #070a0d"></div>
      <div style="${abs(15, 15, PW - 30, PH - 30, "border-radius:56px;overflow:hidden;background:#f6f9fb")}">
        <div style="position:absolute;left:50%;top:14px;width:118px;height:32px;margin-left:-59px;border-radius:20px;background:#0b0a0d;z-index:2"></div>
        <div style="${abs(0, 0, PW - 30, 150, "background:#e8eef3;border-bottom:2px solid #d5dee6")}">
          <div style="${abs(24, 82, 44, 44, "display:grid;place-items:center")}">${icon("caret-left", { size: 38, color: "#3f6fa0", weight: "bold" })}</div>
          <div style="${abs(78, 78, 54, 54, "border-radius:50%;background:#bcc9d5")}"></div>${bar(148, 98, 170, 18, "#c4cfd9")}
        </div>
        <div style="position:absolute;left:0;top:176px;width:${PW - 30}px">
          ${incoming(0)}
          <div style="${abs(0, 96, PW - 30, 230, "")}">${bubble(i.items[0], 0, 214)}</div>
          <div style="${abs(0, 346, PW - 30, 230, "")}">${bubble(i.items[1], 0, 214)}</div>
        </div>
        <div style="${abs(24, PH - 30 - 112, PW - 78, 62, "background:#e8eef3;border-radius:31px")}">${bar(28, 23, 190, 16, "#c4cfd9")}</div>
      </div>
      ${thumb}
    </div>`;

  // Right column: two small situation cards, the sticky, the sub as a note, a keyboard corner and a mug.
  const sit = (y, text, rot) => card({ x: 616, y, w: 340, h: 118, rot, z: 5, inner: `<div style="${abs(26, 22, 290, 80, "display:flex;align-items:center;font:600 31px/36px 'Plex',sans-serif;color:#5f3d4b")}" data-check="sit">${esc(text)}</div>` });
  const subCard = `<div style="${abs(610, 1086, 350, 200, "font:500 27px/35px 'Plex',sans-serif;color:#e3ebf2;z-index:5")}" data-check="sub">${esc(i.sub)}</div>`;
  const note = sticky({ x: 640, y: 424, s: 226, rot: 5, text: "a date, not an essay", size: 52, z: 6 });
    const scene = `${bg}${phone}${sit(706, sit1, -2)}${sit(936, sit2, 1.6)}${note}${subCard}${earbuds({ x: 830, y: 450, rot: 14, z: 2 })}`;
  return frame({ n, scene, paper: "#e6edf3", size: 66, top: 70 });
}

export const pins = [p22(), p24(), p26(), p30(), p39(), p53()];
