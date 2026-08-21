import { AFFAIR_STEPS, type AffairGate, type AffairStep } from "./affairsKnowledge";

/**
 * The engine. Given what somebody has told us about their life and what
 * they have already confirmed, decide the single next thing to show.
 *
 * This is the product. Every competitor shows a dashboard of sections
 * and every review of those competitors complains about not knowing what
 * to do next, so the restraint here is the feature. The hard rule: this
 * module returns ONE step, never a list.
 *
 * Deliberately pure. No database, no dates from the environment, no
 * React. `now` is always passed in, so every behaviour below is testable
 * without mocking a clock.
 */

export type StepState = "pending" | "confirmed" | "notRelevant" | "open";

/** What the database knows about one step for one person. */
export interface StepRecord {
  stepKey: string;
  state: StepState;
  /** When a human last asserted this is still true. */
  confirmedAt: string | null;
  snoozedUntil: string | null;
}

/** The intake answers. Undefined means not asked yet, which is not the same as false. */
export type AffairProfile = Partial<Record<AffairGate, boolean>>;

export interface SequencerInputs {
  profile: AffairProfile;
  records: StepRecord[];
}

/** Why a step is being shown now, so the UI never has to guess. */
export type NextStepReason = "firstTime" | "unblocked" | "needsRecheck";

export interface NextStep {
  step: AffairStep;
  reason: NextStepReason;
  /** Steps confirmed so far. Counts up, never a denominator. */
  confirmedCount: number;
}

export interface AffairsState {
  /** The one thing to show, or null when there is genuinely nothing. */
  next: NextStep | null;
  confirmedCount: number;
  /** True once nothing is pending and nothing needs rechecking. */
  allCaughtUp: boolean;
  /** Steps that apply to this person at all, after gating. */
  relevant: AffairStep[];
}

function daysBetween(iso: string, now: Date): number {
  const then = new Date(iso).getTime();
  return Math.floor((now.getTime() - then) / 86_400_000);
}

/**
 * A step exists for this person only if every gate it declares is
 * answered true. An unanswered gate hides the step rather than showing
 * it, because asking about a business to somebody who has not said they
 * have one is exactly the irrelevance this product exists to avoid.
 */
export function isRelevant(step: AffairStep, profile: AffairProfile): boolean {
  return (step.needs ?? []).every((gate) => profile[gate] === true);
}

export function relevantSteps(profile: AffairProfile): AffairStep[] {
  return AFFAIR_STEPS.filter((step) => isRelevant(step, profile));
}

/**
 * Confirmations go stale. A step with confirmEveryMonths that was
 * confirmed longer ago than that needs asking again, which is the
 * entire caretaker mode and the thing a paper binder cannot do.
 */
export function needsRecheck(step: AffairStep, record: StepRecord | undefined, now: Date): boolean {
  if (!record || record.state !== "confirmed" || !record.confirmedAt) return false;
  if (!step.confirmEveryMonths) return false;
  return daysBetween(record.confirmedAt, now) >= step.confirmEveryMonths * 30;
}

function isSnoozed(record: StepRecord | undefined, now: Date): boolean {
  if (!record?.snoozedUntil) return false;
  return new Date(record.snoozedUntil).getTime() > now.getTime();
}

/**
 * A step is blocked until everything it requires is confirmed. A
 * prerequisite the person marked notRelevant does NOT block: if you have
 * said you will not name an executor, the product must not then trap the
 * backup step behind it forever.
 */
function isBlocked(step: AffairStep, byKey: Map<string, StepRecord>): boolean {
  return (step.requires ?? []).some((key) => {
    const state = byKey.get(key)?.state;
    return state !== "confirmed" && state !== "notRelevant";
  });
}

/**
 * Ordering. Consequence dominates, because a missing executor matters
 * more than a note about photographs. Effort breaks ties in favour of
 * the quicker job, so somebody with ten minutes can always finish
 * something. The knowledge base's own order is the final tiebreak, which
 * keeps output stable rather than dependent on map iteration.
 */
function rank(step: AffairStep): number {
  const order = AFFAIR_STEPS.indexOf(step);
  return step.consequence * -1000 + step.minutes + order / 1000;
}

export function deriveAffairsState(inputs: SequencerInputs, now: Date): AffairsState {
  const byKey = new Map(inputs.records.map((r) => [r.stepKey, r]));
  const relevant = relevantSteps(inputs.profile);

  const confirmedCount = relevant.filter((s) => byKey.get(s.key)?.state === "confirmed").length;

  const candidates: { step: AffairStep; reason: NextStepReason }[] = [];

  for (const step of relevant) {
    const record = byKey.get(step.key);
    if (record?.state === "notRelevant") continue;
    if (isSnoozed(record, now)) continue;
    if (isBlocked(step, byKey)) continue;

    if (!record || record.state === "pending" || record.state === "open") {
      candidates.push({ step, reason: record ? "unblocked" : "firstTime" });
      continue;
    }
    if (needsRecheck(step, record, now)) {
      candidates.push({ step, reason: "needsRecheck" });
    }
  }

  candidates.sort((a, b) => rank(a.step) - rank(b.step));
  const chosen = candidates[0] ?? null;

  return {
    next: chosen ? { step: chosen.step, reason: chosen.reason, confirmedCount } : null,
    confirmedCount,
    allCaughtUp: candidates.length === 0,
    relevant,
  };
}
