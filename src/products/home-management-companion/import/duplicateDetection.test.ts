import { describe, expect, it } from "vitest";
import { detectDuplicateByName } from "./duplicateDetection";

const EXISTING = [
  { id: "app-1", name: "Refrigerator" },
  { id: "app-2", name: "Water Heater" },
];

describe("detectDuplicateByName", () => {
  it("returns null when no existing record shares the candidate's name", () => {
    expect(detectDuplicateByName("Furnace", EXISTING)).toBeNull();
  });

  it("flags a match, case/whitespace-insensitive", () => {
    const match = detectDuplicateByName("  refrigerator  ", EXISTING);
    expect(match).toMatchObject({ existingRecordId: "app-1", existingRecordName: "Refrigerator" });
  });

  it("never auto-merges, always returns a match to surface, never silently resolves", () => {
    const match = detectDuplicateByName("Water Heater", EXISTING);
    expect(match).not.toBeNull();
  });
});
