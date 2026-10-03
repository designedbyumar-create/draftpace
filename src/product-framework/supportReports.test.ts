import { describe, expect, it } from "vitest";
import { interpretListSupportReportsResponse } from "./supportReports";

describe("interpretListSupportReportsResponse", () => {
  it("maps rows to support report summaries on success", () => {
    const result = interpretListSupportReportsResponse(
      [
        {
          id: "r1",
          category: "technical",
          message: "The workspace screen won't load.",
          page_url: "/app/products/monthly-money-reset/workspace",
          created_at: "2026-09-01T00:00:00Z",
        },
      ],
      null
    );
    expect(result).toEqual({
      status: "ok",
      rows: [
        {
          id: "r1",
          category: "technical",
          message: "The workspace screen won't load.",
          pageUrl: "/app/products/monthly-money-reset/workspace",
          createdAt: "2026-09-01T00:00:00Z",
        },
      ],
    });
  });

  it("returns an explicit error on a query failure, never an empty list", () => {
    const result = interpretListSupportReportsResponse(null, { message: "connection reset" });
    expect(result).toEqual({ status: "error", message: "connection reset" });
  });

  it("treats a null response with no error as an error too, not silently zero reports", () => {
    const result = interpretListSupportReportsResponse(null, null);
    expect(result.status).toBe("error");
  });

  it("a genuinely empty reports list is still status ok — that's real, not a failure", () => {
    const result = interpretListSupportReportsResponse([], null);
    expect(result).toEqual({ status: "ok", rows: [] });
  });
});
