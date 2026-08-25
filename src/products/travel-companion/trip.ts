/**
 * The pure trip graph: types, and the tree walk the whole product's
 * differentiator (the change-impact model) is built on.
 *
 * WHY A TREE
 *
 * Every booking depends on at most one upstream booking. A flight can
 * be the upstream of both an airport transfer and a hotel check-in at
 * once (fan-out is native to a tree); nothing here lets a booking
 * depend on two upstream things. A general many-to-many graph is
 * exactly the "visual spaghetti diagram" the product exists to avoid,
 * and a tree cannot become one by construction: there is always exactly
 * one path from any booking back to what it depends on, so "what does
 * this affect" is always a plain, boundable walk in one direction.
 *
 * Links are created only by an explicit user action elsewhere in the
 * application. Nothing here infers a dependency from time, place or
 * booking kind, and nothing here writes to a database; this file only
 * describes the shape and answers questions about it.
 */

export type TripStatus = "planning" | "active" | "past" | "archived";

export interface Trip {
  id: string;
  title: string;
  destinationSummary: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: TripStatus;
  createdAt: string;
}

export interface Person {
  id: string;
  tripId: string;
  name: string;
  isChild: boolean;
  relationshipNote: string | null;
  requirements: string | null;
  status: "active" | "archived";
}

export interface Place {
  id: string;
  tripId: string;
  name: string;
  ordinal: number;
  arrivesAt: string | null;
  departsAt: string | null;
  status: "active" | "archived";
}

export type BookingKind =
  | "flight"
  | "train"
  | "car"
  | "transfer"
  | "hotel"
  | "rental"
  | "activity"
  | "restaurant"
  | "event"
  | "other";

export type BookingStatus = "confirmed" | "waiting" | "cancelled";

export type DocumentKind = "passport" | "visa" | "insurance" | "confirmation" | "ticket" | "agreement" | "other";

/**
 * A registry entry, never a file. Records what exists and where it is
 * kept, not the document itself, see the Phase 0 proposal §9.
 */
export interface TravelDocument {
  id: string;
  tripId: string;
  personId: string | null;
  bookingId: string | null;
  kind: DocumentKind;
  label: string;
  keptWhere: string | null;
  status: "active" | "archived";
}

export type PreparationCategory = "documents" | "packing" | "transport" | "money" | "home" | "people" | "bookings";
export type PreparationCompletionStatus = "open" | "done";

/** A user-defined checklist entry. No seeded content, ever. */
export interface PreparationItem {
  id: string;
  tripId: string;
  category: PreparationCategory;
  title: string;
  completionStatus: PreparationCompletionStatus;
  notes: string | null;
  status: "active" | "archived";
}

export type ThreadStatus = "open" | "resolved";

/**
 * The thing actually being waited on ("Hotel has not confirmed late
 * arrival"), not a fourth booking status. See the migration's own
 * header for why this is a separate table.
 */
export interface Thread {
  id: string;
  tripId: string;
  bookingId: string | null;
  personId: string | null;
  title: string;
  whoIsInvolved: string | null;
  /** User-chosen only, never invented. */
  expectedBy: string | null;
  status: ThreadStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export type RecordCategory = "destination" | "stay" | "transport" | "reservation" | "note" | "lesson";

/** A dated, append-only line: a manual note, or a resolved thread's closing snapshot. */
export interface RecordEntry {
  id: string;
  tripId: string;
  category: RecordCategory;
  placeName: string | null;
  body: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  tripId: string;
  placeId: string | null;
  kind: BookingKind;
  title: string;
  provider: string | null;
  reference: string | null;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  bookingStatus: BookingStatus;
  /** The tree edge. Null means this booking depends on nothing upstream. */
  dependsOnBookingId: string | null;
  notes: string | null;
  status: "active" | "archived";
}

/** Bookings still in play for the trip, not archived. */
export function activeBookings(bookings: Booking[]): Booking[] {
  return bookings.filter((booking) => booking.status === "active");
}

/**
 * Would linking `bookingId` to depend on `proposedParentId` create a
 * cycle?
 *
 * The self-reference FK stops a booking depending on itself directly,
 * but nothing in the schema stops A depends on B depends on A, a two
 * (or longer) node cycle, which would quietly turn the tree into a
 * graph the moment it happened. This is the guard the domain layer
 * calls before ever writing a dependency, so the tree claim stays true
 * rather than merely intended.
 */
export function wouldCreateCycle(bookings: Booking[], bookingId: string, proposedParentId: string): boolean {
  if (bookingId === proposedParentId) return true;
  const byId = new Map(bookings.map((booking) => [booking.id, booking]));
  let current: string | null = proposedParentId;
  const seen = new Set<string>();
  while (current) {
    if (current === bookingId) return true;
    if (seen.has(current)) return true; // an existing cycle elsewhere; refuse rather than extend it
    seen.add(current);
    current = byId.get(current)?.dependsOnBookingId ?? null;
  }
  return false;
}

/**
 * Every booking downstream of `bookingId`, however many links deep.
 *
 * This is the whole of "what changed?": a breadth-first walk down the
 * tree, one direction only. Never walks upward, because a hotel
 * check-in changing does not imply the flight changed, the tree's
 * direction already encodes that later things depend on earlier things,
 * not the reverse.
 */
export function descendantsOf(bookings: Booking[], bookingId: string): Booking[] {
  const byParent = new Map<string, Booking[]>();
  for (const booking of activeBookings(bookings)) {
    if (!booking.dependsOnBookingId) continue;
    const siblings = byParent.get(booking.dependsOnBookingId) ?? [];
    siblings.push(booking);
    byParent.set(booking.dependsOnBookingId, siblings);
  }

  const result: Booking[] = [];
  const queue = [...(byParent.get(bookingId) ?? [])];
  while (queue.length > 0) {
    const next = queue.shift()!;
    result.push(next);
    queue.push(...(byParent.get(next.id) ?? []));
  }
  return result;
}

/** Bookings sorted the way Today and the Trip timeline both read them: chronological, undated last. */
export function byStartTime(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => {
    if (!a.startsAt && !b.startsAt) return 0;
    if (!a.startsAt) return 1;
    if (!b.startsAt) return -1;
    return a.startsAt < b.startsAt ? -1 : a.startsAt > b.startsAt ? 1 : 0;
  });
}
