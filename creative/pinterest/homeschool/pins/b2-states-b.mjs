/**
 * Batch 2, state guide pins, second set. Three different designs, each told
 * from the product's own state data (src/lib/homeschoolStateRequirements.ts)
 * and the printed record's tick labels (book.ts):
 *
 *   85  Ohio        a boarding-pass ticket and two torn stubs on slate linen:
 *                   "test or portfolio review", side by side, joined by "or"
 *   87  California  a postcard (the note, in quotation marks) and a luggage
 *                   tag (the checklist) on terracotta gingham
 *   89  Florida/Alaska  two physical halves on green felt: a thick stack of
 *                   paper for Florida at High, one single sheet for Alaska at None
 *
 * Every word is the bank's. Level colours follow the tile map (None cream,
 * Moderate mid plum, High deep plum).
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";
import { idea, C } from "../kit/bank.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const CAUTION = "Laws change. Confirm with your state before relying on this.";
const LABEL = {
  log: "A log or record of instruction",
  attendance: "Attendance or hours",
  samples: "Samples of work or a portfolio",
  test: "A test score or evaluation",
};
const tick = (size, color) => icon("check", { size, color, weight: "bold" });
/** A checkbox, ticked or empty. */
const box = (on, size = 40, ink = "#1d1d20", fill = "#2f6b3b") =>
  `<span style="display:inline-grid;place-items:center;flex:none;width:${size}px;height:${size}px;border-radius:${Math.round(size * 0.2)}px;border:3px solid ${on ? fill : ink};background:${on ? fill : "transparent"}">${on ? tick(size - 10, "#fff") : ""}</span>`;
/** Cut-out circles (ticket notches) via a mask, one layer per notch. */
const notchMask = (notches, r = 18) => {
  const layers = notches.map(([x, y]) => `radial-gradient(circle ${r}px at ${x} ${y}, #0000 98%, #000)`).join(",");
  return `-webkit-mask:${layers};-webkit-mask-composite:source-in;mask:${layers};mask-composite:intersect`;
};

/* ------------------------------------------------------------------ 85 Ohio */

