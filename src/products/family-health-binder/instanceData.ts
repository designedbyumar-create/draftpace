"use client";

import { supabase } from "@/lib/supabase/client";

/** Same shape every continuous-cycle product's instance lookup returns. */
export type FindInstanceResult = { status: "found"; id: string } | { status: "not-found" } | { status: "error"; message: string };

export const FAMILY_HEALTH_BINDER_SLUG = "family-health-binder";

/** Finds this product's single continuous instance for the current user, ignoring cycle_key, same shape as every sibling's own instance lookup. */
export async function findFamilyHealthBinderInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", FAMILY_HEALTH_BINDER_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not-found" };
  return { status: "found", id: data.id };
}
