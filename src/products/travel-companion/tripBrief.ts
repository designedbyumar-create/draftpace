import { activeBookings, type Booking, type BookingStatus, type Place, type Thread, type TravelDocument, type Trip } from "./trip";
import { deriveToday, whereWeAre } from "./today";

/**
 * The Trip Brief, proposal §14: a derived, read-only assembly of
 * already-stored state, never a generative summary. Every line here
 * maps to a real query, and "Today" is built from the exact same
 * deriveToday the Today screen itself uses, one function, two callers,
 * so the two screens cannot silently disagree about what today is.
 */
export interface TripBriefView {
  trip: Trip;
  whereWeAre: Place | null;
  today: Booking[];
  next: Place | null;
  openThreads: { count: number; titles: string[] };
  bookingCounts: Record<BookingStatus, number>;
  important: TravelDocument[];
}

export function deriveTripBrief(
  trip: Trip,
  places: Place[],
  bookings: Booking[],
  threads: Thread[],
  documents: TravelDocument[],
  now: Date
): TripBriefView {
  const where = whereWeAre(places, now);
  const today = deriveToday(bookings, now, threads, places).now.map((line) => line.booking);

  const activePlaces = places.filter((place) => place.status === "active").sort((a, b) => a.ordinal - b.ordinal);
  const next = where ? activePlaces.find((place) => place.ordinal > where.ordinal) ?? null : (activePlaces[0] ?? null);

  const openThreads = threads.filter((thread) => thread.status === "open");

  const bookingCounts: Record<BookingStatus, number> = { confirmed: 0, waiting: 0, cancelled: 0 };
  for (const booking of activeBookings(bookings)) bookingCounts[booking.bookingStatus] += 1;

  const important = documents.filter((doc) => doc.status === "active" && doc.surfaceInBrief);

  return {
    trip,
    whereWeAre: where,
    today,
    next,
    openThreads: { count: openThreads.length, titles: openThreads.map((thread) => thread.title) },
    bookingCounts,
    important,
  };
}
