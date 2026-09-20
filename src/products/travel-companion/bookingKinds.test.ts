import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BOOKING_KIND_INFO, BOOKING_KINDS, type Booking } from "./trip";
import { describeStop } from "./today";
import { deriveItinerary } from "./itinerary";
import { playbooksForBooking } from "./playbooks";
import { BOOKING_TYPES } from "./printables/bookContent";

const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

/** Every booking kind ever allowed by a migration, in the order the constraints were written. */
const migrationKinds = (file: string): string[] => {
  const sql = read(`supabase/migrations/${file}`);
  const list = sql.match(/kind in \(([\s\S]*?)\)/)![1];
  return [...list.matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
};

const booking = (over: Partial<Booking>): Booking =>
  ({ id: "b", tripId: "t", placeId: null, kind: "hotel", title: "Stay", provider: null, reference: null, startsAt: "2026-10-12T15:00:00.000Z", endsAt: "2026-10-14T11:00:00.000Z", location: null, bookingStatus: "confirmed", dependsOnBookingId: null, notes: null, status: "active", ...over }) as Booking;

describe("the kinds of booking", () => {
  it("are the same in the code and in the database constraint, so a kind cannot be offered that the database refuses", () => {
    expect(migrationKinds("202609200004_travel_companion_more_booking_kinds.sql").sort()).toEqual([...BOOKING_KINDS].sort());
  });

  it("only ever widened the constraint: everything the first migration allowed is still allowed", () => {
    const original = migrationKinds("202608250001_travel_companion_records.sql");
    for (const kind of original) expect(BOOKING_KINDS as readonly string[], kind).toContain(kind);
  });

  it("each have a label, and the four new ones are there", () => {
    for (const kind of BOOKING_KINDS) expect(BOOKING_KIND_INFO[kind].label.length, kind).toBeGreaterThan(0);
    for (const kind of ["bus", "ferry", "campsite", "cruise"]) expect(BOOKING_KINDS as readonly string[]).toContain(kind);
  });

  it("are offered in the printed book by the same names", () => {
    expect(BOOKING_TYPES).toEqual(BOOKING_KINDS.map((kind) => BOOKING_KIND_INFO[kind].label));
  });

  it("can each be opened into at least two of the situations, so nothing is left with nowhere to go when it goes wrong", () => {
    for (const kind of BOOKING_KINDS) expect(playbooksForBooking(kind).length, kind).toBeGreaterThanOrEqual(2);
    expect(playbooksForBooking("bus").some((playbook) => playbook.key.includes("transport"))).toBe(true);
    expect(playbooksForBooking("ferry").some((playbook) => playbook.key.includes("transport"))).toBe(true);
    expect(playbooksForBooking("campsite").some((playbook) => playbook.key.includes("hotel"))).toBe(true);
  });
});

describe("what a stay or a crossing says about its times", () => {
  it("says what the start time means for a stay, a campsite, a cruise and a rental, and nothing for a moment", () => {
    expect(describeStop(booking({ kind: "hotel" })).note).toBe("Check-in begins");
    expect(describeStop(booking({ kind: "campsite" })).note).toBe("Check-in begins");
    expect(describeStop(booking({ kind: "cruise" })).note).toBe("Boarding begins");
    expect(describeStop(booking({ kind: "rental" })).note).toBe("Pickup begins");
    for (const kind of ["flight", "train", "bus", "ferry"] as const) expect(describeStop(booking({ kind })).note, kind).toBeNull();
  });

  it("gives the itinerary a second stop on the day a stay, a campsite, a cruise or a rental ends, and none for a crossing", () => {
    const trip = { id: "t", title: "T", destinationSummary: null, startsAt: "2026-10-12", endsAt: "2026-10-14", status: "planning", createdAt: "" } as never;
    const notesOn = (kind: Booking["kind"]) =>
      deriveItinerary({ trip, bookings: [booking({ kind })], places: [] }).days.find((day) => day.date === "2026-10-14")!.stops.map((stop) => stop.note);
    expect(notesOn("hotel")).toEqual(["Check-out"]);
    expect(notesOn("campsite")).toEqual(["Check-out"]);
    expect(notesOn("cruise")).toEqual(["Disembark"]);
    expect(notesOn("rental")).toEqual(["Return"]);
    expect(notesOn("ferry")).toEqual([]);
    expect(notesOn("bus")).toEqual([]);
  });
});
