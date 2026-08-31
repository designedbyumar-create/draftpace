import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, Check, Lock, X } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { discountPercent, formatCompareAtPrice, formatPrice, type ShopProduct } from "@/shop/definition";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import RichSection from "./RichSection";
import AddToLibraryButton from "../AddToLibraryButton";
import {
  OverviewScreenMockup as MmrOverviewScreenMockup,
  AddInfoScreenMockup as MmrAddInfoScreenMockup,
  BreakdownScreenMockup as MmrBreakdownScreenMockup,
} from "./monthlyMoneyResetVisuals";
import {
  OverviewScreenMockup as PfcOverviewScreenMockup,
  GuidedCompanionScreenMockup as PfcGuidedCompanionScreenMockup,
  AttentionScreenMockup as PfcAttentionScreenMockup,
} from "./personalFinanceCompanionVisuals";
import {
  OverviewScreenMockup as HmcOverviewScreenMockup,
  ActionRecordScreenMockup as HmcActionRecordScreenMockup,
  SetupScreenMockup as HmcSetupScreenMockup,
} from "./homeManagementCompanionVisuals";
import {
  OverviewScreenMockup as PlaOverviewScreenMockup,
  CompanionScreenMockup as PlaCompanionScreenMockup,
  BookScreenMockup as PlaBookScreenMockup,
} from "./personalLifeAffairsCompanionVisuals";
import {
  OverviewScreenMockup as HscOverviewScreenMockup,
  CheckScreenMockup as HscCheckScreenMockup,
  BookScreenMockup as HscBookScreenMockup,
} from "./homeschoolingCompanionVisuals";
import {
  OverviewScreenMockup as AlongsideOverviewScreenMockup,
  CompanionScreenMockup as AlongsideCompanionScreenMockup,
  LifeScreenMockup as AlongsideLifeScreenMockup,
} from "./adhdLifeCompanionVisuals";
import {
  OverviewScreenMockup as TravelOverviewScreenMockup,
  ChangeImpactScreenMockup as TravelChangeImpactScreenMockup,
  TripBriefScreenMockup as TravelTripBriefScreenMockup,
} from "./travelCompanionVisuals";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLemonSqueezyCheckoutUrl, hasLemonSqueezyCheckout } from "@/shop/lemonSqueezyCheckout";

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
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: `/shop/${product.slug}` },
    robots: product.publicationStatus === "published" ? undefined : { index: false, follow: false },
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
}: {
  params: Promise<{ productSlug: string }>;
}) {
  ensureShopRegistered();
  const { productSlug } = await params;
  const product = shopRegistry.getBySlug(productSlug);
  if (!product) notFound();

  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savingsPercent = discountPercent(product);
  const structuredData = buildStructuredData(product);
  // Bespoke mobile mockups exist for these two real products today (see
  // each visuals file's own doc comment for why real screenshots aren't
  // used); any other product falls back to HeroVisual/plain text sections
  // until it has its own.
  const isMonthlyMoneyReset = product.slug === "monthly-money-reset";
  const isPersonalFinanceCompanion = product.slug === "personal-finance-companion";
  const isHomeManagementCompanion = product.slug === "home-management-companion";
  const isPersonalLifeAffairsCompanion = product.slug === "personal-life-affairs-companion";
  const isHomeschoolingCompanion = product.slug === "homeschooling-companion";
  const isAlongside = product.slug === "alongside";
  const isTravelCompanion = product.slug === "travel-companion";

  // Resolved once per request, server-side, so every GetAction on this page
  // (hero, mid-page, final CTA) agrees on the exact same checkout link
  // rather than each independently re-deriving it.
  const checkout = await resolveCheckout(product);

  return (
    <>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}

      {/* Movement 1: outcome hero with a real visual, given room to breathe */}
      <div className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-[var(--primary)] opacity-[0.07] blur-[110px]"
        />
        <Container width="wide" className="relative pb-16 pt-14 sm:pb-20 sm:pt-16">
          {product.devFixture && (
            <div className="mb-6 rounded-lg bg-[var(--surface-muted)] px-4 py-2.5 text-[12px] font-semibold text-[var(--muted)]">
              Internal Shop preview. This listing does not describe a real product.
            </div>
          )}
          <section className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] sm:items-center sm:gap-8 lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={product.access === "free" ? "success" : "primary"}>
                  {product.access === "free" ? "Free" : "Paid"}
                </Badge>
                {/* Only ever appears once a listing genuinely has launch
                    pricing set; every real product has none yet, so this
                    row renders exactly as it always has until its own
                    phase sets a compareAtPrice. */}
                {compareAtLabel && (
                  <span className="inline-flex items-center gap-1.5 text-[13px]">
                    <span className="text-[var(--faint)] line-through">{compareAtLabel}</span>
                    <span className="font-semibold text-[var(--text)]">{priceLabel}</span>
                    {savingsPercent !== null && savingsPercent > 0 && (
                      <Badge tone="success">Save {savingsPercent}%</Badge>
                    )}
                  </span>
                )}
                {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
              </div>
              <h1 className="mt-4 font-serif text-[38px] font-semibold leading-[1.05] tracking-tight sm:text-[52px]">
                {product.title}
              </h1>
              <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-[var(--muted)] sm:text-[18px]">
                {product.promise}
              </p>
              <div className="mt-8">
                <GetAction product={product} priceLabel={priceLabel} checkout={checkout} size="lg" />
              </div>
              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-[var(--faint)]">
                <Lock size={12} aria-hidden />
                Only you can see your data. It saves to your account, on every device.
              </p>
            </div>
            {isMonthlyMoneyReset ? (
              <MmrOverviewScreenMockup />
            ) : isPersonalFinanceCompanion ? (
              <PfcOverviewScreenMockup />
            ) : isHomeManagementCompanion ? (
              <HmcOverviewScreenMockup />
            ) : isPersonalLifeAffairsCompanion ? (
              <PlaOverviewScreenMockup />
            ) : isHomeschoolingCompanion ? (
              <HscOverviewScreenMockup />
            ) : isAlongside ? (
              <AlongsideOverviewScreenMockup />
            ) : isTravelCompanion ? (
              <TravelOverviewScreenMockup />
            ) : (
              <HeroVisual product={product} />
            )}
          </section>
        </Container>
      </div>

      <Container width="standard" className="pb-28 pt-14 sm:pt-16">
      {/* Movement 2: who this is for and the situation */}
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
          <p className="mt-4 text-[var(--muted)]">{product.problem}</p>
        </RichSection>
      )}

      {/* Movement 3: what becomes easier */}
      {product.outcomes.length > 0 && (
        <RichSection
          eyebrow="What becomes easier"
          visual={
            isMonthlyMoneyReset ? (
              <MmrBreakdownScreenMockup />
            ) : isPersonalFinanceCompanion ? (
              <PfcAttentionScreenMockup />
            ) : isHomeManagementCompanion ? (
              <HmcActionRecordScreenMockup />
            ) : isPersonalLifeAffairsCompanion ? (
              <PlaBookScreenMockup />
            ) : isHomeschoolingCompanion ? (
              <HscCheckScreenMockup />
            ) : isAlongside ? (
              <AlongsideLifeScreenMockup />
            ) : isTravelCompanion ? (
              <TravelChangeImpactScreenMockup />
            ) : undefined
          }
        >
          <ul className="flex flex-col gap-3">
            {product.outcomes.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </RichSection>
      )}

      {/* Movement 4: how it works */}
      {product.howItWorks.length > 0 && (
        <RichSection
          eyebrow="How it works"
          visual={
            isMonthlyMoneyReset ? (
              <MmrAddInfoScreenMockup />
            ) : isPersonalFinanceCompanion ? (
              <PfcGuidedCompanionScreenMockup />
            ) : isHomeManagementCompanion ? (
              <HmcSetupScreenMockup />
            ) : isPersonalLifeAffairsCompanion ? (
              <PlaCompanionScreenMockup />
            ) : isHomeschoolingCompanion ? (
              <HscBookScreenMockup />
            ) : isAlongside ? (
              <AlongsideCompanionScreenMockup />
            ) : isTravelCompanion ? (
              <TravelTripBriefScreenMockup />
            ) : undefined
          }
          reverse
        >
          <ol className="flex flex-col gap-3.5">
            {product.howItWorks.map((step, index) => (
              <li key={step} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[12px] font-bold text-[var(--muted)]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </RichSection>
      )}

      {/* Movement 5: objection resolution, near the decision */}
      {product.objections.length > 0 && (
        <RichSection eyebrow="Honest answers before you decide">
          <div className="flex flex-col divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] text-[15px]">
            {product.objections.map((o) => (
              <div key={o.worry} className="px-5 py-4">
                <p className="font-semibold text-[var(--text)]">{o.worry}</p>
                <p className="mt-1.5 leading-relaxed text-[var(--muted)]">{o.answer}</p>
              </div>
            ))}
          </div>
        </RichSection>
      )}

      {/* Movement 6: what's included, honest limits, privacy */}
      <RichSection eyebrow="What's included">
        <ul className="flex flex-col gap-2.5">
          {product.inclusions.map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <Check size={17} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
        {product.compatibility.length > 0 && (
          <p className="mt-3 text-[13px] text-[var(--faint)]">{product.compatibility.join(" · ")}</p>
        )}
      </RichSection>

      {product.audienceExclusions.length > 0 && (
        <RichSection eyebrow="Maybe not for you if">
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
        <RichSection eyebrow="Privacy and data">
          <p className="text-[var(--muted)]">{product.privacyNotes}</p>
        </RichSection>
      )}

      {/* Price and get, repeated near the decision */}
      <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-[shadow:var(--shadow-soft)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--faint)]">Price</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
              {compareAtLabel && (
                <span className="font-serif text-[20px] text-[var(--faint)] line-through">{compareAtLabel}</span>
              )}
              <p className="font-serif text-[32px] font-semibold leading-none tracking-tight text-[var(--text)]">
                {priceLabel}
              </p>
              {savingsPercent !== null && savingsPercent > 0 && (
                <Badge tone="success">Save {savingsPercent}%</Badge>
              )}
            </div>
            {product.access === "paid" && (
              <p className="mt-1.5 text-[12px] text-[var(--muted)]">
                One-time. Yours to keep.
                {compareAtLabel && " This is launch pricing, not a coupon: the regular price is what it moves to next."}
              </p>
            )}
          </div>
          <GetAction product={product} priceLabel={priceLabel} checkout={checkout} size="lg" />
        </div>
      </section>

      {/* FAQs */}
      {product.faqs.length > 0 && (
        <RichSection eyebrow="Questions">
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {product.faqs.map((faq) => (
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

      {/* Related */}
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
      <section className="mt-14 border-t border-[var(--border)] pt-10 text-center">
        <GetAction product={product} priceLabel={priceLabel} checkout={checkout} size="lg" center />
      </section>
      </Container>
    </>
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
  priceLabel,
  checkout,
  size = "md",
  center = false,
}: {
  product: ShopProduct;
  priceLabel: string;
  checkout: CheckoutStatus;
  size?: "sm" | "md" | "lg";
  center?: boolean;
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
    product.purchaseAction?.label ?? (product.access === "free" ? "Add to your library, free" : `Get it, ${priceLabel}`);

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
      <Button href={product.purchaseAction.href} size={size} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    );
  }

  if (checkout.kind === "ready") {
    return (
      <Button href={checkout.href} size={size} iconRight={<ArrowRight size={15} aria-hidden />}>
        {label}
      </Button>
    );
  }

  if (checkout.kind === "signed-out") {
    return (
      <Button href={checkout.redirectTo} size={size} iconRight={<ArrowRight size={15} aria-hidden />}>
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
function HeroVisual({ product }: { product: ShopProduct }) {
  const media = product.media[0];
  if (media) {
    return (
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-x-4 inset-y-6 -z-10 rounded-[28px] bg-[var(--primary)] opacity-[0.12] blur-2xl"
        />
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-md)] transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] hover:-translate-y-0.5">
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" aria-hidden />
            <div className="mx-auto flex items-center gap-1.5 rounded-md bg-[var(--surface)] px-3 py-1 text-[11px] font-medium text-[var(--faint)]">
              <Lock size={10} aria-hidden />
              draftpace.com
            </div>
          </div>
          <div className="relative aspect-[4/3]">
            <Image
              src={media.src}
              alt={media.alt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Product preview</p>
      <p className="max-w-[16rem] text-[13px] leading-5 text-[var(--muted)]">
        A real view of {product.title} in use goes here, showing the main result the product produces.
      </p>
    </div>
  );
}

function buildStructuredData(product: ShopProduct) {
  if (!(product.structuredDataEligible && product.publicationStatus === "published")) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seo.description,
    offers: {
      "@type": "Offer",
      price: product.access === "free" ? "0" : product.price?.amount.toString(),
      priceCurrency: product.access === "free" ? "USD" : product.price?.currency,
      availability: product.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
    },
  };
}
