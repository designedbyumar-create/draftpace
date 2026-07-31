"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Badge from "@/design-system/Badge";
import { BookOpen } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import type { ProductDefinition } from "@/product-framework/definition";

type LibraryFilter = "all" | "available" | "free" | "owned" | "paused" | "completed" | "archived";

const FILTERS: { id: LibraryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "free", label: "Free" },
  { id: "owned", label: "Owned" },
  { id: "paused", label: "Paused" },
  { id: "completed", label: "Completed" },
  { id: "archived", label: "Archived" },
];

// Filters backed by real registry data today. The rest are structural —
// they render honestly once entitlements exist, not fabricated now.
const LIVE_FILTERS: Partial<Record<LibraryFilter, (product: ProductDefinition) => boolean>> = {
  all: () => true,
  available: (product) => product.status === "active" || product.status === "coming_soon",
  free: (product) => product.access.model === "free",
  archived: (product) => product.status === "archived",
};

export default function LibraryPage() {
  const products = useMemo(() => productRegistry.list(), []);
  const [filter, setFilter] = useState<LibraryFilter>("all");

  const predicate = LIVE_FILTERS[filter];
  const visible = predicate ? products.filter(predicate) : [];

  return (
    <PlatformShell title="Library" subtitle="Everything registered on this platform">
      <div
        role="tablist"
        aria-label="Library filter"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-[var(--border)]"
      >
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-semibold transition ${
              filter === item.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!predicate ? (
        <EmptyState
          icon={BookOpen}
          title={`No ${FILTERS.find((item) => item.id === filter)?.label.toLowerCase()} products`}
          description="This structural state is ready — it depends on the entitlement system, which isn't built yet, so it's honestly empty rather than fabricated."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No products yet"
          description="Nothing is registered in this environment. In local development, internal architecture fixtures appear here."
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((product) => (
            <Link
              key={product.slug}
              href={`/app/products/${product.slug}/start`}
              className="block rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-[var(--text)]">{product.title}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                    {familyRegistry.get(product.family)?.label ?? product.family} · {product.access.model}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {product.devFixture && <Badge tone="neutral">Fixture</Badge>}
                  <Badge tone={product.status === "active" ? "success" : "neutral"}>
                    {product.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PlatformShell>
  );
}
