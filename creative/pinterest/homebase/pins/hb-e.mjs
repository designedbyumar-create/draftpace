/**
 * Group E: the laundry room. Appliance guide pins #2, #4, #6, #8, #10, #12, #14.
 * Every word is the idea bank's (headline, sub, items) or a plate label that
 * the guide itself names (MODEL, SERIAL, VOLTS / WATTS). Props and
 * appliances are drawn here; no printed page or app screen is shown.
 */
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { desk, pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const split = (s) => {
  const k = s.indexOf(": ");
  return k < 0 ? [s, ""] : [s.slice(0, k), s.slice(k + 2)];
};
const sageLight = "#a9cdb2";

/* ---------- laundry props (flat vector, soft shadows) ---------- */

/** A stack of folded towels. */
function towelStack({ x, y, w = 330, rot = 0, colors = ["#f3eee2", C.sageSoft, "#e9c8c0", C.butter] }) {
  const h = 38, n = colors.length, H = n * h + 14;
  const layers = colors.map((c, k) => {
    const yy = H - 10 - (k + 1) * h + 6;
    const off = (k % 2 ? 6 : -4);
    return `<rect x="${12 + off}" y="${yy}" width="${w - 24}" height="${h}" rx="12" fill="${c}"/><rect x="${12 + off}" y="${yy}" width="${w - 24}" height="9" rx="6" fill="#fff" opacity=".35"/><rect x="${12 + off}" y="${yy + h - 8}" width="${w - 24}" height="8" rx="4" fill="#000" opacity=".07"/><path d="M${20 + off} ${yy + 20} H${w - 20 + off}" stroke="#000" stroke-opacity=".08" stroke-width="3"/><path d="M${w - 32 + off} ${yy + 6} v${h - 12}" stroke="#000" stroke-opacity=".08" stroke-width="2"/>`;
  }).join("");
  return `<svg style="${abs(x, y, w, H, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,20,10,.35))`)}" viewBox="0 0 ${w} ${H}" aria-hidden="true">${layers}</svg>`;
}

/** A plastic detergent bottle with a handle and a label drop. */
function detergent({ x, y, h = 260, body = "#4f9a8c", cap = "#e8edf0", rot = 0 }) {
  const w = h * 0.5;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(30,20,10,.38))`)}" viewBox="0 0 130 260" aria-hidden="true">
    <path d="M44 6 H88 L92 30 H40 Z" fill="${cap}"/><rect x="38" y="28" width="56" height="12" rx="4" fill="${cap}" opacity=".9"/>
    <path d="M30 44 H98 C 118 52 124 76 124 104 V 238 C 124 252 114 256 100 256 H 30 C 16 256 8 250 8 238 V 104 C 8 76 14 54 30 44 Z" fill="${body}"/>
    <path d="M14 104 C 14 80 18 58 32 50 H 44 C 30 62 28 90 28 120 V 250 C 18 248 14 246 14 238 Z" fill="#fff" opacity=".22"/>
    <path d="M96 52 C 112 54 118 74 118 104" stroke="#000" stroke-opacity=".12" stroke-width="3" fill="none"/>
    <rect x="22" y="112" width="86" height="104" rx="12" fill="#fbfaf6"/>
    <path d="M65 128 C 65 128 46 154 46 170 a19 19 0 0 0 38 0 C 84 154 65 128 65 128 Z" fill="${C.sage}"/>
    <rect x="34" y="198" width="62" height="6" rx="3" fill="#c3cbc4"/></svg>`;
}

/** A flashlight lying at an angle (beam handled by the scene). */
function flashlight({ x, y, len = 300, rot = -20 }) {
  const w = len, h = 70;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);transform-origin:right center;filter:drop-shadow(0 10px 8px rgba(0,0,0,.45))`)}" viewBox="0 0 300 70" aria-hidden="true">
    <rect x="0" y="12" width="70" height="46" rx="8" fill="#c8cdd1"/><path d="M0 14 L-18 4 V66 L0 56 Z" fill="#8f979d"/>
    <ellipse cx="2" cy="35" rx="6" ry="22" fill="#fff6c9"/>
    <rect x="60" y="20" width="200" height="30" rx="8" fill="#e7b23f"/><rect x="60" y="20" width="200" height="8" rx="4" fill="#fff" opacity=".35"/>
    <rect x="120" y="14" width="16" height="42" fill="#2a2f33"/><rect x="150" y="14" width="16" height="42" fill="#2a2f33"/>
    <rect x="258" y="24" width="38" height="22" rx="8" fill="#2f3438"/><rect x="190" y="26" width="26" height="12" rx="6" fill="#f2f4f5"/></svg>`;
}

/** A plate sticker (white label with grey code lines). */
const plateSticker = (x, y, w = 40, h = 26, rot = 0) =>
  `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="#8d9892" stroke-width="1.6"/><rect x="${x + 5}" y="${y + 5}" width="${w * 0.55}" height="3.5" rx="1.5" fill="#7b8680"/><rect x="${x + 5}" y="${y + 12}" width="${w * 0.75}" height="3.5" rx="1.5" fill="#7b8680"/><rect x="${x + 5}" y="${y + 19}" width="${w * 0.4}" height="3.5" rx="1.5" fill="#7b8680"/></g>`;

