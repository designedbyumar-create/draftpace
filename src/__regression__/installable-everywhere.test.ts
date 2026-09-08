import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

ensureProductsRegistered();
ensureShopRegistered();

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

/**
 * "It works like an app" is a claim, and a claim has to be true of every
 * product that makes it and available on every product that could.
 *
 * WHAT WENT WRONG BEFORE THIS EXISTED
 *
 * Monthly Money Reset was the one real product with no `pwa` block, which
 * meant the free product, the first thing most people ever open, was the
 * only one that could not be added to a Home Screen. Its page said
 * nothing about installing either, because there was nothing to say. The
 * gap was invisible: every gate passed, and the product page's install
 * section simply did not render.
 */
describe("every product a customer can get is installable", () => {
  /**
   * Scoped to products with a published Shop listing, which is the honest
   * definition of "a product somebody can end up owning". It deliberately
   * excludes hidden-access-test: an internal, unlisted product reachable
   * only through a manual service-role grant, with no Shop listing and
   * nobody to install it.
   */
  const real = shopRegistry
    .listPublished()
    .filter((listing) => !listing.devFixture)
    .map((listing) => productRegistry.getBySlug(listing.slug))
    .filter((definition): definition is NonNullable<typeof definition> => Boolean(definition));

  it("has real products to check", () => {
    expect(real.length).toBeGreaterThan(0);
  });

  for (const definition of real) {
    it(`${definition.slug} declares pwa, so it can be added to a Home Screen`, () => {
      expect(
        definition.pwa,
        `${definition.slug} is a real product with no pwa block, so it serves no manifest and cannot be installed. Free or paid makes no difference.`
      ).toBeDefined();
    });
  }

  it("gives every one of them its own icon, so no two land as the same square", () => {
    const seen = new Map<string, string>();
    for (const definition of real) {
      const src = definition.pwa?.icons[0]?.src;
      expect(src, `${definition.slug} declares no icon`).toBeTruthy();
      const owner = seen.get(src!);
      expect(owner, `${definition.slug} and ${owner} both install "${src}"`).toBeUndefined();
      seen.set(src!, definition.slug);
    }
  });

  it("ships none of them with placeholder branding", () => {
    for (const definition of real) {
      expect(definition.pwa?.provisionalBranding, `${definition.slug}`).toBe(false);
    }
  });
});

/**
 * The two public pages a buyer reads before deciding. Both must explain
 * installing, and both must cover all three platforms: an iPhone owner
 * told only about Chrome learns nothing, and Safari is the one platform
 * with no install prompt at all, so the instruction is the whole control
 * there rather than a nicety.
 */
describe("both public product surfaces explain how to install", () => {
  const surfaces = {
    "the paid product page": read("src/app/(marketing)/shop/[productSlug]/page.tsx"),
    "the free product page": read("src/app/(marketing)/free/page.tsx"),
  };

  for (const [name, source] of Object.entries(surfaces)) {
    it(`${name} says it works like an app`, () => {
      expect(source).toContain("without an app store");
    });

    it(`${name} covers iPhone, Android and desktop, not just one`, () => {
      expect(source, "no iOS instruction, the one platform with no install prompt").toContain("Add to Home Screen");
      expect(source, "no Android instruction").toMatch(/Android/);
      expect(source, "no desktop instruction").toMatch(/Chrome and Edge/);
    });
  }
});

/**
 * A Shop listing whose product is installable, on a page that says so.
 * Catches a listing published ahead of its product definition.
 */
describe("no published listing outruns its product", () => {
  it("has a real product definition behind every published listing", () => {
    for (const listing of shopRegistry.listPublished()) {
      if (listing.devFixture) continue;
      const definition = productRegistry.getBySlug(listing.slug);
      expect(definition, `"${listing.slug}" is published in the Shop with no product definition`).toBeDefined();
      expect(
        definition?.pwa,
        `"${listing.slug}" is published and its page claims it installs, but its product declares no pwa`
      ).toBeDefined();
    }
  });
});
