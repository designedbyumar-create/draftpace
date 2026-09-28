import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import { GuidesForCompanion } from "@/components/public/guides/GuideLinks";
import { ArrowRight, Check } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { questionsForStage } from "@/shop/definition";
import ProductScreenCarousel from "../shop/[productSlug]/ProductScreenCarousel";
import { screenTourFor } from "../shop/productScreens";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { deriveDarkTones } from "@/design-system/accentTone";
import { getAreaForProduct } from "@/content/areas";
import ViewProductTracker from "@/components/analytics/ViewProductTracker";
import TrackedLink from "@/components/analytics/TrackedLink";
import PwaInstallSection from "@/components/public/shop/PwaInstallSection";
import TextLink from "@/design-system/TextLink";

/**
 * The free product's own front door.
 *
 * WHY THIS EXISTS RATHER THAN A SHOP LISTING
 *
 * Monthly Money Reset lived at /shop/monthly-money-reset, a product
 * detail page inside a priced catalogue, where its price row said "Free"
 * beside siblings saying $18 and $28. That put the one product anybody
 * can actually use into competition with the products it is meant to
 * introduce, and anchored every price on the site against zero. It was
 * also the first card in the grid and the product the homepage hero
 * showed for Money, so the highest-value slot on the site advertised the
 * thing that earns nothing.
 *
 * A free product is not a cheap item in a catalogue. It is the only way
 * somebody finds out what a Companion feels like before paying, and the
 * cheapest reason to make an account. That is a different job from
 * selling, and it needs its own page, its own search terms and its own
 * conversion path.
 *
 * THE PROMISE THIS PAGE MUST NOT BREAK
 *
 * The product's own copy says it is "a complete, narrower tool, not a
 * crippled preview of something bigger". So this page never sells it as
 * a trial, never gates anything behind an upgrade, and never implies the
 * paid products are the real version of it. What it does at the end is
 * name, once, the boundary this product deliberately has (one cycle at a
 * time, no subscriptions, debt or savings) and say which product covers
 * that instead. That is a graduation, not a paywall.
 *
 * CONTENT COMES FROM THE LISTING, NOT FROM HERE
 *
 * Everything below reads the same ShopProduct the Shop and the Library
 * manual read, so the free product cannot end up described three
 * different ways. See src/shop/products/monthly-money-reset.ts.
 */

const FREE_SLUG = "monthly-money-reset";

export const metadata: Metadata = {
  title: "A free way to see what is safe to spend",
  description:
    "Monthly Money Reset is free and complete, not a trial. See what is genuinely safe to spend after what is already committed, protect the bills that must be paid, and know the next useful move. No card, no subscription, no bank connection.",
  alternates: { canonical: "/free" },
  openGraph: {
    title: "A free way to see what is safe to spend",
    description:
      "Free and complete, not a trial. One number for what is safe to spend after what is already committed. No card, no bank connection.",
    url: "/free",
    type: "website",
  },
};

