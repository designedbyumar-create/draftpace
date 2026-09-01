import { describe, expect, it } from "vitest";
import { interpretListInstancesResponse } from "./instances";

const row = {
  id: "i1",
  product_slug: "monthly-money-reset",
  cycle_key: "2026-08",
  lifecycle_state: "active" as const,
  setup_complete: true,
  safe_to_spend_cents: 1000,
  next_action_label: "Review bills",
  last_activity_at: "2026-08-01T00:00:00Z",
  created_at: "2026-07-31T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("interpretListInstancesResponse", () => {
  it("maps rows to instance summaries on success", () => {
    const result = interpretListInstancesResponse([row], null);
    expect(result).toEqual({
      status: "ok",
      rows: [
        {
          id: "i1",
          productSlug: "monthly-money-reset",
          cycleKey: "2026-08",
          lifecycleState: "active",
          setupComplete: true,
          safeToSpendMinorUnits: 1000,
          nextActionLabel: "Review bills",
          lastActivityAt: "2026-08-01T00:00:00Z",
          createdAt: "2026-07-31T00:00:00Z",
          updatedAt: "2026-08-01T00:00:00Z",
        },
      ],
    });
  });

  /**
   * The literal defect the audit found (instances.ts previously had
   * `if (error || !data) return []`, making a genuinely owned product
   * indistinguishable from owning nothing). This is the regression test for
   * that fix.
   */
  it("returns an explicit error on a query failure, never a collapsed empty array", () => {
    const result = interpretListInstancesResponse(null, { message: "connection reset" });
    expect(result).toEqual({ status: "error", message: "connection reset" });
  });

  it("treats a null response with no error as an error too", () => {
    const result = interpretListInstancesResponse(null, null);
    expect(result.status).toBe("error");
  });

  it("a genuinely empty instance list is still status ok", () => {
    const result = interpretListInstancesResponse([], null);
    expect(result).toEqual({ status: "ok", rows: [] });
  });
});
