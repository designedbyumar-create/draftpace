import { productRegistry } from "@/product-framework/registry";
import { accentWash, deriveDarkTones } from "@/design-system/accentTone";
import type { PosterTheme } from "@/components/public/home/posterTypes";

/**
 * Extracted from the homepage (src/app/(marketing)/page.tsx), where this
 * exact logic first shipped to theme the Companion Series posters. Moved
 * here, unchanged, so a second surface (a Shop product page, a guide's
 * handover panel) can show that same product in its own real colours
 * without duplicating the derivation or depending on homepage internals.
 * The homepage itself now imports this rather than keeping its own copy.
 */

/** The face each product's own headings speak in, and the one that labels everything in monospace. */
const HEADLINE_FONT: Record<string, string> = {
  "personal-finance-companion": "var(--font-fraunces), ui-serif, Georgia, serif",
  "travel-companion": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  "vehicle-maintenance-companion": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  "family-health-binder": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
};
const SERIF = "var(--font-newsreader), ui-serif, Georgia, serif";
const RADIUS: Record<string, number> = { sharp: 4, standard: 16, soft: 24 };

/**
 * Each poster wears its own product's colours: the ground and accent from
 * its definition, so re-theming a product moves its poster with it. A
 * product with no ground of its own gets a pale wash of its accent, worked
 * out the way the Shop's store images are.
 *
 * Every value is a `light-dark()` pair rather than a single resolved
 * colour, because an inline custom property can't answer a media query on
 * its own: a single light value would stay light no matter the visitor's
 * theme. `light-dark()` resolves against the page's `color-scheme`, which
 * globals.css already sets correctly for all three theme states.
 */
export function posterTheme(slug: string): PosterTheme | null {
  const theme = productRegistry.getBySlug(slug)?.theme;
  const scale = theme?.accentScale;
  if (!theme || !scale) return null;
  const groundLight = theme.ground?.light;
  const groundDark = theme.ground?.dark;
  const darkScale = theme.accentScaleDark ?? deriveDarkTones(scale.base);
  const heroLight = theme.hero?.light;
  const heroDark = theme.hero?.dark;
  const ld = (light: string, dark: string) => `light-dark(${light}, ${dark})`;
  return {
    bg: ld(groundLight?.appBg ?? accentWash(scale.base, 0.955), groundDark?.appBg ?? accentWash(scale.base, 0.13)),
    surface: ld(groundLight?.surface ?? accentWash(scale.base, 0.995), groundDark?.surface ?? accentWash(scale.base, 0.17)),
    text: ld(groundLight?.text ?? "#1c1917", groundDark?.text ?? "#f5f2ea"),
    muted: ld(groundLight?.muted ?? "#57534e", groundDark?.muted ?? "#b1aa9d"),
    border: ld(groundLight?.border ?? accentWash(scale.base, 0.86), groundDark?.border ?? accentWash(scale.base, 0.26)),
    accent: ld(scale.base, darkScale.base),
    accentContrast: ld(scale.contrast, darkScale.contrast),
    soft: ld(scale.soft, darkScale.soft),
    radius: RADIUS[theme.identity?.shape ?? "standard"],
    headlineFont: HEADLINE_FONT[slug] ?? SERIF,
    monoLabels: slug === "vehicle-maintenance-companion",
    hero: heroLight && heroDark ? { from: ld(heroLight.from, heroDark.from), mid: ld(heroLight.mid, heroDark.mid), to: ld(heroLight.to, heroDark.to), ink: ld(heroLight.ink, heroDark.ink) } : undefined,
  };
}
