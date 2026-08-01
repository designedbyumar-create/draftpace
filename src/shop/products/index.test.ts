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
