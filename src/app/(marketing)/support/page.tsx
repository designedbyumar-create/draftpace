import type { Metadata } from "next";
import Container from "@/design-system/Container";
import TextLink from "@/design-system/TextLink";

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
        <TextLink href="/forgot-password">the reset password page</TextLink>{" "}
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
        <TextLink href="/trust">the Trust page</TextLink>{" "}
        for a plain-language overview, or email us directly for anything specific to your account.
      </>
    ),
  },
];

export default function SupportPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Support</p>
      <h1 className="mt-3 text-heading-lg font-serif font-semibold tracking-tight">
        Get help with something specific.
      </h1>
      <p className="mt-4 max-w-lg text-body leading-relaxed text-[var(--muted)]">
        There's no ticketing system yet. Support requests go to a real inbox and a real person reads them.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {ENTRIES.map((entry) => (
          <div key={entry.title} className="py-6 first:pt-0">
            <h2 className="text-heading-sm font-semibold text-[var(--text)]">{entry.title}</h2>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-[var(--muted)]">{entry.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-6 text-center">
        <p className="text-body-sm font-semibold text-[var(--text)]">Still stuck?</p>
        <TextLink href="mailto:support@draftpace.com" className="mt-2 justify-center">
          support@draftpace.com
        </TextLink>
      </div>
    </Container>
  );
}
