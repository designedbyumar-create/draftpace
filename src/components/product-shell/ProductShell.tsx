"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductDefinition } from "@/product-framework/definition";
import { resolveProductNavigation, resolveDestinationLabel } from "@/product-framework/navigationResolver";
import { familyRegistry } from "@/product-framework/families";
import { productThemeStyle } from "@/product-framework/themeExtension";

/**
 * The universal product shell: header (family + title) and a nav of the
 * product's resolved destinations. Deliberately plain for Phase 1 — no
 * icons, cards, gradients, or fabricated data. Visual design is Phase 2.
 */
export default function ProductShell({
  definition,
  children,
}: {
  definition: ProductDefinition;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const family = familyRegistry.get(definition.family);
  const destinations = resolveProductNavigation(definition);
  const style = productThemeStyle(definition.theme);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]" style={style}>
      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">
          {family?.label ?? definition.family}
        </p>
        <h1 className="mt-1 text-xl font-black tracking-tight">{definition.title}</h1>
        {definition.devFixture && (
          <p className="mt-2 inline-block rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] font-bold text-[var(--muted)]">
            Internal development fixture — not a real product
          </p>
        )}
      </header>

      <nav
        aria-label="Product"
        className="flex gap-1 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6"
      >
        {destinations.map((destinationId) => {
          const href = `/app/products/${definition.slug}/${destinationId}`;
          const active = pathname === href;
          const label = resolveDestinationLabel(definition, destinationId);
          return (
            <Link
              key={destinationId}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-semibold transition ${
                active
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
