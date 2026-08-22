import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  bandForAge,
  buildStartingOutline,
  describeSubjectShape,
  minutesPerWeek,
  OUTLINE_DISCLAIMER,
} from "./startingOutline";
import { TOPICS } from "./taxonomy";

const outline = (over: Partial<Parameters<typeof buildStartingOutline>[0]> = {}) =>
  buildStartingOutline({ age: 9, subjects: ["Math", "Reading"], daysAvailable: 5, ...over });

describe("what an outline is built from", () => {
  it("uses only what the parent already told us during setup", () => {
    const built = outline({ age: 9, subjects: ["Math"], daysAvailable: 4 });
    expect(built.subjects).toHaveLength(1);
    expect(built.subjects[0].subject).toBe("Math");
  });

  it("is deterministic, so the same answers give the same outline", () => {
    expect(JSON.stringify(outline())).toBe(JSON.stringify(outline()));
  });

  it("never schedules more days than the family said they have", () => {
    const built = outline({ daysAvailable: 2, subjects: ["Math", "Reading", "Science"] });
    for (const subject of built.subjects) {
      expect(subject.daysPerWeek, subject.subject).toBeLessThanOrEqual(2);
    }
  });

  it("copes with an age nobody gave", () => {
    const built = outline({ age: null });
    expect(built.subjects.length).toBeGreaterThan(0);
    expect(built.subjects[0].focus.length).toBeGreaterThan(0);
  });

  it("gives a subject with no topics time in the week anyway", () => {
    const built = outline({ subjects: ["Art"] });
    expect(built.subjects[0].daysPerWeek).toBeGreaterThan(0);
    expect(built.subjects[0].focus).toEqual([]);
  });

  it("suggests different starting points for different ages", () => {
    const young = outline({ age: 6, subjects: ["Math"] }).subjects[0].focus.map((t) => t.key);
    const older = outline({ age: 12, subjects: ["Math"] }).subjects[0].focus.map((t) => t.key);
    expect(young).not.toEqual(older);
  });

  it("suggests only topics that exist in the taxonomy", () => {
    const keys = new Set(TOPICS.map((t) => t.key));
    for (const age of [5, 9, 12, 15]) {
      for (const subject of outline({ age, subjects: ["Math", "Reading", "Science"] }).subjects) {
        for (const topic of subject.focus) expect(keys.has(topic.key), topic.key).toBe(true);
      }
    }
  });

  it("shows a parent roughly what a week costs, so they can judge it", () => {
    expect(minutesPerWeek(outline({ subjects: ["Math"], age: 9, daysAvailable: 4 }))).toBe(35 * 4);
  });

  it("bands ages without leaving a gap", () => {
    for (let age = 0; age <= 18; age += 1) expect(bandForAge(age), String(age)).toBeTruthy();
  });
});

/**
 * The language is the feature. An outline that reads as a curriculum has
 * become one, whatever the code comments say.
 */
describe("what an outline refuses to claim", () => {
  const source = readFileSync(new URL("./startingOutline.ts", import.meta.url), "utf8");
  const built = outline({ subjects: ["Math", "Reading", "Science", "Writing", "History", "Geography"] });
  const everything = [
    OUTLINE_DISCLAIMER,
    ...built.subjects.map(describeSubjectShape),
    ...built.subjects.flatMap((s) => s.activities),
  ].join(" ");

  it("says outright that it is a starting point and not a curriculum", () => {
    expect(OUTLINE_DISCLAIMER).toContain("not a required curriculum");
    expect(OUTLINE_DISCLAIMER).toContain("Change anything");
  });

  for (const word of ["must", "should learn", "required to", "behind", "ahead", "grade level", "mastered", "proficient"]) {
    it(`never says "${word}"`, () => {
      expect(everything.toLowerCase(), word).not.toContain(word);
    });
  }

  it("hedges every quantity, because none of them is exact", () => {
    for (const subject of built.subjects) {
      expect(describeSubjectShape(subject)).toMatch(/^About \d+ minutes/);
    }
  });

  it("uses no em dash anywhere a parent reads", () => {
    expect(everything).not.toContain("—");
  });

  /**
   * The taxonomy is a vocabulary and carries no ages. Ages live here,
   * where a suggestion may reasonably mention them. Merging the two
   * would turn the vocabulary into an age graded curriculum by accident.
   */
  it("keeps ages out of the taxonomy by living in its own file", () => {
    const taxonomy = readFileSync(new URL("./taxonomy.ts", import.meta.url), "utf8");
    expect(taxonomy).not.toContain("minAge");
    expect(source).toContain("minAge");
  });

  it("describes activities as ordinary ways to spend time, not a method", () => {
    const activities = new Set(built.subjects.flatMap((s) => s.activities));
    expect(activities.size).toBeGreaterThan(4);
    for (const activity of activities) {
      expect(activity.toLowerCase()).not.toContain("lesson plan");
      expect(activity.toLowerCase()).not.toContain("curriculum");
    }
  });
});

/**
 * A parent who accepts an outline gets subjects and days they did not
 * choose. Labelling those "Your plan" would be the product taking credit
 * off them for its own guess, and it is the one rule this product keeps
 * everywhere else: the source is on screen, every time.
 */
describe("an outline keeps saying where it came from", () => {
  const child = readFileSync(new URL("./components/ChildDetailModule.tsx", import.meta.url), "utf8");
  const kids = readFileSync(new URL("./components/KidsModule.tsx", import.meta.url), "utf8");

  it("saves outline subjects as ours, not as the parent's own plan", () => {
    expect(kids).toContain('origin: "draftpace-outline"');
  });

  it("says so on the child's page rather than claiming they wrote it", () => {
    expect(child).toContain('entry.origin === "draftpace-outline" ? SOURCE_LABEL.draftpace : SOURCE_LABEL.parent');
  });

  it("tells them how it stops being ours", () => {
    expect(child).toContain("Change anything and it becomes yours");
  });
});
