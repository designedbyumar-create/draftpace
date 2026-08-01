import type { Metadata } from "next";
import Container from "@/design-system/Container";
import Alert from "@/design-system/Alert";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "What you're agreeing to when you use Draftpace.",
};

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of terms",
    content: [
      {
        sub: "By using Draftpace, you agree to these terms",
        body: "If you don't agree, don't use the product. We may update these terms occasionally; continued use after an update means you accept the new terms. We'll notify you of material changes by email.",
      },
    ],
  },
  {
    id: "what-we-provide",
    title: "What we provide",
    content: [
      {
        sub: "The Draftpace platform",
        body: "Draftpace is a platform for personalized digital products — Companions, learning products, automation tools, guided programs, and trackers. Your account holds your preferences and library across whichever products you own or start.",
      },
      {
        sub: "Products are still shipping",
        body: "Individual products are in active development. What's available to use, and what's free versus paid, will change as products launch — this page will be updated accordingly rather than promising specifics that don't exist yet.",
      },
      {
        sub: "Service availability",
        body: "We aim for high availability but don't guarantee it. Draftpace may be unavailable during maintenance or due to circumstances beyond our control. We are not liable for losses caused by downtime.",
      },
    ],
  },
  {
    id: "your-account",
    title: "Your account",
    content: [
      {
        sub: "You're responsible for your account",
        body: "Keep your login credentials secure. You're responsible for all activity under your account. If you suspect unauthorized access, contact us immediately at support@draftpace.com.",
      },
      {
        sub: "One account per person",
        body: "Accounts are personal. You may not share, sell, or transfer your account to another person.",
      },
      {
        sub: "Account termination",
        body: "In-product account deletion isn't available yet — email us to request it and we'll confirm once it's complete. We may suspend or terminate accounts that violate these terms or engage in abusive behavior.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing and purchases",
    content: [
      {
        sub: "No live paid products yet",
        body: "There is no active subscription or paid product to purchase today. When a paid product ships, its price and billing terms will be stated clearly before you pay, and payments will be processed by Stripe — we don't store your card details ourselves.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: [
      {
        sub: "What you may not do",
        body: "You may not attempt to reverse-engineer Draftpace, scrape our content, resell access, use the platform to distribute harmful or illegal content, or attempt to circumvent usage limits through automation or multiple accounts.",
      },
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    content: [
      {
        sub: "Our content",
        body: "All products, copy, design, and code in Draftpace belong to us or our licensors. You may use them through the platform but may not copy, redistribute, or resell them.",
      },
      {
        sub: "Your data",
        body: "Your product entries and personal data belong to you. We hold a limited license to store and display them in order to provide the service. We don't claim ownership of anything you create.",
      },
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: [
      {
        sub: "We're not liable for indirect losses",
        body: "Draftpace is provided as-is. We're not liable for indirect, incidental, or consequential damages — including lost progress or data loss — arising from use of the platform. Our total liability is limited to what you paid us in the past 12 months.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    content: [
      {
        sub: "Legal questions",
        body: "Email legal@draftpace.com. For general support, use support@draftpace.com.",
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-6 pt-24">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Legal</p>
        <h1 className="mt-3 font-serif text-[36px] font-semibold leading-tight tracking-tight sm:text-[44px]">
          Terms of Use
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
          Plain language. Here's what you're agreeing to when you use Draftpace.
        </p>
        <p className="mt-2 text-[12px] text-[var(--faint)]">Last updated: August 2026</p>
      </Container>

      <Container width="narrow" className="pb-6">
        <Alert tone="warning" title="Not yet reviewed by counsel">
          These terms describe the product as implemented today and have not been through a formal legal review.
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
          <a href="mailto:legal@draftpace.com" className="font-semibold text-[var(--primary)] hover:underline">
            legal@draftpace.com
          </a>
        </p>
      </Container>
    </main>
  );
}
