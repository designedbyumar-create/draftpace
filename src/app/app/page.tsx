"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import PlatformShell, { InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import EmptyState from "@/design-system/EmptyState";
import Button, { type ButtonVariant } from "@/design-system/Button";
import Badge from "@/design-system/Badge";
import Skeleton from "@/design-system/Skeleton";
import ProductBadge from "@/components/platform/ProductBadge";
import { ArrowRight, WarningCircle } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { listMyEntitlements } from "@/product-framework/entitlements";
import { listMyProductInstances } from "@/product-framework/instances";
import { deriveOwnedProducts, type OwnedProductRow } from "@/product-framework/deriveOwnedProducts";
import { resolveProductDestination } from "@/product-framework/resolveDestination";
import { loadTopAttentionItem, type SharedAttentionItem } from "@/product-framework/attentionAdapter";
import { listMyUpdates, type UpdateRow } from "@/product-framework/updates";
import { formatRelativeTime } from "@/lib/formatRelativeTime";
import DegradedProductRow from "@/components/platform/DegradedProductRow";
import ProductSummaryTile from "@/components/platform/ProductSummaryTile";
import { loadProductSummaries, type SharedProductSummary } from "@/product-framework/productSummary";
import { LIFE_AREAS } from "@/content/areas";
import { ensureProductsRegistered } from "@/products/manifest";
import type { ProductDefinition } from "@/product-framework/definition";
import { productThemeStyle, PRODUCT_THEME_ATTRIBUTE } from "@/product-framework/themeExtension";

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

type FocalState = "none" | "degraded" | "not-started" | "setup" | "active" | "behind" | "completed" | "needs-attention" | "paused";

function focalStateFor(row: OwnedProductRow | null, attentionItem: SharedAttentionItem | null): FocalState {
  if (!row) return "none";
  if (row.kind !== "ready") return "degraded";
  if (!row.instance) return "not-started";
  // Vacation mode wins over every other state once setup is done — a
  // paused product should never present as "Continue X" or "it's been a
  // while", the entire point of pausing it.
  if (row.instance.setupComplete && row.instance.pausedAt) return "paused";
  if (row.instance.lifecycleState === "completed") return "completed";
  if (!row.instance.setupComplete) return "setup";
  const ageDays = (Date.now() - new Date(row.instance.lastActivityAt).getTime()) / 86_400_000;
  const base = ageDays > BEHIND_AFTER_DAYS ? "behind" : "active";
  // A real, more urgent cross-product signal outranks routine setup
  // progress or "it's been a while" — but only for the product it
  // actually belongs to, never borrowed onto a different row.
  if (attentionItem && attentionItem.productSlug === row.productSlug && (base === "active" || base === "behind")) {
    return "needs-attention";
  }
  return base;
}

