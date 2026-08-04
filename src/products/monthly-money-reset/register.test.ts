import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { monthlyMoneyResetDefinition } from "./definition";

// registerMonthlyMoneyReset() is idempotent via a module-level flag, so each
// test needs its own fresh module graph — see
// src/product-framework/fixtures/index.test.ts for the same pattern.
async function loadFreshRegisterModule() {
  vi.resetModules();
  const [{ registerMonthlyMoneyReset }, { productRegistry }] = await Promise.all([
    import("./register"),
    import("@/product-framework/registry"),
  ]);
  return { registerMonthlyMoneyReset, productRegistry };
}

beforeEach(() => {
  vi.resetModules();
});

describe("registerMonthlyMoneyReset", () => {
  it("registers the product with the shared productRegistry", async () => {
    const { registerMonthlyMoneyReset, productRegistry } = await loadFreshRegisterModule();
    registerMonthlyMoneyReset();

    const found = productRegistry.getBySlug("monthly-money-reset");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Monthly Money Reset");
    expect(found?.access.model).toBe("free");
    expect(found?.family).toBe("companion");
  }, 20000);

  it("is never a development fixture", () => {
    expect(monthlyMoneyResetDefinition.devFixture).toBe(false);
  });

  it("never calls areDevFixturesEnabled — registration cannot depend on the dev-fixture gate", () => {
    const source = readFileSync(new URL("./register.ts", import.meta.url), "utf-8");
    expect(source).not.toContain("areDevFixturesEnabled");
  });

  it("is safe to call repeatedly without throwing on re-registration", async () => {
    const { registerMonthlyMoneyReset, productRegistry } = await loadFreshRegisterModule();
    expect(() => {
      registerMonthlyMoneyReset();
      registerMonthlyMoneyReset();
      registerMonthlyMoneyReset();
    }).not.toThrow();
    expect(productRegistry.list()).toHaveLength(1);
  }, 20000);
});
