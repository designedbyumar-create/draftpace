import { describe, expect, it } from "vitest";
import { familyRegistry, isCapabilitySupportedByFamily } from "./families";

describe("familyRegistry", () => {
  it("registers the six initial families from the founder's brief", () => {
    const ids = familyRegistry.list().map((family) => family.id);
    expect(ids.sort()).toEqual(
      ["automation", "companion", "guided-program", "learning", "tracker", "workspace"].sort()
    );
  });

  it("throws on duplicate registration instead of silently overwriting a family", () => {
    expect(() =>
      familyRegistry.register({
        id: "companion",
        label: "Duplicate",
        description: "",
        supportedCapabilities: [],
        defaultNavigation: [],
        progressModelKind: "custom",
      })
    ).toThrow();
  });

  it("rejects an invalid family id", () => {
    expect(() =>
      familyRegistry.register({
        id: "Not Valid!",
        label: "Bad",
        description: "",
        supportedCapabilities: [],
        defaultNavigation: [],
        progressModelKind: "custom",
      })
    ).toThrow();
  });
});

describe("isCapabilitySupportedByFamily", () => {
  const companion = familyRegistry.get("companion")!;
  const learning = familyRegistry.get("learning")!;

  it("accepts a known-core capability for its family", () => {
    expect(isCapabilitySupportedByFamily(companion, "companion.next-action")).toBe(true);
  });

  it("accepts a new capability that shares the family's own namespace", () => {
    expect(isCapabilitySupportedByFamily(companion, "companion.brand-new-idea")).toBe(true);
  });

  it("rejects a capability from an unrelated family's namespace", () => {
    expect(isCapabilitySupportedByFamily(learning, "automation.trigger")).toBe(false);
  });
});
