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

export const maintenanceLogEntrySchema = z.object({
  id: z.string(),
  taskId: z.string().nullable(),
  applianceId: z.string().nullable(),
  description: z.string().min(1),
  costMinorUnits: z.number().int().nullable(),
  performedAt: isoDate,
  performedBy: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type MaintenanceLogEntry = z.infer<typeof maintenanceLogEntrySchema>;

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

/**
 * v2: the generic entity replacing the narrow applianceSchema above
 * (kept in place, unused by new code, until Phase 4's contained cutover
 * per the rebuild plan). `type` is an open, validated string, not a
 * closed enum, same pattern as src/product-framework/families.ts's
 * ProductFamilyId: plain regex-checked text backed by a lookup table
 * (thingTypes.ts, Phase 4), so a new thing type never needs a schema
 * change to add.
 */
const THING_TYPE_PATTERN = /^[a-z][a-z0-9-]*$/;

export const thingSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string().regex(THING_TYPE_PATTERN),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  location: z.string().nullable(),
  purchaseDate: isoDate.nullable(),
  installDate: isoDate.nullable(),
  warrantyExpiresAt: isoDate.nullable(),
  documentLink: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Thing = z.infer<typeof thingSchema>;

export const thingDocumentKindSchema = z.enum(["warranty", "receipt", "manual", "other"]);
export type ThingDocumentKind = z.infer<typeof thingDocumentKindSchema>;

export const thingDocumentSchema = z.object({
  id: z.string(),
  thingId: z.string(),
  kind: thingDocumentKindSchema,
  label: z.string().nullable(),
  documentLink: z.string().min(1),
  documentDate: isoDate.nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type ThingDocument = z.infer<typeof thingDocumentSchema>;

/**
 * A problem is something currently broken or reported, distinct from
 * planned Maintenance. resolutionStatus is its own field, separate from
 * the shared `status` lifecycle above, since domain/repository.ts's
 * generic archive() writes to a column literally named `status`, see
 * the migration's own comment for why the two must not collide.
 */
export const problemResolutionStatusSchema = z.enum(["open", "scheduled", "resolved"]);
export type ProblemResolutionStatus = z.infer<typeof problemResolutionStatusSchema>;

export const problemSeveritySchema = z.enum(["minor", "moderate", "urgent"]);
export type ProblemSeverity = z.infer<typeof problemSeveritySchema>;

export const problemEffortSchema = z.enum(["quick", "moderate", "bigJob"]);
export type ProblemEffort = z.infer<typeof problemEffortSchema>;

export const problemSchema = z.object({
  id: z.string(),
  thingId: z.string().nullable(),
  providerId: z.string().nullable(),
  title: z.string().min(1),
  description: z.string().nullable(),
  resolutionStatus: problemResolutionStatusSchema,
  severity: problemSeveritySchema,
  effort: problemEffortSchema,
  estimatedCostMinorUnits: z.number().int().nullable(),
  actualCostMinorUnits: z.number().int().nullable(),
  scheduledAt: isoDate.nullable(),
  resolvedAt: isoDate.nullable(),
  snoozedUntil: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type Problem = z.infer<typeof problemSchema>;
