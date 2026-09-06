import { OverviewScreenMockup as MmrOverview, AddInfoScreenMockup as MmrAddInfo, BreakdownScreenMockup as MmrBreakdown } from "./[productSlug]/monthlyMoneyResetVisuals";
import { OverviewScreenMockup as PfcOverview, GuidedCompanionScreenMockup as PfcGuided, AttentionScreenMockup as PfcAttention } from "./[productSlug]/personalFinanceCompanionVisuals";
import { OverviewScreenMockup as HmcOverview, ActionRecordScreenMockup as HmcActionRecord, SetupScreenMockup as HmcSetup } from "./[productSlug]/homeManagementCompanionVisuals";
import { OverviewScreenMockup as PlaOverview, CompanionScreenMockup as PlaCompanion, BookScreenMockup as PlaBook } from "./[productSlug]/personalLifeAffairsCompanionVisuals";
import { OverviewScreenMockup as HscOverview, CheckScreenMockup as HscCheck, BookScreenMockup as HscBook } from "./[productSlug]/homeschoolingCompanionVisuals";
import { OverviewScreenMockup as AlongsideOverview, CompanionScreenMockup as AlongsideCompanion, LifeScreenMockup as AlongsideLife } from "./[productSlug]/adhdLifeCompanionVisuals";
import { OverviewScreenMockup as TravelOverview, ChangeImpactScreenMockup as TravelChangeImpact, TripBriefScreenMockup as TravelTripBrief } from "./[productSlug]/travelCompanionVisuals";

/**
 * The one place that maps a real product slug to the three real phone
 * screens that represent it: the screen somebody lands on, and two more
 * that show what actually using it looks like.
 *
 * Lives here rather than inside shop/page.tsx because it is no longer
 * only the Shop's: the authenticated Library shelf and each owned
 * product's manual page draw the same screens, and a person who buys a
 * product should recognise it afterwards as the same thing they were
 * shown. One map, so those three surfaces can never disagree.
 *
 * A product with no entry gets an honest fallback at each call site
 * (listing media, then the product's own icon), never a fabricated
 * image, and never one screen scrolled to fake a second one.
 */
export const PRODUCT_SCREENS: Partial<Record<string, React.ComponentType[]>> = {
  "monthly-money-reset": [MmrOverview, MmrAddInfo, MmrBreakdown],
  "personal-finance-companion": [PfcOverview, PfcGuided, PfcAttention],
  "home-management-companion": [HmcOverview, HmcActionRecord, HmcSetup],
  "personal-life-affairs-companion": [PlaOverview, PlaCompanion, PlaBook],
  "homeschooling-companion": [HscOverview, HscCheck, HscBook],
  alongside: [AlongsideOverview, AlongsideCompanion, AlongsideLife],
  "travel-companion": [TravelOverview, TravelChangeImpact, TravelTripBrief],
};

/** The three screens for a product, already instantiated, or null when it has none. */
export function screensFor(slug: string): React.ReactNode[] | null {
  const Screens = PRODUCT_SCREENS[slug];
  if (!Screens) return null;
  return Screens.map((Screen, i) => <Screen key={i} />);
}

/**
 * What each screen actually is, in the same order as PRODUCT_SCREENS.
 *
 * Every line here is taken from the drawing's own doc comment in its
 * *Visuals.tsx file, the note the person who drew it wrote about which
 * real product surface it mirrors, rather than written fresh as
 * marketing copy. If a mockup is ever redrawn to show a different
 * screen, its caption is wrong in exactly the same commit its comment
 * is, which is the point.
 *
 * Used by the owned-product manual, which shows the screens one at a
 * time and has to say what you are looking at; the Shop card cycles
 * them silently and needs none of this.
 */
const SCREEN_CAPTIONS: Partial<Record<string, string[]>> = {
  "monthly-money-reset": [
    "What you land on",
    "Adding something, mid-input",
    "The breakdown behind the number",
  ],
  "personal-finance-companion": [
    "The picture you land on",
    "The guided way you build it, one question at a time",
    "The honest gaps it watches for, never a fabricated task",
  ],
  "home-management-companion": [
    "Home: one sentence about how your home is doing, then the bands",
    "What happens when you act on something: a record, not a checkbox",
    "Setup, which is tapping rather than typing",
  ],
  "personal-life-affairs-companion": [
    "Next: one thing on screen, which is the whole design",
    "Companion Mode: exactly one question is live",
    "The Book, the artifact all of it is aimed at",
  ],
  "homeschooling-companion": [
    "Today, grouped by child, never interleaved",
    "A check result, including a topic reported as too thin rather than guessed at",
    "The printed half, drawn the way the book actually sets",
  ],
  alongside: [
    "Now: two real attention reasons, each showing why it is there",
    "The Companion, mid phone-call playbook, on the prepare step",
    "Life: the shapes kept separate, never mixed together",
  ],
  "travel-companion": [
    "Today: the real derived state, including what you are waiting on",
    "The change-impact walk, mid-walk, after a flight time changed",
    "The Trip Brief, expanded",
  ],
};

export type ProductScreen = { node: React.ReactNode; caption: string | null };

/** A product's screens paired with what each one is, or null when it has no screens drawn. */
export function screenTourFor(slug: string): ProductScreen[] | null {
  const Screens = PRODUCT_SCREENS[slug];
  if (!Screens) return null;
  const captions = SCREEN_CAPTIONS[slug];
  return Screens.map((Screen, i) => ({ node: <Screen key={i} />, caption: captions?.[i] ?? null }));
}
