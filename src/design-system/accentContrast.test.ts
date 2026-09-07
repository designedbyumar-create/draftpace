import { describe, expect, it } from "vitest";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

ensureProductsRegistered();
ensureShopRegistered();

/**
 * A product's `accentScale.contrast` is the text colour every primary
 * button inside that product's shell is set in (buttonStyles.ts reads
 * it as --primary-contrast, rendered on top of --primary, which is
 * accentScale.base or .strong depending on state). Declaring an accent
 * whose base fails WCAG AA against its own contrast token is not a
 * cosmetic miss, it is real button text somebody has to read: Family
 * Health Binder's first-drafted #6b7a9e only reached 4.28:1 against
 * white, short of the 4.5:1 normal-text minimum, until this test's
 * failure while writing it caught it and it was darkened to #606e8e.
 */

function srgbToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

const WCAG_AA_NORMAL_TEXT = 4.5;

describe("every product's accent clears WCAG AA against its own contrast token", () => {
  const products = shopRegistry
    .listPublished()
    .map((listing) => productRegistry.getBySlug(listing.slug))
    .filter((product): product is NonNullable<typeof product> => product !== undefined);

  it("registers at least the nine live, published products", () => {
    expect(products.length).toBeGreaterThanOrEqual(9);
  });

  it("passes base vs contrast at 4.5:1, the ratio real button text renders at", () => {
    for (const product of products) {
      const scale = product.theme.accentScale;
      if (!scale) continue; // Monthly Money Reset's documented exception; see ProductBadge.test.ts.
      const ratio = contrastRatio(scale.base, scale.contrast);
      expect(ratio, `${product.slug}: base ${scale.base} vs contrast ${scale.contrast} is only ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL_TEXT
      );
    }
  });

  it("passes strong vs contrast at 4.5:1 too, since hover/active states render on strong", () => {
    for (const product of products) {
      const scale = product.theme.accentScale;
      if (!scale) continue;
      const ratio = contrastRatio(scale.strong, scale.contrast);
      expect(ratio, `${product.slug}: strong ${scale.strong} vs contrast ${scale.contrast} is only ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
        WCAG_AA_NORMAL_TEXT
      );
    }
  });
});
