/**
 * What this product knows about a family's schooling.
 *
 * Pure. No database, no React, no clock of its own: `now` is always
 * passed in, so every behaviour here is testable without mocking one.
 *
 * THE TIER THAT SHAPES EVERYTHING
 *
 * A parent, then children, then everything else. Every record in this
 * product belongs to exactly one child, and nothing is ever household
 * wide except the question "what are we doing today". Two children never
 * share a row, and the printed record is per child, because that is the
 * unit anybody would ever ask for.
 *
 * WHAT THIS PRODUCT WILL NOT HOLD
 *
 * No score, no percentage, no comparison to a standard, and no date of
 * birth. Age is what shapes a suggestion; a birthday does nothing, and
 * storing one would be keeping a high value identity field about a
 * child for no product gain.
 */

/**
 * Whether a piece of information may appear in the parent's own printed
 * record.
 *
 * "Shareable" never means public. There is no sharing mechanism in this
 * product: the only thing a parent can do with a record is print it, and
 * this decides what is on the page when they do.
 */
export type Visibility = "private" | "shareable";

/**
 * The defaults, established in the schema by column DEFAULT and mirrored
 * here so the two can be checked against each other.
 *
 * A child's name is shareable because a record with no name on it is not
 * much of a record. Everything else starts private and the parent opts
 * it in, which is the right way round for information about a child.
 */
export const DEFAULT_VISIBILITY = {
  childName: "shareable",
  childAge: "private",
  childNotes: "private",
  curriculum: "private",
  learningHistory: "private",
  observation: "private",
  checkResult: "private",
} as const satisfies Record<string, Visibility>;

export type SchoolingType = "homeschool" | "hybrid" | "private-school" | "public-school";

export const SCHOOLING_LABEL: Record<SchoolingType, string> = {
  homeschool: "Homeschool",
  hybrid: "A mix of home and school",
  "private-school": "Private school",
  "public-school": "Public school",
};

export interface Child {
  id: string;
  name: string;
  /** Nullable because setup asks only what it will use. */
  age: number | null;
  schoolingType: SchoolingType | null;
  notes: string | null;
  nameVisibility: Visibility;
  ageVisibility: Visibility;
  notesVisibility: Visibility;
  status: "active" | "archived";
  createdAt: string;
}

/**
 * Where a curriculum came from. The same tree serves all three, which is
 * what makes this product curriculum agnostic in fact and not only in
 * copy.
 */
export type CurriculumSource = "publisher" | "parent" | "draftpace";

/**
 * How a source is named on screen, every time it is shown.
 *
 * A parent must never have to wonder whether the product invented
 * something, so every task and every suggestion carries this. It is the
 * first of the four trust rules and the cheapest to keep.
 */
export const SOURCE_LABEL: Record<CurriculumSource, string> = {
  publisher: "Your curriculum",
  parent: "Your plan",
  draftpace: "Draftpace suggestion",
};

export interface Curriculum {
  id: string;
  childId: string;
  source: CurriculumSource;
  title: string;
  publisher: string | null;
  subject: string;
  visibility: Visibility;
  status: "active" | "archived";
}

export type NodeKind = "unit" | "topic" | "objective" | "lesson";

export interface CurriculumNode {
  id: string;
  curriculumId: string;
  parentId: string | null;
  kind: NodeKind;
  title: string;
  ordinal: number;
  /** Into the taxonomy that lives in code. Null until somebody says which topic this is. */
  topicKey: string | null;
}

export interface Position {
  id: string;
  childId: string;
  curriculumId: string;
  nodeId: string | null;
  /** "Lesson 12", typed, with no tree behind it. The common case. */
  label: string | null;
  movedAt: string;
}

export interface PlanEntry {
  id: string;
  childId: string;
  subject: string;
  daysPerWeek: number;
  active: boolean;
}

/** Everything this product knows about one child, assembled. */
export interface ChildRecord {
  child: Child;
  curricula: Curriculum[];
  positions: Position[];
  plan: PlanEntry[];
}

export function activeChildren(children: Child[]): Child[] {
  return children.filter((c) => c.status === "active");
}

export function curriculaFor(curricula: Curriculum[], childId: string): Curriculum[] {
  return curricula.filter((c) => c.childId === childId && c.status === "active");
}

export function positionFor(positions: Position[], childId: string, curriculumId: string): Position | null {
  return positions.find((p) => p.childId === childId && p.curriculumId === curriculumId) ?? null;
}

/**
 * Where a child is, in the words a person would use.
 *
 * Deliberately never a number out of a total. A curriculum's length is
 * not something this product knows, and pretending to know it would
 * produce the progress bar the product refuses to have.
 */
export function describePosition(position: Position | null): string | null {
  if (!position) return null;
  const label = position.label?.trim();
  return label && label.length > 0 ? label : null;
}

/**
 * Whether a child has enough recorded for the product to be useful.
 *
 * Deliberately generous, and deliberately not a percentage. A parent who
 * has entered one subject is set up, not 25% set up: treating mode B as
 * an incomplete version of mode C is exactly the condescension this
 * product exists without.
 */
export function isReadyForToday(record: ChildRecord): boolean {
  return record.plan.some((entry) => entry.active) || record.curricula.length > 0;
}

/**
 * What appears on the printed record for this child.
 *
 * The one function the Book calls, so that a visibility decision cannot
 * be honoured in one place and forgotten in another.
 */
export function shareableChildFields(child: Child): { name: string | null; age: number | null; notes: string | null } {
  return {
    name: child.nameVisibility === "shareable" ? child.name : null,
    age: child.ageVisibility === "shareable" ? child.age : null,
    notes: child.notesVisibility === "shareable" ? child.notes : null,
  };
}
