import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/design-system/Button";
import Container from "@/design-system/Container";
import { ArrowRight } from "@/design-system/Icon";
import CompanionPicker, { type PickerPanel } from "@/components/public/home/CompanionPicker";
import CompanionAccordion from "@/components/public/home/CompanionAccordion";
import type { SceneData, PosterTheme } from "@/components/public/home/posterTypes";
import TellItOnce from "@/components/public/home/TellItOnce";
import TrustSection from "@/components/public/home/TrustSection";
import { softwareApplicationStructuredData } from "@/lib/structuredData";
import { LIFE_AREAS } from "@/content/areas";
import { POSTER_SCENES } from "@/content/homepagePosters";
import { accentWash, deriveDarkTones } from "@/design-system/accentTone";
import { productRegistry } from "@/product-framework/registry";
import { ensureProductsRegistered } from "@/products/manifest";
import { discountPercent, formatCompareAtPrice, formatPrice } from "@/shop/definition";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { BreakdownScreenMockup as MmrSecond } from "./shop/[productSlug]/monthlyMoneyResetVisuals";
import {
  OverviewScreenMockup as PfcMockup,
  PayoffScreenMockup as PfcSecond,
} from "./shop/[productSlug]/personalFinanceCompanionVisuals";
import {
  OverviewScreenMockup as HmcMockup,
  ActionRecordScreenMockup as HmcSecond,
} from "./shop/[productSlug]/homeManagementCompanionVisuals";
import {
  OverviewScreenMockup as AlongsideMockup,
  CompanionScreenMockup as AlongsideSecond,
} from "./shop/[productSlug]/adhdLifeCompanionVisuals";
import {
  OverviewScreenMockup as HscMockup,
  CheckScreenMockup as HscSecond,
} from "./shop/[productSlug]/homeschoolingCompanionVisuals";
import {
  OverviewScreenMockup as PlaMockup,
  BookScreenMockup as PlaSecond,
} from "./shop/[productSlug]/personalLifeAffairsCompanionVisuals";
import {
  OverviewScreenMockup as TravelMockup,
  ChangeImpactScreenMockup as TravelSecond,
} from "./shop/[productSlug]/travelCompanionVisuals";
import {
  OverviewScreenMockup as VmcMockup,
  ServiceBoundaryScreenMockup as VmcSecond,
} from "./shop/[productSlug]/vehicleMaintenanceCompanionVisuals";
import {
  OverviewScreenMockup as FhbMockup,
  CaregiverSheetScreenMockup as FhbSecond,
} from "./shop/[productSlug]/familyHealthBinderVisuals";

export const metadata: Metadata = {
  title: "Companions for the parts of life that are hard to keep track of",
  description:
    "The Draftpace Companion Series: products for money, home, focus, family, affairs, travel, vehicles and family health. Each remembers how your situation fits together, tells you what needs you now, and stays quiet when nothing does.",
  alternates: { canonical: "/" },
};

/**
 * The mockup that represents each area in the hero picker. Rendered here,
 * on the server, and handed to the client picker as a prop, so that
 * component never has to import a route module.
 */
const AREA_MOCKUP: Record<string, React.ReactNode> = {
  money: <PfcMockup />,
  home: <HmcMockup />,
  "mind-and-focus": <AlongsideMockup />,
  "family-and-learning": <HscMockup />,
  "affairs-and-endings": <PlaMockup />,
  travel: <TravelMockup />,
  vehicles: <VmcMockup />,
  "family-health": <FhbMockup />,
};

/**
 * The screen that sits behind the overview in the hero's offset pair.
 *
 * Not a second arbitrary screen: each of these is the one thing that
 * product is actually for, and the overview alone never shows it. The
 * breakdown behind Safe-to-Spend, the printed book behind Personal Life
 * Affairs, the Service Boundary behind Vehicle Maintenance. Two screens
 * say twice as much about a product as one, and every one of these was
 * already drawn for its own Shop page.
 */
const AREA_SECOND_MOCKUP: Record<string, React.ReactNode> = {
  money: <PfcSecond />,
  home: <HmcSecond />,
  "mind-and-focus": <AlongsideSecond />,
  "family-and-learning": <HscSecond />,
  "affairs-and-endings": <PlaSecond />,
  travel: <TravelSecond />,
  vehicles: <VmcSecond />,
  "family-health": <FhbSecond />,
};

/** The face each product's own headings speak in, and the one that labels everything in monospace. */
const HEADLINE_FONT: Record<string, string> = {
  "personal-finance-companion": "var(--font-fraunces), ui-serif, Georgia, serif",
  "travel-companion": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  "vehicle-maintenance-companion": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  "family-health-binder": "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
};
const SERIF = "var(--font-newsreader), ui-serif, Georgia, serif";
const RADIUS: Record<string, number> = { sharp: 4, standard: 16, soft: 24 };

