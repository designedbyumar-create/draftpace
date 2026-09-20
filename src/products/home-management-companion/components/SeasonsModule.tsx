"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import EmptyState from "@/design-system/EmptyState";
import { Sun } from "@/design-system/Icon";
import { describeResultError } from "@/product-framework/result";
import { findHomeManagementCompanionInstanceId } from "../setupStateData";
import { listHomeItems } from "../domain/homeItems";
import { listMaintenanceTasks } from "../domain/maintenanceTasks";
import { listServiceProviders } from "../domain/serviceProviders";
import { currentSeasonId, deriveSeasons, type SeasonId } from "../seasons";
import type { HomeItem, MaintenanceTask, ServiceProvider } from "../state";
import CareActionSheet from "./care/CareActionSheet";
import SeasonsView from "./SeasonsView";

type LoadStatus = "loading" | "ready" | "no-instance" | "error";

/**
 * Seasons: the care jobs Home already knows about, laid out by time of
 * year. Reads the same rows and uses the same rule for "when is this
 * due" as Home, and records a job through the same sheet, so the two
 * cannot disagree about anything.
 */
export default function SeasonsModule() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instanceId, setInstanceId] = useState<string | null>(null);
  const [items, setItems] = useState<HomeItem[]>([]);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [actionTask, setActionTask] = useState<MaintenanceTask | null>(null);
  const now = useMemo(() => new Date(), []);
  const currentId = currentSeasonId(now);
  const [selectedId, setSelectedId] = useState<SeasonId>(currentId);

  const load = useCallback(async () => {
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
    const [itemsResult, tasksResult, providersResult] = await Promise.all([
      listHomeItems(found.id),
      listMaintenanceTasks(found.id),
      listServiceProviders(found.id),
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
    setItems(itemsResult.data);
    setTasks(tasksResult.data);
    setProviders(providersResult.ok ? providersResult.data : []);
    setStatus("ready");
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const seasons = useMemo(() => deriveSeasons({ homeItems: items, maintenanceTasks: tasks }, now), [items, tasks, now]);
  const tasksById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

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
        icon={Sun}
        title="Couldn't load your seasons"
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
    return (
      <EmptyState icon={Sun} title="No product instance found" description="This shouldn't happen for an owner. Contact support." />
    );
  }

  return (
    <>
      <SeasonsView
        seasons={seasons}
        currentId={currentId}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRecord={(job) => setActionTask(tasksById.get(job.taskId) ?? null)}
      />
      <CareActionSheet
        open={actionTask !== null}
        task={actionTask}
        instanceId={instanceId}
        providers={providers}
        onClose={() => setActionTask(null)}
        onSaved={() => {
          setActionTask(null);
          load();
        }}
      />
    </>
  );
}
