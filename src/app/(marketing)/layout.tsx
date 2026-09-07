import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import { registerShopFixtures } from "@/shop/fixtures";
import { registerRealShopProducts } from "@/shop/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";

/**
 * Session is read server-side, once, here, not inside PublicNav, so the
 * signed-in vs signed-out header is correct on first paint with no client
 * fetch and no flash from one state to the other. This is the same
 * createSupabaseServerClient() every other server-rendered auth check in
 * this codebase uses (see src/app/app/layout.tsx), not a second auth path.
 * The trade-off: these routes can no longer be fully static, the same
 * trade every /app/** route already makes for the same reason.
 */
export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  registerShopFixtures();
  registerRealShopProducts();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData()) }}
      />
      <PublicNav user={user ? { email: user.email ?? null, displayName: user.user_metadata?.display_name ?? null } : null} />
      {/* overflow-x-clip, not hidden: a decorative element that bleeds
          past its own container scrolls the whole page sideways on a
          narrow screen, which is one of the worst things a marketing
          page can do on a phone. Ask DP's atmospheric glow sits at
          -inset-6 and did exactly that at 390px. `clip` trims the bleed
          without making this a scroll container, so the sticky header
          above it keeps working; `hidden` would break it. */}
      <main className="flex-1 overflow-x-clip">{children}</main>
      <PublicFooter />
    </div>
  );
}
