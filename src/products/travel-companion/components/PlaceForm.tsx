"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createPlace } from "../domain/travelData";
import type { Place } from "../trip";

export default function PlaceForm({
  instanceId,
  tripId,
  nextOrdinal,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  tripId: string;
  nextOrdinal: number;
  onAdded: (place: Place) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [arrivesAt, setArrivesAt] = useState("");
  const [departsAt, setDepartsAt] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setErrorMessage(null);
    const result = await createPlace(instanceId, tripId, {
      name,
      ordinal: nextOrdinal,
      arrivesAt: arrivesAt || null,
      departsAt: departsAt || null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <Input label="Destination" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kyoto" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Arrives" value={arrivesAt} onChange={(e) => setArrivesAt(e.target.value)} containerClassName="flex-1" />
        <Input type="date" label="Departs" value={departsAt} onChange={(e) => setDepartsAt(e.target.value)} containerClassName="flex-1" />
      </div>
      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || name.trim().length === 0}>
          Add destination
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}
