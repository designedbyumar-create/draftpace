import { describe, expect, it } from "vitest";
import { deriveItinerary, FULL_DAYS_LIMIT } from "./itinerary";
import type { Booking, Place, Trip } from "./trip";

const trip = (over: Partial<Trip> = {}): Trip =>
  ({ id: "t", title: "Lisbon and Porto", destinationSummary: null, startsAt: "2026-10-12", endsAt: "2026-10-15", status: "planning", createdAt: "2026-09-01", ...over }) as Trip;

const booking = (over: Partial<Booking>): Booking =>
  ({
    id: "b",
    tripId: "t",
    placeId: null,
    kind: "activity",
    title: "Thing",
    provider: null,
    reference: null,
    startsAt: null,
    endsAt: null,
    location: null,
    bookingStatus: "confirmed",
    dependsOnBookingId: null,
    notes: null,
    status: "active",
    ...over,
  }) as Booking;

const place = (over: Partial<Place>): Place =>
  ({ id: "p", tripId: "t", name: "Lisbon", ordinal: 0, arrivesAt: "2026-10-12", departsAt: "2026-10-13", timezone: null, status: "active", ...over }) as Place;

const derive = (bookings: Booking[], places: Place[] = [], t: Trip = trip()) => deriveItinerary({ trip: t, bookings, places });

describe("the whole trip, day by day", () => {
  it("lays out every day from the trip's first date to its last, including days with nothing on them", () => {
    const result = derive([booking({ id: "a", startsAt: "2026-10-13T09:40:00.000Z", title: "Train to Porto" })]);
    expect(result.days.map((day) => day.date)).toEqual(["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"]);
    expect(result.days[0].stops).toEqual([]);
    expect(result.days[1].stops[0]).toMatchObject({ time: "09:40", title: "Train to Porto" });
  });

  it("puts a booking on the day that was typed, never on a day a timezone would move it to", () => {
    const result = derive([booking({ id: "late", startsAt: "2026-10-13T23:30:00.000Z", title: "Late arrival" })], [
      place({ name: "Tokyo", arrivesAt: "2026-10-12", departsAt: "2026-10-15", timezone: "Asia/Tokyo" }),
    ]);
    expect(result.days.find((day) => day.date === "2026-10-13")?.stops.map((s) => s.title)).toEqual(["Late arrival"]);
    expect(result.days.find((day) => day.date === "2026-10-14")?.stops).toEqual([]);
  });

  it("orders a day by time, and puts something with no time after everything that has one", () => {
    const result = derive([
      booking({ id: "c", startsAt: "2026-10-12T20:30:00.000Z", title: "Dinner" }),
      booking({ id: "a", startsAt: "2026-10-12T09:00:00.000Z", title: "Train" }),
      booking({ id: "b", startsAt: "2026-10-12T12:15:00.000Z", title: "Lunch" }),
    ]);
    expect(result.days[0].stops.map((s) => s.title)).toEqual(["Train", "Lunch", "Dinner"]);
  });

  it("leaves out cancelled and archived bookings, and flags one that is still awaiting confirmation", () => {
    const result = derive([
      booking({ id: "x", startsAt: "2026-10-12T10:00:00.000Z", title: "Cancelled", bookingStatus: "cancelled" }),
      booking({ id: "y", startsAt: "2026-10-12T10:00:00.000Z", title: "Archived", status: "archived" }),
      booking({ id: "z", startsAt: "2026-10-12T11:00:00.000Z", title: "Waiting", bookingStatus: "waiting" }),
    ]);
    expect(result.days[0].stops.map((s) => [s.title, s.awaiting])).toEqual([["Waiting", true]]);
  });

  it("gives a hotel a second stop on the day it ends, and a rental car its return, and nothing else", () => {
    const result = derive([
      booking({ id: "h", kind: "hotel", title: "Hotel Avenida", startsAt: "2026-10-12T15:00:00.000Z", endsAt: "2026-10-14T11:00:00.000Z" }),
      booking({ id: "r", kind: "rental", title: "Rental car", startsAt: "2026-10-13T10:00:00.000Z", endsAt: "2026-10-15T17:00:00.000Z" }),
      booking({ id: "f", kind: "flight", title: "Flight", startsAt: "2026-10-12T07:00:00.000Z", endsAt: "2026-10-12T09:00:00.000Z" }),
    ]);
    const day = (date: string) => result.days.find((d) => d.date === date)!.stops.map((s) => `${s.time} ${s.title} ${s.note ?? ""}`.trim());
    expect(day("2026-10-14")).toEqual(["11:00 Hotel Avenida Check-out"]);
    expect(day("2026-10-15")).toEqual(["17:00 Rental car Return"]);
    expect(day("2026-10-12")).toEqual(["07:00 Flight", "15:00 Hotel Avenida Check-in begins"]);
  });

  it("keeps a booking with no time in its own list, so it is not silently dropped or given a day", () => {
    const result = derive([booking({ id: "n", title: "Insurance cover", startsAt: null })]);
    expect(result.undated).toEqual([{ id: "n", title: "Insurance cover", kind: "activity" }]);
    expect(result.days.every((day) => day.stops.length === 0)).toBe(true);
  });

  it("says where the person is each day from the destinations' own dates, and nothing when none covers it", () => {
    const result = derive([], [
      place({ id: "1", name: "Lisbon", ordinal: 0, arrivesAt: "2026-10-12", departsAt: "2026-10-13" }),
      place({ id: "2", name: "Porto", ordinal: 1, arrivesAt: "2026-10-14", departsAt: "2026-10-15" }),
    ]);
    expect(result.days.map((day) => day.place)).toEqual(["Lisbon", "Lisbon", "Porto", "Porto"]);
    expect(derive([], [place({ arrivesAt: null, departsAt: null })]).days.every((day) => day.place === null)).toBe(true);
  });

  it("builds the range from its bookings when the trip has no dates, and is empty when nothing is dated at all", () => {
    const noDates = trip({ startsAt: null, endsAt: null });
    const fromBookings = derive([booking({ startsAt: "2026-11-03T10:00:00.000Z" }), booking({ id: "b2", startsAt: "2026-11-05T10:00:00.000Z" })], [], noDates);
    expect(fromBookings.range).toEqual({ from: "2026-11-03", to: "2026-11-05" });
    expect(fromBookings.days).toHaveLength(3);
    expect(derive([], [], noDates)).toMatchObject({ days: [], range: null });
  });

  it("stretches the range to include a booking that falls outside the trip's own dates", () => {
    const result = derive([booking({ startsAt: "2026-10-18T10:00:00.000Z" })]);
    expect(result.range).toEqual({ from: "2026-10-12", to: "2026-10-18" });
  });

  it("shows only the days that have something on them for a very long trip, and says so", () => {
    const long = trip({ startsAt: "2026-01-01", endsAt: "2026-12-31" });
    const result = derive([booking({ startsAt: "2026-06-10T10:00:00.000Z" })], [], long);
    expect(result.compact).toBe(true);
    expect(result.days.map((day) => day.date)).toEqual(["2026-01-01", "2026-06-10", "2026-12-31"]);
    expect(derive([], [], trip()).compact).toBe(false);
    expect(FULL_DAYS_LIMIT).toBeGreaterThan(30);
  });
});
