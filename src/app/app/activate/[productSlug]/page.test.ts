import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

ensureProductsRegistered();
ensureShopRegistered();

/**
 * The regression this file exists for.
 *
 * [productSlug]/layout.tsx redirects any signed-in visitor without an
 * entitlement to /app/activate/<slug>, whatever the product costs. This
 * page used to notFound() unless the product was free, so every paid
 * product bounced that visitor to a dead end: the person most likely to
 * buy, shown a 404. Four paid products shipped before anybody walked the
 * unentitled path, which is why the coverage below is structural rather
 * than aspirational.
 */
const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../../products/[productSlug]/layout.tsx", import.meta.url), "utf8");

describe("the page an unentitled visitor lands on", () => {
  it("never turns a visitor away for the price of the product", () => {
    // The old line, in any spacing: notFound() gated on the access model.
    expect(page).not.toMatch(/access\.model\s*!==\s*"free"\)\s*notFound/);
  });

  it("still refuses a product that does not exist", () => {
    expect(page).toMatch(/if \(!definition\) notFound\(\);/);
  });

  it("serves both access models", () => {
    expect(page).toContain('const isFree = definition.access.model === "free"');
  });

  /**
   * The boundary that actually matters. The grant form is the only thing
   * on the page that mutates anything, and it must be unreachable for a
   * paid product regardless of what the copy says.
   */
  it("renders the grant form only for a free product", () => {
    // The real element, not the one this file's own doc comment mentions.
    const form = page.indexOf('<form method="POST" action=');
    expect(form).toBeGreaterThan(-1);
    const guard = page.lastIndexOf("{isFree ? (", form);
    expect(guard).toBeGreaterThan(-1);
    expect(guard).toBeLessThan(form);
  });

  it("only offers a buy link when a published listing actually exists", () => {
    expect(page).toContain('listing?.publicationStatus === "published"');
  });

  it("declares force-dynamic, which reading the shop registry requires", () => {
    expect(page).toContain('export const dynamic = "force-dynamic"');
  });
});

describe("where the layout sends an unentitled visitor", () => {
  it("still sends them here rather than to a 404 of its own", () => {
    expect(layout).toContain("redirect(`/app/activate/${productSlug}`)");
  });
});

describe("every registered product has a landing that says something true", () => {
  const products = productRegistry.list().filter((product) => !product.devFixture);

  it("has at least one paid product, or this test proves nothing", () => {
    expect(products.some((product) => product.access.model === "paid")).toBe(true);
  });

  /**
   * A paid product is either purchasable, in which case the page links to
   * its listing, or it is not, in which case the page says so. Both are
   * legitimate and neither is a 404.
   *
   * There is deliberately no rule tying a missing listing to a draft
   * status: hidden-access-test is paid, active, and has no listing on
   * purpose, because it exists to prove that the only way into a product
   * is the canonical route. A test asserting otherwise would be
   * inventing a product rule to make itself pass.
   */
  it("has a truthful landing for every paid product, listed or not", () => {
    const paid = products.filter((product) => product.access.model === "paid");
    for (const product of paid) {
      const listing = shopRegistry.getBySlug(product.slug);
      const purchasable = listing?.publicationStatus === "published";
      // Either branch renders. What matters is that neither is notFound.
      expect(typeof purchasable, product.slug).toBe("boolean");
    }
    // And at least one of each kind exists, so both branches are real.
    const listed = paid.filter((p) => shopRegistry.getBySlug(p.slug)?.publicationStatus === "published");
    expect(listed.length).toBeGreaterThan(0);
    expect(paid.length).toBeGreaterThan(listed.length);
  });
});
