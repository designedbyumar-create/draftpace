import type { MaintenanceItem, Vehicle } from "./state";

/** A reading older than this is worth asking about before it is trusted. */
export const MILEAGE_STALE_DAYS = 30;

/** The device's own calendar day, "YYYY-MM-DD". */
export function todayIso(now: Date): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  const p = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((p(toIso) - p(fromIso)) / 86_400_000);
}

export type MileageFreshness =
  | { state: "none" }
  | { state: "fresh"; asOf: string }
  | { state: "stale"; asOf: string | null; days: number | null };

/**
 * Whether the vehicle's mileage can be trusted for a distance-based due
 * figure. A distance a job has "left" is only as good as the reading it was
 * subtracted from, so an old reading is said out loud rather than used
 * silently.
 */
export function mileageFreshness(vehicle: Vehicle, today: string): MileageFreshness {
  if (vehicle.currentMileage === null) return { state: "none" };
  if (vehicle.mileageUpdatedAt === null) return { state: "stale", asOf: null, days: null };
  const days = daysBetween(vehicle.mileageUpdatedAt, today);
  return days > MILEAGE_STALE_DAYS ? { state: "stale", asOf: vehicle.mileageUpdatedAt, days } : { state: "fresh", asOf: vehicle.mileageUpdatedAt };
}

/** A vehicle with a job tracked by distance but no mileage at all: those jobs cannot be judged until it has one. */
export function needsMileage(vehicle: Vehicle, items: MaintenanceItem[]): boolean {
  return vehicle.currentMileage === null && items.some((i) => i.vehicleId === vehicle.id && i.status === "active" && i.intervalMiles !== null);
}
