import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";

/**
 * Loads gtag.js exactly once, in the root layout, for every route
 * including /app and /admin — the same tag Google's own GA4 setup
 * instructions hand you, wrapped in next/script rather than a hand-rolled
 * <script> tag so Next.js schedules it correctly relative to hydration.
 *
 * WHY next/script AND NOT @next/third-party/google
 *
 * @next/third-party's <GoogleAnalytics> component is a thin wrapper
 * around this exact snippet — it would add a new dependency to install
 * and pin for a few lines of code this project already has full control
 * over without one. This codebase's own convention is to hand-write a
 * third-party integration in the amount of code it actually takes rather
 * than take on an SDK for it (see CheckoutButton.tsx's lemon.js, or the
 * web-push integration: no Resend/SendGrid, no Lemon Squeezy SDK). This
 * follows the same rule.
 *
 * WHY strategy="afterInteractive"
 *
 * Loads after the page is interactive rather than blocking the initial
 * render — Next's own recommended strategy for analytics: real, but never
 * a reason a first paint waits.
 *
 * send_page_view: false — GA4's default config call fires its own
 * page_view the moment it loads, which only ever sees the URL the tag was
 * requested on. Every navigation after that is a client-side route change
 * gtag.js has no way to see on its own (no full page load, no request).
 * Disabling the automatic one and sending every page_view — including the
 * first — from AnalyticsPageView.tsx's usePathname effect is what makes
 * page_view counts correct for both the entry page and every navigation
 * after it, rather than only the first.
 *
 * RENDERS NOTHING WHEN GA ISN'T CONFIGURED
 *
 * No measurement ID (local dev without the env var, a preview deployment
 * that hasn't set it) means this returns null: no request to Google, no
 * console noise, and — just as important — no real traffic accidentally
 * landing in the production GA4 property from a machine that was never
 * meant to report to it.
 */
export default function GoogleAnalyticsScript() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // anonymize_ip is a Universal Analytics-era flag gtag.js still
          // honours for GA4 configs; left on as an explicit "don't keep the
          // full IP" signal on top of GA4's own default IP handling.
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false, anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
