import type { MetadataRoute } from "next";
import { planners } from "@/lib/planners";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.draftpace.com";
  const now = new Date();

  const publicRoutes = [
    "",
    "/features",
    "/store",
    "/pricing",
    "/about",
    "/support",
    "/blog",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  return [
    ...publicRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: now,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.7,
    })),
    ...planners.map((planner) => ({
      url: `${siteUrl}/store?system=${planner.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
