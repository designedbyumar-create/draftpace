import { describe, expect, it } from "vitest";
import { isValidCapabilityId, assertValidCapabilityId, KNOWN_CAPABILITIES } from "./capabilities";

describe("isValidCapabilityId", () => {
  it("accepts namespaced ids matching the founder's own examples", () => {
    const examples = [
      "companion.next-action",
      "companion.recovery",
      "learning.lesson",
      "learning.assessment",
      "automation.trigger",
      "automation.action",
      "automation.run-history",
      "workspace.structured-input",
      "workspace.saved-output",
      "tracker.recurring-entry",
    ];
    for (const id of examples) {
      expect(isValidCapabilityId(id)).toBe(true);
    }
  });

  it("accepts every documented known-core capability", () => {
    for (const list of Object.values(KNOWN_CAPABILITIES)) {
      for (const id of list) {
        expect(isValidCapabilityId(id)).toBe(true);
      }
    }
  });

  it("rejects ids with no namespace", () => {
    expect(isValidCapabilityId("next-action")).toBe(false);
  });

  it("rejects ids with uppercase or invalid characters", () => {
    expect(isValidCapabilityId("Companion.NextAction")).toBe(false);
    expect(isValidCapabilityId("companion.next_action")).toBe(false);
  });

  it("accepts a brand-new namespaced capability not in the known-core list", () => {
    // Proves a new family/product can introduce capabilities without
    // editing this framework file.
    expect(isValidCapabilityId("dorm-move-in.readiness-check")).toBe(true);
  });
});

describe("assertValidCapabilityId", () => {
  it("returns the id when valid", () => {
    expect(assertValidCapabilityId("companion.momentum")).toBe("companion.momentum");
  });

  it("throws when invalid", () => {
    expect(() => assertValidCapabilityId("invalid")).toThrow();
  });
});
