"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProductDefinition } from "@/product-framework/definition";
import { resolveLifecycleNavigation, type InstanceLifecycleSignal } from "@/product-framework/navigationResolver";
import { familyRegistry } from "@/product-framework/families";
import { productThemeStyle } from "@/product-framework/themeExtension";
import { ArrowLeft, Menu } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

/**
 * The universal product shell. Works for any family: renders whichever
 * destinations the product declares (or its family default), tiered into
 * primary navigation and a compact secondary menu based on the instance's
 * lifecycle state (never started / setting up / set up) — see
 * navigationResolver.ts. No product-specific visual identity yet beyond the
 * scoped theme extension — that's real design work for when a real product
 * exists.
 */
const CONTENT_WIDTH_CLASS: Record<"narrow" | "standard" | "wide", string> = {
  narrow: "max-w-3xl",
  standard: "max-w-5xl",
  wide: "max-w-7xl",
};

export default function ProductShell({
  definition,
  instanceSignal = null,
  children,
}: {
  definition: ProductDefinition;
  instanceSignal?: InstanceLifecycleSignal;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const family = familyRegistry.get(definition.family);
  const { primary, secondary } = resolveLifecycleNavigation(definition, instanceSignal);
  const style = productThemeStyle(definition.theme);
  const widthClass = CONTENT_WIDTH_CLASS[definition.theme.contentWidth ?? "narrow"];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]" style={style}>
      <div className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className={`mx-auto flex h-12 items-center justify-between px-4 sm:px-6 ${widthClass}`}>
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
        <div className={`mx-auto ${widthClass}`}>
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

      <nav aria-label="Product" className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className={`mx-auto flex items-center justify-between gap-1 px-4 sm:px-6 ${widthClass}`}>
          <div className="flex gap-1 overflow-x-auto">
            {primary.map(({ id, label }) => {
              const href = `/app/products/${definition.slug}/${id}`;
              const active = pathname === href;
              return (
                <Link
                  key={id}
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

          {secondary.length > 0 && (
            <details className="group relative shrink-0 py-2">
              <summary
                className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] [&::-webkit-details-marker]:hidden"
                aria-label="More product options"
              >
                <Menu size={15} aria-hidden />
                <span className="hidden sm:inline">More</span>
              </summary>
              <div className="absolute right-0 z-10 mt-1 min-w-[176px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
                {secondary.map(({ id, label }) => {
                  const href = `/app/products/${definition.slug}/${id}`;
                  const active = pathname === href;
                  return (
                    <Link
                      key={id}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md px-3 py-2 text-[13px] font-medium transition ${
                        active
                          ? "bg-[var(--surface-muted)] text-[var(--primary)]"
                          : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      </nav>

      <main className={`mx-auto w-full px-4 py-8 sm:px-6 ${widthClass}`}>{children}</main>
    </div>
  );
}
