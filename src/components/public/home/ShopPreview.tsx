import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { discountPercent, formatCompareAtPrice, formatPrice, type ShopProduct } from "@/shop/definition";
import { LIFE_AREAS } from "@/content/areas";

/**
 * The Companion Series, on the homepage.
 *
 * What this replaces: a bordered list with no prices on it, where the
 * first published product was arbitrarily "featured" at double size for
 * no reason other than being first in the registry, and the six others
 * showed their `problem` paragraph in a flat grey grid. Nothing on it
 * carried a price, a colour, or any signal of which part of life a
 * product was for, so the section that is supposed to sell the shelf was
 * the least informative one on the page.
 *
 * Now every product is an equal card carrying the three things somebody
 * actually decides on: which part of life it is for, what it promises,
 * and what it costs.
 *
 * The area colour is spent deliberately rather than constantly. At rest
 * each card is a plain surface with its area named in that area's hue,
 * one small mark; seven permanent pastel blocks side by side read as a
 * chart rather than a shelf. Hover washes the whole card to that area's
 * colour instead, which is quieter than a lift plus a shadow and says
 * more, since it tells you what the card is filed under. The hues are
 * --area-* from globals.css, the same ones the guides layer already
 * uses, so an area looks like itself everywhere on the site.
 *
 * Price rendering goes through the same three helpers the Shop grid and
 * the product page use (formatPrice / formatCompareAtPrice /
 * discountPercent), so the homepage can never quote a different number
 * from the page it links to.
 */

/** Product slug to the life area that owns it, from the one ordered source. */
const AREA_BY_PRODUCT = new Map(
  LIFE_AREAS.flatMap((area) => area.productSlugs.map((slug) => [slug, area] as const))
);

export default function ShopPreview() {
  const products = shopRegistry.listPublished();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center sm:p-10">
        <p className="text-[15px] leading-relaxed text-[var(--muted)]">
          Nothing is published in the store yet. The first products are still being made, and this page will
          show them the moment they&apos;re ready.
        </p>
        <Link href="/help-with" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
          See what kind of help is coming
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
    );
  }

  // Ordered by life area rather than by registry insertion, matching the
  // Shop and Need help. Anything no area claims still appears, at the end.
  const ordered = [
    ...LIFE_AREAS.flatMap((area) => area.productSlugs.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is ShopProduct => Boolean(p))),
    ...products.filter((p) => !AREA_BY_PRODUCT.has(p.slug)),
  ];

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {ordered.map((product) => (
          <li key={product.slug}>
            <SeriesCard product={product} />
          </li>
        ))}
      </ul>

      <Link href="/shop" className="self-start inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
        Browse the whole series
        <ArrowRight size={13} aria-hidden />
      </Link>
    </div>
  );
}

function SeriesCard({ product }: { product: ShopProduct }) {
  const area = AREA_BY_PRODUCT.get(product.slug);
  const priceLabel = formatPrice(product);
  const compareAtLabel = formatCompareAtPrice(product);
  const savings = discountPercent(product);

  // The card's own accent pair. A product no area claims falls back to
  // the series accent, which is the shelf itself, rather than to nothing.
  const accent = area ? `var(--area-${area.slug})` : "var(--area-series)";
  const accentSoft = area ? `var(--area-${area.slug}-soft)` : "var(--area-series-soft)";

  return (
    <Link
      href={`/shop/${product.slug}`}
      // The area's colour pair is passed as data rather than baked into
      // classes, because it varies per card. .card-tint (globals.css)
      // keeps the card an ordinary surface at rest and washes the whole
      // thing to --card-tint on hover. No lift, no shadow.
      style={{ "--card-tint": accentSoft, "--card-accent": accent } as React.CSSProperties}
      className="card-tint group flex h-full flex-col rounded-2xl border border-[var(--border)] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        {/* The one spot of colour at rest, and it is doing a job: it says
            which part of life this is filed under. */}
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
          {area?.label ?? "The Series"}
        </span>
        {product.access === "free" && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--success)]">Free</span>
        )}
      </div>

      <h3 className="mt-2.5 text-[16px] font-semibold leading-snug tracking-tight text-[var(--text)]">
        {product.title}
      </h3>
      <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

      <div className="mt-4 flex flex-1 items-end justify-between gap-3 pt-3.5">
        <div className="flex flex-wrap items-baseline gap-2">
          {compareAtLabel && (
            <span className="font-serif text-[14px] text-[var(--faint)] line-through">{compareAtLabel}</span>
          )}
          <span className="font-serif text-[20px] font-semibold leading-none tracking-tight text-[var(--text)]">
            {priceLabel}
          </span>
          {savings !== null && savings > 0 && (
            <span className="text-[10px] font-bold text-[var(--success)]">Save {savings}%</span>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[var(--primary)]">
          See it
          <ArrowRight size={13} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
