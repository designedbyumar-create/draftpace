"use client";

import { subscriptionSchema, type Subscription } from "../state";
import { createRecordRepository } from "./repository";

interface SubscriptionRow {
  id: string;
  name: string;
  amount_minor: number | null;
  frequency: string;
  renewal_date: string | null;
  decision: string;
  currency: string;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SubscriptionRow) {
  return {
    id: row.id,
    name: row.name,
    amountMinorUnits: row.amount_minor,
    frequency: row.frequency,
    renewalDate: row.renewal_date,
    decision: row.decision,
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
  if ("frequency" in patch) row.frequency = patch.frequency;
  if ("renewalDate" in patch) row.renewal_date = patch.renewalDate;
  if ("decision" in patch) row.decision = patch.decision;
  if ("currency" in patch) row.currency = patch.currency;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Subscription, SubscriptionRow>({
  table: "pfc_subscriptions",
  schema: subscriptionSchema,
  fromRow,
  toRow,
});

/** The one canonical Subscriptions CRUD path — Companion's "does Netflix renew monthly" follow-up and the Subscriptions section's one-tap decision change both call these exact functions. */
export const listSubscriptions = repository.list;
export const createSubscription = repository.create;
export const updateSubscription = repository.update;
export const archiveSubscription = repository.archive;
