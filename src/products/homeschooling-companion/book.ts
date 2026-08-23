import { shareableChildFields, type Child, type Curriculum, type PlanEntry, type Position } from "./learning";
import { describeHowItWent, describeWork, type Observation, type WorkEntry } from "./record";
import { TOPIC_BY_KEY } from "./taxonomy";
import { STANDING_LABEL, type Standing } from "./check";
import { positionFor } from "./learning";

/**
 * My Homeschool Record: what a parent could hand to somebody.
 *
 * Pure. Decides what may appear and nothing about how it looks, so the
 * rule about what is private lives in one place and the document cannot
 * quietly disagree with the app.
 *
 * PER CHILD, ALWAYS
 *
 * Never a household. A record is asked for about one child, by a person
 * who wants to know what that child has been doing, and two children in
 * one document would mean handing over one child's information to
 * account for the other.
 *
 * THREE RULES ABOUT WHAT REACHES PAPER
 *
 * 1. The child's own fields obey their own visibility. The name is
 *    shareable by default because a record with no name on it is not
 *    much of a record; everything else is opted in one at a time.
 * 2. An observation reaches paper only if the parent marked that
 *    observation shareable. A section level choice can leave them all
 *    out; it can never put a private one in.
 * 3. Nothing is invented. A section with nothing in it says so, and a
 *    gap is printed as a gap.
 */

export interface BookSections {
  /** The dated log of what was done. */
  history: boolean;
  /** Only ever the ones already marked shareable. */
  observations: boolean;
  /** Off by default: check results are the most sensitive rows in the product. */
  checks: boolean;
}

export const DEFAULT_BOOK_SECTIONS: BookSections = {
  history: true,
  observations: true,
  checks: false,
};

export interface BookCheck {
  createdAt: string;
  topicKey: string;
  standing: Standing;
  answered: number;
  right: number;
}

export interface BookInputs {
  child: Child;
  curricula: Curriculum[];
  positions: Position[];
  plan: PlanEntry[];
  events: WorkEntry[];
  observations: Observation[];
  checks: BookCheck[];
  topicKeys: string[];
  sections: BookSections;
  generatedAt: Date;
}

export interface BookSubject {
  subject: string;
  source: "publisher" | "parent" | "draftpace";
  curriculumTitle: string | null;
  position: string | null;
  topics: string[];
}

export interface BookDay {
  date: string;
  entries: { title: string; detail: string | null }[];
}

export interface Book {
  name: string | null;
  age: number | null;
  schoolingType: string | null;
  subjects: BookSubject[];
  days: BookDay[];
  observations: { date: string; note: string }[];
  checks: { date: string; label: string; standing: string; answered: number }[];
  sessions: number;
  firstDate: string | null;
  lastDate: string | null;
  generatedAt: Date;
  /** True when there is genuinely nothing to print but the covers. */
  empty: boolean;
}

/**
 * How a source reads to somebody who has never used this product.
 *
 * The app says "Draftpace suggestion", which is exactly right for a
 * parent who chose it and knows what Draftpace is. On a record handed to
 * a grandparent or an inspector it means nothing at all. Same lesson the
 * Personal Life Affairs Companion learned about its own book: the
 * on-screen label is for the owner, the printed label is for a stranger,
 * and one string cannot serve both.
 */
export const SOURCE_ON_PAPER: Record<"publisher" | "parent" | "draftpace", string> = {
  publisher: "From a published curriculum",
  parent: "Planned by their parent",
  draftpace: "From a suggested starting outline",
};

const SCHOOLING_ON_PAPER: Record<string, string> = {
  homeschool: "Home schooled",
  hybrid: "A mix of home and school",
  "private-school": "Private school",
  "public-school": "Public school",
};

