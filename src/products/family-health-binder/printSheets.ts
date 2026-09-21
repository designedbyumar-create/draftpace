import { describeAge, usDate } from "./dates";
import { groupImmunizations, immunizationLine } from "./immunizations";
import { currentMedications, describeMedication } from "./medications";
import { PROVIDER_LABEL, careTeam, primaryDoctor } from "./providers";
import { parseQuestions } from "./visits";
import type { FamilyMember, Immunization, MedicalFact, Provider, SymptomEvent, Visit } from "./state";

/**
 * The pure data-shaping behind the pages that leave the house. Kept apart
 * from the PDF files (which import @react-pdf/renderer and are only ever
 * reached by a dynamic import) so it can be tested directly.
 *
 * PRIVACY IS APPLIED HERE, ONCE
 *
 * A fact, symptom, vaccine or visit marked private stays in the account and
 * never reaches a printed page. A medication with a stop date is left off
 * too: it is history, and a page handed to a school or a sitter has to show
 * what is being taken now. Contact details a person typed in (their doctor,
 * their insurer, who to call) are what these pages are for, so they print.
 */

export interface SheetLine {
  label: string;
  detail: string;
}

export interface SheetPerson {
  name: string;
  /** "04/02/2018", or null when no date of birth was entered. */
  dateOfBirth: string | null;
  /** "8 years", or null. */
  age: string | null;
}

export interface SheetContact {
  name: string | null;
  phone: string | null;
}

function person(member: FamilyMember, today: string): SheetPerson {
  return {
    name: member.name,
    dateOfBirth: member.dateOfBirth ? usDate(member.dateOfBirth) : null,
    age: describeAge(member.dateOfBirth, today),
  };
}

function emergency(member: FamilyMember): SheetContact | null {
  if (!member.emergencyName && !member.emergencyPhone) return null;
  return { name: member.emergencyName, phone: member.emergencyPhone };
}

const visibleFacts = (facts: MedicalFact[], memberId: string) =>
  facts.filter((f) => f.familyMemberId === memberId && f.status === "active" && f.visibility === "summary");

function allergyLines(facts: MedicalFact[], memberId: string): SheetLine[] {
  return visibleFacts(facts, memberId)
    .filter((f) => f.kind === "allergy")
    .map((f) => ({ label: f.detail, detail: f.reaction ?? "" }));
}

function conditionLines(facts: MedicalFact[], memberId: string): SheetLine[] {
  return visibleFacts(facts, memberId)
    .filter((f) => f.kind === "condition")
    .map((f) => ({ label: f.detail, detail: "" }));
}

function medicationLines(facts: MedicalFact[], memberId: string): SheetLine[] {
  return currentMedications(visibleFacts(facts, memberId), memberId).map((f) => ({
    label: f.detail,
    detail: [f.dosage, f.frequency].filter(Boolean).join(", "),
  }));
}

/** Everything a person marked private for this person, so a page can say how much it left off. */
export function privateCount(
  memberId: string,
  facts: MedicalFact[],
  events: SymptomEvent[],
  immunizations: Immunization[],
  visits: Visit[]
): number {
  const isHidden = (r: { familyMemberId: string; status: string; visibility: string }) =>
    r.familyMemberId === memberId && r.status === "active" && r.visibility === "private";
  return facts.filter(isHidden).length + events.filter(isHidden).length + immunizations.filter(isHidden).length + visits.filter(isHidden).length;
}

/** What the forms sheet has no answer for yet. Named plainly, in the order a form asks. */
export function formsGaps(member: FamilyMember, providers: Provider[]): string[] {
  const gaps: string[] = [];
  if (!member.dateOfBirth) gaps.push("date of birth");
  if (!member.emergencyName || !member.emergencyPhone) gaps.push("emergency contact");
  if (!member.insurer) gaps.push("insurance");
  if (!primaryDoctor(providers, member.id)) gaps.push("a doctor");
  return gaps;
}

/* ------------------------------------------------------------- forms sheet */

export interface FormsSheetData {
  person: SheetPerson;
  emergency: SheetContact | null;
  insurance: { insurer: string; memberId: string | null; group: string | null } | null;
  careTeam: { role: string; name: string; phone: string | null }[];
  allergies: SheetLine[];
  conditions: SheetLine[];
  medications: SheetLine[];
  immunizations: SheetLine[];
  hiddenCount: number;
}

/** The answers school, camp, sports and new-patient forms keep asking for, in the order they ask. */
export function buildFormsSheet(
  member: FamilyMember,
  facts: MedicalFact[],
  providers: Provider[],
  immunizations: Immunization[],
  events: SymptomEvent[],
  visits: Visit[],
  today: string
): FormsSheetData {
  return {
    person: person(member, today),
    emergency: emergency(member),
    insurance: member.insurer ? { insurer: member.insurer, memberId: member.insuranceMemberId, group: member.insuranceGroup } : null,
    careTeam: careTeam(providers, member.id).map((p) => ({ role: PROVIDER_LABEL[p.kind], name: p.name, phone: p.phone })),
    allergies: allergyLines(facts, member.id),
    conditions: conditionLines(facts, member.id),
    medications: medicationLines(facts, member.id),
    immunizations: groupImmunizations(immunizations, member.id, { summaryOnly: true }).map(immunizationLine),
    hiddenCount: privateCount(member.id, facts, events, immunizations, visits),
  };
}

