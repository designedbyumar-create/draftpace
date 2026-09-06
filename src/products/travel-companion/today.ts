import { activeBookings, byStartTime, type Booking, type Place, type Thread } from "./trip";

const UTC = "UTC";

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
 * A date's calendar day in a given IANA zone, as "YYYY-MM-DD".
 *
 * Falls back to UTC for a zone name Intl does not recognise, the same
 * honest fallback trv_places.timezone itself uses for a place the lookup
 * table never matched: this file trusts whatever string it is handed
 * (the lookup table, or a person's own explicit pick) without a second
 * validation layer, and a corrupt value should degrade to the old
 * UTC-only behaviour rather than throw.
 */
function calendarDate(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(
      date
    );
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: UTC, year: "numeric", month: "2-digit", day: "2-digit" }).format(
      date
    );
  }
}

/**
 * "Same day", compared in a specific place's own timezone rather than
 * raw UTC.
 *
 * This used to compare UTC calendar components regardless of where a
 * booking or the reader actually was, a known, documented v1 limitation:
 * nothing in the schema stored which timezone a place was in, so there
 * was no honest way to compute "today at the destination". trv_places
 * now carries an IANA zone name (timezoneLookup.ts, auto-detected or
 * picked by hand), so a booking anchored to a place compares against
 * that place's real calendar day. A booking with no place, or a place
 * with no detected zone, falls back to UTC exactly as before: an honest
 * fallback, never a silent wrong answer, not a regression from the old
 * behaviour.
 */
function sameDay(a: Date, b: Date, timeZone: string = UTC): boolean {
  return calendarDate(a, timeZone) === calendarDate(b, timeZone);
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
/** A booking's own place's timezone, or UTC when it has no place or the place has no detected zone. */
function timeZoneForBooking(booking: Booking, placeById: Map<string, Place>): string {
  const place = booking.placeId ? placeById.get(booking.placeId) : undefined;
  return place?.timezone ?? UTC;
}

function deriveWaiting(threads: Thread[], bookings: Booking[], now: Date, placeById: Map<string, Place>): WaitingLine[] {
  const byId = new Map(bookings.map((booking) => [booking.id, booking]));

  return threads
    .filter((thread) => thread.status === "open")
    .filter((thread) => {
      if (!thread.bookingId) return true;
      const booking = byId.get(thread.bookingId);
      if (!booking || !booking.startsAt) return false;
      const tz = timeZoneForBooking(booking, placeById);
      const startsAt = new Date(booking.startsAt);
      const tomorrow = addDays(now, 1);
      const dayAfter = addDays(now, 2);
      return sameDay(startsAt, now, tz) || sameDay(startsAt, tomorrow, tz) || sameDay(startsAt, dayAfter, tz);
    })
    .map((thread) => ({ thread, line: thread.title }));
}

export function deriveToday(bookings: Booking[], now: Date, threads: Thread[] = [], places: Place[] = []): TodayView {
  const placeById = new Map(places.map((place) => [place.id, place]));
  const active = activeBookings(bookings).filter((booking) => booking.startsAt);
  const today: TodayLine[] = [];
  const important: TodayLine[] = [];
  const later: TodayLine[] = [];
  const waiting = deriveWaiting(threads, bookings, now, placeById);

  for (const booking of byStartTime(active)) {
    const tz = timeZoneForBooking(booking, placeById);
    const startsAt = new Date(booking.startsAt as string);
    const tomorrow = addDays(now, 1);
    const dayAfter = addDays(now, 2);

    if (sameDay(startsAt, now, tz)) {
      today.push({ booking, section: "now", line: describeBooking(booking) });
      continue;
    }

    if (sameDay(startsAt, tomorrow, tz) && WINDOW_KINDS.has(booking.kind)) {
      important.push({ booking, section: "important", line: describeBooking(booking) });
      continue;
    }

    if (sameDay(startsAt, tomorrow, tz) || sameDay(startsAt, dayAfter, tz)) {
      const day = sameDay(startsAt, tomorrow, tz) ? "Tomorrow" : "In two days";
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

/**
 * Where the trip is today, from the places a person recorded arriving in
 * and not yet departing.
 *
 * "Today" is computed separately for each candidate place, in that
 * place's own timezone (UTC when none was detected), rather than once
 * up front: two places in this list can genuinely be in different
 * zones, and a traveller near midnight in one of them deserves the
 * answer that place's own calendar would give, not whichever zone the
 * server or the reader's device happens to be in.
 */
export function whereWeAre(places: Place[], now: Date): Place | null {
  return (
    places.find((place) => {
      if (place.status !== "active") return false;
      const today = calendarDate(now, place.timezone ?? UTC);
      if (place.arrivesAt && place.arrivesAt > today) return false;
      if (place.departsAt && place.departsAt < today) return false;
      return Boolean(place.arrivesAt) || Boolean(place.departsAt);
    }) ?? null
  );
}
