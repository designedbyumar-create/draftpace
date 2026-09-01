"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PlatformShell, { InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import EmptyState from "@/design-system/EmptyState";
import Button from "@/design-system/Button";
import Badge from "@/design-system/Badge";
import { ArrowRight, WarningCircle } from "@/design-system/Icon";
import { familyRegistry } from "@/product-framework/families";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts, type OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { ensureProductsRegistered } from "@/products/manifest";

/**
 * Platform Home answers one question: "what should I do next?" with one
 * dominant action. It renders a single state-aware focal block chosen from the
 * user's most relevant owned product, then a quiet remainder. Sections with no
 * content (attention, notifications) are not rendered at all, rather than
 * reserved as empty rectangles. See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §9.
 *
 * Ownership comes from entitlements, not product_instances — see
 * deriveOwnedProducts.ts for how a read failure at any layer degrades a row
 * instead of ever hiding it.
 */

const BEHIND_AFTER_DAYS = 10;

type FocalState = "none" | "degraded" | "not-started" | "setup" | "active" | "behind" | "completed";

function focalStateFor(row: OwnedProductRow | null): FocalState {
  if (!row) return "none";
  if (row.kind !== "ready") return "degraded";
  if (!row.instance) return "not-started";
  if (row.instance.lifecycleState === "completed") return "completed";
  if (!row.instance.setupComplete) return "setup";
  const ageDays = (Date.now() - new Date(row.instance.lastActivityAt).getTime()) / 86_400_000;
  return ageDays > BEHIND_AFTER_DAYS ? "behind" : "active";
}

export default function AppHomePage() {
  const user = useSession();
  const [rows, setRows] = useState<OwnedProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const firstName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "there").split(" ")[0];

  useEffect(() => {
    ensureProductsRegistered();
    let cancelled = false;

    Promise.all([listMyEntitlements(), listMyProductInstances()]).then(([entitlementsResult, instancesResult]) => {
      if (cancelled) return;

      if (entitlementsResult.status === "error") {
        setLoadError(entitlementsResult.message);
        setRows(null);
        return;
      }

      setLoadError(null);
      setRows(deriveOwnedProducts(entitlementsResult.rows, instancesResult));
    });

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const retry = () => setRetryToken((t) => t + 1);
  const focalRow = rows?.[0] ?? null;
  const rest = rows?.slice(1) ?? [];

  return (
    <PlatformShell>
      {rows === null && !loadError ? (
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      ) : loadError ? (
        <EmptyState
          icon={WarningCircle}
          title="Couldn't load your home"
          description="Your access hasn't changed. This was just a read failure, check your connection and try again."
          action={
            <Button size="md" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          <FocalBlock row={focalRow} firstName={firstName} onRetry={retry} />

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                Also in your library
              </h2>
              <div className="grid gap-2.5">
                {rest.map((row) => (
                  <LibraryLink key={row.productSlug} row={row} onRetry={retry} />
                ))}
              </div>
            </section>
          )}

          <InstallPromptCard />
        </div>
      )}
    </PlatformShell>
  );
}

type FocalAction = { label: string; href: string } | { label: string; onClick: () => void };

