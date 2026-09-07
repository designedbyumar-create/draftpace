import { describe, expect, it } from "vitest";
import {
  deriveHandoff,
  describeHandoff,
  findableHandoffScenarios,
  firstFix,
  HANDOFF_SCENARIOS,
  scenarioArea,
  scenarioUrgency,
} from "./handoff";
import { AFFAIR_STEP_BY_KEY } from "./affairsKnowledge";
import { item, rec } from "./testSupport";

const EVERYTHING = {
  hasChildren: true,
  partnered: true,
  hasEmployerRetirement: true,
  ownsHome: true,
  hasLifeInsurance: true,
  hasDependantsWithExtraNeeds: true,
  hasPets: true,
  hasBusiness: true,
};

const SIMPLE = { ...EVERYTHING, hasChildren: false, hasPets: false, hasBusiness: false };

describe("could another person actually use this", () => {
  it("starts by saying everything is unclear, because nothing is written down", () => {
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items: [] });
    expect(result.allClear).toBe(false);
    expect(result.unclear.length).toBe(result.findings.length);
  });

  it("clears a scenario once every record it depends on exists", () => {
    const result = deriveHandoff({
      profile: EVERYTHING,
      records: [],
      items: [item("home.where-you-live")],
    });
    const home = result.findings.find((f) => f.scenario.key === "understand-home");
    expect(home!.clear).toBe(true);
    expect(home!.missing).toEqual([]);
  });

  it("does not clear a scenario on a partial answer", () => {
    const result = deriveHandoff({
      profile: EVERYTHING,
      records: [],
      items: [item("people.emergency-contact")],
    });
    const reach = result.findings.find((f) => f.scenario.key === "reach-someone");
    expect(reach!.clear).toBe(false);
    expect(reach!.missing.map((s) => s.key)).toEqual(["people.executor"]);
  });

  it("leaves out a scenario that has nothing to do with this person", () => {
    const result = deriveHandoff({ profile: SIMPLE, records: [], items: [] });
    const keys = result.findings.map((f) => f.scenario.key);
    expect(keys).not.toContain("look-after-pets");
    expect(keys).not.toContain("handle-the-business");
    expect(keys).not.toContain("look-after-dependants");
  });

  it("accepts not applicable as an answer, because a deliberate skip is one", () => {
    const result = deriveHandoff({
      profile: EVERYTHING,
      records: [rec("home.where-you-live", { state: "notRelevant", confirmedAt: null })],
      items: [],
    });
    expect(result.findings.find((f) => f.scenario.key === "understand-home")!.clear).toBe(true);
  });

  /**
   * The one place in the product where the strict reading is the right
   * one. A date with nothing behind it fails the question this check
   * asks, whatever it does for sequencing elsewhere.
   */
  it("does not accept a confirmation with no answer behind it", () => {
    const result = deriveHandoff({
      profile: EVERYTHING,
      records: [rec("home.where-you-live", { legacyConfirmation: true })],
      items: [],
    });
    expect(result.findings.find((f) => f.scenario.key === "understand-home")!.clear).toBe(false);
  });

  it("points at every scenario a real person would have", () => {
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items: [] });
    expect(result.findings.length).toBe(HANDOFF_SCENARIOS.length);
    for (const scenario of HANDOFF_SCENARIOS) {
      for (const key of scenario.requires) {
        expect(AFFAIR_STEP_BY_KEY[key], key).toBeDefined();
      }
    }
  });
});

describe("what it says, and what it refuses to say", () => {
  it("never produces a score, a fraction or a percentage", () => {
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items: [] });
    const line = describeHandoff(result);
    expect(line).not.toContain("%");
    expect(line).not.toMatch(/\d+\s*(of|\/)\s*\d+/);
    expect(JSON.stringify(result)).not.toContain("score");
  });

  it("counts what is unclear, not what is finished", () => {
    const result = deriveHandoff({ profile: SIMPLE, records: [], items: [] });
    expect(describeHandoff(result)).toBe(`${result.unclear.length} things may still be unclear to somebody else.`);
  });

  it("says one thing rather than 1 thing, since a person is reading it", () => {
    const items = HANDOFF_SCENARIOS.filter((s) => s.key !== "understand-home").flatMap((s) =>
      s.requires.map((key) => item(key))
    );
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items });
    expect(describeHandoff(result)).toBe("One thing may still be unclear to somebody else.");
  });

  it("says something warm and specific when nothing is left", () => {
    const items = HANDOFF_SCENARIOS.flatMap((s) => s.requires.map((key) => item(key)));
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items });
    expect(result.allClear).toBe(true);
    expect(describeHandoff(result)).toBe("Someone could pick this up and know what to do.");
  });
});

