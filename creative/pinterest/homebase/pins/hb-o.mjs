/**
 * Group O: filing cabinet and shelf. Pins #89, #91, #93, #95, #97 (the life
 * admin binder guide pins). Guide pins tell the guide in pictures, so every
 * scene here is drawn (flat vector, soft shadows); no printed workbook page
 * or app screen is used, so none is altered. Every word is bank text or a
 * label that is real on the drawn object.
 *
 *   89  steel cabinet top, a binder with eight tabs fanned out
 *   91  kraft manila folder, four step cards
 *   93  bookshelf, two binders side by side
 *   95  green desk blotter, a typed binder page, a stamp, a fireproof box
 *   97  scatter of envelopes, a myth / truth card
 */
import { printable, SCENE_TOP } from "../kit/printable.mjs";
import { C, idea } from "../kit/bank.mjs";
import { esc } from "../../v3/kit.mjs";
import { icon } from "../kit/icons.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const H = 1500 - SCENE_TOP;
const SOFT = "filter:drop-shadow(0 12px 9px rgba(20,25,15,.38))";
const KRAFTS = ["#c8a679", "#cdad80", "#c3a073", "#cfb185", "#c6a477", "#cbab7e", "#c1a073", "#cdb084"];

/** A noise filter and a gentle light, for a surface that fills y 372..1500. */
function surface({ base, light = "rgba(255,255,255,.22)", dark = "rgba(10,20,10,.32)", grain = 0.55, freq = 0.9, id = "sf", top = SCENE_TOP, height = H, extra = "" }) {
  return `<svg style="${abs(0, top, 1000, height)}" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs>
    <filter id="${id}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="5"/><feColorMatrix values="0 0 0 0 .1  0 0 0 0 .1  0 0 0 0 .08  0 0 0 ${grain} 0"/></filter>
    <radialGradient id="${id}l" cx="22%" cy="6%" r="105%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>
    <rect width="1000" height="${height}" fill="${base}"/><rect width="1000" height="${height}" filter="url(#${id}n)" opacity=".5"/>${extra}<rect width="1000" height="${height}" fill="url(#${id}l)"/></svg>`;
}

/** A small rubber stamp lying on its side: wooden knob, steel collar, black rubber block. */
function stamp({ x, y, rot = 0, s = 1 }) {
  return `<svg style="${abs(x, y, 240 * s, 120 * s, `transform:rotate(${rot}deg);${SOFT}`)}" viewBox="0 0 240 120" aria-hidden="true">
    <rect x="86" y="14" width="150" height="62" rx="30" fill="#b9814a"/><rect x="86" y="14" width="150" height="18" rx="9" fill="#e0b27c" opacity=".7"/><rect x="86" y="62" width="150" height="14" rx="7" fill="#7d5428" opacity=".4"/>
    <rect x="62" y="22" width="30" height="46" rx="6" fill="#cfd3cf"/><rect x="62" y="22" width="9" height="46" rx="4" fill="#fff" opacity=".5"/>
    <rect x="14" y="14" width="52" height="62" rx="6" fill="#26332a"/><rect x="14" y="14" width="52" height="14" rx="6" fill="#4a5a50"/>
    <rect x="2" y="26" width="14" height="38" rx="3" fill="#1a2420"/></svg>`;
}

/** A closed envelope, flat. */
function envelope({ x, y, w = 240, rot = 0, fill = "#f6f1e3", edge = "#cdbf9d", shadow = true, op = 1 }) {
  const h = w * 0.66;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);opacity:${op};${shadow ? "filter:drop-shadow(0 8px 6px rgba(20,15,5,.3))" : ""}`)}" viewBox="0 0 240 158" aria-hidden="true"><rect width="240" height="158" rx="5" fill="${fill}"/><rect width="240" height="158" rx="5" fill="none" stroke="${edge}" stroke-width="2.5"/>
    <path d="M3 5 L120 92 L237 5" fill="none" stroke="${edge}" stroke-width="3"/><path d="M3 155 L96 80 M237 155 L144 80" fill="none" stroke="${edge}" stroke-width="2.5"/><rect x="178" y="108" width="38" height="12" rx="3" fill="${edge}" opacity=".55"/></svg>`;
}

