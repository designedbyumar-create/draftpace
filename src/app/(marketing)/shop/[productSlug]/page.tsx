import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, Check, Lock, X } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { allQuestions, discountPercent, formatCompareAtPrice, formatPrice, questionsForStage, type ShopProduct } from "@/shop/definition";
import SearchedProblems from "./SearchedProblems";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import RichSection from "./RichSection";
import type { ReactNode } from "react";
import ProblemCards from "./ProblemCards";
import AddToLibraryButton from "../AddToLibraryButton";
import ProductGallery from "./ProductGallery";
import ProductScreenCarousel from "./ProductScreenCarousel";
import DetailTabs, { type DetailTab } from "./DetailTabs";
import { screenTourFor } from "../productScreens";
import StickyBuyBar from "./StickyBuyBar";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLemonSqueezyCheckoutUrl, hasLemonSqueezyCheckout } from "@/shop/lemonSqueezyCheckout";
import CheckoutButton from "@/components/shop/CheckoutButton";
import { getAreaForProduct } from "@/content/areas";
import { withPreservedUtm } from "@/lib/analytics/utm";
import ViewProductTracker from "@/components/analytics/ViewProductTracker";
import TrackedLink from "@/components/analytics/TrackedLink";

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
  const cover = STORE_COVERS.has(product.slug) ? `/store/${product.slug}-1-cover.webp` : "/og-image.png";

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
 * Slugs with a generated store cover in public/store. Listed rather than
 * probed: a missing file would otherwise be advertised to every crawler
 * and link unfurler as this product's image.
 */
