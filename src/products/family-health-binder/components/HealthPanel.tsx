"use client";

import { useState, type ReactNode } from "react";
import Button from "@/design-system/Button";
import { Plus } from "@/design-system/Icon";
import { describeResultError, type Result } from "@/product-framework/result";
import { updateFamilyMember } from "../domain/familyMembers";
import { archiveMedicalFact, updateMedicalFact } from "../domain/medicalFacts";
import { FACT_LABEL } from "../labels";
import { currentMedications, describeMedicationDates, describeMedicationsCheck, pastMedications } from "../medications";
import type { FamilyMember, MedicalFact, MedicalFactKind } from "../state";
import { CARD, RecordRow, RemoveControl, Section, TextAction } from "./Care";
import FactForm from "./FactForm";

type Editing = { kind: MedicalFactKind; fact?: MedicalFact } | null;

const meta = (fact: MedicalFact): string | null => {
  const parts =
    fact.kind === "medication"
      ? [[fact.dosage, fact.frequency].filter(Boolean).join(", "), describeMedicationDates(fact)]
      : fact.kind === "allergy"
        ? [fact.reaction]
        : [];
  const line = [...parts, fact.visibility === "private" ? "Private" : null].filter(Boolean).join(" · ");
  return line || null;
};

/**
 * Health for one person: allergies, conditions, medications and family
 * history. Every record can be changed or removed; a medication can be marked
 * stopped, which keeps it in the record and takes it off every printed page.
 */
export default function HealthPanel({
  instanceId,
  member,
  facts,
  today,
  onFact,
  onMember,
}: {
  instanceId: string;
  member: FamilyMember;
  facts: MedicalFact[];
  today: string;
  onFact: (fact: MedicalFact) => void;
  onMember: (member: FamilyMember) => void;
}) {
  const [editing, setEditing] = useState<Editing>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mine = facts.filter((f) => f.familyMemberId === member.id && f.status === "active");

  async function run<T>(id: string, job: () => Promise<Result<T>>, done: (data: T) => void) {
    setBusyId(id);
    setError(null);
    const result = await job();
    setBusyId(null);
    if (!result.ok) return setError(describeResultError(result.error));
    done(result.data);
  }

  const setStopped = (fact: MedicalFact, stoppedOn: string | null) => run(fact.id, () => updateMedicalFact(fact.id, { stoppedOn }), onFact);
  const remove = (fact: MedicalFact) => run(fact.id, () => archiveMedicalFact(fact.id), onFact);
  const checkList = () => run("check", () => updateFamilyMember(member.id, { medicationsCheckedOn: today }), onMember);

  const renderRows = (rows: MedicalFact[], kind: MedicalFactKind, extra?: (fact: MedicalFact) => ReactNode) => {
    return (
      <div>
        {rows.map((fact) =>
          editing?.fact?.id === fact.id ? (
            <div key={fact.id} className="py-3">
              <FactForm instanceId={instanceId} member={member} kind={kind} fact={fact} onSaved={(saved) => { onFact(saved); setEditing(null); }} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <RecordRow
              key={fact.id}
              title={fact.detail}
              meta={meta(fact)}
              actions={
                <>
                  <TextAction onClick={() => setEditing({ kind, fact })}>Change</TextAction>
                  {extra?.(fact)}
                  <RemoveControl what={FACT_LABEL[kind].noun} pending={busyId === fact.id} onConfirm={() => remove(fact)} />
                </>
              }
            />
          )
        )}
      </div>
    );
  };

  const renderBlock = (kind: MedicalFactKind, rows: MedicalFact[], empty: string, extra?: (fact: MedicalFact) => ReactNode) => {
    const adding = editing?.kind === kind && !editing.fact;
    return (
      <Section
        title={FACT_LABEL[kind].section}
        count={rows.length}
        action={
          !adding && (
            <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setEditing({ kind })}>
              {FACT_LABEL[kind].add.replace(/^Add (an?|a) /, "Add ")}
            </Button>
          )
        }
      >
        {rows.length === 0 && !adding && <p className="text-[14px] text-[var(--muted)]">{empty}</p>}
        {renderRows(rows, kind, extra)}
        {adding && <FactForm instanceId={instanceId} member={member} kind={kind} onSaved={(saved) => { onFact(saved); setEditing(null); }} onCancel={() => setEditing(null)} />}
      </Section>
    );
  };

  const current = currentMedications(mine, member.id);
  const past = pastMedications(mine, member.id);

  return (
    <div className={`${CARD} flex flex-col gap-7 p-5`}>
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      {renderBlock("allergy", mine.filter((f) => f.kind === "allergy"), `No allergies recorded for ${member.name}.`)}
      {renderBlock("condition", mine.filter((f) => f.kind === "condition"), `No conditions recorded for ${member.name}.`)}
      <div>
        {renderBlock("medication", current, `No current medications recorded for ${member.name}.`, (fact) => (
          <TextAction disabled={busyId === fact.id} onClick={() => setStopped(fact, today)}>
            Stopped taking it
          </TextAction>
        ))}
        {current.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius)] bg-[var(--surface-muted)] px-4 py-3">
            <p className="text-[14px] text-[var(--muted)]">{describeMedicationsCheck(member, today)}.</p>
            <Button size="sm" variant="secondary" disabled={busyId === "check"} onClick={checkList}>
              This list is right today
            </Button>
          </div>
        )}
        {past.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-[14px] font-semibold text-[var(--muted)]">Stopped ({past.length})</summary>
            {renderRows(past, "medication", (fact) => (
              <TextAction disabled={busyId === fact.id} onClick={() => setStopped(fact, null)}>
                Taking it again
              </TextAction>
            ))}
          </details>
        )}
      </div>
      {renderBlock("history", mine.filter((f) => f.kind === "history"), `No family history recorded for ${member.name}.`)}
    </div>
  );
}
