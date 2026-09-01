"use client";

import { useEffect, useState } from "react";

/**
 * The section rail. It exists because this page is long and a reader
 * scanning it needs to know how much is left and where they are, which a
 * plain scroll does not tell them.
 *
 * Scroll position comes from IntersectionObserver rather than a scroll
 * listener, so the browser does the work off the main thread and the rail
 * cannot cause the jank it is meant to relieve. Hidden below xl: at that
 * width there is no room for a rail beside the column without squeezing
 * the reading measure, which matters more.
 */
export default function CaseStudyNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.intersectionRatio);
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of seen) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    // The wrapper is the grid item and stretches to the row's full height;
    // the sticky element has to be inside it. Sticky on the stretched item
    // itself has no room to travel, so the rail simply scrolled away.
    <div className="hidden xl:block">
    <nav aria-label="Case study sections" className="sticky top-28">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--faint)]">Contents</p>
      <ol className="mt-4 space-y-1.5">
        {sections.map((s, i) => {
          const isActive = s.id === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "flex gap-2.5 rounded-md py-1 text-[12.5px] leading-snug transition-colors duration-[var(--dur)]",
                  isActive ? "font-semibold text-[var(--text)]" : "text-[var(--faint)] hover:text-[var(--muted)]",
                ].join(" ")}
              >
                <span className="tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                <span>{s.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
    </div>
  );
}
