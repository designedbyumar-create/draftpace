import { CAPTURE_SPECS, UNSURE, type CapturePrompt, type CaptureSpec } from "./captures";
import type { AffairArea } from "./affairsKnowledge";
import type { AffairItemStatus } from "./lifeAffairs";

/**
 * Walking one capture: which question to ask next, and what record comes
 * out at the end.
 *
 * Pure, and deliberately so. The whole one-question-at-a-time behaviour
 * lives here rather than in a component, which means it can be tested
 * without rendering anything and means the printed blank copy can render
 * exactly the same questions the app asks. Those two drifting apart is
 * how a blank binder ends up asking for things the app never wanted.
 */

export type CaptureAnswers = Record<string, string>;

/**
 * Field names that are columns on the record rather than entries in its
 * open bag. Everything a reader of the printed copy needs at a glance,
 * and everything other code wants to read without knowing the kind.
 */
const RESERVED = new Set(["label", "whereabouts", "personName", "personContact", "notes"]);

export function isReservedField(field: string): boolean {
  return RESERVED.has(field);
}

function answered(answers: CaptureAnswers, field: string): boolean {
  return (answers[field] ?? "").trim().length > 0;
}

/**
 * Whether a prompt applies, given what has been said so far. This is how
 * "where is it kept" is never asked of somebody who has just said they
 * do not have one.
 */
export function promptApplies(prompt: CapturePrompt, answers: CaptureAnswers): boolean {
  if (!prompt.askIf) return true;
  const value = (answers[prompt.askIf.field] ?? "").trim();
  if (value.length === 0) return false;
  if (!prompt.askIf.equals) return true;
  return prompt.askIf.equals.includes(value);
}

export function applicablePrompts(spec: CaptureSpec, answers: CaptureAnswers): CapturePrompt[] {
  return spec.prompts.filter((p) => promptApplies(p, answers));
}

/**
 * The single next question, or null when there is nothing left worth
 * asking.
 *
 * Skipped optional prompts must not come back around, so a prompt is
 * considered dealt with once it appears in `skipped` even though it has
 * no answer. Without that the companion would loop on the one question
 * the person deliberately passed over.
 */
export function nextPrompt(
  spec: CaptureSpec,
  answers: CaptureAnswers,
  skipped: Set<string> = new Set()
): CapturePrompt | null {
  for (const prompt of spec.prompts) {
    if (!promptApplies(prompt, answers)) continue;
    if (answered(answers, prompt.field)) continue;
    if (skipped.has(prompt.field)) continue;
    return prompt;
  }
  return null;
}

/** How far along a capture is, for the quiet progress line inside one capture only. */
export function captureProgress(
  spec: CaptureSpec,
  answers: CaptureAnswers,
  skipped: Set<string> = new Set()
): { asked: number; total: number } {
  const applicable = applicablePrompts(spec, answers);
  const asked = applicable.filter((p) => answered(answers, p.field) || skipped.has(p.field)).length;
  return { asked, total: applicable.length };
}

export interface AffairItemDraft {
  kind: string;
  area: AffairArea;
  originStepKey: string;
  label: string;
  whereabouts: string | null;
  personName: string | null;
  personContact: string | null;
  notes: string | null;
  fields: Record<string, string>;
  status: AffairItemStatus;
}

/**
 * Turn the answers into a record.
 *
 * The status rule matters more than it looks. A capture where the person
 * said they were not sure, or left a required question, produces an
 * INCOMPLETE record rather than a finished one. That is what stops the
 * printed copy from presenting a shrug as an answer, and it is what lets
 * the companion come back to it later without treating the person as
 * though they had refused.
 */
export function buildDraft(
  spec: CaptureSpec,
  stepKey: string,
  area: AffairArea,
  answers: CaptureAnswers,
  skipped: Set<string> = new Set()
): AffairItemDraft {
  const fields: Record<string, string> = {};
  const reserved: Record<string, string> = {};

  for (const prompt of applicablePrompts(spec, answers)) {
    const value = (answers[prompt.field] ?? "").trim();
    if (!value) continue;
    if (isReservedField(prompt.field)) reserved[prompt.field] = value;
    else fields[prompt.field] = value;
  }

  const missingRequired = applicablePrompts(spec, answers).some(
    (p) => !p.optional && !answered(answers, p.field) && !skipped.has(p.field)
  );
  const anyUnsure = Object.values({ ...fields, ...reserved }).some((v) => v === UNSURE);

  return {
    kind: spec.itemKind,
    area,
    originStepKey: stepKey,
    label: deriveLabel(spec, answers, reserved, fields),
    whereabouts: reserved.whereabouts ?? null,
    personName: reserved.personName ?? null,
    personContact: reserved.personContact ?? null,
    notes: reserved.notes ?? null,
    fields,
    status: missingRequired || anyUnsure ? "incomplete" : "established",
  };
}

/**
 * The record's name. Taken from an answer the person already gave, never
 * asked for separately: "what would you like to call this record" is the
 * kind of question that makes a product feel like a database.
 */
function deriveLabel(
  spec: CaptureSpec,
  answers: CaptureAnswers,
  reserved: Record<string, string>,
  fields: Record<string, string>
): string {
  if (spec.labelFixed) return spec.labelFixed;
  if (spec.labelFrom) {
    const value = reserved[spec.labelFrom] ?? fields[spec.labelFrom] ?? (answers[spec.labelFrom] ?? "").trim();
    if (value) return value;
  }
  return reserved.label ?? fields.label ?? "Recorded";
}

/**
 * What the companion says once it is saved. A fixed template with the
 * record's own name substituted in, and nothing else. There is no model
 * provider anywhere in this repository; every sentence the product says
 * back to a person was written by a person.
 */
export function acknowledge(spec: CaptureSpec, label: string): string {
  return spec.acknowledgement.replace("{label}", label);
}

export function captureFor(stepKey: string): CaptureSpec | null {
  return CAPTURE_SPECS[stepKey] ?? null;
}

export { UNSURE };
