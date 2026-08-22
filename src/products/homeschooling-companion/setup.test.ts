import { describe, expect, it } from "vitest";
import {
  CURRICULUM_STANCE_LABEL,
  EMPTY_CHILD_DRAFT,
  isSetupComplete,
  nextSetupStep,
  setupLength,
  SUGGESTED_SUBJECTS,
  type ChildDraft,
  type SetupStepId,
} from "./setup";
import { DEFAULT_VISIBILITY, SOURCE_LABEL } from "./learning";

const draft = (over: Partial<ChildDraft> = {}): ChildDraft => ({ ...EMPTY_CHILD_DRAFT, ...over });

describe("asking only what will be used", () => {
  it("opens with the child's name and nothing else", () => {
    const step = nextSetupStep(draft());
    expect(step).not.toBe("done");
    expect(step === "done" ? null : step.id).toBe("name");
  });

  it("asks for an age and never a date of birth", () => {
    const step = nextSetupStep(draft({ name: "Emma" }));
    expect(step === "done" ? null : step.id).toBe("age");
    const everyQuestion = (["name", "age", "schooling", "stance"] as SetupStepId[])
      .map((id) => nextSetupStep(draft({ name: id === "name" ? "" : "Emma", age: "9", schoolingType: "homeschool" })))
      .map((s) => (s === "done" ? "" : `${s.question} ${s.why}`))
      .join(" ")
      .toLowerCase();
    expect(everyQuestion).not.toContain("date of birth");
    expect(everyQuestion).not.toContain("birthday");
  });

  it("lets a parent skip the age without being asked again", () => {
    const skipped = new Set<SetupStepId>(["age"]);
    const step = nextSetupStep(draft({ name: "Emma" }), skipped);
    expect(step === "done" ? null : step.id).toBe("schooling");
  });

  it("answers why before it asks, on every question", () => {
    const drafts = [
      draft(),
      draft({ name: "Emma" }),
      draft({ name: "Emma", age: "9" }),
      draft({ name: "Emma", age: "9", schoolingType: "homeschool" }),
      draft({ name: "Emma", age: "9", schoolingType: "homeschool", stance: "have-one" }),
      draft({ name: "Emma", age: "9", schoolingType: "homeschool", stance: "not-sure" }),
    ];
    for (const d of drafts) {
      const step = nextSetupStep(d);
      if (step === "done") continue;
      expect(step.why.length, step.id).toBeGreaterThan(20);
    }
  });
});

describe("the branch that defines the product", () => {
  const base = { name: "Emma", age: "9", schoolingType: "homeschool" as const };

  it("asks which curriculum, and only its name", () => {
    const step = nextSetupStep(draft({ ...base, stance: "have-one" }));
    expect(step === "done" ? null : step.id).toBe("curriculum-title");
    const why = step === "done" ? "" : step.why.toLowerCase();
    expect(why).toContain("nothing is uploaded");
  });

  it("finishes a curriculum-following parent in seven questions, position included", () => {
    expect(setupLength(draft({ ...base, stance: "have-one" }))).toBe(7);
  });

  /**
   * The rule the whole product turns on. A parent with their own plan is
   * set up, not partway to being a parent who wants suggestions.
   */
  it("finishes a parent with their own plan without ever mentioning a curriculum", () => {
    const d = draft({ ...base, stance: "our-own", subjects: ["Math", "Reading"], subjectsConfirmed: true });
    expect(isSetupComplete(d)).toBe(true);
    expect(setupLength(d)).toBeLessThan(setupLength(draft({ ...base, stance: "have-one" })));
  });

  it("never asks a not-sure parent for a curriculum they said they do not have", () => {
    const seen: string[] = [];
    let d = draft({ ...base, stance: "not-sure" });
    for (let i = 0; i < 6; i += 1) {
      const step = nextSetupStep(d);
      if (step === "done") break;
      seen.push(step.id);
      d = { ...d, wantsSuggestions: false };
    }
    expect(seen).not.toContain("curriculum-title");
    expect(seen).toContain("suggestions");
  });

  it("treats no thanks as a finished answer, so a parent with no plan still has a product", () => {
    const d = draft({ ...base, stance: "not-sure", wantsSuggestions: false });
    expect(isSetupComplete(d)).toBe(true);
  });

  it("stops asking about curriculum entirely for a child who is at school", () => {
    for (const schoolingType of ["private-school", "public-school"] as const) {
      const d = draft({ name: "Noah", age: "7", schoolingType });
      expect(isSetupComplete(d), schoolingType).toBe(true);
      expect(setupLength(d)).toBe(3);
    }
  });

  it("still asks a hybrid family, because they are teaching some of it", () => {
    const d = draft({ name: "Noah", age: "7", schoolingType: "hybrid" });
    const step = nextSetupStep(d);
    expect(step === "done" ? null : step.id).toBe("stance");
  });
});

