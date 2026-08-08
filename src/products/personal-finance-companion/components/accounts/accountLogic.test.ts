import { describe, expect, it } from "vitest";
import { isStale, summarizeAccounts, resolveDominantAction, describeAccountIncompleteness, daysSince } from "./accountLogic";
import type { Account } from "../../state";

const NOW = new Date("2026-08-08T00:00:00Z");

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: "acc-1",
    name: "Checking",
    type: "checking",
    currentBalanceMinorUnits: 100000,
    currency: "USD",
    availableForSpending: true,
    balanceAsOfDate: "2026-08-01",
    notes: null,
    status: "ready",
    needsReviewReason: null,
    source: "manual",
    importSessionId: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("isStale", () => {
  it("is not stale within the threshold", () => {
    expect(isStale(account({ balanceAsOfDate: "2026-08-01" }), NOW)).toBe(false);
  });

  it("is stale past the threshold", () => {
    expect(isStale(account({ balanceAsOfDate: "2026-06-01" }), NOW)).toBe(true);
  });

  it("an archived account is never flagged stale, even with an old balance date", () => {
    expect(isStale(account({ balanceAsOfDate: "2020-01-01", status: "archived" }), NOW)).toBe(false);
  });
});

describe("summarizeAccounts", () => {
  it("splits available vs protected totals and excludes archived accounts", () => {
    const summary = summarizeAccounts([
      account({ id: "a", currentBalanceMinorUnits: 100000, availableForSpending: true, balanceAsOfDate: "2026-08-01" }),
      account({ id: "b", currentBalanceMinorUnits: 50000, availableForSpending: false, balanceAsOfDate: "2026-07-15" }),
      account({ id: "c", currentBalanceMinorUnits: 999999, availableForSpending: true, status: "archived" }),
    ]);
    expect(summary.totalAvailableMinorUnits).toBe(100000);
    expect(summary.totalProtectedMinorUnits).toBe(50000);
    expect(summary.activeCount).toBe(2);
    expect(summary.oldestBalanceDate).toBe("2026-07-15");
  });

  it("returns an honest empty summary for zero accounts", () => {
    const summary = summarizeAccounts([]);
    expect(summary).toEqual({ totalAvailableMinorUnits: 0, totalProtectedMinorUnits: 0, activeCount: 0, oldestBalanceDate: null });
  });
});

describe("resolveDominantAction", () => {
  it("suggests adding the first account when none exist", () => {
    expect(resolveDominantAction([], NOW)).toEqual({ kind: "add-first" });
  });

  it("suggests updating the single oldest stale balance when multiple are stale", () => {
    const older = account({ id: "older", balanceAsOfDate: "2026-05-01" });
    const newer = account({ id: "newer", balanceAsOfDate: "2026-06-15" });
    const action = resolveDominantAction([newer, older], NOW);
    expect(action).toMatchObject({ kind: "update-stale", account: { id: "older" } });
  });

  it("returns null (no dominant action) when every account is fresh", () => {
    expect(resolveDominantAction([account({ balanceAsOfDate: "2026-08-01" })], NOW)).toBeNull();
  });
});

describe("describeAccountIncompleteness", () => {
  it("names the specific number of days, not a generic message", () => {
    const message = describeAccountIncompleteness(account({ balanceAsOfDate: "2026-07-01" }), NOW);
    expect(message).toContain(String(daysSince("2026-07-01", NOW)));
    expect(message).toMatch(/last confirmed/);
  });

  it("returns null for a fresh account", () => {
    expect(describeAccountIncompleteness(account({ balanceAsOfDate: "2026-08-01" }), NOW)).toBeNull();
  });
});
