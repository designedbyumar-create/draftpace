import type { FamilyMember, MedicalFact, Provider, SymptomEvent, Visit } from "../state";
import { usDate } from "../dates";
import { formsGaps } from "../printSheets";
import { describeVisit, describeVisitTiming, nextVisit } from "../visits";
import CareCard from "./CareCard";

/**
 * One person on Overview: their card, then only what is true and useful
 * about the rest of the record: the next visit, the latest symptom, and
 * what the forms sheet is still missing. Nothing here is a score or a
 * target, and a line appears only when there is something to say.
 */
export default function PersonOverview({
  member,
  index,
  facts,
  events,
  providers,
  visits,
  today,
}: {
  member: FamilyMember;
  index: number;
  facts: MedicalFact[];
  events: SymptomEvent[];
  providers: Provider[];
  visits: Visit[];
  today: string;
}) {
  const next = nextVisit(visits, member.id, today);
  const latest = events
    .filter((e) => e.familyMemberId === member.id && e.status === "active")
    .sort((a, b) => (a.onsetAt < b.onsetAt ? 1 : a.onsetAt > b.onsetAt ? -1 : 0))[0];
  const gaps = formsGaps(member, providers);

  return (
    <li className="flex flex-col gap-2">
      <CareCard member={member} index={index} facts={facts} today={today} compact />
      {(next || latest || gaps.length > 0) && (
        <div className="mx-1 flex flex-col gap-1 text-[14px] leading-snug text-[var(--muted)]">
          {next && (
            <p>
              <span className="font-semibold text-[var(--text)]">Next visit</span> {describeVisit(next)}, {describeVisitTiming(next, today).toLowerCase()}
            </p>
          )}
          {latest && (
            <p>
              <span className="font-semibold text-[var(--text)]">Latest symptom</span> {latest.description}, {usDate(latest.onsetAt)}
            </p>
          )}
          {gaps.length > 0 && (
            <p>
              <span className="font-semibold text-[var(--text)]">Forms sheet is missing</span> {gaps.join(", ")}
            </p>
          )}
        </div>
      )}
    </li>
  );
}
