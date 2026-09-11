import type { MetadataRoute } from "next";
import { NEEDS } from "@/content/needs";
import { GUIDES, areasWithGuides, guidesForArea } from "@/content/guides";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap.ts is a route handler, not wrapped by (marketing)/layout.tsx,
  // it needs its own explicit registration call rather than depending on
  // some other request having already rendered a marketing page first.
  registerRealShopProducts();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";

  /**
   * lastModified used to be `new Date()` on every route, on every build,
   * meaning all ~90 URLs restamped "just changed" on every single deploy
   * regardless of whether their content moved at all. That makes the
   * field worthless as the freshness signal it exists to be: a crawler
   * reading "everything changed" learns nothing about what to prioritise
   * recrawling, and a search engine that notices the pattern (every URL,
   * every deploy, always "now") has reason to trust the field less on
   * this domain generally.
   *
   * Guides carry a real publishedAt/updatedAt already (used for the
   * "Updated ..." line on the page itself), so those get their genuine
   * date. A hub's real freshness is the newest guide filed under it. For
   * routes with no per-page date in the content model (the static
   * informational pages, and Shop listings, which have no updatedAt
   * field yet), lastModified is left undefined rather than guessed:
   * Next's sitemap type allows omitting it per-entry, and an honestly
   * absent field is a better signal than a fabricated one.
   */
  const dateOf = (value?: string) => (value ? new Date(value) : undefined);

  // Every route group below returns this same shape, lastModified included
  // (as undefined where there's no real per-page date), so the final
  // combined array is one consistent type instead of a union TypeScript
  // cannot destructure uniformly.
  type Route = {
    route: string;
    changeFrequency: "weekly" | "monthly" | "yearly";
    priority: number;
    lastModified?: Date;
  };

  const staticRoutes: Route[] = [
    { route: "", changeFrequency: "weekly", priority: 1 },
    { route: "/help-with", changeFrequency: "monthly", priority: 0.8 },
    { route: "/help-with/about-ask-dp", changeFrequency: "monthly", priority: 0.4 },
    { route: "/shop", changeFrequency: "weekly", priority: 0.8 },
    // The acquisition page, ranked above every paid listing on purpose:
    // it is the page that has to win searches a priced product cannot,
    // and the only one somebody can act on without spending anything.
    { route: "/free", changeFrequency: "weekly", priority: 0.9 },
    { route: "/how-it-works", changeFrequency: "monthly", priority: 0.6 },
    { route: "/guides", changeFrequency: "weekly", priority: 0.6 },
    { route: "/about", changeFrequency: "monthly", priority: 0.5 },
    { route: "/trust", changeFrequency: "monthly", priority: 0.4 },
    { route: "/accessibility", changeFrequency: "monthly", priority: 0.4 },
    { route: "/support", changeFrequency: "monthly", priority: 0.4 },
    { route: "/careers", changeFrequency: "monthly", priority: 0.4 },
    { route: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { route: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { route: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  ];

  /**
   * Only situations that actually have a product behind them.
   *
   * Three of the six need pages have no product and end by saying so.
   * They were written for a catalogue of generic productivity tools that
   * never arrived, and the Companion Series went somewhere more specific
   * instead. The routes stay alive so nothing already linked or indexed
   * breaks, but advertising a page whose conclusion is "there is no
   * product for this" earns traffic that cannot convert and reads as a
   * thinner catalogue than we have.
   */
  const publishedSlugs = new Set(shopRegistry.listPublished().flatMap((product) => product.needGroups));
  const needRoutes: Route[] = NEEDS.filter((need) => publishedSlugs.has(need.slug)).map((need) => ({
    route: `/help-with/${need.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  /**
   * Area hubs rank higher than individual guides on purpose: a hub is
   * the page that can compete for the broad terms an article cannot, and
   * it is where link equity from its cluster concentrates. Only hubs
   * that actually have guides are listed, for the same reason the empty
   * need pages were dropped.
   */
  const guideHubRoutes = areasWithGuides().map((area) => {
    // The newest activity in the cluster, not the area's own (nonexistent)
    // publish date: the hub page's real content is the list of guides
    // under it, so it goes stale exactly when that list does.
    const newest = guidesForArea(area.slug).reduce<Date | undefined>((latest, guide) => {
      const guideDate = dateOf(guide.updatedAt ?? guide.publishedAt);
      if (!guideDate) return latest;
      return !latest || guideDate > latest ? guideDate : latest;
    }, undefined);
    return {
      route: `/guides/${area.slug}`,
      lastModified: newest,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  }) satisfies Route[];

  const guideRoutes: Route[] = GUIDES.map((guide) => ({
    route: `/guides/${guide.slug}`,
    lastModified: dateOf(guide.updatedAt ?? guide.publishedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  // Only published, PAID Shop listings. Draft, archived, and dev-preview
  // fixtures never reach here, see src/shop/registry.ts and docs/SHOP.md.
  // A free product's /shop URL permanently redirects to /free, and
  // listing a redirect in a sitemap asks a crawler to index a hop.
  const shopRoutes: Route[] = shopRegistry.listPublishedPaid().map((product) => ({
    route: `/shop/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...needRoutes, ...guideHubRoutes, ...guideRoutes, ...shopRoutes].map(
    ({ route, changeFrequency, priority, lastModified }) => ({
      url: `${siteUrl}${route}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency,
      priority,
    })
  );
}
