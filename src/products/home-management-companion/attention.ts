import type { HomeItem, MaintenanceTask, Problem } from "./state";
import { findCareTemplate, findCareTemplateByTaskName, type CareConsequence, type CareEffort } from "./homeKnowledge";
import { describeCareStatus, describeWarranty } from "./homeVoice";

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
  href: string;
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
        href: "/app/products/home-management-companion/maintenance",
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
        href: `/app/products/home-management-companion/things/${item.id}`,
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
        // Deep-links to the affected object when there is one. There is
        // no dedicated problem surface yet (it lands with the reporting
        // flow in the next phase), so an unattached problem points at
        // Today rather than at the /problems route that never existed.
        href: problem.thingId
          ? `/app/products/home-management-companion/things/${problem.thingId}`
          : "/app/products/home-management-companion/workspace",
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
