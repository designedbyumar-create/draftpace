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
  }, 20000);

  it("marks provisional branding explicitly in a response header, never silently", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "personal-finance-companion" }),
    });
    expect(response.headers.get("X-Draftpace-Pwa-Branding")).toBe("provisional");
  });

  it("returns 404 for a product with no pwa field declared (e.g. Monthly Money Reset), not an empty manifest", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "monthly-money-reset" }),
    });
    expect(response.status).toBe(404);
  }, 20000);

  it("returns 404 for an unknown product slug", async () => {
    const { GET } = await loadFreshRoute();
    const response = await GET(new Request("https://draftpace.com/x"), {
      params: Promise.resolve({ productSlug: "does-not-exist" }),
    });
    expect(response.status).toBe(404);
  }, 20000);
});