/** A sage ring and a little tag pointing at a sticker. */
const marker = (cx, cy, tx, ty) =>
  `<circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="${C.sage}" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="26" fill="${C.sage}" opacity=".12"/><path d="M${cx + (tx > cx ? 22 : -22)} ${cy + (ty > cy ? 18 : -18)} L${tx} ${ty}" stroke="${C.sage}" stroke-width="5" stroke-linecap="round"/><rect x="${tx - 26}" y="${ty - 14}" width="52" height="28" rx="8" fill="${C.sage}"/><rect x="${tx - 12}" y="${ty - 3}" width="24" height="5" rx="2.5" fill="#fff"/>`;

/* ---------- the four appliances of pin 2 (viewBox 400 x 260) ---------- */

const frontLoad = () => `<svg viewBox="0 0 400 260" width="100%" height="100%" aria-hidden="true">
  <ellipse cx="200" cy="254" rx="150" ry="9" fill="#000" opacity=".16"/>
  <rect x="96" y="10" width="216" height="240" rx="14" fill="#f4f6f4" stroke="#bcc6bf" stroke-width="2"/>
  <rect x="96" y="10" width="216" height="52" rx="14" fill="#e3e9e4"/><rect x="96" y="48" width="216" height="14" fill="#e3e9e4"/>
  <circle cx="134" cy="36" r="14" fill="#fbfcfb" stroke="#9aa59e" stroke-width="2.5"/><path d="M134 36 L141 28" stroke="#6d7872" stroke-width="3" stroke-linecap="round"/>
  <rect x="196" y="25" width="62" height="22" rx="4" fill="#2c3b36"/><rect x="204" y="32" width="26" height="4" rx="2" fill="#8fd1a6"/><circle cx="282" cy="36" r="7" fill="#c4cdc7"/>
  <circle cx="204" cy="152" r="80" fill="#cdd5d0" stroke="#a7b2ab" stroke-width="3"/>
  <circle cx="204" cy="152" r="64" fill="#1f2a27"/><circle cx="204" cy="152" r="46" fill="#2c3a35"/><circle cx="204" cy="152" r="24" fill="#3a4b45"/>
  <path d="M148 120 A64 64 0 0 1 190 92" stroke="#fff" stroke-opacity=".18" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M130 70 L124 70 C 66 80 50 120 50 152 C 50 190 66 226 124 236 L130 236 Z" fill="#d7ebe6" fill-opacity=".85" stroke="#a9bdb7" stroke-width="3"/>
  <ellipse cx="94" cy="152" rx="30" ry="62" fill="none" stroke="#b9cbc6" stroke-width="3"/>
  <rect x="124" y="136" width="10" height="34" rx="4" fill="#9aa59e"/>
  ${plateSticker(242, 206, 40, 26, -35)}
  ${marker(262, 218, 332, 176)}
</svg>`;

const topLoad = () => `<svg viewBox="0 0 400 260" width="100%" height="100%" aria-hidden="true">
  <ellipse cx="200" cy="254" rx="130" ry="9" fill="#000" opacity=".16"/>
  <path d="M116 78 L108 18 H292 L284 78 Z" fill="#cfd8d2" stroke="#a7b2ab" stroke-width="2.5"/><path d="M122 70 L116 26 H284 L278 70 Z" fill="#dfe6e1"/>
  <rect x="102" y="70" width="196" height="180" rx="12" fill="#f4f6f4" stroke="#bcc6bf" stroke-width="2"/>
  <rect x="102" y="70" width="196" height="34" rx="10" fill="#e3e9e4"/>
  <circle cx="140" cy="87" r="11" fill="#fbfcfb" stroke="#9aa59e" stroke-width="2.5"/><circle cx="176" cy="87" r="11" fill="#fbfcfb" stroke="#9aa59e" stroke-width="2.5"/>
  <rect x="222" y="77" width="56" height="20" rx="4" fill="#2c3b36"/><rect x="230" y="84" width="22" height="4" rx="2" fill="#8fd1a6"/>
  <ellipse cx="200" cy="140" rx="84" ry="26" fill="#cdd5d0" stroke="#a7b2ab" stroke-width="2.5"/>
  <ellipse cx="200" cy="138" rx="70" ry="19" fill="#1f2a27"/><ellipse cx="200" cy="140" rx="30" ry="7" fill="#33443e"/>
  <rect x="126" y="196" width="148" height="30" rx="8" fill="#e9eeea" stroke="#c4cdc7" stroke-width="2"/>
  ${plateSticker(172, 154, 44, 26, 0)}
  ${marker(194, 167, 296, 218)}
</svg>`;

