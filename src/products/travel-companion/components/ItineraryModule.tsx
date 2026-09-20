"use client";

import { useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { CalendarCheck } from "@/design-system/Icon";
import { deriveItinerary } from "../itinerary";
import type { BookingKind } from "../trip";
import BookingForm from "./BookingForm";
import ItineraryView, { dayLabel } from "./ItineraryView";
import TripStart from "./TripStart";
import { useTravelCompanion } from "./useTravelCompanion";

const KIND_LABEL: Record<BookingKind, string> = {
  flight: "Flight",
  train: "Train",
  car: "Car",
  transfer: "Transfer",
  hotel: "Hotel",
  rental: "Rental",
  activity: "Activity",
  restaurant: "Restaurant",
  event: "Event",
  other: "Other",
};

function rangeLabel(range: { from: string; to: string } | null): string | null {
  if (!range) return null;
  const format = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return range.from === range.to ? format(range.from) : `${format(range.from)} to ${format(range.to)}`;
}

/**
 * Itinerary: the whole trip on one line, derived from what was recorded.
 *
 * Also where a trip begins. With none, this is the same one-screen start
 * as Today, and finishing it lands here, so the first thing a new owner
 * sees is their trip, laid out, with a way to add something to each day.
 */
export default function ItineraryModule() {
  const travel = useTravelCompanion();
  const { status, errorMessage, instanceId, currentTrip, places, bookings, people, addTrip, addBooking, addParticipants } = travel;
  const [adding, setAdding] = useState<string | null>(null);
  const [making, setMaking] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return (
      <EmptyState
        icon={CalendarCheck}
        title="Nothing to show yet"
        description="This product has not been set up on your account."
      />
    );
  }
  if (status === "error") {
    return <EmptyState icon={CalendarCheck} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;
  if (!currentTrip) return <TripStart instanceId={instanceId} onCreated={addTrip} />;

  if (adding) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <BookingForm
          instanceId={instanceId}
          tripId={currentTrip.id}
          places={places}
          existingBookings={bookings}
          people={people}
          initialDate={adding}
          onAdded={(booking, participants) => {
            addBooking(booking);
            addParticipants(participants);
            setAdding(null);
          }}
          onCancel={() => setAdding(null)}
        />
      </div>
    );
  }

  const itinerary = deriveItinerary({ trip: currentTrip, bookings, places });
  const days = itinerary.days.map((day) => ({
    date: day.date,
    label: dayLabel(day.date),
    place: day.place,
    stops: day.stops,
  }));
  const range = rangeLabel(itinerary.range);

  async function print() {
    setMaking(true);
    setPrintError(null);
    try {
      const { downloadItinerary } = await import("../printables/download");
      await downloadItinerary({
        title: currentTrip!.title,
        rangeLabel: range,
        days,
        undated: itinerary.undated.map((booking) => ({ id: booking.id, title: booking.title, kindLabel: KIND_LABEL[booking.kind] })),
        size: /^en-(US|CA)/.test(navigator.language) ? "LETTER" : "A4",
      });
    } catch {
      // A failed generation must never look like a saved download.
      setPrintError("The itinerary could not be made. Nothing was downloaded.");
    } finally {
      setMaking(false);
    }
  }

  return (
    <>
      <ItineraryView
        tripTitle={currentTrip.title.toUpperCase()}
        rangeLabel={range}
        days={days}
        undated={itinerary.undated.map((booking) => ({ id: booking.id, title: booking.title, kindLabel: KIND_LABEL[booking.kind] }))}
        compact={itinerary.compact}
        onAdd={setAdding}
        actions={
          days.length > 0 && (
            <Button variant="secondary" size="sm" disabled={making} onClick={print}>
              {making ? "Preparing..." : "Save as PDF"}
            </Button>
          )
        }
      />
      {printError && <p className="mx-auto mt-3 w-full max-w-2xl text-[13px] text-[var(--danger)]">{printError}</p>}
    </>
  );
}
