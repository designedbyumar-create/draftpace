"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import { cardHighlight, discountPercent, formatCompareAtPrice, formatPrice, type ShopProduct } from "@/shop/definition";
import AddToLibraryButton from "./AddToLibraryButton";

export interface ShopFilterArea {
  slug: string;
  label: string;
  situation: string;
}

export interface ShopGridEntry {
  product: ShopProduct;
  /** Null only for the defensive case of a published product no area claims. */
  areaSlug: string | null;
  areaLabel: string | null;
  /** Rendered server-side (it's a real phone mockup, not a route module), handed down as a prop. */
  thumbnail: ReactNode;
}

const DEFAULT_SITUATION = "Every Companion, one screen. Pick an area below to narrow it down.";

/**
 * The Shop's filter bar and product shelf.
 *
 * Replaces what used to be six stacked sections, each repeating an area
 * heading and its situation paragraph before showing two or three cards.
 * That read fine the first time and became repetitive scrolling on every
 * visit after. This is one continuous shelf instead: every product still
 * names its own area above its title, so context isn't lost, but
 * narrowing to one area is now something a visitor chooses rather than
 * something the page always does for them. Nothing is preselected, same
 * reasoning as Ask DP's browse view: the default is everything, the way a
 * shelf actually looks before anyone touches it.
 */
export default function ShopGrid({ entries, areas }: { entries: ShopGridEntry[]; areas: ShopFilterArea[] }) {
  const [activeArea, setActiveArea] = useState<string>("all");

  const visible = entries.filter((entry) => activeArea === "all" || entry.areaSlug === activeArea);
  const situation = activeArea === "all" ? DEFAULT_SITUATION : (areas.find((a) => a.slug === activeArea)?.situation ?? DEFAULT_SITUATION);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by area of life">
        <FilterChip label="All Companions" active={activeArea === "all"} onClick={() => setActiveArea("all")} />
        {areas.map((area) => (
          <FilterChip key={area.slug} label={area.label} active={activeArea === area.slug} onClick={() => setActiveArea(area.slug)} />
        ))}
      </div>
      <p className="mt-3.5 text-[13.5px] italic leading-relaxed text-[var(--faint)]">{situation}</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => (
          <ShopProductCard key={entry.product.slug} entry={entry} />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-[13px] text-[var(--faint)]">Nothing in this area yet. Try a different one, or see everything.</p>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      // Brand ink rather than raw --text, matching the homepage's own
      // area chips exactly. Both are the same control doing the same job
      // and now look it. See --brand-ink in globals.css.
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? "border-[var(--brand-ink)] bg-[var(--brand-ink)] text-[var(--brand-ink-contrast)]"
          : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand-ink)] hover:text-[var(--text)]"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * One marketplace-grade card, used for every listing regardless of
 * category size or free/paid status. Free and a real price render in
 * the same dedicated price row, same weight, same position, on every
 * card, and get exactly one matched primary action each: "Add to your
 * library, free" or "Get it, $N" (the same two labels GetAction already
 * uses on the product page itself, not a second, differently-worded
 * pair invented for the grid). Neither is a soft "Learn more" link
 * standing in for a real action - that stays, but as the secondary one.
 */
