import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import Badge from "@/design-system/Badge";
import { shopRegistry } from "@/shop/registry";

export default function ShopPreview() {
  const products = shopRegistry.listPublished();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border-strong)] p-8 text-center sm:p-10">
        <p className="text-[15px] leading-relaxed text-[var(--muted)]">
          Nothing is published in the store yet. The first products are still being made, and this page will
          show them the moment they're ready.
        </p>
        <Link href="/help-with" className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
          See what kind of help is coming
          <ArrowRight size={13} aria-hidden />
        </Link>
      </div>
    );
  }

  const [featured, ...rest] = products;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/shop/${featured.slug}`}
        className="block rounded-2xl border border-[var(--border)] p-6 transition-colors hover:border-[var(--border-strong)] sm:p-8"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={featured.access === "free" ? "success" : "primary"}>
            {featured.access === "free" ? "Free" : "Paid"}
          </Badge>
          {featured.devFixture && <Badge tone="neutral">Internal preview</Badge>}
        </div>
        <h3 className="mt-3 text-[19px] font-semibold text-[var(--text)]">{featured.title}</h3>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--muted)]">{featured.promise}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)]">
          See how it helps
          <ArrowRight size={13} aria-hidden />
        </span>
      </Link>

      {rest.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((product) => (
            <Link
              key={product.slug}
              href={`/shop/${product.slug}`}
              className="rounded-xl border border-[var(--border)] p-5 transition-colors hover:border-[var(--border-strong)]"
            >
              <Badge tone={product.access === "free" ? "success" : "primary"}>
                {product.access === "free" ? "Free" : "Paid"}
              </Badge>
              <p className="mt-2.5 text-[14px] font-semibold text-[var(--text)]">{product.title}</p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{product.problem}</p>
            </Link>
          ))}
        </div>
      )}

      <Link href="/shop" className="self-start text-[13px] font-semibold text-[var(--primary)] hover:underline">
        Browse the store
      </Link>
    </div>
  );
}
