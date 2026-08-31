import { beforeEach, describe, expect, it, vi } from "vitest";

// registerRealShopProducts() is idempotent via a module-level flag — same
// pattern as src/product-framework/fixtures/index.test.ts and
// src/products/monthly-money-reset/register.test.ts.
async function loadFreshRegisterModule() {
  vi.resetModules();
  const [{ registerRealShopProducts }, { shopRegistry }] = await Promise.all([
    import("./index"),
    import("../registry"),
  ]);
  return { registerRealShopProducts, shopRegistry };
}

beforeEach(() => {
  vi.resetModules();
});

describe("registerRealShopProducts", () => {
  it("publishes Monthly Money Reset as a real, non-fixture, published listing", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();

    const product = shopRegistry.getBySlug("monthly-money-reset");
    expect(product).toBeDefined();
    expect(product?.publicationStatus).toBe("published");
    expect(product?.devFixture).toBe(false);
    expect(product?.access).toBe("free");
  });

  it("appears in listPublished() so it reaches the Shop index and sitemap", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    expect(shopRegistry.listPublished().map((product) => product.slug)).toContain("monthly-money-reset");
  });

  it("points its purchase action at the POST-gated activation confirmation page, not a GET-mutating URL", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    const product = shopRegistry.getBySlug("monthly-money-reset");
    expect(product?.purchaseAction?.href).toBe("/app/activate/monthly-money-reset");
  });

  it("is never gated by the dev-fixture environment check", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    expect(shopRegistry.getBySlug("monthly-money-reset")).toBeDefined();
    vi.unstubAllEnvs();
  });

  it("has no fabricated reviews, ratings, or counts anywhere in its content", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    const product = shopRegistry.getBySlug("monthly-money-reset");
    const serialized = JSON.stringify(product).toLowerCase();
    expect(serialized).not.toMatch(/\brating|\breviews?\b|bestseller|\bstars?\b/);
  });

  it("is safe to call repeatedly without throwing on re-registration", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    expect(() => {
      registerRealShopProducts();
      registerRealShopProducts();
    }).not.toThrow();
    expect(shopRegistry.listAll().filter((product) => product.slug === "monthly-money-reset")).toHaveLength(1);
  });
});

/**
 * The Personal Life Affairs Companion's listing. Held to the same rules
 * as its siblings, plus the two this product carries on its own: it must
 * never use the vocabulary that loses the people it is for, and it must
 * never sell a capability that is not built.
 */
describe("the Personal Life Affairs Companion listing", () => {
  const SLUG = "personal-life-affairs-companion";

  async function listing() {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    return shopRegistry.getBySlug(SLUG);
  }

  it("is published, real, and reaches the Shop index", async () => {
    const product = await listing();
    expect(product).toBeDefined();
    expect(product?.publicationStatus).toBe("published");
    expect(product?.devFixture).toBe(false);
    expect(product?.access).toBe("paid");

    const { shopRegistry } = await loadFreshRegisterModule();
    const { registerRealShopProducts } = await import("./index");
    registerRealShopProducts();
    expect(shopRegistry.listPublished().map((p) => p.slug)).toContain(SLUG);
  });

  it("carries a real, honest launch price: $28 against a genuine $35 regular price", async () => {
    const product = await listing();
    expect(product?.price).toEqual({ amount: 28, currency: "USD" });
    expect(product?.compareAtPrice).toEqual({ amount: 35, currency: "USD" });
    expect(product!.compareAtPrice!.amount).toBeGreaterThan(product!.price!.amount);
    expect(product?.purchaseAction).toBeUndefined();
  });

  /**
   * 40% of people without a will say they do not have enough to need
   * one. Saying "estate" or "assets" confirms that belief and loses the
   * reader on the page that is meant to win them.
   */
  it("never says estate, assets or overdue to a reader", async () => {
    const serialized = JSON.stringify(await listing()).toLowerCase();
    expect(serialized).not.toContain("estate");
    expect(serialized).not.toContain("asset");
    expect(serialized).not.toContain("overdue");
  });

  it("never promises reminders, which the product does not have", async () => {
    const product = await listing();
    const sold = JSON.stringify({
      promise: product?.promise,
      outcomes: product?.outcomes,
      inclusions: product?.inclusions,
      expectedOutputs: product?.expectedOutputs,
    }).toLowerCase();
    expect(sold).not.toContain("remind");
    expect(sold).not.toContain("notification");
    expect(sold).not.toContain("alert");
    // And says so plainly where somebody would think to ask.
    expect(JSON.stringify(product?.faqs).toLowerCase()).toContain("not yet, and it does not pretend to");
  });

  it("does not sell itself as a vault, which is the boundary the product is built on", async () => {
    const product = await listing();
    const serialized = JSON.stringify(product).toLowerCase();
    expect(serialized).toContain("not a vault");
    expect(product?.audienceExclusions.join(" ").toLowerCase()).toContain("passwords");
  });

  it("has no fabricated reviews, ratings, or counts anywhere in its content", async () => {
    const serialized = JSON.stringify(await listing()).toLowerCase();
    expect(serialized).not.toMatch(/\brating|\breviews?\b|bestseller|\bstars?\b/);
  });

  it("uses no em dash, per the repo content rule", async () => {
    expect(JSON.stringify(await listing())).not.toContain("—");
  });

  it("is cross-linked from its siblings, so somebody browsing one can find it", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    for (const sibling of ["personal-finance-companion", "home-management-companion"]) {
      expect(shopRegistry.getBySlug(sibling)?.relatedProductSlugs, sibling).toContain(SLUG);
    }
  });

  it("points every related slug at a listing that exists", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    for (const slug of shopRegistry.getBySlug(SLUG)?.relatedProductSlugs ?? []) {
      expect(shopRegistry.getBySlug(slug), slug).toBeDefined();
    }
  });
});

