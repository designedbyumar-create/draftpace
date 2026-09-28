import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import { LIFE_AREAS, type LifeArea } from "@/content/areas";
import { GUIDES, getGuideBySlug, guidesForArea, type Guide } from "@/content/guides";
import { guideArt } from "@/content/guideArt";
import { areaIdentity } from "./areaIdentity";
import GuideCard from "./GuideCard";

/**
 * The places the rest of the site points into the guides.
 *
 * Until these existed, no page outside /guides linked to a guide: the
 * homepage, the shop pages, /free and the nav all stopped at the
 * products. That left the guides, which exist to be found and to hand
 * readers to a Companion, reachable only from the footer and each other.
 *
 * Both components read `startHere` from areas.ts, so what the site
 * recommends first lives in one place and the test that guards it
 * (areas.test.ts) covers every page that shows it.
 */

function startGuides(area: LifeArea): Guide[] {
  return area.startHere.map((slug) => getGuideBySlug(slug)).filter((g): g is Guide => Boolean(g));
}

/**
 * The homepage strip: one flagship guide per area.
 *
 * This used to be eight separate area panels, each a flat colour fill
 * with its own "All N guides" link: a page-wide grid of category tiles
 * rather than an index of specific articles. `startHere[0]` is already
 * every area's own top pick, so this costs nothing new to maintain:
 * each area's first choice becomes one card, with the same title-and-
 * summary shape a real article card needs to read as an article rather
 * than a category tile, and one plain link at the end goes to the full
 * index instead of eight separate ones.
 */
export function StartWithGuides() {
  const flagships = LIFE_AREAS.map((area) => ({ area, guide: startGuides(area)[0] })).filter(
    (entry): entry is { area: LifeArea; guide: Guide } => Boolean(entry.guide)
  );

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">Free guides</p>
      <h2 className="mt-3 max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
        Start with what is actually going wrong today.
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
        Plain answers to the questions people search for when money, a house, a trip or a paperwork pile gets away
        from them. Nothing to sign up for.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
        {flagships.map(({ area, guide }) => (
          <GuideCard
            key={guide.slug}
            variant="minimal"
            areaSlug={area.slug}
            thumb={guideArt(guide.slug)?.thumb}
            guide={{ slug: guide.slug, title: guide.title, dek: guide.dek, areaLabel: area.label }}
          />
        ))}
      </div>

      <Link
        href="/guides"
        className="mt-10 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
      >
        See all {GUIDES.length} guides <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}

/** The list on a Companion's own page: the guides that answer what somebody arrives searching for. */
export function GuidesForCompanion({ areaSlug }: { areaSlug: string }) {
  const area = LIFE_AREAS.find((a) => a.slug === areaSlug);
  if (!area) return null;
  const guides = startGuides(area);
  if (guides.length === 0) return null;
  const { Mark } = areaIdentity(areaSlug);
  return (
    <div>
      <ul className="flex flex-col gap-5">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <GuideCard
              variant="row"
              areaSlug={areaSlug}
              thumb={guideArt(guide.slug)?.thumb}
              fallback={<Mark />}
              guide={{ slug: guide.slug, title: guide.title, dek: guide.dek }}
            />
          </li>
        ))}
      </ul>
      <Link
        href={`/guides/${area.slug}`}
        className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--primary)] hover:underline"
      >
        All {guidesForArea(area.slug).length} {area.label.toLowerCase()} guides <ArrowRight size={14} aria-hidden />
      </Link>
    </div>
  );
}
