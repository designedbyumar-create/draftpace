const CYCLE_KEY_PATTERN = /^\d{4}-\d{2}$/;

/**
 * The current monthly cycle key, "YYYY-MM" — shared by every product that
 * uses product_instances, since cycle_key is a schema-level constraint
 * (not a Monthly Money Reset concept). Computed in UTC deliberately — simple
 * and deterministic server-side, at the cost of a user near a month boundary
 * in a far timezone occasionally seeing the adjacent month for a few hours.
 * Documented as a known v1 limitation, not silently wrong.
 */
export function currentCycleKey(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function isValidCycleKey(value: string): boolean {
  return CYCLE_KEY_PATTERN.test(value);
}

/** "2026-08" -> "August 2026" */
export function cycleKeyToLabel(cycleKey: string): string {
  if (!isValidCycleKey(cycleKey)) return cycleKey;
  const [year, month] = cycleKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}
