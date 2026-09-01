import { describe, expect, it } from "vitest";
import {
  deriveRecord,
  describeHowItWent,
  describeRecord,
  describeWork,
  shareableEntries,
  type Observation,
  type RecordInputs,
  type WorkEntry,
} from "./record";
import type { Child } from "./learning";

const emma: Child = {
  id: "emma",
  name: "Emma",
  age: 9,
  schoolingType: "homeschool",
  notes: null,
  nameVisibility: "shareable",
  ageVisibility: "private",
  notesVisibility: "private",
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
};
const noah: Child = { ...emma, id: "noah", name: "Noah" };

const work = (over: Partial<WorkEntry> = {}): WorkEntry => ({
  childId: "emma",
  subject: "Math",
  onDate: "2026-08-20",
  state: "done",
  difficulty: null,
  helpNeeded: null,
  positionLabel: "Unit 3, Lesson 12",
  ...over,
});

const note = (over: Partial<Observation> = {}): Observation => ({
  id: "o1",
  childId: "emma",
  onDate: "2026-08-20",
  note: "Finally got equivalent fractions.",
  visibility: "private",
  ...over,
});

const inputs = (over: Partial<RecordInputs> = {}): RecordInputs => ({
  children: [emma, noah],
  events: [work()],
  observations: [],
  childId: null,
  ...over,
});

describe("what the record contains", () => {
  it("groups by day, newest first", () => {
    const view = deriveRecord(
      inputs({ events: [work({ onDate: "2026-08-18" }), work({ onDate: "2026-08-21", subject: "Reading" })] })
    );
    expect(view.days.map((d) => d.date)).toEqual(["2026-08-21", "2026-08-18"]);
  });

  it("puts the work before the observation about it", () => {
    const view = deriveRecord(inputs({ observations: [note()] }));
    expect(view.days[0].entries.map((e) => e.kind)).toEqual(["work", "observation"]);
  });

  it("orders a day's subjects the same way every time", () => {
    const view = deriveRecord(
      inputs({ events: [work({ subject: "Reading" }), work({ subject: "Art" }), work({ subject: "Math" })] })
    );
    const subjects = view.days[0].entries.map((e) => (e.kind === "work" ? e.work.subject : ""));
    expect(subjects).toEqual(["Art", "Math", "Reading"]);
  });

  it("keeps the parent's own words for where they were", () => {
    expect(describeWork(work())).toBe("Math, Unit 3, Lesson 12");
    expect(describeWork(work({ positionLabel: null }))).toBe("Math");
  });
});

describe("one child at a time", () => {
  const both = inputs({
    events: [work({ childId: "emma" }), work({ childId: "noah", subject: "Reading" })],
    observations: [note({ childId: "noah", id: "o2" })],
  });

  it("shows the household when no child is chosen", () => {
    expect(deriveRecord(both).sessions).toBe(2);
  });

  it("shows only that child when one is", () => {
    const view = deriveRecord({ ...both, childId: "emma" });
    expect(view.sessions).toBe(1);
    expect(view.observations).toBe(0);
    expect(view.days.flatMap((d) => d.entries).every((e) => e.childId === "emma")).toBe(true);
  });

  it("never leaks one child into another's record", () => {
    const view = deriveRecord({ ...both, childId: "noah" });
    const text = JSON.stringify(view);
    expect(text).not.toContain("emma");
  });
});

/**
 * The line between a record and a verdict. A record says what happened.
 * The moment it says how it is going, it has taken a position this
 * product has no standing to take.
 */
describe("what the summary refuses to say", () => {
  it("counts what happened without measuring it against anything", () => {
    const view = deriveRecord(
      inputs({ events: [work(), work({ subject: "Reading" }), work({ subject: "Art", onDate: "2026-08-21" })] })
    );
    expect(describeRecord(view)).toBe("3 sessions across 3 subjects.");
  });

  it("counts observations alongside, in plain words", () => {
    const view = deriveRecord(inputs({ observations: [note()] }));
    expect(describeRecord(view)).toBe("1 session in 1 subject and 1 observation.");
  });

  it("says nothing at all when nothing has happened", () => {
    expect(describeRecord(deriveRecord(inputs({ events: [] })))).toBe("Nothing recorded yet.");
  });

  it("never grades, compares, or judges", () => {
    const view = deriveRecord(inputs({ events: [work({ difficulty: "difficult" })], observations: [note()] }));
    const line = describeRecord(view).toLowerCase();
    for (const word of ["behind", "ahead", "grade", "level", "proficient", "on track", "%", "score", "target"]) {
      expect(line).not.toContain(word);
    }
  });

  it("has no denominator anywhere in the view", () => {
    const view = deriveRecord(inputs());
    expect(JSON.stringify(view)).not.toContain("total");
    expect(JSON.stringify(view)).not.toContain("percent");
  });
});

describe("how it went, when the parent said", () => {
  it("says nothing when they did not", () => {
    expect(describeHowItWent(work())).toBeNull();
  });

  it("reports only what was actually recorded", () => {
    expect(describeHowItWent(work({ difficulty: "difficult" }))).toBe("Difficult");
    expect(describeHowItWent(work({ state: "not-completed" }))).toBe("Not finished");
    expect(describeHowItWent(work({ difficulty: "easy", helpNeeded: "none" }))).toBe("Easy · No help needed");
  });
});

/**
 * The most sensitive text in the product. It stays out of anything
 * printed until the parent puts it there, one observation at a time.
 */
describe("what would reach a printed record", () => {
  it("leaves every observation out by default", () => {
    const view = deriveRecord(inputs({ observations: [note(), note({ id: "o2" })] }));
    expect(shareableEntries(view).filter((e) => e.kind === "observation")).toHaveLength(0);
  });

  it("keeps the work, which is the record itself", () => {
    const view = deriveRecord(inputs({ observations: [note()] }));
    expect(shareableEntries(view).filter((e) => e.kind === "work")).toHaveLength(1);
  });

  it("includes an observation the parent opted in, and only that one", () => {
    const view = deriveRecord(
      inputs({ observations: [note({ id: "o1" }), note({ id: "o2", visibility: "shareable" })] })
    );
    const included = shareableEntries(view).filter((e) => e.kind === "observation");
    expect(included).toHaveLength(1);
    expect(included[0].kind === "observation" && included[0].observation.id).toBe("o2");
  });
});
