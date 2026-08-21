import { AFFAIR_STEP_BY_KEY, type AffairGate } from "./affairsKnowledge";
import { liveItems, type AffairItem } from "./lifeAffairs";

/**
 * When somebody's life changes, and what that quietly makes untrue.
 *
 * THE FAILURE THIS PREVENTS
 *
 * A picture of your affairs is only worth anything if it is current, and
 * the way it stops being current is never gradual. Somebody separates,
 * or moves, or leaves a job, and eleven answers that were right last
 * month are now wrong all at once. The named person on a pension form
 * overrides a will; a form filled in at an old job quietly wins years
 * later. Nothing about the passage of time catches that, because it is
 * not a matter of time.
 *
 * WHAT THIS DELIBERATELY DOES NOT DO
 *
 * It does not mark anything wrong. The product does not know that. It
 * moves the affected records' review dates to now, which surfaces them
 * through the ordinary one-step-at-a-time path as "worth checking
 * again". A move produces one question, then the next question. It never
 * produces a list of eleven tasks, which is the giant life-event
 * checklist every competitor ships and every reviewer abandons.
 *
 * Pure. The caller does the writing.
 */

export interface LifeEvent {
  /** Open validated string, stored on pla_events.kind. */
  kind: string;
  /** How the person would say it, in the first person. */
  label: string;
  /** The steps whose answers this change could have made untrue. */
  affects: string[];
  /**
   * An intake answer this event settles on its own. Recording that you
   * bought a house should not then ask whether you own your home.
   */
  implies?: { gate: AffairGate; value: boolean };
}

export const LIFE_EVENTS: LifeEvent[] = [
  {
    kind: "moved",
    label: "I moved",
    affects: [
      "home.where-you-live",
      "home.mortgage",
      "home.insurance",
      "home.utilities",
      "home.keys",
      "paperwork.id-documents",
    ],
  },
  {
    kind: "married",
    label: "I got married",
    implies: { gate: "partnered", value: true },
    affects: [
      "paperwork.will-exists",
      "paperwork.marriage-divorce",
      "money.pensions",
      "money.life-cover",
      "people.executor",
      "people.health-decisions",
    ],
  },
  {
    kind: "separated",
    label: "I separated or divorced",
    implies: { gate: "partnered", value: false },
    affects: [
      "paperwork.will-exists",
      "paperwork.marriage-divorce",
      "money.pensions",
      "money.life-cover",
      "money.current-accounts",
      "people.executor",
      "people.emergency-contact",
      "people.health-decisions",
      "home.where-you-live",
      "home.keys",
    ],
  },
  {
    kind: "new-child",
    label: "I had or adopted a child",
    implies: { gate: "hasChildren", value: true },
    affects: ["dependants.guardian", "dependants.guardian-backup", "paperwork.will-exists", "money.life-cover"],
  },
  {
    kind: "new-job",
    label: "I changed jobs",
    implies: { gate: "hasEmployerRetirement", value: true },
    affects: ["money.pensions", "money.income-sources", "money.life-cover"],
  },
  {
    kind: "bought-home",
    label: "I bought a place",
    implies: { gate: "ownsHome", value: true },
    affects: ["home.where-you-live", "home.mortgage", "home.insurance", "paperwork.will-exists"],
  },
  {
    kind: "started-business",
    label: "I started working for myself",
    implies: { gate: "hasBusiness", value: true },
    affects: ["money.business-continuity", "money.income-sources", "paperwork.tax-records"],
  },
  {
    kind: "someone-died",
    label: "Someone I named has died",
    affects: [
      "people.emergency-contact",
      "people.executor",
      "people.executor-backup",
      "people.health-decisions",
      "dependants.guardian",
      "dependants.guardian-backup",
      "money.pensions",
      "money.life-cover",
    ],
  },
  {
    kind: "no-longer-have-pet",
    label: "I no longer have a pet",
    affects: ["dependants.pets"],
  },
];

export const LIFE_EVENT_BY_KIND: Record<string, LifeEvent> = Object.fromEntries(
  LIFE_EVENTS.map((event) => [event.kind, event])
);

/**
 * The records this change could have made untrue, and only those. A
 * person who has recorded nothing about their home has nothing to
 * recheck after moving, and telling them otherwise would be inventing
 * work.
 */
export function affectedItems(event: LifeEvent, items: AffairItem[]): AffairItem[] {
  const keys = new Set(event.affects);
  return liveItems(items).filter((i) => i.originStepKey !== null && keys.has(i.originStepKey));
}

/**
 * What the companion says after the change is recorded. Names a number
 * because the person is about to be asked about them one at a time and
 * deserves to know how long this will take, then never mentions it
 * again.
 */
export function describeAftermath(event: LifeEvent, affected: AffairItem[]): string {
  if (affected.length === 0) {
    return "Recorded. Nothing you have written down so far is affected by that.";
  }
  const noun = affected.length === 1 ? "one thing" : `${affected.length} things`;
  return `Recorded. That can change a few parts of your affairs, and I found ${noun} worth checking. We will go through them one at a time.`;
}

/** Steps this event makes relevant that were not recorded at all yet. */
export function newlyRelevantSteps(event: LifeEvent, items: AffairItem[]): string[] {
  const recorded = new Set(liveItems(items).map((i) => i.originStepKey));
  return event.affects.filter((key) => AFFAIR_STEP_BY_KEY[key] && !recorded.has(key));
}
