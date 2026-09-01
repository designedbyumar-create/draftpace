import { describe, expect, it } from "vitest";
import { createEmptyState } from "./state";
import { computeSinceLastHere } from "./sinceLastHere";

const NOW = new Date("2026-08-15T12:00:00.000Z");

function stateWith(overrides: Partial<ReturnType<typeof createEmptyState>>) {
  return { ...createEmptyState({ cycleKey: "2026-08", cycleLabel: "August 2026" }), ...overrides };
}

describe("computeSinceLastHere", () => {
  it("returns null when there has never been a confirmation", () => {
    expect(computeSinceLastHere(stateWith({}), NOW)).toBeNull();
  });

  it("returns null when confirmed today and nothing has changed since", () => {
    const state = stateWith({
      lastConfirmedAt: NOW.toISOString(),
      checkIns: [
        {
          id: "c1",
          date: NOW.toISOString(),
          incomeChanged: false,
          billsChanged: false,
          spendingMissing: false,
          reserveAdjusted: false,
          feelsAccurate: true,
          safeToSpendAtMinorUnits: 0,
        },
      ],
    });
    expect(computeSinceLastHere(state, NOW)).toBeNull();
  });

  it("is fresh (tier) the same day even if confirmed hours earlier, with no changes suppressing it", () => {
    const earlierToday = new Date("2026-08-15T02:00:00.000Z").toISOString();
    const state = stateWith({
      lastConfirmedAt: earlierToday,
      checkIns: [
        {
          id: "c1",
          date: earlierToday,
          incomeChanged: false,
          billsChanged: false,
          spendingMissing: false,
          reserveAdjusted: false,
          feelsAccurate: true,
          safeToSpendAtMinorUnits: 0,
        },
      ],
    });
    // Same calendar distance (0 days) and nothing changed -> still suppressed.
    expect(computeSinceLastHere(state, NOW)).toBeNull();
  });

  it("reports a nonzero Safe-to-Spend delta first, and stays visible even at 0 days if something changed", () => {
    const confirmedAt = NOW.toISOString();
    const state = stateWith({
      lastConfirmedAt: confirmedAt,
      startingAvailableBalanceMinorUnits: 500_00,
      checkIns: [
        {
          id: "c1",
          date: confirmedAt,
          incomeChanged: false,
          billsChanged: false,
          spendingMissing: false,
          reserveAdjusted: false,
          feelsAccurate: true,
          safeToSpendAtMinorUnits: 0,
        },
      ],
    });
    const result = computeSinceLastHere(state, NOW);
    expect(result).not.toBeNull();
    expect(result?.facts[0]).toMatch(/gone up/);
  });

  it("tiers as fresh under 3 days, aging from 3-6 days, and stale at 7+ days", () => {
    const fresh = stateWith({
      lastConfirmedAt: new Date("2026-08-14T12:00:00.000Z").toISOString(),
      bills: [{ id: "b1", name: "Rent", amountMinorUnits: 10_00, category: "Housing", protected: true, status: "paid", paidDate: "2026-08-14T13:00:00.000Z" }],
    });
    expect(computeSinceLastHere(fresh, NOW)?.tier).toBe("fresh");

    const aging = stateWith({
      lastConfirmedAt: new Date("2026-08-11T12:00:00.000Z").toISOString(),
      bills: [{ id: "b1", name: "Rent", amountMinorUnits: 10_00, category: "Housing", protected: true, status: "paid", paidDate: "2026-08-12T13:00:00.000Z" }],
    });
    expect(computeSinceLastHere(aging, NOW)?.tier).toBe("aging");

    const stale = stateWith({ lastConfirmedAt: new Date("2026-08-01T12:00:00.000Z").toISOString() });
    expect(computeSinceLastHere(stale, NOW)?.tier).toBe("stale");
  });

  it("lists bills paid and income received since the last confirmation, by name when there's exactly one", () => {
    const confirmedAt = new Date("2026-08-10T00:00:00.000Z").toISOString();
    const state = stateWith({
      lastConfirmedAt: confirmedAt,
      bills: [
        { id: "b1", name: "Internet", amountMinorUnits: 60_00, category: "Utilities", protected: false, status: "paid", paidDate: "2026-08-12T00:00:00.000Z" },
      ],
      income: [
        { id: "i1", name: "Freelance", amountMinorUnits: 200_00, status: "received", recurring: false, receivedDate: "2026-08-13T00:00:00.000Z" },
      ],
    });
    const result = computeSinceLastHere(state, NOW);
    expect(result?.facts).toContain("Internet was paid.");
    expect(result?.facts).toContain("Freelance was received.");
  });

  it("does not count a bill paid before the last confirmation", () => {
    const confirmedAt = new Date("2026-08-10T00:00:00.000Z").toISOString();
    const state = stateWith({
      lastConfirmedAt: confirmedAt,
      bills: [
        { id: "b1", name: "Internet", amountMinorUnits: 60_00, category: "Utilities", protected: false, status: "paid", paidDate: "2026-08-05T00:00:00.000Z" },
      ],
    });
    const result = computeSinceLastHere(state, NOW);
    expect(result?.facts.join(" ")).not.toContain("Internet was paid");
  });

  it("always ends with a tier-appropriate freshness statement", () => {
    const state = stateWith({ lastConfirmedAt: new Date("2026-08-01T00:00:00.000Z").toISOString() });
    const result = computeSinceLastHere(state, NOW);
    expect(result?.facts.at(-1)).toMatch(/behind what's actually happened/);
  });

  it("marks elevated when Safe-to-Spend is currently negative", () => {
    const state = stateWith({
      lastConfirmedAt: new Date("2026-08-01T00:00:00.000Z").toISOString(),
      startingAvailableBalanceMinorUnits: -100_00,
    });
    expect(computeSinceLastHere(state, NOW)?.elevated).toBe(true);
  });
});
