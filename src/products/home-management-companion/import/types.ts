import { z } from "zod";

/**
 * Home Base's CSV/paste-notes import pipeline types, Home Base's own
 * parallel to PFC's import/types.ts (products don't import from one
 * another's folders). No separate staging table exists for candidates
 * (see the hmc_import_sessions migration's own comment): a candidate is
 * a plain in-memory draft that lives only in the browser during the
 * review step, and only import/confirmCandidate.ts's confirmation path
 * (calling the exact same createHomeItem/createMaintenanceTask/
 * createServiceProvider functions the direct sections already use) ever
 * turns one into a real row.
 *
 * Six candidate kinds now, not three. The two additions matter because
 * they are the sentences people actually write: something is broken, and
 * something already got done. The pipeline used to answer both with
 * "Not recognized".
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

export const candidateTypeSchema = z.enum([
  "thing",
  "maintenanceTask",
  "serviceProvider",
  "problem",
  "pastEvent",
  "unsupported",
]);
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
export interface ThingCandidatePayload {
  name: string;
  /** Open, matches the home item type taxonomy in homeKnowledge.ts, not a closed set here either. */
  type?: string;
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
/** Something that is wrong right now, in the words the person wrote. */
export interface ProblemCandidatePayload {
  title: string;
  severity: "minor" | "moderate" | "urgent";
  /** The kind of thing it seems to concern, when the sentence made that clear. */
  aboutType?: string;
}

/** Work that already happened, which is memory rather than a job to do. */
export interface PastEventCandidatePayload {
  description: string;
  performedAt: string;
  providerName?: string;
}

/**
 * A line nothing matched.
 *
 * Never a dead end. The review step offers to keep it as a note about
 * the home, or to turn it into a thing or a problem, because the person
 * wrote it for a reason and deleting it is the one outcome that is
 * definitely wrong.
 */
export interface UnsupportedCandidatePayload {
  rawText: string;
}

export type CandidatePayload =
  | ThingCandidatePayload
  | MaintenanceTaskCandidatePayload
  | ServiceProviderCandidatePayload
  | ProblemCandidatePayload
  | PastEventCandidatePayload
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
