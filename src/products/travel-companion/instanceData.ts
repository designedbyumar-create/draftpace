"use client";

import { supabase } from "@/lib/supabase/client";
import { interpretFindInstanceResponse, type FindInstanceResult } from "../home-management-companion/setupStateData";

/**
 * Instance resolution for Travel Companion. Same "continuous" shape as
 * every sibling: one instance ever per account, found by slug and most
 * recently created, ignoring cycle_key. Trips are user-created records
 * inside that one instance, the same tier Homeschooling Companion's
 * children use, not a second instance per trip.
 */

export const TRAVEL_COMPANION_SLUG = "travel-companion";

export async function findTravelCompanionInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", TRAVEL_COMPANION_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return interpretFindInstanceResponse(data, error);
}
