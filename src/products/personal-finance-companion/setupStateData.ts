"use client";

import { supabase } from "@/lib/supabase/client";
import {
  createEmptySetupState,
  validateSetupState,
  type PersonalFinanceCompanionSetupState,
} from "./state";

/**
 * The client-side data-access layer for Personal Finance Companion's
 * Companion setup-state (not the seven financial record tables — see
 * domain/ for those). Mirrors Monthly Money Reset's data.ts pattern
 * exactly (interpret* pure functions separated from the network call,
 * distinguishing a query error from a genuine not-found result — see that
 * file's own comment on the incident this distinction prevents), with one
 * difference: findInstanceId here does not match today's cycle key, since
 * this product's cycleModel is "continuous" (see
 * src/product-framework/definition.ts and
 * src/app/app/products/[productSlug]/page.tsx for the same adaptation at
 * the route level).
 */

export const PERSONAL_FINANCE_COMPANION_SLUG = "personal-finance-companion";

export type FindInstanceResult =
  | { status: "found"; id: string }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function interpretFindInstanceResponse(
  data: { id: string } | null,
  error: { message: string } | null
): FindInstanceResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not-found" };
  return { status: "found", id: data.id };
}

/** Finds this product's single continuous instance for the current user, ignoring cycle_key (see module comment). */
export async function findPersonalFinanceCompanionInstanceId(): Promise<FindInstanceResult> {
  const { data, error } = await supabase
    .from("product_instances")
    .select("id")
    .eq("product_slug", PERSONAL_FINANCE_COMPANION_SLUG)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return interpretFindInstanceResponse(data, error);
}

export type LoadSetupStateResult =
  | { status: "ok"; revision: number; state: PersonalFinanceCompanionSetupState }
  | { status: "not-found" }
  | { status: "error"; message: string };

export function interpretLoadResponse(
  data: { state: unknown; revision: number } | null,
  error: { message: string } | null
): LoadSetupStateResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "not-found" };

  // A freshly created instance with no autosave yet stores state: '{}'.
  // Real, not corrupt — hand back the empty default rather than failing
  // validation, matching Monthly Money Reset's identical handling.
  if (
    data.state &&
    typeof data.state === "object" &&
    !Array.isArray(data.state) &&
    Object.keys(data.state).length === 0
  ) {
    return { status: "ok", revision: data.revision, state: createEmptySetupState() };
  }

  try {
    const state = validateSetupState(data.state);
    return { status: "ok", revision: data.revision, state };
  } catch {
    return { status: "error", message: "Saved setup state failed validation and could not be loaded." };
  }
}

export async function loadPersonalFinanceCompanionSetupState(instanceId: string): Promise<LoadSetupStateResult> {
  const { data, error } = await supabase
    .from("pfc_setup_state")
    .select("state, revision")
    .eq("product_instance_id", instanceId)
    .maybeSingle();

  return interpretLoadResponse(data, error);
}

export type SaveSetupStateResult =
  | { status: "ok"; revision: number }
  | { status: "conflict"; revision: number; state: PersonalFinanceCompanionSetupState }
  | { status: "error"; message: string };

type SaveRpcRow = { revision: number; state: unknown; conflict: boolean } | null | undefined;

export function interpretSaveResponse(row: SaveRpcRow, error: { message: string } | null): SaveSetupStateResult {
  if (error) return { status: "error", message: error.message };
  if (!row) return { status: "error", message: "No response from save." };

  if (row.conflict) {
    try {
      const state = validateSetupState(row.state);
      return { status: "conflict", revision: row.revision, state };
    } catch {
      return { status: "error", message: "Conflicting setup state failed validation and could not be loaded." };
    }
  }

  return { status: "ok", revision: row.revision };
}

/**
 * Saves setup state. The RPC lazily creates the row on the very first
 * call for a given instance (p_expected_revision is ignored when no row
 * exists yet) — see the save_personal_finance_companion_setup_state
 * migration comment for why this differs from grant_free_product's
 * eager creation.
 */
export async function savePersonalFinanceCompanionSetupState(params: {
  instanceId: string;
  expectedRevision: number;
  state: PersonalFinanceCompanionSetupState;
}): Promise<SaveSetupStateResult> {
  const { data, error } = await supabase.rpc("save_personal_finance_companion_setup_state", {
    p_instance_id: params.instanceId,
    p_expected_revision: params.expectedRevision,
    p_new_state: params.state,
  });

  const row = (Array.isArray(data) ? data[0] : data) as SaveRpcRow;
  return interpretSaveResponse(row, error);
}