const fridge = () => `<svg viewBox="0 0 400 260" width="100%" height="100%" aria-hidden="true">
  <ellipse cx="200" cy="254" rx="130" ry="9" fill="#000" opacity=".16"/>
  <rect x="150" y="6" width="190" height="246" rx="12" fill="#eef2ef" stroke="#bcc6bf" stroke-width="2"/>
  <rect x="162" y="18" width="166" height="222" rx="6" fill="#fcfefc" stroke="#d5ddd7" stroke-width="2"/>
  <rect x="162" y="74" width="166" height="8" fill="#e0e8e2"/>
  <path d="M162 130 H328 M162 184 H328" stroke="#cfd9d2" stroke-width="5"/>
  <rect x="244" y="92" width="22" height="38" rx="4" fill="#d9ecdc"/><rect x="276" y="106" width="30" height="24" rx="4" fill="#f0e2b8"/><rect x="178" y="142" width="42" height="42" rx="6" fill="#f2d4cd"/><rect x="240" y="152" width="54" height="32" rx="5" fill="#d7e4e8"/>
  <path d="M150 6 L70 26 V240 L150 252 Z" fill="#dfe6e1" stroke="#aab5ae" stroke-width="2.5"/>
  <rect x="82" y="46" width="12" height="76" rx="5" fill="#a5afa8"/><path d="M78 100 H146 M78 168 H146" stroke="#cdd6d0" stroke-width="3"/>
  ${plateSticker(166, 36, 40, 26, 0)}
  ${marker(186, 49, 112, 24)}
</svg>`;

const dishwasher = () => `<svg viewBox="0 0 400 260" width="100%" height="100%" aria-hidden="true">
  <ellipse cx="200" cy="254" rx="150" ry="9" fill="#000" opacity=".16"/>
  <rect x="86" y="14" width="228" height="170" rx="12" fill="#eef2ef" stroke="#bcc6bf" stroke-width="2"/>
  <rect x="86" y="14" width="228" height="20" rx="10" fill="#d9e1db"/><rect x="190" y="19" width="44" height="9" rx="4" fill="#2c3b36"/>
  <rect x="100" y="42" width="200" height="136" rx="6" fill="#d7ddd9" stroke="#a9b4ad" stroke-width="2"/>
  <rect x="108" y="50" width="184" height="118" rx="4" fill="#bfc9c3"/>
  ${Array.from({ length: 9 }, (_, k) => `<path d="M${118 + k * 20} 62 V150" stroke="#8f9b94" stroke-width="3"/>`).join("")}
  <path d="M112 84 H288 M112 114 H288 M112 144 H288" stroke="#8f9b94" stroke-width="3"/>
  <rect x="150" y="92" width="38" height="34" rx="6" fill="#f6f2e8" stroke="#a9b4ad" stroke-width="2"/><rect x="214" y="100" width="46" height="26" rx="5" fill="#f1ddd6"/>
  <path d="M86 196 L314 196 L344 254 L56 254 Z" fill="#e3e9e5" stroke="#aab5ae" stroke-width="2.5"/>
  <rect x="116" y="206" width="168" height="12" rx="6" fill="#a8b2ab"/>
  ${plateSticker(236, 168, 40, 22, 0)}
  ${marker(256, 179, 338, 130)}
</svg>`;

