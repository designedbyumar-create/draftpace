import { describe, expect, it } from "vitest";
import { applyOutcome } from "./outcome";
import type { Booking } from "./trip";

const NOW = new Date("2026-10-12T08:00:00Z");

const booking = (over: Partial<Booking> = {}): Booking => ({
  id: "b1",
  tripId: "t1",
  placeId: null,
  kind: "hotel",
  title: "Hotel X",
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

describe("applyOutcome", () => {
  it("marks a resolved booking confirmed and notes that it was sorted", () => {
    const effect = applyOutcome(booking({ bookingStatus: "waiting" }), { outcome: "resolved", detail: null, now: NOW });
    expect(effect.patch.bookingStatus).toBe("confirmed");
    expect(effect.patch.notes).toBe("Sorted.");
  });

  it("appends to existing notes rather than overwriting them", () => {
    const effect = applyOutcome(booking({ notes: "Called once already." }), { outcome: "resolved", detail: null, now: NOW });
    expect(effect.patch.notes).toBe("Called once already.\nSorted.");
  });

  it("records progress in the traveller's own words", () => {
    const effect = applyOutcome(booking(), { outcome: "progress", detail: "Spoke to the front desk, waiting on the manager", now: NOW });
    expect(effect.patch.notes).toContain("Spoke to the front desk");
    expect(effect.patch.bookingStatus).toBeUndefined();
  });

  it("marks waiting and records who, moving the booking to waiting status", () => {
    const effect = applyOutcome(booking(), { outcome: "waiting", detail: "the hotel manager", now: NOW });
    expect(effect.patch.bookingStatus).toBe("waiting");
    expect(effect.patch.notes).toContain("Waiting on the hotel manager");
  });

  it("records a next step without changing the booking's status", () => {
    const effect = applyOutcome(booking(), { outcome: "next-step", detail: "Email the confirmation screenshot", now: NOW });
    expect(effect.patch.notes).toContain("Email the confirmation screenshot");
    expect(effect.patch.bookingStatus).toBeUndefined();
  });

  /**
   * The rule that matters most, carried over from Alongside rather than
   * reinvented: a booking problem nobody got to today is not a booking
   * that failed. No status, no note, no timestamp.
   */
  it("changes absolutely nothing when they did not get to it", () => {
    const original = booking({ notes: "Existing note", bookingStatus: "confirmed" });
    const effect = applyOutcome(original, { outcome: "not-yet", detail: null, now: NOW });
    expect(effect.patch).toEqual({});
  });

  it("records something else in the traveller's own words", () => {
    const effect = applyOutcome(booking(), { outcome: "other", detail: "Turned out to be a duplicate booking", now: NOW });
    expect(effect.patch.notes).toContain("duplicate booking");
  });

  it("never invents a note when there is no detail to record", () => {
    for (const outcome of ["progress", "next-step", "other"] as const) {
      const effect = applyOutcome(booking(), { outcome, detail: null, now: NOW });
      expect(effect.patch).toEqual({});
    }
  });

  describe("the thread instruction", () => {
    it("opens a thread when waiting, titled with who or what is being waited on", () => {
      const effect = applyOutcome(booking(), { outcome: "waiting", detail: "the hotel manager", now: NOW });
      expect(effect.thread).toEqual({ kind: "open", title: "Waiting on the hotel manager" });
    });

    it("still opens a thread when waiting with no detail given, never leaving it untitled", () => {
      const effect = applyOutcome(booking(), { outcome: "waiting", detail: null, now: NOW });
      expect(effect.thread?.kind).toBe("open");
      expect((effect.thread as { title: string }).title.length).toBeGreaterThan(0);
    });

    it("instructs a resolve when resolved, for the domain layer to act on only if a thread is actually open", () => {
      const effect = applyOutcome(booking(), { outcome: "resolved", detail: null, now: NOW });
      expect(effect.thread).toEqual({ kind: "resolve", closingLine: "Sorted." });
    });

    it("never touches a thread for progress, next-step, not-yet, or other", () => {
      for (const outcome of ["progress", "next-step", "not-yet", "other"] as const) {
        const effect = applyOutcome(booking(), { outcome, detail: "some detail", now: NOW });
        expect(effect.thread, outcome).toBeNull();
      }
    });
  });
});
