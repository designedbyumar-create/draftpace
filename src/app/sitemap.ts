import type { MetadataRoute } from "next";
import { NEEDS } from "@/content/needs";
import { GUIDES } from "@/content/guides";
import { shopRegistry } from "@/shop/registry";
import { registerRealShopProducts } from "@/shop/products";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap.ts is a route handler, not wrapped by (marketing)/layout.tsx —
  // it needs its own explicit registration call rather than depending on
  // some other request having already rendered a marketing page first.
  registerRealShopProducts();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.draftpace.com";
  const now = new Date();

  const staticRoutes = [
    { route: "", changeFrequency: "weekly" as const, priority: 1 },
    { route: "/help-with", changeFrequency: "monthly" as const, priority: 0.8 },
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

  const needRoutes = NEEDS.map((need) => ({
    route: `/help-with/${need.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const guideRoutes = GUIDES.map((guide) => ({
    route: `/guides/${guide.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // Only published, real Shop listings. Draft, archived, and dev-preview
  // fixtures never reach here — see src/shop/registry.ts and docs/SHOP.md.
  const shopRoutes = shopRegistry.listPublished().map((product) => ({
    route: `/shop/${product.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...needRoutes, ...guideRoutes, ...shopRoutes].map(({ route, changeFrequency, priority }) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
