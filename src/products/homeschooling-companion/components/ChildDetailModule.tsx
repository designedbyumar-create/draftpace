"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import EmptyState from "@/design-system/EmptyState";
import Toggle from "@/design-system/Toggle";
import { ShieldCheck, User } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeschoolInstanceId, HOMESCHOOLING_COMPANION_SLUG } from "../instanceData";
import {
  clearChildTopic,
  loadChildren,
  loadChildTopics,
  loadCurricula,
  loadPlan,
  loadPositions,
  setChildTopic,
  setChildVisibility,
  setSubjectActive,
  setSubjectFrequency,
  setSubjects,
  type ChildTopic,
} from "../domain/learningData";
import { describeTopics } from "../taxonomy";
import { SUGGESTED_SUBJECTS } from "../setup";
import Input from "@/design-system/Input";
import Button from "@/design-system/Button";
import TopicPicker from "./TopicPicker";
import {
  curriculaFor,
  describePosition,
  isReadyForToday,
  positionFor,
  SCHOOLING_LABEL,
  SOURCE_LABEL,
  type Child,
  type Curriculum,
  type PlanEntry,
  type Position,
  type Visibility,
} from "../learning";

type LoadStatus = "loading" | "ready" | "not-found" | "no-instance" | "error";

/**
 * One child.
 *
 * What they are learning, where they are in it, and what appears on
 * anything printed. Checking them will live here too, at the top and not
 * in a menu, because checking is a feature of the Companion reached
 * where the parent is already looking at that child.
 *
 * Every curriculum row states where it came from, every time. That is
 * the first of the product's trust rules and the cheapest to keep: a
 * parent must never have to wonder whether this invented something.
 */
