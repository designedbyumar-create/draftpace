import { NextResponse } from "next/server";
import { productRegistry } from "@/product-framework/registry";
import { registerDevFixtures } from "@/product-framework/fixtures";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * A product-scoped installable-PWA manifest, generic infrastructure for
 * ANY product that declares a `pwa` field on its ProductDefinition (see
 * src/product-framework/definition.ts's productPwaSchema) — not specific
 * to Personal Finance Companion, which is simply the first product to use
 * it. Layered on top of Draftpace's site-wide public/manifest.webmanifest,
 * never replacing it: a product with no `pwa` field is still covered by
 * that root manifest exactly as before this route existed.
 *
 * See docs/products/PERSONAL-FINANCE-COMPANION-FOUNDATION.md's PWA
 * architecture section for why this same-origin, product-scoped-manifest
 * approach was chosen over a subdomain or a single shared identity, and
 * for the Chromium-strong / iOS-Safari-weak install-fidelity caveat this
 * approach carries (Safari's Add to Home Screen is meta-tag driven, not
 * manifest driven — see [productSlug]/layout.tsx's generateMetadata for
 * the apple-mobile-web-app-* half of this same contract).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ productSlug: string }> }) {
  registerDevFixtures();
  ensureProductsRegistered();

  const { productSlug } = await params;
  const definition = productRegistry.getBySlug(productSlug);

  if (!definition || !definition.pwa) {
    return NextResponse.json({ error: "No product-specific manifest for this product." }, { status: 404 });
  }

  const { pwa } = definition;
  const scope = `/app/products/${definition.slug}/`;

  const manifest = {
    name: pwa.name,
    short_name: pwa.shortName,
    description: pwa.description,
    start_url: `/app/products/${definition.slug}`,
    scope,
    display: "standalone",
    display_override: ["standalone", "minimal-ui", "browser"],
    background_color: pwa.backgroundColor,
    theme_color: pwa.themeColor,
    orientation: "portrait-primary",
    icons: pwa.icons,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      // Provisional branding must never be mistaken for a shipped decision
      // by anything inspecting this response — see productPwaSchema's
      // provisionalBranding field.
      "X-Draftpace-Pwa-Branding": pwa.provisionalBranding ? "provisional" : "final",
    },
  });
}
