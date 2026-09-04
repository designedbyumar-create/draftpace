import type { MetadataRoute } from "next";
import { NEEDS } from "@/content/needs";
import { GUIDES, areasWithGuides } from "@/content/guides";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap.ts is a route handler, not wrapped by (marketing)/layout.tsx,
  // it needs its own explicit registration call rather than depending on
  // some other request having already rendered a marketing page first.
  registerRealShopProducts();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";
  const now = new Date();

  const staticRoutes = [
    { route: "", changeFrequency: "weekly" as const, priority: 1 },
    { route: "/help-with", changeFrequency: "monthly" as const, priority: 0.8 },
    { route: "/help-with/about-ask-dp", changeFrequency: "monthly" as const, priority: 0.4 },
    { route: "/shop", changeFrequency: "weekly" as const, priority: 0.8 },
    { route: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.6 },
    { route: "/guides", changeFrequency: "weekly" as const, priority: 0.6 },
    { route: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { route: "/trust", changeFrequency: "monthly" as const, priority: 0.4 },
    { route: "/accessibility", changeFrequency: "monthly" as const, priority: 0.4 },
    { route: "/support", changeFrequency: "monthly" as const, priority: 0.4 },
    { route: "/careers", changeFrequency: "monthly" as const, priority: 0.4 },
    { route: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { route: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
    { route: "/cookies", changeFrequency: "yearly" as const, priority: 0.3 },
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
  const needRoutes = NEEDS.filter((need) => publishedSlugs.has(need.slug)).map((need) => ({
    route: `/help-with/${need.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  /**
   * Area hubs rank higher than individual guides on purpose: a hub is
   * the page that can compete for the broad terms an article cannot, and
   * it is where link equity from its cluster concentrates. Only hubs
   * that actually have guides are listed, for the same reason the empty
   * need pages were dropped.
   */
  const guideHubRoutes = areasWithGuides().map((area) => ({
    route: `/guides/${area.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guideRoutes = GUIDES.map((guide) => ({
    route: `/guides/${guide.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Only published, real Shop listings. Draft, archived, and dev-preview
  // fixtures never reach here, see src/shop/registry.ts and docs/SHOP.md.
  const shopRoutes = shopRegistry.listPublished().map((product) => ({
    route: `/shop/${product.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...needRoutes, ...guideHubRoutes, ...guideRoutes, ...shopRoutes].map(({ route, changeFrequency, priority }) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
