"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import { formatCurrency } from "@/lib/currency";
import { iconForProduct } from "@/product-framework/productIcons";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { humanStatus } from "@/product-framework/ownedProductPresentation";
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
  const Icon = iconForProduct(definition.slug);

  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;
  const status = instance ? humanStatus(instance) : "Not started yet";
  const needsSetup = !instance || !instance.setupComplete;
  const actionLabel = !instance ? "Start" : !instance.setupComplete ? "Finish setup" : "Open";

  const figure =
    summary && summary.valueMinorUnits !== null && summary.currency
      ? formatCurrency(summary.valueMinorUnits, summary.currency)
      : null;

  return (
    <motion.div
      className={wide ? "sm:col-span-2" : undefined}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Link
        href={destination}
        className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)] transition-[box-shadow,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-soft)] ${
          wide ? "flex items-center justify-between gap-6" : "flex h-full flex-col"
        }`}
      >
        <div className={wide ? "min-w-0 flex-1" : "contents"}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
              <Icon size={15} aria-hidden />
            </span>
            <p className="min-w-0 truncate text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
              {definition.title}
            </p>
            {needsSetup && <Badge tone="neutral">{status}</Badge>}
          </div>

          {figure ? (
            <>
              <p className="mt-3.5 font-serif text-[30px] font-semibold leading-none tracking-tight text-[var(--text)]">
                {figure}
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--muted)]">{summary!.headline}</p>
            </>
          ) : (
            <p className="mt-3.5 text-[16.5px] font-medium leading-snug text-[var(--text)]">
              {summary?.headline ?? (needsSetup ? "A few steps from your first result" : status)}
            </p>
          )}

          {summary?.supporting && (
            <p className="mt-2 text-[12.5px] leading-5 text-[var(--faint)]">{summary.supporting}</p>
          )}
        </div>

        <span
          className={`inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] ${
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
