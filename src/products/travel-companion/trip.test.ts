import { describe, expect, it } from "vitest";
import { activeBookings, byStartTime, descendantsOf, wouldCreateCycle, type Booking } from "./trip";

const booking = (over: Partial<Booking> = {}): Booking => ({
  id: "b1",
  tripId: "t1",
  placeId: null,
  kind: "flight",
  title: "Flight",
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
});

describe("the tree, not a graph", () => {
  it("refuses a booking depending on itself", () => {
    expect(wouldCreateCycle([], "b1", "b1")).toBe(true);
  });

  it("refuses a two-node cycle: A depends on B, and B would depend on A", () => {
    const a = booking({ id: "a", dependsOnBookingId: "b" });
    const b = booking({ id: "b" });
    expect(wouldCreateCycle([a, b], "b", "a")).toBe(true);
  });

  it("refuses a longer cycle, not only the two-node case", () => {
    const a = booking({ id: "a", dependsOnBookingId: "c" });
    const b = booking({ id: "b", dependsOnBookingId: "a" });
    const c = booking({ id: "c", dependsOnBookingId: "b" });
    // c already depends on b depends on a depends on c: a real cycle.
    // Linking anything new into it must be refused, not extended.
    expect(wouldCreateCycle([a, b, c], "a", "c")).toBe(true);
  });

  it("allows a real, ordinary chain: flight, transfer, hotel", () => {
    const flight = booking({ id: "flight" });
    const transfer = booking({ id: "transfer", dependsOnBookingId: "flight" });
    expect(wouldCreateCycle([flight, transfer], "hotel", "transfer")).toBe(false);
  });

  it("allows fan out: one flight, two independent things depending on it", () => {
    const flight = booking({ id: "flight" });
    expect(wouldCreateCycle([flight], "transfer", "flight")).toBe(false);
    expect(wouldCreateCycle([flight], "dinner", "flight")).toBe(false);
  });
});

describe("descendantsOf: the whole of what-changed", () => {
  it("finds a straight chain, however many links deep", () => {
    const flight = booking({ id: "flight" });
    const arrival = booking({ id: "arrival", dependsOnBookingId: "flight" });
    const transfer = booking({ id: "transfer", dependsOnBookingId: "arrival" });
    const checkin = booking({ id: "checkin", dependsOnBookingId: "transfer" });
    const descendants = descendantsOf([flight, arrival, transfer, checkin], "flight").map((b) => b.id);
    expect(descendants).toEqual(["arrival", "transfer", "checkin"]);
  });

  it("finds every branch of a fan out, not just one", () => {
    const flight = booking({ id: "flight" });
    const transfer = booking({ id: "transfer", dependsOnBookingId: "flight" });
    const dinner = booking({ id: "dinner", dependsOnBookingId: "flight" });
    const descendants = descendantsOf([flight, transfer, dinner], "flight").map((b) => b.id);
    expect(descendants.sort()).toEqual(["dinner", "transfer"]);
  });

  it("never walks upward: changing the hotel does not surface the flight", () => {
    const flight = booking({ id: "flight" });
    const hotel = booking({ id: "hotel", dependsOnBookingId: "flight" });
    expect(descendantsOf([flight, hotel], "hotel")).toEqual([]);
  });

  it("is empty for a booking with nothing depending on it", () => {
    expect(descendantsOf([booking({ id: "solo" })], "solo")).toEqual([]);
  });

  it("ignores archived bookings, since an archived leg cannot still be affected", () => {
    const flight = booking({ id: "flight" });
    const cancelledTransfer = booking({ id: "transfer", dependsOnBookingId: "flight", status: "archived" });
    expect(descendantsOf([flight, cancelledTransfer], "flight")).toEqual([]);
  });
});

describe("activeBookings", () => {
  it("excludes archived bookings", () => {
    const kept = booking({ id: "kept" });
    const gone = booking({ id: "gone", status: "archived" });
    expect(activeBookings([kept, gone]).map((b) => b.id)).toEqual(["kept"]);
  });
});

describe("byStartTime", () => {
  it("orders chronologically", () => {
    const late = booking({ id: "late", startsAt: "2026-10-12T19:30:00Z" });
    const early = booking({ id: "early", startsAt: "2026-10-12T09:05:00Z" });
    expect(byStartTime([late, early]).map((b) => b.id)).toEqual(["early", "late"]);
  });

  it("puts undated bookings last, never first", () => {
    const dated = booking({ id: "dated", startsAt: "2026-10-12T09:05:00Z" });
    const undated = booking({ id: "undated", startsAt: null });
    expect(byStartTime([undated, dated]).map((b) => b.id)).toEqual(["dated", "undated"]);
  });
});
