"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { serviceEventSchema, type ServiceEvent } from "../state";
import { createRecordRepository } from "./repository";

interface ServiceEventRow {
  id: string;
  vehicle_id: string;
  item_id: string | null;
  task_name: string;
  done_on: string;
  mileage: number | null;
  shop: string | null;
  cost_minor: number | null;
  note: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ServiceEventRow) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    itemId: row.item_id,
    taskName: row.task_name,
    doneOn: row.done_on,
    mileage: row.mileage,
    shop: row.shop,
    costMinorUnits: row.cost_minor === null ? null : Number(row.cost_minor),
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(patch: Record<string, unknown>) {
  const row: Record<string, unknown> = {};
  if ("vehicleId" in patch) row.vehicle_id = patch.vehicleId;
  if ("itemId" in patch) row.item_id = patch.itemId;
  if ("taskName" in patch) row.task_name = patch.taskName;
  if ("doneOn" in patch) row.done_on = patch.doneOn;
  if ("mileage" in patch) row.mileage = patch.mileage;
  if ("shop" in patch) row.shop = patch.shop;
  if ("costMinorUnits" in patch) row.cost_minor = patch.costMinorUnits;
  if ("note" in patch) row.note = patch.note;
  if ("status" in patch) row.status = patch.status;
  return row;
}

const repository = createRecordRepository<ServiceEvent, ServiceEventRow>({
  table: "vmc_service_events",
  schema: serviceEventSchema,
  fromRow,
  toRow,
});

export const createServiceEvent = repository.create;
export const updateServiceEvent = repository.update;
export const archiveServiceEvent = repository.archive;

/** Every active event across every vehicle in one query, the same reason the maintenance items are read that way. */
export async function listServiceEvents(productInstanceId: string): Promise<Result<ServiceEvent[]>> {
  const { data, error } = await supabase
    .from("vmc_service_events")
    .select("*")
    .eq("product_instance_id", productInstanceId)
    .neq("status", "archived")
    .order("done_on", { ascending: false });
  if (error) return err({ kind: "network", message: error.message });
  const events: ServiceEvent[] = [];
  for (const row of (data ?? []) as ServiceEventRow[]) {
    const parsed = serviceEventSchema.safeParse(fromRow(row));
    if (parsed.success) events.push(parsed.data);
  }
  return ok(events);
}
