/**
 * Props and scenes for the printed-page mockups, all flat vector with soft
 * shadows, in the 1000 x 1500 pin space (every element absolutely placed).
 * A real page is only ever shown as the page image itself (`sheet`).
 *
 * Positions are the top-left of the element's box; rotation turns it about
 * its centre; sizes in px of the pin.
 */
const abs = (x, y, w, h, extra = "") => `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${extra}`;

/** An oak desk or kitchen table filling the pin: warm planks with grain, a soft light from the top left. */
export function desk({ top = 0, height = 1500, base = "#c99b66", dark = "#b0834d", planks = 6, seed = 3 } = {}) {
  const ph = height / planks;
  const lines = [];
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let k = 0; k < planks; k++) {
    const y = k * ph;
    lines.push(`<rect x="0" y="${y}" width="1000" height="${ph}" fill="${k % 2 ? base : dark}" opacity="${k % 2 ? 1 : 0.55}"/>`);
    lines.push(`<rect x="0" y="${y}" width="1000" height="3" fill="#7d5a30" opacity=".35"/>`);
    for (let g = 0; g < 9; g++) {
      const gy = y + 8 + rnd() * (ph - 16);
      lines.push(`<path d="M${rnd() * 200} ${gy} C ${300 + rnd() * 200} ${gy + (rnd() - 0.5) * 14}, ${600 + rnd() * 200} ${gy + (rnd() - 0.5) * 14}, 1000 ${gy + (rnd() - 0.5) * 10}" fill="none" stroke="#8a6234" stroke-opacity="${(0.12 + rnd() * 0.14).toFixed(2)}" stroke-width="${(1 + rnd() * 1.6).toFixed(1)}"/>`);
    }
  }
  return `<svg style="position:absolute;left:0;top:${top}px;width:1000px;height:${height}px" viewBox="0 0 1000 ${height}" aria-hidden="true"><defs><radialGradient id="dl" cx="25%" cy="12%" r="95%"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#2b1a08" stop-opacity=".32"/></radialGradient></defs>${lines.join("")}<rect width="1000" height="${height}" fill="url(#dl)"/></svg>`;
}

/** A real page image, white-edged, with a paper shadow, optionally cropped to a region (fractions 0-1 of the page). */
export function sheet({ src, x, y, w, tilt = 0, crop, radius = 3, shadow = true, id = "sheet" }) {
  const aspect = 2200 / 1700;
  const c = crop ?? { x0: 0, y0: 0, x1: 1, y1: 1 };
  const cw = c.x1 - c.x0, ch = c.y1 - c.y0;
  const h = Math.round(w * aspect * (ch / cw));
  const iw = w / cw;
  return `<div class="${id}" data-check="page" style="${abs(x, y, w, h, `transform:rotate(${tilt}deg);background:#fbfaf7;border-radius:${radius}px;overflow:hidden;${shadow ? "box-shadow:0 2px 3px rgba(40,20,5,.25),0 18px 34px rgba(40,20,5,.35),0 40px 60px -20px rgba(40,20,5,.4);" : ""}`)}"><img src="${src}" style="position:absolute;left:${-c.x0 * iw}px;top:${-c.y0 * iw * aspect}px;width:${iw}px;height:auto;display:block" alt=""></div>`;
}

/** A pencil lying at an angle. */
export function pencil({ x, y, len = 420, rot = 0, body = "#e7b23f", band = "#b9b9c0", tip = "#e9c9a0" }) {
  const w = len, h = 30;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 8px 6px rgba(40,20,5,.35))`)}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <rect x="46" y="3" width="${w - 100}" height="24" rx="2" fill="${body}"/><rect x="46" y="3" width="${w - 100}" height="7" fill="#f3cf6a" opacity=".7"/><rect x="46" y="20" width="${w - 100}" height="7" fill="#b98a22" opacity=".55"/>
    <rect x="${w - 54}" y="3" width="16" height="24" fill="${band}"/><rect x="${w - 38}" y="3" width="26" height="24" rx="8" fill="#e58b8b"/>
    <path d="M46 3 L2 15 L46 27 Z" fill="${tip}"/><path d="M14 11 L2 15 L14 19 Z" fill="#33363b"/></svg>`;
}

/** A ceramic mug seen from above and slightly in front. */
export function mug({ x, y, size = 170, color = "#f3ede4", drink = "#6b4226" }) {
  return `<svg style="${abs(x, y, size * 1.3, size, "filter:drop-shadow(0 14px 10px rgba(40,20,5,.35))")}" viewBox="0 0 260 200" aria-hidden="true">
    <path d="M196 62 C 246 56 250 128 196 130" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round"/>
    <path d="M196 62 C 240 58 242 124 196 128" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="22" stroke-linecap="round"/>
    <ellipse cx="100" cy="100" rx="96" ry="94" fill="${color}"/><ellipse cx="100" cy="100" rx="96" ry="94" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>
    <ellipse cx="100" cy="100" rx="80" ry="78" fill="#d9d1c4"/><ellipse cx="100" cy="102" rx="72" ry="70" fill="${drink}"/><ellipse cx="82" cy="82" rx="28" ry="20" fill="#fff" opacity=".12"/></svg>`;
}

