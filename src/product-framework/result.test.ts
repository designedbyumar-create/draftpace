import { describe, expect, it } from "vitest";
import { ok, err, describeResultError } from "./result";

describe("Result<T>", () => {
  it("ok() wraps data with ok: true", () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, data: 42 });
  });

  it("err() wraps an error with ok: false", () => {
    const result = err({ kind: "not-found" });
    expect(result).toEqual({ ok: false, error: { kind: "not-found" } });
  });

  it("keeps a network error distinct from a not-found result — never collapsed into one falsy value", () => {
    const networkError = err({ kind: "network", message: "timeout" });
    const notFound = err({ kind: "not-found" });
    expect(networkError.ok).toBe(false);
    expect(notFound.ok).toBe(false);
    if (!networkError.ok && !notFound.ok) {
      expect(networkError.error.kind).not.toBe(notFound.error.kind);
    }
  });
});

describe("describeResultError", () => {
  it("returns the validation message verbatim (already user-safe)", () => {
    expect(describeResultError({ kind: "validation", message: "Name is required." })).toBe("Name is required.");
  });

  it("falls back to a generic message when a network error has no message", () => {
    expect(describeResultError({ kind: "network", message: "" })).toContain("connection");
  });

  it("describes a conflict as recoverable-sounding, not a hard failure", () => {
    expect(describeResultError({ kind: "conflict" })).toMatch(/reload/i);
  });
});
