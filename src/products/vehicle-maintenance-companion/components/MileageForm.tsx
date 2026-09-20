"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { updateVehicle } from "../domain/vehicles";
import { todayIso } from "../mileageFreshness";
import type { Vehicle } from "../state";

/** The current mileage, and nothing else. Saving stamps today as the day it was read. */
export default function MileageForm({ vehicle, onSaved, onCancel }: { vehicle: Vehicle; onSaved: (vehicle: Vehicle) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState(vehicle.currentMileage === null ? "" : String(vehicle.currentMileage));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const cleaned = draft.replace(/[,\s]/g, "");
    if (cleaned !== "" && !/^\d+$/.test(cleaned)) {
      setError("Mileage is a whole number, like 48200.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await updateVehicle(vehicle.id, {
      currentMileage: cleaned === "" ? null : Number(cleaned),
      mileageUpdatedAt: cleaned === "" ? null : todayIso(new Date()),
    });
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <Input label={`${vehicle.label}: mileage today`} inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="48200" containerClassName="w-44" />
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
    </div>
  );
}
