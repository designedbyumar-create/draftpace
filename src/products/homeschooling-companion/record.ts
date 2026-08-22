import type { Child, Visibility } from "./learning";
import type { TaskEvent } from "./today";

/**
 * What has happened, and what a parent could show somebody.
 *
 * Pure. The one place the product looks backwards, and the reason a
 * parent who never opens Today still has something worth paying for:
 * three years from now, "what did we actually do" has an answer.
 *
 * WHAT THIS IS NOT
 *
 * Not a report card, not a transcript, and not an assessment. It counts
 * sessions and names subjects because that is what a record is. It never
 * counts them against a target, never compares two children, and never
 * says how a child is doing. The difference between a record and a
 * verdict is that a record only says what happened.
 */

export interface Observation {
  id: string;
  childId: string;
  onDate: string;
  note: string;
  visibility: Visibility;
}

export interface WorkEntry extends TaskEvent {
  positionLabel: string | null;
}

export type RecordEntry =
  | { kind: "work"; date: string; childId: string; work: WorkEntry }
  | { kind: "observation"; date: string; childId: string; observation: Observation };

export interface RecordDay {
  date: string;
  entries: RecordEntry[];
}

export interface RecordInputs {
  children: Child[];
  events: WorkEntry[];
  observations: Observation[];
  /** Null means the whole household. */
  childId: string | null;
}

export interface RecordView {
  days: RecordDay[];
  /** Plain counts of what happened. Never measured against a target. */
  sessions: number;
  observations: number;
  subjects: string[];
  firstDate: string | null;
  lastDate: string | null;
}

/**
 * Everything recorded, newest day first, work before observations within
 * a day.
 *
 * Work first because it is the spine of the day and an observation is
 * usually about it. Within work, alphabetical by subject, so a week of
 * days reads down the page in the same order rather than in whatever
 * order the taps happened to land.
 */
export function deriveRecord(inputs: RecordInputs): RecordView {
  const inScope = <T extends { childId: string }>(rows: T[]) =>
    inputs.childId === null ? rows : rows.filter((row) => row.childId === inputs.childId);

  const events = inScope(inputs.events);
  const observations = inScope(inputs.observations);

  const entries: RecordEntry[] = [
    ...events.map((work) => ({ kind: "work" as const, date: work.onDate, childId: work.childId, work })),
    ...observations.map((observation) => ({
      kind: "observation" as const,
      date: observation.onDate,
      childId: observation.childId,
      observation,
    })),
  ];

  const byDate = new Map<string, RecordEntry[]>();
  for (const entry of entries) {
    byDate.set(entry.date, [...(byDate.get(entry.date) ?? []), entry]);
  }

  const days: RecordDay[] = [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, dayEntries]) => ({
      date,
      entries: dayEntries.sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "work" ? -1 : 1;
        if (a.kind === "work" && b.kind === "work") return a.work.subject.localeCompare(b.work.subject);
        return 0;
      }),
    }));

  const dates = entries.map((e) => e.date).sort();
  const subjects = [...new Set(events.map((e) => e.subject))].sort();

  return {
    days,
    sessions: events.length,
    observations: observations.length,
    subjects,
    firstDate: dates[0] ?? null,
    lastDate: dates.length > 0 ? dates[dates.length - 1] : null,
  };
}

/**
 * One line describing the record, for the top of the page.
 *
 * States what is in it and nothing about how it is going. "42 sessions
 * across 6 subjects" is a fact about the record. "42 sessions, on track"
 * would be a judgement the product has no standing to make.
 */
export function describeRecord(view: RecordView): string {
  if (view.sessions === 0 && view.observations === 0) return "Nothing recorded yet.";

  const parts: string[] = [];
  parts.push(view.sessions === 1 ? "1 session" : `${view.sessions} sessions`);
  if (view.subjects.length > 0) {
    parts.push(view.subjects.length === 1 ? "in 1 subject" : `across ${view.subjects.length} subjects`);
  }
  if (view.observations > 0) {
    parts.push(view.observations === 1 ? "and 1 observation" : `and ${view.observations} observations`);
  }
  return `${parts.join(" ")}.`;
}

/**
 * How a recorded session reads. The parent's own words for where they
 * were, and how it went only when they said.
 */
export function describeWork(work: WorkEntry): string {
  const parts = [work.subject];
  if (work.positionLabel) parts.push(work.positionLabel);
  return parts.join(", ");
}

const DIFFICULTY_LABEL: Record<NonNullable<TaskEvent["difficulty"]>, string> = {
  easy: "Easy",
  "about-right": "About right",
  difficult: "Difficult",
};

const HELP_LABEL: Record<NonNullable<TaskEvent["helpNeeded"]>, string> = {
  none: "No help needed",
  "a-little": "A little help",
  "a-lot": "A lot of help",
};

/** The optional detail, when there is any. Absent is a normal state. */
export function describeHowItWent(work: WorkEntry): string | null {
  const parts: string[] = [];
  if (work.state === "not-completed") parts.push("Not finished");
  if (work.difficulty) parts.push(DIFFICULTY_LABEL[work.difficulty]);
  if (work.helpNeeded) parts.push(HELP_LABEL[work.helpNeeded]);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** What a printed record would contain, if it were made right now. */
export function shareableEntries(view: RecordView): RecordEntry[] {
  return view.days
    .flatMap((day) => day.entries)
    .filter((entry) => entry.kind !== "observation" || entry.observation.visibility === "shareable");
}
