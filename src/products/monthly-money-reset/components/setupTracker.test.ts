import { describe, expect, it } from "vitest";
import { STEPS, isTrackerStepComplete } from "./SetupModule";
import { createEmptyState } from "../state";

function baseState() {
  return createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
}

describe("Setup tracker: STEPS", () => {
  it("always has exactly five steps, ending on Confirm as step 5", () => {
    expect(STEPS).toHaveLength(5);
    expect(STEPS[4]).toEqual({ step: 5, title: "Review", short: "Confirm" });
  });

  it("numbers every step sequentially with no gaps, so the tracker can never skip or lose one", () => {
    expect(STEPS.map((item) => item.step)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("isTrackerStepComplete", () => {
  it("ties steps 1-4 to real completeness, not just having been visited", () => {
    const state = baseState();
    expect(isTrackerStepComplete(state, 1)).toBe(false);
    const withBalance = { ...state, startingAvailableBalanceMinorUnits: 500_00 };
    expect(isTrackerStepComplete(withBalance, 1)).toBe(true);
  });

  it("step 5 (Confirm) is complete only once setup.completedAt is actually set", () => {
    const state = baseState();
    expect(isTrackerStepComplete(state, 5)).toBe(false);
    const finished = { ...state, setup: { ...state.setup, completedAt: new Date().toISOString() } };
    expect(isTrackerStepComplete(finished, 5)).toBe(true);
  });
});
