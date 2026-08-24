import type { Playbook } from "../playbook";
import { makeAPhoneCall } from "./makeAPhoneCall";

/**
 * The library.
 *
 * One playbook in Phase 1, on purpose. The engine is proven end to end
 * first, because authoring eight branching procedures against an
 * unproven shape is how the content gets written twice.
 *
 * The seven still to write, locked by the founder and not to be expanded
 * during Phase 1:
 *
 *   make-a-difficult-phone-call
 *   send-the-email
 *   follow-up-with-someone
 *   resolve-a-billing-problem
 *   book-and-prepare-for-an-appointment
 *   resume-something-abandoned
 *   break-down-something-too-big
 *
 * Adding one is a file and one array entry. Nothing else in the product
 * changes, which is the socket working.
 */
export const PLAYBOOKS: Playbook[] = [makeAPhoneCall];

export const PLAYBOOK_BY_KEY: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((playbook) => [playbook.key, playbook])
);

export function playbooksFor(kind: string): Playbook[] {
  return PLAYBOOKS.filter((playbook) => (playbook.opensFor as string[]).includes(kind));
}
