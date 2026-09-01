"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Home Base's instance resolution, mirrors PFC's setupStateData.ts
 * "continuous" adaptation exactly (find by product_slug only, most
 * recently created, ignoring cycle_key). Unlike PFC, Home Base has no
 * JSONB setup-state blob: its real data lives directly in the normalized
 * hmc_* tables (appliances, maintenance tasks, service providers), so
 * there is no load/save-state pair here, only instance lookup and the one
 * small setup-completion flag flip below.
 */

export const HOME_MANAGEMENT_COMPANION_SLUG = "home-management-companion";

export type FindInstanceResult = { status: "found"; id: string } | { status: "not-found" } | { status: "error"; message: string };

export function interpretFindInstanceResponse(
  data: { id: string } | null,
  error: { message: string } | null
): FindInstanceResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not-found" };
  return { status: "found", id: data.id };
}

/** Finds Home Base's single continuous instance for the current user, ignoring cycle_key. */
export async function findHomeManagementCompanionInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", HOME_MANAGEMENT_COMPANION_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return interpretFindInstanceResponse(data, error);
}

/**
 * Flips product_instances.setup_complete for this instance, the one
 * write the Setup wizard performs beyond the ordinary appliance/task
 * creates it already makes through the domain layer. A dedicated small
 * RPC (mark_home_management_companion_setup_complete) rather than a
 * direct client update, since product_instances has no client UPDATE RLS
 * policy, see the migration for the ownership check.
 */
export async function markHomeManagementCompanionSetupComplete(instanceId: string): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("mark_home_management_companion_setup_complete", {
    p_instance_id: instanceId,
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}
