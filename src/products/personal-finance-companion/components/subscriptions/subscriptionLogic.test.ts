import { describe, expect, it } from "vitest";
import { monthlyEquivalentMinorUnits, summarizeSubscriptions, resolveDominantAction, describeDecisionNote } from "./subscriptionLogic";
import type { Subscription } from "../../state";

function subscription(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub-1",
    name: "Streaming service",
    amountMinorUnits: 1500,
    frequency: "monthly",
    renewalDate: "2026-09-01",
    decision: "keep",
    currency: "USD",
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("monthlyEquivalentMinorUnits", () => {
  it("normalizes an annual amount to a monthly equivalent", () => {
    expect(monthlyEquivalentMinorUnits(subscription({ amountMinorUnits: 12000, frequency: "annual" }))).toBe(1000);
  });

  it("never guesses a monthly figure for custom frequencies", () => {
    expect(monthlyEquivalentMinorUnits(subscription({ frequency: "custom" }))).toBeNull();
  });
});

describe("summarizeSubscriptions", () => {
  it("excludes archived and cancelled subscriptions from the active total", () => {
    const summary = summarizeSubscriptions([
      subscription({ id: "a", amountMinorUnits: 1000 }),
      subscription({ id: "b", amountMinorUnits: 999999, status: "archived" }),
      subscription({ id: "c", amountMinorUnits: 999999, decision: "cancelled" }),
    ]);
    expect(summary.activeCount).toBe(1);
    expect(summary.totalMonthlyEquivalentMinorUnits).toBe(1000);
  });

  it("counts reviewing and planned-cancellation subscriptions separately", () => {
    const summary = summarizeSubscriptions([
      subscription({ id: "a", decision: "reviewing" }),
      subscription({ id: "b", decision: "plannedCancellation" }),
      subscription({ id: "c", decision: "keep" }),
    ]);
    expect(summary.reviewingCount).toBe(1);
    expect(summary.plannedCancellationCount).toBe(1);
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first subscription when none exist", () => {
    expect(resolveDominantAction([])).toEqual({ kind: "add-first" });
  });

  it("surfaces the earliest-added subscription still under review", () => {
    const older = subscription({ id: "older", decision: "reviewing", createdAt: "2026-08-01T00:00:00Z" });
    const newer = subscription({ id: "newer", decision: "reviewing", createdAt: "2026-08-05T00:00:00Z" });
    expect(resolveDominantAction([newer, older])).toMatchObject({ kind: "decide", subscription: { id: "older" } });
  });

  it("returns null when nothing is under review", () => {
    expect(resolveDominantAction([subscription({ decision: "keep" })])).toBeNull();
  });
});

describe("describeDecisionNote — the planned-cancellation boundary", () => {
  it("states plainly that Draftpace tracks but does not perform the cancellation", () => {
    const note = describeDecisionNote(subscription({ decision: "plannedCancellation" }));
    expect(note).toMatch(/won't cancel it for you/);
    expect(note).toMatch(/tracking/);
  });

  it("returns a distinct note for a subscription still under review", () => {
    expect(describeDecisionNote(subscription({ decision: "reviewing" }))).toMatch(/deciding/);
  });

  it("returns null for a kept or cancelled subscription", () => {
    expect(describeDecisionNote(subscription({ decision: "keep" }))).toBeNull();
    expect(describeDecisionNote(subscription({ decision: "cancelled" }))).toBeNull();
  });
});