function ShopProductCard({ entry }: { entry: ShopGridEntry }) {
  const { product, areaLabel, thumbnail } = entry;
  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savingsPercent = discountPercent(product);
  const firstOutcome = cardHighlight(product);

  return (
    /*
      Depth is the whole difference between a listing and a product.
      A flat outlined rectangle that changes its border colour on hover
      reads as a row in a table; a card that sits slightly above the page
      and rises when you reach for it reads as an object. Rest is a hair
      of shadow, hover is a real one plus a 2px lift, and the picture
      inside grows very slightly so the movement starts at the thing
      being sold rather than at its frame. All of it collapses under
      prefers-reduced-motion, which globals.css already handles for
      transition durations globally.
    */
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-xs)] transition-[box-shadow,border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-soft)]">
      {/*
        The thumbnail is a store image: a caption across the top, a
        centred phone filling the middle, a wordmark bottom-left. There
        is no corner of it a floating pill can sit in without landing on
        one of those, which is what the area tag used to do, so the tag
        moved out of the picture and into the card body as an eyebrow
        above the title. Nothing overlaps, and it is legible at the size
        it actually renders.
      */}
      <Link href={`/shop/${product.slug}`} aria-label={`See ${product.title} in detail`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <div className="absolute inset-0 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.025]">
          {thumbnail}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {areaLabel && (
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--faint)]">{areaLabel}</p>
        )}
        {(product.availability === "coming-soon" || product.devFixture) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
            {product.devFixture && <Badge tone="neutral">Internal preview</Badge>}
          </div>
        )}
        {/* Serif, like the store image's own title and like the product
            page it opens: the card is a small version of that page, not
            a different typographic world. */}
        <Link
          href={`/shop/${product.slug}`}
          className="block font-serif text-[19px] font-semibold leading-[1.25] tracking-[-0.01em] text-[var(--text)] decoration-[var(--border-strong)] underline-offset-4 hover:underline"
        >
          {product.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

        {/*
          A hairline and a line of text, not a grey slab with a green
          tick. The tick claimed this was a feature checklist when it is
          one sentence about what you end up with, and nine grey slabs
          down a grid is the single heaviest thing on the page.
        */}
        {firstOutcome && (
          <p className="mt-3.5 border-l-2 border-[var(--border-strong)] pl-3 text-[12.5px] leading-relaxed text-[var(--text)]">
            {firstOutcome}
          </p>
        )}

        {/*
          Grows so the price and the button land on the same line across
          the row whatever the promise and the claim above them ran to.
          A grid whose CTAs sit at three different heights is the tell
          that these are nine separate pages rather than one shelf.
        */}
        <div className="min-h-4 flex-1" aria-hidden />

        {product.availability !== "coming-soon" && (
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t border-[var(--border)] pt-4">
            <p className="font-serif text-[26px] font-semibold leading-none tracking-tight text-[var(--text)]">{priceLabel}</p>
            {compareAtLabel && <span className="text-[13px] text-[var(--faint)] line-through">{compareAtLabel}</span>}
            {/*
              The saving stays, because it is true and it is the offer,
              but as type rather than a filled pill: nine green capsules
              down a grid read as a coupon site, which is the opposite of
              what this catalogue is meant to feel like.
            */}
            {savingsPercent !== null && savingsPercent > 0 && (
              <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[var(--success)]">
                {savingsPercent}% off
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col items-stretch gap-2.5">
          <CardCta product={product} priceLabel={priceLabel} />
        </div>
      </div>
    </div>
  );
}

/**
 * Two distinct actions, never one link doing double duty. The primary
 * button always commits to something real: a free product goes
 * straight into the visitor's library, a paid one goes to the page
 * where the actual purchase happens. "Learn more" only ever navigates.
 * On a coming-soon listing there's nothing to commit to yet, so it's
 * the only action shown, same as before.
 */
function CardCta({ product, priceLabel }: { product: ShopProduct; priceLabel: string }) {
  if (product.availability === "coming-soon") {
    return (
      <Link href={`/shop/${product.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
        Learn more
        <ArrowRight size={14} aria-hidden />
      </Link>
    );
  }

  return (
    <>
      {product.access === "free" ? (
        <AddToLibraryButton slug={product.slug} label="Add to your library, free" size="sm" fullWidth />
      ) : (
        <Button href={`/shop/${product.slug}`} size="sm" fullWidth iconRight={<ArrowRight size={14} aria-hidden />}>
          Get it, {priceLabel}
        </Button>
      )}
      <Link
        href={`/shop/${product.slug}`}
        className="text-center text-[12.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
      >
        Learn more
      </Link>
    </>
  );
}
