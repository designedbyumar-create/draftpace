import type { MonthlyMoneyResetState, NextAction } from "./state";
import type { SafeToSpendBreakdown } from "./calculations";

/**
 * Rule-based next-action selection, checked in priority order — the first
 * rule that matches wins. No fake urgency: a rule only fires when there's a
 * genuine reason (money is negative, something is overdue, nothing's been
 * recorded in a while), and "No action needed right now" is a real, valid
 * outcome, not a fallback that's embarrassing to show.
 *
 * A dismissed recommendation (state.nextAction.dismissedAt set, matching
 * this rule's id) is skipped so dismissing it doesn't just bring it right
 * back on the next render — the next-highest-priority rule takes over
 * instead.
 */

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function isDismissed(state: MonthlyMoneyResetState, id: string): boolean {
  return state.nextAction?.id === id && Boolean(state.nextAction.dismissedAt);
}

export function computeNextAction(
  state: MonthlyMoneyResetState,
  breakdown: SafeToSpendBreakdown,
  now: Date = new Date()
): NextAction | null {
  const nowTime = now.getTime();

  if (breakdown.safeToSpend < 0 && !isDismissed(state, "negative-safe-to-spend")) {
    return {
      id: "negative-safe-to-spend",
      label: "Review your spending",
      reason: "Safe-to-Spend is negative. One flexible category is worth a look.",
      destination: "workspace",
    };
  }

  const overdueIncome = state.income.find(
    (entry) => entry.status === "expected" && entry.expectedDate && new Date(entry.expectedDate).getTime() < nowTime
  );
  if (overdueIncome && !isDismissed(state, `income-${overdueIncome.id}`)) {
    return {
      id: `income-${overdueIncome.id}`,
      label: "Confirm income that was expected",
      reason: `${overdueIncome.name || "An income source"} was expected on ${overdueIncome.expectedDate}. Mark it received once it's in.`,
      destination: "workspace",
    };
  }

  const billDueSoon = state.bills.find((bill) => {
    if (bill.status !== "upcoming" && bill.status !== "changed") return false;
    if (!bill.dueDate) return false;
    const dueTime = new Date(bill.dueDate).getTime();
    return dueTime - nowTime <= THREE_DAYS_MS && dueTime - nowTime >= -THREE_DAYS_MS;
  });
  if (billDueSoon && !isDismissed(state, `bill-${billDueSoon.id}`)) {
    return {
      id: `bill-${billDueSoon.id}`,
      label: "Review a bill due soon",
      reason: `${billDueSoon.name || "A bill"} is due ${billDueSoon.dueDate}.`,
      destination: "workspace",
    };
  }

  const lastActivity = new Date(state.lastMeaningfulActivityAt).getTime();
  if (nowTime - lastActivity > THREE_DAYS_MS && !isDismissed(state, "stale-activity")) {
    return {
      id: "stale-activity",
      label: "Record spending since your last update",
      reason: "Nothing's been added in a few days, so your Safe-to-Spend may be behind what's actually happened.",
      destination: "workspace",
    };
  }

  // UTC throughout, matching cycle.ts — deterministic regardless of server timezone.
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay())
  );
  const checkedInThisWeek = state.checkIns.some((checkIn) => new Date(checkIn.date).getTime() >= weekStart.getTime());
  if (!checkedInThisWeek && !isDismissed(state, "weekly-check-in")) {
    return {
      id: "weekly-check-in",
      label: "Complete this week's check-in",
      reason: "A short check-in keeps this month's picture accurate.",
      destination: "workspace",
    };
  }

  return null;
}
