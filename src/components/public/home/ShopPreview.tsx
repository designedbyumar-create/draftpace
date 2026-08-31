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
 * actually decides on: which part of life it is for (its life area, as a
 * pastel wash and a label), what it promises, and what it costs. The
 * pastel is the product's own area accent from --area-* in globals.css,
 * the same hues the guides layer already uses for the same six areas, so
 * an area looks like itself everywhere on the site.
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-xs)] transition duration-[var(--dur-fast)] hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-soft)]"
    >
      {/* The pastel wash. Tinted by area, and the only place colour is
          spent on this card, so the price and the title stay the things
          that read first. */}
      <div className="px-5 pb-4 pt-5" style={{ background: accentSoft }}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: accent }}>
            {area?.label ?? "The Series"}
          </span>
          {product.access === "free" ? (
            <span className="rounded-full bg-[var(--surface)]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>
              Free
            </span>
          ) : null}
        </div>
        <h3 className="mt-2.5 text-[16px] font-semibold leading-snug tracking-tight text-[var(--text)]">
          {product.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-3 text-[13px] leading-relaxed text-[var(--muted)]">{product.promise}</p>

        <div className="mt-4 flex flex-1 items-end justify-between gap-3 border-t border-[var(--border)] pt-3.5">
          <div className="flex flex-wrap items-baseline gap-2">
            {compareAtLabel && (
              <span className="font-serif text-[14px] text-[var(--faint)] line-through">{compareAtLabel}</span>
            )}
            <span className="font-serif text-[20px] font-semibold leading-none tracking-tight text-[var(--text)]">
              {priceLabel}
            </span>
            {savings !== null && savings > 0 && (
              <span className="rounded-full bg-[var(--success-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--success)]">
                Save {savings}%
              </span>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[var(--primary)]">
            See it
            <ArrowRight size={13} className="transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}
