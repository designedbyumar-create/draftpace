"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/design-system/Button";
import { X } from "@/design-system/Icon";

const LINKS = [
  { href: "/#platform", label: "Platform" },
  { href: "/#families", label: "Product families" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
];

export default function PublicNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image src="/logo/draftpace-brand-logo.svg" alt="Draftpace" width={128} height={40} priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/signup" size="sm">
            Get started
          </Button>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text)] md:hidden"
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
        <div id="mobile-nav" className="border-t border-[var(--border)] bg-[var(--bg)] px-4 py-4 md:hidden">
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
              Log in
            </Button>
            <Button href="/signup" size="md" fullWidth>
              Get started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
