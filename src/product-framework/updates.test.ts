import { describe, expect, it } from "vitest";
import { interpretListUpdatesResponse } from "./updates";

describe("interpretListUpdatesResponse", () => {
  it("maps rows to update summaries on success", () => {
    const result = interpretListUpdatesResponse(
      [
        {
          id: "u1",
          product_slug: "personal-finance-companion",
          title: "Rent is due tomorrow",
          body: "$1,450 to Northside Realty",
          url: "/products/personal-finance-companion/bills",
          created_at: "2026-09-01T00:00:00Z",
          acknowledged_at: null,
        },
      ],
      null
    );
    expect(result).toEqual({
      status: "ok",
      rows: [
        {
          id: "u1",
          productSlug: "personal-finance-companion",
          title: "Rent is due tomorrow",
          body: "$1,450 to Northside Realty",
          url: "/products/personal-finance-companion/bills",
          createdAt: "2026-09-01T00:00:00Z",
          acknowledgedAt: null,
        },
      ],
    });
  });

  it("returns an explicit error on a query failure, never an empty list", () => {
    const result = interpretListUpdatesResponse(null, { message: "connection reset" });
    expect(result).toEqual({ status: "error", message: "connection reset" });
  });

  it("treats a null response with no error as an error too, not silently zero updates", () => {
    const result = interpretListUpdatesResponse(null, null);
    expect(result.status).toBe("error");
  });

  it("a genuinely empty updates list is still status ok — that's real, not a failure", () => {
    const result = interpretListUpdatesResponse([], null);
    expect(result).toEqual({ status: "ok", rows: [] });
  });
});