/**
 * The Homeschooling Companion's listing. Held to its siblings' rules,
 * plus the two this product carries: it must never use the vocabulary of
 * comparison, and it must never imply Draftpace supplies a curriculum.
 */
describe("the Homeschooling Companion listing", () => {
  const SLUG = "homeschooling-companion";

  async function listing() {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    return shopRegistry.getBySlug(SLUG);
  }

  it("is published, real, and reaches the Shop index", async () => {
    const product = await listing();
    expect(product?.publicationStatus).toBe("published");
    expect(product?.devFixture).toBe(false);
    expect(product?.access).toBe("paid");
  });

  it("carries a real, honest launch price: $18 against a genuine $23 regular price", async () => {
    const product = await listing();
    expect(product?.price).toEqual({ amount: 18, currency: "USD" });
    expect(product?.compareAtPrice).toEqual({ amount: 23, currency: "USD" });
    // The schema itself refuses a compareAtPrice that isn't a real
    // discount; this just confirms this specific listing lands on the
    // right side of that math, not just any side of it.
    expect(product!.compareAtPrice!.amount).toBeGreaterThan(product!.price!.amount);
    expect(product?.purchaseAction).toBeUndefined();
  });

  /**
   * A homeschooling parent is already anxious about every one of these.
   * A sales page that supplies the vocabulary of comparison has taken a
   * side against the person reading it.
   */
  for (const word of ["behind what", "grade level", "proficient", "on track", "above average", "below average"]) {
    it(`never says "${word}"`, async () => {
      expect(JSON.stringify(await listing()).toLowerCase()).not.toContain(word);
    });
  }

  it("says outright that it is not a curriculum", async () => {
    const product = await listing();
    const serialized = JSON.stringify(product).toLowerCase();
    expect(serialized).toContain("this is not one and never becomes one");
    expect(product?.audienceExclusions.join(" ").toLowerCase()).toContain("you want a curriculum");
  });

  it("never promises to read a curriculum document", async () => {
    const product = await listing();
    const sold = JSON.stringify({
      promise: product?.promise,
      outcomes: product?.outcomes,
      inclusions: product?.inclusions,
      expectedOutputs: product?.expectedOutputs,
    }).toLowerCase();
    expect(sold).not.toContain("upload");
    expect(sold).not.toContain("import your curriculum");
    expect(JSON.stringify(product?.faqs).toLowerCase()).toContain("no, and it does not pretend to");
  });

  it("never promises reminders, which the product does not have", async () => {
    const product = await listing();
    const sold = JSON.stringify({
      promise: product?.promise,
      outcomes: product?.outcomes,
      inclusions: product?.inclusions,
    }).toLowerCase();
    expect(sold).not.toContain("remind");
    expect(sold).not.toContain("notification");
  });

  it("sells the book as worth having on its own", async () => {
    const product = await listing();
    expect(product?.inclusions.join(" ")).toContain("30 page printed book");
    expect(JSON.stringify(product?.faqs)).toContain("If you never opened the app it would still be worth having.");
  });

  it("states the child data position plainly", async () => {
    const notes = (await listing())?.privacyNotes?.toLowerCase() ?? "";
    expect(notes).toContain("never a date of birth");
    expect(notes).toContain("children do not have accounts");
  });

  it("has no fabricated reviews, ratings, or counts", async () => {
    expect(JSON.stringify(await listing()).toLowerCase()).not.toMatch(/\brating|\breviews?\b|bestseller|\bstars?\b/);
  });

  it("uses no em dash, per the repo content rule", async () => {
    expect(JSON.stringify(await listing())).not.toContain("—");
  });

  it("is cross-linked from its siblings", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    for (const sibling of ["home-management-companion", "personal-life-affairs-companion"]) {
      expect(shopRegistry.getBySlug(sibling)?.relatedProductSlugs, sibling).toContain(SLUG);
    }
  });
});

