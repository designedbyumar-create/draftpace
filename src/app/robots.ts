import type { MetadataRoute } from "next";

/**
 * The disallow list is identical across every rule below on purpose:
 * nothing here restricts one crawler more than another, only names the
 * ones this site is explicitly, deliberately open to, on top of the
 * wildcard that already allows everyone. A generic "User-agent: *,
 * Allow: /" already permits an AI crawler with no rule of its own, so
 * this changes no actual access. It exists because several major AI
 * crawlers are commonly bot-managed or reviewed against an explicit
 * named entry rather than trusted to fall through a wildcard, and
 * because a site owner (or a tool auditing this file) should be able to
 * see the intent stated plainly rather than infer it from an asterisk.
 * See docs/SEO or the sitemap for the disallow reasoning: /app and
 * /admin require a real session and would 404/redirect for a crawler
 * regardless, /api/ is data endpoints, never a page.
 */
const DISALLOW = ["/app", "/app/", "/admin", "/admin/", "/api/"];

// AI crawlers named explicitly. GPTBot/ChatGPT-User/OAI-SearchBot
// (OpenAI), ClaudeBot (Anthropic's own crawler, distinct from this
// product's identity), Google-Extended (Google's separate AI-training
// opt-in, not the same rule as Googlebot's search indexing),
// PerplexityBot, CCBot (Common Crawl, a widely reused AI-training
// source), Applebot-Extended (Apple Intelligence), and Amazonbot.
const AI_USER_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Google-Extended",
  "PerplexityBot",
  "CCBot",
  "Applebot-Extended",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_USER_AGENTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
