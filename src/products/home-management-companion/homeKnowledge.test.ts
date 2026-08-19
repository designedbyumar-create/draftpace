import { describe, expect, it } from "vitest";
import {
  HOME_ITEM_TYPES,
  matchHomeItemType,
  findCareTemplate,
  findCareTemplateByTaskName,
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
