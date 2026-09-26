/**
 * Sitewide JSON-LD builders. Every field here is a fact about the current,
 * live product, never a placeholder rating, review count, or price
 * Draftpace doesn't actually have. Rendered via <script
 * type="application/ld+json">, the same pattern the Shop product page
 * already uses, see buildStructuredData() in
 * src/app/(marketing)/shop/[productSlug]/page.tsx.
 */

const SITE_URL = "https://draftpace.com";

/**
 * One Organization entity, referenced by @id from every Article, so a
 * search engine sees a single publisher rather than 137 copies of one.
 */
const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * Serialises JSON-LD for a <script> tag. A "<" inside a string value could
 * otherwise close the script element early; escaping it costs nothing and
 * removes the whole class of problem, even though today's values are all
 * authored here.
 */
export function jsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function organizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
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
export type GuideStructuredDataInput = {
  slug: string;
  title: string;
  dek: string;
  publishedAt: string;
  updatedAt?: string;
  locale?: string;
};

type Crumb = { name: string; path: string };

/** Inline [text](/href) markup reduced to its text, for a value a machine reads. */
export function plainText(markup: string): string {
  return markup.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

/**
 * The guide's FAQ block as FAQPage data. Emitted only from the same
 * strings the page renders, so the markup can never claim a question the
 * reader cannot see. Google now shows FAQ rich results only for a narrow
 * set of sites, so this is not a ranking play: the visible questions are
 * the asset, and this simply describes them accurately to any consumer
 * that reads it.
 */
export function faqStructuredData(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: plainText(item.a) },
    })),
  };
}

/**
 * BreadcrumbList from the same trail the page shows. Google requires the
 * markup to match what a reader can see, so the page builds the trail
 * once and hands it both to this and to the visible breadcrumb.
 */
export function breadcrumbStructuredData(trail: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/**
 * One guide as an Article plus its breadcrumb, in a single @graph.
 *
 * author is the Organization, not a Person: guides carry no individual
 * byline (unlike /about or the case study, which name Umar directly), so
 * claiming a personal author here would invent a fact the page itself
 * never asserts. `description` is passed in rather than read from the
 * guide so the schema says exactly what the search result says.
 */
export function guideStructuredData(
  guide: GuideStructuredDataInput,
  options: { description: string; trail: Crumb[]; areaLabel?: string; areaPath?: string; wordCount?: number; faq?: { q: string; a: string }[] },
) {
  const url = `${SITE_URL}/guides/${guide.slug}`;
  const inLanguage = guide.locale === "uk" ? "en-GB" : "en-US";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: options.description,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt ?? guide.publishedAt,
        inLanguage,
        isAccessibleForFree: true,
        ...(options.areaLabel ? { articleSection: options.areaLabel } : {}),
        ...(options.wordCount ? { wordCount: options.wordCount } : {}),
        ...(options.areaPath ? { isPartOf: { "@type": "CollectionPage", "@id": `${SITE_URL}${options.areaPath}` } } : {}),
        author: { "@type": "Organization", "@id": ORGANIZATION_ID, name: "Draftpace", url: SITE_URL },
        publisher: {
          "@type": "Organization",
          "@id": ORGANIZATION_ID,
          name: "Draftpace",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/logo/icon-512.png` },
        },
      },
      breadcrumbStructuredData(options.trail),
      ...(options.faq && options.faq.length > 0 ? [faqStructuredData(options.faq)] : []),
    ],
  };
}

/** An area hub, or the guides index: a collection of guides, with its breadcrumb. */
export function collectionStructuredData(input: {
  name: string;
  description: string;
  path: string;
  trail: Crumb[];
  guides: { slug: string; title: string }[];
}) {
  const url = `${SITE_URL}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name: input.name,
        description: input.description,
        url,
        isPartOf: { "@type": "WebSite", name: "Draftpace", url: SITE_URL },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: input.guides.length,
          itemListElement: input.guides.map((guide, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: guide.title,
            url: `${SITE_URL}/guides/${guide.slug}`,
          })),
        },
      },
      breadcrumbStructuredData(input.trail),
    ],
  };
}
