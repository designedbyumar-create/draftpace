import { describe, expect, it } from "vitest";
import { interpretListEntitlementsResponse } from "./entitlements";

describe("interpretListEntitlementsResponse", () => {
  it("maps rows to entitlement summaries on success", () => {
    const result = interpretListEntitlementsResponse(
      [{ id: "e1", product_slug: "monthly-money-reset", access_source: "free-grant", granted_at: "2026-08-01T00:00:00Z" }],
      null
    );
    expect(result).toEqual({
      status: "ok",
      rows: [
        {
          id: "e1",
          productSlug: "monthly-money-reset",
          accessSource: "free-grant",
          grantedAt: "2026-08-01T00:00:00Z",
        },
      ],
    });
  });

  it("returns an explicit error on a query failure, never an empty list", () => {
    const result = interpretListEntitlementsResponse(null, { message: "connection reset" });
    expect(result).toEqual({ status: "error", message: "connection reset" });
  });

  it("treats a null response with no error as an error too, not silent ownership of nothing", () => {
    const result = interpretListEntitlementsResponse(null, null);
    expect(result.status).toBe("error");
  });

  it("a genuinely empty entitlement list is still status ok — that's real, not a failure", () => {
    const result = interpretListEntitlementsResponse([], null);
    expect(result).toEqual({ status: "ok", rows: [] });
  });
});
