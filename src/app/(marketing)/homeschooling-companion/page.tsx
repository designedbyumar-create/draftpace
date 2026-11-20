import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import { ArrowRight, Check, Lock } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { formatPrice, formatCompareAtPrice, discountPercent, questionsForStage } from "@/shop/definition";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import { getAreaForProduct } from "@/content/areas";
import { jsonLd } from "@/lib/structuredData";
import ViewProductTracker from "@/components/analytics/ViewProductTracker";
import PwaInstallSection from "@/components/public/shop/PwaInstallSection";
import InclusionsGrid from "../shop/[productSlug]/InclusionsGrid";
import ProblemCards from "../shop/[productSlug]/ProblemCards";
import { GetAction, resolveCheckout } from "../shop/GetAction";
import { buildProductStructuredData, buildFaqStructuredData, coverImagePath } from "../shop/productStructuredData";
import { GuidesForCompanion } from "@/components/public/guides/GuideLinks";
import {
  OverviewScreenMockup,
  CheckScreenMockup,
  AddChildScreenMockup,
  BookScreenMockup,
} from "../shop/[productSlug]/homeschoolingCompanionVisuals";

const SLUG = "homeschooling-companion";
const CANONICAL = "/homeschooling-companion";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(SLUG);
  if (!product) return {};
  const cover = coverImagePath(product.slug);
  return {
    title: product.seo.title,
    description: product.seo.description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      title: product.seo.title,
      description: product.seo.description,
      url: CANONICAL,
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
 * The Homeschooling Companion's own landing page: its information page
 * and its sales page in one, so a visitor can understand it, see the
 * real interface, and buy it without a second stop at a generic
 * /shop/[productSlug] detail page. /shop/homeschooling-companion
 * permanently redirects here (see canonicalPath in the product's own
 * shop listing and the redirect in /shop/[productSlug]/page.tsx), so
 * this is the one canonical place this product is sold and described.
 *
 * Every screen shown is a real recreation of the shipped product UI
 * (homeschoolingCompanionVisuals.tsx: the same drawings the generic
 * Shop page and the owned-product manual already use), every figure is
 * read from the product's own real listing (src/shop/products/
 * homeschooling-companion.ts) or its real PWA/definition fields, and
 * the checkout button is the exact same GetAction every other product
 * page uses. Nothing here is invented copy: a line that isn't a direct
 * quote from the listing is a close paraphrase of one, kept inside what
 * the product actually does.
 */
