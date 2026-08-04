import type { MonthlyMoneyResetState, NextAction, Preferences } from "./state";
import type { SafeToSpendBreakdown } from "./calculations";

/**
 * Rule-based next-action selection, checked in priority order — the first
 * rule that matches wins. No fake urgency: a rule only fires when there's a
 * genuine reason (money is negative, something is overdue, nothing's been
 * recorded in a while), and "No action needed right now" is a real, valid
 * outcome, not a fallback that's embarrassing to show.
 *
 * Each rule carries an urgency tier so the UI can give critical, attention,
 * and routine matters different visual weight instead of presenting every
 * result identically (see the MMR redesign plan, 2026-08-04, "Next-action
 * urgency model"). A protected bill due soon is deliberately never a rule
 * match here — it needs nothing from the user, so flagging it as something
 * to "review" would be exactly the manufactured urgency this file's own
 * original design already promised not to create.
 *
 * A dismissed recommendation (state.nextAction.dismissedAt set, matching
 * this rule's id) is skipped so dismissing it doesn't just bring it right
 * back on the next render — the next-highest-priority rule takes over
 * instead.
 */

export type NextActionUrgency = "critical" | "attention" | "routine";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

function isDismissed(state: MonthlyMoneyResetState, id: string): boolean {
  return state.nextAction?.id === id && Boolean(state.nextAction.dismissedAt);
}

export function computeNextAction(
  state: MonthlyMoneyResetState,
  breakdown: SafeToSpendBreakdown,
  now: Date = new Date()
): (NextAction & { urgency: NextActionUrgency }) | null {
  const nowTime = now.getTime();

  if (breakdown.safeToSpend < 0 && !isDismissed(state, "negative-safe-to-spend")) {
    return {
      id: "negative-safe-to-spend",
      label: "Review your spending",
      reason: "Safe-to-Spend is negative. One flexible category is worth a look.",
      destination: "workspace",
      urgency: "critical",
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
      urgency: "attention",
    };
  }

  // Protected bills are deliberately excluded: they need nothing from the
  // user before their due date, so surfacing them here would manufacture a
  // task where none exists.
  const billDueSoon = state.bills.find((bill) => {
    if (bill.protected) return false;
    if (bill.status !== "upcoming" && bill.status !== "changed") return false;
    if (!bill.dueDate) return false;
    const dueTime = new Date(bill.dueDate).getTime();
    return dueTime - nowTime <= THREE_DAYS_MS && dueTime - nowTime >= -THREE_DAYS_MS;
  });
  if (billDueSoon && !isDismissed(state, `bill-${billDueSoon.id}`)) {
    return {
      id: `bill-${billDueSoon.id}`,
      label: "Review a bill due soon",
      reason: `${billDueSoon.name || "A bill"} is due ${billDueSoon.dueDate} and isn't protected yet.`,
      destination: "workspace",
      urgency: "attention",
    };
  }

  const lastActivity = new Date(state.lastMeaningfulActivityAt).getTime();
  if (nowTime - lastActivity > THREE_DAYS_MS && !isDismissed(state, "stale-activity")) {
    return {
      id: "stale-activity",
      label: "Record spending since your last update",
      reason: "Nothing's been added in a few days, so your Safe-to-Spend may be behind what's actually happened.",
      destination: "workspace",
      urgency: "routine",
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
      urgency: "routine",
    };
  }

  return null;
}

const CHECK_IN_DAY_INDEX: Record<Preferences["checkInDay"], number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/**
 * The next occurrence of the user's chosen check-in day, strictly after
 * today — reaching the all-clear state already implies this week's
 * check-in is accounted for (either done, or its own reminder was
 * dismissed), so "next" always means a day still ahead, never today.
 */
export function nextCheckInDate(checkInDay: Preferences["checkInDay"], now: Date = new Date()): Date {
  const targetIndex = CHECK_IN_DAY_INDEX[checkInDay];
  const todayIndex = now.getUTCDay();
  const daysUntil = ((targetIndex - todayIndex + 7) % 7) || 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil));
}

const CHECK_IN_DAY_LABEL: Record<Preferences["checkInDay"], string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export function checkInDayLabel(checkInDay: Preferences["checkInDay"]): string {
  return CHECK_IN_DAY_LABEL[checkInDay];
}
