/**
 * Product capabilities are namespaced strings ("<area>.<capability>"), not a
 * closed TypeScript union. A new product family — or a new capability on an
 * existing family — registers itself by using a validly namespaced string;
 * nothing here needs editing for that to work. See docs/PRODUCT-FRAMEWORK.md.
 */

export type ProductCapabilityId = string;

const CAPABILITY_ID_PATTERN = /^[a-z][a-z0-9-]*\.[a-z][a-z0-9-]*$/;

export function isValidCapabilityId(value: string): value is ProductCapabilityId {
  return CAPABILITY_ID_PATTERN.test(value);
}

export function assertValidCapabilityId(value: string): ProductCapabilityId {
  if (!isValidCapabilityId(value)) {
    throw new Error(
      `Invalid capability id "${value}". Capability ids must match "<namespace>.<capability>", e.g. "companion.next-action".`
    );
  }
  return value;
}

/**
 * Documented "known core" capabilities per initial family — for editor
 * autocomplete and typo-catching only. This list is illustrative, not
 * exhaustive: `isValidCapabilityId` accepts any correctly namespaced string,
 * including ones not listed here.
 */
export const KNOWN_CAPABILITIES = {
  companion: [
    "companion.context",
    "companion.next-action",
    "companion.momentum",
    "companion.recovery",
    "companion.milestones",
    "companion.outcomes",
  ],
  learning: [
    "learning.module",
    "learning.lesson",
    "learning.activity",
    "learning.assessment",
    "learning.mastery",
    "learning.completion",
    "learning.certificate",
  ],
  automation: [
    "automation.trigger",
    "automation.condition",
    "automation.action",
    "automation.schedule",
    "automation.run",
    "automation.run-history",
    "automation.retry",
    "automation.failure",
    "automation.permission",
  ],
  workspace: [
    "workspace.structured-input",
    "workspace.calculation",
    "workspace.output",
    "workspace.saved-output",
    "workspace.history",
    "workspace.export",
  ],
  guidedProgram: [
    "guided-program.stage",
    "guided-program.task",
    "guided-program.checkin",
    "guided-program.reflection",
    "guided-program.completion",
  ],
  tracker: [
    "tracker.entry",
    "tracker.trend",
    "tracker.summary",
    "tracker.review-cycle",
  ],
} as const satisfies Record<string, readonly ProductCapabilityId[]>;
