/**
 * Companion Mode: the shared engine.
 *
 * Extracted from Alongside, which proved this shape first and is still
 * the reference implementation to check any change against. Authored,
 * branching, interactive procedures: a person enters a situation, the
 * engine asks one question at a time, and decides what to ask next from
 * what has already been answered. That is sequencing, not intelligence,
 * and it is the whole reason this can be a reviewable file rather than a
 * model call.
 *
 * NOT A CHATBOT, ARCHITECTURALLY, NOT ONLY STYLISTICALLY
 *
 * Every question and every suggested sentence a product built on this
 * engine shows was written by a person and lives in a reviewable
 * playbook file. There is no model provider anywhere in this codebase,
 * and this engine is not where that would change: it has no concept of
 * generating a question, only of choosing the next one from a fixed
 * list.
 *
 * WHAT THE ENGINE MAY NEVER DO
 *
 * Suggested wording is editable and never leaves the device (enforced
 * by the runtime that renders these steps, not here, but the step shape
 * itself keeps wording as a separate kind from the questions asked of
 * the person, specifically so a UI cannot accidentally save it as an
 * answer). It covers openings and structure, never what to claim,
 * threaten, negotiate or accept. A playbook helps a person execute what
 * they already decided; it does not decide for them.
 *
 * WHAT IS DELIBERATELY NOT HERE
 *
 * Any concept of "item", "trip", "child" or any other product's domain
 * noun. A playbook can carry an `opensFor` list of context strings
 * (typed per product via the generic parameter below) so a product can
 * offer the right situations for the right context, and that is the
 * only place a product's own vocabulary is allowed to touch this file.
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
  /**
   * The moment right before doing the thing itself. Exactly two answers,
   * fixed by the engine rather than authored per playbook: doing it now,
   * or naming one exact time today. Never a countdown to being late, and
   * never a second question about why today did not work out.
   */
  | "ready"
  /** Short prompts for while the thing is happening. Capped, deliberately. */
  | "during"
  /** Terminal. Branches back into the product's own domain. */
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
 * What a run can end as. Generic on purpose: every product built on
 * this engine so far maps cleanly onto "sorted, made progress, waiting
 * on someone, there's a next step, didn't get to it, something else",
 * because that is the actual shape of finishing, or not finishing, a
 * real-world situation, whatever the situation is about.
 *
 * "Did not get to it" writing nothing is the rule the founding product
 * (Alongside) proved and every product built on this engine inherits:
 * recording an abandonment turns a person's own history into a record
 * of failures. Whether that writes nothing is enforced by each
 * product's own outcome-handling code, not by this file, but the option
 * existing here without a required "detail" is what keeps that possible.
 */
export type OutcomeKind = "resolved" | "progress" | "waiting" | "next-step" | "not-yet" | "other";

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

/**
 * TContext is each product's own vocabulary for what a playbook can be
 * opened for (Alongside's four life shapes; a future product's own
 * equivalent), kept generic here rather than importing any product's
 * type, so this file introduces no dependency in the wrong direction.
 */
export interface Playbook<TContext extends string = string> {
  key: string;
  title: string;
  /** How it is offered in a situation list, from the person's side. */
  situation: string;
  /** Which of the product's own contexts can open this one directly. */
  opensFor?: TContext[];
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
export function nextStep(playbook: Playbook, answers: Answers, skipped: Set<string> = new Set()): PlaybookStep | null {
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
