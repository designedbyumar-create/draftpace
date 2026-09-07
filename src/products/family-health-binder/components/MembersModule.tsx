"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { Heart, Plus, User } from "@/design-system/Icon";
import { createFamilyMember } from "../domain/familyMembers";
import { createMedicalFact, updateMedicalFact } from "../domain/medicalFacts";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";
import type { FamilyMember, MedicalFact, MedicalFactKind, Relationship } from "../state";

const RELATIONSHIP_LABEL: Record<Relationship, string> = {
  self: "You",
  spouse: "Spouse",
  child: "Child",
  other: "Other",
};

const KIND_LABEL: Record<MedicalFactKind, string> = {
  medication: "Medications",
  allergy: "Allergies",
  history: "Family history",
};

/**
 * Adding a family member: a name, a relationship, and an optional date
 * of birth. Adults and children are the same kind of row here, scoped
 * under the signed-in account, never a separate account of their own.
 */
function AddMemberForm({
  instanceId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  onAdded: (member: FamilyMember) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState<Relationship>("child");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createFamilyMember(instanceId, {
      name,
      relationship,
      dateOfBirth: dateOfBirth || null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amina" autoFocus />
      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">Relationship to you</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(RELATIONSHIP_LABEL) as Relationship[]).map((option) => (
            <Button
              key={option}
              size="sm"
              variant={relationship === option ? "primary" : "secondary"}
              onClick={() => setRelationship(option)}
            >
              {RELATIONSHIP_LABEL[option]}
            </Button>
          ))}
        </div>
      </div>
      <Input
        type="date"
        label="Date of birth (optional)"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        containerClassName="max-w-[220px]"
      />
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || name.trim().length === 0}>
          Add to the binder
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

/** Adding one medical fact to one family member: medication, allergy or history, with only the fields that kind actually uses. */
function AddFactForm({
  instanceId,
  member,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  onAdded: (fact: MedicalFact) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<MedicalFactKind>("medication");
  const [detail, setDetail] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [reaction, setReaction] = useState("");
  const [visibility, setVisibility] = useState<"summary" | "private">("summary");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createMedicalFact(instanceId, {
      familyMemberId: member.id,
      kind,
      detail,
      dosage: kind === "medication" && dosage ? dosage : null,
      frequency: kind === "medication" && frequency ? frequency : null,
      reaction: kind === "allergy" && reaction ? reaction : null,
      visibility,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(KIND_LABEL) as MedicalFactKind[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setKind(option)}
            className="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
            style={kind === option ? { borderColor: "var(--primary)", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {KIND_LABEL[option]}
          </button>
        ))}
      </div>

      <Input
        label={kind === "medication" ? "Medication name" : kind === "allergy" ? "What they're allergic to" : "Family history note"}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder={kind === "medication" ? "Amoxicillin" : kind === "allergy" ? "Peanuts" : "Asthma runs in the family"}
      />

      {kind === "medication" && (
        <div className="flex flex-wrap gap-3">
          <Input label="Dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="250mg" containerClassName="flex-1" />
          <Input label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="Twice daily" containerClassName="flex-1" />
        </div>
      )}
      {kind === "allergy" && (
        <Input label="Reaction" value={reaction} onChange={(e) => setReaction(e.target.value)} placeholder="Hives" />
      )}

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
        <input
          type="checkbox"
          checked={visibility === "private"}
          onChange={(e) => setVisibility(e.target.checked ? "private" : "summary")}
          className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
        />
        <span>
          Keep this private
          <span className="block text-[12px] font-normal text-[var(--muted)]">
            Stays in the app. Left off the printed Intake Summary.
          </span>
        </span>
      </label>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending || detail.trim().length === 0}>
          Add
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function FactRow({ fact, onChanged }: { fact: MedicalFact; onChanged: (fact: MedicalFact) => void }) {
  const [pending, setPending] = useState(false);

  async function togglePrivacy() {
    setPending(true);
    const result = await updateMedicalFact(fact.id, { visibility: fact.visibility === "private" ? "summary" : "private" });
    setPending(false);
    if (result.ok) onChanged(result.data);
  }

  const secondary = [fact.dosage, fact.frequency, fact.reaction].filter(Boolean).join(", ");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5">
      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">{fact.detail}</p>
        {secondary && <p className="text-[12px] text-[var(--muted)]">{secondary}</p>}
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={togglePrivacy}
        className="text-[11.5px] font-semibold text-[var(--faint)] hover:text-[var(--text)]"
      >
        {fact.visibility === "private" ? "Private" : "On summary"}
      </button>
    </div>
  );
}

function MemberCard({
  instanceId,
  member,
  facts,
  onFactAdded,
  onFactChanged,
}: {
  instanceId: string;
  member: FamilyMember;
  facts: MedicalFact[];
  onFactAdded: (fact: MedicalFact) => void;
  onFactChanged: (fact: MedicalFact) => void;
}) {
  const [addingFact, setAddingFact] = useState(false);
  const memberFacts = facts.filter((f) => f.familyMemberId === member.id && f.status === "active");

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-baseline gap-3">
        <h3 className="text-[16px] font-semibold text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {member.name}
        </h3>
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--faint)]">
          {RELATIONSHIP_LABEL[member.relationship]}
        </span>
      </div>

      {(Object.keys(KIND_LABEL) as MedicalFactKind[]).map((kind) => {
        const rows = memberFacts.filter((f) => f.kind === kind);
        if (rows.length === 0) return null;
        return (
          <div key={kind} className="mt-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{KIND_LABEL[kind]}</p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {rows.map((fact) => (
                <FactRow key={fact.id} fact={fact} onChanged={onFactChanged} />
              ))}
            </div>
          </div>
        );
      })}

      {memberFacts.length === 0 && !addingFact && (
        <p className="mt-3 text-[12.5px] text-[var(--faint)]">Nothing recorded for {member.name} yet.</p>
      )}

      <div className="mt-3">
        {addingFact ? (
          <AddFactForm
            instanceId={instanceId}
            member={member}
            onAdded={(fact) => {
              onFactAdded(fact);
              setAddingFact(false);
            }}
            onCancel={() => setAddingFact(false)}
          />
        ) : (
          <Button size="sm" variant="ghost" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingFact(true)}>
            Add a fact
          </Button>
        )}
      </div>
    </section>
  );
}

export default function MembersModule() {
  const { status, errorMessage, instanceId, members, facts, addMember, addFact, replaceFact } = useFamilyHealthBinder();
  const [addingMember, setAddingMember] = useState(false);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Heart} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Heart} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Family</p>
          <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            Who&apos;s in this binder, and what to know about them.
          </h1>
        </div>
        {!addingMember && (
          <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingMember(true)}>
            Add person
          </Button>
        )}
      </header>

      {addingMember && (
        <AddMemberForm
          instanceId={instanceId}
          onAdded={(member) => {
            addMember(member);
            setAddingMember(false);
          }}
          onCancel={() => setAddingMember(false)}
        />
      )}

      {members.length === 0 && !addingMember ? (
        <EmptyState icon={User} title="Nobody added yet" description="Add the first person in your family to start keeping their facts on hand." />
      ) : (
        members.map((member) => (
          <MemberCard
            key={member.id}
            instanceId={instanceId}
            member={member}
            facts={facts}
            onFactAdded={addFact}
            onFactChanged={replaceFact}
          />
        ))
      )}
    </div>
  );
}