/* ---------------------------------------------------------- caregiver sheet */

export interface CaregiverSheetData {
  person: SheetPerson;
  allergies: SheetLine[];
  conditions: SheetLine[];
  medications: SheetLine[];
  doctor: { name: string; phone: string | null } | null;
  emergency: SheetContact | null;
  notes: string | null;
  hiddenCount: number;
}

/** For a babysitter, a grandparent or a respite carer: what to avoid, what is taken, who to call. */
export function buildCaregiverSheet(
  member: FamilyMember,
  facts: MedicalFact[],
  providers: Provider[],
  immunizations: Immunization[],
  events: SymptomEvent[],
  visits: Visit[],
  today: string
): CaregiverSheetData {
  const doctor = primaryDoctor(providers, member.id);
  const notes = member.caregiverNotes?.trim();
  return {
    person: person(member, today),
    allergies: allergyLines(facts, member.id),
    conditions: conditionLines(facts, member.id),
    medications: medicationLines(facts, member.id),
    doctor: doctor ? { name: doctor.name, phone: doctor.phone } : null,
    emergency: emergency(member),
    notes: notes ? notes : null,
    hiddenCount: privateCount(member.id, facts, events, immunizations, visits),
  };
}

/* ---------------------------------------------------------- emergency card */

export interface EmergencyCardData {
  person: SheetPerson;
  allergies: string[];
  conditions: string[];
  medications: string[];
  emergency: SheetContact | null;
  doctor: { name: string; phone: string | null } | null;
  insurance: { insurer: string; memberId: string | null } | null;
  hiddenCount: number;
}

/** One small card for a wallet or the fridge. Short by design: names, not sentences. */
export function buildEmergencyCard(
  member: FamilyMember,
  facts: MedicalFact[],
  providers: Provider[],
  immunizations: Immunization[],
  events: SymptomEvent[],
  visits: Visit[],
  today: string
): EmergencyCardData {
  const doctor = primaryDoctor(providers, member.id);
  return {
    person: person(member, today),
    allergies: allergyLines(facts, member.id).map((l) => (l.detail ? `${l.label} (${l.detail})` : l.label)),
    conditions: conditionLines(facts, member.id).map((l) => l.label),
    medications: currentMedications(visibleFacts(facts, member.id), member.id).map(describeMedication),
    emergency: emergency(member),
    doctor: doctor ? { name: doctor.name, phone: doctor.phone } : null,
    insurance: member.insurer ? { insurer: member.insurer, memberId: member.insuranceMemberId } : null,
    hiddenCount: privateCount(member.id, facts, events, immunizations, visits),
  };
}

/* --------------------------------------------------------------- visit prep */

export interface VisitPrepData {
  person: SheetPerson;
  visit: { date: string; withWhom: string | null; reason: string } | null;
  questions: string[];
  allergies: SheetLine[];
  medications: SheetLine[];
  recentSymptoms: SheetLine[];
  hiddenCount: number;
}

const RECENT_SYMPTOMS = 5;

function symptomDetail(e: SymptomEvent): string {
  const duration = e.durationValue !== null && e.durationUnit ? `${e.durationValue} ${e.durationUnit}` : "";
  return [e.severity, duration, e.whatHelped ? `helped by ${e.whatHelped}` : null].filter(Boolean).join(", ");
}

/** A page to take to an appointment: what to ask, what is taken, what has been happening. A private visit's questions stay off it. */
export function buildVisitPrep(
  member: FamilyMember,
  visit: Visit | null,
  facts: MedicalFact[],
  events: SymptomEvent[],
  immunizations: Immunization[],
  visits: Visit[],
  today: string
): VisitPrepData {
  const shown = visit && visit.visibility === "summary" ? visit : null;
  const symptoms = events
    .filter((e) => e.familyMemberId === member.id && e.status === "active" && e.visibility === "summary")
    .sort((a, b) => (a.onsetAt < b.onsetAt ? 1 : -1))
    .slice(0, RECENT_SYMPTOMS);
  return {
    person: person(member, today),
    visit: shown ? { date: usDate(shown.visitOn), withWhom: shown.withWhom, reason: shown.reason } : null,
    questions: shown ? parseQuestions(shown.questions) : [],
    allergies: allergyLines(facts, member.id),
    medications: medicationLines(facts, member.id),
    recentSymptoms: symptoms.map((e) => ({ label: `${e.description}, ${usDate(e.onsetAt)}`, detail: symptomDetail(e) })),
    hiddenCount: privateCount(member.id, facts, events, immunizations, visits),
  };
}
