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
});
