"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveImmunization, createImmunization, updateImmunization } from "../domain/immunizations";
import { usDate } from "../dates";
import { VACCINE_NAMES } from "../immunizations";
import type { FamilyMember, Immunization } from "../state";
import { CARD, FormPanel, PrivateField, RecordRow, RemoveControl, Section, TextAction } from "./Care";

function ShotForm({
  instanceId,
  member,
  shot,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  shot?: Immunization;
  onSaved: (shot: Immunization) => void;
  onCancel: () => void;
}) {
  const [vaccine, setVaccine] = useState(shot?.vaccine ?? "");
  const [givenOn, setGivenOn] = useState(shot?.givenOn ?? "");
  const [note, setNote] = useState(shot?.note ?? "");
  const [priv, setPriv] = useState(shot?.visibility === "private");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const patch = { familyMemberId: member.id, vaccine: vaccine.trim(), givenOn, note: note.trim() || null, visibility: priv ? "private" : "summary" };
    const result = shot ? await updateImmunization(shot.id, patch) : await createImmunization(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <div>
        <Input label="Vaccine" list="fhb-vaccines" value={vaccine} onChange={(e) => setVaccine(e.target.value)} placeholder="Start typing, or pick one" autoFocus />
        <datalist id="fhb-vaccines">
          {VACCINE_NAMES.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      <Input type="date" label="Date given" value={givenOn} onChange={(e) => setGivenOn(e.target.value)} containerClassName="max-w-[220px]" />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Dose 2 of 3, at the pediatrician" />
      <PrivateField checked={priv} onChange={setPriv} leaves="the forms sheet" />
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || vaccine.trim().length === 0 || givenOn === ""}>
          {pending ? "Saving..." : shot ? "Save" : "Add"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </FormPanel>
  );
}

/**
 * Vaccines for one person: a dated list of what was typed in, newest first.
 * It never says which are due or missing, because schedules differ by
 * state, school and doctor, and this product does not know them.
 */
export default function ShotsPanel({
  instanceId,
  member,
  immunizations,
  onSaved,
}: {
  instanceId: string;
  member: FamilyMember;
  immunizations: Immunization[];
  onSaved: (shot: Immunization) => void;
}) {
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mine = immunizations
    .filter((i) => i.familyMemberId === member.id && i.status === "active")
    .sort((a, b) => (a.givenOn < b.givenOn ? 1 : a.givenOn > b.givenOn ? -1 : 0));

  async function remove(shot: Immunization) {
    setBusyId(shot.id);
    setError(null);
    const result = await archiveImmunization(shot.id);
    setBusyId(null);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  const save = (saved: Immunization) => {
    onSaved(saved);
    setEditing(null);
  };

  return (
    <div className={`${CARD} p-5`}>
      <Section
        title="Vaccines"
        count={mine.length}
        action={
          editing !== "new" && (
            <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setEditing("new")}>
              Add a vaccine
            </Button>
          )
        }
      >
        {error && <p role="alert" className="mb-2 text-[13px] text-[var(--danger)]">{error}</p>}
        {mine.length === 0 && editing !== "new" && (
          <p className="text-[14px] leading-relaxed text-[var(--muted)]">
            No vaccines recorded for {member.name}. Type them in from their record. This list shows only what you enter and never says what is due.
          </p>
        )}
        {mine.map((shot) =>
          editing === shot.id ? (
            <div key={shot.id} className="py-3">
              <ShotForm instanceId={instanceId} member={member} shot={shot} onSaved={save} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <RecordRow
              key={shot.id}
              title={shot.vaccine}
              meta={[usDate(shot.givenOn), shot.note, shot.visibility === "private" ? "Private" : null].filter(Boolean).join(" · ")}
              actions={
                <>
                  <TextAction onClick={() => setEditing(shot.id)}>Change</TextAction>
                  <RemoveControl what="this vaccine" pending={busyId === shot.id} onConfirm={() => remove(shot)} />
                </>
              }
            />
          )
        )}
        {editing === "new" && <ShotForm instanceId={instanceId} member={member} onSaved={save} onCancel={() => setEditing(null)} />}
      </Section>
    </div>
  );
}