describe("what setup refuses to say", () => {
  const strings = [
    ...Object.values(CURRICULUM_STANCE_LABEL),
    ...SUGGESTED_SUBJECTS,
    ...Object.values(SOURCE_LABEL),
  ];

  it("offers suggestions without implying the parent needs them", () => {
    expect(CURRICULUM_STANCE_LABEL["our-own"]).toBe("No, we are doing our own");
    expect(CURRICULUM_STANCE_LABEL["not-sure"]).toBe("Not sure yet");
  });

  /**
   * A homeschooling parent is already anxious about every one of these.
   * A product that supplies the vocabulary of comparison has taken a
   * side against the person paying for it.
   */
  for (const word of ["behind", "ahead", "grade level", "proficient", "failing", "incomplete"]) {
    it(`never says "${word}"`, () => {
      for (const s of strings) expect(s.toLowerCase(), s).not.toContain(word);
    });
  }

  it("uses no em dash anywhere", () => {
    for (const s of strings) expect(s).not.toContain("—");
  });

  it("never counts across the product, only within setting up one child", () => {
    // setupLength is bounded by the questions one child can be asked.
    expect(setupLength(draft())).toBeLessThanOrEqual(8);
  });
});

describe("what the product says about where something came from", () => {
  it("names all three sources distinctly, so a parent always knows", () => {
    expect(SOURCE_LABEL.publisher).toBe("Your curriculum");
    expect(SOURCE_LABEL.parent).toBe("Your plan");
    expect(SOURCE_LABEL.draftpace).toBe("Draftpace suggestion");
    expect(new Set(Object.values(SOURCE_LABEL)).size).toBe(3);
  });
});

describe("the visibility defaults", () => {
  it("makes the child's name shareable and everything else private", () => {
    expect(DEFAULT_VISIBILITY.childName).toBe("shareable");
    for (const [field, value] of Object.entries(DEFAULT_VISIBILITY)) {
      if (field === "childName") continue;
      expect(value, field).toBe("private");
    }
  });
});

describe("subjects, the one question with more than one answer", () => {
  const base = { name: "Emma", age: "9", schoolingType: "homeschool" as const, stance: "our-own" as const };

  /**
   * The defect this covers: every other step advances on the first
   * answer, and subjects inherited that, so a family teaching four
   * subjects could enter exactly one before the flow moved on.
   */
  it("does not advance the moment one subject is chosen", () => {
    const step = nextSetupStep(draft({ ...base, subjects: ["Math"] }));
    expect(step === "done" ? null : step.id).toBe("subjects");
  });

  it("advances only when the parent says they are finished choosing", () => {
    const step = nextSetupStep(draft({ ...base, subjects: ["Math"], subjectsConfirmed: true }));
    expect(step).toBe("done");
  });

  it("lets a parent confirm without picking any, since a plan is optional", () => {
    expect(isSetupComplete(draft({ ...base, subjects: [], subjectsConfirmed: true }))).toBe(true);
  });
});