function ohio() {
  const i = idea(85);
  const note = "Notice; annual academic assessment by test or portfolio review";
  if (!i.items.includes(note)) throw new Error("Ohio note changed");
  const linen = `background-color:#4b6178;background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.07) 0 1px,transparent 1px 5px),repeating-linear-gradient(90deg,rgba(0,0,0,.09) 0 1px,transparent 1px 5px),radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.14),rgba(10,20,35,.38) 100%)`;
  const stub = (x, rot, label, id) => `
    <div style="position:absolute;left:${x}px;top:712px;width:410px;height:290px;transform:rotate(${rot}deg);filter:drop-shadow(0 3px 3px rgba(10,20,35,.35)) drop-shadow(0 18px 18px rgba(10,20,35,.4))">
      <div style="position:absolute;inset:0;background:#fbf6ea;${notchMask([["0", "58%"], ["100%", "58%"]], 20)};border-radius:6px"></div>
      <div style="position:absolute;left:0;right:0;top:0;height:20px;background:${C.plumDeep};border-radius:6px 6px 0 0"></div>
      <div style="position:absolute;left:34px;right:34px;top:54px;display:flex;flex-direction:column;gap:22px">
        <div style="width:84px;height:84px;border-radius:50%;background:#2f6b3b;display:grid;place-items:center;box-shadow:inset 0 0 0 5px #fbf6ea,0 0 0 3px #2f6b3b">${tick(52, "#fff")}</div>
        <div class="serif" data-check="${id}" style="font-size:42px;line-height:1.1;font-weight:500;letter-spacing:-.01em;color:#1d1d20">${esc(label)}</div>
      </div>
      <div style="position:absolute;left:30px;right:30px;bottom:0;height:0;border-top:3px dashed #cdbfa3"></div>
    </div>`;
  const scene = `
  <div style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${1500 - SCENE_TOP}px;${linen}"></div>

  <!-- the boarding pass -->
  <div style="position:absolute;left:52px;top:408px;width:896px;height:250px;transform:rotate(-1.2deg);filter:drop-shadow(0 3px 3px rgba(10,20,35,.35)) drop-shadow(0 20px 20px rgba(10,20,35,.4))">
    <div style="position:absolute;inset:0;background:#fbf6ea;border-radius:10px;${notchMask([["0", "50%"], ["100%", "50%"], ["650px", "0"], ["650px", "100%"]], 20)}"></div>
    <div style="position:absolute;left:0;top:0;bottom:0;width:20px;background:${C.plumDeep};border-radius:10px 0 0 10px;clip-path:polygon(0 0,100% 0,100% 100%,0 100%)"></div>
    <div style="position:absolute;left:52px;top:34px;width:560px">
      <div class="serif" style="font-size:92px;line-height:1;font-weight:500;letter-spacing:-.025em;color:${C.plumDeep}">Ohio</div>
      <div class="serif" data-check="note" style="font-size:32px;line-height:1.22;margin-top:14px;color:#1d1d20">${esc(note)}</div>
    </div>
    <div style="position:absolute;left:650px;top:26px;bottom:26px;width:0;border-left:3px dashed #cdbfa3"></div>
    <div style="position:absolute;left:676px;top:20px;width:200px;height:210px;display:grid;place-items:center">
      <svg viewBox="0 0 200 200" width="200" height="200" style="transform:rotate(-12deg)" aria-hidden="true">
        <circle cx="100" cy="100" r="88" fill="none" stroke="${C.plumDeep}" stroke-width="7"/>
        <circle cx="100" cy="100" r="74" fill="none" stroke="${C.plumDeep}" stroke-width="3"/>
        <text x="100" y="76" text-anchor="middle" font-family="Plex" font-weight="600" font-size="26" letter-spacing="5" fill="${C.plumDeep}">OHIO</text>
        <text x="100" y="138" text-anchor="middle" font-family="Newsreader" font-weight="600" font-size="50" fill="${C.plumDeep}">High</text>
        <line x1="48" y1="90" x2="152" y2="90" stroke="${C.plumDeep}" stroke-width="3"/>
      </svg>
    </div>
  </div>

  ${stub(60, -1.8, LABEL.samples, "stub-samples")}
  ${stub(530, 1.8, LABEL.test, "stub-test")}
  <div style="position:absolute;left:446px;top:812px;width:108px;height:108px;border-radius:50%;background:${C.plumDeep};color:#fff;display:grid;place-items:center;font:500 52px 'Newsreader',serif;box-shadow:0 0 0 7px #fbf6ea,0 12px 18px rgba(10,20,35,.45);z-index:3">or</div>

  <!-- the bracket joining the two ticked stubs, and what the note says of them -->
  <svg style="position:absolute;left:0;top:1010px;width:1000px;height:70px" viewBox="0 0 1000 70" aria-hidden="true">
    <path d="M270 4 V34 H730 V4 M500 34 V62" fill="none" stroke="#fbf6ea" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <div style="position:absolute;left:150px;top:1070px;width:700px;height:74px;background:#fbf6ea;border-radius:8px;display:grid;place-items:center;box-shadow:0 14px 20px rgba(10,20,35,.4);transform:rotate(.5deg)">
    <div class="serif" data-check="alternatives" style="font-size:34px;font-weight:500;color:#1d1d20;white-space:nowrap">Test and portfolio review are alternatives.</div>
  </div>

  <!-- the two rows the note leaves unticked -->
  <div style="position:absolute;left:60px;top:1166px;width:880px;display:flex;gap:20px">
    ${[LABEL.log, LABEL.attendance].map((t, k) => `<div style="flex:1;height:64px;background:#d9d3c6;border-radius:8px;display:flex;align-items:center;gap:14px;padding:0 18px;transform:rotate(${k ? .6 : -.6}deg);box-shadow:0 8px 14px rgba(10,20,35,.35)"><span data-check="unticked-${k}" style="font-size:24px;font-weight:500;color:#2b2823;white-space:nowrap;display:flex;align-items:center;gap:14px">${box(false, 34, "#2b2823")}${esc(t)}</span></div>`).join("")}
  </div>

  <div style="position:absolute;left:60px;top:1256px;width:880px;height:70px;background:#fbf6ea;border-radius:8px;display:grid;place-items:center;box-shadow:0 10px 16px rgba(10,20,35,.4);transform:rotate(-.4deg)">
    <div data-check="caution" style="font-size:26px;font-weight:600;color:#1d1d20;white-space:nowrap">${esc(CAUTION)}</div>
  </div>`;
  return printable({ n: 85, scene, paper: "#efe7da" });
}