/* ---------- pin 2: where is the model number ---------- */
function pin2() {
  const i = idea(2);
  const arts = [frontLoad(), topLoad(), fridge(), dishwasher()];
  const tile = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><pattern id="t2" width="120" height="70" patternUnits="userSpaceOnUse"><rect width="120" height="70" fill="#eaf0e6"/><rect x="2" y="2" width="116" height="31" rx="4" fill="#f6faf3"/><rect x="-58" y="37" width="116" height="31" rx="4" fill="#f6faf3"/><rect x="62" y="37" width="116" height="31" rx="4" fill="#f6faf3"/></pattern></defs><rect width="1000" height="1500" fill="url(#t2)"/><rect width="1000" height="1500" fill="#bcd0bf" opacity=".28"/></svg>`;
  const cells = i.items.map((s, k) => {
    const [label, text] = split(s);
    const x = k % 2 ? 512 : 36, y = k < 2 ? 394 : 868;
    return `<div style="${abs(x, y, 452, 448, `background:${C.wash};border:3px solid ${C.rule};border-radius:26px;box-shadow:0 14px 26px rgba(40,70,50,.22)`)}">
      <div style="${abs(14, 12, 424, 275)}">${arts[k]}</div>
      <div data-check="label" style="${abs(14, 290, 424, 144, `background:${C.kraft};border-radius:16px;padding:14px 18px;color:${C.ink};box-shadow:inset 0 0 0 2px rgba(60,40,10,.18)`)}"><div style="font:700 28px/1.1 'Plex',sans-serif">${esc(label)}</div><div style="font:500 24px/1.28 'Plex',sans-serif;margin-top:8px">${esc(text)}</div></div>
    </div>`;
  }).join("");
  return printable({ n: 2, paper: "#e9efe4", scene: `${tile}${cells}` });
}

/* ---------- pin 4: what a data plate says ---------- */
function pin4() {
  const i = idea(4);
  const rows = i.items.map((s) => {
    const k = s.indexOf(" ", s.indexOf("/") > 0 && s.startsWith("VOLTS") ? s.indexOf("WATTS") + 6 : 0);
    const [head, meaning] = split(s);
    // head is "MODEL ABC1234XYZ" / "SERIAL VF1234567" / "VOLTS / WATTS 240V, 5400W"
    const m = head.match(/^(VOLTS \/ WATTS|MODEL|SERIAL) (.+)$/);
    return { label: m[1], value: m[2], meaning };
  });
  const steel = `<div style="${abs(0, 0, 1000, 1500, "background:linear-gradient(180deg,#323b39 0,#1c2220 100%)")}"></div><div style="${abs(0, 0, 1000, 1500, "background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 4px)")}"></div>`;
  const rowH = 232, top = 400;
  const plate = `<div style="${abs(40, top, 480, rowH * 3 + 26, "border-radius:24px;background:linear-gradient(135deg,#eef0f1 0,#b4babe 38%,#dfe3e5 58%,#a3aaaf 100%);box-shadow:0 3px 4px rgba(0,0,0,.5),0 26px 44px rgba(0,0,0,.55),inset 0 0 0 4px rgba(255,255,255,.45),inset 0 0 0 8px rgba(70,80,88,.25)")}">
    ${[[18, 18], [442, 18], [18, 666], [442, 666]].map(([a, b]) => `<div style="${abs(a, b, 20, 20, "border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#8a9298);box-shadow:0 1px 2px rgba(0,0,0,.5)")}"></div>`).join("")}
    ${rows.map((r, k) => `<div data-check="plate row" style="${abs(34, 20 + k * rowH, 412, rowH - 10, `border-top:${k ? "3px solid rgba(60,70,78,.35)" : "0"};padding-top:44px`)}"><div style="font:600 26px 'Plex',sans-serif;letter-spacing:.2em;color:#46515a">${esc(r.label)}</div><div class="mono" style="font:600 ${r.value.length > 11 ? 46 : 56}px 'Plex Mono',monospace;color:#161c20;margin-top:14px;letter-spacing:-.01em;white-space:nowrap">${esc(r.value)}</div></div>`).join("")}
    <div class="example" style="${abs(318, 48, 140, 40, "display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#161c20;background:rgba(255,255,255,.55);padding:0")}">Example</div>
  </div>`;
  const cards = rows.map((r, k) => {
    const y = top + 26 + k * rowH + 8;
    return `<svg style="${abs(520, y + 82, 74, 40)}" viewBox="0 0 74 40" aria-hidden="true"><path d="M2 20 H52" stroke="${sageLight}" stroke-width="7" stroke-linecap="round"/><path d="M46 4 L70 20 L46 36" fill="none" stroke="${sageLight}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div data-check="meaning" style="${abs(598, y, 366, rowH - 28, `background:${C.kraft};border-radius:18px;padding:18px 22px;display:flex;align-items:center;font:500 27px/1.3 'Plex',sans-serif;color:${C.ink};box-shadow:0 12px 22px rgba(0,0,0,.45),inset 0 0 0 2px rgba(60,40,10,.2)`)}"><span>${esc(r.meaning)}</span></div>`;
  }).join("");
  const door = `<svg style="${abs(0, 1000, 1000, 500)}" viewBox="0 0 1000 500" aria-hidden="true"><defs><linearGradient id="ring4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f7"/><stop offset=".5" stop-color="#9ba2a7"/><stop offset="1" stop-color="#d9dde0"/></linearGradient><radialGradient id="glass4" cx="35%" cy="25%" r="80%"><stop offset="0" stop-color="#4a5a60"/><stop offset="1" stop-color="#0f1517"/></radialGradient></defs>
    <circle cx="500" cy="570" r="420" fill="#2a3230"/><circle cx="500" cy="570" r="400" fill="url(#ring4)"/><circle cx="500" cy="570" r="352" fill="#566068"/><circle cx="500" cy="570" r="336" fill="url(#glass4)"/>
    <path d="M230 240 A330 330 0 0 1 420 180" stroke="#fff" stroke-opacity=".22" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M560 172 A330 330 0 0 1 650 190" stroke="#fff" stroke-opacity=".14" stroke-width="8" fill="none" stroke-linecap="round"/></svg>`;
  return printable({ n: 4, paper: "#e4e7e6", scene: `${steel}${door}${plate}${cards}`, extraCss: ".mono{font-family:'Plex Mono',monospace}" });
}

