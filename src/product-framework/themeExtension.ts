import type { CSSProperties } from "react";
import { ProductDefinition, type ProductGroundTones, type ProductShape } from "./definition";
import { deriveDarkTones } from "@/design-system/accentTone";

/**
 * The attribute a product shell root carries so globals.css can select the
 * light or dark half of the pairs below. Exported so both shells and the
 * stylesheet's own tests agree on one spelling.
 */
export const PRODUCT_THEME_ATTRIBUTE = "data-product-theme";

/**
 * Carried by a shell root only when its product declares a `ground`, so
 * globals.css has something to select on. A product without one must never
 * match, or the pairs below would be read as unset custom properties.
 */
export const PRODUCT_GROUND_ATTRIBUTE = "data-product-ground";

/** The custom-property name for each ground tone, as globals.css reads them. */
const GROUND_TOKEN: Record<keyof ProductGroundTones, string> = {
  appBg: "app-bg",
  surface: "surface",
  surfaceMuted: "surface-muted",
  surfaceStrong: "surface-strong",
  text: "text",
  muted: "muted",
  faint: "faint",
  border: "border",
  borderStrong: "border-strong",
};

/** True when the shell root should carry PRODUCT_GROUND_ATTRIBUTE. */
export function hasProductGround(theme: ProductThemeExtension): boolean {
  return Boolean(theme.ground);
}

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

/**
 * Multiplier applied to the platform's four radius tokens inside a product
 * shell (globals.css, `[data-product-theme]`). `standard` is 1 so a product
 * that states it is indistinguishable from one that says nothing.
 */
const RADIUS_SCALE: Record<ProductShape, number> = {
  sharp: 0.45,
  standard: 1,
  soft: 1.35,
};

export function productThemeStyle(theme: ProductThemeExtension): CSSProperties {
  const style: Record<string, string> = {};
  if (theme.accent) style["--product-accent"] = theme.accent;

  // accentScale is the opt-in for the colour block below and for the
  // narrative face, not for anything else: motion and shape have their
  // own gate further down, because a product with bespoke colour tokens
  // (Monthly Money Reset) must be able to opt into those without also
  // being re-coloured. A product that declares neither renders
  // byte-identically to before, including its motion timing.
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
  }

  if (theme.ground) {
    for (const [name, token] of Object.entries(GROUND_TOKEN) as [keyof ProductGroundTones, string][]) {
      style[`--product-ground-${token}-light`] = theme.ground.light[name];
      style[`--product-ground-${token}-dark`] = theme.ground.dark[name];
    }
  }

  // Motion and shape are opted into by `accentScale` (as they always were)
  // or, for a product that manages its own colours some other way, by
  // declaring an `identity`. Both routes leave a product that declares
  // neither byte-identical.
  if (theme.accentScale || theme.identity) {
    if (theme.motionPersonality) {
      style["--dur"] = MOTION_DURATION[theme.motionPersonality];
      style["--ease-out"] = MOTION_EASE[theme.motionPersonality];
    }
  }
  if (theme.identity?.shape) {
    style["--product-radius-scale"] = String(RADIUS_SCALE[theme.identity.shape]);
  }
  if (theme.dataVisualizationPalette?.length) {
    theme.dataVisualizationPalette.forEach((color, index) => {
      style[`--product-data-${index + 1}`] = color;
    });
  }
  return style as CSSProperties;
}
