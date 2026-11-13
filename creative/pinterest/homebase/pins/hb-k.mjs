/**
 * Group K: the snowy mudroom. Winterize guide pins #63, #65, #67, #69, #71, #73.
 * Every word is the idea bank's (headline, sub, items), the guide's own checklist
 * footnote (#65), or a label named in the idea's visual ("26°F" and "needs a look").
 * Props and scenes are drawn here; no printed page or app screen is shown.
 */
import { idea, C } from "../kit/bank.mjs";
import { printable } from "../kit/printable.mjs";
import { pencil } from "../kit/paper.mjs";
import { icon } from "../kit/icons.mjs";
import { esc } from "../../v3/kit.mjs";

const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;
const split = (s) => {
  const k = s.indexOf(": ");
  return k < 0 ? [s, ""] : [s.slice(0, k), s.slice(k + 2)];
};
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const SLATE = C.slate;
const exampleTag = (x, y, extra = "") =>
  `<div class="example" style="${abs(x, y, 150, 42, `display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;padding:0;${extra}`)}">Example</div>`;

/* ---------- mudroom props (flat vector, soft shadows) ---------- */

/** A knitted mitten (viewBox 120 x 160), cuff at the bottom. */
function mitten({ x, y, h = 190, rot = 0, body = "#f3eee2", band = C.sage, cuff = "#d8cdb8", flip = false }) {
  const w = h * 0.75;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg)${flip ? " scaleX(-1)" : ""};filter:drop-shadow(0 12px 9px rgba(20,30,25,.38))`)}" viewBox="0 0 120 160" aria-hidden="true">
    <path d="M30 118 V50 C30 14 44 4 60 4 C78 4 90 16 90 50 V76 C 96 68 106 60 112 66 C 118 74 108 96 94 108 L90 118 Z" fill="${body}"/>
    <path d="M30 118 V50 C30 14 44 4 60 4 C 46 14 44 40 44 70 V118 Z" fill="#fff" opacity=".28"/>
    <path d="M30 70 H90" stroke="${band}" stroke-width="9"/><path d="M30 86 H90" stroke="${band}" stroke-width="5" opacity=".7"/>
    <g fill="${band}"><path d="M60 24 l6 8 -6 8 -6 -8Z"/><path d="M44 44 l5 6 -5 6 -5 -6Z"/><path d="M76 44 l5 6 -5 6 -5 -6Z"/></g>
    <rect x="28" y="116" width="64" height="40" rx="6" fill="${cuff}"/>${[40, 52, 64, 76].map((a) => `<path d="M${a} 118 V154" stroke="#000" stroke-opacity=".12" stroke-width="3"/>`).join("")}</svg>`;
}

/** A thermos flask standing up (viewBox 110 x 300). */
function thermos({ x, y, h = 260, rot = 0, body = C.sageDeep, steel = "#c9ced1" }) {
  const w = h * (110 / 300);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 14px 10px rgba(20,30,25,.42))`)}" viewBox="0 0 110 300" aria-hidden="true">
    <rect x="14" y="6" width="82" height="62" rx="14" fill="${steel}"/><rect x="14" y="6" width="82" height="14" rx="7" fill="#fff" opacity=".4"/><rect x="22" y="32" width="66" height="8" rx="4" fill="#000" opacity=".12"/>
    <rect x="8" y="64" width="94" height="232" rx="20" fill="${body}"/><rect x="14" y="70" width="18" height="220" rx="9" fill="#fff" opacity=".2"/>
    <rect x="8" y="64" width="94" height="14" rx="6" fill="#000" opacity=".16"/><rect x="8" y="240" width="94" height="8" fill="#000" opacity=".16"/>
    <rect x="30" y="150" width="50" height="46" rx="8" fill="${C.cream}"/><path d="M55 160 C 55 160 42 176 42 182 a13 13 0 0 0 26 0 C 68 176 55 160 55 160 Z" fill="${C.sage}"/></svg>`;
}

/** A boot, side view (viewBox 220 x 260). */
function boot({ x, y, h = 250, rot = 0, body = "#3f5d57", sole = "#ece5d3", flip = false }) {
  const w = h * (220 / 260);
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg)${flip ? " scaleX(-1)" : ""};filter:drop-shadow(0 12px 9px rgba(20,30,25,.4))`)}" viewBox="0 0 220 260" aria-hidden="true">
    <path d="M58 8 H132 L138 140 C 140 168 214 168 214 214 V232 H14 V190 C 14 168 46 168 54 140 Z" fill="${body}"/>
    <path d="M58 8 H78 L76 148 C 70 172 32 176 22 200 V 224 H14 V190 C 14 168 46 168 54 140 Z" fill="#fff" opacity=".16"/>
    <rect x="52" y="8" width="86" height="26" rx="8" fill="#e5dcc4"/><path d="M52 34 H138" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
    <path d="M12 214 H216 V244 C216 252 210 254 202 254 H26 C16 254 12 250 12 244 Z" fill="${sole}"/>
    <g stroke="#000" stroke-opacity=".18" stroke-width="3">${Array.from({ length: 12 }, (_, k) => `<path d="M${26 + k * 16} 244 V252"/>`).join("")}</g>
    <path d="M96 60 H112 M96 80 H112 M96 100 H112" stroke="#d9d1bd" stroke-width="5" stroke-linecap="round"/></svg>`;
}

/** A rubber boot tray (top-down ellipse with a lip). */
const tray = ({ x, y, w = 320, h = 150, c = "#4b5753" }) =>
  `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 10px 8px rgba(20,30,25,.35))")}" viewBox="0 0 320 150" aria-hidden="true"><rect x="2" y="14" width="316" height="130" rx="22" fill="${c}"/><rect x="14" y="26" width="292" height="104" rx="14" fill="#000" opacity=".22"/><rect x="2" y="14" width="316" height="12" rx="6" fill="#fff" opacity=".18"/><g fill="#fff" opacity=".07">${Array.from({ length: 6 }, (_, k) => `<rect x="${34 + k * 46}" y="40" width="22" height="78" rx="8"/>`).join("")}</g></svg>`;

/** A row of wooden pegs/hooks on a rail; returns the rail only (pegs are placed by the caller). */
const peg = (x, y, len = 56) => `<svg style="${abs(x, y, 30, len + 16)}" viewBox="0 0 30 ${len + 16}" aria-hidden="true"><rect x="8" y="0" width="14" height="${len}" rx="5" fill="#b78650"/><rect x="8" y="0" width="5" height="${len}" fill="#fff" opacity=".2"/><ellipse cx="15" cy="${len}" rx="12" ry="8" fill="#c99b66"/></svg>`;

