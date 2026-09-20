"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { archiveServiceEvent } from "../domain/serviceEvents";
import { resyncItem } from "../domain/recordService";
import { recordData } from "../printData";
import { historyByYear } from "../serviceHistory";
import HistoryScreen from "./HistoryScreen";
import { EditServiceForm, RecordServiceForm } from "./ServiceForm";
import { useVehicleMaintenance } from "./useVehicleMaintenance";

export default function HistoryModule({ definition }: { definition: { slug: string } }) {
  const { status, errorMessage, instanceId, vehicles, closedVehicles, items, events, historyAvailable, addEvent, replaceEvent, replaceItem, replaceVehicle } = useVehicleMaintenance();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  const all = useMemo(() => [...vehicles, ...closedVehicles], [vehicles, closedVehicles]);
  const groups = useMemo(() => historyByYear(events, selectedId), [events, selectedId]);

  if (status === "loading") return <p className="text-[13px] text-[var(--faint)]">Loading...</p>;
  if (status === "no-instance") return <EmptyState icon={Clock} title="Nothing to show yet" description="This product has not been set up on your account." />;
  if (status === "error") return <EmptyState icon={Clock} title="Couldn't load this" description={errorMessage ?? "Try again."} />;
  if (all.length === 0) return <EmptyState icon={Clock} title="No vehicles yet" description="Add a vehicle first. Every service you record for it is kept here." />;

  const selected = all.find((v) => v.id === selectedId) ?? null;
  // A service is logged against a vehicle that is still being driven: the chosen one, or the only one.
  const logVehicle = selected && selected.status === "active" ? selected : vehicles.length === 1 ? vehicles[0] : null;

  async function remove(event: (typeof events)[number]) {
    setRemovingId(event.id);
    setNotice(null);
    const result = await archiveServiceEvent(event.id);
    if (!result.ok) {
      setRemovingId(null);
      setNotice(describeResultError(result.error));
      return;
    }
    replaceEvent(result.data);
    const item = event.itemId ? items.find((i) => i.id === event.itemId) : undefined;
    if (item) {
      const synced = await resyncItem(item, events.filter((e) => e.id !== event.id));
      if (synced.ok && synced.data) replaceItem(synced.data);
    }
    setRemovingId(null);
  }

  async function print() {
    if (!selected) return;
    setPrinting(true);
    setNotice(null);
    try {
      const { downloadServiceRecord } = await import("../printables/generateServiceRecord");
      await downloadServiceRecord(recordData({ vehicle: selected, events, now: new Date(), origin: window.location.origin, slug: definition.slug }));
    } catch {
      setNotice("The document could not be made. Nothing was downloaded.");
    } finally {
      setPrinting(false);
    }
  }

  return (
    <HistoryScreen
      available={historyAvailable}
      choices={all.map((v) => ({ id: v.id, label: v.label, closed: v.status === "archived" }))}
      selectedId={selectedId}
      onSelect={(id) => {
        setSelectedId(id);
        setLogOpen(false);
      }}
      groups={groups}
      labelFor={(id) => all.find((v) => v.id === id)?.label ?? ""}
      logOpen={logOpen}
      onOpenLog={() => setLogOpen(true)}
      canLog={logVehicle !== null || vehicles.length > 1}
      renderLogForm={() => {
        if (!instanceId) return null;
        if (!logVehicle) {
          return <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-[13px] text-[var(--muted)]">Choose which vehicle it was for, above, then log the service.</p>;
        }
        return (
          <RecordServiceForm
            instanceId={instanceId}
            vehicle={logVehicle}
            item={null}
            jobChoices={items.filter((i) => i.vehicleId === logVehicle.id && i.status === "active")}
            onCancel={() => setLogOpen(false)}
            onSaved={(recorded) => {
              addEvent(recorded.event);
              if (recorded.item) replaceItem(recorded.item);
              if (recorded.vehicle) replaceVehicle(recorded.vehicle);
              setNotice(recorded.warning);
              setLogOpen(false);
            }}
          />
        );
      }}
      editingId={editingId}
      onEdit={setEditingId}
      renderEditForm={(event) => (
        <EditServiceForm
          event={event}
          events={events}
          item={event.itemId ? (items.find((i) => i.id === event.itemId) ?? null) : null}
          onCancel={() => setEditingId(null)}
          onSaved={(saved, syncedItem) => {
            replaceEvent(saved);
            if (syncedItem) replaceItem(syncedItem);
            setEditingId(null);
          }}
        />
      )}
      onRemove={remove}
      removingId={removingId}
      notice={notice}
      onPrint={print}
      printing={printing}
      printLabel={selected?.label ?? null}
    />
  );
}
