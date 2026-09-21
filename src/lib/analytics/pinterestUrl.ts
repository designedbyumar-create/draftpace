/**
 * Generates a Pinterest destination URL for one Pin. The other direction
 * of utm.ts: that file preserves attribution the app receives; this
 * builds the links that create it in the first place.
 *
 * NOT WIRED INTO THE APP ANYWHERE
 *
 * This is a tool for whoever is making Pins, not application code — call
 * it from a script when generating a batch of Pin destination URLs to
 * paste into Pinterest. Nothing here should ever run for a visitor
 * browsing the site: an internal Draftpace link never carries a
 * utm_source, or every visit would look like it came from Pinterest.
 *
 * SCALES TO ANY NUMBER OF PINS WITHOUT A CODE CHANGE
 *
 * The function takes the campaign and Pin id as plain strings — nothing
 * here enumerates products or pre-generates ids. Whether it is called
 * once or five thousand times with different arguments is entirely up to
 * the caller; this file does not know or care how many Pins exist.
 */

const ORGANIC_PINTEREST_UTM = {
  source: "pinterest",
  medium: "organic_social",
} as const;

export interface BuildPinterestUrlInput {
  /** Where the Pin lands, e.g. "/shop/personal-finance-companion" or "/free". Always a site-relative path. */
  path: string;
  /** The product slug or broader campaign id — utm_campaign. e.g. "personal_finance_companion". */
  campaign: string;
  /** This Pin's own unique id — utm_content. e.g. "pfc_001". Uniqueness across Pins is the caller's responsibility (see this file's own comment on scale). */
  pinId: string;
  /** Optional utm_term, for the rare Pin worth distinguishing by keyword/audience rather than just its id. */
  term?: string;
}

/**
 * Same site-URL convention as everywhere else public config is read
 * (NEXT_PUBLIC_SITE_URL, checked once here rather than per call) —
 * matches src/shop/lemonSqueezyCheckout.ts's own fallback exactly, so a
 * preview deployment generates links back to itself rather than to
 * production.
 */
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";
}

export function buildPinterestUrl({ path, campaign, pinId, term }: BuildPinterestUrlInput): string {
  const url = new URL(path, siteUrl());
  url.searchParams.set("utm_source", ORGANIC_PINTEREST_UTM.source);
  url.searchParams.set("utm_medium", ORGANIC_PINTEREST_UTM.medium);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", pinId);
  if (term) url.searchParams.set("utm_term", term);
  return url.toString();
}
