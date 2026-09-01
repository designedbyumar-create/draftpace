import { describe, expect, it } from "vitest";
import {
  assembleCheck,
  CONFIDENCE_FLOOR,
  deriveResult,
  describeResult,
  describeStanding,
  shortfall,
  STANDING_LABEL,
  suggestion,
  type CheckAnswer,
  type CheckItem,
} from "./check";

const item = (id: string, topicKey: string): CheckItem => ({
  id,
  topicKey,
  source: "parent",
  prompt: `Question ${id}`,
  expectedAnswer: null,
});

const items = (topicKey: string, n: number, prefix = "i") =>
  Array.from({ length: n }, (_, k) => item(`${prefix}${k}`, topicKey));

const answers = (its: CheckItem[], marks: CheckAnswer["mark"][]): CheckAnswer[] =>
  its.map((it, k) => ({ itemId: it.id, topicKey: it.topicKey, mark: marks[k] ?? "right" }));

const FRACTIONS = "math.fractions-equivalent";
const DIVISION = "math.long-division";

describe("assembling a check", () => {
  it("is deterministic, so the same inputs give the same check", () => {
    const pool = items(FRACTIONS, 10);
    const a = assembleCheck({ topicKeys: [FRACTIONS], available: pool, seed: "s1" });
    const b = assembleCheck({ topicKeys: [FRACTIONS], available: pool, seed: "s1" });
    expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
  });

  it("varies between checks without ever being unreproducible", () => {
    const pool = items(FRACTIONS, 10);
    const a = assembleCheck({ topicKeys: [FRACTIONS], available: pool, seed: "s1" });
    const b = assembleCheck({ topicKeys: [FRACTIONS], available: pool, seed: "s2" });
    expect(a.map((i) => i.id)).not.toEqual(b.map((i) => i.id));
  });

  it("never invents a question to reach the floor", () => {
    const built = assembleCheck({ topicKeys: [FRACTIONS], available: items(FRACTIONS, 2), seed: "s" });
    expect(built).toHaveLength(2);
  });

  /**
   * Dropping a thin topic would leave a parent believing it had been
   * checked. It is included, and the result says what it can.
   */
  it("still includes a topic with too few questions, rather than hiding it", () => {
    const built = assembleCheck({
      topicKeys: [FRACTIONS, DIVISION],
      available: [...items(FRACTIONS, 6), ...items(DIVISION, 1, "d")],
      seed: "s",
    });
    expect(built.some((i) => i.topicKey === DIVISION)).toBe(true);
  });

  it("says how many more a topic needs", () => {
    expect(shortfall(DIVISION, items(DIVISION, 1))).toBe(CONFIDENCE_FLOOR - 1);
    expect(shortfall(DIVISION, items(DIVISION, 9))).toBe(0);
  });

  it("draws only on the topics asked for", () => {
    const built = assembleCheck({
      topicKeys: [FRACTIONS],
      available: [...items(FRACTIONS, 4), ...items(DIVISION, 4, "d")],
      seed: "s",
    });
    expect(built.every((i) => i.topicKey === FRACTIONS)).toBe(true);
  });
});

/**
 * The rule the whole feature turns on. Every other tool in this category
 * produces a confident looking result from thin evidence.
 */
describe("saying nothing when there is not enough", () => {
  it("refuses a verdict below the floor, whatever the answers were", () => {
    for (const marks of [["right", "right", "right"], ["not-right", "not-right", "not-right"]] as const) {
      const its = items(FRACTIONS, 3);
      const result = deriveResult(its, answers(its, [...marks]));
      expect(result.topics[0].standing).toBe("not-enough-to-say");
      expect(result.spoken).toHaveLength(0);
    }
  });

  it("speaks the moment there is exactly enough", () => {
    const its = items(FRACTIONS, CONFIDENCE_FLOOR);
    const result = deriveResult(its, answers(its, ["right", "right", "right", "right"]));
    expect(result.topics[0].standing).toBe("looked-solid");
  });

  it("does not count a skipped question towards the floor", () => {
    const its = items(FRACTIONS, 5);
    const result = deriveResult(its, answers(its, ["right", "right", "skipped", "skipped", "right"]));
    expect(result.topics[0].answered).toBe(3);
    expect(result.topics[0].standing).toBe("not-enough-to-say");
  });

  it("says so in words a parent can act on", () => {
    const its = items(DIVISION, 2);
    const result = deriveResult(its, answers(its, ["right", "right"]));
    expect(describeStanding(result.topics[0])).toBe("Not enough here to say anything about long division.");
  });

  it("keeps silent topics separate from spoken ones", () => {
    const its = [...items(FRACTIONS, 4), ...items(DIVISION, 2, "d")];
    const result = deriveResult(its, answers(its, ["right", "right", "right", "right", "right", "right"]));
    expect(result.spoken.map((t) => t.topicKey)).toEqual([FRACTIONS]);
    expect(result.silent.map((t) => t.topicKey)).toEqual([DIVISION]);
  });
});

