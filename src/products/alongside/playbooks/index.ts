import type { ItemKind } from "../life";
import type { Playbook } from "../playbook";
import { makeAPhoneCall } from "./makeAPhoneCall";
import { makeADifficultPhoneCall } from "./makeADifficultPhoneCall";
import { sendTheEmail } from "./sendTheEmail";
import { followUpWithSomeone } from "./followUpWithSomeone";
import { resolveABillingProblem } from "./resolveABillingProblem";
import { bookAndPrepareForAnAppointment } from "./bookAndPrepareForAnAppointment";
import { resumeSomethingAbandoned } from "./resumeSomethingAbandoned";
import { breakDownSomethingTooBig } from "./breakDownSomethingTooBig";

/**
 * The library. Eight, and eight is the number.
 *
 * The engine was proven with one before these seven were written, which
 * is why they could be authored once rather than twice. What that
 * exercise changed: the step level condition earned its place (an
 * appointment already booked skips the wording step entirely) and one
 * playbook has no during step at all, because writing an email is not a
 * live event and a list of things to do while it happens would have been
 * filler.
 *
 * ORDER IS THE OFFER
 *
 * Help lists these in this order, so it is the product's answer to
 * "what do people actually get stuck on". Phone calls first because they
 * are the most avoided, breaking things down last because somebody
 * reaching for it usually knows that is what they need.
 *
 * A ninth is a file and one array entry. That it costs nothing else is
 * the socket working, and is not an invitation: eight was chosen, and a
 * library that grows until it needs a search box has become a different
 * product.
 */
export const PLAYBOOKS: Playbook[] = [
  makeAPhoneCall,
  makeADifficultPhoneCall,
  sendTheEmail,
  followUpWithSomeone,
  resolveABillingProblem,
  bookAndPrepareForAnAppointment,
  resumeSomethingAbandoned,
  breakDownSomethingTooBig,
];

export const PLAYBOOK_BY_KEY: Record<string, Playbook> = Object.fromEntries(
  PLAYBOOKS.map((playbook) => [playbook.key, playbook])
);

export function playbooksFor(kind: ItemKind | string): Playbook[] {
  return PLAYBOOKS.filter((playbook) => (playbook.opensFor as string[]).includes(kind));
}
