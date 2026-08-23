import { describe, expect, it } from "vitest";
import {
  BOOK_DISCLAIMER,
  buildBook,
  DEFAULT_BOOK_SECTIONS,
  describeBook,
  describePeriod,
  SOURCE_ON_PAPER,
  type BookInputs,
} from "./book";
import { SOURCE_LABEL } from "./learning";
import type { Child, Curriculum, PlanEntry, Position } from "./learning";
import type { Observation, WorkEntry } from "./record";

const emma: Child = {
  id: "emma",
  name: "Emma",
  age: 9,
  schoolingType: "homeschool",
  notes: "Gets tired after lunch.",
  nameVisibility: "shareable",
  ageVisibility: "private",
  notesVisibility: "private",
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
};

const plan: PlanEntry = {
  id: "p1",
  childId: "emma",
  subject: "Math",
  daysPerWeek: 4,
  active: true,
  minutesPerSession: 35,
  origin: "parent",
};

const curriculum: Curriculum = {
  id: "c1",
  childId: "emma",
  source: "publisher",
  title: "Abeka Grade 4",
  publisher: null,
  subject: "Math",
  visibility: "private",
  status: "active",
};

const position: Position = {
  id: "pos1",
  childId: "emma",
  curriculumId: "c1",
  nodeId: null,
  label: "Unit 3, Lesson 12",
  movedAt: "2026-08-01T00:00:00Z",
};

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

const inputs = (over: Partial<BookInputs> = {}): BookInputs => ({
  child: emma,
  curricula: [curriculum],
  positions: [position],
  plan: [plan],
  events: [work()],
  observations: [],
  checks: [],
  topicKeys: ["math.multiplication"],
  sections: DEFAULT_BOOK_SECTIONS,
  generatedAt: new Date("2026-08-22T12:00:00Z"),
  ...over,
});

describe("what reaches the page", () => {
  it("carries the name, so a record says whose it is", () => {
    expect(buildBook(inputs()).name).toBe("Emma");
  });

  it("leaves out everything the parent has not opted in", () => {
    const book = buildBook(inputs());
    expect(book.age).toBeNull();
    expect(JSON.stringify(book)).not.toContain("Gets tired after lunch");
  });

  it("honours a parent who opts the age in", () => {
    expect(buildBook(inputs({ child: { ...emma, ageVisibility: "shareable" } })).age).toBe(9);
  });

  it("names each subject with where it came from and where they are", () => {
    const subject = buildBook(inputs()).subjects[0];
    expect(subject.subject).toBe("Math");
    expect(subject.source).toBe("publisher");
    expect(subject.curriculumTitle).toBe("Abeka Grade 4");
    expect(subject.position).toBe("Unit 3, Lesson 12");
    expect(subject.topics).toEqual(["Multiplication"]);
  });

  it("credits a starting outline rather than the parent", () => {
    const outlined = buildBook(
      inputs({ curricula: [], plan: [{ ...plan, origin: "draftpace-outline" }] })
    );
    expect(outlined.subjects[0].source).toBe("draftpace");
  });

  it("groups the log by day, newest first", () => {
    const book = buildBook(inputs({ events: [work({ onDate: "2026-08-18" }), work({ onDate: "2026-08-21" })] }));
    expect(book.days.map((d) => d.date)).toEqual(["2026-08-21", "2026-08-18"]);
  });
});

/**
 * The rule that must never bend. A section level choice can leave every
 * observation out. It can never put a private one in.
 */
