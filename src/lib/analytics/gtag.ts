/**
 * The one module that knows how to talk to GA4. Every place in the app
 * that wants to record an event calls `trackEvent()` from here — nothing
 * else touches `window.gtag` directly, so there is exactly one place that
 * could ever double-fire the tag or drift from GA4's parameter shape.
 *
 * WHY THIS EXISTS SEPARATELY FROM THE SCRIPT LOADER
 *
 * GoogleAnalyticsScript.tsx (src/components/analytics/) is what puts
 * gtag.js on the page. This file is what the rest of the app imports —
 * it works whether or not that script has loaded yet, whether or not GA
 * is configured at all, and on the server (where it silently no-ops
 * rather than throwing on a missing `window`).
 *
 * SAFE BY CONSTRUCTION
 *
 * `trackEvent` never throws. A blocked script, a missing measurement ID,
 * an ad blocker, a server-rendered call site, or Google renaming
 * something under us all hit the same `try/catch` and produce nothing —
 * never a broken page. Analytics is instrumentation, not a dependency
 * anything here relies on to function.
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Whether there is a real measurement ID to send anything to. Does not imply the tag has actually loaded. */
export function isAnalyticsConfigured(): boolean {
  return Boolean(GA_MEASUREMENT_ID);
}

/**
 * A GA4 event parameter value. Deliberately just the JSON scalar types —
 * nothing here accepts an object, an array, or anything that could carry
 * a nested user record by accident.
 */
export type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Records one GA4 event. Safe to call from anywhere, at any time,
 * regardless of whether GA is configured, whether gtag.js has finished
 * loading, or whether something is blocking it outright.
 *
 * NEVER PASS PII HERE. This does not scrub its input — the caller is the
 * one place that knows whether a value is a product id or somebody's
 * email, and every call site in this codebase passes only product/UI
 * facts (slugs, titles, button labels), never account data.
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  try {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    window.gtag("event", eventName, params);
  } catch {
    // Analytics failing to send is never a reason for the app to fail.
  }
}

/**
 * Records a page_view for one client-side navigation. Split out from
 * trackEvent only because callers shouldn't have to remember GA4's
 * specific parameter name for "which page" — see AnalyticsPageView.tsx,
 * the one caller.
 *
 * `path` must never carry a query string: see that component's own
 * comment for why query parameters are dropped before this is called.
 */
export function trackPageview(path: string): void {
  trackEvent("page_view", { page_path: path });
}
