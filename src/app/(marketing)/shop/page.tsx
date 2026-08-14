import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import Button from "@/design-system/Button";
import { ArrowRight } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import type { ShopProduct } from "@/shop/definition";
import { NEEDS } from "@/content/needs";
import AddToLibraryButton from "./AddToLibraryButton";

export const metadata: Metadata = {
  title: "Store",
  description: "Find the one product that fits your situation. Every product is built around one specific problem.",
  alternates: { canonical: "/shop" },
};

/**
 * The Store front door. Product-forward and threshold-aware: with a few
 * products it presents each one richly rather than as a catalogue grid with
 * holes; the category grid only switches on once there is enough inventory to
 * justify it. See docs/DRAFTPACE-APP-EXPERIENCE-DESIGN.md §5.
 */
const CATEGORY_GRID_THRESHOLD = 4;

function categoryLabel(product: ShopProduct): string | null {
  const need = NEEDS.find((n) => product.needGroups.includes(n.slug));
  return need?.label ?? null;
}

export default function ShopIndexPage() {
  const products = shopRegistry.listPublished();
  const useGrid = products.length >= CATEGORY_GRID_THRESHOLD;

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Store</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Find the one that fits your situation.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Every product here is built around one specific problem. Free and paid work the same way: your progress
        saves to your account either way.
      </p>

      {products.length === 0 ? (
        <EmptyStore />
      ) : useGrid ? (
        <CategoryGrid products={products} />
      ) : (
        <div className="mt-12 flex flex-col gap-6">
          {products.map((product) => (
            <FeaturedProduct key={product.slug} product={product} />
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-[var(--border)] pt-8">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">How access works</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Free products are complete, not stripped-down previews. Paid products are billed once, not as a recurring
          subscription, unless a specific listing says otherwise. Everything you own lives in your{" "}
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
function StoreCardActions({ product }: { product: ShopProduct }) {
  if (product.availability === "coming-soon") {
    return (
      <Link
        href={`/shop/${product.slug}`}
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
      >
        Learn more
        <ArrowRight size={14} aria-hidden />
      </Link>
    );
  }

  if (product.access === "free") {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AddToLibraryButton slug={product.slug} label="Add to library, free" size="sm" />
        <Link href={`/shop/${product.slug}`} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
          Learn more
        </Link>
      </div>
    );
  }

  // Paid: nothing to add pre-payment, so the only action is the product
  // page, where checkout (once live) actually happens.
  return (
    <div className="mt-4">
      <Button href={`/shop/${product.slug}`} size="sm" iconRight={<ArrowRight size={14} aria-hidden />}>
        See how it works
      </Button>
    </div>
  );
}

/** Low-inventory presentation: one rich, product-forward block per product. */
function FeaturedProduct({ product }: { product: ShopProduct }) {
  const category = categoryLabel(product);
  return (
    <div className="grid gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-xs)] sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] sm:items-center sm:p-6">
      <div className="min-w-0 sm:order-1">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">{category}</span>
          )}
          <Badge tone={product.access === "free" ? "success" : "primary"}>
            {product.access === "free" ? "Free" : "Paid"}
          </Badge>
          {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
          {product.devFixture && <Badge tone="neutral">Internal preview</Badge>}
        </div>
        <Link href={`/shop/${product.slug}`} className="mt-2 block text-[19px] font-semibold tracking-tight text-[var(--text)] hover:underline">
          {product.title}
        </Link>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{product.promise}</p>
        <StoreCardActions product={product} />
      </div>
      <Link href={`/shop/${product.slug}`} className="sm:order-2" aria-label={`See ${product.title} in detail`}>
        <ProductVisual product={product} />
      </Link>
    </div>
  );
}

/** Higher-inventory presentation: the category-grouped grid. */
function CategoryGrid({ products }: { products: ShopProduct[] }) {
  return (
    <div className="mt-12 flex flex-col gap-14">
      {NEEDS.map((need) => {
        const group = products.filter((p) => p.needGroups.includes(need.slug));
        if (group.length === 0) return null;
        return (
          <div key={need.slug}>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{need.label}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.map((product) => (
                <Link
                  key={product.slug}
                  href={`/shop/${product.slug}`}
                  className="rounded-xl border border-[var(--border)] p-5 transition-colors hover:border-[var(--border-strong)]"
                >
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={product.access === "free" ? "success" : "primary"}>
                      {product.access === "free" ? "Free" : "Paid"}
                    </Badge>
                    {product.availability === "coming-soon" && <Badge tone="neutral">Coming soon</Badge>}
                  </div>
                  <p className="mt-2.5 text-[15px] font-semibold text-[var(--text)]">{product.title}</p>
                  <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">{product.promise}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Product visual. Uses the listing's real media when present; otherwise a
 * labeled placeholder that states exactly what visual belongs here, so the
 * layout reads as intentional before final imagery lands.
 */
function ProductVisual({ product, className = "" }: { product: ShopProduct; className?: string }) {
  const media = product.media[0];
  if (media) {
    return (
      <div className={`relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] ${className}`}>
        <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
      </div>
    );
  }
  return (
    <div
      className={`flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 text-center ${className}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Product preview</p>
      <p className="text-[12px] leading-4 text-[var(--muted)]">A real view of {product.title} goes here</p>
    </div>
  );
}

function EmptyStore() {
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
