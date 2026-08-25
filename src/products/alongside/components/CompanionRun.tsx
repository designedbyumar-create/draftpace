"use client";

import SharedCompanionRun from "@/components/product-shell/companion/CompanionRun";
import type { LifeItem } from "../life";
import { resumeContext } from "../life";
import type { OutcomeKind, Playbook } from "../playbook";
import { finishRun, leaveRun, saveAnswer, type FinishResult, type RunRecord } from "../domain/alongsideData";

/**
 * Alongside's own binding of the shared Companion runtime. See
 * src/components/product-shell/companion/CompanionRun.tsx for the
 * actual step rendering, resume banner and outcome handling; this file
 * only supplies Alongside's own persistence and its own idea of "what
 * is this run about", so item.title / directTitle become one
 * contextLabel and resumeContext(item) becomes one resumeNote, in the
 * shapes the shared runtime expects.
 */
export default function CompanionRun({
  instanceId,
  playbook,
  item,
  run,
  directTitle = null,
  onFinished,
  onLeft,
}: {
  instanceId: string;
  playbook: Playbook;
  item: LifeItem | null;
  run: RunRecord;
  /**
   * What to call this when there is no item behind it, in the person's
   * own words if they typed one. Used as the header line and as what
   * gets offered to Life at the end, instead of the playbook's own
   * title, which is Draftpace's name for the situation rather than
   * theirs.
   */
  directTitle?: string | null;
  onFinished: (result: FinishResult, outcome: OutcomeKind) => void;
  onLeft: () => void;
}) {
  const resume = item ? resumeContext(item, new Date()) : null;

  return (
    <SharedCompanionRun<FinishResult>
      playbook={playbook}
      run={run}
      contextLabel={item?.title ?? directTitle}
      resumeNote={resume?.leftOff ? { leftOff: resume.leftOff, nextStep: resume.nextStep } : null}
      onSaveAnswer={(stepKey, value, skipped) => saveAnswer(instanceId, run.id, stepKey, value, skipped)}
      onComplete={(outcome, detail) =>
        finishRun(instanceId, run, item, outcome, detail, item?.title ?? directTitle ?? playbook.title)
      }
      onLeave={() => leaveRun(run.id)}
      onFinished={onFinished}
      onLeft={onLeft}
    />
  );
}
