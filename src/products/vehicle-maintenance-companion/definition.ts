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
    themeColor: "#b45309",
    backgroundColor: "#f2f3f4",
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
   *   History     what has been done to each, and when
   *   Paperwork   the dates and details that live in the glove box
   *   Print       the Service Boundary, the service record, the card
   *
   * Settings is reminders, and only reminders: off until switched on.
   */
  navigation: ["workspace", "vehicles", "history", "paperwork", "printables", "settings"],
  primaryNavigation: ["workspace", "vehicles", "history", "paperwork"],
  workspaceLabel: "Due",
  destinationLabels: {
    vehicles: "Vehicles",
    history: "History",
    paperwork: "Paperwork",
    printables: "Print",
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
    { id: "vehicle-maintenance-companion.history", destination: "history" },
    { id: "vehicle-maintenance-companion.paperwork", destination: "paperwork" },
    { id: "vehicle-maintenance-companion.printables", destination: "printables" },
    { id: "vehicle-maintenance-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Signal amber on graphite, from the instrument cluster: the one lamp
   * that means something on a dashboard is the one that is lit when
   * something needs attention, and dark when nothing does.
   *
   * The amber is deep enough to read as text and to carry a white button
   * label on a light page (5:1), and lifts to a lighter amber in dark mode.
   * It is spent on the main action, the lit lamp, links and the active tab.
   * The ground is a cool graphite-neutral so the amber is the only warm
   * thing on the screen, and no other product uses it: covered up, this one
   * is still distinguishable from ink blue, sage, teal, clay, plum, mulberry
   * and ink green.
   *
   * The banner on Due is the cluster: dark in both themes, because a
   * dashboard is, with its own tones so the lamp reads against it. Full
   * accentScale, including wash, from day one.
   */
  theme: {
    accent: "#b45309",
    accentScale: {
      base: "#b45309",
      strong: "#8f3f06",
      soft: "#fbe8d5",
      contrast: "#ffffff",
      wash: "#fdf3e8",
    },
    accentScaleDark: {
      base: "#f2a04a",
      strong: "#f7bd80",
      soft: "#3a2413",
      contrast: "#241203",
      wash: "#2a1b0f",
    },
    ground: {
      light: {
        appBg: "#f2f3f4",
        surface: "#ffffff",
        surfaceMuted: "#f6f7f8",
        surfaceStrong: "#e4e7e9",
        text: "#14181b",
        muted: "#565e64",
        faint: "#66707a",
        border: "#e3e6e8",
        borderStrong: "#c8cdd1",
      },
      dark: {
        appBg: "#0c0f11",
        surface: "#15191c",
        surfaceMuted: "#111417",
        surfaceStrong: "#1f2529",
        text: "#eceff1",
        muted: "#a3acb2",
        faint: "#8b959c",
        border: "rgba(236, 239, 241, 0.09)",
        borderStrong: "rgba(236, 239, 241, 0.16)",
      },
    },
    hero: {
      light: { from: "#38424a", mid: "#20272c", to: "#161b1e", ink: "#f1f3f4" },
      dark: { from: "#2b343a", mid: "#1a2024", to: "#101416", ink: "#eceff1" },
    },
    // No narrativeFont, deliberately. Every other Companion speaks in a
    // serif somewhere; this one is an instrument panel, so it speaks in
    // the sans and sets everything that is measured in a monospaced face.
    motionPersonality: "calm",
    contentWidth: "narrow",
    // Small square corners: a gauge panel, not a card.
    identity: { motif: "gauge", shape: "sharp" },
  },
  layouts: ["responsive"],
  offline: "shell-only",
  // Real, and opt-in: reminders are off until somebody switches them on in
  // Settings, and only ever for a job that reached its interval or a date
  // they recorded. See vehicleReminders.ts.
  notifications: { supported: true },
  progressModel: { kind: "custom" },
  // The service record: every time a job was done, kept as an event.
  history: { enabled: true, kinds: ["service"] },
  settingsSections: [],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
