"use client";

import { supabase } from "@/lib/supabase/client";
import { interpretFindInstanceResponse, type FindInstanceResult } from "../home-management-companion/setupStateData";

/**
 * Instance resolution for Alongside. Same "continuous" shape as its four
 * siblings: one instance ever, found by slug and most recently created,
 * ignoring cycle_key.
 */

export const ALONGSIDE_SLUG = "alongside";

export async function findAlongsideInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", ALONGSIDE_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return interpretFindInstanceResponse(data, error);
}
