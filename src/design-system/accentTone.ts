/**
 * Deriving a product's dark-theme accent from its light one.
 *
 * WHY THIS EXISTS
 *
 * `productThemeStyle()` writes a product's `accentScale` into `--primary`,
 * `--primary-strong`, `--link` and `--focus-ring` as inline styles on the
 * shell root. Inline styles cannot answer a media query, so until this
 * module existed every themed product pushed its *light* accent into dark
 * mode as well: Personal Finance Companion's petrol (#2e4a4d) sat at
 * 1.82:1 against the dark ground (#1c1a16), Vehicle Maintenance's steel at
 * 2.26:1. Links, eyebrow labels and focus rings were effectively invisible,
 * and a filled button became a dark block on a dark page.
 *
 * The platform's own accent has always had two values (teal #0e6e75 light,
 * #4fc7c9 dark). Every product now gets the same courtesy, derived rather
 * than hand-authored so a new product cannot forget, with an explicit
 * `accentScaleDark` override available when taste beats arithmetic.
 *
 * WHAT THE DERIVATION DOES
 *
 * Hue is preserved exactly: a product's colour identity must survive the
 * theme change, or it is a different product in dark mode. Lightness rises
 * until the tone clears 4.6:1 against the dark surface (a little over the
 * 4.5:1 AA minimum, so rounding never drops it under). Chroma is restored
 * on the way up, because lightening alone turns every accent into the same
 * washed grey - except for accents that are *deliberately* near-neutral
 * (Vehicle Maintenance's steel), which are left near-neutral rather than
 * pushed into olive.
 */

/** The dark theme's own surface, from globals.css. Kept here so the derivation is testable without parsing CSS. */
export const DARK_SURFACE = "#1c1a16";

/** Contrast a derived dark tone must clear against DARK_SURFACE. Above the 4.5 AA floor so rounding cannot drop it under. */
export const DARK_TONE_TARGET = 4.6;

/** Below this saturation an accent is read as deliberately neutral, and is lightened without having chroma pushed into it. */
const NEUTRAL_SATURATION = 0.12;

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: Rgb): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function channelLuminance(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(parseHex(a));
  const l2 = relativeLuminance(parseHex(b));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return [0, 0, lightness];

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  return [hue / 6, saturation, lightness];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255];
}

/** Lightens `base` along its own hue until it clears `target` against the dark surface. */
function liftForDark(base: string, target: number): string {
  const [hue, saturation, lightness] = rgbToHsl(parseHex(base));
  const lifted =
    saturation < NEUTRAL_SATURATION
      ? Math.min(saturation * 1.2, 0.14)
      : Math.min(0.55, Math.max(saturation * 1.35, 0.3));

  for (let l = lightness; l <= 0.96; l += 0.01) {
    const candidate = toHex(hslToRgb([hue, lifted, l]));
    if (contrastRatio(candidate, DARK_SURFACE) >= target) return candidate;
  }
  return "#ffffff";
}

/** Mixes `hex` toward `towards` by `amount` (0-1), for the strong/contrast steps around a derived base. */
function mix(hex: string, towards: string, amount: number): string {
  const a = parseHex(hex);
  const b = parseHex(towards);
  return toHex([
    a[0] + (b[0] - a[0]) * amount,
    a[1] + (b[1] - a[1]) * amount,
    a[2] + (b[2] - a[2]) * amount,
  ] as Rgb);
}

export interface DerivedDarkTones {
  base: string;
  /** Hover/emphasis. Lighter than base in dark, the inverse of the light theme's relationship. */
  strong: string;
  /** A translucent tint of base, for quiet button fills and soft backgrounds on a dark ground. */
  soft: string;
  /** Text that sits on top of `base`. Dark, because base is now a light tone. */
  contrast: string;
  /** The faintest tier, for hero cards and page washes. */
  wash: string;
}

/**
 * The dark counterpart of a product's light accent. Pure and deterministic,
 * so a product's dark identity is reproducible rather than eyeballed.
 */
export function deriveDarkTones(lightBase: string): DerivedDarkTones {
  const base = liftForDark(lightBase, DARK_TONE_TARGET);
  return {
    base,
    strong: mix(base, "#ffffff", 0.22),
    soft: `color-mix(in srgb, ${base} 18%, transparent)`,
    // Dark ink rather than pure black: pure black on a mid-light accent is
    // harsher than anything else in this palette.
    contrast: mix(base, "#0b0a08", 0.86),
    wash: `color-mix(in srgb, ${base} 12%, transparent)`,
  };
}

/** Saturation range a pale ground is held to, so no product's wash reads grey and none reads neon. */
export const WASH_SATURATION: [number, number] = [0.34, 0.5];

/** How far apart two washes can possibly sit in saturation, given that clamp. */
export const WASH_SATURATION_WIDTH = WASH_SATURATION[1] - WASH_SATURATION[0];

/**
 * A pale ground in an accent's own hue, at a lightness you choose.
 *
 * WHY NOT `color-mix(in srgb, accent N%, white)`
 *
 * Mixing toward white scales chroma by the same fraction as everything
 * else, so one percentage cannot serve nine accents: a low-saturation
 * accent (Personal Finance's petrol, S=0.25) turns grey long before it
 * turns light, while a saturated one (Travel's amber) is still obviously
 * coloured at the same number. Nine products then look like one product,
 * which is the exact failure this was written to fix.
 *
 * Going through HSL sets lightness and saturation independently: every
 * product gets a ground of the same paleness in its own hue. Saturation
 * is clamped rather than preserved — a floor so petrol still reads as
 * petrol, a ceiling so amber does not read as a warning label.
 *
 * Used by the product detail page's screen carousel and by the generated
 * store images (see docs/DESIGN-SYSTEM.md), which is why the two look
 * like the same product.
 */
export function accentWash(hex: string, lightness: number): string {
  const [hue, saturation] = rgbToHsl(parseHex(hex));
  const held = Math.min(Math.max(saturation, WASH_SATURATION[0]), WASH_SATURATION[1]);
  return toHex(hslToRgb([hue, held, lightness]));
}
