import type { Metadata } from "next";
import Link from "next/link";
import PlatformShell from "@/design-system/shell/PlatformShell";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import { ArrowLeft, ArrowRight, BookOpen } from "@/design-system/Icon";
import { screenTourFor } from "@/app/(marketing)/shop/productScreens";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import type { ShopProduct } from "@/shop/definition";
import ManualContents from "@/components/platform/manual/ManualContents";
import ManualFaq from "@/components/platform/manual/ManualFaq";
import ManualOwnershipBar from "@/components/platform/manual/ManualOwnershipBar";
import ManualScreenTour from "@/components/platform/manual/ManualScreenTour";

/**
 * A product's manual — the second half of what Library is for.
 *
 * The shelf answers "what do I own". This answers "how do I actually get
 * more out of the thing I own", and it is deliberately *more* than the
 * public Shop page rather than a copy of it. The Shop page is written to
 * help somebody decide, so it leads with the promise and stops at the
 * buy button; three of its richest fields (what the product needs from
 * you, what it gives back, and how your work is saved) are validated in
 * the listing schema and rendered nowhere at all today.
 *
 * This page renders all of them, in the order an owner needs them —
 * what it is for, what its screens are, how to use it, what you should
 * get out of it, what is inside, what it needs and returns, how saving
 * works, what stays private, and the questions owners actually ask —
 * with a real index down the side, because a manual is opened at the
 * part you need rather than read once top to bottom.
 *
 * Nothing here is written fresh for this page. Every line is the
 * product's own published content, so a manual can never quietly start
 * promising something the product doesn't do.
 *
 * force-dynamic for the same reason the shelf is: shopRegistry is
 * populated at request time by module-level singletons.
 */
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ productSlug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { productSlug } = await params;
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(productSlug);
  return { title: product ? `${product.title} — how to use it` : "How to use it" };
}

