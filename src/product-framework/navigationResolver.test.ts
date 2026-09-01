import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { productRegistry } from "./registry";
import {
  resolveProductNavigation,
  resolveWorkspaceLabel,
  resolveDestinationLabel,
  resolvePrimaryDestinationIds,
  resolveLifecycleNavigation,
} from "./navigationResolver";
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

describe("resolvePrimaryDestinationIds", () => {
  it("defaults to workspace/progress/history-equivalents among the declared destinations", () => {
    const product = register({
      slug: "primary-default",
      id: "primary-default",
      navigation: ["start", "setup", "workspace", "progress", "history", "settings"],
    });
    expect(resolvePrimaryDestinationIds(product)).toEqual(["workspace", "progress", "history"]);
  });

  it("uses the product's explicit primaryNavigation override when set", () => {
    const product = register({
      slug: "primary-override",
      id: "primary-override",
      navigation: ["start", "workspace", "settings"],
      primaryNavigation: ["workspace", "settings"],
    });
    expect(resolvePrimaryDestinationIds(product)).toEqual(["workspace", "settings"]);
  });
});

describe("resolveLifecycleNavigation", () => {
  function registerWithSetup(overrides: Partial<ProductDefinitionInput> = {}) {
    return register({
      slug: "lifecycle-test",
      id: "lifecycle-test",
      navigation: ["start", "setup", "workspace", "progress", "history", "settings"],
      setup: { required: true, skippable: true, completedLabel: "Edit your plan" },
      ...overrides,
    });
  }

  it("shows only Start for a never-started instance", () => {
    const product = registerWithSetup();
    const nav = resolveLifecycleNavigation(product, { setupComplete: false, everTouched: false });
    expect(nav.primary).toEqual([{ id: "start", label: "Start" }]);
    expect(nav.secondary).toEqual([]);
  });

  it("drops Start and promotes Setup to primary once the instance has been touched", () => {
    const product = registerWithSetup();
    const nav = resolveLifecycleNavigation(product, { setupComplete: false, everTouched: true });
    expect(nav.primary.map((item) => item.id)).toEqual(["setup", "workspace", "progress", "history"]);
    expect(nav.primary.find((item) => item.id === "start")).toBeUndefined();
    expect(nav.secondary.map((item) => item.id)).toEqual(["settings"]);
  });

  it("demotes Setup to its completed label once setup is complete", () => {
    const product = registerWithSetup();
    const nav = resolveLifecycleNavigation(product, { setupComplete: true, everTouched: true });
    expect(nav.primary.map((item) => item.id)).toEqual(["workspace", "progress", "history"]);
    expect(nav.secondary).toEqual(
      expect.arrayContaining([{ id: "setup", label: "Edit your plan" }, { id: "settings", label: "Settings" }])
    );
  });

  it("falls back to generic 'Edit setup' when no completedLabel is set", () => {
    const product = register({
      slug: "lifecycle-no-label",
      id: "lifecycle-no-label",
      navigation: ["start", "setup", "workspace"],
      setup: { required: true, skippable: true },
    });
    const nav = resolveLifecycleNavigation(product, { setupComplete: true, everTouched: true });
    expect(nav.secondary).toEqual(expect.arrayContaining([{ id: "setup", label: "Edit setup" }]));
  });

  it("degrades to the full undifferentiated destination list when the instance signal is unavailable", () => {
    const product = registerWithSetup();
    const nav = resolveLifecycleNavigation(product, null);
    expect(nav.primary.map((item) => item.id)).toEqual([
      "start",
      "setup",
      "workspace",
      "progress",
      "history",
      "settings",
    ]);
    expect(nav.secondary).toEqual([]);
  });

  it("a product with no setup destination is always resolved as setup-complete, regardless of instance state", () => {
    const product = register({
      slug: "no-setup-product",
      id: "no-setup-product",
      navigation: ["start", "workspace", "progress", "history"],
    });
    const nav = resolveLifecycleNavigation(product, { setupComplete: false, everTouched: false });
    expect(nav.primary.map((item) => item.id)).toEqual(["workspace", "progress", "history"]);
    expect(nav.secondary).toEqual([]);
  });
});