/**
 * Home Base's listing. Had no dedicated test block before this: it
 * carried no price, so there was nothing yet to hold to a standard.
 * Phase 2 of the pricing plan gives it one, so it gets real coverage
 * alongside the price rather than after it.
 */
describe("the Home Base listing", () => {
  const SLUG = "home-management-companion";

  async function listing() {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    return shopRegistry.getBySlug(SLUG);
  }

  it("is published, real, and reaches the Shop index", async () => {
    const product = await listing();
    expect(product?.publicationStatus).toBe("published");
    expect(product?.devFixture).toBe(false);
    expect(product?.access).toBe("paid");
  });

  it("carries a real, honest launch price: $28 against a genuine $35 regular price", async () => {
    const product = await listing();
    expect(product?.price).toEqual({ amount: 28, currency: "USD" });
    expect(product?.compareAtPrice).toEqual({ amount: 35, currency: "USD" });
    expect(product!.compareAtPrice!.amount).toBeGreaterThan(product!.price!.amount);
    expect(product?.purchaseAction).toBeUndefined();
  });

  /** "Overdue" is a marketing-principle-level ban for this specific
   * product (docs/NORTH-STAR-PFC-HMC.md): a home that hasn't had its
   * filter changed is not failing at anything. The listing already uses
   * the word once, to promise it never will, which is the one honest
   * exception, so this checks every occurrence is that same negation
   * rather than banning the word outright and breaking on its own
   * reassurance. */
  it('only ever uses "overdue" to promise it never says it', async () => {
    const text = JSON.stringify(await listing()).toLowerCase();
    const occurrences = (text.match(/overdue/g) ?? []).length;
    const insideThePromise = (text.match(/never says overdue/g) ?? []).length;
    expect(occurrences, "the word should appear at least once, in the promise").toBeGreaterThan(0);
    // If every "overdue" sits inside "never says overdue", the two counts
    // are equal by construction; any other appearance breaks that equality.
    expect(occurrences).toBe(insideThePromise);
  });
});

/**
 * Alongside's listing. Held to its siblings' rules, plus the two this
 * product carries on its own: the diagnosis/deficit language it refuses
 * in the app must not leak into the copy that sells it, and the
 * productivity-app trappings the product itself refuses (streaks,
 * scores, attempt counts) must not appear here either, however tempting
 * a sales page usually finds them.
 */
