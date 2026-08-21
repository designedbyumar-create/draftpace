"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ProductDefinition } from "@/product-framework/definition";
import { resolveLifecycleNavigation, type InstanceLifecycleSignal } from "@/product-framework/navigationResolver";
import { productThemeStyle } from "@/product-framework/themeExtension";
import { ArrowLeft, BookOpen, Clock, Compass, Layers3, Menu, type DraftpaceIcon } from "@/design-system/Icon";
import MobileSheet from "@/design-system/MobileSheet";
import AccountMenu from "@/components/account/AccountMenu";
import { appAccountMenuItems } from "@/components/account/accountMenuItems";
import { signOutAndRedirect } from "@/lib/supabase/signOut";
import { useSession } from "@/design-system/shell/SessionProvider";
import { useStandaloneMode } from "@/lib/pwa/hooks";

/**
 * A second product chrome: a quiet left rail on desktop, a fixed bottom
 * bar on mobile.
 *
 * WHY THIS EXISTS RATHER THAN A CHANGE TO ProductShell
 *
 * The tab chrome is right for a product you move through in a session.
 * It is wrong for a product whose four destinations are four different
 * questions ("what should I do", "what do we know", "what can I hand
 * over", "what changed"): tabs read as steps in a sequence, and these
 * are not a sequence. But Personal Finance Companion and Home Base are
 * built around the tab chrome and neither asked to change, so this is a
 * separate component a product opts into with navigationStyle: "rail".
 * ProductShell's own path stays byte for byte what it was.
 *
 * WHAT IS DELIBERATELY ABSENT
 *
 * No counts, no badges, no progress, no notification dots. A number
 * beside a destination is a scoreboard however quietly it is set, and
 * anything genuinely worth a person's attention belongs on the first
 * destination rather than as a decoration on the way to it.
 */
const CONTENT_WIDTH_CLASS: Record<"narrow" | "standard" | "wide", string> = {
  narrow: "max-w-3xl",
  standard: "max-w-5xl",
  wide: "max-w-7xl",
};

/**
 * Icons by destination id, and only where one genuinely helps
 * recognition at the bottom of a phone. A destination with no entry
 * here renders as its label alone, which is a better outcome than a
 * decorative glyph nobody can decode.
 */
const RAIL_ICON: Record<string, DraftpaceIcon> = {
  workspace: Compass,
  affairs: Layers3,
  printables: BookOpen,
  history: Clock,
};

export default function ProductRailShell({
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
  const { primary, secondary } = resolveLifecycleNavigation(definition, instanceSignal);
  const style = productThemeStyle(definition.theme);
  const widthClass = CONTENT_WIDTH_CLASS[definition.theme.contentWidth ?? "narrow"];
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const accountLabel = user.user_metadata?.display_name || user.email || "Account";
  const accountItems = appAccountMenuItems(() => signOutAndRedirect("/"));

  const href = (id: string) => `/app/products/${definition.slug}/${id}`;
  const isActive = (id: string) => pathname === href(id);

  const moreLinks = (onNavigate?: () => void) =>
    secondary.map(({ id, label }) => (
      <Link
        key={id}
        href={href(id)}
        onClick={onNavigate}
        className={`block rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
          isActive(id)
            ? "bg-[var(--surface-muted)] font-semibold text-[var(--primary)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
        }`}
      >
        {label}
      </Link>
    ));

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]" style={style}>
      <div className="lg:flex">
        {/* ------------------------------------------------ desktop rail */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-5 lg:flex">
          <Link
            href="/app/library"
            className="mb-6 flex items-center gap-1.5 text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
          >
            <ArrowLeft size={14} aria-hidden />
            Library
          </Link>

          <p
            className="text-[15px] leading-snug text-[var(--text)]"
            style={{ fontFamily: "var(--product-narrative-font, inherit)" }}
          >
            {definition.title}
          </p>
          <div className="mt-4 h-px bg-[var(--border)]" />

          <nav aria-label="Product" className="mt-4 flex flex-col gap-0.5">
            {primary.map(({ id, label }) => {
              const active = isActive(id);
              return (
                <Link
                  key={id}
                  href={href(id)}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "bg-[var(--surface-muted)] text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto flex flex-col gap-1 pt-6">
            {secondary.length > 0 && (
              <>
                <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">More</p>
                {moreLinks()}
              </>
            )}
            <div className="mt-2 border-t border-[var(--border)] pt-3">
              <AccountMenu items={accountItems} label={accountLabel} only="desktop" />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* ------------------------------------------- mobile app bar */}
          <div
            className={`flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-3 lg:hidden ${
              standalone ? "min-h-11" : "min-h-14"
            }`}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <Link
              href="/app/library"
              aria-label="Back to Library"
              className="flex h-11 shrink-0 items-center gap-1 rounded-lg px-1.5 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
            >
              <ArrowLeft size={16} aria-hidden />
              Library
            </Link>
            <h1 className="min-w-0 flex-1 truncate text-center text-[14px] font-semibold text-[var(--text)]">
              {definition.title}
            </h1>
            <div className="flex h-11 shrink-0 items-center justify-end gap-1">
              {secondary.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMoreSheetOpen(true)}
                  aria-label="More product options"
                  className="flex h-11 w-9 items-center justify-center rounded-md text-[var(--muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                >
                  <Menu size={18} aria-hidden />
                </button>
              )}
              <AccountMenu items={accountItems} label={accountLabel} only="mobile" />
            </div>
          </div>

          {/* pb-24 on mobile clears the fixed bottom bar, so the last
              control on a page is never sitting underneath it. */}
          <main className={`mx-auto w-full px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10 ${widthClass}`}>
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
      </div>

      {/* --------------------------------------------- mobile bottom bar */}
      <nav
        aria-label="Product"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--surface)] lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex">
          {primary.map(({ id, label }) => {
            const Icon = RAIL_ICON[id];
            const active = isActive(id);
            return (
              <li key={id} className="min-w-0 flex-1">
                <Link
                  href={href(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-14 flex-col items-center justify-center gap-0.5 px-1 transition-colors ${
                    active ? "text-[var(--primary)]" : "text-[var(--muted)]"
                  }`}
                >
                  {Icon && <Icon size={18} active={active} aria-hidden />}
                  {/* The label always stays. Four glyphs alone would be a
                      guessing game, and this product is used twice a year
                      by people who will not have memorised them. */}
                  <span className="truncate text-[10.5px] font-semibold tracking-[0.01em]">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {secondary.length > 0 && (
        <MobileSheet open={moreSheetOpen} onClose={() => setMoreSheetOpen(false)} title="More">
          <div className="flex flex-col gap-1 pb-2">{moreLinks(() => setMoreSheetOpen(false))}</div>
        </MobileSheet>
      )}
    </div>
  );
}
