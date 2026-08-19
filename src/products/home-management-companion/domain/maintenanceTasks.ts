"use client";

import type { Result } from "@/product-framework/result";
import { maintenanceTaskSchema, type MaintenanceTask } from "../state";
import { createRecordRepository } from "./repository";
import { createMaintenanceLogEntry } from "./maintenanceLog";

interface MaintenanceTaskRow {
  id: string;
  appliance_id: string | null;
  name: string;
  cadence_days: number;
  last_done_at: string | null;
  document_link: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MaintenanceTaskRow) {
  return {
    id: row.id,
    applianceId: row.appliance_id,
    name: row.name,
    cadenceDays: row.cadence_days,
    lastDoneAt: row.last_done_at,
    documentLink: row.document_link,
    notes: row.notes,
    status: row.status,
    needsReviewReason: row.needs_review_reason,
    source: row.source,
    importSessionId: row.import_session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("applianceId" in patch) row.appliance_id = patch.applianceId;
  if ("name" in patch) row.name = patch.name;
  if ("cadenceDays" in patch) row.cadence_days = patch.cadenceDays;
  if ("lastDoneAt" in patch) row.last_done_at = patch.lastDoneAt;
  if ("documentLink" in patch) row.document_link = patch.documentLink;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<MaintenanceTask, MaintenanceTaskRow>({
  table: "hmc_maintenance_tasks",
  schema: maintenanceTaskSchema,
  fromRow,
  toRow,
});

/** The one canonical Maintenance Tasks CRUD path. */
export const listMaintenanceTasks = repository.list;
export const createMaintenanceTask = repository.create;
export const updateMaintenanceTask = repository.update;
export const archiveMaintenanceTask = repository.archive;

/**
 * The one canonical "mark done" action: Attention's quick action and any
 * future direct-section equivalent both call this exact function, never a
 * bare updateMaintenanceTask({ lastDoneAt }) on its own, so a completion
 * always leaves a log entry behind. Two sequential writes, not a
 * transaction, matching this product's RLS-insert-only write model (no
 * server function wraps multiple tables here, same as PFC's own
 * repository).
 */
export async function markMaintenanceTaskDone(
  task: MaintenanceTask,
  instanceId: string,
  options?: { performedAt?: string; notes?: string }
): Promise<Result<MaintenanceTask>> {
  const performedAt = options?.performedAt ?? new Date().toISOString().slice(0, 10);
  const logResult = await createMaintenanceLogEntry(instanceId, {
    taskId: task.id,
    applianceId: task.applianceId,
    description: `${task.name} completed`,
    performedAt,
    notes: options?.notes ?? null,
    status: "active",
    source: "manual",
  });
  if (!logResult.ok) return logResult;
  return updateMaintenanceTask(task.id, { lastDoneAt: performedAt });
}
