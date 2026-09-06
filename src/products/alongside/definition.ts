import { ProductDefinitionInput } from "@/product-framework/definition";

/**
 * Alongside.
 *
 * The fifth Draftpace product. See
 * docs/products/ADHD-LIFE-COMPANION-PROPOSAL.md for the approved model;
 * this file registers it and nothing more.
 *
 * WHAT THIS PRODUCT IS, so later contributors do not drift it
 *
 * External memory, derived attention, and a practical companion for
 * getting through a thing. The loop is: remember, notice, accompany,
 * act, record, remember again. A person can enter from either end, by
 * writing something down or by opening the Companion because they need
 * help with something right now.
 *
 * THE BOUNDARY THAT DEFINES IT, AND THE ONE MOST LIKELY TO BE BROKEN
 *
 * The other four Companions own a SUBJECT. Personal Finance Companion
 * owns financial facts, Home Base owns home facts, Personal Life Affairs
 * Companion owns life-affairs facts, Homeschooling Companion owns
 * educational facts.
 *
 * Alongside owns DOING. It holds the user's relationship with something
 * they are trying to do, and never the thing itself. It records that
 * somebody needs to sort out a problem with their electricity bill. It
 * does not record the provider, the amount, the account number or the
 * due date, because the moment it does it is a worse version of a
 * product we already sell.
 *
 * There is no "add a bill" anywhere in this product, and there will not
 * be. See als_items in the schema: a title, a note, dates and a history,
 * and nothing subject-specific.
 *
 * THE NAME
 *
 * Built under the working name "Alongside" (see the Phase 0 research in
 * docs/products/ADHD-LIFE-COMPANION-PROPOSAL.md section 11, which
 * recommended it precisely so ADHD stayed out of the brand name and the
 * price). The founder overrode that recommendation after seeing the
 * built product: the display name is "ADHD Life Companion", named
 * plainly rather than split across a problem-forward brand and an
 * SEO-only mention.
 *
 * The slug, table prefix (als_), internal identifiers and every code
 * comment below still say "Alongside": that name reaches a live
 * product_instances row in production, and changing it would need a
 * data migration for no user-facing benefit. Same split this codebase
 * already uses for Home Base, whose title diverges from its slug
 * (home-management-companion) for the same reason. Only `title` and the
 * PWA identity below carry the new name; nothing else in this file
 * changed.
 *
 * WORDS BANNED FROM EVERY USER-FACING SURFACE
 *
 * lazy, irresponsible, failing, failed, behind, back on track, should
 * have, wasted, procrastinat, distracted, discipline, bad habits, fix
 * yourself, overcome, get your life together, overdue, and "just".
 *
 * "Just" is on that list for a reason worth stating: "just send the
 * email" trivialises initiation difficulty, and it is the single most
 * common way software condescends to this audience. Enforced by test.
 */
export const alongsideDefinition: ProductDefinitionInput = {
  id: "alongside",
  slug: "alongside",
  title: "ADHD Life Companion",
  tagline:
    "When life is too much to hold in your head, this holds it with you. Write something down once, see it when it matters, and get help working through it when you are ready.",
  family: "companion",
  version: "0.1.0",
  status: "active",
  access: { model: "paid" },
  cycleModel: "continuous",
  /**
   * Every one of these already existed in the registry and none was
   * written for this product. companion.context is the externalised
   * project state, and companion.recovery is picking up something that
   * was abandoned, which is the most specific thing this product does.
   */
  capabilities: ["companion.context", "companion.next-action", "companion.recovery", "companion.outcomes"],
  pwa: {
    name: "ADHD Life Companion",
    shortName: "ADHD Companion",
    description:
      "ADHD Life Companion by Draftpace: hold what you cannot keep in your head, and get through the thing when you are ready.",
    themeColor: "#8d4a5c",
    backgroundColor: "#fbfaf7",
    icons: [
      { src: "/logo/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/logo/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    provisionalBranding: true,
  },
  /**
   * Three destinations, one per question the product answers:
   *
   *   Now     what deserves my attention?
   *   Life    what does it remember?
   *   Help    I need to do a thing
   *
   * Help is a destination rather than a button on another screen,
   * because starting there with no record at all is a first-class path
   * and burying it would make it read as a subordinate mode.
   *
   * There is no History destination. A log of everything you have done
   * is precisely the artefact this audience does not need; a thread's
   * own history lives on the thread.
   */
  navigation: ["workspace", "life", "help", "settings"],
  primaryNavigation: ["workspace", "life", "help"],
  workspaceLabel: "Now",
  destinationLabels: {
    life: "Life",
    help: "Help",
    settings: "Settings",
  },
  navigationStyle: "rail",
  startRoute: "workspace",
  /**
   * No setup destination. This product must be useful on the first
   * screen with nothing recorded, which is the whole of section 12 of
   * the brief: a giant setup form kills it before it starts. Life
   * accumulates from use.
   *
   * Declaring "setup" would also pin the product in
   * resolveLifecycleNavigation's first state behind a Start link to a
   * destination it does not register. Personal Finance Companion
   * shipped that once.
   */
  setup: {
    required: false,
    skippable: true,
    completedLabel: "Review your setup",
  },
  modules: [
    { id: "alongside.workspace", destination: "workspace" },
    { id: "alongside.life", destination: "life" },
    { id: "alongside.help", destination: "help" },
    { id: "alongside.settings", destination: "settings" },
  ],
  permissions: [],
  events: [],
  /**
   * Muted mulberry. Deliberately its own hue: teal, clay, sage, ink blue
   * and plum are taken, and covered up these five products have to be
   * tellable apart.
   *
   * Warm rather than cool on purpose. This is the product a person opens
   * when something has been sitting undone for three weeks, and a cold
   * palette on that screen reads as clinical. Red is deliberately not
   * used anywhere as a status colour, because nothing in this product is
   * an alarm.
   */
  theme: {
    accent: "#8d4a5c",
    accentScale: {
      base: "#8d4a5c",
      strong: "#68343f",
      soft: "#f5eaec",
      contrast: "#ffffff",
      // Already pastel enough to double as the wash tier as-is (design-
      // system audit finding): formalized here rather than computing a
      // second, paler value nobody asked for.
      wash: "#f5eaec",
    },
    narrativeFont: "var(--font-newsreader), ui-serif, Georgia, serif",
    motionPersonality: "calm",
    contentWidth: "narrow",
  },
  layouts: ["responsive"],
  offline: "shell-only",
  /**
   * False, and this is the honest state rather than a placeholder.
   *
   * Phase 0 research found that push reaches iOS only through a manual
   * multi-step home screen install that no page can trigger, and that
   * web push opt-in runs from roughly 3% to 15% even where no install is
   * needed. Attention is therefore built as a layer with delivery behind
   * an adapter: in-app in v1, push measured later. Nothing in this
   * product claims to notify anybody until that measurement justifies
   * it.
   */
  notifications: { supported: false },
  progressModel: { kind: "custom" },
  history: { enabled: true, kinds: ["outcome", "note"] },
  settingsSections: ["privacy", "timezone"],
  migrationPolicy: { compatibility: "backward-compatible" },
  devFixture: false,
};
