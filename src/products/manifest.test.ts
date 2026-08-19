import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { monthlyMoneyResetDefinition } from "./monthly-money-reset/definition";

// ensureProductsRegistered() is idempotent via a module-level flag, so each
// test needs its own fresh module graph — see
// src/product-framework/fixtures/index.test.ts for the same pattern.
//
// vi.resetModules() + a fresh dynamic import of the whole catalog is
// genuinely expensive, and has gotten slower release over release as the
// product catalog has grown (Stage F added a real notification/reminder
// engine on top of everything else) — the explicit 40s timeouts below
// (bumped from 20s) are load-dependent test infra, not a sign anything here
// is actually slow at runtime.
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

    const homeBase = productRegistry.getBySlug("home-management-companion");
    expect(homeBase).toBeDefined();
    expect(homeBase?.title).toBe("Home Base");
    expect(homeBase?.access.model).toBe("paid");
    expect(homeBase?.cycleModel).toBe("continuous");
    expect(homeBase?.devFixture).toBe(false);
    expect(homeBase?.pwa?.provisionalBranding).toBe(true);
  }, 40000);

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
    expect(productRegistry.list()).toHaveLength(4);
  }, 40000);

  it("is the only file that imports a specific product's catalog entry — every route imports the generic function", () => {
    // Locks in the actual point of this refactor: adding a new product
    // should mean one new import + one new array entry here, and nothing
    // outside this file should ever need to know a product-specific module
    // path. hidden-access-test (Phase B), personal-finance-companion
    // (foundation stage), and home-management-companion are all that exact
    // proof, already applied.
    const manifestSource = readFileSync(new URL("./manifest.ts", import.meta.url), "utf-8");
    expect(manifestSource).toContain("monthly-money-reset/catalog");
    expect(manifestSource).toContain("hidden-access-test/catalog");
    expect(manifestSource).toContain("personal-finance-companion/catalog");
    expect(manifestSource).toContain("home-management-companion/catalog");
  });
});
