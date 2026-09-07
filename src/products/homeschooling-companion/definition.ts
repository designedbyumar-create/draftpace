import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Homeschooling Companion.
 *
 * The fourth Draftpace product, and the first in the `learning` family.
 * See docs/products/HOMESCHOOLING-COMPANION-PROPOSAL.md for the approved
 * product model; this file registers it and nothing more.
 *
 * WHAT THIS PRODUCT IS, so later contributors do not drift it
 *
 * It is not a curriculum, not a planner, and not a gradebook. The parent
 * decides what their child learns. The Companion helps them organize it,
 * remember it, check it, and keep a record of it. Today, Record and
 * Check are features inside one Companion, and the loop between them is
 * the product: set up a child, establish what they are learning, see
 * today, do the work, record what happened, optionally check
 * understanding, adjust, repeat, and keep the long record.
 *
 * WORDS BANNED FROM EVERY USER-FACING SURFACE
 *
 * "behind", "ahead", "grade level", "proficient", "failing", and any
 * score presented as a verdict about a child. A homeschooling parent is
 * already anxious about all six; a product that supplies the vocabulary
 * of comparison has taken a side against the person paying for it. Same
 * discipline as "estate" and "assets" in Personal Life Affairs Companion
 * and "overdue" in Home Base, and enforced the same way, by test.
 *
 * cycleModel is "continuous": an education has no monthly reset, and
 * there is exactly one instance per family, same as all three siblings.
 */
export const homeschoolingCompanionDefinition: ProductDefinitionInput = {
  id: "homeschooling-companion",
  slug: "homeschooling-companion",
  title: "Homeschooling Companion",
  tagline:
    "You decide what your child learns. This keeps track of where you are, tells you the next useful thing, remembers what happened, and helps you check whether it landed.",
  /**
   * The first product in a second family. `learning` has existed in the
   * registry since the platform reset, with learning.lesson,
   * learning.activity, learning.assessment and learning.mastery, and has
   * been waiting for a product to prove it.
   *
   * Note the real constraint this brings: registry.ts rejects any
   * capability whose namespace does not match the family, so a `learning`
   * product cannot declare companion.next-action. "Today's next thing" is
   * therefore learning.activity. That is honest rather than a workaround:
   * a task in this product genuinely is a learning activity, not a
   * companion's next action.
   */
  family: "learning",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  capabilities: ["learning.lesson", "learning.activity", "learning.assessment", "learning.mastery"],
  // Provisional, same convention as all three siblings: Draftpace's
  // neutral icons until real artwork is a founder decision.
  pwa: {
    name: "Homeschooling Companion",
    shortName: "Homeschool",
    description:
      "Homeschooling Companion by Draftpace: keep track of what your children are learning, what to do today, and what they have actually understood.",
    themeColor: "#6a4a72",
    backgroundColor: "#fbfaf7",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  /**
   * Three destinations, derived from the three scopes the product loop
   * actually has:
   *
   *   Today    the household, this morning
   *   Kids     one child, at any point in the loop
   *   Record   across time, and the Book
   *
   * Not five. "Plan" belongs inside a child, because a curriculum without
   * a child is nothing and putting it at the top forces the parent to
   * hold "which child is this for" in their head. "Library" is not built,
   * and a destination with nothing behind it is a promise the product
   * does not keep.
   */
  navigation: ["workspace", "kids", "record", "settings"],
  primaryNavigation: ["workspace", "kids", "record"],
  workspaceLabel: "Today",
  destinationLabels: {
    kids: "Kids",
    record: "Record",
    settings: "Settings",
  },
  // Parallel questions rather than steps, same reasoning as Personal Life
  // Affairs Companion. See ProductRailShell.
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No "setup" destination, deliberately, for the same reason its
   * siblings exclude it. Adding a child and saying what they are learning
   * happens inside Kids, which is where the parent will look for it
   * anyway. Declaring "setup" with nothing calling
   * setProductInstanceLifecycle also pins the product in
   * resolveLifecycleNavigation's state 1, rendering one "Start" link to a
   * destination that does not exist. Personal Finance Companion hit that
   * and its definition still carries the warning.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your setup",
  },
  modules: [
    { id: "homeschooling-companion.workspace", destination: "workspace" },
    { id: "homeschooling-companion.kids", destination: "kids" },
    { id: "homeschooling-companion.record", destination: "record" },
    { id: "homeschooling-companion.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Muted plum. Deliberately not a recolour of a sibling: covered up,
   * this must be distinguishable from Personal Finance Companion's teal,
   * Monthly Money Reset's clay, Home Base's sage and Personal Life
   * Affairs Companion's ink blue.
   *
   * Plum because it is bookish and adult. The one thing this product's
   * colour must not do is read as children's software: the person using
   * it is a parent doing serious work, and every competitor in the
   * category signals the opposite with primaries and cartoons.
   */
  theme: {
    accent: "#6a4a72",
    accentScale: {
      base: "#6a4a72",
      strong: "#4a3350",
      soft: "#f0eaf1",
      contrast: "#ffffff",
      // Pale lavender, consistent with plum rather than a second colour
      // computed separately: soft is already close, wash goes one step
      // paler again for a hero card or section background.
      wash: "#f6f1f7",
    },
    // A serif carries the child's name and the day's work. Shared with
    // two siblings on purpose: the narrative face is a Draftpace family
    // trait, and the accent is what separates the products.
    narrativeFont: "var(--font-newsreader), ui-serif, Georgia, serif",
    motionPersonality: "calm",
    contentWidth: "narrow",
  },
  layouts: ["responsive"],
  offline: "shell-only",
  // Flipped true only when an evaluator exists. Declaring it early would
  // render a "Supported" badge for a capability that does not exist,
  // which is the defect found in Monthly Money Reset.
  notifications: { supported: false },
  /**
   * "custom", not the family's default "mastery". Mastery is a percentage
   * by another name, and this product refuses to produce a number that
   * stands as a verdict about a child. What it reports instead is
   * per-topic standing, including "not enough to say".
   */
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["work", "observation", "check"] },
  settingsSections: ["privacy", "timezone"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
