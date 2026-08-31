"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import { Logo } from "@/design-system/Logo";
import { X } from "@/design-system/Icon";
import ThemeToggle from "@/design-system/theme/ThemeToggle";
import AccountMenu from "@/components/account/AccountMenu";
import { publicSignedInAccountMenuItems } from "@/components/account/accountMenuItems";
import { signOutAndRedirect } from "@/lib/supabase/signOut";

// App-style, product-forward navigation: the Shop is the front door, "How it
// works" is the single education entry, and everything else lives in the
// footer. The old "What do you need help with?" funnel is retired. See
// docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §3.
/**
 * "Need help" leads on purpose. It is the only entry that asks about the
 * visitor rather than explaining Draftpace, and it previously existed
 * only in the footer under a label long enough to read as a sentence,
 * which is why nobody found it.
 */
const LINKS = [
  { href: "/help-with", label: "Need help" },
  { href: "/shop", label: "Shop" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export type PublicNavUser = { email: string | null; displayName: string | null } | null;

/**
 * Session-aware: the public marketing header never shows Sign in/Get
 * started to a visitor who already has a valid Draftpace session, the
 * `user` prop is read server-side (see the marketing layout), so there's no
 * client fetch and no signed-out-then-signed-in flash.
 */
export default function PublicNav({ user }: { user: PublicNavUser }) {
  const [open, setOpen] = useState(false);
  const accountLabel = user?.displayName || user?.email || "Account";
  const accountItems = useMemo(() => publicSignedInAccountMenuItems(() => signOutAndRedirect("/")), []);

  return (
    // Opaque, not glass. This header used to be 90% opaque with a
    // backdrop blur, which is invisible while the thing scrolling under it
    // is the page background and becomes very visible the moment it is
    // not: on a guide article the tinted banner tinted the header and the
    // headline smeared through it as it passed underneath. The effect was
    // only ever on show in the one situation where it looked broken.
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/*
          32, not 40, against this header's own h-16. At 40 the lockup
          filled 62% of the bar and read as the loudest thing on every
          page; 32 puts it at half the bar height, which is where a
          wordmark sits on a site that wants its content to lead.
        */}
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo height={32} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="hidden items-center gap-3 lg:flex">
            <Button href="/app" size="sm">
              Open Draftpace
            </Button>
            <AccountMenu items={accountItems} label={accountLabel} only="desktop" />
          </div>
        ) : (
          <div className="hidden items-center gap-2 lg:flex">
            <Button href="/login" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button href="/signup" size="sm">
              Get started
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1 lg:hidden">
          {user && <AccountMenu items={accountItems} label={accountLabel} only="mobile" />}
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--text)]"
          >
            {open ? (
              <X size={20} aria-hidden />
            ) : (
              <span className="flex flex-col gap-[5px]" aria-hidden>
                <span className="block h-[1.5px] w-5 bg-current" />
                <span className="block h-[1.5px] w-5 bg-current" />
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 lg:hidden">
          <nav aria-label="Primary" className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-[14px] font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {user ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <Button href="/app" size="md" fullWidth onClick={() => setOpen(false)}>
                Open Draftpace
              </Button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
              <Button href="/login" variant="secondary" size="md" fullWidth>
                Sign in
              </Button>
              <Button href="/signup" size="md" fullWidth>
                Get started
              </Button>
            </div>
          )}
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Appearance</p>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
