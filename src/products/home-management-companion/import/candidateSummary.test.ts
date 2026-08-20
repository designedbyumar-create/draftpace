import { describe, expect, it } from "vitest";
import { summarizeCandidate } from "./candidateSummary";
import type { ExtractionCandidate } from "./types";

function candidate(overrides: Partial<ExtractionCandidate>): ExtractionCandidate {
  return {
    id: "c1",
    candidateType: "thing",
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

  it("leads an unclassified line with the person's own words, never with a rejection", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "unsupported", payload: { rawText: "some notes" } })
    );
    // The words they wrote are the headline. "Not recognized" as a title
    // is the product telling somebody their input was wrong.
    expect(summary.title).toBe("some notes");
    expect(summary.lines.join(" ").toLowerCase()).not.toContain("not recognized");
  });

  it("summarises a problem by what is wrong and how bad it sounds", () => {
    const summary = summarizeCandidate(
      candidate({ candidateType: "problem", payload: { title: "the garage door is grinding", severity: "minor" } })
    );
    expect(summary.title).toBe("the garage door is grinding");
    expect(summary.lines).toEqual(["Sounds minor"]);
  });

  it("summarises a past event by when it happened and who did it", () => {
    const summary = summarizeCandidate(
      candidate({
        candidateType: "pastEvent",
        payload: { description: "AC serviced", performedAt: "2025-03-14", providerName: "Ace HVAC" },
      })
    );
    expect(summary.title).toBe("AC serviced");
    expect(summary.lines[1]).toBe("by Ace HVAC");
  });
});
