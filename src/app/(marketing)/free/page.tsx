import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight, Check } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { questionsForStage } from "@/shop/definition";
import ProductGallery from "../shop/[productSlug]/ProductGallery";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";

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
        <h1 className="font-serif text-[32px] font-semibold tracking-tight">Nothing free is published yet</h1>
        <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
          There is no free product listed right now. The Companion Series is over on the Shop.
        </p>
        <Link href="/shop" className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
          See the Companion Series
          <ArrowRight size={13} aria-hidden />
        </Link>
      </Container>
    );
  }

  const deciding = questionsForStage(product, "deciding");

  // Monthly Money Reset carries its accent as bespoke --mmr-* tokens
  // rather than an accentScale (its own documented exception), so this
  // falls back to the platform accent rather than reading a scale that
  // was deliberately never declared.
  ensureProductsRegistered();
  const accent = productRegistry.getBySlug(product.slug)?.theme?.accentScale?.base ?? "var(--primary)";

  return (
    <>
      {/* Hero. One claim, one button, and the screen doing the thing.
          "Free" is stated as a fact rather than shouted: this page is
          reached by people who already know it is free, from an ad, a
          search result or the Shop's own band. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-14 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">
                Free, and not a trial
              </p>
              <h1 className="mt-3 font-serif text-[38px] font-semibold leading-[1.08] tracking-tight sm:text-[46px] lg:text-[52px]">
                Know what is actually safe to spend.
              </h1>
              <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
                {product.promise}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button href={`/app/activate/${product.slug}`} size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
                  Start free
                </Button>
                <p className="text-[13px] text-[var(--faint)]">
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
                    <span className="text-[13.5px] leading-relaxed text-[var(--muted)]">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The same gallery every paid product page opens with, so the
                free product is presented as a peer of the paid ones rather
                than as a lesser thing in a different shape. It is the one
                place the two tiers should look identical: the difference
                between them is the price, not the seriousness. */}
            <ProductGallery slug={product.slug} title={product.title} accent={accent} />
          </div>
        </Container>
      </section>

      {/* What it solves, in the reader's words. Straight from the
          listing's problemsSolved, so this can never drift from the Shop
          or the Library manual. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <h2 className="max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
            What it takes off your plate.
          </h2>
          <ul role="list" className="mt-10 grid gap-5 sm:grid-cols-2">
            {product.problemsSolved.map((pair) => (
              <li
                key={pair.problem}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
              >
                <p className="text-[14px] font-semibold leading-snug text-[var(--text)]">{pair.problem}</p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{pair.solution}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How it actually works, so nobody has to guess at the shape of
          the thing before making an account. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <h2 className="max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
            How it works.
          </h2>
          <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {product.howItWorks.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="mt-0.5 shrink-0 font-serif text-[20px] font-semibold leading-none text-[var(--faint)]">
                  {index + 1}
                </span>
                <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">{step}</p>
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
            <h2 className="max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
              Before you start.
            </h2>
            <dl className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
              {deciding.map((entry) => (
                <div key={entry.question}>
                  <dt className="text-[14.5px] font-semibold leading-snug text-[var(--text)]">{entry.question}</dt>
                  <dd className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{entry.answer}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      {/* The graduation, said once and only at the end.
          Not a paywall and not an upsell for something this product is
          missing: it names the boundary this product deliberately has,
          which is exactly what its own audienceExclusions already say,
          and points at the product whose job that is. Somebody who never
          hits that boundary never needs the other one, and this page
          says so. */}
      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">
            When you outgrow it
          </p>
          <h2 className="mt-3 font-serif text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            It handles one cycle at a time, on purpose.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            That is the whole design, not a limitation waiting to be lifted. Most people never need more than it.
            If you find yourself wanting subscriptions, debt and savings held alongside the rest, that is a different
            product rather than a bigger version of this one, and it is there when you want it.
          </p>
          <div className="mt-7">
            <Link
              href="/shop/personal-finance-companion"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
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
          <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
            Start with the number that matters.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
            Free, complete, and yours to keep. If it is not for you, nothing was spent finding out.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href={`/app/activate/${product.slug}`} size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              Start free
            </Button>
            <Link href="/shop" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              See the paid Companions
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
