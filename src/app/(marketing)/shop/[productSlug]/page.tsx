import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import TextLink from "@/design-system/TextLink";
import Badge from "@/design-system/Badge";
import { Check, Lock, X } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { discountPercent, formatCompareAtPrice, formatPrice, questionsForStage, type ShopProduct } from "@/shop/definition";
import SearchedProblems from "./SearchedProblems";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import RichSection from "./RichSection";
import type { ReactNode } from "react";
import ProblemCards from "./ProblemCards";
import ProductGallery from "./ProductGallery";
import ProductScreenCarousel from "./ProductScreenCarousel";
import DetailTabs, { type DetailTab } from "./DetailTabs";
import { screenTourFor } from "../productScreens";
import StickyBuyBar from "./StickyBuyBar";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import { deriveDarkTones } from "@/design-system/accentTone";
import { getAreaForProduct } from "@/content/areas";
import { jsonLd } from "@/lib/structuredData";
import { GuidesForCompanion } from "@/components/public/guides/GuideLinks";
import { getGuideBySlug } from "@/content/guides";
import { withPreservedUtm } from "@/lib/analytics/utm";
import ViewProductTracker from "@/components/analytics/ViewProductTracker";
import PwaInstallSection from "@/components/public/shop/PwaInstallSection";
import InclusionsGrid from "./InclusionsGrid";
import { GetAction, resolveCheckout } from "../GetAction";
import { coverImagePath, buildProductStructuredData, buildFaqStructuredData } from "../productStructuredData";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  ensureShopRegistered();
  return shopRegistry.listPublished().map((product) => ({ productSlug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}): Promise<Metadata> {
  ensureShopRegistered();
  const { productSlug } = await params;
  const product = shopRegistry.getBySlug(productSlug);
  if (!product) return {};
  /**
   * The product's own store cover, rather than the site-wide og-image
   * every listing shared. Sharing a link to Travel Companion showed the
   * same picture as sharing a link to Family Health Binder, which is a
   * wasted impression in the one place a link is judged before it is
   * opened. Each cover already names the product and carries its accent.
   */
  const cover = coverImagePath(product.slug);

  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/shop/${product.slug}` },
    robots: product.publicationStatus === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      url: `/shop/${product.slug}`,
      type: "website",
      images: [{ url: cover, width: 1400, height: 1050, alt: product.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo.title,
      description: product.seo.description,
      images: [cover],
    },
  };
}

/**
 * The product page. Its one job is to make one person want one product, and to
 * resolve their distrust as desire builds. Visual-first, the get action stays
 * within reach, and the objection movement sits near the decision. See
 * docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §6.
 */
export default async function ShopProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  ensureShopRegistered();
  ensureProductsRegistered();
  const { productSlug } = await params;
  const product = shopRegistry.getBySlug(productSlug);
  if (!product) notFound();

  /**
   * A free product's real page is /free, and a product with a bespoke
   * landing page (canonicalPath) lives there instead of this generic
   * detail page. Permanent, so the old URL stops competing with the page
   * that replaced it and passes its authority on rather than splitting
   * it. Deep links, old shares and anything already indexed keep
   * working, and so does every generic surface that still builds
   * `/shop/${slug}` directly (the Shop grid, a guide's cross-sell card,
   * the sitemap): they resolve through this redirect rather than needing
   * to know a particular slug now lives somewhere else.
   *
   * UTM parameters ride along: a Pinterest Pin naming this old slug
   * directly still lands with its campaign attribution intact, since
   * this redirect happens server-side before gtag.js ever runs and would
   * otherwise be a silent, total loss of attribution rather than a
   * missing-but-recoverable event.
   */
  if (product.access === "free") permanentRedirect(withPreservedUtm("/free", await searchParams));
  if (product.canonicalPath) permanentRedirect(withPreservedUtm(product.canonicalPath, await searchParams));

  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savingsPercent = discountPercent(product);
  const structuredData = buildProductStructuredData(product, `https://draftpace.com/shop/${product.slug}`);
  const faqStructuredData = buildFaqStructuredData(product);
  const decidingQuestions = questionsForStage(product, "deciding");

  /**
   * The product's own accent and installed name, read from its definition
   * rather than repeated here. A listing with no matching product (a Shop
   * fixture) falls back to the platform accent and its own title.
   */
  const definition = productRegistry.getBySlug(product.slug);
  const accentScale = definition?.theme?.accentScale;
  const accent = accentScale?.base ?? "var(--primary)";
  // The dark-theme counterpart, for the screen carousel's wash: see its
  // own comment for why an inline style needs both values, not one.
  const accentDark = accentScale ? (definition?.theme?.accentScaleDark?.base ?? deriveDarkTones(accentScale.base).base) : "var(--primary)";
  const installedName = definition?.pwa?.shortName ?? product.title;
  const installable = Boolean(definition?.pwa);
  const screenTour = screenTourFor(product.slug);
  /** The life area this product is filed under (Money, Home, Travel, ...): the closest real "category" this catalogue has. */
  const productCategory = getAreaForProduct(product.slug)?.label ?? "uncategorized";

  const resolvedSearchParams = await searchParams;

  // Resolved once per request, server-side, so every GetAction on this page
  // agrees on the exact same checkout link rather than each independently
  // re-deriving it.
  const checkout = await resolveCheckout(product, resolvedSearchParams, `/shop/${product.slug}`);

  const detailTabs = buildDetailTabs(product, { accent, installedName, installable, decidingQuestions });

  return (
    /*
      The page wears the product's own accent, so the buy button, the
      discount badge and every link agree rather than pairing a petrol
      price with a teal button. productThemeStyle is the only sanctioned
      way to do this: it emits --product-*-light and --product-*-dark as a
      pair and lets the stylesheet choose, because an inline style cannot
      answer a media query (CLAUDE.md rule 11).
    */
    <div {...{ [PRODUCT_THEME_ATTRIBUTE]: "" }} style={definition ? productThemeStyle(definition.theme) : undefined}>
      <ViewProductTracker productId={product.id} productName={product.title} productCategory={productCategory} />
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      )}
      {faqStructuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData) }} />
      )}

      <Container width="wide" className="pb-24 pt-10 sm:pt-12">
        {product.devFixture && (
          <div className="mb-6 rounded-lg bg-[var(--surface-muted)] px-4 py-2.5 text-[12px] font-semibold text-[var(--muted)]">
            Internal Shop preview. This listing does not describe a real product.
          </div>
        )}

        {/*
          The decision, and nothing else, above the fold: what it looks
          like, what it costs, and the button. Everything that used to
          compete for this space now has its own headed section below.
        */}
        <section className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* One frame, one phone, the screens changing inside it. A
              product with no drawn screens falls back to the cover
              gallery rather than an empty frame. */}
          {screenTour ? (
            <ProductScreenCarousel screens={screenTour} accent={accent} accentDark={accentDark} title={product.title} />
          ) : (
            <ProductGallery slug={product.slug} title={product.title} accent={accent} />
          )}

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              {/* Always "Paid": a free listing never reaches this render,
                  because the redirect above sends it to /free. */}
              <Badge tone="primary">Paid</Badge>
              {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
            </div>

            <h1 className="mt-4 font-serif text-[36px] font-semibold leading-[1.06] tracking-tight sm:text-[44px]">
              {product.title}
            </h1>
            <p className="mt-4 text-[16.5px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

            <div className="mt-7 flex flex-wrap items-baseline gap-3">
              <span className="font-serif text-[44px] font-semibold leading-none tracking-tight text-[var(--text)]">
                {priceLabel}
              </span>
              {compareAtLabel && (
                <span className="font-serif text-[20px] text-[var(--faint)] line-through">{compareAtLabel}</span>
              )}
              {savingsPercent !== null && savingsPercent > 0 && (
                <span
                  className="rounded-full px-3 py-1 text-[12.5px] font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {savingsPercent}% off
                </span>
              )}
            </div>
            <p className="mt-2 text-[14px] font-semibold" style={{ color: accent }}>
              One payment. Yours for life.
            </p>

            <div className="mt-6">
              <GetAction product={product} checkout={checkout} productCategory={productCategory} size="lg" fullWidth />
            </div>
            {/* Appears only once the button above has scrolled away, and
                renders the same GetAction so the two can never disagree
                about what the checkout is. */}
            <StickyBuyBar priceLabel={priceLabel} compareAtLabel={compareAtLabel}>
              <GetAction product={product} checkout={checkout} productCategory={productCategory} size="md" fullWidth />
            </StickyBuyBar>
            <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[var(--faint)]">
              <Lock size={12} aria-hidden />
              Only you can see your data. It saves to your account, on every device.
            </p>

            {/*
              Under the button, because this is what somebody is still
              deciding on once the price has stopped being the question.

              It is also what balances the two columns. The obvious way to
              align them was to shrink the phone until it matched this
              side, which is what the previous design did and why its
              screens were too small to read. The phone is the product;
              the column beside it earns its height instead.

              Every line is the listing's own expectedOutputs, the field
              that answers "what do I actually end up with". Nothing here
              is written for this block, so it cannot drift from what the
              product does.
            */}
            {product.expectedOutputs.length > 0 && (
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">
                  What you end up with
                </h2>
                <ul className="mt-3.5 flex flex-col gap-2.5">
                  {product.expectedOutputs.slice(0, 4).map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--text)]">
                      <Check size={15} className="mt-[3px] shrink-0" style={{ color: accent }} aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* The three practical facts, which are the same for every
                product and are asked about every time: when do I get it,
                where does it run, and does it ever charge me again. */}
            <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6">
              {[
                ["Delivery", "In your account the moment you pay"],
                ["Runs on", "Any browser, or installed as its own app"],
                ["Renews", "Never. One payment, kept for good"],
              ].map(([term, detail]) => (
                <div key={term}>
                  <dt className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{term}</dt>
                  <dd className="mt-1.5 text-[12.5px] leading-[1.45] text-[var(--muted)]">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </Container>

      <Container width="standard" className="pb-28">
        {/*
          Everything below the buy box, one question at a time. The page
          used to run nine sections down a single column, about 1,500
          words that restated one another. DetailTabs keeps every panel in
          the page but shows one, and the first is the one a reader
          arrives holding: what does this fix.
        */}
        <section className="mt-16 sm:mt-20" aria-label="About this product">
          <DetailTabs accent={accent} tabs={detailTabs} />
        </section>

        {product.relatedProductSlugs.length > 0 && (
          <RichSection eyebrow="Related">
            <ul className="flex flex-col gap-1.5">
              {product.relatedProductSlugs.map((slug) => {
                const related = shopRegistry.getBySlug(slug);
                if (!related) return null;
                return (
                  <li key={slug}>
                    <Link href={`/shop/${slug}`} className="font-semibold text-[var(--primary)] hover:underline">
                      {related.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </RichSection>
        )}

        {/* The guides that answer what somebody arrives searching for. Linking them
            from here gives each one the Companion page's authority, and gives the
            reader who is not ready to buy somewhere useful to go. */}
        {getAreaForProduct(product.slug) && (
          <RichSection eyebrow="Guides" title={`Free guides for ${getAreaForProduct(product.slug)?.label.toLowerCase()}`}>
            <GuidesForCompanion areaSlug={getAreaForProduct(product.slug)!.slug} />
          </RichSection>
        )}

        {/* Final CTA */}
        <section
          className="mt-16 rounded-3xl px-8 py-14 text-center"
          style={{ background: `color-mix(in srgb, ${accent} 11%, var(--surface))` }}
        >
          <h2 className="font-serif text-[32px] leading-[1.12] tracking-tight text-[var(--text)] sm:text-[36px]">
            Buy it once. Keep it for good.
          </h2>
          <p className="mx-auto mt-4 max-w-[36rem] leading-relaxed text-[var(--muted)]">
            No subscription, no renewal, no upsell later. One payment and {product.title} is yours, on every
            device you sign in on.
          </p>
          <div className="mt-8 flex justify-center">
            <GetAction product={product} checkout={checkout} productCategory={productCategory} size="lg" center />
          </div>
          {compareAtLabel && (
            <p className="mt-4 text-[13px] text-[var(--faint)]">
              {savingsPercent}% off {compareAtLabel}. Digital product, no refunds once access is granted.
            </p>
          )}
        </section>
      </Container>
    </div>
  );
}

/** The first N of a list, and the rest behind a plain disclosure, so a long list costs one line until somebody asks. */
function Fold({ items, keep, noun, children }: { items: string[]; keep: number; noun: string; children: (line: string) => ReactNode }) {
  const shown = items.slice(0, keep);
  const rest = items.slice(keep);
  return (
    <>
      {shown.map((line) => children(line))}
      {rest.length > 0 && (
        <details className="group sm:col-span-2">
          <summary className="cursor-pointer text-[14px] font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
            <span className="group-open:hidden">{`Show ${rest.length} more ${noun}`}</span>
            <span className="hidden group-open:inline">{`Show fewer ${noun}`}</span>
          </summary>
          <div className="mt-4 grid gap-x-10 gap-y-4 sm:grid-cols-2">{rest.map((line) => children(line))}</div>
        </details>
      )}
    </>
  );
}

/**
 * The detail panels, in the order a reader's questions arrive: what does
 * this fix, what do I get, how does it work, is it for me, what else would
 * I ask, and what happens to my data and my money. Each panel says only
 * what its question needs. The long-form install, privacy and refund text
 * that used to be three full sections is a few lines here, with the whole
 * privacy statement still one tap away.
 */
function buildDetailTabs(
  product: ShopProduct,
  ctx: { accent: string; installedName: string; installable: boolean; decidingQuestions: { question: string; answer: string }[] }
): DetailTab[] {
  const { accent, installedName, installable, decidingQuestions } = ctx;
  const tabs: DetailTab[] = [];

  tabs.push({
    id: "included",
    label: "What's included",
    content: (
      <>
        {installable && (
          <div className="mb-10 border-b border-[var(--border)] pb-10">
            <PwaInstallSection productName={installedName} accent={accent} />
          </div>
        )}
        <InclusionsGrid items={product.inclusions} accent={accent} />
        {product.compatibility.length > 0 && (
          <p className="mt-5 text-caption text-[var(--faint)]">
            {(installable ? product.compatibility.slice(0, 2) : product.compatibility).join(" \u00b7 ")}
          </p>
        )}
      </>
    ),
  });

  if (product.problemsSolved.length > 0 || product.searchedProblems.length > 0 || product.audienceExclusions.length > 0) {
    tabs.push({
      id: "fit",
      label: "Is it for you?",
      content: (
        <>
          {product.problemsSolved.length > 0 && (
            <div>
              <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">What this solves</p>
              <p className="mb-5 mt-3 text-[var(--muted)]">{product.problem}</p>
              <ProblemCards items={product.problemsSolved} />
            </div>
          )}
          {product.searchedProblems.length > 0 && (
            <div className={product.problemsSolved.length > 0 ? "mt-9 border-t border-[var(--border)] pt-8" : ""}>
              <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Which of these sounds like you?</p>
              <div className="mt-3">
                <SearchedProblems
                  items={product.searchedProblems.map((item) => {
                    const guide = item.guideSlug ? getGuideBySlug(item.guideSlug) : undefined;
                    return { phrase: item.phrase, answer: item.answer, guide: guide ? { slug: guide.slug, title: guide.title } : undefined };
                  })}
                />
              </div>
            </div>
          )}
          {product.audienceExclusions.length > 0 && (
            <div
              className={
                product.problemsSolved.length > 0 || product.searchedProblems.length > 0
                  ? "mt-9 border-t border-[var(--border)] pt-8"
                  : ""
              }
            >
              <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Maybe not for you if</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                <Fold items={product.audienceExclusions} keep={3} noun="reasons">
                  {(line) => (
                    <li key={line} className="flex items-start gap-2.5 text-[var(--muted)]">
                      <X size={17} className="mt-0.5 shrink-0 text-[var(--faint)]" aria-hidden />
                      {line}
                    </li>
                  )}
                </Fold>
              </ul>
            </div>
          )}
        </>
      ),
    });
  }

  if (product.howItWorks.length > 0) {
    tabs.push({
      id: "how",
      label: "How it works",
      content: (
        <ol className="flex flex-col gap-4">
          {product.howItWorks.slice(0, 4).map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: accent }}>
                {index + 1}
              </span>
              <span className="text-[14.5px] leading-relaxed text-[var(--muted)]">{step}</span>
            </li>
          ))}
          {product.howItWorks.length > 4 && (
            <li className="list-none">
              <details className="group">
                <summary className="cursor-pointer text-[14px] font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                  <span className="group-open:hidden">{`Show the other ${product.howItWorks.length - 4} steps`}</span>
                  <span className="hidden group-open:inline">Show fewer steps</span>
                </summary>
                <ol start={5} className="mt-4 flex flex-col gap-4">
                  {product.howItWorks.slice(4).map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ backgroundColor: accent }}>
                        {index + 5}
                      </span>
                      <span className="text-[14.5px] leading-relaxed text-[var(--muted)]">{step}</span>
                    </li>
                  ))}
                </ol>
              </details>
            </li>
          )}
        </ol>
      ),
    });
  }

  // Unconditional: the refund entry below guarantees this tab always has
  // content, even for a product with no deciding-stage FAQ of its own.
  tabs.push({
    id: "questions",
    label: "Questions",
    content: (
      <div className="flex flex-col divide-y divide-[var(--border)]">
        {decidingQuestions.map((faq) => (
          <details key={faq.question} className="group py-3 first:pt-0">
            <summary className="cursor-pointer text-[15px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">{faq.question}</summary>
            <p className="mt-2 leading-relaxed text-[var(--muted)]">{faq.answer}</p>
          </details>
        ))}
        {product.privacyNotes && (
          <details className="group py-3 first:pt-0">
            <summary className="cursor-pointer text-[15px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">What happens to my data?</summary>
            <p className="mt-2 leading-relaxed text-[var(--muted)]">{product.privacyNotes}</p>
          </details>
        )}
        <details className="group py-3 first:pt-0">
          <summary className="cursor-pointer text-[15px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">What&apos;s your refund policy?</summary>
          <p className="mt-2 leading-relaxed text-[var(--muted)]">
            {product.title} is a digital product delivered the moment your payment clears, so there are no refunds once access is granted. If something is not working, is not what you understood it to be, or you were charged in error, write to us and we will put it right.
          </p>
          <TextLink href="/support" arrow className="mt-3" style={{ color: accent }}>
            Contact support
          </TextLink>
        </details>
      </div>
    ),
  });

  return tabs;
}

