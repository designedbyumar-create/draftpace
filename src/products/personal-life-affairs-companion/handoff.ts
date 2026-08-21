import { AFFAIR_STEP_BY_KEY, type AffairStep } from "./affairsKnowledge";
import { isEstablished, isRelevant, type AffairProfile, type StepRecord } from "./sequencer";
import type { AffairItem } from "./lifeAffairs";

/**
 * The Handoff Check: could another person actually use this?
 *
 * The one question the whole product is built to answer, asked directly.
 * Everything else looks at the affairs one step at a time; this looks at
 * them the way somebody else would, which is by scenario. Nobody opens
 * the copy wanting to know how many steps were completed. They open it
 * needing to reach the right person, or find the paperwork, or work out
 * what is still being paid for.
 *
 * NOT A SCORE. This deliberately returns a list of what is unclear and
 * never a fraction, a percentage or a readiness grade. "Four things may
 * still be unclear" is actionable and "68% handoff ready" is not, and
 * the second one is the productivity theatre this product exists
 * without.
 *
 * A LEGACY CONFIRMATION DOES NOT COUNT HERE. Elsewhere an old dateless
 * confirmation settles a step so that nothing downstream is trapped.
 * Here the question is whether a stranger could use what is written
 * down, and a date with no answer behind it fails that test. This is the
 * one place in the product where the strictest reading is the honest
 * one.
 *
 * Pure. No database, no clock of its own.
 */

export interface HandoffScenario {
  key: string;
  /** What somebody would be trying to do. Written from their side, not the owner's. */
  need: string;
  /** The steps that have to be answered for that to be possible. */
  requires: string[];
}

export const HANDOFF_SCENARIOS: HandoffScenario[] = [
  {
    key: "reach-someone",
    need: "Someone needs to know who to contact.",
    requires: ["people.emergency-contact", "people.executor"],
  },
  {
    key: "find-paperwork",
    need: "Someone needs to find the important paperwork.",
    requires: ["paperwork.will-exists", "paperwork.id-documents"],
  },
  {
    key: "understand-home",
    need: "Someone needs to understand where you live.",
    requires: ["home.where-you-live"],
  },
  {
    key: "understand-money",
    need: "Someone needs to understand what is coming in and going out.",
    requires: ["money.current-accounts", "money.regular-payments"],
  },
  {
    key: "understand-digital",
    need: "Someone needs to get to your accounts and devices.",
    requires: ["digital.email", "digital.password-manager"],
  },
  {
    key: "know-your-wishes",
    need: "Someone needs to know what you would want.",
    requires: ["wishes.medical-preferences", "wishes.arrangements"],
  },
  {
    key: "look-after-dependants",
    need: "Someone needs to look after the people who rely on you.",
    requires: ["dependants.guardian", "dependants.children-practical"],
  },
  {
    key: "look-after-pets",
    need: "Someone needs to look after your animals.",
    requires: ["dependants.pets"],
  },
  {
    key: "handle-the-business",
    need: "Someone needs to deal with the business.",
    requires: ["money.business-continuity"],
  },
];

export interface HandoffFinding {
  scenario: HandoffScenario;
  clear: boolean;
  /** The steps standing between here and a yes. Empty when clear. */
  missing: AffairStep[];
}

export interface HandoffResult {
  findings: HandoffFinding[];
  unclear: HandoffFinding[];
  /** True when every scenario that applies to this person can be answered. */
  allClear: boolean;
}

/**
 * Whether this one step is answered well enough for a stranger.
 *
 * "Not applicable" counts, and that is not a loophole. A person who has
 * said they have no will has answered the question, and the copy prints
 * that answer. What does not count is a button press with nothing behind
 * it.
 */
function isCovered(step: AffairStep, record: StepRecord | undefined, items: AffairItem[]): boolean {
  if (record?.state === "notRelevant") return true;
  if (step.kind === "action") return record?.state === "confirmed" && !record.legacyConfirmation;
  return isEstablished(step, items);
}

export function deriveHandoff(inputs: {
  profile: AffairProfile;
  records: StepRecord[];
  items: AffairItem[];
}): HandoffResult {
  const byKey = new Map(inputs.records.map((r) => [r.stepKey, r]));

  const findings: HandoffFinding[] = [];

  for (const scenario of HANDOFF_SCENARIOS) {
    const steps = scenario.requires
      .map((key) => AFFAIR_STEP_BY_KEY[key])
      .filter((step): step is AffairStep => Boolean(step))
      .filter((step) => isRelevant(step, inputs.profile));

    // A scenario none of whose steps apply is not unclear. It simply is
    // not part of this person's life, and listing it would be the
    // irrelevance the intake exists to remove.
    if (steps.length === 0) continue;

    const missing = steps.filter((step) => !isCovered(step, byKey.get(step.key), inputs.items));
    findings.push({ scenario, clear: missing.length === 0, missing });
  }

  const unclear = findings.filter((f) => !f.clear);
  return { findings, unclear, allClear: unclear.length === 0 };
}

/**
 * The headline. Counts what is unclear and never what is done, because
 * the list is the useful half and a total would invite a fraction.
 */
export function describeHandoff(result: HandoffResult): string {
  if (result.allClear) return "Someone could pick this up and know what to do.";
  const n = result.unclear.length;
  if (n === 1) return "One thing may still be unclear to somebody else.";
  return `${n} things may still be unclear to somebody else.`;
}

/**
 * The single step to offer next from here, chosen the same way the
 * sequencer chooses: consequence first, then the quicker job. One
 * question, not a list of four, even though four are shown above it.
 */
export function firstFix(result: HandoffResult): AffairStep | null {
  const candidates = result.unclear.flatMap((f) => f.missing);
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => b.consequence - a.consequence || a.minutes - b.minutes)[0];
}
