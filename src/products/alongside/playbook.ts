import type { ItemKind } from "./life";

/**
 * Companion Mode: the engine.
 *
 * Authored, branching, interactive procedures. The same mechanism
 * Personal Life Affairs Companion proved twice, extended in one
 * direction: a choice can route to a different step.
 *
 * NOT A CHATBOT, AND THE DISTINCTION IS ARCHITECTURAL RATHER THAN
 * STYLISTIC. Every question and every suggested sentence in this product
 * was written by a person and lives in a reviewable file. There is no
 * model provider anywhere in this repository. What makes it read as
 * accompaniment is that it asks one thing, waits, and decides what to
 * ask next, which is sequencing and not intelligence.
 *
 * That matters more here than in any sibling product, because these
 * procedures end in a real phone call to a real organisation. We need to
 * know exactly what the product told somebody.
 *
 * WHAT THE ENGINE MAY NEVER DO
 *
 * Suggested wording is editable and never leaves the device. It covers
 * openings and structure, never what to claim, threaten, negotiate or
 * accept. A playbook helps a person execute what they already decided;
 * it does not decide for them.
 */

export type StepKind =
  /** Narrows the situation, so later steps show only what is relevant. */
  | "choose"
  /** One thing in the person's own words. */
  | "write"
  /** A checklist computed from what they already answered. */
  | "prepare"
  /** Authored suggested language. Always editable. */
  | "wording"
  /** Short prompts for while the thing is happening. Capped, deliberately. */
  | "during"
  /** Terminal. Branches back into Life. */
  | "outcome";

export interface PlaybookChoice {
  value: string;
  label: string;
  /** Where to go next. Absent means the following step in order. */
  goTo?: string;
}

export interface PlaybookStep {
  key: string;
  kind: StepKind;
  prompt: string;
  /** Why it is being asked. Never phrased in terms of the user's difficulties. */
  why?: string;
  hint?: string;
  placeholder?: string;
  choices?: PlaybookChoice[];
  /** For prepare and during: the lines shown, filtered by askIf. */
  items?: { text: string; askIf?: StepCondition }[];
  suggestedWording?: { text: string; askIf?: StepCondition }[];
  askIf?: StepCondition;
  optional?: boolean;
}

/** Gating on an earlier answer. Absent `equals` means any non-empty answer. */
export interface StepCondition {
  step: string;
  equals?: string[];
}

/**
 * What a run can end as, and what each does to Life.
 *
 * "Did not get to it" writing nothing is deliberate and tested.
 * Recording an abandonment as an event turns the log into a record of
 * failures, and this is the audience for whom that is most corrosive.
 */
export type OutcomeKind =
  | "resolved"
  | "progress"
  | "waiting"
  | "next-step"
  | "not-yet"
  | "other";

export interface OutcomeOption {
  value: OutcomeKind;
  label: string;
  /** What the person is asked for, if anything, before it is recorded. */
  asks?: "waiting-on" | "next-step" | "note";
}

export const OUTCOME_OPTIONS: OutcomeOption[] = [
  { value: "resolved", label: "It is sorted" },
  { value: "progress", label: "Made progress", asks: "note" },
  { value: "waiting", label: "Waiting on someone now", asks: "waiting-on" },
  { value: "next-step", label: "There is something I need to do", asks: "next-step" },
  { value: "not-yet", label: "Did not get to it" },
  { value: "other", label: "Something else", asks: "note" },
];

export interface Playbook {
  key: string;
  title: string;
  /** How it is offered in the Help list, from the person's side. */
  situation: string;
  /** Which Life shapes can open this one directly. */
  opensFor: ItemKind[];
  steps: PlaybookStep[];
}

export type Answers = Record<string, string>;

function answered(answers: Answers, step: string): boolean {
  return (answers[step] ?? "").trim().length > 0;
}

export function conditionMet(condition: StepCondition | undefined, answers: Answers): boolean {
  if (!condition) return true;
  const value = (answers[condition.step] ?? "").trim();
  if (value.length === 0) return false;
  if (!condition.equals) return true;
  return condition.equals.includes(value);
}

export function applicableSteps(playbook: Playbook, answers: Answers): PlaybookStep[] {
  return playbook.steps.filter((step) => conditionMet(step.askIf, answers));
}

/**
 * The one step to show now, or null when the run is finished.
 *
 * Steps the person deliberately skipped do not come back around, which
 * is what stops the Companion looping on the one question they passed
 * over.
 */
export function nextStep(
  playbook: Playbook,
  answers: Answers,
  skipped: Set<string> = new Set()
): PlaybookStep | null {
  for (const step of playbook.steps) {
    if (!conditionMet(step.askIf, answers)) continue;
    if (answered(answers, step.key)) continue;
    if (skipped.has(step.key)) continue;
    return step;
  }
  return null;
}

/** Lines that apply, given what has been answered. Used by prepare and during. */
export function visibleItems(step: PlaybookStep, answers: Answers): string[] {
  return (step.items ?? []).filter((item) => conditionMet(item.askIf, answers)).map((item) => item.text);
}

export function visibleWording(step: PlaybookStep, answers: Answers): string[] {
  return (step.suggestedWording ?? [])
    .filter((option) => conditionMet(option.askIf, answers))
    .map((option) => option.text);
}

/** Progress inside one run only, never across the product. */
export function runProgress(
  playbook: Playbook,
  answers: Answers,
  skipped: Set<string> = new Set()
): { asked: number; total: number } {
  const applicable = applicableSteps(playbook, answers);
  const asked = applicable.filter((s) => answered(answers, s.key) || skipped.has(s.key)).length;
  return { asked, total: applicable.length };
}
