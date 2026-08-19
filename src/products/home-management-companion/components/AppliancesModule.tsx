"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Home, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listAppliances, createAppliance, updateAppliance, archiveAppliance } from "../domain/appliances";
import type { Appliance } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import ApplianceFormSheet, { applianceFormValuesToPatch, type ApplianceFormValues } from "./appliances/ApplianceFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

const CATEGORY_LABEL: Record<Appliance["category"], string> = {
  appliance: "Appliance",
  system: "Home system",
  other: "Other",
};

export default function AppliancesModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<Appliance | null>(null);
  const addButtonRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    const found = await findHomeManagementCompanionInstanceId();
    if (found.status === "error") {
      setErrorMessage(found.message);
      setStatus("error");
      return;
    }
    if (found.status === "not-found") {
      setStatus("no-instance");
      return;
    }
    setInstanceId(found.id);
    const result = await listAppliances(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setAppliances(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: ApplianceFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your home. Try reloading the page.";
    if (editingAppliance) {
      const result = await updateAppliance(editingAppliance.id, applianceFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setAppliances((prev) => prev.map((a) => (a.id === result.data.id ? result.data : a)));
      return null;
    }
    const result = await createAppliance(instanceId, applianceFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setAppliances((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(appliance: Appliance) {
    const result = await archiveAppliance(appliance.id);
    if (result.ok) setAppliances((prev) => prev.map((a) => (a.id === result.data.id ? result.data : a)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading appliances…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Home}
        title="Couldn't load your appliances"
        description={errorMessage ?? "Something went wrong. Try again."}
        action={
          <Button size="sm" variant="secondary" onClick={load}>
            Retry
          </Button>
        }
      />
    );
  }

  if (status === "no-instance") {
    return <EmptyState icon={Home} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = appliances.filter((a) => a.status !== "archived");
  const archived = appliances.filter((a) => a.status === "archived");
  const withWarranty = active.filter((a) => a.warrantyExpiresAt).length;

  return (
    <SectionShell
      icon={Home}
      title="Appliances"
      purpose="What's in your home, when it was bought, and when its warranty runs out."
      onAdd={() => {
        setEditingAppliance(null);
        setFormOpen(true);
      }}
      addLabel="Add appliance"
      summary={
        <StatRow>
          <StatTile label="Tracked" value={String(active.length)} />
          <StatTile label="With warranty on file" value={String(withWarranty)} tone="muted" />
        </StatRow>
      }
      dominantAction={null}
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No appliances yet"
          description="Add one to start tracking its warranty and maintenance."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add appliance
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((appliance) => (
            <ApplianceCard
              key={appliance.id}
              appliance={appliance}
              onEdit={() => {
                setEditingAppliance(appliance);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(appliance)}
            />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            {showArchived ? "Hide" : "Show"} {archived.length} archived {archived.length === 1 ? "appliance" : "appliances"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((appliance) => (
                <ApplianceCard key={appliance.id} appliance={appliance} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <ApplianceFormSheet
        open={formOpen}
        appliance={editingAppliance}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function ApplianceCard({
  appliance,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  appliance: Appliance;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{appliance.name}</p>
            <Badge tone={STATUS_TONE[appliance.status]}>{STATUS_LABEL[appliance.status]}</Badge>
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {CATEGORY_LABEL[appliance.category]}
            {appliance.brand && ` · ${appliance.brand}`}
            {appliance.model && ` ${appliance.model}`}
          </p>
          {appliance.warrantyExpiresAt && (
            <p className="mt-1 text-[12px] text-[var(--muted)]">Warranty expires {appliance.warrantyExpiresAt}</p>
          )}
        </button>
        {!readOnly && (
          <Button size="sm" variant="ghost" onClick={onArchive}>
            Archive
          </Button>
        )}
      </div>
    </li>
  );
}
