import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { resolvePrimaryDestinationIds } from "@/product-framework/navigationResolver";

ensureProductsRegistered();

/**
 * The rail is shared, and its icon map is keyed by destination id rather
 * than by product. That is fine until a product declares a destination
 * nobody has drawn yet, at which point its bottom bar renders some items
 * with a glyph and some without, which reads as a rendering fault rather
 * than as restraint. It is invisible on desktop and only shows on a
 * phone, so it is asserted here instead of hoped for.
 */
const source = readFileSync(new URL("./ProductRailShell.tsx", import.meta.url), "utf8");
const mapped = new Set(
  [...source.matchAll(/^\s{2}([a-z][a-zA-Z-]*): [A-Z][A-Za-z0-9]*,$/gm)].map((match) => match[1])
);

describe("the rail's icon map", () => {
  const railProducts = productRegistry.list().filter((product) => product.navigationStyle === "rail");

  it("covers every primary destination of every product that uses the rail", () => {
    expect(railProducts.length).toBeGreaterThan(0);
    for (const product of railProducts) {
      for (const destination of resolvePrimaryDestinationIds(product)) {
        expect(mapped, `${product.slug} -> ${destination}`).toContain(destination);
      }
    }
  });

  it("gives a rail product either every icon or none, never a mixture", () => {
    for (const product of railProducts) {
      const ids = resolvePrimaryDestinationIds(product);
      const covered = ids.filter((id) => mapped.has(id)).length;
      expect([0, ids.length], product.slug).toContain(covered);
    }
  });
});
