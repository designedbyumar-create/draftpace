import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your account, a purchase, or something that isn't working.",
  alternates: { canonical: "/support" },
};

const ENTRIES = [
  {
    title: "I can't sign in",
    body: "Double-check the email you used to sign up. If you signed up with Google, use the Google button rather than a password. Still stuck? Email us and mention which method you tried.",
  },
  {
    title: "I forgot my password",
    body: (
      <>
        Use{" "}
        <Link href="/forgot-password" className="font-semibold text-[var(--primary)] hover:underline">
          the reset password page
        </Link>{" "}
        to get a secure link sent to your email.
      </>
    ),
  },
  {
    title: "Something looks broken",
    body: "Tell us what page you were on, what you expected, and what happened instead. Screenshots help.",
  },
  {
    title: "I have a question about my data",
    body: (
      <>
        See{" "}
        <Link href="/trust" className="font-semibold text-[var(--primary)] hover:underline">
          the Trust page
        </Link>{" "}
        for a plain-language overview, or email us directly for anything specific to your account.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">Support</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Get help with something specific.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        There's no ticketing system yet. Support requests go to a real inbox and a real person reads them.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {ENTRIES.map((entry) => (
          <div key={entry.title} className="py-6 first:pt-0">
            <h2 className="text-[16px] font-semibold text-[var(--text)]">{entry.title}</h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{entry.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
        <p className="text-[14px] font-semibold text-[var(--text)]">Still stuck?</p>
        <a
          href="mailto:support@draftpace.com"
          className="mt-2 inline-block text-[14px] font-semibold text-[var(--primary)] hover:underline"
        >
          support@draftpace.com
        </a>
      </div>
    </Container>
  );
}
