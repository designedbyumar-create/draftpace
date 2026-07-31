import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { productRegistry } from "./registry";
import { ProductDefinitionInput } from "./definition";

const baseCompanionProduct: ProductDefinitionInput = {
  id: "test-companion",
  slug: "test-companion",
  title: "Test Companion",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
  capabilities: ["companion.next-action"],
  navigation: ["start", "workspace"],
  devFixture: false,
};

beforeEach(() => {
  productRegistry.reset();
});

afterEach(() => {
  productRegistry.reset();
  vi.unstubAllEnvs();
});

describe("productRegistry.register", () => {
  it("registers a valid product and makes it retrievable by slug", () => {
    productRegistry.register(baseCompanionProduct);
    expect(productRegistry.getBySlug("test-companion")?.title).toBe("Test Companion");
  });

  it("rejects a second registration with the same slug", () => {
    productRegistry.register(baseCompanionProduct);
    expect(() => productRegistry.register(baseCompanionProduct)).toThrow(/already registered/i);
  });

  it("rejects a product declaring an unknown family", () => {
    expect(() =>
      productRegistry.register({ ...baseCompanionProduct, slug: "unknown-family", family: "not-a-real-family" })
    ).toThrow(/unknown product family/i);
  });

  it("rejects a product declaring a capability its family doesn't support", () => {
    expect(() =>
      productRegistry.register({
        ...baseCompanionProduct,
        slug: "mismatched-capability",
        capabilities: ["automation.trigger"],
      })
    ).toThrow(/not supported by family/i);
  });

  it("rejects a malformed definition via Zod validation", () => {
    expect(() => productRegistry.register({ ...baseCompanionProduct, version: "not-semver" })).toThrow();
  });
});

describe("development fixture exclusion", () => {
  it("excludes a devFixture product from getBySlug/list when fixtures are disabled (production default)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");

    productRegistry.register({ ...baseCompanionProduct, slug: "a-fixture", devFixture: true });

    expect(productRegistry.getBySlug("a-fixture")).toBeUndefined();
    expect(productRegistry.list()).toHaveLength(0);
  });

  it("includes a devFixture product when fixtures are explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "true");

    productRegistry.register({ ...baseCompanionProduct, slug: "a-fixture", devFixture: true });

    expect(productRegistry.getBySlug("a-fixture")?.slug).toBe("a-fixture");
    expect(productRegistry.list()).toHaveLength(1);
  });

  it("never excludes a real (non-fixture) product regardless of environment", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DEV_FIXTURES", "");

    productRegistry.register(baseCompanionProduct);

    expect(productRegistry.getBySlug("test-companion")).toBeDefined();
  });
});
