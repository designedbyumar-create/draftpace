"use client";

import { applianceSchema, type Appliance } from "../state";
import { createRecordRepository } from "./repository";

interface ApplianceRow {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_expires_at: string | null;
  document_link: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ApplianceRow) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    model: row.model,
    purchaseDate: row.purchase_date,
    installDate: row.install_date,
    warrantyExpiresAt: row.warranty_expires_at,
    documentLink: row.document_link,
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
  if ("brand" in patch) row.brand = patch.brand;
  if ("model" in patch) row.model = patch.model;
  if ("purchaseDate" in patch) row.purchase_date = patch.purchaseDate;
  if ("installDate" in patch) row.install_date = patch.installDate;
  if ("warrantyExpiresAt" in patch) row.warranty_expires_at = patch.warrantyExpiresAt;
  if ("documentLink" in patch) row.document_link = patch.documentLink;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<Appliance, ApplianceRow>({
  table: "hmc_appliances",
  schema: applianceSchema,
  fromRow,
  toRow,
});

/** The one canonical Appliances CRUD path. */
export const listAppliances = repository.list;
export const createAppliance = repository.create;
export const updateAppliance = repository.update;
export const archiveAppliance = repository.archive;