/* ------------------------------------------------------------ 87 California */

/** A postage stamp: scalloped edge cut out in the card's own colour. */
function stamp(x, y, w, h, bg) {
  const dots = [];
  for (let px = 0; px <= w; px += 14) { dots.push(`<circle cx="${px}" cy="0" r="5" fill="${bg}"/>`, `<circle cx="${px}" cy="${h}" r="5" fill="${bg}"/>`); }
  for (let py = 0; py <= h; py += 14) { dots.push(`<circle cx="0" cy="${py}" r="5" fill="${bg}"/>`, `<circle cx="${w}" cy="${py}" r="5" fill="${bg}"/>`); }
  return `<svg style="position:absolute;left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect width="${w}" height="${h}" fill="#fff"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="#d98a3d"/><rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>
    <circle cx="${w / 2}" cy="${h / 2 + 4}" r="26" fill="#fbe7a5"/>${[...Array(12)].map((_, k) => `<line x1="${w / 2 + Math.cos(k * 0.5236) * 33}" y1="${h / 2 + 4 + Math.sin(k * 0.5236) * 33}" x2="${w / 2 + Math.cos(k * 0.5236) * 42}" y2="${h / 2 + 4 + Math.sin(k * 0.5236) * 42}" stroke="#fbe7a5" stroke-width="4" stroke-linecap="round"/>`).join("")}
    ${dots.join("")}</svg>`;
}

