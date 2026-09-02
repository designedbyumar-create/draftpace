import type { Metadata } from "next";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import CaseStudyGate from "./CaseStudyGate";
import CaseStudyNav from "./CaseStudyNav";
import {
  INTRO, CONTEXT, PROBLEM, INSIGHT, RESEARCH, FIRST_ANSWER, THESIS, COMPANION,
  SHELF, SYSTEM, PROCESS, DECISIONS, REPOSITION, DEEP_DIVES, DIFFERENT,
  HELD_UP, UNPROVEN, STATS, NEXT, CLOSING,
} from "./content";
import {
  Eyebrow, SectionHeading, Prose, BigStatement, ScatterFigure, EvidenceLedger,
  Caveat, DecisionCard, RunningOrder, ProcessLoop, SystemFlow, ComparisonTable,
  AssessmentList, StatGrid, DeepDiveRows,
} from "./sections";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { formatPrice } from "@/shop/definition";
import { LIFE_AREAS } from "@/content/areas";
import { OverviewScreenMockup as MmrMockup } from "../shop/[productSlug]/monthlyMoneyResetVisuals";
import {
  OverviewScreenMockup as HmcMockup,
  ActionRecordScreenMockup as HmcRecord,
  SetupScreenMockup as HmcSetup,
} from "../shop/[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as AlongsideMockup } from "../shop/[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as HscMockup } from "../shop/[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as PlaMockup } from "../shop/[productSlug]/personalLifeAffairsCompanionVisuals";
import {
  OverviewScreenMockup as TravelMockup,
  ChangeImpactScreenMockup as TravelImpact,
  TripBriefScreenMockup as TravelBrief,
} from "../shop/[productSlug]/travelCompanionVisuals";
import {
  OverviewScreenMockup as PfcMockup,
  GuidedCompanionScreenMockup as PfcGuided,
  AttentionScreenMockup as PfcAttention,
} from "../shop/[productSlug]/personalFinanceCompanionVisuals";

export const metadata: Metadata = {
  title: "Draftpace: a product design case study by Umar Malik",
  description:
    "How seven products were designed around real parts of life instead of one interface stretched over all of them, and what the work has and has not proven.",
  alternates: { canonical: "/casestudy" },
  // Unlisted on purpose: not in any nav, not in the sitemap, and asked out
  // of search results directly rather than relied on to stay unfound.
  // CaseStudyGate is what actually keeps a visitor out.
  robots: { index: false, follow: false },
};

const AREA_MOCKUP: Record<string, React.ReactNode> = {
  money: <MmrMockup />,
  home: <HmcMockup />,
  "mind-and-focus": <AlongsideMockup />,
  "family-and-learning": <HscMockup />,
  "affairs-and-endings": <PlaMockup />,
  travel: <TravelMockup />,
};

/** The three screens shown for each deep dive, in the product's own UI. */
const DEEP_DIVE_SCREENS: Record<string, React.ReactNode[]> = {
  "home-management-companion": [<HmcMockup key="a" />, <HmcRecord key="b" />, <HmcSetup key="c" />],
  "personal-finance-companion": [<PfcMockup key="a" />, <PfcGuided key="b" />, <PfcAttention key="c" />],
  "travel-companion": [<TravelMockup key="a" />, <TravelImpact key="b" />, <TravelBrief key="c" />],
};

const NAV = [
  { id: "context", label: "Context" },
  { id: "problem", label: "The problem" },
  { id: "insight", label: "The insight" },
  { id: "research", label: "Research" },
  { id: "first-answer", label: "The first answer" },
  { id: "thesis", label: "The thesis" },
  { id: "companion", label: "The product model" },
  { id: "shelf", label: "The seven" },
  { id: "system", label: "The system" },
  { id: "process", label: "Process" },
  { id: "decisions", label: "Decisions" },
  { id: "repositioning", label: "Before and after" },
  { id: "deep-dives", label: "Deep dives" },
  { id: "difference", label: "The difference" },
  { id: "assessment", label: "What held, what did not" },
  { id: "numbers", label: "By the numbers" },
  { id: "next", label: "What happens next" },
];

/**
 * A phone screen rendered at a chosen width. The mockups are drawn at a
 * fixed 280px with fixed type inside them, so narrowing the container
 * reflows the screen rather than shrinking it. Scaling the frame is what
 * actually makes a smaller phone, and the outer box carries the screen's
 * own aspect so it reserves exactly the height the scaled frame occupies.
 */
function Screen({ children, width = 176 }: { children: React.ReactNode; width?: number }) {
  return (
    <div className="relative aspect-[9/19.5] shrink-0" style={{ width }}>
      <div
        className="absolute left-0 top-0 w-[280px] origin-top-left"
        style={{ transform: `scale(${width / 280})` }}
      >
        {children}
      </div>
    </div>
  );
}

