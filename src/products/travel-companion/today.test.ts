import { describe, expect, it } from "vitest";
import { deriveToday, whereWeAre } from "./today";
import type { Booking, Place, Thread } from "./trip";

const NOW = new Date("2026-10-12T08:00:00Z");

const booking = (over: Partial<Booking> = {}): Booking => ({
  id: "b1",
  tripId: "t1",
  placeId: null,
  kind: "activity",
  title: "Kyoto National Museum",
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

describe("deriveToday", () => {
  it("is quiet with nothing stored, and means it", () => {
    expect(deriveToday([], NOW).quiet).toBe(true);
  });

  it("puts a booking starting today under now", () => {
    const view = deriveToday([booking({ startsAt: "2026-10-12T14:00:00Z" })], NOW);
    expect(view.quiet).toBe(false);
    expect(view.now).toHaveLength(1);
    expect(view.now[0].line).toContain("Kyoto National Museum");
  });

  it("states the stored fact, never an imperative", () => {
    const view = deriveToday([booking({ startsAt: "2026-10-12T14:00:00Z" })], NOW);
    expect(view.now[0].line).not.toMatch(/don't forget|remember to|make sure/i);
  });

  /**
   * The brief's own example, almost verbatim: "Hotel check-in begins at
   * 3 PM" is the stored fact read back, not a reminder invented about
   * it.
   */
  it("reads a tomorrow hotel check-in as an important line, in the brief's own words", () => {
    const tomorrow = booking({ kind: "hotel", title: "Hotel X", startsAt: "2026-10-13T15:00:00Z" });
    const view = deriveToday([tomorrow], NOW);
    expect(view.important).toHaveLength(1);
    expect(view.important[0].line).toBe("Hotel X. Check-in begins at 15:00.");
  });

  it("does not treat every tomorrow booking as important, only a check-in window kind", () => {
    const tomorrowDinner = booking({ kind: "restaurant", startsAt: "2026-10-13T19:30:00Z" });
    const view = deriveToday([tomorrowDinner], NOW);
    expect(view.important).toHaveLength(0);
    expect(view.later).toHaveLength(1);
  });

  it("collapses later bookings to one line each, tomorrow and the day after only", () => {
    const tomorrow = booking({ id: "t", startsAt: "2026-10-13T11:00:00Z", title: "Return rental car" });
    const dayAfter = booking({ id: "d", startsAt: "2026-10-14T09:00:00Z", title: "Train to Ankara" });
    const view = deriveToday([tomorrow, dayAfter], NOW);
    expect(view.later[0].line).toBe("Tomorrow: Return rental car, 11:00.");
    expect(view.later[1].line).toBe("In two days: Train to Ankara, 09:00.");
  });

  it("never surfaces a booking three or more days out", () => {
    const farOff = booking({ startsAt: "2026-10-20T09:00:00Z" });
    expect(deriveToday([farOff], NOW).quiet).toBe(true);
  });

  it("ignores an archived booking entirely", () => {
    const cancelled = booking({ startsAt: "2026-10-12T14:00:00Z", status: "archived" });
    expect(deriveToday([cancelled], NOW).quiet).toBe(true);
  });

  it("ignores a booking with no stored time, rather than guessing where it belongs", () => {
    const undated = booking({ startsAt: null });
    expect(deriveToday([undated], NOW).quiet).toBe(true);
  });

  it("orders today's bookings chronologically", () => {
    const late = booking({ id: "late", startsAt: "2026-10-12T19:30:00Z", title: "Dinner" });
    const early = booking({ id: "early", startsAt: "2026-10-12T09:05:00Z", title: "Shinkansen" });
    const view = deriveToday([late, early], NOW);
    expect(view.now.map((l) => l.booking.id)).toEqual(["early", "late"]);
  });

  const thread = (over: Partial<Thread> = {}): Thread => ({
    id: "th1",
    tripId: "t1",
    bookingId: null,
    personId: null,
    title: "Waiting on the hotel manager",
    whoIsInvolved: null,
    expectedBy: null,
    status: "open",
    createdAt: "2026-10-12T08:00:00Z",
    resolvedAt: null,
    ...over,
  });

  describe("waiting", () => {
    it("always shows an open thread with no booking behind it", () => {
      const view = deriveToday([], NOW, [thread()]);
      expect(view.waiting).toHaveLength(1);
      expect(view.waiting[0].line).toBe("Waiting on the hotel manager");
      expect(view.quiet).toBe(false);
    });

    it("never shows a resolved thread", () => {
      const view = deriveToday([], NOW, [thread({ status: "resolved" })]);
      expect(view.waiting).toHaveLength(0);
    });

    it("shows a booking-linked thread while the booking is within the horizon", () => {
      const soon = booking({ id: "b1", startsAt: "2026-10-12T14:00:00Z" });
      const view = deriveToday([soon], NOW, [thread({ bookingId: "b1" })]);
      expect(view.waiting).toHaveLength(1);
    });

    it("stops showing a booking-linked thread once the booking falls out of the horizon", () => {
      const farOff = booking({ id: "b1", startsAt: "2026-10-20T14:00:00Z" });
      const view = deriveToday([farOff], NOW, [thread({ bookingId: "b1" })]);
      expect(view.waiting).toHaveLength(0);
    });

    it("hides a booking-linked thread when the booking has no stored time to judge a horizon by", () => {
      const undated = booking({ id: "b1", startsAt: null });
      const view = deriveToday([undated], NOW, [thread({ bookingId: "b1" })]);
      expect(view.waiting).toHaveLength(0);
    });
  });
});

describe("whereWeAre", () => {
  const place = (over: Partial<Place> = {}): Place => ({
    id: "p1",
    tripId: "t1",
    name: "Kyoto",
    ordinal: 0,
    arrivesAt: null,
    departsAt: null,
    status: "active",
    ...over,
  });

  it("finds the place whose stay spans today", () => {
    const kyoto = place({ arrivesAt: "2026-10-10", departsAt: "2026-10-14" });
    expect(whereWeAre([kyoto], NOW)?.name).toBe("Kyoto");
  });

  it("is null when no place's dates span today", () => {
    const osaka = place({ name: "Osaka", arrivesAt: "2026-10-14", departsAt: "2026-10-18" });
    expect(whereWeAre([osaka], NOW)).toBeNull();
  });

  it("ignores an archived place", () => {
    const kyoto = place({ arrivesAt: "2026-10-10", departsAt: "2026-10-14", status: "archived" });
    expect(whereWeAre([kyoto], NOW)).toBeNull();
  });
});