export default function ChildDetailModule({ childId }: { childId: string }) {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [child, setChild] = useState<Child | null>(null);
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [plan, setPlan] = useState<PlanEntry[]>([]);
  const [topics, setTopics] = useState<ChildTopic[]>([]);
  const [openSubject, setOpenSubject] = useState<string | null>(null);
  const [addingSubject, setAddingSubject] = useState(false);
  const [newSubject, setNewSubject] = useState("");
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
    const [childrenResult, curriculaResult, positionsResult, planResult, topicsResult] = await Promise.all([
      loadChildren(found.id),
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
    const match = childrenResult.data.find((c) => c.id === childId) ?? null;
    if (!match) {
      setStatus("not-found");
      return;
    }
    setChild(match);
    setCurricula(curriculaResult.ok ? curriculaResult.data : []);
    setPositions(positionsResult.ok ? positionsResult.data : []);
    setPlan(planResult.ok ? planResult.data : []);
    setTopics(topicsResult.ok ? topicsResult.data.filter((t) => t.childId === childId) : []);
    setStatus("ready");
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeFrequency(planId: string, daysPerWeek: number) {
    setPending(true);
    setErrorMessage(null);
    const result = await setSubjectFrequency(planId, daysPerWeek);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    load();
  }

  async function changeActive(planId: string, active: boolean) {
    setPending(true);
    setErrorMessage(null);
    const result = await setSubjectActive(planId, active);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    load();
  }

  /**
   * Adding a subject after setup.
   *
   * Setup tells a parent "you can add or remove them whenever you like",
   * and until this existed only the removing half was true. Copy that
   * promises something the product cannot do is worse than copy that
   * promises nothing.
   */
  async function addSubject(subject: string) {
    if (!instanceId || !subject.trim()) return;
    setPending(true);
    setErrorMessage(null);
    const result = await setSubjects(instanceId, childId, [subject]);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setNewSubject("");
    setAddingSubject(false);
    load();
  }

  async function toggleTopic(subject: string, topicKey: string, on: boolean) {
    if (!instanceId) return;
    setPending(true);
    setErrorMessage(null);
    const result = on
      ? await setChildTopic(instanceId, { childId, subject, topicKey, state: "current" })
      : await clearChildTopic(childId, topicKey);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    load();
  }

  async function changeTopicState(subject: string, topicKey: string, state: "current" | "covered") {
    if (!instanceId) return;
    setPending(true);
    setErrorMessage(null);
    const result = await setChildTopic(instanceId, { childId, subject, topicKey, state });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    load();
  }

  async function changeVisibility(field: "name" | "age" | "notes", value: Visibility) {
    setPending(true);
    setErrorMessage(null);
    const result = await setChildVisibility(childId, field, value);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setChild(result.data);
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={User} title="Nothing here yet" description="This product has not been set up on your account." />;
  }
  if (status === "not-found") {
    return (
      <EmptyState
        icon={User}
        title="No such child"
        description="This may have been removed, or the link may be wrong."
      />
    );
  }
  if (status === "error" || !child) {
    return <EmptyState icon={User} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const following = curriculaFor(curricula, child.id);
  const subjects = plan.filter((entry) => entry.childId === child.id && entry.active);
  const ready = isReadyForToday({ child, curricula: following, positions, plan: subjects });
  const detail = [
    child.age !== null ? `Age ${child.age}` : null,
    child.schoolingType ? SCHOOLING_LABEL[child.schoolingType] : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-7">
      <div>
        <Link
          href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids`}
          className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
        >
          All children
        </Link>
        <h1
          className="mt-3 text-[28px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {child.name}
        </h1>
        {detail && <p className="mt-1 text-[13px] text-[var(--muted)]">{detail}</p>}
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      <section aria-label="What they are learning">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What they are learning</h2>
        {following.length === 0 && subjects.length === 0 ? (
          <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            Nothing recorded yet. You can add subjects or a curriculum whenever you like, and this product works
            without either: recording what you actually did is enough on its own.
          </p>
        ) : (
          <div className="mt-2 flex flex-col">
            {following.map((curriculum) => {
              const where = describePosition(positionFor(positions, child.id, curriculum.id));
              return (
                <div key={curriculum.id} className="border-b border-[var(--border)] py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">{curriculum.subject}</h3>
                    {/* Where it came from, every time it is shown. */}
                    <span className="text-[11px] font-semibold text-[var(--primary)]">
                      {SOURCE_LABEL[curriculum.source]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{curriculum.title}</p>
                  {where && <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">Currently at {where}</p>}
                </div>
              );
            })}
            {subjects
              .filter((entry) => !following.some((c) => c.subject === entry.subject))
              .map((entry) => (
                <div key={entry.id} className="border-b border-[var(--border)] py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="text-[14px] font-semibold text-[var(--text)]">{entry.subject}</h3>
                    <span className="text-[11px] font-semibold text-[var(--primary)]">{SOURCE_LABEL.parent}</span>
                  </div>
                </div>
              ))}
          </div>
        )}
        {subjects.length > 0 && (
          <div className="mt-5">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">How often</h3>
            <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">
              This is the only thing that decides what turns up on Today. Fewer days is not less ambitious, it is just
              what you actually do.
            </p>
            <div className="mt-2 flex flex-col">
              {subjects.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-[var(--border)] py-3"
                >
                  <span className="text-[14px] text-[var(--text)]">{entry.subject}</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <button
                        key={n}
                        type="button"
                        disabled={pending}
                        aria-label={`${entry.subject}, ${n} days a week`}
                        aria-pressed={entry.daysPerWeek === n}
                        onClick={() => changeFrequency(entry.id, n)}
                        className={`h-8 w-8 rounded-md border text-[12px] font-semibold transition-colors ${
                          entry.daysPerWeek === n
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => changeActive(entry.id, false)}
                      className="ml-1 text-[12px] text-[var(--faint)] underline underline-offset-2 hover:text-[var(--text)]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-[var(--faint)]">
              Zero days keeps a subject on record without putting it on Today.
            </p>
          </div>
        )}

        <div className="mt-4">
          {addingSubject ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SUBJECTS.filter((s) => !subjects.some((e) => e.subject === s)).map((suggested) => (
                  <Button
                    key={suggested}
                    size="sm"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => addSubject(suggested)}
                  >
                    {suggested}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={newSubject}
                  placeholder="Or type your own"
                  containerClassName="min-w-[12rem] flex-1"
                  onChange={(event) => setNewSubject(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter") return;
                    event.preventDefault();
                    addSubject(newSubject);
                  }}
                />
                <Button size="sm" disabled={pending || !newSubject.trim()} onClick={() => addSubject(newSubject)}>
                  Add
                </Button>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => setAddingSubject(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => setAddingSubject(true)}>
              Add a subject
            </Button>
          )}
        </div>

        {!ready && (
          <p className="mt-3 max-w-lg text-[12.5px] leading-relaxed text-[var(--faint)]">
            Today will stay quiet until there is something here to draw on.
          </p>
        )}
      </section>

      <section aria-label="What they are covering">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          What they are covering
        </h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Ticking what you are actually teaching is the only thing that lets this check whether it landed. Nothing is
          read from your curriculum and nothing is assumed: you say, and that is the whole of it.
        </p>
        {subjects.length === 0 ? (
          <p className="mt-2 text-[12.5px] text-[var(--muted)]">Add a subject first and this fills in.</p>
        ) : (
          <div className="mt-3 flex flex-col">
            {subjects.map((entry) => {
              const forSubject = topics.filter((t) => t.subject === entry.subject);
              const open = openSubject === entry.subject;
              return (
                <div key={entry.id} className="border-b border-[var(--border)] py-3">
                  <button
                    type="button"
                    onClick={() => setOpenSubject(open ? null : entry.subject)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-[var(--text)]">{entry.subject}</span>
                      <span className="block text-[12.5px] leading-relaxed text-[var(--muted)]">
                        {forSubject.length === 0
                          ? "Nothing ticked yet"
                          : describeTopics(forSubject.map((t) => t.topicKey))}
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold text-[var(--muted)]">
                      {open ? "Done" : "Choose"}
                    </span>
                  </button>
                  {open && (
                    <div className="mt-3">
                      <TopicPicker
                        subject={entry.subject}
                        ticked={forSubject}
                        pending={pending}
                        onToggle={(key, on) => toggleTopic(entry.subject, key, on)}
                        onState={(key, state) => changeTopicState(entry.subject, key, state)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section aria-label="What appears on anything you print">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          What appears on anything you print
        </h2>
        <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          Their name is included so a record says whose it is. Everything else starts out left off, and it is yours to
          change. Nothing here is ever public: this only decides what is on the page when you print.
        </p>
        <div className="mt-3 flex flex-col">
          {(
            [
              ["name", "Their name", child.nameVisibility],
              ["age", "Their age", child.ageVisibility],
              ["notes", "Your notes about them", child.notesVisibility],
            ] as const
          ).map(([field, label, value]) => (
            <div key={field} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3">
              <span className="text-[14px] text-[var(--text)]">{label}</span>
              <Toggle
                checked={value === "shareable"}
                disabled={pending}
                label={`Include ${label.toLowerCase()} when printing`}
                onChange={(next) => changeVisibility(field, next ? "shareable" : "private")}
              />
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Checking what they have understood">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
          Checking what they have understood
        </h2>
        <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            {/* Template literal, not adjacent JSX expressions: a line break
                between {child.name} and the next word is collapsed to
                nothing, which shipped once as "check Emmaon what they have". */}
            {`A short check on what ${child.name} has actually been working with. You provide the questions, from your own head, from your curriculum's own tests, or from the printed check sheets, and this keeps them for next time.`}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              href={`/app/products/${HOMESCHOOLING_COMPANION_SLUG}/kids/${child.id}/check`}
              iconLeft={<ShieldCheck size={14} aria-hidden />}
            >
              {`Check ${child.name}`}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
