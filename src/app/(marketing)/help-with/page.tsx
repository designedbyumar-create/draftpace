import type { Metadata } from "next";
import Container from "@/design-system/Container";
import NeedHelpFinder, { type FinderEntry } from "@/components/public/help/NeedHelpFinder";
import { LIFE_AREAS } from "@/content/areas";
import { shopRegistry } from "@/shop/registry";
import { ensureShopRegistered } from "@/shop/ensureRegistered";
import { OverviewScreenMockup as MmrMockup } from "../shop/[productSlug]/monthlyMoneyResetVisuals";
import { OverviewScreenMockup as HmcMockup } from "../shop/[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as AlongsideMockup } from "../shop/[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as HscMockup } from "../shop/[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as PlaMockup } from "../shop/[productSlug]/personalLifeAffairsCompanionVisuals";
import { OverviewScreenMockup as TravelMockup } from "../shop/[productSlug]/travelCompanionVisuals";

export const metadata: Metadata = {
  title: "Need help",
  description:
    "Six situations the Draftpace Companion Series is built for, and the Companion that covers each one. Every situation here has a product behind it.",
  alternates: { canonical: "/help-with" },
};

/**
 * The URL stays /help-with even though the page is now called Need help.
 * It is in the sitemap, indexed, and printed inside at least one shipped
 * product, so the label is what changed and the address is not.
 */
const AREA_MOCKUP: Record<string, React.ReactNode> = {
  money: <MmrMockup />,
  home: <HmcMockup />,
  "mind-and-focus": <AlongsideMockup />,
  "family-and-learning": <HscMockup />,
  "affairs-and-endings": <PlaMockup />,
  travel: <TravelMockup />,
};

export default function NeedHelpPage() {
  ensureShopRegistered();

  const entries: FinderEntry[] = LIFE_AREAS.flatMap((area) => {
    const products = area.productSlugs
      .map((slug) => shopRegistry.getBySlug(slug))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ slug: p.slug, title: p.title, access: p.access }));
    if (products.length === 0) return [];
    return [
      {
        areaSlug: area.slug,
        areaLabel: area.label,
        situation: area.situation,
        inTheirWords: area.inTheirWords,
        whatHelps: area.whatHelps,
        products,
        mockup: AREA_MOCKUP[area.slug] ?? null,
      },
    ];
  });

  return (
    <Container width="wide" className="pb-24 pt-16 sm:pt-20">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--primary)]">Need help</p>
      <h1 className="mt-3 max-w-2xl font-serif text-[34px] font-semibold leading-tight tracking-tight sm:text-[44px]">
        Which of these sounds like your week?
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
        Pick the one closest to what you are actually dealing with. Every situation here has a Companion behind it, so
        you will not be walked through your own problem and then told we have not built anything for it.
      </p>

      <div className="mt-12">
        <NeedHelpFinder entries={entries} />
      </div>
    </Container>
  );
}
