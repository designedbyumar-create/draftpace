import { describeStop, timeLabel, type Stop } from "./today";
import type { Booking, BookingKind, Place, Trip } from "./trip";

/**
 * The whole trip, day by day, derived and never stored.
 *
 * The same discipline as Today: every line traces to something the person
 * recorded, and a day with nothing recorded says so instead of being
 * filled with a suggestion. This product has no opinion about what
 * somebody should do on a Tuesday in Lisbon, and no model anywhere in it.
 *
 * TIMES ARE WALL-CLOCK, AS TYPED
 *
 * A booking's time is stored as exactly the digits the person entered,
 * with a Z appended (see BookingForm), so the calendar day a booking
 * belongs to is the first ten characters of what was stored. Converting
 * it through a timezone here would move a 23:30 arrival onto the wrong
 * day, which is the one mistake an itinerary cannot afford.
 */

export interface ItineraryStop extends Stop {
  id: string;
  kind: BookingKind;
  location: string | null;
  awaiting: boolean;
}

export interface ItineraryDay {
  /** YYYY-MM-DD. */
  date: string;
  /** Where the person recorded being that day, from a destination's own dates. Null when none covers it. */
  place: string | null;
  stops: ItineraryStop[];
}

export interface Itinerary {
  days: ItineraryDay[];
  /** Bookings recorded without a time, so they belong to no day yet. */
  undated: { id: string; title: string; kind: BookingKind }[];
  /** True when the trip is long enough that days with nothing recorded are left out. */
  compact: boolean;
  /** The first and last day, or null when the trip has no dates and nothing is dated. */
  range: { from: string; to: string } | null;
}

/** A trip longer than this shows only its days that have something on them. */
export const FULL_DAYS_LIMIT = 62;

const DAY_MS = 24 * 60 * 60 * 1000;

const datePart = (value: string): string => value.slice(0, 10);

function isDate(value: string | null | undefined): value is string {
  return Boolean(value) && /^\d{4}-\d{2}-\d{2}/.test(value as string);
}

function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  const end = Date.parse(`${to}T00:00:00Z`);
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= end; t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

/** The kinds whose end time is a second stop on a later day: leaving the room, handing the car back. */
const ENDING_NOTE: Partial<Record<BookingKind, string>> = { hotel: "Check-out", rental: "Return" };

function placeOn(places: Place[], date: string): string | null {
  const match = [...places]
    .filter((place) => place.status === "active")
    .sort((a, b) => a.ordinal - b.ordinal)
    .find((place) => {
      if (!place.arrivesAt && !place.departsAt) return false;
      if (place.arrivesAt && datePart(place.arrivesAt) > date) return false;
      if (place.departsAt && datePart(place.departsAt) < date) return false;
      return true;
    });
  return match?.name ?? null;
}

function stopSort(a: ItineraryStop, b: ItineraryStop): number {
  if (a.time && b.time) return a.time.localeCompare(b.time) || a.title.localeCompare(b.title);
  if (a.time) return -1;
  if (b.time) return 1;
  return a.title.localeCompare(b.title);
}

export function deriveItinerary(input: { trip: Trip; bookings: Booking[]; places: Place[] }): Itinerary {
  const { trip, places } = input;
  const live = input.bookings.filter((booking) => booking.status === "active" && booking.bookingStatus !== "cancelled");

  const byDate = new Map<string, ItineraryStop[]>();
  const push = (date: string, stop: ItineraryStop) => byDate.set(date, [...(byDate.get(date) ?? []), stop]);
  const undated: Itinerary["undated"] = [];

  for (const booking of live) {
    if (!isDate(booking.startsAt)) {
      undated.push({ id: booking.id, title: booking.title, kind: booking.kind });
      continue;
    }
    const start = datePart(booking.startsAt);
    push(start, {
      ...describeStop(booking),
      id: booking.id,
      kind: booking.kind,
      location: booking.location,
      awaiting: booking.bookingStatus === "waiting",
    });

    const ending = ENDING_NOTE[booking.kind];
    if (ending && isDate(booking.endsAt) && datePart(booking.endsAt) > start) {
      push(datePart(booking.endsAt), {
        time: timeLabel(booking.endsAt),
        title: booking.title,
        note: ending,
        id: `${booking.id}:end`,
        kind: booking.kind,
        location: null,
        awaiting: false,
      });
    }
  }

  const dated = [...byDate.keys()].sort();
  const candidates = [
    isDate(trip.startsAt) ? datePart(trip.startsAt) : null,
    isDate(trip.endsAt) ? datePart(trip.endsAt) : null,
    dated[0] ?? null,
    dated[dated.length - 1] ?? null,
  ].filter((value): value is string => Boolean(value));

  if (candidates.length === 0) return { days: [], undated, compact: false, range: null };

  const sorted = [...candidates].sort();
  const range = { from: sorted[0], to: sorted[sorted.length - 1] };
  const all = eachDay(range.from, range.to);
  const compact = all.length > FULL_DAYS_LIMIT;
  const shown = compact
    ? all.filter((date) => byDate.has(date) || date === range.from || date === range.to)
    : all;

  return {
    days: shown.map((date) => ({
      date,
      place: placeOn(places, date),
      stops: [...(byDate.get(date) ?? [])].sort(stopSort),
    })),
    undated,
    compact,
    range,
  };
}
