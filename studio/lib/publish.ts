/**
 * Publishing copy for a film: the title, caption, alt text and tracked
 * link a platform needs, drafted only from the film's own real words (its
 * hook, its captions, the guide's summary) and its destination. Studio
 * shows these as drafts to edit, never as final copy.
 *
 * Every link is tagged, so Results can say which platform and which film
 * sent each visitor.
 */
import type { Film } from "@engine/director/film";
import type { PlatformId } from "@engine/director/platforms";

export const SITE = "https://draftpace.com";

const SOURCE: Record<PlatformId, { source: string; medium: string; links: boolean; captionMax: number; titleMax?: number; label: string }> = {
  "instagram-reel": { source: "instagram", medium: "reel", links: false, captionMax: 2200, label: "Instagram" },
  "instagram-feed": { source: "instagram", medium: "feed-video", links: false, captionMax: 2200, label: "Instagram" },
  "facebook-feed": { source: "facebook", medium: "feed-video", links: true, captionMax: 2000, label: "Facebook" },
  "facebook-reel": { source: "facebook", medium: "reel", links: true, captionMax: 2000, label: "Facebook" },
  "tiktok": { source: "tiktok", medium: "video", links: false, captionMax: 2200, label: "TikTok" },
  "youtube-short": { source: "youtube", medium: "short", links: true, captionMax: 5000, titleMax: 100, label: "YouTube" },
  "pinterest-video": { source: "pinterest", medium: "video-pin", links: true, captionMax: 500, titleMax: 100, label: "Pinterest" },
};

export function platformMeta(p: PlatformId) {
  return SOURCE[p];
}

/** Where the film sends people: the guide it teaches from, else the product (the free one to /free). */
export function destination(f: Pick<Film, "guide" | "product">): string {
  if (f.guide) return `${SITE}/guides/${f.guide}`;
  return f.product === "monthly-money-reset" ? `${SITE}/free` : `${SITE}/shop/${f.product}`;
}

export function trackedLink(f: Pick<Film, "guide" | "product" | "id">, platform: PlatformId): string {
  const s = SOURCE[platform];
  const u = new URL(destination(f));
  u.searchParams.set("utm_source", s.source);
  u.searchParams.set("utm_medium", s.medium);
  u.searchParams.set("utm_campaign", f.id);
  return u.toString();
}

const clip = (t: string, n: number) => (t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);

/** The words a viewer reads in the film, in order, without repeats. */
export function onScreenWords(f: Film): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of f.scenes) {
    for (const c of [s.eyebrow, ...s.copy, s.caption, ...(s.captions ?? [])]) {
      if (!c || c.source === "micro" || /^\d+$/.test(c.text) || seen.has(c.text)) continue;
      seen.add(c.text);
      out.push(c.text);
    }
  }
  return out;
}

export type PublishCopy = { platform: string; title?: string; caption: string; altText: string; link: string; linkNote: string };

export function publishCopy(f: Film, ctx: { productName: string; guideDek?: string } = { productName: f.product }): PublishCopy {
  const s = SOURCE[f.platform];
  const link = trackedLink(f, f.platform);
  const words = onScreenWords(f);
  const hook = f.angle.source === "micro" ? words[0] ?? ctx.productName : f.angle.text;
  const support = ctx.guideDek ?? words.find((w) => w !== hook && w !== ctx.productName && w.split(/\s+/).length >= 6) ?? "";
  const where = f.guide ? "The full guide" : ctx.productName;
  const linkLine = s.links ? `${where}: ${link}` : `${where}: link in bio`;
  const caption = clip([hook, support, linkLine].filter(Boolean).join("\n\n"), s.captionMax);
  const altText = clip(`Video. ${words.join(". ").replace(/\.\./g, ".")}`, 500);
  return {
    platform: s.label,
    ...(s.titleMax ? { title: clip(hook, s.titleMax) } : {}),
    caption,
    altText,
    link,
    linkNote: s.links ? "The link goes in the post." : `${s.label} posts have no clickable links: put this one in your bio or link page.`,
  };
}
