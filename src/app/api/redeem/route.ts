import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The only endpoint that ever redeems a code. POST-only, cookie-based
 * session (this is a real signed-in user action, not a cron job), calls
 * the SECURITY DEFINER redeem_entitlement_code RPC which does the actual
 * validation/grant atomically. This route is pure plumbing: auth check,
 * call the RPC, translate its error message into an HTTP response.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let code: unknown;
  try {
    const body = await request.json();
    code = body?.code;
  } catch {
    return NextResponse.json({ error: "Enter a code." }, { status: 400 });
  }

  if (typeof code !== "string" || code.trim() === "") {
    return NextResponse.json({ error: "Enter a code." }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("redeem_entitlement_code", { p_code: code }).maybeSingle();
  const row = data as { product_slug: string; entitlement_id: string; product_instance_id: string } | null;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  if (!row) {
    return NextResponse.json({ error: "That code could not be redeemed." }, { status: 422 });
  }

  return NextResponse.json({ ok: true, productSlug: row.product_slug });
}
