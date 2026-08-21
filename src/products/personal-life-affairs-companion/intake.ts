import type { AffairGate } from "./affairsKnowledge";
import type { AffairProfile } from "./sequencer";

/**
 * The questions that decide what this product will ever mention.
 *
 * Eight of them, each a yes or no, each switching whole branches of the
 * knowledge base on or off permanently. This is the mechanism behind the
 * design law that nothing irrelevant is ever shown: not greyed out, not
 * behind a toggle, absent.
 *
 * Every question carries its own reason, for the same purpose as a
 * step's `why`: a person asked something personal deserves to know what
 * it is for before answering.
 *
 * Ordered so the ones that unlock the most consequential steps come
 * first. Somebody who abandons after two questions should still have
 * unlocked the parts that matter most.
 */
export interface IntakeQuestion {
  gate: AffairGate;
  question: string;
  why: string;
}

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    gate: "hasChildren",
    question: "Do you have children under eighteen?",
    why: "If you do, deciding who would raise them is the most consequential thing on this whole list, and it is the reason most people finally sit down to do any of it.",
  },
  {
    gate: "partnered",
    question: "Are you married or living with a partner?",
    why: "It changes who has a say, what they are entitled to, and which paperwork matters. It also decides whether we ask about marriage or divorce records at all.",
  },
  {
    gate: "hasEmployerRetirement",
    question: "Do you have a pension or retirement plan through an employer?",
    why: "The form naming who receives it usually overrides a will, and it is the one most often left exactly as it was on somebody's first day at a job.",
  },
  {
    gate: "ownsHome",
    question: "Do you own the place you live?",
    why: "Owning brings a deed and usually a mortgage, both of which need finding. If you rent, we will skip all of that rather than ask you about it.",
  },
  {
    gate: "hasLifeInsurance",
    question: "Do you have life cover?",
    why: "Policies go unclaimed constantly, because nobody knew they existed. If you have one, saying where it is takes two minutes.",
  },
  {
    gate: "hasDependantsWithExtraNeeds",
    question: "Does anyone depend on you for ongoing care?",
    why: "Care arrangements can be disrupted within days. If this applies, it changes what we ask and we will suggest talking to somebody who specialises in it.",
  },
  {
    gate: "hasPets",
    question: "Do you have pets?",
    why: "Animals end up in shelters after exactly this gap. Saying who would take them takes about two minutes.",
  },
  {
    gate: "hasBusiness",
    question: "Do you own a business or work for yourself?",
    why: "A business without a named person can stall within a week, and staff and customers feel it first.",
  },
];

/**
 * The next question nobody has answered yet, or null once all eight are
 * done. An answered question never returns, including one answered no:
 * false is an answer, undefined is not.
 */
export function nextUnansweredIntake(profile: AffairProfile): IntakeQuestion | null {
  return INTAKE_QUESTIONS.find((q) => typeof profile[q.gate] !== "boolean") ?? null;
}

export function intakeComplete(profile: AffairProfile): boolean {
  return nextUnansweredIntake(profile) === null;
}
