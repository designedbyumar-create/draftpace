import { NextResponse } from "next/server";
import { getSupabaseClientForBearer } from "@/lib/server-auth";
import { isWebPushConfigured, sendWebPush } from "@/lib/notifications/webPush";

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

/**
 * Sends a real test push to the AUTHENTICATED CALLER'S OWN device(s) only
 * (Stage F §29) — never an arbitrary user, never an arbitrary body. RLS
 * (via the bearer-scoped client) is what actually enforces "own
 * subscriptions only"; the .eq("user_id", user.id) below is redundant
 * with it, kept for clarity, not as the real boundary.
 */
export async function POST(request: Request) {
  const { user, supabase, error } = await getSupabaseClientForBearer(request);
  if (!user || !supabase) return NextResponse.json({ error: error || "Please sign in first." }, { status: 401 });

  if (!isWebPushConfigured()) {
    return NextResponse.json(
      { error: "Push isn't configured on this deployment yet (missing VAPID environment variables)." },
      { status: 503 }
    );
  }

  const { data, error: dbError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", user.id)
    .is("revoked_at", null);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  const subscriptions = (data as SubscriptionRow[]) ?? [];
  if (subscriptions.length === 0) {
    return NextResponse.json({ error: "No active push subscription for this device. Enable notifications first." }, { status: 400 });
  }

  let sent = 0;
  for (const subscription of subscriptions) {
    const outcome = await sendWebPush(
      { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth_key } },
      { title: "Draftpace", body: "This is a test — your reminder pipeline is working.", url: "/app/products/personal-finance-companion/workspace" }
    );
    if (outcome.outcome === "sent") {
      sent += 1;
      await supabase.from("push_subscriptions").update({ last_success_at: new Date().toISOString() }).eq("id", subscription.id);
    } else if (outcome.outcome === "gone") {
      await supabase.from("push_subscriptions").update({ revoked_at: new Date().toISOString() }).eq("id", subscription.id);
    }
  }

  if (sent === 0) return NextResponse.json({ error: "Could not deliver to any registered device." }, { status: 502 });
  return NextResponse.json({ ok: true, message: `Test notification sent to ${sent} device${sent === 1 ? "" : "s"}.` });
}
