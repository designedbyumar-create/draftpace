"use client";

import { useCallback, useEffect, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listMaintenanceLog } from "../domain/maintenanceLog";
import { listServiceProviders } from "../domain/serviceProviders";
import { formatCurrency } from "@/lib/currency";
import { describeElapsed, daysBetween } from "../homeVoice";
import { HOME_BASE_CURRENCY } from "./care/CareActionSheet";
import type { MaintenanceLogEntry, ServiceProvider } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * The home's memory: what was taken care of, when, who did it, and what
 * it cost. Only real events appear here, written when someone records
 * that a job was done. It is not an audit trail of database changes.
 */
export default function HistoryModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entries, setEntries] = useState<MaintenanceLogEntry[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);

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
    const [result, providersResult] = await Promise.all([listMaintenanceLog(found.id), listServiceProviders(found.id)]);
    setProviders(providersResult.ok ? providersResult.data : []);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setEntries([...result.data].filter((e) => e.status !== "archived").sort((a, b) => b.performedAt.localeCompare(a.performedAt)));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const providerName = (id: string | null) => (id ? providers.find((p) => p.id === id)?.name ?? null : null);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading History…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Clock}
        title="Couldn't load History"
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
    return <EmptyState icon={Clock} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">What&apos;s been done</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Your home&apos;s memory: what was taken care of, when, who did it, and what it cost.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nothing here yet"
          description="Once you take care of something, it stays here so you can look it up later."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[var(--text)]">{entry.description}</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">{describeEvent(entry, providerName(entry.providerId))}</p>
                {entry.notes && <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--text)]">{entry.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** One factual line: when, who, and what it cost. Omits anything that was never recorded rather than showing a blank. */
function describeEvent(entry: MaintenanceLogEntry, provider: string | null): string {
  const parts = [describeElapsed(daysBetween(entry.performedAt, new Date()))];
  const who = provider ?? entry.performedBy;
  parts.push(who ? `by ${who}` : "by you");
  if (entry.costMinorUnits !== null) parts.push(formatCurrency(entry.costMinorUnits, HOME_BASE_CURRENCY));
  return parts.join(" · ");
}
