import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { productRegistry } from "./registry";
import { resolveProductNavigation, resolveWorkspaceLabel, resolveDestinationLabel } from "./navigationResolver";
import { ProductDefinitionInput } from "./definition";

beforeEach(() => {
  productRegistry.reset();
});

afterEach(() => {
  productRegistry.reset();
});

function register(overrides: Partial<ProductDefinitionInput>) {
  const base: ProductDefinitionInput = {
    id: "nav-test",
    slug: "nav-test",
    title: "Nav Test",
    family: "learning",
    version: "0.1.0",
    status: "draft",
    access: { model: "free" },
    capabilities: [],
    navigation: [],
  };
  return productRegistry.register({ ...base, ...overrides });
}

describe("resolveProductNavigation", () => {
  it("falls back to the family default when a product declares no navigation", () => {
    const product = register({});
    expect(resolveProductNavigation(product)).toEqual(
      expect.arrayContaining(["start", "setup", "workspace", "progress", "history"])
    );
  });

  it("uses the product's own declared navigation when present", () => {
    const product = register({ slug: "lean", id: "lean", navigation: ["start", "workspace"] });
    expect(resolveProductNavigation(product)).toEqual(["start", "workspace"]);
  });

  it("always includes start even if a product forgets to declare it", () => {
    const product = register({ slug: "no-start", id: "no-start", navigation: ["workspace", "history"] });
    expect(resolveProductNavigation(product)).toContain("start");
  });
});

describe("resolveWorkspaceLabel", () => {
  it("uses the product's own workspaceLabel when set", () => {
    const product = register({ slug: "custom-label", id: "custom-label", workspaceLabel: "Deploy" });
    expect(resolveWorkspaceLabel(product)).toBe("Deploy");
  });

  it("falls back to the family's default workspace label", () => {
    const product = register({ slug: "family-label", id: "family-label" });
    expect(resolveWorkspaceLabel(product)).toBe("Learn"); // learning family default
  });
});

describe("resolveDestinationLabel", () => {
  it("routes the workspace destination through resolveWorkspaceLabel", () => {
    const product = register({ slug: "d-label", id: "d-label", workspaceLabel: "Automate" });
    expect(resolveDestinationLabel(product, "workspace")).toBe("Automate");
  });

  it("uses the generic default label for a core destination", () => {
    const product = register({ slug: "d-label-2", id: "d-label-2" });
    expect(resolveDestinationLabel(product, "progress")).toBe("Progress");
  });
});
