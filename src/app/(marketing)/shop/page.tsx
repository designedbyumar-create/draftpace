import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import Badge from "@/design-system/Badge";
import EmptyState from "@/design-system/EmptyState";
import { ArrowRight, BookOpen } from "@/design-system/Icon";
import { shopRegistry } from "@/shop/registry";
import { NEEDS } from "@/content/needs";

export const metadata: Metadata = {
  title: "Shop",
  description: "Find help for the thing you're trying to sort out, with guided tools organized around what you need.",
  alternates: { canonical: "/shop" },
};

export default function ShopIndexPage() {
  const products = shopRegistry.listPublished();

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Shop</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Find help for the thing you're trying to sort out.
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
        Every tool here is built around a specific situation, not a general productivity toolkit. Free and paid
        tools work the same way: your progress saves to your account either way.
      </p>

      {products.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icon={BookOpen}
            title="Nothing is published yet"
            description="The first guided tools are still being built. Nothing is listed here until it's genuinely ready to use, not a placeholder inventory."
            action={
              <Link href="/help-with" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline">
                See what kind of help is coming
                <ArrowRight size={13} aria-hidden />
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-14">
          {NEEDS.map((need) => {
            const groupProducts = products.filter((product) => product.needGroups.includes(need.slug));
            if (groupProducts.length === 0) return null;
            return (
              <div key={need.slug}>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">{need.label}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {groupProducts.map((product) => (
                    <Link
                      key={product.slug}
                      href={`/shop/${product.slug}`}
                      className="rounded-xl border border-[var(--border)] p-5 transition-colors hover:border-[var(--border-strong)]"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone={product.access === "free" ? "success" : "primary"}>
                          {product.access === "free" ? "Free" : "Paid"}
                        </Badge>
                        {product.devFixture && <Badge tone="neutral">Internal preview</Badge>}
                      </div>
                      <p className="mt-2.5 text-[15px] font-semibold text-[var(--text)]">{product.title}</p>
                      <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)]">{product.problem}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-16 border-t border-[var(--border)] pt-8">
        <h2 className="text-[15px] font-semibold text-[var(--text)]">Choosing between tools</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Not sure where to start? Answer one question on the{" "}
          <Link href="/help-with" className="font-semibold text-[var(--primary)] hover:underline">
            help-with page
          </Link>{" "}
          and it'll point you to the right place.
        </p>
        <h2 className="mt-6 text-[15px] font-semibold text-[var(--text)]">Access</h2>
        <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-[var(--muted)]">
          Free tools are complete, not stripped-down previews. Paid tools are billed once, not as a recurring
          subscription, unless a specific listing says otherwise. Everything you own lives in your{" "}
          <Link href="/app/library" className="font-semibold text-[var(--primary)] hover:underline">
            library
          </Link>
          .
        </p>
      </div>
    </Container>
  );
}
