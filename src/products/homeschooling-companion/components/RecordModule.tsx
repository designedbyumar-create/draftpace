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
  loadChildTopics,
  loadCurricula,
  loadObservations,
  loadPlan,
  loadPositions,
  loadTaskEvents,
  setObservationVisibility,
  type ChildTopic,
} from "../domain/learningData";
import { loadResultsForChild } from "../domain/checkData";
import { loadHousehold, householdRequirement } from "../domain/household";
import { buildBook, DEFAULT_BOOK_SECTIONS, type BookSections } from "../book";
import type { Curriculum, PlanEntry, Position } from "../learning";
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
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [childTopics, setChildTopics] = useState<ChildTopic[]>([]);
  const [sections, setSections] = useState<BookSections>(DEFAULT_BOOK_SECTIONS);
  const [size, setSize] = useState<"LETTER" | "A4">("LETTER");
  const [makingRecord, setMakingRecord] = useState(false);
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
    const [childrenResult, eventsResult, observationsResult, curriculaResult, positionsResult, planResult, topicsResult] =
      await Promise.all([
        loadChildren(found.id),
        loadTaskEvents(found.id),
        loadObservations(found.id),
        loadCurricula(found.id),
        loadPositions(found.id),
        loadPlan(found.id),
        loadChildTopics(found.id),
      ]);
    if (!childrenResult.ok) {
      setErrorMessage(describeResultError(childrenResult.error));
      setStatus("error");
      return;
    }
    setChildren(childrenResult.data);
    setEvents(eventsResult.ok ? eventsResult.data : []);
    setObservations(observationsResult.ok ? observationsResult.data : []);
    setCurricula(curriculaResult.ok ? curriculaResult.data : []);
    setPositions(positionsResult.ok ? positionsResult.data : []);
    setPlan(planResult.ok ? planResult.data : []);
    setChildTopics(topicsResult.ok ? topicsResult.data : []);
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

  /**
   * The record, made here and downloaded from here.
   *
   * A child must be chosen first, because a record is about one child.
   * Two children in one document would mean handing over one child's
   * information to account for the other.
   */
  async function makeRecord() {
    if (!instanceId) return;
    const target = childId ?? (children.length === 1 ? children[0].id : null);
    if (!target) {
      setErrorMessage("Choose which child the record is for first.");
      return;
    }
    const child = children.find((c) => c.id === target);
    if (!child) return;

    setMakingRecord(true);
    setErrorMessage(null);
    try {
      const [checks, household] = await Promise.all([
        loadResultsForChild(instanceId, target),
        loadHousehold(instanceId),
      ]);
      const book = buildBook({
        child,
        curricula: curricula.filter((c) => c.childId === target),
        positions: positions.filter((p) => p.childId === target),
        plan: plan.filter((p) => p.childId === target),
        events: events.filter((e) => e.childId === target),
        observations: observations.filter((o) => o.childId === target),
        checks: checks.ok ? checks.data : [],
        topicKeys: childTopics.filter((t) => t.childId === target).map((t) => t.topicKey),
        sections,
        generatedAt: new Date(),
        stateRequirement: household.ok ? householdRequirement(household.data) : null,
      });
      const { downloadHomeschoolRecord } = await import("../printables/download");
      await downloadHomeschoolRecord(book, size);
    } catch {
      // A failed generation must never look like a saved download.
      setErrorMessage("The record could not be made. Nothing was downloaded.");
    } finally {
      setMakingRecord(false);
    }
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

      {children.length > 0 && (
        <section aria-label="The printed record" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-[15px] font-semibold text-[var(--text)]">My Homeschool Record</h2>
          <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            One child, on paper, made on your own device so nothing about them is sent anywhere to produce it. It says
            what was done and makes no claim about how any of it went.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            {(
              [
                ["history", "What was done, day by day"],
                ["observations", "Notes you have marked for the record"],
                ["checks", "Results of checks you ran"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2.5 text-[13px] text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={sections[key]}
                  onChange={(event) => setSections((prev) => ({ ...prev, [key]: event.target.checked }))}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {label}
              </label>
            ))}
          </div>

          <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
            {/* The rule that must never bend, said where the choice is made. */}
            Notes you have kept private are never included, whatever is ticked here. Check results start out excluded
            because they are the most sensitive thing this product holds.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(["LETTER", "A4"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={size === option ? "primary" : "secondary"}
                onClick={() => setSize(option)}
              >
                {option === "LETTER" ? "US Letter" : "A4"}
              </Button>
            ))}
            <Button size="sm" disabled={makingRecord} onClick={makeRecord}>
              {makingRecord ? "Preparing..." : "Save as PDF"}
            </Button>
          </div>
          {children.length > 1 && childId === null && (
            <p className="mt-2 text-[12px] text-[var(--faint)]">Choose a child above first. A record is about one child.</p>
          )}
        </section>
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
