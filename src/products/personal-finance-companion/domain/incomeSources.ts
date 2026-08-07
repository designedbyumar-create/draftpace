"use client";

import { incomeSourceSchema, type IncomeSource } from "../state";
import { createRecordRepository } from "./repository";

interface IncomeSourceRow {
  id: string;
  name: string;
  amount_minor: number | null;
  amount_range_min_minor: number | null;
  amount_range_max_minor: number | null;
  frequency: string;
  next_expected_date: string | null;
  confidence: string;
  gross_or_net: string;
  currency: string;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: IncomeSourceRow) {
  return {
    id: row.id,
    name: row.name,
    amountMinorUnits: row.amount_minor,
    amountRangeMinorUnits:
      row.amount_range_min_minor !== null && row.amount_range_max_minor !== null
        ? { min: row.amount_range_min_minor, max: row.amount_range_max_minor }
        : null,
    frequency: row.frequency,
    nextExpectedDate: row.next_expected_date,
    confidence: row.confidence,
    grossOrNet: row.gross_or_net,
    currency: row.currency,
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
  if ("name" in patch) row.name = patch.name;
  if ("amountMinorUnits" in patch) row.amount_minor = patch.amountMinorUnits;
  if ("amountRangeMinorUnits" in patch) {
    const range = patch.amountRangeMinorUnits as { min: number; max: number } | null;
    row.amount_range_min_minor = range?.min ?? null;
    row.amount_range_max_minor = range?.max ?? null;
  }
  if ("frequency" in patch) row.frequency = patch.frequency;
  if ("nextExpectedDate" in patch) row.next_expected_date = patch.nextExpectedDate;
  if ("confidence" in patch) row.confidence = patch.confidence;
  if ("grossOrNet" in patch) row.gross_or_net = patch.grossOrNet;
  if ("currency" in patch) row.currency = patch.currency;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<IncomeSource, IncomeSourceRow>({
  table: "pfc_income_sources",
  schema: incomeSourceSchema,
  fromRow,
  toRow,
});

/** The one canonical Income CRUD path — Companion and the Income section's own form both call these exact functions. */
export const listIncomeSources = repository.list;
export const createIncomeSource = repository.create;
export const updateIncomeSource = repository.update;
export const archiveIncomeSource = repository.archive;
