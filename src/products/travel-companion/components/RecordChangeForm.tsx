"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { updateBooking } from "../domain/travelData";
import type { Booking } from "../trip";

/**
 * Recording a change to a booking's own time.
 *
 * This is step 1 of the change-impact walk (proposal §13): an explicit
 * user action, never inferred, that then lets the caller walk
 * descendantsOf and show what else might be affected. This form only
 * saves the new time; it does not touch dependsOnBookingId or anything
 * downstream, that walk happens in the caller once this save succeeds.
 */
export default function RecordChangeForm({
  booking,
  existingBookings,
  onChanged,
  onCancel,
}: {
  booking: Booking;
  existingBookings: Booking[];
  onChanged: (updated: Booking) => void;
  onCancel: () => void;
}) {
  const [startsAt, setStartsAt] = useState(booking.startsAt ? booking.startsAt.slice(0, 16) : "");
  const [endsAt, setEndsAt] = useState(booking.endsAt ? booking.endsAt.slice(0, 16) : "");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    // Same rule as BookingForm's own save: the digits typed are exactly
    // what gets stored, no browser-timezone conversion.
    const result = await updateBooking(
      booking.id,
      {
        startsAt: startsAt ? `${startsAt}:00.000Z` : null,
        endsAt: endsAt ? `${endsAt}:00.000Z` : null,
      },
      existingBookings
    );
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onChanged(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[13px] text-[var(--muted)]">
        Save the new time, and anything that depends on {booking.title} will be shown so you can deal with it.
      </p>
      <div className="flex flex-wrap gap-3">
        <Input type="datetime-local" label="New starts" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} containerClassName="flex-1" />
        <Input type="datetime-local" label="New ends" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} containerClassName="flex-1" />
      </div>
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending}>
          Save the change
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
