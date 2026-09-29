import { timeLabel } from "./today";
import { BOOKING_KIND_INFO, type Booking, type Person, type Place, type RecordEntry, type Trip, type TravelDocument } from "./trip";

/**
 * A concluded trip, as a printable record: everything the trip page
 * itself shows, laid out to hand to someone or keep. Unlike TripCard,
 * which deliberately leaves out references, notes and documents for
 * something left on a fridge, this is the fuller record, the one a
 * trip earns once it is done, so it carries the reference numbers,
 * the document registry and the dated log.
 *
 * Derived from what was recorded, never stored, and nothing added.
 */

export interface TripRecord {
  title: string;
  statusLabel: string;
  rangeLabel: string | null;
  destinationSummary: string | null;
  memoryNote: string | null;
  memoryLink: string | null;
  travellers: { name: string; relationshipNote: string | null }[];
  destinations: { name: string; dates: string | null }[];
  bookings: { id: string; kindLabel: string; title: string; when: string | null; provider: string | null; reference: string | null; statusLabel: string }[];
  documents: { id: string; kindLabel: string; label: string; keptWhere: string | null }[];
  record: { id: string; date: string; body: string; placeName: string | null }[];
}

const dateOnly = (value: string) => value.slice(0, 10);
const isDate = (value: string | null | undefined): value is string => Boolean(value) && /^\d{4}-\d{2}-\d{2}/.test(value as string);

const short = (date: string) =>
  new Date(`${dateOnly(date)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function span(from: string | null, to: string | null): string | null {
  if (isDate(from) && isDate(to) && dateOnly(from) !== dateOnly(to)) return `${short(from)} to ${short(to)}`;
  if (isDate(from)) return short(from);
  if (isDate(to)) return short(to);
  return null;
}

const BOOKING_STATUS_LABEL: Record<Booking["bookingStatus"], string> = {
  confirmed: "Confirmed",
  waiting: "Awaiting confirmation",
  cancelled: "Cancelled",
};

const DOCUMENT_KIND_LABEL: Record<TravelDocument["kind"], string> = {
  passport: "Passport",
  visa: "Visa",
  insurance: "Insurance",
  confirmation: "Confirmation",
  ticket: "Ticket",
  agreement: "Agreement",
  other: "Other",
};

const STATUS_LABEL: Record<Trip["status"], string> = {
  planning: "Planning",
  active: "Active",
  past: "Past",
  archived: "Archived",
};

export function deriveTripRecord(input: {
  trip: Trip;
  people: Pick<Person, "id" | "name" | "relationshipNote" | "status">[];
  places: Pick<Place, "id" | "name" | "ordinal" | "arrivesAt" | "departsAt" | "status">[];
  bookings: Pick<Booking, "id" | "kind" | "title" | "startsAt" | "provider" | "reference" | "bookingStatus" | "status">[];
  documents: Pick<TravelDocument, "id" | "kind" | "label" | "keptWhere" | "status">[];
  recordEntries: RecordEntry[];
}): TripRecord {
  return {
    title: input.trip.title,
    statusLabel: STATUS_LABEL[input.trip.status],
    rangeLabel: span(input.trip.startsAt, input.trip.endsAt),
    destinationSummary: input.trip.destinationSummary,
    memoryNote: input.trip.memoryNote,
    memoryLink: input.trip.memoryLink,
    travellers: input.people
      .filter((p) => p.status === "active")
      .map((p) => ({ name: p.name, relationshipNote: p.relationshipNote })),
    destinations: input.places
      .filter((place) => place.status === "active")
      .sort((a, b) => a.ordinal - b.ordinal)
      .map((place) => ({ name: place.name, dates: span(place.arrivesAt, place.departsAt) })),
    bookings: input.bookings
      .filter((b) => b.status === "active")
      .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""))
      .map((b) => ({
        id: b.id,
        kindLabel: BOOKING_KIND_INFO[b.kind].label,
        title: b.title,
        when: isDate(b.startsAt) ? `${short(b.startsAt)}, ${timeLabel(b.startsAt)}` : null,
        provider: b.provider,
        reference: b.reference,
        statusLabel: BOOKING_STATUS_LABEL[b.bookingStatus],
      })),
    documents: input.documents
      .filter((d) => d.status === "active")
      .map((d) => ({ id: d.id, kindLabel: DOCUMENT_KIND_LABEL[d.kind], label: d.label, keptWhere: d.keptWhere })),
    record: [...input.recordEntries]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((entry) => ({ id: entry.id, date: short(dateOnly(entry.createdAt)), body: entry.body, placeName: entry.placeName })),
  };
}
