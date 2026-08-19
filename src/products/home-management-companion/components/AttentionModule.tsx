"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Bell, WarningCircle, CheckCircle2 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listAppliances } from "../domain/appliances";
import { listMaintenanceTasks, markMaintenanceTaskDone } from "../domain/maintenanceTasks";
import { listProblems } from "../domain/problems";
import { deriveAttentionItems, type AttentionInputs, type AttentionItem } from "../attention";
import type { MaintenanceTask } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Attention: one deterministic list of what genuinely needs a look,
 * derived from the same stored dates Records itself shows (attention.ts),
 * never a second opinion. An item leaves this list the moment its
 * underlying record no longer has the issue, same discipline as PFC's
 * Attention module.
 */
export default function AttentionModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttentionInputs | null>(null);
  const [tasksById, setTasksById] = useState<Map<string, MaintenanceTask>>(new Map());
  const [completingId, setCompletingId] = useState<string | null>(null);

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
    const [appliancesResult, tasksResult, problemsResult] = await Promise.all([
      listAppliances(found.id),
      listMaintenanceTasks(found.id),
      listProblems(found.id),
    ]);
    if (!appliancesResult.ok) {
      setErrorMessage(describeResultError(appliancesResult.error));
      setStatus("error");
      return;
    }
    if (!tasksResult.ok) {
      setErrorMessage(describeResultError(tasksResult.error));
      setStatus("error");
      return;
    }
    if (!problemsResult.ok) {
      setErrorMessage(describeResultError(problemsResult.error));
      setStatus("error");
      return;
    }
    setRecords({ appliances: appliancesResult.data, maintenanceTasks: tasksResult.data, problems: problemsResult.data });
    setTasksById(new Map(tasksResult.data.map((task) => [task.id, task])));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const items = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);

  async function handleMarkDone(item: AttentionItem) {
    if (!instanceId) return;
    const task = tasksById.get(item.entityId);
    if (!task) return;
    setCompletingId(item.id);
    const result = await markMaintenanceTaskDone(task, instanceId);
    setCompletingId(null);
    if (result.ok) {
      setTasksById((prev) => new Map(prev).set(task.id, result.data));
      setRecords((prev) =>
        prev ? { ...prev, maintenanceTasks: prev.maintenanceTasks.map((t) => (t.id === task.id ? result.data : t)) } : prev
      );
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading Attention…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Bell}
        title="Couldn't load Attention"
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
    return <EmptyState icon={Bell} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const needsResolution = items.filter((item) => item.urgency === "needsResolution");
  const worthAWhile = items.filter((item) => item.urgency === "worthAWhile");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">Attention</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Everything here is derived from what you&apos;ve recorded. Mark it done or update the record, and it disappears on its own.
        </p>
      </div>

      {items.length === 0 ? (
        <Surface elevated className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">You&apos;re caught up.</p>
            <p className="text-[13px] text-[var(--muted)]">Nothing needs a look right now.</p>
          </div>
        </Surface>
      ) : (
        <div className="flex flex-col gap-6">
          {needsResolution.length > 0 && (
            <AttentionGroup
              title="Needs resolution"
              items={needsResolution}
              completingId={completingId}
              onMarkDone={handleMarkDone}
            />
          )}
          {worthAWhile.length > 0 && (
            <AttentionGroup title="Worth a while" items={worthAWhile} completingId={completingId} onMarkDone={handleMarkDone} />
          )}
        </div>
      )}
    </div>
  );
}

function AttentionGroup({
  title,
  items,
  completingId,
  onMarkDone,
}: {
  title: string;
  items: AttentionItem[];
  completingId: string | null;
  onMarkDone: (item: AttentionItem) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
        {title} ({items.length})
      </p>
      <ul className="mt-2 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5">
            <WarningCircle
              className={`mt-0.5 h-4 w-4 shrink-0 ${item.urgency === "needsResolution" ? "text-[var(--warning)]" : "text-[var(--faint)]"}`}
              aria-hidden
            />
            <div className="flex-1">
              <Link href={item.href} className="text-[14px] font-medium text-[var(--text)] hover:text-[var(--primary)] hover:underline">
                {item.message}
              </Link>
            </div>
            {item.kind === "maintenanceDue" && (
              <Button size="sm" variant="secondary" onClick={() => onMarkDone(item)} disabled={completingId === item.id}>
                {completingId === item.id ? "Marking…" : "Mark done"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
