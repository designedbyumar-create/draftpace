import { topicsForSubject, type Topic } from "./taxonomy";

/**
 * A starting outline, for a parent who does not know where to begin.
 *
 * NOT A CURRICULUM, AND THE DISTINCTION IS THE WHOLE POINT.
 *
 * This produces a rough weekly shape and a few topics to start from,
 * every part of it editable before it is saved and after. It does not
 * say what a child should learn, does not claim to be complete, and
 * does not become a thing the parent is measured against. A parent who
 * knows what they are teaching should be able to ignore it entirely and
 * never see it again.
 *
 * Deliberately separate from taxonomy.ts, which is a vocabulary and
 * carries no ages at all. Ages live here because a suggestion may
 * reasonably say "children around this age often start here", and a
 * vocabulary may not. Keeping them in one file would make the taxonomy
 * an age-graded curriculum by accident, which is the thing it must
 * never be.
 *
 * Pure, deterministic, hand-authored. No model is involved.
 */

/**
 * Rough bands. Wide on purpose: the point is to get somebody started,
 * and narrower bands would imply a precision that does not exist and
 * that no two publishers agree on anyway.
 */
export interface AgeBand {
  key: string;
  minAge: number;
  maxAge: number;
  /** Where in a subject's own sequence to start looking. See topicWindow. */
  from: number;
  to: number;
}

const BANDS: AgeBand[] = [
  { key: "early", minAge: 0, maxAge: 7, from: 0, to: 5 },
  { key: "middle", minAge: 8, maxAge: 10, from: 3, to: 10 },
  { key: "upper", minAge: 11, maxAge: 13, from: 8, to: 15 },
  { key: "older", minAge: 14, maxAge: 99, from: 12, to: 30 },
];

export function bandForAge(age: number | null): AgeBand {
  if (age === null) return BANDS[1];
  return BANDS.find((band) => age >= band.minAge && age <= band.maxAge) ?? BANDS[1];
}

/**
 * The rough weekly shape a subject usually takes.
 *
 * Hand-authored, and openly approximate. A parent who wants forty
 * minutes of maths five days a week changes two numbers.
 */
interface SubjectShape {
  minutes: number;
  daysPerWeek: number;
  /** Ordinary ways of spending that time, not a method anybody must follow. */
  activities: string[];
}

const SHAPES: Record<string, Record<string, SubjectShape>> = {
  Math: {
    early: { minutes: 20, daysPerWeek: 4, activities: ["Practice questions", "Real world application", "Review session"] },
    middle: { minutes: 35, daysPerWeek: 4, activities: ["Practice questions", "Problem solving", "Review session"] },
    upper: { minutes: 45, daysPerWeek: 5, activities: ["Practice questions", "Problem solving", "Real world application"] },
    older: { minutes: 55, daysPerWeek: 5, activities: ["Practice questions", "Problem solving", "Review session"] },
  },
  Reading: {
    early: { minutes: 20, daysPerWeek: 5, activities: ["Reading aloud", "Reading and discussion", "Practice questions"] },
    middle: { minutes: 30, daysPerWeek: 5, activities: ["Reading and discussion", "Comprehension questions"] },
    upper: { minutes: 35, daysPerWeek: 5, activities: ["Reading and discussion", "Comprehension questions"] },
    older: { minutes: 40, daysPerWeek: 5, activities: ["Reading and discussion", "Written response"] },
  },
  Writing: {
    early: { minutes: 15, daysPerWeek: 3, activities: ["Writing exercise", "Copying and handwriting"] },
    middle: { minutes: 25, daysPerWeek: 3, activities: ["Journaling", "Short written response", "Creative writing"] },
    upper: { minutes: 35, daysPerWeek: 3, activities: ["Short written response", "Creative writing", "Editing"] },
    older: { minutes: 45, daysPerWeek: 3, activities: ["Longer written work", "Editing", "Written response"] },
  },
  Science: {
    early: { minutes: 25, daysPerWeek: 2, activities: ["Observation activity", "Simple experiment", "Reading and discussion"] },
    middle: { minutes: 35, daysPerWeek: 2, activities: ["Observation activity", "Simple experiment", "Reading and discussion"] },
    upper: { minutes: 45, daysPerWeek: 2, activities: ["Experiment and write up", "Reading and discussion"] },
    older: { minutes: 50, daysPerWeek: 3, activities: ["Experiment and write up", "Reading and discussion"] },
  },
  History: {
    early: { minutes: 20, daysPerWeek: 1, activities: ["Reading and discussion", "Real world application"] },
    middle: { minutes: 30, daysPerWeek: 2, activities: ["Reading and discussion", "Written response"] },
    upper: { minutes: 40, daysPerWeek: 2, activities: ["Reading and discussion", "Written response"] },
    older: { minutes: 45, daysPerWeek: 2, activities: ["Reading and discussion", "Longer written work"] },
  },
  Geography: {
    early: { minutes: 20, daysPerWeek: 1, activities: ["Observation activity", "Real world application"] },
    middle: { minutes: 30, daysPerWeek: 1, activities: ["Reading and discussion", "Map work"] },
    upper: { minutes: 35, daysPerWeek: 1, activities: ["Reading and discussion", "Map work"] },
    older: { minutes: 40, daysPerWeek: 1, activities: ["Reading and discussion", "Written response"] },
  },
};

