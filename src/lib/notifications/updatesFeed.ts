import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The one place any product's cron evaluator records a real, plain-
 * language row in the cross-product Updates feed (public.product_updates
 * — see its own migration for the schema and RLS reasoning). Called
 * with the exact same title/body/url/dedupeKey already computed for
 * sendWebPush, never a separately-invented copy, and called regardless
 * of whether the user has a push subscription: web push opt-in is rare,
 * and the feed exists specifically so "stay updated" stays true for
 * everyone else too.
 *
 * A plain idempotent upsert, not a claim/release dance like the push
 * delivery ledger: there's no external side effect here to protect
 * against double-firing, just a row that should exist exactly once per
 * (user, product, dedupe key).
 */
export async function insertProductUpdate(
  supabase: SupabaseClient,
  input: {
    userId: string;
    productSlug: string;
    productInstanceId: string | null;
    title: string;
    body: string;
    url: string;
    dedupeKey: string;
  }
): Promise<void> {
  await supabase.from("product_updates").upsert(
    {
      user_id: input.userId,
      product_slug: input.productSlug,
      product_instance_id: input.productInstanceId,
      title: input.title,
      body: input.body,
      url: input.url,
      dedupe_key: input.dedupeKey,
    },
    { onConflict: "user_id,product_slug,dedupe_key", ignoreDuplicates: true }
  );
}
