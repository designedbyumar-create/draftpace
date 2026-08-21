import type { AffairStep } from "./affairsKnowledge";
import { needsRecheck, type AffairProfile, type StepRecord } from "./sequencer";
import { relevantSteps } from "./sequencer";

/**
 * What a person has actually settled, and how current it is.
 *
 * This exists to serve one design law: done is DECLARED, never
 * calculated. Nothing here gates the printed copy or blocks a person
 * from finishing. It only describes, so the document can be honest and
 * the person can decide when they are ready.
 *
 * The distinction that shapes this file: inside the app there is never a
 * denominator, because a fraction turns a short and complete list into a
 * failure. In the printed copy the reader is somebody else, judging how
 * far to trust what they are holding, so it reports every category
 * explicitly instead. "34 confirmed, 5 not applicable, 2 left open" says
 * more than "34 of 41" and shames nobody.
 */

export type StepStanding = "confirmed" | "notApplicable" | "leftOpen" | "notAddressed" | "worthRechecking";

export interface StandingRow {
  step: AffairStep;
  standing: StepStanding;
  /** Present only when standing is confirmed or worthRechecking. */
  confirmedAt: string | null;
}

export interface Readiness {
  rows: StandingRow[];
  confirmed: number;
  notApplicable: number;
  leftOpen: number;
  notAddressed: number;
  worthRechecking: number;
  /** Most recent confirmation of anything, the document's currency claim. */
  lastConfirmedAt: string | null;
  /** Oldest still-standing confirmation, which is what actually ages a copy. */
  oldestConfirmedAt: string | null;
  /**
   * True when nothing is unaddressed, nothing is stale, and nothing was
   * deliberately left open. Describes a state; it is never a
   * precondition for anything.
   *
   * "Not applicable" counts as settled because a deliberate skip is an
   * answer. "Left open" does not, because the person said they know and
   * have not done it yet, and the sequencer will keep offering it. The
   * two must agree or the product would call something finished while
   * still asking about it.
   */
  nothingOutstanding: boolean;
}

function standingFor(step: AffairStep, record: StepRecord | undefined, now: Date): StepStanding {
  if (!record) return "notAddressed";
  if (record.state === "notRelevant") return "notApplicable";
  if (record.state === "open") return "leftOpen";
  if (record.state === "pending") return "notAddressed";
  return needsRecheck(step, record, now) ? "worthRechecking" : "confirmed";
}

export function deriveReadiness(
  inputs: { profile: AffairProfile; records: StepRecord[] },
  now: Date
): Readiness {
  const byKey = new Map(inputs.records.map((r) => [r.stepKey, r]));

  const rows: StandingRow[] = relevantSteps(inputs.profile).map((step) => {
    const record = byKey.get(step.key);
    const standing = standingFor(step, record, now);
    return {
      step,
      standing,
      confirmedAt: standing === "confirmed" || standing === "worthRechecking" ? record?.confirmedAt ?? null : null,
    };
  });

  const count = (s: StepStanding) => rows.filter((r) => r.standing === s).length;
  const dates = rows.map((r) => r.confirmedAt).filter((d): d is string => Boolean(d)).sort();

  const notAddressed = count("notAddressed");
  const worthRechecking = count("worthRechecking");

  return {
    rows,
    confirmed: count("confirmed"),
    notApplicable: count("notApplicable"),
    leftOpen: count("leftOpen"),
    notAddressed,
    worthRechecking,
    lastConfirmedAt: dates.length ? dates[dates.length - 1] : null,
    oldestConfirmedAt: dates.length ? dates[0] : null,
    nothingOutstanding: notAddressed === 0 && worthRechecking === 0 && count("leftOpen") === 0,
  };
}

/**
 * The line printed on the cover, and shown before somebody generates a
 * copy so there is never a surprise about what they are handing over.
 *
 * Reports every category rather than a fraction. A copy that is 12 items
 * for somebody with a simple life is complete, not 12 out of 44.
 */
export function describeReadiness(readiness: Readiness): string {
  const parts = [`${readiness.confirmed} confirmed`];
  if (readiness.notApplicable > 0) parts.push(`${readiness.notApplicable} not applicable`);
  if (readiness.leftOpen > 0) parts.push(`${readiness.leftOpen} left open`);
  if (readiness.notAddressed > 0) parts.push(`${readiness.notAddressed} not yet started`);
  if (readiness.worthRechecking > 0) parts.push(`${readiness.worthRechecking} worth checking again`);
  return parts.join(", ") + ".";
}

/** How the person is invited to finish, phrased for where they actually are. */
export function describeHandoverInvitation(readiness: Readiness): string {
  if (readiness.confirmed === 0) {
    return "Once you have settled a few things, you can print a copy to give to somebody.";
  }
  if (readiness.nothingOutstanding) {
    return "Everything you have told us about is settled. This is a good moment to print a copy.";
  }
  return "You can print a copy whenever you like. It will say plainly what is settled and what is not.";
}