/** A fireproof document box, front view: body, lid, handle and a lock. `line` draws it as a line drawing only. */
function fireproofBox({ x, y, w = 260, rot = 0, line = false, body = "#3f5a4a", stroke = "#f4efe2" }) {
  const h = w * 0.74;
  const inner = line
    ? `<path d="M80 40 C 80 -2 180 -2 180 40" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/><rect x="6" y="38" width="248" height="144" rx="14" fill="none" stroke="${stroke}" stroke-width="6"/><path d="M6 86 H254" stroke="${stroke}" stroke-width="5"/><rect x="104" y="72" width="52" height="30" rx="7" fill="none" stroke="${stroke}" stroke-width="5"/><circle cx="130" cy="87" r="5" fill="${stroke}"/><path d="M26 182 v8 M234 182 v8" stroke="${stroke}" stroke-width="6" stroke-linecap="round"/>`
    : `<path d="M80 40 C 80 -2 180 -2 180 40" fill="none" stroke="#c4c8cc" stroke-width="12" stroke-linecap="round"/><rect x="2" y="36" width="256" height="150" rx="14" fill="${body}"/><rect x="2" y="36" width="256" height="48" rx="14" fill="#fff" opacity=".13"/><rect x="2" y="84" width="256" height="7" fill="#000" opacity=".28"/><rect x="100" y="70" width="60" height="34" rx="8" fill="#d4d8d2"/><circle cx="130" cy="87" r="7" fill="#7f867f"/><rect x="2" y="176" width="256" height="10" rx="4" fill="#000" opacity=".2"/>`;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);${line ? "" : SOFT}`)}" viewBox="0 0 260 192" aria-hidden="true">${inner}</svg>`;
}

/* ------------------------------------------------------------------ #89 */
function p89() {
  const i = idea(89);
  const label = (s) => esc(s.replace(/^\d+\.\s*/, ""));
  const tabs = i.items
    .map((t, k) => {
      const y = 416 + k * 96;
      const w = 570 - Math.abs(k - 3.5) * 12;
      const hi = k === 0;
      const rot = (k - 3.5) * 0.7;
      const num = t.match(/^(\d+)\./)[1];
      return `<div style="${abs(380, y, w, 86, `transform-origin:0 50%;transform:rotate(${rot}deg);border-radius:6px 26px 26px 6px;background:${hi ? `linear-gradient(180deg,#6a9877,${C.sage})` : `linear-gradient(180deg,#d6b98c,${KRAFTS[k]})`};box-shadow:0 3px 3px rgba(20,25,15,.3),0 12px 16px rgba(20,25,15,.3);${hi ? "outline:3px solid #2f5a40;outline-offset:-3px;" : ""}`)}">
        <div data-check="tab" style="position:absolute;left:96px;top:0;right:30px;height:86px;display:flex;align-items:center;gap:16px;font:600 34px/1 'Plex',sans-serif;color:${hi ? "#fbfaf6" : C.ink};white-space:nowrap"><span class="mono" style="font-weight:600;width:34px">${num}.</span><span>${label(t)}</span></div></div>`;
    })
    .join("");
  const cabinetLip = `<div style="${abs(0, 1270, 1000, 90, "background:linear-gradient(#8f9f95,#74847a);box-shadow:0 -6px 14px rgba(10,20,10,.35)")}"></div>
    <div style="${abs(0, 1270, 1000, 8, "background:#d7e0da;opacity:.7")}"></div>
    <div style="${abs(340, 1300, 320, 40, "border-radius:22px;background:linear-gradient(#e9ece9,#9ca39f);box-shadow:0 8px 12px rgba(10,20,10,.4)")}"></div>`;
  const binder = `<div style="${abs(40, 408, 330, 830, "border-radius:14px 10px 10px 14px;background:linear-gradient(135deg,#5d8a6a,#3d6450);box-shadow:0 4px 6px rgba(20,25,15,.4),0 30px 46px rgba(20,25,15,.5)")}"></div>
    <div style="${abs(40, 408, 46, 830, "border-radius:14px 0 0 14px;background:linear-gradient(90deg,#2f4f3c,#47705a)")}"></div>
    ${[110, 400, 690].map((t) => `<div style="${abs(48, 408 + t, 30, 30, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#f4f6f7,#8a9298);box-shadow:0 3px 4px rgba(0,0,0,.4)")}"></div>`).join("")}
    <div style="${abs(110, 560, 220, 150, "background:#f6f3ea;border-radius:8px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.14)")}"><div class="serif" style="position:absolute;inset:0;display:grid;place-items:center;text-align:center;font:500 44px/1.05 'Newsreader',serif;color:${C.ink}">Life<br>admin</div></div>
    <div style="${abs(366, 424, 56, 798, "background:repeating-linear-gradient(180deg,#fdfcf8 0 7px,#dcd8cc 7px 9px);border-radius:0 6px 6px 0;box-shadow:6px 8px 14px rgba(20,25,15,.35)")}"></div>`;
  const scene = `${surface({ base: "#a9bab0", id: "s89", light: "rgba(255,255,255,.3)", dark: "rgba(20,40,30,.34)", freq: 0.7 })}
    ${cabinetLip}${binder}${tabs}${stamp({ x: 690, y: 1186, rot: -4, s: 0.95 })}`;
  return printable({ n: 89, scene, paper: "#e4ece2" });
}

