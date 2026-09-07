import { z } from "zod";

/**
 * Family Health Binder's canonical record schemas, the TypeScript side
 * of supabase/migrations/202609070007_family_health_binder.sql.
 */

const isoDate = z.string().min(1);

export const recordStatusSchema = z.enum(["active", "archived"]);
export type RecordStatus = z.infer<typeof recordStatusSchema>;

export const visibilitySchema = z.enum(["summary", "private"]);
export type Visibility = z.infer<typeof visibilitySchema>;

export const relationshipSchema = z.enum(["self", "spouse", "child", "other"]);
export type Relationship = z.infer<typeof relationshipSchema>;

export const familyMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  relationship: relationshipSchema,
  dateOfBirth: isoDate.nullable(),
  status: recordStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FamilyMember = z.infer<typeof familyMemberSchema>;

export const medicalFactKindSchema = z.enum(["medication", "allergy", "history"]);
export type MedicalFactKind = z.infer<typeof medicalFactKindSchema>;

export const medicalFactSchema = z
  .object({
    id: z.string(),
    familyMemberId: z.string(),
    kind: medicalFactKindSchema,
    detail: z.string().min(1),
    /** Medication-only. Null for an allergy or a history note. */
    dosage: z.string().nullable(),
    frequency: z.string().nullable(),
    /** Allergy-only. Null otherwise. */
    reaction: z.string().nullable(),
    visibility: visibilitySchema,
    status: recordStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine((fact) => fact.kind === "medication" || (fact.dosage === null && fact.frequency === null), {
    message: "Dosage and frequency belong to a medication only.",
  })
  .refine((fact) => fact.kind === "allergy" || fact.reaction === null, {
    message: "A reaction belongs to an allergy only.",
  });
export type MedicalFact = z.infer<typeof medicalFactSchema>;

export const severitySchema = z.enum(["mild", "moderate", "severe"]);
export type Severity = z.infer<typeof severitySchema>;

export const durationUnitSchema = z.enum(["hours", "days", "weeks"]);
export type DurationUnit = z.infer<typeof durationUnitSchema>;

export const symptomEventSchema = z
  .object({
    id: z.string(),
    familyMemberId: z.string(),
    description: z.string().min(1),
    onsetAt: isoDate,
    durationValue: z.number().int().positive().nullable(),
    durationUnit: durationUnitSchema.nullable(),
    severity: severitySchema,
    /** Free text, deliberately: what helped genuinely varies too much to enumerate. */
    whatHelped: z.string().nullable(),
    visibility: visibilitySchema,
    status: recordStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .refine((event) => (event.durationValue === null) === (event.durationUnit === null), {
    message: "A duration needs both a value and a unit, or neither.",
  });
export type SymptomEvent = z.infer<typeof symptomEventSchema>;
