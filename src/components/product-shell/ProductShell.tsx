"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductDefinition } from "@/product-framework/definition";
import { resolveProductNavigation, resolveDestinationLabel } from "@/product-framework/navigationResolver";
import { familyRegistry } from "@/product-framework/families";
import { productThemeStyle } from "@/product-framework/themeExtension";
import { ArrowLeft } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

/**
 * The universal product shell. Works for any family: renders whichever
 * destinations the product declares (or its family default), with the
 * Workspace tab labeled per family ("Learn", "Automate", "Continue", ...).
 * No product-specific visual identity yet beyond the scoped theme
 * extension — that's real design work for when a real product exists.
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
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/app/library"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={14} aria-hidden />
            Library
          </Link>
          <ThemeToggle compact />
        </div>
      </div>

      <header className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              {family?.label ?? definition.family}
            </p>
            {definition.devFixture && <Badge tone="neutral">Internal fixture</Badge>}
            <Badge tone={definition.status === "active" ? "success" : "neutral"}>
              {definition.status.replace("_", " ")}
            </Badge>
          </div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">{definition.title}</h1>
        </div>
      </header>

      <nav
        aria-label="Product"
        className="border-b border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-4 sm:px-6">
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
        </div>
      </nav>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
