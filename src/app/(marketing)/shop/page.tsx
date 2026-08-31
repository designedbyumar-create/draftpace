import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { formatCompareAtPrice, formatPrice, type ShopProduct } from "@/shop/definition";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { LIFE_AREAS } from "@/content/areas";
import AddToLibraryButton from "./AddToLibraryButton";
import { OverviewScreenMockup as MmrOverviewScreenMockup } from "./[productSlug]/monthlyMoneyResetVisuals";
import { OverviewScreenMockup as PfcOverviewScreenMockup } from "./[productSlug]/personalFinanceCompanionVisuals";
import { OverviewScreenMockup as HmcOverviewScreenMockup } from "./[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as PlaOverviewScreenMockup } from "./[productSlug]/personalLifeAffairsCompanionVisuals";
import { OverviewScreenMockup as HscOverviewScreenMockup } from "./[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as AlongsideOverviewScreenMockup } from "./[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as TravelOverviewScreenMockup } from "./[productSlug]/travelCompanionVisuals";

export const metadata: Metadata = {
  title: "Shop",
  description: "Find the one product that fits your situation. Every product is built around one specific problem.",
  alternates: { canonical: "/shop" },
};

export const dynamic = "force-dynamic";

/**
 * The one place that maps a real product slug to the small preview it uses
 * on its Shop card. A product without an entry here falls back to its own
 * listing media, then to an honest placeholder - never a fabricated image.
 */
const PRODUCT_THUMBNAILS: Partial<Record<string, React.ComponentType>> = {
  "monthly-money-reset": MmrOverviewScreenMockup,
  "personal-finance-companion": PfcOverviewScreenMockup,
  "home-management-companion": HmcOverviewScreenMockup,
  "personal-life-affairs-companion": PlaOverviewScreenMockup,
  "homeschooling-companion": HscOverviewScreenMockup,
  "alongside": AlongsideOverviewScreenMockup,
  "travel-companion": TravelOverviewScreenMockup,
};

export default function ShopIndexPage() {
  ensureShopRegistered();
  const products = shopRegistry.listPublished();

  /**
   * Grouped by life area, driven by src/content/areas.ts rather than by
   * each listing's own needGroups.
   *
   * The needs taxonomy this replaces put six of seven products under a
   * single heading, left three headings empty, and listed Travel
   * Companion twice because it legitimately matched two situations.
   * Areas own an ordered list of product slugs, so every product appears
   * exactly once, in a deliberate order, and the Shop matches what the
   * homepage and Need help already promise.
   */
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const categories = LIFE_AREAS.map((area) => ({
    area,
    products: area.productSlugs.map((slug) => bySlug.get(slug)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
  })).filter((category) => category.products.length > 0);

  // Defensive, not expected with today's real listings: a published
  // product that no area claims would otherwise vanish from the Shop
  // entirely rather than simply missing a heading.
  const categorizedSlugs = new Set(categories.flatMap((category) => category.products.map((p) => p.slug)));
  const uncategorized = products.filter((product) => !categorizedSlugs.has(product.slug));

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">The Companion Series</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Find the one that fits your situation.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Each Companion is built around one thing that is genuinely hard to keep track of. Free and paid work the same
        way: your progress saves to your account either way.
      </p>

      {products.length === 0 ? (
        <EmptyShop />
      ) : (
        <div className="mt-12 flex flex-col gap-14">
          {categories.map(({ area, products: categoryProducts }) => (
            <section key={area.slug}>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{area.label}</h2>
              {/* The situation, not a category description. Somebody
                  scanning the Shop should be able to recognise their own
                  week from the heading rather than from the product name. */}
              <p className="mt-1.5 max-w-lg text-[14px] leading-relaxed text-[var(--muted)]">{area.situation}</p>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map((product) => (
                  <ShopProductCard key={product.slug} product={product} />
                ))}
              </div>
            </section>
          ))}

          {uncategorized.length > 0 && (
            <section>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">More</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {uncategorized.map((product) => (
                  <ShopProductCard key={product.slug} product={product} />
                ))}
              </div>
            </section>
          )}

          {categories.length < LIFE_AREAS.length && (
            <p className="text-[13px] text-[var(--faint)]">
              The Companion Series is organised by area of life. More fill in as new Companions are finished.
            </p>
          )}
        </div>
      )}

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

