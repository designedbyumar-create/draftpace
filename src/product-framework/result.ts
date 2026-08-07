/**
 * The discriminated-union result shape Monthly Money Reset's data layer
 * uses repeatedly (LoadStateResult, SaveStateResult, FindInstanceResult in
 * src/products/monthly-money-reset/data.ts), redefined per call site there.
 * Promoted here as a shared generic since a second product (Personal
 * Finance Companion) needs the identical shape across many more call
 * sites (seven record types) — see docs/PRODUCT-FRAMEWORK.md.
 *
 * The critical invariant this preserves, carried over from MMR's own
 * pattern: a query error and a genuine empty/not-found result are always
 * distinct variants, never collapsed into one "false" or "null". Confusing
 * the two caused a real production incident where a transient read failure
 * was shown to a user as "you don't own this."
 */
export type Result<T> = { ok: true; data: T } | { ok: false; error: ResultError };

export type ResultError =
  | { kind: "not-found" }
  | { kind: "not-authenticated" }
  | { kind: "forbidden" }
  | { kind: "conflict"; latest?: unknown }
  | { kind: "validation"; message: string }
  | { kind: "network"; message: string };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(error: ResultError): Result<T> {
  return { ok: false, error };
}

/** A human-readable message for the error states above, safe to show directly in a UI. */
export function describeResultError(error: ResultError): string {
  switch (error.kind) {
    case "not-found":
      return "That couldn't be found.";
    case "not-authenticated":
      return "Please sign in again.";
    case "forbidden":
      return "You don't have access to that.";
    case "conflict":
      return "This was changed elsewhere. Reload to see the latest version.";
    case "validation":
      return error.message;
    case "network":
      return error.message || "Couldn't reach the server. Check your connection and try again.";
  }
}
