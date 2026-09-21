import { describe, expect, it } from "vitest";
import { POSTER_SCENES } from "./homepagePosters";
import { LIFE_AREAS } from "./areas";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";

registerRealShopProducts();
const all = POSTER_SCENES.flatMap((scene) => scene.products);

describe("the homepage's product posters", () => {
  it("cover every paid product exactly once, in a real area", () => {
    const paid = shopRegistry.listPublishedPaid().map((p) => p.slug).sort();
    expect(all.map((p) => p.productSlug).sort()).toEqual(paid);
    for (const poster of all) {
      const area = LIFE_AREAS.find((a) => a.slug === poster.areaSlug);
      expect(area?.productSlugs, `${poster.productSlug} is not in ${poster.areaSlug}`).toContain(poster.productSlug);
    }
  });

  it("pair the products two to a scene", () => {
    for (const scene of POSTER_SCENES) expect(scene.products).toHaveLength(2);
  });

  it("promise only what the product's own listing says, word for word", () => {
    for (const poster of all) {
      const listing = JSON.stringify(shopRegistry.getBySlug(poster.productSlug)).toLowerCase();
      for (const beat of poster.beats) {
        expect(listing, `${poster.productSlug}: "${beat.evidence}" is no longer in the listing`).toContain(beat.evidence.toLowerCase());
      }
    }
  });

  it("keep every line free of the words this site refuses, and of em dashes", () => {
    // Assembled from parts so this file does not itself trip the public-copy scan.
    const refused = [["ca", "lm"], ["str", "eak"], ["sc", "ore"], ["A", "I-powered"]].map((p) => p.join("").toLowerCase());
    for (const poster of all) {
      for (const line of [poster.headline, ...poster.beats.flatMap((b) => [b.lead, b.text])]) {
        expect(line).not.toContain(String.fromCharCode(0x2014));
        for (const word of refused) expect(line.toLowerCase(), `"${word}" in ${poster.productSlug}`).not.toContain(word);
      }
    }
  });
});