/* ------------------------------------------------------------------ #91 */
function p91() {
  const i = idea(91);
  const prop = [
    // 1: an empty binder and eight dividers
    `<rect x="14" y="28" width="92" height="122" rx="8" fill="#3d6450"/><rect x="14" y="28" width="18" height="122" rx="8" fill="#2f4f3c"/><rect x="38" y="52" width="52" height="34" rx="4" fill="#f6f3ea"/>
     ${[0, 1, 2, 3].map((k) => `<rect x="104" y="${38 + k * 27}" width="52" height="22" rx="4" fill="${KRAFTS[k]}" stroke="#8a7350" stroke-opacity=".45"/>`).join("")}`,
    // 2: a pen over tab 1
    `<path d="M16 58 H124 Q150 58 150 84 Q150 110 124 110 H16 Z" fill="#c8a679" stroke="#8a7350" stroke-opacity=".5" stroke-width="2"/><text x="34" y="100" font-family="Newsreader,serif" font-size="56" font-weight="500" fill="#1a2420">1</text>
     <g transform="translate(52 -6) rotate(-38 110 40)"><rect x="40" y="18" width="104" height="14" rx="7" fill="#1f3d30"/><rect x="40" y="18" width="104" height="5" rx="3" fill="#fff" opacity=".25"/><path d="M40 18 L12 25 L40 32 Z" fill="#e9c9a0"/><path d="M20 22 L12 25 L20 28 Z" fill="#1a2420"/></g>`,
    // 3: a laptop with an email field
    `<rect x="26" y="26" width="118" height="84" rx="9" fill="#2a3a31"/><rect x="34" y="34" width="102" height="68" rx="4" fill="#f6f3ea"/><rect x="42" y="56" width="86" height="26" rx="6" fill="#fff" stroke="${C.sage}" stroke-width="3"/><text x="52" y="77" font-family="Plex Mono,monospace" font-size="22" font-weight="600" fill="${C.sageDeep}">@</text>
     <path d="M8 114 H162 L150 130 H20 Z" fill="#aab3ad"/><rect x="62" y="114" width="46" height="6" rx="3" fill="#6f7872"/>`,
    // 4: two people at a shelf
    `<rect x="8" y="124" width="154" height="12" rx="3" fill="#b9814a"/><rect x="104" y="58" width="22" height="66" rx="3" fill="#3d6450"/><rect x="128" y="70" width="20" height="54" rx="3" fill="#c8a679"/>
     <circle cx="38" cy="50" r="15" fill="#e9c9a0"/><path d="M14 124 V82 Q14 66 38 66 Q62 66 62 82 V124 Z" fill="${C.sage}"/>
     <circle cx="80" cy="54" r="13" fill="#d9b48a"/><path d="M60 124 V86 Q60 72 80 72 Q100 72 100 86 V124 Z" fill="#8a7a3a"/>`,
  ];
  const cards = i.items
    .map((t, k) => {
      const y = 400 + k * 228;
      return `<div style="${abs(48, y, 904, 204, "background:#fbfaf6;border-radius:20px;box-shadow:0 3px 4px rgba(60,35,10,.3),0 16px 26px rgba(60,35,10,.35)")}">
        <div class="serif" style="position:absolute;left:30px;top:0;height:204px;width:64px;display:flex;align-items:center;font:500 104px/1 'Newsreader',serif;color:${C.sage}">${k + 1}</div>
        <svg style="${abs(104, 17, 170, 170)}" viewBox="0 0 170 170" aria-hidden="true">${prop[k]}</svg>
        <div data-check="step" style="${abs(296, 0, 576, 204, "display:flex;align-items:center;font:500 31px/1.28 'Plex',sans-serif;color:" + C.ink)}">${esc(t)}</div></div>`;
    })
    .join("");
  const fibres = Array.from({ length: 70 }, (_, k) => {
    const a = (k * 53) % 997, b = (k * 131) % 560;
    return `<path d="M${a} ${b} q${20 + (k % 7) * 6} ${(k % 5) - 2} ${50 + (k % 9) * 8} ${((k * 3) % 7) - 3}" fill="none" stroke="#7d5f35" stroke-opacity=".16" stroke-width="1.6"/>`;
  }).join("");
  const scene = `${surface({ base: "#c9a877", id: "s91", light: "rgba(255,240,200,.32)", dark: "rgba(70,40,10,.38)", freq: 0.55, grain: 0.35 })}
    <svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true">${fibres}${fibres.replace(/M(\d+) (\d+)/g, (m, a, b) => `M${(a * 1 + 300) % 980} ${(Number(b) + 420) % 960}`)}</svg>
    ${cards}`;
  return printable({ n: 91, scene, paper: "#f1e8d5" });
}

