import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Family Health Binder.
 *
 * The ninth Draftpace product, built from scratch on the full shared
 * design system from day one, same discipline as Vehicle Maintenance
 * Companion before it: full accentScale (including wash), the shared
 * PhoneFrame for its marketing mockups, and the shared PrintableDocument
 * shell for its printable, none of it retrofitted.
 *
 * WHAT THIS PRODUCT IS
 *
 * A place to keep the facts a family would otherwise have to reconstruct
 * from memory in an urgent-care waiting room: who is in the family,
 * what they take, what they are allergic to, what runs in the family,
 * and a real, structured record of symptoms as they actually happened,
 * not a vague memory of "she's been sick on and off."
 *
 * THE STRUCTURED SYMPTOM TIMELINE
 *
 * The one design decision the research behind this product says matters
 * most: onset, duration and severity are real fields, not a single
 * free-text box, so a pattern across weeks is something this product can
 * actually show, not something a parent has to piece together from
 * memory. What helped stays free text, deliberately: it varies too much
 * to enumerate honestly.
 *
 * VISIBILITY, PER FACT AND PER SYMPTOM EVENT
 *
 * A fact or event can be marked private: it stays in the account,
 * reachable in the app, but is excluded from the Intake Summary
 * printable. This product is not a demand that every private detail
 * leave the house every time a page is generated.
 *
 * THE INTAKE SUMMARY
 *
 * A one-page, per-person printable meant to supplement a clinic's own
 * intake paperwork, never replace it. It states its own "last updated"
 * date and a privacy note about what this product actually is and is
 * not; it never claims a bare "HIPAA doesn't apply" without saying what
 * does.
 *
 * NO CHILD ACCOUNTS
 *
 * A family member, adult or child, is a plain row scoped under the
 * signed-in account's own user_id, exactly like Homeschooling
 * Companion's own child records. There is no separate login, no
 * separate entitlement, for anyone this product tracks.
 *
 * cycleModel is "continuous": there is no monthly reset here, and
 * exactly one instance per account, same as every other Companion on
 * this platform.
 */
export const familyHealthBinderDefinition: ProductDefinitionInput = {
  id: "family-health-binder",
  slug: "family-health-binder",
  title: "Family Health Binder",
  tagline:
    "Who's in your family, what they take, what they're allergic to, and a real record of symptoms as they happened, reachable from any device when it actually matters.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  capabilities: ["companion.context", "companion.next-action"],
  pwa: {
    name: "Family Health Binder",
    shortName: "Health",
    description:
      "Family Health Binder by Draftpace: medications, allergies, family history and a structured symptom timeline, kept against your account, reachable from any device.",
    themeColor: "#606e8e",
    backgroundColor: "#f8f8fb",
    // This product's own icon, so installing two Companions does not
    // put two identical Draftpace squares on the home screen. Same
    // monogram, this product's accent, generated from Logo.tsx's own
    // path data. The maskable variant fills the canvas and keeps the
    // glyph inside the 80% safe zone, because the OS applies its own
    // mask and would crop the corners off a pre-rounded plate.
    icons: [
      { src: "/logo/products/family-health-binder/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/products/family-health-binder/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/products/family-health-binder/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: false,
  },
  /**
   * Four real destinations, each answering a different question:
   *
   *   Overview  who's in this binder, and what's worth knowing at a glance
   *   Family    each person's medications, allergies and history
   *   Symptoms  the structured timeline, per person
   *   Summary   the printable, meant to leave the house
   *
   * Settings is real scaffolding, honestly not built yet, same as every
   * other new product's Settings destination on day one.
   */
  navigation: ["workspace", "members", "timeline", "printables", "settings"],
  primaryNavigation: ["workspace", "members", "timeline"],
  workspaceLabel: "Overview",
  destinationLabels: {
    members: "Family",
    timeline: "Symptoms",
    printables: "Summary",
    settings: "Settings",
  },
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No "setup" destination. Adding a first family member is the same
   * inline flow as adding any other, reachable from an empty Overview or
   * Family screen, not a gated wizard, same reasoning Vehicle
   * Maintenance Companion's own definition documents for the same trap.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your family",
  },
  modules: [
    { id: "family-health-binder.workspace", destination: "workspace" },
    { id: "family-health-binder.members", destination: "members" },
    { id: "family-health-binder.timeline", destination: "timeline" },
    { id: "family-health-binder.printables", destination: "printables" },
    { id: "family-health-binder.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Dusty lavender-blue. Distinguishable from every other accent already
   * in use (ink blue, sage, teal, clay, plum, mulberry, amber, steel):
   * closer to violet than Travel Companion's blue, softer than Personal
   * Finance Companion's petrol, and deliberately not clinical white or
   * medical red/green, since this product is a record, not a monitor.
   *
   * base is deliberately a touch darker than the first draft (#6b7a9e):
   * that value contrasted at only 4.28:1 against white (this theme's own
   * `contrast` token), short of WCAG AA's 4.5:1 for normal text, and
   * every primary button inside this product's shell renders white text
   * on this exact colour (see buttonStyles.ts's use of
   * --primary-contrast). #606e8e clears 5.1:1 while staying the same
   * colour identity.
   *
   * Full accentScale, including wash, declared from day one, same
   * discipline as Vehicle Maintenance Companion.
   */
  theme: {
    accent: "#606e8e",
    accentScale: {
      base: "#606e8e",
      strong: "#424c62",
      soft: "#e4e8ef",
      contrast: "#ffffff",
      wash: "#f4f5f8",
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
  // Genuinely built: the Symptoms destination is a real, dated history
  // of past symptom events, not a generic "activity log" claim.
  history: { enabled: true, kinds: ["symptom-event"] },
  settingsSections: [],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