/**
 * Two distinct actions, never one link doing double duty: "Add to library"
 * commits (a free product goes straight into the visitor's account, same
 * direct POST GetAction in shop/[productSlug]/page.tsx uses); "Learn more"
 * only ever navigates to the product page. A visitor should never have to
 * guess which one a single button will do.
 */
function ShopCardActions({ product }: { product: ShopProduct }) {
  if (product.availability === "coming-soon") {
    return (
      <Link
        href={`/shop/${product.slug}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
      >
        Learn more
        <ArrowRight size={14} aria-hidden />
      </Link>
    );
  }

  if (product.access === "free") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <AddToLibraryButton slug={product.slug} label="Add to library" size="sm" />
        <Link href={`/shop/${product.slug}`} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
          Learn more
        </Link>
      </div>
    );
  }

  // Paid: nothing to add pre-payment, so the only action is the product
  // page, where checkout (once live) actually happens.
  return (
    <Button href={`/shop/${product.slug}`} size="sm" iconRight={<ArrowRight size={14} aria-hidden />}>
      See how it works
    </Button>
  );
}

/**
 * One marketplace-grade card, used for every listing regardless of
 * category size or free/paid status - the founder's own complaint was that
 * the previous layout treated a free listing and a paid listing as two
 * visually unrelated things. "Free" and a real price now render in the
 * exact same corner tag, same weight, on every card.
 */
function ShopProductCard({ product }: { product: ShopProduct }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] transition hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]">
      <Link href={`/shop/${product.slug}`} aria-label={`See ${product.title} in detail`} className="block">
        <ShopProductThumbnail product={product} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {(product.availability === "coming-soon" || product.devFixture) && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
            {product.devFixture && <Badge tone="neutral">Internal preview</Badge>}
          </div>
        )}
        <Link
          href={`/shop/${product.slug}`}
          className="block text-[16px] font-semibold leading-snug tracking-tight text-[var(--text)] hover:underline"
        >
          {product.title}
        </Link>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[var(--muted)]">{product.promise}</p>
        <div className="mt-4">
          <ShopCardActions product={product} />
        </div>
      </div>
    </div>
  );
}

/**
 * The card's visual: a real product mockup when one exists (scaled down
 * from the same components the detail page uses, so the Shop never shows a
 * different product than the one a visitor lands on), a real screenshot
 * next, and only then an honest "preview coming soon" placeholder. The
 * price/free tag sits in the same corner regardless of which of the three
 * this renders, so every card reads the same way at a glance.
 */
function ShopProductThumbnail({ product }: { product: ShopProduct }) {
  const Mockup = PRODUCT_THUMBNAILS[product.slug];
  const media = product.media[0];

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
      {Mockup ? (
        <div
          className="absolute left-1/2 top-5 w-[230px]"
          style={{ transform: "translateX(-50%) scale(0.82)", transformOrigin: "top center" }}
        >
          <Mockup />
        </div>
      ) : media ? (
        <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Preview coming soon</p>
        </div>
      )}
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-[var(--surface)]/95 px-2.5 py-1 text-[11px] font-bold text-[var(--text)] shadow-[var(--shadow-xs)] backdrop-blur">
        {formatCompareAtPrice(product) && (
          <span className="font-normal text-[var(--faint)] line-through">{formatCompareAtPrice(product)}</span>
        )}
        {formatPrice(product)}
      </div>
    </div>
  );
}

function EmptyShop() {
  return (
    <div className="mt-12 max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-xs)] sm:p-8">
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
