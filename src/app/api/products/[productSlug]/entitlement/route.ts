import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Answers one question for the post-purchase screen: has this product's
 * entitlement landed for the signed-in visitor yet?
 *
 * WHY THIS EXISTS
 *
 * Payment and grant are asynchronous. Lemon Squeezy closes its overlay as
 * soon as the card clears, but the grant only happens when its webhook
 * reaches /api/lemon-squeezy/webhook, which is a separate request on a
 * separate connection and can lag by seconds. Sending a paying customer
 * straight to the product loses that race often enough to matter, and
 * losing it means the product layout bounces them to an activation page
 * telling them they do not own the thing they just paid for.
 *
 * So /app/welcome/[productSlug] waits instead, and polls this.
 *
 * READ-ONLY, DELIBERATELY. This route grants nothing and can grant
 * nothing. The only thing that turns a payment into an entitlement is the
 * signature-verified webhook. A polling endpoint that could grant would
 * be a way to get a product by asking for it repeatedly.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("is_active", true)
    .is("revoked_at", null)
    .maybeSingle();

  // A read failure is never reported as "not granted". The caller is a
  // poller: telling it `granted: false` would make a transient database
  // blip indistinguishable from a webhook that has not arrived, and the
  // screen would keep waiting on something that already happened.
  if (error) return NextResponse.json({ error: error.message }, { status: 503 });

  return NextResponse.json({ granted: Boolean(data) });
}
