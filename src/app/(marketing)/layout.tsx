import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import { registerShopFixtures } from "@/shop/fixtures";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  registerShopFixtures();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)] text-[var(--text)]">
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