function Section({
  id,
  children,
  tone = "default",
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "default" | "muted";
}) {
  return (
    <section
      id={id}
      className={[
        "scroll-mt-24 border-b border-[var(--border)]",
        tone === "muted" ? "bg-[var(--surface-muted)]" : "",
      ].join(" ")}
    >
      <Container width="wide" className="py-16 sm:py-20">
        {children}
      </Container>
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

  return (
    <CaseStudyGate>
      {/* Opening. Product first, byline small: this is a case study about
          the work, not an introduction to its author. */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-24 lg:py-28">
          <Eyebrow>{INTRO.eyebrow}</Eyebrow>
          <h1 className="mt-5 max-w-4xl font-serif text-[38px] font-semibold leading-[1.06] tracking-tight sm:text-[52px] lg:text-[62px]">
            {INTRO.title}
          </h1>
          <p className="mt-7 max-w-2xl text-[18px] leading-[1.65] text-[var(--muted)]">{INTRO.standfirst}</p>
          <p className="mt-4 text-[14px] text-[var(--faint)]">{INTRO.byline}</p>

          <dl className="mt-14 grid gap-x-8 gap-y-6 border-t border-[var(--border)] pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {INTRO.meta.map((m) => (
              <div key={m.label}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{m.label}</dt>
                <dd className="mt-2 text-[14px] leading-relaxed text-[var(--text)]">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <CaseStudyNav sections={NAV} />

      <div>
        <div>
          {/* Context: short, once, then out of the way. */}
          <Section id="context">
            <Eyebrow>{CONTEXT.heading}</Eyebrow>
            {CONTEXT.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
          </Section>

          <Section id="problem">
            <Eyebrow>{PROBLEM.eyebrow}</Eyebrow>
            <SectionHeading>{PROBLEM.heading}</SectionHeading>
            {PROBLEM.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <p className="mt-8 max-w-2xl font-serif text-[21px] leading-snug tracking-tight text-[var(--text)] sm:text-[24px]">
              {PROBLEM.kicker}
            </p>
            <ScatterFigure labels={PROBLEM.scatter} />
          </Section>

          <Section id="insight">
            <Eyebrow>{INSIGHT.eyebrow}</Eyebrow>
            <SectionHeading>{INSIGHT.heading}</SectionHeading>
            {INSIGHT.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
          </Section>

          <Section id="research">
            <Eyebrow>{RESEARCH.eyebrow}</Eyebrow>
            <SectionHeading>{RESEARCH.heading}</SectionHeading>
            {RESEARCH.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <EvidenceLedger rows={RESEARCH.ledger} />
            <Caveat>{RESEARCH.note}</Caveat>
          </Section>

          <Section id="first-answer">
            <Eyebrow>{FIRST_ANSWER.eyebrow}</Eyebrow>
            <SectionHeading>{FIRST_ANSWER.heading}</SectionHeading>
            {FIRST_ANSWER.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
          </Section>

          {/* The thesis. One of two moments the page raises its voice. */}
          <Section id="thesis" tone="muted">
            <BigStatement quote={THESIS.quote} support={THESIS.support} />
          </Section>

          <Section id="companion">
            <Eyebrow>{COMPANION.eyebrow}</Eyebrow>
            <SectionHeading>{COMPANION.heading}</SectionHeading>
            {COMPANION.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {COMPANION.examples.map((ex, i) => (
                <div key={ex.area} className="min-w-0">
                  <div className="flex justify-center">
                    <Screen width={168}>
                      {[<HmcMockup key="h" />, <MmrMockup key="m" />, <TravelMockup key="t" />][i]}
                    </Screen>
                  </div>
                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-ink)]">
                    {ex.area}
                  </p>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--faint)]">{ex.instead}</p>
                  <p className="mt-2.5 text-[14.5px] leading-[1.68] text-[var(--muted)]">{ex.real}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="shelf">
            <Eyebrow>{SHELF.eyebrow}</Eyebrow>
            <SectionHeading>{SHELF.heading}</SectionHeading>
            {SHELF.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {shelf.map((item) => (
                <figure key={item.slug} className="min-w-0">
                  <div className="flex justify-center">
                    <Screen width={180}>{item.mockup}</Screen>
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
          </Section>

          <Section id="system">
            <Eyebrow>{SYSTEM.eyebrow}</Eyebrow>
            <SectionHeading>{SYSTEM.heading}</SectionHeading>
            {SYSTEM.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <div className="max-w-xl">
              <SystemFlow steps={SYSTEM.flow} />
            </div>
          </Section>

          <Section id="process">
            <Eyebrow>{PROCESS.eyebrow}</Eyebrow>
            <SectionHeading>{PROCESS.heading}</SectionHeading>
            {PROCESS.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <ProcessLoop steps={PROCESS.steps} />
            <p className="mt-9 max-w-2xl font-serif text-[21px] leading-snug tracking-tight text-[var(--text)] sm:text-[24px]">
              {PROCESS.kicker}
            </p>
          </Section>

          <Section id="decisions">
            <Eyebrow>Decisions</Eyebrow>
            <SectionHeading>The decisions that shaped it</SectionHeading>
            <Prose>
              Each of these changed the product rather than the interface, and each one is recorded in the
              project&rsquo;s own history on the day it was made.
            </Prose>
            <div className="mt-12 grid gap-5 lg:grid-cols-2">
              {DECISIONS.map((d, i) => (
                <DecisionCard
                  key={d.title}
                  index={i + 1}
                  title={d.title}
                  rows={[
                    { label: "Context", text: d.context },
                    { label: "Problem", text: d.problem },
                    { label: "Options", text: d.options },
                    { label: "Decision", text: d.decision },
                    { label: "Result", text: d.result },
                  ]}
                />
              ))}
            </div>
          </Section>

          <Section id="repositioning" tone="muted">
            <Eyebrow>{REPOSITION.eyebrow}</Eyebrow>
            <SectionHeading>{REPOSITION.heading}</SectionHeading>
            {REPOSITION.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <RunningOrder side={REPOSITION.before} />
              <RunningOrder side={REPOSITION.after} />
            </div>
            <p className="mt-8 max-w-[62ch] text-[15px] leading-[1.7] text-[var(--muted)]">{REPOSITION.reason}</p>
          </Section>

          <Section id="deep-dives">
            <Eyebrow>Deep dives</Eyebrow>
            <SectionHeading>Three products, in detail</SectionHeading>
            <Prose>
              Not every product gets equal space. These three carry the thesis most clearly: one domain model, one
              ongoing system, and one product whose structure is the structure of its problem.
            </Prose>

            <div className="mt-16 space-y-20">
              {DEEP_DIVES.map((d, i) => (
                <article key={d.slug} className="grid min-w-0 gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">{d.area}</p>
                    <h3 className="mt-2 font-serif text-[26px] font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[30px]">
                      {d.name}
                    </h3>
                    <DeepDiveRows
                      rows={[
                        { label: "The problem", text: d.problem },
                        { label: "What people do now", text: d.existing },
                        { label: "The thesis", text: d.thesis },
                        { label: "The design response", text: d.response },
                        { label: "The key decision", text: d.keyDecision },
                        { label: "The result", text: d.result },
                      ]}
                    />
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    {/* One screen on the narrowest phones, two from sm,
                        all three from md. Two 152px screens plus their gap
                        need 316px, which is wider than a 320px viewport
                        leaves inside the container, so the row was setting
                        the grid track and pushing the page sideways. */}
                    <div className="flex justify-center gap-3 sm:gap-5">
                      {DEEP_DIVE_SCREENS[d.slug]?.map((screen, n) => (
                        <div
                          key={n}
                          className={n === 1 ? "hidden sm:block" : n === 2 ? "hidden md:block" : ""}
                        >
                          <Screen width={152}>{screen}</Screen>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Section>

          <Section id="difference">
            <Eyebrow>{DIFFERENT.eyebrow}</Eyebrow>
            <SectionHeading>{DIFFERENT.heading}</SectionHeading>
            {DIFFERENT.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
            <ComparisonTable rows={DIFFERENT.comparison} />
            <Caveat>{DIFFERENT.caveat}</Caveat>
          </Section>

          {/* The two assessments get equal weight on the page, because
              they carry equal weight in reality. */}
          <Section id="assessment">
            <Eyebrow>Assessment</Eyebrow>
            <SectionHeading>What held up, and what is still a guess</SectionHeading>
            <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="font-serif text-[21px] font-semibold tracking-tight text-[var(--text)]">
                  {HELD_UP.heading}
                </h3>
                <AssessmentList items={HELD_UP.items} tone="held" />
              </div>
              <div>
                <h3 className="font-serif text-[21px] font-semibold tracking-tight text-[var(--text)]">
                  {UNPROVEN.heading}
                </h3>
                <AssessmentList items={UNPROVEN.items} tone="unproven" />
              </div>
            </div>
            <p className="mt-14 max-w-2xl border-l-2 border-[var(--primary)] pl-5 font-serif text-[21px] leading-snug tracking-tight text-[var(--text)] sm:text-[25px]">
              {UNPROVEN.kicker}
            </p>
          </Section>

          <Section id="numbers">
            <Eyebrow>{STATS.eyebrow}</Eyebrow>
            <SectionHeading>{STATS.heading}</SectionHeading>
            <StatGrid items={STATS.items} />
            <p className="mt-10 text-[12.5px] text-[var(--faint)]">{STATS.note}</p>
          </Section>

          <Section id="next">
            <Eyebrow>{NEXT.eyebrow}</Eyebrow>
            <SectionHeading>{NEXT.heading}</SectionHeading>
            {NEXT.body.map((p) => (
              <Prose key={p.slice(0, 30)}>{p}</Prose>
            ))}
          </Section>
        </div>
      </div>

      {/* Closing. Mirrors the thesis, so the end answers the middle. */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
        <Container width="wide" className="py-20 sm:py-28">
          <BigStatement quote={CLOSING.quote} lines={CLOSING.lines} />
          <p className="mt-12 text-center text-[13px] text-[var(--faint)]">{CLOSING.byline}</p>
        </Container>
      </section>

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
        </Container>
      </section>
    </CaseStudyGate>
  );
}
