import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import { GUIDES, guidesForArea } from "@/content/guides";
import { LIFE_AREAS } from "@/content/areas";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical guides for the parts of life that are hard to keep track of: money, home, focus, family, affairs and travel.",
  alternates: { canonical: "/guides" },
};

/**
 * The guides index, organised by life area rather than as one flat list.
 *
 * A flat list works at two guides and fails at fifty five. Area hubs
 * give each cluster a page that can rank for the broad terms an
 * individual article cannot reach, and give a reader who landed on one
 * narrow article somewhere to go next.
 */
export default function GuidesIndexPage() {
  const areas = LIFE_AREAS.map((area) => ({ area, guides: guidesForArea(area.slug) }));
  const orphans = GUIDES.filter((guide) => guide.areaSlug === null);

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Guides</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Practical help, whether or not you buy anything.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Written for the moment you are actually in. Each one ends by pointing at the Companion built for that area, and
        each one is useful on its own if you would rather just read it and go.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map(({ area, guides }) => (
          <Link
            key={area.slug}
            href={guides.length > 0 ? `/guides/${area.slug}` : `/shop/${area.productSlugs[0]}`}
            className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--primary)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--primary)]">{area.label}</p>
            <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-[var(--text)]">{area.situation}</p>
            <p className="mt-4 flex items-center gap-1.5 font-mono text-[11px] text-[var(--faint)]">
              {guides.length === 0
                ? "Companion available"
                : `${guides.length} guide${guides.length === 1 ? "" : "s"}`}
              <ArrowRight size={12} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>

      {/* Orphans are shown rather than hidden. They predate the Companion
          Series and have no product behind them, and guides.test.ts stops
          the count growing. */}
      {orphans.length > 0 && (
        <section className="mt-16 border-t border-[var(--border)] pt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">Also written</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {orphans.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guides/${guide.slug}`} className="group">
                  <p className="text-[15px] font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                    {guide.title}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
