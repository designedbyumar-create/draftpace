"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { maintenanceItemSchema, type MaintenanceItem } from "../state";
import { createRecordRepository } from "./repository";

interface MaintenanceItemRow {
  id: string;
  vehicle_id: string;
  template_id: string | null;
  task_name: string;
  interval_miles: number | null;
  interval_months: number | null;
  severe_duty: boolean;
  last_done_at: string | null;
  last_done_mileage: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MaintenanceItemRow) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    templateId: row.template_id,
    taskName: row.task_name,
    intervalMiles: row.interval_miles,
    intervalMonths: row.interval_months,
    severeDuty: row.severe_duty,
    lastDoneAt: row.last_done_at,
    lastDoneMileage: row.last_done_mileage,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("vehicleId" in patch) row.vehicle_id = patch.vehicleId;
  if ("templateId" in patch) row.template_id = patch.templateId;
  if ("taskName" in patch) row.task_name = patch.taskName;
  if ("intervalMiles" in patch) row.interval_miles = patch.intervalMiles;
  if ("intervalMonths" in patch) row.interval_months = patch.intervalMonths;
  if ("severeDuty" in patch) row.severe_duty = patch.severeDuty;
  if ("lastDoneAt" in patch) row.last_done_at = patch.lastDoneAt;
  if ("lastDoneMileage" in patch) row.last_done_mileage = patch.lastDoneMileage;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<MaintenanceItem, MaintenanceItemRow>({
  table: "vmc_maintenance_items",
  schema: maintenanceItemSchema,
  fromRow,
  toRow,
});

export const createMaintenanceItem = repository.create;
export const updateMaintenanceItem = repository.update;
export const archiveMaintenanceItem = repository.archive;

/**
 * Every active maintenance item across every vehicle in this instance,
 * in one query. The due view is computed across all vehicles at once
 * (proposal: "a single ranked what's due view"), so listing per vehicle
 * the way the generic repository's list() does would mean one query per
 * vehicle for no benefit; this reads the whole product_instance_id
 * scope directly instead.
 */
export async function listMaintenanceItems(productInstanceId: string): Promise<Result<MaintenanceItem[]>> {
  const { data, error } = await supabase
    .from("vmc_maintenance_items")
    .select("*")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });

  const rows = (data ?? []) as MaintenanceItemRow[];
  const items: MaintenanceItem[] = [];
  for (const row of rows) {
    const parsed = maintenanceItemSchema.safeParse(fromRow(row));
    if (parsed.success) items.push(parsed.data);
  }
  return ok(items);
}
