import type { SchoolingType } from "./learning";

/**
 * The questions that set a child up, and the branch that defines the
 * product.
 *
 * Pure and ordered, so the flow can be walked in a test without
 * rendering anything, and so the order is a reviewable decision rather
 * than the order somebody happened to write the JSX in.
 *
 * TWO RULES THIS FILE EXISTS TO KEEP
 *
 * Ask only what will be used, and ask it only when it will be used. A
 * parent who has given a name and an age has given enough to start; the
 * rest arrives when there is a reason for it. Every other product in
 * this category opens with a form and loses the people it is for.
 *
 * And never treat one branch as an incomplete version of another. A
 * parent following Abeka is not missing a plan. A parent with their own
 * plan is not missing a curriculum. A parent who wants suggestions is
 * not further along than either.
 */

/** The branch that decides everything after it. */
export type CurriculumStance = "have-one" | "our-own" | "not-sure";

export const CURRICULUM_STANCE_LABEL: Record<CurriculumStance, string> = {
  "have-one": "Yes, we have one",
  "our-own": "No, we are doing our own",
  "not-sure": "Not sure yet",
};

/**
 * What each branch means for what happens next, shown under the choice.
 *
 * "Not sure yet" leads somewhere useful rather than nowhere: this
 * product works from whatever a parent gives it, including nothing.
 */
export const CURRICULUM_STANCE_NOTE: Record<CurriculumStance, string> = {
  "have-one": "We will organize what you are already doing and stay out of the way.",
  "our-own": "Name your subjects and this follows your plan.",
  "not-sure": "We will put together a starting outline you can change, keep, or throw away.",
};

export interface ChildDraft {
  name: string;
  age: string;
  schoolingType: SchoolingType | null;
  stance: CurriculumStance | null;
  /** Only asked on the have-one branch. */
  curriculumTitle: string;
  /** Asked on both have-one and our-own. */
  subjects: string[];
  /**
   * Subjects is the one question with more than one answer, so it cannot
   * advance on the first tap the way every other step does. Without this
   * the flow moved on the moment a parent chose Math, and a family that
   * teaches four subjects could enter one.
   */
  subjectsConfirmed: boolean;
  /** Only asked on the have-one branch: "Lesson 12", or "just started". */
  position: string;
  /**
   * Only asked when the parent wants a starting outline. How many days a
   * week the family can actually school, which caps every subject in it.
   */
  daysAvailable: number | null;
}

export const EMPTY_CHILD_DRAFT: ChildDraft = {
  name: "",
  age: "",
  schoolingType: null,
  stance: null,
  curriculumTitle: "",
  subjects: [],
  subjectsConfirmed: false,
  position: "",
  daysAvailable: null,
};

export type SetupStepId =
  | "name"
  | "age"
  | "schooling"
  | "stance"
  | "curriculum-title"
  | "subjects"
  | "position"
  | "days-available"
  | "done";

export interface SetupStep {
  id: SetupStepId;
  question: string;
  /** Why it is being asked. Every question answers this before it is asked. */
  why: string;
  hint?: string;
  placeholder?: string;
  optional?: boolean;
}

const STEPS: Record<Exclude<SetupStepId, "done">, SetupStep> = {
  name: {
    id: "name",
    question: "What is your child called?",
    why: "It is what everything about them is filed under, and what appears on anything you print.",
    placeholder: "Emma",
  },
  age: {
    id: "age",
    question: "How old are they?",
    why: "Only their age, never a date of birth. Age is the only part that shapes anything here, and a birth date would be a thing worth stealing kept for no reason.",
    placeholder: "9",
    optional: true,
  },
  schooling: {
    id: "schooling",
    question: "How are they schooled?",
    why: "It decides whether this asks you about a curriculum at all. A child in school does not need one recorded here.",
  },
  stance: {
    id: "stance",
    question: "Are you already following a curriculum?",
    why: "This is the only thing that changes how the product behaves. If you have one, it organizes what you are already doing and gets out of the way.",
  },
  "curriculum-title": {
    id: "curriculum-title",
    question: "Which one?",
    why: "Only the name. Nothing is uploaded, nothing is read, and nothing is checked against it. It is how this refers to what you are following.",
    placeholder: "Abeka Grade 4",
  },
  subjects: {
    id: "subjects",
    question: "Which subjects?",
    why: "These become what you see each day. You can add or remove them whenever you like.",
  },
  "days-available": {
    id: "days-available",
    question: "How many days a week can you school?",
    why: "It is the only number that decides whether a starting outline is realistic. Three honest days beats five you will not manage.",
  },
  position: {
    id: "position",
    question: "Where are you now?",
    why: "In your own words. Thirty seconds here is everything this needs to show you the right thing tomorrow.",
    placeholder: "Unit 3, Lesson 12",
    optional: true,
  },
};

