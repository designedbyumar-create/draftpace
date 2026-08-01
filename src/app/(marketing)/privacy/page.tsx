import type { Metadata } from "next";
import Container from "@/design-system/Container";
import Alert from "@/design-system/Alert";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Draftpace collects, why, and what it doesn't do with your data.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    id: "what-we-collect",
    title: "What we collect",
    content: [
      {
        sub: "Account information",
        body: "When you sign up, we collect your email address and, optionally, a display name. This identifies your account. We never require your real name.",
      },
      {
        sub: "Platform preferences",
        body: "Theme, text-size, reminder-time, and similar preferences are stored on your account so they persist across devices.",
      },
      {
        sub: "Product data",
        body: "Once you're using a specific Draftpace product, that product's own data (its setup answers, progress, and history) is stored against your account. What each product collects is specific to that product.",
      },
      {
        sub: "What we don't collect",
        body: "We don't collect your location, device fingerprints, or browsing history unrelated to using Draftpace. We don't run advertising, and we don't sell your data.",
      },
    ],
  },
  {
    id: "how-we-use-it",
    title: "How we use it",
    content: [
      {
        sub: "To run the platform",
        body: "Your account and preference data power sign-in, your library, and the platform shell. Without it, the product doesn't work.",
      },
      {
        sub: "To send you reminders",
        body: "If you enable notifications, we use them to send reminders at times you control. You can turn this off at any time in Settings.",
      },
      {
        sub: "To improve Draftpace",
        body: "We look at aggregate, anonymized usage patterns to decide what to build next. We don't analyze individual user behavior without reason.",
      },
    ],
  },
  {
    id: "who-we-share-with",
    title: "Who we share it with",
    content: [
      {
        sub: "Service providers",
        body: "We use Supabase for authentication and database storage, and a hosting provider to run the application. Stripe is integrated for payment processing where and when it's enabled for a purchase. Each processes only the data necessary for its function.",
      },
      {
        sub: "No selling, no advertising",
        body: "We do not sell, rent, or share your personal data with advertisers, data brokers, or third parties for commercial purposes.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "Your rights",
    content: [
      {
        sub: "Access and export",
        body: "Exporting your data as a downloadable file is not available yet. Until it ships, you can request a copy of your data by emailing us.",
      },
      {
        sub: "Deletion",
        body: "In-product account deletion is not available yet. Until it ships, you can request deletion of your account and data by emailing us; we'll confirm once it's complete.",
      },
      {
        sub: "Corrections",
        body: "You can update your display name and preferences in Settings. To change your account email, contact us directly.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    content: [
      {
        sub: "How we protect your data",
        body: "Data is encrypted in transit (TLS). Authentication is handled by Supabase; we don't store your password ourselves.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    content: [
      {
        sub: "Questions or concerns",
        body: "Email privacy@draftpace.com.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-6 pt-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Legal</p>
        <h1 className="mt-3 font-serif text-[36px] font-semibold leading-tight tracking-tight sm:text-[44px]">
          Privacy Policy
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
          What we collect, why, and what we don't do with it.
        </p>
        <p className="mt-2 text-[12px] text-[var(--faint)]">Last updated: August 2026</p>
      </Container>

      <Container width="narrow" className="pb-6">
        <Alert tone="warning" title="Not yet reviewed by counsel">
          This policy describes the product as implemented today. It has not been through a formal legal review, so
          treat specifics like retention periods and jurisdiction as provisional until that happens.
        </Alert>
      </Container>

      <Container width="narrow" className="pb-24">
        <div className="mt-8 flex flex-col gap-12">
          {SECTIONS.map((section, index) => (
            <div key={section.id} id={section.id}>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-[11px] font-bold tracking-widest text-[var(--faint)]">0{index + 1}</span>
                <h2 className="text-[19px] font-semibold text-[var(--text)]">{section.title}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {section.content.map((item) => (
                  <div key={item.sub} className="rounded-lg border border-[var(--border)] p-5">
                    <p className="text-[13px] font-semibold text-[var(--text)]">{item.sub}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[13px] text-[var(--muted)]">
          Questions?{" "}
          <a href="mailto:privacy@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
            privacy@draftpace.com
          </a>
        </p>
      </Container>
    </main>
  );
}
