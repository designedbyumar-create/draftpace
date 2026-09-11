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
import ProblemCards from "./ProblemCards";
import AddToLibraryButton from "../AddToLibraryButton";
import ProductGallery from "./ProductGallery";
import ProductScreenCarousel from "./ProductScreenCarousel";
import { screenTourFor } from "../productScreens";
import StickyBuyBar from "./StickyBuyBar";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLemonSqueezyCheckoutUrl, hasLemonSqueezyCheckout } from "@/shop/lemonSqueezyCheckout";
import CheckoutButton from "@/components/shop/CheckoutButton";

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
}: {
  params: Promise<{ productSlug: string }>;
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
   */
  if (product.access === "free") permanentRedirect("/free");

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

  // Resolved once per request, server-side, so every GetAction on this page
  // agrees on the exact same checkout link rather than each independently
  // re-deriving it.
  const checkout = await resolveCheckout(product);

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
              <GetAction product={product} checkout={checkout} size="lg" fullWidth />
            </div>
            {/* Appears only once the button above has scrolled away, and
                renders the same GetAction so the two can never disagree
                about what the checkout is. */}
            <StickyBuyBar priceLabel={priceLabel} compareAtLabel={compareAtLabel}>
              <GetAction product={product} checkout={checkout} size="md" fullWidth />
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
        {/* What it includes, first: the reader has just decided to keep
            reading, and this is the question they are actually holding. */}
        <RichSection eyebrow="Included" title="What it includes">
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
            {product.inclusions.map((line) => (
              <div key={line} className="flex items-start gap-2.5 border-b border-[var(--border)] pb-4">
                <Check size={16} className="mt-1 shrink-0" style={{ color: accent }} aria-hidden />
                <span className="text-[14.5px] leading-relaxed">{line}</span>
              </div>
            ))}
          </div>
          {product.compatibility.length > 0 && (
            <p className="mt-5 text-[13px] text-[var(--faint)]">{product.compatibility.join(" · ")}</p>
          )}
        </RichSection>

        {product.problemsSolved.length > 0 ? (
          <RichSection eyebrow="The problem" title="What this solves">
            <p className="mb-5 text-[var(--muted)]">{product.problem}</p>
            <ProblemCards items={product.problemsSolved} />
          </RichSection>
        ) : (
          <>
            {product.audience.length > 0 && (
              <RichSection eyebrow="Who this is for">
                <ul className="flex flex-col gap-2.5">
                  {product.audience.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <Check size={17} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </RichSection>
            )}
          </>
        )}

        {product.howItWorks.length > 0 && (
          <RichSection eyebrow="In use" title="How it works">
            <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {product.howItWorks.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[14.5px] leading-relaxed text-[var(--muted)]">{step}</span>
                </li>
              ))}
            </ol>
          </RichSection>
        )}

        {product.searchedProblems.length > 0 && (
          <RichSection eyebrow="In your words" title="Which of these is you?">
            <SearchedProblems items={product.searchedProblems} />
          </RichSection>
        )}

        {/*
          How the product reaches a phone. Every claim here is true of the
          shipped PWA: each product serves its own manifest, scoped to its
          own routes, with its own icon and name (see the product's
          manifest.webmanifest route), and installs from inside itself.
          Only rendered for a product that actually declares `pwa`.
        */}
        {installable && (
          <RichSection eyebrow="On your devices" title="It works like an app, without an app store">
            <p className="max-w-[42rem] leading-relaxed text-[var(--muted)]">
              {product.title} runs in your browser, and installs to your phone from there. No App Store, no
              Play Store, no download, and no update to remember. Add it once and it gets its own icon and
              its own window, like any other app on your phone.
            </p>
            <div className="mt-7 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-[13px] font-bold text-[var(--text)]">On iPhone and iPad</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  Open it in Safari, tap Share, then Add to Home Screen. It opens full screen from then on,
                  with no browser bar.
                </p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--text)]">On Android</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  Chrome offers to install it, or you can tap Install in the product&apos;s own settings. One
                  tap and it is on your home screen.
                </p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-[var(--text)]">On computers</p>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
                  It works in any modern browser as it is. Chrome and Edge will also install it as its own
                  desktop window if you would rather it were not a tab.
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-[42rem] border-t border-[var(--border)] pt-5 text-[14px] leading-relaxed text-[var(--muted)]">
              <span className="font-semibold text-[var(--text)]">Installs as {installedName}, not as Draftpace.</span>{" "}
              Each Companion has its own icon and its own window, so owning three of them gives you three
              separate apps rather than one to navigate inside. Your work is tied to your account rather
              than the device, so signing in anywhere brings all of it with you.
            </p>
          </RichSection>
        )}

        {product.audienceExclusions.length > 0 && (
          <RichSection eyebrow="Honesty" title="Maybe not for you if">
            <ul className="flex flex-col gap-2.5">
              {product.audienceExclusions.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[var(--muted)]">
                  <X size={17} className="mt-0.5 shrink-0 text-[var(--faint)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </RichSection>
        )}

        {product.privacyNotes && (
          <RichSection eyebrow="Your data" title="Privacy and data">
            <p className="max-w-[42rem] leading-relaxed text-[var(--muted)]">{product.privacyNotes}</p>
          </RichSection>
        )}

        {/*
          Stated before the second buy button, not after it. Somebody
          deciding whether to spend money is entitled to know the refund
          position while they are still deciding.
        */}
        <RichSection eyebrow="Before you buy" title="About refunds">
          <div className="max-w-[42rem]">
            <p className="leading-relaxed text-[var(--text)]">
              {product.title} is a digital product, delivered to your account the moment your payment
              clears. Because of that we do not offer refunds once access has been granted.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              We would rather you did not need one. Everything on this page describes what the product
              actually does, and Monthly Money Reset is free if you would like to see how we build before
              you spend anything.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--muted)]">
              If something is not working, is not what you understood it to be, or you were charged in
              error, please write to us. We read every message and we will put it right.
            </p>
            <Link
              href="/support"
              className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold hover:underline"
              style={{ color: accent }}
            >
              Contact support <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        </RichSection>

        {decidingQuestions.length > 0 && (
          <RichSection eyebrow="Straight answers" title="Honest answers before you decide">
            <div className="flex flex-col divide-y divide-[var(--border)]">
              {decidingQuestions.map((faq) => (
                <details key={faq.question} className="group py-3 first:pt-0">
                  <summary className="cursor-pointer text-[15px] font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                    {faq.question}
                  </summary>
                  <p className="mt-2 leading-relaxed text-[var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </RichSection>
        )}

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
            <GetAction product={product} checkout={checkout} size="lg" center />
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

async function resolveCheckout(product: ShopProduct): Promise<CheckoutStatus> {
  if (product.access !== "paid" || product.purchaseAction?.href) return { kind: "not-applicable" };
  if (!hasLemonSqueezyCheckout(product.slug)) return { kind: "not-configured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "signed-out", redirectTo: `/signup?redirectTo=${encodeURIComponent(`/shop/${product.slug}`)}` };
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
  size = "md",
  center = false,
  fullWidth = false,
}: {
  product: ShopProduct;
  checkout: CheckoutStatus;
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
    return <AddToLibraryButton slug={product.slug} label={label} size={size} />;
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
      <CheckoutButton href={checkout.href} size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </CheckoutButton>
    );
  }

  if (checkout.kind === "signed-out") {
    return (
      <Button href={checkout.redirectTo} size={size} fullWidth={fullWidth} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
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
