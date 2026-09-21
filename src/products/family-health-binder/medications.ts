import { daysBetween, plural, usDate } from "./dates";
import type { FamilyMember, MedicalFact } from "./state";

/** A medication still being taken: not archived, and no stop date. */
export function isCurrentMedication(fact: MedicalFact): boolean {
  return fact.kind === "medication" && fact.status === "active" && fact.stoppedOn === null;
}

export function currentMedications(facts: MedicalFact[], memberId: string): MedicalFact[] {
  return facts.filter((f) => f.familyMemberId === memberId && isCurrentMedication(f));
}

/** Medications the person has stopped. Kept in the record, never printed. */
export function pastMedications(facts: MedicalFact[], memberId: string): MedicalFact[] {
  return facts.filter(
    (f) => f.familyMemberId === memberId && f.kind === "medication" && f.status === "active" && f.stoppedOn !== null
  );
}

/** "Amoxicillin, 250mg, twice daily": whatever was typed, in reading order. */
export function describeMedication(fact: MedicalFact): string {
  return [fact.detail, fact.dosage, fact.frequency].filter(Boolean).join(", ");
}

/** "Started 03/04/2026" or "Started 03/04/2026, stopped 04/01/2026", or null when neither date was entered. */
export function describeMedicationDates(fact: MedicalFact): string | null {
  const started = fact.startedOn ? `Started ${usDate(fact.startedOn)}` : null;
  const stopped = fact.stoppedOn ? `stopped ${usDate(fact.stoppedOn)}` : null;
  if (started && stopped) return `${started}, ${stopped}`;
  if (started) return started;
  if (stopped) return `Stopped ${usDate(fact.stoppedOn as string)}`;
  return null;
}

/** What the record says about when the list was last looked over. It states a fact and never judges how old is too old. */
export function describeMedicationsCheck(member: Pick<FamilyMember, "medicationsCheckedOn">, today: string): string {
  const on = member.medicationsCheckedOn;
  if (!on) return "Not checked yet";
  const days = daysBetween(on, today);
  if (days === null || days < 0) return `Checked ${usDate(on)}`;
  if (days === 0) return "Checked today";
  if (days === 1) return "Checked yesterday";
  return `Checked ${plural(days, "day")} ago`;
}
