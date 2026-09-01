"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Search, X } from "@/design-system/Icon";

/**
 * The guides index.
 *
 * WHAT IT REPLACES
 *
 * Six bordered cards of the same colour carrying an area name, a
 * sentence and a count. You could not see a single article title from
 * the index of fifty four articles, there was nothing to distinguish
 * one area from another, and there was no way to look for anything.
 *
 * WHAT IT DOES
 *
 * Two views over the same set. At rest it is the shelf: one panel per
 * area, in the area's own colour and mark, showing real titles rather
 * than a count, so the index finally answers what is actually written
 * here. Type anything, or pick an area, and it becomes a result list
 * across all of them.
 *
 * Searching matches titles and summaries rather than full body text.
 * Full text would need the whole library in the client bundle, and
 * matching a word buried in paragraph nine produces results a reader
 * cannot see the relevance of.
 */

export interface ExplorerArea {
  slug: string;
  label: string;
  situation: string;
  /** Rendered server-side, so this client component never imports the content module. */
  mark: ReactNode;
  guides: { slug: string; title: string; readingTime: string }[];
}

export interface ExplorerGuide {
  slug: string;
  title: string;
  dek: string;
  readingTime: string;
  areaSlug: string;
  areaLabel: string;
}

/** How many titles a resting area panel shows before it becomes a link. */
const PREVIEW = 3;

export default function GuidesExplorer({
  areas,
  guides,
}: {
  areas: ExplorerArea[];
  guides: ExplorerGuide[];
}) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [areaSlug, setAreaSlug] = useState<string | null>(null);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return guides.filter((guide) => {
      if (areaSlug && guide.areaSlug !== areaSlug) return false;
      if (!needle) return true;
      return (
        guide.title.toLowerCase().includes(needle) || guide.dek.toLowerCase().includes(needle)
      );
    });
  }, [guides, query, areaSlug]);

  const filtering = query.trim().length > 0 || areaSlug !== null;

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
        {filtering
          ? `${results.length} guide${results.length === 1 ? "" : "s"} ${results.length === 1 ? "matches" : "match"}`
          : `Showing all ${areas.length} areas`}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        {filtering ? (
          <motion.div
            key="results"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            <p className="text-[13px] text-[var(--muted)]">
              {results.length === 0
                ? "Nothing matches that."
                : `${results.length} guide${results.length === 1 ? "" : "s"}`}
            </p>

            {results.length === 0 ? (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] px-5 py-10 text-center">
                <p className="text-[15px] text-[var(--muted)]">
                  Try a plainer word. These are filed by the situation somebody is in, so
                  &ldquo;passport&rdquo; and &ldquo;probate&rdquo; work better than a category name.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setAreaSlug(null);
                  }}
                  className="mt-4 text-[14px] font-semibold text-[var(--primary)] hover:underline"
                >
                  Show everything again
                </button>
              </div>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {results.map((guide) => (
                  <li key={guide.slug}>
                    <Link
                      href={`/guides/${guide.slug}`}
                      style={{ "--area": `var(--area-${guide.areaSlug})` } as React.CSSProperties}
                      className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 transition-colors hover:border-[var(--area)]"
                    >
                      <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[var(--area)]">
                        {guide.areaLabel}
                      </span>
                      <span className="mt-2 text-[16px] font-semibold leading-snug text-[var(--text)] group-hover:text-[var(--area)]">
                        {guide.title}
                      </span>
                      <span className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-[var(--muted)]">
                        {guide.dek}
                      </span>
                      <span className="mt-3 font-mono text-[11px] text-[var(--faint)]">
                        {guide.readingTime}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="shelf"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid gap-4 lg:grid-cols-2"
          >
            {areas.map((area) => (
              <section
                key={area.slug}
                style={
                  {
                    "--area": `var(--area-${area.slug})`,
                    "--area-soft": `var(--area-${area.slug}-soft)`,
                  } as React.CSSProperties
                }
                className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="flex items-start gap-4 bg-[var(--area-soft)] p-5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--area)]">
                      {area.label}
                    </p>
                    <p className="mt-2 text-[16px] font-medium leading-snug text-[var(--text)]">
                      {area.situation}
                    </p>
                  </div>
                  <div className="w-[76px] shrink-0 text-[var(--area)]">{area.mark}</div>
                </div>

                <ul className="flex flex-1 flex-col divide-y divide-[var(--border)] px-5">
                  {area.guides.slice(0, PREVIEW).map((guide) => (
                    <li key={guide.slug}>
                      <Link
                        href={`/guides/${guide.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-3"
                      >
                        <span className="text-[14.5px] leading-snug text-[var(--text)] group-hover:text-[var(--area)]">
                          {guide.title}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-[var(--faint)]">
                          {guide.readingTime}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/guides/${area.slug}`}
                  className="flex items-center justify-between gap-2 border-t border-[var(--border)] px-5 py-3.5 text-[13.5px] font-semibold text-[var(--area)] transition-colors hover:bg-[var(--area-soft)]"
                >
                  All {area.guides.length} in {area.label.toLowerCase()}
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </section>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
  children: ReactNode;
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