describe("privacy on paper", () => {
  it("leaves every observation out by default, because they start private", () => {
    expect(buildBook(inputs({ observations: [note(), note({ id: "o2" })] })).observations).toEqual([]);
  });

  it("includes only the ones the parent opted in", () => {
    const book = buildBook(
      inputs({ observations: [note(), note({ id: "o2", visibility: "shareable", note: "Read a whole chapter." })] })
    );
    expect(book.observations).toHaveLength(1);
    expect(book.observations[0].note).toBe("Read a whole chapter.");
  });

  it("cannot be made to include a private one by turning the section on", () => {
    const book = buildBook({
      ...inputs({ observations: [note()] }),
      sections: { history: true, observations: true, checks: true },
    });
    expect(book.observations).toEqual([]);
  });

  it("leaves checks out unless the parent asks for them", () => {
    const checks = [
      { createdAt: "2026-08-22T10:00:00Z", topicKey: "math.multiplication", standing: "mixed" as const, answered: 4, right: 3 },
    ];
    expect(DEFAULT_BOOK_SECTIONS.checks).toBe(false);
    expect(buildBook(inputs({ checks })).checks).toEqual([]);
    const withChecks = buildBook({ ...inputs({ checks }), sections: { ...DEFAULT_BOOK_SECTIONS, checks: true } });
    expect(withChecks.checks).toHaveLength(1);
    expect(withChecks.checks[0].standing).toBe("Mixed");
  });

  it("belongs to one child and cannot carry another", () => {
    const book = buildBook(inputs({ events: [work(), work({ childId: "noah", subject: "Reading" })] }));
    // Everything passed in is already scoped to the child by the caller;
    // what matters is that the book never names a second one.
    expect(book.name).toBe("Emma");
    expect(JSON.stringify(book)).not.toContain("noah");
  });
});

/**
 * A record says what happened. The moment it says how it is going it has
 * become a report card, which this product has no standing to issue.
 */
describe("what the record refuses to say", () => {
  const book = buildBook(inputs({ events: [work(), work({ subject: "Reading", onDate: "2026-08-21" })] }));
  const everything = [describeBook(book), describePeriod(book) ?? "", BOOK_DISCLAIMER].join(" ");

  it("counts what happened without measuring it", () => {
    expect(describeBook(book)).toBe("2 sessions in 1 subject.");
  });

  it("says plainly when there is nothing", () => {
    const bare = buildBook(inputs({ events: [], plan: [], curricula: [] }));
    expect(bare.empty).toBe(true);
    expect(describeBook(bare)).toBe("Nothing has been recorded yet.");
  });

  /*
    "assessment" and "transcript" are deliberately absent from this list.
    The disclaimer has to say both in order to deny them, and a rule that
    forbids naming the thing you are refusing to be would force the
    disclaimer to become vaguer than the truth.
  */
  for (const word of ["behind", "ahead", "grade level", "proficient", "mastered", "on track", "%"]) {
    it(`never says "${word}"`, () => {
      expect(everything.toLowerCase(), word).not.toContain(word);
    });
  }

  it("mentions assessment and transcript only to deny being either", () => {
    for (const word of ["assessment", "transcript"]) {
      const said = everything.toLowerCase().includes(word);
      if (said) expect(BOOK_DISCLAIMER.toLowerCase()).toContain(`not a${word === "assessment" ? "n" : ""} ${word}`);
    }
  });

  it("states outright what it is not", () => {
    expect(BOOK_DISCLAIMER).toContain("not an assessment");
    expect(BOOK_DISCLAIMER).toContain("not a transcript");
    expect(BOOK_DISCLAIMER).toContain("makes no claim about how any of it went");
  });

  it("uses no em dash", () => {
    expect(everything).not.toContain("—");
  });

  it("names the period it covers rather than implying a school year", () => {
    expect(describePeriod(book)).toBe("20 August 2026 to 21 August 2026");
    expect(describePeriod(buildBook(inputs({ events: [] })))).toBeNull();
  });
});

/**
 * The record is read by somebody who has never used this product. The
 * on-screen label is for the parent who chose it; the printed one is for
 * a stranger, and one string cannot serve both.
 */
describe("how a source reads to a stranger", () => {
  it("never prints the product's own name as a category", () => {
    for (const label of Object.values(SOURCE_ON_PAPER)) {
      expect(label).not.toContain("Draftpace");
    }
  });

  it("says what each one actually means", () => {
    expect(SOURCE_ON_PAPER.publisher).toBe("From a published curriculum");
    expect(SOURCE_ON_PAPER.parent).toBe("Planned by their parent");
    expect(SOURCE_ON_PAPER.draftpace).toBe("From a suggested starting outline");
  });

  it("differs from the on-screen labels rather than reusing them", () => {
    for (const key of ["publisher", "parent", "draftpace"] as const) {
      expect(SOURCE_ON_PAPER[key]).not.toBe(SOURCE_LABEL[key]);
    }
  });

  it("still credits an outline rather than the parent", () => {
    expect(SOURCE_ON_PAPER.draftpace.toLowerCase()).toContain("outline");
    expect(SOURCE_ON_PAPER.draftpace.toLowerCase()).not.toContain("parent");
  });
});
