import type { Metadata } from "next";
import Container from "@/design-system/Container";
import GuidesExplorer, {
  type ExplorerArea,
  type ExplorerGuide,
} from "@/components/public/guides/GuidesExplorer";
import GuideCard from "@/components/public/guides/GuideCard";
import { areaIdentity } from "@/components/public/guides/areaIdentity";
import { guideArt } from "@/content/guideArt";
import { GUIDES, SERIES, areasWithGuides, readingMinutes, readingTimeLabel, seriesGuides } from "@/content/guides";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides for the parts of life that are hard to keep track of: money, home, focus, family, affairs and travel.",
  alternates: {
    canonical: "/guides",
    types: { "application/rss+xml": "/guides/feed.xml" },
  },
};

/**
 * The guides index.
 *
 * Organised by life area rather than as one flat list. A flat list works
 * at two guides and fails at fifty four: area hubs give each cluster a
 * page that can rank for the broad terms an individual article cannot
 * reach, and give a reader who landed on one narrow article somewhere to
 * go next.
 *
 * The area marks and every card's thumbnail are resolved here, server
 * side, and handed to the explorer as plain data. That is deliberate:
 * the explorer is a client component, and importing the identity or art
 * modules there would pull the content layer into the browser bundle.
 */
export default function GuidesIndexPage() {
  const series = seriesGuides();
  const orphans = GUIDES.filter((guide) => guide.areaSlug === null);
  const minutes = GUIDES.reduce((total, guide) => total + readingMinutes(guide), 0);
  const populatedAreas = areasWithGuides();

  const areas: ExplorerArea[] = populatedAreas.map((area) => ({ slug: area.slug, label: area.label }));

  // Series guides are searchable alongside the rest but have no area
  // panel, because they are about the whole shelf rather than one part
  // of it. They get their own section below instead.
  const guides: ExplorerGuide[] = GUIDES.filter((guide) => guide.areaSlug !== null).map((guide) => {
    const area = populatedAreas.find((candidate) => candidate.slug === guide.areaSlug);
    return {
      slug: guide.slug,
      title: guide.title,
      dek: guide.dek,
      readingTime: readingTimeLabel(guide),
      areaSlug: guide.areaSlug === SERIES ? SERIES : (area?.slug ?? SERIES),
      areaLabel: area?.label ?? "The Series",
      thumb: guideArt(guide.slug)?.thumb,
    };
  });

  const { Mark: SeriesMark } = areaIdentity(SERIES);

  return (
    <Container width="wide" className="pb-24 pt-14 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">Guides</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-[1.08] tracking-tight text-balance sm:text-[46px]">
        Practical help, whether or not you buy anything.
      </h1>
      <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">
        Written for the moment you are actually in. Each one ends by pointing at the Companion built for that
        area, and each one is useful on its own if you would rather just read it and go.
      </p>
      <p className="mt-4 font-mono text-[12px] text-[var(--faint)]">
        {GUIDES.length} guides · {minutes} minutes · nothing gated
      </p>

      <div className="mt-10">
        <GuidesExplorer areas={areas} guides={guides} />
      </div>

      {/* The Series tier sits below the areas rather than inside one,
          because these argue for the category itself. */}
      {series.length > 0 && (
        <section
          style={
            {
              "--area": `var(--area-${SERIES})`,
              "--area-soft": `var(--area-${SERIES}-soft)`,
            } as React.CSSProperties
          }
          className="mt-14 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--area-soft)]"
        >
          <div className="grid gap-6 p-6 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center sm:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--area)]">
                About this kind of work
              </p>
              <p className="mt-2.5 max-w-lg text-[17px] leading-relaxed text-[var(--text)]">
                Two pieces about the category itself: what life admin actually is, and why the tools sold for
                it keep being abandoned.
              </p>
            </div>
            <div className="hidden text-[var(--area)] sm:block">
              <SeriesMark className="w-full" />
            </div>
          </div>

          <ul className="flex flex-col divide-y divide-[var(--border)] border-t border-[var(--border)] bg-[var(--surface)] px-6 sm:px-8">
            {series.map((guide) => (
              <li key={guide.slug} className="py-4">
                <GuideCard
                  variant="row"
                  areaSlug={SERIES}
                  guide={{ slug: guide.slug, title: guide.title, dek: guide.dek }}
                  thumb={guideArt(guide.slug)?.thumb}
                  fallback={<SeriesMark />}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Orphans are shown rather than hidden. They predate the Companion
          Series and have no product behind them, and guides.test.ts stops
          the count growing. */}
      {orphans.length > 0 && (
        <section className="mt-14 border-t border-[var(--border)] pt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Also written</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {orphans.map((guide) => (
              <li key={guide.slug}>
                <GuideCard
                  variant="row"
                  guide={{ slug: guide.slug, title: guide.title, dek: guide.dek }}
                  thumb={guideArt(guide.slug)?.thumb}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