function california() {
  const i = idea(87);
  const note = "Private school affidavit; attendance register and course list";
  if (!i.items.includes(note)) throw new Error("California note changed");
  const card = "#fbf3e2";
  const red = "#c8472f", blue = "#2d4f7c";
  const gingham = `background-color:#f6ead9;background-image:repeating-linear-gradient(90deg,rgba(190,92,62,.5) 0 52px,transparent 52px 104px),repeating-linear-gradient(0deg,rgba(190,92,62,.5) 0 52px,transparent 52px 104px)`;
  const airmail = `repeating-linear-gradient(135deg,${red} 0 16px,${card} 16px 28px,${blue} 28px 44px,${card} 44px 56px)`;
  const row = (on, t) => `<div data-check="row" style="display:flex;align-items:center;gap:16px;height:52px;font-size:25px;line-height:1.1;white-space:nowrap;font-weight:${on ? 600 : 400};color:#1d1d20">${box(on, 36, "#3b2d1a")}<span>${esc(t)}</span></div>`;
  const scene = `
  <div style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${1500 - SCENE_TOP}px;${gingham}"></div>
  <div style="position:absolute;left:0;top:${SCENE_TOP}px;width:1000px;height:${1500 - SCENE_TOP}px;background:radial-gradient(ellipse at 30% 15%,rgba(255,255,255,.2),rgba(60,20,5,.28))"></div>

  <!-- the postcard: the note, as written -->
  <div style="position:absolute;left:56px;top:412px;width:888px;height:476px;transform:rotate(-1.4deg);filter:drop-shadow(0 3px 3px rgba(60,20,5,.3)) drop-shadow(0 22px 22px rgba(60,20,5,.4))">
    <div style="position:absolute;inset:0;background:${airmail};border-radius:6px"></div>
    <div style="position:absolute;inset:16px;background:${card};border-radius:2px"></div>
    <div style="position:absolute;left:54px;top:20px;font:italic 500 190px/1 'Newsreader',serif;color:${C.ochre};opacity:.9">&ldquo;</div>
    <div class="serif" data-check="note" style="position:absolute;left:58px;top:132px;width:490px;font-size:48px;line-height:1.14;font-style:italic;font-weight:500;letter-spacing:-.01em;color:#1d1d20">${esc(note)}</div>
    <div style="position:absolute;left:58px;bottom:44px;display:flex;align-items:center;gap:14px"><span style="display:block;width:56px;height:4px;background:${C.plumDeep}"></span><span data-check="attribution" class="hand" style="font-size:44px;font-weight:700;color:${C.plumDeep};line-height:1.25;white-space:nowrap;display:block">California - Moderate</span></div>
    <div style="position:absolute;left:590px;top:40px;bottom:40px;width:0;border-left:3px solid #d8c9aa"></div>
    ${stamp(718, 40, 128, 156, card)}
    <svg style="position:absolute;left:600px;top:150px" width="190" height="190" viewBox="0 0 190 190" aria-hidden="true">
      <defs><path id="ring" d="M95 95 m-66 0 a66 66 0 1 1 132 0 a66 66 0 1 1 -132 0"/></defs>
      <g transform="rotate(-14 95 95)" fill="none" stroke="${blue}" opacity=".78">
        <circle cx="95" cy="95" r="88" stroke-width="5"/><circle cx="95" cy="95" r="48" stroke-width="3"/>
        <text font-family="Plex" font-weight="600" font-size="24" letter-spacing="4" fill="${blue}" stroke="none"><textPath href="#ring" startOffset="0">CALIFORNIA · MODERATE ·</textPath></text>
      </g>
    </svg>
    ${[300, 346, 392].map((t) => `<div style="position:absolute;left:622px;right:44px;top:${t}px;height:0;border-top:3px solid #cdbd9c"></div>`).join("")}
    <div style="position:absolute;left:560px;top:226px;width:120px;height:56px;opacity:.72"><svg viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">${[8, 28, 48].map((y) => `<path d="M0 ${y} q15 -9 30 0 t30 0 t30 0 t30 0" fill="none" stroke="${blue}" stroke-width="4"/>`).join("")}</svg></div>
  </div>

  <!-- the luggage tag: the checklist -->
  <svg style="position:absolute;left:0;top:920px;width:200px;height:330px;z-index:1" viewBox="0 0 200 330" aria-hidden="true">
    <path d="M168 150 C 100 60, 20 120, 40 190 C 56 238, 120 220, 160 170" fill="none" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/>
    <path d="M168 150 C 100 60, 20 120, 40 190 C 56 238, 120 220, 160 170" fill="none" stroke="#c9985a" stroke-width="3" stroke-dasharray="4 7" stroke-linecap="round"/>
  </svg>
  <div style="position:absolute;left:110px;top:926px;width:570px;height:326px;transform:rotate(2.2deg);z-index:2;filter:drop-shadow(0 3px 3px rgba(60,20,5,.35)) drop-shadow(0 20px 18px rgba(60,20,5,.4))">
    <div style="position:absolute;inset:0;background:#e6c99b;clip-path:polygon(0 24%,62px 0,100% 0,100% 100%,62px 100%,0 76%)"></div>
    <div style="position:absolute;left:6px;top:6px;right:6px;bottom:6px;border:3px dashed #a37a45;clip-path:polygon(0 24%,56px 0,100% 0,100% 100%,56px 100%,0 76%);opacity:.7"></div>
    <div style="position:absolute;left:24px;top:136px;width:44px;height:44px;border-radius:50%;background:#cba66f;box-shadow:inset 0 0 0 7px #f3e6c9,inset 0 3px 6px rgba(0,0,0,.4)"></div>
    <div style="position:absolute;left:92px;top:20px;right:26px">
      <div style="display:flex;align-items:center;gap:16px;height:56px">
        <span class="serif" style="font-size:46px;font-weight:600;letter-spacing:-.01em;color:#1d1d20">California</span>
        <span style="background:#6f4f78;color:#fff;font-weight:600;font-size:26px;padding:6px 16px;border-radius:8px">Moderate</span>
      </div>
      <div style="margin-top:12px;height:3px;background:#a37a45;opacity:.6"></div>
      <div style="margin-top:10px">${row(true, LABEL.log)}${row(true, LABEL.attendance)}${row(false, LABEL.samples)}${row(false, LABEL.test)}</div>
    </div>
  </div>

  <!-- an air-mail label for the caution -->
  <div style="position:absolute;left:712px;top:950px;width:240px;height:290px;transform:rotate(-3deg);filter:drop-shadow(0 3px 3px rgba(60,20,5,.3)) drop-shadow(0 16px 16px rgba(60,20,5,.38))">
    <div style="position:absolute;inset:0;background:${airmail};border-radius:5px"></div>
    <div style="position:absolute;inset:14px;background:${card};border-radius:2px;display:grid;place-items:center;padding:0 12px">
      <div data-check="caution" style="font-size:26px;line-height:1.28;font-weight:600;color:#1d1d20;text-align:left">${esc(CAUTION)}</div>
    </div>
  </div>`;
  return printable({ n: 87, scene, paper: "#f1e6d6" });
}