/* ---------- pin 6: model vs serial ---------- */
function pin6() {
  const i = idea(6);
  const [mLabel, mText] = split(i.items[0]);
  const [sLabel, sText] = split(i.items[1]);
  const wall = `<div style="${abs(0, 0, 1000, 1500, "background:#f1dc9a")}"></div><div style="${abs(0, 0, 1000, 1500, "background:repeating-linear-gradient(90deg,rgba(120,80,0,.10) 0 3px,rgba(255,255,255,.18) 3px 6px,transparent 6px 84px)")}"></div>
  <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 30% 20%,rgba(255,255,255,.35),transparent 60%)")}"></div>`;
  const line = `<svg style="${abs(0, 380, 1000, 90)}" viewBox="0 0 1000 90" aria-hidden="true"><path d="M-10 30 Q 250 78 500 58 T 1010 34" fill="none" stroke="#6f6a5c" stroke-width="5"/></svg>`;
  const peg = (x, y, rot = 0) => `<svg style="${abs(x, y, 34, 96, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 4px rgba(60,40,0,.4))`)}" viewBox="0 0 34 96" aria-hidden="true"><rect x="4" y="0" width="12" height="94" rx="5" fill="#d9a766"/><rect x="18" y="0" width="12" height="94" rx="5" fill="#c58f4c"/><rect x="14" y="26" width="6" height="30" fill="#8a8f95"/></svg>`;
  const bag = `<svg style="${abs(120, 640, 270, 250)}" viewBox="0 0 270 250" aria-hidden="true"><path d="M30 60 L240 60 L252 244 H18 Z" fill="${C.kraft}"/><path d="M30 60 L240 60 L244 98 H26 Z" fill="#b8935f"/><path d="M60 60 V40 L210 40 V60" fill="#b8935f"/><path d="M30 60 L18 244 H62 L64 60 Z" fill="#fff" opacity=".12"/><rect x="108" y="108" width="54" height="22" rx="4" fill="#f6f0e4"/><path d="M10 244 H260" stroke="#000" stroke-opacity=".12" stroke-width="3"/>
    <g transform="translate(104 4) rotate(12 40 20)"><rect x="0" y="22" width="92" height="22" rx="6" fill="#b9c0c5"/><rect x="18" y="14" width="56" height="38" rx="8" fill="#d6dbde"/><rect x="26" y="22" width="40" height="22" rx="5" fill="#8f979d"/></g></svg>`;
  const mini = `<svg style="${abs(150, 654, 220, 240)}" viewBox="0 0 220 240" aria-hidden="true"></svg>`;
  const washerSmall = `<svg style="${abs(600, 640, 250, 250)}" viewBox="0 0 250 250" aria-hidden="true"><ellipse cx="100" cy="244" rx="86" ry="8" fill="#000" opacity=".16"/><rect x="26" y="30" width="148" height="210" rx="12" fill="#f4f6f4" stroke="#bcc6bf" stroke-width="2"/><rect x="26" y="30" width="148" height="40" rx="12" fill="#e3e9e4"/><circle cx="54" cy="50" r="10" fill="#fbfcfb" stroke="#9aa59e" stroke-width="2.5"/><rect x="98" y="40" width="50" height="18" rx="4" fill="#2c3b36"/><circle cx="100" cy="150" r="58" fill="#cdd5d0" stroke="#a7b2ab" stroke-width="3"/><circle cx="100" cy="150" r="44" fill="#1f2a27"/><circle cx="100" cy="150" r="28" fill="#2c3a35"/>
    <g transform="translate(150 70) rotate(8)"><rect width="92" height="124" rx="10" fill="#fbfaf6" stroke="#b9c3bb" stroke-width="2.5"/><rect x="0" y="0" width="92" height="30" rx="10" fill="${C.sage}"/><path d="M26 76 L40 90 L68 58" fill="none" stroke="${C.sage}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="104" width="64" height="6" rx="3" fill="#c3cbc4"/></g></svg>`;
  const card = (x, rot, label, text, art, pegX) => `
    <div style="${abs(x, 440, 440, 630, `transform:rotate(${rot}deg);transform-origin:50% 0`)}">
      <div style="${abs(0, 20, 440, 610, `background:${C.paperLight};border-radius:10px;box-shadow:0 3px 4px rgba(60,40,0,.3),0 26px 40px rgba(60,40,0,.35)`)}"></div>
      <div data-check="${esc(label)}" style="${abs(26, 84, 388, 250)}"><div style="font:500 66px/1 'Newsreader',Georgia,serif;color:${C.sageDeep};letter-spacing:-.02em">${esc(label)}</div><div style="font:500 26px/1.32 'Plex',sans-serif;color:${C.ink};margin-top:16px">${esc(text)}</div></div>
      ${art}
      ${peg(pegX, -30)}${peg(pegX + 170, -30)}
    </div>`;
  const left = card(40, -1.4, mLabel, mText, `<div style="position:absolute;left:36px;top:352px;width:270px;height:250px">${bag.replace(/left:120px;top:640px/, "left:0px;top:0px")}</div>`, 6);
  const right = card(520, 1.2, sLabel, sText, `<div style="position:absolute;left:70px;top:352px;width:250px;height:250px">${washerSmall.replace(/left:600px;top:640px/, "left:0px;top:0px")}</div>`, 6);
  // The plate: MODEL and SERIAL rows highlighted in sage; values are a barcode strip, never invented numbers.
  const bars = (w, seed) => { let s = seed, x = 0, out = ""; while (x < w) { s = (s * 9301 + 49297) % 233280; const bw = 3 + (s % 5); out += `<rect x="${x}" y="0" width="${bw}" height="46" fill="#2b3338"/>`; x += bw + 3 + (s % 4); } return out; };
  const half = (x, label, seed) => `<div style="${abs(x, 1110, 440, 200, `background:${C.sage};border-radius:16px;padding:24px 26px;box-shadow:inset 0 0 0 3px rgba(255,255,255,.45)`)}"><div style="font:700 36px 'Plex',sans-serif;letter-spacing:.2em;color:#fff">${esc(label)}</div><svg viewBox="0 0 388 46" style="margin-top:22px;width:388px;height:62px;background:#eef0f1;padding:8px 10px;border-radius:6px" preserveAspectRatio="none" aria-hidden="true">${bars(366, seed)}</svg></div>`;
  const plate = `<div style="${abs(24, 1086, 952, 250, "border-radius:26px;background:linear-gradient(135deg,#eef0f1 0,#b4babe 40%,#dfe3e5 60%,#a3aaaf 100%);box-shadow:0 3px 4px rgba(60,40,0,.4),0 22px 36px rgba(60,40,0,.4),inset 0 0 0 4px rgba(255,255,255,.5)")}"></div>${half(46, "MODEL", 7)}${half(514, "SERIAL", 31)}`;
  return printable({ n: 6, paper: "#f6edd0", scene: `${wall}${line}${left}${right}${plate}` });
}

