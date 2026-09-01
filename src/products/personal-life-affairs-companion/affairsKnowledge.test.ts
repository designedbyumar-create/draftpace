import { describe, expect, it } from "vitest";
import { AFFAIR_STEPS, AFFAIR_STEP_BY_KEY, AFFAIR_AREA_LABEL, type AffairStep } from "./affairsKnowledge";

/** Only the strings a person actually reads. Doc comments are exempt by construction. */
function userFacing(step: AffairStep): string[] {
  return [step.instruction, step.why, step.referOut].filter((s): s is string => Boolean(s));
}

describe("the knowledge base", () => {
  it("has enough steps to be worth buying, and few enough to be finishable", () => {
    expect(AFFAIR_STEPS.length).toBeGreaterThanOrEqual(40);
    expect(AFFAIR_STEPS.length).toBeLessThanOrEqual(80);
  });

  it("gives every step a unique key", () => {
    const keys = AFFAIR_STEPS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses a key shape the database will accept", () => {
    // pla_steps.step_key has check (step_key ~ '^[a-z][a-z0-9.-]*$').
    for (const step of AFFAIR_STEPS) {
      expect(step.key, step.key).toMatch(/^[a-z][a-z0-9.-]*$/);
    }
  });

  it("points every prerequisite at a step that exists", () => {
    for (const step of AFFAIR_STEPS) {
      for (const required of step.requires ?? []) {
        expect(AFFAIR_STEP_BY_KEY[required], `${step.key} requires missing ${required}`).toBeDefined();
      }
    }
  });

  /**
   * A cycle would make the sequencer unable to ever surface either step,
   * and the failure would look like an empty product rather than an error.
   */
  it("has no circular prerequisites", () => {
    const seen = new Map<string, "visiting" | "done">();
    const walk = (key: string, trail: string[]) => {
      if (seen.get(key) === "done") return;
      expect(seen.get(key), `cycle: ${[...trail, key].join(" -> ")}`).not.toBe("visiting");
      seen.set(key, "visiting");
      for (const next of AFFAIR_STEP_BY_KEY[key]?.requires ?? []) walk(next, [...trail, key]);
      seen.set(key, "done");
    };
    for (const step of AFFAIR_STEPS) walk(step.key, []);
  });

  /**
   * A step gated on hasChildren whose prerequisite is not gated the same
   * way would be permanently blocked for the people who need it.
   */
  it("never gates a step more narrowly than the steps it depends on", () => {
    for (const step of AFFAIR_STEPS) {
      for (const required of step.requires ?? []) {
        for (const gate of AFFAIR_STEP_BY_KEY[required]?.needs ?? []) {
          expect(step.needs ?? [], `${step.key} needs ${gate} because ${required} does`).toContain(gate);
        }
      }
    }
  });

  it("never says estate or assets to a person", () => {
    for (const step of AFFAIR_STEPS) {
      for (const text of userFacing(step)) {
        expect(text.toLowerCase(), step.key).not.toContain("estate");
        expect(text.toLowerCase(), step.key).not.toContain("asset");
      }
    }
  });

  it("never says overdue, and never uses an em dash", () => {
    for (const step of AFFAIR_STEPS) {
      for (const text of [...userFacing(step), ...Object.values(AFFAIR_AREA_LABEL)]) {
        expect(text.toLowerCase()).not.toContain("overdue");
        expect(text).not.toContain("—");
      }
    }
  });

  it("tells every step why it matters, so no screen can ask without answering that", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.why.length, step.key).toBeGreaterThan(30);
      expect(step.instruction.length, step.key).toBeGreaterThan(10);
    }
  });

  it("gives an honest time estimate to every step", () => {
    for (const step of AFFAIR_STEPS) {
      expect(step.minutes, step.key).toBeGreaterThan(0);
      expect(step.minutes, step.key).toBeLessThanOrEqual(30);
    }
  });

  it("offers a first step that needs nothing else and takes under five minutes", () => {
    // The 43% who never start need somewhere obvious to begin.
    const openers = AFFAIR_STEPS.filter((s) => !s.requires?.length && !s.needs?.length && s.minutes <= 5);
    expect(openers.length).toBeGreaterThan(0);
  });

  it("covers every area with at least two steps", () => {
    for (const area of Object.keys(AFFAIR_AREA_LABEL)) {
      expect(AFFAIR_STEPS.filter((s) => s.area === area).length, area).toBeGreaterThanOrEqual(2);
    }
  });

  it("refers out rather than pretending to give legal advice", () => {
    const refers = AFFAIR_STEPS.filter((s) => s.referOut);
    expect(refers.length).toBeGreaterThan(0);
    for (const step of refers) {
      expect(step.referOut!.length).toBeGreaterThan(40);
    }
  });

  it("re-asks the things that go stale, and does not re-ask the things that do not", () => {
    const beneficiary = AFFAIR_STEP_BY_KEY["money.beneficiary-check"];
    expect(beneficiary.confirmEveryMonths).toBeDefined();
    // A letter to someone you love does not expire.
    expect(AFFAIR_STEP_BY_KEY["wishes.letters"].confirmEveryMonths).toBeUndefined();
  });

  it("treats the beneficiary trap as seriously as it deserves", () => {
    // Named forms override a will, and a stale one quietly wins.
    for (const key of ["money.beneficiary-check", "money.retirement-employer"]) {
      expect(AFFAIR_STEP_BY_KEY[key].consequence, key).toBe(2);
    }
  });
});
