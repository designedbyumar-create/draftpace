import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/server-auth";
import { insertProductUpdate } from "@/lib/notifications/updatesFeed";
import { evaluateProductUpdates, isEvaluatedProductSlug } from "@/product-framework/updatesEvaluators";

/**
 * The cross-product Updates feed evaluator for the four products with no
 * push infrastructure of their own (Alongside, Homeschooling Companion,
 * Travel Companion, Personal Life Affairs Companion) — deliberately one
 * combined route rather than four separate cron routes/secrets/pg_cron
 * jobs, since none of these send real push (see updatesEvaluators.ts):
 * the only side effect here is a product_updates row, so there's no
 * per-product delivery ledger or subscription check to keep separate.
 *
 * Uses the service-role client (no user session in a cron job), so
 * entitlement is re-checked explicitly here exactly like PFC's and Home
 * Base's own cron routes — RLS is bypassed for this client by design,
 * nothing else stops evaluating a revoked user otherwise.
 */

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const expected = process.env.LIFE_UPDATES_CRON_SECRET ? `Bearer ${process.env.LIFE_UPDATES_CRON_SECRET}` : null;
  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  const supabase = getSupabaseServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({
      ok: false,
      configured: false,
      note: "SUPABASE_SERVICE_ROLE_KEY is not set in this environment. The evaluator cannot query instances across users without it.",
    });
  }

  const now = new Date();
  const summary = {
    instancesEvaluated: 0,
    instancesSkippedNotEntitled: 0,
    updatesWritten: 0,
  };

  const evaluatedSlugs = ["alongside", "homeschooling-companion", "travel-companion", "personal-life-affairs-companion"];

  const [{ data: instanceRows, error: instanceError }, { data: entitlementRows, error: entitlementError }] = await Promise.all([
    supabase.from("product_instances").select("id, user_id, product_slug").in("product_slug", evaluatedSlugs),
    supabase
      .from("entitlements")
      .select("user_id, product_slug")
      .in("product_slug", evaluatedSlugs)
      .eq("is_active", true)
      .is("revoked_at", null),
  ]);
  if (instanceError) return NextResponse.json({ ok: false, error: instanceError.message }, { status: 500 });
  if (entitlementError) return NextResponse.json({ ok: false, error: entitlementError.message }, { status: 500 });

  const entitledKeys = new Set((entitlementRows ?? []).map((row) => `${row.user_id as string}:${row.product_slug as string}`));

  for (const instance of instanceRows ?? []) {
    const instanceId = instance.id as string;
    const userId = instance.user_id as string;
    const productSlug = instance.product_slug as string;

    if (!entitledKeys.has(`${userId}:${productSlug}`)) {
      summary.instancesSkippedNotEntitled += 1;
      continue;
    }
    if (!isEvaluatedProductSlug(productSlug)) continue;

    summary.instancesEvaluated += 1;
    const payloads = await evaluateProductUpdates(supabase, productSlug, instanceId, now);

    for (const payload of payloads) {
      await insertProductUpdate(supabase, {
        userId,
        productSlug,
        productInstanceId: instanceId,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        dedupeKey: payload.dedupeKey,
      });
      summary.updatesWritten += 1;
    }
  }

  return NextResponse.json({ ok: true, configured: true, ...summary });
}
