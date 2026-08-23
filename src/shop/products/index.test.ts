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

  it("carries no price yet, so nothing renders a fabricated figure", async () => {
    const product = await listing();
    expect(product?.price).toBeUndefined();
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

  it("carries no price yet, so nothing renders a fabricated figure", async () => {
    const product = await listing();
    expect(product?.price).toBeUndefined();
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
