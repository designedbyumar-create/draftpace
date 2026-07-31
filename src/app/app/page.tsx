"use client";

import Link from "next/link";
import { useMemo } from "react";
import PlatformShell, { InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import { BookOpen, Bell, WarningCircle } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";

/**
 * Platform Home answers "what's the most useful thing to continue now?".
 * Phase 2 keeps every section honest: no product exists yet, so there is
 * nothing to fabricate — Continue, attention, and recent work all render
 * their real empty states rather than placeholder activity.
 */
export default function AppHomePage() {
  const user = useSession();
  const products = useMemo(() => productRegistry.list(), []);
  const firstName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "there").split(" ")[0];

  return (
    <PlatformShell subtitle="Platform Home">
      <div className="space-y-8">
        <InstallPromptCard />

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Continue</h2>
          {products.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nothing to continue yet"
              description={`Welcome, ${firstName}. Once you own or start a product, the most relevant one to continue picks up here first.`}
              action={
                <Link href="/app/library" className="text-[13px] font-semibold text-[var(--primary)]">
                  Browse your library
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3">
              {products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/app/products/${product.slug}/start`}
                  className="block rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--text)]">{product.title}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                        {familyRegistry.get(product.family)?.label ?? product.family}
                      </p>
                    </div>
                    {product.devFixture && <Badge tone="neutral">Fixture</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Attention needed
          </h2>
          <EmptyState icon={WarningCircle} title="Nothing needs your attention" />
        </section>

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
            Notifications
          </h2>
          <Surface className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <Bell size={16} className="text-[var(--muted)]" aria-hidden />
              <p className="text-[13px] text-[var(--muted)]">No notifications yet.</p>
            </div>
            <Link href="/app/notifications" className="text-[12px] font-semibold text-[var(--primary)]">
              View all
            </Link>
          </Surface>
        </section>
      </div>
    </PlatformShell>
  );
}
