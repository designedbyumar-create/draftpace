import type { AffairArea } from "./affairsKnowledge";

/**
 * The Life Affairs Map: what this product actually knows about a person.
 *
 * THE DISTINCTION THIS FILE EXISTS TO ENFORCE
 *
 * A step record says "you dealt with this on 22 August". An affair
 * record says "the person to call first is Jane Smith, your partner,
 * and the paperwork is in the study". Only the second one is worth
 * anything to somebody holding the printed copy. Steps are the
 * interaction; records are the product.
 *
 * Everything here is pure. No database, no React, no clock of its own:
 * `now` is always passed in.
 *
 * WHAT MAY AND MAY NOT BE STORED
 *
 * A record answers four questions and no others: what exists, where it
 * is, who knows about it, and what somebody should do. It never holds a
 * password, an account number, a security answer, a full identity
 * number, or an uploaded document. That boundary is the reason this can
 * be a companion rather than a vault, and it is checked in tests.
 */

/**
 * A record's standing.
 *
 * "needsReview" is deliberately NOT one of these. It is derived from
 * nextReviewAt against the current date, every time, so it can never
 * disagree with the calendar. See needsReview() below.
 */
export type AffairItemStatus = "established" | "incomplete" | "notApplicable" | "archived";

/**
 * One thing the person has established about their affairs.
 *
 * Five reserved fields are columns because every kind of record uses
 * them and other code wants to read them without knowing the kind.
 * Everything kind-specific lives in `fields`, an open bag validated per
 * kind in code rather than by the database, so a new kind of affair
 * never needs a migration. Same discipline as the platform's open
 * capability and family strings.
 */
export interface AffairItem {
  id: string;
  /** Open validated string: "person", "location", "policy", "preference", "obligation", ... */
  kind: string;
  area: AffairArea;
  /** The knowledge-base step that established this. One step may own several records. */
  originStepKey: string | null;
  /** The record's own name. "Jane Smith", "The will", "Where the deeds are". */
  label: string;
  /** Where it is, in the person's own words. Never a link to a stored file. */
  whereabouts: string | null;
  personName: string | null;
  /** How to reach them. A phone number or an email, never a credential. */
  personContact: string | null;
  /** What somebody should actually do, in the person's own voice. */
  notes: string | null;
  fields: Record<string, string>;
  status: AffairItemStatus;
  /** When the person first told us. Distinct from when the row was written. */
  establishedAt: string | null;
  /** When a human last asserted this is still true. The currency claim. */
  lastConfirmedAt: string | null;
  reviewIntervalMonths: number | null;
  nextReviewAt: string | null;
}

export type AffairItemRelation =
  | "concerns"
  | "kept-with"
  | "knows-about"
  | "responsible-for"
  | "covers";

export interface AffairItemLink {
  id: string;
  fromItemId: string;
  toItemId: string;
  relation: AffairItemRelation;
  createdAt: string;
}

export type AffairChangeKind = "established" | "updated" | "confirmed" | "markedNotApplicable" | "archived";

export interface AffairItemRevision {
  id: string;
  itemId: string;
  changeKind: AffairChangeKind;
  /** A sentence a person would recognise: "Changed who to contact first from Tom to Jane." */
  summary: string | null;
  createdAt: string;
}

/**
 * Whether a record has been standing long enough to be worth a second
 * look. Derived, never stored.
 *
 * An archived or not-applicable record never comes back: the person has
 * already decided, and asking again would be the nagging this product
 * exists to avoid.
 */
export function needsReview(item: AffairItem, now: Date): boolean {
  if (item.status !== "established") return false;
  if (!item.nextReviewAt) return false;
  return new Date(item.nextReviewAt).getTime() <= now.getTime();
}

/** A record still missing something the person meant to come back to. */
export function isIncomplete(item: AffairItem): boolean {
  return item.status === "incomplete";
}

/**
 * Records that count as live knowledge. Used everywhere that asks "do we
 * actually know this", including the sequencer and the printed copy, so
 * that the answer is the same in all of them.
 */
export function liveItems(items: AffairItem[]): AffairItem[] {
  return items.filter((i) => i.status === "established" || i.status === "incomplete");
}

export function itemsForStep(items: AffairItem[], stepKey: string): AffairItem[] {
  return liveItems(items).filter((i) => i.originStepKey === stepKey);
}

/**
 * When to ask about this again, given the interval the knowledge base
 * set for it. Returns null for records that should never expire: what
 * you would want said at your funeral does not go out of date, and
 * asking about it every two years would be both useless and grim.
 */
export function computeNextReview(intervalMonths: number | null | undefined, from: Date): string | null {
  if (!intervalMonths) return null;
  const next = new Date(from.getTime());
  next.setMonth(next.getMonth() + intervalMonths);
  return next.toISOString();
}

/**
 * How a record reads to somebody who did not use the app: the person, or
 * the place, or the plain answer. Used by the printed copy and by the
 * app's own summaries so the two can never describe the same record
 * differently.
 */
export function describeItem(item: AffairItem): string {
  const parts: string[] = [];
  // The label is already on screen wherever this is shown, and for a
  // person record the label IS the name. Repeating it under itself reads
  // as a rendering mistake, which is exactly what it was.
  if (item.personName && item.personName !== item.label) parts.push(item.personName);
  const relationship = item.fields.relationship;
  if (relationship) parts.push(relationship);
  if (item.whereabouts) parts.push(item.whereabouts);
  if (parts.length === 0 && item.notes) return item.notes;
  return parts.join(", ");
}
