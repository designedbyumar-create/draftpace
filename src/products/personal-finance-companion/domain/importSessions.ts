"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { importSessionSchema, type ImportSession, type ImportInputType, type ProcessingStatus } from "../import/types";

interface ImportSessionRow {
  id: string;
  input_type: string;
  file_original_name: string | null;
  file_size_bytes: number | null;
  file_mime_type: string | null;
  processing_status: string;
  error_state: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ImportSessionRow): ImportSession {
  return importSessionSchema.parse({
    id: row.id,
    inputType: row.input_type,
    fileOriginalName: row.file_original_name,
    fileSizeBytes: row.file_size_bytes,
    fileMimeType: row.file_mime_type,
    processingStatus: row.processing_status,
    errorState: row.error_state,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

/**
 * Creates the one row per paste/upload that every extraction candidate
 * from it references. Raw file bytes are never persisted here (see
 * import/types.ts's module comment) — only metadata, for provenance.
 */
export async function createImportSession(
  productInstanceId: string,
  input: { inputType: ImportInputType; fileOriginalName?: string; fileSizeBytes?: number; fileMimeType?: string }
): Promise<Result<ImportSession>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { data, error } = await supabase
    .from("pfc_import_sessions")
    .insert({
      product_instance_id: productInstanceId,
      user_id: session.user.id,
      input_type: input.inputType,
      file_original_name: input.fileOriginalName ?? null,
      file_size_bytes: input.fileSizeBytes ?? null,
      file_mime_type: input.fileMimeType ?? null,
      processing_status: "extracting",
    })
    .select("id, input_type, file_original_name, file_size_bytes, file_mime_type, processing_status, error_state, created_at, updated_at")
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}

export async function updateImportSessionStatus(
  id: string,
  processingStatus: ProcessingStatus,
  errorState?: string | null
): Promise<Result<ImportSession>> {
  const { data, error } = await supabase
    .from("pfc_import_sessions")
    .update({ processing_status: processingStatus, error_state: errorState ?? null })
    .eq("id", id)
    .select("id, input_type, file_original_name, file_size_bytes, file_mime_type, processing_status, error_state, created_at, updated_at")
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok(fromRow(data));
}