/* ----------------------------------------------------- 89 Florida and Alaska */

function floridaAlaska() {
  const i = idea(89);
  const fl = "Notice; portfolio of work and log kept two years; annual evaluation";
  const ak = "Nothing filed; records for your own use";
  if (!i.items.some((t) => t.includes(fl)) || !i.items.some((t) => t.includes(ak))) throw new Error("Florida/Alaska notes changed");

  const felt = `<svg style="position:absolute;left:0;top:${SCENE_TOP}px" width="1000" height="${1500 - SCENE_TOP}" aria-hidden="true">
    <defs><filter id="fz"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .2  0 0 0 0 .1  0 0 0 .55 0"/></filter>
    <radialGradient id="fv" cx="30%" cy="15%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#0c2010" stop-opacity=".4"/></radialGradient></defs>
    <rect width="1000" height="${1500 - SCENE_TOP}" fill="#6d8f6a"/><rect width="1000" height="${1500 - SCENE_TOP}" filter="url(#fz)"/><rect width="1000" height="${1500 - SCENE_TOP}" fill="url(#fv)"/></svg>`;

  const W = 415, H = 470, Y = 480, N = 50, STEP = 5;
  // the stack: bottom sheets first; each a little off, so the edge reads as a pile
  const layers = Array.from({ length: N }, (_, k) => {
    const down = (N - k) * STEP;
    const jx = ((k * 53) % 9) - 4, rot = (((k * 37) % 7) - 3) * 0.12;
    return `<div style="position:absolute;left:${55 + jx}px;top:${Y + down}px;width:${W}px;height:${H}px;background:${k % 2 ? "#fbf9f3" : "#efeadc"};border-bottom:1px solid #c9c1ae;border-radius:2px;transform:rotate(${rot}deg);box-shadow:0 0 0 1px rgba(60,50,30,.12)"></div>`;
  }).join("");
  const stackBottom = Y + H + N * STEP;
  const sheetText = (state, level, note, key, levelStyle) => `
    <div style="position:absolute;left:34px;right:30px;top:36px">
      <div class="serif" data-check="${key}-state" style="font-size:78px;line-height:1;font-weight:500;letter-spacing:-.025em;color:#1d1d20">${state}</div>
      <div style="margin-top:14px;height:5px;width:90px;background:${C.plumDeep}"></div>
      <div class="serif" data-check="${key}-note" style="margin-top:22px;font-size:34px;line-height:1.2;color:#1d1d20">${esc(note)}</div>
    </div>`;
  const chip = (x, text, style) => `<div style="position:absolute;left:${x}px;top:${Y - 52}px;height:54px;padding:0 26px;border-radius:12px 12px 0 0;display:flex;align-items:center;font:600 30px 'Plex',sans-serif;letter-spacing:.02em;${style}">${text}</div>`;

  const scene = `
  ${felt}
  ${layers}
  <!-- Florida's top sheet -->
  <div style="position:absolute;left:55px;top:${Y}px;width:${W}px;height:${H}px;background:#fffefa;border-radius:2px;box-shadow:0 0 0 1px rgba(60,50,30,.14);background-image:repeating-linear-gradient(0deg,transparent 0 51px,rgba(120,110,150,.16) 51px 52px)">
    ${sheetText("Florida", "High", fl, "fl")}
  </div>
  ${chip(55, "High", `background:${C.plumDeep};color:#fff`)}
  <!-- a rubber band round the edge of the pile -->
  <div style="position:absolute;left:44px;top:${Y + H + 100}px;width:${W + 22}px;height:30px;background:#bd4b36;border-radius:16px;box-shadow:inset 0 3px 0 rgba(255,255,255,.25),0 8px 12px rgba(10,25,10,.4)"></div>
  <div style="position:absolute;left:44px;top:${Y + H + 100}px;width:${W + 22}px;height:30px;border-radius:16px;opacity:.5;background:repeating-linear-gradient(90deg,transparent 0 22px,rgba(0,0,0,.18) 22px 23px)"></div>

  <!-- Alaska's one sheet -->
  <div style="position:absolute;left:530px;top:${Y}px;width:${W}px;height:${H}px;transform:rotate(1.3deg);transform-origin:50% 0;background:#fffefa;border-radius:2px;box-shadow:0 1px 2px rgba(10,25,10,.4),0 14px 22px rgba(10,25,10,.4);background-image:repeating-linear-gradient(0deg,transparent 0 51px,rgba(120,110,150,.16) 51px 52px)">
    ${sheetText("Alaska", "None", ak, "ak")}
    <div style="position:absolute;left:0;top:-52px;height:54px;padding:0 26px;border-radius:12px 12px 0 0;display:flex;align-items:center;font:600 30px 'Plex',sans-serif;letter-spacing:.02em;background:#fffefa;color:${C.plumDeep};box-shadow:inset 0 0 0 3px ${C.plumDeep};clip-path:inset(-4px -4px 3px -4px)">None</div>
  </div>
  <div style="position:absolute;left:668px;top:${Y - 98}px;transform:rotate(-2deg)"><span class="example" style="font-size:24px;color:#1d1d20;background:#fffefa;border-color:#1d1d20;padding:6px 14px;border-radius:7px">Example</span></div>

  ${pencil({ x: 540, y: 1110, len: 380, rot: -5 })}
  <!-- the caution on masking tape -->
  <div style="position:absolute;left:36px;top:1232px;width:928px;height:76px;transform:rotate(-.5deg);background:#e9dcb4;box-shadow:0 8px 14px rgba(10,25,10,.4);clip-path:polygon(0 8%,1.2% 0,2.4% 9%,3.6% 0,100% 0,100% 100%,98.8% 92%,97.6% 100%,96.4% 92%,0 100%);display:grid;place-items:center">
    <div data-check="caution" style="font-size:27px;font-weight:600;color:#1d1d20;white-space:nowrap">${esc(CAUTION)}</div>
  </div>`;
  return printable({ n: 89, scene, paper: "#e9efe3" });
}

export const pins = [ohio(), california(), floridaAlaska()];
