import { describe, expect, it } from "vitest";
import { describeChange } from "./changeSummary";
import { item } from "./testSupport";
import type { AffairItem } from "./lifeAffairs";

const before: AffairItem = item("people.executor", {
  label: "Tom Okafor",
  personName: "Tom Okafor",
  personContact: "07700 900123",
  fields: { relationship: "Brother" },
});

const change = (over: Partial<AffairItem>) => describeChange(before, { ...before, ...over });

/**
 * History exists so that when something is no longer true, a person can
 * still see what it said before. That only works if the sentence names
 * what actually moved.
 */
describe("what History says changed", () => {
  it("keeps the old value where a person would want it years later", () => {
    const line = change({ label: "Jane Smith", personName: "Jane Smith" });
    expect(line).toContain("Tom Okafor");
    expect(line).toContain("Jane Smith");
  });

  it("says what was added rather than just that something happened", () => {
    expect(change({ whereabouts: "Study, filing cabinet" }).toLowerCase()).toContain("added where it is kept");
  });

  it("says what was removed", () => {
    expect(change({ personContact: null }).toLowerCase()).toContain("removed how to reach them");
  });

  it("notices a change inside the open fields, not only the columns", () => {
    expect(change({ fields: { relationship: "Partner" } })).toContain("relationship");
  });

  it("does not claim a change when a person only looked and agreed", () => {
    expect(change({})).toBe("Reviewed Tom Okafor.");
  });

  it("never says 'updated', which describes using software rather than a life", () => {
    const lines = [
      change({ label: "Jane Smith", personName: "Jane Smith" }),
      change({ whereabouts: "Study" }),
      change({ notes: "He has a key." }),
      change({}),
    ];
    for (const line of lines) {
      expect(line.toLowerCase()).not.toContain("updated");
      expect(line.toLowerCase()).not.toContain("task");
      expect(line.toLowerCase()).not.toContain("step");
      expect(line).not.toContain("—");
    }
  });

  it("names the record, so an entry read on its own still makes sense", () => {
    for (const line of [change({ whereabouts: "Study" }), change({})]) {
      expect(line).toContain("Tom Okafor");
    }
  });

  it("reads as a sentence, capitalised and closed", () => {
    const line = change({ notes: "He has a key." });
    expect(line.endsWith(".")).toBe(true);
    expect(line[0]).toBe(line[0].toUpperCase());
  });
});
