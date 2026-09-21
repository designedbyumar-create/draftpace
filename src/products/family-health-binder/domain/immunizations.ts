"use client";

import { immunizationSchema, type Immunization } from "../state";
import { createRecordRepository } from "./repository";

interface ImmunizationRow {
  id: string;
  family_member_id: string;
  vaccine: string;
  given_on: string;
  note: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ImmunizationRow) {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    vaccine: row.vaccine,
    givenOn: row.given_on,
    note: row.note,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("familyMemberId" in patch) row.family_member_id = patch.familyMemberId;
  if ("vaccine" in patch) row.vaccine = patch.vaccine;
  if ("givenOn" in patch) row.given_on = patch.givenOn;
  if ("note" in patch) row.note = patch.note;
  if ("visibility" in patch) row.visibility = patch.visibility;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<Immunization, ImmunizationRow>({
  table: "fhb_immunizations",
  schema: immunizationSchema,
  fromRow,
  toRow,
});

export const listImmunizations = repository.list;
export const createImmunization = repository.create;
export const updateImmunization = repository.update;
export const archiveImmunization = repository.archive;
