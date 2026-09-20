"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createRenewal, updateRenewal } from "../domain/renewals";
import { updateVehicle } from "../domain/vehicles";
import { DETAIL_FIELDS, detailsFromVehicle, detailsPatch, parseRenewalForm, type DetailsFormValues, type RenewalFormValues } from "../paperworkForm";
import { RENEWAL_INFO } from "../renewals";
import { RENEWAL_KINDS, type Renewal, type Vehicle } from "../state";

/** The glove box details for one vehicle. Every field is optional and typed by the owner; nothing is looked up. */
export function DetailsForm({ vehicle, onSaved, onCancel }: { vehicle: Vehicle; onSaved: (vehicle: Vehicle) => void; onCancel: () => void }) {
  const [values, setValues] = useState<DetailsFormValues>(detailsFromVehicle(vehicle));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    const result = await updateVehicle(vehicle.id, detailsPatch(values));
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {DETAIL_FIELDS.map((field) => (
          <Input key={field.key} label={field.label} value={values[field.key]} placeholder={field.placeholder} onChange={(e) => setValues((c) => ({ ...c, [field.key]: e.target.value }))} />
        ))}
      </div>
      <p className="text-[12px] leading-relaxed text-[var(--muted)]">Kept with your account and used only for the glove box card. None of it is looked up or checked.</p>
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : "Save details"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/** A date to keep in view, and where the paper is. Adding a new one, or changing an existing one. */
export function RenewalForm({
  instanceId,
  vehicle,
  renewal,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  vehicle: Vehicle;
  renewal?: Renewal;
  onSaved: (renewal: Renewal) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<RenewalFormValues>({
    kind: renewal?.kind ?? "registration",
    label: renewal?.label ?? "",
    dueOn: renewal?.dueOn ?? "",
    whereKept: renewal?.whereKept ?? "",
    note: renewal?.note ?? "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<RenewalFormValues>) => setValues((c) => ({ ...c, ...patch }));

  async function save() {
    const parsed = parseRenewalForm(values);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setPending(true);
    setError(null);
    const result = renewal ? await updateRenewal(renewal.id, { ...parsed.renewal }) : await createRenewal(instanceId, { ...parsed.renewal, vehicleId: vehicle.id });
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">What is it</span>
        <select
          value={values.kind}
          onChange={(e) => set({ kind: e.target.value as RenewalFormValues["kind"] })}
          className="h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[16px] text-[var(--text)]"
        >
          {RENEWAL_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {RENEWAL_INFO[kind].label}
            </option>
          ))}
        </select>
      </label>
      {values.kind === "other" && <Input label="Name it" value={values.label} onChange={(e) => set({ label: e.target.value })} placeholder="Parking permit" />}
      <Input
        type="date"
        label="The date"
        value={values.dueOn}
        onChange={(e) => set({ dueOn: e.target.value })}
        hint={renewal ? "Renewed? Put the new date here." : "The day it runs out or comes up."}
      />
      <Input label="Where the paper is (optional)" value={values.whereKept} onChange={(e) => set({ whereKept: e.target.value })} placeholder={RENEWAL_INFO[values.kind].kept} />
      <Input label="Note (optional)" value={values.note} onChange={(e) => set({ note: e.target.value })} />
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : renewal ? "Save changes" : "Add this date"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
