"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Article } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveRenewal } from "../domain/renewals";
import { cardData } from "../printData";
import { evaluateRenewal, type RenewalEntry } from "../renewals";
import { todayIso } from "../mileageFreshness";
import PaperworkScreen from "./PaperworkScreen";
import { DetailsForm, RenewalForm } from "./PaperworkForms";
import { useVehicleMaintenance } from "./useVehicleMaintenance";

export default function PaperworkModule({ definition }: { definition: { slug: string } }) {
  const { status, errorMessage, instanceId, vehicles, renewals, renewalsAvailable, replaceVehicle, addRenewal, replaceRenewal } = useVehicleMaintenance();
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);
  const [renewalFormKey, setRenewalFormKey] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const today = todayIso(new Date());
  const perVehicle = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        vehicle,
        entries: renewals
          .filter((r) => r.vehicleId === vehicle.id && r.status === "active")
          .map((r) => evaluateRenewal(r, vehicle, today))
          .sort((a, b) => a.days - b.days),
      })),
    [vehicles, renewals, today]
  );

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") return <EmptyState icon={Article} title="Nothing to show yet" description="This product has not been set up on your account." />;
  if (status === "error") return <EmptyState icon={Article} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  if (vehicles.length === 0) return <EmptyState icon={Article} title="No vehicles yet" description="Add a vehicle first. Its dates and glove box details live here." />;

  async function remove(entry: RenewalEntry) {
    setRemovingId(entry.renewal.id);
    setNotice(null);
    const result = await archiveRenewal(entry.renewal.id);
    setRemovingId(null);
    if (!result.ok) {
      setNotice(describeResultError(result.error));
      return;
    }
    replaceRenewal(result.data);
  }

  return (
    <PaperworkScreen
      available={renewalsAvailable}
      vehicles={perVehicle}
      detailsOpenId={detailsOpenId}
      onOpenDetails={setDetailsOpenId}
      renderDetailsForm={(vehicle) => (
        <DetailsForm
          vehicle={vehicle}
          onCancel={() => setDetailsOpenId(null)}
          onSaved={(saved) => {
            replaceVehicle(saved);
            setDetailsOpenId(null);
          }}
        />
      )}
      renewalFormKey={renewalFormKey}
      onOpenRenewalForm={setRenewalFormKey}
      renderRenewalForm={(vehicle, entry) =>
        instanceId && (
          <RenewalForm
            instanceId={instanceId}
            vehicle={vehicle}
            renewal={entry?.renewal}
            onCancel={() => setRenewalFormKey(null)}
            onSaved={(saved) => {
              if (entry) replaceRenewal(saved);
              else addRenewal(saved);
              setRenewalFormKey(null);
            }}
          />
        )
      }
      onRemoveRenewal={remove}
      removingId={removingId}
      printingId={printingId}
      notice={notice}
      onPrintCard={async (vehicle) => {
        setPrintingId(vehicle.id);
        setNotice(null);
        try {
          const { downloadGloveBoxCard } = await import("../printables/generateGloveBoxCard");
          await downloadGloveBoxCard(cardData({ vehicle, renewals, now: new Date(), origin: window.location.origin, slug: definition.slug }));
        } catch {
          setNotice("The document could not be made. Nothing was downloaded.");
        } finally {
          setPrintingId(null);
        }
      }}
    />
  );
}
