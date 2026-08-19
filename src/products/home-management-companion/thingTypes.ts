/**
 * Deterministic type-aware maintenance suggestions, the founder's
 * "the product should know things the user doesn't" requirement.
 * Keyword-matched against a Thing's own name, or its type once one has
 * been explicitly assigned, exactly the same non-AI discipline as
 * import/extractFromText.ts's own header comment: no model provider is
 * configured anywhere in this repository, this is plain pattern
 * matching, and it is only ever a suggestion. Nothing here creates a
 * maintenance task on its own; ThingFormSheet.tsx only ever confirms
 * these into real tasks from an explicit, itemized user choice.
 *
 * A deliberately modest starter set (household categories with genuinely
 * well-known service cadences), not an attempt to cover every possible
 * household item, matching the founder's own "don't try to cover every
 * possible household item" scoping call reflected in the v2 plan.
 */

export interface ThingTypeSuggestion {
  taskName: string;
  cadenceDays: number;
}

export interface ThingTypeDefinition {
  /** Matches the open `type` field on a Thing once assigned, e.g. "refrigerator". */
  id: string;
  label: string;
  /** Lowercase substrings checked against a Thing's own name for a first-pass match. */
  matchKeywords: string[];
  suggestedTasks: ThingTypeSuggestion[];
}

export const THING_TYPES: ThingTypeDefinition[] = [
  {
    id: "refrigerator",
    label: "Refrigerator",
    matchKeywords: ["refrigerator", "fridge"],
    suggestedTasks: [
      { taskName: "Replace water filter", cadenceDays: 180 },
      { taskName: "Clean condenser coils", cadenceDays: 180 },
    ],
  },
  {
    id: "water-heater",
    label: "Water heater",
    matchKeywords: ["water heater"],
    suggestedTasks: [
      { taskName: "Flush tank", cadenceDays: 365 },
      { taskName: "Test pressure relief valve", cadenceDays: 365 },
    ],
  },
  {
    id: "hvac",
    label: "HVAC / furnace",
    matchKeywords: ["hvac", "furnace", "air conditioner", "heat pump"],
    suggestedTasks: [
      { taskName: "Replace air filter", cadenceDays: 90 },
      { taskName: "Schedule professional tune-up", cadenceDays: 365 },
    ],
  },
  {
    id: "washer",
    label: "Washing machine",
    matchKeywords: ["washer", "washing machine"],
    suggestedTasks: [
      { taskName: "Run cleaning cycle", cadenceDays: 90 },
      { taskName: "Clean detergent drawer", cadenceDays: 30 },
    ],
  },
  {
    id: "dryer",
    label: "Dryer",
    matchKeywords: ["dryer"],
    suggestedTasks: [{ taskName: "Clean dryer vent", cadenceDays: 365 }],
  },
  {
    id: "dishwasher",
    label: "Dishwasher",
    matchKeywords: ["dishwasher"],
    suggestedTasks: [
      { taskName: "Clean filter", cadenceDays: 30 },
      { taskName: "Run cleaning cycle", cadenceDays: 90 },
    ],
  },
  {
    id: "garage-door",
    label: "Garage door",
    matchKeywords: ["garage door"],
    suggestedTasks: [
      { taskName: "Lubricate hinges and rollers", cadenceDays: 180 },
      { taskName: "Test auto-reverse safety", cadenceDays: 180 },
    ],
  },
  {
    id: "roof",
    label: "Roof",
    matchKeywords: ["roof"],
    suggestedTasks: [{ taskName: "Inspect for damage", cadenceDays: 365 }],
  },
  {
    id: "gutter",
    label: "Gutters",
    matchKeywords: ["gutter"],
    suggestedTasks: [{ taskName: "Clean gutters", cadenceDays: 180 }],
  },
  {
    id: "water-softener",
    label: "Water softener",
    matchKeywords: ["water softener"],
    suggestedTasks: [{ taskName: "Add salt", cadenceDays: 60 }],
  },
  {
    id: "smoke-detector",
    label: "Smoke / CO detector",
    matchKeywords: ["smoke detector", "smoke alarm", "carbon monoxide"],
    suggestedTasks: [
      { taskName: "Replace battery", cadenceDays: 180 },
      { taskName: "Test alarm", cadenceDays: 180 },
    ],
  },
  {
    id: "sump-pump",
    label: "Sump pump",
    matchKeywords: ["sump pump"],
    suggestedTasks: [{ taskName: "Test pump operation", cadenceDays: 180 }],
  },
  {
    id: "chimney",
    label: "Chimney / fireplace",
    matchKeywords: ["chimney", "fireplace"],
    suggestedTasks: [{ taskName: "Inspect and clean", cadenceDays: 365 }],
  },
];

export const THING_TYPE_BY_ID: Record<string, ThingTypeDefinition> = Object.fromEntries(THING_TYPES.map((t) => [t.id, t]));

/**
 * Type first (fast, precise once a type has been explicitly assigned),
 * name keyword match second. Returns null rather than a low-confidence
 * guess when nothing matches, same never-guess discipline as
 * extractFromText.ts.
 */
export function matchThingType(name: string, type: string): ThingTypeDefinition | null {
  if (THING_TYPE_BY_ID[type]) return THING_TYPE_BY_ID[type];
  const normalized = name.toLowerCase();
  return THING_TYPES.find((def) => def.matchKeywords.some((keyword) => normalized.includes(keyword))) ?? null;
}
