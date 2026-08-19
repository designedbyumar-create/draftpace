"use client";

import { useCallback, useEffect, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Clock } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listMaintenanceLog } from "../domain/maintenanceLog";
import type { MaintenanceLogEntry } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/** History: a plain, reverse-chronological log of completed maintenance - what was done, and when. */
export default function HistoryModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entries, setEntries] = useState<MaintenanceLogEntry[]>([]);

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
    const result = await listMaintenanceLog(found.id);
    if (!result.ok) {
      setErrorMessage(describeResultError(result.error));
      setStatus("error");
      return;
    }
    setEntries([...result.data].sort((a, b) => b.performedAt.localeCompare(a.performedAt)));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        <h1 className="text-xl font-semibold text-[var(--text)]">History</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">Every maintenance task you've marked done, oldest to newest reversed.</p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nothing logged yet"
          description="Mark a maintenance task done from Attention or Maintenance, and it shows up here."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--faint)]" aria-hidden />
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[var(--text)]">{entry.description}</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                  {entry.performedAt}
                  {entry.performedBy && ` · ${entry.performedBy}`}
                </p>
                {entry.notes && <p className="mt-1 text-[12px] text-[var(--muted)]">{entry.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
