import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import GuideBody from "@/components/public/guides/GuideBody";
import { GUIDES, SERIES, getGuideBySlug, guidesForArea, relatedGuides } from "@/content/guides";
import { LIFE_AREAS, getAreaBySlug } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";

/**
 * One route serving two page types: a life-area hub, or a guide.
 *
 * Both want to live directly under /guides. /guides/money reads as a hub
 * and /guides/what-to-do-when-a-parent-dies reads as an article, and
 * nesting articles under their area would force cross-cutting pieces
 * into a false home and turn any later re-filing into a broken link. So
 * the slug is resolved against areas first, then guides.
 *
 * The six area slugs are therefore reserved. guides.test.ts asserts no
 * guide slug ever collides with one, which is the failure this design
 * trades for its better URLs.
 */

export function generateStaticParams() {
  return [
    ...LIFE_AREAS.map((area) => ({ guideSlug: area.slug })),
    ...GUIDES.map((guide) => ({ guideSlug: guide.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guideSlug: string }>;
}): Promise<Metadata> {
  const { guideSlug } = await params;

  const area = getAreaBySlug(guideSlug);
  if (area) {
    return {
      title: `${area.label} guides`,
      description: `Guides for when ${area.situation.charAt(0).toLowerCase()}${area.situation.slice(1, -1)}.`,
      alternates: { canonical: `/guides/${area.slug}` },
    };
  }

  const guide = getGuideBySlug(guideSlug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.dek,
    alternates: { canonical: `/guides/${guide.slug}` },
  };
}

export default async function GuideOrHubPage({ params }: { params: Promise<{ guideSlug: string }> }) {
  ensureShopRegistered();
  const { guideSlug } = await params;

  const area = getAreaBySlug(guideSlug);
  if (area) return <AreaHub slug={guideSlug} />;

  const guide = getGuideBySlug(guideSlug);
  if (!guide) notFound();

  const isSeries = guide.areaSlug === SERIES;
  const guideArea = guide.areaSlug && !isSeries ? getAreaBySlug(guide.areaSlug) : undefined;
  const companion = guideArea ? shopRegistry.getBySlug(guideArea.productSlugs[0]) : undefined;
  const related = relatedGuides(guide);

  return (
    <Container width="narrow" className="pb-24 pt-12 sm:pt-16">
      <Link
        href={guideArea ? `/guides/${guideArea.slug}` : "/guides"}
        className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
      >
        &larr; {guideArea ? `${guideArea.label} guides` : "All guides"}
      </Link>

      <h1 className="mt-6 font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[40px]">
        {guide.title}
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
      <p className="mt-4 font-mono text-[12px] text-[var(--faint)]">
        {guide.readingTime}
        {guide.updatedAt ? ` · Updated ${guide.updatedAt}` : ` · ${guide.publishedAt}`}
      </p>

      <GuideBody blocks={guide.body} />

      {/* The handover. A guide that leaves a convinced reader with nowhere
          to go is just an article, so this is the point of the layer. */}
      {companion && guideArea && (
        <aside className="mt-14 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
            The Companion for this
          </p>
          <h2 className="mt-2 font-serif text-[22px] font-semibold leading-tight text-[var(--text)]">
            {companion.title}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">{companion.promise}</p>
          <Link
            href={`/shop/${companion.slug}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
          >
            See what it does
            <ArrowRight size={14} aria-hidden />
          </Link>
        </aside>
      )}

      {/* A Series guide describes the category, not a domain, so it hands
          over to the whole shelf rather than to one Companion. */}
      {isSeries && (
        <aside className="mt-14 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
            The Companion Series
          </p>
          <h2 className="mt-2 font-serif text-[22px] font-semibold leading-tight text-[var(--text)]">
            One Companion per part of life that is administratively hard
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
            Money, home, mind and focus, family and learning, affairs and endings, travel. Each one holds the
            state for its own area and works out what genuinely needs you now.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
          >
            See the Series
            <ArrowRight size={14} aria-hidden />
          </Link>
        </aside>
      )}

      {related.length > 0 && (
        <section className="mt-12 border-t border-[var(--border)] pt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Related guides</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {related.map((other) => (
              <li key={other.slug}>
                <Link href={`/guides/${other.slug}`} className="group">
                  <p className="text-[15px] font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                    {other.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{other.dek}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}

/** A life-area hub: the situation, its guides, and the Companion behind them. */
function AreaHub({ slug }: { slug: string }) {
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const guides = guidesForArea(slug);
  const companion = shopRegistry.getBySlug(area.productSlugs[0]);

  return (
    <Container width="wide" className="pb-24 pt-12 sm:pt-16">
      <Link href="/guides" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
        &larr; All guides
      </Link>

      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">{area.label}</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[32px] font-semibold leading-tight tracking-tight sm:text-[42px]">
        {area.situation}
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-14">
        <div>
          {guides.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-[var(--muted)]">
              Nothing written for this area yet. The Companion for it already exists.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-[var(--border)]">
              {guides.map((guide) => (
                <li key={guide.slug} className="py-5 first:pt-0">
                  <Link href={`/guides/${guide.slug}`} className="group">
                    <p className="text-[18px] font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                      {guide.title}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
                    <p className="mt-2 font-mono text-[11px] text-[var(--faint)]">{guide.readingTime}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {companion && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">
                The Companion for this
              </p>
              <h2 className="mt-2 text-[17px] font-semibold leading-snug text-[var(--text)]">{companion.title}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{companion.promise}</p>
              <Link
                href={`/shop/${companion.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--primary)] hover:underline"
              >
                See what it does
                <ArrowRight size={13} aria-hidden />
              </Link>
            </div>
          </aside>
        )}
      </div>
    </Container>
  );
}
