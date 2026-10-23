import type { CSSProperties } from "react";
import { HandWaving } from "@/design-system/Icon";
import { posterTheme } from "@/product-framework/posterTheme";
import ProductDemoTracker from "@/components/analytics/ProductDemoTracker";
import LiveDemo from "@/components/public/home/LiveDemos";

/**
 * The real, working per-product demo that already exists for every paid
 * Companion (LiveDemos.tsx, built from each product's own logic and
 * sample data) was reachable only from the homepage: scroll past the
 * hero, find this product's row in an eight-row accordion, open it. A
 * visitor who arrives on the product's own Shop page, or at the end of a
 * guide that names this Companion, never saw it and had only prose to go
 * on.
 *
 * This renders that same component in place, wherever this product's own
 * page or its guides' handover panel wants to show it, rather than
 * telling a visitor to go find it. Deliberately opt-in per call site
 * (nothing imports or renders this for a product that doesn't ask for
 * it), so adding it here changes nothing about the homepage accordion or
 * any product that isn't named at a call site.
 */
const HINTS: Record<string, string> = {
  "personal-finance-companion": "Show the working, then drag the slider.",
  "homeschooling-companion": "Tap a circle to mark it done.",
};

export default function TryItDemo({
  slug,
  productId,
  productName,
}: {
  slug: string;
  productId: string;
  productName: string;
}) {
  const theme = posterTheme(slug);
  const hint = HINTS[slug];
  if (!theme || !hint) return null;

  const vars = {
    "--poster-bg": theme.bg,
    "--poster-surface": theme.surface,
    "--poster-text": theme.text,
    "--poster-muted": theme.muted,
    "--poster-border": theme.border,
    "--poster-accent": theme.accent,
    "--poster-accent-contrast": theme.accentContrast,
    "--poster-soft": theme.soft,
    "--poster-radius": `${theme.radius}px`,
  } as CSSProperties;

  return (
    <div style={vars} className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-8 sm:px-8">
      <p className="text-eyebrow font-bold uppercase text-[var(--brand-ink)]">See it work</p>
      <h2 className="mt-2 text-heading-sm font-serif font-semibold tracking-tight text-[var(--text)]">
        {productName}, not a screenshot of it
      </h2>
      <p className="mt-2 inline-flex items-center gap-2 text-body-sm font-semibold" style={{ color: theme.accent }}>
        <HandWaving size={17} aria-hidden /> Try it: {hint}
      </p>
      <div className="mt-6 flex justify-center">
        <ProductDemoTracker productId={productId} productSlug={slug}>
          <LiveDemo slug={slug} hero={theme.hero} />
        </ProductDemoTracker>
      </div>
      <p className="mt-5 text-caption text-[var(--faint)]">
        Sample numbers, so you can see how it works before you add your own.
      </p>
    </div>
  );
}
