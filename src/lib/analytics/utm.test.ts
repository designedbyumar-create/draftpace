import { describe, expect, it } from "vitest";
import { utmQueryString, withPreservedUtm } from "./utm";

describe("utmQueryString", () => {
  it("returns empty string when no UTM parameters are present", () => {
    expect(utmQueryString(new URLSearchParams())).toBe("");
    expect(utmQueryString({})).toBe("");
  });

  it("carries every recognized UTM parameter, from both a URLSearchParams and a plain object", () => {
    const params = new URLSearchParams({
      utm_source: "pinterest",
      utm_medium: "organic_social",
      utm_campaign: "money_momentum",
      utm_content: "mm_001",
      utm_id: "abc",
      utm_term: "budgeting",
    });
    const qs = utmQueryString(params);
    for (const pair of ["utm_source=pinterest", "utm_medium=organic_social", "utm_campaign=money_momentum", "utm_content=mm_001", "utm_id=abc", "utm_term=budgeting"]) {
      expect(qs).toContain(pair);
    }
    expect(qs.startsWith("?")).toBe(true);

    // Next.js page searchParams shape: plain object, values sometimes arrays.
    expect(utmQueryString({ utm_source: "pinterest", utm_content: ["mm_001", "mm_002"] })).toBe("?utm_source=pinterest&utm_content=mm_001");
  });

  it("never forwards a parameter outside the recognized allowlist", () => {
    const qs = utmQueryString(new URLSearchParams({ utm_source: "pinterest", error: "1", code: "secret", redirectTo: "/app" }));
    expect(qs).toBe("?utm_source=pinterest");
  });

  it("carries only the UTM parameters actually present, not the full set with blanks", () => {
    expect(utmQueryString(new URLSearchParams({ utm_campaign: "money_momentum" }))).toBe("?utm_campaign=money_momentum");
  });
});

describe("withPreservedUtm", () => {
  it("returns the path unchanged when there is nothing to carry forward", () => {
    expect(withPreservedUtm("/free", new URLSearchParams())).toBe("/free");
    expect(withPreservedUtm("/shop/personal-finance-companion", {})).toBe("/shop/personal-finance-companion");
  });

  it("appends with a leading ? onto a bare path", () => {
    const result = withPreservedUtm("/free", new URLSearchParams({ utm_source: "pinterest", utm_content: "mm_001" }));
    expect(result).toBe("/free?utm_source=pinterest&utm_content=mm_001");
  });

  it("appends with & onto a path that already carries a query string, rather than a second ?", () => {
    const result = withPreservedUtm("/app/activate/monthly-money-reset?error=1", new URLSearchParams({ utm_source: "pinterest" }));
    expect(result).toBe("/app/activate/monthly-money-reset?error=1&utm_source=pinterest");
    expect(result.match(/\?/g)?.length).toBe(1);
  });
});
