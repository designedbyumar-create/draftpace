"use client";

import type { Result } from "@/product-framework/result";
import { maintenanceTaskSchema, type MaintenanceTask } from "../state";
import { createRecordRepository } from "./repository";
import { createMaintenanceLogEntry } from "./maintenanceLog";
import { updateServiceProvider } from "./serviceProviders";

interface MaintenanceTaskRow {
  id: string;
  appliance_id: string | null;
  name: string;
  cadence_days: number;
  last_done_at: string | null;
  document_link: string | null;
  notes: string | null;
  snoozed_until: string | null;
  care_template_id: string | null;
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
    snoozedUntil: row.snoozed_until,
    // ?? null so a stale PostgREST schema cache (column added but not yet
    // reflected) degrades to "no template" instead of failing validation
    // and silently dropping every task from the list.
    careTemplateId: row.care_template_id ?? null,
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
  if ("snoozedUntil" in patch) row.snoozed_until = patch.snoozedUntil;
  if ("careTemplateId" in patch) row.care_template_id = patch.careTemplateId;
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
 * What actually happened when a job got done. Everything except the date
 * is optional, because the point is to capture what the person knows,
 * not to interrogate them: a job done by the owner on a Sunday with no
 * receipt is a perfectly complete record.
 */
export interface CareCompletion {
  performedAt: string;
  /** A saved provider, when someone the home already knows did the work. */
  providerId?: string | null;
  /** A name typed once, for someone not worth saving as a provider. */
  performedBy?: string | null;
  costMinorUnits?: number | null;
  notes?: string | null;
}

/**
 * The one canonical "this got done" action. Every surface calls exactly
 * this, never a bare updateMaintenanceTask({ lastDoneAt }), so a
 * completion always leaves the home's memory behind it: what was done,
 * when, by whom and at what cost. Sequential writes rather than a
 * transaction, matching this product's RLS-insert-only write model.
 */
export async function markMaintenanceTaskDone(
  task: MaintenanceTask,
  instanceId: string,
  completion?: Partial<CareCompletion>
): Promise<Result<MaintenanceTask>> {
  const performedAt = completion?.performedAt ?? new Date().toISOString().slice(0, 10);
  const logResult = await createMaintenanceLogEntry(instanceId, {
    taskId: task.id,
    applianceId: task.applianceId,
    description: task.name,
    performedAt,
    providerId: completion?.providerId ?? null,
    performedBy: completion?.performedBy ?? null,
    costMinorUnits: completion?.costMinorUnits ?? null,
    notes: completion?.notes ?? null,
    status: "active",
    source: "manual",
  });
  if (!logResult.ok) return logResult;

  // A provider who just did work is, by definition, the most recently
  // used one. Written here rather than left to the caller so the field
  // cannot drift out of step with the history it summarises.
  if (completion?.providerId) {
    await updateServiceProvider(completion.providerId, { lastUsedAt: performedAt });
  }

  return updateMaintenanceTask(task.id, { lastDoneAt: performedAt, snoozedUntil: null });
}

/**
 * Snooze: a short, fixed window before this task can surface in
 * Attention again. Skip: pushes it a full cadence period out instead,
 * distinct from Snooze, since "not now" and "not until it would come up
 * again anyway" are different intents. Neither touches lastDoneAt: the
 * task genuinely hasn't been done, only deferred.
 */
export async function snoozeMaintenanceTask(task: MaintenanceTask, days: number): Promise<Result<MaintenanceTask>> {
  const snoozedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  return updateMaintenanceTask(task.id, { snoozedUntil });
}

export async function skipMaintenanceTask(task: MaintenanceTask): Promise<Result<MaintenanceTask>> {
  const snoozedUntil = new Date(Date.now() + task.cadenceDays * 24 * 60 * 60 * 1000).toISOString();
  return updateMaintenanceTask(task.id, { snoozedUntil });
}