export default function AppHomePage() {
  const user = useSession();
  const reduceMotion = useReducedMotion();
  const [rows, setRows] = useState<OwnedProductRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [topAttentionItem, setTopAttentionItem] = useState<SharedAttentionItem | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<UpdateRow[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SharedProductSummary>>({});
  // Deliberately starts null, filled client-side only — same reasoning as
  // PlatformShell's own dayPart: the server (a fixed region) and the
  // visitor's own timezone can genuinely name a different calendar day
  // for the same instant, and rendering that mismatch on first paint is
  // a real hydration error, not a cosmetic one.
  const [today, setToday] = useState<string | null>(null);
  const firstName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "there").split(" ")[0];

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, []);

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

  // Separate from the load above on purpose: attention is enhancement on
  // top of Home's real render, so a slow or failed attention fetch must
  // never block or delay today's render of what's already known.
  useEffect(() => {
    if (!rows) return;
    let cancelled = false;
    loadTopAttentionItem(rows).then((item) => {
      if (!cancelled) setTopAttentionItem(item);
    });
    return () => {
      cancelled = true;
    };
  }, [rows]);

  // Each owned product's own summary line, loaded per product and
  // dropped silently on failure — same enhancement-not-blocking rule as
  // the attention load above, so a slow product never holds up Home.
  useEffect(() => {
    if (!rows) return;
    let cancelled = false;
    loadProductSummaries(rows).then((result) => {
      if (!cancelled) setSummaries(result);
    });
    return () => {
      cancelled = true;
    };
  }, [rows]);

  // Same "enhancement, never blocking" discipline as the attention effect
  // above — independent of rows/entitlements entirely, so a slow or
  // failed Updates fetch never delays Home's real render either.
  useEffect(() => {
    let cancelled = false;
    listMyUpdates().then((result) => {
      if (cancelled) return;
      if (result.status === "ok") setRecentUpdates(result.rows.slice(0, 5));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => setRetryToken((t) => t + 1);
  // The winning attention item can belong to a product other than the
  // most recently used one — when it does, that product's row becomes
  // the focal block instead of rows[0] (see attentionAdapter.ts's own
  // "scan every owned product" reasoning).
  const attentionRow = topAttentionItem ? rows?.find((row) => row.productSlug === topAttentionItem.productSlug) ?? null : null;
  const focalRow = attentionRow ?? rows?.[0] ?? null;

  // The one honest, comprehensive count available — setupComplete is
  // tracked identically for all nine products, unlike attention items
  // (only three products have that adapter yet, see attentionAdapter.ts),
  // so this is a real total rather than a partial one dressed up as
  // whole. Never repeats what the hero already says: the hero names the
  // one most relevant product, this names how many altogether still need
  // the same kind of look.
  const readyRows = (rows ?? []).filter((row): row is Extract<OwnedProductRow, { kind: "ready" }> => row.kind === "ready");
  const needsSetupCount = readyRows.filter((row) => !row.instance || !row.instance.setupComplete).length;

  // Home is organised by area of life, not by product: the section
  // heading is the part of your life, the products under it are how you
  // get there. Reuses LIFE_AREAS (src/content/areas.ts) — the same
  // taxonomy the Store filters by — rather than a second, parallel one.
  // An area with nothing owned in it never renders, so owning one
  // product means one section, not five empty ones.
  const areaSections = useMemo(() => {
    const ready = (rows ?? []).filter(
      (row): row is Extract<OwnedProductRow, { kind: "ready" }> => row.kind === "ready"
    );
    return LIFE_AREAS.map((area) => ({
      area,
      rows: ready.filter((row) => area.productSlugs.includes(row.productSlug)),
    })).filter((section) => section.rows.length > 0);
  }, [rows]);

  // Anything that failed to load keeps its honest degraded row rather
  // than being silently dropped from an area it belongs to.
  const degraded = (rows ?? []).filter(
    (row): row is Exclude<OwnedProductRow, { kind: "ready" }> => row.kind !== "ready"
  );

  return (
    <PlatformShell>
      {rows === null && !loadError ? (
        <div className="space-y-8">
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[shadow:var(--shadow-soft)] sm:p-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-11 w-36 rounded-lg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[shadow:var(--shadow-xs)]">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : loadError ? (
        <EmptyState
          icon={WarningCircle}
          title="Couldn't load your home"
          description="Your access hasn't changed. This was just a read failure, check your connection and try again."
          action={
            <Button size="md" variant="action" onClick={retry}>
              Try again
            </Button>
          }
        />
      ) : (
        <div className="space-y-10">
          {readyRows.length > 0 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="-mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--faint)]"
            >
              {today && (
                <>
                  <span>{today}</span>
                  <span aria-hidden>·</span>
                </>
              )}
              <span>
                {readyRows.length} {readyRows.length === 1 ? "companion" : "companions"}
                {needsSetupCount > 0
                  ? `, ${needsSetupCount} still ${needsSetupCount === 1 ? "needs" : "need"} setup`
                  : ", all set up"}
              </span>
            </motion.div>
          )}

          <FocalBlock row={focalRow} attentionItem={topAttentionItem} firstName={firstName} onRetry={retry} />

          {recentUpdates.length > 0 && (
            <RevealSection index={0} reduceMotion={reduceMotion}>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                Recently across your life
              </h2>
              <div className="grid gap-2.5">
                {recentUpdates.map((update) => (
                  <RecentUpdateRow key={update.id} update={update} />
                ))}
              </div>
            </RevealSection>
          )}

          {areaSections.map((section, i) => (
            <RevealSection key={section.area.slug} index={i + 1} reduceMotion={reduceMotion}>
              <div className="mb-3.5">
                <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                  {section.area.label}
                </h2>
                <p className="mt-1 max-w-lg text-[13px] leading-relaxed text-[var(--muted)]">{section.area.situation}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.rows.map((row) => (
                  <ProductSummaryTile
                    key={row.productSlug}
                    row={row}
                    summary={summaries[row.productSlug]}
                    wide={section.rows.length === 1}
                  />
                ))}
              </div>
            </RevealSection>
          ))}

          {degraded.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                Couldn&apos;t load
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {degraded.map((row) => (
                  <DegradedProductRow key={row.productSlug} row={row} onRetry={retry} />
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
  attentionItem,
  firstName,
  onRetry,
}: {
  row: OwnedProductRow | null;
  attentionItem: SharedAttentionItem | null;
  firstName: string;
  onRetry: () => void;
}) {
  const state = focalStateFor(row, attentionItem);

  // No owned products yet: the one thing every new account can try right
  // now, by name, not a generic "go pick something" sent off to the Store.
  // Nothing else on Home has earned a mention yet — there's nothing else
  // to say until this is true for someone.
  if (state === "none" || !row) {
    const freeProduct = productRegistry.list().find((product) => product.access.model === "free");
    if (freeProduct) {
      return (
        <FocalShell
          eyebrow={`Good to see you, ${firstName}`}
          title={`Try ${freeProduct.title}, free`}
          body={freeProduct.tagline ?? "One Companion, free to use, no card required."}
          primary={{ label: "Try it free", href: `/app/products/${freeProduct.slug}` }}
          secondary={{ label: "Browse the full Store", href: "/shop" }}
          definition={freeProduct}
        />
      );
    }
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title="Find your first product"
        body="Every product here is built around one specific problem and stays with you."
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
        definition={row.kind === "progress-unavailable" ? row.definition : undefined}
      />
    );
  }

  if (row.kind !== "ready") return null; // unreachable: state is only "degraded" when row.kind !== "ready"

  const { definition } = row;
  const title = definition.title;

  if (state === "not-started") {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title={`Start ${title}`}
        body="You already own this. Jump in whenever you're ready."
        primary={{ label: `Start ${title}`, href: `/app/products/${definition.slug}` }}
        definition={definition}
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
        definition={definition}
      />
    );
  }

  if (state === "paused") {
    return (
      <FocalShell
        eyebrow={title}
        title={`${title} is paused`}
        body="This is paused. Resume it from Settings whenever you're ready."
        primary={{ label: "Go to Settings", href: `/app/products/${definition.slug}/settings` }}
        badge={<Badge tone="neutral">Paused</Badge>}
        definition={definition}
      />
    );
  }

  if (state === "completed") {
    return (
      <FocalShell
        eyebrow={title}
        title={`Review ${title}`}
        body="This cycle is closed. Look back at how it went, or start the next one."
        primary={{ label: "Review results", href: destination }}
        badge={<Badge tone="success">Completed</Badge>}
        definition={definition}
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
        definition={definition}
      />
    );
  }

  if (state === "needs-attention") {
    // attentionItem is guaranteed here — focalStateFor only returns this
    // state when attentionItem exists and matches this row's product.
    // The eyebrow names the product itself (not the generic "Companion"
    // family every one of these products shares): "Needs a look" on its
    // own told you nothing about which of your products it was.
    const item = attentionItem!;
    return (
      <FocalShell
        eyebrow={title}
        title={item.title}
        body={item.detail}
        primary={{ label: "Open", href: item.href }}
        badge={<Badge tone="warning">Needs a look</Badge>}
        definition={definition}
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
      definition={definition}
    />
  );
}

/**
 * Shared composition for the focal block: a genuine hero, not a list row.
 *
 * Themed to whichever product it's actually about, via the same
 * productThemeStyle()/data-product-theme mechanism every product shell
 * already uses — the hero's own icon, its primary button, its focus ring
 * all pick up that product's real accent instead of the flat platform
 * teal every state used to render in regardless of which of nine
 * products it was about. Skipped only when there's genuinely no specific
 * product behind the state (there never isn't, in practice: every
 * shipped product declares an accentScale).
 */
function FocalShell({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  badge,
  definition,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: FocalAction;
  secondary?: FocalAction;
  badge?: React.ReactNode;
  definition?: ProductDefinition;
}) {
  const reduceMotion = useReducedMotion();
  const themeProps = definition ? { [PRODUCT_THEME_ATTRIBUTE]: "", style: productThemeStyle(definition.theme) } : {};

  return (
    <motion.section
      {...themeProps}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[shadow:var(--shadow-soft)] sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3">
        {definition && <ProductBadge definition={definition} size="md" />}
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{eyebrow}</p>
          {badge}
        </div>
      </div>
      <h1 className="mt-3 max-w-xl text-[24px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[28px]">
        {title}
      </h1>
      <p className="mt-2.5 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <FocalActionButton action={primary} size="lg" variant="commit" iconRight={<ArrowRight size={16} aria-hidden />} />
        {secondary && <FocalActionButton action={secondary} size="lg" variant="ghost" />}
      </div>
    </motion.section>
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
  variant: ButtonVariant;
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

/**
 * A fade-and-rise entrance, staggered by position down the page — the
 * difference between everything appearing flat and at once (a page that
 * "loaded") and sections settling in one after another (an app that
 * "opened"). Delay is capped so an account with many life areas never
 * makes the bottom of the list wait seconds to appear.
 */
function RevealSection({
  index,
  reduceMotion,
  children,
}: {
  index: number;
  reduceMotion: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.06, 0.3) }}
    >
      {children}
    </motion.section>
  );
}

/**
 * One recent, real thing a product told the person — substantive content,
 * not a count or badge, so it stays inside ProductRailShell's "no counts,
 * no badges, no progress, no notification dots" rule despite living on
 * Home. Not the inbox: /app/notifications stays the full list.
 */
function RecentUpdateRow({ update }: { update: UpdateRow }) {
  const definition = productRegistry.getBySlug(update.productSlug);

  return (
    <Link
      href={update.url}
      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
    >
      <div className="min-w-0">
        <p className="text-[14px] font-semibold text-[var(--text)]">{update.title}</p>
        <p className="mt-0.5 truncate text-[12px] text-[var(--faint)]">
          {[definition?.title ?? update.productSlug, formatRelativeTime(update.createdAt)].join(" · ")}
        </p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-[var(--faint)]" aria-hidden />
    </Link>
  );
}

