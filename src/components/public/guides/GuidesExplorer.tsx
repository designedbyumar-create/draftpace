"use client";

import { useMemo, useState } from "react";
import { Search, X } from "@/design-system/Icon";
import { textLinkClassName } from "@/design-system/textLinkStyles";
import GuideCard from "./GuideCard";

/**
 * The guides index: search, filter by area, one flat grid of cards.
 *
 * This used to swap between two views, a "shelf" of eight boxed area
 * panels at rest and a search grid once you typed or picked an area.
 * The boxed panels were the whole complaint: colour-filled tiles that
 * read as eight more category cards rather than as a collection of a
 * hundred and thirty seven specific articles. One grid, always, is both
 * simpler to reason about and closer to what this page is actually for:
 * "Everything" is just the empty-filter case of the same list a search
 * produces, not a different page.
 *
 * Searching matches titles and summaries rather than full body text.
 * Full text would need the whole library in the client bundle, and
 * matching a word buried in paragraph nine produces results a reader
 * cannot see the relevance of.
 */

export interface ExplorerArea {
  slug: string;
  label: string;
}

export interface ExplorerGuide {
  slug: string;
  title: string;
  dek: string;
  readingTime: string;
  areaSlug: string;
  areaLabel: string;
  /** guideArt(slug)?.thumb, resolved server-side so this client component never imports the content module. */
  thumb?: string;
}

export default function GuidesExplorer({
  areas,
  guides,
}: {
  areas: ExplorerArea[];
  guides: ExplorerGuide[];
}) {
  const [query, setQuery] = useState("");
  const [areaSlug, setAreaSlug] = useState<string | null>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (areaSlug && guide.areaSlug !== areaSlug) return false;
      if (!needle) return true;
      return guide.title.toLowerCase().includes(needle) || guide.dek.toLowerCase().includes(needle);
    });
  }, [guides, query, areaSlug]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[shadow:var(--shadow-xs)] focus-within:border-[var(--primary)]">
          <Search size={17} aria-hidden className="shrink-0 text-[var(--faint)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${guides.length} guides`}
            aria-label={`Search ${guides.length} guides by title or summary`}
            className="w-full bg-transparent text-[15.5px] text-[var(--text)] outline-none placeholder:text-[var(--faint)] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear the search"
              className="shrink-0 rounded p-0.5 text-[var(--faint)] transition-colors hover:text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <X size={15} aria-hidden />
            </button>
          )}
        </div>

        {/* Area chips. They scroll rather than wrap on a phone, so the
            row stays one line and the search stays reachable. */}
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            <Chip active={areaSlug === null} onClick={() => setAreaSlug(null)}>
              Everything
            </Chip>
            {areas.map((area) => (
              <Chip
                key={area.slug}
                active={areaSlug === area.slug}
                accent={`var(--area-${area.slug})`}
                onClick={() => setAreaSlug(areaSlug === area.slug ? null : area.slug)}
              >
                {area.label}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {results.length} guide{results.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8">
        <p className="text-[13px] text-[var(--muted)]">
          {results.length === 0 ? "Nothing matches that." : `${results.length} guide${results.length === 1 ? "" : "s"}`}
        </p>

        {results.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
            <p className="text-[15px] text-[var(--muted)]">
              Try a plainer word. These are filed by the situation somebody is in, so &ldquo;passport&rdquo; and
              &ldquo;probate&rdquo; work better than a category name.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setAreaSlug(null);
              }}
              className={textLinkClassName({ className: "mt-4" })}
            >
              Show everything again
            </button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((guide) => (
              <li key={guide.slug}>
                <GuideCard
                  variant="grid"
                  areaSlug={guide.areaSlug}
                  thumb={guide.thumb}
                  guide={{
                    slug: guide.slug,
                    title: guide.title,
                    dek: guide.dek,
                    readingTime: guide.readingTime,
                    areaLabel: guide.areaLabel,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  accent,
  onClick,
  children,
}: {
  active: boolean;
  accent?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={accent ? ({ "--area": accent } as React.CSSProperties) : undefined}
      className={[
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        active
          ? "border-[var(--area,var(--primary))] bg-[var(--area,var(--primary))] text-white"
          : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--area,var(--primary))] hover:text-[var(--text)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
