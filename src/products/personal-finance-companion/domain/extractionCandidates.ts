"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { CandidateDraft, CandidatePayload, DuplicateStatus, ExtractionCandidate, ReviewStatus } from "../import/types";

interface ExtractionCandidateRow {
  id: string;
  import_session_id: string;
  candidate_type: string;
  payload: unknown;
  confidence: string;
  missing_fields: string[];
  ambiguity_notes: string[];
  source_reference: string | null;
  duplicate_status: string;
  duplicate_of_id: string | null;
  review_status: string;
  confirmed_record_type: string | null;
  confirmed_record_id: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ExtractionCandidateRow): ExtractionCandidate {
  return {
    id: row.id,
    importSessionId: row.import_session_id,
    candidateType: row.candidate_type as ExtractionCandidate["candidateType"],
    payload: row.payload as CandidatePayload,
    confidence: row.confidence as ExtractionCandidate["confidence"],
    missingFields: row.missing_fields,
    ambiguityNotes: row.ambiguity_notes,
    sourceReference: row.source_reference,
    duplicateStatus: row.duplicate_status as DuplicateStatus,
    duplicateOfId: row.duplicate_of_id,
    reviewStatus: row.review_status as ReviewStatus,
    confirmedRecordType: row.confirmed_record_type,
    confirmedRecordId: row.confirmed_record_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLUMNS =
  "id, import_session_id, candidate_type, payload, confidence, missing_fields, ambiguity_notes, source_reference, duplicate_status, duplicate_of_id, review_status, confirmed_record_type, confirmed_record_id, created_at, updated_at";

/** Bulk-inserts every draft extracted from one import session in a single request. */
export async function createExtractionCandidates(
  productInstanceId: string,
  importSessionId: string,
  drafts: (CandidateDraft & { duplicateStatus?: DuplicateStatus; duplicateOfId?: string | null })[]
): Promise<Result<ExtractionCandidate[]>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  if (drafts.length === 0) return ok([]);

  const { data, error } = await supabase
    .from("pfc_extraction_candidates")
    .insert(
      drafts.map((draft) => ({
        product_instance_id: productInstanceId,
        user_id: session.user.id,
        import_session_id: importSessionId,
        candidate_type: draft.candidateType,
        payload: draft.payload,
        confidence: draft.confidence,
        missing_fields: draft.missingFields,
        ambiguity_notes: draft.ambiguityNotes,
        source_reference: draft.sourceReference,
        duplicate_status: draft.duplicateStatus ?? "none",
        duplicate_of_id: draft.duplicateOfId ?? null,
      }))
    )
    .select(SELECT_COLUMNS);

  if (error) return err({ kind: "network", message: error.message });
  return ok((data as ExtractionCandidateRow[]).map(fromRow));
}

export async function listCandidatesForSession(importSessionId: string): Promise<Result<ExtractionCandidate[]>> {
  const { data, error } = await supabase
    .from("pfc_extraction_candidates")
    .select(SELECT_COLUMNS)
    .eq("import_session_id", importSessionId)
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  return ok((data as ExtractionCandidateRow[]).map(fromRow));
}

export type ImportSourceForReview = "pastedNotes" | "textFile" | "csvImport";

function toRecordSource(inputType: string | undefined): ImportSourceForReview {
  if (inputType === "csv") return "csvImport";
  if (inputType === "textFile") return "textFile";
  return "pastedNotes";
}

/**
 * Every candidate across every import session still waiting for review,
 * grouped by session so each group can be handed to CandidateReviewQueue
 * with the one correct `source` for that session (a batch pasted as notes
 * and a batch imported as CSV can't share a single source label). This is
 * what lets Workspace's "N imported records waiting" and Companion's own
 * mount-time check resume a review queue that was left mid-batch or never
 * opened at all — the candidates were always durable in the database, only
 * the UI never resurfaced them outside the single session that created
 * them (see Stage D's known gap).
 */
export async function listUnreviewedGroupedBySession(
  productInstanceId: string
): Promise<Result<{ importSessionId: string; source: ImportSourceForReview; candidates: ExtractionCandidate[] }[]>> {
  const { data, error } = await supabase
    .from("pfc_extraction_candidates")
    .select(SELECT_COLUMNS)
    .eq("product_instance_id", productInstanceId)
    .eq("review_status", "unreviewed")
    .order("created_at", { ascending: true });

  if (error) return err({ kind: "network", message: error.message });
  const candidates = (data as ExtractionCandidateRow[]).map(fromRow);
  if (candidates.length === 0) return ok([]);

  const sessionIds = Array.from(new Set(candidates.map((c) => c.importSessionId)));
  const { data: sessions, error: sessionsError } = await supabase.from("pfc_import_sessions").select("id, input_type").in("id", sessionIds);
  if (sessionsError) return err({ kind: "network", message: sessionsError.message });
  const inputTypeBySession = new Map((sessions as { id: string; input_type: string }[]).map((s) => [s.id, s.input_type]));

  const grouped = new Map<string, ExtractionCandidate[]>();
  for (const candidate of candidates) {
    const list = grouped.get(candidate.importSessionId) ?? [];
    list.push(candidate);
    grouped.set(candidate.importSessionId, list);
  }

  return ok(
    Array.from(grouped.entries()).map(([importSessionId, sessionCandidates]) => ({
      importSessionId,
      source: toRecordSource(inputTypeBySession.get(importSessionId)),
      candidates: sessionCandidates,
    }))
  );
}

/** Count of candidates still waiting for review across every import session for this instance — the Workspace-level "unresolved imports" signal (not a per-entity Attention item, since a candidate isn't yet a record in any of the seven areas). */
export async function countUnreviewedCandidates(productInstanceId: string): Promise<Result<number>> {
  const { count, error } = await supabase
    .from("pfc_extraction_candidates")
    .select("id", { count: "exact", head: true })
    .eq("product_instance_id", productInstanceId)
    .eq("review_status", "unreviewed");

  if (error) return err({ kind: "network", message: error.message });
  return ok(count ?? 0);
}

export async function updateCandidate(
  id: string,
  patch: Partial<{ payload: CandidatePayload; reviewStatus: ReviewStatus; confirmedRecordType: string; confirmedRecordId: string }>
): Promise<Result<ExtractionCandidate>> {
  const row: Record<string, unknown> = {};
  if ("payload" in patch) row.payload = patch.payload;
  if ("reviewStatus" in patch) row.review_status = patch.reviewStatus;
  if ("confirmedRecordType" in patch) row.confirmed_record_type = patch.confirmedRecordType;
  if ("confirmedRecordId" in patch) row.confirmed_record_id = patch.confirmedRecordId;

  const { data, error } = await supabase.from("pfc_extraction_candidates").update(row).eq("id", id).select(SELECT_COLUMNS).single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}
