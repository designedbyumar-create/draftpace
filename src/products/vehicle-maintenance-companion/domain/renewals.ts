"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { renewalSchema, type Renewal } from "../state";
import { createRecordRepository } from "./repository";

interface RenewalRow {
  id: string;
  vehicle_id: string;
  kind: string;
  label: string | null;
  due_on: string;
  where_kept: string | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: RenewalRow) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    kind: row.kind,
    label: row.label,
    dueOn: row.due_on,
    whereKept: row.where_kept,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("vehicleId" in patch) row.vehicle_id = patch.vehicleId;
  if ("kind" in patch) row.kind = patch.kind;
  if ("label" in patch) row.label = patch.label;
  if ("dueOn" in patch) row.due_on = patch.dueOn;
  if ("whereKept" in patch) row.where_kept = patch.whereKept;
  if ("note" in patch) row.note = patch.note;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<Renewal, RenewalRow>({
  table: "vmc_renewals",
  schema: renewalSchema,
  fromRow,
  toRow,
});

export const createRenewal = repository.create;
export const updateRenewal = repository.update;
export const archiveRenewal = repository.archive;

export async function listRenewals(productInstanceId: string): Promise<Result<Renewal[]>> {
  const { data, error } = await supabase
    .from("vmc_renewals")
    .select("*")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("due_on", { ascending: true });
  if (error) return err({ kind: "network", message: error.message });
  const renewals: Renewal[] = [];
  for (const row of (data ?? []) as RenewalRow[]) {
    const parsed = renewalSchema.safeParse(fromRow(row));
    if (parsed.success) renewals.push(parsed.data);
  }
  return ok(renewals);
}
