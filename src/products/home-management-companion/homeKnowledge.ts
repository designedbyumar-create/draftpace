/**
 * What Home Base knows about a home without being told.
 *
 * This is a curated rules layer, deliberately a plain TypeScript file
 * rather than a table or a graph: it is reviewable in a pull request,
 * diffable, and cannot drift per user. Same never-AI discipline as
 * import/extractFromText.ts: no model provider is configured anywhere in
 * this repository, this is pattern matching against a hand-written list.
 *
 * Two jobs:
 *
 * 1. Propose care when someone adds an object ("this looks like a water
 *    heater, these are the usual jobs"). Nothing here ever creates a
 *    task on its own. Every proposal is confirmed item by item.
 *
 * 2. Tell attention.ts how much a given piece of care actually matters.
 *    Before this file carried consequence and effort, every maintenance
 *    task was scored with the same hardcoded constants, so a dryer vent
 *    (a genuine fire risk) and a detergent drawer (cosmetic) ranked
 *    identically once both were due. Consequence and effort are what
 *    make urgency honest rather than a countdown.
 *
 * Deliberately absent: typical lifespans and replacement costs. Those
 * pull the product toward valuation and remodel planning, which is the
 * breadth trap this product is positioned against.
 */

/** How bad it is to keep putting this off: 0 cosmetic, 1 costly over time, 2 safety or serious damage. */
export type CareConsequence = 0 | 1 | 2;

/** What it takes to actually do it: 0 a few minutes, 1 an afternoon, 2 booking somebody. */
export type CareEffort = 0 | 1 | 2;

export interface CareTemplate {
  /**
   * Stable identifier stored on a task's care_template_id so scoring can
   * find this entry again later. Never renumber or reuse an id: a task
   * created last year still points at it.
   */
  id: string;
  taskName: string;
  intervalDays: number;
  consequence: CareConsequence;
  effort: CareEffort;
  /**
   * Months (1 to 12) this job actually belongs to, when it is tied to a
   * time of year rather than a rolling interval.
   *
   * Blowing out an irrigation system belongs in October, not three
   * hundred and sixty five days after somebody happened to add it. About
   * a third of outdoor care is like this, and treating it as an interval
   * means nagging people to winterise in July.
   *
   * Stored here rather than on the task, because the task already
   * records which template it came from and a season is knowledge about
   * the job, not about one household's copy of it.
   */
  months?: number[];
}

/**
 * Categories organise this file and decide what onboarding offers. They
 * are never navigation: nobody using Home Base ever sees a list of
 * twelve of anything. Home stays one screen.
 */
export type HomeItemCategory =
  | "kitchen"
  | "laundry"
  | "climate"
  | "water"
  | "power"
  | "safety"
  | "structure"
  | "grounds"
  | "pests"
  | "everyday"
  | "records"
  | "renting";

export const HOME_ITEM_CATEGORY_LABEL: Record<HomeItemCategory, string> = {
  kitchen: "Kitchen",
  laundry: "Laundry",
  climate: "Heating, cooling and air",
  water: "Water and plumbing",
  power: "Power and electrical",
  safety: "Safety and security",
  structure: "Structure and exterior",
  grounds: "Grounds and garden",
  pests: "Pests and damp",
  everyday: "Everyday things",
  records: "Papers and facts",
  renting: "Renting",
};

/**
 * The identity facts worth asking about, which depend on what kind of
 * thing it is.
 *
 * These fields were designed when this product only tracked appliances,
 * and every one of them makes sense for a dishwasher. Applied uniformly
 * they stop making sense fast: a lease has no model number, a deed has
 * no brand, and a rodent check was never purchased. Asking anyway is how
 * a product tells somebody it does not really understand what they just
 * added, and the detail page answers with a column of "Not set" that
 * reads like the person failed to finish something.
 *
 * A value that already exists is always shown, whatever the category, so
 * narrowing this can never hide something somebody deliberately entered.
 */
export type HomeItemIdentityField = "brand" | "model" | "purchaseDate" | "installDate" | "warrantyExpiresAt";

const APPLIANCE_FIELDS: HomeItemIdentityField[] = ["brand", "model", "purchaseDate", "installDate", "warrantyExpiresAt"];

const IDENTITY_FIELDS_BY_CATEGORY: Record<HomeItemCategory, HomeItemIdentityField[]> = {
  kitchen: APPLIANCE_FIELDS,
  laundry: APPLIANCE_FIELDS,
  climate: APPLIANCE_FIELDS,
  water: APPLIANCE_FIELDS,
  power: APPLIANCE_FIELDS,
  safety: APPLIANCE_FIELDS,
  everyday: APPLIANCE_FIELDS,
  grounds: APPLIANCE_FIELDS,
  // A roof or a driveway is installed rather than bought, and usually by
  // somebody the previous owner hired, so a purchase date is a question
  // almost nobody can answer.
  structure: ["brand", "model", "installDate", "warrantyExpiresAt"],
  // Damp and rodents are conditions, not products.
  pests: [],
  // A deed, a policy or a filter size has no make and model.
  records: [],
  // A lease has dates of its own, kept on the lease itself.
  renting: [],
};

export function identityFieldsFor(category: HomeItemCategory | null): HomeItemIdentityField[] {
  // An unrecognised type gets every field: better to ask than to hide a
  // question somebody might have wanted, since custom items are exactly
  // the ones this file knows nothing about.
  if (!category) return APPLIANCE_FIELDS;
  return IDENTITY_FIELDS_BY_CATEGORY[category] ?? APPLIANCE_FIELDS;
}

/** The category a stored `type` belongs to, or null when it is a custom one. */
export function categoryOfType(type: string): HomeItemCategory | null {
  return HOME_ITEM_TYPES.find((definition) => definition.id === type)?.category ?? null;
}

