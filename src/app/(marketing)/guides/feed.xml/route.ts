import { GUIDES, SERIES } from "@/content/guides";
import { getAreaBySlug } from "@/content/areas";

/**
 * /guides/feed.xml: an RSS 2.0 feed of every guide, newest edit first.
 *
 * Exists so a feed reader, or Pinterest's own crawler, learns about a
 * new or meaningfully changed guide without waiting for its next full
 * crawl of the site. `pubDate` is each guide's own `updatedAt` (falling
 * back to `publishedAt`), the same real date already shown on the page
 * and used by sitemap.ts, never a build-time "just changed" stamp: see
 * the long comment in sitemap.ts for why that distinction matters.
 *
 * A route handler, not a static public/feed.xml file, for the same
 * reason llms.txt and sitemap.ts are handlers: the list is generated
 * from the guide registry, so a guide that's added, retitled or edited
 * updates the feed for free and the feed can never drift out of sync
 * with what the site actually has.
 */

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const rfc822 = (date: string) => new Date(`${date}T00:00:00Z`).toUTCString();

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://draftpace.com";

  const items = GUIDES.filter((guide) => guide.areaSlug !== null && guide.areaSlug !== SERIES)
    .map((guide) => ({ guide, date: guide.updatedAt ?? guide.publishedAt }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const lastBuildDate = items[0] ? rfc822(items[0].date) : rfc822(new Date().toISOString().slice(0, 10));

  const itemsXml = items
    .map(({ guide, date }) => {
      const url = `${siteUrl}/guides/${guide.slug}`;
      const area = guide.areaSlug ? getAreaBySlug(guide.areaSlug) : undefined;
      return [
        "<item>",
        `<title>${escapeXml(guide.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${rfc822(date)}</pubDate>`,
        `<description>${escapeXml(guide.dek)}</description>`,
        area ? `<category>${escapeXml(area.label)}</category>` : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">` +
    `<channel>` +
    `<title>Draftpace guides</title>` +
    `<link>${siteUrl}/guides</link>` +
    `<atom:link href="${siteUrl}/guides/feed.xml" rel="self" type="application/rss+xml" />` +
    `<description>Practical guides for the parts of life that are hard to keep track of: money, home, focus, family, affairs and travel.</description>` +
    `<language>en-us</language>` +
    `<lastBuildDate>${lastBuildDate}</lastBuildDate>` +
    itemsXml +
    `</channel>` +
    `</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
