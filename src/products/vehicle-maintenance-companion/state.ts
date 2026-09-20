import { z } from "zod";

/**
 * Vehicle Maintenance Companion's canonical record schemas, the
 * TypeScript side of
 * supabase/migrations/202609060006_vehicle_maintenance_companion.sql.
 */

const isoDate = z.string().min(1);

export const FUEL_TYPES = ["petrol", "diesel", "hybrid", "plugin-hybrid", "electric"] as const;
export const fuelTypeSchema = z.enum(FUEL_TYPES);
export type FuelType = z.infer<typeof fuelTypeSchema>;

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
  /** What kind of vehicle it is, chosen by the person. Only ever shapes which typical jobs are suggested. */
  fuelType: fuelTypeSchema.nullable(),
  /** Short trips, towing, dust, heat or cold. Only ever decides whether suggested jobs start with severe duty on. */
  hardUse: z.boolean(),
  /** What goes in the glove box card. All typed by the person, none looked up or verified. */
  plate: z.string().nullable(),
  vin: z.string().nullable(),
  tyreSize: z.string().nullable(),
  oilSpec: z.string().nullable(),
  insurer: z.string().nullable(),
  policyNumber: z.string().nullable(),
  roadsidePhone: z.string().nullable(),
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

/**
 * One time a job was done. The item keeps a copy of its latest
 * last-done fact because the due engine reads it; events are the record.
 */
export const serviceEventSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  /** The tracked job this belongs to, or null for a one-off (a repair, a fix, a job nobody tracks). */
  itemId: z.string().nullable(),
  taskName: z.string().min(1),
  doneOn: isoDate,
  mileage: z.number().int().nullable(),
  shop: z.string().nullable(),
  costMinorUnits: z.number().int().nonnegative().nullable(),
  note: z.string().nullable(),
  status: recordStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ServiceEvent = z.infer<typeof serviceEventSchema>;

export const RENEWAL_KINDS = ["registration", "insurance", "inspection", "warranty", "other"] as const;
export const renewalKindSchema = z.enum(RENEWAL_KINDS);
export type RenewalKind = z.infer<typeof renewalKindSchema>;

/** A date the person wants kept in view, and where the paper is. Never the document itself. */
export const renewalSchema = z.object({
  id: z.string(),
  vehicleId: z.string(),
  kind: renewalKindSchema,
  /** A name for an "other" renewal, such as "Road tax" or "Parking permit". Null for the four named kinds. */
  label: z.string().nullable(),
  dueOn: isoDate,
  whereKept: z.string().nullable(),
  note: z.string().nullable(),
  status: recordStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Renewal = z.infer<typeof renewalSchema>;
