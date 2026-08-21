"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { CheckCircle2, ListChecks } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findInOrderInstanceId } from "../instanceData";
import { loadProfile, loadSteps, recordStep, saveProfileAnswer } from "../domain/affairsData";
import { deriveAffairsState, type AffairProfile, type StepRecord } from "../sequencer";
import { INTAKE_QUESTIONS, nextUnansweredIntake } from "../intake";
import { deriveReadiness } from "../completion";
import HandoverPanel from "./HandoverPanel";
import type { AffairGate } from "../affairsKnowledge";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const SNOOZE_DAYS = 30;

function inDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * The whole product, on one surface.
 *
 * Two modes share this screen, which is the central design idea. During
 * intake it asks about the person's life; afterwards it shows the single
 * next step. Neither is a separate destination, because "one step on
 * screen" is this product's first design law and a wizard would be a
 * second place to be.
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
  const [pending, setPending] = useState(false);

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
    const [profileResult, stepsResult] = await Promise.all([loadProfile(found.id), loadSteps(found.id)]);
    if (!stepsResult.ok) {
      setErrorMessage(describeResultError(stepsResult.error));
      setStatus("error");
      return;
    }
    setProfile(profileResult.ok ? profileResult.data : {});
    setRecords(stepsResult.data);
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

  /**
   * Dynamic import on purpose: @react-pdf is large and must never reach
   * the main bundle. Same pattern Monthly Money Reset uses.
   */
  async function print() {
    setPending(true);
    setErrorMessage(null);
    try {
      const [{ downloadInOrderCopy }, { describeReadiness }] = await Promise.all([
        import("../printables/download"),
        import("../completion"),
      ]);
      await downloadInOrderCopy({
        size: "LETTER",
        preparedBy: "",
        readiness,
        summary: describeReadiness(readiness),
      });
    } catch {
      // A failed generation must never look like a saved download.
      setErrorMessage("The copy could not be generated. Nothing was downloaded.");
    } finally {
      setPending(false);
    }
  }

  async function act(stepKey: string, state: "confirmed" | "notRelevant" | "open", snooze = false) {
    if (!instanceId) return;
    setPending(true);
    const result = await recordStep(instanceId, stepKey, state, {
      snoozedUntil: snooze ? inDays(SNOOZE_DAYS) : null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    setRecords(result.data);
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
  const state = deriveAffairsState({ profile, records }, now);
  const readiness = deriveReadiness({ profile, records }, now);

  /**
   * The handover appears once there is genuinely something to hand over,
   * and never during intake. It is not gated on completeness: a person
   * who has settled two things may print, and the copy will say so.
   */
  const showHandover = !intake && readiness.confirmed > 0;

  return (
    <div className="flex flex-col gap-5">
      {errorMessage && (
        <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">
          {errorMessage}
        </p>
      )}

      {intake ? (
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
      ) : state.next ? (
        <section aria-label="Your next step">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
            {state.next.reason === "needsRecheck" ? "Worth checking again" : "Your next step"}
          </p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {state.next.step.instruction}
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">{state.next.step.why}</p>

          {state.next.step.referOut && (
            <p className="mt-3 max-w-lg rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-[12.5px] leading-relaxed text-[var(--muted)]">
              {state.next.step.referOut}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-[12px] text-[var(--faint)]">
            <span>About {state.next.step.minutes} minutes</span>
            {state.confirmedCount > 0 && <span>{state.confirmedCount} confirmed so far</span>}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button size="sm" disabled={pending} onClick={() => act(state.next!.step.key, "confirmed")}>
              {state.next.reason === "needsRecheck" ? "Still true" : "Done this"}
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(state.next!.step.key, "notRelevant")}>
              Not relevant to me
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(state.next!.step.key, "open", true)}>
              Later
            </Button>
          </div>
        </section>
      ) : (
        <section aria-label="Everything is in order">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Your affairs</p>
          <h1
            className="mt-2 text-[26px] leading-tight text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            Everything you have told us about is in order.
          </h1>
          <p className="mt-2 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">
            {state.confirmedCount} confirmed. We will not ask again until something is worth checking, or you tell us
            your situation has changed.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[13px] text-[var(--primary)]">
            <CheckCircle2 size={17} aria-hidden />
            <span>Nothing needs you right now.</span>
          </div>
        </section>
      )}

      {showHandover && (
        <HandoverPanel
          readiness={readiness}
          pending={pending}
          onPrint={print}
        />
      )}
    </div>
  );
}
