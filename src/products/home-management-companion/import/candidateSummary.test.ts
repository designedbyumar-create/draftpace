import { describe, expect, it } from "vitest";
import { summarizeCandidate } from "./candidateSummary";
import type { ExtractionCandidate } from "./types";

function candidate(overrides: Partial<ExtractionCandidate>): ExtractionCandidate {
  return {
    id: "c1",
    candidateType: "appliance",
    payload: { name: "Refrigerator" },
    confidence: "high",
    missingFields: [],
    ambiguityNotes: [],
    sourceReference: "",
    duplicateStatus: "none",
    duplicateOfName: null,
    reviewStatus: "unreviewed",
    ...overrides,
  };
}

describe("summarizeCandidate", () => {
  it("summarizes an appliance with a warranty date", () => {
    const summary = summarizeCandidate(
      candidate({ payload: { name: "Refrigerator", warrantyExpiresAt: "2026-01-15" } })
    );
    expect(summary.title).toBe("Refrigerator");
    expect(summary.lines).toContain("Warranty expires 2026-01-15");
  });

  it("is honest about an appliance with no warranty date found", () => {
    const summary = summarizeCandidate(candidate({ payload: { name: "Toaster" } }));
    expect(summary.lines).toContain("No warranty date found");
  });

  it("summarizes a maintenance task's cadence in months", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "maintenanceTask", payload: { name: "HVAC service", cadenceDays: 180 } })
    );
    expect(summary.lines).toContain("Every 6 months");
  });

  it("summarizes a service provider's phone and email", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "serviceProvider", payload: { name: "Ace HVAC", phone: "555-1234", email: "ace@hvac.com" } })
    );
    expect(summary.lines).toEqual(["555-1234", "ace@hvac.com"]);
  });

  it("renders an unsupported candidate's raw text, never a JSON dump", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "unsupported", payload: { rawText: "some notes" } })
    );
    expect(summary.title).toBe("Not recognized");
    expect(summary.lines).toEqual(["some notes"]);
  });
});