/* ---------- pin 8: save the model number (five steps) ---------- */
function pin8() {
  const i = idea(8);
  const steel = `<div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 70% 80%,#33443f 0,#1c2724 55%,#0d1311 100%)")}"></div><div style="${abs(0, 0, 1000, 1500, "background-image:radial-gradient(circle,rgba(0,0,0,.55) 0 5px,transparent 6px);background-size:34px 34px;opacity:.55")}"></div>`;
  const beam = `<svg style="${abs(0, 372, 1000, 982)}" viewBox="0 0 1000 982" aria-hidden="true"><defs><linearGradient id="bm8" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#fff6c9" stop-opacity=".5"/><stop offset="1" stop-color="#fff6c9" stop-opacity=".04"/></linearGradient></defs><path d="M700 930 L-60 330 L40 -40 Z" fill="url(#bm8)"/></svg>`;
  const icons = ["door-open", "flashlight", "camera", "keyboard", "calendar-blank"];
  const cardH = 150, gap = 20, y0 = 396;
  const rail = `<div style="${abs(98, y0 + 60, 5, (cardH + gap) * 4, `background:repeating-linear-gradient(180deg,${sageLight} 0 14px,transparent 14px 24px)`)}"></div>`;
  const steps = i.items.map((s, k) => {
    const y = y0 + k * (cardH + gap);
    return `<div style="${abs(40, y + 30, 120, 90, "display:flex;align-items:center;justify-content:center")}"><div style="width:90px;height:90px;border-radius:50%;background:${C.sage};border:5px solid ${sageLight};display:grid;place-items:center;font:600 50px 'Newsreader',serif;color:#fff;box-shadow:0 8px 16px rgba(0,0,0,.5)">${k + 1}</div></div>
    <div data-check="step ${k + 1}" style="${abs(176, y, 784, cardH, `background:${C.kraft};border-radius:20px;display:flex;align-items:center;gap:22px;padding:0 26px 0 22px;box-shadow:0 14px 24px rgba(0,0,0,.5),inset 0 0 0 2px rgba(60,40,10,.2)`)}"><div style="flex:none;width:92px;height:92px;border-radius:20px;background:${C.paperLight};display:grid;place-items:center;box-shadow:inset 0 0 0 2px rgba(60,40,10,.18)">${icon(icons[k], { size: 56, color: C.sageDeep, weight: "duotone" })}</div><div style="font:500 29px/1.28 'Plex',sans-serif;color:${C.ink}">${esc(s)}</div></div>`;
  }).join("");
  return printable({ n: 8, paper: "#dfe7e2", scene: `${steel}${beam}${rail}${steps}${flashlight({ x: 690, y: 1262, len: 300, rot: -3 })}` });
}

