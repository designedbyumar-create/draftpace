import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";

export const metadata: Metadata = {
  title: "Trust",
  description: "How Draftpace handles your data, in plain language.",
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
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Trust</p>
      <h1 className="mt-3 font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Your plans can be personal. The way they're handled should be clear.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        This page is the plain-language version. The{" "}
        <Link href="/privacy" className="font-semibold text-[var(--primary)] hover:underline">
          Privacy Policy
        </Link>{" "}
        has the complete detail, including what's not yet been through a formal legal review.
      </p>

      <div className="mt-12 flex flex-col divide-y divide-[var(--border)]">
        {SECTIONS.map((section) => (
          <div key={section.title} className="py-6 first:pt-0">
            <h2 className="text-[16px] font-semibold text-[var(--text)]">{section.title}</h2>
            <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{section.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-[13px] text-[var(--muted)]">
        Questions?{" "}
        <a href="mailto:privacy@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
          privacy@draftpace.com
        </a>
      </p>
    </Container>
  );
}
