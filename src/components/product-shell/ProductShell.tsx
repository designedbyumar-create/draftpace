"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ProductDefinition } from "@/product-framework/definition";
import { resolveLifecycleNavigation, type InstanceLifecycleSignal } from "@/product-framework/navigationResolver";
import { familyRegistry } from "@/product-framework/families";
import { productThemeStyle } from "@/product-framework/themeExtension";
import { ArrowLeft, Menu } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import MobileSheet from "@/design-system/MobileSheet";
import AccountMenu from "@/components/account/AccountMenu";
import { appAccountMenuItems } from "@/components/account/accountMenuItems";
import { signOutAndRedirect } from "@/lib/supabase/signOut";
import { useSession } from "@/design-system/shell/SessionProvider";
import { useStandaloneMode } from "@/lib/pwa/hooks";
import ProductRailShell from "./ProductRailShell";

/**
 * The universal product shell. Works for any family: renders whichever
 * destinations the product declares (or its family default), tiered into
 * primary navigation and a compact secondary menu based on the instance's
 * lifecycle state (never started / setting up / set up), see
 * navigationResolver.ts. No product-specific visual identity yet beyond the
 * scoped theme extension, that's real design work for when a real product
 * exists.
 *
 * Desktop keeps the original three-block layout (utility bar, header,
 * primary/secondary nav) unchanged apart from the added account menu.
 * Below the lg breakpoint, the utility bar and header collapse into one
 * compact app-bar (back, title, account) matching the platform shell's
 * mobile pattern, and the secondary "More" menu becomes a bottom sheet
 * instead of a small anchored popover.
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
  // A product that asked for the rail gets a different chrome entirely,
  // rather than this one with pieces conditionally hidden. Hooks below
  // must not run for it, so the branch is the first thing here.
  if (definition.navigationStyle === "rail") {
    return (
      <ProductRailShell definition={definition} instanceSignal={instanceSignal}>
        {children}
      </ProductRailShell>
    );
  }
  return <ProductTabShell definition={definition} instanceSignal={instanceSignal}>{children}</ProductTabShell>;
}

function ProductTabShell({
  definition,
  instanceSignal = null,
  children,
}: {
  definition: ProductDefinition;
  instanceSignal?: InstanceLifecycleSignal;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const standalone = useStandaloneMode();
  const user = useSession();
  const family = familyRegistry.get(definition.family);
  const { primary, secondary } = resolveLifecycleNavigation(definition, instanceSignal);
  const style = productThemeStyle(definition.theme);
  const widthClass = CONTENT_WIDTH_CLASS[definition.theme.contentWidth ?? "narrow"];
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);

  // Primary nav scrolls horizontally on narrow screens (see the
  // overflow-x-auto container below) — without this, a product with
  // enough primary destinations to overflow can land on a tab that's
  // scrolled out of view and looks clipped rather than just off-screen.
  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [pathname]);

  const accountLabel = user.user_metadata?.display_name || user.email || "Account";
  const accountItems = appAccountMenuItems(() => signOutAndRedirect("/"));

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]" style={style}>
      {/* Mobile compact app-bar: back, title, account, one row instead of
          three stacked blocks. min-h (not h) + safe-area padding-top so the
          row grows to clear a notch instead of squeezing existing content
          under it. */}
      <div
        className={`flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:hidden ${
          standalone ? "min-h-11" : "min-h-14"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link
          href="/app"
          aria-label="Back to Draftpace"
          className="flex h-11 shrink-0 items-center gap-1 rounded-lg px-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft size={16} aria-hidden />
          Draftpace
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-center text-[14px] font-semibold text-[var(--text)]">
          {definition.title}
        </h1>
        <div className="flex h-11 shrink-0 items-center justify-end">
          <AccountMenu items={accountItems} label={accountLabel} only="mobile" />
        </div>
      </div>

      {/* Desktop utility bar: unchanged, with the account menu added. */}
      <div className="hidden border-b border-[var(--border)] bg-[var(--surface)] lg:block">
        <div className={`mx-auto flex h-12 items-center justify-between px-4 sm:px-6 ${widthClass}`}>
          <Link
            href="/app"
            aria-label="Back to Draftpace"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={14} aria-hidden />
            Draftpace
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle compact />
            <AccountMenu items={accountItems} label={accountLabel} only="desktop" />
          </div>
        </div>
      </div>

      <header className="hidden border-b border-[var(--border)] bg-[var(--surface)] px-4 py-5 sm:px-6 lg:block">
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
          <div className="flex flex-1 gap-1 overflow-x-auto">
            {primary.map(({ id, label }) => {
              const href = `/app/products/${definition.slug}/${id}`;
              const active = pathname === href;
              return (
                <Link
                  key={id}
                  href={href}
                  ref={active ? activeTabRef : undefined}
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
            <>
              {/* Desktop: anchored dropdown, as before. */}
              <details className="group relative hidden shrink-0 py-2 lg:block">
                <summary
                  className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] [&::-webkit-details-marker]:hidden"
                  aria-label="More product options"
                >
                  <Menu size={15} aria-hidden />
                  <span>More</span>
                </summary>
                <div className="absolute right-0 z-10 mt-1 min-w-[176px] rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[shadow:var(--shadow-soft)]">
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

              {/* Mobile: a real touch-friendly sheet instead of a tiny popover. */}
              <button
                ref={moreTriggerRef}
                type="button"
                onClick={() => setMoreSheetOpen(true)}
                aria-label="More product options"
                className="flex h-11 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:hidden"
              >
                <Menu size={16} aria-hidden />
                More
              </button>
              <MobileSheet
                open={moreSheetOpen}
                onClose={() => setMoreSheetOpen(false)}
                title="More"
                triggerRef={moreTriggerRef}
              >
                <div className="flex flex-col gap-0.5">
                  {secondary.map(({ id, label }) => {
                    const href = `/app/products/${definition.slug}/${id}`;
                    const active = pathname === href;
                    return (
                      <Link
                        key={id}
                        href={href}
                        onClick={() => setMoreSheetOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-11 items-center rounded-md px-3 py-2.5 text-[14px] font-semibold transition ${
                          active
                            ? "bg-[var(--surface-muted)] text-[var(--primary)]"
                            : "text-[var(--text)] hover:bg-[var(--surface-muted)]"
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                  <div className="mt-1 flex items-center justify-between rounded-md px-3 py-2.5">
                    <span className="text-[13px] font-semibold text-[var(--muted)]">Theme</span>
                    <ThemeToggle compact />
                  </div>
                </div>
              </MobileSheet>
            </>
          )}
        </div>
      </nav>

      <main className={`mx-auto w-full px-4 py-8 sm:px-6 ${widthClass}`}>
        {/* Keyed on pathname so React remounts this on every route change,
            re-triggering the mount animation below - no AnimatePresence
            exit here deliberately: Next already unmounts the old page's
            DOM on navigation, so there's nothing to visually exit, and an
            exit-then-enter sequence would just add a real delay on top of
            the page's own data-loading time. Same mount-triggered pattern
            as RichSection/LivingAnatomy elsewhere in this codebase, not
            whileInView, for the same reliability reason documented there. */}
        <motion.div
          key={pathname}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