/** A wooden rail board. */
const rail = ({ x, y, w, h = 30, c = "#c99b66" }) =>
  `<div style="${abs(x, y, w, h, `background:linear-gradient(${c},#a9783f);border-radius:6px;box-shadow:0 3px 3px rgba(40,20,5,.3),0 14px 18px rgba(40,20,5,.3)`)}"></div>`;

/** A frosted window with snow falling outside (px box). */
function frostWindow({ x, y, w, h, id = "fw", sill = true }) {
  const dots = [];
  let s = 11;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < 70; k++) dots.push(`<circle cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(2 + rnd() * 4).toFixed(1)}" fill="#fff" opacity="${(0.55 + rnd() * 0.4).toFixed(2)}"/>`);
  const frost = [];
  for (let k = 0; k < 26; k++) {
    const edge = k % 4, t = rnd();
    const cx = edge === 0 ? t * w : edge === 1 ? w : edge === 2 ? t * w : 0, cy = edge === 0 ? 0 : edge === 1 ? t * h : edge === 2 ? h : t * h;
    frost.push(`<ellipse cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" rx="${(30 + rnd() * 70).toFixed(0)}" ry="${(24 + rnd() * 50).toFixed(0)}" fill="#fff" opacity="${(0.3 + rnd() * 0.3).toFixed(2)}"/>`);
  }
  const pines = [0.12, 0.3, 0.52, 0.76, 0.92].map((f, k) => {
    const px = f * w, ph = 70 + (k % 3) * 24;
    return `<path d="M${px} ${h - 6 - ph} l${ph * 0.32} ${ph * 0.5} h-${ph * 0.14} l${ph * 0.2} ${ph * 0.35} h-${ph * 0.5} h-${ph * 0.5} l${ph * 0.2} -${ph * 0.35} h-${ph * 0.14} Z" fill="#6f8a7a" opacity=".55" transform="translate(0 ${ph * 0.15})"/>`;
  }).join("");
  return `<svg style="${abs(x, y, w, h + (sill ? 30 : 0), "filter:drop-shadow(0 12px 14px rgba(20,30,40,.35))")}" viewBox="0 0 ${w} ${h + (sill ? 30 : 0)}" aria-hidden="true">
    <defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0e8"/><stop offset="1" stop-color="#eef4f6"/></linearGradient><filter id="${id}b"><feGaussianBlur stdDeviation="9"/></filter></defs>
    <rect width="${w}" height="${h}" rx="10" fill="#fbfaf6"/>
    <rect x="16" y="16" width="${w - 32}" height="${h - 32}" fill="url(#${id}g)"/>
    <g clip-path="inset(16px 16px ${h - (h - 16)}px 16px)"></g>
    <svg x="16" y="16" width="${w - 32}" height="${h - 32}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${pines}${dots.join("")}<g filter="url(#${id}b)">${frost.join("")}</g></svg>
    <rect x="${w / 2 - 8}" y="14" width="16" height="${h - 28}" fill="#fbfaf6"/><rect x="14" y="${h / 2 - 7}" width="${w - 28}" height="14" fill="#fbfaf6"/>
    <rect x="14" y="14" width="${w - 28}" height="${h - 28}" fill="none" stroke="#d7dcd6" stroke-width="2"/>
    ${sill ? `<rect x="-14" y="${h - 4}" width="${w + 28}" height="34" rx="6" fill="#f2efe6"/><rect x="-14" y="${h - 4}" width="${w + 28}" height="8" rx="4" fill="#fff"/><rect x="-14" y="${h + 22}" width="${w + 28}" height="8" fill="#000" opacity=".1"/>` : ""}</svg>`;
}

/** Vertical wall boards (beadboard or planks) as a full-pin background. */
function boards({ base, groove, light = "rgba(255,255,255,.18)", pitch = 56, top = 0, h = 1500 }) {
  return `<div style="${abs(0, top, 1000, h, `background:${base}`)}"></div><div style="${abs(0, top, 1000, h, `background:repeating-linear-gradient(90deg,${groove} 0 3px,${light} 3px 6px,transparent 6px ${pitch}px)`)}"></div><div style="${abs(0, top, 1000, h, "background:radial-gradient(ellipse at 28% 12%,rgba(255,255,255,.35),transparent 62%),radial-gradient(ellipse at 90% 100%,rgba(10,20,15,.25),transparent 60%)")}"></div>`;
}

/* =================== pin 63: the two days before the first hard freeze =================== */

