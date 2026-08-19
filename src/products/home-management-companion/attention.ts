import type { Thing, MaintenanceTask, Problem } from "./state";

/**
 * The shared Attention domain: one deterministic derivation of "what needs
 * a look", built from the same stored dates the Records sections
 * themselves show, never a second opinion or an inferred guess. Powers
 * both the Attention inbox and the Today workspace snapshot from a single
 * source, matching PFC's own attention.ts discipline.
 */

export type AttentionKind = "maintenanceDue" | "warrantyExpiring" | "problem";
export type AttentionUrgency = "needsResolution" | "worthAWhile";

export interface AttentionItem {
  /** Stable across renders/sessions, `${kind}:${entityId}`. */
  id: string;
  kind: AttentionKind;
  urgency: AttentionUrgency;
  entityId: string;
  message: string;
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
 * The one place urgency gets decided, real and computed rather than
 * hardcoded per kind. Only reads factors a caller can honestly derive
 * from a stored field, never a fabricated guess: maintenance/warranty
 * items don't carry a severity/cost of their own, so their callers pass
 * neutral factors and let overdueDays alone drive the score (which
 * reproduces this function's own prior hardcoded behavior exactly);
 * Problems pass their real stored severity/effort/cost.
 */
export interface UrgencyFactors {
  /** Days past due, 0 or negative when not yet due. */
  overdueDays: number;
  /** How bad it is to keep ignoring this: 0 low, 1 medium, 2 high. */
  consequence: 0 | 1 | 2;
  /** How much work it takes to address: 0 low, 1 medium, 2 high. */
  effort: 0 | 1 | 2;
  /** Cost impact: 0 low, 1 medium, 2 high. */
  cost: 0 | 1 | 2;
}

const URGENCY_THRESHOLD = 2;

export function scoreAttentionUrgency(factors: UrgencyFactors): AttentionUrgency {
  const score = Math.max(0, factors.overdueDays) * 0.5 + factors.consequence * 2 + factors.cost - factors.effort * 0.5;
  return score >= URGENCY_THRESHOLD ? "needsResolution" : "worthAWhile";
}

const PROBLEM_SEVERITY_CONSEQUENCE: Record<Problem["severity"], 0 | 1 | 2> = {
  minor: 0,
  moderate: 1,
  urgent: 2,
};

const PROBLEM_EFFORT_SCORE: Record<Problem["effort"], 0 | 1 | 2> = {
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

export interface AttentionInputs {
  things: Thing[];
  maintenanceTasks: MaintenanceTask[];
  problems: Problem[];
}

/**
 * Deterministic: every item traces to a stored date on a real record, and
 * a task that has never been logged is treated as due right away (its
 * "last done" is unknown, not assumed) rather than given a free pass
 * until some arbitrary first deadline.
 */
export function deriveAttentionItems(inputs: AttentionInputs, now: Date = new Date()): AttentionItem[] {
  const items: AttentionItem[] = [];

  for (const task of inputs.maintenanceTasks) {
    if (task.status === "archived") continue;
    if (isSnoozed(task.snoozedUntil, now)) continue;
    const nextDueIso = task.lastDoneAt ? addDays(task.lastDoneAt, task.cadenceDays) : task.createdAt.slice(0, 10);
    const days = daysUntil(nextDueIso, now);
    if (days > 0) continue;

    const overdueDays = -days;
    const message = !task.lastDoneAt
      ? `${task.name} has never been logged.`
      : overdueDays === 0
        ? `${task.name} is due today.`
        : `${task.name} is ${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue.`;

    // Neutral factors reproduce this loop's own prior hardcoded
    // "needsResolution" exactly: maintenance tasks don't carry a
    // consequence/cost of their own to score honestly, so overdueDays
    // alone (already >= 0 to have reached this point) drives it.
    const urgency = scoreAttentionUrgency({ overdueDays, consequence: 1, effort: 1, cost: 1 });

    items.push({
      id: `maintenanceDue:${task.id}`,
      kind: "maintenanceDue",
      urgency,
      entityId: task.id,
      message,
      href: "/app/products/home-management-companion/maintenance",
    });
  }

  for (const thing of inputs.things) {
    if (thing.status === "archived") continue;
    if (!thing.warrantyExpiresAt) continue;
    const days = daysUntil(thing.warrantyExpiresAt, now);
    if (days > WARRANTY_EXPIRING_SOON_DAYS) continue;

    const message =
      days < 0
        ? `${thing.name}'s warranty expired ${-days} ${-days === 1 ? "day" : "days"} ago.`
        : days === 0
          ? `${thing.name}'s warranty expires today.`
          : `${thing.name}'s warranty expires in ${days} ${days === 1 ? "day" : "days"}.`;

    // Neutral, zero-weight factors reproduce this loop's own prior
    // hardcoded "worthAWhile" exactly, a warranty date alone doesn't
    // carry a real severity/cost to score.
    const urgency = scoreAttentionUrgency({ overdueDays: 0, consequence: 0, effort: 0, cost: 0 });

    items.push({
      id: `warrantyExpiring:${thing.id}`,
      kind: "warrantyExpiring",
      urgency,
      entityId: thing.id,
      message,
      href: `/app/products/home-management-companion/things/${thing.id}`,
    });
  }

  for (const problem of inputs.problems) {
    if (problem.status === "archived") continue;
    if (problem.resolutionStatus === "resolved") continue;
    if (isSnoozed(problem.snoozedUntil, now)) continue;

    const urgency = scoreAttentionUrgency({
      overdueDays: 0,
      consequence: PROBLEM_SEVERITY_CONSEQUENCE[problem.severity],
      effort: PROBLEM_EFFORT_SCORE[problem.effort],
      cost: problemCostBucket(problem.estimatedCostMinorUnits),
    });

    items.push({
      id: `problem:${problem.id}`,
      kind: "problem",
      urgency,
      entityId: problem.id,
      message: problem.title,
      href: "/app/products/home-management-companion/problems",
    });
  }

  return items;
}
