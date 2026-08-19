"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { User, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listServiceProviders, createServiceProvider, updateServiceProvider, archiveServiceProvider } from "../domain/serviceProviders";
import type { ServiceProvider } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import ServiceProviderFormSheet, {
  serviceProviderFormValuesToPatch,
  type ServiceProviderFormValues,
} from "./providers/ServiceProviderFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function ServiceProvidersModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
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
    const result = await listServiceProviders(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setProviders(result.data);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: ServiceProviderFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your home. Try reloading the page.";
    if (editingProvider) {
      const result = await updateServiceProvider(editingProvider.id, serviceProviderFormValuesToPatch(values));
      if (!result.ok) return describeResultError(result.error);
      setProviders((prev) => prev.map((p) => (p.id === result.data.id ? result.data : p)));
      return null;
    }
    const result = await createServiceProvider(instanceId, serviceProviderFormValuesToPatch(values));
    if (!result.ok) return describeResultError(result.error);
    setProviders((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(provider: ServiceProvider) {
    const result = await archiveServiceProvider(provider.id);
    if (result.ok) setProviders((prev) => prev.map((p) => (p.id === result.data.id ? result.data : p)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading service providers…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={User}
        title="Couldn't load your service providers"
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
    return <EmptyState icon={User} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = providers.filter((p) => p.status !== "archived");
  const archived = providers.filter((p) => p.status === "archived");

  return (
    <SectionShell
      icon={User}
      title="Service providers"
      purpose="Who you've called before, so the next time is a lookup, not a search."
      onAdd={() => {
        setEditingProvider(null);
        setFormOpen(true);
      }}
      addLabel="Add provider"
      summary={
        <StatRow>
          <StatTile label="Saved" value={String(active.length)} />
        </StatRow>
      }
      dominantAction={null}
    >
      {active.length === 0 ? (
        <EmptyState
          icon={User}
          title="No service providers yet"
          description="Add one after your next repair, and you'll have the number next time."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add provider
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={() => {
                setEditingProvider(provider);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(provider)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} archived
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <ServiceProviderFormSheet
        open={formOpen}
        provider={editingProvider}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function ProviderCard({
  provider,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  provider: ServiceProvider;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{provider.name}</p>
            <Badge tone={STATUS_TONE[provider.status]}>{STATUS_LABEL[provider.status]}</Badge>
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {provider.category && `${provider.category} · `}
            {provider.phone || provider.email || "No contact info on file"}
          </p>
          {provider.lastUsedAt && <p className="mt-1 text-[12px] text-[var(--muted)]">Last used {provider.lastUsedAt}</p>}
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