/** A wooden clipboard (open at the bottom of its box) holding whatever `content` is, with a steel clip. */
export function clipboard({ x, y, w, h, tilt = 0, content = "" }) {
  return `<div style="${abs(x, y, w, h, `transform:rotate(${tilt}deg)`)}">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,#a9743c,#8d5d2c);border-radius:20px;box-shadow:0 4px 6px rgba(40,20,5,.3),0 28px 50px rgba(40,20,5,.45)"></div>
    <div style="position:absolute;left:${w / 2 - 92}px;top:-24px;width:184px;height:76px;border-radius:14px;background:linear-gradient(#e6e8eb,#a9adb3);box-shadow:0 6px 10px rgba(0,0,0,.35)"></div>
    <div style="position:absolute;left:${w / 2 - 60}px;top:-40px;width:120px;height:34px;border-radius:12px 12px 0 0;background:linear-gradient(#f4f5f7,#bcc0c6);box-shadow:0 3px 6px rgba(0,0,0,.25)"></div>
    ${content}</div>`;
}

/** A black binder clip. */
export function binderClip({ x, y, rot = 0, size = 90 }) {
  return `<svg style="${abs(x, y, size, size * 0.8, `transform:rotate(${rot}deg);filter:drop-shadow(0 6px 5px rgba(0,0,0,.35))`)}" viewBox="0 0 100 80" aria-hidden="true"><path d="M26 34 C 20 6, 80 6, 74 34" fill="none" stroke="#b9bcc2" stroke-width="5" stroke-linecap="round"/><path d="M8 80 L14 30 Q 50 22 86 30 L92 80 Z" fill="#26282d"/><path d="M14 30 Q 50 22 86 30 L88 40 Q 50 32 12 40 Z" fill="#40434a"/></svg>`;
}

/** A small stack of picture books. */
export function books({ x, y, size = 1 }) {
  const w = 280 * size, h = 150 * size;
  return `<svg style="${abs(x, y, w, h, "filter:drop-shadow(0 12px 9px rgba(40,20,5,.35))")}" viewBox="0 0 280 150" aria-hidden="true">
    <rect x="6" y="104" width="258" height="38" rx="5" fill="#5f8a8f"/><rect x="6" y="104" width="258" height="9" fill="#fff" opacity=".18"/><rect x="262" y="108" width="12" height="30" rx="2" fill="#f2ecd9"/>
    <rect x="22" y="62" width="236" height="40" rx="5" fill="#c4573e"/><rect x="22" y="62" width="236" height="9" fill="#fff" opacity=".18"/><rect x="256" y="66" width="12" height="32" rx="2" fill="#f2ecd9"/>
    <rect x="12" y="22" width="248" height="38" rx="5" fill="#e0a95a"/><rect x="12" y="22" width="248" height="9" fill="#fff" opacity=".22"/><rect x="258" y="26" width="12" height="30" rx="2" fill="#f2ecd9"/></svg>`;
}

/** A child's crayon drawing on paper: a house, a sun, two stick figures. */
export function drawing({ x, y, w = 250, rot = -5 }) {
  const h = w * 0.78;
  return `<svg style="${abs(x, y, w, h, `transform:rotate(${rot}deg);filter:drop-shadow(0 10px 8px rgba(40,20,5,.35))`)}" viewBox="0 0 250 195" aria-hidden="true"><rect width="250" height="195" fill="#fffdf6"/><circle cx="206" cy="42" r="22" fill="#f2c14e"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<line x1="${206 + Math.cos((a * Math.PI) / 180) * 28}" y1="${42 + Math.sin((a * Math.PI) / 180) * 28}" x2="${206 + Math.cos((a * Math.PI) / 180) * 40}" y2="${42 + Math.sin((a * Math.PI) / 180) * 40}" stroke="#f2c14e" stroke-width="5" stroke-linecap="round"/>`).join("")}<rect x="40" y="86" width="86" height="64" fill="#d86a4f"/><path d="M30 90 L83 44 L136 90 Z" fill="#7a4b8a"/><rect x="72" y="112" width="22" height="38" fill="#f6e7b4"/><path d="M0 160 H250" stroke="#6aa86a" stroke-width="10"/><g stroke="#3b7fb2" stroke-width="5" stroke-linecap="round" fill="none"><circle cx="166" cy="120" r="9"/><path d="M166 129 V152 M166 138 L154 146 M166 138 L178 146 M166 152 L158 166 M166 152 L174 166"/></g></svg>`;
}