function pin63() {
  const i = idea(63);
  const [wedL, wedT] = split(i.items[0]);
  const [thuL, thuT] = split(i.items[1]);

  const wed = `<svg viewBox="0 0 410 640" width="410" height="640" aria-hidden="true">
    <defs><linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd7e2"/><stop offset="1" stop-color="#f6ecc8"/></linearGradient><radialGradient id="wsun"><stop offset="0" stop-color="#fff3bf" stop-opacity=".95"/><stop offset="1" stop-color="#fff3bf" stop-opacity="0"/></radialGradient></defs>
    <rect width="410" height="640" fill="url(#wsky)"/><circle cx="336" cy="86" r="110" fill="url(#wsun)"/><circle cx="336" cy="86" r="42" fill="${C.butter}"/>
    <rect y="136" width="410" height="350" fill="#e6dfca"/>
    ${Array.from({ length: 12 }, (_, k) => `<rect y="${150 + k * 29}" width="410" height="4" fill="#b9b093" opacity=".7"/><rect y="${154 + k * 29}" width="410" height="3" fill="#fff" opacity=".35"/>`).join("")}
    <rect y="118" width="410" height="26" fill="#f4f1e8"/><rect y="142" width="410" height="6" fill="#000" opacity=".12"/>
    <g><rect x="42" y="190" width="132" height="168" fill="#fbfaf6"/><rect x="54" y="202" width="108" height="144" fill="#b5ccd6"/><path d="M54 202 L100 202 L54 260Z" fill="#fff" opacity=".25"/><rect x="104" y="202" width="6" height="144" fill="#fbfaf6"/><rect x="54" y="270" width="108" height="6" fill="#fbfaf6"/><rect x="32" y="354" width="152" height="14" rx="3" fill="#f4f1e8"/><rect x="32" y="364" width="152" height="4" fill="#000" opacity=".12"/></g>
    <rect x="368" y="148" width="20" height="338" fill="#c7cecb"/><rect x="368" y="148" width="7" height="338" fill="#fff" opacity=".35"/>
    <circle cx="222" cy="338" r="30" fill="#d6dad8"/><circle cx="222" cy="338" r="30" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
    <rect x="208" y="324" width="92" height="30" rx="12" fill="#b9bfbd"/><rect x="208" y="324" width="92" height="10" rx="5" fill="#fff" opacity=".5"/>
    <rect x="270" y="346" width="28" height="56" rx="6" fill="#b9bfbd"/><rect x="266" y="394" width="36" height="14" rx="3" fill="#8f9694"/>
    <rect x="248" y="300" width="8" height="26" fill="#8f9694"/><ellipse cx="252" cy="298" rx="30" ry="8" fill="#4f7a5c"/><ellipse cx="252" cy="295" rx="30" ry="6" fill="#6a9577"/>
    <rect y="486" width="410" height="154" fill="#b4bd9c"/><path d="M0 486 H410" stroke="#8a9374" stroke-width="5"/>
    ${Array.from({ length: 20 }, (_, k) => `<path d="M${(k * 61) % 410} ${506 + ((k * 37) % 120)} l8 -14 m-4 14 l-2 -12" stroke="#8c9674" stroke-width="3" fill="none" stroke-linecap="round"/>`).join("")}
    <g><rect x="18" y="520" width="104" height="62" rx="6" fill="#4f7a5c"/><rect x="18" y="520" width="104" height="14" rx="6" fill="#6a9577"/><rect x="34" y="544" width="30" height="24" rx="4" fill="#2f4a3b"/><rect x="76" y="544" width="30" height="24" rx="4" fill="#2f4a3b"/></g>
    <ellipse cx="270" cy="598" rx="120" ry="14" fill="#000" opacity=".16"/>
    ${[[112, 44], [84, 33], [56, 22], [28, 12]].map(([rx, ry], k) => `<ellipse cx="270" cy="${570 - k * 3}" rx="${rx}" ry="${ry}" fill="none" stroke="#5f7a3f" stroke-width="20"/><ellipse cx="270" cy="${566 - k * 3}" rx="${rx}" ry="${ry}" fill="none" stroke="#9db86c" stroke-width="4" opacity=".6"/>`).join("")}
    <path d="M160 580 C 120 600 90 606 70 612" stroke="#5f7a3f" stroke-width="20" fill="none" stroke-linecap="round"/><rect x="56" y="598" width="26" height="26" rx="4" fill="#c9a24a" transform="rotate(-20 69 611)"/>
  </svg>`;

  const thu = `<svg viewBox="0 0 410 640" width="410" height="640" aria-hidden="true">
    <rect width="410" height="640" fill="#e8e3d1"/>
    ${Array.from({ length: 14 }, (_, k) => `<rect x="${k * 30}" y="0" width="3" height="480" fill="#bdb59a" opacity=".5"/>`).join("")}
    <rect y="470" width="410" height="30" fill="#f4f1e8"/><rect y="470" width="410" height="5" fill="#000" opacity=".1"/>
    <rect y="500" width="410" height="140" fill="#b98b58"/>${[0, 1, 2, 3].map((k) => `<rect y="${500 + k * 36}" width="410" height="3" fill="#7d5a30" opacity=".4"/>`).join("")}
    <g><rect x="22" y="96" width="132" height="190" fill="#fbfaf6"/><rect x="34" y="108" width="108" height="166" fill="#cfe3ec"/><circle cx="60" cy="140" r="3" fill="#fff"/><circle cx="104" cy="180" r="3" fill="#fff"/><circle cx="78" cy="230" r="3" fill="#fff"/><circle cx="118" cy="128" r="3" fill="#fff"/><rect x="82" y="108" width="6" height="166" fill="#fbfaf6"/><rect x="34" y="186" width="108" height="6" fill="#fbfaf6"/><rect x="12" y="282" width="152" height="14" rx="3" fill="#f4f1e8"/></g>
    <rect x="164" y="214" width="214" height="24" rx="4" fill="#d9d3c2"/><rect x="164" y="214" width="214" height="7" fill="#fff" opacity=".5"/>
    <path d="M214 214 h110 v8 c0 18 -20 24 -55 24 s-55 -6 -55 -24 z" fill="#c9cfd0"/><rect x="262" y="152" width="14" height="62" rx="5" fill="#b9bfbd"/><path d="M262 156 C 262 134 306 134 306 156 V164 H296 V156 C 296 148 272 148 272 156 Z" fill="#b9bfbd"/>
    <rect x="172" y="238" width="198" height="262" fill="#37433e"/><rect x="172" y="238" width="198" height="14" fill="#000" opacity=".3"/>
    <rect x="172" y="238" width="198" height="262" fill="none" stroke="#f4f1e8" stroke-width="8"/>
    <g fill="none" stroke="#cdd5d2" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M230 252 V312"/><path d="M312 252 V312"/><path d="M230 312 V400 C 230 438 312 438 312 400 V 312"/><path d="M270 424 V470"/></g>
    <rect x="218" y="300" width="24" height="22" rx="4" fill="#9aa5a2"/><rect x="300" y="300" width="24" height="22" rx="4" fill="#9aa5a2"/>
    <path d="M172 238 L128 254 V484 L172 500 Z" fill="#efeadb" stroke="#bdb59a" stroke-width="3"/><circle cx="138" cy="368" r="6" fill="#9aa5a2"/><path d="M142 262 V474" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <path d="M370 238 L410 254 V484 L370 500 Z" fill="#efeadb" stroke="#bdb59a" stroke-width="3"/><circle cx="402" cy="368" r="6" fill="#9aa5a2"/>
    <ellipse cx="205" cy="598" rx="170" ry="16" fill="#000" opacity=".16"/>
    <g><rect x="14" y="470" width="196" height="116" rx="12" fill="#eef0ee" stroke="#b9c1be" stroke-width="3"/><rect x="14" y="470" width="196" height="26" rx="12" fill="#dfe4e1"/>
      <rect x="28" y="508" width="104" height="62" rx="6" fill="#cdd5d2"/>${Array.from({ length: 6 }, (_, k) => `<rect x="34" y="${514 + k * 9}" width="92" height="4" rx="2" fill="#8f9b97"/>`).join("")}
      <circle cx="162" cy="528" r="14" fill="#fbfcfb" stroke="#9aa59e" stroke-width="3"/><rect x="148" y="552" width="48" height="10" rx="4" fill="#2c3b36"/><rect x="152" y="555" width="20" height="3" rx="1.5" fill="#8fd1a6"/>
      <rect x="44" y="458" width="100" height="16" rx="8" fill="#9aa59e"/></g>
  </svg>`;

  const panel = (x, label, text, art, tone) => `
    <div style="${abs(x, 396, 410, 926, `background:${C.paperLight};border-radius:28px;box-shadow:0 4px 6px rgba(30,45,35,.3),0 28px 46px rgba(30,45,35,.38);overflow:hidden`)}">
      <div style="${abs(0, 0, 410, 640)}">${art}</div>
      <div style="${abs(0, 636, 410, 14, `background:${tone}`)}"></div>
      <div data-check="${esc(label)}" style="${abs(0, 664, 410, 262, "padding:0 22px")}"><div class="serif" style="font:500 42px/1.05 'Newsreader',serif;color:${C.sageDeep}">${esc(label)}</div><div style="font:500 26px/1.32 'Plex',sans-serif;color:${C.ink};margin-top:10px">${esc(cap(text))}</div></div>
    </div>`;

  const tube = `<div style="${abs(450, 400, 100, 920, "z-index:4")}">
    <svg viewBox="0 0 100 920" width="100" height="920" aria-hidden="true">
      <rect x="0" y="0" width="100" height="920" rx="26" fill="#fbfaf6" opacity="0"/>
      <rect x="27" y="170" width="46" height="590" rx="23" fill="#fbfaf6" stroke="#aeb9b2" stroke-width="3" style="filter:drop-shadow(0 8px 8px rgba(0,0,0,.3))"/>
      <circle cx="50" cy="800" r="56" fill="#fbfaf6" stroke="#aeb9b2" stroke-width="3"/>
      <circle cx="50" cy="800" r="40" fill="${SLATE}"/><rect x="40" y="520" width="20" height="290" fill="${SLATE}"/><rect x="40" y="520" width="20" height="10" rx="5" fill="${SLATE}"/>
      ${Array.from({ length: 24 }, (_, k) => `<path d="M${k % 4 === 0 ? 74 : 74} ${190 + k * 24} h${k % 4 === 0 ? 20 : 11}" stroke="#7d8a84" stroke-width="3"/>`).join("")}
      <path d="M2 520 H98" stroke="${C.sageDeep}" stroke-width="4" stroke-dasharray="8 6"/>
    </svg>
    <div style="${abs(0, 96, 100, 56, "display:grid;place-items:center;background:#fbfaf6;border-radius:14px;box-shadow:0 8px 14px rgba(0,0,0,.3);font:600 28px 'Plex Mono',monospace;color:#1a2420")}">26°F</div>
  </div>`;
  const tag = exampleTag(425, 408, "z-index:5;background:#fbfaf6;border-radius:8px;color:#4b4339;box-shadow:0 6px 10px rgba(0,0,0,.25)");

  const scene = `${boards({ base: "#cddacb", groove: "rgba(60,90,70,.22)", pitch: 50 })}
    ${rail({ x: 0, y: 1318, w: 1000, h: 36, c: "#d9c9a8" })}
    ${panel(40, wedL, wedT, wed, C.butter)}${panel(550, thuL, thuT, thu, C.sageSoft)}${tube}${tag}`;
  return printable({ n: 63, paper: "#e5eee4", scene });
}