export interface HomeItemTypeDefinition {
  /** Matches the open `type` field on a home item once assigned, e.g. "water-heater". */
  id: string;
  label: string;
  category: HomeItemCategory;
  /** Whole words checked against an object's own name for a first-pass match. */
  matchKeywords: string[];
  /**
   * True when this applies without owning the place. Onboarding uses it
   * to avoid asking a renter about their roof, and to still offer them
   * the filters and batteries their lease puts on them.
   */
  renterRelevant?: boolean;
  /**
   * Worth offering unprompted when somebody is first setting up.
   *
   * A short, curated list, not everything. Setup asking about all 121
   * types would be the data-entry exercise this product exists to avoid;
   * the point is to name the handful nearly every home has so somebody
   * can tap rather than type, and add the rest whenever they think of it.
   */
  offerAtSetup?: boolean;
  /** Empty for things worth recording but needing nothing: a shutoff location, a policy, a paint colour. */
  care: CareTemplate[];
}

export const HOME_ITEM_TYPES: HomeItemTypeDefinition[] = [
  // ---------------------------------------------------------------- Kitchen
  {
    id: "refrigerator", label: "Refrigerator", category: "kitchen", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["refrigerator", "fridge"],
    care: [
      { id: "refrigerator.water-filter", taskName: "Replace the water filter", intervalDays: 180, consequence: 0, effort: 0 },
      { id: "refrigerator.condenser-coils", taskName: "Clean the condenser coils", intervalDays: 180, consequence: 1, effort: 1 },
      { id: "refrigerator.door-seals", taskName: "Check the door seals", intervalDays: 365, consequence: 0, effort: 0 },
    ],
  },
  {
    id: "freezer", label: "Freezer", category: "kitchen", renterRelevant: true,
    matchKeywords: ["freezer", "deep freeze"],
    care: [{ id: "freezer.defrost", taskName: "Defrost and clean", intervalDays: 365, consequence: 0, effort: 1 }],
  },
  {
    id: "dishwasher", label: "Dishwasher", category: "kitchen", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["dishwasher"],
    care: [
      { id: "dishwasher.filter", taskName: "Clean the filter", intervalDays: 30, consequence: 0, effort: 0 },
      { id: "dishwasher.cleaning-cycle", taskName: "Run a cleaning cycle", intervalDays: 90, consequence: 0, effort: 0 },
    ],
  },
  {
    id: "oven", label: "Oven or range", category: "kitchen", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["oven", "range", "stove", "cooktop"],
    care: [{ id: "oven.deep-clean", taskName: "Deep clean", intervalDays: 90, consequence: 0, effort: 1 }],
  },
  {
    id: "range-hood", label: "Range hood", category: "kitchen", renterRelevant: true,
    matchKeywords: ["range hood", "extractor", "vent hood"],
    care: [{ id: "range-hood.filter", taskName: "Degrease the filter", intervalDays: 30, consequence: 2, effort: 0 }],
  },
  {
    id: "microwave", label: "Microwave", category: "kitchen", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["microwave"],
    care: [{ id: "microwave.filter", taskName: "Replace the grease and charcoal filters", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "garbage-disposal", label: "Garbage disposal", category: "kitchen", renterRelevant: true,
    matchKeywords: ["garbage disposal", "waste disposal", "disposal"],
    care: [{ id: "garbage-disposal.flush", taskName: "Flush and clean the splash guard", intervalDays: 30, consequence: 0, effort: 0 }],
  },
  {
    id: "ice-maker", label: "Ice maker", category: "kitchen", renterRelevant: true,
    matchKeywords: ["ice maker", "ice machine"],
    care: [{ id: "ice-maker.filter", taskName: "Replace the filter and sanitise the bin", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "coffee-machine", label: "Coffee machine", category: "kitchen", renterRelevant: true,
    matchKeywords: ["coffee machine", "espresso machine", "coffee maker"],
    care: [{ id: "coffee-machine.descale", taskName: "Descale", intervalDays: 60, consequence: 0, effort: 0 }],
  },

  // ---------------------------------------------------------------- Laundry
  {
    id: "washer", label: "Washing machine", category: "laundry", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["washing machine", "washer"],
    care: [
      { id: "washer.cleaning-cycle", taskName: "Run a cleaning cycle", intervalDays: 90, consequence: 0, effort: 0 },
      { id: "washer.detergent-drawer", taskName: "Clean the detergent drawer", intervalDays: 30, consequence: 0, effort: 0 },
      { id: "washer.hoses", taskName: "Replace the fill hoses", intervalDays: 1825, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "dryer", label: "Dryer", category: "laundry", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["dryer", "tumble dryer"],
    care: [{ id: "dryer.vent", taskName: "Clean the dryer vent", intervalDays: 365, consequence: 2, effort: 1 }],
  },
  {
    id: "utility-sink", label: "Utility sink", category: "laundry",
    matchKeywords: ["utility sink", "laundry sink", "slop sink"],
    care: [{ id: "utility-sink.trap", taskName: "Check the trap and drain", intervalDays: 365, consequence: 0, effort: 0 }],
  },

  // ------------------------------------------------- Heating, cooling, air
  {
    id: "furnace", label: "Furnace", category: "climate", offerAtSetup: true,
    matchKeywords: ["furnace"],
    care: [
      { id: "furnace.air-filter", taskName: "Replace the air filter", intervalDays: 90, consequence: 1, effort: 0 },
      { id: "furnace.tune-up", taskName: "Book a professional tune-up", intervalDays: 365, consequence: 1, effort: 2, months: [9, 10] },
      { id: "furnace.flue", taskName: "Check the flue and exhaust", intervalDays: 365, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "central-air", label: "Central air conditioning", category: "climate", offerAtSetup: true,
    matchKeywords: ["central air", "air conditioning", "air conditioner"],
    care: [
      { id: "central-air.filter", taskName: "Replace the air filter", intervalDays: 90, consequence: 1, effort: 0 },
      { id: "central-air.service", taskName: "Book a service before the season", intervalDays: 365, consequence: 1, effort: 2, months: [4, 5] },
      { id: "central-air.condensate", taskName: "Clear the condensate drain line", intervalDays: 90, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "hvac", label: "HVAC system", category: "climate",
    matchKeywords: ["hvac"],
    care: [
      { id: "hvac.air-filter", taskName: "Replace the air filter", intervalDays: 90, consequence: 1, effort: 0 },
      { id: "hvac.tune-up", taskName: "Book a professional tune-up", intervalDays: 365, consequence: 1, effort: 2 },
    ],
  },
  {
    id: "heat-pump", label: "Heat pump", category: "climate",
    matchKeywords: ["heat pump"],
    care: [
      { id: "heat-pump.filter", taskName: "Replace the filter", intervalDays: 90, consequence: 1, effort: 0 },
      { id: "heat-pump.coils", taskName: "Clean the outdoor coils", intervalDays: 365, consequence: 1, effort: 1 },
    ],
  },
  {
    id: "mini-split", label: "Mini split", category: "climate", renterRelevant: true,
    matchKeywords: ["mini split", "ductless"],
    care: [{ id: "mini-split.filter", taskName: "Wash the filters", intervalDays: 30, consequence: 1, effort: 0 }],
  },
  {
    id: "boiler", label: "Boiler", category: "climate",
    matchKeywords: ["boiler"],
    care: [
      { id: "boiler.service", taskName: "Annual service", intervalDays: 365, consequence: 2, effort: 2, months: [9] },
      { id: "boiler.bleed", taskName: "Bleed the radiators", intervalDays: 365, consequence: 0, effort: 1, months: [10] },
    ],
  },
  {
    id: "window-ac", label: "Window air conditioner", category: "climate", renterRelevant: true,
    matchKeywords: ["window ac", "window air conditioner", "window unit"],
    care: [
      { id: "window-ac.filter", taskName: "Clean the filter", intervalDays: 30, consequence: 0, effort: 0 },
      { id: "window-ac.store", taskName: "Remove and store for winter", intervalDays: 365, consequence: 0, effort: 1, months: [10] },
    ],
  },
  {
    id: "thermostat", label: "Thermostat", category: "climate", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["thermostat"],
    care: [{ id: "thermostat.battery", taskName: "Replace the battery", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "air-ducts", label: "Air ducts", category: "climate",
    matchKeywords: ["air ducts", "ductwork", "ducts"],
    care: [{ id: "air-ducts.clean", taskName: "Professional duct clean", intervalDays: 1460, consequence: 0, effort: 2 }],
  },
  {
    id: "humidifier", label: "Humidifier", category: "climate", renterRelevant: true,
    matchKeywords: ["humidifier"],
    care: [{ id: "humidifier.pad", taskName: "Replace the pad", intervalDays: 365, consequence: 0, effort: 0, months: [10] }],
  },
  {
    id: "dehumidifier", label: "Dehumidifier", category: "climate", renterRelevant: true,
    matchKeywords: ["dehumidifier"],
    care: [{ id: "dehumidifier.filter", taskName: "Clean the filter and coils", intervalDays: 90, consequence: 0, effort: 0 }],
  },
  {
    id: "air-purifier", label: "Air purifier", category: "climate", renterRelevant: true,
    matchKeywords: ["air purifier", "air filter unit"],
    care: [{ id: "air-purifier.filter", taskName: "Replace the filter", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "ceiling-fan", label: "Ceiling fan", category: "climate", renterRelevant: true,
    matchKeywords: ["ceiling fan"],
    care: [{ id: "ceiling-fan.reverse", taskName: "Reverse the direction and dust the blades", intervalDays: 180, consequence: 0, effort: 0, months: [4, 10] }],
  },

  // ------------------------------------------------------ Water and plumbing
  {
    id: "water-heater", label: "Water heater", category: "water", offerAtSetup: true,
    matchKeywords: ["water heater", "hot water heater", "hot water tank"],
    care: [
      { id: "water-heater.flush-tank", taskName: "Flush the tank", intervalDays: 365, consequence: 1, effort: 1 },
      { id: "water-heater.pressure-valve", taskName: "Test the pressure relief valve", intervalDays: 365, consequence: 2, effort: 0 },
      { id: "water-heater.anode-rod", taskName: "Inspect the anode rod", intervalDays: 1460, consequence: 1, effort: 2 },
    ],
  },
  {
    id: "tankless-water-heater", label: "Tankless water heater", category: "water",
    matchKeywords: ["tankless water heater", "tankless", "combi boiler"],
    care: [{ id: "tankless-water-heater.descale", taskName: "Descale the unit", intervalDays: 365, consequence: 1, effort: 2 }],
  },
  {
    id: "water-softener", label: "Water softener", category: "water",
    matchKeywords: ["water softener", "softener"],
    care: [
      { id: "water-softener.salt", taskName: "Top up the salt", intervalDays: 60, consequence: 0, effort: 0 },
      { id: "water-softener.resin", taskName: "Clean the resin bed", intervalDays: 365, consequence: 0, effort: 1 },
    ],
  },
  {
    id: "water-filter", label: "Whole-house water filter", category: "water",
    matchKeywords: ["whole house filter", "water filter"],
    care: [{ id: "water-filter.cartridge", taskName: "Replace the cartridge", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "well", label: "Well and pump", category: "water",
    matchKeywords: ["well pump", "well water", "well"],
    care: [
      { id: "well.water-test", taskName: "Test the water quality", intervalDays: 365, consequence: 2, effort: 1 },
      { id: "well.pressure-tank", taskName: "Check the pressure tank", intervalDays: 365, consequence: 1, effort: 1 },
    ],
  },
  {
    id: "septic", label: "Septic system", category: "water",
    matchKeywords: ["septic", "septic tank"],
    care: [
      { id: "septic.pump", taskName: "Pump the tank", intervalDays: 1460, consequence: 2, effort: 2 },
      { id: "septic.drain-field", taskName: "Check the drain field", intervalDays: 365, consequence: 1, effort: 1 },
    ],
  },
  {
    id: "sewer-line", label: "Sewer line", category: "water",
    matchKeywords: ["sewer line", "main drain"],
    care: [{ id: "sewer-line.camera", taskName: "Camera inspection", intervalDays: 1825, consequence: 2, effort: 2 }],
  },
  {
    id: "sump-pump", label: "Sump pump", category: "water",
    matchKeywords: ["sump pump"],
    care: [
      { id: "sump-pump.test", taskName: "Test that it runs", intervalDays: 180, consequence: 2, effort: 0 },
      { id: "sump-pump.battery", taskName: "Check the backup battery", intervalDays: 365, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "water-shutoff", label: "Main water shutoff", category: "water", renterRelevant: true,
    matchKeywords: ["water shutoff", "shut off valve", "stopcock", "water main"],
    care: [{ id: "water-shutoff.exercise", taskName: "Turn the valve to keep it free", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "hose-bib", label: "Outdoor faucet", category: "water",
    matchKeywords: ["hose bib", "outdoor faucet", "spigot", "outside tap"],
    care: [{ id: "hose-bib.winterize", taskName: "Shut off and drain before the freeze", intervalDays: 365, consequence: 2, effort: 0, months: [10, 11] }],
  },
  {
    id: "toilet", label: "Toilet", category: "water", renterRelevant: true,
    matchKeywords: ["toilet"],
    care: [{ id: "toilet.flapper", taskName: "Replace the flapper and check the supply line", intervalDays: 1825, consequence: 1, effort: 0 }],
  },
  {
    id: "faucet", label: "Faucet", category: "water", renterRelevant: true,
    matchKeywords: ["faucet", "tap", "aerator"],
    care: [{ id: "faucet.aerator", taskName: "Descale the aerator", intervalDays: 365, consequence: 0, effort: 0 }],
  },
  {
    id: "pressure-regulator", label: "Water pressure regulator", category: "water",
    matchKeywords: ["pressure regulator", "prv"],
    care: [{ id: "pressure-regulator.check", taskName: "Check the water pressure", intervalDays: 730, consequence: 1, effort: 1 }],
  },

  // --------------------------------------------------- Power and electrical
  {
    id: "breaker-panel", label: "Breaker panel", category: "power", renterRelevant: true,
    matchKeywords: ["breaker panel", "electrical panel", "fuse box", "consumer unit"],
    care: [{ id: "breaker-panel.labels", taskName: "Check the circuits are labelled", intervalDays: 1825, consequence: 1, effort: 1 }],
  },
  {
    id: "gfci-outlet", label: "GFCI outlets", category: "power", renterRelevant: true,
    matchKeywords: ["gfci", "gfi", "rcd outlet", "afci"],
    care: [{ id: "gfci-outlet.test", taskName: "Press the test button", intervalDays: 30, consequence: 2, effort: 0 }],
  },
  {
    id: "generator", label: "Standby generator", category: "power",
    matchKeywords: ["standby generator", "whole house generator", "generator"],
    care: [
      { id: "generator.test-run", taskName: "Run a test cycle", intervalDays: 30, consequence: 2, effort: 0 },
      { id: "generator.oil", taskName: "Change the oil and filter", intervalDays: 365, consequence: 1, effort: 2 },
    ],
  },
  {
    id: "solar", label: "Solar panels", category: "power",
    matchKeywords: ["solar panels", "solar array", "solar"],
    care: [{ id: "solar.inspect", taskName: "Clean and check output", intervalDays: 365, consequence: 1, effort: 1 }],
  },
  {
    id: "home-battery", label: "Home battery", category: "power",
    matchKeywords: ["home battery", "powerwall", "battery backup"],
    care: [{ id: "home-battery.health", taskName: "Check health and firmware", intervalDays: 180, consequence: 1, effort: 0 }],
  },
  {
    id: "ev-charger", label: "EV charger", category: "power",
    matchKeywords: ["ev charger", "car charger", "wallbox"],
    care: [{ id: "ev-charger.inspect", taskName: "Inspect the cable and connector", intervalDays: 180, consequence: 2, effort: 0 }],
  },
  {
    id: "surge-protector", label: "Surge protector", category: "power", renterRelevant: true,
    matchKeywords: ["surge protector", "surge suppressor"],
    care: [{ id: "surge-protector.replace", taskName: "Replace it, they wear out silently", intervalDays: 1825, consequence: 1, effort: 0 }],
  },
  {
    id: "outdoor-lighting", label: "Outdoor lighting", category: "power",
    matchKeywords: ["outdoor lighting", "landscape lighting", "porch light"],
    care: [{ id: "outdoor-lighting.timer", taskName: "Adjust the timer and replace bulbs", intervalDays: 180, consequence: 0, effort: 0, months: [3, 10] }],
  },

  // --------------------------------------------------- Safety and security
  {
    id: "smoke-detector", label: "Smoke or CO detector", category: "safety", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["smoke detector", "smoke alarm", "carbon monoxide", "co detector"],
    care: [
      { id: "smoke-detector.test", taskName: "Press the test button", intervalDays: 30, consequence: 2, effort: 0 },
      { id: "smoke-detector.battery", taskName: "Replace the battery", intervalDays: 180, consequence: 2, effort: 0 },
      { id: "smoke-detector.replace-unit", taskName: "Replace the unit, they expire", intervalDays: 3650, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "fire-extinguisher", label: "Fire extinguisher", category: "safety", renterRelevant: true,
    matchKeywords: ["fire extinguisher", "extinguisher"],
    care: [
      { id: "fire-extinguisher.gauge", taskName: "Check the pressure gauge", intervalDays: 30, consequence: 2, effort: 0 },
      { id: "fire-extinguisher.replace", taskName: "Service or replace", intervalDays: 3650, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "radon-system", label: "Radon system", category: "safety",
    matchKeywords: ["radon"],
    care: [{ id: "radon-system.retest", taskName: "Retest the levels", intervalDays: 730, consequence: 2, effort: 1 }],
  },
  {
    id: "gas-shutoff", label: "Gas shutoff", category: "safety", renterRelevant: true,
    matchKeywords: ["gas shutoff", "gas valve", "gas meter"],
    care: [],
  },
  {
    id: "escape-ladder", label: "Escape ladder", category: "safety", renterRelevant: true,
    matchKeywords: ["escape ladder", "fire ladder"],
    care: [{ id: "escape-ladder.check", taskName: "Check it deploys and everyone knows where it is", intervalDays: 365, consequence: 2, effort: 0 }],
  },
  {
    id: "security-system", label: "Security system", category: "safety", renterRelevant: true,
    matchKeywords: ["security system", "alarm system", "burglar alarm"],
    care: [{ id: "security-system.test", taskName: "Test the sensors and backup battery", intervalDays: 180, consequence: 1, effort: 0 }],
  },
  {
    id: "camera", label: "Camera or video doorbell", category: "safety", renterRelevant: true,
    matchKeywords: ["security camera", "video doorbell", "doorbell camera", "cctv"],
    care: [{ id: "camera.maintain", taskName: "Clean the lens and check storage", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "lock", label: "Locks and deadbolts", category: "safety", renterRelevant: true,
    matchKeywords: ["deadbolt", "door lock", "smart lock"],
    care: [{ id: "lock.lubricate", taskName: "Lubricate and check alignment", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "first-aid-kit", label: "First aid kit", category: "safety", renterRelevant: true,
    matchKeywords: ["first aid"],
    care: [{ id: "first-aid-kit.restock", taskName: "Check expiry dates and restock", intervalDays: 365, consequence: 1, effort: 0 }],
  },

  // ------------------------------------------- Structure, exterior, access
  {
    id: "roof", label: "Roof", category: "structure", offerAtSetup: true,
    matchKeywords: ["roof", "shingles"],
    care: [{ id: "roof.inspect", taskName: "Inspect for damage", intervalDays: 365, consequence: 2, effort: 1, months: [4] }],
  },
  {
    id: "gutter", label: "Gutters", category: "structure", offerAtSetup: true,
    matchKeywords: ["gutters", "gutter", "downspout", "eavestrough"],
    care: [{ id: "gutter.clean", taskName: "Clear the gutters", intervalDays: 180, consequence: 1, effort: 2, months: [4, 11] }],
  },
  {
    id: "siding", label: "Siding", category: "structure",
    matchKeywords: ["siding", "cladding"],
    care: [{ id: "siding.wash", taskName: "Wash and inspect", intervalDays: 365, consequence: 0, effort: 2, months: [5] }],
  },
  {
    id: "window", label: "Windows", category: "structure",
    matchKeywords: ["windows", "window"],
    care: [{ id: "window.caulk", taskName: "Check the caulk and seals", intervalDays: 365, consequence: 1, effort: 1, months: [9] }],
  },
  {
    id: "exterior-door", label: "Exterior doors", category: "structure",
    matchKeywords: ["exterior door", "front door", "back door", "storm door"],
    care: [{ id: "exterior-door.weatherstrip", taskName: "Check the weatherstripping", intervalDays: 365, consequence: 0, effort: 0, months: [10] }],
  },
  {
    id: "foundation", label: "Foundation", category: "structure",
    matchKeywords: ["foundation"],
    care: [{ id: "foundation.inspect", taskName: "Walk it and look for new cracks", intervalDays: 365, consequence: 2, effort: 1 }],
  },
  {
    id: "attic", label: "Attic", category: "structure",
    matchKeywords: ["attic", "loft"],
    care: [{ id: "attic.inspect", taskName: "Check ventilation, insulation and for leaks", intervalDays: 365, consequence: 1, effort: 1 }],
  },
  {
    id: "crawl-space", label: "Crawl space", category: "structure",
    matchKeywords: ["crawl space", "crawlspace"],
    care: [{ id: "crawl-space.moisture", taskName: "Check the vapour barrier and for standing water", intervalDays: 365, consequence: 2, effort: 1 }],
  },
  {
    id: "chimney", label: "Chimney or fireplace", category: "structure",
    matchKeywords: ["chimney", "fireplace", "wood stove", "flue"],
    care: [{ id: "chimney.sweep", taskName: "Inspect and sweep", intervalDays: 365, consequence: 2, effort: 2, months: [9] }],
  },
  {
    id: "deck", label: "Deck", category: "structure",
    matchKeywords: ["deck", "decking"],
    care: [
      { id: "deck.seal", taskName: "Seal or stain", intervalDays: 1095, consequence: 1, effort: 2, months: [5] },
      { id: "deck.fasteners", taskName: "Check joists, ledger and fasteners", intervalDays: 365, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "patio", label: "Patio", category: "structure",
    matchKeywords: ["patio", "pavers"],
    care: [{ id: "patio.reseal", taskName: "Clean and reseal", intervalDays: 1095, consequence: 0, effort: 2 }],
  },
  {
    id: "fence", label: "Fence", category: "structure",
    matchKeywords: ["fence", "fencing"],
    care: [{ id: "fence.inspect", taskName: "Check the posts and stain", intervalDays: 1095, consequence: 0, effort: 2, months: [5] }],
  },
  {
    id: "driveway", label: "Driveway", category: "structure",
    matchKeywords: ["driveway", "blacktop", "asphalt"],
    care: [{ id: "driveway.seal", taskName: "Sealcoat and fill cracks", intervalDays: 1095, consequence: 0, effort: 2, months: [6] }],
  },
  {
    id: "garage-door", label: "Garage door", category: "structure", offerAtSetup: true,
    matchKeywords: ["garage door"],
    care: [
      { id: "garage-door.lubricate", taskName: "Lubricate the hinges and rollers", intervalDays: 180, consequence: 0, effort: 0 },
      { id: "garage-door.auto-reverse", taskName: "Test the auto-reverse safety stop", intervalDays: 180, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "garage-opener", label: "Garage door opener", category: "structure",
    matchKeywords: ["garage opener", "garage door opener"],
    care: [{ id: "garage-opener.battery", taskName: "Check the backup and remote batteries", intervalDays: 365, consequence: 0, effort: 0 }],
  },
  {
    id: "shed", label: "Shed", category: "structure",
    matchKeywords: ["shed", "outbuilding"],
    care: [{ id: "shed.inspect", taskName: "Check the roof, door and for damp", intervalDays: 365, consequence: 0, effort: 1 }],
  },
  {
    id: "retaining-wall", label: "Retaining wall", category: "structure",
    matchKeywords: ["retaining wall"],
    care: [{ id: "retaining-wall.inspect", taskName: "Check for bulging and drainage behind it", intervalDays: 365, consequence: 2, effort: 1 }],
  },

  // ------------------------------------------------------ Grounds and garden
  {
    id: "irrigation", label: "Irrigation system", category: "grounds", offerAtSetup: true,
    matchKeywords: ["irrigation", "sprinkler system", "sprinklers"],
    care: [
      { id: "irrigation.blowout", taskName: "Blow out the lines before the freeze", intervalDays: 365, consequence: 2, effort: 2, months: [10] },
      { id: "irrigation.backflow-test", taskName: "Backflow test, often legally required", intervalDays: 365, consequence: 2, effort: 2, months: [5] },
      { id: "irrigation.heads", taskName: "Check and adjust the heads", intervalDays: 365, consequence: 0, effort: 1, months: [4] },
    ],
  },
  {
    id: "lawn", label: "Lawn", category: "grounds", offerAtSetup: true,
    matchKeywords: ["lawn", "grass", "yard"],
    care: [
      { id: "lawn.feed", taskName: "Feed and weed", intervalDays: 182, consequence: 0, effort: 1, months: [4, 9] },
      { id: "lawn.aerate", taskName: "Aerate and overseed", intervalDays: 365, consequence: 0, effort: 2, months: [9] },
    ],
  },
  {
    id: "tree", label: "Trees", category: "grounds",
    matchKeywords: ["tree", "trees"],
    care: [
      { id: "tree.trim", taskName: "Trim back from the house and lines", intervalDays: 730, consequence: 2, effort: 2, months: [2] },
      { id: "tree.inspect", taskName: "Check for deadfall and disease", intervalDays: 365, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "shrub", label: "Shrubs and hedges", category: "grounds",
    matchKeywords: ["shrubs", "hedge", "hedges", "bushes"],
    care: [{ id: "shrub.prune", taskName: "Prune back from siding and vents", intervalDays: 182, consequence: 0, effort: 1, months: [3, 9] }],
  },
  {
    id: "garden-bed", label: "Garden beds", category: "grounds", renterRelevant: true,
    matchKeywords: ["garden bed", "flower bed", "vegetable garden", "raised bed", "garden"],
    care: [
      { id: "garden-bed.mulch", taskName: "Mulch", intervalDays: 365, consequence: 0, effort: 1, months: [4] },
      { id: "garden-bed.soil-test", taskName: "Test the soil", intervalDays: 1095, consequence: 0, effort: 1, months: [3] },
    ],
  },
  {
    id: "compost", label: "Compost", category: "grounds", renterRelevant: true,
    matchKeywords: ["compost", "compost bin"],
    care: [{ id: "compost.turn", taskName: "Turn it", intervalDays: 30, consequence: 0, effort: 1 }],
  },
  {
    id: "houseplants", label: "Houseplants", category: "grounds", renterRelevant: true,
    matchKeywords: ["houseplant", "houseplants", "plants"],
    care: [{ id: "houseplants.repot", taskName: "Repot and feed", intervalDays: 365, consequence: 0, effort: 1, months: [4] }],
  },
  {
    id: "lawn-mower", label: "Lawn mower", category: "grounds",
    matchKeywords: ["lawn mower", "mower"],
    care: [
      { id: "lawn-mower.blade", taskName: "Sharpen the blade", intervalDays: 365, consequence: 0, effort: 1, months: [4] },
      { id: "lawn-mower.service", taskName: "Oil, spark plug and winter fuel", intervalDays: 365, consequence: 0, effort: 1, months: [10] },
    ],
  },
  {
    id: "snow-blower", label: "Snow blower", category: "grounds",
    matchKeywords: ["snow blower", "snowblower", "snow thrower"],
    care: [{ id: "snow-blower.service", taskName: "Service it before you need it", intervalDays: 365, consequence: 1, effort: 1, months: [10] }],
  },
  {
    id: "grill", label: "Grill", category: "grounds", renterRelevant: true,
    matchKeywords: ["grill", "bbq", "barbecue", "smoker"],
    care: [
      { id: "grill.deep-clean", taskName: "Deep clean the grates and trap", intervalDays: 182, consequence: 0, effort: 1, months: [5] },
      { id: "grill.gas-leak", taskName: "Check the hose for leaks", intervalDays: 365, consequence: 2, effort: 0, months: [5] },
    ],
  },
  {
    id: "fire-pit", label: "Fire pit", category: "grounds",
    matchKeywords: ["fire pit", "firepit", "chiminea"],
    care: [{ id: "fire-pit.clear", taskName: "Clear the ash and check the surround", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "pool", label: "Pool", category: "grounds",
    matchKeywords: ["pool", "swimming pool"],
    care: [
      { id: "pool.chemistry", taskName: "Test and balance the water", intervalDays: 7, consequence: 1, effort: 0 },
      { id: "pool.filter", taskName: "Clean the filter", intervalDays: 30, consequence: 1, effort: 1 },
      { id: "pool.close", taskName: "Close it for the season", intervalDays: 365, consequence: 1, effort: 2, months: [9] },
      { id: "pool.open", taskName: "Open it for the season", intervalDays: 365, consequence: 0, effort: 2, months: [5] },
    ],
  },
  {
    id: "hot-tub", label: "Hot tub", category: "grounds",
    matchKeywords: ["hot tub", "jacuzzi", "spa"],
    care: [
      { id: "hot-tub.chemistry", taskName: "Test and balance the water", intervalDays: 7, consequence: 1, effort: 0 },
      { id: "hot-tub.filter", taskName: "Clean the filter", intervalDays: 30, consequence: 0, effort: 0 },
      { id: "hot-tub.water-change", taskName: "Drain and refill", intervalDays: 120, consequence: 1, effort: 2 },
    ],
  },
  {
    id: "propane-tank", label: "Propane tank", category: "grounds",
    matchKeywords: ["propane", "propane tank", "lpg"],
    care: [{ id: "propane-tank.inspect", taskName: "Check the level and regulator", intervalDays: 365, consequence: 2, effort: 0, months: [9] }],
  },

  // ------------------------------------------------------- Pests and damp
  {
    id: "termite", label: "Termite cover", category: "pests",
    matchKeywords: ["termite", "termites", "termite bond"],
    care: [{ id: "termite.inspect", taskName: "Annual inspection, keep the bond current", intervalDays: 365, consequence: 2, effort: 2 }],
  },
  {
    id: "pest-control", label: "Pest treatment", category: "pests", renterRelevant: true,
    matchKeywords: ["pest control", "exterminator", "pest treatment"],
    care: [{ id: "pest-control.treat", taskName: "Perimeter treatment", intervalDays: 90, consequence: 1, effort: 1 }],
  },
  {
    id: "rodent-check", label: "Rodent check", category: "pests", renterRelevant: true,
    matchKeywords: ["rodent", "mice", "mouse", "rats"],
    care: [{ id: "rodent-check.seal", taskName: "Seal entry points before the cold", intervalDays: 365, consequence: 1, effort: 1, months: [9] }],
  },
  {
    id: "moisture", label: "Damp and mould", category: "pests", renterRelevant: true,
    matchKeywords: ["mould", "mold", "damp", "moisture"],
    care: [{ id: "moisture.check", taskName: "Check the basement and under the sinks", intervalDays: 365, consequence: 2, effort: 0 }],
  },
  {
    id: "vent-fan", label: "Bathroom or kitchen fan", category: "pests", renterRelevant: true,
    matchKeywords: ["bathroom fan", "extractor fan", "vent fan", "exhaust fan"],
    care: [{ id: "vent-fan.clean", taskName: "Clean it and confirm it vents outside", intervalDays: 180, consequence: 1, effort: 0 }],
  },

  // ------------------------------------------------------ Everyday things
  {
    id: "mattress", label: "Mattress", category: "everyday", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["mattress", "bed"],
    care: [
      { id: "mattress.rotate", taskName: "Rotate it", intervalDays: 90, consequence: 0, effort: 0 },
      { id: "mattress.replace", taskName: "Think about replacing it", intervalDays: 2920, consequence: 0, effort: 2 },
    ],
  },
  {
    id: "carpet", label: "Carpets and rugs", category: "everyday", renterRelevant: true,
    matchKeywords: ["carpet", "rug", "rugs"],
    care: [{ id: "carpet.deep-clean", taskName: "Deep clean", intervalDays: 365, consequence: 0, effort: 1 }],
  },
  {
    id: "hardwood-floor", label: "Hardwood floors", category: "everyday",
    matchKeywords: ["hardwood", "wood floor", "wood floors"],
    care: [{ id: "hardwood-floor.refinish", taskName: "Refinish", intervalDays: 3285, consequence: 0, effort: 2 }],
  },
  {
    id: "grout", label: "Tile grout", category: "everyday", renterRelevant: true,
    matchKeywords: ["grout", "tile"],
    care: [{ id: "grout.reseal", taskName: "Reseal, especially in the shower", intervalDays: 730, consequence: 1, effort: 1 }],
  },
  {
    id: "upholstery", label: "Upholstery", category: "everyday", renterRelevant: true,
    matchKeywords: ["upholstery", "sofa", "couch"],
    care: [{ id: "upholstery.clean", taskName: "Clean", intervalDays: 365, consequence: 0, effort: 1 }],
  },
  {
    id: "interior-paint", label: "Interior paint", category: "everyday",
    matchKeywords: ["paint", "interior paint", "wall paint"],
    care: [{ id: "interior-paint.refresh", taskName: "Touch up or repaint", intervalDays: 2190, consequence: 0, effort: 2 }],
  },
  {
    id: "vacuum", label: "Vacuum", category: "everyday", renterRelevant: true,
    matchKeywords: ["vacuum", "hoover"],
    care: [{ id: "vacuum.filter", taskName: "Clean the filter and brush roll", intervalDays: 180, consequence: 0, effort: 0 }],
  },
  {
    id: "water-pitcher", label: "Water filter pitcher", category: "everyday", renterRelevant: true,
    matchKeywords: ["brita", "filter pitcher", "water pitcher"],
    care: [{ id: "water-pitcher.cartridge", taskName: "Replace the cartridge", intervalDays: 60, consequence: 0, effort: 0 }],
  },
  {
    id: "bike", label: "Bike", category: "everyday", renterRelevant: true,
    matchKeywords: ["bike", "bicycle", "e-bike"],
    care: [
      { id: "bike.chain", taskName: "Clean and oil the chain, check the tyres", intervalDays: 30, consequence: 1, effort: 0 },
      { id: "bike.tune-up", taskName: "Full tune-up", intervalDays: 365, consequence: 1, effort: 2, months: [3] },
    ],
  },
  {
    id: "electronics", label: "Electronics", category: "everyday", renterRelevant: true,
    matchKeywords: ["laptop", "computer", "tv", "television", "phone", "console"],
    care: [],
  },
  {
    id: "router", label: "Wifi router", category: "everyday", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["router", "wifi", "modem"],
    care: [{ id: "router.firmware", taskName: "Check for a firmware update", intervalDays: 180, consequence: 1, effort: 0 }],
  },
  {
    id: "smart-hub", label: "Smart home hub", category: "everyday", renterRelevant: true,
    matchKeywords: ["smart hub", "home hub", "homekit", "smartthings"],
    care: [{ id: "smart-hub.batteries", taskName: "Check sensor batteries and firmware", intervalDays: 180, consequence: 0, effort: 0 }],
  },

  // ------------------------------------------------------ Papers and facts
  {
    id: "home-insurance", label: "Home insurance", category: "records",
    matchKeywords: ["home insurance", "homeowners insurance", "buildings insurance"],
    care: [{ id: "home-insurance.review", taskName: "Review the cover before it renews", intervalDays: 365, consequence: 1, effort: 1 }],
  },
  {
    id: "filter-sizes", label: "Filter sizes", category: "records", renterRelevant: true,
    matchKeywords: ["filter size", "filter sizes"],
    care: [],
  },
  {
    id: "paint-colours", label: "Paint colours", category: "records", renterRelevant: true,
    matchKeywords: ["paint colours", "paint colors", "paint colour", "paint color", "paint code"],
    care: [],
  },
  {
    id: "manuals", label: "Manuals", category: "records", renterRelevant: true,
    matchKeywords: ["manual", "manuals", "instructions"],
    care: [],
  },
  {
    id: "inspection-report", label: "Home inspection report", category: "records",
    matchKeywords: ["inspection report", "home inspection", "survey"],
    care: [],
  },
  {
    id: "deed", label: "Deed and mortgage", category: "records",
    matchKeywords: ["deed", "title", "mortgage"],
    care: [],
  },
  {
    id: "property-tax", label: "Property tax", category: "records",
    matchKeywords: ["property tax", "council tax", "rates"],
    care: [{ id: "property-tax.due", taskName: "Payment due", intervalDays: 365, consequence: 2, effort: 0 }],
  },
  {
    id: "hoa", label: "HOA", category: "records",
    matchKeywords: ["hoa", "homeowners association", "condo association"],
    care: [{ id: "hoa.dues", taskName: "Dues due", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "warranty-document", label: "Warranty", category: "records", renterRelevant: true,
    matchKeywords: ["warranty", "guarantee", "extended warranty"],
    care: [],
  },
  {
    id: "who-to-call", label: "Who to call", category: "records", renterRelevant: true,
    matchKeywords: ["who to call", "contacts", "contractor list"],
    care: [],
  },

  // ------------------------------------------------------------- Renting
  {
    id: "lease", label: "Lease", category: "renting", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["lease", "tenancy", "rental agreement"],
    care: [
      { id: "lease.notice-deadline", taskName: "Decide before the notice deadline", intervalDays: 365, consequence: 2, effort: 1 },
      { id: "lease.renewal", taskName: "Lease renews", intervalDays: 365, consequence: 2, effort: 1 },
    ],
  },
  {
    id: "move-in-condition", label: "Move-in condition", category: "renting", renterRelevant: true,
    matchKeywords: ["move in condition", "move-in photos", "condition report", "inventory report"],
    care: [],
  },
  {
    id: "security-deposit", label: "Security deposit", category: "renting", renterRelevant: true,
    matchKeywords: ["security deposit", "deposit", "bond"],
    care: [],
  },
  {
    id: "renters-insurance", label: "Renters insurance", category: "renting", offerAtSetup: true, renterRelevant: true,
    matchKeywords: ["renters insurance", "contents insurance", "tenant insurance"],
    care: [{ id: "renters-insurance.renew", taskName: "Review before it renews", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "landlord", label: "Landlord or manager", category: "renting", renterRelevant: true,
    matchKeywords: ["landlord", "property manager", "letting agent"],
    care: [],
  },
  {
    id: "maintenance-request", label: "Maintenance requests", category: "renting", renterRelevant: true,
    matchKeywords: ["maintenance request", "repair request", "work order"],
    care: [],
  },
  {
    id: "parking-permit", label: "Parking or amenity permit", category: "renting", renterRelevant: true,
    matchKeywords: ["parking permit", "amenity", "storage unit"],
    care: [{ id: "parking-permit.renew", taskName: "Renew the permit", intervalDays: 365, consequence: 1, effort: 0 }],
  },
  {
    id: "move-out", label: "Move-out checklist", category: "renting", renterRelevant: true,
    matchKeywords: ["move out", "move-out", "end of tenancy"],
    care: [],
  },
];

export const HOME_ITEM_TYPE_BY_ID: Record<string, HomeItemTypeDefinition> = Object.fromEntries(
  HOME_ITEM_TYPES.map((type) => [type.id, type])
);

const CARE_TEMPLATE_BY_ID: Record<string, CareTemplate> = Object.fromEntries(
  HOME_ITEM_TYPES.flatMap((type) => type.care).map((template) => [template.id, template])
);

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * True only when the keyword appears as a whole word.
 *
 * Plain substring matching is wrong here in a way that silently gives
 * people the wrong advice: "dishwasher" contains "washer", so a kitchen
 * dishwasher would be handed a washing machine's care and told to clean
 * a detergent drawer it does not have. Word boundaries make "washer"
 * match "washer" and "top-load washer" but not "dishwasher".
 */
function mentionsWord(haystack: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeForRegex(keyword)}\\b`).test(haystack);
}

/**
 * Type first (precise once explicitly assigned), then a whole-word match
 * on the object's own name, most specific keyword winning so "washing
 * machine" beats a bare "washer". Returns null rather than a
 * low-confidence guess, same never-guess discipline as
 * extractFromText.ts.
 */
/**
 * What setup offers, filtered by whether the person owns the place.
 * A renter is never asked about a roof; an owner is not asked about a
 * lease.
 */
export function typesOfferedAtSetup(tenure: "own" | "rent" | null): HomeItemTypeDefinition[] {
  return HOME_ITEM_TYPES.filter((type) => {
    if (!type.offerAtSetup) return false;
    if (tenure === "rent") return Boolean(type.renterRelevant);
    if (tenure === "own") return type.category !== "renting";
    return true;
  });
}

export function matchHomeItemType(name: string, type: string): HomeItemTypeDefinition | null {
  if (HOME_ITEM_TYPE_BY_ID[type]) return HOME_ITEM_TYPE_BY_ID[type];
  const normalized = name.toLowerCase();

  let best: { definition: HomeItemTypeDefinition; length: number } | null = null;
  for (const definition of HOME_ITEM_TYPES) {
    for (const keyword of definition.matchKeywords) {
      if (!mentionsWord(normalized, keyword)) continue;
      if (!best || keyword.length > best.length) best = { definition, length: keyword.length };
    }
  }
  return best?.definition ?? null;
}

/** The curated entry a stored task points at, or null when it was typed by hand or predates the link. */
export function findCareTemplate(careTemplateId: string | null): CareTemplate | null {
  if (!careTemplateId) return null;
  return CARE_TEMPLATE_BY_ID[careTemplateId] ?? null;
}

/**
 * Fallback for tasks with no stored care_template_id: an exact,
 * case-insensitive name match against the curated templates. Deliberately
 * strict, since a wrong match here would silently change how urgently
 * something is surfaced. Anything unmatched scores neutrally rather than
 * being guessed at.
 */
export function findCareTemplateByTaskName(taskName: string): CareTemplate | null {
  const normalized = taskName.trim().toLowerCase();
  return Object.values(CARE_TEMPLATE_BY_ID).find((template) => template.taskName.toLowerCase() === normalized) ?? null;
}

/**
 * The next date a seasonal job comes round: the first day of its month,
 * in the first year after the anchor that reaches it.
 *
 * Deliberately never "due right now" the moment something is added.
 * Adding an irrigation system in August should not immediately demand a
 * winter blowout; it should wait until October. That differs from
 * interval care, where an unlogged job genuinely is due now because its
 * last completion is unknown rather than in the future.
 */
export function nextSeasonalDueIso(anchorIso: string, months: number[]): string {
  if (months.length === 0) return anchorIso;
  const anchor = new Date(`${anchorIso.slice(0, 10)}T00:00:00Z`);
  for (let ahead = 0; ahead <= 24; ahead += 1) {
    const candidate = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() + ahead, 1));
    if (candidate.getTime() <= anchor.getTime()) continue;
    if (months.includes(candidate.getUTCMonth() + 1)) return candidate.toISOString().slice(0, 10);
  }
  return anchorIso;
}
