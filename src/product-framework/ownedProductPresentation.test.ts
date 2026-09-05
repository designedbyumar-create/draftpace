import { describe, expect, it } from "vitest";
import { boughtStartedLine, humanDate, humanStatus, visibleLibraryFilters } from "./ownedProductPresentation";
import type { OwnedProductRow } from "./deriveOwnedProducts";
import type { EntitlementSummary } from "./entitlements";
import type { ProductInstanceSummary } from "./instances";
import type { ProductDefinition } from "./definition";

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

  it("shows only the bought date when no instance exists yet", () => {
    expect(boughtStartedLine(entitlement, null)).toBe("Bought Aug 12, 2026");
  });

  it("shows both bought and started dates once an instance exists", () => {
    const instance = { createdAt: "2026-08-14T00:00:00Z" } as ProductInstanceSummary;
    expect(boughtStartedLine(entitlement, instance)).toBe("Bought Aug 12, 2026 · Started Aug 14, 2026");
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

describe("visibleLibraryFilters", () => {
  function readyRow(cycleModel: "monthly" | "continuous"): OwnedProductRow {
    return {
      kind: "ready",
      productSlug: "x",
      entitlement: { id: "e", productSlug: "x", accessSource: "purchase", grantedAt: "2026-01-01T00:00:00Z" },
      definition: { cycleModel } as ProductDefinition,
      instance: null,
      sortTimestamp: "2026-01-01T00:00:00Z",
    };
  }

  it("hides Finished/Archived, but keeps Paused, when nothing owned is cycle-based — vacation-mode pause applies to any product", () => {
    const rows = [readyRow("continuous"), readyRow("continuous")];
    const ids = visibleLibraryFilters(rows).map((f) => f.id);
    expect(ids).toEqual(["all", "in-progress", "paused"]);
  });

  it("shows the full set once a cycle-based product is owned", () => {
    const rows = [readyRow("continuous"), readyRow("monthly")];
    const ids = visibleLibraryFilters(rows).map((f) => f.id);
    expect(ids).toEqual(["all", "in-progress", "paused", "finished", "archived"]);
  });

  it("shows the universal filters even for an empty library", () => {
    const ids = visibleLibraryFilters([]).map((f) => f.id);
    expect(ids).toEqual(["all", "in-progress", "paused"]);
  });
});
