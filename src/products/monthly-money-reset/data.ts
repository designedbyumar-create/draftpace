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

  // A newly granted instance stores state: '{}', genuinely empty, not
  // corrupt. Return it as "ok" with the empty object so useInstanceState fills
  // it with a real empty state on first load; only non-empty saved state is
  // validated. Without this, the empty state failed validation and surfaced as
  // "error", making a freshly activated product look like it isn't set up.
  if (
    data.state &&
    typeof data.state === "object" &&
    !Array.isArray(data.state) &&
    Object.keys(data.state).length === 0
  ) {
    return { status: "ok", revision: data.revision, state: data.state as MonthlyMoneyResetState };
  }

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

// Generic instance access (used by Platform Home and Library too, not just
// this product) lives in the product-framework, not here — re-exported for
// callers that already import it from this file.
export {
  listMyProductInstances,
  setProductInstanceLifecycle,
  type LifecycleState,
  type ProductInstanceSummary,
} from "@/product-framework/instances";

export type StartCycleResult =
  | { status: "ok"; instanceId: string }
  | { status: "error"; message: string };

/**
 * Starts (or safely re-fetches) the instance for a given cycle. Reuses
 * grant_free_product — it's idempotent per (user, product, cycle_key), and
 * its eligibility check doesn't care whether this is a user's first cycle
 * or their fifth, so a second free product never needs a separate
 * "start next cycle" RPC.
 */
export async function startNextCycle(productSlug: string, cycleKey: string): Promise<StartCycleResult> {
  const { data, error } = await supabase.rpc("grant_free_product", {
    p_product_slug: productSlug,
    p_cycle_key: cycleKey,
  });
  if (error) return { status: "error", message: error.message };
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.product_instance_id) return { status: "error", message: "No instance returned." };
  return { status: "ok", instanceId: row.product_instance_id };
}

