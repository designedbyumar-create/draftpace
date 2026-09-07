import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { shopRegistry } from "./registry";
import { ensureShopRegistered } from "./ensureRegistered";
import { LIFE_AREAS } from "@/content/areas";

ensureShopRegistered();

/**
 * The free product is an invitation, not an item in the catalogue.
 *
 * WHAT WENT WRONG, AND WHY IT WAS INVISIBLE
 *
 * Monthly Money Reset was first in `productSlugs` for the money area.
 * Every marketing surface that shows one product per area takes
 * `productSlugs[0]`, so the homepage hero's Money panel, the highest
 * value slot on the site, advertised the free product with a price row
 * reading "Free", and Personal Finance Companion was not visible there
 * at all. The same ordering made it the first card in the Shop, which
 * anchored every price after it against zero.
 *
 * None of that was a bug in any single file. It was one array order
 * read by three surfaces, which is exactly the kind of thing no type
 * error and no failing build ever catches. These assert the positioning
 * itself.
 */
const read = (path: string) => readFileSync(join(process.cwd(), path), "utf-8");

describe("the free product does not sit in the priced catalogue", () => {
  const free = shopRegistry.listPublishedFree();
  const paid = shopRegistry.listPublishedPaid();

  it("has both a free product and paid ones to keep apart", () => {
    expect(free.length).toBeGreaterThan(0);
    expect(paid.length).toBeGreaterThan(0);
  });

  it("splits published listings cleanly, losing none of them", () => {
    expect(free.length + paid.length).toBe(shopRegistry.listPublished().length);
  });

  it("keeps every free listing out of the paid set", () => {
    for (const product of paid) {
      expect(product.access, `${product.slug} is in listPublishedPaid()`).not.toBe("free");
    }
  });

  it("builds the Shop grid and the homepage series from paid listings only", () => {
    expect(read("src/app/(marketing)/shop/page.tsx")).toContain("listPublishedPaid()");
    expect(read("src/components/public/home/ShopPreview.tsx")).toContain("listPublishedPaid()");
  });

  it("never lets a free product lead a life area, which is what the hero shows", () => {
    const freeSlugs = new Set(free.map((product) => product.slug));
    for (const area of LIFE_AREAS) {
      const lead = area.productSlugs[0];
      if (!lead) continue;
      expect(
        freeSlugs.has(lead),
        `"${area.label}" leads with ${lead}, which is free. Every surface showing one product per area takes productSlugs[0], so this puts the free product in the homepage hero and at the top of the Shop, ahead of the paid product for the same area.`
      ).toBe(false);
    }
  });
});

describe("the free product has its own page, and one canonical URL", () => {
  it("sends a free product's Shop URL to /free permanently", () => {
    const source = read("src/app/(marketing)/shop/[productSlug]/page.tsx");
    expect(source).toContain("permanentRedirect");
    expect(source).toContain('product.access === "free"');
  });

  it("lists /free in the sitemap, above every paid listing", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).toContain('route: "/free"');
    // Paid listings sit at 0.7; the acquisition page has to outrank them.
    expect(sitemap).toMatch(/route: "\/free"[^}]*priority: 0\.9/);
  });

  it("keeps redirected URLs out of the sitemap", () => {
    // Listing a permanent redirect asks a crawler to index a hop.
    expect(read("src/app/sitemap.ts")).toContain("listPublishedPaid()");
  });

  it("promotes the free product on the homepage, but never in the hero", () => {
    const home = read("src/app/(marketing)/page.tsx");
    expect(home).toContain('href="/free"');
    // The hero is the CompanionPicker. The free link must come after it
    // in the document, not inside it.
    const heroAt = home.indexOf("<CompanionPicker");
    const freeLinkAt = home.indexOf('href="/free"');
    expect(heroAt).toBeGreaterThan(-1);
    expect(
      freeLinkAt,
      "the free product is being promoted in or above the hero, which is the slot it was moved out of"
    ).toBeGreaterThan(heroAt);
  });
});
