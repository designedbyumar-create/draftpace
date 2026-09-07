"use client";

import SharedCompanionRun from "@/components/product-shell/companion/CompanionRun";
import type { LifeItem } from "../life";
import { resumeContext, todayAt } from "../life";
import type { OutcomeKind, Playbook } from "../playbook";
import { finishRun, leaveRun, saveAnswer, updateItem, type FinishResult, type RunRecord } from "../domain/alongsideData";

const NOT_NOW_PREFIX = "not-now:";

/**
 * Alongside's own binding of the shared Companion runtime. See
 * src/components/product-shell/companion/CompanionRun.tsx for the
 * actual step rendering, resume banner and outcome handling; this file
 * only supplies Alongside's own persistence and its own idea of "what
 * is this run about", so item.title / directTitle become one
 * contextLabel and resumeContext(item) becomes one resumeNote, in the
 * shapes the shared runtime expects.
 *
 * The one exception is the ready step's "not now" answer: the shared
 * engine knows only that a string was saved against a step key, and has
 * no concept of Life or an item. This file recognises that one answer
 * shape and turns it into exactly the write an item's own date field
 * already supports (nextAt plus userChosenDate), the same write
 * AddItemForm makes when a person picks a date themselves. Nothing new
 * is added to what an item can hold or what attention can say; a time
 * named here surfaces later the same way any other self-chosen date
 * does, as "You said you would come back to this".
 */
export default function CompanionRun({
  instanceId,
  playbook,
  item,
  run,
  directTitle = null,
  onFinished,
  onLeft,
  onItemUpdated,
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
  /** Called when the ready step names a time and that time is written straight to the item, outside the usual finished-run path. */
  onItemUpdated?: (item: LifeItem) => void;
}) {
  const resume = item ? resumeContext(item, new Date()) : null;

  return (
    <SharedCompanionRun<FinishResult>
      playbook={playbook}
      run={run}
      contextLabel={item?.title ?? directTitle}
      resumeNote={resume?.leftOff ? { leftOff: resume.leftOff, nextStep: resume.nextStep } : null}
      onSaveAnswer={async (stepKey, value, skipped) => {
        if (item && stepKey === "ready" && value?.startsWith(NOT_NOW_PREFIX)) {
          const at = todayAt(value.slice(NOT_NOW_PREFIX.length), new Date());
          if (at) {
            const patched = await updateItem(item.id, { nextAt: at, userChosenDate: true });
            if (patched.ok) onItemUpdated?.(patched.data);
          }
        }
        return saveAnswer(instanceId, run.id, stepKey, value, skipped);
      }}
      onComplete={(outcome, detail) =>
        finishRun(instanceId, run, item, outcome, detail, item?.title ?? directTitle ?? playbook.title)
      }
      onLeave={() => leaveRun(run.id)}
      onFinished={onFinished}
      onLeft={onLeft}
    />
  );
}