export default function FreeProductPage() {
  ensureShopRegistered();
  const product = shopRegistry.getBySlug(FREE_SLUG);

  // The page is generated from the listing, so with no listing there is
  // nothing honest to say. An empty state beats inventing copy.
  if (!product) {
    return (
      <Container width="wide" className="py-24">
        <h1 className="text-heading-lg font-serif font-semibold tracking-tight">Nothing free is published yet</h1>
        <p className="mt-3 max-w-lg text-body leading-relaxed text-[var(--muted)]">
          There is no free product listed right now. The Companion Series is over on the Shop.
        </p>
        <TextLink href="/shop" arrow className="mt-6">
          See the Companion Series
        </TextLink>
      </Container>
    );
  }

  const deciding = questionsForStage(product, "deciding");

  /**
   * Monthly Money Reset carries its accent as bespoke --mmr-* tokens
   * rather than an accentScale (its own documented exception), so there is
   * no scale to read. This states its forest directly, the same
   * --mmr-forest-800 its PWA icon uses, rather than falling back to the
   * platform teal: the free product should look like itself here, not
   * like Draftpace generally.
   */
  ensureProductsRegistered();
  const accent = productRegistry.getBySlug(product.slug)?.theme?.accentScale?.base ?? "#214b3e";
  // The dark-theme counterpart, for the screen carousel's wash: see its
  // own comment for why an inline style needs both values, not one.
  const accentDark = deriveDarkTones(accent).base;
  const screenTour = screenTourFor(product.slug);
  const productCategory = getAreaForProduct(product.slug)?.label ?? "uncategorized";

  return (
    <>
      <ViewProductTracker productId={product.id} productName={product.title} productCategory={productCategory} />
      {/* Hero. One claim, one button, and the screen doing the thing.
          "Free" is stated as a fact rather than shouted: this page is
          reached by people who already know it is free, from an ad, a
          search result or the Shop's own band. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-14 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">
                Free, and not a trial
              </p>
              <h1 className="mt-3 text-display font-serif font-semibold tracking-tight">
                Know what is actually safe to spend.
              </h1>
              <p className="mt-5 max-w-lg text-body-lg leading-relaxed text-[var(--muted)]">
                {product.promise}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <TrackedLink
                  href={`/app/activate/${product.slug}`}
                  size="lg"
                  iconRight={<ArrowRight size={16} aria-hidden />}
                  eventName="free_product_start"
                  eventParams={{ product_id: product.id, product_name: product.title }}
                >
                  Start free
                </TrackedLink>
                <p className="text-body-sm text-[var(--faint)]">
                  No card. No subscription. Takes a couple of minutes.
                </p>
              </div>

              {/* The three objections that stop somebody signing up for a
                  free thing, answered before they are asked. */}
              <ul role="list" className="mt-8 flex flex-col gap-2.5">
                {[
                  "Complete, not a stripped-down preview of a paid product.",
                  "No bank connection, ever. You enter the numbers yourself.",
                  "Your figures save to your account, so they follow you between devices.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <Check size={14} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
                    <span className="text-body-sm leading-relaxed text-[var(--muted)]">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The same gallery every paid product page opens with, so the
                free product is presented as a peer of the paid ones rather
                than as a lesser thing in a different shape. It is the one
                place the two tiers should look identical: the difference
                between them is the price, not the seriousness. */}
            {screenTour ? (
              <ProductScreenCarousel screens={screenTour} accent={accent} accentDark={accentDark} title={product.title} />
            ) : null}
          </div>
        </Container>
      </section>

      {/* What it solves, in the reader's words. Straight from the
          listing's problemsSolved, so this can never drift from the Shop
          or the Library manual. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <h2 className="max-w-2xl text-heading font-serif font-semibold tracking-tight">
            What it takes off your plate.
          </h2>
          <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2">
            {product.problemsSolved.map((pair) => (
              <li
                key={pair.problem}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <p className="text-body-sm font-semibold leading-snug text-[var(--text)]">{pair.problem}</p>
                <p className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">{pair.solution}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it actually works, so nobody has to guess at the shape of
          the thing before making an account. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <h2 className="max-w-2xl text-heading font-serif font-semibold tracking-tight">
            How it works.
          </h2>
          <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.howItWorks.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="mt-0.5 shrink-0 text-heading-sm font-serif font-semibold leading-none text-[var(--faint)]">
                  {index + 1}
                </span>
                <p className="text-body-sm leading-relaxed text-[var(--muted)]">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* The questions somebody asks before signing up, from the
          listing's own deciding-stage set. */}
      {deciding.length > 0 && (
        <section className="border-b border-[var(--border)]">
          <Container width="wide" className="py-16 sm:py-20">
            <h2 className="max-w-2xl text-heading font-serif font-semibold tracking-tight">
              Before you start.
            </h2>
            <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {deciding.map((entry) => (
                <div key={entry.question}>
                  <dt className="text-body font-semibold leading-snug text-[var(--text)]">{entry.question}</dt>
                  <dd className="mt-2 text-body-sm leading-relaxed text-[var(--muted)]">{entry.answer}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/*
        How it reaches a phone. Every claim here is true of the shipped
        PWA: this product serves its own manifest, scoped to its own
        routes, with its own icon and name, and installs from inside
        itself. It matters more here than on a paid page: this is the
        first Draftpace product most people ever open, and "a website" and
        "an app on my phone" are different propositions to somebody
        deciding whether to bother.
      */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <PwaInstallSection productName={product.title} />
          <p className="mt-8 max-w-[42rem] border-t border-[var(--border)] pt-6 text-body-sm leading-relaxed text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">Free installs exactly like paid.</span> It gets its own
            icon and its own window, the same as every Companion, because being free is not a reason to be less of an
            app. Your figures are tied to your account rather than the device, so signing in anywhere brings them with
            you.
          </p>
        </Container>
      </section>

      {/* The graduation, said once and only at the end.
          Not a paywall and not an upsell for something this product is
          missing: it names the boundary this product deliberately has,
          which is exactly what its own audienceExclusions already say,
          and points at the product whose job that is. Somebody who never
          hits that boundary never needs the other one, and this page
          says so. */}
      {/* The searches this product answers, for somebody who wants the answer before the tool. */}
      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 sm:py-20">
          <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">Free guides</p>
          <h2 className="mt-3 text-heading font-serif font-semibold tracking-tight">
            Want the answer before the tool?
          </h2>
          <div className="mt-6">
            <GuidesForCompanion areaSlug="money" />
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 sm:py-20">
          <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">
            When you outgrow it
          </p>
          <h2 className="mt-3 text-heading font-serif font-semibold tracking-tight">
            It handles one cycle at a time, on purpose.
          </h2>
          <p className="mt-4 text-body leading-relaxed text-[var(--muted)]">
            That is the whole design, not a limitation waiting to be lifted. Most people never need more than it.
            If you find yourself wanting subscriptions, debt and savings held alongside the rest, that is a different
            product rather than a bigger version of this one, and it is there when you want it.
          </p>
          <div className="mt-7">
            {/* Not <TextLink>: deliberately de-emphasised (muted, not
                the accent), same reasoning as CompanionPicker.tsx's
                "Full details" link. */}
            <Link
              href="/shop/personal-finance-companion"
              className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
            >
              See Personal Finance Companion
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* Closing. The same single action as the hero, for anybody who
          read the whole page before deciding. */}
      <section>
        <Container width="wide" className="py-16 text-center sm:py-20">
          <h2 className="text-heading font-serif font-semibold tracking-tight">
            Start with the number that matters.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-body leading-relaxed text-[var(--muted)]">
            Free, complete, and yours to keep. If it is not for you, nothing was spent finding out.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <TrackedLink
              href={`/app/activate/${product.slug}`}
              size="lg"
              iconRight={<ArrowRight size={16} aria-hidden />}
              eventName="free_product_start"
              eventParams={{ product_id: product.id, product_name: product.title }}
            >
              Start free
            </TrackedLink>
            <Link href="/shop" className="text-body-sm font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              See the paid Companions
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
