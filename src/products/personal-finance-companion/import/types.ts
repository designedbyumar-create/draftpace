import { z } from "zod";

/**
 * The Stage D intelligent-input pipeline's types — separate from
 * state.ts's canonical financial records and Companion's own setup-state
 * on purpose. Nothing here is a financial record: a candidate is a draft
 * guess about one, and only domain/confirmCandidate.ts's confirmation
 * path (using the exact same createBill/createAccount/... functions the
 * direct sections and Companion already call) ever turns one into a real
 * row. See supabase/migrations/202608080002_personal_finance_companion_supporting_tables.sql
 * for the schema this mirrors.
 */

export const inputTypeSchema = z.enum(["csv", "pastedNotes", "textFile", "manual"]);
export type ImportInputType = z.infer<typeof inputTypeSchema>;

export const processingStatusSchema = z.enum(["uploaded", "parsing", "extracting", "readyForReview", "completed", "failed"]);
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

export const candidateTypeSchema = z.enum(["account", "income", "bill", "subscription", "transaction", "debt", "savingsGoal", "unsupported"]);
export type CandidateType = z.infer<typeof candidateTypeSchema>;

export const candidateConfidenceSchema = z.enum(["high", "medium", "low"]);
export type CandidateConfidence = z.infer<typeof candidateConfidenceSchema>;

export const duplicateStatusSchema = z.enum(["none", "exactDuplicate", "likelyDuplicate", "possibleDuplicate", "transferPair", "refundMatch"]);
export type DuplicateStatus = z.infer<typeof duplicateStatusSchema>;

export const reviewStatusSchema = z.enum(["unreviewed", "confirmed", "corrected", "skipped"]);
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;

/**
 * Per-type draft payloads — deliberately looser than the canonical record
 * schemas in state.ts (most fields optional beyond a name/description).
 * missing_fields on the candidate row names which of these were never
 * found, so the review UI can say so honestly instead of guessing.
 */
export interface AccountCandidatePayload {
  name: string;
  type?: "checking" | "savings" | "cash" | "digitalWallet" | "other";
  balanceMajorUnits?: number;
  currency?: string;
}
export interface IncomeCandidatePayload {
  name: string;
  amountMajorUnits?: number;
  frequency?: "weekly" | "biweekly" | "semiMonthly" | "monthly" | "irregular";
  dayOfMonth?: number;
}
export interface BillCandidatePayload {
  name: string;
  amountMajorUnits?: number;
  dayOfMonth?: number;
  frequency?: "monthly" | "quarterly" | "annual" | "custom";
}
export interface SubscriptionCandidatePayload {
  name: string;
  amountMajorUnits?: number;
  dayOfMonth?: number;
}
export interface DebtCandidatePayload {
  name: string;
  balanceMajorUnits?: number;
  minimumPaymentMajorUnits?: number;
}
export interface SavingsGoalCandidatePayload {
  name: string;
  savedAmountMajorUnits?: number;
  targetAmountMajorUnits?: number;
}
export interface TransactionCandidatePayload {
  description: string;
  amountMajorUnits?: number;
  direction?: "debit" | "credit";
  occurredOn?: string;
  category?: string;
}
export interface UnsupportedCandidatePayload {
  rawText: string;
}

export type CandidatePayload =
  | AccountCandidatePayload
  | IncomeCandidatePayload
  | BillCandidatePayload
  | SubscriptionCandidatePayload
  | DebtCandidatePayload
  | SavingsGoalCandidatePayload
  | TransactionCandidatePayload
  | UnsupportedCandidatePayload;

export interface ExtractionCandidate {
  id: string;
  importSessionId: string;
  candidateType: CandidateType;
  payload: CandidatePayload;
  confidence: CandidateConfidence;
  missingFields: string[];
  ambiguityNotes: string[];
  sourceReference: string | null;
  duplicateStatus: DuplicateStatus;
  duplicateOfId: string | null;
  reviewStatus: ReviewStatus;
  confirmedRecordType: string | null;
  confirmedRecordId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const confirmationActionSchema = z.enum(["confirm", "correct", "skip", "merge", "archive"]);
export type ConfirmationAction = z.infer<typeof confirmationActionSchema>;

export interface ConfirmationEvent {
  id: string;
  candidateId: string | null;
  recordType: string;
  recordId: string;
  action: ConfirmationAction;
  createdAt: string;
}

/** A candidate not yet persisted — what the extraction engine produces before it's written to pfc_extraction_candidates. */
export interface CandidateDraft {
  candidateType: CandidateType;
  payload: CandidatePayload;
  confidence: CandidateConfidence;
  missingFields: string[];
  ambiguityNotes: string[];
  sourceReference: string;
}
