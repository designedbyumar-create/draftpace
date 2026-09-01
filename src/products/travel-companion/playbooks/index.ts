import type { BookingKind } from "../trip";
import type { Playbook } from "@/components/product-shell/companion/steps";
import { bookingProblem } from "./bookingProblem";
import { flightProblem } from "./flightProblem";
import { hotelProblem } from "./hotelProblem";
import { transportProblem } from "./transportProblem";
import { somethingChanged } from "./somethingChanged";
import { reorganizeTheTrip } from "./reorganizeTheTrip";
import { contactSomeone } from "./contactSomeone";
import { somethingWentWrong } from "./somethingWentWrong";

/**
 * The library. Eight, locked, per the founder's own Phase 0 decision:
 * "these eight are locked for v1... Phase 1/initial v1 must not expand
 * the situation library."
 *
 * ORDER IS THE OFFER, SAME DISCIPLINE AS ALONGSIDE'S OWN LIBRARY
 *
 * Booking-scoped situations first (the ones a person reaches by opening
 * the Companion from a specific booking), the general ones after (the
 * ones that make sense from Today, with nothing specific selected).
 */
export const PLAYBOOKS: Playbook[] = [
  bookingProblem,
  flightProblem,
  hotelProblem,
  transportProblem,
  somethingChanged,
  reorganizeTheTrip,
  contactSomeone,
  somethingWentWrong,
];

export const PLAYBOOK_BY_KEY: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((playbook) => [playbook.key, playbook])
);

/** Which situations make sense opened from a booking of this kind. */
export function playbooksForBooking(kind: BookingKind): Playbook[] {
  return PLAYBOOKS.filter((playbook) => (playbook.opensFor as string[] | undefined)?.includes(kind));
}
