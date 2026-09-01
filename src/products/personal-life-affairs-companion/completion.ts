import type { AffairStep } from "./affairsKnowledge";
import { itemsForStep, type AffairItem } from "./lifeAffairs";
import { isEstablished, needsRecheck, relevantSteps, type AffairProfile, type StepRecord } from "./sequencer";

/**
 * What a person's affairs actually contain, and how current it is.
 *
 * This exists to serve one design law: done is DECLARED, never
 * calculated. Nothing here gates the printed copy or blocks a person
 * from finishing. It only describes, so the document can be honest and
 * the person can decide when they are ready.
 *
 * The distinction that shapes this file: inside the app there is never a
 * denominator, because a fraction turns a short and complete life into a
 * failure. In the printed copy the reader is somebody else, judging how
 * far to trust what they are holding, so it reports every category
 * explicitly instead. "34 recorded, 5 not applicable, 2 left open" says
 * more than "34 of 41" and shames nobody.
 *
 * Every row now carries the RECORDS behind it, not just a standing. That
 * is what the printed copy renders. A row with a standing and no records
 * is the defect this rewrite existed to remove.
 */

export type StepStanding =
  /** A record exists. The only standing that means the product knows something. */
  | "established"
  /** Something done out in the world that the person says they did. */
  | "done"
  /** Confirmed before this product captured answers. A real date with no detail behind it. */
  | "recordedWithoutDetail"
  | "notApplicable"
  | "leftOpen"
  /** The person genuinely does not know yet. Not a refusal, and never counted as one. */
  | "unsure"
  | "notAddressed"
  | "worthRechecking";

export interface StandingRow {
  step: AffairStep;
  standing: StepStanding;
  /** The actual knowledge. Empty for action steps and for anything not yet established. */
  items: AffairItem[];
  /** Present only where a date was genuinely earned. */
  confirmedAt: string | null;
}

export interface Readiness {
  rows: StandingRow[];
  established: number;
  done: number;
  recordedWithoutDetail: number;
  notApplicable: number;
  leftOpen: number;
  unsure: number;
  notAddressed: number;
  worthRechecking: number;
  /** Total records in the Life Affairs Map. What the document actually contains. */
  itemCount: number;
  /** Most recent confirmation of anything, the document's currency claim. */
  lastConfirmedAt: string | null;
  /** Oldest still-standing confirmation, which is what actually ages a copy. */
  oldestConfirmedAt: string | null;
  /**
   * True when nothing is unaddressed, nothing is stale, and nothing was
   * deliberately left open or left unsure. Describes a state; it is
   * never a precondition for anything.
   *
   * "Not applicable" counts as settled because a deliberate skip is an
   * answer. "Left open" and "not sure" do not, because the sequencer
   * will keep offering those. The two must agree, or the product would
   * call something finished while still asking about it.
   */
  nothingOutstanding: boolean;
}

function latestConfirmation(items: AffairItem[]): string | null {
  const dates = items.map((i) => i.lastConfirmedAt ?? i.establishedAt).filter((d): d is string => Boolean(d)).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function standingFor(
  step: AffairStep,
  record: StepRecord | undefined,
  items: AffairItem[],
  now: Date
): StepStanding {
  if (record?.state === "notRelevant") return "notApplicable";
  if (needsRecheck(step, record, items, now)) return "worthRechecking";

  if (step.kind === "establish" && isEstablished(step, items)) return "established";
  if (step.kind === "action" && record?.state === "confirmed") return "done";
  // An old confirmation on an establish step, with no record behind it.
  if (record?.state === "confirmed") return "recordedWithoutDetail";

  if (record?.state === "unsure") return "unsure";
  if (record?.state === "open") return "leftOpen";
  return "notAddressed";
}

export function deriveReadiness(
  inputs: { profile: AffairProfile; records: StepRecord[]; items: AffairItem[] },
  now: Date
): Readiness {
  const byKey = new Map(inputs.records.map((r) => [r.stepKey, r]));

  const rows: StandingRow[] = relevantSteps(inputs.profile).map((step) => {
    const record = byKey.get(step.key);
    const stepItems = itemsForStep(inputs.items, step.key);
    const standing = standingFor(step, record, inputs.items, now);
    return {
      step,
      standing,
      items: stepItems,
      confirmedAt: stepItems.length ? latestConfirmation(stepItems) : record?.confirmedAt ?? null,
    };
  });

  const count = (s: StepStanding) => rows.filter((r) => r.standing === s).length;
  const dates = rows
    .filter((r) => r.standing !== "notAddressed" && r.standing !== "notApplicable")
    .map((r) => r.confirmedAt)
    .filter((d): d is string => Boolean(d))
    .sort();

  const notAddressed = count("notAddressed");
  const worthRechecking = count("worthRechecking");
  const leftOpen = count("leftOpen");
  const unsure = count("unsure");

  return {
    rows,
    established: count("established"),
    done: count("done"),
    recordedWithoutDetail: count("recordedWithoutDetail"),
    notApplicable: count("notApplicable"),
    leftOpen,
    unsure,
    notAddressed,
    worthRechecking,
    itemCount: rows.reduce((n, r) => n + r.items.length, 0),
    lastConfirmedAt: dates.length ? dates[dates.length - 1] : null,
    oldestConfirmedAt: dates.length ? dates[0] : null,
    nothingOutstanding: notAddressed === 0 && worthRechecking === 0 && leftOpen === 0 && unsure === 0,
  };
}



/**
 * Whether a copy is a blank one: nothing recorded and nothing decided,
 * so the document prints the questions and lines to write on rather than
 * a page of "not yet started".
 *
 * Lives here rather than in the document or the download, because both
 * need it and a rule expressed twice is a rule that eventually disagrees
 * with itself. The filename must never claim something the pages
 * contradict.
 */
export function isBlankCopy(readiness: Readiness): boolean {
  return (
    readiness.itemCount === 0 &&
    readiness.done === 0 &&
    readiness.recordedWithoutDetail === 0 &&
    readiness.leftOpen === 0 &&
    readiness.notApplicable === 0
  );
}

/**
 * What the printed book calls itself, and who it says made it.
 *
 * Named here rather than written into the document, because the document,
 * its download filename and the app's own preview of it all have to agree,
 * and three copies of a string are three chances to disagree. The internal
 * name of this product is deliberately not among them: a person hands this
 * to somebody at the worst possible moment, and a product name across the
 * top would make it read as an export rather than as their own document.
 */
export const BOOK_NAME = "My Affairs";
export const BOOK_ATTRIBUTION = "Personal Life Affairs Companion";

/**
 * The name the file lands under. Somebody will have several of these over
 * the years, and a blank copy and a filled one are different documents:
 * the same name means the browser silently collides them.
 */
export function bookFilename(readiness: Readiness, generatedAt: Date): string {
  const stamp = generatedAt.toISOString().slice(0, 10);
  return `my-affairs-${isBlankCopy(readiness) ? "blank" : "copy"}-${stamp}.pdf`;
}