export function buildBook(inputs: BookInputs): Book {
  const fields = shareableChildFields(inputs.child);

  const subjects: BookSubject[] = inputs.plan
    .filter((entry) => entry.active)
    .map((entry) => {
      const curriculum = inputs.curricula.find((c) => c.subject === entry.subject) ?? null;
      const position = curriculum ? positionFor(inputs.positions, inputs.child.id, curriculum.id) : null;
      return {
        subject: entry.subject,
        source: curriculum?.source ?? (entry.origin === "draftpace-outline" ? "draftpace" : "parent"),
        curriculumTitle: curriculum?.title ?? null,
        position: position?.label ?? null,
        topics: inputs.topicKeys
          .map((key) => TOPIC_BY_KEY[key])
          .filter((topic) => topic && topic.subject === entry.subject)
          .map((topic) => topic.label),
      };
    });

  const byDate = new Map<string, { title: string; detail: string | null }[]>();
  if (inputs.sections.history) {
    for (const work of inputs.events) {
      byDate.set(work.onDate, [
        ...(byDate.get(work.onDate) ?? []),
        { title: describeWork(work), detail: describeHowItWent(work) },
      ]);
    }
  }

  const days: BookDay[] = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, entries]) => ({
      date,
      entries: entries.sort((a, b) => a.title.localeCompare(b.title)),
    }));

  // Rule 2: the section choice can leave them all out. It can never put
  // a private one in.
  const observations = inputs.sections.observations
    ? inputs.observations
        .filter((o) => o.visibility === "shareable")
        .sort((a, b) => (a.onDate < b.onDate ? 1 : -1))
        .map((o) => ({ date: o.onDate, note: o.note }))
    : [];

  const checks = inputs.sections.checks
    ? [...inputs.checks]
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .map((c) => ({
          date: c.createdAt.slice(0, 10),
          label: TOPIC_BY_KEY[c.topicKey]?.label ?? c.topicKey,
          standing: STANDING_LABEL[c.standing],
          answered: c.answered,
        }))
    : [];

  const dates = inputs.events.map((e) => e.onDate).sort();

  return {
    name: fields.name,
    age: fields.age,
    schoolingType: inputs.child.schoolingType ? SCHOOLING_ON_PAPER[inputs.child.schoolingType] ?? null : null,
    subjects,
    days,
    observations,
    checks,
    sessions: inputs.events.length,
    firstDate: dates[0] ?? null,
    lastDate: dates.length > 0 ? dates[dates.length - 1] : null,
    generatedAt: inputs.generatedAt,
    empty: subjects.length === 0 && days.length === 0 && observations.length === 0 && checks.length === 0,
  };
}

/**
 * What the cover says this copy contains.
 *
 * States what is in it and never how it is going. A record that grades
 * is not a record, and this is the sentence most likely to drift into
 * one, so it is written once here and used nowhere else.
 */
export function describeBook(book: Book): string {
  if (book.empty) return "Nothing has been recorded yet.";
  const parts: string[] = [];
  if (book.sessions > 0) parts.push(book.sessions === 1 ? "1 session" : `${book.sessions} sessions`);
  if (book.subjects.length > 0) {
    parts.push(book.subjects.length === 1 ? "in 1 subject" : `across ${book.subjects.length} subjects`);
  }
  if (book.observations.length > 0) {
    parts.push(book.observations.length === 1 ? "and 1 note" : `and ${book.observations.length} notes`);
  }
  return parts.length > 0 ? `${parts.join(" ")}.` : "Nothing has been recorded yet.";
}

/** The period the record covers, in words, or null when nothing is dated. */
export function describePeriod(book: Book): string | null {
  if (!book.firstDate || !book.lastDate) return null;
  const format = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  if (book.firstDate === book.lastDate) return format(book.firstDate);
  return `${format(book.firstDate)} to ${format(book.lastDate)}`;
}

/** The one line that must appear on the record, wherever it is shown. */
export const BOOK_DISCLAIMER =
  "This is a record of what was done, kept by a parent. It is not an assessment, not a transcript, and it makes no claim about how any of it went.";
