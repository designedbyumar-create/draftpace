"use client";

import { supabase } from "@/lib/supabase/client";

/**
 * Generic, product-agnostic access to the Updates feed (public.
 * product_updates — see its own migration for schema/RLS reasoning). Every
 * row here was written by a product's own cron evaluator with the exact
 * text it already sends via push, so this is never a second, separately
 * invented copy of that message.
 */

export type UpdateRow = {
  id: string;
  productSlug: string;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  acknowledgedAt: string | null;
};

export type ListUpdatesResult =
  | { status: "ok"; rows: UpdateRow[] }
  | { status: "error"; message: string };

type UpdateFeedRow = {
  id: string;
  product_slug: string;
  title: string;
  body: string;
  url: string;
  created_at: string;
  acknowledged_at: string | null;
};

/** Shapes a raw Supabase select response — pure and unit-testable without a network call. */
export function interpretListUpdatesResponse(
  data: UpdateFeedRow[] | null,
  error: { message: string } | null
): ListUpdatesResult {
  if (error) return { status: "error", message: error.message };
  if (!data) return { status: "error", message: "No response while loading your updates." };

  return {
    status: "ok",
    rows: data.map((row) => ({
      id: row.id,
      productSlug: row.product_slug,
      title: row.title,
      body: row.body,
      url: row.url,
      createdAt: row.created_at,
      acknowledgedAt: row.acknowledged_at,
    })),
  };
}

/**
 * A query failure here must never be presented as "you have no updates" —
 * same discipline as listMyEntitlements, for the same reason.
 */
export async function listMyUpdates(): Promise<ListUpdatesResult> {
  const { data, error } = await supabase
    .from("product_updates")
    .select("id, product_slug, title, body, url, created_at, acknowledged_at")
    .order("created_at", { ascending: false });

  return interpretListUpdatesResponse(data, error);
}

export async function markUpdateHandled(id: string): Promise<void> {
  await supabase.from("product_updates").update({ acknowledged_at: new Date().toISOString() }).eq("id", id);
}

/**
 * Existence-only check for the nav Bell — never fetches rows, just whether
 * any exist, so this can run on every page without paying for the list
 * query it isn't showing.
 */
export async function hasUnhandledUpdates(): Promise<boolean> {
  const { count } = await supabase
    .from("product_updates")
    .select("id", { count: "exact", head: true })
    .is("acknowledged_at", null)
    .limit(1);

  return (count ?? 0) > 0;
}
