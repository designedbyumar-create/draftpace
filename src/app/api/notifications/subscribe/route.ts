import { NextResponse } from "next/server";
import { getSupabaseClientForBearer } from "@/lib/server-auth";

interface PushSubscriptionJson {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/**
 * Real persistence (Stage F) — upserts by endpoint, scoped to the caller
 * by RLS (the client used here carries the caller's own access token, see
 * getSupabaseClientForBearer; this is never a service-role bypass). If the
 * endpoint already belongs to a different user's row, the RLS update
 * policy's `using (auth.uid() = user_id)` blocks the conflict branch and
 * the whole upsert fails closed rather than silently reassigning it.
 */
export async function POST(request: Request) {
  const { user, supabase, error } = await getSupabaseClientForBearer(request);
  if (!user || !supabase) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  const subscription = (await request.json().catch(() => null)) as PushSubscriptionJson | null;
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return NextResponse.json({ error: "Malformed push subscription." }, { status: 400 });
  }

  const { error: dbError } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth_key: subscription.keys.auth,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
      updated_at: new Date().toISOString(),
      revoked_at: null,
      failure_count: 0,
    },
    { onConflict: "endpoint" }
  );

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
