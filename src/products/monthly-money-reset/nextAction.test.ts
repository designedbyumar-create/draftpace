import { describe, expect, it } from "vitest";
import { computeNextAction } from "./nextAction";
import { createEmptyState } from "./state";
import { computeSafeToSpend } from "./calculations";

const NOW = new Date("2026-08-15T12:00:00.000Z");

function stateWith(overrides: Partial<ReturnType<typeof createEmptyState>>) {
  const base = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
  return { ...base, lastMeaningfulActivityAt: NOW.toISOString(), ...overrides };
}

describe("computeNextAction", () => {
  it("recommends reviewing spending when Safe-to-Spend is negative", () => {
    const state = stateWith({ startingAvailableBalanceMinorUnits: -100_00 });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("negative-safe-to-spend");
  });

  it("recommends confirming overdue expected income before a due-soon bill", () => {
    const state = stateWith({
      income: [
        { id: "inc-1", name: "Freelance", amountMinorUnits: 100_00, status: "expected", recurring: false, expectedDate: "2026-08-10" },
      ],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("income-inc-1");
  });

  it("recommends reviewing a bill due within three days", () => {
    const state = stateWith({
      startingAvailableBalanceMinorUnits: 500_00,
      bills: [{ id: "bill-1", name: "Phone", amountMinorUnits: 50_00, category: "Utilities", protected: true, status: "upcoming", dueDate: "2026-08-17" }],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("bill-bill-1");
  });

  it("recommends recording spending after three days of no activity", () => {
    const state = stateWith({ lastMeaningfulActivityAt: "2026-08-10T00:00:00.000Z" });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("stale-activity");
  });

  it("recommends the weekly check-in when nothing else applies and none happened this week", () => {
    const state = stateWith({});
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("weekly-check-in");
  });

  it("returns null (no fake urgency) when everything is current", () => {
    const state = stateWith({
      checkIns: [
        {
          id: "check-1",
          date: "2026-08-10T00:00:00.000Z",
          incomeChanged: false,
          billsChanged: false,
          spendingMissing: false,
          reserveAdjusted: false,
          feelsAccurate: true,
        },
      ],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action).toBeNull();
  });

  it("skips a dismissed recommendation and falls through to the next rule", () => {
    const state = stateWith({
      startingAvailableBalanceMinorUnits: -50_00,
      nextAction: {
        id: "negative-safe-to-spend",
        label: "Review your spending",
        reason: "...",
        destination: "workspace",
        dismissedAt: NOW.toISOString(),
      },
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).not.toBe("negative-safe-to-spend");
  });
});
