import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Vehicle Maintenance Companion.
 *
 * The eighth Draftpace product, and the first built from scratch under
 * the shared design system rather than migrated onto it after the fact:
 * full accentScale (including wash) from day one, the shared PhoneFrame
 * for its marketing mockups, and the shared PrintableDocument shell for
 * its printable, all on day one, none of it retrofitted.
 *
 * WHAT THIS PRODUCT IS, so later contributors do not drift it
 *
 * A vehicle's maintenance intervals are never assumed. Every interval a
 * person tracks is their own, entered by hand or copied (and then
 * editable) from a small, clearly-labelled set of typical starting
 * points in vehicleKnowledge.ts. This is deliberately not a database of
 * every make and model's real factory schedule, which this product has
 * no way to keep current or verify; it is a place to keep the intervals
 * a person already knows or is willing to type once.
 *
 * THE SIGNATURE FEATURE: THE SERVICE BOUNDARY
 *
 * A dated, mileage-stamped document a person can hand to a shop stating
 * plainly what is being requested today and what is explicitly not
 * authorized without a further conversation. It exists because "while
 * we had it up on the lift" is how a routine oil change becomes a much
 * larger bill, and a boundary stated in writing, in advance, is worth
 * more at the counter than a memory of what was agreed on the phone.
 *
 * THE UNKNOWN-HISTORY PATH
 *
 * A used car or an inherited vehicle often arrives with no real service
 * record. Marking a vehicle's history unknown skips asking for a
 * last-done date or mileage it does not honestly have, and every
 * maintenance item on it reads as "nothing to judge this from yet"
 * until a real fact is recorded, never as an invented "already overdue".
 *
 * cycleModel is "continuous": maintenance has no monthly reset, and
 * there is exactly one instance per account, same as every other
 * Companion on this platform.
 */
export const vehicleMaintenanceCompanionDefinition: ProductDefinitionInput = {
  id: "vehicle-maintenance-companion",
  slug: "vehicle-maintenance-companion",
  title: "Vehicle Maintenance Companion",
  tagline:
    "The intervals you actually know, kept against the vehicles you actually own, so you always know what's due and can put it in writing before a shop touches your car.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  capabilities: ["companion.context", "companion.next-action"],
  pwa: {
    name: "Vehicle Maintenance Companion",
    shortName: "Vehicles",
    description:
      "Vehicle Maintenance Companion by Draftpace: the intervals you actually know, kept against the vehicles you own, so you always know what's due.",
    themeColor: "#4d5a35",
    backgroundColor: "#fbfaf7",
    // This product's own icon, so installing two Companions does not
    // put two identical Draftpace squares on the home screen. Same
    // monogram, this product's accent, generated from Logo.tsx's own
    // path data. The maskable variant fills the canvas and keeps the
    // glyph inside the 80% safe zone, because the OS applies its own
    // mask and would crop the corners off a pre-rounded plate.
    icons: [
      { src: "/logo/products/vehicle-maintenance-companion/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/products/vehicle-maintenance-companion/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/products/vehicle-maintenance-companion/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: false,
  },
  /**
   * Three destinations, each answering a different question:
   *
   *   Due         what needs doing, across every vehicle, ranked
   *   Vehicles    what do I own, and what am I tracking on it
   *   Boundary    the printable, handed to a shop
   *
   * Settings is real scaffolding, honestly not built yet, same as every
   * other new product's Settings destination on day one.
   */
  navigation: ["workspace", "vehicles", "printables", "settings"],
  primaryNavigation: ["workspace", "vehicles"],
  workspaceLabel: "Due",
  destinationLabels: {
    vehicles: "Vehicles",
    printables: "Boundary",
    settings: "Settings",
  },
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No "setup" destination. Adding a first vehicle is the same inline
   * flow as adding any other, reachable from an empty Due or Vehicles
   * screen, not a gated wizard. Declaring "setup" here without wiring
   * setProductInstanceLifecycle also pins the product in
   * resolveLifecycleNavigation's first state behind a Start link to a
   * destination that does not exist, the exact trap Personal Finance
   * Companion documented and every product since has avoided.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your vehicles",
  },
  modules: [
    { id: "vehicle-maintenance-companion.workspace", destination: "workspace" },
    { id: "vehicle-maintenance-companion.vehicles", destination: "vehicles" },
    { id: "vehicle-maintenance-companion.printables", destination: "printables" },
    { id: "vehicle-maintenance-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Steel. Deliberately not a recolour of a sibling: covered up, this
   * product must be distinguishable from every other accent already in
   * use (ink blue, sage, teal, clay, plum, mulberry, amber). Steel reads
   * as tools and a garage rather than travel or home, without leaning on
   * automotive cliche (racing red, chrome, asphalt black).
   *
   * Full accentScale, including wash, declared from day one: this
   * product never goes through the accent-with-no-scale state Monthly
   * Money Reset and Personal Finance Companion both shipped in and later
   * had to correct.
   */
  /**
   * Olive, not the near-grey steel this shipped with.
   *
   * The original #565349 had a chroma of 13 when every other product sat
   * between 31 and 137, which made it measurably the only near-grey in the
   * set rather than a matter of taste. On a page where the accent is the
   * buy button, a colour with almost no colour in it reads as a disabled
   * control, which is the worst thing a call to action can look like.
   *
   * Olive rather than the obvious bronze: bronze landed at hue 27deg,
   * two degrees from Travel Companion's amber, so the two products would
   * have shared a colour. This sits at 81deg, in the widest empty gap in
   * the palette, 57deg clear of Home Base's forest, and stays right for a
   * product about workshops and machinery.
   */
  theme: {
    accent: "#4d5a35",
    accentScale: {
      base: "#4d5a35",
      strong: "#3a4427",
      soft: "#e9ecdf",
      contrast: "#ffffff",
      wash: "#f4f6ee",
    },
    narrativeFont: "var(--font-newsreader), ui-serif, Georgia, serif",
    motionPersonality: "calm",
    contentWidth: "narrow",
  },
  layouts: ["responsive"],
  offline: "shell-only",
  // Honest, not a placeholder: no push infrastructure exists for this
  // product yet, same rule every Companion without one already states.
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  // No dedicated history surface this phase: a last-done fact lives on
  // its own maintenance item, not in a separate timeline. Declaring
  // enabled here without one would be exactly the kind of unbuilt claim
  // rule 8 forbids.
  history: { enabled: false, kinds: [] },
  settingsSections: [],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
