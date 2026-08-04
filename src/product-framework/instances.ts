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
      "id, product_slug, cycle_key, lifecycle_state, setup_complete, safe_to_spend_cents, next_action_label, last_activity_at"
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
