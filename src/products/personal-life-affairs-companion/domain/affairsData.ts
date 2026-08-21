"use client";

import { supabase } from "@/lib/supabase/client";
import { ok, err, type Result } from "@/product-framework/result";
import type { AffairGate } from "../affairsKnowledge";
import type { AffairProfile, StepRecord, StepState } from "../sequencer";

/**
 * Everything this product reads from and writes to the database.
 *
 * Deliberately one file rather than a repository per table. Home Base
 * has six domain modules because it has six independent record types
 * that a person browses separately. This product has one surface and one
 * loop, so splitting it would create files that only ever get called
 * together.
 *
 * Nothing here writes a credential or a document. pla_items records
 * where a thing is and who it concerns, which is the product boundary.
 */

/** Maps the profile's snake_case columns to the gate names the knowledge base uses. */
const GATE_COLUMN: Record<AffairGate, string> = {
  hasChildren: "has_children",
  hasDependantsWithExtraNeeds: "has_dependants_with_extra_needs",
  partnered: "partnered",
  ownsHome: "owns_home",
  hasEmployerRetirement: "has_employer_retirement",
  hasBusiness: "has_business",
  hasPets: "has_pets",
  hasLifeInsurance: "has_life_insurance",
};

export async function loadProfile(productInstanceId: string): Promise<Result<AffairProfile>> {
  const { data, error } = await supabase
    .from("pla_profile")
    .select(Object.values(GATE_COLUMN).join(", "))
    .eq("product_instance_id", productInstanceId)
    .maybeSingle();

  // No row means nothing has been asked yet, which is a valid state and
  // never an error a person should see.
  if (error || !data) return ok({});

  const row = data as unknown as Record<string, boolean | null>;
  const profile: AffairProfile = {};
  for (const [gate, column] of Object.entries(GATE_COLUMN) as [AffairGate, string][]) {
    const value = row[column];
    if (typeof value === "boolean") profile[gate] = value;
  }
  return ok(profile);
}

export async function saveProfileAnswer(
  productInstanceId: string,
  gate: AffairGate,
  value: boolean
): Promise<Result<AffairProfile>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { error } = await supabase.from("pla_profile").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: session.user.id,
      [GATE_COLUMN[gate]]: value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_instance_id" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return loadProfile(productInstanceId);
}

export async function loadSteps(productInstanceId: string): Promise<Result<StepRecord[]>> {
  const { data, error } = await supabase
    .from("pla_steps")
    .select("step_key, state, confirmed_at, snoozed_until")
    .eq("product_instance_id", productInstanceId);

  if (error) return err({ kind: "network", message: error.message });

  const rows = (data ?? []) as unknown as {
    step_key: string;
    state: string;
    confirmed_at: string | null;
    snoozed_until: string | null;
  }[];

  return ok(
    rows.map((row) => ({
      stepKey: row.step_key,
      state: row.state as StepState,
      confirmedAt: row.confirmed_at,
      snoozedUntil: row.snoozed_until,
    }))
  );
}

/**
 * Records what a person decided about one step.
 *
 * confirmed_at is written only when the state is "confirmed", and it is
 * the moment a human asserted the fact is still true. Every other state
 * clears it, because a step that is open or not relevant has no
 * currency to claim. This is what lets the printed copy tell a family
 * what is current and what is not.
 */
export async function recordStep(
  productInstanceId: string,
  stepKey: string,
  state: StepState,
  options: { notes?: string | null; snoozedUntil?: string | null } = {}
): Promise<Result<StepRecord[]>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) return err({ kind: "network", message: sessionError.message });
  if (!session) return err({ kind: "not-authenticated" });

  const { error } = await supabase.from("pla_steps").upsert(
    {
      product_instance_id: productInstanceId,
      user_id: session.user.id,
      step_key: stepKey,
      state,
      confirmed_at: state === "confirmed" ? new Date().toISOString() : null,
      needs_recheck_reason: null,
      notes: options.notes ?? null,
      snoozed_until: options.snoozedUntil ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_instance_id,step_key" }
  );
  if (error) return err({ kind: "network", message: error.message });
  return loadSteps(productInstanceId);
}
