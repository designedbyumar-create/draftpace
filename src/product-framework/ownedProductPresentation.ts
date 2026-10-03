import type { EntitlementSummary } from "./entitlements";
import type { ProductInstanceSummary } from "./instances";

/**
 * Shared presentation logic for an owned product row — used by Platform
 * Home and a product's own companion page (src/app/app/companions), so the
 * two never drift into two different opinions of what a status line means.
 * Pure and unit-testable; no network calls here.
 */

/** "2026-08" -> "August 2026"; anything else is shown unchanged. */
export function humanCycle(cycleKey: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(cycleKey);
  if (!match) return cycleKey;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export function humanStatus(instance: { setupComplete: boolean; lifecycleState: string; pausedAt?: string | null }): string {
  if (!instance.setupComplete) return "Setup not finished";
  // Vacation-mode pause is checked before lifecycle_state, and can apply
  // regardless of it — a continuous product paused this way never sets
  // lifecycleState to "paused" at all (see paused_at's own field
  // comment), so this is the only place that concept ever appears for it.
  if (instance.pausedAt) return "Paused";
  switch (instance.lifecycleState) {
    case "active":
      return "In progress";
    case "completed":
      return "Finished";
    case "paused":
      return "Paused";
    case "archived":
      return "Archived";
    default:
      return "In progress";
  }
}

/** A fixed, timezone-pinned date format — "Aug 12, 2026" — so a bought/started date never shifts a day depending on the reader's local timezone. */
export function humanDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * "Yours since {date}" alone before an instance exists; "Yours since
 * {date} · Started {date}" once one does — plain-language, not a receipt
 * ("Bought {date}" read like a grocery order). Ownership (entitlement)
 * and progress (instance) are always two different facts — see
 * docs/DATA-BOUNDARIES.md — so this takes them as two separate arguments
 * rather than a single owned-row shape, and works the same regardless of
 * which OwnedProductRow kind is calling it.
 */
export function boughtStartedLine(entitlement: EntitlementSummary, instance: ProductInstanceSummary | null): string {
  const owned = `Yours since ${humanDate(entitlement.grantedAt)}`;
  if (!instance) return owned;
  return `${owned} · Started ${humanDate(instance.createdAt)}`;
}
