"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { ConfirmationAction, ConfirmationEvent } from "../import/types";

/** Append-only audit trail — no update/delete policy exists on this table by design (see the migration). */
export async function recordConfirmationEvent(
  productInstanceId: string,
  input: { candidateId: string | null; recordType: string; recordId: string; action: ConfirmationAction; previousValue?: unknown; newValue?: unknown }
): Promise<Result<ConfirmationEvent>> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) return err({ kind: "network", message: userError.message });
  if (!user) return err({ kind: "not-authenticated" });

  const { data, error } = await supabase
    .from("pfc_confirmation_events")
    .insert({
      product_instance_id: productInstanceId,
      user_id: user.id,
      candidate_id: input.candidateId,
      record_type: input.recordType,
      record_id: input.recordId,
      action: input.action,
      previous_value: input.previousValue ?? null,
      new_value: input.newValue ?? null,
    })
    .select("id, candidate_id, record_type, record_id, action, created_at")
    .single();

  if (error) return err({ kind: "network", message: error.message });
  return ok({
    id: data.id,
    candidateId: data.candidate_id,
    recordType: data.record_type,
    recordId: data.record_id,
    action: data.action,
    createdAt: data.created_at,
  });
}
