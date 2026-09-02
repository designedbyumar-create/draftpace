"use client";

import { useEffect, useState } from "react";

/**
 * A reading progress bar with the current section's name, fixed to the top
 * of the viewport.
 *
 * This replaced a sticky side rail. The rail needed the sections to live
 * inside one grid column, which meant giving up the full width section
 * backgrounds that separate the thesis and the assessment from the rest of
 * the page. On a piece this long the sense of progress matters more than a
 * list of links, and a bar costs no horizontal space at any width, so it
 * works on a phone as well as it does on a desktop.
 *
 * Section tracking uses IntersectionObserver so the browser does that work
 * off the main thread. Progress is read from scroll position, which does
 * need a listener, so it is passive and only writes state when the rounded
 * percentage actually changes.
 */
export default function CaseStudyNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const next = total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0;
      setProgress((current) => (Math.round(current) === Math.round(next) ? current : next));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        // Clearing this when nothing is in view is what stops the marker
        // hanging over the footer. Without it the last section stays the
        // active one forever, and on a phone the marker then floats on top
        // of the footer links for the rest of the page.
        setActive(bestRatio > 0 ? best : "");
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: [0, 0.2, 0.5, 1] }
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  const label = sections.find((s) => s.id === active)?.label;
  const index = sections.findIndex((s) => s.id === active);

  return (
    <>
      {/* The hairline sits above the site header, which is sticky at z-40
          and 65px tall, so progress stays visible at the very top edge on
          every screen size. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
        <div
          className="h-full origin-left bg-[var(--primary)] transition-[width] duration-150 ease-[var(--ease-out)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* The section marker floats at the bottom on a phone and sits under
          the header from sm up.

          It has to move. At the top on a narrow screen it landed directly
          on each section's own eyebrow, so the two pieces of text overlapped
          and neither could be read. The bottom is also where a thumb
          already is, which is the same reasoning the product shell's own
          mobile bar uses, and it takes the same safe-area padding so it
          clears a home indicator rather than hiding behind one. */}
      {label && (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),12px)] sm:bottom-auto sm:top-[73px] sm:pb-0"
        >
          <p className="pointer-events-auto max-w-full truncate rounded-full border border-[var(--border)] bg-[var(--surface)]/92 px-3.5 py-1.5 text-[11px] font-semibold text-[var(--muted)] shadow-[shadow:var(--shadow-soft)] backdrop-blur sm:py-1 sm:shadow-[shadow:var(--shadow-xs)]">
            <span className="tabular-nums text-[var(--faint)]">
              {String(index + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
            </span>
            <span className="mx-2 text-[var(--border-strong)]">|</span>
            {label}
          </p>
        </div>
      )}
    </>
  );
}
