"use client";

import { familyMemberSchema, type FamilyMember } from "../state";
import { createRecordRepository } from "./repository";

interface FamilyMemberRow {
  id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: FamilyMemberRow) {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    dateOfBirth: row.date_of_birth,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("name" in patch) row.name = patch.name;
  if ("relationship" in patch) row.relationship = patch.relationship;
  if ("dateOfBirth" in patch) row.date_of_birth = patch.dateOfBirth;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<FamilyMember, FamilyMemberRow>({
  table: "fhb_family_members",
  schema: familyMemberSchema,
  fromRow,
  toRow,
});

export const listFamilyMembers = repository.list;
export const createFamilyMember = repository.create;
export const updateFamilyMember = repository.update;
export const archiveFamilyMember = repository.archive;
