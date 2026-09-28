import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@/design-system/Icon";

/**
 * One guide, wherever it is listed off the guide page itself: the
 * homepage strip, a Companion's own page, the `/guides` shelf and its
 * search results.
 *
 * Before this, four different places each hand-rolled their own anchor,
 * and none of them showed the guide's own thumbnail, so a guide read as
 * a line of text borrowed from a category rather than a thing that
 * exists on its own. This is the one card all four now share, in three
 * shapes: `row` (a compact list entry), `grid` (a full card with a
 * visible "read the guide" affordance, for a page whose whole job is
 * browsing articles), and `minimal` (thumbnail and title only, for a
 * homepage teaser that should read as one flagship pick, not a card
 * competing for attention with dek copy and a CTA line).
 *
 * It never imports `guideArt` itself. The thumbnail is resolved by the
 * caller and passed in as a plain string, the same boundary
 * `GuidesExplorer.tsx` already keeps for itself: a client component
 * that never reaches into the content layer, and a server component
 * that resolves everything once, up front.
 */

export type GuideCardData = {
  slug: string;
  title: string;
  dek?: string;
  readingTime?: string;
  areaLabel?: string;
};

export default function GuideCard({
  guide,
  thumb,
  areaSlug,
  variant,
  sizes,
  fallback,
}: {
  guide: GuideCardData;
  /** guideArt(guide.slug)?.thumb, resolved by the caller. */
  thumb?: string;
  /** Sets the card's accent color via --area / --area-soft. Omit for no accent (e.g. an orphan guide with no area). */
  areaSlug?: string | null;
  /** `row`: a compact thumb beside title/dek, for a list. `grid`: a full card with a CTA line. `minimal`: thumb and title only. */
  variant: "row" | "grid" | "minimal";
  sizes?: string;
  /** Shown in the thumbnail's place when there is no `thumb`, e.g. an area Mark. Omit to render text-only. */
  fallback?: ReactNode;
}) {
  const style = areaSlug
    ? ({ "--area": `var(--area-${areaSlug})`, "--area-soft": `var(--area-${areaSlug}-soft)` } as React.CSSProperties)
    : undefined;

  const media =
    thumb || fallback ? (
      <span
        className={
          variant === "row"
            ? "hidden h-[99px] w-[132px] shrink-0 overflow-hidden rounded-lg bg-[var(--area-soft,var(--surface-muted))] sm:flex sm:items-center sm:justify-center"
            : "flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-lg bg-[var(--area-soft,var(--surface-muted))]"
        }
      >
        {thumb ? (
          <Image
            src={thumb}
            alt=""
            width={800}
            height={600}
            sizes={sizes ?? (variant === "row" ? "132px" : "(min-width: 640px) 220px, 100vw")}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="h-[60%] w-[60%] text-[var(--area,var(--faint))]">{fallback}</span>
        )}
      </span>
    ) : null;

  if (variant === "minimal") {
    return (
      <Link
        href={`/guides/${guide.slug}`}
        style={style}
        className="group flex flex-col gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {media}
        <span className="flex flex-col gap-1.5">
          {guide.areaLabel && (
            <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">{guide.areaLabel}</span>
          )}
          <span className="text-[15px] font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--area,var(--primary))]">
            {guide.title}
          </span>
          {guide.dek && <span className="line-clamp-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{guide.dek}</span>}
        </span>
      </Link>
    );
  }

  const text = (
    <span className="min-w-0 flex-1">
      {guide.areaLabel && (
        <span className="block text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">{guide.areaLabel}</span>
      )}
      <span
        className={[
          "block font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--area,var(--primary))]",
          guide.areaLabel ? "mt-2" : "",
          variant === "grid" ? "text-[16px]" : "text-[14.5px]",
        ].join(" ")}
      >
        {guide.title}
      </span>
      {guide.dek && (
        <span
          className={[
            "block text-[13.5px] leading-relaxed text-[var(--muted)]",
            variant === "grid" ? "mt-1.5 flex-1" : "mt-1 hidden sm:block",
          ].join(" ")}
        >
          {guide.dek}
        </span>
      )}
      {guide.readingTime && (
        <span className="mt-2 block font-mono text-[11px] text-[var(--faint)]">{guide.readingTime}</span>
      )}
      {variant === "grid" && (
        // Not <TextLink>: this whole card is already one <Link>, and
        // nesting an <a> inside an <a> is invalid HTML. A plain span
        // styled to match is the correct exception here, not a bug.
        <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--area,var(--primary))]">
          Read the free guide
          <ArrowRight size={13} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </span>
  );

  if (variant === "grid") {
    return (
      <Link
        href={`/guides/${guide.slug}`}
        style={style}
        className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-[color,box-shadow,border-color] hover:border-[var(--area,var(--primary))] hover:shadow-[shadow:var(--shadow-xs)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        {media}
        <span className={media ? "mt-3 flex flex-1 flex-col" : "flex flex-1 flex-col"}>{text}</span>
      </Link>
    );
  }

  return (
    <Link
      href={`/guides/${guide.slug}`}
      style={style}
      className="group flex items-center gap-4 rounded-lg py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
    >
      {media}
      {text}
      <ArrowRight
        size={14}
        aria-hidden
        className="hidden shrink-0 text-[var(--faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--area,var(--primary))] sm:block"
      />
    </Link>
  );
}
