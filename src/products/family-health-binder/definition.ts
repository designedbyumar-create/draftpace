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
 * The answers every form asks, entered once. School, camp and sports forms,
 * a new specialist's intake packet, a babysitter, an urgent-care desk all
 * ask for the same handful of facts about the same people: who they are,
 * what they are allergic to, what they take, who their doctor is, who to
 * call, who insures them, which shots they have had. Here each person is one
 * card that holds those, and the card prints as the page the moment needs.
 * It is also where a symptom is recorded as it happens, and where the
 * questions for the next appointment wait, so neither has to be remembered
 * in a waiting room.
 *
 * It is a record and never advice: nothing here checks a dose, an
 * interaction or a vaccine schedule, and nothing says what a person should
 * do about a symptom.
 *
 * THE CARD
 *
 * The identity is a medical ID card: each person has a colour and an initial,
 * allergies come first as a tag, the way they do on an alert bracelet, and
 * the printed pages are built from the same card. Inter only, generous
 * corners, a rose accent on warm paper: the opposite of a clinical white
 * screen, and unlike every other product's colour, type and shape.
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
    "The answers every form asks, entered once: who they are, what they're allergic to, what they take, who to call. It prints as the page school, camp, a sitter or a new doctor wants.",
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
      "Family Health Binder by Draftpace: the answers every form asks, entered once, for everyone in your family. Prints as a forms sheet, a caregiver sheet, an emergency card and a visit page.",
    themeColor: "#b23a5b",
    backgroundColor: "#faf6f3",
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
   * Five destinations, each answering a different question:
   *
   *   Overview  everyone in the binder, and what each card is missing
   *   Family    each person's card: health, shots, care team, contacts
   *   Symptoms  the structured timeline, per person
   *   Visits    the questions for the next appointment, and what was said
   *   Print     the pages that leave the house
   */
  navigation: ["workspace", "members", "timeline", "visits", "printables", "settings"],
  primaryNavigation: ["workspace", "members", "timeline", "visits"],
  workspaceLabel: "Overview",
  destinationLabels: {
    members: "Family",
    timeline: "Symptoms",
    visits: "Visits",
    printables: "Print",
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
    { id: "family-health-binder.visits", destination: "visits" },
    { id: "family-health-binder.printables", destination: "printables" },
    { id: "family-health-binder.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Rose on warm paper. Distinguishable from every other accent in use
   * (mulberry, sage, plum, ink green, ink blue, teal, amber): a clear rose,
   * warmer and brighter than the mulberry, and deliberately not clinical
   * white, medical red or green, since this product is a record and not a
   * monitor. Full accentScale, including wash, and a dark pair.
   *
   * The ground is a warm paper rather than a cool grey, so the whole product
   * reads as something kept in a home and not in a hospital. Every pair is
   * held to the platform floor by ground.test.ts.
   *
   * No narrativeFont, deliberately: every other Companion speaks in a serif
   * somewhere, and this one is a card someone fills in and reads at a
   * glance, so it speaks in the sans.
   */
  theme: {
    accent: "#b23a5b",
    accentScale: {
      base: "#b23a5b",
      strong: "#86233f",
      soft: "#f9e3ea",
      contrast: "#ffffff",
      wash: "#fdf1f4",
    },
    accentScaleDark: {
      base: "#f08aa3",
      strong: "#f8b8c8",
      soft: "#3a1a24",
      contrast: "#2a0c15",
      wash: "#2a141b",
    },
    ground: {
      light: {
        appBg: "#faf6f3",
        surface: "#fffdfb",
        surfaceMuted: "#f6efea",
        surfaceStrong: "#ebe1da",
        text: "#241a1b",
        muted: "#64565a",
        faint: "#6d5f63",
        border: "#eaddd6",
        borderStrong: "#d5c3ba",
      },
      dark: {
        appBg: "#170f11",
        surface: "#211719",
        surfaceMuted: "#1b1214",
        surfaceStrong: "#2c2023",
        text: "#f5eded",
        muted: "#b8a8ab",
        faint: "#9d8d91",
        border: "rgba(245, 237, 237, 0.09)",
        borderStrong: "rgba(245, 237, 237, 0.16)",
      },
    },
    motionPersonality: "calm",
    contentWidth: "narrow",
    // Generous corners: a card you hold, not a panel.
    identity: { motif: "card", shape: "soft" },
  },
  layouts: ["responsive"],
  offline: "shell-only",
  // Honest, not a placeholder: no push infrastructure exists for this
  // product yet, same rule every Companion without one already states.
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  // Genuinely built: Symptoms and Visits are each a real, dated history,
  // not a generic "activity log" claim.
  history: { enabled: true, kinds: ["symptom-event", "visit"] },
  settingsSections: [],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