/* =================== pin 65: the seven-job checklist on a clipboard =================== */

/** A foam faucet cover: a round-shouldered dome with a drawcord. */
const faucetCover = ({ x, y, w = 150 }) => `<svg style="${abs(x, y, w, w * 1.15, "filter:drop-shadow(0 12px 9px rgba(30,20,5,.4))")}" viewBox="0 0 150 172" aria-hidden="true">
  <path d="M75 4 V30" stroke="#6d7872" stroke-width="5"/><path d="M20 70 C 20 40 46 26 76 26 C 108 26 134 44 134 74 V150 C 134 164 124 168 110 168 H44 C 30 168 20 164 20 150 Z" fill="#7d96a1"/>
  <path d="M26 74 C 26 48 48 34 66 32 C 44 46 42 70 42 96 V160 C 32 160 26 156 26 148 Z" fill="#fff" opacity=".22"/>
  <rect x="20" y="118" width="114" height="10" fill="#000" opacity=".14"/><path d="M62 118 v10 M92 118 v10" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
  <path d="M124 126 C 146 128 148 152 130 160" stroke="#d8d0bd" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="130" cy="162" r="6" fill="#d8d0bd"/></svg>`;

/** A slit foam pipe sleeve hanging end-on. */
const pipeSleeve = ({ x, y, h = 280 }) => `<svg style="${abs(x, y, 70, h, "filter:drop-shadow(0 12px 9px rgba(30,20,5,.4))")}" viewBox="0 0 70 280" aria-hidden="true">
  <path d="M35 0 V22" stroke="#6d7872" stroke-width="5"/><rect x="8" y="20" width="54" height="254" rx="12" fill="#52606a"/><rect x="14" y="26" width="14" height="242" rx="7" fill="#fff" opacity=".2"/>
  <path d="M44 24 V270" stroke="#000" stroke-opacity=".3" stroke-width="4"/><ellipse cx="35" cy="272" rx="27" ry="8" fill="#37424a"/><ellipse cx="35" cy="272" rx="14" ry="4" fill="#1d2428"/></svg>`;

