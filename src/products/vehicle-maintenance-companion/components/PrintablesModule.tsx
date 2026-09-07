"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Article, Car } from "@/design-system/Icon";
import { useVehicleMaintenance } from "./useVehicleMaintenance";
import type { Vehicle } from "../state";

function dateLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Choosing a vehicle, then choosing which of its tracked jobs are
 * requested today. Everything not checked becomes the printable's "not
 * authorized" list; this module never decides that split itself, it
 * only renders the choice back once it's made.
 */
export default function PrintablesModule({ definition }: { definition: ProductDefinition }) {
  const { status, errorMessage, vehicles, items } = useVehicleMaintenance();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [making, setMaking] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (vehicles.length === 0) {
    return <EmptyState icon={Car} title="No vehicles yet" description="Add a vehicle in Vehicles before generating a Service Boundary." />;
  }

  const vehicle: Vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];
  const vehicleItems = items.filter((i) => i.vehicleId === vehicle.id && i.status === "active");

  function toggle(id: string) {
    setRequestedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function generate() {
    setMaking(true);
    setGenerateError(null);
    try {
      const { downloadServiceBoundary } = await import("../printables/generateServiceBoundary");
      await downloadServiceBoundary({
        generatedLabel: dateLabel(new Date()),
        vehicle: {
          label: vehicle.label,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          currentMileage: vehicle.currentMileage,
        },
        requested: vehicleItems.filter((i) => requestedIds.has(i.id)).map((i) => i.taskName),
        notAuthorized: vehicleItems.filter((i) => !requestedIds.has(i.id)).map((i) => i.taskName),
        origin: window.location.origin,
        slug: definition.slug,
      });
    } catch {
      // A failed generation must never look like a saved download.
      setGenerateError("The document could not be made. Nothing was downloaded.");
    } finally {
      setMaking(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">Boundary</p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--text)]">Service Boundary</h1>
        <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">
          A dated, mileage-stamped document you can hand to a shop: exactly what you&apos;re requesting today, and
          what is explicitly not authorized without a call first.
        </p>
      </div>

      {vehicles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {vehicles.map((v) => (
            <Button key={v.id} size="sm" variant={v.id === vehicle.id ? "primary" : "secondary"} onClick={() => setVehicleId(v.id)}>
              {v.label}
            </Button>
          ))}
        </div>
      )}

      <Surface className="flex flex-col gap-3">
        <p className="text-[13px] font-semibold text-[var(--text)]">What are you requesting today?</p>
        {vehicleItems.length === 0 ? (
          <p className="text-[12.5px] text-[var(--faint)]">Nothing is tracked on this vehicle yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {vehicleItems.map((item) => (
              <label key={item.id} className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
                <input
                  type="checkbox"
                  checked={requestedIds.has(item.id)}
                  onChange={() => toggle(item.id)}
                  className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                />
                <span>{item.taskName}</span>
              </label>
            ))}
          </div>
        )}
        <p className="text-[12px] text-[var(--faint)]">
          Everything left unchecked prints under &quot;not authorized without a further conversation.&quot;
        </p>
      </Surface>

      <Surface className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
            <Article size={18} aria-hidden />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text)]">Service Boundary</p>
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">Generated fresh each time, dated and mileage-stamped.</p>
          </div>
        </div>
        <Button variant="commit" size="sm" disabled={making} onClick={generate}>
          {making ? "Preparing..." : "Generate"}
        </Button>
      </Surface>

      {generateError && <p className="text-[13px] text-[var(--danger)]">{generateError}</p>}
    </div>
  );
}
