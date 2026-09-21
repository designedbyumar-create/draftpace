import type { FamilyMember, MedicalFact } from "../state";
import { describeAge } from "../dates";
import { RELATIONSHIP_LABEL } from "../labels";
import { currentMedications, describeMedicationsCheck } from "../medications";
import { CARD, PersonMark, Tag } from "./Care";

/**
 * A person as a card: their colour and name, allergies first as tags, their
 * conditions, and what they take now. Presentational, so it draws the same
 * on Overview, on Family and in tests. It shows every active fact, private
 * ones included: privacy decides what is printed, never what its owner sees.
 */
export default function CareCard({
  member,
  index,
  facts,
  today,
  compact = false,
}: {
  member: FamilyMember;
  index: number;
  facts: MedicalFact[];
  today: string;
  compact?: boolean;
}) {
  const mine = facts.filter((f) => f.familyMemberId === member.id && f.status === "active");
  const allergies = mine.filter((f) => f.kind === "allergy");
  const conditions = mine.filter((f) => f.kind === "condition");
  const medications = currentMedications(facts, member.id);
  const age = describeAge(member.dateOfBirth, today);

  return (
    <section aria-label={`${member.name}'s card`} className={`${CARD} p-5`}>
      <div className="flex items-center gap-4">
        <PersonMark index={index} name={member.name} size={compact ? 44 : 56} />
        <div className="min-w-0">
          <h2 className={`truncate font-semibold tracking-[-0.015em] text-[var(--text)] ${compact ? "text-[18px]" : "text-[22px]"}`}>{member.name}</h2>
          <p className="text-[14px] text-[var(--muted)]">{[RELATIONSHIP_LABEL[member.relationship], age].filter(Boolean).join(" · ")}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-label="Allergies">
        {allergies.length > 0 ? allergies.map((a) => <Tag key={a.id}>{a.detail}</Tag>) : <Tag tone="quiet">No allergies recorded</Tag>}
      </div>

      {conditions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Conditions">
          {conditions.map((c) => (
            <Tag key={c.id} tone="quiet">
              {c.detail}
            </Tag>
          ))}
        </div>
      )}

      {!compact && (
        <p className="mt-4 text-[14px] leading-relaxed text-[var(--muted)]">
          {medications.length > 0 ? (
            <>
              <span className="font-semibold text-[var(--text)]">Takes </span>
              {medications.map((m) => m.detail).join(", ")}
              <span className="text-[var(--faint)]">. {describeMedicationsCheck(member, today)}.</span>
            </>
          ) : (
            "No current medications recorded."
          )}
        </p>
      )}
    </section>
  );
}
