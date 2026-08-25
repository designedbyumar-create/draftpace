"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createTrip } from "../domain/travelData";
import type { Trip } from "../trip";

/**
 * Setting up a trip.
 *
 * Three fields, inline, reachable from an empty Trip screen. Not a
 * dedicated setup destination, on purpose: the Phase 0 proposal's own
 * challenge to the brief was that a trip needs a title and rough dates
 * to exist, not a wizard, the same lesson Alongside's own setup
 * destination taught by not having one.
 */
export default function TripSetupForm({
  instanceId,
  onCreated,
  onCancel,
}: {
  instanceId: string;
  onCreated: (trip: Trip) => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createTrip(instanceId, {
      title,
      startsAt: startsAt || null,
      endsAt: endsAt || null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onCreated(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input label="What is this trip?" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Japan" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input
          type="date"
          label="Starts"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          containerClassName="flex-1"
          hint="Roughly. Exact times live on each booking."
        />
        <Input type="date" label="Ends" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} containerClassName="flex-1" />
      </div>
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || title.trim().length === 0}>
          Set up this trip
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </section>
  );
}
