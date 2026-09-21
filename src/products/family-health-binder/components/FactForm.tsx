"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createMedicalFact, updateMedicalFact } from "../domain/medicalFacts";
import { FACT_LABEL } from "../labels";
import type { FamilyMember, MedicalFact, MedicalFactKind } from "../state";
import { FormPanel, PrivateField } from "./Care";

const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());

/**
 * One form for adding or changing an allergy, a condition, a medication or a
 * family-history note. The kind is fixed by the section that opened it, so
 * nobody chooses a type before typing a word, and only the fields that kind
 * uses are shown.
 */
export default function FactForm({
  instanceId,
  member,
  kind,
  fact,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  kind: MedicalFactKind;
  fact?: MedicalFact;
  onSaved: (fact: MedicalFact) => void;
  onCancel: () => void;
}) {
  const label = FACT_LABEL[kind];
  const [detail, setDetail] = useState(fact?.detail ?? "");
  const [dosage, setDosage] = useState(fact?.dosage ?? "");
  const [frequency, setFrequency] = useState(fact?.frequency ?? "");
  const [reaction, setReaction] = useState(fact?.reaction ?? "");
  const [startedOn, setStartedOn] = useState(fact?.startedOn ?? "");
  const [stoppedOn, setStoppedOn] = useState(fact?.stoppedOn ?? "");
  const [priv, setPriv] = useState(fact?.visibility === "private");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const isMedication = kind === "medication";
    const patch = {
      familyMemberId: member.id,
      kind,
      detail: detail.trim(),
      dosage: isMedication ? blankToNull(dosage) : null,
      frequency: isMedication ? blankToNull(frequency) : null,
      reaction: kind === "allergy" ? blankToNull(reaction) : null,
      startedOn: isMedication ? startedOn || null : null,
      stoppedOn: isMedication ? stoppedOn || null : null,
      visibility: priv ? "private" : "summary",
    };
    const result = fact ? await updateMedicalFact(fact.id, patch) : await createMedicalFact(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <Input label={label.prompt} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={label.placeholder} autoFocus />
      {kind === "medication" && (
        <>
          <div className="flex flex-wrap gap-3">
            <Input label="Dose" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="250 mg" containerClassName="min-w-[140px] flex-1" />
            <Input label="How often" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Twice a day" containerClassName="min-w-[140px] flex-1" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Input type="date" label="Started (optional)" value={startedOn} onChange={(e) => setStartedOn(e.target.value)} containerClassName="min-w-[160px] flex-1" />
            {fact && <Input type="date" label="Stopped (optional)" value={stoppedOn} onChange={(e) => setStoppedOn(e.target.value)} hint="A stopped medication stays here and leaves every printed page." containerClassName="min-w-[160px] flex-1" />}
          </div>
        </>
      )}
      {kind === "allergy" && <Input label="What happens (optional)" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="Hives" />}
      <PrivateField checked={priv} onChange={setPriv} leaves="every printed page" />
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || detail.trim().length === 0}>
          {pending ? "Saving..." : fact ? "Save" : "Add"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </FormPanel>
  );
}
