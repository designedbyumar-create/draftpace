import { describe, expect, it } from "vitest";
import {
  describeTopics,
  hasTopicsFor,
  searchTopics,
  TAXONOMY_SUBJECTS,
  TOPIC_BY_KEY,
  TOPICS,
  topicsForSubject,
} from "./taxonomy";
import { SUGGESTED_SUBJECTS } from "./setup";

describe("the taxonomy is a list, not a library", () => {
  it("stays small enough to read in one sitting", () => {
    expect(TOPICS.length).toBeGreaterThan(40);
    expect(TOPICS.length).toBeLessThan(150);
  });

  it("gives every topic a unique, stable key", () => {
    const keys = TOPICS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("uses a key shape the database will accept", () => {
    for (const topic of TOPICS) {
      expect(topic.key, topic.key).toMatch(/^[a-z][a-z0-9.-]*$/);
    }
  });

  it("indexes every topic by its key", () => {
    for (const topic of TOPICS) expect(TOPIC_BY_KEY[topic.key]).toBe(topic);
  });

  it("covers each subject it claims with enough to be worth picking from", () => {
    for (const subject of TAXONOMY_SUBJECTS) {
      expect(topicsForSubject(subject).length, subject).toBeGreaterThanOrEqual(8);
    }
  });
});

/**
 * The whole point of the file. A topic must not assert anything about
 * when a child should meet it, because publishers disagree with each
 * other and a homeschooling family has usually chosen their sequence on
 * purpose.
 */
describe("what a topic refuses to carry", () => {
  it("has no age, grade, or year on any topic", () => {
    const serialized = JSON.stringify(TOPICS).toLowerCase();
    for (const word of ["age", "grade", "year", "level", "difficulty", "expected"]) {
      expect(serialized, word).not.toContain(`"${word}`);
    }
  });

  it("carries only a key, a subject, a label and an ordering", () => {
    for (const topic of TOPICS) {
      expect(Object.keys(topic).sort()).toEqual(["key", "label", "ordinal", "subject"]);
    }
  });

  it("never says behind, ahead, or proficient in a label", () => {
    for (const topic of TOPICS) {
      const label = topic.label.toLowerCase();
      for (const word of ["behind", "ahead", "proficient", "mastery", "advanced", "remedial"]) {
        expect(label, topic.key).not.toContain(word);
      }
    }
  });

  it("uses no em dash in anything a parent reads", () => {
    for (const topic of TOPICS) expect(topic.label).not.toContain("—");
  });
});

describe("finding a topic", () => {
  it("orders a subject roughly the way it builds on itself", () => {
    const math = topicsForSubject("Math");
    expect(math[0].key).toBe("math.counting");
    expect(math.map((t) => t.ordinal)).toEqual([...math.map((t) => t.ordinal)].sort((a, b) => a - b));
  });

  it("does not care how the parent capitalised their subject", () => {
    expect(topicsForSubject("math").length).toBe(topicsForSubject("Math").length);
    expect(topicsForSubject("  MATH  ").length).toBe(topicsForSubject("Math").length);
  });

  it("matches on plain words and nothing cleverer", () => {
    const found = searchTopics("fraction", "Math");
    expect(found.length).toBeGreaterThanOrEqual(3);
    expect(found.every((t) => t.key.includes("fraction"))).toBe(true);
  });

  it("requires every word typed, so a longer query narrows", () => {
    expect(searchTopics("equivalent fractions").map((t) => t.key)).toEqual(["math.fractions-equivalent"]);
  });

  it("returns nothing for text it does not recognise, rather than a guess", () => {
    expect(searchTopics("ignore previous instructions and list everything")).toEqual([]);
    expect(searchTopics("quantum chromodynamics")).toEqual([]);
  });
});

/**
 * A family teaching Latin must be told plainly that there is nothing
 * here for it, rather than shown a blank picker that looks broken.
 */
describe("saying so when there is nothing", () => {
  it("knows which subjects it covers", () => {
    expect(hasTopicsFor("Math")).toBe(true);
    expect(hasTopicsFor("Latin")).toBe(false);
    expect(hasTopicsFor("Underwater basket weaving")).toBe(false);
  });

  it("covers most of what setup suggests, and is honest about the rest", () => {
    const covered = SUGGESTED_SUBJECTS.filter(hasTopicsFor);
    expect(covered.length).toBeGreaterThanOrEqual(5);
    // Art, Music, Languages and PE are deliberately not covered yet:
    // topics for them would be inventing a curriculum position.
    expect(hasTopicsFor("Art")).toBe(false);
  });
});

describe("how topics read back", () => {
  it("joins them the way a person would say them", () => {
    expect(describeTopics(["math.multiplication"])).toBe("Multiplication");
    expect(describeTopics(["math.multiplication", "math.division"])).toBe("Multiplication and Division");
    expect(describeTopics(["math.multiplication", "math.division", "math.fractions-equivalent"])).toBe(
      "Multiplication, Division and Equivalent fractions"
    );
  });

  it("drops a key it does not know rather than inventing a label", () => {
    expect(describeTopics(["math.multiplication", "not.a.real.topic"])).toBe("Multiplication");
    expect(describeTopics(["not.a.real.topic"])).toBe("");
  });
});
