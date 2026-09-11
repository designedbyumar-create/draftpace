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
      "Draftpace makes the Companion Series: products for money, home, focus, family, affairs, travel, vehicles and family health, each remembering your situation so you do not have to.",
    sameAs: ["https://www.linkedin.com/company/draftpace-studio/"],
  };
}

/**
 * The founder, as a real Person distinct from the Organization above. Used
 * on pages that already carry a named byline (About, the case study), never
 * injected sitewide: a Person schema claims authorship of that specific
 * page, and only pages that actually name Umar as the author should make
 * that claim.
 */
export function founderStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Umar Malik",
    url: `${SITE_URL}/about`,
    jobTitle: "Founder",
    worksFor: { "@type": "Organization", name: "Draftpace" },
    sameAs: ["https://www.linkedin.com/in/designedbyumar/"],
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

/**
 * One guide, as an Article. The 70-plus guides had no structured data at
 * all before this: real, substantial content with no way for a search
 * engine or an AI answer engine to read its publish date, its update
 * date, or its author, all of which a plain HTML page implies but never
 * states machine-readably.
 *
 * author is the Organization, not a Person: guides carry no individual
 * byline (unlike /about or the case study, which name Umar directly),
 * so claiming a personal author here would be inventing a fact the page
 * itself never asserts.
 */
export function guideStructuredData(guide: { slug: string; title: string; dek: string; publishedAt: string; updatedAt?: string }) {
  const url = `${SITE_URL}/guides/${guide.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.dek,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    author: { "@type": "Organization", name: "Draftpace", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Draftpace",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo/icon-512.png` },
    },
  };
}
