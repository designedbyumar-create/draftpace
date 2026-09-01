import type { NextConfig } from "next";

/**
 * No app-level host redirect here. The canonical apex-vs-www redirect is
 * owned entirely by the Vercel project's own domain configuration (a single
 * edge-level rule) — see docs note in the launch report. Adding a second,
 * opposite-direction redirect at this layer created a live apex<->www
 * infinite redirect loop the moment both hostnames pointed at the same
 * deployment, so this layer must never also redirect on host.
 *
 * Path redirects are safe and are used below: two early guides were
 * retired when the Companion Series taxonomy replaced the old needs one,
 * and their URLs had been live and indexed. Each points at the area hub
 * that now covers the same ground rather than at /guides, so the link
 * equity lands somewhere specific.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/guides/planning-a-move-without-losing-the-details",
        destination: "/guides/home",
        permanent: true,
      },
      {
        source: "/guides/deciding-when-every-option-feels-risky",
        destination: "/guides/mind-and-focus",
        permanent: true,
      },

      // Seventeen guides were retitled toward the words people actually
      // type and their slugs followed. Done a day after launch, when
      // there was no accumulated authority to lose, which is the only
      // cheap moment for a rename like this.
      { source: "/guides/diagnosed-at-forty-the-admin-nobody-warned-you-about", destination: "/guides/diagnosed-with-adhd-as-an-adult", permanent: true },
      { source: "/guides/group-trip-coordination-without-becoming-the-admin", destination: "/guides/how-to-plan-a-group-trip", permanent: true },
      { source: "/guides/homeschool-records-what-to-keep-and-what-to-bin", destination: "/guides/how-long-to-keep-homeschool-records", permanent: true },
      { source: "/guides/homeschool-records-when-you-have-kept-nothing-since-october", destination: "/guides/how-to-catch-up-on-homeschool-records", permanent: true },
      { source: "/guides/homeschool-records-without-a-system-you-abandon", destination: "/guides/simple-homeschool-record-keeping-system", permanent: true },
      { source: "/guides/how-to-tell-whether-something-actually-stuck", destination: "/guides/how-to-check-if-your-child-learned-something", permanent: true },
      { source: "/guides/inheriting-a-house-nobody-documented", destination: "/guides/inherited-a-house-where-to-start", permanent: true },
      { source: "/guides/just-bought-a-house-what-to-record-in-week-one", destination: "/guides/first-week-after-buying-a-house", permanent: true },
      { source: "/guides/picking-something-back-up-after-abandoning-it", destination: "/guides/how-to-restart-a-project-you-gave-up-on", permanent: true },
      { source: "/guides/the-task-that-has-been-on-your-mind-for-a-month", destination: "/guides/why-you-keep-thinking-about-a-task-and-not-doing-it", permanent: true },
      { source: "/guides/untangling-money-after-a-life-change", destination: "/guides/sort-out-your-finances-after-a-life-change", permanent: true },
      { source: "/guides/what-else-your-trip-depends-on-when-something-changes", destination: "/guides/flight-changed-what-else-is-affected", permanent: true },
      { source: "/guides/what-to-log-after-a-repair", destination: "/guides/what-to-keep-after-a-home-repair", permanent: true },
      { source: "/guides/what-to-record-about-an-appliance-before-you-need-it", destination: "/guides/what-to-record-when-you-buy-an-appliance", permanent: true },
      { source: "/guides/what-your-family-would-need-to-know-tomorrow", destination: "/guides/what-to-write-down-in-case-something-happens-to-you", permanent: true },
      { source: "/guides/when-something-has-been-left-so-long-it-is-embarrassing", destination: "/guides/how-to-deal-with-something-you-have-put-off", permanent: true },
      { source: "/guides/why-your-available-balance-is-lying-to-you", destination: "/guides/available-balance-vs-current-balance", permanent: true },
      { source: "/guides/seasonal-home-maintenance-without-the-pointless-jobs", destination: "/guides/home-maintenance-checklist-by-month", permanent: true },
      { source: "/guides/travel-documents-for-a-family", destination: "/guides/travel-document-checklist", permanent: true },
    ];
  },
};

export default nextConfig;
