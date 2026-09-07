import type { MaintenanceItem, Vehicle } from "./state";

/**
 * What's due, computed, never stored. Same discipline as every other
 * Companion's derived-attention layer (Home Base's attention.ts,
 * Alongside's deriveAttention): every figure here traces to a stored
 * fact (a vehicle's own mileage, an item's own interval and last-done
 * record), nothing is invented, and a vehicle with nothing overdue says
 * so plainly.
 *
 * SEVERE DUTY IS A MULTIPLIER, NEVER A SECOND INTERVAL TABLE
 *
 * "Service twice as often under severe conditions" is a real,
 * manufacturer-independent convention, not a number this file invents.
 * Turning the toggle on halves whichever interval the person actually
 * entered; it never substitutes a different, hardcoded interval of its
 * own. The interval itself, always, is what the person typed or kept
 * from a template.
 *
 * NO BASELINE IS A REAL, HONEST STATE
 *
 * An item with no last-done date or mileage, whether because the
 * vehicle's history is marked unknown or because nobody has recorded
 * doing that job yet, has nothing to compute a due status from. This
 * file never guesses "probably overdue" in that case; it says so, in
 * its own bucket, distinct from genuinely due work.
 */

/** "Service twice as often under severe conditions": halves whichever interval was entered, never invents one. */
const SEVERE_DUTY_MULTIPLIER = 0.5;

/** Elapsed as a fraction of the interval reaches before something counts as "due soon" rather than merely "on track". */
const DUE_SOON_THRESHOLD = 0.9;

export function effectiveIntervalMiles(item: Pick<MaintenanceItem, "intervalMiles" | "severeDuty">): number | null {
  if (item.intervalMiles === null) return null;
  return item.severeDuty ? Math.round(item.intervalMiles * SEVERE_DUTY_MULTIPLIER) : item.intervalMiles;
}

export function effectiveIntervalMonths(item: Pick<MaintenanceItem, "intervalMonths" | "severeDuty">): number | null {
  if (item.intervalMonths === null) return null;
  return item.severeDuty ? Math.round(item.intervalMonths * SEVERE_DUTY_MULTIPLIER) : item.intervalMonths;
}

function addMonths(iso: string, months: number): Date {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function ratio(elapsed: number, interval: number): number | null {
  if (interval <= 0) return null;
  return elapsed / interval;
}

export interface DueVehicleItem {
  vehicle: Vehicle;
  item: MaintenanceItem;
  /** Negative once overdue. Null when not computable by distance (no mileage baseline, or no mileage interval). */
  milesRemaining: number | null;
  /** Negative once overdue. Null when not computable by date. */
  daysRemaining: number | null;
  /** Whether either dimension could be computed at all. */
  hasBaseline: boolean;
  /** Ranking figure only, never shown: the more-elapsed of the two dimensions, as a fraction of interval. 1.0 = exactly due. */
  urgency: number;
}

/**
 * One item's standing, given its vehicle and the current date.
 *
 * "Due whichever comes first" is standard automotive practice: an item
 * can be tracked by distance, by time, or both, and whichever fraction
 * of its interval has elapsed further is the one that decides urgency.
 */
export function evaluateItem(vehicle: Vehicle, item: MaintenanceItem, now: Date): DueVehicleItem {
  const effMiles = effectiveIntervalMiles(item);
  const effMonths = effectiveIntervalMonths(item);

  let milesRemaining: number | null = null;
  let milesRatio: number | null = null;
  if (effMiles !== null && item.lastDoneMileage !== null && vehicle.currentMileage !== null) {
    const elapsed = vehicle.currentMileage - item.lastDoneMileage;
    milesRemaining = effMiles - elapsed;
    milesRatio = ratio(elapsed, effMiles);
  }

  let daysRemaining: number | null = null;
  let monthsRatio: number | null = null;
  if (effMonths !== null && item.lastDoneAt !== null) {
    const dueDate = addMonths(item.lastDoneAt, effMonths);
    const lastDone = new Date(`${item.lastDoneAt}T00:00:00Z`);
    daysRemaining = Math.round((dueDate.getTime() - now.getTime()) / 86_400_000);
    const totalDays = Math.round((dueDate.getTime() - lastDone.getTime()) / 86_400_000);
    const elapsedDays = Math.round((now.getTime() - lastDone.getTime()) / 86_400_000);
    monthsRatio = ratio(elapsedDays, totalDays);
  }

  const ratios = [milesRatio, monthsRatio].filter((r): r is number => r !== null);
  const hasBaseline = ratios.length > 0;

  return {
    vehicle,
    item,
    milesRemaining,
    daysRemaining,
    hasBaseline,
    urgency: hasBaseline ? Math.max(...ratios) : -1,
  };
}

export interface DueView {
  /** Past its interval already, most overdue first. */
  due: DueVehicleItem[];
  /** Inside the interval but past the "due soon" threshold, soonest first. */
  dueSoon: DueVehicleItem[];
  /** No last-done fact to compute from at all: an unknown-history vehicle, or an item never yet recorded done. */
  noBaseline: DueVehicleItem[];
  /** True when nothing is due or due soon. A real, honest state, not an empty one. */
  quiet: boolean;
}

/**
 * The single ranked view every workspace screen reads from. Archived
 * vehicles and archived items are excluded entirely; an item pointing
 * at a vehicle that no longer exists in the active set is silently
 * skipped rather than shown against nothing.
 */
export function deriveDueView(vehicles: Vehicle[], items: MaintenanceItem[], now: Date): DueView {
  const vehicleById = new Map(vehicles.filter((v) => v.status === "active").map((v) => [v.id, v]));

  const evaluated: DueVehicleItem[] = [];
  for (const item of items) {
    if (item.status !== "active") continue;
    const vehicle = vehicleById.get(item.vehicleId);
    if (!vehicle) continue;
    evaluated.push(evaluateItem(vehicle, item, now));
  }

  const due = evaluated.filter((e) => e.hasBaseline && e.urgency >= 1).sort((a, b) => b.urgency - a.urgency);
  const dueSoon = evaluated
    .filter((e) => e.hasBaseline && e.urgency >= DUE_SOON_THRESHOLD && e.urgency < 1)
    .sort((a, b) => b.urgency - a.urgency);
  const noBaseline = evaluated.filter((e) => !e.hasBaseline);

  return { due, dueSoon, noBaseline, quiet: due.length === 0 && dueSoon.length === 0 };
}
