import type { OwnedProductRow } from "./deriveOwnedProducts";
import type { EntitlementSummary } from "./entitlements";
import type { ProductInstanceSummary } from "./instances";

/**
 * Shared presentation logic for an owned product row — used by both
 * Library (the full list) and Home's "Also in your library" remainder, so
 * the two never drift into two different opinions of what a status line
 * means. Pure and unit-testable; no network calls here.
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

export type LibraryFilter = "all" | "in-progress" | "paused" | "finished" | "archived";

type FilterDef = {
  id: LibraryFilter;
  label: string;
  matches: (row: OwnedProductRow) => boolean;
  /** True for a filter that only ever matches a cycle-based (cycleModel: "monthly") product. */
  cycleOnly: boolean;
};

const FILTERS: FilterDef[] = [
  { id: "all", label: "All", matches: () => true, cycleOnly: false },
  {
    id: "in-progress",
    label: "In progress",
    matches: (r) => r.kind === "ready" && r.instance?.lifecycleState === "active",
    cycleOnly: false,
  },
  {
    id: "paused",
    label: "Paused",
    // Cycle-agnostic on purpose: vacation-mode pause (paused_at) applies
    // to any product, and a cycle-based product can still reach the
    // older lifecycle_state "paused" too — either counts.
    matches: (r) =>
      r.kind === "ready" &&
      (Boolean(r.instance?.pausedAt) || (r.definition.cycleModel === "monthly" && r.instance?.lifecycleState === "paused")),
    cycleOnly: false,
  },
  {
    id: "finished",
    label: "Finished",
    matches: (r) => r.kind === "ready" && r.definition.cycleModel === "monthly" && r.instance?.lifecycleState === "completed",
    cycleOnly: true,
  },
  {
    id: "archived",
    label: "Archived",
    matches: (r) => r.kind === "ready" && r.definition.cycleModel === "monthly" && r.instance?.lifecycleState === "archived",
    cycleOnly: true,
  },
];

/**
 * Paused/Finished/Archived only ever match a cycle-based product
 * (cycleModel: "monthly" — today, only Monthly Money Reset). Every
 * continuous Companion's own definition.ts documents, on purpose, that it
 * never transitions through those lifecycle states — so showing those
 * tabs to a library that owns none is showing three dead ends. Hidden
 * rather than removed: the moment a cycle-based product is owned, the
 * full set becomes meaningful again.
 */
export function visibleLibraryFilters(rows: OwnedProductRow[]): { id: LibraryFilter; label: string; matches: (row: OwnedProductRow) => boolean }[] {
  const ownsCycleProduct = rows.some((row) => row.kind === "ready" && row.definition.cycleModel === "monthly");
  return FILTERS.filter((filter) => !filter.cycleOnly || ownsCycleProduct);
}
