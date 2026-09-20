import { renewalTitle } from "./renewals";
import { recordForPrint } from "./serviceHistory";
import type { GloveBoxCardData } from "./printables/generateGloveBoxCard";
import type { ServiceBoundaryData } from "./printables/generateServiceBoundary";
import type { ServiceRecordData } from "./printables/generateServiceRecord";
import type { MaintenanceItem, Renewal, ServiceEvent, Vehicle } from "./state";

/**
 * What each document is made from, worked out here so the order, the
 * selection and the wording of the data can be tested without drawing a
 * page. The generators only draw what they are given.
 */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "21 September 2026", from the device's own calendar day, spelled out so it reads the same everywhere. */
export function longDateLabel(now: Date): string {
  return `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

interface Where {
  origin: string;
  slug: string;
}

export function boundaryData(input: {
  vehicle: Vehicle;
  items: MaintenanceItem[];
  requestedIds: Set<string>;
  alsoRequestedText: string;
  shop: string;
  callNumber: string;
  ceiling: string;
  askForOldParts: boolean;
  now: Date;
} & Where): ServiceBoundaryData {
  const { vehicle, items, requestedIds } = input;
  return {
    generatedLabel: longDateLabel(input.now),
    vehicle: { label: vehicle.label, year: vehicle.year, make: vehicle.make, model: vehicle.model, currentMileage: vehicle.currentMileage },
    shop: input.shop.trim(),
    callNumber: input.callNumber.trim(),
    ceiling: input.ceiling.trim(),
    requested: items.filter((i) => i.vehicleId === vehicle.id && i.status === "active" && requestedIds.has(i.id)).map((i) => i.taskName),
    alsoRequested: input.alsoRequestedText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== ""),
    askForOldParts: input.askForOldParts,
    origin: input.origin,
    slug: input.slug,
  };
}

export function recordData(input: { vehicle: Vehicle; events: ServiceEvent[]; now: Date } & Where): ServiceRecordData {
  const { vehicle } = input;
  return {
    generatedLabel: longDateLabel(input.now),
    vehicle: {
      label: vehicle.label,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      plate: vehicle.plate,
      vin: vehicle.vin,
      currentMileage: vehicle.currentMileage,
      mileageAsOf: vehicle.mileageUpdatedAt,
    },
    rows: recordForPrint(input.events, vehicle.id).map((e) => ({
      doneOn: e.doneOn,
      mileage: e.mileage,
      taskName: e.taskName,
      shop: e.shop,
      costMinorUnits: e.costMinorUnits,
      note: e.note,
    })),
    origin: input.origin,
    slug: input.slug,
  };
}

export function cardData(input: { vehicle: Vehicle; renewals: Renewal[]; now: Date } & Where): GloveBoxCardData {
  const { vehicle } = input;
  return {
    generatedLabel: longDateLabel(input.now),
    vehicle: {
      label: vehicle.label,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      plate: vehicle.plate,
      vin: vehicle.vin,
      tyreSize: vehicle.tyreSize,
      oilSpec: vehicle.oilSpec,
      insurer: vehicle.insurer,
      policyNumber: vehicle.policyNumber,
      roadsidePhone: vehicle.roadsidePhone,
      currentMileage: vehicle.currentMileage,
      mileageAsOf: vehicle.mileageUpdatedAt,
    },
    dates: input.renewals
      .filter((r) => r.vehicleId === vehicle.id && r.status === "active")
      .sort((a, b) => (a.dueOn < b.dueOn ? -1 : a.dueOn > b.dueOn ? 1 : 0))
      .map((r) => ({ title: renewalTitle(r), dueOn: r.dueOn, whereKept: r.whereKept })),
    origin: input.origin,
    slug: input.slug,
  };
}
