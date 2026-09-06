import { describe, expect, it } from "vitest";
import { deriveTripBrief } from "./tripBrief";
import type { Booking, Place, Thread, TravelDocument, Trip } from "./trip";

const NOW = new Date("2026-10-12T08:00:00Z");

const trip: Trip = {
  id: "t1",
  title: "Japan",
  destinationSummary: null,
  startsAt: "2026-10-08",
  endsAt: "2026-10-21",
  status: "active",
  createdAt: "2026-08-01T00:00:00Z",
};

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

const document = (over: Partial<TravelDocument> = {}): TravelDocument => ({
  id: "d1",
  tripId: "t1",
  personId: null,
  bookingId: null,
  kind: "passport",
  label: "A passport",
  keptWhere: null,
  surfaceInBrief: false,
  status: "active",
  ...over,
});

describe("deriveTripBrief", () => {
  it("finds where we are from the place spanning today, same as whereWeAre", () => {
    const kyoto = place({ arrivesAt: "2026-10-10", departsAt: "2026-10-14" });
    const brief = deriveTripBrief(trip, [kyoto], [], [], [], NOW);
    expect(brief.whereWeAre?.name).toBe("Kyoto");
  });

  it("reads today from the exact same deriveToday the Today screen uses", () => {
    const todaysBooking = booking({ startsAt: "2026-10-12T14:00:00Z" });
    const brief = deriveTripBrief(trip, [], [todaysBooking], [], [], NOW);
    expect(brief.today.map((b) => b.id)).toEqual(["b1"]);
  });

  it("picks the next place by ordinal after where we are", () => {
    const kyoto = place({ id: "p1", name: "Kyoto", ordinal: 0, arrivesAt: "2026-10-10", departsAt: "2026-10-14" });
    const osaka = place({ id: "p2", name: "Osaka", ordinal: 1 });
    const brief = deriveTripBrief(trip, [kyoto, osaka], [], [], [], NOW);
    expect(brief.next?.name).toBe("Osaka");
  });

  it("falls back to the first active place when nowhere spans today yet", () => {
    const notYetHere = place({ ordinal: 0, arrivesAt: "2026-11-01", departsAt: "2026-11-05" });
    const brief = deriveTripBrief(trip, [notYetHere], [], [], [], NOW);
    expect(brief.whereWeAre).toBeNull();
    expect(brief.next?.id).toBe(notYetHere.id);
  });

  it("counts and titles open threads, ignoring resolved ones", () => {
    const open = thread({ id: "open1", title: "Waiting on the airline" });
    const resolved = thread({ id: "resolved1", title: "Sorted already", status: "resolved" });
    const brief = deriveTripBrief(trip, [], [], [open, resolved], [], NOW);
    expect(brief.openThreads).toEqual({ count: 1, titles: ["Waiting on the airline"] });
  });

  it("counts active bookings by status", () => {
    const bookings = [
      booking({ id: "b1", bookingStatus: "confirmed" }),
      booking({ id: "b2", bookingStatus: "confirmed" }),
      booking({ id: "b3", bookingStatus: "waiting" }),
      booking({ id: "b4", bookingStatus: "cancelled" }),
      booking({ id: "b5", bookingStatus: "confirmed", status: "archived" }),
    ];
    const brief = deriveTripBrief(trip, [], bookings, [], [], NOW);
    expect(brief.bookingCounts).toEqual({ confirmed: 2, waiting: 1, cancelled: 1 });
  });

  it("surfaces only documents flagged for the brief, never every document", () => {
    const flagged = document({ id: "d1", label: "Minha's passport", surfaceInBrief: true });
    const unflagged = document({ id: "d2", label: "A random receipt", surfaceInBrief: false });
    const brief = deriveTripBrief(trip, [], [], [], [flagged, unflagged], NOW);
    expect(brief.important.map((d) => d.id)).toEqual(["d1"]);
  });

  it("never surfaces an archived document even if flagged", () => {
    const archived = document({ surfaceInBrief: true, status: "archived" });
    const brief = deriveTripBrief(trip, [], [], [], [archived], NOW);
    expect(brief.important).toHaveLength(0);
  });
});
