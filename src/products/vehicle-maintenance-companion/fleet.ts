import type { DueView } from "./dueStatus";
import type { RenewalEntry } from "./renewals";
import type { Vehicle } from "./state";

/**
 * Several vehicles on one screen. Each one gets a lamp, lit only when
 * something on it needs attention, so a glance says which of five are fine
 * without a count or a score, and one tap narrows Due to a single vehicle.
 */

export type LampState = "due" | "soon" | "clear";

export interface VehicleLamp {
  vehicle: Vehicle;
  state: LampState;
}

/**
 * Lit for a job that has reached its interval or a date that has passed; a
 * ring for a job or date that is close; nothing for a vehicle whose every
 * job is within its interval and whose dates are not near.
 */
export function vehicleLamps(vehicles: Vehicle[], view: DueView, renewals: RenewalEntry[]): VehicleLamp[] {
  return vehicles.map((vehicle) => {
    const dueJob = view.due.some((e) => e.vehicle.id === vehicle.id);
    const pastDate = renewals.some((e) => e.vehicle.id === vehicle.id && e.state === "pastDate");
    const soonJob = view.dueSoon.some((e) => e.vehicle.id === vehicle.id);
    const soonDate = renewals.some((e) => e.vehicle.id === vehicle.id && e.state === "soon");
    return { vehicle, state: dueJob || pastDate ? "due" : soonJob || soonDate ? "soon" : "clear" };
  });
}

/** The due view for one vehicle, or every vehicle when none is chosen. */
export function filterDueView(view: DueView, vehicleId: string | null): DueView {
  if (vehicleId === null) return view;
  const mine = <T extends { vehicle: Vehicle }>(list: T[]) => list.filter((e) => e.vehicle.id === vehicleId);
  const due = mine(view.due);
  const dueSoon = mine(view.dueSoon);
  return { due, dueSoon, noBaseline: mine(view.noBaseline), quiet: due.length === 0 && dueSoon.length === 0 };
}

export function filterRenewals(entries: RenewalEntry[], vehicleId: string | null): RenewalEntry[] {
  return vehicleId === null ? entries : entries.filter((e) => e.vehicle.id === vehicleId);
}

/** "2018 Honda Civic" from whatever of year, make and model was entered, or the vehicle's own name when none was. */
export function describeVehicle(vehicle: Vehicle): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter((p) => p !== null && p !== "");
  return parts.length > 0 ? parts.join(" ") : vehicle.label;
}
