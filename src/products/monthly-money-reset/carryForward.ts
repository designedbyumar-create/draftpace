import { createEmptyState, type CarryForwardChoices, type MonthlyMoneyResetState } from "./state";

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
    startingAvailableBalanceMinorUnits: 0,
    preferences: choices.checkInPreference ? previous.preferences : next.preferences,
  };
}