/* ------------------------------------------------------------------ #93 */
function p93() {
  const i = idea(93);
  const shelfY = 1040;
  const back = `<svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><defs><linearGradient id="b93" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#47624f"/><stop offset="1" stop-color="#26382e"/></linearGradient></defs><rect width="1000" height="${H}" fill="url(#b93)"/>
    ${Array.from({ length: 9 }, (_, k) => `<rect x="${k * 125}" y="0" width="3" height="${H}" fill="#000" opacity=".18"/>`).join("")}</svg>`;
  const board = `<div style="${abs(0, shelfY, 1000, 24, "background:linear-gradient(#e2b983,#c99b66)")}"></div><div style="${abs(0, shelfY + 24, 1000, 50, "background:linear-gradient(#bd8d56,#9a6f3e);box-shadow:0 14px 22px rgba(0,0,0,.5)")}"></div>
    <div style="${abs(0, SCENE_TOP, 1000, 40, "background:linear-gradient(#b98a52,#9a6f3e)")}"></div>
    <div style="${abs(0, SCENE_TOP, 26, H, "background:linear-gradient(90deg,#8a6234,#b98a52)")}"></div><div style="${abs(974, SCENE_TOP, 26, H, "background:linear-gradient(90deg,#b98a52,#8a6234)")}"></div>`;
  const bTop = 452, bH = 588;
  // left: life admin, eight narrow tabs
  const left = () => {
    const x = 70, w = 340;
    const tabs = Array.from({ length: 8 }, (_, k) => `<div style="${abs(x + w - 6, bTop + 18 + k * 68, 58, 54, `border-radius:0 12px 12px 0;background:linear-gradient(90deg,#d6b98c,${KRAFTS[k]});box-shadow:3px 5px 8px rgba(0,0,0,.4)`)}"></div>`).join("");
    return `${tabs}<div style="${abs(x, bTop, w, bH, "border-radius:10px 8px 8px 10px;background:linear-gradient(135deg,#6a9877,#3f6650);box-shadow:0 4px 6px rgba(0,0,0,.4),0 26px 36px rgba(0,0,0,.55)")}"></div>
      <div style="${abs(x, bTop, 40, bH, "border-radius:10px 0 0 10px;background:linear-gradient(90deg,#2c4a38,#456e58)")}"></div>
      <div style="${abs(x + 74, bTop + 190, w - 110, 150, "background:#f6f3ea;border-radius:8px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.14)")}"><div style="position:absolute;inset:0;display:grid;place-items:center;font:500 52px/1 'Newsreader',serif;color:${C.ink};text-align:center">Life<br>admin</div></div>`;
  };
  // right: home, five wide tabs
  const right = () => {
    const x = 540, w = 340;
    const tabs = Array.from({ length: 5 }, (_, k) => `<div style="${abs(x + w - 6, bTop + 22 + k * 112, 70, 98, `border-radius:0 14px 14px 0;background:linear-gradient(90deg,#d6b98c,${KRAFTS[k + 2]});box-shadow:3px 5px 8px rgba(0,0,0,.4)`)}"></div>`).join("");
    return `${tabs}<div style="${abs(x, bTop, w, bH, "border-radius:10px 8px 8px 10px;background:linear-gradient(135deg,#f0e9d6,#d8ceb2);box-shadow:0 4px 6px rgba(0,0,0,.4),0 26px 36px rgba(0,0,0,.55)")}"></div>
      <div style="${abs(x, bTop, 40, bH, "border-radius:10px 0 0 10px;background:linear-gradient(90deg,#b9ad8c,#d8ceb2)")}"></div>
      <div style="${abs(x + 74, bTop + 190, w - 110, 150, "background:#fbfaf6;border-radius:8px;box-shadow:inset 0 0 0 3px rgba(0,0,0,.16)")}"><div style="position:absolute;inset:0;display:grid;place-items:center;font:500 62px/1 'Newsreader',serif;color:${C.ink}">Home</div></div>`;
  };
  const arrow = (cx) => `<svg style="${abs(cx - 24, shelfY + 84, 48, 52)}" viewBox="0 0 48 52" aria-hidden="true"><path d="M24 50 V10 M8 24 L24 8 L40 24" fill="none" stroke="#a9d3b4" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const card = (x, w, text) => `<div data-check="job" style="${abs(x, shelfY + 142, w, 150, "background:#fbfaf6;border-radius:16px;box-shadow:0 10px 18px rgba(0,0,0,.45);display:flex;align-items:center;padding:0 26px;font:600 30px/1.22 'Plex',sans-serif;color:" + C.ink)}">${esc(text)}</div>`;
  const scene = `${back}${left()}${right()}${board}
    ${arrow(240)}${arrow(710)}
    ${card(46, 420, i.items[0].replace(/^Life admin binder: w/, "W"))}${card(500, 454, i.items[2])}`;
  return printable({ n: 93, scene, paper: "#ece5d3" });
}

/* ------------------------------------------------------------------ #95 */
function p95() {
  const i = idea(95);
  const blotter = `${surface({ base: "#2f4639", id: "s95", light: "rgba(190,230,200,.2)", dark: "rgba(0,10,5,.5)", freq: 1.1, grain: 0.7 })}
    <svg style="${abs(0, SCENE_TOP, 1000, H)}" viewBox="0 0 1000 ${H}" aria-hidden="true"><rect x="22" y="22" width="956" height="${H - 44}" rx="16" fill="none" stroke="#9fc4a9" stroke-opacity=".5" stroke-width="3" stroke-dasharray="14 10"/></svg>`;
  const heading = (t) => `<div class="mono" style="margin:0 0 12px;padding:8px 14px;background:${C.sageSoft};border-left:8px solid ${C.sage};font:600 30px/1.1 'Plex Mono',monospace;color:${C.sageDeep}">${esc(t)}</div>`;
  const line = (t) => `<div class="mono" style="font:400 24px/1.38 'Plex Mono',monospace;color:${C.ink};margin:0 0 18px">${esc(t)}</div>`;
  const [will, passport, email, nopw] = i.items;
  const pg = `<div style="${abs(70, 428, 650, 880, "transform:rotate(-3deg);background:#fdfcf8;border-radius:3px;box-shadow:0 2px 3px rgba(0,0,0,.35),0 22px 40px rgba(0,0,0,.5)")}">
      ${[130, 400, 670].map((t) => `<div style="${abs(24, t, 30, 30, "border-radius:50%;background:#2f4639;box-shadow:inset 0 2px 4px rgba(0,0,0,.6)")}"></div>`).join("")}
      <div style="position:absolute;right:34px;top:30px"><span class="example" style="font-size:24px;padding:6px 12px">Example</span></div>
      <div data-check="pagetext" style="${abs(84, 96, 530, 640)}">${heading("2. Paperwork")}${line(will)}${line(passport)}<div style="height:26px"></div>${heading("6. Accounts and devices")}${line(email)}${line(nopw)}</div>
      <div style="${abs(84, 752, 400, 78, `border:5px double ${C.sageDeep};border-radius:10px;transform:rotate(-4deg);display:grid;place-items:center;text-align:center;font:600 25px/1.2 'Plex',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.sageDeep};opacity:.8`)}">Example,<br>invented household</div>
    </div>`;
  const scene = `${blotter}
    ${envelope({ x: 726, y: 760, w: 250, rot: 6, fill: "#e5d3ae", edge: "#a98d5b" })}${envelope({ x: 744, y: 900, w: 230, rot: -4 })}
    ${stamp({ x: 735, y: 470, rot: 28, s: 1.05 })}
    ${pg}
    ${fireproofBox({ x: 742, y: 1098, w: 232, line: true, rot: -3 })}`;
  return printable({ n: 95, scene, paper: "#eceae0" });
}

/* ------------------------------------------------------------------ #97 */
function p97() {
  const i = idea(97);
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const fills = ["#f6f1e3", "#e9dcc0", "#fbfaf6", "#e6ede2"];
  const scatter = Array.from({ length: 34 }, (_, k) => envelope({ x: -40 + (k % 5) * 215 + rnd() * 40, y: 380 + Math.floor(k / 5) * 160 + rnd() * 30, w: 200, rot: -25 + rnd() * 50, fill: fills[k % 4], edge: "#c4b48f", shadow: false, op: 0.9 })).join("");
  const ground = `<div style="${abs(0, SCENE_TOP, 1000, H, "background:#e8e1cf")}"></div>${scatter}<div style="${abs(0, SCENE_TOP, 1000, H, "background:radial-gradient(ellipse 90% 70% at 50% 40%,rgba(246,242,230,.55),rgba(232,225,207,.1) 80%)")}"></div>`;
  const SLATE = C.slate;
  const panel = (x, label, body, accent) => `<div style="${abs(x, 400, 450, 440, "background:#fbfaf6;border-radius:20px;box-shadow:0 3px 4px rgba(60,40,10,.25),0 18px 30px rgba(60,40,10,.3);overflow:hidden")}">
      <div data-check="label" style="${abs(0, 0, 450, 78, `background:${accent};display:flex;align-items:center;padding:0 26px;font:600 31px/1 'Plex',sans-serif;color:#fbfaf6`)}">${esc(label)}</div>${body}</div>`;
  const sheets = Array.from({ length: 11 }, (_, k) => `<g transform="translate(${k * 7} ${(10 - k) * 6})"><rect x="40" y="96" width="210" height="270" fill="${k % 2 ? "#f3f0e6" : "#fdfcf8"}" stroke="#bdb8a8" stroke-width="2"/></g>`).join("");
  const stack = `<svg style="${abs(0, 78, 450, 362)}" viewBox="0 0 450 440" aria-hidden="true" ><g transform="translate(40 -50)">${sheets}
      <g stroke="#a9a592" stroke-width="5" stroke-linecap="round">${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${130 + 36} ${186 + k * 28} H${130 + 190 - (k % 3) * 24}"/>`).join("")}</g></g>
      <path d="M52 78 L388 420" stroke="${SLATE}" stroke-width="22" stroke-linecap="round" opacity=".9"/><path d="M388 78 L52 420" stroke="${SLATE}" stroke-width="22" stroke-linecap="round" opacity=".9"/></svg>`;
  const one = `<svg style="${abs(0, 78, 450, 362)}" viewBox="0 0 450 362" aria-hidden="true"><rect x="70" y="22" width="300" height="318" fill="#fff" stroke="#bdb8a8" stroke-width="2" style="filter:drop-shadow(0 8px 8px rgba(40,30,10,.25))"/>
      <circle cx="338" cy="296" r="38" fill="${C.sage}"/><path d="M319 296 l14 15 l27 -31" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <div data-check="pagetext" style="${abs(96, 124, 258, 150, `display:flex;align-items:center;font:600 38px/1.2 'Newsreader',serif;color:${C.ink}`)}">where it is,<br>who to ask</div>`;
  const rows = i.items
    .map((t, k) => `<div data-check="leave" style="${abs(46, 876 + k * 108, 908, 92, `background:#fbfaf6;border-radius:14px;border-left:12px solid ${SLATE};box-shadow:0 8px 14px rgba(60,40,10,.25);display:flex;align-items:center;gap:20px;padding:0 24px;font:600 31px/1.15 'Plex',sans-serif;color:${C.ink}`)}">${icon("x-circle", { size: 46, color: SLATE, weight: "fill" })}<span>${esc(t)}</span></div>`)
    .join("");
  const scene = `${ground}${panel(46, "Copies of everything", stack, SLATE)}${panel(504, "Locations", one, C.sage)}${rows}`;
  return printable({ n: 97, scene, paper: "#f1ecdd", extraCss: "" });
}

export const pins = [p89(), p91(), p93(), p95(), p97()];
