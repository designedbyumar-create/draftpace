"use client";

import { useEffect, useState } from "react";

/**
 * A manual's contents, sticky beside it on desktop, tracking where the
 * reader actually is.
 *
 * This is the thing a Shop page has no reason to have and a manual can't
 * do without: a Shop page is read once, top to bottom, by somebody
 * deciding; a manual is returned to, opened at the part you need, and
 * scanned. So it gets a real index.
 *
 * Hidden below the xl breakpoint rather than reflowed — on a narrow
 * screen the whole page is barely longer than the index would be, and a
 * horizontal chip bar pinned to the top would cost more room than it
 * saves.
 */
export default function ManualContents({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(sections[0]?.id ?? null);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // rootMargin pulls the trigger line to roughly a third down the
    // viewport: without it the last short section can never become
    // active, because the page runs out of scroll before it reaches the
    // top of the window.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-10% 0px -70% 0px", threshold: 0 }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="In this manual" className="sticky top-24">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--faint)]">In this manual</p>
      <ul className="mt-3 space-y-1 border-l border-[var(--border)]">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`-ml-px block border-l-2 py-1.5 pl-3 text-[13px] transition-colors ${
                active === section.id
                  ? "border-[var(--primary)] font-semibold text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
