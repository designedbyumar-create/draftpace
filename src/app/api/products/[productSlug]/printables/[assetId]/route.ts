import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { printableAssetRegistry } from "@/product-framework/printableAssets";
import { getPrintableAssetBytes as getFinanceCompanionAssetBytes } from "@/products/personal-finance-companion/printables/assetBytes";
import { getPrintableAssetBytes as getHomeSurveyAssetBytes } from "@/products/home-management-companion/printables/assetBytes";
import { getPrintableAssetBytes as getHomeschoolYearAssetBytes } from "@/products/homeschooling-companion/printables/assetBytes";

/**
 * Serves an included printable asset's actual bytes, gated by the same
 * entitlement check src/app/app/products/[productSlug]/layout.tsx uses for
 * every other product route. Route handlers aren't wrapped by page layouts
 * (see activate/route.ts's own comment on this), so this route repeats the
 * check itself rather than relying on that layout having already run.
 *
 * The byte lookup is product-specific by design, not generic: this file is
 * the one place allowed to import a product's own asset loader directly,
 * the same way src/app/api/notifications/cron/route.ts already imports
 * Personal Finance Companion's reminder code directly. A second product
 * with its own printable would add its own `if (productSlug === ...)`
 * branch and loader import here, not a shared bytes registry — bytes are
 * deliberately kept out of any generic, client-reachable registry.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ productSlug: string; assetId: string }> }
) {
  ensureProductsRegistered();
  const { productSlug, assetId } = await params;

  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const asset = printableAssetRegistry.get(productSlug, assetId);
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectTo = encodeURIComponent(`/app/products/${productSlug}/printables`);
    return NextResponse.redirect(new URL(`/login?redirectTo=${redirectTo}`, request.url), 303);
  }

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("is_active", true)
    .is("revoked_at", null)
    .maybeSingle();

  // A failed read must never be treated as "not entitled" — same rule the
  // layout gate follows. Return a retryable error, not a redirect to
  // activation.
  if (error) {
    return NextResponse.json({ error: "Couldn't check your access. Try again." }, { status: 503 });
  }

  if (!entitlement) {
    return NextResponse.redirect(new URL(`/app/activate/${productSlug}`, request.url), 303);
  }

  // One branch per product with a printable, per this file's contract
  // above. The entitlement check has already passed at this point and is
  // keyed on the same productSlug used to pick the loader, so a product
  // can only ever serve its own bytes.
  const loader =
    productSlug === "personal-finance-companion"
      ? getFinanceCompanionAssetBytes
      : productSlug === "home-management-companion"
        ? getHomeSurveyAssetBytes
        : productSlug === "homeschooling-companion"
          ? getHomeschoolYearAssetBytes
          : null;

  if (!loader) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bytes = loader(assetId);
  if (!bytes) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${asset.filename}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}
