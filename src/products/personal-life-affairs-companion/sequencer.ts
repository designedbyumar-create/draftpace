import { AFFAIR_STEPS, type AffairGate, type AffairStep } from "./affairsKnowledge";
import { itemsForStep, needsReview, type AffairItem } from "./lifeAffairs";

/**
 * The engine. Given what somebody has told us about their life, what we
 * actually know about their affairs, and what they have already dealt
 * with, decide the single next thing to show.
 *
 * This is the product. Every competitor shows a dashboard of sections
 * and every review of those competitors complains about not knowing what
 * to do next, so the restraint here is the feature. The hard rule: this
 * module returns ONE step, never a list.
 *
 * WHAT CHANGED WHEN THIS BECAME A COMPANION
 *
 * It used to ask "which steps has this person completed". It now asks
 * "what do we actually know about this person's affairs". For an
 * establish step those are different questions, and only the second one
 * produces a document worth handing to anybody. A step is satisfied by a
 * RECORD, not by a press of a button. Action steps are the exception and
 * are meant to be: telling your executor you chose them happens in the
 * world, and the honest evidence is that the person says they did it.
 *
 * Deliberately pure. No database, no dates from the environment, no
 * React. `now` is always passed in, so every behaviour below is testable
 * without mocking a clock.
 */

export type StepState = "pending" | "confirmed" | "notRelevant" | "open" | "unsure";

/** What the database knows about one step for one person. */
export interface StepRecord {
  stepKey: string;
  state: StepState;
  /** When a human last asserted this is still true. */
  confirmedAt: string | null;
  snoozedUntil: string | null;
  /**
   * True for confirmations recorded before this product captured
   * answers. They are a date with nothing behind them. They are kept
   * rather than deleted, because somebody really did sit down and deal
   * with that step, and they still satisfy prerequisites so nothing
   * downstream is trapped. What they do not do is count as knowledge.
   */
  legacyConfirmation: boolean;
}

/** The intake answers. Undefined means not asked yet, which is not the same as false. */
export type AffairProfile = Partial<Record<AffairGate, boolean>>;

export interface SequencerInputs {
  profile: AffairProfile;
  records: StepRecord[];
  items: AffairItem[];
}

/**
 * Why a step is being shown now, so the UI never has to guess and never
 * has to phrase it from a boolean.
 */
export type NextStepReason = "firstTime" | "unblocked" | "needsRecheck" | "needsDetail" | "wasUnsure";

export interface NextStep {
  step: AffairStep;
  reason: NextStepReason;
  /** Records already established for this step. Non-empty means the person is adding or revising. */
  existing: AffairItem[];
  /** Things established so far. Counts up, never a denominator. */
  establishedCount: number;
}

export interface AffairsState {
  /** The one thing to show, or null when there is genuinely nothing. */
  next: NextStep | null;
  establishedCount: number;
  /** True once nothing is pending and nothing needs looking at again. */
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
 * Whether this product actually knows the thing the step exists to find
 * out.
 *
 * The single most important function in the product, and the one whose
 * absence made the earlier version a checklist. An establish step is
 * satisfied by a record and by nothing else. Pressing a button is not
 * knowledge, and a document assembled from button presses tells a family
 * nothing.
 */
export function isEstablished(step: AffairStep, items: AffairItem[]): boolean {
  if (step.kind === "action") return false;
  return itemsForStep(items, step.key).length > 0;
}

/**
 * Settled in any of the ways that mean the companion should stop asking:
 * we know it, or the person said it does not apply to them, or (for a
 * step done out in the world) they said they did it.
 *
 * Prerequisites resolve against this rather than against knowledge
 * alone, so declining to name an executor does not trap the backup step
 * behind it forever.
 */
export function isSettled(step: AffairStep, record: StepRecord | undefined, items: AffairItem[]): boolean {
  if (record?.state === "notRelevant") return true;
  if (step.kind === "action") return record?.state === "confirmed";
  if (isEstablished(step, items)) return true;
  // A confirmation from before answers were captured still counts as
  // settled for sequencing. It is surfaced separately, as a step that
  // wants its detail filled in, never as a blocker.
  return record?.state === "confirmed" && record.legacyConfirmation;
}

/**
 * Whether something has been standing long enough to be worth a second
 * look. This is the entire caretaker mode and the thing a paper binder
 * cannot do.
 *
 * For an establish step the clock belongs to the record, because the
 * record is the thing whose truth decays. For an action step there is no
 * record, so the clock belongs to the confirmation.
 */
export function needsRecheck(
  step: AffairStep,
  record: StepRecord | undefined,
  items: AffairItem[],
  now: Date
): boolean {
  if (step.kind === "establish") {
    return itemsForStep(items, step.key).some((item) => needsReview(item, now));
  }
  if (!record || record.state !== "confirmed" || !record.confirmedAt) return false;
  if (!step.confirmEveryMonths) return false;
  return daysBetween(record.confirmedAt, now) >= step.confirmEveryMonths * 30;
}

function isSnoozed(record: StepRecord | undefined, now: Date): boolean {
  if (!record?.snoozedUntil) return false;
  return new Date(record.snoozedUntil).getTime() > now.getTime();
}

/**
 * A step is blocked until everything it requires is settled. A
 * prerequisite the person marked notRelevant does NOT block: if you have
 * said you will not name an executor, the product must not then trap the
 * backup step behind it forever.
 */
function isBlocked(step: AffairStep, byKey: Map<string, StepRecord>, items: AffairItem[]): boolean {
  return (step.requires ?? []).some((key) => {
    const required = AFFAIR_STEPS.find((s) => s.key === key);
    if (!required) return false;
    return !isSettled(required, byKey.get(key), items);
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
  const items = inputs.items;

  /**
   * What this product knows, counted up. Records that exist plus things
   * done in the world that the person confirmed. A deliberate skip is
   * not counted, because "not applicable" is an answer but it is not
   * knowledge, and inflating this number would make it the completion
   * score the product refuses to have.
   */
  const establishedCount = relevant.filter((step) =>
    step.kind === "establish" ? isEstablished(step, items) : byKey.get(step.key)?.state === "confirmed"
  ).length;

  const candidates: { step: AffairStep; reason: NextStepReason }[] = [];

  for (const step of relevant) {
    const record = byKey.get(step.key);
    if (record?.state === "notRelevant") continue;
    if (isSnoozed(record, now)) continue;
    if (isBlocked(step, byKey, items)) continue;

    if (needsRecheck(step, record, items, now)) {
      candidates.push({ step, reason: "needsRecheck" });
      continue;
    }

    if (isSettled(step, record, items)) {
      // Settled only because of an old confirmation with no answer
      // behind it. Worth asking for the detail, and phrased as an offer
      // rather than as a task the person failed to do properly.
      if (step.kind === "establish" && !isEstablished(step, items)) {
        candidates.push({ step, reason: "needsDetail" });
      }
      continue;
    }

    if (record?.state === "unsure") {
      candidates.push({ step, reason: "wasUnsure" });
      continue;
    }
    candidates.push({ step, reason: record ? "unblocked" : "firstTime" });
  }

  candidates.sort((a, b) => rank(a.step) - rank(b.step));
  const chosen = candidates[0] ?? null;

  return {
    next: chosen
      ? {
          step: chosen.step,
          reason: chosen.reason,
          existing: itemsForStep(items, chosen.step.key),
          establishedCount,
        }
      : null,
    establishedCount,
    allCaughtUp: candidates.length === 0,
    relevant,
  };
}
