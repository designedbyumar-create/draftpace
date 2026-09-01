"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { ArrowRight, Check } from "@/design-system/Icon";
import {
  CURRICULUM_STANCE_LABEL,
  CURRICULUM_STANCE_NOTE,
  EMPTY_CHILD_DRAFT,
  nextSetupStep,
  setupLength,
  SUGGESTED_SUBJECTS,
  type ChildDraft,
  type CurriculumStance,
  type SetupStepId,
} from "../setup";
import { SCHOOLING_LABEL, type SchoolingType } from "../learning";
import {
  buildStartingOutline,
  describeSubjectShape,
  minutesPerWeek,
  OUTLINE_DISCLAIMER,
} from "../startingOutline";

/**
 * Setting a child up, one question at a time.
 *
 * The same interaction model as Personal Life Affairs Companion's
 * Companion Mode, for the same reason: the competitors in this category
 * open with a form headed "Student Profile" and eleven labelled boxes,
 * and parents close them. Only one question is ever live, what has been
 * answered stands above it with a way back, and every question says why
 * it is being asked before it asks.
 *
 * The branching lives in setup.ts and is tested there. This file renders
 * whatever that decides, so the flow cannot drift by somebody reordering
 * JSX.
 */
export default function AddChildFlow({
  pending,
  onDone,
  onCancel,
}: {
  pending: boolean;
  onDone: (draft: ChildDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ChildDraft>(EMPTY_CHILD_DRAFT);
  const [skipped, setSkipped] = useState<Set<SetupStepId>>(new Set());
  const [value, setValue] = useState("");
  const fieldRef = useRef<HTMLInputElement | null>(null);

  const step = nextSetupStep(draft, skipped);
  const total = setupLength(draft);
  // Extracted so the dependency is statically checkable: the effect
  // should run when the question changes, not on every render.
  const stepId = step === "done" ? "done" : step.id;

  useEffect(() => {
    setValue("");
    fieldRef.current?.focus();
  }, [stepId]);

  const answered: { id: SetupStepId; text: string }[] = [];
  if (draft.name) answered.push({ id: "name", text: draft.name });
  if (draft.age) answered.push({ id: "age", text: `${draft.age} years old` });
  if (draft.schoolingType) answered.push({ id: "schooling", text: SCHOOLING_LABEL[draft.schoolingType] });
  if (draft.stance) answered.push({ id: "stance", text: CURRICULUM_STANCE_LABEL[draft.stance] });
  if (draft.curriculumTitle) answered.push({ id: "curriculum-title", text: draft.curriculumTitle });
  if (draft.subjects.length > 0) answered.push({ id: "subjects", text: draft.subjects.join(", ") });
  if (draft.position) answered.push({ id: "position", text: draft.position });

  function commitText(field: "name" | "age" | "curriculumTitle" | "position", text: string) {
    setDraft((prev) => ({ ...prev, [field]: text.trim() }));
  }

  function skip(id: SetupStepId) {
    setSkipped((prev) => new Set(prev).add(id));
  }

  function toggleSubject(subject: string) {
    setDraft((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  }

  return (
    <section aria-label="Adding a child" className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Adding a child</p>
        {step !== "done" && (
          <p className="mt-1.5 text-[12px] text-[var(--faint)]">
            {/* Scoped to this one child. A count across the product would
                be the progress bar this does not have. */}
            Question {Math.min(answered.length + 1, total)} of about {total}.
          </p>
        )}
      </div>

      {answered.length > 0 && (
        <ul aria-label="What you have said so far" className="flex flex-col gap-1.5">
          {answered.map((entry) => (
            <li key={entry.id} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
              <Check size={15} aria-hidden className="mt-[3px] shrink-0 text-[var(--primary)]" />
              <span className="min-w-0 flex-1 text-[var(--muted)]">{entry.text}</span>
            </li>
          ))}
        </ul>
      )}

      {step === "done" && draft.stance === "not-sure" ? (
        <StartingOutlinePreview draft={draft} pending={pending} onDone={onDone} onCancel={onCancel} />
      ) : step === "done" ? (
        <div className="flex flex-col gap-3">
          <h2
            className="text-[20px] leading-snug text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            That is everything worth asking for now.
          </h2>
          <p className="max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
            You can change any of it later, and add more whenever there is a reason to.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => onDone(draft)}>
              {pending ? "Saving..." : `Add ${draft.name}`}
            </Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div>
            <h2
              className="text-[22px] leading-snug text-[var(--text)]"
              style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
            >
              {step.question}
            </h2>
            <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">{step.why}</p>
          </div>

          {step.id === "schooling" ? (
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SCHOOLING_LABEL) as SchoolingType[]).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="secondary"
                  onClick={() => setDraft((prev) => ({ ...prev, schoolingType: type }))}
                >
                  {SCHOOLING_LABEL[type]}
                </Button>
              ))}
            </div>
          ) : step.id === "stance" ? (
            <div className="flex flex-col gap-2">
              {(Object.keys(CURRICULUM_STANCE_LABEL) as CurriculumStance[]).map((stance) => (
                <button
                  key={stance}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, stance }))}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3 text-left transition-colors hover:border-[var(--primary)]"
                >
                  <span className="block text-[14px] font-semibold text-[var(--text)]">
                    {CURRICULUM_STANCE_LABEL[stance]}
                  </span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[var(--muted)]">
                    {CURRICULUM_STANCE_NOTE[stance]}
                  </span>
                </button>
              ))}
            </div>
          ) : step.id === "days-available" ? (
            <div className="flex flex-wrap gap-2">
              {[2, 3, 4, 5, 6, 7].map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant="secondary"
                  onClick={() => setDraft((prev) => ({ ...prev, daysAvailable: n }))}
                >
                  {n} days
                </Button>
              ))}
            </div>
          ) : step.id === "subjects" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SUBJECTS.map((subject) => (
                  <Button
                    key={subject}
                    size="sm"
                    variant={draft.subjects.includes(subject) ? "primary" : "secondary"}
                    onClick={() => toggleSubject(subject)}
                  >
                    {subject}
                  </Button>
                ))}
              </div>
              <p className="text-[12px] text-[var(--faint)]">Tap the ones you teach. Anything missing can be added later.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  iconRight={<ArrowRight size={15} aria-hidden />}
                  onClick={() => setDraft((prev) => ({ ...prev, subjectsConfirmed: true }))}
                >
                  {draft.subjects.length > 0 ? "Continue" : "Skip for now"}
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!value.trim() && !step.optional) return;
                commitText(
                  step.id === "curriculum-title" ? "curriculumTitle" : (step.id as "name" | "age" | "position"),
                  value
                );
              }}
              className="flex flex-col gap-3"
            >
              <Input
                ref={fieldRef}
                value={value}
                inputMode={step.id === "age" ? "numeric" : undefined}
                placeholder={step.placeholder}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  if (!value.trim() && !step.optional) return;
                  commitText(
                    step.id === "curriculum-title" ? "curriculumTitle" : (step.id as "name" | "age" | "position"),
                    value
                  );
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" type="submit" disabled={!value.trim()} iconRight={<ArrowRight size={15} aria-hidden />}>
                  Continue
                </Button>
                {step.optional && (
                  <Button size="sm" variant="ghost" onClick={() => skip(step.id)}>
                    Skip this
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

        </div>
      )}
    </section>
  );
}

