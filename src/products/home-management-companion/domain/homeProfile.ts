"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";

/**
 * The few facts about a home that shape what the product asks, as
 * opposed to the things inside it. A single row per instance, same
 * singleton shape as notification preferences rather than a list.
 */

export type HomeTenure = "own" | "rent";

export interface HomeProfile {
  tenure: HomeTenure | null;
}

export function defaultHomeProfile(): HomeProfile {
  return { tenure: null };
}

export async function loadHomeProfile(productInstanceId: string): Promise<Result<HomeProfile>> {
  const { data, error } = await supabase
    .from("hmc_home_profile")
    .select("tenure")
    .eq("product_instance_id", productInstanceId)
    .maybeSingle();

  // A missing table or a missing row both mean the same thing to the
  // product: nothing has been said about this home yet. Never an error
  // the person has to see, since every question here is optional.
  if (error) return ok(defaultHomeProfile());
  if (!data) return ok(defaultHomeProfile());
  const tenure = data.tenure === "own" || data.tenure === "rent" ? data.tenure : null;
  return ok({ tenure });
}

export async function saveHomeProfile(productInstanceId: string, profile: HomeProfile): Promise<Result<HomeProfile>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { error } = await supabase
    .from("hmc_home_profile")
    .upsert(
      {
        product_instance_id: productInstanceId,
        user_id: session.user.id,
        tenure: profile.tenure,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_instance_id" }
    );

  if (error) return err({ kind: "network", message: error.message });
  return ok(profile);
}