export default async function HomeschoolingCompanionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  ensureShopRegistered();
  ensureProductsRegistered();
  const product = shopRegistry.getBySlug(SLUG);
  if (!product) notFound();

  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savingsPercent = discountPercent(product);
  const decidingQuestions = questionsForStage(product, "deciding");
  const owningQuestions = questionsForStage(product, "owning").filter(
    (q) => !decidingQuestions.some((d) => d.question === q.question),
  );
  const faqItems = [...decidingQuestions, ...owningQuestions];

  const definition = productRegistry.getBySlug(product.slug);
  const accentScale = definition?.theme?.accentScale;
  const accent = accentScale?.base ?? "var(--primary)";
  const installedName = definition?.pwa?.shortName ?? product.title;
  const productCategory = getAreaForProduct(product.slug)?.label ?? "uncategorized";
  const guidesArea = getAreaForProduct(product.slug);

  const resolvedSearchParams = await searchParams;
  const checkout = await resolveCheckout(product, resolvedSearchParams, CANONICAL);

  const structuredData = buildProductStructuredData(product, `https://draftpace.com${CANONICAL}`);
  const faqStructuredData = buildFaqStructuredData(product);

  return (
    <div {...{ [PRODUCT_THEME_ATTRIBUTE]: "" }} style={definition ? productThemeStyle(definition.theme) : undefined}>
      <ViewProductTracker productId={product.id} productName={product.title} productCategory={productCategory} />
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />}
      {faqStructuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData) }} />}

      {/* ================= HERO ================= */}
      <div className="border-b border-[var(--border)]" style={{ background: `color-mix(in srgb, ${accent} 6%, var(--bg))` }}>
        <Container width="wide" className="pb-20 pt-14 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <span className="inline-block rounded-full border px-3 py-1 text-eyebrow font-bold uppercase" style={{ borderColor: accent, color: accent }}>
                Homeschooling Companion
              </span>
              <h1 className="mt-5 font-serif text-display font-semibold leading-[1.05] tracking-tight">
                Your homeschool year, finally in one place.
              </h1>
              <p className="mt-5 max-w-[46ch] text-body-lg leading-relaxed text-[var(--muted)]">
                {product.promise}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <GetAction product={product} checkout={checkout} productCategory={productCategory} size="lg" />
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-1.5 text-body-sm font-semibold"
                  style={{ color: accent }}
                >
                  See how it works
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
              <p className="mt-5 flex items-center gap-1.5 text-caption text-[var(--faint)]">
                <Lock size={12} aria-hidden />
                An installable web app: it works in your browser and adds its own icon to your phone or computer. No app store, nothing to download.
              </p>
            </div>

            {/* Two real screens, the second peeking from behind the first:
                the closest honest equivalent to a tablet-plus-phone
                composition without a device frame this project doesn't
                have. Both are real recreations of the shipped UI, never a
                photo or a generic dashboard. */}
            <div className="relative mx-auto w-full max-w-[360px] py-6">
              <div className="absolute -right-6 top-10 w-[78%] opacity-90 blur-[0.3px]">
                <BookScreenMockup />
              </div>
              <div className="relative">
                <OverviewScreenMockup />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container width="standard" className="pb-28">
        {/* ================= THE CHALLENGE ================= */}
        <section className="mt-20 sm:mt-24">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">The everyday part</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            Homeschooling involves more than the lesson plan.
          </h2>
          <p className="mt-5 max-w-[62ch] text-body-lg leading-relaxed text-[var(--muted)]">{product.problem}</p>
        </section>

        {/* ================= INTRODUCING THE COMPANION ================= */}
        <section className="mt-20 grid items-center gap-12 sm:mt-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-eyebrow font-bold uppercase" style={{ color: accent }}>
              A more organized way
            </p>
            <h2 className="mt-3 font-serif text-heading font-semibold tracking-tight">
              What the Companion actually does.
            </h2>
            <p className="mt-5 text-body-lg leading-relaxed text-[var(--muted)]">
              {product.howItWorks[3] ?? product.howItWorks[0]}
            </p>
            <ul className="mt-6 flex flex-col gap-3">
              {[
                "Grouped by child, never interleaved: each child's day is their own.",
                "Every task says where it came from: your curriculum, your own plan, or a suggestion you can ignore.",
                "One tap marks something done. It asks how it went, and skipping that changes nothing.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-body-sm leading-relaxed text-[var(--text)]">
                  <Check size={15} className="mt-[3px] shrink-0" style={{ color: accent }} aria-hidden />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[300px]">
            <OverviewScreenMockup />
          </div>
        </section>

        {/* ================= CORE BENEFITS ================= */}
        <section className="mt-20 sm:mt-24">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Why it helps</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            Four real reasons to use it.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {product.problemsSolved
              .filter((p) => p.label)
              .slice(0, 4)
              .map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5"
                >
                  <h3 className="font-serif text-heading-sm font-semibold">{item.label}</h3>
                  <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">{item.solution}</p>
                </div>
              ))}
          </div>
        </section>

        {/* ================= REAL PRODUCT SHOWCASE ================= */}
        <section className="mt-20 sm:mt-24" id="features">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">The real interface</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            See exactly what you&apos;re getting.
          </h2>
          <p className="mt-4 max-w-[60ch] text-body leading-relaxed text-[var(--muted)]">
            Four real screens from the shipped product: not mockups of a plan, the actual interface.
          </p>

          <div className="mt-10 flex flex-col gap-16">
            {[
              {
                Screen: OverviewScreenMockup,
                title: "Today, grouped by child",
                body: "What's scheduled this morning, per child, with where each task came from. Nothing scheduled means nothing shown: it never invents work to display.",
              },
              {
                Screen: AddChildScreenMockup,
                title: "Adding a child takes about a minute",
                body: "Name, age, and how they're schooled: three questions, one at a time. Only ever an age is stored, never a birth date.",
              },
              {
                Screen: CheckScreenMockup,
                title: "An honest check, not a score",
                body: "You supply the questions; it reports per topic, including the honest answer that there isn't enough evidence to say anything yet. It never produces a percentage.",
              },
              {
                Screen: BookScreenMockup,
                title: "The printed half",
                body: "The Homeschool Year: a 30 page book of method and undated working pages, plus a per-child printable record that sets your state's requirements beside what you've actually recorded.",
              },
            ].map(({ Screen, title, body }, i) => (
              <div
                key={title}
                className={`grid items-center gap-10 sm:grid-cols-[260px_1fr] ${i % 2 === 1 ? "sm:[direction:rtl]" : ""}`}
              >
                <div className="mx-auto w-full max-w-[220px] sm:[direction:ltr]">
                  <Screen />
                </div>
                <div className="sm:[direction:ltr]">
                  <h3 className="font-serif text-heading-sm font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 max-w-[48ch] text-body leading-relaxed text-[var(--muted)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="mt-20 sm:mt-24" id="how-it-works">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Getting started</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            Three steps, no setup to dread.
          </h2>
          <ol className="mt-9 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "Get the Companion",
                body: "One payment through checkout. It's in your account the moment payment clears, with no separate download link to wait on.",
              },
              {
                step: "Open and install it",
                body: "It runs in your browser first. Add it to your home screen or desktop whenever you want its own icon. See exactly how below.",
              },
              {
                step: "Add your first child",
                body: product.tasks.find((t) => t.label.toLowerCase().includes("add a child"))?.answer ?? "Name, age and how they're schooled. Three questions, and the age is only ever an age.",
              },
            ].map(({ step, body }, i) => (
              <li key={step}>
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-caption font-bold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {i + 1}
                </span>
                <h3 className="mt-3.5 font-serif text-heading-sm font-semibold">{step}</h3>
                <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ================= WHO IT'S FOR ================= */}
        <section className="mt-20 sm:mt-24">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Who it&apos;s for</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            Is this the right fit?
          </h2>
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <ul className="flex flex-col gap-4">
              {product.audience.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-body leading-relaxed text-[var(--text)]">
                  <Check size={16} className="mt-[3px] shrink-0" style={{ color: accent }} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            {product.audienceExclusions.length > 0 && (
              <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-muted)] p-6">
                <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Probably not for you if</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {product.audienceExclusions.map((line) => (
                    <li key={line} className="text-body-sm leading-relaxed text-[var(--muted)]">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ================= PROBLEMS SOLVED (detail) ================= */}
        {product.problemsSolved.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">In detail</p>
            <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
              Every real problem it answers.
            </h2>
            <div className="mt-8">
              <ProblemCards items={product.problemsSolved} />
            </div>
          </section>
        )}

        {/* ================= DEVICE SUPPORT & INSTALL ================= */}
        <section className="mt-20 border-t border-[var(--border)] pt-16 sm:mt-24" id="install">
          <PwaInstallSection productName={installedName} accent={accent} />
          <dl className="mt-10 grid gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2">
            {[
              ["Internet connection", "The app shell can open without one, but saving and loading your records needs a connection."],
              ["Account", "Yes. It's what keeps your records private and lets you sign back in on another device."],
              ["Multiple devices", "Yes. Everything saves to your account, not the device, the moment you make it."],
              ["Updates", "Delivered automatically through your browser. There's nothing to update by hand."],
              ["Payment", "One time. No subscription, no renewal."],
              ["Access", "Never expires. One payment, kept for good."],
            ].map(([term, detail]) => (
              <div key={term}>
                <dt className="text-eyebrow font-bold uppercase text-[var(--faint)]">{term}</dt>
                <dd className="mt-1.5 text-body-sm leading-relaxed text-[var(--muted)]">{detail}</dd>
              </div>
            ))}
          </dl>
          {product.compatibility.length > 0 && (
            <p className="mt-6 text-caption text-[var(--faint)]">{product.compatibility.join(" · ")}</p>
          )}
        </section>

        {/* ================= WHAT'S INCLUDED ================= */}
        <section className="mt-20 sm:mt-24" id="included">
          <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">What&apos;s included</p>
          <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
            Everything in one payment.
          </h2>
          <div className="mt-8">
            <InclusionsGrid items={product.inclusions} accent={accent} />
          </div>
        </section>

        {/* ================= PRICING ================= */}
        <section className="mt-20 sm:mt-24" id="pricing">
          <div
            className="rounded-[20px] border border-[var(--border)] p-8 sm:p-12"
            style={{ background: `color-mix(in srgb, ${accent} 5%, var(--surface))` }}
          >
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="text-eyebrow font-bold uppercase" style={{ color: accent }}>
                  One payment
                </p>
                <h2 className="mt-3 font-serif text-heading-lg font-semibold tracking-tight">
                  {product.title}
                </h2>
                <div className="mt-5 flex flex-wrap items-baseline gap-3">
                  <span className="font-serif text-display font-semibold leading-none tracking-tight">{priceLabel}</span>
                  {compareAtLabel && <span className="font-serif text-heading-sm text-[var(--faint)] line-through">{compareAtLabel}</span>}
                  {savingsPercent !== null && savingsPercent > 0 && (
                    <span className="rounded-full px-3 py-1 text-caption font-bold text-white" style={{ backgroundColor: accent }}>
                      {savingsPercent}% off
                    </span>
                  )}
                </div>
                <p className="mt-2 text-body-sm font-semibold" style={{ color: accent }}>
                  One payment. Yours for life.
                </p>
                <p className="mt-5 max-w-[46ch] text-body-sm leading-relaxed text-[var(--faint)]">
                  Digital product, delivered to your account the moment payment clears. No refunds once access is
                  granted. If something isn&apos;t working or isn&apos;t what you understood it to be, write to{" "}
                  <Link href="/support" className="underline" style={{ color: accent }}>
                    support
                  </Link>{" "}
                  and we&apos;ll put it right.
                </p>
              </div>
              <div className="w-full lg:w-auto">
                <GetAction product={product} checkout={checkout} productCategory={productCategory} size="lg" fullWidth center />
              </div>
            </div>
          </div>
        </section>

        {/* ================= PRIVACY & TRUST ================= */}
        {product.privacyNotes && (
          <section className="mt-20 sm:mt-24">
            <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Privacy</p>
            <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
              What happens to your family&apos;s information.
            </h2>
            <p className="mt-5 max-w-[66ch] text-body leading-relaxed text-[var(--muted)]">{product.privacyNotes}</p>
            <div className="mt-5 flex flex-wrap gap-5 text-body-sm font-semibold" style={{ color: accent }}>
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>
              <Link href="/support" className="underline">
                Support
              </Link>
            </div>
          </section>
        )}

        {/* ================= FAQ ================= */}
        {faqItems.length > 0 && (
          <section className="mt-20 sm:mt-24" id="faq">
            <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Before you buy</p>
            <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
              Questions people ask.
            </h2>
            <div className="mt-8 flex flex-col divide-y divide-[var(--border)]">
              {faqItems.map((faq) => (
                <details key={faq.question} className="group py-4 first:pt-0">
                  <summary className="cursor-pointer text-body-lg font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]">
                    {faq.question}
                  </summary>
                  <p className="mt-2.5 max-w-[66ch] text-body leading-relaxed text-[var(--muted)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ================= GUIDES CROSS-LINK ================= */}
        {guidesArea && (
          <section className="mt-20 border-t border-[var(--border)] pt-16 sm:mt-24">
            <p className="text-eyebrow font-bold uppercase text-[var(--faint)]">Not ready yet?</p>
            <h2 className="mt-3 max-w-2xl font-serif text-heading font-semibold tracking-tight">
              Free guides for {guidesArea.label.toLowerCase()}
            </h2>
            <div className="mt-6">
              <GuidesForCompanion areaSlug={guidesArea.slug} />
            </div>
          </section>
        )}
      </Container>

      {/* ================= FINAL CTA ================= */}
      <div className="border-t border-[var(--border)]" style={{ background: `color-mix(in srgb, ${accent} 10%, var(--surface))` }}>
        <Container width="standard" className="py-16 text-center sm:py-20">
          <h2 className="mx-auto max-w-[22ch] font-serif text-heading-lg font-semibold leading-[1.15] tracking-tight">
            Bring your homeschool records together.
          </h2>
          <p className="mx-auto mt-4 max-w-[42ch] text-body-lg leading-relaxed text-[var(--muted)]">
            Take a clearer, more organized approach to managing your homeschool.
          </p>
          <div className="mt-8 flex justify-center">
            <GetAction product={product} checkout={checkout} productCategory={productCategory} size="lg" center />
          </div>
        </Container>
      </div>
    </div>
  );
}
