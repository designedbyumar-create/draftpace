"use client";

import { Fragment, useState, type ReactNode } from "react";
import Link from "next/link";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight, Check } from "@/design-system/Icon";
import { discountPercent, formatCompareAtPrice, formatPrice, type ShopProduct } from "@/shop/definition";
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

const DEFAULT_SITUATION = "Seven Companions, one screen. Pick an area below to narrow it down.";

/**
 * The Shop's filter bar and product shelf.
 *
 * Replaces what used to be six stacked sections, each repeating an area
 * heading and its situation paragraph before showing two or three cards.
 * That read fine the first time and became repetitive scrolling on every
 * visit after. This is one continuous shelf instead: every product still
 * carries its own area tag on its thumbnail, so context isn't lost, but
 * narrowing to one area is now something a visitor chooses rather than
 * something the page always does for them. Nothing is preselected, same
 * reasoning as NeedHelpFinder: the default view is everything, the way a
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
  const firstOutcome = product.outcomes[0];

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-xs)] transition hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-md)]">
      {/*
        thumbnail crosses a component boundary: it's built once in
        ShopIndexPage (a real phone mockup, not a route module - see
        renderThumbnail) and handed down as a prop. Sitting it next to
        a second, locally-rendered sibling (the area tag) without an
        explicit key on each is exactly the shape that trips React's
        "list needs keys" check, even though neither one is really a
        list. Explicit keys on both settle it for good.
      */}
      <Link href={`/shop/${product.slug}`} aria-label={`See ${product.title} in detail`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        <div className="absolute inset-0">
          {areaLabel && (
            <span
              key="area-tag"
              className="absolute left-3 top-3 z-10 rounded-full bg-[var(--surface)]/92 px-2.5 py-1 text-[11px] font-bold tracking-wide text-[var(--text)] shadow-[shadow:var(--shadow-xs)] backdrop-blur"
            >
              {areaLabel}
            </span>
          )}
          <Fragment key="thumbnail">{thumbnail}</Fragment>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {(product.availability === "coming-soon" || product.devFixture) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
            {product.devFixture && <Badge tone="neutral">Internal preview</Badge>}
          </div>
        )}
        <Link href={`/shop/${product.slug}`} className="block text-[16px] font-semibold leading-snug tracking-tight text-[var(--text)] hover:underline">
          {product.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

        {firstOutcome && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--surface-muted)] px-3 py-2.5">
            <Check size={13} className="mt-0.5 shrink-0 text-[var(--success)]" aria-hidden />
            <p className="text-[12px] leading-relaxed text-[var(--text)]">{firstOutcome}</p>
          </div>
        )}

        {product.availability !== "coming-soon" && (
          <div className="mt-4 flex flex-wrap items-baseline gap-2 border-t border-[var(--border)] pt-3.5">
            {compareAtLabel && <span className="font-serif text-[15px] text-[var(--faint)] line-through">{compareAtLabel}</span>}
            <p className="font-serif text-[22px] font-semibold leading-none tracking-tight text-[var(--text)]">{priceLabel}</p>
            {savingsPercent !== null && savingsPercent > 0 && <Badge tone="success">Save {savingsPercent}%</Badge>}
          </div>
        )}

        <div className="mt-3.5 flex flex-1 items-end gap-3.5">
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
      <div className="flex-1">
        {product.access === "free" ? (
          <AddToLibraryButton slug={product.slug} label="Add to your library, free" size="sm" fullWidth />
        ) : (
          <Button href={`/shop/${product.slug}`} size="sm" fullWidth iconRight={<ArrowRight size={14} aria-hidden />}>
            Get it, {priceLabel}
          </Button>
        )}
      </div>
      <Link href={`/shop/${product.slug}`} className="shrink-0 text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
        Learn more
      </Link>
    </>
  );
}
