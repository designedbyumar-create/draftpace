"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Generic, product-agnostic access to entitlements — the real source of
 * truth for "what does this user own," as opposed to product_instances
 * (instances.ts), which is lifecycle/progress data for something already
 * owned. See docs/DATA-BOUNDARIES.md.
 */

export type AccessSource = "free-grant" | "purchase" | "admin-grant";

export type EntitlementSummary = {
  id: string;
  productSlug: string;
  accessSource: AccessSource;
  grantedAt: string;
};

export type ListEntitlementsResult =
  | { status: "ok"; rows: EntitlementSummary[] }
  | { status: "error"; message: string };

type EntitlementRow = {
  id: string;
  product_slug: string;
  access_source: AccessSource;
  granted_at: string;
};

/** Shapes a raw Supabase select response — pure and unit-testable without a network call. */
export function interpretListEntitlementsResponse(
  data: EntitlementRow[] | null,
  error: { message: string } | null
): ListEntitlementsResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "No response while loading your entitlements." };

  return {
    status: "ok",
    rows: data.map((row) => ({
      id: row.id,
      productSlug: row.product_slug,
      accessSource: row.access_source,
      grantedAt: row.granted_at,
    })),
  };
}

/**
 * A query failure here must never be presented as "you own nothing" — the
 * whole reason this module exists is to make ownership failures loud and
 * retryable instead of silently collapsing to an empty list.
 */
export async function listMyEntitlements(): Promise<ListEntitlementsResult> {
  const { data, error } = await supabase
    .from("entitlements")
    .select("id, product_slug, access_source, granted_at")
    .eq("is_active", true)
    .is("revoked_at", null)
    .order("granted_at", { ascending: false });

  return interpretListEntitlementsResponse(data, error);
}
