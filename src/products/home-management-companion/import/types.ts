import { z } from "zod";

/**
 * Home Base's CSV/paste-notes import pipeline types, Home Base's own
 * parallel to PFC's import/types.ts (products don't import from one
 * another's folders). No separate staging table exists for candidates
 * (see the hmc_import_sessions migration's own comment): a candidate is
 * a plain in-memory draft that lives only in the browser during the
 * review step, and only import/confirmCandidate.ts's confirmation path
 * (calling the exact same createAppliance/createMaintenanceTask/
 * createServiceProvider functions the direct sections already use) ever
 * turns one into a real row.
 */

export const inputTypeSchema = z.enum(["csv", "pastedNotes", "textFile"]);
export type ImportInputType = z.infer<typeof inputTypeSchema>;

export const processingStatusSchema = z.enum(["extracting", "readyForReview", "completed", "failed"]);
export type ProcessingStatus = z.infer<typeof processingStatusSchema>;

export const importSessionSchema = z.object({
  id: z.string(),
  inputType: inputTypeSchema,
  fileOriginalName: z.string().nullable(),
  fileSizeBytes: z.number().nullable(),
  fileMimeType: z.string().nullable(),
  processingStatus: processingStatusSchema,
  errorState: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ImportSession = z.infer<typeof importSessionSchema>;

export const candidateTypeSchema = z.enum(["appliance", "maintenanceTask", "serviceProvider", "unsupported"]);
export type CandidateType = z.infer<typeof candidateTypeSchema>;

export const candidateConfidenceSchema = z.enum(["high", "medium", "low"]);
export type CandidateConfidence = z.infer<typeof candidateConfidenceSchema>;

export const duplicateStatusSchema = z.enum(["none", "likelyDuplicate"]);
export type DuplicateStatus = z.infer<typeof duplicateStatusSchema>;

export const reviewStatusSchema = z.enum(["unreviewed", "confirmed", "skipped"]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

/**
 * Per-type draft payloads, deliberately looser than state.ts's canonical
 * schemas (only name is required). missingFields on the candidate names
 * which of these a matcher never found, so the review UI can say so
 * honestly instead of guessing.
 */
export interface ApplianceCandidatePayload {
  name: string;
  category?: "appliance" | "system" | "other";
  brand?: string;
  purchaseDate?: string;
  installDate?: string;
  warrantyExpiresAt?: string;
}
export interface MaintenanceTaskCandidatePayload {
  name: string;
  cadenceDays?: number;
}
export interface ServiceProviderCandidatePayload {
  name: string;
  phone?: string;
  email?: string;
}
export interface UnsupportedCandidatePayload {
  rawText: string;
}

export type CandidatePayload =
  | ApplianceCandidatePayload
  | MaintenanceTaskCandidatePayload
  | ServiceProviderCandidatePayload
  | UnsupportedCandidatePayload;

export const confirmationSourceSchema = z.enum(["pastedNotes", "textFile", "csvImport"]);
export type ConfirmationSource = z.infer<typeof confirmationSourceSchema>;

/** A candidate not yet created, what the extraction engine produces before a person reviews and confirms it. */
export interface CandidateDraft {
  candidateType: CandidateType;
  payload: CandidatePayload;
  confidence: CandidateConfidence;
  missingFields: string[];
  ambiguityNotes: string[];
  sourceReference: string;
}

/** A draft plus the client-only bookkeeping the review queue needs, never persisted as its own row. */
export interface ExtractionCandidate extends CandidateDraft {
  id: string;
  duplicateStatus: DuplicateStatus;
  duplicateOfName: string | null;
  reviewStatus: ReviewStatus;
}
