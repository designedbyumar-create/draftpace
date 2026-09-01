import { describe, expect, it } from "vitest";
import { printableAssetRegistry } from "./printableAssets";

describe("printableAssetRegistry", () => {
  it("returns an empty list for a product that registered nothing", () => {
    expect(printableAssetRegistry.list("no-such-product")).toEqual([]);
  });

  it("returns undefined for an unknown asset id", () => {
    expect(printableAssetRegistry.get("no-such-product", "letter")).toBeUndefined();
  });

  it("lists and finds assets registered for a product", () => {
    printableAssetRegistry.register("test-product-registry", {
      id: "letter",
      title: "Test Printable",
      filename: "test.pdf",
    });

    expect(printableAssetRegistry.list("test-product-registry")).toEqual([
      { id: "letter", title: "Test Printable", filename: "test.pdf" },
    ]);
    expect(printableAssetRegistry.get("test-product-registry", "letter")).toEqual({
      id: "letter",
      title: "Test Printable",
      filename: "test.pdf",
    });
  });

  it("registering the same asset id twice keeps the first registration, matching moduleRegistry's idempotent-registration convention", () => {
    printableAssetRegistry.register("test-product-dedupe", { id: "letter", title: "First", filename: "a.pdf" });
    printableAssetRegistry.register("test-product-dedupe", { id: "letter", title: "Second", filename: "b.pdf" });

    expect(printableAssetRegistry.list("test-product-dedupe")).toEqual([
      { id: "letter", title: "First", filename: "a.pdf" },
    ]);
  });

  it("keeps different products' assets independent", () => {
    printableAssetRegistry.register("test-product-a", { id: "letter", title: "A", filename: "a.pdf" });
    printableAssetRegistry.register("test-product-b", { id: "letter", title: "B", filename: "b.pdf" });

    expect(printableAssetRegistry.get("test-product-a", "letter")?.title).toBe("A");
    expect(printableAssetRegistry.get("test-product-b", "letter")?.title).toBe("B");
  });
});
