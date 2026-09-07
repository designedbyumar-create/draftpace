"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { medicalFactSchema, type MedicalFact } from "../state";
import { createRecordRepository } from "./repository";

interface MedicalFactRow {
  id: string;
  family_member_id: string;
  kind: string;
  detail: string;
  dosage: string | null;
  frequency: string | null;
  reaction: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MedicalFactRow) {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    kind: row.kind,
    detail: row.detail,
    dosage: row.dosage,
    frequency: row.frequency,
    reaction: row.reaction,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("familyMemberId" in patch) row.family_member_id = patch.familyMemberId;
  if ("kind" in patch) row.kind = patch.kind;
  if ("detail" in patch) row.detail = patch.detail;
  if ("dosage" in patch) row.dosage = patch.dosage;
  if ("frequency" in patch) row.frequency = patch.frequency;
  if ("reaction" in patch) row.reaction = patch.reaction;
  if ("visibility" in patch) row.visibility = patch.visibility;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<MedicalFact, MedicalFactRow>({
  table: "fhb_medical_facts",
  schema: medicalFactSchema,
  fromRow,
  toRow,
});

export const createMedicalFact = repository.create;
export const updateMedicalFact = repository.update;
export const archiveMedicalFact = repository.archive;

/**
 * Every active medical fact across every family member in this
 * instance, in one query, same reasoning as Vehicle Maintenance
 * Companion's own listMaintenanceItems: the app reads the whole
 * account's facts at once (per-member grouping happens in the UI), so
 * one query per member would cost more for no benefit.
 */
export async function listMedicalFacts(productInstanceId: string): Promise<Result<MedicalFact[]>> {
  const { data, error } = await supabase
    .from("fhb_medical_facts")
    .select("*")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });

  const rows = (data ?? []) as MedicalFactRow[];
  const facts: MedicalFact[] = [];
  for (const row of rows) {
    const parsed = medicalFactSchema.safeParse(fromRow(row));
    if (parsed.success) facts.push(parsed.data);
  }
  return ok(facts);
}
