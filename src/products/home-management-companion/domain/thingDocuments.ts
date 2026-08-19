"use client";

import { thingDocumentSchema, type ThingDocument } from "../state";
import { createRecordRepository } from "./repository";

interface ThingDocumentRow {
  id: string;
  thing_id: string;
  kind: string;
  label: string | null;
  document_link: string;
  document_date: string | null;
  notes: string | null;
  status: string;
  needs_review_reason: string | null;
  source: string;
  import_session_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ThingDocumentRow) {
  return {
    id: row.id,
    thingId: row.thing_id,
    kind: row.kind,
    label: row.label,
    documentLink: row.document_link,
    documentDate: row.document_date,
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
  if ("thingId" in patch) row.thing_id = patch.thingId;
  if ("kind" in patch) row.kind = patch.kind;
  if ("label" in patch) row.label = patch.label;
  if ("documentLink" in patch) row.document_link = patch.documentLink;
  if ("documentDate" in patch) row.document_date = patch.documentDate;
  if ("notes" in patch) row.notes = patch.notes;
  if ("status" in patch) row.status = patch.status;
  if ("needsReviewReason" in patch) row.needs_review_reason = patch.needsReviewReason;
  if ("source" in patch) row.source = patch.source;
  if ("importSessionId" in patch) row.import_session_id = patch.importSessionId;
  return row;
}

const repository = createRecordRepository<ThingDocument, ThingDocumentRow>({
  table: "hmc_thing_documents",
  schema: thingDocumentSchema,
  fromRow,
  toRow,
});

/** The one canonical Thing Documents CRUD path. */
export const listThingDocuments = repository.list;
export const createThingDocument = repository.create;
export const updateThingDocument = repository.update;
export const archiveThingDocument = repository.archive;
