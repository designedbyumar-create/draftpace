import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, Check, X } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  const { productSlug } = await params;
  const product = shopRegistry.getBySlug(productSlug);
  if (!product) return {};
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/shop/${product.slug}` },
    robots: product.publicationStatus === "published" ? undefined : { index: false, follow: false },
  };
}

export default async function ShopProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const product = shopRegistry.getBySlug(productSlug);
  if (!product) notFound();

  const showStructuredData = product.structuredDataEligible && product.publicationStatus === "published";
  const structuredData = showStructuredData
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.seo.description,
        offers: {
          "@type": "Offer",
          price: product.access === "free" ? "0" : product.price?.amount.toString(),
          priceCurrency: product.access === "free" ? "USD" : product.price?.currency,
          availability:
            product.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        },
      }
    : null;

  const priceLabel =
    product.access === "free"
      ? "Free"
      : product.price
        ? new Intl.NumberFormat("en-US", { style: "currency", currency: product.price.currency }).format(
            product.price.amount
          )
        : "Price not yet set";

  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      {product.devFixture && (
        <div className="mb-6 rounded-lg bg-[var(--surface-muted)] px-4 py-2.5 text-[12px] font-semibold text-[var(--muted)]">
          Internal Shop preview. This listing does not describe a real product.
        </div>
      )}

      {/* 1. Outcome-led hero */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={product.access === "free" ? "success" : "primary"}>{product.access === "free" ? "Free" : "Paid"}</Badge>
        {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
      </div>
      <h1 className="mt-3 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
        {product.title}
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

      {/* 2 & 3. Who this is for / the situation */}
      {product.audience.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Who this is for</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {product.audience.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--text)]">
                <Check size={14} className="mt-1 shrink-0 text-[var(--success)]" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[14px] leading-relaxed text-[var(--muted)]">{product.problem}</p>
        </section>
      )}

      {/* 4. What becomes easier */}
      {product.outcomes.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What becomes easier</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {product.outcomes.map((line) => (
              <li key={line} className="text-[14px] leading-relaxed text-[var(--text)]">
                {line}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 5 & 6. How it works / walkthrough */}
      {product.howItWorks.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">How it works</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {product.howItWorks.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-[14px] leading-relaxed text-[var(--text)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[11px] font-bold text-[var(--muted)]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* 7 & 8. Inputs and outputs */}
      {(product.expectedInputs.length > 0 || product.expectedOutputs.length > 0) && (
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {product.expectedInputs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What you enter</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {product.expectedInputs.map((line) => (
                  <li key={line} className="text-[13px] leading-relaxed text-[var(--muted)]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.expectedOutputs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What you get</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {product.expectedOutputs.map((line) => (
                  <li key={line} className="text-[13px] leading-relaxed text-[var(--muted)]">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 9. Saving and returning */}
      {product.savingBehavior && (
        <section className="mt-10 rounded-lg bg-[var(--surface-muted)] p-4">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Saving and returning</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--text)]">{product.savingBehavior}</p>
        </section>
      )}

      {/* 10 & 11. Access, compatibility, inclusions */}
      <section className="mt-10">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What's included</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {product.inclusions.map((line) => (
            <li key={line} className="text-[14px] leading-relaxed text-[var(--text)]">
              {line}
            </li>
          ))}
        </ul>
        {product.compatibility.length > 0 && (
          <p className="mt-3 text-[12px] text-[var(--faint)]">{product.compatibility.join(" · ")}</p>
        )}
      </section>

      {/* 12. Price and purchase action */}
      <section className="mt-10 rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Price</p>
            <p className="mt-1 text-[22px] font-semibold text-[var(--text)]">{priceLabel}</p>
          </div>
          {product.purchaseAction && (
            <Button href={product.purchaseAction.href} size="lg" iconRight={<ArrowRight size={15} aria-hidden />}>
              {product.purchaseAction.label}
            </Button>
          )}
        </div>
      </section>

      {/* 13 & 14. Is this right for you */}
      {product.audienceExclusions.length > 0 && (
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Likely right for you if</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {product.audience.map((line) => (
                <li key={line} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--text)]">
                  <Check size={13} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Maybe not if</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {product.audienceExclusions.map((line) => (
                <li key={line} className="flex items-start gap-2 text-[13px] leading-relaxed text-[var(--muted)]">
                  <X size={13} className="mt-0.5 shrink-0 text-[var(--faint)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 15. Privacy */}
      {product.privacyNotes && (
        <section className="mt-10">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Privacy and data</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{product.privacyNotes}</p>
        </section>
      )}

      {/* 16. FAQs */}
      {product.faqs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Questions</h2>
          <div className="mt-3 flex flex-col divide-y divide-[var(--border)]">
            {product.faqs.map((faq) => (
              <details key={faq.question} className="group py-3 first:pt-0">
                <summary className="cursor-pointer text-[14px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                  {faq.question}
                </summary>
                <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* 17 & 18. Guides and related products */}
      {(product.relatedGuideSlugs.length > 0 || product.relatedProductSlugs.length > 0) && (
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          {product.relatedGuideSlugs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Related guides</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {product.relatedGuideSlugs.map((slug) => (
                  <li key={slug}>
                    <Link href={`/guides/${slug}`} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
                      Read guide
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {product.relatedProductSlugs.length > 0 && (
            <div>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Related</h2>
              <ul className="mt-3 flex flex-col gap-1.5">
                {product.relatedProductSlugs.map((slug) => {
                  const related = shopRegistry.getBySlug(slug);
                  if (!related) return null;
                  return (
                    <li key={slug}>
                      <Link href={`/shop/${slug}`} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
                        {related.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 19. Final CTA */}
      <section className="mt-14 border-t border-[var(--border)] pt-10 text-center">
        {product.purchaseAction && (
          <Button href={product.purchaseAction.href} size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
            {product.purchaseAction.label}
          </Button>
        )}
      </section>
    </Container>
  );
}
