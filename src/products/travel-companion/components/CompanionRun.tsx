"use client";

import SharedCompanionRun from "@/components/product-shell/companion/CompanionRun";
import type { OutcomeKind, Playbook } from "@/components/product-shell/companion/steps";
import { finishRun, leaveRun, saveAnswer, type FinishResult, type RunRecord } from "../domain/travelData";
import type { Booking } from "../trip";

/**
 * Travel Companion's own binding of the shared Companion runtime. See
 * src/components/product-shell/companion/CompanionRun.tsx for the
 * actual step rendering, resume banner and outcome handling; this file
 * only supplies this product's own persistence and its own idea of
 * "what is this run about" (the booking's own title).
 */
export default function CompanionRun({
  instanceId,
  playbook,
  booking,
  run,
  onFinished,
  onLeft,
}: {
  instanceId: string;
  playbook: Playbook;
  booking: Booking | null;
  run: RunRecord;
  onFinished: (result: FinishResult, outcome: OutcomeKind) => void;
  onLeft: () => void;
}) {
  return (
    <SharedCompanionRun<FinishResult>
      playbook={playbook}
      run={run}
      contextLabel={booking?.title ?? null}
      onSaveAnswer={(stepKey, value, skipped) => saveAnswer(instanceId, run.id, stepKey, value, skipped)}
      onComplete={(outcome, detail) => finishRun(instanceId, run, booking, outcome, detail)}
      onLeave={() => leaveRun(run.id)}
      onFinished={onFinished}
      onLeft={onLeft}
    />
  );
}
