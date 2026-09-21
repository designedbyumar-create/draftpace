import type { FamilyMember, Immunization, MedicalFact, Provider, SymptomEvent, Visit } from "./state";

/** Builders for tests. Every field has a plain default so a test only names what it is about. */
const STAMP = "2026-09-07T00:00:00.000Z";

export const member = (over: Partial<FamilyMember> = {}): FamilyMember => ({
  id: "m1",
  name: "Amina",
  relationship: "child",
  dateOfBirth: "2018-04-02",
  emergencyName: null,
  emergencyPhone: null,
  insurer: null,
  insuranceMemberId: null,
  insuranceGroup: null,
  caregiverNotes: null,
  medicationsCheckedOn: null,
  status: "active",
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const fact = (over: Partial<MedicalFact> = {}): MedicalFact => ({
  id: "f1",
  familyMemberId: "m1",
  kind: "medication",
  detail: "Amoxicillin",
  dosage: "250mg",
  frequency: "twice daily",
  reaction: null,
  startedOn: null,
  stoppedOn: null,
  visibility: "summary",
  status: "active",
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const allergy = (over: Partial<MedicalFact> = {}): MedicalFact =>
  fact({ id: "a1", kind: "allergy", detail: "Peanuts", dosage: null, frequency: null, reaction: "Hives", ...over });

export const condition = (over: Partial<MedicalFact> = {}): MedicalFact =>
  fact({ id: "c1", kind: "condition", detail: "Asthma", dosage: null, frequency: null, ...over });

export const event = (over: Partial<SymptomEvent> = {}): SymptomEvent => ({
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
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const provider = (over: Partial<Provider> = {}): Provider => ({
  id: "p1",
  familyMemberId: "m1",
  kind: "doctor",
  name: "Dr. Patel",
  phone: "555-0100",
  note: null,
  status: "active",
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const immunization = (over: Partial<Immunization> = {}): Immunization => ({
  id: "i1",
  familyMemberId: "m1",
  vaccine: "MMR",
  givenOn: "2019-05-01",
  note: null,
  visibility: "summary",
  status: "active",
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});

export const visit = (over: Partial<Visit> = {}): Visit => ({
  id: "v1",
  familyMemberId: "m1",
  visitOn: "2026-10-01",
  withWhom: "Dr. Patel",
  reason: "Yearly checkup",
  questions: null,
  notes: null,
  visibility: "summary",
  status: "active",
  createdAt: STAMP,
  updatedAt: STAMP,
  ...over,
});
