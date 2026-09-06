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

  /**
   * The bug this whole timezone feature exists to fix. Two instants can
   * share a UTC calendar date while falling on different calendar dates
   * in the place they actually concern, and the old UTC-only comparison
   * got that silently wrong for any traveller not in UTC themselves.
   */
  describe("comparing 'today' in a place's own timezone", () => {
    const place = (over: Partial<Place> = {}): Place => ({
      id: "la",
      tripId: "t1",
      name: "Los Angeles",
      ordinal: 0,
      arrivesAt: null,
      departsAt: null,
      timezone: "America/Los_Angeles",
      status: "active",
      ...over,
    });

    it("keeps a booking out of now when it only shares a UTC day, not the place's own day", () => {
      const la = place();
      // Both instants fall on 15 Jan in UTC. In Los Angeles (UTC-8, no
      // DST in January) they fall on two different local days: 14 Jan
      // and 15 Jan. A UTC-only comparison would wrongly call this "now".
      const now = new Date("2026-01-15T07:00:00Z"); // LA local: 14 Jan, 23:00
      const tomorrow = booking({ startsAt: "2026-01-15T09:00:00Z", placeId: "la" }); // LA local: 15 Jan, 01:00
      const view = deriveToday([tomorrow], now, [], [la]);
      expect(view.now).toHaveLength(0);
      expect(view.later).toHaveLength(1);
    });

    it("still falls back to UTC for a booking with no place at all", () => {
      const now = new Date("2026-01-15T07:00:00Z");
      const noPlace = booking({ startsAt: "2026-01-15T09:00:00Z", placeId: null });
      const view = deriveToday([noPlace], now, [], []);
      // Same UTC day, no place to say otherwise: this is the documented,
      // honest fallback, not a regression.
      expect(view.now).toHaveLength(1);
    });

    it("still falls back to UTC for a place with no detected timezone", () => {
      const now = new Date("2026-01-15T07:00:00Z");
      const unknownPlace = place({ id: "unknown", timezone: null });
      const stillToday = booking({ startsAt: "2026-01-15T09:00:00Z", placeId: "unknown" });
      const view = deriveToday([stillToday], now, [], [unknownPlace]);
      expect(view.now).toHaveLength(1);
    });

    /**
     * Exactly the case that made the founder's original manual-offset
     * idea wrong: New York is UTC-5 in January and UTC-4 in June, and a
     * fixed offset can only ever be right for one of those. Looking the
     * zone up live (Intl against the IANA name) gets both right with the
     * same code, no seasonal special-casing.
     */
    it("resolves 'today' correctly on both sides of a DST boundary", () => {
      const newYork = place({ id: "ny", name: "New York", timezone: "America/New_York" });

      // Winter, EST (UTC-5). Local 15 Jan 23:00 and 23:30 New York.
      const winterNow = new Date("2026-01-16T04:00:00Z");
      const winterBooking = booking({ startsAt: "2026-01-16T04:30:00Z", placeId: "ny" });
      expect(deriveToday([winterBooking], winterNow, [], [newYork]).now).toHaveLength(1);

      // Summer, EDT (UTC-4). Local 16 June 01:00 and 00:15 New York. A
      // fixed -5 offset would read the booking as 15 June 23:15, a
      // different calendar day, and wrongly drop it out of "now".
      const summerNow = new Date("2026-06-16T05:00:00Z");
      const summerBooking = booking({ startsAt: "2026-06-16T04:15:00Z", placeId: "ny" });
      expect(deriveToday([summerBooking], summerNow, [], [newYork]).now).toHaveLength(1);
    });
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
    timezone: null,
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

  it("computes 'today' in the place's own timezone, not UTC", () => {
    // 23:30 UTC on 13 Oct is already 08:30 on 14 Oct in Tokyo (UTC+9).
    // A UTC-only "today" would still say 13 Oct and miss an arrival
    // recorded for 14 Oct.
    const almostMidnightUtc = new Date("2026-10-13T23:30:00Z");
    const tokyo = place({ name: "Tokyo", timezone: "Asia/Tokyo", arrivesAt: "2026-10-14", departsAt: "2026-10-18" });
    expect(whereWeAre([tokyo], almostMidnightUtc)?.name).toBe("Tokyo");
  });

  it("judges two places against their own separate timezones in the same call", () => {
    const now = new Date("2026-10-13T23:30:00Z");
    // Still 13 Oct in Los Angeles (UTC-7 in October, PDT) at this instant,
    // so an LA stay starting 14 Oct has not begun yet by LA's own clock.
    const losAngeles = place({ id: "la", name: "Los Angeles", timezone: "America/Los_Angeles", arrivesAt: "2026-10-14", departsAt: "2026-10-20" });
    // Already 14 Oct in Tokyo at the same instant, so a Tokyo stay
    // starting 14 Oct has begun.
    const tokyo = place({ id: "tokyo", name: "Tokyo", timezone: "Asia/Tokyo", arrivesAt: "2026-10-14", departsAt: "2026-10-18" });
    expect(whereWeAre([losAngeles, tokyo], now)?.name).toBe("Tokyo");
  });
});
