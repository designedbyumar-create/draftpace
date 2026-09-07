"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { Car, Plus } from "@/design-system/Icon";
import { createVehicle, updateVehicle } from "../domain/vehicles";
import { createMaintenanceItem, updateMaintenanceItem } from "../domain/maintenanceItems";
import { MAINTENANCE_TEMPLATES, templateById } from "../vehicleKnowledge";
import { effectiveIntervalMiles, effectiveIntervalMonths } from "../dueStatus";
import { useVehicleMaintenance } from "./useVehicleMaintenance";
import type { MaintenanceItem, Vehicle } from "../state";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Adding a vehicle: label, optional identity, optional current mileage,
 * and the one question that decides the rest of that vehicle's setup,
 * whether its service history is actually known.
 */
function AddVehicleForm({
  instanceId,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  onAdded: (vehicle: Vehicle) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [currentMileage, setCurrentMileage] = useState("");
  const [historyKnown, setHistoryKnown] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function save() {
    if (historyKnown === null) {
      setErrorMessage("Say whether you know this vehicle's service history first.");
      return;
    }
    setPending(true);
    setErrorMessage(null);
    const result = await createVehicle(instanceId, {
      label,
      year: year ? Number(year) : null,
      make: make || null,
      model: model || null,
      currentMileage: currentMileage ? Number(currentMileage) : null,
      mileageUpdatedAt: currentMileage ? dateKey(new Date()) : null,
      historyKnown,
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
      <Input label="What do you call it" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="2019 Honda Civic" autoFocus />
      <div className="flex flex-wrap gap-3">
        <Input label="Year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2019" containerClassName="w-24" />
        <Input label="Make" value={make} onChange={(e) => setMake(e.target.value)} placeholder="Honda" containerClassName="flex-1" />
        <Input label="Model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Civic" containerClassName="flex-1" />
      </div>
      <Input
        label="Current mileage (optional)"
        value={currentMileage}
        onChange={(e) => setCurrentMileage(e.target.value)}
        placeholder="50000"
        hint="Leave this empty if you do not know it yet. You can add it any time."
      />

      <div>
        <p className="text-[13px] font-semibold text-[var(--text)]">Do you know this vehicle&apos;s service history?</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
          For a used car or one you inherited, it is normal not to. Saying so means nothing here is assumed already
          done: every maintenance item waits for a real fact before it says anything is due.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant={historyKnown === true ? "primary" : "secondary"} onClick={() => setHistoryKnown(true)}>
            Yes, I know it
          </Button>
          <Button size="sm" variant={historyKnown === false ? "primary" : "secondary"} onClick={() => setHistoryKnown(false)}>
            No, it is unknown
          </Button>
        </div>
      </div>

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={save} disabled={pending || label.trim().length === 0}>
          Add vehicle
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

/**
 * Adding a maintenance item to one vehicle. Picking a template copies
 * its typical interval onto the fields below as an ordinary, editable
 * starting point, never a value the item is saved with silently. Last-
 * done fields are hidden entirely for an unknown-history vehicle: there
 * is nothing honest to put in them yet.
 */
function AddMaintenanceItemForm({
  instanceId,
  vehicle,
  onAdded,
  onCancel,
}: {
  instanceId: string;
  vehicle: Vehicle;
  onAdded: (item: MaintenanceItem) => void;
  onCancel: () => void;
}) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState("");
  const [intervalMiles, setIntervalMiles] = useState("");
  const [intervalMonths, setIntervalMonths] = useState("");
  const [severeDuty, setSevereDuty] = useState(false);
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
    const miles = intervalMiles ? Number(intervalMiles) : null;
    const months = intervalMonths ? Number(intervalMonths) : null;
    if (miles === null && months === null) {
      setErrorMessage("Give it an interval, by distance, by time, or both.");
      return;
    }
    setPending(true);
    setErrorMessage(null);
    const result = await createMaintenanceItem(instanceId, {
      vehicleId: vehicle.id,
      templateId,
      taskName,
      intervalMiles: miles,
      intervalMonths: months,
      severeDuty,
      lastDoneAt: vehicle.historyKnown && lastDoneAt ? lastDoneAt : null,
      lastDoneMileage: vehicle.historyKnown && lastDoneMileage ? Number(lastDoneMileage) : null,
    });
    setPending(false);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      return;
    }
    onAdded(result.data);
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div>
        <p className="text-[12.5px] font-semibold text-[var(--text)]">Start from a typical job (optional)</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {MAINTENANCE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => pickTemplate(template.id)}
              className="rounded-full border px-2.5 py-1 text-[11.5px] font-semibold"
              style={
                templateId === template.id
                  ? { borderColor: "var(--primary)", color: "var(--primary)" }
                  : { borderColor: "var(--border)", color: "var(--muted)" }
              }
            >
              {template.taskName}
            </button>
          ))}
        </div>
      </div>

      <Input label="Task" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Engine oil and filter change" />

      <div className="flex flex-wrap gap-3">
        <Input
          label="Interval, miles"
          value={intervalMiles}
          onChange={(e) => setIntervalMiles(e.target.value)}
          placeholder="5000"
          hint={templateId ? "Typical starting point. Change it to whatever your vehicle actually needs." : undefined}
          containerClassName="flex-1"
        />
        <Input
          label="Interval, months"
          value={intervalMonths}
          onChange={(e) => setIntervalMonths(e.target.value)}
          placeholder="6"
          containerClassName="flex-1"
        />
      </div>

      <label className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
        <input type="checkbox" checked={severeDuty} onChange={(e) => setSevereDuty(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
        <span>
          Severe duty for this job
          <span className="block text-[12px] font-normal text-[var(--muted)]">
            Towing, mostly short trips, heavy dust, or extreme heat or cold. Halves this job&apos;s interval; it never
            changes the number you typed above.
          </span>
        </span>
      </label>

      {vehicle.historyKnown ? (
        <div className="flex flex-wrap gap-3">
          <Input type="date" label="Last done (optional)" value={lastDoneAt} onChange={(e) => setLastDoneAt(e.target.value)} containerClassName="flex-1" />
          <Input
            label="Mileage when last done (optional)"
            value={lastDoneMileage}
            onChange={(e) => setLastDoneMileage(e.target.value)}
            placeholder="45000"
            containerClassName="flex-1"
          />
        </div>
      ) : (
        <p className="text-[12.5px] leading-relaxed text-[var(--muted)]">
          This vehicle&apos;s history is unknown, so nothing is asked about when this was last done. It will read as
          nothing to judge yet until you record it done for real.
        </p>
      )}

      {errorMessage && <p className="text-[13px] text-[var(--danger)]">{errorMessage}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={save} disabled={pending || taskName.trim().length === 0}>
          Add item
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
      </div>
    </section>
  );
}

function ItemRow({ item, vehicle, onChanged }: { item: MaintenanceItem; vehicle: Vehicle; onChanged: (item: MaintenanceItem) => void }) {
  const [pending, setPending] = useState(false);

  async function markDoneToday() {
    setPending(true);
    const result = await updateMaintenanceItem(item.id, {
      lastDoneAt: dateKey(new Date()),
      lastDoneMileage: vehicle.currentMileage,
    });
    setPending(false);
    if (result.ok) onChanged(result.data);
  }

  const effMiles = effectiveIntervalMiles(item);
  const effMonths = effectiveIntervalMonths(item);
  const intervalParts = [
    effMiles ? `every ${effMiles.toLocaleString()} miles` : null,
    effMonths ? `every ${effMonths} months` : null,
  ].filter(Boolean);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{item.taskName}</h4>
        {item.severeDuty && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--primary)" }}>
            Severe duty
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[12px] text-[var(--muted)]">{intervalParts.join(", ")}</p>
      <p className="mt-1 text-[12px] text-[var(--faint)]">
        {item.lastDoneAt
          ? `Last done ${item.lastDoneAt}${item.lastDoneMileage ? ` at ${item.lastDoneMileage.toLocaleString()} miles` : ""}`
          : "Nothing recorded yet"}
      </p>
      <div className="mt-2">
        <Button size="sm" variant="ghost" disabled={pending} onClick={markDoneToday}>
          {pending ? "Saving..." : "Mark done today"}
        </Button>
      </div>
    </div>
  );
}

function VehicleCard({
  instanceId,
  vehicle,
  items,
  onVehicleChanged,
  onItemAdded,
  onItemChanged,
}: {
  instanceId: string;
  vehicle: Vehicle;
  items: MaintenanceItem[];
  onVehicleChanged: (vehicle: Vehicle) => void;
  onItemAdded: (item: MaintenanceItem) => void;
  onItemChanged: (item: MaintenanceItem) => void;
}) {
  const [addingItem, setAddingItem] = useState(false);
  const [editingMileage, setEditingMileage] = useState(false);
  const [mileageDraft, setMileageDraft] = useState(vehicle.currentMileage ? String(vehicle.currentMileage) : "");
  const [pending, setPending] = useState(false);
  const activeItems = items.filter((i) => i.vehicleId === vehicle.id && i.status === "active");

  async function saveMileage() {
    setPending(true);
    const result = await updateVehicle(vehicle.id, {
      currentMileage: mileageDraft ? Number(mileageDraft) : null,
      mileageUpdatedAt: mileageDraft ? new Date().toISOString().slice(0, 10) : null,
    });
    setPending(false);
    if (result.ok) {
      onVehicleChanged(result.data);
      setEditingMileage(false);
    }
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-[16px] font-semibold text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
          {vehicle.label}
        </h3>
        {!vehicle.historyKnown && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--faint)]">History unknown</span>
        )}
      </div>

      {editingMileage ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input value={mileageDraft} onChange={(e) => setMileageDraft(e.target.value)} placeholder="Current mileage" containerClassName="w-40" />
          <Button size="sm" disabled={pending} onClick={saveMileage}>
            Save
          </Button>
          <Button size="sm" variant="ghost" disabled={pending} onClick={() => setEditingMileage(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => setEditingMileage(true)} className="mt-1 text-[12.5px] text-[var(--muted)] hover:text-[var(--text)]">
          {vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} miles` : "Add current mileage"}
          {vehicle.mileageUpdatedAt ? `, as of ${vehicle.mileageUpdatedAt}` : ""}
        </button>
      )}

      <div className="mt-3 flex flex-col gap-2">
        {activeItems.length === 0 ? (
          <p className="text-[12.5px] text-[var(--faint)]">Nothing tracked on this vehicle yet.</p>
        ) : (
          activeItems.map((item) => <ItemRow key={item.id} item={item} vehicle={vehicle} onChanged={onItemChanged} />)
        )}
      </div>

      <div className="mt-3">
        {addingItem ? (
          <AddMaintenanceItemForm
            instanceId={instanceId}
            vehicle={vehicle}
            onAdded={(item) => {
              onItemAdded(item);
              setAddingItem(false);
            }}
            onCancel={() => setAddingItem(false)}
          />
        ) : (
          <Button size="sm" variant="ghost" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingItem(true)}>
            Track a maintenance item
          </Button>
        )}
      </div>
    </section>
  );
}

export default function VehiclesModule() {
  const { status, errorMessage, instanceId, vehicles, items, addVehicle, replaceVehicle, addItem, replaceItem } = useVehicleMaintenance();
  const [addingVehicle, setAddingVehicle] = useState(false);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Vehicles</p>
          <h1 className="mt-2 text-[26px] leading-tight text-[var(--text)]" style={{ fontFamily: "var(--product-narrative-font, inherit)" }}>
            What you own, and what you track on it.
          </h1>
        </div>
        {!addingVehicle && (
          <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingVehicle(true)}>
            Add vehicle
          </Button>
        )}
      </header>

      {addingVehicle && (
        <AddVehicleForm
          instanceId={instanceId}
          onAdded={(vehicle) => {
            addVehicle(vehicle);
            setAddingVehicle(false);
          }}
          onCancel={() => setAddingVehicle(false)}
        />
      )}

      {vehicles.length === 0 && !addingVehicle ? (
        <EmptyState icon={Car} title="No vehicle yet" description="Add a vehicle to start tracking what it needs." />
      ) : (
        vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            instanceId={instanceId}
            vehicle={vehicle}
            items={items}
            onVehicleChanged={replaceVehicle}
            onItemAdded={addItem}
            onItemChanged={replaceItem}
          />
        ))
      )}
    </div>
  );
}