describe("fixing the first one", () => {
  it("offers exactly one thing, never the whole list", () => {
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items: [] });
    const fix = firstFix(result);
    expect(fix).not.toBeNull();
    expect(Array.isArray(fix)).toBe(false);
  });

  it("chooses by consequence, the same way the main screen does", () => {
    const result = deriveHandoff({ profile: EVERYTHING, records: [], items: [] });
    expect(firstFix(result)!.consequence).toBe(2);
  });

  it("offers nothing once nothing is unclear", () => {
    const items = HANDOFF_SCENARIOS.flatMap((s) => s.requires.map((key) => item(key)));
    expect(firstFix(deriveHandoff({ profile: EVERYTHING, records: [], items }))).toBeNull();
  });
});

/**
 * Phase 3 of the pricing plan: the printed book's "If you need to..."
 * quick reference, which reuses these scenarios rather than inventing
 * new copy. Real evidence showed the "checklist" demand harvested for
 * this area actually belongs to the parent-dies guide, a different,
 * reactive persona this product explicitly says it is not for. What
 * this product's own Handoff Check already proves is the right mental
 * model, scenario over category, had never reached the one document
 * this product's whole promise is built around handing over.
 */
describe("scenarioArea", () => {
  it("reads the area straight off a scenario's own first requirement", () => {
    const reachSomeone = HANDOFF_SCENARIOS.find((s) => s.key === "reach-someone")!;
    expect(scenarioArea(reachSomeone)).toBe("people");
  });

  it("agrees with every scenario's full requirement list, not just the first", () => {
    // If a scenario's requirements ever spanned two areas, the printed
    // reference would point a reader at only one of them. This is what
    // stands between that and silence.
    for (const scenario of HANDOFF_SCENARIOS) {
      const area = scenarioArea(scenario);
      for (const key of scenario.requires) {
        expect(key.split(".")[0], `${scenario.key} requires ${key}`).toBe(area);
      }
    }
  });
});

describe("findableHandoffScenarios", () => {
  it("includes nothing when no section survived into this copy", () => {
    expect(findableHandoffScenarios(new Set())).toEqual([]);
  });

  it("includes only scenarios whose area actually printed", () => {
    const found = findableHandoffScenarios(new Set(["people"]));
    expect(found.every((entry) => entry.area === "people")).toBe(true);
    expect(found.length).toBeGreaterThan(0);
  });

  it("can point more than one scenario at the same section", () => {
    // look-after-dependants and look-after-pets both live under
    // "dependants" on purpose: two different needs, one real section.
    const found = findableHandoffScenarios(new Set(["dependants"]));
    expect(found.length).toBe(2);
  });

  it("includes every scenario once every area has printed", () => {
    const allAreas = new Set(HANDOFF_SCENARIOS.map((s) => scenarioArea(s)).filter((a): a is NonNullable<typeof a> => a !== null));
    expect(findableHandoffScenarios(allAreas).length).toBe(HANDOFF_SCENARIOS.length);
  });

  /**
   * Promoted from a buried legend entry to the book's opening pages on
   * the understanding that it would be ordered by urgency, not by
   * whatever order HANDOFF_SCENARIOS happens to be authored in.
   */
  it("orders what it returns most urgent first", () => {
    const allAreas = new Set(HANDOFF_SCENARIOS.map((s) => scenarioArea(s)).filter((a): a is NonNullable<typeof a> => a !== null));
    const found = findableHandoffScenarios(allAreas);
    const urgencies = found.map((entry) => {
      const scenario = HANDOFF_SCENARIOS.find((s) => s.need === entry.need)!;
      return scenarioUrgency(scenario);
    });
    for (let i = 1; i < urgencies.length; i++) {
      expect(urgencies[i], `position ${i}`).toBeLessThanOrEqual(urgencies[i - 1]);
    }
  });
});

describe("scenarioUrgency", () => {
  it("is the highest consequence among a scenario's own required steps", () => {
    const reachSomeone = HANDOFF_SCENARIOS.find((s) => s.key === "reach-someone")!;
    const expected = Math.max(...reachSomeone.requires.map((key) => AFFAIR_STEP_BY_KEY[key].consequence));
    expect(scenarioUrgency(reachSomeone)).toBe(expected);
  });

  it("invents no severity of its own beyond what the knowledge base already assigns each step", () => {
    for (const scenario of HANDOFF_SCENARIOS) {
      const consequences = scenario.requires.map((key) => AFFAIR_STEP_BY_KEY[key]?.consequence).filter((c) => c !== undefined);
      expect(scenarioUrgency(scenario)).toBe(Math.max(...consequences));
    }
  });
});
