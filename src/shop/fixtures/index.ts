import { shopRegistry } from "../registry";
import { areDevFixturesEnabled } from "@/product-framework/environment";
import type { ShopProductInput } from "../definition";

/**
 * Internal Shop preview fixtures — exist only to test the Shop index and
 * product-page layouts before a real product is published. Never real
 * inventory: obvious "Internal Shop Preview" naming, no price claims beyond
 * a placeholder, excluded from production unless NEXT_PUBLIC_DEV_FIXTURES
 * is explicitly set (docs/DATA-BOUNDARIES.md).
 */
const FIXTURES: ShopProductInput[] = [
  {
    id: "internal-shop-preview-free",
    slug: "internal-shop-preview-free",
    publicationStatus: "draft",
    title: "Internal Shop Preview — Free Listing",
    promise: "This is a placeholder listing used to test the free-product layout. Not a real product.",
    problem: "Placeholder problem statement for layout testing.",
    audience: ["Anyone reviewing the Shop layout"],
    audienceExclusions: ["Real customers — this is not a real product"],
    outcomes: ["Confirms the free-listing layout renders correctly"],
    howItWorks: ["This section exists only to test spacing and hierarchy"],
    access: "free",
    purchaseAction: { label: "Preview only", href: "/shop" },
    media: [],
    compatibility: ["Placeholder"],
    inclusions: ["Placeholder inclusion"],
    expectedInputs: ["Placeholder input"],
    expectedOutputs: ["Placeholder output"],
    savingBehavior: "Placeholder saving behavior text.",
    privacyNotes: "Placeholder privacy text.",
    faqs: [{ question: "Is this real?", answer: "No. This is an internal layout preview." }],
    relatedGuideSlugs: [],
    relatedProductSlugs: ["internal-shop-preview-paid"],
    needGroups: ["getting-organized"],
    seo: { title: "Internal Shop Preview", description: "Internal layout preview, not a real product." },
    structuredDataEligible: false,
    availability: "coming-soon",
    devFixture: true,
  },
  {
    id: "internal-shop-preview-paid",
    slug: "internal-shop-preview-paid",
    publicationStatus: "draft",
    title: "Internal Shop Preview — Paid Listing",
    promise: "This is a placeholder listing used to test the paid-product layout. Not a real product.",
    problem: "Placeholder problem statement for layout testing.",
    audience: ["Anyone reviewing the Shop layout"],
    audienceExclusions: ["Real customers — this is not a real product"],
    outcomes: ["Confirms the paid-listing layout renders correctly, including price display"],
    howItWorks: ["This section exists only to test spacing and hierarchy"],
    access: "paid",
    price: { amount: 0, currency: "USD" },
    purchaseAction: { label: "Preview only", href: "/shop" },
    media: [],
    compatibility: ["Placeholder"],
    inclusions: ["Placeholder inclusion"],
    expectedInputs: ["Placeholder input"],
    expectedOutputs: ["Placeholder output"],
    savingBehavior: "Placeholder saving behavior text.",
    privacyNotes: "Placeholder privacy text.",
    faqs: [{ question: "Is this real?", answer: "No. This is an internal layout preview." }],
    relatedGuideSlugs: [],
    relatedProductSlugs: ["internal-shop-preview-free"],
    needGroups: ["making-a-difficult-decision"],
    seo: { title: "Internal Shop Preview", description: "Internal layout preview, not a real product." },
    structuredDataEligible: false,
    availability: "coming-soon",
    devFixture: true,
  },
];

let registered = false;

export function registerShopFixtures(): void {
  if (registered) return;
  registered = true;
  if (!areDevFixturesEnabled()) return;
  for (const fixture of FIXTURES) {
    if (!shopRegistry.getBySlug(fixture.slug as string)) {
      shopRegistry.register(fixture);
    }
  }
}
