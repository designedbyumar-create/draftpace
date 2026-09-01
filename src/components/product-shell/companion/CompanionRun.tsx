"use client";

import { useMemo, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { ArrowLeft, Check } from "@/design-system/Icon";
import { describeResultError, type Result } from "@/product-framework/result";
import {
  nextStep,
  OUTCOME_OPTIONS,
  runProgress,
  visibleItems,
  visibleWording,
  type Answers,
  type OutcomeKind,
  type Playbook,
  type PlaybookStep,
} from "./steps";

/** The minimum a product's own run record must have for this runtime to step through it. */
export interface CompanionRunState {
  id: string;
  answers: Answers;
  skipped: string[];
}

export interface CompanionResumeNote {
  leftOff: string;
  nextStep: string | null;
}

/**
 * The Companion, on screen. The shared runtime every product's
 * Companion Mode is built on, proven first by Alongside and extracted
 * once a second real consumer needed the identical shape.
 *
 * One question at a time, full width, nothing else visible. That is the
 * whole design: a person who opened this because they could not start
 * the thing does not need a sidebar, a progress ring, a related items
 * panel or a tip. They need the next question and a way out.
 *
 * WHAT THIS COMPONENT DOES NOT KNOW
 *
 * Nothing about any product's domain. It has no concept of a life item,
 * a booking, a child. Persistence is entirely the caller's: onSaveAnswer,
 * onComplete and onLeave are passed in already bound to a specific
 * product's database calls, and this component only ever calls them and
 * reacts to the Result they return.
 *
 * WHY THE RUN ARRIVES AS A REQUIRED PROP, NOT SOMETHING THIS COMPONENT
 * CREATES
 *
 * Starting a run as a side effect of mounting is fragile in a way that
 * matters here specifically: React can and does invoke a mount effect
 * more than once (Strict Mode does this on every dev render, on
 * purpose, to surface exactly this class of bug), and an insert fired
 * from inside that effect happens whether or not the resulting state
 * update is kept. That produced a real orphaned run during this
 * engine's first product's own testing. Requiring the run up front
 * removes the effect entirely rather than guarding it more carefully,
 * which is why nothing in this file creates a run inside a mount
 * effect at all.
 *
 * WHAT IS DELIBERATELY MISSING
 *
 * No timer, no countdown, no "you have been on this step for a while".
 * No streak. No encouragement that congratulates somebody for answering
 * a text box. Leaving halfway through is a button, not an abandonment.
 */
export default function CompanionRun<TFinishResult>({
  playbook,
  run,
  contextLabel = null,
  resumeNote = null,
  onSaveAnswer,
  onComplete,
  onLeave,
  onFinished,
  onLeft,
}: {
  playbook: Playbook;
  /** Already created, whether fresh or resumed, by whoever decided to open the Companion. */
  run: CompanionRunState;
  /** What this run is about, shown under the playbook's own title. Null for a run started with nothing behind it. */
  contextLabel?: string | null;
  /** The externalised state of a resumed thread, shown once at the top. Null when there is nothing to show. */
  resumeNote?: CompanionResumeNote | null;
  onSaveAnswer: (stepKey: string, value: string | null, skipped: boolean) => Promise<Result<unknown>>;
  onComplete: (outcome: OutcomeKind, detail: string | null) => Promise<Result<TFinishResult>>;
  onLeave: () => Promise<unknown>;
  onFinished: (result: TFinishResult, outcome: OutcomeKind) => void;
  onLeft: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>(run.answers);
  const [skipped, setSkipped] = useState<Set<string>>(new Set(run.skipped));
  const [draft, setDraft] = useState("");
  const [outcome, setOutcome] = useState<OutcomeKind | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const step = useMemo(() => nextStep(playbook, answers, skipped), [playbook, answers, skipped]);
  const progress = runProgress(playbook, answers, skipped);

  async function record(stepKey: string, value: string | null, wasSkipped = false) {
    setPending(true);
    setErrorMessage(null);
    const saved = await onSaveAnswer(stepKey, value, wasSkipped);
    setPending(false);
    if (!saved.ok) {
      setErrorMessage(describeResultError(saved.error));
      return;
    }
    if (wasSkipped) setSkipped((current) => new Set(current).add(stepKey));
    else setAnswers((current) => ({ ...current, [stepKey]: value ?? "" }));
    setDraft("");
  }

  async function complete(chosen: OutcomeKind, detail: string | null) {
    setPending(true);
    setErrorMessage(null);
    const finished = await onComplete(chosen, detail);
    setPending(false);
    if (!finished.ok) {
      setErrorMessage(describeResultError(finished.error));
      return;
    }
    onFinished(finished.data, chosen);
  }

  async function leave() {
    await onLeave();
    onLeft();
  }

  if (!step) {
    // Reachable only if a playbook's own steps are misconfigured (no
    // outcome step at the end); each product's own integrity tests
    // guard against that, so this is a floor, not an expected state.
    return <p className="text-[13px] text-[var(--faint)]">Opening...</p>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{playbook.title}</p>
          {contextLabel && <p className="mt-1 truncate text-[13px] text-[var(--muted)]">{contextLabel}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={leave} iconLeft={<ArrowLeft size={14} aria-hidden />}>
          Leave this
        </Button>
      </header>

      {/* Progress inside this run only. It counts what this conversation
          has left, never anything about the person. */}
      <div className="flex items-center gap-2" aria-hidden>
        {Array.from({ length: progress.total }).map((_, index) => (
          <span
            key={index}
            className={`h-1 flex-1 rounded-full ${index < progress.asked ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`}
          />
        ))}
      </div>

      {/* The externalised state, shown once, at the top, where somebody
          coming back after three weeks will look for it. */}
      {resumeNote?.leftOff && step.kind !== "outcome" && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Where you left off</p>
          <p className="mt-1.5 text-[14px] leading-6 text-[var(--text)]">{resumeNote.leftOff}</p>
          {resumeNote.nextStep && (
            <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">Next: {resumeNote.nextStep}</p>
          )}
        </div>
      )}

      <StepCard
        step={step}
        answers={answers}
        draft={draft}
        pending={pending}
        outcome={outcome}
        onDraft={setDraft}
        onAnswer={(value) => record(step.key, value)}
        onSkip={() => record(step.key, null, true)}
        onOutcome={setOutcome}
        onComplete={complete}
      />

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}

function StepCard({
  step,
  answers,
  draft,
  pending,
  outcome,
  onDraft,
  onAnswer,
  onSkip,
  onOutcome,
  onComplete,
}: {
  step: PlaybookStep;
  answers: Answers;
  draft: string;
  pending: boolean;
  outcome: OutcomeKind | null;
  onDraft: (value: string) => void;
  onAnswer: (value: string) => void;
  onSkip: () => void;
  onOutcome: (value: OutcomeKind | null) => void;
  onComplete: (outcome: OutcomeKind, detail: string | null) => void;
}) {
  const heading = (
    <div>
      <h1
        className="text-[24px] leading-tight text-[var(--text)]"
        style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
      >
        {step.prompt}
      </h1>
      {step.why && <p className="mt-2 text-[13px] leading-5 text-[var(--muted)]">{step.why}</p>}
    </div>
  );

  if (step.kind === "choose") {
    return (
      <section className="flex flex-col gap-5">
        {heading}
        <ul className="flex flex-col gap-2">
          {(step.choices ?? []).map((choice) => (
            <li key={choice.value}>
              <button
                type="button"
                disabled={pending}
                onClick={() => onAnswer(choice.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-[15px] text-[var(--text)] transition-colors hover:border-[var(--primary)] disabled:opacity-60"
              >
                {choice.label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (step.kind === "write") {
    return (
      <section className="flex flex-col gap-5">
        {heading}
        <Input
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          placeholder={step.placeholder}
          hint={step.hint}
          aria-label={step.prompt}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => onAnswer(draft.trim())} disabled={pending || draft.trim().length === 0}>
            Next
          </Button>
          {step.optional && (
            <Button variant="ghost" onClick={onSkip} disabled={pending}>
              Nothing to add
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (step.kind === "prepare" || step.kind === "during") {
    const lines = visibleItems(step, answers);
    return (
      <section className="flex flex-col gap-5">
        {heading}
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li
              key={line}
              className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[15px] leading-6 text-[var(--text)]"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <Button onClick={() => onAnswer("seen")} disabled={pending}>
          {step.kind === "prepare" ? "I have these" : "Ready"}
        </Button>
      </section>
    );
  }

  if (step.kind === "wording") {
    const suggestions = visibleWording(step, answers);
    return (
      <section className="flex flex-col gap-5">
        {heading}
        {/* Suggested wording stays in the browser. It is never saved and
            never sent anywhere: a record of which opening line somebody
            needed is not something this product should hold. */}
        {suggestions.map((suggestion) => (
          <blockquote
            key={suggestion}
            className="rounded-xl border-l-2 border-[var(--primary)] bg-[var(--surface-muted)] px-4 py-3.5 text-[15px] leading-6 text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {suggestion}
          </blockquote>
        ))}
        <Input
          value={draft}
          onChange={(event) => onDraft(event.target.value)}
          placeholder="Or write your own"
          aria-label="Your own wording"
        />
        <Button onClick={() => onAnswer(draft.trim() || "used-suggested")} disabled={pending}>
          Next
        </Button>
      </section>
    );
  }

  // ------------------------------------------------------------- outcome
  const chosen = outcome ? OUTCOME_OPTIONS.find((option) => option.value === outcome) : null;

  if (chosen?.asks) {
    const label =
      chosen.asks === "waiting-on"
        ? "Who are you waiting on?"
        : chosen.asks === "next-step"
          ? "What is the next thing?"
          : "Anything worth remembering?";
    return (
      <section className="flex flex-col gap-5">
        <h1
          className="text-[24px] leading-tight text-[var(--text)]"
          style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
        >
          {label}
        </h1>
        <Input value={draft} onChange={(event) => onDraft(event.target.value)} aria-label={label} hint="This is what you will see when you come back to it." />
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => onComplete(chosen.value, draft.trim() || null)} disabled={pending}>
            Done
          </Button>
          <Button variant="ghost" onClick={() => onOutcome(null)} disabled={pending}>
            Back
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      {heading}
      <ul className="flex flex-col gap-2">
        {OUTCOME_OPTIONS.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              disabled={pending}
              onClick={() => (option.asks ? onOutcome(option.value) : onComplete(option.value, null))}
              className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-left text-[15px] text-[var(--text)] transition-colors hover:border-[var(--primary)] disabled:opacity-60"
            >
              {option.value === "resolved" && <Check size={16} aria-hidden />}
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
