import { describe, expect, it, beforeEach, vi } from "vitest";

/**
 * ensureProductsRegistered() is idempotent via a module-level flag — see
 * src/products/manifest.test.ts's identical pattern for why each test
 * needs a fresh module graph.
 */
async function loadFreshRoute() {
  vi.resetModules();
  return import("./route");
}

/** The registry from the same fresh module graph the route just used. */
async function loadFreshRegistry() {
  const [{ productRegistry }, { ensureProductsRegistered }] = await Promise.all([
    import("@/product-framework/registry"),
    import("@/products/manifest"),
  ]);
  ensureProductsRegistered();
  return productRegistry;
}

beforeEach(() => {
  vi.resetModules();
});

describe("GET /app/products/[productSlug]/manifest.webmanifest", () => {
  it("serves Personal Finance Companion's own manifest, distinct from the site-wide one", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "personal-finance-companion" }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/manifest+json");

    const manifest = await response.json();
    expect(manifest.name).toBe("Personal Finance Companion");
    expect(manifest.short_name).toBe("Finance");
    expect(manifest.start_url).toBe("/app/products/personal-finance-companion");
    expect(manifest.scope).toBe("/app/products/personal-finance-companion/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
  }, 40000);

  /**
   * The header reports the definition's own provisionalBranding flag, so
   * anything inspecting a manifest can tell placeholder branding from
   * shipped branding. This used to pin Personal Finance Companion as
   * "provisional", which stopped being true the moment every product got
   * its own real icon; asserting the mechanism instead means the next
   * product to ship provisionally is still covered.
   */
  it("reports each product's own branding status in a response header, never silently", async () => {
    const { GET } = await loadFreshRoute();
    const productRegistry = await loadFreshRegistry();

    for (const definition of productRegistry.list()) {
      if (!definition.pwa) continue;
      const response = await GET(new Request("https://draftpace.com/x"), {
        params: Promise.resolve({ productSlug: definition.slug }),
      });
      expect(
        response.headers.get("X-Draftpace-Pwa-Branding"),
        `${definition.slug}'s manifest header disagrees with its own provisionalBranding flag`
      ).toBe(definition.pwa.provisionalBranding ? "provisional" : "final");
    }
  }, 40000);

  it("gives every installable product its own icon, so two Companions are not the same square", async () => {
    const productRegistry = await loadFreshRegistry();
    const seen = new Map<string, string>();

    for (const definition of productRegistry.list()) {
      if (!definition.pwa) continue;
      const src = definition.pwa.icons[0]?.src;
      expect(src, `${definition.slug} declares no PWA icon`).toBeTruthy();
      const owner = seen.get(src!);
      expect(
        owner,
        `${definition.slug} and ${owner} both install "${src}", so they land on the Home Screen as identical icons`
      ).toBeUndefined();
      seen.set(src!, definition.slug);
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("returns 404 for a product with no pwa field declared (e.g. Monthly Money Reset), not an empty manifest", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "monthly-money-reset" }),
    });
    expect(response.status).toBe(404);
  }, 40000);

  it("returns 404 for an unknown product slug", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "does-not-exist" }),
    });
    expect(response.status).toBe(404);
  }, 40000);
});
