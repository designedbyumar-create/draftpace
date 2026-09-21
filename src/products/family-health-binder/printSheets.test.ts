import { describe, expect, it } from "vitest";
import { buildCaregiverSheet, buildEmergencyCard, buildFormsSheet, buildVisitPrep, formsGaps, privateCount } from "./printSheets";
import { allergy, condition, event, fact, immunization, member, provider, visit } from "./testFixtures";

const TODAY = "2026-09-07";

const full = member({
  emergencyName: "Sam (dad)",
  emergencyPhone: "555-0142",
  insurer: "Acme Health",
  insuranceMemberId: "XYZ123",
  insuranceGroup: "G77",
  caregiverNotes: "  Bedtime at 8. Likes the green cup.  ",
});
const facts = [
  fact({ id: "med1" }),
  fact({ id: "med2", detail: "Old syrup", stoppedOn: "2026-06-01" }),
  fact({ id: "med3", detail: "Hidden med", visibility: "private" }),
  allergy(),
  allergy({ id: "a2", detail: "Latex", reaction: null, visibility: "private" }),
  condition(),
];
const providers = [provider(), provider({ id: "ph", kind: "pharmacy", name: "Corner Pharmacy", phone: null })];
const shots = [immunization(), immunization({ id: "i2", vaccine: "HPV", visibility: "private" })];
const events = [event(), event({ id: "e2", description: "Cough", visibility: "private" })];
const visits = [visit({ questions: "Is the cough a concern?\nCan she swim?" })];

describe("forms sheet", () => {
  const sheet = buildFormsSheet(full, facts, providers, shots, events, visits, TODAY);

  it("carries the person, contact, insurance and care team as typed, with US dates", () => {
    expect(sheet.person).toEqual({ name: "Amina", dateOfBirth: "04/02/2018", age: "8 years" });
    expect(sheet.emergency).toEqual({ name: "Sam (dad)", phone: "555-0142" });
    expect(sheet.insurance).toEqual({ insurer: "Acme Health", memberId: "XYZ123", group: "G77" });
    expect(sheet.careTeam).toEqual([
      { role: "Doctor", name: "Dr. Patel", phone: "555-0100" },
      { role: "Pharmacy", name: "Corner Pharmacy", phone: null },
    ]);
    expect(sheet.immunizations).toEqual([{ label: "MMR", detail: "05/01/2019" }]);
  });

  it("lists only what is being taken now and only what was not marked private", () => {
    expect(sheet.medications).toEqual([{ label: "Amoxicillin", detail: "250mg, twice daily" }]);
    expect(sheet.allergies).toEqual([{ label: "Peanuts", detail: "Hives" }]);
    expect(sheet.conditions).toEqual([{ label: "Asthma", detail: "" }]);
    const text = JSON.stringify(sheet);
    for (const hidden of ["Old syrup", "Hidden med", "Latex", "HPV", "Cough"]) expect(text).not.toContain(hidden);
  });

  it("says how many private records it left off", () => {
    expect(sheet.hiddenCount).toBe(4);
  });

  it("leaves emergency and insurance empty rather than invented", () => {
    const bare = buildFormsSheet(member(), [], [], [], [], [], TODAY);
    expect(bare.emergency).toBeNull();
    expect(bare.insurance).toBeNull();
    expect(bare.careTeam).toEqual([]);
  });
});

describe("caregiver sheet", () => {
  const sheet = buildCaregiverSheet(full, facts, providers, shots, events, visits, TODAY);

  it("gives what to avoid, what is taken and who to call, with the notes trimmed", () => {
    expect(sheet.allergies.map((a) => a.label)).toEqual(["Peanuts"]);
    expect(sheet.medications.map((m) => m.label)).toEqual(["Amoxicillin"]);
    expect(sheet.doctor).toEqual({ name: "Dr. Patel", phone: "555-0100" });
    expect(sheet.emergency?.phone).toBe("555-0142");
    expect(sheet.notes).toBe("Bedtime at 8. Likes the green cup.");
  });

  it("has no notes when the notes are blank", () => {
    expect(buildCaregiverSheet(member({ caregiverNotes: "   " }), [], [], [], [], [], TODAY).notes).toBeNull();
    expect(buildCaregiverSheet(member(), [], [], [], [], [], TODAY).doctor).toBeNull();
  });
});

describe("emergency card", () => {
  it("is short: names, not sentences, and never a stopped medication", () => {
    const card = buildEmergencyCard(full, facts, providers, shots, events, visits, TODAY);
    expect(card.allergies).toEqual(["Peanuts (Hives)"]);
    expect(card.conditions).toEqual(["Asthma"]);
    expect(card.medications).toEqual(["Amoxicillin, 250mg, twice daily"]);
    expect(card.insurance).toEqual({ insurer: "Acme Health", memberId: "XYZ123" });
    expect(JSON.stringify(card)).not.toContain("Old syrup");
  });
});

describe("visit prep", () => {
  it("brings the visit's questions, what is taken and the latest symptoms, newest first", () => {
    const prep = buildVisitPrep(full, visits[0], facts, [event({ id: "old", onsetAt: "2026-08-01", description: "Rash" }), ...events], shots, visits, TODAY);
    expect(prep.visit).toEqual({ date: "10/01/2026", withWhom: "Dr. Patel", reason: "Yearly checkup" });
    expect(prep.questions).toEqual(["Is the cough a concern?", "Can she swim?"]);
    expect(prep.medications.map((m) => m.label)).toEqual(["Amoxicillin"]);
    expect(prep.recentSymptoms.map((s) => s.label)).toEqual(["Fever, 09/01/2026", "Rash, 08/01/2026"]);
  });

  it("keeps a private visit's questions off the page, and works with no visit chosen", () => {
    const hidden = visit({ visibility: "private", questions: "Something private" });
    expect(JSON.stringify(buildVisitPrep(full, hidden, facts, events, shots, visits, TODAY))).not.toContain("Something private");
    expect(buildVisitPrep(full, null, facts, events, shots, visits, TODAY).visit).toBeNull();
  });
});

describe("what is missing", () => {
  it("names each answer the forms sheet does not have yet, in the order forms ask", () => {
    expect(formsGaps(member({ dateOfBirth: null }), [])).toEqual(["date of birth", "emergency contact", "insurance", "a doctor"]);
    expect(formsGaps(full, providers)).toEqual([]);
  });

  it("wants both a name and a number for the emergency contact", () => {
    expect(formsGaps(member({ emergencyName: "Sam" }), providers)).toContain("emergency contact");
    expect(formsGaps(member({ emergencyName: "Sam", emergencyPhone: "555" }), providers)).not.toContain("emergency contact");
  });

  it("counts only this person's active private records", () => {
    expect(privateCount("m1", facts, events, shots, visits)).toBe(4);
    expect(privateCount("m2", facts, events, shots, visits)).toBe(0);
  });
});
