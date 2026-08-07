"use client";

import { debtSchema, type Debt } from "../state";
import { createRecordRepository } from "./repository";

interface DebtRow {
  id: string;
  name: string;
  type: string;
  balance_minor: number;
  currency: string;
  interest_rate: number | null;
  minimum_payment_minor: number;
  due_date: string | null;
  promotional_rate: number | null;
  promotional_expiry: string | null;
  balance_as_of_date: string;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: DebtRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    balanceMinorUnits: row.balance_minor,
    currency: row.currency,
    interestRate: row.interest_rate,
    minimumPaymentMinorUnits: row.minimum_payment_minor,
    dueDate: row.due_date,
    promotionalRate: row.promotional_rate,
    promotionalExpiry: row.promotional_expiry,
    balanceAsOfDate: row.balance_as_of_date,
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
  if ("balanceMinorUnits" in patch) row.balance_minor = patch.balanceMinorUnits;
  if ("currency" in patch) row.currency = patch.currency;
  if ("interestRate" in patch) row.interest_rate = patch.interestRate;
  if ("minimumPaymentMinorUnits" in patch) row.minimum_payment_minor = patch.minimumPaymentMinorUnits;
  if ("dueDate" in patch) row.due_date = patch.dueDate;
  if ("promotionalRate" in patch) row.promotional_rate = patch.promotionalRate;
  if ("promotionalExpiry" in patch) row.promotional_expiry = patch.promotionalExpiry;
  if ("balanceAsOfDate" in patch) row.balance_as_of_date = patch.balanceAsOfDate;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Debt, DebtRow>({
  table: "pfc_debts",
  schema: debtSchema,
  fromRow,
  toRow,
});

/** The one canonical Debt CRUD path — Companion's "what is the minimum payment" follow-up and the Debt section's inline edit both call these exact functions. */
export const listDebts = repository.list;
export const createDebt = repository.create;
export const updateDebt = repository.update;
export const archiveDebt = repository.archive;