function filled(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * The next question, given what has been answered. Returns "done" when
 * there is nothing left worth asking on this branch.
 *
 * `skipped` carries the optional questions the parent passed over, so
 * they are not asked again in a loop.
 */
export function nextSetupStep(draft: ChildDraft, skipped: Set<SetupStepId> = new Set()): SetupStep | "done" {
  if (!filled(draft.name)) return STEPS.name;
  if (!filled(draft.age) && !skipped.has("age")) return STEPS.age;
  if (!draft.schoolingType) return STEPS.schooling;

  // A child in school is fully set up at this point. Asking a parent
  // about their curriculum when they told us the school has one would be
  // the product not listening.
  if (draft.schoolingType === "private-school" || draft.schoolingType === "public-school") return "done";

  if (!draft.stance) return STEPS.stance;

  if (draft.stance === "have-one") {
    if (!filled(draft.curriculumTitle)) return STEPS["curriculum-title"];
    if (!draft.subjectsConfirmed) return STEPS.subjects;
    if (!filled(draft.position) && !skipped.has("position")) return STEPS.position;
    return "done";
  }

  if (draft.stance === "our-own") {
    if (!draft.subjectsConfirmed) return STEPS.subjects;
    return "done";
  }

  /*
    "not-sure": the parent wants somewhere to begin.
    
    One extra question, and it is a practical one rather than an
    educational one. Everything else the outline needs was collected
    already: their age, and the subjects they want to focus on. Nothing
    is inferred about the child, and no profile is built.
  */
  if (!draft.subjectsConfirmed) return STEPS.subjects;
  // No subjects means nothing to outline, so asking how many days a week
  // they can school would be asking a question with no use for the
  // answer. They are finished, and recording what they actually do
  // works without any plan at all.
  if (draft.subjects.length === 0) return "done";
  if (draft.daysAvailable === null) return STEPS["days-available"];
  return "done";
}

/**
 * How many questions this branch will ask in total, for the quiet line
 * inside setup only.
 *
 * Scoped to setting up one child and never to the product. A count
 * across the whole product would be the progress bar this does not have,
 * and a parent midway through adding a second child is not 60% of
 * anything.
 */
export function setupLength(draft: ChildDraft): number {
  const base = 3; // name, age, schooling
  if (draft.schoolingType === "private-school" || draft.schoolingType === "public-school") return base;
  if (draft.stance === "have-one") return base + 4;
  if (draft.stance === "our-own") return base + 2;
  if (draft.stance === "not-sure") return base + 3;
  return base + 1;
}

/** Setup is finished when there is nothing left to ask. Never a percentage. */
export function isSetupComplete(draft: ChildDraft, skipped: Set<SetupStepId> = new Set()): boolean {
  return nextSetupStep(draft, skipped) === "done";
}

/**
 * A starting list, offered and never imposed. Common enough that most
 * parents will tap rather than type, and every one of them is removable.
 */
export const SUGGESTED_SUBJECTS = [
  "Math",
  "Reading",
  "Writing",
  "Science",
  "History",
  "Geography",
  "Art",
  "Music",
  "Languages",
  "Physical education",
];
