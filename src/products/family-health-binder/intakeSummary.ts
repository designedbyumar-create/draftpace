import type { FamilyMember, MedicalFact, SymptomEvent } from "./state";

/**
 * The pure data-shaping behind the Intake Summary printable, kept
 * separate from printables/generateIntakeSummary.tsx (which imports
 * @react-pdf/renderer and must only ever be reached via a dynamic
 * import) so this can be unit tested directly, same split as Personal
 * Finance Companion's computeSharedResponsibilitySummary.
 *
 * VISIBILITY IS THE WHOLE POINT OF THIS FUNCTION
 *
 * A fact or symptom event marked 'private' stays in the account and
 * reachable in the app, but this function excludes it from what a
 * printed page ever shows. The Intake Summary supplements a clinic's
 * own paperwork; it is not a demand that every private detail leave the
 * house.
 */

export interface IntakeSummaryLine {
  label: string;
  detail: string;
}

export interface IntakeSummaryData {
  member: Pick<FamilyMember, "name" | "dateOfBirth">;
  medications: IntakeSummaryLine[];
  allergies: IntakeSummaryLine[];
  history: IntakeSummaryLine[];
  recentSymptoms: IntakeSummaryLine[];
}

function durationLabel(event: SymptomEvent): string {
  if (event.durationValue === null || event.durationUnit === null) return "";
  return `${event.durationValue} ${event.durationUnit}`;
}

/** The N most recent symptom events eligible for printing, newest first. Capped so a long-tracked member's page stays a summary, not a full log. */
const RECENT_SYMPTOM_LIMIT = 8;

export function buildIntakeSummary(
  member: FamilyMember,
  facts: MedicalFact[],
  events: SymptomEvent[]
): IntakeSummaryData {
  const memberFacts = facts.filter((f) => f.familyMemberId === member.id && f.status === "active" && f.visibility === "summary");
  const memberEvents = events
    .filter((e) => e.familyMemberId === member.id && e.status === "active" && e.visibility === "summary")
    .sort((a, b) => (a.onsetAt < b.onsetAt ? 1 : -1))
    .slice(0, RECENT_SYMPTOM_LIMIT);

  return {
    member: { name: member.name, dateOfBirth: member.dateOfBirth },
    medications: memberFacts
      .filter((f) => f.kind === "medication")
      .map((f) => ({
        label: f.detail,
        detail: [f.dosage, f.frequency].filter(Boolean).join(", "),
      })),
    allergies: memberFacts
      .filter((f) => f.kind === "allergy")
      .map((f) => ({ label: f.detail, detail: f.reaction ?? "" })),
    history: memberFacts.filter((f) => f.kind === "history").map((f) => ({ label: f.detail, detail: "" })),
    recentSymptoms: memberEvents.map((e) => ({
      label: `${e.description}, ${e.onsetAt}`,
      detail: [e.severity, durationLabel(e), e.whatHelped ? `helped by ${e.whatHelped}` : null].filter(Boolean).join(", "),
    })),
  };
}
