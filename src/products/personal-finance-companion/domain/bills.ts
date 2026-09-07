"use client";

import { billSchema, type Bill } from "../state";
import { createRecordRepository } from "./repository";

interface BillRow {
  id: string;
  name: string;
  category: string;
  amount_minor: number | null;
  amount_range_min_minor: number | null;
  amount_range_max_minor: number | null;
  is_variable: boolean;
  due_rule: unknown;
  frequency: string;
  essential: boolean;
  funded: boolean;
  currency: string;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
  shared: boolean;
  shared_split_percent: number | null;
  settled: boolean;
  settled_at: string | null;
}

function fromRow(row: BillRow) {
  const dueRule = row.due_rule as Record<string, unknown> | null;
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    amountMinorUnits: row.amount_minor,
    amountRangeMinorUnits:
      row.amount_range_min_minor !== null && row.amount_range_max_minor !== null
        ? { min: row.amount_range_min_minor, max: row.amount_range_max_minor }
        : null,
    isVariable: row.is_variable,
    dueRule: dueRule && Object.keys(dueRule).length > 0 ? dueRule : null,
    frequency: row.frequency,
    essential: row.essential,
    funded: row.funded,
    currency: row.currency,
    status: row.status,
    needsReviewReason: row.needs_review_reason,
    source: row.source,
    importSessionId: row.import_session_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shared: row.shared,
    sharedSplitPercent: row.shared_split_percent,
    settled: row.settled,
    settledAt: row.settled_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("name" in patch) row.name = patch.name;
  if ("category" in patch) row.category = patch.category;
  if ("amountMinorUnits" in patch) row.amount_minor = patch.amountMinorUnits;
  if ("amountRangeMinorUnits" in patch) {
    const range = patch.amountRangeMinorUnits as { min: number; max: number } | null;
    row.amount_range_min_minor = range?.min ?? null;
    row.amount_range_max_minor = range?.max ?? null;
  }
  if ("isVariable" in patch) row.is_variable = patch.isVariable;
  if ("dueRule" in patch) row.due_rule = patch.dueRule ?? {};
  if ("frequency" in patch) row.frequency = patch.frequency;
  if ("essential" in patch) row.essential = patch.essential;
  if ("funded" in patch) row.funded = patch.funded;
  if ("currency" in patch) row.currency = patch.currency;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  if ("shared" in patch) row.shared = patch.shared;
  if ("sharedSplitPercent" in patch) row.shared_split_percent = patch.sharedSplitPercent;
  if ("settled" in patch) row.settled = patch.settled;
  if ("settledAt" in patch) row.settled_at = patch.settledAt;
  return row;
}

const repository = createRecordRepository<Bill, BillRow>({
  table: "pfc_bills",
  schema: billSchema,
  fromRow,
  toRow,
});

/** The one canonical Bills CRUD path — Companion's "we found your electricity amount but not the due date" follow-up and the Bills section's inline edit both call these exact functions. */
export const listBills = repository.list;
export const createBill = repository.create;
export const updateBill = repository.update;
export const archiveBill = repository.archive;
