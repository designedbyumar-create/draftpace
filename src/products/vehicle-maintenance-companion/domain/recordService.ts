"use client";

import { ok, err, type Result } from "@/product-framework/result";
import type { MaintenanceItem, ServiceEvent, Vehicle } from "../state";
import { lastDoneFromEvents, planRecordService, type ServiceInput } from "../serviceHistory";
import { createServiceEvent, updateServiceEvent } from "./serviceEvents";
import { updateMaintenanceItem } from "./maintenanceItems";
import { updateVehicle } from "./vehicles";

/**
 * The writes behind "I had this done": the event itself, the job's last-done
 * pair when the event is the newest thing recorded for it, and the
 * vehicle's mileage when the event carries a higher, newer reading. What to
 * write is serviceHistory.planRecordService's decision; this only performs it.
 *
 * The event goes first and is the record. If a follow-on write fails the
 * event is still saved, and the result says which part did not land, so a
 * failed mileage update never looks like a lost service.
 */
export interface RecordedService {
  event: ServiceEvent;
  item: MaintenanceItem | null;
  vehicle: Vehicle | null;
  /** Set when the event saved but a follow-on write did not. */
  warning: string | null;
}

export async function recordService(input: {
  instanceId: string;
  vehicle: Vehicle;
  item: MaintenanceItem | null;
  service: ServiceInput;
}): Promise<Result<RecordedService>> {
  const plan = planRecordService({ vehicle: input.vehicle, item: input.item, service: input.service });
  const created = await createServiceEvent(input.instanceId, { ...plan.event });
  if (!created.ok) return created;

  let warning: string | null = null;
  let item: MaintenanceItem | null = null;
  let vehicle: Vehicle | null = null;

  if (plan.itemPatch && input.item) {
    const updated = await updateMaintenanceItem(input.item.id, { ...plan.itemPatch });
    if (updated.ok) item = updated.data;
    else warning = "The service is saved, but the job's last-done date could not be updated.";
  }
  if (plan.vehiclePatch) {
    const updated = await updateVehicle(input.vehicle.id, { ...plan.vehiclePatch });
    if (updated.ok) vehicle = updated.data;
    else warning = warning ?? "The service is saved, but the vehicle's mileage could not be updated.";
  }
  return ok({ event: created.data, item, vehicle, warning });
}

/**
 * After an event is changed or set aside, put the job's last-done pair back
 * in step with the events that remain. `eventsAfter` is every event as it
 * will stand once the change has been made.
 */
export async function resyncItem(item: MaintenanceItem, eventsAfter: ServiceEvent[]): Promise<Result<MaintenanceItem | null>> {
  const patch = lastDoneFromEvents(eventsAfter, item.id);
  if (patch.lastDoneAt === item.lastDoneAt && patch.lastDoneMileage === item.lastDoneMileage) return ok(null);
  const updated = await updateMaintenanceItem(item.id, { ...patch });
  if (!updated.ok) return err(updated.error);
  return ok(updated.data);
}

export { updateServiceEvent };
