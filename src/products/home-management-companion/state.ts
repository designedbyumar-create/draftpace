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

export const maintenanceTaskSchema = z.object({
  id: z.string(),
  applianceId: z.string().nullable(),
  name: z.string().min(1),
  cadenceDays: z.number().int().positive(),
  lastDoneAt: isoDate.nullable(),
  documentLink: z.string().nullable(),
  notes: z.string().nullable(),
  /** v2: set by Snooze (a short fixed window) or Skip (the next full cadence date), read by attention.ts's snooze guard. */
  snoozedUntil: z.string().nullable(),
  /**
   * The homeKnowledge.ts template this task came from, when it was
   * proposed rather than typed by hand. Lets urgency read the template's
   * real consequence and effort. Nullable: hand-written tasks and every
   * task created before this link existed simply have none, and fall
   * back to a name match and then to neutral scoring.
   */
  careTemplateId: z.string().nullable(),
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
  /** A saved provider, when the work was done by someone the home already knows. */
  providerId: z.string().nullable(),
  /** A name typed once, for someone who was never saved as a provider. */
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
 * One object in the home. Named HomeItem rather than Thing deliberately:
 * this type's name leaks into component names, props and labels, and
 * "thing" leaking into the interface is exactly the failure the v2 audit
 * found (an import badge rendering the literal word "thing" at the
 * user). The user never sees a generic noun at all, they see
 * "Refrigerator", but if this one ever escapes, "item" is harmless.
 *
 * The underlying table is still hmc_things. Renaming storage would cost
 * a migration and change nothing a person can see, so it stays: storage
 * names are not product decisions.
 *
 * `type` is an open, validated string, not a closed enum, same pattern
 * as src/product-framework/families.ts's ProductFamilyId: regex-checked
 * text backed by a lookup table (homeKnowledge.ts), so a new type never
 * needs a schema change to add.
 */
const HOME_ITEM_TYPE_PATTERN = /^[a-z][a-z0-9-]*$/;

export const homeItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: z.string().regex(HOME_ITEM_TYPE_PATTERN),
  brand: z.string().nullable(),
  model: z.string().nullable(),
  location: z.string().nullable(),
  purchaseDate: isoDate.nullable(),
  installDate: isoDate.nullable(),
  warrantyExpiresAt: isoDate.nullable(),
  /** What to buy when replacing it: a filter size, a part number, a bulb type. Distinct from brand/model, which identify the thing rather than what a hardware store needs to sell you the right replacement. */
  buySpec: z.string().nullable(),
  documentLink: z.string().nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type HomeItem = z.infer<typeof homeItemSchema>;

export const homeItemDocumentKindSchema = z.enum(["warranty", "receipt", "manual", "other"]);
export type HomeItemDocumentKind = z.infer<typeof homeItemDocumentKindSchema>;

export const homeItemDocumentSchema = z.object({
  id: z.string(),
  thingId: z.string(),
  kind: homeItemDocumentKindSchema,
  label: z.string().nullable(),
  documentLink: z.string().min(1),
  documentDate: isoDate.nullable(),
  notes: z.string().nullable(),
  ...recordLifecycleFields,
  ...recordProvenanceFields,
});
export type HomeItemDocument = z.infer<typeof homeItemDocumentSchema>;

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
