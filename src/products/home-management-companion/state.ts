import { z } from "zod";

/**
 * Home Base's canonical record schemas, the TypeScript side of
 * supabase/migrations/202608190001_home_management_companion_records.sql.
 * Same shape convention as Personal Finance Companion's own state.ts
 * (shared lifecycle/provenance field groups spread into every entity),
 * kept as this product's own local copy rather than importing PFC's,
 * products don't import from one another's folders.
 */

const isoDate = z.string().min(1);

export const recordLifecycleStatusSchema = z.enum(["active", "needsReview", "archived"]);
export type RecordLifecycleStatus = z.infer<typeof recordLifecycleStatusSchema>;

export const recordSourceSchema = z.enum(["manual", "pastedNotes", "textFile", "csvImport"]);
export type RecordSource = z.infer<typeof recordSourceSchema>;

const recordLifecycleFields = {
  status: recordLifecycleStatusSchema,
  needsReviewReason: z.string().nullable(),
};

const recordProvenanceFields = {
  source: recordSourceSchema,
  importSessionId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

export const applianceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.enum(["appliance", "system", "other"]),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  purchaseDate: isoDate.nullable(),
  installDate: isoDate.nullable(),
  warrantyExpiresAt: isoDate.nullable(),
  documentLink: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Appliance = z.infer<typeof applianceSchema>;

export const maintenanceTaskSchema = z.object({
  id: z.string(),
  applianceId: z.string().nullable(),
  name: z.string().min(1),
  cadenceDays: z.number().int().positive(),
  lastDoneAt: isoDate.nullable(),
  documentLink: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type MaintenanceTask = z.infer<typeof maintenanceTaskSchema>;

export const serviceProviderSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  lastUsedAt: isoDate.nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type ServiceProvider = z.infer<typeof serviceProviderSchema>;
