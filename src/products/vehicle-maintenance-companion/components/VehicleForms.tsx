"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import { describeResultError } from "@/product-framework/result";
import { createVehicle, updateVehicle } from "../domain/vehicles";
import { parseManualRows, type ManualRow } from "../manualEntry";
import { FUEL_LABEL, profileJobsToAdd, profileList } from "../vehicleProfile";
import { MONO, PANEL, Label } from "./Workshop";
import { createMaintenanceItem, updateMaintenanceItem } from "../domain/maintenanceItems";
import { MAINTENANCE_TEMPLATES, STARTER_LISTS, starterListById, templateById, templatesToAdd } from "../vehicleKnowledge";
import { todayIso } from "../mileageFreshness";
import { FUEL_TYPES, type FuelType, type MaintenanceItem, type Vehicle } from "../state";

const blankToNull = (text: string): string | null => (text.trim() === "" ? null : text.trim());
const wholeOrNull = (text: string): number | null => {
  const cleaned = text.replace(/[,\s]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
};

/**
 * Adding a vehicle takes one short screen: what you call it, what kind it
 * is, and its mileage if you have it. That is enough to offer the usual jobs
 * for it in one tap, so nothing else is asked here. Year, make and model
 * are optional and out of the way, and whether the service history is
 * known is a question for the change form, not for somebody in a hurry.
 */
export function VehicleForm({
  instanceId,
  vehicle,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  /** Present when changing an existing vehicle. */
  vehicle?: Vehicle;
  onSaved: (vehicle: Vehicle) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(vehicle?.label ?? "");
  const [fuelType, setFuelType] = useState<FuelType | null>(vehicle?.fuelType ?? null);
  const [hardUse, setHardUse] = useState(vehicle?.hardUse ?? false);
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "");
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [currentMileage, setCurrentMileage] = useState("");
  const [historyKnown, setHistoryKnown] = useState(vehicle?.historyKnown ?? true);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    if (year.trim() !== "" && wholeOrNull(year) === null) {
      setErrorMessage("Year is a number, like 2019.");
      return;
    }
    if (currentMileage.trim() !== "" && wholeOrNull(currentMileage) === null) {
      setErrorMessage("Mileage is a whole number, like 48200.");
      return;
    }
    setPending(true);
    setErrorMessage(null);
    const shared = { label: label.trim(), year: wholeOrNull(year), make: blankToNull(make), model: blankToNull(model), fuelType, hardUse, historyKnown };
    const result = vehicle
      ? await updateVehicle(vehicle.id, shared)
      : await createVehicle(instanceId, {
          ...shared,
          currentMileage: wholeOrNull(currentMileage),
          mileageUpdatedAt: wholeOrNull(currentMileage) === null ? null : todayIso(new Date()),
        });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <section className={`${PANEL} flex flex-col gap-4 p-5`}>
      <Input label="What do you call it" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="The Civic" autoFocus />

      <div>
        <Label>What kind is it</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="What kind of vehicle it is">
          {FUEL_TYPES.map((fuel) => (
            <button
              key={fuel}
              type="button"
              aria-pressed={fuelType === fuel}
              onClick={() => setFuelType(fuelType === fuel ? null : fuel)}
              className={`${MONO} rounded-[var(--radius-sm)] border px-3 py-2 text-[12px] font-bold uppercase tracking-[0.06em] ${
                fuelType === fuel ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-contrast)]" : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {FUEL_LABEL[fuel]}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">Optional. It decides which jobs are worth suggesting, nothing else.</p>
      </div>

      {!vehicle && (
        <Input label="Mileage (optional)" inputMode="numeric" value={currentMileage} onChange={(e) => setCurrentMileage(e.target.value)} placeholder="50000" />
      )}

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
        <input type="checkbox" checked={hardUse} onChange={(e) => setHardUse(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
        <span>
          Mostly short trips, towing, or dust, heat or cold
          <span className="block text-[12px] font-normal text-[var(--muted)]">Jobs that care start with severe duty on, which halves their interval.</span>
        </span>
      </label>

      <details className="group">
        <summary className="cursor-pointer text-[13px] font-semibold text-[var(--primary)]">Year, make and model (optional)</summary>
        <div className="mt-3 flex flex-wrap gap-3">
          <Input label="Year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2019" containerClassName="w-24" />
          <Input label="Make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Honda" containerClassName="flex-1" />
          <Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Civic" containerClassName="flex-1" />
        </div>
      </details>

      {vehicle && (
        <div>
          <p className="text-[13px] font-semibold text-[var(--text)]">Do you know this vehicle&apos;s service history?</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
            For a used car or one you inherited, it is normal not to. Either way nothing is assumed done: a job waits for a real fact before it says anything is due.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant={historyKnown ? "commit" : "secondary"} onClick={() => setHistoryKnown(true)}>
              Yes, I know it
            </Button>
            <Button size="sm" variant={!historyKnown ? "commit" : "secondary"} onClick={() => setHistoryKnown(false)}>
              No, it is unknown
            </Button>
          </div>
        </div>
      )}

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" onClick={save} disabled={pending || label.trim().length === 0}>
          {vehicle ? "Save changes" : "Add vehicle"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

/**
 * The step right after adding a vehicle, and it is one tap: the usual jobs
 * for this kind of vehicle, each with a typical interval you can change and
 * nothing recorded against it, so none of it reads as overdue. For somebody
 * who has the manual open there is a table to type its intervals into
 * instead, and for somebody who wants neither, a way out.
 */
export function ProfilePanel({
  instanceId,
  vehicle,
  tracked,
  onAdded,
  onManual,
  onStarter,
  onDone,
}: {
  instanceId: string;
  vehicle: Vehicle;
  tracked: MaintenanceItem[];
  onAdded: (items: MaintenanceItem[]) => void;
  onManual: () => void;
  onStarter: () => void;
  onDone: () => void;
}) {
  const list = profileList(vehicle);
  const jobs = list ? profileJobsToAdd(list, tracked) : [];
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function addAll() {
    setPending(true);
    setMessage(null);
    const results = await Promise.all(
      jobs.map(({ template, severeDuty }) =>
        createMaintenanceItem(instanceId, {
          vehicleId: vehicle.id,
          templateId: template.id,
          taskName: template.taskName,
          intervalMiles: template.typicalIntervalMiles,
          intervalMonths: template.typicalIntervalMonths,
          severeDuty,
          lastDoneAt: null,
          lastDoneMileage: null,
        })
      )
    );
    setPending(false);
    const added = results.flatMap((r) => (r.ok ? [r.data] : []));
    if (added.length > 0) onAdded(added);
    if (added.length === jobs.length) onDone();
    else setMessage(`${added.length} of ${jobs.length} were added. Try again for the rest.`);
  }

  const names = jobs.slice(0, 4).map((j) => j.template.taskName);
  const more = jobs.length - names.length;

  return (
    <section className={`${PANEL} flex flex-col gap-3 p-4`}>
      <Label>Start with the usual jobs</Label>
      {list && jobs.length > 0 ? (
        <>
          <p className="text-[13.5px] leading-relaxed text-[var(--text)]">{list.blurb}</p>
          <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
            {names.join(", ")}
            {more > 0 ? `, and ${more} more` : ""}.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="commit" size="sm" disabled={pending} onClick={addAll}>
              {pending ? "Adding..." : `Add these ${jobs.length} jobs`}
            </Button>
            <Button size="sm" variant="secondary" disabled={pending} onClick={onManual}>
              Type them from my manual
            </Button>
            <Button size="sm" variant="ghost" disabled={pending} onClick={onDone}>
              Not now
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-[13.5px] leading-relaxed text-[var(--text)]">
            {list ? "Everything usual for this vehicle is already on it." : "Say what kind of vehicle it is under Change this vehicle and the usual jobs are one tap away. Or start from a list, or from your manual."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="commit" size="sm" onClick={onStarter}>
              Start from a list
            </Button>
            <Button size="sm" variant="secondary" onClick={onManual}>
              Type them from my manual
            </Button>
            <Button size="sm" variant="ghost" onClick={onDone}>
              Not now
            </Button>
          </div>
        </>
      )}
      {message && <p className="text-[12.5px] text-[var(--danger)]">{message}</p>}
    </section>
  );
}

/** A table for the intervals in an owner's manual: a name, and miles, months or both. Blank rows are just spare room. */
export function ManualJobsForm({
  instanceId,
  vehicle,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  vehicle: Vehicle;
  onAdded: (items: MaintenanceItem[]) => void;
  onCancel: () => void;
}) {
  const blank = (): ManualRow => ({ taskName: "", miles: "", months: "" });
  const [rows, setRows] = useState<ManualRow[]>([blank(), blank(), blank(), blank()]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setRow = (index: number, patch: Partial<ManualRow>) => setRows((current) => current.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  async function save() {
    const parsed = parseManualRows(rows);
    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }
    setPending(true);
    setError(null);
    const results = await Promise.all(
      parsed.jobs.map((job) => createMaintenanceItem(instanceId, { vehicleId: vehicle.id, templateId: null, ...job, severeDuty: false, lastDoneAt: null, lastDoneMileage: null }))
    );
    setPending(false);
    const added = results.flatMap((r) => (r.ok ? [r.data] : []));
    if (added.length > 0) onAdded(added);
    if (added.length === parsed.jobs.length) onCancel();
    else setError(`${added.length} of ${parsed.jobs.length} were added. Try again for the rest.`);
  }

  return (
    <section className={`${PANEL} flex flex-col gap-3 p-4`}>
      <Label>From your manual</Label>
      <div className={`${MONO} grid grid-cols-[1fr_84px_72px] gap-2 text-[10.5px] uppercase tracking-[0.1em] text-[var(--muted)]`}>
        <span>Job</span>
        <span>Miles</span>
        <span>Months</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-[1fr_84px_72px] gap-2">
            <input aria-label={`Job ${index + 1}`} list="vmc-job-names" value={row.taskName} onChange={(e) => setRow(index, { taskName: e.target.value })} placeholder="Engine oil and filter" className="h-11 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-[16px] text-[var(--text)]" />
            <input aria-label={`Miles for job ${index + 1}`} inputMode="numeric" value={row.miles} onChange={(e) => setRow(index, { miles: e.target.value })} placeholder="7500" className={`${MONO} h-11 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-[16px] text-[var(--text)]`} />
            <input aria-label={`Months for job ${index + 1}`} inputMode="numeric" value={row.months} onChange={(e) => setRow(index, { months: e.target.value })} placeholder="12" className={`${MONO} h-11 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-[16px] text-[var(--text)]`} />
          </div>
        ))}
      </div>
      <datalist id="vmc-job-names">
        {MAINTENANCE_TEMPLATES.map((t) => (
          <option key={t.id} value={t.taskName} />
        ))}
      </datalist>
      <div>
        <Button size="sm" variant="ghost" onClick={() => setRows((current) => [...current, blank()])}>
          Add a row
        </Button>
      </div>
      {error && <p className="text-[13px] text-[var(--danger)]">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending}>
          {pending ? "Adding..." : "Add these jobs"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

/**
 * Adding a job to a vehicle, or changing one. Picking a template copies its
 * typical interval onto the fields as an ordinary, editable starting point,
 * never a value saved silently. Changing a job changes its name, its
 * intervals and its severe-duty setting; when it was last done belongs to
 * the service record, where a correction is a correction of history.
 */
export function ItemForm({
  instanceId,
  vehicle,
  item,
  onSaved,
  onCancel,
}: {
  instanceId: string;
  vehicle: Vehicle;
  item?: MaintenanceItem;
  onSaved: (item: MaintenanceItem) => void;
  onCancel: () => void;
}) {
  const [templateId, setTemplateId] = useState<string | null>(item?.templateId ?? null);
  const [taskName, setTaskName] = useState(item?.taskName ?? "");
  const [intervalMiles, setIntervalMiles] = useState(item?.intervalMiles ? String(item.intervalMiles) : "");
  const [intervalMonths, setIntervalMonths] = useState(item?.intervalMonths ? String(item.intervalMonths) : "");
  const [severeDuty, setSevereDuty] = useState(item?.severeDuty ?? false);
  const [lastDoneAt, setLastDoneAt] = useState("");
  const [lastDoneMileage, setLastDoneMileage] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function pickTemplate(id: string) {
    const template = templateById(id);
    if (!template) return;
    setTemplateId(id);
    setTaskName(template.taskName);
    setIntervalMiles(template.typicalIntervalMiles ? String(template.typicalIntervalMiles) : "");
    setIntervalMonths(template.typicalIntervalMonths ? String(template.typicalIntervalMonths) : "");
  }

  async function save() {
    const miles = intervalMiles.trim() === "" ? null : wholeOrNull(intervalMiles);
    const months = intervalMonths.trim() === "" ? null : wholeOrNull(intervalMonths);
    if ((intervalMiles.trim() !== "" && (miles === null || miles <= 0)) || (intervalMonths.trim() !== "" && (months === null || months <= 0))) {
      setErrorMessage("An interval is a whole number above zero.");
      return;
    }
    if (miles === null && months === null) {
      setErrorMessage("Give it an interval, by distance, by time, or both.");
      return;
    }
    setPending(true);
    setErrorMessage(null);
    const shared = { taskName: taskName.trim(), intervalMiles: miles, intervalMonths: months, severeDuty };
    const result = item
      ? await updateMaintenanceItem(item.id, shared)
      : await createMaintenanceItem(instanceId, {
          ...shared,
          vehicleId: vehicle.id,
          templateId,
          lastDoneAt: vehicle.historyKnown && lastDoneAt ? lastDoneAt : null,
          lastDoneMileage: vehicle.historyKnown && lastDoneAt ? wholeOrNull(lastDoneMileage) : null,
        });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onSaved(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      {!item && (
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--text)]">Start from a typical job (optional)</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MAINTENANCE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => pickTemplate(template.id)}
                className="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
                style={templateId === template.id ? { borderColor: "var(--primary)", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--muted)" }}
              >
                {template.taskName}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input label="Job" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Engine oil and filter change" />

      <div className="flex flex-wrap gap-3">
        <Input
          label="Interval, miles"
          inputMode="numeric"
          value={intervalMiles}
          onChange={(e) => setIntervalMiles(e.target.value)}
          placeholder="5000"
          hint={templateId && !item ? "Typical starting point. Change it to whatever your vehicle actually needs." : undefined}
          containerClassName="flex-1"
        />
        <Input label="Interval, months" inputMode="numeric" value={intervalMonths} onChange={(e) => setIntervalMonths(e.target.value)} placeholder="6" containerClassName="flex-1" />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
        <input type="checkbox" checked={severeDuty} onChange={(e) => setSevereDuty(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
        <span>
          Severe duty for this job
          <span className="block text-[12px] font-normal text-[var(--muted)]">
            Towing, mostly short trips, heavy dust, or extreme heat or cold. Halves this job&apos;s interval; it never changes the number you typed above.
          </span>
        </span>
      </label>

      {!item &&
        (vehicle.historyKnown ? (
          <div className="flex flex-wrap gap-3">
            <Input type="date" label="Last done (optional)" value={lastDoneAt} max={todayIso(new Date())} onChange={(e) => setLastDoneAt(e.target.value)} containerClassName="flex-1" />
            <Input label="Mileage when last done (optional)" inputMode="numeric" value={lastDoneMileage} onChange={(e) => setLastDoneMileage(e.target.value)} placeholder="45000" containerClassName="flex-1" />
          </div>
        ) : (
          <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
            This vehicle&apos;s history is unknown, so nothing is asked about when this was last done. It will read as nothing to judge yet until you record it done for real.
          </p>
        ))}

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="commit" size="sm" onClick={save} disabled={pending || taskName.trim().length === 0}>
          {item ? "Save changes" : "Add job"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

/**
 * Adding a starter list. Nothing is added until a list is chosen, every job
 * is added with nothing recorded against it, and a job the vehicle already
 * tracks is skipped, so choosing a list twice adds nothing the second time.
 */
export function StarterListPicker({
  instanceId,
  vehicle,
  tracked,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  vehicle: Vehicle;
  tracked: MaintenanceItem[];
  onAdded: (items: MaintenanceItem[]) => void;
  onCancel: () => void;
}) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function add(listId: string) {
    const list = starterListById(listId);
    if (!list) return;
    const missing = templatesToAdd(list, tracked);
    if (missing.length === 0) {
      setMessage(`Everything in "${list.name}" is already on this vehicle.`);
      return;
    }
    setPendingId(listId);
    setMessage(null);
    const added: MaintenanceItem[] = [];
    for (const template of missing) {
      const result = await createMaintenanceItem(instanceId, {
        vehicleId: vehicle.id,
        templateId: template.id,
        taskName: template.taskName,
        intervalMiles: template.typicalIntervalMiles,
        intervalMonths: template.typicalIntervalMonths,
        severeDuty: false,
        lastDoneAt: null,
        lastDoneMileage: null,
      });
      if (result.ok) added.push(result.data);
      else {
        setMessage(`${describeResultError(result.error)} ${added.length} of ${missing.length} were added.`);
        break;
      }
    }
    setPendingId(null);
    if (added.length > 0) onAdded(added);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">Start from a list</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
          Each job is added with a typical interval you can change, and with nothing recorded against it, so none of it reads as overdue. Take what you want
          and close the rest.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {STARTER_LISTS.map((list) => (
          <li key={list.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--text)]">{list.name}</p>
              <p className="text-[12px] text-[var(--muted)]">{list.blurb}</p>
            </div>
            <Button size="sm" variant="secondary" disabled={pendingId !== null} onClick={() => add(list.id)}>
              {pendingId === list.id ? "Adding..." : "Add these jobs"}
            </Button>
          </li>
        ))}
      </ul>
      {message && <p className="text-[12.5px] text-[var(--muted)]">{message}</p>}
      <div>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pendingId !== null}>
          Done
        </Button>
      </div>
    </section>
  );
}
