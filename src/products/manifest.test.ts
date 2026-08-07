import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { monthlyMoneyResetDefinition } from "./monthly-money-reset/definition";

// ensureProductsRegistered() is idempotent via a module-level flag, so each
// test needs its own fresh module graph — see
// src/product-framework/fixtures/index.test.ts for the same pattern.
async function loadFreshManifestModule() {
  vi.resetModules();
  const [{ ensureProductsRegistered }, { productRegistry }] = await Promise.all([
    import("./manifest"),
    import("@/product-framework/registry"),
  ]);
  return { ensureProductsRegistered, productRegistry };
}

beforeEach(() => {
  vi.resetModules();
});

describe("ensureProductsRegistered", () => {
  it("registers every catalog entry with the shared productRegistry", async () => {
    const { ensureProductsRegistered, productRegistry } = await loadFreshManifestModule();
    ensureProductsRegistered();

    const found = productRegistry.getBySlug("monthly-money-reset");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Monthly Money Reset");
    expect(found?.access.model).toBe("free");
    expect(found?.family).toBe("companion");

    const hidden = productRegistry.getBySlug("hidden-access-test");
    expect(hidden).toBeDefined();
    expect(hidden?.devFixture).toBe(false);

    const pfc = productRegistry.getBySlug("personal-finance-companion");
    expect(pfc).toBeDefined();
    expect(pfc?.title).toBe("Personal Finance Companion");
    expect(pfc?.access.model).toBe("paid");
    expect(pfc?.cycleModel).toBe("continuous");
    expect(pfc?.devFixture).toBe(false);
    expect(pfc?.pwa?.provisionalBranding).toBe(true);
  }, 20000);

  it("is never a development fixture", () => {
    expect(monthlyMoneyResetDefinition.devFixture).toBe(false);
  });

  it("never calls areDevFixturesEnabled — registration cannot depend on the dev-fixture gate", () => {
    const source = readFileSync(new URL("./manifest.ts", import.meta.url), "utf-8");
    expect(source).not.toContain("areDevFixturesEnabled");
  });

  it("is safe to call repeatedly without throwing on re-registration", async () => {
    const { ensureProductsRegistered, productRegistry } = await loadFreshManifestModule();
    expect(() => {
      ensureProductsRegistered();
      ensureProductsRegistered();
      ensureProductsRegistered();
    }).not.toThrow();
    expect(productRegistry.list()).toHaveLength(3);
  }, 20000);

  it("is the only file that imports a specific product's catalog entry — every route imports the generic function", () => {
    // Locks in the actual point of this refactor: adding a new product
    // should mean one new import + one new array entry here, and nothing
    // outside this file should ever need to know a product-specific module
    // path. hidden-access-test (Phase B) and personal-finance-companion
    // (foundation stage) are both that exact proof, already applied.
    const manifestSource = readFileSync(new URL("./manifest.ts", import.meta.url), "utf-8");
    expect(manifestSource).toContain("monthly-money-reset/catalog");
    expect(manifestSource).toContain("hidden-access-test/catalog");
    expect(manifestSource).toContain("personal-finance-companion/catalog");
  });
});