export default async function ProductManualPage({ params }: Params) {
  const { productSlug } = await params;
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(productSlug);

  if (!product) {
    return (
      <PlatformShell title="How to use it">
        <BackLink />
        <div className="mt-6">
          <EmptyState
            icon={BookOpen}
            title="No manual for this one yet"
            description="This product doesn't have a published guide. You can still open it from your library."
            action={
              <Button href="/app/library" size="md">
                Back to your library
              </Button>
            }
          />
        </div>
      </PlatformShell>
    );
  }

  const area = LIFE_AREAS.find((a) => a.productSlugs.includes(product.slug)) ?? null;
  const screens = screenTourFor(product.slug);
  const sections = buildSections(product, screens !== null);
  const related = product.relatedProductSlugs
    .map((slug) => shopRegistry.getBySlug(slug))
    .filter((p): p is ShopProduct => Boolean(p));

  return (
    <PlatformShell title={product.title} subtitle="How to use it">
      <BackLink />

      <header className="mt-5 max-w-2xl">
        {area && (
          <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{area.label}</p>
        )}
        <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[32px]">
          {product.title}
        </h2>
        <p className="mt-3 text-[15.5px] leading-relaxed text-[var(--muted)]">{product.promise}</p>
      </header>

      <div className="mt-6">
        <ManualOwnershipBar productSlug={product.slug} />
      </div>

      <div className="mt-10 grid gap-10 xl:grid-cols-[180px_1fr]">
        <div className="hidden xl:block">
          <ManualContents sections={sections} />
        </div>

        <article className="min-w-0 space-y-12">
          <Section id="what-it-is" title="What it's for">
            <p className="text-[15px] leading-relaxed text-[var(--text)]">{product.problem}</p>
          </Section>

          {screens && (
            <Section id="what-it-looks-like" title="What it looks like">
              <ManualScreenTour screens={screens} />
            </Section>
          )}

          {product.howItWorks.length > 0 && (
            <Section id="how-to-use-it" title="How to use it">
              <ol className="space-y-4">
                {product.howItWorks.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[12px] font-bold text-[var(--primary)]">
                      {i + 1}
                    </span>
                    <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{step}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {product.outcomes.length > 0 && (
            <Section id="what-you-should-get" title="What you should get out of it">
              <Bullets items={product.outcomes} />
            </Section>
          )}

          {product.inclusions.length > 0 && (
            <Section id="whats-inside" title="What's inside">
              <Bullets items={product.inclusions} />
            </Section>
          )}

          {(product.expectedInputs.length > 0 || product.expectedOutputs.length > 0) && (
            <Section id="what-it-needs" title="What it needs from you, and what it gives back">
              <div className="grid gap-4 sm:grid-cols-2">
                {product.expectedInputs.length > 0 && (
                  <Panel heading="What it asks you for">
                    <Bullets items={product.expectedInputs} compact />
                  </Panel>
                )}
                {product.expectedOutputs.length > 0 && (
                  <Panel heading="What it gives back">
                    <Bullets items={product.expectedOutputs} compact />
                  </Panel>
                )}
              </div>
            </Section>
          )}

          {(product.savingBehavior || product.compatibility.length > 0) && (
            <Section id="saving-and-devices" title="Saving, and where it works">
              {product.savingBehavior && (
                <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{product.savingBehavior}</p>
              )}
              {product.compatibility.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {product.compatibility.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12.5px] text-[var(--muted)]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          {product.privacyNotes && (
            <Section id="privacy" title="What stays private">
              <p className="text-[14.5px] leading-relaxed text-[var(--text)]">{product.privacyNotes}</p>
            </Section>
          )}

          {product.faqs.length > 0 && (
            <Section id="questions" title="Questions owners ask">
              <ManualFaq faqs={product.faqs} />
            </Section>
          )}

          {related.length > 0 && (
            <Section id="what-it-works-with" title="What it works with">
              <p className="mb-4 text-[14px] leading-relaxed text-[var(--muted)]">
                Each product holds only what belongs to it. These are the ones this product deliberately hands things
                over to.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((other) => (
                  <Link
                    key={other.slug}
                    href={`/app/library/${other.slug}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--border-strong)]"
                  >
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-[var(--text)]">{other.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                        {other.promise}
                      </p>
                    </div>
                    <ArrowRight size={15} className="mt-0.5 shrink-0 text-[var(--faint)]" aria-hidden />
                  </Link>
                ))}
              </div>
            </Section>
          )}

          <div className="border-t border-[var(--border)] pt-6">
            <Link
              href={`/shop/${product.slug}`}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]"
            >
              See this product&apos;s public page
              <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </article>
      </div>
    </PlatformShell>
  );
}

/** The index, built from the same conditions the sections themselves render under, so it can never list a section that isn't there. */
function buildSections(product: ShopProduct, hasScreens: boolean): { id: string; label: string }[] {
  const sections: { id: string; label: string }[] = [{ id: "what-it-is", label: "What it's for" }];
  if (hasScreens) sections.push({ id: "what-it-looks-like", label: "What it looks like" });
  if (product.howItWorks.length > 0) sections.push({ id: "how-to-use-it", label: "How to use it" });
  if (product.outcomes.length > 0) sections.push({ id: "what-you-should-get", label: "What you get" });
  if (product.inclusions.length > 0) sections.push({ id: "whats-inside", label: "What's inside" });
  if (product.expectedInputs.length > 0 || product.expectedOutputs.length > 0)
    sections.push({ id: "what-it-needs", label: "Needs and returns" });
  if (product.savingBehavior || product.compatibility.length > 0)
    sections.push({ id: "saving-and-devices", label: "Saving" });
  if (product.privacyNotes) sections.push({ id: "privacy", label: "Privacy" });
  if (product.faqs.length > 0) sections.push({ id: "questions", label: "Questions" });
  if (product.relatedProductSlugs.length > 0) sections.push({ id: "what-it-works-with", label: "Works with" });
  return sections;
}

function BackLink() {
  return (
    <Link
      href="/app/library"
      className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--text)]"
    >
      <ArrowLeft size={14} aria-hidden />
      Your library
    </Link>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h3 className="text-[12px] font-bold uppercase tracking-[0.13em] text-[var(--faint)]">{title}</h3>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function Panel({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <p className="text-[13px] font-semibold text-[var(--text)]">{heading}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Bullets({ items, compact = false }: { items: string[]; compact?: boolean }) {
  return (
    <ul className={compact ? "space-y-2" : "space-y-2.5"}>
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
          <span className={`leading-relaxed text-[var(--text)] ${compact ? "text-[13.5px]" : "text-[14.5px]"}`}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}
