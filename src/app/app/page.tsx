"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlatformShell, { InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import EmptyState from "@/design-system/EmptyState";
import Surface from "@/design-system/Surface";
import Badge from "@/design-system/Badge";
import { ArrowRight, BookOpen, Bell, WarningCircle } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import { listMyProductInstances, type ProductInstanceSummary } from "@/product-framework/instances";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";

/**
 * Platform Home answers "what's the most useful thing to continue now?".
 * Reads real ownership (product_instances), not the raw product registry —
 * a product being registered doesn't mean this user owns it. Only the most
 * recently active instance per product is shown, since that's what's
 * actually useful to continue.
 */
export default function AppHomePage() {
  const user = useSession();
  const [instances, setInstances] = useState<ProductInstanceSummary[] | null>(null);
  const firstName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "there").split(" ")[0];

  useEffect(() => {
    registerMonthlyMoneyReset();
    let cancelled = false;
    listMyProductInstances().then((rows) => {
      if (!cancelled) setInstances(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const latestPerProduct = new Map<string, ProductInstanceSummary>();
  for (const instance of instances ?? []) {
    if (!latestPerProduct.has(instance.productSlug)) latestPerProduct.set(instance.productSlug, instance);
  }
  const cards = [...latestPerProduct.values()];

  return (
    <PlatformShell subtitle="Platform Home">
      <div className="space-y-8">
        <InstallPromptCard />

        <section>
          <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">Continue</h2>
          {instances === null ? (
            <p className="text-[13px] text-[var(--muted)]">Loading…</p>
          ) : cards.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nothing to continue yet"
              description={`Welcome, ${firstName}. Once you add something free or owned, the most relevant one to continue picks up here first.`}
              action={
                <Link href="/shop" className="text-[13px] font-semibold text-[var(--primary)]">
                  Find something in the Shop
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3">
              {cards.map((instance) => (
                <ContinueCard key={instance.id} instance={instance} />
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

function ContinueCard({ instance }: { instance: ProductInstanceSummary }) {
  const definition = productRegistry.getBySlug(instance.productSlug);
  if (!definition) return null;
  const family = familyRegistry.get(definition.family);

  const isCompleted = instance.lifecycleState === "completed";
  const needsSetup = !instance.setupComplete && !isCompleted;

  const headline = isCompleted
    ? `Review ${definition.title}`
    : needsSetup
      ? `Finish setting up ${definition.title}`
      : `Continue ${definition.title}`;

  const destination = isCompleted
    ? `/app/products/${definition.slug}/history`
    : needsSetup
      ? `/app/products/${definition.slug}/setup`
      : `/app/products/${definition.slug}/workspace`;

  return (
    <Link
      href={destination}
      className="block rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[var(--text)]">{headline}</p>
          <p className="mt-0.5 text-[12px] text-[var(--muted)]">
            {family?.label ?? definition.family}
            {instance.nextActionLabel ? ` · ${instance.nextActionLabel}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {isCompleted && <Badge tone="success">Completed</Badge>}
          <ArrowRight size={14} className="text-[var(--faint)]" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