/* ---------- pin 10: worn-off sticker ---------- */
function pin10() {
  const i = idea(10);
  const stripes = `<div style="${abs(0, 0, 1000, 1500, "background:#d9b4ac")}"></div><div style="${abs(0, 0, 1000, 1500, "background:repeating-linear-gradient(180deg,transparent 0 120px,rgba(255,255,255,.35) 120px 190px,transparent 190px 232px,rgba(120,50,50,.18) 232px 240px)")}"></div><div style="${abs(0, 0, 1000, 1500, "background-image:radial-gradient(circle,rgba(255,255,255,.2) 0 1.6px,transparent 2px);background-size:14px 14px")}"></div>`;
  const rim = `<svg style="${abs(0, 380, 1000, 290)}" viewBox="0 0 1000 290" aria-hidden="true"><defs><linearGradient id="rim10" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e5eae7"/><stop offset="1" stop-color="#b9c3bd"/></linearGradient></defs>
    <rect x="20" y="14" width="960" height="240" rx="40" fill="#000" opacity=".2" transform="translate(0 12)"/>
    <rect x="20" y="14" width="960" height="240" rx="40" fill="url(#rim10)" stroke="#aab4ae" stroke-width="3"/>
    <path d="M60 36 H940" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
    <g transform="rotate(-1.5 360 136)"><rect x="150" y="62" width="420" height="150" rx="8" fill="#e7e1cd" stroke="#bdb6a0" stroke-width="2"/>
      <path d="M170 98 H440 M170 134 H520 M170 170 H400" stroke="#a79f88" stroke-width="12" stroke-linecap="round" opacity=".32"/><rect x="170" y="86" width="180" height="24" fill="#e7e1cd" opacity=".55"/>
      <path d="M520 62 H570 V150 C 548 140 530 112 520 62 Z" fill="#e7e1cd"/>
      <path d="M570 62 L570 150 C 590 176 628 178 640 150 C 648 120 600 84 570 62 Z" fill="#cbc4ad" stroke="#a79f88" stroke-width="2"/><path d="M574 70 C 600 92 628 118 630 146" stroke="#f5f1e3" stroke-width="3" fill="none"/>
      <path d="M200 190 L300 70 M420 200 L470 90" stroke="#b7b09a" stroke-width="2" opacity=".7"/></g>
    <circle cx="880" cy="134" r="46" fill="#cbd3ce" stroke="#aab4ae" stroke-width="3"/><circle cx="880" cy="134" r="34" fill="#dfe5e1"/>
  </svg>`;
  const props = [
    // receipt
    `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><path d="M26 6 H94 V108 L84 100 L74 108 L64 100 L54 108 L44 100 L34 108 L26 100 Z" fill="#fbfaf6" stroke="#b9b3a2" stroke-width="2.5"/><path d="M40 28 H80 M40 46 H80 M40 64 H68" stroke="#9aa39d" stroke-width="6" stroke-linecap="round"/><rect x="40" y="80" width="30" height="8" rx="3" fill="${C.sage}"/></svg>`,
    // manual and box
    `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><path d="M60 38 L108 54 V104 L60 112 Z" fill="#b8935f"/><path d="M60 38 L12 54 V104 L60 112 Z" fill="#cfa974"/><path d="M12 54 L60 70 L108 54 L60 38 Z" fill="#dcba87"/><path d="M60 70 V112" stroke="#8d6d3f" stroke-width="2"/><rect x="26" y="4" width="48" height="62" rx="4" fill="#f4f1e8" stroke="#aeb7b0" stroke-width="2.5" transform="rotate(-10 50 35)"/><rect x="36" y="14" width="26" height="8" rx="3" fill="${C.sage}" transform="rotate(-10 50 35)"/></svg>`,
    // repair invoice with wrench
    `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><rect x="14" y="8" width="70" height="98" rx="5" fill="#fbfaf6" stroke="#b9b3a2" stroke-width="2.5"/><path d="M26 28 H70 M26 44 H70 M26 60 H56" stroke="#9aa39d" stroke-width="6" stroke-linecap="round"/><g transform="translate(62 54)">${icon("wrench", { size: 56, color: C.sageDeep, weight: "fill" }).replace("<svg", '<svg x="0" y="0"')}</g></svg>`,
    // retailer account: a phone
    `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><rect x="30" y="4" width="60" height="112" rx="12" fill="#2a2f33"/><rect x="36" y="14" width="48" height="92" rx="6" fill="#f2f6f3"/><circle cx="60" cy="42" r="10" fill="${C.sage}"/><path d="M40 70 C 40 56 80 56 80 70 V 78 H40 Z" fill="${C.sage}"/><rect x="42" y="88" width="36" height="8" rx="4" fill="#c3cbc4"/></svg>`,
  ];
  const cardH = 138, gap = 24, y0 = 700;
  const rail = `<div style="${abs(86, y0 + 40, 8, (cardH + gap) * 3 + 20, `background:${C.sage};border-radius:4px;opacity:.9`)}"></div>`;
  const cards = i.items.map((s, k) => {
    const y = y0 + k * (cardH + gap);
    return `<div style="${abs(40, y + 24, 92, 92, "display:grid;place-items:center")}"><div style="width:64px;height:64px;border-radius:50%;background:${C.sage};border:5px solid #fff;display:grid;place-items:center;font:600 34px 'Newsreader',serif;color:#fff;box-shadow:0 6px 12px rgba(80,30,30,.4)">${k + 1}</div></div>
    <div data-check="rung ${k + 1}" style="${abs(130, y, 830, cardH, `background:${C.kraft};border-radius:20px;display:flex;align-items:center;gap:22px;padding:0 28px 0 18px;box-shadow:0 14px 22px rgba(80,30,30,.38),inset 0 0 0 2px rgba(60,40,10,.2)`)}"><div style="flex:none;width:108px;height:108px;background:${C.paperLight};border-radius:18px;padding:6px;box-shadow:inset 0 0 0 2px rgba(60,40,10,.15)">${props[k]}</div><div style="font:500 29px/1.28 'Plex',sans-serif;color:${C.ink}">${esc(s)}</div></div>`;
  }).join("");
  return printable({ n: 10, paper: "#f1e2de", scene: `${stripes}${rim}${rail}${cards}` });
}

