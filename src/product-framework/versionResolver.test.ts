import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { productRegistry } from "./registry";
import { resolveProductVersion } from "./versionResolver";
import { ProductDefinitionInput } from "./definition";

beforeEach(() => {
  productRegistry.reset();
  productRegistry.register({
    id: "versioned",
    slug: "versioned",
    title: "Versioned Product",
    family: "tracker",
    version: "1.2.0",
    status: "active",
    access: { model: "free" },
    capabilities: [],
    navigation: [],
  } satisfies ProductDefinitionInput);
});

afterEach(() => {
  productRegistry.reset();
});

describe("resolveProductVersion", () => {
  it("resolves a registered slug with no version requested", () => {
    expect(resolveProductVersion("versioned")?.version).toBe("1.2.0");
  });

  it("resolves when the requested version matches", () => {
    expect(resolveProductVersion("versioned", "1.2.0")?.version).toBe("1.2.0");
  });

  it("fails closed when the requested version doesn't match what's registered", () => {
    expect(resolveProductVersion("versioned", "2.0.0")).toBeUndefined();
  });

  it("returns undefined for a slug that was never registered", () => {
    expect(resolveProductVersion("does-not-exist")).toBeUndefined();
  });
});
