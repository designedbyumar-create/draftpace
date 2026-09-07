"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { Clock, Plus } from "@/design-system/Icon";
import { staggerContainer, staggerItem } from "@/design-system/motion";
import { createSymptomEvent, updateSymptomEvent } from "../domain/symptomEvents";
import { useFamilyHealthBinder } from "./useFamilyHealthBinder";
import type { DurationUnit, FamilyMember, Severity, SymptomEvent } from "../state";

const SEVERITY_LABEL: Record<Severity, string> = { mild: "Mild", moderate: "Moderate", severe: "Severe" };
const DURATION_UNITS: DurationUnit[] = ["hours", "days", "weeks"];

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Recording one symptom event: onset, duration and severity as real
 * fields, never a single free-text box, the one structural decision
 * this product's whole design is built around. What helped stays free
 * text: it varies too much to enumerate honestly.
 */
function AddEventForm({
  instanceId,
  member,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  member: FamilyMember;
  onAdded: (event: SymptomEvent) => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState("");
  const [onsetAt, setOnsetAt] = useState(dateKey(new Date()));
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState<DurationUnit>("days");
  const [severity, setSeverity] = useState<Severity>("mild");
  const [whatHelped, setWhatHelped] = useState("");
  const [visibility, setVisibility] = useState<"summary" | "private">("summary");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createSymptomEvent(instanceId, {
      familyMemberId: member.id,
      description,
      onsetAt,
      durationValue: durationValue ? Number(durationValue) : null,
      durationUnit: durationValue ? durationUnit : null,
      severity,
      whatHelped: whatHelped || null,
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
      <Input label="Symptom" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Fever" autoFocus />

      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Onset" value={onsetAt} onChange={(e) => setOnsetAt(e.target.value)} containerClassName="flex-1" />
        <Input
          label="Duration (optional)"
          value={durationValue}
          onChange={(e) => setDurationValue(e.target.value)}
          placeholder="3"
          containerClassName="w-24"
        />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-[var(--text)]">Unit</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {DURATION_UNITS.map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => setDurationUnit(unit)}
                className="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
                style={durationUnit === unit ? { borderColor: "var(--primary)", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--muted)" }}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-[12px] font-semibold text-[var(--text)]">Severity</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {(Object.keys(SEVERITY_LABEL) as Severity[]).map((option) => (
            <Button key={option} size="sm" variant={severity === option ? "primary" : "secondary"} onClick={() => setSeverity(option)}>
              {SEVERITY_LABEL[option]}
            </Button>
          ))}
        </div>
      </div>

      <Input label="What helped (optional)" value={whatHelped} onChange={(e) => setWhatHelped(e.target.value)} placeholder="Rest and fluids" />

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
        <Button variant="commit" size="sm" onClick={save} disabled={pending || description.trim().length === 0}>
          Record it
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function EventRow({ event, onChanged }: { event: SymptomEvent; onChanged: (event: SymptomEvent) => void }) {
  const reduceMotion = useReducedMotion();
  const [pending, setPending] = useState(false);

  async function togglePrivacy() {
    setPending(true);
    const result = await updateSymptomEvent(event.id, { visibility: event.visibility === "private" ? "summary" : "private" });
    setPending(false);
    if (result.ok) onChanged(result.data);
  }

  const durationLabel = event.durationValue !== null && event.durationUnit ? `${event.durationValue} ${event.durationUnit}` : null;

  return (
    <motion.li variants={staggerItem(Boolean(reduceMotion))} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{event.description}</h4>
        <span className="text-[12px] text-[var(--faint)]">{event.onsetAt}</span>
      </div>
      <p className="mt-0.5 text-[12px] text-[var(--muted)]">
        {SEVERITY_LABEL[event.severity]}
        {durationLabel ? `, ${durationLabel}` : ""}
        {event.whatHelped ? ` · helped by ${event.whatHelped}` : ""}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={togglePrivacy}
        className="mt-1.5 text-[11.5px] font-semibold text-[var(--faint)] hover:text-[var(--text)]"
      >
        {event.visibility === "private" ? "Private" : "On summary"}
      </button>
    </motion.li>
  );
}

export default function TimelineModule() {
  const { status, errorMessage, instanceId, members, events, addEvent, replaceEvent } = useFamilyHealthBinder();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [addingEvent, setAddingEvent] = useState(false);
  const reduceMotion = useReducedMotion();

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Clock} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (members.length === 0) {
    return <EmptyState icon={Clock} title="Nobody added yet" description="Add a family member in Family before recording a symptom." />;
  }
  if (!instanceId) return null;

  const member = members.find((m) => m.id === memberId) ?? members[0];
  const memberEvents = events.filter((e) => e.familyMemberId === member.id && e.status === "active");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Symptoms</p>
        <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          A real record, not a memory to reconstruct later.
        </h1>
      </header>

      {members.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <Button key={m.id} size="sm" variant={m.id === member.id ? "primary" : "secondary"} onClick={() => setMemberId(m.id)}>
              {m.name}
            </Button>
          ))}
        </div>
      )}

      {addingEvent ? (
        <AddEventForm
          instanceId={instanceId}
          member={member}
          onAdded={(event) => {
            addEvent(event);
            setAddingEvent(false);
          }}
          onCancel={() => setAddingEvent(false)}
        />
      ) : (
        <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingEvent(true)}>
          Record a symptom for {member.name}
        </Button>
      )}

      {memberEvents.length === 0 ? (
        <p className="text-[12.5px] text-[var(--faint)]">Nothing recorded for {member.name} yet.</p>
      ) : (
        <motion.ul initial="hidden" animate="visible" variants={staggerContainer(Boolean(reduceMotion))} className="flex flex-col gap-2">
          {memberEvents.map((event) => (
            <EventRow key={event.id} event={event} onChanged={replaceEvent} />
          ))}
        </motion.ul>
      )}
    </div>
  );
}
