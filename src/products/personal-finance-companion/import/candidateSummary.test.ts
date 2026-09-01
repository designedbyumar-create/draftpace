import { describe, expect, it } from "vitest";
import { summarizeCandidate } from "./candidateSummary";
import type { ExtractionCandidate } from "./types";

function candidate(overrides: Partial<ExtractionCandidate>): ExtractionCandidate {
  return {
    id: "c-1",
    importSessionId: "session-1",
    candidateType: "bill",
    payload: { name: "Rent", amountMajorUnits: 900, dayOfMonth: 1, frequency: "monthly" },
    confidence: "high",
    missingFields: [],
    ambiguityNotes: [],
    sourceReference: "Rent 900 due first",
    duplicateStatus: "none",
    duplicateOfId: null,
    reviewStatus: "unreviewed",
    confirmedRecordType: null,
    confirmedRecordId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("summarizeCandidate", () => {
  it("renders the bill example from the launch spec in human language", () => {
    const summary = summarizeCandidate(candidate({}));
    expect(summary.title).toBe("Rent");
    expect(summary.lines).toContain("$900.00");
    expect(summary.lines).toContain("Due on the 1st");
  });

  it("renders an unsupported candidate's raw text rather than hiding it", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "unsupported", payload: { rawText: "just some rambling thoughts" } })
    );
    expect(summary.lines).toEqual(["just some rambling thoughts"]);
  });

  it("names what's missing rather than inventing a value", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "subscription", payload: { name: "Netflix", amountMajorUnits: 15.99 } })
    );
    expect(summary.lines).toContain("No renewal date found");
  });
});
