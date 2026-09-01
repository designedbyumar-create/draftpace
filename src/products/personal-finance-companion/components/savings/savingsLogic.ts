import type { SavingsGoal } from "../../state";

/** Null when the target amount is zero — there is nothing meaningful to divide by, not 0% or 100%. */
export function progressPercent(goal: SavingsGoal): number | null {
  if (goal.targetAmountMinorUnits === 0) return null;
  const raw = (goal.savedAmountMinorUnits / goal.targetAmountMinorUnits) * 100;
  return Math.max(0, Math.min(100, raw));
}

function monthsBetween(now: Date, targetDateIso: string): number {
  const target = new Date(`${targetDateIso}T00:00:00Z`);
  const days = (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return days / 30.44;
}

/**
 * Deterministic-only: only ever returns a figure when there is a real
 * target date at least a full month out and money still left to save.
 * Never invents a "you should be saving $X/month" number when the target
 * date is missing — that would be a guess dressed up as a calculation.
 */
export function monthlyContributionNeededMinorUnits(goal: SavingsGoal, now: Date = new Date()): number | null {
  if (!goal.targetDate) return null;
  const remaining = goal.targetAmountMinorUnits - goal.savedAmountMinorUnits;
  if (remaining <= 0) return 0;
  const months = monthsBetween(now, goal.targetDate);
  if (months < 1) return null;
  return Math.ceil(remaining / months);
}

export type SavingsSummary = {
  totalSavedMinorUnits: number;
  totalTargetMinorUnits: number;
  activeCount: number;
  missingTargetDateCount: number;
};

export function summarizeSavings(goals: SavingsGoal[]): SavingsSummary {
  const active = goals.filter((g) => g.status !== "archived");
  let totalSavedMinorUnits = 0;
  let totalTargetMinorUnits = 0;
  let missingTargetDateCount = 0;

  for (const goal of active) {
    totalSavedMinorUnits += goal.savedAmountMinorUnits;
    totalTargetMinorUnits += goal.targetAmountMinorUnits;
    if (!goal.targetDate) missingTargetDateCount += 1;
  }

  return { totalSavedMinorUnits, totalTargetMinorUnits, activeCount: active.length, missingTargetDateCount };
}

export type SavingsDominantAction =
  | { kind: "add-first" }
  | { kind: "add-target-date"; goal: SavingsGoal }
  | null;

export function resolveDominantAction(goals: SavingsGoal[]): SavingsDominantAction {
  const active = goals.filter((g) => g.status !== "archived");
  if (active.length === 0) return { kind: "add-first" };

  const missingDate = active.filter((g) => !g.targetDate).sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  if (missingDate.length > 0) return { kind: "add-target-date", goal: missingDate[0] };
  return null;
}

export function describeSavingsIncompleteness(goal: SavingsGoal): string | null {
  if (!goal.targetDate) {
    return "This goal doesn't have a target date. Add one so Draftpace can calculate what to contribute each month.";
  }
  return null;
}
