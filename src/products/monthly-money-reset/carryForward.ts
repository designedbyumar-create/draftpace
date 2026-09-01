import { computeSafeToSpend } from "./calculations";
import {
  createEmptyState,
  type CarryForwardChoices,
  type MonthlyMoneyResetState,
  type StartingBalanceChoice,
} from "./state";

/**
 * "suggested" is always computed here, from the actual closing state, right
 * before the next cycle is built — never a value captured earlier in the
 * close flow and passed through, which could go stale between when the
 * closing summary was shown and when the user actually confirms.
 */
function resolveStartingBalanceMinorUnits(previous: MonthlyMoneyResetState, choice: StartingBalanceChoice): number {
  switch (choice.mode) {
    case "suggested":
      return computeSafeToSpend(previous).safeToSpend;
    case "fresh":
      return 0;
    case "custom":
    case "actual":
      return choice.amountMinorUnits ?? 0;
  }
}

/**
 * Builds the next cycle's starting state from a closed cycle, applying only
 * the carry-forward choices the user made. Never copies sensitive or
 * outdated values silently — recurring income/bills come back reset to
 * "expected"/"upcoming" (not still marked paid/received from last month),
 * and one-off spending, activity, and check-ins never carry forward at all.
 */
export function buildNextCycleState(params: {
  previous: MonthlyMoneyResetState;
  previousInstanceId: string;
  cycleKey: string;
  cycleLabel: string;
  choices: CarryForwardChoices;
}): MonthlyMoneyResetState {
  const { previous, previousInstanceId, cycleKey, cycleLabel, choices } = params;
  const next = createEmptyState({ cycleKey, cycleLabel, currency: previous.currency });

  return {
    ...next,
    cycle: { ...next.cycle, previousInstanceId },
    income: choices.recurringIncome
      ? previous.income
          .filter((entry) => entry.recurring)
          .map((entry) => ({ ...entry, status: "expected" as const, receivedDate: undefined }))
      : [],
    bills: choices.recurringBills
      ? previous.bills.map((bill) => ({ ...bill, status: "upcoming" as const, paidDate: undefined }))
      : [],
    spendingGroups: choices.spendingGroups ? previous.spendingGroups : [],
    protectedReserve: choices.reservePreference ? previous.protectedReserve : [],
    startingAvailableBalanceMinorUnits: resolveStartingBalanceMinorUnits(previous, choices.startingBalance),
    preferences: choices.checkInPreference ? previous.preferences : next.preferences,
  };
}
