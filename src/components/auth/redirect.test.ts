import { describe, expect, it } from "vitest";
import { getSafeRedirect } from "./redirect";

describe("getSafeRedirect (intent preservation)", () => {
  it("preserves a same-origin relative destination through authentication", () => {
    expect(getSafeRedirect("/app/library")).toBe("/app/library");
    expect(getSafeRedirect("/app/activate/monthly-money-reset")).toBe("/app/activate/monthly-money-reset");
  });

  it("falls back when no intent is present", () => {
    expect(getSafeRedirect(null)).toBe("/app");
    expect(getSafeRedirect("")).toBe("/app");
    expect(getSafeRedirect(null, "/app/library")).toBe("/app/library");
  });

  it("rejects off-site and protocol-relative targets rather than trusting them", () => {
    expect(getSafeRedirect("https://evil.example")).toBe("/app");
    expect(getSafeRedirect("//evil.example")).toBe("/app");
    expect(getSafeRedirect("http://evil.example/app")).toBe("/app");
    expect(getSafeRedirect("javascript:alert(1)")).toBe("/app");
  });
});
