"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAnalyticsConfigured, trackPageview } from "@/lib/analytics/gtag";

/**
 * Sends exactly one page_view per real navigation, including the very
 * first — see GoogleAnalyticsScript.tsx's comment on send_page_view:
 * false for why the automatic one is disabled and this is the only
 * sender.
 *
 * DELIBERATELY usePathname() ONLY, NEVER useSearchParams()
 *
 * Reading the query string here would mean it rides along in page_path,
 * and several real routes carry things that must never reach GA: a
 * signup redirect target, an activation error flag, an OAuth or session
 * parameter. usePathname() alone can't see any of that, so there's
 * nothing to accidentally forward — the tradeoff is that a change in
 * query string alone (rare in this app; nothing here is a query-param-
 * driven view like paginated search results) doesn't produce a second
 * page_view, which is the right call for the same reason.
 *
 * This also means no Suspense boundary is required. useSearchParams()
 * needs one under the App Router; usePathname() does not.
 *
 * Rendered once, in the root layout, alongside GoogleAnalyticsScript —
 * not per-page, so adding it to a new route means nothing.
 *
 * A KNOWN, ACCEPTED GAP
 *
 * This component's effect and GoogleAnalyticsScript's inline script are
 * both "afterInteractive": on a cold load there is no strict guarantee
 * which runs first. If this effect fires first, trackPageview's own
 * safe-by-construction check (`typeof window.gtag !== "function"`) means
 * that single, very first page_view is silently skipped rather than
 * queued — every navigation after it fires normally once gtag exists.
 * Retrying or polling for gtag's arrival would trade a rare, harmless
 * under-count for real complexity, which is the wrong side of that trade
 * for an analytics tag specifically (see gtag.ts's own "never break the
 * app" rule).
 */
export default function AnalyticsPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    trackPageview(pathname);
  }, [pathname]);

  return null;
}
