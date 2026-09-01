/**
 * Sitewide JSON-LD builders. Every field here is a fact about the current,
 * live product, never a placeholder rating, review count, or price
 * Draftpace doesn't actually have. Rendered via <script
 * type="application/ld+json">, the same pattern the Shop product page
 * already uses, see buildStructuredData() in
 * src/app/(marketing)/shop/[productSlug]/page.tsx.
 */

const SITE_URL = "https://draftpace.com";

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Draftpace",
    url: SITE_URL,
    logo: `${SITE_URL}/logo/icon-512.png`,
    description:
      "Draftpace is a studio that makes living products: installable apps that remember you, guide your next move, and stay ready.",
  };
}

export function websiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Draftpace",
    url: SITE_URL,
  };
}

/**
 * Describes the platform itself as a web application, not any single
 * product listing (the Shop product page already carries its own Product
 * schema). No aggregateRating: Draftpace has no real reviews yet, and
 * inventing one would violate Google's structured-data policies as much as
 * this project's own "no fabricated ratings" rule.
 */
export function softwareApplicationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Draftpace",
    url: SITE_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any (installable web app)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Monthly Money Reset, the current free launch product, is free to use.",
    },
  };
}
