"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { symptomEventSchema, type SymptomEvent } from "../state";
import { createRecordRepository } from "./repository";

interface SymptomEventRow {
  id: string;
  family_member_id: string;
  description: string;
  onset_at: string;
  duration_value: number | null;
  duration_unit: string | null;
  severity: string;
  what_helped: string | null;
  visibility: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SymptomEventRow) {
  return {
    id: row.id,
    familyMemberId: row.family_member_id,
    description: row.description,
    onsetAt: row.onset_at,
    durationValue: row.duration_value,
    durationUnit: row.duration_unit,
    severity: row.severity,
    whatHelped: row.what_helped,
    visibility: row.visibility,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("familyMemberId" in patch) row.family_member_id = patch.familyMemberId;
  if ("description" in patch) row.description = patch.description;
  if ("onsetAt" in patch) row.onset_at = patch.onsetAt;
  if ("durationValue" in patch) row.duration_value = patch.durationValue;
  if ("durationUnit" in patch) row.duration_unit = patch.durationUnit;
  if ("severity" in patch) row.severity = patch.severity;
  if ("whatHelped" in patch) row.what_helped = patch.whatHelped;
  if ("visibility" in patch) row.visibility = patch.visibility;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<SymptomEvent, SymptomEventRow>({
  table: "fhb_symptom_events",
  schema: symptomEventSchema,
  fromRow,
  toRow,
});

export const createSymptomEvent = repository.create;
export const updateSymptomEvent = repository.update;
export const archiveSymptomEvent = repository.archive;

/** Every active symptom event across every family member in this instance, in one query, same reasoning as listMedicalFacts. */
export async function listSymptomEvents(productInstanceId: string): Promise<Result<SymptomEvent[]>> {
  const { data, error } = await supabase
    .from("fhb_symptom_events")
    .select("*")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("onset_at", { ascending: false });

  if (error) return err({ kind: "network", message: error.message });

  const rows = (data ?? []) as SymptomEventRow[];
  const events: SymptomEvent[] = [];
  for (const row of rows) {
    const parsed = symptomEventSchema.safeParse(fromRow(row));
    if (parsed.success) events.push(parsed.data);
  }
  return ok(events);
}
