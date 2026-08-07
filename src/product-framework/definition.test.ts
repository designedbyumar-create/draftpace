import { describe, expect, it } from "vitest";
import { productDefinitionSchema, validateProductDefinition } from "./definition";

const minimalValid = {
  id: "p1",
  slug: "p1",
  title: "Product One",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "free" },
};

describe("productDefinitionSchema", () => {
  it("accepts a minimal valid definition and fills in defaults", () => {
    const result = validateProductDefinition(minimalValid);
    expect(result.capabilities).toEqual([]);
    expect(result.devFixture).toBe(false);
    expect(result.migrationPolicy.compatibility).toBe("backward-compatible");
    expect(result.setup.skippable).toBe(true);
  });

  it("rejects a non-semver version", () => {
    expect(() => validateProductDefinition({ ...minimalValid, version: "v1" })).toThrow();
  });

  it("rejects an uppercase or invalid slug", () => {
    expect(() => validateProductDefinition({ ...minimalValid, slug: "Not Valid" })).toThrow();
  });

  it("rejects a malformed capability id", () => {
    expect(() =>
      validateProductDefinition({ ...minimalValid, capabilities: ["not-namespaced"] })
    ).toThrow();
  });

  it("rejects an unknown access model", () => {
    expect(() => validateProductDefinition({ ...minimalValid, access: { model: "enterprise" } })).toThrow();
  });

  it("has no field for sensitive data or secrets in the schema shape", () => {
    // Guards against someone widening the contract later — the schema's own
    // top-level key set should never include anything secret-shaped.
    const keys = Object.keys(productDefinitionSchema.shape);
    const forbidden = ["secret", "password", "token", "apiKey", "ssn", "creditCard"];
    for (const key of keys) {
      expect(forbidden.some((bad) => key.toLowerCase().includes(bad.toLowerCase()))).toBe(false);
    }
  });

  it("defaults cycleModel to \"monthly\" (Monthly Money Reset's behavior, unchanged for every existing product)", () => {
    const result = validateProductDefinition(minimalValid);
    expect(result.cycleModel).toBe("monthly");
  });

  it("accepts an explicit cycleModel of \"continuous\"", () => {
    const result = validateProductDefinition({ ...minimalValid, cycleModel: "continuous" });
    expect(result.cycleModel).toBe("continuous");
  });

  it("leaves pwa undefined when not declared, covering every product before this field existed", () => {
    const result = validateProductDefinition(minimalValid);
    expect(result.pwa).toBeUndefined();
  });

  it("accepts a valid pwa declaration and defaults provisionalBranding to true", () => {
    const result = validateProductDefinition({
      ...minimalValid,
      pwa: {
        name: "Test App",
        shortName: "Test",
        description: "A test app.",
        themeColor: "#0e6e75",
        backgroundColor: "#f4f2ec",
        icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
      },
    });
    expect(result.pwa?.provisionalBranding).toBe(true);
  });

  it("rejects a pwa declaration with an invalid theme color", () => {
    expect(() =>
      validateProductDefinition({
        ...minimalValid,
        pwa: {
          name: "Test App",
          shortName: "Test",
          description: "A test app.",
          themeColor: "not-a-color",
          backgroundColor: "#f4f2ec",
          icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
        },
      })
    ).toThrow();
  });

  it("rejects a pwa declaration with no icons", () => {
    expect(() =>
      validateProductDefinition({
        ...minimalValid,
        pwa: {
          name: "Test App",
          shortName: "Test",
          description: "A test app.",
          themeColor: "#0e6e75",
          backgroundColor: "#f4f2ec",
          icons: [],
        },
      })
    ).toThrow();
  });
});