describe("what the standings mean", () => {
  const run = (marks: CheckAnswer["mark"][]) => {
    const its = items(FRACTIONS, marks.length);
    return deriveResult(its, answers(its, marks)).topics[0];
  };

  it("calls it solid only when nearly all of it was right", () => {
    expect(run(["right", "right", "right", "right"]).standing).toBe("looked-solid");
    expect(run(["right", "right", "right", "right", "not-right"]).standing).toBe("looked-solid");
  });

  /**
   * Three of four is one question away from four of four. Resolving that
   * gap would be inventing precision the evidence does not carry.
   */
  it("calls three of four mixed rather than solid", () => {
    expect(run(["right", "right", "right", "not-right"]).standing).toBe("mixed");
  });

  it("calls it worth another look when most of it was missed", () => {
    expect(run(["right", "not-right", "not-right", "not-right"]).standing).toBe("worth-another-look");
    expect(run(["not-right", "not-right", "not-right", "not-right"]).standing).toBe("worth-another-look");
  });
});

/**
 * The language is the feature. A check of eight questions is a check of
 * eight questions, and nothing the product says may exceed that.
 */
describe("what a result refuses to say", () => {
  const its = [...items(FRACTIONS, 4), ...items(DIVISION, 4, "d")];
  const result = deriveResult(
    its,
    answers(its, ["right", "right", "right", "right", "not-right", "not-right", "not-right", "right"])
  );
  const everything = [
    describeResult(result),
    ...result.topics.map(describeStanding),
    ...Object.values(STANDING_LABEL),
    ...result.topics.map((t) => suggestion(t, [{ topicKey: t.topicKey, standing: t.standing }])).filter(Boolean),
  ].join(" ");

  for (const word of [
    "behind",
    "ahead",
    "grade level",
    "proficient",
    "failing",
    "struggles",
    "gifted",
    "above average",
    "below average",
    "%",
  ]) {
    it(`never says "${word}"`, () => {
      expect(everything.toLowerCase()).not.toContain(word);
    });
  }

  it("never leads with a fraction", () => {
    expect(describeResult(result)).not.toMatch(/\d+\s*(of|\/)\s*\d+/);
  });

  it("never makes a statement of the form the child is", () => {
    for (const sentence of result.topics.map(describeStanding)) {
      expect(sentence).not.toMatch(/\b(is|was) (good|bad|weak|strong) at\b/i);
    }
  });

  it("names what came back rather than counting what was right", () => {
    expect(describeResult(result)).toBe("One thing here is worth going over again.");
  });

  it("says plainly when everything looked solid", () => {
    const all = items(FRACTIONS, 4);
    expect(describeResult(deriveResult(all, answers(all, ["right", "right", "right", "right"])))).toBe(
      "All of this looked solid."
    );
  });

  it("says plainly when the whole check was too short to mean anything", () => {
    const thin = items(FRACTIONS, 2);
    expect(describeResult(deriveResult(thin, answers(thin, ["right", "right"])))).toContain("too short to say anything");
  });

  it("says nothing at all when nothing was answered", () => {
    const its2 = items(FRACTIONS, 4);
    const result2 = deriveResult(its2, answers(its2, ["skipped", "skipped", "skipped", "skipped"]));
    expect(describeResult(result2)).toBe("Nothing was answered, so there is nothing to report.");
  });
});

/**
 * One check is one check. Nothing is suggested until the same thing has
 * come back twice, and nothing is ever changed by the product.
 */
describe("what the product suggests, and its limit", () => {
  const solid = { topicKey: FRACTIONS, label: "Equivalent fractions", standing: "looked-solid" as const, answered: 4, right: 4 };
  const poor = { ...solid, standing: "worth-another-look" as const, right: 1 };

  it("suggests nothing on a first check", () => {
    expect(suggestion(solid, [])).toBeNull();
    expect(suggestion(poor, [])).toBeNull();
  });

  it("suggests moving on only after it has looked solid twice", () => {
    expect(suggestion(solid, [{ topicKey: FRACTIONS, standing: "looked-solid" }])).toContain("move on when you are ready");
  });

  it("suggests more time only after it has come up twice", () => {
    expect(suggestion(poor, [{ topicKey: FRACTIONS, standing: "worth-another-look" }])).toContain("spend more time here");
  });

  it("does not carry one topic's history onto another", () => {
    expect(suggestion(solid, [{ topicKey: DIVISION, standing: "looked-solid" }])).toBeNull();
  });

  it("phrases everything as a suggestion about the material", () => {
    const lines = [
      suggestion(solid, [{ topicKey: FRACTIONS, standing: "looked-solid" }]),
      suggestion(poor, [{ topicKey: FRACTIONS, standing: "worth-another-look" }]),
    ];
    for (const line of lines) {
      expect(line).toBeTruthy();
      expect(line!).toMatch(/^This has/);
      expect(line!.toLowerCase()).not.toContain("she");
      expect(line!.toLowerCase()).not.toContain("he ");
    }
  });
});
