import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Container from "@/design-system/Container";
import Button from "@/design-system/Button";
import { ArrowRight, Check } from "@/design-system/Icon";
import { NEEDS, getNeedBySlug } from "@/content/needs";
import { shopRegistry } from "@/shop/registry";

export function generateStaticParams() {
  return NEEDS.map((need) => ({ needSlug: need.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ needSlug: string }>;
}): Promise<Metadata> {
  const { needSlug } = await params;
  const need = getNeedBySlug(needSlug);
  if (!need) return {};
  return {
    title: need.label,
    description: need.situation,
    alternates: { canonical: `/help-with/${need.slug}` },
  };
}

export default async function HelpWithNeedPage({
  params,
}: {
  params: Promise<{ needSlug: string }>;
}) {
  const { needSlug } = await params;
  const need = getNeedBySlug(needSlug);
  if (!need) notFound();

  const relatedProducts = shopRegistry.listPublished().filter((product) => product.needGroups.includes(need.slug));

  return (
    <Container width="narrow" className="pb-24 pt-16 sm:pt-20">
      <Link href="/help-with" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
        ← All situations
      </Link>

      <h1 className="mt-4 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
        {need.label}
      </h1>
      <p className="mt-4 text-[16px] leading-relaxed text-[var(--text)]">{need.situation}</p>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">{need.longDescription}</p>

      <section className="mt-10">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What helps</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {need.whatHelps.map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[var(--text)]">
              <Check size={14} className="mt-1 shrink-0 text-[var(--success)]" aria-hidden />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-lg bg-[var(--surface-muted)] p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">What that looks like</p>
        <p className="mt-2 text-[14px] font-medium text-[var(--text)]">{need.example}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">This is likely for you if</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {need.whoThisIsFor.map((line) => (
            <li key={line} className="text-[14px] leading-relaxed text-[var(--muted)]">
              {line}
            </li>
          ))}
        </ul>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="mt-12 border-t border-[var(--border)] pt-8">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Tools for this</h2>
          <div className="mt-4 flex flex-col gap-3">
            {relatedProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/shop/${product.slug}`}
                className="rounded-xl border border-[var(--border)] p-4 transition-colors hover:border-[var(--border-strong)]"
              >
                <p className="text-[14px] font-semibold text-[var(--text)]">{product.title}</p>
                <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">{product.problem}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-12 border-t border-[var(--border)] pt-8">
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            There's no published tool for this specific situation yet. Create an account now, and it'll be ready in
            your library the moment there is.
          </p>
        </section>
      )}

      <div className="mt-8">
        <Button href="/signup" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
          Create an account
        </Button>
      </div>
    </Container>
  );
}
