import type { Metadata } from "next";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight, Check } from "@/design-system/Icon";
import CaseStudyGate from "./CaseStudyGate";
import CaseStudyNav from "./CaseStudyNav";
import { INTRO, SECTIONS, type Section } from "./content";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { formatPrice } from "@/shop/definition";
import { LIFE_AREAS } from "@/content/areas";
import { OverviewScreenMockup as MmrMockup } from "../shop/[productSlug]/monthlyMoneyResetVisuals";
import { OverviewScreenMockup as HmcMockup } from "../shop/[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as AlongsideMockup } from "../shop/[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as HscMockup } from "../shop/[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as PlaMockup } from "../shop/[productSlug]/personalLifeAffairsCompanionVisuals";
import { OverviewScreenMockup as TravelMockup } from "../shop/[productSlug]/travelCompanionVisuals";

export const metadata: Metadata = {
  title: "Draftpace: a product design case study by Umar Malik",
  description:
    "How one person designed and built seven products for the parts of life that are hard to keep track of, what the work taught him, and the question he has not answered yet.",
  alternates: { canonical: "/casestudy" },
  // Unlisted on purpose: not in any nav, not in the sitemap, and asked
  // out of search results directly rather than relied on to stay
  // unfound. The route itself is still reachable by anyone with the
  // link; CaseStudyGate is what actually keeps a visitor out.
  robots: { index: false, follow: false },
};

/** The mockup that stands for each area, rendered on the server. */
const AREA_MOCKUP: Record<string, React.ReactNode> = {
  money: <MmrMockup />,
  home: <HmcMockup />,
  "mind-and-focus": <AlongsideMockup />,
  "family-and-learning": <HscMockup />,
  "affairs-and-endings": <PlaMockup />,
  travel: <TravelMockup />,
};

/**
 * A note the reader must be able to tell apart from the narrative at a
 * glance. The three kinds carry genuinely different weight, so they are
 * not styled identically: a reconstruction is a caveat about how we know
 * something, an unverified note is a limit on what is known at all, and a
 * decision note is the reasoning behind a choice.
 */
function Note({ note }: { note: NonNullable<Section["note"]> }) {
  const label =
    note.kind === "reconstructed"
      ? "Reconstructed after the fact"
      : note.kind === "unverified"
        ? "Not verified"
        : "Why this was decided";
  return (
    <aside className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)] px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{label}</p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{note.text}</p>
    </aside>
  );
}

function SectionBlock({ section, index }: { section: Section; index: number }) {
  return (
    <section id={section.id} className="scroll-mt-28 border-t border-[var(--border)] pt-12 first:border-t-0 first:pt-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">
        {String(index + 1).padStart(2, "0")} &nbsp;/&nbsp; {section.label}
      </p>
      <h2 className="mt-4 max-w-2xl font-serif text-[28px] font-semibold leading-[1.15] tracking-tight sm:text-[34px]">
        {section.heading}
      </h2>

      {section.standfirst && (
        <p className="mt-5 max-w-2xl font-serif text-[19px] leading-relaxed text-[var(--text)] sm:text-[21px]">
          {section.standfirst}
        </p>
      )}

      {section.body?.map((p) => (
        <p key={p.slice(0, 40)} className="mt-5 max-w-2xl text-[16px] leading-[1.72] text-[var(--muted)]">
          {p}
        </p>
      ))}

      {section.list && (
        <ul className="mt-8 max-w-2xl space-y-6" role="list">
          {section.list.map((item) => (
            <li key={item.head} className="flex gap-3.5">
              <Check size={15} className="mt-1 shrink-0 text-[var(--success)]" aria-hidden />
              <div>
                <p className="text-[15.5px] font-semibold leading-snug text-[var(--text)]">{item.head}</p>
                <p className="mt-1.5 text-[15px] leading-[1.7] text-[var(--muted)]">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {section.quote && (
        <figure className="mt-8 max-w-2xl border-l-2 border-[var(--primary)] pl-5">
          <blockquote className="font-serif text-[21px] leading-snug text-[var(--text)] sm:text-[24px]">
            {section.quote.text}
          </blockquote>
          <figcaption className="mt-3 text-[13px] leading-relaxed text-[var(--faint)]">{section.quote.source}</figcaption>
        </figure>
      )}

      {section.note && <Note note={section.note} />}
    </section>
  );
}

export default function CaseStudyPage() {
  ensureShopRegistered();

  const shelf = LIFE_AREAS.flatMap((area) => {
    const product = shopRegistry.getBySlug(area.productSlugs[0]);
    const mockup = AREA_MOCKUP[area.slug];
    if (!product || !mockup) return [];
    return [{ area: area.label, title: product.title, slug: product.slug, price: formatPrice(product), mockup }];
  });

  const navSections = SECTIONS.map((s) => ({ id: s.id, label: s.label }));

  return (
    <CaseStudyGate>
    <>
      {/* Opening. Deliberately quiet: the claim this page has to earn is
          made by the writing, so the top of it does not shout. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20 lg:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">{INTRO.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-serif text-[36px] font-semibold leading-[1.08] tracking-tight sm:text-[48px] lg:text-[58px]">
            {INTRO.title}
          </h1>
          <p className="mt-7 max-w-2xl text-[17px] leading-[1.7] text-[var(--muted)] sm:text-[18px]">
            {INTRO.standfirst}
          </p>

          <dl className="mt-12 grid gap-x-8 gap-y-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {INTRO.meta.map((m) => (
              <div key={m.label}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{m.label}</dt>
                <dd className="mt-2 text-[14px] leading-relaxed text-[var(--text)]">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* The narrative, with the section rail beside it from xl up. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <div className="grid gap-14 xl:grid-cols-[210px_1fr] xl:gap-16">
            <CaseStudyNav sections={navSections} />
            <div className="min-w-0 space-y-14">
              {SECTIONS.map((s, i) => (
                <SectionBlock key={s.id} section={s} index={i} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* The shelf itself, so the reader can see the thing being described
          rather than only reading about it. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">The shipped work</p>
          <h2 className="mt-4 max-w-2xl font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
            Six areas of life, one foundation underneath all of them.
          </h2>
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.72] text-[var(--muted)]">
            These are the real screens, not drawings of them. A seventh product sits alongside the money one, which is
            why six areas hold seven products.
          </p>

          <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {shelf.map((item) => (
              <figure key={item.slug} className="min-w-0">
                <div className="relative mx-auto aspect-[9/19.5] w-[188px]">
                  <div className="absolute left-0 top-0 w-[280px] origin-top-left scale-[0.6714]">{item.mockup}</div>
                </div>
                <figcaption className="mt-6 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{item.area}</p>
                  <p className="mt-1.5 font-serif text-[17px] font-semibold leading-snug tracking-tight text-[var(--text)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--muted)]">{item.price}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Close. One way onward into the real product, and one line that
          keeps the page honest to the last screen. */}
      <section>
        <Container width="narrow" className="py-16 text-center sm:py-20">
          <h2 className="font-serif text-[26px] font-semibold leading-tight tracking-tight sm:text-[32px]">
            The products are real. Go and look at them.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
            Everything described here is running. One of the seven is free, so you can see how it behaves without
            spending anything.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              See the Companion Series
            </Button>
            <Button href="/how-it-works" variant="outline" size="lg">
              How they work
            </Button>
          </div>
          <p className="mt-10 text-[13px] leading-relaxed text-[var(--faint)]">
            Written by Umar Malik, who designed and built Draftpace.
          </p>
        </Container>
      </section>
    </>
    </CaseStudyGate>
  );
}
