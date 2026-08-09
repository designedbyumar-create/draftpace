import { describe, expect, it } from "vitest";
import {
  progressPercent,
  monthlyContributionNeededMinorUnits,
  summarizeSavings,
  resolveDominantAction,
  describeSavingsIncompleteness,
} from "./savingsLogic";
import type { SavingsGoal } from "../../state";

const NOW = new Date("2026-08-08T00:00:00Z");

function goal(overrides: Partial<SavingsGoal> = {}): SavingsGoal {
  return {
    id: "goal-1",
    name: "Emergency fund",
    type: "emergencyFund",
    targetAmountMinorUnits: 1000000,
    savedAmountMinorUnits: 250000,
    targetDate: "2027-02-08",
    recurring: false,
    currency: "USD",
    linkedAccountId: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("progressPercent", () => {
  it("calculates a straightforward percentage", () => {
    expect(progressPercent(goal({ savedAmountMinorUnits: 250000, targetAmountMinorUnits: 1000000 }))).toBe(25);
  });

  it("clamps at 100 even if saved exceeds target", () => {
    expect(progressPercent(goal({ savedAmountMinorUnits: 1200000, targetAmountMinorUnits: 1000000 }))).toBe(100);
  });

  it("returns null rather than dividing by zero when the target is zero", () => {
    expect(progressPercent(goal({ targetAmountMinorUnits: 0 }))).toBeNull();
  });
});

describe("monthlyContributionNeededMinorUnits", () => {
  it("never invents a figure when the target date is missing", () => {
    expect(monthlyContributionNeededMinorUnits(goal({ targetDate: null }), NOW)).toBeNull();
  });

  it("calculates a real monthly figure when there's a genuine future target date", () => {
    const result = monthlyContributionNeededMinorUnits(
      goal({ savedAmountMinorUnits: 0, targetAmountMinorUnits: 600000, targetDate: "2026-12-08" }),
      NOW
    );
    expect(result).not.toBeNull();
    expect(result).toBeGreaterThan(0);
  });

  it("returns 0 once the goal is already fully funded", () => {
    expect(monthlyContributionNeededMinorUnits(goal({ savedAmountMinorUnits: 1000000, targetAmountMinorUnits: 1000000 }), NOW)).toBe(0);
  });

  it("returns null rather than a wild figure when less than a month remains", () => {
    expect(monthlyContributionNeededMinorUnits(goal({ targetDate: "2026-08-10" }), NOW)).toBeNull();
  });
});

describe("summarizeSavings", () => {
  it("totals saved and target amounts, excludes archived, counts missing target dates", () => {
    const summary = summarizeSavings([
      goal({ id: "a", savedAmountMinorUnits: 250000, targetAmountMinorUnits: 1000000 }),
      goal({ id: "b", savedAmountMinorUnits: 50000, targetAmountMinorUnits: 200000, targetDate: null }),
      goal({ id: "c", savedAmountMinorUnits: 999999, status: "archived" }),
    ]);
    expect(summary.activeCount).toBe(2);
    expect(summary.totalSavedMinorUnits).toBe(300000);
    expect(summary.totalTargetMinorUnits).toBe(1200000);
    expect(summary.missingTargetDateCount).toBe(1);
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first goal when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("suggests adding a target date for the earliest-added goal missing one", () => {
    const older = goal({ id: "older", targetDate: null, createdAt: "2026-08-01T00:00:00Z" });
    const newer = goal({ id: "newer", targetDate: null, createdAt: "2026-08-05T00:00:00Z" });
    expect(resolveDominantAction([newer, older])).toMatchObject({ kind: "add-target-date", goal: { id: "older" } });
  });

  it("returns null once every goal has a target date", () => {
    expect(resolveDominantAction([goal()])).toBeNull();
  });
});

describe("describeSavingsIncompleteness", () => {
  it("flags a goal missing a target date", () => {
    expect(describeSavingsIncompleteness(goal({ targetDate: null }))).toMatch(/target date/);
  });

  it("returns null for a goal with a target date", () => {
    expect(describeSavingsIncompleteness(goal())).toBeNull();
  });
});
