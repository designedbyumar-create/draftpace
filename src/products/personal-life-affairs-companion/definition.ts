import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Personal Life Affairs Companion, product name "In Order".
 *
 * The third Draftpace product. Registered, checkout-wired and live
 * (devFixture false, access paid, status active), same as both siblings.
 *
 * WHAT THIS PRODUCT IS, so later contributors do not drift it
 *
 * It is not a document vault and not a death product. It is a companion
 * for the ordinary, endlessly deferred job of getting your affairs in
 * order: it knows what belongs on the list, tells you the single next
 * step, silences everything that does not apply to you, and years later
 * asks whether each answer is still true. The output is a printed copy
 * you hand to the people who would need it.
 *
 * Two words are banned from every user-facing surface, for evidenced
 * reasons. "Estate" and "assets": 40% of people without a will say they
 * do not have enough assets to need one, so the moment the product uses
 * that language it confirms their belief and loses them. "Overdue": the
 * house rule inherited from Home Base, since nobody is failing here.
 *
 * cycleModel is "continuous": affairs have no monthly reset, exactly one
 * instance ever, same as both siblings.
 *
 * The product has two modes, a guided project during setup and a quiet
 * caretaker for the twenty years after it. That is a product-design
 * distinction, not a registration one: see the capabilities note below
 * for why it cannot be expressed by borrowing another family's strings.
 */
export const personalLifeAffairsCompanionDefinition: ProductDefinitionInput = {
  id: "personal-life-affairs-companion",
  slug: "personal-life-affairs-companion",
  /**
   * What a person sees, everywhere. "In Order" survives as the slug, the
   * pla_ table prefix and the name used throughout this codebase, but it
   * described a state somebody was trying to reach rather than what the
   * product does for them, and as a wordmark it reads as a checklist
   * that has been finished.
   */
  title: "Personal Life Affairs Companion",
  tagline:
    "Everything the people you love would need to find, in one place and kept current. It tells you the one next step, skips whatever doesn't apply to you, and prints a copy you can hand over when you're ready.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  // Provisional, same convention as both siblings: Draftpace's neutral
  // icons until real artwork is a founder decision.
  pwa: {
    name: "Personal Life Affairs Companion",
    // Home screens truncate hard, so the short name stays the one word
    // pair that fits under an icon.
    shortName: "Affairs",
    description:
      "In Order by Draftpace: everything the people you love would need to find, in one place and kept current.",
    themeColor: "#26374f",
    backgroundColor: "#fbfaf7",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  // The product has two modes, a guided project then a quiet caretaker,
  // but both are expressed in companion terms because the registry
  // enforces that a product's capabilities are supported by its declared
  // family (registry.ts's isCapabilitySupportedByFamily check). A
  // cross-family string like guided-program.completion is rejected at
  // registration, so "reaching a finished state" is milestones here.
  capabilities: ["companion.context", "companion.next-action", "companion.milestones"],
  // One surface, following Home Base's collapse rather than PFC's fifteen
  // destinations. The whole product is "the next step", so a person must
  // never navigate to find out what to do.
  /**
   * Four destinations, and each one answers a different question:
   *
   *   Next     what deserves my attention?
   *   Affairs  what does this actually know about me?
   *   Book     what would somebody receive if I handed it over?
   *   History  what has changed?
   *
   * If a person cannot say what separates these four, the navigation has
   * failed. That is why there is no Dashboard, no Tasks, no Progress and
   * no per-domain section: those are shapes of a checklist, and every
   * one of them would pull the product back into being one.
   *
   * "In Order" survives as the internal name, the slug and the table
   * prefix. It is no longer a label a person sees, because it described
   * a state to reach rather than what the product does.
   */
  navigation: ["workspace", "affairs", "printables", "history", "settings"],
  primaryNavigation: ["workspace", "affairs", "printables", "history"],
  workspaceLabel: "Next",
  destinationLabels: {
    affairs: "Affairs",
    printables: "Book",
    history: "History",
    settings: "Settings",
  },
  // Parallel questions, not steps, so tabs would imply an order that is
  // not there. See ProductRailShell for the whole reasoning.
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No "setup" destination, deliberately, and this is a design decision
   * rather than an omission.
   *
   * The intake questions are not a separate mode: they are simply the
   * first few steps in the same sequence as everything else, shown on the
   * same single surface. "One step on screen" is this product's first
   * design law, and a setup wizard would be a second place to be.
   *
   * Declaring "setup" also walks into a documented trap. With a setup
   * destination and nothing calling setProductInstanceLifecycle,
   * resolveLifecycleNavigation() pins the product in state 1 and renders
   * a single "Start" link to a destination this product does not
   * register, so the only visible navigation leads nowhere. Personal
   * Finance Companion hit exactly this and its definition still carries
   * the comment explaining why it excludes "setup". Verified live here
   * before removing it.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your affairs",
  },
  modules: [
    { id: "personal-life-affairs-companion.workspace", destination: "workspace" },
    { id: "personal-life-affairs-companion.affairs", destination: "affairs" },
    { id: "personal-life-affairs-companion.printables", destination: "printables" },
    { id: "personal-life-affairs-companion.history", destination: "history" },
    { id: "personal-life-affairs-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Ink and brass. Deliberately not a recolour of a sibling: covered up,
   * this product must be distinguishable from Home Base's sage warmth and
   * PFC's teal density (the P3 distinctiveness test).
   *
   * Ink blue carries signatures, documents and permanence. Brass is the
   * colour of "done" and is spent only on completion, which is why it is
   * declared here as the accent while ink carries the primary scale.
   */
  theme: {
    accent: "#26374f",
    accentScale: {
      base: "#26374f",
      strong: "#1a2738",
      soft: "#e6eaf0",
      contrast: "#ffffff",
      // Pale slate-blue, one step paler than soft, for a hero card or
      // section background rather than a second computed identity.
      wash: "#f2f4f7",
    },
    // The instruction is this product's hero, so the narrative serif
    // carries a sentence telling you what to do, not a number and not a
    // description of your home.
    narrativeFont: "var(--font-newsreader), ui-serif, Georgia, serif",
    motionPersonality: "calm",
    contentWidth: "narrow",
  },
  layouts: ["responsive"],
  offline: "shell-only",
  // Flipped true only when the evaluator exists (Phase 8). Declaring it
  // early would render a "Supported" badge for a capability that does not
  // exist, which is the exact defect found in Monthly Money Reset.
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["confirmation"] },
  settingsSections: ["notifications", "privacy", "timezone"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
