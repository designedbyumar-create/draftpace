import { describe, expect, it } from "vitest";
import { buildIntakeSummary } from "./intakeSummary";
import type { FamilyMember, MedicalFact, SymptomEvent } from "./state";

const NOW = "2026-09-07T00:00:00.000Z";

function member(overrides: Partial<FamilyMember> = {}): FamilyMember {
  return {
    id: "m1",
    name: "Amina",
    relationship: "child",
    dateOfBirth: "2018-04-02",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function fact(overrides: Partial<MedicalFact> = {}): MedicalFact {
  return {
    id: "f1",
    familyMemberId: "m1",
    kind: "medication",
    detail: "Amoxicillin",
    dosage: "250mg",
    frequency: "twice daily",
    reaction: null,
    visibility: "summary",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function event(overrides: Partial<SymptomEvent> = {}): SymptomEvent {
  return {
    id: "e1",
    familyMemberId: "m1",
    description: "Fever",
    onsetAt: "2026-09-01",
    durationValue: 3,
    durationUnit: "days",
    severity: "moderate",
    whatHelped: "Rest and fluids",
    visibility: "summary",
    status: "active",
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

describe("buildIntakeSummary", () => {
  it("sorts facts into medications, allergies and history by kind", () => {
    const facts = [
      fact({ id: "f1", kind: "medication", detail: "Amoxicillin" }),
      fact({ id: "f2", kind: "allergy", detail: "Peanuts", dosage: null, frequency: null, reaction: "Hives" }),
      fact({ id: "f3", kind: "history", detail: "Asthma runs in the family", dosage: null, frequency: null }),
    ];
    const summary = buildIntakeSummary(member(), facts, []);
    expect(summary.medications).toEqual([{ label: "Amoxicillin", detail: "250mg, twice daily" }]);
    expect(summary.allergies).toEqual([{ label: "Peanuts", detail: "Hives" }]);
    expect(summary.history).toEqual([{ label: "Asthma runs in the family", detail: "" }]);
  });

  it("never includes a fact marked private", () => {
    const facts = [fact({ id: "f1", visibility: "private" })];
    const summary = buildIntakeSummary(member(), facts, []);
    expect(summary.medications).toEqual([]);
  });

  it("never includes an archived fact", () => {
    const facts = [fact({ id: "f1", status: "archived" })];
    const summary = buildIntakeSummary(member(), facts, []);
    expect(summary.medications).toEqual([]);
  });

  it("excludes facts belonging to a different family member", () => {
    const facts = [fact({ id: "f1", familyMemberId: "other" })];
    const summary = buildIntakeSummary(member(), facts, []);
    expect(summary.medications).toEqual([]);
  });

  it("never includes a symptom event marked private", () => {
    const events = [event({ id: "e1", visibility: "private" })];
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms).toEqual([]);
  });

  it("includes a summary-visible symptom event with severity and duration", () => {
    const events = [event()];
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms).toEqual([
      { label: "Fever, 2026-09-01", detail: "moderate, 3 days, helped by Rest and fluids" },
    ]);
  });

  it("orders symptom events most recent onset first", () => {
    const events = [
      event({ id: "e1", onsetAt: "2026-08-01", description: "Rash" }),
      event({ id: "e2", onsetAt: "2026-09-01", description: "Fever" }),
    ];
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms.map((s) => s.label)).toEqual(["Fever, 2026-09-01", "Rash, 2026-08-01"]);
  });

  it("caps the printed symptom history at 8 most recent events", () => {
    const events = Array.from({ length: 12 }, (_, i) =>
      event({ id: `e${i}`, onsetAt: `2026-01-${String(i + 1).padStart(2, "0")}` })
    );
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms.length).toBe(8);
  });

  it("omits the detail line entirely when there is nothing to say", () => {
    const events = [event({ whatHelped: null, durationValue: null, durationUnit: null, severity: "mild" })];
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms[0].detail).toBe("mild");
  });
});
