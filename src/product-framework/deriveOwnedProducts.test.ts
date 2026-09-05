import { afterEach, describe, expect, it } from "vitest";
import { productRegistry } from "./registry";
import { deriveOwnedProducts } from "./deriveOwnedProducts";
import type { EntitlementSummary } from "./entitlements";
import type { ProductInstanceSummary } from "./instances";

const definitionInput = {
  id: "test-product",
  slug: "test-product",
  title: "Test Product",
  family: "companion",
  version: "0.1.0",
  status: "active" as const,
  access: { model: "free" as const },
};

function entitlement(overrides: Partial<EntitlementSummary> = {}): EntitlementSummary {
  return {
    id: "e1",
    productSlug: "test-product",
    accessSource: "free-grant",
    grantedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

function instance(overrides: Partial<ProductInstanceSummary> = {}): ProductInstanceSummary {
  return {
    id: "i1",
    productSlug: "test-product",
    cycleKey: "2026-08",
    lifecycleState: "active",
    setupComplete: true,
    safeToSpendMinorUnits: null,
    nextActionLabel: null,
    lastActivityAt: "2026-08-02T00:00:00Z",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-02T00:00:00Z",
    pausedAt: null,
    ...overrides,
  };
}

afterEach(() => {
  productRegistry.reset();
});

describe("deriveOwnedProducts", () => {
  it("a registered product with a matching instance is ready, with progress attached", () => {
    productRegistry.register(definitionInput);
    const rows = deriveOwnedProducts([entitlement()], { status: "ok", rows: [instance()] });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "ready", productSlug: "test-product" });
    if (rows[0].kind === "ready") {
      expect(rows[0].instance?.id).toBe("i1");
    }
  });

  it("a registered product with no matching instance is still ready, with instance null (not started, not hidden)", () => {
    productRegistry.register(definitionInput);
    const rows = deriveOwnedProducts([entitlement()], { status: "ok", rows: [] });

    expect(rows[0]).toMatchObject({ kind: "ready", instance: null });
  });

  /**
   * The core property under test: an instances-query failure must degrade
   * the row, never hide a product the user genuinely owns.
   */
  it("an instances-query failure degrades the row to progress-unavailable instead of hiding it", () => {
    productRegistry.register(definitionInput);
    const rows = deriveOwnedProducts([entitlement()], { status: "error", message: "connection reset" });

    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe("progress-unavailable");
  });

  it("an entitlement whose product isn't in the runtime registry still shows, using its slug as a fallback", () => {
    // No productRegistry.register() call — simulates a temporarily missing definition.
    const rows = deriveOwnedProducts([entitlement()], { status: "ok", rows: [] });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ kind: "definition-missing", productSlug: "test-product" });
  });

  it("no entitlement means genuinely not owned — the only case that produces zero rows", () => {
    productRegistry.register(definitionInput);
    const rows = deriveOwnedProducts([], { status: "ok", rows: [instance()] });

    expect(rows).toHaveLength(0);
  });

  it("orders rows by most recent activity, most relevant first", () => {
    productRegistry.register(definitionInput);
    productRegistry.register({ ...definitionInput, id: "other", slug: "other-product", title: "Other Product" });

    const rows = deriveOwnedProducts(
      [
        entitlement({ id: "e1", productSlug: "test-product", grantedAt: "2026-08-01T00:00:00Z" }),
        entitlement({ id: "e2", productSlug: "other-product", grantedAt: "2026-08-03T00:00:00Z" }),
      ],
      {
        status: "ok",
        rows: [instance({ id: "i1", productSlug: "test-product", lastActivityAt: "2026-08-05T00:00:00Z" })],
      }
    );

    expect(rows.map((r) => r.productSlug)).toEqual(["test-product", "other-product"]);
  });
});
