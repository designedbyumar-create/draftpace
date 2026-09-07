import type { CSSProperties } from "react";
import { ProductDefinition } from "./definition";
import { deriveDarkTones } from "@/design-system/accentTone";

/**
 * The attribute a product shell root carries so globals.css can select the
 * light or dark half of the pairs below. Exported so both shells and the
 * stylesheet's own tests agree on one spelling.
 */
export const PRODUCT_THEME_ATTRIBUTE = "data-product-theme";

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
    /**
     * Both tone sets are emitted as *pairs*, and globals.css picks which
     * pair feeds --primary/--link/--focus-ring for the active theme.
     *
     * This indirection is the whole point. These are inline styles on the
     * shell root, and an inline style cannot answer a media query, so the
     * previous version of this function pushed each product's LIGHT accent
     * into dark mode too: petrol at 1.82:1 on the dark ground, steel at
     * 2.26:1, every themed product's links and focus rings effectively
     * invisible and every filled button a dark block on a dark page.
     * Setting --primary here directly would also outrank any stylesheet
     * rule trying to correct it, which is why this no longer does.
     */
    const light = theme.accentScale;
    const dark = theme.accentScaleDark ?? deriveDarkTones(light.base);

    style["--product-primary-light"] = light.base;
    style["--product-primary-strong-light"] = light.strong;
    style["--product-primary-soft-light"] = light.soft;
    style["--product-primary-contrast-light"] = light.contrast;
    // Falls back to `soft` when a product hasn't computed its own wash yet
    // (see the field's own doc comment in definition.ts) — never unset,
    // since a shell that reaches for --product-wash should always get a
    // usable pastel tone, not nothing.
    style["--product-wash-light"] = light.wash ?? light.soft;

    style["--product-primary-dark"] = dark.base;
    style["--product-primary-strong-dark"] = dark.strong;
    style["--product-primary-soft-dark"] = dark.soft;
    style["--product-primary-contrast-dark"] = dark.contrast;
    style["--product-wash-dark"] = dark.wash ?? dark.soft;

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
