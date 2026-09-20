import { templateById, type MaintenanceTemplate } from "./vehicleKnowledge";
import type { FuelType, Vehicle } from "./state";

/**
 * What kind of vehicle it is decides which typical jobs are worth
 * suggesting, and nothing else. This is deliberately not a schedule for any
 * make or model: there is no way to verify or keep current what every
 * manufacturer says for every engine, trim and country, and a wrong number
 * here would send somebody to skip a service or pay for one they did not
 * need. What a fuel type does change is not in doubt: an electric vehicle
 * has no engine oil and no spark plugs, a diesel has a fuel filter. Every
 * interval is still a "typical" starting point copied onto an ordinary
 * editable job, and the manual is always the real source.
 */

export const FUEL_LABEL: Record<FuelType, string> = {
  petrol: "petrol",
  diesel: "diesel",
  hybrid: "hybrid",
  "plugin-hybrid": "plug-in hybrid",
  electric: "electric",
};

/** A vehicle this old, or this far along, is offered a few jobs a younger one does not need yet. */
export const OLDER_AT_YEARS = 8;
export const HIGH_MILEAGE = 90_000;

/** The jobs whose interval shortens under hard use. The others do not care how the vehicle is driven. */
const SEVERE_DUTY_SENSITIVE = new Set(["oil-change", "engine-air-filter", "transmission-fluid", "spark-plugs", "brake-inspection"]);

const BASE: Record<FuelType, string[]> = {
  petrol: ["oil-change", "tire-rotation", "tire-replacement-check", "brake-inspection", "cabin-air-filter", "engine-air-filter", "battery-check", "wiper-blades", "brake-fluid", "coolant", "spark-plugs", "transmission-fluid"],
  diesel: ["oil-change", "tire-rotation", "tire-replacement-check", "brake-inspection", "cabin-air-filter", "engine-air-filter", "fuel-filter", "battery-check", "wiper-blades", "brake-fluid", "coolant", "transmission-fluid"],
  hybrid: ["oil-change", "tire-rotation", "tire-replacement-check", "brake-inspection", "cabin-air-filter", "engine-air-filter", "battery-check", "wiper-blades", "brake-fluid", "coolant", "spark-plugs"],
  "plugin-hybrid": ["oil-change", "tire-rotation", "tire-replacement-check", "brake-inspection", "cabin-air-filter", "engine-air-filter", "battery-check", "charging-check", "wiper-blades", "brake-fluid", "coolant", "spark-plugs"],
  electric: ["tire-rotation", "tire-replacement-check", "brake-inspection", "cabin-air-filter", "battery-check", "charging-check", "wiper-blades", "brake-fluid", "coolant"],
};

/** Added for age or mileage. A timing belt only for a vehicle that has an engine. */
function extras(fuel: FuelType): string[] {
  return fuel === "electric" ? ["hoses-belts", "suspension-check"] : ["hoses-belts", "suspension-check", "timing-belt"];
}

export interface ProfileList {
  name: string;
  blurb: string;
  jobs: { template: MaintenanceTemplate; severeDuty: boolean }[];
}

/**
 * The usual jobs for this kind of vehicle, or null when it has not been
 * said what kind it is: nothing is guessed from a name.
 */
export function profileList(vehicle: Pick<Vehicle, "fuelType" | "year" | "currentMileage" | "hardUse">, now: Date = new Date()): ProfileList | null {
  const fuel = vehicle.fuelType;
  if (fuel === null) return null;

  const old = vehicle.year !== null && now.getFullYear() - vehicle.year >= OLDER_AT_YEARS;
  const far = vehicle.currentMileage !== null && vehicle.currentMileage >= HIGH_MILEAGE;
  const ids = [...BASE[fuel], ...(old || far ? extras(fuel) : [])];

  const reasons: string[] = [];
  if (old) reasons.push("its age");
  if (far) reasons.push("its mileage");

  return {
    name: `The usual for a ${FUEL_LABEL[fuel]} vehicle`,
    blurb: `Typical jobs for a ${FUEL_LABEL[fuel]} vehicle${reasons.length > 0 ? `, with a few more for ${reasons.join(" and ")}` : ""}. Every interval is a starting point you can change; your manual is the real source.`,
    jobs: ids
      .map((id) => templateById(id))
      .filter((template): template is MaintenanceTemplate => template !== null)
      .map((template) => ({ template, severeDuty: vehicle.hardUse && SEVERE_DUTY_SENSITIVE.has(template.id) })),
  };
}

/** The jobs in a profile list not already tracked, matched by template or by name, so adding it twice adds nothing. */
export function profileJobsToAdd(list: ProfileList, tracked: { templateId: string | null; taskName: string }[]): ProfileList["jobs"] {
  const haveIds = new Set(tracked.map((t) => t.templateId).filter((id): id is string => id !== null));
  const haveNames = new Set(tracked.map((t) => t.taskName.trim().toLowerCase()));
  return list.jobs.filter(({ template }) => !haveIds.has(template.id) && !haveNames.has(template.taskName.trim().toLowerCase()));
}
