import Link from "next/link";
import Image from "next/image";

/**
 * Shared shell for every auth screen — same design system as the platform,
 * not a generic third-party template. Consistent logo, card treatment, and
 * legal footer across login/signup/forgot-password/reset-password.
 */
export default function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showLegalFooter = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showLegalFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--app-bg)] px-4 py-10">
      <Link href="/" className="mb-8">
        <Image src="/logo/dp-monogram-indigo.svg" alt="Draftpace" width={40} height={40} priority />
      </Link>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
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
