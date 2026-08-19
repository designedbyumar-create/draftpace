"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Wrench, Plus } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems } from "../domain/homeItems";
import { listMaintenanceTasks, createMaintenanceTask, updateMaintenanceTask, archiveMaintenanceTask } from "../domain/maintenanceTasks";
import type { HomeItem, MaintenanceTask } from "../state";
import SectionShell from "./shared/SectionShell";
import { StatRow, StatTile } from "./shared/StatRow";
import { STATUS_LABEL, STATUS_TONE } from "./shared/lifecycle";
import MaintenanceTaskFormSheet, {
  maintenanceTaskFormValuesToPatch,
  type MaintenanceTaskFormValues,
} from "./maintenance/MaintenanceTaskFormSheet";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

export default function MaintenanceModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [things, setThings] = useState<HomeItem[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
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
    const [tasksResult, thingsResult] = await Promise.all([listMaintenanceTasks(found.id), listHomeItems(found.id)]);
    if (!tasksResult.ok) {
      setErrorMessage(describeResultError(tasksResult.error));
      setStatus("error");
      return;
    }
    setTasks(tasksResult.data);
    setThings(thingsResult.ok ? thingsResult.data.filter((t) => t.status !== "archived") : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values: MaintenanceTaskFormValues): Promise<string | null> {
    if (!instanceId) return "Couldn't find your home. Try reloading the page.";
    const patch = maintenanceTaskFormValuesToPatch(values);
    if (typeof patch === "string") return patch;
    if (editingTask) {
      const result = await updateMaintenanceTask(editingTask.id, patch);
      if (!result.ok) return describeResultError(result.error);
      setTasks((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
      return null;
    }
    const result = await createMaintenanceTask(instanceId, patch);
    if (!result.ok) return describeResultError(result.error);
    setTasks((prev) => [...prev, result.data]);
    return null;
  }

  async function handleArchive(task: MaintenanceTask) {
    const result = await archiveMaintenanceTask(task.id);
    if (result.ok) setTasks((prev) => prev.map((t) => (t.id === result.data.id ? result.data : t)));
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-16">
        <Badge tone="neutral">Loading maintenance…</Badge>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={Wrench}
        title="Couldn't load your maintenance tasks"
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
    return <EmptyState icon={Wrench} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />;
  }

  const active = tasks.filter((t) => t.status !== "archived");
  const archived = tasks.filter((t) => t.status === "archived");
  const thingName = (id: string | null) => (id ? things.find((t) => t.id === id)?.name ?? null : null);

  return (
    <SectionShell
      icon={Wrench}
      title="Maintenance"
      purpose="Repeating jobs, how often they're due, and when they were last done."
      onAdd={() => {
        setEditingTask(null);
        setFormOpen(true);
      }}
      addLabel="Add task"
      summary={
        <StatRow>
          <StatTile label="Tracked" value={String(active.length)} />
          <StatTile label="Never logged" value={String(active.filter((t) => !t.lastDoneAt).length)} tone="muted" />
        </StatRow>
      }
      dominantAction={null}
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance tasks yet"
          description="Add a repeating job, like changing a filter, and how often it needs doing."
          action={
            <div ref={addButtonRef} className="inline-block">
              <Button size="sm" iconLeft={<Plus size={14} aria-hidden />} onClick={() => setFormOpen(true)}>
                Add task
              </Button>
            </div>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {active.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              thingName={thingName(task.applianceId)}
              onEdit={() => {
                setEditingTask(task);
                setFormOpen(true);
              }}
              onArchive={() => handleArchive(task)}
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
            {showArchived ? "Hide" : "Show"} {archived.length} archived {archived.length === 1 ? "task" : "tasks"}
          </button>
          {showArchived && (
            <ul className="mt-2.5 flex flex-col gap-2.5 opacity-70">
              {archived.map((task) => (
                <TaskCard key={task.id} task={task} thingName={thingName(task.applianceId)} onEdit={() => {}} onArchive={() => {}} readOnly />
              ))}
            </ul>
          )}
        </div>
      )}

      <MaintenanceTaskFormSheet
        open={formOpen}
        task={editingTask}
        things={things}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        triggerRef={addButtonRef}
      />
    </SectionShell>
  );
}

function TaskCard({
  task,
  thingName,
  onEdit,
  onArchive,
  readOnly = false,
}: {
  task: MaintenanceTask;
  thingName: string | null;
  onEdit: () => void;
  onArchive: () => void;
  readOnly?: boolean;
}) {
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEdit} disabled={readOnly} className="flex-1 text-left disabled:cursor-default">
          <div className="flex flex-wrap items-start gap-2">
            <p className="min-w-0 text-[14px] font-semibold text-[var(--text)]">{task.name}</p>
            <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
          </div>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            Every {task.cadenceDays} {task.cadenceDays === 1 ? "day" : "days"}
            {thingName && ` · ${thingName}`}
          </p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            {task.lastDoneAt ? `Last done ${task.lastDoneAt}` : "Never logged"}
          </p>
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
