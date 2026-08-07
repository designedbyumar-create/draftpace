"use client";

import { transactionSchema, type Transaction } from "../state";
import { createRecordRepository } from "./repository";

interface TransactionRow {
  id: string;
  account_id: string;
  occurred_on: string;
  description: string;
  amount_minor: number;
  direction: string;
  currency: string;
  category: string | null;
  pending_or_cleared: string;
  external_id: string | null;
  transfer_pair_id: string | null;
  excluded_from_spending: boolean;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: TransactionRow) {
  return {
    id: row.id,
    accountId: row.account_id,
    occurredOn: row.occurred_on,
    description: row.description,
    amountMinorUnits: row.amount_minor,
    direction: row.direction,
    currency: row.currency,
    category: row.category,
    pendingOrCleared: row.pending_or_cleared,
    externalId: row.external_id,
    transferPairId: row.transfer_pair_id,
    excludedFromSpending: row.excluded_from_spending,
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
  if ("accountId" in patch) row.account_id = patch.accountId;
  if ("occurredOn" in patch) row.occurred_on = patch.occurredOn;
  if ("description" in patch) row.description = patch.description;
  if ("amountMinorUnits" in patch) row.amount_minor = patch.amountMinorUnits;
  if ("direction" in patch) row.direction = patch.direction;
  if ("currency" in patch) row.currency = patch.currency;
  if ("category" in patch) row.category = patch.category;
  if ("pendingOrCleared" in patch) row.pending_or_cleared = patch.pendingOrCleared;
  if ("externalId" in patch) row.external_id = patch.externalId;
  if ("transferPairId" in patch) row.transfer_pair_id = patch.transferPairId;
  if ("excludedFromSpending" in patch) row.excluded_from_spending = patch.excludedFromSpending;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Transaction, TransactionRow>({
  table: "pfc_transactions",
  schema: transactionSchema,
  fromRow,
  toRow,
});

/** The one canonical Transactions CRUD path — Companion's transfer-confirmation follow-up, CSV import confirmation, and the Transactions section's manual entry all call these exact functions. `archive` is used for a confirmed transfer (excluded from spending, kept visible); a genuine duplicate's true delete is a separate, deliberately not-yet-built operation — see docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md. */
export const listTransactions = repository.list;
export const createTransaction = repository.create;
export const updateTransaction = repository.update;
export const archiveTransaction = repository.archive;
