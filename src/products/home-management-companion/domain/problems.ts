"use client";

import type { Result } from "@/product-framework/result";
import { problemSchema, type Problem } from "../state";
import { createRecordRepository } from "./repository";
import { createMaintenanceLogEntry } from "./maintenanceLog";
import { updateServiceProvider } from "./serviceProviders";

interface ProblemRow {
  id: string;
  thing_id: string | null;
  provider_id: string | null;
  title: string;
  description: string | null;
  resolution_status: string;
  severity: string;
  effort: string;
  estimated_cost_minor: number | null;
  actual_cost_minor: number | null;
  scheduled_at: string | null;
  resolved_at: string | null;
  snoozed_until: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ProblemRow) {
  return {
    id: row.id,
    thingId: row.thing_id,
    providerId: row.provider_id,
    title: row.title,
    description: row.description,
    resolutionStatus: row.resolution_status,
    severity: row.severity,
    effort: row.effort,
    estimatedCostMinorUnits: row.estimated_cost_minor,
    actualCostMinorUnits: row.actual_cost_minor,
    scheduledAt: row.scheduled_at,
    resolvedAt: row.resolved_at,
    snoozedUntil: row.snoozed_until,
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
  if ("thingId" in patch) row.thing_id = patch.thingId;
  if ("providerId" in patch) row.provider_id = patch.providerId;
  if ("title" in patch) row.title = patch.title;
  if ("description" in patch) row.description = patch.description;
  if ("resolutionStatus" in patch) row.resolution_status = patch.resolutionStatus;
  if ("severity" in patch) row.severity = patch.severity;
  if ("effort" in patch) row.effort = patch.effort;
  if ("estimatedCostMinorUnits" in patch) row.estimated_cost_minor = patch.estimatedCostMinorUnits;
  if ("actualCostMinorUnits" in patch) row.actual_cost_minor = patch.actualCostMinorUnits;
  if ("scheduledAt" in patch) row.scheduled_at = patch.scheduledAt;
  if ("resolvedAt" in patch) row.resolved_at = patch.resolvedAt;
  if ("snoozedUntil" in patch) row.snoozed_until = patch.snoozedUntil;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Problem, ProblemRow>({
  table: "hmc_problems",
  schema: problemSchema,
  fromRow,
  toRow,
});

/** The one canonical Problems CRUD path. */
export const listProblems = repository.list;
export const createProblem = repository.create;
export const updateProblem = repository.update;
export const archiveProblem = repository.archive;

/**
 * The one canonical "sorted" action, mirroring
 * maintenanceTasks.ts's markMaintenanceTaskDone.
 *
 * A resolved problem is history: something was wrong with the house and
 * then somebody fixed it, which is exactly what a person goes looking
 * for months later. So this writes a real event to the same log that
 * completed care writes to, rather than leaving resolved problems in a
 * second place that History would have to remember to union in.
 *
 * The event is written first. If it fails, the problem stays open,
 * because a fix nobody can look up afterwards is worse than one that is
 * still on the list.
 */
export async function resolveProblem(
  problem: Problem,
  instanceId: string,
  options?: {
    actualCostMinorUnits?: number | null;
    providerId?: string | null;
    performedBy?: string | null;
    notes?: string | null;
    resolvedAt?: string;
  }
): Promise<Result<Problem>> {
  const resolvedAt = options?.resolvedAt ?? new Date().toISOString().slice(0, 10);

  const logged = await createMaintenanceLogEntry(instanceId, {
    taskId: null,
    applianceId: problem.thingId,
    description: problem.title,
    performedAt: resolvedAt,
    providerId: options?.providerId ?? problem.providerId,
    performedBy: options?.performedBy ?? null,
    costMinorUnits: options?.actualCostMinorUnits ?? problem.actualCostMinorUnits,
    notes: options?.notes ?? null,
    status: "active",
    source: "manual",
  });
  if (!logged.ok) return logged;

  const providerId = options?.providerId ?? problem.providerId;
  if (providerId) {
    await updateServiceProvider(providerId, { lastUsedAt: resolvedAt });
  }

  return updateProblem(problem.id, {
    resolutionStatus: "resolved",
    resolvedAt,
    actualCostMinorUnits: options?.actualCostMinorUnits ?? problem.actualCostMinorUnits,
    providerId,
  });
}

export async function scheduleProblem(problem: Problem, scheduledAt: string, providerId?: string) {
  return updateProblem(problem.id, {
    resolutionStatus: "scheduled",
    scheduledAt,
    providerId: providerId ?? problem.providerId,
  });
}

export async function snoozeProblem(problem: Problem, days: number) {
  const snoozedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  return updateProblem(problem.id, { snoozedUntil });
}