const STORE_COVERS = new Set([
  "personal-finance-companion",
  "home-management-companion",
  "alongside",
  "homeschooling-companion",
  "personal-life-affairs-companion",
  "travel-companion",
  "vehicle-maintenance-companion",
  "family-health-binder",
  "monthly-money-reset",
]);

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
   * A free product's real page is /free, not a detail page inside a
   * priced catalogue. Permanent, so the old URL stops competing with the
   * page that replaced it and passes its authority on rather than
   * splitting it. Deep links, old shares and anything already indexed
   * keep working.
   *
   * UTM parameters ride along: a Pinterest Pin naming this old slug
   * directly still lands with its campaign attribution intact, since
   * this redirect happens server-side before gtag.js ever runs and would
   * otherwise be a silent, total loss of attribution rather than a
   * missing-but-recoverable event.
   */
  if (product.access === "free") permanentRedirect(withPreservedUtm("/free", await searchParams));

  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savingsPercent = discountPercent(product);
  const structuredData = buildStructuredData(product);
  const faqStructuredData = buildFaqStructuredData(product);
  const decidingQuestions = questionsForStage(product, "deciding");

  /**
   * The product's own accent and installed name, read from its definition
   * rather than repeated here. A listing with no matching product (a Shop
   * fixture) falls back to the platform accent and its own title.
   */
  const definition = productRegistry.getBySlug(product.slug);
  const accent = definition?.theme?.accentScale?.base ?? "var(--primary)";
  const installedName = definition?.pwa?.shortName ?? product.title;
  const installable = Boolean(definition?.pwa);
  const screenTour = screenTourFor(product.slug);
  /** The life area this product is filed under (Money, Home, Travel, ...): the closest real "category" this catalogue has. */
  const productCategory = getAreaForProduct(product.slug)?.label ?? "uncategorized";

  const resolvedSearchParams = await searchParams;

  // Resolved once per request, server-side, so every GetAction on this page
  // agrees on the exact same checkout link rather than each independently
  // re-deriving it.
  const checkout = await resolveCheckout(product, resolvedSearchParams);

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      {faqStructuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
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
            <ProductScreenCarousel screens={screenTour} accent={accent} title={product.title} />
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
                ["Delivery", "In your library the moment you pay"],
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

  if (product.problemsSolved.length > 0) {
    tabs.push({
      id: "solves",
      label: "The problem",
      content: (
        <>
          <p className="mb-5 text-[var(--muted)]">{product.problem}</p>
          <ProblemCards items={product.problemsSolved} />
        </>
      ),
    });
  }

  tabs.push({
    id: "included",
    label: "What's included",
    content: (
      <>
        <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
          <Fold items={product.inclusions} keep={6} noun="things">
            {(line) => (
              <div key={line} className="flex items-start gap-2.5 border-b border-[var(--border)] pb-4">
                <Check size={16} className="mt-1 shrink-0" style={{ color: accent }} aria-hidden />
                <span className="text-[14.5px] leading-relaxed">{line}</span>
              </div>
            )}
          </Fold>
        </div>
        {product.compatibility.length > 0 && <p className="mt-5 text-[13px] text-[var(--faint)]">{product.compatibility.join(" \u00b7 ")}</p>}
      </>
    ),
  });

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

  if (product.audienceExclusions.length > 0 || product.searchedProblems.length > 0) {
    tabs.push({
      id: "fit",
      label: "Is it for you?",
      content: (
        <>
          {product.searchedProblems.length > 0 && (
            <>
              <p className="mb-3 text-[14px] font-semibold text-[var(--text)]">Which of these sounds like you?</p>
              <SearchedProblems items={product.searchedProblems} />
            </>
          )}
          {product.audienceExclusions.length > 0 && (
            <div className={product.searchedProblems.length > 0 ? "mt-8" : ""}>
              <p className="mb-3 text-[14px] font-semibold text-[var(--text)]">Maybe not for you if</p>
              <ul className="flex flex-col gap-2.5">
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

  if (decidingQuestions.length > 0) {
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
        </div>
      ),
    });
  }

  tabs.push({
    id: "fine-print",
    label: "Data & refunds",
    content: (
      <div className="flex flex-col gap-7">
        {product.privacyNotes && (
          <div>
            <p className="text-[14px] font-semibold text-[var(--text)]">Your data</p>
            <p className="mt-1.5 max-w-[42rem] text-[14.5px] leading-relaxed text-[var(--muted)]">{product.privacyNotes}</p>
          </div>
        )}
        {installable && (
          <div>
            <p className="text-[14px] font-semibold text-[var(--text)]">It works like an app, without an app store</p>
            <p className="mt-1.5 max-w-[42rem] text-[14.5px] leading-relaxed text-[var(--muted)]">
              It runs in your browser and installs as {installedName}, with its own icon and window. On iPhone, open it in Safari and tap Share, then Add to Home Screen. On Android, tap Install. On a computer it works as it is, and Chrome and Edge can install it as its own window too.
            </p>
          </div>
        )}
        <div>
          <p className="text-[14px] font-semibold text-[var(--text)]">Refunds</p>
          <p className="mt-1.5 max-w-[42rem] text-[14.5px] leading-relaxed text-[var(--muted)]">
            {product.title} is a digital product delivered the moment your payment clears, so there are no refunds once access is granted. If something is not working, is not what you understood it to be, or you were charged in error, write to us and we will put it right.
          </p>
          <Link href="/support" className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-semibold hover:underline" style={{ color: accent }}>
            Contact support <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    ),
  });

  return tabs;
}

/**
 * Resolved once per request (not per GetAction instance, of which a page
 * can have three) so the hero, mid-page, and final CTA all agree on the
 * exact same checkout link. "signed-out" only fires when a real checkout
 * URL is actually configured: an unauthenticated visitor should never be
 * sent to sign up for a purchase that isn't live yet.
 */
type CheckoutStatus =
  | { kind: "not-applicable" }
  | { kind: "not-configured" }
  | { kind: "signed-out"; redirectTo: string }
  | { kind: "ready"; href: string };

async function resolveCheckout(product: ShopProduct, searchParams: Record<string, string | string[] | undefined>): Promise<CheckoutStatus> {
  if (product.access !== "paid" || product.purchaseAction?.href) return { kind: "not-applicable" };
  if (!hasLemonSqueezyCheckout(product.slug)) return { kind: "not-configured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // withPreservedUtm before encodeURIComponent: the campaign has to
    // survive the round trip through signup and back to this exact
    // product page, or a Pinterest visitor who signs up mid-visit is the
    // one visitor this whole system silently fails to attribute.
    const backTo = withPreservedUtm(`/shop/${product.slug}`, searchParams);
    return { kind: "signed-out", redirectTo: `/signup?redirectTo=${encodeURIComponent(backTo)}` };
  }

  const href = getLemonSqueezyCheckoutUrl(product.slug, { userId: user.id, email: user.email ?? null });
  return href ? { kind: "ready", href } : { kind: "not-configured" };
}

/** The get action. Free adds to the library; paid links to the real Lemon
 * Squeezy checkout once it's configured and the visitor is signed in. A
 * coming-soon product shows a disabled state instead of a live action. */
function GetAction({
  product,
  checkout,
  productCategory,
  size = "md",
  center = false,
  fullWidth = false,
}: {
  product: ShopProduct;
  checkout: CheckoutStatus;
  /** The area label (Money, Home, Travel, ...) this product's page already computed once, passed down rather than re-derived per render. */
  productCategory: string;
  size?: "sm" | "md" | "lg";
  center?: boolean;
  /** Fills its column, so the buy box reads as one block rather than a button floating in it. */
  fullWidth?: boolean;
}) {
  if (product.availability === "coming-soon") {
    return (
      <div className={center ? "inline-flex flex-col items-center gap-1.5" : "flex flex-col gap-1.5"}>
        <Button size={size} disabled>
          Coming soon
        </Button>
        <p className="text-[12px] text-[var(--faint)]">Not available to get just yet.</p>
      </div>
    );
  }

  const label =
    product.purchaseAction?.label ?? (product.access === "free" ? "Add to your library, free" : "Get Lifetime Access");

  // A free product's own Shop page has already made the full case for it.
  // Posting straight to the activation endpoint (the same one
  // /app/activate/[productSlug]'s <form> already posts to) skips a second,
  // near-duplicate "Add {title} to your library" confirmation screen for a
  // decision the visitor already made here. /app/activate/[productSlug]
  // stays intact as the confirmation screen for paid products (where a
  // distinct "you're about to be charged" moment still matters) and as a
  // safe fallback entry point.
  if (product.access === "free") {
    return <AddToLibraryButton slug={product.slug} label={label} size={size} analytics={{ productName: product.title }} />;
  }

  // Paid, with a static href already set on the listing itself (e.g. a
  // future non-Lemon-Squeezy checkout), unrelated to per-visitor checkout
  // resolution, so it always wins if present.
  if (product.purchaseAction?.href) {
    return (
      <Button href={product.purchaseAction.href} size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    );
  }

  if (checkout.kind === "ready") {
    return (
      <CheckoutButton
        href={checkout.href}
        size={size}
        fullWidth={fullWidth}
        iconRight={<ArrowRight size={15} aria-hidden />}
        analytics={{ productId: product.id, productName: product.title, productCategory, cta: label }}
      >
        {label}
      </CheckoutButton>
    );
  }

  if (checkout.kind === "signed-out") {
    return (
      <TrackedLink
        href={checkout.redirectTo}
        size={size}
        fullWidth={fullWidth}
        iconRight={<ArrowRight size={15} aria-hidden />}
        eventName="product_cta_click"
        eventParams={{ product_id: product.id, product_name: product.title, cta: label }}
      >
        {label}
      </TrackedLink>
    );
  }

  // Checkout isn't configured yet (Lemon Squeezy product/checkout link not
  // created), or this product isn't paid at all: shown as pending rather
  // than a dead or fake link.
  return (
    <div className={center ? "inline-flex flex-col items-center gap-1.5" : "flex flex-col gap-1.5"}>
      <Button size={size} disabled iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
      <p className="text-[12px] text-[var(--faint)]">Checkout opens soon.</p>
    </div>
  );
}

/**
 * Hero product visual: a real screenshot framed in a browser window, the way
 * a live web product actually reaches people, rather than a bare cropped
 * image. A labeled placeholder still shows when a product has no media yet.
 */
function buildStructuredData(product: ShopProduct) {
  if (!(product.structuredDataEligible && product.publicationStatus === "published")) return null;
  const url = `https://draftpace.com/shop/${product.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seo.description,
    // Google will not show a Product rich result without an image, which
    // is why this was previously ineligible however complete the rest of
    // it looked. Absolute, because a crawler does not resolve relative
    // paths inside JSON-LD.
    ...(STORE_COVERS.has(product.slug)
      ? { image: [`https://draftpace.com/store/${product.slug}-1-cover.webp`] }
      : {}),
    brand: { "@type": "Brand", name: "Draftpace" },
    sku: product.slug,
    url,
    offers: {
      "@type": "Offer",
      url,
      price: product.access === "free" ? "0" : product.price?.amount.toString(),
      priceCurrency: product.access === "free" ? "USD" : product.price?.currency,
      availability: product.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      // One payment, no licence term. Stated so a crawler does not have to
      // infer it from a price alone.
      priceValidUntil: "2027-12-31",
    },
  };
}

/**
 * FAQPage schema from the listing's own real questions (whichever field
 * they live in, migrated or not), never a separate hand-authored copy:
 * the same eligibility gate as the Product schema above (published, and
 * structuredDataEligible so an unfinished listing's placeholder answers
 * can never render as a rich result), so the two schemas always appear
 * or stay absent together. Returns null rather than an empty FAQPage
 * when a listing has no questions at all, since Google treats an
 * eligible-but-empty FAQPage as a policy violation, not a shorter valid
 * one.
 */
function buildFaqStructuredData(product: ShopProduct) {
  if (!(product.structuredDataEligible && product.publicationStatus === "published")) return null;
  // allQuestions(), not product.faqs directly: a migrated listing empties
  // objections/faqs and keeps every question in the new unified
  // `questions` field instead (see src/shop/definition.ts). Reading
  // .faqs alone would have rendered an empty FAQPage for every listing
  // that has already migrated, which is most of them.
  const questions = allQuestions(product);
  if (questions.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}
