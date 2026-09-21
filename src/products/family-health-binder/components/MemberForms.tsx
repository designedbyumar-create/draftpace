"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createFamilyMember, updateFamilyMember } from "../domain/familyMembers";
import { RELATIONSHIP_OPTIONS } from "../labels";
import type { FamilyMember, Relationship } from "../state";
import { ChoiceRow, FormPanel, TextAreaField } from "./Care";

const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());

function Actions({ pending, canSave, label, onSave, onCancel, error }: { pending: boolean; canSave: boolean; label: string; onSave: () => void; onCancel: () => void; error: string | null }) {
  return (
    <>
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={onSave} disabled={pending || !canSave}>
          {pending ? "Saving..." : label}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </>
  );
}

/** Adding a person, or changing their name, relationship and birth date. Adults and children are the same kind of row. */
export function PersonForm({
  instanceId,
  member,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member?: FamilyMember;
  onSaved: (member: FamilyMember) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member?.name ?? "");
  const [relationship, setRelationship] = useState<Relationship>(member?.relationship ?? "child");
  const [dateOfBirth, setDateOfBirth] = useState(member?.dateOfBirth ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const patch = { name: name.trim(), relationship, dateOfBirth: dateOfBirth || null };
    const result = member ? await updateFamilyMember(member.id, patch) : await createFamilyMember(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amina" autoFocus />
      <ChoiceRow label="Who are they to you?" options={RELATIONSHIP_OPTIONS} value={relationship} onChange={setRelationship} />
      <Input type="date" label="Date of birth (optional)" hint="Forms ask for it, and it gives their age on the card." value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} containerClassName="max-w-[220px]" />
      <Actions pending={pending} canSave={name.trim().length > 0} label={member ? "Save" : "Add to the binder"} onSave={save} onCancel={onCancel} error={error} />
    </FormPanel>
  );
}

/** Who to call and who insures them: the two blocks nearly every form asks for. Typed in, never looked up. */
export function ContactsForm({ member, onSaved, onCancel }: { member: FamilyMember; onSaved: (member: FamilyMember) => void; onCancel: () => void }) {
  const [emergencyName, setEmergencyName] = useState(member.emergencyName ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(member.emergencyPhone ?? "");
  const [insurer, setInsurer] = useState(member.insurer ?? "");
  const [memberId, setMemberId] = useState(member.insuranceMemberId ?? "");
  const [group, setGroup] = useState(member.insuranceGroup ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const result = await updateFamilyMember(member.id, {
      emergencyName: blankToNull(emergencyName),
      emergencyPhone: blankToNull(emergencyPhone),
      insurer: blankToNull(insurer),
      insuranceMemberId: blankToNull(memberId),
      insuranceGroup: blankToNull(group),
    });
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <p className="text-[14px] font-semibold text-[var(--text)]">Emergency contact</p>
      <div className="flex flex-wrap gap-3">
        <Input label="Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Sam (dad)" containerClassName="min-w-[180px] flex-1" autoFocus />
        <Input label="Phone" type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} placeholder="(555) 010-0142" containerClassName="min-w-[160px] flex-1" />
      </div>
      <p className="mt-1 text-[14px] font-semibold text-[var(--text)]">Health insurance</p>
      <Input label="Insurer" value={insurer} onChange={(e) => setInsurer(e.target.value)} placeholder="Acme Health" />
      <div className="flex flex-wrap gap-3">
        <Input label="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} containerClassName="min-w-[160px] flex-1" />
        <Input label="Group number" value={group} onChange={(e) => setGroup(e.target.value)} containerClassName="min-w-[160px] flex-1" />
      </div>
      <Actions pending={pending} canSave label="Save" onSave={save} onCancel={onCancel} error={error} />
    </FormPanel>
  );
}

/** What a sitter or a grandparent should know. Printed on the caregiver sheet and nowhere else. */
export function CaregiverNotesForm({ member, onSaved, onCancel }: { member: FamilyMember; onSaved: (member: FamilyMember) => void; onCancel: () => void }) {
  const [notes, setNotes] = useState(member.caregiverNotes ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const result = await updateFamilyMember(member.id, { caregiverNotes: blankToNull(notes) });
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <TextAreaField
        label={`What should someone minding ${member.name} know?`}
        value={notes}
        onChange={setNotes}
        placeholder="Bedtime is 8. Likes the green cup. Afraid of dogs."
        hint="Routines, comforts, fears. It prints on the caregiver sheet and nowhere else."
        rows={5}
      />
      <Actions pending={pending} canSave label="Save" onSave={save} onCancel={onCancel} error={error} />
    </FormPanel>
  );
}
