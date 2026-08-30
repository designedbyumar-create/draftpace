/**
 * The life areas the Companion Series is organised by.
 *
 * WHY AREAS AND NOT SITUATIONS
 *
 * The needs taxonomy in src/content/needs.ts was written for a
 * hypothetical catalogue of generic productivity tools. The catalogue
 * that actually got built is organised by life domain, and six of seven
 * products ended up in a single need bucket while three buckets stayed
 * empty. People arrive thinking "my money is a mess" or "we are going to
 * Japan in October", never "I need to follow through", so this is the
 * shape that matches how somebody actually turns up.
 *
 * TWO TIERS, ON PURPOSE
 *
 * The Companion Series is the substantial tier: one product, one domain,
 * one hard problem, bought once and owned. A second, lighter tier of
 * small products is planned. Keeping the tiers explicit means a small
 * product can be added later without renaming anything or pretending it
 * is the same size of thing as a Companion.
 */

export interface LifeArea {
  slug: string;
  /** Short label, used in navigation and filters. */
  label: string;
  /** The situation in the reader's own words, not ours. */
  situation: string;
  /** Product slugs, in the order they should be offered. */
  productSlugs: string[];
}

export const LIFE_AREAS: LifeArea[] = [
  {
    slug: "money",
    label: "Money",
    situation: "You are never quite sure what is actually safe to spend.",
    productSlugs: ["monthly-money-reset", "personal-finance-companion"],
  },
  {
    slug: "home",
    label: "Home",
    situation: "The house needs things done and nobody is holding the list.",
    productSlugs: ["home-management-companion"],
  },
  {
    slug: "mind-and-focus",
    label: "Mind and focus",
    situation: "You know what to do and still cannot make yourself start.",
    productSlugs: ["alongside"],
  },
  {
    slug: "family-and-learning",
    label: "Family and learning",
    situation: "You are teaching at home and cannot account for the year.",
    productSlugs: ["homeschooling-companion"],
  },
  {
    slug: "affairs-and-endings",
    label: "Affairs and endings",
    situation: "Somebody would need to find all of it, and nobody could.",
    productSlugs: ["personal-life-affairs-companion"],
  },
  {
    slug: "travel",
    label: "Travel",
    situation: "One flight moves and you cannot remember what else it touches.",
    productSlugs: ["travel-companion"],
  },
];

export function getAreaBySlug(slug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.slug === slug);
}

/** Which area a product belongs to, for cross-linking from a product page back to its shelf. */
export function getAreaForProduct(productSlug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.productSlugs.includes(productSlug));
}
