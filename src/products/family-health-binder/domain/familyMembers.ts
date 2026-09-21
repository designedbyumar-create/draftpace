"use client";

import { familyMemberSchema, type FamilyMember } from "../state";
import { createRecordRepository } from "./repository";

interface FamilyMemberRow {
  id: string;
  name: string;
  relationship: string;
  date_of_birth: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  insurer: string | null;
  insurance_member_id: string | null;
  insurance_group: string | null;
  caregiver_notes: string | null;
  medications_checked_on: string | null;
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
    emergencyName: row.emergency_name ?? null,
    emergencyPhone: row.emergency_phone ?? null,
    insurer: row.insurer ?? null,
    insuranceMemberId: row.insurance_member_id ?? null,
    insuranceGroup: row.insurance_group ?? null,
    caregiverNotes: row.caregiver_notes ?? null,
    medicationsCheckedOn: row.medications_checked_on ?? null,
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
  if ("emergencyName" in patch) row.emergency_name = patch.emergencyName;
  if ("emergencyPhone" in patch) row.emergency_phone = patch.emergencyPhone;
  if ("insurer" in patch) row.insurer = patch.insurer;
  if ("insuranceMemberId" in patch) row.insurance_member_id = patch.insuranceMemberId;
  if ("insuranceGroup" in patch) row.insurance_group = patch.insuranceGroup;
  if ("caregiverNotes" in patch) row.caregiver_notes = patch.caregiverNotes;
  if ("medicationsCheckedOn" in patch) row.medications_checked_on = patch.medicationsCheckedOn;
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
