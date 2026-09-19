import { describe, expect, it } from "vitest";
import { PRODUCT_MOTIFS } from "./definition";
import { productRegistry } from "./registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";

/**
 * Nine products that differ only in colour are one product in nine
 * outfits. These guards make the other kind of difference a requirement:
 * every product that is actually sold names the structure its own screen
 * object and printed pages are built around, and no two share one.
 */
ensureProductsRegistered();
registerRealShopProducts();

const SOLD = shopRegistry.listPublished().map((p) => p.slug);

function definitionFor(slug: string) {
  const definition = productRegistry.getBySlug(slug);
  if (!definition) throw new Error(`${slug} is sold in the shop but not registered as a product`);
  return definition;
}

describe("product identity", () => {
  it("covers every product that is actually sold", () => {
    expect(SOLD.length).toBeGreaterThanOrEqual(9);
  });

  it.each(SOLD)("%s declares a motif", (slug) => {
    const motif = definitionFor(slug).theme.identity?.motif;
    expect(motif, `${slug} has no theme.identity.motif`).toBeDefined();
    expect(PRODUCT_MOTIFS).toContain(motif);
  });

  it("gives no two sold products the same motif", () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const slug of SOLD) {
      const motif = definitionFor(slug).theme.identity?.motif;
      if (!motif) continue;
      const other = seen.get(motif);
      if (other) clashes.push(`${slug} and ${other} both use "${motif}"`);
      else seen.set(motif, slug);
    }
    expect(clashes).toEqual([]);
  });

  it("does not let the motif list grow past the products that use it", () => {
    const used = new Set(SOLD.map((slug) => definitionFor(slug).theme.identity?.motif));
    const unused = PRODUCT_MOTIFS.filter((motif) => !used.has(motif));
    expect(unused, `motifs no product uses: ${unused.join(", ")}`).toEqual([]);
  });
});
