import type { HomeItem, MaintenanceTask, MaintenanceLogEntry, Problem } from "./state";
import { findCareTemplate, findCareTemplateByTaskName, type CareConsequence, type CareEffort } from "./homeKnowledge";
import { describeCareStatus, describeWarranty, describeUpcoming, describeElapsed, daysBetween } from "./homeVoice";

/**
 * The shared Attention domain: one deterministic answer to "what does
 * this home need from me", built only from stored dates and curated
 * knowledge. Powers both the Attention surface and the Today snapshot
 * from a single source, so the two can never disagree.
 *
 * Every item here is explainable. Nothing is inferred, weighted by
 * engagement, or invented: if a line cannot be traced to a date on a row
 * plus a hand-written rule in homeKnowledge.ts, it does not appear.
 */

export type AttentionKind = "maintenanceDue" | "warrantyExpiring" | "problem";

/**
 * How much this deserves to interrupt someone. Deliberately named for
 * the decision it supports rather than for a heading: the words shown to
 * a person live in the presentation layer, not here.
 */
export type AttentionUrgency = "soon" | "canWait";

export interface AttentionItem {
  /** Stable across renders/sessions, `${kind}:${entityId}`. */
  id: string;
  kind: AttentionKind;
  urgency: AttentionUrgency;
  entityId: string;
  /** What this is, in the user's terms, e.g. "Change AC filter". */
  title: string;
  /** Why it is here, stated as fact, e.g. "Last done 4 months ago, usually every 3 months". */
  detail: string;
  /**
   * The object this concerns, when there is one. Null means there is
   * nowhere useful to go: the row carries its own actions and Home is
   * already the only place it lives, so it is not a link to itself.
   */
  href: string | null;
}

/** How far ahead a warranty expiry surfaces as worth a look before it lapses. */
const WARRANTY_EXPIRING_SOON_DAYS = 30;

function addDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(dateIso: string, now: Date): number {
  const target = new Date(`${dateIso}T00:00:00Z`);
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** True while a stored snoozedUntil timestamp is still in the future, false once it lapses (or was never set). */
function isSnoozed(snoozedUntil: string | null, now: Date): boolean {
  return snoozedUntil !== null && new Date(snoozedUntil).getTime() > now.getTime();
}

/**
 * Urgency, computed from what is actually known.
 *
 * Two deliberate properties, both reactions to how the previous version
 * behaved:
 *
 * 1. Lateness is measured in *intervals*, not raw days. Thirty days past
 *    a monthly job is a full cycle missed; thirty days past an annual
 *    one is barely anything. Counting raw days made a long-ignored
 *    trivial task outrank a safety job that had just come due.
 *
 * 2. Consequence dominates. A dryer vent that is exactly due should beat
 *    a detergent drawer that is a year late, because one is a fire risk
 *    and the other is not. Lateness is capped at two intervals so an
 *    ignored item cannot climb forever and crowd out everything else.
 */
export interface UrgencyFactors {
  /** How far past due, as a multiple of the item's own interval. 0 when not yet due. */
  intervalsLate: number;
  /** How bad it is to keep putting off: 0 cosmetic, 1 costly over time, 2 safety or serious damage. */
  consequence: CareConsequence;
  /** What it takes to do: 0 minutes, 1 an afternoon, 2 booking somebody. */
  effort: CareEffort;
  /** Money at stake: 0 low, 1 medium, 2 high. */
  cost: 0 | 1 | 2;
}

const URGENCY_THRESHOLD = 2.5;
const MAX_INTERVALS_LATE = 2;

export function scoreAttentionUrgency(factors: UrgencyFactors): AttentionUrgency {
  const lateness = Math.min(Math.max(factors.intervalsLate, 0), MAX_INTERVALS_LATE);
  const score = factors.consequence * 2.5 + lateness * 1 + factors.cost - factors.effort * 0.5;
  return score >= URGENCY_THRESHOLD ? "soon" : "canWait";
}

/** Sort key so the list is ordered, not just banded. Higher surfaces first. */
function rankOf(factors: UrgencyFactors): number {
  const lateness = Math.min(Math.max(factors.intervalsLate, 0), MAX_INTERVALS_LATE);
  return factors.consequence * 2.5 + lateness * 1 + factors.cost - factors.effort * 0.5;
}

const PROBLEM_SEVERITY_CONSEQUENCE: Record<Problem["severity"], CareConsequence> = {
  minor: 0,
  moderate: 1,
  urgent: 2,
};

const PROBLEM_EFFORT_SCORE: Record<Problem["effort"], CareEffort> = {
  quick: 0,
  moderate: 1,
  bigJob: 2,
};

function problemCostBucket(estimatedCostMinorUnits: number | null): 0 | 1 | 2 {
  if (estimatedCostMinorUnits === null) return 0;
  if (estimatedCostMinorUnits > 50_000) return 2;
  if (estimatedCostMinorUnits > 10_000) return 1;
  return 0;
}

/**
 * What a task's care is worth, from the curated template it came from.
 * Falls back to an exact name match for tasks that predate the link, and
 * then to neutral factors. Neutral means "we genuinely do not know",
 * never an invented severity.
 */
function careFactorsFor(task: MaintenanceTask): { consequence: CareConsequence; effort: CareEffort } {
  const template = findCareTemplate(task.careTemplateId) ?? findCareTemplateByTaskName(task.name);
  if (!template) return { consequence: 1, effort: 1 };
  return { consequence: template.consequence, effort: template.effort };
}

/** The one place an item's own surface is addressed, so the route shape lives in a single line. */
export function itemHref(itemId: string): string {
  return `/app/products/home-management-companion/things/${itemId}`;
}

export interface AttentionInputs {
  homeItems: HomeItem[];
  maintenanceTasks: MaintenanceTask[];
  problems: Problem[];
}

/**
 * Deterministic: every item traces to a stored date on a real row. A
 * task that has never been logged is treated as due now, since its last
 * completion is unknown rather than assumed.
 *
 * Returned in rank order, most deserving of attention first.
 */
export function deriveAttentionItems(inputs: AttentionInputs, now: Date = new Date()): AttentionItem[] {
  const scored: Array<{ item: AttentionItem; rank: number }> = [];

  for (const task of inputs.maintenanceTasks) {
    if (task.status === "archived") continue;
    if (isSnoozed(task.snoozedUntil, now)) continue;
    const nextDueIso = task.lastDoneAt ? addDays(task.lastDoneAt, task.cadenceDays) : task.createdAt.slice(0, 10);
    const days = daysUntil(nextDueIso, now);
    if (days > 0) continue;

    const { consequence, effort } = careFactorsFor(task);
    const factors: UrgencyFactors = {
      intervalsLate: -days / Math.max(task.cadenceDays, 1),
      consequence,
      effort,
      cost: 0,
    };

    scored.push({
      rank: rankOf(factors),
      item: {
        id: `maintenanceDue:${task.id}`,
        kind: "maintenanceDue",
        urgency: scoreAttentionUrgency(factors),
        entityId: task.id,
        title: task.name,
        detail: describeCareStatus(task.lastDoneAt, task.cadenceDays, now),
        href: task.applianceId ? itemHref(task.applianceId) : null,
      },
    });
  }

  for (const item of inputs.homeItems) {
    if (item.status === "archived") continue;
    if (!item.warrantyExpiresAt) continue;
    const days = daysUntil(item.warrantyExpiresAt, now);
    if (days > WARRANTY_EXPIRING_SOON_DAYS) continue;

    // A warranty date is information, not a job: nothing is at risk and
    // there is nothing to do, so it never competes with real care.
    const factors: UrgencyFactors = { intervalsLate: 0, consequence: 0, effort: 0, cost: 0 };

    scored.push({
      rank: rankOf(factors),
      item: {
        id: `warrantyExpiring:${item.id}`,
        kind: "warrantyExpiring",
        urgency: scoreAttentionUrgency(factors),
        entityId: item.id,
        title: item.name,
        detail: describeWarranty(item.warrantyExpiresAt, now),
        href: itemHref(item.id),
      },
    });
  }

  for (const problem of inputs.problems) {
    if (problem.status === "archived") continue;
    if (problem.resolutionStatus === "resolved") continue;
    if (isSnoozed(problem.snoozedUntil, now)) continue;

    const factors: UrgencyFactors = {
      intervalsLate: 0,
      consequence: PROBLEM_SEVERITY_CONSEQUENCE[problem.severity],
      effort: PROBLEM_EFFORT_SCORE[problem.effort],
      cost: problemCostBucket(problem.estimatedCostMinorUnits),
    };

    scored.push({
      rank: rankOf(factors),
      item: {
        id: `problem:${problem.id}`,
        kind: "problem",
        urgency: scoreAttentionUrgency(factors),
        entityId: problem.id,
        title: problem.title,
        detail: problem.description ?? "Reported as a problem",
        href: problem.thingId ? itemHref(problem.thingId) : null,
      },
    });
  }

  // Something broken outranks something merely scheduled when the two
  // score about the same. "About" matters: a task one day into a
  // 90-day cycle scores a hundredth of a point above an equivalent
  // problem, which is not a real difference in how much it deserves
  // someone's attention, so anything inside this margin is treated as a
  // tie and broken by kind instead.
  const TIE_MARGIN = 0.25;
  const kindWeight: Record<AttentionKind, number> = { problem: 2, maintenanceDue: 1, warrantyExpiring: 0 };
  return scored
    .sort((a, b) => {
      if (Math.abs(a.rank - b.rank) < TIE_MARGIN) return kindWeight[b.item.kind] - kindWeight[a.item.kind];
      return b.rank - a.rank;
    })
    .map((entry) => entry.item);
}

/* ------------------------------------------------------------------ *
 * Home state
 * ------------------------------------------------------------------ */

/** Care that is not due yet but is close enough to be worth knowing about. */
const COMING_UP_HORIZON_DAYS = 30;
/** How far back "recently handled" reaches. */
const RECENTLY_HANDLED_DAYS = 30;
/** Most items shown in a band before the rest are folded away. A wall of rows says the same as saying nothing. */
export const HOME_BAND_LIMIT = 4;

export interface UpcomingItem {
  id: string;
  title: string;
  detail: string;
  href: string | null;
}

export interface HandledItem {
  id: string;
  title: string;
  when: string;
}

export interface HomeStateInputs extends AttentionInputs {
  /** Completed care, used only for "recently handled". */
  recentEvents: MaintenanceLogEntry[];
}

/**
 * Everything the Home surface renders, in one derivation.
 *
 * Home is the only place any of this appears, so this function decides
 * what matters rather than leaving the person to compare separate
 * screens. The bands read as a single narrative: what is wrong, what is
 * worth doing, what is coming, what was handled, and then a plain
 * statement that the rest is fine.
 */
export interface HomeState {
  somethingWrong: AttentionItem[];
  worthTakingCareOf: AttentionItem[];
  comingUp: UpcomingItem[];
  recentlyHandled: HandledItem[];
  /** Active records not currently surfaced. Only ever phrased as reassurance, never as a statistic. */
  restUnderControl: number;
  /** True when the home has nothing recorded at all, which is a different screen from "nothing is due". */
  nothingTracked: boolean;
}

export function deriveHomeState(inputs: HomeStateInputs, now: Date = new Date()): HomeState {
  const attention = deriveAttentionItems(inputs, now);
  const somethingWrong = attention.filter((item) => item.kind === "problem");
  const worthTakingCareOf = attention.filter((item) => item.kind !== "problem");

  const surfacedTaskIds = new Set(attention.filter((i) => i.kind === "maintenanceDue").map((i) => i.entityId));

  const comingUp: UpcomingItem[] = [];
  for (const task of inputs.maintenanceTasks) {
    if (task.status === "archived") continue;
    if (surfacedTaskIds.has(task.id)) continue;
    if (!task.lastDoneAt) continue;
    const days = daysUntil(addDays(task.lastDoneAt, task.cadenceDays), now);
    if (days <= 0 || days > COMING_UP_HORIZON_DAYS) continue;
    comingUp.push({
      id: `upcoming:${task.id}`,
      title: task.name,
      detail: `Due ${describeUpcoming(days)}`,
      href: task.applianceId ? itemHref(task.applianceId) : null,
    });
  }
  comingUp.sort((a, b) => a.detail.localeCompare(b.detail));

  const recentlyHandled: HandledItem[] = inputs.recentEvents
    .filter((entry) => entry.status !== "archived" && daysBetween(entry.performedAt, now) <= RECENTLY_HANDLED_DAYS)
    .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
    .map((entry) => ({
      id: `handled:${entry.id}`,
      title: entry.description,
      when: describeElapsed(daysBetween(entry.performedAt, now)),
    }));

  const activeItems = inputs.homeItems.filter((i) => i.status !== "archived").length;
  const activeTasks = inputs.maintenanceTasks.filter((t) => t.status !== "archived").length;
  const surfaced = attention.length + comingUp.length;

  return {
    somethingWrong,
    worthTakingCareOf,
    comingUp,
    recentlyHandled,
    restUnderControl: Math.max(0, activeItems + activeTasks - surfaced),
    nothingTracked: activeItems === 0 && activeTasks === 0 && inputs.problems.length === 0,
  };
}
