import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Travel Companion.
 *
 * The sixth Draftpace product in the `companion` family. See
 * docs/products/TRAVEL-COMPANION-PROPOSAL.md for the approved model;
 * this file registers it and nothing more.
 *
 * WHAT THIS PRODUCT IS, so later contributors do not drift it
 *
 * Travel is easy to plan and hard to coordinate. This is the
 * operational memory of one trip: the people, places, transport, stays
 * and reservations that make it up, and the real relationships between
 * them, so the product can derive what matters right now instead of
 * asking the traveller to reconstruct it every time.
 *
 * THE FIVE LOCKED BOUNDARIES, PHASE 0, APPROVED
 *
 * 1. Documents are a registry (what exists, where it's kept), never a
 *    file. No product on this platform stores an uploaded file today;
 *    this one is not the exception, and passport/visa references are
 *    the single most sensitive category of data any product here would
 *    hold if it did.
 * 2. Money may be mentioned in free text. Nothing here computes an
 *    amount, a currency, a balance, or a split. Adding one would make
 *    this a worse version of a product already sold.
 * 3. A booking depends on at most one upstream booking
 *    (depends_on_booking_id). A tree, never a general graph, see
 *    trip.ts's wouldCreateCycle, which is what keeps that claim true
 *    rather than merely intended.
 * 4. The Companion engine is a shared, extracted runtime, not a fork of
 *    Alongside's implementation. See the shared engine work this
 *    product's Phase 3 depends on.
 * 5. Exactly eight Companion Mode situations in v1, locked: booking
 *    problem, flight problem, hotel problem, transport problem,
 *    something changed, reorganize the trip, contact someone, something
 *    went wrong. Same "eight, and eight is the number" discipline as
 *    Alongside's own library.
 *
 * cycleModel is "continuous": one instance per account. A trip is a
 * user-created record inside it, the same tier Homeschooling
 * Companion's children use, not a second instance per trip, which is
 * what lets a later trip deterministically read an earlier one's
 * recorded places (a later migration) without crossing accounts.
 */
export const travelCompanionDefinition: ProductDefinitionInput = {
  id: "travel-companion",
  slug: "travel-companion",
  title: "Travel Companion",
  tagline:
    "Everything your trip depends on, in one place, with the right context when you need it. You don't have to remember how it all connects.",
  family: "companion",
  version: "0.1.0",
  status: "draft",
  access: { model: "paid" },
  cycleModel: "continuous",
  /**
   * All four already existed in the registry; none was written for this
   * product. companion.context is the trip graph itself, and
   * companion.recovery is the change-impact walk and open threads,
   * "picking up something abandoned," the same shape Alongside already
   * uses it for.
   */
  capabilities: ["companion.context", "companion.next-action", "companion.recovery", "companion.outcomes"],
  pwa: {
    name: "Travel Companion",
    shortName: "Travel",
    description: "Travel Companion by Draftpace: the operational memory of your trip, so you don't have to hold it all in your head.",
    themeColor: "#a8611f",
    backgroundColor: "#fbfaf7",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  /**
   * Five destinations, mapping the brief's own five names onto existing
   * shell mechanics with nothing new built for the mapping itself:
   *
   *   Today     the current operational state (workspace, relabeled)
   *   Trip      the whole connected trip
   *   People    who is travelling
   *   Record    what happened, dated
   *   More      the rail shell's existing overflow menu, not a
   *             destination at all, already live on Alongside today
   *
   * Only three sit in the primary bar. Record is genuinely a
   * during-and-after surface rather than a moment-to-moment one, so it
   * sits one tap deeper next to Settings, the same place Alongside puts
   * its own secondary destination.
   */
  navigation: ["workspace", "trip", "people", "record", "settings"],
  primaryNavigation: ["workspace", "trip", "people"],
  workspaceLabel: "Today",
  destinationLabels: {
    trip: "Trip",
    people: "People",
    record: "Record",
    settings: "Settings",
  },
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No setup destination, for the reason Alongside already established:
   * a trip needs a title and rough dates to exist, which is a three
   * field inline form reachable from an empty Trip screen, not a gated
   * wizard. Declaring one would also pin this product in
   * resolveLifecycleNavigation's first state behind a Start link to a
   * destination it does not register, the exact trap Personal Finance
   * Companion hit once already.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your trip",
  },
  modules: [
    { id: "travel-companion.workspace", destination: "workspace" },
    { id: "travel-companion.trip", destination: "trip" },
    { id: "travel-companion.people", destination: "people" },
    { id: "travel-companion.record", destination: "record" },
    { id: "travel-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * A warm amber/ochre, distinct from teal, clay, sage, plum, and
   * mulberry. Deliberately not the blue-and-cloud palette every
   * mainstream travel app already uses, this is opened mid-trip, often
   * mid-problem, and a tourist-brochure palette on that screen would be
   * exactly the wrong register. Red is not used as a status colour
   * anywhere in this product, same rule as every sibling: nothing here
   * is an alarm.
   */
  theme: {
    accent: "#a8611f",
    accentScale: {
      base: "#a8611f",
      strong: "#7c4715",
      soft: "#f7ead9",
      contrast: "#ffffff",
    },
    narrativeFont: "var(--font-newsreader), ui-serif, Georgia, serif",
    motionPersonality: "calm",
    contentWidth: "narrow",
  },
  layouts: ["responsive"],
  offline: "shell-only",
  /**
   * False, honestly, not a placeholder. No Phase 0 delivery research was
   * commissioned for this product because Alongside's already applies:
   * push reaches iOS only through a manual install no page can trigger,
   * and web push opt-in is low even where none is needed. Nothing here
   * claims to notify anybody about a flight change until that changes.
   */
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["outcome", "note"] },
  settingsSections: ["privacy", "timezone"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
