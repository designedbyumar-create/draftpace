"use client";

import { supabase } from "@/lib/supabase/client";
import { interpretFindInstanceResponse, type FindInstanceResult } from "../home-management-companion/setupStateData";

/**
 * Instance resolution. Same "continuous" shape as all three siblings:
 * one instance ever, found by slug and most recently created, ignoring
 * cycle_key.
 *
 * The interpret helper is reused rather than copied because it is pure
 * and already tested. The query itself is per product on purpose: a
 * shared query taking a slug would be the kind of generic seam the
 * platform docs warn against until a third caller actually needs it,
 * and there are now four products that each want one line of their own.
 */
export const HOMESCHOOLING_COMPANION_SLUG = "homeschooling-companion";

export async function findHomeschoolInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", HOMESCHOOLING_COMPANION_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return interpretFindInstanceResponse(data, error);
}
