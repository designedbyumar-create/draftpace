"use client";

import Button from "@/design-system/Button";
import Badge, { type BadgeTone } from "@/design-system/Badge";
import { ArrowRight } from "@/design-system/Icon";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { boughtStartedLine, humanStatus } from "@/product-framework/ownedProductPresentation";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";

/**
 * How a manual's ownership bar looks, given a resolved answer — kept
 * apart from the loading of that answer (ManualOwnershipBar) so the four
 * states can be rendered and checked without a Supabase session standing
 * behind them.
 *
 * A manual is readable whether or not you own the product (its content is
 * the same content the Shop shows publicly), so "you don't own this" is a
 * real state with its own way forward, not an error and not a locked door.
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  "In progress": "primary",
  "Setup not finished": "neutral",
  Paused: "warning",
  Finished: "success",
  Archived: "neutral",
};

export type Ownership =
  | { state: "loading" }
  | { state: "not-owned" }
  | { state: "unavailable" }
  | { state: "owned"; row: Extract<OwnedProductRow, { kind: "ready" }> };

export default function ManualOwnershipView({
  ownership,
  productSlug,
}: {
  ownership: Ownership;
  productSlug: string;
}) {
  // No reserved rectangle while loading — the bar appears when it has
  // something true to say, rather than flashing a skeleton of itself.
  if (ownership.state === "loading") return null;

  if (ownership.state === "not-owned") {
    return (
      <Frame>
        <p className="text-[13.5px] text-[var(--muted)]">You don&apos;t own this one yet.</p>
        <Button href={`/shop/${productSlug}`} size="sm" variant="secondary" iconRight={<ArrowRight size={14} aria-hidden />}>
          See it in the Store
        </Button>
      </Frame>
    );
  }

  if (ownership.state === "unavailable") {
    return (
      <Frame>
        <p className="text-[13.5px] text-[var(--muted)]">
          Couldn&apos;t check where you are with this right now. Everything below is still accurate.
        </p>
      </Frame>
    );
  }

  const { definition, instance, entitlement } = ownership.row;
  const status = instance ? humanStatus(instance) : "Not started yet";
  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;
  const openLabel = !instance ? "Start it" : !instance.setupComplete ? "Finish setup" : "Open it";

  return (
    <Frame>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TONE[status] && <Badge tone={STATUS_TONE[status]}>{status}</Badge>}
          <span className="text-[12.5px] text-[var(--faint)]">{boughtStartedLine(entitlement, instance)}</span>
        </div>
        {instance?.nextActionLabel && instance.setupComplete && (
          <p className="mt-1.5 text-[13.5px] text-[var(--muted)]">Next: {instance.nextActionLabel}</p>
        )}
      </div>
      <Button href={destination} size="sm" iconRight={<ArrowRight size={14} aria-hidden />}>
        {openLabel}
      </Button>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 shadow-[shadow:var(--shadow-xs)]">
      {children}
    </div>
  );
}
