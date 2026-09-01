"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createBooking, linkPersonToBooking, type BookingParticipant } from "../domain/travelData";
import type { Booking, BookingKind, Person, Place } from "../trip";

const KIND_OPTIONS: { value: BookingKind; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "train", label: "Train" },
  { value: "car", label: "Car" },
  { value: "transfer", label: "Transfer" },
  { value: "hotel", label: "Hotel" },
  { value: "rental", label: "Rental" },
  { value: "activity", label: "Activity" },
  { value: "restaurant", label: "Restaurant" },
  { value: "event", label: "Event" },
  { value: "other", label: "Other" },
];

const SELECT_CLASS =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-[14px] text-[var(--text)] outline-none focus:border-[var(--primary)]";

/**
 * Adding a booking.
 *
 * "Depends on" is the one field that makes this product's differentiator
 * real rather than theoretical: picking an existing booking here is the
 * only way a dependency edge is ever created. Nothing infers one from
 * time, place, or kind, per the founder's own locked decision.
 */
export default function BookingForm({
  instanceId,
  tripId,
  places,
  existingBookings,
  people,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  places: Place[];
  existingBookings: Booking[];
  people: Person[];
  onAdded: (booking: Booking, participants: BookingParticipant[]) => void;
  onCancel: () => void;
}) {
  const [kind, setKind] = useState<BookingKind>("flight");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [dependsOnBookingId, setDependsOnBookingId] = useState("");
  const [participantIds, setParticipantIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleParticipant(personId: string) {
    setParticipantIds((current) => {
      const next = new Set(current);
      if (next.has(personId)) next.delete(personId);
      else next.add(personId);
      return next;
    });
  }

  async function save() {
    setPending(true);
    setErrorMessage(null);

    const result = await createBooking(
      instanceId,
      tripId,
      {
        kind,
        title,
        provider: provider || null,
        reference: reference || null,
        // The datetime-local input has no timezone of its own; it is
        // exactly the digits the person typed. Routing it through
        // `new Date(...)` would interpret those digits as the browser's
        // local time and silently shift them on save, so this appends
        // Z directly instead: what was typed is what gets stored, with
        // no conversion nobody asked for. See today.ts's own header
        // comment on why this product treats every stored time as UTC
        // wall-clock rather than inventing a per-booking timezone.
        startsAt: startsAt ? `${startsAt}:00.000Z` : null,
        endsAt: endsAt ? `${endsAt}:00.000Z` : null,
        placeId: placeId || null,
        dependsOnBookingId: dependsOnBookingId || null,
        notes: notes || null,
      },
      existingBookings
    );

    if (!result.ok) {
      setPending(false);
      setErrorMessage(describeResultError(result.error));
      return;
    }

    const links: BookingParticipant[] = [];
    for (const personId of participantIds) {
      const linked = await linkPersonToBooking(instanceId, result.data.id, personId);
      if (linked.ok) links.push(linked.data);
    }

    setPending(false);
    onAdded(result.data, links);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--text)]">Kind</span>
        <select value={kind} onChange={(e) => setKind(e.target.value as BookingKind)} className={SELECT_CLASS}>
          {KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Flight PK123" autoFocus />

      <div className="flex flex-wrap gap-3">
        <Input label="Provider (optional)" value={provider} onChange={(e) => setProvider(e.target.value)} containerClassName="flex-1" />
        <Input label="Reference (optional)" value={reference} onChange={(e) => setReference(e.target.value)} containerClassName="flex-1" />
      </div>

      <div className="flex flex-wrap gap-3">
        <Input type="datetime-local" label="Starts (optional)" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} containerClassName="flex-1" />
        <Input type="datetime-local" label="Ends (optional)" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} containerClassName="flex-1" />
      </div>

      {places.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[var(--text)]">Destination (optional)</span>
          <select value={placeId} onChange={(e) => setPlaceId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Not tied to one destination</option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {existingBookings.length > 0 && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[var(--text)]">Depends on (optional)</span>
          <select value={dependsOnBookingId} onChange={(e) => setDependsOnBookingId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Nothing upstream</option>
            {existingBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.title}
              </option>
            ))}
          </select>
          <span className="text-[12px] text-[var(--faint)]">
            If this changes, whatever depends on it is what "what changed?" will point to later.
          </span>
        </label>
      )}

      {people.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[13px] font-semibold text-[var(--text)]">Who's on this</legend>
          {people.map((person) => (
            <label key={person.id} className="flex items-center gap-2 text-[13px] text-[var(--text)]">
              <input
                type="checkbox"
                checked={participantIds.has(person.id)}
                onChange={() => toggleParticipant(person.id)}
                className="accent-[var(--primary)]"
              />
              {person.name}
            </label>
          ))}
        </fieldset>
      )}

      <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || title.trim().length === 0}>
          Add booking
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
