import { timeLabel } from "./today";
import { BOOKING_KIND_INFO, type Booking, type BookingKind, type Person, type Place, type Trip } from "./trip";

/**
 * The trip on one card, for somebody who is not going.
 *
 * What a parent or a friend needs to know about a trip they are not on:
 * who is going, where, when, how they are getting there and where they are
 * staying. Nothing else. In particular it never carries a booking
 * reference, a note, a document, a passport detail or a traveller's
 * requirements, because a card handed to somebody, or left on a fridge, is
 * exactly where those must not be. What is left out is enforced by test,
 * and by the shape of the type: there is no field to put them in.
 *
 * Derived from what was recorded, never stored, and nothing added.
 */

export interface TripCard {
  title: string;
  /** "12 Oct to 16 Oct", or null when the trip has no dates. */
  rangeLabel: string | null;
  travellers: string[];
  destinations: { name: string; dates: string | null }[];
  getting: { id: string; label: string; when: string }[];
  staying: { id: string; title: string; dates: string; location: string | null }[];
}

/** Kinds that carry somebody from one place to another. */
const GETTING: BookingKind[] = ["flight", "train", "bus", "ferry", "cruise", "transfer"];
/** Kinds somebody sleeps in. */
const STAYING: BookingKind[] = ["hotel", "campsite"];

const dateOnly = (value: string) => value.slice(0, 10);
const isDate = (value: string | null | undefined): value is string => Boolean(value) && /^\d{4}-\d{2}-\d{2}/.test(value as string);

const short = (date: string) =>
  new Date(`${dateOnly(date)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const withDay = (date: string) =>
  new Date(`${dateOnly(date)}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function span(from: string | null, to: string | null): string | null {
  if (isDate(from) && isDate(to) && dateOnly(from) !== dateOnly(to)) return `${short(from)} to ${short(to)}`;
  if (isDate(from)) return short(from);
  if (isDate(to)) return short(to);
  return null;
}

export function deriveTripCard(input: {
  trip: Pick<Trip, "title" | "startsAt" | "endsAt">;
  people: Pick<Person, "name" | "isChild" | "status">[];
  places: Pick<Place, "name" | "ordinal" | "arrivesAt" | "departsAt" | "status">[];
  bookings: Pick<Booking, "id" | "kind" | "title" | "startsAt" | "endsAt" | "location" | "bookingStatus" | "status">[];
}): TripCard {
  const live = input.bookings.filter((b) => b.status === "active" && b.bookingStatus !== "cancelled");
  const byStart = (a: { startsAt: string | null }, b: { startsAt: string | null }) => (a.startsAt ?? "").localeCompare(b.startsAt ?? "");

  return {
    title: input.trip.title,
    rangeLabel: span(input.trip.startsAt, input.trip.endsAt),
    travellers: input.people.filter((p) => p.status === "active").map((p) => (p.isChild ? `${p.name} (child)` : p.name)),
    destinations: input.places
      .filter((place) => place.status === "active")
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((place) => ({ name: place.name, dates: span(place.arrivesAt, place.departsAt) })),
    getting: live
      .filter((b) => GETTING.includes(b.kind) && isDate(b.startsAt))
      .sort(byStart)
      .map((b) => ({
        id: b.id,
        label: `${BOOKING_KIND_INFO[b.kind].label}: ${b.title}`,
        when: `${withDay(b.startsAt as string)}, ${timeLabel(b.startsAt as string)}`,
      })),
    staying: live
      .filter((b) => STAYING.includes(b.kind) && isDate(b.startsAt))
      .sort(byStart)
      .map((b) => ({ id: b.id, title: b.title, dates: span(b.startsAt, b.endsAt) ?? "", location: b.location })),
  };
}
