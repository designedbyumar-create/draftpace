"use client";

import { providerSchema, type Provider } from "../state";
import { createRecordRepository } from "./repository";

interface ProviderRow {
  id: string;
  family_member_id: string;
  kind: string;
  name: string;
  phone: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ProviderRow) {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    kind: row.kind,
    name: row.name,
    phone: row.phone,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("familyMemberId" in patch) row.family_member_id = patch.familyMemberId;
  if ("kind" in patch) row.kind = patch.kind;
  if ("name" in patch) row.name = patch.name;
  if ("phone" in patch) row.phone = patch.phone;
  if ("note" in patch) row.note = patch.note;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<Provider, ProviderRow>({
  table: "fhb_providers",
  schema: providerSchema,
  fromRow,
  toRow,
});

export const listProviders = repository.list;
export const createProvider = repository.create;
export const updateProvider = repository.update;
export const archiveProvider = repository.archive;
