import Link from "next/link";
import { Logo } from "@/design-system/Logo";
import { ArrowLeft } from "@/design-system/Icon";

/**
 * Shared shell for every auth screen — same design system as the platform,
 * not a generic third-party template. Consistent logo, card treatment, and
 * legal footer across login/signup/forgot-password/reset-password.
 *
 * TWO THINGS THIS SCREEN USED TO GET WRONG
 *
 * It showed the bare monogram (LogoMark) where the public nav and the
 * platform shell both show the full lockup, so the one page a visitor
 * reaches straight from an ad or a link was the one page that did not
 * look like the rest of the brand. It is the lockup now, from the same
 * component, which is already token-driven: near-black in light, teal in
 * dark, with no colour hard-coded here.
 *
 * And there was no way back. The logo linked home, but a logo is not a
 * back button and nobody reads it as one, so somebody who opened signup
 * to look around was stuck with the browser's back arrow. There is a
 * real, labelled way out now, in the top-left where a back control
 * belongs.
 */
export default function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showLegalFooter = true,
  backHref = "/",
  backLabel = "Back to Draftpace",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showLegalFooter?: boolean;
  /** Where the escape hatch goes. Defaults to the public homepage. */
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--app-bg)] px-4 py-10">
      {/* Static on a narrow screen so it can never overlap the card, and
          pinned to the corner from sm up where there is room for it. */}
      <div className="mb-6 w-full max-w-sm sm:absolute sm:left-5 sm:top-5 sm:mb-0 sm:w-auto sm:max-w-none">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
        >
          <ArrowLeft size={15} aria-hidden />
          {backLabel}
        </Link>
      </div>

      <Link href="/" aria-label="Draftpace home" className="mb-8">
        <Logo height={34} />
      </Link>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-soft)]">
        <div className="p-6 sm:p-8">
          {eyebrow && (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
          )}
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--text)] sm:text-[26px]">{title}</h1>
          {subtitle && <p className="mt-1.5 text-[14px] text-[var(--muted)]">{subtitle}</p>}

          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="border-t border-[var(--border)] bg-[var(--surface-muted)] px-6 py-4 text-center sm:px-8">{footer}</div>}
      </div>

      {showLegalFooter && (
        <p className="mt-6 max-w-sm text-center text-[11px] leading-5 text-[var(--faint)]">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[var(--muted)]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[var(--muted)]">
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </div>
  );
}
