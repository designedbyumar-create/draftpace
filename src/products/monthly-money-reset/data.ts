"use client";

import { supabase } from "@/lib/supabase/client";
import { MonthlyMoneyResetState, validateMonthlyMoneyResetState } from "./state";

/**
 * The client-side data-access layer for Monthly Money Reset. Every read is a
 * plain RLS-scoped select; every write goes through the
 * save_monthly_money_reset_state RPC added in the migration, which is the
 * only thing with permission to write to monthly_money_reset_states (see
 * docs/FREE-PRODUCT-ACTIVATION.md). Nothing here can write another user's
 * row — RLS on the select, and the function's own auth.uid() check on the
 * write, both independently enforce that.
 */

export type LoadStateResult =
  | { status: "ok"; revision: number; state: MonthlyMoneyResetState }
  | { status: "not-found" }
  | { status: "error"; message: string };

/** Shapes a raw Supabase select response — pure and unit-testable without a network call. */
export function interpretLoadResponse(
  data: { state: unknown; revision: number } | null,
  error: { message: string } | null
): LoadStateResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not-found" };

  try {
    const state = validateMonthlyMoneyResetState(data.state);
    return { status: "ok", revision: data.revision, state };
  } catch {
    return { status: "error", message: "Saved state failed validation and could not be loaded." };
  }
}

/** Finds the instance id for a given product+cycle, or null if none exists yet. */
export async function findProductInstanceId(productSlug: string, cycleKey: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("cycle_key", cycleKey)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function loadMonthlyMoneyResetState(instanceId: string): Promise<LoadStateResult> {
  const { data, error } = await supabase
    .from("monthly_money_reset_states")
    .select("state, revision")
    .eq("product_instance_id", instanceId)
    .maybeSingle();

  return interpretLoadResponse(data, error);
}

export type SaveStateResult =
  | { status: "ok"; revision: number }
  | { status: "conflict"; revision: number; state: MonthlyMoneyResetState }
  | { status: "error"; message: string };

type SaveRpcRow = { revision: number; state: unknown; conflict: boolean } | null | undefined;

/**
 * Shapes the raw save_monthly_money_reset_state RPC response — pure and
 * unit-testable without a network call. A conflict result means someone
 * else wrote a newer revision; the caller is expected to reload from the
 * returned state (the server's authoritative copy) rather than retry the
 * same write blindly — see the Workspace/Setup modules for how the
 * conflict is surfaced to the user.
 */
export function interpretSaveResponse(row: SaveRpcRow, error: { message: string } | null): SaveStateResult {
  if (error) return { status: "error", message: error.message };
  if (!row) return { status: "error", message: "No response from save." };

  if (row.conflict) {
    try {
      const state = validateMonthlyMoneyResetState(row.state);
      return { status: "conflict", revision: row.revision, state };
    } catch {
      return { status: "error", message: "Conflicting state failed validation and could not be loaded." };
    }
  }

  return { status: "ok", revision: row.revision };
}

export async function saveMonthlyMoneyResetState(params: {
  instanceId: string;
  expectedRevision: number;
  state: MonthlyMoneyResetState;
  setupComplete: boolean;
  safeToSpendMinorUnits: number;
  nextActionLabel: string | null;
}): Promise<SaveStateResult> {
  const { data, error } = await supabase.rpc("save_monthly_money_reset_state", {
    p_instance_id: params.instanceId,
    p_expected_revision: params.expectedRevision,
    p_new_state: params.state,
    p_setup_complete: params.setupComplete,
    p_safe_to_spend_cents: params.safeToSpendMinorUnits,
    p_next_action_label: params.nextActionLabel,
  });

  const row = (Array.isArray(data) ? data[0] : data) as SaveRpcRow;
  return interpretSaveResponse(row, error);
}

export type ProductInstanceSummary = {
  id: string;
  productSlug: string;
  cycleKey: string;
  lifecycleState: "active" | "completed" | "paused" | "archived";
  setupComplete: boolean;
  safeToSpendMinorUnits: number | null;
  nextActionLabel: string | null;
  lastActivityAt: string;
};

/**
 * The lightweight, product-agnostic instance summaries Library and Platform
 * Home read from — never the full product-specific state (see
 * docs/DATA-BOUNDARIES.md on why product_instances stays generic).
 */
export async function listMyProductInstances(productSlug?: string): Promise<ProductInstanceSummary[]> {
  let query = supabase
    .from("product_instances")
    .select(
      "id, product_slug, cycle_key, lifecycle_state, setup_complete, safe_to_spend_cents, next_action_label, last_activity_at"
    )
    .order("last_activity_at", { ascending: false });

  if (productSlug) query = query.eq("product_slug", productSlug);

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    productSlug: row.product_slug,
    cycleKey: row.cycle_key,
    lifecycleState: row.lifecycle_state,
    setupComplete: row.setup_complete,
    safeToSpendMinorUnits: row.safe_to_spend_cents,
    nextActionLabel: row.next_action_label,
    lastActivityAt: row.last_activity_at,
  }));
}
