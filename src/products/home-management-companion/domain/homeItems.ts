"use client";

import { homeItemSchema, type HomeItem } from "../state";
import { createRecordRepository } from "./repository";

interface HomeItemRow {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  model: string | null;
  location: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_expires_at: string | null;
  buy_spec: string | null;
  document_link: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: HomeItemRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    brand: row.brand,
    model: row.model,
    location: row.location,
    purchaseDate: row.purchase_date,
    installDate: row.install_date,
    warrantyExpiresAt: row.warranty_expires_at,
    buySpec: row.buy_spec,
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
  if ("type" in patch) row.type = patch.type;
  if ("brand" in patch) row.brand = patch.brand;
  if ("model" in patch) row.model = patch.model;
  if ("location" in patch) row.location = patch.location;
  if ("purchaseDate" in patch) row.purchase_date = patch.purchaseDate;
  if ("installDate" in patch) row.install_date = patch.installDate;
  if ("warrantyExpiresAt" in patch) row.warranty_expires_at = patch.warrantyExpiresAt;
  if ("buySpec" in patch) row.buy_spec = patch.buySpec;
  if ("documentLink" in patch) row.document_link = patch.documentLink;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<HomeItem, HomeItemRow>({
  table: "hmc_things",
  schema: homeItemSchema,
  fromRow,
  toRow,
});

/** The one canonical home-item CRUD path. Table name stays hmc_things, see state.ts. */
export const listHomeItems = repository.list;
export const createHomeItem = repository.create;
export const updateHomeItem = repository.update;
export const archiveHomeItem = repository.archive;
