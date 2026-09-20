import type { MaintenanceItem, ServiceEvent, Vehicle } from "./state";

/**
 * The record of what has been done, and how it keeps the due engine honest.
 *
 * The engine reads one last-done pair from each maintenance item. Events
 * are the history behind that pair, so whenever an event is added, changed
 * or set aside, the pair is re-derived from the events that remain and
 * written back. Nothing here is a second source of truth: the pair is
 * always exactly the latest active event for the item, or empty.
 */

/** The instant order two events happen in: the day, then the mileage, then when they were entered. */
function byRecency(a: ServiceEvent, b: ServiceEvent): number {
  if (a.doneOn !== b.doneOn) return a.doneOn < b.doneOn ? 1 : -1;
  const am = a.mileage ?? -1;
  const bm = b.mileage ?? -1;
  if (am !== bm) return am < bm ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

export function activeEvents(events: ServiceEvent[]): ServiceEvent[] {
  return events.filter((event) => event.status === "active");
}

export function latestEventFor(events: ServiceEvent[], itemId: string): ServiceEvent | null {
  return [...activeEvents(events)].filter((event) => event.itemId === itemId).sort(byRecency)[0] ?? null;
}

export interface LastDonePatch {
  lastDoneAt: string | null;
  lastDoneMileage: number | null;
}

/** What an item's last-done pair should be, given the events that exist for it right now. */
export function lastDoneFromEvents(events: ServiceEvent[], itemId: string): LastDonePatch {
  const latest = latestEventFor(events, itemId);
  return { lastDoneAt: latest?.doneOn ?? null, lastDoneMileage: latest?.mileage ?? null };
}

export interface ServiceInput {
  doneOn: string;
  mileage: number | null;
  taskName: string;
  shop: string | null;
  costMinorUnits: number | null;
  note: string | null;
}

export interface ServicePlan {
  /** Fields for the new event. */
  event: ServiceInput & { vehicleId: string; itemId: string | null };
  /** The item's new last-done pair, or null when this event is not newer than what the item already records. */
  itemPatch: LastDonePatch | null;
  /** The vehicle's new mileage reading, or null when this event says nothing newer than what is already there. */
  vehiclePatch: { currentMileage: number; mileageUpdatedAt: string } | null;
}

/**
 * Everything that must be written when a service is recorded. A service
 * from last spring, entered today, is history: it never replaces a more
 * recent last-done fact on the item, and it never lowers or backdates the
 * vehicle's mileage.
 */
export function planRecordService(input: { vehicle: Vehicle; item: MaintenanceItem | null; service: ServiceInput }): ServicePlan {
  const { vehicle, item, service } = input;

  let itemPatch: LastDonePatch | null = null;
  if (item) {
    const isNewer =
      item.lastDoneAt === null ||
      service.doneOn > item.lastDoneAt ||
      (service.doneOn === item.lastDoneAt && (service.mileage ?? -1) >= (item.lastDoneMileage ?? -1));
    if (isNewer) itemPatch = { lastDoneAt: service.doneOn, lastDoneMileage: service.mileage };
  }

  let vehiclePatch: ServicePlan["vehiclePatch"] = null;
  if (service.mileage !== null) {
    const higher = vehicle.currentMileage === null || service.mileage > vehicle.currentMileage;
    const notOlder = vehicle.mileageUpdatedAt === null || service.doneOn >= vehicle.mileageUpdatedAt;
    if (higher && notOlder) vehiclePatch = { currentMileage: service.mileage, mileageUpdatedAt: service.doneOn };
  }

  return { event: { ...service, vehicleId: vehicle.id, itemId: item?.id ?? null }, itemPatch, vehiclePatch };
}

export interface HistoryYear {
  year: string;
  events: ServiceEvent[];
  /** Sum of the costs somebody entered. Events with no cost are simply not in it. */
  costMinorUnits: number;
  costedCount: number;
}

/** Active events, newest first, grouped by calendar year, optionally for one vehicle. */
export function historyByYear(events: ServiceEvent[], vehicleId: string | null = null): HistoryYear[] {
  const wanted = activeEvents(events)
    .filter((event) => vehicleId === null || event.vehicleId === vehicleId)
    .sort(byRecency);
  const groups: HistoryYear[] = [];
  for (const event of wanted) {
    const year = event.doneOn.slice(0, 4);
    let group = groups[groups.length - 1];
    if (!group || group.year !== year) {
      group = { year, events: [], costMinorUnits: 0, costedCount: 0 };
      groups.push(group);
    }
    group.events.push(event);
    if (event.costMinorUnits !== null) {
      group.costMinorUnits += event.costMinorUnits;
      group.costedCount += 1;
    }
  }
  return groups;
}

/** The whole record for one vehicle, oldest first, the order a buyer reads a service history in. */
export function recordForPrint(events: ServiceEvent[], vehicleId: string): ServiceEvent[] {
  return activeEvents(events)
    .filter((event) => event.vehicleId === vehicleId)
    .sort((a, b) => -byRecency(a, b));
}

/** Whole units, no invented currency: cost is stored as minor units and shown with a plain two-decimal amount. */
export function formatCost(minorUnits: number): string {
  return (minorUnits / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseCostToMinorUnits(text: string): number | null {
  const cleaned = text.replace(/[^0-9.]/g, "");
  if (cleaned === "") return null;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
}
