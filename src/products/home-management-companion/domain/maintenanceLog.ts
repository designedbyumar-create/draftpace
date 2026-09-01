"use client";

import { maintenanceLogEntrySchema, type MaintenanceLogEntry } from "../state";
import { createRecordRepository } from "./repository";

interface MaintenanceLogRow {
  id: string;
  task_id: string | null;
  appliance_id: string | null;
  description: string;
  cost_minor: number | null;
  performed_at: string;
  provider_id: string | null;
  performed_by: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MaintenanceLogRow) {
  return {
    id: row.id,
    taskId: row.task_id,
    applianceId: row.appliance_id,
    description: row.description,
    costMinorUnits: row.cost_minor,
    performedAt: row.performed_at,
    providerId: row.provider_id ?? null,
    performedBy: row.performed_by,
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
  if ("taskId" in patch) row.task_id = patch.taskId;
  if ("applianceId" in patch) row.appliance_id = patch.applianceId;
  if ("description" in patch) row.description = patch.description;
  if ("costMinorUnits" in patch) row.cost_minor = patch.costMinorUnits;
  if ("performedAt" in patch) row.performed_at = patch.performedAt;
  if ("providerId" in patch) row.provider_id = patch.providerId;
  if ("performedBy" in patch) row.performed_by = patch.performedBy;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<MaintenanceLogEntry, MaintenanceLogRow>({
  table: "hmc_maintenance_log",
  schema: maintenanceLogEntrySchema,
  fromRow,
  toRow,
});

/** The one canonical Maintenance Log CRUD path. */
export const listMaintenanceLog = repository.list;
export const createMaintenanceLogEntry = repository.create;
export const updateMaintenanceLogEntry = repository.update;
export const archiveMaintenanceLogEntry = repository.archive;
