import { describe, expect, it } from "vitest";
import {
  HOME_ITEM_TYPES,
  HOME_ITEM_TYPE_BY_ID,
  HOME_ITEM_CATEGORY_LABEL,
  matchHomeItemType,
  findCareTemplate,
  findCareTemplateByTaskName,
  nextSeasonalDueIso,
  typesOfferedAtSetup,
} from "./homeKnowledge";

describe("matchHomeItemType", () => {
  it("uses an explicitly assigned type before looking at the name", () => {
    expect(matchHomeItemType("The big cold box", "refrigerator")?.id).toBe("refrigerator");
  });

  it("recognises a type from the name people actually type", () => {
    expect(matchHomeItemType("Kitchen refrigerator", "")?.id).toBe("refrigerator");
    expect(matchHomeItemType("Basement water heater", "")?.id).toBe("water-heater");
    expect(matchHomeItemType("Laundry room dryer", "")?.id).toBe("dryer");
  });

  it("does not mistake a dishwasher for a washing machine", () => {
    // "dishwasher" contains "washer". Substring matching would hand this
    // item a washing machine's care, including a detergent drawer it has
    // no equivalent of.
    expect(matchHomeItemType("Kitchen dishwasher", "")?.id).toBe("dishwasher");
    expect(matchHomeItemType("dishwasher", "")?.id).toBe("dishwasher");
  });

  it("still matches a real washing machine either way it is named", () => {
    expect(matchHomeItemType("Washer", "")?.id).toBe("washer");
    expect(matchHomeItemType("Top-load washing machine", "")?.id).toBe("washer");
  });

  it("prefers the most specific keyword when several could match", () => {
    expect(matchHomeItemType("Gas water heater", "")?.id).toBe("water-heater");
  });

  it("returns null rather than guessing at something it does not know", () => {
    expect(matchHomeItemType("Doorknobs", "")).toBeNull();
    expect(matchHomeItemType("", "")).toBeNull();
  });
});

