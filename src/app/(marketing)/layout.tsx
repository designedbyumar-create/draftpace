import PublicNavSession from "@/components/public/PublicNavSession";
import PublicFooter from "@/components/public/PublicFooter";
import { registerShopFixtures } from "@/shop/fixtures";
import { registerRealShopProducts } from "@/shop/products";
import { organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";

/**
 * No session read here. The header learns who is signed in in the browser
 * (PublicNavSession), so nothing in this layout depends on the request and
 * the pages under it can be prerendered. Reading it here once made every
 * guide render on demand.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  registerShopFixtures();
  registerRealShopProducts();

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
      <PublicNavSession />
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
