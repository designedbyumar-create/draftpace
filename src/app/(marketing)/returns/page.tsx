import type { Metadata } from "next";
import Container from "@/design-system/Container";
import TextLink from "@/design-system/TextLink";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: "Draftpace's return and refund policy, in plain language.",
  alternates: { canonical: "/returns" },
};

const SECTIONS = [
  {
    title: "What you're buying",
    body: "Every paid Companion is a digital product: access to it is granted to your account the moment your payment clears. Nothing is shipped, and there's no physical item to send back.",
  },
  {
    title: "Returns and refunds",
    body: "Because access is granted instantly, we don't offer returns or refunds once a purchase goes through. There's no subscription to cancel either: every paid Companion is a single, one-time payment, kept for good.",
  },
  {
    title: "If something's actually wrong",
    body: "If a product isn't working, isn't what you understood it to be when you bought it, or you were charged in error, email us. A real person reads every message, and we'll put it right.",
  },
  {
    title: "Exchanges",
    body: "There's nothing to exchange: each Companion is its own separate purchase, and owning one doesn't apply toward the price of another.",
  },
  {
    title: "Billing",
    body: "Checkout and billing for every paid Companion are handled by Lemon Squeezy, our merchant of record. Your payment details are never seen or stored by Draftpace. A billing question tied to a specific charge can also be raised directly with Lemon Squeezy, using the receipt their checkout emails you.",
  },
  {
    title: "The free product",
    body: "Monthly Money Reset costs nothing, so there's no payment to return.",
  },
];

export default function ReturnsPage() {
  return (
    <main className="bg-[var(--bg)] text-[var(--text)]">
      <Container width="narrow" className="pb-6 pt-24">
        <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Legal</p>
        <h1 className="mt-3 text-heading-lg font-serif font-semibold tracking-tight">Returns & Refunds</h1>
        <p className="mt-4 max-w-lg text-body leading-relaxed text-[var(--muted)]">
          Plain language, and the same policy stated on every product's own page before you buy.
        </p>
        <p className="mt-2 text-caption text-[var(--faint)]">Last updated: October 2026</p>
      </Container>

      <Container width="narrow" className="pb-24">
        <div className="mt-8 flex flex-col gap-12">
          {SECTIONS.map((section, index) => (
            <div key={section.title}>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-eyebrow font-bold uppercase tracking-widest text-[var(--faint)]">0{index + 1}</span>
                <h2 className="text-heading-sm font-semibold text-[var(--text)]">{section.title}</h2>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-5">
                <p className="text-body-sm leading-relaxed text-[var(--muted)]">{section.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-12 text-body-sm text-[var(--muted)]">
          Questions? <TextLink href="mailto:support@draftpace.com">support@draftpace.com</TextLink>. See also our{" "}
          <TextLink href="/terms">Terms of Use</TextLink>.
        </p>
      </Container>
    </main>
  );
}
