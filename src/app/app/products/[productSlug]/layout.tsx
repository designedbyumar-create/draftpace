import { notFound, redirect } from "next/navigation";
import type { Metadata, Viewport } from "next";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { currentCycleKey } from "@/product-framework/cycle";
import type { InstanceLifecycleSignal } from "@/product-framework/navigationResolver";
import ProductShell from "@/components/product-shell/ProductShell";
import RetryState from "@/components/product-shell/RetryState";

/**
 * Layers a product's own installable-PWA identity (definition.pwa) on top
 * of the root layout's site-wide metadata, for the products that declare
 * one — most don't, and get the root manifest/appleWebApp unchanged. Next's
 * Metadata API merges parent and child metadata per key, so setting
 * `manifest`/`appleWebApp`/`themeColor` here overrides only those specific
 * fields for routes under this product, everything else (icons, OG tags,
 * etc.) still inherits from the root. See manifest.webmanifest/route.ts
 * for the JSON this `manifest` link points at, and
 * docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md for why the
 * iOS-Safari half of "installable as its own app" is this appleWebApp
 * override, not the JSON manifest (Safari's Add to Home Screen reads the
 * current page's meta tags, not a linked manifest).
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition?.pwa) return {};

  return {
    title: definition.pwa.name,
    manifest: `/app/products/${productSlug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: definition.pwa.shortName,
    },
  };
}

export async function generateViewport({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Viewport> {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);
  if (!definition?.pwa) return {};

  return {
    themeColor: definition.pwa.themeColor,
  };
}

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
  // Monthly-cycle products (the default, matching Monthly Money Reset) are
  // looked up by an exact match on today's cycle key, since a new calendar
  // month starts a fresh instance. Continuous products (cycleModel:
  // "continuous", e.g. Personal Finance Companion) have exactly one
  // instance ever — cycle_key on that row is fixed at creation as an
  // "instance cohort" marker, not an active period, so matching today's
  // key would silently stop finding it at the next month boundary.
  const instanceQuery = supabase
    .from("product_instances")
    .select("setup_complete, created_at, updated_at")
    .eq("product_slug", productSlug);
  const { data: instanceRow, error: instanceError } =
    definition.cycleModel === "continuous"
      ? await instanceQuery.order("created_at", { ascending: false }).limit(1).maybeSingle()
      : await instanceQuery.eq("cycle_key", currentCycleKey()).maybeSingle();

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
