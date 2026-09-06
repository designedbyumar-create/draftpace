import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { LIFE_AREAS } from "@/content/areas";
import ShopCardMockup from "./ShopCardMockup";
import ShopGrid, { type ShopFilterArea, type ShopGridEntry } from "./ShopGrid";
import { screensFor } from "./productScreens";

export const metadata: Metadata = {
  title: "Shop",
  description: "Find the one product that fits your situation. Every product is built around one specific problem.",
  alternates: { canonical: "/shop" },
};

export const dynamic = "force-dynamic";

/**
 * A card's thumbnail: the product's own three real screens, cycled on
 * hover (see ShopCardMockup and productScreens.tsx). A product without
 * screens falls back to its own listing media, then to an honest
 * placeholder, never a fabricated image.
 */
function renderThumbnail(product: { slug: string; media: { src: string; alt: string }[] }) {
  const screens = screensFor(product.slug);
  if (screens) {
    return <ShopCardMockup screens={screens} />;
  }
  const media = product.media[0];
  if (media) {
    return <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />;
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Preview coming soon</p>
    </div>
  );
}

export default function ShopIndexPage() {
  ensureShopRegistered();
  const products = shopRegistry.listPublished();

  /**
   * Ordered by src/content/areas.ts, same source the homepage and Need
   * help already read from, so all three never disagree about which
   * product represents which situation. Every product appears exactly
   * once, in a deliberate order; the filter bar below just lets a
   * visitor narrow the same list rather than deciding for them.
   */
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const areaByProductSlug = new Map<string, (typeof LIFE_AREAS)[number]>();
  for (const area of LIFE_AREAS) {
    for (const slug of area.productSlugs) {
      if (!areaByProductSlug.has(slug)) areaByProductSlug.set(slug, area);
    }
  }

  const entries: ShopGridEntry[] = LIFE_AREAS.flatMap((area) =>
    area.productSlugs.flatMap((slug) => {
      const product = bySlug.get(slug);
      if (!product) return [];
      return [{ product, areaSlug: area.slug, areaLabel: area.label, thumbnail: renderThumbnail(product) }];
    })
  );

  // Defensive, not expected with today's real listings: a published
  // product no area claims would otherwise vanish from the Shop
  // entirely rather than simply losing its filter tag.
  const seenSlugs = new Set(entries.map((entry) => entry.product.slug));
  for (const product of products) {
    if (seenSlugs.has(product.slug)) continue;
    entries.push({ product, areaSlug: null, areaLabel: null, thumbnail: renderThumbnail(product) });
  }

  const filterAreas: ShopFilterArea[] = LIFE_AREAS.filter((area) => area.productSlugs.some((slug) => bySlug.has(slug))).map((area) => ({
    slug: area.slug,
    label: area.label,
    situation: area.situation,
  }));

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">The Companion Series</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Find the one that fits your situation.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Each Companion is built around one thing that is genuinely hard to keep track of. Free and paid work the same
        way: your progress saves to your account either way.
      </p>

      {entries.length === 0 ? <EmptyShop /> : <div className="mt-12"><ShopGrid entries={entries} areas={filterAreas} /></div>}

      <div className="mt-16 border-t border-[var(--border)] pt-8">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">How access works</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Free products are complete, not stripped-down previews. Paid products are billed once, not as a recurring
          subscription, unless a specific listing says otherwise. A struck-through price is the regular price a
          product moves to later, never an inflated number invented to make the current one look bigger. Everything
          you own lives in your{" "}
          <Link href="/app/library" className="font-semibold text-[var(--primary)] hover:underline">
            library
          </Link>
          , on every device.
        </p>
      </div>
    </Container>
  );
}

function EmptyShop() {
  return (
    <div className="mt-12 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[shadow:var(--shadow-xs)] sm:p-8">
      <h2 className="text-[18px] font-semibold text-[var(--text)]">New products are on the way</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
        Nothing is listed here until it is genuinely ready to use, never a placeholder inventory. The first products
        are being built now.
      </p>
      <Link
        href="/how-it-works"
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
      >
        See how Draftpace works
        <ArrowRight size={13} aria-hidden />
      </Link>
    </div>
  );
}
