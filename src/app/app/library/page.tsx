"use client";

import Link from "next/link";
import { useMemo } from "react";
import PlatformShell, { AppCard } from "@/design-system/shell/PlatformShell";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";

/**
 * Library. Phase 1 lists whatever is actually registered (nothing in
 * production; the four fixtures locally/in beta) instead of grouping by
 * owned/free/paused/completed/archived — those structural states need real
 * entitlement data to mean anything, which doesn't exist yet.
 */
export default function LibraryPage() {
  const products = useMemo(() => productRegistry.list(), []);

  return (
    <PlatformShell title="Library" subtitle="Everything registered on this platform">
      {products.length === 0 ? (
        <AppCard className="p-5">
          <p className="text-sm font-bold text-[var(--text)]">No products yet.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Nothing is registered in this environment. In local development or a beta deploy with
            development fixtures enabled, internal architecture fixtures appear here.
          </p>
        </AppCard>
      ) : (
        <div className="grid gap-3">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/app/products/${product.slug}/start`}
              className="block rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[var(--text)]">{product.title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {familyRegistry.get(product.family)?.label ?? product.family} · {product.status}
                  </p>
                </div>
                {product.devFixture && (
                  <span className="shrink-0 rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
                    Fixture
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PlatformShell>
  );
}
