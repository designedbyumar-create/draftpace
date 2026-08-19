import { describe, expect, it } from "vitest";
import { matchThingType, THING_TYPE_BY_ID } from "./thingTypes";

describe("matchThingType", () => {
  it("matches a known type id directly, fast path", () => {
    const match = matchThingType("Anything at all", "refrigerator");
    expect(match?.id).toBe("refrigerator");
  });

  it("falls back to a keyword match against the name when the type is not yet known", () => {
    const match = matchThingType("Samsung Refrigerator", "other");
    expect(match?.id).toBe("refrigerator");
  });

  it("matches case-insensitively", () => {
    const match = matchThingType("KITCHEN FRIDGE", "other");
    expect(match?.id).toBe("refrigerator");
  });

  it("matches a multi-word keyword", () => {
    const match = matchThingType("Rheem Water Heater 50gal", "other");
    expect(match?.id).toBe("water-heater");
  });

  it("returns null rather than guessing when nothing matches", () => {
    const match = matchThingType("A completely unrelated thing", "other");
    expect(match).toBeNull();
  });

  it("every type definition is reachable by its own id in THING_TYPE_BY_ID", () => {
    for (const [id, def] of Object.entries(THING_TYPE_BY_ID)) {
      expect(def.id).toBe(id);
      expect(def.suggestedTasks.length).toBeGreaterThan(0);
    }
  });
});
