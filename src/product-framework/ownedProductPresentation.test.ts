import { describe, expect, it } from "vitest";
import { boughtStartedLine, humanDate, humanStatus } from "./ownedProductPresentation";
import type { EntitlementSummary } from "./entitlements";
import type { ProductInstanceSummary } from "./instances";

describe("humanDate", () => {
  it("formats an ISO timestamp as a fixed, timezone-pinned date", () => {
    expect(humanDate("2026-08-12T00:00:00Z")).toBe("Aug 12, 2026");
  });

  it("returns the input unchanged when it isn't a parseable date", () => {
    expect(humanDate("not-a-date")).toBe("not-a-date");
  });
});

describe("boughtStartedLine", () => {
  const entitlement: EntitlementSummary = {
    id: "e1",
    productSlug: "home-management-companion",
    accessSource: "purchase",
    grantedAt: "2026-08-12T00:00:00Z",
  };

  it("shows only the ownership date when no instance exists yet", () => {
    expect(boughtStartedLine(entitlement, null)).toBe("Yours since Aug 12, 2026");
  });

  it("shows both ownership and started dates once an instance exists", () => {
    const instance = { createdAt: "2026-08-14T00:00:00Z" } as ProductInstanceSummary;
    expect(boughtStartedLine(entitlement, instance)).toBe("Yours since Aug 12, 2026 · Started Aug 14, 2026");
  });
});

describe("humanStatus", () => {
  it("reports Paused when paused_at is set, regardless of lifecycleState", () => {
    expect(humanStatus({ setupComplete: true, lifecycleState: "active", pausedAt: "2026-08-15T00:00:00Z" })).toBe("Paused");
  });

  it("falls back to the ordinary lifecycle switch when not paused", () => {
    expect(humanStatus({ setupComplete: true, lifecycleState: "active", pausedAt: null })).toBe("In progress");
  });

  it("still reports setup-not-finished first, even if somehow paused", () => {
    expect(humanStatus({ setupComplete: false, lifecycleState: "active", pausedAt: "2026-08-15T00:00:00Z" })).toBe(
      "Setup not finished"
    );
  });
});
