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
 * 5. Exactly nine Companion Mode situations: eight locked in Phase 0
 *    (booking problem, flight problem, hotel problem, transport problem,
 *    something changed, reorganize the trip, contact someone, something
 *    went wrong) and a ninth added deliberately, for something lost or
 *    stolen, the one situation the eight left uncovered. A test names
 *    them all, so a tenth cannot arrive by accident.
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
  status: "active",
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
    themeColor: "#00626f",
    backgroundColor: "#eef4f5",
    // This product's own icon, so installing two Companions does not
    // put two identical Draftpace squares on the home screen. Same
    // monogram, this product's accent, generated from Logo.tsx's own
    // path data. The maskable variant fills the canvas and keeps the
    // glyph inside the 80% safe zone, because the OS applies its own
    // mask and would crop the corners off a pre-rounded plate.
    icons: [
      { src: "/logo/products/travel-companion/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/products/travel-companion/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/products/travel-companion/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: false,
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
   * its own secondary destination. Printables joins them there, same
   * placement Personal Finance Companion uses for its own included
   * printable: not primary, reached from the overflow menu, label left
   * to defaultDestinationLabel's own title-casing ("Printables").
   */
  navigation: ["workspace", "itinerary", "trip", "people", "record", "printables", "settings"],
  primaryNavigation: ["workspace", "itinerary", "trip", "people"],
  workspaceLabel: "Today",
  destinationLabels: {
    itinerary: "Itinerary",
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
    { id: "travel-companion.itinerary", destination: "itinerary" },
    { id: "travel-companion.trip", destination: "trip" },
    { id: "travel-companion.people", destination: "people" },
    { id: "travel-companion.record", destination: "record" },
    { id: "travel-companion.printables", destination: "printables" },
    { id: "travel-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Lagoon, toned down: a deep ocean teal on pale aqua-grey and white, with
   * a soft peach on the time stubs. Travel is opened on a phone in a bright
   * place, often mid-problem, so the ground is light and crisp and the type
   * is ink on white.
   *
   * The deep teal is spent only where somebody is meant to press: the calls
   * to action and the tab you are on. The tickets themselves, the day
   * headers and the stubs carry no accent at all, so a screen of bookings
   * reads as quiet paper with one obvious thing to do.
   *
   * The peach lives in `wash`, the pastel tier, so it follows the theme into
   * dark mode (a deep warm brown) without a second colour system.
   *
   * There is no narrative serif here on purpose. The boarding pass is the
   * object, and airport signage is a sans: a serif headline on a ticket
   * would read as a wedding invitation.
   *
   * Distinct from teal (Personal Finance's is a dark slate, this is a
   * brighter ocean), clay, sage, plum, mauve and navy. Red is not used as a
   * status colour anywhere in this product: nothing here is an alarm.
   *
   * Every text pair clears 4.5:1 and body text clears 7:1, in both themes
   * (src/product-framework/ground.test.ts).
   */
  theme: {
    accent: "#00626f",
    accentScale: {
      base: "#00626f",
      strong: "#00434d",
      soft: "#d9eef0",
      contrast: "#ffffff",
      // The stub tint: a soft peach, not a pale accent.
      wash: "#ffe4da",
    },
    accentScaleDark: {
      base: "#5cc4d2",
      strong: "#8bd8e2",
      soft: "#163338",
      contrast: "#06242a",
      wash: "#3a2018",
    },
    ground: {
      light: {
        appBg: "#eef4f5",
        surface: "#ffffff",
        surfaceMuted: "#f5f9f9",
        surfaceStrong: "#dde9ea",
        text: "#0f2a2f",
        muted: "#4b646a",
        faint: "#587076",
        border: "#dce8ea",
        borderStrong: "#c3d5d8",
      },
      dark: {
        appBg: "#0a1618",
        surface: "#112225",
        surfaceMuted: "#162a2e",
        surfaceStrong: "#1f3a3f",
        text: "#e6f1f2",
        muted: "#9db6ba",
        faint: "#86a0a5",
        border: "rgba(230, 241, 242, 0.10)",
        borderStrong: "rgba(230, 241, 242, 0.17)",
      },
    },
    // No narrativeFont, deliberately: see above. The shared Companion
    // screens fall back to the product's sans.
    motionPersonality: "calm",
    contentWidth: "narrow",
    identity: { motif: "timeline" },
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
