import { describe, expect, it } from "vitest";
import { buildIntakeSummary } from "./intakeSummary";
import { event, fact, member } from "./testFixtures";

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

  it("lists conditions on their own, and leaves a stopped medication off", () => {
    const facts = [
      fact({ id: "f1", detail: "Old syrup", stoppedOn: "2026-06-01" }),
      fact({ id: "f2", kind: "condition", detail: "Asthma", dosage: null, frequency: null }),
    ];
    const summary = buildIntakeSummary(member(), facts, []);
    expect(summary.medications).toEqual([]);
    expect(summary.conditions).toEqual([{ label: "Asthma", detail: "" }]);
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
      { label: "Fever, 09/01/2026", detail: "moderate, 3 days, helped by Rest and fluids" },
    ]);
  });

  it("orders symptom events most recent onset first", () => {
    const events = [
      event({ id: "e1", onsetAt: "2026-08-01", description: "Rash" }),
      event({ id: "e2", onsetAt: "2026-09-01", description: "Fever" }),
    ];
    const summary = buildIntakeSummary(member(), [], events);
    expect(summary.recentSymptoms.map((s) => s.label)).toEqual(["Fever, 09/01/2026", "Rash, 08/01/2026"]);
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
