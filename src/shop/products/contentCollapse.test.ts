import { describe, expect, it } from "vitest";
import { shopRegistry } from "../registry";
import { ensureShopRegistered } from "../ensureRegistered";
import { allQuestions, questionsForStage } from "../definition";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

ensureShopRegistered();
ensureProductsRegistered();

/**
 * The guards that keep the content collapse from quietly coming undone.
 *
 * Before this, a listing carried the same worry three times: once in
 * `objections`, again in `faqs`, and a third time as an `outcome` that
 * restated a `problemsSolved` solution word for word. The Shop page
 * rendered objections and faqs a few hundred pixels apart, and the
 * Library manual rendered outcomes again, so an owner read the same
 * sentence in three places and learned nothing new from any of them.
 *
 * `questions`, `searchedProblems` and `tasks` replaced all of it. The
 * old fields still exist, and `allQuestions()` still falls back to them,
 * because that fallback is what let the nine listings migrate one at a
 * time rather than in one unreviewable change. Now that all nine have
 * migrated, these assert nobody drifts back.
 *
 * The task-destination check is the important one. A `destination` is a
 * link an owner taps from the manual, and a wrong id is a 404 that no
 * type error and no build failure would catch, which is exactly how the
 * three missing product routes shipped (see productRoutes.test.ts).
 */
describe("every published listing has migrated onto the collapsed content model", () => {
  const listings = shopRegistry.listPublished();

  it("has listings to check", () => {
    expect(listings.length).toBeGreaterThan(0);
  });

  for (const listing of listings) {
    describe(listing.title, () => {
      it("asks its questions once, in `questions`, not twice across objections and faqs", () => {
        expect(listing.questions.length).toBeGreaterThan(0);
        expect(listing.objections).toEqual([]);
        expect(listing.faqs).toEqual([]);
      });

      it("does not restate a problemsSolved solution as a separate outcome", () => {
        expect(listing.outcomes).toEqual([]);
        expect(listing.problemsSolved.length).toBeGreaterThan(0);
      });

      it("has something to say at both moments: deciding and owning", () => {
        expect(questionsForStage(listing, "deciding").length).toBeGreaterThan(0);
        expect(questionsForStage(listing, "owning").length).toBeGreaterThan(0);
      });

      it("names the problems people search for, and the tasks an owner opens the manual to do", () => {
        expect(listing.searchedProblems.length).toBeGreaterThan(0);
        expect(listing.tasks.length).toBeGreaterThan(0);
      });

      it("never asks the same question twice", () => {
        const asked = allQuestions(listing).map((q) => q.question.toLowerCase());
        expect(new Set(asked).size).toBe(asked.length);
      });

      it("links every task to a destination the product actually has", () => {
        const product = productRegistry.getBySlug(listing.slug);
        // A listing can exist for a product that is not in the registry
        // in this environment; nothing to check against in that case.
        if (!product) return;
        for (const task of listing.tasks) {
          if (!task.destination) continue;
          expect(
            product.navigation,
            `${listing.slug}'s manual task "${task.label}" links to "${task.destination}", which is not one of that product's destinations (${product.navigation.join(", ")}), so the link is a 404`
          ).toContain(task.destination);
        }
      });
    });
  }
});