function pin65() {
  const i = idea(65);
  const rows = i.items.map((s, k) => `<div data-check="job ${k + 1}" style="display:flex;gap:20px;align-items:flex-start;padding:20px 0;border-bottom:2px solid ${C.rule}"><div style="flex:none;width:40px;height:40px;margin-top:2px;border:4px solid ${C.sage};border-radius:9px;background:#fff;display:grid;place-items:center">${k < 3 ? icon("check", { size: 30, color: C.sage, weight: "bold" }) : ""}</div><div style="font:500 26px/1.28 'Plex',sans-serif;color:${C.ink}">${esc(s)}</div></div>`).join("");
  const board = `<div style="${abs(60, 410, 640, 920, "transform:rotate(-1.4deg)")}">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#a9743c,#8d5d2c);border-radius:22px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 28px 50px rgba(40,20,5,.45)"></div>
    <div style="${abs(274, -26, 92, 78, "border-radius:14px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 6px 10px rgba(0,0,0,.35)")}"></div><div style="${abs(290, -42, 60, 34, "border-radius:12px 12px 0 0;background:linear-gradient(#f4f5f7,#bcc0c6);box-shadow:0 3px 6px rgba(0,0,0,.25)")}"></div>
    <div style="${abs(34, 48, 572, 840, `background:${C.paperLight};border-radius:6px;box-shadow:0 2px 3px rgba(40,20,5,.28)`)}">
      <div style="${abs(26, 40, 520, 700)}">${rows}</div>
      <div data-check="footnote" style="${abs(26, 752, 520, 76, `display:flex;align-items:center;gap:12px;font:italic 500 24px/1.25 'Newsreader',serif;color:#4b4339`)}">This list lives on the page for this visit only</div>
    </div></div>`;
  const pegBoard = `<div style="${abs(716, 420, 246, 640)}">
    <div style="${abs(0, 0, 246, 640, "background:linear-gradient(#cfa571,#b98a52);border-radius:14px;box-shadow:0 3px 4px rgba(40,20,5,.3),0 22px 34px rgba(40,20,5,.4)")}"></div>
    ${[60, 330, 598].map((y) => `<div style="${abs(20, y, 206, 6, "background:rgba(80,50,15,.25);border-radius:3px")}"></div>`).join("")}
    ${peg(60, 20)}${peg(156, 20)}${peg(108, 300)}
  </div>`;
  const hung = `${faucetCover({ x: 722, y: 470, w: 150 })}${pipeSleeve({ x: 860, y: 462, h: 270 })}${mitten({ x: 770, y: 760, h: 200, rot: 4, body: "#e9eee4", band: C.sageDeep })}`;
  const floor = `${tray({ x: 712, y: 1262, w: 266, h: 80 })}${boot({ x: 724, y: 1126, h: 172, rot: 0 })}${boot({ x: 842, y: 1132, h: 166, rot: 0, flip: true, body: "#a56b3d" })}`;
  const scene = `${boards({ base: "#cfa874", groove: "rgba(90,55,15,.30)", pitch: 100 })}${pegBoard}${hung}${board}${floor}`;
  return printable({ n: 65, paper: "#f1e7d1", scene });
}

/* =================== pin 67: freeze vs hard freeze =================== */

function pin67() {
  const i = idea(67);
  const [fL, fT] = split(i.items[0]);
  const [hL, hT] = split(i.items[1]);
  const nws = i.items[2];
  const tile = `<svg style="${abs(0, 0, 1000, 1500)}" viewBox="0 0 1000 1500" aria-hidden="true"><defs><pattern id="slate" width="200" height="200" patternUnits="userSpaceOnUse"><rect width="200" height="200" fill="#7f8e88"/><rect x="3" y="3" width="194" height="194" rx="3" fill="#8b9a94"/><path d="M20 40 C 70 60 120 20 180 50 M10 120 C 60 100 110 150 190 120 M30 180 C 90 170 130 190 170 176" stroke="#6f7e78" stroke-width="3" fill="none" opacity=".55"/><path d="M3 3 H197" stroke="#fff" stroke-opacity=".12" stroke-width="3"/></pattern></defs><rect width="1000" height="1500" fill="url(#slate)"/><rect width="1000" height="1500" fill="#14201b" opacity=".08"/><radialGradient id="sl" cx="30%" cy="15%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#0b1511" stop-opacity=".35"/></radialGradient><rect width="1000" height="1500" fill="url(#sl)"/></svg>`;
  // a thermometer (viewBox 160 x 640); mercury top at my
  const thermo = (my) => `<svg viewBox="0 0 160 640" width="160" height="640" aria-hidden="true">
    <rect x="52" y="6" width="56" height="560" rx="28" fill="#fbfaf6" stroke="#b3bcb8" stroke-width="3"/><circle cx="80" cy="586" r="48" fill="#fbfaf6" stroke="#b3bcb8" stroke-width="3"/>
    <circle cx="80" cy="586" r="34" fill="${SLATE}"/><rect x="70" y="${my}" width="20" height="${590 - my}" fill="${SLATE}"/><circle cx="80" cy="${my}" r="10" fill="${SLATE}"/><rect x="74" y="${my + 8}" width="5" height="${560 - my}" fill="#fff" opacity=".28"/>
    ${Array.from({ length: 26 }, (_, k) => `<path d="M${k % 4 === 0 ? 8 : 24} ${40 + k * 20} H46" stroke="#7d8a84" stroke-width="3"/>`).join("")}
    <path d="M44 ${my} H132" stroke="${C.ink}" stroke-width="4"/></svg>`;
  const tapStub = `<svg style="${abs(528, 470, 210, 250)}" viewBox="0 0 210 250" aria-hidden="true">
    <rect x="150" y="0" width="34" height="250" rx="4" fill="#e6dfca"/>${Array.from({ length: 8 }, (_, k) => `<rect x="150" y="${10 + k * 31}" width="34" height="4" fill="#b9b093"/>`).join("")}
    <circle cx="156" cy="108" r="22" fill="#d6dad8" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
    <rect x="44" y="94" width="116" height="28" rx="12" fill="#b9bfbd"/><rect x="44" y="94" width="116" height="9" rx="4" fill="#fff" opacity=".5"/>
    <rect x="52" y="116" width="28" height="56" rx="6" fill="#b9bfbd"/><rect x="48" y="166" width="36" height="14" rx="3" fill="#8f9694"/>
    <rect x="102" y="70" width="8" height="26" fill="#8f9694"/><ellipse cx="106" cy="68" rx="30" ry="8" fill="#4f7a5c"/><ellipse cx="106" cy="65" rx="30" ry="6" fill="#6a9577"/>
    <path d="M44 108 H20" stroke="#b9bfbd" stroke-width="3"/></svg>`;
  const card = `<div style="${abs(160, 408, 680, 912, "transform:rotate(-0.8deg)")}">
    <div style="${abs(0, 0, 680, 912, `background:${C.paperLight};border-radius:8px;box-shadow:0 3px 4px rgba(10,20,15,.35),0 28px 46px rgba(10,20,15,.5)`)}"></div>
    <div style="${abs(30, 40, 160, 640)}">${thermo(250)}</div>
    <div class="mono" style="${abs(184, 266, 140, 40, "font:600 30px 'Plex Mono',monospace;color:#1a2420")}">32°F</div>
    <div style="${abs(300, 40, 160, 640)}">${thermo(330)}</div>
    <div class="mono" style="${abs(454, 346, 140, 40, "font:600 30px 'Plex Mono',monospace;color:#1a2420")}">28°F</div>
    ${tapStub.replace("left:528px;top:470px", "left:474px;top:440px")}
    <div style="${abs(478, 646, 170, 44, `z-index:3;background:#f6e7c1;border:3px solid ${C.ochre};border-radius:10px;display:grid;place-items:center;font:700 25px/1 'Plex',sans-serif;color:${C.ochre}`)}">needs a look</div>
    <div data-check="freeze label" style="${abs(36, 716, 260, 120)}"><div class="serif" style="font:500 52px/1 'Newsreader',serif;color:${C.sageDeep}">${esc(fL)}</div><div style="font:600 30px/1.2 'Plex',sans-serif;color:${C.ink};margin-top:10px">${esc(fT)}</div></div>
    <div data-check="hard freeze label" style="${abs(330, 740, 330, 120)}"><div class="serif" style="font:500 52px/1 'Newsreader',serif;color:${C.sageDeep}">${esc(hL)}</div><div style="font:600 30px/1.2 'Plex',sans-serif;color:${C.ink};margin-top:10px">${esc(hT)}</div></div>
    <div data-check="source" style="${abs(36, 842, 620, 44, `display:flex;align-items:center;gap:12px;font:500 28px/1 'Plex',sans-serif;color:#4b4339;border-top:2px solid ${C.rule};padding-top:6px`)}">${esc(nws)}</div>
  </div>`;
  const props = `${mitten({ x: 30, y: 1120, h: 190, rot: -14, body: "#f3eee2", band: C.sageDeep })}${mitten({ x: 842, y: 430, h: 190, rot: 18, body: "#e9eee4", band: C.sage, flip: true })}${thermos({ x: 850, y: 1090, h: 230, rot: 0 })}`;
  return printable({ n: 67, paper: "#e2e8e6", scene: `${tile}${props}${card}` });
}

/* =================== pin 69: how to drain an outdoor faucet =================== */

function pin69() {
  const i = idea(69);
  const W = 920, H = 470;
  const wedge = (n, cx, cy) => `<circle cx="${cx}" cy="${cy}" r="25" fill="${C.sageDeep}" stroke="#fff" stroke-width="4"/><text x="${cx}" y="${cy + 10}" text-anchor="middle" font-family="Newsreader" font-weight="600" font-size="32" fill="#fff">${n}</text>`;
  const diagram = `<svg style="${abs(40, 392, W, H, "filter:drop-shadow(0 16px 20px rgba(0,0,0,.45));border-radius:22px")}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><clipPath id="dc"><rect width="${W}" height="${H}" rx="22"/></clipPath><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7e6ec"/><stop offset="1" stop-color="#f2f6f6"/></linearGradient></defs>
    <g clip-path="url(#dc)">
      <rect width="${W}" height="${H}" fill="#fbfaf6"/>
      <rect x="0" y="0" width="${W}" height="${H}" fill="#f0efe5"/>
      <rect x="470" y="0" width="450" height="${H}" fill="url(#dsky)"/>
      <rect x="0" y="360" width="440" height="110" fill="#d3cbb7"/><path d="M0 360 H440" stroke="#9c957f" stroke-width="5"/>
      <rect x="0" y="0" width="440" height="52" fill="#c99b66"/>${Array.from({ length: 8 }, (_, k) => `<rect x="${k * 60 + 20}" y="0" width="5" height="52" fill="#8a6234" opacity=".45"/>`).join("")}<rect x="0" y="52" width="440" height="8" fill="#000" opacity=".12"/><rect x="440" y="0" width="30" height="${H}" fill="#e2dcc7"/>
      ${Array.from({ length: 5 }, (_, k) => `<path d="M440 ${30 + k * 90} L470 ${60 + k * 90}" stroke="#b9b093" stroke-width="3"/><path d="M470 ${30 + k * 90} L440 ${60 + k * 90}" stroke="#b9b093" stroke-width="3"/>`).join("")}
      <rect x="440" y="0" width="4" height="${H}" fill="#9c957f"/><rect x="466" y="0" width="4" height="${H}" fill="#9c957f"/>
      <path d="M470 380 C 560 366 640 388 740 372 C 820 360 880 376 920 372 V470 H470 Z" fill="#f4f8f8"/><path d="M470 380 C 560 366 640 388 740 372 C 820 360 880 376 920 372" stroke="#b7c6cb" stroke-width="4" fill="none"/>
      <!-- the pipe: supply, interior shutoff, run through the wall, outdoor tap -->
      <rect x="0" y="238" width="520" height="34" fill="#eceae0" stroke="#aeb7b2" stroke-width="3"/>
      <rect x="0" y="238" width="270" height="34" fill="${SLATE}" opacity=".95"/>
      <rect x="270" y="238" width="190" height="34" fill="${SLATE}" opacity=".45"/>
      <rect x="440" y="244" width="40" height="22" fill="#fbfaf6" opacity=".9"/>
      <rect x="0" y="238" width="520" height="8" fill="#fff" opacity=".28"/>
      <rect x="236" y="214" width="50" height="82" rx="10" fill="${C.sageDeep}"/><rect x="236" y="214" width="50" height="14" rx="7" fill="#fff" opacity=".28"/><rect x="250" y="186" width="22" height="34" rx="4" fill="#d6dad8"/><rect x="226" y="176" width="70" height="14" rx="7" fill="#d6dad8"/>
      <circle cx="540" cy="255" r="30" fill="#d6dad8" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
      <rect x="500" y="236" width="150" height="38" rx="14" fill="#b9bfbd"/><rect x="500" y="236" width="150" height="11" rx="5" fill="#fff" opacity=".5"/>
      <rect x="610" y="264" width="30" height="62" rx="6" fill="#b9bfbd"/><rect x="605" y="318" width="40" height="14" rx="3" fill="#8f9694"/>
      <rect x="560" y="208" width="8" height="30" fill="#8f9694"/><ellipse cx="564" cy="206" rx="34" ry="9" fill="${C.sage}"/><ellipse cx="564" cy="202" rx="34" ry="7" fill="#6a9577"/>
      <rect x="626" y="332" width="8" height="6" fill="${SLATE}"/><path d="M630 344 C 626 356 626 362 630 366 C 636 362 636 356 630 344 Z" fill="${SLATE}"/><path d="M630 384 C 626 396 626 402 630 406 C 636 402 636 396 630 384 Z" fill="${SLATE}" opacity=".7"/>
      <!-- the hose, disconnected and coiled in the snow -->
      <ellipse cx="780" cy="366" rx="74" ry="22" fill="none" stroke="#5f7a3f" stroke-width="14"/><ellipse cx="780" cy="362" rx="48" ry="14" fill="none" stroke="#5f7a3f" stroke-width="14"/><ellipse cx="780" cy="360" rx="74" ry="22" fill="none" stroke="#9db86c" stroke-width="3" opacity=".6"/>
      <!-- insulated cover, shown dashed -->
      <path d="M520 190 C 520 160 600 160 660 186 L 676 240 V 300 C 676 316 664 320 650 320 H 540 C 526 320 520 316 520 300 Z" fill="${C.sage}" opacity=".12" stroke="${C.sage}" stroke-width="5" stroke-dasharray="14 10"/>
      <!-- the pipe leaves a drained gap: dashed outline -->
      ${wedge(1, 780, 300)}${wedge(2, 262, 140)}${wedge(3, 590, 108)}${wedge(4, 700, 192)}
      <path d="M262 168 V178" stroke="${C.sageDeep}" stroke-width="4"/><path d="M590 134 V160" stroke="${C.sageDeep}" stroke-width="4"/>
    </g></svg>`;
  const icons = ["plug", "toggle-left", "drop", "shield"];
  const rowH = 104, gap = 14, y0 = 886;
  const steps = i.items.map((s, k) => {
    const y = y0 + k * (rowH + gap);
    return `<div data-check="step ${k + 1}" style="${abs(40, y, 920, rowH, `background:${C.paperLight};border-radius:20px;display:flex;align-items:center;gap:20px;padding:0 24px 0 18px;box-shadow:0 12px 20px rgba(0,0,0,.38)`)}"><div style="flex:none;width:62px;height:62px;border-radius:50%;background:${C.sage};display:grid;place-items:center;font:600 38px 'Newsreader',serif;color:#fff">${k + 1}</div><div style="flex:none;width:58px;height:58px;display:grid;place-items:center;background:${C.wash};border-radius:14px">${icon(icons[k], { size: 38, color: C.sageDeep, weight: "duotone" })}</div><div style="font:500 28px/1.24 'Plex',sans-serif;color:${C.ink}">${esc(s)}</div></div>`;
  }).join("");
  const scene = `${boards({ base: "#2e4a3b", groove: "rgba(0,0,0,.28)", light: "rgba(255,255,255,.06)", pitch: 64 })}${diagram}${steps}`;
  return printable({ n: 69, paper: "#dde8da", scene });
}

/* =================== pin 71: thermostat away for the winter =================== */

function pin71() {
  const i = idea(71);
  // dial: ticks from -135deg to +135deg, sage arc up to the setting
  const cx = 230, cy = 230, R = 196;
  const a = (deg, r) => [cx + Math.sin((deg * Math.PI) / 180) * r, cy - Math.cos((deg * Math.PI) / 180) * r];
  const end = -135 + 270 * 0.34;
  const [sx, sy] = a(-135, 160), [ex, ey] = a(end, 160), [kx, ky] = a(end, 160);
  const ticks = Array.from({ length: 41 }, (_, k) => {
    const d = -135 + k * (270 / 40), [x1, y1] = a(d, 188), [x2, y2] = a(d, k % 5 === 0 ? 168 : 176);
    return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#6d7872" stroke-width="${k % 5 === 0 ? 4 : 2.5}"/>`;
  }).join("");
  const thermostat = `<svg style="${abs(70, 410, 460, 460, "filter:drop-shadow(0 18px 18px rgba(20,35,40,.42))")}" viewBox="0 0 460 460" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="226" fill="#ecedea"/><circle cx="${cx}" cy="${cy}" r="226" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/><circle cx="${cx}" cy="${cy}" r="214" fill="#d9dcd8"/>
    <circle cx="${cx}" cy="${cy}" r="206" fill="#fbfaf6"/>${ticks}
    <path d="M${sx.toFixed(1)} ${sy.toFixed(1)} A160 160 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${C.sage}" stroke-width="16" fill="none" stroke-linecap="round"/>
    <circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="16" fill="${C.sageDeep}" stroke="#fff" stroke-width="5"/>
    <circle cx="${cx}" cy="${cy}" r="120" fill="#f1f3ef"/><circle cx="${cx}" cy="${cy}" r="120" fill="none" stroke="#c9d1cb" stroke-width="3"/>
    <text x="${cx}" y="${cy + 38}" text-anchor="middle" font-family="Newsreader" font-weight="500" font-size="130" fill="${C.ink}" letter-spacing="-3">55</text>
    <text x="${cx}" y="${cy + 84}" text-anchor="middle" font-family="Plex Mono" font-weight="600" font-size="30" fill="#4b5753">°F</text></svg>`;
  const house = `<div style="${abs(570, 410, 390, 310, `background:${C.paperLight};border-radius:20px;box-shadow:0 4px 6px rgba(20,35,40,.3),0 24px 36px rgba(20,35,40,.4);overflow:hidden`)}">
    <svg viewBox="0 0 390 310" width="390" height="310" aria-hidden="true">
      <rect width="390" height="310" fill="#eef3f2"/>
      <path d="M26 128 L195 28 L364 128 Z" fill="#8d9a95"/><path d="M26 128 L195 28 L195 40 L52 128 Z" fill="#fff" opacity=".2"/>
      <rect x="52" y="128" width="286" height="162" fill="#f6f1e3"/><rect x="52" y="128" width="46" height="162" fill="#cfe3d3"/>
      ${[0, 1, 2, 3, 4].map((k) => `<rect x="${52 + k * 9}" y="128" width="3" height="162" fill="#a5b7aa" opacity=".6"/>`).join("")}
      <rect x="52" y="128" width="46" height="162" fill="${C.sage}" opacity=".16"/>
      <rect x="70" y="140" width="12" height="138" rx="5" fill="#c9cfcc" stroke="${C.sageDeep}" stroke-width="3"/><path d="M76 150 V270" stroke="${C.sage}" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
      <rect x="40" y="128" width="12" height="164" fill="#cdd6d1"/>
      <rect x="52" y="290" width="286" height="12" fill="#b78650"/>
      <rect x="214" y="206" width="110" height="84" fill="#37433e"/><rect x="204" y="198" width="132" height="12" rx="3" fill="#d9d3c2"/>
      <path d="M214 206 L184 216 V280 L214 290 Z" fill="#efeadb" stroke="#bdb59a" stroke-width="2"/><path d="M324 206 L350 214 V282 L324 290 Z" fill="#efeadb" stroke="#bdb59a" stroke-width="2"/>
      <g fill="none" stroke="#cdd5d2" stroke-width="7" stroke-linecap="round"><path d="M250 214 V244 M290 214 V244"/><path d="M250 244 V262 C 250 276 290 276 290 262 V244"/></g>
      <rect x="118" y="150" width="70" height="64" fill="#cfe3ec" stroke="#fbfaf6" stroke-width="6"/><path d="M153 150 V214 M118 182 H188" stroke="#fbfaf6" stroke-width="4"/>
      <path d="M194 266 C 150 280 128 284 104 284" stroke="none" fill="none"/>
    </svg></div>`;
  const keys = `<div style="${abs(570, 744, 400, 140)}"><div style="${abs(0, 0, 330, 120, "transform:scale(1.2);transform-origin:0 0")}">
    <div style="${abs(0, 0, 330, 34, "background:linear-gradient(#cfa571,#a9783f);border-radius:8px;box-shadow:0 8px 12px rgba(20,35,40,.35)")}"></div>
    <svg style="${abs(0, 0, 330, 130)}" viewBox="0 0 330 130" aria-hidden="true"><path d="M70 28 C 70 24 90 24 90 32 V40" stroke="#8d6d3f" stroke-width="6" fill="none"/><path d="M230 28 C 230 24 250 24 250 32 V40" stroke="#8d6d3f" stroke-width="6" fill="none"/>
      <circle cx="78" cy="56" r="14" fill="none" stroke="#a9adb3" stroke-width="6"/><g transform="rotate(-8 78 90)"><rect x="66" y="66" width="24" height="12" rx="3" fill="#d9a766"/><rect x="62" y="76" width="32" height="40" rx="14" fill="#d9a766"/><circle cx="78" cy="88" r="7" fill="#7d6a4a"/></g><g transform="rotate(14 90 98)"><rect x="84" y="70" width="14" height="46" rx="3" fill="#c0c5c9"/><path d="M84 106 h14 v8 h-14Z M84 96 h10 v6 h-10Z" fill="#8f979d"/></g>
      <path d="M250 38 C 240 60 244 84 262 96" stroke="#8d6d3f" stroke-width="5" fill="none"/><rect x="236" y="96" width="46" height="20" rx="10" fill="${C.sage}"/><rect x="246" y="102" width="26" height="8" rx="4" fill="#fff" opacity=".7"/></svg></div></div>`;
  const tags = i.items.map((s, k) => {
    const col = k % 2, row = Math.floor(k / 2);
    const x = 40 + col * 470, y = 934 + row * 224;
    return `<div style="${abs(x, y, 450, 182, `transform:rotate(${[-1.2, 1, 0.8, -1][k]}deg)`)}">
      <div data-check="item ${k + 1}" style="${abs(0, 0, 450, 182, `background:${C.kraft};border-radius:18px 18px 22px 22px;padding:56px 26px 0 26px;font:500 28px/1.28 'Plex',sans-serif;color:${C.ink};box-shadow:0 14px 24px rgba(20,35,40,.4),inset 0 0 0 2px rgba(60,40,10,.2)`)}">${esc(s)}</div>
      <div style="${abs(209, 12, 32, 32, "border-radius:50%;background:#bcc9ce;box-shadow:inset 0 2px 4px rgba(0,0,0,.35)")}"></div><div style="${abs(224, -30, 3, 50, "background:#8d6d3f")}"></div></div>`;
  }).join("");
  const rails = [0, 1].map((r) => `${rail({ x: 20, y: 896 + r * 224, w: 960, h: 28 })}`).join("");
  const scene = `${boards({ base: "#aebfc5", groove: "rgba(40,70,85,.18)", pitch: 72, light: "rgba(255,255,255,.12)" })}${thermostat}${house}${keys}${rails}${tags}`;
  return printable({ n: 71, paper: "#e1e9eb", scene });
}

