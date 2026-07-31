import type { CSSProperties } from "react";
import { ProductDefinition } from "./definition";

/**
 * A product's theme extension produces scoped CSS custom properties applied
 * only to that product's shell root — never global rules. It cannot touch
 * platform accessibility settings, introduce a second icon library, or
 * affect platform/auth navigation. See docs/PRODUCT-FRAMEWORK.md.
 */
export type ProductThemeExtension = ProductDefinition["theme"];

export function productThemeStyle(theme: ProductThemeExtension): CSSProperties {
  const style: Record<string, string> = {};
  if (theme.accent) style["--product-accent"] = theme.accent;
  if (theme.dataVisualizationPalette?.length) {
    theme.dataVisualizationPalette.forEach((color, index) => {
      style[`--product-data-${index + 1}`] = color;
    });
  }
  return style as CSSProperties;
}
