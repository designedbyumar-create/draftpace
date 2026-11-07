/**
 * The demo household for the screen captures. Same household as
 * record-pdf.mjs, and only what the real screens show (Ava, age 9,
 * Homeschool, Math Journey, Math + Reading; "Lesson 4: Halves and
 * quarters"). The two topics ticked as "current" are NOT on any screen:
 * they are the fixture the check capture needs, chosen to sit next to the
 * fractions lessons the log mentions.
 */
import type { Child, Curriculum, PlanEntry, Position } from "@/products/homeschooling-companion/learning";
import type { CheckItem } from "@/products/homeschooling-companion/check";

export const CHILD: Child = {
  id: "ava", name: "Ava", age: 9, schoolingType: "homeschool", notes: null,
  // learning.ts DEFAULT_VISIBILITY: the name is on paper, everything else starts off.
  nameVisibility: "shareable", ageVisibility: "private", notesVisibility: "private",
  status: "active", createdAt: "2026-09-01T00:00:00Z",
};
export const CURRICULA: Curriculum[] = [
  { id: "c-math", childId: "ava", source: "parent", title: "Math Journey", publisher: null, subject: "Math", visibility: "private", status: "active" },
];
export const POSITIONS: Position[] = [
  { id: "p-math", childId: "ava", curriculumId: "c-math", nodeId: null, label: "Lesson 4: Halves and quarters", movedAt: "" },
];
export const PLAN: PlanEntry[] = [
  { id: "pl-math", childId: "ava", subject: "Math", daysPerWeek: 4, active: true, minutesPerSession: null, origin: "parent" },
  { id: "pl-reading", childId: "ava", subject: "Reading", daysPerWeek: 4, active: true, minutesPerSession: null, origin: "parent" },
];
export const TOPICS = [
  { id: "t1", childId: "ava", subject: "Math", topicKey: "math.fractions-basic", state: "current" as const },
  { id: "t2", childId: "ava", subject: "Math", topicKey: "math.fractions-equivalent", state: "current" as const },
];

/** The parent's own question bank: four on the first topic, two on the second (CONFIDENCE_FLOOR is 4). */
export const ITEMS: CheckItem[] = [
  ...[1, 2, 3, 4].map((n): CheckItem => ({ id: `q-basic-${n}`, topicKey: "math.fractions-basic", source: "parent", prompt: `Fraction question ${n}`, expectedAnswer: null })),
  ...[1, 2].map((n): CheckItem => ({ id: `q-equiv-${n}`, topicKey: "math.fractions-equivalent", source: "parent", prompt: `Equivalent fraction question ${n}`, expectedAnswer: null })),
];

/** What the parent marks, by topic, in order. The standings are never typed: check.ts derives them from these. */
export const MARKS: Record<string, ("right" | "not-right" | "skipped")[]> = {
  "math.fractions-basic": ["right", "right", "right", "right"],
  "math.fractions-equivalent": ["right", "right"],
};
