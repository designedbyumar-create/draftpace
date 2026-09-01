import { notFound, redirect } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentCycleKey } from "@/product-framework/cycle";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import type { ProductInstanceSummary } from "@/product-framework/instances";
import RetryState from "@/components/product-shell/RetryState";

/**
 * The canonical entry point for an owned product. Reached only after
 * [productSlug]/layout.tsx has already confirmed an active entitlement — this
 * route never re-checks that. It always redirects, never renders, so Library,
 * Home, and activation-success can all link here instead of each guessing a
 * destination themselves.
 */
export default async function ProductCanonicalPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  const supabase = await createSupabaseServerClient();
  const cycleKey = currentCycleKey();

  // See the identical cycleModel branch in this segment's layout.tsx for why
  // a continuous product (no monthly reset) is found by most-recently-
  // created rather than by matching today's cycle key.
  const instanceQuery = supabase
    .from("product_instances")
    .select(
      "id, product_slug, cycle_key, lifecycle_state, setup_complete, safe_to_spend_cents, next_action_label, last_activity_at, created_at, updated_at"
    )
    .eq("product_slug", productSlug);
  const { data: instanceRow, error: instanceError } =
    definition.cycleModel === "continuous"
      ? await instanceQuery.order("created_at", { ascending: false }).limit(1).maybeSingle()
      : await instanceQuery.eq("cycle_key", cycleKey).maybeSingle();

  if (instanceError) {
    return (
      <RetryState
        title="Couldn't load your progress"
        description="Your access hasn't changed. This was just a read failure, check your connection and try again."
        retryHref={`/app/products/${productSlug}`}
      />
    );
  }

  if (instanceRow) {
    const instance: ProductInstanceSummary = {
      id: instanceRow.id,
      productSlug: instanceRow.product_slug,
      cycleKey: instanceRow.cycle_key,
      lifecycleState: instanceRow.lifecycle_state,
      setupComplete: instanceRow.setup_complete,
      safeToSpendMinorUnits: instanceRow.safe_to_spend_cents,
      nextActionLabel: instanceRow.next_action_label,
      lastActivityAt: instanceRow.last_activity_at,
      createdAt: instanceRow.created_at,
      updatedAt: instanceRow.updated_at,
    };
    redirect(resolveProductDestination(definition, instance));
  }

  // No instance for this cycle yet. The layout already confirmed an active
  // entitlement, so this is a first visit (or a new cycle) — create the
  // instance now instead of showing an empty product. grant_free_product is
  // idempotent and only re-asserts consent the user already gave once.
  if (definition.access.model !== "free") {
    return (
      <RetryState
        title="This product isn't set up yet"
        description="Something went wrong getting your access ready. Try again, or contact support if this keeps happening."
        retryHref={`/app/products/${productSlug}`}
      />
    );
  }

  const { error: grantError } = await supabase.rpc("grant_free_product", {
    p_product_slug: productSlug,
    p_cycle_key: cycleKey,
  });

  if (grantError) {
    return (
      <RetryState
        title="Couldn't set up this product"
        description="Try again, or contact support if this keeps happening."
        retryHref={`/app/products/${productSlug}`}
      />
    );
  }

  redirect(`/app/products/${productSlug}/${definition.startRoute}`);
}
