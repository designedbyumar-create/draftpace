import type { LifeItem } from "./life";
import type { OutcomeKind } from "./playbook";

/**
 * What a finished Companion run does to Life.
 *
 * The integration that makes this a Companion rather than two features
 * sold together, expressed as a pure function so the rule can be read
 * and tested in one place rather than inferred from six call sites.
 *
 *   Life item --"do this with me"--> Playbook --outcome--> Life updated
 *   Direct start --> Playbook --outcome--> offered to Life
 *
 * THE RULE THAT MATTERS MOST
 *
 * "Did not get to it" changes nothing. Not a status, not a counter, not
 * an event in a log. Recording an abandonment turns the history into a
 * record of failures, and this is the audience for whom that is most
 * corrosive. It is asserted in a test, because it is exactly the kind of
 * rule a later contributor helpfully breaks by adding an "attempts"
 * column.
 */

export interface OutcomeInput {
  outcome: OutcomeKind;
  /** Whatever the outcome asked for: a name, a next step, or a note. */
  detail: string | null;
  now: Date;
}

/**
 * The changes to apply to an item. An empty object means nothing
 * changes, which is a real and important result when it comes from
 * applyOutcome below.
 *
 * Wider than what applyOutcome itself ever produces (it never touches
 * title, note, userChosenDate or everyMonths), because this type is also
 * how a person's own edit on the item detail page reaches the database.
 * One shape for "something changed about this item" rather than two,
 * so there is one place, not two, that has to agree with the database
 * columns.
 */
export type ItemPatch = Partial<
  Pick<
    LifeItem,
    | "title"
    | "note"
    | "status"
    | "kind"
    | "nextAt"
    | "userChosenDate"
    | "everyMonths"
    | "waitingOn"
    | "lastTouchedAt"
    | "leftOffNote"
    | "nextStep"
  >
>;

export interface OutcomeEffect {
  patch: ItemPatch;
  /** A line for the item's own history. Null means nothing is recorded. */
  event: string | null;
  /** Set when the run should offer to remember something new. */
  offer: { kind: "waiting"; title: string } | null;
}

/** How long a new waiting item sits before it is worth checking again. */
const WAITING_CHECK_DAYS = 10;

function inDays(now: Date, days: number): string {
  const d = new Date(now.getTime());
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function nextOccurrence(item: LifeItem, now: Date): string | null {
  if (!item.everyMonths) return null;
  const base = item.nextAt ? new Date(item.nextAt) : new Date(now.getTime());
  const next = new Date(base.getTime());
  next.setMonth(next.getMonth() + item.everyMonths);
  // A commitment that was dealt with late should not immediately be due
  // again; roll forward until it is genuinely in the future.
  while (next.getTime() <= now.getTime()) next.setMonth(next.getMonth() + item.everyMonths);
  return next.toISOString();
}

export function applyOutcome(item: LifeItem, input: OutcomeInput): OutcomeEffect {
  const nowIso = input.now.toISOString();

  switch (input.outcome) {
    case "resolved": {
      // A thing that comes round rolls to its next date rather than
      // closing, because closing it would mean setting it up again.
      if (item.everyMonths) {
        return {
          patch: { nextAt: nextOccurrence(item, input.now), lastTouchedAt: nowIso, nextStep: null },
          event: "Sorted",
          offer: null,
        };
      }
      return {
        patch: { status: "done", lastTouchedAt: nowIso, nextStep: null },
        event: "Sorted",
        offer: null,
      };
    }

    case "progress":
      return {
        patch: { lastTouchedAt: nowIso, leftOffNote: input.detail },
        event: input.detail ? `Made progress: ${input.detail}` : "Made progress",
        offer: null,
      };

    case "waiting": {
      // The item itself becomes the waiting item. Creating a second
      // record would leave the original sitting in a list of things to
      // do, which is precisely what waiting is not.
      const who = input.detail?.trim() || null;
      return {
        patch: {
          kind: "waiting",
          waitingOn: who,
          nextAt: inDays(input.now, WAITING_CHECK_DAYS),
          lastTouchedAt: nowIso,
        },
        event: who ? `Waiting on ${who}` : "Waiting on someone",
        offer: null,
      };
    }

    case "next-step":
      return {
        patch: { lastTouchedAt: nowIso, nextStep: input.detail },
        event: input.detail ? `Next: ${input.detail}` : "There is a next step",
        offer: null,
      };

    /**
     * Nothing. No status change, no timestamp, no event.
     *
     * Touching lastTouchedAt here would be defensible and is still
     * wrong: it would quietly restart the thread's quiet clock and hide
     * the item from attention for another fortnight, which is the
     * opposite of what somebody who did not get to it needs.
     */
    case "not-yet":
      return { patch: {}, event: null, offer: null };

    case "other":
      return {
        patch: { lastTouchedAt: nowIso },
        event: input.detail || "Something else happened",
        offer: null,
      };
  }
}

/**
 * The same outcomes, for a run that started with no Life item behind it.
 *
 * Returns what the product should offer to remember, or null when there
 * is nothing worth keeping. The offer is always a question, never an
 * automatic write: somebody who opened the Companion to get one phone
 * call done has not asked for a system.
 */
export function offerFromDirectRun(
  input: OutcomeInput,
  title: string
): { kind: LifeItem["kind"]; title: string; note: string | null; nextAt: string | null } | null {
  switch (input.outcome) {
    case "waiting":
      return {
        kind: "waiting",
        title,
        note: input.detail ? `Waiting on ${input.detail}` : null,
        nextAt: inDays(input.now, WAITING_CHECK_DAYS),
      };
    case "next-step":
      return { kind: "commitment", title: input.detail || title, note: null, nextAt: null };
    case "progress":
      return { kind: "thread", title, note: input.detail, nextAt: null };
    // Sorted needs no memory, and neither does a thing that did not
    // happen. Offering to remember either would be the product creating
    // work out of a finished conversation.
    case "resolved":
    case "not-yet":
    case "other":
      return null;
  }
}
