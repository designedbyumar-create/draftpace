"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { BookOpen, Check, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId } from "../instanceData";
import {
  createObservation,
  loadChildren,
  loadObservations,
  loadTaskEvents,
  setObservationVisibility,
} from "../domain/learningData";
import {
  deriveRecord,
  describeHowItWent,
  describeRecord,
  describeWork,
  type Observation,
  type WorkEntry,
} from "../record";
import { dateKey } from "../today";
import type { Child } from "../learning";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * What has happened.
 *
 * The reason a parent who never opens Today still has something worth
 * paying for: three years from now, "what did we actually do" has an
 * answer, in their own words, with dates.
 *
 * Says what happened and never how it is going. There is no summary of
 * a child anywhere on this page, because a record that grades is not a
 * record.
 */
function formatDay(date: string): string {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function RecordModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [events, setEvents] = useState<WorkEntry[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [childId, setChildId] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    const found = await findHomeschoolInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const [childrenResult, eventsResult, observationsResult] = await Promise.all([
      loadChildren(found.id),
      loadTaskEvents(found.id),
      loadObservations(found.id),
    ]);
    if (!childrenResult.ok) {
      setErrorMessage(describeResultError(childrenResult.error));
      setStatus("error");
      return;
    }
    setChildren(childrenResult.data);
    setEvents(eventsResult.ok ? eventsResult.data : []);
    setObservations(observationsResult.ok ? observationsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveNote() {
    if (!instanceId || !noteText.trim()) return;
    // An observation belongs to a child, so writing one needs a child
    // chosen. With one child that choice is already made for them.
    const target = childId ?? (children.length === 1 ? children[0].id : null);
    if (!target) {
      setErrorMessage("Choose which child this is about first.");
      return;
    }
    setPending(true);
    setErrorMessage(null);
    const result = await createObservation(instanceId, {
      childId: target,
      onDate: dateKey(new Date()),
      note: noteText,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setNoteText("");
    setWriting(false);
    load();
  }

  async function toggleShare(observation: Observation) {
    setPending(true);
    setErrorMessage(null);
    const result = await setObservationVisibility(
      observation.id,
      observation.visibility === "shareable" ? "private" : "shareable"
    );
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    load();
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={BookOpen} title="Nothing recorded yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={BookOpen} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const view = deriveRecord({ children, events, observations, childId });
  const nameOf = (id: string) => children.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Record</p>
        <h1
          className="mt-2 text-[26px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          What has happened.
        </h1>
        <p className="mt-2 text-[13.5px] text-[var(--muted)]">{describeRecord(view)}</p>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      {children.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={childId === null ? "primary" : "secondary"} onClick={() => setChildId(null)}>
            Everyone
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              size="sm"
              variant={childId === child.id ? "primary" : "secondary"}
              onClick={() => setChildId(child.id)}
            >
              {child.name}
            </Button>
          ))}
        </div>
      )}

      {writing ? (
        <section aria-label="Writing an observation" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">
            {childId ? `Something you noticed about ${nameOf(childId)}` : "Something you noticed"}
          </h2>
          <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">
            Anything worth remembering. It stays private unless you decide otherwise, one note at a time.
          </p>
          <textarea
            autoFocus
            rows={4}
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="She finally got equivalent fractions today, after weeks of it not landing."
            className="mt-3 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[14px] leading-relaxed text-[var(--text)] placeholder-[var(--faint)] focus:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
          />
          {children.length > 1 && !childId && (
            <p className="mt-2 text-[12px] text-[var(--faint)]">Choose a child above first.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" disabled={pending || !noteText.trim()} onClick={saveNote}>
              {pending ? "Saving..." : "Save it"}
            </Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={() => setWriting(false)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : (
        children.length > 0 && (
          <div>
            <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setWriting(true)}>
              Note something
            </Button>
          </div>
        )
      )}

      {view.days.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nothing recorded yet"
          description="What you do each day is kept here, along with anything you notice. It fills in as you go."
        />
      ) : (
        view.days.map((day) => (
          <section key={day.date} aria-label={formatDay(day.date)}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
              {formatDay(day.date)}
            </h2>
            <div className="mt-2 flex flex-col">
              {day.entries.map((entry) =>
                entry.kind === "work" ? (
                  <div key={`w-${entry.childId}-${entry.work.subject}`} className="border-b border-[var(--border)] py-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h3 className="text-[14px] font-semibold text-[var(--text)]">{describeWork(entry.work)}</h3>
                      {childId === null && children.length > 1 && (
                        <span className="text-[11.5px] text-[var(--muted)]">{nameOf(entry.childId)}</span>
                      )}
                    </div>
                    {describeHowItWent(entry.work) && (
                      <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{describeHowItWent(entry.work)}</p>
                    )}
                  </div>
                ) : (
                  <div key={`o-${entry.observation.id}`} className="border-b border-[var(--border)] py-3">
                    <p className="text-[13.5px] leading-relaxed text-[var(--text)]">{entry.observation.note}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      {childId === null && children.length > 1 && (
                        <span className="text-[11.5px] text-[var(--muted)]">{nameOf(entry.childId)}</span>
                      )}
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleShare(entry.observation)}
                        className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                      >
                        {entry.observation.visibility === "shareable" ? (
                          <>
                            <Check size={13} aria-hidden className="text-[var(--primary)]" />
                            In the printed record
                          </>
                        ) : (
                          "Kept private"
                        )}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
