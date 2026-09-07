import { describe, expect, it } from "vitest";
import { MAINTENANCE_TEMPLATES, templateById } from "./vehicleKnowledge";

/**
 * Structural discipline mirroring homeKnowledge.test.ts: the failure
 * mode this guards against is a hand-authored list quietly growing a
 * duplicate id, an empty name, or an entry with no interval at all,
 * none of which throws anywhere and none of which shows up until
 * somebody picks that exact template on a real screen.
 */
describe("MAINTENANCE_TEMPLATES", () => {
  it("has no duplicate id", () => {
    const ids = MAINTENANCE_TEMPLATES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every template a real name and at least one typical interval", () => {
    for (const template of MAINTENANCE_TEMPLATES) {
      expect(template.taskName.length, template.id).toBeGreaterThan(0);
      expect(
        template.typicalIntervalMiles !== null || template.typicalIntervalMonths !== null,
        `${template.id} has no interval at all`
      ).toBe(true);
    }
  });

  it("never states a typical interval as a bare number without the word 'typical' somewhere nearby in the field name", () => {
    // Structural, not textual: the field itself is named typicalIntervalMiles/typicalIntervalMonths,
    // never intervalMiles/intervalMonths, so nothing consuming this file can mistake a suggestion for a stored fact.
    for (const key of Object.keys(MAINTENANCE_TEMPLATES[0])) {
      if (key.toLowerCase().includes("interval")) {
        expect(key.startsWith("typical"), key).toBe(true);
      }
    }
  });

  it("keeps a positive interval wherever one is set", () => {
    for (const template of MAINTENANCE_TEMPLATES) {
      if (template.typicalIntervalMiles !== null) expect(template.typicalIntervalMiles, template.id).toBeGreaterThan(0);
      if (template.typicalIntervalMonths !== null) expect(template.typicalIntervalMonths, template.id).toBeGreaterThan(0);
    }
  });
});

describe("templateById", () => {
  it("finds a real template by id", () => {
    expect(templateById("oil-change")?.taskName).toBe("Engine oil and filter change");
  });

  it("returns null for anything not in the list, rather than guessing", () => {
    expect(templateById("not-a-real-template")).toBeNull();
  });
});
