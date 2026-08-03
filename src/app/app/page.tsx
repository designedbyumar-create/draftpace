"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PlatformShell, { InstallPromptCard } from "@/design-system/shell/PlatformShell";
import { useSession } from "@/design-system/shell/SessionProvider";
import Button from "@/design-system/Button";
import Badge from "@/design-system/Badge";
import { ArrowRight } from "@/design-system/Icon";
import { productRegistry } from "@/product-framework/registry";
import { familyRegistry } from "@/product-framework/families";
import { listMyProductInstances, type ProductInstanceSummary } from "@/product-framework/instances";
import { registerMonthlyMoneyReset } from "@/products/monthly-money-reset/register";

/**
 * Platform Home answers one question: "what should I do next?" with one
 * dominant action. It renders a single state-aware focal block chosen from the
 * user's most relevant owned product, then a quiet remainder. Sections with no
 * content (attention, notifications) are not rendered at all, rather than
 * reserved as empty rectangles. See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §9.
 */

const BEHIND_AFTER_DAYS = 10;

type FocalState = "none" | "setup" | "active" | "behind" | "completed";

function focalStateFor(instance: ProductInstanceSummary | null): FocalState {
  if (!instance) return "none";
  if (instance.lifecycleState === "completed") return "completed";
  if (!instance.setupComplete) return "setup";
  const ageDays = (Date.now() - new Date(instance.lastActivityAt).getTime()) / 86_400_000;
  return ageDays > BEHIND_AFTER_DAYS ? "behind" : "active";
}

export default function AppHomePage() {
  const user = useSession();
  const [instances, setInstances] = useState<ProductInstanceSummary[] | null>(null);
  const firstName = String(user.user_metadata?.display_name || user.email?.split("@")[0] || "there").split(" ")[0];

  useEffect(() => {
    registerMonthlyMoneyReset();
    let cancelled = false;
    listMyProductInstances().then((rows) => {
      if (!cancelled) setInstances(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const owned = useMemo(() => {
    const latest = new Map<string, ProductInstanceSummary>();
    for (const instance of instances ?? []) {
      if (!latest.has(instance.productSlug)) latest.set(instance.productSlug, instance);
    }
    return [...latest.values()];
  }, [instances]);

  const focalInstance = owned[0] ?? null;
  const rest = owned.slice(1);

  return (
    <PlatformShell>
      {instances === null ? (
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      ) : (
        <div className="space-y-10">
          <FocalBlock instance={focalInstance} firstName={firstName} />

          {rest.length > 0 && (
            <section>
              <h2 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
                Also in your library
              </h2>
              <div className="grid gap-2.5">
                {rest.map((instance) => (
                  <LibraryLink key={instance.id} instance={instance} />
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

/** The one dominant thing on the screen, composed per the user's current state. */
function FocalBlock({ instance, firstName }: { instance: ProductInstanceSummary | null; firstName: string }) {
  const state = focalStateFor(instance);

  // No owned products yet: a warm invitation to find the first one.
  if (state === "none" || !instance) {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title="Find your first product"
        body="Every product here is built around one specific problem and stays with you. Start with something free."
        primary={{ label: "Browse the Store", href: "/shop" }}
      />
    );
  }

  const definition = productRegistry.getBySlug(instance.productSlug);
  if (!definition) return null;
  const family = familyRegistry.get(definition.family);
  const title = definition.title;
  const base = `/app/products/${definition.slug}`;

  if (state === "setup") {
    return (
      <FocalShell
        eyebrow={`Good to see you, ${firstName}`}
        title={`Pick up where you left off: finish setting up ${title}`}
        body="You are a few short steps from your first result. It saves as you go, so you can stop and come back anytime."
        primary={{ label: "Continue setup", href: `${base}/setup` }}
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
        primary={{ label: "Review results", href: `${base}/history` }}
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
        primary={{ label: "Update what changed", href: `${base}/workspace` }}
        secondary={{ label: "Just continue", href: `${base}/workspace` }}
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
      primary={{ label: `Open ${title}`, href: `${base}/workspace` }}
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
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  familyLabel?: string;
  badge?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
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
        <Button href={primary.href} size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
          {primary.label}
        </Button>
        {secondary && (
          <Button href={secondary.href} size="lg" variant="ghost">
            {secondary.label}
          </Button>
        )}
      </div>
    </section>
  );
}

/** A quiet secondary owned-product link, used only when more than one is owned. */
function LibraryLink({ instance }: { instance: ProductInstanceSummary }) {
  const definition = productRegistry.getBySlug(instance.productSlug);
  if (!definition) return null;
  const destination = !instance.setupComplete
    ? `/app/products/${definition.slug}/setup`
    : instance.lifecycleState === "completed"
      ? `/app/products/${definition.slug}/history`
      : `/app/products/${definition.slug}/workspace`;

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
