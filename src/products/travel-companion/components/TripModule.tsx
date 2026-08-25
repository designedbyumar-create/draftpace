"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Globe, Plus } from "@/design-system/Icon";
import { byStartTime } from "../trip";
import { useTravelCompanion } from "./useTravelCompanion";
import TripSetupForm from "./TripSetupForm";
import PlaceForm from "./PlaceForm";
import BookingForm from "./BookingForm";

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * Trip.
 *
 * The whole connected trip: destinations, and the bookings anchored to
 * them, each showing the one relationship the product is built around,
 * what it depends on, when there is one, rather than a flat list of
 * reservations with no memory of how they fit together.
 */
export default function TripModule() {
  const {
    status,
    errorMessage,
    instanceId,
    trips,
    currentTrip,
    places,
    bookings,
    people,
    participants,
    addTrip,
    addPlace,
    addBooking,
    addParticipants,
  } = useTravelCompanion();
  const [settingUp, setSettingUp] = useState(false);
  const [addingPlace, setAddingPlace] = useState(false);
  const [addingBooking, setAddingBooking] = useState(false);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Globe} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Globe} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  if (!currentTrip) {
    if (settingUp) {
      return (
        <div className="mx-auto w-full max-w-2xl">
          <TripSetupForm instanceId={instanceId} onCreated={addTrip} onCancel={() => setSettingUp(false)} />
        </div>
      );
    }
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trip</p>
        </header>
        <EmptyState
          icon={Globe}
          title={trips.length === 0 ? "No trip yet" : "Nothing currently in progress"}
          description="Set up a trip to start connecting the people, places and bookings it depends on."
          action={
            <button type="button" onClick={() => setSettingUp(true)} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
              Set up a trip
            </button>
          }
        />
      </div>
    );
  }

  const byId = new Map(bookings.map((booking) => [booking.id, booking]));
  const participantsByBooking = new Map<string, string[]>();
  for (const link of participants) {
    const names = participantsByBooking.get(link.bookingId) ?? [];
    const person = people.find((p) => p.id === link.personId);
    if (person) names.push(person.name);
    participantsByBooking.set(link.bookingId, names);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-7">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Trip</p>
        <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {currentTrip.title}
        </h1>
        {(currentTrip.startsAt || currentTrip.endsAt) && (
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {currentTrip.startsAt ?? "?"} – {currentTrip.endsAt ?? "?"}
          </p>
        )}
      </header>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Destinations</p>
          {!addingPlace && (
            <Button size="sm" variant="ghost" onClick={() => setAddingPlace(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>
        {addingPlace && (
          <div className="mt-2">
            <PlaceForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              nextOrdinal={places.length}
              onAdded={(place) => {
                addPlace(place);
                setAddingPlace(false);
              }}
              onCancel={() => setAddingPlace(false)}
            />
          </div>
        )}
        {places.length === 0 && !addingPlace && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">No destinations recorded yet.</p>
        )}
        {places.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {places.map((place) => (
              <li
                key={place.id}
                className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[13px] text-[var(--text)]"
              >
                {place.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Bookings</p>
          {!addingBooking && (
            <Button size="sm" variant="ghost" onClick={() => setAddingBooking(true)} iconLeft={<Plus size={14} aria-hidden />}>
              Add
            </Button>
          )}
        </div>

        {addingBooking && (
          <div className="mt-2">
            <BookingForm
              instanceId={instanceId}
              tripId={currentTrip.id}
              places={places}
              existingBookings={bookings}
              people={people}
              onAdded={(booking, links) => {
                addBooking(booking);
                addParticipants(links);
                setAddingBooking(false);
              }}
              onCancel={() => setAddingBooking(false)}
            />
          </div>
        )}

        {bookings.length === 0 && !addingBooking && (
          <p className="mt-2 text-[13px] text-[var(--faint)]">No bookings recorded yet.</p>
        )}

        <ul className="mt-2 flex flex-col gap-2">
          {byStartTime(bookings).map((booking) => {
            const dependsOn = booking.dependsOnBookingId ? byId.get(booking.dependsOnBookingId) : null;
            const names = participantsByBooking.get(booking.id) ?? [];
            const place = places.find((p) => p.id === booking.placeId);
            return (
              <li key={booking.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">{booking.kind}</p>
                    <p className="mt-0.5 text-[15px] font-medium text-[var(--text)]">{booking.title}</p>
                  </div>
                  {booking.bookingStatus === "waiting" && (
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--faint)]">
                      Awaiting confirmation
                    </span>
                  )}
                </div>
                {booking.startsAt && <p className="mt-1 text-[13px] text-[var(--muted)]">{timeLabel(booking.startsAt)}</p>}
                {place && <p className="mt-0.5 text-[13px] text-[var(--muted)]">{place.name}</p>}
                {booking.reference && <p className="mt-0.5 text-[12px] text-[var(--faint)]">Ref: {booking.reference}</p>}
                {dependsOn && (
                  <p className="mt-1.5 text-[12px] text-[var(--faint)]">Depends on {dependsOn.title}</p>
                )}
                {names.length > 0 && <p className="mt-1.5 text-[12px] text-[var(--faint)]">{names.join(", ")}</p>}
                {booking.notes && <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">{booking.notes}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
    </div>
  );
}
