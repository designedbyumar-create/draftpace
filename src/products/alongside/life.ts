/**
 * What Alongside remembers.
 *
 * Four shapes in one discriminated model, because derived attention has
 * to reason across all of them in a single pass and four shapes with one
 * attention function beats four tables with four special cases.
 *
 * THE BOUNDARY, IN THE TYPE
 *
 * Look at what an item does not have: no amount, no account, no
 * provider, no policy number, no reference number, no address. This
 * product owns the user's relationship with something they are trying to
 * do, never the thing itself. Personal Finance Companion owns the
 * electricity bill; this owns the fact that somebody has been meaning to
 * ring them about it.
 *
 * A contributor adding a subject-specific field here has to delete this
 * paragraph first, and als.test.ts asserts the field set.
 *
 * Pure. No database, no React, no clock of its own.
 */

/**
 * The four shapes.
 *
 * "Thread" rather than "project" on purpose: a project sounds like
 * something with a plan, and most of what belongs here is a thing that
 * has happened twice and will need to happen again.
 */
export type ItemKind = "commitment" | "waiting" | "thread" | "reference";

export const KIND_LABEL: Record<ItemKind, string> = {
  commitment: "Something to do",
  waiting: "Waiting on someone",
  thread: "Something ongoing",
  reference: "Worth remembering",
};

/**
 * How each shape is described when the product asks about it. Written
 * from the user's side, never as a category name.
 */
export const KIND_PROMPT: Record<ItemKind, string> = {
  commitment: "Something you mean to do",
  waiting: "Something somebody else has to come back to you on",
  thread: "Something ongoing that will take more than one go",
  reference: "Something you want to be able to find later",
};

export type ItemStatus = "open" | "done" | "archived";

export interface LifeItem {
  id: string;
  kind: ItemKind;
  /** What the person called it, in their words. */
  title: string;
  /** Anything else worth having. Never structured, never parsed. */
  note: string | null;
  status: ItemStatus;

  /**
   * When this next wants a look. For a commitment it is when the thing
   * is due; for a waiting item it is when to check again; for a thread
   * it is when the user asked to be reminded, if they did.
   */
  nextAt: string | null;
  /** Set only when the user chose the date themselves, which changes what the product says. */
  userChosenDate: boolean;
  /** Months between look-ins for something that comes round. Null means it does not. */
  everyMonths: number | null;

  /** Waiting items only. A name, in their words. Never a contact record. */
  waitingOn: string | null;

  /** Threads only: the externalised context that makes resuming possible. */
  lastTouchedAt: string | null;
  leftOffNote: string | null;
  nextStep: string | null;

  createdAt: string;
}

export function openItems(items: LifeItem[]): LifeItem[] {
  return items.filter((i) => i.status === "open");
}

export function byKind(items: LifeItem[], kind: ItemKind): LifeItem[] {
  return openItems(items).filter((i) => i.kind === kind);
}

/**
 * Whether this item is something the person could act on right now.
 *
 * A waiting item never is, and that is the point of the shape. Somebody
 * else has the ball, and putting it in a list of things to do turns a
 * fact about the world into a personal failure to act.
 */
export function isActionable(item: LifeItem): boolean {
  return item.status === "open" && item.kind !== "waiting";
}

/**
 * How long since a thread was last touched, in whole days, or null.
 *
 * Arithmetic on a stored date and nothing more. The product never infers
 * that somebody has been avoiding something, only that a date is a
 * certain distance away.
 */
export function daysSince(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / 86_400_000);
}

export function daysUntil(iso: string | null, now: Date): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.ceil((then - now.getTime()) / 86_400_000);
}

/**
 * How a stretch of time reads to a person.
 *
 * Vague on purpose past a fortnight. "Coming up in 23 days" is a number
 * nobody does anything with; "in about three weeks" is the same fact in
 * a form a person can hold.
 */
export function describeDaysUntil(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days} days`;
  if (days < 14) return "in about a week";
  if (days < 28) return `in about ${Math.round(days / 7)} weeks`;
  if (days < 60) return "in about a month";
  return `in about ${Math.round(days / 30)} months`;
}

export function describeDaysSince(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `about ${Math.round(days / 7)} weeks ago`;
  return `about ${Math.round(days / 30)} months ago`;
}

/**
 * What a thread remembers about where it got to, as one block.
 *
 * This is the externalised context: the thing a person would otherwise
 * have to reconstruct from memory before they could start again. Every
 * line is a stored fact.
 */
export interface ResumeContext {
  lastTouched: string | null;
  leftOff: string | null;
  nextStep: string | null;
}

export function resumeContext(item: LifeItem, now: Date): ResumeContext {
  const days = daysSince(item.lastTouchedAt, now);
  return {
    lastTouched: days === null ? null : describeDaysSince(days),
    leftOff: item.leftOffNote,
    nextStep: item.nextStep,
  };
}
