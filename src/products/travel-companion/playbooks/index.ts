import type { Playbook } from "@/components/product-shell/companion/steps";
import { bookingProblem } from "./bookingProblem";

/**
 * The library. One playbook, on purpose, per the founder's own Phase 3
 * gate: prove the shared engine against a real situation before
 * authoring the remaining seven, the same "engine before content"
 * discipline Alongside's own build proved out.
 *
 * The founder's locked v1 library, for when Phase 4 adds the rest:
 *
 *   booking-problem     (this one)
 *   flight-problem
 *   hotel-problem
 *   transport-problem
 *   something-changed
 *   reorganize-the-trip
 *   contact-someone
 *   something-went-wrong
 *
 * Eight, locked. Not a dynamic library, no search, per the founder's
 * own Phase 0 decision.
 */
export const PLAYBOOKS: Playbook[] = [bookingProblem];

export const PLAYBOOK_BY_KEY: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((playbook) => [playbook.key, playbook])
);
