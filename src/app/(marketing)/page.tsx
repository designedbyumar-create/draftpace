import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import CompanionPicker, { type PickerPanel } from "@/components/public/home/CompanionPicker";
import ChangeImpactDemo from "@/components/public/home/ChangeImpactDemo";
import ShopPreview from "@/components/public/home/ShopPreview";
import TrustSection from "@/components/public/home/TrustSection";
import { softwareApplicationStructuredData } from "@/lib/structuredData";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { OverviewScreenMockup as MmrMockup } from "./shop/[productSlug]/monthlyMoneyResetVisuals";
import { OverviewScreenMockup as HmcMockup } from "./shop/[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as AlongsideMockup } from "./shop/[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as HscMockup } from "./shop/[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as PlaMockup } from "./shop/[productSlug]/personalLifeAffairsCompanionVisuals";
import { OverviewScreenMockup as TravelMockup } from "./shop/[productSlug]/travelCompanionVisuals";

export const metadata: Metadata = {
  title: "Companions for the parts of life that are hard to keep track of",
  description:
    "The Draftpace Companion Series: seven products for money, home, focus, family, affairs and travel. Each remembers how your situation fits together, tells you what needs you now, and stays quiet when nothing does.",
  alternates: { canonical: "/" },
};

/**
 * The mockup that represents each area in the hero picker. Rendered here,
 * on the server, and handed to the client picker as a prop, so that
 * component never has to import a route module.
 */
const AREA_MOCKUP: Record<string, React.ReactNode> = {
  money: <MmrMockup />,
  home: <HmcMockup />,
  "mind-and-focus": <AlongsideMockup />,
  "family-and-learning": <HscMockup />,
  "affairs-and-endings": <PlaMockup />,
  travel: <TravelMockup />,
};

export default function HomePage() {
  ensureShopRegistered();

  const panels: PickerPanel[] = LIFE_AREAS.flatMap((area) => {
    const productSlug = area.productSlugs[0];
    const product = shopRegistry.getBySlug(productSlug);
    const mockup = AREA_MOCKUP[area.slug];
    if (!product || !mockup) return [];
    return [
      {
        areaSlug: area.slug,
        areaLabel: area.label,
        situation: area.situation,
        whatHelps: area.whatHelps,
        productSlug: product.slug,
        productTitle: product.title,
        mockup,
      },
    ];
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationStructuredData()) }}
      />

      {/* 1. Hero: which part of life is this for */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20 lg:py-24">
          <CompanionPicker panels={panels} />
        </Container>
      </section>

      {/* 2. The differentiator, made touchable */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <ChangeImpactDemo />
        </Container>
      </section>

      {/* 3. How these behave */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">How these behave</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            It never tells you that you are behind.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            There is no streak in any Draftpace product, no completion percentage, and no screen that counts what you
            did not get to. Something you left unfinished records nothing at all.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                head: "Quiet by default",
                body: "It stays silent until something is genuinely worth raising, and says so plainly when nothing is.",
              },
              {
                head: "Derived, never invented",
                body: "Every line traces back to something you recorded yourself. Nothing here manufactures urgency.",
              },
              {
                head: "No model, anywhere",
                body: "There is no AI in any of this. What it suggests was written by a person, and it never guesses.",
              },
              {
                head: "Holds the connections",
                body: "It remembers how the pieces of your situation depend on each other, which is the part nobody can hold.",
              },
              {
                head: "Nothing is destroyed",
                body: "Corrections archive rather than delete, and history is never rewritten after the fact.",
              },
              {
                head: "Bought once, owned",
                body: "No subscription to babysit. It does not expire if you step away for a year.",
              },
            ].map((item) => (
              /*
                These six were flat bordered boxes whose heading and body
                were both 14px, so each card was a single grey block with
                no hierarchy and the set read as filler. The fix is
                typographic rather than decorative: the guarantee itself
                is now the display line, in the same serif the page's own
                headings use, with the explanation as fine print beneath
                it. Deliberately no icon per card (CLAUDE.md's icon rule)
                and no accent rail.

                Flat at rest, on purpose. Hover adds the faintest shadow
                in the ramp and firms the hairline, and does nothing
                else: no lift, no elevation jump. Six cards that each
                rose and grew a shadow under the pointer made this
                section restless to read.
              */
              <div
                key={item.head}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 transition-[box-shadow,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:border-[var(--border-strong)] hover:shadow-[shadow:var(--shadow-xs)]"
              >
                <p className="font-serif text-[17px] font-semibold leading-snug tracking-tight text-[var(--text)]">
                  {item.head}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-[var(--faint)]">
            Most things you buy online die on download. A Companion is the opposite of a file: it is still working the
            whole time you own it.
          </p>
        </Container>
      </section>

      {/* 4. The series */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">The Companion Series</p>
          <h2 className="mt-3 max-w-2xl font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            Seven companions. Each one does a single hard thing.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            We make every one ourselves, so the series stays small and each product earns its place. Smaller, lighter
            products will follow, and they will be their own thing rather than a watered down Companion.
          </p>
          <div className="mt-10">
            <ShopPreview />
          </div>
        </Container>
      </section>

      {/* 5. Owned, not rented */}
      <section className="border-b border-[var(--border)]">
        <Container width="narrow" className="py-16 text-center sm:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">Owned, not rented</p>
          <h2 className="mt-3 font-serif text-[30px] font-semibold leading-tight tracking-tight sm:text-[38px]">
            You own it. It does not expire, and it does not watch you.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--muted)]">
            A Companion is yours to keep and open whenever you want. No feed, no ads, nothing sold about you. It works
            on your side, quietly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {["Yours to keep", "Works offline", "No ads, no data resale"].map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[13px] font-semibold text-[var(--text)] shadow-[shadow:var(--shadow-xs)]"
              >
                {chip}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Trust */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <TrustSection />
        </Container>
      </section>

      {/* 7. Closing */}
      <section>
        <Container width="wide" className="py-16 text-center sm:py-24">
          <h2 className="font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[36px]">
            Find the one that fits your situation.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/shop" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
              See the Companion Series
            </Button>
            <Link href="/login" className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--text)]">
              Already using Draftpace? Sign in
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