/**
 * The starting outline, shown before anything is saved.
 *
 * A parent who does not know where to begin gets a weekly shape and a
 * few topics to start from, built only from what they already told us:
 * their child's age and the subjects they picked. Nothing is inferred
 * about the child and no profile is built.
 *
 * Shown, not applied. They see the whole of it, with the disclaimer, and
 * decide. Everything in it is editable afterwards on the child's own
 * page, which is where the controls already live.
 */
function StartingOutlinePreview({
  draft,
  pending,
  onDone,
  onCancel,
}: {
  draft: ChildDraft;
  pending: boolean;
  onDone: (draft: ChildDraft) => void;
  onCancel: () => void;
}) {
  const parsedAge = Number.parseInt(draft.age, 10);
  const outline = buildStartingOutline({
    age: Number.isFinite(parsedAge) ? parsedAge : null,
    subjects: draft.subjects,
    daysAvailable: draft.daysAvailable ?? 5,
  });
  const weekly = minutesPerWeek(outline);
  const hours = Math.round((weekly / 60) * 10) / 10;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2
          className="text-[20px] leading-snug text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          A place to begin with {draft.name}.
        </h2>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          {OUTLINE_DISCLAIMER}
        </p>
      </div>

      {outline.subjects.length === 0 ? (
        <p className="text-[13px] text-[var(--muted)]">
          No subjects were picked, so there is nothing to outline. You can add some any time, and recording what you
          actually do works without a plan at all.
        </p>
      ) : (
        <div className="flex flex-col">
          {outline.subjects.map((subject) => (
            <div key={subject.subject} className="border-b border-[var(--border)] py-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-[15px] font-semibold text-[var(--text)]">{subject.subject}</h3>
                <span className="text-[12px] text-[var(--muted)]">{describeSubjectShape(subject)}</span>
              </div>
              {subject.focus.length > 0 ? (
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Suggested focus: {subject.focus.map((t) => t.label).join(", ")}
                </p>
              ) : (
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--faint)]">
                  We have no topics for this one, so it is just time in the week. What you do with it is yours.
                </p>
              )}
              <p className="mt-1 text-[12px] text-[var(--faint)]">
                Ideas: {subject.activities.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}

      {weekly > 0 && (
        <p className="text-[12.5px] text-[var(--muted)]">
          {/* So a parent can judge whether it is realistic before agreeing
              to it, rather than discovering it in week three. */}
          That comes to roughly {hours} hours a week across everything.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={pending} onClick={() => onDone(draft)}>
          {pending ? "Saving..." : `Start here with ${draft.name}`}
        </Button>
        <Button size="sm" variant="ghost" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <p className="max-w-lg text-[12px] leading-relaxed text-[var(--faint)]">
        Everything here can be changed on {draft.name}&rsquo;s page afterwards: the days, the subjects, and which
        topics you are covering.
      </p>
    </div>
  );
}
