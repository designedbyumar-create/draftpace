"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import ProductBadge from "@/components/platform/ProductBadge";
import { formatCurrency } from "@/lib/currency";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { humanStatus } from "@/product-framework/ownedProductPresentation";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";
import type { SharedProductSummary } from "@/product-framework/productSummary";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";

/**
 * One owned product on Home, told in that product's own words.
 *
 * The product's name is deliberately the small label, not the headline:
 * Home is framed around the person's life, and the product is how they
 * get there rather than the thing being announced. The headline slot is
 * whatever that product genuinely has to say right now — a real figure
 * where one exists (Safe to Spend, Available Money), otherwise the
 * sentence the product already shows on its own screen ("Your home is in
 * good shape", "Nothing needs you right now").
 *
 * When a product has no summary yet — still being set up, or its read
 * failed — the tile falls back to plain status rather than inventing
 * something to fill the space.
 */
type ReadyRow = Extract<OwnedProductRow, { kind: "ready" }>;

export default function ProductSummaryTile({
  row,
  summary,
  wide = false,
}: {
  row: ReadyRow;
  summary: SharedProductSummary | undefined;
  /** An area with only one product gets the full row rather than half of it, so a solo tile never sits beside dead space. */
  wide?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { definition, instance } = row;

  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;
  const status = instance ? humanStatus(instance) : "Not started yet";
  const needsSetup = !instance || !instance.setupComplete;
  const actionLabel = !instance ? "Start" : !instance.setupComplete ? "Finish setup" : "Open";

  const figure =
    summary && summary.valueMinorUnits !== null && summary.currency
      ? formatCurrency(summary.valueMinorUnits, summary.currency)
      : null;

  // Themed to its own product, same mechanism as Home's hero: the border
  // on hover, the "Open" link and the focus ring pick up that product's
  // real accent instead of one flat platform teal repeated across every
  // tile regardless of which of nine products it is. The icon carries
  // its own colour either way (ProductBadge sets that itself) — this is
  // what extends it to the rest of the card.
  const themeProps = { [PRODUCT_THEME_ATTRIBUTE]: "", style: productThemeStyle(definition.theme) };

  return (
    <motion.div
      className={`min-w-0 ${wide ? "sm:col-span-2" : ""}`}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Link
        href={destination}
        {...themeProps}
        className={`group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)] transition-[box-shadow,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--primary)] hover:shadow-[shadow:var(--shadow-soft)] ${
          wide ? "flex items-center gap-6" : "flex h-full flex-col"
        }`}
      >
        <div className={wide ? "shrink-0" : "mb-3.5"}>
          <ProductBadge definition={definition} size="lg" />
        </div>

        <div className={wide ? "min-w-0 flex-1" : "contents"}>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="min-w-0 truncate text-eyebrow font-bold uppercase text-[var(--faint)]">
              {definition.title}
            </p>
            {needsSetup && <Badge tone="neutral">{status}</Badge>}
          </div>

          {figure ? (
            <>
              <p className="mt-2 text-heading font-serif font-semibold leading-none tracking-tight text-[var(--text)]">
                {figure}
              </p>
              <p className="mt-1.5 text-body-sm text-[var(--muted)]">{summary!.headline}</p>
            </>
          ) : summary?.headline ? (
            <p className="mt-2 text-body-lg font-medium leading-snug text-[var(--text)]">{summary.headline}</p>
          ) : needsSetup ? (
            <p className="mt-2 text-body-lg font-medium leading-snug text-[var(--text)]">A few steps from your first result</p>
          ) : null}

          {summary?.supporting && (
            <p className="mt-2 text-caption leading-5 text-[var(--faint)]">{summary.supporting}</p>
          )}
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 text-body-sm font-semibold text-[var(--primary)] transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-0.5 ${
            wide ? "" : "mt-auto pt-4"
          }`}
        >
          {actionLabel}
          <ArrowRight size={14} aria-hidden />
        </span>
      </Link>
    </motion.div>
  );
}
