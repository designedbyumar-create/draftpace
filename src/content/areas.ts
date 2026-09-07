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
  /**
   * The longer version, written in the first person, for the Need help
   * finder. It has to sound like something somebody would actually say
   * about their own week, not like a category description.
   */
  inTheirWords: string;
  /**
   * Three things the Companion for this area actually does. Every line
   * has to be true of the shipped product: this is the page where a
   * reader decides whether we understand their problem, so an
   * aspirational line here costs more than a missing one.
   */
  whatHelps: string[];
  /**
   * The homepage hero's button label for this area.
   *
   * The hero used to carry one static "See the full product" under a
   * heading that already said the product's name, so the single control
   * in the most valuable position on the site said nothing about what
   * was behind it. This is that label, written per area and phrased as
   * the thing a reader would actually want to see, not as the product's
   * name a second time.
   */
  heroCta: string;
  /** Product slugs, in the order they should be offered. */
  productSlugs: string[];
}

export const LIFE_AREAS: LifeArea[] = [
  {
    slug: "money",
    label: "Money",
    situation: "You are never quite sure what is actually safe to spend.",
    inTheirWords:
      "I have money in the account but I do not know how much of it is really mine to spend, because I cannot remember everything that is still coming out.",
    whatHelps: [
      "One number for what is genuinely safe to spend, after what is already committed.",
      "Bills, subscriptions and debts held in one place instead of across four bank apps.",
      "A single next move when something needs attention, rather than a dashboard to interpret.",
    ],
    heroCta: "See how safe-to-spend works",
    // Personal Finance Companion first, deliberately. Every marketing
    // surface that shows one product per area takes productSlugs[0], so
    // while Monthly Money Reset led this list the highest-value slot on
    // the site (the hero's Money panel) advertised the free product and
    // the paid flagship was invisible there. The free product has its own
    // page now, at /free, rather than a slot it was winning by costing
    // nothing.
    productSlugs: ["personal-finance-companion", "monthly-money-reset"],
  },
  {
    slug: "home",
    label: "Home",
    situation: "The house needs things done and nobody is holding the list.",
    inTheirWords:
      "Something in this house needs doing and I only ever find out when it becomes a problem. The model number is behind the fridge and the last service date is nowhere.",
    whatHelps: [
      "Every appliance, system and provider recorded once, with the details you actually need later.",
      "What is worth taking care of now, worked out from real dates rather than a nagging schedule.",
      "Snooze and skip that genuinely change what you get asked about again.",
    ],
    heroCta: "See what a house needs",
    productSlugs: ["home-management-companion"],
  },
  {
    slug: "mind-and-focus",
    label: "Mind and focus",
    situation: "You know what to do and still cannot make yourself start.",
    inTheirWords:
      "I know exactly what I need to do. It has been on my mind for three weeks. I still cannot make myself pick up the phone and do it.",
    whatHelps: [
      "Somewhere to put a thing down that will bring it back when it actually matters.",
      "Eight walked-through procedures for the things that are hardest to start, including a hard phone call.",
      "Leaving something half finished records nothing at all. There is no streak and no score.",
    ],
    heroCta: "See how it helps you start",
    productSlugs: ["alongside"],
  },
  {
    slug: "family-and-learning",
    label: "Family and learning",
    situation: "You are teaching at home and cannot account for the year.",
    inTheirWords:
      "It is March and I could not tell you what we covered in October, or whether the fractions ever stuck. If somebody asked me to account for this year I would be guessing.",
    whatHelps: [
      "A dated record of what you actually did, built as you go rather than reconstructed later.",
      "Short checks you run at home to find out honestly whether something landed.",
      "A printable record per child, and a printed handbook that works with a pencil alone.",
    ],
    heroCta: "See what it records",
    productSlugs: ["homeschooling-companion"],
  },
  {
    slug: "affairs-and-endings",
    label: "Affairs and endings",
    situation: "Somebody would need to find all of it, and nobody could.",
    inTheirWords:
      "If something happened to me tomorrow, nobody would know where the will is, which pension is with whom, or who to call first. I keep meaning to sort it out.",
    whatHelps: [
      "A sequenced way in, so the job has a beginning instead of being a folder of blank forms.",
      "A record of what exists and where it is kept, never the documents themselves.",
      "A printed book somebody could actually follow if they had to.",
    ],
    heroCta: "See what goes in the book",
    productSlugs: ["personal-life-affairs-companion"],
  },
  {
    slug: "travel",
    label: "Travel",
    situation: "One flight moves and you cannot remember what else it touches.",
    inTheirWords:
      "The flight moved three hours and I am standing in an airport trying to remember what else I booked around the old time. The confirmations are in six different inboxes.",
    whatHelps: [
      "Everything the trip depends on in one place, with the connections between it recorded once.",
      "Change one thing and see exactly what was built on top of it, handled one at a time.",
      "A printable trip book, blank and structured, for when the phone is at four percent.",
    ],
    heroCta: "See what one change touches",
    productSlugs: ["travel-companion"],
  },
  {
    slug: "vehicles",
    label: "Vehicles",
    situation: "You cannot remember what interval you were actually quoted, or when anything was last done.",
    inTheirWords:
      "I know I should be tracking this vehicle's maintenance, but the interval I was quoted is written on a receipt somewhere, if anywhere, and I only ever check once it becomes a problem.",
    whatHelps: [
      "Your own maintenance intervals, kept per vehicle, never a hardcoded factory schedule.",
      "One ranked view of what is due across every vehicle you own, computed from what you actually recorded.",
      "A dated, mileage-stamped document you can hand to a shop, stating what is requested today and what is not.",
    ],
    heroCta: "See how due is worked out",
    productSlugs: ["vehicle-maintenance-companion"],
  },
  {
    slug: "family-health",
    label: "Family health",
    situation: "Everyone's medications and allergies live only in your own memory.",
    inTheirWords:
      "I am the one who remembers everyone's medications and allergies, and if I had to reconstruct it at an intake desk right now, I would be guessing at half of it.",
    whatHelps: [
      "Every family member's medications, allergies and history, kept in one place, reachable from any device.",
      "A structured symptom timeline, onset, duration and severity as real fields, not a memory reconstructed later.",
      "A dated Intake Summary per person, ready to hand to a clinic alongside their own paperwork.",
    ],
    heroCta: "See what an intake summary holds",
    productSlugs: ["family-health-binder"],
  },
];

export function getAreaBySlug(slug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.slug === slug);
}

/** Which area a product belongs to, for cross-linking from a product page back to its shelf. */
export function getAreaForProduct(productSlug: string): LifeArea | undefined {
  return LIFE_AREAS.find((area) => area.productSlugs.includes(productSlug));
}
