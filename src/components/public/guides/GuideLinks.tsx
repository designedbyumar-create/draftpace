import Link from "next/link";
import { ArrowRight } from "@/design-system/Icon";
import { LIFE_AREAS, type LifeArea } from "@/content/areas";
import { getGuideBySlug, guidesForArea, type Guide } from "@/content/guides";
import { areaIdentity } from "./areaIdentity";

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

/** The homepage strip: every area, three guides each, in the area's own colour. */
export function StartWithGuides() {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">Free guides</p>
      <h2 className="mt-3 max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
        Start with the problem you are having.
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
        Plain answers to the questions people search for when money, a house, a trip or a paperwork pile gets away
        from them. Nothing to sign up for.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {LIFE_AREAS.map((area) => {
          const { accent, soft } = areaIdentity(area.slug);
          const guides = startGuides(area);
          if (guides.length === 0) return null;
          return (
            <section
              key={area.slug}
              aria-labelledby={`start-${area.slug}`}
              className="flex flex-col rounded-2xl border border-[var(--border)] p-5"
              style={{ background: soft }}
            >
              <h3 id={`start-${area.slug}`} className="text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
                <Link href={`/guides/${area.slug}`} className="hover:underline">
                  {area.label}
                </Link>
              </h3>
              <ul className="mt-3 flex flex-1 flex-col gap-2.5">
                {guides.map((guide) => (
                  <li key={guide.slug}>
                    <Link href={`/guides/${guide.slug}`} className="text-[14.5px] font-semibold leading-snug text-[var(--text)] hover:underline">
                      {guide.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/guides/${area.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold hover:underline"
                style={{ color: accent }}
              >
                All {guidesForArea(area.slug).length} {area.label.toLowerCase()} guides <ArrowRight size={13} aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/** The list on a Companion's own page: the guides that answer what somebody arrives searching for. */
export function GuidesForCompanion({ areaSlug }: { areaSlug: string }) {
  const area = LIFE_AREAS.find((a) => a.slug === areaSlug);
  if (!area) return null;
  const guides = startGuides(area);
  if (guides.length === 0) return null;
  return (
    <div>
      <ul className="flex flex-col gap-4">
        {guides.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/guides/${guide.slug}`} className="text-[15.5px] font-semibold leading-snug text-[var(--primary)] hover:underline">
              {guide.title}
            </Link>
            <p className="mt-1 max-w-[42rem] text-[14px] leading-relaxed text-[var(--muted)]">{guide.dek}</p>
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
