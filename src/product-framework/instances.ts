"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Generic, product-agnostic access to product_instances — the lightweight
 * lifecycle/query-cache rows Library and Platform Home read from, never a
 * product's own full state (see docs/DATA-BOUNDARIES.md). Any product can
 * use this; nothing here is specific to Monthly Money Reset, even though
 * it's the first (and so far only) consumer.
 */

export type LifecycleState = "active" | "completed" | "paused" | "archived";

export type ProductInstanceSummary = {
  id: string;
  productSlug: string;
  cycleKey: string;
  lifecycleState: LifecycleState;
  setupComplete: boolean;
  /**
   * A product's headline metric in minor units, if it has one — named after
   * Monthly Money Reset's Safe-to-Spend since it's the only product that
   * populates it today. A second product with a different kind of headline
   * number would reuse this same column; renaming it more generically is
   * follow-up work for whenever that happens, not a blocker now.
   */
  safeToSpendMinorUnits: number | null;
  nextActionLabel: string | null;
  lastActivityAt: string;
  /**
   * Start (nearly) identical at creation — the same INSERT's `now()` — and
   * diverge the moment the first real save happens. The generic,
   * product-agnostic proxy for "has this instance ever been touched since
   * it was created," used by navigationResolver.ts to tell a genuinely
   * fresh instance apart from one mid-setup without reading any
   * product-specific state.
   */
  createdAt: string;
  updatedAt: string;
  /**
   * Vacation mode for an ongoing (cycleModel: "continuous") Companion —
   * a separate, cycle-agnostic column from lifecycle_state, not a reuse
   * of it. See 202609060002_product_instance_pause.sql's own comment for
   * why: lifecycle_state's mutator is wired to Monthly Money Reset's
   * monthly-cycle model, which every continuous product deliberately
   * never calls at all.
   */
  pausedAt: string | null;
};

export type ListInstancesResult =
  | { status: "ok"; rows: ProductInstanceSummary[] }
  | { status: "error"; message: string };

type ProductInstanceRow = {
  id: string;
  product_slug: string;
  cycle_key: string;
  lifecycle_state: LifecycleState;
  setup_complete: boolean;
  safe_to_spend_cents: number | null;
  next_action_label: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  paused_at: string | null;
};

/** Shapes a raw Supabase select response — pure and unit-testable without a network call. */
export function interpretListInstancesResponse(
  data: ProductInstanceRow[] | null,
  error: { message: string } | null
): ListInstancesResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "No response while loading your progress." };

  return {
    status: "ok",
    rows: data.map((row) => ({
      id: row.id,
      productSlug: row.product_slug,
      cycleKey: row.cycle_key,
      lifecycleState: row.lifecycle_state,
      setupComplete: row.setup_complete,
      safeToSpendMinorUnits: row.safe_to_spend_cents,
      nextActionLabel: row.next_action_label,
      lastActivityAt: row.last_activity_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      pausedAt: row.paused_at,
    })),
  };
}

/**
 * A query failure here must never be presented as "no progress yet" — that's
 * indistinguishable from a genuinely fresh instance to anything downstream
 * that collapses it to []. Callers get an explicit error to render instead.
 */
export async function listMyProductInstances(productSlug?: string): Promise<ListInstancesResult> {
  let query = supabase
    .from("product_instances")
    .select(
      "id, product_slug, cycle_key, lifecycle_state, setup_complete, safe_to_spend_cents, next_action_label, last_activity_at, created_at, updated_at, paused_at"
    )
    .order("last_activity_at", { ascending: false });

  if (productSlug) query = query.eq("product_slug", productSlug);

  const { data, error } = await query;
  return interpretListInstancesResponse(data, error);
}

/** The only way an instance's lifecycle_state ever changes — see set_product_instance_lifecycle in the migration. */
export async function setProductInstanceLifecycle(
  instanceId: string,
  lifecycleState: LifecycleState
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("set_product_instance_lifecycle", {
    p_instance_id: instanceId,
    p_lifecycle_state: lifecycleState,
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}

/** The only way an instance's paused_at ever changes — see set_product_instance_paused in the migration. Independent of setProductInstanceLifecycle above; see paused_at's own field comment for why. */
export async function setProductInstancePaused(
  instanceId: string,
  paused: boolean
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.rpc("set_product_instance_paused", {
    p_instance_id: instanceId,
    p_paused: paused,
  });
  return error ? { ok: false, message: error.message } : { ok: true };
}
