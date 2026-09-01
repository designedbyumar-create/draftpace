import { activeBookings, byStartTime, type Booking, type Place, type Thread } from "./trip";

/**
 * The current operational state, derived, never stored.
 *
 * Same discipline as Alongside's deriveAttention: every line traces to
 * a stored column, nothing is invented, and a day with nothing in it
 * says so plainly rather than being filled with generic travel advice.
 */

export type TodaySectionKind = "now" | "important" | "later";

export interface TodayLine {
  booking: Booking;
  section: TodaySectionKind;
  /** The stored fact, stated plainly. Never an imperative, never "don't forget". */
  line: string;
}

export interface WaitingLine {
  thread: Thread;
  /** Whatever the person recorded, stated plainly. Never a guess at status. */
  line: string;
}

export interface TodayView {
  now: TodayLine[];
  important: TodayLine[];
  later: TodayLine[];
  waiting: WaitingLine[];
  quiet: boolean;
}

/** Kinds where a start time functions as a window that opens, not a moment that passes. */
const WINDOW_KINDS = new Set(["hotel", "rental"]);

/**
 * "Same day" compared as UTC calendar dates, deliberately, not the
 * reader's local timezone.
 *
 * A traveller crossing timezones mid-trip is the hard case this
 * sidesteps rather than gets wrong: nothing in this schema stores which
 * timezone a place or a booking is in (a real, later decision, not one
 * this file should make silently), so there is no honest way to compute
 * "today at the destination" yet. What this file must not do is give a
 * different answer depending on which timezone the server or the
 * reader's device happens to be in for the exact same stored data, which
 * comparing by local calendar components did. UTC comparison is at
 * least deterministic and reproducible; it is a known, explicit v1
 * limitation, not one to quietly work around.
 */
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
}

/**
 * A booking's own stored facts, read back as a sentence. Never a
 * warning, never a countdown. "Hotel check-in begins at 3 PM" is what
 * was recorded; the reader supplies their own sense of urgency.
 */
function describeBooking(booking: Booking): string {
  const time = booking.startsAt ? timeLabel(booking.startsAt) : null;
  if (WINDOW_KINDS.has(booking.kind) && time) {
    const verb = booking.kind === "hotel" ? "Check-in begins" : "Pickup begins";
    return `${booking.title}. ${verb} at ${time}.`;
  }
  return time ? `${booking.title}, ${time}.` : booking.title;
}

/**
 * Open threads worth showing right now.
 *
 * A thread with no booking behind it (opened from a general situation:
 * contact someone, reorganize the trip, something went wrong) has no
 * "happening" to bound it by, so it is always shown while open. A
 * thread linked to a booking is shown only while that booking itself
 * falls in the same now/tomorrow/day-after horizon the rest of Today
 * uses, per the proposal's own "linked to a booking happening within
 * the horizon"; once that booking's own time has passed out of the
 * horizon, the thread stops surfacing here even if still open, the same
 * way an old booking stops surfacing in Later.
 */
function deriveWaiting(threads: Thread[], bookings: Booking[], now: Date): WaitingLine[] {
  const byId = new Map(bookings.map((booking) => [booking.id, booking]));
  const tomorrow = addDays(now, 1);
  const dayAfter = addDays(now, 2);

  return threads
    .filter((thread) => thread.status === "open")
    .filter((thread) => {
      if (!thread.bookingId) return true;
      const booking = byId.get(thread.bookingId);
      if (!booking || !booking.startsAt) return false;
      const startsAt = new Date(booking.startsAt);
      return sameDay(startsAt, now) || sameDay(startsAt, tomorrow) || sameDay(startsAt, dayAfter);
    })
    .map((thread) => ({ thread, line: thread.title }));
}

export function deriveToday(bookings: Booking[], now: Date, threads: Thread[] = []): TodayView {
  const active = activeBookings(bookings).filter((booking) => booking.startsAt);
  const today: TodayLine[] = [];
  const important: TodayLine[] = [];
  const later: TodayLine[] = [];
  const waiting = deriveWaiting(threads, bookings, now);

  const tomorrow = addDays(now, 1);
  const dayAfter = addDays(now, 2);

  for (const booking of byStartTime(active)) {
    const startsAt = new Date(booking.startsAt as string);

    if (sameDay(startsAt, now)) {
      today.push({ booking, section: "now", line: describeBooking(booking) });
      continue;
    }

    if (sameDay(startsAt, tomorrow) && WINDOW_KINDS.has(booking.kind)) {
      important.push({ booking, section: "important", line: describeBooking(booking) });
      continue;
    }

    if (sameDay(startsAt, tomorrow) || sameDay(startsAt, dayAfter)) {
      const day = sameDay(startsAt, tomorrow) ? "Tomorrow" : "In two days";
      later.push({ booking, section: "later", line: `${day}: ${describeBooking(booking)}` });
    }
  }

  return {
    now: today,
    important,
    later,
    waiting,
    quiet: today.length === 0 && important.length === 0 && later.length === 0 && waiting.length === 0,
  };
}

/** Where the trip is today, from the places a person recorded arriving in and not yet departing. */
export function whereWeAre(places: Place[], now: Date): Place | null {
  const today = now.toISOString().slice(0, 10);
  return (
    places.find((place) => {
      if (place.status !== "active") return false;
      if (place.arrivesAt && place.arrivesAt > today) return false;
      if (place.departsAt && place.departsAt < today) return false;
      return Boolean(place.arrivesAt) || Boolean(place.departsAt);
    }) ?? null
  );
}
