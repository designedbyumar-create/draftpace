"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { Clock, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveSymptomEvent, createSymptomEvent, updateSymptomEvent } from "../domain/symptomEvents";
import { todayIso, usDate } from "../dates";
import type { DurationUnit, FamilyMember, Severity, SymptomEvent } from "../state";
import { CARD, ChoiceRow, FormPanel, Heading, PersonPicker, PrivateField, RecordRow, RemoveControl, TextAction } from "./Care";
import { gate } from "./Gate";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

const SEVERITY: { id: Severity; label: string }[] = [
  { id: "mild", label: "Mild" },
  { id: "moderate", label: "Moderate" },
  { id: "severe", label: "Severe" },
];
const UNITS: { id: DurationUnit; label: string }[] = [
  { id: "hours", label: "Hours" },
  { id: "days", label: "Days" },
  { id: "weeks", label: "Weeks" },
];

/**
 * Recording one symptom: onset, duration and severity as real fields, never
 * one free-text box, so a pattern across weeks is something you can see
 * rather than reconstruct at an intake desk. What helped stays free text.
 */
function SymptomForm({
  instanceId,
  member,
  event,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  event?: SymptomEvent;
  onSaved: (event: SymptomEvent) => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState(event?.description ?? "");
  const [onsetAt, setOnsetAt] = useState(event?.onsetAt ?? todayIso());
  const [durationValue, setDurationValue] = useState(event?.durationValue ? String(event.durationValue) : "");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(event?.durationUnit ?? "days");
  const [severity, setSeverity] = useState<Severity>(event?.severity ?? "mild");
  const [whatHelped, setWhatHelped] = useState(event?.whatHelped ?? "");
  const [priv, setPriv] = useState(event?.visibility === "private");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const patch = {
      familyMemberId: member.id,
      description: description.trim(),
      onsetAt,
      durationValue: durationValue ? Number(durationValue) : null,
      durationUnit: durationValue ? durationUnit : null,
      severity,
      whatHelped: whatHelped.trim() || null,
      visibility: priv ? "private" : "summary",
    };
    const result = event ? await updateSymptomEvent(event.id, patch) : await createSymptomEvent(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <Input label="What is it?" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Fever" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Started" value={onsetAt} onChange={(e) => setOnsetAt(e.target.value)} containerClassName="min-w-[160px] flex-1" />
        <Input label="How long (optional)" inputMode="numeric" value={durationValue} onChange={(e) => setDurationValue(e.target.value)} placeholder="3" containerClassName="w-32" />
      </div>
      {durationValue && <ChoiceRow label="Unit" options={UNITS} value={durationUnit} onChange={setDurationUnit} />}
      <ChoiceRow label="How bad" options={SEVERITY} value={severity} onChange={setSeverity} />
      <Input label="What helped (optional)" value={whatHelped} onChange={(e) => setWhatHelped(e.target.value)} placeholder="Rest and fluids" />
      <PrivateField checked={priv} onChange={setPriv} leaves="every printed page" />
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || description.trim().length === 0 || onsetAt === ""}>
          {pending ? "Saving..." : event ? "Save" : "Record it"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </FormPanel>
  );
}

export default function TimelineModule() {
  const data = useFamilyHealthBinder();
  const [personId, setPersonId] = useState<string | null>(null);
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = gate(data);
  if (blocked) return blocked;
  const { instanceId, members, events, saveEvent } = data;
  if (!instanceId) return null;
  if (members.length === 0) {
    return <EmptyState icon={Clock} title="Nobody added yet" description="Add a person in Family before recording a symptom." />;
  }

  const member = members.find((m) => m.id === personId) ?? members[0];
  const mine = events.filter((e) => e.familyMemberId === member.id && e.status === "active").sort((a, b) => (a.onsetAt < b.onsetAt ? 1 : a.onsetAt > b.onsetAt ? -1 : 0));

  async function remove(event: SymptomEvent) {
    setBusyId(event.id);
    setError(null);
    const result = await archiveSymptomEvent(event.id);
    setBusyId(null);
    if (!result.ok) return setError(describeResultError(result.error));
    saveEvent(result.data);
  }

  const saved = (event: SymptomEvent) => {
    saveEvent(event);
    setEditing(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Heading
        kicker="As it happened"
        title="Symptoms"
        action={
          editing !== "new" && (
            <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setEditing("new")}>
              Record one
            </Button>
          )
        }
      />
      {members.length > 1 && <PersonPicker people={members} activeId={member.id} onPick={(id) => { setPersonId(id); setEditing(null); }} />}
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}

      {editing === "new" && <SymptomForm instanceId={instanceId} member={member} onSaved={saved} onCancel={() => setEditing(null)} />}

      <div className={`${CARD} px-5`}>
        {mine.length === 0 ? (
          <p className="py-5 text-[14px] text-[var(--muted)]">Nothing recorded for {member.name} yet. Note a symptom when it starts and the dates are there when someone asks.</p>
        ) : (
          mine.map((event) =>
            editing === event.id ? (
              <div key={event.id} className="py-4">
                <SymptomForm instanceId={instanceId} member={member} event={event} onSaved={saved} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <RecordRow
                key={event.id}
                title={event.description}
                meta={[
                  usDate(event.onsetAt),
                  SEVERITY.find((s) => s.id === event.severity)?.label,
                  event.durationValue !== null && event.durationUnit ? `${event.durationValue} ${event.durationUnit}` : null,
                  event.visibility === "private" ? "Private" : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                note={event.whatHelped ? `Helped: ${event.whatHelped}` : null}
                actions={
                  <>
                    <TextAction onClick={() => setEditing(event.id)}>Change</TextAction>
                    <RemoveControl what="this symptom" pending={busyId === event.id} onConfirm={() => remove(event)} />
                  </>
                }
              />
            )
          )
        )}
      </div>
    </div>
  );
}