/** Anything the shapes do not name still gets a sensible, editable slot. */
const DEFAULT_SHAPE: SubjectShape = {
  minutes: 30,
  daysPerWeek: 2,
  activities: ["Practice", "Reading and discussion", "Real world application"],
};

export interface OutlineSubject {
  subject: string;
  minutes: number;
  daysPerWeek: number;
  /** Topics to start from. Empty where the taxonomy has none, and that is said plainly. */
  focus: Topic[];
  activities: string[];
}

export interface StartingOutline {
  subjects: OutlineSubject[];
  band: AgeBand;
}

/**
 * Which topics to suggest starting from.
 *
 * A window into the subject's own sequence, not a claim about the
 * child. The taxonomy's ordinal already says roughly how a subject
 * builds on itself, so a band picks a slice of that and the parent
 * moves it. Where a subject has no topics at all, the outline still
 * gives it time in the week and says nothing about content.
 */
function topicWindow(subject: string, band: AgeBand, limit: number): Topic[] {
  const all = topicsForSubject(subject);
  if (all.length === 0) return [];
  const slice = all.filter((topic) => topic.ordinal >= band.from && topic.ordinal <= band.to);
  return (slice.length > 0 ? slice : all).slice(0, limit);
}

/**
 * The outline itself.
 *
 * Built from what the parent already told us during setup and nothing
 * else. No profile is inferred, nothing is looked up, and the same
 * inputs always produce the same outline.
 */
export function buildStartingOutline(input: {
  age: number | null;
  subjects: string[];
  /** How many days a week the family can actually school. Caps every subject. */
  daysAvailable: number;
}): StartingOutline {
  const band = bandForAge(input.age);
  const cap = Math.max(1, Math.min(7, input.daysAvailable));

  const subjects: OutlineSubject[] = input.subjects.map((subject) => {
    const shape = SHAPES[subject]?.[band.key] ?? DEFAULT_SHAPE;
    return {
      subject,
      minutes: shape.minutes,
      // Never more days than the family said they have.
      daysPerWeek: Math.min(shape.daysPerWeek, cap),
      focus: topicWindow(subject, band, 4),
      activities: shape.activities,
    };
  });

  return { subjects, band };
}

/** Roughly how long a day looks, so a parent can see if it is realistic. */
export function minutesPerWeek(outline: StartingOutline): number {
  return outline.subjects.reduce((total, s) => total + s.minutes * s.daysPerWeek, 0);
}

export function describeSubjectShape(subject: OutlineSubject): string {
  const days = subject.daysPerWeek === 1 ? "1 day a week" : `${subject.daysPerWeek} days a week`;
  return `About ${subject.minutes} minutes, ${days}`;
}

/**
 * The line that must appear wherever an outline is shown.
 *
 * Exported rather than written into a component so it cannot quietly
 * become five different sentences, one of which overclaims.
 */
export const OUTLINE_DISCLAIMER =
  "This is a starting point, not a required curriculum. Change anything, remove anything, and add whatever you want.";
