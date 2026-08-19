"use client";

import { serviceProviderSchema, type ServiceProvider } from "../state";
import { createRecordRepository } from "./repository";

interface ServiceProviderRow {
  id: string;
  name: string;
  category: string | null;
  phone: string | null;
  email: string | null;
  last_used_at: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ServiceProviderRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    phone: row.phone,
    email: row.email,
    lastUsedAt: row.last_used_at,
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
  if ("category" in patch) row.category = patch.category;
  if ("phone" in patch) row.phone = patch.phone;
  if ("email" in patch) row.email = patch.email;
  if ("lastUsedAt" in patch) row.last_used_at = patch.lastUsedAt;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<ServiceProvider, ServiceProviderRow>({
  table: "hmc_service_providers",
  schema: serviceProviderSchema,
  fromRow,
  toRow,
});

/** The one canonical Service Providers CRUD path. */
export const listServiceProviders = repository.list;
export const createServiceProvider = repository.create;
export const updateServiceProvider = repository.update;
export const archiveServiceProvider = repository.archive;
