"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/design-system/Button";
import { Logo } from "@/design-system/Logo";
import { X } from "@/design-system/Icon";
import ThemeToggle from "@/design-system/theme/ThemeToggle";

// App-style, product-forward navigation: the Store is the front door, "How it
// works" is the single education entry, and everything else lives in the
// footer. The old "What do you need help with?" funnel is retired. See
// docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §3.
const LINKS = [
  { href: "/shop", label: "Store" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Logo height={40} />
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

        <div className="hidden items-center gap-2 lg:flex">
          <Button href="/login" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button href="/signup" size="sm">
            Get started
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text)] lg:hidden"
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
          <div className="mt-3 flex flex-col gap-2 border-t border-[var(--border)] pt-3">
            <Button href="/login" variant="secondary" size="md" fullWidth>
              Sign in
            </Button>
            <Button href="/signup" size="md" fullWidth>
              Get started
            </Button>
          </div>
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Appearance</p>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
