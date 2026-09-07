import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

ensureShopRegistered();

/**
 * The one description a search engine and every social card actually
 * quote.
 *
 * It said "seven products for money, home, focus, family, affairs and
 * travel" for as long as there were nine products across eight areas.
 * Nothing caught it, because a stale sentence in a metadata object is
 * not a type error and never breaks a page: it just quietly
 * under-sells the catalogue everywhere Draftpace is linked, which is
 * the single worst place to be out of date.
 *
 * These assert the site-wide copy against the registries rather than
 * against a hard-coded number, so adding a tenth product fails here
 * with a message naming what to fix.
 */
const layoutSource = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf-8");

const COUNT_WORD: Record<number, string> = {
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",
  10: "ten",
  11: "eleven",
  12: "twelve",
};

describe("the site-wide description matches the catalogue it describes", () => {
  const publishedCount = shopRegistry.listPublished().length;
  const areaCount = LIFE_AREAS.length;

  it("has a product count to check against", () => {
    expect(publishedCount).toBeGreaterThan(0);
    expect(COUNT_WORD[publishedCount]).toBeDefined();
  });

  it("says how many products there actually are", () => {
    const word = COUNT_WORD[publishedCount];
    expect(
      layoutSource,
      `src/app/layout.tsx should describe the Companion Series as "${word} products": there are ${publishedCount} published listings. It is quoted in the default description, the Open Graph description and the Twitter description, so fix all three.`
    ).toContain(`${word} products`);
  });

  it("never claims a product count the registry does not have", () => {
    for (const [count, word] of Object.entries(COUNT_WORD)) {
      if (Number(count) === publishedCount) continue;
      expect(
        layoutSource.includes(`${word} products`),
        `src/app/layout.tsx claims "${word} products" but the registry publishes ${publishedCount}.`
      ).toBe(false);
    }
  });

  it("names every life area the shelf actually covers", () => {
    // Any significant word from the label counts, not the first one:
    // "Mind and focus" is legitimately advertised as "focus", and the
    // sentence is marketing copy rather than a list of slugs. What has
    // to hold is that no area is missing from it altogether, which is
    // how vehicles and family health shipped unadvertised.
    const haystack = layoutSource.toLowerCase();
    const skip = new Set(["and", "the", "of"]);
    for (const area of LIFE_AREAS) {
      const words = area.label.toLowerCase().split(/\s+/).filter((w) => !skip.has(w));
      expect(
        words.some((word) => haystack.includes(word)),
        `src/app/layout.tsx's description mentions none of ${JSON.stringify(words)}, so the "${area.label}" area is one of ${areaCount} the shelf covers and is not advertised anywhere a crawler reads.`
      ).toBe(true);
    }
  });
});

describe("the metadata a crawler needs is actually present", () => {
  it("sets a metadataBase, so every relative Open Graph image resolves", () => {
    expect(layoutSource).toContain("metadataBase");
  });

  it("ships an Open Graph image and a large-image Twitter card", () => {
    expect(layoutSource).toContain("og-image.png");
    expect(layoutSource).toContain("summary_large_image");
  });

  it("never hard-codes a Google verification token, which would fail silently", () => {
    expect(layoutSource).toContain("process.env.GOOGLE_SITE_VERIFICATION");
  });
});
