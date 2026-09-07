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
];

export function templateById(id: string): MaintenanceTemplate | null {
  return MAINTENANCE_TEMPLATES.find((template) => template.id === id) ?? null;
}
