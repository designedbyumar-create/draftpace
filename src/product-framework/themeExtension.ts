import type { CSSProperties } from "react";
import { ProductDefinition } from "./definition";

/**
 * A product's theme extension produces scoped CSS custom properties applied
 * only to that product's shell root — never global rules. It cannot touch
 * platform accessibility settings, introduce a second icon library, or
 * affect platform/auth navigation. See docs/PRODUCT-FRAMEWORK.md.
 */
export type ProductThemeExtension = ProductDefinition["theme"];

/**
 * How long a state change takes, by personality. "calm" means content
 * settles rather than snaps; nothing here ever bounces or overshoots.
 * Reduced-motion is handled globally and is unaffected by this.
 */
const MOTION_DURATION: Record<NonNullable<ProductThemeExtension["motionPersonality"]>, string> = {
  calm: "260ms",
  neutral: "220ms",
  energetic: "160ms",
};

const MOTION_EASE: Record<NonNullable<ProductThemeExtension["motionPersonality"]>, string> = {
  calm: "cubic-bezier(0.22, 0.61, 0.36, 1)",
  neutral: "cubic-bezier(0.4, 0, 0.2, 1)",
  energetic: "cubic-bezier(0.34, 1.2, 0.64, 1)",
};

export function productThemeStyle(theme: ProductThemeExtension): CSSProperties {
  const style: Record<string, string> = {};
  if (theme.accent) style["--product-accent"] = theme.accent;

  // accentScale is the opt-in for the whole block below, not just for
  // colour. A product that declares it is saying "I manage my own
  // presentation"; every other product renders byte-identically to
  // before, including its motion timing. Monthly Money Reset declares a
  // calm personality that has never been honoured, and quietly starting
  // to honour it would be a change to a product this work is not
  // supposed to touch. It can opt in deliberately whenever it wants to.
  if (theme.accentScale) {
    style["--primary"] = theme.accentScale.base;
    style["--primary-strong"] = theme.accentScale.strong;
    style["--primary-soft"] = theme.accentScale.soft;
    style["--primary-contrast"] = theme.accentScale.contrast;
    style["--link"] = theme.accentScale.base;
    style["--focus-ring"] = theme.accentScale.base;
    // Falls back to `soft` when a product hasn't computed its own wash yet
    // (see the field's own doc comment in definition.ts) — never unset,
    // since a shell that reaches for --product-wash should always get a
    // usable pastel tone, not nothing.
    style["--product-wash"] = theme.accentScale.wash ?? theme.accentScale.soft;

    if (theme.narrativeFont) style["--product-narrative-font"] = theme.narrativeFont;

    if (theme.motionPersonality) {
      style["--dur"] = MOTION_DURATION[theme.motionPersonality];
      style["--ease-out"] = MOTION_EASE[theme.motionPersonality];
    }
  }
  if (theme.dataVisualizationPalette?.length) {
    theme.dataVisualizationPalette.forEach((color, index) => {
      style[`--product-data-${index + 1}`] = color;
    });
  }
  return style as CSSProperties;
}
