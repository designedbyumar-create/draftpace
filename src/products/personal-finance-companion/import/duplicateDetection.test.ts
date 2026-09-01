import { describe, expect, it } from "vitest";
import { detectDuplicate } from "./duplicateDetection";

const EXISTING = [
  { id: "sub-1", name: "Netflix", amountMajorUnits: 15.99 },
  { id: "sub-2", name: "Spotify", amountMajorUnits: 10.99 },
];

describe("detectDuplicate", () => {
  it("returns null when no existing record shares the candidate's name", () => {
    expect(detectDuplicate("Hulu", 12.99, EXISTING)).toBeNull();
  });

  it("flags an exact duplicate when name and amount both match (case/whitespace-insensitive name)", () => {
    const match = detectDuplicate("  netflix  ", 15.99, EXISTING);
    expect(match).toMatchObject({ status: "exactDuplicate", existingRecordId: "sub-1" });
  });

  it("flags a possible duplicate when the name matches but the amount is meaningfully different", () => {
    const match = detectDuplicate("Netflix", 22.99, EXISTING);
    expect(match).toMatchObject({ status: "possibleDuplicate", existingRecordId: "sub-1" });
  });

  it("flags a likely duplicate when the candidate has no amount to compare", () => {
    const match = detectDuplicate("Netflix", null, EXISTING);
    expect(match).toMatchObject({ status: "likelyDuplicate", existingRecordId: "sub-1" });
  });

  it("never auto-merges — always returns a match to surface, never silently resolves", () => {
    const match = detectDuplicate("Netflix", 15.99, EXISTING);
    expect(match).not.toBeNull();
  });
});