/* ---------- pin 12: five fields, held to a washer with a magnet ---------- */
function pin12() {
  const i = idea(12);
  const enamel = `<div style="${abs(0, 0, 1000, 1500, "background:linear-gradient(100deg,#e9eff0 0,#dbe3e5 55%,#c8d2d5 100%)")}"></div>
  <div style="${abs(0, 0, 1000, 1500, "background:radial-gradient(ellipse at 22% 18%,rgba(255,255,255,.7),transparent 55%)")}"></div>
  <div style="${abs(930, 372, 8, 982, "background:linear-gradient(90deg,rgba(0,0,0,.14),rgba(255,255,255,.4))")}"></div>`;
  const magnet = (x, y, c) => `<div style="${abs(x, y, 70, 70, `border-radius:50%;background:radial-gradient(circle at 35% 30%,${c[0]},${c[1]});box-shadow:0 6px 8px rgba(30,40,45,.45),inset 0 -4px 6px rgba(0,0,0,.2);z-index:3`)}"></div>`;
  const rows = i.items.map((s, k) => {
    const warranty = s.startsWith("When the warranty ends");
    const text = warranty
      ? `When the <span style="box-shadow:inset 0 -9px 0 rgba(138,90,17,.35);border-bottom:4px solid ${C.ochre}">warranty ends</span>${esc(s.slice("When the warranty ends".length))}`
      : esc(s);
    return `<div data-check="line ${k + 1}" style="display:flex;gap:22px;align-items:flex-start;padding:22px 0;border-bottom:2px solid ${C.rule}"><div style="flex:none;width:44px;height:44px;margin-top:4px;border:4px solid ${C.sage};border-radius:10px;background:#fff"></div><div style="font:500 33px/1.3 'Plex',sans-serif;color:${C.ink}">${text}</div></div>`;
  }).join("");
  const paperSheet = `<div style="${abs(60, 430, 640, 790, "transform:rotate(-1.6deg)")}">
    <div style="${abs(0, 0, 640, 790, `background:${C.paperLight};border-radius:6px;box-shadow:0 2px 3px rgba(30,40,45,.3),0 24px 40px rgba(30,40,45,.35)`)}"></div>
    <div style="${abs(40, 78, 560, 780)}">${rows}</div>
    ${magnet(90, -26, ["#f4d27c", C.amber])}${magnet(480, -22, ["#bfe0c8", C.sage])}
  </div>`;
  const sketch = `<svg style="${abs(736, 470, 214, 280)}" viewBox="0 0 214 280" aria-hidden="true"><g fill="none" stroke="${C.sageDeep}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="10" width="190" height="260" rx="18"/><path d="M12 62 H202"/><circle cx="48" cy="36" r="10"/><rect x="108" y="26" width="64" height="20" rx="5"/><circle cx="107" cy="165" r="72"/><circle cx="107" cy="165" r="52"/></g></svg>`;
  return printable({ n: 12, paper: "#e3e9ea", scene: `${enamel}${paperSheet}${sketch}${detergent({ x: 770, y: 1060, h: 280, rot: 5 })}${towelStack({ x: 724, y: 880, w: 230, colors: ["#f3eee2", C.sageSoft, "#e9c8c0"], rot: -3 })}` });
}

/* ---------- pin 14: a filled dishwasher record ---------- */
function pin14() {
  const i = idea(14);
  const rows = i.items.map((s) => split(s));
  const sheetRows = rows.map(([label, value], k) => `<div data-check="row ${k + 1}" style="display:flex;gap:22px;padding:16px 0;border-bottom:2px solid ${C.rule};align-items:center;min-height:128px"><div style="flex:none;width:210px;font:600 24px/1.2 'Plex',sans-serif;letter-spacing:.04em;color:${C.sageDeep}">${esc(label)}</div><div style="font:600 42px/1.12 'Hand',cursive;color:#23395a">${esc(value)}</div></div>`).join("");
  const sheetEl = `<div style="${abs(110, 410, 780, 800, "transform:rotate(1.3deg)")}">
    <div style="${abs(0, 0, 780, 800, `background:${C.paperLight};border-radius:6px;border-top:10px solid ${C.sage};box-shadow:0 2px 3px rgba(40,20,5,.3),0 26px 44px rgba(40,20,5,.4)`)}"></div>
    <div class="example" style="${abs(612, 34, 140, 40, "display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;color:#4b4339;padding:0")}">Example</div>
    <div style="${abs(40, 96, 700, 680)}">${sheetRows}</div>
  </div>`;
  return printable({
    n: 14, paper: "#efe7da",
    scene: `${desk({ top: 0, height: 1500, base: "#c99b66", dark: "#b0834d", planks: 6, seed: 9 })}${sheetEl}${towelStack({ x: 30, y: 1196, w: 360, rot: 2, colors: ["#f3eee2", "#e9c8c0", C.sageSoft] })}${pencil({ x: 470, y: 1262, len: 360, rot: -4 })}${detergent({ x: 850, y: 1090, h: 250, rot: 6, body: "#d9873c" })}`,
  });
}

export const pins = [pin2(), pin4(), pin6(), pin8(), pin10(), pin12(), pin14()];
