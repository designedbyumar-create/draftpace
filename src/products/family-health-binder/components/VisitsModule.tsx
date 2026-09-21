"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { CalendarCheck, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveVisit, createVisit, updateVisit } from "../domain/visits";
import { todayIso, usDate } from "../dates";
import { PROVIDER_LABEL, careTeam } from "../providers";
import { describeVisit, describeVisitTiming, parseQuestions, splitVisits } from "../visits";
import { FAMILY_HEALTH_BINDER_SLUG } from "../instanceData";
import type { FamilyMember, Provider, Visit } from "../state";
import { CARD, FormPanel, Heading, PersonPicker, PrivateField, RecordRow, RemoveControl, Section, TextAction, TextAreaField } from "./Care";
import { gate } from "./Gate";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";

function VisitForm({
  instanceId,
  member,
  providers,
  visit,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  providers: Provider[];
  visit?: Visit;
  onSaved: (visit: Visit) => void;
  onCancel: () => void;
}) {
  const [visitOn, setVisitOn] = useState(visit?.visitOn ?? todayIso());
  const [withWhom, setWithWhom] = useState(visit?.withWhom ?? "");
  const [reason, setReason] = useState(visit?.reason ?? "");
  const [questions, setQuestions] = useState(visit?.questions ?? "");
  const [notes, setNotes] = useState(visit?.notes ?? "");
  const [priv, setPriv] = useState(visit?.visibility === "private");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const team = careTeam(providers, member.id).filter((p) => p.kind !== "pharmacy");

  async function save() {
    setPending(true);
    setError(null);
    const patch = {
      familyMemberId: member.id,
      visitOn,
      withWhom: withWhom.trim() || null,
      reason: reason.trim(),
      questions: questions.trim() || null,
      notes: notes.trim() || null,
      visibility: priv ? "private" : "summary",
    };
    const result = visit ? await updateVisit(visit.id, patch) : await createVisit(instanceId, patch);
    setPending(false);
    if (!result.ok) return setError(describeResultError(result.error));
    onSaved(result.data);
  }

  return (
    <FormPanel>
      <Input label="What is it for?" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Yearly checkup" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Day" value={visitOn} onChange={(e) => setVisitOn(e.target.value)} containerClassName="min-w-[160px] flex-1" />
        <div className="min-w-[180px] flex-1">
          <Input label="With (optional)" list="fhb-visit-with" value={withWhom} onChange={(e) => setWithWhom(e.target.value)} placeholder="Dr. Patel" />
          <datalist id="fhb-visit-with">
            {team.map((p) => (
              <option key={p.id} value={p.name}>
                {PROVIDER_LABEL[p.kind]}
              </option>
            ))}
          </datalist>
        </div>
      </div>
      <TextAreaField label="Questions to ask" value={questions} onChange={setQuestions} placeholder={"Is the cough something to worry about?\nCan she swim this week?"} hint="One per line. They print on the visit page." rows={4} />
      <TextAreaField label="What was said or decided (add after)" value={notes} onChange={setNotes} rows={3} />
      <PrivateField checked={priv} onChange={setPriv} leaves="the visit page" />
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || reason.trim().length === 0 || visitOn === ""}>
          {pending ? "Saving..." : visit ? "Save" : "Save the visit"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </FormPanel>
  );
}

function questionList(visit: Visit) {
  const questions = parseQuestions(visit.questions);
  if (questions.length === 0) return null;
  return (
    <ul className="mt-1 list-disc pl-5 text-[14px] leading-relaxed text-[var(--text)]">
      {questions.map((q, i) => (
        <li key={i}>{q}</li>
      ))}
    </ul>
  );
}

/**
 * Visits: the questions to ask before an appointment, and what was said or
 * decided after it, so neither has to be held in memory in a waiting room.
 * A record only: it does not remind, schedule or book anything.
 */
export default function VisitsModule() {
  const data = useFamilyHealthBinder();
  const [personId, setPersonId] = useState<string | null>(null);
  const [editing, setEditing] = useState<"new" | string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocked = gate(data);
  if (blocked) return blocked;
  const { instanceId, members, providers, visits, saveVisit } = data;
  if (!instanceId) return null;
  if (members.length === 0) {
    return <EmptyState icon={CalendarCheck} title="Nobody added yet" description="Add a person in Family before planning a visit." />;
  }

  const today = todayIso();
  const member = members.find((m) => m.id === personId) ?? members[0];
  const { upcoming, past } = splitVisits(visits, member.id, today);

  async function remove(visit: Visit) {
    setBusyId(visit.id);
    setError(null);
    const result = await archiveVisit(visit.id);
    setBusyId(null);
    if (!result.ok) return setError(describeResultError(result.error));
    saveVisit(result.data);
  }

  const saved = (visit: Visit) => {
    saveVisit(visit);
    setEditing(null);
  };

  const row = (visit: Visit, isPast: boolean) =>
    editing === visit.id ? (
      <div key={visit.id} className="py-4">
        <VisitForm instanceId={instanceId} member={member} providers={providers} visit={visit} onSaved={saved} onCancel={() => setEditing(null)} />
      </div>
    ) : (
      <RecordRow
        key={visit.id}
        title={describeVisit(visit)}
        meta={[usDate(visit.visitOn), describeVisitTiming(visit, today), visit.visibility === "private" ? "Private" : null].filter(Boolean).join(" · ")}
        note={
          <>
            {questionList(visit)}
            {visit.notes && <span className="mt-2 block whitespace-pre-line text-[14px] leading-relaxed text-[var(--text)]">{visit.notes}</span>}
          </>
        }
        actions={
          <>
            <TextAction onClick={() => setEditing(visit.id)}>{isPast && !visit.notes ? "Add what was said" : "Change"}</TextAction>
            <RemoveControl what="this visit" pending={busyId === visit.id} onConfirm={() => remove(visit)} />
          </>
        }
      />
    );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Heading
        kicker="Before and after the appointment"
        title="Visits"
        action={
          editing !== "new" && (
            <Button size="sm" variant="action" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setEditing("new")}>
              Plan a visit
            </Button>
          )
        }
      />
      {members.length > 1 && <PersonPicker people={members} activeId={member.id} onPick={(id) => { setPersonId(id); setEditing(null); }} />}
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{error}</p>}
      {editing === "new" && <VisitForm instanceId={instanceId} member={member} providers={providers} onSaved={saved} onCancel={() => setEditing(null)} />}

      <div className={`${CARD} flex flex-col gap-6 p-5`}>
        <Section title="Coming up" count={upcoming.length}>
          {upcoming.length === 0 ? <p className="text-[14px] text-[var(--muted)]">No visit planned for {member.name}.</p> : upcoming.map((v) => row(v, false))}
          {upcoming.length > 0 && (
            <p className="mt-3 text-[14px] text-[var(--muted)]">
              The next one prints on the visit page.{" "}
              <Link href={`/app/products/${FAMILY_HEALTH_BINDER_SLUG}/printables`} className="font-semibold text-[var(--primary)] hover:underline">
                Go to Print
              </Link>
            </p>
          )}
        </Section>
        {past.length > 0 && (
          <Section title="Earlier" count={past.length}>
            {past.map((v) => row(v, true))}
          </Section>
        )}
      </div>
    </div>
  );
}
