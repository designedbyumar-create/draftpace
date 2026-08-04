import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import { registerShopFixtures } from "@/shop/fixtures";
import { registerRealShopProducts } from "@/shop/products";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      <PublicNav user={user ? { email: user.email ?? null, displayName: user.user_metadata?.display_name ?? null } : null} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