/** The one dominant thing on the screen, composed per the user's current state. */
function FocalBlock({
  row,
  firstName,
  onRetry,
}: {
  row: OwnedProductRow | null;
  firstName: string;
  onRetry: () => void;
}) {
  const state = focalStateFor(row);

  // No owned products yet: a warm invitation to find the first one.
  if (state === "none" || !row) {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title="Find your first product"
        body="Every product here is built around one specific problem and stays with you. Start with something free."
        primary={{ label: "Browse the Store", href: "/shop" }}
      />
    );
  }

  if (state === "degraded") {
    const title = row.kind === "progress-unavailable" ? row.definition.title : row.productSlug;
    return (
      <FocalShell
        eyebrow="Couldn't load this product"
        title={title}
        body="This was just a read failure, not a sign anything's missing. Try again."
        primary={{ label: "Try again", onClick: onRetry }}
      />
    );
  }

  if (row.kind !== "ready") return null; // unreachable: state is only "degraded" when row.kind !== "ready"

  const { definition } = row;
  const family = familyRegistry.get(definition.family);
  const title = definition.title;

  if (state === "not-started") {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title={`Start ${title}`}
        body="You already own this. Jump in whenever you're ready."
        primary={{ label: `Start ${title}`, href: `/app/products/${definition.slug}` }}
        familyLabel={family?.label}
      />
    );
  }

  // row.instance is guaranteed for every remaining state.
  const instance = row.instance!;
  const destination = resolveProductDestination(definition, instance);

  if (state === "setup") {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title={`Pick up where you left off: finish setting up ${title}`}
        body="You are a few short steps from your first result. It saves as you go, so you can stop and come back anytime."
        primary={{ label: "Continue setup", href: destination }}
        familyLabel={family?.label}
      />
    );
  }

  if (state === "completed") {
    return (
      <FocalShell
        eyebrow="Finished this cycle"
        title={`Review ${title}`}
        body="This cycle is closed. Look back at how it went, or start the next one."
        primary={{ label: "Review results", href: destination }}
        familyLabel={family?.label}
        badge={<Badge tone="success">Completed</Badge>}
      />
    );
  }

  if (state === "behind") {
    return (
      <FocalShell
        eyebrow="Welcome back"
        title={`Welcome back to ${title}`}
        body="It has been a little while. A few things may have changed. Update what is different, or just pick up where you left off."
        primary={{ label: "Update what changed", href: destination }}
        secondary={{ label: "Just continue", href: destination }}
        familyLabel={family?.label}
      />
    );
  }

  // active
  return (
    <FocalShell
      eyebrow={`Good to see you, ${firstName}`}
      title={`Continue ${title}`}
      body={instance.nextActionLabel ? `Your next move: ${instance.nextActionLabel}.` : "Pick up right where you left off."}
      primary={{ label: `Open ${title}`, href: destination }}
      familyLabel={family?.label}
    />
  );
}

/** Shared composition for the focal block: a genuine hero, not a list row. */
function FocalShell({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  familyLabel,
  badge,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: FocalAction;
  secondary?: FocalAction;
  familyLabel?: string;
  badge?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[shadow:var(--shadow-soft)] sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
        {familyLabel && <span className="text-[12px] text-[var(--faint)]">· {familyLabel}</span>}
        {badge}
      </div>
      <h1 className="mt-3 max-w-xl text-[24px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[28px]">
        {title}
      </h1>
      <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FocalActionButton action={primary} size="lg" iconRight={<ArrowRight size={16} aria-hidden />} />
        {secondary && <FocalActionButton action={secondary} size="lg" variant="ghost" />}
      </div>
    </section>
  );
}

function FocalActionButton({
  action,
  size,
  variant,
  iconRight,
}: {
  action: FocalAction;
  size: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  iconRight?: React.ReactNode;
}) {
  if ("href" in action) {
    return (
      <Button href={action.href} size={size} variant={variant} iconRight={iconRight}>
        {action.label}
      </Button>
    );
  }
  return (
    <Button onClick={action.onClick} size={size} variant={variant} iconRight={iconRight}>
      {action.label}
    </Button>
  );
}

/** A quiet secondary owned-product link, used only when more than one is owned. */
function LibraryLink({ row, onRetry }: { row: OwnedProductRow; onRetry: () => void }) {
  if (row.kind !== "ready") {
    const title = row.kind === "progress-unavailable" ? row.definition.title : row.productSlug;
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
        <p className="text-[14px] font-semibold text-[var(--text)]">{title}</p>
        <button type="button" onClick={onRetry} className="text-[13px] font-semibold text-[var(--primary)] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  const { definition, instance } = row;
  const destination = instance ? resolveProductDestination(definition, instance) : `/app/products/${definition.slug}`;

  return (
    <Link
      href={destination}
      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
    >
      <p className="text-[14px] font-semibold text-[var(--text)]">{definition.title}</p>
      <ArrowRight size={14} className="text-[var(--faint)]" aria-hidden />
    </Link>
  );
}
