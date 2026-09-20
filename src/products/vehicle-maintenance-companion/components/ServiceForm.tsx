"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { recordService, resyncItem, updateServiceEvent, type RecordedService } from "../domain/recordService";
import { emptyServiceForm, parseServiceForm, type ServiceFormValues } from "../serviceForm";
import { formatCost } from "../serviceHistory";
import { todayIso } from "../mileageFreshness";
import type { MaintenanceItem, ServiceEvent, Vehicle } from "../state";

/**
 * Recording a service, or correcting one. One form for both so a service is
 * described the same way wherever it is entered: from a due job, from
 * History, or from a job that had no record. Everything beyond what was
 * done and when is optional, and a blank is saved as blank, never guessed.
 */

const NO_JOB = "";

export function RecordServiceForm({
  instanceId,
  vehicle,
  item,
  jobChoices,
  onSaved,
  onCancel,
  submitLabel = "Save this service",
}: {
  instanceId: string;
  vehicle: Vehicle;
  /** The job being recorded, or null for a one-off or a choice made in the form. */
  item: MaintenanceItem | null;
  /** When the job is not fixed, the tracked jobs on this vehicle to choose from. */
  jobChoices?: MaintenanceItem[];
  onSaved: (recorded: RecordedService) => void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const today = todayIso(new Date());
  const [jobId, setJobId] = useState<string>(item?.id ?? NO_JOB);
  const chosen = item ?? jobChoices?.find((j) => j.id === jobId) ?? null;
  const [values, setValues] = useState<ServiceFormValues>(emptyServiceForm({ taskName: item?.taskName ?? "", today, vehicleMileage: vehicle.currentMileage }));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ServiceFormValues>) => setValues((current) => ({ ...current, ...patch }));

  async function save() {
    const parsed = parseServiceForm(values, today);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setPending(true);
    setError(null);
    const result = await recordService({ instanceId, vehicle, item: chosen, service: parsed.service });
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      {jobChoices && !item && (
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Which job was it?</span>
          <select
            value={jobId}
            onChange={(event) => {
              setJobId(event.target.value);
              const next = jobChoices.find((j) => j.id === event.target.value);
              if (next) set({ taskName: next.taskName });
            }}
            className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[16px] text-[var(--text)]"
          >
            <option value={NO_JOB}>Something else</option>
            {jobChoices.map((job) => (
              <option key={job.id} value={job.id}>
                {job.taskName}
              </option>
            ))}
          </select>
        </label>
      )}
      {!item && <Input label="What was done" value={values.taskName} onChange={(e) => set({ taskName: e.target.value })} placeholder="Replaced the rear brake pads" />}
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Day it was done" value={values.doneOn} max={today} onChange={(e) => set({ doneOn: e.target.value })} containerClassName="flex-1" />
        <Input
          label="Mileage"
          inputMode="numeric"
          value={values.mileage}
          onChange={(e) => set({ mileage: e.target.value })}
          placeholder="48200"
          hint="Leave it empty if you do not know."
          containerClassName="flex-1"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Input label="Who did it (optional)" value={values.shop} onChange={(e) => set({ shop: e.target.value })} placeholder="Main Street Garage" containerClassName="flex-1" />
        <Input label="Cost (optional)" inputMode="decimal" value={values.cost} onChange={(e) => set({ cost: e.target.value })} placeholder="120.50" containerClassName="flex-1" />
      </div>
      <Input label="Note (optional)" value={values.note} onChange={(e) => set({ note: e.target.value })} placeholder="Parts, brand, anything worth remembering" />
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** Correcting a service that is already in the record. Saving re-derives the job's last-done from what remains. */
export function EditServiceForm({
  event,
  events,
  item,
  onSaved,
  onCancel,
}: {
  event: ServiceEvent;
  /** Every event, so the job's last-done can be worked out again once this one changes. */
  events: ServiceEvent[];
  item: MaintenanceItem | null;
  onSaved: (event: ServiceEvent, item: MaintenanceItem | null) => void;
  onCancel: () => void;
}) {
  const today = todayIso(new Date());
  const [values, setValues] = useState<ServiceFormValues>({
    taskName: event.taskName,
    doneOn: event.doneOn,
    mileage: event.mileage === null ? "" : String(event.mileage),
    shop: event.shop ?? "",
    cost: event.costMinorUnits === null ? "" : formatCost(event.costMinorUnits).replace(/,/g, ""),
    note: event.note ?? "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ServiceFormValues>) => setValues((current) => ({ ...current, ...patch }));

  async function save() {
    const parsed = parseServiceForm(values, today);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setPending(true);
    setError(null);
    const updated = await updateServiceEvent(event.id, { ...parsed.service });
    if (!updated.ok) {
      setPending(false);
      setError(describeResultError(updated.error));
      return;
    }
    let syncedItem: MaintenanceItem | null = null;
    if (item) {
      const after = events.map((e) => (e.id === event.id ? updated.data : e));
      const synced = await resyncItem(item, after);
      if (synced.ok) syncedItem = synced.data;
    }
    setPending(false);
    onSaved(updated.data, syncedItem);
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <Input label="What was done" value={values.taskName} onChange={(e) => set({ taskName: e.target.value })} />
      <div className="flex flex-wrap gap-3">
        <Input type="date" label="Day it was done" value={values.doneOn} max={today} onChange={(e) => set({ doneOn: e.target.value })} containerClassName="flex-1" />
        <Input label="Mileage" inputMode="numeric" value={values.mileage} onChange={(e) => set({ mileage: e.target.value })} containerClassName="flex-1" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Input label="Who did it" value={values.shop} onChange={(e) => set({ shop: e.target.value })} containerClassName="flex-1" />
        <Input label="Cost" inputMode="decimal" value={values.cost} onChange={(e) => set({ cost: e.target.value })} containerClassName="flex-1" />
      </div>
      <Input label="Note" value={values.note} onChange={(e) => set({ note: e.target.value })} />
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : "Save changes"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
