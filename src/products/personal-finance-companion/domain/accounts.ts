"use client";

import { accountSchema, type Account } from "../state";
import { createRecordRepository } from "./repository";

interface AccountRow {
  id: string;
  name: string;
  type: string;
  current_balance_minor: number;
  currency: string;
  available_for_spending: boolean;
  balance_as_of_date: string;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: AccountRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currentBalanceMinorUnits: row.current_balance_minor,
    currency: row.currency,
    availableForSpending: row.available_for_spending,
    balanceAsOfDate: row.balance_as_of_date,
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
  if ("name" in patch) row.name = patch.name;
  if ("type" in patch) row.type = patch.type;
  if ("currentBalanceMinorUnits" in patch) row.current_balance_minor = patch.currentBalanceMinorUnits;
  if ("currency" in patch) row.currency = patch.currency;
  if ("availableForSpending" in patch) row.available_for_spending = patch.availableForSpending;
  if ("balanceAsOfDate" in patch) row.balance_as_of_date = patch.balanceAsOfDate;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Account, AccountRow>({
  table: "pfc_accounts",
  schema: accountSchema,
  fromRow,
  toRow,
});

/** The one canonical Accounts CRUD path — Companion's guided setup and the Accounts section's own add/edit form both call these exact functions. */
export const listAccounts = repository.list;
export const createAccount = repository.create;
export const updateAccount = repository.update;
export const archiveAccount = repository.archive;
