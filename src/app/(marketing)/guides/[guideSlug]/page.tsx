import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/design-system/Container";
import { ArrowLeft, ArrowRight, Clock } from "@/design-system/Icon";
import GuideBody from "@/components/public/guides/GuideBody";
import GuideContents from "@/components/public/guides/GuideContents";
import ReadingProgress from "@/components/public/guides/ReadingProgress";
import { areaIdentity, areaVars } from "@/components/public/guides/areaIdentity";
import {
  GUIDES,
  SERIES,
  adjacentGuides,
  formatGuideDate,
  getGuideBySlug,
  guidesForArea,
  localeCounterpart,
  localeLabel,
  readingMinutes,
  readingTimeLabel,
  relatedGuides,
} from "@/content/guides";
import { guideHeadings } from "@/content/guideHeadings";
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
  const { previous, next } = adjacentGuides(guide);
  const headings = guideHeadings(guide.body);
  const { Mark } = areaIdentity(guide.areaSlug);
  const counterpart = localeCounterpart(guide);

  const eyebrow = isSeries ? "The Companion Series" : (guideArea?.label ?? "Guides");
  const eyebrowHref = isSeries ? "/guides" : guideArea ? `/guides/${guideArea.slug}` : "/guides";

  return (
    // Every area colour on the page descends from this one declaration,
    // so no component below has to know which area it is rendering in.
    <div style={areaVars(guide.areaSlug)}>
      <ReadingProgress />

      {/* The header band. It carries the area's colour and mark, which is
          what makes a Home guide recognisable as one before a word of it
          has been read. */}
      <header className="border-b border-[var(--border)] bg-[var(--area-soft)]">
        <Container width="wide" className="pb-10 pt-10 sm:pt-14">
          <Link
            href={eyebrowHref}
            className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--area)] transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={13} aria-hidden />
            {eyebrow}
          </Link>

          <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center lg:gap-12">
            <div>
              <h1 className="max-w-[19ch] font-serif text-[32px] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
                {guide.title}
              </h1>
              <p className="mt-4 max-w-[54ch] text-[17px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
              {/* Loud, above the fold, and before a word of the procedure.
                  Six of these guides described UK probate with nothing
                  saying so, and an American reader was being told to do
                  something that does not exist where they live. */}
              {guide.locale && (
                <p className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-lg border border-[var(--area)] bg-[var(--surface)] px-3 py-2 text-[13.5px]">
                  <span className="font-bold uppercase tracking-[0.1em] text-[var(--area)]">
                    {localeLabel(guide.locale)}
                  </span>
                  <span className="text-[var(--muted)]">
                    This describes the {localeLabel(guide.locale)} procedure.
                  </span>
                  {counterpart && (
                    <Link
                      href={`/guides/${counterpart.slug}`}
                      className="font-semibold text-[var(--area)] underline underline-offset-2"
                    >
                      Read the {localeLabel(counterpart.locale!)} version
                    </Link>
                  )}
                </p>
              )}

              <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} aria-hidden className="text-[var(--area)]" />
                  {readingTimeLabel(guide)}
                </span>
                <span className="text-[var(--faint)]">
                  {guide.updatedAt
                    ? `Updated ${formatGuideDate(guide.updatedAt)}`
                    : formatGuideDate(guide.publishedAt)}
                </span>
              </p>
            </div>

            {/* The area mark. Decorative, and hidden on phones where the
                headline should own the whole first screen. */}
            <div className="hidden text-[var(--area)] lg:block">
              <Mark className="w-full" />
            </div>
          </div>
        </Container>
      </header>

      <Container width="wide" className="pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_236px] lg:gap-16">
          <article className="min-w-0 max-w-[68ch]">
            <GuideContents headings={headings} variant="disclosure" />
            <GuideBody blocks={guide.body} />

            {/* The handover. A guide that leaves a convinced reader with
                nowhere to go is just an article, so this is the point of
                the whole layer. */}
            {companion && guideArea && (
              <Handover
                label="The Companion for this"
                title={companion.title}
                body={companion.promise}
                href={`/shop/${companion.slug}`}
                cta="See what it does"
                Mark={Mark}
              />
            )}

            {isSeries && (
              <Handover
                label="The Companion Series"
                title="One Companion per part of life that is administratively hard"
                body="Money, home, mind and focus, family and learning, affairs and endings, travel. Each one holds the state for its own area and works out what genuinely needs you now."
                href="/shop"
                cta="See the Series"
                Mark={Mark}
              />
            )}

            {(previous || next) && (
              <nav
                aria-label="More in this area"
                className="mt-10 grid gap-3 border-t border-[var(--border)] pt-8 sm:grid-cols-2"
              >
                {previous ? <Adjacent guide={previous} direction="previous" /> : <span className="hidden sm:block" />}
                {next && <Adjacent guide={next} direction="next" />}
              </nav>
            )}
          </article>

          <GuideContents headings={headings} variant="rail" />
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-[var(--border)] pt-10">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">
              Related guides
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/guides/${other.slug}`}
                    className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--area)]"
                  >
                    <p className="text-[15px] font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--area)]">
                      {other.title}
                    </p>
                    <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-[var(--muted)]">{other.dek}</p>
                    <p className="mt-3 font-mono text-[11px] text-[var(--faint)]">{readingTimeLabel(other)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </div>
  );
}

/** The end-of-article handover panel, in the area's own colour. */
function Handover({
  label,
  title,
  body,
  href,
  cta,
  Mark,
}: {
  label: string;
  title: string;
  body: string;
  href: string;
  cta: string;
  Mark: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <aside className="mt-14 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--area)] bg-[var(--area-soft)]">
      <div className="flex items-start gap-6 p-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">{label}</p>
          <h2 className="mt-2 font-serif text-[22px] font-semibold leading-tight text-[var(--text)]">{title}</h2>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-[var(--muted)]">{body}</p>
          <Link
            href={href}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[var(--area)] px-4 py-2.5 text-[14px] font-semibold text-white transition-transform active:scale-[0.985]"
          >
            {cta}
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="hidden w-[120px] shrink-0 text-[var(--area)] sm:block">
          <Mark className="w-full" />
        </div>
      </div>
    </aside>
  );
}

/** Previous or next guide within the same area. */
function Adjacent({
  guide,
  direction,
}: {
  guide: { slug: string; title: string };
  direction: "previous" | "next";
}) {
  const isNext = direction === "next";
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={[
        "group flex flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--area)]",
        isNext ? "sm:text-right" : "",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]",
          isNext ? "sm:justify-end" : "",
        ].join(" ")}
      >
        {!isNext && <ArrowLeft size={12} aria-hidden />}
        {isNext ? "Next in this area" : "Previous in this area"}
        {isNext && <ArrowRight size={12} aria-hidden />}
      </span>
      <span className="mt-1.5 text-[15px] font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--area)]">
        {guide.title}
      </span>
    </Link>
  );
}

/** A life-area hub: the situation, its guides, and the Companion behind them. */
function AreaHub({ slug }: { slug: string }) {
  const area = getAreaBySlug(slug);
  if (!area) notFound();

  const guides = guidesForArea(slug);
  const companion = shopRegistry.getBySlug(area.productSlugs[0]);
  const { Mark } = areaIdentity(slug);
  const minutes = guides.reduce((total, guide) => total + readingMinutes(guide), 0);

  return (
    <div style={areaVars(slug)}>
      <header className="border-b border-[var(--border)] bg-[var(--area-soft)]">
        <Container width="wide" className="pb-10 pt-10 sm:pt-14">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-[var(--area)] transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={13} aria-hidden />
            All guides
          </Link>

          <div className="mt-5 grid gap-8 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center sm:gap-12">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--area)]">{area.label}</p>
              <h1 className="mt-3 max-w-2xl font-serif text-[32px] font-semibold leading-[1.1] tracking-tight text-balance sm:text-[42px]">
                {area.situation}
              </h1>
              <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-[var(--muted)]">
                &ldquo;{area.inTheirWords}&rdquo;
              </p>
              <p className="mt-5 font-mono text-[12px] text-[var(--faint)]">
                {guides.length} guide{guides.length === 1 ? "" : "s"} · {minutes} minutes of reading
              </p>
            </div>
            <div className="hidden text-[var(--area)] sm:block">
              <Mark className="w-full" />
            </div>
          </div>
        </Container>
      </header>

      <Container width="wide" className="pb-24 pt-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div>
            {guides.length === 0 ? (
              <p className="text-[15px] leading-relaxed text-[var(--muted)]">
                Nothing written for this area yet. The Companion for it already exists.
              </p>
            ) : (
              <ol className="flex flex-col divide-y divide-[var(--border)]">
                {guides.map((guide, i) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className="group flex gap-4 py-5 first:pt-0">
                      <span className="mt-1 shrink-0 font-mono text-[12px] tabular-nums text-[var(--faint)] transition-colors group-hover:text-[var(--area)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[18px] font-semibold leading-snug text-[var(--text)] transition-colors group-hover:text-[var(--area)]">
                          {guide.title}
                        </span>
                        <span className="mt-1.5 block text-[14.5px] leading-relaxed text-[var(--muted)]">
                          {guide.dek}
                        </span>
                        <span className="mt-2 block font-mono text-[11px] text-[var(--faint)]">
                          {readingTimeLabel(guide)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {companion && (
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[var(--radius-xl)] border border-[var(--area)] bg-[var(--area-soft)] p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">
                  The Companion for this
                </p>
                <h2 className="mt-2 font-serif text-[19px] font-semibold leading-snug text-[var(--text)]">
                  {companion.title}
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{companion.promise}</p>

                <ul className="mt-4 flex flex-col gap-2.5 border-t border-[var(--area)]/25 pt-4">
                  {area.whatHelps.map((line) => (
                    <li key={line} className="flex gap-2.5 text-[13px] leading-relaxed text-[var(--text)]">
                      <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--area)]" />
                      {line}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/shop/${companion.slug}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--area)] px-4 py-2.5 text-[14px] font-semibold text-white transition-transform active:scale-[0.985]"
                >
                  See what it does
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
}
