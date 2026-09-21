"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveProvider, createProvider, updateProvider } from "../domain/providers";
import { PROVIDER_LABEL, careTeam } from "../providers";
import { formsGaps } from "../printSheets";
import type { FamilyMember, Provider, ProviderKind } from "../state";
import { CARD, ChoiceRow, FormPanel, RecordRow, RemoveControl, Section, Tag, TextAction } from "./Care";
import { CaregiverNotesForm, ContactsForm } from "./MemberForms";

const KINDS = (Object.keys(PROVIDER_LABEL) as ProviderKind[]).map((id) => ({ id, label: PROVIDER_LABEL[id] }));

function ProviderForm({
  instanceId,
  member,
  provider,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  provider?: Provider;
  onSaved: (provider: Provider) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<ProviderKind>(provider?.kind ?? "doctor");
  const [name, setName] = useState(provider?.name ?? "");
  const [phone, setPhone] = useState(provider?.phone ?? "");
  const [note, setNote] = useState(provider?.note ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const patch = { familyMemberId: member.id, kind, name: name.trim(), phone: phone.trim() || null, note: note.trim() || null };
    const result = provider ? await updateProvider(provider.id, patch) : await createProvider(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <ChoiceRow label="What are they?" options={KINDS} value={kind} onChange={setKind} />
      <Input label={kind === "pharmacy" ? "Pharmacy" : "Name"} value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "pharmacy" ? "Corner Pharmacy" : "Dr. Patel"} autoFocus />
      <Input label="Phone (optional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 010-0100" />
      <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pediatrics, Main Street office" />
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || name.trim().length === 0}>
          {pending ? "Saving..." : provider ? "Save" : "Add"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </FormPanel>
  );
}

/**
 * Who cares for this person and who to call: doctors and a pharmacy, an
 * emergency contact, insurance, and notes for whoever is minding them. These
 * are the answers school and camp forms and sitters keep asking for.
 */
export default function CareTeamPanel({
  instanceId,
  member,
  providers,
  onProvider,
  onMember,
}: {
  instanceId: string;
  member: FamilyMember;
  providers: Provider[];
  onProvider: (provider: Provider) => void;
  onMember: (member: FamilyMember) => void;
}) {
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [contacts, setContacts] = useState(false);
  const [notes, setNotes] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const team = careTeam(providers, member.id);
  const gaps = formsGaps(member, providers);

  async function remove(provider: Provider) {
    setBusyId(provider.id);
    setError(null);
    const result = await archiveProvider(provider.id);
    setBusyId(null);
    if (!result.ok) return setError(describeResultError(result.error));
    onProvider(result.data);
  }

  const saved = (provider: Provider) => {
    onProvider(provider);
    setEditing(null);
  };

  return (
    <div className={`${CARD} flex flex-col gap-7 p-5`}>
      {gaps.length > 0 && (
        <p className="text-[14px] leading-relaxed text-[var(--muted)]">
          <Tag tone="quiet">Not on the forms sheet yet</Tag> <span className="ml-1">{gaps.join(", ")}.</span>
        </p>
      )}
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}

      <Section
        title="Doctors and pharmacy"
        count={team.length}
        action={
          editing !== "new" && (
            <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setEditing("new")}>
              Add
            </Button>
          )
        }
      >
        {team.length === 0 && editing !== "new" && <p className="text-[14px] text-[var(--muted)]">No doctors or pharmacy recorded for {member.name}.</p>}
        {team.map((p) =>
          editing === p.id ? (
            <div key={p.id} className="py-3">
              <ProviderForm instanceId={instanceId} member={member} provider={p} onSaved={saved} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <RecordRow
              key={p.id}
              title={p.name}
              meta={[PROVIDER_LABEL[p.kind], p.phone].filter(Boolean).join(" · ")}
              note={p.note}
              actions={
                <>
                  <TextAction onClick={() => setEditing(p.id)}>Change</TextAction>
                  <RemoveControl what={p.name} pending={busyId === p.id} onConfirm={() => remove(p)} />
                </>
              }
            />
          )
        )}
        {editing === "new" && <ProviderForm instanceId={instanceId} member={member} onSaved={saved} onCancel={() => setEditing(null)} />}
      </Section>

      <Section title="Emergency contact and insurance" action={!contacts && <TextAction onClick={() => setContacts(true)}>Change</TextAction>}>
        {contacts ? (
          <ContactsForm member={member} onSaved={(m) => { onMember(m); setContacts(false); }} onCancel={() => setContacts(false)} />
        ) : (
          <div>
            <RecordRow title="Emergency contact" meta={[member.emergencyName, member.emergencyPhone].filter(Boolean).join(" · ") || "Not added yet"} />
            <RecordRow
              title="Health insurance"
              meta={member.insurer ? [member.insurer, member.insuranceMemberId && `Member ID ${member.insuranceMemberId}`, member.insuranceGroup && `Group ${member.insuranceGroup}`].filter(Boolean).join(" · ") : "Not added yet"}
            />
          </div>
        )}
      </Section>

      <Section title={`Notes for someone minding ${member.name}`} action={!notes && <TextAction onClick={() => setNotes(true)}>{member.caregiverNotes ? "Change" : "Add"}</TextAction>}>
        {notes ? (
          <CaregiverNotesForm member={member} onSaved={(m) => { onMember(m); setNotes(false); }} onCancel={() => setNotes(false)} />
        ) : member.caregiverNotes ? (
          <p className="whitespace-pre-line text-[14.5px] leading-relaxed text-[var(--text)]">{member.caregiverNotes}</p>
        ) : (
          <p className="text-[14px] text-[var(--muted)]">Nothing yet. Bedtime, comforts, fears: whatever a sitter or grandparent would need.</p>
        )}
      </Section>
    </div>
  );
}
