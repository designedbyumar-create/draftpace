/**
 * What Vehicle Maintenance Companion suggests, never what it assumes.
 *
 * A curated, hand-written list of common maintenance jobs and a generic
 * starting interval for each, the same never-AI discipline as Home
 * Base's homeKnowledge.ts: a plain, reviewable TypeScript file, not a
 * table that could drift per user and not a model call.
 *
 * THE RULE THIS FILE EXISTS TO ENFORCE
 *
 * Every interval here is a manufacturer-agnostic rule of thumb, useful
 * as a starting point and wrong for plenty of real vehicles. Nothing in
 * this product ever computes a due date from one of these numbers
 * silently: adding an item from a template copies the interval onto
 * that item as an ordinary, editable field the person can change before
 * or after saving, and every surface that shows one of these intervals
 * before it is copied says "typical" or "default", never states it as
 * fact. A car's own manual is always the real source; this file exists
 * so a person who does not have it in front of them is not stuck typing
 * a number from nothing.
 *
 * Deliberately short. This is not an attempt at a complete maintenance
 * schedule for every vehicle ever made, only the jobs common enough
 * that most people tracking a vehicle will want at least a few of them.
 */

export interface MaintenanceTemplate {
  /** Stable id, stored on a maintenance item's template_id. Never renumber or reuse one. */
  id: string;
  taskName: string;
  /** A typical starting interval. Always labelled "typical" wherever shown; always fully editable once copied onto an item. */
  typicalIntervalMiles: number | null;
  typicalIntervalMonths: number | null;
}

export const MAINTENANCE_TEMPLATES: MaintenanceTemplate[] = [
  { id: "oil-change", taskName: "Engine oil and filter change", typicalIntervalMiles: 5000, typicalIntervalMonths: 6 },
  { id: "tire-rotation", taskName: "Tire rotation", typicalIntervalMiles: 6000, typicalIntervalMonths: 6 },
  { id: "tire-replacement-check", taskName: "Tire tread and pressure check", typicalIntervalMiles: 6000, typicalIntervalMonths: 3 },
  { id: "cabin-air-filter", taskName: "Cabin air filter replacement", typicalIntervalMiles: 15000, typicalIntervalMonths: 12 },
  { id: "engine-air-filter", taskName: "Engine air filter replacement", typicalIntervalMiles: 15000, typicalIntervalMonths: 12 },
  { id: "brake-fluid", taskName: "Brake fluid flush", typicalIntervalMiles: 30000, typicalIntervalMonths: 24 },
  { id: "brake-inspection", taskName: "Brake pad and rotor inspection", typicalIntervalMiles: 12000, typicalIntervalMonths: 12 },
  { id: "coolant", taskName: "Coolant flush", typicalIntervalMiles: 60000, typicalIntervalMonths: 60 },
  { id: "transmission-fluid", taskName: "Transmission fluid service", typicalIntervalMiles: 60000, typicalIntervalMonths: null },
  { id: "spark-plugs", taskName: "Spark plug replacement", typicalIntervalMiles: 60000, typicalIntervalMonths: null },
  { id: "battery-check", taskName: "Battery test", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "wiper-blades", taskName: "Wiper blade replacement", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "alignment", taskName: "Wheel alignment check", typicalIntervalMiles: 12000, typicalIntervalMonths: 12 },
  { id: "registration-inspection", taskName: "Registration or safety inspection", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "tire-pressure", taskName: "Tire pressure check", typicalIntervalMiles: null, typicalIntervalMonths: 1 },
  { id: "washer-fluid", taskName: "Washer fluid top up", typicalIntervalMiles: null, typicalIntervalMonths: 3 },
  { id: "lights-check", taskName: "Lights and indicators check", typicalIntervalMiles: null, typicalIntervalMonths: 6 },
  { id: "tire-swap", taskName: "Winter and summer tire swap", typicalIntervalMiles: null, typicalIntervalMonths: 6 },
  { id: "ac-check", taskName: "Air conditioning check", typicalIntervalMiles: null, typicalIntervalMonths: 24 },
  { id: "timing-belt", taskName: "Timing belt replacement (if your engine has one)", typicalIntervalMiles: 90000, typicalIntervalMonths: 84 },
  { id: "emergency-kit", taskName: "Emergency kit check", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "underbody-rinse", taskName: "Underbody rinse after road salt", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "fuel-filter", taskName: "Fuel filter replacement", typicalIntervalMiles: 30000, typicalIntervalMonths: 24 },
  { id: "charging-check", taskName: "Charging port and cable check", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "hoses-belts", taskName: "Hoses and drive belt inspection", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
  { id: "suspension-check", taskName: "Suspension and steering check", typicalIntervalMiles: null, typicalIntervalMonths: 12 },
];

export function templateById(id: string): MaintenanceTemplate | null {
  return MAINTENANCE_TEMPLATES.find((template) => template.id === id) ?? null;
}

/**
 * A starting set of jobs somebody can add in one go, opt-in and never
 * automatic. Each entry is only a list of template ids, so every interval
 * on an added job is still the template's typical starting point, copied
 * onto an ordinary editable item. An added job has nothing recorded against
 * it, so it says "nothing to judge yet" until a real fact goes in; adding a
 * list can never make anything read as already overdue.
 */
export interface StarterList {
  id: string;
  name: string;
  blurb: string;
  templateIds: string[];
}

export const STARTER_LISTS: StarterList[] = [
  {
    id: "before-winter",
    name: "Before winter",
    blurb: "Cold is hard on batteries, tires and wipers.",
    templateIds: ["battery-check", "tire-swap", "tire-replacement-check", "wiper-blades", "washer-fluid", "lights-check", "emergency-kit"],
  },
  {
    id: "before-a-long-drive",
    name: "Before a long summer drive",
    blurb: "The checks worth doing before a road trip.",
    templateIds: ["oil-change", "tire-pressure", "tire-replacement-check", "brake-inspection", "coolant", "ac-check", "emergency-kit"],
  },
  {
    id: "once-a-year",
    name: "Once a year",
    blurb: "The yearly round most vehicles want.",
    templateIds: ["battery-check", "brake-inspection", "cabin-air-filter", "engine-air-filter", "wiper-blades", "alignment", "underbody-rinse"],
  },
  {
    id: "by-the-miles",
    name: "By the miles",
    blurb: "The bigger jobs that come round every so many thousand miles.",
    templateIds: ["oil-change", "tire-rotation", "brake-fluid", "spark-plugs", "transmission-fluid", "coolant", "timing-belt"],
  },
];

export function starterListById(id: string): StarterList | null {
  return STARTER_LISTS.find((list) => list.id === id) ?? null;
}

/**
 * The templates in a list that are not already tracked on a vehicle,
 * matched by the template an item started from, or by its name for a job
 * somebody typed themselves. Adding the same list twice adds nothing.
 */
export function templatesToAdd(list: StarterList, tracked: { templateId: string | null; taskName: string }[]): MaintenanceTemplate[] {
  const haveIds = new Set(tracked.map((item) => item.templateId).filter((id): id is string => id !== null));
  const haveNames = new Set(tracked.map((item) => item.taskName.trim().toLowerCase()));
  return list.templateIds
    .map((id) => templateById(id))
    .filter((template): template is MaintenanceTemplate => template !== null)
    .filter((template) => !haveIds.has(template.id) && !haveNames.has(template.taskName.trim().toLowerCase()));
}
