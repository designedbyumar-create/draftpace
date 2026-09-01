import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { shopRegistry } from "./registry";
import type { ShopProductInput } from "./definition";

const base: ShopProductInput = {
  id: "test-product",
  slug: "test-product",
  publicationStatus: "published",
  title: "Test Product",
  promise: "A promise.",
  problem: "A problem.",
  access: "free",
  seo: { title: "Test Product", description: "A test." },
  availability: "available",
};

beforeEach(() => {
  shopRegistry.reset();
});

afterEach(() => {
  shopRegistry.reset();
  vi.unstubAllEnvs();
});

describe("shopRegistry", () => {
  it("registers and retrieves a published product", () => {
    shopRegistry.register(base);
    expect(shopRegistry.getBySlug("test-product")?.title).toBe("Test Product");
  });

  it("only lists published products via listPublished", () => {
    shopRegistry.register(base);
    shopRegistry.register({ ...base, id: "draft-product", slug: "draft-product", publicationStatus: "draft" });
    expect(shopRegistry.listPublished()).toHaveLength(1);
    expect(shopRegistry.listAll()).toHaveLength(2);
  });

  it("rejects a duplicate slug", () => {
    shopRegistry.register(base);
    expect(() => shopRegistry.register(base)).toThrow(/already registered/i);
  });

  it("excludes a devFixture product when dev fixtures are disabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");
    shopRegistry.register({ ...base, id: "fixture", slug: "fixture", devFixture: true });
    expect(shopRegistry.getBySlug("fixture")).toBeUndefined();
    expect(shopRegistry.listAll()).toHaveLength(0);
  });

  it("never excludes a real (non-fixture) product regardless of environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");
    shopRegistry.register(base);
    expect(shopRegistry.getBySlug("test-product")).toBeDefined();
  });
});
