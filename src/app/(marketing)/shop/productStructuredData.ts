import { allQuestions, type ShopProduct } from "@/shop/definition";

/**
 * Slugs with a generated store cover in public/store. Listed rather than
 * probed: a missing file would otherwise be advertised to every crawler
 * and link unfurler as this product's image.
 *
 * Shared between every public surface that links or describes a product
 * (the generic /shop/[productSlug] page and any bespoke landing page a
 * product has instead) so a product's cover can't quietly disagree
 * between them.
 */
export const STORE_COVERS = new Set([
  "personal-finance-companion",
  "home-management-companion",
  "alongside",
  "homeschooling-companion",
  "personal-life-affairs-companion",
  "travel-companion",
  "vehicle-maintenance-companion",
  "family-health-binder",
  "monthly-money-reset",
]);

/** The product's own store cover if one exists, else the site-wide fallback. */
export function coverImagePath(slug: string): string {
  return STORE_COVERS.has(slug) ? `/store/${slug}-1-cover.webp` : "/og-image.png";
}

/**
 * Product schema, shared by every page that sells a product, keyed to
 * that page's own canonical `url` rather than assuming /shop/[slug] --
 * a bespoke landing page passes its own canonical path here, so the
 * schema always names the page it actually sits on.
 */
export function buildProductStructuredData(product: ShopProduct, url: string) {
  if (!(product.structuredDataEligible && product.publicationStatus === "published")) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.seo.description,
    // Google will not show a Product rich result without an image, which
    // is why this was previously ineligible however complete the rest of
    // it looked. Absolute, because a crawler does not resolve relative
    // paths inside JSON-LD.
    ...(STORE_COVERS.has(product.slug) ? { image: [`https://draftpace.com/store/${product.slug}-1-cover.webp`] } : {}),
    brand: { "@type": "Brand", name: "Draftpace" },
    sku: product.slug,
    url,
    offers: {
      "@type": "Offer",
      url,
      price: product.access === "free" ? "0" : product.price?.amount.toString(),
      priceCurrency: product.access === "free" ? "USD" : product.price?.currency,
      availability: product.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      // One payment, no licence term. Stated so a crawler does not have to
      // infer it from a price alone.
      priceValidUntil: "2027-12-31",
    },
  };
}

/**
 * FAQPage schema from the listing's own real questions (whichever field
 * they live in, migrated or not), never a separate hand-authored copy:
 * the same eligibility gate as the Product schema above (published, and
 * structuredDataEligible so an unfinished listing's placeholder answers
 * can never render as a rich result), so the two schemas always appear
 * or stay absent together. Returns null rather than an empty FAQPage
 * when a listing has no questions at all, since Google treats an
 * eligible-but-empty FAQPage as a policy violation, not a shorter valid
 * one.
 */
export function buildFaqStructuredData(product: ShopProduct) {
  if (!(product.structuredDataEligible && product.publicationStatus === "published")) return null;
  // allQuestions(), not product.faqs directly: a migrated listing empties
  // objections/faqs and keeps every question in the new unified
  // `questions` field instead (see src/shop/definition.ts). Reading
  // .faqs alone would have rendered an empty FAQPage for every listing
  // that has already migrated, which is most of them.
  const questions = allQuestions(product);
  if (questions.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}
