import { daysSince, daysUntil, describeDaysSince, describeDaysUntil, openItems, type LifeItem } from "./life";

/**
 * What deserves attention, derived.
 *
 * Never stored, computed on read from the items and the date, so it
 * cannot go stale and needs no job to keep it honest. Same discipline as
 * Home Base's attention and the Homeschooling Companion's Today.
 *
 * DELIVERY IS NOT THIS FILE'S PROBLEM
 *
 * This produces signals and knows nothing about how one reaches a
 * person. An adapter takes signals and does something with them: in v1
 * there is one and it renders a screen. Adding push later adds an
 * adapter and changes nothing here.
 *
 * That seam exists because of a Phase 0 finding rather than a
 * preference. Push reaches iOS only through a manual home screen install
 * that no page can trigger, and web push opt-in runs from roughly 3% to
 * 15% even where no install is needed. The product does not claim to
 * notify anybody, and the engine is built so that claim can change later
 * without the engine changing.
 *
 * SIX REASONS, AND NO SEVENTH
 *
 * Every signal is one of six, each tracing to a stored fact the person
 * can see. The phrasings are fixed here rather than written at each call
 * site, so the tone cannot drift one string at a time.
 */

export type AttentionReason =
  | "coming-up"
  | "worth-checking"
  | "left-off"
  | "you-asked"
  | "ready"
  | "nothing";

export interface AttentionSignal {
  itemId: string;
  reason: AttentionReason;
  /** The sentence shown. Always one of the approved shapes below. */
  line: string;
  /** Sorting only. Never shown, never described as urgency. */
  weight: number;
}

export interface AttentionInputs {
  items: LifeItem[];
}

export interface AttentionView {
  signals: AttentionSignal[];
  /** True when there is genuinely nothing. A real state, not an empty one. */
  quiet: boolean;
}

/**
 * How near a date has to be before it is worth mentioning.
 *
 * Three weeks, because the things this product holds are mostly the kind
 * that need a fortnight of lead time to deal with comfortably, and
 * because a horizon much longer than that fills the screen with things
 * nobody can act on yet.
 */
const HORIZON_DAYS = 21;

/**
 * How long a thread can sit before the product mentions it.
 *
 * Deliberately long. A fortnight of not touching something is an
 * ordinary fortnight, not a lapse, and a product that speaks up after
 * three days has become the nagging this one exists without.
 */
const THREAD_QUIET_DAYS = 14;

export function deriveAttention(inputs: AttentionInputs, now: Date): AttentionView {
  const signals: AttentionSignal[] = [];

  for (const item of openItems(inputs.items)) {
    const until = daysUntil(item.nextAt, now);

    if (item.kind === "waiting") {
      // A waiting item is never actionable and never appears before its
      // own check date. Somebody else has the ball.
      if (until !== null && until <= 0) {
        signals.push({
          itemId: item.id,
          reason: "worth-checking",
          line: item.waitingOn ? `Still waiting on ${item.waitingOn}?` : "Still waiting on this?",
          weight: 200 - until,
        });
      }
      continue;
    }

    if (until !== null && until <= HORIZON_DAYS) {
      signals.push({
        itemId: item.id,
        reason: item.userChosenDate ? "you-asked" : "coming-up",
        line: item.userChosenDate
          ? "You said you would come back to this"
          : `Coming up ${describeDaysUntil(until)}`,
        weight: 300 - until,
      });
      continue;
    }

    if (item.kind === "thread") {
      const since = daysSince(item.lastTouchedAt, now);
      if (since !== null && since >= THREAD_QUIET_DAYS) {
        signals.push({
          itemId: item.id,
          reason: "left-off",
          line: `You left off here ${describeDaysSince(since)}`,
          weight: 100 + Math.min(since, 90),
        });
      }
    }
  }

  signals.sort((a, b) => b.weight - a.weight || a.itemId.localeCompare(b.itemId));

  return { signals, quiet: signals.length === 0 };
}

/**
 * A signal raised when something that was blocking a thread has cleared.
 *
 * Separate from the main pass because it is a relationship between two
 * items rather than a property of one, and folding it into the loop
 * above would make that loop lie about what it reads.
 */
export function readySignals(items: LifeItem[], resolvedWaitingIds: string[]): AttentionSignal[] {
  if (resolvedWaitingIds.length === 0) return [];
  return openItems(items)
    .filter((item) => item.kind === "thread" && resolvedWaitingIds.includes(item.id))
    .map((item) => ({
      itemId: item.id,
      reason: "ready" as const,
      line: "This is unblocked now",
      weight: 400,
    }));
}

/** The line shown when there is nothing. A real state, phrased as one. */
export const QUIET_LINE = "Nothing needs you right now";

/**
 * The complete set of shapes an attention line may take.
 *
 * Asserted in tests against every line the engine can emit, so a
 * seventh phrasing cannot arrive one commit at a time. This is the
 * mechanism behind "attention strings must use a controlled set of
 * approved phrasings".
 */
export const APPROVED_PHRASINGS: readonly RegExp[] = [
  /^Coming up /,
  /^Still waiting on /,
  /^You left off here /,
  /^You said you would come back to this$/,
  /^This is unblocked now$/,
  /^Nothing needs you right now$/,
];

export function isApprovedPhrasing(line: string): boolean {
  return APPROVED_PHRASINGS.some((shape) => shape.test(line));
}
