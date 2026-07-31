"use client";

import Link from "next/link";
import { useMemo } from "react";
import PlatformShell, { AppCard, InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useAuthSession } from "@/design-system/shell/AuthGate";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";

/**
 * Platform Home. Phase 1 keeps this intentionally plain: no fabricated
 * streaks, charts, or progress — just what's actually registered. Real
 * "Continue" / "Today" / "Attention needed" logic is Phase 2+ work, once a
 * real product exists to continue.
 */
export default function AppHomePage() {
  const session = useAuthSession();
  const products = useMemo(() => productRegistry.list(), []);
  const firstName = String(
    session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "there"
  ).split(" ")[0];

  return (
    <PlatformShell subtitle="Platform Home">
      <div className="space-y-4">
        <InstallPromptCard />

        <AppCard className="p-5">
          <h2 className="text-lg font-black text-[var(--text)]">Welcome, {firstName}.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {products.length > 0
              ? "Here's what's registered on this platform right now."
              : "No products are registered yet. Once a product is published, the most relevant one to continue will show up here first."}
          </p>
        </AppCard>

        {products.length > 0 && (
          <div className="grid gap-3">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/app/products/${product.slug}/start`}
                className="block rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <p className="text-sm font-black text-[var(--text)]">{product.title}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                  {familyRegistry.get(product.family)?.label ?? product.family}
                  {product.devFixture ? " · Internal development fixture" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}

        <Link href="/app/library" className="inline-flex text-sm font-bold text-[var(--primary)]">
          View library
        </Link>
      </div>
    </PlatformShell>
  );
}
