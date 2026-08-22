import {
  curriculaFor,
  describePosition,
  positionFor,
  type Child,
  type Curriculum,
  type CurriculumSource,
  type PlanEntry,
  type Position,
} from "./learning";

/**
 * What are we doing today.
 *
 * Derived on read, never stored. A day's tasks are a function of the
 * plan, where each child is, what has already been recorded, and the
 * date. Materialising them would create a second source of truth that
 * goes stale the moment a parent edits the plan, and would need a job to
 * keep it honest.
 *
 * Pure. No database, no clock of its own: `now` is always passed in.
 *
 * THREE RULES, AND THE THIRD IS THE ONE THAT MATTERS
 *
 * 1. A subject scheduled today produces one task, carrying its source.
 * 2. A session that went badly produces a review next time, not more of
 *    the same. The product never advances anybody: position belongs to
 *    the parent.
 * 3. Nothing scheduled produces nothing. Today has to be able to say
 *    "nothing today" and mean it, because a product that always has
 *    something on it is a product whose something nobody believes.
 *    Weekends are not failures and neither is a Tuesday off.
 */

export type TaskKind = "work" | "review";

export interface TodayTask {
  childId: string;
  subject: string;
  /** Where this came from. Shown every time, never inferred by the reader. */
  source: CurriculumSource;
  /** The curriculum's own name, when there is one. */
  curriculumTitle: string | null;
  curriculumId: string | null;
  /** Where the child is, in the parent's words. Snapshotted when recorded. */
  positionLabel: string | null;
  kind: TaskKind;
  /** Present only on a review, and always states the fact behind it. */
  reason: string | null;
}

export interface TaskEvent {
  childId: string;
  subject: string;
  onDate: string;
  state: "done" | "not-completed";
  difficulty: "easy" | "about-right" | "difficult" | null;
  helpNeeded: "none" | "a-little" | "a-lot" | null;
}

export interface TodayInputs {
  children: Child[];
  plan: PlanEntry[];
  curricula: Curriculum[];
  positions: Position[];
  events: TaskEvent[];
}

export interface ChildDay {
  child: Child;
  tasks: TodayTask[];
  /** Recorded already today. Shown quietly, so a parent can see the day is done. */
  recorded: TaskEvent[];
  /** True when this child has nothing scheduled today, which is a normal day. */
  restDay: boolean;
}

export interface TodayView {
  days: ChildDay[];
  /** True when no child has anything outstanding. A finished day, or a day off. */
  nothingOutstanding: boolean;
  /** True when no child has a plan at all yet. Different from a day off. */
  nothingPlanned: boolean;
}

/**
 * Which weekdays a subject runs on, given how many days a week it does.
 *
 * A hand-authored table rather than arithmetic, because the answer has
 * to be one a parent would recognise. Three days a week is Monday,
 * Wednesday, Friday to almost everybody who has ever taught anything,
 * and "every 2.33 days" is not a schedule.
 *
 * 0 is Sunday, matching Date.getDay().
 */
const WEEKDAYS_BY_FREQUENCY: Record<number, number[]> = {
  0: [],
  1: [3],
  2: [2, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export function runsToday(daysPerWeek: number, now: Date): boolean {
  const days = WEEKDAYS_BY_FREQUENCY[daysPerWeek] ?? WEEKDAYS_BY_FREQUENCY[5];
  return days.includes(now.getDay());
}

/** The family's own date, not an instant. See the migration's note. */
export function dateKey(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The most recent thing recorded for this subject before today.
 *
 * Before, not including: a subject recorded this morning has been dealt
 * with and must not also be judged for what it does to tomorrow.
 */
function lastEventBefore(events: TaskEvent[], childId: string, subject: string, today: string): TaskEvent | null {
  const prior = events
    .filter((e) => e.childId === childId && e.subject === subject && e.onDate < today)
    .sort((a, b) => (a.onDate < b.onDate ? 1 : -1));
  return prior[0] ?? null;
}

/**
 * Whether today's session should be a review, and why.
 *
 * The reason is returned with it and always states the fact behind it,
 * so the product never asserts something a parent cannot check. It says
 * what was recorded, not what it concluded about a child.
 */
function reviewReason(previous: TaskEvent | null): string | null {
  if (!previous) return null;
  if (previous.state === "not-completed") return "Last time this was not finished.";
  if (previous.difficulty === "difficult") return "Last time you said this was difficult.";
  return null;
}

export function deriveToday(inputs: TodayInputs, now: Date): TodayView {
  const today = dateKey(now);

  const days: ChildDay[] = inputs.children.map((child) => {
    const subjects = inputs.plan.filter((entry) => entry.childId === child.id && entry.active);
    const scheduled = subjects.filter((entry) => runsToday(entry.daysPerWeek, now));
    const recorded = inputs.events.filter((e) => e.childId === child.id && e.onDate === today);
    const childCurricula = curriculaFor(inputs.curricula, child.id);

    const tasks: TodayTask[] = scheduled
      // Already recorded today is not a task. It is shown as what it is.
      .filter((entry) => !recorded.some((e) => e.subject === entry.subject))
      .map((entry) => {
        const curriculum = childCurricula.find((c) => c.subject === entry.subject) ?? null;
        const position = curriculum ? positionFor(inputs.positions, child.id, curriculum.id) : null;
        const previous = lastEventBefore(inputs.events, child.id, entry.subject, today);
        const reason = reviewReason(previous);

        return {
          childId: child.id,
          subject: entry.subject,
          source: curriculum?.source ?? "parent",
          curriculumTitle: curriculum?.title ?? null,
          curriculumId: curriculum?.id ?? null,
          positionLabel: describePosition(position),
          kind: reason ? "review" : "work",
          reason,
        };
      });

    return {
      child,
      tasks,
      recorded,
      // A day with a plan but nothing scheduled. Normal, and named, so
      // the screen can say so instead of looking broken.
      restDay: subjects.length > 0 && scheduled.length === 0,
    };
  });

  return {
    days,
    nothingOutstanding: days.every((day) => day.tasks.length === 0),
    nothingPlanned: inputs.plan.filter((entry) => entry.active).length === 0,
  };
}

/**
 * What a task says on screen, as one line.
 *
 * A curriculum's own name and the parent's own position, joined. Never a
 * lesson number this product worked out for itself, because it does not
 * know the sequence and inventing one would be the first lie the product
 * told.
 */
export function describeTask(task: TodayTask): string {
  const parts = [task.curriculumTitle, task.positionLabel].filter(Boolean);
  if (parts.length === 0) return task.subject;
  return parts.join(", ");
}
