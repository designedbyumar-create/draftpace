import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productRegistry } from "@/product-framework/registry";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";
import { currentCycleKey } from "@/products/monthly-money-reset/cycle";

/**
 * The only endpoint that ever grants a free entitlement or creates a
 * product instance. POST-only and intentionally has no GET handler: a GET
 * request, a <Link> prefetch, a crawler, or a link-preview bot hitting this
 * URL does nothing, because there is nothing here for them to hit. The
 * confirmation page at /app/activate/[productSlug] is the safe GET surface
 * that renders the real <form method="POST"> pointing here.
 *
 * This route sits outside src/app/app/layout.tsx's tree (route handlers
 * aren't wrapped by page layouts), so it registers the product itself
 * rather than relying on that layout having already run.
 */
export async function POST(request: Request, { params }: { params: Promise<{ productSlug: string }> }) {
  registerMonthlyMoneyReset();
  const { productSlug } = await params;

  const definition = productRegistry.getBySlug(productSlug);
  if (!definition || definition.access.model !== "free") {
    return NextResponse.json({ error: "This product is not available for free activation." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTo = encodeURIComponent(`/app/activate/${productSlug}`);
    return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url), 303);
  }

  const cycleKey = currentCycleKey();
  const { error } = await supabase.rpc("grant_free_product", {
    p_product_slug: productSlug,
    p_cycle_key: cycleKey,
  });

  if (error) {
    return NextResponse.redirect(new URL(`/app/activate/${productSlug}?error=1`, request.url), 303);
  }

  return NextResponse.redirect(new URL(`/app/products/${productSlug}/start`, request.url), 303);
}