export default function HomePage() {
  ensureShopRegistered();
  ensureProductsRegistered();

  /*
    Each poster wears its own product's colours: the ground and accent from
    its definition, so re-theming a product moves its poster with it. A
    product with no ground of its own (Home Base, Homeschooling) gets a
    pale wash of its accent, worked out the way the Shop's store images are.

    Every value is a `light-dark()` pair rather than a single resolved
    colour. A poster section sets these as literal --poster-* custom
    properties (CompanionShowcase.tsx), and an inline custom property
    can't answer a media query on its own: a single light value would
    stay light no matter the visitor's theme, the same failure
    productThemeStyle() was rewritten once already to avoid (see its own
    comment). `light-dark()` resolves against the page's `color-scheme`,
    which globals.css already sets correctly for all three theme states,
    so no extra plumbing is needed to make eight product sections behave
    like the rest of the page in dark mode.
  */
  function posterTheme(slug: string): PosterTheme | null {
    const theme = productRegistry.getBySlug(slug)?.theme;
    const scale = theme?.accentScale;
    if (!theme || !scale) return null;
    const groundLight = theme.ground?.light;
    const groundDark = theme.ground?.dark;
    const darkScale = theme.accentScaleDark ?? deriveDarkTones(scale.base);
    const heroLight = theme.hero?.light;
    const heroDark = theme.hero?.dark;
    const ld = (light: string, dark: string) => `light-dark(${light}, ${dark})`;
    return {
      bg: ld(groundLight?.appBg ?? accentWash(scale.base, 0.955), groundDark?.appBg ?? accentWash(scale.base, 0.13)),
      surface: ld(groundLight?.surface ?? accentWash(scale.base, 0.995), groundDark?.surface ?? accentWash(scale.base, 0.17)),
      text: ld(groundLight?.text ?? "#1c1917", groundDark?.text ?? "#f5f2ea"),
      muted: ld(groundLight?.muted ?? "#57534e", groundDark?.muted ?? "#b1aa9d"),
      border: ld(groundLight?.border ?? accentWash(scale.base, 0.86), groundDark?.border ?? accentWash(scale.base, 0.26)),
      accent: ld(scale.base, darkScale.base),
      accentContrast: ld(scale.contrast, darkScale.contrast),
      soft: ld(scale.soft, darkScale.soft),
      radius: RADIUS[theme.identity?.shape ?? "standard"],
      headlineFont: HEADLINE_FONT[slug] ?? SERIF,
      monoLabels: slug === "vehicle-maintenance-companion",
      hero: heroLight && heroDark ? { from: ld(heroLight.from, heroDark.from), mid: ld(heroLight.mid, heroDark.mid), to: ld(heroLight.to, heroDark.to), ink: ld(heroLight.ink, heroDark.ink) } : undefined,
    };
  }

  const scenes: SceneData[] = POSTER_SCENES.flatMap((scene) => {
    const posters = scene.products.flatMap((content) => {
      const product = shopRegistry.getBySlug(content.productSlug);
      const area = LIFE_AREAS.find((a) => a.slug === content.areaSlug);
      const theme = posterTheme(content.productSlug);
      if (!product || !area || !theme) return [];
      return [{ productSlug: product.slug, title: product.title, area: area.label, priceLabel: formatPrice(product), headline: content.headline, beats: content.beats.map(({ lead, text }) => ({ lead, text })), theme }];
    });
    return posters.length === 2 ? [{ id: scene.id, title: scene.title, posters: [posters[0], posters[1]] as SceneData["posters"] }] : [];
  });

  const panels: PickerPanel[] = LIFE_AREAS.flatMap((area) => {
    const productSlug = area.productSlugs[0];
    const product = shopRegistry.getBySlug(productSlug);
    const mockup = AREA_MOCKUP[area.slug];
    const secondaryMockup = AREA_SECOND_MOCKUP[area.slug];
    if (!product || !mockup) return [];
    return [
      {
        areaSlug: area.slug,
        areaLabel: area.label,
        productSlug: product.slug,
        productTitle: product.title,
        // Formatted here, by the same helpers the Shop grid and the
        // product page use, so the hero can never quote a price that
        // disagrees with the page it links to.
        priceLabel: formatPrice(product),
        compareAtLabel: formatCompareAtPrice(product),
        savingsPercent: discountPercent(product),
        isFree: product.access === "free",
        comingSoon: product.availability === "coming-soon",
        mockup,
        secondaryMockup,
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
        <Container width="wide" className="py-12 sm:py-14 lg:py-16">
          <CompanionPicker panels={panels} />
        </Container>
      </section>

      {/* 2. How a Companion works, to try */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-24">
          <TellItOnce />
        </Container>
      </section>

      {/* 4. The Companions, one to a section, each with a working demo */}
      <section className="border-t border-[var(--border)]">
        <Container width="wide" className="pb-14 pt-20 sm:pb-20 sm:pt-28">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">The Companions</p>
          <h2 className="mt-3 max-w-3xl font-serif text-[38px] font-semibold leading-[1.05] tracking-[-0.025em] sm:text-[60px]">
            Apps designed around your needs.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-[var(--muted)]">
            The Companion Series is eight apps, each built for one hard thing and each with a look of its own. Every one
            below works, so touch it.{" "}
            A Companion never tells you that you are behind.
          </p>
        </Container>
        <Container width="wide">
          <CompanionAccordion posters={scenes.flatMap((scene) => scene.posters)} />
        </Container>
        <div className="flex justify-center border-t border-[var(--border)] py-14">
          <Button href="/shop" variant="secondary" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
            Compare them side by side
          </Button>
        </div>
      </section>

      {/*
        5b. The free way in.

        Below the fold on purpose. The free product used to lead the hero
        and the Shop grid, which put the thing that earns nothing in the
        most valuable slot on the site and anchored every price after it
        against zero. It belongs here instead: after somebody has seen
        what the series is and what these products cost, as the answer to
        "is there a way to try this". Its own page carries the actual
        argument, so this is one claim and one link, not a second sales
        pitch competing with the series above it.
      */}
      <section className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
        <Container width="wide" className="py-16 sm:py-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
            <div className="min-w-0 max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--brand-ink)]">
                Start free
              </p>
              <h2 className="mt-3 font-serif text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
                One of them costs nothing, and is not a trial.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
                Monthly Money Reset shows what is genuinely safe to spend after what is already committed. It is a
                complete, narrower product rather than a preview of a paid one, and it is the fastest way to find out
                whether a Companion suits how you think before you spend anything.
              </p>
              <div className="mt-6">
                <Button href="/free" size="lg" iconRight={<ArrowRight size={16} aria-hidden />}>
                  See what it does
                </Button>
              </div>
            </div>
            {/*
              This section used to be text and a button on a plain tinted
              field, the one place on the page making a real product
              claim with nothing to look at. MmrSecond (the Breakdown
              screen) rather than the Overview MmrMockup already shown at
              the top of the hero: showing the same screen twice on one
              page would read as a rerun, and the breakdown is the part
              of the free product's own honesty claim, "money available
              right now" reconciled line by line, that most needs
              showing rather than telling.
            */}
            <div className="w-full max-w-[220px] shrink-0 self-center lg:self-auto">
              <MmrSecond />
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Owned, not rented */}
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
          {/*
            These three were rounded pills with a border and a shadow,
            which is the shape this site uses for a filter chip and for
            the hero's area picker. Both of those are buttons, so three
            static pills sitting under a heading read as controls that
            had stopped working: people click them and nothing happens.

            The fix is not a different pill. A claim like "no ads, no
            data resale" is worth more said properly than compressed
            into two words, so each one now states itself and then says
            what makes it true, and the section ends with a real link to
            the page that carries the whole argument.
          */}
          <dl className="mx-auto mt-10 grid max-w-2xl gap-x-8 gap-y-6 text-left sm:grid-cols-3">
            {[
              {
                term: "Yours to keep",
                detail: "One payment, no renewal date. Step away for a year and it is exactly as you left it.",
              },
              {
                term: "Works offline",
                detail: "Installable as an app, and what you have already loaded stays readable without a signal.",
              },
              {
                term: "No ads, no data resale",
                detail: "Nothing here is sold or used for advertising, and no product is read by an AI model.",
              },
            ].map((item) => (
              <div key={item.term}>
                <dt className="font-serif text-[16px] font-semibold leading-snug tracking-tight text-[var(--text)]">
                  {item.term}
                </dt>
                <dd className="mt-1.5 text-[13px] leading-relaxed text-[var(--muted)]">{item.detail}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Link
              href="/trust"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:underline"
            >
              How we handle your data
              <ArrowRight size={15} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>

      {/* 7. Trust */}
      <section className="border-b border-[var(--border)]">
        <Container width="wide" className="py-16 sm:py-20">
          <TrustSection />
        </Container>
      </section>

      {/* 8. Closing */}
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
