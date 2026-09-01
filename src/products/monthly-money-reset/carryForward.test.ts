import { describe, expect, it } from "vitest";
import { buildNextCycleState } from "./carryForward";
import { createEmptyState, type CarryForwardChoices } from "./state";

const ALL_ON: CarryForwardChoices = {
  recurringIncome: true,
  recurringBills: true,
  spendingGroups: true,
  reservePreference: true,
  checkInPreference: true,
  startingBalance: { mode: "fresh" },
};

const ALL_OFF: CarryForwardChoices = {
  recurringIncome: false,
  recurringBills: false,
  spendingGroups: false,
  reservePreference: false,
  checkInPreference: false,
  startingBalance: { mode: "fresh" },
};

function previousState() {
  const base = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
  return {
    ...base,
    income: [
      { id: "inc-1", name: "Paycheck", amountMinorUnits: 500_00, status: "received" as const, recurring: true, receivedDate: "2026-08-05" },
      { id: "inc-2", name: "One-off gift", amountMinorUnits: 50_00, status: "received" as const, recurring: false, receivedDate: "2026-08-10" },
    ],
    bills: [
      { id: "bill-1", name: "Rent", amountMinorUnits: 1200_00, category: "Housing", protected: true, status: "paid" as const, paidDate: "2026-08-01" },
    ],
    spendingGroups: [{ id: "grp-1", name: "Everyday", kind: "flexible" as const }],
    protectedReserve: [{ id: "res-1", label: "Buffer", amountMinorUnits: 200_00 }],
    preferences: { checkInDay: "friday" as const, tone: "direct" as const, privacyBlur: true },
  };
}

describe("buildNextCycleState", () => {
  it("only carries forward recurring income, reset to expected with no received date", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.income).toHaveLength(1);
    expect(next.income[0].id).toBe("inc-1");
    expect(next.income[0].status).toBe("expected");
    expect(next.income[0].receivedDate).toBeUndefined();
  });

  it("resets carried-forward bills to upcoming with no paid date", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.bills).toHaveLength(1);
    expect(next.bills[0].status).toBe("upcoming");
    expect(next.bills[0].paidDate).toBeUndefined();
  });

  it("carries forward spending groups and reserve preference when chosen", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.spendingGroups).toHaveLength(1);
    expect(next.protectedReserve).toHaveLength(1);
    expect(next.preferences.checkInDay).toBe("friday");
  });

  it("carries nothing forward when every choice is declined", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_OFF,
    });
    expect(next.income).toHaveLength(0);
    expect(next.bills).toHaveLength(0);
    expect(next.spendingGroups).toHaveLength(0);
    expect(next.protectedReserve).toHaveLength(0);
    expect(next.preferences.checkInDay).toBe("sunday");
  });

  it("never carries forward one-off (non-recurring) income", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.income.some((entry) => entry.id === "inc-2")).toBe(false);
  });

  it("never carries forward activity or check-ins, regardless of the starting balance choice", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.activity).toHaveLength(0);
    expect(next.checkIns).toHaveLength(0);
  });

  it("links the new cycle to the prior instance", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: ALL_ON,
    });
    expect(next.cycle.previousInstanceId).toBe("instance-1");
  });
});

describe("buildNextCycleState: starting balance carry-forward", () => {
  it("'fresh' produces exactly zero", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: { ...ALL_ON, startingBalance: { mode: "fresh" } },
    });
    expect(next.startingAvailableBalanceMinorUnits).toBe(0);
  });

  it("'suggested' uses the previous cycle's actual closing Safe-to-Spend, computed fresh", () => {
    const previous = previousState();
    const expected = 500_00 + 50_00 - 1200_00 - 200_00; // income received (500+50) - bill payments (Rent, paid) - reserve held; see calculations.ts
    const next = buildNextCycleState({
      previous,
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: { ...ALL_ON, startingBalance: { mode: "suggested" } },
    });
    expect(next.startingAvailableBalanceMinorUnits).toBe(expected);
  });

  it("'custom' preserves the entered amount exactly", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: { ...ALL_ON, startingBalance: { mode: "custom", amountMinorUnits: 777_00 } },
    });
    expect(next.startingAvailableBalanceMinorUnits).toBe(777_00);
  });

  it("'actual' preserves the entered amount exactly", () => {
    const next = buildNextCycleState({
      previous: previousState(),
      previousInstanceId: "instance-1",
      cycleKey: "2026-09",
      cycleLabel: "September 2026",
      choices: { ...ALL_ON, startingBalance: { mode: "actual", amountMinorUnits: 42_00 } },
    });
    expect(next.startingAvailableBalanceMinorUnits).toBe(42_00);
  });
});
