import { describe, expect, it } from "vitest";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { iconForProduct } from "@/product-framework/productIcons";
import { Layers3 } from "@/design-system/Icon";

ensureProductsRegistered();
ensureShopRegistered();

/**
 * The standing proof behind Phase 10's own verification requirement:
 * every real, published product's ProductBadge shows its own accent
 * and its own icon, never the platform's generic teal/stack fallback.
 * Scoped to published Shop listings rather than every registered
 * product, since that is the actual set a customer ever sees side by
 * side (on Home, in the Library, on the Shop): a hidden internal
 * product like hidden-access-test has no Shop listing and is
 * deliberately outside this concern.
 *
 * Monthly Money Reset is the one documented exception (definition.ts's
 * own comment): its real accent source is the bespoke `--mmr-*` token
 * set, not `theme.accentScale`, decided in Phase 1 of the design-system
 * pass rather than left as an oversight. It is carved out here by name,
 * not silently excluded.
 */
describe("every real product has its own badge identity", () => {
  const MMR_ACCENT_EXCEPTION = "monthly-money-reset";
  const published = shopRegistry.listPublished();
  const realProducts = published
    .map((listing) => productRegistry.getBySlug(listing.slug))
    .filter((product): product is NonNullable<typeof product> => product !== undefined);

  it("registers at least the nine live, published products", () => {
    expect(realProducts.length).toBeGreaterThanOrEqual(9);
  });

  it("declares a full accentScale for every published product except the documented MMR exception", () => {
    for (const product of realProducts) {
      if (product.slug === MMR_ACCENT_EXCEPTION) continue;
      const scale = product.theme.accentScale;
      expect(scale, `${product.slug} has no accentScale, so its badge falls back to platform teal`).toBeDefined();
      expect(scale?.base, `${product.slug}'s accentScale is missing base`).toBeTruthy();
      expect(scale?.wash ?? scale?.soft, `${product.slug}'s accentScale has neither wash nor soft`).toBeTruthy();
    }
  });

  it("gives every published product its own icon, never the generic Layers3 fallback", () => {
    for (const product of realProducts) {
      expect(iconForProduct(product.slug), `${product.slug} has no entry in productIcons.ts`).not.toBe(Layers3);
    }
  });

  it("never gives two published products the exact same icon, since they can appear side by side on Home and in the Library", () => {
    const seen = new Map<string, string>();
    for (const product of realProducts) {
      const icon = iconForProduct(product.slug);
      const existing = seen.get(icon.displayName ?? "");
      expect(existing, `${product.slug} shares its icon with ${existing}`).toBeUndefined();
      seen.set(icon.displayName ?? "", product.slug);
    }
  });

  it("never gives two published products the exact same accent base colour", () => {
    const seen = new Map<string, string>();
    for (const product of realProducts) {
      const base = product.theme.accentScale?.base;
      if (!base) continue;
      const existing = seen.get(base);
      expect(existing, `${product.slug} shares its accent base (${base}) with ${existing}`).toBeUndefined();
      seen.set(base, product.slug);
    }
  });
});
