"use client";

import Accordion from "@/design-system/Accordion";

/**
 * The manual's questions, one open at a time.
 *
 * These are the product's own published answers — the same ones on its
 * Shop page — kept here rather than dropped after purchase, because most
 * of them ("does it send reminders", "what happens if I close it
 * halfway", "is my data read by an AI model") are questions an owner asks
 * more often than a shopper does. Nothing is rewritten for this context.
 */
export default function ManualFaq({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <Accordion
      items={faqs.map((faq, i) => ({
        id: `faq-${i}`,
        title: faq.question,
        content: <p className="text-body-sm leading-relaxed text-[var(--muted)]">{faq.answer}</p>,
      }))}
    />
  );
}
