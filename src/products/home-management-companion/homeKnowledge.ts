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
}

export interface HomeItemTypeDefinition {
  /** Matches the open `type` field on a home item once assigned, e.g. "water-heater". */
  id: string;
  label: string;
  /** Lowercase substrings checked against an object's own name for a first-pass match. */
  matchKeywords: string[];
  care: CareTemplate[];
}

export const HOME_ITEM_TYPES: HomeItemTypeDefinition[] = [
  {
    id: "refrigerator",
    label: "Refrigerator",
    matchKeywords: ["refrigerator", "fridge"],
    care: [
      { id: "refrigerator.water-filter", taskName: "Replace water filter", intervalDays: 180, consequence: 0, effort: 0 },
      { id: "refrigerator.condenser-coils", taskName: "Clean condenser coils", intervalDays: 180, consequence: 1, effort: 1 },
    ],
  },
  {
    id: "water-heater",
    label: "Water heater",
    matchKeywords: ["water heater"],
    care: [
      { id: "water-heater.flush-tank", taskName: "Flush the tank", intervalDays: 365, consequence: 1, effort: 1 },
      { id: "water-heater.pressure-valve", taskName: "Test the pressure relief valve", intervalDays: 365, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "hvac",
    label: "HVAC or furnace",
    matchKeywords: ["hvac", "furnace", "air conditioner", "heat pump"],
    care: [
      { id: "hvac.air-filter", taskName: "Replace the air filter", intervalDays: 90, consequence: 1, effort: 0 },
      { id: "hvac.tune-up", taskName: "Book a professional tune-up", intervalDays: 365, consequence: 1, effort: 2 },
    ],
  },
  {
    id: "washer",
    label: "Washing machine",
    matchKeywords: ["washer", "washing machine"],
    care: [
      { id: "washer.cleaning-cycle", taskName: "Run a cleaning cycle", intervalDays: 90, consequence: 0, effort: 0 },
      { id: "washer.detergent-drawer", taskName: "Clean the detergent drawer", intervalDays: 30, consequence: 0, effort: 0 },
    ],
  },
  {
    id: "dryer",
    label: "Dryer",
    matchKeywords: ["dryer"],
    care: [{ id: "dryer.vent", taskName: "Clean the dryer vent", intervalDays: 365, consequence: 2, effort: 1 }],
  },
  {
    id: "dishwasher",
    label: "Dishwasher",
    matchKeywords: ["dishwasher"],
    care: [
      { id: "dishwasher.filter", taskName: "Clean the filter", intervalDays: 30, consequence: 0, effort: 0 },
      { id: "dishwasher.cleaning-cycle", taskName: "Run a cleaning cycle", intervalDays: 90, consequence: 0, effort: 0 },
    ],
  },
  {
    id: "garage-door",
    label: "Garage door",
    matchKeywords: ["garage door"],
    care: [
      { id: "garage-door.lubricate", taskName: "Lubricate the hinges and rollers", intervalDays: 180, consequence: 0, effort: 0 },
      { id: "garage-door.auto-reverse", taskName: "Test the auto-reverse safety stop", intervalDays: 180, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "roof",
    label: "Roof",
    matchKeywords: ["roof"],
    care: [{ id: "roof.inspect", taskName: "Inspect for damage", intervalDays: 365, consequence: 2, effort: 1 }],
  },
  {
    id: "gutter",
    label: "Gutters",
    matchKeywords: ["gutter"],
    care: [{ id: "gutter.clean", taskName: "Clear the gutters", intervalDays: 180, consequence: 1, effort: 2 }],
  },
  {
    id: "water-softener",
    label: "Water softener",
    matchKeywords: ["water softener"],
    care: [{ id: "water-softener.salt", taskName: "Top up the salt", intervalDays: 60, consequence: 0, effort: 0 }],
  },
  {
    id: "smoke-detector",
    label: "Smoke or CO detector",
    matchKeywords: ["smoke detector", "smoke alarm", "carbon monoxide"],
    care: [
      { id: "smoke-detector.battery", taskName: "Replace the battery", intervalDays: 180, consequence: 2, effort: 0 },
      { id: "smoke-detector.test", taskName: "Test the alarm", intervalDays: 180, consequence: 2, effort: 0 },
    ],
  },
  {
    id: "sump-pump",
    label: "Sump pump",
    matchKeywords: ["sump pump"],
    care: [{ id: "sump-pump.test", taskName: "Test that it runs", intervalDays: 180, consequence: 2, effort: 0 }],
  },
  {
    id: "chimney",
    label: "Chimney or fireplace",
    matchKeywords: ["chimney", "fireplace"],
    care: [{ id: "chimney.sweep", taskName: "Inspect and sweep", intervalDays: 365, consequence: 2, effort: 2 }],
  },
];

export const HOME_ITEM_TYPE_BY_ID: Record<string, HomeItemTypeDefinition> = Object.fromEntries(
  HOME_ITEM_TYPES.map((type) => [type.id, type])
);

const CARE_TEMPLATE_BY_ID: Record<string, CareTemplate> = Object.fromEntries(
  HOME_ITEM_TYPES.flatMap((type) => type.care).map((template) => [template.id, template])
);

/**
 * Type first (precise once explicitly assigned), then a keyword match on
 * the object's own name. Returns null rather than a low-confidence guess,
 * same never-guess discipline as extractFromText.ts.
 */
export function matchHomeItemType(name: string, type: string): HomeItemTypeDefinition | null {
  if (HOME_ITEM_TYPE_BY_ID[type]) return HOME_ITEM_TYPE_BY_ID[type];
  const normalized = name.toLowerCase();
  return HOME_ITEM_TYPES.find((def) => def.matchKeywords.some((keyword) => normalized.includes(keyword))) ?? null;
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