/* =================== pin 73: write the date next to each job =================== */

function pin73() {
  const i = idea(73);
  const [ex] = i.items; // "Drained faucet, October 21"
  const late = i.items[1];
  const lines = [140, 214, 288, 362, 436].map((y, k) => `<div style="${abs(0, y, k < 2 ? 800 : 800, 2, "background:#9bbfd0")}"></div>`).join("");
  const sketch = `<svg style="${abs(572, 168, 196, 270)}" viewBox="0 0 196 270" aria-hidden="true"><g fill="none" stroke="${C.sageDeep}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M168 10 V250"/><path d="M158 10 V250" opacity=".4"/><circle cx="168" cy="96" r="14"/><path d="M168 96 H112 C 100 96 96 104 96 112 V134"/><rect x="82" y="134" width="28" height="14" rx="3"/><path d="M100 148 V168"/>
    <ellipse cx="82" cy="214" rx="64" ry="22"/><ellipse cx="82" cy="212" rx="42" ry="13"/><ellipse cx="82" cy="210" rx="20" ry="6"/><path d="M20 214 C 10 220 6 230 12 240"/></g></svg>`;
  const card = `<div style="${abs(100, 752, 800, 470, "transform:rotate(-2deg)")}">
    <div style="${abs(0, 0, 800, 470, `background:${C.paperLight};border-radius:8px;box-shadow:0 3px 4px rgba(30,45,35,.35),0 26px 42px rgba(30,45,35,.45)`)}"></div>
    <div style="${abs(0, 64, 800, 3, `background:${C.sage};opacity:.8`)}"></div>
    <div style="${abs(0, 0, 800, 470)}">${lines}</div>
    <div data-check="example line" style="${abs(48, 70, 580, 70, "font:600 54px/1.2 'Hand',cursive;color:#23395a;white-space:nowrap")}">${esc(ex)}</div>
    ${exampleTag(628, 84)}
    ${sketch}
    ${[214, 288].map((y) => `<div style="${abs(48, y - 8, 4, 4, "background:transparent")}"></div>`).join("")}
  </div>`;
  const note = `<div data-check="note" style="${abs(60, 1236, 560, 106, `transform:rotate(1.2deg);background:${C.butter};border-radius:10px;padding:16px 24px;display:flex;align-items:center;font:600 30px/1.22 'Plex',sans-serif;color:${C.ink};box-shadow:0 12px 20px rgba(30,45,35,.38)`)}">${esc(late)}</div>`;
  const tape = `<div style="${abs(280, 1222, 120, 34, "transform:rotate(-3deg);background:rgba(240,213,138,.75);border-radius:3px")}"></div>`;
  const bench = `<div style="${abs(0, 700, 1000, 800, "background:linear-gradient(#b3c6b8,#9db3a3)")}"></div>
    <div style="${abs(0, 700, 1000, 800, "background:repeating-linear-gradient(0deg,rgba(0,0,0,.05) 0 2px,transparent 2px 160px)")}"></div>
    <div style="${abs(0, 720, 1000, 600, "background:radial-gradient(ellipse at 25% 10%,rgba(255,255,255,.35),transparent 60%)")}"></div>`;
  const wall = `<div style="${abs(0, 372, 1000, 340, "background:#bccfc1")}"></div>`;
  const win = frostWindow({ x: 70, y: 386, w: 860, h: 300, id: "w73", sill: false });
  const sill = `<div style="${abs(40, 678, 920, 44, "background:linear-gradient(#fbfaf6,#e3e0d2);border-radius:8px;box-shadow:0 12px 16px rgba(30,45,35,.35)")}"></div>`;
  const props = `${thermos({ x: 770, y: 520, h: 190, rot: 0, body: C.sageDeep })}${mitten({ x: 660, y: 1176, h: 170, rot: -12, body: "#e9eee4", band: C.sageDeep })}${mitten({ x: 790, y: 1184, h: 170, rot: 10, flip: true, body: "#e9eee4", band: C.sageDeep })}`;
  const pen = pencil({ x: 150, y: 1060, len: 380, rot: -7 });
  const scene = `${wall}${win}${bench}${sill}${props}${card}${tape}${note}${pen}`;
  return printable({ n: 73, paper: "#e8eee4", scene });
}

export const pins = [pin63(), pin65(), pin67(), pin69(), pin71(), pin73()];
