"use client";

import FirstRun from "@/components/platform/FirstRun";
import FirstRunTour from "@/components/platform/FirstRunTour";
import { VEHICLE_MAINTENANCE_COMPANION_SLUG } from "../instanceData";
import type { TourStep } from "@/components/platform/GuidedTour";
import { useMemo, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Car } from "@/design-system/Icon";
import { deriveDueView, type DueVehicleItem } from "../dueStatus";
import { deriveRenewalsView } from "../renewals";
import { filterDueView, filterRenewals, vehicleLamps } from "../fleet";
import { mileageFreshness, needsMileage, todayIso } from "../mileageFreshness";
import DueScreen, { type MileageNotice } from "./DueScreen";
import { RecordServiceForm } from "./ServiceForm";
import MileageForm from "./MileageForm";
import { useVehicleMaintenance } from "./useVehicleMaintenance";

const TOUR_STEPS: TourStep[] = [
  {
    targetId: "empty-state",
    title: "Nothing is due yet",
    body: "Due computes from intervals and facts you record. With no vehicle added there is nothing to judge, so it says nothing rather than guessing at a schedule.",
  },
  {
    targetId: "rail-vehicles",
    title: "Add a vehicle first",
    body: "Say what you call it and whether you actually know its service history. If you do not, nothing will ever read as overdue on a fact you never had.",
  },
  {
    targetId: "rail-workspace",
    title: "What is due, ranked",
    body: "One view across every vehicle you own, most urgent first, computed only from what you entered.",
  },
];

/**
 * The single ranked "what's due" view. Everything shown is read from
 * deriveDueView(), deriveRenewalsView() and mileageFreshness(), never
 * computed or restated here; this module owns only which form is open and
 * what happens to the state once something is recorded.
 */
export default function WorkspaceModule() {
  const { status, errorMessage, instanceId, vehicles, items, renewals, replaceItem, replaceVehicle, addEvent } = useVehicleMaintenance();
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [openMileageId, setOpenMileageId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filterId, setFilterId] = useState<string | null>(null);

  const today = todayIso(new Date());
  const view = useMemo(() => deriveDueView(vehicles, items, new Date()), [vehicles, items]);
  const renewalsView = useMemo(() => deriveRenewalsView(vehicles, renewals, today), [vehicles, renewals, today]);
  const allRenewals = useMemo(() => [...renewalsView.pastDate, ...renewalsView.soon], [renewalsView]);
  const lamps = useMemo(() => vehicleLamps(vehicles, view, allRenewals), [vehicles, view, allRenewals]);
  // A vehicle that has since been closed can no longer be the one Due is narrowed to.
  const activeFilter = filterId !== null && vehicles.some((v) => v.id === filterId) ? filterId : null;
  const mileageNotices = useMemo<MileageNotice[]>(() => {
    const notices: MileageNotice[] = [];
    for (const vehicle of vehicles) {
      const tracksDistance = items.some((i) => i.vehicleId === vehicle.id && i.status === "active" && i.intervalMiles !== null);
      if (!tracksDistance) continue;
      const freshness = mileageFreshness(vehicle, today);
      if (needsMileage(vehicle, items)) notices.push({ vehicle, kind: "none", freshness });
      else if (freshness.state === "stale") notices.push({ vehicle, kind: "stale", freshness });
    }
    return notices;
  }, [vehicles, items, today]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") {
    return <EmptyState icon={Car} title="Nothing to show yet" description="This product has not been set up on your account." />;
  }
  if (status === "error") {
    return <EmptyState icon={Car} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  }
  if (vehicles.length === 0) {
    return (
      <FirstRun
        slug={VEHICLE_MAINTENANCE_COMPANION_SLUG}
        icon={Car}
        title="No vehicles yet"
        description="Add a vehicle to start tracking what it needs, then this screen will show what's due across everything you own."
        actionLabel="Add your first vehicle"
        destination="vehicles"
        steps={TOUR_STEPS}
      />
    );
  }

  return (
    <>
      <FirstRunTour slug={VEHICLE_MAINTENANCE_COMPANION_SLUG} steps={TOUR_STEPS} />
      <DueScreen
        view={filterDueView(view, activeFilter)}
        vehicles={vehicles}
        lamps={lamps}
        filterId={activeFilter}
        onFilter={setFilterId}
        renewals={filterRenewals(allRenewals, activeFilter)}
        mileageNotices={activeFilter ? mileageNotices.filter((n) => n.vehicle.id === activeFilter) : mileageNotices}
        openItemId={openItemId}
        onOpen={(id) => {
          setActionError(null);
          setOpenItemId(id);
        }}
        renderForm={(entry: DueVehicleItem) =>
          instanceId && (
            <RecordServiceForm
              instanceId={instanceId}
              vehicle={entry.vehicle}
              item={entry.item}
              submitLabel="Save"
              onCancel={() => setOpenItemId(null)}
              onSaved={(recorded) => {
                addEvent(recorded.event);
                if (recorded.item) replaceItem(recorded.item);
                if (recorded.vehicle) replaceVehicle(recorded.vehicle);
                setActionError(recorded.warning);
                setOpenItemId(null);
              }}
            />
          )
        }
        openMileageId={openMileageId}
        onOpenMileage={setOpenMileageId}
        renderMileageForm={(vehicle) => (
          <MileageForm
            vehicle={vehicle}
            onCancel={() => setOpenMileageId(null)}
            onSaved={(updated) => {
              replaceVehicle(updated);
              setOpenMileageId(null);
            }}
          />
        )}
        actionError={actionError}
      />
    </>
  );
}
