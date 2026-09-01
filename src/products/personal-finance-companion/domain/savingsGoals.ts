"use client";

import { savingsGoalSchema, type SavingsGoal } from "../state";
import { createRecordRepository } from "./repository";

interface SavingsGoalRow {
  id: string;
  name: string;
  type: string;
  target_amount_minor: number;
  saved_amount_minor: number;
  target_date: string | null;
  recurring: boolean;
  currency: string;
  linked_account_id: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SavingsGoalRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    targetAmountMinorUnits: row.target_amount_minor,
    savedAmountMinorUnits: row.saved_amount_minor,
    targetDate: row.target_date,
    recurring: row.recurring,
    currency: row.currency,
    // ?? null: see the identical comment in domain/debts.ts's fromRow —
    // same migration-ordering hazard applies to pfc_savings_goals.
    linkedAccountId: row.linked_account_id ?? null,
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
  if ("type" in patch) row.type = patch.type;
  if ("targetAmountMinorUnits" in patch) row.target_amount_minor = patch.targetAmountMinorUnits;
  if ("savedAmountMinorUnits" in patch) row.saved_amount_minor = patch.savedAmountMinorUnits;
  if ("targetDate" in patch) row.target_date = patch.targetDate;
  if ("recurring" in patch) row.recurring = patch.recurring;
  if ("currency" in patch) row.currency = patch.currency;
  if ("linkedAccountId" in patch) row.linked_account_id = patch.linkedAccountId;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<SavingsGoal, SavingsGoalRow>({
  table: "pfc_savings_goals",
  schema: savingsGoalSchema,
  fromRow,
  toRow,
});

/** The one canonical Savings CRUD path — Companion's "how much have you already saved" follow-up and the Savings section's own add/edit form both call these exact functions. */
export const listSavingsGoals = repository.list;
export const createSavingsGoal = repository.create;
export const updateSavingsGoal = repository.update;
export const archiveSavingsGoal = repository.archive;
