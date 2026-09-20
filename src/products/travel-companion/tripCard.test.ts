import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deriveTripCard } from "./tripCard";

const trip = { title: "Lisbon and Porto", startsAt: "2026-10-12", endsAt: "2026-10-16" };
const people = [
  { name: "Amir", isChild: false, status: "active" as const, requirements: "SECRET-REQUIREMENT peanut allergy", relationshipNote: "SECRET-NOTE" },
  { name: "Noor", isChild: true, status: "active" as const },
  { name: "Gone", isChild: false, status: "archived" as const },
];
const places = [
  { name: "Porto", ordinal: 1, arrivesAt: "2026-10-14", departsAt: "2026-10-16", status: "active" as const },
  { name: "Lisbon", ordinal: 0, arrivesAt: "2026-10-12", departsAt: "2026-10-14", status: "active" as const },
];
const b = (over: Record<string, unknown>) => ({
  id: "b",
  kind: "flight",
  title: "TP 1932",
  startsAt: "2026-10-12T07:25:00.000Z",
  endsAt: null,
  location: null,
  bookingStatus: "confirmed",
  status: "active",
  reference: "SECRET-REF-ABC123",
  notes: "SECRET-BOOKING-NOTE",
  provider: "SECRET-PROVIDER",
  ...over,
});
const bookings = [
  b({ id: "f2", kind: "train", title: "Porto to Lisbon", startsAt: "2026-10-16T09:00:00.000Z" }),
  b({ id: "f1" }),
  b({ id: "h", kind: "hotel", title: "Hotel Avenida Palace", startsAt: "2026-10-12T15:00:00.000Z", endsAt: "2026-10-14T11:00:00.000Z", location: "Rua do Ouro 1, Lisbon" }),
  b({ id: "x", kind: "restaurant", title: "Dinner" }),
  b({ id: "c", kind: "flight", title: "Cancelled flight", bookingStatus: "cancelled" }),
  b({ id: "u", kind: "flight", title: "No time yet", startsAt: null }),
];
const card = deriveTripCard({ trip, people, places, bookings: bookings as never });

describe("the trip card", () => {
  it("says who is going, where and when, how they are getting there and where they are staying", () => {
    expect(card.title).toBe("Lisbon and Porto");
    expect(card.rangeLabel).toBe("12 Oct to 16 Oct");
    expect(card.travellers).toEqual(["Amir", "Noor (child)"]);
    expect(card.destinations).toEqual([
      { name: "Lisbon", dates: "12 Oct to 14 Oct" },
      { name: "Porto", dates: "14 Oct to 16 Oct" },
    ]);
    expect(card.getting.map((leg) => [leg.label, leg.when])).toEqual([
      ["Flight: TP 1932", "Mon 12 Oct, 07:25"],
      ["Train: Porto to Lisbon", "Fri 16 Oct, 09:00"],
    ]);
    expect(card.staying).toEqual([{ id: "h", title: "Hotel Avenida Palace", dates: "12 Oct to 14 Oct", location: "Rua do Ouro 1, Lisbon" }]);
  });

  it("leaves out a cancelled booking, an undated one, an archived traveller, and a restaurant", () => {
    const text = JSON.stringify(card);
    expect(text).not.toContain("Cancelled flight");
    expect(text).not.toContain("No time yet");
    expect(text).not.toContain("Gone");
    expect(text).not.toContain("Dinner");
  });

  it("never carries a reference, a note, a provider, a traveller's requirements or a document, even when they were recorded", () => {
    const text = JSON.stringify(card);
    for (const secret of ["SECRET-REF", "SECRET-BOOKING-NOTE", "SECRET-PROVIDER", "SECRET-REQUIREMENT", "SECRET-NOTE", "peanut"]) {
      expect(text, secret).not.toContain(secret);
    }
  });

  it("has no field a secret could be put in, and the printed page never reads documents", () => {
    expect(Object.keys(card).sort()).toEqual(["destinations", "getting", "rangeLabel", "staying", "title", "travellers"]);
    const pdf = readFileSync(join(__dirname, "printables/tripCard.tsx"), "utf8");
    expect(pdf).not.toMatch(/\.reference|\.notes|\.provider|\.requirements|TravelDocument|keptWhere/);
  });

  it("copes with a trip that has almost nothing recorded", () => {
    const bare = deriveTripCard({ trip: { title: "Somewhere", startsAt: null, endsAt: null }, people: [], places: [], bookings: [] });
    expect(bare).toEqual({ title: "Somewhere", rangeLabel: null, travellers: [], destinations: [], getting: [], staying: [] });
  });
});
