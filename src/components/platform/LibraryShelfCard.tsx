"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen } from "@/design-system/Icon";
import Badge, { type BadgeTone } from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { familyRegistry } from "@/product-framework/families";
import { iconForProduct } from "@/product-framework/productIcons";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { boughtStartedLine, humanStatus } from "@/product-framework/ownedProductPresentation";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";

/**
 * One product on the Library shelf.
 *
 * Deliberately the opposite shape from Home's ProductSummaryTile. Home
 * asks "what does this product say about my life right now", so it leads
 * with a sentence or a figure and demotes the product's name to a label.
 * Library asks "what is this thing I own, and how do I get more out of
 * it" — so it leads with the product's real screens, gives its name and
 * promise the full weight, and offers two genuinely different doors:
 * open it, or read its manual.
 *
 * The preview is the same set of hand-built screens the Shop card cycles
 * through (see productScreens.tsx), passed in as an already-rendered node
 * so this component never has to know which product it is drawing.
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  "In progress": "primary",
  "Setup not finished": "neutral",
  Paused: "warning",
  Finished: "success",
  Archived: "neutral",
};

export default function LibraryShelfCard({
  row,
  promise,
  areaLabel,
  preview,
}: {
  row: Extract<OwnedProductRow, { kind: "ready" }>;
  /** The product's own one-line promise, from its Shop listing. Null when it has no published listing. */
  promise: string | null;
  /** The life area this product belongs to, when it is in one. */
  areaLabel: string | null;
  /** Its real screens, pre-rendered. Null falls back to the product's icon rather than a fabricated image. */
  preview: ReactNode | null;
}) {
  const reduceMotion = useReducedMotion();
  const { definition, instance, entitlement } = row;
  const family = familyRegistry.get(definition.family);
  const Icon = iconForProduct(definition.slug);

  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;
  const status = instance ? humanStatus(instance) : "Not started yet";
  const openLabel = !instance ? "Start" : !instance.setupComplete ? "Finish setup" : "Open";

  return (
    <motion.article
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[shadow:var(--shadow-xs)] transition-[box-shadow,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-soft)]"
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {/* The shelf's spine: a real screen from the product, not a stock image. */}
      <div className="relative h-[178px] overflow-hidden border-b border-[var(--border)] bg-[var(--surface-sunken)]">
        {preview ?? (
          <div className="flex h-full items-center justify-center text-[var(--faint)]">
            <Icon size={34} aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
            <Icon size={13} aria-hidden />
          </span>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--faint)]">
            {areaLabel ?? family?.label ?? definition.family}
          </p>
          {STATUS_TONE[status] && <Badge tone={STATUS_TONE[status]}>{status}</Badge>}
        </div>

        <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-[var(--text)]">
          {definition.title}
        </h3>

        {promise && <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-[var(--muted)]">{promise}</p>}

        <p className="mt-3 text-[12px] text-[var(--faint)]">{boughtStartedLine(entitlement, instance)}</p>

        {/* Two genuinely different doors, not one action and a decoration:
            get on with it, or learn to get more out of it. */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
          <Button href={destination} size="sm" iconRight={<ArrowRight size={14} aria-hidden />}>
            {openLabel}
          </Button>
          <Button
            href={`/app/library/${definition.slug}`}
            size="sm"
            variant="secondary"
            iconLeft={<BookOpen size={14} aria-hidden />}
          >
            How to use it
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
