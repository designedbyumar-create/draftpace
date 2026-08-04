import { notFound, redirect } from "next/navigation";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentCycleKey } from "@/product-framework/cycle";
import type { InstanceLifecycleSignal } from "@/product-framework/navigationResolver";
import ProductShell from "@/components/product-shell/ProductShell";
import RetryState from "@/components/product-shell/RetryState";

export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ productSlug: string }>;
}) {
  // Registration is idempotent and cheap. Called here directly, not assumed
  // to have already run via the outer /app layout, because this segment's
  // server module can be resolved independently of that layout's module
  // instance (e.g. a destination visited for the first time in a dev
  // session) — see docs for the client-navigation 404 this guards against.
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition) notFound();

  // The real access-control gate: every route under this product, including
  // the canonical entry route, is a child of this layout, so checking once
  // here protects all of them. This is the only place that needs to — a
  // destination page never needs to re-check entitlement itself.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // src/proxy.ts already guarantees a session for every /app/** request;
  // this is defense in depth, not the primary gate.
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(`/app/products/${productSlug}`)}`);

  const { data: entitlement, error } = await supabase
    .from("entitlements")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("is_active", true)
    .is("revoked_at", null)
    .maybeSingle();

  // A failed read must never be treated as "not entitled" — that's exactly
  // the false-ownership-loss defect this whole initiative exists to prevent.
  // Show an explicit, recoverable error instead of redirecting to activation.
  if (error) {
    return (
      <RetryState
        title="Couldn't check your access to this product"
        description="Your access hasn't changed. This was just a read failure, check your connection and try again."
        retryHref={`/app/products/${productSlug}`}
      />
    );
  }

  if (!entitlement) redirect(`/app/activate/${productSlug}`);

  // Feeds the state-aware navigation resolver (navigationResolver.ts) with
  // the smallest possible signal: whether setup is complete, and whether the
  // instance has ever been touched since creation. A read failure here must
  // degrade to the full, undifferentiated destination list — never a blank
  // or inaccessible shell — since this is a navigation nicety, not an access
  // gate; the entitlement check above already owns that responsibility.
  const { data: instanceRow, error: instanceError } = await supabase
    .from("product_instances")
    .select("setup_complete, created_at, updated_at")
    .eq("product_slug", productSlug)
    .eq("cycle_key", currentCycleKey())
    .maybeSingle();

  let instanceSignal: InstanceLifecycleSignal = null;
  if (!instanceError) {
    instanceSignal = instanceRow
      ? { setupComplete: instanceRow.setup_complete, everTouched: instanceRow.updated_at !== instanceRow.created_at }
      : { setupComplete: false, everTouched: false };
  }

  return (
    <ProductShell definition={definition} instanceSignal={instanceSignal}>
      {children}
    </ProductShell>
  );
}