describe("care templates", () => {
  it("finds a template by the id stored on a task", () => {
    expect(findCareTemplate("dryer.vent")?.taskName).toBe("Clean the dryer vent");
    expect(findCareTemplate(null)).toBeNull();
    expect(findCareTemplate("nope.gone")).toBeNull();
  });

  it("falls back to an exact task-name match for tasks with no stored id", () => {
    expect(findCareTemplateByTaskName("clean the dryer vent")?.id).toBe("dryer.vent");
    expect(findCareTemplateByTaskName("Something nobody curated")).toBeNull();
  });

  it("keeps every care template id unique, since tasks store them permanently", () => {
    const ids = HOME_ITEM_TYPES.flatMap((type) => type.care.map((c) => c.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every safety-critical job a consequence that outranks a cosmetic one", () => {
    const vent = findCareTemplate("dryer.vent");
    const drawer = findCareTemplate("washer.detergent-drawer");
    expect(vent?.consequence).toBe(2);
    expect(drawer?.consequence).toBe(0);
  });
});

describe("the expanded catalogue holds together", () => {
  it("keeps every type id unique, since items store them permanently", () => {
    const ids = HOME_ITEM_TYPES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every type a category so onboarding can group it", () => {
    for (const type of HOME_ITEM_TYPES) {
      expect(HOME_ITEM_CATEGORY_LABEL[type.category], `${type.id} has no category label`).toBeTruthy();
    }
  });

  it("uses type ids that satisfy the stored type pattern", () => {
    for (const type of HOME_ITEM_TYPES) {
      expect(type.id, `${type.id} is not a valid stored type`).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("names every care template after its own type, so ids stay readable and unique", () => {
    for (const type of HOME_ITEM_TYPES) {
      for (const care of type.care) {
        expect(care.id.startsWith(`${type.id}.`), `${care.id} does not belong to ${type.id}`).toBe(true);
      }
    }
  });

  it("keeps every interval positive and every season a real month", () => {
    for (const type of HOME_ITEM_TYPES) {
      for (const care of type.care) {
        expect(care.intervalDays, `${care.id}`).toBeGreaterThan(0);
        for (const month of care.months ?? []) {
          expect(month, `${care.id} has month ${month}`).toBeGreaterThanOrEqual(1);
          expect(month, `${care.id} has month ${month}`).toBeLessThanOrEqual(12);
        }
      }
    }
  });

  it("never lets one type's keyword swallow another type's name", () => {
    // The dishwasher and washer case, generalised: adding a type must not
    // quietly steal an existing type's own label.
    for (const type of HOME_ITEM_TYPES) {
      const matched = matchHomeItemType(type.label, "");
      if (matched) expect(matched.id, `"${type.label}" resolves to ${matched.id}`).toBe(type.id);
    }
  });

  it("recognises the names a real person would type", () => {
    const cases: Array<[string, string]> = [
      ["Kitchen dishwasher", "dishwasher"],
      ["Basement water heater", "water-heater"],
      ["Laundry room dryer", "dryer"],
      ["Back yard sprinkler system", "irrigation"],
      ["Septic tank", "septic"],
      ["Upstairs smoke alarm", "smoke-detector"],
      ["Front garage door", "garage-door"],
      ["My lease", "lease"],
      ["Renters insurance", "renters-insurance"],
      ["Whole house generator", "generator"],
    ];
    for (const [typed, expected] of cases) {
      expect(matchHomeItemType(typed, "")?.id, `"${typed}"`).toBe(expected);
    }
  });

  it("covers all twelve categories", () => {
    const used = new Set(HOME_ITEM_TYPES.map((t) => t.category));
    expect(used.size).toBe(Object.keys(HOME_ITEM_CATEGORY_LABEL).length);
  });

  it("offers renters something in the categories that apply to them", () => {
    const renterTypes = HOME_ITEM_TYPES.filter((t) => t.renterRelevant);
    expect(renterTypes.length).toBeGreaterThan(30);
    expect(renterTypes.some((t) => t.category === "renting")).toBe(true);
    // A renter should never be offered a roof or a septic tank.
    expect(HOME_ITEM_TYPE_BY_ID.roof.renterRelevant).toBeFalsy();
    expect(HOME_ITEM_TYPE_BY_ID.septic.renterRelevant).toBeFalsy();
  });
});

describe("nextSeasonalDueIso", () => {
  it("sends a winterising job to its month rather than a year from now", () => {
    expect(nextSeasonalDueIso("2026-08-20", [10])).toBe("2026-10-01");
  });

  it("waits a full year when the season has already passed", () => {
    expect(nextSeasonalDueIso("2026-10-15", [10])).toBe("2027-10-01");
  });

  it("picks the nearer of two seasons", () => {
    expect(nextSeasonalDueIso("2026-08-20", [4, 11])).toBe("2026-11-01");
    expect(nextSeasonalDueIso("2026-12-05", [4, 11])).toBe("2027-04-01");
  });

  it("does not treat a job added during its own month as due that instant", () => {
    // Added in October, season October: it belongs to next October, not today.
    expect(nextSeasonalDueIso("2026-10-10", [10])).toBe("2027-10-01");
  });
});

describe("typesOfferedAtSetup", () => {
  it("offers a short curated list, not the whole catalogue", () => {
    const offered = typesOfferedAtSetup(null);
    expect(offered.length).toBeGreaterThan(8);
    expect(offered.length).toBeLessThan(HOME_ITEM_TYPES.length / 3);
  });

  it("never asks a renter about a roof, gutters or a boiler", () => {
    const ids = typesOfferedAtSetup("rent").map((t) => t.id);
    expect(ids).not.toContain("roof");
    expect(ids).not.toContain("gutter");
    expect(ids).not.toContain("furnace");
  });

  it("offers a renter the things a lease actually puts on them", () => {
    const ids = typesOfferedAtSetup("rent").map((t) => t.id);
    expect(ids).toContain("lease");
    expect(ids).toContain("smoke-detector");
    expect(ids).toContain("refrigerator");
  });

  it("never asks an owner about a lease", () => {
    expect(typesOfferedAtSetup("own").map((t) => t.id)).not.toContain("lease");
  });

  it("still offers the shared essentials to an owner", () => {
    const ids = typesOfferedAtSetup("own").map((t) => t.id);
    expect(ids).toContain("water-heater");
    expect(ids).toContain("roof");
    expect(ids).toContain("smoke-detector");
  });

  it("gives everything it offers some care to propose, so a pick is never a dead end", () => {
    for (const type of typesOfferedAtSetup(null)) {
      if (type.category === "records" || type.category === "renting") continue;
      expect(type.care.length, `${type.id} proposes nothing`).toBeGreaterThan(0);
    }
  });
});
