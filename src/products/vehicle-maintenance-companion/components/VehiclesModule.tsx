"use client";

import { useState } from "react";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { Car, Plus } from "@/design-system/Icon";
import { archiveVehicle } from "../domain/vehicles";
import { archiveMaintenanceItem } from "../domain/maintenanceItems";
import { describeInterval } from "../dueText";
import { mileageFreshness, todayIso } from "../mileageFreshness";
import { useVehicleMaintenance } from "./useVehicleMaintenance";
import { ItemForm, ManualJobsForm, ProfilePanel, StarterListPicker, VehicleForm } from "./VehicleForms";
import { FUEL_LABEL } from "../vehicleProfile";
import { MONO, PANEL, Plate, ScreenHeading } from "./Workshop";
import { RecordServiceForm } from "./ServiceForm";
import MileageForm from "./MileageForm";
import type { RecordedService } from "../domain/recordService";
import type { MaintenanceItem, Vehicle } from "../state";

type Change = { onRecorded: (recorded: RecordedService) => void };

function ItemRow({
  instanceId,
  item,
  vehicle,
  onChanged,
  onRemoved,
  onRecorded,
}: { instanceId: string; item: MaintenanceItem; vehicle: Vehicle; onChanged: (item: MaintenanceItem) => void; onRemoved: (id: string) => void } & Change) {
  const [mode, setMode] = useState<"view" | "edit" | "done">("view");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function close() {
    setPending(true);
    setError(null);
    const result = await archiveMaintenanceItem(item.id);
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onRemoved(item.id);
  }

  if (mode === "edit") {
    return (
      <ItemForm
        instanceId={instanceId}
        vehicle={vehicle}
        item={item}
        onCancel={() => setMode("view")}
        onSaved={(saved) => {
          onChanged(saved);
          setMode("view");
        }}
      />
    );
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-[13.5px] font-semibold text-[var(--text)]">{item.taskName}</h4>
        {item.severeDuty && (
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: "var(--primary)" }}>
            Severe duty
          </span>
        )}
      </div>
      <p className={`${MONO} mt-0.5 text-[11.5px] text-[var(--muted)]`}>{describeInterval(item)}</p>
      <p className="mt-1 text-[12px] text-[var(--faint)]">
        {item.lastDoneAt ? `Last done ${item.lastDoneAt}${item.lastDoneMileage ? ` at ${item.lastDoneMileage.toLocaleString()} miles` : ""}` : "Nothing recorded yet"}
      </p>
      {mode === "done" ? (
        <div className="mt-3">
          <RecordServiceForm
            instanceId={instanceId}
            vehicle={vehicle}
            item={item}
            submitLabel="Save"
            onCancel={() => setMode("view")}
            onSaved={(recorded) => {
              onRecorded(recorded);
              setMode("view");
            }}
          />
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button type="button" onClick={() => setMode("done")} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
            I had this done
          </button>
          <button type="button" onClick={() => setMode("edit")} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            Change
          </button>
          <button type="button" disabled={pending} onClick={close} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
            {pending ? "Closing..." : "Stop tracking"}
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-[12.5px] text-[var(--danger)]">{error}</p>}
    </div>
  );
}

