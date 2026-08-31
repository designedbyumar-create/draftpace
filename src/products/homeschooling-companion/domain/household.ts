"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import { getHomeschoolStateRequirement, HOMESCHOOL_STATE_NAMES } from "@/lib/homeschoolStateRequirements";

/**
 * The one household-level fact this product asks: which state a family
 * homeschools in. Same singleton shape as Home Base's home profile,
 * same reason, a fact about the household rather than about any one
 * child, asked once rather than re-asked per child.
 */

export interface Household {
  state: string | null;
}

export function defaultHousehold(): Household {
  return { state: null };
}

export async function loadHousehold(productInstanceId: string): Promise<Result<Household>> {
  const { data, error } = await supabase
    .from("hsc_household")
    .select("state")
    .eq("product_instance_id", productInstanceId)
    .maybeSingle();

  // A missing table or a missing row both mean the same thing to the
  // product: nothing has been said yet. Never an error the person has
  // to see, since this question is entirely optional.
  if (error) return ok(defaultHousehold());
  if (!data) return ok(defaultHousehold());
  // Validated against the same 51 names the picker offers, not just
  // trusted as a free string back from the database.
  const state = typeof data.state === "string" && HOMESCHOOL_STATE_NAMES.includes(data.state) ? data.state : null;
  return ok({ state });
}

export async function saveHousehold(productInstanceId: string, household: Household): Promise<Result<Household>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { error } = await supabase.from("hsc_household").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: session.user.id,
      state: household.state,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_instance_id" }
  );

  if (error) return err({ kind: "network", message: error.message });
  return ok(household);
}

/** The regulation level and note for a saved household, or null if no
 * state has been picked yet, or the saved name somehow no longer
 * matches (the two should never drift, this is the honest fallback if
 * they ever do). */
export function householdRequirement(household: Household) {
  if (!household.state) return null;
  return getHomeschoolStateRequirement(household.state) ?? null;
}
