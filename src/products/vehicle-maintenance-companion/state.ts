import { z } from "zod";

/**
 * Vehicle Maintenance Companion's canonical record schemas, the
 * TypeScript side of
 * supabase/migrations/202609060006_vehicle_maintenance_companion.sql.
 */

const isoDate = z.string().min(1);

export const recordStatusSchema = z.enum(["active", "archived"]);
export type RecordStatus = z.infer<typeof recordStatusSchema>;

export const vehicleSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  year: z.number().int().nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  currentMileage: z.number().int().nullable(),
  mileageUpdatedAt: isoDate.nullable(),
  /**
   * False only via the "I don't know this vehicle's history" setup
   * path, for a used car or an inherited vehicle. A maintenance item on
   * such a vehicle has nothing to compute a due status from until a
   * real last-done fact is recorded against it.
   */
  historyKnown: z.boolean(),
  status: recordStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Vehicle = z.infer<typeof vehicleSchema>;

export const maintenanceItemSchema = z
  .object({
    id: z.string(),
    vehicleId: z.string(),
    /** The vehicleKnowledge.ts template this item started from, or null for a fully custom item. */
    templateId: z.string().nullable(),
    taskName: z.string().min(1),
    intervalMiles: z.number().int().positive().nullable(),
    intervalMonths: z.number().int().positive().nullable(),
    /** One-time toggle, per item: whether hard use shortens this specific job's interval. */
    severeDuty: z.boolean(),
    lastDoneAt: isoDate.nullable(),
    lastDoneMileage: z.number().int().nullable(),
    status: recordStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine((item) => item.intervalMiles !== null || item.intervalMonths !== null, {
    message: "A maintenance item needs at least one interval, by distance or by time.",
  });
export type MaintenanceItem = z.infer<typeof maintenanceItemSchema>;
