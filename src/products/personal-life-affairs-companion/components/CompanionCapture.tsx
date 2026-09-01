"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { ArrowRight, Check } from "@/design-system/Icon";
import { applicablePrompts, buildDraft, captureProgress, nextPrompt, UNSURE } from "../capture";
import type { AffairItemDraft, CaptureAnswers } from "../capture";
import type { CapturePrompt, CaptureSpec } from "../captures";
import type { AffairStep } from "../affairsKnowledge";
import type { AffairItem } from "../lifeAffairs";

/**
 * Companion Mode: the product asking one question, waiting, and asking
 * the next one it has decided is worth asking.
 *
 * NOT A CHATBOT, and the distinction is architectural rather than
 * stylistic. Every question here was written by a person and lives in
 * captures.ts. Nothing is generated, there is no model provider anywhere
 * in this repository, and the same eleven prompts appear in the same
 * order for everybody whose answers take the same branch. What makes it
 * feel like a conversation is that it asks once, listens, and decides
 * what to ask next, which is a sequencing property and not an
 * intelligence one.
 *
 * NOT A FORM either. The competitors open on a page headed "Primary
 * Contact" with eleven labelled boxes and people close them. Only one
 * question is ever on screen. What has already been answered stays
 * visible above it, because a person needs to see that their words were
 * taken down correctly, and because it is the only honest way to offer
 * a way back.
 */

export interface CompanionCaptureProps {
  step: AffairStep;
  spec: CaptureSpec;
  /** Set when revising something already recorded rather than establishing it. */
  editing?: AffairItem | null;
  pending: boolean;
  onSave: (draft: AffairItemDraft) => void;
  onCancel: () => void;
}

/** Rebuild the answers from a record, so revising starts from what is there. */
function answersFrom(item: AffairItem | null | undefined, spec: CaptureSpec): CaptureAnswers {
  if (!item) return {};
  const answers: CaptureAnswers = {};
  for (const prompt of spec.prompts) {
    const value =
      prompt.field === "label"
        ? item.label
        : prompt.field === "whereabouts"
          ? item.whereabouts
          : prompt.field === "personName"
            ? item.personName
            : prompt.field === "personContact"
              ? item.personContact
              : prompt.field === "notes"
                ? item.notes
                : item.fields[prompt.field];
    if (value) answers[prompt.field] = value;
  }
  return answers;
}

export default function CompanionCapture({ step, spec, editing, pending, onSave, onCancel }: CompanionCaptureProps) {
  const [answers, setAnswers] = useState<CaptureAnswers>(() => answersFrom(editing, spec));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [draftValue, setDraftValue] = useState("");
  const [revisiting, setRevisiting] = useState<string | null>(null);
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const prompt: CapturePrompt | null = useMemo(() => {
    if (revisiting) return spec.prompts.find((p) => p.field === revisiting) ?? null;
    return nextPrompt(spec, answers, skipped);
  }, [spec, answers, skipped, revisiting]);

  // The question that is on screen is the one thing the person is being
  // asked to do, so it takes focus. Without this, every answer costs a
  // click before it costs a keystroke.
  useEffect(() => {
    setDraftValue(revisiting ? answers[revisiting] ?? "" : "");
    fieldRef.current?.focus();
  }, [prompt?.field, revisiting, answers]);

  const answered = applicablePrompts(spec, answers).filter((p) => (answers[p.field] ?? "").trim().length > 0);
  const progress = captureProgress(spec, answers, skipped);

  function commit(value: string) {
    if (!prompt) return;
    const trimmed = value.trim();
    setAnswers((prev) => {
      const next = { ...prev };
      if (trimmed) next[prompt.field] = trimmed;
      else delete next[prompt.field];
      return next;
    });
    setSkipped((prev) => {
      const next = new Set(prev);
      next.delete(prompt.field);
      return next;
    });
    setRevisiting(null);
    setDraftValue("");
  }

  function skip() {
    if (!prompt) return;
    setSkipped((prev) => new Set(prev).add(prompt.field));
    setRevisiting(null);
    setDraftValue("");
  }

  function save() {
    onSave(buildDraft(spec, step.key, step.area, answers, skipped));
  }

  return (
    <section aria-label={step.instruction} className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
          {editing ? "Bringing this up to date" : step.instruction.replace(/\.$/, "")}
        </p>
        {progress.total > 1 && (
          <p className="mt-1.5 text-[12px] text-[var(--faint)]">
            {/* Deliberately scoped to this one capture. A count across the
                whole product would be the completion score this product
                does not have. */}
            Question {Math.min(progress.asked + 1, progress.total)} of {progress.total} for this one thing.
          </p>
        )}
      </div>

      {answered.length > 0 && (
        <ul aria-label="What you have said so far" className="flex flex-col gap-1.5">
          {answered.map((p) => (
            <li key={p.field} className="flex items-start gap-2.5 text-[13px] leading-relaxed">
              <Check size={15} aria-hidden className="mt-[3px] shrink-0 text-[var(--primary)]" />
              <span className="min-w-0 flex-1 text-[var(--muted)]">{answers[p.field]}</span>
              <button
                type="button"
                onClick={() => setRevisiting(p.field)}
                className="shrink-0 text-[12px] text-[var(--faint)] underline underline-offset-2 hover:text-[var(--text)]"
              >
                Change
              </button>
            </li>
          ))}
        </ul>
      )}

      {prompt ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (prompt.choices) return;
            if (!draftValue.trim() && !prompt.optional) return;
            commit(draftValue);
          }}
          className="flex flex-col gap-3"
        >
          <div>
            <h2
              className="text-[22px] leading-snug text-[var(--text)]"
              style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
            >
              {prompt.prompt}
            </h2>
            {prompt.hint && (
              <p className="mt-1.5 max-w-lg text-[12.5px] leading-relaxed text-[var(--muted)]">{prompt.hint}</p>
            )}
          </div>

          {prompt.choices ? (
            <div className="flex flex-wrap gap-2">
              {prompt.choices.map((choice) => (
                <Button
                  key={choice}
                  size="sm"
                  variant={choice === UNSURE ? "secondary" : "primary"}
                  disabled={pending}
                  onClick={() => commit(choice)}
                >
                  {choice}
                </Button>
              ))}
            </div>
          ) : prompt.multiline ? (
            <textarea
              ref={(el) => {
                fieldRef.current = el;
              }}
              rows={4}
              value={draftValue}
              placeholder={prompt.placeholder}
              onChange={(event) => setDraftValue(event.target.value)}
              className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3 text-[14px] leading-relaxed text-[var(--text)] placeholder-[var(--faint)] transition-colors focus:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
            />
          ) : (
            <Input
              ref={(el) => {
                fieldRef.current = el;
              }}
              value={draftValue}
              placeholder={prompt.placeholder}
              onChange={(event) => setDraftValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                if (!draftValue.trim() && !prompt.optional) return;
                commit(draftValue);
              }}
            />
          )}

          {!prompt.choices && (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" type="submit" disabled={pending || !draftValue.trim()} iconRight={<ArrowRight size={15} aria-hidden />}>
                Continue
              </Button>
              {prompt.optional && (
                <Button size="sm" variant="ghost" disabled={pending} onClick={skip}>
                  Skip this
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={pending} onClick={onCancel}>
                Come back to this later
              </Button>
            </div>
          )}
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <h2
            className="text-[20px] leading-snug text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            That is everything worth asking about this one.
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={save}>
              {pending ? "Saving..." : editing ? "Save the change" : "Record this"}
            </Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
