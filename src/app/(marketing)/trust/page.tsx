import type { Metadata } from "next";
import Container from "@/design-system/Container";
import TextLink from "@/design-system/TextLink";

export const metadata: Metadata = {
  title: "Trust",
  description: "How Draftpace handles your data, in plain language.",
  alternates: { canonical: "/trust" },
};

const SECTIONS = [
  {
    title: "What we store",
    body: "Your account (email, and a display name if you set one), your platform preferences (theme, reminders), and whatever data a specific product you use collects for its own purpose. Nothing more than what's needed to run the product.",
  },
  {
    title: "How it's protected",
    body: "Data is encrypted in transit. Authentication runs through Supabase, and we never see or store your password ourselves. See the full Privacy Policy for the complete technical and legal detail.",
  },
  {
    title: "What we don't do",
    body: "We don't sell your data. We don't run advertising against it. We don't share it with data brokers. There's no third category here, this is the whole list.",
  },
  {
    title: "What's saved where",
    body: "Some things save to your account and sync across devices. Some things, like a theme preference, live only in your browser's local storage and never reach our servers. Settings tells you which is which for anything that matters.",
  },
  {
    title: "What's still in progress",
    body: "In-product data export and account deletion aren't built yet. Until they are, emailing us gets the same result: a real person handles the request and confirms once it's done. We'd rather say that plainly than claim a self-serve flow that doesn't exist.",
  },
];

export default function TrustPage() {
  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Trust</p>
      <h1 className="mt-3 text-heading-lg font-serif font-semibold tracking-tight">
        A Companion holds personal things. How that is handled should be plain.
      </h1>
      <p className="mt-4 max-w-lg text-body leading-relaxed text-[var(--muted)]">
        This page is the plain-language version. The{" "}
        <TextLink href="/privacy">Privacy Policy</TextLink>{" "}
        has the complete detail, including what's not yet been through a formal legal review.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {SECTIONS.map((section) => (
          <div key={section.title} className="py-6 first:pt-0">
            <h2 className="text-heading-sm font-semibold text-[var(--text)]">{section.title}</h2>
            <p className="mt-2 max-w-lg text-body-sm leading-relaxed text-[var(--muted)]">{section.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-body-sm text-[var(--muted)]">
        Questions?{" "}
        <TextLink href="mailto:privacy@draftpace.com">privacy@draftpace.com</TextLink>
      </p>
    </Container>
  );
}