function VehicleCard({
  instanceId,
  vehicle,
  items,
  onVehicleChanged,
  onVehicleClosed,
  onItemAdded,
  onItemChanged,
  onItemRemoved,
  onRecorded,
  startWith,
}: {
  instanceId: string;
  vehicle: Vehicle;
  items: MaintenanceItem[];
  /** Open on the usual-jobs step, for a vehicle that has just been added. */
  startWith?: "profile";
  onVehicleChanged: (vehicle: Vehicle) => void;
  onVehicleClosed: (vehicle: Vehicle) => void;
  onItemAdded: (item: MaintenanceItem) => void;
  onItemChanged: (item: MaintenanceItem) => void;
  onItemRemoved: (id: string) => void;
} & Change) {
  const [panel, setPanel] = useState<"none" | "edit" | "mileage" | "addJob" | "profile" | "manual" | "starter" | "close">(startWith ?? "none");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const activeItems = items.filter((i) => i.vehicleId === vehicle.id && i.status === "active");
  const freshness = mileageFreshness(vehicle, todayIso(new Date()));
  const identity = [[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "), vehicle.fuelType ? FUEL_LABEL[vehicle.fuelType] : ""].filter(Boolean).join(" \u00b7 ");

  async function closeVehicle() {
    setPending(true);
    setError(null);
    const result = await archiveVehicle(vehicle.id);
    setPending(false);
    if (!result.ok) {
      setError(describeResultError(result.error));
      return;
    }
    onVehicleClosed(vehicle);
  }

  return (
    <section className={`${PANEL} p-5`}>
      {panel === "edit" ? (
        <VehicleForm
          instanceId={instanceId}
          vehicle={vehicle}
          onCancel={() => setPanel("none")}
          onSaved={(saved) => {
            onVehicleChanged(saved);
            setPanel("none");
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <div className="flex items-center gap-3">
              {vehicle.plate && <Plate>{vehicle.plate}</Plate>}
              <h3 className="text-[17px] font-bold tracking-[-0.01em] text-[var(--text)]">{vehicle.label}</h3>
            </div>
            {!vehicle.historyKnown && <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[var(--faint)]">History unknown</span>}
          </div>
          {identity && identity !== vehicle.label && <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{identity}</p>}

          {panel === "mileage" ? (
            <div className="mt-2">
              <MileageForm
                vehicle={vehicle}
                onCancel={() => setPanel("none")}
                onSaved={(saved) => {
                  onVehicleChanged(saved);
                  setPanel("none");
                }}
              />
            </div>
          ) : (
            <button type="button" onClick={() => setPanel("mileage")} className={`${MONO} mt-1 text-left text-[12px] text-[var(--muted)] hover:text-[var(--text)]`}>
              {vehicle.currentMileage ? `${vehicle.currentMileage.toLocaleString()} miles` : "Add current mileage"}
              {vehicle.mileageUpdatedAt ? `, as of ${vehicle.mileageUpdatedAt}` : ""}
              {freshness.state === "stale" && vehicle.currentMileage ? ". Worth updating." : ""}
            </button>
          )}

          <div className="mt-3 flex flex-col gap-2">
            {activeItems.length === 0 ? (
              <p className="text-[12.5px] text-[var(--faint)]">Nothing tracked on this vehicle yet.</p>
            ) : (
              activeItems.map((item) => (
                <ItemRow key={item.id} instanceId={instanceId} item={item} vehicle={vehicle} onChanged={onItemChanged} onRemoved={onItemRemoved} onRecorded={onRecorded} />
              ))
            )}
          </div>

          <div className="mt-3">
            {panel === "addJob" ? (
              <ItemForm
                instanceId={instanceId}
                vehicle={vehicle}
                onCancel={() => setPanel("none")}
                onSaved={(saved) => {
                  onItemAdded(saved);
                  setPanel("none");
                }}
              />
            ) : panel === "profile" ? (
              <ProfilePanel
                instanceId={instanceId}
                vehicle={vehicle}
                tracked={activeItems}
                onAdded={(added) => added.forEach(onItemAdded)}
                onManual={() => setPanel("manual")}
                onStarter={() => setPanel("starter")}
                onDone={() => setPanel("none")}
              />
            ) : panel === "manual" ? (
              <ManualJobsForm instanceId={instanceId} vehicle={vehicle} onAdded={(added) => added.forEach(onItemAdded)} onCancel={() => setPanel("none")} />
            ) : panel === "starter" ? (
              <StarterListPicker
                instanceId={instanceId}
                vehicle={vehicle}
                tracked={activeItems}
                onAdded={(added) => added.forEach(onItemAdded)}
                onCancel={() => setPanel("none")}
              />
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setPanel("addJob")}>
                  Track a job
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel("profile")}>
                  Usual jobs
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel("edit")}>
                  Change this vehicle
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPanel("close")}>
                  Close it
                </Button>
              </div>
            )}
          </div>

          {panel === "close" && (
            <div className="mt-3 rounded-[var(--radius)] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-3.5">
              <p className="text-[13px] leading-relaxed text-[var(--text)]">
                Closing a vehicle takes it out of Due and stops tracking its jobs. Nothing is deleted: its service record stays in History, so you can still print it after you sell the car.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <Button size="sm" variant="secondary" disabled={pending} onClick={closeVehicle}>
                  {pending ? "Closing..." : "Close this vehicle"}
                </Button>
                <Button size="sm" variant="ghost" disabled={pending} onClick={() => setPanel("none")}>
                  Keep it
                </Button>
              </div>
            </div>
          )}
          {error && <p className="mt-2 text-[12.5px] text-[var(--danger)]">{error}</p>}
        </>
      )}
    </section>
  );
}

export default function VehiclesModule() {
  const { status, errorMessage, instanceId, vehicles, items, addVehicle, replaceVehicle, removeVehicle, addItem, replaceItem, removeItem, addEvent } = useVehicleMaintenance();
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [newVehicleId, setNewVehicleId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (!instanceId) return null;

  function recorded(result: RecordedService) {
    addEvent(result.event);
    if (result.item) replaceItem(result.item);
    if (result.vehicle) replaceVehicle(result.vehicle);
    setNotice(result.warning);
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <ScreenHeading kicker="What you own, and what you track on it" title="Vehicles" />
        {!addingVehicle && (
          <Button size="sm" variant="secondary" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setAddingVehicle(true)}>
            Add vehicle
          </Button>
        )}
      </header>

      {notice && <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--danger)]">{notice}</p>}

      {addingVehicle && (
        <VehicleForm
          instanceId={instanceId}
          onSaved={(vehicle) => {
            addVehicle(vehicle);
            setNewVehicleId(vehicle.id);
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
            startWith={vehicle.id === newVehicleId ? "profile" : undefined}
            onVehicleChanged={replaceVehicle}
            onVehicleClosed={removeVehicle}
            onItemAdded={addItem}
            onItemChanged={replaceItem}
            onItemRemoved={removeItem}
            onRecorded={recorded}
          />
        ))
      )}
    </div>
  );
}
