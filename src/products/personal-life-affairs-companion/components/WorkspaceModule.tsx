"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { CheckCircle2, ListChecks, Plus } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { entranceVariant } from "@/design-system/motion";
import { findInOrderInstanceId } from "../instanceData";
import {
  confirmItem,
  establishItem,
  loadItems,
  loadProfile,
  loadSteps,
  recordStep,
  saveProfileAnswer,
  updateItem,
} from "../domain/affairsData";
import { deriveAffairsState, type AffairProfile, type StepRecord } from "../sequencer";
import { INTAKE_QUESTIONS, nextUnansweredIntake } from "../intake";
import { deriveReadiness } from "../completion";
import { acknowledge, captureFor, type AffairItemDraft } from "../capture";
import { describeItem, type AffairItem } from "../lifeAffairs";
import CompanionCapture from "./CompanionCapture";
import type { AffairGate } from "../affairsKnowledge";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const SNOOZE_DAYS = 30;
/** Long enough that an offer to fill in old detail is not a nag, short enough to still be an offer. */
const LEAVE_IT_DAYS = 180;

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * The whole product, on one surface.
 *
 * Three modes share this screen. During intake it asks about the
 * person's life. Afterwards it shows the single next step, and when that
 * step is one that creates knowledge it hands over to Companion Mode,
 * which asks one question at a time until the record exists. None of the
 * three is a separate destination, because "one thing on screen" is this
 * product's first design law and a wizard would be a second place to be.
 *
 * Deliberately absent: a progress bar, a percentage, a denominator, and
 * any list of what remains. Counting up is the rule. A person with no
 * business and no children has a genuinely short list, and finishing it
 * is a complete success rather than a fraction of somebody else's.
 */
