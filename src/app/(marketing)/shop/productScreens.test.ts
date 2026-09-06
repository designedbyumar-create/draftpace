import { describe, expect, it } from "vitest";
import { PRODUCT_SCREENS, screenTourFor, screensFor } from "./productScreens";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

/**
 * The screens map is now shared by three surfaces (Shop cards, the
 * Library shelf, and each owned product's manual), and only the manual
 * shows the captions. That makes a caption easy to forget when a product
 * is added, and a missing one is invisible on the two surfaces that don't
 * use them, so it gets asserted here instead of noticed later.
 */
describe("productScreens", () => {
  it("gives every product with screens a caption for each one", () => {
    for (const slug of Object.keys(PRODUCT_SCREENS)) {
      const tour = screenTourFor(slug);
      expect(tour, slug).not.toBeNull();
      for (const [index, screen] of tour!.entries()) {
        expect(screen.caption, `${slug} screen ${index + 1}`).toBeTruthy();
      }
    }
  });

  it("returns null rather than an empty tour for a product with no screens drawn", () => {
    expect(screensFor("not-a-real-product")).toBeNull();
    expect(screenTourFor("not-a-real-product")).toBeNull();
  });

  it("only maps slugs that are real Shop listings", () => {
    ensureShopRegistered();
    for (const slug of Object.keys(PRODUCT_SCREENS)) {
      expect(shopRegistry.getBySlug(slug), slug).toBeDefined();
    }
  });
});
