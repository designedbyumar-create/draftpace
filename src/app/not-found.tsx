import Link from "next/link";
import type { Metadata } from "next";
import Button from "@/design-system/Button";
import { Logo } from "@/design-system/Logo";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * The site-wide 404. Outside the (marketing) route group, so it can't
 * inherit PublicNav/PublicFooter automatically, self-contained with its
 * own way back home. Still returns a real 404 status (Next.js's
 * not-found.tsx convention), never a soft-404 disguised as a 200.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg)] px-4 text-center text-[var(--text)]">
      <Link href="/" className="mb-8">
        <Logo height={36} />
      </Link>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">404</p>
      <h1 className="mt-3 font-serif text-[32px] font-semibold tracking-tight sm:text-[40px]">Page not found</h1>
      <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">
        That page doesn&apos;t exist, or it moved. Check the link, or head back to Draftpace.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" size="md">
          Go to homepage
        </Button>
        <Button href="/shop" variant="secondary" size="md">
          Browse the Store
        </Button>
      </div>
    </main>
  );
}