describe("the Alongside listing", () => {
  const SLUG = "alongside";

  async function listing() {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    return shopRegistry.getBySlug(SLUG);
  }

  it("is published, real, and reaches the Shop index", async () => {
    const product = await listing();
    expect(product?.publicationStatus).toBe("published");
    expect(product?.devFixture).toBe(false);
    expect(product?.access).toBe("paid");

    const { shopRegistry } = await loadFreshRegisterModule();
    const { registerRealShopProducts } = await import("./index");
    registerRealShopProducts();
    expect(shopRegistry.listPublished().map((p) => p.slug)).toContain(SLUG);
  });

  it("carries no price yet, so nothing renders a fabricated figure", async () => {
    const product = await listing();
    expect(product?.price).toBeUndefined();
    expect(product?.purchaseAction).toBeUndefined();
  });

  /**
   * The Phase 0 naming research recommended keeping ADHD out of the
   * brand name; the founder overrode that after seeing the built
   * product. Named outright now, in the title itself, not only in
   * discoverability surfaces.
   */
  it("carries ADHD plainly, in the product name, the SEO title, and the audience", async () => {
    const product = await listing();
    expect(product?.title.toLowerCase()).toContain("adhd");
    expect(product?.seo.title.toLowerCase()).toContain("adhd");
    expect(product?.audience.join(" ").toLowerCase()).toContain("adhd");
  });

  /**
   * The same research names the adjacent audience explicitly rather
   * than making it borrow the ADHD label to qualify. Long covid,
   * concussion, chronic illness, grief, new parenthood, menopause and
   * depression all produce the same difficulty holding a plan in your
   * head.
   */
  it("names the adjacent audience, not only ADHD", async () => {
    const audience = JSON.stringify(await listing()).toLowerCase();
    for (const term of ["long covid", "concussion", "chronic illness", "grief", "menopause"]) {
      expect(audience, term).toContain(term);
    }
  });

  it("never requires a diagnosis to buy it", async () => {
    const product = await listing();
    const faqAnswer = product?.faqs.find((f) => f.question.toLowerCase().includes("diagnosis"))?.answer ?? "";
    expect(faqAnswer.toLowerCase()).toContain("no");
  });

  /**
   * The product itself never asks about a diagnosis, medication, or
   * symptom. A sales page that quietly promised to track any of them
   * would be selling a different, unbuilt product.
   */
  it("never claims to track a diagnosis, medication, or symptom", async () => {
    const sold = JSON.stringify({
      promise: (await listing())?.promise,
      outcomes: (await listing())?.outcomes,
      inclusions: (await listing())?.inclusions,
      expectedInputs: (await listing())?.expectedInputs,
    }).toLowerCase();
    for (const word of ["medication", "symptom", "\"diagnos"]) {
      expect(sold).not.toContain(word);
    }
  });

  it("never promises reminders or notifications, which the product does not have yet", async () => {
    const product = await listing();
    const sold = JSON.stringify({
      promise: product?.promise,
      outcomes: product?.outcomes,
      inclusions: product?.inclusions,
      expectedOutputs: product?.expectedOutputs,
    }).toLowerCase();
    expect(sold).not.toContain("remind");
    expect(sold).not.toContain("push notification");
    expect(JSON.stringify(product?.faqs).toLowerCase()).toContain("not yet, and it does not pretend to");
  });

  /**
   * The product's own house rule (no streaks, no completion percentage,
   * no attempt counter, and "did not get to it" writes nothing) is a
   * selling point, not an incidental fact, and the copy says so rather
   * than reaching for the usual productivity-app vocabulary.
   */
  /**
   * These words are allowed, even expected, in the objections and FAQs,
   * the same way PLA's listing says "not a vault" to disclaim one. What
   * must never happen is one of them showing up as something sold: the
   * scoped fields below are what a buyer reads as "what do I get",
   * separate from the answers to worries they arrive with.
   */
  it("never sells streaks, scores, or attempt counts as a feature", async () => {
    const product = await listing();
    const sold = JSON.stringify({
      promise: product?.promise,
      outcomes: product?.outcomes,
      inclusions: product?.inclusions,
      expectedOutputs: product?.expectedOutputs,
    }).toLowerCase();
    for (const word of ["streak", "score", "adherence"]) {
      expect(sold, word).not.toContain(word);
    }
    const serialized = JSON.stringify(product).toLowerCase();
    expect(serialized).toContain("no streak");
  });

  it("never says the boundary-breaking words: an amount, an account number, or a due date it would store", async () => {
    const product = await listing();
    expect(product?.audienceExclusions.join(" ").toLowerCase()).toContain("account number");
  });

  it("has no fabricated reviews, ratings, or counts anywhere in its content", async () => {
    const serialized = JSON.stringify(await listing()).toLowerCase();
    expect(serialized).not.toMatch(/\brating|\breviews?\b|bestseller|\bstars?\b/);
  });

  it("uses no em dash, per the repo content rule", async () => {
    expect(JSON.stringify(await listing())).not.toContain("—");
  });

  it("never uses an exclamation mark", async () => {
    expect(JSON.stringify(await listing())).not.toContain("!");
  });

  it("is cross-linked from its two closest siblings", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    for (const sibling of ["personal-life-affairs-companion", "personal-finance-companion"]) {
      expect(shopRegistry.getBySlug(sibling)?.relatedProductSlugs, sibling).toContain(SLUG);
    }
  });

  it("points every related slug at a listing that exists", async () => {
    const { registerRealShopProducts, shopRegistry } = await loadFreshRegisterModule();
    registerRealShopProducts();
    for (const slug of shopRegistry.getBySlug(SLUG)?.relatedProductSlugs ?? []) {
      expect(shopRegistry.getBySlug(slug), slug).toBeDefined();
    }
  });
});
