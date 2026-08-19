"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import Surface from "@/design-system/Surface";
import EmptyState from "@/design-system/EmptyState";
import { Bell, CheckCircle2 } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems } from "../domain/homeItems";
import {
  listMaintenanceTasks,
  markMaintenanceTaskDone,
  snoozeMaintenanceTask,
  skipMaintenanceTask,
} from "../domain/maintenanceTasks";
import { listProblems } from "../domain/problems";
import { deriveAttentionItems, type AttentionInputs, type AttentionItem } from "../attention";
import { DEFAULT_SNOOZE_DAYS } from "../homeVoice";
import type { MaintenanceTask } from "../state";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";
type PendingAction = { id: string; label: string } | null;

/**
 * Attention: what the home needs, in rank order, derived from the same
 * stored dates and curated knowledge everything else reads (attention.ts).
 *
 * Three actions per piece of care, because "not now" is a legitimate
 * answer and a product that only offers "done" is keeping score. Snooze
 * defers briefly; Skip treats this cycle as intentionally passed and
 * moves to the next one. Neither touches the last-done date, since the
 * work genuinely did not happen.
 */
export default function AttentionModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [records, setRecords] = useState<AttentionInputs | null>(null);
  const [tasksById, setTasksById] = useState<Map<string, MaintenanceTask>>(new Map());
  const [pending, setPending] = useState<PendingAction>(null);

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
    const [itemsResult, tasksResult, problemsResult] = await Promise.all([
      listHomeItems(found.id),
      listMaintenanceTasks(found.id),
      listProblems(found.id),
    ]);
    if (!itemsResult.ok) {
      setErrorMessage(describeResultError(itemsResult.error));
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
    setRecords({ homeItems: itemsResult.data, maintenanceTasks: tasksResult.data, problems: problemsResult.data });
    setTasksById(new Map(tasksResult.data.map((task) => [task.id, task])));
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = useMemo(() => new Date(), []);
  const items = useMemo(() => (records ? deriveAttentionItems(records, now) : []), [records, now]);

  function applyTask(updated: MaintenanceTask) {
    setTasksById((prev) => new Map(prev).set(updated.id, updated));
    setRecords((prev) =>
      prev ? { ...prev, maintenanceTasks: prev.maintenanceTasks.map((t) => (t.id === updated.id ? updated : t)) } : prev
    );
  }

  async function runTaskAction(item: AttentionItem, label: string, run: (task: MaintenanceTask) => Promise<unknown>) {
    const task = tasksById.get(item.entityId);
    if (!task) return;
    setPending({ id: item.id, label });
    const result = (await run(task)) as { ok: boolean; data?: MaintenanceTask; error?: unknown };
    setPending(null);
    if (result.ok && result.data) applyTask(result.data);
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Bell}
        title="Couldn't load this right now"
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

  const soon = items.filter((item) => item.urgency === "soon");
  const canWait = items.filter((item) => item.urgency === "canWait");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text)]">What your home needs</h1>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Everything here comes from a date you&apos;ve saved. Handle it, put it off, or let it pass, and it updates itself.
        </p>
      </div>

      {items.length === 0 ? (
        <Surface elevated className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden />
          <div>
            <p className="text-[15px] font-semibold text-[var(--text)]">Your home is in good shape.</p>
            <p className="text-[13px] text-[var(--muted)]">Nothing needs you right now.</p>
          </div>
        </Surface>
      ) : (
        <div className="flex flex-col gap-6">
          {soon.length > 0 && (
            <AttentionGroup
              title="Worth taking care of"
              items={soon}
              instanceId={instanceId}
              pending={pending}
              onDoNow={(item) =>
                runTaskAction(item, "Doing", (task) => markMaintenanceTaskDone(task, instanceId as string))
              }
              onSnooze={(item) => runTaskAction(item, "Snoozing", (task) => snoozeMaintenanceTask(task, DEFAULT_SNOOZE_DAYS))}
              onSkip={(item) => runTaskAction(item, "Skipping", (task) => skipMaintenanceTask(task))}
            />
          )}
          {canWait.length > 0 && (
            <AttentionGroup
              title="When you get to it"
              items={canWait}
              instanceId={instanceId}
              pending={pending}
              onDoNow={(item) =>
                runTaskAction(item, "Doing", (task) => markMaintenanceTaskDone(task, instanceId as string))
              }
              onSnooze={(item) => runTaskAction(item, "Snoozing", (task) => snoozeMaintenanceTask(task, DEFAULT_SNOOZE_DAYS))}
              onSkip={(item) => runTaskAction(item, "Skipping", (task) => skipMaintenanceTask(task))}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AttentionGroup({
  title,
  items,
  instanceId,
  pending,
  onDoNow,
  onSnooze,
  onSkip,
}: {
  title: string;
  items: AttentionItem[];
  instanceId: string | null;
  pending: PendingAction;
  onDoNow: (item: AttentionItem) => void;
  onSnooze: (item: AttentionItem) => void;
  onSkip: (item: AttentionItem) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{title}</p>
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((item) => {
          const busy = pending?.id === item.id;
          const isCare = item.kind === "maintenanceDue";
          return (
            <li key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <Link href={item.href} className="block">
                <p className="text-[14px] font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">{item.detail}</p>
              </Link>
              {isCare && instanceId && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => onDoNow(item)} disabled={busy}>
                    {busy ? `${pending?.label}…` : "Do now"}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onSnooze(item)} disabled={busy}>
                    Snooze
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onSkip(item)} disabled={busy}>
                    Skip
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
