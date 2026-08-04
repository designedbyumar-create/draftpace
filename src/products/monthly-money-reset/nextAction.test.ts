import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { checkInDayLabel, computeNextAction, nextCheckInDate } from "./nextAction";
import { createEmptyState } from "./state";
import { computeSafeToSpend } from "./calculations";

const NOW = new Date("2026-08-15T12:00:00.000Z"); // a Saturday

function stateWith(overrides: Partial<ReturnType<typeof createEmptyState>>) {
  const base = createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" });
  return { ...base, lastMeaningfulActivityAt: NOW.toISOString(), ...overrides };
}

describe("computeNextAction", () => {
  it("recommends reviewing spending when Safe-to-Spend is negative, tiered critical", () => {
    const state = stateWith({ startingAvailableBalanceMinorUnits: -100_00 });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("negative-safe-to-spend");
    expect(action?.urgency).toBe("critical");
  });

  it("recommends confirming overdue expected income before a due-soon bill, tiered attention", () => {
    const state = stateWith({
      income: [
        { id: "inc-1", name: "Freelance", amountMinorUnits: 100_00, status: "expected", recurring: false, expectedDate: "2026-08-10" },
      ],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("income-inc-1");
    expect(action?.urgency).toBe("attention");
  });

  /**
   * The protected-bill false-positive fix. A protected bill due soon needs
   * nothing from the user before its due date — flagging it as a next
   * action was manufactured urgency, the exact thing this file's rules
   * promise not to create. See the MMR redesign plan, 2026-08-04.
   */
  it("never recommends reviewing a protected bill due soon", () => {
    const state = stateWith({
      startingAvailableBalanceMinorUnits: 500_00,
      bills: [{ id: "bill-1", name: "Rent", amountMinorUnits: 50_00, category: "Housing", protected: true, status: "upcoming", dueDate: "2026-08-17" }],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).not.toBe("bill-bill-1");
    // Falls through to the next real rule (weekly check-in), not a false positive.
    expect(action?.id).toBe("weekly-check-in");
  });

  it("still recommends reviewing an unprotected bill due soon, tiered attention", () => {
    const state = stateWith({
      startingAvailableBalanceMinorUnits: 500_00,
      bills: [{ id: "bill-1", name: "Phone", amountMinorUnits: 50_00, category: "Utilities", protected: false, status: "upcoming", dueDate: "2026-08-17" }],
    });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("bill-bill-1");
    expect(action?.urgency).toBe("attention");
  });

  it("recommends recording spending after three days of no activity, tiered routine", () => {
    const state = stateWith({ lastMeaningfulActivityAt: "2026-08-10T00:00:00.000Z" });
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("stale-activity");
    expect(action?.urgency).toBe("routine");
  });

  it("recommends the weekly check-in when nothing else applies and none happened this week, tiered routine", () => {
    const state = stateWith({});
    const action = computeNextAction(state, computeSafeToSpend(state), NOW);
    expect(action?.id).toBe("weekly-check-in");
    expect(action?.urgency).toBe("routine");
  });

  it("returns null (no fake urgency, all-clear) when everything is current", () => {
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

  /**
   * Priority order is unchanged by the tiering/protected-bill work — a
   * regression here would mean a lower-priority rule silently started
   * winning over a higher-priority one that should still fire first.
   */
  it("preserves rule priority when multiple conditions are true at once", () => {
    const state = stateWith({
      startingAvailableBalanceMinorUnits: -100_00,
      income: [
        { id: "inc-1", name: "Freelance", amountMinorUnits: 100_00, status: "expected", recurring: false, expectedDate: "2026-08-10" },
      ],
      bills: [{ id: "bill-1", name: "Phone", amountMinorUnits: 50_00, category: "Utilities", protected: false, status: "upcoming", dueDate: "2026-08-17" }],
      lastMeaningfulActivityAt: "2026-08-01T00:00:00.000Z",
    });
    // Negative Safe-to-Spend must win over overdue income, a due-soon bill, and stale activity.
    expect(computeNextAction(state, computeSafeToSpend(state), NOW)?.id).toBe("negative-safe-to-spend");

    // With Safe-to-Spend no longer negative, overdue income must win over the bill and stale activity.
    const withoutNegative = stateWith({
      startingAvailableBalanceMinorUnits: 500_00,
      income: state.income,
      bills: state.bills,
      lastMeaningfulActivityAt: state.lastMeaningfulActivityAt,
    });
    expect(computeNextAction(withoutNegative, computeSafeToSpend(withoutNegative), NOW)?.id).toBe("income-inc-1");
  });
});

describe("nextCheckInDate", () => {
  it("finds the next occurrence of the chosen day, never today even if today matches", () => {
    // NOW is a Saturday (2026-08-15).
    expect(nextCheckInDate("saturday", NOW).toISOString().slice(0, 10)).toBe("2026-08-22");
  });

  it("finds the nearest upcoming occurrence within the same week", () => {
    expect(nextCheckInDate("sunday", NOW).toISOString().slice(0, 10)).toBe("2026-08-16");
    expect(nextCheckInDate("monday", NOW).toISOString().slice(0, 10)).toBe("2026-08-17");
  });

  it("wraps to next week for a day earlier than today", () => {
    expect(nextCheckInDate("wednesday", NOW).toISOString().slice(0, 10)).toBe("2026-08-19");
  });
});

describe("checkInDayLabel", () => {
  it("capitalizes every day correctly", () => {
    expect(checkInDayLabel("sunday")).toBe("Sunday");
    expect(checkInDayLabel("friday")).toBe("Friday");
  });
});

/**
 * NextActionCard can't be rendered in this test environment (no jsdom —
 * same constraint noted throughout the MMR reliability pass), so the
 * all-clear wording and next-check-in-day wiring is verified structurally:
 * the component must actually call the functions tested above, and
 * WorkspaceModule must actually supply the check-in day it needs them for.
 */
describe("NextActionCard wiring", () => {
  it("the all-clear state explains why and names the next check-in day", () => {
    const source = readFileSync(
      new URL("./components/NextActionCard.tsx", import.meta.url),
      "utf-8"
    );
    expect(source).toContain("checkInDayLabel(checkInDay)");
    expect(source).toContain("nextCheckInDate(checkInDay)");
    expect(source).toContain("Nothing needs attention right now");
  });

  it("each urgency tier gets a distinct container treatment, not a uniform card", () => {
    const source = readFileSync(
      new URL("./components/NextActionCard.tsx", import.meta.url),
      "utf-8"
    );
    expect(source).toContain('critical:');
    expect(source).toContain('attention:');
    expect(source).toContain('routine:');
    expect(source).toContain("var(--danger)");
    expect(source).toContain("var(--warning)");
  });

  it("WorkspaceModule supplies the check-in day NextActionCard needs", () => {
    const source = readFileSync(
      new URL("./components/WorkspaceModule.tsx", import.meta.url),
      "utf-8"
    );
    expect(source).toContain("checkInDay={state.preferences.checkInDay}");
  });
});
