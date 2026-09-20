"use client";

import { useState } from "react";
import type { ProductDefinition } from "@/product-framework/definition";
import Surface from "@/design-system/Surface";
import Button from "@/design-system/Button";
import Input from "@/design-system/Input";
import EmptyState from "@/design-system/EmptyState";
import { Article, Car } from "@/design-system/Icon";
import { ChipRow, ScreenHeading } from "./Workshop";
import { boundaryData, cardData, recordData } from "../printData";
import { useVehicleMaintenance } from "./useVehicleMaintenance";
import type { Vehicle } from "../state";

/**
 * Three things to print. The Service Boundary is what you hand a shop
 * before they touch the car; the service record is what you hand a buyer;
 * the glove box card is what you keep in the car. Each is made fresh in the
 * browser, none is stored, and none is anything but what was typed in.
 */
export default function PrintablesModule({ definition }: { definition: ProductDefinition }) {
  const { status, errorMessage, vehicles, closedVehicles, items, events, renewals } = useVehicleMaintenance();
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [alsoRequested, setAlsoRequested] = useState("");
  const [shop, setShop] = useState("");
  const [callNumber, setCallNumber] = useState("");
  const [ceiling, setCeiling] = useState("");
  const [askForOldParts, setAskForOldParts] = useState(false);
  const [making, setMaking] = useState<"boundary" | "record" | "card" | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (vehicles.length === 0 && closedVehicles.length === 0) {
    return <EmptyState icon={Car} title="No vehicles yet" description="Add a vehicle in Vehicles before printing anything." />;
  }

  const choices: Vehicle[] = [...vehicles, ...closedVehicles];
  const vehicle: Vehicle = choices.find((v) => v.id === vehicleId) ?? choices[0];
  const isClosed = vehicle.status === "archived";
  const vehicleItems = items.filter((i) => i.vehicleId === vehicle.id && i.status === "active");
  const where = () => ({ origin: window.location.origin, slug: definition.slug, now: new Date() });

  function toggle(id: string) {
    setRequestedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function make(kind: "boundary" | "record" | "card") {
    setMaking(kind);
    setGenerateError(null);
    try {
      if (kind === "boundary") {
        const { downloadServiceBoundary } = await import("../printables/generateServiceBoundary");
        await downloadServiceBoundary(boundaryData({ vehicle, items, requestedIds, alsoRequestedText: alsoRequested, shop, callNumber, ceiling, askForOldParts, ...where() }));
      } else if (kind === "record") {
        const { downloadServiceRecord } = await import("../printables/generateServiceRecord");
        await downloadServiceRecord(recordData({ vehicle, events, ...where() }));
      } else {
        const { downloadGloveBoxCard } = await import("../printables/generateGloveBoxCard");
        await downloadGloveBoxCard(cardData({ vehicle, renewals, ...where() }));
      }
    } catch {
      // A failed generation must never look like a saved download.
      setGenerateError("The document could not be made. Nothing was downloaded.");
    } finally {
      setMaking(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <ScreenHeading kicker="One for the shop, one for a buyer, one for the glove box" title="Print" />
        <p className="mt-3 max-w-lg text-[13.5px] leading-relaxed text-[var(--muted)]">Each is made fresh, nothing is stored, and every line is something you typed.</p>
      </div>

      {choices.length > 1 && (
        <ChipRow label="Vehicle" activeId={vehicle.id} onPick={(id) => id && setVehicleId(id)} items={choices.map((c) => ({ id: c.id, text: `${c.plate ?? c.label}${c.status === "archived" ? " (closed)" : ""}` }))} />
      )}

      <Surface className="flex flex-col gap-4">
        <div>
          <p className="text-[15px] font-semibold text-[var(--text)]">Service Boundary</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
            A dated, mileage-stamped page you hand over before a shop touches the car: exactly what you are requesting today, and that anything else needs a call first.
          </p>
        </div>
        {isClosed ? (
          <p className="text-[12.5px] text-[var(--faint)]">This vehicle is closed. A boundary is for a car you are about to take in.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <Input label="Shop (optional)" value={shop} onChange={(e) => setShop(e.target.value)} placeholder="Main Street Garage" containerClassName="flex-1" />
              <Input label="Number to call you on (optional)" value={callNumber} onChange={(e) => setCallNumber(e.target.value)} containerClassName="flex-1" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--text)]">What are you requesting today?</p>
              {vehicleItems.length === 0 ? (
                <p className="mt-1 text-[12.5px] text-[var(--faint)]">Nothing is tracked on this vehicle yet. You can still write what you want below.</p>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  {vehicleItems.map((item) => (
                    <label key={item.id} className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
                      <input type="checkbox" checked={requestedIds.has(item.id)} onChange={() => toggle(item.id)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
                      <span>{item.taskName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-semibold text-[var(--text)]">Anything else you are asking for (optional, one per line)</span>
              <textarea
                value={alsoRequested}
                onChange={(e) => setAlsoRequested(e.target.value)}
                rows={3}
                placeholder="Look at the noise from the rear left wheel"
                className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-[16px] text-[var(--text)] placeholder-[var(--faint)]"
              />
            </label>
            <Input label="Do not go over this without calling (optional)" value={ceiling} onChange={(e) => setCeiling(e.target.value)} placeholder="$200" hint="Printed as you type it. Draftpace does not check or use the amount." />
            <label className="flex items-start gap-2.5 text-[13px] text-[var(--text)]">
              <input type="checkbox" checked={askForOldParts} onChange={(e) => setAskForOldParts(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
              <span>Ask them to keep any parts they replace, so I can see them</span>
            </label>
          </>
        )}
        <div className="flex items-center gap-3">
          <Button variant="commit" size="sm" disabled={making !== null || isClosed} onClick={() => make("boundary")}>
            {making === "boundary" ? "Preparing..." : "Make the Service Boundary"}
          </Button>
        </div>
      </Surface>

      <Surface className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
            <Article size={18} aria-hidden />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">Service record</p>
            <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
              Everything recorded for {vehicle.label}, oldest first. It says it is your own record, not a shop&apos;s.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" disabled={making !== null} onClick={() => make("record")}>
          {making === "record" ? "Preparing..." : "Make the record"}
        </Button>
      </Surface>

      <Surface className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--primary)]">
            <Article size={18} aria-hidden />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">Glove box card</p>
            <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">Registration plate, VIN, tire size, oil, insurance and the dates you are watching. Fill the details in on Paperwork first.</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" disabled={making !== null} onClick={() => make("card")}>
          {making === "card" ? "Preparing..." : "Make the card"}
        </Button>
      </Surface>

      {generateError && <p className="text-[13px] text-[var(--danger)]">{generateError}</p>}
    </div>
  );
}