export default function WorkspaceModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AffairProfile>({});
  const [records, setRecords] = useState<StepRecord[]>([]);
  const [items, setItems] = useState<AffairItem[]>([]);
  const [pending, setPending] = useState(false);

  /** Set while Companion Mode has the screen. Null means the step card is showing. */
  const [capturing, setCapturing] = useState<{ stepKey: string; editing: AffairItem | null } | null>(null);
  /** The line the companion says once something has been saved. Cleared on the next action. */
  const [acknowledgement, setAcknowledgement] = useState<{ text: string; stepKey: string } | null>(null);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findInOrderInstanceId();
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
    const [profileResult, stepsResult, itemsResult] = await Promise.all([
      loadProfile(found.id),
      loadSteps(found.id),
      loadItems(found.id),
    ]);
    if (!stepsResult.ok) {
      setErrorMessage(describeResultError(stepsResult.error));
      setStatus("error");
      return;
    }
    setProfile(profileResult.ok ? profileResult.data : {});
    setRecords(stepsResult.data);
    setItems(itemsResult.ok ? itemsResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function answerIntake(gate: AffairGate, value: boolean) {
    if (!instanceId) return;
    setPending(true);
    const result = await saveProfileAnswer(instanceId, gate, value);
    setPending(false);
    // A failed write must never look like a saved one.
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setProfile(result.data);
  }

  async function act(stepKey: string, state: "confirmed" | "notRelevant" | "open" | "unsure", snoozeDays?: number) {
    if (!instanceId) return;
    setPending(true);
    setAcknowledgement(null);
    const result = await recordStep(instanceId, stepKey, state, {
      snoozedUntil: snoozeDays ? inDays(snoozeDays) : null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setRecords(result.data);
  }

  /** The moment a piece of knowledge enters the map. */
  async function saveCapture(draft: AffairItemDraft) {
    if (!instanceId || !capturing) return;
    const step = state.relevant.find((s) => s.key === capturing.stepKey);
    const spec = captureFor(capturing.stepKey);
    if (!step || !spec) return;

    setPending(true);
    setErrorMessage(null);
    const result = capturing.editing
      ? await updateItem(instanceId, capturing.editing, draft)
      : await establishItem(instanceId, draft, step.confirmEveryMonths ?? null);
    setPending(false);

    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItems(result.data);
    setCapturing(null);
    setAcknowledgement({ text: acknowledge(spec, draft.label), stepKey: capturing.stepKey });
  }

  /** "Still true." The record does not change; the date it was last vouched for does. */
  async function confirmStanding(item: AffairItem) {
    if (!instanceId) return;
    setPending(true);
    const result = await confirmItem(instanceId, item);
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setItems(result.data);
  }

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={ListChecks}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={ListChecks} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }

  const intake = nextUnansweredIntake(profile);
  const now = new Date();
  const state = deriveAffairsState({ profile, records, items }, now);
  const readiness = deriveReadiness({ profile, records, items }, now);

  const errorBanner = errorMessage && (
    <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
      {errorMessage}
    </p>
  );

  // ------------------------------------------------------------- intake
  if (intake) {
    return (
      <div className="flex flex-col gap-5">
        {errorBanner}
        <section aria-label="About you">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">A few questions first</p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {intake.question}
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">{intake.why}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => answerIntake(intake.gate, true)}>
              Yes
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => answerIntake(intake.gate, false)}>
              No
            </Button>
          </div>
          <p className="mt-4 text-[12px] text-[var(--faint)]">
            {INTAKE_QUESTIONS.length} short questions. They decide what this product will and will not ask you about.
          </p>
        </section>
      </div>
    );
  }

  // ---------------------------------------------------- companion mode
  if (capturing) {
    const step = state.relevant.find((s) => s.key === capturing.stepKey);
    const spec = captureFor(capturing.stepKey);
    if (step && spec) {
      return (
        <div className="flex flex-col gap-5">
          {errorBanner}
          <CompanionCapture
            step={step}
            spec={spec}
            editing={capturing.editing}
            pending={pending}
            onSave={saveCapture}
            onCancel={() => setCapturing(null)}
          />
        </div>
      );
    }
  }

  const next = state.next;
  const spec = next ? captureFor(next.step.key) : null;

  return (
    <div className="flex flex-col gap-5">
      {errorBanner}

      {acknowledgement && (
        <AcknowledgementBanner
          text={acknowledgement.text}
          establishedCount={state.establishedCount}
          addAnother={
            // Offered only where a person genuinely may have several:
            // banks, pensions, pets, professionals. Never on a step that
            // can only ever have one answer.
            captureFor(acknowledgement.stepKey)?.multiple
              ? {
                  label: captureFor(acknowledgement.stepKey)!.addAnotherLabel ?? "Add another",
                  onClick: () => {
                    setCapturing({ stepKey: acknowledgement.stepKey, editing: null });
                    setAcknowledgement(null);
                  },
                }
              : null
          }
          onDismiss={() => setAcknowledgement(null)}
        />
      )}

      {next ? (
        <motion.section
          key={next.step.key}
          aria-label="Your next step"
          initial="hidden"
          animate="visible"
          variants={entranceVariant(Boolean(reduceMotion))}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Next</p>
          <p className="mt-1.5 text-[13px] text-[var(--muted)]">
            {next.reason === "needsRecheck"
              ? "Worth checking again."
              : next.reason === "needsDetail"
                ? "Worth filling in."
                : next.reason === "wasUnsure"
                  ? "You were not sure about this last time."
                  : state.establishedCount === 0
                    ? "Let us start with one thing."
                    : "One thing worth taking care of."}
          </p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {next.step.instruction}
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            {next.reason === "needsDetail"
              ? "You dealt with this before this product started keeping the details. Adding them now is what puts the answer into the copy you would hand somebody."
              : next.reason === "wasUnsure"
                ? "You said you were not sure last time. Now is as good a moment as any, and it is still fine not to know."
                : next.step.why}
          </p>

          {next.step.referOut && (
            <p className="mt-3 max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
              {next.step.referOut}
            </p>
          )}

          {/* What is already recorded, shown before asking anything about
              it. Somebody rechecking needs to see the answer they are
              being asked to vouch for. */}
          {next.existing.length > 0 && (
            <ul aria-label="What is recorded now" className="mt-4 flex flex-col gap-2">
              {next.existing.map((existing) => (
                <li
                  key={existing.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3"
                >
                  <p className="text-[14px] font-semibold text-[var(--text)]">{existing.label}</p>
                  {describeItem(existing) !== existing.label && (
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">{describeItem(existing)}</p>
                  )}
                  {existing.notes && (
                    <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">{existing.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-[12px] text-[var(--faint)]">About {next.step.minutes} minutes</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {next.reason === "needsRecheck" && next.existing.length > 0 ? (
              <>
                <Button size="sm" disabled={pending} onClick={() => confirmStanding(next.existing[0])}>
                  Still true
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setCapturing({ stepKey: next.step.key, editing: next.existing[0] })}
                >
                  Update it
                </Button>
              </>
            ) : next.step.kind === "establish" && spec ? (
              <Button
                size="sm"
                disabled={pending}
                onClick={() => {
                  setAcknowledgement(null);
                  setCapturing({ stepKey: next.step.key, editing: null });
                }}
              >
                {next.reason === "needsDetail" ? "Add the details" : "Start"}
              </Button>
            ) : (
              <Button size="sm" disabled={pending} onClick={() => act(next.step.key, "confirmed")}>
                Done this
              </Button>
            )}

            <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(next.step.key, "notRelevant")}>
              Not relevant to me
            </Button>
            {next.step.kind === "action" && next.reason !== "needsRecheck" && (
              <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(next.step.key, "unsure")}>
                {"I'm not sure"}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => act(next.step.key, "open", next.reason === "needsDetail" ? LEAVE_IT_DAYS : SNOOZE_DAYS)}
            >
              Later
            </Button>
          </div>
        </motion.section>
      ) : (
        <section aria-label="Nothing needs your attention">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Next</p>
          <h1
            className="mt-3 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            Nothing needs your attention right now.
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            Everything you have told us about is currently in good shape. We will let you know when something is worth
            checking again.
          </p>
          {/*
            No invented work here. A product that manufactures a task to
            keep somebody busy has stopped being useful to them and
            started being useful to itself.
          */}
          <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--primary)]">
            <CheckCircle2 size={17} aria-hidden />
            <span>
              {readiness.itemCount === 1 ? "One thing in order." : `${readiness.itemCount} things in order.`}
            </span>
          </div>
        </section>
      )}

    </div>
  );
}

/**
 * What the companion says once something is saved.
 *
 * It exists because the alternative is a screen that silently swaps one
 * question for another, which reads as though nothing happened. The
 * count is here rather than on the step card so that it appears at the
 * moment it means something, and it only ever counts up.
 */
function AcknowledgementBanner({
  text,
  establishedCount,
  addAnother,
  onDismiss,
}: {
  text: string;
  establishedCount: number;
  addAnother: { label: string; onClick: () => void } | null;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
      style={{ borderLeftWidth: 3, borderLeftColor: "var(--primary)" }}
    >
      <p className="text-[14px] leading-relaxed text-[var(--text)]">{text}</p>
      <p className="mt-1 text-[12px] text-[var(--faint)]">
        {establishedCount === 1 ? "One thing in order." : `${establishedCount} things in order.`}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {addAnother && (
          <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={addAnother.onClick}>
            {addAnother.label}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Next thing
        </Button>
      </div>
    </div>
  );
}
