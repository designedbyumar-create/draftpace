"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Plus, User } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveFamilyMember } from "../domain/familyMembers";
import { todayIso } from "../dates";
import CareCard from "./CareCard";
import CareTeamPanel from "./CareTeamPanel";
import { Heading, PersonPicker, RemoveControl, Segmented, TextAction } from "./Care";
import { gate } from "./Gate";
import HealthPanel from "./HealthPanel";
import { PersonForm } from "./MemberForms";
import ShotsPanel from "./ShotsPanel";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

type Tab = "health" | "shots" | "team";
const TABS: { id: Tab; label: string }[] = [
  { id: "health", label: "Health" },
  { id: "shots", label: "Vaccines" },
  { id: "team", label: "Care team" },
];

/**
 * Family: one card per person. Choose whose it is, see the card, then move
 * between their health, their vaccines and their care team. Adding someone
 * takes a name; everything else can wait.
 */
export default function MembersModule() {
  const data = useFamilyHealthBinder();
  const [personId, setPersonId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("health");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blocked = gate(data);
  if (blocked) return blocked;
  const { instanceId, members, facts, providers, immunizations, saveMember, saveFact, saveProvider, saveImmunization } = data;
  if (!instanceId) return null;

  const today = todayIso();
  const index = Math.max(0, members.findIndex((m) => m.id === personId));
  const member = members[index];

  async function removePerson() {
    if (!member) return;
    setRemoving(true);
    setError(null);
    const result = await archiveFamilyMember(member.id);
    setRemoving(false);
    if (!result.ok) return setError(describeResultError(result.error));
    saveMember(result.data);
    setPersonId(null);
  }

  const addButton = (
    <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAdding(true)}>
      Add person
    </Button>
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Heading kicker="Everyone in the binder" title="Family" action={members.length === 0 ? undefined : addButton} />

      {adding && (
        <PersonForm
          instanceId={instanceId}
          onSaved={(created) => {
            saveMember(created);
            setPersonId(created.id);
            setTab("health");
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {members.length === 0 && !adding ? (
        <EmptyState icon={User} title="Nobody added yet" description="Add the first person to start keeping their answers in one place." action={addButton} />
      ) : (
        member && (
          <>
            {members.length > 1 && <PersonPicker people={members} activeId={member.id} onPick={(id) => { setPersonId(id); setEditing(false); }} />}

            <CareCard member={member} index={index} facts={facts} today={today} />

            {editing ? (
              <PersonForm instanceId={instanceId} member={member} onSaved={(m) => { saveMember(m); setEditing(false); }} onCancel={() => setEditing(false)} />
            ) : (
              <div className="-mt-2 flex flex-wrap items-center gap-x-5 gap-y-1">
                <TextAction onClick={() => setEditing(true)}>Change name or birth date</TextAction>
                <RemoveControl what={member.name} pending={removing} onConfirm={removePerson} />
              </div>
            )}
            {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}

            <Segmented label={`${member.name}'s card`} options={TABS} value={tab} onChange={setTab} />

            {tab === "health" && <HealthPanel key={member.id} instanceId={instanceId} member={member} facts={facts} today={today} onFact={saveFact} onMember={saveMember} />}
            {tab === "shots" && <ShotsPanel key={member.id} instanceId={instanceId} member={member} immunizations={immunizations} onSaved={saveImmunization} />}
            {tab === "team" && <CareTeamPanel key={member.id} instanceId={instanceId} member={member} providers={providers} onProvider={saveProvider} onMember={saveMember} />}
          </>
        )
      )}
    </div>
  );
}
