import { AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";
import { computeNextReview, type AffairItem } from "./lifeAffairs";
import type { StepRecord } from "./sequencer";

/**
 * Fixtures for the tests, shared so that "what settles a step" is
 * expressed once. When the rule changes, exactly one function changes
 * and every test that depends on it moves with it.
 */

export function rec(stepKey: string, over: Partial<StepRecord> = {}): StepRecord {
  return {
    stepKey,
    state: "confirmed",
    confirmedAt: new Date("2026-08-22T12:00:00Z").toISOString(),
    snoozedUntil: null,
    legacyConfirmation: false,
    ...over,
  };
}

let counter = 0;

/**
 * A record in the Life Affairs Map, established at `at`, with the review
 * clock the knowledge base sets for its own step. Building it from the
 * real step means a test cannot accidentally assert a review interval
 * the product does not actually use.
 */
export function item(stepKey: string, over: Partial<AffairItem> = {}, at = new Date("2026-08-22T12:00:00Z")): AffairItem {
  const step = AFFAIR_STEP_BY_KEY[stepKey];
  const months = step?.confirmEveryMonths ?? null;
  const iso = at.toISOString();
  counter += 1;
  return {
    id: `item-${counter}`,
    kind: "person",
    area: step?.area ?? "people",
    originStepKey: stepKey,
    label: "Jane Smith",
    whereabouts: null,
    personName: "Jane Smith",
    personContact: null,
    notes: null,
    fields: {},
    status: "established",
    establishedAt: iso,
    lastConfirmedAt: iso,
    reviewIntervalMonths: months,
    nextReviewAt: computeNextReview(months, at),
    ...over,
  };
}
