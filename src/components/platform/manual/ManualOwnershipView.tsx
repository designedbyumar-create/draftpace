"use client";

import Button from "@/design-system/Button";
import Badge, { type BadgeTone } from "@/design-system/Badge";
import Alert, { type AlertTone } from "@/design-system/Alert";
import { ArrowRight } from "@/design-system/Icon";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { humanDate, humanStatus } from "@/product-framework/ownedProductPresentation";
import type { OwnedProductRow } from "@/product-framework/deriveOwnedProducts";

/**
 * The one live part of a companion page: where this reader actually
 * stands with this product, and the way in. Lives directly in the page's
 * own hero now, not a separate boxed "ownership bar" underneath it — this
 * is the screen somebody lands on right after buying, so what it owns and
 * what to do next has to be the obvious, immediate point of the page, not
 * a quiet strip below the fold.
 *
 * "In progress" gets no badge — every continuous Companion sits in that
 * state forever, so badging it says nothing a reader doesn't already
 * know. Every other status gets a badge AND, where it changes what the
 * reader should actually do, a real callout explaining it — a badge alone
 * ("Setup not finished") names the state; the callout says what finishing
 * it gets you and points at the way there.
 */
const STATUS_TONE: Record<string, BadgeTone> = {
  "Not started yet": "neutral",
  "Setup not finished": "warning",
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
  productTitle,
}: {
  ownership: Ownership;
  productSlug: string;
  productTitle: string;
}) {
  // No reserved rectangle while loading — the bar appears when it has
  // something true to say, rather than flashing a skeleton of itself.
  if (ownership.state === "loading") return null;

  if (ownership.state === "not-owned") {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-body-sm text-[var(--muted)]">You don&apos;t own this one yet.</p>
        <Button href={`/shop/${productSlug}`} size="md" variant="secondary" iconRight={<ArrowRight size={14} aria-hidden />}>
          See {productTitle} in the Store
        </Button>
      </div>
    );
  }

  if (ownership.state === "unavailable") {
    return (
      <Alert tone="info">Couldn&apos;t check where you are with this right now. Everything on this page is still accurate.</Alert>
    );
  }

  const { definition, instance, entitlement } = ownership.row;
  const status = instance ? humanStatus(instance) : "Not started yet";
  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;
  // Named, not generic: "Open Homeschooling Companion" says what's about
  // to happen on a page that's entirely about this one product — "Open
  // it" made sense inside a list of many, not as the single biggest
  // button on a page that already says the name once in the title.
  const openLabel = !instance ? `Start ${productTitle}` : !instance.setupComplete ? `Finish setting up ${productTitle}` : `Open ${productTitle}`;

  // What, if anything, needs saying before the button — never both an
  // alert and silence: a setup gap or a paused product is exactly the
  // "critical info missing" a reader should never have to dig for.
  let alert: { tone: AlertTone; message: string } | null = null;
  if (instance && !instance.setupComplete) {
    alert = { tone: "warning", message: "Setup isn't finished — finish it to see your real numbers." };
  } else if (instance?.pausedAt) {
    alert = { tone: "warning", message: "This is paused. Resume it from Settings whenever you're ready." };
  } else if (status === "Finished") {
    alert = { tone: "success", message: "This cycle is closed. Look back at how it went, or start the next one." };
  } else if (status === "Archived") {
    alert = { tone: "info", message: "This cycle was archived without closing." };
  } else if (instance?.nextActionLabel) {
    alert = { tone: "info", message: `Next: ${instance.nextActionLabel}` };
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2.5">
        {STATUS_TONE[status] && <Badge tone={STATUS_TONE[status]}>{status}</Badge>}
        <span className="text-caption text-[var(--faint)]">Added {humanDate(entitlement.grantedAt)}</span>
      </div>

      {alert && <Alert tone={alert.tone}>{alert.message}</Alert>}

      <Button href={destination} variant="commit" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
        {openLabel}
      </Button>
    </div>
  );
}
